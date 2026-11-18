(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./data/fx-config.js'));
        return;
    }
    const api = factory(root.LostSignalFxConfig);
    let initial;
    try { initial = JSON.parse(root.localStorage.getItem('lostSignal:fx')); } catch {}
    const media = root.matchMedia?.('(prefers-reduced-motion: reduce)');
    root.Fx = api.createDirector({
        initial,
        systemReduced: () => media?.matches === true,
        save: value => {
            try { root.localStorage.setItem('lostSignal:fx', JSON.stringify(value)); } catch {}
        },
        onDowngrade: () => root.MetaUI?.notify(root.MetaStrings.fxAutoLow)
    });
    root.document?.addEventListener('pointerdown', () => root.Fx.unlockHaptics(), { once: true });
    root.document?.addEventListener('keydown', () => root.Fx.unlockHaptics(), { once: true });
    root.document?.addEventListener('pointermove', event => {
        // Passive and hit-tested: never captures a gesture intended for battle controls.
        const canvas = event.target;
        if (!event.buttons || canvas?.tagName !== 'CANVAS') return;
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        root.Fx.pickAt((event.clientX - bounds.left) * canvas.width / bounds.width,
            (event.clientY - bounds.top) * canvas.height / bounds.height);
    }, { passive: true });
    root.document?.addEventListener('visibilitychange', () => {
        if (root.document.hidden) root.Fx.clearVisuals();
    });
})(globalThis, function (config) {
    'use strict';

    function sanitize(settings) {
        return {
            intensity: ['auto', 'low', 'medium', 'high'].includes(settings?.intensity)
                ? settings.intensity : 'auto',
            reducedMotion: settings?.reducedMotion === true,
            vibration: settings?.vibration !== false
        };
    }

    function createDirector({ initial, systemReduced = () => false, save = () => {}, onDowngrade = () => {}, clock = () => performance.now(), vibrate = pattern => globalThis.navigator?.vibrate?.(pattern) } = {}) {
        let preferences = sanitize(initial);
        let automaticLow = false;
        let slowSince = null;
        let lastSample = null;
        const handlers = new Map();

        const drops = new Set();
        let dropPool;
        const halos = Array.from({ length: 12 }, () => ({ age: 1, x: 0, y: 0 }));
        let haloCursor = 0, drawn = 0, updateCost = 0;
        let drawStart = 0;
        function beginFrame() { drawn = 0; drawStart = clock(); }
        function takeBudget() {
            const current = settings();
            if (current.reduced || drawn >= config.particleLimits[current.effectiveIntensity] || clock() - drawStart > config.frameBudgetMs) return false;
            drawn++; return true;
        }
        function diagnostics() { return { drops: drops.size, drawn, updateCostMs: updateCost, frameBudgetMs: config.frameBudgetMs }; }
        const pending = { gold: 0, crystal: 0 };
        let seed = 72541, unlocked = false, lastVibration = -Infinity;
        let stopUntil = 0, slowUntil = 0, shakeUntil = 0, lastImpact = -Infinity, lastBoss = -Infinity;
        // Presentation randomness must never consume the gameplay random stream.
        const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
        function unlockHaptics() { unlocked = true; }
        function haptic(pattern) {
            const now = clock();
            if (!unlocked || !preferences.vibration || now - lastVibration < 80) return false;
            lastVibration = now;
            try { return vibrate(pattern) !== false; } catch { return false; }
        }
        function clearVisuals() {
            for (const drop of drops) dropPool.release(drop);
            drops.clear(); pending.gold = pending.crystal = 0;
            stopUntil = slowUntil = shakeUntil = 0;
            for (const halo of halos) halo.age = 1;
        }
        function displayValue(kind, actual) {
            const current = settings();
            if (current.reduced || current.effectiveIntensity === 'low') return actual;
            return Math.max(0, actual - (pending[kind] || 0));
        }
        function reward(kind, value, x, y, boss) {
            const current = settings();
            if (!Number.isFinite(value) || value <= 0 || current.reduced || current.effectiveIntensity === 'low') return;
            const count = boss ? Math.min(12, Math.ceil(value)) : 1;
            for (let i = 0; i < count; i++) {
                const amount = value / count;
                const merged = drops.size >= 40 ? Array.from(drops).find(d => d.kind === kind) : null;
                if (merged) { merged.value += amount; merged.size = 1.4; pending[kind] += amount; continue; }
                const drop = dropPool.acquire();
                if (!drop) continue; // At budget: show credited value immediately.
                const angle = boss ? i / count * Math.PI * 2 : random() * Math.PI * 2;
                const distance = 18 + random() * 14;
                Object.assign(drop, { kind, value: amount, x, y, ox: x, oy: y,
                    dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance,
                    age: 0, speed: 120, size: 1 });
                drops.add(drop); pending[kind] += amount;
            }
        }
        function impact(boss) {
            const now = clock();
            haptic(boss ? [20, 40, 30] : 10);
            if (settings().reduced || now - (boss ? lastBoss : lastImpact) < (boss ? 180 : 120)) return;
            lastImpact = now;
            if (boss) lastBoss = now;
            stopUntil = now + (boss ? 60 : 40);
            if (boss) { slowUntil = now + 310; shakeUntil = now + 180; }
        }
        function simulationScale() {
            if (settings().reduced) return 1;
            const now = clock();
            return now < stopUntil ? 0 : now < slowUntil ? .35 : 1;
        }
        function updateVisuals(dt, target) {
            const started = clock();
            const current = settings();
            if (current.reduced || current.effectiveIntensity === 'low') { clearVisuals(); return; }
            const seconds = Math.min(.1, Math.max(0, dt));
            for (const halo of halos) halo.age += seconds;
            for (const d of drops) {
                d.age += seconds;
                if (d.age < .22) {
                    const ease = 1 - Math.pow(1 - d.age / .22, 3);
                    d.x = d.ox + d.dx * ease; d.y = d.oy + d.dy * ease;
                } else if (d.age < .57) {
                    d.x = d.ox + d.dx; d.y = d.oy + d.dy + Math.sin(d.age * 8) * 2;
                } else {
                    const dx = target.x - d.x, dy = target.y - d.y, distance = Math.hypot(dx, dy);
                    d.speed = Math.min(900, d.speed + 1400 * seconds);
                    const travel = d.speed * seconds;
                    if (distance <= Math.max(14, travel)) {
                        pending[d.kind] = Math.max(0, pending[d.kind] - d.value);
                        drops.delete(d); dropPool.release(d);
                        const halo = halos[haloCursor++ % halos.length];
                        halo.x = target.x; halo.y = target.y; halo.age = 0;
                        emit('collected', { kind: d.kind, value: d.value });
                        globalThis.TowerCommandSounds?.play('collect');
                    } else {
                        const curve = Math.sin(Math.min(1, (d.age - .57) / .5) * Math.PI) * .12;
                        d.x += (dx - dy * curve) / distance * travel;
                        d.y += (dy + dx * curve) / distance * travel;
                    }
                }
            }
            if (!drops.size) pending.gold = pending.crystal = 0;
            updateCost = Math.max(0, clock() - started);
        }
        function pickAt(x, y) {
            let picked = 0;
            for (const d of drops) {
                if (d.age < .57 && Math.hypot(d.x - x, d.y - y) <= 18) { d.age = .57; picked++; }
            }
            return picked;
        }
        function drawVisuals(ctx) {
            if (settings().reduced) return;
            for (const d of drops) {
                if (!takeBudget()) break;
                const size = (d.kind === 'gold' ? 5 : 6) * d.size * Math.min(1, d.age / .12);
                ctx.save(); ctx.translate(d.x, d.y);
                ctx.fillStyle = d.kind === 'gold' ? '#f6bd66' : '#69e9f1';
                ctx.strokeStyle = '#e9fdff'; ctx.lineWidth = 1;
                ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 7;
                ctx.beginPath();
                if (d.kind === 'gold') ctx.arc(0, 0, size, 0, Math.PI * 2);
                else { ctx.moveTo(0, -size); ctx.lineTo(size * .8, 0); ctx.lineTo(0, size); ctx.lineTo(-size * .8, 0); ctx.closePath(); }
                ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff'; ctx.fillRect(-1, -size * .5, 2, 2); ctx.restore();
            }
        }
        function drawHalos(ctx) {
            if (settings().reduced) return;
            for (const halo of halos) {
                if (halo.age >= .12 || !takeBudget()) continue;
                const progress = halo.age / .12;
                ctx.save(); ctx.globalAlpha = (1 - progress) * .65;
                ctx.strokeStyle = '#78e7ef'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(halo.x, halo.y, 12 + progress * 16, 0, Math.PI * 2);
                ctx.stroke(); ctx.restore();
            }
        }
        function applyShake(ctx) {
            if (settings().reduced) return;
            const remaining = shakeUntil - clock();
            if (remaining > 0) { const size = 6 * Math.min(1, remaining / 180); ctx.translate(Math.sin(clock() * .09) * size, Math.cos(clock() * .12) * size); }
        }

        function settings() {
            return {
                ...preferences,
                reduced: preferences.reducedMotion || systemReduced(),
                effectiveIntensity: preferences.intensity === 'auto'
                    ? (automaticLow ? 'low' : 'medium') : preferences.intensity
            };
        }

        function configure(patch) {
            preferences = sanitize({ ...preferences, ...patch });
            automaticLow = false;
            resetSampling();
            if (settings().reduced || settings().effectiveIntensity === 'low') clearVisuals();
            save({ ...preferences });
            return settings();
        }

        function resetSampling() {
            slowSince = null;
            lastSample = null;
        }

        function observeFrame(now, cost) {
            if (preferences.intensity !== 'auto' || automaticLow ||
                !Number.isFinite(now) || !Number.isFinite(cost) || cost <= config.slowFrameMs) {
                resetSampling();
                return;
            }
            if (lastSample === null || now <= lastSample || now - lastSample > config.maxSampleGapMs) slowSince = now;
            lastSample = now;
            if (now - slowSince >= config.slowWindowMs) {
                automaticLow = true;
                resetSampling();
                onDowngrade();
            }
        }

        function on(event, handler) {
            if (!handlers.has(event)) handlers.set(event, new Set());
            const listeners = handlers.get(event);
            listeners.add(handler);
            return () => listeners.delete(handler);
        }

        function emit(event, payload) {
            const listeners = handlers.get(event);
            if (!listeners?.size) return;
            const current = settings();
            for (const listener of listeners) listener(payload, current);
        }

        function createPool(kind) {
            const limits = kind === 'drop' ? config.dropLimits : config.particleLimits;
            const free = Array.from({ length: limits.high }, () => ({}));
            const used = new Set();
            return Object.freeze({
                acquire() {
                    const { effectiveIntensity, reduced } = settings();
                    if (reduced || used.size >= limits[effectiveIntensity]) return null;
                    const entry = free.pop();
                    used.add(entry);
                    return entry;
                },
                release(entry) {
                    if (used.delete(entry)) free.push(entry);
                },
                get size() { return used.size; }
            });
        }

        dropPool = createPool('drop');
        on('enemyKill', payload => {
            reward('gold', payload.gold, payload.x, payload.y, payload.boss);
            reward('crystal', payload.crystals || 0, payload.x, payload.y, payload.boss);
            if (payload.boss) { impact(true); globalThis.TowerCommandSounds?.play('boss'); }
        });
        on('critical', () => impact(false));
        return Object.freeze({ unlockHaptics, haptic, clearVisuals, displayValue, simulationScale,
            updateVisuals, drawVisuals, drawHalos, applyShake, pickAt, beginFrame, takeBudget, diagnostics, get dropCount() { return drops.size; }, settings, configure, resetSampling, observeFrame, on, emit, createPool,
            frameBudgetMs: config.frameBudgetMs });
    }

    return Object.freeze({ createDirector, sanitize });
});
