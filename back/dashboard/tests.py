"""
Testes abrangentes para o app dashboard.

Cobre os endpoints: stats, charts, recent-activity e alerts.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from authentication.models import UserProfile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(username='dashuser', password='DashPass123!', email='dash@example.com', role='viewer'):
    user = User.objects.create_user(username=username, password=password, email=email)
    profile = user.profile
    profile.role = role
    profile.save()
    return user


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

class DashboardStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_stats_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('vehicles', response.data)
        self.assertIn('conductors', response.data)
        self.assertIn('requests', response.data)
        self.assertIn('complaints', response.data)

    def test_stats_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_stats_retorna_campos_corretos_de_veiculos(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/stats/')
        vehicles_data = response.data['vehicles']
        self.assertIn('total', vehicles_data)
        self.assertIn('active', vehicles_data)
        self.assertIn('inactive', vehicles_data)

    def test_stats_retorna_campos_corretos_de_condutores(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/stats/')
        conductor_data = response.data['conductors']
        self.assertIn('total', conductor_data)
        self.assertIn('active', conductor_data)
        self.assertIn('inactive', conductor_data)


# ---------------------------------------------------------------------------
# Dashboard Charts
# ---------------------------------------------------------------------------

class DashboardChartsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='dashuser2', email='dash2@example.com')

    def test_charts_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/charts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('vehicleStatus', response.data)
        self.assertIn('monthlyRegistrations', response.data)

    def test_charts_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/dashboard/charts/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_charts_retorna_registros_mensais(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/charts/')
        monthly = response.data['monthlyRegistrations']
        self.assertIsInstance(monthly, list)
        self.assertEqual(len(monthly), 6)  # 6 meses


# ---------------------------------------------------------------------------
# Dashboard Recent Activity
# ---------------------------------------------------------------------------

class DashboardRecentActivityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='dashuser3', email='dash3@example.com')

    def test_atividade_recente_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/recent-activity/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_atividade_recente_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/dashboard/recent-activity/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Dashboard Alerts
# ---------------------------------------------------------------------------

class DashboardAlertsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='dashuser4', email='dash4@example.com')

    def test_alertas_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/dashboard/alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_alertas_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/dashboard/alerts/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
