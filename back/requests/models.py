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

    Armazena os dados enviados pelo site público até que sejam analisados.
    Os campos espelham o model ``Conductor`` para permitir aprovação direta.
    """

    CNH_CATEGORY_CHOICES = [
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('AB', 'Categoria AB'),
        ('AC', 'Categoria AC'),
        ('AD', 'Categoria AD'),
        ('AE', 'Categoria AE'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
    ]

    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]

    STATUS_CHOICES = [
        ('em_analise', 'Em Análise'),
        ('aprovado', 'Aprovado'),
        ('reprovado', 'Reprovado'),
    ]

    # Protocolo único
    protocol = models.CharField(
        max_length=12,
        unique=True,
        editable=False,
        null=True,
        blank=True,
        verbose_name='Protocolo',
        help_text='Protocolo gerado automaticamente (formato: DRV-YYYYNNNN)',
        db_index=True
    )

    # Dados pessoais
    name = models.CharField(
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
    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Data de Nascimento',
        help_text='Data de nascimento do condutor'
    )
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        default='M',
        verbose_name='Sexo',
        help_text='Sexo do condutor'
    )
    nationality = models.CharField(
        max_length=50,
        default='Brasileira',
        verbose_name='Nacionalidade',
        help_text='Nacionalidade do condutor'
    )

    # Endereço
    street = models.CharField(
        max_length=200,
        default='',
        blank=True,
        verbose_name='Rua/Avenida',
        help_text='Rua ou avenida do endereço'
    )
    number = models.CharField(
        max_length=20,
        default='',
        blank=True,
        verbose_name='Número',
        help_text='Número do endereço'
    )
    neighborhood = models.CharField(
        max_length=100,
        default='',
        blank=True,
        verbose_name='Bairro',
        help_text='Bairro do endereço'
    )
    city = models.CharField(
        max_length=100,
        default='',
        blank=True,
        verbose_name='Cidade',
        help_text='Cidade do endereço'
    )
    reference_point = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Ponto de Referência',
        help_text='Referência adicional do endereço'
    )

    # Contato
    email = models.EmailField(
        verbose_name='E-mail',
        help_text='E-mail de contato do condutor'
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone',
        help_text='Telefone de contato com DDD'
    )
    whatsapp = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='WhatsApp',
        help_text='WhatsApp do condutor (opcional)'
    )

    # CNH
    license_number = models.CharField(
        max_length=20,
        verbose_name='Número da CNH',
        help_text='Número de registro da Carteira Nacional de Habilitação'
    )
    license_category = models.CharField(
        max_length=5,
        choices=CNH_CATEGORY_CHOICES,
        verbose_name='Categoria da CNH',
        help_text='Categoria da habilitação do condutor'
    )
    license_expiry_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Validade da CNH',
        help_text='Data de validade da CNH'
    )

    # Documentos
    document = models.FileField(
        upload_to='requests/driver/documents/',
        blank=True,
        null=True,
        verbose_name='Documento do Condutor (PDF)',
        help_text='Documento de identificação (opcional)'
    )
    cnh_digital = models.FileField(
        upload_to='requests/driver/cnh/',
        blank=True,
        null=True,
        verbose_name='CNH Digital (PDF)',
        help_text='CNH digitalizada (opcional)'
    )
    photo = models.ImageField(
        upload_to='requests/driver/photos/',
        blank=True,
        null=True,
        verbose_name='Foto (JPG/PNG)',
        help_text='Foto do motorista (opcional)'
    )

    message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensagem',
        help_text='Observações adicionais do solicitante'
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
    viewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Visualização',
        help_text='Data e hora em que a solicitação foi visualizada pela primeira vez'
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
        return f"{self.name} - {self.cpf} ({self.get_status_display()})"

    def clean(self):
        """Normaliza valores sensíveis antes de salvar."""
        super().clean()
        if self.cpf:
            self.cpf = ''.join(filter(str.isdigit, self.cpf))
        if self.phone:
            self.phone = self.phone.strip()
        if self.whatsapp:
            self.whatsapp = self.whatsapp.strip()
        if self.license_number:
            self.license_number = self.license_number.strip()

    def _generate_protocol(self):
        """
        Gera protocolo automaticamente no formato DRV-YYYYNNNN.

        Returns:
            str: Protocolo único no formato DRV-ano + 4 dígitos sequenciais
        """
        from django.db.models import Max

        current_year = timezone.now().year
        year_prefix = f"DRV-{current_year}"

        # Buscar o último protocolo do ano atual
        last_request = DriverRequest.objects.filter(
            protocol__startswith=year_prefix
        ).aggregate(Max('protocol'))

        last_protocol = last_request['protocol__max']

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
        # Gerar protocolo se não existir
        if not self.protocol:
            self.protocol = self._generate_protocol()

        self.full_clean(exclude=None)
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

    CATEGORY_CHOICES = [
        ('Van', 'Van'),
        ('Caminhão', 'Caminhão'),
        ('Ônibus', 'Ônibus'),
        ('Carreta', 'Carreta'),
        ('Carro', 'Carro'),
    ]

    STATUS_CHOICES = [
        ('em_analise', 'Em Análise'),
        ('aprovado', 'Aprovado'),
        ('reprovado', 'Reprovado'),
    ]

    # Protocolo único
    protocol = models.CharField(
        max_length=12,
        unique=True,
        editable=False,
        null=True,
        blank=True,
        verbose_name='Protocolo',
        help_text='Protocolo gerado automaticamente (formato: VHC-YYYYNNNN)',
        db_index=True
    )

    # Dados básicos do veículo
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

    # Dados técnicos
    chassis_number = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name='Chassi',
        help_text='Número do chassi do veículo'
    )
    renavam = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name='RENAVAM',
        help_text='Número do RENAVAM'
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FUEL_TYPE_CHOICES,
        verbose_name='Tipo de Combustível',
        help_text='Tipo de combustível utilizado pelo veículo'
    )

    # Categoria e capacidade
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='Van',
        verbose_name='Categoria',
        help_text='Categoria do veículo'
    )
    passenger_capacity = models.PositiveIntegerField(
        default=5,
        verbose_name='Capacidade de Passageiros',
        help_text='Número de passageiros que o veículo comporta'
    )

    # Fotos do veículo
    photo_1 = models.ImageField(
        upload_to='requests/vehicle/photos/',
        blank=True,
        null=True,
        verbose_name='Foto 1',
        help_text='Foto do veículo (opcional)'
    )
    photo_2 = models.ImageField(
        upload_to='requests/vehicle/photos/',
        blank=True,
        null=True,
        verbose_name='Foto 2',
        help_text='Foto do veículo (opcional)'
    )
    photo_3 = models.ImageField(
        upload_to='requests/vehicle/photos/',
        blank=True,
        null=True,
        verbose_name='Foto 3',
        help_text='Foto do veículo (opcional)'
    )
    photo_4 = models.ImageField(
        upload_to='requests/vehicle/photos/',
        blank=True,
        null=True,
        verbose_name='Foto 4',
        help_text='Foto do veículo (opcional)'
    )
    photo_5 = models.ImageField(
        upload_to='requests/vehicle/photos/',
        blank=True,
        null=True,
        verbose_name='Foto 5',
        help_text='Foto do veículo (opcional)'
    )

    message = models.TextField(
        blank=True,
        null=True,
        verbose_name='Mensagem',
        help_text='Mensagem ou observações adicionais do solicitante'
    )

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
    viewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Visualização',
        help_text='Data e hora em que a solicitação foi visualizada pela primeira vez'
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
        """Validação adicional do model."""
        from django.core.exceptions import ValidationError

        if self.status == 'reprovado' and not self.rejection_reason:
            raise ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        if self.plate:
            self.plate = self.plate.upper().strip().replace(' ', '')

    def _generate_protocol(self):
        """
        Gera protocolo automaticamente no formato VHC-YYYYNNNN.

        Returns:
            str: Protocolo único no formato VHC-ano + 4 dígitos sequenciais
        """
        from django.db.models import Max
        from django.utils import timezone

        current_year = timezone.now().year
        year_prefix = f"VHC-{current_year}"

        # Buscar o último protocolo do ano atual
        last_request = VehicleRequest.objects.filter(
            protocol__startswith=year_prefix
        ).aggregate(Max('protocol'))

        last_protocol = last_request['protocol__max']

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
        # Gerar protocolo se não existir
        if not self.protocol:
            self.protocol = self._generate_protocol()

        self.full_clean(exclude=None)
        super().save(*args, **kwargs)
