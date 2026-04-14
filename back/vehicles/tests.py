"""
Testes abrangentes para o app vehicles.

Cobre todos os endpoints: CRUD via ViewSet, stats,
busca por placa e detalhe por placa específica.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Vehicle
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


def make_vehicle(plate='ABC1234', brand='Toyota', model='Corolla', year=2022, created_by=None):
    return Vehicle.objects.create(
        plate=plate,
        brand=brand,
        model=model,
        year=year,
        color='Prata',
        chassis_number=f'CHASSIS{plate}',
        renavam=f'RENAVAM{plate}',
        fuel_type='flex',
        category='Carro',
        created_by=created_by
    )


VALID_VEHICLE_DATA = {
    'plate': 'XYZ9876',
    'brand': 'Honda',
    'model': 'Fit',
    'year': 2021,
    'color': 'Azul',
    'chassis_number': 'CHASSIS_XYZ9876',
    'renavam': 'RENAVAM_XYZ9876',
    'fuel_type': 'flex',
    'category': 'Carro',
    'passenger_capacity': 5,
}


# ---------------------------------------------------------------------------
# ViewSet: List / Create
# ---------------------------------------------------------------------------

class VehicleListCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_listar_veiculos_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_veiculos_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_veiculo_valido_retorna_201(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/vehicles/', VALID_VEHICLE_DATA)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_criar_veiculo_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/vehicles/', VALID_VEHICLE_DATA)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_veiculo_placa_duplicada_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        make_vehicle(plate='XYZ9876')
        response = self.client.post('/api/vehicles/', VALID_VEHICLE_DATA)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_veiculo_dados_incompletos_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/vehicles/', {'brand': 'Honda'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# ViewSet: Retrieve / Update / Delete
# ---------------------------------------------------------------------------

class VehicleDetailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.vehicle = make_vehicle(created_by=self.user)

    def test_detalhar_veiculo_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['plate'], self.vehicle.plate)

    def test_detalhar_veiculo_sem_autenticacao_retorna_401(self):
        response = self.client.get(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detalhar_veiculo_inexistente_retorna_404(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/vehicles/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_veiculo_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/vehicles/{self.vehicle.pk}/', {'color': 'Preto'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['color'], 'Preto')

    def test_put_veiculo_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'plate': self.vehicle.plate,
            'brand': 'Toyota',
            'model': 'Hilux',
            'year': 2023,
            'color': 'Branco',
            'chassis_number': self.vehicle.chassis_number,
            'renavam': self.vehicle.renavam,
            'fuel_type': 'diesel',
            'category': 'Van',
            'passenger_capacity': 8,
        }
        response = self.client.put(f'/api/vehicles/{self.vehicle.pk}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_deletar_veiculo_autenticado_retorna_204(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Vehicle.objects.filter(pk=self.vehicle.pk).exists())

    def test_deletar_veiculo_sem_autenticacao_retorna_401(self):
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

class VehicleStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_stats_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/vehicles/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_vehicles', response.data)
        self.assertIn('active_vehicles', response.data)

    def test_stats_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/vehicles/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Search by Plate (público)
# ---------------------------------------------------------------------------

class SearchByPlateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        make_vehicle(plate='TST1234', brand='Fiat', model='Uno')

    def test_busca_por_placa_retorna_200(self):
        response = self.client.get('/api/vehicles/search-by-plate/?search=TST')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_busca_por_placa_query_curta_retorna_lista_vazia(self):
        response = self.client.get('/api/vehicles/search-by-plate/?search=T')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_busca_por_placa_sem_query_retorna_lista_vazia(self):
        response = self.client.get('/api/vehicles/search-by-plate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])


# ---------------------------------------------------------------------------
# Get Vehicle by Plate (público)
# ---------------------------------------------------------------------------

class GetVehicleByPlateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.vehicle = make_vehicle(plate='DEF5678')

    def test_busca_placa_existente_retorna_200(self):
        response = self.client.get('/api/vehicles/plate/DEF5678/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['plate'], 'DEF5678')

    def test_busca_placa_inexistente_retorna_404(self):
        response = self.client.get('/api/vehicles/plate/ZZZ9999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_busca_placa_case_insensitive(self):
        response = self.client.get('/api/vehicles/plate/def5678/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
