// ==========================================
// BÖLÜM: ARAYÜZ (UI), MENÜLER VE MOBİL HUD DÜZENİ
// ==========================================

// Hata paneli: JavaScript hataları ve yakalanmamış Promise hatalarını anlaşılır göster.
function showDebugErrorBanner(message, details = '') {
    let errBanner = document.getElementById('debug-error-banner');
    if (!errBanner) {
        errBanner = document.createElement('div');
        errBanner.id = 'debug-error-banner';
        errBanner.setAttribute('role', 'alert');
        errBanner.style.cssText = 'position:fixed;bottom:max(12px,env(safe-area-inset-bottom));left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));max-height:35dvh;overflow:auto;background:rgba(127,29,29,0.97);color:#fff;padding:10px 12px;border-radius:12px;font-size:12px;font-family:ui-monospace,monospace;z-index:99999;border:1px solid #f87171;box-shadow:0 10px 25px rgba(0,0,0,0.5);';
        const heading = document.createElement('div');
        heading.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:800;margin-bottom:4px;';
        const title = document.createElement('span');
        title.textContent = '⚠️ OYUN HATASI';
        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Kapat';
        close.setAttribute('aria-label', 'Hata panelini kapat');
        close.style.cssText = 'padding:3px 8px;border:1px solid rgba(255,255,255,.35);border-radius:6px;background:rgba(0,0,0,.2);color:#fff;font-size:11px;';
        close.addEventListener('click', () => errBanner.remove());
        heading.append(title, close);
        const body = document.createElement('div');
        body.id = 'debug-error-message';
        body.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.4;';
        errBanner.append(heading, body);
        document.body.appendChild(errBanner);
    }
    const body = document.getElementById('debug-error-message');
    if (body) body.textContent = details ? message + '\n' + details : message;
}
window.addEventListener('error', function (e) {
    const file = e.filename ? e.filename.split('/').pop() : 'Bilinmeyen dosya';
    showDebugErrorBanner('JavaScript hatası: ' + (e.message || 'Bilinmeyen hata'), file + ' • Satır ' + (e.lineno || '?') + ':' + (e.colno || '?'));
});
window.addEventListener('unhandledrejection', function (e) {
    const reason = e.reason;
    const message = reason && reason.message ? reason.message : String(reason || 'Bilinmeyen Promise hatası');
    showDebugErrorBanner('İşlem tamamlanamadı: ' + message, 'Yakalanmamış Promise hatası');
});

// 60 FPS DOM Performans Önbelleği: Aynı metni saniyede 60 kez tekrar yazmayı engeller
const _domTextCache = {};
function setElText(id, text) {
    const str = String(text ?? '');
    const el = document.getElementById(id);
    if (el && el.textContent !== str) {
        el.textContent = str;
        _domTextCache[id] = str;
    }
}

// XSS Güvenlik Filtresi (Liderlik tablosu ve kullanıcı adları için)
function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// Eksik olan renderItemIconHTML fonksiyonu (Tam Korumalı Yedekli Sürüm)
// render_4.js'deki sanatlı sürüm varsa onu ezmesin diye yalnızca YEDEK olarak tanımlanır
if (typeof window.renderItemIconHTML !== 'function') window.renderItemIconHTML = function (item, sizeCls = 'w-10 h-10') {
    if (!item) return `<div class="${sizeCls} rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">❓</div>`;

    if (typeof window.customRenderItemIcon === 'function') {
        return window.customRenderItemIcon(item, sizeCls);
    }

    if (item.svg) {
        return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-inner overflow-hidden">${item.svg}</div>`;
    }

    if (item.img || item.image) {
        return `<img src="${item.img || item.image}" alt="${escapeHtml(item.name || '')}" class="${sizeCls} rounded-xl object-contain bg-slate-950/90 border border-white/10 p-1 shrink-0">`;
    }

    const colorCls = item.color || 'text-amber-400';
    if (item.icon && item.icon.includes('fa-')) {
        return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center shrink-0 shadow-inner ${colorCls}"><i class="${item.icon} text-lg"></i></div>`;
    }

    const emoji = item.emoji || item.icon || '🔮';
    return `<div class="${sizeCls} rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center shrink-0 shadow-inner text-lg">${emoji}</div>`;
};

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
    // Reject unknown upgrade keys and malformed state before reading costs or mutating progression.
    if (!game || !game.upgrades || !UPGRADE_DEFS ||
        typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(UPGRADE_DEFS, key) ||
        !Number.isFinite(game.gold) || !Number.isFinite(game.upgrades[key])) return;

    const def = UPGRADE_DEFS[key];
    const info = getBulkUpgradeInfo(key);
    if (!def || !info || info.maxed || info.lockedReason || !info.canAfford ||
        !Number.isFinite(info.totalCost) || info.totalCost < 0 || info.totalCost > game.gold ||
        !Number.isInteger(info.count) || info.count < 1 ||
        game.upgrades[key] + info.count > def.maxLevel) return;
    const prevMaxHp = getTowerMaxHp();
    game.gold -= info.totalCost;
    game.upgrades[key] += info.count;
    if (typeof window._syncShadow === 'function') window._syncShadow();
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
    if (currentTab === 'companions') buildCompanionsUI();
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
    // UI callbacks are user-controlled; validate the requested companion before dereferencing it.
    if (!game || !game.companions || !COMPANION_DEFS ||
        typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(COMPANION_DEFS, key) ||
        !Number.isFinite(game.crystals)) return;

    const def = COMPANION_DEFS[key];
    const st = game.companions[key];
    if (!def || !st || !Array.isArray(def.starCosts)) return;
    const star = st.unlocked ? Math.min(5, Math.max(1, Number(st.level) || 1)) : 0;
    if (star >= 5) return;

    const cost = def.starCosts[star];
    if (!Number.isFinite(cost) || cost < 0 || game.crystals < cost) return;

    game.crystals -= cost;
    if (!st.unlocked) {
        st.unlocked = true;
        st.level = 1;
        showToast(`⭐ ${def.name} (1★) yörüngeye yerleşti!`);
    } else {
        st.level = Math.min(5, star + 1);
        showToast(`🌟 ${def.name} ${st.level}★ seviyesine yükseldi!`);
    }
    if (typeof window._syncShadow === 'function') window._syncShadow();
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
        if (window._syncShadow) window._syncShadow(); // büyük ruh kazancı anti-cheat tarafından geri alınmasın
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

        if (typeof window._syncShadow === 'function') window._syncShadow();
        buildUpgradesUI();
        updateHUD();
        saveGame(true);
        showToast(`Evrimleşildi! +${formatNumber(pending)} Ruh Taşı kazanıldı.`);
    });
}

function buyPrestigeUpgrade(key) {
    if (!game || !game.prestigeUpgrades || !PRESTIGE_DEFS ||
        typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(PRESTIGE_DEFS, key) ||
        !Number.isFinite(game.souls)) return;

    const def = PRESTIGE_DEFS[key];
    if (!def || !Number.isFinite(def.baseCost) || !Number.isFinite(def.costScale) ||
        !Number.isFinite(def.maxLevel)) return;
    const lvl = game.prestigeUpgrades[key] || 0;
    if (!Number.isFinite(lvl) || lvl < 0 || !Number.isFinite(def.maxLevel) ||
        !Number.isFinite(def.baseCost) || !Number.isFinite(def.costScale)) return;
    const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lvl));

    if (!Number.isFinite(cost) || cost < 0 || lvl >= def.maxLevel || game.souls < cost) return;

    game.souls -= cost;
    game.prestigeUpgrades[key] = lvl + 1;

    buildPrestigeUI();
    refreshUpgradeButtonsState();
    updateHUD();
    saveGame(true);
}

let activeMiniGame = 'roulette';
let bjState = { playerHand: [], dealerHand: [], active: false };
let _secureBjVault = null;
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
    ['roulette', 'blackjack', 'quantum'].forEach(t => {
        const el = document.getElementById(`mg-${t}`);
        const btn = document.getElementById(`mg-btn-${t}`);
        if (el) el.classList.toggle('hidden', t !== gameType);
        if (btn) btn.className = t === gameType
            ? 'py-2 rounded-xl bg-amber-600 text-white font-tech font-bold text-xs transition'
            : 'py-2 rounded-xl bg-slate-800 text-slate-300 font-tech font-bold text-xs transition';
    });
    if (gameType === 'roulette') drawRouletteWheel();
    if (gameType === 'quantum') {
        drawQuantumBar();
        const info = document.getElementById('quantum-rules-text');
        if (info) info.innerHTML = `Çubuk kayarken <b class="text-yellow-300">sarı</b> bölgede kilitle: <b class="text-yellow-300">x${QUANTUM_CFG.yellowMult}</b>, <b class="text-sky-300">mavi</b> bölgede: <b class="text-sky-300">x${QUANTUM_CFG.blueMult}</b>. Kaçırırsan bahis gider ve kombo sıfırlanır. Her başarı çubuğu hızlandırır. En fazla ${QUANTUM_CFG.maxBet} 💎 bahis.`;
    }
}

function setCasinoBetVal(val) {
    const betInp = document.getElementById('casino-bet');
    if (betInp) betInp.value = val;
}

// Dışarıdan (Konsoldan) erişilemeyen gizli kasa değişkeni
let _secureRouletteVault = null;

function playRoulette(choice) {
    if (rouletteAnim.spinning) { showToast('Çark zaten dönüyor!'); return; }
    const betInp = document.getElementById('casino-bet');
    const bet = Math.floor(Number(betInp ? betInp.value : 0));
    if (!Number.isFinite(bet) || bet <= 0 || bet > game.crystals) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= bet; updateHUD(); saveGame(true);
    
    const winIndex = Math.floor(Math.random() * ROULETTE_SECTORS.length), winSec = ROULETTE_SECTORS[winIndex], sliceAngle = (Math.PI * 2) / ROULETTE_SECTORS.length;
    
    // Bahsi, seçimi ve sonucu dondurarak koruma altına alıyoruz:
    _secureRouletteVault = Object.freeze({
        bet: bet,
        choice: choice,
        winSec: Object.freeze({ ...winSec })
    });

    rouletteAnim.spinning = true; rouletteAnim.startTime = performance.now(); rouletteAnim.duration = 2600; rouletteAnim.userChoice = choice; rouletteAnim.betAmount = bet; rouletteAnim.winningSector = winSec;
    rouletteAnim.startWheelAngle = rouletteAnim.wheelAngle % (Math.PI * 2); rouletteAnim.targetWheelAngle = (-Math.PI / 2 - (winIndex * sliceAngle + sliceAngle / 2)) + Math.PI * 2 * 5;
    rouletteAnim.startBallAngle = rouletteAnim.ballAngle % (Math.PI * 2); rouletteAnim.targetBallAngle = -Math.PI / 2 - Math.PI * 2 * 6;
    setElText('roulette-wheel-display', 'ÇARK DÖNÜYOR...');
    const resEl = document.getElementById('roulette-result');
    if (resEl) resEl.innerHTML = '<span class="text-amber-300 animate-pulse">Top dönüyor, bol şans!</span>';
    ['red', 'green', 'black'].forEach(c => { const b = document.getElementById(`btn-roul-${c}`); if (b) b.disabled = true; });
}

function finishRouletteSpin() {
    if (!_secureRouletteVault) {
        rouletteAnim.spinning = false;
        ['red', 'green', 'black'].forEach(c => { const b = document.getElementById(`btn-roul-${c}`); if (b) b.disabled = false; });
        return;
    }

    const lockedBet = _secureRouletteVault.bet;
    const lockedChoice = _secureRouletteVault.choice;
    const winSec = _secureRouletteVault.winSec;
    _secureRouletteVault = null;

    ['red', 'green', 'black'].forEach(c => { const b = document.getElementById(`btn-roul-${c}`); if (b) b.disabled = false; });
    const resultColor = winSec.color, mult = resultColor === 'green' ? 14 : 2;
    const display = document.getElementById('roulette-wheel-display'), resText = document.getElementById('roulette-result');
    if (display) {
        display.textContent = `${resultColor === 'green' ? 'YEŞİL' : (resultColor === 'red' ? 'KIRMIZI' : 'SİYAH')} (${winSec.num})`;
        display.className = `font-tech font-bold text-sm py-1 px-3 rounded-lg border border-slate-800 shadow-inner ${resultColor === 'green' ? 'text-emerald-400 bg-emerald-950/40' : (resultColor === 'red' ? 'text-red-400 bg-red-950/40' : 'text-slate-200 bg-slate-950')}`;
    }
    if (lockedChoice === resultColor) {
        const win = lockedBet * mult; game.crystals += win; if (window._syncShadow) window._syncShadow();
        if (resText) resText.innerHTML = `<span class="text-emerald-400 font-bold">KAZANDIN! +${win} 💎</span>`;
        showToast(`Rulet Kazancı: +${win} Kristal!`);
    } else if (resText) {
        resText.innerHTML = `<span class="text-red-400 font-bold">KAYBETTİN! -${lockedBet} 💎</span>`;
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
    if (bjState.active) return;
    const betInp = document.getElementById('casino-bet');
    const bet = Math.floor(Number(betInp ? betInp.value : 0));
    if (!Number.isFinite(bet) || bet <= 0 || bet > game.crystals) { showToast('Yeterli kristalin yok!'); return; }
    game.crystals -= bet; saveGame(true);
    _secureBjVault = Object.freeze({ bet: bet });
    bjState = { bet, active: true, playerHand: [drawCard(), drawCard()], dealerHand: [drawCard(), drawCard()] };
    const stEl = document.getElementById('bj-actions-start'), plEl = document.getElementById('bj-actions-play');
    if (stEl) stEl.classList.add('hidden');
    if (plEl) plEl.classList.remove('hidden');
    updateBlackjackUI(false); updateHUD();
}

function hitBlackjack() {
    if (!bjState.active || !_secureBjVault) return;
    bjState.playerHand.push(drawCard());
    if (calcHand(bjState.playerHand) > 21) {
        _secureBjVault = null;
        endBlackjack('Bust! 21\'i geçtin, kaybettin.');
    } else {
        updateBlackjackUI(false);
    }
}

function standBlackjack() {
    if (!bjState.active || !_secureBjVault) return;
    const lockedBet = _secureBjVault.bet;
    _secureBjVault = null;

    let dSum = calcHand(bjState.dealerHand);
    while (dSum < 17) { bjState.dealerHand.push(drawCard()); dSum = calcHand(bjState.dealerHand); }
    const pSum = calcHand(bjState.playerHand);
    if (dSum > 21 || pSum > dSum) { const win = lockedBet * 2; game.crystals += win; if (window._syncShadow) window._syncShadow(); endBlackjack(`KAZANDIN! +${win} 💎`); }
    else if (pSum === dSum) { game.crystals += lockedBet; if (window._syncShadow) window._syncShadow(); endBlackjack('BERABERE! Kristal iade edildi.'); }
    else endBlackjack(`KAYBETTİN! Bot kazandı.`);
}

function endBlackjack(msg) {
    bjState.active = false;
    _secureBjVault = null;
    updateBlackjackUI(true);
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

// Beceri Odaklı Mini Oyun: Kuantum Frekans Kilidi
// ---- KUANTUM DENGE AYARLARI (zorluk/ödül buradan değişir) ----
// Simülasyonla ayarlandı: çok usta oyuncu ~%110, normal oyuncu ~%85, acemi ~%60 geri dönüş alır.
const QUANTUM_CFG = {
    blueHalf: 0.05,    // sadece görsel: mavi bandın yarı genişliği (toplam %10)
    yellowHalf: 0.012, // sadece görsel: sarı bandın yarı genişliği (toplam %2.4)
    radius: 0.065,     // gerçek sonuç bu yarıçaptan hesaplanır (bandın biraz dışı dahil, keskin kesim yok)
    winProbMin: 0.04,  // merkezden çok uzak kilit: neredeyse hep kayıp
    winProbMax: 0.52,  // tam merkeze kilit: yine de sadece %52 kazanma ihtimali (blackjack gibi, garanti değil)
    jackpotShareMin: 0.05, // kazanınca "kusursuz" (sarı/yüksek ödül) çıkma payı, en kötü zamanlamada
    jackpotShareMax: 0.42, // en iyi zamanlamada bile kazanan elin sadece %42'si kusursuz oluyor
    blueMult: 1.15,    // mavi kilit: bahsin 1.15 katı geri (net +%15)
    yellowMult: 1.8,   // sarı kilit: bahsin 1.8 katı geri
    comboStep: 0.015,  // her kombo ödüle +%1.5
    comboCap: 3,        // kombo bonusu en fazla +%4.5
    speedBase: 2.2,    // başlangıç çubuk hızı
    speedStep: 0.22,   // kombo başına hız artışı
    speedMax: 4.2,     // en yüksek çubuk hızı
    jitterMin: 0.82,   // her sekmede hız çarpanı rastgele bu aralıkta değişir (ritim ezberlenmesin)
    jitterMax: 1.18,
    maxBet: 100        // tur başına en yüksek bahis (kristal)
};
// pos: çubuğun o anki konumu, center: o turun hedef merkezi -> [0,1] "zamanlama kalitesi" (1 = tam merkez)
function _quantumSkill(pos, center) {
    const d = Math.abs(pos - center);
    return Math.max(0, Math.min(1, 1 - d / QUANTUM_CFG.radius));
}
// Kesirli ödülü adil yuvarla (küçük bahislerde sistematik kazanç/kayıp olmasın)
function _quantumRoundWin(x) { const f = Math.floor(x); return f + (Math.random() < x - f ? 1 : 0); }
function _quantumComboBonus(combo) { return 1 + Math.min(QUANTUM_CFG.comboCap, combo) * QUANTUM_CFG.comboStep; }

let qHack = { active: false, pos: 0.5, dir: 1, speed: 1.5, jitter: 1, center: 0.5, minB: 0.32, maxB: 0.68, minY: 0.46, maxY: 0.54, combo: 0 };
let _secureQuantumVault = null;

function handleQuantumAction() {
    if (!qHack.active) {
        const betInp = document.getElementById('casino-bet');
        const bet = Math.floor(Number(betInp ? betInp.value : 0));
        if (!Number.isFinite(bet) || bet <= 0 || bet > game.crystals) { showToast('Yeterli kristalin yok!'); return; }
        if (bet > QUANTUM_CFG.maxBet) { showToast(`Kuantumda en fazla ${QUANTUM_CFG.maxBet} 💎 bahis yapabilirsin.`); return; }
        game.crystals -= bet; saveGame(true);
        updateHUD();
        _secureQuantumVault = Object.freeze({ bet: bet });
        qHack.active = true;
        qHack.pos = 0;
        qHack.dir = 1;
        qHack.jitter = 1;
        qHack.speed = Math.min(QUANTUM_CFG.speedMax, QUANTUM_CFG.speedBase + qHack.combo * QUANTUM_CFG.speedStep);
        const center = 0.25 + Math.random() * 0.50;
        qHack.center = center;
        qHack.minB = center - QUANTUM_CFG.blueHalf; qHack.maxB = center + QUANTUM_CFG.blueHalf;
        qHack.minY = center - QUANTUM_CFG.yellowHalf; qHack.maxY = center + QUANTUM_CFG.yellowHalf;

        const btn = document.getElementById('btn-quantum-action');
        if (btn) { btn.textContent = '⚡ ŞİMDİ KİLİTLE!'; btn.className = 'w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-tech font-bold text-xs shadow animate-pulse'; }
        qHack.lastT = 0;
        requestAnimationFrame(stepQuantumLoop);
    } else {
        qHack.active = false;
        if (!_secureQuantumVault) {
            const b = document.getElementById('btn-quantum-action');
            if (b) { b.textContent = 'FREKANSI BAŞLAT'; b.className = 'w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow transition'; }
            return;
        }
        const lockedBet = _secureQuantumVault.bet;
        _secureQuantumVault = null;

        // Zamanlama ne kadar iyiyse ihtimal o kadar yükselir ama hiçbir zaman garanti olmaz (blackjack mantığı)
        const comboBonus = _quantumComboBonus(qHack.combo);
        const skill = _quantumSkill(qHack.pos, qHack.center);
        const winChance = QUANTUM_CFG.winProbMin + (QUANTUM_CFG.winProbMax - QUANTUM_CFG.winProbMin) * skill;
        if (Math.random() < winChance) {
            qHack.combo++;
            const jackpotChance = QUANTUM_CFG.jackpotShareMin + (QUANTUM_CFG.jackpotShareMax - QUANTUM_CFG.jackpotShareMin) * skill;
            if (Math.random() < jackpotChance) {
                const win = _quantumRoundWin(lockedBet * QUANTUM_CFG.yellowMult * comboBonus);
                game.crystals += win; if (window._syncShadow) window._syncShadow();
                showToast(`🎯 KUSURSUZ KİLİT! +${win} 💎 (${qHack.combo}x Kombo!)`);
            } else {
                const win = _quantumRoundWin(lockedBet * QUANTUM_CFG.blueMult * comboBonus);
                game.crystals += win; if (window._syncShadow) window._syncShadow();
                showToast(`⚡ STABİL KİLİT! +${win} 💎 (${qHack.combo}x Kombo!)`);
            }
        } else {
            qHack.combo = 0;
            showToast(`💥 FREKANS KAÇTI! -${lockedBet} 💎`);
        }
        setElText('quantum-combo-text', `Kombo Serisi: ${qHack.combo}x (Çarpan: x${_quantumComboBonus(qHack.combo).toFixed(2)})`);
        const btn = document.getElementById('btn-quantum-action');
        if (btn) { btn.textContent = 'FREKANSI BAŞLAT'; btn.className = 'w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow transition'; }
        drawQuantumBar(); updateHUD(); refreshUpgradeButtonsState(); saveGame(true);
    }
}

function stepQuantumLoop(now) {
    if (!qHack.active) return;
    if (!qHack.lastT) qHack.lastT = now;
    const dt = Math.min(0.05, (now - qHack.lastT) / 1000);
    qHack.lastT = now;
    qHack.pos += dt * 0.96 * qHack.speed * qHack.jitter * qHack.dir;
    // Her uçta hız biraz rastgele değişir: ritmi ezberleyip "metronom gibi" her seferinde doğru anı yakalamak zorlaşır
    if (qHack.pos >= 1) { qHack.pos = 1; qHack.dir = -1; qHack.jitter = QUANTUM_CFG.jitterMin + Math.random() * (QUANTUM_CFG.jitterMax - QUANTUM_CFG.jitterMin); }
    if (qHack.pos <= 0) { qHack.pos = 0; qHack.dir = 1; qHack.jitter = QUANTUM_CFG.jitterMin + Math.random() * (QUANTUM_CFG.jitterMax - QUANTUM_CFG.jitterMin); }
    drawQuantumBar();
    requestAnimationFrame(stepQuantumLoop);
}

function drawQuantumBar() {
    const c = document.getElementById('quantumHackCanvas');
    if (!c) return;
    const g = c.getContext('2d'), w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#0f172a'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(56, 189, 248, 0.35)'; g.fillRect(w * qHack.minB, 0, w * (qHack.maxB - qHack.minB), h);
    g.fillStyle = 'rgba(250, 204, 21, 0.85)'; g.fillRect(w * qHack.minY, 0, w * (qHack.maxY - qHack.minY), h);
    g.fillStyle = '#ffffff'; g.fillRect(w * qHack.pos - 2, 0, 4, h);
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
    // Only the two UI-supported pack sizes are valid; negative counts would mint currency.
    if (![1, 5].includes(count) || !game || !Number.isFinite(game.crystals) ||
        !game.lootboxBonuses || !Number.isFinite(game.lootboxBonuses.totalOpened) ||
        !Array.isArray(game.inventory) || !ITEM_DATABASE) return;

    const totalItems = Object.keys(ITEM_DATABASE).length;
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

        let pool = Object.values(ITEM_DATABASE).filter(item => item && item.rarity === rarity);
        // Keep opening functional if a rarity has no entries in the current item database.
        if (pool.length === 0) {
            pool = Object.values(ITEM_DATABASE).filter(item => item && typeof item.id === 'string' && !game.inventory.includes(item.id));
        }
        if (pool.length === 0) break;

        const item = pool[Math.floor(Math.random() * pool.length)];
        if (!item || typeof item.id !== 'string') continue;
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
    if (![1, 5].includes(count) || !game || !Number.isFinite(game.crystals)) return;
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
    if (![1, 5].includes(count) || !game || !Number.isFinite(game.crystals)) return;
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
    if (!game || !Array.isArray(game.ownedSkins) || !SKIN_DATABASE ||
        typeof skinId !== 'string' || !Object.prototype.hasOwnProperty.call(SKIN_DATABASE, skinId) ||
        !game.ownedSkins.includes(skinId)) return;
    game.activeSkin = skinId;
    const skin = SKIN_DATABASE[skinId];
    showToast(`Kule Skini Kuşanıldı: ${skin.emoji} ${skin.name}`);
    buildInventoryUI(); saveGame(true);
}

function selectCompanionSkin(skinId) {
    if (!game) return;
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];
    if (!COMPANION_SKIN_DATABASE || typeof skinId !== 'string' ||
        !Object.prototype.hasOwnProperty.call(COMPANION_SKIN_DATABASE, skinId) ||
        !game.ownedCompanionSkins.includes(skinId)) return;
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

let inventoryRarityFilter = 'all';
let inventoryTypeFilter = 'all';
let inventorySearchQuery = '';

function setInventoryFilter(kind, value) {
    const normalized = String(value || 'all');
    if (kind === 'rarity') inventoryRarityFilter = normalized;
    else if (kind === 'type') inventoryTypeFilter = normalized;
    else if (kind === 'search') inventorySearchQuery = normalized.trim().toLocaleLowerCase('tr-TR');
    buildInventoryUI();
}

function showItemDetails(itemId) {
    const item = typeof ITEM_DATABASE !== 'undefined' ? ITEM_DATABASE[itemId] : null;
    if (!item) { showToast('Bu eşya artık mevcut değil.'); return; }
    const rarityNames = { rare: 'Nadir', super_rare: 'Süper Nadir', epic: 'Epik', mythic: 'Mitik', legendary: 'Efsanevi' };
    const typeNames = {
        damage: 'Hasar', damage_mult: 'Çarpan Hasarı', hp: 'Can', crit: 'Kritik Şans',
        critMult: 'Kritik Hasar', speed: 'Saldırı Hızı', lifesteal: 'Can Çalma',
        gold: 'Altın', range: 'Menzil', armor: 'Zırh', regen: 'Can Yenileme',
        crystal: 'Kristal', shield: 'Kalkan', multishot_buff: 'Çoklu Atış'
    };
    const rarity = rarityNames[item.rarity] || 'Eşya';
    const type = typeNames[item.type] || item.type || 'Özel';
    if (typeof window.showInspectPopup === 'function') {
        window.showInspectPopup(item.name, rarity + ' • ' + type, item.desc || 'Açıklama yok.', game.equippedItems.includes(itemId) ? 'KUŞANILDI' : 'ENVANTERDE', '#38bdf8');
    } else {
        showToast(item.name + ': ' + (item.desc || rarity + ' • ' + type));
    }
}

function toggleRaritySortOrder() {
    raritySortDescending = !raritySortDescending;
    setElText('sort-rarity-label', raritySortDescending ? 'Nadirlik: En Yüksek' : 'Nadirlik: En Düşük');
    buildInventoryUI();
}

function toggleEquipItem(itemId) {
    if (!Array.isArray(game.equippedItems)) game.equippedItems = [];
    if (!Array.isArray(game.inventory)) game.inventory = [];

    // Normalize corrupted/legacy state first: only known owned items, unique IDs, max 3 slots.
    game.equippedItems = [...new Set(game.equippedItems)]
        .filter(id => typeof id === 'string' && ITEM_DATABASE[id] && game.inventory.includes(id))
        .slice(0, 3);

    if (typeof itemId !== 'string' || !ITEM_DATABASE[itemId] || !game.inventory.includes(itemId)) {
        showToast('🛡️ Bu eşyaya sahip değilsin veya eşya geçersiz.');
        return;
    }

    const idx = game.equippedItems.indexOf(itemId);
    if (idx > -1) {
        game.equippedItems.splice(idx, 1);
        showToast('Eşya çıkarıldı.');
    } else {
        if (game.equippedItems.length >= 3) {
            showToast('En fazla 3 farklı eşya kuşanabilirsin!');
            return;
        }
        game.equippedItems.push(itemId);
        showToast('Eşya kuşanıldı!');
    }
    if (typeof window._syncShadow === 'function') window._syncShadow();
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

    // Repair duplicate/invalid inventory IDs immediately, including data already loaded
    // into a live session before this guard ran. An item ID represents one unique owned item.
    const normalizedInventory = [...new Set(game.inventory)]
        .filter(id => typeof id === 'string' && typeof ITEM_DATABASE !== 'undefined' &&
            Object.prototype.hasOwnProperty.call(ITEM_DATABASE, id));
    const inventoryWasNormalized = normalizedInventory.length !== game.inventory.length;
    game.inventory = normalizedInventory;

    game.equippedItems = [...new Set(game.equippedItems)]
        .filter(id => typeof id === 'string' && ITEM_DATABASE[id] && game.inventory.includes(id))
        .slice(0, 3);
    if (!Array.isArray(game.ownedSkins)) game.ownedSkins = ['default_cyber'];
    if (!Array.isArray(game.ownedCompanionSkins)) game.ownedCompanionSkins = ['default_tech'];

    setElText('badge-equipped-count', `${game.equippedItems.length}/3`);
    updateLootboxCollectionCounters();

    // Persist a one-time cleanup so duplicates do not return after reload/cloud sync.
    if (inventoryWasNormalized && typeof saveGame === 'function') saveGame(true);

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
            const sortedIds = [...game.inventory].filter(id => {
                const item = ITEM_DATABASE[id];
                if (!item) return false;
                if (inventoryRarityFilter !== 'all' && item.rarity !== inventoryRarityFilter) return false;
                if (inventoryTypeFilter !== 'all' && item.type !== inventoryTypeFilter) return false;
                if (inventorySearchQuery && !(String(item.name || '').toLocaleLowerCase('tr-TR').includes(inventorySearchQuery) ||
                    String(item.desc || '').toLocaleLowerCase('tr-TR').includes(inventorySearchQuery))) return false;
                return true;
            }).sort((a, b) => {
                const itemA = ITEM_DATABASE[a], itemB = ITEM_DATABASE[b];
                const rA = rOrder[itemA.rarity] || 0, rB = rOrder[itemB.rarity] || 0;
                if (rA !== rB) return sortDesc ? (rB - rA) : (rA - rB);
                return itemA.name.localeCompare(itemB.name, 'tr');
            });

            if (sortedIds.length === 0) {
                invList.innerHTML = '<div class="col-span-2 text-center py-6 text-xs text-slate-500">Bu filtrelerle eşya bulunamadı.</div>';
            } else invList.innerHTML = sortedIds.map(id => {
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
                            <div class="min-w-0 flex-1">
                                <div class="font-tech font-bold text-xs text-white leading-tight">${item.name}</div>
                                <div class="text-[10px] text-slate-400 leading-tight mt-0.5">${item.desc}</div>
                            </div>
                        </div>
                        <button type="button" onclick="event.stopPropagation(); showItemDetails('${item.id}')" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-800/80 py-1.5 text-[10px] font-bold text-cyan-200 hover:bg-slate-700" aria-label="${item.name} ayrıntıları"><i class="fa-solid fa-circle-info mr-1"></i>Detaylar</button>
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
    const hpRatio = Math.max(0, Math.min(1, tower.hp / Math.max(1, tower.maxHp)));
    const hpBar = document.getElementById('ui-hp-bar');
    const hpCard = document.getElementById('hud-hp-card');
    const hpCriticalBadge = document.getElementById('ui-hp-critical');
    const hpText = document.getElementById('ui-hp-text');
    const isCriticalHp = tower.hp > 0 && hpRatio <= 0.25;
    if (hpBar) {
        hpBar.style.width = `${hpRatio * 100}%`;
        hpBar.classList.toggle('hud-critical-bar', isCriticalHp);
    }
    if (hpCard) hpCard.classList.toggle('hud-critical', isCriticalHp);
    if (hpCriticalBadge) hpCriticalBadge.classList.toggle('hidden', !isCriticalHp);
    if (hpText) hpText.classList.toggle('hud-critical-text', isCriticalHp);

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

    const armorVal = formatNumber(getTowerArmor());
    const dmgVal = formatNumber(getTowerDamage());
    const spdVal = getTowerFireRate().toFixed(2);
    const critVal = `%${getTowerCritChance()}`;
    const multiVal = getEffectiveMultishot();

    setElText('ui-hud-regen', `${formatNumber(getTowerRegen())}/sn`);
    setElText('ui-hud-armor', armorVal);
    setElText('ui-wave-badge', `DALGA ${game.wave}`);
    const bossWarn = document.getElementById('ui-boss-warning');
    if (bossWarn) bossWarn.classList.toggle('hidden', game.wave % 5 !== 0);
    setElText('ui-wave-progress-text', `${game.waveKills} / ${game.waveTargetKills}`);
    const wBar = document.getElementById('ui-wave-bar');
    if (wBar) wBar.style.width = `${Math.min(100, (game.waveKills / Math.max(1, game.waveTargetKills)) * 100)}%`;
    setElText('ui-active-enemies', typeof enemies !== 'undefined' ? enemies.length : 0);

    setElText('ui-Quick-dmg', dmgVal);
    setElText('ui-Quick-spd', spdVal);
    setElText('ui-Quick-crit', critVal);
    setElText('ui-Quick-multi', multiVal);

    setElText('ui-drawer-hp', formatNumber(tower.hp));
    setElText('ui-drawer-armor', armorVal);
    setElText('ui-drawer-dmg', dmgVal);
    setElText('ui-drawer-spd', spdVal);
    setElText('ui-drawer-crit', critVal);
    setElText('ui-drawer-multi', multiVal);
}

function switchTab(tab) {
    currentTab = tab;
    const tabs = ['attack', 'defense', 'economy', 'companions', 'items', 'lootbox', 'prestige', 'casino', 'leaderboard'];
    tabs.forEach(t => {
        const content = document.getElementById(`tab-${t}`), btn = document.getElementById(`tab-btn-${t}`);
        if (content) content.classList.toggle('hidden', t !== tab);
        if (btn) { if (t === tab) btn.classList.add('tab-active'); else btn.classList.remove('tab-active'); }
    });
    if (tab === 'companions') buildCompanionsUI();
    if (tab === 'items' || tab === 'lootbox') buildInventoryUI();
    if (tab === 'prestige') buildPrestigeUI();
    if (tab === 'casino' && activeMiniGame === 'roulette') drawRouletteWheel();
    if (tab === 'casino' && activeMiniGame === 'quantum') drawQuantumBar();
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
// KAYIT SİSTEMİ (LOCALSTORAGE + İMZA DOĞRULAMA + BULUT SENKRONİZASYONU)
// =======================================================
function isCompatibleSaveShape(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    if (typeof getDefaultState !== 'function') return false;

    const defaults = getDefaultState();
    let visited = 0;
    function matchesShape(value, template, depth) {
        if (++visited > 5000 || depth > 12) return false;
        if (Array.isArray(template)) return Array.isArray(value) && value.length <= 5000 && value.every(item => typeof item === 'string' && item.length <= 100);
        if (template === null) return value === null || value === undefined;
        if (typeof template === 'number') return typeof value === 'number' && Number.isFinite(value);
        if (typeof template === 'boolean') return typeof value === 'boolean';
        if (typeof template === 'string') return typeof value === 'string' && value.length <= 1000;
        if (template && typeof template === 'object') {
            if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
            if (Object.keys(value).length > 500) return false;
            for (const key of Object.keys(template)) {
                if (Object.prototype.hasOwnProperty.call(value, key) &&
                    !matchesShape(value[key], template[key], depth + 1)) return false;
            }
            return true;
        }
        return true;
    }

    let boundedNodes = 0;
    function isBoundedTree(value, depth) {
        if (++boundedNodes > 5000 || depth > 12) return false;
        if (value === null || typeof value === 'boolean') return true;
        if (typeof value === 'number') return Number.isFinite(value);
        if (typeof value === 'string') return value.length <= 1000;
        if (Array.isArray(value)) {
            if (value.length > 5000) return false;
            return value.every(item => isBoundedTree(item, depth + 1));
        }
        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length > 500) return false;
            return keys.every(key => isBoundedTree(value[key], depth + 1));
        }
        return false;
    }

    // Validate unknown fields too: they must not smuggle huge/deep objects into game state.
    return isBoundedTree(parsed, 0) && matchesShape(parsed, defaults, 0);
}

function applyParsedGameData(parsed) {
    if (!isCompatibleSaveShape(parsed)) return false;
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
    // Normalize semantic values as well as JSON shape: valid-looking saves can still contain
    // impossible levels, unknown inventory IDs, or duplicate equipment slots.
    if (typeof UPGRADE_DEFS !== 'undefined') {
        for (const key of Object.keys(game.upgrades)) {
            const upgradeDef = UPGRADE_DEFS[key];
            if (!upgradeDef) {
                delete game.upgrades[key];
                continue;
            }
            const rawLevel = Number(game.upgrades[key]);
            game.upgrades[key] = Math.min(upgradeDef.maxLevel, Math.max(0, Number.isFinite(rawLevel) ? Math.floor(rawLevel) : 0));
        }
    }
    if (typeof PRESTIGE_DEFS !== 'undefined') {
        for (const key of Object.keys(game.prestigeUpgrades)) {
            const prestigeDef = PRESTIGE_DEFS[key];
            if (!prestigeDef) {
                delete game.prestigeUpgrades[key];
                continue;
            }
            const rawLevel = Number(game.prestigeUpgrades[key]);
            game.prestigeUpgrades[key] = Math.min(prestigeDef.maxLevel, Math.max(0, Number.isFinite(rawLevel) ? Math.floor(rawLevel) : 0));
        }
    }
    if (typeof ITEM_DATABASE !== 'undefined') {
        game.inventory = [...new Set(game.inventory.filter(id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(ITEM_DATABASE, id)))];
        game.equippedItems = [...new Set(game.equippedItems)]
            .filter(id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(ITEM_DATABASE, id) && game.inventory.includes(id))
            .slice(0, 3);
    }
    if (typeof SKIN_DATABASE !== 'undefined') {
        game.ownedSkins = [...new Set(['default_cyber', ...game.ownedSkins.filter(id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(SKIN_DATABASE, id))])];
        if (!game.ownedSkins.includes(game.activeSkin)) game.activeSkin = 'default_cyber';
    }
    if (typeof COMPANION_SKIN_DATABASE !== 'undefined') {
        game.ownedCompanionSkins = [...new Set(['default_tech', ...game.ownedCompanionSkins.filter(id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(COMPANION_SKIN_DATABASE, id))])];
        if (!game.ownedCompanionSkins.includes(game.activeCompanionSkin)) game.activeCompanionSkin = 'default_tech';
    }
    if (typeof COMPANION_DEFS !== 'undefined') {
        for (const key of Object.keys(COMPANION_DEFS)) {
            if (!game.companions[key]) game.companions[key] = { unlocked: false, level: 0 };
            if (game.companions[key].unlocked) {
                const rawLevel = Number(game.companions[key].level);
                game.companions[key].level = Math.min(5, Math.max(1, Number.isFinite(rawLevel) ? Math.floor(rawLevel) : 1));
            } else {
                game.companions[key].level = 0;
            }
        }
        for (const key of Object.keys(game.companions)) {
            if (!Object.prototype.hasOwnProperty.call(COMPANION_DEFS, key)) delete game.companions[key];
        }
    }
    for (const key of ['gold', 'crystals', 'souls']) {
        const value = Number(game[key]);
        game[key] = Number.isFinite(value) ? Math.max(0, value) : 0;
    }
    game.wave = Math.max(1, Math.floor(Number(game.wave) || 1));
    game.highestWave = Math.max(game.wave, Math.floor(Number(game.highestWave) || 1));
    // Yüklenen kayıt (bulut / kod / hesap) meşru bir atlayış: anti-cheat gölgesini yeni duruma eşitle,
    // yoksa 400 ms sonra "geçersiz artış" diye dalga ve kristal geri alınır.
    if (typeof window._syncShadow === 'function') window._syncShadow();
}

function saveGame(silent = false) {
    try {
        if (typeof game === 'undefined') return;
        game.lastSaveTime = Date.now();
        game._sigVersion = 2;
        if (typeof window._generateSaveSignature === 'function') {
            game._sig = window._generateSaveSignature(game);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(game));
        if (game._sig) localStorage.setItem(SIGNED_MARK_KEY, '1');
        scheduleCloudSave();
    } catch (e) {}
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!isCompatibleSaveShape(parsed)) {
            console.warn('Kayıt yapısı geçersiz; yükleme reddedildi.');
            try { localStorage.setItem(SAVE_KEY + '_rejected_backup', raw); } catch (e2) {}
            try { if (typeof showToast === 'function') showToast('⚠️ Kayıt yapısı bozuk. Yedek korundu; kayıt yüklenmedi.'); } catch (e3) {}
            return;
        }
        if (typeof window._verifySaveSignature !== 'function' || !window._verifySaveSignature(parsed)) {
            console.warn('Kayıt imzası doğrulanamadı, varsayılan durum korunuyor.');
            // Hiçbir şeyi kaybetmemek için reddedilen kaydı yedekle (otomatik kayıt ana anahtarın üzerine yazacak)
            try { localStorage.setItem(SAVE_KEY + '_rejected_backup', raw); } catch (e2) {}
            try { if (typeof showToast === 'function') showToast('🛡️ Kayıt imzası geçersiz. Hesabın varsa bulut kaydın yüklenecek.'); } catch (e3) {}
            return;
        }
        const isUnsignedLegacySave = !parsed._sig;
        applyParsedGameData(parsed);

        // One-time local migration: preserve the original bytes before upgrading an accepted
        // unsigned legacy save. Cloud saves and imported save codes use separate, stricter paths.
        if (isUnsignedLegacySave && typeof window._generateSaveSignature === 'function') {
            try {
                const legacyBackupKey = SAVE_KEY + '_legacy_migration_backup';
                if (!localStorage.getItem(legacyBackupKey)) {
                    localStorage.setItem(legacyBackupKey, raw);
                }
                game._sigVersion = 2;
                game._sig = window._generateSaveSignature(game);
                if (game._sig) {
                    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
                    localStorage.setItem(SIGNED_MARK_KEY, '1');
                }
            } catch (migrationError) {
                // Keep the in-memory load usable; never report migration as successful here.
                console.warn('Eski kayıt yükseltilemedi; yedek ve kayıt alanı korunmaya çalışıldı.', migrationError);
            }
        }
    } catch (e) {}
}

// =======================================================
// 🔐 HESAP (LOGIN/KAYIT) + ☁️ BULUT KAYIT + 🏆 LİDERLİK TABLOSU
// =======================================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBzLARFUu-jpL3GBbmwXitR06_s-HX_spw",
    authDomain: "rid3mon-c311a.firebaseapp.com",
    projectId: "rid3mon-c311a",
    storageBucket: "rid3mon-c311a.firebasestorage.app",
    messagingSenderId: "598148206661",
    appId: "1:598148206661:web:fccfb31214ec5923e7d32c"
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
            // Automatically switch to long-polling where streaming channels are blocked by
            // restrictive browsers, privacy filters, or networks. Must be set before any reads/writes.
            fbDb.settings({ experimentalAutoDetectLongPolling: true });
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
    const trMap = { 'ç':'c', 'ğ':'g', 'ı':'i', 'i':'i', 'ö':'o', 'ş':'s', 'ü':'u' };
    let clean = (username || '').trim().toLowerCase();
    clean = clean.replace(/[çğışöü]/g, char => trMap[char] || char);
    clean = clean.replace(/[^a-z0-9_.-]/g, '');
    return `${clean || 'oyuncu_' + Math.floor(Math.random()*1000)}@kulesavunma.local`;
}


function normalizeUsernameKey(username) {
    const trMap = { 'ç':'c', 'ğ':'g', 'ı':'i', 'i':'i', 'ö':'o', 'ş':'s', 'ü':'u' };
    return String(username || '').trim().toLowerCase()
        .replace(/[çğıiöşü]/g, char => trMap[char] || char)
        .replace(/[^a-z0-9_.-]/g, '');
}

// Reserve names in Firestore, not only in the UI. The transaction makes two users
// racing for the same normalized name mutually exclusive.
async function reserveUniqueUsername(uid, requestedName, oldName = '', allowSuffix = false) {
    if (!fbDb || !uid) throw new Error('USERNAME_REGISTRY_UNAVAILABLE');
    const base = String(requestedName || '').trim().slice(0, 18);
    if (base.length < 3) throw new Error('USERNAME_INVALID');

    const candidates = [base];
    if (allowSuffix) {
        for (let i = 2; i <= 100; i++) {
            const suffix = '_' + i;
            candidates.push(base.slice(0, 18 - suffix.length) + suffix);
        }
    }

    for (const candidate of candidates) {
        const key = normalizeUsernameKey(candidate);
        if (key.length < 3) continue;
        const candidateRef = fbDb.collection('usernameRegistry').doc(key);
        try {
            await fbDb.runTransaction(async tx => {
                const candidateSnap = await tx.get(candidateRef);
                if (candidateSnap.exists && candidateSnap.data().uid !== uid) {
                    throw new Error('USERNAME_TAKEN');
                }
                tx.set(candidateRef, {
                    uid,
                    username: key,
                    updatedAt: Date.now()
                });
            });
            return candidate;
        } catch (err) {
            if (err && err.message === 'USERNAME_TAKEN' && allowSuffix) continue;
            throw err;
        }
    }
    throw new Error('USERNAME_TAKEN');
}

async function releaseUsernameReservation(uid, username, keepUsername = '') {
    if (!fbDb || !uid || !username) return;
    const key = normalizeUsernameKey(username);
    const keepKey = normalizeUsernameKey(keepUsername);
    if (!key || key === keepKey) return;
    const ref = fbDb.collection('usernameRegistry').doc(key);
    await fbDb.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (snap.exists && snap.data().uid === uid) tx.delete(ref);
    });
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

async function signInWithGoogle() {
    if (!isFirebaseReady || !fbAuth) {
        showAuthError('Firebase bağlantısı hazır değil. Lütfen tekrar dene.');
        return;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await fbAuth.signInWithPopup(provider);

        if (!result.user) {
            showAuthError('Google hesabı alınamadı. Tekrar dene.');
            return;
        }

        const googleUser = result.user;
        const requestedName =
            googleUser.displayName ||
            (googleUser.email ? googleUser.email.split('@')[0] : 'Komutan');
        const previousGoogleName = googleUser.displayName || requestedName;
        let username = requestedName;
        let reservedNameForCleanup = '';
        try {
            username = await reserveUniqueUsername(googleUser.uid, requestedName, previousGoogleName, true);
            reservedNameForCleanup = normalizeUsernameKey(username) !== normalizeUsernameKey(requestedName) ? username : '';
            if (username !== requestedName) {
                await googleUser.updateProfile({ displayName: username });
                reservedNameForCleanup = '';
                await releaseUsernameReservation(googleUser.uid, previousGoogleName, username);
            }
            if (currentUser && currentUser.uid === googleUser.uid) {
                currentUser.username = username;
                updateAccountHeaderUI();
            }
        } catch (reserveErr) {
            if (reservedNameForCleanup) {
                try { await releaseUsernameReservation(googleUser.uid, reservedNameForCleanup); } catch (releaseErr) {
                    console.error('[Username Registry] Failed to release Google reservation:', releaseErr);
                }
            }
            console.error('[Username Registry] Google name reservation failed:', reserveErr);
            try { await fbAuth.signOut(); } catch (signOutErr) {}
            currentUser = null;
            localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
            updateAccountHeaderUI();
            showAuthError('⚠️ Kullanıcı adı kontrol edilemedi; güvenli şekilde oturum kapatıldı. Firebase usernameRegistry kurallarını kontrol et.');
            return;
        }

        closeAuthModal();
        showToast(`Google ile giriş başarılı, ${username}!`);
        refreshLeaderboard(false);
    } catch (err) {
        console.error('Google giriş hatası:', err);
        showAuthError(
            err.code === 'auth/popup-closed-by-user'
                ? 'Giriş penceresi kapatıldı.'
                : `Google giriş hatası: ${err.message || 'Tekrar dene.'}`
        );
    }
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
                if (cred.user) {
                    await cred.user.updateProfile({ displayName: username });
                    let reservedNameForCleanup = '';
                    try {
                        const reservedName = await reserveUniqueUsername(cred.user.uid, username, '', true);
                        reservedNameForCleanup = reservedName;
                        if (reservedName !== username) await cred.user.updateProfile({ displayName: reservedName });
                        reservedNameForCleanup = '';
                    } catch (reserveErr) {
                        // Roll back a claim if the account/profile setup failed after reserving it.
                        if (reservedNameForCleanup) {
                            try { await releaseUsernameReservation(cred.user.uid, reservedNameForCleanup); } catch (releaseErr) {
                                console.error('[Username Registry] Failed to release rolled-back reservation:', releaseErr);
                            }
                        }
                        try { await cred.user.delete(); } catch (deleteErr) {
                            console.error('[Username Registry] Failed to roll back unreserved account:', deleteErr);
                        }
                        throw reserveErr;
                    }
                }
                showToast(`🎉 Hoş geldin ${fbAuth.currentUser.displayName || username}! Hesabın oluşturuldu.`);
            } else {
                const loginCred = await fbAuth.signInWithEmailAndPassword(email, password);
                if (loginCred.user) {
                    const existingName = loginCred.user.displayName || username;
                    let reservedNameForCleanup = '';
                    try {
                        const reservedName = await reserveUniqueUsername(loginCred.user.uid, existingName, existingName, true);
                        reservedNameForCleanup = reservedName !== existingName ? reservedName : '';
                        if (reservedName !== existingName) {
                            await loginCred.user.updateProfile({ displayName: reservedName });
                            reservedNameForCleanup = '';
                            await releaseUsernameReservation(loginCred.user.uid, existingName, reservedName);
                        }
                        reservedNameForCleanup = '';
                    } catch (reserveErr) {
                        if (reservedNameForCleanup) {
                            try { await releaseUsernameReservation(loginCred.user.uid, reservedNameForCleanup); } catch (releaseErr) {
                                console.error('[Username Registry] Failed to release rolled-back reservation:', releaseErr);
                            }
                        }
                        console.error('[Username Registry] Login name reservation failed:', reserveErr);
                        try { await fbAuth.signOut(); } catch (signOutErr) {}
                        currentUser = null;
                        localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
                        updateAccountHeaderUI();
                        showAuthError('⚠️ Kullanıcı adı kontrol edilemedi; güvenli şekilde oturum kapatıldı. Firebase usernameRegistry kurallarını kontrol et.');
                        return;
                    }
                }
                showToast(`✅ Tekrar hoş geldin ${fbAuth.currentUser.displayName || username}!`);
            }
            if (passInp) passInp.value = '';
            closeAuthModal();
            refreshLeaderboard(false);
            return;
        } catch (err) {
            if (authFormMode === 'register' && err && err.code === 'auth/email-already-in-use') {
                showAuthError('⚠️ Bu kullanıcı adı alınmış! Lütfen başka bir kullanıcı adı seç veya Giriş Yap sekmesini kullan.');
            } else if (err && (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found')) {
                showAuthError('❌ Kullanıcı adı veya şifre hatalı. Bilgilerini kontrol et.');
            } else {
                showAuthError(`❌ Giriş Hatası: ${err.message || 'Bilgileri kontrol et.'}`);
            }
            return;
        }
    }

    // Never create new password accounts in localStorage: Base64 is reversible, not password hashing.
    // Keep the legacy local-login path below temporarily so existing local-only players are not locked out.
    if (authFormMode === 'register') {
        showAuthError('⚠️ Hesap oluşturmak için güvenli bağlantı gerekli. İnternet bağlantını kontrol edip tekrar dene.');
        return;
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
    // Never simulate Google authentication: an offline/local profile is not a verified Google account.
    return signInWithGoogle();
}

async function changeDisplayNickname() {
    if (!currentUser) return;
    const newName = prompt('Liderlik tablosunda görünecek yeni komutan adını gir:', currentUser.username);
    if (!newName || newName.trim().length < 3) return;
    const cleanNick = newName.trim().slice(0, 18);
    if (cleanNick.length < 3) {
        showToast('⚠️ Komutan adı en az 3 karakter olmalı.');
        return;
    }

    if (isFirebaseReady && fbAuth && fbAuth.currentUser && currentUser.isCloud) {
        let reservedNameForCleanup = '';
        try {
            const reservedName = await reserveUniqueUsername(
                currentUser.uid, cleanNick, currentUser.username, false
            );
            reservedNameForCleanup = normalizeUsernameKey(reservedName) !== normalizeUsernameKey(currentUser.username) ? reservedName : '';
            if (fbAuth.currentUser.displayName !== reservedName) {
                await fbAuth.currentUser.updateProfile({ displayName: reservedName });
                reservedNameForCleanup = '';
            }
            await releaseUsernameReservation(currentUser.uid, currentUser.username, reservedName);
            currentUser.username = reservedName;
        } catch (err) {
            if (reservedNameForCleanup) {
                try { await releaseUsernameReservation(currentUser.uid, reservedNameForCleanup); } catch (releaseErr) {
                    console.error('[Username Registry] Failed to release nickname reservation:', releaseErr);
                }
            }
            if (err && err.message === 'USERNAME_TAKEN') {
                showToast('⚠️ Bu kullanıcı adı zaten alınmış. Başka bir ad seç.');
            } else {
                console.error('[Username Registry] Nickname update failed:', err);
                showToast('❌ İsim değişmedi. Benzersiz kullanıcı adı servisine ulaşılamadı.');
            }
            return;
        }
    } else {
        // Local-only profiles cannot enforce a global unique name; do not imply otherwise.
        showToast('⚠️ Benzersiz isim için Firebase hesabıyla giriş yapmalısın.');
        return;
    }
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(currentUser));

    updateAccountHeaderUI();
    await forceCloudPush(true);
    refreshLeaderboard(false);
    showToast(`✨ Komutan adın "${currentUser.username}" olarak güncellendi!`);
}

function openDeleteAccountConfirm() {
    if (!currentUser || !currentUser.isCloud) { showToast('Önce bir hesapla giriş yapmalısın.'); return; }
    openConfirmModal(
        'Hesabı Sil',
        'Hesabın, bulut kaydın ve liderlik tablosu kaydın KALICI olarak silinecek. Bu işlem GERİ ALINAMAZ. Devam edilsin mi?',
        deleteMyAccount
    );
}

async function deleteMyAccount() {
    if (!currentUser || !currentUser.isCloud) return;
    const uid = currentUser.uid;
    try {
        if (isFirebaseReady && fbDb) {
            await fbDb.collection('leaderboard').doc(uid).delete();
            await fbDb.collection('users').doc(uid).delete();
        }
    } catch (e) {
        showToast('❌ Hesap verileri silinemedi. Hiçbir şeyin tamamen silindiğini varsayma; tekrar dene.');
        return;
    }

    try {
        if (isFirebaseReady && fbAuth && fbAuth.currentUser) {
            await fbAuth.currentUser.delete();
        }
    } catch (e) {
        if (e && e.code === 'auth/requires-recent-login') {
            showToast('⚠️ Güvenlik gereği önce çıkış yapıp tekrar giriş yap, hemen ardından tekrar "Hesabı Sil" de.');
            return;
        }
        showToast('❌ Firebase hesabı silinemedi. Bazı veriler silinmiş olabilir; tekrar giriş yapıp silme işlemini yeniden dene.');
        return;
    }

    currentUser = null;
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    updateAccountHeaderUI();
    refreshLeaderboard(false);
    showToast('🗑️ Hesap ve oyun verileri silindi. Bazı güvenlik kayıtları ayrı tutulabilir.');
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
    if (typeof window._isSessionClean === 'function' && !window._isSessionClean()) return;

    try {
        // Bulut kopyası push anındaki değerlerle imzalansın (kayıttan sonra altın/kristal değişmiş olabilir)
        game._sigVersion = 2;
        if (typeof window._generateSaveSignature === 'function') game._sig = window._generateSaveSignature(game);
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
        // Keep autosave quiet, but retain diagnostics instead of swallowing Firestore failures.
        console.error('[Cloud Save] Firestore write failed:', err && err.code ? err.code : 'unknown', err);
        if (!silent) {
            const code = err && err.code ? err.code : 'unknown';
            showToast(`❌ Bulut kaydı başarısız (${code}). Yerel kayıt korunuyor.`);
        }
    }
}

async function forceCloudPull(silent = false) {
    if (!currentUser || typeof game === 'undefined') return;

    try {
        let cloudGame = null;
        if (isFirebaseReady && fbDb && currentUser.isCloud) {
            const doc = await fbDb.collection('users').doc(currentUser.uid).get();
            if (doc.exists && doc.data().saveData) {
                cloudGame = JSON.parse(doc.data().saveData);
                // Bound and validate the parsed payload before asking the signature routine to traverse it.
                if (!isCompatibleSaveShape(cloudGame)) {
                    if (!silent) showToast('⚠️ Kayıt yapısı bozuk; kayıt yüklenmedi.');
                    return;
                }
                if (!cloudGame._sig || typeof window._verifySaveSignature !== 'function' || !window._verifySaveSignature(cloudGame)) {
                    if (!silent) showToast('🛡️ Bulut kaydının imzası geçersiz; kayıt yüklenmedi.');
                    return;
                }
            }
        } else {
            const accounts = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}');
            const acc = accounts[currentUser.username.toLowerCase()];
            if (acc && acc.savedGame) cloudGame = acc.savedGame;
        }

        if (cloudGame && !isCompatibleSaveShape(cloudGame)) {
            if (!silent) showToast('⚠️ Kayıt yapısı bozuk; kayıt yüklenmedi.');
            return;
        }

        if (cloudGame) {
            // On a silent login pull, preserve the higher best-wave progress. When best wave
            // ties, prefer the newer save timestamp so a fresh device can recover same-wave
            // upgrades/currency/inventory instead of silently keeping its default local state.
            if (shouldApplyCloudSave(cloudGame, game, silent)) {
                applyParsedGameData(cloudGame);
                tower.maxHp = getTowerMaxHp();
                tower.hp = tower.maxHp;
                tower.maxShield = getTowerMaxShield();
                tower.shield = tower.maxShield;
                saveGame(true);
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

function shouldApplyCloudSave(cloudGame, localGame, silent) {
    if (!silent) return true;
    const cloudMax = Math.max(cloudGame.highestWave || 1, cloudGame.wave || 1);
    const localMax = Math.max(localGame.highestWave || 1, localGame.wave || 1);
    if (cloudMax > localMax) return true;
    if (cloudMax < localMax) return false;
    return Number(cloudGame.lastSaveTime || 0) > Number(localGame.lastSaveTime || 0);
}

function getCommanderBadge(highestWave = 1, prestiges = 0, bossKills = 0, totalKills = 0) {
    const wave = Math.max(1, Number(highestWave) || 1);
    const prestige = Math.max(0, Number(prestiges) || 0);
    const bosses = Math.max(0, Number(bossKills) || 0);
    const kills = Math.max(0, Number(totalKills) || 0);
    if (wave >= 250 || prestige >= 20) return { id: 'eternal', name: 'Sonsuz Komutan', icon: '♾️', className: 'text-fuchsia-200 bg-fuchsia-500/15 border-fuchsia-400/40' };
    if (wave >= 100 || prestige >= 10) return { id: 'legend', name: 'Efsane', icon: '👑', className: 'text-amber-200 bg-amber-500/15 border-amber-400/40' };
    if (wave >= 50 || prestige >= 5) return { id: 'elite', name: 'Elit Muhafız', icon: '💠', className: 'text-cyan-200 bg-cyan-500/15 border-cyan-400/40' };
    if (wave >= 25 || prestige >= 1) return { id: 'vanguard', name: 'Öncü', icon: '🛡️', className: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/40' };
    if (kills >= 1000) return { id: 'slayer', name: 'İmha Ustası', icon: '🎯', className: 'text-rose-200 bg-rose-500/15 border-rose-400/40' };
    if (bosses >= 1) return { id: 'boss_scout', name: 'Boss Kâşifi', icon: '🐲', className: 'text-violet-200 bg-violet-500/15 border-violet-400/40' };
    return { id: 'rookie', name: 'Yeni Komutan', icon: '⚔️', className: 'text-slate-200 bg-slate-500/15 border-slate-400/30' };
}

function getAchievementDefinitions() {
    const stats = game?.stats || {};
    const highestWave = Math.max(Number(game?.highestWave) || 1, Number(game?.wave) || 1);
    const kills = Math.max(0, Number(stats.totalKills) || 0);
    const bosses = Math.max(0, Number(stats.bossKills) || 0);
    const prestiges = Math.max(0, Number(stats.prestiges) || 0);
    const seconds = Math.max(0, Number(stats.playTimeSeconds) || 0);
    const skins = Array.isArray(game?.ownedSkins) ? new Set(game.ownedSkins).size : 1;
    const items = Array.isArray(game?.inventory) ? new Set(game.inventory).size : 0;
    const unlockedCompanions = Object.values(game?.companions || {}).filter(c => c && c.unlocked).length;
    return [
        { id: 'wave5', icon: '🌱', name: 'İlk Savunma', desc: '5. dalgaya ulaş', value: highestWave, target: 5, done: highestWave >= 5 },
        { id: 'wave25', icon: '🛡️', name: 'Öncü Komutan', desc: '25. dalgaya ulaş', value: highestWave, target: 25, done: highestWave >= 25 },
        { id: 'wave50', icon: '💠', name: 'Elit Muhafız', desc: '50. dalgaya ulaş', value: highestWave, target: 50, done: highestWave >= 50 },
        { id: 'wave100', icon: '👑', name: 'Dalga Efsanesi', desc: '100. dalgaya ulaş', value: highestWave, target: 100, done: highestWave >= 100 },
        { id: 'kills100', icon: '🎯', name: 'İlk Yüz', desc: '100 düşman imha et', value: kills, target: 100, done: kills >= 100 },
        { id: 'kills1000', icon: '💥', name: 'Temizleyici', desc: '1.000 düşman imha et', value: kills, target: 1000, done: kills >= 1000 },
        { id: 'boss1', icon: '🐲', name: 'İlk Boss', desc: 'İlk bossunu yen', value: bosses, target: 1, done: bosses >= 1 },
        { id: 'boss10', icon: '🐉', name: 'Boss Avcısı', desc: '10 boss yen', value: bosses, target: 10, done: bosses >= 10 },
        { id: 'prestige1', icon: '🔥', name: 'Yeniden Doğuş', desc: 'İlk prestijini yap', value: prestiges, target: 1, done: prestiges >= 1 },
        { id: 'skins5', icon: '🎨', name: 'Koleksiyoncu', desc: '5 kule görünümü topla', value: skins, target: 5, done: skins >= 5 },
        { id: 'companions3', icon: '🛰️', name: 'Filo Komutanı', desc: '3 yoldaşın kilidini aç', value: unlockedCompanions, target: 3, done: unlockedCompanions >= 3 },
        { id: 'play10h', icon: '⏱️', name: 'Kıdemli Savunmacı', desc: '10 saat oyna', value: seconds, target: 36000, done: seconds >= 36000, format: v => `${(v / 3600).toFixed(1)} sa` },
        { id: 'items10', icon: '💎', name: 'Emanetçi', desc: '10 farklı eşya biriktir', value: items, target: 10, done: items >= 10 }
    ];
}

function openAchievementsModal() {
    renderAchievementsModal();
    const modal = document.getElementById('achievements-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function renderAchievementsModal() {
    if (typeof game === 'undefined') return;
    const stats = game.stats || {};
    const highWave = Math.max(Number(game.highestWave) || 1, Number(game.wave) || 1);
    const badge = getCommanderBadge(highWave, stats.prestiges, stats.bossKills, stats.totalKills);
    const minutes = Math.floor(Math.max(0, Number(stats.playTimeSeconds) || 0) / 60);
    const ownedSkins = Array.isArray(game.ownedSkins) ? new Set(game.ownedSkins).size : 1;
    const ownedItems = Array.isArray(game.inventory) ? new Set(game.inventory).size : 0;
    const achievements = getAchievementDefinitions();
    const unlocked = achievements.filter(a => a.done).length;
    const progressEl = document.getElementById('achievement-progress');
    if (progressEl) progressEl.textContent = `${unlocked} / ${achievements.length} tamamlandı`;
    const badgeEl = document.getElementById('profile-badge');
    if (badgeEl) {
        badgeEl.className = `inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${badge.className}`;
        badgeEl.innerHTML = `<span class="text-xl">${badge.icon}</span><span>${badge.name}</span>`;
    }
    const values = {
        'profile-stat-wave': formatNumber(highWave),
        'profile-stat-kills': formatNumber(stats.totalKills || 0),
        'profile-stat-bosses': formatNumber(stats.bossKills || 0),
        'profile-stat-prestige': formatNumber(stats.prestiges || 0),
        'profile-stat-time': minutes >= 60 ? `${Math.floor(minutes / 60)} sa ${minutes % 60} dk` : `${minutes} dk`,
        'profile-stat-skins': formatNumber(ownedSkins),
        'profile-stat-items': formatNumber(ownedItems),
        'profile-stat-gold': formatNumber(game.gold || 0)
    };
    Object.entries(values).forEach(([id, value]) => setElText(id, value));
    const list = document.getElementById('achievements-list');
    if (list) list.innerHTML = achievements.map(a => {
        const current = Math.max(0, Number(a.value) || 0);
        const ratio = Math.max(0, Math.min(100, current / Math.max(1, a.target) * 100));
        const currentText = a.format ? a.format(current) : formatNumber(current);
        const targetText = a.format ? a.format(a.target) : formatNumber(a.target);
        return `<div class="rounded-xl border ${a.done ? 'border-emerald-400/35 bg-emerald-500/5' : 'border-white/10 bg-slate-950/60'} p-3">
            <div class="flex items-start gap-2.5">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.done ? 'bg-emerald-500/15' : 'bg-slate-800'} text-xl">${a.icon}</div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2"><div class="text-xs font-bold text-white">${a.name}</div><span class="text-[9px] font-bold ${a.done ? 'text-emerald-300' : 'text-slate-500'}">${a.done ? 'TAMAMLANDI ✓' : 'KİLİTLİ'}</span></div>
                    <p class="mt-0.5 text-[10px] text-slate-400">${a.desc}</p>
                    ${a.done ? `<div class="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-200" title="Kazanılan kozmetik başarı rozeti">${a.icon} ROZET AÇILDI</div>` : ''}
                    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div class="h-full rounded-full ${a.done ? 'bg-emerald-400' : 'bg-cyan-500'}" style="width:${ratio}%"></div></div>
                    <div class="mt-1 text-right text-[9px] text-slate-500">${currentText} / ${targetText}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}


const DAILY_MISSION_KEY = 'CoreTowerDefense_DailyMissions_v1';
let seasonMusicContext = null;
let seasonMusicOn = false;
let seasonMusicNodes = [];

function getLocalDayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readDailyMissionState() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(DAILY_MISSION_KEY) || 'null'); } catch (e) {}
    const today = getLocalDayKey();
    if (!saved || saved.date !== today || !saved.baseline) {
        saved = {
            date: today,
            baseline: {
                kills: Math.max(0, Number(game?.stats?.totalKills) || 0),
                bosses: Math.max(0, Number(game?.stats?.bossKills) || 0),
                playTime: Math.max(0, Number(game?.stats?.playTimeSeconds) || 0),
                wave: Math.max(1, Number(game?.wave) || 1)
            },
            claimed: []
        };
        try { localStorage.setItem(DAILY_MISSION_KEY, JSON.stringify(saved)); } catch (e) {}
    }
    if (!Array.isArray(saved.claimed)) saved.claimed = [];
    return saved;
}

function getDailyMissionDefinitions(state = readDailyMissionState()) {
    const stats = game?.stats || {};
    const kills = Math.max(0, Number(stats.totalKills) || 0) - state.baseline.kills;
    const bosses = Math.max(0, Number(stats.bossKills) || 0) - state.baseline.bosses;
    const playTime = Math.max(0, Number(stats.playTimeSeconds) || 0) - state.baseline.playTime;
    const waveDelta = Math.max(0, (Number(game?.wave) || 1) - state.baseline.wave);
    return [
        { id: 'daily-kills', icon: '🎯', title: 'Tehdit Temizliği', desc: 'Bugün 50 düşman imha et', progress: Math.min(50, kills), target: 50, rewardGold: 250, rewardCrystals: 4 },
        { id: 'daily-boss', icon: '🐉', title: 'Boss Avı', desc: 'Bugün 1 boss yen', progress: Math.min(1, bosses), target: 1, rewardGold: 200, rewardCrystals: 8 },
        { id: 'daily-time', icon: '⏱️', title: 'Nöbet Mesaisi', desc: 'Bugün 10 dakika savaş alanında kal', progress: Math.min(600, playTime), target: 600, rewardGold: 300, rewardCrystals: 5, format: v => `${Math.floor(v / 60)} dk` },
        { id: 'daily-waves', icon: '🌊', title: 'Dalga Dalgaya', desc: 'Bugün 5 dalga ilerle', progress: Math.min(5, waveDelta), target: 5, rewardGold: 350, rewardCrystals: 6 }
    ];
}

function openDailyMissionsModal() {
    renderDailyMissions();
    const modal = document.getElementById('daily-missions-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeDailyMissionsModal() {
    const modal = document.getElementById('daily-missions-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function renderDailyMissions() {
    if (typeof game === 'undefined') return;
    const state = readDailyMissionState();
    const missions = getDailyMissionDefinitions(state);
    const claimedCount = missions.filter(m => state.claimed.includes(m.id)).length;
    setElText('daily-missions-date', `Günlük hedefler • ${state.date}`);
    setElText('daily-missions-progress', `${claimedCount} / ${missions.length} ödül alındı`);
    const list = document.getElementById('daily-missions-list');
    if (!list) return;
    list.innerHTML = missions.map(m => {
        const value = Math.max(0, Number(m.progress) || 0);
        const done = value >= m.target;
        const claimed = state.claimed.includes(m.id);
        const percent = Math.max(0, Math.min(100, value / m.target * 100));
        const current = m.format ? m.format(value) : formatNumber(value);
        const target = m.format ? m.format(m.target) : formatNumber(m.target);
        const button = claimed
            ? '<button disabled class="shrink-0 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-300">ALINDI ✓</button>'
            : done
                ? `<button onclick="claimDailyMission('${m.id}')" class="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-slate-950 hover:bg-amber-400">ÖDÜLÜ AL</button>`
                : '<button disabled class="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-500">DEVAM ET</button>';
        return `<div class="rounded-xl border ${claimed ? 'border-emerald-400/25' : 'border-white/10'} bg-slate-950/70 p-3">
            <div class="flex items-start gap-2.5">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl">${m.icon}</div>
                <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-white">${m.title}</div><p class="mt-0.5 text-[10px] text-slate-400">${m.desc}</p>
                    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div class="h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-cyan-500'}" style="width:${percent}%"></div></div>
                    <div class="mt-1 flex flex-wrap justify-between gap-1 text-[9px] text-slate-500"><span>${current} / ${target}</span><span class="text-amber-300">+${formatNumber(m.rewardGold)} 🪙 · +${m.rewardCrystals} 💎</span></div>
                </div>
                ${button}
            </div>
        </div>`;
    }).join('');
}

function claimDailyMission(missionId) {
    const state = readDailyMissionState();
    const mission = getDailyMissionDefinitions(state).find(m => m.id === missionId);
    if (!mission || state.claimed.includes(mission.id) || mission.progress < mission.target) {
        showToast('Bu hedef henüz tamamlanmadı veya ödülü zaten alındı.');
        renderDailyMissions();
        return;
    }
    // Client-side daily goals are a convenience feature, not a trusted competitive reward system.
    game.gold = Math.max(0, Number(game.gold) || 0) + mission.rewardGold;
    game.crystals = Math.max(0, Number(game.crystals) || 0) + mission.rewardCrystals;
    state.claimed.push(mission.id);
    try { localStorage.setItem(DAILY_MISSION_KEY, JSON.stringify(state)); } catch (e) {}
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof saveGame === 'function') saveGame(true);
    renderDailyMissions();
    showToast(`🎁 Günlük hedef tamamlandı: +${formatNumber(mission.rewardGold)} altın, +${mission.rewardCrystals} kristal!`);
}

async function toggleSeasonMusic() {
    if (seasonMusicOn) {
        seasonMusicNodes.forEach(node => { try { node.stop(); } catch (e) {} try { node.disconnect(); } catch (e) {} });
        seasonMusicNodes = [];
        if (seasonMusicContext) {
            const oldContext = seasonMusicContext;
            seasonMusicContext = null;
            try { await oldContext.close(); } catch (e) {}
        }
        seasonMusicOn = false;
        updateSeasonMusicButton();
        showToast('🎵 Sezon müziği kapatıldı.');
        return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        showToast('Bu tarayıcıda Web Audio desteklenmiyor.');
        return;
    }
    try {
        const audio = new AudioContextClass();
        if (audio.state === 'suspended') await audio.resume();
        const master = audio.createGain();
        const filter = audio.createBiquadFilter();
        master.gain.value = 0.035;
        filter.type = 'lowpass';
        filter.frequency.value = 720;
        filter.Q.value = 0.4;
        filter.connect(master);
        master.connect(audio.destination);
        const tones = [
            { frequency: 110, type: 'sine', gain: 0.28 },
            { frequency: 164.81, type: 'sine', gain: 0.16 },
            { frequency: 220, type: 'triangle', gain: 0.08 }
        ];
        const nodes = [];
        tones.forEach(tone => {
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            osc.type = tone.type;
            osc.frequency.value = tone.frequency;
            gain.gain.value = tone.gain;
            osc.connect(gain);
            gain.connect(filter);
            osc.start();
            nodes.push(osc, gain);
        });
        const lfo = audio.createOscillator();
        const lfoGain = audio.createGain();
        lfo.frequency.value = 0.07;
        lfoGain.gain.value = 0.012;
        lfo.connect(lfoGain);
        lfoGain.connect(master.gain);
        lfo.start();
        nodes.push(lfo, lfoGain, filter, master);
        seasonMusicNodes = nodes;
        seasonMusicContext = audio;
        seasonMusicOn = true;
        updateSeasonMusicButton();
        showToast('🌌 Kuzey Işıkları ambient müziği açıldı.');
    } catch (err) {
        console.warn('[Season Music] Audio initialization failed:', err);
        showToast('Sezon müziği başlatılamadı; tarayıcı ses iznini kontrol et.');
    }
}

function updateSeasonMusicButton() {
    const button = document.getElementById('btn-season-music');
    if (!button) return;
    button.className = seasonMusicOn
        ? 'px-2 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 font-tech font-bold text-xs transition flex items-center gap-1'
        : 'px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-tech font-bold text-xs transition flex items-center gap-1';
    button.innerHTML = seasonMusicOn
        ? '<i class="fa-solid fa-volume-high text-xs"></i><span>Müzik Açık</span>'
        : '<i class="fa-solid fa-music text-xs"></i><span>Müzik</span>';
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

// Reduce needless rejected Firestore writes; server-side rules remain the actual enforcement.
const leaderboardCloudWriteAttempts = new Map();

async function pushScoreToLeaderboard() {
    if (typeof game === 'undefined') return;
    if (typeof window._isSessionClean === 'function' && !window._isSessionClean()) return;

    const cleanUsername = (currentUser ? currentUser.username : 'Misafir Komutan').slice(0, 20);
    const playerEntry = {
        uid: currentUser ? currentUser.uid : 'local_guest',
        username: cleanUsername,
        highestWave: Math.max(game.highestWave || 1, game.wave || 1),
        wave: game.wave || 1,
        activeSkin: game.activeSkin || 'default_cyber',
        damage: typeof getTowerDamage === 'function' ? Math.round(getTowerDamage()) : 12,
        prestiges: (game.stats && game.stats.prestiges) ? game.stats.prestiges : 0
    };

    if (isFirebaseReady && fbDb && currentUser && currentUser.isCloud) {
        const uid = currentUser.uid;
        const lastAttempt = leaderboardCloudWriteAttempts.get(uid) || 0;
        if (Date.now() - lastAttempt >= 20000) {
            // Score and persistent rate-limit timestamp must be committed atomically.
            // Keep the failure visible so Firestore rule/schema mismatches can be diagnosed.
            try {
                const batch = fbDb.batch();
                const serverTime = firebase.firestore.FieldValue.serverTimestamp();
                batch.set(fbDb.collection('leaderboardRateLimits').doc(uid), {
                    uid,
                    highestWave: playerEntry.highestWave,
                    updatedAt: serverTime
                }, { merge: true });
                batch.set(fbDb.collection('leaderboard').doc(uid), {
                    ...playerEntry,
                    updatedAt: serverTime
                }, { merge: true });
                await batch.commit();
                leaderboardCloudWriteAttempts.set(uid, Date.now());
                window._lastLeaderboardWriteError = null;
            } catch (e) {
                window._lastLeaderboardWriteError = e && e.code ? e.code : String(e);
                console.error('[Leaderboard] Firebase write rejected:', window._lastLeaderboardWriteError, e);
                if (typeof showToast === 'function') {
                    showToast('Firebase skor kaydı başarısız: ' + window._lastLeaderboardWriteError);
                }
                leaderboardCloudWriteAttempts.set(uid, Date.now());
            }
        }
    }
    playerEntry.updatedAt = Date.now();

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
        const pName = String(p.username || 'Komutan');
        const isMe = p.uid === myUid || (currentUser && pName.toLowerCase() === currentUser.username.toLowerCase());
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
                            <span class="font-tech font-bold text-xs sm:text-sm ${isMe ? 'text-emerald-300' : 'text-white'} truncate">${escapeHtml(pName)}</span>
                            <span title="${getCommanderBadge(p.highestWave, p.prestiges).name}" class="inline-flex shrink-0 items-center rounded border px-1 py-0.5 text-[9px] ${getCommanderBadge(p.highestWave, p.prestiges).className}">${getCommanderBadge(p.highestWave, p.prestiges).icon}</span>
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
})();
