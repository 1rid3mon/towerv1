# TowerV1 Firebase setup

## Existing application and deployment

TowerV1 is a static site. `index.html` loads the Firebase compat web SDK and
`ui.js` initializes Auth and Firestore for **rid3mon-c311a**. The app already
implements Google and username/password sign-in, cloud saves, Story progress,
username reservations, friends, and the leaderboard. Username/password accounts
use the application's synthetic `@kulesavunma.local` email mapping; keep that
mapping stable for existing players.

The Firebase web configuration is public client configuration, not an Admin SDK
credential. Do not add service-account JSON, private keys, refresh tokens, or an
Admin SDK to this static site. No Firebase server secret or extra Vercel
environment variable is required for the current architecture. Vercel does not
substitute environment variables inside these unbundled JavaScript files.

## Safe local verification

Use Node 22 or newer and Java 21. From `security-lab`:

```sh
npm install --no-audit --no-fund
npm test
```

The test command starts Auth on `127.0.0.1:9099` and Firestore on
`127.0.0.1:8085`. It explicitly selects `demo-towerv1-security-lab`.
The Auth integration test uses a second demo namespace,
`demo-towerv1-auth-integration`, to avoid racing the rules suite's database
cleanup. A multiple-project warning for that namespace is expected. Both are
local demo projects, with no live resources and no Firebase login required.

The new integration test creates synthetic users, signs in on a second SDK
client, restores the first user's save, rejects cross-user reads and writes,
and rejects a signed-out read. The other regression tests exercise the candidate
Firestore policy and client compatibility. These tests do not prove which rules
or providers are deployed in production or test real Google OAuth.

`.firebaserc` defaults CLI operations to the demo project. The `production`
alias points to `rid3mon-c311a` for explicit operations after review. This CLI
default does **not** redirect the browser app: opening the game normally still
uses its existing live Firebase configuration. Do not use the ordinary game UI
to create test players in production.

JavaScript files use LF line endings through `.gitattributes`, including on
Windows, because several source-extraction regression tests use LF boundaries.

## Live checks performed on 2026-11-03

- Local verification: **255 tests passed, 0 failed**, using Node 24.22.1,
  Java 21.0.13, Firebase CLI 13.35.1, and the local Auth/Firestore emulators.
  JavaScript syntax and `git diff --check` also passed.
- GitHub default branch inspected at `55ba11e991a75e4e7f70b512da1517b3eb1a4b07`.
- The production `ui.js` at `https://towerv1-murex.vercel.app/ui.js` matched
  that checkout after normalizing Windows line endings.
- Firebase's public Identity Toolkit configuration responded successfully and
  lists `localhost`, `rid3mon-c311a.firebaseapp.com`,
  `rid3mon-c311a.web.app`, and `towerv1-murex.vercel.app` as authorized domains.
- The connected Vercel project is `towerv1`; its latest deployment was READY.
  Its environment inventory was checked without decrypting values. Existing
  unrelated configuration was preserved.
- Firebase CLI reported no authorized accounts, and Firebase Console opened a
  Google sign-in page. The Firebase plugin provides skills here, but no remote
  Firebase management tools. Live provider settings, database edition, deployed
  rules, indexes, and authenticated cross-device behavior remain unverified.

## Remaining owner/console steps

1. Sign in to Firebase Console with access to **rid3mon-c311a**, or authorize
   Firebase CLI locally with `npx -y firebase-tools@latest login`. Never paste
   passwords, authorization codes, CLI tokens, or service-account keys in chat.
2. In Authentication → Sign-in method, verify **Email/Password** and **Google**
   are enabled. If Google requires a support email, select the project owner's
   appropriate email in Console. The production domain is already authorized;
   do not add wildcard or every temporary preview domain.
3. Inspect the existing Firestore `(default)` database and its edition and
   location. Do not create a replacement database or reset collections. CLI:
   `npx -y firebase-tools@latest firestore:databases:list --project rid3mon-c311a`,
   then `firestore:databases:get '(default)' --project rid3mon-c311a` using the
   same CLI invocation.
4. Export/copy the currently deployed rules and compare them with root
   `firestore.rules`. The repository policy is a candidate, not proof of the
   deployed policy. Review compatibility before publishing. If confirmed,
   deploy only rules using
   `npx -y firebase-tools@latest deploy --only firestore:rules --project rid3mon-c311a`.
   No rules, providers, indexes, or production documents were changed by this work.
5. Validate Google sign-in and existing-account saves with controlled accounts
   on two devices. Follow `FIREBASE_MORNING_CHECKLIST.md` for Story, account
   switching, friends, and leaderboard coverage. Use a separate non-production
   project for destructive tests; do not delete real accounts or saves.

No new secrets are needed for the browser app. Completing live administration
requires the owner's Firebase account authorization. Server-authoritative
economy/score validation remains a separate backend project, as described in
`SECURITY_BACKEND_DESIGN.md`; client-submitted scores remain forgeable.

References:
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/emulator-suite/connect_auth
- https://firebase.google.com/docs/emulator-suite/connect_firestore
- https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/TopLevel/getProjects
