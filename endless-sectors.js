/* Sector identity is derived from existing wave progression. */
(function (root) {
    'use strict';
    const regions = [
        ['Dış İstasyon', 'tank_boss', 'Zırhlı Titan Behemoth'],
        ['Kırık Röle', 'ranged_boss', 'Hiperiyon Topçusu'],
        ['İyon Geçidi', 'speed_boss', 'Kızıl Fırtına Vektörü'],
        ['Donmuş Yörünge', 'frost_boss', 'Kutup Hükümdarı Kryos'],
        ['Sessiz Uçurum', 'leviathan', 'Kozmik Leviathan']
    ];
    function describe(value) {
        const wave = Math.max(1, Math.floor(Number(value) || 1));
        const sector = Math.floor((wave - 1) / 10) + 1;
        const stage = (wave - 1) % 10 + 1;
        const region = regions[(sector - 1) % regions.length];
        return { sector, stage, name: region[0], boss: region[1], bossName: region[2],
            bossWave: stage === 5 || stage === 10,
            remaining: stage <= 5 ? 5 - stage : 10 - stage };
    }
    function bossPressure(wave) {
        const { sector, stage, bossWave } = describe(wave);
        if (!bossWave || sector <= 20) return null;
        const ramp = Math.min(1, (sector - 21) / 9);
        return stage === 10
            ? { hp: 1.65 + 1.65 * ramp, damage: 1.15 + 0.4 * ramp }
            : { hp: 1.3 + 0.7 * ramp, damage: 1.05 + 0.2 * ramp };
    }
    root.EndlessSectors = Object.freeze({ describe, bossPressure });
    if (typeof module !== 'undefined') module.exports = root.EndlessSectors;
})(typeof window !== 'undefined' ? window : globalThis);
