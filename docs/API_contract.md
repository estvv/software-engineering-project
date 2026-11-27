# API contract v1 — SeatTogether

**Team:** EPITECH (team 15)
**Date:** 2026-10-15
**Writer:** Esteve BASCUNANA **Reviewer:** Adam LARKEM (on the pull request)
**Status:** v1, approved by Adam on PR #6 (2026-10-15). Implemented by C2 (PR #7, #8) and used by C1 (PR #26).

This contract is the interface between C1 Map UI and C2 Seat Status Service ([Architecture v1](Architecture_v1.md), section 6). C1 depends only on this contract, not on how C2 and C4 store data. Rule changes in C2 (decision D1) must not change it.

The API uses HTTP and JSON at fixed URLs. We do not claim that it satisfies the full set of REST constraints (Week 6).

---

## 1. Common rules

- Base path: `/api`. One cafeteria in v1, so no cafeteria ID is needed.
- Request and response bodies are JSON (`Content-Type: application/json`).
- Responses are not cached (`Cache-Control: no-store`), because statuses change during lunch.
- Errors use this body, with one of the codes listed in section 4:

```json
{ "error": { "code": "TABLE_OCCUPIED", "message": "Table already occupied" } }
```

**Table representation**

```json
{ "id": "T1", "row": 0, "col": 2, "status": "free" }
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Table ID from the layout (C3), e.g. `"T1"` |
| `row`, `col` | integer ≥ 0 | Position on the map grid (C3) |
| `status` | `"free"` or `"occupied"` | Decided by C2: `"occupied"` if the table has a check-in less than 60 minutes old (rule R2), otherwise `"free"` |

---

## 2. Operations

### 2.1 `GET /api/tables` — get table statuses

Used by S1. Safe and idempotent: C1 can repeat it at any time.

**Input:** none.

**Result:** `200 OK`

```json
{
  "tables": [
    { "id": "T1", "row": 0, "col": 0, "status": "free" },
    { "id": "T2", "row": 0, "col": 1, "status": "occupied" }
  ],
  "noFreeTable": false
}
```

- `tables`: every table in the layout, sorted by `id`. An occupied table is still returned.
- `noFreeTable`: `true` when no table has status `"free"`. C2 decides this, not C1 (decision D1). C1 then shows "No free table reported right now" above the map (S1-AC2).

**Errors:** `500 INTERNAL_ERROR`.

### 2.2 `POST /api/tables/{id}/checkin` — "I'm sitting here"

Used by S2-AC1. Not idempotent (see section 5).

**Input:** `id` in the path. No body.

**Result:** `201 Created`

```json
{
  "table": { "id": "T1", "row": 0, "col": 0, "status": "occupied" },
  "checkinToken": "6f1c2b9e-4a7d-4c1e-9b0a-2d5e8f3a7c10",
  "expiresAt": "2026-10-20T12:15:00.000Z"
}
```

- `checkinToken`: a random value (UUID v4) that proves who made this check-in. C1 keeps it in the browser and sends it back to check out. It is the only thing linking a student to a table.
- `expiresAt`: check-in time + 60 minutes (rule R2). After this time the table is shown as free and the token is no longer valid.

**Errors:**

| Status | Code | When |
|---|---|---|
| 404 | `TABLE_NOT_FOUND` | `id` is not in the layout |
| 409 | `TABLE_OCCUPIED` | The table already has a valid check-in (rule R1) |
| 500 | `INTERNAL_ERROR` | Unexpected failure |

### 2.3 `POST /api/tables/{id}/checkout` — "I'm leaving"

Used by S2-AC2.

**Input:** `id` in the path, and this body:

```json
{ "checkinToken": "6f1c2b9e-4a7d-4c1e-9b0a-2d5e8f3a7c10" }
```

**Result:** `200 OK`

```json
{ "table": { "id": "T1", "row": 0, "col": 0, "status": "free" } }
```

**Errors** (checked in this order):

| Status | Code | When |
|---|---|---|
| 404 | `TABLE_NOT_FOUND` | `id` is not in the layout |
| 400 | `INVALID_BODY` | Body is not JSON, or `checkinToken` is missing or not a string |
| 409 | `TABLE_NOT_OCCUPIED` | The table has no valid check-in (never checked in, already checked out, or expired) |
| 403 | `INVALID_TOKEN` | The table is occupied, but the token is not the one returned by its check-in |
| 500 | `INTERNAL_ERROR` | Unexpected failure |

### 2.4 `POST /api/tables/{id}/company` — "Show that I'm open to company" (S3, added Week 13)

Used by S3. Idempotent: sending the same value twice gives the same result.

**Input:** `id` in the path, and this body:

```json
{ "checkinToken": "6f1c2b9e-4a7d-4c1e-9b0a-2d5e8f3a7c10", "open": true }
```

**Result:** `200 OK`

```json
{ "table": { "id": "T1", "row": 0, "col": 0, "status": "occupied", "openToCompany": true } }
```

`openToCompany` is an optional field of the table representation: `GET /api/tables` includes `"openToCompany": true` only on an occupied table whose student turned it on. It is absent otherwise, so C1 versions that ignore it keep working. A new check-in always starts with it off (S3-AC3).

**Errors:** the same as `checkout`, in the same order: `404 TABLE_NOT_FOUND`, `400 INVALID_BODY` (also when `open` is not a boolean), `409 TABLE_NOT_OCCUPIED`, `403 INVALID_TOKEN`, `500 INTERNAL_ERROR`.

### 2.5 `GET /api/health` — health check (added Week 13)

Not used by C1. For the Docker healthcheck and the operator ([Maintenance.md](Maintenance.md)).

**Result:** `200 OK` with `{ "status": "ok", "store": "postgres" }` (or `"memory"`), or `503` with `{ "status": "unavailable", "store": "postgres" }` when the database cannot be reached.

---

## 3. Traceability

| Requirement / rule | Where it shows in the contract | Check |
|---|---|---|
| S1-AC1 | `GET /api/tables` returns T1 `"free"` and T2 `"occupied"` | Unit test on C2 + screenshot of the map |
| S1-AC2 | `GET /api/tables` returns `noFreeTable: true` when all tables are occupied | Unit test on C2 + screenshot of the message |
| S2-AC1 | `checkin` on a free table → `201`, table `"occupied"` | Route test |
| S2-AC2 | `checkout` with the right token → `200`, table `"free"` | Route test |
| R1 | `checkin` on an occupied table → `409 TABLE_OCCUPIED` | Route test |
| R2 | Status is `"free"` once `expiresAt` has passed | Unit test on C2 with a fixed clock |
| Security (Step 3) | `checkout` with a wrong token → `403 INVALID_TOKEN` | Route test |
| S3-AC1, S3-AC2, S3-AC3 | `company` with the token → `200`, `openToCompany` on the map; gone after check-out; `403` with another token | Route tests in `app/api/tables/[id]/company.test.ts` |

All checks above have been run. Unit tests: `lib/seatStatus.test.ts`; route tests: `app/api/tables/route.test.ts` and `app/api/tables/[id]/checkin-checkout.test.ts` (28/28, re-run by Esteve on 2026-10-15, commit `d786cca`). Manual API check: [evidence](evidence/2026-10-15_api_manual_check.md), 6/6. Screenshots of the map: [UI check](evidence/2026-10-17_c1_ui_check.md).

---

## 4. Error codes

| Code | HTTP status | Message shown by C1 |
|---|---|---|
| `TABLE_NOT_FOUND` | 404 | "This table does not exist." |
| `INVALID_BODY` | 400 | "Something went wrong, please retry." |
| `TABLE_OCCUPIED` | 409 | "Table already occupied." |
| `TABLE_NOT_OCCUPIED` | 409 | "You are not checked in at this table." |
| `INVALID_TOKEN` | 403 | "Only the student who checked in can free this table." |
| `INTERNAL_ERROR` | 500 | "Something went wrong, please retry." |

---

## 5. Known limits and open points

- **Lost check-in response.** If the `checkin` response is lost (timeout), the table may be occupied but C1 has no token. A retry then gets `409`. The student cannot check out and the table frees itself after 60 minutes (R2). We accept this for v1.
- **Token stored in the browser.** Clearing the browser or changing phone loses the token, with the same result as above.
- **No accounts.** The API stores no name, student ID or IP address with a check-in, only the table, the hash of the token, the time and the S3 flag (data minimization, Week 7). The flip side is that the server cannot stop one person from checking in at several tables. Since Week 13, C1 blocks a second check-in from the same browser (#32); a student using two browsers is not stopped. Decision in [Security_review.md](Security_review.md).
- **Token hashing.** Since Week 13, C2 stores the SHA-256 of the token, never the token itself. The contract did not change.
- **Store.** Since Week 12, C4 keeps check-ins in PostgreSQL when `DATABASE_URL` is set (Docker deployment), so a restart no longer frees every table (issue #35). Without `DATABASE_URL` (tests, `npm run dev`), C4 falls back to memory and logs a warning. The contract did not change.
- **Layout.** [`data/layout.json`](../data/layout.json) is a temporary 3 × 4 grid (T1–T12), not the real cafeteria. It will be replaced after the team's sketch (P2). The contract does not change: only the table IDs and positions do.
- **Why POST on the table and not `DELETE /checkins/{id}`.** The two actions match the two buttons in S2 and keep C1 simple. A check-in resource with its own URI can be reconsidered if checking in at several tables or tracking seats is ever needed.
