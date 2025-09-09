# MissingBrick — LEGO Set & Missing Parts Tracker

![logo](./logo.png)

MissingBrick is a small Go-based project that helps you track LEGO sets and the parts you are missing for each set. It uses the Rebrickable API to fetch set and part details and stores data locally in a SQLite database. The backend exposes a simple REST API you can use from a frontend, Bruno API client, or any HTTP tool.

## Purpose

- Keep a catalog of your LEGO sets.
- Store parts for each set and mark which parts are missing.
- Sync set and part information from Rebrickable automatically.
- Provide a REST API that a frontend or external tool can use to manage sets and missing parts.

## Status

✅ Backend API implemented and working. Frontend is minimal (Vite + React) and can be extended.

## Quick start — add a .env and run

This project reads configuration from environment variables. The easiest way to run locally is to create a `.env` file in the `backend/` folder (or set environment variables in your shell). Make sure you have a Rebrickable API key (https://rebrickable.com/api/).

Create `backend/.env` with:

```dotenv
# Rebrickable API Key (required)
REBRICKABLE_API_KEY=your_rebrickable_api_key_here

# SQLite database file (optional; defaults to missing_brick.db)
DATABASE_URL=missing_brick.db

# Server port (optional; defaults to 8080)
PORT=8080
```

Then run the backend:

```bash
cd backend
go mod tidy   # install dependencies
go run cmd/main.go
```

By default the server will listen on http://localhost:8080. You can now use the Bruno collection in `backend/docs/api/` or any HTTP client.

## API highlights

- GET /api/v1/sets — list sets
- POST /api/v1/sets — create a set (fetches parts from Rebrickable)
- GET /api/v1/sets/:id/with-parts — set details with parts
- GET /api/v1/sets/:id/missing-parts — missing parts for a set
- POST /api/v1/missing-parts — assign missing parts to a set
- GET /health — health check

See the Bruno collection in `backend/docs/api/` for organized example requests.

## Frontend (optional)

The frontend is a small Vite + React app in the `frontend/` folder. It expects the backend URL via environment variables. You can run it separately during development.

Create `frontend/.env` (or use the provided `frontend/.env.example`):

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1
```

Then install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Project structure (backend)

```
backend/
├── cmd/             # application entry point
├── docs/api/        # Bruno collection for testing
├── internal/
│   ├── config/      # config loader
│   ├── database/    # db connection and migrations
│   ├── entity/      # models
│   ├── repository/  # data access
│   ├── service/     # business logic (Rebrickable client, etc.)
│   └── handler/     # HTTP handlers
```

## Notes and recommendations

- Get a Rebrickable API key before running features that fetch set data.
- The repository uses SQLite by default; change `DATABASE_URL` to use a different file or path.
- The Bruno collection in `backend/docs/api/` contains example requests which are helpful for manual testing.

## Next steps (ideas)

- Expand the frontend UI
- Add authentication and per-user collections
- Add unit tests and CI

If you want, I can also update the Bruno environment file or add a small startup script to make running both backend and frontend easier.
