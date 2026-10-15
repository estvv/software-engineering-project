# SeatTogether

Semester project for ISE4133 Software Engineering (Inha University, Fall 2026) — Team EPITECH.

SeatTogether helps Inha students find a free cafeteria table during the lunch rush, and lets students eating alone signal that they are open to company.

**Team:** Esteve BASCUNANA, Adam LARKEM

**Status:** Midterm work in progress. Backend implemented and tested: `GET /api/tables` (S1), check-in / check-out with token (S2, R1, R2). Map UI (C1) not started. Table statuses are kept in memory and the table layout is a temporary placeholder.

## Run

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev     # app on http://localhost:3000, API at /api/tables
npm test        # unit and route tests (Vitest)
npm run build   # production build
```

Code layout (components from [Architecture v1](docs/Architecture_v1.md)):

| Component | Files |
|---|---|
| C1 Map UI | `app/page.tsx` (placeholder) |
| C2 Seat Status Service | `lib/seatStatus.ts`, route handlers in `app/api/`, errors in `lib/apiErrors.ts` |
| C3 Table Layout | `data/layout.json`, `lib/layout.ts` |
| C4 Status Store | `lib/statusStore.ts` (in memory) |

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
