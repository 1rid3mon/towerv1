/* V12 — story choice consequences and evolving Piko.
 * Uses existing validated story progress. Never writes a new save key.
 * Mission routes are chosen at launch; no original mission is skipped.
 */
(function(root){
 'use strict';
 if(root.TowerNarrativeV12)return;
 function lang(tr,en,isEn){return isEn?en:tr;}
 function branch(mission,p){
   if(!p||typeof p!=='object')return null;
   if(mission===19&&['array','blackbox'].includes(p.routeChoice))
     return {id:p.routeChoice,extraEnemies:p.routeChoice==='blackbox'?2:0,shield:0,damage:0};
   if(mission===20&&['shield','weapon'].includes(p.powerChoice))
     return {id:p.powerChoice,extraEnemies:p.powerChoice==='weapon'?2:0,shield:p.powerChoice==='shield'?22:0,damage:p.powerChoice==='weapon'?2:0};
   if(mission===21&&['human','station'].includes(p.voiceChoice))
     return {id:p.voiceChoice,extraEnemies:p.voiceChoice==='station'?1:0,shield:0,damage:0};
   return null;
 }
 function apply(session,p,game,tower){
   if(!session||!session.active||!game||!tower)return null;
   const b=branch(session.mission,p);
   if(!b)return null;
   session.v12Branch=b.id;
   game.waveTargetKills=Math.max(1,(Number(game.waveTargetKills)||1)+b.extraEnemies);
   if(b.shield){tower.maxShield=Math.max(0,tower.maxShield||0)+b.shield;tower.shield=Math.max(0,tower.shield||0)+b.shield;}
   if(b.damage)game.upgrades.damage=Math.max(0,Number(game.upgrades.damage)||0)+b.damage;
   return b;
 }
 function missionLine(mission,p,isEn){
   const b=branch(mission,p);
   if(!b)return '';
   const msg={
    array:['ANTEN ROTASI: Sinyalın fiziksel izini takip ediyorsun; savunma teması kısa.','ARRAY ROUTE: You are following physical signal traces; the defense contact is shorter.'],
    blackbox:['KARAKUTU ROTASI: Echo kaydı iki ek tehdit uyandırdı; sesi izleyerek ilerle.','BLACK-BOX ROUTE: The Echo recording awoke two additional threats. Follow the voice.'],
    shield:['KALKAN PROTOKOLÜ: Eski seçimin bu görevde +22 geçici kalkan sağladı.','SHIELD PROTOCOL: Your past choice granted 22 temporary shield in this mission.'],
    weapon:['SİLAH PROTOKOLÜ: Kalibrasyon +2 hasar seviyesi sağladı; karşılığında iki ek düşman var.','WEAPON PROTOCOL: Calibration grants +2 damage levels, but two extra enemies appear.'],
    human:['İNSAN SESİ: Piko güven kaydını takip ediyor, savunma planı sade kaldı.','HUMAN VOICE: Piko follows the trust record; defenses remain straightforward.'],
    station:['İSTASYON SESİ: Sistem kaydı bir ek güvenlik birimini uyandırdı.','STATION VOICE: The station record activated one additional security unit.']
   }[b.id];
   return msg?msg[isEn?1:0]:'';
 }
 function milestone(session,p,isEn){
   if(!session||![19,20,21].includes(session.mission))return '';
   const b=branch(session.mission,p);
   if(!b)return '';
   return lang(
     'DAL SEÇİMİ · '+missionLine(session.mission,p,false),
     'BRANCH CONSEQUENCE · '+missionLine(session.mission,p,true),isEn);
 }
 function pikoTier(p){
   if(!p||typeof p!=='object')return 0;
   return p.mission21Complete||p.mission27Complete?3:p.mission12Complete?2:p.mission4Complete?1:0;
 }
 function pikoLine(p,isEn,context){
   const tier=pikoTier(p);
   if(tier===0)return '';
   if(tier===1)return lang('Seçimlerini izliyorum komutan. Kalkan mı silah mı, ikisi farklı kapılar açar.',
       'I am tracking your choices, Commander. Shield or weapon—each opens different doors.',isEn);
   if(tier===2)return p.voiceChoice==='human'
       ?lang('İnsan kaydını dinledim. Belki de kim olduğum, bana kim olduğunu söyleyenlerden bağımsızdır.',
              'I listened to the human record. Maybe who I am is not decided by others.',isEn)
       :lang('Arşiv geçmişimi biliyor ama bütün cevaplarını kabul etmek zorunda değilim.',
              'The archive knows my past, but I do not have to accept all its answers.',isEn);
   const name=p.callSignChoice==='echo'?'Echo':'Piko';
   if(context==='boss')return lang(name+': Daha önce korkardım. Şimdi riski birlikte hesaplıyoruz.',
      name+': I used to be afraid. Now we calculate the risk together.',isEn);
   return lang(name+': Hafızam tamamlanmadı; ama kendi adımı ve bu ekibi seçtim.',
      name+': My memory is incomplete, but I chose my name and this crew.',isEn);
 }
 root.TowerNarrativeV12=Object.freeze({branch,apply,missionLine,milestone,pikoTier,pikoLine});
})(window);
