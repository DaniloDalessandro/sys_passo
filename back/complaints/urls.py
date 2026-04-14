from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('vehicles/autocomplete/', views.vehicle_autocomplete, name='vehicle-autocomplete'),
    path('_types/', views.complaint_types, name='complaint-types'),
    path('_check-protocol/', views.check_complaint_by_protocol, name='check-by-protocol'),
    path('', include(router.urls)),
]
