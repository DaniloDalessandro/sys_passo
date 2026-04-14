"""
Testes abrangentes para o app requests.

Cobre todos os endpoints de solicitações de motoristas e veículos:
criação (público), listagem, aprovação, reprovação e mark_as_viewed.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import DriverRequest, VehicleRequest
from conductors.models import Conductor
from vehicles.models import Vehicle
from authentication.models import UserProfile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(username='testuser', password='TestPass123!', email='test@example.com', role='viewer'):
    user = User.objects.create_user(username=username, password=password, email=email)
    profile = user.profile
    profile.role = role
    profile.save()
    return user


def make_approver(username='approver', password='ApproverPass123!', email='approver@example.com'):
    return make_user(username=username, password=password, email=email, role='approver')


def make_admin(username='adminuser', password='AdminPass123!', email='admin@example.com'):
    return make_user(username=username, password=password, email=email, role='admin')


VALID_DRIVER_REQUEST_DATA = {
    'name': 'Ana Paula',
    'cpf': '52998224725',
    'email': 'ana@example.com',
    'phone': '(11) 98765-4321',
    'license_number': '12345678901',
    'license_category': 'B',
    'birth_date': '1988-03-15',
    'license_expiry_date': '2028-03-15',
    'gender': 'F',
    'nationality': 'Brasileira',
    'street': 'Rua das Palmeiras',
    'number': '55',
    'neighborhood': 'Jardins',
    'city': 'São Paulo',
}

VALID_VEHICLE_REQUEST_DATA = {
    'plate': 'GHI3456',
    'brand': 'Volkswagen',
    'model': 'Golf',
    'year': 2020,
    'color': 'Vermelho',
    'fuel_type': 'flex',
    'category': 'Carro',
    'passenger_capacity': 5,
}


def make_driver_request(**kwargs):
    data = {
        'name': 'Carlos Lima',
        'cpf': '52998224725',
        'email': 'carlos@example.com',
        'phone': '(11) 91234-5678',
        'license_number': '98765432100',
        'license_category': 'B',
        'birth_date': '1985-07-20',
        'license_expiry_date': '2028-07-20',
        'gender': 'M',
        'nationality': 'Brasileira',
        'street': 'Av. Brasil',
        'number': '200',
        'neighborhood': 'Centro',
        'city': 'Campinas',
    }
    data.update(kwargs)
    return DriverRequest.objects.create(**data)


def make_vehicle_request(**kwargs):
    data = {
        'plate': 'JKL7890',
        'brand': 'Chevrolet',
        'model': 'Onix',
        'year': 2021,
        'color': 'Prata',
        'fuel_type': 'flex',
        'category': 'Carro',
        'passenger_capacity': 5,
    }
    data.update(kwargs)
    return VehicleRequest.objects.create(**data)


# ---------------------------------------------------------------------------
# DriverRequest: Create (público)
# ---------------------------------------------------------------------------

class DriverRequestCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_criar_solicitacao_motorista_valida_retorna_201(self):
        response = self.client.post('/api/requests/drivers/', VALID_DRIVER_REQUEST_DATA)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)

    def test_criar_solicitacao_motorista_cpf_invalido_retorna_400(self):
        data = dict(VALID_DRIVER_REQUEST_DATA)
        data['cpf'] = '11111111111'
        response = self.client.post('/api/requests/drivers/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_motorista_cnh_expirada_retorna_400(self):
        data = dict(VALID_DRIVER_REQUEST_DATA)
        data['license_expiry_date'] = '2020-01-01'
        response = self.client.post('/api/requests/drivers/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_motorista_menor_de_idade_retorna_400(self):
        data = dict(VALID_DRIVER_REQUEST_DATA)
        data['birth_date'] = '2015-01-01'
        response = self.client.post('/api/requests/drivers/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_motorista_dados_incompletos_retorna_400(self):
        response = self.client.post('/api/requests/drivers/', {'name': 'Incompleto'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_motorista_cpf_duplicado_em_analise_retorna_400(self):
        # Primeira solicitação
        self.client.post('/api/requests/drivers/', VALID_DRIVER_REQUEST_DATA)
        # Segunda com mesmo CPF
        data = dict(VALID_DRIVER_REQUEST_DATA)
        data['email'] = 'outro@example.com'
        data['license_number'] = '11111111100'
        response = self.client.post('/api/requests/drivers/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# DriverRequest: List (autenticado)
# ---------------------------------------------------------------------------

class DriverRequestListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        make_driver_request()

    def test_listar_solicitacoes_motoristas_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/requests/drivers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_solicitacoes_motoristas_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/requests/drivers/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# DriverRequest: Mark as Viewed
# ---------------------------------------------------------------------------

class DriverRequestMarkViewedTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.req = make_driver_request()

    def test_marcar_visualizado_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/mark_as_viewed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertIsNotNone(self.req.viewed_at)

    def test_marcar_visualizado_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/mark_as_viewed/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# DriverRequest: Approve
# ---------------------------------------------------------------------------

class DriverRequestApproveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.approver = make_approver()
        self.viewer = make_user(username='viewer2', email='viewer2@example.com')
        self.req = make_driver_request()

    def test_aprovar_solicitacao_aprovador_retorna_200(self):
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, 'aprovado')

    def test_aprovar_solicitacao_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_aprovar_solicitacao_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_aprovar_solicitacao_ja_aprovada_retorna_400(self):
        self.client.force_authenticate(user=self.approver)
        # Aprova a primeira vez
        self.client.post(f'/api/requests/drivers/{self.req.pk}/approve/')
        # Tenta aprovar de novo
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# DriverRequest: Reject
# ---------------------------------------------------------------------------

class DriverRequestRejectTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.approver = make_approver(username='approver2', email='approver2@example.com')
        self.viewer = make_user(username='viewer3', email='viewer3@example.com')
        self.req = make_driver_request(cpf='11144477735', email='reject@example.com', license_number='00000000000')

    def test_reprovar_solicitacao_aprovador_retorna_200(self):
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/reject/', {
            'status': 'reprovado',
            'rejection_reason': 'Documentação inválida'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, 'reprovado')

    def test_reprovar_solicitacao_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/reject/', {
            'status': 'reprovado'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reprovar_solicitacao_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/reject/', {
            'status': 'reprovado'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reprovar_solicitacao_ja_reprovada_retorna_400(self):
        self.client.force_authenticate(user=self.approver)
        self.client.post(f'/api/requests/drivers/{self.req.pk}/reject/', {'status': 'reprovado'})
        response = self.client.post(f'/api/requests/drivers/{self.req.pk}/reject/', {'status': 'reprovado'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# VehicleRequest: Create (público)
# ---------------------------------------------------------------------------

class VehicleRequestCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_criar_solicitacao_veiculo_valida_retorna_201(self):
        response = self.client.post('/api/requests/vehicles/', VALID_VEHICLE_REQUEST_DATA)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)

    def test_criar_solicitacao_veiculo_placa_invalida_retorna_400(self):
        data = dict(VALID_VEHICLE_REQUEST_DATA)
        data['plate'] = 'PLACA_INVALIDA'
        response = self.client.post('/api/requests/vehicles/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_veiculo_combustivel_invalido_retorna_400(self):
        data = dict(VALID_VEHICLE_REQUEST_DATA)
        data['fuel_type'] = 'agua'
        response = self.client.post('/api/requests/vehicles/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_veiculo_placa_duplicada_em_analise_retorna_400(self):
        self.client.post('/api/requests/vehicles/', VALID_VEHICLE_REQUEST_DATA)
        response = self.client.post('/api/requests/vehicles/', VALID_VEHICLE_REQUEST_DATA)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_solicitacao_veiculo_dados_incompletos_retorna_400(self):
        response = self.client.post('/api/requests/vehicles/', {'brand': 'Honda'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# VehicleRequest: List (autenticado)
# ---------------------------------------------------------------------------

class VehicleRequestListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        make_vehicle_request()

    def test_listar_solicitacoes_veiculos_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/requests/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_solicitacoes_veiculos_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/requests/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# VehicleRequest: Mark as Viewed
# ---------------------------------------------------------------------------

class VehicleRequestMarkViewedTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.req = make_vehicle_request()

    def test_marcar_visualizado_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/mark_as_viewed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertIsNotNone(self.req.viewed_at)

    def test_marcar_visualizado_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/mark_as_viewed/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# VehicleRequest: Approve
# ---------------------------------------------------------------------------

class VehicleRequestApproveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.approver = make_approver(username='veh_approver', email='veh_approver@example.com')
        self.viewer = make_user(username='veh_viewer', email='veh_viewer@example.com')
        self.req = make_vehicle_request(
            plate='MNO1234',
            chassis_number='CHAS_MNO1234',
            renavam='REN_MNO1234'
        )

    def test_aprovar_solicitacao_veiculo_aprovador_retorna_200(self):
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, 'aprovado')

    def test_aprovar_solicitacao_veiculo_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_aprovar_solicitacao_veiculo_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_aprovar_solicitacao_veiculo_ja_aprovada_retorna_400(self):
        self.client.force_authenticate(user=self.approver)
        self.client.post(f'/api/requests/vehicles/{self.req.pk}/approve/')
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_aprovar_veiculo_sem_chassis_retorna_400(self):
        req_sem_chassis = make_vehicle_request(
            plate='PQR5678',
            chassis_number='',
            renavam=''
        )
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(f'/api/requests/vehicles/{req_sem_chassis.pk}/approve/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# VehicleRequest: Reject
# ---------------------------------------------------------------------------

class VehicleRequestRejectTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.approver = make_approver(username='veh_approver2', email='veh_approver2@example.com')
        self.viewer = make_user(username='veh_viewer2', email='veh_viewer2@example.com')
        self.req = make_vehicle_request(plate='STU9012')

    def test_reprovar_solicitacao_veiculo_aprovador_retorna_200(self):
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/reject/', {
            'status': 'reprovado',
            'rejection_reason': 'Documentação inválida'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, 'reprovado')

    def test_reprovar_solicitacao_veiculo_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/reject/', {
            'status': 'reprovado'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reprovar_solicitacao_veiculo_sem_autenticacao_retorna_401(self):
        response = self.client.post(f'/api/requests/vehicles/{self.req.pk}/reject/', {
            'status': 'reprovado'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
