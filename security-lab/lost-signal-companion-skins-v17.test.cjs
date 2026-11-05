'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const root={location:{search:''},matchMedia:()=>({matches:false})};root.window=root;
vm.runInNewContext(read('lost-signal-characters-v17.js'),{window:root,globalThis:root});
vm.runInNewContext(read('lost-signal-companion-skins-v17.js'),{window:root,globalThis:root});
const reference=root.TowerUnifiedCharactersV17,collectibles=root.TowerCompanionSkinsV17;
assert(reference&&collectibles,'both skin modules loaded');
const expected=['default_tech','origami_crane','cyber_prism','ghost_wisp','shadow_kunai',
 'crimson_sand','drama_mask','valkyrie_halo','eclipse_crescent','kurt_spirit'];
const data=read('data.js');
const section=data.match(/const COMPANION_SKIN_DATABASE\s*=\s*\{([\s\S]*?)\n\};/);
assert(section,'canonical inventory must stay in data.js');
const actual=[...section[1].matchAll(/^\s+([a-z_]+):\s*\{/gm)].map(x=>x[1]).sort();
assert.deepEqual(actual,[...expected].sort(),'all 10 canonical skin IDs covered and no invented skins');
assert.equal(collectibles.getState().skinCount,8,'remaining eight collectible costumes registered');
assert.deepEqual([...collectibles.IDS].sort(),
 expected.filter(x=>!['default_tech','ghost_wisp'].includes(x)).sort());
const roles=['laserDrone','frostOrb','missileBot','repairDrone','plasmaSatellite'];
function draw(skin,key,star=3,ms=1000,lowMotion=false){
 const calls=[],sets=[];
 root.matchMedia=()=>({matches:lowMotion});
 const ctx=new Proxy({},{
  get(_target,name){return (...args)=>{calls.push({name:String(name),args});};},
  set(_target,name,value){sets.push({name:String(name),value});return true;}
 });
 const params=JSON.stringify([skin,key,star,0,ms]);
 const fromReference=reference.drawCompanion(ctx,skin,key,star,0,ms);
 const fromCollection=!fromReference&&collectibles.drawCompanion(ctx,skin,key,star,0,ms);
 assert.equal(JSON.stringify([skin,key,star,0,ms]),params,'draw cannot alter inputs');
 return {drawn:!!(fromReference||fromCollection),fromReference:!!fromReference,
   fromCollection:!!fromCollection,calls,sets};
}
const silhouettes=new Set();
for(const skin of expected){
 for(const role of roles){
  const info=draw(skin,role);
  assert(info.drawn,skin+' must work for '+role);
  assert(info.calls.some(x=>x.name==='scale'),'native scale / star support: '+skin);
  assert(info.sets.some(x=>x.name==='fillStyle' &&
    ['rgba(2,7,16,0.91)','rgba(2,8,18,0.92)'].includes(x.value)),
    'Cengiz-safe dark background: '+skin);
  assert(info.sets.some(x=>x.name==='strokeStyle'&&
    ['rgba(229,245,255,0.88)','rgba(229,245,255,0.83)'].includes(x.value)),
    'neutral high-contrast ring: '+skin);
  assert.equal(info.calls.filter(x=>x.name==='save').length,
    info.calls.filter(x=>x.name==='restore').length,'Canvas restoration: '+skin);
  if(role===roles[0]){
   const outline=info.calls.filter(x=>['moveTo','lineTo','quadraticCurveTo'].includes(x.name))
    .map(x=>x.name+':'+x.args.map(v=>Math.round(v*100)/100).join(',')).join('|');
   assert(outline.length>60,'not a trivial emoji silhouette: '+skin);
   assert(!silhouettes.has(outline),'independent costume geometry: '+skin);
   silhouettes.add(outline);
  }
 }
}
assert.equal(silhouettes.size,10,'all 10 skins have distinct geometry');
for(const skin of ['default_tech','ghost_wisp']){
 const result=draw(skin,'repairDrone');
 assert(result.fromReference&&!result.fromCollection,'Stage 1.1 references must win');
}
for(const skin of collectibles.IDS){
 const result=draw(skin,'laserDrone',5);
 assert(result.fromCollection&&!result.fromReference,'new owned skin uses Stage 1.4');
}
assert(!draw('not_owned','laserDrone').drawn,'unknown skin falls back to legacy');
assert(!collectibles.drawCompanion({},'valkyrie_halo','not_a_role',2,0,0),
 'role validation prevents undefined colors');
for(const skin of expected){
 const still=draw(skin,'laserDrone',2,9000,true);
 assert(still.drawn,'reduced motion keeps skin visible: '+skin);
 assert(still.calls.some(x=>x.name==='translate'&&x.args[1]===0),
 'reduced motion suppresses bob: '+skin);
}
const render=read('render.js'),ui=read('ui.js'),html=read('index.html');
assert(html.indexOf('lost-signal-companion-skins-v17.js')>0);
assert(html.indexOf('lost-signal-companion-skins-v17.js')<html.indexOf('render.js'));
assert.match(render,/TowerCompanionSkinsV17\.drawCompanion\(ctx, activeCompSkin, key, star, st\.angle \|\| 0, nowCompTime\)/);
assert.match(render,/if \(!unifiedAlly && !collectibleAlly\)\s+drawCustomCompanionSkin\(/);
assert.match(ui,/TowerUnifiedCharactersV17\.drawCompanion\(cCtx, skinId, 'laserDrone', 5/);
assert.match(ui,/TowerCompanionSkinsV17\.drawCompanion\(cCtx, skinId, 'laserDrone', 5/);
assert.match(ui,/if \(!referenceDrawn && !collectibleDrawn\)\s+drawCustomCompanionSkin\(/);
assert.match(ui,/cCtx\.scale\(1\.22, 1\.22\)/,
 're-sized 76px lootbox preview prevents clipping');
console.log('Stage 1.4: 10/10 canonical skins, 5 roles, art identity, reduced-motion, Canvas isolation, owned skin and preview fallbacks passed');
