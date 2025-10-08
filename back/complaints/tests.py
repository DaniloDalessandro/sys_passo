"""
Arquivo de testes para o app Complaints.

Este arquivo contém exemplos de testes que podem ser executados
para validar o funcionamento do sistema de denúncias.

Para executar os testes:
    python manage.py test complaints

Para executar com verbosidade:
    python manage.py test complaints --verbosity=2
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import Complaint
from vehicles.models import Vehicle


class ComplaintModelTest(TestCase):
    """Testes para o modelo Complaint"""

    def setUp(self):
        """Configurar dados para os testes"""
        self.vehicle = Vehicle.objects.create(
            plate='ABC1234',
            brand='Toyota',
            model='Corolla',
            year=2023,
            color='Preto'
        )

    def test_create_complaint(self):
        """Testar criação de denúncia"""
        complaint = Complaint.objects.create(
            vehicle_plate='ABC1234',
            complaint_type='excesso_velocidade',
            description='Teste de denúncia com descrição de pelo menos 20 caracteres'
        )

        self.assertEqual(complaint.vehicle_plate, 'ABC1234')
        self.assertEqual(complaint.status, 'pendente')
        self.assertEqual(complaint.priority, 'media')
        self.assertIsNotNone(complaint.created_at)

    def test_auto_associate_vehicle(self):
        """Testar associação automática de veículo pela placa"""
        complaint = Complaint.objects.create(
            vehicle_plate='abc1234',  # lowercase para testar normalização
            complaint_type='direcao_perigosa',
            description='Teste de associação automática de veículo com descrição mínima'
        )

        self.assertIsNotNone(complaint.vehicle)
        self.assertEqual(complaint.vehicle.id, self.vehicle.id)
        self.assertEqual(complaint.vehicle_plate, 'ABC1234')  # Deve ser normalizado

    def test_plate_normalization(self):
        """Testar normalização de placa (uppercase, sem espaços)"""
        complaint = Complaint.objects.create(
            vehicle_plate='  abc 1d23  ',
            complaint_type='uso_celular',
            description='Teste de normalização de placa com descrição mínima'
        )

        self.assertEqual(complaint.vehicle_plate, 'ABC1D23')

    def test_anonymous_detection(self):
        """Testar detecção automática de denúncia anônima"""
        # Denúncia anônima (sem dados do denunciante)
        anonymous_complaint = Complaint.objects.create(
            vehicle_plate='ABC1234',
            complaint_type='outros',
            description='Denúncia anônima com descrição mínima de caracteres'
        )

        self.assertTrue(anonymous_complaint.is_anonymous)

        # Denúncia identificada (com dados do denunciante)
        identified_complaint = Complaint.objects.create(
            vehicle_plate='XYZ5678',
            complaint_type='outros',
            description='Denúncia identificada com descrição mínima',
            complainant_name='João Silva'
        )

        self.assertFalse(identified_complaint.is_anonymous)

    def test_string_representation(self):
        """Testar representação em string do modelo"""
        complaint = Complaint.objects.create(
            vehicle_plate='ABC1234',
            complaint_type='excesso_velocidade',
            description='Teste de representação em string com descrição mínima'
        )

        expected = f"Denúncia #{complaint.id} - ABC1234 - Excesso de Velocidade"
        self.assertEqual(str(complaint), expected)


class ComplaintAPITest(APITestCase):
    """Testes para a API de denúncias"""

    def setUp(self):
        """Configurar dados para os testes"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )

        self.vehicle = Vehicle.objects.create(
            plate='TEST123',
            brand='Honda',
            model='Civic',
            year=2022,
            color='Branco'
        )

    def test_create_complaint_public(self):
        """Testar criação de denúncia sem autenticação (público)"""
        url = '/api/complaints/'
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'excesso_velocidade',
            'description': 'Teste de criação pública de denúncia com descrição mínima',
            'occurrence_date': '2025-10-08',
            'occurrence_location': 'Rua Teste, 123',
            'complainant_name': 'João Silva',
            'complainant_email': 'joao@email.com',
            'complainant_phone': '(11) 99999-9999'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('complaint', response.data)
        self.assertEqual(Complaint.objects.count(), 1)

    def test_create_complaint_anonymous(self):
        """Testar criação de denúncia anônima"""
        url = '/api/complaints/'
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'direcao_perigosa',
            'description': 'Denúncia anônima com descrição de pelo menos 20 caracteres'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        complaint = Complaint.objects.first()
        self.assertTrue(complaint.is_anonymous)

    def test_create_complaint_validation_error(self):
        """Testar validação de descrição mínima"""
        url = '/api/complaints/'
        data = {
            'vehicle_plate': 'TEST123',
            'complaint_type': 'outros',
            'description': 'Curta'  # Menos de 20 caracteres
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)

    def test_list_complaints_requires_auth(self):
        """Testar que listagem requer autenticação"""
        url = '/api/complaints/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_complaints_authenticated(self):
        """Testar listagem de denúncias autenticada"""
        # Criar algumas denúncias
        Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Denúncia 1 com descrição mínima de caracteres'
        )
        Complaint.objects.create(
            vehicle_plate='TEST456',
            complaint_type='uso_celular',
            description='Denúncia 2 com descrição mínima de caracteres'
        )

        # Autenticar
        self.client.force_authenticate(user=self.user)

        url = '/api/complaints/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_filter_complaints_by_status(self):
        """Testar filtro por status"""
        Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Denúncia pendente com descrição mínima',
            status='pendente'
        )
        Complaint.objects.create(
            vehicle_plate='TEST456',
            complaint_type='uso_celular',
            description='Denúncia resolvida com descrição mínima',
            status='resolvida'
        )

        self.client.force_authenticate(user=self.user)

        url = '/api/complaints/?status=pendente'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['status'], 'pendente')

    def test_change_status_endpoint(self):
        """Testar endpoint de alteração de status"""
        complaint = Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Teste de alteração de status com descrição mínima',
            status='pendente'
        )

        self.client.force_authenticate(user=self.user)

        url = f'/api/complaints/{complaint.id}/change_status/'
        data = {'status': 'em_analise'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'em_analise')
        self.assertEqual(complaint.reviewed_by, self.user)
        self.assertIsNotNone(complaint.reviewed_at)

    def test_change_priority_endpoint(self):
        """Testar endpoint de alteração de prioridade"""
        complaint = Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Teste de alteração de prioridade com descrição mínima',
            priority='media'
        )

        self.client.force_authenticate(user=self.user)

        url = f'/api/complaints/{complaint.id}/change_priority/'
        data = {'priority': 'urgente'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        complaint.refresh_from_db()
        self.assertEqual(complaint.priority, 'urgente')

    def test_mark_as_resolved_endpoint(self):
        """Testar endpoint de marcar como resolvida"""
        complaint = Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Teste de resolução de denúncia com descrição mínima',
            status='em_analise'
        )

        self.client.force_authenticate(user=self.user)

        url = f'/api/complaints/{complaint.id}/mark_as_resolved/'
        data = {'resolution_notes': 'Motorista foi advertido'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'resolvida')
        self.assertEqual(complaint.resolution_notes, 'Motorista foi advertido')
        self.assertEqual(complaint.reviewed_by, self.user)

    def test_statistics_endpoint(self):
        """Testar endpoint de estatísticas"""
        # Criar denúncias com diferentes status
        Complaint.objects.create(
            vehicle_plate='TEST123',
            complaint_type='excesso_velocidade',
            description='Denúncia 1 com descrição mínima',
            status='pendente'
        )
        Complaint.objects.create(
            vehicle_plate='TEST456',
            complaint_type='uso_celular',
            description='Denúncia 2 com descrição mínima',
            status='resolvida'
        )

        self.client.force_authenticate(user=self.user)

        url = '/api/complaints/statistics/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_status', response.data)
        self.assertIn('by_priority', response.data)
        self.assertIn('by_type', response.data)
        self.assertEqual(response.data['total'], 2)

    def test_vehicle_autocomplete(self):
        """Testar endpoint de autocomplete de veículos"""
        url = '/api/complaints/vehicles/autocomplete/?q=TEST'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['plate'], 'TEST123')

    def test_complaint_types_endpoint(self):
        """Testar endpoint de tipos de denúncia"""
        url = '/api/complaints/types/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 10)  # 10 tipos disponíveis
        self.assertIn('value', response.data[0])
        self.assertIn('label', response.data[0])


class ComplaintValidationTest(TestCase):
    """Testes de validação do modelo"""

    def test_description_min_length_validation(self):
        """Testar validação de descrição mínima"""
        from django.core.exceptions import ValidationError

        complaint = Complaint(
            vehicle_plate='TEST123',
            complaint_type='outros',
            description='Curta'  # Menos de 20 caracteres
        )

        with self.assertRaises(ValidationError):
            complaint.full_clean()

    def test_plate_min_length_validation(self):
        """Testar validação de placa mínima"""
        from django.core.exceptions import ValidationError

        complaint = Complaint(
            vehicle_plate='ABC',  # Menos de 7 caracteres
            complaint_type='outros',
            description='Descrição com pelo menos 20 caracteres para teste'
        )

        with self.assertRaises(ValidationError):
            complaint.full_clean()
