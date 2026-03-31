from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone

from core.exceptions import safe_error_response
from vehicles.models import Vehicle
from conductors.models import Conductor
from requests.models import DriverRequest
from complaints.models import Complaint


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Retorna estatísticas gerais do sistema."""
    try:
        thirty_days_ago = timezone.now() - timedelta(days=30)

        vehicle_stats = Vehicle.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(status='ativo')),
            inactive=Count('id', filter=Q(status='inativo')),
            last_month=Count('id', filter=Q(created_at__gte=thirty_days_ago)),
        )
        total_vehicles = vehicle_stats['total'] or 0
        vehicle_growth = round(
            (vehicle_stats['last_month'] / total_vehicles * 100) if total_vehicles > 0 else 0, 2
        )

        conductor_stats = Conductor.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(is_active=True)),
            inactive=Count('id', filter=Q(is_active=False)),
            last_month=Count('id', filter=Q(created_at__gte=thirty_days_ago)),
        )
        total_conductors = conductor_stats['total'] or 0
        conductor_growth = round(
            (conductor_stats['last_month'] / total_conductors * 100) if total_conductors > 0 else 0, 2
        )

        request_stats = DriverRequest.objects.aggregate(
            total=Count('id'),
            approved=Count('id', filter=Q(status='aprovado')),
            pending=Count('id', filter=Q(status='em_analise')),
            rejected=Count('id', filter=Q(status='reprovado')),
        )

        complaint_stats = Complaint.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='proposto')),
            resolved=Count('id', filter=Q(status='concluido')),
            investigating=Count('id', filter=Q(status='em_analise')),
        )

        data = {
            'vehicles': {
                'total': total_vehicles,
                'active': vehicle_stats['active'],
                'inactive': vehicle_stats['inactive'],
                'growth_percentage': vehicle_growth,
            },
            'conductors': {
                'total': total_conductors,
                'active': conductor_stats['active'],
                'inactive': conductor_stats['inactive'],
                'growth_percentage': conductor_growth,
            },
            'requests': {
                'total': request_stats['total'],
                'approved': request_stats['approved'],
                'pending': request_stats['pending'],
                'rejected': request_stats['rejected'],
            },
            'complaints': {
                'total': complaint_stats['total'],
                'pending': complaint_stats['pending'],
                'resolved': complaint_stats['resolved'],
                'investigating': complaint_stats['investigating'],
            },
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao obter estatísticas do dashboard',
            exception=e,
            context={'action': 'dashboard_stats'}
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_charts(request):
    """Retorna dados para os gráficos do dashboard."""
    try:
        vehicle_status = [
            {
                'name': 'Ativos',
                'value': Vehicle.objects.filter(status='ativo').count(),
                'color': '#10b981'
            },
            {
                'name': 'Inativos',
                'value': Vehicle.objects.filter(status='inativo').count(),
                'color': '#ef4444'
            }
        ]

        monthly_registrations = []
        for i in range(5, -1, -1):
            date = timezone.now() - relativedelta(months=i)
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i > 0:
                month_end = (timezone.now() - relativedelta(months=i-1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                month_end = timezone.now()

            vehicles_count = Vehicle.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()

            conductors_count = Conductor.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()

            monthly_registrations.append({
                'month': date.strftime('%b'),
                'veiculos': vehicles_count,
                'condutores': conductors_count
            })

        category_distribution = []
        categories = Vehicle.objects.values('category').annotate(count=Count('id'))
        total_vehicles = Vehicle.objects.count()

        for cat in categories:
            if cat['category']:
                percentage = (cat['count'] / total_vehicles * 100) if total_vehicles > 0 else 0
                category_distribution.append({
                    'category': cat['category'].title(),
                    'quantidade': cat['count'],
                    'percentage': round(percentage, 1)
                })

        requests_status = []
        for i in range(5, -1, -1):
            date = timezone.now() - relativedelta(months=i)
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i > 0:
                month_end = (timezone.now() - relativedelta(months=i-1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                month_end = timezone.now()

            approved = DriverRequest.objects.filter(
                status='aprovado',
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()

            pending = DriverRequest.objects.filter(
                status='em_analise',
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()

            rejected = DriverRequest.objects.filter(
                status='reprovado',
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()

            requests_status.append({
                'month': date.strftime('%b'),
                'aprovadas': approved,
                'pendentes': pending,
                'rejeitadas': rejected
            })

        total_requests = DriverRequest.objects.count()
        approved = DriverRequest.objects.filter(status='aprovado').count()
        pending = DriverRequest.objects.filter(status='em_analise').count()

        approval_rate = (approved / total_requests * 100) if total_requests > 0 else 0
        pending_rate = (pending / total_requests * 100) if total_requests > 0 else 0

        total_complaints = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='concluido').count()
        resolution_rate = (resolved / total_complaints * 100) if total_complaints > 0 else 0

        performance_metrics = [
            {'subject': 'Aprovação', 'A': round(approval_rate, 1), 'fullMark': 100},
            {'subject': 'Pendências', 'A': round(pending_rate, 1), 'fullMark': 100},
            {'subject': 'Resolução', 'A': round(resolution_rate, 1), 'fullMark': 100},
            {'subject': 'Veículos Ativos', 'A': round((Vehicle.objects.filter(status='ativo').count() / Vehicle.objects.count() * 100) if Vehicle.objects.count() > 0 else 0, 1), 'fullMark': 100},
            {'subject': 'Condutores Ativos', 'A': round((Conductor.objects.filter(is_active=True).count() / Conductor.objects.count() * 100) if Conductor.objects.count() > 0 else 0, 1), 'fullMark': 100},
        ]

        data = {
            'vehicleStatus': vehicle_status,
            'monthlyRegistrations': monthly_registrations,
            'categoryDistribution': category_distribution,
            'requestsStatus': requests_status,
            'performanceMetrics': performance_metrics
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao obter dados de gráficos do dashboard',
            exception=e,
            context={'action': 'dashboard_charts'}
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_recent_activity(request):
    """Retorna as atividades recentes do sistema."""
    try:
        recent_requests = DriverRequest.objects.select_related('conductor').order_by('-created_at')[:10]
        recent_complaints = Complaint.objects.order_by('-created_at')[:10]

        activities = []

        for req in recent_requests:
            activities.append({
                'type': 'request',
                'id': req.id,
                'description': f"Nova solicitação de {req.conductor.name if req.conductor else 'Desconhecido'}",
                'status': req.status,
                'date': req.created_at.isoformat()
            })

        for complaint in recent_complaints:
            complaint_type_display = complaint.get_complaint_type_display()
            activities.append({
                'type': 'complaint',
                'id': complaint.id,
                'description': f"Denúncia: {complaint_type_display} - Placa {complaint.vehicle_plate}",
                'status': complaint.status,
                'date': complaint.created_at.isoformat()
            })

        activities.sort(key=lambda x: x['date'], reverse=True)

        return Response(activities[:20], status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao obter atividades recentes',
            exception=e,
            context={'action': 'dashboard_recent_activity'}
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_alerts(request):
    """Retorna alertas importantes do sistema."""
    try:
        alerts = []

        pending_requests = DriverRequest.objects.filter(status='em_analise').count()
        if pending_requests > 0:
            alerts.append({
                'type': 'warning',
                'title': 'Solicitações Pendentes',
                'message': f"Existem {pending_requests} solicitações aguardando análise",
                'count': pending_requests,
                'link': '/requests'
            })

        pending_complaints = Complaint.objects.filter(status__in=['proposto', 'em_analise']).count()
        if pending_complaints > 0:
            alerts.append({
                'type': 'error',
                'title': 'Denúncias Não Resolvidas',
                'message': f"{pending_complaints} denúncias precisam de atenção",
                'count': pending_complaints,
                'link': '/denuncias'
            })

        inactive_vehicles = Vehicle.objects.filter(status='inativo').count()
        if inactive_vehicles > 10:
            alerts.append({
                'type': 'info',
                'title': 'Veículos Inativos',
                'message': f"{inactive_vehicles} veículos estão inativos",
                'count': inactive_vehicles,
                'link': '/vehicles'
            })

        inactive_conductors = Conductor.objects.filter(is_active=False).count()
        if inactive_conductors > 10:
            alerts.append({
                'type': 'info',
                'title': 'Condutores Inativos',
                'message': f"{inactive_conductors} condutores estão inativos",
                'count': inactive_conductors,
                'link': '/conductors'
            })

        return Response(alerts, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao obter alertas do sistema',
            exception=e,
            context={'action': 'dashboard_alerts'}
        )
