from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vehicles'

router = DefaultRouter()
router.register(r'', views.VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('stats/', views.vehicle_stats, name='vehicle-stats'),
    path('search-by-plate/', views.search_vehicles_by_plate, name='search-by-plate'),
    path('plate/<str:plate>/', views.get_vehicle_by_plate, name='get-vehicle-by-plate'),
    path('', include(router.urls)),
]
