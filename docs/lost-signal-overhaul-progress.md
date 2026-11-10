# LOST SIGNAL overhaul progress

Last updated: 2026-11-11 (Europe/Istanbul)

## Current baseline

- `main` starts at `b5a94be` (`Story Mode 2.0: nine checkpointed episodes across 27 stages`). PR #97, #98, and #99 are merged; the nine episode boundaries and checkpoint resume logic are present.
- Main run 945 (`42389176721`) failed only because `overhaul-browser (chromium)` read `TowerHardV10.path()` before wave 60 restored after reload. Draft PR #100 adds a readiness wait; its full CI run 946 (`42902455101`) passed all five jobs, including Chromium and WebKit. The fix remains on the PR branch; run 945 on main remains a historical failure until a merge.
- Local targeted baseline: 84/84 tests passed across Story runtime, mission 1–27 simulated completion, save/account isolation, stage 16 art, enemy families/sprites, Piko, and bosses. Browser binaries are unavailable to Playwright locally; system Chromium cannot start in this sandbox (restricted process singleton socket). Chromium/WebKit visual and interactive evidence therefore comes from the recorded GitHub Actions run, not this local session.
- Open PRs were inspected. PRs #78, #63, #61, #55, #54, #50, #12, #10, and #4 are based on older `main` commits or are drafts; none was merged into this work.
- Vercel project `towerv1` is Git-linked to `1rid3mon/towerv1`; its latest deployment is production and the repository's production branch is `main`. A merge to `main` should be treated as production-publishing because Git auto-deploy is active for the linked project. No production deploy or Vercel settings change was initiated.

## Work packages

| Package | Status | Evidence / changes |
|---|---|---|
| 0. Baseline and continuity | Complete | Verified `main` SHA, PR #97–99 merge state, current workflow jobs and failure log; established this file. |
| 1. Story gameplay and reliability | In progress | Draft PR #101 adds a distinct final-wave boss tell and lets Piko's existing shield interrupt it; CI run 947 is pending. A separate `story/silent-fleet-routes` checkpoint (`006dfca`) adds three traversable paths and route-gated corridor access for mission 20; browser verification is pending. Existing 27-stage Chromium/WebKit runs cover completion and transitions but do not measure first-time human session duration. No claim that episodes meet the 8–12 minute target. |
| 2. LOST SIGNAL art | Not started | Keep the current main menu as the immutable visual reference. The V17 enemy, Piko, companion, and boss assets/tests already exist; story interiors still need per-episode visual review and cohesive environment work. |
| 3. Endless HUD | Not started | No changes yet. Preserve Endless economy/progression. |
| 4. Skill mini-game replacement | Not started | No changes yet. Locate the current gambling-themed implementation before selecting a replacement; don't infer from file names. |
| 5. New content | Not started | No changes yet. Prefer a small, complete feature after core quality work. |
| 6. Final QA and optimization | In progress | PR #100 CI run 946 passed all jobs. PR #101 run 947 is running. No independent manual human playtest or local visual inspection yet; browser execution is blocked in this sandbox. |

## Current package

- Changes: make the Story 21–27 and episode browser runners accept an optional installed Chromium executable, and wait for save restoration before checking the Endless evolution path after reload. These changes improve test portability and remove a race in the Endless test; they do not alter gameplay.
- Files: `security-lab/story-interior-21-27-playthrough.cjs`, `security-lab/story-episodes-browser.cjs`, `security-lab/overhaul-browser.cjs`, this file.
- Branch: `overhaul/story-quality-pass-01`.
- PR / commit: draft PR #100, commit `3937c51`.
- Tests: targeted baseline 84/84 passed; changed JS passed `node --check` and `git diff --check`; PR CI run 946 passed (Chromium, WebKit, browser smoke, Firestore emulator). Local browser execution was blocked because system Chromium cannot create its process-singleton socket.
- Known limitation: automated browser controls validate mission mechanics and transitions, but current scripts can directly move the player to stations; they are not substitutes for exploratory route testing or timing a real player's episode.

## Next concrete steps

1. Verify PR #101's finale encounter in Chromium and WebKit CI run 947; fix any real failure.
2. Open and browser-test the saved mission 20 route package; improve Story episode pacing without changing nine-episode save compatibility.
3. Review browser screenshots/artifacts; keep the main menu untouched.
4. Continue in order: story, art, Endless HUD, skill mini-game, selected content, final QA. Update this file after each verified package.
