# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul, morning)

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

## Resume checkpoint — 11 November morning

- Status check: more than eight hours without commits after `959dff7` (PR #100) and `eea19cb` (PR #101). The prior executor disconnected; main remained `b5a94be`, and CI run 951 remained fully successful. No work was lost.
- New draft PR #102: https://github.com/1rid3mon/towerv1/pull/102, branch `story/first-contact-patrols`, commit `a2f3342`. Mission 2 patrols now move toward the terminal at distinct speeds, its integrity/threat count appears during defense, and retry restores patrol positions. Files: `story-interior-missions02-05.html`, `security-lab/story-interior-playthrough.cjs`.
- Local syntax and diff checks passed. Browser runner now verifies actual patrol movement; GitHub CI run 955 (`42973411674`) passed all five jobs: Chromium/WebKit overhaul, browser smoke (including moving-patrol playthrough), WebKit device smoke, and Firestore emulator. This package is browser-verified; human episode duration remains unmeasured.
- Next: continue Story episode gameplay and pacing with distinct mechanics; keep legacy saves and checkpoints intact. Avoid repeating completed CI. Do not merge main or deploy production without batch-release approval.

## Checkpoint — lower station investigation

- Draft PR #103: https://github.com/1rid3mon/towerv1/pull/103, branch `story/lower-station-evidence`, commit `9b3a419`. Mission 11 now requires three physical maintenance clues to infer BETA → ALFA → GAMA relay order. Wrong order and missing clues produce feedback. Files: `story-interior-missions11-15.js`, `security-lab/story-interior-11-15-playthrough.cjs`.
- Local `node --check` for both files and `git diff --check` passed. Run 958 passed Chromium and WebKit mission 11 playthrough, grouped episodes, Chromium smoke, and Firestore emulator. WebKit smoke later failed at `security-lab/browser-smoke.cjs:439` during a generic mission 1 replay active-state wait after those checks; root cause is under investigation. This package is not fully CI-verified.
- Next: inspect PR #103 CI, fix any failure, then continue remaining Story mechanics and pacing without touching production.

## Checkpoint — maintenance live passages

- Draft PR #104: https://github.com/1rid3mon/towerv1/pull/104, branch `story/maintenance-live-passages`, commit `5daba65`. Mission 6's three repair actions each deactivate a matching electrical hazard, opening a traversable passage; wrong choices leave the hazard active. Files: `story-interior-missions06-10.html`, `security-lab/story-interior-06-10-playthrough.cjs`.
- Local syntax and diff checks passed. Local Playwright was blocked by the workspace Chromium socket restriction. CI run 960 is in progress; do not mark it verified until both browser engines finish.
- Next: check runs 958 and 960, repair any failed gameplay test, then continue Story depth. Main and production remain unchanged.

## Checkpoint — first defense movement

- Draft PR #105: https://github.com/1rid3mon/towerv1/pull/105, branch `story/first-defense-approach`, commits `a4099f5`, `d47da73`. Mission 1 attackers now advance from separate entry positions, damage the reactor only after reaching it, and reset their positions/attack timer on retry. Fixed a pre-existing loss-path crash from reassigning a `const` enemy array. Files: `story-interior-mission01.html`, `security-lab/story-interior-playthrough.cjs`.
- Local JS syntax and diff checks passed. The browser test observes actual enemy movement, forces a genuine reactor loss through the attack tick, checks retry state, and completes combat. CI for the updated head is pending; human episode duration remains unmeasured. This branch uses main as its base and omits PR #102's separate mission 2 edits.
- Next: resolve CI results for PR #103–105 and continue Story gameplay. All packages remain drafts; no main merge or production deployment.

## Integration checkpoint — Story Stage 1

- Draft PR #106: https://github.com/1rid3mon/towerv1/pull/106, branch `overhaul/story-stage1-integration`, commit `6fa3304`. Combines PR #100–105's code (including overlapping browser runners) and adds a two-chamber pressure equalization console to mission 10. Files: eleven Story/runtime browser files from the component PRs plus PR #100's progress and browser-race files. The mission 10 browser runner checks premature door rejection and two actual transfers before opening.
- Local syntax and `git diff --check` passed. CI for the integrated commit is pending. Main remains `b5a94be`; production remains untouched.
- Known issue: run 958 WebKit smoke timed out on the generic Story mission 1 replay (`browser-smoke.cjs:439`) after mission 11 WebKit playthrough passed. Compare runs 960/964/966 and diagnose this before declaring the integration safe. No failing PR is eligible for main.
- Next: finish those CI results, fix the replay timeout if reproducible, validate the integrated pressure puzzle in Chromium/WebKit, then continue Story depth and measured human pacing. Art, Endless HUD, mini game, content, and final QA remain incomplete.

## Replay timeout diagnosis and fix

- Run 958's WebKit smoke failure at `browser-smoke.cjs:439` is explained by the isolated legacy runtime applying nine-episode resume logic to an already completed mission 1. On replay, the child attempted mission 2 instead of activating the selected legacy mission 1. The smoke assertion exposed a real replay routing bug.
- Integrated PR #106 commit `828c53f` excludes isolated legacy runtime from grouped-episode resume. Normal interior episode grouping and legacy save flags stay intact. Local `story-runtime-behavior.test.js` passed 79/79, `node --check story.js` and `git diff --check` passed. Updated integration CI pending; do not mark fixed in browser until it passes.
- PR #103 run 958 is red despite its mission 11 Chromium/WebKit playthrough passing. Keep PR #103 unmerged; integration PR #106 contains the replay fix. Main and production still unchanged.

## Resume handoff — 11 November, current session

- Authoritative code checkpoint: draft PR #106 `overhaul/story-stage1-integration`, commit `5af7d677b01f382be4bfd3b57577d6940740cca7`. It contains the code of PR #100–105 plus mission 10 pressure transfer, mission 14 first-seal defense priority, the isolated legacy replay fix, an 80th deterministic Story runtime test, and diagnostic output for horizontal overflow. This separate handoff branch has the same game code; only this progress document is newer.
- Component CI: #100 run 946, #101 run 951, #102 run 955, #104 run 960, and #105 run 964 each passed all five jobs. #103 run 958 failed only in a generic WebKit Story replay wait after its mission 11 playthrough passed. The replay bug was addressed in #106; do not merge the red #103 alone.
- Integrated CI: #106 run 971 passed browser-smoke, WebKit smoke, WebKit overhaul and Firestore, but failed Chromium overhaul once on landscape horizontal overflow at `security-lab/overhaul-browser.cjs:62`. Current run 972 (`42978887348`) has passed Chromium overhaul, browser-smoke (including all 27 stages/four languages), WebKit overhaul, and Firestore; WebKit smoke remains in progress at the time of this checkpoint. The overflow was intermittent; diagnostic code reports culprits if it recurs. Do not claim it is fixed.
- Local checks: `node security-lab/story-runtime-behavior.test.js` passed 80/80; JS syntax checks for touched scripts and `git diff --check` passed. Local Playwright could not start system Chromium because its process-singleton socket is blocked. A cloud browser could not connect to this workspace's localhost. Browser evidence therefore comes from Actions, not a physical iPad. No timed human playthrough exists.
- Main remains `b5a94be`; Vercel is Git-linked to main and may publish on merge. No merge, manual production deployment, deployment-setting change, Firebase schema change, or live production verification occurred. No secret or player data was used.

### Exact next action after reset

1. Read this file, inspect PR #106 and CI run 972. If WebKit smoke failed, read the failing job log and repair the root cause. If all five passed, treat commit `5af7d67` as the tested code snapshot, keeping in mind one earlier intermittent horizontal overflow failure.
2. Keep work on a fresh checkout of `overhaul/story-stage1-integration` (or another Story feature branch based on it). The scratch checkout in the previous session was on main with uncommitted file copies, but every intended code change is saved in PR #106. Do not blindly commit all scratch files or replace GitHub's newer branch with main.
3. Continue Stage 1 before starting art. Target the still short nine-episode pacing with meaningful mechanics and connected rooms, then run human timed playthroughs where available. Automated tests accelerate travel between stations, so they prove transitions and controls but **not** 8–12 minute real episode length. Keep checkpoint, old 27-stage saves, Firebase Auth/Firestore, economy, and menu intact.
4. After Story gameplay is genuinely solid: Stage 2 designed enemy/Piko/companion/boss sprites and distinct nine-episode environments; Stage 3 iPad-first Endless HUD; Stage 4 replace the gambling mini-game with a skill-based signal task and migrate its reward/save hooks; Stage 5 a small finished challenge or discovery reward; Stage 6 Chromium/WebKit, iPad orientation/touch, legacy saves, death/retry, high-wave FPS, localization, Firebase and visual screenshot QA.
5. Do not merge any draft to main or alter Vercel production without explicit batch-release approval. Production auto-deploy risk persists. A docs-only update to an open PR can trigger the full five-job workflow, so batch progress writes instead of editing it for every small result.

### Stage 1 episode review still needed

| Episode | Present work | Remaining concrete review |
|---|---|---|
| 1 (1–3) | Moving first defense with real loss/retry; moving patrol defense; signal investigation | Timed human playthrough, room continuity and onboarding clarity on touch |
| 2 (4–6) | Power branch and corridor defense; three repairs open three real passages | Verify power consequences across stages and meaningful route decisions |
| 3 (7–9) | Communications/archive clues and Piko awakening defenses | Strengthen transitions and Piko's interactive awakening; measure pacing |
| 4 (10–12) | Physical pressure transfer, three evidence clues and relay order, archive contradiction | Inspect genuine exploration and timeline logic on iPad |
| 5 (13–15) | Trust result carried to mission 21; first seal sets second-wave strategy; Piko memory repair | Exercise both trust branches and A/B/C seal choices, memory consequence |
| 6 (16–18) | Fake exit, identity choice, three lock-defense waves | Make false-exit tension and defense variety feel earned, verify retry at each wave |
| 7 (19–21) | Orbit records; three physically distinct stealth routes; identity archive | Test patrol sight/route choices without QA teleport and check alert feedback |
| 8 (22–24) | Purple boundary, Piko damage, final defense protocol | Test repair versus combat pressure and choice consequences |
| 9 (25–27) | Piko link/shield, final boss telegraph/counter, preserved final records | Human finale pacing, clear boss warning and satisfying ending/replay |
