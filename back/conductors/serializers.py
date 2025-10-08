import re
import unicodedata
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Conductor
from django.utils import timezone


class VehicleDetailSerializer(serializers.Serializer):
    """Serializer for vehicle details in conductor view"""
    id = serializers.IntegerField()
    modelo = serializers.CharField(source='model')
    marca = serializers.CharField(source='brand')
    placa = serializers.CharField(source='plate')
    cor = serializers.CharField(source='color')


def validate_text_field(value, field_name):
    """
    Validates that text field contains only valid UTF-8 characters.
    """
    if not value:
        return value

    try:
        # Normalize text to ensure proper encoding
        normalized = unicodedata.normalize('NFC', str(value))

        # Check if the text can be properly encoded/decoded
        normalized.encode('utf-8').decode('utf-8')

        return normalized.strip()
    except (UnicodeError, UnicodeDecodeError, UnicodeEncodeError):
        raise serializers.ValidationError(
            f"O campo {field_name} contém caracteres inválidos. "
            f"Use apenas caracteres UTF-8 válidos."
        )


class ConductorBaseSerializer(serializers.ModelSerializer):
    def validate_cpf(self, value):
        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        
        # Verifica se todos os dígitos são iguais (CPF inválido)
        if cpf == cpf[0] * 11:
            raise serializers.ValidationError("CPF inválido.")
        
        # Validação do primeiro dígito verificador
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digito1 = (soma * 10) % 11
        if digito1 == 10:
            digito1 = 0
        if int(cpf[9]) != digito1:
            raise serializers.ValidationError("CPF inválido.")
        
        # Validação do segundo dígito verificador
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digito2 = (soma * 10) % 11
        if digito2 == 10:
            digito2 = 0
        if int(cpf[10]) != digito2:
            raise serializers.ValidationError("CPF inválido.")
        
        return value

    def validate_license_expiry_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade da CNH não pode estar no passado.")
        return value

    def validate_birth_date(self, value):
        # Verifica se a pessoa tem pelo menos 18 anos
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("O condutor deve ter pelo menos 18 anos.")
        return value

    def get_address(self, obj):
        """Combine address fields into a single address string for frontend compatibility"""
        address_parts = []
        if obj.street:
            address_parts.append(obj.street)
        if obj.number:
            address_parts.append(obj.number)
        if obj.neighborhood:
            address_parts.append(obj.neighborhood)
        if obj.city:
            address_parts.append(obj.city)
        return ', '.join(address_parts) if address_parts else ''


class ConductorSerializer(ConductorBaseSerializer):
    is_license_expired = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    vehicles = VehicleDetailSerializer(many=True, read_only=True)
    address = serializers.SerializerMethodField()
    photo = serializers.FileField(source='document', read_only=True)

    class Meta:
        model = Conductor
        fields = [
            'id', 'name', 'cpf', 'birth_date', 'gender', 'gender_display', 'nationality',
            'street', 'number', 'neighborhood', 'city', 'reference_point', 'address', 'phone', 'email', 'whatsapp',
            'license_number', 'license_category', 'license_expiry_date',
            'photo', 'document', 'cnh_digital', 'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_username', 'updated_by', 'updated_by_username',
            'is_license_expired', 'vehicles'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']


class ConductorCreateSerializer(ConductorBaseSerializer):
    class Meta:
        model = Conductor
        fields = [
            'name', 'cpf', 'birth_date', 'gender', 'nationality',
            'street', 'number', 'neighborhood', 'city', 'reference_point', 'phone', 'email', 'whatsapp',
            'license_number', 'license_category', 'license_expiry_date',
            'document', 'cnh_digital', 'is_active'
        ]
        extra_kwargs = {
            'email': {'validators': [UniqueValidator(queryset=Conductor.objects.all(), message="Condutor com este E-mail já existe.")]},
            'license_number': {'validators': [UniqueValidator(queryset=Conductor.objects.all(), message="Condutor com este Número da CNH já existe.")]},
            'cpf': {'validators': [UniqueValidator(queryset=Conductor.objects.all(), message="Condutor com este CPF já existe.")]},
        }

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


class ConductorUpdateSerializer(ConductorBaseSerializer):
    class Meta:
        model = Conductor
        fields = [
            'name', 'birth_date', 'gender', 'nationality',
            'street', 'number', 'neighborhood', 'city', 'reference_point', 'phone', 'email', 'whatsapp',
            'license_number', 'license_category', 'license_expiry_date',
            'document', 'cnh_digital', 'is_active'
        ]
        extra_kwargs = {
            'email': {'validators': [UniqueValidator(queryset=Conductor.objects.all(), message="Condutor com este E-mail já existe.")]},
            'license_number': {'validators': [UniqueValidator(queryset=Conductor.objects.all(), message="Condutor com este Número da CNH já existe.")]},
        }


class ConductorListSerializer(ConductorBaseSerializer):
    is_license_expired = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    address = serializers.SerializerMethodField()
    photo = serializers.FileField(source='document', read_only=True)

    class Meta:
        model = Conductor
        fields = [
            'id', 'name', 'cpf', 'birth_date', 'gender', 'gender_display', 'nationality',
            'address', 'phone', 'email', 'whatsapp',
            'license_number', 'license_category', 'license_expiry_date',
            'photo', 'document', 'cnh_digital', 'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_username', 'updated_by', 'updated_by_username',
            'is_license_expired'
        ]