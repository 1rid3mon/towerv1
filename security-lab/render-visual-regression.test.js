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
