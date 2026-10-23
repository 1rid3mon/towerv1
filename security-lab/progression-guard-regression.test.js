const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const uiSource = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
const engineSource = fs.readFileSync(path.join(root, 'engine.js'), 'utf8');
const dataSource = fs.readFileSync(path.join(root, 'data.js'), 'utf8');

function extractFunction(source, declaration, nextDeclaration) {
  const start = source.indexOf(declaration);
  assert.notEqual(start, -1, `Missing function: ${declaration}`);
  const end = source.indexOf(nextDeclaration, start + declaration.length);
  assert.ok(end > start, `Could not find boundary after ${declaration}`);
  return source.slice(start, end);
}

function loadToggleEquipItem() {
  const body = extractFunction(uiSource, 'function toggleEquipItem(itemId)', 'function getRarityBadge');
  const sandbox = {
    game: {
      inventory: ['blade', 'orb'],
      equippedItems: ['blade', 'blade', 'not-a-real-item', 'not-owned']
    },
    ITEM_DATABASE: { blade: { id: 'blade' }, orb: { id: 'orb' } },
    window: { _syncShadow() {} },
    showToast() {},
    buildInventoryUI() {},
    buildUpgradesUI() {},
    updateHUD() {},
    saveGame() {}
  };
  vm.runInNewContext(body + '\nglobalThis.toggleEquipItem = toggleEquipItem;', sandbox);
  return sandbox;
}

test('equipped inventory is deduplicated, ownership-checked, and capped at three unique items', () => {
  const sandbox = loadToggleEquipItem();
  sandbox.toggleEquipItem('orb');

  assert.deepEqual(Array.from(sandbox.game.equippedItems), ['blade', 'orb']);
  assert.equal(new Set(sandbox.game.equippedItems).size, sandbox.game.equippedItems.length);
  assert.ok(sandbox.game.equippedItems.every(id => sandbox.game.inventory.includes(id)));
  assert.ok(sandbox.game.equippedItems.length <= 3);
});

test('a second equip action cannot add a duplicate copy of an already equipped item', () => {
  const sandbox = loadToggleEquipItem();
  sandbox.game.equippedItems = ['blade'];
  sandbox.toggleEquipItem('blade');

  assert.deepEqual(Array.from(sandbox.game.equippedItems), []);
});

test('unknown and unowned item IDs cannot be equipped', () => {
  const sandbox = loadToggleEquipItem();
  sandbox.game.equippedItems = [];
  sandbox.toggleEquipItem('not-a-real-item');
  sandbox.toggleEquipItem('not-owned');

  assert.deepEqual(Array.from(sandbox.game.equippedItems), []);
});

test('shadow anti-cheat restores unauthorized skill/upgrade mutations before persisting', () => {
  assert.match(engineSource, /const currentUpgrades = JSON\.stringify\(game\.upgrades \|\| \{\}\);/);
  assert.match(engineSource, /const trustedUpgrades = JSON\.stringify\(shadow\.upgrades \|\| \{\}\);/);
  assert.match(engineSource, /if \(currentUpgrades !== trustedUpgrades\)\s*\{[\s\S]*?game\.upgrades = JSON\.parse\(JSON\.stringify\(shadow\.upgrades \|\| \{\}\)\);[\s\S]*?mustPersistRollback = true;/);
  assert.match(engineSource, /if \(mustPersistRollback && typeof saveGame === 'function'\) saveGame\(true\);/);
});

test('shadow anti-cheat rejects duplicate, unknown, and unowned equipped IDs on its periodic check', () => {
  assert.match(engineSource, /const validEquipped = \[\.\.\.new Set\(Array\.isArray\(game\.equippedItems\) \? game\.equippedItems : \[\]\)\]/);
  assert.match(engineSource, /ITEM_DATABASE\[id\] &&[\s\S]*?game\.inventory\.includes\(id\)/);
  assert.match(engineSource, /JSON\.stringify\(validEquipped\) !== JSON\.stringify\(shadow\.equippedItems \|\| \[\]\)/);
  assert.match(engineSource, /Tekrarlı veya geçersiz ekipman engellendi/);
});

// Security boundary reminder: these tests cover accidental/direct state tampering in the
// shipped client code. A modified client can change the guard itself, so this is not
// evidence of server-authoritative anti-cheat.

test('mobile portrait/landscape layouts retain viewport-bounded, scrollable controls', () => {
  const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(indexSource, /@media \(max-width: 480px\) and \(orientation: portrait\)/);
  assert.match(indexSource, /@media \(max-width: 900px\) and \(orientation: landscape\) and \(max-height: 500px\)/);
  assert.match(indexSource, /#upgrade-drawer\s*\{[^}]*max-height:\s*calc\(100dvh\s*-\s*44px\)[^}]*overflow-y:\s*auto/s);
  assert.match(indexSource, /touch-action:\s*manipulation/);
  assert.match(indexSource, /#settings-modal > div[\s\S]*?max-width:\s*calc\(100vw\s*-\s*16px\)/);
});

test('low-health and boss-wave HUD affordances remain present and motion-safe', () => {
  const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(indexSource, /hud-critical-pulse/);
  assert.match(indexSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(indexSource, />KRİTİK<\/span>/);
  assert.match(indexSource, />BOSS<\/span>/);
});

test('duplicate equipped IDs never stack the same item stat bonus', () => {
  const start = dataSource.indexOf('function getItemStatBonus(type)');
  const end = dataSource.indexOf('function getEffectiveMultishot()', start);
  assert.ok(start >= 0 && end > start, 'item bonus helper should exist');
  const sandbox = {
    game: { equippedItems: ['epic_crimson_archer', 'epic_crimson_archer'] },
    ITEM_DATABASE: {
      epic_crimson_archer: { type: 'damage', val: 0.38 }
    }
  };
  vm.runInNewContext(
    dataSource.slice(start, end) + '\nglobalThis.getItemStatBonus = getItemStatBonus;',
    sandbox
  );
  assert.equal(sandbox.getItemStatBonus('damage'), 0.38);
});

test('duplicate equipped IDs never stack multishot either', () => {
  const start = dataSource.indexOf('function getEffectiveMultishot()');
  const end = dataSource.indexOf('function getBulkUpgradeInfo(', start);
  assert.ok(start >= 0 && end > start, 'multishot helper should exist');
  const sandbox = {
    game: {
      equippedItems: ['legendary_infinity_bow', 'legendary_infinity_bow'],
      upgrades: { multishot: 2 }
    },
    ITEM_DATABASE: {
      legendary_infinity_bow: { type: 'multishot_buff', val: 1 }
    }
  };
  vm.runInNewContext(
    dataSource.slice(start, end) + '\nglobalThis.getEffectiveMultishot = getEffectiveMultishot;',
    sandbox
  );
  assert.equal(sandbox.getEffectiveMultishot(), 4);
});
