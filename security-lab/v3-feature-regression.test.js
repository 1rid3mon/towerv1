const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

test('lootbox reveal keeps chest shake, light rays, rarity glow, and card reveal effects', () => {
  assert.match(index, /\.chest-shaking\s*\{\s*animation:\s*chestShake/);
  assert.match(index, /\.rays-spinning\s*\{\s*animation:\s*spinRays/);
  assert.match(index, /\.loot-card-anim\s*\{\s*opacity:\s*0;\s*animation:\s*lootCardPop/);
  assert.match(index, /\.rarity-glow-legendary/);
  assert.match(ui, /function startLootboxModalAnimation/);
  assert.match(ui, /function openSkinBox/);
  assert.match(ui, /startLootboxModalAnimation\('skin'/);
});

test('leaderboard remains reachable and clearly distinguishes client-reported scores', () => {
  assert.match(index, /onclick="switchTab\('leaderboard'\)"/);
  assert.match(ui, /async function refreshLeaderboard/);
  assert.match(index + ui, /client-reported|client reported|istemci tarafından|sunucu tarafından doğrulan/i);
});

test('QTE feature is additive: missed timing still allows standard cargo rewards', () => {
  const engine = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
  assert.match(engine, /d\.qteActive && d\.qteTimer > 0/);
  assert.match(engine, /collectCargoDrone\(i, false\)/);
  assert.match(engine, /collectCargoDrone\(i, true\)/);
});

test('v1.3.0 exposes a responsive achievements and statistics profile without resetting save data', () => {
  assert.match(index, /v2\.0\.0/);
  assert.match(index, /id="achievements-modal"/);
  assert.match(index, /id="achievements-list"/);
  assert.match(index, /onclick="openAchievementsModal\(\)"/);
  assert.match(ui, /function getAchievementDefinitions\(\)/);
  assert.match(ui, /function renderAchievementsModal\(\)/);
  assert.match(ui, /function getCommanderBadge\(/);
  assert.match(ui, /profile-stat-wave/);
  assert.match(ui, /profile-stat-kills/);
  assert.match(ui, /profile-stat-bosses/);
  assert.match(ui, /profile-stat-time/);
});

test('achievement and badge progression derives from existing save stats and preserves legacy schema', () => {
  assert.match(ui, /game\?\.stats/);
  assert.match(ui, /stats\.totalKills/);
  assert.match(ui, /stats\.bossKills/);
  assert.match(ui, /stats\.playTimeSeconds/);
  assert.match(ui, /game\?\.ownedSkins/);
  assert.match(ui, /getCommanderBadge\(p\.highestWave, p\.prestiges\)/);
  assert.match(index, /eski kayıtların sıfırlanmaz/i);
});
