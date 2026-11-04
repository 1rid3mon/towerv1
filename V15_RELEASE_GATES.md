# TowerV1 V15 — staged integration and release gates

Base: PR #87 V14 + Piko 3.0 + Boss V15 at df402084. This branch is **not** a production release.

## Stage 0: Protect V14
- [ ] Latest V14 PR #87 CI: Node, Chromium, WebKit, Firestore emulator, browser smoke all green on final SHA.
- [ ] Reconcile against current main; verify no regressions in all 27 story missions, Endless, mobile touch, guest reload and existing local/cloud saves.
- [ ] Preview build READY and smoke-tested; production stays untouched.
- [ ] No main merge until final consolidated release is explicitly approved.

## Stage 1: Daily leaderboard
- [ ] Define authenticated player identity, daily UTC date, deterministic replay submission, server-side verifyReplay and bounded rate limiting.
- [ ] Firestore rules deny arbitrary client score writes; document data retention and abuse controls.
- [ ] Test invalid, replayed, incomplete, forged, over-limit, and cross-day submissions. **Local scores must not be advertised as global rankings.**
- [ ] Keep practice mode available offline without ranking.

## Stage 2: Piko 3.0
- [x] Local bounded memory, room-aware dialogue, quiet preferences, story choice references, corruption fallback.
- [ ] Test Piko integration in Chromium/WebKit with real save fixtures; avoid repeated idle chatter and story spoilers.
- [ ] Optional hologram roaming and battle cues; maintain reduced-motion and no-audio defaults.
- [ ] Cloud sync only after authentication and safe migration design.

## Stage 3: Bosses
- [x] Nonblocking phase 1/2/3 cinematic HUD and per-boss tactical telegraphs.
- [x] Existing temporary boss interference and periodic phase-three jammer.
- [ ] Gameplay balance checks, touch HUD occlusion, animation/reduced-motion QA.
- [ ] Boss victory/defeat feedback and distinct encounter mechanics, after testing.

## Stage 4: Mobile polish
- [ ] iPad landscape, phone portrait, Android WebView, Safari touch/pointer regression.
- [ ] Safe-area, HUD overlap, button hit targets, performance/low-motion mode and loading resilience.
- [ ] Save/reload across mode transitions and daily reset boundary.

## Final release — explicitly deferred
- [ ] All stage checks green on a frozen final SHA, manual review, backup/rollback plan.
- [ ] Merge integration once, then verify Vercel production SHA and live URL.
- [ ] Never promote preview merely because Vercel says READY.

## 2026-11-04 implementation increment
- Replay-validated candidate ranking module and deterministic negative-case unit tests added; **no public score submission endpoint exists**.
- Piko phase/boss alerts wired to the existing nonblocking boss HUD with quiet/balanced/chatty preferences; tests added.
- Mobile station touch target and safe-area CSS adjustments added; real-device verification still pending.
- All new work stays in stacked draft PR #88. CI and production deployment are not assumed successful.
