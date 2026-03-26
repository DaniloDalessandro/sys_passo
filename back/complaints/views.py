from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from core.throttling import PublicWriteThrottle
from .models import Complaint, ComplaintPhoto
from .serializers import (
    ComplaintCreateSerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintUpdateSerializer,
    ComplaintStatusUpdateSerializer,
    ComplaintPhotoSerializer,
)
from vehicles.models import Vehicle


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar denúncias.

    Create é público; demais ações requerem autenticação.
    """

    queryset = Complaint.objects.select_related('vehicle', 'reviewed_by').prefetch_related('photos').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'complaint_type', 'is_anonymous']
    search_fields = ['vehicle_plate', 'description', 'complainant_name', 'occurrence_location']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Retorna o serializer adequado para cada action."""
        if self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action == 'retrieve':
            return ComplaintDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return ComplaintUpdateSerializer
        return ComplaintListSerializer

    def get_permissions(self):
        """Create é público; demais actions requerem autenticação."""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_throttles(self):
        """Aplica throttle apenas na criação para evitar spam de denúncias."""
        if self.action == 'create':
            return [PublicWriteThrottle()]
        return []

    def get_queryset(self):
        """Aplica filtros adicionais via query params (date_from, date_to, vehicle_id, plate)."""
        queryset = super().get_queryset()

        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        vehicle_id = self.request.query_params.get('vehicle_id', None)
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)

        plate = self.request.query_params.get('plate', None)
        if plate:
            queryset = queryset.filter(vehicle_plate__icontains=plate)

        return queryset

    def create(self, request, *args, **kwargs):
        """Cria uma nova denúncia. Suporta upload de até 5 fotos."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()

        photos = request.FILES.getlist('photos')
        if photos:
            if len(photos) > 5:
                return Response(
                    {'error': 'Máximo de 5 fotos permitidas por denúncia.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for index, photo in enumerate(photos):
                ComplaintPhoto.objects.create(
                    complaint=complaint,
                    photo=photo,
                    order=index
                )

        headers = self.get_success_headers(serializer.data)

        complaint.refresh_from_db()
        detail_serializer = ComplaintDetailSerializer(complaint)

        return Response(
            {
                'message': 'Denúncia registrada com sucesso. Em breve nossa equipe irá analisá-la.',
                'complaint': detail_serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_status(self, request, pk=None):
        """Altera o status de uma denúncia e registra o revisor."""
        complaint = self.get_object()
        serializer = ComplaintStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        complaint.status = new_status
        complaint.reviewed_by = request.user
        complaint.reviewed_at = timezone.now()
        complaint.save()

        detail_serializer = ComplaintDetailSerializer(complaint)
        return Response(detail_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_priority(self, request, pk=None):
        """Altera a prioridade de uma denúncia."""
        complaint = self.get_object()

        priority = request.data.get('priority')
        if not priority:
            return Response(
                {'error': 'O campo priority é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_priorities = ['baixa', 'media', 'alta', 'urgente']
        if priority not in valid_priorities:
            return Response(
                {'error': f'Prioridade inválida. Valores permitidos: {", ".join(valid_priorities)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        complaint.priority = priority
        complaint.save()

        detail_serializer = ComplaintDetailSerializer(complaint)
        return Response(detail_serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        """Retorna estatísticas das denúncias agrupadas por status, tipo e anonimato."""
        from datetime import timedelta

        total = Complaint.objects.count()

        by_status = dict(
            Complaint.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )

        by_type = dict(
            Complaint.objects.values('complaint_type')
            .annotate(count=Count('id'))
            .values_list('complaint_type', 'count')
        )

        anonymous_count = Complaint.objects.filter(is_anonymous=True).count()
        identified_count = Complaint.objects.filter(is_anonymous=False).count()

        week_ago = timezone.now() - timedelta(days=7)
        recent_count = Complaint.objects.filter(created_at__gte=week_ago).count()

        return Response({
            'total': total,
            'by_status': by_status,
            'by_type': by_type,
            'anonymous_count': anonymous_count,
            'identified_count': identified_count,
            'recent_count': recent_count,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_as_resolved(self, request, pk=None):
        """Marca uma denúncia como resolvida, com notas de resolução opcionais."""
        complaint = self.get_object()

        resolution_notes = request.data.get('resolution_notes', '')

        complaint.status = 'resolvida'
        complaint.reviewed_by = request.user
        complaint.reviewed_at = timezone.now()

        if resolution_notes:
            complaint.resolution_notes = resolution_notes

        complaint.save()

        detail_serializer = ComplaintDetailSerializer(complaint)
        return Response(detail_serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_autocomplete(request):
    """Autocomplete público de placas de veículos cadastrados."""
    query = request.query_params.get('q', '')

    if len(query) < 2:
        return Response([])

    vehicles = Vehicle.objects.filter(
        Q(plate__icontains=query) |
        Q(brand__icontains=query) |
        Q(model__icontains=query)
    ).values('id', 'plate', 'brand', 'model', 'year', 'color')[:10]

    results = [
        {
            'id': v['id'],
            'plate': v['plate'],
            'label': f"{v['plate']} - {v['brand']} {v['model']} ({v['year']})",
            'brand': v['brand'],
            'model': v['model'],
            'year': v['year'],
            'color': v['color'],
        }
        for v in vehicles
    ]

    return Response(results)


@api_view(['GET'])
@permission_classes([AllowAny])
def complaint_types(request):
    """Retorna a lista de tipos de denúncia disponíveis."""
    types = [
        {'value': key, 'label': label}
        for key, label in Complaint.TYPE_CHOICES
    ]

    return Response(types)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_complaint_by_protocol(request):
    """
    Consulta pública de denúncia pelo número de protocolo.
    Retorna apenas dados básicos, sem expor informações do denunciante.
    """
    protocol = request.query_params.get('protocol', '').strip()

    if not protocol:
        return Response(
            {'error': 'O número do protocolo é obrigatório.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    protocol = protocol.upper().replace(' ', '').replace('-', '')

    try:
        complaint = Complaint.objects.select_related('vehicle').get(protocol=protocol)
    except Complaint.DoesNotExist:
        return Response(
            {
                'error': 'Protocolo não encontrado.',
                'message': 'Não foi possível localizar uma denúncia com o protocolo informado. Verifique se o número está correto.',
                'protocol_searched': protocol
            },
            status=status.HTTP_404_NOT_FOUND
        )

    data = {
        'protocol': complaint.protocol,
        'status': complaint.status,
        'status_display': complaint.get_status_display(),
        'complaint_type': complaint.complaint_type,
        'complaint_type_display': complaint.get_complaint_type_display(),
        'vehicle_plate': complaint.vehicle_plate,
        'occurrence_date': complaint.occurrence_date,
        'occurrence_location': complaint.occurrence_location,
        'created_at': complaint.created_at,
        'updated_at': complaint.updated_at,
    }

    if complaint.vehicle:
        data['vehicle'] = {
            'brand': complaint.vehicle.brand,
            'model': complaint.vehicle.model,
            'year': complaint.vehicle.year,
            'color': complaint.vehicle.color,
        }

    return Response(data)
