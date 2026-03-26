from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # Autenticação JWT - aceita com e sem trailing slash
    re_path(r'^login/?$', views.CustomTokenObtainPairView.as_view(), name='login'),
    re_path(r'^refresh/?$', TokenRefreshView.as_view(), name='token-refresh'),
    re_path(r'^logout/?$', views.UserLogoutView.as_view(), name='logout'),

    # Cadastro e perfil
    re_path(r'^register/?$', views.UserRegistrationView.as_view(), name='register'),
    re_path(r'^profile/?$', views.UserProfileView.as_view(), name='profile'),
    re_path(r'^user-info/?$', views.user_info, name='user-info'),

    # Gerenciamento de senha
    re_path(r'^password/change/?$', views.PasswordChangeView.as_view(), name='password-change'),
    re_path(r'^password/reset/?$', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    re_path(r'^password/reset/confirm/?$', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Verificação de e-mail
    re_path(r'^email/verify/?$', views.EmailVerificationView.as_view(), name='email-verify'),
    re_path(r'^email/resend/?$', views.ResendEmailVerificationView.as_view(), name='email-resend-verification'),

    # Gerenciamento de token e conta
    re_path(r'^token/verify/?$', views.verify_token, name='token-verify'),
    re_path(r'^account/delete/?$', views.delete_account, name='account-delete'),

    # Status
    re_path(r'^status/?$', views.auth_status, name='auth-status'),
]
