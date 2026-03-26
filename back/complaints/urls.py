from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Configurar router para o ViewSet
router = DefaultRouter()
router.register(r'', views.ComplaintViewSet, basename='complaint')

urlpatterns = [
    # Endpoints auxiliares públicos (devem vir ANTES do router)
    # Usar URLs com hífen ou underscore para evitar confusão com pk do ViewSet
    path('vehicles/autocomplete/', views.vehicle_autocomplete, name='vehicle-autocomplete'),
    path('_types/', views.complaint_types, name='complaint-types'),
    path('_check-protocol/', views.check_complaint_by_protocol, name='check-by-protocol'),

    # Endpoints do ViewSet (CRUD + custom actions)
    path('', include(router.urls)),
]
