"""
Classes de throttling customizadas para controle de taxa de requisições.
Protege endpoints públicos contra abuso e ataques DDoS.
"""

from rest_framework.throttling import AnonRateThrottle


class PublicReadThrottle(AnonRateThrottle):
    """
    Throttle para endpoints públicos de leitura (GET).
    Taxa: 100 requisições por hora por IP.
    """
    scope = 'public_read'


class PublicWriteThrottle(AnonRateThrottle):
    """
    Throttle para endpoints públicos de escrita (POST/PUT/PATCH).
    Taxa: 20 requisições por hora por IP (mais restritivo).
    """
    scope = 'public_write'


class AuthThrottle(AnonRateThrottle):
    """
    Throttle para endpoints de autenticação.
    Taxa: 30 requisições por hora por IP. Previne ataques de força bruta.
    """
    scope = 'auth'


class PasswordResetThrottle(AnonRateThrottle):
    """
    Throttle para endpoints de redefinição de senha.
    Taxa: 5 requisições por hora por IP.
    """
    scope = 'password_reset'
