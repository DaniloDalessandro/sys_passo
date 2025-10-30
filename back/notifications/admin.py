from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'notification_type', 'request_id', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Informações da Notificação', {
            'fields': ('notification_type', 'request_id', 'title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_by', 'read_at')
        }),
        ('Datas', {
            'fields': ('created_at',)
        }),
    )
