const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const uiSource = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
const storySource = fs.readFileSync(path.join(root, 'story.js'), 'utf8');
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


test('manual save-code import/export UI and handlers are removed', () => {
  const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const uiSource = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
  assert.doesNotMatch(indexSource, /save-code-textarea|exportSaveCode|importSaveCode|Kayıt Kodu \(Yedekle \/ Cihaz Değiştir\)/);
  assert.doesNotMatch(uiSource, /function exportSaveCode\s*\(|function importSaveCode\s*\(|save-code-textarea/);
});

test('account/cloud-save code remains separate from manual save-code import/export', () => {
  const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const uiSource = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
  assert.match(indexSource, /Hesap|Giriş|Giriş Yap|Kayıt Ol/i);
  assert.match(uiSource, /Firebase|cloud|bulut/i);
});


test('leaderboard clearly labels scores as client-reported until server verification exists', () => {
  const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(indexSource, /puanları şu an oyun istemcisinden bildirilir/);
  assert.match(indexSource, /henüz sunucu tarafından oynanışla doğrulanmaz/);
});


test('Story Mode mission handler enforces the previous-mission prerequisite even when called directly', () => {
  const body = extractFunction(
    storySource,
    'function storyMissionPrerequisiteMet(missionNumber, progress)',
    'function startStoryMission'
  );
  const sandbox = {};
  vm.runInNewContext(
    body + '\nglobalThis.storyMissionPrerequisiteMet = storyMissionPrerequisiteMet;',
    sandbox
  );

  const prerequisiteByMission = {
    2: 'mission1Complete',
    3: 'mission2Complete',
    4: 'mission3Complete',
    5: 'mission4Complete',
    6: 'mission5Complete',
    7: 'mission6Complete',
    8: 'mission7Complete',
    9: 'mission8Complete',
    10: 'mission9Complete',
    11: 'mission10Complete',
    12: 'mission11Complete',
    13: 'mission12Complete',
    14: 'mission13Complete',
    15: 'mission14Complete'
  };

  assert.equal(sandbox.storyMissionPrerequisiteMet(1, {}), true);
  for (const [missionText, requiredFlag] of Object.entries(prerequisiteByMission)) {
    const mission = Number(missionText);
    assert.equal(sandbox.storyMissionPrerequisiteMet(mission, {}), false, `mission ${mission} must remain locked`);
    assert.equal(
      sandbox.storyMissionPrerequisiteMet(mission, { [requiredFlag]: true }),
      true,
      `mission ${mission} should unlock after ${requiredFlag}`
    );
    assert.equal(
      sandbox.storyMissionPrerequisiteMet(mission, { [requiredFlag]: false }),
      false,
      `mission ${mission} must not unlock from a false completion flag`
    );
  }
  assert.match(storySource, /if \(!storyMissionPrerequisiteMet\(missionNumber, progress\)\)/);
});


test('routine HUD refresh is throttled while explicit event updates remain available', () => {
  assert.match(engineSource, /let hudUpdateAccum = 0;/);
  assert.match(engineSource, /hudUpdateAccum \+= dt;/);
  assert.match(engineSource, /if \(hudUpdateAccum >= 0\.1\)[\s\S]{0,100}updateHUD\(\);/);
  assert.match(uiSource, /function updateHUD\(\)/);
});


test('unsupported Story Mode phases cannot fall through and falsely complete mission 2', () => {
  const body = extractFunction(
    storySource,
    'function finishStoryBattleEncounter()',
    'function scanStorySignal()'
  );
  const guard = body.indexOf('if (![1, 2].includes(session.mission)) return;');
  const genericCompletion = body.indexOf('session.completed = true; isPaused = true; enemies = []; projectiles = [];');
  assert.ok(guard >= 0 && genericCompletion > guard,
    'only mission 1/2 may use the generic completion branch');
  assert.match(body, /if \(session\.mission === 1\)[\s\S]*?else \{[\s\S]*?mission2Complete: true/);
});

test('mission 13, 14 and 15 each have exactly one initial objective label branch', () => {
  const start = storySource.indexOf('function startStoryMission(');
  const end = storySource.indexOf('function finishStoryBattleEncounter()', start);
  const body = storySource.slice(start, end);
  assert.equal((body.match(/else if \(missionNumber === 13\) status\.textContent/g) || []).length, 1);
  assert.equal((body.match(/else if \(missionNumber === 14\) status\.textContent/g) || []).length, 1);
  assert.equal((body.match(/else if \(missionNumber === 15\) status\.textContent/g) || []).length, 1);
  assert.match(body, /mission15-repair-action/);
  assert.match(storySource, /function repairStoryMission15System\(\)/);
});


test('HTML element IDs are unique so friend-system handlers update the intended UI', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/\\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const seen = new Set();
  const duplicates = [];
  for (const id of ids) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  assert.deepEqual(duplicates, [], 'duplicate IDs can route getElementById updates to stale UI');
});


test('Piko is rendered as an original full-body SVG companion, not an emoji placeholder', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const start = html.indexOf('<svg id="game-mascot-face"');
  const end = html.indexOf('</svg>', start);
  assert.ok(start >= 0 && end > start, 'Piko SVG should exist');
  const svg = html.slice(start, end);
  assert.match(svg, /viewBox="0 0 96 96"/);
  assert.match(svg, /piko-body/);
  assert.match(svg, /piko-core/);
  assert.match(svg, /piko-eye/);
  assert.match(svg, /piko-aura/);
  assert.match(svg, /astral mekanik uzay yoldaşı/);
  assert.match(html, /width: 76px; height: 76px/);
  assert.match(html, /width: 64px; height: 64px/);
});


test('story mode bypasses the Endless anti-cheat shadow while preserving it for exit', () => {
  const antiCheatStart = engineSource.indexOf('// 🛡️ ANTI-CHEAT: GÖLGE KASA VE BELLEK KORUMASI');
  assert.notEqual(antiCheatStart, -1);
  const intervalStart = engineSource.indexOf('setInterval(() => {', antiCheatStart);
  const storyGuard = engineSource.indexOf("document.body?.dataset?.gameMode === 'story' || window.__storyBattle?.active", intervalStart);
  const shadowInit = engineSource.indexOf('if (!shadow) { syncShadow(); return; }', intervalStart);
  assert.ok(storyGuard > intervalStart && storyGuard < shadowInit, 'story guard must run before shadow initialization or rollback checks');
});

test('story mode hard-isolates multishot, economy, and companion multipliers', () => {
  const sandbox = {
    document: { body: { dataset: { gameMode: 'story' } } },
    game: {
      upgrades: { multishot: 0, goldBonus: 0, crystalChance: 0 },
      equippedItems: ['legendary_bow', 'gold_relic'],
      prestigeUpgrades: { permGold: 99, companionBoost: 99 },
      lootboxBonuses: { extraGoldPct: 999 },
      wave: 100, holdWave: false
    },
    ITEM_DATABASE: {
      legendary_bow: { type: 'multishot_buff', val: 5 },
      gold_relic: { type: 'gold', val: 5 }
    }
  };
  const multishot = extractFunction(dataSource, 'function getEffectiveMultishot()', 'function getBulkUpgradeInfo');
  const gold = extractFunction(dataSource, 'function getGoldMultiplier()', 'function getWaveBonusPreview');
  const companion = extractFunction(dataSource, 'function getCompanionBoost()', 'function calculatePendingSouls');
  vm.runInNewContext(multishot + '\n' + gold + '\n' + companion + '\nglobalThis.result = [getEffectiveMultishot(), getGoldMultiplier(), getCompanionBoost()];', sandbox);
  assert.deepEqual(Array.from(sandbox.result), [1, 1, 1]);
});


test('completed Story Mode session is cleaned before the Endless unlock check, while unfinished missions remain active', () => {
  const start = storySource.indexOf('function startStoryMission(');
  const end = storySource.indexOf('function finishStoryBattleEncounter()', start);
  const body = storySource.slice(start, end);
  const cleanup = body.indexOf('exitStoryBattle(false);');
  const unlockGate = body.indexOf('if (!updateStoryUnlockUI())');
  assert.ok(cleanup >= 0 && unlockGate > cleanup, 'completed story replay must restore Endless state before checking the Endless wave requirement');
  assert.match(body, /if \(\!window\.__storyBattle\.completed\) return;/);
});


test('optimized target selection preserves nearest-first order, range edge, and target cap', () => {
  const helper = extractFunction(engineSource, 'function getNearestEnemiesInRange(', 'function spawnCargoDrone()');
  const sandbox = {};
  vm.runInNewContext(helper + '\nglobalThis.select = getNearestEnemiesInRange;', sandbox);
  const near = { id: 'near', x: 3, y: 4, radius: 1 };
  const middle = { id: 'middle', x: 20, y: 0, radius: 2 };
  const edgeByRadius = { id: 'edge', x: 31, y: 0, radius: 2 };
  const outside = { id: 'outside', x: 40, y: 0, radius: 1 };
  const selected = sandbox.select([outside, edgeByRadius, middle, near], 0, 0, 30, 2);
  assert.deepEqual(Array.from(selected, item => item.enemy.id), ['near', 'middle']);
  assert.deepEqual(Array.from(sandbox.select([edgeByRadius, middle, near], 0, 0, 30, 3), item => item.enemy.id), ['near', 'middle', 'edge']);
  assert.deepEqual(Array.from(sandbox.select([near], 0, 0, 30, 0)), []);
});
