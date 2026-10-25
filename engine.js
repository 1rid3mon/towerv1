const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tower = {
    x: 0, y: 0, hp: 100, maxHp: 100, shield: 0, maxShield: 0,
    fireCooldown: 0, angle: 0, recoil: 0,
    freezeTimer: 0, freezeImmunityTimer: 0, frostSlowTimer: 0, frostVisualTick: 0,
    overdriveTimer: 0, overdriveVisualTick: 0
};
let enemies = [];
let projectiles = [];
let particles = [];
let floatingTexts = [];
let lightningBeams = [];
let rings = [];
let cargoDrones = [];

let bgStars = [];
let snowFlakes = [];
function initStars() {
    bgStars = [];
    for (let i = 0; i < 80; i++) bgStars.push({ x: Math.random() * 2500, y: Math.random() * 2500, size: 0.6 + Math.random() * 2, alpha: 0.25 + Math.random() * 0.65 });
    snowFlakes = [];
    for (let i = 0; i < 60; i++) snowFlakes.push({ x: Math.random() * 2000, y: Math.random() * 2000, r: 1 + Math.random() * 2.2, vy: 20 + Math.random() * 30, vx: -10 + Math.random() * 20, alpha: 0.3 + Math.random() * 0.5 });
}
initStars();

let spawnTimer = 0;
let playTimeAccum = 0;
let waveFrostSpawns = 0;
let cargoSpawnTimer = 45 + Math.random() * 15;

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    tower.x = canvas.width / 2;
    tower.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);

// Bir merminin başlangıç (x1,y1) ve bitiş (x2,y2) noktaları arasındaki doğru parçasının düşmana değip değmediğini ölçer
function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
}

function spawnCargoDrone() {
    if (cargoDrones.length > 0 || !canvas.width || !canvas.height) return;

    const fromLeft = Math.random() < 0.5;
    const margin = 36;
    const startX = fromLeft ? -margin : canvas.width + margin;
    const endX = fromLeft ? canvas.width + margin : -margin;

    const startY = canvas.height * (0.18 + Math.random() * 0.64);
    const endY = canvas.height * (0.18 + Math.random() * 0.64);

    const angle = Math.atan2(endY - startY, endX - startX);
    const speed = 72 + Math.random() * 18;

    const roll = Math.random();
    let rewardType = 'gold';
    let color = '#fbbf24';
    let secColor = '#fef08a';
    let label = 'ALTIN KARGO';

    if (roll < 0.34) {
        rewardType = 'overdrive';
        color = '#f97316';
        secColor = '#fed7aa';
        label = 'OVERDRIVE DRONU';
    } else if (roll < 0.67) {
        rewardType = 'crystal';
        color = '#22d3ee';
        secColor = '#cffafe';
        label = 'KRİSTAL UYDUSU';
    }

    cargoDrones.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 20,
        rewardType,
        color,
        secColor,
        label,
        rot: 0,
        pulsePhase: 0,
        trailTick: 0,
        life: 20,
        qteAttempted: false,
        qteActive: false,
        qteTimer: 0
    });

    if (typeof showToast === 'function') {
        showToast(`🛸 ${label} göründü! İlk dokunuş QTE'yi başlatır; bonus için 1,25 sn içinde tekrar dokun!`);
    }
}

function collectCargoDrone(index, reflexBonus = false) {
    const d = cargoDrones[index];
    if (!d) return;
    cargoDrones.splice(index, 1);

    createParticles(d.x, d.y, d.color, 20, 110);
    createParticles(d.x, d.y, '#ffffff', 10, 75);
    rings.push({ x: d.x, y: d.y, radius: 14, color: d.color, life: 0.95 });

    const w = game.wave || 1;
    if (d.rewardType === 'overdrive') {
        tower.overdriveTimer = reflexBonus ? 15.0 : 10.0;
        const bonusGold = Math.max(10, Math.round(getWaveBaseGold(w) * getGoldMultiplier() * 5 * (reflexBonus ? 1.5 : 1)));
        game.gold += bonusGold;
        addFloatingText(d.x, d.y - 10, `⚡ 2X HIZ (${reflexBonus ? 15 : 10}sn)!`, '#f97316', 14);
        addFloatingText(d.x, d.y + 8, `+${formatNumber(bonusGold)} 🪙`, '#fbbf24', 12);
        rings.push({ x: tower.x, y: tower.y, radius: 16, color: '#f97316', life: 0.85 });
        if (typeof showToast === 'function') {
            showToast(`⚡ Overdrive Aktif! ${reflexBonus ? '15' : '10'} sn 2x Atış Hızı + ${formatNumber(bonusGold)} Altın!${reflexBonus ? ' REFLEKS BONUSU!' : ''}`);
        }
    } else if (d.rewardType === 'crystal') {
        const cAmt = Math.max(3, Math.round((4 + Math.floor(w * 0.35)) * getCrystalDropMult() * (reflexBonus ? 1.5 : 1)));
        game.crystals += cAmt;
        addFloatingText(d.x, d.y - 8, `+${formatNumber(cAmt)} 💎`, '#22d3ee', 15);
        if (typeof showToast === 'function') {
            showToast(`💎 Kargo İmha Edildi! +${formatNumber(cAmt)} Kristal Kazandın!${reflexBonus ? ' REFLEKS BONUSU!' : ''}`);
        }
    } else {
        const goldAmt = Math.max(25, Math.round(getWaveBaseGold(w) * getGoldMultiplier() * 12 * (reflexBonus ? 1.5 : 1)));
        game.gold += goldAmt;
        addFloatingText(d.x, d.y - 8, `+${formatNumber(goldAmt)} 🪙`, '#fbbf24', 15);
        if (typeof showToast === 'function') {
            showToast(`🪙 Altın Kargosu Toplandı! +${formatNumber(goldAmt)} Altın!${reflexBonus ? ' REFLEKS BONUSU!' : ''}`);
        }
    }

    updateHUD();
    refreshUpgradeButtonsState();
}

function handleCanvasPointerDown(e) {
    if (isPaused || isDefeated || cargoDrones.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    for (let i = cargoDrones.length - 1; i >= 0; i--) {
        const d = cargoDrones[i];
        if (Math.hypot(d.x - clickX, d.y - clickY) <= d.radius + 20) {
            if (e.cancelable) e.preventDefault();
            if (!d.qteAttempted) {
                d.qteAttempted = true;
                d.qteActive = true;
                d.qteTimer = 1.25;
                if (typeof showToast === 'function') showToast('⚡ REFLEKS TESTİ! 1,25 saniye içinde drona tekrar dokun: %50 daha fazla ganimet!');
            } else if (d.qteActive && d.qteTimer > 0) {
                collectCargoDrone(i, true);
            } else {
                collectCargoDrone(i, false);
            }
            break;
        }
    }
}
canvas.addEventListener('pointerdown', handleCanvasPointerDown, { passive: false });

function spawnEnemy(isBoss = false) {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(canvas.width, canvas.height) * 0.55 + 40;
    const x = tower.x + Math.cos(angle) * spawnDist;
    const y = tower.y + Math.sin(angle) * spawnDist;

    const w = game.wave;
    const earlyBuffer = w <= 10 ? (0.75 + (w * 0.025)) : 1.0;
    // Preserve the established endless-wave balance until measured playtest data supports a change.
    const tierMult = Math.pow(1.22, Math.floor(w / 10)) * Math.pow(1.35, Math.floor(w / 25));

    const baseHp = (18 + (w - 1) * 7.5) * Math.pow(1.095, w - 1) * tierMult * earlyBuffer;
    const baseDmg = (4.5 + (w - 1) * 1.6) * Math.pow(1.082, w - 1) * Math.pow(1.16, Math.floor(w / 10)) * earlyBuffer;
    const baseGold = getWaveBaseGold(w) * getGoldMultiplier();

    let type = 'green', subType = 'normal', name = 'Yeşil Xenomorph', radius = 13, speed = 38 + Math.min(30, w * 0.18);
    let hp = baseHp, dmg = baseDmg, isRanged = false, isTeleporter = false, gold = baseGold;
    let isFrost = false, freezeDuration = 0, frostSlowDuration = 0;
    let attackInterval = 1.05, projSpeed = 220, stopDistOverride = null, kbResist = 1.0, dashCooldown = 0;
    let customPal = null;

    if (isBoss) {
        type = 'boss';
        const bossMult = (w === 5 ? 4.5 : (w % 10 === 0 ? 10.0 : 6.5));
        gold = baseGold * (game.holdWave ? 2.5 : 6.0);

        const bossPool = ['tank_boss', 'ranged_boss', 'speed_boss', 'frost_boss', 'leviathan'];
        const chosenBoss = bossPool[Math.floor(Math.random() * bossPool.length)];
        subType = chosenBoss;

        if (chosenBoss === 'tank_boss') {
            name = 'Zırhlı Titan Behemoth';
            radius = 40;
            speed = 14;
            hp = baseHp * bossMult * 1.85;
            dmg = baseDmg * 3.1;
            isRanged = false;
            stopDistOverride = 38;
            attackInterval = 1.65;
            kbResist = 0.08;
            customPal = { color: '#f59e0b', secColor: '#fef08a' };
        } else if (chosenBoss === 'ranged_boss') {
            name = 'Hiperiyon Topçusu';
            radius = 30;
            speed = 22;
            hp = baseHp * bossMult * 0.85;
            dmg = baseDmg * 2.15;
            isRanged = true;
            stopDistOverride = Math.max(165, getTowerRange() - 10);
            attackInterval = 0.95;
            projSpeed = 290;
            kbResist = 0.25;
            customPal = { color: '#ec4899', secColor: '#fbcfe8' };
        } else if (chosenBoss === 'speed_boss') {
            name = 'Kızıl Fırtına Vektörü';
            radius = 24;
            speed = 62;
            hp = baseHp * bossMult * 0.55;
            dmg = baseDmg * 1.75;
            isRanged = false;
            stopDistOverride = 32;
            attackInterval = 0.65;
            dashCooldown = 2.8;
            kbResist = 0.35;
            customPal = { color: '#ef4444', secColor: '#fecaca' };
        } else if (chosenBoss === 'frost_boss') {
            name = 'Kutup Hükümdarı Kryos';
            radius = 33;
            speed = 20;
            hp = baseHp * bossMult * 1.10;
            dmg = baseDmg * 1.90;
            isRanged = true;
            isFrost = true;
            freezeDuration = 1.15;
            frostSlowDuration = 4.0;
            stopDistOverride = 135;
            attackInterval = 1.55;
            projSpeed = 230;
            kbResist = 0.20;
            customPal = { color: '#38bdf8', secColor: '#e0f2fe' };
        } else {
            name = 'Kozmik Leviathan';
            radius = 32;
            speed = 24;
            hp = baseHp * bossMult;
            dmg = baseDmg * 2.25;
            isRanged = true;
            stopDistOverride = 110;
            attackInterval = 1.25;
            kbResist = 0.25;
        }

        if (typeof showToast === 'function') {
            showToast(`⚠️ BOSS GELDİ: ${name}!`);
        }
        if (typeof showBattleMoment === 'function') {
            showBattleMoment('boss', { name, wave: w, subtype: chosenBoss });
        }
    } else {
        const roll = Math.random();
        if (w >= 5 && roll < 0.14) {
            type = 'tank'; subType = 'tank'; name = 'Zırhlı Golem'; radius = 18; speed = 22;
            hp = baseHp * 2.60; dmg = baseDmg * 1.45; gold = baseGold * 1.35;
            kbResist = 0.35; stopDistOverride = 34;
            customPal = { color: '#64748b', secColor: '#e2e8f0' };
        } else if (w >= 3 && roll < 0.30) {
            const activeFrostCount = enemies.filter(e => e.type === 'frost').length;
            if (activeFrostCount < 2 && waveFrostSpawns < 4) {
                waveFrostSpawns++;
                type = 'frost'; subType = 'frost'; name = 'Buzul Nöbetçisi'; radius = 13; speed = 32;
                hp = baseHp * 0.95; dmg = baseDmg * 0.85; isRanged = true; isFrost = true;
                freezeDuration = 0.85; frostSlowDuration = 3.2;
                attackInterval = 1.60; stopDistOverride = Math.max(105, getTowerRange() - 25);
                gold = baseGold * 1.25;
                customPal = { color: '#06b6d4', secColor: '#cffafe' };
            } else if (Math.random() < 0.5) {
                type = 'ranged'; subType = 'ranged'; name = 'Mavi Nişancı'; radius = 12; speed = 30;
                hp = baseHp * 0.80; dmg = baseDmg * 0.95; isRanged = true; gold = baseGold * 1.10;
            } else {
                type = 'green'; subType = 'green'; name = 'Yeşil Xenomorph'; radius = 13; speed = 40;
                hp = baseHp * 1.0; dmg = baseDmg * 1.0; stopDistOverride = 30;
            }
        } else if (w >= 2 && roll < 0.44) {
            type = 'runner'; subType = 'runner'; name = 'Gölge Koşucu'; radius = 10; speed = 72;
            hp = baseHp * 0.52; dmg = baseDmg * 0.85; gold = baseGold * 1.10;
            attackInterval = 0.75; stopDistOverride = 30;
            customPal = { color: '#f43f5e', secColor: '#fda4af' };
        } else if (w >= 4 && roll < 0.60) {
            type = 'teleporter'; subType = 'teleporter'; name = 'Sarı Psişik'; radius = 11; speed = 48;
            hp = baseHp * 0.68; dmg = baseDmg * 0.90; isTeleporter = true; gold = baseGold * 1.15;
            stopDistOverride = 30;
        } else if (w >= 2 && roll < 0.78) {
            type = 'ranged'; subType = 'ranged'; name = 'Mavi Nişancı'; radius = 12; speed = 30;
            hp = baseHp * 0.80; dmg = baseDmg * 0.95; isRanged = true; gold = baseGold * 1.10;
        } else {
            type = 'green'; subType = 'green'; name = 'Yeşil Xenomorph'; radius = 13; speed = 40;
            hp = baseHp * 1.0; dmg = baseDmg * 1.0; stopDistOverride = 30;
        }
    }

    // v1.1.0: rare elite enemies add a high-value threat without changing save data or wave rules.
    let isElite = false;
    if (!isBoss && w >= 8 && Math.random() < 0.07) {
        isElite = true;
        name = `ÉLITE • ${name}`;
        hp *= 1.75;
        dmg *= 1.12;
        gold *= 2.25;
        radius += 2;
        speed *= 1.06;
        customPal = { color: '#f59e0b', secColor: '#fef3c7' };
    }

    const fallbackPal = (typeof getEnemyColors === 'function' ? getEnemyColors(type === 'boss' ? 'boss' : (isTeleporter ? 'teleporter' : (isRanged ? 'ranged' : 'green'))) : null) || { color: '#22c55e', secColor: '#ffffff' };
    const pal = customPal || fallbackPal;

    enemies.push({
        x, y, type, subType, name, radius, speed, isElite,
        hp: Math.round(hp), maxHp: Math.round(hp), dmg: Math.round(dmg * 10) / 10,
        color: pal.color, secColor: pal.secColor, gold,
        isRanged, isTeleporter, isFrost, freezeDuration, frostSlowDuration,
        attackCooldown: 1.0, attackInterval, projSpeed, stopDistOverride, kbResist,
        teleCooldown: 4.0, dashCooldown,
        kbCount: 0, kbImmunityTimer: 0,
        slowTimer: 0, slowFactor: 1, hitFlash: 0,
        rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 3, animPhase: Math.random() * Math.PI * 2
    });

    if (isBoss) {
        // A short, original arrival burst gives each boss a physical entrance without changing combat stats.
        rings.push({ x, y, radius: Math.max(18, radius * 0.62), color: pal.color, life: 0.95 });
        rings.push({ x, y, radius: Math.max(30, radius * 1.12), color: pal.secColor || '#f8fafc', life: 0.62 });
        createParticles(x, y, pal.color, 16, 105);
        createParticles(x, y, pal.secColor || '#f8fafc', 7, 68);
    }
}

function applyFrostToTower(freezeDur = 0, slowDur = 3.0) {
    tower.frostSlowTimer = Math.max(tower.frostSlowTimer || 0, slowDur);

    const isImmuneToFreeze = (tower.freezeTimer > 0) || ((tower.freezeImmunityTimer || 0) > 0);
    if (!isImmuneToFreeze && freezeDur > 0 && (freezeDur >= 1.0 || Math.random() < 0.30)) {
        tower.freezeTimer = Math.max(tower.freezeTimer || 0, freezeDur);
        addFloatingText(tower.x, tower.y - 26, '❄️ KULE DONDU!', '#38bdf8', 13);
        rings.push({ x: tower.x, y: tower.y, radius: 18, color: '#38bdf8', life: 0.75 });
    } else if ((tower.freezeImmunityTimer || 0) > 0 && freezeDur > 0) {
        addFloatingText(tower.x, tower.y - 22, '🛡️ DONMA KORUMASI', '#bae6fd', 10);
    } else {
        addFloatingText(tower.x, tower.y - 22, '❄️ BUZ YAVAŞLATMASI', '#7dd3fc', 10);
    }
    createParticles(tower.x, tower.y, '#38bdf8', 8, 65);
}

function createParticles(x, y, color, count = 8, speed = 70) {
    if (particles.length > 120) count = Math.min(count, 3);
    if (particles.length > 180) return;

    for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (0.3 + Math.random() * 0.7) * speed;
        particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, radius: 1.5 + Math.random() * 2.5, color, alpha: 1, life: 0.35 + Math.random() * 0.25 });
    }
}

function addFloatingText(x, y, text, color = '#ffffff', size = 12) {
    if (!game.settings.showDamageText) return;
    if (floatingTexts.length > 35) floatingTexts.shift();
    floatingTexts.push({ x: x + (Math.random() * 12 - 6), y: y - 8, text, color, size, alpha: 1, vy: -28 });
}

function updateGame(dt) {
    if (isPaused) return;

    playTimeAccum += dt;
    if (playTimeAccum >= 1) { game.stats.playTimeSeconds += Math.floor(playTimeAccum); playTimeAccum %= 1; }

    if (isDefeated) {
        defeatTimer -= dt;
        document.getElementById('defeat-timer-bar').style.width = `${Math.max(0, (defeatTimer / 2.5) * 100)}%`;
        if (defeatTimer <= 0) recoverFromDefeat();
        return;
    }

    const simDt = dt * gameSpeed;

    if (game.holdWave) {
        game.holdWaveTimer += simDt;
        if (game.holdWaveTimer >= 60) {
            game.holdWave = false; game.holdWaveTimer = 0;
            updateHoldWaveButton(); showToast('Farm süresi doldu! Otomatik İlerleme modu aktif.');
        }
    }

    tower.maxHp = getTowerMaxHp(); tower.maxShield = getTowerMaxShield();
    if (tower.hp < tower.maxHp) tower.hp = Math.min(tower.maxHp, tower.hp + getTowerRegen() * simDt);
    if (tower.maxShield > 0 && tower.shield < tower.maxShield) tower.shield = Math.min(tower.maxShield, tower.shield + (tower.maxShield * 0.05) * simDt);
    if (tower.recoil > 0) tower.recoil = Math.max(0, tower.recoil - simDt * 15);

    if (tower.freezeTimer > 0) {
        tower.freezeTimer = Math.max(0, tower.freezeTimer - simDt);
        tower.frostVisualTick = (tower.frostVisualTick || 0) + simDt;
        if (tower.frostVisualTick >= 0.25) {
            tower.frostVisualTick = 0;
            createParticles(tower.x, tower.y, '#bae6fd', 3, 35);
        }
        if (tower.freezeTimer === 0) {
            tower.freezeImmunityTimer = 2.5;
            addFloatingText(tower.x, tower.y - 24, '🛡️ 2.5sn BAĞIŞIKLIK', '#7dd3fc', 10);
        }
    } else if (tower.freezeImmunityTimer > 0) {
        tower.freezeImmunityTimer = Math.max(0, tower.freezeImmunityTimer - simDt);
    }

    if (tower.frostSlowTimer > 0) {
        tower.frostSlowTimer = Math.max(0, tower.frostSlowTimer - simDt);
    }

    if (tower.overdriveTimer > 0) {
        tower.overdriveTimer = Math.max(0, tower.overdriveTimer - dt);
        tower.overdriveVisualTick = (tower.overdriveVisualTick || 0) + dt;
        if (tower.overdriveVisualTick >= 0.22) {
            tower.overdriveVisualTick = 0;
            createParticles(tower.x, tower.y, '#f97316', 2, 45);
        }
    }

    cargoSpawnTimer -= dt;
    if (cargoSpawnTimer <= 0) {
        cargoSpawnTimer = 45 + Math.random() * 15;
        spawnCargoDrone();
    }

    for (let i = cargoDrones.length - 1; i >= 0; i--) {
        const d = cargoDrones[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.rot += dt * 2.2;
        d.pulsePhase += dt * 5;
        d.life -= dt;
        if (d.qteActive) {
            d.qteTimer = Math.max(0, d.qteTimer - dt);
            if (d.qteTimer <= 0) {
                d.qteActive = false;
                if (typeof showToast === 'function') showToast('⏱️ Bonus süresi doldu. Drona dokunarak normal ganimeti alabilirsin.');
            }
        }
        d.trailTick = (d.trailTick || 0) + dt;
        if (d.trailTick >= 0.08 && particles.length < 160) {
            d.trailTick = 0;
            particles.push({
                x: d.x - (d.vx * 0.04),
                y: d.y - (d.vy * 0.04),
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.5) * 18,
                radius: 2 + Math.random() * 1.5,
                color: d.color,
                alpha: 0.85,
                life: 0.35
            });
        }
        const outOfBounds = d.x < -80 || d.x > canvas.width + 80 || d.y < -80 || d.y > canvas.height + 80;
        if (d.life <= 0 || outOfBounds) {
            cargoDrones.splice(i, 1);
        }
    }

    const isBossWave = game.wave % 5 === 0;
    const isSwarmWave = game.wave % 3 === 0;
    const baseCap = 9 + Math.floor(game.wave / 6);

    let capMult = 1.0, intervalMult = 1.0;
    if (isBossWave) { capMult = 1.6; intervalMult = 0.75; }
    else if (isSwarmWave) { capMult = 1.8; intervalMult = 0.5; }

    const maxEnemies = Math.min(40, Math.round(baseCap * capMult));

    spawnTimer -= simDt;
    if (spawnTimer <= 0 && enemies.length < maxEnemies) {
        const baseInterval = Math.max(0.7, 1.7 - game.wave * 0.01);
        spawnTimer = baseInterval * intervalMult;
        spawnEnemy(false);
    }

    const baseFrostFactor = tower.freezeTimer > 0 ? 0 : (tower.frostSlowTimer > 0 ? 0.55 : 1.0);
    const overdriveFactor = (tower.overdriveTimer && tower.overdriveTimer > 0) ? 2.0 : 1.0;
    const fireRateFactor = baseFrostFactor * overdriveFactor;
    tower.fireCooldown -= simDt * fireRateFactor;

    const range = getTowerRange();
    if (tower.freezeTimer <= 0 && tower.fireCooldown <= 0 && enemies.length > 0) {
        const inRange = enemies.map(e => ({ enemy: e, dist: Math.hypot(e.x - tower.x, e.y - tower.y) }))
            .filter(item => item.dist <= range + item.enemy.radius).sort((a, b) => a.dist - b.dist);
        if (inRange.length > 0) {
            const targetsCount = Math.min(inRange.length, getEffectiveMultishot());
            tower.fireCooldown = 1 / getTowerFireRate(); tower.recoil = 4;
            tower.angle = Math.atan2(inRange[0].enemy.y - tower.y, inRange[0].enemy.x - tower.x);
            for (let i = 0; i < targetsCount; i++) fireTowerProjectile(tower.x, tower.y, inRange[i].enemy, i, getEffectiveMultishot());
        }
    }

    updateCompanions(simDt);

    if (game.settings.activeTheme === 'snow') {
        for (const sf of snowFlakes) {
            sf.y += sf.vy * simDt; sf.x += sf.vx * simDt;
            if (sf.y > canvas.height) { sf.y = -5; sf.x = Math.random() * canvas.width; }
            if (sf.x < 0) sf.x = canvas.width; if (sf.x > canvas.width) sf.x = 0;
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const prevX = p.x;
        const prevY = p.y;

        p.x += p.vx * simDt;
        p.y += p.vy * simDt;
        p.life -= simDt;
        
        if (!p.history) p.history = [];
        p.history.unshift({ x: p.x, y: p.y });
        if (p.history.length > (p.isCrit ? 10 : 6)) p.history.pop();

        if (p.life <= 0) { projectiles.splice(i, 1); continue; }

        if (p.fromEnemy) {
            if (distToSegment(tower.x, tower.y, prevX, prevY, p.x, p.y) <= 24) {
                damageTower(p.damage, null);
                if (p.isFrost) {
                    applyFrostToTower(p.freezeDuration || 0.8, p.frostSlowDuration || 3.0);
                    // v1.1.0: frost boss impacts leave a readable crystalline burst.
                    if (p.isBossFrost) {
                        rings.push({ x: tower.x, y: tower.y, radius: 22, color: '#7dd3fc', life: 0.72 });
                        rings.push({ x: tower.x, y: tower.y, radius: 34, color: '#e0f2fe', life: 0.48 });
                        createParticles(tower.x, tower.y, '#7dd3fc', 12, 85);
                        createParticles(tower.x, tower.y, '#f0f9ff', 7, 58);
                        addFloatingText(tower.x, tower.y - 38, 'KRİYO DARBE!', '#bae6fd', 11);
                    } else {
                        createParticles(p.x, p.y, p.color || '#06b6d4', 5, 48);
                    }
                } else {
                    createParticles(p.x, p.y, p.color || '#06b6d4', 4, 40);
                }
                projectiles.splice(i, 1);
            }
        } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (p.hitList && p.hitList.includes(e)) continue;

                const segDist = distToSegment(e.x, e.y, prevX, prevY, p.x, p.y);
                if (segDist <= e.radius + p.radius + 2) {
                    if (p.splashRadius && p.splashRadius > 0) {
                        rings.push({ x: e.x, y: e.y, radius: 10, color: '#f97316', life: 0.9 });
                        createParticles(e.x, e.y, '#f97316', 12, 90);
                        for (let k = enemies.length - 1; k >= 0; k--) {
                            const aoeEnemy = enemies[k];
                            const distAoe = Math.hypot(aoeEnemy.x - e.x, aoeEnemy.y - e.y);
                            if (distAoe <= p.splashRadius + aoeEnemy.radius) {
                                const falloff = distAoe < 15 ? 1.0 : 0.70;
                                dealDamageToEnemy(aoeEnemy, Math.round(p.damage * falloff), p.isCrit, '#fb923c', false);
                            }
                        }
                    } else {
                        dealDamageToEnemy(e, p.damage, p.isCrit, p.isCrit ? '#c084fc' : '#60a5fa', true);
                        createParticles(e.x, e.y, p.color, 5, 50);
                    }

                    const kb = getTowerKnockback();
                    if (kb > 0 && e && enemies.includes(e) && e.kbCount < Math.min(2, game.upgrades.knockback || 0) && e.kbImmunityTimer <= 0) {
                        const pushAng = Math.atan2(e.y - tower.y, e.x - tower.x);
                        const resist = e.kbResist !== undefined ? e.kbResist : (e.type === 'boss' ? 0.25 : 1.0);
                        const actualPush = kb * resist;
                        e.x += Math.cos(pushAng) * actualPush; e.y += Math.sin(pushAng) * actualPush;
                        e.kbCount++; e.kbImmunityTimer = 1.4;
                        addFloatingText(e.x, e.y - 14, 'İTİLDİ', '#2dd4bf', 9);
                    }

                    if (p.bouncesLeft > 0) {
                        p.bouncesLeft--; p.damage = Math.max(1, Math.round(p.damage * 0.60)); p.hitList.push(e);
                        let nextTarget = null, minDist = 140;
                        for (const cand of enemies) {
                            if (!p.hitList.includes(cand) && Math.hypot(cand.x - e.x, cand.y - e.y) < minDist) { minDist = Math.hypot(cand.x - e.x, cand.y - e.y); nextTarget = cand; }
                        }
                        if (nextTarget) {
                            p.x = e.x; p.y = e.y;
                            const ang = Math.atan2(nextTarget.y - p.y, nextTarget.x - p.x);
                            const spd = Math.hypot(p.vx, p.vy); p.vx = Math.cos(ang) * spd; p.vy = Math.sin(ang) * spd;
                        } else { projectiles.splice(i, 1); }
                    } else { projectiles.splice(i, 1); }
                    break;
                }
            }
        }
    }

    const currentTowerRange = getTowerRange();
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - simDt * 6);
        if (e.kbImmunityTimer > 0) e.kbImmunityTimer = Math.max(0, e.kbImmunityTimer - simDt);
        e.rot += e.rotSpeed * simDt; e.animPhase = (e.animPhase || 0) + simDt * 5;
        if (e.slowTimer > 0) { e.slowTimer -= simDt; if (e.slowTimer <= 0) e.slowFactor = 1; }

        let targetStopDist = e.stopDistOverride || (e.isRanged ? Math.max(95, currentTowerRange - 15) : 30);

        if (e.isTeleporter) {
            e.teleCooldown -= simDt;
            if (e.teleCooldown <= 0) {
                e.teleCooldown = 3.8 + Math.random() * 2.0;
                const currDist = Math.hypot(tower.x - e.x, tower.y - e.y);
                if (currDist > 110) {
                    const blinkDist = Math.min(currDist - 55, 85);
                    const ang = Math.atan2(tower.y - e.y, tower.x - e.x);
                    e.x += Math.cos(ang) * blinkDist; e.y += Math.sin(ang) * blinkDist;
                    createParticles(e.x, e.y, '#eab308', 8, 80); addFloatingText(e.x, e.y, 'IŞINLANDI!', '#fef08a', 10);
                }
            }
        }

        if (e.dashCooldown && e.dashCooldown > 0) {
            e.dashCooldown -= simDt;
            if (e.dashCooldown <= 0) {
                e.dashCooldown = 2.8 + Math.random() * 1.2;
                const currDist = Math.hypot(tower.x - e.x, tower.y - e.y);
                if (currDist > 75) {
                    const dashDist = Math.min(currDist - 38, 65);
                    const ang = Math.atan2(tower.y - e.y, tower.x - e.x);
                    const dashStartX = e.x, dashStartY = e.y;
                    createParticles(dashStartX, dashStartY, '#ef4444', 7, 72);
                    createParticles(dashStartX, dashStartY, '#fecaca', 4, 48);
                    e.x += Math.cos(ang) * dashDist; e.y += Math.sin(ang) * dashDist;
                    rings.push({ x: dashStartX, y: dashStartY, radius: 18, color: '#ef4444', life: 0.45 });
                    rings.push({ x: e.x, y: e.y, radius: 25, color: '#fca5a5', life: 0.58 });
                    createParticles(e.x, e.y, '#ef4444', 12, 105);
                    createParticles(e.x, e.y, '#fecaca', 6, 62);
                    addFloatingText(e.x, e.y, '⚡ ATILDI!', '#fca5a5', 11);
                }
            }
        }

        const dist = Math.hypot(tower.x - e.x, tower.y - e.y);
        const ang = Math.atan2(tower.y - e.y, tower.x - e.x);

        if (dist > targetStopDist) {
            const step = Math.min(dist - targetStopDist, e.speed * e.slowFactor * simDt);
            e.x += Math.cos(ang) * step;
            e.y += Math.sin(ang) * step;
        } else {
            if (!e.isRanged && dist < targetStopDist - 1) {
                const pushOutAngle = Math.atan2(e.y - tower.y, e.x - tower.x);
                e.x = tower.x + Math.cos(pushOutAngle) * targetStopDist;
                e.y = tower.y + Math.sin(pushOutAngle) * targetStopDist;
            } else if (e.isRanged && dist < targetStopDist - 10) {
                const spd = e.speed * 0.5 * e.slowFactor;
                e.x -= Math.cos(ang) * spd * simDt;
                e.y -= Math.sin(ang) * spd * simDt;
            }

            e.attackCooldown -= simDt;
            if (e.attackCooldown <= 0) {
                e.attackCooldown = e.attackInterval || (e.isRanged ? 1.35 : 1.05);
                if (e.isRanged) {
                    const pSpd = e.projSpeed || 220;
                    // v1.1.0 boss signature: artillery and Leviathan fire a readable three-shot fan.
                    // Split damage keeps the pattern threatening without tripling total damage.
                    const isBossFan = e.type === 'boss' && (e.subType === 'ranged_boss' || e.subType === 'leviathan');
                    const shotAngles = isBossFan ? [-0.17, 0, 0.17] : [0];
                    // Armor is applied separately to each projectile, so split raw damage alone
                    // would under-deal against armored towers. Invert damageTower's reduction
                    // to keep three successful hits close to one ordinary hit after armor.
                    let fanShotDamage = e.dmg;
                    if (isBossFan) {
                        const armorVal = getTowerArmor();
                        const singleHitDamage = Math.max(1, Math.round(Math.max(e.dmg * 0.25, e.dmg - armorVal)));
                        const targetDamagePerShot = singleHitDamage / 3;
                        fanShotDamage = targetDamagePerShot <= armorVal / 3
                            ? targetDamagePerShot * 4
                            : targetDamagePerShot + armorVal;
                    }
                    for (const offset of shotAngles) {
                        const shotAngle = ang + offset;
                        projectiles.push({
                            x: e.x, y: e.y,
                            vx: Math.cos(shotAngle) * pSpd, vy: Math.sin(shotAngle) * pSpd,
                            radius: e.type === 'boss' ? 6.5 : 4.5,
                            color: e.isFrost ? '#38bdf8' : e.color,
                            damage: fanShotDamage,
                            life: 3.5, fromEnemy: true,
                            isFrost: e.isFrost || false,
                            isBossFrost: e.type === 'boss' && e.subType === 'frost_boss',
                            freezeDuration: e.freezeDuration || 0,
                            frostSlowDuration: e.frostSlowDuration || 0
                        });
                    }
                    if (isBossFan) {
                        rings.push({ x: e.x, y: e.y, radius: 10, color: e.color || '#c084fc', life: 0.32 });
                        createParticles(e.x, e.y, e.secColor || '#ffffff', 4, 42);
                    }
                } else {
                    damageTower(e.dmg, e);
                    if (e.isFrost) applyFrostToTower(e.freezeDuration, e.frostSlowDuration);
                    if (e.type === 'boss') {
                        rings.push({ x: tower.x, y: tower.y, radius: 14, color: e.color, life: 0.5 });
                        if (e.subType === 'tank_boss') {
                            // Heavy titan impact: strong feedback without adding hidden bonus damage.
                            rings.push({ x: tower.x, y: tower.y, radius: 30, color: '#fbbf24', life: 0.72 });
                            createParticles(tower.x, tower.y, '#fbbf24', 14, 105);
                            createParticles(tower.x, tower.y, '#f8fafc', 7, 65);
                            addFloatingText(tower.x, tower.y - 26, 'AĞIR DARBE!', '#fde68a', 12);
                        }
                    }
                }
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i]; pt.x += pt.vx * simDt; pt.y += pt.vy * simDt; pt.life -= simDt; pt.alpha = Math.max(0, pt.life * 2);
        if (pt.life <= 0) particles.splice(i, 1);
    }
    
    for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += 50 * simDt;
        r.life -= simDt * 1.5;
        if (r.life <= 0) rings.splice(i, 1);
    }

    for (let i = lightningBeams.length - 1; i >= 0; i--) { lightningBeams[i].life -= simDt; if (lightningBeams[i].life <= 0) lightningBeams.splice(i, 1); }
    for (let i = floatingTexts.length - 1; i >= 0; i--) { const ft = floatingTexts[i]; ft.y += ft.vy * simDt; ft.alpha -= simDt * 1.1; if (ft.alpha <= 0) floatingTexts.splice(i, 1); }
    updateHUD();
}

function fireTowerProjectile(startX, startY, target, barrelIdx = 0, totalBarrels = 1) {
    const baseAngle = Math.atan2(target.y - startY, target.x - startX);
    const distToTarget = Math.hypot(target.x - startX, target.y - startY);
    const speed = 360;
    const isCrit = Math.random() * 100 < getTowerCritChance();
    let dmg = getTowerDamage();
    if (isCrit) dmg = Math.round(dmg * getTowerCritMult());

    const bCount = Math.min(7, Math.max(1, totalBarrels));
    const norm = barrelIdx < bCount ? (barrelIdx - (bCount - 1) / 2) : 0;
    const perpAngle = tower.angle + Math.PI / 2;

    const muzzleDist = Math.min(10, distToTarget * 0.35);
    const lateralScale = Math.min(1, distToTarget / 65);
    const lateralOffset = (bCount === 2 ? norm * 8 : norm * 4.5) * lateralScale;

    const spawnX = startX + Math.cos(baseAngle) * muzzleDist + Math.cos(perpAngle) * lateralOffset;
    const spawnY = startY + Math.sin(baseAngle) * muzzleDist + Math.sin(perpAngle) * lateralOffset;

    const aimAngle = Math.atan2(target.y - spawnY, target.x - spawnX);

    const skinDef = SKIN_DATABASE[game.activeSkin] || SKIN_DATABASE.default_cyber;
    const projColor = isCrit ? (skinDef.critColor || '#c084fc') : (skinDef.projColor || '#60a5fa');

    projectiles.push({
        x: spawnX, y: spawnY,
        vx: Math.cos(aimAngle) * speed, vy: Math.sin(aimAngle) * speed,
        radius: isCrit ? 5 : 4.0, color: projColor, damage: dmg, isCrit,
        bouncesLeft: game.upgrades.bounce, hitList: [], life: 2.0, fromEnemy: false
    });
}

function updateCompanions(simDt) {
    for (const [key, st] of Object.entries(game.companions)) {
        const star = Math.min(5, Math.max(0, st.unlocked ? (st.level || 1) : 0));
        if (star <= 0) continue;
        const def = COMPANION_DEFS[key];
        const idx = star - 1;

        if (!st.angle) st.angle = Math.random() * Math.PI * 2;
        st.angle += def.orbitSpeed * simDt;
        st.x = tower.x + Math.cos(st.angle) * def.orbitRadius;
        st.y = tower.y + Math.sin(st.angle) * def.orbitRadius;

        if (!st.cooldown) st.cooldown = 0;
        st.cooldown -= simDt;
        if (st.cooldown > 0) continue;

        const compBoost = getCompanionBoost();
        const towerDmg = getTowerDamage();

        if (key === 'laserDrone' && enemies.length > 0) {
            const target = getClosestEnemy(st.x, st.y, 190 + star * 15);
            if (target) {
                st.cooldown = def.cooldowns[idx];
                const isCrit = star >= 5 && (Math.random() * 100 < getTowerCritChance() * 0.5);
                let dmg = Math.max(1, Math.round(towerDmg * def.damageMults[idx] * compBoost));
                if (isCrit) dmg = Math.round(dmg * getTowerCritMult());
                dealDamageToEnemy(target, dmg, isCrit, isCrit ? '#facc15' : '#ef4444');
                lightningBeams.push({ x1: st.x, y1: st.y, x2: target.x, y2: target.y, color: isCrit ? '#facc15' : '#ef4444', life: 0.11 });
            }
        } else if (key === 'frostOrb' && enemies.length > 0) {
            st.cooldown = Math.max(1.1, 1.8 - star * 0.12);
            const frostRadius = 135 + star * 18;
            const slowRatio = 1 - (def.slowPcts[idx] / 100);
            const frostDmg = Math.max(1, Math.round(towerDmg * def.damageMults[idx] * compBoost));
            let hitAny = false;
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (Math.hypot(e.x - st.x, e.y - st.y) <= frostRadius) {
                    e.slowFactor = Math.min(e.slowFactor, slowRatio);
                    e.slowTimer = 2.2 + star * 0.25;
                    dealDamageToEnemy(e, frostDmg, false, '#38bdf8');
                    hitAny = true;
                }
            }
            if (hitAny) rings.push({ x: st.x, y: st.y, radius: 15, color: '#38bdf8', life: 0.65 });
        } else if (key === 'missileBot' && enemies.length > 0) {
            const target = getClosestEnemy(st.x, st.y, 260);
            if (target) {
                st.cooldown = def.cooldowns[idx];
                const ang = Math.atan2(target.y - st.y, target.x - st.x);
                const dmg = Math.max(1, Math.round(towerDmg * def.damageMults[idx] * compBoost));
                projectiles.push({
                    x: st.x, y: st.y, vx: Math.cos(ang) * 270, vy: Math.sin(ang) * 270,
                    radius: 5.5 + star * 0.5, color: '#f97316', damage: dmg,
                    splashRadius: def.splashRadii[idx], isCrit: false, bouncesLeft: 0, hitList: [], life: 2.5, fromEnemy: false
                });
            }
        } else if (key === 'repairDrone') {
            st.cooldown = 2.0;
            const healPct = def.healPcts[idx] / 100;
            if (tower.hp < tower.maxHp) {
                const heal = Math.max(1, Math.round(tower.maxHp * healPct));
                tower.hp = Math.min(tower.maxHp, tower.hp + heal);
                addFloatingText(tower.x, tower.y - 18, `+${formatNumber(heal)} HP`, '#10b981', 12);
            }
            if (tower.maxShield > 0 && tower.shield < tower.maxShield) {
                const sHeal = Math.max(1, Math.round(tower.maxShield * healPct));
                tower.shield = Math.min(tower.maxShield, tower.shield + sHeal);
            }
        } else if (key === 'plasmaSatellite' && enemies.length > 0) {
            const chainCount = def.chainCounts[idx];
            const sorted = [...enemies].sort((a, b) => Math.hypot(a.x - st.x, a.y - st.y) - Math.hypot(b.x - st.x, b.y - st.y)).slice(0, chainCount);
            if (sorted.length > 0 && Math.hypot(sorted[0].x - st.x, sorted[0].y - st.y) <= 280) {
                st.cooldown = Math.max(1.2, 1.9 - star * 0.12);
                let prevX = st.x, prevY = st.y;
                for (const target of sorted) {
                    const maxHpBonusDmg = Math.round(target.maxHp * (def.maxHpPcts[idx] / 100));
                    const dmg = Math.max(1, Math.round(towerDmg * def.damageMults[idx] * compBoost)) + maxHpBonusDmg;
                    lightningBeams.push({ x1: prevX, y1: prevY, x2: target.x, y2: target.y, color: '#a855f7', life: 0.16 });
                    prevX = target.x; prevY = target.y;
                    dealDamageToEnemy(target, dmg, false, '#c084fc');
                }
            }
        }
    }
}

function getClosestEnemy(x, y, maxDist) {
    let closest = null, minDist = maxDist;
    for (const e of enemies) { const d = Math.hypot(e.x - x, e.y - y); if (d < minDist) { minDist = d; closest = e; } }
    return closest;
}

function dealDamageToEnemy(enemy, amount, isCrit = false, color = '#ffffff', applyLS = false) {
    if (!enemies.includes(enemy)) return;
    enemy.hp -= amount; enemy.hitFlash = 1;
    addFloatingText(enemy.x, enemy.y, formatNumber(amount) + (isCrit ? '!' : ''), color, isCrit ? 14 : 11);

    if (applyLS) { const ls = getTowerLifesteal(); if (ls > 0 && tower.hp < tower.maxHp) tower.hp = Math.min(tower.maxHp, tower.hp + amount * ls); }
    if (enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
    const idx = enemies.indexOf(enemy); if (idx === -1) return;
    enemies.splice(idx, 1);

    const goldEarned = Math.max(1, Math.round(enemy.gold)); game.gold += goldEarned;
    addFloatingText(enemy.x, enemy.y - 10, `+${formatNumber(goldEarned)} 🪙`, '#fbbf24', 11);

    const crystalChance = getCrystalDropChance() * (game.holdWave ? 0.35 : 1.0);
    const crystalMult = getCrystalDropMult();
    if (enemy.type === 'boss') {
        const baseBossCrystals = Math.round((5 + Math.floor(game.wave * 0.75)) * crystalMult);
        const c = game.holdWave ? Math.max(1, Math.round(baseBossCrystals * 0.35)) : baseBossCrystals;
        game.crystals += c; game.stats.bossKills++;
        addFloatingText(enemy.x, enemy.y - 24, `+${formatNumber(c)} 💎`, '#22d3ee', 15);
        showToast(`${enemy.name || 'Boss'} İmha Edildi! +${formatNumber(c)} Kristal!`);
        if (typeof showBattleMoment === 'function') {
            showBattleMoment('bossKill', { name: enemy.name || 'Boss', gold: goldEarned, crystals: c });
        }
    } else if (Math.random() * 100 < crystalChance) {
        const cAmt = Math.max(1, Math.round(crystalMult));
        game.crystals += cAmt;
        addFloatingText(enemy.x, enemy.y - 22, `+${cAmt} 💎`, '#22d3ee', 13);
    }

    createParticles(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 24 : 10, 85);
    rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 0.5, color: enemy.color, life: 1.0, isBossDeath: enemy.type === 'boss' });
    if (enemy.type === 'boss') {
        // V2.6 cinematic boss defeat: mark only the existing cosmetic rings for enhanced rendering.
        // The same ring timing, reward path, and combat outcome are preserved.
        rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 0.9, color: enemy.secColor || '#f8fafc', life: 0.9, isBossDeath: true });
        rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 1.45, color: enemy.color, life: 0.66, isBossDeath: true });
        createParticles(enemy.x, enemy.y, enemy.secColor || '#f8fafc', 12, 120);
    }
    if (enemy.isElite) {
        // Elite defeat gets a brief gold shockwave and extra sparks, using existing effects.
        createParticles(enemy.x, enemy.y, '#fbbf24', 12, 125);
        rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 0.8, color: '#fbbf24', life: 1.15 });
        rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 1.25, color: '#fef3c7', life: 0.75 });
    }

    game.stats.totalKills++; game.waveKills++;
    if (game.waveKills >= game.waveTargetKills) completeWave();
    if (isDrawerOpen) refreshUpgradeButtonsState();
}

function damageTower(rawDamage, attacker) {
    const armorVal = getTowerArmor();
    const flatReduced = Math.max(rawDamage * 0.25, rawDamage - armorVal);
    const reduced = Math.max(1, Math.round(flatReduced));
    if (attacker && game.upgrades.thorns > 0) {
        const ref = Math.round((rawDamage + armorVal * 0.4) * (getTowerThorns() / 100));
        if (ref > 0) dealDamageToEnemy(attacker, ref, false, '#fb7185');
    }

    let rem = reduced;
    if (tower.shield > 0) { if (tower.shield >= rem) { tower.shield -= rem; rem = 0; } else { rem -= tower.shield; tower.shield = 0; } }
    if (rem > 0) { tower.hp -= rem; createParticles(tower.x, tower.y, '#ef4444', 5, 50); }
    if (tower.hp <= 0) { tower.hp = 0; triggerTowerDefeat(); }
}

function completeWave() {
    const completedWaveNumber = game.wave;
    const wasHoldWave = game.holdWave;
    let waveRewardGold = 0;
    let milestoneCrystalsAwarded = 0;
    if (!game.holdWave) {
        const interestCap = Math.round(getWaveBaseGold(game.wave) * 25 * getGoldMultiplier());
        const interestGold = Math.min(interestCap, Math.floor(game.gold * (game.upgrades.interest * 0.004)));
        const total = Math.round(getWaveBonusPreview(game.upgrades.waveGold) + interestGold);
        waveRewardGold = total;
        if (total > 0) { game.gold += total; addFloatingText(tower.x, tower.y - 35, `Dalga Ödülü: +${formatNumber(total)} 🪙`, '#f59e0b', 14); }

        const prevHighest = game.highestWave; game.wave++;
        if (game.wave > game.highestWave) {
            game.highestWave = game.wave;
            if (game.highestWave % 10 === 0) {
                const milestoneCrystals = 15 + Math.floor(game.highestWave * 1.0);
                milestoneCrystalsAwarded = milestoneCrystals;
                game.crystals += milestoneCrystals;
                showToast(`🏆 Dalga ${game.highestWave} Rekor Ödülü: +${milestoneCrystals} 💎 Kristal!`);
            }
            if (prevHighest < 15 && game.highestWave >= 15) showToast('⚔️ 15. Dalga! Cengiz Hakanlığı Teması Açıldı!');
            else if (prevHighest < 30 && game.highestWave >= 30) showToast('❄️ 30. Dalga! Kar Teması Açıldı!');
            else if (prevHighest < 45 && game.highestWave >= 45) showToast('🌵 45. Dalga! Kızıl Çöl Teması Açıldı!');
            else if (prevHighest < 60 && game.highestWave >= 60) showToast('🚀 60. Dalga! Derin Uzay Nebulası Teması Açıldı!');
            else if (prevHighest < 100 && game.highestWave >= 100) showToast('🦋 100. Dalga! Buubglegum Kelebek Teması Açıldı!');
        }
        game.consecutiveDefeats = 0;
    } else {
        game.holdWaveTimer = 0; game.consecutiveHoldWins++; addFloatingText(tower.x, tower.y - 35, `Farm Modu (${game.consecutiveHoldWins}/4)`, '#38bdf8', 11);
        if (game.consecutiveHoldWins >= 4) { game.holdWave = false; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast('Farm modunda 4 dalga geçildi! Otomatik İlerleme aktif.'); }
    }
    if (!wasHoldWave) {
        // Small reward pulse around the core: visual-only, no gameplay values are changed.
        rings.push({ x: tower.x, y: tower.y, radius: 18, color: '#e8b66b', life: 0.9 });
        rings.push({ x: tower.x, y: tower.y, radius: 30, color: '#f8d9a0', life: 0.58 });
        createParticles(tower.x, tower.y, '#e8b66b', 9, 72);
    }
    if (!wasHoldWave && typeof showBattleMoment === 'function') {
        showBattleMoment('clear', { wave: completedWaveNumber, gold: waveRewardGold, crystals: milestoneCrystalsAwarded });
    }
    waveFrostSpawns = 0;
    game.waveKills = 0; game.waveTargetKills = Math.min(45, 14 + Math.floor(game.wave * 0.25)); tower.hp = Math.min(tower.maxHp, tower.hp + tower.maxHp * 0.15);
    if (!game.holdWave && game.wave % 5 === 0 && !enemies.some(e => e.type === 'boss')) spawnEnemy(true);
    updatePrestigeUI(); refreshUpgradeButtonsState(); saveGame(true);
}

function triggerTowerDefeat() {
    game.consecutiveDefeats++;
    if (game.consecutiveDefeats >= 2) {
        isDefeated = true;
        defeatTimer = 2.5;
        document.getElementById('defeat-overlay').classList.remove('hidden');
    } else {
        showToast(`Kule ağır hasar aldı! 2. yenilgide farm moduna geçilecek.`);
        tower.hp = tower.maxHp * 0.5;
        rings.push({ x: tower.x, y: tower.y, radius: 15, color: '#ef4444', life: 0.9 });
        for (const e of enemies) {
            const d = Math.hypot(e.x - tower.x, e.y - tower.y);
            if (d < 90) {
                const pushAng = Math.atan2(e.y - tower.y, e.x - tower.x);
                e.x = tower.x + Math.cos(pushAng) * 95;
                e.y = tower.y + Math.sin(pushAng) * 95;
            }
        }
    }
}

function recoverFromDefeat() {
    isDefeated = false; document.getElementById('defeat-overlay').classList.add('hidden'); enemies = []; projectiles = [];
    tower.freezeTimer = 0; tower.freezeImmunityTimer = 0; tower.frostSlowTimer = 0; waveFrostSpawns = 0;

    const salvageGold = Math.floor(getWaveBaseGold(game.wave) * getGoldMultiplier() * 8);
    const salvageCrystal = Math.max(1, Math.floor(game.wave / 4));
    game.gold += salvageGold;
    game.crystals += salvageCrystal;

    if (game.wave > 1) { 
        game.wave--; 
        game.holdWave = true; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; 
        updateHoldWaveButton(); 
        showToast(`💥 Kule Yıkıldı! Enkazdan ${formatNumber(salvageGold)} 🪙 ve ${salvageCrystal} 💎 kurtardın. Güvenli dalgaya çekildin.`); 
    } else {
        showToast(`💥 Kule Yıkıldı! Enkazdan ${formatNumber(salvageGold)} 🪙 ve ${salvageCrystal} 💎 kurtardın. Yeniden toparlan!`);
    }

    game.consecutiveDefeats = 0; game.waveKills = 0; tower.hp = getTowerMaxHp(); tower.shield = getTowerMaxShield(); updateHUD();
}

function toggleHoldWave() { game.holdWave = !game.holdWave; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast(game.holdWave ? 'Farm Modu Açıldı (4 dalga sonra oto döner)' : 'Otomatik İlerleme Açıldı'); }
function updateHoldWaveButton() {
    const btn = document.getElementById('btn-hold-wave'), icon = document.getElementById('icon-hold-wave'), txt = document.getElementById('text-hold-wave'); if (!btn) return;
    if (game.holdWave) { btn.className = 'px-2 py-0.5 rounded bg-amber-500/25 border border-amber-500/40 text-[10px] font-semibold text-amber-300 transition flex items-center gap-1'; icon.className = 'fa-solid fa-repeat'; txt.textContent = 'Farm'; }
    else { btn.className = 'px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-400 transition flex items-center gap-1'; icon.className = 'fa-solid fa-forward'; txt.textContent = 'Oto İlerle'; }
}

let lastFrameTime = performance.now();
let lastTabCheckTime = 0;

const ACTIVE_TAB_KEY = 'towerDefense_activeTab';
const TAB_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const TAB_LOCK_TIMEOUT = 8000;

let isDuplicateTab = false;
let gameSaveTimer = null;
let tabHeartbeat = null;

function readActiveTab() {
    try {
        return JSON.parse(localStorage.getItem(ACTIVE_TAB_KEY));
    } catch {
        return null;
    }
}

function claimActiveTab() {
    const active = readActiveTab();
    const now = Date.now();

    if (
        active &&
        active.id !== TAB_ID &&
        now - active.time < TAB_LOCK_TIMEOUT
    ) {
        return false;
    }

    localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify({
        id: TAB_ID,
        time: now
    }));

    return true;
}

function showDuplicateTabScreen() {
    if (isDuplicateTab) return;
    isDuplicateTab = true;

    if (gameSaveTimer !== null) clearInterval(gameSaveTimer);
    if (tabHeartbeat !== null) clearInterval(tabHeartbeat);

    const overlay = document.createElement('div');
    overlay.id = 'duplicate-tab-warning';
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:#020617;color:white;
        display:flex;align-items:center;
        justify-content:center;text-align:center;
        padding:24px;font:16px sans-serif;
    `;

    overlay.innerHTML = `
        <div>
            <h2>Oyun başka bir sekmede açık</h2>
            <p>Oynamak için diğer oyun sekmesini kapatıp bu sayfayı yenile.</p>
        </div>
    `;

    document.body.appendChild(overlay);
}

function gameLoop(now) {
    if (isDuplicateTab) return;

    // Performans için localStorage kontrolünü her karede değil saniyede 1 kez yap
    if (now - lastTabCheckTime > 1000) {
        lastTabCheckTime = now;
        const active = readActiveTab();
        if (!active || active.id !== TAB_ID) {
            showDuplicateTabScreen();
            return;
        }
    }

    const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    updateGame(dt);
    renderGame();
    updateRouletteAnimation(now);

    if (!isDuplicateTab) requestAnimationFrame(gameLoop);
}

window.addEventListener('storage', event => {
    if (event.key !== ACTIVE_TAB_KEY || isDuplicateTab) return;

    const active = readActiveTab();

    if (active && active.id !== TAB_ID &&
        Date.now() - active.time < TAB_LOCK_TIMEOUT) {
        showDuplicateTabScreen();
    }
});

window.addEventListener('pagehide', () => {
    if (gameSaveTimer !== null) clearInterval(gameSaveTimer);
    if (tabHeartbeat !== null) clearInterval(tabHeartbeat);

    const active = readActiveTab();

    if (active && active.id === TAB_ID) {
        localStorage.removeItem(ACTIVE_TAB_KEY);
    }
});

window.onload = function () {
    if (!claimActiveTab()) {
        showDuplicateTabScreen();
        return;
    }

    loadGame();
    // Başlangıçta mod seçimi görünür; simülasyon menü arkasında ilerlemesin.
    isPaused = true;
    resizeCanvas();

    tower.maxHp = getTowerMaxHp();
    tower.hp = tower.maxHp;
    tower.maxShield = getTowerMaxShield();
    tower.shield = tower.maxShield;

    applyBodyClasses();
    setDeviceMode(game.deviceMode || 'pc');
    updateHoldWaveButton();
    buildUpgradesUI();
    buildInventoryUI();
    drawRouletteWheel();
    updateHUD();

    gameSaveTimer = setInterval(() => {
        if (!isDuplicateTab) {
            const active = readActiveTab();
            if (active && active.id === TAB_ID) saveGame(false);
            else showDuplicateTabScreen();
        }
    }, 15000);

    tabHeartbeat = setInterval(() => {
        if (isDuplicateTab) return;

        const active = readActiveTab();

        if (!active || active.id !== TAB_ID) {
            showDuplicateTabScreen();
            return;
        }

        localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify({
            id: TAB_ID,
            time: Date.now()
        }));
    }, 2000);

    requestAnimationFrame(gameLoop);
};

// =======================================================
// 🛡️ ANTI-CHEAT: GÖLGE KASA VE BELLEK KORUMASI
// =======================================================
(function initAntiCheat() {
    const SECRET_SALT = "Kule_v11_KrM_2026_#99!";
    let shadow = null;
    let cheatFlags = 0;

    // Companion objects also contain live combat/render fields (angle, x/y, cooldown).
    // Those fields legitimately change during play and must never participate in anti-cheat
    // progression comparisons. Only the persistent unlock/star progression is authoritative here.
    function snapshotCompanionProgress(companions) {
        const snapshot = {};
        for (const key of Object.keys(companions || {}).sort()) {
            const state = companions[key] || {};
            const rawLevel = Number(state.level);
            snapshot[key] = {
                unlocked: state.unlocked === true,
                level: Number.isFinite(rawLevel) ? rawLevel : 0
            };
        }
        return snapshot;
    }

    // Kept as a tiny pure helper so regression tests can verify the exact production projection.
    window._snapshotCompanionProgress = snapshotCompanionProgress;

    function syncShadow() {
        if (typeof game === 'undefined') return;
        shadow = {
            gold: Number(game.gold) || 0,
            crystals: Number(game.crystals) || 0,
            souls: Number(game.souls) || 0,
            wave: Number(game.wave) || 1,
            highestWave: Number(game.highestWave) || 1,
            prestiges: Number(game.stats?.prestiges) || 0,
            upgrades: JSON.parse(JSON.stringify(game.upgrades || {})),
            companions: snapshotCompanionProgress(game.companions),
            equippedItems: [...new Set(Array.isArray(game.equippedItems) ? game.equippedItems : [])]
        };
    }

    window._syncShadow = syncShadow;

    // V2 checksum covers the complete serializable save (except volatile metadata/signature).
    // This is a tamper-evident checksum for casual edits, NOT a server-trusted signature:
    // the algorithm and salt ship to the browser and can be reproduced by modified clients.
    function stableSaveString(value) {
        if (Array.isArray(value)) return '[' + value.map(stableSaveString).join(',') + ']';
        if (value && typeof value === 'object') {
            const keys = Object.keys(value)
                .filter(key => key !== '_sig' && key !== 'lastSaveTime')
                .sort();
            return '{' + keys.map(key => JSON.stringify(key) + ':' + stableSaveString(value[key])).join(',') + '}';
        }
        return JSON.stringify(value);
    }

    function checksum(text) {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function legacySignature(gameObj) {
        const coreStr = `${Math.floor(gameObj.gold)}|${Math.floor(gameObj.crystals)}|${Math.floor(gameObj.souls)}|${gameObj.wave}|${gameObj.highestWave}|${gameObj.stats?.prestiges || 0}|${SECRET_SALT}`;
        return checksum(coreStr);
    }

    window._generateSaveSignature = function(gameObj) {
        if (!gameObj || typeof gameObj !== 'object') return '';
        return checksum('save-v2|' + stableSaveString(gameObj) + '|' + SECRET_SALT);
    };

    window._verifySaveSignature = function(gameObj) {
        if (!gameObj || typeof gameObj !== 'object') return false;
        if (!gameObj._sig) {
            // Legacy unsigned saves remain eligible for the existing one-time migration path.
            try { return !localStorage.getItem(SIGNED_MARK_KEY); } catch (e) { return true; }
        }
        if (gameObj._sigVersion === 2) {
            return gameObj._sig === window._generateSaveSignature(gameObj);
        }
        // Backward compatibility for existing v1 saves/codes. V1 only covers economy/wave fields,
        // so it must not be described as protecting inventory, upgrades, skins, or companions.
        return gameObj._sig === legacySignature(gameObj);
    };

    setInterval(() => {
        if (typeof game === 'undefined') return;
        if (!shadow) { syncShadow(); return; }

        // Reject non-finite/corrupt progression values before comparing deltas; NaN makes
        // ordinary greater-than checks false, while Infinity can leak into saved progression.
        if (!Number.isFinite(game.wave) || !Number.isFinite(game.highestWave) ||
            game.wave < 1 || game.highestWave < 1) {
            game.wave = shadow.wave;
            game.highestWave = Math.max(shadow.highestWave, shadow.wave);
            cheatFlags++;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Bozuk dalga verisi geri alındı!');
        }

        const maxAllowedWaveJump = Math.max(3, getStartWaveLevel() - shadow.wave + 2);
        if (game.wave - shadow.wave > maxAllowedWaveJump || game.highestWave - shadow.highestWave > maxAllowedWaveJump) {
            game.wave = shadow.wave;
            game.highestWave = shadow.highestWave;
            cheatFlags++;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Geçersiz dalga değişimi engellendi!');
        }

        if (game.crystals - shadow.crystals > 650) {
            game.crystals = shadow.crystals;
            cheatFlags++;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Geçersiz kristal artışı engellendi!');
        }

        // Ruh Taşı SADECE evrim (rebirth) anında artar ve o kod kendi gölgesini anında eşitler;
        // bu yüzden buraya kadar gelen HER artış (200 altı dahil) meşru değildir.
        if (game.souls - shadow.souls > 0) {
            game.souls = shadow.souls;
            cheatFlags++;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Geçersiz Ruh Taşı müdahalesi engellendi!');
        }

        if (!Number.isFinite(game.gold) || game.gold < 0) game.gold = shadow.gold;
        if (!Number.isFinite(game.crystals) || game.crystals < 0) game.crystals = shadow.crystals;
        if (!Number.isFinite(game.souls) || game.souls < 0) game.souls = shadow.souls;

        // Skill/upgrade levels and companion stars are only accepted after their normal
        // purchase handler explicitly refreshes the shadow snapshot. Direct runtime edits
        // are rolled back before they can be saved by the regular game flow.
        let mustPersistRollback = false;
        const currentUpgrades = JSON.stringify(game.upgrades || {});
        const trustedUpgrades = JSON.stringify(shadow.upgrades || {});
        if (currentUpgrades !== trustedUpgrades) {
            game.upgrades = JSON.parse(JSON.stringify(shadow.upgrades || {}));
            cheatFlags++;
            mustPersistRollback = true;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Yetkisiz skill seviyesi değişimi geri alındı!');
        }

        const currentCompanions = JSON.stringify(snapshotCompanionProgress(game.companions));
        const trustedCompanions = JSON.stringify(shadow.companions || {});
        if (currentCompanions !== trustedCompanions) {
            // Roll back only the trusted persistent progression snapshot. Runtime orbit state
            // is transient and may be rebuilt naturally by updateCompanions().
            game.companions = JSON.parse(JSON.stringify(shadow.companions || {}));
            cheatFlags++;
            mustPersistRollback = true;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Yetkisiz yoldaş seviyesi değişimi geri alındı!');
        }

        const validEquipped = [...new Set(Array.isArray(game.equippedItems) ? game.equippedItems : [])]
            .filter(id => typeof id === 'string' && ITEM_DATABASE && ITEM_DATABASE[id] &&
                Array.isArray(game.inventory) && game.inventory.includes(id))
            .slice(0, 3);
        const currentEquipped = JSON.stringify(Array.isArray(game.equippedItems) ? game.equippedItems : []);
        if (currentEquipped !== JSON.stringify(validEquipped) ||
            JSON.stringify(validEquipped) !== JSON.stringify(shadow.equippedItems || [])) {
            game.equippedItems = validEquipped;
            cheatFlags++;
            mustPersistRollback = true;
            if (typeof showToast === 'function') showToast('🛡️ Güvenlik: Tekrarlı veya geçersiz ekipman engellendi!');
        }

        syncShadow();
        if (mustPersistRollback && typeof saveGame === 'function') saveGame(true);
    }, 400);

    window._isSessionClean = function() {
        return cheatFlags < 3;
    };
})();
