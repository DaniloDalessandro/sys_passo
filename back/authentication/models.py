from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings
import secrets
import string
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


class EmailVerification(models.Model):
    """
    Model para gerenciar tokens de verificação de e-mail.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False, db_index=True)
    expires_at = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"Email verification for {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(seconds=settings.EMAIL_VERIFICATION_TIMEOUT)
        super().save(*args, **kwargs)

    @staticmethod
    def generate_token():
        """Gera um token aleatório seguro."""
        token_length = getattr(settings, 'AUTHENTICATION_TOKEN_LENGTH', 64)
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(token_length))

    def is_expired(self):
        """Verifica se o token expirou."""
        return timezone.now() > self.expires_at

    def is_valid(self):
        """Verifica se o token é válido (não utilizado e não expirado)."""
        return not self.is_used and not self.is_expired()

    class Meta:
        db_table = 'email_verifications'
        ordering = ['-created_at']


class PasswordResetToken(models.Model):
    """
    Model para gerenciar tokens de redefinição de senha.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Password reset for {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT)
        super().save(*args, **kwargs)

    @staticmethod
    def generate_token():
        """Gera um token aleatório seguro."""
        token_length = getattr(settings, 'AUTHENTICATION_TOKEN_LENGTH', 64)
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(token_length))

    def is_expired(self):
        """Verifica se o token expirou."""
        return timezone.now() > self.expires_at

    def is_valid(self):
        """Verifica se o token é válido (não utilizado e não expirado)."""
        return not self.is_used and not self.is_expired()

    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']


class UserProfile(models.Model):
    """
    Perfil estendido do usuário para armazenar informações adicionais.
    """

    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('approver', 'Aprovador'),
        ('viewer', 'Visualizador'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='viewer',
        verbose_name='Papel',
        db_index=True
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def is_admin_role(self) -> bool:
        """Retorna True se o usuário é admin ou superuser."""
        return self.role == 'admin' or self.user.is_superuser

    @property
    def is_approver_or_admin(self) -> bool:
        """Retorna True se o usuário é admin, aprovador ou superuser."""
        return self.role in ('admin', 'approver') or self.user.is_superuser

    class Meta:
        db_table = 'user_profiles'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Cria UserProfile e EmailVerification ao criar um novo usuário.
    """
    if created:
        try:
            UserProfile.objects.create(
                user=instance,
                is_email_verified=False
            )
            EmailVerification.objects.create(user=instance)
        except Exception as e:
            logger.error(f"Falha ao criar perfil/verificação para o usuário {instance.username}: {e}")