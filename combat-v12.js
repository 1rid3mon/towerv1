/* LOST SIGNAL V12 — Combat Feel.
 * Cosmetic only. Never mutates damage, enemies, projectiles, game state or saves.
 * A small, bounded ring/spark buffer replaces unbounded particle spam.
 */
(function (root) {
  'use strict';
  const CAP = 46;
  const effects = [];
  const reduced = () => root.Fx?.settings().reduced || !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lowQuality = () => {
    try {
      const q = game && game.settings && (game.settings.visualQuality || game.settings.graphicsQuality || game.settings.quality);
      return q === 'low' || q === 'off' || q === 0;
    } catch (_) { return false; }
  };
  const canDraw = () => !reduced() && !lowQuality() && root.Fx?.settings().effectiveIntensity !== 'low';
  function add(x, y, type, color, scale) {
    if (!canDraw() || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (effects.length >= CAP) effects.shift();
    effects.push({x,y,type,color:typeof color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#5db8c8',life:1,scale:Math.max(.4,Math.min(3,Number(scale)||1))});
  }
  function shot(x,y,color,critical) {
    add(x,y,'muzzle',color,critical?1.2:.72);
  }
  function hit(x,y,color,critical,boss) {
    add(x,y,critical?'critical':'impact',color,boss?1.7:critical?1.25:.7);
  }
  function death(x,y,color,boss) {
    if (boss) {
      add(x,y,'boss',color,2.2);
      add(x,y,'boss', '#e5b36b',1.2);
    } else add(x,y,'death',color,.85);
  }
  function incoming(x,y,color) {add(x,y,'tower',color,1.15);}
  function render(ctx,dt) {
    if (!ctx || !Number.isFinite(dt)) return;
    if (!canDraw()) {effects.length=0;return;}
    const step=Math.min(.08,Math.max(0,dt));
    for(let i=effects.length-1;i>=0;i--) {
      const e=effects[i];e.life-=step*(e.type==='death'?1/.22:e.type==='boss'?1.2:2.6);
      if(e.life<=0){effects.splice(i,1);continue;}
      // Stage 1.6: bounded hardware signal ripples; retain the existing timing and
      // CAP so effects cannot bury attack telegraphs in a 400+ wave battle.
      if(root.Fx && !root.Fx.takeBudget()) continue;
      const progress=1-e.life;
      const radius=Math.min(e.type==='boss'?74:24,
        ((e.type==='boss'?15:4)+progress*(e.type==='boss'?42:14)*e.scale));
      ctx.save();
      ctx.globalAlpha=Math.min(.68,e.life*.68);
      ctx.strokeStyle=e.color;
      ctx.lineWidth=(e.type==='boss'?2.35:1.55)*e.life+.4;
      ctx.beginPath();
      if(e.type==='muzzle'){
        ctx.moveTo(e.x-radius*.48,e.y-radius*.48);
        ctx.lineTo(e.x+radius*.48,e.y+radius*.48);
        ctx.moveTo(e.x-radius*.48,e.y+radius*.48);
        ctx.lineTo(e.x+radius*.48,e.y-radius*.48);
      } else {
        // Two broken segments, like the character and tower tracking arcs.
        ctx.arc(e.x,e.y,radius,-.72,1.16);
        ctx.moveTo(e.x+Math.cos(2.34)*radius,e.y+Math.sin(2.34)*radius);
        ctx.arc(e.x,e.y,radius,2.34,4.63);
      }
      ctx.stroke();
      if(e.type==='death') {
        // A short compressed core becomes eight original data fragments.
        const age=progress*.22;
        if(age<.06){
          ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.25,.75);
          ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(0,0,8*(1-age/.08),0,Math.PI*2);ctx.fill();ctx.restore();
        } else {
          const count=root.Fx?.settings().effectiveIntensity==='high'?12:8;
          for(let n=0;n<count;n++){
            if(root.Fx && !root.Fx.takeBudget()) break;
            const angle=n/count*Math.PI*2, travel=8+progress*22;
            ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(e.x+Math.cos(angle)*travel,e.y+Math.sin(angle)*travel,2.4*e.life+.4,0,Math.PI*2);ctx.fill();
          }
        }
      }
      if(e.type==='critical'||e.type==='tower'){
        const d=radius*.75;
        ctx.beginPath();ctx.moveTo(e.x-d,e.y);ctx.lineTo(e.x+d,e.y);
        ctx.moveTo(e.x,e.y-d);ctx.lineTo(e.x,e.y+d);ctx.stroke();
      }
      ctx.restore();
    }
  }
  root.TowerCombatV12=Object.freeze({shot,hit,death,incoming,render,
    // Pure diagnostics; no reference to the live mutable buffer escapes.
    diagnostics:()=>({count:effects.length,cap:CAP,enabled:canDraw()})});
})(window);
