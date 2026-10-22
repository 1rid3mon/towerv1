const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

function loadCloudDecision() {
  const start = uiSource.indexOf('function shouldApplyCloudSave(');
  const end = uiSource.indexOf('\nfunction getDefaultRivalsForLeaderboard()', start);
  assert.ok(start >= 0 && end > start, 'cloud conflict policy helper must exist');
  const sandbox = {};
  vm.runInNewContext(
    uiSource.slice(start, end) + '\nglobalThis.decide = shouldApplyCloudSave;',
    sandbox
  );
  return sandbox.decide;
}

test('silent cloud pull restores a newer save when the best wave is equal', () => {
  const decide = loadCloudDecision();
  assert.equal(decide(
    { wave: 8, highestWave: 12, lastSaveTime: 2000, gold: 900 },
    { wave: 8, highestWave: 12, lastSaveTime: 1000, gold: 20 },
    true
  ), true);
});

test('silent cloud pull prefers the save with higher best-wave progress', () => {
  const decide = loadCloudDecision();
  assert.equal(decide(
    { wave: 8, highestWave: 12, lastSaveTime: 500, gold: 900 },
    { wave: 8, highestWave: 15, lastSaveTime: 2000, gold: 20 },
    true
  ), false);
  assert.equal(decide(
    { wave: 8, highestWave: 15, lastSaveTime: 500, gold: 900 },
    { wave: 8, highestWave: 12, lastSaveTime: 2000, gold: 20 },
    true
  ), true);
});

test('interactive manual cloud pull retains its explicit restore behavior', () => {
  const decide = loadCloudDecision();
  assert.equal(decide(
    { wave: 2, highestWave: 3, lastSaveTime: 100 },
    { wave: 2, highestWave: 100, lastSaveTime: 999 },
    false
  ), true);
});

test('cloud pull verifies signature and shape before applying a remote save', () => {
  const pullStart = uiSource.indexOf('async function forceCloudPull(');
  const pullEnd = uiSource.indexOf('\nfunction getDefaultRivalsForLeaderboard()', pullStart);
  assert.ok(pullStart >= 0 && pullEnd > pullStart);
  const pull = uiSource.slice(pullStart, pullEnd);
  const signatureCheck = pull.indexOf('!cloudGame._sig || typeof window._verifySaveSignature');
  const shapeCheck = pull.indexOf('if (cloudGame && !isCompatibleSaveShape(cloudGame))');
  const apply = pull.indexOf('applyParsedGameData(cloudGame)');
  assert.ok(signatureCheck >= 0 && shapeCheck > signatureCheck && apply > shapeCheck,
    'remote data must pass signature and shape checks before state application');
});

test('cloud push signs V2 state and writes only under the authenticated current UID', () => {
  const start = uiSource.indexOf('async function forceCloudPush(');
  const end = uiSource.indexOf('\nasync function forceCloudPull(', start);
  assert.ok(start >= 0 && end > start);
  const push = uiSource.slice(start, end);
  assert.match(push, /game\._sigVersion = 2/);
  assert.match(push, /game\._sig = window\._generateSaveSignature\(game\)/);
  assert.match(push, /fbDb\.collection\('users'\)\.doc\(currentUser\.uid\)\.set\(/);
  assert.match(push, /saveData: JSON\.stringify\(game\)/);
});
