"""
WebSocket URL routing configuration.
"""
from django.urls import re_path
from requests import consumers

websocket_urlpatterns = [
    re_path(r'ws/requests/$', consumers.RequestNotificationConsumer.as_asgi()),
]
