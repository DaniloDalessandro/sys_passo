from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import logging

from .models import DriverRequest, VehicleRequest
from .serializers import (
    DriverRequestCreateSerializer,
    DriverRequestListSerializer,
    DriverRequestActionSerializer,
    VehicleRequestCreateSerializer,
    VehicleRequestListSerializer,
    VehicleRequestActionSerializer,
)
from conductors.models import Conductor
from vehicles.models import Vehicle

logger = logging.getLogger(__name__)


class DriverRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar solicitações de cadastro de motoristas.

    Endpoints:
    - POST /api/requests/drivers/ - Criar solicitação (público)
    - GET /api/requests/drivers/ - Listar solicitações (autenticado)
    - GET /api/requests/drivers/{id}/ - Detalhar solicitação (autenticado)
    - POST /api/requests/drivers/{id}/approve/ - Aprovar solicitação (autenticado)
    - POST /api/requests/drivers/{id}/reject/ - Reprovar solicitação (autenticado)

    Filtros disponíveis:
    - status (exact)
    - created_at (gte, lte)
    - search (full_name, cpf)
    """

    queryset = DriverRequest.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'created_at': ['gte', 'lte'],
    }
    search_fields = ['full_name', 'cpf', 'email']
    ordering_fields = ['created_at', 'status', 'full_name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'create':
            return DriverRequestCreateSerializer
        elif self.action in ['approve', 'reject']:
            return DriverRequestActionSerializer
        return DriverRequestListSerializer

    def get_permissions(self):
        """
        Define permissões baseadas na ação.

        - create: AllowAny (para site público)
        - Demais ações: IsAuthenticated
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        Cria uma nova solicitação de motorista.

        Endpoint público para receber solicitações do site.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
            logger.info(f"Solicitação de motorista criada: ID {instance.id}, CPF {instance.cpf}")

            return Response(
                {
                    'message': 'Solicitação enviada com sucesso! Aguarde a análise.',
                    'data': DriverRequestListSerializer(instance).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Erro ao criar solicitação de motorista: {str(e)}")
            return Response(
                {'error': 'Erro ao processar solicitação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """
        Aprova uma solicitação de motorista e cria o condutor.

        Processo:
        1. Valida se a solicitação está em análise
        2. Cria o condutor com os dados da solicitação
        3. Atualiza status da solicitação para 'aprovado'
        4. Registra usuário revisor e data de revisão
        """
        driver_request = self.get_object()

        # Verificar se a solicitação está em análise
        if driver_request.status != 'em_analise':
            return Response(
                {'error': f'Esta solicitação já foi {driver_request.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se já existe um condutor com este CPF
        if Conductor.objects.filter(cpf=driver_request.cpf).exists():
            return Response(
                {'error': 'Já existe um condutor cadastrado com este CPF.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Usar transação atômica para garantir consistência
        try:
            with transaction.atomic():
                # Criar o condutor com dados básicos da solicitação
                conductor = Conductor.objects.create(
                    name=driver_request.full_name,
                    cpf=driver_request.cpf,
                    email=driver_request.email,
                    phone=driver_request.phone,
                    license_number=driver_request.cnh_number,
                    license_category=driver_request.cnh_category,
                    is_active=True,
                    created_by=request.user,
                    # Campos obrigatórios com valores padrão (devem ser atualizados depois)
                    birth_date=timezone.now().date(),  # Deve ser atualizado
                    license_expiry_date=timezone.now().date(),  # Deve ser atualizado
                    street='',
                    number='',
                    neighborhood='',
                    city='',
                )

                # Atualizar a solicitação
                driver_request.status = 'aprovado'
                driver_request.reviewed_at = timezone.now()
                driver_request.reviewed_by = request.user
                driver_request.conductor = conductor
                driver_request.save()

                logger.info(
                    f"Solicitação de motorista aprovada: ID {driver_request.id}, "
                    f"Condutor criado: ID {conductor.id}, "
                    f"Aprovado por: {request.user.username}"
                )

                return Response(
                    {
                        'message': 'Solicitação aprovada com sucesso! Condutor criado.',
                        'data': DriverRequestListSerializer(driver_request).data
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            logger.error(f"Erro ao aprovar solicitação de motorista: {str(e)}")
            return Response(
                {'error': 'Erro ao processar aprovação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """
        Reprova uma solicitação de motorista.

        Processo:
        1. Valida se a solicitação está em análise
        2. Valida se o motivo da reprovação foi informado
        3. Atualiza status da solicitação para 'reprovado'
        4. Registra motivo, usuário revisor e data de revisão
        """
        driver_request = self.get_object()

        # Verificar se a solicitação está em análise
        if driver_request.status != 'em_analise':
            return Response(
                {'error': f'Esta solicitação já foi {driver_request.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar dados da reprovação
        serializer = DriverRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Atualizar a solicitação
            driver_request.status = 'reprovado'
            driver_request.rejection_reason = serializer.validated_data.get('rejection_reason')
            driver_request.reviewed_at = timezone.now()
            driver_request.reviewed_by = request.user
            driver_request.save()

            logger.info(
                f"Solicitação de motorista reprovada: ID {driver_request.id}, "
                f"Reprovado por: {request.user.username}"
            )

            return Response(
                {
                    'message': 'Solicitação reprovada com sucesso.',
                    'data': DriverRequestListSerializer(driver_request).data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Erro ao reprovar solicitação de motorista: {str(e)}")
            return Response(
                {'error': 'Erro ao processar reprovação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VehicleRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar solicitações de cadastro de veículos.

    Endpoints:
    - POST /api/requests/vehicles/ - Criar solicitação (público)
    - GET /api/requests/vehicles/ - Listar solicitações (autenticado)
    - GET /api/requests/vehicles/{id}/ - Detalhar solicitação (autenticado)
    - POST /api/requests/vehicles/{id}/approve/ - Aprovar solicitação (autenticado)
    - POST /api/requests/vehicles/{id}/reject/ - Reprovar solicitação (autenticado)

    Filtros disponíveis:
    - status (exact)
    - created_at (gte, lte)
    - search (plate, brand, model)
    """

    queryset = VehicleRequest.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'created_at': ['gte', 'lte'],
    }
    search_fields = ['plate', 'brand', 'model']
    ordering_fields = ['created_at', 'status', 'plate']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'create':
            return VehicleRequestCreateSerializer
        elif self.action in ['approve', 'reject']:
            return VehicleRequestActionSerializer
        return VehicleRequestListSerializer

    def get_permissions(self):
        """
        Define permissões baseadas na ação.

        - create: AllowAny (para site público)
        - Demais ações: IsAuthenticated
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        Cria uma nova solicitação de veículo.

        Endpoint público para receber solicitações do site.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instance = serializer.save()
            logger.info(f"Solicitação de veículo criada: ID {instance.id}, Placa {instance.plate}")

            return Response(
                {
                    'message': 'Solicitação enviada com sucesso! Aguarde a análise.',
                    'data': VehicleRequestListSerializer(instance).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Erro ao criar solicitação de veículo: {str(e)}")
            return Response(
                {'error': 'Erro ao processar solicitação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """
        Aprova uma solicitação de veículo e cria o veículo.

        Processo:
        1. Valida se a solicitação está em análise
        2. Cria o veículo com os dados da solicitação
        3. Atualiza status da solicitação para 'aprovado'
        4. Registra usuário revisor e data de revisão
        """
        vehicle_request = self.get_object()

        # Verificar se a solicitação está em análise
        if vehicle_request.status != 'em_analise':
            return Response(
                {'error': f'Esta solicitação já foi {vehicle_request.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se já existe um veículo com esta placa
        if Vehicle.objects.filter(plate=vehicle_request.plate).exists():
            return Response(
                {'error': 'Já existe um veículo cadastrado com esta placa.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Usar transação atômica para garantir consistência
        try:
            with transaction.atomic():
                # Criar o veículo com dados da solicitação
                vehicle = Vehicle.objects.create(
                    plate=vehicle_request.plate,
                    brand=vehicle_request.brand,
                    model=vehicle_request.model,
                    year=vehicle_request.year,
                    color=vehicle_request.color,
                    fuel_type=vehicle_request.fuel_type,
                    is_active=True,
                    created_by=request.user,
                    # Campos obrigatórios com valores padrão (devem ser atualizados depois)
                    chassis_number=f'TEMP_{vehicle_request.plate}',  # Deve ser atualizado
                    renavam=f'TEMP_{vehicle_request.plate}',  # Deve ser atualizado
                )

                # Atualizar a solicitação
                vehicle_request.status = 'aprovado'
                vehicle_request.reviewed_at = timezone.now()
                vehicle_request.reviewed_by = request.user
                vehicle_request.vehicle = vehicle
                vehicle_request.save()

                logger.info(
                    f"Solicitação de veículo aprovada: ID {vehicle_request.id}, "
                    f"Veículo criado: ID {vehicle.id}, "
                    f"Aprovado por: {request.user.username}"
                )

                return Response(
                    {
                        'message': 'Solicitação aprovada com sucesso! Veículo criado.',
                        'data': VehicleRequestListSerializer(vehicle_request).data
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            logger.error(f"Erro ao aprovar solicitação de veículo: {str(e)}")
            return Response(
                {'error': 'Erro ao processar aprovação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """
        Reprova uma solicitação de veículo.

        Processo:
        1. Valida se a solicitação está em análise
        2. Valida se o motivo da reprovação foi informado
        3. Atualiza status da solicitação para 'reprovado'
        4. Registra motivo, usuário revisor e data de revisão
        """
        vehicle_request = self.get_object()

        # Verificar se a solicitação está em análise
        if vehicle_request.status != 'em_analise':
            return Response(
                {'error': f'Esta solicitação já foi {vehicle_request.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar dados da reprovação
        serializer = VehicleRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Atualizar a solicitação
            vehicle_request.status = 'reprovado'
            vehicle_request.rejection_reason = serializer.validated_data.get('rejection_reason')
            vehicle_request.reviewed_at = timezone.now()
            vehicle_request.reviewed_by = request.user
            vehicle_request.save()

            logger.info(
                f"Solicitação de veículo reprovada: ID {vehicle_request.id}, "
                f"Reprovado por: {request.user.username}"
            )

            return Response(
                {
                    'message': 'Solicitação reprovada com sucesso.',
                    'data': VehicleRequestListSerializer(vehicle_request).data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Erro ao reprovar solicitação de veículo: {str(e)}")
            return Response(
                {'error': 'Erro ao processar reprovação. Tente novamente mais tarde.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
