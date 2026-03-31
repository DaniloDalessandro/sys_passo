"""
Autenticação JWT via cookie HttpOnly.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTCookieAuthentication(JWTAuthentication):
    """
    Autenticação JWT que lê o token do cookie 'access' se o header Authorization
    não estiver presente.
    """

    def authenticate(self, request):
        # Tenta o header Authorization padrão primeiro
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # Fallback para cookie HttpOnly
        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token.encode())
            return self.get_user(validated_token), validated_token
        except Exception:
            return None
