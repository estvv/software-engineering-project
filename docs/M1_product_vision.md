# M1 — Product Vision — SeatTogether

**Course:** ISE4133 Software Engineering
**Team:** EPITECH
**Product:** SeatTogether
**Members:** Esteve BASCUNANA (12264733), Adam LARKEM (12264692)
**Communication:** Discord
**Meetings:** libraries / study lounges / classes
**Next meeting:** Tue 2026-10-13, during ISE4133 class, 9–12h, room M-224

---

## Worksheet 1 — Product vision and scope

### Target user, situation, and current problem

- **[OBSERVED]** As Inha University students ourselves, we have personally experienced the cafeteria becoming crowded during lunch peak hours, with occupied tables scattered across the room and no way to see from a distance which tables are free.
- **[OBSERVED]** This problem of finding a free seat and meeting people at lunch was one of three pitches proposed and discussed during the Week 2 class session. Other students recognized the situation, so it is not only our personal impression; this does not yet show how many students are affected.
- **[ASSUMED]** We assume this problem is frequent and shared by a meaningful share of students (not an isolated inconvenience), and that some students who eat alone would be open to company if it were easy and low-pressure to arrange. Neither has been confirmed through direct observation of other students yet — this is the assumption we plan to test (see Worksheet 2).

### Current workaround or alternative; observations and their source

- **[OBSERVED]** Source: the team's own repeated experience as Inha cafeteria users. Students currently walk through the cafeteria with their tray, visually scanning rows of tables until they spot a free one, sometimes doing a full lap of the room.
- **[ASSUMED]** Students who cannot find a seat quickly either eat standing, leave to eat elsewhere, or eat alone without approaching others even when nearby seats are free at another student's table. These behaviors are plausible but not yet directly observed in other students.

### What / Who / Why

| | |
|---|---|
| **WHAT** — proposed product and its boundary | A mobile/web app for the Inha cafeteria that (1) shows near real-time table availability through student check-ins and community reports, and (2) lets a student eating alone opt into a visible "open to company" status showing their table location. It does not include table reservation, food ordering, or in-app chat/messaging (excluded from v1, see Scope). |
| **WHO** — primary user in a specific situation | An Inha student at the cafeteria during lunch peak hours who either (a) is looking for a free table quickly, or (b) is eating alone and open to sharing a table with another student. |
| **WHY** — observable outcome for that user | Less time spent walking around searching for a seat, and a low-effort, low-pressure way for students eating alone to signal they are open to company — without having to approach a stranger first. |

### Product vision statement

> **FOR** Inha University students who struggle to find a free table during the lunch rush — and who sometimes eat alone and would welcome company — **SeatTogether** is a cafeteria seating-and-social app **THAT** shows near real-time table availability and lets students signal they are open to company. **UNLIKE** walking laps around the cafeteria scanning for a seat, or eating alone in silence, **OUR PRODUCT** combines crowdsourced seat status with an opt-in, location-visible "open to company" status.

### First version: one main user task and up to three essential features

**Main task:** Find a free table quickly and, if eating alone, see and be seen by other students open to company nearby.

1. **Table check-in / check-out** — a student manually marks a table as "occupied" when they sit down and "free" when they leave.
2. **Community status reporting** — any student can flag a zone/table as "has space" or "full" without needing to be sitting there, to keep data fresher.
3. **"Open to company" status** — a student eating alone can toggle a visible status showing their table location on the in-app map.

### One feature excluded for now, and why

**In-app chat / messaging** is excluded from v1. It adds moderation and safety complexity (harassment risk, content moderation) disproportionate to what the MVP needs to prove. The core value is visibility of who is open to company and where; it does not require messaging: interested students can simply walk over, the same way they would approach any open seat.

### Important data or external dependency, and how we could access it

The app needs a floor/table map of the cafeteria to place check-ins and "open to company" markers at table level. We do not have an official floor plan from the Inha administration; for the prototype and MVP, the team will sketch and photograph the cafeteria layout ourselves to build a simplified table map.

---

## Worksheet 2 — Assumptions and verification

### Assumptions

| # | Assumption | Why it matters | Evidence now | Confidence |
|---|---|---|---|---|
| 1 | Students eating alone will be willing to activate a public "open to company" status, even though it publicly signals they are alone. | This is the core mechanism of the social feature. If students see it as embarrassing rather than useful, the feature has no users and delivers no value. | None observed yet. Assumed risk based on general social discomfort around publicly signalling one is alone / approaching strangers. | Low |
| 2 | Students will reliably perform the manual check-in / check-out action for a table, keeping the map accurate over time. | The whole seating feature depends on data freshness. If check-ins are rare or stop when people leave, the map shows stale information and users stop trusting the app. | None observed yet. Assumed risk: similar crowdsourced-status apps (e.g. traffic reporting) usually need a critical mass of engaged users before data is reliable. | Low |
| 3 | Finding a free table at the Inha cafeteria during lunch peak hours is a frequent, real problem for a meaningful number of students, not an occasional inconvenience. | If overcrowding is rare, the core "find a seat" feature has little value and the product loses its main reason to exist. | Informally observed by the team as Inha students during lunch hours (personal experience of crowded seating at peak times); not yet confirmed through direct, structured observation of other students. | Medium |

### Prototype and verification plan

**Riskiest assumption and the question to answer**
We test assumptions #1 and #2 together: the product only works if students actually perform its two core manual interactions, and both can be checked in the same session with the same mockup.
Question: will Inha students, when actually holding a tray and looking for a seat, realistically (a) check a table in/out, and (b) turn on an "open to company" status if eating alone — or do both actions feel like too much friction or too much social exposure?

**Smallest useful prototype; what it will deliberately not build**
A clickable mockup (Figma, or a paper prototype photographed and clicked through) of three screens: the cafeteria map with table status, the check-in / check-out action, and the "open to company" toggle. It will deliberately not build any real backend or data sync, user accounts/authentication, real-time updates, or push notifications — all of that is simulated by the facilitator during the test.

**Target participant or test condition; task or procedure**
8–10 Inha students who regularly eat at the cafeteria, tested individually.
1. The participant holds a tray (or an object of similar size) and is asked to imagine they have just sat down. They check in on a table using the mockup, on their own phone or the facilitator's.
2. The participant is told they are eating alone and is shown the map screen. The facilitator does **not** mention the "open to company" toggle and notes whether the participant activates it spontaneously.
3. Follow-up questions: their reasoning, and whether holding a tray made using the phone difficult.

The facilitator records, per participant: check-in completed without help (yes/no), hesitation or questions, spontaneous toggle activation (yes/no), and comments about tray/phone friction.

**Observation that would support the assumption** (proposed thresholds, to be agreed by the team before the test)
- At least 70% of participants, rounded up (7 of 10, 7 of 9, 6 of 8), complete the check-in without help.
- At least 30% of participants, rounded up (3 of 10, 3 of 9, 3 of 8), activate "open to company" spontaneously, not only after being asked.

**Observation that would make us revise the vision**
Fewer participants than the thresholds above, or most participants saying they would skip check-in as "too much effort for no clear benefit", that the tray makes using the phone impractical, or that they would never make themselves publicly visible as "alone". If this dominates, the team would revise toward a more passive/automatic check-in mechanism and/or a softer, less public version of the social feature (e.g. visible only to a chosen circle rather than to all cafeteria users).

A test with 8–10 students can inform a decision; it does not establish general demand.

---

## Worksheet 3 — Critique and team review

### AI critique

**Tool and date:** Claude (Anthropic), 2026-09-18

**Prompt (reconstructed):**

> You are a critical product coach. Context: [WHAT / WHO / WHY table and product vision statement above, pasted as written]. Restate the proposed user, problem, and value. Identify stated and inferred assumptions, ambiguities, and alternative ways users solve the problem. Suggest evidence for our riskiest assumption. Do not invent user research, observations, or test results. Do not rewrite the vision yet.

The instruction text is the one supplied in the M1 worksheet. The conversation was not preserved, so the exact context pasted into the prompt cannot be shown; it was our What / Who / Why and vision statement as drafted on 2026-09-18.

**Output reference or excerpt:**

Not preserved. The team did not save the conversation or a link to it, and we do not reconstruct the output from memory. The suggestions the team responded to are listed in the decisions table below. For later milestones, every AI interaction is logged with a link or excerpt in [AI_USAGE.md](AI_USAGE.md).

### Team decisions

| Suggestion or claim | Decision | Team's reason | Verification action |
|---|---|---|---|
| Students may not have their phone free/ready when sitting down (hands full with a tray). | Accept | Real friction point we had not considered; it could reduce check-in compliance. | Added to the test procedure: participants hold a tray, and we ask about tray/phone friction (Worksheet 2). |
| Misuse risk (fake "free" status to reserve a table, or bad-faith "open to company"). | Modify | Valid concern, but too early to design anti-abuse mechanisms before we know if the core feature gets used at all. | Noted as a known limitation for v1; revisit only if the prototype test shows real interest. |
| Cold-start / critical-mass risk. | Modify | Valid structural risk, but a mockup test with 8–10 people cannot measure it. We keep it as a noted risk rather than a fourth formal assumption. | None for now; revisit if the prototype test suggests the core loop works but adoption stalls. |
| No abuse-prevention mechanism for community reporting. | Reject (for v1) | Out of scope for a small prototype test; this is a v2 concern once we know the core loop has value. | None for now; documented as future work. |
| Ambiguity: a check-in and a community report can conflict on the same table. | Modify | Fair point, but it does not require a decision yet since the prototype has no real backend logic. | Define a simple rule (e.g. "most recent report wins") once we move past the clickable mockup. |
| Use behavioral evidence, not only declared intention, for the riskiest assumption. | Accept | Directly strengthens our verification plan; we already planned to observe hesitation. | Test procedure updated: the toggle is not mentioned, and spontaneous activation is counted (Worksheet 2). |

### Submission check

- [x] Team details, What / Who / Why, and the vision statement are complete.
- [x] Scope identifies a main task and excludes at least one feature.
- [x] At least three assumptions are clearly separated from observations.
- [x] One risky assumption has a prototype and verification plan.
- [ ] The actual critique and reasoned team decisions are recorded. *(team decisions recorded; the AI output itself was not preserved, see above)*
- [x] Every member can explain the final vision and its remaining uncertainty.

### Sign-off

| Member | First sign-off | Sign-off after the 2026-09-29 revision |
|---|---|---|
| Esteve BASCUNANA | 2026-09-18 | 2026-09-29 |
| Adam LARKEM | 2026-09-18 | TODO (Adam, on the PR review) |
