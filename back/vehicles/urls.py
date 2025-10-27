from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vehicles'

router = DefaultRouter()
router.register(r'', views.VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('stats/', views.vehicle_stats, name='vehicle-stats'),
    path('', include(router.urls)),
]
