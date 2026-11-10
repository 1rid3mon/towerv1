# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul)

## Current baseline

- `main` starts at `b5a94be` (`Story Mode 2.0: nine checkpointed episodes across 27 stages`). PR #97, #98, and #99 are merged; the nine episode boundaries and checkpoint resume logic are present.
- The most recent GitHub Actions run on `main` is run 945 (`42389176721`). Browser smoke, Firestore emulator tests, Chromium and WebKit story playthroughs, mobile layout checks, legacy progression checks, and the live-source guest check passed. The overall run failed only in `overhaul-browser (chromium)`: after a page reload, the test read `TowerHardV10.path()` before the loaded save had restored wave 60 (`null !== 'kinetic'`). WebKit passed the same step. A readiness wait is being added to address the Chromium test race; gameplay code is unchanged in this package.
- Local targeted baseline: 84/84 tests passed across Story runtime, mission 1–27 simulated completion, save/account isolation, stage 16 art, enemy families/sprites, Piko, and bosses. Browser binaries are unavailable to Playwright locally; system Chromium cannot start in this sandbox (restricted process singleton socket). Chromium/WebKit visual and interactive evidence therefore comes from the recorded GitHub Actions run, not this local session.
- Open PRs were inspected. PRs #78, #63, #61, #55, #54, #50, #12, #10, and #4 are based on older `main` commits or are drafts; none was merged into this work.
- Vercel project `towerv1` is Git-linked to `1rid3mon/towerv1`; its latest deployment is production and the repository's production branch is `main`. A merge to `main` should be treated as production-publishing because Git auto-deploy is active for the linked project. No production deploy or Vercel settings change was initiated.

## Work packages

| Package | Status | Evidence / changes |
|---|---|---|
| 0. Baseline and continuity | Complete | Verified `main` SHA, PR #97–99 merge state, current workflow jobs and failure log; established this file. |
| 1. Story gameplay and reliability | In progress | The main branch has 27-stage Chromium/WebKit playthrough workflows and real browser combat/station interactions, but they do not measure first-time human session duration or replace a guided manual playthrough. No claim that episodes meet the requested 8–12 minute target. Existing pacing notes describe targets, not measured play time. |
| 2. LOST SIGNAL art | Not started | Keep the current main menu as the immutable visual reference. The V17 enemy, Piko, companion, and boss assets/tests already exist; story interiors still need per-episode visual review and cohesive environment work. |
| 3. Endless HUD | Not started | No changes yet. Preserve Endless economy/progression. |
| 4. Skill mini-game replacement | Not started | No changes yet. Locate the current gambling-themed implementation before selecting a replacement; don't infer from file names. |
| 5. New content | Not started | No changes yet. Prefer a small, complete feature after core quality work. |
| 6. Final QA and optimization | In progress | Main CI run 945 has broad Chromium/WebKit coverage; one Chromium-only reload readiness race in the unrelated Endless evolution assertion is being corrected. No independent manual human playtest or local visual inspection yet. |

## Current package

- Changes: make the Story 21–27 and episode browser runners accept an optional installed Chromium executable, and wait for save restoration before checking the Endless evolution path after reload. These changes improve test portability and remove a race in the Endless test; they do not alter gameplay.
- Files: `security-lab/story-interior-21-27-playthrough.cjs`, `security-lab/story-episodes-browser.cjs`, `security-lab/overhaul-browser.cjs`, this file.
- Branch: `overhaul/story-quality-pass-01`.
- PR / commit: pending.
- Tests: pre-change targeted baseline 84/84 passed; local browser execution was blocked because system Chromium cannot start in this sandbox. The new reload wait is not yet rerun in CI.
- Known limitation: automated browser controls validate mission mechanics and transitions, but current scripts can directly move the player to stations; they are not substitutes for exploratory route testing or timing a real player's episode.

## Next concrete steps

1. Finish this test-race package and verify it in one CI run.
2. Inspect episode 1–9 implementations and their current browser playthrough coverage, then improve pacing and mechanics in small episode groups without changing the nine-episode save model.
3. Use the browser screenshots/artifacts from CI for visual review; keep the main menu untouched.
4. Continue in order: story, art, Endless HUD, mini-game, selected content, final QA. Update this file at each verified package.
