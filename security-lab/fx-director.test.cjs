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
