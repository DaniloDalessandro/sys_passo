from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter, NumberFilter
from core.throttling import PublicReadThrottle
from core.exceptions import safe_error_response
from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleFilter(FilterSet):
    """Filtro customizado para o model Vehicle com busca parcial case-insensitive."""
    placa = CharFilter(field_name='plate', lookup_expr='icontains')
    marca = CharFilter(field_name='brand', lookup_expr='icontains')
    modelo = CharFilter(field_name='model', lookup_expr='icontains')
    ano = NumberFilter(field_name='year', lookup_expr='exact')
    cor = CharFilter(field_name='color', lookup_expr='icontains')
    chassi = CharFilter(field_name='chassis', lookup_expr='icontains')
    renavam = CharFilter(field_name='renavam', lookup_expr='icontains')
    categoria = CharFilter(field_name='category', lookup_expr='icontains')
    combustivel = CharFilter(field_name='fuel_type', lookup_expr='icontains')
    capacidade = NumberFilter(field_name='capacity', lookup_expr='exact')
    status = CharFilter(field_name='status', lookup_expr='iexact')
    created_by_username = CharFilter(field_name='created_by__username', lookup_expr='icontains')
    updated_by_username = CharFilter(field_name='updated_by__username', lookup_expr='icontains')

    class Meta:
        model = Vehicle
        fields = [
            'placa', 'marca', 'modelo', 'ano', 'cor', 'chassi', 'renavam',
            'categoria', 'combustivel', 'capacidade', 'status',
            'created_by_username', 'updated_by_username'
        ]


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar veículos.
    """
    queryset = Vehicle.objects.select_related('created_by', 'updated_by').order_by('-created_at')
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['plate', 'brand', 'model', 'chassis', 'renavam']
    ordering_fields = ['plate', 'brand', 'model', 'year', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vehicle_stats(request):
    """
    Retorna estatísticas dos veículos.
    """
    try:
        current_year = timezone.now().year

        total_vehicles = Vehicle.objects.count()
        active_vehicles = Vehicle.objects.filter(is_active=True).count()
        inactive_vehicles = total_vehicles - active_vehicles

        old_vehicles = Vehicle.objects.filter(
            year__lte=current_year - 10,
            is_active=True
        ).count()

        electric_vehicles = Vehicle.objects.filter(
            fuel_type__in=['electric', 'hybrid'],
            is_active=True
        ).count()

        categories_stats = {}
        categories = ['Van', 'Caminhão', 'Ônibus', 'Carreta', 'Carro']
        for category in categories:
            count = Vehicle.objects.filter(
                category=category,
                is_active=True
            ).count()
            if count > 0:
                categories_stats[category] = count

        fuel_type_stats = {}
        fuel_types = ['gasoline', 'ethanol', 'diesel', 'flex', 'electric', 'hybrid']
        for fuel_type in fuel_types:
            count = Vehicle.objects.filter(
                fuel_type=fuel_type,
                is_active=True
            ).count()
            if count > 0:
                fuel_type_stats[fuel_type] = count

        return Response({
            'total_vehicles': total_vehicles,
            'active_vehicles': active_vehicles,
            'inactive_vehicles': inactive_vehicles,
            'old_vehicles': old_vehicles,
            'electric_vehicles': electric_vehicles,
            'categories_stats': categories_stats,
            'fuel_type_stats': fuel_type_stats
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao obter estatísticas de veículos',
            exception=e,
            context={'action': 'vehicle_stats'}
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicReadThrottle])
def search_vehicles_by_plate(request):
    """
    Busca veículos por placa para autocomplete. Retorna apenas dados básicos.
    """
    search_query = request.GET.get('search', '').strip().upper()

    if not search_query or len(search_query) < 2:
        return Response([], status=status.HTTP_200_OK)

    try:
        vehicles = Vehicle.objects.filter(
            plate__icontains=search_query,
            is_active=True
        ).values('plate', 'brand', 'model', 'color')[:10]

        return Response(list(vehicles), status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Erro ao buscar veículos',
            exception=e,
            context={'action': 'search_vehicles_by_plate', 'query': search_query}
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicReadThrottle])
def get_vehicle_by_plate(request, plate):
    """
    Retorna dados completos de um veículo por placa, incluindo o condutor ativo vinculado.
    """
    try:
        plate = plate.strip().upper()

        vehicle = Vehicle.objects.filter(
            plate__iexact=plate,
            is_active=True
        ).prefetch_related('conductors').first()

        if not vehicle:
            return Response({
                'error': 'Veículo não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        vehicle_data = {
            'plate': vehicle.plate,
            'brand': vehicle.brand,
            'model': vehicle.model,
            'year': vehicle.year,
            'color': vehicle.color,
            'fuel_type': vehicle.fuel_type,
            'category': vehicle.category,
            'passenger_capacity': vehicle.passenger_capacity,
            'chassis_number': vehicle.chassis_number,
            'renavam': vehicle.renavam,
        }

        photos = []
        for i in range(1, 6):
            photo_field = getattr(vehicle, f'photo_{i}', None)
            if photo_field and photo_field.name:
                photos.append({
                    'id': i,
                    'url': request.build_absolute_uri(photo_field.url),
                })
        vehicle_data['photos'] = photos

        current_conductor = vehicle.conductors.filter(is_active=True).first()

        if current_conductor:
            vehicle_data['current_conductor'] = {
                'full_name': current_conductor.name,
                'cpf': current_conductor.cpf,
                'cnh_number': current_conductor.license_number,
                'cnh_category': current_conductor.license_category,
                'phone': current_conductor.phone,
                'email': current_conductor.email,
            }
        else:
            vehicle_data['current_conductor'] = None

        return Response(vehicle_data, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Erro ao buscar veículo por placa',
            exception=e,
            context={'action': 'get_vehicle_by_plate', 'plate': plate}
        )