const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

test('local save loading fails closed if the verifier is missing or rejects the save', () => {
  assert.match(
    uiSource,
    /if \(typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(parsed\)\)/
  );
});

test('save-code import requires a signature and an available passing verifier', () => {
  assert.match(
    uiSource,
    /if \(!parsed\._sig \|\| typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(parsed\)\)/
  );
});

test('cloud save loading fails closed if the verifier is missing or rejects the save', () => {
  assert.match(
    uiSource,
    /if \(!cloudGame\._sig \|\| typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(cloudGame\)\)/
  );
});

test('save-shape validator accepts compatible saves and rejects malformed known fields', () => {
  const start = uiSource.indexOf('function isCompatibleSaveShape(');
  const end = uiSource.indexOf('\nfunction applyParsedGameData', start);
  assert.ok(start >= 0 && end > start, 'save-shape validator must exist');
  const sandbox = {
    getDefaultState: () => ({
      gold: 25,
      settings: { showDamageText: true, activeTheme: 'cyber' },
      inventory: [],
      stats: { totalKills: 0 }
    })
  };
  vm.runInNewContext(
    uiSource.slice(start, end) + '\nglobalThis.validateSaveShape = isCompatibleSaveShape;',
    sandbox
  );
  const validate = sandbox.validateSaveShape;
  assert.equal(validate({ gold: 50, settings: { showDamageText: false }, inventory: [], stats: { totalKills: 3 } }), true);
  assert.equal(validate({ inventory: ['item_1', 'item_2'] }), true);
  assert.equal(validate({ gold: '999999', settings: { showDamageText: true } }), false);
  assert.equal(validate({ gold: 10, settings: 'not-an-object' }), false);
  assert.equal(validate({ gold: Number.NaN }), false);
  assert.equal(validate({ inventory: new Array(5001) }), false);
  assert.equal(validate({ inventory: [{ id: 'item_1' }] }), false);
  assert.equal(validate({ extraField: 'x'.repeat(1001) }), false);
  const deepPayload = {};
  let cursor = deepPayload;
  for (let i = 0; i < 14; i++) { cursor.child = {}; cursor = cursor.child; }
  assert.equal(validate({ extraField: deepPayload }), false);
  assert.equal(validate([]), false);
});

test('leaderboard usernames are HTML-escaped before insertion', () => {
  const start = uiSource.indexOf('function escapeHtml(');
  const end = uiSource.indexOf('\n}', start);
  assert.ok(start >= 0 && end > start, 'escapeHtml helper must exist');
  const sandbox = {};
  vm.runInNewContext(
    uiSource.slice(start, end + 2) + '\nglobalThis.escape = escapeHtml;',
    sandbox
  );
  assert.equal(
    sandbox.escape('<img src=x onerror=alert(1)> & "test"'),
    '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;test&quot;'
  );
  assert.ok(uiSource.includes('${escapeHtml(pName)}'), 'leaderboard template must escape the player name');
});

test('save-code export does not falsely claim client signatures prevent cheating', () => {
  assert.doesNotMatch(uiSource, /Güvenli kayıt kodu kopyalandı/);
  assert.match(uiSource, /imza hileye karşı güvenlik garantisi değildir/);
});

test('all cloud/local save paths validate shape before applying parsed state', () => {
  assert.match(uiSource, /if \(!isCompatibleSaveShape\(parsed\)\)/);
  assert.match(uiSource, /if \(cloudGame && !isCompatibleSaveShape\(cloudGame\)\)/);
  assert.match(uiSource, /function applyParsedGameData\(parsed\) \{\s*if \(!isCompatibleSaveShape\(parsed\)\) return false;/);
});
