"""
Testes unitários e de integração para o app authentication.

Cobre models, serializers e todos os endpoints REST.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta

from .models import UserProfile, EmailVerification, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    PasswordResetConfirmSerializer,
    EmailResendSerializer
)

def make_user(username='testuser', password='TestPass123!', email='test@example.com', role='viewer'):
    user = User.objects.create_user(username=username, password=password, email=email)
    profile = user.profile
    profile.role = role
    profile.save()
    return user

def make_admin(username='adminuser', password='AdminPass123!', email='admin@example.com'):
    return make_user(username=username, password=password, email=email, role='admin')

class AuthStatusTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_status_publico_retorna_200(self):
        response = self.client.get('/api/auth/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'ok')

class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_login_valido_retorna_200(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_senha_errada_retorna_401(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'senhaerrada'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_usuario_inexistente_retorna_401(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'naoexiste',
            'password': 'qualquer'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_sem_dados_retorna_400(self):
        response = self.client.post('/api/auth/login/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registro_valido_retorna_201(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'novousuario',
            'email': 'novo@example.com',
            'password': 'NovaSenha123!',
            'password_confirm': 'NovaSenha123!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)

    def test_registro_username_duplicado_retorna_400(self):
        make_user(username='duplicado', email='dup@example.com')
        response = self.client.post('/api/auth/register/', {
            'username': 'duplicado',
            'email': 'outro@example.com',
            'password': 'NovaSenha123!',
            'password_confirm': 'NovaSenha123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_senhas_diferentes_retorna_400(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'usuario2',
            'email': 'usuario2@example.com',
            'password': 'Senha123!',
            'password_confirm': 'SenhaDiferente!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_sem_email_retorna_400(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'usuario3',
            'password': 'Senha123!',
            'password_confirm': 'Senha123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class LogoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_logout_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_get_profile_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)

    def test_get_profile_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_profile_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch('/api/auth/profile/', {'first_name': 'Novo Nome'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_profile_sem_autenticacao_retorna_401(self):
        response = self.client.patch('/api/auth/profile/', {'first_name': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserInfoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_user_info_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/user-info/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)

    def test_user_info_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/auth/user-info/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class TokenVerifyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_verify_token_autenticado_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/token/verify/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('valid'))

    def test_verify_token_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/auth/token/verify/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class PasswordChangeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(password='Antiga123!')

    def test_troca_senha_valida_retorna_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/password/change/', {
            'old_password': 'Antiga123!',
            'new_password': 'Nova123!!ABC',
            'new_password2': 'Nova123!!ABC'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_troca_senha_sem_autenticacao_retorna_401(self):
        response = self.client.post('/api/auth/password/change/', {
            'old_password': 'Antiga123!',
            'new_password': 'Nova123!!',
            'new_password2': 'Nova123!!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_troca_senha_antiga_errada_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/password/change/', {
            'old_password': 'senhaerrada',
            'new_password': 'Nova123!!',
            'new_password2': 'Nova123!!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='reset@example.com')

    def test_reset_email_valido_retorna_200(self):
        response = self.client.post('/api/auth/password/reset/', {'email': 'reset@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_email_nao_cadastrado_retorna_200(self):
        # Resposta genérica para evitar enumeração de contas
        response = self.client.post('/api/auth/password/reset/', {'email': 'naoexiste@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_sem_email_retorna_400(self):
        response = self.client.post('/api/auth/password/reset/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class EmailVerifyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='verify@example.com')

    def test_verificacao_token_invalido_retorna_400(self):
        response = self.client.post('/api/auth/email/verify/', {'token': 'tokeninvalido'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verificacao_sem_token_retorna_400(self):
        response = self.client.post('/api/auth/email/verify/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verificacao_token_valido_retorna_200(self):
        verification = EmailVerification.objects.filter(user=self.user, is_used=False).first()
        if verification:
            response = self.client.post('/api/auth/email/verify/', {'token': verification.token})
            self.assertEqual(response.status_code, status.HTTP_200_OK)

class EmailResendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='resend@example.com')

    def test_reenvio_email_existente_retorna_200(self):
        response = self.client.post('/api/auth/email/resend/', {'email': 'resend@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reenvio_email_invalido_retorna_400(self):
        response = self.client.post('/api/auth/email/resend/', {'email': 'naoexiste@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class AccountDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_deletar_conta_valido_retorna_200(self):
        user = make_user(username='deleteme', password='Deletar123!', email='del@example.com')
        self.client.force_authenticate(user=user)
        response = self.client.delete('/api/auth/account/delete/', {'password': 'Deletar123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_deletar_conta_senha_errada_retorna_400(self):
        user = make_user(username='deleteme2', password='Deletar123!', email='del2@example.com')
        self.client.force_authenticate(user=user)
        response = self.client.delete('/api/auth/account/delete/', {'password': 'senhaerrada'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_deletar_conta_sem_autenticacao_retorna_401(self):
        response = self.client.delete('/api/auth/account/delete/', {'password': 'Deletar123!'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deletar_conta_sem_senha_retorna_400(self):
        user = make_user(username='deleteme3', password='Deletar123!', email='del3@example.com')
        self.client.force_authenticate(user=user)
        response = self.client.delete('/api/auth/account/delete/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class UserManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_admin()
        self.viewer = make_user(username='viewer1', email='viewer1@example.com')

    def test_listar_usuarios_admin_retorna_200(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_listar_usuarios_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_listar_usuarios_sem_autenticacao_retorna_401(self):
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_usuario_admin_retorna_201(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/auth/users/', {
            'username': 'novouser',
            'email': 'novouser@example.com',
            'password': 'NovaSenha123!',
            'role': 'viewer'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_criar_usuario_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.post('/api/auth/users/', {
            'username': 'outro',
            'email': 'outro@example.com',
            'password': 'OutraSenha123!',
            'role': 'viewer'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_usuario_admin_retorna_200(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f'/api/auth/users/{self.viewer.pk}/', {
            'first_name': 'Nome Atualizado'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_editar_usuario_viewer_retorna_403(self):
        self.client.force_authenticate(user=self.viewer)
        response = self.client.patch(f'/api/auth/users/{self.viewer.pk}/', {
            'first_name': 'Tentativa'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_usuario_inexistente_retorna_404(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch('/api/auth/users/99999/', {'first_name': 'Nao Existe'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class UserProfileModelTest(TestCase):
    """Testes para o modelo UserProfile"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_profile_created_on_user_creation(self):
        """Testa se o profile é criado automaticamente via signal"""
        self.assertTrue(hasattr(self.user, 'profile'))
        self.assertIsInstance(self.user.profile, UserProfile)

    def test_profile_defaults(self):
        """Testa valores padrão do profile"""
        self.assertFalse(self.user.profile.is_email_verified)
        self.assertIsNone(self.user.profile.email_verified_at)

    def test_profile_str_representation(self):
        """Testa a representação em string do profile"""
        expected = f"{self.user.username}'s Profile"
        self.assertEqual(str(self.user.profile), expected)

class EmailVerificationModelTest(TestCase):
    """Testes para o modelo EmailVerification"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_email_verification_created_on_user_creation(self):
        """Testa se o token de verificação é criado via signal"""
        tokens = self.user.email_verifications.all()
        self.assertTrue(tokens.exists())

    def test_token_generation(self):
        """Testa geração automática de token"""
        verification = EmailVerification.objects.create(user=self.user)
        self.assertIsNotNone(verification.token)
        token_length = getattr(settings, 'AUTHENTICATION_TOKEN_LENGTH', 64)
        self.assertEqual(len(verification.token), token_length)

    def test_token_uniqueness(self):
        """Testa que tokens são únicos"""
        token1 = EmailVerification.objects.create(user=self.user)
        token2 = EmailVerification.objects.create(user=self.user)
        self.assertNotEqual(token1.token, token2.token)

    def test_expiration_set_automatically(self):
        """Testa que a expiração é definida automaticamente"""
        verification = EmailVerification.objects.create(user=self.user)
        self.assertIsNotNone(verification.expires_at)
        self.assertGreater(verification.expires_at, timezone.now())

    def test_is_expired_method(self):
        """Testa o método is_expired()"""
        # Token válido
        verification = EmailVerification.objects.create(user=self.user)
        self.assertFalse(verification.is_expired())

        # Token expirado
        verification.expires_at = timezone.now() - timedelta(hours=1)
        verification.save()
        self.assertTrue(verification.is_expired())

    def test_is_valid_method(self):
        """Testa o método is_valid()"""
        verification = EmailVerification.objects.create(user=self.user)

        # Token válido
        self.assertTrue(verification.is_valid())

        # Token usado
        verification.is_used = True
        verification.save()
        self.assertFalse(verification.is_valid())

        # Token expirado
        verification.is_used = False
        verification.expires_at = timezone.now() - timedelta(hours=1)
        verification.save()
        self.assertFalse(verification.is_valid())

class PasswordResetTokenModelTest(TestCase):
    """Testes para o modelo PasswordResetToken"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_token_generation(self):
        """Testa geração de token"""
        reset_token = PasswordResetToken.objects.create(
            user=self.user,
            ip_address='127.0.0.1',
            user_agent='TestBrowser/1.0'
        )
        self.assertIsNotNone(reset_token.token)
        token_length = getattr(settings, 'AUTHENTICATION_TOKEN_LENGTH', 64)
        self.assertEqual(len(reset_token.token), token_length)

    def test_ip_and_user_agent_stored(self):
        """Testa que IP e user agent são armazenados"""
        reset_token = PasswordResetToken.objects.create(
            user=self.user,
            ip_address='192.168.1.1',
            user_agent='Mozilla/5.0'
        )
        self.assertEqual(reset_token.ip_address, '192.168.1.1')
        self.assertEqual(reset_token.user_agent, 'Mozilla/5.0')

    def test_is_valid_method(self):
        """Testa validação de token"""
        reset_token = PasswordResetToken.objects.create(user=self.user)
        self.assertTrue(reset_token.is_valid())

        # Token usado
        reset_token.is_used = True
        reset_token.save()
        self.assertFalse(reset_token.is_valid())

    def test_expiration(self):
        """Testa expiração de token"""
        reset_token = PasswordResetToken.objects.create(user=self.user)
        reset_token.expires_at = timezone.now() - timedelta(hours=1)
        reset_token.save()
        self.assertTrue(reset_token.is_expired())

class UserRegistrationSerializerTest(TestCase):
    """Testes para UserRegistrationSerializer"""

    def test_valid_registration_data(self):
        """Testa registro com dados válidos"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch(self):
        """Testa erro quando senhas não coincidem"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'DifferentPass123!',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)

    def test_duplicate_email(self):
        """Testa erro para email duplicado"""
        User.objects.create_user(
            username='existing',
            email='duplicate@example.com',
            password='pass123'
        )
        data = {
            'username': 'newuser',
            'email': 'duplicate@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_duplicate_username(self):
        """Testa erro para username duplicado"""
        User.objects.create_user(
            username='duplicate',
            email='test@example.com',
            password='pass123'
        )
        data = {
            'username': 'duplicate',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

class EmailVerificationSerializerTest(TestCase):
    """Testes para EmailVerificationSerializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )

    def test_valid_token(self):
        """Testa validação de token válido"""
        verification = EmailVerification.objects.create(user=self.user)
        serializer = EmailVerificationSerializer(data={'token': verification.token})
        self.assertTrue(serializer.is_valid())

    def test_invalid_token(self):
        """Testa validação de token inválido"""
        serializer = EmailVerificationSerializer(data={'token': 'invalid_token'})
        self.assertFalse(serializer.is_valid())

    def test_expired_token(self):
        """Testa validação de token expirado"""
        verification = EmailVerification.objects.create(user=self.user)
        verification.expires_at = timezone.now() - timedelta(hours=1)
        verification.save()

        serializer = EmailVerificationSerializer(data={'token': verification.token})
        self.assertFalse(serializer.is_valid())

    def test_used_token(self):
        """Testa validação de token usado"""
        verification = EmailVerification.objects.create(user=self.user)
        verification.is_used = True
        verification.save()

        serializer = EmailVerificationSerializer(data={'token': verification.token})
        self.assertFalse(serializer.is_valid())

    def test_save_marks_email_verified(self):
        """Testa que save() marca o email como verificado"""
        verification = EmailVerification.objects.create(user=self.user)
        serializer = EmailVerificationSerializer(data={'token': verification.token})
        self.assertTrue(serializer.is_valid())

        # Salvar via serializer
        user = serializer.save()

        # Verificar que profile foi atualizado
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.is_email_verified)
        self.assertIsNotNone(user.profile.email_verified_at)

        # Verificar que token foi marcado como usado
        verification.refresh_from_db()
        self.assertTrue(verification.is_used)

class EmailResendSerializerTest(TestCase):
    """Testes para EmailResendSerializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )

    def test_valid_email_unverified(self):
        """Testa validação com email não verificado"""
        serializer = EmailResendSerializer(data={'email': 'test@example.com'})
        self.assertTrue(serializer.is_valid())

    def test_already_verified_email(self):
        """Testa erro para email já verificado"""
        # Marcar como verificado
        self.user.profile.is_email_verified = True
        self.user.profile.save()

        serializer = EmailResendSerializer(data={'email': 'test@example.com'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_nonexistent_email(self):
        """Testa erro para email inexistente"""
        serializer = EmailResendSerializer(data={'email': 'nonexistent@example.com'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

class UtilityFunctionsTest(TestCase):
    """Testes para funções utilitárias"""

    def test_generate_unique_username(self):
        """Testa geração de username único"""
        from .utils import generate_unique_username

        # Criar usuário existente
        User.objects.create_user(
            username='test',
            email='test1@example.com',
            password='pass123'
        )

        # Tentar gerar username para email que colide
        new_username = generate_unique_username('test@example.com')
        self.assertNotEqual(new_username, 'test')
        self.assertTrue(new_username.startswith('test'))

    def test_cleanup_expired_tokens(self):
        """Testa limpeza de tokens expirados"""
        from .utils import cleanup_expired_tokens

        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )

        # Criar tokens expirados
        expired_email = EmailVerification.objects.create(user=user)
        expired_email.expires_at = timezone.now() - timedelta(hours=1)
        expired_email.save()

        expired_password = PasswordResetToken.objects.create(user=user)
        expired_password.expires_at = timezone.now() - timedelta(hours=1)
        expired_password.save()

        # Executar limpeza
        result = cleanup_expired_tokens()

        self.assertGreater(result['email_tokens_deleted'], 0)
        self.assertGreater(result['password_tokens_deleted'], 0)
