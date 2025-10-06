from rest_framework import serializers
from .models import SiteConfiguration


class SiteConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer for SiteConfiguration model.
    Handles serialization of all site configuration data for the landing page.
    """

    # Custom field to return the full URL for the logo image
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteConfiguration
        fields = [
            'id',
            'company_name',
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
            'logo',
            'logo_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_logo_url(self, obj):
        """
        Returns the full URL for the logo image.
        Returns None if no logo is uploaded.
        """
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def validate_phone(self, value):
        """
        Validates the phone number format.
        """
        if value and len(value) < 10:
            raise serializers.ValidationError(
                "O número de telefone deve ter pelo menos 10 dígitos."
            )
        return value

    def validate_whatsapp(self, value):
        """
        Validates the WhatsApp number format.
        Should be in international format (e.g., 5511912345678).
        """
        if value:
            # Remove any non-digit characters
            digits_only = ''.join(filter(str.isdigit, value))
            if len(digits_only) < 10:
                raise serializers.ValidationError(
                    "O número do WhatsApp deve ter pelo menos 10 dígitos."
                )
        return value

    def validate_email(self, value):
        """
        Validates the email format.
        """
        if value and '@' not in value:
            raise serializers.ValidationError("Email inválido.")
        return value

    def to_representation(self, instance):
        """
        Customize the output representation.
        Ensures empty fields are returned as null instead of empty strings.
        """
        representation = super().to_representation(instance)

        # Convert empty strings to None for optional fields
        optional_fields = [
            'whatsapp',
            'facebook_url',
            'instagram_url',
            'linkedin_url',
            'hero_subtitle'
        ]

        for field in optional_fields:
            if field in representation and representation[field] == '':
                representation[field] = None

        return representation
