import logging
from rest_framework import status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.serializers import ValidationError as DRFValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import IntegrityError
from django.core.exceptions import ValidationError

from .models import Conductor
from .serializers import (
    ConductorSerializer,
    ConductorCreateSerializer, 
    ConductorUpdateSerializer,
    ConductorListSerializer
)
from authentication.utils import get_client_ip, get_user_agent, log_user_activity

logger = logging.getLogger(__name__)


class ConductorListCreateView(ListCreateAPIView):
    queryset = Conductor.objects.select_related(
        'created_by',
        'updated_by'
    ).prefetch_related(
        'vehicles'
    )
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
            logger.info(f"Creating conductor with data: {request.data}")
            return super().create(request, *args, **kwargs)
        except DRFValidationError as e:
            logger.error(f"DRF Validation error creating conductor: {e}")

            # Handle field-specific validation errors
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                error_details = e.detail

                # Check for specific duplicate field errors
                if 'cpf' in error_details:
                    error_msg = str(error_details['cpf'][0]) if isinstance(error_details['cpf'], list) else str(error_details['cpf'])
                    if 'já existe' in error_msg.lower() or 'unique' in error_msg.lower():
                        return Response({
                            'error': 'CPF já cadastrado',
                            'message': 'Já existe um condutor cadastrado com este CPF.',
                            'field': 'cpf'
                        }, status=status.HTTP_400_BAD_REQUEST)

                if 'email' in error_details:
                    error_msg = str(error_details['email'][0]) if isinstance(error_details['email'], list) else str(error_details['email'])
                    if 'já existe' in error_msg.lower() or 'unique' in error_msg.lower():
                        return Response({
                            'error': 'Email já cadastrado',
                            'message': 'Já existe um condutor cadastrado com este email.',
                            'field': 'email'
                        }, status=status.HTTP_400_BAD_REQUEST)

                if 'license_number' in error_details:
                    error_msg = str(error_details['license_number'][0]) if isinstance(error_details['license_number'], list) else str(error_details['license_number'])
                    if 'já existe' in error_msg.lower() or 'unique' in error_msg.lower():
                        return Response({
                            'error': 'CNH já cadastrada',
                            'message': 'Já existe um condutor cadastrado com este número de CNH.',
                            'field': 'license_number'
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Handle multiple field errors or other validation errors
                return Response({
                    'error': 'Erro de validação',
                    'message': 'Os dados fornecidos são inválidos.',
                    'details': error_details
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Handle non-field errors
                return Response({
                    'error': 'Erro de validação',
                    'message': 'Os dados fornecidos são inválidos.',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            logger.error(f"Integrity error creating conductor: {e}")
            error_message = str(e)
            if 'cpf' in error_message.lower():
                return Response({
                    'error': 'CPF já cadastrado',
                    'message': 'Já existe um condutor cadastrado com este CPF.',
                    'field': 'cpf'
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'email' in error_message.lower():
                return Response({
                    'error': 'Email já cadastrado',
                    'message': 'Já existe um condutor cadastrado com este email.',
                    'field': 'email'
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'license_number' in error_message.lower():
                return Response({
                    'error': 'CNH já cadastrada',
                    'message': 'Já existe um condutor cadastrado com este número de CNH.',
                    'field': 'license_number'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'Dados duplicados',
                    'message': 'Já existe um condutor com alguns destes dados.',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Django validation error creating conductor: {e}")
            return Response({
                'error': 'Erro de validação',
                'message': 'Os dados fornecidos são inválidos.',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except UnicodeDecodeError as e:
            logger.error(f"Unicode decode error creating conductor: {e}")
            return Response({
                'error': 'Erro de codificação',
                'message': 'Problema com caracteres especiais no texto enviado.',
                'details': 'Verifique se todos os caracteres estão em UTF-8.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error creating conductor: {e}", exc_info=True)
            return Response({
                'error': 'Falha ao criar condutor',
                'message': 'Ocorreu um erro interno. Tente novamente.',
                'details': str(e) if request.user.is_staff else 'Erro interno do servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConductorDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Conductor.objects.select_related(
        'created_by',
        'updated_by'
    ).prefetch_related(
        'vehicles'
    )
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
            logger.info(f"Updating conductor {kwargs.get('pk')} with data: {request.data}")
            return super().update(request, *args, **kwargs)
        except DRFValidationError as e:
            logger.error(f"DRF Validation error updating conductor: {e}")

            # Handle field-specific validation errors
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                error_details = e.detail

                # Check for specific duplicate field errors
                if 'email' in error_details:
                    error_msg = str(error_details['email'][0]) if isinstance(error_details['email'], list) else str(error_details['email'])
                    if 'já existe' in error_msg.lower() or 'unique' in error_msg.lower():
                        return Response({
                            'error': 'Email já cadastrado',
                            'message': 'Já existe um condutor cadastrado com este email.',
                            'field': 'email'
                        }, status=status.HTTP_400_BAD_REQUEST)

                if 'license_number' in error_details:
                    error_msg = str(error_details['license_number'][0]) if isinstance(error_details['license_number'], list) else str(error_details['license_number'])
                    if 'já existe' in error_msg.lower() or 'unique' in error_msg.lower():
                        return Response({
                            'error': 'CNH já cadastrada',
                            'message': 'Já existe um condutor cadastrado com este número de CNH.',
                            'field': 'license_number'
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Handle multiple field errors or other validation errors
                return Response({
                    'error': 'Erro de validação',
                    'message': 'Os dados fornecidos são inválidos.',
                    'details': error_details
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Handle non-field errors
                return Response({
                    'error': 'Erro de validação',
                    'message': 'Os dados fornecidos são inválidos.',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            logger.error(f"Integrity error updating conductor: {e}")
            error_message = str(e)
            if 'email' in error_message.lower():
                return Response({
                    'error': 'Email já cadastrado',
                    'message': 'Já existe um condutor cadastrado com este email.',
                    'field': 'email'
                }, status=status.HTTP_400_BAD_REQUEST)
            elif 'license_number' in error_message.lower():
                return Response({
                    'error': 'CNH já cadastrada',
                    'message': 'Já existe um condutor cadastrado com este número de CNH.',
                    'field': 'license_number'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'Dados duplicados',
                    'message': 'Já existe um condutor com alguns destes dados.',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Django validation error updating conductor: {e}")
            return Response({
                'error': 'Erro de validação',
                'message': 'Os dados fornecidos são inválidos.',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except UnicodeDecodeError as e:
            logger.error(f"Unicode decode error updating conductor: {e}")
            return Response({
                'error': 'Erro de codificação',
                'message': 'Problema com caracteres especiais no texto enviado.',
                'details': 'Verifique se todos os caracteres estão em UTF-8.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error updating conductor: {e}", exc_info=True)
            return Response({
                'error': 'Falha ao atualizar condutor',
                'message': 'Ocorreu um erro interno. Tente novamente.',
                'details': str(e) if request.user.is_staff else 'Erro interno do servidor'
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_duplicate_field(request):
    """
    Check if a conductor field value already exists in the database.
    Used for real-time duplicate validation in forms.

    Query parameters:
    - field: The field to check (cpf, email, license_number)
    - value: The value to check for duplicates
    - exclude_id: ID of conductor to exclude from check (for edit mode)
    """
    try:
        field = request.GET.get('field', '').strip()
        value = request.GET.get('value', '').strip()
        exclude_id = request.GET.get('exclude_id')

        # Validate required parameters
        if not field or not value:
            return Response({
                'error': 'Parâmetros "field" e "value" são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate field name
        allowed_fields = ['cpf', 'email', 'license_number']
        if field not in allowed_fields:
            return Response({
                'error': f'Campo "{field}" não é válido. Campos permitidos: {", ".join(allowed_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Build query
        query_kwargs = {field: value}
        query = Conductor.objects.filter(**query_kwargs)

        # Exclude specific conductor if in edit mode
        if exclude_id:
            try:
                exclude_id = int(exclude_id)
                query = query.exclude(id=exclude_id)
            except (ValueError, TypeError):
                return Response({
                    'error': 'ID do condutor para exclusão deve ser um número válido'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Check if duplicate exists
        duplicate_exists = query.exists()
        duplicate_conductor = None

        if duplicate_exists:
            # Get the first matching conductor for details
            conductor = query.first()
            duplicate_conductor = {
                'id': conductor.id,
                'name': conductor.name,
                'cpf': conductor.cpf,
                'email': conductor.email,
                'license_number': conductor.license_number,
                'is_active': conductor.is_active
            }

        # Prepare response with Portuguese messages
        field_names = {
            'cpf': 'CPF',
            'email': 'Email',
            'license_number': 'CNH'
        }

        field_messages = {
            'cpf': 'Este CPF já está cadastrado',
            'email': 'Este email já está em uso',
            'license_number': 'Esta CNH já está cadastrada'
        }

        return Response({
            'exists': duplicate_exists,
            'field': field,
            'value': value,
            'message': field_messages.get(field, f'Este {field_names.get(field, field)} já está em uso') if duplicate_exists else None,
            'duplicate_conductor': duplicate_conductor
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error checking duplicate field: {e}", exc_info=True)
        return Response({
            'error': 'Falha ao verificar duplicatas',
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