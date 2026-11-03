/* V12 Four Systems: read-only commander console + Piko tactical reactions.
   Does not write localStorage, alter saves, rewards, enemy HP or story progression. */
(function(w){
'use strict';
const tr=(a,b)=>{try{return typeof getGameLanguage==='function'&&getGameLanguage()==='en'?b:a;}catch(_){return a;}};
const safe=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={open:false,tab:'combat',lastPiko:0};
const missionKeys=Array.from({length:27},(_,i)=>'mission'+(i+1)+'Complete');
function stats(){try{return typeof game==='object'&&game?game.stats||{}:{};}catch(_){return {};}}
function progress(){try{return typeof getStoryProgress==='function'?getStoryProgress():{};}catch(_){return {};}}
function isStory(){try{return typeof GameModeRuntime!=='undefined'&&(GameModeRuntime.isIsolatedStoryRuntime()||GameModeRuntime.isStoryActive());}catch(_){return false;}}
function piko(line){
 const now=Date.now();if(now-state.lastPiko<8500)return false;state.lastPiko=now;
 const bubble=document.getElementById('game-mascot-bubble');if(!bubble)return false;
 bubble.textContent=line;bubble.classList.add('is-visible');
 if(typeof w.positionPikoBubble==='function')w.positionPikoBubble();
 clearTimeout(piko.timer);piko.timer=setTimeout(()=>bubble.classList.remove('is-visible'),4000);
 return true;
}
function bossCue(e){
 if(!e||e.type!=='boss'||isStory())return;
 const id=e.subType||'boss';

 const advice={
 tank_boss:tr('Piko: Titan yaklaşıyor. Savunmayı güçlendir!','Piko: Titan approaching. Reinforce defenses!'),
 ranged_boss:tr('Piko: Topçu menziline dikkat!','Piko: Watch the artillery range!'),
 speed_boss:tr('Piko: Hızlı hedef! Yakın savunmayı hazırla.','Piko: Fast target! Prepare close defense.'),
 frost_boss:tr('Piko: Kriyo tehdidi! Donmaya hazırlan.','Piko: Cryo threat! Prepare for freezing.'),
 leviathan:tr('Piko: Leviathan çok yönlü saldırıyor.','Piko: Leviathan has a multi-angle attack.')
 };
 piko(advice[id]||tr('Piko: Boss tespit edildi.','Piko: Boss detected.'));
}
function numbers(){
 const s=stats(),p=progress();
 return {kills:Math.max(0,Number(s.totalKills)||0),bosses:Math.max(0,Number(s.bossKills)||0),
  play:Math.max(0,Number(s.playTimeSeconds)||0),missions:missionKeys.filter(k=>p[k]===true).length,
  route:p.routeChoice||null,power:p.powerChoice||null,voice:p.voiceChoice||null};
}
const rows={
 combat:()=>'<h3>'+tr('Savaş 2.0 · Canlı mekanikler','Combat 2.0 · Live mechanics')+'</h3><p>'+tr('Bosslar %65 ve %28 can eşiğinde yeni faza geçer. Titan zırhlanır, hızlı boss daha sık atılır; menzilli boss ve Kryos çoklu saldırı yapar.','Bosses enter new phases at 65% and 28% HP. Titan gains armor, the speed boss dashes more often, and ranged bosses plus Kryos fire multi-shot patterns.')+'</p><p>'+tr('Kombo 1: Buz + Lazer / Plazma → kırılma bonusu. Kombo 2: Plazma işareti + Füze → %10 ilave hasar. Etki, gerçek yoldaşların kilitli/açık durumuna bağlıdır.','Combo 1: Frost + Laser/Plasma triggers shatter damage. Combo 2: Plasma mark + Missile grants 10% bonus damage. Combos require the actual companions unlocked.')+'</p>',
 story:()=>{const n=numbers();return '<h3>'+tr('Echo arşivi','Echo archive')+'</h3><p>'+tr('Tamamlanan görev: ','Completed missions: ')+n.missions+' / 27</p><p>'+tr('Sinyal kaynağı: ','Signal source: ')+safe(n.route||'—')+'</p><p>'+tr('Enerji tercihi: ','Power priority: ')+safe(n.power||'—')+'</p><p>'+tr('Ses kararı: ','Voice choice: ')+safe(n.voice||'—')+'</p><p>'+tr('19. görevde anten veya karakutu rotası; 20. görevde kalkan/silah seçimi; 21. görevde ses güveni farklı düşman sayısı ve savunma kuralları üretir.','Mission 19 changes with antenna/black-box routes; Mission 20 with shield/weapon choices; Mission 21 with voice trust. These alter encounter difficulty and loadout.')+'</p><p>'+tr('Mevcut hikâye kararları kullanılır; yeni kayıt anahtarı yok.','Existing story choices are reused; no new save key.')+'</p>';},
 piko:()=>'<h3>'+tr('Piko · Gelişen Hafıza','Piko · Evolving Memory')+'</h3><p>'+tr('Hikâyenin ilerleyişi, güvenilen ses ve seçilen çağrı adı Piko’nun diyaloglarını değiştirir. Eski hikâye kaydı kullanılır.','Story milestones, trusted voice and chosen call sign evolve Piko dialogue using the existing save.')+'</p><p>'+tr('Kişilik aşaması: ','Personality tier: ')+(w.TowerNarrativeV12?w.TowerNarrativeV12.pikoTier(progress()):0)+' / 3</p><button type="button" data-v12-piko>'+tr('Piko ile konuş','Talk to Piko')+'</button>',
 commander:()=>{const n=numbers();return '<h3>'+tr('Komutan dosyası','Commander file')+'</h3><div class="v12-metrics"><div>'+tr('İmha','Kills')+'<strong>'+n.kills.toLocaleString()+'</strong></div><div>Boss<strong>'+n.bosses.toLocaleString()+'</strong></div><div>'+tr('Görev','Missions')+'<strong>'+n.missions+'/27</strong></div><div>'+tr('Süre (dk)','Minutes')+'<strong>'+Math.floor(n.play/60)+'</strong></div></div><p>'+tr('Yeni 5 başarı ve 3 kuşanılabilir komutan unvanı eklendi. Mevcut başarımlar/günlük ödüller korunuyor; yeni ödüller sadece kozmetiktir.','Five new achievements and three equipable titles are available. Existing achievements and daily rewards remain; new unlocks are cosmetic only.')+'</p>';}
};
function paint(){
 const root=document.getElementById('v12-console');if(!root)return;
 root.hidden=!state.open;if(!state.open)return;
 root.querySelector('[data-v12-body]').innerHTML=rows[state.tab]();
 root.querySelectorAll('[data-v12-tab]').forEach(b=>{const selected=b.dataset.v12Tab===state.tab;b.setAttribute('aria-selected',String(selected));});
 const speak=root.querySelector('[data-v12-piko]');if(speak)speak.addEventListener('click',()=>piko(tr('Komutan, sinyal temiz. Yanındayım.','Commander, signal clear. I am here.')));
}
function open(tab){state.tab=rows[tab]?tab:'combat';state.open=true;paint();}
function close(){state.open=false;paint();}
function init(){
 if(document.getElementById('v12-console'))return;
 const root=document.createElement('section');root.id='v12-console';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','V12 Command Console');root.innerHTML='<div class="v12-panel"><header><strong>V12 / COMMAND CONSOLE</strong><button type="button" data-v12-close aria-label="Close">✕</button></header><nav aria-label="V12 systems">'+[['combat','Savaş','Combat'],['story','Hikâye','Story'],['piko','Piko','Piko'],['commander','Komutan','Commander']].map(([id,a,b])=>'<button type="button" role="tab" data-v12-tab="'+id+'">'+tr(a,b)+'</button>').join('')+'</nav><div data-v12-body></div></div>';
 document.body.appendChild(root);
 root.querySelector('[data-v12-close]').addEventListener('click',close);
 root.addEventListener('click',e=>{if(e.target===root)close();const b=e.target.closest('[data-v12-tab]');if(b)open(b.dataset.v12Tab);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)close();});
 const launch=document.createElement('button');launch.type='button';launch.id='v12-console-launch';launch.textContent=tr('◈ KOMUTA','◈ COMMAND');launch.setAttribute('aria-label',tr('V12 komuta panelini aç','Open V12 command console'));launch.addEventListener('click',()=>open('combat'));
 const menu=document.querySelector('.mode-menu-tools');if(menu){launch.className='mode-menu-tool';menu.appendChild(launch);}else{launch.className='v12-floating-launch';document.body.appendChild(launch);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

/* V12.1: keep Piko's speech attached to its draggable character. */
function positionCompanionSpeech(){
 const mascot=document.getElementById('game-mascot'),bubble=document.getElementById('game-mascot-bubble');
 if(!mascot||!bubble||!bubble.classList.contains('is-visible'))return;
 const rect=mascot.getBoundingClientRect(),width=Math.min(270,innerWidth-24);
 bubble.style.width=width+'px';
 bubble.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.left+rect.width/2-width/2))+'px';
 const height=bubble.offsetHeight||58,above=rect.top-height-14;
 bubble.style.top=Math.max(8,Math.min(innerHeight-height-8,above>=8?above:rect.bottom+12))+'px';
 bubble.style.right='auto';bubble.style.bottom='auto';
}
w.positionPikoBubble=positionCompanionSpeech;
let speechFrame=0;
function queueSpeechPosition(){
 if(speechFrame)return;
 speechFrame=requestAnimationFrame(()=>{speechFrame=0;positionCompanionSpeech();});
}
if(typeof document.addEventListener==='function')document.addEventListener('pointermove',queueSpeechPosition);
if(typeof document.addEventListener==='function')document.addEventListener('pointerup',queueSpeechPosition);
if(typeof w.addEventListener==='function')w.addEventListener('resize',queueSpeechPosition);
/* Reuse introSeen from the existing story save, with an explicit replay action. */
function installIntroReplay(){
 const mission=document.getElementById('story-mission-view');
 if(!mission||document.getElementById('story-replay-intro'))return;
 const replay=document.createElement('button');
 replay.id='story-replay-intro';replay.type='button';
 replay.textContent=(typeof storyLanguage==='function'&&storyLanguage()==='en')?'↺ Replay introduction':'↺ Girişi tekrar izle';
 replay.addEventListener('click',()=>{
   if(typeof finishStoryTyping==='function')finishStoryTyping();
   if(typeof storyMissionViewOpen!=='undefined')storyMissionViewOpen=false;
   if(typeof storyDialogueIndex!=='undefined')storyDialogueIndex=0;
   const intro=document.getElementById('story-dialogue-view');
   if(intro)intro.hidden=false;
   mission.hidden=true;
   if(typeof showStoryDialogue==='function')showStoryDialogue();
 });
 mission.prepend(replay);
}
if(typeof w.openStoryMode==='function'&&!w.openStoryMode.v12IntroFixed){
 const originalOpenStory=w.openStoryMode;
 w.openStoryMode=function(...args){
   const seen=typeof getStoryProgress==='function'&&getStoryProgress().introSeen===true;
   const result=originalOpenStory.apply(this,args);
   installIntroReplay();
   if(seen&&document.getElementById('story-mode-screen')?.classList.contains('is-open')){
     if(typeof finishStoryTyping==='function')finishStoryTyping();
     if(typeof storyMissionViewOpen!=='undefined')storyMissionViewOpen=true;
     const dialogue=document.getElementById('story-dialogue-view'),mission=document.getElementById('story-mission-view');
     if(dialogue)dialogue.hidden=true;
     if(mission)mission.hidden=false;
     if(typeof updateStoryMissionBoard==='function')updateStoryMissionBoard();
   }
   return result;
 };
 w.openStoryMode.v12IntroFixed=true;
}

w.TowerFourSystemsV12=Object.freeze({open,close,bossCue,numbers,diagnostics:()=>({open:state.open,tab:state.tab})});
})(window);
