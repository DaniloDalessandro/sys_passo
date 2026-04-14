from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from core.throttling import AuthThrottle, PasswordResetThrottle, PublicReadThrottle
from core.exceptions import safe_error_response, get_error_message

from .models import UserProfile, EmailVerification, PasswordResetToken
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    EmailResendSerializer,
    UserManagementSerializer,
    AdminCreateUserSerializer,
    AdminUpdateUserSerializer,
)
from .permissions import IsAdminRole
from .utils import (
    get_client_ip,
    get_user_agent,
    log_user_activity,
    send_password_reset_email,
    send_email_verification,
    send_password_change_notification
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View de login JWT com dados adicionais do usuário.
    Tokens são definidos como cookies HttpOnly para proteger contra XSS.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access = response.data.get('access')
            refresh = response.data.get('refresh')
            is_secure = not settings.DEBUG

            if access:
                response.set_cookie(
                    'access',
                    access,
                    max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                    httponly=True,
                    secure=is_secure,
                    samesite='Strict',
                    path='/',
                )
            if refresh:
                response.set_cookie(
                    'refresh',
                    refresh,
                    max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                    httponly=True,
                    secure=is_secure,
                    samesite='Strict',
                    path='/',
                )

            try:
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                user = serializer.user

                log_user_activity(
                    user=user,
                    action='login',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
            except Exception:
                pass

        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    View de refresh JWT que lê o token do cookie se não fornecido no body.
    Define novos tokens como cookies HttpOnly.
    """

    def post(self, request, *args, **kwargs):
        # Se o refresh token não está no body, tenta o cookie
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'refresh' not in data:
            refresh_cookie = request.COOKIES.get('refresh')
            if refresh_cookie:
                data['refresh'] = refresh_cookie

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        access = serializer.validated_data.get('access')
        refresh_new = serializer.validated_data.get('refresh')
        is_secure = not settings.DEBUG

        if access:
            response.set_cookie(
                'access',
                access,
                max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                httponly=True,
                secure=is_secure,
                samesite='Strict',
                path='/',
            )
        if refresh_new:
            response.set_cookie(
                'refresh',
                refresh_new,
                max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
                httponly=True,
                secure=is_secure,
                samesite='Strict',
                path='/',
            )

        return response


class UserRegistrationView(APIView):
    """
    Cadastro de nova conta de usuário com tokens JWT.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()

                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token

                    email_verification = user.email_verifications.filter(is_used=False).first()

                    if email_verification:
                        send_email_verification(user, email_verification, request)

                    log_user_activity(
                        user=user,
                        action='register',
                        ip_address=get_client_ip(request),
                        details={'user_agent': get_user_agent(request)}
                    )

                    user_serializer = UserSerializer(user)

                    return Response({
                        'message': 'Usuário cadastrado com sucesso. Verifique seu e-mail para ativar a conta.',
                        'user': user_serializer.data,
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh)
                        },
                        'email_verification_sent': bool(email_verification)
                    }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return safe_error_response(
                    message='Falha ao criar usuário',
                    exception=e,
                    context={'action': 'user_registration'}
                )

        return Response({
            'error': 'Falha no cadastro',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """
    Logout do usuário e invalidação do refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh') or request.COOKIES.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            log_user_activity(
                user=request.user,
                action='logout',
                ip_address=get_client_ip(request),
                details={'user_agent': get_user_agent(request)}
            )

            response = Response({
                'message': 'Logout realizado com sucesso'
            }, status=status.HTTP_200_OK)

            response.delete_cookie('access', path='/')
            response.delete_cookie('refresh', path='/')

            return response

        except Exception as e:
            return safe_error_response(
                message='Falha ao realizar logout',
                status_code=status.HTTP_400_BAD_REQUEST,
                exception=e,
                context={'action': 'user_logout', 'user': request.user.username}
            )


class UserProfileView(RetrieveUpdateAPIView):
    """
    Consulta e atualização de informações do perfil do usuário.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()

            log_user_activity(
                user=request.user,
                action='profile_update',
                ip_address=get_client_ip(request),
                details={'updated_fields': list(request.data.keys())}
            )
            
            return Response({
                'message': 'Perfil atualizado com sucesso',
                'user': UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Falha na atualização do perfil',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """
    Alteração de senha do usuário.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            try:
                user = serializer.save()

                # Invalida todos os refresh tokens existentes para forçar re-autenticação em todos os dispositivos
                from django.db import IntegrityError
                outstanding_tokens = user.outstandingtoken_set.all()
                blacklist_entries = [
                    BlacklistedToken(token=token)
                    for token in outstanding_tokens
                ]
                try:
                    BlacklistedToken.objects.bulk_create(
                        blacklist_entries,
                        ignore_conflicts=True
                    )
                except (IntegrityError, Exception) as e:
                    for token in outstanding_tokens:
                        try:
                            BlacklistedToken.objects.get_or_create(token=token)
                        except Exception:
                            pass

                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token

                send_password_change_notification(user, request)

                log_user_activity(
                    user=user,
                    action='password_change',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Senha alterada com sucesso',
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }
                }, status=status.HTTP_200_OK)

            except Exception as e:
                return safe_error_response(
                    message='Falha ao alterar senha',
                    exception=e,
                    context={'action': 'password_change', 'user': request.user.username}
                )

        return Response({
            'error': 'Falha na alteração de senha',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    Solicitação de redefinição de senha via e-mail.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                user = User.objects.get(email=email)

                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

                reset_token = PasswordResetToken.objects.create(
                    user=user,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request)
                )

                send_password_reset_email(user, reset_token, request)

                log_user_activity(
                    user=user,
                    action='password_reset_request',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'E-mail de redefinição de senha enviado. Verifique sua caixa de entrada.'
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                # Resposta genérica para prevenir enumeração de contas
                return Response({
                    'message': 'Se existir uma conta com este e-mail, um link de redefinição foi enviado.'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return safe_error_response(
                    message='Falha ao processar solicitação de reset de senha',
                    exception=e,
                    context={'action': 'password_reset_request'}
                )
        
        return Response({
            'error': 'Endereço de e-mail inválido',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Confirmação de redefinição de senha com token e nova senha.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()

                from django.db import IntegrityError
                outstanding_tokens = user.outstandingtoken_set.all()
                blacklist_entries = [
                    BlacklistedToken(token=token)
                    for token in outstanding_tokens
                ]
                try:
                    BlacklistedToken.objects.bulk_create(
                        blacklist_entries,
                        ignore_conflicts=True
                    )
                except (IntegrityError, Exception):
                    for token in outstanding_tokens:
                        try:
                            BlacklistedToken.objects.get_or_create(token=token)
                        except Exception:
                            pass

                log_user_activity(
                    user=user,
                    action='password_reset_confirm',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Senha redefinida com sucesso. Você já pode fazer login com a nova senha.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return safe_error_response(
                    message='Falha ao confirmar reset de senha',
                    exception=e,
                    context={'action': 'password_reset_confirm'}
                )
        
        return Response({
            'error': 'Falha na confirmação de redefinição de senha',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """
    Verificação de e-mail do usuário com token.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()

                log_user_activity(
                    user=user,
                    action='email_verification',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'E-mail verificado com sucesso! Sua conta está ativa.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return safe_error_response(
                    message='Falha ao verificar email',
                    exception=e,
                    context={'action': 'email_verification'}
                )
        
        return Response({
            'error': 'Falha na verificação de e-mail',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailVerificationView(APIView):
    """
    Reenvio do token de verificação de e-mail.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = EmailResendSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.validated_data['email']  # campo 'email' retorna o objeto User

                EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)

                verification_token = EmailVerification.objects.create(user=user)

                send_email_verification(user, verification_token, request)

                log_user_activity(
                    user=user,
                    action='email_verification_resend',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'E-mail de verificação reenviado. Verifique sua caixa de entrada.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return safe_error_response(
                    message='Falha ao reenviar email de verificação',
                    exception=e,
                    context={'action': 'resend_email_verification'}
                )
        
        return Response({
            'error': 'Endereço de e-mail inválido',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """
    Retorna as informações do usuário autenticado.
    """
    serializer = UserSerializer(request.user)
    return Response({
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    """
    Exclusão da conta do usuário autenticado. Requer confirmação de senha.
    """
    password = request.data.get('password')
    if not password:
        return Response({
            'error': 'A senha atual é obrigatória para excluir a conta.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(password):
        return Response({
            'error': 'Senha incorreta.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = request.user
        username = user.username

        log_user_activity(
            user=user,
            action='account_deletion',
            ip_address=get_client_ip(request),
            details={'user_agent': get_user_agent(request)}
        )

        user.delete()

        return Response({
            'message': f'Conta de {username} excluída com sucesso'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return safe_error_response(
            message='Falha ao deletar conta',
            exception=e,
            context={'action': 'account_deletion', 'user': request.user.username}
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    """
    Valida o token JWT e retorna informações do usuário.
    """
    try:
        user_serializer = UserSerializer(request.user)

        return Response({
            'valid': True,
            'user': user_serializer.data,
            'token_type': 'JWT'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return safe_error_response(
            message='Falha ao validar token',
            exception=e,
            context={'action': 'token_validation'}
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicReadThrottle])
def auth_status(request):
    """
    Retorna o status do sistema de autenticação.
    """
    return Response({
        'status': 'ok',
        'authentication_type': 'JWT',
    }, status=status.HTTP_200_OK)


class UserManagementListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        from django.db.models import Q
        queryset = User.objects.select_related('profile').all().order_by('-date_joined')

        search = request.query_params.get('search', '')
        role_filter = request.query_params.get('role', '')
        is_active = request.query_params.get('is_active', '')

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if role_filter:
            queryset = queryset.filter(profile__role=role_filter)
        if is_active in ('true', 'false'):
            queryset = queryset.filter(is_active=(is_active == 'true'))

        serializer = UserManagementSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()
                    log_user_activity(
                        user=request.user,
                        action='admin_create_user',
                        ip_address=get_client_ip(request),
                        details={'created_user': user.username}
                    )
                    return Response(UserManagementSerializer(user).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return safe_error_response(
                    message='Falha ao criar usuário',
                    exception=e,
                    context={'action': 'admin_create_user'}
                )
        return Response({'error': 'Dados inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UserManagementDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_object(self, pk):
        try:
            return User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return None

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user and 'role' in request.data and request.data['role'] != 'admin':
            return Response(
                {'error': 'Você não pode alterar seu próprio papel de administrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AdminUpdateUserSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                with transaction.atomic():
                    if 'first_name' in data:
                        user.first_name = data['first_name']
                    if 'last_name' in data:
                        user.last_name = data['last_name']
                    if 'is_active' in data:
                        user.is_active = data['is_active']
                    user.save()

                    if 'role' in data and hasattr(user, 'profile'):
                        user.profile.role = data['role']
                        user.profile.save()

                    log_user_activity(
                        user=request.user,
                        action='admin_update_user',
                        ip_address=get_client_ip(request),
                        details={'target_user': user.username, 'changes': list(data.keys())}
                    )
                    return Response(UserManagementSerializer(user).data, status=status.HTTP_200_OK)
            except Exception as e:
                return safe_error_response(
                    message='Falha ao atualizar usuário',
                    exception=e,
                    context={'action': 'admin_update_user'}
                )
        return Response({'error': 'Dados inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)