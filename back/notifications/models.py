from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    """
    Model para notificações de novas solicitações no sistema.

    Gera notificações automaticamente quando há novas solicitações
    de veículos ou motoristas pendentes de aprovação.
    """

    NOTIFICATION_TYPES = [
        ('driver_request', 'Solicitação de Motorista'),
        ('vehicle_request', 'Solicitação de Veículo'),
    ]

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        verbose_name='Tipo de Notificação',
        help_text='Tipo de solicitação que gerou a notificação'
    )

    request_id = models.IntegerField(
        verbose_name='ID da Solicitação',
        help_text='ID da solicitação referenciada'
    )

    title = models.CharField(
        max_length=200,
        verbose_name='Título',
        help_text='Título resumido da notificação'
    )

    message = models.TextField(
        verbose_name='Mensagem',
        help_text='Mensagem detalhada da notificação'
    )

    is_read = models.BooleanField(
        default=False,
        verbose_name='Lida',
        help_text='Indica se a notificação foi lida',
        db_index=True
    )

    read_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_read',
        verbose_name='Lida por',
        help_text='Usuário que marcou a notificação como lida'
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Leitura',
        help_text='Data e hora em que foi marcada como lida'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação',
        help_text='Data e hora em que a notificação foi criada'
    )

    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read', 'created_at']),
            models.Index(fields=['notification_type', 'request_id']),
        ]

    def __str__(self):
        status = 'Lida' if self.is_read else 'Não lida'
        return f"{self.get_notification_type_display()} #{self.request_id} - {status}"
