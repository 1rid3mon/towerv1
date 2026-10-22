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

## What the tests mean

The emulator tests cover ownership, unauthenticated writes, ordinary writes, and rate limiting. A separate static compatibility suite also checks that the client batches leaderboard and rate-limit writes atomically, that candidate rule expectations match the client payloads, and that account-deletion retention behavior stays explicit. They also verify that a rate-limit record cannot be created or updated by itself: it must be written atomically with a matching leaderboard row. The candidate-policy tests confirm that leaderboard-row deletion remains available for the existing account-deletion flow, while a separate rate-limit record survives deletion and blocks immediate recreation. They also confirm the existing update interval still rejects a rapid score jump. The policy still does **not** prove that client-submitted scores are legitimate. A known-limitation test intentionally demonstrates that a brand-new leaderboard row can still be created with wave 5000, extreme damage, and an arbitrary skin ID. That test passes to document the gap, not as a security success.

Do not deploy these rules from this lab. This is a narrow candidate hardening change only: it preserves leaderboard deletion but prevents that deletion from resetting the rate timer. It does not stop a forged score on first creation and does not make client-submitted scores trustworthy. The UI change and rules must be deployed together; deploying only one side can interrupt leaderboard writes. Before any production rollout, verify the deployed rules and confirm the app does not rely on deleting leaderboard rows. Blindly denying client writes before a replacement exists could break the live leaderboard.

The next art pass adds irregular fracture lines and edge highlights to the regular frost creature, a carved glacier seam to the frost boss, and a pair of worn, asymmetrical plates plus a single dark seam to the leviathan. The intent is restrained material detail and silhouette readability—not extra glow, particles, or more animation. Regression coverage lives in `render-visual-regression.test.js`.
