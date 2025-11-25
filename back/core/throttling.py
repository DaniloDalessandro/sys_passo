"""
Custom Throttling Classes for Rate Limiting

Provides specialized throttle classes for different types of public endpoints
to protect against DDoS attacks and API abuse.
"""

from rest_framework.throttling import AnonRateThrottle


class PublicReadThrottle(AnonRateThrottle):
    """
    Throttle for public read-only endpoints (GET requests).

    Rate: 100 requests per hour per IP address.
    Use for public data endpoints that don't modify state.
    """
    scope = 'public_read'


class PublicWriteThrottle(AnonRateThrottle):
    """
    Throttle for public write endpoints (POST/PUT/PATCH requests).

    Rate: 20 requests per hour per IP address (more restrictive).
    Use for public endpoints that create or modify data.
    """
    scope = 'public_write'


class AuthThrottle(AnonRateThrottle):
    """
    Throttle for authentication endpoints.

    Rate: 10 requests per hour per IP address (very restrictive).
    Use for login, registration, and token endpoints to prevent brute force attacks.
    """
    scope = 'auth'


class PasswordResetThrottle(AnonRateThrottle):
    """
    Throttle for password reset endpoints.

    Rate: 5 requests per hour per IP address (extremely restrictive).
    Use for password reset request endpoints to prevent abuse.
    """
    scope = 'password_reset'
