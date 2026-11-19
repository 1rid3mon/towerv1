const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDirector, sanitize } = require('../fx-director.js');

test('automatic mode falls to low after two continuous seconds and alerts only once', () => {
    let alerts = 0;
    const fx = createDirector({ onDowngrade: () => alerts++ });
    for (let time = 0; time < 2000; time += 40) fx.observeFrame(time, 23);
    assert.equal(fx.settings().effectiveIntensity, 'medium');
    for (let time = 2000; time <= 4000; time += 40) fx.observeFrame(time, 23);
    assert.equal(fx.settings().effectiveIntensity, 'low');
    assert.equal(alerts, 1);
});

test('a sampling gap resets the slow window and manual intensity remains selected', () => {
    const fx = createDirector();
    fx.observeFrame(0, 30);
    fx.observeFrame(3000, 30);
    assert.equal(fx.settings().effectiveIntensity, 'medium');
    fx.configure({ intensity: 'high' });
    for (let time = 0; time <= 3000; time += 40) fx.observeFrame(time, 30);
    assert.equal(fx.settings().effectiveIntensity, 'high');
});

test('pool enforces the drop cap, reuses released slots and honors system motion settings', () => {
    let reduced = false;
    const fx = createDirector({ initial: { intensity: 'high' }, systemReduced: () => reduced });
    const pool = fx.createPool('drop');
    const slots = Array.from({ length: 60 }, () => pool.acquire());
    assert.equal(new Set(slots).size, 60);
    assert.equal(pool.acquire(), null);
    pool.release(slots[0]);
    assert.equal(pool.acquire(), slots[0]);
    pool.release(slots[0]);
    reduced = true;
    assert.equal(pool.acquire(), null);
    assert.deepEqual(sanitize({ intensity: NaN, reducedMotion: null }), {
        intensity: 'auto', reducedMotion: false, vibration: true
    });
});

test('visual pending rewards merge without loss and finish at the actual balance', () => {
    const fx = createDirector();
    let collected = 0;
    fx.on('collected', value => collected += value.value);
    for (let i = 0; i < 100; i++) fx.emit('enemyKill', { x: 200, y: 200, gold: 10, crystals: 2, boss: i % 10 === 0 });
    assert.ok(fx.dropCount <= 60);
    assert.equal(fx.displayValue('gold', 1000), 0);
    assert.equal(fx.displayValue('crystal', 200), 0);
    for (let i = 0; i < 200; i++) fx.updateVisuals(.016, { x: 400, y: 300 });
    assert.equal(fx.dropCount, 0);
    assert.equal(fx.displayValue('gold', 1000), 1000);
    assert.ok(Math.abs(collected - 1200) < .001);
});

test('motion settings and closing the page discard only presentation debt', () => {
    const fx = createDirector();
    fx.emit('enemyKill', { x: 20, y: 20, gold: 10 });
    assert.equal(fx.displayValue('gold', 10), 0);
    fx.configure({ reducedMotion: true });
    assert.equal(fx.displayValue('gold', 10), 10);
    assert.equal(fx.dropCount, 0);
    fx.emit('enemyKill', { x: 20, y: 20, gold: 10 });
    assert.equal(fx.dropCount, 0);
    assert.equal(createDirector().displayValue('gold', 10), 10);
});

test('boss timing, reduced motion and gesture-gated vibration are bounded', () => {
    let now = 0, calls = 0;
    const fx = createDirector({ clock: () => now, vibrate: () => { calls++; return true; } });
    assert.equal(fx.haptic(8), false);
    fx.unlockHaptics(); fx.emit('enemyKill', { x: 20, y: 20, gold: 10, boss: true });
    assert.equal(fx.simulationScale(), 0);
    assert.equal(calls, 1);
    now = 60; assert.equal(fx.simulationScale(), .35); assert.equal(fx.haptic(8), false);
    now = 80; assert.equal(fx.haptic(8), true);
    now = 310; assert.equal(fx.simulationScale(), 1);
    fx.configure({ reducedMotion: true }); fx.emit('critical'); assert.equal(fx.simulationScale(), 1);
    assert.doesNotThrow(() => createDirector({ vibrate: () => { throw Error(); } }).haptic(8));
});

test('collection pitch increases by semitones, caps at seven and resets at 600ms', () => {
    const { nextCollectStep } = require('../command-sounds.js');
    assert.deepEqual(Array.from({length: 10}, (_, i) => nextCollectStep(i * 100)), [0,1,2,3,4,5,6,7,7,7]);
    assert.equal(nextCollectStep(1500), 0);
});

test('100 actual engine kills credit identical economy with enabled, disabled and reduced FX', () => {
    const fs = require('node:fs'), vm = require('node:vm');
    const source = fs.readFileSync(require.resolve('../engine.js'), 'utf8');
    const body = source.slice(source.indexOf('function killEnemy(enemy)'), source.indexOf('function damageTower('));
    function economy(fx) {
        let seed = 100, calls = 0;
        const math = Object.create(Math);
        math.random = () => { calls++; return ((seed = (Math.imul(seed,1664525)+1013904223)>>>0)/4294967296); };
        const game = { gold: 0, crystals: 0, wave: 1, stats: {bossKills: 0,totalKills: 0},waveKills: 0,waveTargetKills: 999 };
        const no = () => {};
        const c = {window:{Fx:fx},game,enemies:[],Math:math,rings:[],isDrawerOpen:false,formatNumber:String,addFloatingText:no,showToast:no,createParticles:no,getCrystalDropChance:()=>30,getCrystalDropMult:()=>1,creditGameplayCrystals:n=>game.crystals+=n};
        vm.createContext(c); vm.runInContext(body,c);
        for(let i=0;i<100;i++){const enemy={x:200,y:200,gold:5,radius:10,type:i%10===0?'boss':'normal'};c.enemies.push(enemy);c.killEnemy(enemy);}
        return {gold:game.gold,crystals:game.crystals,calls};
    }
    const baseline = economy(undefined);
    assert.deepEqual(economy(createDirector()), baseline);
    assert.deepEqual(economy(createDirector({initial:{reducedMotion:true}})), baseline);
    assert.deepEqual(economy(createDirector({initial:{intensity:'low'}})), baseline);
});

test('render budget caps all registered particles and stops work at four milliseconds', () => {
    let time = 0;
    const fx = createDirector({ clock: () => time });
    fx.beginFrame();
    for (let i = 0; i < 150; i++) assert.equal(fx.takeBudget(), true);
    assert.equal(fx.takeBudget(), false);
    assert.equal(fx.diagnostics().drawn, 150);
    fx.beginFrame(); time = 4.1;
    assert.equal(fx.takeBudget(), false);
    fx.configure({ reducedMotion: true }); fx.beginFrame();
    assert.equal(fx.takeBudget(), false);
});

test('drag pickup only accelerates intersecting drops and never changes credited value', () => {
    const fx = createDirector();
    fx.emit('enemyKill', { x: 200, y: 200, gold: 10 });
    assert.equal(fx.pickAt(0, 0), 0);
    assert.equal(fx.pickAt(200, 200), 1);
    assert.equal(fx.displayValue('gold', 10), 0);
    fx.updateVisuals(.01, { x: 200, y: 200 });
    assert.equal(fx.displayValue('gold', 10), 10);
    assert.equal(fx.dropCount, 0);
});

test('boss kill overrides same-frame critical stop and clearing removes all timing effects', () => {
    let now = 100;
    const fx = createDirector({ clock: () => now });
    fx.emit('critical'); fx.emit('enemyKill', { x: 0, y: 0, gold: 1, boss: true });
    now = 145; assert.equal(fx.simulationScale(), 0);
    now = 165; assert.equal(fx.simulationScale(), .35);
    fx.clearVisuals(); assert.equal(fx.simulationScale(), 1);
    assert.equal(fx.displayValue('gold', 1), 1);
});

test('arrival halo lasts 120ms and draw budget records it without extra economic credit', () => {
    const fx = createDirector({ clock: () => 0 });
    let arcs = 0, collected = 0;
    const ctx = {save(){},restore(){},beginPath(){},arc(){arcs++},stroke(){}};
    fx.on('collected', () => collected++);
    fx.emit('enemyKill', { x: 5, y: 5, gold: 1 });
    fx.pickAt(5, 5); fx.updateVisuals(.01, {x:5,y:5});
    fx.beginFrame(); fx.drawHalos(ctx); assert.equal(arcs, 1);
    fx.updateVisuals(.1, {x:5,y:5}); fx.updateVisuals(.03, {x:5,y:5});
    fx.beginFrame(); fx.drawHalos(ctx); assert.equal(arcs, 1);
    assert.equal(collected, 1);
});

test('auto downgrade immediately releases visual debt even before another animation frame', () => {
    const fx = createDirector();
    fx.emit('enemyKill', {x:0,y:0,gold:9});
    assert.equal(fx.dropCount, 1);
    for(let now=0;now<=2000;now+=40)fx.observeFrame(now,23);
    assert.equal(fx.settings().effectiveIntensity,'low');
    assert.equal(fx.dropCount,0);
    fx.configure({intensity:'medium'});
    assert.equal(fx.displayValue('gold',9),9);
});

test('five kills within two seconds trigger one chain with a cooldown', () => {
    let now = 0, chains = 0;
    const fx = createDirector({clock:()=>now});
    fx.on('chain', ({count}) => {assert.equal(count,5); chains++;});
    for(let i=0;i<4;i++){now=i*100;fx.emit('enemyKill',{x:0,y:0,gold:1});}
    assert.equal(chains,0);
    now=400;fx.emit('enemyKill',{x:0,y:0,gold:1});assert.equal(chains,1);
    for(let i=0;i<20;i++){now=500+i*20;fx.emit('enemyKill',{x:0,y:0,gold:1});}
    assert.equal(chains,1);
    fx.clearVisuals();now=5000;
    for(let i=0;i<5;i++){now+=600;fx.emit('enemyKill',{x:0,y:0,gold:1});}
    assert.equal(chains,1,'spaced kills are not a chain');
});

test('repeated critical hits cannot extend a stop indefinitely', () => {
    let now=0;
    const fx=createDirector({clock:()=>now});
    fx.emit('critical');
    for(now=5;now<120;now+=5){fx.emit('critical');assert.equal(fx.simulationScale(),now<40?0:1);}
    fx.emit('critical');assert.equal(fx.simulationScale(),0);
});

test('a failed presentation callback cannot interrupt later reward listeners', () => {
    const fx=createDirector();let called=false,warnings=0;
    const previous=console.warn;console.warn=()=>warnings++;
    try {
        fx.on('collected',()=>{throw new Error('presentation only');});
        fx.on('collected',()=>{called=true;});
        fx.emit('enemyKill',{x:0,y:0,gold:1});fx.pickAt(0,0);fx.updateVisuals(.01,{x:0,y:0});
        assert.equal(fx.displayValue('gold',1),1);assert.equal(called,true);assert.equal(warnings,1);
    } finally {console.warn=previous;}
});

test('unsupported or throwing vibration adapters return false after gesture without error', () => {
    for(const vibrate of [()=>undefined,()=>{throw Error('unsupported');}]){
        const fx=createDirector({vibrate});fx.unlockHaptics();assert.equal(fx.haptic(8),false);
    }
});

test('combat warning rings stay outside the reduced-motion cosmetic render gate', () => {
    const fs=require('node:fs');
    const source=fs.readFileSync(require.resolve('../render.js'),'utf8');
    const render=source.slice(source.indexOf('function renderGame()'));
    assert.ok(render.indexOf('for (const r of rings)')<render.indexOf('window.Fx?.beginFrame()'));
    const ringBlock=render.slice(render.indexOf('for (const r of rings)'),render.indexOf('for (const r of rings)')+2500);
    assert.doesNotMatch(ringBlock,/takeBudget|settings\(\)\.reduced/);
});
