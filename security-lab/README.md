# Isolated Firestore Security Lab

This folder is a **test harness only**. File `firestore.rules.snapshot` preserves the rules shared by the project owner in chat on 2026-10-22. File `firestore.rules` is a **candidate policy** for isolated emulator tests, with client leaderboard deletion denied. Neither file proves what is currently deployed, and nothing here deploys to Firebase.

## Run

From this folder, with Node.js installed:

```sh
npm install
npm test
```

The script starts a local Firestore Emulator on port 8085 and runs Node's test runner. It uses a `demo-` project ID and does not need Firebase credentials.

## What the tests mean

The tests cover ownership, unauthenticated writes, ordinary writes, and rate limiting. The candidate-policy tests confirm that client deletion is denied and the immediate delete/recreate bypass is blocked. They also confirm the existing update interval still rejects a rapid score jump. The policy still does **not** prove that client-submitted damage or skin ownership is legitimate; the snapshot showed that extreme damage and an arbitrary skin string pass its shape checks.

Do not deploy these rules from this lab. This is a narrow candidate hardening change only: it closes the delete/recreate rate-limit bypass but does not make client-submitted scores trustworthy. Before any production rollout, verify the deployed rules and confirm the app does not rely on deleting leaderboard rows. Blindly denying client writes before a replacement exists could break the live leaderboard.
