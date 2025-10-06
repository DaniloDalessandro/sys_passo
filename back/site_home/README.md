# Site Home API - Documentação

API para gerenciar as configurações da landing page do site.

## Estrutura da API

### Endpoints Disponíveis

#### 1. Obter Configurações do Site
```
GET /api/site/configuration/
```
- **Autenticação**: Não requerida (endpoint público)
- **Descrição**: Retorna as configurações do site (singleton)
- **Response Status**: 200 OK

#### 2. Obter Configuração Atual (Custom Action)
```
GET /api/site/configuration/current/
```
- **Autenticação**: Não requerida (endpoint público)
- **Descrição**: Retorna a configuração atual do site
- **Response Status**: 200 OK

#### 3. Obter Configuração por ID
```
GET /api/site/configuration/{id}/
```
- **Autenticação**: Não requerida (endpoint público)
- **Descrição**: Retorna a configuração do site (ID é ignorado, sempre retorna o singleton)
- **Response Status**: 200 OK

---

## Exemplo de Response JSON

```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_name": "Sys Passo",
    "phone": "(11) 1234-5678",
    "email": "contato@syspasso.com",
    "address": "Rua Exemplo, 123 - São Paulo, SP",
    "whatsapp": "5511912345678",
    "facebook_url": "https://facebook.com/syspasso",
    "instagram_url": "https://instagram.com/syspasso",
    "linkedin_url": "https://linkedin.com/company/syspasso",
    "hero_title": "Bem-vindo ao Sys Passo",
    "hero_subtitle": "Soluções em gestão de frotas e transporte",
    "about_text": "Somos uma empresa especializada em soluções tecnológicas para gestão de frotas...",
    "logo": "/media/site_config/logos/logo.png",
    "logo_url": "http://localhost:8000/media/site_config/logos/logo.png",
    "created_at": "2025-10-06T10:30:00Z",
    "updated_at": "2025-10-06T14:20:00Z"
  }
}
```

---

## Campos do Model

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | Integer | Auto | ID da configuração |
| `company_name` | String | Sim | Nome da empresa |
| `phone` | String | Sim | Telefone principal |
| `email` | Email | Sim | Email de contato |
| `address` | Text | Sim | Endereço completo |
| `whatsapp` | String | Não | Número do WhatsApp |
| `facebook_url` | URL | Não | Link do Facebook |
| `instagram_url` | URL | Não | Link do Instagram |
| `linkedin_url` | URL | Não | Link do LinkedIn |
| `hero_title` | String | Sim | Título principal da landing page |
| `hero_subtitle` | String | Não | Subtítulo da landing page |
| `about_text` | Text | Sim | Texto sobre a empresa |
| `logo` | ImageField | Não | Logo da empresa |
| `logo_url` | String | Auto | URL completa do logo |
| `created_at` | DateTime | Auto | Data de criação |
| `updated_at` | DateTime | Auto | Data de atualização |

---

## Padrão Singleton

Este model implementa o padrão Singleton, o que significa:

- **Apenas uma instância** pode existir no banco de dados
- Não é possível criar uma segunda configuração
- Não é possível deletar a configuração existente
- Ao acessar qualquer endpoint, sempre retorna a mesma configuração

### Métodos Especiais

#### `get_instance()`
Classe method que retorna ou cria a instância singleton:
```python
from site_home.models import SiteConfiguration

config = SiteConfiguration.get_instance()
```

---

## Admin Interface

A interface administrativa foi customizada com:

- **Organização de campos** em seções colapsáveis
- **Preview do logo** na lista de configurações
- **Bloqueio de criação** de múltiplas instâncias
- **Bloqueio de deleção** da configuração
- **Redirecionamento automático** para edição quando apenas uma instância existe

### Seções no Admin:

1. **Informações da Empresa**: company_name, phone, email, address
2. **Redes Sociais**: whatsapp, facebook_url, instagram_url, linkedin_url
3. **Conteúdo da Landing Page**: hero_title, hero_subtitle, about_text
4. **Imagens**: logo
5. **Metadados**: created_at, updated_at (read-only)

---

## Validações

O serializer implementa validações customizadas:

- **Phone**: Mínimo de 10 dígitos
- **WhatsApp**: Mínimo de 10 dígitos (formato internacional recomendado)
- **Email**: Validação padrão de email
- **URLs**: Validação padrão de URL para redes sociais

---

## Uso no Frontend

### Exemplo com Fetch API (JavaScript)

```javascript
// Obter configurações do site
fetch('http://localhost:8000/api/site/configuration/')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const config = data.data;
      console.log('Nome da empresa:', config.company_name);
      console.log('Logo URL:', config.logo_url);
      console.log('Título Hero:', config.hero_title);
    }
  })
  .catch(error => console.error('Erro:', error));
```

### Exemplo com Axios (React/Vue)

```javascript
import axios from 'axios';

async function getSiteConfig() {
  try {
    const response = await axios.get('http://localhost:8000/api/site/configuration/');
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
  }
}

// Uso
const config = await getSiteConfig();
```

---

## Configuração de CORS

Para o frontend poder acessar a API, certifique-se de que a origem do seu frontend está configurada em `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React default
    "http://localhost:3001",  # Next.js alternate
    "http://localhost:8080",  # Vue default
]
```

---

## Comandos Úteis

### Criar Migrações
```bash
python manage.py makemigrations site_home
```

### Aplicar Migrações
```bash
python manage.py migrate
```

### Criar Superusuário (para acessar o admin)
```bash
python manage.py createsuperuser
```

### Criar a Configuração Inicial (via shell)
```bash
python manage.py shell
```

```python
from site_home.models import SiteConfiguration

config = SiteConfiguration.get_instance()
config.company_name = "Minha Empresa"
config.phone = "(11) 1234-5678"
config.email = "contato@empresa.com"
config.address = "Rua Exemplo, 123"
config.hero_title = "Bem-vindo!"
config.about_text = "Sobre nossa empresa..."
config.save()
```

---

## Estrutura de Arquivos

```
back/site_home/
├── migrations/
├── __init__.py
├── admin.py          # Configuração do admin com singleton
├── apps.py
├── models.py         # Model SiteConfiguration com padrão singleton
├── serializers.py    # SiteConfigurationSerializer
├── urls.py           # Rotas da API
├── views.py          # ViewSet com endpoints públicos
├── README.md         # Esta documentação
└── tests.py
```

---

## Segurança

- **Endpoint Público**: A API é pública (AllowAny) para permitir acesso da landing page
- **Read-Only**: O ViewSet é ReadOnly - apenas GET é permitido via API
- **Admin Protegido**: Apenas usuários autenticados podem editar via Django Admin
- **Rate Limiting**: Configurado no settings.py para evitar abuso

---

## Notas Importantes

1. Para upload de imagens funcionar, certifique-se de que as pastas `media/` existem
2. Em produção, configure um serviço de arquivos estáticos (S3, CloudFront, etc.)
3. A biblioteca Pillow é necessária para ImageField: `pip install Pillow`
4. Os campos de redes sociais são opcionais e podem ser null
