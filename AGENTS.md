# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview

Spacr is a Turborepo monorepo with npm workspaces. See `.cursorrules` for the full tech stack reference. Key services:

| Service | Directory | Port | Command |
|---------|-----------|------|---------|
| Backend (AdonisJS 6) | `apps/backend/` | 3333 | `node ace serve --hmr` |
| Frontend (React Router 7 + Vite) | `apps/front/` | 5173 | `npm run dev` |
| PostgreSQL | via `docker-compose.yaml` | 8081→5432 | `sudo docker compose up -d postgres` |

Run `npm run dev` at the repo root to start both frontend and backend via Turbo.

### Database

- PostgreSQL runs in Docker (container `postgres_container`), mapped to host port **8081** (not 5432).
- Default credentials: user=`spacr`, password=`spacr`, database=`spacr`.
- Migrations: `cd apps/backend && node ace migration:run`.

### Backend `.env` setup

The backend requires a `.env` file at `apps/backend/.env`. Required vars: `NODE_ENV`, `PORT`, `HOST`, `APP_KEY`, `LOG_LEVEL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `NASA_API_KEY`, `SPACE_DEVS_API_URL`. Use `DEMO_KEY` for `NASA_API_KEY` in development (rate-limited but functional). `SPACE_DEVS_API_URL` should be `https://ll.thespacedevs.com/2.2.0`.

### astronomy-engine dependency

The backend depends on `astronomy-engine` via a `.yalc` directory (`apps/backend/.yalc/astronomy-engine`). This directory is **not committed** to the repo. To set it up, download the package from npm: `cd /tmp && npm pack astronomy-engine && mkdir -p /workspace/apps/backend/.yalc/astronomy-engine && cd /workspace/apps/backend/.yalc/astronomy-engine && tar xzf /tmp/astronomy-engine-*.tgz --strip-components=1`.

### Docker in Cloud VM

Docker requires the `fuse-overlayfs` storage driver and `iptables-legacy` in the Cloud Agent VM. The Docker daemon must be started manually (`sudo dockerd &`).

### Linting caveats

- **Backend**: `eslint .` fails due to `@adonisjs/eslint-config` using `parserOptions` key incompatible with ESLint 9 flat config. This is a pre-existing upstream issue.
- **Frontend**: `eslint .` reports prettier formatting errors (semicolon style). These are pre-existing in the codebase.

### Tests

- Backend test runner: `cd apps/backend && node ace test`. Currently no test files exist.
- Frontend: no test scripts are configured.

### Frontend proxy

The Vite dev server proxies `/api` requests to the backend at `http://localhost:3333`. This is configured in `apps/front/vite.config.ts`.
