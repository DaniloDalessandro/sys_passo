from rest_framework import status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Conductor
from .serializers import (
    ConductorSerializer,
    ConductorCreateSerializer, 
    ConductorUpdateSerializer,
    ConductorListSerializer
)
from authentication.utils import get_client_ip, get_user_agent, log_user_activity


class ConductorListCreateView(ListCreateAPIView):
    queryset = Conductor.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'license_category']
    search_fields = ['name', 'cpf', 'email', 'license_number']
    ordering_fields = ['name', 'created_at', 'license_expiry_date']
    ordering = ['name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConductorCreateSerializer
        return ConductorListSerializer

    def perform_create(self, serializer):
        conductor = serializer.save(created_by=self.request.user)
        
        log_user_activity(
            user=self.request.user,
            action='conductor_create',
            ip_address=get_client_ip(self.request),
            details={
                'conductor_id': conductor.id,
                'conductor_name': conductor.name,
                'user_agent': get_user_agent(self.request)
            }
        )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'error': 'Falha ao criar condutor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConductorDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Conductor.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ConductorUpdateSerializer
        return ConductorSerializer

    def perform_update(self, serializer):
        conductor = serializer.save(updated_by=self.request.user)
        
        log_user_activity(
            user=self.request.user,
            action='conductor_update',
            ip_address=get_client_ip(self.request),
            details={
                'conductor_id': conductor.id,
                'conductor_name': conductor.name,
                'updated_fields': list(self.request.data.keys()),
                'user_agent': get_user_agent(self.request)
            }
        )

    def perform_destroy(self, instance):
        log_user_activity(
            user=self.request.user,
            action='conductor_delete',
            ip_address=get_client_ip(self.request),
            details={
                'conductor_id': instance.id,
                'conductor_name': instance.name,
                'user_agent': get_user_agent(self.request)
            }
        )
        instance.delete()

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'error': 'Falha ao atualizar condutor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'error': 'Falha ao deletar condutor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conductor_search(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({
            'error': 'Parâmetro de busca "q" é obrigatório'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        conductors = Conductor.objects.filter(
            Q(name__icontains=query) |
            Q(cpf__icontains=query) |
            Q(email__icontains=query) |
            Q(license_number__icontains=query)
        ).filter(is_active=True)[:10]  # Limita a 10 resultados

        serializer = ConductorListSerializer(conductors, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Falha na busca',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conductor_stats(request):
    try:
        from django.utils import timezone
        
        total_conductors = Conductor.objects.count()
        active_conductors = Conductor.objects.filter(is_active=True).count()
        inactive_conductors = total_conductors - active_conductors
        
        # Condutores com CNH próxima ao vencimento (30 dias)
        thirty_days_from_now = timezone.now().date() + timezone.timedelta(days=30)
        expiring_soon = Conductor.objects.filter(
            license_expiry_date__lte=thirty_days_from_now,
            license_expiry_date__gte=timezone.now().date(),
            is_active=True
        ).count()
        
        # Condutores com CNH vencida
        expired_licenses = Conductor.objects.filter(
            license_expiry_date__lt=timezone.now().date(),
            is_active=True
        ).count()

        # Estatísticas por categoria de CNH
        categories_stats = {}
        categories = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']
        for category in categories:
            count = Conductor.objects.filter(
                license_category=category,
                is_active=True
            ).count()
            if count > 0:
                categories_stats[category] = count

        return Response({
            'total_conductors': total_conductors,
            'active_conductors': active_conductors,
            'inactive_conductors': inactive_conductors,
            'expiring_soon': expiring_soon,
            'expired_licenses': expired_licenses,
            'categories_stats': categories_stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Falha ao obter estatísticas',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_deactivate_conductors(request):
    try:
        conductor_ids = request.data.get('conductor_ids', [])
        if not conductor_ids:
            return Response({
                'error': 'Lista de IDs de condutores é obrigatória'
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_count = Conductor.objects.filter(
            id__in=conductor_ids
        ).update(is_active=False)

        log_user_activity(
            user=request.user,
            action='conductors_bulk_deactivate',
            ip_address=get_client_ip(request),
            details={
                'conductor_ids': conductor_ids,
                'updated_count': updated_count,
                'user_agent': get_user_agent(request)
            }
        )

        return Response({
            'message': f'{updated_count} condutores foram desativados com sucesso',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': 'Falha na desativação em massa',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)