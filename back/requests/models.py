from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from conductors.models import Conductor
from vehicles.models import Vehicle
import datetime


class DriverRequest(models.Model):
    """
    Model para solicitações de cadastro de motoristas/condutores.

    Este model armazena as solicitações enviadas pelo site público
    e permite que administradores aprovem ou reprovem os cadastros.
    """

    CNH_CATEGORY_CHOICES = [
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('AB', 'Categoria AB'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
    ]

    STATUS_CHOICES = [
        ('em_analise', 'Em Análise'),
        ('aprovado', 'Aprovado'),
        ('reprovado', 'Reprovado'),
    ]

    # Dados do solicitante
    full_name = models.CharField(
        max_length=150,
        verbose_name='Nome Completo',
        help_text='Nome completo do condutor'
    )
    cpf = models.CharField(
        max_length=14,
        verbose_name='CPF',
        help_text='CPF do condutor (somente números)',
        db_index=True
    )
    email = models.EmailField(
        verbose_name='E-mail',
        help_text='E-mail de contato do condutor'
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone',
        help_text='Telefone de contato com DDD'
    )
    cnh_number = models.CharField(
        max_length=20,
        verbose_name='Número da CNH',
        help_text='Número de registro da Carteira Nacional de Habilitação'
    )
    cnh_category = models.CharField(
        max_length=2,
        choices=CNH_CATEGORY_CHOICES,
        verbose_name='Categoria da CNH',
        help_text='Categoria da habilitação do condutor'
    )
    message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensagem',
        help_text='Mensagem ou observações adicionais do solicitante'
    )

    # Status e controle
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='em_analise',
        verbose_name='Status da Solicitação',
        db_index=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação',
        help_text='Data e hora em que a solicitação foi criada'
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Revisão',
        help_text='Data e hora em que a solicitação foi aprovada ou reprovada'
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='driver_requests_reviewed',
        verbose_name='Revisado por',
        help_text='Usuário que aprovou ou reprovou a solicitação'
    )
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name='Motivo da Reprovação',
        help_text='Justificativa para reprovação da solicitação'
    )

    # Relacionamento com o condutor criado
    conductor = models.OneToOneField(
        Conductor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='driver_request',
        verbose_name='Condutor Criado',
        help_text='Condutor criado a partir desta solicitação'
    )

    class Meta:
        verbose_name = 'Solicitação de Motorista'
        verbose_name_plural = 'Solicitações de Motoristas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['cpf', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['cpf'],
                condition=models.Q(status='em_analise'),
                name='unique_cpf_pending_driver'
            )
        ]

    def __str__(self):
        return f"{self.full_name} - {self.cpf} ({self.get_status_display()})"

    def clean(self):
        """Validação adicional do model"""
        from django.core.exceptions import ValidationError

        # Validar que rejection_reason é obrigatório quando status é 'reprovado'
        if self.status == 'reprovado' and not self.rejection_reason:
            raise ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        # Normalizar CPF (remover pontos e traços)
        if self.cpf:
            self.cpf = ''.join(filter(str.isdigit, self.cpf))

    def save(self, *args, **kwargs):
        """Override do save para normalizar dados antes de salvar"""
        # Executar validações
        self.full_clean()
        super().save(*args, **kwargs)


class VehicleRequest(models.Model):
    """
    Model para solicitações de cadastro de veículos.

    Este model armazena as solicitações enviadas pelo site público
    e permite que administradores aprovem ou reprovem os cadastros.
    """

    FUEL_TYPE_CHOICES = [
        ('gasoline', 'Gasolina'),
        ('ethanol', 'Etanol'),
        ('flex', 'Flex'),
        ('diesel', 'Diesel'),
        ('electric', 'Elétrico'),
        ('hybrid', 'Híbrido'),
    ]

    STATUS_CHOICES = [
        ('em_analise', 'Em Análise'),
        ('aprovado', 'Aprovado'),
        ('reprovado', 'Reprovado'),
    ]

    # Dados do veículo
    plate = models.CharField(
        max_length=10,
        verbose_name='Placa',
        help_text='Placa do veículo (7 caracteres)',
        db_index=True
    )
    brand = models.CharField(
        max_length=50,
        verbose_name='Marca',
        help_text='Marca do veículo (ex: Toyota, Volkswagen)'
    )
    model = models.CharField(
        max_length=100,
        verbose_name='Modelo',
        help_text='Modelo do veículo (ex: Corolla, Gol)'
    )
    year = models.IntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(datetime.datetime.now().year + 1)
        ],
        verbose_name='Ano',
        help_text='Ano de fabricação do veículo'
    )
    color = models.CharField(
        max_length=30,
        verbose_name='Cor',
        help_text='Cor do veículo'
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FUEL_TYPE_CHOICES,
        verbose_name='Tipo de Combustível',
        help_text='Tipo de combustível utilizado pelo veículo'
    )
    message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensagem',
        help_text='Mensagem ou observações adicionais do solicitante'
    )

    # Status e controle
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='em_analise',
        verbose_name='Status da Solicitação',
        db_index=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação',
        help_text='Data e hora em que a solicitação foi criada'
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Revisão',
        help_text='Data e hora em que a solicitação foi aprovada ou reprovada'
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehicle_requests_reviewed',
        verbose_name='Revisado por',
        help_text='Usuário que aprovou ou reprovou a solicitação'
    )
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name='Motivo da Reprovação',
        help_text='Justificativa para reprovação da solicitação'
    )

    # Relacionamento com o veículo criado
    vehicle = models.OneToOneField(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehicle_request',
        verbose_name='Veículo Criado',
        help_text='Veículo criado a partir desta solicitação'
    )

    class Meta:
        verbose_name = 'Solicitação de Veículo'
        verbose_name_plural = 'Solicitações de Veículos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['plate', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['plate'],
                condition=models.Q(status='em_analise'),
                name='unique_plate_pending_vehicle'
            )
        ]

    def __str__(self):
        return f"{self.brand} {self.model} - {self.plate} ({self.get_status_display()})"

    def clean(self):
        """Validação adicional do model"""
        from django.core.exceptions import ValidationError

        # Validar que rejection_reason é obrigatório quando status é 'reprovado'
        if self.status == 'reprovado' and not self.rejection_reason:
            raise ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        # Normalizar placa (uppercase, sem espaços)
        if self.plate:
            self.plate = self.plate.upper().strip().replace(' ', '')

    def save(self, *args, **kwargs):
        """Override do save para normalizar dados antes de salvar"""
        # Executar validações
        self.full_clean()
        super().save(*args, **kwargs)
