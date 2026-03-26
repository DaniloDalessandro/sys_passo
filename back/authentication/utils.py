from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.contrib.sites.shortcuts import get_current_site
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """
    Retorna o endereço IP do cliente a partir da requisição.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """
    Retorna o user agent da requisição.
    """
    return request.META.get('HTTP_USER_AGENT', '')


def build_absolute_uri(request, path):
    """
    Constrói uma URI absoluta a partir de um caminho relativo.
    Quando a requisição não está disponível (ex: tarefas Celery), usa SITE_DOMAIN das configurações.
    """
    if request:
        return request.build_absolute_uri(path)
    else:
        protocol = 'https' if getattr(settings, 'USE_TLS', False) else 'http'
        domain = getattr(settings, 'SITE_DOMAIN', 'localhost:8000')
        return f"{protocol}://{domain}{path}"


@shared_task
def send_email_async(subject, template_name, context, to_email, from_email=None):
    """
    Tarefa Celery para envio assíncrono de e-mails.
    """
    try:
        send_templated_email(subject, template_name, context, to_email, from_email, sync=True)
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_templated_email(subject, template_name, context, to_email, from_email=None, sync=False):
    """
    Envia e-mail com template HTML e versão em texto puro.

    Args:
        subject (str): Assunto do e-mail
        template_name (str): Nome do template sem extensão (ex: 'password_reset_email')
        context (dict): Variáveis de contexto do template
        to_email (str): E-mail do destinatário
        from_email (str, optional): E-mail do remetente
        sync (bool): Se True, envia de forma síncrona; se False, usa Celery
    """
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL

    context.update({
        'timestamp': timezone.now(),
        'site_name': getattr(settings, 'SITE_NAME', 'SysPasso'),
    })

    if sync or not hasattr(settings, 'CELERY_BROKER_URL'):
        _send_email_sync(subject, template_name, context, to_email, from_email)
    else:
        send_email_async.delay(subject, template_name, context, to_email, from_email)


def _send_email_sync(subject, template_name, context, to_email, from_email):
    """
    Envia e-mail com template de forma síncrona.
    """
    try:
        html_template = f'authentication/emails/{template_name}.html'
        text_template = f'authentication/emails/{template_name}.txt'

        html_content = render_to_string(html_template, context)
        text_content = render_to_string(text_template, context)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Email sent successfully to {to_email}")
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise


def send_password_reset_email(user, token_obj, request=None):
    """
    Envia e-mail de redefinição de senha para o usuário.

    Args:
        user: Instância do usuário
        token_obj: Instância de PasswordResetToken
        request: Objeto da requisição HTTP (opcional)
    """
    reset_path = f'/auth/password/reset/confirm/?token={token_obj.token}'
    reset_url = build_absolute_uri(request, reset_path)
    
    context = {
        'user': user,
        'token': token_obj.token,
        'reset_url': reset_url,
        'ip_address': get_client_ip(request) if request else 'Unknown',
        'expires_at': token_obj.expires_at,
    }
    
    subject = 'Solicitação de Redefinição de Senha - SysPasso'
    send_templated_email(
        subject=subject,
        template_name='password_reset_email',
        context=context,
        to_email=user.email,
        sync=getattr(settings, 'EMAIL_SEND_SYNC', True)
    )


def send_email_verification(user, token_obj, request=None):
    """
    Envia e-mail de verificação para o usuário.

    Args:
        user: Instância do usuário
        token_obj: Instância de EmailVerification
        request: Objeto da requisição HTTP (opcional)
    """
    verification_path = f'/auth/email/verify/?token={token_obj.token}'
    verification_url = build_absolute_uri(request, verification_path)
    
    context = {
        'user': user,
        'token': token_obj.token,
        'verification_url': verification_url,
        'expires_at': token_obj.expires_at,
    }
    
    subject = 'Bem-vindo ao SysPasso - Verifique seu E-mail'
    send_templated_email(
        subject=subject,
        template_name='email_verification',
        context=context,
        to_email=user.email,
        sync=getattr(settings, 'EMAIL_SEND_SYNC', True)
    )


def send_password_change_notification(user, request=None):
    """
    Envia notificação por e-mail quando a senha é alterada.

    Args:
        user: Instância do usuário
        request: Objeto da requisição HTTP (opcional)
    """
    context = {
        'user': user,
        'ip_address': get_client_ip(request) if request else 'Unknown',
        'user_agent': get_user_agent(request) if request else 'Unknown',
    }

    site_name = getattr(settings, 'SITE_NAME', 'SysPasso')
    subject = f'Senha Alterada - {site_name} Alerta de Segurança'

    try:
        send_templated_email(
            subject=subject,
            template_name='password_change_notification',
            context=context,
            to_email=user.email,
            sync=getattr(settings, 'EMAIL_SEND_SYNC', True)
        )
        logger.info(f"Password change notification sent to {user.email} (IP: {context['ip_address']})")
    except Exception as e:
        logger.error(f"Failed to send password change notification to {user.email}: {e}")


def cleanup_expired_tokens():
    """
    Remove tokens expirados do banco de dados.
    Pode ser executado como tarefa periódica do Celery.
    """
    from .models import EmailVerification, PasswordResetToken

    now = timezone.now()

    expired_email_tokens = EmailVerification.objects.filter(expires_at__lt=now)
    email_count = expired_email_tokens.count()
    expired_email_tokens.delete()

    expired_password_tokens = PasswordResetToken.objects.filter(expires_at__lt=now)
    password_count = expired_password_tokens.count()
    expired_password_tokens.delete()
    
    logger.info(f"Cleaned up {email_count} expired email tokens and {password_count} expired password tokens")
    
    return {
        'email_tokens_deleted': email_count,
        'password_tokens_deleted': password_count
    }


@shared_task
def cleanup_expired_tokens_task():
    """
    Tarefa Celery para limpeza periódica de tokens expirados.
    """
    return cleanup_expired_tokens()


def generate_unique_username(email):
    """
    Gera um username único a partir do e-mail.
    """
    from django.contrib.auth.models import User
    
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username


def log_user_activity(user, action, ip_address=None, details=None):
    """
    Registra atividade do usuário para fins de segurança e auditoria.
    """
    log_entry = {
        'user': user.username,
        'user_id': user.id,
        'action': action,
        'timestamp': timezone.now().isoformat(),
        'ip_address': ip_address,
        'details': details or {}
    }
    
    logger.info(f"User activity: {log_entry}")
    
    return log_entry