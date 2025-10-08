from django.contrib import admin
from django.utils.html import format_html
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from .models import SiteConfiguration


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    """
    Admin interface for SiteConfiguration model.
    Enforces singleton pattern - prevents adding multiple instances or deleting.
    Automatically redirects to edit view when accessing the list.
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

    class Media:
        css = {
            'all': ('admin/sitehome/siteconfiguration.css',)
        }

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
        Remove 'Add' button completely.
        Configuration is auto-created via get_configuration().
        """
        return False

    def has_delete_permission(self, request, obj=None):
        """
        Prevent deletion of the singleton configuration.
        """
        return False

    def changelist_view(self, request, extra_context=None):
        """
        Override changelist to redirect directly to the change view.
        If configuration doesn't exist, create it first.
        """
        # Get or create the singleton configuration
        config = SiteConfiguration.objects.get_configuration()

        # Redirect to the change view for the singleton instance
        url = reverse('admin:sitehome_siteconfiguration_change', args=[config.pk])
        return redirect(url)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        """
        Customize the change view with helpful context and messages.
        """
        extra_context = extra_context or {}
        extra_context['show_save_and_add_another'] = False
        extra_context['show_save_and_continue'] = True
        extra_context['show_delete'] = False
        extra_context['title'] = 'Configuração do Site'

        # Add helpful message only on GET requests (not on save)
        if request.method == 'GET':
            messages.info(
                request,
                'Esta é a configuração única do site. '
                'Todas as alterações aqui refletem imediatamente no site público.'
            )

        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )
