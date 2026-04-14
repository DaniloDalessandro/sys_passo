"""
Testes abrangentes para o app complaints.

Cobre o ViewSet completo, endpoints públicos (autocomplete, types, check-protocol)
e as actions (change_status, change_priority, mark_as_resolved, statistics).
"""
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import Complaint
from vehicles.models import Vehicle
from authentication.models import UserProfile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(username='complaintuser', password='ComplaintPass123!', email='complaint@example.com', role='viewer'):
    user = User.objects.create_user(username=username, password=password, email=email)
    profile = user.profile
    profile.role = role
    profile.save()
    return user


def make_approver(username='approver', password='ApprPass123!', email='appr@example.com'):
    return make_user(username=username, password=password, email=email, role='approver')


def make_complaint(vehicle_plate='TST1234', complaint_type='excesso_velocidade',
                   description='Teste de denúncia com descrição de pelo menos 20 caracteres',
                   **kwargs):
    return Complaint.objects.create(
        vehicle_plate=vehicle_plate,
        complaint_type=complaint_type,
        description=description,
        **kwargs
    )


# ---------------------------------------------------------------------------
# Complaint Model Tests
# ---------------------------------------------------------------------------

class ComplaintModelTest(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            plate='ABC1234',
            brand='Toyota',
            model='Corolla',
            year=2023,
            color='Preto'
        )

    def test_create_complaint_default_status_proposto(self):
        complaint = make_complaint(vehicle_plate='ABC1234')
        self.assertEqual(complaint.status, 'proposto')
        self.assertEqual(complaint.priority, 'media')
        self.assertIsNotNone(complaint.created_at)

    def test_auto_associate_vehicle_by_plate(self):
        complaint = make_complaint(vehicle_plate='abc1234')
        self.assertIsNotNone(complaint.vehicle)
        self.assertEqual(complaint.vehicle.id, self.vehicle.id)
        self.assertEqual(complaint.vehicle_plate, 'ABC1234')

    def test_plate_normalization(self):
        complaint = make_complaint(vehicle_plate='  xyz 1d23  ')
        self.assertEqual(complaint.vehicle_plate, 'XYZ1D23')

    def test_anonymous_detection_sem_dados(self):
        complaint = make_complaint(vehicle_plate='ABX9999')
        self.assertTrue(complaint.is_anonymous)

    def test_not_anonymous_com_nome(self):
        complaint = make_complaint(vehicle_plate='ABX8888', complainant_name='João Silva')
        self.assertFalse(complaint.is_anonymous)

    def test_str_representation(self):
        complaint = make_complaint(vehicle_plate='ABC1234')
        expected = f"Denúncia #{complaint.id} - ABC1234 - Excesso de Velocidade"
        self.assertEqual(str(complaint), expected)

    def test_protocol_gerado_automaticamente(self):
        complaint = make_complaint(vehicle_plate='AAA1111')
        self.assertIsNotNone(complaint.protocol)
        self.assertTrue(complaint.protocol.startswith('CMP-'))


# ---------------------------------------------------------------------------
# Complaint API Tests
# ---------------------------------------------------------------------------

class ComplaintCreateTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vehicle = Vehicle.objects.create(
            plate='TEST123',
            brand='Honda',
            model='Civic',
            year=2022,
            color='Branco'
        )

    def test_criar_denuncia_publico_retorna_201(self):
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'excesso_velocidade',
            'description': 'Teste de criação pública de denúncia com descrição mínima',
            'occurrence_date': '2026-01-08',
            'occurrence_location': 'Rua Teste, 123',
            'complainant_name': 'João Silva',
            'complainant_email': 'joao@email.com',
            'complainant_phone': '(11) 99999-9999'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('complaint', response.data)

    def test_criar_denuncia_anonima_retorna_201(self):
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'direcao_perigosa',
            'description': 'Denúncia anônima com descrição de pelo menos 20 caracteres'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        complaint = Complaint.objects.first()
        self.assertTrue(complaint.is_anonymous)

    def test_criar_denuncia_descricao_curta_retorna_400(self):
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'outros',
            'description': 'Curta'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_denuncia_sem_placa_retorna_400(self):
        data = {
            'complaint_type': 'outros',
            'description': 'Descrição com pelo menos 20 caracteres para teste'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_denuncia_placa_curta_retorna_400(self):
        data = {
            'vehicle_plate': 'ABC',
            'complaint_type': 'outros',
            'description': 'Descrição com pelo menos 20 caracteres para teste'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ComplaintListTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        make_complaint(vehicle_plate='TST1111')
        make_complaint(vehicle_plate='TST2222', complaint_type='uso_celular')

    def test_listar_denuncias_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/complaints/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_listar_denuncias_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/complaints/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filtrar_denuncias_por_status(self):
        make_complaint(vehicle_plate='TST3333', status='em_analise')
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/complaints/?status=em_analise')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class ComplaintChangeStatusTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.complaint = make_complaint(vehicle_plate='STA1234')

    def test_alterar_status_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_status/',
            {'status': 'em_analise'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.status, 'em_analise')
        self.assertEqual(self.complaint.reviewed_by, self.user)

    def test_alterar_status_sem_autenticacao_retorna_401(self):
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_status/',
            {'status': 'em_analise'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_alterar_status_invalido_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_status/',
            {'status': 'status_inexistente'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ComplaintChangePriorityTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='complaintuser2', email='cp2@example.com')
        self.complaint = make_complaint(vehicle_plate='PRI1234')

    def test_alterar_prioridade_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_priority/',
            {'priority': 'urgente'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.priority, 'urgente')

    def test_alterar_prioridade_invalida_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_priority/',
            {'priority': 'extrema'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_alterar_prioridade_sem_campo_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/change_priority/',
            {},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ComplaintMarkAsResolvedTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='complaintuser3', email='cp3@example.com')
        self.complaint = make_complaint(vehicle_plate='RES1234', status='em_analise')

    def test_marcar_como_resolvida_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/mark_as_resolved/',
            {'resolution_notes': 'Motorista foi notificado'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.status, 'concluido')
        self.assertEqual(self.complaint.resolution_notes, 'Motorista foi notificado')

    def test_marcar_como_resolvida_sem_autenticacao_retorna_401(self):
        response = self.client.post(
            f'/api/complaints/{self.complaint.id}/mark_as_resolved/',
            {'resolution_notes': 'Resolvido'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ComplaintStatisticsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='complaintuser4', email='cp4@example.com')
        make_complaint(vehicle_plate='STC1111')
        make_complaint(vehicle_plate='STC2222', complaint_type='uso_celular', status='concluido')

    def test_estatisticas_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/complaints/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_status', response.data)
        self.assertIn('by_type', response.data)
        self.assertEqual(response.data['total'], 2)

    def test_estatisticas_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/complaints/statistics/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Public Endpoints
# ---------------------------------------------------------------------------

class ComplaintPublicEndpointsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vehicle = Vehicle.objects.create(
            plate='PUB1234',
            brand='Ford',
            model='Ka',
            year=2020,
            color='Azul'
        )

    def test_autocomplete_veiculos_retorna_200(self):
        response = self.client.get('/api/complaints/vehicles/autocomplete/?q=PUB')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['plate'], 'PUB1234')

    def test_autocomplete_veiculos_query_curta_retorna_lista_vazia(self):
        response = self.client.get('/api/complaints/vehicles/autocomplete/?q=P')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_tipos_denuncia_retorna_200(self):
        response = self.client.get('/api/complaints/_types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 10)
        self.assertIn('value', response.data[0])
        self.assertIn('label', response.data[0])

    def test_verificar_protocolo_sem_protocolo_retorna_400(self):
        response = self.client.get('/api/complaints/_check-protocol/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verificar_protocolo_inexistente_retorna_404(self):
        response = self.client.get('/api/complaints/_check-protocol/?protocol=CMP20260000')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verificar_protocolo_existente_retorna_200(self):
        complaint = make_complaint(vehicle_plate='PRO1234')
        response = self.client.get(f'/api/complaints/_check-protocol/?protocol={complaint.protocol}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['protocol'], complaint.protocol)


# ---------------------------------------------------------------------------
# Validation Tests
# ---------------------------------------------------------------------------

class ComplaintValidationTest(TestCase):
    def test_descricao_curta_levanta_validacao(self):
        from django.core.exceptions import ValidationError
        complaint = Complaint(
            vehicle_plate='TST1234',
            complaint_type='outros',
            description='Curta'
        )
        with self.assertRaises(ValidationError):
            complaint.full_clean()

    def test_placa_curta_levanta_validacao(self):
        from django.core.exceptions import ValidationError
        complaint = Complaint(
            vehicle_plate='ABC',
            complaint_type='outros',
            description='Descrição com pelo menos 20 caracteres para teste'
        )
        with self.assertRaises(ValidationError):
            complaint.full_clean()
