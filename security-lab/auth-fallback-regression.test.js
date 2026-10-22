const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

function extractFunction(source, declaration, nextDeclaration) {
  const start = source.indexOf(declaration);
  assert.notEqual(start, -1, `Missing function: ${declaration}`);
  const end = source.indexOf(nextDeclaration, start + declaration.length);
  assert.notEqual(end, -1, `Could not find end boundary after: ${declaration}`);
  return source.slice(start, end);
}

test('Firebase auth errors fail closed instead of silently creating a local-only account', () => {
  const auth = extractFunction(
    uiSource,
    'async function submitUsernameAuth()',
    'function openDeleteAccountConfirm()'
  );

  const firebaseBranch = auth.indexOf('if (isFirebaseReady && fbAuth)');
  const localFallback = auth.indexOf('let accounts = {}');
  assert.ok(firebaseBranch >= 0, 'Firebase authentication branch should exist');
  assert.ok(localFallback > firebaseBranch, 'local fallback should be a separate later path');

  const firebaseSection = auth.slice(firebaseBranch, localFallback);
  assert.match(firebaseSection, /catch\s*\(err\)\s*\{[\s\S]*?showAuthError\(/);
  assert.match(firebaseSection, /catch\s*\(err\)\s*\{[\s\S]*?return;/);
  assert.doesNotMatch(firebaseSection, /LOCAL_ACCOUNTS_KEY/, 'Firebase failures must not write local accounts');
});

test('the local-only fallback remains clearly separate from Firebase-backed auth', () => {
  const auth = extractFunction(
    uiSource,
    'async function submitUsernameAuth()',
    'function openDeleteAccountConfirm()'
  );
  const localFallback = auth.slice(auth.indexOf('let accounts = {}'));

  assert.match(localFallback, /localStorage\.getItem\(LOCAL_ACCOUNTS_KEY/);
  assert.match(localFallback, /isCloud:\s*false/);
  assert.match(localFallback, /localStorage\.setItem\(LOCAL_CURRENT_USER_KEY/);
});

test('Google sign-in never fabricates a local identity when Firebase is unavailable', () => {
  const start = uiSource.indexOf('async function loginWithGoogle()');
  const end = uiSource.indexOf('async function changeDisplayNickname()', start);
  assert.ok(start >= 0 && end > start, 'Google sign-in handler should exist');
  const googleHandler = uiSource.slice(start, end);

  assert.match(googleHandler, /return signInWithGoogle\(\);/);
  assert.doesNotMatch(googleHandler, /google_sim_|Komutan_\$\{|forceCloudPush|localStorage\.setItem/);
});

test('offline registration never stores a reversible Base64 password', () => {
  const auth = extractFunction(
    uiSource,
    'async function submitUsernameAuth()',
    'function openDeleteAccountConfirm()'
  );
  const guard = auth.indexOf("if (authFormMode === 'register')");
  const localStorageAccounts = auth.indexOf('let accounts = {}');
  assert.ok(guard >= 0 && localStorageAccounts > guard, 'offline registration guard must run before reading/writing local accounts');
  const guardSection = auth.slice(guard, localStorageAccounts);
  assert.match(guardSection, /showAuthError\(/);
  assert.match(guardSection, /return;/);
  assert.doesNotMatch(guardSection, /btoa\(|localStorage\.setItem/);
});
