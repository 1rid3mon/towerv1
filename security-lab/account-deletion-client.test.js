const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const start = uiSource.indexOf('async function deleteMyAccount()');
const end = uiSource.indexOf('\nasync function logoutAccount()', start);
assert.ok(start >= 0 && end > start, 'account deletion handler must exist');
const handler = uiSource.slice(start, end);

test('account deletion reports Firestore cleanup failures instead of claiming success', () => {
  assert.match(handler, /catch\s*\(e\)\s*\{\s*showToast\(['"`][^\n]*(?:silme|silinemedi|tamamlanamadı)[^\n]*['"`]\);\s*return;/i);
});

test('account deletion reports unexpected Auth deletion failures instead of claiming success', () => {
  assert.match(handler, /catch\s*\(e\)\s*\{[\s\S]*?auth\/requires-recent-login[\s\S]*?showToast\(['"`][^\n]*['"`]\);\s*return;[\s\S]*?showToast\(['"`][^\n]*(?:silme|silinemedi|tamamlanamadı)[^\n]*['"`]\);\s*return;/i);
});

test('success notification remains after all deletion steps complete', () => {
  assert.match(handler, /showToast\(['"`][^\n]*(?:kalıcı olarak silindi|silindi)[^\n]*['"`]\);\s*\}/i);
});
