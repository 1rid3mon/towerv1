const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const start = uiSource.indexOf('async function deleteMyAccount()');
const end = uiSource.indexOf('\nasync function logoutAccount()', start);
assert.ok(start >= 0 && end > start, 'account deletion handler must exist');
const handler = uiSource.slice(start, end);

test('Firestore cleanup failures stop the flow and do not show success', () => {
  const firestoreCatch = handler.indexOf("showToast('❌ Hesap verileri silinemedi.");
  const firestoreReturn = handler.indexOf('return;', firestoreCatch);
  const authDelete = handler.indexOf('await fbAuth.currentUser.delete()');
  const success = handler.indexOf("showToast('🗑️");
  assert.ok(firestoreCatch >= 0, 'Firestore failure must be shown to the player');
  assert.ok(firestoreReturn > firestoreCatch, 'Firestore failure must stop the flow');
  assert.ok(authDelete > firestoreReturn, 'Auth deletion must not continue after Firestore failure');
  assert.ok(success > authDelete, 'success notification must be later than the Auth deletion attempt');
});

test('unexpected Auth deletion failures stop the flow and do not clear the local session', () => {
  const authDelete = handler.indexOf('await fbAuth.currentUser.delete()');
  const catchStart = handler.indexOf("showToast('❌ Firebase hesabı silinemedi.");
  const failureReturn = handler.indexOf('return;', catchStart);
  const clearSession = handler.indexOf('currentUser = null;');
  assert.ok(authDelete >= 0);
  assert.ok(catchStart > authDelete, 'unexpected Auth errors must have a visible failure message');
  assert.ok(failureReturn > catchStart, 'unexpected Auth errors must stop the flow');
  assert.ok(clearSession > failureReturn, 'local session must not be cleared on the failure path');
});

test('recent-login requirement remains an explicit, actionable failure', () => {
  assert.match(handler, /auth\/requires-recent-login/);
  assert.match(handler, /önce çıkış yapıp tekrar giriş yap/);
});

test('success notice does not claim all backend data is permanently erased', () => {
  const success = handler.indexOf("showToast('🗑️");
  assert.ok(success >= 0, 'success notice must exist');
  const notice = handler.slice(success, handler.indexOf('\n', success));
  assert.match(notice, /Hesap ve oyun verileri silindi/);
  assert.match(notice, /güvenlik kayıtları ayrı tutulabilir/);
  assert.doesNotMatch(notice, /kalıcı olarak silindi/i);
});

test('all success-state cleanup happens after Firestore and Auth steps', () => {
  const firestoreDelete = handler.indexOf("await fbDb.collection('users').doc(uid).delete()");
  const authDelete = handler.indexOf('await fbAuth.currentUser.delete()');
  const clearSession = handler.indexOf('currentUser = null;');
  const success = handler.indexOf("showToast('🗑️");
  assert.ok(firestoreDelete >= 0 && authDelete > firestoreDelete);
  assert.ok(clearSession > authDelete);
  assert.ok(success > clearSession);
});
