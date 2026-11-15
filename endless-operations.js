/* Account-scoped, device-local Endless progression. */
(function () {
    'use strict';
    const DAY = 86400000;
    const XP_PER_TIER = 60;
    const slots = [
        ['Silah', 'damage', ['Plazma Namlusu','İyon Topu','Prizma Lensi','Röle Topu','Yörünge Lazerı','Çekirdek Mızrağı']],
        ['Reaktör', 'speed', ['Darbe Hücresi','Akı Reaktörü','Füzyon Bobini','İyon Pili','Faz Motoru','Kuasar Çekirdeği']],
        ['Zırh', 'hp', ['Alaşım Plaka','Kalkan Örgüsü','Kriyo Kabuk','Manyetik Zırh','Prizma Kabuğu','Titan Gövde']],
        ['Hedefleme', 'range', ['Tarayıcı','İz Radarı','Faz Optiği','Yörünge Sensörü','Spektrum Dizisi','Ufuk Gözü']]
    ];
    const gear = slots.flatMap(([slot, stat, names], group) => names.map((name, rank) => ({
        id: group * 6 + rank, group, slot, stat, name, rank
    })));
    const supply = [6, 8, 10, 12, 14, 16];
    const tasks = [
        ['daily', 'waves', 3, 20, '3 dalga tamamla'],
        ['daily', 'bosses', 1, 20, 'Bir boss yen'],
        ['daily', 'sectors', 1, 20, 'Bir sektör tamamla'],
        ['weekly', 'waves', 20, 120, '20 dalga tamamla'],
        ['career', 'sectors', 3, 100, '3 farklı sektör tamamla']
    ];

    function active() {
        return document.body.dataset.gameMode !== 'story' && !window.GameModeRuntime?.isStoryActive();
    }
    function ownerKey() {
        return 'towerEndlessOperationsV1:' + (typeof currentUser !== 'undefined' && currentUser?.uid ? currentUser.uid : 'guest');
    }
    let cachedKey = '', cached = null, panel, tab = 'supply';
    function load() {
        const key = ownerKey();
        if (cachedKey === key && cached) return cached;
        let saved;
        try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
        const now = Date.now();
        const defaults = { day:-1, stamps:0, parts:0, owned:{}, equipped:{}, cleared:0,
            daily:{}, weekly:{}, career:{}, xp:0, claimed:0, season:Math.floor(now/DAY/30),
            activeAt:now, offline:0 };
        cachedKey = key;
        cached = { ...defaults, ...saved };
        if (saved && typeof saved.activeAt === 'number') {
            const hours = Math.floor(Math.min(12 * 3600000, Math.max(0, now - saved.activeAt)) / 3600000);
            cached.offline = Math.min(360, cached.offline + hours * Math.min(30, Math.max(0, cached.cleared)));
        }
        cached.activeAt = now;
        persist();
        return cached;
    }
    function persist() {
        try { localStorage.setItem(cachedKey, JSON.stringify(cached)); return true; }
        catch { return false; }
    }
    function periods(state) {
        const day = Math.floor(Date.now()/DAY);
        const week = Math.floor((day+3)/7);
        const season = Math.floor(day/30);
        if (state.daily.period !== day) state.daily = { period:day };
        if (state.weekly.period !== week) state.weekly = { period:week };
        if (state.season !== season) Object.assign(state,{season,xp:0,claimed:0});
        return day;
    }
    function grant(state, item) {
        if (state.owned[item.id]) state.parts += 8;
        else state.owned[item.id] = 1;
    }
    function record(wave) {
        if (!active()) return;
        const state = load();
        periods(state);
        for (const bucket of [state.daily,state.weekly,state.career]) {
            bucket.waves = (bucket.waves || 0)+1;
            if (wave%5===0) bucket.bosses = (bucket.bosses || 0)+1;
        }
        const sector = wave/10;
        if (wave%10===0 && sector>state.cleared) {
            state.cleared = sector;
            state.daily.sectors = (state.daily.sectors || 0)+1;
            state.career.sectors = (state.career.sectors || 0)+1;
            grant(state, gear[(sector-1)%gear.length]);
        }
        state.activeAt = Date.now();
        persist();
        if (panel?.open) render();
    }
    function bonus(stat) {
        if (!active()) return 0;
        const state = load();
        const item = gear[Object.values(state.equipped).find(id=>gear[id]?.stat===stat)];
        if (!item || !state.owned[item.id]) return 0;
        const equipped = Object.values(state.equipped).filter(id=>state.owned[id]);
        const set = equipped.filter(id=>gear[id]?.rank===item.rank).length >= 2 ? .02 : 0;
        return Math.min(.18,.025+item.rank*.01+(state.owned[item.id]-1)*.015+set);
    }
    function render() {
        if (!panel || !active()) return;
        const state = load(), day = periods(state), content = panel.querySelector('section');
        content.replaceChildren();
        function line(value) {
            const p = document.createElement('p'); p.textContent = value; content.append(p);
        }
        function button(label, action, blocked=false) {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = label; b.disabled = blocked;
            b.onclick = () => {
                if (!active() || ownerKey()!==cachedKey) { panel.close(); return; }
                const previous = JSON.stringify(state);
                action();
                if (!persist()) {
                    cached = JSON.parse(previous);
                    if (typeof showToast === 'function') showToast('İkmal kaydedilemedi.');
                }
                render();
            };
            content.append(b);
        }
        line(state.parts+' ekipman parçası');
        if (tab==='supply') {
            const next = state.stamps % 7;
            line('Piko · Günlük ikmal');
            const track = document.createElement('ol'); track.className='operations-track';
            [...supply,'Ekipman'].forEach((reward,i)=>{
                const cell=document.createElement('li'); cell.textContent=(i+1)+'. gün · '+reward;
                if(i===next) cell.setAttribute('aria-current','step');
                track.append(cell);
            });
            content.append(track);
            const already = state.day >= day;
            if(next===6 && !already) {
                for (const item of gear.filter(item=>item.rank===0)) button(item.name+' seç',()=>{
                    grant(state,item);state.stamps++;state.day=day;
                });
            } else button(already?'Bugünkü ikmal alındı':'İkmali al · '+supply[next]+' parça',()=>{
                state.parts+=supply[next];state.stamps++;state.day=day;
            },already);
            button('Çevrimdışı ikmali al · '+state.offline+' parça',()=>{
                state.parts+=state.offline;state.offline=0;
            },!state.offline);
        } else if (tab==='gear') {
            for(const item of gear) {
                const level=state.owned[item.id]||0, equipped=state.equipped[item.group]===item.id;
                line(item.slot+' · '+item.name+' · '+['Standart','Standart','Nadir','Nadir','Epik','Efsane'][item.rank]+(level?' · Sv. '+level:' · Kilitli'));
                if (!level) continue;
                button(equipped?'Takılı':'Tak',()=>{state.equipped[item.group]=item.id;},equipped);
                const cost=8+level*6;
                button(level>=5?'Son seviye':'Geliştir · '+cost,()=>{state.parts-=cost;state.owned[item.id]++;},level>=5||state.parts<cost);
            }
        } else if (tab==='tasks') {
            for(const [period,stat,target,xp,label] of tasks) {
                const bucket=state[period], count=Math.min(target,bucket[stat]||0), claim='claimed_'+stat;
                line(({daily:'Günlük',weekly:'Haftalık',career:'Gelişim'})[period]+' · '+label+' · '+count+'/'+target);
                button(bucket[claim]?'Alındı':xp+' sezon XP al',()=>{bucket[claim]=true;state.xp+=xp;},count<target||!!bucket[claim]);
            }
            const back=document.createElement('button');back.type='button';back.textContent='Savaşa dön';
            back.onclick=()=>panel.close();content.append(back);
        } else {
            const tier=Math.min(30,Math.floor(state.xp/XP_PER_TIER));
            line('Sinyal Sezonu · '+tier+'/30 · '+state.xp+' XP');
            const progress=document.createElement('progress');progress.max=30*XP_PER_TIER;progress.value=Math.min(progress.max,state.xp);progress.setAttribute('aria-label','Sezon ilerlemesi');content.append(progress);
            button('Hepsini al · '+((tier-state.claimed)*6)+' parça',()=>{
                state.parts+=(tier-state.claimed)*6;state.claimed=tier;
            },tier<=state.claimed);
            for(let level=1;level<=30;level++) line('Kademe '+level+' · 6 parça'+(level<=state.claimed?' · alındı':''));
        }
    }
    function mount() {
        const anchor=document.getElementById('hud-wave-card');
        if (!anchor) return;
        const open=document.createElement('button');open.id='operations-open';open.type='button';open.textContent='Operasyonlar';
        anchor.append(open);
        panel=document.createElement('dialog');panel.id='endless-operations';panel.setAttribute('aria-label','Endless operasyonları');
        panel.innerHTML='<form method="dialog"><button aria-label="Kapat">Kapat</button></form><nav aria-label="Operasyon menüsü"></nav><section></section>';
        for(const [id,label] of [['supply','İkmal'],['gear','Ekipman'],['tasks','Görevler'],['season','Sezon']]) {
            const b=document.createElement('button');b.type='button';b.textContent=label;
            b.onclick=()=>{tab=id;render();};panel.querySelector('nav').append(b);
        }
        document.body.append(panel);
        open.onclick=()=>{if(active()){render();panel.showModal();}};
        function heartbeat() {
            if (!active() || document.hidden || !cached) return;
            const state=load();state.activeAt=Date.now();persist();
        }
        window.setInterval(heartbeat,60000);
        window.addEventListener('pagehide',heartbeat);
    }
    window.EndlessOperations=Object.freeze({record,bonus});
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
    else mount();
})();
