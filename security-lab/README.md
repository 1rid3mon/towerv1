# Isolated Firestore Security Lab

This folder is a **test harness only**. File `firestore.rules.snapshot` preserves the rules shared by the project owner in chat on 2026-10-22. File `firestore.rules` is a **candidate policy** for isolated emulator tests, with a persistent per-user rate-limit record. Neither file proves what is currently deployed, and nothing here deploys to Firebase.

## Run

From this folder, with Node.js installed:

```sh
npm install
npm test
```

The script starts a local Firestore Emulator on port 8085 and runs Node's test runner. It uses a `demo-` project ID and does not need Firebase credentials.

## What the tests mean

The tests cover ownership, unauthenticated writes, ordinary writes, and rate limiting. They also verify that a rate-limit record cannot be created or updated by itself: it must be written atomically with a matching leaderboard row. The candidate-policy tests confirm that leaderboard-row deletion remains available for the existing account-deletion flow, while a separate rate-limit record survives deletion and blocks immediate recreation. They also confirm the existing update interval still rejects a rapid score jump. The policy still does **not** prove that client-submitted scores are legitimate. A known-limitation test intentionally demonstrates that a brand-new leaderboard row can still be created with wave 5000, extreme damage, and an arbitrary skin ID. That test passes to document the gap, not as a security success.

Do not deploy these rules from this lab. This is a narrow candidate hardening change only: it preserves leaderboard deletion but prevents that deletion from resetting the rate timer. It does not stop a forged score on first creation and does not make client-submitted scores trustworthy. The UI change and rules must be deployed together; deploying only one side can interrupt leaderboard writes. Before any production rollout, verify the deployed rules and confirm the app does not rely on deleting leaderboard rows. Blindly denying client writes before a replacement exists could break the live leaderboard.
