'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Execute the shipped interior controller; only browser rendering/events are adapters.
function runtime(){
 const nodes=new Map(),noop=()=>{},listeners=new Map();
 const ctx=new Proxy({}, {get:()=>noop,set:()=>true});
 const node=id=>{if(!nodes.has(id))nodes.set(id,{style:{},classList:{add:noop,remove:noop},getContext:()=>ctx,addEventListener:(name,fn)=>listeners.set(id+':'+name,fn),hasPointerCapture:()=>false,appendChild:noop,setAttribute:noop,focus:noop});return nodes.get(id)};
 const sandbox={URLSearchParams,location:{search:'?mission=14'},innerWidth:1032,innerHeight:850,devicePixelRatio:1,requestAnimationFrame:noop,performance:{now:()=>0},addEventListener:(name,fn)=>listeners.set(name,fn),document:{body:node("body"),createElement:()=>node("created"),getElementById:node,addEventListener:noop},StoryInteriorPuzzles:require('../story-interior-puzzles.js')};sandbox.window=sandbox;
 const raw=fs.readFileSync(path.join(__dirname,'../story-interior-missions11-15.js'),'utf8');vm.runInNewContext(raw.replace(/\}\)\(\);\s*$/,'window.run=code=>eval(code);})();'),sandbox);
 return {run:sandbox.run,nodes,listeners};
}
test('lower core only loses health on a physical breach; surviving threats reset',()=>{
 const {run}=runtime();run('beginBattle(4,3);hide()');
 for(let t=50;t<=4000;t+=50)run(`tick(${t})`);
 assert.equal(run('hp'),24);assert.equal(run('enemies[0].x<800'),true);
 run('enemies[0].x=490;enemies[0].y=300;tick(4050)');
 assert.equal(run('hp'),21);assert.equal(run('breaches'),1);assert.equal(run('enemies[0].hp'),3);assert.equal(run('enemies[0].x'),800);
 run('enemies[0].x=490;enemies[0].y=300;tick(4100)');assert.equal(run('hp'),21,'A returning threat cannot breach twice in one cooldown');
});
for(const [seal,hp,speed,health] of [['A',30,16,4],['B',24,12,4],['C',24,16,3]])test(`wave two death/retry preserves seal ${seal} and its benefit`,()=>{
 const {run,nodes}=runtime();run(`phase=3;round=1;sealPriority='MÜHÜR ${seal}';handle(stations.find(s=>s.type==='core'));hide();hp=3;enemies[0].x=490;enemies[0].y=300;tick(50)`);
 assert.equal(run('combat'),false);assert.equal(run('phase'),3);assert.equal(run('round'),1);
 nodes.get('retry').onclick();run("handle(stations.find(s=>s.type==='core'));hide()");
 assert.equal(run('round'),2);assert.equal(run('hp'),hp);assert.equal(run('enemies[0].speed'),speed);assert.equal(run('enemies[0].hp'),health);assert.equal(run('enemies.every(e=>e.x>=800)'),true);
});
test('dialog keyboard input does not latch movement or suppress native button activation',()=>{
 const {run,listeners}=runtime();run("say('test','test')");let prevented=false;
 listeners.get('keydown')({key:' ',preventDefault:()=>{prevented=true}});assert.equal(prevented,false);
 listeners.get('keydown')({key:'ArrowRight',preventDefault:()=>{}});run('hide();move(.05)');assert.equal(run('player.x'),135);
});

test('map pauses movement and does not consume encounter progress',()=>{
 const {run}=runtime();run('phase=2;found.add("MÜHÜR A");keys.add("d");openMap()');
 assert.equal(run('dialog'),true);assert.equal(run('keys.size'),0);assert.equal(run('phase'),2);assert.equal(run('found.size'),1);
 run('hide()');assert.equal(run('dialog'),false);assert.equal(run('mapButton.hidden'),false);
});
