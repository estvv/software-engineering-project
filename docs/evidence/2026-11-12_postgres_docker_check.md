# PostgreSQL store and Docker deployment check (Week 12, issue #35)

**Date:** 2026-11-12
**Run by:** Claude Code (AI), on branch `feat/w12-ci-docker-postgres`. **Not yet re-run by a team member.**
**Environment:** Linux, Docker 29.8.2, Compose 5.5.1, Node 20.20.2 locally, image built on `node:22-alpine`, `postgres:17-alpine`.

## 1. Tests, with the PostgreSQL store tests enabled

Command: `TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/postgres npx vitest run`, against a throwaway `postgres:17-alpine` container.

Result: **4 files, 38/38 tests passed** (28 existing tests + 5 C4 contract tests on the memory store + the same 5 on PostgreSQL). Without `TEST_DATABASE_URL`, the 5 PostgreSQL tests are reported as skipped.

The contract tests include "R1 under concurrency": 20 simultaneous `claim` calls on one table, exactly one succeeds. On PostgreSQL they go through a pool of 10 connections, so the claims really run in parallel.

## 2. System check of the Docker deployment

Command: `bash scripts/compose_smoke.sh` (builds the image, starts app + database, throwaway volume deleted at the end).

```
== check-in at T1
  ok    check-in returns 201
  ok    T1 is occupied
== restart the app container (the database keeps running)
  ok    T1 is still occupied after the restart (#35)
== check-out with the token
  ok    check-out returns 200
  ok    T1 is free

5 passed, 0 failed
```

Both containers reported `healthy` before the checks. Image size: 216 MB.

## 3. Other checks

`npm run lint` and `npm run build` succeeded; `npx tsc --noEmit` reported no error.

## What this does not show

- The CI workflow itself had not run yet when this file was written: see the checks on the pull request.
- No load test: the pool size (10) and the response time under the lunch rush are not measured.
- Restarting the **database** container keeps data only because of the named volume; `docker compose down -v` deletes it. There is no backup.
