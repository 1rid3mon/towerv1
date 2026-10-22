# Isolated Firestore Security Lab

This folder is a **test harness only**. Its `firestore.rules` file is a snapshot of the rules shared by the project owner in chat on 2026-10-22. It does not prove these are the currently deployed Firebase rules and it does not deploy anything.

## Run

From this folder, with Node.js installed:

```sh
npm install
npm test
```

The script starts a local Firestore Emulator on port 8085 and runs Node's test runner. It uses a `demo-` project ID and does not need Firebase credentials.

## What the tests mean

The tests cover ownership, unauthenticated writes, ordinary writes, and rate limiting. One deliberately named **KNOWN GAP** test confirms the current snapshot permits a leaderboard document to be deleted and recreated immediately, bypassing the update interval. It also demonstrates that extreme damage and an arbitrary skin string currently pass the shown rule shape checks. That test passes to document the behavior; it is not a security success.

Do not deploy these rules from this lab. Fixes to deletion/recreation and trusted leaderboard writes must be designed together with the app's write flow and, ideally, a trusted backend. Blindly denying client writes before a replacement exists could break the live leaderboard.
