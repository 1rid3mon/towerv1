/* Original station architecture. Decorative edge structures never act as obstacles. */
(function (root) {
    'use strict';
    const TAU = Math.PI * 2;
    const palettes = {
        tank_boss: ['#5a8791', '#18272b'], ranged_boss: ['#b47e5b', '#2c2021'],
        speed_boss: ['#649c89', '#142925'], frost_boss: ['#88afc3', '#192b39'],
        leviathan: ['#9582b0', '#252235']
    };
    function plate(c, points, fill, stroke) {
        c.beginPath(); c.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
        c.closePath(); c.fillStyle = fill; c.fill();
        if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
    }
    function foundry(c, width, height, x, y) {
        // Concentric service deck, dark radial corridors and machined floor joints.
        // No per-frame randomness: stable architecture remains legible during combat.
        const radius = Math.min(width * .3, height * .37, 245);
        c.save();
        c.strokeStyle = 'rgba(145,103,88,.055)'; c.lineWidth = 1;
        const grid = 64;
        for (let row = -1; row < height / grid + 1; row++) {
            const yy = row * grid;
            c.beginPath(); c.moveTo(0, yy); c.lineTo(width, yy); c.stroke();
            for (let col = -1; col < width / grid + 1; col++) {
                const xx = col * grid + (row % 2 ? grid / 2 : 0);
                c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + grid); c.stroke();
                c.fillStyle = 'rgba(190,138,104,.09)'; c.fillRect(xx + 5, yy + 5, 2, 2);
            }
        }
        c.translate(x, y);
        for (let i = 0; i < 4; i++) {
            c.save(); c.rotate(Math.PI / 4 + i * Math.PI / 2);
            c.fillStyle = 'rgba(1,5,10,.35)'; c.fillRect(radius * .8, -18, radius * 2, 36);
            c.strokeStyle = 'rgba(152,104,78,.14)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(radius, -21); c.lineTo(radius * 3, -21); c.moveTo(radius, 21); c.lineTo(radius * 3, 21); c.stroke();
            for (let j = 0; j < 3; j++) { c.fillStyle = 'rgba(156,105,76,.15)'; c.fillRect(radius + 24 + j * 14, -12, 3, 24); }
            c.restore();
        }
        c.fillStyle = 'rgba(20,18,22,.56)'; c.strokeStyle = 'rgba(130,101,93,.22)'; c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, radius, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(176,121,86,.16)'; c.lineWidth = 1;
        c.beginPath(); c.arc(0, 0, radius - 12, 0, TAU); c.stroke();
        for (let i = 0; i < 12; i++) {
            const angle = i * TAU / 12;
            c.save(); c.rotate(angle);
            c.fillStyle = i % 3 ? '#383132' : '#76513d'; c.globalAlpha = .38;
            c.fillRect(radius - 5, -8, 9, 16);
            c.strokeStyle = '#77615a'; c.beginPath(); c.moveTo(64, 0); c.lineTo(radius - 22, 0); c.stroke(); c.restore();
        }
        // Recessed reactor socket visibly anchors the tower, separate from range rings.
        c.fillStyle = '#070d14'; c.strokeStyle = '#3d4348'; c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, 53, 0, TAU); c.fill(); c.stroke();
        c.strokeStyle = '#85664f'; c.lineWidth = 3;
        for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .2; c.beginPath(); c.arc(0, 0, 47, a, a + .62); c.stroke(); }
        c.restore();
    }
    function draw(c, width, height, wave, theme) {
        if (!c || width <= 0 || height <= 0) return;
        const sector = root.EndlessSectors?.describe(wave);
        const [accent, hull] = theme === 'cengiz' ? ['#a57454', '#292126'] : (palettes[sector?.boss] || palettes.tank_boss);
        const scale = Math.min(1.4, width / 850, height / 440);
        // Each sector retains a distinct engineering silhouette, not only a tint.
        const proportions = {tank_boss:[1,1],ranged_boss:[.88,1.12],speed_boss:[1.08,.72],frost_boss:[.78,1.28],leviathan:[1.12,.9]};
        const [span, depth] = proportions[sector?.boss] || proportions.tank_boss;
        c.save();
        // Two asymmetrical service gantries live at the outer boundary, leaving the
        // center and every incoming enemy approach free of opaque set dressing.
        for (let side = 0; side < 2; side++) {
            c.save(); c.translate(side ? width : 0, side ? height - 50 : 65);
            c.scale((side ? -scale : scale) * span, (side ? -scale : scale) * depth);
            c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 9, 198, 99);
            plate(c, [0,0,160,0,194,34,194,64,161,96,0,96], '#0c1118', '#3b383b');
            plate(c, [0,6,153,6,182,35,182,60,155,86,0,86], hull, '#594b45');
            plate(c, [0,21,139,21,158,40,158,56,138,73,0,73], '#111820', '#3a4043');
            // Radiator banks, recessed conduit and inset copper end cap.
            for (let i = 0; i < 9; i++) {
                c.fillStyle = '#070c12'; c.fillRect(17 + i * 12, 29, 7, 36);
                c.fillStyle = '#354047'; c.fillRect(17 + i * 12, 29, 2, 35);
            }
            c.strokeStyle = accent; c.lineWidth = 2;
            c.beginPath(); c.moveTo(0, 12); c.lineTo(143, 12); c.lineTo(169, 38); c.stroke();
            plate(c, [157,34,174,41,174,57,157,66], '#574438', accent);
            c.fillStyle = '#a4b8b7';
            for (const point of [[10,12],[143,12],[10,80],[143,80]]) { c.beginPath(); c.arc(point[0],point[1],1.5,0,TAU); c.fill(); }
            c.fillStyle = accent; c.fillRect(22, 77, 20, 2); c.fillRect(46, 77, 5, 2);
            c.restore();
        }
        // Slender docking strips mark the other two corners without giant icons.
        c.strokeStyle = accent; c.lineWidth = 1; c.globalAlpha = .32;
        for (let side = 0; side < 2; side++) {
            const x = side ? width - 22 : 22, y = side ? 90 : height - 90;
            c.beginPath(); c.moveTo(x, y - 38); c.lineTo(x, y + 38); c.stroke();
            for (let i = 0; i < 7; i++) { c.fillStyle = accent; c.fillRect(x - 3, y - 30 + i * 10, 6, 2); }
        }
        c.restore();
    }
    root.EndlessSectorScenery = Object.freeze({draw, foundry});
})(typeof window !== 'undefined' ? window : globalThis);
