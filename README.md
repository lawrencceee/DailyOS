# DailyOS

A personal task manager built as a learning project for software architecture,
API design, and system integration — modular monolith, layered backend
(controller → service → repository → ORM), React frontend.

## What's new in this version: authentication & multi-user support

- Every task now belongs to a user (`Task.user_id`). Every query in
  `TaskRepository` is scoped by it — this is what actually enforces
  "different users see different tasks," not just the login screen.
- `modules/user/` — registration, login, JWT-based auth (`POST
  /api/v1/auth/register`, `/login`, `GET /me`).
- `modules/settings/` (deadline reminder email) is now per-user too —
  it used to be one global row, which stopped making sense once more
  than one person could use the app.
- Frontend: `/login` and `/register` pages, an `AuthContext` holding
  the JWT, and every existing API call gets the token attached
  automatically via an axios interceptor in `services/api.js` — no
  other service file needed to change.

## Running locally

```bash
docker compose up --build
docker compose exec backend alembic upgrade head
```

Then open `http://localhost:5173`, register an account, and log in.

## Migrating an existing database (you have this — Render)

Migration `0004` adds the `users` table and makes `user_id` required on
`tasks` and `app_settings`. Since your Render database already has real
tasks in it, **set these two environment variables before running the
migration**, so your existing tasks get assigned to an account you can
actually log into, instead of being deleted:

```
LEGACY_OWNER_EMAIL=you@example.com
LEGACY_OWNER_PASSWORD=choose-a-real-password
```

Then run:
```bash
alembic upgrade head
```
Log in with that exact email/password afterward and your existing
tasks will be there. If you'd rather just start fresh, skip setting
those variables — the migration will delete any tasks that don't have
an owner instead of blocking on them.

## Required new environment variable

`JWT_SECRET_KEY` — **must** be set to a real random value in any
deployed environment (Render, etc.), not the `dev-only-change-me`
default. Generate one with:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Anyone who knows this value can forge valid login tokens for any user,
so treat it like a password.

## Architecture

```
React UI → REST API (FastAPI) → Controller → Service → Repository → SQLAlchemy ORM → PostgreSQL
```

Modules: `task`, `user` (auth), `settings` (per-user preferences),
`notification` (scheduled deadline reminder emails, runs in-process via
APScheduler).
