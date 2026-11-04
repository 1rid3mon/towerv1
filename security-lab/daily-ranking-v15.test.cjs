'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const window={},ctx=vm.createContext({window,Date,Math,Number,Object,Array,Map,String});
for(const file of ['station-systems-v14.js','daily-ranking-v15.js'])new vm.Script(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{filename:file}).runInContext(ctx);
const game=window.TowerStationSystemsV14,rank=window.TowerDailyRankingV15,day='2026-11-04';
let run=game.newRun(day);const actions=[];
for(let i=0;i<15&&!run.finished;i++){if(i===0){run=game.buy(run,0);actions.push({type:'buy',lane:0});}run=game.advance(run);actions.push({type:'next'});}
const base={day,playerId:'player_123',actions};
const ok=rank.validate(base,day);
assert.equal(ok.accepted,true);
assert.equal(ok.score,game.score(run));
assert.equal(rank.validate({...base,score:999999},day).reason,'score_mismatch');
assert.equal(rank.validate(base,'2026-11-05').reason,'day_mismatch');
assert.equal(rank.validate({...base,playerId:'<script>'},day).reason,'invalid_player');
assert.equal(rank.validate({...base,actions:[{type:'next'}]},day).accepted,false);
assert.equal(rank.validate({...base,actions:[...actions,{type:'next'}]},day).accepted,false);
const rows=rank.rank([ok,{...ok,score:ok.score-1},{...ok,playerId:'player_456',score:ok.score+100}],10);
assert.equal(rows.length,2);assert.equal(rows[0].playerId,'player_456');
console.log('PASS V15 daily ranking: deterministic replay, forged scores, date isolation, deduplication');

const pikoStorage=new Map(),pikoWindow={localStorage:{getItem:k=>pikoStorage.get(k)||null,setItem:(k,v)=>pikoStorage.set(k,v)}};
new vm.Script(fs.readFileSync(path.join(__dirname,'..','piko-companion-v3.js'),'utf8')).runInContext(vm.createContext({window:pikoWindow,Number,Object,Array,Math,JSON,String}));
const piko=pikoWindow.TowerPikoV3;
assert.equal(piko.battleCue('phase',2,'tr'),null,'balanced mode avoids mid-phase chatter');
assert.match(piko.battleCue('phase',3,'tr'),/Son evre/);
piko.setQuiet(0);assert.match(piko.battleCue('boss',1,'en'),/Boss detected/);
piko.setQuiet(2);assert.equal(piko.battleCue('critical',3,'tr'),null,'quiet mode silences all Piko warnings');
assert.equal(piko.read().quiet,2);
console.log('PASS V15 Piko battle cue preferences');
