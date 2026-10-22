const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const renderSource = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');

test('common green creature has hand-drawn surface markings and facial detail', () => {
  const start = renderSource.indexOf("case 'green':");
  const end = renderSource.indexOf('\n    }\n}', start);
  assert.ok(start >= 0 && end > start, 'common creature drawing case must exist');
  const creature = renderSource.slice(start, end);
  assert.match(creature, /Hand-drawn surface markings/);
  assert.match(creature, /ellipse\(-r \* 0\.30, -r \* 0\.22/);
  assert.match(creature, /quadraticCurveTo\(r \* 0\.70, r \* 0\.12/);
  assert.match(creature, /rgba\(255,255,255,0\.9\)/);
});

test('tank creature has small armor construction details', () => {
  const start = renderSource.indexOf("case 'tank':");
  const end = renderSource.indexOf("\n        case 'frost':", start);
  assert.ok(start >= 0 && end > start, 'tank drawing case must exist');
  const tank = renderSource.slice(start, end);
  assert.match(tank, /Small bolts and an offset armor seam/);
  assert.match(tank, /arc\(-r \* 0\.45, -r \* 0\.45/);
  assert.match(tank, /arc\(r \* 0\.52, r \* 0\.45/);
  assert.match(tank, /strokeStyle = 'rgba\(15, 23, 42, 0\.8\)'/);
});

test('creature art remains procedural canvas drawing with no new asset/network dependency', () => {
  assert.match(renderSource, /function drawCustomEnemy\(c, e, tx, ty, nowTime\)/);
  assert.doesNotMatch(renderSource, /https?:\/\//);
  assert.doesNotMatch(renderSource, /new Image\(/);
});

test('frost art has uneven fracture and highlight strokes', () => {
 const start = renderSource.indexOf("case 'frost':");
 const end = renderSource.indexOf("case 'runner':", start);
 const art = renderSource.slice(start, end);
 assert.ok(start >= 0 && end > start);
 assert.match(art, /Natural fracture lines/);
 assert.match(art, /rgba\(8, 47, 73, 0\.72\)/);
 assert.match(art, /rgba\(255, 255, 255, 0\.78\)/);
});

test('frost boss has a distinct glacier seam', () => {
 const start = renderSource.indexOf("case 'frost_boss':");
 const end = renderSource.indexOf("case 'leviathan':", start);
 const art = renderSource.slice(start, end);
 assert.ok(start >= 0 && end > start);
 assert.match(art, /old-glacier feel/);
 assert.match(art, /#67e8f9/);
});

test('leviathan has asymmetrical worn plate details', () => {
 const start = renderSource.indexOf("case 'leviathan':");
 const end = renderSource.indexOf("case 'tank':", start);
 const art = renderSource.slice(start, end);
 assert.ok(start >= 0 && end > start);
 assert.match(art, /Two worn plates/);
 assert.match(art, /rgba\(30, 10, 55, 0\.85\)/);
});

test('all enemy families receive the same restrained hand-ink pass', () => {
  const start = renderSource.indexOf('function drawEnemyInkAccents');
  const end = renderSource.indexOf('function drawCustomEnemy', start);
  assert.ok(start >= 0 && end > start, 'shared ink helper must exist before the enemy renderer');
  const helper = renderSource.slice(start, end);
  for (const kind of ['green', 'frost', 'frost_boss', 'tank', 'tank_boss', 'leviathan', 'boss', 'runner', 'speed_boss', 'ranged', 'ranged_boss', 'teleporter']) {
    assert.ok(helper.includes("kind === '" + kind + "'"), 'shared material mapping should include ' + kind);
  }
  assert.match(renderSource, /drawEnemyInkAccents\(c, kind, r, faceAngle, isHit\);/);
  assert.match(helper, /if \(isHit \|\| r < 5\) return/);
});

test('shared enemy art pass stays lightweight and adds no asset or animation dependency', () => {
  const start = renderSource.indexOf('function drawEnemyInkAccents');
  const end = renderSource.indexOf('function drawCustomEnemy', start);
  const helper = renderSource.slice(start, end);
  assert.doesNotMatch(helper, /new Image\(|requestAnimationFrame|createRadialGradient|https?:\/\//);
  assert.match(helper, /Bosses get one extra old scar/);
  assert.match(helper, /c\.save\(\);/);
  assert.match(helper, /c\.restore\(\);/);
});

test('enemy identity is grounded in engine definitions: red fast runner and yellow teleporter', () => {
  const engineSource = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
  assert.match(engineSource, /type = 'runner'; subType = 'runner'; name = 'Gölge Koşucu'; radius = 10; speed = 72/);
  assert.match(engineSource, /type = 'teleporter'; subType = 'teleporter'; name = 'Sarı Psişik'; radius = 11; speed = 48/);
  assert.match(engineSource, /isTeleporter = true/);
  const start = renderSource.indexOf('function drawEnemyInkAccents');
  const end = renderSource.indexOf('function drawCustomEnemy', start);
  const helper = renderSource.slice(start, end);
  assert.match(helper, /kind === 'runner'[\s\S]*?rgba\(76, 5, 25, 0\.58\)/);
  assert.match(helper, /kind === 'teleporter'[\s\S]*?rgba\(254, 240, 138, 0\.60\)/);
});


test('purple boss has asymmetric crown etching drawn directly on canvas', () => {
  const start = renderSource.indexOf("case 'boss':");
  const end = renderSource.indexOf("case 'tank':", start);
  assert.ok(start >= 0 && end > start, 'boss drawing case must exist');
  const art = renderSource.slice(start, end);
  assert.match(art, /Offset crown etching/);
  assert.match(art, /rgba\(233, 213, 255, 0\.72\)/);
  assert.match(art, /r \* 0\.78/);
  assert.doesNotMatch(art, /new Image\(|https?:\/\//);
});

test('yellow teleporter has restrained broken phase marks without external textures', () => {
  const start = renderSource.indexOf("case 'teleporter':");
  const end = renderSource.indexOf("case 'ranged':", start);
  assert.ok(start >= 0 && end > start, 'teleporter drawing case must exist');
  const art = renderSource.slice(start, end);
  assert.match(art, /Broken, offset phase marks/);
  assert.match(art, /rgba\(120, 53, 15, 0\.78\)/);
  assert.match(art, /rgba\(255, 251, 235, 0\.82\)/);
  assert.doesNotMatch(art, /new Image\(|https?:\/\//);
});

test('red runner has original speed grooves and a light leading-edge accent', () => {
  const start = renderSource.indexOf("case 'runner':");
  const end = renderSource.indexOf("case 'teleporter':", start);
  assert.ok(start >= 0 && end > start, 'runner drawing case must exist');
  const art = renderSource.slice(start, end);
  assert.match(art, /Hand-cut speed grooves/);
  assert.match(art, /rgba\(136, 19, 55, 0\.82\)/);
  assert.match(art, /rgba\(255, 228, 230, 0\.78\)/);
  assert.match(art, /r \* 0\.68/);
});

test('ranged marksman has restrained sensor plates and a visible aiming reticle', () => {
  const start = renderSource.indexOf("case 'ranged':");
  const end = renderSource.indexOf("case 'green':", start);
  assert.ok(start >= 0 && end > start, 'ranged enemy drawing case must exist');
  const art = renderSource.slice(start, end);
  assert.match(art, /worn sensor plates/);
  assert.match(art, /rgba\(7, 89, 133, 0\.82\)/);
  assert.match(art, /rgba\(224, 242, 254, 0\.78\)/);
  assert.match(art, /r \* 0\.66/);
});


test('tank boss has original offset armor seams and rivets', () => {
  const start = renderSource.indexOf("case 'tank_boss':");
  const end = renderSource.indexOf("case 'ranged_boss':", start);
  assert.ok(start >= 0 && end > start, 'tank boss drawing case must exist');
  const art = renderSource.slice(start, end);
  assert.match(art, /Offset armor seams and rivets/);
  assert.match(art, /rgba\(69, 26, 3, 0\.88\)/);
  assert.match(art, /arc\(-r \* 0\.48, -r \* 0\.40/);
  assert.doesNotMatch(art, /new Image\(|https?:\/\//);
});
