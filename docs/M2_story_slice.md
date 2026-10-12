# M2 Story Slice — SeatTogether

**Team:** EPITECH
**Product:** SeatTogether
**Members:** Esteve BASCUNANA (12264733), Adam LARKEM (12264692)
**Date:** 2026-09-29
**Status:** Draft. Expected behavior only. No test has been executed and no user feedback has been collected.

This file is the Week 4 story slice. The full M2 (backlog and requirements specification) also includes the ordered Product Backlog in [BACKLOG.md](BACKLOG.md).

---

## 1. Context (from M1)

**M1 input: user and problem**
Inha University students who struggle to find a free table in the cafeteria during the lunch rush, and who sometimes eat alone and might welcome company. Today they scan the room visually, sometimes doing a full lap with a tray in hand.

**Feedback received:** No feedback yet. The M1 prototype test with 8–10 students has not been run.

**Revision or decision to retain the current direction, with a reason**
We retain the M1 direction. No new evidence has been collected since M1, so there is nothing that justifies a change. For this slice we focus on the "find a free table" flow, because the social feature ("open to company") is displayed on the same table map and depends on it.

**User profile (proto-persona)**
An Inha student on a lunch break, holding a tray, with roughly 30–60 minutes to eat. Comfortable with a smartphone, but with limited free hands while carrying food. Wants to sit down quickly.

**Evidence source, or clearly labeled assumption**
- Known (team's own repeated experience as cafeteria users): the cafeteria is crowded at peak time and free tables are hard to spot from a distance.
- Assumed: most students can access their phone when arriving; the problem is frequent for many students (M1 assumption #3, confidence Medium); students will perform check-in (M1 assumption #2, confidence Low).

**Scenario**
It is 12:15 and a student arrives at the cafeteria with a full tray. Instead of walking around the room, they open SeatTogether, see which tables are free, and go straight to one. Once seated, they mark the table as occupied so that other students do not walk to it for nothing.

---

## 2. S1 — First core story

**As a** student arriving at the cafeteria with a tray, **I want** to see which tables are free on a map of the cafeteria, **so that** I can go directly to a free table instead of walking around searching.

**S1-AC1**
Given table T1 is marked free and table T2 is marked occupied,
when the student opens the cafeteria map,
then T1 is displayed as free and T2 as occupied, and each state is shown with both a distinct color and a text label, without the student needing to tap a table.

**S1-AC2**
Given every table is marked occupied,
when the student opens the cafeteria map,
then the app displays the message "No free table reported right now" above the map.

**Priority and rationale; dependency**
Priority 1. This is the value the user sees directly, and it is the first screen of the M1 clickable prototype.
Dependency: S1 needs table statuses, which S2 produces. In the prototype, statuses are simulated by the facilitator.

---

## 3. S2 — Second core story

**As a** student who has just sat down at a table, **I want** to mark my table as occupied by selecting it and confirming once, and free it when I leave, **so that** other students do not walk to a table that is already taken.

**S2-AC1**
Given table T1 is displayed as free,
when the student selects T1 and confirms "I'm sitting here",
then T1 is displayed as occupied on the map.

**S2-AC2**
Given the student is checked in at T1,
when the student selects "I'm leaving",
then T1 is displayed as free on the map.

**Priority and rationale; dependency**
Priority 2. It provides the data that S1 displays, but from the user's point of view it happens after finding a table.
Dependency: S2 selects the table on the map displayed by S1, so S2 needs the S1 map screen. S2's status logic does not depend on S1.

---

## 4. Alternate/invalid case, exclusions, open questions

**One rule still needing agreement**
A table can seat several people. If T1 is already occupied and another student tries to check in at T1, should the app (a) reject the check-in, (b) accept it and keep T1 occupied, or (c) track individual seats instead of whole tables? Not decided. Option (c) would change the M1 scope, which works at table level.

**Other open questions (not decided)**
- After how long is a check-in considered expired if the student never selects "I'm leaving"?
- How quickly must a status change appear for other users? No value has been agreed.

**One capability excluded from this slice, with a reason**
The "open to company" status and community status reporting are excluded from this slice. The slice is limited to two stories on one user task, and the seating map (S1, S2) must exist before the social status can be shown on it. Both features remain in the M1 vision.

---

## 5. Team review

- [ ] Both stories relate to the same stated user task and scenario.
- [ ] Each criterion has a result another person could inspect.
- [ ] Assumptions, agreed draft rules, and open questions are distinguishable.
- [ ] The document describes expected behavior without inventing test results.

**Reviewer; ambiguity found; change made (or reason no change was needed)**
Writer: Esteve BASCUNANA. Reviewer: Adam LARKEM, on the pull request for branch `docs/m2-requirements`.
Ambiguity found and change made: TODO (Adam, from the PR review).

**Saved file/location or commit link; person who reopened and checked it**
Saved in the team repository as `docs/M2_story_slice.md` (branch `docs/m2-requirements`, merged through a pull request). Reopened and checked by: TODO (Adam, after merge).

**AI use**
Used. See AI_USAGE.md, entry 2 (2026-09-29): Claude drafted this document from our M1 worksheet and the Week 4 lab guide. The team's checks and changes are recorded there.
