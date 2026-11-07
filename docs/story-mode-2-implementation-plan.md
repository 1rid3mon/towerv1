# LOST SIGNAL — Story Mode 2.0 implementation contract

Status: planning baseline only. This document does not implement the changes.

## Goal
Convert 27 very short playable story missions into approximately 14–16 substantial episodes, retaining all narrative events and choices. No visual overhaul in this phase.

## Proposed episode mapping (15 episodes)
1. 01–02: Awakening, restore power, investigate patrol evidence.
2. 03–04: Antenna maze, evidence and consequential power routing.
3. 05–06: Corridor defense and power grid repair.
4. 07–08: Communications defense and contradiction investigation.
5. 09: Awakening climax, shield tutorial and quiet aftermath.
6. 10–11: Hidden elevator and underground relays.
7. 12–13: Archive timestamps, voices and trust decision.
8. 14–15: Siege, safety seals and Piko memory repair.
9. 16–17: False exit and identity reveal.
10. 18–19: Triple siege and telemetry deduction.
11. 20–21: Silent fleet and identity evidence.
12. 22–23: Violet boundary and Piko memory choice.
13. 24–25: Archive defense and consensual shield upgrade.
14. 26: Two shield-link battles with checkpoint.
15. 27: Three-wave finale, evacuation and archive recovery.

## Gameplay acceptance
- Preserve meaningful original interactions; episodes must not become two short tasks glued together.
- Target 8–12 minutes for ordinary episodes, 15–20 for major set pieces, then measure with human playtests. No artificial waiting/grind.
- Add exploration, contextual puzzles, varying combat objectives, checkpoints and retry at each major segment.
- Make decisions persist and produce visible consequences.
- Episode transitions should preserve scene/world continuity when possible.

## Compatibility and regressions
- Maintain a mapping from legacy mission indices 1–27 to episode/stage checkpoints; never silently reset completed progress.
- Preserve Story save keys, Endless mode state, economy, Firebase and achievements.
- Reproduce and fix post-completion freeze, double completion submission, iframe parent acknowledgement and next mission transition.
- Verify exit/reenter, refresh, retry, mission selection, iPad touch, Chromium and WebKit.
- Add tests for both old and migrated save states.
- Avoid deployment until code, automated tests and manual gameplay acceptance are complete.

## Delivery order
A. Audit current story runtime and reproduce transition bugs.
B. Implement compatibility mapping and first three episodes (legacy missions 1–6).
C. Test and tune episode pacing, checkpoint/retry and mobile controls.
D. Roll out remaining episodes in small verified batches.
E. Full 1–27 regression, manual playtest, then request approval before main merge and production deployment.

## Explicit non-goals
Enemy art, Piko redesign, Endless HUD, mini-games, visual Lost Signal overhaul. Those are later independent workstreams.
