const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const start = uiSource.indexOf('async function deleteMyAccount()');
const end = uiSource.indexOf('\nasync function logoutAccount()', start);
assert.ok(start >= 0 && end > start, 'account deletion handler must exist');
const handler = uiSource.slice(start, end);
const reauthStart = uiSource.indexOf('async function reauthenticateForAccountDeletion(');
const reauthEnd = uiSource.indexOf('\nasync function deleteMyAccount()', reauthStart);
assert.ok(reauthStart >= 0 && reauthEnd > reauthStart, 'reauthentication helper must exist');
const reauth = uiSource.slice(reauthStart, reauthEnd);

test('reauthentication occurs before any Firestore delete', () => {
  assert.ok(handler.indexOf('await reauthenticateForAccountDeletion(authUser)') >= 0);
  assert.ok(handler.indexOf('await reauthenticateForAccountDeletion(authUser)') <
    handler.indexOf("await boardRef.delete()"));
  assert.ok(handler.indexOf('await reauthenticateForAccountDeletion(authUser)') <
    handler.indexOf("await userRef.delete()"));
});

test('password and Google users have an explicit reauthentication path', () => {
  assert.match(reauth, /providers\.includes\('password'\)/);
  assert.match(reauth, /reauthenticateWithCredential/);
  assert.match(reauth, /providers\.includes\('google\.com'\)/);
  assert.match(reauth, /reauthenticateWithPopup/);
});

test('owned username reservation is read and released during account deletion', () => {
  assert.match(handler, /collection\('usernameRegistry'\)/);
  assert.match(handler, /releaseUsernameReservation\(uid, currentUser\.username\)/);
  assert.match(handler, /snapshots\[2\]\.data\(\)\.uid === uid/);
});

test('unexpected deletion failures attempt to restore previously removed records', () => {
  assert.match(handler, /previousUserDoc/);
  assert.match(handler, /previousBoardDoc/);
  assert.match(handler, /previousUsernameDoc/);
  assert.match(handler, /restoreErrors/);
  assert.match(handler, /auth\/requires-recent-login/);
});

test('success notification follows successful Auth deletion and reports username cleanup', () => {
  const authDelete = handler.indexOf('await authUser.delete()');
  const clearSession = handler.indexOf('currentUser = null;');
  const success = handler.indexOf('showToast(\'🗑️');
  assert.ok(authDelete >= 0 && clearSession > authDelete && success > clearSession);
  assert.match(handler, /kullanıcı adı rezervasyonu/);
});
