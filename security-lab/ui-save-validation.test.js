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

test('manual save-code import handler stays removed', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.doesNotMatch(indexSource, /save-code-textarea|exportSaveCode|importSaveCode/);
  assert.doesNotMatch(uiSource, /function importSaveCode\s*\(|save-code-textarea/);
});

test('cloud save loading requires verification and explicit recovery for unsigned legacy data', () => {
  const pullStart = uiSource.indexOf('async function forceCloudPull(');
  const pullEnd = uiSource.indexOf('\\nfunction shouldApplyCloudSave(', pullStart);
  assert.ok(pullStart >= 0 && pullEnd > pullStart);
  const pull = uiSource.slice(pullStart, pullEnd);
  assert.match(pull, /typeof window\\._verifySaveSignature !== 'function'/);
  assert.match(pull, /else if \\(!window\\._verifySaveSignature\\(cloudGame\\)\\)/);
  assert.match(pull, /if \\(!cloudGame\\._sig\\)/);
  assert.match(pull, /window\\.confirm\\(/);
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

test('manual save-code export handler stays removed', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.doesNotMatch(indexSource, /save-code-textarea|exportSaveCode|importSaveCode/);
  assert.doesNotMatch(uiSource, /function exportSaveCode\s*\(|save-code-textarea/);
});

test('all cloud/local save paths validate shape before applying parsed state', () => {
  assert.match(uiSource, /if \(!isCompatibleSaveShape\(parsed\)\)/);
  assert.match(uiSource, /if \(cloudGame && !isCompatibleSaveShape\(cloudGame\)\)/);
  assert.match(uiSource, /function applyParsedGameData\(parsed\) \{\s*if \(!isCompatibleSaveShape\(parsed\)\) return false;/);
});

test('Firebase registration explains that a taken username cannot be reused', () => {
  assert.match(uiSource, /auth\/email-already-in-use/);
  assert.match(uiSource, /Bu kullanıcı adı alınmış! Lütfen başka bir kullanıcı adı seç veya Giriş Yap sekmesini kullan\./);
});

test('leaderboard discloses that scores are client-reported and not server-verified', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexSource, /Sıralama puanları şu an oyun istemcisinden bildirilir; henüz sunucu tarafından oynanışla doğrulanmaz\./);
});

test('critical-health HUD warning activates at 25% HP and clears above the threshold', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexSource, /id="ui-hp-critical"[^>]*>KRİTİK<\/span>/);
  assert.match(indexSource, /#hud-hp-card\.hud-critical/);
  assert.match(indexSource, /#ui-hp-bar\.hud-critical-bar/);
  assert.match(uiSource, /const isCriticalHp = tower\.hp > 0 && hpRatio <= 0\.25;/);
  assert.match(uiSource, /hpCard\.classList\.toggle\('hud-critical', isCriticalHp\)/);
  assert.match(uiSource, /hpBar\.classList\.toggle\('hud-critical-bar', isCriticalHp\)/);
  assert.match(uiSource, /hpCriticalBadge\.classList\.toggle\('hidden', !isCriticalHp\)/);
  assert.match(indexSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?#hud-hp-card\.hud-critical \{ animation: none; \}/);
});

test('boss wave HUD warning is visibly labelled and accessible', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexSource, /id="ui-boss-warning"[^>]*aria-label="Boss dalgası"/);
  assert.match(indexSource, /id="ui-boss-warning"[^>]*role="status"/);
  assert.match(indexSource, /fa-skull mr-0\.5" aria-hidden="true">/);
  assert.match(indexSource, />BOSS<\/span>/);
  assert.match(indexSource, /motion-safe:animate-pulse/);
  assert.match(uiSource, /bossWarn\.classList\.toggle\('hidden', game\.wave % 5 !== 0\)/);
});


test('real game defaults accept a legacy partial save and reject malformed nested upgrade values', () => {
  const dataSource = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
  const defaultStart = dataSource.indexOf('function getDefaultState() {');
  const defaultEnd = dataSource.indexOf('\n}\n\nlet game = getDefaultState();', defaultStart);
  assert.ok(defaultStart >= 0 && defaultEnd > defaultStart, 'real getDefaultState must exist');
  const defaultFunction = dataSource.slice(defaultStart, defaultEnd + 2);
  const validatorStart = uiSource.indexOf('function isCompatibleSaveShape(');
  const validatorEnd = uiSource.indexOf('\nfunction applyParsedGameData', validatorStart);
  assert.ok(validatorStart >= 0 && validatorEnd > validatorStart, 'save-shape validator must exist');

  const sandbox = {};
  vm.runInNewContext(
    defaultFunction + '\nglobalThis.getDefaultState = getDefaultState;\n' +
    uiSource.slice(validatorStart, validatorEnd) +
    '\nglobalThis.validateSaveShape = isCompatibleSaveShape;',
    sandbox
  );
  const validate = sandbox.validateSaveShape;

  // Old saves may not contain newer fields; known fields they do contain must keep valid types.
  const legacySave = {
    gold: 1800,
    crystals: 27,
    souls: 2,
    wave: 14,
    highestWave: 18,
    stats: { totalKills: 120, prestiges: 1 },
    upgrades: { damage: 12, attackSpeed: 4 },
    inventory: ['starter_item'],
    ownedSkins: ['default_cyber'],
    activeSkin: 'default_cyber'
  };
  assert.equal(validate(legacySave), true, 'partial legacy saves should remain compatible');

  const malformedSave = {
    ...legacySave,
    upgrades: { damage: { hacked: true } }
  };
  assert.equal(validate(malformedSave), false, 'known numeric upgrade fields must not accept objects');

  const oversizedSave = { ...legacySave, unknownPayload: 'x'.repeat(1001) };
  assert.equal(validate(oversizedSave), false, 'unknown fields must remain bounded');
});
