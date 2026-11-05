'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const root={location:{search:''},matchMedia:()=>({matches:false})};root.window=root;
vm.runInNewContext(read('lost-signal-enemy-families-v17.js'),{window:root,globalThis:root});
const families=root.TowerUnifiedEnemyFamiliesV17;
assert(families,'stage 1.3 renderer exported');
const canonical=['scout','circuit','drone','shield','raider','amber','violet','prism','ice',
 'glacier','snowghost','redrunner','scorpion','cactus','sand','void','nebula','pulse',
 'bubble','butterfly','candy'];
assert.equal(families.IDS.length,20,'20 remaining variants included; first reference scout excluded');
assert.equal(families.getState().familyCount,20);
assert.equal(families.getState().eras.length,6);
assert.deepEqual([...families.IDS].sort(),canonical.filter(x=>x!=='scout').sort(),
 'all canonical normal IDs retained, no additions and no boss mix-up');

function paint(id,overrides={}){
 const calls=[],settings=[];
 const c=new Proxy({},{
  get(_target,name){return (...args)=>{calls.push({name:String(name),args});};},
  set(_target,name,value){settings.push({name:String(name),value});return true;}
 });
 const e={type:'green',variantId:id,radius:11,x:13,y:34,
  hp:70,maxHp:100,hitFlash:0,animPhase:0,...overrides};
 const frozen=JSON.stringify(e);
 const drawn=families.drawEnemy(c,e,200,100,2000);
 assert.equal(JSON.stringify(e),frozen,id+' may not change combat entity or save state');
 return {drawn,calls,settings};
}
const fingerprints=new Set(),palette=new Set();
for(const id of canonical.filter(x=>x!=='scout')){
 const {drawn,calls,settings}=paint(id);
 assert.equal(drawn,true,id+' has procedural family art');
 assert(calls.some(x=>x.name==='fill'),'painted polygon/body for '+id);
 assert(calls.some(x=>x.name==='rotate'),'target orientation is visual only: '+id);
 assert(settings.some(x=>x.name==='fillStyle'&&x.value==='rgba(3,9,20,0.91)'),
   'neutral dark backing even on Cengiz red: '+id);
 assert(settings.some(x=>x.name==='strokeStyle'&&x.value==='rgba(231,246,255,0.90)'),
   'near-white edge on dark/red arenas: '+id);
 const vertices=calls.filter(x=>x.name==='moveTo'||x.name==='lineTo')
  .map(x=>x.name+':'+x.args.map(n=>Math.round(n*100)/100).join(',')).join('|');
 assert(vertices.length>30,'solid silhouette beyond an icon for '+id);
 assert(!fingerprints.has(vertices),'duplicate geometry would collapse identity for '+id);
 fingerprints.add(vertices);
 for(const x of settings)if(x.name==='strokeStyle'&&/^#[0-9a-f]{6}$/i.test(x.value))palette.add(x.value);
}
assert(palette.size>=12,'family identities preserve independent era accents');
const elite=paint('shield',{radius:7,isElite:true});
assert(elite.drawn,'elite family art available');
assert(elite.calls.some(x=>x.name==='arc'&&x.args[2]>=17),
 'elite gets presentation-only footprint while its radius stays seven');
const flash=paint('redrunner',{hitFlash:1});
assert(flash.calls.filter(x=>x.name==='arc').length>=3,'hit response exists');
assert.equal(paint('scout').drawn,false,'existing reference Scout has priority');
assert.equal(paint('bogus').drawn,false,'invented variant must use fallback');
assert.equal(paint('shield',{type:'boss'}).drawn,false,'bosses retain dedicated renderer');
assert.equal(paint('shield',{radius:0}).drawn,false,'invalid radius uses existing fallback');
root.location.search='?enemyArt=legacy';
assert.equal(paint('shield').drawn,false,'visual opt-out keeps full old render path');
root.location.search='';
root.matchMedia=()=>({matches:true});
const still=paint('butterfly');
assert.equal(still.drawn,true,'reduced motion still renders bodies');
assert(still.calls.some(x=>x.name==='translate'&&x.args[1]===0),'reduced motion stops bob');
const html=read('index.html'),render=read('render.js');
assert(html.indexOf('lost-signal-enemy-families-v17.js')>0);
assert(html.indexOf('lost-signal-enemy-families-v17.js')<html.indexOf('render.js'));
assert.match(render,/TowerUnifiedEnemyFamiliesV17\.drawEnemy\(ctx, e, tx, ty, nowCompTime\)/);
assert.match(render,/unifiedEnemyDrawn \|\| unifiedFamilyDrawn \|\|/);
assert.match(render,/if \(!v17SpriteDrawn\) \{\s*drawCustomEnemy\(/,
 'single renderer or complete legacy fallback, never double draw');
console.log('Stage 1.3: all 20 distinct variants, era palettes, 1x contrast, collision isolation and fallback passed');
