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
    let cachedKey = '', cached = null, committed = null, blocked = false, panel, tab = 'supply';
    function counter(value, fallback = 0) {
        return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
    }

    function normalizeProgress(value) {
        const progress = {};
        if (Number.isSafeInteger(value?.period)) progress.period = value.period;
        for (const stat of ['waves', 'bosses', 'sectors']) {
            progress[stat] = counter(value?.[stat]);
            if (value?.['claimed_' + stat] === true) progress['claimed_' + stat] = true;
        }
        return progress;
    }

    function normalizeSave(saved, defaults) {
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
        const state = { ...defaults };
        state.revision = counter(saved.revision);
        if (saved.rush && typeof saved.rush === 'object' && !Array.isArray(saved.rush)) state.rush = { day:counter(saved.rush.day), step:Math.min(10,counter(saved.rush.step)), hp:Math.min(2,counter(saved.rush.hp)), result:['won','lost'].includes(saved.rush.result)?saved.rush.result:'', feedback:typeof saved.rush.feedback==='string'?saved.rush.feedback:'' };
        for (const key of ['day', 'stamps', 'parts', 'cleared', 'xp', 'claimed', 'season', 'activeAt', 'offline']) {
            state[key] = counter(saved[key], defaults[key]);
        }
        state.claimed = Math.min(state.claimed, 30);
        state.offline = Math.min(state.offline, 360);
        for (const key of ['daily', 'weekly', 'career']) state[key] = normalizeProgress(saved[key]);
        state.owned = {};
        state.equipped = {};
        for (const item of gear) {
            const level = counter(saved.owned?.[item.id]);
            if (!level) continue;
            state.owned[item.id] = Math.min(level, 5);
            if (saved.equipped?.[item.group] === item.id) state.equipped[item.group] = item.id;
        }
        return state;
    }

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
        blocked = false;
        if (window._verifySaveSignature && ((saved?.meta && !saved._sig) || (saved?._sig && !window._verifySaveSignature(saved)))) blocked = true;
        cached = normalizeSave(blocked ? null : saved, defaults);
        if (window.MetaModel) {
            if (saved && !saved.meta && !blocked) {
                try { if (!localStorage.getItem(key + ':legacy-backup')) localStorage.setItem(key + ':legacy-backup', JSON.stringify(saved)); }
                catch { blocked = true; }
            }
            cached.meta = !blocked && saved?.meta ? window.MetaModel.sanitizeMeta(saved.meta, now) : window.MetaModel.migrateLegacy(cached, now);
            cached.parts = cached.meta.currencies.parca;
        }
        committed = JSON.parse(JSON.stringify(cached));
        if (blocked && typeof showToast === 'function') showToast('Operasyon kaydı doğrulanamadı. Asıl kayıt korundu.');
        if (!window.MetaModel && cached.activeAt < now) {
            const hours = Math.floor(Math.min(12 * 3600000, Math.max(0, now - cached.activeAt)) / 3600000);
            cached.offline = Math.min(360, cached.offline + hours * Math.min(30, Math.max(0, cached.cleared)));
        }
        cached.activeAt = now;
        persist();
        return cached;
    }
    function persist() {
        if (blocked) return false;
        try {
            if (cached.meta && window.MetaModel) {
                if (cached.parts !== cached.meta.currencies.parca) {
                    const result = window.MetaModel.transaction(cached.meta, 'operations:' + (counter(cached.revision) + 1), 'operations', draft => {
                        if (!Number.isSafeInteger(cached.parts) || cached.parts < 0) return {ok:false,message:'Geçersiz parça işlemi.'};
                        draft.currencies.parca = cached.parts; return {ok:true};
                    });
                    if (!result.ok) throw new Error(result.message);
                    cached.meta = result.state;
                }
                cached.revision = counter(cached.revision) + 1;
                cached._sigVersion = 2;
                if (window._generateSaveSignature) cached._sig = window._generateSaveSignature(cached);
            }
            localStorage.setItem(cachedKey, JSON.stringify(cached));
            committed = JSON.parse(JSON.stringify(cached));
            return true;
        } catch {
            if (committed) cached = JSON.parse(JSON.stringify(committed));
            return false;
        }
    }
    function transactMeta(id, reason, mutate) {
        if (!active() || (typeof isDuplicateTab !== 'undefined' && isDuplicateTab)) return {ok:false,message:'Bu oturumda işlem yapılamaz.'};
        const state = load();
        if (blocked || !window.MetaModel) return {ok:false,message:'Kayıt doğrulanamadı. Asıl kayıt korundu.'};
        const result = window.MetaModel.transaction(state.meta, id, reason, mutate);
        if (!result.ok) return result;
        state.meta = result.state; state.parts = result.state.currencies.parca;
        if (!persist()) return {ok:false,message:'İşlem kaydedilemedi; kaynakların korunuyor.'};
        return result;
    }
    function openTab(next = 'supply') {
        if (!active() || !panel) return;
        if (window.MetaRuntime && ['supply','season'].includes(next)) { window.MetaRuntime.route(next); return; }
        tab = next; render(); if (!panel.open) panel.showModal();
    }
    function periods(state) {
        const day = window.MetaModel ? window.MetaModel.localDay(Date.now()) : Math.floor(Date.now()/DAY);
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
        if (!item || !state.owned[item.id]) return window.MetaRuntime?.bonus(stat) || 0;
        const equipped = Object.values(state.equipped).filter(id=>state.owned[id]);
        const set = equipped.filter(id=>gear[id]?.rank===item.rank).length >= 2 ? .02 : 0;
        return Math.min(.18,.025+item.rank*.01+(state.owned[item.id]-1)*.015+set) + (window.MetaRuntime?.bonus(stat) || 0);
    }
    function icon(name) {
        return '<svg class="operations-icon" aria-hidden="true" viewBox="0 0 80 80"><use href="assets/operations/icons.svg#'+name+'"></use></svg>';
    }
    function render() {
        if (!panel || !active()) return;
        const state = load(), day = periods(state), content = panel.querySelector('section');
        content.replaceChildren();
        content.dataset.view = tab;
        panel.querySelector('#operations-wallet').textContent = state.parts + ' PARÇA';
        let target = content;
        function card(title, meta, accent = '') {
            const node = document.createElement('article');
            node.className = 'operations-card';
            if (accent) node.dataset.accent = accent;
            const heading = document.createElement('h3');
            heading.textContent = title;
            const detail = document.createElement('p');
            detail.textContent = meta;
            const art = document.createElement('div');
            art.className = 'operations-card-art';
            const kind = accent.startsWith('gear') ? 'parts' : ({supply:'crate',boss:'boss',task:'tasks',season:'season'})[accent] || 'radar';
            art.innerHTML = icon(kind);
            node.append(art, heading, detail);
            content.append(node);
            target = node;
            return node;
        }
        panel.querySelectorAll('nav button').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.tab === tab));
        });
        function line(value) {
            const p = document.createElement('p'); p.textContent = value; target.append(p);
        }
        function button(label, action, blocked=false) {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = label; b.disabled = blocked;
            b.onclick = () => {
                if (!active() || ownerKey()!==cachedKey) { panel.close(); return; }
                const previous = JSON.stringify(state);
                if (blocked) { window.MetaUI?.notify('Kayıt doğrulanamadı; asıl kayıt korundu.'); return; }
                action();
                if (!persist()) {
                    cached = JSON.parse(previous);
                    if (typeof showToast === 'function') showToast('İkmal kaydedilemedi.');
                }
                render();
            };
            target.append(b);
            return b;
        }
        target = content;
        if (tab==='supply') {
            const next = state.stamps % 7, already = state.day >= day;
            const current = already ? (state.stamps + 6) % 7 : next;
            const hero = document.createElement('div');
            hero.className = 'operations-supply-hero';
            hero.innerHTML = '<div><span class="operations-eyebrow">İSTASYON İKMALİ</span><h3>Günlük ikmal</h3><p></p></div>';
            hero.querySelector('p').textContent = already ? 'Bugünkü teslimat alındı. Yarın görüşürüz, komutan.' : (next+1)+'. gün ödülün hazır, komutan.';
            content.append(hero);
            const track = document.createElement('ol'); track.className='operations-track';
            [...supply,'Ekipman'].forEach((reward,i)=>{
                const cell = document.createElement('li');
                const claimed = i < current || (already && i === current);
                cell.dataset.state = claimed ? 'claimed' : i === current ? 'ready' : 'locked';
                const dayLabel = document.createElement('small');
                dayLabel.textContent = (i+1) + '. gün';
                const art = document.createElement('span'); art.innerHTML = icon(i===6?'crate':'parts');
                const amount = document.createElement('strong');
                amount.textContent = typeof reward === 'number' ? reward+' parça' : 'Ekipman seç';
                const status = document.createElement('span'); status.className='operations-reward-state';
                status.textContent = claimed ? '✓ Alındı' : i===current ? 'Hazır' : i===6 ? 'Büyük ikmal' : 'Sıradaki';
                cell.append(dayLabel,art,amount,status);
                if(i===current) cell.setAttribute('aria-current','step');
                track.append(cell);
            });
            content.append(track);
            card(already ? 'Teslimat tamamlandı' : next===6 ? 'Ekipmanını seç' : supply[next]+' ekipman parçası',
                already ? 'Bir gün kaçırırsan ilerlemen sıfırlanmaz.' : 'Atölyede ekipmanlarını geliştirmek için kullan.', 'supply');
            if(next===6 && !already) {
                for (const item of gear.filter(item=>item.rank===0)) button(item.name+' seç',()=>{
                    const claimDay = periods(state);
                    if (state.day >= claimDay) return;
                    grant(state,item);state.stamps++;state.day=claimDay;
                });
            } else button(already?'Bugünkü ikmal alındı':'Ödülü al',()=>{
                const claimDay = periods(state);
                if (state.day >= claimDay) return;
                state.parts+=supply[next];state.stamps++;state.day=claimDay;
            },already).classList.add('operations-primary');
            card('Çevrimdışı ikmal', state.offline ? state.offline+' ekipman parçası depoda hazır.' : 'Sektör tamamla; uzaktayken istasyonun parça biriktirsin.', 'offline');
            line('En fazla 12 saat birikir.');
            button('İkmali topla · '+state.offline+' parça',()=>{
                state.parts+=state.offline;state.offline=0;
            },!state.offline).classList.add('operations-secondary');
        } else if (tab==='gear') {
            for(const item of gear) {
                const level=state.owned[item.id]||0, equipped=state.equipped[item.group]===item.id;
                card(item.name, item.slot+' · '+['Standart','Standart','Nadir','Nadir','Epik','Efsane'][item.rank]+(level?' · Sv. '+level:' · Kilitli'), 'gear'+item.rank);
                target.querySelector('.operations-card-art').innerHTML = icon(['weapon','reactor','armor','radar'][item.group]);
                target.dataset.owned = String(!!level);
                if (!level) continue;
                button(equipped?'Çıkar':'Tak',()=>{
                    if (state.equipped[item.group] === item.id) delete state.equipped[item.group];
                    else state.equipped[item.group] = item.id;
                });
                const cost=8+level*6;
                button(level>=5?'Son seviye':'Geliştir · '+cost,()=>{if(state.parts<cost||state.owned[item.id]>=5){window.MetaUI?.notify('Yetersiz parça veya son seviye.');return;}state.parts-=cost;state.owned[item.id]++;},level>=5||state.parts<cost);
            }
        } else if (tab==='boss') {
            card('Günlük Boss Akını', 'Saldırı işaretini oku ve doğru hamleyi seç.', 'boss');
            renderBoss(state, day, line, button, target);
        } else if (tab==='tasks') {
            for(const [period,stat,target,xp,label] of tasks) {
                const bucket=state[period], count=Math.min(target,bucket[stat]||0), claim='claimed_'+stat;
                card(label, ({daily:'Günlük',weekly:'Haftalık',career:'Gelişim'})[period]+' · '+count+'/'+target, 'task');
                const progress=document.createElement('progress');progress.max=target;progress.value=count;progress.setAttribute('aria-label',label);content.lastElementChild.append(progress);
                button(bucket[claim]?'Alındı':xp+' sezon XP al',()=>{if(bucket[claim]||(bucket[stat]||0)<target)return;bucket[claim]=true;state.xp+=xp;if(state.meta)state.meta.season.xp+=xp;},count<target||!!bucket[claim]);
            }
            const back=document.createElement('button');back.type='button';back.textContent='Savaşa dön';
            back.onclick=()=>panel.close();content.append(back);
        } else {
            const tier=Math.min(30,Math.floor(state.xp/XP_PER_TIER));
            card('Sinyal Sezonu', tier+'/30 kademe · '+state.xp+' XP', 'season');
            const progress=document.createElement('progress');progress.max=30*XP_PER_TIER;progress.value=Math.min(progress.max,state.xp);progress.setAttribute('aria-label','Sezon ilerlemesi');target.append(progress);
            button('Hepsini al · '+((tier-state.claimed)*6)+' parça',()=>{
                state.parts+=(tier-state.claimed)*6;state.claimed=tier;
            },tier<=state.claimed);
            for(let level=1;level<=30;level++) card('Kademe '+level, '6 parça · '+(level<=state.claimed?'Alındı':level<=tier?'Hazır':'Kilitli'), 'season');
        }
    }
    function eventBriefing(now = Date.now()) {
        const day = window.MetaModel.localDay(now);
        const end = new Date(now);
        const todayReset = new Date(now);
        todayReset.setHours(window.MetaConfig.daily.resetHour, 0, 0, 0);
        if (now >= todayReset.getTime()) end.setDate(end.getDate() + 1);
        end.setHours(window.MetaConfig.daily.resetHour, 0, 0, 0);
        const boss = window.EndlessBossRush.challenge(day);
        const fight = load().rush;
        return {day, endsAt:end.getTime(), boss:boss.name, reward:gear[boss.item].name+' veya 8 Parça', result:fight?.day===day ? fight.result : '',
            fight:fight?.day===day ? {...fight} : null, turns:boss.pattern.length, cue:boss.pattern[fight?.step || 0]};
    }

    function applyRushMove(state, day, move) {
        const fight = state.rush?.day === day ? state.rush : null;
        if (move === 'start' && !fight) {
            state.rush = {day,step:0,hp:2,result:''};
        } else if (fight && !fight.result && ['strike','guard'].includes(move)) {
            state.rush = window.EndlessBossRush.turn(fight, move);
            if (state.rush.result === 'won') grant(state, gear[window.EndlessBossRush.challenge(day).item]);
        }
    }
    function raidMove(day, move) {
        if (!active() || (typeof isDuplicateTab !== 'undefined' && isDuplicateTab)) return {ok:false,message:'Bu oturumda akın yapılamaz.'};
        const state = load();
        if (blocked) return {ok:false,message:'Kayıt doğrulanamadı. Asıl kayıt korundu.'};
        if (day !== window.MetaModel.localDay(Date.now())) return {ok:false,message:'Bu akın sona erdi.'};
        const previous = state.rush;
        applyRushMove(state, day, move);
        if (state.rush !== previous && !persist()) return {ok:false,message:'Hamle kaydedilemedi.'};
        return {ok:true};
    }

    function renderBoss(state, day, line, button, content) {
        const rush = window.EndlessBossRush;
        const boss = rush.challenge(day);
        const fight = state.rush?.day === day ? state.rush : null;
        line(boss.name + ' · Günlük boss akını');
        line('Zafer ödülü · ' + gear[boss.item].name + ' veya 8 parça');
        if (!fight) {
            button('Akını başlat', () => applyRushMove(state, day, 'start'));
            return;
        }
        if (fight.result) {
            line(fight.result === 'won' ? 'Zafer · Ödül alındı.' : 'Yenildin · Sonraki akın yarın.');
            return;
        }
        line('Gövde bütünlüğü ' + fight.hp + '/2 · Hamle ' + (fight.step+1) + '/' + boss.pattern.length);
        if (fight.feedback) line(fight.feedback);
        const cue = document.createElement('p');
        cue.setAttribute('role','status');
        cue.textContent = boss.pattern[fight.step] === 'guard' ? 'Boss saldırıya hazırlanıyor.' : 'Boss’un zırhı açık.';
        content.append(cue);
        for (const [id,label] of [['strike','Ateş et'],['guard','Kalkan kur']]) {
            button(label, () => applyRushMove(state, day, id));
        }
    }
    function mount() {
        const anchor=document.getElementById('hud-wave-card');
        if (!anchor) return;
        const open=document.createElement('button');open.id='operations-open';open.type='button';open.textContent='Operasyonlar';
        anchor.append(open);
        panel=document.createElement('dialog');panel.id='endless-operations';panel.setAttribute('aria-label','Endless operasyonları');
        panel.innerHTML='<header class="operations-header"><div><span class="operations-eyebrow">LOST SIGNAL / KOMUTA GÜVERTESİ</span><h2>OPERASYON MERKEZİ</h2></div><span id="operations-wallet"></span><form method="dialog"><button aria-label="Kapat" autofocus>×</button></form></header><div class="operations-layout"><nav aria-label="Operasyon menüsü"></nav><section aria-label="Operasyon içeriği" tabindex="-1"></section></div>';
        panel.addEventListener('close',()=>{open.focus({preventScroll:true});});
        for(const [id,label] of [['supply','İkmal'],['gear','Ekipman'],['boss','Boss Akını'],['tasks','Görevler'],['season','Sezon']]) {
            const b=document.createElement('button');b.type='button';b.innerHTML=icon(({supply:'crate',gear:'armor',boss:'boss',tasks:'tasks',season:'season'})[id])+'<span>'+label+'</span>';b.dataset.tab=id;
            b.onclick=()=>{if(window.MetaRuntime&&['supply','season'].includes(id)){panel.close();window.MetaRuntime.route(id);return;}tab=id;render();panel.querySelector('section').scrollTop=0;};panel.querySelector('nav').append(b);
        }
        document.body.append(panel);
        open.onclick=()=>openTab();
        function heartbeat() {
            if (!active() || document.hidden || !cached) return;
            if (typeof isPaused !== 'undefined' && isPaused) return;
            const state=load();state.activeAt=Math.max(state.activeAt,Date.now());persist();
        }
        window.setInterval(heartbeat,60000);
        window.addEventListener('pagehide',heartbeat);
    }
    window.EndlessOperations=Object.freeze({record,bonus,eventBriefing,raidMove,open:openTab,read:()=>load(),transactMeta});
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
    else mount();
})();
