from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


class SiteConfigurationManager(models.Manager):
    """Custom manager for SiteConfiguration with singleton pattern"""

    def get_configuration(self):
        """
        Get the singleton site configuration instance.
        Creates one if it doesn't exist.
        """
        config, created = self.get_or_create(pk=1)
        return config


class SiteConfiguration(models.Model):
    """
    Singleton model for site configuration.
    Only one instance should exist in the database.
    """

    # Company Information
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

    # Contact Information
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

    # Social Media
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

    # Landing Page Content
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

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Atualizado em'
    )

    # Custom manager
    objects = SiteConfigurationManager()

    class Meta:
        verbose_name = 'Configuração do Site'
        verbose_name_plural = 'Configurações do Site'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.company_name} - Configuração do Site'

    def save(self, *args, **kwargs):
        """
        Override save to enforce singleton pattern.
        Always save with pk=1 to ensure only one instance exists.
        """
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Prevent deletion of the singleton instance.
        """
        raise ValidationError('Não é possível deletar a configuração do site.')

    @property
    def logo_url(self):
        """
        Return the full URL of the logo or None if no logo exists.
        """
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        return None

    @classmethod
    def load(cls):
        """
        Convenience method to load the singleton instance.
        Creates one if it doesn't exist.
        """
        return cls.objects.get_configuration()
