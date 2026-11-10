# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul)

## Current baseline and release constraints

- `main`: `b5a94be`, Story Mode 2.0 with nine checkpointed episodes across 27 missions. PR #97, #98, #99 are merged; current episode boundaries and resume flow are present.
- Main Actions run 945 had a Chromium save-restore race. Draft PR #100 adds a readiness wait; CI run 946 passed all five jobs. This fix has not been merged.
- Vercel project `towerv1` is Git-linked to this repository with `main` as production branch, so merging can publish automatically. No production deploy or Vercel settings change was made. Do not merge/publish without the user's batch-release approval.
- Open legacy PRs #78, #63, #61, #55, #54, #50, #12, #10, and #4 are old-base or drafts; none was merged into this work.

## Work packages

| Package | Status | Evidence / changes |
|---|---|---|
| 0. Baseline and continuity | Complete | Verified main SHA, PR #97–99 merge state, Actions and Vercel Git deployment context. |
| 1. Story gameplay and reliability | In progress | Draft PR #101 adds physical route choices for mission 20, a final boss attack tell countered by Piko's existing shield, and carries the mission 13 trust choice into mission 21 dialogue. CI run 951 passed all five jobs. Remaining episodes need pacing and mechanic work; human episode times are not measured. |
| 2. LOST SIGNAL art | Not started | Main menu preserved. Inspected existing iPad high-wave and final-boss screenshots; enemy silhouettes vary but high-wave board is crowded and story sectors remain sparse. Visual overhaul still needed. |
| 3. Endless HUD | Not started | No changes; preserve Endless economy/progression. |
| 4. Skill mini-game replacement | Not started | No changes; inspect current gambling feature and its save/reward links before replacement. |
| 5. New content | Not started | No changes; select a small complete feature after core quality. |
| 6. Final QA and optimization | In progress | PR #100 run 946 passed; PR #101 run 951 passed. Automated WebKit/Chromium checks cover campaign, device viewports and Firestore rules. No physical iPad session, human playtest, or timed episode measurement. |

## Latest verified package

- PR #100: draft, branch `overhaul/story-quality-pass-01`; test-only save-restore readiness/race fix. CI run 946 passed all five jobs. Progress-file commit before this update: `fd1d6f7`.
- PR #101: draft, branch `story/finale-boss-defense`; latest commit `eea19cb`; URL https://github.com/1rid3mon/towerv1/pull/101.
- PR #101 files: `story-interior-missions16-20.js`, `story-interior-missions21-27.js`, `security-lab/story-interior-16-20-playthrough.cjs`, `security-lab/story-interior-21-27-playthrough.cjs`.
- Gameplay: mission 20 chooses among three physical corridor routes and opens only the selected gate; mission 27's distinct octagonal Çapa Yıkıcı telegraphs a strike that existing Piko MOR DESTEK interrupts; mission 21 dialogue reflects either saved trust branch from mission 13. No save schema, economy, or core combat balance change.
- Local checks: Story runtime suite 79/79; `node --check` for all four files; `git diff --check`.
- CI: run 947 passed for the original finale boss package. Run 950 caught a wrong route in the WebKit test (test moved to the lower lane before crossing the selected middle lane). The test now waits for the player to move into the selected route. Run 951 passed Chromium overhaul, WebKit overhaul, browser smoke, WebKit device smoke, and Firestore emulator.
- Visual evidence: inspected run 951 WebKit screenshot `story-final-boss/webkit/mission-27-boss-warning.png`. Boss and shield control are visible; existing sector and enemy presentation remain sparse and crowded in high-wave views. This is not a human playtest.
- Local Playwright cannot start Chromium because the sandbox blocks its process-singleton socket; actual browser evidence comes from CI.
- Earlier backup branch `story/silent-fleet-routes` at `006dfca` remains; the route implementation is also in PR #101.

## Known gaps and next concrete steps

1. Continue revising the remaining episode experiences so each has distinct exploration, combat, defense, puzzle, and narrative beats; preserve checkpoint and legacy-save behavior. Do not claim target episode durations until human playtests measure them.
2. Then begin the visual pass. Keep the main menu unchanged; address story-sector atmosphere and the crowded normal-enemy views identified in CI screenshots.
3. Redesign Endless HUD, then replace the gambling mini-game with a skill-based signal task and update its saved reward connections.
4. Select and implement a small amount of complete new content; then finish browser, save/retry, iPad, performance, and localization QA.
5. Work remains on draft feature PRs. Do not merge to `main` or deploy production without explicit batch-release approval.
