from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vehicle_list(request):
    return Response({
        'message': 'Vehicles API endpoint - Coming soon!'
    }, status=status.HTTP_200_OK)
