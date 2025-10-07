import re
from rest_framework import serializers
from .models import SiteConfiguration


class SiteConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer for SiteConfiguration model.
    Handles validation and serialization of site configuration data.
    """

    logo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SiteConfiguration
        fields = [
            'id',
            'company_name',
            'logo',
            'logo_url',
            'phone',
            'email',
            'address',
            'whatsapp',
            'facebook_url',
            'instagram_url',
            'linkedin_url',
            'hero_title',
            'hero_subtitle',
            'about_text',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'logo_url')

    def get_logo_url(self, obj):
        """
        Return the full URL of the logo or None.
        """
        if obj.logo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def validate_phone(self, value):
        """
        Validate Brazilian phone number format.
        Accepts: (XX) XXXX-XXXX or (XX) XXXXX-XXXX
        """
        # Remove all non-digit characters for validation
        digits_only = re.sub(r'\D', '', value)

        # Brazilian phone should have 10 or 11 digits (with area code)
        if len(digits_only) not in [10, 11]:
            raise serializers.ValidationError(
                'Telefone deve ter 10 ou 11 dígitos (incluindo DDD). '
                'Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX'
            )

        return value

    def validate_whatsapp(self, value):
        """
        Validate WhatsApp number.
        Should be digits only, 10-13 characters (for international format).
        """
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', value)

        if len(digits_only) < 10 or len(digits_only) > 13:
            raise serializers.ValidationError(
                'WhatsApp deve ter entre 10 e 13 dígitos. '
                'Exemplo: 5511987654321 (para formato internacional)'
            )

        return value

    def validate_email(self, value):
        """
        Validate email format and domain.
        """
        if not value or '@' not in value:
            raise serializers.ValidationError('E-mail inválido')

        # Additional validation: check if domain has at least one dot
        domain = value.split('@')[1]
        if '.' not in domain:
            raise serializers.ValidationError('Domínio do e-mail inválido')

        return value.lower()

    def validate_hero_title(self, value):
        """
        Validate hero title length.
        """
        if len(value) > 300:
            raise serializers.ValidationError(
                'Título não pode ter mais de 300 caracteres'
            )
        if len(value.strip()) == 0:
            raise serializers.ValidationError('Título não pode estar vazio')

        return value.strip()

    def validate_hero_subtitle(self, value):
        """
        Validate hero subtitle length.
        """
        if len(value) > 500:
            raise serializers.ValidationError(
                'Subtítulo não pode ter mais de 500 caracteres'
            )
        if len(value.strip()) == 0:
            raise serializers.ValidationError('Subtítulo não pode estar vazio')

        return value.strip()

    def validate_about_text(self, value):
        """
        Validate about text is not empty.
        """
        if len(value.strip()) == 0:
            raise serializers.ValidationError(
                'Texto sobre a empresa não pode estar vazio'
            )

        return value.strip()

    def validate(self, attrs):
        """
        Object-level validation.
        """
        # Ensure at least one contact method is provided
        if not any([
            attrs.get('phone'),
            attrs.get('email'),
            attrs.get('whatsapp')
        ]):
            raise serializers.ValidationError(
                'Pelo menos um método de contato deve ser fornecido '
                '(telefone, e-mail ou WhatsApp)'
            )

        return attrs
