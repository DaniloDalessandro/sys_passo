"""
Testes abrangentes para o app conductors.

Cobre todos os endpoints: listar, criar, detalhar, atualizar, deletar,
buscar, estatísticas, verificação de duplicatas e desativação em massa.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

from .models import Conductor
from authentication.models import UserProfile

def make_user(username='testuser', password='TestPass123!', email='test@example.com', role='viewer'):
    user = User.objects.create_user(username=username, password=password, email=email)
    profile = user.profile
    profile.role = role
    profile.save()
    return user

def make_conductor(
    name='João Silva',
    cpf='52998224725',
    email='joao@example.com',
    license_number='12345678901',
    license_category='B',
    birth_date='1990-01-15',
    license_expiry_date=None,
    created_by=None
):
    expiry = license_expiry_date or str((timezone.now().date().replace(year=timezone.now().year + 2)))
    return Conductor.objects.create(
        name=name,
        cpf=cpf,
        email=email,
        phone='11987654321',
        license_number=license_number,
        license_category=license_category,
        birth_date=birth_date,
        license_expiry_date=expiry,
        created_by=created_by
    )

VALID_CONDUCTOR_DATA = {
    'name': 'Maria Oliveira',
    'cpf': '11144477735',
    'email': 'maria@example.com',
    'phone': '11987654321',
    'license_number': '98765432100',
    'license_category': 'B',
    'birth_date': '1985-06-20',
    'license_expiry_date': '2028-06-20',
    'gender': 'F',
    'nationality': 'Brasileira',
    'street': 'Rua das Flores',
    'number': '100',
    'neighborhood': 'Centro',
    'city': 'São Paulo',
}

class ConductorListCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_listar_condutores_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_condutores_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/conductors/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_condutor_valido_retorna_201(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/conductors/', VALID_CONDUCTOR_DATA)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_criar_condutor_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/conductors/', VALID_CONDUCTOR_DATA)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_condutor_dados_incompletos_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/conductors/', {'name': 'Sem Campos'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_condutor_cpf_duplicado_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        make_conductor(cpf='11144477735', email='outro@example.com', license_number='11111111111')
        data = dict(VALID_CONDUCTOR_DATA)  # cpf = 11144477735
        response = self.client.post('/api/conductors/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_condutor_email_duplicado_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        make_conductor(cpf='52998224725', email='maria@example.com', license_number='22222222222')
        data = dict(VALID_CONDUCTOR_DATA)  # email = maria@example.com
        response = self.client.post('/api/conductors/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_condutor_cnh_duplicada_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        make_conductor(cpf='52998224725', email='outro2@example.com', license_number='98765432100')
        data = dict(VALID_CONDUCTOR_DATA)
        data['cpf'] = '38521493806'
        data['email'] = 'unico@example.com'
        response = self.client.post('/api/conductors/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_condutor_cpf_invalido_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        data = dict(VALID_CONDUCTOR_DATA)
        data['cpf'] = '00000000000'  # CPF com todos dígitos iguais
        response = self.client.post('/api/conductors/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_condutor_cnh_expirada_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        data = dict(VALID_CONDUCTOR_DATA)
        data['license_expiry_date'] = '2020-01-01'
        response = self.client.post('/api/conductors/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class ConductorDetailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.conductor = make_conductor(created_by=self.user)

    def test_detalhar_condutor_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/conductors/{self.conductor.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cpf'], self.conductor.cpf)

    def test_detalhar_condutor_sem_autenticacao_retorna_401(self):
        response = self.client.get(f'/api/conductors/{self.conductor.pk}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detalhar_condutor_inexistente_retorna_404(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_condutor_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/conductors/{self.conductor.pk}/', {
            'name': 'Nome Atualizado'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_condutor_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Nome Completo Novo',
            'birth_date': '1990-01-15',
            'gender': 'M',
            'nationality': 'Brasileira',
            'phone': '11987654321',
            'email': 'joao@example.com',
            'license_number': '12345678901',
            'license_category': 'B',
            'license_expiry_date': '2028-06-20',
            'street': 'Rua Nova',
            'number': '200',
            'neighborhood': 'Bairro Novo',
            'city': 'Rio de Janeiro',
        }
        response = self.client.put(f'/api/conductors/{self.conductor.pk}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_deletar_condutor_autenticado_retorna_204(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/conductors/{self.conductor.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Conductor.objects.filter(pk=self.conductor.pk).exists())

    def test_deletar_condutor_sem_autenticacao_retorna_401(self):
        response = self.client.delete(f'/api/conductors/{self.conductor.pk}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ConductorSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        make_conductor(name='Carlos Ferreira', cpf='52998224725', email='carlos@example.com')

    def test_busca_por_nome_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/search/?q=Carlos')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreater(response.data['count'], 0)

    def test_busca_sem_query_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/search/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_busca_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/conductors/search/?q=Carlos')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_busca_sem_resultados_retorna_lista_vazia(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/search/?q=XXXXNAOEXISTE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)

class ConductorStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_stats_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_conductors', response.data)
        self.assertIn('active_conductors', response.data)

    def test_stats_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/conductors/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CheckDuplicateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.conductor = make_conductor(cpf='52998224725', email='dup@example.com', license_number='12345678901')

    def test_check_cpf_existente_retorna_exists_true(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/check-duplicate/?field=cpf&value=52998224725')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['exists'])

    def test_check_cpf_inexistente_retorna_exists_false(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/check-duplicate/?field=cpf&value=00000000000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['exists'])

    def test_check_sem_parametros_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/check-duplicate/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_check_campo_invalido_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/conductors/check-duplicate/?field=name&value=teste')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_check_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/conductors/check-duplicate/?field=cpf&value=52998224725')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_check_com_exclude_id_ignora_proprio_condutor(self):
        self.client.force_authenticate(user=self.user)
        url = f'/api/conductors/check-duplicate/?field=cpf&value=52998224725&exclude_id={self.conductor.pk}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['exists'])

class BulkDeactivateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.c1 = make_conductor(cpf='52998224725', email='c1@example.com', license_number='11111111111')
        self.c2 = make_conductor(
            name='Pedro',
            cpf='11144477735',
            email='c2@example.com',
            license_number='22222222222'
        )

    def test_desativar_em_massa_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/conductors/bulk/deactivate/', {
            'conductor_ids': [self.c1.pk, self.c2.pk]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated_count'], 2)
        self.c1.refresh_from_db()
        self.assertFalse(self.c1.is_active)

    def test_desativar_sem_ids_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/conductors/bulk/deactivate/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_desativar_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/conductors/bulk/deactivate/', {
            'conductor_ids': [self.c1.pk]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
