# SeatTogether

Semester project for ISE4133 Software Engineering (Inha University, Fall 2026) — Team EPITECH.

SeatTogether helps Inha students find a free cafeteria table during the lunch rush, and lets students eating alone signal that they are open to company.

**Team:** Esteve BASCUNANA, Adam LARKEM

**Status:** Midterm version tagged `midterm-v1`. Backend implemented and tested: `GET /api/tables` (S1), check-in / check-out with token (S2, R1, R2). Map UI (C1) with the S2 buttons implemented and checked in the browser. Since Week 12, check-ins are stored in PostgreSQL and the app ships as a Docker image, built and checked by CI on every pull request. The table layout is still a temporary placeholder.

## Run

### With Docker (app + PostgreSQL)

Requires Docker with Compose v2.

```bash
cp .env.example .env    # then set POSTGRES_PASSWORD
docker compose up --build -d    # app on http://localhost:3000
docker compose logs -f app
docker compose down             # stop; add -v to also delete the stored check-ins
bash scripts/compose_smoke.sh   # system check: check-in, app restart, check-in kept, check-out
```

### Without Docker

Requires Node.js 22 (the version used in CI and in the image).

```bash
npm ci
npm run dev     # app on http://localhost:3000, API at /api/tables
npm test        # unit, route and UI tests (Vitest)
npm run test:coverage   # same tests with a coverage report
npm run lint
npm run build   # production build (standalone output, used by the Dockerfile)
bash scripts/api_check.sh   # manual API check: 6 requests, expected vs actual
```

Without `DATABASE_URL`, check-ins are kept in memory and lost on restart (a warning is logged). To use PostgreSQL, set `DATABASE_URL=postgres://user:password@host:5432/db`; the `checkins` table is created on first use. The PostgreSQL store tests are skipped unless `TEST_DATABASE_URL` is set, for example:

```bash
docker run -d --rm --name st-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17-alpine
TEST_DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres npm test
```

On a fresh clone, `npx tsc --noEmit` fails until Next has generated its route types: run `npm run build` or `npx next typegen` first.

### CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and on `main`:

1. **Lint, test, build:** `npm ci`, `npm run lint`, `npm run test:coverage` with a PostgreSQL service (so the store tests run on a real database), `npm run build`. The coverage report is kept as a build artifact.
2. **Docker:** builds the image and runs `scripts/compose_smoke.sh` against it.
3. **Delivery:** on a push to `main` or a `v*` tag, the image is published to `ghcr.io/estvv/software-engineering-project` (tags `latest` or the version, plus `sha-<commit>`).

Code layout (components from [Architecture v1](docs/Architecture_v1.md)):

| Component | Files |
|---|---|
| C1 Map UI | `app/page.tsx`, `app/page.module.css` |
| C2 Seat Status Service | `lib/seatStatus.ts`, route handlers in `app/api/`, errors in `lib/apiErrors.ts` |
| C3 Table Layout | `data/layout.json`, `lib/layout.ts` |
| C4 Status Store | `lib/statusStore.ts` (PostgreSQL, or memory without `DATABASE_URL`) |
| Deployment | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` |

## Documents

| Document | Milestone | Content |
|---|---|---|
| [M1_product_vision.md](docs/M1_product_vision.md) | M1 | Vision, scope, assumptions, prototype plan, AI critique |
| [M2_story_slice.md](docs/M2_story_slice.md) | M2 (Week 4) | Proto-persona, scenario, stories S1–S2 with acceptance criteria |
| [BACKLOG.md](docs/BACKLOG.md) | M2 | Ordered Product Backlog and draft Definition of Done |
| [Architecture_v1.md](docs/Architecture_v1.md) | M3 prep (Week 5) | Component structure, criterion paths, decision D1 |
| [API_contract.md](docs/API_contract.md) | M3 / Week 6 | C1 → C2 interface: operations, JSON, errors, traceability |
| [MIDTERM_PLAN.md](docs/MIDTERM_PLAN.md) | Midterm (Week 8) | Step-by-step plan, owners and decisions for the midterm report |
| [AI_USAGE.md](docs/AI_USAGE.md) | All | Log of AI tool use and team checks |
| [Git_practice_log.md](docs/Git_practice_log.md) | Self-study | Personal Git and GitHub practice record (not assessed) |
