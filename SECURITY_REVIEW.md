# Security Review — Kule Savunma: Sonsuz Döngü
Date: 2026-10-22
Scope: current main client code and the Firestore Rules supplied by the project owner in chat.
This document is a review, not a claim that the Firebase project or production deployment was changed.

## Safety approach
- Keep main and the deployed Vercel build unchanged until a patch is tested.
- Do not change gameplay balance, progression, save formats, or Firebase settings as part of a security-only patch.
- Treat browser-side values as untrusted. Any user can inspect and modify JavaScript, local storage, requests, and client memory.

## Findings

### High — Client-side save signatures are forgeable
engine.js generates _sig in the browser using a hard-coded salt and a non-cryptographic FNV-style hash. The salt and algorithm ship to every player, so this signature can detect accidental corruption but cannot prove that currency, wave, prestige, or a save was earned legitimately.

**Safe direction:** retain the signature only as a corruption/tampering warning, not as a trust boundary. For competitive or valuable state, validate progression on a trusted server.

### High — Cloud save payload is opaque to Firestore Rules
ui.js stores the whole game as JSON text in users/{uid}.saveData. Rules can limit the string's size and verify ownership, but cannot meaningfully validate nested gold/crystal/soul balances while the payload remains a string.

**Safe direction:** do not attempt a risky client-only rewrite of the save format. Plan a versioned migration to server-validated progression or a trusted Cloud Function before making economy fields authoritative.

### High — Leaderboard scores originate from the client
pushScoreToLeaderboard() submits highestWave, wave, damage, prestiges, and activeSkin from browser state. The supplied rules bound some values and enforce a server timestamp / update interval, which is useful, but a player can still fabricate plausible values. Rate limits reduce spam; they do not prove a score is earned.

**Safe direction:** calculate/validate competitive results on a trusted backend. If a backend is not ready, label the board as client-reported and do not use it for prizes or valuable rewards.

### Medium — The client anti-cheat is bypassable and may reject legitimate bursts
The 400 ms shadow check and browser-side cheatFlags can deter casual edits, but client code can be changed or bypassed. The crystal jump threshold may also reject legitimate large reward bursts depending on upgrades and game state; changing this threshold without gameplay tests could break progression.

**Safe direction:** do not increase or tighten these thresholds blindly. Test legitimate high-wave sessions and move important validation server-side.

### Low — Local fallback passwords are only Base64-encoded
When Firebase is unavailable, the fallback account flow stores a Base64-encoded password in browser localStorage. Base64 is reversible encoding, not password hashing or encryption, so anyone with access to that browser profile can recover it.

**Safe direction:** do not store real/reused passwords in the local fallback. A future low-risk improvement is to make the fallback explicitly local-only and use a non-secret local profile identifier, or disable password-style local accounts when Firebase is unavailable. This should be tested against offline play before changing behavior.

### Medium — Firestore rules supplied in chat need targeted edge-case tests
The supplied rules enforce owner access, data shape/size limits, leaderboard numeric ranges, server timestamps, and an update interval. Review these cases in the Firebase Emulator before changing production rules:
- first leaderboard creation, deletion/recreation, and rapid re-creation; the candidate rule blocks deletion of an existing leaderboard row but still allows a fabricated score on first creation;
- whether updatedAt is always a Firestore timestamp in the leaderboard and a number in the user document;
- damage has a lower bound but no explicit upper bound;
- activeSkin is only checked for string/length, not membership in the player's owned skins;
- saveData is opaque text, so nested currency fields are not validated;
- whether the app needs users to delete their own account/save and what that means for leaderboard records.

Do not paste Firebase service-account credentials or private API keys into chat or the repository.

### Current isolated candidate-policy result
The review branch now has an emulator-tested candidate design that preserves client deletion of `leaderboard/{uid}` for account deletion, while requiring a batched write to a separate `leaderboardRateLimits/{uid}` document. Rules require the rate-limit record and leaderboard row to match within the same atomic write, preventing clients from changing the limiter independently. That rate-limit record cannot be deleted by the client, so deleting the public row does not reset the timer. Regression tests also intentionally demonstrate a remaining limitation: a client can still create a first leaderboard row with `highestWave: 5000`, an extreme damage value, and an arbitrary skin ID. This is documented as a known gap, not a passing security control. The candidate rules and corresponding `ui.js` batch-write change are not deployed. They must be reviewed and tested together; deploying only the rules would reject current leaderboard writes, while deploying only the client change would be rejected by current rules. Do not copy these rules into production without reviewing the live configuration and migration plan.

## Verification checklist before merging code
1. Preserve a known-good save and verify login/logout, save/pull, and cross-device sync.
2. Test new account creation, existing account login, a device with an older local save, and a cloud save with equal/lower highest wave.
3. Test legitimate cargo rewards, crystal drops, prestige/rebirth, and large but valid progression bursts.
4. Test leaderboard create/update/rate-limit paths in the Firebase Emulator.
5. Check browser console for uncaught errors and verify both desktop and mobile layouts.
6. Deploy to a preview URL first; merge only after manual playtesting.

## Recommended order
1. Establish repeatable baseline tests and backup the current production save.
2. Test and refine Firestore Rules in the Firebase Emulator; do not guess at rule changes in production.
3. Implement a trusted server-side validation path for competitive scores/economy, with explicit schema/versioning.
4. Only then adjust client submission logic to use that trusted path.

### High — The browser anti-cheat exposes its own trust-reset hooks
The current client assigns `window._syncShadow`, `window._generateSaveSignature`, `window._verifySaveSignature`, and `window._isSessionClean`. The signature is a browser-side FNV-style checksum over only gold, crystals, souls, wave, highestWave, and prestige count; upgrades, inventory, owned skins, companions, and other state are not covered. The client also calls `_syncShadow()` after selected reward paths, so an injected script can call the same public hook after editing balances. The hard-coded salt and client-side generator are visible to every player.

**Practical meaning:** these mechanisms can catch accidental corruption or unsophisticated edits, but they are not a security boundary against the friend's cheat program or any script running in the page. Hiding names or changing the checksum algorithm alone would not fix this.

**Safe direction:** treat local save signatures and shadow checks as diagnostics only. Do not grant competitive rewards or trusted rank based on them. Protect valuable state with server-authoritative transactions, or explicitly keep the game economy and leaderboard as client-reported / best-effort. Avoid a blind rewrite of the save format because it could invalidate existing saves.

### High — Authenticated users can submit an arbitrary cloud save blob
The client serializes the entire game state to a string and writes it to `users/{uid}.saveData`. The supplied/candidate rules validate string type and size, not the JSON contents. An authenticated user can submit a modified save string within the size limit; ownership rules do not establish that its gold, crystals, upgrades, or inventory were earned legitimately.

**Safe direction:** a rules-only patch cannot securely validate fields inside this string. A safe migration needs a versioned structured schema and explicit server-side authority for the fields that must not be forgeable. Until then, cloud sync is storage/sync, not proof of legitimate progress.

### Cheat-focused regression scenarios
These are intentionally adversarial checks to run against a disposable test account / local emulator, not a production account:
- Increase each economy field in the live browser state and see whether the client detects it; separately verify that this does not get described as server-side protection.
- Export a save code, modify only an upgrade/inventory/skin field while preserving the old checksum, and verify the current signature's coverage limitation.
- Submit a modified but size-valid `saveData` string to a test user's own document and verify that the current rules accept it; this documents the opaque-payload gap.
- Attempt a fabricated first leaderboard row and a large subsequent wave jump; first-row forgery remains a known gap, while the candidate rate-limit policy should constrain later updates.
- Confirm the client blocks leaderboard publishing after integrity flags, while treating this as a deterrent only—not as a way to prevent a modified client from calling Firestore directly.

Do not run destructive save/account tests against the production account. Use a disposable test user and keep a known-good save backup.
