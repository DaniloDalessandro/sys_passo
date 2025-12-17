# -*- coding: utf-8 -*-
"""
URLs do Dashboard
"""
from django.urls import re_path
from . import views

app_name = 'dashboard'

urlpatterns = [
    re_path(r'^stats/?$', views.dashboard_stats, name='dashboard-stats'),
    re_path(r'^charts/?$', views.dashboard_charts, name='dashboard-charts'),
    re_path(r'^recent-activity/?$', views.dashboard_recent_activity, name='dashboard-recent-activity'),
    re_path(r'^alerts/?$', views.dashboard_alerts, name='dashboard-alerts'),
]
