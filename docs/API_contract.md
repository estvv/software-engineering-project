# API contract v1 — SeatTogether

**Team:** EPITECH (team 15)
**Date:** 2026-10-15
**Writer:** Esteve BASCUNANA **Reviewer:** Adam LARKEM (on the pull request)
**Status:** Draft. Planned contract only. Nothing is implemented yet.

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

---

## 3. Traceability

| Requirement / rule | Where it shows in the contract | Planned check |
|---|---|---|
| S1-AC1 | `GET /api/tables` returns T1 `"free"` and T2 `"occupied"` | Unit test on C2 + screenshot of the map |
| S1-AC2 | `GET /api/tables` returns `noFreeTable: true` when all tables are occupied | Unit test on C2 + screenshot of the message |
| S2-AC1 | `checkin` on a free table → `201`, table `"occupied"` | Route test |
| S2-AC2 | `checkout` with the right token → `200`, table `"free"` | Route test |
| R1 | `checkin` on an occupied table → `409 TABLE_OCCUPIED` | Route test |
| R2 | Status is `"free"` once `expiresAt` has passed | Unit test on C2 with a fixed clock |
| Security (Step 3) | `checkout` with a wrong token → `403 INVALID_TOKEN` | Route test |

These checks are planned. None has been run.

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
- **No accounts.** The API stores no name, student ID or IP address with a check-in, only the table, the token and the time (data minimization, Week 7). The flip side is that nothing stops one person from checking in at several tables. Not handled in v1 (backlog X2).
- **In-memory store.** C4 keeps data in memory. Restarting the server frees every table. This is temporary data, to be stated in the midterm report.
- **Layout.** [`data/layout.json`](../data/layout.json) is a temporary 3 × 4 grid (T1–T12), not the real cafeteria. It will be replaced after the team's sketch (P2). The contract does not change: only the table IDs and positions do.
- **Why POST on the table and not `DELETE /checkins/{id}`.** The two actions match the two buttons in S2 and keep C1 simple. A check-in resource with its own URI can be reconsidered if checking in at several tables or tracking seats is ever needed.
