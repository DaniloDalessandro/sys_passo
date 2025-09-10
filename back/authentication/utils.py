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
    Get the client IP address from the request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """
    Get the user agent from the request
    """
    return request.META.get('HTTP_USER_AGENT', '')


def build_absolute_uri(request, path):
    """
    Build an absolute URI from a relative path
    """
    if request:
        return request.build_absolute_uri(path)
    else:
        # Fallback for when request is not available (e.g., in Celery tasks)
        protocol = 'https' if getattr(settings, 'USE_TLS', False) else 'http'
        domain = getattr(settings, 'SITE_DOMAIN', 'localhost:8000')
        return f"{protocol}://{domain}{path}"


@shared_task
def send_email_async(subject, template_name, context, to_email, from_email=None):
    """
    Celery task to send emails asynchronously
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
    Send a templated email with both HTML and plain text versions
    
    Args:
        subject (str): Email subject
        template_name (str): Template name without extension (e.g., 'password_reset_email')
        context (dict): Template context variables
        to_email (str): Recipient email address
        from_email (str, optional): Sender email address
        sync (bool): If True, send synchronously; if False, use Celery
    """
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL
    
    # Add common context variables
    context.update({
        'timestamp': timezone.now(),
        'site_name': 'SysPasso',
    })
    
    if sync or not hasattr(settings, 'CELERY_BROKER_URL'):
        # Send synchronously if sync=True or Celery is not configured
        _send_email_sync(subject, template_name, context, to_email, from_email)
    else:
        # Use Celery for async sending
        send_email_async.delay(subject, template_name, context, to_email, from_email)


def _send_email_sync(subject, template_name, context, to_email, from_email):
    """
    Synchronously send templated email
    """
    try:
        # Render templates
        html_template = f'authentication/emails/{template_name}.html'
        text_template = f'authentication/emails/{template_name}.txt'
        
        html_content = render_to_string(html_template, context)
        text_content = render_to_string(text_template, context)
        
        # Create and send email
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
    Send password reset email to user
    
    Args:
        user: User instance
        token_obj: PasswordResetToken instance
        request: HTTP request object (optional)
    """
    # Build reset URL
    reset_path = f'/auth/password/reset/confirm/?token={token_obj.token}'
    reset_url = build_absolute_uri(request, reset_path)
    
    context = {
        'user': user,
        'token': token_obj.token,
        'reset_url': reset_url,
        'ip_address': get_client_ip(request) if request else 'Unknown',
        'expires_at': token_obj.expires_at,
    }
    
    subject = 'Password Reset Request - SysPasso'
    send_templated_email(
        subject=subject,
        template_name='password_reset_email',
        context=context,
        to_email=user.email,
        sync=getattr(settings, 'EMAIL_SEND_SYNC', True)  # Default to sync for development
    )


def send_email_verification(user, token_obj, request=None):
    """
    Send email verification to user
    
    Args:
        user: User instance  
        token_obj: EmailVerification instance
        request: HTTP request object (optional)
    """
    # Build verification URL
    verification_path = f'/auth/email/verify/?token={token_obj.token}'
    verification_url = build_absolute_uri(request, verification_path)
    
    context = {
        'user': user,
        'token': token_obj.token,
        'verification_url': verification_url,
        'expires_at': token_obj.expires_at,
    }
    
    subject = 'Welcome to SysPasso - Please Verify Your Email'
    send_templated_email(
        subject=subject,
        template_name='email_verification',
        context=context,
        to_email=user.email,
        sync=getattr(settings, 'EMAIL_SEND_SYNC', True)  # Default to sync for development
    )


def send_password_change_notification(user, request=None):
    """
    Send notification when password is changed
    
    Args:
        user: User instance
        request: HTTP request object (optional)
    """
    context = {
        'user': user,
        'ip_address': get_client_ip(request) if request else 'Unknown',
        'user_agent': get_user_agent(request) if request else 'Unknown',
        'timestamp': timezone.now(),
    }
    
    subject = 'Password Changed - SysPasso Security Alert'
    # You can create a password_change_notification template if needed
    # For now, we'll just log it
    logger.info(f"Password changed for user {user.username} from IP {context['ip_address']}")


def cleanup_expired_tokens():
    """
    Clean up expired tokens from the database
    This can be run as a periodic Celery task
    """
    from .models import EmailVerification, PasswordResetToken
    from datetime import datetime
    
    now = timezone.now()
    
    # Delete expired email verification tokens
    expired_email_tokens = EmailVerification.objects.filter(expires_at__lt=now)
    email_count = expired_email_tokens.count()
    expired_email_tokens.delete()
    
    # Delete expired password reset tokens
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
    Celery task for cleaning up expired tokens
    """
    return cleanup_expired_tokens()


def generate_unique_username(email):
    """
    Generate a unique username from email
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
    Log user activity for security and audit purposes
    """
    # This would typically log to a database or external service
    # For now, we'll just return the log data structure
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