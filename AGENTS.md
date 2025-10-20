Repository Guidelines
=====================

Project Structure & Module Organization
---------------------------------------
- `front/` hosts the Next.js client; routes live under `front/src/app`, shared UI in `front/src/components`, hooks in `front/src/hooks`, and HTTP helpers in `front/src/lib`.
- `back/` contains the Django project; keep core settings in `back/core/`, and domain logic within each app (e.g., `back/authentication`, `back/requests`, `back/vehicles`) alongside their `tests.py`.
- Treat `back/Lib` and `back/Scripts` as virtualenv artifacts—leave them untouched.

Build, Test, and Development Commands
-------------------------------------
- Frontend: run `npm install` once per dependency change, `npm run dev` for local development, `npm run build` for production output, `npm run start` to serve the build, and `npm run lint` to enforce ESLint rules.
- Backend: activate the virtualenv (`python -m venv .venv && .\.venv\Scripts\activate`), install dependencies with `pip install -r requirements.txt`, apply migrations via `python manage.py migrate`, launch the API using `python manage.py runserver`, and execute the suite through `python manage.py test`.

Coding Style & Naming Conventions
---------------------------------
- Next.js code uses 2-space indentation, double quotes, and strict TypeScript. Name components and files in PascalCase, hooks `camelCase` starting with `use`, and utilities live in `front/src/lib`.
- Python code follows PEP 8: 4-space indents, `snake_case` functions, `UpperCamelCase` models, and apps remain lowercase. Add comments only when logic is non-obvious.

Testing Guidelines
------------------
- Frontend relies on linting; place optional unit tests with React Testing Library under `front/src/__tests__`.
- Backend tests extend `django.test.TestCase` within each app’s `tests.py`. Use descriptive names such as `test_creates_vehicle_with_valid_payload`. Run all with `python manage.py test` before submitting changes.

Commit & Pull Request Guidelines
--------------------------------
- Commits use short imperative Portuguese summaries with a scope prefix, e.g., `ajuste(sitehome): corrige redirecionamento`.
- Pull requests provide a brief summary, UI captures where relevant, references to issues, migration notes, and clear verification steps. Ensure lint, build, and test commands pass first.

Environment & Configuration
---------------------------
- Backend secrets load from `back/.env`; replace placeholders locally and never commit real credentials.
- Frontend uses `front/.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`. Align URLs for staging or production and keep env files ignored.
