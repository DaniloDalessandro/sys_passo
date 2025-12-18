from rest_framework import serializers
from django.utils import timezone
from .models import Complaint, ComplaintPhoto
from vehicles.models import Vehicle


class ComplaintPhotoSerializer(serializers.ModelSerializer):
    """Serializer para fotos das denúncias."""

    class Meta:
        model = ComplaintPhoto
        fields = ['id', 'photo', 'uploaded_at', 'order']
        read_only_fields = ['id', 'uploaded_at']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criar denúncias através do site público.

    Aceita dados básicos da denúncia e informações opcionais do denunciante.
    Não requer autenticação - qualquer pessoa pode criar uma denúncia.
    """

    class Meta:
        model = Complaint
        fields = [
            'vehicle_plate',
            'complaint_type',
            'description',
            'occurrence_date',
            'complainant_name',
            'complainant_email',
            'complainant_phone',
        ]

    def validate_vehicle_plate(self, value):
        """
        Validar formato da placa.

        Args:
            value: Placa informada pelo usuário

        Returns:
            str: Placa normalizada (uppercase, sem espaços)

        Raises:
            ValidationError: Se a placa for inválida
        """
        if not value:
            raise serializers.ValidationError('A placa do veículo é obrigatória.')

        # Normalizar placa
        plate_clean = value.upper().strip().replace(' ', '')

        if len(plate_clean) < 7:
            raise serializers.ValidationError('Placa inválida. Deve conter pelo menos 7 caracteres.')

        return plate_clean

    def validate_description(self, value):
        """
        Validar descrição mínima.

        Args:
            value: Descrição da denúncia

        Returns:
            str: Descrição validada

        Raises:
            ValidationError: Se a descrição for muito curta
        """
        if not value or len(value.strip()) < 20:
            raise serializers.ValidationError(
                'A descrição deve ter pelo menos 20 caracteres para fornecer detalhes suficientes.'
            )
        return value.strip()

    def validate_occurrence_date(self, value):
        """
        Validar que a data de ocorrência não seja futura.

        Args:
            value: Data da ocorrência

        Returns:
            date: Data validada

        Raises:
            ValidationError: Se a data for futura
        """
        if value and value > timezone.now().date():
            raise serializers.ValidationError('A data da ocorrência não pode ser futura.')
        return value

    def validate(self, attrs):
        """
        Validações adicionais que envolvem múltiplos campos.

        Args:
            attrs: Dicionário com todos os atributos

        Returns:
            dict: Atributos validados
        """
        # Se forneceu email, validar formato básico
        email = attrs.get('complainant_email')
        if email and '@' not in email:
            raise serializers.ValidationError({
                'complainant_email': 'Email inválido.'
            })

        return attrs


class VehicleMinimalSerializer(serializers.ModelSerializer):
    """Serializer mínimo para informações do veículo associado."""

    class Meta:
        model = Vehicle
        fields = ['id', 'plate', 'brand', 'model', 'year', 'color']


class ComplaintListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de denúncias (área administrativa).

    Inclui informações completas da denúncia, dados do veículo associado
    e labels traduzidas para os choices fields.
    """

    vehicle = VehicleMinimalSerializer(read_only=True)
    photos = ComplaintPhotoSerializer(many=True, read_only=True)
    reviewed_by_username = serializers.CharField(
        source='reviewed_by.username',
        read_only=True,
        allow_null=True
    )
    reviewed_by_full_name = serializers.CharField(
        source='reviewed_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    complaint_type_display = serializers.CharField(
        source='get_complaint_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Complaint
        fields = [
            'id',
            'protocol',
            'vehicle',
            'vehicle_plate',
            'complaint_type',
            'complaint_type_display',
            'description',
            'occurrence_date',
            'complainant_name',
            'complainant_email',
            'complainant_phone',
            'is_anonymous',
            'status',
            'status_display',
            'created_at',
            'updated_at',
            'reviewed_by',
            'reviewed_by_username',
            'reviewed_by_full_name',
            'reviewed_at',
            'admin_notes',
            'resolution_notes',
            'photos',
        ]
        read_only_fields = [
            'id',
            'protocol',
            'vehicle',
            'is_anonymous',
            'created_at',
            'updated_at',
            'photos',
        ]


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalhamento completo de uma denúncia.

    Usado para visualizar todos os detalhes de uma denúncia específica,
    incluindo informações do veículo e do revisor.
    """

    vehicle = VehicleMinimalSerializer(read_only=True)
    photos = ComplaintPhotoSerializer(many=True, read_only=True)
    reviewed_by_info = serializers.SerializerMethodField()
    complaint_type_display = serializers.CharField(
        source='get_complaint_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Complaint
        fields = [
            'id',
            'protocol',
            'vehicle',
            'vehicle_plate',
            'complaint_type',
            'complaint_type_display',
            'description',
            'occurrence_date',
            'complainant_name',
            'complainant_email',
            'complainant_phone',
            'is_anonymous',
            'status',
            'status_display',
            'created_at',
            'updated_at',
            'reviewed_by',
            'reviewed_by_info',
            'reviewed_at',
            'admin_notes',
            'resolution_notes',
            'photos',
        ]

    def get_reviewed_by_info(self, obj):
        """
        Retorna informações completas do revisor.

        Args:
            obj: Instância do Complaint

        Returns:
            dict: Dicionário com informações do revisor ou None
        """
        if obj.reviewed_by:
            return {
                'id': obj.reviewed_by.id,
                'username': obj.reviewed_by.username,
                'full_name': obj.reviewed_by.get_full_name() or obj.reviewed_by.username,
                'email': obj.reviewed_by.email,
            }
        return None


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualizar status e informações administrativas da denúncia.

    Usado por administradores para gerenciar denúncias, incluindo alteração
    de status e adição de notas internas e de resolução.
    """

    class Meta:
        model = Complaint
        fields = [
            'status',
            'admin_notes',
            'resolution_notes',
        ]

    def validate_status(self, value):
        """
        Validar status.

        Args:
            value: Novo status

        Returns:
            str: Status validado

        Raises:
            ValidationError: Se o status for inválido
        """
        valid_statuses = dict(Complaint.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError(f'Status inválido. Valores permitidos: {", ".join(valid_statuses)}')
        return value

    def update(self, instance, validated_data):
        """
        Sobrescrever update para adicionar lógica de revisão.

        Quando o status é alterado, automaticamente registra quem fez a revisão
        e quando foi feita.

        Args:
            instance: Instância da denúncia
            validated_data: Dados validados

        Returns:
            Complaint: Instância atualizada
        """
        request = self.context.get('request')

        # Se o status foi alterado, registrar revisão
        if 'status' in validated_data and validated_data['status'] != instance.status:
            if request and request.user:
                instance.reviewed_by = request.user
                instance.reviewed_at = timezone.now()

        return super().update(instance, validated_data)


class ComplaintStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer para atualização rápida apenas de status.

    Usado para endpoints específicos de mudança de status.
    """

    status = serializers.ChoiceField(
        choices=Complaint.STATUS_CHOICES,
        help_text='Novo status da denúncia'
    )

    def validate_status(self, value):
        """Validar que o status é válido"""
        valid_statuses = dict(Complaint.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError('Status inválido.')
        return value
