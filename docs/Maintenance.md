# Maintenance, technical debt and operations — SeatTogether

**Team:** EPITECH
**Course:** Week 13 (evolution and maintenance, technical debt, observability, reliability), Milestone 5
**Last updated:** 2026-11-27, version `v1.0.0-rc1`
**Status:** Draft written by Claude Code. To be reviewed by the team.

## 1. How to know the service is healthy (observability)

| Signal | Where | What it tells |
|---|---|---|
| `GET /api/health` | `curl localhost:3000/api/health` | `200 {"status":"ok","store":"postgres"}` when the app and the database answer; `503` when the database is down. The Docker healthcheck calls it every 10 s |
| Container state | `docker compose ps` | `healthy` / `unhealthy` for the app and the database |
| Event logs | `docker compose logs app` | One JSON line per check-in, check-out and S3 change: `{"time","level":"info","event":"checkin","table":"T1","result":"ok"}`. `result` is the error code when refused (`TABLE_OCCUPIED`, `INVALID_TOKEN`, …) |
| Error logs | same, `"level":"error"` | Unexpected failures (`checkin.failed`, `tables.failed`, `health.store_unreachable`) with the error message |
| Memory fallback warning | same, `"event":"store.memory_fallback"` | `DATABASE_URL` is missing: check-ins will be lost on restart |

Useful one-liners:

```bash
docker compose logs app | grep '"event":"checkin"' | grep -c '"result":"ok"'     # check-ins today
docker compose logs app | grep '"level":"error"'                                 # failures
docker compose logs app | grep -c '"result":"TABLE_OCCUPIED"'                    # R1 rejections
```

`GET /api/tables` is not logged on success: each open page polls it every 5 s.

## 2. Technical debt register

| # | Debt | Why we took it | Cost if left | Plan |
|---|---|---|---|---|
| TD1 | Temporary 3 × 4 layout (`data/layout.json`), not the real cafeteria | P2 (#24) needs a visit to the cafeteria | The demo map does not match the room; S1 is only checked "on the temporary layout" | Team: sketch the room, replace the JSON (no code change) |
| TD2 | Polling every 5 s instead of push (WebSocket / SSE) | Simple, works behind any proxy, testable | Load grows with open pages: about 60 req/s for 300 open pages | Keep for v1; measure with a load test first |
| TD3 | Schema created by the app on first use, no migration tool | One table, one added column so far | A future change that is not "ADD COLUMN IF NOT EXISTS" needs manual SQL | Add a migration tool if the schema changes again |
| TD4 | No database backup | Demo project, data lives 60 minutes at most | Losing the volume only frees tables early | Accept: check-ins are short-lived by design (R2) |
| TD5 | Expired rows are deleted only when someone acts on the table | Avoids a background job | The `checkins` table keeps at most one row per table (12 now) | Accept |
| TD6 | Layout shift: the "Your table" box pushes the map down after a check-in | Found in the release candidate check | A quick second tap can land on another table | Reserve the space or place the box under the map (small UI change) |
| TD7 | No load test | The `autocannon` run was not executed in Week 13 | We do not know the response time at the lunch rush | Run `npx autocannon -c 50 -d 20 http://localhost:3000/api/tables` against the Compose stack and record it |
| TD8 | `scripts/api_check.sh` and `compose_smoke.sh` overlap | Written at different weeks | Two scripts to update when the API changes | Keep `compose_smoke.sh` (runs in CI); keep `api_check.sh` for the midterm evidence only |

## 3. Runbook (incidents)

| Symptom | Check | Fix |
|---|---|---|
| Map shows "Connection lost" for everyone | `docker compose ps`, `curl /api/health` | If the app is `unhealthy`: `docker compose logs app`, then `docker compose restart app`. Check-ins are kept (PostgreSQL) |
| `/api/health` returns 503 | `docker compose logs db` | Database down or full disk. `docker compose restart db`; the app reconnects by itself (connection pool) |
| A table stays occupied but nobody is there | Logs for that table | Expected up to 60 min (R2, #33). To free it at once: `docker compose exec db psql -U seattogether -c "DELETE FROM checkins WHERE table_id='T3'"`, then write it in the incident notes |
| Many `TABLE_OCCUPIED` for one table in a short time | Logs | Possibly two groups at one table, or a layout error. Check the room, then the layout (TD1) |
| Warning `store.memory_fallback` | `.env`, `docker-compose.yml` | `DATABASE_URL` missing: fix the environment and restart |

**Incident notes:** write the date, symptom, cause, fix and one lesson in the team's issue tracker with the label `incident`. None so far.

## 4. Release process

1. Work on `main` is checked by CI on every push: audit, lint, tests (memory and PostgreSQL), build, Docker image, `compose_smoke.sh`.
2. To release: update [CHANGELOG.md](../CHANGELOG.md), then tag: `git tag -a v1.0.0 -m "…" && git push origin v1.0.0`.
3. CI publishes `ghcr.io/estvv/software-engineering-project:<tag>` and `sha-<commit>`. `main` also publishes `latest`.
4. To deploy a version: set `APP_IMAGE=ghcr.io/estvv/software-engineering-project:v1.0.0` in `.env`, then `docker compose pull app && docker compose up -d`.
5. To roll back: set `APP_IMAGE` to the previous tag and run the same command. The database schema only gains columns, so an older image still works.
