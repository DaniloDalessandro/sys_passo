import datetime
import logging
import re

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from conductors.models import Conductor
from conductors.serializers import validate_text_field
from vehicles.models import Vehicle
from .models import DriverRequest, VehicleRequest

logger = logging.getLogger(__name__)


class UserNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do usuário revisor."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class ConductorNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do condutor criado."""

    class Meta:
        model = Conductor
        fields = [
            'id',
            'name',
            'cpf',
            'email',
            'phone',
            'license_number',
            'license_category',
            'is_active',
        ]
        read_only_fields = fields


class VehicleNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do veículo criado."""

    class Meta:
        model = Vehicle
        fields = ['id', 'plate', 'brand', 'model', 'year', 'color', 'fuel_type', 'is_active']
        read_only_fields = fields


# ========== DRIVER REQUEST SERIALIZERS ==========


class DriverRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de solicitações de motoristas (site público)."""

    class Meta:
        model = DriverRequest
        fields = [
            'name',
            'cpf',
            'birth_date',
            'gender',
            'nationality',
            'street',
            'number',
            'neighborhood',
            'city',
            'reference_point',
            'email',
            'phone',
            'whatsapp',
            'license_number',
            'license_category',
            'license_expiry_date',
            'document',
            'cnh_digital',
            'photo',
            'message',
        ]
        extra_kwargs = {
            'reference_point': {'required': False, 'allow_null': True, 'allow_blank': True},
            'whatsapp': {'required': False, 'allow_null': True, 'allow_blank': True},
            'document': {'required': False, 'allow_null': True},
            'cnh_digital': {'required': False, 'allow_null': True},
            'photo': {'required': False, 'allow_null': True},
            'message': {'required': False, 'allow_null': True},
        }

    # ---- Validações de campos ----

    def validate_name(self, value):
        return validate_text_field(value, 'nome')

    def validate_nationality(self, value):
        return validate_text_field(value, 'nacionalidade')

    def validate_street(self, value):
        return validate_text_field(value, 'rua/avenida')

    def validate_number(self, value):
        return validate_text_field(value, 'número')

    def validate_neighborhood(self, value):
        return validate_text_field(value, 'bairro')

    def validate_city(self, value):
        return validate_text_field(value, 'cidade')

    def validate_reference_point(self, value):
        if value:
            return validate_text_field(value, 'ponto de referência')
        return value

    def validate_cpf(self, value):
        cpf_cleaned = re.sub(r'[^0-9]', '', value or '')

        if len(cpf_cleaned) != 11:
            raise serializers.ValidationError('O CPF deve conter exatamente 11 dígitos.')

        if cpf_cleaned == cpf_cleaned[0] * 11:
            raise serializers.ValidationError('O CPF informado não é válido.')

        if DriverRequest.objects.filter(cpf=cpf_cleaned, status='em_analise').exists():
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise para este CPF. Aguarde a aprovação ou reprovação.'
            )

        return cpf_cleaned

    def validate_email(self, value):
        email = (value or '').strip().lower()

        if DriverRequest.objects.filter(email=email, status='em_analise').exists():
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise com este e-mail. Aguarde a aprovação ou reprovação.'
            )

        return email

    def validate_birth_date(self, value):
        if value is None:
            raise serializers.ValidationError('Data de nascimento é obrigatória.')

        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError('O condutor deve ter pelo menos 18 anos.')

        return value

    def validate_license_expiry_date(self, value):
        if value is None:
            raise serializers.ValidationError('A data de validade da CNH é obrigatória.')

        if value < timezone.now().date():
            raise serializers.ValidationError('A data de validade da CNH não pode estar no passado.')

        return value

    def validate_license_category(self, value):
        valid_categories = [choice[0] for choice in DriverRequest.CNH_CATEGORY_CHOICES]
        if value not in valid_categories:
            raise serializers.ValidationError(
                f'Categoria de CNH inválida. Categorias válidas: {", ".join(valid_categories)}'
            )
        return value

    def validate_license_number(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            raise serializers.ValidationError('O número da CNH é obrigatório.')
        return cleaned

    def validate_phone(self, value):
        phone = (value or '').strip()
        if len(re.sub(r'[^0-9]', '', phone)) < 10:
            raise serializers.ValidationError('Telefone inválido. Informe DDD e número.')
        return phone

    def validate_whatsapp(self, value):
        if value:
            phone = value.strip()
            if len(re.sub(r'[^0-9]', '', phone)) < 10:
                raise serializers.ValidationError('WhatsApp inválido. Informe DDD e número.')
            return phone
        return value

    def create(self, validated_data):
        logger.info("Nova solicitação de motorista criada: CPF %s", validated_data.get('cpf'))
        return super().create(validated_data)


class DriverRequestListSerializer(serializers.ModelSerializer):
    """Serializer para listagem e detalhes das solicitações de motoristas."""

    reviewed_by = UserNestedSerializer(read_only=True)
    conductor = ConductorNestedSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    license_category_display = serializers.CharField(source='get_license_category_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    address = serializers.SerializerMethodField()

    class Meta:
        model = DriverRequest
        fields = [
            'id',
            'name',
            'cpf',
            'birth_date',
            'gender',
            'gender_display',
            'nationality',
            'street',
            'number',
            'neighborhood',
            'city',
            'reference_point',
            'address',
            'email',
            'phone',
            'whatsapp',
            'license_number',
            'license_category',
            'license_category_display',
            'license_expiry_date',
            'document',
            'cnh_digital',
            'photo',
            'message',
            'status',
            'status_display',
            'created_at',
            'viewed_at',
            'reviewed_at',
            'reviewed_by',
            'rejection_reason',
            'conductor',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'viewed_at',
            'reviewed_at',
            'reviewed_by',
            'conductor',
        ]

    def get_address(self, obj):
        parts = [item for item in [obj.street, obj.number, obj.neighborhood, obj.city] if item]
        return ', '.join(parts)


class DriverRequestActionSerializer(serializers.Serializer):
    """
    Serializer para ações de aprovação/reprovação de solicitações de motoristas.
    """

    status = serializers.ChoiceField(choices=['aprovado', 'reprovado'], required=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate(self, data):
        status = data.get('status')
        rejection_reason = data.get('rejection_reason', '').strip()

        if status == 'reprovado' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        return data


# ========== VEHICLE REQUEST SERIALIZERS ==========


class VehicleRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de solicitações de veículos (site público).

    Validações:
    - Placa deve ter 7 caracteres (formato brasileiro ou Mercosul)
    - Ano deve estar entre 1900 e ano atual + 1
    - Tipo de combustível deve ser válido
    """

    class Meta:
        model = VehicleRequest
        fields = [
            'plate',
            'brand',
            'model',
            'year',
            'color',
            'chassis_number',
            'renavam',
            'fuel_type',
            'category',
            'passenger_capacity',
            'photo_1',
            'photo_2',
            'photo_3',
            'photo_4',
            'photo_5',
            'message',
        ]

    def validate_plate(self, value):
        """
        Valida e normaliza a placa do veículo.
        """
        plate_cleaned = value.upper().replace('-', '').replace(' ', '')

        brazilian_pattern = r'^[A-Z]{3}[0-9]{4}$'  # AAA1234
        mercosul_pattern = r'^[A-Z]{3}[0-9][A-Z][0-9]{2}$'  # AAA1A23

        if not (re.match(brazilian_pattern, plate_cleaned) or re.match(mercosul_pattern, plate_cleaned)):
            raise serializers.ValidationError(
                'Formato de placa inválido. Use o formato brasileiro (AAA1234) ou Mercosul (AAA1A23).'
            )

        if VehicleRequest.objects.filter(plate=plate_cleaned, status='em_analise').exists():
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise para esta placa. Aguarde a aprovação ou reprovação.'
            )

        return plate_cleaned

    def validate_year(self, value):
        """
        Valida se o ano está entre 1900 e ano atual + 1.
        """
        current_year = datetime.datetime.now().year

        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError(
                f'O ano deve estar entre 1900 e {current_year + 1}.'
            )

        return value

    def validate_fuel_type(self, value):
        """
        Valida se o tipo de combustível é válido.
        """
        valid_fuel_types = ['gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid']

        if value not in valid_fuel_types:
            raise serializers.ValidationError(
                f'Tipo de combustível inválido. Tipos válidos: {", ".join(valid_fuel_types)}'
            )

        return value

    def create(self, validated_data):
        logger.info("Nova solicitação de veículo criada: placa %s", validated_data.get('plate'))
        return super().create(validated_data)


class VehicleRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de solicitações de veículos (admin).

    Inclui dados aninhados do revisor e do veículo criado.
    """

    reviewed_by = UserNestedSerializer(read_only=True)
    vehicle = VehicleNestedSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = VehicleRequest
        fields = [
            'id',
            'plate',
            'brand',
            'model',
            'year',
            'color',
            'chassis_number',
            'renavam',
            'fuel_type',
            'fuel_type_display',
            'category',
            'category_display',
            'passenger_capacity',
            'photo_1',
            'photo_2',
            'photo_3',
            'photo_4',
            'photo_5',
            'message',
            'status',
            'status_display',
            'created_at',
            'viewed_at',
            'reviewed_at',
            'reviewed_by',
            'rejection_reason',
            'vehicle',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'viewed_at',
            'reviewed_at',
            'reviewed_by',
            'vehicle',
        ]


class VehicleRequestActionSerializer(serializers.Serializer):
    """
    Serializer para ações de aprovação/reprovação de solicitações de veículos.

    Validações:
    - rejection_reason é obrigatório se status for 'reprovado'
    """

    status = serializers.ChoiceField(choices=['aprovado', 'reprovado'], required=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate(self, data):
        status = data.get('status')
        rejection_reason = data.get('rejection_reason', '').strip()

        if status == 'reprovado' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        return data
