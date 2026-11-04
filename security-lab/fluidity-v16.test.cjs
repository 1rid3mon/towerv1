'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'fluidity-v16.js'), 'utf8'), { window });
const api = window.TowerFluidityV16;
assert.ok(api && Object.isFrozen(api));

const frames120 = api.createFramePacer();
let count = 0;
for (let i = 0; i < 120; i++) {
    if (frames120.shouldRender(i * (1000 / 120))) count++;
}
assert.ok(count >= 58 && count <= 62, '120Hz display should spend roughly 60 draws per second');
const frames90 = api.createFramePacer();
count = 0;
for (let i = 0; i < 90; i++) {
    if (frames90.shouldRender(i * (1000 / 90))) count++;
}
assert.ok(count >= 57 && count <= 62, '90Hz should not collapse to 45fps');
const paused = api.createFramePacer();
assert.equal(paused.shouldRender(0, { paused: true }), true);
assert.equal(paused.shouldRender(16, { paused: true }), false);
assert.equal(paused.shouldRender(43, { paused: true }), true);
assert.equal(paused.shouldRender(100, { hidden: true }), false);
assert.equal(paused.shouldRender(400, {}), true, 'resume after hidden tab should draw immediately');
assert.equal(paused.shouldRender(NaN), false);
assert.equal(paused.shouldRender(0), true, 'clock resets must not freeze rendering');

const auto = api.createFramePacer();
for (let i = 0; i < 28; i++) auto.observeRenderCost(22);
assert.equal(auto.state().targetFps, 30, 'sustained heavy frames lower graphics work only');
for (let i = 0; i < 90; i++) auto.observeRenderCost(8);
assert.equal(auto.state().targetFps, 60, 'graphics auto-recovers when drawing gets cheap');
auto.observeRenderCost(Infinity);
auto.observeRenderCost(-4);
assert.equal(auto.state().targetFps, 60);

const enemies = [{ x: 150, y: 60, hp: 55 }];
const projectiles = [{ x: 130, y: 70, history: [{ x: 120, y: 60 }] }];
const particles = [{ x: 140, y: 50 }];
const texts = [{ x: 100, y: 40 }];
const rings = [{ x: 120, y: 65 }];
const cargo = [{ x: 100, y: 55, qteTimer: 0.8 }];
const beams = [{ x1: 100, y1: 50, x2: 180, y2: 70 }];
const groups = { enemies, projectiles, particles, floatingTexts: texts, rings, cargoDrones: cargo, lightningBeams: beams };
assert.equal(api.shiftViewport(300, 150, 400, 250, groups), true);
assert.deepEqual([enemies[0].x, enemies[0].y, enemies[0].hp], [200, 110, 55]);
assert.deepEqual([projectiles[0].x, projectiles[0].history[0].x, projectiles[0].history[0].y], [180, 170, 110]);
assert.deepEqual([particles[0].y, texts[0].x, rings[0].x, cargo[0].y], [100, 150, 170, 105]);
assert.deepEqual([beams[0].x1, beams[0].x2, beams[0].y1, beams[0].y2], [150, 230, 100, 120]);
assert.equal(api.shiftViewport(400, 250, 300, 150, groups), true);
assert.deepEqual([enemies[0].x, enemies[0].y, projectiles[0].history[0].x], [150, 60, 120]);
assert.equal(api.shiftViewport(300, 150, 300, 150, groups), false);
assert.equal(api.shiftViewport(300, 150, 0, 150, groups), false);
assert.equal(api.shiftViewport(300, 150, 320, 180, null), false);
assert.equal(api.shiftViewport(300, 150, 320, 180, { enemies: [null, {}, { x: NaN, y: 1 }] }), true);

const engine = fs.readFileSync(path.join(root, 'engine.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const render = fs.readFileSync(path.join(root, 'render.js'), 'utf8');
assert.ok(html.indexOf('fluidity-v16.js') > html.indexOf('render.js'));
assert.ok(html.indexOf('fluidity-v16.js') < html.indexOf('engine.js'));
assert.match(engine, /updateGame\(dt\);\s*if \(!combatFramePacer/);
assert.match(engine, /shiftViewport\(previousWidth, previousHeight, nextWidth, nextHeight/);
assert.match(render, /c\.fillText\(d\.qteTimer\.toFixed\(1\) \+ 's'/);
console.log('PASS V16 120Hz/90Hz pacing, adaptive frame cost, pause/visibility, resize anchoring and QTE timer');
