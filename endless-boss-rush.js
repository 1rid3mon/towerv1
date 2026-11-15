/* A short tactical encounter, separate from the active Endless wave. */
(function (root) {
    'use strict';
    const bosses = [
        {name:'Zırhlı Titan Behemoth', pattern:['guard','strike','strike'], item:0},
        {name:'Hiperiyon Topçusu', pattern:['strike','guard','strike','guard'], item:6},
        {name:'Kutup Hükümdarı Kryos', pattern:['guard','strike','guard','strike'], item:12},
        {name:'Kozmik Leviathan', pattern:['strike','guard','guard','strike','strike'], item:18}
    ];
    function challenge(day) {
        return bosses[((day % bosses.length) + bosses.length) % bosses.length];
    }
    function turn(fight, action) {
        const boss = challenge(fight.day);
        if (fight.result || !['strike','guard'].includes(action)) return fight;
        const correct = boss.pattern[fight.step] === action;
        const hp = fight.hp - (correct ? 0 : 1);
        const step = fight.step + 1;
        return {...fight, hp, step, result: hp <= 0 ? 'lost' : step >= boss.pattern.length ? 'won' : '',
            feedback: correct ? 'Hamle başarılı.' : 'İsabet aldın.'};
    }
    root.EndlessBossRush = Object.freeze({challenge,turn});
})(typeof window !== 'undefined' ? window : globalThis);
