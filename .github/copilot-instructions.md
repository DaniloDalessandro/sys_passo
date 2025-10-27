# Copilot Instructions for sys_passo

## Project Overview
- **sys_passo** is a full-stack project with a Django backend (`back/`) and a Next.js/React frontend (`front/`).
- The backend is organized by domain (authentication, complaints, conductors, requests, sitehome, vehicles) with each domain as a Django app.
- The frontend uses Next.js with TypeScript and a modular structure (`src/app/components`, `src/app/services`, etc.).

## Backend (Django)
- **Entry point:** `back/manage.py`.
- **Settings:** `back/core/settings.py`.
- **Apps:** Each subfolder in `back/` (e.g., `authentication`, `conductors`) is a Django app with its own models, serializers, views, and migrations.
- **Database:** SQLite (`back/db.sqlite3`).
- **Custom scripts:** For data seeding, see `insert_100_conductors.py`, `insert_conductors.py`.
- **Testing:** Tests are in each app's `tests.py`.
- **Admin logic:** Singleton admin pattern in `test_singleton_admin.py`.
- **Templates:** App-specific templates in `templates/` subfolders.
- **Static files:** Located in `sitehome/static/`.

## Frontend (Next.js)
- **Entry point:** `front/src/app`.
- **Config files:** `front/next.config.mjs`, `front/tsconfig.json`, `front/package.json`.
- **Components:** Organized under `front/src/app/components`.
- **Context/State:** Managed in `front/src/app/contexts` and `front/src/app/context`.
- **Services:** API calls and business logic in `front/src/app/services`.
- **Types:** Shared TypeScript types in `front/src/app/types`.
- **Public assets:** `front/public/`.

## Developer Workflows
- **Backend:**
  - Run server: `python back/manage.py runserver`
  - Migrate DB: `python back/manage.py migrate`
  - Run tests: `python back/manage.py test`
  - Seed data: `python back/insert_100_conductors.py` or `python back/insert_conductors.py`
- **Frontend:**
  - Install deps: `cd front; npm install`
  - Run dev server: `cd front; npm run dev`
  - Build: `cd front; npm run build`

## Patterns & Conventions
- **Backend:**
  - Use Django REST Framework for API endpoints (see `views.py`, `serializers.py` in each app).
  - Permissions and authentication logic in `authentication/permissions.py`.
  - Migrations per app in `migrations/`.
- **Frontend:**
  - Use React functional components and hooks.
  - API integration via service files.
  - Context for global state.
  - TypeScript for type safety.

## Integration Points
- **API:** Frontend communicates with backend via REST API endpoints defined in Django apps.
- **Shared types:** Keep API contract in sync between backend serializers and frontend types.

## External Dependencies
- **Backend:** Django, Django REST Framework (see `back/requirements.txt`).
- **Frontend:** Next.js, React, TypeScript (see `front/package.json`).

## Key Files & Directories
- `back/core/settings.py` – Django settings
- `back/requirements.txt` – Python dependencies
- `front/package.json` – Frontend dependencies
- `front/src/app/services/` – API integration
- `front/src/app/components/` – UI components

---

**For AI agents:**
- Always check for domain-specific logic in each Django app.
- Respect the separation between backend and frontend; do not mix code.
- Use provided scripts for data seeding and migrations.
- Follow TypeScript conventions in frontend code.
- Reference this file for workflow commands and architecture overview.

---

*Update this file as project structure or conventions evolve.*
