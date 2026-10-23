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
