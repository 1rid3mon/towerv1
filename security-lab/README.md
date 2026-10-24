# Isolated Firestore Security Lab

This folder is a **test harness only**. File `firestore.rules.snapshot` preserves the rules shared by the project owner in chat on 2026-10-22. File `firestore.rules` is a **candidate policy** for isolated emulator tests, with a persistent per-user rate-limit record. Neither file proves what is currently deployed, and nothing here deploys to Firebase.

## Run

From this folder, with Node.js installed:

```sh
npm install
npm test
```

The script starts a local Firestore Emulator on port 8085 and runs Node's test runner. It uses a `demo-` project ID and does not need Firebase credentials.

## Visual polish (branch-only)

`render.js` now gives the common green creature subtle asymmetrical surface markings, a small mouth, feet, and highlighted pupils; the tank creature gets small armor seams and bolts. These remain lightweight procedural Canvas details—no external images, network assets, game-balance changes, or new dependencies. `render-visual-regression.test.js` guards the intended details. This is a first restrained art pass, not a replacement for a consistent hand-made sprite set.

## Save migration and cloud conflict coverage

The client now has a guarded one-time migration for an accepted unsigned local legacy save: it preserves the original JSON in `CoreTowerDefense_Save_v11_legacy_migration_backup` before writing the V2-signed local state. Already-signed V1 saves are left untouched. Regression tests cover this path, invalid-save non-overwrite, and V1 compatibility. This is a client-side recovery measure, not anti-cheat; localStorage remains user-controlled.

Silent cloud pulls now compare best-wave progress first, and use `lastSaveTime` as a tie-breaker when the best wave is equal. This allows a fresh device to restore a newer same-wave save (for example, purchases or inventory) while preserving a locally higher best wave. The new `cloud-save-regression.test.js` checks the decision policy and guards signature/shape validation before applying cloud data.

These are source/unit-level checks only. A disposable Firebase project is still required to validate real Auth persistence, cloud read/write behavior, cross-device sync, and how actual old unsigned cloud saves should be migrated. Do not accept unsigned cloud saves automatically just to make migration convenient.

## What the tests mean

The emulator tests cover ownership, unauthenticated writes, ordinary writes, and rate limiting. A separate static compatibility suite also checks that the client batches leaderboard and rate-limit writes atomically, that candidate rule expectations match the client payloads, and that account-deletion retention behavior stays explicit. They also verify that a rate-limit record cannot be created or updated by itself: it must be written atomically with a matching leaderboard row. The candidate-policy tests confirm that leaderboard-row deletion remains available for the existing account-deletion flow, while a separate rate-limit record survives deletion and blocks immediate recreation. They confirm the 20-second cooldown rejects rapid writes, while a legitimate high-wave jump is no longer permanently blocked by a fixed 15-wave delta. Firestore rules do not prove the score is legitimate; trusted server validation is required for that. The policy still does **not** prove that client-submitted scores are legitimate. A known-limitation test intentionally demonstrates that a brand-new leaderboard row can still be created with wave 5000, extreme damage, and an arbitrary skin ID. That test passes to document the gap, not as a security success.

Do not deploy these rules from this lab. This is a narrow candidate hardening change only: it preserves leaderboard deletion but prevents that deletion from resetting the rate timer. It does not stop a forged score on first creation and does not make client-submitted scores trustworthy. The UI change and rules must be deployed together; deploying only one side can interrupt leaderboard writes. Before any production rollout, verify the deployed rules and confirm the app does not rely on deleting leaderboard rows. Blindly denying client writes before a replacement exists could break the live leaderboard.

The next art pass adds irregular fracture lines and edge highlights to the regular frost creature, a carved glacier seam to the frost boss, and a pair of worn, asymmetrical plates plus a single dark seam to the leviathan. The intent is restrained material detail and silhouette readability—not extra glow, particles, or more animation. Regression coverage lives in `render-visual-regression.test.js`.

## 2026-10-24 security-fix candidate

The isolated fix branch removes the fixed 650-crystal delta rollback because boss, milestone, cargo, and other legitimate rewards can exceed it at higher waves. Currency validation now rolls back non-finite, negative, or unsafe-integer balances; this is corruption protection, not authoritative anti-cheat. Gold and crystal deltas are intentionally not treated as proof of cheating because reward values scale with progression and the browser is not a trusted environment.

Unsigned legacy cloud saves remain blocked during silent login. A manual recovery path requires explicit confirmation, saves both the raw cloud payload and current local state to UID-scoped local backups, validates the save shape, upgrades the recovered copy to a V2 checksum, and pushes it back through the normal cloud-save path. The checksum is still client-generated and therefore cannot prove that the old cloud payload was untampered.

Account deletion now reauthenticates password and Google providers before removing Firestore data, releases the username reservation owned by the current UID, and attempts best-effort restoration if a later deletion step fails. Firestore/Auth deletion is not a true cross-service transaction; for a production-grade guarantee, use a trusted server-side deletion endpoint with Admin SDK cleanup and a retryable deletion state. The client path must be tested against the actual deployed Firestore rules, especially the leaderboard rate-limit policy.


## Leaderboard progression recovery (2026-10-24)

A fixed 15-wave-per-write cap can permanently reject a legitimate score jump (for example, an existing highestWave of 291 and a current score of 344). Because the persistent limiter also stores the rejected target, retries do not recover automatically. The candidate rules now retain the 20-second write cooldown but remove the fixed wave-delta cap. This prevents legitimate progress from becoming stuck; it does not prove submitted scores are genuine. Production anti-cheat must validate progression through a trusted backend.
