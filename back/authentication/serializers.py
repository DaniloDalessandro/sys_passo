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
        # Allow login with email or username (case-insensitive and trimmed)
        raw_identifier = attrs.get(self.username_field) or self.initial_data.get(self.username_field)
        password = attrs.get('password') or self.initial_data.get('password')

        if password is None:
            raise serializers.ValidationError('Username and password required.')

        identifier_candidates = []

        if isinstance(raw_identifier, str) and raw_identifier.strip():
            identifier_candidates.append(raw_identifier.strip())

        # Accept explicit email field from request payload
        raw_email = self.initial_data.get('email')
        if isinstance(raw_email, str):
            cleaned_email = raw_email.strip()
            if cleaned_email and cleaned_email.lower() not in [c.lower() for c in identifier_candidates]:
                identifier_candidates.append(cleaned_email)

        if not identifier_candidates:
            raise serializers.ValidationError('Username and password required.')

        user = None

        for candidate in identifier_candidates:
            # Try direct authentication using provided identifier
            user = authenticate(username=candidate, password=password)
            if user:
                break

            # Try matching by username case-insensitively
            candidate_user = User.objects.filter(username__iexact=candidate).first()
            if candidate_user:
                user = authenticate(username=candidate_user.username, password=password)
                if user:
                    break

            # Try matching by email case-insensitively
            if '@' in candidate:
                candidate_user = User.objects.filter(email__iexact=candidate).first()
                if candidate_user:
                    user = authenticate(username=candidate_user.username, password=password)
                    if user:
                        break

        if user and user.is_active:
            # Sync attrs so parent serializer can issue tokens correctly
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
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            pass
        return value


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


class EmailResendSerializer(serializers.Serializer):
    """
    Serializer for resending email verification
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if user.is_active:
                raise serializers.ValidationError("Email is already verified.")
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
