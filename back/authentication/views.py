from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from django.conf import settings
# Rate limiting disabled for development
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

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
    EmailResendSerializer
)
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
    Custom JWT login view with additional user data
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log successful login
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
                pass  # Don't fail the login if logging fails
                
        return response


class UserRegistrationView(APIView):
    """
    Register a new user account with JWT tokens
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Create user
                    user = serializer.save()
                    
                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    # Get or create email verification token (created by signal)
                    email_verification = user.email_verifications.filter(is_used=False).first()
                    
                    # Send verification email
                    if email_verification:
                        send_email_verification(user, email_verification, request)
                    
                    # Log registration
                    log_user_activity(
                        user=user,
                        action='register',
                        ip_address=get_client_ip(request),
                        details={'user_agent': get_user_agent(request)}
                    )
                    
                    # Serialize user data
                    user_serializer = UserSerializer(user)
                    
                    return Response({
                        'message': 'User registered successfully. Please check your email to verify your account.',
                        'user': user_serializer.data,
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh)
                        },
                        'email_verification_sent': bool(email_verification)
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'error': 'Registration failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Registration failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """
    Logout user and blacklist refresh token
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Log logout
            log_user_activity(
                user=request.user,
                action='logout',
                ip_address=get_client_ip(request),
                details={'user_agent': get_user_agent(request)}
            )
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Logout failed',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(RetrieveUpdateAPIView):
    """
    Retrieve and update user profile information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer
    
    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        """
        Get user profile information
        """
        serializer = self.get_serializer(request.user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        """
        Update user profile information
        """
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Log profile update
            log_user_activity(
                user=request.user,
                action='profile_update',
                ip_address=get_client_ip(request),
                details={'updated_fields': list(request.data.keys())}
            )
            
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Profile update failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """
    Change user password
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                # Change password
                user = serializer.save()
                
                # Blacklist all existing refresh tokens for this user
                # This forces re-authentication on all devices
                tokens = user.outstandingtoken_set.all()
                for token in tokens:
                    try:
                        BlacklistedToken.objects.get_or_create(token=token)
                    except Exception:
                        pass  # Handle any blacklisting errors gracefully
                
                # Generate new tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                # Send notification (optional)
                send_password_change_notification(user, request)
                
                # Log password change
                log_user_activity(
                    user=user,
                    action='password_change',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Password changed successfully',
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': 'Password change failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Password change failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    Request password reset - send email with reset token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                user = User.objects.get(email=email)
                
                # Invalidate any existing password reset tokens for this user
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
                
                # Create new password reset token
                reset_token = PasswordResetToken.objects.create(
                    user=user,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request)
                )
                
                # Send password reset email
                send_password_reset_email(user, reset_token, request)
                
                # Log password reset request
                log_user_activity(
                    user=user,
                    action='password_reset_request',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Password reset email sent successfully. Please check your email.'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # For security, don't reveal that the email doesn't exist
                return Response({
                    'message': 'If an account with this email exists, a password reset link has been sent.'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': 'Password reset request failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Invalid email address',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with token and set new password
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Reset password and mark token as used
                user = serializer.save()
                
                # Blacklist all existing refresh tokens for this user
                tokens = user.outstandingtoken_set.all()
                for token in tokens:
                    try:
                        BlacklistedToken.objects.get_or_create(token=token)
                    except Exception:
                        pass
                
                # Log password reset
                log_user_activity(
                    user=user,
                    action='password_reset_confirm',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Password reset successfully. You can now log in with your new password.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': 'Password reset confirmation failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Password reset confirmation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """
    Verify user email with verification token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Verify email and mark token as used
                user = serializer.save()
                
                # Log email verification
                log_user_activity(
                    user=user,
                    action='email_verification',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Email verified successfully! Your account is now fully activated.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': 'Email verification failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Email verification failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailVerificationView(APIView):
    """
    Resend email verification token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResendEmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.validated_data['email']  # This is actually the user object
                
                # Invalidate existing verification tokens
                EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)
                
                # Create new verification token
                verification_token = EmailVerification.objects.create(user=user)
                
                # Send verification email
                send_email_verification(user, verification_token, request)
                
                # Log resend verification
                log_user_activity(
                    user=user,
                    action='email_verification_resend',
                    ip_address=get_client_ip(request),
                    details={'user_agent': get_user_agent(request)}
                )
                
                return Response({
                    'message': 'Verification email sent successfully. Please check your email.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': 'Failed to resend verification email',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Invalid email address',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Function-based views for simple operations
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """
    Get current user information
    """
    serializer = UserSerializer(request.user)
    return Response({
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    """
    Delete user account
    """
    try:
        user = request.user
        username = user.username
        
        # Log account deletion before deleting
        log_user_activity(
            user=user,
            action='account_deletion',
            ip_address=get_client_ip(request),
            details={'user_agent': get_user_agent(request)}
        )
        
        # Delete user (this will cascade delete related objects)
        user.delete()
        
        return Response({
            'message': f'Account for {username} deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Account deletion failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    """
    Verify JWT token and return user info
    """
    try:
        # If we get here, the token is valid (checked by authentication)
        user_serializer = UserSerializer(request.user)
        
        return Response({
            'valid': True,
            'user': user_serializer.data,
            'token_type': 'JWT'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'valid': False,
            'error': 'Token validation failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auth_status(request):
    """
    Check authentication status and configuration
    """
    return Response({
        'authentication_type': 'JWT',
        'access_token_lifetime_minutes': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds() / 60,
        'refresh_token_lifetime_days': settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].days,
        'email_verification_required': getattr(settings, 'ACCOUNT_EMAIL_VERIFICATION', 'mandatory') == 'mandatory',
        'password_reset_timeout_hours': settings.PASSWORD_RESET_TIMEOUT / 3600,
        'email_verification_timeout_hours': settings.EMAIL_VERIFICATION_TIMEOUT / 3600,
    }, status=status.HTTP_200_OK)