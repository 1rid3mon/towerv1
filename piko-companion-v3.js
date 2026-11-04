/* Piko 3.0: deterministic, bounded companion memory. Separate from core saves. */
(function(w){
'use strict';
if(w.TowerPikoV3)return;
const KEY='towerV1PikoCompanionV3',ROOMS=['bridge','hangar','quarters','lab','archive','observatory'];
const defaults=()=>({version:3,visits:{},lastRoom:'bridge',talks:0,quiet:1,events:[]});
function normalize(value){
 const m=defaults();if(!value||typeof value!=='object')return m;
 for(const r of ROOMS)m.visits[r]=Math.min(9999,Math.max(0,Math.floor(Number(value.visits?.[r])||0)));
 m.lastRoom=ROOMS.includes(value.lastRoom)?value.lastRoom:'bridge';
 m.talks=Math.min(9999,Math.max(0,Math.floor(Number(value.talks)||0)));
 m.quiet=[0,1,2].includes(value.quiet)?value.quiet:1;
 m.events=Array.isArray(value.events)?value.events.filter(x=>typeof x==='string'&&/^(visit|talk|puzzle):[a-z0-9_-]{1,24}$/.test(x)).slice(-16):[];
 return m;
}
function read(){try{return normalize(JSON.parse(w.localStorage.getItem(KEY)));}catch(_){return defaults();}}
function save(m){const v=normalize(m);try{w.localStorage.setItem(KEY,JSON.stringify(v));}catch(_){}return v;}
function record(kind,id){
 if(!['visit','talk','puzzle'].includes(kind)||! /^[a-z0-9_-]{1,24}$/.test(String(id)))return read();
 const m=read(),event=kind+':'+id;
 if(kind==='visit'&&ROOMS.includes(id)){m.visits[id]=(m.visits[id]||0)+1;m.lastRoom=id;}
 if(kind==='talk')m.talks++;
 if(m.events[m.events.length-1]!==event)m.events=[...m.events,event].slice(-16);
 return save(m);
}
function setQuiet(n){const m=read();if([0,1,2].includes(n))m.quiet=n;return save(m);}
function shouldSpeak(kind,ordinal){const m=read();if(m.quiet===2)return false;if(kind==='critical')return true;if(m.quiet===1)return kind==='phase'&&ordinal===3;return kind==='phase'||kind==='boss';}
function battleCue(kind,phase,lang){if(!shouldSpeak(kind,phase))return null;const en=lang==='en';if(kind==='critical')return en?'Commander, our defenses are compromised!':'Komutan, savunma hattı tehlikede!';if(kind==='phase'&&phase===3)return en?'Final phase! Watch the boss pattern.':'Son evre! Bossun saldırı düzenine dikkat.';if(kind==='phase'&&phase===2)return en?'Second phase. Adapt your defenses.':'İkinci evre. Savunmanı yeniden düzenle.';if(kind==='boss')return en?'Boss detected. I am tracking its attacks.':'Boss tespit edildi. Saldırılarını izliyorum.';return null;}
function reply(room,progress,stats,lang){
 const m=read(),p=progress||{},s=stats||{},en=lang==='en';
 const tr=(a,b)=>en?b:a;
 if(p.callSignChoice==='echo'&&p.mission21Complete)return tr('Echo burada, Komutan. Adımı ve arşivde öğrendiklerimizi unutmadım.','Echo here, Commander. I remember my name and what we learned in the archive.');
 if(room==='archive'&&p.voiceChoice==='human')return tr('İnsan sesine güvenmiştin. O kararı arşiv kayıtlarında hâlâ görüyorum.','You trusted the human voice. That decision is still in the archive.');
 if(room==='lab'&&p.mission12Complete)return tr('On ikinci görevden beri bu sinyal bana tanıdık geliyor.','This signal has felt familiar since mission twelve.');
 if(room==='hangar'&&(Number(s.bossKills)||0)>=10)return tr('On bossu geride bıraktık. Hangar savunmalarını yine de kontrol edelim.','We survived ten bosses. Still, let us inspect the hangar defenses.');
 if(room==='observatory')return tr('Gözlemevindeki sinyal hâlâ çözülmedi. Kaynağı bulana kadar burada kalacağım.','The observatory signal remains unresolved. I will stay until we find its source.');
 if(room==='quarters')return tr('Burası senin odan. Ben de bir süre sessizce nöbet tutarım.','These are your quarters. I will keep a quiet watch.');
 if(room==='lab')return tr('Sinyal dizilerini birlikte inceleyelim. Yanlış cevap vermek sistemleri bozmaz.','Let us inspect the signal patterns. Wrong answers will not damage anything.');
 if(room==='archive')return tr('Burada yalnızca gerçekten verdiğin kararlar kayıtlı.','Only decisions you actually made are recorded here.');
 if(room==='hangar')return tr('Kule kombinasyonlarını gözden geçirmek için iyi bir zaman.','Good time to review tower combinations.');
 if(m.visits.bridge>3)return tr('Köprüye yine döndün. Ben buradayım, Komutan.','Back on the bridge again. I am here, Commander.');
 return tr('Komuta köprüsü hazır. İstersen konuşuruz, istemezsen sessiz kalırım.','Command bridge ready. We can talk, or I can stay quiet.');
}
w.TowerPikoV3=Object.freeze({read,record,setQuiet,shouldSpeak,battleCue,KEY,reply});
})(window);
