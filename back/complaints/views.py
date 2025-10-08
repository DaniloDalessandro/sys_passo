from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from .models import Complaint
from .serializers import (
    ComplaintCreateSerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintUpdateSerializer,
    ComplaintStatusUpdateSerializer,
    ComplaintPriorityUpdateSerializer,
)
from vehicles.models import Vehicle


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar denúncias.

    Fornece endpoints CRUD completos para denúncias, com diferentes níveis
    de permissão:
    - Create: Público (qualquer pessoa pode fazer uma denúncia)
    - List/Retrieve/Update/Delete: Autenticado (apenas administradores)

    Endpoints:
    - POST /api/complaints/ - Criar denúncia (público)
    - GET /api/complaints/ - Listar denúncias (autenticado)
    - GET /api/complaints/{id}/ - Detalhar denúncia (autenticado)
    - PATCH /api/complaints/{id}/ - Atualizar denúncia (autenticado)
    - DELETE /api/complaints/{id}/ - Deletar denúncia (autenticado)
    - POST /api/complaints/{id}/change_status/ - Alterar status (autenticado)
    - POST /api/complaints/{id}/change_priority/ - Alterar prioridade (autenticado)
    """

    queryset = Complaint.objects.select_related('vehicle', 'reviewed_by').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'complaint_type', 'is_anonymous']
    search_fields = ['vehicle_plate', 'description', 'complainant_name', 'occurrence_location']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """
        Retorna o serializer apropriado baseado na action.

        Returns:
            Serializer class: Classe do serializer adequado
        """
        if self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action == 'retrieve':
            return ComplaintDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return ComplaintUpdateSerializer
        return ComplaintListSerializer

    def get_permissions(self):
        """
        Retorna as permissões apropriadas baseado na action.

        Create é público (qualquer pessoa pode denunciar).
        Demais actions requerem autenticação.

        Returns:
            list: Lista de instâncias de permissões
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Customiza queryset com filtros adicionais via query params.

        Suporta filtros por:
        - status: Status da denúncia
        - priority: Prioridade da denúncia
        - complaint_type: Tipo de denúncia
        - search: Busca em placa, descrição, nome do denunciante
        - date_from: Denúncias a partir de uma data
        - date_to: Denúncias até uma data
        - vehicle_id: Denúncias de um veículo específico

        Returns:
            QuerySet: Queryset filtrado
        """
        queryset = super().get_queryset()

        # Filtro por data de criação (from)
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        # Filtro por data de criação (to)
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        # Filtro por veículo específico
        vehicle_id = self.request.query_params.get('vehicle_id', None)
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)

        # Filtro por placa específica
        plate = self.request.query_params.get('plate', None)
        if plate:
            queryset = queryset.filter(vehicle_plate__icontains=plate)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Cria uma nova denúncia.

        Endpoint público - não requer autenticação.
        Automaticamente tenta associar veículo pela placa.

        Returns:
            Response: Dados da denúncia criada
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            {
                'message': 'Denúncia registrada com sucesso. Em breve nossa equipe irá analisá-la.',
                'complaint': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_status(self, request, pk=None):
        """
        Altera o status de uma denúncia.

        Endpoint para mudança rápida de status. Automaticamente registra
        o usuário que fez a alteração e o timestamp.

        Args:
            request: Request com novo status
            pk: ID da denúncia

        Returns:
            Response: Dados atualizados da denúncia
        """
        complaint = self.get_object()
        serializer = ComplaintStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        # Atualizar status e informações de revisão
        complaint.status = new_status
        complaint.reviewed_by = request.user
        complaint.reviewed_at = timezone.now()
        complaint.save()

        # Retornar denúncia atualizada
        detail_serializer = ComplaintDetailSerializer(complaint)
        return Response(detail_serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_priority(self, request, pk=None):
        """
        Altera a prioridade de uma denúncia.

        Endpoint para mudança rápida de prioridade.

        Args:
            request: Request com nova prioridade
            pk: ID da denúncia

        Returns:
            Response: Dados atualizados da denúncia
        """
        complaint = self.get_object()
        serializer = ComplaintPriorityUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_priority = serializer.validated_data['priority']

        # Atualizar prioridade
        complaint.priority = new_priority
        complaint.save()

        # Retornar denúncia atualizada
        detail_serializer = ComplaintDetailSerializer(complaint)
        return Response(detail_serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        """
        Retorna estatísticas sobre as denúncias.

        Fornece um resumo quantitativo das denúncias agrupadas por:
        - Status
        - Prioridade
        - Tipo de denúncia

        Returns:
            Response: Dicionário com estatísticas
        """
        # Total de denúncias
        total = Complaint.objects.count()

        # Denúncias por status
        by_status = dict(
            Complaint.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )

        # Denúncias por prioridade
        by_priority = dict(
            Complaint.objects.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )

        # Denúncias por tipo
        by_type = dict(
            Complaint.objects.values('complaint_type')
            .annotate(count=Count('id'))
            .values_list('complaint_type', 'count')
        )

        # Denúncias anônimas vs identificadas
        anonymous_count = Complaint.objects.filter(is_anonymous=True).count()
        identified_count = Complaint.objects.filter(is_anonymous=False).count()

        # Denúncias recentes (últimos 7 dias)
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        recent_count = Complaint.objects.filter(created_at__gte=week_ago).count()

        return Response({
            'total': total,
            'by_status': by_status,
            'by_priority': by_priority,
            'by_type': by_type,
            'anonymous_count': anonymous_count,
            'identified_count': identified_count,
            'recent_count': recent_count,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_as_resolved(self, request, pk=None):
        """
        Marca uma denúncia como resolvida.

        Atalho para alterar status para 'resolvida' e adicionar notas de resolução.

        Args:
            request: Request com notas de resolução (opcional)
            pk: ID da denúncia

        Returns:
            Response: Dados atualizados da denúncia
        """
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
    """
    Endpoint para autocomplete de placas de veículos.

    Endpoint público para auxiliar usuários a encontrar placas de veículos
    cadastrados no sistema ao fazer uma denúncia.

    Query Params:
        q: String de busca (mínimo 2 caracteres)

    Returns:
        Response: Lista de veículos que correspondem à busca
    """
    query = request.query_params.get('q', '')

    if len(query) < 2:
        return Response([])

    # Buscar veículos por placa, marca ou modelo
    vehicles = Vehicle.objects.filter(
        Q(plate__icontains=query) |
        Q(brand__icontains=query) |
        Q(model__icontains=query)
    ).values('id', 'plate', 'brand', 'model', 'year', 'color')[:10]

    # Formatar resultados para autocomplete
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
    """
    Retorna lista de tipos de denúncia disponíveis.

    Endpoint público para obter os tipos de denúncia aceitos pelo sistema.

    Returns:
        Response: Lista de tipos com chave e label
    """
    types = [
        {'value': key, 'label': label}
        for key, label in Complaint.TYPE_CHOICES
    ]

    return Response(types)
