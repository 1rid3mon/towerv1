/* LOST SIGNAL Stage 1.6 · coherent bounded projectile/beam art.
 * Pure Canvas painters. Never mutates projectile history, collisions, velocities,
 * damage, target selection, energy or saves. Existing renderer is retained as fallback.
 */
(function(root){'use strict';
const PI=Math.PI,TAU=PI*2;
const INK='#07121f';
function valid(o,keys){
 return o&&keys.every(k=>Number.isFinite(o[k]));
}
function reduced(){
 try{return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(_){return false;}
}
function low(){
 try{return !!(root.game&&root.game.settings&&['low','off',0].includes(
 root.game.settings.visualQuality??root.game.settings.graphicsQuality??root.game.settings.quality));}
 catch(_){return false;}
}
function color(p){
 // The external projectile color is a type cue; never substitute it with
 // an unrelated palette. Validation prevents unexpected Canvas color strings.
 return typeof p.color==='string'&&/^#[0-9a-f]{3,8}$/i.test(p.color)?p.color:'#a8e6f1';
}
function drawProjectile(c,p){
 if(!c||!valid(p,['x','y','radius'])||p.radius<=0)return false;
 const radius=Math.min(11,Math.max(1.4,p.radius));
 const hue=p.isBossFrost?'#b7f1ff':color(p);
 const calm=reduced()||low();
 c.save();
 try{
  // Limit history on crowded waves. Body remains at the exact gameplay x/y.
  if(!calm&&Array.isArray(p.history)&&p.history.length>1){
   const count=Math.min(6,p.history.length);
   c.beginPath();c.moveTo(p.x,p.y);
   for(let i=0;i<count;i++){
    const pt=p.history[i];
    if(valid(pt,['x','y']))c.lineTo(pt.x,pt.y);
   }
   c.strokeStyle='rgba(3,10,19,0.75)';c.lineWidth=radius*1.55+1.25;
   c.lineCap='round';c.lineJoin='round';c.stroke();
   c.strokeStyle=hue;c.globalAlpha=.34;c.lineWidth=Math.max(.85,radius*.72);c.stroke();
   c.globalAlpha=1;
  }
  if(p.isBossFrost&&p.fromEnemy){
   // Distinct ice crystal; old bolt hitboxes/velocity and motion unchanged.
   const facing=Number.isFinite(p.vx)&&Number.isFinite(p.vy)?Math.atan2(p.vy,p.vx):0;
   c.translate(p.x,p.y);c.rotate(facing);
   c.fillStyle=INK;c.strokeStyle='#e1faff';c.lineWidth=1.25;
   c.beginPath();c.moveTo(radius*2.4,0);c.lineTo(-radius*.25,-radius*1.2);
   c.lineTo(-radius*1.25,0);c.lineTo(-radius*.25,radius*1.2);c.closePath();c.fill();c.stroke();
   c.fillStyle='#9ce7f9';c.beginPath();c.moveTo(radius*1.75,0);
   c.lineTo(-radius*.2,-radius*.62);c.lineTo(-radius*.2,radius*.62);c.closePath();c.fill();
  }else{
   // Concentric tactical pellet, not glowing toy spheres or screen-wide bloom.
   const r=Math.min(9.5,radius*1.15);
   c.beginPath();c.arc(p.x,p.y,r+1.1,0,TAU);
   c.fillStyle='rgba(3,10,19,0.92)';c.fill();
   c.strokeStyle='rgba(223,240,248,0.88)';c.lineWidth=1.05;c.stroke();
   c.beginPath();c.arc(p.x,p.y,r*.72,0,TAU);c.fillStyle=hue;c.fill();
   c.beginPath();c.arc(p.x-r*.17,p.y-r*.17,Math.max(.8,r*.27),0,TAU);
   c.fillStyle='#f5fbff';c.fill();
  }
 }finally{c.restore();}
 return true;
}
function drawBeam(c,b){
 if(!c||!valid(b,['x1','y1','x2','y2']))return false;
 const hue=color(b);
 c.save();
 try{
  // Dark under-stroke gives a clean signal route on both red and icy themes.
  c.lineCap='round';c.beginPath();c.moveTo(b.x1,b.y1);c.lineTo(b.x2,b.y2);
  c.strokeStyle='rgba(3,10,20,0.92)';c.lineWidth=4.5;c.stroke();
  c.strokeStyle=hue;c.lineWidth=2.15;c.stroke();
  if(!low()&&!reduced()){
   c.strokeStyle='rgba(241,251,255,0.90)';c.lineWidth=.65;c.stroke();
  }
 }finally{c.restore();}
 return true;
}
root.TowerCombatArtV17=Object.freeze({
 drawProjectile,drawBeam,
 getState(){return {style:'lost-signal-industrial-v1.6',
  maxTrailSegments:6,maxProjectileRadius:11,visualOnly:true};}
});
})(typeof window!=='undefined'?window:globalThis);
