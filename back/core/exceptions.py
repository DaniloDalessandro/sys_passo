# -*- coding: utf-8 -*-
"""
Funções auxiliares para tratamento de erros e exceções
"""
import logging
import uuid
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def get_error_message(exception):
    """Extrai mensagem de erro de uma exceção"""
    if hasattr(exception, 'detail'):
        return str(exception.detail)
    return str(exception)


def safe_error_response(message, exception=None, context=None, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
    """
    Cria uma resposta de erro padronizada e registra o erro no log

    Args:
        message: Mensagem de erro amigável
        exception: Exceção original (opcional)
        context: Contexto adicional para logging (opcional)
        status_code: Código HTTP de status (opcional)

    Returns:
        Response: Resposta DRF com erro formatado
    """
    error_id = str(uuid.uuid4())[:8].upper()

    error_data = {
        'error': message,
        'error_id': error_id
    }

    log_message = f"[{error_id}] {message}"
    if context:
        log_message += f" | Context: {context}"
    if exception:
        log_message += f" | Exception: {get_error_message(exception)}"
        logger.error(log_message, exc_info=True)
    else:
        logger.error(log_message)

    return Response(error_data, status=status_code)


def custom_exception_handler(exc, context):
    """
    Handler customizado para exceções do DRF

    Args:
        exc: Exceção lançada
        context: Contexto da requisição

    Returns:
        Response: Resposta formatada
    """
    # Chama o exception handler padrão do DRF primeiro
    response = drf_exception_handler(exc, context)

    if response is not None:
        # Adiciona informações extras ao erro
        error_id = str(uuid.uuid4())[:8].upper()

        # Se a resposta já tem dados, mantém eles
        if isinstance(response.data, dict):
            response.data['error_id'] = error_id

        # Log do erro
        view = context.get('view', None)
        request = context.get('request', None)

        log_message = f"[{error_id}] {exc.__class__.__name__}: {str(exc)}"
        if view:
            log_message += f" | View: {view.__class__.__name__}"
        if request:
            log_message += f" | Method: {request.method} | Path: {request.path}"

        logger.error(log_message, exc_info=True)

    return response
