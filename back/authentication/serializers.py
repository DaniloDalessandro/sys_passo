from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import UserProfile, EmailVerification, PasswordResetToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['user_id'] = user.id
        token['role'] = user.profile.role if hasattr(user, 'profile') else 'viewer'

        return token

    def validate(self, attrs):
        """
        Permite login com e-mail ou username (case-insensitive).
        Normaliza o tempo de resposta para prevenir timing attacks.
        """
        from django.db.models import Q

        raw_identifier = attrs.get(self.username_field) or self.initial_data.get(self.username_field)
        password = attrs.get('password') or self.initial_data.get('password')

        if not password or not raw_identifier:
            raise serializers.ValidationError('Usuário e senha são obrigatórios.')

        identifier = raw_identifier.strip() if isinstance(raw_identifier, str) else str(raw_identifier)

        if not identifier:
            raise serializers.ValidationError('Usuário e senha são obrigatórios.')

        candidate_user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()

        if candidate_user:
            user = authenticate(username=candidate_user.username, password=password)
        else:
            # Normaliza o tempo de resposta mesmo quando o usuário não existe
            user = authenticate(username=identifier, password=password)

        if user and user.is_active:
            attrs[self.username_field] = user.username
            attrs['password'] = password
            user.save(update_fields=['last_login'])
            data = super().validate(attrs)
            data['user'] = UserSerializer(user).data
            return data

        raise serializers.ValidationError('Credenciais inválidas ou conta inativa.')

class UserRegistrationSerializer(serializers.ModelSerializer):
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
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este nome de usuário.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=True
        )
        
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('is_email_verified', 'email_verified_at', 'role')
        read_only_fields = ('is_email_verified', 'email_verified_at', 'role')

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
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
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
            raise serializers.ValidationError("Senha atual incorreta.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("As novas senhas não coincidem.")
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitação de redefinição de senha.
    A existência do e-mail não é validada aqui para prevenir enumeração de contas.
    """
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmação de redefinição de senha.
    """
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")

        try:
            reset_token = PasswordResetToken.objects.get(
                token=attrs['token'],
                is_used=False
            )
            if reset_token.is_expired():
                raise serializers.ValidationError("Token de redefinição expirado.")
            attrs['reset_token'] = reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Token de redefinição inválido ou expirado.")

        return attrs

class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer para verificação de e-mail.
    """
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            verification_token = EmailVerification.objects.get(
                token=value,
                is_used=False
            )
            if verification_token.is_expired():
                raise serializers.ValidationError("Token de verificação expirado.")
            return verification_token
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError("Token de verificação inválido ou expirado.")

    def save(self):
        from django.utils import timezone
        verification_token = self.validated_data['token']
        user = verification_token.user

        verification_token.is_used = True
        verification_token.save()

        if hasattr(user, 'profile'):
            user.profile.is_email_verified = True
            user.profile.email_verified_at = timezone.now()
            user.profile.save()

        return user

class EmailResendSerializer(serializers.Serializer):
    """
    Serializer para reenvio de e-mail de verificação.
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if hasattr(user, 'profile') and user.profile.is_email_verified:
                raise serializers.ValidationError("E-mail já verificado.")
            return user
        except User.DoesNotExist:
            raise serializers.ValidationError("Nenhum usuário encontrado com este e-mail.")

class UserManagementSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    is_email_verified = serializers.BooleanField(source='profile.is_email_verified', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'date_joined', 'last_login',
            'role', 'is_email_verified',
        )
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_email_verified')

class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        default='viewer',
        write_only=True,
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este e-mail.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Já existe um usuário com este nome de usuário.")
        return value

    def create(self, validated_data):
        from django.utils import timezone
        role = validated_data.pop('role', 'viewer')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=True,
        )
        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.is_email_verified = True
            user.profile.email_verified_at = timezone.now()
            user.profile.save()
        return user

class AdminUpdateUserSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
