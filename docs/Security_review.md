# Security, privacy and accessibility review — SeatTogether

**Team:** EPITECH
**Course:** Week 14 (threat and privacy review, accessibility, AI-use log audit)
**Last updated:** 2026-11-27, version `v1.0.0-rc1`
**Status:** Draft written by Claude Code from the code and the midterm report section 6. **To be reviewed by both team members** before the final release.

## 1. What we protect

| Asset | Why it matters |
|---|---|
| Table statuses | Wrong statuses send students to taken tables: S1 loses its value |
| Check-in token | It is the only proof of who checked in; whoever holds it can free the table or change S3 |
| "Open to company" flag | It tells anyone looking at the map that someone is eating alone at a given table |
| Availability at lunch | The product is only useful during a 1–2 hour window |

We store no name, student ID, IP address or account. A check-in row holds only: table ID, SHA-256 of the token, check-in time, S3 flag.

## 2. Threats and responses (STRIDE)

| # | Threat | Example | Response | Evidence | Remaining risk |
|---|---|---|---|---|---|
| T1 | **Tampering / elevation:** free or change someone else's table (IDOR, Week 7) | `POST /api/tables/T3/checkout` from any browser | Check-out and S3 require the check-in token; 403 otherwise | Route and unit tests "security", S3-AC3 tests; `api_check.sh` step 4 | A stolen token (shared phone) works until check-out or 60 min |
| T2 | **Information disclosure:** read tokens from the database or a backup | DB dump, leaked volume | Only the SHA-256 is stored; the stored value cannot free a table | Unit tests "token storage" | None found for the token. Table history is not kept |
| T3 | **Spoofing / denial of service:** one person occupies many tables (#32) | Check in at every table | The browser blocks a second check-in while one is active; R2 frees tables after 60 min | UI test "#32" | A student with two browsers or a script is **not** stopped. See decision D-S1 |
| T4 | **Denial of service:** flood the API | Script sending thousands of requests | None in the app. Docker restarts a crashed container | — | Open. See decision D-S2 |
| T5 | **Information disclosure (privacy):** S3 used to find people eating alone | Someone watches the map for "open to company" | Opt-in, off at each check-in, no name or photo, ends with the check-in (S3-AC3); hint shown next to the toggle | S3 route and UI tests | The table location is the point of the feature. Not tested with users (P1) |
| T6 | **Tampering:** clickjacking on the buttons | Page framed by another site | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` | `compose_smoke.sh` header check | — |
| T7 | **Repudiation / disclosure through logs** | Token copied into logs | Logs hold table, action and result only | `compose_smoke.sh`: token absent from the logs | — |
| T8 | **Vulnerable dependencies** | Known CVEs in Next.js | Next.js patched to 16.4.6; CI fails on a high or critical advisory in production dependencies | `npm audit --omit=dev`: 0 on 2026-11-27; CI step "Audit production dependencies" | Moderate advisories do not fail the build |
| T9 | **Secrets in the repository** | Database password committed | Password only in `.env` (ignored by Git); `.env.example` has a placeholder; DB port not published | `.gitignore`, `docker-compose.yml` | CI uses a throwaway password on purpose |

## 3. Decisions

**D-S1 — One check-in per student without accounts (#32).** Options: (a) accounts or student login, (b) limit by IP address, (c) browser-side limit. We chose (c). (a) contradicts data minimization and adds a login step at the busiest moment (M1 assumption #2: students must find check-in quick). (b) would block a whole campus Wi-Fi behind one public address, and an IP address is personal data. (c) stops honest mistakes, not abuse; R2 bounds the damage to 60 minutes. *Revisit if* P1 or the demo shows deliberate abuse.

**D-S2 — No rate limit in v1.** For the same reason as (b) above, a per-IP limit would hurt normal users on a shared network. If the service is deployed beyond the demo, add a global limit at a reverse proxy in front of the container, not in the app.

**D-S3 — Lost token (#33): accepted.** If the check-in response is lost or the browser storage is cleared, the table stays occupied for up to 60 minutes. Since Week 13 the token survives a reload (#34), which removes the most common case. Recovery without the token would need an identity, see D-S1.

## 4. Accessibility check (Week 14)

Method: reading `app/page.tsx` and `page.module.css`, and using the page with the mouse in Chrome on 2026-11-27. **Not done: keyboard-only use, a screen reader, an automated audit tool.**

| Check | Result |
|---|---|
| Status not shown by color only | Pass: each table shows "free", "occupied" or "occupied, open to company" as text (S1-AC1 UI test) |
| Text contrast on tables | Pass by calculation: dark green on light green, dark red on light pink, dark brown on light yellow are all well above 4.5:1 |
| Keyboard use | Not tested by hand. By construction: tables and buttons are native `<button>` elements and the S3 toggle is a native checkbox with a label, so they are reachable with Tab |
| Visible focus | Added in Week 13: 3 px blue outline on tables, buttons and the toggle |
| Selected table | `aria-pressed` plus a border, and the text "Selected table: T1" |
| Messages | Results use `role="alert"`, "no free table" and "connection lost" use `role="status"` |
| Page language | `<html lang="en">` |
| Known gaps | The map moves down when "Your table" appears; the 5 s refresh is not announced (on purpose, to avoid noise); no test with a screen reader or on a phone |

## 5. AI-use log audit (Week 14)

Checked [AI_USAGE.md](AI_USAGE.md) entries 1–15 against the Git history on 2026-11-27.

- Every commit that contains AI-written code or documents has an entry naming the tool, the input, the output and the checks.
- Entries 12–15 still say "Checks by the team: pending". **Action for the team:** re-run the listed checks and fill in these lines before the final submission, or state that they were not re-run.
- The S3 acceptance criteria and the decisions D-S1 to D-S3 were proposed by the AI. They count as team decisions only once a member has reviewed them.

## 6. Still to do before the final release

1. Both members review this page and sign off below.
2. Use the page with the keyboard only, on a phone, and with a screen reader (VoiceOver or TalkBack), and record the results in section 4.

**Reviewed by:** _(to fill)_
