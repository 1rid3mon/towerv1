# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul)

## Current baseline

- `main` starts at `b5a94be` (`Story Mode 2.0: nine checkpointed episodes across 27 stages`). PR #97, #98, and #99 are merged; the nine episode boundaries and checkpoint resume logic are present.
- Main run 945 (`42389176721`) failed because Chromium read `TowerHardV10.path()` before wave 60 restored after reload. Draft PR #100 adds a readiness wait; CI run 946 (`42902455101`) passed all five jobs, including Chromium and WebKit. The fix remains on PR #100.
- Local targeted baseline passed 84/84 checks. Latest story runtime suite passed 79/79 after the mission 20 and 27 changes. Syntax checks and `git diff --check` passed on all four changed JS files.
- Browser verification for the initial PR #101 boss package passed in run 947: Chromium, WebKit, browser smoke, Firestore emulator, and WebKit device smoke. That run predates the mission 20 physical route update. Updated PR #101 run 950 is in progress; do not count the new route as browser-verified until it completes.
- Browser binaries cannot run locally: system Chromium cannot create its process-singleton socket in this sandbox. CI browser results are not human visual review or a timed playtest.
- Open legacy PRs #78, #63, #61, #55, #54, #50, #12, #10, and #4 were found based on older main or as drafts; none was merged into this work.
- Vercel project `towerv1` is Git-linked to `1rid3mon/towerv1`, with production branch `main`; a merge to main can publish automatically. No production deploy or Vercel settings change was initiated.

## Work packages

| Package | Status | Evidence / changes |
|---|---|---|
| 0. Baseline and continuity | Complete | Verified main SHA, PR #97–99 merge state, Actions, and Vercel Git deployment context. |
| 1. Story gameplay and reliability | In progress | Draft PR #101 adds mission 20's three traversable route corridors (short/exposed, balanced, covered/long) and an episode 9 finale boss attack tell countered by Piko's existing shield. Browser runner drives the chosen route and checks the counter. Run 947 passed for the original boss package; run 950 is testing the route update. No human playtime measurement; no claim that episodes meet 8–12 minutes. |
| 2. LOST SIGNAL art | Not started | Preserve the main menu as visual reference. Existing V17 enemy/Piko/companion/boss systems remain; episode environment review and new cohesive art are pending. |
| 3. Endless HUD | Not started | No changes yet; retain economy and progression. |
| 4. Skill mini-game replacement | Not started | No changes yet; locate and review current gambling implementation before replacing integrations. |
| 5. New content | Not started | No changes yet; select only after core quality work. |
| 6. Final QA and optimization | In progress | PR #100 CI 946 passed all jobs. PR #101 CI 947 passed all jobs for its then-current code; updated run 950 is pending. No manual human playtest or local visual review. |

## Latest verified package

- PR #100: make Story browser runners accept optional installed Chromium and wait for save restoration before checking the Endless path after reload. This is test reliability work, not a gameplay change.
- PR #100 files: `security-lab/story-interior-21-27-playthrough.cjs`, `security-lab/story-episodes-browser.cjs`, `security-lab/overhaul-browser.cjs`, and this file.
- PR #100 CI run 946 passed; targeted baseline 84/84 passed; local browser launch remains blocked.
- PR #101 branch: `story/finale-boss-defense`; latest commit `4e1fab2`; draft PR: https://github.com/1rid3mon/towerv1/pull/101.
- PR #101 files: `story-interior-missions16-20.js`, `story-interior-missions21-27.js`, `security-lab/story-interior-16-20-playthrough.cjs`, `security-lab/story-interior-21-27-playthrough.cjs`.
- Local verification for PR #101: runtime suite 79/79, four `node --check` checks, and `git diff --check` passed. The browser playthrough uses actual movement/actions after QA setup; CI run 950 is pending for the newest changes.
- Separate checkpoint `story/silent-fleet-routes` at `006dfca` remains as an earlier backup; the route work is now also included in PR #101.

## Known gaps and next concrete steps

1. Wait for PR #101 run 950 to complete; inspect only failed job logs if any.
2. Review browser screenshots/artifacts for route and final boss when the updated run finishes; do not interpret automated QA as a full human art review.
3. Continue with story episode pacing and mission mechanics. No episode has been timed with a human playthrough; current automated scripts can directly position the player at stations.
4. Then proceed in priority order: visual redesign, Endless HUD, skill mini-game replacement, selected new content, and broad QA.
5. Keep every package on a feature branch and PR. Do not merge to `main` or deploy production without explicit batch-release approval because `main` auto-publishes.
