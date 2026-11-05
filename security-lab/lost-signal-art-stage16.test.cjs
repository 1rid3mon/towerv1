'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const root={location:{search:''},matchMedia:()=>({matches:false}),game:{settings:{}}};root.window=root;
for(const file of ['lost-signal-towers.js','lost-signal-combat-art-v17.js'])
  vm.runInNewContext(read(file),{window:root,globalThis:root,Math,Number});
const towers=root.TowerLostSignalTowers,combat=root.TowerCombatArtV17;
assert(towers&&combat,'Stage 1.6 exported');
assert.equal(towers.getState().visualOnly,true);
assert.equal(combat.getState().maxTrailSegments,6);
assert.equal(combat.getState().visualOnly,true);
function canvas(){
 const calls=[],writes=[];
 const c=new Proxy({},{
  get(_target,name){return (...args)=>{calls.push({name:String(name),args});};},
  set(_target,name,value){writes.push({name:String(name),value});return true;}
 });
 return {c,calls,writes};
}
const colors=new Set();
const skinsBlock=read('data.js').split('const SKIN_DATABASE = {')[1]?.split('\n};')[0];
assert(skinsBlock,'canonical tower skins database available');
const skinIDs=[...skinsBlock.matchAll(/^\s+([a-z_]+):\s*\{/gm)].map(x=>x[1]);
assert(skinIDs.length>=20,'all real tower skin identities, no invented catalogue');
for(const id of skinIDs){
 const {c,calls,writes}=canvas();
 assert.equal(towers.draw(c,id,2100),true,'chassis for '+id);
 assert.equal(towers.drawAccent(c,id,0,2100),true,'tactical rim for '+id);
 assert(calls.filter(x=>x.name==='closePath').length>=2,'large metal plates for '+id);
 assert(calls.filter(x=>x.name==='arc').length>=6,'tracking arcs for '+id);
 assert(writes.some(x=>x.value==='rgba(238,249,255,0.92)'),
   'bright neutral edge works against Cengiz red: '+id);
 assert.equal(calls.filter(x=>x.name==='save').length,calls.filter(x=>x.name==='restore').length,
   'Canvas stack is restored for '+id);
 colors.add(writes.filter(x=>x.name==='strokeStyle'&&
   /^#[0-9a-f]{6}$/i.test(x.value)).map(x=>x.value).join(','));
}
assert(colors.size>=4,'tower groups keep recognizable color identity');
const shooter={x:10,y:12,radius:3,color:'#fb923c',vx:10,vy:3,history:Array.from({length:30},
 (_,i)=>({x:i,y:i/2})),damage:999,fromEnemy:false};
const snapshot=JSON.stringify(shooter),a=canvas();
assert(combat.drawProjectile(a.c,shooter));
assert.equal(JSON.stringify(shooter),snapshot,'projectile render cannot write gameplay state or history');
assert(a.calls.filter(x=>x.name==='lineTo').length<=6,'bounded history at 400+ waves');
assert(a.writes.some(x=>x.name==='fillStyle'&&x.value==='rgba(3,10,19,0.92)'),
 'dark shield backs bright projectile');
assert(a.writes.some(x=>x.name==='strokeStyle'&&x.value==='rgba(223,240,248,0.88)'));
const frost=canvas();
assert(combat.drawProjectile(frost.c,{x:2,y:3,radius:4,vx:40,vy:0,fromEnemy:true,
  isBossFrost:true,color:'#67e8f9'}));
assert(frost.calls.some(x=>x.name==='rotate'),'frost crystal points toward actual velocity');
const beam={x1:11,y1:12,x2:45,y2:50,color:'#ffb97e'},b=canvas();
const unchanged=JSON.stringify(beam);
assert(combat.drawBeam(b.c,beam));
assert.equal(JSON.stringify(beam),unchanged,'beam renderer does not alter aiming or damage');
assert(b.writes.some(x=>x.value==='rgba(3,10,20,0.92)'),'beam has dark core');
assert.equal(combat.drawBeam(b.c,{x1:3,y1:2,x2:NaN,y2:1}),false);
assert.equal(combat.drawProjectile(a.c,{x:1,y:0,radius:-1}),false);
root.matchMedia=()=>({matches:true});
const motion=canvas();
assert(combat.drawProjectile(motion.c,shooter),'reduced motion still draws projectile');
assert.equal(motion.calls.filter(x=>x.name==='lineTo').length,0,'no animated trails under reduced motion');
const spin=canvas();
assert(towers.drawAccent(spin.c,'default_cyber',0,4000));
assert.equal(spin.calls.filter(x=>x.name==='save').length,
 spin.calls.filter(x=>x.name==='restore').length);
const render=read('render.js'),html=read('index.html'),css=read('lost-signal-stage16.css');
assert(html.indexOf('lost-signal-combat-art-v17.js')>0 &&
 html.indexOf('lost-signal-combat-art-v17.js')<html.indexOf('render.js'));
assert(html.includes('<link rel="stylesheet" href="lost-signal-stage16.css">'));
assert(html.indexOf('silent-station-art.css')<html.indexOf('lost-signal-stage16.css'),
 'Piko stage style must follow earlier station CSS');
assert.match(render,/TowerCombatArtV17\.drawProjectile\(ctx, p\)\) continue/);
assert.match(render,/TowerCombatArtV17\.drawBeam\(ctx, b\)\) continue/);
assert.match(render,/TowerLostSignalTowers\.drawAccent\(c, skinId, angle, nowTime\)/);
assert.match(render,/if \(typeof TowerLostSignalTowers !== "undefined"\) TowerLostSignalTowers\.draw\(c, skinId, nowTime\)/);
assert(render.includes('for (const r of rings)'),'danger rings and wave telegraphs remain available');
assert(render.includes('if (window.TowerCombatV12) window.TowerCombatV12.render'),'V12 feedback API retained');
const piko=html.slice(html.indexOf('<svg id="game-mascot-face"'),html.indexOf('</svg>',html.indexOf('<svg id="game-mascot-face"'))+6);
assert(piko.includes('piko-v17-armor'),'original Piko gets actual new armor geometry');
assert(piko.includes('class="piko-eye"')&&piko.includes('class="piko-core"'),
 'old Piko personality, blinking eyes and reactor retained');
assert(html.includes('id="game-mascot-bubble"')&&html.includes('id="game-mascot"'));
assert(css.includes('overflow-wrap:anywhere')&&css.includes('prefers-reduced-motion:reduce'),
 'speech bubble wrapping and accessibility retained');
const v12=read('combat-v12.js');
assert(v12.includes('const CAP = 46')&&v12.includes('const radius=Math.min('),
 'existing bounded combat effects now have stronger radius ceiling');
assert(v12.includes('ctx.arc(e.x,e.y,radius,2.34,4.63)'),
 'hit/death effects use segmented LOST SIGNAL ring grammar');
console.log('Stage 1.6: Piko original personality + new armor, all tower costumes, beam/projectile rendering, bounded V12 cues, old fallbacks, reduced motion and gameplay isolation passed');
