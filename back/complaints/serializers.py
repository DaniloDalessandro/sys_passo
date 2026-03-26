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
            'occurrence_location',
            'complainant_name',
            'complainant_email',
            'complainant_phone',
        ]

    def validate_vehicle_plate(self, value):
        if not value:
            raise serializers.ValidationError('A placa do veículo é obrigatória.')

        plate_clean = value.upper().strip().replace(' ', '')

        if len(plate_clean) < 7:
            raise serializers.ValidationError('Placa inválida. Deve conter pelo menos 7 caracteres.')

        return plate_clean

    def validate_description(self, value):
        if not value or len(value.strip()) < 20:
            raise serializers.ValidationError(
                'A descrição deve ter pelo menos 20 caracteres para fornecer detalhes suficientes.'
            )
        return value.strip()

    def validate_occurrence_date(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError('A data da ocorrência não pode ser futura.')
        return value

    def validate(self, attrs):
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
    priority_display = serializers.CharField(
        source='get_priority_display',
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
            'occurrence_location',
            'priority',
            'priority_display',
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
    priority_display = serializers.CharField(
        source='get_priority_display',
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
            'occurrence_location',
            'priority',
            'priority_display',
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
        """Retorna informações do revisor ou None."""
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
            'priority',
            'admin_notes',
            'resolution_notes',
        ]

    def validate_status(self, value):
        valid_statuses = dict(Complaint.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError(f'Status inválido. Valores permitidos: {", ".join(valid_statuses)}')
        return value

    def update(self, instance, validated_data):
        """Registra revisão automaticamente quando o status é alterado."""
        request = self.context.get('request')

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
        valid_statuses = dict(Complaint.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError('Status inválido.')
        return value
