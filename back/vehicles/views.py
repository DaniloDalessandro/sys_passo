from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes as drf_permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter, NumberFilter
from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleFilter(FilterSet):
    """Custom filter for Vehicle model with case-insensitive partial matching"""
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
    API endpoint that allows vehicles to be viewed or edited.
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
@drf_permission_classes([permissions.IsAuthenticated])
def vehicle_stats(request):
    """
    API endpoint que retorna estatísticas dos veículos.
    """
    try:
        current_year = timezone.now().year

        # Total de veículos
        total_vehicles = Vehicle.objects.count()

        # Veículos ativos
        active_vehicles = Vehicle.objects.filter(is_active=True).count()

        # Veículos inativos
        inactive_vehicles = total_vehicles - active_vehicles

        # Veículos com mais de 10 anos
        old_vehicles = Vehicle.objects.filter(
            year__lte=current_year - 10,
            is_active=True
        ).count()

        # Frota eletrificada (elétricos + híbridos)
        electric_vehicles = Vehicle.objects.filter(
            fuel_type__in=['electric', 'hybrid'],
            is_active=True
        ).count()

        # Estatísticas por categoria
        categories_stats = {}
        categories = ['Van', 'Caminhão', 'Ônibus', 'Carreta', 'Carro']
        for category in categories:
            count = Vehicle.objects.filter(
                category=category,
                is_active=True
            ).count()
            if count > 0:
                categories_stats[category] = count

        # Estatísticas por tipo de combustível
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
        return Response({
            'error': 'Falha ao obter estatísticas',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)