from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverRequestViewSet, VehicleRequestViewSet

router = DefaultRouter()
router.register(r'drivers', DriverRequestViewSet, basename='driver-request')
router.register(r'vehicles', VehicleRequestViewSet, basename='vehicle-request')

urlpatterns = [
    path('', include(router.urls)),
]
