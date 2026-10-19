// ==========================================
// BÖLÜM: ARAYÜZ (UI), MENÜLER VE MOBİL HUD DÜZENİ
// ==========================================

// EKRANDA SİYAH KALMA DURUMUNDA HATAYI GÖSTEREN TESPİT SİSTEMİ
window.addEventListener('error', function (e) {
    let errBanner = document.getElementById('debug-error-banner');
    if (!errBanner) {
        errBanner = document.createElement('div');
        errBanner.id = 'debug-error-banner';
        errBanner.style.cssText = 'position:fixed;bottom:55px;left:10px;right:10px;background:rgba(185,28,28,0.95);color:#fff;padding:10px 14px;border-radius:10px;font-size:12px;font-family:monospace;z-index:99999;border:1px solid #f87171;box-shadow:0 10px 25px rgba(0,0,0,0.5);';
        document.body.appendChild(errBanner);
    }
    const file = e.filename ? e.filename.split('/').pop() : 'Bilinmeyen Dosya';
    errBanner.innerHTML = `⚠️ <b>JS HATASI (${file} - Satır:${e.lineno}):</b> ${e.message}`;
});

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Eksik olan renderItemIconHTML fonksiyonu (Tam Korumalı Yedekli Sürüm)
function renderItemIconHTML(item, sizeCls = 'w-10 h-10') {
    if (!item) return `<div class="${sizeCls} rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">❓</div>`;

    if (typeof window.customRenderItemIcon === 'function') {
        return window.customRenderItemIcon(item, sizeCls);
    }

    if (item.svg) {
        return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-inner overflow-hidden">${item.svg}</div>`;
    }

    if (item.img || item.image) {
        return `<img src="${item.img || item.image}" alt="${item.name || ''}" class="${sizeCls} rounded-xl object-contain bg-slate-950/90 border border-white/10 p-1 shrink-0">`;
    }

    const colorCls = item.color || 'text-amber-400';
    if (item.icon && item.icon.includes('fa-')) {
        return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center shrink-0 shadow-inner ${colorCls}"><i class="${item.icon} text-lg"></i></div>`;
    }

    const emoji = item.emoji || item.icon || '🔮';
    return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center shrink-0 shadow-inner text-lg">${emoji}</div>`;
}

function toggleUpgradeDrawer() {
    isDrawerOpen = !isDrawerOpen;
    const drawer = document.getElementById('upgrade-drawer');
    if (!drawer) return;
    if (isDrawerOpen) drawer.classList.remove('-translate-x-full');
    else drawer.classList.add('-translate-x-full');
    syncHudPositionsWithDrawer();
}

function syncHudPositionsWithDrawer() {
    const topBar = document.getElementById('hud-top-bar');
    const quickStats = document.getElementById('hud-quick-stats');
    if (!topBar || !quickStats) return;

    if (isDrawerOpen) {
        topBar.classList.remove('left-2', 'sm:left-3');
        topBar.classList.add('left-2', 'sm:left-[442px]');

        quickStats.classList.remove('left-2', 'bottom-2');
        quickStats.classList.add('right-2', 'bottom-11', 'sm:left-[442px]', 'sm:right-auto', 'sm:bottom-2');
    } else {
        topBar.classList.remove('sm:left-[442px]');
        topBar.classList.add('left-2', 'sm:left-3');

        quickStats.classList.remove('right-2', 'bottom-11', 'sm:left-[442px]', 'sm:right-auto', 'sm:bottom-2');
        quickStats.classList.add('left-2', 'bottom-2');
    }
}

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (!Number.isFinite(num)) return '∞';
    const abs = Math.abs(num);
    if (abs < 1000) return Math.floor(num).toString();

    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const tier = Math.floor(Math.log10(abs) / 3);

    if (tier < suffixes.length) {
        const scaled = num / Math.pow(10, tier * 3);
        return (scaled >= 100 ? scaled.toFixed(1) : scaled.toFixed(2)) + suffixes[tier];
    }
    const exp = Math.floor(Math.log10(abs));
    const mantissa = (num / Math.pow(10, exp)).toFixed(2);
    return `${mantissa}e${exp}`;
}

function setDeviceMode(mode) {
    if (typeof game === 'undefined') return;
    game.deviceMode = mode;
    applyBodyClasses();
    ['phone', 'tablet', 'pc'].forEach(m => {
        const btn = document.getElementById(`dev-${m}`);
        if (btn) btn.className = m === mode ? 'py-2 rounded-xl bg-blue-600 text-white text-xs font-tech font-bold border border-blue-500 transition' : 'py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-tech font-bold border border-slate-700 transition';
    });
    showToast(`Cihaz modu: ${mode.toUpperCase()} olarak ayarlandı.`);
    if (typeof resizeCanvas === 'function') resizeCanvas();
}

function applyBodyClasses() {
    const body = document.getElementById('main-body');
    if (!body || typeof game === 'undefined') return;
    const dev = game.deviceMode || 'pc';
    body.className = `h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden device-${dev} color-pastel`;
}

function buildUpgradesUI() {
    if (typeof UPGRADE_DEFS === 'undefined' || typeof game === 'undefined') return;
    const categories = { attack: 'attack-upgrades-list', defense: 'defense-upgrades-list', economy: 'economy-upgrades-list' };
    for (const [cat, containerId] of Object.entries(categories)) {
        const container = document.getElementById(containerId);
        if (!container) continue;
        container.innerHTML = '';
        for (const [key, def] of Object.entries(UPGRADE_DEFS)) {
            if (def.category !== cat) continue;
            const lvl = game.upgrades[key] || 0;
            const info = getBulkUpgradeInfo(key);
            let btnLabel = info.maxed ? 'MAKS' : (info.lockedReason ? info.lockedReason : `${formatNumber(info.totalCost)} 🪙`);
            let subLabel = (!info.maxed && !info.lockedReason && info.count > 1) ? `+${info.count} Sv` : '';

            container.innerHTML += `
                <div class="premium-card p-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 ${def.color}">
                            <i class="${def.icon} text-sm"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="font-tech font-bold text-xs sm:text-sm text-white truncate">${def.name}</span>
                                <span id="upg-lvl-${key}" class="text-[10px] font-tech px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Sv.${lvl}</span>
                            </div>
                            <div class="text-[10px] text-slate-400 leading-tight">${def.desc}</div>
                            <div id="upg-val-${key}" class="text-[11px] font-tech font-bold text-blue-300">${def.getValueText(lvl)}</div>
                        </div>
                    </div>
                    <button id="upg-btn-${key}" onclick="buyUpgrade('${key}')" ${(!info.canAfford || info.maxed || info.lockedReason) ? 'disabled' : ''} class="upgrade-btn px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-tech font-bold text-xs shrink-0 min-w-[82px] text-center">
                        <div id="upg-cost-${key}">${btnLabel}</div>
                        <div id="upg-sub-${key}" class="text-[9px] text-blue-200">${subLabel}</div>
                    </button>
                </div>
            `;
        }
    }
    buildCompanionsUI();
    buildPrestigeUI();
}

function buyUpgrade(key) {
    const info = getBulkUpgradeInfo(key);
    if (info.maxed || info.lockedReason || !info.canAfford) return;
    const prevMaxHp = getTowerMaxHp();
    game.gold -= info.totalCost;
    game.upgrades[key] += info.count;
    if (key === 'maxHp') {
        const newMaxHp = getTowerMaxHp();
        tower.maxHp = newMaxHp;
        tower.hp = Math.min(newMaxHp, tower.hp + Math.max(0, newMaxHp - prevMaxHp));
    }
    if (key === 'shield') {
        tower.maxShield = getTowerMaxShield();
        tower.shield = tower.maxShield;
    }
    refreshUpgradeButtonsState();
    updateHUD();
    saveGame(true);
}

function refreshUpgradeButtonsState() {
    if (typeof UPGRADE_DEFS === 'undefined' || typeof game === 'undefined') return;
    for (const [key, def] of Object.entries(UPGRADE_DEFS)) {
        const lvl = game.upgrades[key] || 0;
        const info = getBulkUpgradeInfo(key);
        const btn = document.getElementById(`upg-btn-${key}`),
              lvlEl = document.getElementById(`upg-lvl-${key}`),
              valEl = document.getElementById(`upg-val-${key}`),
              costEl = document.getElementById(`upg-cost-${key}`),
              subEl = document.getElementById(`upg-sub-${key}`);
        if (lvlEl) lvlEl.textContent = `Sv.${lvl}`;
        if (valEl) valEl.textContent = def.getValueText(lvl);
        if (costEl) costEl.textContent = info.maxed ? 'MAKS' : (info.lockedReason ? info.lockedReason : `${formatNumber(info.totalCost)} 🪙`);
        if (subEl) subEl.textContent = (!info.maxed && !info.lockedReason && info.count > 1) ? `+${info.count} Sv` : '';
        if (btn) btn.disabled = !info.canAfford || info.maxed || Boolean(info.lockedReason);
    }
    buildCompanionsUI();
    updatePrestigeUI();
    updateLootboxCollectionCounters();
}

function renderCompanionStars(starCount) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= starCount) html += `<i class="fa-solid fa-star text-amber-400 text-[10px] drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"></i>`;
        else html += `<i class="fa-regular fa-star text-slate-600 text-[10px]"></i>`;
    }
    return html;
}

function buildCompanionsUI() {
    const list = document.getElementById('companions-list');
    if (!list || typeof COMPANION_DEFS === 'undefined') return;
    list.innerHTML = '';
    if (typeof COMPANION_SKIN_DATABASE !== 'undefined') {
        const compSkinDef = COMPANION_SKIN_DATABASE[game.activeCompanionSkin || 'default_tech'] || COMPANION_SKIN_DATABASE.default_tech;
        const compSkinLabel = document.getElementById('comp-tab-active-skin');
        if (compSkinLabel && compSkinDef) compSkinLabel.textContent = `${compSkinDef.emoji} ${compSkinDef.name}`;
    }

    for (const [key, def] of Object.entries(COMPANION_DEFS)) {
        const st = (game.companions && game.companions[key]) ? game.companions[key] : { unlocked: false, level: 0 };
        const star = st.unlocked ? Math.min(5, Math.max(1, st.level || 1)) : 0;
        const isMaxed = star >= 5;
        const cost = isMaxed ? 0 : def.starCosts[star];
        const nextStar = star + 1;

        list.innerHTML += `
            <div class="premium-card p-3 flex items-center justify-between gap-2 ${isMaxed ? 'border-amber-500/40' : ''}">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${def.badgeClass}">
                        <i class="${def.icon} text-sm"></i>
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-tech font-bold text-xs sm:text-sm text-white">${def.name}</span>
                            <div class="flex items-center gap-0.5 bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/5">
                                ${renderCompanionStars(star)}
                            </div>
                        </div>
                        <div class="text-[10px] text-slate-400 leading-tight">${def.desc}</div>
                        <div class="text-[10px] font-tech font-bold ${star > 0 ? 'text-cyan-300' : 'text-amber-300'}">${def.getStarSummary(star)}</div>
                    </div>
                </div>
                <button onclick="buyCompanion('${key}')" ${(isMaxed || game.crystals < cost) ? 'disabled' : ''} class="upgrade-btn px-3 py-2 rounded-xl ${isMaxed ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} font-tech font-bold text-xs shrink-0 min-w-[92px] text-center">
                    ${isMaxed ? '5★ MAKS' : `<div>${star === 0 ? '1★ Aç' : `${nextStar}★ Yükselt`}</div><div class="text-[10px] text-cyan-100">${formatNumber(cost)} 💎</div>`}
                </button>
            </div>
        `;
    }
}

function buyCompanion(key) {
    const def = COMPANION_DEFS[key];
    const st = game.companions[key];
    const star = st.unlocked ? Math.min(5, Math.max(1, st.level || 1)) : 0;
    if (star >= 5) return;

    const cost = def.starCosts[star];
    if (game.crystals < cost) return;

    game.crystals -= cost;
    if (!st.unlocked) {
        st.unlocked = true;
        st.level = 1;
        showToast(`⭐ ${def.name} (1★) yörüngeye yerleşti!`);
    } else {
        st.level = Math.min(5, star + 1);
        showToast(`🌟 ${def.name} ${st.level}★ seviyesine yükseldi!`);
    }
    buildCompanionsUI();
    updateHUD();
    saveGame(true);
}

function buildPrestigeUI() {
    const list = document.getElementById('prestige-upgrades-list');
    if (!list || typeof PRESTIGE_DEFS === 'undefined') return;
    list.innerHTML = '';
    for (const [key, def] of Object.entries(PRESTIGE_DEFS)) {
        const lvl = game.prestigeUpgrades[key] || 0;
        const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lvl));
        const maxed = lvl >= def.maxLevel;
        list.innerHTML += `
            <div class="premium-card p-2.5 flex items-center justify-between gap-2">
                <div>
                    <div class="font-tech font-bold text-xs text-white"><i class="${def.icon} text-purple-400 mr-1"></i>${def.name} <span class="text-[10px] text-purple-300">Sv.${lvl}</span></div>
                    <div class="text-[10px] text-slate-400">${def.desc}</div>
                    <div class="text-[10px] font-tech text-purple-300">${def.getEffectText(lvl)}</div>
                </div>
                <button onclick="buyPrestigeUpgrade('${key}')" ${maxed || game.souls < cost ? 'disabled' : ''} class="upgrade-btn px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs shrink-0">${maxed ? 'MAKS' : `${cost} 🔥`}</button>
            </div>
        `;
    }
    updatePrestigeUI();
}

function setBuyMultiplier(val) {
    buyMultiplier = val;
    [1, 5, 10, 'MAX'].forEach(m => {
        const btn = document.getElementById(`mult-${m}`);
        if (btn) btn.className = m === val ? 'px-2.5 py-0.5 rounded text-xs font-tech font-bold bg-blue-600 text-white transition' : 'px-2.5 py-0.5 rounded text-xs font-tech font-bold text-slate-400 hover:text-white transition';
    });
    refreshUpgradeButtonsState();
}

function updatePrestigeUI() {
    if (typeof game === 'undefined' || typeof getMinPrestigeWave !== 'function') return;
    const countEl = document.getElementById('ui-prestige-count');
    const pendingEl = document.getElementById('ui-pending-souls');
    const minWaveEl = document.getElementById('ui-prestige-min-wave');
    const actionBtn = document.getElementById('btn-prestige-action');

    if (countEl) countEl.textContent = game.stats.prestiges;
    const minWave = getMinPrestigeWave();
    if (minWaveEl) minWaveEl.textContent = `Gereken: Dalga ${minWave}`;

    const pending = calculatePendingSouls();
    if (pendingEl) pendingEl.textContent = `+${formatNumber(pending)} Ruh`;

    if (actionBtn) {
        if (game.wave >= minWave) {
            actionBtn.disabled = false;
            actionBtn.classList.remove('bg-slate-700', 'text-slate-400');
            actionBtn.classList.add('bg-purple-600', 'hover:bg-purple-500', 'text-white');
        } else {
            actionBtn.disabled = true;
            actionBtn.classList.add('bg-slate-700', 'text-slate-400');
            actionBtn.classList.remove('bg-purple-600', 'hover:bg-purple-500', 'text-white');
        }
    }
}

function openPrestigeConfirm() {
    const pending = calculatePendingSouls();
    if (pending <= 0) {
        showToast(`Evrim için en az Dalga ${getMinPrestigeWave()} olmalısın.`);
        return;
    }
    openConfirmModal('Sıfırlama (Prestij)', `Dalgan ${getStartWaveLevel()}'e dönecek ancak ${formatNumber(pending)} Ruh Taşı kazanacaksın. Onaylıyor musun?`, () => {
        game.souls += pending;
        game.stats.prestiges++;
        game.wave = getStartWaveLevel();
        game.highestWave = Math.max(game.highestWave, game.wave);
        game.waveKills = 0;
        game.gold = game.wave === 1 ? 25 : Math.round(25 + getWaveBaseGold(game.wave) * 6 * getGoldMultiplier());

        game.upgrades = {
            damage: 1, attackSpeed: 1, range: 1, critChance: 0, critMult: 1, multishot: 0, bounce: 0, knockback: 0,
            maxHp: 1, hpRegen: 1, armor: 0, thorns: 0, shield: 0, lifesteal: 0,
            goldBonus: 0, waveGold: 0, crystalChance: 0, interest: 0
        };

        tower.maxHp = getTowerMaxHp();
        tower.hp = tower.maxHp;
        tower.maxShield = getTowerMaxShield();
        tower.shield = tower.maxShield;

        enemies = [];
        projectiles = [];

        buildUpgradesUI();
        updateHUD();
        saveGame(true);
        showToast(`Evrimleşildi! +${formatNumber(pending)} Ruh Taşı kazanıldı.`);
    });
}

function buyPrestigeUpgrade(key) {
    const def = PRESTIGE_DEFS[key];
    const lvl = game.prestigeUpgrades[key] || 0;
    const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lvl));

    if (lvl >= def.maxLevel || game.souls < cost) return;

    game.souls -= cost;
    game.prestigeUpgrades[key] = lvl + 1;

    buildPrestigeUI();
    refreshUpgradeButtonsState();
    updateHUD();
    saveGame(true);
}

let activeMiniGame = 'roulette';
let bjState = { playerHand: [], dealerHand: [], active: false };
const ROULETTE_SECTORS = [{ num: '0', color: 'green', hex: '#10b981' }, { num: '32', color: 'red', hex: '#dc2626' }, { num: '15', color: 'black', hex: '#1e293b' }, { num: '19', color: 'red', hex: '#dc2626' }, { num: '4', color: 'black', hex: '#1e293b' }, { num: '21', color: 'red', hex: '#dc2626' }, { num: '2', color: 'black', hex: '#1e293b' }, { num: '25', color: 'red', hex: '#dc2626' }, { num: '17', color: 'black', hex: '#1e293b' }, { num: '34', color: 'red', hex: '#dc2626' }, { num: '6', color: 'black', hex: '#1e293b' }, { num: '27', color: 'red', hex: '#dc2626' }, { num: '13', color: 'black', hex: '#1e293b' }, { num: '36', color: 'red', hex: '#dc2626' }, { num: '11', color: 'black', hex: '#1e293b' }];
let rouletteAnim = { spinning: false, wheelAngle: 0, ballAngle: 0, ballRadius: 72, startTime: 0, duration: 2800, startWheelAngle: 0, targetWheelAngle: 0, startBallAngle: 0, targetBallAngle: 0, winningSector: null, userChoice: null, betAmount: 0 };

function drawRouletteWheel() {
    const rCanvas = document.getElementById('rouletteCanvas');
    if (!rCanvas) return;
    const rCtx = rCanvas.getContext('2d');
    const cx = rCanvas.width / 2, cy = rCanvas.height / 2, outerR = 85, innerR = 32, sliceAngle = (Math.PI * 2) / ROULETTE_SECTORS.length;
    rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
    rCtx.beginPath(); rCtx.arc(cx, cy, outerR + 3, 0, Math.PI * 2); rCtx.fillStyle = '#78350f'; rCtx.fill();
    rCtx.save(); rCtx.translate(cx, cy); rCtx.rotate(rouletteAnim.wheelAngle);
    for (let i = 0; i < ROULETTE_SECTORS.length; i++) {
        const sec = ROULETTE_SECTORS[i], startA = i * sliceAngle, endA = startA + sliceAngle;
        rCtx.beginPath(); rCtx.moveTo(0, 0); rCtx.arc(0, 0, outerR, startA, endA); rCtx.closePath(); rCtx.fillStyle = sec.hex; rCtx.fill(); rCtx.strokeStyle = '#fbbf24'; rCtx.lineWidth = 1; rCtx.stroke();
        rCtx.save(); rCtx.rotate(startA + sliceAngle / 2); rCtx.fillStyle = '#ffffff'; rCtx.font = "bold 9px 'Rajdhani', sans-serif"; rCtx.textAlign = 'center'; rCtx.textBaseline = 'middle'; rCtx.fillText(sec.num, outerR - 14, 0); rCtx.restore();
    }
    rCtx.beginPath(); rCtx.arc(0, 0, innerR, 0, Math.PI * 2); rCtx.fillStyle = '#0f172a'; rCtx.fill(); rCtx.strokeStyle = '#f59e0b'; rCtx.lineWidth = 2.5; rCtx.stroke();
    rCtx.strokeStyle = '#fbbf24'; rCtx.lineWidth = 2; rCtx.beginPath(); rCtx.moveTo(-18, 0); rCtx.lineTo(18, 0); rCtx.moveTo(0, -18); rCtx.lineTo(0, 18); rCtx.stroke();
    rCtx.beginPath(); rCtx.arc(0, 0, 6, 0, Math.PI * 2); rCtx.fillStyle = '#fbbf24'; rCtx.fill(); rCtx.restore();
    rCtx.save(); rCtx.translate(cx, cy); const bx = Math.cos(rouletteAnim.ballAngle) * rouletteAnim.ballRadius, by = Math.sin(rouletteAnim.ballAngle) * rouletteAnim.ballRadius;
    rCtx.shadowColor = '#ffffff'; rCtx.shadowBlur = 6; rCtx.beginPath(); rCtx.arc(bx, by, 5.5, 0, Math.PI * 2); rCtx.fillStyle = '#f8fafc'; rCtx.fill(); rCtx.strokeStyle = '#94a3b8'; rCtx.lineWidth = 1; rCtx.stroke(); rCtx.restore();
}

function updateRouletteAnimation(now) {
    if (!rouletteAnim.spinning) return;
    const elapsed = now - rouletteAnim.startTime, t = Math.min(1, elapsed / rouletteAnim.duration), ease = 1 - Math.pow(1 - t, 3);
    rouletteAnim.wheelAngle = rouletteAnim.startWheelAngle + (rouletteAnim.targetWheelAngle - rouletteAnim.startWheelAngle) * ease;
    rouletteAnim.ballAngle = rouletteAnim.startBallAngle + (rouletteAnim.targetBallAngle - rouletteAnim.startBallAngle) * ease;
    rouletteAnim.ballRadius = 76 - ease * 18;
    drawRouletteWheel();
    if (t >= 1) { rouletteAnim.spinning = false; finishRouletteSpin(); }
}

function switchMiniGame(gameType) {
    activeMiniGame = gameType;
    const rEl = document.getElementById('mg-roulette'), bEl = document.getElementById('mg-blackjack');
    if (rEl) rEl.classList.toggle('hidden', gameType !== 'roulette');
    if (bEl) bEl.classList.toggle('hidden', gameType !== 'blackjack');
    const rBtn = document.getElementById('mg-btn-roulette'), bBtn = document.getElementById('mg-btn-blackjack');
    if (rBtn) rBtn.className = gameType === 'roulette' ? 'py-2 rounded-xl bg-amber-600 text-white font-tech font-bold text-xs transition' : 'py-2 rounded-xl bg-slate-800 text-slate-300 font-tech font-bold text-xs transition';
    if (bBtn) bBtn.className = gameType === 'blackjack' ? 'py-2 rounded-xl bg-amber-600 text-white font-tech font-bold text-xs transition' : 'py-2 rounded-xl bg-slate-800 text-slate-300 font-tech font-bold text-xs transition';
    if (gameType === 'roulette') drawRouletteWheel();
}

function setCasinoBetVal(val) {
    const betInp = document.getElementById('casino-bet');
    if (betInp) betInp.value = val;
}

function playRoulette(choice) {
    if (rouletteAnim.spinning) { showToast('Çark zaten dönüyor!'); return; }
    const betInp = document.getElementById('casino-bet');
    const bet = parseInt(betInp ? betInp.value : 0) || 0;
    if (bet <= 0 || bet > game.crystals) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= bet; updateHUD();
    const winIndex = Math.floor(Math.random() * ROULETTE_SECTORS.length), winSec = ROULETTE_SECTORS[winIndex], sliceAngle = (Math.PI * 2) / ROULETTE_SECTORS.length;
    rouletteAnim.spinning = true; rouletteAnim.startTime = performance.now(); rouletteAnim.duration = 2600; rouletteAnim.userChoice = choice; rouletteAnim.betAmount = bet; rouletteAnim.winningSector = winSec;
    rouletteAnim.startWheelAngle = rouletteAnim.wheelAngle % (Math.PI * 2); rouletteAnim.targetWheelAngle = (-Math.PI / 2 - (winIndex * sliceAngle + sliceAngle / 2)) + Math.PI * 2 * 5;
    rouletteAnim.startBallAngle = rouletteAnim.ballAngle % (Math.PI * 2); rouletteAnim.targetBallAngle = -Math.PI / 2 - Math.PI * 2 * 6;
    setElText('roulette-wheel-display', 'ÇARK DÖNÜYOR...');
    const resEl = document.getElementById('roulette-result');
    if (resEl) resEl.innerHTML = '<span class="text-amber-300 animate-pulse">Top dönüyor, bol şans!</span>';
    ['red', 'green', 'black'].forEach(c => { const b = document.getElementById(`btn-roul-${c}`); if (b) b.disabled = true; });
}

function finishRouletteSpin() {
    ['red', 'green', 'black'].forEach(c => { const b = document.getElementById(`btn-roul-${c}`); if (b) b.disabled = false; });
    const winSec = rouletteAnim.winningSector, resultColor = winSec.color, mult = resultColor === 'green' ? 14 : 2;
    const display = document.getElementById('roulette-wheel-display'), resText = document.getElementById('roulette-result');
    if (display) {
        display.textContent = `${resultColor === 'green' ? 'YEŞİL' : (resultColor === 'red' ? 'KIRMIZI' : 'SİYAH')} (${winSec.num})`;
        display.className = `font-tech font-bold text-sm py-1 px-3 rounded-lg border border-slate-800 shadow-inner ${resultColor === 'green' ? 'text-emerald-400 bg-emerald-950/40' : (resultColor === 'red' ? 'text-red-400 bg-red-950/40' : 'text-slate-200 bg-slate-950')}`;
    }
    if (rouletteAnim.userChoice === resultColor) {
        const win = rouletteAnim.betAmount * mult; game.crystals += win;
        if (resText) resText.innerHTML = `<span class="text-emerald-400 font-bold">KAZANDIN! +${win} 💎</span>`;
        showToast(`Rulet Kazancı: +${win} Kristal!`);
    } else if (resText) {
        resText.innerHTML = `<span class="text-red-400 font-bold">KAYBETTİN! -${rouletteAnim.betAmount} 💎</span>`;
    }
    updateHUD(); refreshUpgradeButtonsState(); saveGame(true);
}

function drawCard() {
    const suits = ['♠', '♥', '♦', '♣'], vals = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const v = vals[Math.floor(Math.random() * vals.length)], s = suits[Math.floor(Math.random() * suits.length)];
    return { v, s, score: ['J','Q','K'].includes(v) ? 10 : (v === 'A' ? 11 : parseInt(v)), isRed: s === '♥' || s === '♦' };
}
function calcHand(hand) {
    let sum = hand.reduce((a, c) => a + c.score, 0), aces = hand.filter(c => c.v === 'A').length;
    while (sum > 21 && aces > 0) { sum -= 10; aces--; } return sum;
}
function renderCardHTML(card, hidden = false) {
    if (hidden) return `<div class="playing-card bg-indigo-900 border-indigo-700 text-indigo-300 items-center justify-center font-bold text-lg">?</div>`;
    return `<div class="playing-card ${card.isRed ? 'card-red' : ''}"><span>${card.v}</span><span class="text-center text-sm">${card.s}</span><span class="self-end rotate-180">${card.v}</span></div>`;
}

function startBlackjack() {
    const betInp = document.getElementById('casino-bet');
    const bet = parseInt(betInp ? betInp.value : 0) || 0;
    if (bet <= 0 || bet > game.crystals) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= bet; bjState = { bet, active: true, playerHand: [drawCard(), drawCard()], dealerHand: [drawCard(), drawCard()] };
    const stEl = document.getElementById('bj-actions-start'), plEl = document.getElementById('bj-actions-play');
    if (stEl) stEl.classList.add('hidden');
    if (plEl) plEl.classList.remove('hidden');
    updateBlackjackUI(false); updateHUD();
}

function hitBlackjack() {
    if (!bjState.active) return; bjState.playerHand.push(drawCard());
    if (calcHand(bjState.playerHand) > 21) endBlackjack('Bust! 21\'i geçtin, kaybettin.'); else updateBlackjackUI(false);
}

function standBlackjack() {
    if (!bjState.active) return; let dSum = calcHand(bjState.dealerHand);
    while (dSum < 17) { bjState.dealerHand.push(drawCard()); dSum = calcHand(bjState.dealerHand); }
    const pSum = calcHand(bjState.playerHand);
    if (dSum > 21 || pSum > dSum) { const win = bjState.bet * 2; game.crystals += win; endBlackjack(`KAZANDIN! +${win} 💎`); }
    else if (pSum === dSum) { game.crystals += bjState.bet; endBlackjack('BERABERE! Kristal iade edildi.'); }
    else endBlackjack(`KAYBETTİN! Bot kazandı.`);
}

function endBlackjack(msg) {
    bjState.active = false; updateBlackjackUI(true);
    const stEl = document.getElementById('bj-status');
    if (stEl) stEl.innerHTML = `<span class="font-bold text-amber-300">${msg}</span>`;
    const actSt = document.getElementById('bj-actions-start'), actPl = document.getElementById('bj-actions-play');
    if (actSt) actSt.classList.remove('hidden');
    if (actPl) actPl.classList.add('hidden');
    updateHUD(); refreshUpgradeButtonsState(); saveGame(true);
}

function updateBlackjackUI(showAllDealer) {
    const pCardsEl = document.getElementById('bj-player-cards');
    if (pCardsEl) pCardsEl.innerHTML = bjState.playerHand.map(c => renderCardHTML(c, false)).join('');
    setElText('bj-player-score', `Toplam: ${calcHand(bjState.playerHand)}`);
    const dCardsEl = document.getElementById('bj-dealer-cards');
    if (!dCardsEl) return;
    if (showAllDealer) {
        dCardsEl.innerHTML = bjState.dealerHand.map(c => renderCardHTML(c, false)).join('');
        setElText('bj-dealer-score', `Toplam: ${calcHand(bjState.dealerHand)}`);
    } else {
        dCardsEl.innerHTML = renderCardHTML(bjState.dealerHand[0], false) + renderCardHTML(null, true);
        setElText('bj-dealer-score', `Toplam: ${bjState.dealerHand[0].score} + ?`);
        setElText('bj-status', 'Kart Çek (Hit) veya Kal (Stand)');
    }
}

function updateLootboxCollectionCounters() {
    if (typeof game === 'undefined') return;
    if (!Array.isArray(game.inventory)) game.inventory = [];
    if (!Array.isArray(game.ownedSkins)) game.ownedSkins = ['default_cyber'];
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];

    const totalItems = Object.keys(typeof ITEM_DATABASE !== 'undefined' ? ITEM_DATABASE : {}).length;
    const ownedItems = game.inventory.filter(id => typeof ITEM_DATABASE !== 'undefined' && ITEM_DATABASE[id]).length;
    const itemsFull = totalItems > 0 && ownedItems >= totalItems;

    const totalSkins = Object.keys(typeof SKIN_DATABASE !== 'undefined' ? SKIN_DATABASE : {}).length;
    const ownedSkins = game.ownedSkins.filter(id => typeof SKIN_DATABASE !== 'undefined' && SKIN_DATABASE[id]).length;
    const skinsFull = totalSkins > 0 && ownedSkins >= totalSkins;

    const totalCompSkins = Object.keys(typeof COMPANION_SKIN_DATABASE !== 'undefined' ? COMPANION_SKIN_DATABASE : {}).length;
    const ownedCompSkins = game.ownedCompanionSkins.filter(id => typeof COMPANION_SKIN_DATABASE !== 'undefined' && COMPANION_SKIN_DATABASE[id]).length;
    const compSkinsFull = totalCompSkins > 0 && ownedCompSkins >= totalCompSkins;

    setElText('owned-items-count', `${ownedItems}/${totalItems}`);
    setElText('inv-gear-header-count', `${ownedItems}/${totalItems}`);
    setElText('owned-skins-count', `${ownedSkins}/${totalSkins}`);
    setElText('owned-compskins-count', `${ownedCompSkins}/${totalCompSkins}`);

    setElText('lootbox-item-badge', itemsFull ? 'TAMAMLANDI ✓' : `Koleksiyon: ${ownedItems}/${totalItems}`);
    setElText('lootbox-item-progress-info', itemsFull ? `🎉 Tüm Eşyalar Açıldı! (${ownedItems} / ${totalItems})` : `Açılan Eşya: ${ownedItems} / ${totalItems} (Kalan: ${totalItems - ownedItems})`);

    setElText('lootbox-skin-badge', skinsFull ? 'TAMAMLANDI ✓' : `Koleksiyon: ${ownedSkins}/${totalSkins}`);
    setElText('lootbox-skin-progress-info', skinsFull ? `🎉 Tüm Kule Skinleri Açıldı! (${ownedSkins} / ${totalSkins})` : `Açılan Kule Skini: ${ownedSkins} / ${totalSkins} (Kalan: ${totalSkins - ownedSkins})`);

    setElText('lootbox-compskin-badge', compSkinsFull ? 'TAMAMLANDI ✓' : `Koleksiyon: ${ownedCompSkins}/${totalCompSkins}`);
    setElText('lootbox-compskin-progress-info', compSkinsFull ? `🎉 Tüm Yoldaş Skinleri Açıldı! (${ownedCompSkins} / ${totalCompSkins})` : `Açılan Yoldaş Skini: ${ownedCompSkins} / ${totalCompSkins} (Kalan: ${totalCompSkins - ownedCompSkins})`);

    const btnItem1 = document.getElementById('btn-open-item-1'), btnItem5 = document.getElementById('btn-open-item-5');
    if (btnItem1 && btnItem5) {
        btnItem1.disabled = itemsFull; btnItem5.disabled = itemsFull;
        btnItem1.innerHTML = itemsFull ? `<i class="fa-solid fa-check"></i> TAMAMLANDI` : `<i class="fa-solid fa-gem"></i> 25 Kristal (1'li)`;
        btnItem5.innerHTML = itemsFull ? `<i class="fa-solid fa-check"></i> ${ownedItems}/${totalItems} MAKS` : `<i class="fa-solid fa-gem"></i> 110 Kristal (5'li)`;
    }

    const btnSkin1 = document.getElementById('btn-open-skin-1'), btnSkin5 = document.getElementById('btn-open-skin-5');
    if (btnSkin1 && btnSkin5) {
        btnSkin1.disabled = skinsFull; btnSkin5.disabled = skinsFull;
        btnSkin1.innerHTML = skinsFull ? `<i class="fa-solid fa-check"></i> TAMAMLANDI` : `<i class="fa-solid fa-gem"></i> 25 Kristal (1'li)`;
        btnSkin5.innerHTML = skinsFull ? `<i class="fa-solid fa-check"></i> ${ownedSkins}/${totalSkins} MAKS` : `<i class="fa-solid fa-gem"></i> 110 Kristal (5'li)`;
    }

    const btnComp1 = document.getElementById('btn-open-compskin-1'), btnComp5 = document.getElementById('btn-open-compskin-5');
    if (btnComp1 && btnComp5) {
        btnComp1.disabled = compSkinsFull; btnComp5.disabled = compSkinsFull;
        btnComp1.innerHTML = compSkinsFull ? `<i class="fa-solid fa-check"></i> TAMAMLANDI` : `<i class="fa-solid fa-gem"></i> 20 Kristal (1'li)`;
        btnComp5.innerHTML = compSkinsFull ? `<i class="fa-solid fa-check"></i> ${ownedCompSkins}/${totalCompSkins} MAKS` : `<i class="fa-solid fa-gem"></i> 90 Kristal (5'li)`;
    }
}

let lootboxAnimTimer = null;
let currentLootSession = null;

function openLootbox(count) {
    const totalItems = Object.keys(ITEM_DATABASE || {}).length;
    const ownedItems = (game.inventory || []).filter(id => ITEM_DATABASE && ITEM_DATABASE[id]).length;
    if (totalItems > 0 && ownedItems >= totalItems) {
        showToast(`🎉 Tüm eşyaları (${ownedItems}/${totalItems}) zaten topladın!`);
        updateLootboxCollectionCounters();
        return;
    }

    const cost = count === 5 ? 110 : count * 25;
    if (game.crystals < cost) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= cost;
    game.lootboxBonuses.totalOpened += count;

    let droppedEntries = [];
    let refundCrystals = 0;

    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let rarity = 'rare';
        if (roll < 1.2) rarity = 'legendary';
        else if (roll < 5.0) rarity = 'mythic';
        else if (roll < 17) rarity = 'epic';
        else if (roll < 45) rarity = 'super_rare';

        const pool = Object.values(ITEM_DATABASE).filter(item => item.rarity === rarity);
        const item = pool[Math.floor(Math.random() * pool.length)];
        const isDuplicate = game.inventory.includes(item.id);

        if (!isDuplicate) game.inventory.push(item.id);
        else refundCrystals += 10;

        droppedEntries.push({ kind: 'item', data: item, isDuplicate });
    }

    if (refundCrystals > 0) game.crystals += refundCrystals;
    buildInventoryUI(); updateHUD(); saveGame(true);
    startLootboxModalAnimation('item', count, droppedEntries, refundCrystals);
}

function openSkinBox(count) {
    if (!Array.isArray(game.ownedSkins)) game.ownedSkins = ['default_cyber'];
    const totalSkins = Object.keys(SKIN_DATABASE || {}).length;
    const ownedSkins = game.ownedSkins.filter(id => SKIN_DATABASE && SKIN_DATABASE[id]).length;
    if (totalSkins > 0 && ownedSkins >= totalSkins) {
        showToast(`🎉 Tüm Kule Skinlerini (${ownedSkins}/${totalSkins}) zaten açtın!`);
        updateLootboxCollectionCounters();
        return;
    }

    const cost = count === 5 ? 110 : count * 25;
    if (game.crystals < cost) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= cost;

    let droppedEntries = [];
    let refundCrystals = 0;
    const allBoxSkins = Object.values(SKIN_DATABASE).filter(s => s.id !== 'default_cyber');

    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let rarity = 'rare';
        if (roll < 2.2) rarity = 'legendary';
        else if (roll < 11) rarity = 'mythic';
        else if (roll < 32) rarity = 'epic';
        else if (roll < 60) rarity = 'super_rare';

        let pool = allBoxSkins.filter(s => s.rarity === rarity);
        if (pool.length === 0) pool = allBoxSkins;
        const skin = pool[Math.floor(Math.random() * pool.length)];
        const isDuplicate = game.ownedSkins.includes(skin.id);

        if (!isDuplicate) game.ownedSkins.push(skin.id);
        else refundCrystals += 10;

        droppedEntries.push({ kind: 'skin', data: skin, isDuplicate });
    }

    if (refundCrystals > 0) game.crystals += refundCrystals;
    buildInventoryUI(); updateHUD(); saveGame(true);
    startLootboxModalAnimation('skin', count, droppedEntries, refundCrystals);
}

function openCompanionSkinBox(count) {
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];
    const totalCompSkins = Object.keys(COMPANION_SKIN_DATABASE || {}).length;
    const ownedCompSkins = game.ownedCompanionSkins.filter(id => COMPANION_SKIN_DATABASE && COMPANION_SKIN_DATABASE[id]).length;
    if (totalCompSkins > 0 && ownedCompSkins >= totalCompSkins) {
        showToast(`🎉 Tüm Yoldaş Skinlerini (${ownedCompSkins}/${totalCompSkins}) zaten açtın!`);
        updateLootboxCollectionCounters();
        return;
    }

    const cost = count === 5 ? 90 : count * 20;
    if (game.crystals < cost) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= cost;

    let droppedEntries = [];
    let refundCrystals = 0;
    const allCompSkins = Object.values(COMPANION_SKIN_DATABASE).filter(s => s.id !== 'default_tech');

    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let rarity = 'rare';
        if (roll < 3.0) rarity = 'legendary';
        else if (roll < 13) rarity = 'mythic';
        else if (roll < 35) rarity = 'epic';
        else if (roll < 65) rarity = 'super_rare';

        let pool = allCompSkins.filter(s => s.rarity === rarity);
        if (pool.length === 0) pool = allCompSkins;
        const cSkin = pool[Math.floor(Math.random() * pool.length)];
        const isDuplicate = game.ownedCompanionSkins.includes(cSkin.id);

        if (!isDuplicate) game.ownedCompanionSkins.push(cSkin.id);
        else refundCrystals += 8;

        droppedEntries.push({ kind: 'compskin', data: cSkin, isDuplicate });
    }

    if (refundCrystals > 0) game.crystals += refundCrystals;
    buildInventoryUI(); buildCompanionsUI(); updateHUD(); saveGame(true);
    startLootboxModalAnimation('compskin', count, droppedEntries, refundCrystals);
}

function startLootboxModalAnimation(boxType, count, entries, refundCrystals) {
    currentLootSession = { boxType, count, entries, refundCrystals };
    clearTimeout(lootboxAnimTimer);

    const modal = document.getElementById('lootbox-anim-modal');
    const stageChest = document.getElementById('loot-stage-chest');
    const stageReveal = document.getElementById('loot-stage-reveal');
    const chestIcon = document.getElementById('loot-chest-icon');
    const chestSubtitle = document.getElementById('loot-chest-subtitle');

    if (!modal || !stageChest || !stageReveal) return;
    modal.classList.remove('hidden');
    stageChest.classList.remove('hidden');
    stageReveal.classList.add('hidden');

    if (chestIcon && chestSubtitle) {
        if (boxType === 'skin') {
            chestIcon.className = 'fa-solid fa-crown text-6xl text-amber-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]';
            chestSubtitle.textContent = count > 1 ? '5x KULE SKİN KUTUSU AÇILIYOR...' : 'KULE SKİN KUTUSU AÇILIYOR...';
        } else if (boxType === 'compskin') {
            chestIcon.className = 'fa-solid fa-satellite text-6xl text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]';
            chestSubtitle.textContent = count > 1 ? '5x YOLDAŞ SKİN KUTUSU AÇILIYOR...' : 'YOLDAŞ SKİN KUTUSU AÇILIYOR...';
        } else {
            chestIcon.className = 'fa-solid fa-cube text-6xl text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]';
            chestSubtitle.textContent = count > 1 ? '5x KUANTUM EŞYA SANDIĞI AÇILIYOR...' : 'KUANTUM EŞYA SANDIĞI AÇILIYOR...';
        }
    }

    lootboxAnimTimer = setTimeout(() => {
        revealLootboxCards();
    }, 950);
}

function skipLootboxAnim() {
    clearTimeout(lootboxAnimTimer);
    revealLootboxCards();
}

function revealLootboxCards() {
    if (!currentLootSession) return;
    const { boxType, count, entries, refundCrystals } = currentLootSession;

    const stageChest = document.getElementById('loot-stage-chest');
    const stageReveal = document.getElementById('loot-stage-reveal');
    const flashBurst = document.getElementById('loot-flash-burst');
    const cardsContainer = document.getElementById('loot-cards-container');
    const refundBanner = document.getElementById('loot-refund-banner');
    const refundText = document.getElementById('loot-refund-text');
    const reopenLabel = document.getElementById('loot-reopen-label');
    const reopenBtn = document.getElementById('loot-btn-reopen');

    if (stageChest) stageChest.classList.add('hidden');
    if (stageReveal) stageReveal.classList.remove('hidden');

    if (flashBurst) {
        flashBurst.classList.remove('hidden');
        flashBurst.style.animation = 'none';
        void flashBurst.offsetWidth;
        flashBurst.style.animation = 'flashBurst 0.55s ease-out forwards';
    }

    const boxCost = boxType === 'compskin' ? (count === 5 ? 90 : count * 20) : (count === 5 ? 110 : count * 25);

    let isCollectionMaxed = false;
    if (boxType === 'item') {
        const total = Object.keys(ITEM_DATABASE || {}).length;
        isCollectionMaxed = total > 0 && (game.inventory || []).length >= total;
    } else if (boxType === 'skin') {
        const total = Object.keys(SKIN_DATABASE || {}).length;
        isCollectionMaxed = total > 0 && (game.ownedSkins || []).length >= total;
    } else if (boxType === 'compskin') {
        const total = Object.keys(COMPANION_SKIN_DATABASE || {}).length;
        isCollectionMaxed = total > 0 && (game.ownedCompanionSkins || []).length >= total;
    }

    if (reopenBtn) reopenBtn.disabled = isCollectionMaxed;
    if (reopenLabel) {
        reopenLabel.textContent = isCollectionMaxed ? 'Koleksiyon Tamamlandı!' : `Tekrar Aç (${boxCost} 💎)`;
    }

    if (refundBanner && refundText) {
        if (refundCrystals > 0) {
            refundBanner.classList.remove('hidden');
            refundText.textContent = `Kopya ödüllerden +${refundCrystals} 💎 Kristal iade edildi!`;
        } else {
            refundBanner.classList.add('hidden');
        }
    }

    if (!cardsContainer) return;
    cardsContainer.innerHTML = entries.map((entry, idx) => {
        const d = entry.data;
        const rb = getRarityBadge(d.rarity);
        const glowClass = `rarity-glow-${d.rarity}`;
        const delayMs = idx * 110;
        const isSingle = entries.length === 1;
        const cardSizeCls = isSingle ? 'w-64 p-5' : 'w-36 sm:w-40 p-3';

        const statusBadge = entry.isDuplicate
            ? `<span class="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[9px] font-tech font-bold">+${entry.kind === 'compskin' ? 8 : 10} 💎 KOPYA</span>`
            : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 text-[9px] font-tech font-bold animate-pulse">✨ YENİ!</span>`;

        const visualCenter = (entry.kind === 'skin' || entry.kind === 'compskin')
            ? `<div class="my-2 flex flex-col items-center justify-center loot-float">
                   <canvas id="loot-skin-canvas-${idx}" width="76" height="76" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/90 border border-white/15 shadow-inner"></canvas>
               </div>`
            : `<div class="my-3 flex items-center justify-center loot-float">
                   ${renderItemIconHTML(d, 'w-16 h-16 sm:w-20 sm:h-20')}
               </div>`;

        return `
            <div style="animation-delay: ${delayMs}ms" class="loot-card-anim ${cardSizeCls} rounded-2xl bg-slate-900/95 border-2 ${rb.cls} ${glowClass} flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div class="w-full flex items-center justify-between gap-1 mb-1">
                    <span class="px-2 py-0.5 rounded text-[9px] font-tech font-bold border ${rb.cls}">${rb.text}</span>
                    ${statusBadge}
                </div>
                ${visualCenter}
                <div>
                    <div class="font-tech font-bold ${isSingle ? 'text-base' : 'text-xs'} text-white leading-tight mb-1">${d.emoji ? d.emoji + ' ' : ''}${d.name}</div>
                    <div class="text-[10px] text-slate-300 leading-snug line-clamp-2">${d.desc}</div>
                </div>
            </div>
        `;
    }).join('');

    entries.forEach((entry, idx) => {
        if (entry.kind === 'skin' || entry.kind === 'compskin') {
            const cEl = document.getElementById(`loot-skin-canvas-${idx}`);
            if (cEl) {
                const cCtx = cEl.getContext('2d');
                cCtx.clearRect(0, 0, cEl.width, cEl.height);
                cCtx.save();
                if (entry.kind === 'skin' && typeof drawCustomTowerSkin === 'function') {
                    cCtx.translate(cEl.width / 2 - 2, cEl.height / 2);
                    cCtx.scale(1.15, 1.15);
                    drawCustomTowerSkin(cCtx, entry.data.id, 0, 0, 1, performance.now());
                } else if (typeof drawCustomCompanionSkin === 'function') {
                    cCtx.translate(cEl.width / 2, cEl.height / 2);
                    cCtx.scale(2.1, 2.1);
                    drawCustomCompanionSkin(cCtx, entry.data.id, 'laserDrone', 5, -Math.PI / 2, performance.now());
                }
                cCtx.restore();
            }
        }
    });
}

function closeLootboxModal() {
    clearTimeout(lootboxAnimTimer);
    const m = document.getElementById('lootbox-anim-modal');
    if (m) m.classList.add('hidden');
    currentLootSession = null;
}

function reopenLastBox() {
    if (!currentLootSession) return;
    const { boxType, count } = currentLootSession;
    if (boxType === 'skin') openSkinBox(count);
    else if (boxType === 'compskin') openCompanionSkinBox(count);
    else openLootbox(count);
}

function selectTowerSkin(skinId) {
    if (!game.ownedSkins.includes(skinId)) return; game.activeSkin = skinId;
    const skin = SKIN_DATABASE[skinId]; showToast(`Kule Skini Kuşanıldı: ${skin.emoji} ${skin.name}`);
    buildInventoryUI(); saveGame(true);
}

function selectCompanionSkin(skinId) {
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];
    if (!game.ownedCompanionSkins.includes(skinId)) return;
    game.activeCompanionSkin = skinId;
    const cSkin = COMPANION_SKIN_DATABASE[skinId];
    showToast(`Yoldaş Skini Kuşanıldı: ${cSkin.emoji} ${cSkin.name}`);
    buildInventoryUI(); buildCompanionsUI(); saveGame(true);
}

function switchInventorySubTab(sub) {
    const gP = document.getElementById('inv-panel-gear'), sP = document.getElementById('inv-panel-skins'), cP = document.getElementById('inv-panel-compskins');
    if (gP) gP.classList.toggle('hidden', sub !== 'gear');
    if (sP) sP.classList.toggle('hidden', sub !== 'skins');
    if (cP) cP.classList.toggle('hidden', sub !== 'compskins');

    const gB = document.getElementById('inv-sub-gear'), sB = document.getElementById('inv-sub-skins'), cB = document.getElementById('inv-sub-compskins');
    if (gB) gB.className = sub === 'gear' ? 'py-1.5 rounded-lg font-tech font-bold text-[11px] bg-blue-600 text-white transition' : 'py-1.5 rounded-lg font-tech font-bold text-[11px] text-slate-400 hover:text-white transition';
    if (sB) sB.className = sub === 'skins' ? 'py-1.5 rounded-lg font-tech font-bold text-[11px] bg-amber-600 text-white transition' : 'py-1.5 rounded-lg font-tech font-bold text-[11px] text-slate-400 hover:text-white transition';
    if (cB) cB.className = sub === 'compskins' ? 'py-1.5 rounded-lg font-tech font-bold text-[11px] bg-cyan-600 text-white transition' : 'py-1.5 rounded-lg font-tech font-bold text-[11px] text-slate-400 hover:text-white transition';
    buildInventoryUI();
}

function toggleRaritySortOrder() {
    raritySortDescending = !raritySortDescending;
    setElText('sort-rarity-label', raritySortDescending ? 'Nadirlik: En Yüksek' : 'Nadirlik: En Düşük');
    buildInventoryUI();
}

function toggleEquipItem(itemId) {
    if (!Array.isArray(game.equippedItems)) game.equippedItems = [];
    const idx = game.equippedItems.indexOf(itemId);
    if (idx > -1) { game.equippedItems.splice(idx, 1); showToast('Eşya çıkarıldı.'); }
    else { if (game.equippedItems.length >= 3) { showToast('En fazla 3 eşya kuşanabilirsin!'); return; } game.equippedItems.push(itemId); showToast('Eşya kuşanıldı!'); }
    buildInventoryUI(); buildUpgradesUI(); updateHUD(); saveGame(true);
}

function getRarityBadge(rarity) {
    const map = { rare: { text: 'RARE', cls: 'text-blue-300 border-blue-500/30 bg-blue-500/10' }, super_rare: { text: 'S.RARE', cls: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10' }, epic: { text: 'EPIC', cls: 'text-purple-300 border-purple-500/30 bg-purple-500/10' }, mythic: { text: 'MYTHIC', cls: 'text-pink-300 border-pink-500/30 bg-pink-500/10' }, legendary: { text: 'LEGENDARY', cls: 'text-amber-300 border-amber-500/40 bg-amber-500/15' } };
    return map[rarity] || map.rare;
}

function buildInventoryUI() {
    if (typeof game === 'undefined') return;
    if (!Array.isArray(game.equippedItems)) game.equippedItems = [];
    if (!Array.isArray(game.inventory)) game.inventory = [];
    if (!Array.isArray(game.ownedSkins)) game.ownedSkins = ['default_cyber'];
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];

    setElText('badge-equipped-count', `${game.equippedItems.length}/3`);
    updateLootboxCollectionCounters();

    const eqList = document.getElementById('equipped-items-list');
    if (eqList && typeof ITEM_DATABASE !== 'undefined') {
        eqList.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const itemId = game.equippedItems[i], item = ITEM_DATABASE[itemId];
            if (item) {
                const rb = getRarityBadge(item.rarity);
                eqList.innerHTML += `
                    <div onclick="toggleEquipItem('${item.id}')" class="cursor-pointer p-2 rounded-lg border ${rb.cls} flex flex-col items-center justify-center text-center relative hover:opacity-80 transition gap-1">
                        ${renderItemIconHTML(item, 'w-9 h-9')}
                        <div class="font-tech font-bold text-[10px] leading-tight line-clamp-1">${item.name}</div>
                        <span class="text-[8px] opacity-75">Çıkar</span>
                    </div>`;
            } else {
                eqList.innerHTML += `<div class="p-2 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500">Boş Slot</div>`;
            }
        }
    }

    const invList = document.getElementById('inventory-items-list');
    if (invList && typeof ITEM_DATABASE !== 'undefined') {
        if (game.inventory.length === 0) {
            invList.innerHTML = `<div class="col-span-2 text-center py-6 text-xs text-slate-500">Henüz eşyan yok. Kutular sekmesinden sandık aç!</div>`;
        } else {
            const rOrder = typeof RARITY_ORDER !== 'undefined' ? RARITY_ORDER : { rare: 1, super_rare: 2, epic: 3, mythic: 4, legendary: 5 };
            const sortDesc = typeof raritySortDescending !== 'undefined' ? raritySortDescending : true;
            const sortedIds = [...game.inventory].filter(id => ITEM_DATABASE[id]).sort((a, b) => {
                const itemA = ITEM_DATABASE[a], itemB = ITEM_DATABASE[b];
                const rA = rOrder[itemA.rarity] || 0, rB = rOrder[itemB.rarity] || 0;
                if (rA !== rB) return sortDesc ? (rB - rA) : (rA - rB);
                return itemA.name.localeCompare(itemB.name, 'tr');
            });

            invList.innerHTML = sortedIds.map(id => {
                const item = ITEM_DATABASE[id];
                const isEq = game.equippedItems.includes(id), rb = getRarityBadge(item.rarity);
                return `
                    <div onclick="toggleEquipItem('${item.id}')" class="cursor-pointer p-2.5 rounded-xl border ${isEq ? 'border-yellow-400 bg-yellow-500/10' : 'border-slate-800 bg-slate-900/50'} hover:border-slate-600 transition flex flex-col justify-between gap-1.5">
                        <div class="flex items-center justify-between">
                            <span class="px-1.5 py-0.5 rounded text-[8px] font-tech font-bold border ${rb.cls}">${rb.text}</span>
                            ${isEq ? '<span class="text-[9px] text-yellow-300 font-bold">TAKILI</span>' : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            ${renderItemIconHTML(item, 'w-11 h-11')}
                            <div class="min-w-0">
                                <div class="font-tech font-bold text-xs text-white leading-tight truncate">${item.name}</div>
                                <div class="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-0.5">${item.desc}</div>
                            </div>
                        </div>
                    </div>`;
            }).join('');
        }
    }

    if (typeof SKIN_DATABASE !== 'undefined') {
        const rOrder = typeof RARITY_ORDER !== 'undefined' ? RARITY_ORDER : { rare: 1, super_rare: 2, epic: 3, mythic: 4, legendary: 5 };
        const allSkins = Object.values(SKIN_DATABASE).sort((a, b) => (rOrder[b.rarity] || 0) - (rOrder[a.rarity] || 0));
        const activeSkinDef = SKIN_DATABASE[game.activeSkin] || SKIN_DATABASE.default_cyber;
        if (activeSkinDef) setElText('active-skin-title', `${activeSkinDef.emoji} ${activeSkinDef.name}`);

        const skinsListEl = document.getElementById('skins-inventory-list');
        if (skinsListEl) {
            skinsListEl.innerHTML = allSkins.map(skin => {
                const owned = game.ownedSkins.includes(skin.id), isActive = game.activeSkin === skin.id, rb = getRarityBadge(skin.rarity);
                return `<div onclick="${owned ? `selectTowerSkin('${skin.id}')` : ''}" class="${owned ? 'cursor-pointer hover:border-amber-500/50' : 'opacity-45 cursor-not-allowed'} p-2.5 rounded-xl border ${isActive ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50'} transition flex flex-col justify-between"><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 rounded text-[8px] font-tech font-bold border ${rb.cls}">${rb.text}</span><span class="text-[9px] font-tech font-bold ${isActive ? 'text-amber-300' : (owned ? 'text-emerald-400' : 'text-slate-500')}">${isActive ? 'AKTİF' : (owned ? 'SAHİP' : 'KİLİTLİ')}</span></div><div class="flex items-center gap-2 my-1"><canvas id="skin-preview-${skin.id}" width="52" height="52" class="w-[46px] h-[46px] rounded-lg bg-slate-950/80 border border-white/10 shrink-0"></canvas><div class="min-w-0"><div class="font-tech font-bold text-xs text-white truncate">${skin.name}</div><div class="text-[10px] text-slate-400 leading-tight line-clamp-2">${skin.desc}</div></div></div></div>`;
            }).join('');

            allSkins.forEach(skin => {
                const pCanvas = document.getElementById(`skin-preview-${skin.id}`);
                if (pCanvas && typeof drawCustomTowerSkin === 'function') {
                    const pCtx = pCanvas.getContext('2d');
                    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                    pCtx.save();
                    pCtx.translate(pCanvas.width / 2 - 2, pCanvas.height / 2);
                    pCtx.scale(0.82, 0.82);
                    drawCustomTowerSkin(pCtx, skin.id, 0, 0, 1, 0);
                    pCtx.restore();
                }
            });
        }
    }

    if (typeof COMPANION_SKIN_DATABASE !== 'undefined') {
        const rOrder = typeof RARITY_ORDER !== 'undefined' ? RARITY_ORDER : { rare: 1, super_rare: 2, epic: 3, mythic: 4, legendary: 5 };
        const allCompSkins = Object.values(COMPANION_SKIN_DATABASE).sort((a, b) => (rOrder[b.rarity] || 0) - (rOrder[a.rarity] || 0));
        const activeCompSkinDef = COMPANION_SKIN_DATABASE[game.activeCompanionSkin] || COMPANION_SKIN_DATABASE.default_tech;
        if (activeCompSkinDef) setElText('active-compskin-title', `${activeCompSkinDef.emoji} ${activeCompSkinDef.name}`);

        const compSkinsListEl = document.getElementById('compskins-inventory-list');
        if (compSkinsListEl) {
            compSkinsListEl.innerHTML = allCompSkins.map(cSkin => {
                const owned = game.ownedCompanionSkins.includes(cSkin.id), isActive = game.activeCompanionSkin === cSkin.id, rb = getRarityBadge(cSkin.rarity);
                return `<div onclick="${owned ? `selectCompanionSkin('${cSkin.id}')` : ''}" class="${owned ? 'cursor-pointer hover:border-cyan-500/50' : 'opacity-45 cursor-not-allowed'} p-2.5 rounded-xl border ${isActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/50'} transition flex flex-col justify-between"><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 rounded text-[8px] font-tech font-bold border ${rb.cls}">${rb.text}</span><span class="text-[9px] font-tech font-bold ${isActive ? 'text-cyan-300' : (owned ? 'text-emerald-400' : 'text-slate-500')}">${isActive ? 'AKTİF' : (owned ? 'SAHİP' : 'KİLİTLİ')}</span></div><div class="flex items-center gap-2 my-1"><canvas id="compskin-preview-${cSkin.id}" width="52" height="52" class="w-[46px] h-[46px] rounded-lg bg-slate-950/80 border border-white/10 shrink-0"></canvas><div class="min-w-0"><div class="font-tech font-bold text-xs text-white truncate">${cSkin.name}</div><div class="text-[10px] text-slate-400 leading-tight line-clamp-2">${cSkin.desc}</div></div></div></div>`;
            }).join('');

            allCompSkins.forEach(cSkin => {
                const pCanvas = document.getElementById(`compskin-preview-${cSkin.id}`);
                if (pCanvas && typeof drawCustomCompanionSkin === 'function') {
                    const pCtx = pCanvas.getContext('2d');
                    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                    pCtx.save();
                    pCtx.translate(pCanvas.width / 2, pCanvas.height / 2);
                    pCtx.scale(1.65, 1.65);
                    drawCustomCompanionSkin(pCtx, cSkin.id, 'laserDrone', 5, -Math.PI / 2, 0);
                    pCtx.restore();
                }
            });
        }
    }
}

function updateHUD() {
    if (typeof game === 'undefined' || typeof tower === 'undefined') return;
    setElText('ui-gold', formatNumber(game.gold));
    setElText('ui-crystals', formatNumber(game.crystals));
    setElText('ui-souls', formatNumber(game.souls));
    setElText('ui-hp-text', `${formatNumber(tower.hp)} / ${formatNumber(tower.maxHp)}`);
    const hpBar = document.getElementById('ui-hp-bar');
    if (hpBar) hpBar.style.width = `${Math.max(0, Math.min(100, (tower.hp / Math.max(1, tower.maxHp)) * 100))}%`;

    const shieldCont = document.getElementById('shield-container');
    if (shieldCont) {
        if (tower.maxShield > 0) {
            shieldCont.classList.remove('hidden');
            setElText('ui-shield-text', `${formatNumber(tower.shield)} / ${formatNumber(tower.maxShield)}`);
            const shBar = document.getElementById('ui-shield-bar');
            if (shBar) shBar.style.width = `${Math.max(0, Math.min(100, (tower.shield / tower.maxShield) * 100))}%`;
        } else {
            shieldCont.classList.add('hidden');
        }
    }

    setElText('ui-hud-regen', `${formatNumber(getTowerRegen())}/sn`);
    setElText('ui-hud-armor', formatNumber(getTowerArmor()));
    setElText('ui-wave-badge', `DALGA ${game.wave}`);
    const bossWarn = document.getElementById('ui-boss-warning');
    if (bossWarn) bossWarn.classList.toggle('hidden', game.wave % 5 !== 0);
    setElText('ui-wave-progress-text', `${game.waveKills} / ${game.waveTargetKills}`);
    const wBar = document.getElementById('ui-wave-bar');
    if (wBar) wBar.style.width = `${Math.min(100, (game.waveKills / Math.max(1, game.waveTargetKills)) * 100)}%`;
    setElText('ui-active-enemies', typeof enemies !== 'undefined' ? enemies.length : 0);

    setElText('ui-Quick-dmg', formatNumber(getTowerDamage()));
    setElText('ui-Quick-spd', getTowerFireRate().toFixed(2));
    setElText('ui-Quick-crit', `%${getTowerCritChance()}`);
    setElText('ui-Quick-multi', getEffectiveMultishot());

    setElText('ui-drawer-hp', formatNumber(tower.hp));
    setElText('ui-drawer-armor', formatNumber(getTowerArmor()));
    setElText('ui-drawer-dmg', formatNumber(getTowerDamage()));
    setElText('ui-drawer-spd', getTowerFireRate().toFixed(2));
    setElText('ui-drawer-crit', `%${getTowerCritChance()}`);
    setElText('ui-drawer-multi', getEffectiveMultishot());
}

function switchTab(tab) {
    currentTab = tab;
    const tabs = ['attack', 'defense', 'economy', 'companions', 'items', 'lootbox', 'prestige', 'casino', 'leaderboard'];
    tabs.forEach(t => {
        const content = document.getElementById(`tab-${t}`), btn = document.getElementById(`tab-btn-${t}`);
        if (content) content.classList.toggle('hidden', t !== tab);
        if (btn) { if (t === tab) btn.classList.add('tab-active'); else btn.classList.remove('tab-active'); }
    });
    if (tab === 'items' || tab === 'lootbox') buildInventoryUI();
    if (tab === 'prestige') buildPrestigeUI();
    if (tab === 'casino' && activeMiniGame === 'roulette') drawRouletteWheel();
    if (tab === 'leaderboard') refreshLeaderboard(false);
}

function toggleGameSpeed() { gameSpeed = gameSpeed === 1 ? 2 : (gameSpeed === 2 ? 3 : 1); setElText('ui-speed', `${gameSpeed}x`); }
function togglePause() {
    isPaused = !isPaused;
    const ic = document.getElementById('icon-pause');
    if (ic) ic.className = isPaused ? 'fa-solid fa-play w-3 text-center' : 'fa-solid fa-pause w-3 text-center';
}
function toggleRangeCircle() { game.settings.showRange = !game.settings.showRange; saveGame(true); }
function toggleDamageText() { game.settings.showDamageText = !game.settings.showDamageText; saveGame(true); }

function openThemeModal() {
    const listEl = document.getElementById('theme-list');
    if (listEl && typeof THEME_DEFS !== 'undefined') {
        listEl.innerHTML = Object.values(THEME_DEFS).map(t => {
            const unlocked = game.highestWave >= t.reqWave, active = game.settings.activeTheme === t.id;
            return `<div onclick="${unlocked ? `selectTheme('${t.id}')` : ''}" class="${unlocked ? 'cursor-pointer hover:border-indigo-400' : 'opacity-50 cursor-not-allowed'} premium-card p-3 flex items-center justify-between"><div class="flex items-center gap-3"><i class="${t.icon} text-lg ${t.color}"></i><div><div class="font-tech font-bold text-sm text-white">${t.name}</div><div class="text-[11px] text-slate-400">${t.desc}</div></div></div><span class="text-xs font-tech font-bold ${active ? 'text-indigo-300' : 'text-slate-400'}">${active ? 'AKTİF' : (unlocked ? 'SEÇ' : `Dalga ${t.reqWave}`)}</span></div>`;
        }).join('');
    }
    const m = document.getElementById('theme-modal');
    if (m) m.classList.remove('hidden');
}
function closeThemeModal() { const m = document.getElementById('theme-modal'); if (m) m.classList.add('hidden'); }
function selectTheme(id) { const def = THEME_DEFS[id]; if (!def || game.highestWave < def.reqWave) return; game.settings.activeTheme = id; setElText('ui-theme-name', def.name.split(' ')[0]); openThemeModal(); saveGame(true); }

function openSettingsModal() {
    setElText('stat-total-kills', formatNumber(game.stats.totalKills));
    setElText('stat-boss-kills', formatNumber(game.stats.bossKills));
    setElText('stat-max-wave', game.highestWave);
    applyBodyClasses();
    const m = document.getElementById('settings-modal');
    if (m) m.classList.remove('hidden');
}
function closeSettingsModal() { const m = document.getElementById('settings-modal'); if (m) m.classList.add('hidden'); }
function openConfirmModal(title, desc, onYes) {
    setElText('confirm-title', title);
    setElText('confirm-desc', desc);
    const yesBtn = document.getElementById('confirm-yes-btn');
    if (yesBtn) yesBtn.onclick = () => { closeConfirmModal(); onYes(); };
    const m = document.getElementById('confirm-modal');
    if (m) m.classList.remove('hidden');
}
function closeConfirmModal() { const m = document.getElementById('confirm-modal'); if (m) m.classList.add('hidden'); }
function openHardResetConfirm() {
    openConfirmModal('Oyunu Sıfırla', 'Tüm ilerlemen kalıcı olarak sıfırlanacak. Emin misin?', () => {
        localStorage.removeItem(SAVE_KEY); game = getDefaultState(); enemies = []; projectiles = [];
        tower.hp = getTowerMaxHp(); tower.shield = 0; applyBodyClasses(); buildUpgradesUI(); buildInventoryUI(); updateHUD(); closeSettingsModal(); showToast('Oyun tamamen sıfırlandı.');
    });
}

let toastTimeout = null;
function showToast(msg) {
    const el = document.getElementById('toast-msg'), txt = document.getElementById('toast-text');
    if (!el || !txt) return;
    txt.textContent = msg; el.classList.remove('opacity-0'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.add('opacity-0'), 2600);
}

// =======================================================
// KAYIT SİSTEMİ (LOCALSTORAGE + AKILLI BULUT SENKRONİZASYONU)
// =======================================================
function applyParsedGameData(parsed) {
    if (typeof getDefaultState !== 'function' || !parsed) return;
    const def = getDefaultState();
    game = {
        ...def, ...parsed,
        stats: { ...def.stats, ...(parsed.stats || {}) },
        settings: { ...def.settings, ...(parsed.settings || {}) },
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        companions: { ...def.companions, ...(parsed.companions || {}) },
        prestigeUpgrades: { ...def.prestigeUpgrades, ...(parsed.prestigeUpgrades || {}) },
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        equippedItems: Array.isArray(parsed.equippedItems) ? parsed.equippedItems : [],
        ownedSkins: Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins : ['default_cyber'],
        activeSkin: parsed.activeSkin || 'default_cyber',
        ownedCompanionSkins: Array.isArray(parsed.ownedCompanionSkins) ? parsed.ownedCompanionSkins : ['default_tech'],
        activeCompanionSkin: parsed.activeCompanionSkin || 'default_tech'
    };
    if (typeof COMPANION_DEFS !== 'undefined') {
        for (const key of Object.keys(COMPANION_DEFS)) {
            if (game.companions[key]) {
                if (game.companions[key].unlocked) {
                    game.companions[key].level = Math.min(5, Math.max(1, game.companions[key].level || 1));
                } else {
                    game.companions[key].level = 0;
                }
            }
        }
    }
}

function saveGame(silent = false) {
    try {
        if (typeof game === 'undefined') return;
        game.lastSaveTime = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(game));
        scheduleCloudSave();
    } catch (e) {}
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        applyParsedGameData(parsed);
    } catch (e) {}
}

function exportSaveCode() { try { const t = document.getElementById('save-code-textarea'); if (!t) return; t.value = btoa(unescape(encodeURIComponent(JSON.stringify(game)))); t.select(); document.execCommand('copy'); showToast('Kayıt kodu kopyalandı!'); } catch (e) {} }
function importSaveCode() { try { const t = document.getElementById('save-code-textarea'); if (!t) return; const code = t.value.trim(); if (!code) return; localStorage.setItem(SAVE_KEY, decodeURIComponent(escape(atob(code)))); loadGame(); applyBodyClasses(); buildUpgradesUI(); buildInventoryUI(); updateHUD(); showToast('Kod yüklendi!'); } catch (e) { showToast('Geçersiz kod!'); } }

// =======================================================
// 🔐 HESAP (LOGIN/KAYIT) + ☁️ BULUT KAYIT + 🏆 LİDERLİK TABLOSU
// =======================================================
const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const LOCAL_ACCOUNTS_KEY = 'cyberTower_localAccounts_v1';
const LOCAL_CURRENT_USER_KEY = 'cyberTower_activeUser_v1';
const LOCAL_LEADERBOARD_KEY = 'cyberTower_leaderboard_v1';

let fbApp = null;
let fbAuth = null;
let fbDb = null;
let isFirebaseReady = false;
let currentUser = null;
let authFormMode = 'login';
let leaderboardSortBy = 'wave';
let cloudSaveDebounceTimer = null;

function initAuthAndCloudSystem() {
    try {
        if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) {
            fbApp = !firebase.apps.length ? firebase.initializeApp(FIREBASE_CONFIG) : firebase.app();
            fbAuth = firebase.auth();
            fbDb = firebase.firestore();
            isFirebaseReady = true;

            fbAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    const cleanName = user.displayName || (user.email ? user.email.split('@')[0] : 'Komutan');
                    currentUser = { uid: user.uid, username: cleanName, email: user.email || '', isCloud: true };
                    updateAccountHeaderUI();
                    await forceCloudPull(true);
                    await pushScoreToLeaderboard();
                } else {
                    currentUser = null;
                    updateAccountHeaderUI();
                }
            });
            return;
        }
    } catch (err) {
        isFirebaseReady = false;
    }

    try {
        const savedUserRaw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
        if (savedUserRaw) {
            currentUser = JSON.parse(savedUserRaw);
        }
        updateAccountHeaderUI();
        pushScoreToLeaderboard();
    } catch (e) {}
}

function sanitizeUsernameToEmail(username) {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    return `${clean || 'oyuncu'}@kulesavunma.local`;
}

function switchAuthMode(mode) {
    authFormMode = mode === 'register' ? 'register' : 'login';
    const tabLogin = document.getElementById('auth-tab-login');
    const tabReg = document.getElementById('auth-tab-register');
    const submitLbl = document.getElementById('auth-submit-label');
    const errEl = document.getElementById('auth-error-msg');
    if (errEl) errEl.classList.add('hidden');

    if (tabLogin) {
        tabLogin.className = authFormMode === 'login'
            ? 'py-1.5 rounded-lg font-tech font-bold text-xs bg-emerald-600 text-white transition'
            : 'py-1.5 rounded-lg font-tech font-bold text-xs text-slate-400 hover:text-white transition';
    }
    if (tabReg) {
        tabReg.className = authFormMode === 'register'
            ? 'py-1.5 rounded-lg font-tech font-bold text-xs bg-emerald-600 text-white transition'
            : 'py-1.5 rounded-lg font-tech font-bold text-xs text-slate-400 hover:text-white transition';
    }
    if (submitLbl) {
        submitLbl.textContent = authFormMode === 'register' ? 'YENİ HESAP OLUŞTUR' : 'HESABA GİRİŞ YAP';
    }
}

function showAuthError(msg) {
    const errEl = document.getElementById('auth-error-msg');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    } else {
        showToast(msg);
    }
}

function updateAccountHeaderUI() {
    const headerLabel = document.getElementById('ui-account-name');
    const guestView = document.getElementById('auth-guest-view');
    const loggedView = document.getElementById('auth-logged-view');
    const profileNameEl = document.getElementById('auth-profile-name');
    const badgeEl = document.getElementById('auth-cloud-mode-badge');

    const lbMyName = document.getElementById('lb-my-name');
    const lbMyStatus = document.getElementById('lb-my-status');
    const lbMyBtn = document.getElementById('lb-my-action-btn');

    if (badgeEl) {
        badgeEl.innerHTML = isFirebaseReady
            ? `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Firebase Bulut Aktif`
            : `<span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> Yerel & Simülasyon Bulutu Hazır`;
    }

    if (currentUser) {
        if (headerLabel) headerLabel.textContent = currentUser.username;
        if (guestView) guestView.classList.add('hidden');
        if (loggedView) loggedView.classList.remove('hidden');
        if (profileNameEl) profileNameEl.textContent = currentUser.username;

        if (lbMyName) lbMyName.textContent = currentUser.username;
        if (lbMyStatus) lbMyStatus.textContent = `En Yüksek Dalga: ${Math.max(game?.highestWave || 1, game?.wave || 1)} • Sıralama Aktif`;
        if (lbMyBtn) lbMyBtn.textContent = 'Hesabım';
    } else {
        if (headerLabel) headerLabel.textContent = 'Giriş Yap';
        if (guestView) guestView.classList.remove('hidden');
        if (loggedView) loggedView.classList.add('hidden');

        if (lbMyName) lbMyName.textContent = 'Misafir Komutan';
        if (lbMyStatus) lbMyStatus.textContent = 'Sıralamaya adınla girmek için hesap bağla!';
        if (lbMyBtn) lbMyBtn.textContent = 'Hesap Bağla';
    }
}

function openAuthModal() {
    updateAccountHeaderUI();
    const errEl = document.getElementById('auth-error-msg');
    if (errEl) errEl.classList.add('hidden');
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

async function submitUsernameAuth() {
    const userInp = document.getElementById('auth-username');
    const passInp = document.getElementById('auth-password');
    const username = (userInp ? userInp.value : '').trim();
    const password = (passInp ? passInp.value : '').trim();

    if (username.length < 3) { showAuthError('⚠️ Kullanıcı adı en az 3 karakter olmalı!'); return; }
    if (password.length < 4) { showAuthError('⚠️ Şifre en az 4 karakter olmalı!'); return; }

    if (isFirebaseReady && fbAuth) {
        const email = sanitizeUsernameToEmail(username);
        try {
            if (authFormMode === 'register') {
                const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
                if (cred.user) await cred.user.updateProfile({ displayName: username });
                showToast(`🎉 Hoş geldin ${username}! Hesabın oluşturuldu.`);
            } else {
                await fbAuth.signInWithEmailAndPassword(email, password);
                showToast(`✅ Tekrar hoş geldin ${username}!`);
            }
            if (passInp) passInp.value = '';
            closeAuthModal();
            refreshLeaderboard(false);
            return;
        } catch (err) {
            showAuthError(`❌ Giriş Hatası: ${err.message || 'Bilgileri kontrol et.'}`);
            return;
        }
    }

    let accounts = {};
    try { accounts = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}'); } catch (e) {}
    const key = username.toLowerCase();

    if (authFormMode === 'register') {
        if (accounts[key]) { showAuthError('⚠️ Bu kullanıcı adı zaten alınmış! Giriş yap sekmesini dene.'); return; }
        accounts[key] = {
            uid: 'local_' + Date.now().toString(36),
            username: username,
            password: btoa(unescape(encodeURIComponent(password))),
            savedGame: typeof game !== 'undefined' ? game : null,
            updatedAt: Date.now()
        };
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
        currentUser = { uid: accounts[key].uid, username: username, isCloud: false };
        localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));
        updateAccountHeaderUI();
        await pushScoreToLeaderboard();
        refreshLeaderboard(false);
        if (passInp) passInp.value = '';
        closeAuthModal();
        showToast(`🎉 ${username} hesabı oluşturuldu!`);
    } else {
        const acc = accounts[key];
        const encodedPass = btoa(unescape(encodeURIComponent(password)));
        if (!acc || acc.password !== encodedPass) { showAuthError('❌ Kullanıcı adı veya şifre hatalı!'); return; }
        currentUser = { uid: acc.uid, username: acc.username, isCloud: false };
        localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));

        if (acc.savedGame && typeof game !== 'undefined' && (acc.savedGame.highestWave || 1) > (game.highestWave || 1)) {
            applyParsedGameData(acc.savedGame);
            tower.maxHp = getTowerMaxHp();
            tower.hp = tower.maxHp;
            buildUpgradesUI();
            buildInventoryUI();
            updateHUD();
        }
        updateAccountHeaderUI();
        await pushScoreToLeaderboard();
        refreshLeaderboard(false);
        if (passInp) passInp.value = '';
        closeAuthModal();
        showToast(`✅ Hoş geldin ${acc.username}!`);
    }
}

async function loginWithGoogle() {
    if (isFirebaseReady && fbAuth) {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await fbAuth.signInWithPopup(provider);
            closeAuthModal();
            showToast('✅ Google hesabınla bağlandın!');
            return;
        } catch (err) {
            showAuthError(`❌ Google Giriş Hatası: ${err.message}`);
            return;
        }
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const gName = (currentUser && currentUser.username) ? currentUser.username : `Komutan_${randomNum}`;
    currentUser = { uid: 'google_sim_' + gName.toLowerCase(), username: gName, isCloud: false };
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));
    await forceCloudPush(true);
    updateAccountHeaderUI();
    refreshLeaderboard(false);
    closeAuthModal();
    showToast(`✅ Google (${gName}) ile hızlı giriş yapıldı!`);
}

function changeDisplayNickname() {
    if (!currentUser) return;
    const newName = prompt('Liderlik tablosunda görünecek yeni komutan adını gir:', currentUser.username);
    if (!newName || newName.trim().length < 3) return;
    currentUser.username = newName.trim().slice(0, 18);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));
    updateAccountHeaderUI();
    forceCloudPush(true);
    refreshLeaderboard(false);
    showToast(`✨ Komutan adın "${currentUser.username}" olarak güncellendi!`);
}

async function logoutAccount() {
    if (isFirebaseReady && fbAuth) {
        try { await fbAuth.signOut(); } catch (e) {}
    }
    currentUser = null;
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    updateAccountHeaderUI();
    refreshLeaderboard(false);
    showToast('👋 Hesaptan çıkış yapıldı.');
}

function scheduleCloudSave() {
    if (!currentUser) return;
    clearTimeout(cloudSaveDebounceTimer);
    cloudSaveDebounceTimer = setTimeout(() => {
        forceCloudPush(true);
    }, 4000);
}

async function forceCloudPush(silent = false) {
    if (!currentUser || typeof game === 'undefined') {
        if (!silent) showToast('⚠️ Önce giriş yapmalısın!');
        return;
    }

    try {
        if (isFirebaseReady && fbDb && currentUser.isCloud) {
            await fbDb.collection('users').doc(currentUser.uid).set({
                username: currentUser.username,
                saveData: JSON.stringify(game),
                highestWave: Math.max(game.highestWave || 1, game.wave || 1),
                updatedAt: Date.now()
            }, { merge: true });
        } else {
            let accounts = {};
            try { accounts = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}'); } catch (e) {}
            const key = currentUser.username.toLowerCase();
            if (!accounts[key]) accounts[key] = { uid: currentUser.uid, username: currentUser.username, password: '' };
            accounts[key].savedGame = game;
            accounts[key].updatedAt = Date.now();
            localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
        }

        await pushScoreToLeaderboard();
        setElText('auth-last-sync', `Son Bulut Kaydı: ${new Date().toLocaleTimeString('tr-TR')}`);
        if (!silent) showToast('☁️ İlerlemen başarıyla buluta kaydedildi!');
    } catch (err) {
        if (!silent) showToast('❌ Bulut kaydı sırasında hata oluştu.');
    }
}

async function forceCloudPull(silent = false) {
    if (!currentUser || typeof game === 'undefined') return;

    try {
        let cloudGame = null;
        if (isFirebaseReady && fbDb && currentUser.isCloud) {
            const doc = await fbDb.collection('users').doc(currentUser.uid).get();
            if (doc.exists && doc.data().saveData) cloudGame = JSON.parse(doc.data().saveData);
        } else {
            const accounts = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}');
            const acc = accounts[currentUser.username.toLowerCase()];
            if (acc && acc.savedGame) cloudGame = acc.savedGame;
        }

        if (cloudGame) {
            const cloudMax = Math.max(cloudGame.highestWave || 1, cloudGame.wave || 1);
            const localMax = Math.max(game.highestWave || 1, game.wave || 1);

            if (!silent || cloudMax > localMax) {
                applyParsedGameData(cloudGame);
                tower.maxHp = getTowerMaxHp();
                tower.hp = tower.maxHp;
                tower.maxShield = getTowerMaxShield();
                tower.shield = tower.maxShield;
                localStorage.setItem(SAVE_KEY, JSON.stringify(game));
                buildUpgradesUI();
                buildInventoryUI();
                updateHUD();
                showToast(`☁️ Bulut kaydı yüklendi! (Dalga ${game.wave})`);
            }
        } else if (!silent) {
            showToast('ℹ️ Bulutta henüz kayıtlı veri bulunamadı.');
        }
    } catch (err) {
        if (!silent) showToast('❌ Buluttan veri çekilemedi.');
    }
}

function getDefaultRivalsForLeaderboard() {
    return [
        { uid: 'npc_1', username: 'CyberValkyrie', highestWave: 85, wave: 82, activeSkin: 'cosmic_emperor', damage: 148500, prestiges: 14, updatedAt: Date.now() - 120000 },
        { uid: 'npc_2', username: 'NeonReaper_TR', highestWave: 64, wave: 60, activeSkin: 'inferno_lord', damage: 42300, prestiges: 9, updatedAt: Date.now() - 360000 },
        { uid: 'npc_3', username: 'QuantumHunter', highestWave: 48, wave: 48, activeSkin: 'void_reaper', damage: 12900, prestiges: 6, updatedAt: Date.now() - 800000 },
        { uid: 'npc_4', username: 'KuleMuhafizi', highestWave: 32, wave: 29, activeSkin: 'emerald_guardian', damage: 3450, prestiges: 3, updatedAt: Date.now() - 1500000 },
        { uid: 'npc_5', username: 'NovaSniper', highestWave: 19, wave: 18, activeSkin: 'frost_core', damage: 820, prestiges: 1, updatedAt: Date.now() - 2900000 }
    ];
}

function setLeaderboardSort(sortType) {
    leaderboardSortBy = sortType === 'damage' ? 'damage' : 'wave';
    const wBtn = document.getElementById('lb-sort-wave');
    const dBtn = document.getElementById('lb-sort-damage');
    if (wBtn) {
        wBtn.className = leaderboardSortBy === 'wave'
            ? 'py-1.5 rounded-lg font-tech font-bold text-xs bg-amber-600 text-white transition'
            : 'py-1.5 rounded-lg font-tech font-bold text-xs text-slate-400 hover:text-white transition';
    }
    if (dBtn) {
        dBtn.className = leaderboardSortBy === 'damage'
            ? 'py-1.5 rounded-lg font-tech font-bold text-xs bg-amber-600 text-white transition'
            : 'py-1.5 rounded-lg font-tech font-bold text-xs text-slate-400 hover:text-white transition';
    }
    refreshLeaderboard(false);
}

async function pushScoreToLeaderboard() {
    if (typeof game === 'undefined') return;
    const playerEntry = {
        uid: currentUser ? currentUser.uid : 'local_guest',
        username: currentUser ? currentUser.username : 'Misafir Komutan',
        highestWave: Math.max(game.highestWave || 1, game.wave || 1),
        wave: game.wave || 1,
        activeSkin: game.activeSkin || 'default_cyber',
        damage: typeof getTowerDamage === 'function' ? Math.round(getTowerDamage()) : 12,
        prestiges: (game.stats && game.stats.prestiges) ? game.stats.prestiges : 0,
        updatedAt: Date.now()
    };

    if (isFirebaseReady && fbDb && currentUser && currentUser.isCloud) {
        try { await fbDb.collection('leaderboard').doc(currentUser.uid).set(playerEntry, { merge: true }); } catch (e) {}
    }

    try {
        let list = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || 'null');
        if (!Array.isArray(list) || list.length === 0) list = getDefaultRivalsForLeaderboard();
        const existingIdx = list.findIndex(x => x.uid === playerEntry.uid || x.username.toLowerCase() === playerEntry.username.toLowerCase());
        if (existingIdx > -1) list[existingIdx] = { ...list[existingIdx], ...playerEntry };
        else list.push(playerEntry);
        localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list));
    } catch (e) {}
}

async function refreshLeaderboard(showNotification = false) {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    await pushScoreToLeaderboard();
    updateAccountHeaderUI();

    let entries = [];
    if (isFirebaseReady && fbDb) {
        try {
            const snap = await fbDb.collection('leaderboard').orderBy('highestWave', 'desc').limit(30).get();
            snap.forEach(doc => entries.push(doc.data()));
        } catch (e) {}
    }

    if (entries.length === 0) {
        try { entries = JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || '[]'); }
        catch (e) { entries = getDefaultRivalsForLeaderboard(); }
    }

    entries.sort((a, b) => {
        if (leaderboardSortBy === 'damage') {
            if ((b.damage || 0) !== (a.damage || 0)) return (b.damage || 0) - (a.damage || 0);
            return (b.highestWave || 0) - (a.highestWave || 0);
        }
        if ((b.highestWave || 0) !== (a.highestWave || 0)) return (b.highestWave || 0) - (a.highestWave || 0);
        return (b.damage || 0) - (a.damage || 0);
    });

    const myUid = currentUser ? currentUser.uid : 'local_guest';
    let myRank = '-';

    container.innerHTML = entries.map((p, idx) => {
        const rank = idx + 1;
        const isMe = p.uid === myUid || (currentUser && p.username.toLowerCase() === currentUser.username.toLowerCase());
        if (isMe) myRank = rank;

        const skinDef = (typeof SKIN_DATABASE !== 'undefined' && SKIN_DATABASE[p.activeSkin]) ? SKIN_DATABASE[p.activeSkin] : { name: 'Siber Çekirdek', emoji: '💠' };

        let rankBadge = `<span class="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-tech font-bold text-xs flex items-center justify-center shrink-0">#${rank}</span>`;
        if (rank === 1) rankBadge = `<span class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-tech font-bold text-xs flex items-center justify-center shrink-0">🥇</span>`;
        else if (rank === 2) rankBadge = `<span class="w-6 h-6 rounded-lg bg-slate-300/20 border border-slate-300 text-slate-200 font-tech font-bold text-xs flex items-center justify-center shrink-0">🥈</span>`;
        else if (rank === 3) rankBadge = `<span class="w-6 h-6 rounded-lg bg-amber-700/25 border border-amber-600 text-amber-400 font-tech font-bold text-xs flex items-center justify-center shrink-0">🥉</span>`;

        return `
            <div class="premium-card p-2.5 flex items-center justify-between gap-2 ${isMe ? 'border-emerald-400/70 bg-emerald-950/25' : ''}">
                <div class="flex items-center gap-2.5 min-w-0">
                    ${rankBadge}
                    <canvas id="lb-skin-canvas-${idx}" width="42" height="42" class="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 shrink-0"></canvas>
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                            <span class="font-tech font-bold text-xs sm:text-sm ${isMe ? 'text-emerald-300' : 'text-white'} truncate">${p.username}</span>
                            ${isMe ? '<span class="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-tech font-bold text-emerald-300">SEN</span>' : ''}
                        </div>
                        <div class="text-[10px] text-slate-400 truncate">${skinDef.emoji} ${skinDef.name}</div>
                        <div class="flex items-center gap-2 text-[10px] font-tech mt-0.5">
                            <span class="text-red-400 font-bold">⚔️ ${formatNumber(p.damage || 12)}</span>
                            <span class="text-purple-300 font-bold">🔥 ${p.prestiges || 0} Prestij</span>
                        </div>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <div class="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 font-tech font-bold text-xs text-amber-300">
                        Dalga ${p.highestWave || 1}
                    </div>
                    <div class="text-[9px] text-slate-400 font-tech mt-0.5">Aktif: D.${p.wave || 1}</div>
                </div>
            </div>
        `;
    }).join('');

    setElText('lb-my-rank', `#${myRank}`);

    entries.forEach((p, idx) => {
        const cEl = document.getElementById(`lb-skin-canvas-${idx}`);
        if (cEl && typeof drawCustomTowerSkin === 'function') {
            const cCtx = cEl.getContext('2d');
            cCtx.clearRect(0, 0, cEl.width, cEl.height);
            cCtx.save();
            cCtx.translate(cEl.width / 2 - 1, cEl.height / 2);
            cCtx.scale(0.68, 0.68);
            drawCustomTowerSkin(cCtx, p.activeSkin || 'default_cyber', 0, 0, 1, 0);
            cCtx.restore();
        }
    });

    if (showNotification) showToast('🏆 Liderlik tablosu güncellendi!');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAuthAndCloudSystem, 200);
});

// =======================================================
// MOBİL & TABLET ÖZEL DÜZENLEME: YAN YANA KÜÇÜK CAN/DALGA KUTUSU
// =======================================================
(function setupMobileHudAndSettingsFix() {
    function injectMobileHudCSS() {
        if (document.getElementById('mobile-hud-side-by-side-css')) return;
        const st = document.createElement('style');
        st.id = 'mobile-hud-side-by-side-css';
        st.textContent = `
            @media (max-width: 1024px) {
                header, body > div > header, #main-body > header {
                    position: relative !important;
                    z-index: 9500 !important;
                    padding-left: 6px !important;
                    padding-right: 6px !important;
                    max-width: 100vw !important;
                    overflow: hidden !important;
                }
                #hud-top-bar {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: stretch !important;
                    justify-content: flex-start !important;
                    gap: 6px !important;
                    top: 8px !important;
                    right: auto !important;
                    width: auto !important;
                    max-width: calc(100vw - 12px) !important;
                    transform: none !important;
                    pointer-events: none !important;
                    z-index: 25 !important;
                }
                #hud-hp-card, #hud-wave-card {
                    width: 152px !important;
                    max-width: 45vw !important;
                    min-width: 0 !important;
                    padding: 5px 7px !important;
                    border-radius: 9px !important;
                    pointer-events: auto !important;
                    background: rgba(15, 23, 42, 0.88) !important;
                }
                #hud-top-bar * {
                    font-size: 9.5px !important;
                    line-height: 1.15 !important;
                }
                #ui-hp-text, #ui-shield-text, #ui-hud-regen, #ui-hud-armor, #ui-wave-progress-text {
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                #upgrade-drawer {
                    max-height: 100dvh !important;
                }
                #attack-upgrades-list, #defense-upgrades-list, #economy-upgrades-list,
                #companions-list, #prestige-upgrades-list, #tab-items, #tab-lootbox, #tab-casino, #tab-leaderboard {
                    padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 75px) !important;
                }
            }
        `;
        document.head.appendChild(st);

        const settingsBtn = document.querySelector('[onclick*="openSettingsModal"]') ||
                            Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.fa-gear, .fa-cog'));
        if (settingsBtn && !settingsBtn.dataset.mobileFixed) {
            settingsBtn.dataset.mobileFixed = '1';
            settingsBtn.style.position = 'relative';
            settingsBtn.style.zIndex = '9999';
            settingsBtn.style.pointerEvents = 'auto';
            settingsBtn.style.flexShrink = '0';
            settingsBtn.addEventListener('touchend', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                openSettingsModal();
            }, { passive: false });
        }

        const toggleBtn = document.getElementById('mobilePanelToggleBtn');
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                toggleUpgradeDrawer();
                toggleBtn.innerHTML = isDrawerOpen ? '🔽 Paneli Gizle' : '🔼 Yükseltmeleri Aç';
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectMobileHudCSS);
    } else {
        injectMobileHudCSS();
    }
    setInterval(injectMobileHudCSS, 1000);
})();
