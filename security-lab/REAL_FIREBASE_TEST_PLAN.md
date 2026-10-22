# Real Firebase Integration Test Plan

Status: **Not run yet — waiting for a disposable Firebase test project.**

The passing GitHub Actions run uses the local Firestore Emulator with a `demo-` project ID. It does not connect to the live Firebase project and does not prove that the rules currently deployed in Firebase Console match the candidate rules in this repository.

## Safety rules

- Create a separate Firebase project specifically for testing. Do not use the production project or real player accounts.
- Do not deploy candidate rules to production from this checklist.
- Do not commit service-account keys, private credentials, or real player data.
- Configure a staging copy/preview of the game to use the test project's Firebase web configuration before running client integration checks.
- Take a disposable test account and record its test-only username. Delete only test data after results are recorded.

## Test sequence

### A. Firebase project setup
- [ ] Create/select a separate test project in Firebase Console.
- [ ] Enable Email/Password in Authentication.
- [ ] Create Firestore in the test project.
- [ ] Back up/export the test project's initial rules.
- [ ] Review `security-lab/firestore.rules` against the app's expected document paths and writes.
- [ ] Apply candidate rules to the test project only.
- [ ] Point a staging copy of the game at this test project; verify the project ID before signing in.

### B. Authentication and account lifecycle
- [ ] Register a fresh test account; verify the account is created once.
- [ ] Try registering the same username again; expect a clear duplicate-username message.
- [ ] Sign out and sign back in; verify the account persists.
- [ ] Sign in on a second browser/device with the same test account; verify expected authentication behavior.
- [ ] Test invalid credentials and network interruption; ensure no misleading success message is shown.

### C. Cloud save integration
- [ ] Make a small harmless progress change and wait for sync.
- [ ] Reload and verify the saved progress returns.
- [ ] Sign in on the second browser/device and verify the same cloud save loads.
- [ ] Test a malformed/unsigned save using a disposable test account; expect rejection without overwriting a valid save.
- [ ] Confirm local/offline play still works when the test project is unreachable, and that sync recovers when connectivity returns.

### D. Leaderboard and rules
- [ ] Submit a normal test score and verify the leaderboard row appears.
- [ ] Confirm the leaderboard row and rate-limit record are written atomically.
- [ ] Attempt an unauthenticated write; expect denial.
- [ ] Attempt to write a different user's row; expect denial.
- [ ] Attempt to create/update/delete the rate-limit record independently; expect denial.
- [ ] Attempt an immediate score update/recreation; expect the candidate rate-limit behavior.
- [ ] Delete the disposable account and check which user, leaderboard, and rate-limit documents remain; compare with the documented retention policy.
- [ ] Record the known limitation: a new client-submitted score can still be fabricated unless a trusted server validates gameplay/progression.

### E. Device and recovery smoke test
- [ ] Test mobile portrait and landscape.
- [ ] Test refresh/reopen during and after cloud sync.
- [ ] Test a temporary offline/online transition.
- [ ] Confirm the production Vercel app and production Firebase project were not changed.

## Results log

Record date, test project ID (not credentials), device/browser, each test as Pass/Fail/Blocked, and any relevant sanitized error message. Do not record passwords, tokens, or real player data.

**Gate:** Only after this runbook passes and the candidate rules/client behavior are reviewed should production migration be considered. Keep the PR in draft and do not merge/deploy without explicit approval.
