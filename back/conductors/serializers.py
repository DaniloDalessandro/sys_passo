from rest_framework import serializers
from .models import Conductor
from django.utils import timezone


class ConductorSerializer(serializers.ModelSerializer):
    is_license_expired = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = Conductor
        fields = [
            'id', 'name', 'cpf', 'email', 'phone', 'photo', 'birth_date',
            'license_number', 'license_category', 'license_expiry_date',
            'address', 'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 
            'is_license_expired'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

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


class ConductorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductor
        fields = [
            'name', 'cpf', 'email', 'phone', 'photo', 'birth_date',
            'license_number', 'license_category', 'license_expiry_date',
            'address', 'is_active'
        ]

    def validate_cpf(self, value):
        # Same validation as ConductorSerializer
        cpf = ''.join(filter(str.isdigit, value))
        
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos.")
        
        if cpf == cpf[0] * 11:
            raise serializers.ValidationError("CPF inválido.")
        
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digito1 = (soma * 10) % 11
        if digito1 == 10:
            digito1 = 0
        if int(cpf[9]) != digito1:
            raise serializers.ValidationError("CPF inválido.")
        
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
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("O condutor deve ter pelo menos 18 anos.")
        return value


class ConductorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductor
        fields = [
            'name', 'email', 'phone', 'photo', 'birth_date',
            'license_number', 'license_category', 'license_expiry_date',
            'address', 'is_active'
        ]
        
    def validate_license_expiry_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade da CNH não pode estar no passado.")
        return value

    def validate_birth_date(self, value):
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("O condutor deve ter pelo menos 18 anos.")
        return value


class ConductorListSerializer(serializers.ModelSerializer):
    is_license_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Conductor
        fields = [
            'id', 'name', 'cpf', 'email', 'phone', 'license_category', 
            'license_expiry_date', 'is_active', 'is_license_expired'
        ]