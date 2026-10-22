# Leaderboard Security Migration Plan

## Status and safety boundary

This document is a proposal only. It does not change deployed Firestore Rules, Firebase configuration, gameplay code, or Vercel production.

The emulator tests use a snapshot of rules supplied in chat. They are not proof that the same rules are currently deployed.

## What the current rules can and cannot establish

The current client writes leaderboard fields such as `highestWave`, `wave`, `damage`, `prestiges`, and `activeSkin`. Firestore Rules can validate shape, bounds, ownership, and write timing, but they cannot prove that those values came from a legitimate game session.

Known gaps in the supplied snapshot:
- A player can delete their own leaderboard document and recreate it immediately; the rate limit is skipped when `resource == null`.
- `damage` has a lower bound but no meaningful upper bound.
- `activeSkin` is checked as a string, not against skins actually owned by the player.
- The user save's `saveData` is an opaque JSON string, so rules cannot validate nested currency values inside it.
- A client-side signature with a hard-coded secret is not a trusted server signature. Users can inspect or modify browser code.

## Recommended migration: staged, backward-compatible

### Stage 0 — Keep the current game stable (current stage)
- Keep this work on the review branch.
- Do not deploy the test snapshot as production rules.
- Keep emulator tests green and record known gaps as expected findings.
- Do not merge until the owner has reviewed the plan and checked the deployed rules.

### Stage 1 — Add a server-owned leaderboard write path in a preview environment
- Choose Firebase Cloud Functions or another authenticated server endpoint.
- Verify Firebase ID tokens on the server and derive the UID from the verified token, never from a client-supplied UID.
- Apply rate limits on the server using persistent state; do not rely on a client timer or a deletable leaderboard document as the rate-limit record.
- Make the server the only writer to the canonical leaderboard collection after migration. Client writes must be disabled only after the server path is deployed and tested.
- Keep the existing client-facing leaderboard read shape stable initially so the game UI and friends' accounts continue to work.

Important: a callable function that simply accepts `highestWave`, `damage`, or currency values from the browser and writes them with admin privileges does not fix cheating. It only moves the trust boundary. The server must validate a defensible progression model or use server-authoritative game/session evidence. Client telemetry alone can also be forged.

### Stage 2 — Define what counts as a valid score
Before implementation, document:
- Which fields affect ranking and how they are calculated.
- Which values are display-only.
- Whether scores can decrease, and how legitimate resets/prestiges work.
- A plausible progression/rate model based on actual game mechanics.
- How existing users and old leaderboard rows are migrated.
- What happens when validation rejects a score, so players do not lose local progress.

Avoid arbitrary wave caps or jump limits until tested against legitimate long sessions, offline play, prestige, and save recovery.

### Stage 3 — Close the delete/recreate and field-validation gaps
After Stage 1 is live in preview and tested:
- If keeping client-side account deletion, preserve leaderboard-row deletion but move rate-limit state to a separate per-user document that clients cannot delete; require leaderboard writes and rate-state updates in one atomic batch. Alternatively, move deletion and rate limiting behind a trusted backend.
- Deny client create/update of canonical leaderboard records once server ownership is active.
- Store rate-limit state separately from any client-deletable document, or enforce it entirely in a trusted server transaction. The review branch has a test-only candidate for the separate-document/atomic-batch approach.
- Validate allowed fields and types; validate skin ownership server-side if skins affect competitive integrity.
- Add emulator tests for delete/recreate, fake damage, invalid skin, forged UID, rapid repeated requests, and legitimate updates.

Rules changes must be coordinated with the deployed client. Denying writes before a replacement path exists can silently break leaderboard updates.

### Stage 4 — Preview and rollback checklist
- Test with two existing accounts and one new account.
- Verify login, cloud-save pull/push, leaderboard refresh, wave progression, prestige, and recovery after refresh/device change.
- Confirm unauthorized cross-account writes fail.
- Confirm the client cannot create or alter canonical leaderboard records directly.
- Keep a known-good rules version and a documented rollback path.
- Promote only after results are reviewed.

## Decision needed before implementation

The owner should confirm whether the leaderboard is meant to be:
1. A casual, best-effort friends leaderboard (rules and abuse friction may be sufficient), or
2. A competitive leaderboard where scores must be defensible against modified clients.

For option 2, server-authoritative score validation is required; a server that merely stores browser-submitted values is not enough.
