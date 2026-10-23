const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

test('username reservations use a Firestore transaction and normalized registry key', () => {
  const start = ui.indexOf('async function reserveUniqueUsername');
  const end = ui.indexOf('\nasync function releaseUsernameReservation', start);
  assert.ok(start >= 0 && end > start);
  const fn = ui.slice(start, end);
  assert.match(fn, /fbDb\.runTransaction/);
  assert.match(fn, /candidateSnap\.data\(\)\.uid !== uid/);
  assert.match(fn, /username: key/);
  assert.doesNotMatch(fn, /tx\.delete/);
});

test('releasing a username reservation is owner-only and keeps the newly claimed key', () => {
  const start = ui.indexOf('async function releaseUsernameReservation');
  const end = ui.indexOf('\nfunction switchAuthMode', start);
  assert.ok(start >= 0 && end > start);
  const fn = ui.slice(start, end);
  assert.match(fn, /if \(!key \|\| key === keepKey\) return/);
  assert.match(fn, /snap\.data\(\)\.uid === uid/);
  assert.match(fn, /tx\.delete\(ref\)/);
});

test('registration cleans up a reserved name if profile setup fails', () => {
  assert.match(ui, /reservedNameForCleanup = reservedName/);
  assert.match(ui, /Failed to release rolled-back reservation/);
  assert.match(ui, /await cred\.user\.delete\(\)/);
});

test('login fails closed when it cannot verify a unique name', () => {
  assert.match(ui, /await fbAuth\.signOut\(\)/);
  assert.match(ui, /güvenli şekilde oturum kapatıldı/);
});

test('Google and nickname renames release prior claims only after profile update succeeds', () => {
  assert.match(ui, /const previousGoogleName = googleUser\.displayName \|\| requestedName/);
  assert.match(ui, /await releaseUsernameReservation\(googleUser\.uid, previousGoogleName, username\)/);
  assert.match(ui, /await releaseUsernameReservation\(currentUser\.uid, currentUser\.username, reservedName\)/);
});

test('username normalization maps Turkish I and accented letters before key validation', () => {
  const start = ui.indexOf('function normalizeUsernameKey');
  const end = ui.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start);
  const fn = ui.slice(start, end);
  assert.match(fn, /'ı':'i'/);
  assert.match(fn, /'ş':'s'/);
  assert.ok(fn.includes(".replace(/[^a-z0-9_.-]/g, '');"));
});
