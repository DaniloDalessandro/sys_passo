from django.db import models
from django.contrib.auth.models import User

class Conductor(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nome')
    cpf = models.CharField(max_length=14, unique=True, verbose_name='CPF')
    email = models.EmailField(unique=True, verbose_name='Email')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    photo = models.ImageField(upload_to='conductors/', blank=True, null=True, verbose_name='Foto')
    birth_date = models.DateField(verbose_name='Data de Nascimento')
    license_number = models.CharField(max_length=20, unique=True, verbose_name='CNH')
    license_category = models.CharField(max_length=5, choices=[
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
        ('AB', 'Categoria A+B'),
        ('AC', 'Categoria A+C'),
        ('AD', 'Categoria A+D'),
        ('AE', 'Categoria A+E'),
    ], default='B', verbose_name='Categoria da CNH')
    license_expiry_date = models.DateField(verbose_name='Validade da CNH')
    address = models.TextField(blank=True, null=True, verbose_name='Endereço')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='conductor_updates', verbose_name='Atualizado por')

    class Meta:
        verbose_name = 'Condutor'
        verbose_name_plural = 'Condutores'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.cpf}"

    @property
    def is_license_expired(self):
        from django.utils import timezone
        return self.license_expiry_date < timezone.now().date()