# -*- coding: utf-8 -*-
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Estatisticas gerais do dashboard"""
    from vehicles.models import Vehicle
    from conductors.models import Conductor
    from requests.models import DriverRequest, VehicleRequest
    from complaints.models import Complaint

    today = timezone.now()
    first_day_this_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)

    total_vehicles = Vehicle.objects.count()
    active_vehicles = Vehicle.objects.filter(is_active=True).count()
    vehicles_this_month = Vehicle.objects.filter(created_at__gte=first_day_this_month).count()
    vehicles_last_month = Vehicle.objects.filter(
        created_at__gte=first_day_last_month,
        created_at__lt=first_day_this_month
    ).count()

    vehicle_growth = 0
    if vehicles_last_month > 0:
        vehicle_growth = round(((vehicles_this_month - vehicles_last_month) / vehicles_last_month) * 100, 1)
    elif vehicles_this_month > 0:
        vehicle_growth = 100

    total_conductors = Conductor.objects.count()
    active_conductors = Conductor.objects.filter(is_active=True).count()
    conductors_this_month = Conductor.objects.filter(created_at__gte=first_day_this_month).count()
    conductors_last_month = Conductor.objects.filter(
        created_at__gte=first_day_last_month,
        created_at__lt=first_day_this_month
    ).count()

    conductor_growth = 0
    if conductors_last_month > 0:
        conductor_growth = round(((conductors_this_month - conductors_last_month) / conductors_last_month) * 100, 1)
    elif conductors_this_month > 0:
        conductor_growth = 100

    total_requests = DriverRequest.objects.count() + VehicleRequest.objects.count()
    approved_requests = (
        DriverRequest.objects.filter(status='aprovado').count() +
        VehicleRequest.objects.filter(status='aprovado').count()
    )
    pending_requests = (
        DriverRequest.objects.filter(status='em_analise').count() +
        VehicleRequest.objects.filter(status='em_analise').count()
    )
    rejected_requests = (
        DriverRequest.objects.filter(status='reprovado').count() +
        VehicleRequest.objects.filter(status='reprovado').count()
    )

    total_complaints = Complaint.objects.count()
    pending_complaints = Complaint.objects.filter(status='pendente').count()
    resolved_complaints = Complaint.objects.filter(status='resolvida').count()

    return Response({
        'vehicles': {
            'total': total_vehicles,
            'active': active_vehicles,
            'inactive': total_vehicles - active_vehicles,
            'growth_percentage': vehicle_growth
        },
        'conductors': {
            'total': total_conductors,
            'active': active_conductors,
            'inactive': total_conductors - active_conductors,
            'growth_percentage': conductor_growth
        },
        'requests': {
            'total': total_requests,
            'approved': approved_requests,
            'pending': pending_requests,
            'rejected': rejected_requests
        },
        'complaints': {
            'total': total_complaints,
            'pending': pending_complaints,
            'resolved': resolved_complaints,
            'investigating': total_complaints - pending_complaints - resolved_complaints
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_charts(request):
    """Dados para os graficos do dashboard"""
    from vehicles.models import Vehicle
    from conductors.models import Conductor
    from requests.models import DriverRequest, VehicleRequest

    today = timezone.now()

    active_count = Vehicle.objects.filter(is_active=True).count()
    inactive_count = Vehicle.objects.filter(is_active=False).count()

    vehicle_status = [
        {'name': 'Ativos', 'value': active_count, 'color': '#10b981'},
        {'name': 'Inativos', 'value': inactive_count, 'color': '#ef4444'},
    ]

    monthly_registrations = []
    month_names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    for i in range(5, -1, -1):
        month_date = today - timedelta(days=30 * i)
        first_day = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        if i > 0:
            next_month = today - timedelta(days=30 * (i - 1))
            last_day = next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            last_day = today

        vehicles_count = Vehicle.objects.filter(
            created_at__gte=first_day,
            created_at__lt=last_day
        ).count()

        conductors_count = Conductor.objects.filter(
            created_at__gte=first_day,
            created_at__lt=last_day
        ).count()

        monthly_registrations.append({
            'month': month_names[month_date.month - 1],
            'veiculos': vehicles_count,
            'condutores': conductors_count
        })

    categories = Vehicle.objects.values('category').annotate(quantidade=Count('id')).filter(quantidade__gt=0)
    total_vehicles = Vehicle.objects.count()
    category_distribution = []

    for cat in categories:
        percentage = round((cat['quantidade'] / total_vehicles * 100), 1) if total_vehicles > 0 else 0
        category_distribution.append({
            'category': cat['category'] or 'Nao especificado',
            'quantidade': cat['quantidade'],
            'percentage': percentage
        })

    if not category_distribution:
        default_categories = ['Van', 'Micro-onibus', 'Onibus', 'Executivo']
        category_distribution = [
            {'category': cat, 'quantidade': 0, 'percentage': 0}
            for cat in default_categories
        ]

    requests_by_month = []

    for i in range(5, -1, -1):
        month_date = today - timedelta(days=30 * i)
        first_day = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        if i > 0:
            next_month = today - timedelta(days=30 * (i - 1))
            last_day = next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            last_day = today

        approved = (
            DriverRequest.objects.filter(status='aprovado', created_at__gte=first_day, created_at__lt=last_day).count() +
            VehicleRequest.objects.filter(status='aprovado', created_at__gte=first_day, created_at__lt=last_day).count()
        )

        pending = (
            DriverRequest.objects.filter(status='em_analise', created_at__gte=first_day, created_at__lt=last_day).count() +
            VehicleRequest.objects.filter(status='em_analise', created_at__gte=first_day, created_at__lt=last_day).count()
        )

        rejected = (
            DriverRequest.objects.filter(status='reprovado', created_at__gte=first_day, created_at__lt=last_day).count() +
            VehicleRequest.objects.filter(status='reprovado', created_at__gte=first_day, created_at__lt=last_day).count()
        )

        requests_by_month.append({
            'month': month_names[month_date.month - 1],
            'aprovadas': approved,
            'pendentes': pending,
            'rejeitadas': rejected
        })

    total_vehicles = Vehicle.objects.count()
    active_vehicles = Vehicle.objects.filter(is_active=True).count()
    pontualidade = round((active_vehicles / total_vehicles * 100), 1) if total_vehicles > 0 else 0

    total_conductors = Conductor.objects.count()
    valid_license = Conductor.objects.filter(
        license_expiry_date__gte=timezone.now().date(),
        is_active=True
    ).count()
    seguranca = round((valid_license / total_conductors * 100), 1) if total_conductors > 0 else 0

    total_requests = DriverRequest.objects.count() + VehicleRequest.objects.count()
    approved_requests = (
        DriverRequest.objects.filter(status='aprovado').count() +
        VehicleRequest.objects.filter(status='aprovado').count()
    )
    satisfacao = round((approved_requests / total_requests * 100), 1) if total_requests > 0 else 0

    manutencao = 100 - round((inactive_count / total_vehicles * 100), 1) if total_vehicles > 0 else 0
    disponibilidade = pontualidade

    performance_metrics = [
        {'subject': 'Pontualidade', 'A': pontualidade, 'fullMark': 100},
        {'subject': 'Seguranca', 'A': seguranca, 'fullMark': 100},
        {'subject': 'Satisfacao', 'A': satisfacao, 'fullMark': 100},
        {'subject': 'Manutencao', 'A': manutencao, 'fullMark': 100},
        {'subject': 'Disponibilidade', 'A': disponibilidade, 'fullMark': 100},
    ]

    return Response({
        'vehicleStatus': vehicle_status,
        'monthlyRegistrations': monthly_registrations,
        'categoryDistribution': category_distribution,
        'requestsStatus': requests_by_month,
        'performanceMetrics': performance_metrics
    })
