'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Execute the shipped interior controller; only browser rendering/events are adapters.
function runtime(mission=14){
 const nodes=new Map(),noop=()=>{},listeners=new Map();
 const ctx=new Proxy({}, {get:()=>noop,set:()=>true});
 const node=id=>{if(!nodes.has(id))nodes.set(id,{style:{},classList:{add:noop,remove:noop},getContext:()=>ctx,addEventListener:(name,fn)=>listeners.set(id+':'+name,fn),hasPointerCapture:()=>false,appendChild:noop,setAttribute:noop,focus:noop});return nodes.get(id)};
 const sandbox={URLSearchParams,location:{search:'?mission='+mission},innerWidth:1032,innerHeight:850,devicePixelRatio:1,requestAnimationFrame:noop,performance:{now:()=>0},addEventListener:(name,fn)=>listeners.set(name,fn),document:{body:node("body"),createElement:()=>node("created"),getElementById:node,addEventListener:noop},StoryInteriorPuzzles:require('../story-interior-puzzles.js')};sandbox.window=sandbox;
 const raw=fs.readFileSync(path.join(__dirname,'../story-interior-missions11-15.js'),'utf8');vm.runInNewContext(raw.replace(/\}\)\(\);\s*$/,'window.run=code=>eval(code);})();'),sandbox);
 return {run:sandbox.run,nodes,listeners};
}
test('lower core only loses health on a physical breach; surviving threats reset',()=>{
 const {run}=runtime();run('beginBattle(4,3);hide()');
 for(let t=50;t<=4000;t+=50)run(`tick(${t})`);
 assert.equal(run('hp'),24);assert.equal(run('enemies[0].x<800'),true);
 run('enemies[0].x=490;enemies[0].y=300;tick(4050)');
 assert.equal(run('hp'),21);assert.equal(run('breaches'),1);assert.equal(run('enemies[0].hp'),3);assert.ok(run('enemies[0].x')>799,'breached threat returns to its entry before remaining substeps');
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

test('field notebook records only inspected clues and repeated visits do not duplicate them',()=>{
 const {run}=runtime(11);assert.equal(run('fieldNotes.size'),0);
 run('handle(stations.find(s=>s.type==="brief"));hide();handle(stations.find(s=>s.name==="DEVRE ŞEMASI"))');
 assert.equal(run('fieldNotes.size'),1);assert.match(run('fieldNotes.get("DEVRE ŞEMASI")'),/BETA/);
 assert.equal(run('relayEvidence.size'),1);assert.equal(run('found.size'),0);
 run('hide();handle(stations.find(s=>s.name==="DEVRE ŞEMASI"))');assert.equal(run('fieldNotes.size'),1);
});

 test('low frame rate preserves walking speed and does not tunnel through locked gates',()=>{
 const {run}=runtime(11);run("player.y=300;keys.add('d')");
 for(let t=200;t<=800;t+=200)run(`tick(${t})`);
 assert.ok(Math.abs(run('player.x')-299)<.01);
 for(let t=1000;t<=2000;t+=200)run(`tick(${t})`);
 assert.ok(run('player.x')<335,'closed gate stays solid at 5 FPS');
 run('keys.clear();tick(20000)');assert.ok(run('player.x')<335);
});

test('optional power cell docks through movement, opens only with power and records the annex',()=>{
 const {run,nodes}=runtime(11);run('pikoOrders()');nodes.get('piko-door').onclick();assert.equal(run('annex.open'),false);
 run("hide();player.x=248;player.y=330;keys.add('s')");for(let i=0;i<35;i++)run('move(1/60)');run('keys.clear()');
 assert.equal(run('annex.powered'),true);assert.equal(run('phase'),0);
 run('pikoOrders()');nodes.get('piko-door').onclick();assert.equal(run('annex.open'),true);
 run('player.x=125;player.y=480;interact()');assert.equal(run('annex.read'),true);assert.equal(run('fieldNotes.has("YANKI 01 · SON VARDİYA")'),true);
});
test('Piko shield is one charge per defense wave and cannot be replenished in that wave',()=>{
 const {run,nodes}=runtime();run('beginBattle(4,3);hide();pikoOrders()');nodes.get('piko-shield').onclick();
 run('enemies[0].x=490;enemies[0].y=300;simulate(.01,50)');assert.equal(run('hp'),23);assert.equal(run('annex.shield'),false);
 run('pikoOrders()');nodes.get('piko-shield').onclick();assert.equal(run('annex.shield'),false);
});
