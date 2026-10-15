# Manual API check — 2026-10-15

Run by Claude Code on Esteve's machine, branch `feat/s2-checkin-checkout`, with `npm run build` then `next start -p 3123`. Requests sent with `curl`. Output copied as printed. Temporary layout (T1–T12), in-memory store.

| Step | Request | Expected (API_contract.md) | Actual |
|---|---|---|---|
| 1 | `POST /api/tables/T1/checkin` | 201, T1 occupied, token | `{"table":{"id":"T1","row":0,"col":0,"status":"occupied"},"checkinToken":"43375b66-09be-4899-9262-b8eecad18fac","expiresAt":"2026-10-15T10:48:08.752Z"}` |
| 2 | `GET /api/tables` (T1 only) | T1 occupied (S2-AC1) | `['occupied']` |
| 3 | `POST /api/tables/T1/checkin` again | 409 TABLE_OCCUPIED (R1) | `{"error":{"code":"TABLE_OCCUPIED","message":"Table already occupied."}}` [409] |
| 4 | `POST /api/tables/T1/checkout` with `{"checkinToken":"x"}` | 403 INVALID_TOKEN (security) | `{"error":{"code":"INVALID_TOKEN","message":"Only the student who checked in can free this table."}}` [403] |
| 5 | `POST /api/tables/T1/checkout` with the token from step 1 | 200, T1 free (S2-AC2) | `{"table":{"id":"T1","row":0,"col":0,"status":"free"}}` [200] |
| 6 | `POST /api/tables/T99/checkin` | 404 TABLE_NOT_FOUND | `{"error":{"code":"TABLE_NOT_FOUND","message":"This table does not exist."}}` [404] |

All six results match the contract. To be re-run by a team member before the report.
