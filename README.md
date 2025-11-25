# Sys Passo (ViaLumiar)

Sistema completo de gerenciamento de condutores, veículos, solicitações e denúncias com API REST Django e interface Next.js.

## 📋 Índice

- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Segurança](#-segurança)
- [Contribuindo](#-contribuindo)

## 🚀 Stack Tecnológica

### Backend
- **Django 5.2.5** - Framework web Python
- **Django REST Framework 3.15.2** - API REST
- **JWT (Simple JWT)** - Autenticação com tokens
- **SQLite/PostgreSQL** - Banco de dados
- **Celery 5.3.4** - Tarefas assíncronas (opcional)
- **Redis 5.0.1** - Cache e broker Celery
- **Gunicorn** - Servidor WSGI para produção

### Frontend
- **Next.js 15.3.2** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - Cliente HTTP

## 📦 Pré-requisitos

- **Python 3.12+** instalado
- **Node.js 18+** e npm instalado
- **Git** instalado
- **Redis** (opcional, para Celery)

## 💻 Instalação

### 1️⃣ Clone o Repositório

```bash
git clone <url-do-repositorio>
cd sys_passo
```

### 2️⃣ Configuração do Backend (Django)

```bash
# Navegue para a pasta back
cd back

# Crie e ative o ambiente virtual
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Crie o arquivo .env baseado no exemplo
cp .env.example .env

# Gere uma SECRET_KEY segura
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Cole a chave gerada no arquivo .env

# Execute as migrações
python manage.py migrate

# Crie um superusuário (admin)
python manage.py createsuperuser

# Volte para a raiz do projeto
cd ..
```

### 3️⃣ Configuração do Frontend (Next.js)

```bash
# Navegue para a pasta front
cd front

# Instale as dependências
npm install

# Crie o arquivo de ambiente
cp .env.example .env.local

# Edite .env.local e configure:
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Volte para a raiz do projeto
cd ..
```

## ⚙️ Configuração

### Backend (.env)

Edite `back/.env` com suas configurações:

```env
# Segurança
DJANGO_SECRET_KEY=sua-chave-secreta-gerada

# Ambiente
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Banco de Dados (SQLite por padrão)
# Para PostgreSQL, descomente e configure:
# DB_NAME=syspasso
# DB_USER=postgres
# DB_PASSWORD=senha
# DB_HOST=localhost
# DB_PORT=5432

# Redis e Celery (opcional)
# CELERY_BROKER_URL=redis://localhost:6379/0
# CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Frontend (.env.local)

Edite `front/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## 🏃 Executando o Projeto

### Iniciar Backend

```bash
cd back

# Ative o ambiente virtual
.\venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/macOS

# Inicie o servidor Django
python manage.py runserver

# Servidor rodando em: http://127.0.0.1:8000
# Admin Django em: http://127.0.0.1:8000/admin/
```

### Iniciar Frontend

```bash
# Em outro terminal
cd front

# Modo desenvolvimento com Turbopack
npm run dev

# Aplicação rodando em: http://localhost:3000
```

### Celery (Opcional)

Se você usar tarefas assíncronas:

```bash
# Em outro terminal
cd back
.\venv\Scripts\activate

# Inicie o worker Celery
celery -A core worker -l info

# Inicie o beat (agendador)
celery -A core beat -l info
```

## 📁 Estrutura do Projeto

```
sys_passo/
├── back/                       # Backend Django
│   ├── core/                   # Configurações principais
│   │   ├── settings.py         # Configurações Django
│   │   ├── urls.py             # Rotas principais
│   │   ├── middleware.py       # Middlewares customizados
│   │   ├── pagination.py       # Paginação customizada
│   │   └── throttling.py       # Rate limiting
│   ├── authentication/         # Sistema de autenticação JWT
│   ├── conductors/             # Gerenciamento de condutores
│   ├── vehicles/               # Gerenciamento de veículos
│   ├── requests/               # Solicitações de cadastro
│   ├── complaints/             # Sistema de denúncias
│   ├── sitehome/               # Configuração do site
│   ├── notifications/          # Notificações em tempo real
│   ├── media/                  # Arquivos de upload
│   ├── logs/                   # Logs da aplicação
│   ├── manage.py               # CLI Django
│   ├── requirements.txt        # Dependências Python
│   └── .env.example            # Template de variáveis de ambiente
│
├── front/                      # Frontend Next.js
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   ├── components/         # Componentes React/shadcn
│   │   ├── contexts/           # Contextos (Auth, Interceptor)
│   │   ├── hooks/              # Hooks customizados
│   │   ├── lib/                # Utilitários
│   │   ├── services/           # Camada de API
│   │   └── types/              # Definições TypeScript
│   ├── public/                 # Arquivos estáticos
│   ├── package.json            # Dependências Node
│   ├── next.config.mjs         # Configuração Next.js
│   ├── tailwind.config.ts      # Configuração Tailwind
│   └── .env.local.example      # Template de variáveis de ambiente
│
├── .gitignore                  # Arquivos ignorados pelo Git
├── CLAUDE.md                   # Instruções para Claude Code
├── SECURITY.md                 # Política de segurança
└── README.md                   # Este arquivo
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login/` - Login com JWT
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/token/refresh/` - Renovar token
- `POST /api/auth/logout/` - Logout (blacklist token)
- `POST /api/auth/password-reset/` - Solicitar reset de senha
- `POST /api/auth/password-reset-confirm/` - Confirmar reset

### Condutores
- `GET /api/conductors/` - Listar condutores
- `POST /api/conductors/` - Criar condutor
- `GET /api/conductors/{id}/` - Detalhar condutor
- `PATCH /api/conductors/{id}/` - Atualizar condutor
- `DELETE /api/conductors/{id}/` - Deletar condutor

### Veículos
- `GET /api/vehicles/` - Listar veículos
- `POST /api/vehicles/` - Criar veículo
- `GET /api/vehicles/{id}/` - Detalhar veículo
- `PATCH /api/vehicles/{id}/` - Atualizar veículo
- `DELETE /api/vehicles/{id}/` - Deletar veículo
- `GET /api/vehicles/search/?search={placa}` - Buscar por placa (público)
- `GET /api/vehicles/plate/{placa}/` - Detalhes por placa (público)

### Solicitações
- `POST /api/requests/drivers/` - Criar solicitação de motorista (público)
- `GET /api/requests/drivers/` - Listar solicitações (autenticado)
- `POST /api/requests/drivers/{id}/approve/` - Aprovar solicitação
- `POST /api/requests/drivers/{id}/reject/` - Reprovar solicitação

### Denúncias
- `POST /api/complaints/` - Criar denúncia (público)
- `GET /api/complaints/` - Listar denúncias (autenticado)
- `GET /api/complaints/{id}/` - Detalhar denúncia
- `PATCH /api/complaints/{id}/` - Atualizar denúncia
- `POST /api/complaints/{id}/change_status/` - Alterar status

### Configuração do Site
- `GET /api/site/configuration/` - Obter configurações (público)
- `GET /api/site/configuration/current/` - Configuração atual

## 🔒 Segurança

### Rate Limiting

O projeto implementa rate limiting para proteger contra ataques DDoS e abuso:

| Endpoint | Limite | Descrição |
|----------|--------|-----------|
| Leitura pública | 100/hora | Busca de veículos, configurações |
| Escrita pública | 20/hora | Solicitações, denúncias |
| Autenticação | 10/hora | Login, registro |
| Reset de senha | 5/hora | Solicitação de reset |

### Boas Práticas Implementadas

✅ **SECRET_KEY** não commitada no Git
✅ **JWT** com refresh tokens e blacklist
✅ **CORS** configurado corretamente
✅ **CSRF** protection ativo
✅ **Rate limiting** em endpoints públicos
✅ **Validação de entrada** em todos os endpoints
✅ **HTTPS** enforced em produção
✅ **Media files** com validação de tipo

### Variáveis de Ambiente Sensíveis

**NUNCA commite:**
- `.env` (backend)
- `.env.local` (frontend)
- `db.sqlite3` (banco de dados)
- `media/` (uploads de usuários)

Use sempre os arquivos `.env.example` como template.

## 🧪 Testes

### Backend

```bash
cd back
python manage.py test                    # Todos os testes
python manage.py test conductors         # App específica
python manage.py test --keepdb           # Manter banco de testes
```

### Frontend

```bash
cd front
npm run lint                             # ESLint
npm run build                            # Build de produção
```

## 📝 Scripts Úteis

### Backend

```bash
# Verificar problemas
python manage.py check

# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic

# Shell Django
python manage.py shell

# Atualizar dependências
pip freeze > requirements.txt
```

### Frontend

```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Limpar cache
npm run clean

# Adicionar componente shadcn
npx shadcn-ui@latest add [component]
```

## 🚀 Deploy em Produção

### Backend

1. **Configure variáveis de ambiente:**
   - `DEBUG=False`
   - `ALLOWED_HOSTS=seu-dominio.com`
   - `DJANGO_SECRET_KEY=nova-chave-forte`
   - Configure PostgreSQL

2. **Migrações e static files:**
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

3. **Use Gunicorn:**
   ```bash
   gunicorn core.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend

1. **Build de produção:**
   ```bash
   npm run build
   npm start
   ```

2. **Ou deploy na Vercel:**
   ```bash
   vercel deploy --prod
   ```

### Servidor Web (Nginx)

Configure reverse proxy para Django e Next.js:

```nginx
# Django API
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Next.js
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👥 Equipe

Desenvolvido para ViaLumiar.

---

**Documentação adicional:**
- [CLAUDE.md](./CLAUDE.md) - Instruções para Claude Code
- [SECURITY.md](./back/SECURITY.md) - Política de segurança

**Suporte:**
- Issues: Use a aba Issues do GitHub
- Documentação da API: http://127.0.0.1:8000/swagger/ (em desenvolvimento)
