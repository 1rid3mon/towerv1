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

- Local verification: **259 tests passed, 0 failed**, using Node 24.22.1,
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
- Firebase Console access was subsequently available. Verified both Google and
  Email/Password providers are enabled, with the production domain authorized.
- Verified `(default)` is Standard edition, Firestore Native, in `europe-west3`.
  Collection-scope automatic ascending/descending/array indexes are enabled;
  there are no manual indexes or field exemptions. Existing app queries use
  single-field filters or ordering, so no additional composite index is needed.
- Backed up the actual October 28 production policy, then published the tested
  root `firestore.rules` through Console on November 3 at 22:24 Europe/Istanbul.
  Console confirmed success and listed the new version as current. The previous
  policy is retained in `security-lab/firestore.rules.production-20261103-before`.
- No production player documents, provider settings, indexes, or environment
  values were changed. Real Google OAuth and physical-device sync require a
  controlled player session; emulator success does not prove those workflows.

## Rule behavior and validation

The published update accepts the optional Story mission 22–27 flags and the
purple/tower companion forms while retaining compatibility with older clients.
It also allows a participant to read an absent friend-request pair, which the
web client's transaction needs before creating the first request. Existing
requests and collection queries remain restricted to their actual participants.
The pair format assumes the application's Firebase-generated UIDs contain no
underscores; future custom-auth UID formats need a separate schema review.

Save and leaderboard creates now require the application's declared fields and
reject extra fields. Updates restrict changed fields while preserving unknown
legacy fields unchanged, so ordinary merge saves do not erase old metadata.
Friend requests validate types, UID/name bounds, timestamps, and allowed states
on both creation and update. Private saves remain owner-only, while the existing
guest-readable leaderboard is preserved. No new public collection was added.

Adversarial emulator checks reject unauthenticated/private reads, cross-user
writes, role-field injection, missing required fields, oversized saves, invalid
states, unmatched paths/subcollections, unpaired score/rate-limit writes, and
outsider friend queries. They confirm ordinary legacy merge saves, first-request
transactions, participant queries, account deletion, and both old/new Story
payloads work. A known-limitation test still demonstrates that a validly shaped
first score can be forged; this policy does not establish server authority.

## Remaining real-device acceptance

Use controlled accounts on two physical devices to validate real Google OAuth,
save restoration, account switching, Story finale persistence, friends, and the
leaderboard. Follow `FIREBASE_MORNING_CHECKLIST.md`; do not delete existing player
records or test by overwriting a real player's progress. These live player
workflows were not performed during this setup.

No new secrets are needed for the browser app. Future CLI administration needs
local Firebase sign-in; never paste passwords, tokens, or service-account keys
in chat. Server-authoritative
economy/score validation remains a separate backend project, as described in
`SECURITY_BACKEND_DESIGN.md`; client-submitted scores remain forgeable.

References:
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/emulator-suite/connect_auth
- https://firebase.google.com/docs/emulator-suite/connect_firestore
- https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/TopLevel/getProjects
