from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vehicles'

router = DefaultRouter()
router.register(r'', views.VehicleViewSet, basename='vehicle')

urlpatterns = [
    re_path(r'^stats/?$', views.vehicle_stats, name='vehicle-stats'),
    re_path(r'^search-by-plate/?$', views.search_vehicles_by_plate, name='search-by-plate'),
    re_path(r'^plate/(?P<plate>[^/]+)/?$', views.get_vehicle_by_plate, name='get-vehicle-by-plate'),
    path('', include(router.urls)),
]
