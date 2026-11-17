const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const M=require('../meta-model.js'),C=require('../data/meta-config.js');
const DAY=C.dayMs,now=new Date(2026,10,17,12).getTime();
const fresh=()=>M.sanitizeMeta(null,now);
const transact=(m,id,fn,at=now)=>M.transaction(m,id,'test',fn,at);
function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};}

test('field sanitization handles null, arrays, invalid scalars and money without throwing',()=>{
for(const bad of [null,[],false,'{bad}',123]){const m=M.sanitizeMeta(bad,now);assert.equal(m.currencies.kredi,'0');assert.equal(m.archive.skillSlots.length,6);}
const m=M.sanitizeMeta({currencies:{kredi:'999999999999999999999999999999',kristal:Infinity,parca:-5},archive:{equipment:null,skills:[]},streak:null,returnEvent:[],offline:{activeAt:now+DAY}},now);
assert.equal(m.currencies.kredi,'999999999999999999999999999999');assert.equal(m.currencies.kristal,0);assert.equal(m.currencies.parca,0);
assert.equal(M.accrueOffline(m,now).hours,0);assert.equal(m.offline.pending,0);
});

test('legacy migration preserves all24 items, four equipped groups, parts and30 tier progress',()=>{
const l={owned:{},equipped:{0:0,1:6,2:12,3:18},parts:123,claimed:23,xp:1600,season:Math.floor(now/DAY/30),day:-1,stamps:7,activeAt:now-DAY,cleared:40,offline:21};for(let i=0;i<24;i++)l.owned[i]=(i%5)+1;
const m=M.migrateLegacy(l,now);assert.deepEqual(m.legacy.owned,l.owned);assert.deepEqual(m.legacy.equipped,l.equipped);assert.equal(m.currencies.parca,123);assert.equal(m.season.claimed,23);assert.equal(m.season.xp,1600);assert.equal(m.streak.day,7);assert.equal(m.offline.pending,21);
assert.deepEqual(M.sanitizeMeta(m,now),m);
});

test('migration preserves today entitlement when changing UTC daily to local04',()=>{
const m=M.migrateLegacy({day:Math.floor(now/DAY),stamps:3,activeAt:now},now);assert.equal(m.streak.lastClaimDay,M.localDay(now));assert.equal(M.claimDaily(m,now).ok,false);
});

test('local calendar reset occurs04:00 and six day gap continues whereas seven restarts',()=>{
const t=new Date(2026,10,17,3,59).getTime();assert.equal(M.localDay(t+60000),M.localDay(t)+1);
let m=fresh();let r=transact(m,'day1',d=>M.claimDaily(d,now));assert.equal(r.ok,true);m=r.state;assert.equal(m.streak.day,1);assert.equal(m.currencies.kristal,150);assert.equal(m.currencies.kredi,'100');assert.equal(m.progress.logins,1);
r=transact(m,'day2',d=>M.claimDaily(d,now+6*DAY),now+6*DAY);assert.equal(r.ok,true);assert.equal(r.state.streak.day,2);
r=transact(m,'day7',d=>M.claimDaily(d,now+7*DAY),now+7*DAY);assert.equal(r.ok,true);assert.equal(r.state.streak.day,1);
assert.equal(transact(m,'other-id',d=>M.claimDaily(d,now)).ok,false);assert.equal(transact(m,'past',d=>M.claimDaily(d,now-DAY)).ok,false);
});

test('ledger commits full currency deltas and repeats never reapply',()=>{
const m=fresh();const r=transact(m,'reward:1',d=>{d.currencies.parca+=7;d.currencies.kristal+=150;d.currencies.kredi='10000000000000000000';return {ok:true};});assert.equal(r.ok,true);
assert.deepEqual(r.state.ledger[0],{id:'reward:1',ts:now,reason:'test',delta:{kredi:'10000000000000000000',kristal:150,parca:7}});
assert.equal(m.currencies.parca,0);assert.equal(transact(r.state,'reward:1',d=>{d.currencies.parca++;return {ok:true};}).ok,false);assert.deepEqual(M.sanitizeMeta(r.state,now),r.state);
});

test('transaction failures, thrown exceptions and invalid economics never leak draft writes',()=>{
const m=fresh(),before=JSON.stringify(m);
for(const mutate of [d=>{d.currencies.parca=44;return {ok:false,message:'no'};},d=>{d.currencies.kristal=-2;return {ok:true};},d=>{d.currencies.parca=NaN;return {ok:true};},d=>{d.currencies.kredi='1e40';return {ok:true};},d=>{d.currencies.parca++;throw Error('disk?');}])assert.equal(transact(m,'x',mutate).ok,false);
assert.equal(JSON.stringify(m),before);
});

test('transaction history cannot be rewritten and receipts survive ledger truncation',()=>{
let m=fresh();for(let i=0;i<C.limits.ledger+2;i++){const r=transact(m,'item:'+i,d=>{d.currencies.parca++;return {ok:true};});assert.equal(r.ok,true);m=r.state;}
assert.equal(m.ledger.length,C.limits.ledger);assert.equal(m.receipts['item:0'],true);assert.equal(transact(m,'item:0',()=>({ok:true})).ok,false);
for(const mutate of [d=>{delete d.receipts['item:0'];return {ok:true};},d=>{d.ledger=[];return {ok:true};}])assert.equal(transact(m,'hack',mutate).ok,false);
assert.equal(transact(m,'__proto__',()=>({ok:true})).ok,false);
});

test('receipt capacity fails closed, never prunes old awards into replayability',()=>{
const m=fresh();for(let i=0;i<C.limits.receipts;i++)m.receipts['r:'+i]=true;assert.equal(transact(m,'new',()=>({ok:true})).ok,false);
m.receipts.extra=true;assert.equal(M.sanitizeMeta(m,now).receiptOverflow,true);
});

test('summon uses reproducible injected RNG, charges once, marks new signals unseen',()=>{
const initial=fresh();initial.currencies.kristal=10000;
const a=transact(initial,'summon',d=>M.summon(d,'equipment',10,rng(42))),b=transact(initial,'summon',d=>M.summon(d,'equipment',10,rng(42)));
assert.equal(a.ok,true);assert.deepEqual(a,b);assert.equal(a.state.currencies.kristal,9100);assert.equal(a.result.items.length,10);assert.equal(a.state.archive.summonStats.total,10);assert.equal(a.state.progress.summons,10);
for(const id of a.result.items){assert.equal(a.state.archive.equipment[id].seen,false);assert.ok(a.state.archive.equipment[id].level>0);}
assert.equal(transact(initial,'bad',d=>M.summon(d,'equipment',10,()=>1)).ok,false);
});

test('configured rarity table totals100 and deterministic distribution follows weights',()=>{
assert.equal(C.rarities.reduce((s,r)=>s+r.probability,0),100);
const m=fresh();m.currencies.kristal=1000000;const counts=Array(8).fill(0),random=rng(23);
for(let i=0;i<1000;i++){const r=M.summon(m,'equipment',1,random);assert.equal(r.ok,true);counts[C.equipment.find(x=>x.id===r.items[0]).rarity]++;}
C.rarities.forEach((r,i)=>assert.ok(Math.abs(counts[i]-r.probability*10)<60));
});

test('fusion exact thresholds, threshold-minus1, multi level and fuseAll use copies without parts',()=>{
const m=fresh();m.archive.equipment.weapon_0={level:1,copies:14,seen:false};assert.equal(transact(m,'below',d=>M.fuse(d,'equipment','weapon_0')).ok,false);
m.archive.equipment.weapon_0.copies=30;m.archive.equipment.weapon_15={level:1,copies:2,seen:true};const r=transact(m,'all',d=>M.fuse(d,'equipment'));
assert.equal(r.ok,true);assert.equal(r.state.archive.equipment.weapon_0.level,3);assert.equal(r.state.archive.equipment.weapon_15.level,3);assert.equal(r.state.currencies.parca,0);assert.equal(r.result.changed,2);assert.equal(r.state.progress.fusions,4);
});

test('single weapon and six unique skills respect two free slots and sector gates',()=>{
let m=fresh();m.archive.equipment.weapon_0.level=1;m.archive.skills.ark.level=1;m.archive.skills.slow.level=1;
assert.equal(M.equip(m,'equipment','weapon_0').ok,true);assert.equal(M.equip(m,'equipment',null).ok,true);assert.equal(m.archive.equippedWeapon,null);
assert.equal(M.equip(m,'skill','ark',0,0).ok,true);assert.equal(M.equip(m,'skill','slow',1,0).ok,true);assert.equal(M.equip(m,'skill','ark',1,0).ok,false);assert.equal(M.equip(m,'skill','slow',2,0).ok,false);
assert.equal(M.equip(m,'skill',null,1,0).ok,true);assert.equal(M.equip(m,'skill','slow',2,5).ok,true);assert.deepEqual(M.sanitizeMeta(m,now).archive.skillSlots,['ark',null,'slow',null,null,null]);
});

test('offline caps11h59 and12h01, rejects clock rollback and double claim',()=>{
for(const [minutes,reward]of [[719,330],[721,360]]){let m=fresh();m.offline.activeAt=now-minutes*60000;m.offline.cleared=30;assert.equal(M.accrueOffline(m,now).pending,reward);const r=transact(m,'offline:'+now,d=>M.claimOffline(d));assert.equal(r.ok,true);assert.equal(r.state.currencies.parca,reward);assert.equal(M.claimOffline(r.state).ok,false);assert.equal(transact(r.state,'offline:'+now,d=>M.claimOffline(d)).ok,false);}
const m=fresh();m.offline.activeAt=now+DAY;m.offline.cleared=30;assert.equal(M.accrueOffline(m,now).hours,0);assert.equal(m.offline.activeAt,now+DAY);
});

test('return triggers7d, lasts20d, enforces30d retrigger and monotonic time',()=>{
const m=fresh();m.returnEvent.lastSeenAt=now-7*DAY;assert.equal(M.touchReturn(m,now).ok,true);assert.equal(m.returnEvent.startedAt,now);assert.equal(m.returnEvent.endsAt,now+20*DAY);M.claimDaily(m,now);
assert.equal(M.claimReturn(m,now,1,'login').ok,true);assert.equal(M.claimReturn(m,now,1,'login').ok,false);assert.equal(M.claimReturn(m,now,2,'login').ok,false);
m.progress.waves=3;assert.equal(M.claimReturn(m,now,1,'waves').ok,true);assert.equal(M.claimReturn(m,now+DAY,2,'waves').ok,false);m.progress.waves=6;assert.equal(M.claimReturn(m,now+DAY,2,'waves').ok,true);
assert.equal(M.claimReturn(m,now+20*DAY,1,'bosses').ok,false);
M.touchReturn(m,now+10*DAY);assert.equal(m.returnEvent.startedAt,now);M.touchReturn(m,now-DAY);assert.equal(m.returnEvent.lastSeenAt,now+10*DAY);M.touchReturn(m,now+31*DAY);assert.equal(m.returnEvent.startedAt,now+31*DAY);
});

test('season preserves old claimed tiers, grants premium catchup and rolls only forward',()=>{
let m=fresh();m.season.xp=600;m.season.claimed=5;let r=transact(m,'s1',d=>M.claimSeason(d,now));assert.equal(r.ok,true);assert.equal(r.state.currencies.parca,30);m=r.state;m.season.premiumUnlocked=true;
r=transact(m,'premium',d=>M.claimSeason(d,now));assert.equal(r.ok,true);assert.equal(r.state.currencies.parca,150);assert.equal(r.state.season.premiumClaimed,10);assert.equal(M.claimSeason(r.state,now).ok,false);
assert.equal(M.claimSeason(r.state,now-40*DAY).ok,false);assert.equal(M.claimSeason(r.state,now+40*DAY).ok,true);assert.equal(r.state.season.premiumUnlocked,false);assert.equal(r.state.season.xp,0);
});

test('browser globals expose same frozen model/config without CommonJS',()=>{
const window={};const context=vm.createContext({window,Date,BigInt});vm.runInContext(fs.readFileSync(require.resolve('../data/meta-config.js'),'utf8'),context);vm.runInContext(fs.readFileSync(require.resolve('../meta-model.js'),'utf8'),context);assert.equal(window.MetaConfig.equipment.length,16);assert.equal(window.MetaModel.sanitizeMeta(null,now).currencies.kredi,'0');assert.equal(Object.isFrozen(window.MetaConfig),true);
});
