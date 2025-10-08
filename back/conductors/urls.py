from django.urls import path
from . import views

app_name = 'conductors'

urlpatterns = [
    # CRUD endpoints
    path('', views.ConductorListCreateView.as_view(), name='conductor-list-create'),
    path('<int:pk>/', views.ConductorDetailView.as_view(), name='conductor-detail'),

    # Search and stats endpoints
    path('search/', views.ConductorSearchView.as_view(), name='conductor-search'),
    path('stats/', views.ConductorStatsView.as_view(), name='conductor-stats'),

    # Validation endpoints
    path('check-duplicate/', views.CheckDuplicateFieldView.as_view(), name='check-duplicate-field'),

    # Bulk operations
    path('bulk/deactivate/', views.BulkDeactivateConductorsView.as_view(), name='bulk-deactivate-conductors'),
]