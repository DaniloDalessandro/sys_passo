from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Configurar router para o ViewSet
router = DefaultRouter()
router.register(r'', views.ComplaintViewSet, basename='complaint')

urlpatterns = [
    # Endpoints do ViewSet (CRUD + custom actions)
    path('', include(router.urls)),

    # Endpoints auxiliares
    path('vehicles/autocomplete/', views.vehicle_autocomplete, name='vehicle-autocomplete'),
    path('types/', views.complaint_types, name='complaint-types'),
    path('check-by-protocol/', views.check_complaint_by_protocol, name='check-by-protocol'),
]
