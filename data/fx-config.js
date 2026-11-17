(function (root) {
    'use strict';
    const config = Object.freeze({
        frameBudgetMs: 4,
        slowFrameMs: 22,
        slowWindowMs: 2000,
        maxSampleGapMs: 250,
        particleLimits: Object.freeze({ low: 60, medium: 150, high: 220 }),
        dropLimits: Object.freeze({ low: 24, medium: 60, high: 60 })
    });
    if (typeof module === 'object' && module.exports) module.exports = config;
    else root.LostSignalFxConfig = config;
})(globalThis);
