from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/conductors/', include('conductors.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/site/', include('sitehome.urls')),
    path('api/requests/', include('requests.urls')),
    path('api/complaints/', include('complaints.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
