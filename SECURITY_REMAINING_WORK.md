# Security Hardening — Remaining Work

Updated: 2026-10-22

This is the execution checklist for the isolated `security-hardening-review` branch. It is not a claim that production has been secured. `main`, live Firebase rules, and the Vercel production deployment must remain unchanged until the migration is reviewed and tested.

## Status key

- [x] Implemented on the review branch
- [ ] Not implemented / still needs verification

## Completed on the review branch

- [x] Added JavaScript syntax checks and Firestore Emulator regression tests.
- [x] Added a candidate rule design requiring atomic leaderboard + persistent rate-limit writes.
- [x] Added a client batch write to match that candidate rule design.
- [x] Added tests for limiter deletion/independent changes, missing or mismatched paired writes, rapid recreation, save payload size, and basic schema bounds.
- [x] Added full-save V2 checksum coverage for local/save-code tamper detection while retaining legacy V1 verification.
- [x] Made local save, save-code import, and cloud pull fail closed if verification is missing or fails; cloud pulls reject unsigned saves.
- [x] Added structural save validation for local, imported, and cloud saves; malformed known fields, oversized strings, and excessively deep/large unknown payloads are rejected before state application, with regression tests.
- [x] Added regression coverage for leaderboard username HTML escaping to reduce the risk of stored XSS from client-controlled profile names.
- [x] Password-based registration now displays a clear “username already taken” message when Firebase rejects a duplicate synthetic username email; credential errors use clearer login feedback.
- [x] Clarified that client-side checks are not a security guarantee against modified clients.
- [x] Documented the account-deletion vs. retained rate-limit metadata trade-off.
- [x] Added an Android WebView packaging/security plan; no Android wrapper or APK has been built yet.

## Must do before any production rollout

### P0 — Protect current player data

- [ ] Back up a known-good save for a disposable test account and confirm normal account login works.
- [ ] Test existing V1 saves/codes and V2 saves/codes, including a genuine old unsigned cloud save if any may exist. Current cloud-pull logic rejects unsigned cloud saves; decide whether a one-time, explicit migration is needed before release.
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
- [ ] Ensure the UI does not claim all backend data is deleted while rate-limit metadata remains.
- [ ] Test recent-login failures, partial failures, retries, and orphan cleanup. Do not simply allow clients to delete the limiter.

### P2 — Local fallback and client hardening

- [ ] Remove Base64-encoded passwords from localStorage by replacing password-style local fallback with a clearly local-only profile, or disable password-style fallback when Firebase is unavailable. Test offline play and account migration first.
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
