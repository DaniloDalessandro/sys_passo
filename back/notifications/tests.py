"""
Testes abrangentes para o app notifications.

Cobre endpoints do ViewSet: list, unread, unread_count,
mark_as_read e mark_all_as_read.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Notification
from authentication.models import UserProfile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(username='notifuser', password='NotifPass123!', email='notif@example.com'):
    user = User.objects.create_user(username=username, password=password, email=email)
    return user


def make_notification(notification_type='driver_request', request_id=1, is_read=False):
    return Notification.objects.create(
        notification_type=notification_type,
        request_id=request_id,
        title=f'Notificação de teste #{request_id}',
        message='Mensagem de teste da notificação.',
        is_read=is_read
    )


# ---------------------------------------------------------------------------
# ViewSet: List
# ---------------------------------------------------------------------------

class NotificationListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        make_notification(request_id=1)
        make_notification(notification_type='vehicle_request', request_id=2)

    def test_listar_notificacoes_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_notificacoes_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listar_notificacoes_retorna_todas(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)


# ---------------------------------------------------------------------------
# ViewSet: Unread
# ---------------------------------------------------------------------------

class NotificationUnreadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='notifuser2', email='notif2@example.com')
        make_notification(request_id=1, is_read=False)
        make_notification(request_id=2, is_read=True)

    def test_listar_nao_lidas_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/unread/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Apenas as não lidas
        for item in response.data:
            self.assertFalse(item['is_read'])

    def test_listar_nao_lidas_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/notifications/unread/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# ViewSet: Unread Count
# ---------------------------------------------------------------------------

class NotificationUnreadCountTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='notifuser3', email='notif3@example.com')
        make_notification(request_id=1, is_read=False)
        make_notification(request_id=2, is_read=False)
        make_notification(request_id=3, is_read=True)

    def test_contagem_nao_lidas_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('unread_count', response.data)
        self.assertEqual(response.data['unread_count'], 2)

    def test_contagem_nao_lidas_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# ViewSet: Mark as Read
# ---------------------------------------------------------------------------

class NotificationMarkAsReadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='notifuser4', email='notif4@example.com')
        self.notification = make_notification(request_id=10, is_read=False)

    def test_marcar_como_lida_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/notifications/{self.notification.pk}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_marcar_como_lida_sem_autenticacao_retorna_401(self):
        response = self.client.patch(f'/api/notifications/{self.notification.pk}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_marcar_notificacao_inexistente_retorna_404(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch('/api/notifications/99999/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# ViewSet: Mark All as Read
# ---------------------------------------------------------------------------

class NotificationMarkAllAsReadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='notifuser5', email='notif5@example.com')
        make_notification(request_id=20, is_read=False)
        make_notification(request_id=21, is_read=False)
        make_notification(request_id=22, is_read=True)

    def test_marcar_todas_como_lidas_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/notifications/mark_all_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('updated_count', response.data)
        self.assertEqual(response.data['updated_count'], 2)

    def test_marcar_todas_como_lidas_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/notifications/mark_all_as_read/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Model Tests (mantidos)
# ---------------------------------------------------------------------------

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
