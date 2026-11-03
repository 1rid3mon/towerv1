/* LOST SIGNAL V12 — Combat Feel.
 * Cosmetic only. Never mutates damage, enemies, projectiles, game state or saves.
 * A small, bounded ring/spark buffer replaces unbounded particle spam.
 */
(function (root) {
  'use strict';
  const CAP = 46;
  const effects = [];
  const reduced = () => !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lowQuality = () => {
    try {
      const q = game && game.settings && (game.settings.visualQuality || game.settings.graphicsQuality || game.settings.quality);
      return q === 'low' || q === 'off' || q === 0;
    } catch (_) { return false; }
  };
  const canDraw = () => !reduced() && !lowQuality();
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
      const e=effects[i];e.life-=step*(e.type==='boss'?1.2:2.6);
      if(e.life<=0){effects.splice(i,1);continue;}
      const progress=1-e.life, radius=(e.type==='boss'?15:4)+progress*(e.type==='boss'?65:22)*e.scale;
      ctx.save();
      ctx.globalAlpha=Math.min(.76,e.life*.76);
      ctx.strokeStyle=e.color;
      ctx.lineWidth=(e.type==='boss'?3:1.8)*e.life+.35;
      ctx.beginPath();
      if(e.type==='muzzle'){
        ctx.moveTo(e.x-radius*.5,e.y-radius*.5);
        ctx.lineTo(e.x+radius*.5,e.y+radius*.5);
        ctx.moveTo(e.x-radius*.5,e.y+radius*.5);
        ctx.lineTo(e.x+radius*.5,e.y-radius*.5);
      } else {
        ctx.arc(e.x,e.y,radius,0,Math.PI*2);
      }
      ctx.stroke();
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
