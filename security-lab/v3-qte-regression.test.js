const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const engine = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
const render = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');

test('cargo drone QTE state is initialized and requires a second tap within the timing window', () => {
  assert.match(engine, /qteAttempted:\s*false/);
  assert.match(engine, /qteActive:\s*false/);
  assert.match(engine, /qteTimer:\s*0/);
  assert.match(engine, /d\.qteTimer = 1\.25/);
  assert.match(engine, /d\.qteActive && d\.qteTimer > 0/);
  assert.match(engine, /d\.qteTimer = Math\.max\(0, d\.qteTimer - dt\)/);
});

test('missed QTE still lets the player collect the normal reward', () => {
  assert.match(engine, /Bonus süresi doldu\. Drona dokunarak normal ganimeti alabilirsin/);
  assert.match(engine, /collectCargoDrone\(i, false\)/);
  assert.match(engine, /function collectCargoDrone\(index, reflexBonus = false\)/);
});

test('successful QTE bonus is bounded to 1.5x rewards and 15 seconds of overdrive', () => {
  assert.match(engine, /reflexBonus \? 1\.5 : 1/);
  assert.match(engine, /tower\.overdriveTimer = reflexBonus \? 15\.0 : 10\.0/);
});

test('cargo drone renderer shows a countdown ring and clear mobile-readable prompt', () => {
  const start = render.indexOf('function drawCargoDrone');
  const end = render.indexOf('\nfunction renderGame', start);
  assert.ok(start >= 0 && end > start, 'cargo drone renderer must exist');
  const draw = render.slice(start, end);
  assert.match(draw, /TEKRAR DOKUN!/);
  assert.match(draw, /TOPLA/);
  assert.match(draw, /d\.qteTimer \/ 1\.25/);
  assert.match(draw, /c\.arc\(0, 0, d\.radius \+ 13/);
});
