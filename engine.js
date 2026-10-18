const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tower = {
    x: 0, y: 0, hp: 100, maxHp: 100, shield: 0, maxShield: 0,
    fireCooldown: 0, angle: 0, recoil: 0,
    freezeTimer: 0, frostSlowTimer: 0, frostVisualTick: 0
};
let enemies = [];
let projectiles = [];
let particles = [];
let floatingTexts = [];
let lightningBeams = [];
let rings = [];

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

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = canvas.clientHeight;
    tower.x = canvas.width / 2;
    tower.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);

// Bir merminin başlangıç (x1,y1) ve bitiş (x2,y2) noktaları arasındaki doğru parçasının düşmana değip değmediğini ölçer (3x hızda içinden geçmeyi %100 önler)
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

function spawnEnemy(isBoss = false) {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(canvas.width, canvas.height) * 0.55 + 40;
    const x = tower.x + Math.cos(angle) * spawnDist;
    const y = tower.y + Math.sin(angle) * spawnDist;

    const w = game.wave;
    const earlyBuffer = w === 1 ? 0.80 : (w <= 3 ? 0.90 : 1.0);
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
        const bossMult = (w % 10 === 0 ? 10.0 : 6.5);
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
    } else {
        const roll = Math.random();
        if (w >= 5 && roll < 0.14) {
            type = 'tank'; subType = 'tank'; name = 'Zırhlı Golem'; radius = 18; speed = 22;
            hp = baseHp * 2.60; dmg = baseDmg * 1.45; gold = baseGold * 1.35;
            kbResist = 0.35; stopDistOverride = 34;
            customPal = { color: '#64748b', secColor: '#e2e8f0' };
        } else if (w >= 3 && roll < 0.30) {
            type = 'frost'; subType = 'frost'; name = 'Buzul Nöbetçisi'; radius = 13; speed = 32;
            hp = baseHp * 0.95; dmg = baseDmg * 0.85; isRanged = true; isFrost = true;
            freezeDuration = 0.85; frostSlowDuration = 3.2;
            attackInterval = 1.60; stopDistOverride = Math.max(105, getTowerRange() - 25);
            gold = baseGold * 1.25;
            customPal = { color: '#06b6d4', secColor: '#cffafe' };
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

    const fallbackPal = (typeof getEnemyColors === 'function' ? getEnemyColors(type === 'boss' ? 'boss' : (isTeleporter ? 'teleporter' : (isRanged ? 'ranged' : 'green'))) : null) || { color: '#22c55e', secColor: '#ffffff' };
    const pal = customPal || fallbackPal;

    enemies.push({
        x, y, type, subType, name, radius, speed,
        hp: Math.round(hp), maxHp: Math.round(hp), dmg: Math.round(dmg * 10) / 10,
        color: pal.color, secColor: pal.secColor, gold,
        isRanged, isTeleporter, isFrost, freezeDuration, frostSlowDuration,
        attackCooldown: 1.0, attackInterval, projSpeed, stopDistOverride, kbResist,
        teleCooldown: 4.0, dashCooldown,
        kbCount: 0, kbImmunityTimer: 0,
        slowTimer: 0, slowFactor: 1, hitFlash: 0,
        rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 3, animPhase: Math.random() * Math.PI * 2
    });
}

function applyFrostToTower(freezeDur = 0, slowDur = 3.0) {
    tower.frostSlowTimer = Math.max(tower.frostSlowTimer || 0, slowDur);
    if (freezeDur > 0 && (freezeDur >= 1.0 || Math.random() < 0.30)) {
        tower.freezeTimer = Math.max(tower.freezeTimer || 0, freezeDur);
        addFloatingText(tower.x, tower.y - 26, '❄️ KULE DONDU!', '#38bdf8', 13);
        rings.push({ x: tower.x, y: tower.y, radius: 18, color: '#38bdf8', life: 0.75 });
    } else {
        addFloatingText(tower.x, tower.y - 22, '❄️ BUZ YAVAŞLATMASI', '#7dd3fc', 10);
    }
    createParticles(tower.x, tower.y, '#38bdf8', 8, 65);
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
    if (tower.maxShield > 0 && tower.shield < tower.maxShield) tower.shield = Math.min(tower.maxShield, tower.shield + (tower.maxShield * 0.05) * simDt);
    if (tower.recoil > 0) tower.recoil = Math.max(0, tower.recoil - simDt * 15);

    if (tower.freezeTimer > 0) {
        tower.freezeTimer = Math.max(0, tower.freezeTimer - simDt);
        tower.frostVisualTick = (tower.frostVisualTick || 0) + simDt;
        if (tower.frostVisualTick >= 0.25) {
            tower.frostVisualTick = 0;
            createParticles(tower.x, tower.y, '#bae6fd', 3, 35);
        }
    }
    if (tower.frostSlowTimer > 0) {
        tower.frostSlowTimer = Math.max(0, tower.frostSlowTimer - simDt);
    }

    spawnTimer -= simDt;
    if (spawnTimer <= 0 && enemies.length < Math.min(45, 14 + Math.floor(game.wave / 3))) {
        spawnTimer = Math.max(0.22, 1.05 - Math.min(0.65, game.wave * 0.0065));
        spawnEnemy(false);
    }

    const fireRateFactor = tower.freezeTimer > 0 ? 0 : (tower.frostSlowTimer > 0 ? 0.55 : 1.0);
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

    // Mermi hareketi ve Swept (Çizgi Taramalı) Çarpışma Kontrolü
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
                } else {
                    createParticles(p.x, p.y, p.color || '#06b6d4', 4, 40);
                }
                projectiles.splice(i, 1);
            }
        } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (p.hitList && p.hitList.includes(e)) continue;

                // Hem başlangıç-bitiş çizgisine hem de son konuma bak (dibindeki yaratığı asla ıskalamaz)
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
                    e.x += Math.cos(ang) * dashDist; e.y += Math.sin(ang) * dashDist;
                    createParticles(e.x, e.y, '#ef4444', 10, 95);
                    addFloatingText(e.x, e.y, '⚡ ATILDI!', '#fca5a5', 11);
                }
            }
        }

        const dist = Math.hypot(tower.x - e.x, tower.y - e.y);
        const ang = Math.atan2(tower.y - e.y, tower.x - e.x);

        if (dist > targetStopDist) {
            // 3x hızda bile düşmanların targetStopDist sınırını delip kulenin içine girmesini engelle
            const step = Math.min(dist - targetStopDist, e.speed * e.slowFactor * simDt);
            e.x += Math.cos(ang) * step;
            e.y += Math.sin(ang) * step;
        } else {
            // Eğer bir yakın dövüşçü kulenin içine (targetStopDist'ten daha yakına) sıkıştıysa sınır çizgisine geri çıkar
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
                    projectiles.push({
                        x: e.x, y: e.y,
                        vx: Math.cos(ang) * pSpd, vy: Math.sin(ang) * pSpd,
                        radius: e.type === 'boss' ? 6.5 : 4.5,
                        color: e.isFrost ? '#38bdf8' : e.color,
                        damage: e.dmg, life: 3.5, fromEnemy: true,
                        isFrost: e.isFrost || false,
                        freezeDuration: e.freezeDuration || 0,
                        frostSlowDuration: e.frostSlowDuration || 0
                    });
                } else {
                    damageTower(e.dmg, e);
                    if (e.isFrost) applyFrostToTower(e.freezeDuration, e.frostSlowDuration);
                    if (e.type === 'boss') rings.push({ x: tower.x, y: tower.y, radius: 14, color: e.color, life: 0.5 });
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

    // Yakın mesafedeki düşmanların yanından veya arkasından doğmaması için dinamik çıkış noktası
    const muzzleDist = Math.min(10, distToTarget * 0.35);
    const lateralScale = Math.min(1, distToTarget / 65);
    const lateralOffset = (bCount === 2 ? norm * 8 : norm * 4.5) * lateralScale;

    const spawnX = startX + Math.cos(baseAngle) * muzzleDist + Math.cos(perpAngle) * lateralOffset;
    const spawnY = startY + Math.sin(baseAngle) * muzzleDist + Math.sin(perpAngle) * lateralOffset;

    // Merminin açısını doğrudan doğduğu namlu ucundan hedefin merkezine kilitle
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
    if (!game.holdWave) {
        const interestCap = Math.round(getWaveBaseGold(game.wave) * 25 * getGoldMultiplier());
        const interestGold = Math.min(interestCap, Math.floor(game.gold * (game.upgrades.interest * 0.004)));
        const total = Math.round(getWaveBonusPreview(game.upgrades.waveGold) + interestGold);
        if (total > 0) { game.gold += total; addFloatingText(tower.x, tower.y - 35, `Dalga Ödülü: +${formatNumber(total)} 🪙`, '#f59e0b', 14); }

        const prevHighest = game.highestWave; game.wave++;
        if (game.wave > game.highestWave) {
            game.highestWave = game.wave;
            if (game.highestWave % 10 === 0) {
                const milestoneCrystals = 15 + Math.floor(game.highestWave * 1.0);
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
        // İlk yıkılışta kulenin dibindeki düşmanları şok dalgasıyla biraz geri it ki kule nefes alsın
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
    tower.freezeTimer = 0; tower.frostSlowTimer = 0;
    if (game.wave > 1) { game.wave--; game.holdWave = true; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast('Üst üste 2 kez yıkıldın! Güvenli dalgaya çekildin.'); }
    game.consecutiveDefeats = 0; game.waveKills = 0; tower.hp = getTowerMaxHp(); tower.shield = getTowerMaxShield(); updateHUD();
}

function toggleHoldWave() { game.holdWave = !game.holdWave; game.holdWaveTimer = 0; game.consecutiveHoldWins = 0; updateHoldWaveButton(); showToast(game.holdWave ? 'Farm Modu Açıldı (4 dalga sonra oto döner)' : 'Otomatik İlerleme Açıldı'); }
function updateHoldWaveButton() {
    const btn = document.getElementById('btn-hold-wave'), icon = document.getElementById('icon-hold-wave'), txt = document.getElementById('text-hold-wave'); if (!btn) return;
    if (game.holdWave) { btn.className = 'px-2 py-0.5 rounded bg-amber-500/25 border border-amber-500/40 text-[10px] font-semibold text-amber-300 transition flex items-center gap-1'; icon.className = 'fa-solid fa-repeat'; txt.textContent = 'Farm'; }
    else { btn.className = 'px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-semibold text-emerald-400 transition flex items-center gap-1'; icon.className = 'fa-solid fa-forward'; txt.textContent = 'Oto İlerle'; }
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
