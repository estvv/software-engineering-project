# Midterm plan — SeatTogether

**Team:** EPITECH (team ID: 15)
**Deadline:** Sunday 2026-10-25, 23:59 KST, on I-Class (course file `midterm_submission_guide.pdf`, Week 7)
**Written:** 2026-10-15 by Esteve BASCUNANA. To be reviewed and agreed by Adam LARKEM on the pull request.

The midterm is a progress report: a team PDF (5–7 body pages) and one individual PDF (0.5–1 page) per student. The largest team criterion is "Prototype and verification evidence" (20 pts). It needs a working core feature or an executed technical check, which we do not have yet. This plan gets us there.

**Split:** each member owns a part of the work, so that each can explain their own work and one decision in the individual report.
- **Esteve:** API contract, backend (C2 Seat Status Service, C4 Status Store), automated tests, report sections 1–4, PDF assembly and submission.
- **Adam:** cafeteria layout (P2, C3 Table Layout), frontend (C1 Map UI), S2 buttons, report sections 6–7.

**Every step:** a branch, a PR, a review by the other member, a merge. AI use goes into [AI_USAGE.md](AI_USAGE.md).

---

## Decisions taken (2026-10-15, proposed by Esteve, pending Adam's review)

| Topic | Decision | Reason |
|---|---|---|
| Stack | Next.js (one app for frontend and API route handlers), data in memory, layout as a static JSON file | One project and one language for both members; a real database is not needed to show S1 and S2 |
| R1: check-in at an occupied table | Rejected (HTTP 409, "Table already occupied") | Tables are tracked as a whole (M1 scope); simplest rule to implement and test |
| R2: check-in expiry | A check-in expires after 60 minutes | Upper end of the 30–60 min lunch break in the M2 proto-persona; not validated with users |

Mapping of the Architecture v1 components to the Next.js app (planned):

| Component | Location in the app |
|---|---|
| C1 Map UI | `app/page.tsx` and its components. It calls the API with `fetch`; it never reads the store directly (decision D1). |
| C2 Seat Status Service | `lib/seatStatus.ts`: status rules, "no free table", R1, R2. Called by the route handlers in `app/api/tables/…`. |
| C3 Table Layout | `data/layout.json`, built from the team's sketch |
| C4 Status Store | `lib/statusStore.ts`, in memory (lost on server restart; stated in the report as temporary data) |

---

## Steps

### Step 0 — Agree (Thu 10-15 – Fri 10-16, both)
- [x] Choose the stack (Next.js)
- [x] Decide R1 and R2 (recorded in [BACKLOG.md](BACKLOG.md))
- [ ] Adam reviews these decisions on the PR
- [ ] Create one GitHub issue per step below, each with an owner
- [ ] Commit the `.gitignore`

### Step 1 — Inputs for the code (Fri 10-16 – Sat 10-17)
- [ ] **Adam:** sketch and photograph the cafeteria (P2), then write `data/layout.json` (table IDs and positions) — C3
- [ ] **Esteve:** write `docs/API_contract.md` (Week 6): `GET /api/tables`, `POST /api/tables/{id}/checkin`, `POST /api/tables/{id}/checkout`, with input, result and errors (400, 404, 409). Adam reviews.

### Step 2 — Implement S1 (Sun 10-18 – Tue 10-20)
- [ ] **Esteve:** Next.js project setup, C2 + C4, `GET /api/tables`, unit tests for S1-AC1 (T1 free, T2 occupied) and S1-AC2 (all occupied → "no free table")
- [ ] **Adam:** C1 map: color and text label per table, "No free table reported right now" message above the map
- [ ] Both: run the app, take screenshots for S1-AC1 and S1-AC2

### Step 3 — Implement S2 and the security check (Wed 10-21 – Thu 10-22)
- [ ] **Esteve:** check-in / check-out endpoints, R1 (409) and R2 (60 min expiry), tests for S2-AC1, S2-AC2, R1, R2
- [ ] **Adam:** "I'm sitting here" and "I'm leaving" buttons
- [ ] **Adam (Esteve reviews), security:** risk = anyone can free someone else's table (integrity / authorization, Week 7 IDOR). Response = check-in returns a token; check-out requires it; no account and no name stored (data minimization). Executed check = a test that a check-out with a wrong token is rejected. Add one sentence on the privacy risk of "open to company" (excluded for now).

### Step 4 — Docs and frozen version (Fri 10-23)
- [ ] **Esteve:** README run and test instructions; update Architecture v1 and BACKLOG if behavior changed
- [ ] Tag the submitted version `midterm-v1`

### Step 5 — Report (Fri 10-23 – Sat 10-24)
Template: course file `report_templates.docx` (Week 7).

| Section | Owner | Source |
|---|---|---|
| 1. Product and problem | Esteve | M1 |
| 2. Final demo scope | Esteve | M1 + backlog |
| 3. Requirements (S1, S2 + criteria) | Esteve | M2 |
| 4. Design (diagram + D1) | Esteve | Architecture v1 |
| 5. Current implementation | Both | Tests, screenshots, complete / partial / not started, temporary data |
| 6. Security and privacy | Adam | Step 3 |
| 7. Plan for the final demo | Adam | Priorities, owners, weeks (M4 Week 10…), main risk |
| Evidence appendix | Both | Screenshots, test output, links, AI_USAGE.md |

- [ ] Each member reviews the other's sections
- [ ] Each member writes their individual report (my work + links, one decision, how I checked it, next task)

### Step 6 — Submit (Sun 10-25, finish before the evening)
- [ ] Esteve uploads `15_Midterm.pdf` (team ID 15)
- [ ] Esteve uploads `12264733_Midterm.pdf`; Adam uploads `12264692_Midterm.pdf`

**If time allows:** run the mockup test P1 with a few students, reported honestly even if fewer than 8.
**Not a priority:** [Git_practice_log.md](Git_practice_log.md) (not assessed).
