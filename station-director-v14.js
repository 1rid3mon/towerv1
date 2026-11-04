/* V14 Station Director — explorable station rooms, signal puzzles, daily practice,
   choice memory, optional cinematic and anomaly status. No Firebase/Endless save writes. */
(function(w){
'use strict';
if(w.TowerStationDirectorV14)return;
const logic=w.TowerStationSystemsV14;if(!logic)return;
const PUZZLE_KEY='towerV1StationPuzzleV14',BEST_KEY='towerV1DailyPracticeV14';
const t=(tr,en)=>{try{return typeof getGameLanguage==='function'&&getGameLanguage()==='en'?en:tr;}catch(_){return tr;}};
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROOMS=[
 {id:'bridge',at:0,icon:'⌘',name:['Komuta Köprüsü','Command Bridge']},
 {id:'hangar',at:0,icon:'⬡',name:['Savunma Hangarı','Defense Hangar']},
 {id:'quarters',at:0,icon:'◈',name:['Komutanın Odası',"Commander's Quarters"]},
 {id:'lab',at:9,icon:'◇',name:['Sinyal Laboratuvarı','Signal Lab']},
 {id:'archive',at:18,icon:'▣',name:['Kayıp Arşiv','Lost Archive']},
 {id:'observatory',at:27,icon:'✧',name:['Gözlemevi','Observatory']}
];
const PUZZLES=[
 {id:'pulse',at:9,clue:['Sinyal: 2 · 4 · 8 · ?','Signal: 2 · 4 · 8 · ?'],options:['12','16','24'],answer:1,log:['Frekans her döngüde ikiye katlanıyor.','Frequency doubles each cycle.']},
 {id:'orbit',at:18,clue:['Koordinat: A1 · C3 · E5 · ?','Coordinate: A1 · C3 · E5 · ?'],options:['G7','F6','H8'],answer:0,log:['Sinyal arşivin derin katlarına yöneldi.','The signal points to the archive depths.']},
 {id:'echo',at:27,clue:['Piko: Önce yankı, sonra kaynak. Kod: 3 · 6 · 12 · ?','Piko: Echo before origin. Code: 3 · 6 · 12 · ?'],options:['18','21','24'],answer:2,log:['Kayıt çözüldü: Kaynak istasyonun içinde.','Record decoded: The origin is inside the station.']}
];
let isOpen=false,room='bridge',avatar={x:1,y:1},run=null,notice='',cineTimer=null,lastAnomaly='';
const GRID=['##########','#B...H...#','#..##....#','#Q......L#','#....##..#','#A....O..#','##########'];
const DOOR_CODES={B:'bridge',H:'hangar',Q:'quarters',L:'lab',A:'archive',O:'observatory'};
function progress(){try{return typeof getStoryProgress==='function'?getStoryProgress():{};}catch(_){return {};}}
function completed(){const p=progress();return Array.from({length:27},(_,i)=>p['mission'+(i+1)+'Complete']===true).filter(Boolean).length;}
function stats(){try{return typeof game!=='undefined'&&game?game.stats||{}:{};}catch(_){return {};}}
function modeStory(){try{return document.body?.dataset?.gameMode==='story'||(typeof GameModeRuntime!=='undefined'&&GameModeRuntime.isStoryActive());}catch(_){return true;}}
function readSolved(){try{const a=JSON.parse(localStorage.getItem(PUZZLE_KEY)||'[]');return Array.isArray(a)?a.filter(id=>PUZZLES.some(p=>p.id===id)).slice(0,3):[];}catch(_){return [];}}
function solve(id){const list=readSolved();if(list.includes(id))return;try{localStorage.setItem(PUZZLE_KEY,JSON.stringify([...list,id]));}catch(_){}}
function readBest(day){try{const x=JSON.parse(localStorage.getItem(BEST_KEY)||'{}');return x&&x.day===day?Math.max(0,Math.min(99999,Math.floor(Number(x.score)||0))):0;}catch(_){return 0;}}
function saveBest(r){
 const value=logic.score(r),current=readBest(r.date);
 if(value>current)try{localStorage.setItem(BEST_KEY,JSON.stringify({day:r.date,score:value}));}catch(_){}
}
function pikoLine(){
 const companion=w.TowerPikoV3;
 if(companion)return companion.reply(room,progress(),stats(),typeof getGameLanguage==='function'?getGameLanguage():'tr');
 const p=progress(),profile=logic.pikoProfile(p,stats());
 const lines={
 echo:['Echo: Komutan, beni seçtiğin adı unutmadım.','Echo: Commander, I remember the name you chose.'],
 human:['Piko: İnsan sesine güvendiğini hatırlıyorum.','Piko: I remember you trusted the human voice.'],
 veteran:['Piko: Boss savaşlarını epey gördük. Bu istasyon da hayatta kaldı.','Piko: We have survived our share of boss battles.'],
 curious:['Piko: Arşivin ardında hâlâ çözülecek şeyler var.','Piko: There is still more to decode beyond the archive.'],
 rookie:['Piko: İstasyon sessiz. Önce savunmaları inceleyelim.','Piko: The station is quiet. Let us inspect the defenses first.']
 };
 return t(...lines[profile]);
}
function itemMarkup(r,n){const locked=n<r.at;return '<button class="v14-door" type="button" data-v14-room="'+r.id+'" '+(locked?'disabled':'')+'><span aria-hidden="true">'+r.icon+'</span><strong>'+escapeHtml(t(...r.name))+'</strong><small>'+escapeHtml(locked?t('Görev '+r.at+' ile açılır','Unlocks at mission '+r.at):t('İçeri gir','Enter room'))+'</small></button>';}
function walk(dx,dy){
 const x=avatar.x+dx,y=avatar.y+dy;
 if(!GRID[y]||!GRID[y][x]||GRID[y][x]==='#')return false;
 const id=DOOR_CODES[GRID[y][x]],def=ROOMS.find(r=>r.id===id);
 if(def&&completed()<def.at){notice=t('Kapı kilitli. Önce hikâyede ilerle.','Door locked. Continue the story first.');paint();return false;}
 avatar={x,y};notice='';
 if(id){enter(id);return true;}
 paint();return true;
}
function walkMap(){
 const n=completed();
 const pikoPos=w.TowerPikoV3?.companionPosition?.(GRID,avatar);
 const cells=GRID.map((row,y)=>Array.from(row,(ch,x)=>{
  const id=DOOR_CODES[ch],def=ROOMS.find(r=>r.id===id),here=avatar.x===x&&avatar.y===y;
  const pikoHere=!!pikoPos&&pikoPos.x===x&&pikoPos.y===y&&!here;
  const label=here?'●':pikoHere?'✦':ch==='#'?'':id?ch:'·';
  const clazz='v14-cell'+(ch==='#'?' v14-wall':'')+(id?' v14-cell-door':'')+(here?' v14-player':'')+(pikoHere?' v15-piko-marker':'')+(def&&n<def.at?' v14-cell-locked':'');
  return id?'<button type="button" class="'+clazz+'" data-v14-tile="'+x+','+y+'" aria-label="'+escapeHtml(t(...def.name))+'">'+label+'</button>':'<span class="'+clazz+'" aria-hidden="true">'+label+'</span>';
 })).flat().join('');
 return '<div class="v14-walkmap" aria-label="'+t('Yürünebilir istasyon koridorları','Walkable station corridors')+'">'+cells+'</div><p class="v14-note">● '+t('Komutan','Commander')+' · ✦ Piko</p><div class="v14-dpad"><button type="button" data-v14-move="0,-1" aria-label="Up">↑</button><button type="button" data-v14-move="-1,0" aria-label="Left">←</button><button type="button" data-v14-move="0,1" aria-label="Down">↓</button><button type="button" data-v14-move="1,0" aria-label="Right">→</button></div>';
}
function enter(id){
 if(id==='quarters'){close();w.TowerCommandersQuartersV13?.open();return;}
 room=id;w.TowerPikoV3?.record('visit',id);notice='';paint();
}
function hub(){const n=completed(),stage=logic.stationStage(n);
 const stageNames=[['SESSİZ İSTASYON','SILENT STATION'],['İLK IŞIKLAR','FIRST LIGHTS'],['CANLANAN İSTASYON','REVIVING STATION'],['YENİ KOMUTA ÜSSÜ','NEW COMMAND BASE']];
 return '<div class="v14-status"><strong>'+escapeHtml(t(...stageNames[stage]))+'</strong><span>'+n+'/27 '+escapeHtml(t('görev tamamlandı','missions completed'))+'</span></div>'+ (room==='map'?walkMap():'')+'<div class="v14-map v14-stage-'+stage+'">'+ROOMS.map(r=>itemMarkup(r,n)).join('')+'</div><p class="v14-note">'+escapeHtml(t('Koridorlarda yön tuşları / WASD ile yürü, kapılara ulaş veya doğrudan kapıya dokun.','Walk using arrow keys / WASD, approach a door or tap it directly.'))+'</p>';
}
function pikoControls(){const m=w.TowerPikoV3?.read();if(!m)return '';return '<div class="v14-actions"><button type="button" data-v14-quiet="0">'+t('Konuşkan','Chatty')+(m.quiet===0?' ✓':'')+'</button><button type="button" data-v14-quiet="1">'+t('Dengeli','Balanced')+(m.quiet===1?' ✓':'')+'</button><button type="button" data-v14-quiet="2">'+t('Sessiz','Quiet')+(m.quiet===2?' ✓':'')+'</button></div><p class="v14-note">'+t('Piko hafızası bu cihazda tutulur; hikâye kayıtlarını değiştirmez.','Piko memory stays on this device and never changes story saves.')+'</p>';}
function bridge(){return '<h3>'+t('Komuta Köprüsü','Command Bridge')+'</h3>'+(w.TowerPikoV3?.read().quiet===2?'':'<p>'+escapeHtml(pikoLine())+'</p>')+'<div class="v14-actions"><button data-v14-piko="1">'+t('Piko ile konuş','Talk to Piko')+'</button><button data-v14-daily="1">'+t('Günlük savunma tatbikatı','Daily defense drill')+'</button><button data-v14-sector="1">'+t('Keşif sektörleri','Exploration sectors')+'</button></div>'+pikoControls();}
function hangar(){return '<h3>'+t('Savunma Hangarı','Defense Hangar')+'</h3><p>'+t('Gerçek savaşta etkin V12 kombinasyonları:','V12 combinations active in real combat:')+'</p><div class="v14-logs"><p>❄ '+t('Buz + Lazer/Plazma: kırılma hasarı','Frost + Laser/Plasma: shatter damage')+'</p><p>⚡ '+t('Plazma işareti + Füze: ek hasar','Plasma mark + Missile: bonus damage')+'</p><p>⬡ '+t('Bosslar %65 ve %28 can eşiklerinde faz değiştirir','Bosses change phase at 65% and 28% health')+'</p></div><p class="v14-note">'+t('Kombolar gerçek yoldaşların açılmış olmasını gerektirir. Bu ekran savaş gücü veya kaynak eklemez.','Combos require unlocked companions. This room grants no power or resources.')+'</p>';}
function archive(){
 const p=progress();
 const lines=[['routeChoice',t('Rota','Route')],['powerChoice',t('Enerji kararı','Power choice')],['voiceChoice',t('Ses tercihi','Voice choice')],['callSignChoice',t('Piko adı','Piko name')]];
 return '<h3>'+t('Kayıp Arşiv · Karar Hafızası','Lost Archive · Choice Memory')+'</h3><div class="v14-logs">'+lines.map(([key,name])=>'<p><b>'+escapeHtml(name)+'</b>: '+escapeHtml(p[key]||t('Henüz seçilmedi','Not chosen yet'))+'</p>').join('')+'</div><p>'+t('V12 bu seçimlerden bazılarını sonraki savaşlara ve Piko diyaloglarına uygular. Burada seçimler değiştirilemez.','V12 uses some choices in later battles and Piko dialogue. This archive does not alter choices.')+'</p>';}
function lab(){const n=completed(),solved=readSolved();return '<h3>'+t('Sinyal Laboratuvarı','Signal Laboratory')+'</h3><p>'+t('Sinyal dizilerini çözerek yeni kayıtları aç. Yalnızca kozmetik keşif.','Decode signal sequences to reveal records. Cosmetic discovery only.')+'</p>'+PUZZLES.map(p=>'<div class="v14-puzzle"><strong>'+escapeHtml(t(...p.clue))+'</strong><small>'+escapeHtml(solved.includes(p.id)?t('ÇÖZÜLDÜ · ','SOLVED · ')+t(...p.log):n<p.at?t('Görev '+p.at+' gerekli','Requires mission '+p.at):t('Doğru diziyi seç','Choose the correct sequence'))+'</small><div class="v14-actions">'+p.options.map((op,i)=>'<button type="button" data-v14-puzzle="'+p.id+'" data-v14-answer="'+i+'" '+(solved.includes(p.id)||n<p.at?'disabled':'')+'>'+escapeHtml(op)+'</button>').join('')+'</div></div>').join('');}
function observatory(){return '<h3>'+t('Gözlemevi','Observatory')+'</h3><p>'+t('İstasyonun sessiz dış kabuğunda kayıp sinyalin son yankısı izlenebilir.','Watch the final trace of the lost signal from the observation deck.')+'</p><button data-v14-cinema="1">'+t('Sinematik kaydı oynat','Play cinematic record')+'</button>';}
function challenge(){
 if(!run||run.date!==logic.dailyDate())run=logic.newRun(logic.dailyDate());
 const best=readBest(run.date),lanes=[t('Sol','Left'),t('Orta','Middle'),t('Sağ','Right')];
 return '<h3>'+t('Günlük Savunma Tatbikatı','Daily Defense Drill')+'</h3><p>'+escapeHtml(run.date)+' (UTC) · '+t('Herkes için aynı düşman düzeni ve 4 başlangıç enerjisi.','Same enemy pattern and 4 starting energy for everyone.')+'</p><div class="v14-metrics"><span>'+t('Tur','Turn')+': '+run.turn+'/15</span><span>'+t('Enerji','Energy')+': '+run.energy+'</span><span>'+t('İmha','Kills')+': '+run.kills+'</span><span>'+t('Sızıntı','Leaks')+': '+run.leaks+'/6</span></div><div class="v14-lanes">'+lanes.map((name,i)=>'<div><strong>'+escapeHtml(name)+'</strong><span>'+t('Kule','Tower')+': '+run.towers[i]+'/3</span><span>'+run.enemies.filter(e=>e.lane===i).map(e=>'◆'+e.hp+'('+e.dist+')').join(' ')+'</span><button type="button" data-v14-buy="'+i+'" '+(run.finished||run.towers[i]>=3||run.energy<run.towers[i]+1?'disabled':'')+'>'+t('Kur / Geliştir','Build / Upgrade')+' · '+(run.towers[i]+1)+' ⚡</button></div>').join('')+'</div><div class="v14-actions"><button data-v14-next="1" '+(run.finished?'disabled':'')+'>'+t('Sonraki tur','Next turn')+'</button><button data-v14-restart="1">'+t('Yeniden dene','Retry')+'</button></div><p class="v14-note">'+t('Skor','Score')+': '+logic.score(run)+' · '+t('Kişisel gün rekoru','Personal daily best')+': '+best+'</p>'+(run.finished?'<p><strong>'+t('Tatbikat bitti.','Drill complete.')+'</strong></p>':'')+'<p class="v14-note">'+t('Bu tatbikatın skoru yalnızca cihazında tutulur. Küresel sıralama ve ödül yoktur.','Scores are local only. No global leaderboard or rewards.')+'</p>';
}
function content(){
 if(room==='bridge')return bridge();
 if(room==='hangar')return hangar();
 if(room==='lab')return lab();
 if(room==='archive')return archive();
 if(room==='observatory')return observatory();
 if(room==='daily')return challenge();
 return bridge();
}
function paint(){
 const root=document.getElementById('v14-station');if(!root)return;
 root.hidden=!isOpen;if(!isOpen)return;
 const n=completed();
 if(ROOMS.some(x=>x.id===room&&n<x.at))room='bridge';
 root.innerHTML='<div class="v14-backdrop" data-v14-close="1"></div><section class="v14-panel" role="dialog" aria-modal="true" aria-label="'+t('Yaşayan Uzay İstasyonu','Living Space Station')+'"><header><span>ARES-0 / STATION DIRECTOR</span><button type="button" data-v14-close="1" aria-label="'+t('Kapat','Close')+'">✕</button></header><h2>'+t('YAŞAYAN UZAY İSTASYONU','LIVING SPACE STATION')+'</h2>'+hub()+(room==='map'?'':'<div class="v14-room"><button type="button" class="v14-back" data-v14-map="1">← '+t('Oda haritası','Room map')+'</button>'+content()+'</div>')+'<footer>'+escapeHtml(notice||t('İstasyon kararları ve tatbikatlar ana oyun kaydından ayrıdır.','Station activities are isolated from core game saves.'))+'</footer></section>';
}
function show(next){isOpen=true;room=next||'map';notice='';paint();}
function close(){isOpen=false;const el=document.getElementById('v14-station');if(el){el.hidden=true;el.innerHTML='';}stopCinema();}
function stopCinema(){if(cineTimer)clearTimeout(cineTimer);cineTimer=null;document.getElementById('v14-cinema')?.remove();}
function cinema(){
 stopCinema();
 const scenes=[
 [t('ARES-0 · GÖZLEM KAYDI','ARES-0 · OBSERVATION LOG'),t('İstasyon sessizleştiğinde bile sinyal sürüyordu.','The signal survived even as the station fell silent.')],
 [t('YANKI / 03','ECHO / 03'),t('Sinyal uzaydan gelmiyordu. Kaynak, terk edilmiş koridorların içindeydi.','The signal did not come from space. Its source lay within the abandoned halls.')],
 [t('PIKO · KAYIT TAMAMLANDI','PIKO · RECORD RECOVERED'),t('Komutan... Biri bizi dinliyordu.','Commander... Something was listening.')]
 ];
 const overlay=document.createElement('div');overlay.id='v14-cinema';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');document.body.appendChild(overlay);
 let idx=0;
 const draw=()=>{overlay.innerHTML='<div class="v14-stars"></div><div class="v14-cine-copy"><small>'+escapeHtml(scenes[idx][0])+'</small><p>'+escapeHtml(scenes[idx][1])+'</p><span>'+String(idx+1)+'/3</span></div><button type="button" data-v14-skip="1">'+t('Geç / Kapat','Skip / Close')+'</button>';overlay.querySelector('[data-v14-skip]').addEventListener('click',stopCinema);};
 draw();
 if(w.TowerCommandSounds&&w.TowerCommandSounds.isEnabled?.())w.TowerCommandSounds.play('discover');
 const reduced=!!(w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const tick=()=>{idx++;if(idx>=scenes.length){stopCinema();return;}draw();cineTimer=setTimeout(tick,reduced?1200:3600);};
 cineTimer=setTimeout(tick,reduced?1200:3600);
}
function anomaly(wave){
 const a=logic.anomalyFor(wave,modeStory());const el=document.getElementById('v14-anomaly');
 if(!el)return;
 el.hidden=!a;
 if(a){el.textContent='⚠ '+t(...a.name)+' · '+t(...a.desc);el.setAttribute('role','status');}
 lastAnomaly=a?a.id:'';
}
function onWave(wave){anomaly(wave);}
function onClick(e){
 if(e.target.closest('[data-v14-close]')){close();return;}
 const btn=e.target.closest('button');if(!btn)return;
 if(btn.hasAttribute('data-v14-close')){close();return;}
 if(btn.hasAttribute('data-v14-move')){if(room==='map'){const d=btn.dataset.v14Move.split(',').map(Number);walk(d[0],d[1]);}return;}
 if(btn.hasAttribute('data-v14-tile')){const v=btn.dataset.v14Tile.split(',').map(Number);const id=DOOR_CODES[GRID[v[1]]?.[v[0]]];const def=ROOMS.find(r=>r.id===id);if(!def||completed()<def.at)return;avatar={x:v[0],y:v[1]};enter(id);return;}
 if(btn.hasAttribute('data-v14-map')){room='map';notice='';paint();return;}
 if(btn.hasAttribute('data-v14-room')){
  const id=btn.dataset.v14Room,def=ROOMS.find(x=>x.id===id);
  if(!def||completed()<def.at)return;
  enter(id);return;
 }
 if(btn.hasAttribute('data-v14-sector')){close();w.TowerOverhaulV11?.sectorsUI();return;}
 if(btn.hasAttribute('data-v14-daily')){room='daily';notice='';paint();return;}
 if(btn.hasAttribute('data-v14-quiet')){w.TowerPikoV3?.setQuiet(Number(btn.dataset.v14Quiet));notice=t('Piko konuşma tercihini kaydetti.','Piko saved your conversation preference.');paint();return;}
 if(btn.hasAttribute('data-v14-piko')){w.TowerPikoV3?.record('talk',room);notice=pikoLine();paint();return;}
 if(btn.hasAttribute('data-v14-cinema')){cinema();return;}
 if(btn.hasAttribute('data-v14-puzzle')){
  const p=PUZZLES.find(x=>x.id===btn.dataset.v14Puzzle),answer=Number(btn.dataset.v14Answer);
  if(!p||completed()<p.at||readSolved().includes(p.id))return;
  if(answer===p.answer){solve(p.id);w.TowerPikoV3?.record('puzzle',p.id);notice=t('Sinyal çözüldü!','Signal decoded!');}else notice=t('Yanlış frekans. Tekrar dene.','Wrong frequency. Try again.');
  paint();return;
 }
 if(btn.hasAttribute('data-v14-buy')){run=logic.buy(run,Number(btn.dataset.v14Buy));paint();return;}
 if(btn.hasAttribute('data-v14-next')){
  run=logic.advance(run);
  if(run.finished)saveBest(run);
  paint();return;
 }
 if(btn.hasAttribute('data-v14-restart')){run=logic.newRun(logic.dailyDate());paint();}
}
function mount(){
 if(document.getElementById('v14-station'))return;
 const root=document.createElement('div');root.id='v14-station';root.hidden=true;root.addEventListener('click',onClick);document.body.appendChild(root);
 const banner=document.createElement('div');banner.id='v14-anomaly';banner.hidden=true;document.body.appendChild(banner);
 const nav=document.querySelector('.mode-menu-tools');
 if(nav){const btn=document.createElement('button');btn.id='v14-station-launch';btn.type='button';btn.className='mode-menu-tool';btn.textContent=t('✧ İSTASYON','✧ STATION');btn.addEventListener('click',()=>show('map'));nav.appendChild(btn);}
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(document.getElementById('v14-cinema'))stopCinema();else if(isOpen)close();return;}
  if(!isOpen||room!=='map'||document.getElementById('v14-cinema')||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;
  const d={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]}[e.code];
  if(d){e.preventDefault();e.stopPropagation();walk(d[0],d[1]);}
 });
 try{if(typeof game!=='undefined'&&game)anomaly(game.wave);}catch(_){}
}
w.TowerStationDirectorV14=Object.freeze({open:show,close,completed,readSolved,readBest,onWave,pikoLine,diagnostics:()=>({open:isOpen,room,anomaly:lastAnomaly})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(window);
