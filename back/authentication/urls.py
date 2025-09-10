from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # JWT Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # User registration and profile endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('user-info/', views.user_info, name='user-info'),
    
    # Password management endpoints
    path('password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Email verification endpoints
    path('email/verify/', views.EmailVerificationView.as_view(), name='email-verify'),
    path('email/resend/', views.ResendEmailVerificationView.as_view(), name='email-resend-verification'),
    
    # Token and account management endpoints
    path('token/verify/', views.verify_token, name='token-verify'),
    path('account/delete/', views.delete_account, name='account-delete'),
    
    # Status and configuration endpoints
    path('status/', views.auth_status, name='auth-status'),
]