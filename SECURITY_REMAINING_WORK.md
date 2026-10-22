# Security Hardening — Remaining Work

Updated: 2026-10-22

This is the execution checklist for the isolated `security-hardening-review` branch. It is not a claim that production has been secured. `main`, live Firebase rules, and the Vercel production deployment must remain unchanged until the migration is reviewed and tested.

## Status key

- [x] Implemented on the review branch
- [ ] Not implemented / still needs verification

## Completed on the review branch

- [x] Added JavaScript syntax checks and Firestore Emulator regression tests.
- [x] Added a candidate rule design requiring atomic leaderboard + persistent rate-limit writes.
- [x] Added regression coverage for client/candidate-rules compatibility: atomic leaderboard + rate-limit batch, matching ownership/timestamps, cloud-save field shape, and the intentional rate-limit retention on account deletion.
- [x] Added a client batch write to match that candidate rule design.
- [x] Added tests for limiter deletion/independent changes, missing or mismatched paired writes, rapid recreation, save payload size, and basic schema bounds.
- [x] Added full-save V2 checksum coverage for local/save-code tamper detection while retaining legacy V1 verification.
- [x] Expanded adversarial V2 checksum tests across gold, crystals, souls, wave progression, prestige, skin ownership/selection, and companion state; these tests prove stale checksums are rejected, not that a modified client cannot regenerate them.
- [x] Made local save, save-code import, and cloud pull fail closed if verification is missing or fails; cloud pulls reject unsigned saves.
- [x] Added structural save validation for local, imported, and cloud saves; malformed known fields, oversized strings, and excessively deep/large unknown payloads are rejected before state application, with regression tests.
- [x] Cloud pull now runs bounded shape validation immediately after parsing the Firebase JSON and before signature verification traverses the payload; regression coverage asserts shape-check → signature-check → state-apply ordering. Latest CI run #220 passed JavaScript syntax checks and Firestore Emulator tests.
- [x] Added regression coverage for leaderboard username HTML escaping to reduce the risk of stored XSS from client-controlled profile names.
- [x] Password-based registration now displays a clear “username already taken” message when Firebase rejects a duplicate synthetic username email; credential errors use clearer login feedback.
- [x] Removed the simulated Google-login fallback: if Firebase/Google Auth is unavailable, the game now reports that real sign-in is unavailable instead of creating a fake `google_sim_` identity. Added regression coverage; security CI run #238 passed.
- [x] Blocked creation of new local-only password accounts when Firebase is unavailable, preventing new reversible Base64 passwords from being stored. Existing local-only account login is temporarily preserved to avoid locking out legacy users; legacy password storage still needs a tested migration/removal plan.
- [x] Clarified that client-side checks are not a security guarantee against modified clients.
- [x] Added a visible leaderboard notice explaining that scores are client-reported and not yet server-verified, with a regression test.
- [x] Documented the account-deletion vs. retained rate-limit metadata trade-off.
- [x] Android work is explicitly paused until security, game content, audio, and monetization are ready; no Android wrapper or APK is part of this security branch.
- [x] First gameplay/UI feature drop: the tower health HUD shows a red pulsing critical state and a “KRİTİK” label at 25% HP or lower; the warning clears above the threshold and respects reduced-motion preferences. Added a regression test.
- [x] Second gameplay/UI feature drop: every fifth wave's skull warning now explicitly reads “BOSS”, has an accessible status label, remains hidden on non-boss waves, and uses motion-safe animation. Added regression coverage.
- [x] Added a separate real-Firebase integration test runbook; live-project tests remain blocked until a disposable Firebase test project is configured.

## Must do before any production rollout

### P0 — Protect current player data

- [ ] Back up a known-good save for a disposable test account and confirm normal account login works.
- [ ] Verify local migration-backup storage and recovery on actual browser storage; unit tests now simulate backup-write and primary-save-write failures, but cannot prove real device/browser quota behavior.
- [x] Added a guarded one-time migration for accepted unsigned **local** saves: preserve the exact original JSON in a migration-backup key before writing a V2-signed local save; signed V1 saves remain unchanged. Regression tests cover migration, V1 compatibility, rejection without overwrite, backup-write failure, and primary-save-write failure.
- [ ] Test existing V1 saves/codes and V2 saves/codes against real representative backups. Genuine old unsigned **cloud** saves remain blocked by cloud-pull validation; decide and test an explicit, trusted migration in the disposable Firebase project before release.
- [x] Added unit regression coverage for cloud-save signature/shape validation order and the silent-pull conflict policy: preserve a higher local best wave; when best wave ties, restore the newer timestamped cloud save. CI #211 passed these tests with the Firestore Emulator suite.
- [ ] Test sign-up, login, logout, cloud push/pull, equal-or-lower cloud wave, cross-device sync, and account deletion in a separate Firebase test project.
- [ ] Check the actual deployed Firestore Rules in Firebase Console. The repository snapshot is not proof of the live rules.
- [ ] Review candidate rules and candidate client code together. Never deploy only one side: candidate client writes paired documents; candidate rules require them.

### P1 — Enforce usernames consistently across sign-in methods

- [ ] Current username/password accounts rely on Firebase Auth email uniqueness for the normalized synthetic email; the new UI message makes duplicates understandable, but this is not a shared username registry.
- [ ] Google sign-in can still produce duplicate display names. Before enabling it as a normal account-creation path, implement a unique username claim/reservation flow and test concurrent claims, failed sign-ups, account cleanup, and existing-account migration.
- [ ] Decide and document username normalization rules (case-insensitive, Turkish character mapping, allowed characters) before changing identity keys; do not rename or lock out existing accounts accidentally.

### P1 — Prevent fake leaderboard scores

- [ ] Decide whether the leaderboard is casual/client-reported or competitive/trusted.
- [ ] Until trusted scoring exists, label scores as client-reported and do not attach prizes, valuable rewards, or account sanctions to them.
- [ ] For trusted ranks, build a server-authoritative score/progression path. Do not accept `highestWave`, `damage`, `prestiges`, `activeSkin`, or reward amounts from the client as proof.
- [ ] Add emulator/integration tests for the backend path, including forged first scores, replayed requests, excessive jumps, and unauthorized users.
- [ ] Do not treat a Cloud Function that merely copies client-submitted values as anti-cheat.

### P1 — Protect economy and cloud saves

- [ ] Design a versioned save schema and migration that preserves existing player progress.
- [ ] Move trusted balances/rewards to server-owned records and use validated, idempotent transactions; derive UID from verified auth, never from a client-supplied UID.
- [ ] Keep old save blobs readable during a tested migration window; do not blindly replace the current save format.
- [ ] Test legitimate high-wave rewards, crystal drops, upgrades, prestige, offline behavior, and interrupted/retried requests.

### P1 — Finish account deletion correctly

- [ ] Choose an explicit retention policy for `leaderboardRateLimits/{uid}`.
- [ ] Implement a trusted deletion workflow that authenticates the caller, derives UID server-side, deletes/anonymizes intended records, and handles retries.
- [x] Client UI reports Firestore/Auth deletion failures instead of silently claiming success, and the success notice warns that separate security records may remain.
- [ ] Test recent-login failures, partial failures, retries, and orphan cleanup in a disposable Firebase test project. Do not simply allow clients to delete the limiter.

**Current limitation:** this is honest client-side error reporting, not an atomic deletion workflow. The current sequence can delete game documents before Firebase Auth rejects deletion for a recent-login requirement. A trusted backend workflow is still needed to avoid partial deletion and clean up retained rate-limit records safely.

### P2 — Local fallback and client hardening

- [ ] Migrate or retire legacy Base64-encoded passwords already stored in localStorage. New offline registrations are blocked, but legacy local-only login remains temporarily for compatibility. Design a recovery path before removing it so existing local users are not locked out.
- [ ] Treat `_generateSaveSignature`, `_verifySaveSignature`, `_syncShadow`, and `_isSessionClean` as diagnostics only; a modified client can alter or call them.
- [ ] Test anti-cheat checks against legitimate reward bursts and long sessions before changing thresholds.
- [ ] Test desktop, mobile portrait/landscape, browser console, and cross-device account sync.

### P2 — Android/WebView release gates

- [ ] Build the Android wrapper on a separate branch/project; do not change the live Vercel app while prototyping.
- [ ] Audit external CDN dependencies in `index.html` (Tailwind, Google Fonts, Font Awesome, Firebase SDK). Decide which should be bundled and which intentionally require network access.
- [ ] Restrict WebView navigation to trusted app content and approved HTTPS destinations; do not expose a broad JavaScript-to-native bridge.
- [ ] Verify Firebase Auth persistence, Firestore operations, DOM storage, canvas resizing, audio, app pause/resume, and portrait/landscape behavior in the packaged build.
- [ ] Run the same save/leaderboard/economy abuse cases against a disposable Android test account; APK packaging is not an anti-cheat boundary.
- [ ] Keep signing keys and all privileged backend credentials out of the web assets and public repository.

## Release gate

Do not merge the draft PR or deploy Firebase rules until P0 checks are complete, candidate rules/client compatibility is confirmed in a test project, the old-save migration decision is documented, and a preview playtest succeeds. CI passing means the automated checks passed; it does not mean a modified browser client cannot cheat. Android release additionally requires the WebView gates above and a real-device smoke test.
