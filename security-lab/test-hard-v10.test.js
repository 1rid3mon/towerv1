const fs=require('fs'),vm=require('vm'),assert=require('assert');
const store={};const ctx={window:null,game:{wave:30,highestWave:30},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},document:{readyState:'loading',addEventListener:()=>{}},GameModeRuntime:{isStoryActive:()=>false}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../hard-v10.js','utf8'),ctx);const api=ctx.TowerHardV10;
assert.equal(api.path(),null);assert.equal(api.damage(100),100);assert.equal(api.speed(360),360);assert.equal(api.bounces(0),0);assert.equal(api.rooms.length,3);
function set(p){store.towerV1LostSignalHardV10=JSON.stringify({path:p,completed:[]});const c={...ctx,window:null,TowerHardV10:undefined};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../hard-v10.js','utf8'),c);return c.TowerHardV10;}
let k=set('kinetic');assert.equal(k.damage(100),108);assert.equal(k.speed(360),450);assert.equal(k.bounces(0),1);
let p=set('plasma');assert.equal(p.damage(100),104);let hit=[];let primary={x:0,y:0,hp:100},secondary={x:20,y:0,hp:100},far={x:150,y:0,hp:100};let beams=[];p.onHit(primary,100,{enemies:[primary,secondary,far],tower:{x:0,y:0},getTowerRange:()=>130,lightningBeams:beams,dealDamageToEnemy:(e,d)=>hit.push([e,d])});assert.equal(hit.length,1);assert.equal(hit[0][0],secondary);assert.equal(hit[0][1],20);assert.equal(beams.length,1);
let b=set('bastion'),t={hp:50,maxHp:100,shield:0,maxShield:40};b.waveClear(t);assert.equal(t.hp,53);assert.equal(t.shield,1);
ctx.GameModeRuntime.isStoryActive=()=>true;assert.equal(api.path(),null);
console.log('PASS: default, kinetic, plasma chain range, bastion, story isolation, three rooms');
