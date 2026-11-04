/* V15 leaderboard contract: deterministic candidate validation only.
   Not an authenticated endpoint or permission to write public scores. */
(function(root){
'use strict';
if(root.TowerDailyRankingV15)return;
const logic=root.TowerStationSystemsV14;
const ID=/^[A-Za-z0-9_-]{8,64}$/;
const DAY=/^\d{4}-\d{2}-\d{2}$/;
function validDay(day){if(typeof day!=='string'||!DAY.test(day))return false;const d=new Date(day+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===day;}
function validActions(actions){return Array.isArray(actions)&&actions.length>0&&actions.length<=80&&actions.every(a=>a&&typeof a==='object'&&!Array.isArray(a)&&Object.keys(a).length===(a.type==='buy'?2:1)&&(a.type==='next'||(a.type==='buy'&&Number.isInteger(a.lane)&&a.lane>=0&&a.lane<=2)));}
function validate(candidate,serverDay){
 if(!logic||!candidate||typeof candidate!=='object'||Array.isArray(candidate))return {accepted:false,reason:'invalid_submission'};
 if(!validDay(serverDay)||candidate.day!==serverDay)return {accepted:false,reason:'day_mismatch'};
 if(typeof candidate.playerId!=='string'||!ID.test(candidate.playerId))return {accepted:false,reason:'invalid_player'};
 if(!validActions(candidate.actions))return {accepted:false,reason:'invalid_actions'};
 const result=logic.verifyReplay(candidate.day,candidate.actions);
 if(!result.valid)return {accepted:false,reason:result.reason};
 if(candidate.score!==undefined&&candidate.score!==result.score)return {accepted:false,reason:'score_mismatch'};
 return {accepted:true,day:candidate.day,playerId:candidate.playerId,score:result.score,kills:result.kills,leaks:result.leaks,turns:result.turns};
}
function rank(rows,limit,day){
 const best=new Map(),max=Number.isInteger(limit)?Math.max(1,Math.min(100,limit)):25;
 for(const row of Array.isArray(rows)?rows:[]){
  if(day!==undefined&&(!validDay(day)||row?.day!==day))continue;
  if(!row||row.accepted!==true||typeof row.playerId!=='string'||!ID.test(row.playerId)||!Number.isSafeInteger(row.score)||row.score<0)continue;
  const prev=best.get(row.playerId);
  if(!prev||row.score>prev.score)best.set(row.playerId,{playerId:row.playerId,score:row.score});
 }
 return [...best.values()].sort((a,b)=>b.score-a.score||a.playerId.localeCompare(b.playerId)).slice(0,max).map((r,i)=>({...r,rank:i+1}));
}
root.TowerDailyRankingV15=Object.freeze({validate,rank,validDay,validActions});
})(window);
