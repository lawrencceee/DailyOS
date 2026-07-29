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
