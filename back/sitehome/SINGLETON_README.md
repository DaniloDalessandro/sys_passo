# SiteConfiguration - Padrão Singleton no Django Admin

## Visão Geral

O modelo `SiteConfiguration` implementa um **padrão Singleton rigoroso** no Django Admin, garantindo que apenas uma configuração do site possa existir no sistema.

## Características Implementadas

### 1. Singleton Automático
- **Criação automática**: Se não existir configuração, ela é criada automaticamente
- **PK fixo**: Sempre usa `pk=1` para garantir unicidade
- **Redirecionamento**: Ao acessar a lista, redireciona direto para edição

### 2. Proteções de Segurança
- **Sem botão "Adicionar"**: `has_add_permission()` retorna `False`
- **Sem botão "Deletar"**: `has_delete_permission()` retorna `False`
- **Delete bloqueado**: O método `delete()` no modelo lança `ValidationError`
- **Save forçado**: O método `save()` sempre força `pk=1`

### 3. Interface Administrativa Customizada

#### Redirecionamento Automático
Ao acessar `/admin/sitehome/siteconfiguration/`, o usuário é redirecionado automaticamente para a página de edição da configuração existente.

```python
def changelist_view(self, request, extra_context=None):
    """Redireciona para edição ao invés de mostrar lista"""
    config = SiteConfiguration.objects.get_configuration()
    url = reverse('admin:sitehome_siteconfiguration_change', args=[config.pk])
    return redirect(url)
```

#### Mensagens Informativas
Uma mensagem aparece no topo da página de edição informando que esta é a configuração única do site.

#### Template Customizado
- **Localização**: `sitehome/templates/admin/sitehome/siteconfiguration/change_form.html`
- **Características**:
  - Título personalizado
  - Mensagem de ajuda sobre o padrão singleton
  - Botões de ação customizados
  - Animações suaves

#### CSS Customizado
- **Localização**: `sitehome/static/admin/sitehome/siteconfiguration.css`
- **Características**:
  - Preview de logo estilizado
  - Fieldsets com gradientes
  - Mensagens de ajuda destacadas
  - Animações de entrada

## Como Usar

### No Django Admin

1. **Acesse o admin**:
   ```
   http://localhost:8000/admin/sitehome/siteconfiguration/
   ```

2. **Edição direta**: Você será redirecionado automaticamente para a página de edição

3. **Campos disponíveis**:
   - **Informações da Empresa**: Nome, Logo
   - **Contato**: Telefone, Email, Endereço, WhatsApp
   - **Redes Sociais**: Facebook, Instagram, LinkedIn
   - **Conteúdo**: Título, Subtítulo, Texto Sobre

4. **Salvar**: Use "Salvar" ou "Salvar e continuar editando"

### No Código Python

#### Obter a Configuração

```python
from sitehome.models import SiteConfiguration

# Método 1: Usando o manager customizado
config = SiteConfiguration.objects.get_configuration()

# Método 2: Usando o método de classe
config = SiteConfiguration.load()

# Método 3: Acesso direto (sempre pk=1)
config = SiteConfiguration.objects.get(pk=1)
```

#### Atualizar Valores

```python
config = SiteConfiguration.objects.get_configuration()
config.company_name = "Nova Empresa LTDA"
config.email = "contato@novaempresa.com"
config.save()  # Sempre salva com pk=1
```

#### Acessar Logo

```python
config = SiteConfiguration.objects.get_configuration()

# URL da logo
logo_url = config.logo_url  # Retorna URL ou None

# Verificar se existe logo
if config.logo:
    print(f"Logo: {config.logo.url}")
```

### Em Templates Django

```django
{% load static %}

<!-- Carregar configuração -->
{% load sitehome_tags %}
{% get_site_config as config %}

<!-- Usar valores -->
<h1>{{ config.company_name }}</h1>
<p>Email: {{ config.email }}</p>
<p>Telefone: {{ config.phone }}</p>

<!-- Logo -->
{% if config.logo %}
    <img src="{{ config.logo.url }}" alt="{{ config.company_name }}">
{% endif %}

<!-- Redes Sociais -->
{% if config.facebook_url %}
    <a href="{{ config.facebook_url }}">Facebook</a>
{% endif %}
```

### Em Views/Serializers

```python
from sitehome.models import SiteConfiguration
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def site_configuration(request):
    """Endpoint para obter configuração do site"""
    config = SiteConfiguration.objects.get_configuration()

    return Response({
        'company_name': config.company_name,
        'logo': config.logo_url,
        'email': config.email,
        'phone': config.phone,
        'whatsapp': config.whatsapp,
        'social_media': {
            'facebook': config.facebook_url,
            'instagram': config.instagram_url,
            'linkedin': config.linkedin_url,
        },
        'content': {
            'hero_title': config.hero_title,
            'hero_subtitle': config.hero_subtitle,
            'about_text': config.about_text,
        }
    })
```

## Testes

Execute o script de testes para verificar o comportamento singleton:

```bash
cd C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back
python test_singleton_admin.py
```

### O que o teste verifica:
1. Criação automática da configuração
2. Sempre retorna a mesma instância
3. Múltiplas tentativas de save mantêm pk=1
4. Deleção é bloqueada
5. Total de configurações sempre é 1

## Estrutura de Arquivos

```
back/sitehome/
├── models.py                          # Modelo SiteConfiguration com singleton
├── admin.py                           # Admin customizado com redirecionamento
├── static/
│   └── admin/
│       └── sitehome/
│           └── siteconfiguration.css  # CSS customizado
├── templates/
│   └── admin/
│       └── sitehome/
│           └── siteconfiguration/
│               └── change_form.html   # Template customizado
└── SINGLETON_README.md                # Este arquivo
```

## Arquitetura do Singleton

### Manager Customizado

```python
class SiteConfigurationManager(models.Manager):
    def get_configuration(self):
        """Get or create singleton configuration"""
        config, created = self.get_or_create(pk=1)
        return config
```

### Modelo com Proteções

```python
class SiteConfiguration(models.Model):
    objects = SiteConfigurationManager()

    def save(self, *args, **kwargs):
        """Força pk=1"""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Bloqueia deleção"""
        raise ValidationError('Não é possível deletar a configuração.')
```

### Admin com Redirecionamento

```python
class SiteConfigurationAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        """Remove botão Adicionar"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Remove botão Deletar"""
        return False

    def changelist_view(self, request, extra_context=None):
        """Redireciona para edição"""
        config = SiteConfiguration.objects.get_configuration()
        url = reverse('admin:sitehome_siteconfiguration_change', args=[config.pk])
        return redirect(url)
```

## Comportamentos Garantidos

1. **Impossível criar múltiplas configurações**: O save() sempre usa pk=1
2. **Impossível deletar**: ValidationError é lançado
3. **Criação automática**: get_configuration() cria se não existir
4. **Interface limpa**: Sem botões de adicionar ou deletar
5. **Acesso direto**: Redirecionamento automático para edição

## Notas Importantes

- **Thread-safe**: Django ORM garante atomicidade nas operações
- **Migrations**: Certifique-se de rodar migrations após mudanças
- **Caching**: Considere cache se acessar frequentemente
- **Logs**: Atualizações são registradas automaticamente com `updated_at`

## Manutenção

### Adicionar Novos Campos

1. Adicione o campo em `models.py`
2. Crie e rode a migration: `python manage.py makemigrations && python manage.py migrate`
3. Adicione o campo nos `fieldsets` em `admin.py`
4. Atualize o serializer se necessário

### Exemplo de Migration

```python
# Adicionar campo
python manage.py makemigrations sitehome
python manage.py migrate sitehome
```

## Segurança

- Apenas usuários com permissão `change_siteconfiguration` podem editar
- Nunca expor credenciais ou informações sensíveis
- Use validações no modelo para campos críticos
- Considere audit log para mudanças importantes

## Suporte

Para questões ou problemas:
1. Verifique os logs em `back/logs/django.log`
2. Execute o script de testes
3. Verifique as migrations estão aplicadas
4. Confirme que os arquivos estáticos foram coletados
