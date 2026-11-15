/* Decorative silhouettes stay at the board edges, away from the tower. */
(function (root) {
    'use strict';
    const designs = {
        tank_boss: ['#5f9aa9', [[0,2,9,3],[2,0,2,7],[9,1,2,6],[4,4,5,1]]],
        ranged_boss: ['#d9a16d', [[0,1,2,5],[3,3,2,5],[6,2,2,4],[9,4,3,2]]],
        speed_boss: ['#7dc3af', [[0,1,12,1],[2,4,10,1],[5,7,7,1]]],
        frost_boss: ['#a1cbf4', [[0,4,2,4],[2,2,2,6],[4,0,2,8],[6,3,2,5],[8,5,2,3]]],
        leviathan: ['#bb9cdd', [[0,0,3,2],[3,2,3,2],[6,4,3,2],[9,6,3,2]]]
    };
    function draw(ctx, width, height, wave) {
        const sector = root.EndlessSectors?.describe(wave);
        const design = sector && designs[sector.boss];
        if (!design || width <= 0 || height <= 0) return;
        const unit = Math.max(3, Math.min(9, Math.min(width, height) / 54));
        const [color, blocks] = design;
        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = .18;
        for (const [x,y,w,h] of blocks) {
            ctx.fillRect(x*unit, (y+2)*unit, w*unit, h*unit);
            ctx.fillRect(width-(x+w)*unit, height-(y+h+2)*unit, w*unit, h*unit);
        }
        ctx.restore();
    }
    root.EndlessSectorScenery = Object.freeze({draw});
})(typeof window !== 'undefined' ? window : globalThis);
