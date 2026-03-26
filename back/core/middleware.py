"""
Middleware customizado para tratamento de encoding e processamento de requisições.
"""
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status


logger = logging.getLogger(__name__)


class EncodingMiddleware(MiddlewareMixin):
    """
    Middleware para tratar problemas de encoding UTF-8 e garantir parsing correto do JSON.
    """

    def process_request(self, request):
        if request.content_type and 'charset' not in request.content_type:
            if request.content_type.startswith('application/json'):
                request.META['CONTENT_TYPE'] = 'application/json; charset=utf-8'

        if hasattr(request, '_body') and request._body:
            try:
                if isinstance(request._body, bytes):
                    request._body.decode('utf-8')
            except UnicodeDecodeError as e:
                logger.error(f"Erro de decodificação UTF-8 no corpo da requisição: {e}")
                return JsonResponse({
                    'error': 'Erro de codificação de caracteres',
                    'message': 'Por favor, verifique se o texto contém apenas caracteres válidos em UTF-8.',
                    'details': 'Caracteres especiais devem ser codificados corretamente.'
                }, status=status.HTTP_400_BAD_REQUEST)

        return None

    def process_exception(self, request, exception):
        if isinstance(exception, UnicodeDecodeError):
            logger.error(f"Erro de decodificação Unicode: {exception}")
            return JsonResponse({
                'error': 'Erro de codificação de caracteres',
                'message': 'Problema na codificação dos dados enviados.',
                'details': 'Verifique se todos os caracteres especiais estão em UTF-8.'
            }, status=status.HTTP_400_BAD_REQUEST)

        return None


