from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverRequestViewSet, VehicleRequestViewSet

# Criar router do DRF
router = DefaultRouter()

# Registrar ViewSets
router.register(r'drivers', DriverRequestViewSet, basename='driver-request')
router.register(r'vehicles', VehicleRequestViewSet, basename='vehicle-request')

# URLs do app
urlpatterns = [
    path('', include(router.urls)),
]
