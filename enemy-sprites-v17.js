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
 if(def.phaseIntensity!=null&&(!Array.isArray(def.phaseIntensity)||def.phaseIntensity.length!==2||!def.phaseIntensity.every(n=>Number.isFinite(n)&&n>=1&&n<=1.5)))return false;
 if(def.frame!=null&&(!Array.isArray(def.frame)||def.frame.length!==4||!def.frame.every(Number.isInteger)||def.frame[0]<0||def.frame[1]<0||def.frame[2]<1||def.frame[3]<1||def.frame[2]>1024||def.frame[3]>1024))return false;
 return true;
}
function register(def){
 if(!valid(def))return false;
 registry.set(def.id,Object.freeze({id:def.id,body:def.body,hit:def.hit||null,
   phases:def.phases?Object.freeze([...def.phases]):null,
   pivot:Object.freeze(def.pivot?[...def.pivot]:[0.5,0.5]),scale:def.scale||1,facing:def.facing||'up',frame:def.frame?Object.freeze([...def.frame]):null,phaseIntensity:def.phaseIntensity?Object.freeze([...def.phaseIntensity]):null}));
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
 if(enemy.type==='boss')return enemy.subType||'leviathan';
 if(enemy.variantId)return enemy.variantId;
 // Elites intentionally skip diversity.decorate(); reuse an existing body sprite,
 // while the gameplay's gold elite marker remains independently visible.
 if(enemy.isElite){
  const family={green:'scout',tank:'shield',runner:'redrunner',ranged:'drone',teleporter:'amber',frost:'ice'};
  return family[enemy.subType]||family[enemy.type]||null;
 }
 return null;
}
function render(ctx,enemy,tx,ty,timeMs){
 if(!enabled||!ctx||!enemy||!Number.isFinite(enemy.radius)||enemy.radius<=0)return false;
 const def=registry.get(idFor(enemy));
 if(!def||!def.body)return false;
 const phase=Number(enemy.v12Combat?.phase)||1;
 const phaseSrc=def.phases&&phase>1?def.phases[phase-2]:null;
 const hitSrc=enemy.hitFlash>0?def.hit:null;
 const candidates=[hitSrc,phaseSrc,def.body].filter(Boolean);
 let entry=null,chosenSrc=null;
 for(const src of candidates){
  const candidate=imageFor(src);
  if(candidate&&candidate.status==='ready'){entry=candidate;chosenSrc=src;break;}
 }
 if(!entry)return false;
 const img=entry.img;
 // Display-only footprint: prevent transparent atlas margins and dark skins
 // from making small enemies disappear. Hitbox/pathing remain enemy.radius.
 const boss=enemy.type==='boss';
 const minBody=boss?44:enemy.isElite?31:27;
 const baseSize=enemy.radius*2*(def.scale||1);
 const size=Math.max(baseSize,Math.min(minBody,baseSize*1.65));
 const motion=root.TowerEnemyMotionV17;
 const animation=motion&&typeof motion.frame==='function'?motion.frame(enemy,timeMs):null;
 try{
  ctx.save();
  try{
   // Orient a baked sprite towards the same target used by legacy combat art.
   if(Number.isFinite(tx)&&Number.isFinite(ty)&&Number.isFinite(enemy.x)&&Number.isFinite(enemy.y)){
    const base={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[def.facing]||0;
    ctx.rotate(Math.atan2(ty-enemy.y,tx-enemy.x)-base);
   }
   // Small, deterministic movement applies only to sprites (not gameplay coordinates).
   if(animation){
    if(animation.bob&&typeof ctx.translate==='function')ctx.translate(0,animation.bob);
    if(animation.tilt&&typeof ctx.rotate==='function')ctx.rotate(animation.tilt);
    if(animation.scale!==1&&typeof ctx.scale==='function')ctx.scale(animation.scale,animation.scale);
    if(motion.under)motion.under(ctx,enemy,animation,size);
   }
   // Phase shifts are material response only; never change movement or attack logic.
   if(typeof ctx.filter==='string'){
    const effects=[];
    if(enemy.type==='boss'&&def.phaseIntensity&&phase>1){
     const factor=def.phaseIntensity[Math.min(phase-2,1)];
     effects.push('brightness('+factor.toFixed(2)+') saturate('+Math.min(1.6,factor+0.15).toFixed(2)+')');
    }
    if(enemy.isElite)effects.push('brightness(1.12) saturate(1.14)');
    if(enemy.type==='boss'&&Number(enemy.maxHp)>0&&Number(enemy.hp)/enemy.maxHp<0.35){
     effects.push('contrast(1.15) saturate(0.90)');
    }
    if(effects.length)ctx.filter=effects.join(' ');
   }
   // LOST SIGNAL visual language: dark tactical backing + thin colored
   // signature rim. Draw BEFORE sprite, never over enemy detail or hit indicators.
   // High contrast even in the saturated Cengiz/red environment.
   if(typeof ctx.beginPath==='function'&&typeof ctx.arc==='function'&&typeof ctx.fill==='function'){
    ctx.save();
    try{
     const tone=(enemy.type==='runner'||idFor(enemy)==='redrunner'||idFor(enemy)==='amber')
       ?'#ffb36b':(enemy.color||'#7dd3fc');
     const rim=Math.max(11,size*0.40);
     ctx.fillStyle='rgba(4,10,21,0.78)';
     ctx.beginPath();ctx.arc(0,0,rim,0,Math.PI*2);ctx.fill();
     if(typeof ctx.stroke==='function'){
      ctx.strokeStyle=tone;
      ctx.globalAlpha=0.85;
      ctx.lineWidth=Math.max(1.15,Math.min(1.8,size*0.045));
      ctx.beginPath();ctx.arc(0,0,rim+1.1,-Math.PI*0.92,Math.PI*0.66);ctx.stroke();
     }
     // A single tiny white tracking notch reads like the allied HUD markers.
     if(typeof ctx.fillRect==='function'){
      ctx.globalAlpha=0.88;ctx.fillStyle='#e2f7ff';
      ctx.fillRect(-1.1,-rim-3.5,2.2,2.2);
     }
    }finally{ctx.restore();}
   }
   // Explicit atlas crop: one WebP shared by several enemies, drawn once per frame.
   const drawBody=()=>{
    if(def.frame&&chosenSrc===def.body){
      const [sx,sy,sw,sh]=def.frame;
      if(sx+sw>img.naturalWidth||sy+sh>img.naturalHeight)throw new Error('Sprite frame outside atlas');
      ctx.drawImage(img,sx,sy,sw,sh,-size*def.pivot[0],-size*def.pivot[1],size,size);
    }else{
      ctx.drawImage(img,-size*def.pivot[0],-size*def.pivot[1],size,size);
    }
   };
   drawBody();
   if(animation&&motion.over){
    // Restore the boss material filter after drawing FX, even in lightweight test contexts.
    const materialFilter=typeof ctx.filter==='string'?ctx.filter:null;
    try{
     if(materialFilter!==null)ctx.filter='none';
     motion.over(ctx,enemy,animation,size);
    }finally{
     if(materialFilter!==null)ctx.filter=materialFilter;
    }
   }
   // The legacy painter supplied a hit response; preserve a restrained one for sprites.
   if(enemy.hitFlash>0&&!hitSrc){
    ctx.globalAlpha=Math.min(.32,Math.max(0,Number(enemy.hitFlash)||0)*.32);
    ctx.globalCompositeOperation='screen';
    drawBody();
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
