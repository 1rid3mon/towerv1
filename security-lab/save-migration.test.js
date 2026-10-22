const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const start = uiSource.indexOf('function loadGame() {');
const end = uiSource.indexOf('\nfunction exportSaveCode()', start);
assert.ok(start >= 0 && end > start, 'actual loadGame function must exist');
const loadGameSource = uiSource.slice(start, end);

function harness(initialRaw, initialMarker = null, verify = () => true) {
  const store = new Map();
  if (initialRaw !== null) store.set('CoreTowerDefense_Save_v11', initialRaw);
  if (initialMarker !== null) store.set('CoreTowerDefense_signedOnce', initialMarker);
  const localStorage = {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value))
  };
  const sandbox = {
    SAVE_KEY: 'CoreTowerDefense_Save_v11',
    SIGNED_MARK_KEY: 'CoreTowerDefense_signedOnce',
    localStorage,
    window: {
      _verifySaveSignature: parsed => verify(parsed, localStorage),
      _generateSaveSignature: parsed => parsed._sigVersion === 2 ? 'v2-test-signature' : ''
    },
    isCompatibleSaveShape: parsed => !!parsed && typeof parsed === 'object' && !Array.isArray(parsed),
    applyParsedGameData: parsed => { sandbox.game = { ...parsed }; },
    game: {},
    console: { warn() {} }
  };
  vm.runInNewContext(loadGameSource, sandbox);
  sandbox.loadGame();
  return { store, sandbox };
}

test('unsigned legacy local save is backed up byte-for-byte before one-time V2 migration', () => {
  const legacyRaw = JSON.stringify({ gold: 125, crystals: 7, wave: 9, highestWave: 12 });
  const { store, sandbox } = harness(legacyRaw, null, (parsed, storage) => !parsed._sig && !storage.getItem('CoreTowerDefense_signedOnce'));

  assert.equal(store.get('CoreTowerDefense_Save_v11_legacy_migration_backup'), legacyRaw);
  const migrated = JSON.parse(store.get('CoreTowerDefense_Save_v11'));
  assert.equal(migrated._sigVersion, 2);
  assert.equal(migrated._sig, 'v2-test-signature');
  assert.equal(store.get('CoreTowerDefense_signedOnce'), '1');
  assert.equal(sandbox.game.gold, 125);
  assert.equal(sandbox.game.highestWave, 12);
});

test('already signed V1 save remains byte-for-byte unchanged by the local migration path', () => {
  const v1Raw = JSON.stringify({ gold: 125, crystals: 7, wave: 9, highestWave: 12, _sig: 'legacy-v1-signature' });
  const { store } = harness(v1Raw, null, parsed => parsed._sig === 'legacy-v1-signature');
  assert.equal(store.get('CoreTowerDefense_Save_v11'), v1Raw);
  assert.equal(store.has('CoreTowerDefense_Save_v11_legacy_migration_backup'), false);
  assert.equal(store.has('CoreTowerDefense_signedOnce'), false);
});

test('rejected local save is not migrated or overwritten', () => {
  const invalidRaw = JSON.stringify({ gold: 125, _sig: 'invalid' });
  const { store } = harness(invalidRaw, '1', () => false);
  assert.equal(store.get('CoreTowerDefense_Save_v11'), invalidRaw);
  assert.equal(store.get('CoreTowerDefense_Save_v11_rejected_backup'), invalidRaw);
  assert.equal(store.has('CoreTowerDefense_Save_v11_legacy_migration_backup'), false);
});
