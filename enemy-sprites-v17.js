/* LOST SIGNAL V17: sprite registry, bounded loader and safe legacy fallback.
 * Presentation only: never mutate combat, enemy IDs, save state, or economy.
 */
(function(root){'use strict';
const VARIANTS=['scout','circuit','drone','shield','raider','amber','violet','prism','ice','glacier','snowghost','redrunner','scorpion','cactus','sand','void','nebula','pulse','bubble','butterfly','candy'];
const BOSSES=['tank_boss','ranged_boss','speed_boss','frost_boss','leviathan'];
const ids=new Set([...VARIANTS,...BOSSES]);
const registry=new Map([...ids].map(id=>[id,Object.freeze({id,body:null,hit:null,phases:null,pivot:[0.5,0.5],scale:1,facing:'up'})]));
const images=new Map();
const MAX_CACHE=64;
let enabled=true;
function safeAsset(src){
 return typeof src==='string' && /^assets\/enemies\/v17\/[a-z0-9_-]+\/[a-z0-9_-]+\.(?:webp|png)$/.test(src);
}
function valid(def){
 if(!def||!ids.has(def.id)||!safeAsset(def.body))return false;
 if(def.hit!=null&&!safeAsset(def.hit))return false;
 if(def.phases!=null&&(!Array.isArray(def.phases)||def.phases.length>4||!def.phases.every(safeAsset)))return false;
 if(def.pivot!=null&&(!Array.isArray(def.pivot)||def.pivot.length!==2||!def.pivot.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))return false;
 if(def.scale!=null&&(!Number.isFinite(def.scale)||def.scale<=0||def.scale>3))return false;
 if(def.facing!=null&&!['up','down','left','right'].includes(def.facing))return false;
 return true;
}
function register(def){
 if(!valid(def))return false;
 registry.set(def.id,Object.freeze({id:def.id,body:def.body,hit:def.hit||null,
   phases:def.phases?Object.freeze([...def.phases]):null,
   pivot:Object.freeze(def.pivot?[...def.pivot]:[0.5,0.5]),scale:def.scale||1,facing:def.facing||'up'}));
 return true;
}
function imageFor(src){
 if(!safeAsset(src)||typeof root.Image!=='function')return null;
 if(images.has(src))return images.get(src);
 if(images.size>=MAX_CACHE)return null;
 const entry={status:'loading',img:null};
 images.set(src,entry);
 try{
  const img=new root.Image();
  entry.img=img;
  img.onload=()=>{entry.status=img.naturalWidth>0&&img.naturalHeight>0?'ready':'error';};
  img.onerror=()=>{entry.status='error';};
  img.src=src;
  if(img.complete&&img.naturalWidth>0&&img.naturalHeight>0)entry.status='ready';
 }catch(_){entry.status='error';}
 return entry;
}
function idFor(enemy){
 if(!enemy)return null;
 return enemy.type==='boss'?(enemy.subType||'leviathan'):enemy.variantId||null;
}
function render(ctx,enemy,tx,ty){
 if(!enabled||!ctx||!enemy||!Number.isFinite(enemy.radius)||enemy.radius<=0)return false;
 const def=registry.get(idFor(enemy));
 if(!def||!def.body)return false;
 const phase=Number(enemy.v12Combat?.phase)||1;
 const phaseSrc=def.phases&&phase>1?def.phases[phase-2]:null;
 const hitSrc=enemy.hitFlash>0?def.hit:null;
 const candidates=[hitSrc,phaseSrc,def.body].filter(Boolean);
 let entry=null;
 for(const src of candidates){
  const candidate=imageFor(src);
  if(candidate&&candidate.status==='ready'){entry=candidate;break;}
 }
 if(!entry)return false;
 const img=entry.img;
 const scale=def.scale||1, size=enemy.radius*2*scale;
 try{
  ctx.save();
  try{
   // Orient a baked sprite towards the same target used by legacy combat art.
   if(Number.isFinite(tx)&&Number.isFinite(ty)&&Number.isFinite(enemy.x)&&Number.isFinite(enemy.y)){
    const base={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[def.facing]||0;
    ctx.rotate(Math.atan2(ty-enemy.y,tx-enemy.x)-base);
   }
   ctx.drawImage(img,-size*def.pivot[0],-size*def.pivot[1],size,size);
   // The legacy painter supplied a hit response; preserve a restrained one for sprites.
   if(enemy.hitFlash>0&&!hitSrc){
    ctx.globalAlpha=Math.min(.32,Math.max(0,Number(enemy.hitFlash)||0)*.32);
    ctx.globalCompositeOperation='screen';
    ctx.drawImage(img,-size*def.pivot[0],-size*def.pivot[1],size,size);
   }
  }finally{ctx.restore();}
  return true;
 }catch(_){return false;}
}
function preload(idsToLoad){
 for(const id of idsToLoad||[]){
  const def=registry.get(id);
  if(def?.body)imageFor(def.body);
 }
}
root.TowerEnemySpritesV17=Object.freeze({
 VARIANTS:Object.freeze([...VARIANTS]),BOSSES:Object.freeze([...BOSSES]),
 register,render,preload,idFor,
 setEnabled(v){enabled=!!v;},
 getState(){return {enabled,registered:[...registry.values()].filter(d=>d.body).length,cacheSize:images.size};}
});
})(typeof window!=='undefined'?window:globalThis);
