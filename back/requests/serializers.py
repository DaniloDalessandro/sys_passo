from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .models import DriverRequest, VehicleRequest
from conductors.models import Conductor
from vehicles.models import Vehicle
import re
import logging

logger = logging.getLogger(__name__)


# Serializers para dados aninhados (nested)
class UserNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do usuário revisor"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class ConductorNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do condutor criado"""

    class Meta:
        model = Conductor
        fields = ['id', 'name', 'cpf', 'email', 'phone', 'license_number', 'license_category', 'is_active']
        read_only_fields = fields


class VehicleNestedSerializer(serializers.ModelSerializer):
    """Serializer para exibir dados básicos do veículo criado"""

    class Meta:
        model = Vehicle
        fields = ['id', 'plate', 'brand', 'model', 'year', 'color', 'fuel_type', 'is_active']
        read_only_fields = fields


# ========== DRIVER REQUEST SERIALIZERS ==========

class DriverRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de solicitações de motoristas (site público).

    Validações:
    - CPF deve ter 11 dígitos (após normalização)
    - Email deve ser único entre solicitações em análise
    - CNH categoria deve ser válida
    """

    class Meta:
        model = DriverRequest
        fields = [
            'full_name',
            'cpf',
            'email',
            'phone',
            'cnh_number',
            'cnh_category',
            'message',
        ]

    def validate_cpf(self, value):
        """
        Valida e normaliza o CPF.

        Remove caracteres não numéricos e verifica se tem 11 dígitos.
        """
        # Normalizar CPF (remover pontos, traços e espaços)
        cpf_cleaned = re.sub(r'[^0-9]', '', value)

        # Validar se tem 11 dígitos
        if len(cpf_cleaned) != 11:
            raise serializers.ValidationError(
                'O CPF deve conter exatamente 11 dígitos.'
            )

        # Validar se não são todos os dígitos iguais (ex: 111.111.111-11)
        if cpf_cleaned == cpf_cleaned[0] * 11:
            raise serializers.ValidationError(
                'O CPF informado não é válido.'
            )

        # Verificar se já existe uma solicitação em análise com este CPF
        existing_request = DriverRequest.objects.filter(
            cpf=cpf_cleaned,
            status='em_analise'
        ).exists()

        if existing_request:
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise para este CPF. Aguarde a aprovação ou reprovação.'
            )

        return cpf_cleaned

    def validate_email(self, value):
        """
        Valida se o email é único entre solicitações em análise.
        """
        existing_request = DriverRequest.objects.filter(
            email=value,
            status='em_analise'
        ).exists()

        if existing_request:
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise com este e-mail. Aguarde a aprovação ou reprovação.'
            )

        return value.lower()

    def validate_cnh_category(self, value):
        """
        Valida se a categoria da CNH é válida.
        """
        valid_categories = ['A', 'B', 'AB', 'C', 'D', 'E']

        if value not in valid_categories:
            raise serializers.ValidationError(
                f'Categoria de CNH inválida. Categorias válidas: {", ".join(valid_categories)}'
            )

        return value

    def create(self, validated_data):
        """
        Cria uma nova solicitação com status 'em_analise'.
        """
        logger.info(f"Nova solicitação de motorista criada: {validated_data.get('cpf')}")
        return super().create(validated_data)


class DriverRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de solicitações de motoristas (admin).

    Inclui dados aninhados do revisor e do condutor criado.
    """

    reviewed_by = UserNestedSerializer(read_only=True)
    conductor = ConductorNestedSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    cnh_category_display = serializers.CharField(source='get_cnh_category_display', read_only=True)

    class Meta:
        model = DriverRequest
        fields = [
            'id',
            'full_name',
            'cpf',
            'email',
            'phone',
            'cnh_number',
            'cnh_category',
            'cnh_category_display',
            'message',
            'status',
            'status_display',
            'created_at',
            'reviewed_at',
            'reviewed_by',
            'rejection_reason',
            'conductor',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'reviewed_at',
            'reviewed_by',
            'conductor',
        ]


class DriverRequestActionSerializer(serializers.Serializer):
    """
    Serializer para ações de aprovação/reprovação de solicitações de motoristas.

    Validações:
    - rejection_reason é obrigatório se status for 'reprovado'
    """

    status = serializers.ChoiceField(
        choices=['aprovado', 'reprovado'],
        required=True
    )
    rejection_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000
    )

    def validate(self, data):
        """
        Valida que rejection_reason é obrigatório quando status é 'reprovado'.
        """
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
            'fuel_type',
            'message',
        ]

    def validate_plate(self, value):
        """
        Valida e normaliza a placa do veículo.

        Remove espaços e converte para maiúsculas.
        Aceita formatos brasileiro antigo (AAA-9999) e Mercosul (AAA9A99).
        """
        # Normalizar placa (uppercase, sem espaços, sem traços)
        plate_cleaned = value.upper().strip().replace(' ', '').replace('-', '')

        # Validar se tem 7 caracteres
        if len(plate_cleaned) != 7:
            raise serializers.ValidationError(
                'A placa deve conter exatamente 7 caracteres (formato brasileiro).'
            )

        # Validar formato da placa (brasileiro antigo ou Mercosul)
        brazilian_pattern = r'^[A-Z]{3}[0-9]{4}$'  # AAA1234
        mercosul_pattern = r'^[A-Z]{3}[0-9][A-Z][0-9]{2}$'  # AAA1A23

        if not (re.match(brazilian_pattern, plate_cleaned) or re.match(mercosul_pattern, plate_cleaned)):
            raise serializers.ValidationError(
                'Formato de placa inválido. Use o formato brasileiro (AAA1234) ou Mercosul (AAA1A23).'
            )

        # Verificar se já existe uma solicitação em análise com esta placa
        existing_request = VehicleRequest.objects.filter(
            plate=plate_cleaned,
            status='em_analise'
        ).exists()

        if existing_request:
            raise serializers.ValidationError(
                'Já existe uma solicitação em análise para esta placa. Aguarde a aprovação ou reprovação.'
            )

        return plate_cleaned

    def validate_year(self, value):
        """
        Valida se o ano está entre 1900 e ano atual + 1.
        """
        import datetime
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
        """
        Cria uma nova solicitação com status 'em_analise'.
        """
        logger.info(f"Nova solicitação de veículo criada: {validated_data.get('plate')}")
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

    class Meta:
        model = VehicleRequest
        fields = [
            'id',
            'plate',
            'brand',
            'model',
            'year',
            'color',
            'fuel_type',
            'fuel_type_display',
            'message',
            'status',
            'status_display',
            'created_at',
            'reviewed_at',
            'reviewed_by',
            'rejection_reason',
            'vehicle',
        ]
        read_only_fields = [
            'id',
            'created_at',
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

    status = serializers.ChoiceField(
        choices=['aprovado', 'reprovado'],
        required=True
    )
    rejection_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000
    )

    def validate(self, data):
        """
        Valida que rejection_reason é obrigatório quando status é 'reprovado'.
        """
        status = data.get('status')
        rejection_reason = data.get('rejection_reason', '').strip()

        if status == 'reprovado' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'O motivo da reprovação é obrigatório quando o status é "reprovado".'
            })

        return data
