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
        ('proposto', 'Proposto'),
        ('em_analise', 'Em Análise'),
        ('concluido', 'Concluído'),
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
    protocol = models.CharField(
        max_length=12,
        unique=True,
        editable=False,
        null=True,
        blank=True,
        verbose_name='Protocolo',
        help_text='Protocolo gerado automaticamente (formato: CMP-YYYYNNNN)',
        db_index=True
    )
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
        default='proposto',
        verbose_name='Status',
        help_text='Status atual da denúncia',
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
        ]

    def __str__(self):
        return f"Denúncia #{self.id} - {self.vehicle_plate} - {self.get_complaint_type_display()}"

    def _generate_protocol(self):
        """
        Gera protocolo automaticamente no formato CMP-YYYYNNNN.

        Returns:
            str: Protocolo único no formato CMP-ano + 4 dígitos sequenciais
        """
        from django.utils import timezone
        from django.db.models import Max

        current_year = timezone.now().year
        year_prefix = f"CMP-{current_year}"

        # Buscar o último protocolo do ano atual
        last_complaint = Complaint.objects.filter(
            protocol__startswith=year_prefix
        ).aggregate(Max('protocol'))

        last_protocol = last_complaint['protocol__max']

        if last_protocol:
            # Extrair o número sequencial do último protocolo
            last_number = int(last_protocol[-4:])  # Pega os 4 últimos dígitos
            new_number = last_number + 1
        else:
            # Primeiro protocolo do ano
            new_number = 1

        # Formatar com 4 dígitos (ex: 0001, 0002, etc)
        protocol = f"{year_prefix}{new_number:04d}"

        return protocol

    def save(self, *args, **kwargs):
        """
        Override do método save para:
        1. Gerar protocolo automaticamente se não existir
        2. Tentar associar veículo automaticamente pela placa
        3. Normalizar placa para uppercase
        4. Determinar se é denúncia anônima
        """
        # Gerar protocolo se não existir
        if not self.protocol:
            self.protocol = self._generate_protocol()

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


class ComplaintPhoto(models.Model):
    """
    Model para armazenar fotos anexadas às denúncias.

    Cada denúncia pode ter até 5 fotos associadas.
    """

    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name='Denúncia',
        help_text='Denúncia a qual esta foto pertence'
    )
    photo = models.ImageField(
        upload_to='complaints/photos/%Y/%m/%d/',
        verbose_name='Foto',
        help_text='Foto da denúncia (máximo 5 fotos por denúncia)'
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data do Upload',
        help_text='Data e hora em que a foto foi enviada'
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name='Ordem',
        help_text='Ordem de exibição da foto'
    )

    class Meta:
        ordering = ['order', 'uploaded_at']
        verbose_name = 'Foto da Denúncia'
        verbose_name_plural = 'Fotos das Denúncias'

    def __str__(self):
        return f"Foto #{self.order + 1} - Denúncia #{self.complaint.id}"
