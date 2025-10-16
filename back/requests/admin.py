from django.contrib import admin
from django.utils.html import format_html
from .models import DriverRequest, VehicleRequest


@admin.register(DriverRequest)
class DriverRequestAdmin(admin.ModelAdmin):
    """
    Configuração do Admin para Solicitações de Motoristas
    """

    list_display = [
        'id',
        'name',
        'cpf',
        'email',
        'phone',
        'license_category',
        'status_badge',
        'created_at',
        'reviewed_by',
    ]

    list_filter = [
        'status',
        'license_category',
        'created_at',
        'reviewed_at',
    ]

    search_fields = [
        'name',
        'cpf',
        'email',
        'phone',
        'license_number',
    ]

    readonly_fields = [
        'id',
        'created_at',
        'reviewed_at',
        'reviewed_by',
        'conductor',
    ]

    fieldsets = (
        ('Informações do Solicitante', {
            'fields': (
                'name',
                'cpf',
                'email',
                'phone',
            )
        }),
        ('Informações da CNH', {
            'fields': (
                'license_number',
                'license_category',
            )
        }),
        ('Mensagem', {
            'fields': ('message',)
        }),
        ('Status da Solicitação', {
            'fields': (
                'status',
                'rejection_reason',
            )
        }),
        ('Auditoria', {
            'fields': (
                'id',
                'created_at',
                'reviewed_at',
                'reviewed_by',
                'conductor',
            ),
            'classes': ('collapse',)
        }),
    )

    ordering = ['-created_at']

    date_hierarchy = 'created_at'

    def status_badge(self, obj):
        """
        Exibe o status com badge colorido no admin
        """
        colors = {
            'em_analise': '#FFA500',  # Laranja
            'aprovado': '#28A745',    # Verde
            'reprovado': '#DC3545',   # Vermelho
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def has_delete_permission(self, request, obj=None):
        """
        Permite deleção apenas de solicitações em análise ou reprovadas
        """
        if obj and obj.status == 'aprovado':
            return False
        return super().has_delete_permission(request, obj)


@admin.register(VehicleRequest)
class VehicleRequestAdmin(admin.ModelAdmin):
    """
    Configuração do Admin para Solicitações de Veículos
    """

    list_display = [
        'id',
        'plate',
        'brand',
        'model',
        'year',
        'color',
        'fuel_type',
        'status_badge',
        'created_at',
        'reviewed_by',
    ]

    list_filter = [
        'status',
        'fuel_type',
        'brand',
        'created_at',
        'reviewed_at',
    ]

    search_fields = [
        'plate',
        'brand',
        'model',
        'color',
    ]

    readonly_fields = [
        'id',
        'created_at',
        'reviewed_at',
        'reviewed_by',
        'vehicle',
    ]

    fieldsets = (
        ('Informações do Veículo', {
            'fields': (
                'plate',
                'brand',
                'model',
                'year',
                'color',
                'fuel_type',
            )
        }),
        ('Mensagem', {
            'fields': ('message',)
        }),
        ('Status da Solicitação', {
            'fields': (
                'status',
                'rejection_reason',
            )
        }),
        ('Auditoria', {
            'fields': (
                'id',
                'created_at',
                'reviewed_at',
                'reviewed_by',
                'vehicle',
            ),
            'classes': ('collapse',)
        }),
    )

    ordering = ['-created_at']

    date_hierarchy = 'created_at'

    def status_badge(self, obj):
        """
        Exibe o status com badge colorido no admin
        """
        colors = {
            'em_analise': '#FFA500',  # Laranja
            'aprovado': '#28A745',    # Verde
            'reprovado': '#DC3545',   # Vermelho
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def has_delete_permission(self, request, obj=None):
        """
        Permite deleção apenas de solicitações em análise ou reprovadas
        """
        if obj and obj.status == 'aprovado':
            return False
        return super().has_delete_permission(request, obj)
