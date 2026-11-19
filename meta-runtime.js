/* Station meta uses the existing account-scoped Operations envelope as its atomic commit point. */
(function () {
'use strict';
const C=window.MetaConfig,M=window.MetaModel;
// Capture pre-account device preferences once; switching accounts must not copy the previous account.
let legacyFx;try{legacyFx=M.sanitizeFx(JSON.parse(localStorage.getItem('lostSignal:fx')));}catch{legacyFx=M.sanitizeFx(null);} 
let ready=false,preparing=false,lastOwner='',queue=[],autoCount=0,cooldowns={},barrier=0,barrierTime=0;
const owner=()=>typeof currentUser!=='undefined'&&currentUser?.uid||'guest';
const allowed=()=>document.getElementById('story-mode-screen')?.getAttribute('aria-hidden')!=='false'&&document.body.dataset.gameMode!=='story'&&!window.GameModeRuntime?.isStoryActive()&&!(typeof isDuplicateTab!=='undefined'&&isDuplicateTab);
const legacy=()=>window.EndlessOperations.read();
const state=()=>legacy().meta;
function change(name,id,fn){
 if(!allowed())return {ok:false,message:'Hikâye sırasında istasyon işlemi yapılamaz.'};
 const r=window.EndlessOperations.transactMeta(id||name+':'+((legacy().revision||0)+1),name,fn);
 if(r.ok)document.dispatchEvent(new Event('meta-state-changed'));
 return r.ok?{...r.result,ok:true,message:r.message}:r;
}
function creditCost(level) {
 const {baseCost,growthNumerator,growthDenominator}=C.creditUpgrade;
 return BigInt(baseCost)*BigInt(growthNumerator)**BigInt(level)/BigInt(growthDenominator)**BigInt(level);
}
function applyFxPreferences(){const saved=state().fx,current=window.Fx?.settings();if(current&&['intensity','reducedMotion','vibration'].some(k=>saved[k]!==current[k]))window.Fx.configure(saved);}
function action(name,args={}){
 const s=state(),now=Date.now(),type=args.type==='skills'?'skill':args.type;
 switch(name){
 case 'fxPreference':{const result=change(name,null,d=>{d.fx=M.sanitizeFx({...d.fx,...args});d.fxInitialized=true;return {ok:true};});if(result.ok)applyFxPreferences();return result;}
 case 'summon':return change(name,null,d=>M.summon(d,type,args.count));
 case 'fuse':return change(name,null,d=>M.fuse(d,type,args.id??null));
 case 'equip':return change(name,null,d=>M.equip(d,type,args.id??null,args.slot??0,legacy().cleared));
 case 'seen':return change(name,null,d=>{const b=type==='equipment'?d.archive.equipment:d.archive.skills;if(!b[args.id])return {ok:false,message:'Sinyal bulunamadı.'};b[args.id].seen=true;return {ok:true};});
 case 'daily':return change(name,'daily:'+M.localDay(now),d=>M.claimDaily(d,now));
 case 'offline':return change(name,'offline:'+s.offline.activeAt,d=>{const r=M.claimOffline(d);if(r.ok)d.offline.lastClaimId='offline:'+s.offline.activeAt;return r;});
 case 'seasonClaim':return change(name,'season:'+s.season.period+':'+Math.floor(s.season.xp/C.season.xpPerTier)+':'+s.season.premiumUnlocked,d=>M.claimSeason(d,now));
 case 'seasonUnlock':return change(name,'season-unlock:'+s.season.period,d=>{
  if(d.season.premiumUnlocked)return {ok:false,message:'Şeritler zaten açık.'};
  if(d.currencies.kristal<C.season.premiumCost)return {ok:false,message:'Şeritler için '+C.season.premiumCost+' sinyal kristali gerekli.'};
  d.currencies.kristal-=C.season.premiumCost;d.season.premiumUnlocked=true;return {ok:true,message:'Seçkin ve Kayıp şeritleri açıldı.'};
 });
 case 'returnClaim':return change(name,'return:'+s.returnEvent.startedAt+':'+args.day+':'+args.task,d=>M.claimReturn(d,now,args.day,args.task));
 case 'noticeSeen':return change(name,null,d=>{if(typeof args.id!=='string'||args.id.length>80||['__proto__','constructor','prototype'].includes(args.id))return {ok:false};d.seenNotices[args.id]=true;const keys=Object.keys(d.seenNotices);if(keys.length>128)delete d.seenNotices[keys[0]];return {ok:true};});
 case 'noticeDismiss':return change(name,'notice:'+M.localDay(now),d=>{d.notice.dismissedDay=M.localDay(now);return {ok:true};});
 case 'creditUpgrade':return change(name,null,d=>{
  if(d.creditLevel>=C.creditUpgrade.maxLevel)return {ok:false,message:'Son seviyeye ulaştın.'};
  const cost=creditCost(d.creditLevel);
  if(BigInt(d.currencies.kredi)<cost)return {ok:false,message:'Yeterli Kredi yok.'};
  d.currencies.kredi=(BigInt(d.currencies.kredi)-cost).toString();
  d.creditLevel++;
  return {ok:true,message:'Kalıcı hasar yükseltildi.'};
 });
 case 'autoSkills':return change(name,null,d=>{d.autoSkills=!d.autoSkills;return {ok:true,message:d.autoSkills?'Protokoller otomatik.':'Protokoller elle.'};});
 default:return {ok:false,message:'Bu işlem kullanılamıyor.'};
 }
}
function prepare(){
 if(!allowed()||preparing||(ready&&owner()===lastOwner))return;
 preparing=true;lastOwner=owner();queue=[];autoCount=0;cooldowns={};barrier=0;barrierTime=0;
 const oldSeen=state().offline.activeAt;
 const r=change('session',null,d=>{if(!d.fxInitialized){d.fx={...legacyFx};d.fxInitialized=true;}M.touchReturn(d);M.accrueOffline(d,Date.now(),legacy().cleared);return {ok:true};});
 if(r.ok){
  applyFxPreferences();
  const daily=action('daily');if(daily.ok)queue.push('streak');
  if(Date.now()-oldSeen>=300000&&state().offline.pending)queue.push('offline');
  if(state().returnEvent.startedAt&&Date.now()<state().returnEvent.endsAt)queue.push('return');
  // Notices travel through the nonblocking station radio, never the startup modal queue.
 }else window.MetaUI?.notify(r.message);
 ready=true;preparing=false;document.dispatchEvent(new Event('meta-runtime-ready'));
}
function route(view){
 prepare();
 const leave=fn=>window.MetaUI?.closeForRoute?window.MetaUI.closeForRoute(fn):fn();
 if(['boss','gear','tasks'].includes(view))leave(()=>window.EndlessOperations.open(view));
 else if(['upgrade','station'].includes(view))leave(()=>window.MetaCommand?.openUpgrades());
 else if(view==='battle')leave(()=>{if(!document.getElementById('mode-main-menu')?.classList.contains('menu-hidden'))enterGameMode('endless');});
 else if(view==='main')leave(()=>returnToMainMenu());
 else window.MetaUI?.open(view);
}
function startEvent(day){
 const event=window.EndlessOperations.eventBriefing();
 if(event.day!==day){window.MetaUI?.notify('Etkinlik sona erdi.');window.MetaUI?.refresh();return;}
 route('boss');
}
function wave(waveNumber){
 if(!allowed())return;prepare();
 return change('wave',null,d=>{
  d.progress.waves++;if(waveNumber%5===0)d.progress.bosses++;
  d.currencies.kristal+=C.waveRewards.kristal;d.currencies.kredi=(BigInt(d.currencies.kredi)+BigInt(C.waveRewards.kredi)).toString();
  const period=Math.floor(Date.now()/C.dayMs/C.season.days);
  if(period>d.season.period){d.season.period=period;d.season.xp=0;d.season.claimed=0;d.season.premiumClaimed=0;d.season.premiumUnlocked=false;}
  d.season.xp+=C.waveRewards.xp;d.offline.cleared=legacy().cleared;
  d.offline.activeAt=Math.max(d.offline.activeAt,Date.now());d.returnEvent.lastSeenAt=Math.max(d.returnEvent.lastSeenAt,Date.now());return {ok:true};
 });
}
function bonus(stat){
 if(!allowed()||!ready||stat!=='damage')return 0;
 const a=state().archive;let owned=0,equipped=0;
 for(const item of C.equipment){const level=a.equipment[item.id]?.level||0;owned+=level*item.bonus;if(a.equippedWeapon===item.id)equipped=level*item.bonus*3;}
 return owned+equipped+state().creditLevel*C.creditUpgrade.damagePerLevel;
}
function useSkill(slot,automatic=false){
 if(!allowed()||typeof isPaused==='undefined'||isPaused||isDefeated)return {ok:false,message:'Protokol için aktif savaş gerekli.'};
 const s=state(),key=s.archive.skillSlots[slot],item=C.skills.find(x=>x.id===key);
 if(!item)return {ok:false,message:'Arşiv’den bu yuvaya protokol tak.'};
 if((cooldowns[key]||0)>0)return {ok:false,message:'Protokol yeniden doluyor.'};
 if(automatic&&['ark','slow','emp'].includes(key)&&!enemies.length)return {ok:false};
 cooldowns[key]=item.cooldown;const level=s.archive.skills[key].level;
 if(key==='ark')for(const e of [...enemies].slice(0,3))dealDamageToEnemy(e,getTowerDamage()*item.power*level,false,'#6aefe8');
 if(key==='slow'||key==='emp')for(const e of enemies){e.slowFactor=Math.min(e.slowFactor,key==='emp'?0:item.power);e.slowTimer=Math.max(e.slowTimer,item.duration);if(key==='emp')e.metaSilenced=item.duration;}
 if(key==='shield'){barrier=tower.maxHp*item.power;barrierTime=item.duration;}
 if(key==='overload')tower.overdriveTimer=Math.max(tower.overdriveTimer,item.duration);
 if(key==='signal'){game.gold+=Math.ceil(getTowerDamage()*item.power*level);window._syncShadow?.();}
 return {ok:true,message:item.name};
}
function tick(dt){
 if(!ready||!allowed())return;
 for(const key of Object.keys(cooldowns))cooldowns[key]=Math.max(0,cooldowns[key]-dt);
 for(const e of enemies)if(e.metaSilenced)e.metaSilenced=Math.max(0,e.metaSilenced-dt);
 barrierTime=Math.max(0,barrierTime-dt);if(!barrierTime)barrier=0;
 if(state().autoSkills)state().archive.skillSlots.forEach((_,slot)=>useSkill(slot,true));
}
function absorb(amount){if(!allowed())return amount;const used=Math.min(barrier,amount);barrier-=used;return amount-used;}
function showNext(){
 if(autoCount>=2||!queue.length||!allowed()||document.querySelector('dialog[open]')||document.querySelector('#mode-main-menu:not(.menu-hidden)'))return;
 autoCount++;window.MetaUI?.open(queue.shift());
}
function seen(){
 if(!ready||!allowed())return;
 change('last-seen',null,d=>{d.offline.activeAt=Math.max(d.offline.activeAt,Date.now());d.returnEvent.lastSeenAt=Math.max(d.returnEvent.lastSeenAt,Date.now());return {ok:true};});
}
document.addEventListener('visibilitychange',()=>{
 if(!ready||!allowed())return;
 if(document.hidden)seen();else {const gap=Date.now()-state().offline.activeAt;change('resume',null,d=>{M.touchReturn(d);M.accrueOffline(d,Date.now(),legacy().cleared);return {ok:true};});if(gap>=300000&&state().offline.pending)queue.push('offline');window.MetaUI?.refresh();}
});
window.addEventListener('pagehide',seen);
window.MetaRuntime=Object.freeze({getState:()=>JSON.parse(JSON.stringify(state())),getLegacy:()=>JSON.parse(JSON.stringify(legacy())),prepare,action,creditCost,route,eventBriefing:()=>window.EndlessOperations.eventBriefing(),startEvent,wave,bonus,useSkill,tick,absorb,cooldown:slot=>cooldowns[state().archive.skillSlots[slot]]||0,pending:()=>queue.slice()});
window.addEventListener('load',()=>{prepare();window.setInterval(showNext,900);});
})();
