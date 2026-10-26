// ==========================================
// BÖLÜM: ARAYÜZ (UI), MENÜLER VE MOBİL HUD DÜZENİ
// ==========================================


/* V2.7: original synthesized sci-fi SFX. Audio is cosmetic and never changes gameplay. */
let battleSfxEnabled = true;
let battleAudioUnlocked = false;
let battleAudioContext = null;
let battleMasterGain = null;
let battleCompressor = null;
let battleNoiseBuffer = null;
let battleCueLastAt = Object.create(null);
let battleMomentHideTimer = null;
let battleMomentBossTimer = null;
let battleMomentClearTimer = null;
let battleIntroWaveShown = null;

function unlockBattleAudio() {
    battleAudioUnlocked = true;
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return;
    if (battleAudioContext) {
        if (battleAudioContext.state === 'suspended') battleAudioContext.resume().catch(() => {});
        return;
    }
    try {
        battleAudioContext = new AudioClass();
        battleMasterGain = battleAudioContext.createGain();
        battleMasterGain.gain.value = 0.62;
        battleCompressor = battleAudioContext.createDynamicsCompressor();
        battleCompressor.threshold.value = -18;
        battleCompressor.knee.value = 16;
        battleCompressor.ratio.value = 4;
        battleCompressor.attack.value = 0.004;
        battleCompressor.release.value = 0.18;
        battleMasterGain.connect(battleCompressor);
        battleCompressor.connect(battleAudioContext.destination);
        battleNoiseBuffer = battleAudioContext.createBuffer(1, Math.floor(battleAudioContext.sampleRate * 0.45), battleAudioContext.sampleRate);
        const samples = battleNoiseBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length * 0.35);
        if (battleAudioContext.state === 'suspended') battleAudioContext.resume().catch(() => {});
    } catch (error) {
        battleAudioContext = null;
        battleMasterGain = null;
        battleCompressor = null;
        battleNoiseBuffer = null;
    }
}
document.addEventListener('pointerdown', unlockBattleAudio, { once: true, passive: true });

function playBattleNoise(at, duration, peak, frequency) {
    const audio = battleAudioContext;
    if (!audio || !battleMasterGain || !battleNoiseBuffer) return;
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = battleNoiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency, at);
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + Math.min(0.012, duration * 0.22));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(battleMasterGain);
    source.start(at);
    source.stop(at + duration + 0.015);
    source.onended = () => { try { source.disconnect(); filter.disconnect(); gain.disconnect(); } catch (error) {} };
}

function playBattleCue(kind) {
    if (!battleSfxEnabled || !battleAudioUnlocked || !battleAudioContext || !battleMasterGain) return;
    const audio = battleAudioContext;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const now = audio.currentTime;
    const cooldowns = { shot: 0.075, impact: 0.055, critical: 0.085, ui: 0.035, towerHit: 0.18 };
    const cooldown = cooldowns[kind] || 0;
    if (cooldown && now - (battleCueLastAt[kind] || -Infinity) < cooldown) return;
    battleCueLastAt[kind] = now;
    const patterns = {
        wave: [{ f: 392, t: 'sine', d: .14, at: 0, v: .035 }, { f: 587.33, t: 'triangle', d: .23, at: .085, v: .03 }, { f: 783.99, t: 'sine', d: .28, at: .17, v: .018 }],
        critical: [{ f: 196, t: 'square', d: .16, at: 0, v: .018 }, { f: 293.66, t: 'triangle', d: .19, at: .13, v: .032 }, { f: 440, t: 'sine', d: .24, at: .31, v: .028 }],
        reward: [{ f: 659.25, t: 'sine', d: .13, at: 0, v: .025 }, { f: 880, t: 'triangle', d: .16, at: .12, v: .029 }, { f: 1174.66, t: 'sine', d: .25, at: .25, v: .024 }],
        clear: [{ f: 523.25, t: 'triangle', d: .16, at: 0, v: .032 }, { f: 659.25, t: 'sine', d: .18, at: .1, v: .032 }, { f: 783.99, t: 'sine', d: .28, at: .2, v: .027 }],
        boss: [{ f: 92.5, t: 'sawtooth', d: .42, at: 0, v: .034 }, { f: 138.59, t: 'triangle', d: .36, at: .16, v: .03 }, { f: 207.65, t: 'sine', d: .26, at: .32, v: .023 }],
        bossKill: [{ f: 392, t: 'triangle', d: .14, at: 0, v: .032 }, { f: 523.25, t: 'sine', d: .18, at: .1, v: .034 }, { f: 783.99, t: 'triangle', d: .32, at: .2, v: .03 }, { f: 1046.5, t: 'sine', d: .25, at: .32, v: .02 }],
        shot: [{ f: 760, t: 'triangle', d: .045, at: 0, v: .012 }, { f: 310, t: 'sine', d: .065, at: .008, v: .009 }],
        impact: [{ f: 175, t: 'triangle', d: .075, at: 0, v: .013 }, { f: 92, t: 'sine', d: .085, at: .012, v: .008 }],
        towerHit: [{ f: 110, t: 'sawtooth', d: .19, at: 0, v: .025 }, { f: 73.4, t: 'sine', d: .22, at: .035, v: .027 }],
        upgrade: [{ f: 440, t: 'sine', d: .12, at: 0, v: .026 }, { f: 659.25, t: 'triangle', d: .15, at: .075, v: .028 }, { f: 880, t: 'sine', d: .2, at: .15, v: .024 }],
        ui: [{ f: 620, t: 'sine', d: .035, at: 0, v: .007 }],
        lootbox: [{ f: 330, t: 'triangle', d: .12, at: 0, v: .022 }, { f: 494, t: 'sine', d: .13, at: .08, v: .024 }, { f: 740, t: 'triangle', d: .19, at: .17, v: .027 }, { f: 988, t: 'sine', d: .23, at: .26, v: .02 }]
    };
    const notes = patterns[kind];
    if (!notes) return;
    try {
        notes.forEach(note => {
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            const start = now + note.at;
            const finish = start + note.d;
            osc.type = note.t;
            osc.frequency.setValueAtTime(note.f, start);
            if (kind === 'boss') osc.frequency.exponentialRampToValueAtTime(Math.max(35, note.f * .72), finish);
            if (kind === 'shot') osc.frequency.exponentialRampToValueAtTime(Math.max(80, note.f * .58), finish);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(note.v, start + Math.min(.018, note.d * .28));
            gain.gain.exponentialRampToValueAtTime(0.0001, finish);
            osc.connect(gain);
            gain.connect(battleMasterGain);
            osc.start(start);
            osc.stop(finish + .02);
            osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (error) {} };
        });
        if (kind === 'shot') playBattleNoise(now, .055, .006, 2800);
        else if (kind === 'impact') playBattleNoise(now, .085, .012, 1250);
        else if (kind === 'towerHit') playBattleNoise(now, .19, .022, 520);
        else if (kind === 'boss') playBattleNoise(now, .34, .018, 260);
        else if (kind === 'bossKill') playBattleNoise(now, .18, .009, 1800);
        else if (kind === 'lootbox') playBattleNoise(now + .12, .16, .006, 3200);
    } catch (error) {
        // Sound is optional; browser audio limitations must never interrupt gameplay.
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
    if (typeof window.pikoReactEvent === 'function') {
        const upgradeName = typeof localizeGameContent === 'function' ? localizeGameContent(def.name) : def.name;
        window.pikoReactEvent('upgrade', { key, name: upgradeName });
    }
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
    if (typeof window.pikoReactEvent === 'function') {
        const bestRarity = droppedEntries.reduce((best, entry) => {
            const rank = { rare: 0, super_rare: 1, epic: 2, mythic: 3, legendary: 4 };
            return (rank[entry.data?.rarity] || 0) > (rank[best] || 0) ? entry.data?.rarity : best;
        }, 'rare');
        window.pikoReactEvent('lootbox', { kind: 'item', count, rarity: bestRarity });
    }
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
    if (typeof window.pikoReactEvent === 'function') {
        const bestRarity = droppedEntries.reduce((best, entry) => {
            const rank = { rare: 0, super_rare: 1, epic: 2, mythic: 3, legendary: 4 };
            return (rank[entry.data?.rarity] || 0) > (rank[best] || 0) ? entry.data?.rarity : best;
        }, 'rare');
        window.pikoReactEvent('lootbox', { kind: 'tower-skin', count, rarity: bestRarity });
    }
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
    if (typeof window.pikoReactEvent === 'function') {
        const bestRarity = droppedEntries.reduce((best, entry) => {
            const rank = { rare: 0, super_rare: 1, epic: 2, mythic: 3, legendary: 4 };
            return (rank[entry.data?.rarity] || 0) > (rank[best] || 0) ? entry.data?.rarity : best;
        }, 'rare');
        window.pikoReactEvent('lootbox', { kind: 'companion-skin', count, rarity: bestRarity });
    }
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
    if (tab === 'leaderboard') { refreshLeaderboard(false); renderFriends(); }
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
    // Story missions run on a temporary in-memory state; never persist it over the Endless Mode save.
    if (document.body?.dataset?.gameMode === 'story') return false;
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
                    clearTimeout(storyCloudSaveTimer);
                    updateAccountHeaderUI();
                    await forceCloudPull(true);
                    await pullStoryProgressFromCloud(true);
                    await pushScoreToLeaderboard();
                    await renderFriends();
                } else {
                    currentUser = null;
                    updateAccountHeaderUI();
                    renderFriends();
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
            await fbDb.collection('storyProgress').doc(uid).delete();
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
    localStorage.removeItem(STORY_PROGRESS_KEY);
    localStorage.removeItem(STORY_PROGRESS_OWNER_KEY);
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
        { id: 'items10', icon: '💎', name: 'Emanetçi', desc: '10 farklı eşya biriktir', value: items, target: 10, done: items >= 10 },
        { id: 'wave150', icon: '🌌', name: 'Boşluğun Sınırında', desc: '150. dalgaya ulaş', value: highestWave, target: 150, done: highestWave >= 150 },
        { id: 'wave250', icon: '🪐', name: 'Yıldızlararası Efsane', desc: '250. dalgaya ulaş', value: highestWave, target: 250, done: highestWave >= 250 },
        { id: 'kills10000', icon: '☄️', name: 'Sonsuz Temizlik', desc: '10.000 düşman imha et', value: kills, target: 10000, done: kills >= 10000 },
        { id: 'boss50', icon: '👁️', name: 'Bossların Kâbusu', desc: '50 boss yen', value: bosses, target: 50, done: bosses >= 50 },
        { id: 'prestige10', icon: '♾️', name: 'Döngü Ustası', desc: '10 prestij yap', value: prestiges, target: 10, done: prestiges >= 10 },
        { id: 'play24h', icon: '🕰️', name: 'Nöbeti Bırakmayan', desc: 'Toplam 24 saat oyna', value: seconds, target: 86400, done: seconds >= 86400, format: v => (v / 3600).toFixed(1) + ' sa' },
        { id: 'skins20', icon: '🌈', name: 'Hangar Küratörü', desc: '20 kule görünümü topla', value: skins, target: 20, done: skins >= 20 },
        { id: 'companions5', icon: '🚀', name: 'Yoldaş Filosu', desc: '5 yoldaşın kilidini aç', value: unlockedCompanions, target: 5, done: unlockedCompanions >= 5 },
        { id: 'items25', icon: '🏺', name: 'Kayıp Emanetler', desc: '25 farklı eşya biriktir', value: items, target: 25, done: items >= 25 }
    ];
}

const COMMANDER_TITLES = [
    { id: 'rookie', name: 'Yeni Komutan', en: 'Rookie Commander', icon: '⚔️', unlock: () => true },
    { id: 'wavebreaker', name: 'Dalga Kıran', en: 'Wavebreaker', icon: '🌊', unlock: () => Math.max(Number(game?.highestWave) || 1, Number(game?.wave) || 1) >= 50 },
    { id: 'bossbane', name: 'Bossların Kâbusu', en: 'Bane of Bosses', icon: '🐉', unlock: () => (Number(game?.stats?.bossKills) || 0) >= 50 },
    { id: 'voidveteran', name: 'Boşluk Gazisi', en: 'Void Veteran', icon: '🌌', unlock: () => Math.max(Number(game?.highestWave) || 1, Number(game?.wave) || 1) >= 150 },
    { id: 'loopmaster', name: 'Döngü Ustası', en: 'Loop Master', icon: '♾️', unlock: () => (Number(game?.stats?.prestiges) || 0) >= 10 },
    { id: 'starlegend', name: 'Yıldızlararası Efsane', en: 'Interstellar Legend', icon: '🪐', unlock: () => Math.max(Number(game?.highestWave) || 1, Number(game?.wave) || 1) >= 250 },
    { id: 'collector', name: 'Hangar Küratörü', en: 'Hangar Curator', icon: '🌈', unlock: () => (Array.isArray(game?.ownedSkins) ? new Set(game.ownedSkins).size : 1) >= 20 },
    { id: 'nightwatch', name: 'Son Nöbetçi', en: 'The Last Watch', icon: '🕰️', unlock: () => (Number(game?.stats?.playTimeSeconds) || 0) >= 86400 }
];
function setCommanderTitle(titleId) {
    const title = COMMANDER_TITLES.find(t => t.id === titleId && t.unlock());
    if (!title) { showToast(getGameLanguage() === 'en' ? 'This title is still locked.' : 'Bu unvan henüz kilitli.'); renderAchievementsModal(); return; }
    if (!game.settings) game.settings = {};
    game.settings.commanderTitle = title.id;
    if (typeof saveGame === 'function') saveGame(true);
    renderAchievementsModal();
    showToast(getGameLanguage() === 'en' ? 'Title equipped: ' + title.en : 'Unvan kuşanıldı: ' + title.name);
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
    if (progressEl) progressEl.textContent = getGameLanguage() === 'en' ? `${unlocked} / ${achievements.length} completed` : `${unlocked} / ${achievements.length} tamamlandı`;
    const badgeEl = document.getElementById('profile-badge');
    if (badgeEl) {
        badgeEl.className = `inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${badge.className}`;
        badgeEl.innerHTML = `<span class="text-xl">${badge.icon}</span><span>${badge.name}</span>`;
    }
    const titleSelect = document.getElementById('commander-title-select');
    const titleHint = document.getElementById('commander-title-hint');
    const unlockedTitles = COMMANDER_TITLES.filter(t => t.unlock());
    const currentTitle = unlockedTitles.find(t => t.id === game?.settings?.commanderTitle) || COMMANDER_TITLES[0];
    if (titleSelect) {
        titleSelect.innerHTML = COMMANDER_TITLES.map(t => {
            const available = t.unlock();
            const label = getGameLanguage() === 'en' ? t.en : t.name;
            return '<option value="' + t.id + '" ' + (available ? '' : 'disabled ') + (t.id === currentTitle.id ? 'selected' : '') + '>' + t.icon + ' ' + label + (available ? '' : (getGameLanguage() === 'en' ? ' · LOCKED' : ' · KİLİTLİ')) + '</option>';
        }).join('');
        titleSelect.value = currentTitle.id;
    }
    if (titleHint) titleHint.textContent = getGameLanguage() === 'en' ? unlockedTitles.length + ' / ' + COMMANDER_TITLES.length + ' titles unlocked.' : unlockedTitles.length + ' / ' + COMMANDER_TITLES.length + ' unvan açık.';
    const equippedTitleEl = document.getElementById('profile-title-equipped');
    if (equippedTitleEl) equippedTitleEl.textContent = currentTitle.icon + ' ' + (getGameLanguage() === 'en' ? currentTitle.en : currentTitle.name) + (getGameLanguage() === 'en' ? ' · EQUIPPED' : ' · KUŞANILDI');
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


const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
let friendSystemBusy = false;

function friendEsc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function friendSystemReady() {
    return !!(isFirebaseReady && fbDb && currentUser && currentUser.isCloud && currentUser.uid);
}
function renderFriendNotice(message, isError = false) {
    const el = document.getElementById('friends-notice');
    if (!el) return;
    el.textContent = message || '';
    el.className = 'text-xs rounded-lg px-2.5 py-2 ' + (isError ? 'bg-rose-950/50 text-rose-200 border border-rose-500/30' : 'bg-sky-950/40 text-sky-200 border border-sky-500/20');
    if (!message) el.classList.add('hidden'); else el.classList.remove('hidden');
}
async function sendFriendRequest() {
    if (friendSystemBusy) return;
    if (!friendSystemReady()) { renderFriendNotice('Arkadaş eklemek için Firebase hesabınla giriş yapmalısın.', true); return; }
    const input = document.getElementById('friends-add-username');
    const wanted = normalizeUsernameKey(input ? input.value : '');
    const mine = normalizeUsernameKey(currentUser.username);
    if (wanted.length < 3 || wanted.length > 18) { renderFriendNotice('Kullanıcı adı 3–18 karakter olmalı.', true); return; }
    if (wanted === mine) { renderFriendNotice('Kendini arkadaş ekleyemezsin 😄', true); return; }
    friendSystemBusy = true;
    const btn = document.getElementById('friends-add-button');
    if (btn) { btn.disabled = true; btn.textContent = 'Gönderiliyor…'; }
    try {
        const targetRef = fbDb.collection('usernameRegistry').doc(wanted);
        const requestId = currentUser.uid + '_' + wanted;
        const requestRef = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc(requestId);
        const reverseRef = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc('username_' + wanted + '_to_' + mine);
        const targetSnap = await targetRef.get();
        if (!targetSnap.exists) throw new Error('Bu kullanıcı adı bulunamadı. Arkadaşının hesabıyla en az bir kez giriş yapmış olması gerekiyor.');
        const target = targetSnap.data();
        if (!target.uid || target.uid === currentUser.uid) throw new Error('Bu kullanıcıyı ekleyemezsin.');
        const fromKey = normalizeUsernameKey(currentUser.username);
        const senderRegistry = await fbDb.collection('usernameRegistry').doc(fromKey).get();
        if (!senderRegistry.exists || senderRegistry.data().uid !== currentUser.uid) throw new Error('Kullanıcı adı doğrulanamadı. Yeniden giriş yapmayı dene.');
        const outgoingId = currentUser.uid + '_' + target.uid;
        const incomingId = target.uid + '_' + currentUser.uid;
        const outgoingRef = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc(outgoingId);
        const incomingRef = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc(incomingId);
        await fbDb.runTransaction(async tx => {
            const [existing, reverse] = await Promise.all([tx.get(outgoingRef), tx.get(incomingRef)]);
            if (existing.exists) {
                const status = existing.data().status;
                if (status === 'accepted') throw new Error('Zaten arkadaşsınız.');
                if (status === 'pending') throw new Error('Bu kişiye zaten istek gönderdin.');
                if (status === 'rejected') {
                    tx.update(outgoingRef, {
                        status: 'pending',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return;
                }
            }
            if (reverse.exists && reverse.data().status === 'accepted') throw new Error('Zaten arkadaşsınız.');
            if (reverse.exists && reverse.data().status === 'pending') throw new Error('Bu kişi sana zaten istek göndermiş. Gelen isteklerden kabul edebilirsin.');
            tx.set(outgoingRef, {
                fromUid: currentUser.uid, toUid: target.uid,
                fromUsername: fromKey, toUsername: wanted,
                status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        if (input) input.value = '';
        renderFriendNotice('İstek gönderildi! ' + target.username + ' kabul edince arkadaş listenizde görünecek.');
        await renderFriends();
    } catch (err) {
        renderFriendNotice(err && err.message ? err.message : 'İstek gönderilemedi. Bağlantını ve Firestore kurallarını kontrol et.', true);
    } finally {
        friendSystemBusy = false;
        if (btn) { btn.disabled = false; btn.textContent = 'İstek Gönder'; }
    }
}
async function respondToFriendRequest(requestId, accept) {
    if (!friendSystemReady()) { renderFriendNotice('Arkadaş sistemi için bulut hesabıyla giriş yap.', true); return; }
    try {
        const ref = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc(requestId);
        await fbDb.runTransaction(async tx => {
            const snap = await tx.get(ref);
            if (!snap.exists) throw new Error('İstek artık mevcut değil.');
            const data = snap.data();
            if (data.toUid !== currentUser.uid || data.status !== 'pending') throw new Error('Bu isteğe yanıt verme yetkin yok.');
            tx.update(ref, { status: accept ? 'accepted' : 'rejected', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
        renderFriendNotice(accept ? 'Arkadaşlık kuruldu! 🎉' : 'İstek reddedildi.');
        await renderFriends();
    } catch (err) {
        renderFriendNotice(err && err.message ? err.message : 'İstek güncellenemedi.', true);
    }
}
async function removeFriend(requestId) {
    if (!friendSystemReady()) return;
    try {
        const ref = fbDb.collection(FRIEND_REQUESTS_COLLECTION).doc(requestId);
        const snap = await ref.get();
        if (!snap.exists) return renderFriends();
        const d = snap.data();
        if (d.fromUid !== currentUser.uid && d.toUid !== currentUser.uid) throw new Error('Bu kaydı yönetme yetkin yok.');
        if (d.status === 'pending' && d.fromUid !== currentUser.uid) throw new Error('Gelen isteği buradan iptal edemezsin; kabul veya reddet.');
        if (!['accepted','pending'].includes(d.status)) throw new Error('Bu kayıt artık aktif değil.');
        await ref.delete();
        renderFriendNotice(d.status === 'pending' ? 'Arkadaşlık isteği iptal edildi.' : 'Arkadaş listenden kaldırıldı.');
        await renderFriends();
    } catch (err) {
        renderFriendNotice(err && err.message ? err.message : 'Arkadaş kaldırılamadı.', true);
    }
}
async function renderFriends() {
    const list = document.getElementById('friends-list');
    const incomingEl = document.getElementById('friends-incoming');
    const outgoingEl = document.getElementById('friends-outgoing');
    const countEl = document.getElementById('friends-count');
    if (!list || !incomingEl || !outgoingEl) return;
    if (!friendSystemReady()) {
        list.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">Arkadaşlarını görmek ve istek göndermek için bulut hesabınla giriş yap.</div>';
        incomingEl.innerHTML = '<div class="text-xs text-slate-500">Giriş yapınca isteklerin burada görünür.</div>';
        outgoingEl.innerHTML = '<div class="text-xs text-slate-500">Gönderdiğin istekler burada görünür.</div>';
        if (countEl) countEl.textContent = 'Hesap gerekli';
        return;
    }
    list.innerHTML = '<div class="text-xs text-slate-400 py-3 text-center">Arkadaşlar yükleniyor…</div>';
    try {
        const col = fbDb.collection(FRIEND_REQUESTS_COLLECTION);
        const [incomingSnap, outgoingSnap] = await Promise.all([
            col.where('toUid', '==', currentUser.uid).get(),
            col.where('fromUid', '==', currentUser.uid).get()
        ]);
        const incoming = [], outgoing = [], friends = [];
        incomingSnap.forEach(doc => { const d = doc.data(); d._id = doc.id; if (d.status === 'pending') incoming.push(d); else if (d.status === 'accepted') friends.push(d); });
        outgoingSnap.forEach(doc => { const d = doc.data(); d._id = doc.id; if (d.status === 'pending') outgoing.push(d); else if (d.status === 'accepted') friends.push(d); });
        const byUid = new Map();
        friends.forEach(d => { const otherUid = d.fromUid === currentUser.uid ? d.toUid : d.fromUid; const otherName = d.fromUid === currentUser.uid ? d.toUsername : d.fromUsername; byUid.set(otherUid, {uid:otherUid, username:otherName, requestId:d._id}); });
        if (countEl) countEl.textContent = byUid.size + ' arkadaş';
        list.innerHTML = byUid.size ? Array.from(byUid.values()).sort((a,b)=>a.username.localeCompare(b.username)).map(f =>
            '<div class="flex items-center gap-2 rounded-xl bg-slate-950/70 border border-sky-500/20 p-2.5">' +
            '<div class="w-9 h-9 shrink-0 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300"><i class="fa-solid fa-user-astronaut"></i></div>' +
            '<div class="min-w-0 flex-1"><div class="text-sm font-bold text-white truncate">'+friendEsc(f.username)+'</div><div class="text-[10px] text-slate-400">Arkadaşın · Komutan</div></div>' +
            '<button onclick="removeFriend(\''+friendEsc(f.requestId)+'\')" class="shrink-0 rounded-lg border border-rose-500/20 px-2 py-1.5 text-[10px] text-rose-300 hover:bg-rose-950/40">Kaldır</button></div>'
        ).join('') : '<div class="text-xs text-slate-400 text-center py-4">Henüz arkadaşın yok. Yukarıdan kullanıcı adıyla istek gönder!</div>';
        incomingEl.innerHTML = incoming.length ? incoming.map(d =>
            '<div class="flex items-center gap-2 rounded-lg bg-slate-950/70 p-2"><div class="min-w-0 flex-1"><div class="text-xs font-bold text-white">'+friendEsc(d.fromUsername)+'</div><div class="text-[10px] text-slate-500">Sana arkadaşlık isteği gönderdi</div></div><button onclick="respondToFriendRequest(\''+friendEsc(d._id)+'\',true)" class="rounded-lg bg-emerald-600 px-2 py-1.5 text-[10px] font-bold text-white">Kabul</button><button onclick="respondToFriendRequest(\''+friendEsc(d._id)+'\',false)" class="rounded-lg bg-slate-800 px-2 py-1.5 text-[10px] text-slate-300">Reddet</button></div>'
        ).join('') : '<div class="text-xs text-slate-500">Bekleyen gelen istek yok.</div>';
        outgoingEl.innerHTML = outgoing.length ? outgoing.map(d =>
            '<div class="flex items-center gap-2 rounded-lg bg-slate-950/70 p-2"><div class="min-w-0 flex-1"><div class="text-xs font-bold text-white">'+friendEsc(d.toUsername)+'</div><div class="text-[10px] text-amber-300">Yanıt bekleniyor…</div></div><button onclick="removeFriend(\''+friendEsc(d._id)+'\')" class="rounded-lg bg-slate-800 px-2 py-1.5 text-[10px] text-slate-300">İptal</button></div>'
        ).join('') : '<div class="text-xs text-slate-500">Bekleyen gönderilmiş istek yok.</div>';
    } catch (err) {
        list.innerHTML = '<div class="text-xs text-rose-300 text-center py-3">Arkadaş listesi yüklenemedi. Firestore kuralları güncel mi?</div>';
        incomingEl.innerHTML = '';
        outgoingEl.innerHTML = '';
        if (countEl) countEl.textContent = 'Bağlantı hatası';
        console.error('[Friends] load failed:', err);
    }
}

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
    let ambientTimer = null;
    let lastLine = '';
    let ambientCount = 0;
    const MAX_AMBIENT_LINES = 5;

    // The mascot's identity never changes. Tower skins only influence its commentary.
    const personality = {
        tr: {
            idle: [
                'Komutan, ben burada dekor değilim. Yani… sadece dekor değilim.',
                'Planın hazır mı? Benimki hazır: hayatta kal, yükselt, tekrarla.',
                'Bir kule savunma oyunu oynuyoruz ama asıl savunmam sabrına karşı.',
                'Bazen en iyi taktik, paniklememektir. Bazen de hasarı artırmaktır.',
                'Ben küçük bir UFO’yum. Büyük beklentilerim var.',
                'Bir gün beni de yükseltme menüsüne koyarlar mı? Sadece soruyorum.',
                'Düşmanlar geliyor. Ben de moral desteği veriyorum. İş bölümü.',
                'Şu an sessizim çünkü stratejik düşünüyorum. Ya da yükleniyorum.'
            ],
            upgrade: [
                'Altın birikiyorsa onu sahaya geri yatırma zamanı olabilir.',
                'Bir yükseltmeye göz at, komutan. Düşmanlar da boş durmuyor.',
                'Kule güçlü, ama biraz daha güçlenmesine kim itiraz eder?',
                'Yükseltme menüsünde güzel şeyler var. Ben olsam bakardım.'
            ],
            danger: [
                'Komutan, kule biraz hırpalanmış. Savunmayı güçlendirmeyi düşün!',
                'Can göstergesi pek keyifli görünmüyor. Önce hayatta kalalım.',
                'Alarmı çalmıyorum ama… tamam, biraz çalıyorum. Kuleyi koru!'
            ],
            wave: [
                'Yeni dalga, yeni sorunlar. Neyse ki sorun çözme konusunda havalıyız.',
                'Dalga geliyor. Omuzlarını gevşet, hedefini seç, devam et.',
                'Düşmanlar yine randevusuz geldi. Ne görgüsüzlük.'
            ],
            en: [
                'Commander, I am not just decoration. Okay, not ONLY decoration.',
                'The plan is simple: survive, upgrade, repeat. Very scientific.',
                'I am a tiny UFO with enormous expectations.',
                'Enemies incoming. I provide moral support. Teamwork!',
                'I am thinking strategically. Or buffering. Hard to tell.',
                'A tower defense game, and somehow I am defending your patience.'
            ],
            skin: {
                default_cyber: ['Siber çekirdek kararlı. Ben de… çoğunlukla. ⚡', 'Temiz plazma, temiz plan. Beğendim.'],
                kurt_kaan: ['Kurt Kaan ile sürü gibi güçlüyüz! 🐺', 'Bir uluma duysam da düşmanlar kaçsa.'],
                dgdvrn: ['Altın kaplama mı? Komutan, zevkin pahalı. 👑', 'Bu kadar parıltıyla düşman bizi görmeden yenilecek. Umarım.'],
                black_hole: ['O kara deliğe fazla yaklaşmayalım. Benim kaybolacak çok güzel bir geleceğim var. 🕳️', 'Uzay-zaman bükülüyor. Ben gayet sakinim. Dışarıdan öyle görünüyor mu?'],
                nane_tower: ['Nane ferahlığı, savaş öncesi lazım olan şey. 🌿', 'Buz gibi strateji. Kelimenin tam anlamıyla.'],
                sunkas_tower: ['Güneş kadar parlak! Güneş gözlüğüm nerede? ☀️', 'Bu kuleyle gölgemiz bile kritik hasar veriyor.'],
                ates_tower: ['Sıcaklık yükseliyor. Ben biraz geride durayım. 🔥', 'Alevler şahane ama kaşlarımı seviyorum.'],
                teyzir_tower: ['Yüksek voltaj, yüksek moral! ⚡', 'Elektrikleniyorum… mecazen. Umarım.'],
                bubblegum: ['Balonlar tatlı, patlamaları daha da tatlı! 🫧', 'Sakız gibi yapışkan savunma. Ayakkabıya basmayalım yeter.'],
                cyber_samurai: ['Keskin ve disiplinli. Saygı duydum. 🥷', 'Bu kuleyle sessizce kazanacağız. Ben konuşmam zaten. Çok konuşmam.'],
                snowman: ['Bana da bir atkı ayırın! ⛄', 'Düşmanlar erimeden önce donsun. Mantıklı.'],
                star_cruiser: ['Rotamız zafer, kaptan! 🚀', 'Yıldızlara doğru… ama önce şu dalga.'],
                dragon: ['Ejderha bizim tarafta, içim rahat. 🐉', 'Ateş püskürtme izni bende değil, değil mi?'],
                fighter_jet: ['Kalkış izni verildi! ✈️', 'Hız, irtifa, savunma. Kahvemi de alayım mı?'],
                lion: ['Ormanın kralı yanımızda. Kükreme kısmını sana bırakıyorum. 🦁', 'Bu savunma aslan gibi. Kedi gibi değil.'],
                tiger: ['Sessiz, çevik ve tehlikeli. 🐯', 'Pençeler hazırsa ben de hazırım.'],
                sofa: ['Kraliyet koltuğu mu? Savunma VIP oldu! 🛋️', 'Komutan, savaş sonrası oturacak yerimiz hazır. Ben zaten havada oturuyorum.'],
                robot: ['Meka protokolü çevrimiçi. 🤖', 'Çelik dost iyi görünüyor. Mavi ekran vermesin yeter.'],
                fire_demon: ['Ateş iblisi bile benden sakin görünüyor. 👹', 'Düşmanlara sıcak bir karşılama. Fazla sıcak.'],
                car: ['Vınnn! Bu savunma tam gaz! 🚗', 'Virajı al, dalgayı geç. Emniyet kemeri nerede?'],
                monkey: ['Muz molası mı? Önce düşmanları halledelim. 🐵', 'Planı anlamadım ama maymun enerjisine güveniyorum.'],
                tree: ['Kökler sağlam, savunma sağlam. 🌳', 'Biraz doğa, biraz strateji. Fotosentez de yükseltme sayılır mı?'],
                sleep_emoji: ['Uyan komutan, kule uyumuyor! 😴', 'Şşşt… düşmanları uyandırmadan yenelim.'],
                alien: ['Dünya savunması için geldim. 👽', 'Bunlar kesin dünya dışı düşmanlar değil mi? Çok klişe.'],
                bird: ['Kanatlar hazır, gökyüzü bizim! 🐦', 'Yukarıdan her şeyi görüyorum. Evet, o atıştırmalığı da.'],
                water_bottle: ['Bir yudum su, bir dalga daha. 🧴', 'Su içmeyi unutma komutan. Benim hidrasyonum yok, kıskanıyorum.'],
                chair: ['RGB ışıkları aç, mücadele başlıyor! 🪑', 'Oyuncu koltuğu taktik avantaj sayılır mı? Bilim bunu araştırmalı.'],
                table: ['Harita önümde, strateji hazır. 🪵', 'Taktik masa kuruldu. Planımız sağlam. Umarım.'],
                pizza: ['Zaferden sonra pizza benden! 🍕', 'Peynir uzuyor, düşmanlar kaçıyor. Güzel fizik.'],
                toilet: ['Bu skin hakkında sorularım var… 🚽', 'Komutan, mizah anlayışına saygı duyuyorum. Biraz endişeliyim de.']
            }
        }
    };

    function getTowerSkin() {
        const id = (typeof game !== 'undefined' && game && game.activeSkin) || 'default_cyber';
        const db = typeof SKIN_DATABASE !== 'undefined' ? SKIN_DATABASE : {};
        return { id, def: db[id] || db.default_cyber || { name: 'Plazma Kulesi', emoji: '⚡' } };
    }
    function isEnglish() {
        try { return localStorage.getItem('towerDefenseLanguage') === 'en'; } catch (_) { return false; }
    }
    function chooseLine(lines) {
        if (!Array.isArray(lines) || !lines.length) return 'Hazırım, komutan!';
        const options = lines.filter(line => line !== lastLine);
        const line = (options.length ? options : lines)[Math.floor(Math.random() * (options.length ? options : lines).length)];
        lastLine = line;
        return line;
    }
    function syncMascot() {
        const skin = getTowerSkin();
        // Keep the original astral-mechanical SVG identity; tower skins only affect dialogue.
        mascot.setAttribute('aria-label', isEnglish() ? 'Piko, the tactical mascot — tap to chat' : 'Piko, taktik maskot — konuşmak için dokun');
        mascot.title = isEnglish() ? 'Piko · Tactical mascot · ' + skin.def.name : 'Piko · Taktik maskot · ' + skin.def.name;
        return skin;
    }
    const pikoThoughts = {
        tr: {
            lowGold: ['Altın hesabını yaptım. Sonuç: biraz daha altın lazım. Matematik bazen çok acımasız.', 'Şu an her altını harcamak zorunda değilsin. İyi bir yükseltme için biriktirmek de strateji.', 'Cüzdan sessiz, düşmanlar gürültülü. Öncelikleri biliyoruz.'],
            healthy: ['Canımız yerinde. Bu, dikkatsiz davranmak için izin belgesi değil.', 'Şimdilik iyiyiz. “Şimdilik” kelimesini özellikle vurguluyorum.', 'Savunma ayakta, ben de havadayım. Herkes görevinde.'],
            busy: ['Ekranda çok hareket var. Ben hepsini takip ediyorum. Tamamını değil ama önemli kısmını.', 'Şu an plan yapıyorum. Planın yarısı hedef, diğer yarısı panik yapmamak.', 'Bir düşman, bir mermi, bir karar… Benim işlemcim bile heyecanlandı.'],
            calm: ['Bir saniye durup durumu okumak bazen daha iyi hamledir. Acele etmekle hızlı olmak aynı şey değil.', 'Bir sonraki yükseltmeyi seçerken sadece fiyatına değil, neyi çözdüğüne de bak.', 'Strateji dediğin, her şeyi almak değil; şu anda en çok işine yarayanı seçmek.'],
            upgrade: ['İyi yatırım, komutan. Ben olsam bunu rapora “çok havalı karar” diye yazardım.', 'Yükseltme tamam. Güç arttı; şimdi bunun dalgalarda karşılığını görelim.', 'Harika, kaynakları bir amaca çevirdik. Ekonomi dersi bitti, savaş devam.', 'Not aldım: bu yükseltmeyi seçtin. Benim hafızam var, merak etme. Çoğu zaman.'],
            attack: ['Hasar yükseldi. Düşmanların müşteri memnuniyeti düşebilir.', 'Daha sert vuruyoruz. Diplomasi seçeneğini zaten tüketmiştik.', 'Saldırı gücü arttı. Şimdi isabetli kararlar da gelsin.'],
            defense: ['Savunmayı güçlendirmek gösterişsiz ama çok akıllıca. Hayatta kalmak hâlâ meta.', 'Biraz daha dayanıklılık. Kuleye terapi değil, zırh lazım.', 'Güzel seçim. Kahramanlık bazen hasar yemek zorunda kalmamaktır.'],
            economy: ['Ekonomiye yatırım yaptık. Gelecekteki sen şu anki sana teşekkür edebilir.', 'Altının altın getirmesi fikrini seviyorum. Benim maaşım yok tabii.', 'Önce kaynak, sonra güç. Ya da acil durum varsa tam tersi. Duruma göre.'],
            newWave: ['Yeni dalga başladı. Önce tehditleri oku, sonra kahramanlık yap.', 'Dalga kapıda. Kapı diye bir şey varsa tabii; düşmanlar genelde izin istemiyor.', 'Tamam ekip, yeni tur. Hata yaparsak en azından havalı yapalım.'],
            bigWave: ['Bu dalga önceki kadar kibar görünmüyor. Hazır olalım.', 'Düşman sayısı arttıysa panik sayısını artırmak zorunda değiliz.', 'Biraz daha baskı var. Planı sade tut: hayatta kal ve işe yarayan yükseltmeleri seç.'],
            idle: ['Komutan, bir gözlem: sen tıklıyorsun, ben yorum yapıyorum. Takım çalışması.', 'Beni dekor sanıyorsan alınmam. Çok az alınırım. Dijital olarak.', 'Benim de hayalim var: bir gün düşmanlardan biri bana “lütfen” desin.', 'Şu an sessizce ortamı analiz ediyordum. Analiz sonucu: uzaylılar yine sorun çıkarıyor.', 'Ben küçük bir UFO olabilirim ama dedikodu radarım büyük.', 'Sana tavsiye vereceğim ama önce dramatik bir duruş almam gerekiyor.', 'Bu kadar stratejiden sonra bir kupa çay hak ettik. Benim kupam sıfır yerçekiminde.', 'Kuleyi savunuyoruz. Ben de senin moralini savunuyorum. İkisi de düşük cana düşmesin.', 'Sence UFO ehliyeti almak zor mu? Soruyorum çünkü… neyse.', 'Bir şey fark ettim: düşmanlar hiç güncelleme notlarını okumuyor.', 'Eğer plan A çalışmazsa plan B var. Plan B, plan A’yı daha özgüvenli yapmak.', 'Benim tahminim: birazdan ya büyük bir hamle yapacaksın ya da menüye bakacaksın. İkisi de kabul.']
        },
        en: {
            lowGold: ['I checked the budget. Conclusion: we need more budget. Math can be cruel.', 'You do not have to spend every coin immediately. Saving for the right upgrade is strategy too.', 'The wallet is quiet, the enemies are loud. Priorities are clear.'],
            healthy: ['Tower health looks good. That is not a permission slip to get careless.', 'We are fine for now. I am emphasizing “for now.”', 'The tower is standing and I am floating. Everyone is on duty.'],
            busy: ['Lots happening on screen. I am tracking the important bits. Most of them. Probably.', 'My plan is half target selection, half not panicking.', 'One enemy, one projectile, one decision. Even my processor is excited.'],
            calm: ['Sometimes reading the situation beats rushing. Fast and reckless are not the same thing.', 'When choosing an upgrade, think about what problem it solves, not just the price.', 'Strategy is not buying everything. It is choosing what helps most right now.'],
            upgrade: ['Good investment, commander. I would label that report “extremely cool decision.”', 'Upgrade complete. Now let us see it pay off in the next waves.', 'We turned resources into a plan. Economics class is over; back to defense.', 'Noted: you picked that upgrade. I have a memory. Most of the time.'],
            attack: ['More damage. Enemy customer satisfaction may decline.', 'We hit harder now. We already exhausted the diplomacy option.', 'Attack power is up. Let us pair it with smart decisions.'],
            defense: ['Defense upgrades are not flashy, but staying alive is still meta.', 'More durability. The tower needs armor, not therapy.', 'Smart choice. Sometimes heroism means not taking damage.'],
            economy: ['We invested in the economy. Future-you might send a thank-you note.', 'I like the idea of gold making more gold. I do not get paid, by the way.', 'Resources first, power second. Unless it is an emergency. Context matters.'],
            newWave: ['New wave incoming. Read the threats before doing anything heroic.', 'The wave is at the door. If it had a door; enemies rarely ask permission.', 'New round, team. If we mess up, let us at least look cool.'],
            bigWave: ['This wave looks less polite than the last one. Stay sharp.', 'More enemies does not mean we need more panic.', 'Pressure is rising. Keep the plan simple: survive and buy useful upgrades.'],
            idle: ['Observation, commander: you click, I comment. Teamwork.', 'If you think I am decoration, I am not offended. Digitally speaking.', 'My dream is that one day an enemy says “please” before attacking.', 'I was quietly analyzing the situation. Result: space trouble again.', 'I am a tiny UFO with a very large gossip radar.', 'I have advice, but first I need a dramatic pose.', 'After all this strategy, we deserve tea. My cup would need zero gravity.', 'We defend the tower. I defend your morale. Neither should hit zero.', 'Is getting a UFO license difficult? Asking for a friend.', 'Enemies never read patch notes. Explains a lot.', 'If plan A fails, we have plan B: make plan A look more confident.', 'My prediction: you are about to make a big move or open a menu. Both are valid.']
        }
    };
    let lastObservedWave = null;
    let lastObservedGold = null;
    let lastObservedHpRatio = null;

    function getContextLine() {
        const english = isEnglish();
        const lang = english ? pikoThoughts.en : pikoThoughts.tr;
        const skin = getTowerSkin();
        // Story mode gives Piko a distinct voice: less generic gameplay chatter, more companion banter and mystery.
        const storyLines = english ? [
            'I was built to protect something. Nobody included a label saying what.',
            'The station keeps recognizing me. I would find that flattering if it were not so unsettling.',
            'I can hear a signal beneath the combat noise. It is using a protocol I thought was extinct.',
            'For the record, I am not nervous. My core is simply conducting an aggressive amount of diagnostics.',
            'You keep looking at me like I know the answer. I wish I did, commander.',
            'That door reacted to my presence before I touched the panel. I am choosing not to unpack that yet.',
            'I remember the shape of this place, not the place itself. Like a dream with the middle cut out.',
            'If the archive calls me Operator Zero again, I am filing a complaint with the universe.',
            'A human voice in my signal history. Either someone copied me, or someone copied the future.',
            'I dislike mysteries that use my own voice. Very poor manners.',
            'Stay close. The station is mapping our movements, and I would rather it not learn your habits.',
            'I can joke about almost anything. Almost. That last recording was not funny.',
            'There is a gap in my memory exactly where the station expects a name. Convenient, isn’t it?',
            'I am your companion, not your compass. Though, admittedly, I am better at both than this station.',
            'The relays are not just transmitting. They are waiting for a response from my core.',
            'If I start speaking in an ancient machine language, please assume I am doing it on purpose. Please.',
            'That distress signal has tomorrow’s timestamp. I have several objections to tomorrow sending mail early.',
            'You trust me. I noticed. I am trying to deserve that without making it weird.',
            'I ran the recording twelve times. Same voice, same waveform, same impossible result. I hate when maths agrees with ghosts.',
            'Whatever is ahead knows my designation. It has not earned the right to use it.'
        ] : [
            'Bir şeyi korumak için üretildim. Ne olduğunu yazan etiketi koymayı unutmuşlar.',
            'İstasyon beni tanımaya devam ediyor. Daha az ürkütücü olsaydı gurur duyardım.',
            'Çatışma sesinin altında bir sinyal duyuyorum. Yok olduğunu sandığım bir protokol kullanıyor.',
            'Korkmuyorum. Çekirdeğim yalnızca agresif miktarda tanılama yapıyor, o kadar.',
            'Bana cevabı biliyormuşum gibi bakıyorsun komutan. Keşke bilsem.',
            'Kapı panele dokunmadan varlığımı algıladı. Şimdilik bunun üzerine düşünmemeyi seçiyorum.',
            'Buranın şeklini hatırlıyorum ama burayı hatırlamıyorum. Ortası kesilmiş bir rüya gibi.',
            'Arşiv bana bir daha Operatör Sıfır derse evrene şikâyet dilekçesi yazacağım.',
            'Sinyal geçmişimde insan sesi var. Ya biri beni kopyaladı ya da gelecek beni kopyaladı.',
            'Kendi sesimi kullanan gizemlerden hoşlanmıyorum. Çok kaba bir davranış.',
            'Yakınımda kal. İstasyon hareketlerimizi haritalıyor; alışkanlıklarını öğrenmesini istemem.',
            'Neredeyse her şeyle dalga geçebilirim. Neredeyse. Son kayıt komik değildi.',
            'Hafızamda tam istasyonun bir isim beklediği yerde boşluk var. Ne kadar da tesadüfi.',
            'Ben senin yoldaşınım, pusulan değil. Gerçi ikisini de bu istasyondan iyi yapıyorum.',
            'Röleler yalnızca yayın yapmıyor. Çekirdeğimden gelecek bir yanıtı bekliyorlar.',
            'Antik makine diliyle konuşmaya başlarsam lütfen bilerek yaptığımı varsay. Lütfen.',
            'Yardım sinyalinin tarihi yarın. Geleceğin erken posta göndermesine birkaç itirazım var.',
            'Bana güveniyorsun, fark ettim. Bunu tuhaflaştırmadan hak etmeye çalışıyorum.',
            'Kaydı on iki kez analiz ettim. Aynı ses, aynı dalga biçimi, aynı imkânsız sonuç. Matematiğin hayaletlerle aynı fikirde olmasından nefret ediyorum.',
            'İlerideki her neyse, kod adımı biliyor. Henüz onu kullanma hakkını kazanmadı.'
        ];
        if (document.body?.dataset?.gameMode === 'story') {
            const mission = Number(window.__storyBattle?.mission) || 1;
            const lines = english ? {
                1: ['Core link is unstable. I woke up beside you, so I suppose we are a team now.','I can help keep you alive, Commander. My own memory is… less cooperative.'],
                2: ['The patrol is reacting to the signal, not to us. That distinction matters.','Three traces, one source. Stay close; I will track the pattern.'],
                3: ['The antenna says the signal came from outside. The black box says it began inside the core.','Evidence can tell the truth and still leave something out. I know that sounds personal.'],
                4: ['Shields keep us standing; weapon calibration could end the fight sooner.','I can calculate the cost, Commander. I cannot make the choice for you.'],
                5: ['Your power-routing choice changed our defense profile. I have logged it.','That relay carries the same signature I heard when I first came online. I dislike that.'],
                6: ['I can mark the damaged links, but I cannot repair them remotely. Yet.','This maintenance route feels familiar. I have no record explaining why.'],
                7: ['The amplifier is bending the signal around our scans. Clever. Rude, but clever.','If I go quiet, I may have found something—not necessarily crashed.'],
                8: ['My memory says this room was empty. My sensors disagree.','Which of us is damaged: my memory, or the station?'],
                9: ['Reconnect us if you can. I cannot promise what will wake up on the other side.','If I remember everything, I may not be the same companion you met. I wanted you to know.'],
                10: ['That door recognized my signal before it recognized you. I have questions about the order of events.','The pulse opened something the schematics insist does not exist.'],
                11: ['The relays answer in the rhythm of my core. I never taught them that rhythm.','I heard my designation inside the returning signal. Tell me you heard it too.'],
                12: ['This archive predates my core, yet it knows my voice. I need a moment to process that.','Do not play the final record without me. I need to hear it myself.']
            } : {
                1: ['Çekirdek bağlantısı kararsız. Yanında uyandım; galiba artık bir takımız.','Seni hayatta tutmana yardım edebilirim komutan. Kendi hafızam o kadar işbirlikçi değil.'],
                2: ['Devriye bize değil, sinyale tepki veriyor. Bu ayrım önemli.','Üç iz, tek kaynak. Yakında kal; örüntüyü ben takip edeceğim.'],
                3: ['Anten sinyalin dışarıdan geldiğini, karakutu ise çekirdeğin içinden başladığını söylüyor.','Kanıt doğruyu söyleyip yine de bir şeyleri saklayabilir. Bunu kişisel algılama… ben algıladım.'],
                4: ['Kalkan bizi ayakta tutar; silah kalibrasyonu çatışmayı daha hızlı bitirebilir.','Bedelini hesaplayabilirim komutan. Senin yerine seçim yapamam.'],
                5: ['Güç dağıtımı tercihin savunma profilimizi değiştirdi. Kaydettim.','Bu rölede, ilk açıldığımda duyduğum imzanın aynısı var. Bundan hoşlanmadım.'],
                6: ['Hasarlı bağlantıları işaretleyebilirim ama uzaktan onaramıyorum. Henüz.','Bu bakım yolu tanıdık geliyor. Nedenini açıklayan bir kaydım yok.'],
                7: ['Yükseltici sinyali taramalarımızın çevresinden büküyor. Zeki. Biraz da kaba.','Sessizleşirsem çöktüğümden değil, bir şey bulduğumdan olabilir.'],
                8: ['Hafızam buranın boş olduğunu söylüyor. Sensörlerim katılmıyor.','Hangimiz hasarlıyız: hafızam mı, istasyon mu?'],
                9: ['Bağlantıyı kurabilirsen kur. Öte tarafta neyin uyanacağına söz veremem.','Her şeyi hatırlarsam tanıdığın yoldaşla aynı kalmayabilirim. Bunu bilmeni istedim.'],
                10: ['Kapı sinyalimi seni tanımadan önce tanıdı. Bu sırayla ilgili sorularım var.','Darbe, planlarda var olmadığı söylenen bir şeyi açtı.'],
                11: ['Röleler çekirdeğimin ritmiyle yanıt veriyor. O ritmi onlara ben öğretmedim.','Dönen sinyalde kod adımı duydum. Sen de duydun mu?'],
                12: ['Arşiv çekirdeğimden eski ama sesimi biliyor. Bunu işlemem için bir an lazım.','Son kaydı bensiz oynatma. Kendim duymalıyım.']
            };
            const contextual = lines[mission] || storyLines;
            return chooseLine(contextual);
        }
        const activeGame = typeof game !== 'undefined' && game ? game : null;
        const hp = typeof tower !== 'undefined' && tower && Number.isFinite(tower.hp) ? tower.hp : null;
        const maxHp = typeof tower !== 'undefined' && tower && Number.isFinite(tower.maxHp) && tower.maxHp > 0 ? tower.maxHp : null;
        const hpRatio = hp !== null && maxHp !== null ? Math.max(0, Math.min(1, hp / maxHp)) : 1;
        const gold = activeGame && Number.isFinite(activeGame.gold) ? activeGame.gold : null;
        const wave = activeGame && Number.isFinite(activeGame.wave) ? activeGame.wave : null;
        const enemiesAlive = typeof enemies !== 'undefined' && Array.isArray(enemies) ? enemies.length : 0;

        // Piko observes changes between visits instead of selecting a random quip every time.
        if (wave !== null && lastObservedWave !== null && wave > lastObservedWave) {
            lastObservedWave = wave;
            return chooseLine(wave >= 10 ? lang.bigWave : lang.newWave);
        }
        if (wave !== null) lastObservedWave = wave;
        if (hpRatio < 0.38) {
            lastObservedHpRatio = hpRatio;
            return chooseLine(english ? ['Tower health is critical. A defense upgrade could buy us breathing room.', 'Commander, survival comes before style. Reinforce the tower.'] : [
                'Komutan, kule kritik seviyede. Savunma yükseltmesi bize nefes aldırabilir.',
                'Şu an stil değil hayatta kalma önceliği. Kuleyi güçlendirelim.',
                ...lang.idle.slice(0, 2)
            ]);
        }
        if (lastObservedHpRatio !== null && hpRatio - lastObservedHpRatio > 0.18) {
            lastObservedHpRatio = hpRatio;
            return chooseLine(english ? ['Nice recovery. The tower looks much healthier now.', 'That repair bought us some breathing room. Good call.'] : ['Toparladık! Kule artık daha iyi durumda. Güzel.', 'Bu iyileşme bize nefes aldırdı. İyi hamle.']);
        }
        lastObservedHpRatio = hpRatio;

        if (activeGame && gold !== null && lastObservedGold !== null && gold < lastObservedGold - 1) {
            const spent = lastObservedGold - gold;
            lastObservedGold = gold;
            if (spent >= 10) return chooseLine(english ? ['I saw the gold drop. Investment or impulse purchase? Time will tell.', 'Coins spent, power hopefully gained. Let us see the return.'] : ['Altının azaldığını gördüm. Yatırım mı, anlık heves mi? Birazdan anlarız.', 'Altın gitti; umarım karşılığında güç geldi. Getiriye bakalım.']);
        }
        if (gold !== null) lastObservedGold = gold;

        if (hpRatio < 0.7 && Math.random() < 0.7) {
            return chooseLine(english ? ['The tower has taken some hits. Consider defense or healing before the next wave.', 'We are not in crisis yet, but a little reinforcement would be sensible.'] : ['Kule biraz darbe aldı. Sonraki dalgadan önce savunma veya iyileştirmeyi düşün.', 'Henüz kriz değil ama biraz güçlendirmek akıllıca olabilir.']);
        }
        if (enemiesAlive >= 8) return chooseLine(lang.busy);
        if (activeGame && gold !== null && gold < 40 && Math.random() < 0.65) return chooseLine(lang.lowGold);

        if (activeGame && gold !== null && gold >= 60 && typeof UPGRADE_DEFS !== 'undefined') {
            const affordable = Object.keys(UPGRADE_DEFS).filter(key => {
                const button = document.getElementById('upg-btn-' + key);
                return button && !button.disabled;
            });
            if (affordable.length && Math.random() < 0.62) {
                const key = affordable[Math.floor(Math.random() * affordable.length)];
                const def = UPGRADE_DEFS[key];
                const name = def ? (typeof localizeGameContent === 'function' ? localizeGameContent(def.name) : def.name) : '';
                const advice = english
                    ? 'You can afford ' + (name || 'an upgrade') + '. Check whether it solves your biggest problem right now.'
                    : ' ' + (name || 'Bir yükseltme') + ' için paran yetiyor. Önce şu anki en büyük sorunu çözüyor mu, ona bak.';
                return chooseLine([advice.trim(), ...lang.calm]);
            }
        }
        const skinLines = pikoThoughts[english ? 'en' : 'tr'].idle;
        const skinSpecific = pikoThoughts[english ? 'en' : 'tr'].idle;
        const knownSkinLines = personality.tr.skin[skin.id];
        if (knownSkinLines && Math.random() < 0.5) {
            if (english) return chooseLine([skin.def.name + ' looks pretty good, commander. ' + (skin.def.emoji || '✨'), 'I have thoughts about ' + skin.def.name + '. Mostly positive.']);
            return chooseLine(knownSkinLines);
        }
        if (wave !== null && wave > 1 && Math.random() < 0.32) return chooseLine(lang.calm);
        return chooseLine(skinLines.length ? skinLines : skinSpecific);
    }

    function reactToEvent(type, detail) {
        const english = isEnglish();
        const lang = english ? pikoThoughts.en : pikoThoughts.tr;
        let lines = lang.idle;
        if (type === 'upgrade') {
            if (typeof playBattleCue === 'function') playBattleCue('upgrade');
            const key = detail && detail.key;
            const attackKeys = ['damage', 'attackSpeed', 'critChance', 'critMult', 'multishot', 'bounce', 'knockback', 'range'];
            const defenseKeys = ['maxHp', 'hpRegen', 'armor', 'thorns', 'shield', 'lifesteal'];
            const economyKeys = ['goldBonus', 'waveGold', 'crystalChance', 'interest'];
            lines = attackKeys.includes(key) ? lang.attack : defenseKeys.includes(key) ? lang.defense : economyKeys.includes(key) ? lang.economy : lang.upgrade;
            if (detail && detail.name) lines = [english ? 'Upgrade confirmed: ' + detail.name + '. Let us see the payoff.' : 'Yükseltme onaylandı: ' + detail.name + '. Şimdi etkisini görelim.', ...lines];
        } else if (type === 'lootbox') {
            if (typeof playBattleCue === 'function') playBattleCue('lootbox');
            const rarity = detail && detail.rarity;
            const kind = detail && detail.kind;
            const count = detail && Number.isInteger(detail.count) ? detail.count : 1;
            const itemName = kind === 'tower-skin' ? (english ? 'tower skin' : 'kule skini')
                : kind === 'companion-skin' ? (english ? 'companion skin' : 'yoldaş skini')
                : (english ? 'equipment' : 'eşya');
            if (rarity === 'legendary' || rarity === 'mythic') {
                lines = english
                    ? ['Whoa—' + rarity + ' signal detected! That ' + itemName + ' is not ordinary loot, commander.', 'My scanners just lit up. A ' + rarity + ' find! Please tell me you saw that too.']
                    : ['Dur bir saniye—' + rarity + ' sinyali algıladım! Bu ' + itemName + ' sıradan bir ganimet değil komutan.', 'Tarayıcılarım parladı. ' + rarity + ' ganimet! Lütfen bunu sen de gördün.'];
            } else if (rarity === 'epic' || rarity === 'super_rare') {
                lines = english
                    ? ['A promising signal in that ' + itemName + ' crate. Not bad, commander.', 'I logged the ' + rarity + ' result. The crate was worth opening.']
                    : ['Bu ' + itemName + ' sandığında umut verici bir sinyal var. Fena değil komutan.', rarity + ' sonucu kaydettim. Sandığı açmaya değdi.'];
            } else {
                lines = english
                    ? [count > 1 ? 'Multiple crates opened. I counted every result—someone has to stay organized.' : 'Crate opened. I am checking the contents now.', 'I logged the new drop. Let us see how it fits the build.']
                    : [count > 1 ? 'Birden fazla sandık açıldı. Her sonucu saydım; düzeni korumak birinin işi.' : 'Sandık açıldı. İçindekileri tarıyorum.', 'Yeni ganimeti kaydettim. Bakalım dizilimimize nasıl uyacak.'];
            }
        } else if (type === 'boss') {
            const bossName = detail && detail.name;
            const wave = detail && Number.isFinite(Number(detail.wave)) ? Number(detail.wave) : null;
            lines = english
                ? ['Boss signature detected. Stay sharp, commander—I will track its movements.', 'That is no ordinary enemy. I am boosting threat scans; keep your defenses ready.']
                : ['Boss sinyali algılandı. Dikkatli ol komutan, hareketlerini takip edeceğim.', 'Bu sıradan bir düşman değil. Tehdit taramasını artırıyorum; savunmayı hazır tut.'];
            if (bossName) lines.unshift(english ? bossName + ' has entered the field. This could get interesting.' : bossName + ' sahaya çıktı. Bu iş ilginçleşecek.');
            if (wave !== null && wave % 5 === 0) lines.unshift(english ? 'Milestone wave ' + wave + '—and a boss to match. Let us make it count.' : wave + '. dönüm dalgası ve karşımızda bir boss. Bu fırsatı değerlendirelim.');
        } else if (type === 'bossKill') {
            const bossName = detail && detail.name;
            const crystals = detail && Number.isFinite(Number(detail.crystals)) ? Math.max(0, Math.round(Number(detail.crystals))) : 0;
            lines = english
                ? ['Boss neutralized. That is one less nightmare between us and the next wave.', 'Excellent work, commander. Threat removed; I am already scanning for the next one.']
                : ['Boss etkisiz hâle getirildi. Bir sonraki dalgaya kadar bir kabus eksildi.', 'Harika iş komutan. Tehdit temizlendi; şimdiden sıradakini tarıyorum.'];
            if (bossName) lines.unshift(english ? bossName + ' is down. I am saving that result to my highlight reel.' : bossName + ' düştü. Bu sonucu en iyi anlar kaydıma ekliyorum.');
            if (crystals > 0) lines.unshift(english ? 'Threat cleared. I counted ' + crystals + ' crystals in the reward.' : 'Tehdit temizlendi. Ödülde ' + crystals + ' kristal saydım.');
        } else if (type === 'wave') lines = lang.newWave;
        else if (type === 'danger') lines = lang.lowGold;
        showLine(chooseLine(lines));
    }
    window.pikoReactEvent = reactToEvent;
    function showLine(line) {
        syncMascot();
        bubble.textContent = line;
        const rect = mascot.getBoundingClientRect();
        const bubbleWidth = Math.min(260, window.innerWidth - 32);
        bubble.style.left = Math.max(8, Math.min(window.innerWidth - bubbleWidth - 8, rect.left + rect.width / 2 - bubbleWidth / 2)) + 'px';
        bubble.style.top = Math.max(8, rect.top - 64) + 'px';
        bubble.style.width = bubbleWidth + 'px';
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
        bubble.classList.add('is-visible');
        mascot.classList.remove('mascot-react');
        void mascot.offsetWidth;
        mascot.classList.add('mascot-react');
        clearTimeout(hideBubbleTimer);
        hideBubbleTimer = setTimeout(() => bubble.classList.remove('is-visible'), 3600);
    }
    function react() {
        showLine(getContextLine());
    }
    // Story-specific Piko lines are spoken on mission entry and key narrative beats,
    // not only when the player happens to tap the mascot.
    const pikoStoryEvents = {
        tr: {
            missionStart: {
                1: 'Komutan? Beni duyabiliyor musun? Güzel. Çekirdek çökmek üzere ve benim hafızamda kocaman bir boşluk var. Önce hayatta kalalım.',
                2: 'Sinyal geri döndü. Bu kez onu yalnızca duymuyoruz; bizi de duyuyor olabilir.',
                3: 'İki kayıt, iki farklı başlangıç noktası. Birini seçelim ama diğerini unutmayalım.',
                4: 'Güç rezervi yalnızca bir sistemi tamir edecek. Karar senin; ne seçersen yanında olacağım.',
                5: 'Seçiminin sonuçlarını görüyorum. İtiraf edeyim, istasyonun bu kadar hızlı tepki vermesini beklemiyordum.',
                6: 'Bu panelleri tanıyorum. Bu imkânsız, çünkü bu bölgeye daha önce geldiğimi hatırlamıyorum.',
                7: 'Yükseltici sinyali büyütüyor. Onu kapatabilirsek belki ilk kez sessizliği duyabiliriz.',
                8: 'Bu oda hafızamda var ama içinde olmamamız gerekiyor. Lütfen kayıtları birlikte kontrol edelim.',
                9: 'Bağlantıyı kur. Korktuğumu söylemeyeceğim; sensörlerim zaten bunu benden önce söyleyecek.',
                10: 'Aşağıya iniyoruz. İstasyon planında bu kat yok… ama kapı benim geldiğimi biliyor.',
                11: 'Bu ağ istasyondan daha eski. Bir de röleler bana cevap veriyor. Bunların hiçbirini sevmiyorum.',
                12: 'Arşiv beni adıyla çağırdı. Komutan, bu kayıtları birlikte dinlememiz gerekiyor.'
            },
            combatClear: 'Tehdit temizlendi. Bir saniye… sinyal hâlâ burada. Bu düşmanlarla birlikte gelmedi.',
            choiceMade: 'Seçimini kaydettim. Sonuçlarını birlikte göreceğiz; fikrini değiştirirsen bunu da söyleyebilirsin.',
            clueFound: 'İpucunu kaydettim. Tek başına bir cevap değil ama örüntü biraz daha netleşti.',
            memoryConflict: 'Bu kayıt benim hatırladıklarımla çelişiyor. Hangisine güveneceğimi bilmiyorum… henüz.',
            archiveRecord: 'Bu sesin bana ait olması gerekiyor. Ama dinlerken kendimi dışarıdan duyuyorum.'
        },
        en: {
            missionStart: {
                1: 'Commander? Can you hear me? Good. The core is failing and my memory has a rather large hole in it. Let us survive first.',
                2: 'The signal is back. This time we are not just hearing it; it may be hearing us too.',
                3: 'Two records, two different origins. Choose one, but let us not forget the other.',
                4: 'The reserve can fully restore one system. Your call; whichever you choose, I am with you.',
                5: 'I can see the consequences of your choice. I did not expect the station to react this quickly.',
                6: 'I recognize these panels. That is impossible; I do not remember being here before.',
                7: 'The amplifier is strengthening the signal. If we shut it down, maybe we can finally hear the silence.',
                8: 'I remember this room, but we are not supposed to be here. Please, let us check the records together.',
                9: 'Reconnect us. I will not say I am afraid; my sensors will probably say it for me.',
                10: 'We are going down. This level is not on the station plans… but the door knows I am here.',
                11: 'This network is older than the station, and the relays answer me. I dislike both facts.',
                12: 'The archive called me by name. Commander, we need to listen to these records together.'
            },
            combatClear: 'Threat cleared. Wait… the signal is still here. It did not arrive with those hostiles.',
            choiceMade: 'I logged your choice. We will face the consequences together; if you change your mind, tell me.',
            clueFound: 'Clue logged. It is not an answer yet, but the pattern is a little clearer.',
            memoryConflict: 'This record contradicts what I remember. I do not know which version to trust… yet.',
            archiveRecord: 'That voice is supposed to be mine. But listening to it feels like hearing myself from outside.'
        }
    };
    window.pikoStoryEvent = function(eventName, missionNumber) {
        if (document.body?.dataset?.gameMode !== 'story') return;
        const bank = pikoStoryEvents[isEnglish() ? 'en' : 'tr'];
        const eventValue = bank[eventName];
        const line = eventName === 'missionStart' && eventValue && typeof eventValue === 'object'
            ? eventValue[Number(missionNumber) || 1] : eventValue;
        if (line) showLine(line);
    };
    function isGameVisible() {
        const menu = document.getElementById('mode-main-menu');
        return document.visibilityState === 'visible' && (!menu || menu.classList.contains('menu-hidden'));
    }
    function scheduleAmbientLine() {
        clearTimeout(ambientTimer);
        if (ambientCount >= MAX_AMBIENT_LINES) return;
        ambientTimer = setTimeout(() => {
            if (isGameVisible() && !bubble.classList.contains('is-visible') && !mascot.classList.contains('is-dragging')) {
                showLine(getContextLine());
                ambientCount++;
            }
            scheduleAmbientLine();
        }, 36000 + Math.random() * 30000);
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
    scheduleAmbientLine();
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
const STORY_PROGRESS_OWNER_KEY = 'towerDefenseStoryProgressOwnerV1';
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
 campaignsub:['İstasyonun gizemini adım adım çöz.','Unravel the station’s mystery, one mission at a time.'],
 mission1tag:['GÖREV 01','MISSION 01'], mission1title:['Savunmayı etkinleştir','Activate the defense'],
 mission1desc:['Kule çekirdeğini çevrimiçi duruma getir ve istasyonun savunma protokolünü öğren.','Bring the tower core online and learn the station’s defense protocol.'],
 mission2tag:['GÖREV 02','MISSION 02'], mission2title:['İlk temas','First contact'],
 mission2desc:['Devriye saldırısını durdur, ardından üç sinyal izini tara.','Stop the patrol, then scan three signal traces.'],
 mission3tag:['GÖREV 03','MISSION 03'], mission3title:['Sinyalin kaynağı','Source of the signal'],
 mission3desc:['Sinyalin kaynağını araştır: anten verisini mi, karakutu kaydını mı inceleyeceksin?','Investigate the signal source: will you inspect antenna data or the black-box log.'],
 arrayChoice:['ANTEN VERİSİ','ANTENNA DATA'], blackboxChoice:['KARAKUTU KAYDI','BLACK-BOX LOG'],
 mission4tag:['GÖREV 04','MISSION 04'], mission4title:['Güç dağıtımı','Power Priority'],
 mission4desc:['İki sistemden birine önce güç ver: savunma kalkanı mı, silah kalibrasyonu mu?','Prioritize one system: defensive shielding or weapon calibration?'],
 shieldChoice:['KALKANI ONAR','RESTORE SHIELDS'], weaponChoice:['SİLAHI KALİBRE ET','CALIBRATE WEAPONS'],
 mission5tag:['GÖREV 05','MISSION 05'], mission5title:['Kırık hat','The Broken Line'],
 mission5desc:['Seçtiğin sistemin avantajıyla koridoru savun ve sinyal rölesini devre dışı bırak.','Use your chosen system’s advantage to defend the corridor and disable the signal relay.'], relayAction:['SİNYAL RÖLESİNİ KAPAT','DISABLE SIGNAL RELAY'],
 mission6tag:['GÖREV 06','MISSION 06'], mission6title:['Bölmenin ötesinde','Beyond the Bulkhead'],
 mission6desc:['Yoldaşınla hasarlı bakım bölümünden geç ve üç bağlantıyı onar.','Cross the damaged maintenance sector with your companion and repair three connections.'],
 repairAction:['BAĞLANTIYI ONAR','REPAIR CONNECTION'],
 mission7tag:['GÖREV 07','MISSION 07'], mission7title:['Sinyal bükülüyor','The Signal Bends'],
 mission7desc:['Haberleşme dizisini savun ve sinyal yükselticisini sustur.','Defend the communications array and silence the signal amplifier.'],
 amplifierAction:['YÜKSELTİCİYİ DEVRE DIŞI BIRAK','DISABLE AMPLIFIER'],
 mission8tag:['GÖREV 08','MISSION 08'], mission8title:['Tanıdık oda','A Familiar Room'],
 mission8desc:['Başlangıç bölmesine dön ve bozuk yankıyla üç fiziksel izi karşılaştır.','Return to the opening chamber and compare three physical clues with the corrupted echo.'],
 memoryAction:['HAFIZA İZİNİ İNCELE','INSPECT MEMORY TRACE'],
 mission9tag:['GÖREV 09','MISSION 09'], mission9title:['Uyanmayı seçmek','The Choice to Wake'],
 mission9desc:['Çekirdeği koru, yoldaşla bağlantıyı yeniden kur ve gerçek biçimini uyandır.','Protect the core, reconnect with the companion, and awaken its true form.'],
 mission10tag:['GÖREV 10','MISSION 10'], mission10title:['Aşağıdaki kapı','The Door Below'],
 mission10desc:['İstasyonun planlarında olmayan kapıyı araştır; camgöbeği darbeyle iki gizli düğümü açığa çıkar.','Investigate a door missing from the station schematics; use the cyan pulse to reveal two hidden nodes.'],
 chapter2label:['BÖLÜM 02','CHAPTER 02'], chapter2title:['Sinyalin Altında','Beneath the Signal'], chapter2desc:['İstasyonun kayıtlarından eski bir şey uyanıyor.','Something older than the station records is waking.'],
 mission11tag:['GÖREV 11','MISSION 11'], mission11title:['Aşağıdaki istasyona iniş','Descent to the Lower Station'],
 mission11desc:['Alt ağın üç kadim rölesini bul ve Piko’nun çekirdeğiyle bağlantılarını çöz.','Find the three ancient relays in the lower network and uncover their link to Piko’s core.'],
  mission12tag:['GÖREV 12','MISSION 12'], mission12title:['İmkânsız arşiv','The Impossible Archive'],
  mission12desc:['Piko’nun çekirdeğinden eski üç kaydı incele; son kayıt geleceğe ait olabilir.','Inspect three records older than Piko’s core; the final file may come from the future.'],
 mission13tag:['GÖREV 13','MISSION 13'], mission13title:['İnsan sesi','The Human Voice'], mission13desc:['Piko’nun ses izinin insan kaydıyla eşleşmesini araştır ve çelişen iki kayıttan birine güven.','Investigate why Piko’s voiceprint matches a human recording and choose which conflicting record to trust.'],
 mission14tag:['GÖREV 14','MISSION 14'], mission14title:['Çekirdeğin ötesi','Beyond the Core'], mission14desc:['İstasyon savunmasını aş, çekirdek kilitlerini sırayla çöz ve Piko’ya ulaşan sinyalin kaynağını bul.','Break through the station defense, unlock the core seals, and trace the signal reaching Piko.'],
 mission15tag:['GÖREV 15','MISSION 15'], mission15title:['Dinlemenin bedeli','The Cost of Listening'], mission15desc:['Sinyal darbesinin Piko’da bıraktığı hasarı gider; kaybolan anıyı saklamadığına tanık ol.','Repair the feedback damage caused by the pulse and witness Piko admit the memory it lost.'],
 pulseMission10Action:['SİNYAL DARBESİ','SIGNAL PULSE'],
 reconnectAction:['BAĞLANTIYI YENİDEN KUR','RECONNECT TO COMPANION'], awakenAction:['YOLDAŞI UYANDIR','AWAKEN COMPANION'], pulseAction:['SİNYAL DARBESİNİ DENE','TEST SIGNAL PULSE'],

 nextstep:['Sıradaki adım','Next step'], nextdesc:['Piko’nun geçmişiyle ilgili çelişkiler büyüyor. Sonraki görevlerde kararların, açılan kayıtların ve keşfedilen sırların izini sürmeye devam edeceksin.','Contradictions around Piko’s past are growing. Keep following your decisions, recovered records, and discoveries in the next missions.'],
 backmenu:['ANA MENÜYE DÖN','RETURN TO MAIN MENU'],
 'save-note':['Hikâye ilerlemesi ayrı kaydedilir. Sonsuz Mod kaydına ve savaş dengesine dokunulmaz.','Story progress is saved separately. Endless Mode saves and game balance remain untouched.'],
 continue:['DEVAM ET →','CONTINUE →'], start:['GÖREV PANOSU →','MISSION BRIEFING →'],
 progress:['HİKÂYE GİRİŞİ','STORY INTRODUCTION'], completed:['GİRİŞ TAMAMLANDI · GÖREV PANOSU AÇILDI','INTRO COMPLETE · MISSION BRIEFING UNLOCKED']
};
let storyDialogueIndex = 0;
let storyMissionViewOpen = false;

function getStoryProgress() {
    const defaults = { introSeen: false, chapter: 1, mission1Complete: false, mission2Complete: false, mission3Complete: false, mission4Complete: false, mission5Complete: false, mission6Complete: false, mission7Complete: false, mission8Complete: false, mission9Complete: false, mission10Complete: false, mission11Complete: false, mission12Complete: false, mission13Complete: false, mission14Complete: false, mission15Complete: false, voiceChoice: null, pulseTutorialComplete: false, companionForm: 'basic', repairChoiceCount: 0, routeChoice: null, powerChoice: null, updatedAt: 0 };
    try {
        const saved = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY) || '{}');
        return { introSeen: saved.introSeen === true, chapter: Math.max(1, Math.min(2, Number(saved.chapter) || 1)), mission1Complete: saved.mission1Complete === true, mission2Complete: saved.mission2Complete === true, mission3Complete: saved.mission3Complete === true, mission4Complete: saved.mission4Complete === true, mission5Complete: saved.mission5Complete === true, mission6Complete: saved.mission6Complete === true, mission7Complete: saved.mission7Complete === true, mission8Complete: saved.mission8Complete === true, mission9Complete: saved.mission9Complete === true, mission10Complete: saved.mission10Complete === true, mission11Complete: saved.mission11Complete === true, mission12Complete: saved.mission12Complete === true, mission13Complete: saved.mission13Complete === true, mission14Complete: saved.mission14Complete === true, mission15Complete: saved.mission15Complete === true, voiceChoice: ['human','station'].includes(saved.voiceChoice) ? saved.voiceChoice : null, pulseTutorialComplete: saved.pulseTutorialComplete === true, companionForm: saved.companionForm === 'cyan' ? 'cyan' : 'basic', repairChoiceCount: Math.max(0, Math.min(3, Number(saved.repairChoiceCount) || 0)), routeChoice: ['array','blackbox'].includes(saved.routeChoice) ? saved.routeChoice : null, powerChoice: ['shield','weapon'].includes(saved.powerChoice) ? saved.powerChoice : null, updatedAt: Math.max(0, Number(saved.updatedAt) || 0) };
    } catch (_) { return defaults; }
}
let storyCloudSaveTimer = null;
function saveStoryProgress(patch) {
    try {
        const next = { ...getStoryProgress(), ...patch, updatedAt: Date.now() };
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(next));
        if (currentUser && currentUser.isCloud && isFirebaseReady && fbDb) {
            clearTimeout(storyCloudSaveTimer);
            storyCloudSaveTimer = setTimeout(() => pushStoryProgressToCloud(true), 1200);
        }
    } catch (_) {}
}
function getValidatedStoryProgress(source) {
    let previous = null;
    try {
        previous = localStorage.getItem(STORY_PROGRESS_KEY);
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(source || {}));
        const normalized = getStoryProgress();
        if (previous === null) localStorage.removeItem(STORY_PROGRESS_KEY);
        else localStorage.setItem(STORY_PROGRESS_KEY, previous);
        return normalized;
    } catch (_) {
        try {
            if (previous === null) localStorage.removeItem(STORY_PROGRESS_KEY);
            else localStorage.setItem(STORY_PROGRESS_KEY, previous);
        } catch (_) {}
        return getStoryProgress();
    }
}
async function pushStoryProgressToCloud(silent = true) {
    if (!currentUser || !currentUser.isCloud || !isFirebaseReady || !fbDb) return false;
    try {
        const progress = getStoryProgress();
        const payload = { ...progress, updatedAt: Math.max(Date.now(), progress.updatedAt || 0) };
        await fbDb.collection('storyProgress').doc(currentUser.uid).set(payload);
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(payload));
        localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
        if (!silent) showToast('☁️ Hikâye ilerlemen buluta kaydedildi.');
        return true;
    } catch (err) {
        console.error('[Story Cloud Save] failed:', err && err.code ? err.code : 'unknown', err);
        if (!silent) showToast('❌ Hikâye buluta kaydedilemedi; bu cihazdaki yerel kayıt korundu.');
        return false;
    }
}
async function pullStoryProgressFromCloud(silent = true) {
    if (!currentUser || !currentUser.isCloud || !isFirebaseReady || !fbDb) return false;
    try {
        const ref = fbDb.collection('storyProgress').doc(currentUser.uid);
        const snapshot = await ref.get();
        const localOwner = localStorage.getItem(STORY_PROGRESS_OWNER_KEY);
        const belongsToAnotherAccount = !!localOwner && localOwner !== currentUser.uid;
        const local = belongsToAnotherAccount ? null : getStoryProgress();
        if (!snapshot.exists) {
            if (local && local.updatedAt > 0) {
                await pushStoryProgressToCloud(true);
            } else if (belongsToAnotherAccount) {
                localStorage.removeItem(STORY_PROGRESS_KEY);
                localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
                updateStoryMissionBoard();
            } else {
                localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
            }
            return false;
        }
        const remote = getValidatedStoryProgress(snapshot.data());
        if (local && local.updatedAt > remote.updatedAt && local.updatedAt > 0) {
            await pushStoryProgressToCloud(true);
        } else {
            localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(remote));
            localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
            updateStoryMissionBoard();
        }
        return true;
    } catch (err) {
        console.error('[Story Cloud Pull] failed:', err && err.code ? err.code : 'unknown', err);
        if (!silent) showToast('❌ Hikâye bulut kaydı alınamadı; yerel ilerlemen korunuyor.');
        return false;
    }
}
function storyLanguage() { return getGameLanguage() === 'en' ? 'en' : 'tr'; }
function storyCopy(pair) { return pair[storyLanguage() === 'en' ? 1 : 0]; }
function applyStoryUiLanguage() {
    const en = storyLanguage() === 'en';
    document.querySelectorAll('[data-story-ui]').forEach(node => {
        const pair = STORY_UI_COPY[node.dataset.storyUi];
        if (pair) node.textContent = pair[en ? 1 : 0];
    });
    const chapterLabel = document.getElementById('story-chapter-label');
    if (chapterLabel && window.__storyBattle && window.__storyBattle.active && window.__storyBattle.mission >= 10) {
        chapterLabel.textContent = en ? 'CHAPTER 02 · BENEATH THE SIGNAL' : 'BÖLÜM 02 · SİNYALİN ALTINDA';
    }
    const next = document.getElementById('story-next');
    if (next) next.textContent = storyCopy(STORY_UI_COPY[storyMissionViewOpen ? 'start' : 'continue']);
    updateStoryMissionBoard();
}
let storyTypingTimer = null;
let storyTypingFullText = '';
function finishStoryTyping() {
    if (storyTypingTimer !== null) {
        clearInterval(storyTypingTimer);
        storyTypingTimer = null;
    }
    const copy = document.getElementById('story-dialogue-copy');
    if (copy) copy.textContent = storyTypingFullText;
}
function showStoryDialogue() {
    if (storyTypingTimer !== null) {
        clearInterval(storyTypingTimer);
        storyTypingTimer = null;
    }
    const line = STORY_DIALOGUES[storyDialogueIndex];
    if (!line) return;
    const en = storyLanguage() === 'en';
    const speaker = document.getElementById('story-speaker');
    const copy = document.getElementById('story-dialogue-copy');
    const progress = document.getElementById('story-progress');
    const next = document.getElementById('story-next');
    const bubble = document.getElementById('story-dialogue-bubble');
    const avatar = document.getElementById('story-avatar-glyph');
    const speakerText = line.speaker[en ? 'en' : 'tr'];
    storyTypingFullText = line.text[en ? 'en' : 'tr'];
    const isHologram = /HOLOGRAM|HOLOGRAMI|BLUE HOLOGRAM/.test(speakerText.toUpperCase());
    const isCommander = /KOMUTAN|COMMANDER/.test(speakerText.toUpperCase());
    const speakerKind = isHologram ? 'hologram' : (isCommander ? 'commander' : 'station');
    if (speaker) speaker.textContent = speakerText;
    if (bubble) bubble.dataset.speaker = speakerKind;
    if (avatar) avatar.textContent = isHologram ? '◈' : (isCommander ? '⌁' : '✦');
    if (copy) {
        copy.textContent = '';
        copy.setAttribute('aria-label', storyTypingFullText);
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            copy.textContent = storyTypingFullText;
        } else {
            let charIndex = 0;
            storyTypingTimer = setInterval(() => {
                if (!copy.isConnected) { clearInterval(storyTypingTimer); storyTypingTimer = null; return; }
                charIndex = Math.min(storyTypingFullText.length, charIndex + 2);
                copy.textContent = storyTypingFullText.slice(0, charIndex);
                if (charIndex >= storyTypingFullText.length) {
                    clearInterval(storyTypingTimer);
                    storyTypingTimer = null;
                }
            }, 18);
        }
    }
    if (progress) progress.textContent = String(storyDialogueIndex + 1).padStart(2, '0') + ' / ' + String(STORY_DIALOGUES.length).padStart(2, '0');
    if (next) {
        next.textContent = storyDialogueIndex === STORY_DIALOGUES.length - 1
            ? storyCopy(STORY_UI_COPY.start) : storyCopy(STORY_UI_COPY.continue);
        next.setAttribute('aria-label', en ? 'Continue dialogue' : 'Diyaloğu ilerlet');
    }
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
    const en = storyLanguage() === 'en';
    const m1 = document.getElementById('story-start-mission1');
    const s1 = document.getElementById('story-mission-1-status');
    if (m1) {
        m1.disabled = false;
        m1.textContent = progress.mission1Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →');
    }
    if (s1) s1.textContent = progress.mission1Complete ? (en ? 'CORE STABLE' : 'ÇEKİRDEK GÜVENDE') : (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV');
    const m2 = document.getElementById('story-start-mission2');
    const s2 = document.getElementById('story-mission-2-status');
    if (m2) {
        m2.disabled = !progress.mission1Complete;
        m2.textContent = progress.mission2Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →');
    }
    if (s2) {
        s2.classList.toggle('is-locked', !progress.mission1Complete && !progress.mission2Complete);
        s2.textContent = progress.mission2Complete ? (en ? 'SIGNAL TRACES RECOVERED' : 'SİNYAL İZLERİ KURTARILDI')
            : (progress.mission1Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV')
            : (en ? 'LOCKED · COMPLETE MISSION 01' : 'KİLİTLİ · 1. GÖREVİ TAMAMLA'));
    }
    const m3 = document.getElementById('story-start-mission3');
    const s3 = document.getElementById('story-mission-3-status');
    if (m3) {
        m3.disabled = !progress.mission2Complete;
        m3.textContent = progress.mission3Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'INVESTIGATE →' : 'İNCELE →');
    }
    if (s3) {
        s3.classList.toggle('is-locked', !progress.mission2Complete && !progress.mission3Complete);
        s3.textContent = progress.mission3Complete ? (en ? 'EVIDENCE LOGGED' : 'KANIT KAYDEDİLDİ')
            : (progress.mission2Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV')
            : (en ? 'LOCKED · COMPLETE MISSION 02' : 'KİLİTLİ · 2. GÖREVİ TAMAMLA'));
    }
    const m4 = document.getElementById('story-start-mission4');
    const s4 = document.getElementById('story-mission-4-status');
    if (m4) { m4.disabled = !progress.mission3Complete; m4.textContent = progress.mission4Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'RESTORE SYSTEMS →' : 'SİSTEMLERİ ONAR →'); }
    if (s4) { s4.classList.toggle('is-locked', !progress.mission3Complete && !progress.mission4Complete); s4.textContent = progress.mission4Complete ? (en ? 'POWER ROUTED' : 'GÜÇ YÖNLENDİRİLDİ') : (progress.mission3Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 03' : 'KİLİTLİ · 3. GÖREVİ TAMAMLA')); }
    const m5 = document.getElementById('story-start-mission5');
    const s5 = document.getElementById('story-mission-5-status');
    if (m5) { m5.disabled = !progress.mission4Complete; m5.textContent = progress.mission5Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →'); }
    if (s5) { s5.classList.toggle('is-locked', !progress.mission4Complete && !progress.mission5Complete); s5.textContent = progress.mission5Complete ? (en ? 'RELAY DISABLED' : 'RÖLE KAPATILDI') : (progress.mission4Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 04' : 'KİLİTLİ · 4. GÖREVİ TAMAMLA')); }
    const m6 = document.getElementById('story-start-mission6');
    const s6 = document.getElementById('story-mission-6-status');
    if (m6) { m6.disabled = !progress.mission5Complete; m6.textContent = progress.mission6Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BEGIN REPAIRS →' : 'ONARIMA BAŞLA →'); }
    if (s6) { s6.classList.toggle('is-locked', !progress.mission5Complete && !progress.mission6Complete); s6.textContent = progress.mission6Complete ? (en ? 'COMPANION STABLE' : 'YOLDAŞ STABİL') : (progress.mission5Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 05' : 'KİLİTLİ · 5. GÖREVİ TAMAMLA')); }
    const m7 = document.getElementById('story-start-mission7');
    const s7 = document.getElementById('story-mission-7-status');
    if (m7) { m7.disabled = !progress.mission6Complete; m7.textContent = progress.mission7Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEFEND ARRAY →' : 'DİZİYİ SAVUN →'); }
    if (s7) { s7.classList.toggle('is-locked', !progress.mission6Complete && !progress.mission7Complete); s7.textContent = progress.mission7Complete ? (en ? 'AMPLIFIER DISABLED' : 'YÜKSELTİCİ KAPATILDI') : (progress.mission6Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 06' : 'KİLİTLİ · 6. GÖREVİ TAMAMLA')); }
    const m8 = document.getElementById('story-start-mission8');
    const s8 = document.getElementById('story-mission-8-status');
    if (m8) { m8.disabled = !progress.mission7Complete; m8.textContent = progress.mission8Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'INSPECT →' : 'İNCELE →'); }
    if (s8) { s8.classList.toggle('is-locked', !progress.mission7Complete && !progress.mission8Complete); s8.textContent = progress.mission8Complete ? (en ? 'ECHO CONTRADICTION FOUND' : 'YANKI ÇELİŞKİSİ BULUNDU') : (progress.mission7Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 07' : 'KİLİTLİ · 7. GÖREVİ TAMAMLA')); }
    const m9 = document.getElementById('story-start-mission9');
    const s9 = document.getElementById('story-mission-9-status');
    if (m9) { m9.disabled = !progress.mission8Complete; m9.textContent = progress.mission9Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BEGIN AWAKENING →' : 'UYANIŞI BAŞLAT →'); }
    if (s9) { s9.classList.toggle('is-locked', !progress.mission8Complete && !progress.mission9Complete); s9.textContent = progress.mission9Complete ? (en ? 'CHAPTER 01 COMPLETE' : '1. BÖLÜM TAMAMLANDI') : (progress.mission8Complete ? (en ? 'PLAYABLE CLIMAX' : 'OYNANABİLİR FİNAL') : (en ? 'LOCKED · COMPLETE MISSION 08' : 'KİLİTLİ · 8. GÖREVİ TAMAMLA')); }
    const m10 = document.getElementById('story-start-mission10');
    const s10 = document.getElementById('story-mission-10-status');
    if (m10) { m10.disabled = !progress.mission9Complete; m10.textContent = progress.mission10Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE DOOR →' : 'KAPIYI AÇ →'); }
    if (s10) { s10.classList.toggle('is-locked', !progress.mission9Complete && !progress.mission10Complete); s10.textContent = progress.mission10Complete ? (en ? 'LIFT ACCESS VERIFIED' : 'ASANSÖR ERİŞİMİ DOĞRULANDI') : (progress.mission9Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 09' : 'KİLİTLİ · 9. GÖREVİ TAMAMLA')); }
    const m11 = document.getElementById('story-start-mission11');
    const m12 = document.getElementById('story-start-mission12');
    const s12 = document.getElementById('story-mission-12-status');
    const m13 = document.getElementById('story-start-mission13');
    const s13 = document.getElementById('story-mission-13-status');
    const m14 = document.getElementById('story-start-mission14');
    const s14 = document.getElementById('story-mission-14-status');
    const s11 = document.getElementById('story-mission-11-status');
    if (m11) { m11.disabled = !progress.mission10Complete; m11.textContent = progress.mission11Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DESCEND →' : 'AŞAĞI İN →'); }
    if (s11) {
        s11.classList.toggle('is-locked', !progress.mission10Complete && !progress.mission11Complete);
        s11.textContent = progress.mission11Complete ? (en ? 'LOWER NETWORK MAPPED' : 'ALT AĞ HARİTALANDI')
            : (progress.mission10Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR')
            : (en ? 'LOCKED · COMPLETE MISSION 10' : 'KİLİTLİ · 10. GÖREVİ TAMAMLA'));
    }
    if (m12) { m12.disabled = !progress.mission11Complete; m12.textContent = progress.mission12Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE ARCHIVE →' : 'ARŞİVİ AÇ →'); }
    if (s12) {
        s12.classList.toggle('is-locked', !progress.mission11Complete && !progress.mission12Complete);
        s12.textContent = progress.mission12Complete ? (en ? 'MEMORY CONFLICT CONFIRMED' : 'HAFIZA ÇELİŞKİSİ DOĞRULANDI')
            : (progress.mission11Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR')
            : (en ? 'LOCKED · COMPLETE MISSION 11' : 'KİLİTLİ · 11. GÖREVİ TAMAMLA'));
    }
    if (m13) { m13.disabled = !progress.mission12Complete; m13.textContent = progress.mission13Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'CHECK THE RECORDS →' : 'KAYITLARI İNCELE →'); }
    if (s13) { s13.classList.toggle('is-locked', !progress.mission12Complete && !progress.mission13Complete); s13.textContent = progress.mission13Complete ? (en ? 'VOICEPRINT DECISION RECORDED' : 'SES İZİ KARARI KAYDEDİLDİ') : (progress.mission12Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 12' : 'KİLİTLİ · 12. GÖREVİ TAMAMLA')); }
    if (m14) { m14.disabled = !progress.mission13Complete; m14.textContent = progress.mission14Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BREACH THE CORE →' : 'ÇEKİRDEĞE İLERLE →'); }
    if (s14) { s14.classList.toggle('is-locked', !progress.mission13Complete && !progress.mission14Complete); s14.textContent = progress.mission14Complete ? (en ? 'CORE SIGNAL TRACED' : 'ÇEKİRDEK SİNYALİ İZLENDİ') : (progress.mission13Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 13' : 'KİLİTLİ · 13. GÖREVİ TAMAMLA')); }
    const m15 = document.getElementById('story-start-mission15');
    const s15 = document.getElementById('story-mission-15-status');
    if (m15) { m15.disabled = !progress.mission14Complete; m15.textContent = progress.mission15Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'STABILIZE PIKO →' : 'PİKO’YU DENGELE →'); }
    if (s15) { s15.classList.toggle('is-locked', !progress.mission14Complete && !progress.mission15Complete); s15.textContent = progress.mission15Complete ? (en ? 'MEMORY LOSS ACKNOWLEDGED' : 'KAYIP ANI KABUL EDİLDİ') : (progress.mission14Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 14' : 'KİLİTLİ · 14. GÖREVİ TAMAMLA')); }
    document.querySelectorAll('.story-mission-status.is-locked').forEach(node => {
        if (!['story-mission-2-status','story-mission-3-status','story-mission-4-status','story-mission-5-status','story-mission-6-status','story-mission-7-status','story-mission-8-status','story-mission-9-status','story-mission-10-status','story-mission-11-status','story-mission-12-status','story-mission-13-status','story-mission-14-status','story-mission-15-status'].includes(node.id)) node.textContent = en ? 'LOCKED · NEXT UPDATE' : 'KİLİTLİ · SONRAKİ AŞAMA';
    });

    // Campaign progress is presentation-only: it reads story flags and never mutates saves.
    const completedCount = Array.from({ length: 15 }, (_, index) => Boolean(progress['mission' + (index + 1) + 'Complete'])).filter(Boolean).length;
    const progressLabel = document.getElementById('story-campaign-progress-label');
    const progressCount = document.getElementById('story-campaign-progress-count');
    const progressFill = document.getElementById('story-campaign-progress-fill');
    const progressTrack = document.getElementById('story-campaign-progress-track');
    if (progressLabel) progressLabel.textContent = en ? 'CAMPAIGN SYNCHRONIZED' : 'HİKÂYE İLERLEMESİ';
    if (progressCount) progressCount.textContent = en ? (completedCount + ' / 15 MISSIONS') : (completedCount + ' / 15 GÖREV');
    if (progressFill) progressFill.style.width = ((completedCount / 15) * 100) + '%';
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completedCount));

    let nextMission = 0;
    for (let missionNumber = 1; missionNumber <= 15; missionNumber++) {
        if (!progress['mission' + missionNumber + 'Complete']) { nextMission = missionNumber; break; }
    }
    document.querySelectorAll('[id^="story-start-mission"]').forEach(button => {
        const match = button.id.match(/^story-start-mission(\d+)$/);
        if (!match) return;
        const missionNumber = Number(match[1]);
        const card = button.closest('.story-mission');
        if (!card) return;
        const complete = Boolean(progress['mission' + missionNumber + 'Complete']);
        card.classList.toggle('is-complete', complete);
        card.classList.toggle('is-current', !complete && missionNumber === nextMission && !button.disabled);
        card.classList.toggle('is-locked-card', button.disabled && !complete);
        if (complete) card.setAttribute('data-mission-state', en ? 'COMPLETE' : 'TAMAM');
        else if (!button.disabled) card.setAttribute('data-mission-state', en ? 'AVAILABLE' : 'HAZIR');
        else card.removeAttribute('data-mission-state');
    });
}
function setStoryComms(speakerTr, speakerEn, textTr, textEn) {
    const speaker = document.getElementById('story-comms-speaker');
    const line = document.getElementById('story-comms-line');
    const en = storyLanguage() === 'en';
    if (speaker) speaker.textContent = en ? speakerEn : speakerTr;
    if (line) line.textContent = en ? textEn : textTr;
}
function storyDeepCopy(value) { return JSON.parse(JSON.stringify(value)); }
function storyMissionPrerequisiteMet(missionNumber, progress) {
    const prerequisiteByMission = {
        2: 'mission1Complete',
        3: 'mission2Complete',
        4: 'mission3Complete',
        5: 'mission4Complete',
        6: 'mission5Complete',
        7: 'mission6Complete',
        8: 'mission7Complete',
        9: 'mission8Complete',
        10: 'mission9Complete',
        11: 'mission10Complete',
        12: 'mission11Complete',
        13: 'mission12Complete',
        14: 'mission13Complete',
        15: 'mission14Complete'
    };
    const requiredProgressFlag = prerequisiteByMission[missionNumber];
    return !requiredProgressFlag || progress[requiredProgressFlag] === true;
}
function startStoryMission(missionNumber = 1) {
    const progress = getStoryProgress();
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(missionNumber)) return;
    // Enforce mission order in the handler as well as the disabled UI buttons.
    // This prevents direct calls from bypassing the chapter's narrative gates.
    if (!storyMissionPrerequisiteMet(missionNumber, progress)) {
        showToast(storyLanguage() === 'en'
            ? 'Complete the previous mission before deploying this one.'
            : 'Bu göreve geçmeden önce bir önceki görevi tamamlamalısın.');
        return;
    }
    // Clean up a completed session before checking the Endless unlock requirement:
    // while the story sandbox is active, game.wave is the mission wave, not the saved Endless wave.
    // Never auto-abort an unfinished mission.
    if (window.__storyBattle?.active) {
        if (!window.__storyBattle.completed) return;
        exitStoryBattle(false);
    }
    if (!updateStoryUnlockUI()) {
        showToast(storyLanguage() === 'en' ? 'Clear 25 waves in Endless Mode first.' : 'Önce Sonsuz Mod’da 25 dalgayı tamamlamalısın.');
        return;
    }
    const session = {
        active: true, completed: false, companionSynced: false, mission: missionNumber, phase: missionNumber === 3 ? 'investigate' : (missionNumber === 4 ? 'powerChoice' : (missionNumber === 6 ? 'repair' : (missionNumber === 8 ? 'memory' : 'combat'))), scans: 0, repairs: 0, memories: 0, routeChoice: null,
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
    // Set the mode before deriving HP, shield, and damage so Endless bonuses cannot leak into this mission.
    document.body.dataset.gameMode = 'story';
    game = getDefaultState();
    game.wave = 1; game.highestWave = 1; game.gold = 180;
    game.waveKills = 0; game.waveTargetKills = missionNumber === 1 ? 8 : (missionNumber === 5 ? 8 : (missionNumber === 7 ? 8 : (missionNumber === 9 ? 10 : (missionNumber === 10 ? 6 : (missionNumber === 11 ? 8 : (missionNumber === 12 ? 6 : (missionNumber === 13 ? 7 : (missionNumber === 14 ? 12 : (missionNumber === 15 ? 6 : 5))))))))); game.holdWave = false;
    // Story missions use a deterministic loadout, never the endless-mode save's upgrades/items.
    game.upgrades.damage = 3; game.upgrades.attackSpeed = 2; game.upgrades.range = 3;
    game.upgrades.critChance = 0; game.upgrades.critMult = 1; game.upgrades.multishot = 0;
    game.upgrades.bounce = 0; game.upgrades.knockback = 0; game.upgrades.maxHp = 1;
    game.upgrades.hpRegen = 1; game.upgrades.armor = 0; game.upgrades.thorns = 0;
    game.upgrades.shield = 0; game.upgrades.lifesteal = 0; game.upgrades.goldBonus = 0;
    game.upgrades.waveGold = 0; game.upgrades.crystalChance = 0; game.upgrades.interest = 0;
    game.inventory = []; game.equippedItems = [];
    game.prestigeUpgrades = { permDamage: 0, permGold: 0, companionBoost: 0, costDiscount: 0, startWave: 0 };
    game.lootboxBonuses = { extraDamagePct: 0, extraGoldPct: 0, totalOpened: 0 };
    if (missionNumber === 5 && progress.powerChoice === 'weapon') game.upgrades.damage = 5;
    game.settings.activeTheme = 'space';
    tower = {
        x: canvas.width / 2, y: canvas.height / 2, hp: 100, maxHp: 100, shield: 0, maxShield: 0,
        fireCooldown: 0, angle: 0, recoil: 0, freezeTimer: 0, freezeImmunityTimer: 0,
        frostSlowTimer: 0, frostVisualTick: 0, overdriveTimer: 0, overdriveVisualTick: 0
    };
    tower.maxHp = getTowerMaxHp(); tower.hp = tower.maxHp;
    tower.maxShield = getTowerMaxShield(); tower.shield = tower.maxShield;
    if (missionNumber === 5 && progress.powerChoice === 'shield') { tower.maxShield += 30; tower.shield = tower.maxShield; }
    enemies = []; projectiles = []; particles = []; floatingTexts = [];
    lightningBeams = []; rings = []; cargoDrones = [];
    spawnTimer = 0; playTimeAccum = 0; waveFrostSpawns = 0; cargoSpawnTimer = 999999;
    gameSpeed = 1; isPaused = [3, 4, 6, 8].includes(missionNumber); isDefeated = false; defeatTimer = 0;
    document.body.dataset.gameMode = 'story';
    // Rebuild upgrade controls against the fresh mission state, not the previous Endless Mode save.
    if (typeof buildUpgradesUI === 'function') buildUpgradesUI();
    if (typeof buildInventoryUI === 'function') buildInventoryUI();
    if (typeof applyBodyClasses === 'function') applyBodyClasses();
    const screen = document.getElementById('story-mode-screen');
    if (screen) { screen.classList.remove('is-open'); screen.setAttribute('aria-hidden', 'true'); }
    const hud = document.getElementById('story-battle-hud');
    if (hud) { hud.hidden = false; hud.classList.add('is-active'); }
    const chapterLabel = document.getElementById('story-chapter-label');
    if (chapterLabel) chapterLabel.textContent = missionNumber >= 10
        ? (storyLanguage() === 'en' ? 'CHAPTER 02 · BENEATH THE SIGNAL' : 'BÖLÜM 02 · SİNYALİN ALTINDA')
        : (storyLanguage() === 'en' ? 'CHAPTER 01 · LOST SIGNAL' : 'BÖLÜM 01 · KAYIP SİNYAL');
    const commsByMission = {
        1: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Savunma protokolü çöktü. Çekirdek yeniden güç kazanıyor; komutan, ilk teması karşıla.','Defense protocol has collapsed. The core is regaining power; Commander, prepare for first contact.'],
        2: ['PİKO','PIKO','Sinyal gövdede üç noktada yankılanıyor. Tehlike geçince izleri birlikte tarayalım.','The signal echoes at three points in the hull. Once the threat passes, let us scan the traces.'],
        3: ['KOMUTAN','COMMANDER','Anten sinyali mi tekrarlıyor, yoksa karakutu bunu daha önce mi duymuş? Bir kaydı seçmeliyiz.','Is the antenna repeating the signal, or did the black box hear it first? We need to inspect one record.'],
        4: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Güç rezervi tek bir sistemi tam onarabilir. Kalkan daha güvenli, silah kalibrasyonu daha hızlı sonuç verir.','The reserve can fully restore only one system. Shields are safer; weapon calibration is faster.'],
        5: ['KOMUTAN','COMMANDER','Seçim yapıldı. Koridoru açıp röleyi susturacağız. Bu sinyalin başka bir yere yayılmasına izin veremeyiz.','The choice is made. We will clear the corridor and silence the relay. This signal cannot be allowed to spread.'],
        6: ['PİKO','PIKO','Burada üç bağlantı kopmuş. Ben panelleri işaretleyeceğim. Sen onarımı tamamla.','Three connections are severed here. I will mark the panels. You complete the repairs.'],
        7: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Haberleşme dizisi sinyali güçlendiriyor. Savunmayı sürdür; yükselticiyi kapatırsak kaynağın yönünü bulabiliriz.','The communications array is amplifying the signal. Hold the defense; shutting down the amplifier may reveal its origin.'],
        8: ['KOMUTAN','COMMANDER','Bu oda aynı oda. Ama kayıtlar birbirini tutmuyor. Mavi görüntü bir şeyi hatırlıyor—istasyon ise bunun yaşanmadığını söylüyor.','This is the same room. But the records contradict each other. The blue image remembers something—the station insists it never happened.'],
        9: ['PİKO','PIKO','Bağlantı kopuyor… Komutan, çekirdeği koru. Bu kez kaçmayacağım. Ne olduğumu hatırlamaya hazırım.','The link is breaking… Commander, protect the core. I will not retreat this time. I am ready to remember what I am.'],
        10: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Alt kat planlarda görünmüyor. Burada yalnızca taşıyıcı kiriş olması gerekiyordu.','There is no lower level on the schematics. This should be a load-bearing strut.'],
        11: ['PİKO','PIKO','Aşağıdaki ağ istasyondan eski. Lütfen bunun normal olduğunu söyle; ben söyleyemiyorum.','The network below predates the station. Please tell me that is normal; I cannot.'],
        12: ['PİKO','PIKO','Arşivde benim için bir kayıt var. Garip olan, kaydın tarihinin benim çekirdeğimden daha eski olması değil… içindeki sesin benim sesim olmaması.','There is a record for me in the archive. The strange part is not that it predates my core… it is that the voice inside is not mine.'],
        13: ['PİKO','PIKO','İnsan kaydındaki ses benim ses izimle eşleşiyor. Ama anılarımda o insan yok. Hangimize inanmalıyım?','The human recording matches my voiceprint. But that person is not in my memories. Which account should I believe?'],
        14: ['PİKO','PIKO','Sinyal çekirdeğin içinden geliyor. Ne olursa olsun bu kez gerçeği birlikte bulacağız.','The signal is coming from inside the core. Whatever happens, we will find the truth together this time.'],
        15: ['PİKO','PIKO','Sinyal darbesi hâlâ içimde yankılanıyor. Önce sistemi dengelemeliyiz; sonra sana neyi kaybettiğimi anlatacağım.','The pulse is still echoing inside me. We need to stabilize the systems first; then I will tell you what I lost.']
    };
    const openingLine = commsByMission[missionNumber];
    if (openingLine) setStoryComms(...openingLine);
    // Piko is the same companion from the opening scene; make him speak as the mission begins.
    if (typeof window.pikoStoryEvent === 'function') window.pikoStoryEvent('missionStart', missionNumber);
    if (missionNumber === 14 && progress.voiceChoice === 'human') {
        setStoryComms('PİKO','PIKO','İnsan kaydına güvendiğin için bir şeyler hatırlıyorum. Bu sinyalin arkasında gerçekten biri var.','Because you trusted the human record, I am remembering something. Someone really is behind this signal.');
    } else if (missionNumber === 14 && progress.voiceChoice === 'station') {
        setStoryComms('PİKO','PIKO','İstasyon arşivini seçtin. O zaman önce sahte imzanın kaynağını bulalım.','You chose the station archive. Then let us find who forged its signature first.');
    }
    if (missionNumber === 5 && progress.routeChoice === 'array') {
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Anten kaydı sinyalin istasyonun içinden döndüğünü gösterdi. Röleyi susturursak döngüyü kesebiliriz.','The antenna log showed the signal looping from inside the station. Silencing the relay may break the loop.');
    } else if (missionNumber === 5 && progress.routeChoice === 'blackbox') {
        setStoryComms('PİKO','PIKO','Karakutudaki ses benim ses izimle eşleşiyor. Bu mümkün olmamalı…','The voice in the black box matches my voiceprint. That should not be possible…');
    }
    const status = document.getElementById('story-battle-status');
    if (status) {
        if (missionNumber === 1) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles and stabilize the core.' : 'GÖREV: 8 düşmanı durdur ve çekirdeği güvene al.';
        else if (missionNumber === 2) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Stop 5 patrol units, then scan 3 signal traces.' : 'GÖREV: 5 devriye birimini durdur, ardından 3 sinyal izini tara.';
        else if (missionNumber === 3) status.textContent = storyLanguage() === 'en' ? 'INVESTIGATION: Choose a data source to trace the signal.' : 'İNCELEME: Sinyalin izini sürmek için bir veri kaynağı seç.';
        else if (missionNumber === 4) status.textContent = storyLanguage() === 'en' ? 'POWER ROUTING: Choose shields or weapons. This affects your next defense.' : 'GÜÇ DAĞITIMI: Kalkanı veya silahı seç. Seçimin bir sonraki savunmayı etkileyecek.';
        else if (missionNumber === 5) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, hold off 10 reinforcements, then disable the signal relay.' : 'GÖREV: 8 düşmanı durdur, 10 takviyeyi püskürt, ardından sinyal rölesini kapat.';
        else if (missionNumber === 6) status.textContent = storyLanguage() === 'en' ? 'REPAIR: Restore three connections while the companion guides you.' : 'ONARIM: Yoldaş sana rehberlik ederken üç bağlantıyı onar.';
        else if (missionNumber === 7) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, hold off 10 reinforcements, then disable the signal amplifier.' : 'GÖREV: 8 düşmanı durdur, 10 takviyeyi püskürt, ardından sinyal yükselticisini kapat.';
        else if (missionNumber === 8) status.textContent = storyLanguage() === 'en' ? 'MEMORY REVIEW: Inspect three clues in the familiar room.' : 'HAFIZA İNCELEMESİ: Tanıdık odadaki üç ipucunu incele.';
        else if (missionNumber === 9) status.textContent = storyLanguage() === 'en' ? 'CLIMAX: Defeat 10 hostiles, reconnect with the companion, then awaken it.' : 'FİNAL: 10 düşmanı durdur, yoldaşla bağlantıyı kur ve onu uyandır.';
        else if (missionNumber === 10) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then use the cyan pulse to reveal and activate two hidden nodes.' : 'GÖREV: 6 düşmanı durdur, ardından camgöbeği darbeyle iki gizli düğümü açığa çıkarıp etkinleştir.';
        else if (missionNumber === 11) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, then pulse three ancient relays to map the lower network.' : 'GÖREV: 8 düşmanı durdur, ardından üç kadim röleye sinyal darbesi göndererek alt ağı haritala.';
        else if (missionNumber === 12) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then inspect three conflicting archive records.' : 'GÖREV: 6 düşmanı durdur, ardından birbiriyle çelişen üç arşiv kaydını incele.';
        else if (missionNumber === 13) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 7 hostiles, listen to two conflicting testimonies, and choose which record to trust.' : 'GÖREV: 7 düşmanı durdur, çelişen iki tanıklığı dinle ve hangi kayda güveneceğini seç.';
        else if (missionNumber === 14) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 12 hostiles, then disarm three core seals.' : 'GÖREV: 12 düşmanı durdur, ardından çekirdeğin üç kilidini aç.';
        else if (missionNumber === 15) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then repair three systems damaged by signal feedback.' : 'GÖREV: 6 düşmanı durdur, ardından sinyal geri beslemesinin bozduğu üç sistemi onar.';
        else status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat the hostiles.' : 'GÖREV: Düşmanları durdur.';
    }
    const action = document.getElementById('story-scan-action');
    if (action) action.hidden = true;
    const investigation = document.getElementById('story-investigation-actions');
    if (investigation) investigation.hidden = missionNumber !== 3;
    const powerChoices = document.getElementById('story-power-actions');
    if (powerChoices) powerChoices.hidden = missionNumber !== 4;
    const relay = document.getElementById('story-relay-action');
    if (relay) relay.hidden = true;
    const repair = document.getElementById('story-repair-action'); if (repair) repair.hidden = missionNumber !== 6;
    const amplifier = document.getElementById('story-amplifier-action'); if (amplifier) amplifier.hidden = true;
    const memory = document.getElementById('story-memory-action'); if (memory) memory.hidden = missionNumber !== 8;
    const reconnect = document.getElementById('story-reconnect-action'); if (reconnect) reconnect.hidden = true;
    const awaken = document.getElementById('story-awaken-action'); if (awaken) awaken.hidden = true;
    const pulse = document.getElementById('story-pulse-action'); if (pulse) pulse.hidden = true;
    const mission10Pulse = document.getElementById('story-mission10-pulse-action'); if (mission10Pulse) mission10Pulse.hidden = true;
    const mission11Pulse = document.getElementById('story-mission11-pulse-action'); if (mission11Pulse) mission11Pulse.hidden = true;
    const archiveAction = document.getElementById('story-mission12-archive-action'); if (archiveAction) archiveAction.hidden = true;
    const voiceAction = document.getElementById('story-mission13-record-action'); if (voiceAction) voiceAction.hidden = true;
    const trustHuman = document.getElementById('story-mission13-trust-human'); if (trustHuman) trustHuman.hidden = true;
    const trustStation = document.getElementById('story-mission13-trust-station'); if (trustStation) trustStation.hidden = true;
    const coreSeal = document.getElementById('story-mission14-seal-action'); if (coreSeal) coreSeal.hidden = true;
    const mission15Repair = document.getElementById('story-mission15-repair-action'); if (mission15Repair) mission15Repair.hidden = true;
    const companionChip = document.getElementById('story-companion-chip');
    const companionIcon = document.getElementById('story-companion-icon');
    const companionState = document.getElementById('story-companion-state');
    if (companionChip) companionChip.classList.remove('is-synced');
    if (companionIcon) companionIcon.textContent = '⚙';
    if (companionState) companionState.textContent = missionNumber === 1
        ? (storyLanguage() === 'en' ? 'LOW POWER · LINKING TO CORE' : 'DÜŞÜK GÜÇ · ÇEKİRDEĞE BAĞLANIYOR')
        : (storyLanguage() === 'en' ? 'SCANNING SUPPORT · LOW POWER' : 'TARAMA DESTEĞİ · DÜŞÜK GÜÇ');
    if (missionNumber === 10) {
        if (companionChip) companionChip.classList.add('is-synced');
        if (companionIcon) companionIcon.textContent = '✦';
        if (companionState) companionState.textContent = storyLanguage() === 'en' ? 'CYAN FORM · SIGNAL STABLE' : 'CAMGÖBEĞİ FORM · SİNYAL KARARLI';
    }
    const exit = document.getElementById('story-battle-exit');
    if (exit) exit.textContent = storyLanguage() === 'en' ? 'ABORT MISSION' : 'GÖREVDEN ÇIK';
    if (typeof resizeCanvas === 'function') resizeCanvas();
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof refreshUpgradeButtonsState === 'function') refreshUpgradeButtonsState();
    if (typeof updateHoldWaveButton === 'function') updateHoldWaveButton();
    if (missionNumber === 1) showToast(storyLanguage() === 'en' ? 'Lost Signal · Mission 01. Your core fires automatically; use the upgrade panel if needed.' : 'Kayıp Sinyal · Görev 01. Çekirdeğin otomatik ateş ediyor; gerekirse yükseltme panelini kullan.');
    else if (missionNumber === 2) showToast(storyLanguage() === 'en' ? 'Mission 02 · Clear the patrol. The companion will help scan the signal traces.' : 'Görev 02 · Devriyeyi durdur. Yoldaş sinyal izlerini taramana yardım edecek.');
    else if (missionNumber === 3) showToast(storyLanguage() === 'en' ? 'Mission 03 · Choose which record to inspect.' : 'Görev 03 · Hangi kaydı inceleyeceğini seç.');
    else if (missionNumber === 4) showToast(storyLanguage() === 'en' ? 'Mission 04 · Route power to one subsystem.' : 'Görev 04 · Gücü iki sistemden birine yönlendir.');
    else if (missionNumber === 5) showToast(storyLanguage() === 'en' ? 'Mission 05 · Your power-routing choice changes this defense.' : 'Görev 05 · Güç dağıtımı kararın bu savunmayı değiştiriyor.');
    else if (missionNumber === 6) showToast(storyLanguage() === 'en' ? 'Mission 06 · Follow the companion’s repair markers.' : 'Görev 06 · Yoldaşın onarım işaretlerini takip et.');
    else if (missionNumber === 7) showToast(storyLanguage() === 'en' ? 'Mission 07 · Hold the communications array.' : 'Görev 07 · Haberleşme dizisini koru.');
    else if (missionNumber === 8) showToast(storyLanguage() === 'en' ? 'Mission 08 · Look for contradictions between memory and the room.' : 'Görev 08 · Hafıza ile oda arasındaki çelişkileri ara.');
    else if (missionNumber === 9) showToast(storyLanguage() === 'en' ? 'Mission 09 · This is the final defense of Chapter 01.' : 'Görev 09 · Bu, 1. bölümün son savunması.');
    else if (missionNumber === 10) showToast(storyLanguage() === 'en' ? 'Mission 10 · The door is reacting to the companion. Calibrate the pulse, then reveal the hidden nodes.' : 'Görev 10 · Kapı yoldaşa tepki veriyor. Darbeyi ayarla, sonra gizli düğümleri açığa çıkar.');
    else if (missionNumber === 11) showToast(storyLanguage() === 'en' ? 'Mission 11 · The lower network is awake. Clear the way, then map its three relays.' : 'Görev 11 · Alt ağ uyandı. Önce yolu temizle, sonra üç röleyi haritala.');
    else if (missionNumber === 12) showToast(storyLanguage() === 'en' ? 'Mission 12 · Clear the archive guards, then inspect all three records.' : 'Görev 12 · Arşiv muhafızlarını durdur, ardından üç kaydı incele.');
    else if (missionNumber === 15) showToast(storyLanguage() === 'en' ? 'Mission 15 · Stabilize Piko after the pulse feedback. The missing memory may not return.' : 'Görev 15 · Sinyal geri beslemesinden sonra Piko’yu dengele. Kayıp anı geri dönmeyebilir.');
}
function finishStoryBattleEncounter() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.completed) return;
    const en = storyLanguage() === 'en';
    const setStatus = text => { const el = document.getElementById('story-battle-status'); if (el) el.textContent = text; };
    const setAction = (id, hidden, label) => { const el = document.getElementById(id); if (el) { el.hidden = hidden; if (label) el.textContent = label; } };
    const setExit = label => { const el = document.getElementById('story-battle-exit'); if (el) el.textContent = label; };

    if (session.mission === 4 && session.phase === 'powerChoice') return;

    if (session.mission === 12 && session.phase === 'combat') {
        session.phase = 'archive1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARCHIVE ACCESS · Inspect the first record. Its timestamp is impossible.' : 'ARŞİV ERİŞİMİ · İlk kaydı incele. Zaman damgası imkânsız.');
        setStoryComms('PIKO','PIKO','Bu dosya benden eski. Ama neden kayıtta benimle konuşuyorlar?','This file is older than me. So why are they talking to me in it?');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 1 / 3' : 'KAYDI İNCELE 1 / 3');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive1') {
        session.phase = 'archive2';
        setStatus(en ? 'RECORD 1 · The archive calls Piko “Operator Zero”, decades before the station was built.' : '1. KAYIT · Arşiv, istasyon kurulmadan onlarca yıl önce Piko’ya “Operatör Sıfır” diyor.');
        setStoryComms('STATION AI','STATION AI','Bu unvan mevcut personel kayıtlarında bulunmuyor.','That designation does not exist in current personnel records.');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 2 / 3' : 'KAYDI İNCELE 2 / 3');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive2') {
        session.phase = 'archive3';
        setStatus(en ? 'RECORD 2 · A voiceprint matches Piko’s shell, but the speaker identifies as human.' : '2. KAYIT · Ses izi Piko’nun gövdesiyle eşleşiyor; ancak konuşan kendini insan olarak tanımlıyor.');
        setStoryComms('PIKO','PIKO','Benim sesim değil bu. Yani… öyle olmaması gerekiyor.','That is not my voice. I mean… it should not be.');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 3 / 3' : 'KAYDI İNCELE 3 / 3');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive3') {
        session.phase = 'complete'; session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission11Complete: true, mission12Complete: true });
        setStatus(en ? 'CONTRADICTION CONFIRMED · The final file contains tomorrow’s date and Piko’s distress signal.' : 'ÇELİŞKİ DOĞRULANDI · Son dosyada yarının tarihi ve Piko’nun yardım sinyali var.');
        setStoryComms('BİLİNMEYEN KAYNAK','UNKNOWN SOURCE','Piko’yu bize kim gönderdi?','Who sent Piko to us?');
        setAction('story-mission12-archive-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 12 complete. Archive contradiction recorded.' : '12. görev tamamlandı. Arşiv çelişkisi kaydedildi.');
        return;
    }
    if (session.mission === 13 && session.phase === 'combat') {
        session.phase = 'voice1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'VOICEPRINT MATCH · Two archived testimonies disagree about the human speaker.' : 'SES İZİ EŞLEŞTİ · İnsan konuşmacı hakkında iki arşiv kaydı çelişiyor.');
        setStoryComms('PIKO','PIKO','Bu sesin bana ait olamayacağını söylemek istiyorum. Ama sonundaki nefesi tanıyorum.','I want to say this voice cannot be mine. But I recognize the breath at the end.');
        setAction('story-mission13-record-action', false, en ? 'PLAY RECORD 1 / 2' : '1 / 2. KAYDI DİNLE');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 13 && session.phase === 'voice1') {
        session.phase = 'voice2';
        setStatus(en ? 'RECORD 1 · A human technician says Piko was built after the station incident.' : '1. KAYIT · İnsan teknisyen, Piko’nun istasyon kazasından sonra üretildiğini söylüyor.');
        setStoryComms('STATION AI','STATION AI','Bu ifade resmi zaman çizelgesiyle uyumlu. Ancak imza sonradan eklenmiş olabilir.','This matches the official timeline. However, the signature may have been added later.');
        setAction('story-mission13-record-action', false, en ? 'PLAY RECORD 2 / 2' : '2 / 2. KAYDI DİNLE'); return;
    }
    if (session.mission === 13 && session.phase === 'voice2') {
        session.phase = 'voiceChoice';
        setStatus(en ? 'RECORD 2 · The same voice claims Piko was the only survivor, before the station existed.' : '2. KAYIT · Aynı ses, Piko’nun istasyon kurulmadan önce tek kurtulan olduğunu söylüyor.');
        setStoryComms('PIKO','PIKO','İkisi birden doğru olamaz. Komutan… hangisine inanıyorsun?','They cannot both be true. Commander… which one do you believe?');
        setAction('story-mission13-record-action', true);
        setAction('story-mission13-trust-human', false, en ? 'TRUST THE HUMAN RECORD' : 'İNSAN KAYDINA GÜVEN');
        setAction('story-mission13-trust-station', false, en ? 'TRUST THE STATION ARCHIVE' : 'İSTASYON ARŞİVİNE GÜVEN'); return;
    }
    if (session.mission === 14 && session.phase === 'combat') {
        session.phase = 'coreSeal1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORE DEFENSE BROKEN · Three seals protect the signal source.' : 'ÇEKİRDEK SAVUNMASI AŞILDI · Sinyal kaynağını üç kilit koruyor.');
        setStoryComms('PIKO','PIKO','Bunlar savunma kilitleri değil. Bir şeyin içeride kalmasını sağlıyorlar.','These are not defense locks. They are keeping something inside.');
        setAction('story-mission14-seal-action', false, en ? 'DISARM SEAL 1 / 3' : '1 / 3. KİLİDİ AÇ');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal1') {
        session.phase = 'coreSeal2'; setStatus(en ? 'SEAL 1 DISARMED · A pulse answers from inside the core.' : '1. KİLİT AÇILDI · Çekirdeğin içinden sinyal cevap veriyor.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Piko… beni duyabiliyor musun?','Piko… can you hear me?');
        setAction('story-mission14-seal-action', false, en ? 'DISARM SEAL 2 / 3' : '2 / 3. KİLİDİ AÇ'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal2') {
        session.phase = 'coreSeal3'; setStatus(en ? 'SEAL 2 DISARMED · The voiceprint matches the impossible archive.' : '2. KİLİT AÇILDI · Ses izi imkânsız arşivle eşleşiyor.');
        setStoryComms('PIKO','PIKO','Bu ses arşivdeki insan. Neden beni adıyla çağırıyor?','That is the human from the archive. Why are they calling me by name?');
        setAction('story-mission14-seal-action', false, en ? 'DISARM FINAL SEAL' : 'SON KİLİDİ AÇ'); return;
    }
    if (session.mission === 15 && session.phase === 'combat') {
        session.phase = 'repairSystem1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'FEEDBACK DAMAGE · Three systems are unstable. Repair the first before Piko loses more signal integrity.' : 'GERİ BESLEME HASARI · Üç sistem kararsız. Piko daha fazla sinyal bütünlüğü kaybetmeden ilkini onar.');
        setStoryComms('PIKO','PIKO','Sinyal bana bir anıyı geri verdi. Sonra başka bir şeyi aldı. İlk onarımı yapalım… sana söylemem gereken bir şey var.','The pulse gave me a memory for a moment. Then it took something else. Let’s repair the first system… there is something I need to tell you.');
        setAction('story-mission15-repair-action', false, en ? 'REPAIR SYSTEM 1 / 3' : '1 / 3. SİSTEMİ ONAR');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 15 && ['repairSystem1','repairSystem2','repairSystem3'].includes(session.phase)) {
        const repairIndex = Number(session.phase.slice(-1));
        if (repairIndex < 3) {
            session.phase = 'repairSystem' + (repairIndex + 1);
            const nextLabel = en ? 'REPAIR SYSTEM ' + (repairIndex + 1) + ' / 3' : (repairIndex + 1) + ' / 3. SİSTEMİ ONAR';
            setStatus(en ? 'SYSTEM ' + repairIndex + ' RESTORED · Feedback is falling, but one memory channel remains empty.' : repairIndex + '. SİSTEM ONARILDI · Geri besleme azalıyor ama bir hafıza kanalı boş kaldı.');
            setStoryComms('PIKO','PIKO','Hatırlamaya çalışıyorum… sesini duyuyorum ama yüzünü değil. Devam edelim.','I am trying to remember… I can hear the voice, but not the face. Keep going.');
            setAction('story-mission15-repair-action', false, nextLabel); return;
        }
        session.phase = 'complete'; session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission14Complete: true, mission15Complete: true });
        setStatus(en ? 'SYSTEMS STABLE · Piko has told you what the pulse cost. The missing memory remains missing.' : 'SİSTEMLER KARARLI · Piko, sinyal darbesinin bedelini sana anlattı. Kayıp anı hâlâ geri gelmedi.');
        setStoryComms('PIKO','PIKO','Bir anıyı kaybettim. Hangisi olduğunu bilmiyorum. Bunu senden saklayabilirdim… ama güven, sadece doğru cevapları vermek değil. Bazen neyi bilmediğini söylemektir.','I lost a memory. I do not know which one. I could have hidden that from you… but trust is not just giving the right answers. Sometimes it means admitting what you do not know.');
        setAction('story-mission15-repair-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 15 complete. Piko’s memory loss is now part of Story Mode progress.' : '15. görev tamamlandı. Piko’nun hafıza kaybı hikâye kaydına işlendi.'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal3') {
        session.phase = 'complete'; session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission13Complete: true, mission14Complete: true });
        setStatus(en ? 'SIGNAL SOURCE LOCATED · A reply comes from beyond the station.' : 'SİNYAL KAYNAĞI BULUNDU · İstasyonun ötesinden yanıt geliyor.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Piko’yu geri getirmeyin. Henüz hazır değil.','Do not bring Piko back. It is not ready yet.');
        setAction('story-mission14-seal-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 14 complete. Core signal traced.' : '14. görev tamamlandı. Çekirdek sinyali izlendi.'); return;
    }

    if (session.mission === 11 && session.phase === 'combat') {
        session.phase = 'relayNode1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'LOWER NETWORK EXPOSED · Send a pulse to the first ancient relay.' : 'ALT AĞ AÇIĞA ÇIKTI · İlk kadim röleye sinyal darbesi gönder.');
        setStoryComms('PİKO','PIKO','Üç röle var. Bunlar kablo değil… sanki istasyonun altına gömülmüş yıldız haritası. Birine dokun, bakalım ne hatırlıyorlar.','Three relays. These are not cables… they look like a star map buried beneath the station. Touch one and see what it remembers.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 1 / 3' : 'DARBE · 1 / 3 RÖLEYİ İZLE');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode1') {
        session.phase = 'relayNode2'; session.pulseCount = 1;
        setStatus(en ? 'RELAY 1 MAPPED · The signal draws a constellation absent from every known chart.' : '1. RÖLE HARİTALANDI · Sinyal, bilinen tüm haritalarda bulunmayan bir takımyıldız çiziyor.');
        setStoryComms('KOMUTAN','COMMANDER','Bu bir koordinat değil. Bir şeyin… şeklini gösteriyor.','These are not coordinates. They show the shape of… something.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 2 / 3' : 'DARBE · 2 / 3 RÖLEYİ İZLE');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode2') {
        session.phase = 'relayNode3'; session.pulseCount = 2;
        setStatus(en ? 'RELAY 2 MAPPED · A dormant signature matches the companion’s core.' : '2. RÖLE HARİTALANDI · Uyuyan bir imza, yoldaşın çekirdeğiyle eşleşiyor.');
        setStoryComms('PİKO','PIKO','Benim çekirdeğim bu istasyonun inşasından önce varmış. Bunu kimseye söylemediğim için değil… şimdiye kadar bilmiyordum.','My core existed before this station was built. Not because I kept it secret… I did not know until now.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 3 / 3' : 'DARBE · 3 / 3 RÖLEYİ İZLE');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode3') {
        session.phase = 'complete'; session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission10Complete: true, mission11Complete: true, companionForm: 'cyan' });
        setStatus(en ? 'LOWER NETWORK MAPPED · A final signal answers from far beyond the station.' : 'ALT AĞ HARİTALANDI · Son bir sinyal istasyonun çok ötesinden cevap veriyor.');
        setStoryComms('BİLİNMEYEN SİNYAL','UNKNOWN SIGNAL','PİKO…','PIKO…');
        setAction('story-mission11-pulse-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 11 complete. Lower network map saved.' : '11. görev tamamlandı. Alt ağ haritası kaydedildi.');
        return;
    }

    if (session.mission === 10 && session.phase === 'combat') {
        session.phase = 'pulseNode1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CALIBRATION WINDOW OPEN · Direct the pulse at the marked node.' : 'KALİBRASYON PENCERESİ AÇILDI · Darbeyi işaretli düğüme yönelt.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Düğüm görünür değil. Yoldaşın yeni darbesi onu açığa çıkarabilir.','The node is not visible. The companion’s new pulse may reveal it.');
        setAction('story-mission10-pulse-action', false, en ? 'SIGNAL PULSE · REVEAL NODE 1' : 'SİNYAL DARBESİ · 1. DÜĞÜMÜ AÇ');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        showToast(en ? 'Calibration ready. Use the pulse once to reveal the first node.' : 'Kalibrasyon hazır. İlk düğümü açığa çıkarmak için darbeyi bir kez kullan.');
        return;
    }
    if (session.mission === 10 && session.phase === 'pulseNode1') {
        session.phase = 'pulseNode2'; session.pulseCount = 1; isPaused = true;
        setStatus(en ? 'NODE 1 REVEALED · The pulse did not strike an enemy. It exposed a hidden connection. The lift interface is still sealed.' : '1. DÜĞÜM AÇIĞA ÇIKTI · Darbe düşmanı vurmadı; gizlenmiş bağlantıyı görünür kıldı. Asansör arayüzü hâlâ kapalı.');
        setStoryComms('PİKO','PIKO','Darbe düşmanı vurmadı. Gizlenmiş bağlantıyı görünür kıldı. İkinci düğüm asansörün kilidini tutuyor.','The pulse did not strike an enemy. It revealed a hidden connection. The second node is holding the lift lock.');
        setAction('story-mission10-pulse-action', false, en ? 'SIGNAL PULSE · STABILIZE LIFT' : 'SİNYAL DARBESİ · ASANSÖRÜ SABİTLE');
        showToast(en ? 'Node 1 activated. Node 2 is now traceable.' : '1. düğüm etkinleştirildi. 2. düğüm artık izlenebilir.');
        return;
    }
    if (session.mission === 10 && session.phase === 'pulseNode2') {
        // Let the discovery breathe: denial, impossible admin override, then the companion's memory.
        // Each delayed beat checks that this exact mission session is still active, so exiting
        // during the scene cannot mutate the restored Endless Mode or a later mission.
        session.phase = 'accessReveal'; session.pulseCount = 2; isPaused = true;
        setStatus(en ? 'LIFT OPEN · ACCESS DENIED. No identity record found.' : 'ASANSÖR AÇILDI · ERİŞİM REDDEDİLDİ. Kimlik kaydı bulunamadı.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Erişim reddedildi. Kimlik kaydı bulunamadı.','Access denied. No identity record found.');
        setAction('story-mission10-pulse-action', true);
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        window.setTimeout(() => {
            if (window.__storyBattle !== session || !session.active || session.phase !== 'accessReveal') return;
            session.phase = 'adminVerified';
            setStatus(en ? 'CORRECTION · ADMINISTRATOR ACCESS VERIFIED.' : 'DÜZELTME · YÖNETİCİ ERİŞİMİ DOĞRULANDI.');
            setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Düzeltme: yönetici erişimi doğrulandı.','Correction: administrator access verified.');
            window.setTimeout(() => {
                if (window.__storyBattle !== session || !session.active || session.phase !== 'adminVerified') return;
                session.phase = 'complete'; session.completed = true;
                setStatus(en ? 'LIFT STABLE · DESCENT ACCESS GRANTED.' : 'ASANSÖR SABİT · ALT KAT ERİŞİMİ AÇILDI.');
                setStoryComms('KOMUTAN','COMMANDER','Sistemde kaydın yok. Nasıl yönetici olabilirsin?','You have no identity record in this system. How can you be an administrator?');
                window.setTimeout(() => {
                    if (window.__storyBattle !== session || !session.active || session.phase !== 'complete') return;
                    setStoryComms('PİKO','PIKO','Bilmiyorum. Ama kapı açılınca… içimde bir şey hatırladı.','I don’t know. But when the door opened… something inside me remembered.');
                    saveStoryProgress({ introSeen: true, chapter: 2, mission10Complete: true, pulseTutorialComplete: true });
                    setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
                    showToast(en ? 'Mission 10 complete. Pulse tutorial progress saved.' : '10. görev tamamlandı. Darbe öğreticisi ilerlemesi kaydedildi.');
                }, 1500);
            }, 1300);
        }, 1000);
        return;
    }

    if (session.mission === 3 && session.phase === 'investigate') {
        session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission3Complete: true, routeChoice: session.routeChoice });
        if (session.routeChoice === 'array') {
            setStatus(en ? 'EVIDENCE RECOVERED · The antenna log shows the signal bouncing from inside the station.' : 'KANIT KURTARILDI · Anten kaydı, sinyalin istasyonun içinden yansıdığını gösteriyor.');
            setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Anten sinyali dışarıdan almamış. İstasyonun içindeki bir kaydı yeniden yayıyor.','The antenna did not receive the signal from outside. It is repeating a recording from inside the station.');
        } else {
            setStatus(en ? 'EVIDENCE RECOVERED · The black-box log contains a voice fragment recorded before shutdown.' : 'KANIT KURTARILDI · Karakutu kaydında kapanıştan önce kaydedilmiş bir ses parçası var.');
            setStoryComms('KOMUTAN','COMMANDER','Bu ses istasyon kapanmadan önce kaydedilmiş. Peki neden mavi görüntüyle aynı?','This voice was recorded before the station shut down. Then why does it match the blue image?');
        }
        setAction('story-investigation-actions', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 03 complete. Evidence saved separately.' : '3. görev tamamlandı. Kanıt ayrı kaydedildi.');
        return;
    }

    if (session.mission === 6 && session.phase === 'repair') {
        session.repairs = Math.min(3, (session.repairs || 0) + 1);
        if (session.repairs < 3) {
            setStatus(en ? 'CONNECTION ' + session.repairs + '/3 RESTORED · The companion found another damaged panel.' : 'BAĞLANTI ' + session.repairs + '/3 ONARILDI · Yoldaş başka bir hasarlı panel buldu.');
            setAction('story-repair-action', false, en ? 'REPAIR CONNECTION ' + (session.repairs + 1) + '/3' : 'BAĞLANTIYI ONAR ' + (session.repairs + 1) + '/3');
            setStoryComms('PİKO','PIKO','Bir bağlantı daha tamamlandı. Bu ses… tanıdık geliyor. Nedenini bilmiyorum.','One more connection restored. This sound… feels familiar. I do not know why.');
            showToast(en ? 'Connection restored (' + session.repairs + '/3).' : 'Bağlantı onarıldı (' + session.repairs + '/3).');
            return;
        }
        session.completed = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission6Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The companion emits a brief cyan flicker while repairing the last panel, then returns to its dim maintenance state.' : 'GÖREV TAMAMLANDI · Yoldaş son paneli onarırken kısa bir camgöbeği ışık yayıyor, ardından yeniden sönük bakım hâline dönüyor.');
        setStoryComms('PİKO','PIKO','Ben bunu yapmayı nereden biliyorum? Bu hareket… benden önce de varmış gibi.','How do I know how to do this? This movement feels like it existed before me.');
        setAction('story-repair-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 06 complete. The flicker is logged, not an evolution.' : '6. görev tamamlandı. Işık kaydedildi; bu henüz evrim değil.');
        return;
    }

    if (session.mission === 8 && session.phase === 'memory') {
        session.memories = Math.min(3, (session.memories || 0) + 1);
        const clues = en
            ? ['Clue 1: the shutdown marks this room as empty, but the dust pattern shows recent movement.', 'Clue 2: the blue echo speaks before the station records the first incoming signal.', 'Clue 3: a violet silhouette stands beside the commander; the face and identity are missing.']
            : ['İpucu 1: kapanış kaydı odayı boş gösteriyor, ancak toz izi yakın zamanda hareket olduğunu söylüyor.', 'İpucu 2: mavi yankı, istasyonun ilk gelen sinyali kaydetmesinden önce konuşuyor.', 'İpucu 3: komutanın yanında mor bir siluet var; yüzü ve kimliği kayıp.'];
        if (session.memories < 3) {
            setStatus(clues[session.memories - 1] + (en ? ' Inspect the next trace.' : ' Sonraki izi incele.'));
            setAction('story-memory-action', false, en ? 'INSPECT MEMORY TRACE ' + (session.memories + 1) + '/3' : 'HAFIZA İZİNİ İNCELE ' + (session.memories + 1) + '/3');
            showToast(en ? 'Memory clue recovered (' + session.memories + '/3).' : 'Hafıza ipucu bulundu (' + session.memories + '/3).');
            return;
        }
        session.completed = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission8Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The echo and the station log disagree. The violet silhouette remains unidentified.' : 'GÖREV TAMAMLANDI · Yankı ile istasyon kaydı çelişiyor. Mor siluetin kimliği hâlâ belirsiz.');
        setStoryComms('KOMUTAN','COMMANDER','O görüntü beni tanıyor olabilir. Ama onu tanıdığımı kanıtlayan hiçbir şey yok.','That image may know me. But nothing proves that I know it.');
        setAction('story-memory-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 08 complete. The contradiction is recorded.' : '8. görev tamamlandı. Çelişki kaydedildi.');
        return;
    }

    if (session.mission === 9 && session.phase === 'reconnect') {
        session.phase = 'awaken'; isPaused = true;
        setStatus(en ? 'CONNECTION RESTORED · The companion chooses to stay and protect the core. A dormant signal is responding.' : 'BAĞLANTI KURULDU · Yoldaş çekirdeği korumak için kalmayı seçiyor. Uyuyan bir sinyal cevap veriyor.');
        setStoryComms('KOMUTAN','COMMANDER','Seni kaybetmeyeceğim. Bağlantıyı yeniden kuruyoruz—şimdi!','I will not lose you. We are restoring the link—now!');
        setAction('story-reconnect-action', true);
        setAction('story-awaken-action', false);
        return;
    }
    if (session.mission === 9 && session.phase === 'awaken') {
        session.phase = 'pulseTest'; session.companionSynced = true; isPaused = true;
        setStatus(en ? 'CYAN FORM AWAKENED · The companion is no longer just a maintenance unit. Test its new signal pulse.' : 'CAMGÖBEĞİ FORM UYANDI · Yoldaş artık yalnızca bir bakım birimi değil. Yeni sinyal darbesini dene.');
        setStoryComms('PİKO','PIKO','Ben… bunu daha önce yaptım. Bu ışık benim değil. Bu ışık benim hatırladığım şey.','I… have done this before. This light is not mine. It is what I remember.');
        setAction('story-awaken-action', true);
        setAction('story-pulse-action', false);
        const companionChip = document.getElementById('story-companion-chip');
        const companionIcon = document.getElementById('story-companion-icon');
        const companionState = document.getElementById('story-companion-state');
        if (companionChip) companionChip.classList.add('is-synced');
        if (companionIcon) companionIcon.textContent = '✦';
        if (companionState) companionState.textContent = en ? 'CYAN FORM · SIGNAL STABLE' : 'CAMGÖBEĞİ FORM · SİNYAL KARARLI';
        return;
    }
    if (session.mission === 9 && session.phase === 'pulseTest') {
        session.completed = true; session.companionSynced = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission9Complete: true, companionForm: 'cyan' });
        setStatus(en ? 'CHAPTER COMPLETE · The pulse answers. For one frame, the blue echo and the companion share the same silhouette—then the recording breaks again.' : 'BÖLÜM TAMAMLANDI · Darbe cevap veriyor. Bir anlığına mavi yankı ile yoldaş aynı silueti paylaşıyor; ardından kayıt yeniden bozuluyor.');
        setStoryComms('MAVİ YANKI','BLUE ECHO','Uyanma. Henüz değil. Eğer beni duyabiliyorsan… istasyonun altında ne olduğunu unutma.','Do not wake. Not yet. If you can hear me… do not forget what lies beneath the station.');
        setAction('story-pulse-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Chapter 01 complete. Companion form saved.' : '1. bölüm tamamlandı. Yoldaşın formu kaydedildi.');
        return;
    }

    if (session.mission === 5 && session.phase === 'relay') {
        session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission5Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The relay is silent. The recovered packet carries the same broken voice as the blue echo.' : 'GÖREV TAMAMLANDI · Röle sustu. Kurtarılan pakette mavi yankıyla aynı bozuk ses var.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Röle açığa çıktı. Paket, mavi yankıdaki ses örüntüsüyle eşleşiyor.','The relay is exposed. Its packet matches the voice pattern in the blue echo.');
        setAction('story-relay-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 05 complete. Story progress saved.' : '5. görev tamamlandı. Hikâye ilerlemesi kaydedildi.');
        return;
    }
    if (session.mission === 7 && session.phase === 'amplifier') {
        session.completed = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission7Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The signal loops from inside the station. The antenna was not receiving it—it was repeating it.' : 'GÖREV TAMAMLANDI · Sinyal istasyonun içinden döngüye giriyor. Anten onu almıyordu; tekrar yayıyordu.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Sinyal dışarıdan gelmiyor. Döngü, istasyonun içinden besleniyor.','The signal is not coming from outside. The loop is being fed from inside the station.');
        setAction('story-amplifier-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 07 complete. Signal origin narrowed down.' : '7. görev tamamlandı. Sinyalin kaynağı daraltıldı.');
        return;
    }

    if (session.mission === 9 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 12; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'SECOND CONTACT · The signal is adapting. Survive the next wave to reach the core link.' : 'İKİNCİ TEMAS · Sinyal uyum sağlıyor. Çekirdek bağlantısına ulaşmak için sonraki dalgayı atlat.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Tehdit örüntüsü değişti. İlk savunma yalnızca bir yoklamaydı.','Threat pattern changed. The first assault was only a probe.');
        showToast(en ? 'Final phase 2/3 · Threat pattern changed.' : 'Final aşaması 2/3 · Tehdit örüntüsü değişti.');
        return;
    }
    if (session.mission === 9 && session.phase === 'combat2') {
        session.phase = 'combat3'; game.wave = 3; game.highestWave = 3; game.waveKills = 0; game.waveTargetKills = 14; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'CORE BREACH · The hostile signal is forcing its way into the core. Hold the final line.' : 'ÇEKİRDEK İHLALİ · Düşman sinyali çekirdeğe girmeye çalışıyor. Son savunma hattını koru.');
        setStoryComms('PİKO','PIKO','Çekirdeğin önüne geçiyorum. Bu kez seni korumayı ben seçeceğim.','I am moving in front of the core. This time, I choose to protect you.');
        showToast(en ? 'Final phase 3/3 · Protect the core.' : 'Final aşaması 3/3 · Çekirdeği koru.');
        return;
    }
    if (session.mission === 9 && session.phase === 'combat3') {
        session.phase = 'reconnect'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORE UNDER PRESSURE · The hostile signal is trying to sever the companion’s link. Reconnect before the core fails.' : 'ÇEKİRDEK BASKI ALTINDA · Düşman sinyali yoldaşın bağlantısını kesmeye çalışıyor. Çekirdek düşmeden bağlantıyı kur.');
        setStoryComms('KOMUTAN','COMMANDER','Seni kaybetmeyeceğim. Bağlantıyı yeniden kuruyoruz—şimdi!','I will not lose you. We are restoring the link—now!');
        setAction('story-reconnect-action', false);
        showToast(en ? 'Final defense survived. Reconnect with the companion.' : 'Son savunmadan sağ çıktın. Yoldaşla bağlantıyı kur.');
        return;
    }
    if (session.mission === 7 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 10; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'SECOND CONTACT · The array draws a heavier patrol. Keep the line stable.' : 'İKİNCİ TEMAS · Dizi daha ağır bir devriye çekiyor. Savunma hattını koru.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Yükselticiyi kapatmak için diziye birkaç saniye daha kazandır.','Buy the array a few more seconds so we can shut down the amplifier.');
        showToast(en ? 'Second defense phase · Reinforcements detected.' : 'İkinci savunma aşaması · Takviye tespit edildi.');
        return;
    }
    if (session.mission === 7 && session.phase === 'combat2') {
        session.phase = 'amplifier'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARRAY STABLE · The amplifier is exposed. Shut it down to trace the signal’s direction.' : 'DİZİ GÜVENDE · Yükseltici açığa çıktı. Sinyalin yönünü izlemek için onu kapat.');
        setAction('story-amplifier-action', false);
        showToast(en ? 'Amplifier exposed. Disable it to finish.' : 'Yükseltici açığa çıktı. Bitirmek için kapat.');
        return;
    }
    if (session.mission === 5 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 10; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'RELAY GUARD · The signal is protecting its source. Defeat the reinforcements to expose the relay.' : 'RÖLE KORUMASI · Sinyal kaynağını koruyor. Röleyi açığa çıkarmak için takviyeleri durdur.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','İlk grup yalnızca öncüydü. Röleye erişim açılana kadar savunmayı sürdür.','The first group was only a vanguard. Hold the defense until the relay access opens.');
        showToast(en ? 'Second defense phase · Relay guards incoming.' : 'İkinci savunma aşaması · Röle muhafızları geliyor.');
        return;
    }
    if (session.mission === 5 && session.phase === 'combat2') {
        session.phase = 'relay'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORRIDOR SECURE · The relay is exposed. Shut it down before the signal loops again.' : 'KORİDOR GÜVENDE · Röle açığa çıktı. Sinyal yeniden döngüye girmeden kapat.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Röle açığa çıktı. Paket, mavi yankıdaki ses örüntüsüyle eşleşiyor.','The relay is exposed. Its packet matches the voice pattern in the blue echo.');
        setAction('story-relay-action', false);
        showToast(en ? 'Relay exposed. Disable it to finish the mission.' : 'Röle açığa çıktı. Görevi bitirmek için kapat.');
        return;
    }
    if (session.mission === 2 && session.phase === 'combat') {
        session.phase = 'scan'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'PATROL CLEARED · Scan the three signal traces. The companion has marked the first trace.' : 'DEVRİYE TEMİZLENDİ · Üç sinyal izini tara. Yoldaş ilk izi işaretledi.');
        setStoryComms('PİKO','PIKO','İlk iz burada. Zaman damgası istasyonun kapanışından daha eski görünüyor.','The first trace is here. Its timestamp appears older than the station shutdown.');
        setAction('story-scan-action', false, en ? 'SCAN TRACE 1 / 3' : 'SİNYAL İZİNİ TARA 1 / 3');
        showToast(en ? 'Patrol cleared. Follow the companion’s scan markers.' : 'Devriye temizlendi. Yoldaşın tarama işaretlerini takip et.');
        return;
    }

    // Only missions 1 and 2 use the generic combat/scan completion path below.
    // Unknown or out-of-order phases must never fall through and falsely award mission 2.
    if (![1, 2].includes(session.mission)) return;

    session.completed = true; isPaused = true; enemies = []; projectiles = [];
    if (session.mission === 1) {
        session.companionSynced = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission1Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The core is stable. The maintenance companion has synchronized with you; one signal fragment recovered.' : 'GÖREV TAMAMLANDI · Çekirdek güvende. Bakım yoldaşı seninle eşitlendi; sinyalin bir parçası kurtarıldı.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Çekirdek kararlı. Yoldaş bağlantı kurdu; fakat mavi yankının kimliği hâlâ bilinmiyor.','Core stable. The companion has linked, but the blue echo’s identity remains unknown.');
    } else {
        saveStoryProgress({ introSeen: true, chapter: 1, mission2Complete: true });
        setStatus(en ? 'MISSION COMPLETE · Three traces recovered. One timestamp predates the station shutdown.' : 'GÖREV TAMAMLANDI · Üç iz kurtarıldı. Zaman damgalarından biri istasyonun kapanmasından daha eski.');
        setStoryComms('PİKO','PIKO','Bu kayıt kapanıştan önceye ait. Sinyal neden buradaydı?','This record predates the shutdown. Why was the signal already here?');
    }
    setAction('story-scan-action', true);
    setExit(en ? 'CONTINUE' : 'DEVAM ET');
    const companionChip = document.getElementById('story-companion-chip');
    const companionState = document.getElementById('story-companion-state');
    const companionIcon = document.getElementById('story-companion-icon');
    if (companionChip) companionChip.classList.toggle('is-synced', session.mission === 1);
    if (companionState && session.mission === 1) companionState.textContent = en ? 'LINK ESTABLISHED · CORE STABLE' : 'BAĞLANTI KURULDU · ÇEKİRDEK GÜVENDE';
    if (companionIcon && session.mission === 1) companionIcon.textContent = '✦';
    showToast(en ? 'Mission complete. Story progress saved separately.' : 'Görev tamamlandı. Hikâye ilerlemesi ayrı kaydedildi.');
}
function scanStorySignal() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 2 || session.phase !== 'scan' || session.completed) return;
    session.scans = Math.min(3, (session.scans || 0) + 1);
    const en = storyLanguage() === 'en';
    const clues = en
        ? ['Trace 1: a weak pulse repeats every 4.2 seconds.', 'Trace 2: the timestamp predates the station shutdown.', 'Trace 3: the echo contains a voiceprint that matches the blue hologram.']
        : ['İz 1: zayıf bir sinyal her 4,2 saniyede bir tekrarlanıyor.', 'İz 2: zaman damgası istasyonun kapanışından daha eski.', 'İz 3: yankıda mavi hologramla eşleşen bir ses izi var.'];
    const status = document.getElementById('story-battle-status');
    if (session.scans >= 3) {
        if (status) status.textContent = clues[2] + (en ? ' All three traces are stored.' : ' Üç iz de kaydedildi.');
        setStoryComms('PİKO','PIKO','Bu ses… sanki benim içimden geliyor. Ama ben bu kaydı hiç yaşamadım.','This voice… it feels like it comes from inside me. But I have never lived this recording.');
        finishStoryBattleEncounter();
        return;
    }
    if (status) status.textContent = clues[session.scans - 1] + (en ? ' Continue scanning.' : ' Taramaya devam et.');
    const action = document.getElementById('story-scan-action');
    if (action) action.textContent = en ? 'SCAN TRACE ' + (session.scans + 1) + ' / 3' : 'SİNYAL İZİNİ TARA ' + (session.scans + 1) + ' / 3';
    setStoryComms('PİKO','PIKO','Bir iz daha. Bu sinyal kapanıştan önce varmış.','One more trace. This signal existed before the shutdown.');
    showToast(en ? 'Signal trace recovered (' + session.scans + '/3).' : 'Sinyal izi kurtarıldı (' + session.scans + '/3).');
}
function inspectStoryMemory() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 8 || session.phase !== 'memory' || session.completed) return;
    finishStoryBattleEncounter();
}
function inspectStoryVoiceRecord() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 13 || !['voice1','voice2'].includes(session.phase) || session.completed || isPaused !== true || session.voiceBusy) return;
    session.voiceBusy = true; const previousPhase = session.phase; finishStoryBattleEncounter();
    if (window.__storyBattle === session && session.phase !== previousPhase) session.voiceBusy = false;
}
function chooseStoryVoice(choice) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 13 || session.phase !== 'voiceChoice' || session.completed || isPaused !== true || session.choiceBusy || !['human','station'].includes(choice)) return;
    session.choiceBusy = true; session.phase = 'complete'; session.completed = true;
    saveStoryProgress({ introSeen: true, chapter: 2, mission12Complete: true, mission13Complete: true, voiceChoice: choice });
    const en = storyLanguage() === 'en';
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = choice === 'human' ? (en ? 'DECISION SAVED · You trust the human testimony.' : 'KARAR KAYDEDİLDİ · İnsan tanıklığına güvendin.') : (en ? 'DECISION SAVED · You trust the station archive; a possible forgery is flagged.' : 'KARAR KAYDEDİLDİ · İstasyon arşivine güvendin; olası sahte imza işaretlendi.');
    setStoryComms('PIKO','PIKO', choice === 'human' ? 'Bir anı… sıcak ışık ve biri bana Piko diyor. Bu gerçek mi?' : 'Bana inanmadın. Belki haklısın. Ama arşivin imzası sahteyse biri bizi yönlendiriyor.', choice === 'human' ? 'A memory… warm light, and someone calling me Piko. Is it real?' : 'You did not believe me. Maybe you are right. But if the signature is forged, someone is steering us.');
    const h = document.getElementById('story-mission13-trust-human'); const s = document.getElementById('story-mission13-trust-station');
    if (h) h.hidden = true; if (s) s.hidden = true;
    const exit = document.getElementById('story-battle-exit'); if (exit) exit.textContent = en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN';
    showToast(en ? 'Mission 13 complete. Your choice has been saved.' : '13. görev tamamlandı. Seçimin kaydedildi.');
}
function inspectStoryArchive() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 12 || !['archive1','archive2','archive3'].includes(session.phase) || session.completed || isPaused !== true || session.archiveBusy) return;
    session.archiveBusy = true;
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        if (session.phase !== previousPhase) session.archiveBusy = false;
    }, 450);
}
function pulseStoryMission11() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 11 || !['relayNode1','relayNode2','relayNode3'].includes(session.phase) || session.completed || isPaused !== true || session.pulseBusy) return;
    session.pulseBusy = true;
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        if (session.phase !== previousPhase) session.pulseBusy = false;
    }, 350);
}
function pulseStoryMission10() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 10 || !['pulseNode1','pulseNode2'].includes(session.phase) || session.completed || isPaused !== true || session.pulseBusy) return;

    // A fast double-tap must never skip both tutorial nodes in one gesture.
    session.pulseBusy = true;
    session.pulseVisualAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        // Release only after the phase transition has settled.
        if (session.phase !== previousPhase) session.pulseBusy = false;
    }, 700);
}
function reconnectStoryCompanion() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'reconnect' || session.completed) return;
    finishStoryBattleEncounter();
}
function awakenStoryCompanion() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'awaken' || session.completed) return;
    finishStoryBattleEncounter();
}
function testStoryPulse() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'pulseTest' || session.completed) return;
    finishStoryBattleEncounter();
}
function repairStoryMission15System() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 15 || !['repairSystem1','repairSystem2','repairSystem3'].includes(session.phase) || session.completed) return;
    finishStoryBattleEncounter();
}
function repairStoryConnection() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 6 || session.phase !== 'repair' || session.completed) return;
    finishStoryBattleEncounter();
}
function disableStoryAmplifier() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 7 || session.phase !== 'amplifier' || session.completed) return;
    finishStoryBattleEncounter();
}
function chooseStoryPowerPriority(choice) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 4 || session.phase !== 'powerChoice' || session.completed) return;
    if (choice !== 'shield' && choice !== 'weapon') return;
    session.completed = true; isPaused = true;
    saveStoryProgress({ introSeen: true, chapter: 1, mission4Complete: true, powerChoice: choice });
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = choice === 'shield'
        ? (storyLanguage() === 'en' ? 'POWER ROUTED · The core shield is reinforced. The next corridor will be safer, but weapons remain standard.' : 'GÜÇ YÖNLENDİRİLDİ · Çekirdek kalkanı güçlendirildi. Sonraki koridor daha güvenli olacak, silahlar standart kalacak.')
        : (storyLanguage() === 'en' ? 'POWER ROUTED · Weapon calibration is improved. You will hit harder in the next corridor, but have no extra shield.' : 'GÜÇ YÖNLENDİRİLDİ · Silah kalibrasyonu iyileştirildi. Sonraki koridorda daha sert vuracaksın ama ek kalkanın olmayacak.');
    const choices = document.getElementById('story-power-actions'); if (choices) choices.hidden = true;
    const exit = document.getElementById('story-battle-exit'); if (exit) exit.textContent = storyLanguage() === 'en' ? 'CONTINUE' : 'DEVAM ET';
    showToast(storyLanguage() === 'en' ? 'Power priority saved. It affects Mission 05.' : 'Güç tercihi kaydedildi. 5. görevi etkileyecek.');
}
function disableStoryRelay() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 5 || session.phase !== 'relay' || session.completed) return;
    finishStoryBattleEncounter();
}
function chooseStorySignalSource(source) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 3 || session.phase !== 'investigate' || session.completed) return;
    if (source !== 'array' && source !== 'blackbox') return;
    session.routeChoice = source;
    finishStoryBattleEncounter();
}
function exitStoryBattle(toMainMenu = false) {
    const session = window.__storyBattle;
    if (!session || !session.active || !session.snapshot) return;
    const s = session.snapshot;
    game = s.game; tower = s.tower; enemies = s.enemies; projectiles = s.projectiles;
    particles = s.particles; floatingTexts = s.floatingTexts; lightningBeams = s.lightningBeams;
    rings = s.rings; cargoDrones = s.cargoDrones;
    spawnTimer = s.spawnTimer; playTimeAccum = s.playTimeAccum; waveFrostSpawns = s.waveFrostSpawns;
    cargoSpawnTimer = s.cargoSpawnTimer; gameSpeed = s.gameSpeed; isPaused = s.isPaused;
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
    finishStoryTyping();
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
    // First tap reveals the rest of the current line; the next tap advances.
    if (storyTypingTimer !== null) { finishStoryTyping(); return; }
    if (storyDialogueIndex < STORY_DIALOGUES.length - 1) {
        storyDialogueIndex++;
        showStoryDialogue();
        return;
    }
    showStoryMissionBriefing();
}
function skipStoryIntro() {
    finishStoryTyping();
    showStoryMissionBriefing();
}
function closeStoryMode() {
    finishStoryTyping();
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
    if (event.key === 'Enter' && !event.repeat && !storyMissionViewOpen) { event.preventDefault(); advanceStoryDialogue(); }
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
