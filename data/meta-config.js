/* Shared station balance. Battle gold and station credits remain separate. */
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;if(root)root.MetaConfig=value;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const names=['Statik','Taşıyıcı','Kararlı','Rezonans','Çekirdek','Nova','Anomali','Kayıp Sinyal'];
const probabilities=[40,25,15,10,5,3,1.5,.5], thresholds=[15,15,13,6,6,2,2,1];
const weapons=['Bakır Yankı','Toz Atıcı','Akım Çatalı','Röle İğnesi','Denge Namlusu','Sessiz Darbe','Rezonans Yayı','Frekans Dişi','Çekirdek Oyuğu','Kızıl Bobin','Nova Çiçeği','Yıldız Kırığı','Anomali Çengeli','Zaman Çentiği','Kayıp İşaret','Son Frekans'];
const c={version:1,dayMs:86400000,
rarities:names.map((name,id)=>({id,name,probability:probabilities[id],color:['#9aa7ad','#4fbf8a','#4a9be8','#a66bf0','#f0a23a','#5fe6d4','#e5544d','#f5d36b'][id]})),
equipment:weapons.map((name,i)=>({id:'weapon_'+i,name,rarity:Math.floor(i/2),stat:'damage',bonus:.015*(Math.floor(i/2)+1),equippedMultiplier:3,fuseCopies:thresholds[Math.floor(i/2)]})),
skills:[
{id:'ark',name:'Ark Darbesi',rarity:0,cooldown:16,power:1.3,duration:0},
{id:'slow',name:'Yavaşlatma Alanı',rarity:1,cooldown:22,power:.35,duration:5},
{id:'shield',name:'Kalkan Pulsu',rarity:2,cooldown:28,power:.15,duration:6},
{id:'emp',name:'EMP Halkası',rarity:3,cooldown:30,power:1,duration:2},
{id:'overload',name:'Aşırı Yük',rarity:4,cooldown:32,power:.3,duration:5},
{id:'signal',name:'Sinyal Çağrısı',rarity:7,cooldown:40,power:2.2,duration:0}
].map(x=>({...x,fuseCopies:thresholds[x.rarity]})),
summon:{equipment:{one:100,ten:900},skill:{one:120,ten:1080},pityEnabled:false,pityAfter:50,pityTier:3},
fusion:{copiesPerLevel:15,maxLevel:20,partsPerLevel:0},skillUnlockSectors:[0,0,5,10,15,20],
daily:{resetHour:4,resetGapDays:7,rewards:[6,8,10,12,14,16,24],kristal:150,kredi:100},
waveRewards:{kristal:3,kredi:20,xp:10},
offline:{maxHours:12,maxCleared:30,maxPending:360,hourMs:3600000,popupMinutes:5},
returnEvent:{absenceDays:7,durationDays:20,retriggerDays:30,warningHours:48,taskDays:7,tasks:[{id:'login',target:1,reward:10},{id:'waves',target:3,reward:10},{id:'bosses',target:1,reward:15},{id:'summons',target:1,reward:15},{id:'fusions',target:1,reward:20}]},
season:{days:30,tiers:30,xpPerTier:60,partsPerTier:6,premiumCost:5000,premiumPartsPerTier:6,elitePartsPerTier:6},
limits:{maxCounter:1000000000,maxCurrency:Number.MAX_SAFE_INTEGER,maxKrediDigits:120,ledger:200,receipts:20000,maxIdLength:160}
};
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}return freeze(c);
});
