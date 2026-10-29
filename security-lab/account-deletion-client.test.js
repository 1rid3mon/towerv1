const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const reauthStart = uiSource.indexOf('async function reauthenticateForAccountDeletion(');
const reauthEnd = uiSource.indexOf('\nasync function deleteMyAccount()', reauthStart);
assert.ok(reauthStart >= 0 && reauthEnd > reauthStart, 'reauthentication helper must exist');
const reauth = uiSource.slice(reauthStart, reauthEnd);
const start = uiSource.indexOf('async function deleteMyAccount()');
const end = uiSource.indexOf('\nasync function logoutAccount()', start);
assert.ok(start >= 0 && end > start, 'account deletion handler must exist');
const handler = uiSource.slice(start, end);

test('reauthentication happens before any cloud record is deleted', () => {
  const reauthCall = handler.indexOf('await reauthenticateForAccountDeletion(authUser)');
  assert.ok(reauthCall >= 0);
  for (const deletion of ['await boardRef.delete()', 'await storyRef.delete()', 'await userRef.delete()', 'await authUser.delete()']) {
    assert.ok(handler.indexOf(deletion) > reauthCall, deletion + ' must happen after reauthentication');
  }
});

test('password and Google providers have an explicit reauthentication path', () => {
  assert.match(reauth, /providers\.includes\('password'\)/);
  assert.match(reauth, /reauthenticateWithCredential/);
  assert.match(reauth, /providers\.includes\('google\.com'\)/);
  assert.match(reauth, /reauthenticateWithPopup/);
});

test('account deletion refuses to proceed when Firebase Auth UID and game UID differ', () => {
  assert.match(handler, /if \(authUser\.uid !== uid\)/);
  assert.ok(handler.indexOf('if (authUser.uid !== uid)') < handler.indexOf('await reauthenticateForAccountDeletion(authUser)'));
});

test('account deletion cleans Story, Endless, leaderboard, owned username and incoming/outgoing friend requests', () => {
  assert.match(handler, /collection\('storyProgress'\)\.doc\(uid\)/);
  assert.match(handler, /collection\('users'\)\.doc\(uid\)/);
  assert.match(handler, /collection\('leaderboard'\)\.doc\(uid\)/);
  assert.match(handler, /releaseUsernameReservation\(uid, currentUser\.username\)/);
  assert.match(handler, /collection\('friendRequests'\)\.where\('fromUid', '==', uid\)/);
  assert.match(handler, /collection\('friendRequests'\)\.where\('toUid', '==', uid\)/);
  assert.match(handler, /const requestRefs = new Map\(\)/);
  assert.match(handler, /for \(let i = 0; i < refs\.length; i \+= 400\)/);
});

test('security rate-limit metadata is intentionally not deleted', () => {
  assert.doesNotMatch(handler, /collection\('leaderboardRateLimits'\)/);
  assert.match(handler, /Rate-limit\/security records[\s\S]*?intentionally survive deletion/);
});

test('deletion failure attempts best-effort restoration and does not clear the local session', () => {
  assert.match(handler, /previousUserDoc/);
  assert.match(handler, /previousBoardDoc/);
  assert.match(handler, /previousStoryDoc/);
  assert.match(handler, /previousUsernameDoc/);
  assert.match(handler, /restoreErrors/);
  const clearSession = handler.indexOf('currentUser = null;');
  const failureBlock = handler.indexOf('catch (e) {', handler.indexOf('await authUser.delete()'));
  assert.ok(failureBlock >= 0 && clearSession > failureBlock);
});

test('success notice follows Auth deletion and local cleanup', () => {
  const authDelete = handler.indexOf('await authUser.delete()');
  const clearSession = handler.indexOf('currentUser = null;');
  const success = handler.indexOf('showToast(\'🗑️');
  assert.ok(authDelete >= 0 && clearSession > authDelete && success > clearSession);
  assert.match(handler, /Hesap, oyun kaydı, hikâye ilerlemesi, kullanıcı adı ve arkadaş istekleri silindi/);
});
