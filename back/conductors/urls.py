from django.urls import path
from . import views

app_name = 'conductors'

urlpatterns = [
    # CRUD endpoints
    path('', views.ConductorListCreateView.as_view(), name='conductor-list-create'),
    path('<int:pk>/', views.ConductorDetailView.as_view(), name='conductor-detail'),

    # Search and stats endpoints
    path('search/', views.conductor_search, name='conductor-search'),
    path('stats/', views.conductor_stats, name='conductor-stats'),

    # Validation endpoints
    path('check-duplicate/', views.check_duplicate_field, name='check-duplicate-field'),

    # Bulk operations
    path('bulk/deactivate/', views.bulk_deactivate_conductors, name='bulk-deactivate-conductors'),
]