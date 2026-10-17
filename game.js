game.js
function getDefaultState() {
    return {
        gold: 120, crystals: 100, souls: 0, wave: 1, highestWave: 1, waveKills: 0, waveTargetKills: 15,
        holdWave: false, holdWaveTimer: 0, consecutiveDefeats: 0, consecutiveHoldWins: 0,
        deviceMode: 'pc',
        stats: { totalKills: 0, bossKills: 0, prestiges: 0, playTimeSeconds: 0 },
        settings: { showRange: true, showDamageText: true, activeTheme: 'cyber' },
        upgrades: {
            damage: 1, attackSpeed: 1, range: 1, critChance: 0, critMult: 1, multishot: 0, bounce: 0, knockback: 0,
            maxHp: 1, hpRegen: 1, armor: 0, thorns: 0, shield: 0, lifesteal: 0,
            goldBonus: 0, waveGold: 0, crystalChance: 0, interest: 0
        },
        companions: {
            laserDrone: { unlocked: false, level: 0 }, frostOrb: { unlocked: false, level: 0 },
            missileBot: { unlocked: false, level: 0 }, repairDrone: { unlocked: false, level: 0 }, plasmaSatellite: { unlocked: false, level: 0 }
        },
        inventory: [], equippedItems: [], ownedSkins: ['default_cyber'], activeSkin: 'default_cyber',
        ownedCompanionSkins: ['default_tech'], activeCompanionSkin: 'default_tech',
        lootboxBonuses: { extraDamagePct: 0, extraGoldPct: 0, totalOpened: 0 },
        prestigeUpgrades: { permDamage: 0, permGold: 0, companionBoost: 0, costDiscount: 0, startWave: 0 },
        lastSaveTime: Date.now()
    };
}

let game = getDefaultState();
let buyMultiplier = 1;
let currentTab = 'attack';
let gameSpeed = 1;
let isPaused = false;
let isDefeated = false;
let defeatTimer = 0;
let isDrawerOpen = false;

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

function setDeviceMode(mode) {
    game.deviceMode = mode; applyBodyClasses();
    ['phone', 'tablet', 'pc'].forEach(m => {
        const btn = document.getElementById(`dev-${m}`);
        if (btn) btn.className = m === mode ? 'py-2 rounded-xl bg-blue-600 text-white text-xs font-tech font-bold border border-blue-500 transition' : 'py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-tech font-bold border border-slate-700 transition';
    });
    showToast(`Cihaz modu: ${mode.toUpperCase()} olarak ayarlandı.`);
    resizeCanvas();
}

function applyBodyClasses() {
    const body = document.getElementById('main-body');
    if (!body) return;
    const dev = game.deviceMode || 'pc';
    body.className = `h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden device-${dev} color-pastel`;
}

function getEnemyColors(type) {
    if (type === 'boss') return { color: '#a78bfa', secColor: '#ede9fe' };
    if (type === 'teleporter') return { color: '#fbbf24', secColor: '#fef3c7' };
    if (type === 'ranged') return { color: '#60a5fa', secColor: '#dbeafe' };
    return { color: '#4ade80', secColor: '#dcfce7' };
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tower = { x: 0, y: 0, hp: 100, maxHp: 100, shield: 0, maxShield: 0, fireCooldown: 0, angle: 0, recoil: 0 };
let enemies = [];
let projectiles = [];
let particles = [];
let floatingTexts = [];
let lightningBeams = [];
let rings = [];

let bgStars = []; let snowFlakes = [];
function initStars() {
    bgStars = []; for (let i = 0; i < 80; i++) bgStars.push({ x: Math.random() * 2500, y: Math.random() * 2500, size: 0.6 + Math.random() * 2, alpha: 0.25 + Math.random() * 0.65 });
    snowFlakes = []; for (let i = 0; i < 60; i++) snowFlakes.push({ x: Math.random() * 2000, y: Math.random() * 2000, r: 1 + Math.random() * 2.2, vy: 20 + Math.random() * 30, vx: -10 + Math.random() * 20, alpha: 0.3 + Math.random() * 0.5 });
}
initStars();

let spawnTimer = 0; let playTimeAccum = 0;

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    canvas.width = container.clientWidth; canvas.height = container.clientHeight;
    tower.x = canvas.width / 2; tower.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);

function spawnEnemy(isBoss = false) {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(canvas.width, canvas.height) * 0.55 + 40;
    const x = tower.x + Math.cos(angle) * spawnDist;
    const y = tower.y + Math.sin(angle) * spawnDist;

    const w = game.wave;
    const earlyBuffer = w <= 3 ? 0.65 : (w <= 6 ? 0.82 : 1.0);
    const tierMult = Math.pow(1.20, Math.floor(w / 10)) * Math.pow(1.30, Math.floor(w / 25));

    const baseHp = (18 + w * 5.5) * Math.pow(1.106, w - 1) * tierMult * earlyBuffer;
    const baseDmg = (5.0 + w * 1.8) * Math.pow(1.096, w - 1) * Math.pow(1.15, Math.floor(w / 10)) * earlyBuffer;
    const baseGold = getWaveBaseGold(w) * getGoldMultiplier();

    let type = 'green', name = 'Yeşil Xenomorph', radius = 13, speed = 40 + Math.min(28, w * 0.15);
    let hp = baseHp, dmg = baseDmg, isRanged = false, isTeleporter = false, gold = baseGold;

    if (isBoss) {
        type = 'boss'; name = 'Kozmik Leviathan'; radius = 32; speed = 25;
        hp = baseHp * (w % 10 === 0 ? 8.5 : 5.5);
        dmg = baseDmg * 2.1;
        gold = baseGold * (game.holdWave ? 3.5 : 8.0);
    } else {
        const roll = Math.random();
        if (w >= 3 && roll < 0.25) { type = 'teleporter'; name = 'Sarı Psişik'; radius = 11; speed = 50; hp = baseHp * 0.62; dmg = baseDmg * 0.85; isTeleporter = true; gold = baseGold * 1.15; }
        else if (w >= 2 && roll < 0.55) { type = 'ranged'; name = 'Mavi Nişancı'; radius = 12; speed = 30; hp = baseHp * 0.78; dmg = baseDmg * 0.95; isRanged = true; gold = baseGold * 1.10; }
        else { type = 'green'; name = 'Yeşil Xenomorph'; radius = 13; speed = 42; hp = baseHp * 1.0; dmg = baseDmg * 1.0; }
    }

    const pal = getEnemyColors(type);
    enemies.push({
        x, y, type, name, radius, speed, hp, maxHp: hp, dmg, color: pal.color, secColor: pal.secColor, gold,
        isRanged, isTeleporter, attackCooldown: 1.0, teleCooldown: 4.0, kbCount: 0, kbImmunityTimer: 0,
        slowTimer: 0, slowFactor: 1, hitFlash: 0, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 3, animPhase: Math.random() * Math.PI * 2
    });
}

function createParticles(x, y, color, count = 8, speed = 70) {
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
    if (tower.maxShield > 0 && tower.shield < tower.maxShield) tower.shield = Math.min(tower.maxShield, tower.shield + (tower.maxShield * 0.1) * simDt);
    if (tower.recoil > 0) tower.recoil = Math.max(0, tower.recoil - simDt * 15);

    spawnTimer -= simDt;
    if (spawnTimer <= 0 && enemies.length < Math.min(50, 18 + Math.floor(game.wave / 3))) {
        spawnTimer = Math.max(0.18, 1.0 - Math.min(0.65, game.wave * 0.006));
        spawnEnemy(false);
    }

    tower.fireCooldown -= simDt;
    const range = getTowerRange();
    if (tower.fireCooldown <= 0 && enemies.length > 0) {
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
        p.x += p.vx * simDt; p.y += p.vy * simDt; p.life -= simDt;
        
        if (!p.history) p.history = [];
        p.history.unshift({x: p.x, y: p.y});
        if (p.history.length > (p.isCrit ? 10 : 6)) p.history.pop();

        if (p.life <= 0) { projectiles.splice(i, 1); continue; }

        if (p.fromEnemy) {
            if (Math.hypot(p.x - tower.x, p.y - tower.y) <= 24) {
                damageTower(p.damage, null);
                createParticles(p.x, p.y, '#06b6d4', 4, 40);
                projectiles.splice(i, 1);
            }
        } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (p.hitList && p.hitList.includes(e)) continue;

                if (Math.hypot(p.x - e.x, p.y - e.y) <= e.radius + p.radius) {
                    if (p.splashRadius && p.splashRadius > 0) {
                        rings.push({ x: e.x, y: e.y, radius: 10, color: '#f97316', life: 0.9 });
                        createParticles(e.x, e.y, '#f97316', 12, 90);
                        for (let k = enemies.length - 1; k >= 0; k--) {
                            const aoeEnemy = enemies[k];
                            const distAoe = Math.hypot(aoeEnemy.x - e.x, aoeEnemy.y - e.y);
                            if (distAoe <= p.splashRadius + aoeEnemy.radius) {
                                const falloff = distAoe < 15 ? 1.0 : 0.75;
                                dealDamageToEnemy(aoeEnemy, Math.round(p.damage * falloff), p.isCrit, '#fb923c', false);
                            }
                        }
                    } else {
                        dealDamageToEnemy(e, p.damage, p.isCrit, p.isCrit ? '#c084fc' : '#60a5fa', true);
                        createParticles(p.x, p.y, p.color, 5, 50);
                    }

                    const kb = getTowerKnockback();
                    if (kb > 0 && e && enemies.includes(e) && e.kbCount < Math.min(2, game.upgrades.knockback || 0) && e.kbImmunityTimer <= 0) {
                        const pushAng = Math.atan2(e.y - tower.y, e.x - tower.x);
                        const actualPush = e.type === 'boss' ? kb * 0.3 : kb;
                        e.x += Math.cos(pushAng) * actualPush; e.y += Math.sin(pushAng) * actualPush;
                        e.kbCount++; e.kbImmunityTimer = 1.2;
                        addFloatingText(e.x, e.y - 14, 'İTİLDİ', '#2dd4bf', 9);
                    }

                    if (p.bouncesLeft > 0) {
                        p.bouncesLeft--; p.damage = Math.round(p.damage * 0.65); p.hitList.push(e);
                        let nextTarget = null, minDist = 130;
                        for (const cand of enemies) {
                            if (!p.hitList.includes(cand) && Math.hypot(cand.x - e.x, cand.y - e.y) < minDist) { minDist = Math.hypot(cand.x - e.x, cand.y - e.y); nextTarget = cand; }
                        }
                        if (nextTarget) {
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

        let targetStopDist = e.isRanged ? currentTowerRange : 30;

        if (e.isTeleporter) {
            e.teleCooldown -= simDt;
            if (e.teleCooldown <= 0) {
                e.teleCooldown = 3.5 + Math.random() * 2.0;
                const currDist = Math.hypot(tower.x - e.x, tower.y - e.y);
                if (currDist > 110) {
                    const blinkDist = Math.min(currDist - 55, 90);
                    const ang = Math.atan2(tower.y - e.y, tower.x - e.x);
                    e.x += Math.cos(ang) * blinkDist; e.y += Math.sin(ang) * blinkDist;
                    createParticles(e.x, e.y, '#eab308', 8, 80); addFloatingText(e.x, e.y, 'IŞINLANDI!', '#fef08a', 10);
                }
            }
        }

        const dist = Math.hypot(tower.x - e.x, tower.y - e.y);
        const ang = Math.atan2(tower.y - e.y, tower.x - e.x);

        if (dist > targetStopDist) {
            const spd = e.speed * e.slowFactor; e.x += Math.cos(ang) * spd * simDt; e.y += Math.sin(ang) * spd * simDt;
        } else {
            if (e.isRanged && dist < targetStopDist - 10) { const spd = e.speed * 0.5 * e.slowFactor; e.x -= Math.cos(ang) * spd * simDt; e.y -= Math.sin(ang) * spd * simDt; }
            e.attackCooldown -= simDt;
            if (e.attackCooldown <= 0) {
                e.attackCooldown = e.isRanged ? 1.3 : 1.05;
                if (e.isRanged || e.type === 'boss') {
                    projectiles.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 220, vy: Math.sin(ang) * 220, radius: e.type === 'boss' ? 6 : 4.5, color: e.color, damage: e.dmg, life: 3.0, fromEnemy: true });
                } else damageTower(e.dmg, e);
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
    const angle = Math.atan2(target.y - startY, target.x - startX);
    const speed = 360; const isCrit = Math.random() * 100 < getTowerCritChance();
    let dmg = getTowerDamage(); if (isCrit) dmg = Math.round(dmg * getTowerCritMult());

    const bCount = Math.min(7, Math.max(1, totalBarrels));
    const norm = barrelIdx < bCount ? (barrelIdx - (bCount - 1) / 2) : 0;
    const perpAngle = tower.angle + Math.PI / 2;
    const lateralOffset = bCount === 2 ? norm * 9 : norm * 5.5;
    const spawnX = startX + Math.cos(angle) * 20 + Math.cos(perpAngle) * lateralOffset;
    const spawnY = startY + Math.sin(angle) * 20 + Math.sin(perpAngle) * lateralOffset;

    const skinDef = SKIN_DATABASE[game.activeSkin] || SKIN_DATABASE.default_cyber;
    const projColor = isCrit ? (skinDef.critColor || '#c084fc') : (skinDef.projColor || '#60a5fa');

    projectiles.push({ x: spawnX, y: spawnY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: isCrit ? 5 : 3.8, color: projColor, damage: dmg, isCrit, bouncesLeft: game.upgrades.bounce, hitList: [], life: 2.0, fromEnemy: false });
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
        const baseBossCrystals = Math.round((8 + Math.floor(game.wave * 1.2)) * crystalMult);
        const c = game.holdWave ? Math.max(2, Math.round(baseBossCrystals * 0.35)) : baseBossCrystals;
        game.crystals += c; game.stats.bossKills++;
        addFloatingText(enemy.x, enemy.y - 24, `+${formatNumber(c)} 💎`, '#22d3ee', 15);
        showToast(`Kozmik Leviathan İmha Edildi! +${formatNumber(c)} Kristal!`);
    } else if (Math.random() * 100 < crystalChance) {
        const cAmt = Math.max(1, Math.round(crystalMult));
        game.crystals += cAmt;
        addFloatingText(enemy.x, enemy.y - 22, `+${cAmt} 💎`, '#22d3ee', 13);
    }

    createParticles(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 24 : 10, 85);
    rings.push({ x: enemy.x, y: enemy.y, radius: enemy.radius * 0.5, color: enemy.color, life: 1.0 });

    game.stats.totalKills++; game.waveKills++;
    if (game.waveKills >= game.waveTargetKills) completeWave();
    refreshUpgradeButtonsState();
}

function damageTower(rawDamage, attacker) {
    const armorVal = getTowerArmor();
    const flatReduced = Math.max(rawDamage * 0.22, rawDamage - armorVal);
    const reduced = Math.max(1, Math.round(flatReduced));
    if (attacker && game.upgrades.thorns > 0) {
        const ref = Math.round((rawDamage + armorVal * 0.5) * (getTowerThorns() / 100));
        if (ref > 0) dealDamageToEnemy(attacker, ref, false, '#fb7185');
    }

    let rem = reduced;
    if (tower.shield > 0) { if (tower.shield >= rem) { tower.shield -= rem; rem = 0; } else { rem -= tower.shield; tower.shield = 0; } }
    if (rem > 0) { tower.hp -= rem; createParticles(tower.x, tower.y, '#ef4444', 5, 50); }
    if (tower.hp <= 0) { tower.hp = 0; triggerTowerDefeat(); }
}

function completeWave() {
    if (!game.holdWave) {
        const interestCap = Math.round(getWaveBaseGold(game.wave) * 45 * getGoldMultiplier());
        const interestGold = Math.min(interestCap, Math.floor(game.gold * (game.upgrades.interest * 0.008)));
        const total = Math.round(getWaveBonusPreview(game.upgrades.waveGold) + interestGold);
        if (total > 0) { game.gold += total; addFloatingText(tower.x, tower.y - 35, `Dalga Ödülü: +${formatNumber(total)} 🪙`, '#f59e0b', 14); }

        const prevHighest = game.highestWave; game.wave++;
        if (game.wave > game.highestWave) {
            game.highestWave = game.wave;
            if (game.highestWave % 10 === 0) {
                const milestoneCrystals = 25 + Math.floor(game.highestWave * 1.5);
                game.crystals += milestoneCrystals;
                showToast(`🏆 Dalga ${game.highestWave} Rekor Ödülü: +${milestoneCrystals} 💎 Kristal!`);
            }
            if (prevHighest < 30 && game.highestWave >= 30) showToast('❄️ 30. Dalga! Kar Teması Açıldı!');
            else if (prevHighest < 60 && game.highestWave >= 60) showToast('🚀 60. Dalga! Uzay Teması Açıldı!');
        }
        game.consecutiveDefeats = 0;
    } else {
        game.holdWaveTimer = 0; game.consecutiveHoldWins++; addFloatingText(tower.x, tower.y - 35, `Farm Modu (${game.consecutiveHoldWins}/4)`, '#38bdf8', 11);
        if (game.consecutiveHoldWins >= 4) { game.holdWave = false; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast('Farm modunda 4 dalga geçildi! Otomatik İlerleme aktif.'); }
    }
    game.waveKills = 0; game.waveTargetKills = Math.min(45, 14 + Math.floor(game.wave * 0.25)); tower.hp = Math.min(tower.maxHp, tower.hp + tower.maxHp * 0.20);
    if (!game.holdWave && game.wave % 5 === 0 && !enemies.some(e => e.type === 'boss')) spawnEnemy(true);
    updatePrestigeUI(); refreshUpgradeButtonsState(); saveGame(true);
}

function triggerTowerDefeat() {
    game.consecutiveDefeats++;
    if (game.consecutiveDefeats >= 2) { isDefeated = true; defeatTimer = 2.5; document.getElementById('defeat-overlay').classList.remove('hidden'); }
    else { showToast(`Kule ağır hasar aldı! 2. yenilgide farm moduna geçilecek.`); tower.hp = tower.maxHp * 0.5; }
}

function recoverFromDefeat() {
    isDefeated = false; document.getElementById('defeat-overlay').classList.add('hidden'); enemies = []; projectiles = [];
    if (game.wave > 1) { game.wave--; game.holdWave = true; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast('Üst üste 2 kez yıkıldın! Güvenli dalgaya çekildin.'); }
    game.consecutiveDefeats = 0; game.waveKills = 0; tower.hp = getTowerMaxHp(); tower.shield = getTowerMaxShield(); updateHUD();
}

function toggleHoldWave() { game.holdWave = !game.holdWave; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast(game.holdWave ? 'Farm Modu Açıldı (4 dalga sonra oto döner)' : 'Otomatik İlerleme Açıldı'); }
function updateHoldWaveButton() {
    const btn = document.getElementById('btn-hold-wave'), icon = document.getElementById('icon-hold-wave'), txt = document.getElementById('text-hold-wave'); if (!btn) return;
    if (game.holdWave) { btn.className = 'px-2 py-0.5 rounded bg-amber-500/25 border border-amber-500/40 text-[10px] font-semibold text-amber-300 transition flex items-center gap-1'; icon.className = 'fa-solid fa-repeat'; txt.textContent = 'Farm'; }
    else { btn.className = 'px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-400 transition flex items-center gap-1'; icon.className = 'fa-solid fa-forward'; txt.textContent = 'Oto İlerle'; }
}

function renderGame() {
    const theme = game.settings.activeTheme || 'cyber';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (theme === 'snow') {
        const grad = ctx.createRadialGradient(tower.x, tower.y, 40, tower.x, tower.y, Math.max(canvas.width, canvas.height) * 0.75);
        grad.addColorStop(0, '#232d3f'); grad.addColorStop(0.6, '#1a2230'); grad.addColorStop(1, '#131822');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.05)'; ctx.lineWidth = 1.5;
        for (let r = 80; r < 500; r += 90) { ctx.beginPath(); ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2); ctx.stroke(); }
        for (const sf of snowFlakes) { ctx.fillStyle = `rgba(241, 245, 249, ${sf.alpha})`; ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2); ctx.fill(); }
    } else if (theme === 'space') {
        const grad = ctx.createRadialGradient(tower.x, tower.y, 20, tower.x, tower.y, Math.max(canvas.width, canvas.height) * 0.8);
        grad.addColorStop(0, '#2a2438'); grad.addColorStop(0.5, '#1f1b2c'); grad.addColorStop(1, '#15121e');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const st of bgStars) {
            const sx = st.x % canvas.width, sy = st.y % canvas.height;
            ctx.fillStyle = '#ddd6fe'; ctx.globalAlpha = st.alpha * 0.7;
            ctx.beginPath(); ctx.arc(sx, sy, st.size * 1.1, 0, Math.PI * 2); ctx.fill();
        } ctx.globalAlpha = 1;
    } else {
        const grad = ctx.createRadialGradient(tower.x, tower.y, 30, tower.x, tower.y, Math.max(canvas.width, canvas.height) * 0.8);
        grad.addColorStop(0, '#222436'); grad.addColorStop(0.6, '#191b29'); grad.addColorStop(1, '#131420');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.04)'; ctx.lineWidth = 1;
        for (let r = 90; r < 550; r += 90) { ctx.beginPath(); ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2); ctx.stroke(); }
        for (const st of bgStars) {
            const sx = st.x % canvas.width, sy = st.y % canvas.height;
            ctx.fillStyle = `rgba(203, 213, 225, ${st.alpha * 0.55})`;
            ctx.beginPath(); ctx.arc(sx, sy, st.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    if (game.settings.showRange) {
        const r = getTowerRange(); ctx.beginPath(); ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(199, 210, 254, 0.25)';
        ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(199, 210, 254, 0.025)'; ctx.fill();
    }

    for (const p of projectiles) {
        if (p.history && p.history.length > 1) {
            ctx.save(); ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            for (let i = 0; i < p.history.length; i++) ctx.lineTo(p.history[i].x, p.history[i].y);
            ctx.strokeStyle = p.color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.lineWidth = p.radius * 1.5;
            ctx.globalAlpha = 0.4;
            ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; 
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.restore();
    }

    for (const r of rings) {
        ctx.save(); ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color; ctx.globalAlpha = Math.max(0, r.life);
        ctx.lineWidth = 1 + r.life * 3;
        ctx.shadowColor = r.color; ctx.shadowBlur = 10;
        ctx.stroke(); ctx.restore();
    }

    const activeCompSkin = game.activeCompanionSkin || 'default_tech';
    const nowCompTime = performance.now();
    for (const [key, st] of Object.entries(game.companions)) {
        if (!st.unlocked || !st.x) continue;
        const star = Math.min(5, Math.max(1, st.level || 1));
        ctx.save();
        ctx.translate(st.x, st.y);
        drawCustomCompanionSkin(ctx, activeCompSkin, key, star, st.angle || 0, nowCompTime);
        ctx.restore();
    }

    for (const b of lightningBeams) { ctx.save(); ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.strokeStyle = b.color; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }

    ctx.save(); ctx.translate(tower.x, tower.y);
    if (tower.shield > 0) {
        ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.09)'; ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }

    const skinId = game.activeSkin || 'default_cyber';
    const barrelCount = Math.min(7, Math.max(1, getEffectiveMultishot()));
    drawCustomTowerSkin(ctx, skinId, tower.angle, tower.recoil, barrelCount, nowCompTime);
    ctx.restore();

    for (const e of enemies) {
        ctx.save(); ctx.translate(e.x, e.y);
        if (e.slowTimer > 0) { ctx.beginPath(); ctx.arc(0, 0, e.radius + 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)'; ctx.lineWidth = 1.5; ctx.stroke(); }

        ctx.save(); ctx.rotate(e.rot);
        let fillStyle = e.color;
        if (e.hitFlash <= 0) {
            const darkColor = adjustColorBrightness(e.color, -50);
            const eGrad = ctx.createRadialGradient(-e.radius * 0.3, -e.radius * 0.3, e.radius * 0.1, 0, 0, e.radius);
            eGrad.addColorStop(0, '#ffffff');
            eGrad.addColorStop(0.2, e.color);
            eGrad.addColorStop(1, darkColor);
            fillStyle = eGrad;
            ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
        }

        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : fillStyle;
        ctx.strokeStyle = e.secColor || '#ffffff'; ctx.lineWidth = e.type === 'boss' ? 3 : 1.5;

        if (e.type === 'boss') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; const r = i % 2 === 0 ? e.radius : e.radius * 0.75; const px = Math.cos(a) * r, py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
            ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else if (e.isTeleporter) {
            ctx.beginPath(); ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius, 0); ctx.lineTo(0, e.radius); ctx.lineTo(-e.radius, 0); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else if (e.isRanged) {
            ctx.beginPath(); ctx.moveTo(e.radius, 0); ctx.lineTo(-e.radius * 0.8, -e.radius * 0.85); ctx.lineTo(-e.radius * 0.4, 0); ctx.lineTo(-e.radius * 0.8, e.radius * 0.85); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        }
        ctx.restore();

        if (e.hp < e.maxHp || e.type === 'boss') {
            const barW = e.radius * 2; const pct = Math.max(0, e.hp / e.maxHp);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(-barW / 2, -e.radius - 11, barW, 3.5);
            ctx.fillStyle = e.type === 'boss' ? '#d8b4fe' : '#86efac';
            ctx.fillRect(-barW / 2, -e.radius - 11, barW * pct, 3.5);
        }
        ctx.restore();
    }

    for (const pt of particles) { ctx.save(); ctx.globalAlpha = pt.alpha; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.fillStyle = pt.color; ctx.fill(); ctx.restore(); }
    for (const ft of floatingTexts) { ctx.save(); ctx.globalAlpha = Math.max(0, ft.alpha); ctx.font = `bold ${ft.size}px 'Rajdhani', sans-serif`; ctx.fillStyle = ft.color; ctx.textAlign = 'center'; ctx.fillText(ft.text, ft.x, ft.y); ctx.restore(); }
}

function saveGame(silent = false) { try { game.lastSaveTime = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch (e) {} }
function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY); if (!raw) return;
        const parsed = JSON.parse(raw), def = getDefaultState();
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
        for (const key of Object.keys(COMPANION_DEFS)) {
            if (game.companions[key]) {
                if (game.companions[key].unlocked) {
                    game.companions[key].level = Math.min(5, Math.max(1, game.companions[key].level || 1));
                } else {
                    game.companions[key].level = 0;
                }
            }
        }
    } catch (e) {}
}

let lastFrameTime = performance.now();
function gameLoop(now) {
    const dt = Math.min(0.1, (now - lastFrameTime) / 1000); lastFrameTime = now;
    updateGame(dt); renderGame(); updateRouletteAnimation(now); requestAnimationFrame(gameLoop);
}

window.onload = function () {
    loadGame(); resizeCanvas();
    tower.maxHp = getTowerMaxHp(); tower.hp = tower.maxHp; tower.maxShield = getTowerMaxShield(); tower.shield = tower.maxShield;
    applyBodyClasses(); setDeviceMode(game.deviceMode || 'pc'); updateHoldWaveButton();
    buildUpgradesUI(); buildInventoryUI(); drawRouletteWheel(); updateHUD();
    setInterval(() => saveGame(false), 15000); requestAnimationFrame(gameLoop);
};
