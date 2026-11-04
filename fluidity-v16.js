/* V16 Fluid Combat: presentation-only frame pacing and viewport anchoring.
   Never changes scores, rewards, game speed, saves, or Story progress. */
(function (root) {
'use strict';
if (root.TowerFluidityV16) return;

function createFramePacer() {
    let lastDraw = -Infinity;
    let slowFrames = 0;
    let fastFrames = 0;
    let reducedRate = false;

    function shouldRender(now, options) {
        const opts = options || {};
        if (!Number.isFinite(now) || opts.hidden) return false;
        const fps = opts.paused ? 24 : (reducedRate ? 30 : 60);
        const interval = 1000 / fps;
        if (!Number.isFinite(lastDraw) || now < lastDraw || now - lastDraw >= interval * 4) {
            lastDraw = now;
            return true;
        }
        if (now - lastDraw < interval - 1) return false;
        // Keep the fractional time budget; on 90 Hz displays this avoids a
        // needless 45 FPS lock caused by resetting to every second frame.
        lastDraw += interval;
        return true;
    }

    function observeRenderCost(milliseconds) {
        if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
        if (milliseconds >= 19) {
            slowFrames++;
            fastFrames = 0;
        } else if (milliseconds <= 11) {
            fastFrames++;
            slowFrames = Math.max(0, slowFrames - 2);
        } else {
            slowFrames = Math.max(0, slowFrames - 1);
            fastFrames = Math.max(0, fastFrames - 1);
        }
        if (!reducedRate && slowFrames >= 28) {
            reducedRate = true;
            slowFrames = 0;
            fastFrames = 0;
        } else if (reducedRate && fastFrames >= 90) {
            reducedRate = false;
            slowFrames = 0;
            fastFrames = 0;
        }
    }

    return Object.freeze({
        shouldRender,
        observeRenderCost,
        state: () => ({ targetFps: reducedRate ? 30 : 60, reducedRate })
    });
}

function shiftViewport(oldWidth, oldHeight, newWidth, newHeight, groups) {
    const dims = [oldWidth, oldHeight, newWidth, newHeight];
    if (!dims.every(n => Number.isFinite(n) && n > 0)) return false;
    const dx = (newWidth - oldWidth) / 2, dy = (newHeight - oldHeight) / 2;
    if (dx === 0 && dy === 0) return false;
    if (!groups || typeof groups !== 'object') return false;
    const names = ['enemies', 'projectiles', 'particles', 'floatingTexts', 'rings', 'cargoDrones'];
    for (const name of names) {
        const items = groups[name];
        if (!Array.isArray(items)) continue;
        for (const item of items) {
            if (!item || typeof item !== 'object') continue;
            if (Number.isFinite(item.x)) item.x += dx;
            if (Number.isFinite(item.y)) item.y += dy;
            if (Array.isArray(item.history)) {
                for (const point of item.history) {
                    if (point && Number.isFinite(point.x)) point.x += dx;
                    if (point && Number.isFinite(point.y)) point.y += dy;
                }
            }
        }
    }
    if (Array.isArray(groups.lightningBeams)) {
        for (const beam of groups.lightningBeams) {
            if (!beam) continue;
            for (const key of ['x1', 'x2']) if (Number.isFinite(beam[key])) beam[key] += dx;
            for (const key of ['y1', 'y2']) if (Number.isFinite(beam[key])) beam[key] += dy;
        }
    }
    return true;
}

root.TowerFluidityV16 = Object.freeze({ createFramePacer, shiftViewport });
})(typeof window !== 'undefined' ? window : globalThis);
