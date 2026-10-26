# Story Chapter 02 — Missions 16–18 Production Plan

Status: implementation plan, not playable code. Keep missions 16–18 locked until the previous Story mission is complete.

## Mission 16 — Sahte Çıkış / The False Exit

Purpose: demonstrate the lower network's loop without padding the mission with identical waves.

Flow:
1. Opening dialogue: the crew reaches a marked exit and scans the route.
2. Defense stage A: short encounter, target 8 enemies; after the clear, the exit route resolves back to the same chamber.
3. Route scan action: player inspects two route markers; both lead to the same room, but one preserves a signal trace.
4. Defense stage B: target 10 enemies with a different mix/spawn cadence from stage A.
5. After the second clear, reveal that the loop is maintained below the station core. The blue echo gives a warning that contradicts its earlier message; Piko interprets the echo as afraid rather than hostile.
6. Complete and save only the Story progress flag.

Acceptance: no Endless rewards; phase-guarded actions; no direct canvas taps required; retry/exit works; completion overlay always appears; Turkish/English copy stays in sync.

## Mission 17 — Arşivdeki İsim / The Name in the Archive

Purpose: provide a quieter investigation after Mission 16 and give Piko agency.

Flow:
1. Short defense encounter to protect archive access.
2. Inspect three mandatory archive fragments in any order. An optional fourth fragment gives context but never blocks completion.
3. Offer a route choice: direct route (slightly harder next defense) or preservation route (optional memory log). Both converge and remain finishable without grinding.
4. Piko chooses its own call sign; do not reveal the full project designation reserved for Chapter 03.
5. Complete and save only the Story progress flag and validated route choice.

Acceptance: optional content never gates progression; choice survives save/reload; no permanent combat stat, currency, or inventory reward.

## Mission 18 — Kilit Seni Tanıyor / The Lock That Knows You

Purpose: close Chapter 02 with a mastery test and a clear Chapter 03 hook.

Flow:
1. Opening dialogue confirms that the archive lock recognizes the commander, not Piko.
2. Stage A: short defense; then interact with relay 1.
3. Stage B: distinct enemy pressure while the player interacts with relay 2.
4. Final stage: hold the archive approach; after the threat is cleared, interact with the lock.
5. Reveal that the commander authorized the system before the station existed in its recorded form. A distant purple signal answers Piko's cyan pulse, but Piko does not transform yet.
6. Mark Mission 18 and Chapter 02 complete; show a chapter-complete panel and a clear transition into Chapter 03's locked/preview state.

Acceptance: all phases have explicit guards; no softlock if an action is repeated; exit/retry restores the Endless snapshot; completion overlay cannot be skipped into an empty screen; Chapter 03 remains a preview/locked state until its missions are implemented.

## Shared implementation constraints

- Extend the existing Story controller and existing mission board patterns; do not create a second combat engine.
- Keep Story progress in `towerDefenseStoryProgressV1`; never write Story state to Endless currency, upgrades, equipment, companions, or leaderboard fields.
- Add mission 16–18 booleans and choice fields to the progress validator/defaults and Firestore rules/tests before relying on them.
- Keep all user-facing text bilingual.
- Run JS syntax checks, Story regression tests, and Firestore Emulator suite. Manual desktop, mobile portrait/landscape, and Android WebView playthrough remains a separate release gate.
