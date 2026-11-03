/* TowerV1 V14: deterministic, isolated station systems.
   No writes to story progress, gameplay currency, global leaderboard or cloud saves. */
(function(root){
'use strict';
if(root.TowerStationSystemsV14)return;
const ANOMALIES=Object.freeze([
 {id:'fog',name:['Sinyal Sisi','Signal Fog'],desc:['Kule menzili %18 azalır.','Tower range reduced by 18%.'],range:.82,speed:1,rate:1},
 {id:'gravity',name:['Düşük Yerçekimi','Low Gravity'],desc:['Düşmanların ilerleyişi %18 yavaşlar.','Enemies move 18% slower.'],range:1,speed:.82,rate:1},
 {id:'ion',name:['İyon Fırtınası','Ion Storm'],desc:['Kule atış sıklığı %15 azalır.','Tower firing rate reduced by 15%.'],range:1,speed:1,rate:.85}
]);
function anomalyFor(wave,isStory){
 const n=Number(wave);
 if(isStory||!Number.isInteger(n)||n<7||n%7!==0||n%5===0)return null;
 return ANOMALIES[(n/7-1)%ANOMALIES.length];
}
function validDate(day){return typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day+'T00:00:00Z'));}
function dailyDate(now){return (now instanceof Date?now:new Date()).toISOString().slice(0,10);}
function seedFor(day){
 if(!validDate(day))return 1;
 let h=2166136261;
 for(let i=0;i<day.length;i++){h^=day.charCodeAt(i);h=Math.imul(h,16777619);}
 return h>>>0;
}
function planFor(day){
 let seed=seedFor(day),next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const result=[];
 for(let i=0;i<12;i++){
  const count=i>=5?2:1;
  const wave=[];
  for(let j=0;j<count;j++)wave.push({id:i*2+j,lane:Math.floor(next()*3),hp:2+Math.floor(i/4)+(i===11?2:0),dist:3});
  result.push(wave);
 }
 return result;
}
function newRun(day){
 const date=validDate(day)?day:dailyDate();
 return {date,turn:0,energy:4,towers:[0,0,0],enemies:[],kills:0,leaks:0,finished:false};
}
function buy(run,lane){
 if(!run||run.finished||!Number.isInteger(lane)||lane<0||lane>2)return run;
 const level=Number(run.towers[lane])||0,cost=level+1;
 if(level>=3||run.energy<cost)return run;
 const towers=run.towers.slice();towers[lane]=level+1;
 return {...run,towers,energy:run.energy-cost};
}
function advance(run){
 if(!run||run.finished)return run;
 const next={...run,towers:run.towers.slice(),enemies:run.enemies.map(e=>({...e})),turn:run.turn+1,energy:Math.min(12,run.energy+1)};
 if(run.turn<12)next.enemies.push(...planFor(run.date)[run.turn].map(e=>({...e})));
 for(let lane=0;lane<3;lane++){
  const targets=next.enemies.filter(e=>e.lane===lane&&e.hp>0).sort((a,b)=>a.dist-b.dist);
  if(targets.length&&next.towers[lane]>0)targets[0].hp-=next.towers[lane]*2;
 }
 const survivors=[];
 for(const e of next.enemies){
  if(e.hp<=0){next.kills++;continue;}
  e.dist--;
  if(e.dist<=0){next.leaks++;continue;}
  survivors.push(e);
 }
 next.enemies=survivors;
 if(next.turn>=15||next.leaks>=6)next.finished=true;
 return next;
}
function score(run){return !run?0:Math.max(0,run.kills*100+run.turn*15-run.leaks*60);}
function stationStage(completed){
 const n=Math.min(27,Math.max(0,Math.floor(Number(completed)||0)));
 return n>=27?3:n>=18?2:n>=9?1:0;
}
function pikoProfile(progress,stats){
 const p=progress&&typeof progress==='object'?progress:{},s=stats&&typeof stats==='object'?stats:{};
 if(p.callSignChoice==='echo'&&p.mission21Complete)return 'echo';
 if(p.voiceChoice==='human')return 'human';
 if((Number(s.bossKills)||0)>=10)return 'veteran';
 if(p.mission12Complete)return 'curious';
 return 'rookie';
}
root.TowerStationSystemsV14=Object.freeze({ANOMALIES,anomalyFor,dailyDate,seedFor,planFor,newRun,buy,advance,score,stationStage,pikoProfile});
})(window);
