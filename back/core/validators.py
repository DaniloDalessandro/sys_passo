"""
Validadores customizados para uploads de arquivos.
"""
import os
from django.core.exceptions import ValidationError

_MAX_FILE_SIZE = 5242880  # 5MB em bytes


def validate_pdf(file):
    """
    Valida que o arquivo enviado é um PDF e não excede 5MB.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf']:
        raise ValidationError('Apenas arquivos PDF são permitidos.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Arquivo muito grande. Tamanho máximo: 5MB.')


def validate_image(file):
    """
    Valida que o arquivo enviado é uma imagem (JPG, JPEG, PNG) e não excede 5MB.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png']:
        raise ValidationError('Apenas imagens JPG, JPEG ou PNG são permitidas.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Imagem muito grande. Tamanho máximo: 5MB.')


def validate_document(file):
    """
    Valida que o arquivo enviado é um documento (PDF, JPG, JPEG, PNG) e não excede 5MB.
    Usado para uploads flexíveis como CNH, documentos de identidade, etc.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
        raise ValidationError('Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Arquivo muito grande. Tamanho máximo: 5MB.')
