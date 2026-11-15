'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function runtime(mission){
 const nodes=new Map(),listeners=new Map(),captures=new Set(),noop=()=>{};
 const ctx=new Proxy({}, {get:()=>noop,set:()=>true});
 function node(id){if(!nodes.has(id))nodes.set(id,{style:{},dataset:{},classList:{add:noop,remove:noop},getContext:()=>ctx,addEventListener:(name,fn)=>listeners.set(id+':'+name,fn),getBoundingClientRect:()=>({left:0,top:0,width:126,height:126}),setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id),appendChild:noop,setAttribute:noop,focus:noop});return nodes.get(id)}
 const sandbox={URLSearchParams,location:{search:'?mission='+mission},innerWidth:1032,innerHeight:850,devicePixelRatio:1,requestAnimationFrame:noop,performance:{now:()=>0},addEventListener:(name,fn)=>listeners.set(name,fn),document:{body:node('body'),createElement:()=>node('created'),getElementById:node,addEventListener:noop}};sandbox.window=sandbox;
 const file=mission===1?'story-interior-mission01.html':mission<=5?'story-interior-missions02-05.html':'story-interior-missions06-10.html';
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),raw=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 vm.runInNewContext(raw.replace(/\}\)\(\);\s*$/,'window.run=code=>eval(code);})();'),sandbox);
 return {run:sandbox.run,listeners,captures};
}
for(const mission of [1,2,6])test(`mission ${mission} retains the original touch owner and clears capture loss`,()=>{
 const {run,listeners,captures}=runtime(mission),state=mission===2?'stick':'joy';
 listeners.get('pad:pointerdown')({pointerId:1,clientX:105,clientY:63});
 const x=run(state+'.x');listeners.get('pad:pointerdown')({pointerId:2,clientX:20,clientY:63});
 assert.equal(run(state+'.id'),1);assert.equal(run(state+'.x'),x);assert.equal(captures.has(2),false);
 listeners.get('pad:lostpointercapture')({pointerId:1});assert.equal(run(state+'.id'),null);assert.equal(run(state+'.x'),0);
});
test('first mission dialog clears movement and preserves native Space activation',()=>{
 const {run,listeners}=runtime(1);run("keys.add('d');show('test')");assert.equal(run('keys.size'),0);
 let blocked=false;listeners.get('keydown')({key:' ',preventDefault:()=>blocked=true});assert.equal(blocked,false);
 listeners.get('keydown')({key:'ArrowRight',preventDefault:()=>{}});run('hide();move(.05)');assert.equal(run('p.x'),170);
});
test('mission 2 terminal loses health only once a surviving patrol reaches it',()=>{
 const {run}=runtime(2);run('alarmStarted=true;foes.forEach(e=>{e.x=510;e.y=190;e.speed=0})');for(let t=50;t<=4000;t+=50)run(`tick(${t})`);assert.equal(run('shield'),18);
 run('foes[0].x=910;foes[0].y=416;tick(4050)');assert.equal(run('shield'),17);
 run('foes[0].hp=0');for(let t=4100;t<=7500;t+=50)run(`tick(${t})`);assert.equal(run('shield'),17,'dead patrols cannot damage the terminal');
});
