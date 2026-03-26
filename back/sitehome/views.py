from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from core.throttling import PublicReadThrottle
from core.exceptions import safe_error_response
from .models import SiteConfiguration
from .serializers import SiteConfigurationSerializer


class SiteConfigurationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet somente leitura para configuração do site.
    Edição exclusiva via Django Admin. Acesso público sem autenticação.
    """

    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [PublicReadThrottle]

    def get_queryset(self):
        return SiteConfiguration.objects.filter(pk=1)

    def list(self, request, *args, **kwargs):
        try:
            config = SiteConfiguration.objects.get_configuration()
            serializer = self.get_serializer(config)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração do site obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return safe_error_response(
                message='Erro ao obter configuração do site',
                exception=e,
                context={'action': 'site_config_list'}
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração do site obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return safe_error_response(
                message='Erro ao obter configuração do site',
                exception=e,
                context={'action': 'site_config_retrieve'}
            )


    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """Retorna a configuração atual (instância singleton)."""
        try:
            config = SiteConfiguration.objects.get_configuration()
            serializer = self.get_serializer(config)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração atual obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return safe_error_response(
                message='Erro ao obter configuração do site',
                exception=e,
                context={'action': 'site_config_current'}
            )
