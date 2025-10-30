from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Notification.
    """

    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )

    read_by_username = serializers.CharField(
        source='read_by.username',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'request_id',
            'title',
            'message',
            'is_read',
            'read_by',
            'read_by_username',
            'read_at',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'notification_type',
            'request_id',
            'title',
            'message',
            'created_at',
        ]


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para marcar notificações como lidas.
    """

    class Meta:
        model = Notification
        fields = ['is_read']
