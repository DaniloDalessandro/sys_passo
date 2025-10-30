from django.test import TestCase
from django.contrib.auth.models import User
from .models import Notification


class NotificationModelTest(TestCase):
    """
    Testes para o modelo Notification
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_driver_notification(self):
        """Testa criação de notificação de motorista"""
        notification = Notification.objects.create(
            notification_type='driver_request',
            request_id=1,
            title='Nova Solicitação de Motorista #1',
            message='Solicitação de João Silva aguardando análise.'
        )

        self.assertEqual(notification.notification_type, 'driver_request')
        self.assertEqual(notification.request_id, 1)
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_by)

    def test_create_vehicle_notification(self):
        """Testa criação de notificação de veículo"""
        notification = Notification.objects.create(
            notification_type='vehicle_request',
            request_id=2,
            title='Nova Solicitação de Veículo #2',
            message='Solicitação de Toyota Corolla aguardando análise.'
        )

        self.assertEqual(notification.notification_type, 'vehicle_request')
        self.assertEqual(notification.request_id, 2)
        self.assertFalse(notification.is_read)

    def test_mark_notification_as_read(self):
        """Testa marcação de notificação como lida"""
        from django.utils import timezone

        notification = Notification.objects.create(
            notification_type='driver_request',
            request_id=1,
            title='Nova Solicitação de Motorista #1',
            message='Solicitação aguardando análise.'
        )

        notification.is_read = True
        notification.read_by = self.user
        notification.read_at = timezone.now()
        notification.save()

        self.assertTrue(notification.is_read)
        self.assertEqual(notification.read_by, self.user)
        self.assertIsNotNone(notification.read_at)

    def test_notification_ordering(self):
        """Testa ordenação de notificações por data"""
        import time

        notif1 = Notification.objects.create(
            notification_type='driver_request',
            request_id=1,
            title='Notificação 1',
            message='Primeira notificação'
        )

        time.sleep(0.01)  # Pequeno delay para garantir diferença de timestamp

        notif2 = Notification.objects.create(
            notification_type='vehicle_request',
            request_id=2,
            title='Notificação 2',
            message='Segunda notificação'
        )

        notifications = list(Notification.objects.all())
        self.assertEqual(notifications[0], notif2)  # Mais recente primeiro
        self.assertEqual(notifications[1], notif1)
