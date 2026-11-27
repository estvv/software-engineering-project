# Requirements-to-test traceability — SeatTogether

**Team:** EPITECH
**Course:** Week 11 (issue #31), updated for Week 13 (M5 release candidate)
**Last updated:** 2026-11-27, `v1.0.0-rc1`

This page links each criterion to the tests and evidence that support it, and names what they do not show. A passing test only supports the cases it checks (Sommerville, Ch. 9).

## 1. Criteria to tests

Test files: **U** = `lib/seatStatus.test.ts` (unit, C2), **S** = `lib/statusStore.test.ts` (C4 contract, memory and PostgreSQL), **R** = `app/api/tables/route.test.ts`, `app/api/tables/[id]/checkin-checkout.test.ts`, `app/api/tables/[id]/company.test.ts`, `app/api/health/route.test.ts` (feature, through the API), **UI** = `app/page.test.tsx` (C1, fake API), **Sys** = `scripts/compose_smoke.sh` (Docker deployment, runs in CI).

| Criterion | Requirement | Automated tests | Manual or system evidence | Status |
|---|---|---|---|---|
| S1-AC1 | Free and occupied tables shown, each with color and text label | U "S1-AC1"; R "shows a checked-in table as occupied"; UI "S1-AC1" | [UI check](evidence/2026-10-17_c1_ui_check.md) step 1, re-run by Esteve | Passed on the temporary layout |
| S1-AC2 | "No free table reported right now" above the map | U "S1-AC2"; R "returns noFreeTable"; UI "S1-AC2" | UI check step 5 (AI run only) | Passed on the temporary layout |
| S2-AC1 | Check-in makes the table occupied | U "S2-AC1"; R "S2-AC1" | UI check step 1, re-run by Esteve; `api_check.sh` steps 1–2 | Passed |
| S2-AC2 | Check-out makes the table free | U "S2-AC2"; R "S2-AC2" | UI check step 4 (AI run only); `api_check.sh` step 5 | Passed |
| R1 | Check-in at an occupied table is rejected | U "R1"; R "R1"; S "R1 under concurrency" (20 parallel claims, PostgreSQL) | UI check step 2 (AI run only); `api_check.sh` step 3 | Passed |
| R2 | A check-in expires after 60 minutes | U three "R2" tests, on both sides of the limit | D1 check in the UI check, with the duration set to 5 s | Passed. The 60 min value is not validated with users |
| Security | Only the check-in token can free a table | U "security"; R "security" | UI check step 3 (AI run only); `api_check.sh` step 4 | Passed |
| Refresh (#29) | A check-in shows in another browser within 10 s | UI "within 10 s", with a fake API | [Refresh check](evidence/2026-11-07_auto_refresh_check.md), AI run only | Passed on localhost, team re-run pending |
| S3-AC1 | Open to company shown on the map | R "S3-AC1" (2); UI "S3-AC1" | [RC check](evidence/2026-11-27_release_candidate_check.md) steps 2–3, AI run only | Passed. Criteria proposed, to be agreed by the team |
| S3-AC2 | It ends with the check-in | R "S3-AC2"; S "a new check-in … starts closed" | RC check step 4 | Passed |
| S3-AC3 | Off by default, token needed, no personal data | R "S3-AC3" (2); UI "S3-AC3"; S "setOpen needs the right token" | — | Passed |
| #34 | After a reload, the page shows my table | UI "#34" (2), "reads a check-in saved by the previous version" | RC check step 3 | Passed |
| #35 | Check-ins survive an app restart | S (PostgreSQL) | Sys "still occupied after the restart", in CI | Passed |
| Health | `/api/health` reports the store, 503 when it is down | R "health" (2) | Sys "/api/health reports the PostgreSQL store" | Passed |
| Security | Stored token cannot free a table; no token in logs; no framing | U "token storage" (2) | Sys header and log checks | Passed |

Not testable yet: S4 has no acceptance criteria. S3 has criteria and passes, but whether students use it is P1's question (#30).

## 2. Coverage by test level

| Level | Current state (2026-11-27) | Remaining limit |
|---|---|---|
| Unit | C2 rules and token hashing (`lib/seatStatus.test.ts`), C4 contract on both stores | Coverage shows that lines ran, not that the expected results are right |
| Feature (API) | Route tests for every operation, including S3 and health | Route handlers are called directly, without HTTP |
| UI | 14 tests: refresh, S1 display, #34, #32, S3 | Fake API; jsdom, not a real browser |
| System | `compose_smoke.sh` 9 checks on the Docker image, **in CI on every push**; browser run of the main flow | Desktop Chrome only |
| Acceptance | Team-run scenarios only | No real student has used the product. P1 (#30) is not done |
| Regression | **Automated:** CI runs all tests with PostgreSQL on every push and pull request | — |
| Performance | Not tested | Load test planned but not run (TD7 in [Maintenance.md](Maintenance.md)) |
| Security | Token checks, hashed storage, headers, logs, `npm audit` in CI. [Security_review.md](Security_review.md) | No rate limit (decision D-S2); no abuse testing |

Coverage on 2026-11-27 (`npm run test:coverage` with PostgreSQL): 70 tests, 92.04% of lines, 94.82% of branches.

## 3. Defect triage

Defects are tracked as GitHub issues in the milestone "M5 Release candidate". Severity is the effect on the main task (find a table, check in, check out). Decisions updated on 2026-11-27 (proposed by Claude Code, to confirm by the team).

| Issue | Defect | Severity | Decision | State |
|---|---|---|---|---|
| #35 | In-memory store loses all check-ins on restart | High | PostgreSQL store | **Fixed** in Week 12, checked in CI |
| #34 | After a reload the page does not show which table is mine | Low | Remember my check-in in the browser | **Fixed** in Week 13 |
| #32 | One student can occupy several tables at once | Medium | Browser-side limit only; server-side would need accounts or IP addresses (D-S1) | **Partly fixed**, remaining risk accepted |
| #33 | A lost token leaves the table occupied for up to 60 minutes | Medium | Accept, R2 bounds it; #34 removes the reload case (D-S3) | **Accepted**, known issue |
| TD6 | Map moves down when "Your table" appears | Low | Small UI change | Open |

## 4. Next test work

1. Run P1 (#30): the only way to get acceptance evidence from real students, and to decide on S3 for the demo.
2. Run the load test (TD7) and agree on a response-time target.
3. Test on a phone, with the keyboard only and with a screen reader ([Security_review.md](Security_review.md) section 6).
4. Team re-runs of the AI-only checks (refresh, RC check).
