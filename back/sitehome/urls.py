from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteConfigurationViewSet

# Create router and register viewset
router = DefaultRouter()
router.register(r'configuration', SiteConfigurationViewSet, basename='site-configuration')

urlpatterns = [
    path('', include(router.urls)),
]
