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

    function createDirector({ initial, systemReduced = () => false, save = () => {}, onDowngrade = () => {} } = {}) {
        let preferences = sanitize(initial);
        let automaticLow = false;
        let slowSince = null;
        let lastSample = null;
        const handlers = new Map();

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

        return Object.freeze({ settings, configure, resetSampling, observeFrame, on, emit, createPool,
            frameBudgetMs: config.frameBudgetMs });
    }

    return Object.freeze({ createDirector, sanitize });
});
