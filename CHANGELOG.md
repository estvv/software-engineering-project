# Changelog

All notable changes to SeatTogether. Versions are Git tags; each tag is published as a Docker image by CI.

## v1.0.0-rc1 — 2026-11-27 (Milestone 5, release candidate)

### Added
- **S3 "open to company"** (`POST /api/tables/{id}/company`): opt-in toggle in "Your table", off at each new check-in, shown on the map as text and color. Acceptance criteria S3-AC1..3 proposed in [M2](docs/M2_story_slice.md) section 6.
- **"Your table" after a reload** (#34): the page remembers my check-in in this browser, shows its end time and an "I'm leaving" button.
- **PostgreSQL store** (#35): check-ins survive a restart. Memory store kept for tests and `npm run dev`.
- **Docker image and Compose file** (app + PostgreSQL 17), non-root, with a healthcheck.
- **CI/CD** (GitHub Actions): dependency audit, lint, tests with a PostgreSQL service, coverage report, build, Docker system check; image published to GHCR on `main` and on tags.
- **Observability:** `GET /api/health`, JSON event and error logs ([Maintenance.md](docs/Maintenance.md)).
- **Automatic map refresh** every 5 s (#29), with a "Connection lost" warning.
- Automated UI tests for S1-AC1 and S1-AC2.

### Changed
- Check-in tokens are stored as SHA-256 hashes. Check-ins made before this version cannot be checked out and free themselves within 60 minutes.
- R1 is enforced atomically in the database, so two simultaneous check-ins at one table cannot both succeed.
- Only one check-in at a time from the same browser (#32, browser-side only, see [Security_review.md](docs/Security_review.md) D-S1).
- Security headers (no framing, nosniff, no referrer), no `X-Powered-By`.
- Next.js 16.4.1 → 16.4.6 (security advisories).

### Known issues
- The table layout is still a temporary 3 × 4 grid (P2, #24).
- No real student has used the product yet (P1, #30).
- A lost token keeps the table occupied for up to 60 minutes (#33, accepted).
- No load test yet; the map moves down when "Your table" appears (TD6, TD7 in [Maintenance.md](docs/Maintenance.md)).

## midterm-v1 — 2026-10-20

S1 map of free and occupied tables, S2 check-in / check-out with token, rules R1 (reject check-in at an occupied table) and R2 (60-minute expiry). In-memory store, temporary layout.
