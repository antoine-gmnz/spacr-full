# Copilot Instructions — Spacr

**Spacr** is a space exploration app that visualizes space missions, planetary positions, ISS tracking, aurora data, and telescope imagery. It is a **Turbo monorepo** with an AdonisJS backend, a React frontend, and a shared-types package.

---

## Monorepo Structure

```
apps/backend/   — AdonisJS 6 API (Node/TypeScript, ESM)
apps/front/     — React 19 + React Router 7 SPA/SSR
packages/shared-types/  — Shared TypeScript types/DTOs consumed by both apps
```

The frontend imports shared types as `@spacr/shared-types` (workspace package, `*` version).

---

## Commands

### Root (runs all apps via Turbo)
```bash
npm run dev       # Start all apps in parallel
npm run build     # Build all apps
npm run lint      # Lint all apps
npm run format    # Prettier format
```

### Backend (`apps/backend/`)
```bash
node ace serve --hmr        # Dev with hot-module reload
node ace test               # Run all tests
node ace test --suite unit  # Run unit tests only
node ace test --suite functional  # Run functional tests only
node ace build              # Production build
```

### Frontend (`apps/front/`)
```bash
react-router dev    # Dev server (Vite + HMR)
react-router build  # Production build
```

---

## Architecture

### Data flow
1. **Frontend** calls `apps/front/app/api/*.ts` functions (thin wrappers around `HttpClient`)
2. `HttpClient` (`app/lib/http.ts`) reads `VITE_API_URL` for the base URL; all routes hit `/api/v1/*`
3. **Backend** routes (`start/routes.ts`) dispatch to controllers using lazy imports
4. **Controllers** are thin — they call a single injected **Service** and return JSON
5. **Services** interact with Lucid ORM models or external APIs; some use in-memory caching via a `Map<string, CacheEntry>`
6. Shared response shapes come from `packages/shared-types/dto/`

### Frontend query pattern
Every feature follows the same three-layer pattern:
- `app/api/<feature>.ts` — raw fetch calls via `http` singleton
- `app/hooks/use-<feature>.ts` — TanStack Query hooks wrapping the API calls
- Route components (`app/routes/*.tsx`) — consume hooks, compose UI components

TanStack Query is configured globally in `app/providers/query-provider.tsx` with `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`.

### 3D Solar System (`space-explorer`)
- Built with **React Three Fiber** + `@react-three/drei`
- `AU_TO_UNITS = 10` — all distances are multiplied by this factor for scene scale
- Planet positions are computed by the backend `EphemerisService` using the `astronomy-engine` library (vendored via `.yalc/astronomy-engine`)
- Visual scaling: `PLANET_SCALE = 500`, `SUN_SCALE = 60`, clamped to `[0.12, 2.0]` scene units
- Orbit lines use J2000 Keplerian elements defined in `SpaceScene.tsx`

### Backend caching
- External API responses that rarely change are cached in **Redis** (ioredis)
- ISS service uses a simple **in-memory `Map`** cache (not Redis) keyed by resource type and time bucket
- Cache TTLs per domain: TLE/crew = 5 min, position = 1 min, passes = 1 hour

---

## Key Conventions

### Backend
- **Controllers must be thin**: parse request, call one service method, return `response.json(...)`. No business logic in controllers.
- **Dependency injection** via `@inject()` decorator — services are constructor-injected by AdonisJS IoC.
- **All controller imports in `start/routes.ts` are lazy** (arrow function wrapping `import()`).
- **VineJS** (`@vinejs/vine`) for request validation — see `app/validators/`.
- **Lucid ORM** models live in `app/models/`. Relations are declared with decorators (`@hasMany`, `@belongsTo`, etc.).
- Backend uses Node `"imports"` subpath mapping for internal aliases: `#controllers/*`, `#services/*`, `#models/*`, `#validators/*`, `#lib/*`, `#dto/*`, etc.

### Frontend
- `@/` alias maps to `apps/front/app/`.
- UI primitives are in `app/components/ui/` — check here before creating new components.
- All UI components use the **CVA (`class-variance-authority`)** pattern for variants. New components should follow the same `cva(baseClasses, { variants: {...} })` pattern.
- Use `cn()` from `@/lib/utils` (combines `clsx` + `tailwind-merge`) for conditional class names.
- Radix UI primitives underpin interactive components (dialogs, selects, popovers, etc.).
- Animations use the **Motion** library (`motion` package), not CSS transitions for complex interactions.

### File naming
- Backend files: `kebab-case` (`rover-images.controller.ts`, `iss.service.ts`)
- Frontend React components: `PascalCase` (`SpaceScene.tsx`, `PlanetInfo.tsx`)
- Frontend non-component files: `kebab-case` (`use-rover.ts`, `rover.ts`)
- Directories: `camelCase` for frontend component folders (`marsImages/`, `spaceExplorer/`)

### Shared types
- Add new DTOs to `packages/shared-types/dto/` and re-export from `packages/shared-types/index.ts`.
- After changing shared types, rebuild the package (`cd packages/shared-types && npm run build`) or rely on workspace resolution in dev.

---

## Infrastructure

- **PostgreSQL** on port `8081` (mapped from 5432) — managed via `docker-compose.yaml`
- **Redis** on port `6379` — also in `docker-compose.yaml`
- **pgAdmin** at `http://localhost:5050`
- **Redis Commander** at `http://localhost:8082`

Start infrastructure: `docker compose up -d`

---

## Testing (Backend — Japa)

Test suites are declared in `adonisrc.ts`:
- `tests/unit/**/*.spec.ts` — unit tests, 2 s timeout
- `tests/functional/**/*.spec.ts` — functional/HTTP tests, 30 s timeout

Run a single test file:
```bash
node ace test --files tests/unit/my-test.spec.ts
```
