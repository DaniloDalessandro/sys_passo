"""
WebSocket consumers para notificações em tempo real de solicitações.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class RequestNotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer para notificações de novas solicitações (motoristas e veículos).
    """

    async def connect(self):
        """
        Conecta o WebSocket e adiciona à sala de notificações de solicitações.
        """
        # Nome do grupo para notificações de solicitações
        self.room_group_name = 'requests_notifications'

        # Adiciona o canal ao grupo
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Envia mensagem de confirmação de conexão
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado ao sistema de notificações de solicitações'
        }))

    async def disconnect(self, close_code):
        """
        Desconecta o WebSocket e remove da sala.
        """
        # Remove o canal do grupo
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Recebe mensagens do WebSocket (não necessário para este caso).
        """
        pass

    async def new_request(self, event):
        """
        Recebe notificação de nova solicitação e envia para o WebSocket.
        """
        # Envia mensagem para o WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_request',
            'request_type': event['request_type'],  # 'driver' ou 'vehicle'
            'request_id': event['request_id'],
            'message': event['message'],
            'data': event.get('data', {})
        }))
