# Repository Guidelines

## Project Structure & Module Organization
- `front/` hosts the Next.js client written in TypeScript; UI routes live in `src/app`, shared UI in `src/components`, data hooks in `src/hooks`, and request helpers in `src/lib`.
- `back/` contains the Django project; configuration stays in `core/`, while domain apps (`authentication`, `requests`, `vehicles`, etc.) hold models, views, and serializers. Keep each app’s tests in its `tests.py`.
- `back/Lib` and `back/Scripts` come from a local virtualenv; treat them as generated artifacts and avoid manual edits.

## Build, Test, and Development Commands
- From `front/`: `npm install` to sync dependencies, `npm run dev` for local development, `npm run build` for production or `npm run start` to serve it, and `npm run lint` to enforce ESLint rules.
- From `back/`: `python -m venv .venv && .\.venv\Scripts\activate` (or reuse the checked-in `venv`) before `pip install -r requirements.txt`. Use `python manage.py migrate` for schema updates, `python manage.py runserver` for the API, and `python manage.py test` for the Django suite.

## Coding Style & Naming Conventions
- Follow the Next.js ESLint profile: 2-space indentation, double quotes, and TypeScript strictness. Name React components and files in `PascalCase`, hooks in `camelCase` starting with `use`, and group shared utilities under `src/lib`.
- Python code should follow PEP 8 (4-space indents, `snake_case` functions, `UpperCamelCase` models). Keep new apps lowercased, register them in `core/settings.py`, and add comments only when logic is non-obvious.

## Testing Guidelines
- Extend `django.test.TestCase` and mirror fixtures under each app’s `tests.py`; prefer descriptive method names like `test_creates_vehicle_with_valid_payload`.
- Frontend coverage is lint-focused; add unit tests with React Testing Library under `front/src/__tests__` when feasible, and reserve Playwright (dependency installed at the repo root) for end-to-end flows. Capture manual checks in PRs if automation is missing.

## Commit & Pull Request Guidelines
- Commit history uses short imperative Portuguese summaries (`ajuste`, `ajuts`). Prefer a concise scope prefix, e.g., `ajuste(sitehome): corrige redirecionamento`, and expand on context in the body when needed.
- For pull requests, include a brief summary, screenshots or GIFs for UI work, related issue links, migration notes, and steps for reviewers to reproduce. Ensure the commands above run clean before requesting review.

## Environment & Configuration
- Backend secrets load from `back/.env`; replace the placeholder `DJANGO_SECRET_KEY` locally and never commit real credentials. Frontend uses `front/.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`. Keep environment files ignored and align URLs when pointing to staging or production.
