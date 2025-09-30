"""
Custom middleware for handling encoding and request processing.
"""
import json
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status


logger = logging.getLogger(__name__)


class EncodingMiddleware(MiddlewareMixin):
    """
    Middleware to handle UTF-8 encoding issues and ensure proper JSON parsing.
    """

    def process_request(self, request):
        """
        Process incoming request to handle encoding issues.
        """
        # Set content type encoding to UTF-8 if not specified
        if request.content_type and 'charset' not in request.content_type:
            if request.content_type.startswith('application/json'):
                request.META['CONTENT_TYPE'] = 'application/json; charset=utf-8'

        # Handle potential encoding issues in request body
        if hasattr(request, '_body') and request._body:
            try:
                # Try to decode as UTF-8
                if isinstance(request._body, bytes):
                    request._body.decode('utf-8')
            except UnicodeDecodeError as e:
                logger.error(f"UTF-8 decoding error in request body: {e}")
                return JsonResponse({
                    'error': 'Erro de codificação de caracteres',
                    'message': 'Por favor, verifique se o texto contém apenas caracteres válidos em UTF-8.',
                    'details': 'Caracteres especiais devem ser codificados corretamente.'
                }, status=status.HTTP_400_BAD_REQUEST)

        return None

    def process_exception(self, request, exception):
        """
        Process exceptions to catch encoding-related errors.
        """
        if isinstance(exception, UnicodeDecodeError):
            logger.error(f"Unicode decode error: {exception}")
            return JsonResponse({
                'error': 'Erro de codificação de caracteres',
                'message': 'Problema na codificação dos dados enviados.',
                'details': 'Verifique se todos os caracteres especiais estão em UTF-8.'
            }, status=status.HTTP_400_BAD_REQUEST)

        return None


class JSONParsingMiddleware(MiddlewareMixin):
    """
    Middleware to catch JSON parsing errors and return proper error responses.
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Process view to catch JSON parsing errors early.
        """
        if request.content_type and 'application/json' in request.content_type:
            if request.body:
                try:
                    # Try to parse JSON to detect errors early
                    json.loads(request.body.decode('utf-8'))
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {e}")
                    return JsonResponse({
                        'error': 'JSON inválido',
                        'message': 'Formato de dados JSON inválido.',
                        'details': f'Erro na linha {e.lineno}, coluna {e.colno}: {e.msg}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                except UnicodeDecodeError as e:
                    logger.error(f"UTF-8 decoding error in JSON: {e}")
                    return JsonResponse({
                        'error': 'Erro de codificação',
                        'message': 'Problema na codificação de caracteres no JSON.',
                        'details': 'Verifique se todos os caracteres especiais estão em UTF-8.'
                    }, status=status.HTTP_400_BAD_REQUEST)

        return None