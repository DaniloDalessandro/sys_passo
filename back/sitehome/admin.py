from django.contrib import admin
from django.utils.html import format_html
from .models import SiteConfiguration


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    """
    Admin interface for SiteConfiguration model.
    Enforces singleton pattern - prevents adding multiple instances or deleting.
    """

    list_display = ('company_name', 'email', 'phone', 'whatsapp', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at', 'logo_preview')

    fieldsets = [
        ('Informações da Empresa', {
            'fields': ('company_name', 'logo', 'logo_preview'),
            'description': 'Informações básicas da empresa'
        }),
        ('Informações de Contato', {
            'fields': ('phone', 'email', 'address', 'whatsapp'),
            'description': 'Formas de contato com a empresa'
        }),
        ('Redes Sociais', {
            'fields': ('facebook_url', 'instagram_url', 'linkedin_url'),
            'description': 'Links para perfis em redes sociais (opcional)'
        }),
        ('Conteúdo da Página Inicial', {
            'fields': ('hero_title', 'hero_subtitle', 'about_text'),
            'description': 'Textos que aparecem na página inicial do site'
        }),
        ('Metadados', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Informações do sistema'
        }),
    ]

    def logo_preview(self, obj):
        """
        Display logo preview in admin.
        """
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 300px;"/>',
                obj.logo.url
            )
        return format_html('<em>Nenhuma logo enviada</em>')

    logo_preview.short_description = 'Preview da Logo'

    def has_add_permission(self, request):
        """
        Prevent adding new instances if one already exists.
        Enforces singleton pattern.
        """
        # Check if a configuration already exists
        if SiteConfiguration.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        """
        Prevent deletion of the configuration.
        Enforces singleton pattern.
        """
        return False

    def change_view(self, request, object_id, form_url='', extra_context=None):
        """
        Customize the change view to add helpful context.
        """
        extra_context = extra_context or {}
        extra_context['show_save_and_add_another'] = False
        extra_context['show_save_and_continue'] = True
        extra_context['show_delete'] = False
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )

    def changelist_view(self, request, extra_context=None):
        """
        Customize the changelist view.
        """
        extra_context = extra_context or {}
        extra_context['title'] = 'Configuração do Site'
        return super().changelist_view(request, extra_context=extra_context)
