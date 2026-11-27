# Requirements-to-test traceability — SeatTogether

**Team:** EPITECH
**Course:** Week 11 (issue #31)
**Last updated:** 2026-11-07, branch `docs/week11-traceability`

This page links each criterion to the tests and evidence that support it, and names what they do not show. A passing test only supports the cases it checks (Sommerville, Ch. 9).

## 1. Criteria to tests

Test files: **U** = `lib/seatStatus.test.ts` (unit, C2), **R** = `app/api/tables/route.test.ts` and `app/api/tables/[id]/checkin-checkout.test.ts` (feature, through the API), **UI** = `app/page.test.tsx` (C1, fake API).

| Criterion | Requirement | Automated tests | Manual or system evidence | Status |
|---|---|---|---|---|
| S1-AC1 | Free and occupied tables shown, each with color and text label | U "S1-AC1"; R "shows a checked-in table as occupied" | [UI check](evidence/2026-10-17_c1_ui_check.md) step 1, re-run by Esteve | Passed on the temporary layout. Color and label: manual only |
| S1-AC2 | "No free table reported right now" above the map | U "S1-AC2"; R "returns noFreeTable" | UI check step 5 (AI run only) | Passed on the temporary layout. Message on screen: manual only |
| S2-AC1 | Check-in makes the table occupied | U "S2-AC1"; R "S2-AC1" | UI check step 1, re-run by Esteve; `api_check.sh` steps 1–2 | Passed |
| S2-AC2 | Check-out makes the table free | U "S2-AC2"; R "S2-AC2" | UI check step 4 (AI run only); `api_check.sh` step 5 | Passed |
| R1 | Check-in at an occupied table is rejected | U "R1"; R "R1" | UI check step 2 (AI run only); `api_check.sh` step 3 | Passed |
| R2 | A check-in expires after 60 minutes | U three "R2" tests, on both sides of the limit | D1 check in the UI check, with the duration set to 5 s | Passed. The 60 min value is not validated with users |
| Security | Only the check-in token can free a table | U "security"; R "security" | UI check step 3 (AI run only); `api_check.sh` step 4 | Passed |
| Refresh (#29) | A check-in shows in another browser within 10 s | UI "within 10 s", with a fake API | [Refresh check](evidence/2026-11-07_auto_refresh_check.md), AI run only | Passed on localhost, team re-run pending |

Not testable yet: S3 and S4 have no acceptance criteria. S3 waits for P1 (#30).

## 2. Coverage by test level

| Level | Current state | Remaining limit |
|---|---|---|
| Unit | 13 tests on C2. `lib/` has 100% line coverage | Coverage shows that lines ran, not that the expected results are right |
| Feature (API) | 15 route tests, no server needed | Route handlers are called directly, without HTTP |
| UI | 5 tests on the refresh | Fake API. S1 and S2 screens have no automated UI test |
| System | `scripts/api_check.sh`: 6/6 on the production build, 2026-11-07. Two-browser refresh check | Run by hand, and the two-browser script is not in the repository |
| Acceptance | Team-run scenarios only | No real student has used the product. P1 (#30) is not done |
| Regression | `npm test` by hand: 33/33 on 2026-11-07 | Nothing runs it automatically before a merge. CI is the Week 12 topic |
| Performance | Not tested | The lunch rush load is unknown, and there is no response-time requirement yet |
| Security | Token check, wrong token rejected | No rate limit and no abuse testing. See report section 6 and #32 |

Coverage on 2026-11-07 (`npm run test:coverage`): 91.26% of lines, 86.36% of branches. `app/page.tsx` has the lowest branch coverage (75%).

## 3. Defect triage

Defects are tracked as GitHub issues in the milestone "M5 Release candidate". Severity is the effect on the main task (find a table, check in, check out).

| Issue | Defect | Severity | Decision |
|---|---|---|---|
| #35 | In-memory store loses all check-ins on restart | High | Decide before the Week 12 deployment work |
| #32 | One student can occupy several tables at once | Medium | Needs a team decision, without adding accounts |
| #33 | A lost token leaves the table occupied for up to 60 minutes | Medium | Accept for the demo (R2 limits it), list as a known issue |
| #34 | After a reload the page does not show which table is mine | Low | Fix if time allows before M5 |

The severities and decisions above are a proposal, to confirm at the team's triage.

## 4. Next test work

1. Run P1 (#30): the only way to get acceptance evidence from real students.
2. Add automated UI tests for S1-AC1 and S1-AC2 (labels and the "no free table" message).
3. Run `npm test`, lint and build in CI (Week 12).
4. Agree on a response-time target, then run a load check against it.
