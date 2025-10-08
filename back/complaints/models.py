from django.db import models
from django.contrib.auth.models import User
from vehicles.models import Vehicle


class Complaint(models.Model):
    """
    Model para armazenar denúncias feitas pelo site público.

    Este model gerencia denúncias de irregularidades relacionadas a veículos,
    permitindo que o público faça denúncias e que administradores gerenciem
    o fluxo de análise e resolução.
    """

    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_analise', 'Em Análise'),
        ('resolvida', 'Resolvida'),
        ('arquivada', 'Arquivada'),
    ]

    PRIORITY_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    TYPE_CHOICES = [
        ('excesso_velocidade', 'Excesso de Velocidade'),
        ('direcao_perigosa', 'Direção Perigosa'),
        ('uso_celular', 'Uso de Celular ao Dirigir'),
        ('veiculo_mal_conservado', 'Veículo Mal Conservado'),
        ('desrespeito_sinalizacao', 'Desrespeito à Sinalização'),
        ('embriaguez', 'Suspeita de Embriaguez'),
        ('estacionamento_irregular', 'Estacionamento Irregular'),
        ('poluicao_sonora', 'Poluição Sonora'),
        ('poluicao_ambiental', 'Poluição Ambiental'),
        ('outros', 'Outros'),
    ]

    # Dados da denúncia
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints',
        verbose_name='Veículo',
        help_text='Veículo associado à denúncia (preenchido automaticamente se placa existir)'
    )
    vehicle_plate = models.CharField(
        max_length=10,
        verbose_name='Placa do Veículo',
        help_text='Placa informada na denúncia',
        db_index=True
    )
    complaint_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name='Tipo de Denúncia',
        help_text='Categoria da irregularidade denunciada'
    )
    description = models.TextField(
        verbose_name='Descrição da Denúncia',
        help_text='Descrição detalhada do ocorrido (mínimo 20 caracteres)'
    )
    occurrence_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data da Ocorrência',
        help_text='Data em que o fato ocorreu'
    )
    occurrence_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Local da Ocorrência',
        help_text='Endereço ou local onde ocorreu o fato'
    )

    # Dados opcionais do denunciante
    complainant_name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name='Nome do Denunciante',
        help_text='Nome completo do denunciante (opcional)'
    )
    complainant_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name='Email do Denunciante',
        help_text='Email de contato do denunciante (opcional)'
    )
    complainant_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Telefone do Denunciante',
        help_text='Telefone de contato do denunciante (opcional)'
    )
    is_anonymous = models.BooleanField(
        default=False,
        verbose_name='Denúncia Anônima',
        help_text='Indica se a denúncia foi feita anonimamente'
    )

    # Status e gestão
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name='Status',
        help_text='Status atual da denúncia',
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='media',
        verbose_name='Prioridade',
        help_text='Nível de prioridade da denúncia',
        db_index=True
    )

    # Auditoria
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data da Denúncia',
        help_text='Data e hora em que a denúncia foi registrada'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização',
        help_text='Data e hora da última modificação'
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_complaints',
        verbose_name='Avaliado por',
        help_text='Administrador que avaliou a denúncia'
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data da Avaliação',
        help_text='Data e hora em que a denúncia foi avaliada'
    )

    # Resposta/Resolução
    admin_notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observações Internas',
        help_text='Notas e observações internas do administrador (não visível ao público)'
    )
    resolution_notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notas de Resolução',
        help_text='Descrição de como a denúncia foi resolvida'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Denúncia'
        verbose_name_plural = 'Denúncias'
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['vehicle_plate']),
            models.Index(fields=['complaint_type']),
            models.Index(fields=['priority', 'status']),
        ]

    def __str__(self):
        return f"Denúncia #{self.id} - {self.vehicle_plate} - {self.get_complaint_type_display()}"

    def save(self, *args, **kwargs):
        """
        Override do método save para:
        1. Tentar associar veículo automaticamente pela placa
        2. Normalizar placa para uppercase
        3. Determinar se é denúncia anônima
        """
        # Tentar associar veículo automaticamente pela placa
        if not self.vehicle and self.vehicle_plate:
            try:
                self.vehicle = Vehicle.objects.get(plate__iexact=self.vehicle_plate.strip())
            except Vehicle.DoesNotExist:
                pass

        # Normalizar placa (uppercase, sem espaços)
        if self.vehicle_plate:
            self.vehicle_plate = self.vehicle_plate.upper().strip().replace(' ', '')

        # Determinar se é denúncia anônima
        if not self.complainant_name and not self.complainant_email and not self.complainant_phone:
            self.is_anonymous = True

        super().save(*args, **kwargs)

    def clean(self):
        """Validações customizadas do modelo"""
        from django.core.exceptions import ValidationError

        # Validar descrição mínima
        if self.description and len(self.description) < 20:
            raise ValidationError({
                'description': 'A descrição deve ter pelo menos 20 caracteres.'
            })

        # Validar placa
        if self.vehicle_plate:
            plate_clean = self.vehicle_plate.upper().strip().replace(' ', '')
            if len(plate_clean) < 7:
                raise ValidationError({
                    'vehicle_plate': 'Placa inválida. Deve conter pelo menos 7 caracteres.'
                })
