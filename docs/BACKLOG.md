# Product Backlog — SeatTogether

**Team:** EPITECH
**Last updated:** 2026-10-15
**Status:** Draft. Order reflects current understanding and will change with evidence (first input: the M1 prototype test).

**Product Goal:** Inha students can find a free cafeteria table at lunch without walking around the room, and students eating alone can signal they are open to company.

Order considers value, risk, and dependencies. Near-term items are detailed; later items stay broad.

| Order | ID | Type | Item | Detail | Status |
|---|---|---|---|---|---|
| 1 | P1 | Investigation | Run the M1 clickable-mockup test (8–10 students) | Tests M1 assumptions #1 and #2; procedure and thresholds in [M1](M1_product_vision.md), Worksheet 2 | To do |
| 2 | P2 | Investigation | Sketch and photograph the cafeteria table layout | Needed by S1 and by component C3 ([Architecture v1](Architecture_v1.md)) | To do |
| 3 | S1 | Story | See which tables are free on a map | S1-AC1, S1-AC2 in [M2 story slice](M2_story_slice.md) | Specified |
| 4 | S2 | Story | Check in / check out of a table | S2-AC1, S2-AC2 in [M2 story slice](M2_story_slice.md) | Specified |
| 5 | R1 | Rule | Check-in at a table already marked occupied | Decision (2026-10-15): reject the check-in; the table stays occupied and the student sees "Table already occupied". Tables are tracked as a whole, as in M1. Implemented in C2. Proposed by Esteve, approved by Adam on PR #5 (2026-10-15). | Decided |
| 6 | R2 | Rule | Check-in expiry when the student never checks out | Decision (2026-10-15): a check-in expires after 60 minutes; the table is then shown as free. 60 min is the upper end of the 30–60 min lunch break in the M2 proto-persona; not validated with users. Implemented in C2. Proposed by Esteve, approved by Adam on PR #5 (2026-10-15). | Decided |
| 7 | S3 | Story | Mark myself "open to company" at my table | As a student eating alone, I want to show that I am open to company at my table, so that another student can join me without me approaching a stranger. Depends on S1. Order depends on P1 results. | Broad |
| 8 | S4 | Story | Report a zone/table as "has space" or "full" | As a student in the cafeteria, I want to report whether a zone has space without sitting there, so that the map stays fresher. Needs a rule for conflicts with check-ins (M1 AI critique). | Broad |
| — | X1 | Excluded (v1) | In-app chat / messaging | Excluded in M1: moderation and safety cost | Not planned |
| — | X2 | Excluded (v1) | Abuse prevention for reports and statuses | Revisit if P1 shows real interest | Not planned |

## Definition of Done (draft)

Proposed by Esteve BASCUNANA; agreed as a draft by Adam LARKEM in the pull-request review (2026-10-12), together with the backlog order above.

A backlog item is done when:

- all its acceptance criteria are met and checked by a team member other than the author;
- the change is merged into `main` through a reviewed pull request;
- related documents (stories, architecture) are updated if the behavior changed;
- any AI use is recorded in [AI_USAGE.md](AI_USAGE.md).
