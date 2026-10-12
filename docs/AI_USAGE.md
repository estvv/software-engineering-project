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
- **Checks by the team:** TODO (Esteve + Adam, during the PR review): what you verified (e.g. stories match M1, criteria are understandable without help, assumptions correctly labeled).
- **Changes made by the team:** TODO (Esteve + Adam, during the PR review): what you changed in the draft, or "none, because ...".

---

## Entry 3 — Architecture v1 draft

- **Date:** 2026-09-29
- **Tool:** Claude (Anthropic)
- **Milestone:** M3 preparation — Week 5 Architecture v1 (Architecture_v1.md)
- **Purpose:** Draft the structure diagram and decision D1 from our M2 story slice and the Week 5 worksheet.
- **Input given to the AI:** M2_story_slice.md, the Week 5 lecture slides, and the Week 5 worksheet.
- **Output:** A first draft of Architecture_v1.md (4 components, criterion paths for S1-AC1 and S1-AC2, decision D1, Week 6 handoff).
- **What the AI did not do:** No code, no test results. The peer review, writer/reviewer names, and save check were left for the team.
- **Checks by the team:** TODO (Esteve + Adam, during the PR review).
- **Changes made by the team:** TODO (Esteve + Adam, during the PR review).

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
- **Changes made by the team:** These decisions were applied by Claude on Esteve's instruction (2026-09-29): Week 2 in M1, "not preserved" output note, Esteve's re-sign-off, writer/reviewer names in M2 and Architecture v1. Adam's review: TODO (Adam, on the PRs).

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
- **What the AI did not do:** It did not fill Adam's review, sign-off or "reopened and checked by" fields.
- **Checks by the team:** Esteve asked for the fixes and reviewed the diff. Adam: TODO (on the PR).
- **Changes made by the team:** TODO (Adam, on the PR).
