from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.core.cache import cache


class SiteConfigurationManager(models.Manager):
    """Gerenciador customizado para SiteConfiguration com padrão singleton."""

    def get_configuration(self):
        """
        Retorna a instância singleton da configuração do site.
        Cria uma se não existir. Utiliza cache para evitar consultas repetidas ao banco.
        """
        config = cache.get('site_configuration')
        if config is None:
            config, created = self.get_or_create(pk=1)
            cache.set('site_configuration', config, 3600)
        return config


class SiteConfiguration(models.Model):
    """
    Model singleton para configuração do site.
    Apenas uma instância deve existir no banco de dados.
    """

    company_name = models.CharField(
        max_length=200,
        verbose_name='Nome da Empresa',
        help_text='Nome oficial da empresa'
    )
    logo = models.ImageField(
        upload_to='site_config/logos/',
        blank=True,
        null=True,
        verbose_name='Logo',
        help_text='Logo da empresa (formatos: JPG, PNG)'
    )
    phone = models.CharField(
        max_length=20,
        verbose_name='Telefone',
        help_text='Telefone principal da empresa'
    )
    email = models.EmailField(
        verbose_name='E-mail',
        help_text='E-mail de contato principal'
    )
    address = models.TextField(
        verbose_name='Endereço',
        help_text='Endereço completo da empresa'
    )
    whatsapp = models.CharField(
        max_length=20,
        verbose_name='WhatsApp',
        help_text='Número do WhatsApp (apenas números)'
    )
    facebook_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='Facebook',
        help_text='URL completa da página do Facebook'
    )
    instagram_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='Instagram',
        help_text='URL completa do perfil do Instagram'
    )
    linkedin_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='LinkedIn',
        help_text='URL completa da página do LinkedIn'
    )
    hero_title = models.CharField(
        max_length=300,
        verbose_name='Título Principal',
        help_text='Título principal da página inicial'
    )
    hero_subtitle = models.CharField(
        max_length=500,
        verbose_name='Subtítulo',
        help_text='Subtítulo da página inicial'
    )
    about_text = models.TextField(
        verbose_name='Texto Sobre',
        help_text='Texto descritivo sobre a empresa'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )

    objects = SiteConfigurationManager()

    class Meta:
        verbose_name = 'Configuração do Site'
        verbose_name_plural = 'Configurações do Site'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.company_name} - Configuração do Site'

    def save(self, *args, **kwargs):
        """
        Garante o padrão singleton salvando sempre com pk=1.
        Invalida o cache após salvar.
        """
        self.pk = 1
        super().save(*args, **kwargs)
        cache.delete('site_configuration')

    def delete(self, *args, **kwargs):
        """Impede a exclusão da instância singleton."""
        raise ValidationError(
            'Não é possível deletar a configuração do site. '
            'Esta é uma configuração única e necessária para o funcionamento do sistema.'
        )

    @property
    def logo_url(self):
        """Retorna a URL completa do logo ou None se não houver logo."""
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        return None

    @classmethod
    def load(cls):
        """Atalho para carregar a instância singleton."""
        return cls.objects.get_configuration()
