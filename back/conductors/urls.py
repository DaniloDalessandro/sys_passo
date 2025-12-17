from django.urls import path, re_path
from . import views

app_name = 'conductors'

urlpatterns = [
    # Search and stats endpoints (antes dos CRUD)
    re_path(r'^search/?$', views.ConductorSearchView.as_view(), name='conductor-search'),
    re_path(r'^stats/?$', views.ConductorStatsView.as_view(), name='conductor-stats'),

    # Validation endpoints
    re_path(r'^check-duplicate/?$', views.CheckDuplicateFieldView.as_view(), name='check-duplicate-field'),

    # Bulk operations
    re_path(r'^bulk/deactivate/?$', views.BulkDeactivateConductorsView.as_view(), name='bulk-deactivate-conductors'),

    # CRUD endpoints (por último para não conflitar)
    re_path(r'^(?P<pk>\d+)/?$', views.ConductorDetailView.as_view(), name='conductor-detail'),
    re_path(r'^$', views.ConductorListCreateView.as_view(), name='conductor-list-create'),
]