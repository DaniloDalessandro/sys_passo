from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Paginação customizada que permite ao cliente especificar o tamanho da página
    """
    page_size = 10  # Tamanho padrão
    page_size_query_param = 'page_size'  # Permite ao cliente especificar page_size
    max_page_size = 1000  # Tamanho máximo permitido
