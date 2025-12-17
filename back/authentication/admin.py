from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import UserProfile, EmailVerification, PasswordResetToken


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin customizado para UserProfile"""
    list_display = ('user', 'is_email_verified', 'email_verified_at', 'created_at', 'updated_at')
    list_filter = ('is_email_verified', 'created_at', 'email_verified_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at', 'email_verified_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Verificação de Email', {
            'fields': ('is_email_verified', 'email_verified_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Otimiza queries com select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('user')

    actions = ['mark_email_verified', 'mark_email_unverified']

    @admin.action(description='Marcar email como verificado')
    def mark_email_verified(self, request, queryset):
        """Action para marcar emails como verificados"""
        count = 0
        for profile in queryset:
            if not profile.is_email_verified:
                profile.is_email_verified = True
                profile.email_verified_at = timezone.now()
                profile.save()
                count += 1
        self.message_user(request, f'{count} perfis marcados como verificados.')

    @admin.action(description='Marcar email como não verificado')
    def mark_email_unverified(self, request, queryset):
        """Action para marcar emails como não verificados"""
        count = queryset.update(is_email_verified=False, email_verified_at=None)
        self.message_user(request, f'{count} perfis marcados como não verificados.')


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """Admin customizado para EmailVerification"""
    list_display = ('user', 'token_display', 'created_at', 'expires_at', 'is_used', 'status_badge')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'token')
    readonly_fields = ('created_at', 'token', 'status_display')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Token', {
            'fields': ('token', 'is_used', 'status_display')
        }),
        ('Validade', {
            'fields': ('created_at', 'expires_at')
        }),
    )

    def get_queryset(self, request):
        """Otimiza queries com select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('user')

    def token_display(self, obj):
        """Exibe apenas primeiros e últimos caracteres do token"""
        return f"{obj.token[:8]}...{obj.token[-8:]}" if obj.token else "-"
    token_display.short_description = 'Token'

    def status_badge(self, obj):
        """Badge visual do status do token"""
        if obj.is_used:
            color = 'gray'
            status = 'Usado'
        elif obj.is_expired():
            color = 'red'
            status = 'Expirado'
        else:
            color = 'green'
            status = 'Válido'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, status
        )
    status_badge.short_description = 'Status'

    def status_display(self, obj):
        """Exibe status detalhado do token"""
        if obj.is_used:
            return "✓ Token já foi usado"
        elif obj.is_expired():
            return "✗ Token expirado"
        else:
            return "✓ Token válido e ativo"
    status_display.short_description = 'Status Atual'

    actions = ['invalidate_tokens']

    @admin.action(description='Invalidar tokens selecionados')
    def invalidate_tokens(self, request, queryset):
        """Action para invalidar tokens"""
        count = queryset.filter(is_used=False).update(is_used=True)
        self.message_user(request, f'{count} tokens invalidados.')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin customizado para PasswordResetToken"""
    list_display = ('user', 'token_display', 'created_at', 'expires_at', 'is_used', 'ip_address', 'status_badge')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'token', 'ip_address')
    readonly_fields = ('created_at', 'token', 'ip_address', 'user_agent', 'status_display')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Token', {
            'fields': ('token', 'is_used', 'status_display')
        }),
        ('Validade', {
            'fields': ('created_at', 'expires_at')
        }),
        ('Informações de Segurança', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Otimiza queries com select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('user')

    def token_display(self, obj):
        """Exibe apenas primeiros e últimos caracteres do token"""
        return f"{obj.token[:8]}...{obj.token[-8:]}" if obj.token else "-"
    token_display.short_description = 'Token'

    def status_badge(self, obj):
        """Badge visual do status do token"""
        if obj.is_used:
            color = 'gray'
            status = 'Usado'
        elif obj.is_expired():
            color = 'red'
            status = 'Expirado'
        else:
            color = 'green'
            status = 'Válido'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, status
        )
    status_badge.short_description = 'Status'

    def status_display(self, obj):
        """Exibe status detalhado do token"""
        if obj.is_used:
            return "✓ Token já foi usado"
        elif obj.is_expired():
            return "✗ Token expirado"
        else:
            return "✓ Token válido e ativo"
    status_display.short_description = 'Status Atual'

    actions = ['invalidate_tokens']

    @admin.action(description='Invalidar tokens selecionados')
    def invalidate_tokens(self, request, queryset):
        """Action para invalidar tokens de reset"""
        count = queryset.filter(is_used=False).update(is_used=True)
        self.message_user(request, f'{count} tokens invalidados.')