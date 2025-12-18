from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """
    Configuração do Django Admin para o modelo Complaint.

    Fornece interface administrativa completa para gerenciar denúncias,
    com filtros, buscas e ações em lote.
    """

    list_display = [
        'id',
        'vehicle_plate_link',
        'complaint_type_badge',
        'status_badge',
        'is_anonymous',
        'created_at_formatted',
        'reviewed_by',
    ]

    list_filter = [
        'status',
        'complaint_type',
        'is_anonymous',
        'created_at',
        'reviewed_at',
    ]

    search_fields = [
        'vehicle_plate',
        'description',
        'complainant_name',
        'complainant_email',
        'id',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
        'is_anonymous',
        'reviewed_at',
    ]

    fieldsets = (
        ('Informações da Denúncia', {
            'fields': (
                'vehicle',
                'vehicle_plate',
                'complaint_type',
                'description',
                'occurrence_date',
            )
        }),
        ('Denunciante', {
            'fields': (
                'complainant_name',
                'complainant_email',
                'complainant_phone',
                'is_anonymous',
            ),
            'description': 'Informações do denunciante (podem estar vazias em denúncias anônimas)'
        }),
        ('Gestão', {
            'fields': (
                'status',
                'admin_notes',
                'resolution_notes',
            ),
            'classes': ('wide',)
        }),
        ('Auditoria', {
            'fields': (
                'reviewed_by',
                'reviewed_at',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )

    ordering = ['-created_at']

    list_per_page = 25

    actions = [
        'mark_as_proposed',
        'mark_as_in_analysis',
        'mark_as_concluded',
    ]

    def vehicle_plate_link(self, obj):
        """
        Exibe a placa do veículo com link para o veículo (se existir).

        Args:
            obj: Instância do Complaint

        Returns:
            str: HTML com link ou texto simples
        """
        if obj.vehicle:
            url = reverse('admin:vehicles_vehicle_change', args=[obj.vehicle.id])
            return format_html(
                '<a href="{}" target="_blank">{}</a>',
                url,
                obj.vehicle_plate
            )
        return obj.vehicle_plate

    vehicle_plate_link.short_description = 'Placa'
    vehicle_plate_link.admin_order_field = 'vehicle_plate'

    def complaint_type_badge(self, obj):
        """
        Exibe o tipo de denúncia como badge colorido.

        Args:
            obj: Instância do Complaint

        Returns:
            str: HTML com badge colorido
        """
        colors = {
            'excesso_velocidade': '#dc3545',  # vermelho
            'direcao_perigosa': '#fd7e14',     # laranja
            'uso_celular': '#ffc107',          # amarelo
            'veiculo_mal_conservado': '#6c757d',  # cinza
            'desrespeito_sinalizacao': '#e83e8c',  # rosa
            'embriaguez': '#dc3545',           # vermelho
            'estacionamento_irregular': '#17a2b8',  # azul claro
            'poluicao_sonora': '#6610f2',      # roxo
            'poluicao_ambiental': '#28a745',   # verde
            'outros': '#6c757d',               # cinza
        }
        color = colors.get(obj.complaint_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_complaint_type_display()
        )

    complaint_type_badge.short_description = 'Tipo'
    complaint_type_badge.admin_order_field = 'complaint_type'

    def status_badge(self, obj):
        """
        Exibe o status como badge colorido.

        Args:
            obj: Instância do Complaint

        Returns:
            str: HTML com badge colorido
        """
        colors = {
            'proposto': '#ffc107',      # amarelo
            'em_analise': '#17a2b8',    # azul
            'concluido': '#28a745',     # verde
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )

    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def created_at_formatted(self, obj):
        """
        Formata a data de criação.

        Args:
            obj: Instância do Complaint

        Returns:
            str: Data formatada
        """
        return obj.created_at.strftime('%d/%m/%Y %H:%M')

    created_at_formatted.short_description = 'Data da Denúncia'
    created_at_formatted.admin_order_field = 'created_at'

    # Ações em lote
    def mark_as_proposed(self, request, queryset):
        """Marca denúncias selecionadas como propostas"""
        updated = queryset.update(status='proposto')
        self.message_user(request, f'{updated} denúncia(s) marcada(s) como proposto.')

    mark_as_proposed.short_description = 'Marcar como Proposto'

    def mark_as_in_analysis(self, request, queryset):
        """Marca denúncias selecionadas como em análise"""
        from django.utils import timezone
        updated = queryset.update(
            status='em_analise',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} denúncia(s) marcada(s) como em análise.')

    mark_as_in_analysis.short_description = 'Marcar como Em Análise'

    def mark_as_concluded(self, request, queryset):
        """Marca denúncias selecionadas como concluídas"""
        from django.utils import timezone
        updated = queryset.update(
            status='concluido',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} denúncia(s) marcada(s) como concluída.')

    mark_as_concluded.short_description = 'Marcar como Concluído'

    def save_model(self, request, obj, form, change):
        """
        Sobrescreve save_model para adicionar lógica automática.

        Se o status mudou, registra automaticamente o revisor.

        Args:
            request: Request HTTP
            obj: Instância do modelo
            form: Form do admin
            change: Boolean indicando se é update ou create
        """
        if change:  # Se é uma atualização
            original = Complaint.objects.get(pk=obj.pk)
            # Se o status mudou, atualizar informações de revisão
            if original.status != obj.status:
                from django.utils import timezone
                obj.reviewed_by = request.user
                obj.reviewed_at = timezone.now()

        super().save_model(request, obj, form, change)
