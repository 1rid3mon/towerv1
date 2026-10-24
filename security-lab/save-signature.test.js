const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAntiCheatHooks() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
  const start = source.indexOf('(function initAntiCheat() {');
  const marker = '\n})();';
  const close = source.indexOf(marker, start);
  assert.notEqual(start, -1, 'anti-cheat IIFE should exist in engine.js');
  assert.notEqual(close, -1, 'anti-cheat IIFE should close');
  const snippet = source.slice(start, close + marker.length);
  const window = {};
  vm.runInNewContext(snippet, {
    window,
    localStorage: { getItem: () => '1' },
    SIGNED_MARK_KEY: 'test-signed-marker',
    setInterval: () => 1
  });
  return window;
}

function legacySignature(gameObj) {
  const salt = 'Kule_v11_KrM_2026_#99!';
  const text = `${Math.floor(gameObj.gold)}|${Math.floor(gameObj.crystals)}|${Math.floor(gameObj.souls)}|${gameObj.wave}|${gameObj.highestWave}|${gameObj.stats?.prestiges || 0}|${salt}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

test('v2 save checksum detects edits to upgrades and inventory when old checksum is retained', () => {
  const hooks = loadAntiCheatHooks();
  const save = {
    gold: 100, crystals: 20, souls: 0, wave: 4, highestWave: 4,
    stats: { prestiges: 0 }, upgrades: { damage: 3 },
    inventory: ['starter_item'], ownedSkins: ['default_cyber'],
    _sigVersion: 2, lastSaveTime: 1000
  };
  save._sig = hooks._generateSaveSignature(save);
  assert.equal(hooks._verifySaveSignature(save), true);

  const tampered = JSON.parse(JSON.stringify(save));
  tampered.upgrades.damage = 999;
  assert.equal(hooks._verifySaveSignature(tampered), false);

  const inventoryTampered = JSON.parse(JSON.stringify(save));
  inventoryTampered.inventory.push('rare_item');
  assert.equal(hooks._verifySaveSignature(inventoryTampered), false);
});

test('v2 save checksum ignores volatile save time but covers the rest of the save', () => {
  const hooks = loadAntiCheatHooks();
  const save = {
    gold: 100, crystals: 20, souls: 0, wave: 4, highestWave: 4,
    stats: { prestiges: 0 }, upgrades: { damage: 3 },
    _sigVersion: 2, lastSaveTime: 1000
  };
  save._sig = hooks._generateSaveSignature(save);
  save.lastSaveTime = 2000;
  assert.equal(hooks._verifySaveSignature(save), true);
});

test('legacy v1 saves remain loadable for backward compatibility; old signature scope remains limited', () => {
  const hooks = loadAntiCheatHooks();
  const save = {
    gold: 100, crystals: 20, souls: 0, wave: 4, highestWave: 4,
    stats: { prestiges: 0 }, upgrades: { damage: 3 }, inventory: ['starter_item']
  };
  save._sig = legacySignature(save);
  assert.equal(hooks._verifySaveSignature(save), true);
  save.upgrades.damage = 999;
  assert.equal(hooks._verifySaveSignature(save), true, 'v1 did not cover upgrades; migration remains a known legacy limitation');
});


test('v2 checksum detects adversarial edits across economy, progression, cosmetics, and companions', () => {
  const hooks = loadAntiCheatHooks();
  const save = {
    gold: 100, crystals: 20, souls: 0, wave: 4, highestWave: 4,
    stats: { prestiges: 0, totalKills: 12 },
    upgrades: { damage: 3 },
    inventory: ['starter_item'],
    ownedSkins: ['default_cyber'],
    activeSkin: 'default_cyber',
    companions: { laserDrone: { unlocked: false, level: 0 } },
    _sigVersion: 2, lastSaveTime: 1000
  };
  save._sig = hooks._generateSaveSignature(save);
  assert.equal(hooks._verifySaveSignature(save), true);

  const attacks = [
    ['gold', draft => { draft.gold = 999999; }],
    ['crystals', draft => { draft.crystals = 999999; }],
    ['souls', draft => { draft.souls = 999999; }],
    ['wave', draft => { draft.wave = 5000; draft.highestWave = 5000; }],
    ['prestige count', draft => { draft.stats.prestiges = 999; }],
    ['skin ownership', draft => { draft.ownedSkins.push('premium_skin'); }],
    ['active skin', draft => { draft.activeSkin = 'premium_skin'; }],
    ['companion level', draft => { draft.companions.laserDrone = { unlocked: true, level: 5 }; }]
  ];

  for (const [label, mutate] of attacks) {
    const tampered = JSON.parse(JSON.stringify(save));
    mutate(tampered);
    assert.equal(hooks._verifySaveSignature(tampered), false, label + ' edit should invalidate the old V2 checksum');
  }
});

test('companion anti-cheat snapshot ignores legitimate runtime movement but detects star progression edits', () => {
  const hooks = loadAntiCheatHooks();
  const before = hooks._snapshotCompanionProgress({
    laserDrone: { unlocked: true, level: 3, angle: 0.2, x: 120, y: 80, cooldown: 0.4 },
    frostOrb: { unlocked: false, level: 0, angle: 1.4, x: 20, y: 30, cooldown: 0.1 }
  });
  const afterRuntimeTick = hooks._snapshotCompanionProgress({
    laserDrone: { unlocked: true, level: 3, angle: 2.9, x: 410, y: 250, cooldown: 0.01 },
    frostOrb: { unlocked: false, level: 0, angle: 0.1, x: 75, y: 55, cooldown: 0.8 }
  });
  assert.deepEqual(JSON.parse(JSON.stringify(afterRuntimeTick)), JSON.parse(JSON.stringify(before)),
    'angle, position, and cooldown updates must not look like cheating');

  const editedProgress = hooks._snapshotCompanionProgress({
    laserDrone: { unlocked: true, level: 4, angle: 2.9, x: 410, y: 250, cooldown: 0.01 },
    frostOrb: { unlocked: false, level: 0, angle: 0.1, x: 75, y: 55, cooldown: 0.8 }
  });
  assert.notDeepEqual(JSON.parse(JSON.stringify(editedProgress)), JSON.parse(JSON.stringify(before)),
    'a real star-level edit must still be detected');
});

test('economy anti-cheat does not use a fixed positive crystal delta threshold', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
  assert.doesNotMatch(source, /game\.crystals\s*-\s*shadow\.crystals\s*>\s*650/);
  assert.match(source, /Number\.MAX_SAFE_INTEGER/);
  assert.match(source, /validCurrencyBalance\(game\.gold\)/);
  assert.match(source, /validCurrencyBalance\(game\.crystals\)/);
});
