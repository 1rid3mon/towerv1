# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul)

## Current baseline

- `main` starts at `b5a94be` (`Story Mode 2.0: nine checkpointed episodes across 27 stages`). PR #97, #98, and #99 are merged; nine episode boundaries and checkpoint resume logic are present.
- Main run 945 (`42389176721`) failed because Chromium read `TowerHardV10.path()` before wave 60 restored after reload. Draft PR #100 adds a readiness wait; CI run 946 (`42902455101`) passed all five jobs. The fix remains on PR #100.
- Local targeted baseline passed 84/84 checks. After PR #101 changes, Story runtime regression tests passed 79/79; changed JS files passed `node --check` and `git diff --check`.
- PR #101 initial boss-only CI run 947 passed all five jobs. Run 950 passed Chromium overhaul, browser smoke, and Firestore, but WebKit smoke failed the new mission 20 movement assertion. Log diagnosis: the scripted player moved into the lower lane before trying to cross the selected middle lane; this was a test route error, not evidence of a blocked middle gate. The test now waits until movement reaches the selected lane before crossing.
- PR #101 latest commit `eea19cb`; follow-up CI run 951 is pending. Do not count mission 20 route or trust-choice branch as browser-verified until that run completes.
- Browser binaries cannot run locally: Chromium cannot create its process-singleton socket in this sandbox. CI browser results are not a human visual review or a timed playtest.
- Inspected existing WebKit screenshots from run 947. High-wave enemy overview shows varied silhouettes but dense rows remain visually crowded at iPad size; normal-enemy readability still needs art/HUD work.
- Open legacy PRs #78, #63, #61, #55, #54, #50, #12, #10, and #4 are old-base or drafts; none was merged into this work.
- Vercel project `towerv1` is Git-linked to `1rid3mon/towerv1`, with production branch `main`; a merge can auto-publish. No production deploy or Vercel settings change was initiated.

## Work packages

| Package | Status | Evidence / changes |
|---|---|---|
| 0. Baseline and continuity | Complete | Verified main SHA, PR #97–99 merge state, Actions, and Vercel Git deployment context. |
| 1. Story gameplay and reliability | In progress | Draft PR #101 adds three physical routes in mission 20 (short/exposed, balanced, covered/long), a telegraphed final boss strike countered by Piko's existing shield, and mission 13 trust-choice continuity in mission 21 dialogue. Run 947 passed boss-only code; run 950 exposed a faulty WebKit route test step; runner fix plus trust continuity are in commit `eea19cb`, with run 951 pending. No human playtime measurement; no claim that episodes meet 8–12 minutes. |
| 2. LOST SIGNAL art | Not started | Preserve the main menu as visual reference. Existing V17 enemy/Piko/companion/boss systems remain; episode environment review and cohesion work are pending. Existing high-wave screenshot remains crowded. |
| 3. Endless HUD | Not started | No changes yet; retain economy and progression. |
| 4. Skill mini-game replacement | Not started | No changes yet; locate and review current gambling implementation before replacing integrations. |
| 5. New content | Not started | No changes yet; select only after core quality work. |
| 6. Final QA and optimization | In progress | PR #100 CI 946 passed. PR #101 run 947 passed for earlier code; run 950 has one failed WebKit smoke job from the incorrect scripted movement path; run 951 pending with the correction. No manual human playtest or local visual review. |

## Latest package details

- PR #100 branch: `overhaul/story-quality-pass-01`; draft PR #100. Changes make Story browser runners accept optional installed Chromium and wait for save restoration before checking the Endless path after reload. This is test reliability work, not a gameplay change. CI 946 passed.
- PR #101 branch: `story/finale-boss-defense`; draft PR https://github.com/1rid3mon/towerv1/pull/101; latest commit `eea19cb`.
- PR #101 changed files: `story-interior-missions16-20.js`, `story-interior-missions21-27.js`, `security-lab/story-interior-16-20-playthrough.cjs`, `security-lab/story-interior-21-27-playthrough.cjs`.
- PR #101 local verification: 79/79 runtime checks, syntax checks on all four changed files, and `git diff --check` passed. Browser scenario now explicitly drives movement into and across the selected middle corridor; test checks both previously saved mission 13 trust branches in mission 21.
- Separate checkpoint `story/silent-fleet-routes` at `006dfca` remains as a backup; route work is also in PR #101.

## Known gaps and next concrete steps

1. Check PR #101 run 951 once; inspect only failed logs if a job fails.
2. If run 951 passes, update this file with the result and inspect its final boss / route evidence artifacts.
3. Continue episode pacing and mechanics. No episodes have been timed with human players; browser scripts can position the player at stations for setup.
4. Then proceed in priority order: visual redesign, Endless HUD, skill mini-game replacement, selected new content, broad QA.
5. Keep each package on a feature branch and PR. Do not merge to `main` or deploy production without explicit batch-release approval because `main` auto-publishes.
