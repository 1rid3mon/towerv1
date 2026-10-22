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
