# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sys Passo (ViaLumiar) is a full-stack management system with a Django REST API backend and Next.js frontend. The system manages conductors, vehicles, requests, complaints, and site home content.

## Repository Structure

```
sys_passo/
├── back/           # Django REST API backend
│   ├── core/       # Django project settings and core configuration
│   ├── authentication/    # JWT authentication app
│   ├── conductors/        # Driver/conductor management
│   ├── vehicles/          # Vehicle management
│   ├── requests/          # Request system
│   ├── complaints/        # Complaints system
│   ├── sitehome/          # Site home content
│   └── venv/              # Python virtual environment (DO NOT MODIFY)
│
└── front/          # Next.js 15 frontend with TypeScript
    └── src/
        ├── app/           # Next.js App Router pages
        ├── components/    # Reusable React components (shadcn/ui)
        ├── contexts/      # React contexts (Auth, Interceptor)
        ├── hooks/         # Custom React hooks
        ├── lib/           # Utility functions
        ├── services/      # API service layer
        └── types/         # TypeScript type definitions
```

## Development Commands

### Backend (Django)

Navigate to `back/` directory for all backend commands:

```bash
# Activate virtual environment
./venv/Scripts/python.exe

# Install dependencies
./venv/Scripts/python.exe -m pip install -r requirements.txt

# Database migrations
./venv/Scripts/python.exe manage.py makemigrations
./venv/Scripts/python.exe manage.py migrate

# Run development server (port 8000)
./venv/Scripts/python.exe manage.py runserver

# Run tests
./venv/Scripts/python.exe manage.py test

# Django admin
./venv/Scripts/python.exe manage.py createsuperuser

# Check for issues
./venv/Scripts/python.exe manage.py check
```

### Frontend (Next.js)

Navigate to `front/` directory for all frontend commands:

```bash
# Install dependencies
npm install

# Development server with Turbopack (port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

## Key Architecture Details

### Backend Architecture

- **Django 5.2.5** with **Django REST Framework**
- **JWT Authentication** using `djangorestframework-simplejwt` with 24-hour access tokens
- **SQLite** database (configured in `back/core/settings.py`)
- **CORS** enabled for localhost:3000, 3001, 4200, 8080
- **Custom middleware**: `EncodingMiddleware` for UTF-8 handling in `back/core/middleware.py`
- **Custom pagination**: `CustomPageNumberPagination` (default 10 items, max 1000) in `back/core/pagination.py`
- **Admin interface**: Django Jazzmin theme
- **Media files**: Uploaded to `back/media/`
- **Logging**: Configured with console and file handlers, logs to `back/logs/django.log`

### API Endpoints Structure

All endpoints are prefixed with `/api/`:
- `/api/auth/` - Authentication (login, register, token refresh)
- `/api/conductors/` - Conductor management
- `/api/vehicles/` - Vehicle management
- `/api/requests/` - Request system
- `/api/complaints/` - Complaints system
- `/api/site/` - Site home content

### Frontend Architecture

- **Next.js 15.3.2** with App Router and **Turbopack**
- **React 19** with TypeScript
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS 4** for styling
- **React Hook Form** + **Zod** for form validation
- **AuthContext**: Global authentication state management with JWT token handling
- **InterceptorContext**: Axios interceptors for automatic token refresh
- **API Layer**: Centralized in `front/src/services/` (API calls, error handling)

### Authentication Flow

1. Frontend sends credentials to `/api/auth/login/`
2. Backend returns JWT access/refresh tokens
3. Frontend stores tokens and user data in `AuthContext`
4. `InterceptorContext` automatically attaches Bearer token to requests
5. On 401 errors, automatically attempts token refresh via `/api/auth/token/refresh/`
6. If refresh fails, user is logged out

## Important Configuration Files

### Backend Configuration
- `back/core/settings.py` - All Django settings, apps, middleware, JWT config
- `back/core/urls.py` - Main URL routing
- `back/.env` - Environment variables (SECRET_KEY, etc.) - **NEVER COMMIT**
- `back/requirements.txt` - Python dependencies

### Frontend Configuration
- `front/next.config.mjs` - Next.js configuration (Turbopack, webpack, images)
- `front/tsconfig.json` - TypeScript configuration
- `front/package.json` - Node dependencies and scripts
- `front/.env.local` - Frontend environment variables - **NEVER COMMIT**
  - Required: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

## Coding Conventions

### Backend (Python/Django)
- Follow **PEP 8**: 4-space indentation, `snake_case` for functions/variables
- Models: `UpperCamelCase` (e.g., `DriverRequest`)
- Apps: lowercase (e.g., `conductors`, `vehicles`)
- Each app has: `models.py`, `serializers.py`, `views.py`, `urls.py`, `tests.py`
- Tests: Extend `django.test.TestCase`, descriptive names (e.g., `test_creates_vehicle_with_valid_payload`)
- Language: Brazilian Portuguese (pt-br) for user-facing strings

### Frontend (TypeScript/React)
- **2-space indentation**, double quotes
- Components: `PascalCase` (e.g., `VehicleList.tsx`)
- Hooks: `camelCase` starting with `use` (e.g., `useAuth`)
- Files: Match component names (e.g., `VehicleList.tsx` for `VehicleList`)
- Utilities: Place in `front/src/lib/`
- **Strict TypeScript**: Enable all type checking
- Use shadcn/ui components when possible

## Git Workflow

### Commit Messages
- Use **Portuguese** with imperative mood
- Format: `scope: brief description`
- Example: `ajuste(sitehome): corrige redirecionamento`

### Before Committing
1. Backend: Run `./venv/Scripts/python.exe manage.py test`
2. Frontend: Run `npm run lint` and `npm run build`
3. Ensure migrations are created and applied if models changed

## Common Development Workflows

### Adding a New Django App Feature

1. Create models in `back/<app>/models.py`
2. Create/apply migrations: `./venv/Scripts/python.exe manage.py makemigrations <app>`
3. Migrate: `./venv/Scripts/python.exe manage.py migrate`
4. Create serializers in `back/<app>/serializers.py`
5. Create views in `back/<app>/views.py` (use DRF ViewSets)
6. Register URLs in `back/<app>/urls.py`
7. Include app URLs in `back/core/urls.py`
8. Write tests in `back/<app>/tests.py`

### Adding a New Frontend Feature

1. Create/update types in `front/src/types/`
2. Create API service functions in `front/src/services/`
3. Create components in `front/src/components/`
4. Create custom hooks if needed in `front/src/hooks/`
5. Create pages in `front/src/app/` following App Router structure
6. Ensure proper error handling and loading states

### Working with Media Files

- Backend uploads go to `back/media/<app_name>/`
- Access via `http://127.0.0.1:8000/media/<path>`
- Django serves media files in development mode automatically

## Testing

### Backend Testing
- Run all tests: `./venv/Scripts/python.exe manage.py test`
- Run specific app: `./venv/Scripts/python.exe manage.py test <app_name>`
- Tests should cover models, serializers, views, and API endpoints

### Frontend Testing
- Currently relies on ESLint/TypeScript checking
- Run: `npm run lint`
- Optional unit tests can use React Testing Library in `front/src/__tests__/`

## Windows-Specific Notes

- Always use `./venv/Scripts/python.exe` (Windows path separator)
- Next.js webpack polling enabled for Windows file watching
- Use forward slashes in import paths regardless of OS

## Environment Variables

### Backend (`back/.env`)
```
DJANGO_SECRET_KEY=your-secret-key
```

### Frontend (`front/.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Known Issues & Solutions

- **UTF-8 Encoding**: Custom `EncodingMiddleware` handles character encoding issues
- **CORS**: Pre-configured for common development ports
- **Token Refresh**: Handled automatically by `InterceptorContext`
- **Windows File Watching**: Webpack polling configured for Next.js hot reload

## Reference Documentation

- AGENTS.md contains detailed repository guidelines (coding style, testing, commits)
- Django settings: `back/core/settings.py` (comprehensive configuration)
- API routing: `back/core/urls.py`
- Frontend contexts: `front/src/contexts/README.md`
