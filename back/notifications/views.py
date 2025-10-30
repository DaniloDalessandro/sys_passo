from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationUpdateSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para gerenciar notificações.

    Endpoints:
    - GET /api/notifications/ - Lista todas as notificações
    - GET /api/notifications/unread/ - Lista notificações não lidas
    - GET /api/notifications/unread_count/ - Conta notificações não lidas
    - PATCH /api/notifications/{id}/mark_as_read/ - Marca notificação como lida
    - POST /api/notifications/mark_all_as_read/ - Marca todas como lidas
    """

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retorna notificações ordenadas por data de criação.
        """
        return Notification.objects.all().order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Lista todas as notificações não lidas.
        """
        unread_notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Retorna o número de notificações não lidas.
        """
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """
        Marca uma notificação específica como lida.
        """
        notification = self.get_object()

        if not notification.is_read:
            notification.is_read = True
            notification.read_by = request.user
            notification.read_at = timezone.now()
            notification.save()

        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Marca todas as notificações não lidas como lidas.
        """
        updated_count = Notification.objects.filter(is_read=False).update(
            is_read=True,
            read_by=request.user,
            read_at=timezone.now()
        )

        return Response({
            'message': f'{updated_count} notificação(ões) marcada(s) como lida(s)',
            'updated_count': updated_count
        })
