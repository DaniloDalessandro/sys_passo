"""
Validadores customizados para uploads de arquivos.
Verifica extensão, tamanho e conteúdo real do arquivo (MIME type).
"""
import os
from django.core.exceptions import ValidationError

_MAX_FILE_SIZE = 5242880  # 5MB em bytes
_PDF_MAGIC = b'%PDF'


def validate_pdf(file):
    """
    Valida que o arquivo enviado é um PDF e não excede 5MB.
    Verifica tanto a extensão quanto o conteúdo real do arquivo.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf']:
        raise ValidationError('Apenas arquivos PDF são permitidos.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Arquivo muito grande. Tamanho máximo: 5MB.')

    file.seek(0)
    header = file.read(4)
    file.seek(0)
    if header != _PDF_MAGIC:
        raise ValidationError('O arquivo enviado não é um PDF válido.')


def validate_image(file):
    """
    Valida que o arquivo enviado é uma imagem (JPG, JPEG, PNG) e não excede 5MB.
    Verifica tanto a extensão quanto o conteúdo real do arquivo usando PIL.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png']:
        raise ValidationError('Apenas imagens JPG, JPEG ou PNG são permitidas.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Imagem muito grande. Tamanho máximo: 5MB.')

    try:
        from PIL import Image
        file.seek(0)
        img = Image.open(file)
        img.verify()
        file.seek(0)
    except Exception:
        raise ValidationError('O arquivo enviado não é uma imagem válida.')


def validate_document(file):
    """
    Valida que o arquivo enviado é um documento (PDF, JPG, JPEG, PNG) e não excede 5MB.
    Usado para uploads flexíveis como CNH, documentos de identidade, etc.
    Verifica tanto a extensão quanto o conteúdo real do arquivo.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
        raise ValidationError('Apenas arquivos PDF, JPG, JPEG ou PNG são permitidos.')

    if file.size > _MAX_FILE_SIZE:
        raise ValidationError('Arquivo muito grande. Tamanho máximo: 5MB.')

    if ext == '.pdf':
        file.seek(0)
        header = file.read(4)
        file.seek(0)
        if header != _PDF_MAGIC:
            raise ValidationError('O arquivo enviado não é um PDF válido.')
    else:
        try:
            from PIL import Image
            file.seek(0)
            img = Image.open(file)
            img.verify()
            file.seek(0)
        except Exception:
            raise ValidationError('O arquivo enviado não é uma imagem válida.')
