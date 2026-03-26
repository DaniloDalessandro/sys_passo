# Sys Passo — ViaLumiar

Sistema de gerenciamento de condutores, veículos, solicitações e denúncias.

**Stack:** Django 5.2 + DRF + JWT + Daphne · Next.js 15 + React 19 + TypeScript + Tailwind

---

## Subir com Docker

```bash
cp .env.example .env
docker compose up -d
```

| Serviço  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3002         |
| API      | http://localhost:8001/api/   |
| Admin    | http://localhost:8001/admin/ |

Criar superusuário:
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Desenvolvimento local

### Backend
```bash
cd back
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

### Frontend
```bash
cd front
npm install
cp .env.example .env.local   # ajuste NEXT_PUBLIC_API_BASE_URL
npm run dev
```

---

## Variáveis de ambiente

Gere uma `SECRET_KEY` segura:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**`.env` (raiz — Docker)**
```env
DJANGO_SECRET_KEY=<chave gerada acima>
DEBUG=False
DB_PASSWORD=senha-segura
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

**`back/.env` (dev local)**
```env
DJANGO_SECRET_KEY=<chave gerada acima>
DEBUG=True
DB_HOST=localhost
DB_PASSWORD=postgres
```

**`front/.env.local` (dev local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

> Copie os `.env.example` de cada pasta como ponto de partida.

---

## Endpoints principais

| Recurso       | Endpoint                        |
|---------------|---------------------------------|
| Login         | `POST /api/auth/login/`         |
| Token refresh | `POST /api/auth/token/refresh/` |
| Condutores    | `/api/conductors/`              |
| Veículos      | `/api/vehicles/`                |
| Solicitações  | `/api/requests/drivers/`        |
| Denúncias     | `/api/complaints/`              |
| Config site   | `/api/site/configuration/`      |

---

Desenvolvido para ViaLumiar.
