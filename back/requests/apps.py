from django.apps import AppConfig


class RequestsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'requests'

    def ready(self):
        """
        Importa os signals quando o app está pronto.
        """
        import requests.signals  # noqa
