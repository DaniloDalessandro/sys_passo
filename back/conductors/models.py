from django.db import models
from django.contrib.auth.models import User

class Conductor(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]

    LICENSE_CATEGORY_CHOICES = [
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
        ('AB', 'Categoria A+B'),
        ('AC', 'Categoria A+C'),
        ('AD', 'Categoria A+D'),
        ('AE', 'Categoria A+E'),
    ]

    # Dados Pessoais
    name = models.CharField(max_length=150, verbose_name='Nome Completo')
    cpf = models.CharField(max_length=14, unique=True, verbose_name='CPF')
    birth_date = models.DateField(verbose_name='Data de Nascimento')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M', verbose_name='Sexo')
    nationality = models.CharField(max_length=50, default='Brasileira', verbose_name='Nacionalidade')

    # Endereço
    street = models.CharField(max_length=200, default='', verbose_name='Rua/Avenida')
    number = models.CharField(max_length=20, default='', verbose_name='Número')
    neighborhood = models.CharField(max_length=100, default='', verbose_name='Bairro')
    city = models.CharField(max_length=100, default='', verbose_name='Cidade')
    reference_point = models.CharField(max_length=200, blank=True, null=True, verbose_name='Ponto de Referência')

    # Contato
    phone = models.CharField(max_length=20, default='', verbose_name='Telefone/Celular')
    email = models.EmailField(unique=True, verbose_name='E-mail')
    whatsapp = models.CharField(max_length=20, blank=True, null=True, verbose_name='WhatsApp')

    # CNH
    license_number = models.CharField(max_length=20, unique=True, verbose_name='Número da CNH')
    license_category = models.CharField(
        max_length=5,
        choices=LICENSE_CATEGORY_CHOICES,
        default='B',
        verbose_name='Categoria da CNH'
    )
    license_expiry_date = models.DateField(verbose_name='Validade da CNH')

    # Arquivos
    document = models.FileField(upload_to='conductors/documents/', blank=True, null=True, verbose_name='Documento do Condutor (PDF)')
    cnh_digital = models.FileField(upload_to='conductors/cnh/', blank=True, null=True, verbose_name='CNH Digital (PDF)')
    photo = models.ImageField(upload_to='conductors/photos/', blank=True, null=True, verbose_name='Foto 1 (JPG/PNG)')
    
    # Controle
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