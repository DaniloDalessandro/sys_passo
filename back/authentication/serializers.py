from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import UserProfile, EmailVerification, PasswordResetToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token serializer with additional user data
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['user_id'] = user.id
        
        return token

    def validate(self, attrs):
        """
        Otimizado para reduzir queries e evitar timing attacks.
        Permite login com email ou username (case-insensitive).
        """
        from django.db.models import Q

        raw_identifier = attrs.get(self.username_field) or self.initial_data.get(self.username_field)
        password = attrs.get('password') or self.initial_data.get('password')

        if not password or not raw_identifier:
            raise serializers.ValidationError('Username and password required.')

        # Clean identifier
        identifier = raw_identifier.strip() if isinstance(raw_identifier, str) else str(raw_identifier)

        if not identifier:
            raise serializers.ValidationError('Username and password required.')

        # Busca única otimizada: procura por username OU email (case-insensitive)
        candidate_user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()

        if candidate_user:
            # Tenta autenticar com o username encontrado
            user = authenticate(username=candidate_user.username, password=password)
        else:
            # Se não encontrou usuário, ainda chama authenticate para normalizar tempo
            # (prevenção de timing attack)
            user = authenticate(username=identifier, password=password)

        if user and user.is_active:
            # Sync attrs para o parent serializer
            attrs[self.username_field] = user.username
            attrs['password'] = password

            # Update last login
            user.save(update_fields=['last_login'])
            data = super().validate(attrs)
            data['user'] = UserSerializer(user).data
            return data

        raise serializers.ValidationError('Invalid credentials or inactive account.')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with JWT support
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=True  # Set to False if email verification is required
        )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('is_email_verified', 'email_verified_at')
        read_only_fields = ('is_email_verified', 'email_verified_at')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'date_joined', 'last_login', 'is_active', 'profile')
        read_only_fields = ('id', 'date_joined', 'last_login')


class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'profile')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match.")
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request

    Nota: Não validamos se o email existe aqui por segurança
    (prevenir account enumeration). A validação é feita na view.
    """
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    """
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        
        # Validate token
        try:
            reset_token = PasswordResetToken.objects.get(
                token=attrs['token'],
                is_used=False
            )
            if reset_token.is_expired():
                raise serializers.ValidationError("Reset token has expired.")
            attrs['reset_token'] = reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset token.")
        
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification
    """
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            verification_token = EmailVerification.objects.get(
                token=value,
                is_used=False
            )
            if verification_token.is_expired():
                raise serializers.ValidationError("Verification token has expired.")
            return verification_token
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification token.")

    def save(self):
        """Mark email as verified and token as used"""
        from django.utils import timezone
        verification_token = self.validated_data['token']
        user = verification_token.user

        # Mark token as used
        verification_token.is_used = True
        verification_token.save()

        # Mark email as verified in UserProfile
        if hasattr(user, 'profile'):
            user.profile.is_email_verified = True
            user.profile.email_verified_at = timezone.now()
            user.profile.save()

        return user


class EmailResendSerializer(serializers.Serializer):
    """
    Serializer for resending email verification
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            # Corrigido: verifica se email já foi verificado usando UserProfile
            if hasattr(user, 'profile') and user.profile.is_email_verified:
                raise serializers.ValidationError("Email is already verified.")
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
