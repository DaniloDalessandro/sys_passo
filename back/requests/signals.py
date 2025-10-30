"""
Sinais para enviar notificações WebSocket quando novas solicitações são criadas.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

from .models import DriverRequest, VehicleRequest

logger = logging.getLogger(__name__)


@receiver(post_save, sender=DriverRequest)
def notify_new_driver_request(sender, instance, created, **kwargs):
    """
    Envia notificação WebSocket quando uma nova solicitação de motorista é criada.
    """
    # IMPORTANTE: Apenas quando é criado E status é 'em_analise'
    # Evita loop infinito em updates subsequentes
    if created and instance.status == 'em_analise':
        try:
            channel_layer = get_channel_layer()

            logger.info(f'Enviando notificação WebSocket para nova solicitação de motorista: {instance.id}')

            # Formata protocolo (ID com zeros à esquerda)
            protocol = f'#{instance.id:05d}'

            # Envia mensagem para o grupo de notificações
            async_to_sync(channel_layer.group_send)(
                'requests_notifications',
                {
                    'type': 'new_request',
                    'request_type': 'driver',
                    'request_id': instance.id,
                    'protocol': protocol,
                    'message': f'Nova solicitação de motorista',
                    'title': f'{protocol} - {instance.name}',
                    'data': {
                        'id': instance.id,
                        'protocol': protocol,
                        'name': instance.name,
                        'cpf': instance.cpf,
                        'email': instance.email,
                        'phone': instance.phone,
                        'license_number': instance.license_number,
                        'license_category': instance.license_category,
                        'status': instance.status,
                        'created_at': instance.created_at.isoformat() if instance.created_at else None,
                    }
                }
            )
        except Exception as e:
            logger.error(f'Erro ao enviar notificação WebSocket: {e}')


@receiver(post_save, sender=VehicleRequest)
def notify_new_vehicle_request(sender, instance, created, **kwargs):
    """
    Envia notificação WebSocket quando uma nova solicitação de veículo é criada.
    """
    # IMPORTANTE: Apenas quando é criado E status é 'em_analise'
    # Evita loop infinito em updates subsequentes
    if created and instance.status == 'em_analise':
        try:
            channel_layer = get_channel_layer()

            logger.info(f'Enviando notificação WebSocket para nova solicitação de veículo: {instance.id}')

            # Formata protocolo (ID com zeros à esquerda)
            protocol = f'#{instance.id:05d}'

            # Envia mensagem para o grupo de notificações
            async_to_sync(channel_layer.group_send)(
                'requests_notifications',
                {
                    'type': 'new_request',
                    'request_type': 'vehicle',
                    'request_id': instance.id,
                    'protocol': protocol,
                    'message': f'Nova solicitação de veículo',
                    'title': f'{protocol} - {instance.brand} {instance.model} ({instance.plate})',
                    'data': {
                        'id': instance.id,
                        'protocol': protocol,
                        'plate': instance.plate,
                        'brand': instance.brand,
                        'model': instance.model,
                        'year': instance.year,
                        'color': instance.color,
                        'fuel_type': instance.fuel_type,
                        'status': instance.status,
                        'created_at': instance.created_at.isoformat() if instance.created_at else None,
                    }
                }
            )
        except Exception as e:
            logger.error(f'Erro ao enviar notificação WebSocket: {e}')
