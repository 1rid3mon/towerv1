/* LOST SIGNAL V17 — restrained sprite-motion layer.
 * Only reads enemy visual state. No timers, combat stats, save keys, or RNG writes.
 * Phase transitions are tracked in a WeakMap so removed enemies are not retained.
 */
(function(root){'use strict';
const phaseHistory=new WeakMap();
const TAU=Math.PI*2;
let quality='auto';
function clamp(v,min,max){return Math.max(min,Math.min(max,Number.isFinite(v)?v:min));}
function reduced(){
 try{return typeof root.matchMedia==='function'&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 catch(_){return false;}
}
function qualityResolved(){
 if(reduced())return 'low';
 if(quality!=='auto')return quality;
 const memory=Number(root.navigator&&root.navigator.deviceMemory);
 return memory>0&&memory<=2?'low':'normal';
}
function frame(enemy,timeMs){
 if(!enemy||!Number.isFinite(enemy.radius)||enemy.radius<=0)return null;
 const ms=Number.isFinite(timeMs)?timeMs:0;
 const boss=enemy.type==='boss';
 const phase=clamp(Number(enemy.v12Combat&&enemy.v12Combat.phase)||1,1,3);
 const hp=Number(enemy.maxHp)>0?clamp(Number(enemy.hp)/enemy.maxHp,0,1):1;
 const hit=clamp(Number(enemy.hitFlash)||0,0,1);
 const low=qualityResolved()==='low';
 const seed=Number.isFinite(enemy.animPhase)?enemy.animPhase:0;
 let transition=0;
 if(boss){
  const last=phaseHistory.get(enemy);
  if(!last){phaseHistory.set(enemy,{phase,at:ms});}
  else if(phase!==last.phase){
   last.phase=phase;last.at=ms;
   if(phase>1)last.burst=true;
   else last.burst=false;
  }else if(last.burst&&!low){
   transition=clamp(1-(ms-last.at)/700,0,1);
   if(transition===0)last.burst=false;
  }
 }
 const t=ms*0.001;
 const cadence=boss?2.6:enemy.type==='runner'||enemy.subType==='speed_boss'?8:4.3;
 const motion=low?0:Math.sin(t*cadence+seed);
 const bob=low?0:motion*(boss?0.48:Math.min(1.15,enemy.radius*0.055));
 const tilt=low?0:Math.sin(t*(boss?1.8:3.4)+seed)*((enemy.type==='runner'||enemy.subType==='speed_boss')?0.037:0.010);
 const scale=1+(low?0:Math.sin(t*(boss?2.6:3.1)+seed)*(boss?0.012:0.006));
 return {low,boss,phase,hp,hit,transition,bob,tilt,scale,seed,t};
}
function under(ctx,enemy,f,size){
 if(!ctx||!f||typeof ctx.beginPath!=='function'||typeof ctx.arc!=='function'||typeof ctx.fill!=='function')return;
 // Boss atlas bodies already contain emissive engines; extra points obscure their silhouettes.
 if(f.boss)return;
 const kind=enemy.subType||enemy.type;
 const thrust=kind==='runner'||kind==='speed_boss'||kind==='ranged'||kind==='ranged_boss'||kind==='leviathan'||kind==='teleporter'||enemy.variantId==='scout'||enemy.variantId==='drone';
 if(!thrust)return;
 // Small exhaust points stay under the sprite; no large glow bloom or extra silhouettes.
 const alpha=f.low?0.16:0.23+0.08*Math.sin(f.t*11+f.seed);
 const y=-size*0.23;
 const glow=kind==='speed_boss'?'#f87171':kind==='leviathan'?'#c084fc':'#67e8f9';
 ctx.save();
 try{
  ctx.globalAlpha=clamp(alpha,0,0.33);
  ctx.fillStyle=glow;
  for(const x of [-size*0.17,size*0.17]){
   ctx.beginPath();ctx.arc(x,y,size*(f.low?0.045:0.058),0,TAU);ctx.fill();
  }
 }finally{ctx.restore();}
}
function over(ctx,enemy,f,size){
 if(!ctx||!f||typeof ctx.beginPath!=='function')return;
 // Damage is conveyed by a brief restrained flash; not a persistent noisy particle cloud.
 if(f.hit>0&&typeof ctx.arc==='function'&&typeof ctx.stroke==='function'){
  ctx.save();try{
   ctx.globalAlpha=0.15+f.hit*0.38;
   ctx.strokeStyle='#fff0de';ctx.lineWidth=Math.min(2.3,Math.max(1,size*0.025));
   ctx.beginPath();ctx.arc(0,0,size*0.40,-1.1,0.45);ctx.stroke();
  }finally{ctx.restore();}
 }
 if(f.boss&&f.transition>0&&typeof ctx.arc==='function'&&typeof ctx.stroke==='function'){
  ctx.save();try{
   ctx.globalAlpha=0.65*f.transition;
   ctx.strokeStyle=enemy.subType==='frost_boss'?'#7dd3fc':enemy.subType==='leviathan'?'#d8b4fe':'#fca5a5';
   ctx.lineWidth=1.3+1.3*f.transition;
   ctx.beginPath();ctx.arc(0,0,size*(0.44+(1-f.transition)*0.22),-Math.PI*0.88,Math.PI*0.42);ctx.stroke();
  }finally{ctx.restore();}
 }
 // Desaturated damaged armor is handled by the sprite material filter; no burn particles.
}
function setQuality(v){if(['auto','normal','low'].includes(v))quality=v;return quality;}
root.TowerEnemyMotionV17=Object.freeze({frame,under,over,setQuality,getState(){return {quality,resolved:qualityResolved(),reducedMotion:reduced()}}});
})(typeof window!=='undefined'?window:globalThis);
