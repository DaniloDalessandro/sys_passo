from django.urls import path, re_path
from . import views

app_name = 'authentication'

urlpatterns = [
    re_path(r'^login/?$', views.CustomTokenObtainPairView.as_view(), name='login'),
    re_path(r'^refresh/?$', views.CustomTokenRefreshView.as_view(), name='token-refresh'),
    re_path(r'^logout/?$', views.UserLogoutView.as_view(), name='logout'),

    re_path(r'^register/?$', views.UserRegistrationView.as_view(), name='register'),
    re_path(r'^profile/?$', views.UserProfileView.as_view(), name='profile'),
    re_path(r'^user-info/?$', views.user_info, name='user-info'),

    re_path(r'^password/change/?$', views.PasswordChangeView.as_view(), name='password-change'),
    re_path(r'^password/reset/?$', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    re_path(r'^password/reset/confirm/?$', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    re_path(r'^email/verify/?$', views.EmailVerificationView.as_view(), name='email-verify'),
    re_path(r'^email/resend/?$', views.ResendEmailVerificationView.as_view(), name='email-resend-verification'),

    re_path(r'^token/verify/?$', views.verify_token, name='token-verify'),
    re_path(r'^account/delete/?$', views.delete_account, name='account-delete'),

    re_path(r'^status/?$', views.auth_status, name='auth-status'),

    re_path(r'^users/?$', views.UserManagementListCreateView.as_view(), name='user-management-list'),
    re_path(r'^users/(?P<pk>\d+)/?$', views.UserManagementDetailView.as_view(), name='user-management-detail'),
]
