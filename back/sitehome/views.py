from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import SiteConfiguration
from .serializers import SiteConfigurationSerializer


class SiteConfigurationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for site configuration.

    Public endpoints (no authentication required):
    - GET /api/site/configuration/ - List configuration
    - GET /api/site/configuration/{id}/ - Retrieve configuration
    - GET /api/site/configuration/current/ - Get current configuration

    Note: Editing is done exclusively through Django Admin (/admin/)
    Only superusers can modify configuration via Django Admin.
    """

    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [AllowAny]  # Public read-only access

    def get_queryset(self):
        """
        Return the singleton configuration instance.
        """
        # Always return queryset with only the singleton instance
        return SiteConfiguration.objects.filter(pk=1)

    def list(self, request, *args, **kwargs):
        """
        List endpoint - returns the singleton configuration.
        Public access allowed.
        """
        try:
            config = SiteConfiguration.objects.get_configuration()
            serializer = self.get_serializer(config)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração do site obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erro ao obter configuração: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve endpoint - returns the singleton configuration.
        Public access allowed.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração do site obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erro ao obter configuração: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def current(self, request):
        """
        Custom endpoint to get the current configuration.
        Always returns the singleton instance.
        Endpoint: GET /api/site/configuration/current/
        """
        try:
            config = SiteConfiguration.objects.get_configuration()
            serializer = self.get_serializer(config)

            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Configuração atual obtida com sucesso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erro ao obter configuração: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
