// ==========================================
// BÖLÜM: ARAYÜZ (UI), MENÜLER VE MOBİL HUD DÜZENİ
// ==========================================


/* V2.3: small, original battle callouts and synthesized cues.
   This layer is deliberately cosmetic: it never changes game state or reward amounts. */
let battleSfxEnabled = true;
let battleAudioUnlocked = false;
let battleAudioContext = null;
let battleMomentHideTimer = null;
let battleMomentBossTimer = null;
let battleMomentClearTimer = null;
let battleIntroWaveShown = null;

function unlockBattleAudio() {
    battleAudioUnlocked = true;
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass || battleAudioContext) {
        if (battleAudioContext && battleAudioContext.state === 'suspended') battleAudioContext.resume().catch(() => {});
        return;
    }
    try {
        battleAudioContext = new AudioClass();
        if (battleAudioContext.state === 'suspended') battleAudioContext.resume().catch(() => {});
    } catch (error) {
        battleAudioContext = null;
    }
}
document.addEventListener('pointerdown', unlockBattleAudio, { once: true, passive: true });

function playBattleCue(kind) {
    if (!battleSfxEnabled || !battleAudioUnlocked || !battleAudioContext) return;
    const audio = battleAudioContext;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const patterns = {
        wave: [{ f: 392, t: 'sine', d: .12, at: 0, v: .045 }, { f: 587.33, t: 'triangle', d: .2, at: .09, v: .035 }],
        critical: [{ f: 196, t: 'square', d: .16, at: 0, v: .022 }, { f: 293.66, t: 'triangle', d: .19, at: .13, v: .038 }, { f: 440, t: 'sine', d: .24, at: .31, v: .032 }],
        reward: [{ f: 659.25, t: 'sine', d: .13, at: 0, v: .027 }, { f: 880, t: 'triangle', d: .16, at: .12, v: .032 }, { f: 1174.66, t: 'sine', d: .25, at: .25, v: .027 }],
        clear: [{ f: 523.25, t: 'triangle', d: .16, at: 0, v: .04 }, { f: 659.25, t: 'sine', d: .18, at: .1, v: .04 }, { f: 783.99, t: 'sine', d: .28, at: .2, v: .035 }],
        boss: [{ f: 92.5, t: 'sawtooth', d: .42, at: 0, v: .055 }, { f: 138.59, t: 'triangle', d: .36, at: .16, v: .045 }, { f: 207.65, t: 'sine', d: .26, at: .32, v: .03 }],
        bossKill: [{ f: 392, t: 'triangle', d: .14, at: 0, v: .04 }, { f: 523.25, t: 'sine', d: .18, at: .1, v: .045 }, { f: 783.99, t: 'triangle', d: .32, at: .2, v: .04 }, { f: 1046.5, t: 'sine', d: .25, at: .32, v: .025 }]
    };
    const notes = patterns[kind];
    if (!notes) return;
    try {
        const now = audio.currentTime;
        notes.forEach(note => {
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            const start = now + note.at;
            const end = start + note.d;
            osc.type = note.t;
            osc.frequency.setValueAtTime(note.f, start);
            if (kind === 'boss') osc.frequency.exponentialRampToValueAtTime(Math.max(35, note.f * .72), end);
            gain.gain.setValueAtTime(.0001, start);
            gain.gain.exponentialRampToValueAtTime(note.v, start + Math.min(.035, note.d * .25));
            gain.gain.exponentialRampToValueAtTime(.0001, end);
            osc.connect(gain);
            gain.connect(audio.destination);
            osc.start(start);
            osc.stop(end + .02);
            osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (error) {} };
        });
    } catch (error) {
        // Sound is optional; a browser audio limitation must never interrupt gameplay.
    }
}

function toggleBattleSfx() {
    battleSfxEnabled = !battleSfxEnabled;
    const button = document.getElementById('battle-sfx-toggle');
    const label = document.getElementById('battle-sfx-label');
    if (button) {
        button.setAttribute('aria-pressed', String(battleSfxEnabled));
        button.setAttribute('aria-label', battleSfxEnabled ? 'Savaş ses efektlerini kapat' : 'Savaş ses efektlerini aç');
    }
    if (label) label.textContent = battleSfxEnabled ? 'SFX AÇIK' : 'SFX KAPALI';
    if (battleSfxEnabled) {
        unlockBattleAudio();
        playBattleCue('wave');
    }
}
(function initBattlePresentationControls() {
    const button = document.getElementById('battle-sfx-toggle');
    if (button) button.addEventListener('click', toggleBattleSfx);
})();

function renderBattleMoment(kind, data) {
    const root = document.getElementById('battle-moment');
    const kicker = document.getElementById('battle-kicker');
    const title = document.getElementById('battle-title');
    const subtitle = document.getElementById('battle-subtitle');
    const rewards = document.getElementById('battle-rewards');
    if (!root || !kicker || !title || !subtitle || !rewards) return;

    clearTimeout(battleMomentHideTimer);
    root.dataset.kind = kind;
    root.dataset.bossType = kind === 'boss' ? String(data.subtype || 'default') : '';
    rewards.replaceChildren();
    if (kind === 'boss') {
        const bossName = String(data.name || 'BİLİNMEYEN HEDEF');
        kicker.textContent = 'TEHDİT ALGILANDI  /  ÖNCELİKLİ HEDEF';
        title.textContent = bossName;
        // Each existing boss archetype gets a distinct tactical briefing; this is presentation only.
        if (bossName.includes('Titan')) subtitle.textContent = 'Ağır zırh tespit edildi. Yakın menzilli darbelerine dikkat et.';
        else if (bossName.includes('Topçusu')) subtitle.textContent = 'Uzun menzilli topçu. Ateş baskısını kır ve kuleyi koru.';
        else if (bossName.includes('Vektörü')) subtitle.textContent = 'Yüksek hız ve ani atak. Saldırı penceresini iyi yakala.';
        else if (bossName.includes('Kryos')) subtitle.textContent = 'Kriyo saldırıları algılandı. Donma etkisi ateş ritmini kesebilir.';
        else if (bossName.includes('Leviathan')) subtitle.textContent = 'Çok yönlü saldırı paterni. Kritik anlarda savunmayı koru.';
        else subtitle.textContent = 'Ağır hedef yaklaşıyor. Kuleyi koru.';
        addBattleReward('BOSS  /  DALGA ' + String(Math.max(1, Number(data.wave) || 1)).padStart(2, '0'));
        playBattleCue('boss');
    } else if (kind === 'bossKill') {
        kicker.textContent = 'TEHDİT ETKİSİZ HALE GETİRİLDİ';
        title.textContent = 'BOSS İMHA EDİLDİ';
        subtitle.textContent = (data.name || 'Ağır hedef') + ' etkisiz. Savunma hattı nefes alıyor.';
        if (Number(data.gold) > 0) addBattleReward('ALTIN', Number(data.gold));
        if (Number(data.crystals) > 0) addBattleReward('KRİSTAL', Number(data.crystals));
        playBattleCue('bossKill');
    } else if (kind === 'clear') {
        kicker.textContent = 'BÖLGE GÜVENDE  /  DALGA TAMAMLANDI';
        title.textContent = 'DALGA ' + String(Math.max(1, Number(data.wave) || 1)).padStart(2, '0') + ' TEMİZLENDİ';
        subtitle.textContent = 'Savunma hattı ayakta. Sonraki temas için sistemler hazırlanıyor.';
        if (Number(data.gold) > 0) addBattleReward('ALTIN', Number(data.gold));
        if (Number(data.crystals) > 0) addBattleReward('KRİSTAL', Number(data.crystals));
        playBattleCue(Number(data.crystals) > 0 ? 'reward' : 'clear');
    } else {
        const wave = Math.max(1, Number(data.wave) || 1);
        const criticalWave = wave % 10 === 0;
        const bossWave = wave % 5 === 0;
        const swarmWave = wave % 3 === 0;
        kicker.textContent = criticalWave ? 'KIRMIZI ALARM  /  KRİTİK DALGA' : (bossWave ? 'SAVUNMA PROTOKOLÜ  /  BOSS DALGASI' : (swarmWave ? 'YÜKSEK YOĞUNLUK  /  SÜRÜ DALGASI' : 'SAVUNMA HATTI  /  TEMAS BEKLENİYOR'));
        title.textContent = 'DALGA ' + String(wave).padStart(2, '0');
        subtitle.textContent = criticalWave ? 'Tehdit seviyesi kritik. Bütün savunma sistemleri hazır olsun.' : (bossWave ? 'Ağır hedef sinyali bekleniyor. Pozisyonunu koru.' : (swarmWave ? 'Birden fazla temas algılandı. Alan kontrolünü bırakma.' : 'Yeni düşman sinyalleri tespit edildi.'));
        if (criticalWave) addBattleReward('TEHDİT: KRİTİK');
        else if (bossWave) addBattleReward('BOSS SİNYALİ');
        else if (swarmWave) addBattleReward('SÜRÜ HAREKETİ');
        playBattleCue(criticalWave ? 'critical' : 'wave');
    }
    root.classList.remove('is-visible');
    // Restart the entrance transition even when two moments occur in the same frame.
    void root.offsetWidth;
    root.classList.add('is-visible');
    const duration = kind === 'boss' ? 3300 : (kind === 'bossKill' ? 2850 : (kind === 'clear' ? 2250 : 1650));
    battleMomentHideTimer = setTimeout(() => root.classList.remove('is-visible'), duration);
}

function addBattleReward(label, amount = null) {
    const rewards = document.getElementById('battle-rewards');
    if (!rewards) return;
    const chip = document.createElement('span');
    chip.className = 'battle-reward';
    rewards.appendChild(chip);

    const numericAmount = Number(amount);
    if (amount === null || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        chip.textContent = label;
        return;
    }

    const finalText = '+' + formatBattleNumber(numericAmount) + ' ' + label;
    chip.setAttribute('aria-label', finalText);
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof requestAnimationFrame !== 'function') {
        chip.textContent = finalText;
        return;
    }

    const startedAt = performance.now();
    const duration = 520;
    chip.textContent = '+0 ' + label;
    const tick = (now) => {
        const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
        const eased = 1 - Math.pow(1 - progress, 3);
        chip.textContent = '+' + formatBattleNumber(Math.round(numericAmount * eased)) + ' ' + label;
        if (progress < 1) requestAnimationFrame(tick);
        else chip.textContent = finalText;
    };
    requestAnimationFrame(tick);
}
function formatBattleNumber(value) {
    const number = Math.max(0, Math.round(Number(value) || 0));
    try { return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(number); }
    catch (error) { return String(number); }
}
function showBattleMoment(kind, data = {}) {
    if (kind === 'wave') {
        const wave = Math.max(1, Number(data.wave) || 1);
        if (battleIntroWaveShown === wave) return;
        battleIntroWaveShown = wave;
        renderBattleMoment('wave', { wave });
        return;
    }
    if (kind === 'boss') {
        clearTimeout(battleMomentBossTimer);
        clearTimeout(battleMomentClearTimer);
        const root = document.getElementById('battle-moment');
        // Let the just-earned wave reward breathe before the boss announcement takes over.
        const delay = root && root.classList.contains('is-visible') && root.dataset.kind === 'clear' ? 1500 : 0;
        battleMomentBossTimer = setTimeout(() => renderBattleMoment('boss', data), delay);
        return;
    }
    if (kind === 'bossKill') {
        clearTimeout(battleMomentBossTimer);
        clearTimeout(battleMomentClearTimer);
        renderBattleMoment('bossKill', data);
        return;
    }
    if (kind === 'clear') {
        const root = document.getElementById('battle-moment');
        clearTimeout(battleMomentClearTimer);
        // Preserve the boss takedown beat before showing the wave-clear reward.
        if (root && root.classList.contains('is-visible') && root.dataset.kind === 'bossKill') {
            battleMomentClearTimer = setTimeout(() => renderBattleMoment('clear', data), 1750);
        } else {
            renderBattleMoment('clear', data);
        }
    }
}

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
                                <span class="font-tech font-bold text-xs sm:text-sm text-white truncate">${localizeGameContent(def.name)}</span>
                                <span id="upg-lvl-${key}" class="text-[10px] font-tech px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Sv.${lvl}</span>
                            </div>
                            <div class="text-[10px] text-slate-400 leading-tight">${localizeGameContent(def.desc)}</div>
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
        if (compSkinLabel && compSkinDef) compSkinLabel.textContent = `${compSkinDef.emoji} ${localizeGameContent(compSkinDef.name)}`;
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
                            <span class="font-tech font-bold text-xs sm:text-sm text-white">${localizeGameContent(def.name)}</span>
                            <div class="flex items-center gap-0.5 bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/5">
                                ${renderCompanionStars(star)}
                            </div>
                        </div>
                        <div class="text-[10px] text-slate-400 leading-tight">${localizeGameContent(def.desc)}</div>
                        <div class="text-[10px] font-tech font-bold ${star > 0 ? 'text-cyan-300' : 'text-amber-300'}">${localizeGameContent(def.getStarSummary(star))}</div>
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
                    <div class="font-tech font-bold text-xs text-white"><i class="${def.icon} text-purple-400 mr-1"></i>${localizeGameContent(def.name)} <span class="text-[10px] text-purple-300">Lv.${lvl}</span></div>
                    <div class="text-[10px] text-slate-400">${localizeGameContent(def.desc)}</div>
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
    showToast(localizeGameMessage(`Kule Skini Kuşanıldı: ${skin.emoji} ${skin.name}`));
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
    showToast(localizeGameMessage(`Yoldaş Skini Kuşanıldı: ${cSkin.emoji} ${cSkin.name}`));
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
        window.showInspectPopup(localizeGameContent(item.name), localizeGameContent(rarity) + ' • ' + localizeGameContent(type), localizeGameContent(item.desc || 'Açıklama yok.'), game.equippedItems.includes(itemId) ? localizeGameContent('KUŞANILDI') : localizeGameContent('ENVANTERDE'), '#38bdf8');
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
                        <div class="font-tech font-bold text-[10px] leading-tight line-clamp-1">${localizeGameContent(item.name)}</div>
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
                                <div class="text-[10px] text-slate-400 leading-tight mt-0.5">${localizeGameContent(item.desc)}</div>
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
                return `<div onclick="${owned ? `selectTowerSkin('${skin.id}')` : ''}" class="${owned ? 'cursor-pointer hover:border-amber-500/50' : 'opacity-45 cursor-not-allowed'} p-2.5 rounded-xl border ${isActive ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50'} transition flex flex-col justify-between"><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 rounded text-[8px] font-tech font-bold border ${rb.cls}">${rb.text}</span><span class="text-[9px] font-tech font-bold ${isActive ? 'text-amber-300' : (owned ? 'text-emerald-400' : 'text-slate-500')}">${isActive ? 'AKTİF' : (owned ? 'SAHİP' : 'KİLİTLİ')}</span></div><div class="flex items-center gap-2 my-1"><canvas id="skin-preview-${skin.id}" width="52" height="52" class="w-[46px] h-[46px] rounded-lg bg-slate-950/80 border border-white/10 shrink-0"></canvas><div class="min-w-0"><div class="font-tech font-bold text-xs text-white truncate">${localizeGameContent(skin.name)}</div><div class="text-[10px] text-slate-400 leading-tight line-clamp-2">${localizeGameContent(skin.desc)}</div></div></div></div>`;
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
                return `<div onclick="${owned ? `selectCompanionSkin('${cSkin.id}')` : ''}" class="${owned ? 'cursor-pointer hover:border-cyan-500/50' : 'opacity-45 cursor-not-allowed'} p-2.5 rounded-xl border ${isActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/50'} transition flex flex-col justify-between"><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 rounded text-[8px] font-tech font-bold border ${rb.cls}">${rb.text}</span><span class="text-[9px] font-tech font-bold ${isActive ? 'text-cyan-300' : (owned ? 'text-emerald-400' : 'text-slate-500')}">${isActive ? 'AKTİF' : (owned ? 'SAHİP' : 'KİLİTLİ')}</span></div><div class="flex items-center gap-2 my-1"><canvas id="compskin-preview-${cSkin.id}" width="52" height="52" class="w-[46px] h-[46px] rounded-lg bg-slate-950/80 border border-white/10 shrink-0"></canvas><div class="min-w-0"><div class="font-tech font-bold text-xs text-white truncate">${localizeGameContent(cSkin.name)}</div><div class="text-[10px] text-slate-400 leading-tight line-clamp-2">${localizeGameContent(cSkin.desc)}</div></div></div></div>`;
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
            return `<div onclick="${unlocked ? `selectTheme('${t.id}')` : ''}" class="${unlocked ? 'cursor-pointer hover:border-indigo-400' : 'opacity-50 cursor-not-allowed'} premium-card p-3 flex items-center justify-between"><div class="flex items-center gap-3"><i class="${t.icon} text-lg ${t.color}"></i><div><div class="font-tech font-bold text-sm text-white">${localizeGameContent(t.name)}</div><div class="text-[11px] text-slate-400">${localizeGameContent(t.desc)}</div></div></div><span class="text-xs font-tech font-bold ${active ? 'text-indigo-300' : 'text-slate-400'}">${active ? 'AKTİF' : (unlocked ? 'SEÇ' : `Dalga ${t.reqWave}`)}</span></div>`;
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
    txt.textContent = typeof localizeGameMessage === 'function' ? localizeGameMessage(msg) : msg; el.classList.remove('opacity-0'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.add('opacity-0'), 2600);
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
    if (window.__storyBattle && window.__storyBattle.active) return;
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
        { id: 'daily-time', icon: '⏱️', title: 'Nöbet Mesaisi', desc: 'Bugün 10 dakika savaş alanında kal', progress: Math.min(600, playTime), target: 600, rewardGold: 300, rewardCrystals: 5, format: v => getGameLanguage() === 'en' ? `${Math.floor(v / 60)} min` : `${Math.floor(v / 60)} dk` },
        { id: 'daily-waves', icon: '🌊', title: 'Dalga Dalgaya', desc: 'Bugün 5 dalga ilerle', progress: Math.min(5, waveDelta), target: 5, rewardGold: 350, rewardCrystals: 6 }
    ];
}

function openDailyMissionsModal() {
    renderDailyMissions();
    const modal = document.getElementById('daily-missions-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    const action = document.getElementById('daily-missions-close-action');
    if (action) action.textContent = dailyMissionsOpenedFromMainMenu
        ? (getGameLanguage() === 'en' ? 'RETURN TO MAIN MENU' : 'ANA MENÜYE DÖN')
        : (getGameLanguage() === 'en' ? 'RETURN TO BATTLEFIELD' : 'SAVAŞ ALANINA DÖN');
}

function closeDailyMissionsModal() {
    const modal = document.getElementById('daily-missions-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    if (dailyMissionsOpenedFromMainMenu) {
        dailyMissionsOpenedFromMainMenu = false;
        if (typeof isPaused !== 'undefined') isPaused = true;
        const menu = document.getElementById('mode-main-menu');
        if (menu) menu.classList.remove('menu-hidden');
    }
}

function renderDailyMissions() {
    if (typeof game === 'undefined') return;
    const state = readDailyMissionState();
    const missions = getDailyMissionDefinitions(state);
    const claimedCount = missions.filter(m => state.claimed.includes(m.id)).length;
    setElText('daily-missions-date', getGameLanguage() === 'en' ? `Daily objectives • ${state.date}` : `Günlük hedefler • ${state.date}`);
    setElText('daily-missions-progress', getGameLanguage() === 'en' ? `${claimedCount} / ${missions.length} rewards claimed` : `${claimedCount} / ${missions.length} ödül alındı`);
    const list = document.getElementById('daily-missions-list');
    if (!list) return;
    list.innerHTML = missions.map(m => {
        const value = Math.max(0, Number(m.progress) || 0);
        const done = value >= m.target;
        const claimed = state.claimed.includes(m.id);
        const percent = Math.max(0, Math.min(100, value / m.target * 100));
        const current = m.format ? m.format(value) : formatNumber(value);
        const target = m.format ? m.format(m.target) : formatNumber(m.target);
        const english = getGameLanguage() === 'en';
        const button = claimed
            ? `<button disabled class="shrink-0 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-300">${english ? 'CLAIMED ✓' : 'ALINDI ✓'}</button>`
            : done
                ? `<button onclick="claimDailyMission('${m.id}')" class="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-slate-950 hover:bg-amber-400">${english ? 'CLAIM REWARD' : 'ÖDÜLÜ AL'}</button>`
                : `<button disabled class="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-500">${english ? 'IN PROGRESS' : 'DEVAM ET'}</button>`;
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


// ==========================================
// ETKİLEŞİMLİ MASKOT — yalnızca görsel/kozmetik özellik
// ==========================================
(function initInteractiveMascot() {
    const mascot = document.getElementById('game-mascot');
    const face = document.getElementById('game-mascot-face');
    const bubble = document.getElementById('game-mascot-bubble');
    if (!mascot || !face || !bubble) return;

    let pointerStart = null;
    let moved = false;
    let dragInitialized = false;
    let hideBubbleTimer = null;
    let dragFrame = 0;
    let pendingPointer = null;
    const defaultLines = [
        'Savunma hattı bende, komutan!',
        'Bir sonraki hamleni merak ediyorum.',
        'Bu kuleyle iyi bir ikili olduk!',
        'Hazırım. Sen ne zaman hazırsan. ✨'
    ];
    // Tepkiler, yoldaş kostümüne değil oyuncunun kuşandığı KULE SKİNİNE göre seçilir.
    const towerSkinLines = {
        default_cyber: ['Siber çekirdekler kararlı. Sistem hazır! ⚡', 'Bu plazma parıltısına bayılıyorum.'],
        kurt_kaan: ['Kurt Kaan ile sürü gibi güçlüyüz! 🐺', 'Bir uluma duysam da düşmanlar kaçsa.'],
        dgdvrn: ['Altın kaplama mı? Komutan, zevkin pahalı! 👑', 'Bu kadar parıltıyla düşman bizi görmeden yenilecek.'],
        black_hole: ['O kara deliğe fazla yaklaşmayalım... 🕳️', 'Uzay-zaman bükülüyor. Ben gayet sakinim.'],
        nane_tower: ['Nane ferahlığı, tam savaş öncesi lazım olan şey! 🌿', 'Buz gibi strateji, komutan.'],
        sunkas_tower: ['Güneş kadar parlak, savunma kadar sağlam! ☀️', 'Bu ışıkta güneş gözlüğü takmalıydım.'],
        ates_tower: ['Sıcaklık yükseliyor! Ben biraz geride durayım. 🔥', 'Alevler şahane ama kaşlarımı seviyorum.'],
        teyzir_tower: ['Yüksek voltaj, yüksek moral! ⚡', 'Elektrikleniyorum... mecazen!'],
        bubblegum: ['Balonlar tatlı, patlamaları daha da tatlı! 🫧', 'Sakız gibi yapışkan bir savunma.'],
        cyber_samurai: ['Keskin ve disiplinli. Saygı duydum. 🥷', 'Bu kuleyle sessizce kazanacağız.'],
        snowman: ['Bana da bir atkı ayırın! ⛄', 'Düşmanlar erimeden önce donsun!'],
        star_cruiser: ['Rotamız zafer, kaptan! 🚀', 'Yıldızlara doğru... ama önce şu dalga.'],
        dragon: ['Ejderha bizim tarafta, içim rahat. 🐉', 'Umarım ateş püskürtürken alarm çalmaz.'],
        fighter_jet: ['Kalkış izni verildi! ✈️', 'Hız, irtifa, savunma! Hepsi tamam.'],
        lion: ['Ormanın kralı yanımızda. Kükre komutan! 🦁', 'Bu savunma aslan gibi.'],
        tiger: ['Sessiz, çevik ve tehlikeli. 🐯', 'Pençeler hazırsa ben de hazırım.'],
        sofa: ['Kraliyet koltuğu mu? Savunma VIP oldu! 🛋️', 'Komutan, savaş sonrası oturacak yerimiz hazır.'],
        robot: ['Meka protokolü çevrimiçi. 🤖', 'Bu çelik dostla sistem hata vermez umarım.'],
        fire_demon: ['Ateş iblisi bile benden daha sakin görünüyor. 👹', 'Bu kuleyle düşmanlara sıcak bir karşılama!'],
        car: ['Vınnn! Bu savunma tam gaz! 🚗', 'Virajı al, dalgayı geç!'],
        monkey: ['Muz molası mı? Önce düşmanları halledelim. 🐵', 'Bu maymunun planını anlamadım ama işe yarıyor!'],
        tree: ['Kökler sağlam, savunma sağlam. 🌳', 'Biraz doğa, biraz strateji.'],
        sleep_emoji: ['Uyan komutan, kule uyumuyor! 😴', 'Şşşt... düşmanları uyandırmadan yenelim.'],
        alien: ['Dünya savunması için geldim. 👽', 'Bunlar kesin dünya dışı düşmanlar değil mi?'],
        bird: ['Kanatlar hazır, gökyüzü bizim! 🐦', 'Yukarıdan her şeyi görüyorum.'],
        water_bottle: ['Bir yudum su, bir dalga daha. 🧴', 'Susuz kalma komutan, savunma uzun sürecek.'],
        chair: ['RGB ışıkları aç, mücadele başlıyor! 🪑', 'Oyuncu koltuğu taktik avantaj sayılır mı?'],
        table: ['Harita önümde, strateji hazır. 🪵', 'Taktik masa kuruldu. Planımız sağlam.'],
        pizza: ['Zaferden sonra pizza benden! 🍕', 'Peynir uzuyor, düşmanlar kaçıyor.'],
        toilet: ['Bu skin hakkında sorularım var... 🚽', 'Komutan, mizah anlayışına saygı duyuyorum.']
    };

    function getTowerSkin() {
        const id = (typeof game !== 'undefined' && game && game.activeSkin) || 'default_cyber';
        const db = typeof SKIN_DATABASE !== 'undefined' ? SKIN_DATABASE : {};
        return { id, def: db[id] || db.default_cyber || { name: 'Plazma Kulesi', emoji: '⚡' } };
    }
    function syncMascot() {
        const skin = getTowerSkin();
        face.textContent = '🛸';
        mascot.setAttribute('aria-label', 'Taktik maskot — ' + skin.def.name + ' skinine tepki vermek için dokun');
        mascot.title = 'Taktik maskot · ' + skin.def.name;
        return skin;
    }
    function react() {
        const skin = syncMascot();
        const lines = towerSkinLines[skin.id] || [
            skin.def.name + ' bayağı havalı görünüyor, komutan!',
            skin.def.name + ' ile bu savunma akılda kalacak. ' + (skin.def.emoji || '✨')
        ];
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        const rect = mascot.getBoundingClientRect();
        bubble.style.left = Math.max(8, Math.min(window.innerWidth - Math.min(230, window.innerWidth - 32) - 8, rect.left + rect.width / 2 - 115)) + 'px';
        bubble.style.top = Math.max(8, rect.top - 58) + 'px';
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
        bubble.classList.add('is-visible');
        mascot.classList.remove('mascot-react');
        void mascot.offsetWidth;
        mascot.classList.add('mascot-react');
        clearTimeout(hideBubbleTimer);
        hideBubbleTimer = setTimeout(() => bubble.classList.remove('is-visible'), 2600);
    }

    function initializeMascotDrag() {
        if (dragInitialized || !pointerStart) return;
        // Do not alter fixed positioning on pointerdown: mobile Safari can
        // re-map fixed coordinates when its visual viewport/browser chrome shifts.
        // Only switch to explicit coordinates after a real drag has started.
        mascot.style.animation = 'none';
        mascot.style.left = pointerStart.left + 'px';
        mascot.style.top = pointerStart.top + 'px';
        mascot.style.right = 'auto';
        mascot.style.bottom = 'auto';
        mascot.style.transform = 'translate3d(0,0,0)';
        mascot.classList.remove('mascot-react');
        dragInitialized = true;
    }

    function applyDragPosition() {
        dragFrame = 0;
        if (!pointerStart || !pendingPointer || !dragInitialized) return;
        const dx = pendingPointer.x - pointerStart.x;
        const dy = pendingPointer.y - pointerStart.y;
        const maxLeft = Math.max(0, window.innerWidth - mascot.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - mascot.offsetHeight);
        const left = Math.max(0, Math.min(maxLeft, pointerStart.left + dx));
        const top = Math.max(0, Math.min(maxTop, pointerStart.top + dy));
        mascot.style.transform = 'translate3d(' + (left - pointerStart.left) + 'px,' + (top - pointerStart.top) + 'px,0)';
    }

    mascot.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        const rect = mascot.getBoundingClientRect();
        pointerStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        moved = false;
        dragInitialized = false;
        pendingPointer = { x: event.clientX, y: event.clientY };
        // A tap leaves the mascot's original CSS position completely untouched.
        mascot.setPointerCapture?.(event.pointerId);
    });
    mascot.addEventListener('pointermove', (event) => {
        if (!pointerStart) return;
        pendingPointer = { x: event.clientX, y: event.clientY };
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        if (!moved && Math.hypot(dx, dy) > 5) {
            moved = true;
            initializeMascotDrag();
            mascot.classList.add('is-dragging');
        }
        if (moved && !dragFrame) dragFrame = requestAnimationFrame(applyDragPosition);
    });
    function finishPointer(event, cancelled = false) {
        if (!pointerStart) return;
        // pointercancel coordinates may be stale or reported as (0, 0) on mobile.
        // Keep the last actual pointermove position rather than teleporting the mascot.
        if (!cancelled && event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
            pendingPointer = { x: event.clientX, y: event.clientY };
        }
        if (dragFrame) {
            cancelAnimationFrame(dragFrame);
            dragFrame = 0;
            if (moved) applyDragPosition();
        }
        const wasDragged = moved;
        if (wasDragged && dragInitialized && pendingPointer) {
            const dx = pendingPointer.x - pointerStart.x;
            const dy = pendingPointer.y - pointerStart.y;
            const maxLeft = Math.max(0, window.innerWidth - mascot.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - mascot.offsetHeight);
            mascot.style.left = Math.max(0, Math.min(maxLeft, pointerStart.left + dx)) + 'px';
            mascot.style.top = Math.max(0, Math.min(maxTop, pointerStart.top + dy)) + 'px';
            mascot.style.transform = 'translate3d(0,0,0)';
        }
        pointerStart = null;
        pendingPointer = null;
        moved = false;
        dragInitialized = false;
        mascot.classList.remove('is-dragging');
        mascot.style.animation = '';
        // A canceled touch is not a tap; don't trigger a reaction animation on cancel.
        if (!wasDragged && !cancelled) react();
    }
    mascot.addEventListener('pointerup', (event) => finishPointer(event, false));
    mascot.addEventListener('pointercancel', (event) => finishPointer(event, true));
    mascot.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            react();
        }
    });
    syncMascot();
})();


// ==========================================
// ANA MENÜ VE OYUN MODU SEÇİMİ
// ==========================================
let dailyMissionsOpenedFromMainMenu = false;

function getGameLanguage() {
    try { return localStorage.getItem('towerDefenseLanguage') === 'en' ? 'en' : 'tr'; }
    catch (_) { return 'tr'; }
}

function enterGameMode(mode) {
    if (mode !== 'endless') return;
    const menu = document.getElementById('mode-main-menu');
    if (menu) menu.classList.add('menu-hidden');
    dailyMissionsOpenedFromMainMenu = false;
    document.body.dataset.gameMode = 'endless';
    if (typeof isPaused !== 'undefined') isPaused = false;
    if (typeof resizeCanvas === 'function') resizeCanvas();
}

function openDailyMissionsFromMainMenu() {
    dailyMissionsOpenedFromMainMenu = true;
    if (typeof isPaused !== 'undefined') isPaused = true;
    const menu = document.getElementById('mode-main-menu');
    if (menu) menu.classList.add('menu-hidden');
    openDailyMissionsModal();
    const action = document.getElementById('daily-missions-close-action');
    if (action) action.textContent = getGameLanguage() === 'en' ? 'RETURN TO MAIN MENU' : 'ANA MENÜYE DÖN';
}

function returnToMainMenu() {
    if (window.__storyBattle && window.__storyBattle.active && typeof exitStoryBattle === 'function') { exitStoryBattle(true); return; }
    if (typeof saveGame === 'function') saveGame(true);
    if (typeof updateStoryUnlockUI === 'function') updateStoryUnlockUI();
    if (typeof isPaused !== 'undefined') isPaused = true;
    dailyMissionsOpenedFromMainMenu = false;
    const menu = document.getElementById('mode-main-menu');
    if (menu) menu.classList.remove('menu-hidden');
    const drawer = document.getElementById('upgrade-drawer');
    if (drawer) drawer.classList.add('-translate-x-full');
    if (typeof isDrawerOpen !== 'undefined') isDrawerOpen = false;
    if (typeof syncHudPositionsWithDrawer === 'function') syncHudPositionsWithDrawer();
    ['daily-missions-modal','achievements-modal','settings-modal','theme-modal','confirm-modal','auth-modal','update-notes-modal','lootbox-anim-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    });
}

// Story progress is deliberately isolated from the existing Endless save.
const STORY_PROGRESS_KEY = 'towerDefenseStoryProgressV1';
const STORY_DIALOGUES = [
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Komutan, istasyona ulaştık. Yaşam belirtisi yok. Bütün sistemler biz yaklaşınca kapandı; sanki gelişimizi bekliyorlardı.',en:'Commander, we have reached the station. No life signs. Every system shut down as we approached—as if they were waiting for us.'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Bağlantı… kuruldu. Sonunda geldiniz, komutan.',en:'Connection… established. You finally made it, Commander.'}},
 {speaker:{tr:'KOMUTAN',en:'COMMANDER'},text:{tr:'Beni tanıyor musun? Sen kimsin? Bu istasyonda ne oldu?',en:'Do you know me? Who are you? What happened here?'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Ben… senin yanında… Sinyali takip etme. Çekirdek…',en:'I was… beside you… Do not follow the signal. The core…'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Görüntü kaynağı canlı değil. Bu, kayıtlarla eşleşmeyen bozuk bir hafıza yankısı. Kimden kaldığını belirleyemiyorum.',en:'The image source is not live. It is a corrupted memory echo with no matching identity record. I cannot determine whose memory it came from.'}},
 {speaker:{tr:'KOMUTAN',en:'COMMANDER'},text:{tr:'O zaman çekirdeğin yanındaki şey ne? Hareket ediyor.',en:'Then what is that thing beside the core? It is moving.'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Eski tip bakım yoldaşı. Gücü neredeyse tükenmiş; silah sistemi yok. Yine de çekirdek onu tanıdı… ve yeniden başlattı.',en:'An old maintenance companion. Almost out of power; no weapons installed. Yet the core recognized it… and restarted it.'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Beni… hatırladığında… mor ışık… kuleler…',en:'When you… remember me… violet light… towers…'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Dış savunma hattında düşman teması! Bakım yoldaşı çekirdeğe bağlandı. Komutan, savunmayı şimdi etkinleştirmeliyiz.',en:'Hostile contacts on the outer defense line! The maintenance companion has linked to the core. Commander, we must activate the defenses now.'}}
];
const STORY_UI_COPY = {
 protocol:['HİKÂYE PROTOKOLÜ · 01','STORY PROTOCOL · 01'],
 return:['← ANA MENÜ','← MAIN MENU'], chapter:['BÖLÜM 01 · KAYIP SİNYAL','CHAPTER 01 · LOST SIGNAL'],
 heading:['Kayıp Sinyal','Lost Signal'],
 lead:['Uzak bir istasyon sessizliğe gömüldü. Son sinyal, savunma çekirdeğinin içinden geliyor.','A remote station has fallen silent. Its last signal is coming from inside the defense core.'],
 mission1tag:['GÖREV 01','MISSION 01'], mission1title:['Savunmayı etkinleştir','Activate the defense'],
 mission1desc:['Kule çekirdeğini çevrimiçi duruma getir ve istasyonun savunma protokolünü öğren.','Bring the tower core online and learn the station’s defense protocol.'],
 mission2tag:['GÖREV 02','MISSION 02'], mission2title:['İlk temas','First contact'],
 mission2desc:['Bilinmeyen düşmanların ilk saldırısına karşı koy.','Hold back the first attack from unknown enemies.'],
 mission3tag:['GÖREV 03','MISSION 03'], mission3title:['Sinyalin kaynağı','Source of the signal'],
 mission3desc:['Savaş sonrasında çekirdeğin kaydettiği gizemli sinyali araştır.','Investigate the mysterious signal recorded by the core after the battle.'],
 nextstep:['Sıradaki adım','Next step'], nextdesc:['Mavi görüntü, yoldaşın kayıp hafızasından sızan bozuk bir yankı. Gerçek yoldaş ise çekirdeğin yanında uyanan güçsüz bir bakım birimi. Hikâye ilerledikçe onun neye dönüşebileceğini keşfedeceksin.','The blue image is a corrupted echo leaking from the companion’s lost memory. The real companion is a powerless maintenance unit waking beside the core. As the story unfolds, you will discover what it can become.'],
 backmenu:['ANA MENÜYE DÖN','RETURN TO MAIN MENU'],
 'save-note':['Hikâye ilerlemesi ayrı kaydedilir. Sonsuz Mod kaydına ve savaş dengesine dokunulmaz.','Story progress is saved separately. Endless Mode saves and game balance remain untouched.'],
 continue:['DEVAM ET →','CONTINUE →'], start:['GÖREV PANOSU →','MISSION BRIEFING →'],
 progress:['HİKÂYE GİRİŞİ','STORY INTRODUCTION'], completed:['GİRİŞ TAMAMLANDI · GÖREV PANOSU AÇILDI','INTRO COMPLETE · MISSION BRIEFING UNLOCKED']
};
let storyDialogueIndex = 0;
let storyMissionViewOpen = false;

function getStoryProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY) || '{}');
        return { introSeen: saved.introSeen === true, chapter: Math.max(1, Number(saved.chapter) || 1), mission1Complete: saved.mission1Complete === true };
    } catch (_) { return { introSeen: false, chapter: 1, mission1Complete: false }; }
}
function saveStoryProgress(patch) {
    try { localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify({ ...getStoryProgress(), ...patch, updatedAt: Date.now() })); } catch (_) {}
}
function storyLanguage() { return getGameLanguage() === 'en' ? 'en' : 'tr'; }
function storyCopy(pair) { return pair[storyLanguage() === 'en' ? 1 : 0]; }
function applyStoryUiLanguage() {
    const en = storyLanguage() === 'en';
    document.querySelectorAll('[data-story-ui]').forEach(node => {
        const pair = STORY_UI_COPY[node.dataset.storyUi];
        if (pair) node.textContent = pair[en ? 1 : 0];
    });
    const next = document.getElementById('story-next');
    if (next) next.textContent = storyCopy(STORY_UI_COPY[storyMissionViewOpen ? 'start' : 'continue']);
    updateStoryMissionBoard();
}
function showStoryDialogue() {
    const line = STORY_DIALOGUES[storyDialogueIndex];
    if (!line) return;
    const en = storyLanguage() === 'en';
    const speaker = document.getElementById('story-speaker');
    const copy = document.getElementById('story-dialogue-copy');
    const progress = document.getElementById('story-progress');
    const next = document.getElementById('story-next');
    if (speaker) speaker.textContent = line.speaker[en ? 'en' : 'tr'];
    if (copy) copy.textContent = line.text[en ? 'en' : 'tr'];
    if (progress) progress.textContent = String(storyDialogueIndex + 1).padStart(2, '0') + ' / ' + String(STORY_DIALOGUES.length).padStart(2, '0');
    if (next) next.textContent = storyDialogueIndex === STORY_DIALOGUES.length - 1
        ? storyCopy(STORY_UI_COPY.start) : storyCopy(STORY_UI_COPY.continue);
}
function showStoryMissionBriefing() {
    storyMissionViewOpen = true;
    const dialogue = document.getElementById('story-dialogue-view');
    const mission = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = true;
    if (mission) mission.hidden = false;
    if (note) note.classList.add('is-visible');
    const progress = document.getElementById('story-mission-progress');
    if (progress) progress.textContent = storyCopy(STORY_UI_COPY.completed);
    applyStoryUiLanguage();
    saveStoryProgress({ introSeen: true, chapter: 1 });
    updateStoryMissionBoard();
}
// The story encounter temporarily borrows the existing combat engine, but never its save.
// All mutable combat state is snapshotted and restored when the player leaves the mission.
window.__storyBattle = window.__storyBattle || { active: false };
function updateStoryMissionBoard() {
    const progress = getStoryProgress();
    const start = document.getElementById('story-start-mission1');
    const status = document.getElementById('story-mission-1-status');
    if (start) {
        start.disabled = progress.mission1Complete;
        start.textContent = progress.mission1Complete
            ? (storyLanguage() === 'en' ? 'MISSION COMPLETE ✓' : 'GÖREV TAMAMLANDI ✓')
            : (storyLanguage() === 'en' ? 'DEPLOY →' : 'GÖREVE BAŞLA →');
    }
    if (status) status.textContent = progress.mission1Complete
        ? (storyLanguage() === 'en' ? 'CORE STABLE' : 'ÇEKİRDEK GÜVENDE')
        : (storyLanguage() === 'en' ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV');
    document.querySelectorAll('.story-mission-status.is-locked').forEach(node => {
        node.textContent = storyLanguage() === 'en' ? 'LOCKED · NEXT UPDATE' : 'KİLİTLİ · SONRAKİ AŞAMA';
    });
}
function storyDeepCopy(value) { return JSON.parse(JSON.stringify(value)); }
function startStoryMission(missionNumber = 1) {
    if (missionNumber !== 1 || getStoryProgress().mission1Complete) return;
    if (!updateStoryUnlockUI()) {
        showToast(storyLanguage() === 'en' ? 'Clear 25 waves in Endless Mode first.' : 'Önce Sonsuz Mod’da 25 dalgayı tamamlamalısın.');
        return;
    }
    if (window.__storyBattle.active) return;
    const session = {
        active: true, completed: false, mission: 1,
        snapshot: {
            game: storyDeepCopy(game), tower: storyDeepCopy(tower),
            enemies: storyDeepCopy(enemies), projectiles: storyDeepCopy(projectiles),
            particles: storyDeepCopy(particles), floatingTexts: storyDeepCopy(floatingTexts),
            lightningBeams: storyDeepCopy(lightningBeams), rings: storyDeepCopy(rings),
            cargoDrones: storyDeepCopy(cargoDrones),
            spawnTimer, playTimeAccum, waveFrostSpawns, cargoSpawnTimer,
            gameSpeed, isPaused, isDefeated, defeatTimer,
            gameMode: document.body.dataset.gameMode || ''
        }
    };
    window.__storyBattle = session;
    game = getDefaultState();
    game.wave = 1; game.highestWave = 1; game.gold = 180;
    game.waveKills = 0; game.waveTargetKills = 8; game.holdWave = false;
    game.upgrades.damage = 3; game.upgrades.attackSpeed = 2; game.upgrades.range = 3;
    game.settings.activeTheme = 'space';
    tower = {
        x: canvas.width / 2, y: canvas.height / 2, hp: 100, maxHp: 100, shield: 0, maxShield: 0,
        fireCooldown: 0, angle: 0, recoil: 0, freezeTimer: 0, freezeImmunityTimer: 0,
        frostSlowTimer: 0, frostVisualTick: 0, overdriveTimer: 0, overdriveVisualTick: 0
    };
    tower.maxHp = getTowerMaxHp(); tower.hp = tower.maxHp;
    tower.maxShield = getTowerMaxShield(); tower.shield = tower.maxShield;
    enemies = []; projectiles = []; particles = []; floatingTexts = [];
    lightningBeams = []; rings = []; cargoDrones = [];
    spawnTimer = 0; playTimeAccum = 0; waveFrostSpawns = 0; cargoSpawnTimer = 999999;
    gameSpeed = 1; isPaused = false; isDefeated = false; defeatTimer = 0;
    document.body.dataset.gameMode = 'story';
    const screen = document.getElementById('story-mode-screen');
    if (screen) { screen.classList.remove('is-open'); screen.setAttribute('aria-hidden', 'true'); }
    const hud = document.getElementById('story-battle-hud');
    if (hud) { hud.hidden = false; hud.classList.add('is-active'); }
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = storyLanguage() === 'en'
        ? 'OBJECTIVE: Defeat 8 hostiles and stabilize the core.'
        : 'GÖREV: 8 düşmanı durdur ve çekirdeği güvene al.';
    const companionChip = document.getElementById('story-companion-chip');
    const companionIcon = document.getElementById('story-companion-icon');
    const companionState = document.getElementById('story-companion-state');
    if (companionChip) companionChip.classList.remove('is-synced');
    if (companionIcon) companionIcon.textContent = '⚙';
    if (companionState) companionState.textContent = storyLanguage() === 'en'
        ? 'LOW POWER · LINKING TO CORE' : 'DÜŞÜK GÜÇ · ÇEKİRDEĞE BAĞLANIYOR';
    const exit = document.getElementById('story-battle-exit');
    if (exit) exit.textContent = storyLanguage() === 'en' ? 'ABORT MISSION' : 'GÖREVDEN ÇIK';
    if (typeof resizeCanvas === 'function') resizeCanvas();
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof refreshUpgradeButtonsState === 'function') refreshUpgradeButtonsState();
    if (typeof updateHoldWaveButton === 'function') updateHoldWaveButton();
    showToast(storyLanguage() === 'en'
        ? 'Lost Signal · Mission 01. Your core fires automatically; use the upgrade panel if you need more power.'
        : 'Kayıp Sinyal · Görev 01. Çekirdeğin otomatik ateş ediyor; gerekirse yükseltme panelini kullan.');
}
function finishStoryBattleEncounter() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.completed) return;
    session.completed = true;
    isPaused = true;
    enemies = []; projectiles = [];
    saveStoryProgress({ introSeen: true, chapter: 1, mission1Complete: true });
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = storyLanguage() === 'en'
        ? 'MISSION COMPLETE · The core is stable. The maintenance companion has synchronized with you; one signal fragment recovered.'
        : 'GÖREV TAMAMLANDI · Çekirdek güvende. Bakım yoldaşı seninle eşitlendi; sinyalin bir parçası kurtarıldı.';
    const companionChip = document.getElementById('story-companion-chip');
    const companionIcon = document.getElementById('story-companion-icon');
    const companionState = document.getElementById('story-companion-state');
    if (companionChip) companionChip.classList.add('is-synced');
    if (companionIcon) companionIcon.textContent = '✦';
    if (companionState) companionState.textContent = storyLanguage() === 'en'
        ? 'SYNC ESTABLISHED · MEMORY FRAGMENT FOUND' : 'BAĞLANTI KURULDU · HAFIZA PARÇASI BULUNDU';
    const exit = document.getElementById('story-battle-exit');
    if (exit) exit.textContent = storyLanguage() === 'en' ? 'CONTINUE' : 'DEVAM ET';
    showToast(storyLanguage() === 'en' ? 'Mission 01 complete. Story progress saved separately.' : '1. görev tamamlandı. Hikâye ilerlemesi ayrı kaydedildi.');
}
function exitStoryBattle(toMainMenu = false) {
    const session = window.__storyBattle;
    if (!session || !session.active || !session.snapshot) return;
    const s = session.snapshot;
    game = s.game; tower = s.tower; enemies = s.enemies; projectiles = s.projectiles;
    particles = s.particles; floatingTexts = s.floatingTexts; lightningBeams = s.lightningBeams;
    rings = s.rings; cargoDrones = s.cargoDrones;
    spawnTimer = s.spawnTimer; playTimeAccum = s.playTimeAccum; waveFrostSpawns = s.waveFrostSpawns;
    cargoSpawnTimer = s.cargoSpawnTimer; gameSpeed = s.gameSpeed; isPaused = true;
    isDefeated = s.isDefeated; defeatTimer = s.defeatTimer;
    document.body.dataset.gameMode = s.gameMode;
    window.__storyBattle = { active: false, completed: session.completed };
    const hud = document.getElementById('story-battle-hud');
    if (hud) { hud.hidden = true; hud.classList.remove('is-active'); }
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof refreshUpgradeButtonsState === 'function') refreshUpgradeButtonsState();
    if (typeof updateHoldWaveButton === 'function') updateHoldWaveButton();
    if (typeof updateStoryUnlockUI === 'function') updateStoryUnlockUI();
    if (toMainMenu) {
        closeStoryMode();
        return;
    }
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (menu) menu.classList.add('menu-hidden');
    if (screen) { screen.classList.add('is-open'); screen.setAttribute('aria-hidden', 'false'); }
    storyMissionViewOpen = true;
    const dialogue = document.getElementById('story-dialogue-view');
    const missions = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = true;
    if (missions) missions.hidden = false;
    if (note) note.classList.add('is-visible');
    const progress = document.getElementById('story-mission-progress');
    if (progress) progress.textContent = storyCopy(STORY_UI_COPY.completed);
    applyStoryUiLanguage();
    updateStoryMissionBoard();
}
function getStoryUnlockWave() {
    try {
        if (typeof game !== 'undefined' && game) return Math.max(Number(game.highestWave) || 1, Number(game.wave) || 1);
    } catch (_) {}
    return 1;
}
function updateStoryUnlockUI() {
    const wave = getStoryUnlockWave();
    const cleared = Math.max(0, wave - 1);
    const unlocked = cleared >= 25;
    const action = document.getElementById('mode-story-action');
    const button = document.getElementById('mode-story-button');
    if (action) action.innerHTML = unlocked
        ? (storyLanguage() === 'en' ? 'ENTER CHAPTER <span aria-hidden="true">→</span>' : 'BÖLÜME GİR <span aria-hidden="true">→</span>')
        : (storyLanguage() === 'en' ? `CLEAR 25 WAVES · ${Math.min(25, cleared)}/25 <span aria-hidden="true">🔒</span>` : `İLK 25 DALGAYI TAMAMLA · ${Math.min(25, cleared)}/25 <span aria-hidden="true">🔒</span>`);
    if (button) {
        button.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
        button.classList.toggle('story-locked', !unlocked);
    }
    return unlocked;
}
function openStoryMode() {
    if (!updateStoryUnlockUI()) {
        const subtitle = document.getElementById('mode-menu-subtitle');
        if (subtitle) subtitle.textContent = storyLanguage() === 'en'
            ? `Clear the first 25 waves in Endless Mode to unlock Story Mode. Progress: ${Math.min(25, Math.max(0, getStoryUnlockWave() - 1))}/25.`
            : `Hikâye Modu’nu açmak için Sonsuz Mod’da ilk 25 dalgayı tamamla. İlerlemen: ${Math.min(25, Math.max(0, getStoryUnlockWave() - 1))}/25.`;
        if (typeof showToast === 'function') showToast(storyLanguage() === 'en' ? 'Clear 25 waves in Endless Mode to unlock Story Mode.' : 'Hikâye Modu, Sonsuz Mod’da ilk 25 dalgayı tamamlayınca açılır.');
        return;
    }
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (!screen) return;
    if (menu) menu.classList.add('menu-hidden');
    if (typeof isPaused !== 'undefined') isPaused = true;
    storyMissionViewOpen = false;
    storyDialogueIndex = 0;
    const dialogue = document.getElementById('story-dialogue-view');
    const mission = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = false;
    if (mission) mission.hidden = true;
    if (note) note.classList.remove('is-visible');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    applyStoryUiLanguage();
    showStoryDialogue();
    const exit = screen.querySelector('.story-exit');
    if (exit) exit.focus({ preventScroll: true });
}
function advanceStoryDialogue() {
    if (storyMissionViewOpen) return;
    if (storyDialogueIndex < STORY_DIALOGUES.length - 1) {
        storyDialogueIndex++;
        showStoryDialogue();
        return;
    }
    showStoryMissionBriefing();
}
function skipStoryIntro() {
    showStoryMissionBriefing();
}
function closeStoryMode() {
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (screen) { screen.classList.remove('is-open'); screen.setAttribute('aria-hidden', 'true'); }
    if (menu) menu.classList.remove('menu-hidden');
    if (typeof isPaused !== 'undefined') isPaused = true;
    const subtitle = document.getElementById('mode-menu-subtitle');
    if (subtitle) subtitle.textContent = storyLanguage() === 'en'
        ? 'Choose your mission, Commander. The unknown signal is waiting.'
        : 'Görevini seç, komutan. Bilinmeyen sinyal bizi bekliyor.';
}
function showStoryModeComingSoon() { openStoryMode(); }
document.addEventListener('DOMContentLoaded', () => { updateStoryUnlockUI(); });
document.addEventListener('keydown', event => {
    const screen = document.getElementById('story-mode-screen');
    if (!screen || !screen.classList.contains('is-open')) return;
    if (event.key === 'Escape') { closeStoryMode(); return; }
    if (event.key === 'Enter' && !event.repeat && !storyMissionViewOpen) advanceStoryDialogue();
});



// ==========================================
// DİL DESTEĞİ — Türkçe / English
// UI metinleri çevrilir; oyun kayıtları ve mekanikler değişmez.
// ==========================================
const GAME_TRANSLATIONS = {
    "SAVUNMA PROTOKOLÜ · 01": "DEFENSE PROTOCOL · 01",
    "KULE SAVUNMA": "TOWER DEFENSE",
    "Nasıl bir mücadeleye hazırsın, komutan? Bir dünyayı kurtar ya da sınırlarını sonsuza kadar zorla.": "What challenge are you ready for, Commander? Save a world or push your limits forever.",
    "Hikâye Modu": "Story Mode",
    "Dünyaları keşfet, yeni tehditlerle yüzleş ve final boss'una ulaş. Hikâye yolculuğu hazırlanıyor.": "Explore worlds, face new threats, and reach the final boss. The story campaign is in development.",
    "Bilinmeyen sinyali araştır, ekibini kur ve istasyonun sırrını ortaya çıkar.": "Investigate the unknown signal, assemble your crew, and uncover the station's secret.",
    "Bölüme gir": "Enter chapter",
    "ATLA": "SKIP",
    "Yakında gelecek": "Coming soon",
    "Sonsuz Mod": "Endless Mode",
    "Mevcut savunmana devam et. Dalga sınırı yok; rekorunu geliştir, giderek güçlenen düşmanlara dayan.": "Continue your current defense. No wave limit—beat your record and survive increasingly powerful enemies.",
    "Savunmaya başla": "Start defending",
    "İLERLEMEN KORUNUR · SAVAŞ DENGESİ DEĞİŞMEZ": "YOUR PROGRESS IS PRESERVED · GAME BALANCE IS UNCHANGED",
    "Giriş Yap": "Log In",
    "Can": "Health",
    "Kalkan": "Shield",
    "Yenileme:": "Regeneration:",
    "Zırh:": "Armor:",
    "DALGA 1": "WAVE 1",
    "BOSS": "BOSS",
    "Düşman:": "Enemies:",
    "Oto İlerle": "Auto Advance",
    "HASAR": "DAMAGE",
    "ATIŞ HIZI": "FIRE RATE",
    "KRİTİK": "CRIT",
    "ÇOKLU": "MULTI",
    "Menzil": "Range",
    "Hasar": "Damage",
    "ÇEKİRDEK AŞIRI YÜKLENDİ!": "CORE OVERLOADED!",
    "Kule onarılıyor ve güvenli dalgaya çekiliyor...": "Tower repairing and retreating to a safe wave...",
    "Sistem Paneli": "System Panel",
    "CAN": "HP",
    "ZIRH": "ARMOR",
    "HIZ": "SPEED",
    "Saldırı": "Attack",
    "Savunma": "Defense",
    "Ekonomi": "Economy",
    "Yoldaş": "Companions",
    "Envanter": "Inventory",
    "Kutular": "Crates",
    "Prestij": "Prestige",
    "Kumar": "Casino",
    "Sıralama": "Leaderboard",
    "Aktif Yoldaş Görünümü:": "Active Companion Skin:",
    "Skin Değiştir": "Change Skin",
    "Kuşanılan Eşyalar (Maks 3)": "Equipped Items (Max 3)",
    "Envanterdeki Eşyalar (": "Inventory Items (",
    "Nadirlik: En Yüksek": "Rarity: Highest",
    "Tüm nadirlikler": "All rarities",
    "Nadir": "Rare",
    "Süper nadir": "Super Rare",
    "Epik": "Epic",
    "Mitik": "Mythic",
    "Efsanevi": "Legendary",
    "Tüm türler": "All types",
    "Hasar çarpanı": "Damage multiplier",
    "Kritik şans": "Critical chance",
    "Kritik hasar": "Critical damage",
    "Saldırı hızı": "Attack speed",
    "Can çalma": "Lifesteal",
    "Altın": "Gold",
    "Kalkan": "Shield",
    "Çoklu atış": "Multishot",
    "Aktif Kule Görünümü": "Active Tower Skin",
    "Klasik Plazma Kulesi": "Classic Plasma Tower",
    "AKTİF": "EQUIPPED",
    "Aktif Yoldaş Görünümü": "Active Companion Skin",
    "Koleksiyon: 0/0": "Collection: 0/0",
    "Eşya & Kuantum Sandığı": "Item & Quantum Crate",
    "ve özel eşyalar düşür!": "and special items!",
    "Açılan Eşya: 0 / 0": "Items opened: 0 / 0",
    "Kule Skin Kutusu": "Tower Skin Crate",
    "ve özel Kule Skinleri içerir!": "contains special Tower Skins!",
    "Açılan Kule Skini: 1 / 26": "Tower Skins unlocked: 1 / 26",
    "Yoldaş Skin Kutusu": "Companion Skin Crate",
    "Yörüngedeki yoldaşların için": "For your orbiting companions",
    "görünümleri!": "skins!",
    "Açılan Yoldaş Skini: 1 / 10": "Companion Skins unlocked: 1 / 10",
    "Kutu Düşme Oranları:": "Crate Drop Rates:",
    "EVRİM GEÇİR": "EVOLVE",
    "Sıfırlama:": "Reset:",
    "Dalganı sıfırlayarak Ruh Taşı kazan. (En az Başlangıç + 10. Dalgaya ulaşmalısın)": "Reset your wave to earn Soul Stones. (Reach at least Starting Wave + 10.)",
    "Kazanılacak:": "To earn:",
    "Gereken: Dalga 10": "Required: Wave 10",
    "SIFIRLA": "RESET",
    "Kristal Kumarhanesi": "Crystal Casino",
    "Para Birimi: Kristal": "Currency: Crystals",
    "Bahis Miktarı (Kristal):": "Bet Amount (Crystals):",
    "RULET": "ROULETTE",
    "BLACKJACK": "BLACKJACK",
    "KUANTUM": "QUANTUM",
    "ÇARK HAZIR": "WHEEL READY",
    "Renk seç, çarkı ve topu döndür!": "Pick a color, then spin the wheel and ball!",
    "KIRMIZI (x2)": "RED (x2)",
    "YEŞİL (x14)": "GREEN (x14)",
    "SİYAH (x2)": "BLACK (x2)",
    "Kasa (Bot):": "Dealer (Bot):",
    "Bekleniyor...": "Waiting...",
    "Sen (Oyuncu):": "You (Player):",
    "Kristal bahsini gir ve Dağıt'a bas.": "Enter your crystal bet and press Deal.",
    "KARTLARI DAĞIT": "DEAL CARDS",
    "KART ÇEK (HIT)": "HIT",
    "KAL (STAND)": "STAND",
    "FREKANSI BAŞLAT": "START FREQUENCY",
    "KÜRESEL LİDERLİK TABLOSU": "GLOBAL LEADERBOARD",
    "En yüksek dalgaya ulaşan kule komutanları ve aktif skinleri": "Tower commanders with the highest waves and their equipped skins",
    "Yenile": "Refresh",
    "Misafir Komutan": "Guest Commander",
    "Sıralamaya girmek için hesap aç!": "Create an account to appear on the leaderboard!",
    "Hesap Bağla": "Link Account",
    "En Yüksek Dalga": "Highest Wave",
    "Kule Hasarı": "Tower Damage",
    "Hesap & Bulut Sistemi": "Account & Cloud System",
    "Sunucu Durumu:": "Server Status:",
    "Hazır": "Ready",
    "arkadaşlarınla yarış!": "compete with your friends!",
    "Kayıt Ol": "Sign Up",
    "Kullanıcı Adı (Sıralamada Görünecek Adın):": "Username (shown on leaderboard):",
    "Şifre:": "Password:",
    "HESABA GİRİŞ YAP": "LOG IN",
    "VEYA TEK TIKLA": "OR WITH ONE CLICK",
    "Google ile Hızlı Bağlan": "Continue with Google",
    "Aktif Komutan Hesabı": "Active Commander Account",
    "Oyuncu": "Player",
    "Son Bulut Kaydı: Az önce": "Last Cloud Save: Just now",
    "Buluta Kaydet": "Save to Cloud",
    "Buluttan Çek": "Load from Cloud",
    "Hesaptan Çıkış Yap": "Log Out",
    "Hesabımı Kalıcı Olarak Sil": "Permanently Delete My Account",
    "Gizlilik Politikası": "Privacy Policy",
    "Tema Seçimi": "Theme Selection",
    "Ayarlar & Cihaz Modu": "Settings & Device Mode",
    "Dil / Language": "Language / Dil",
    "Dil tercihin bu cihazda hatırlanır.": "Your language preference is saved on this device.",
    "Cihaz Ekran Optimizasyonu:": "Device Display Optimization:",
    "Telefon": "Phone",
    "Tablet": "Tablet",
    "PC": "PC",
    "Genel İstatistikler": "General Statistics",
    "Toplam Düşman:": "Total Enemies:",
    "Boss Kesen:": "Bosses Defeated:",
    "En Yüksek Dalga:": "Highest Wave:",
    "Oyunu sıfırla:": "Reset game:",
    "Sıfırla": "Reset",
    "Onaylıyor musun?": "Are you sure?",
    "İptal": "Cancel",
    "Onayla": "Confirm",
    "KUANTUM MÜHRÜ KIRILIYOR...": "BREAKING THE QUANTUM SEAL...",
    "Hızlı Aç": "Quick Open",
    "KUTU AÇILDI!": "CRATE OPENED!",
    "KAZANILAN ÖDÜLLER": "REWARDS EARNED",
    "Kopya ödüllerden +10 Kristal iade edildi!": "+10 Crystals refunded for duplicate rewards!",
    "Tekrar Aç": "Open Again",
    "Harika! (Kapat)": "Great! (Close)",
    "Günlük Görevler": "Daily Quests",
    "Günlük hedefler": "Daily objectives",
    "Hedefleri tamamla, altın ve kristal kazan. Görevler yerel gün değiştiğinde yenilenir.": "Complete objectives to earn gold and crystals. Quests reset when the local day changes.",
    "SAVAŞ ALANINA DÖN": "RETURN TO BATTLEFIELD",
    "KOMUTAN DOSYASI": "COMMANDER DOSSIER",
    "Başarımlar & İstatistikler": "Achievements & Statistics",
    "İlerlemen mevcut kayıt verilerinden hesaplanır; eski kayıtların sıfırlanmaz.": "Progress is calculated from your current save data; existing saves are not reset.",
    "Komutan rozeti": "Commander Badge",
    "⚔️ Yeni Komutan": "⚔️ New Commander",
    "Başarım ilerlemesi": "Achievement Progress",
    "tamamlandı": "completed",
    "Müzik": "Music",
    "En yüksek dalga": "Highest Wave",
    "İmha edilen": "Defeated",
    "Yenilen boss": "Bosses defeated",
    "Oyun süresi": "Play time",
    "Kule görünümleri": "Tower skins",
    "Eşya koleksiyonu": "Item collection",
    "Eldeki altın": "Gold held",
    "Başarım koleksiyonu": "Achievement collection",
    "Ödüller otomatik hesaplanır": "Rewards are calculated automatically",
    "OYUNA DÖN": "RETURN TO GAME",
    "BÜYÜK SEZON GÜNCELLEMESİ": "MAJOR SEASON UPDATE",
    "Kule Savunma": "Tower Defense",
    "Savaş anları • Boss girişi • Özgün ses efektleri": "Battle moments • Boss entrances • Original sound effects",
    "V2.3 • Savaşın ritmi": "V2.3 • The rhythm of battle",
    "V2.1 • Envanter 2.0": "V2.1 • Inventory 2.0",
    "Komutan başarımları": "Commander achievements",
    "Yeni Kuzey Işıkları savaş alanı": "New Northern Lights battlefield",
    "Özgün sentetik ambient": "Original synthetic ambient",
    "Önceki güncellemeler korunuyor": "Previous updates preserved",
    "Geliştirme durumu": "Development status",
    "Bildirim": "Notification",
    "SAVUNMA HATTI": "DEFENSE LINE",
    "DALGA 01": "WAVE 01",
    "Temas bekleniyor.": "Awaiting contact.",
    "SFX AÇIK": "SFX ON",
    "Geri": "Back",
    "Devam Et": "Continue",
    "Satın Al": "Buy",
    "Yükselt": "Upgrade",
    "Maksimum": "Maximum",
    "Yetersiz Altın": "Not enough gold",
    "Yetersiz Kristal": "Not enough crystals",
    "Kapalı": "Closed",
    "Açık": "On",
    "Başarılı": "Success",
    "Hata": "Error",
    "Yükleniyor...": "Loading...",
    "Kaydediliyor...": "Saving...",
    "Kaydedildi": "Saved",
    "Durduruldu": "Paused",
    "Devam": "Resume",
    "Dalgayı Bitir": "End Wave",
    "Dalga": "Wave",
    "Altın": "Gold",
    "Kristal": "Crystals",
    "Ruh": "Soul",
    "Kristaller": "Crystals",
"Ana Menü": "Main Menu",
    "Görevler": "Quests",
    "Günlük Görevler": "Daily Quests",
    "Görevleri görüntüle ve ödüllerini topla.": "View your daily objectives and claim rewards.",
    "Günlük hedefler": "Daily objectives",
    "KUZEY IŞIKLARI SEZONU": "NORTHERN LIGHTS SEASON",
    "Hedefleri tamamla, altın ve kristal kazan. Görevler yerel gün değiştiğinde yenilenir.": "Complete objectives to earn gold and crystals. Quests reset when the local day changes.",
    "Günlük görevler bu cihazda saklanır ve istemci tarafında hesaplanır. Ödüller rekabetçi veya gerçek para değeri taşıyan ödüller değildir.": "Daily quests are stored on this device and calculated on the client. Rewards have no competitive or real-money value.",
    "SAVAŞ ALANINA DÖN": "RETURN TO BATTLEFIELD",
    "ANA MENÜYE DÖN": "RETURN TO MAIN MENU",
    "Tehdit Temizliği": "Threat Cleanup",
    "Bugün 50 düşman imha et": "Destroy 50 enemies today",
    "Boss Avı": "Boss Hunt",
    "Bugün 1 boss yen": "Defeat 1 boss today",
    "Nöbet Mesaisi": "On Duty",
    "Bugün 10 dakika savaş alanında kal": "Stay on the battlefield for 10 minutes today",
    "Dalga Dalgaya": "Wave Runner",
    "Bugün 5 dalga ilerle": "Advance 5 waves today",
    "ödül alındı": "rewards claimed",
    "ÖDÜLÜ AL": "CLAIM REWARD",
    "ALINDI ✓": "CLAIMED ✓",
    "DEVAM ET": "IN PROGRESS",
    "Hikâye modu için dünya haritası, bölüm ilerlemesi ve boss finalleri hazırlanıyor. Şimdilik Sonsuz Mod oynanabilir; mevcut ilerlemen güvende.": "The world map, chapter progression, and boss finales are in development. Endless Mode is playable now, and your current progress is safe.",
    "Görevler": "Quests",
    "Görev": "Quest",
    "Ayarlar": "Settings",
    "Hesap & Bulut Kayıt": "Account & Cloud Save",
    "Başarımlar ve istatistikler": "Achievements & statistics",
    "Kristal": "Crystals",
    "Ruh Taşı": "Soul Stone",
    "Yenilgi": "Defeat",
    "Yeniden Dene": "Try Again",
    "Devam Et": "Continue",
    "Savaş Alanına Dön": "Return to Battlefield",
    "Kule ağır hasar aldı! 2. yenilgide farm moduna geçilecek.": "The tower took heavy damage! Farm mode activates after a second defeat.",
    "Otomatik İlerleme Açıldı": "Auto Advance enabled",
    "Farm Modu Açıldı (4 dalga sonra oto döner)": "Farm Mode enabled (auto-advance returns after 4 waves)",
    "Farm modunda 4 dalga geçildi! Otomatik İlerleme aktif.": "Four waves cleared in Farm Mode! Auto Advance is now active.",
    "Oyun başka bir sekmede açık": "The game is open in another tab",
    "Oynamak için diğer oyun sekmesini kapatıp bu sayfayı yenile.": "Close the other game tab and refresh this page to play.",
    "Siber": "Cyber",
    "Plazma Kulesi": "Plasma Tower",
    "Kaydediliyor...": "Saving...",
    "Bulut kaydı başarılı": "Cloud save successful",
    "Bulut kaydı yüklenemedi": "Could not load cloud save",
    "Bağlantı hatası": "Connection error",
    "Günlük görev ödülü alındı!": "Daily quest reward claimed!",
    "Ödül alındı!": "Reward claimed!",
    "Yetersiz kaynak": "Insufficient resources",
    "Günlük görevler yenilendi!": "Daily quests refreshed!",
"Görevleri görüntüle": "View quests",
    "Eşyalar (": "Items (",
    "Yoldaş (": "Companions (",
    "Zırh": "Armor",
    "Sisifos'un Kayası": "Sisyphus' Rock",
    "Kanlı Kum Saati": "Bloody Hourglass",
    "Balonlu Sakız": "Bubble Gum",
    "Gölge Kunai": "Shadow Kunai",
    "Çubuk kayarken": "While the slider moves",
    "sarı": "yellow",
    "bölgede kilitle:": "lock in the zone:",
    "bölgede:": "in the zone:",
    ". Her başarı kombo çarpanını artırır, kaçırırsan kombo sıfırlanır.": ". Each success increases the combo multiplier; a miss resets the combo.",
    "Kombo Serisi: 0x (Çarpan: x1.0)": "Combo Streak: 0x (Multiplier: x1.0)",
    "Not: Sıralama puanları şu an oyun istemcisinden bildirilir; henüz sunucu tarafından oynanışla doğrulanmaz.": "Note: Leaderboard scores are currently reported by the game client and are not yet server-validated against gameplay.",
    "Sıralama değerleri şu an oyuncu istemcisinden gönderilir; sunucu tarafından doğrulanmaz. Bu nedenle hileye dayanıklı veya ödüllü rekabet için güvenilir skor sayılmaz.": "Leaderboard values are currently submitted by the player client and are not server-validated. They should not be treated as cheat-resistant scores for prize-based competition.",
    "Hesap oluşturarak ilerlemeni buluta yedekle! Telefondan kasıp tabletten veya PC'den aynı hesapla devam et ve": "Create an account to back up your progress to the cloud! Play on your phone and continue on a tablet or PC with the same account, and",
    "İsim": "Name",
    "🇹🇷 Türkçe": "🇹🇷 Turkish",
    "0 / 13 tamamlandı": "0 / 13 completed",
    "Rozet ve başarımlar mevcut oyun istatistiklerine dayanır. İstemci tarafında hesaplandıkları için tek başlarına hileye dayanıklı rekabet kanıtı değildir.": "Badges and achievements are based on current game statistics. Since they are calculated client-side, they are not by themselves proof of cheat-resistant competition.",
    "Dalga başında taktik çağrı, boss geldiğinde özel tehdit kartı ve dalga bitince altın/kristal ödül özeti. Gösterimler gerçek oyun olaylarına bağlıdır; ödülleri veya düşman dengesini değiştirmez.": "Tactical callouts at wave start, special threat cards for bosses, and gold/crystal summaries after waves. These displays reflect actual game events and do not change rewards or enemy balance.",
    "Eşyaları ada, açıklamaya, nadirliğe ve türe göre filtrele; ayrıntılarını aç ve tekrar eden envanter kayıtlarının temizlenmesini sağla.": "Filter items by name, description, rarity, and type; inspect details and clean up duplicate inventory entries.",
    "İlk boss, dalga rekorları ve imha istatistikleri profilinde takip edilir; komutan rozetleri kozmetik ilerleme sağlar.": "Your first boss, wave records, and elimination stats are tracked in your profile; commander badges provide cosmetic progression.",
    "Canvas üzerinde çizilen, hareketli aurora şeritleri, yıldız tozu ve kuantum halkalarıyla özgün sezon teması. Dış görsel veya müzik dosyası indirmez.": "An original seasonal theme with animated aurora bands, stardust, and quantum rings drawn on the canvas. No external image or music files are downloaded.",
    "Müzik düğmesiyle açılıp kapatılabilen, Web Audio API ile üretilen düşük sesli atmosferik tonlar. Otomatik başlamaz ve dış servise bağlanmaz.": "Soft atmospheric tones generated with the Web Audio API, toggled with the music button. They do not start automatically or connect to external services.",
    "Günlük görevler": "Daily quests",
    "Düşman imhası, boss savaşı, oyun süresi ve dalga ilerlemesi hedefleri. Görev başına bir kez altın/kristal ödülü; günlük sıfırlama yerel tarihe göre çalışır.": "Objectives for enemy eliminations, boss fights, playtime, and wave progress. Each quest grants gold/crystal rewards once; daily reset follows the local date.",
    "1.3.0 başarımlar, istatistikler, komutan rozetleri ve kargo dronu refleks görevi bu sürümde yer almaya devam eder.": "Version 1.3.0 achievements, statistics, commander badges, and the cargo-drone reflex challenge remain available in this release.",
    "Görevler ve ses istemci tarafındadır. Bu dal canlıya dağıtılmadı; mobil/masaüstü manuel testleri ve CI tamamlanmadan yayımlanmış sayılmaz.": "Quests and audio run client-side. This branch is not live; it should not be considered released until mobile/desktop manual tests and CI are complete.",
    "Savaş ses efektlerini kapat": "Turn battle sound effects off",
    "Savaş ses efektlerini aç": "Turn battle sound effects on",
    "BİLİNMEYEN HEDEF": "UNKNOWN TARGET",
    "TEHDİT ALGILANDI  /  ÖNCELİKLİ HEDEF": "THREAT DETECTED / PRIORITY TARGET",
    "Ağır zırh tespit edildi. Yakın menzilli darbelerine dikkat et.": "Heavy armor detected. Watch out for its close-range strikes.",
    "Topçusu": "Artillery",
    "Uzun menzilli topçu. Ateş baskısını kır ve kuleyi koru.": "Long-range artillery. Break its firing pressure and protect the tower.",
    "Vektörü": "Vector",
    "Yüksek hız ve ani atak. Saldırı penceresini iyi yakala.": "High speed and sudden attacks. Time your attack window carefully.",
    "Kriyo saldırıları algılandı. Donma etkisi ateş ritmini kesebilir.": "Cryo attacks detected. The freeze effect can interrupt your firing rhythm.",
    "Çok yönlü saldırı paterni. Kritik anlarda savunmayı koru.": "Versatile attack pattern. Protect your defense during critical moments.",
    "Ağır hedef yaklaşıyor. Kuleyi koru.": "Heavy target approaching. Protect the tower.",
    "TEHDİT ETKİSİZ HALE GETİRİLDİ": "THREAT NEUTRALIZED",
    "BOSS İMHA EDİLDİ": "BOSS ELIMINATED",
    "Ağır hedef": "Heavy target",
    "etkisiz. Savunma hattı nefes alıyor.": "neutralized. The defense line can breathe again.",
    "KRİSTAL": "CRYSTAL",
    "BÖLGE GÜVENDE  /  DALGA TAMAMLANDI": "AREA SECURE / WAVE COMPLETE",
    "TEMİZLENDİ": "CLEARED",
    "Savunma hattı ayakta. Sonraki temas için sistemler hazırlanıyor.": "The defense line stands. Systems are preparing for the next contact.",
    "KIRMIZI ALARM  /  KRİTİK DALGA": "RED ALERT / CRITICAL WAVE",
    "SAVUNMA PROTOKOLÜ  /  BOSS DALGASI": "DEFENSE PROTOCOL / BOSS WAVE",
    "YÜKSEK YOĞUNLUK  /  SÜRÜ DALGASI": "HIGH DENSITY / SWARM WAVE",
    "SAVUNMA HATTI  /  TEMAS BEKLENİYOR": "DEFENSE LINE / AWAITING CONTACT",
    "Tehdit seviyesi kritik. Bütün savunma sistemleri hazır olsun.": "Threat level critical. All defense systems, stand by.",
    "Ağır hedef sinyali bekleniyor. Pozisyonunu koru.": "Heavy target signal expected. Hold your position.",
    "Birden fazla temas algılandı. Alan kontrolünü bırakma.": "Multiple contacts detected. Maintain area control.",
    "Yeni düşman sinyalleri tespit edildi.": "New enemy signals detected.",
    "TEHDİT: KRİTİK": "THREAT: CRITICAL",
    "BOSS SİNYALİ": "BOSS SIGNAL",
    "SÜRÜ HAREKETİ": "SWARM MOVEMENT",
    "JavaScript hatası:": "JavaScript error:",
    "• Satır": "• Line",
    "Bilinmeyen Promise hatası": "Unknown promise error",
    "İşlem tamamlanamadı:": "Operation failed:",
    "Yakalanmamış Promise hatası": "Unhandled promise error",
    "Ana Menü": "Main Menu",
    "Görevleri görüntüle, tamamladığın görevlerin altın ve kristal ödüllerini topla.": "View your quests and claim gold and crystal rewards.",
    "Günlük görevleri kapat": "Close daily quests",
    "Oyun başka bir sekmede açık": "The game is open in another tab",
    "Oynamak için diğer oyun sekmesini kapatıp bu sayfayı yenile.": "Close the other game tab and refresh this page to play.",
    "Görevleri görüntüle, tamamladığın görevlerin altın ve kristal ödüllerini topla.": "View your quests and claim gold and crystal rewards.",
    "Günlük görev ödülü alındı!": "Daily quest reward claimed!",
    "Günlük görevler bu cihazda saklanır ve istemci tarafında hesaplanır. Ödüller rekabetçi veya gerçek para değeri taşıyan ödüller değildir.": "Daily quests are stored on this device and calculated client-side. Rewards have no competitive or real-money value."
};

// English translations for database-driven content (skins, items, upgrades and inspectors).
const GAME_CONTENT_TRANSLATIONS = {

    "Plazma Kulesi": "Plasma Tower",
    "DGDVRN (Altın Kaplama)": "DGDVRN (Gold-Plated)",
    "Kozmik Kara Delik": "Cosmic Black Hole",
    "Nane Kulesi": "Mint Tower",
    "Ateş Kulesi": "Fire Tower",
    "Balonlu Sakız": "Bubble Gum",
    "Siber Samuray": "Cyber Samurai",
    "Kardan Adam Kulesi": "Snowman Tower",
    "Yıldız Kruvazörü": "Star Cruiser",
    "Kızıl Ejderha": "Crimson Dragon",
    "Süpersonik Uçak": "Supersonic Jet",
    "Ormanlar Kralı Aslan": "King of the Jungle Lion",
    "Bengal Kaplanı": "Bengal Tiger",
    "Kraliyet Koltuğu": "Royal Throne",
    "Siber Meka": "Cyber Mech",
    "Ateş İblisi": "Fire Demon",
    "Yarış Arabası": "Racing Car",
    "Çılgın Maymun": "Crazy Monkey",
    "Kadim Ağaç": "Ancient Tree",
    "Uyku Emojisi": "Sleepy Emoji",
    "Bölge 51 Uzaylısı": "Area 51 Alien",
    "Gökdoğan Kuşu": "Peregrine Falcon",
    "Oyuncu Sandalyesi": "Gaming Chair",
    "Taktik Masası": "Tactical Table",
    "Sıcak Pizza": "Hot Pizza",
    "Altın Porselen": "Golden Porcelain",
    "Siber Taktik Dronu": "Cyber Tactical Drone",
    "Origami Turna": "Origami Crane",
    "Kuantum Prizma": "Quantum Prism",
    "Hayalet Ruh Küresi": "Ghost Orb",
    "Gölge Shuriken": "Shadow Shuriken",
    "Kızıl Kum Sarkacı": "Crimson Sand Pendulum",
    "Tiyatro Maskeleri": "Theater Masks",
    "Valkür Kanatları": "Valkyrie Wings",
    "Tutulma Hilali": "Eclipse Crescent",
    "Bozkurt Ruhu (Alfa)": "Grey Wolf Spirit (Alpha)",
    "Trajedi & Komedi Maskesi": "Tragedy & Comedy Mask",
    "Sisifos'un Ebedi Kayası": "Sisyphus' Eternal Boulder",
    "Kader Daktilosu": "Fate Typewriter",
    "Kanlı Kum Saati": "Crimson Hourglass",
    "Kızıl Yaylı Gölge Okçu": "Crimson Shadow Archer",
    "Hiçlik Çukuru İpi": "Void Pit Rope",
    "Yırtık Gelecek Mektubu": "Torn Letter from the Future",
    "İz Sürücü Adımları": "Tracker's Footsteps",
    "Kırık Yay Parçası": "Broken Bow Fragment",
    "Bakır Ganimet": "Copper Loot",
    "Demir Çivi": "Iron Nail",
    "Hafif Tüy": "Light Feather",
    "Minik Safir": "Tiny Sapphire",
    "Sağlam Meşe": "Sturdy Oak",
    "Paslı Dişli": "Rusty Gear",
    "Ucu Sivri Ok": "Sharp Arrow",
    "Kristal Parçası": "Crystal Shard",
    "Deri Kabza": "Leather Grip",
    "Bozkurt Dişi": "Grey Wolf Fang",
    "Optik Radar Merceği": "Optical Radar Lens",
    "Gümüş Sadak": "Silver Quiver",
    "Tüccar Yüzüğü": "Merchant's Ring",
    "Titanyum Levha": "Titanium Plate",
    "Rüzgar Tılsımı": "Wind Charm",
    "Yakut Göz": "Ruby Eye",
    "Enerji Hücresi": "Energy Cell",
    "Sıfır Noktası Modülü": "Zero-Point Module",
    "Termal Lazer Dürbünü": "Thermal Laser Scope",
    "Gölge Avcısı Yayı": "Shadow Hunter Bow",
    "Ejderha Pul Zırhı": "Dragon Scale Armor",
    "Zaman Kumları": "Sands of Time",
    "Vampir Dişi": "Vampire Fang",
    "Kararsız Plazma Çekirdeği": "Unstable Plasma Core",
    "Muramasa Plazma Kılıcı": "Muramasa Plasma Blade",
    "Aegis Yansıtıcı Kalkan": "Aegis Reflective Shield",
    "Kuantum Mıknatısı": "Quantum Magnet",
    "Valkür Kanadı": "Valkyrie Wing",
    "Ebedi Yaşam Kalbi": "Heart of Eternal Life",
    "Tanrısal Hükümdar Tacı": "Divine Sovereign Crown",
    "Ölümsüzlük Kadehi": "Chalice of Immortality",
    "Hiper-Türbin Motoru": "Hyper-Turbine Engine",
    "Kozmik Tekillik Çekirdeği": "Cosmic Singularity Core",
    "Sonsuzluk Efsanevi Yayı": "Legendary Bow of Infinity",
    "Kurt Kaan'ın Ebedi Totemi": "Kurt Kaan's Eternal Totem",
    "Plazma Hasarı": "Plasma Damage",
    "Atış Hızı": "Fire Rate",
    "Radar Menzili": "Radar Range",
    "Kritik Şansı": "Critical Chance",
    "Kritik Çarpanı": "Critical Multiplier",
    "Çoklu Atış": "Multishot",
    "Sekme (Zincir)": "Chain Bounce",
    "Şok Dalgası": "Shockwave",
    "Titanyum Gövde": "Titanium Hull",
    "Nano Onarım": "Nano Repair",
    "Reaktif Zırh": "Reactive Armor",
    "Plazma Kalkanı": "Plasma Shield",
    "Can Çalma": "Lifesteal",
    "Dikenli Zırh": "Thorn Armor",
    "Ganimet Çarpanı": "Loot Multiplier",
    "Dalga İkramiyesi": "Wave Bonus",
    "Kristal Sondajı": "Crystal Drilling",
    "Kuantum Bankası": "Quantum Bank",
    "Antik Çekirdek": "Ancient Core",
    "Altın Simyası": "Gold Alchemy",
    "Senkronize Yörünge": "Synchronized Orbit",
    "Mühendislik Verimi": "Engineering Efficiency",
    "Zaman Sıçraması": "Time Leap",
    "Standart siber savunma kulesi.": "Standard cyber-defense tower.",
    "Özel üretim saf altın kaplamalı efsanevi kule!": "A legendary tower finished in custom pure gold plating!",
    "Uzay-zamanı büken, etrafında olay ufku dönen efsanevi kara delik kulesi!": "A legendary black-hole tower that bends spacetime, with an event horizon orbiting it!",
    "Buzlu nane yaprakları ve ferahlatıcı zümrüt kristaliyle düşmanları kesen efsanevi kule!": "A legendary tower that slices enemies with icy mint leaves and a refreshing emerald crystal!",
    "Volkanik magma çekirdeği ve dönen alev halkalarıyla her şeyi kül eden efsanevi kule!": "A legendary tower that turns everything to ash with a volcanic magma core and spinning rings of fire!",
    "Şişip patlayan tatlı pembe balonlu sakız otomatı kulesi.": "A sweet pink bubble-gum machine tower that inflates and pops.",
    "Çift katana namlulu, kızıl kabuto miğferli ölümsüz Shogun kulesi.": "An immortal Shogun tower with twin katana barrels and a crimson kabuto helmet.",
    "Havuç burunlu efsanevi Kardan Adam kulesi.": "A legendary snowman tower with a carrot nose.",
    "Galaktik uzay kruvazörü kule görünümü.": "A galactic space-cruiser tower skin.",
    "Kanatlı ve boynuzlu ateş püskürten ejderha.": "A winged, horned dragon that breathes fire.",
    "Ses duvarını aşan çift türbinli F-22 avcı uçağı kulesi.": "An F-22 fighter-jet tower with twin turbines that breaks the sound barrier.",
    "Kükreyen altın yeleli aslan kulesi.": "A lion tower with a roaring golden mane.",
    "Siyah çizgili keskin pençeli kaplan kulesi.": "A tiger tower with black stripes and razor-sharp claws.",
    "Mor kadife ve altın varaklı kraliyet koltuğu.": "A royal throne upholstered in purple velvet and gold leaf.",
    "Kırmızı lazer vizörlü ağır çelik meka.": "A heavy steel mech with a red laser visor.",
    "Lav çekirdekli ve boynuzlu ateş iblisi.": "A horned fire demon with a lava core.",
    "Çift şeritli kırmızı spor yarış arabası.": "A red sports racing car with twin stripes.",
    "Muz namlulu plazma fırlatan maymun.": "A monkey that fires plasma from a banana-shaped barrel.",
    "Kök salmış yapraklı doğa koruyucusu.": "A leafy nature guardian with deep roots.",
    "Zzz efektli uyurken bile tek atan kule.": "A tower that one-shots enemies even while sleeping, with a Zzz effect.",
    "UFO tabanlı yeşil uzaylı kulesi.": "A green alien tower built on a UFO base.",
    "Açık kanatlı çevik gökdoğan kulesi.": "An agile peregrine-falcon tower with outstretched wings.",
    "RGB aydınlatmalı kırmızı-siyah oyuncu koltuğu.": "A red-and-black gaming chair with RGB lighting.",
    "Üzerinde radar haritası olan meşe masa.": "An oak table with a radar map on top.",
    "Sucuklu ve erimiş peynirli İtalyan pizzası.": "An Italian pizza topped with sausage and melted cheese.",
    "Girdaplı porselen mizahi kule skini.": "A humorous tower skin made of swirling porcelain.",
    "Göz yormayan, zarif kanatlı standart taktik yoldaş dronu.": "A standard tactical companion drone with elegant wings and a gentle look.",
    "Minimalist katlanmış kağıt turna kuşu yoldaş görünümü.": "A minimalist companion skin inspired by a folded paper crane.",
    "Yumuşak neon hatlı, sakin dönen geometrik enerji kristali.": "A geometric energy crystal with soft neon edges that rotates calmly.",
    "Dingin mavi-mor ruh halkasıyla süzülen mistik küre.": "A mystical orb drifting with a serene blue-violet spirit ring.",
    "Yörüngede sessizce süzülen mat çelik ninja yıldızı.": "A matte-steel ninja star silently gliding in orbit.",
    "Zamanı büken mini kızıl kum saati uyduları.": "Miniature crimson hourglass satellites that bend time.",
    "Trajedi ve Komedi sanatını yansıtan zarif ikili maske.": "An elegant pair of masks representing Tragedy and Comedy.",
    "Altın halesi ve zarif tüylü kanatlarıyla koruyucu melek uydusu.": "A guardian-angel satellite with a golden halo and graceful feathered wings.",
    "Karanlık güneş tutulması ve altın hilal yörünge uydusu.": "An orbital satellite themed around a dark solar eclipse and golden crescent.",
    "Gök mavisi ve altın hilal izi bırakan efsanevi Bozkurt totemi.": "A legendary Grey Wolf totem leaving sky-blue and golden crescent trails.",
    "Taban hasarı artırır. Her 10 ve 25 Sv. ekstra çarpan verir.": "Increases base damage. Grants extra multipliers every 10 and 25 levels.",
    "Her Sv. +0.055/sn atış hızı (Maks 50 Sv: 3.60/sn).": "Adds +0.055 shots/sec per level (max level 50: 3.60 shots/sec).",
    "Her Sv. +4 px nişancı menzili (Maks 40 Sv: 286 px).": "Adds +4 px attack range per level (max level 40: 286 px).",
    "Her seviye +%1.5 kritik şansı (Maks 48 Sv: %75).": "Adds +1.5% critical chance per level (max level 48: 75%).",
    "Her Sv. +0.08x ve 15 Sv.de +0.15x kritik hasar (Maks 100 Sv).": "Adds +0.08x critical damage per level and +0.15x at level 15 (max level 100).",
    "Aynı anda vurulan hedef sayısı (Maks 5 Sv: +5 Hedef).": "Number of targets hit at once (max level 5: +5 targets).",
    "Merminin yakındaki düşmana sekmesi (%60 hasar, Maks 5 Sv).": "Projectiles bounce to nearby enemies (60% damage, max level 5).",
    "Vurulan düşmanları geri iter (Maks 3 Sv).": "Knocks hit enemies backward (max level 3).",
    "Maksimum canı artırır. Her 10 ve 25 Sv. ekstra çarpan.": "Increases maximum health. Grants extra multipliers every 10 and 25 levels.",
    "Saniyede otomatik can yenileme (10 ve 25 Sv. çarpanlı).": "Automatically regenerates health every second (multipliers at levels 10 and 25).",
    "Düşman hasarını doğrudan emer (Maks %75 soğurma).": "Directly absorbs enemy damage (up to 75% absorption).",
    "Saniyede %5 otomatik yenilenen enerji kalkanı.": "An energy shield that automatically regenerates by 5% per second.",
    "Her Sv. +%0.35 can çalma (Maks 20 Sv: %7.0).": "Adds +0.35% lifesteal per level (max level 20: 7.0%).",
    "Saldırana hasarı geri yansıtır (Her Sv. +%3, Maks %75).": "Reflects damage back at attackers (+3% per level, max 75%).",
    "Her Sv. +%6 altın kazancı (Her 10 Sv. ekstra çarpan).": "Adds +6% gold earnings per level (extra multiplier every 10 levels).",
    "Dalga geçildiğinde ekstra altın ödülü verir.": "Grants bonus gold when a wave is cleared.",
    "Her Sv. +%0.45 şans ve +%8 kristal çarpanı (Maks 30 Sv).": "Adds +0.45% drop chance and +8% crystal multiplier per level (max level 30).",
    "Dalga sonu kasa faizi: Her Sv. +%0.4 (Maks 15 Sv: %6.0).": "End-of-wave bank interest: +0.4% per level (max level 15: 6.0%).",
    "İki yüzlü sahne tılsımı: Tüm kule hasarını +%100 (x2.0) katlar!": "A two-faced stage charm: doubles all tower damage (+100%, x2.0)!",
    "Durmaksızın zirveye taşınan kaya: Maksimum canı +%75 artırır.": "A boulder endlessly pushed uphill: increases maximum health by 75%.",
    "Geleceği yazan yeşil daktilo: Kritik hasar çarpanını +0.70x artırır.": "A green typewriter that writes the future: increases the critical damage multiplier by +0.70x.",
    "Kızıl kumları çatlaklardan sızan saat: Atış hızını +0.25/sn artırır.": "An hourglass leaking crimson sand through its cracks: increases fire rate by +0.25/sec.",
    "Uzun kızıl yaylı avcı ruhu: Tüm kule hasarını +%38 artırır.": "A hunter spirit with a long crimson bow: increases all tower damage by 38%.",
    "Karanlık delikten çıkış halatı: Can çalma oranını +%1.8 artırır.": "A rope out of a dark pit: increases lifesteal by 1.8%.",
    "Gizemli ayak izleri: Kule radar menzilini +25 piksel artırır.": "Mysterious footprints: increases tower radar range by 25 pixels.",
    "Tüm kule hasarını +%7 artırır.": "Increases all tower damage by 7%.",
    "Altın kazancını +%8 artırır.": "Increases gold earnings by 8%.",
    "Zırh değerini +%8 artırır.": "Increases armor by 8%.",
    "Atış hızını +0.05/sn artırır.": "Increases fire rate by +0.05/sec.",
    "Kritik şansını +%2.5 artırır.": "Increases critical chance by 2.5%.",
    "Maksimum canı +%8 artırır.": "Increases maximum health by 8%.",
    "Can yenilemesini +%8 artırır.": "Increases health regeneration by 8%.",
    "Kritik çarpanını +0.12x artırır.": "Increases the critical multiplier by +0.12x.",
    "Kristal düşme şansını +%1.0 artırır.": "Increases crystal drop chance by 1.0%.",
    "Menzili +10 piksel artırır.": "Increases range by 10 pixels.",
    "Kritik şansını +%3 artırır.": "Increases critical chance by 3%.",
    "Menzili +14 piksel artırır.": "Increases range by 14 pixels.",
    "Tüm kule hasarını +%16 artırır.": "Increases all tower damage by 16%.",
    "Altın kazancını +%18 artırır.": "Increases gold earnings by 18%.",
    "Zırh değerini +%16 artırır.": "Increases armor by 16%.",
    "Atış hızını +0.12/sn artırır.": "Increases fire rate by +0.12/sec.",
    "Kritik şansını +%5 artırır.": "Increases critical chance by 5%.",
    "Plazma kalkanını +%18 artırır.": "Increases plasma shield by 18%.",
    "Can yenilemesini +%18 artırır.": "Increases health regeneration by 18%.",
    "Kritik çarpanını +0.28x artırır.": "Increases the critical multiplier by +0.28x.",
    "Tüm kule hasarını +%32 artırır.": "Increases all tower damage by 32%.",
    "Maksimum canı +%35 artırır.": "Increases maximum health by 35%.",
    "Atış hızını +0.22/sn artırır.": "Increases fire rate by +0.22/sec.",
    "Can çalma oranını +%1.2 artırır.": "Increases lifesteal by 1.2%.",
    "Kritik çarpanını +0.50x artırır.": "Increases the critical multiplier by +0.50x.",
    "Tüm kule hasarını +%36 artırır.": "Increases all tower damage by 36%.",
    "Plazma kalkanını +%35 artırır.": "Increases plasma shield by 35%.",
    "Kristal düşme şansını +%2.0 artırır.": "Increases crystal drop chance by 2.0%.",
    "Tüm kule hasarını +%65 artırır.": "Increases all tower damage by 65%.",
    "Maksimum kule canını +%65 artırır.": "Increases maximum tower health by 65%.",
    "Altın kazancını +%55 artırır.": "Increases gold earnings by 55%.",
    "Can çalma oranını +%2.5 artırır.": "Increases lifesteal by 2.5%.",
    "Atış hızını +0.38/sn artırır.": "Increases fire rate by +0.38/sec.",
    "Tüm kule hasarını +%90 (x1.9) çarpanla katlar!": "Multiplies all tower damage by x1.9 (+90%)!",
    "Ekstra +1 Çoklu Atış hedefi sağlar!": "Grants +1 additional Multishot target!",
    "Tüm kule hasarını +%115 (x2.15) çarpanla katlar!": "Multiplies all tower damage by x2.15 (+115%)!",
    "AKTİF": "ACTIVE",
    "SAHİP": "OWNED",
    "KİLİTLİ": "LOCKED",
    "TAKILI": "EQUIPPED",
    "Çıkar": "Unequip",
    "Boş Slot": "Empty Slot",
    "Detaylar": "Details",
    "Nadirlik: En Yüksek": "Rarity: Highest First",
    "Nadirlik: En Düşük": "Rarity: Lowest First",
    "KUŞANILDI": "EQUIPPED",
    "ENVANTERDE": "IN INVENTORY",
    "EFSANEVİ": "LEGENDARY",
    "MİTİK": "MYTHIC",
    "EPİK": "EPIC",
    "SÜPER NADİR": "SUPER RARE",
    "NADİR": "RARE",
    "Eşya": "Item",
    "Açıklama yok.": "No description."
,

    "Plazma Kulesi": "Plasma Tower",
    "Siber Çekirdek": "Cyber Core",
    "Kuzey Işıkları Sezonu": "Northern Lights Season",
    "Cengiz Hakanlığı": "Cengiz Khanate",
    "Buzul Gezegeni (Kar)": "Glacial Planet (Snow)",
    "Kızıl Çöl & Kaktüs": "Crimson Desert & Cactus",
    "Derin Uzay Nebulası": "Deep Space Nebula",
    "Buubglegum Rüyası": "Bubblegum Dream",
    "Dalgalanan kutup ışıkları, yıldız tozu ve özgün sentetik ambient müzik.": "Flowing auroras, stardust, and original synthetic ambient music.",
    "15. Dalgada açılır. Destansı kılıçlar, kızıl korlar ve hakanlık mührü.": "Unlocks at wave 15. Epic swords, crimson embers, and a khanate seal.",
    "30. Dalgada açılır. Çam ağaçları, kuzey ışıkları ve kristal kar fırtınası.": "Unlocks at wave 30. Pine trees, auroras, and a crystalline snowstorm.",
    "45. Dalgada açılır. Dev kaktüsler, kum tepeleri ve çöl güneşi.": "Unlocks at wave 45. Giant cacti, sand dunes, and the desert sun.",
    "60. Dalgada açılır. Renkli nebulalar, halkalı gezegenler ve kayan yıldızlar.": "Unlocks at wave 60. Colorful nebulae, ringed planets, and shooting stars.",
    "100. Dalgada açılır. Mavi-pembe kelebekler ve uçuşan sakız balonları!": "Unlocks at wave 100. Blue-pink butterflies and floating bubble-gum balloons!",
    "Asil bozkurt ruhu taşıyan, uluyarak plazma pençesi fırlatan Efsanevi Kurt Kaan kulesi!": "The legendary Kurt Kaan tower channels a noble grey-wolf spirit and fires plasma claws with a howl!",
    "Altın güneş halesi ve siber imparatorluk çekirdeğiyle parlayan efsanevi Sunkas kulesi!": "The legendary Sunkas tower shines with a golden solar halo and a cyber-imperial core!",
    "Yüksek voltajlı Tesla bobinleri ve şok yıldırımları saçan efsanevi elektro-şok kulesi!": "A legendary electro-shock tower with high-voltage Tesla coils and crackling lightning!",
    "Durmaksızın zirveye taşınan kaya: Maksimum canı +%75 artırır.": "A boulder endlessly pushed uphill: increases maximum health by 75%.",
    "Geleceği yazan yeşil daktilo: Kritik hasar çarpanını +0.70x artırır.": "A green typewriter that writes the future: increases the critical damage multiplier by +0.70x.",
    "Kızıl kumları çatlaklardan sızan saat: Atış hızını +0.25/sn artırır.": "An hourglass leaking crimson sand through its cracks: increases fire rate by +0.25/sec.",
    "Uzun kızıl yaylı avcı ruhu: Tüm kule hasarını +%38 artırır.": "A hunter spirit with a long crimson bow: increases all tower damage by 38%.",
    "Karanlık delikten çıkış halatı: Can çalma oranını +%1.8 artırır.": "A rope out of a dark pit: increases lifesteal by 1.8%.",
    "Üzerinde \"Gelecek\" yazan kadim parşömen: Altın kazancını +%30 artırır.": "An ancient scroll marked “Future”: increases gold earnings by 30%.",
    "Lazer Dronu": "Laser Drone",
    "Buzul Küresi": "Glacier Orb",
    "Füze Botu": "Missile Bot",
    "Tamir Dronu": "Repair Drone",
    "Plazma Uydusu": "Plasma Satellite",
    "Seri plazma lazeri ateşler (5★ olduğunda kritik vurabilir).": "Fires rapid plasma lasers (can deal critical hits at 5★).",
    "Buz etkisiyle düşmanları yavaşlatır.": "Slows enemies with a freezing effect.",
    "Düşmanlara füze fırlatır.": "Launches missiles at enemies.",
    "Kuleyi onararak hayatta kalmasına yardım eder.": "Repairs the tower to help it survive.",
    "Yörüngeden plazma desteği sağlar.": "Provides plasma support from orbit.",
    "Tüm kule ve yoldaş hasarını kalıcı olarak katlar (+%20/Sv).": "Permanently increases all tower and companion damage (+20% per level).",
    "Tüm altın kazancını kalıcı olarak artırır (+%20/Sv).": "Permanently increases all gold earnings (+20% per level).",
    "Yıldızlı yoldaşların tüm hasarını katlar (+%25/Sv).": "Increases all damage dealt by star-ranked companions (+25% per level).",
    "Yükseltme altın maliyetini kalıcı düşürür (-%2/Sv, Maks -%50).": "Permanently reduces upgrade gold costs (-2% per level, max -50%).",
    "Prestij sonrası ileri dalgadan ve başlangıç altınıyla başlatır.": "After prestige, start at a later wave with starting gold.",
    "Hasar": "Damage",
    "Çarpan Hasarı": "Damage Multiplier",
    "Can": "Health",
    "Kritik Şans": "Critical Chance",
    "Kritik Hasar": "Critical Damage",
    "Saldırı Hızı": "Fire Rate",
    "Altın": "Gold",
    "Menzil": "Range",
    "Zırh": "Armor",
    "Can Yenileme": "Health Regeneration",
    "Kristal": "Crystal",
    "Kalkan": "Shield",
    "Özel": "Special",
    "Nadir": "Rare",
    "Süper Nadir": "Super Rare",
    "Epik": "Epic",
    "Mitik": "Mythic",
    "Efsanevi": "Legendary",
    "Seviye:": "Level:",
    "Mevcut:": "Current:",
    "Sınır:": "Limit:",
    "Maliyet:": "Cost:",
    "1★ Aç": "Unlock 1★",
    "Yükselt": "Upgrade",
    "Aç": "Unlock",
    "SEÇ": "SELECT"
,

    "Klasik siber savunma atmosferi.": "A classic cyber-defense atmosphere.",
    "Buz gibi su dalgalı şişe kulesi.": "A tower skin shaped like a bottle of ice-cold water with rippling waves.",
    "Alan yavaşlatma ve dondurucu şok dalgası yayar.": "Emits an area slow effect and a freezing shockwave.",
    "Yüksek patlayıcılı alan (AoE) füzesi fırlatır.": "Launches high-explosive area-of-effect (AoE) missiles.",
    "Kule Canını ve Plazma Kalkanını yüzdelik olarak onarır.": "Restores a percentage of the tower's health and plasma shield.",
    "Çoklu hedefe zincirleme yıldırım ve düşman MaksHP yüzdesi hasarı verir.": "Chains lightning across multiple targets and deals damage based on a percentage of enemy max HP.",
    "Cyber Core": "Cyber Core",
    "Siber Çekirdek": "Cyber Core"
,

    "Sunkas Kulesi": "Sunkas Tower",
    "Teyzir Kulesi": "Teyzir Tower",
    "Su Şişesi": "Water Bottle",
    "Füze Bataryası": "Missile Battery",
    "Onarım Mekaniği": "Repair Mechanic",
    "EŞYA": "ITEM",
    "KOZMETİK": "COSMETIC"

};

function localizeGameContent(value) {
    if (typeof value !== 'string' || getGameLanguage() !== 'en') return value;
    if (Object.prototype.hasOwnProperty.call(GAME_CONTENT_TRANSLATIONS, value)) return GAME_CONTENT_TRANSLATIONS[value];
    return value.replace(/\\bSv\\./g, 'Lv.').replace(/\\bMaks\\b/g, 'Max');
}


const gameTextOriginals = new WeakMap();
const gameAttributeOriginals = new WeakMap();
let gameLanguageObserver = null;

function translateGameNode(node, language) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
        if (!gameTextOriginals.has(node)) gameTextOriginals.set(node, node.nodeValue);
        const original = gameTextOriginals.get(node);
        const trimmed = original.trim();
        if (!trimmed) return;
        const translated = language === 'en' ? localizeGameMessage(trimmed) : original;
        if (language === 'en' || translated !== undefined) {
            const leading = original.match(/^\s*/)?.[0] || '';
            const trailing = original.match(/\s*$/)?.[0] || '';
            const next = language === 'en' ? leading + translated + trailing : original;
            if (node.nodeValue !== next) node.nodeValue = next;
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;
        for (const attr of ['placeholder', 'title', 'aria-label']) {
            if (node.hasAttribute(attr)) {
                let originals = gameAttributeOriginals.get(node);
                if (!originals) { originals = {}; gameAttributeOriginals.set(node, originals); }
                if (!(attr in originals)) originals[attr] = node.getAttribute(attr);
                const original = originals[attr];
                if (language === 'en') node.setAttribute(attr, localizeGameMessage(original));
                else if (language === 'tr') node.setAttribute(attr, original);
            }
        }
        for (const child of node.childNodes) translateGameNode(child, language);
    }
}

function applyGameLanguage(language) {
    const selected = language === 'en' ? 'en' : 'tr';
    document.documentElement.lang = selected;
    document.title = selected === 'en' ? 'Tower Defense: Endless Loop' : 'Kule Savunma: Sonsuz Döngü | v2.0.0';
    translateGameNode(document.body, selected);
    const selector = document.getElementById('language-select');
    if (selector) selector.value = selected;
    if (gameLanguageObserver) gameLanguageObserver.disconnect();
    gameLanguageObserver = new MutationObserver(mutations => {
        const current = localStorage.getItem('towerDefenseLanguage') || 'tr';
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) translateGameNode(node, current);
            } else if (mutation.type === 'characterData') {
                translateGameNode(mutation.target, current);
            }
        }
    });
    gameLanguageObserver.observe(document.body, { childList: true, subtree: true });
}

const GAME_DYNAMIC_TRANSLATIONS = {
    'Kule Skini Kuşanıldı': 'Tower skin equipped',
    'Yoldaş Skini Kuşanıldı': 'Companion skin equipped',
    'Cihaz modu:': 'Device mode:',
    'olarak ayarlandı.': ' set.',
    'yörüngeye yerleşti!': ' entered orbit!',
    'seviyesine yükseldi!': ' upgraded!',
    'Evrim için en az Dalga': 'Reach at least Wave',
    'olmalısın.': ' to evolve.',
    'Evrimleşildi!': 'Prestige complete!',
    'Ruh Taşı kazanıldı.': 'Soul Stones earned.',
    'Çubuk kayarken': 'While the slider moves',
    'sarı': 'yellow',
    'mavi': 'blue',
    'bölgede kilitle:': 'zone, lock at:',
    'bölgede:': 'zone:',
    'Çark zaten dönüyor!': 'The wheel is already spinning!',
    'Top dönüyor, bol şans!': 'The ball is spinning. Good luck!',
    'Rulet Kazancı:': 'Roulette winnings:',
    'KAYBETTİN!': 'YOU LOST!',
    'ŞİMDİ KİLİTLE!': 'LOCK NOW!',
    'KUSURSUZ KİLİT!': 'PERFECT LOCK!',
    'STABİL KİLİT!': 'STABLE LOCK!',
    'FREKANS KAÇTI!': 'FREQUENCY MISSED!',
    'Kombo Serisi:': 'Combo Streak:',
    'Tüm Eşyalar Açıldı!': 'All items unlocked!',
    'Açılan Eşya:': 'Items opened:',
    'Açılan Kule Skini:': 'Tower skins unlocked:',
    'Açılan Yoldaş Skini:': 'Companion skins unlocked:',
    'Koleksiyon Tamamlandı!': 'Collection Complete!',
    'Kopya ödüllerden': 'Duplicate rewards: ',
    'Kristal iade edildi!': ' Crystals refunded!',
    'Bu eşya artık mevcut değil.': 'This item is no longer available.',
    'Bu eşyaya sahip değilsin veya eşya geçersiz.': 'You do not own this item or it is invalid.',
    'Eşya çıkarıldı.': 'Item unequipped.',
    'En fazla 3 farklı eşya kuşanabilirsin!': 'You can equip up to 3 different items!',
    'Eşya kuşanıldı!': 'Item equipped!',
    'Boş Slot': 'Empty Slot',
    'Henüz eşyan yok. Kutular sekmesinden sandık aç!': 'No items yet. Open a crate from the Crates tab!',
    'Bu filtrelerle eşya bulunamadı.': 'No items match these filters.',
    'Oyun tamamen sıfırlandı.': 'Game reset completely.',
    'En Yüksek Dalga:': 'Highest Wave:',
    'Sıralama Aktif': 'Leaderboard active',
    'Hesabım': 'My Account',
    'Sıralamaya adınla girmek için hesap bağla!': 'Link an account to appear on the leaderboard!',
    'Google ile giriş başarılı,': 'Google sign-in successful,',
    'Google giriş hatası:': 'Google sign-in error:',
    'Tekrar dene.': 'Try again.',
    'Hoş geldin': 'Welcome',
    'hesabı oluşturuldu!': 'account created!',
    'Giriş Hatası:': 'Sign-in error:',
    'Bilgileri kontrol et.': 'Check your details.',
    'Liderlik tablosunda görünecek yeni komutan adını gir:': 'Enter your new commander name for the leaderboard:',
    'Komutan adı en az 3 karakter olmalı.': 'Commander name must be at least 3 characters.',
    'Bu kullanıcı adı zaten alınmış. Başka bir ad seç.': 'That username is already taken. Choose another.',
    'Önce bir hesapla giriş yapmalısın.': 'You must sign in first.',
    'Hesaptan çıkış yapıldı.': 'Signed out.',
    'Önce giriş yapmalısın!': 'You must sign in first!',
    'Son Bulut Kaydı:': 'Last cloud save:',
    'İlerlemen başarıyla buluta kaydedildi!': 'Your progress was saved to the cloud!',
    'Bulut kaydı yüklendi!': 'Cloud save loaded!',
    'Bulutta henüz kayıtlı veri bulunamadı.': 'No cloud save found yet.',
    'Buluttan veri çekilemedi.': 'Could not load data from the cloud.',
    'Elit Muhafız': 'Elite Guardian',
    'Öncü': 'Vanguard',
    'İmha Ustası': 'Master Slayer',
    'Boss Kâşifi': 'Boss Scout',
    'TAMAMLANDI ✓': 'COMPLETED ✓',
    'Günlük hedef tamamlandı:': 'Daily objective completed:',
    'altın,': 'gold,',
    'kristal!': 'crystals!',
    'Sezon müziği kapatıldı.': 'Season music turned off.',
    'Bu tarayıcıda Web Audio desteklenmiyor.': 'Web Audio is not supported in this browser.',
    'Kuzey Işıkları ambient müziği açıldı.': 'Northern Lights ambient music enabled.',
    'Müzik Açık': 'Music On',
    'Paneli Gizle': 'Hide Panel',
    'Yükseltmeleri Aç': 'Show Upgrades',
    'TEHDİT ALGILANDI  /  ÖNCELİKLİ HEDEF': 'THREAT DETECTED / PRIORITY TARGET',
    'Ağır zırh tespit edildi. Yakın menzilli darbelerine dikkat et.': 'Heavy armor detected. Watch out for close-range strikes.',
    'Uzun menzilli topçu. Ateş baskısını kır ve kuleyi koru.': 'Long-range artillery. Break its firing pressure and protect the tower.',
    'Yüksek hız ve ani atak. Saldırı penceresini iyi yakala.': 'High speed and sudden attacks. Time your attack window carefully.',
    'Kriyo saldırıları algılandı. Donma etkisi ateş ritmini kesebilir.': 'Cryo attacks detected. Freezing effects can interrupt your firing rhythm.',
    'Çok yönlü saldırı paterni. Kritik anlarda savunmayı koru.': 'Multi-directional attack pattern. Protect your defenses at critical moments.',
    'Ağır hedef yaklaşıyor. Kuleyi koru.': 'Heavy target approaching. Protect the tower.',
    'TEHDİT ETKİSİZ HALE GETİRİLDİ': 'THREAT NEUTRALIZED',
    'BOSS İMHA EDİLDİ': 'BOSS DESTROYED',
    'BÖLGE GÜVENDE  /  DALGA TAMAMLANDI': 'AREA SECURE / WAVE COMPLETE',
    'Savunma hattı ayakta. Sonraki temas için sistemler hazırlanıyor.': 'Defense line holding. Systems preparing for the next contact.',
    'KIRMIZI ALARM  /  KRİTİK DALGA': 'RED ALERT / CRITICAL WAVE',
    'SAVUNMA PROTOKOLÜ  /  BOSS DALGASI': 'DEFENSE PROTOCOL / BOSS WAVE',
    'YÜKSEK YOĞUNLUK  /  SÜRÜ DALGASI': 'HIGH DENSITY / SWARM WAVE',
    'SAVUNMA HATTI  /  TEMAS BEKLENİYOR': 'DEFENSE LINE / AWAITING CONTACT',
    'Tehdit seviyesi kritik. Bütün savunma sistemleri hazır olsun.': 'Threat level critical. All defense systems stand by.',
    'Ağır hedef sinyali bekleniyor. Pozisyonunu koru.': 'Heavy target signal expected. Hold your position.',
    'Birden fazla temas algılandı. Alan kontrolünü hazırla.': 'Multiple contacts detected. Prepare area control.',
    'Temas bekleniyor.': 'Awaiting contact.',
    'DALGA ': 'WAVE ',
    'Dalga ': 'Wave ',
    ' dalga ': ' wave ',
    'Altın:': 'Gold:',
    'Kristal:': 'Crystals:',
    'Ruh Taşı': 'Soul Stones',
    'Seviye:': 'Level:',
    'Hasar:': 'Damage:',
    'Can:': 'Health:',
    'Kalkan:': 'Shield:',
    'Zırh:': 'Armor:',
    'Menzil:': 'Range:',
    'İstatistikler': 'Statistics',
    'Başarımlar': 'Achievements'
};

function localizeGameMessage(message) {
    if (getGameLanguage() !== 'en' || typeof message !== 'string') return message;
    if (GAME_TRANSLATIONS[message]) return GAME_TRANSLATIONS[message];
    if (GAME_CONTENT_TRANSLATIONS[message]) return GAME_CONTENT_TRANSLATIONS[message];
    let result = message;
    for (const [from, to] of Object.entries(GAME_CONTENT_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length)) {
        if (from && result.includes(from)) result = result.split(from).join(to);
    }
    for (const [from, to] of Object.entries(GAME_DYNAMIC_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length)) {
        if (from && result.includes(from)) result = result.split(from).join(to);
    }
    return result.replace(/\\bSv\\./g, 'Lv.').replace(/\\bMaks\\b/g, 'Max');
}

function setGameLanguage(language) {
    const selected = language === 'en' ? 'en' : 'tr';
    try { localStorage.setItem('towerDefenseLanguage', selected); } catch (_) {}
    applyGameLanguage(selected);
    if (typeof buildInventoryUI === 'function') buildInventoryUI();
    if (typeof buildUpgradesUI === 'function') buildUpgradesUI();
    if (typeof buildCompanionsUI === 'function') buildCompanionsUI();
    if (typeof buildPrestigeUI === 'function') buildPrestigeUI();
    if (typeof openThemeModal === 'function' && !document.getElementById('theme-modal')?.classList.contains('hidden')) openThemeModal();
}

document.addEventListener('DOMContentLoaded', () => {
    let savedLanguage = 'tr';
    try { savedLanguage = localStorage.getItem('towerDefenseLanguage') || 'tr'; } catch (_) {}
    applyGameLanguage(savedLanguage);
});
