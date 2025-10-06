from django.contrib import admin
from django.utils.html import format_html
from .models import SiteConfiguration


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    """
    Custom admin interface for SiteConfiguration model.
    Implements singleton pattern constraints and organized field display.
    """

    # Fields to display in the list view
    list_display = [
        'company_name',
        'phone',
        'email',
        'display_logo',
        'updated_at'
    ]

    # Fields organization in the form view
    fieldsets = (
        ('Informações da Empresa', {
            'fields': ('company_name', 'phone', 'email', 'address'),
            'description': 'Informações básicas da empresa exibidas no site'
        }),
        ('Redes Sociais', {
            'fields': ('whatsapp', 'facebook_url', 'instagram_url', 'linkedin_url'),
            'description': 'Links para redes sociais e WhatsApp',
            'classes': ('collapse',)  # Makes this section collapsible
        }),
        ('Conteúdo da Landing Page', {
            'fields': ('hero_title', 'hero_subtitle', 'about_text'),
            'description': 'Textos principais exibidos na landing page'
        }),
        ('Imagens', {
            'fields': ('logo',),
            'description': 'Logo da empresa'
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Informações de data e hora'
        }),
    )

    # Read-only fields
    readonly_fields = ['created_at', 'updated_at']

    # Search functionality
    search_fields = ['company_name', 'email']

    def display_logo(self, obj):
        """
        Display logo thumbnail in the admin list view.
        """
        if obj.logo:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: contain;" />',
                obj.logo.url
            )
        return "Sem logo"

    display_logo.short_description = "Logo"

    def has_add_permission(self, request):
        """
        Prevent adding new instances if one already exists (singleton pattern).
        """
        if SiteConfiguration.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        """
        Prevent deletion of the singleton instance.
        """
        return False

    def changelist_view(self, request, extra_context=None):
        """
        Override changelist view to redirect to the edit page if only one instance exists.
        """
        if SiteConfiguration.objects.count() == 1:
            obj = SiteConfiguration.objects.first()
            from django.shortcuts import redirect
            from django.urls import reverse
            return redirect(reverse('admin:site_home_siteconfiguration_change', args=[obj.pk]))

        return super().changelist_view(request, extra_context=extra_context)

    class Meta:
        verbose_name = "Configuração do Site"
        verbose_name_plural = "Configuração do Site"

    def get_queryset(self, request):
        """
        Ensure we always work with the singleton instance.
        """
        qs = super().get_queryset(request)
        return qs
