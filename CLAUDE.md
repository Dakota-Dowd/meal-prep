# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

From repo root:

```bash
# Install all dependencies
npm run install:all

# Run dev servers (run each in a separate terminal)
npm run dev:frontend    # Vite on http://localhost:5173
npm run dev:backend     # ts-node on http://localhost:3001
```

From `frontend/`:
```bash
npm run build     # Vite production build → dist/
npm run preview   # Preview the production build
```

From `backend/`:
```bash
npm run build     # tsc → dist/
npm start         # node dist/index.js (production)
```

No test runner is configured.

## Architecture

### Overview

Monorepo with two independent packages:
- `frontend/` — React 18 + TypeScript + Vite SPA
- `backend/` — Express 4 + TypeScript API server

### Frontend

- **Routing:** react-router-dom v7 with three pages: `/login`, `/register`, `/` (dashboard)
- **Auth guard:** `RequireAuth` component in `App.tsx` checks `localStorage.getItem('mp_auth')` — auth state is stored there as JSON `{token, username}`
- **State:** All meal and selection state lives in `Dashboard.tsx` via `useState`. Persisted to `localStorage` under keys `mp_meals` and `mp_selected`.
- **Data model:** `Meal` type defined in `frontend/src/data/mockMeals.ts` — has `id`, `name`, `tags`, `ingredients[]`. `mockMeals` seeds the UI when localStorage is empty.
- **No global state library** — everything is prop-drilled or localStorage-sourced.

### Backend

- Entry point: `backend/src/index.ts` — Express app, CORS whitelisted to `CORS_ORIGIN` env var
- Auth: `backend/src/routes/auth.ts` — `/api/auth/register` and `/api/auth/login`. JWTs signed with `JWT_SECRET` env var, 7-day expiry. **Passwords are stored in plaintext** — `bcryptjs` is installed but not yet wired up.
- DB: `backend/src/db.ts` — exports a `mysql2/promise` connection pool configured from env vars
- `/api/meals` and `/api/selected-meals` are currently stubs returning empty arrays; real data lives in localStorage on the frontend

### Database (MySQL — `meal_prep`)

Tables: `users`, `meals`, `ingredients`, `meal_ingredients`, `user_selected_meals`. See `docs/schema.md` for full schema. Meals and ingredients are normalized — `meal_ingredients` is the join table with `quantity` and `unit`.

### Backend env vars

Required in `backend/.env` (gitignored):
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, JWT_SECRET, CORS_ORIGIN, PORT
```

## Deployment

See `docs/deployment.md` for full steps. Summary:
- **Backend:** SSH → `git pull` → `npm install` → `npm run build` → `pm2 restart mealprep-backend`
- **Frontend:** SSH → `git pull` → `npm install` → `npm run build` (Nginx auto-serves `dist/`)
- PM2 process: `mealprep-backend` on port `3001`
- `.env` is gitignored and must be maintained manually at `/var/www/meal-prep/backend/.env` on the server
