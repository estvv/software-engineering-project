# AI_USAGE.md — SeatTogether (Team EPITECH)

Log of AI tool use in the ISE4133 project. AI output is not user research and is never reported as observed evidence.

---

## Entry 1 — M1 Product Vision critique

- **Date:** 2026-09-18
- **Tool:** Claude (Anthropic)
- **Milestone:** M1 — Product Vision
- **Purpose:** Critique of our What / Who / Why and product vision, using the prompt supplied in the M1 worksheet.
- **Prompt:** The M1 "critical product coach" prompt, with our What / Who / Why and vision statement pasted in. Instruction text reconstructed in M1, Worksheet 3; the exact pasted context was not preserved.
- **Output:** Not preserved (no saved conversation or link). The team does not reconstruct it from memory; see M1, Worksheet 3.
- **Team decisions:** Recorded point by point (accept / modify / reject, reason, verification action) in M1, Worksheet 3.
- **Checks by the team:** Each suggestion was discussed. The accepted points (tray/phone friction, behavioral signal instead of stated intention) were integrated into the verification plan on 2026-09-29 (see entry 4).

---

## Entry 2 — M2 story slice draft

- **Date:** 2026-09-29
- **Tool:** Claude (Anthropic)
- **Milestone:** M2 preparation — Week 4 story slice (M2_story_slice.md)
- **Purpose:** Draft the story slice from our M1 worksheet and the Week 4 lab guide.
- **Input given to the AI:** Our M1 submission, the Week 4 lecture slides, and the Week 4 lab guide.
- **Output:** A first draft of M2_story_slice.md (context, proto-persona, scenario, stories S1 and S2, acceptance criteria, open rule, excluded capability).
- **What the AI did not do:** It did not produce user feedback, observations, or test results. The teammate review and the save/reopen check were left for the team to do.
- **Checks by the team:** Adam reviewed M2_story_slice.md and BACKLOG.md on the PR: S1 before S2 makes sense since statuses are simulated in the prototype; backlog order and Definition of Done accepted as a draft. He found that the S2 dependency statement contradicted S2's acceptance criteria.
- **Changes made by the team:** S2 dependency reworded (S2 needs the S1 map screen; its status logic does not depend on S1); missing final newline added (see entry 5).

---

## Entry 3 — Architecture v1 draft

- **Date:** 2026-09-29
- **Tool:** Claude (Anthropic)
- **Milestone:** M3 preparation — Week 5 Architecture v1 (Architecture_v1.md)
- **Purpose:** Draft the structure diagram and decision D1 from our M2 story slice and the Week 5 worksheet.
- **Input given to the AI:** M2_story_slice.md, the Week 5 lecture slides, and the Week 5 worksheet.
- **Output:** A first draft of Architecture_v1.md (4 components, criterion paths for S1-AC1 and S1-AC2, decision D1, Week 6 handoff).
- **What the AI did not do:** No code, no test results. The peer review, writer/reviewer names, and save check were left for the team.
- **Checks by the team:** Adam reviewed Architecture_v1.md on the PR: both criterion paths (S1-AC1, S1-AC2) trace through C1 → C2 → C3/C4 to a visible result, arrows are labeled, and D1 compares two options with a real cost. He checked the Sommerville reference year and found a missing unknown.
- **Changes made by the team:** Status-change latency added to the unknowns; Sommerville year corrected to 2020; missing final newline added (see entry 5).

---

## Entry 4 — Document review and corrections

- **Date:** 2026-09-29
- **Tool:** Claude (Anthropic), Claude Code
- **Milestone:** M1, M2, M3 preparation
- **Purpose:** Check all project documents against the course PDFs (syllabus, weeks 2–5) and correct formatting and consistency problems.
- **Input given to the AI:** All course PDFs and all files in this repository.
- **Output / changes made by the AI:**
  - M1: converted to Markdown with tables; restored lost dashes; fixed typos ("open to the company", "real-time" vs "near real-time"); corrected "exactly three assumptions" to match the worksheet ("at least three"); cold-start row changed from Accept to Modify; the two accepted AI suggestions were applied to the test procedure; proposed success thresholds (7/10 check-in, 3/10 spontaneous toggle); filled in the actual prompt structure.
  - M2: fixed the "one action" wording in S2; linked the backlog.
  - Architecture v1: clarified that D1 targets the coded MVP, not the mockup.
  - New BACKLOG.md (ordered backlog, draft Definition of Done) and README.md.
  - This file: entry 1 corrected (it claimed the output was reproduced in M1 and that the plan was already updated; neither was true).
- **What the AI did not do:** It did not write the M1 AI output excerpt, reviews, or team checks, and did not invent test results.
- **Checks by the team:** Esteve reviewed the list of corrections and decided: the pitch took place in Week 2 (not Week 1); the lost M1 AI output is recorded as not preserved rather than reconstructed; the success thresholds, backlog order and Definition of Done stay proposals until Adam reviews them.
- **Changes made by the team:** These decisions were applied by Claude on Esteve's instruction (2026-09-29): Week 2 in M1, "not preserved" output note, Esteve's re-sign-off, writer/reviewer names in M2 and Architecture v1. Adam's review (2026-10-12): success thresholds changed to percentages so they apply to 8–10 participants; backlog order and Definition of Done agreed as a draft; entry 1 wording corrected (see entry 5).

---

## Entry 5 — Applying Adam's PR review comments

- **Date:** 2026-10-12
- **Tool:** Claude (Anthropic), Claude Code
- **Milestone:** M1, M2, M3 preparation
- **Purpose:** Apply the review comments Adam left on PRs #1–#4.
- **Input given to the AI:** Adam's four review comments and all files in this repository.
- **Output / changes made by the AI:**
  - M2: S2 dependency reworded (S2 needs the S1 map screen; its status logic does not depend on S1); missing final newline added.
  - M1: success thresholds expressed as percentages rounded up, so they apply to 8–10 participants; next meeting updated to Tue 2026-10-13.
  - Architecture v1: status-change latency added to the unknowns in section 1; Sommerville reference year corrected to 2020; missing final newline added.
  - This file: entry 1 no longer claims the full prompt text is in M1.
  - README: Git_practice_log.md added to the documents table.
- **What the AI did not do:** It did not decide any change; every change comes from Adam's review comments.
- **Checks by the team:** Esteve asked for the fixes and reviewed the diff. Adam wrote the review comments and wanted these changes.
- **Changes made by the team:** The review points came from Adam; the wording follows his suggestions. His review, sign-off and "reopened and checked by" fields were filled on 2026-10-12.

---

## Entry 6 — Midterm plan and R1/R2 decisions

- **Date:** 2026-10-15
- **Tool:** Claude Code (Anthropic)
- **Milestone:** Midterm report (Week 8)
- **Purpose:** Turn the midterm submission guide into a step-by-step plan with owners, and record the team's decisions on the stack and rules R1/R2.
- **Input given to the AI:** All files in this repository and all course PDFs (syllabus, weeks 2–7, midterm submission guide, report template).
- **Output / changes made by the AI:** New MIDTERM_PLAN.md; R1 and R2 rows in BACKLOG.md updated with the decisions; README documents table updated.
- **What the AI did not do:** It did not take the decisions. The AI proposed options; Esteve chose Next.js (instead of the suggested Node + Express), rejection of check-ins at occupied tables (R1), and a 60-minute expiry (R2).
- **Checks by the team:** Esteve chose the options and asked for the files. Adam's review on the pull request is pending.
- **Changes made by the team:** _To fill after Adam's review._

---

## Entry 7 — API contract v1 and temporary layout

- **Date:** 2026-10-15
- **Tool:** Claude Code (Anthropic)
- **Milestone:** Midterm, Step 1 (Week 6 API contract)
- **Purpose:** Draft the C1 → C2 API contract and a placeholder `data/layout.json`.
- **Input given to the AI:** Architecture_v1.md, M2_story_slice.md, BACKLOG.md (R1, R2), the Week 6 and Week 7 lecture slides.
- **Output:** A first draft of API_contract.md (3 operations, JSON representations, error codes, traceability, known limits) and a 3 × 4 placeholder layout (T1–T12).
- **Team decisions taken before drafting:** Esteve chose: `noFreeTable` flag decided by C2; check-out token in the contract from v1; grid row/column positions; a placeholder layout until the cafeteria sketch is done.
- **What the AI did not do:** No code, no test run. The layout is not the real cafeteria and is labeled as temporary.
- **Checks by the team:** Esteve took the four decisions above before drafting. The behavior described in the contract was checked by running the implementation (entry 9, `scripts/api_check.sh`, 6/6). Adam's review of the contract on PR #6 is pending.

---

## Entry 8 — Next.js setup and S1 backend

- **Date:** 2026-10-15
- **Tool:** Claude Code (Anthropic)
- **Milestone:** Midterm, Step 2 (S1 backend)
- **Purpose:** Set up the Next.js project and implement C2, C3, C4 and `GET /api/tables` from API_contract.md, with tests.
- **Input given to the AI:** API_contract.md, Architecture_v1.md, M2_story_slice.md, data/layout.json.
- **Team decisions taken before coding:** Esteve chose TypeScript, Vitest, npm, and the app at the repository root.
- **Output:** Next.js 16 project (create-next-app), `lib/types.ts`, `lib/layout.ts` (C3), `lib/statusStore.ts` (C4), `lib/seatStatus.ts` (C2, including the R2 60-minute expiry), `app/api/tables/route.ts`, 7 Vitest tests (S1-AC1, S1-AC2, R2, sort order, route status/headers), placeholder home page, README run instructions.
- **Checks run by the AI (2026-10-15):** `npm test` 7/7 passed; `tsc --noEmit`, `npm run lint` and `npm run build` succeeded; `next start` served `GET /api/tables` with `200`, `Cache-Control: no-store`, and 12 free tables.
- **What the AI did not do:** C1 Map UI (Adam), S2 endpoints (Step 3). No screenshots yet.
- **Checks by the team:** Esteve re-ran `npm test` on 2026-10-15 at 19:00 KST (commit `d786cca`, which includes this code): 28/28 passed, including the 7 tests from this entry ([screenshot](evidence/2026-10-15_esteve_npm_test.png)). Adam's review on PR #7 is pending.

---

## Entry 9 — S2 check-in / check-out and token check

- **Date:** 2026-10-15
- **Tool:** Claude Code (Anthropic)
- **Milestone:** Midterm, Step 3 (S2 backend and security check)
- **Purpose:** Implement `POST /api/tables/{id}/checkin` and `/checkout` from API_contract.md, with rules R1, R2 and the check-out token.
- **Input given to the AI:** API_contract.md, the code from entry 8, BACKLOG.md (R1, R2).
- **Output:** `checkIn` / `checkOut` / `tableExists` in `lib/seatStatus.ts` (C2), `lib/apiErrors.ts`, the two route handlers, response types in `lib/types.ts`, 21 new tests (28 in total), [manual API check](evidence/2026-10-15_api_manual_check.md) and `scripts/api_check.sh` to re-run it.
- **Checks run by the AI (2026-10-15):** `npm test` 28/28 passed; `tsc --noEmit`, `npm run lint`, `npm run build` succeeded; manual `curl` check on `next start`: all six results match the contract (see the evidence file).
- **What the AI did not do:** No UI for the buttons (Adam), no security section text (Adam). The checks were not repeated by a team member yet.
- **Checks by the team:** Esteve re-ran both checks on 2026-10-15 at 19:00 KST (commit `d786cca`): `npm test` 28/28 passed; `bash scripts/api_check.sh` 6/6 passed with the expected status codes ([evidence](evidence/2026-10-15_api_manual_check.md)). Adam's review on PR #8 is pending.

---

## Entry 10 — C1 Map UI, S2 buttons and report sections 5–7

- **Date:** 2026-10-17
- **Tool:** Claude Code (Anthropic)
- **Milestone:** Midterm, Steps 2, 3 and 5 (front-end and report)
- **Purpose:** Implement C1 and the S2 buttons from API_contract.md, record the UI evidence, and draft report sections 5 (front-end part), 6 and 7, appendix A3 and Adam's individual report.
- **Input given to the AI:** API_contract.md, `lib/types.ts`, the backend code (entries 8, 9), issues #14, #15, #18–#20, #23, and the team report draft (PR #25).
- **Team decisions taken before coding:** In his review of PR #8, Adam chose to keep `checkinToken` per table in `localStorage`, show `error.message` unchanged for 403/409, and refetch the map after each action.
- **Output:** `app/page.tsx`, `app/page.module.css`, README and MIDTERM_PLAN updates, [UI check](evidence/2026-10-17_c1_ui_check.md) with five screenshots and the D1 check, the text of report sections 5 (front-end), 6, 7 and A3, a draft of Adam's individual report, and Adam's review comment on PR #25.
- **Checks run by the AI (2026-10-17):** `npm test` 28/28 passed; `npm run lint`, `npx tsc --noEmit`, `npm run build` succeeded; browser check on `next start`: 5/5 steps as expected; D1 check: R2 set to 5 s in C2 only, table free again after 5 s with no change to C1 (reverted, not committed).
- **What the AI did not do:** No user research; every status in the screenshots was created by us. The checks were not repeated by a team member yet.
- **Checks by the team:** Adam asked for the work and read the result. Re-run of the browser check by a team member and Esteve's review on PR #26: pending.
