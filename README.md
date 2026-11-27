# SeatTogether

Semester project for ISE4133 Software Engineering (Inha University, Fall 2026) — Team EPITECH.

SeatTogether helps Inha students find a free cafeteria table during the lunch rush, and lets students eating alone signal that they are open to company.

**Team:** Esteve BASCUNANA, Adam LARKEM

**Status:** Release candidate `v1.0.0-rc1` (Milestone 5, Week 13). Implemented and tested: map of free and occupied tables with automatic refresh (S1), check-in / check-out with a token (S2, rules R1 and R2), "Your table" kept after a reload, and the opt-in "open to company" status (S3). Check-ins are stored in PostgreSQL; the app ships as a Docker image built, checked and published by CI. **Not done yet:** the real cafeteria layout (P2, the map is a temporary 3 × 4 grid) and the test with real students (P1). See [CHANGELOG.md](CHANGELOG.md).

**Main flow:** select a free table → "I'm sitting here" → optionally tick "Show that I'm open to company" → "I'm leaving" when done. Sample data: `data/layout.json` (tables T1–T12); see the [release candidate check](docs/evidence/2026-11-27_release_candidate_check.md) for a run with screenshots.

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
| C4 Status Store | `lib/statusStore.ts` (PostgreSQL, or memory without `DATABASE_URL`); tokens hashed in `lib/token.ts` |
| Operations | `app/api/health/route.ts`, `lib/log.ts` (JSON logs) |
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
| [Traceability.md](docs/Traceability.md) | Week 11, updated Week 13 | Criteria to tests and evidence, test levels, defect triage |
| [Maintenance.md](docs/Maintenance.md) | Week 13 (M5) | Observability, technical debt, runbook, release process |
| [Security_review.md](docs/Security_review.md) | Week 14 | Threats and responses, privacy decisions, accessibility check, AI-log audit |
| [CHANGELOG.md](CHANGELOG.md) | M5 | Changes per version |
| [AI_USAGE.md](docs/AI_USAGE.md) | All | Log of AI tool use and team checks |
| [Git_practice_log.md](docs/Git_practice_log.md) | Self-study | Personal Git and GitHub practice record (not assessed) |
