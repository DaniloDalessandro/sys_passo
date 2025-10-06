from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SiteConfiguration
from .serializers import SiteConfigurationSerializer


class SiteConfigurationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving site configuration data.
    This is a read-only endpoint accessible without authentication.

    Endpoints:
    - GET /api/site/configuration/ - Returns the singleton site configuration
    """

    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [AllowAny]  # Public endpoint for the landing page

    def list(self, request, *args, **kwargs):
        """
        Override list method to return the singleton instance directly
        instead of a list of objects.
        """
        try:
            # Get or create the singleton instance
            instance = SiteConfiguration.get_instance()
            serializer = self.get_serializer(instance)

            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Erro ao buscar configurações do site'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve method to always return the singleton instance.
        The ID parameter is ignored since there's only one configuration.
        """
        try:
            instance = SiteConfiguration.get_instance()
            serializer = self.get_serializer(instance)

            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Erro ao buscar configurações do site'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='current')
    def get_current(self, request):
        """
        Custom action to get the current site configuration.

        URL: /api/site/configuration/current/
        Method: GET
        Public endpoint (no authentication required)
        """
        try:
            instance = SiteConfiguration.get_instance()
            serializer = self.get_serializer(instance)

            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Erro ao buscar configurações do site'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
