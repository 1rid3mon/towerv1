'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=(p)=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const root={location:{search:''},matchMedia:()=>({matches:false})};root.window=root;
vm.runInNewContext(read('lost-signal-characters-v17.js'),{window:root,globalThis:root});
const art=root.TowerUnifiedCharactersV17;
assert(art,'unified character renderer exported');
assert.equal(art.getState().referenceCharacters.length,3);
const calls=[];
const ctx=new Proxy({}, {get(_target,name){
 if(name==='canvas')return {width:240,height:240};
 return (...args)=>{calls.push({name:String(name),args});};
},set(){return true;}});
const echo={key:'repairDrone',star:4,angle:0.8};
assert.equal(art.drawCompanion(ctx,'default_tech',echo.key,echo.star,echo.angle,1000),true);
assert(calls.filter(x=>x.name==='fill').length>=7,'Echo receives a complete armored body and face');
assert.equal(art.drawCompanion(ctx,'ghost_wisp','laserDrone',1,0,1000),true,
 'existing Ghost Wisp skin receives coherent holographic Echo chassis');
assert.equal(art.drawCompanion(ctx,'origami_crane','laserDrone',1,0,1000),false,
 'unconverted collectible skins retain their original renderers');
assert.equal(art.drawCompanion(ctx,'default_tech','unknown',1,0,1000),false);
const scout={type:'green',variantId:'scout',radius:11,x:2,y:5,hp:15,maxHp:15,hitFlash:0};
const before=JSON.stringify(scout),count=calls.length;
assert.equal(art.drawEnemy(ctx,scout,30,40,1200),true);
assert(calls.length>count,'Scout paints geometry');
assert.equal(JSON.stringify(scout),before,'Scout rendering never mutates gameplay state');
const titan={type:'boss',subType:'tank_boss',radius:38,x:11,y:30,hp:300,maxHp:350,
 hitFlash:0,v12Combat:{phase:2}};
const titanBefore=JSON.stringify(titan),first=calls.length;
assert.equal(art.drawEnemy(ctx,titan,0,0,1400),true);
assert(calls.length>first+20,'Titan paints segmented armor and reactor');
assert.equal(JSON.stringify(titan),titanBefore,'Titan rendering never writes combat or phase');
for(const phase of [1,2,3]){titan.v12Combat.phase=phase;assert(art.drawEnemy(ctx,titan,0,0,1800));}
assert.equal(art.drawEnemy(ctx,{type:'runner',variantId:'redrunner',radius:8},0,0,0),false,
 'other 24 identities retain existing V17 sprite rendering');
assert.equal(art.drawEnemy(ctx,{type:'green',variantId:'scout',radius:0},0,0,0),false);
root.location.search='?enemyArt=legacy';
assert.equal(art.drawEnemy(ctx,scout,30,40,1400),false,'legacy visual opt-out still works');
root.location.search='';
root.matchMedia=()=>({matches:true});
assert(art.drawEnemy(ctx,titan,0,0,1400),'reduce-motion user can still draw Titan');
const render=read('render.js'),index=read('index.html');
assert.match(render,/TowerUnifiedCharactersV17\.drawEnemy\(ctx, e, tx, ty, nowCompTime\)/);
assert.match(render,/TowerUnifiedCharactersV17\.drawCompanion\(ctx, activeCompSkin, key, star, st\.angle \|\| 0, nowCompTime\)/);
assert.match(render,/if \(!unifiedAlly\) drawCustomCompanionSkin\(/,'custom-skin fallback persists');
assert.match(render,/if \(!v17SpriteDrawn\) \{\s*drawCustomEnemy\(/,'missing art still uses legacy drawing');
assert(index.indexOf('lost-signal-characters-v17.js')>0);
assert(index.indexOf('lost-signal-characters-v17.js')<index.indexOf('render.js'),'art loaded before renderer');
console.log('Unified LOST SIGNAL reference trio / style fallback / gameplay isolation passed');
