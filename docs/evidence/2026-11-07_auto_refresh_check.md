# Automatic map refresh check — 2026-11-07

Issue #29. Done when: two browsers are open and a check-in in one shows in the other within 10 s.

Run by Claude Code on Esteve's machine, branch `feat/map-auto-refresh`, with `npm run build` then `next start -p 3124`. Two separate headless Chrome contexts (A and B), so they share no `localStorage`. Temporary layout, in-memory store. The script was a throwaway check and is not in the repository.

| Run | Action in A at T3 | Expected in B, no reload | Check-in visible in B | Check-out visible in B |
|---|---|---|---|---|
| 1 | Check in, then check out | Within 10 s | 5373 ms | 4849 ms |
| 2 | Check in, then check out | Within 10 s | 5365 ms | 4851 ms |
| 3 | Check in, then check out | Within 10 s | 5367 ms | 4858 ms |

Screenshot of browser B after a check-in in A: [2026-11-07_auto_refresh_browser_b.png](2026-11-07_auto_refresh_browser_b.png).

**Limits.** The times come from one machine on localhost, and all three runs started at the same point of the 5 s polling cycle, so they do not show the spread: the expected worst case is about 5 s plus the request time. No real network or real load was tested. This run has not been repeated by a team member yet.

## Do the new tests detect a fault?

Each change below was made temporarily to `app/page.tsx`, then reverted.

| Change | Tests that failed |
|---|---|
| Remove the "latest request only" guard | Slow poll after a check-in |
| Poll every 15 s instead of 5 s | Check-in within 10 s, poll failure, slow poll |
| Keep polling while the tab is hidden | Hidden tab |
