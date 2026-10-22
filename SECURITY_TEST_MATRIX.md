# Security Regression Test Matrix

This matrix is intended for the repository owner to run before merging any security-related code. No production Firebase settings are changed by this document.

## A. Account and save compatibility

| Case | Setup | Expected result |
|---|---|---|
| Existing account login | Sign in with a previously working Firebase account | Authentication succeeds; no duplicate account is created |
| New account | Register a unique username | Account is created once and display name is preserved |
| Cloud save exists | Sign in on a clean browser/device | Cloud save is loaded without resetting currency, upgrades, inventory, or cosmetics |
| Equal wave, newer progression | Cloud and local highestWave are equal, but one save has newer upgrades/items | Conflict policy is explicit; no silent loss of legitimate progress |
| Local save is ahead | Local highestWave exceeds cloud highestWave | No automatic overwrite or destructive rollback without a clear recovery path |
| Malformed save JSON | Cloud saveData is invalid JSON | Game remains playable with a clear error; no uncaught exception or silent overwrite |
| Large save payload | saveData exceeds the configured limit | Write is rejected cleanly and existing save remains intact |

## B. Firestore Rules cases

Run these in the Firebase Emulator with authenticated test users; do not experiment on production data.

| Case | Expected result |
|---|---|
| User A reads/writes User A document | Allowed only when schema and limits are valid |
| User A reads/writes User B document | Denied |
| Unauthenticated user writes user or leaderboard documents | Denied |
| Invalid/oversized saveData or extra fields | Denied |
| Negative or nonnumeric wave/currency fields where validated | Denied |
| Leaderboard timestamp supplied by client instead of serverTimestamp | Denied |
| Rapid leaderboard update | Denied within the configured interval |
| Leaderboard row written without its matching rate-limit record | Denied |
| Rate-limit record created/updated separately or with a mismatched highestWave | Denied |
| Client attempts to delete persistent rate-limit record | Denied |
| Leaderboard first create, delete, then recreate | Candidate keeps deletion available for account removal; separate non-deletable rate-limit state blocks immediate recreation. Initial creation can still contain fabricated values and remains a known gap |
| Extremely high damage, prestige, or unowned activeSkin | Denied if these fields are intended to be trusted; otherwise explicitly documented as client-reported |

## C. Legitimate gameplay / anti-cheat false positives

- Earn crystals normally with low rewards and with the largest legitimate reward burst available in the game.
- Trigger prestige/rebirth and verify soul balance and save signature remain consistent.
- Load a cloud save with a higher wave and verify the anti-cheat shadow is synchronized before the next check.
- Play through several wave transitions and a boss wave; verify no legitimate wave jump is reverted.
- Confirm that three false-positive flags cannot silently block cloud saving for a legitimate session.

## D. Abuse-resistance tests

- Modify localStorage values and confirm the app does not treat a client-generated signature as proof of legitimacy.
- Attempt to submit fabricated leaderboard fields directly from a test account.
- Attempt to update another user's document.
- Attempt to spam writes and test create/delete/recreate behavior.
- Verify that failure of the Firebase leaderboard query does not make fake local NPC entries appear to be real server-ranked players without a clear label.

## E. Release gate

Do not merge a security patch until account login, cloud pull/push, new-account registration, legitimate progression, and mobile/desktop play have been tested. Deploy to a preview environment first. Keep a backup of a known-good save and retain a simple rollback path.

## Important limitation

Client-only tests can reveal bugs but cannot make client-supplied scores trustworthy. Competitive rankings and valuable economy state require server-side validation and Firestore Rules that prevent clients from writing authoritative fields directly.