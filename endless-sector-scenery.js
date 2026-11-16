/* Station wreckage is painted behind enemies, along opposite board edges. */
(function (root) {
    'use strict';
    const designs = {
        tank_boss: ['#68b2c6', [[0,1,11,1,15,5,11,9,0,9],[2,3,9,3,11,5,9,7,2,7]]],
        ranged_boss: ['#e9a668', [[0,8,5,6,8,0,11,1,10,5,16,3,15,8,6,10,0,10],[2,8,5,7,7,8,5,9]]],
        speed_boss: ['#79e1be', [[0,2,11,0,16,2,13,4,5,5,0,8],[0,9,8,6,11,7,6,10,0,11]]],
        frost_boss: ['#b6dbff', [[0,8,3,3,5,6,8,0,11,7,14,3,16,8,13,11,0,11],[8,0,8,8,11,7]]],
        leviathan: ['#c29bef', [[0,0,8,2,16,7,13,10,6,5,0,4],[0,6,5,7,10,11,4,10,0,9]]]
    };
    function draw(ctx, width, height, wave) {
        const sector = root.EndlessSectors?.describe(wave);
        const design = sector && designs[sector.boss];
        if (!design || width <= 0 || height <= 0) return;
        const scale = Math.min(15, width / 44, height / 35);
        const [color, plates] = design;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, scale * .08);
        for (const mirror of [false, true]) {
            for (const plate of plates) {
                ctx.beginPath();
                for (let i = 0; i < plate.length; i += 2) {
                    const x = (plate[i] + 1) * scale;
                    const y = (plate[i+1] + 2) * scale;
                    const point = [mirror ? width-x : x, mirror ? height-y : y];
                    if (i === 0) ctx.moveTo(...point);
                    else ctx.lineTo(...point);
                }
                ctx.closePath();
                ctx.globalAlpha = .8;
                ctx.fillStyle = '#101e2f';
                ctx.fill();
                ctx.globalAlpha = .48;
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    root.EndlessSectorScenery = Object.freeze({draw});
})(typeof window !== 'undefined' ? window : globalThis);
