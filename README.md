# DailyOS v1

A personal SaaS-style task manager, built as a learning project for software
architecture, API design, and system integration. Structured as a **modular
monolith** — v1 implements only the Task module, but the layout is designed
so Calendar, Notes, AI, Notifications, and Finance modules can be added later
without restructuring what already exists.

## Architecture

```
React UI  →  REST API (FastAPI)  →  Controller  →  Service  →  Repository  →  SQLAlchemy ORM  →  PostgreSQL
```

- **Controller** — HTTP only: routing, request parsing, status codes.
- **Service** — business logic and orchestration. The only layer allowed to
  contain rules.
- **Repository** — the only layer allowed to write queries.

Each backend module (e.g. `task/`) is self-contained:

```
modules/task/
├── controller.py   # FastAPI routes
├── service.py      # business logic
├── repository.py   # DB queries
├── model.py        # SQLAlchemy model
└── schema.py        # Pydantic request/response models
```

On the frontend, components never call `axios` directly — they go through a
per-domain service module (`TaskService.js`), mirroring the backend's
controller/service split.

## Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React (Vite), React Router, Axios, MUI        |
| Backend    | FastAPI, SQLAlchemy, Pydantic, Alembic         |
| Database   | PostgreSQL (local Docker now, AWS RDS later)   |
| Dev/Deploy | Docker, Docker Compose                        |

## Running locally

```bash
# from the project root
docker compose up --build
```

This starts three containers:

- `db` — PostgreSQL on `localhost:5432`
- `backend` — FastAPI on `localhost:8000` (Swagger docs at `/docs`)
- `frontend` — Vite dev server on `localhost:5173`

### Run the initial migration

The database schema is managed by Alembic. With the containers up, run the
migration once:

```bash
docker compose exec backend alembic upgrade head
```

This creates the `tasks` table (see `backend/alembic/versions/0001_create_tasks_table.py`).

### Health check

```bash
curl http://localhost:8000/health
```

### API docs

Once running, interactive Swagger UI is at `http://localhost:8000/docs`.

## Accessing from a phone on the same network

1. Find your computer's LAN IP address (not `127.0.0.1`):
   - macOS: `ipconfig getifaddr en0` (or `en1` for Wi-Fi on some Macs)
   - Linux: `hostname -I`
   - Windows: `ipconfig` → look for "IPv4 Address"

2. Make sure your phone is on the **same Wi-Fi network** as the computer.

3. On the phone's browser, go to:
   ```
   http://<your-computer's-LAN-IP>:5173
   ```
   e.g. `http://192.168.1.42:5173`

That's it — no config changes needed. The frontend infers the backend's address from whatever host loaded the page (see `frontend/src/services/api.js`), and the backend's CORS settings already permit any private-network origin on port 5173 (see `cors_origin_regex` in `backend/core/config.py`). If your computer's firewall blocks incoming connections on ports 5173/8000, you may need to allow them for your local network.

## API (v1)

| Method | Path                  | Description        |
|--------|-----------------------|---------------------|
| GET    | /api/v1/tasks         | List tasks          |
| GET    | /api/v1/tasks/{id}    | Get a single task   |
| POST   | /api/v1/tasks         | Create a task       |
| PUT    | /api/v1/tasks/{id}    | Update a task        |
| DELETE | /api/v1/tasks/{id}    | Delete a task        |

## Deploying

Vercel is a great fit for the frontend, but not for the backend as it
stands — Vercel runs static sites and short-lived serverless functions,
while the backend is a long-running FastAPI process with a persistent
Postgres connection pool and Alembic migrations, the same shape as
`docker-compose.yml`. So the split is: **frontend on Vercel, backend +
database on a host built for long-running containers** (Railway, Render,
or Fly.io — all three can deploy `backend/Dockerfile` close to as-is).

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```
Create an empty repo on GitHub (no README/license, so there's no
merge conflict), then:
```bash
git remote add origin https://github.com/<you>/dailyos.git
git branch -M main
git push -u origin main
```
`.gitignore` already excludes `node_modules/`, Python caches, and every
`.env` file (which holds local DB credentials) — only `.env.example`
files are tracked, which is what you want.

### 2. Deploy the backend + database first

Using Railway as an example (Render/Fly.io are similar):
1. New Project → Deploy from GitHub repo → set the **root directory to `backend`** so it builds `backend/Dockerfile`.
2. Add a Postgres plugin/addon — it gives you a `DATABASE_URL` automatically.
3. Set environment variables on the backend service:
   - `DATABASE_URL` → the one Postgres provided
   - `CORS_ORIGINS` → your Vercel URL once you have it (e.g. `https://dailyos.vercel.app`), comma-separated if there's more than one
   - `CORS_ORIGIN_REGEX` → set to an **empty string** in production. The default regex permits any private-LAN IP, which was for local phone testing (see "Accessing from a phone" above) — you don't want that permissiveness once this is public.
4. After the first deploy, run the migration once (most of these platforms have a "run command" / shell feature):
   ```bash
   alembic upgrade head
   ```
5. Note the backend's public URL, e.g. `https://dailyos-backend.up.railway.app`.

### 3. Deploy the frontend on Vercel

1. Import the same GitHub repo into Vercel.
2. Set **root directory to `frontend`**. Vercel auto-detects Vite (build command `npm run build`, output `dist`).
3. Add an environment variable: `VITE_API_BASE_URL` = the backend URL from step 2, e.g. `https://dailyos-backend.up.railway.app/api/v1`.
   This is required in production — `frontend/src/services/api.js` infers the backend host from the page's own URL only when this variable is unset, which works for local dev (same machine) but not here, since the frontend and backend now live on entirely different domains.
4. Deploy. Vercel gives you a URL like `https://dailyos.vercel.app`.
5. Go back to the backend host and confirm `CORS_ORIGINS` includes that exact URL — otherwise the browser will block API calls with a CORS error, the same class of issue we debugged earlier for LAN access.

## Deadline reminder emails

A background scheduler (`backend/modules/notification/`) checks every
15 minutes for tasks whose deadline is ~1 day or ~1 hour away and sends
a reminder email. This runs inside the same process as the API — no
separate worker or message queue — appropriate for a single-instance
deployment. Each task is reminded at most once per milestone (tracked
via `notified_day_before_at` / `notified_hour_before_at` on the task
itself), so it won't re-email every 15 minutes for the whole day.

**Setup:** fill in the SMTP variables in `backend/.env` (or the
equivalent environment variables on your hosting platform). See
`backend/.env.example` for the full list and a note on generating a
Gmail App Password, the easiest free option. Leaving these blank
disables sending — the scheduler still runs, it just logs a skip
message instead of erroring.

**Known limitation:** if this app ever ran as multiple replicas, each
instance would run its own scheduler independently and you'd get
duplicate emails. Fine for a single Render/Railway instance; a real
fix if that changes would be moving this to a separate scheduled job
(e.g. a Render Cron Job) instead of an in-process scheduler.

After deploying this change, run the new migration once:
```bash
alembic upgrade head
```

## Environment variables

Copy `.env.example` files to `.env` (already done in this scaffold with local
defaults) and adjust as needed:

- `backend/.env` — database URL, CORS origins, log level.
- `frontend/.env` — `VITE_API_BASE_URL` pointing at the backend.
- root `.env` — Postgres credentials used by docker-compose.

## Deliberately out of scope for v1

Authentication, caching, message queues, and external integrations are not
implemented yet — they're planned for later iterations once the core
architecture is proven out. The `modules/user/` folder exists as a
placeholder for the auth module to come.

## Local development without Docker (optional)

Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

You'll need a local PostgreSQL instance and a matching `DATABASE_URL` in
`backend/.env` if running outside Docker.
