from django.db import models
from django.core.exceptions import ValidationError


class SiteConfiguration(models.Model):
    """
    Singleton model to store site configuration data.
    Only one instance of this model should exist in the database.
    This stores all the editable content for the landing page.
    """

    # Company Information
    company_name = models.CharField(
        max_length=200,
        verbose_name="Nome da Empresa",
        help_text="Nome da empresa exibido no site"
    )

    phone = models.CharField(
        max_length=20,
        verbose_name="Telefone",
        help_text="Telefone principal da empresa (ex: (11) 1234-5678)"
    )

    email = models.EmailField(
        verbose_name="Email",
        help_text="Email de contato principal"
    )

    address = models.TextField(
        verbose_name="Endereço",
        help_text="Endereço completo da empresa"
    )

    # Social Media Links
    whatsapp = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="WhatsApp",
        help_text="Número do WhatsApp (ex: 5511912345678)"
    )

    facebook_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Facebook URL",
        help_text="Link completo do Facebook"
    )

    instagram_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Instagram URL",
        help_text="Link completo do Instagram"
    )

    linkedin_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="LinkedIn URL",
        help_text="Link completo do LinkedIn"
    )

    # Landing Page Content
    hero_title = models.CharField(
        max_length=255,
        verbose_name="Título Principal",
        help_text="Título principal da landing page (Hero Section)"
    )

    hero_subtitle = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Subtítulo",
        help_text="Subtítulo da landing page (Hero Section)"
    )

    about_text = models.TextField(
        verbose_name="Texto Sobre a Empresa",
        help_text="Texto descritivo sobre a empresa"
    )

    # Images
    logo = models.ImageField(
        upload_to='site_config/logos/',
        blank=True,
        null=True,
        verbose_name="Logo",
        help_text="Logo da empresa (formato PNG ou JPG)"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Atualizado em"
    )

    class Meta:
        verbose_name = "Configuração do Site"
        verbose_name_plural = "Configuração do Site"
        db_table = "site_configuration"

    def __str__(self):
        return f"Configuração do Site - {self.company_name}"

    def save(self, *args, **kwargs):
        """
        Override save method to implement singleton pattern.
        Ensures only one instance can exist in the database.
        """
        if not self.pk and SiteConfiguration.objects.exists():
            raise ValidationError(
                'Já existe uma configuração do site. '
                'Por favor, edite a configuração existente ao invés de criar uma nova.'
            )
        return super().save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        """
        Class method to get the singleton instance.
        Creates a default instance if none exists.
        """
        instance, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'company_name': 'Sys Passo',
                'phone': '(11) 0000-0000',
                'email': 'contato@syspasso.com',
                'address': 'Endereço da empresa',
                'hero_title': 'Bem-vindo ao Sys Passo',
                'about_text': 'Sobre a empresa...',
            }
        )
        return instance

    def delete(self, *args, **kwargs):
        """
        Override delete method to prevent deletion of the singleton instance.
        """
        raise ValidationError(
            'A configuração do site não pode ser deletada. '
            'Apenas edite os valores necessários.'
        )
