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
    root.EndlessSectors = Object.freeze({ describe });
    if (typeof module !== 'undefined') module.exports = root.EndlessSectors;
})(typeof window !== 'undefined' ? window : globalThis);
