'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=pathName=>fs.readFileSync(path.join(__dirname,'..',pathName),'utf8');
const root={location:{search:''},matchMedia:()=>({matches:false})};root.window=root;
vm.runInNewContext(read('lost-signal-bosses-v17.js'),{window:root,globalThis:root});
const art=root.TowerBossFamiliesV17;
assert(art,'boss family renderer exported');
const expected=['tank_boss','ranged_boss','speed_boss','frost_boss','leviathan'];
assert.deepEqual([...art.IDS],expected,'no invented bosses and canonical IDs preserved');
assert.equal(art.getState().bossCount,5);
assert.equal(art.getState().phaseCount,3);
const signatures=new Map();
function paint(id,phase,extras={}){
 const calls=[],props=[];
 const ctx=new Proxy({},{get(_,key){return (...args)=>{calls.push({key:String(key),args});};},
  set(_,key,value){props.push({key:String(key),value});return true;}});
 const enemy={type:'boss',subType:id,radius:35,x:0,y:0,hp:900,maxHp:1000,
  hitFlash:0,attackCooldown:0.31,v12Combat:{phase},...extras};
 const previous=JSON.stringify(enemy);
 const ok=art.drawEnemy(ctx,enemy,120,0,2300);
 assert.equal(JSON.stringify(enemy),previous,id+' phase '+phase+' rendering must never mutate gameplay');
 return {ok,calls,props};
}
for(const id of expected){
 let lastBodies=-1;
 for(const phase of [1,2,3]){
  const {ok,calls,props}=paint(id,phase);
  assert.equal(ok,true,id+' phase '+phase+' must draw');
  assert.equal(calls.filter(c=>c.key==='save').length,calls.filter(c=>c.key==='restore').length,
   id+' Canvas stack must be balanced');
  assert(calls.some(c=>c.key==='rotate'),'target direction applied locally');
  assert(props.some(c=>c.key==='fillStyle'&&c.value==='rgba(2,8,18,0.94)'),
   'same industrial backing on Cengiz red and dark theme');
  assert(props.some(c=>c.key==='strokeStyle'&&c.value==='rgba(232,245,255,0.9)'),
   'neutral contrast edge retained for '+id);
  const bodies=calls.filter(c=>c.key==='closePath').length;
  assert(bodies>=4,'layered silhouette, not a cheap circle/enlarged enemy: '+id);
  if(phase>1)assert(bodies>lastBodies,'phase '+phase+' must deploy additional physical armor on '+id);
  lastBodies=bodies;
  if(phase===1){
   const signature=calls.filter(c=>c.key==='moveTo'||c.key==='lineTo')
    .map(c=>c.key+':'+c.args.map(x=>Math.round(x*100)/100).join(',')).join('|');
   assert(signature.length>150,'strong distinct silhouette for '+id);
   assert(![...signatures.values()].includes(signature),'unique boss anatomy, not color reskin');
   signatures.set(id,signature);
  }
 }
 const hit=paint(id,2,{hitFlash:1});
 assert(hit.ok&&hit.props.some(c=>c.value==='#ffffff'),'hit flash white core '+id);
}
assert.equal(signatures.size,5);
assert(paint('speed_boss',3,{radius:24}).ok,'small speed boss stays visible');
assert.equal(paint('invented_boss',1).ok,false,'unknown boss uses original renderer');
assert.equal(paint('tank_boss',1,{type:'runner'}).ok,false,'not a boss');
assert.equal(paint('tank_boss',1,{radius:0}).ok,false,'invalid radius falls back');
// The same boss object must deploy armor progressively *after* combat phase changes,
 // without writing presentation state into gameplay or save data.
const scaleCalls=[];
const moveCtx=new Proxy({},{
 get(_,key){return (...args)=>{if(key==='scale')scaleCalls.push(args);};},
 set(){return true;}
});
const movingBoss={type:'boss',subType:'tank_boss',radius:40,x:1,y:2,
 hp:800,maxHp:900,hitFlash:0,v12Combat:{phase:1}};
assert(art.drawEnemy(moveCtx,movingBoss,80,0,1000));
movingBoss.v12Combat.phase=2;
scaleCalls.length=0;
assert(art.drawEnemy(moveCtx,movingBoss,80,0,1200));
assert(scaleCalls.some(pair=>pair[0]===1&&Math.abs(pair[1]-.82)<.01),
 'a new visual phase starts with compressed armor');
scaleCalls.length=0;
assert(art.drawEnemy(moveCtx,movingBoss,80,0,1600));
assert(scaleCalls.some(pair=>pair[0]===1&&pair[1]>.9&&pair[1]<1),
 'armor unfolds gradually during visual-only 680ms transition');
scaleCalls.length=0;
assert(art.drawEnemy(moveCtx,movingBoss,80,0,1900));
assert(scaleCalls.some(pair=>pair[0]===1&&pair[1]===1),
 'visual transition settles without delaying any combat');

root.location.search='?enemyArt=legacy';
assert.equal(paint('tank_boss',2).ok,false,'opt-out preserves original WebP/legacy art');
root.location.search='';
root.matchMedia=()=>({matches:true});
const reduced=paint('leviathan',3);
assert(reduced.ok,'reduced motion still shows phase 3');
assert(reduced.calls.some(c=>c.key==='translate'&&c.args[1]===0),
 'reduced motion disables bobbing');
movingBoss.v12Combat.phase=3;
scaleCalls.length=0;
assert(art.drawEnemy(moveCtx,movingBoss,80,0,2000));
assert(scaleCalls.some(pair=>pair[0]===1&&pair[1]===1),
 'prefers-reduced-motion disables new phase unfolding');
const render=read('render.js'),html=read('index.html');
assert(html.indexOf('lost-signal-bosses-v17.js')>=0 &&
 html.indexOf('lost-signal-bosses-v17.js')<html.indexOf('render.js'),
 'boss module loaded ahead of render.js');
assert.match(render,/TowerBossFamiliesV17\.drawEnemy\(ctx, e, tx, ty, nowCompTime\)/);
assert.match(render,/bossFamilyDrawn \|\| unifiedEnemyDrawn \|\| unifiedFamilyDrawn \|\|/);
assert.match(render,/if \(!v17SpriteDrawn\) \{\s*drawCustomEnemy\(/,
 'no double painting; legacy fallback intact');
for(const signal of ['BOSS / FAZ ','e.attackCooldown > 0','e.dashCooldown > 0'])
 assert(render.includes(signal),'phase labels and warning rings untouched: '+signal);
console.log('Stage 1.5: five boss silhouettes, all 15 structural phase states, no gameplay mutation, fallback and reduced motion passed');
