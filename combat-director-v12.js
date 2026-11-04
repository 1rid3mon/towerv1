/* TowerV1 V12 — phased bosses and companion synergies.
 * Transient combat state only; no save or Firebase mutations.
 * Story simulation is intentionally excluded to preserve all 27 mission encounters.
 */
(function(root) {
  'use strict';
  if (root.TowerCombatDirectorV12) return;
  const ALLOWED = ['tank_boss','ranged_boss','speed_boss','frost_boss','leviathan'];
  function endless() {
    try {
      if (root.document?.body?.dataset?.gameMode === 'story') return false;
      if (typeof GameModeRuntime !== 'undefined' &&
        (GameModeRuntime.isStoryActive() || GameModeRuntime.isIsolatedStoryRuntime())) return false;
      return true;
    } catch (_) { return false; }
  }
  function spawn(e) {
    if (!endless() || !e || e.type !== 'boss' || !ALLOWED.includes(e.subType)) return false;
    e.v12Combat={phase:1, baseSpeed:e.speed,baseAttackInterval:e.attackInterval, lastPhase:1,disruption:0,terrain:0,terrainTime:0,pulseClock:0};
    try { root.TowerBossCinemaV15?.cue(e.subType,1); } catch (_) {}
    return true;
  }
  function stage(hp,max) {
    if (!Number.isFinite(hp)||!Number.isFinite(max)||max<=0) return 1;
    const ratio=Math.max(0,hp/max);
    return ratio<=.28?3:ratio<=.65?2:1;
  }
  function tick(e,dt,env) {
    if (!endless()||!e||e.type!=='boss'||!e.v12Combat||!Number.isFinite(dt)||dt<=0) return 1;
    const c=e.v12Combat,level=stage(e.hp,e.maxHp);
    c.phase=level;
    c.disruption=Math.max(0,(c.disruption||0)-dt);
    // Phase-three ranged bosses emit a bounded repeat interference pulse every 9 simulated seconds.
    if(level===3&&(e.subType==='ranged_boss'||e.subType==='leviathan')){
      c.pulseClock=(c.pulseClock||0)+Math.min(dt,1);
      if(c.pulseClock>=9){c.pulseClock=0;c.disruption=Math.max(c.disruption,1.1);}
    }else c.pulseClock=0;
    c.terrainTime=Math.max(0,(c.terrainTime||0)-dt);
    if(c.terrainTime===0)c.terrain=0;
    // Derive stats from original spawn values, never compound multipliers each frame.
    const kind=e.subType;
    const factor=kind==='tank_boss'?[1,.90,.79]:kind==='speed_boss'?[1,.92,.82]:[1,.94,.87];
    e.attackInterval=c.baseAttackInterval*factor[level-1];
    e.speed=c.baseSpeed*(level===1?1:level===2?1.06:1.12);
    if(level!==c.lastPhase) {
      c.lastPhase=level;
      try { root.TowerBossCinemaV15?.cue(kind,level); } catch (_) {}
      if(level>=2){
        if(kind==='ranged_boss'||kind==='leviathan')c.disruption=level===3?2.6:1.6;
        if(kind==='tank_boss'||kind==='frost_boss'){c.terrain=level===3?.72:.85;c.terrainTime=level===3?7:5;}
      }
      if(env&&Array.isArray(env.rings))env.rings.push({x:e.x,y:e.y,radius:e.radius+8,color:level===3?'#e5b36b':'#5db8c8',life:.75});
      if(env&&typeof env.text==='function')env.text(e.x,e.y-e.radius-21,level===3?'SON AŞAMA!':'BOSS AŞAMA '+level,level===3?'#e5b36b':'#5db8c8',12);
      if(env&&typeof env.piko==='function')env.piko(level);
    }
    return level;
  }
  function interference(bosses) {
    if(!endless()||!Array.isArray(bosses))return {rate:1,range:1,movement:1};
    let rate=1,range=1,movement=1;
    for(const e of bosses){
      if(!e||e.type!=='boss'||!e.v12Combat||e.hp<=0)continue;
      const c=e.v12Combat;
      if(c.disruption>0)rate=Math.min(rate,c.phase===3?.50:.70);
      if(c.terrainTime>0&&c.terrain>0){range=Math.min(range,c.terrain);movement=Math.min(movement,c.terrain);}
    }
    return {rate,range,movement};
  }
  function dashCooldown(e,normal) {
    if(!endless()||!e?.v12Combat||e.subType!=='speed_boss')return normal;
    return Math.max(1.55,normal*(e.v12Combat.phase===3?.65:e.v12Combat.phase===2?.82:1));
  }
  function volley(e,angles) {
    if(!endless()||!e?.v12Combat)return angles;
    const p=e.v12Combat.phase||1;
    if(p===1)return angles;
    if(['ranged_boss','leviathan'].includes(e.subType))return p===3?[-.26,-.13,0,.13,.26]:[-.20,-.10,0,.10,.20];
    if(e.subType==='frost_boss')return p===3?[-.21,-.105,0,.105,.21]:[-.13,0,.13];
    return angles;
  }
  function mitigation(e,dmg) {
    if (!endless()||!e?.v12Combat||e.subType!=='tank_boss'||e.v12Combat.phase<2) return dmg;
    return Math.max(1,Math.round(dmg*(e.v12Combat.phase===3?.90:.94)));
  }
  function frostDuration(e,duration,count) {
    if (!endless()||e?.subType!=='frost_boss'||!e?.v12Combat||count<=1)return duration;
    return Math.max(.25,duration/(count>=5?2.6:1.6));
  }
  function unlocked(c,k) {return !!(c&&c[k]&&c[k].unlocked);}
  function bonus(e,base,source,companions,timeMs) {
    const empty={bonus:0,label:null};
    if(!endless()||!e||!Number.isFinite(base)||base<=0||!companions) return empty;
    const now=Number.isFinite(timeMs)?timeMs:Date.now();
    const chilled=(e.slowTimer||0)>.1&&unlocked(companions,'frostOrb');
    const plasma=unlocked(companions,'plasmaSatellite');
    if(source==='plasma'&&plasma)e.v12ChargeUntil=now+2400;
    if(chilled&&(source==='plasma'||source==='laser')&&now-(e.v12ShatterAt||-1e9)>750) {
      e.v12ShatterAt=now;
      return {bonus:Math.max(1,Math.round(base*(source==='plasma'?.12:.09))),label:'KRİYO SİNERJİ'};
    }
    if(source==='missile'&&plasma&&Number(e.v12ChargeUntil)>now) {
      e.v12ChargeUntil=0;
      return {bonus:Math.max(1,Math.round(base*.10)),label:'PLAZMA PATLAMASI'};
    }
    return empty;
  }
  root.TowerCombatDirectorV12=Object.freeze({spawn,stage,tick,interference,dashCooldown,volley,mitigation,frostDuration,bonus,endless});
})(window);
