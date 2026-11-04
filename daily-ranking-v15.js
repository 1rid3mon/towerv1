/* V15 leaderboard contract: deterministic candidate validation only.
   Not an authenticated endpoint or permission to write public scores. */
(function(root){
'use strict';
if(root.TowerDailyRankingV15)return;
const logic=root.TowerStationSystemsV14;
const ID=/^[A-Za-z0-9_-]{8,64}$/;
function validate(candidate,serverDay){
 if(!logic||!candidate||typeof candidate!=='object'||Array.isArray(candidate))return {accepted:false,reason:'invalid_submission'};
 if(typeof serverDay!=='string'||candidate.day!==serverDay)return {accepted:false,reason:'day_mismatch'};
 if(typeof candidate.playerId!=='string'||!ID.test(candidate.playerId))return {accepted:false,reason:'invalid_player'};
 if(!Array.isArray(candidate.actions))return {accepted:false,reason:'invalid_actions'};
 const result=logic.verifyReplay(candidate.day,candidate.actions);
 if(!result.valid)return {accepted:false,reason:result.reason};
 if(candidate.score!==undefined&&candidate.score!==result.score)return {accepted:false,reason:'score_mismatch'};
 return {accepted:true,day:candidate.day,playerId:candidate.playerId,score:result.score,kills:result.kills,leaks:result.leaks,turns:result.turns};
}
function rank(rows,limit){
 const best=new Map(),max=Number.isInteger(limit)?Math.max(1,Math.min(100,limit)):25;
 for(const row of Array.isArray(rows)?rows:[]){
  if(!row||row.accepted!==true||typeof row.playerId!=='string'||!ID.test(row.playerId)||!Number.isSafeInteger(row.score)||row.score<0)continue;
  const prev=best.get(row.playerId);
  if(!prev||row.score>prev.score)best.set(row.playerId,{playerId:row.playerId,score:row.score});
 }
 return [...best.values()].sort((a,b)=>b.score-a.score||a.playerId.localeCompare(b.playerId)).slice(0,max).map((r,i)=>({...r,rank:i+1}));
}
root.TowerDailyRankingV15=Object.freeze({validate,rank});
})(window);
