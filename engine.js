const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tower = { x: 0, y: 0, hp: 100, maxHp: 100, shield: 0, maxShield: 0, fireCooldown: 0, angle: 0, recoil: 0 };
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
    canvas.height = container.clientHeight;
    tower.x = canvas.width / 2;
    tower.y = canvas.height / 2;
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
                let dmg = Math.round(towerDmg * def.damageMults[idx] * compBoost);
                if (isCrit) dmg = Math.round(dmg * getTowerCritMult());
                dealDamageToEnemy(target, dmg, isCrit, isCrit ? '#facc15' : '#ef4444');
                lightningBeams.push({ x1: st.x, y1: st.y, x2: target.x, y2: target.y, color: isCrit ? '#facc15' : '#ef4444', life: 0.11 });
            }
        } else if (key === 'frostOrb' && enemies.length > 0) {
            st.cooldown = Math.max(1.0, 1.7 - star * 0.12);
            const frostRadius = 135 + star * 18;
            const slowRatio = 1 - (def.slowPcts[idx] / 100);
            const frostDmg = Math.round(towerDmg * def.damageMults[idx] * compBoost);
            let hitAny = false;
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (Math.hypot(e.x - st.x, e.y - st.y) <= frostRadius) {
                    e.slowFactor = Math.min(e.slowFactor, slowRatio);
                    e.slowTimer = 2.4 + star * 0.3;
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
                const dmg = Math.round(towerDmg * def.damageMults[idx] * compBoost);
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
                st.cooldown = Math.max(1.1, 1.8 - star * 0.12);
                let prevX = st.x, prevY = st.y;
                for (const target of sorted) {
                    const maxHpBonusDmg = Math.round(target.maxHp * (def.maxHpPcts[idx] / 100));
                    const dmg = Math.round(towerDmg * def.damageMults[idx] * compBoost) + maxHpBonusDmg;
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
