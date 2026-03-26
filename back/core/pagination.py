from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Paginação customizada com suporte ao parâmetro page_size na query string.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000
