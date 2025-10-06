from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteConfigurationViewSet

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'configuration', SiteConfigurationViewSet, basename='site-configuration')

# URL patterns for the site_home app
urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET /api/site/configuration/ - Get site configuration (list view returns singleton)
# GET /api/site/configuration/{id}/ - Get site configuration by ID (always returns singleton)
# GET /api/site/configuration/current/ - Custom action to get current configuration
