from django.db.models.signals import post_save
from django.dispatch import receiver
from requests.models import DriverRequest, VehicleRequest
from .models import Notification


@receiver(post_save, sender=DriverRequest)
def create_driver_request_notification(sender, instance, created, **kwargs):
    """
    Cria uma notificação quando uma nova solicitação de motorista é criada.
    """
    if created and instance.status == 'em_analise':
        Notification.objects.create(
            notification_type='driver_request',
            request_id=instance.id,
            title=f'Nova Solicitação de Motorista #{instance.id}',
            message=f'Solicitação de {instance.name} (CPF: {instance.cpf}) aguardando análise.'
        )


@receiver(post_save, sender=VehicleRequest)
def create_vehicle_request_notification(sender, instance, created, **kwargs):
    """
    Cria uma notificação quando uma nova solicitação de veículo é criada.
    """
    if created and instance.status == 'em_analise':
        Notification.objects.create(
            notification_type='vehicle_request',
            request_id=instance.id,
            title=f'Nova Solicitação de Veículo #{instance.id}',
            message=f'Solicitação de {instance.brand} {instance.model} (Placa: {instance.plate}) aguardando análise.'
        )
