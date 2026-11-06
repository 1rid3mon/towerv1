(()=>{'use strict';
const mission=Number(new URLSearchParams(location.search).get('mission'));if(mission<21||mission>27){document.body.textContent='Görev bulunamadı';return}
const canvas=document.getElementById('view'),ctx=canvas.getContext('2d'),objective=document.getElementById('objective'),modal=document.getElementById('modal'),panel=document.getElementById('panel'),pad=document.getElementById('pad'),knob=document.getElementById('knob');
const W=1100,H=590,player={x:135,y:300,r:13},keys=new Set(),joy={x:0,y:0,id:null},walls=[],gates=[],stations=[],enemies=[],found=new Set();
const names={21:'KAYBETTİĞİMİZ İSİM',22:'MOR SINIR',23:'DARBENİN BEDELİ',24:'SON SAVUNMA PROTOKOLÜ',25:'BİR SEÇİMİN BİÇİMİ',26:'MAKİNEDEKİ ZİHİN',27:'HATIRLAYAN KULE'};
const goals={
21:['Üç farklı hafıza parçasını istasyonda bul.','Rol ile kimliği ayırt ederek arşivi çöz.','Piko\'nun kaydını onayla ve geçide ulaş.'],
22:['Mor sınır haritasını aç.','Birinci sınır saldırısını durdur.','İlk röleyi güvenli biçimde sabitle.','İkinci sınır saldırısını durdur.','İkinci röleyi dengele.','Üçüncü röleyi kilitle.','Mor sınırı aş.'],
23:['Hasar raporunu oku.','Geri besleme dalgasını durdur.','Güç hattını onar.','Onarımı ikinci dalgada koru.','Bellek ve iletişim hatlarını onar.','Piko\'nun risk kararını dinle.','Hasarlı bölgeden çık.'],
24:['Merkez arşiv savunma planını incele.','İlk arşiv saldırısını durdur.','Öncelik rölesini kapat.','İkinci savunma dalgasını geç.','Üçüncü savunma hattını hazırla.','Üçüncü dalgada kayıtları koru.','Sıfırlamayı iptal et.','Korunan arşivden ayrıl.'],
25:['Mavi yankıyı fiziksel kayıttan incele.','Piko\'nun seçtiği adı doğrula.','Piko\'nun kendi kararını dinle.','Mor savunma bağlantısını çalıştır.','Yeni bağlantıyı kaydet.'],
26:['Mor bağlantının savaş planını oku.','İlk dalgada savunma bağlantısını kullan.','Uzak hattı eşle.','İkinci dalgada bağlantıyı yeniden kullan.','Son hattın frekansını çöz.','Bağlantıyı istasyona kaydet.'],
27:['Kule çöküş planını incele.','İlk saldırı dalgasında arşivi koru.','Ekip tahliye hattını güvenceye al.','İkinci savunmayı tamamla.','Piko\'nun bilinç çapasını sabitle.','Son dalgada ekip ve çapa için savaş.','Arşivi kurtar ve son kararı doğrula.','Hikâye yayını tamamla.']
};
let vw=0,vh=0,last=0,phase=0,dialog=false,complete=false,combat=false,round=0,hp=24,timer=0,beam=null,choice=null,loops=0,alerts=0,safeUntil=0,lastAlert=-10000,linkUsedWave=false,linkReadyAt=0,linkUses=0,initialHP=24;
const params=new URLSearchParams(location.search),memory=params.get('memory')||'preserve',callSign=params.get('callSign')||'piko',trust=params.get('trust')||'piko';
function wall(x,y,w,h){walls.push({x,y,w,h})}function gate(x,y,w,h,openPhase){gates.push({x,y,w,h,openPhase})}function station(x,y,type,name){stations.push({x,y,type,name})}
function build(){
wall(25,25,1050,15);wall(25,550,1050,15);wall(25,25,15,540);wall(1060,25,15,540);
wall(348,40,20,220);wall(348,336,20,214);wall(706,40,20,220);wall(706,336,20,214);
gate(348,260,20,76,[22,23,24,26,27].includes(mission)?1:0);
gate(706,260,20,76,[22,23,24].includes(mission)?4:[26,27].includes(mission)?2:0);
if(mission===21){
 station(145,132,'clue','GÖREV TANIMI');station(266,446,'clue','SES KAYDI');station(484,130,'clue','KİMLİK İMZASI');
 station(875,142,'deduce','İSİM ARŞİVİ');station(989,457,'exit','SONRAKİ BÖLME');
}
if(mission===22){
 station(146,131,'brief','SINIR PLANI');station(483,300,'core','SINIR SAVUNMASI');
 station(549,455,'relay','İLK RÖLE');station(820,132,'relay','İKİNCİ RÖLE');
 station(870,455,'relay','ÜÇÜNCÜ RÖLE');station(1008,145,'exit','MOR GEÇİT');
}
if(mission===23){
 station(150,133,'brief','HASAR RAPORU');station(482,302,'core','GERİ BESLEME SAVUNMASI');
 station(564,447,'repair','GÜÇ HATTI');station(834,132,'repair','BELLEK HATTI');
 station(852,455,'repair','İLETİŞİM HATTI');station(1000,131,'deduce','PİKO KARARI');
 station(999,461,'exit','HASARLI KAT ÇIKIŞI');
}
if(mission===24){
 station(148,135,'brief','ARŞİV PLANI');station(487,301,'core','MERKEZ SAVUNMA');
 station(561,449,'relay','ÖNCELİK RÖLESİ');station(828,132,'relay','SON HAT');
 station(884,456,'deduce','SIFIRLAMA KONSOLU');station(1010,131,'exit','GÜVENLİ GEÇİT');
}
if(mission===25){
 station(146,137,'clue','MAVİ YANKI');station(256,447,'clue','ÇAĞRI ADI');
 station(483,131,'deduce','PİKO SEÇİMİ');station(857,134,'link','MOR BAĞLANTI');
 station(1008,453,'exit','BAĞLANTI ARŞİVİ');
}
if(mission===26){
 station(146,137,'brief','UZAK SAVUNMA PLANI');station(479,301,'core','BAĞLANTI SAVUNMASI');
 station(836,134,'relay','UZAK HAT');station(862,451,'link','SON BAĞLANTI');
 station(1007,131,'exit','AĞ GEÇİDİ');
}
if(mission===27){
 station(145,134,'brief','ÇÖKÜŞ PLANI');station(480,301,'core','SON NÖBET');
 station(830,133,'relay','EKİP TAHLİYESİ');station(872,456,'anchor','PİKO ÇAPASI');
 station(1002,133,'deduce','ARŞİV KURTARMA');station(1001,455,'exit','HİKÂYE ÇIKIŞI');
}
}
build();
function resize(){vw=innerWidth;vh=innerHeight;const scale=Math.min(devicePixelRatio||1,2);canvas.width=vw*scale;canvas.height=vh*scale;ctx.setTransform(scale,0,0,scale,0,0)}addEventListener('resize',resize);resize();
function hud(){objective.innerHTML='<b>GÖREV '+mission+' · '+names[mission]+'</b><div>'+goals[mission][Math.min(phase,goals[mission].length-1)]+'</div><small>WASD · oklar · E · iPad joystick</small>'+(combat?'<div>Çekirdek '+hp+' · Tehdit '+enemies.filter(e=>e.hp>0).length+' · Dalga '+round+'</div>':'')+(mission===20?'<div>Devriye alarmı: '+alerts+' · Kırmızı görüş alanından kaçın.</div>':'')};hud();
function show(html){dialog=true;modal.classList.add('open');panel.innerHTML=html}function hide(){dialog=false;modal.classList.remove('open')}
function say(title,body){show('<h2>'+title+'</h2><p>'+body+'</p><button id="continue">DEVAM</button>');document.getElementById('continue').onclick=hide}
function pick(title,body,options,cb){show('<h2>'+title+'</h2><p>'+body+'</p><div id="options"></div><p id="feedback" role="status"></p><button id="cancel">KAPAT</button>');document.getElementById('cancel').onclick=hide;const box=document.getElementById('options');for(const [label,value] of options){const button=document.createElement('button');button.textContent=label;button.onclick=()=>cb(value);box.appendChild(button)}}
function error(text){document.getElementById('feedback').textContent=text}
function finish(text){if(complete)return;complete=true;combat=false;show('<h2>GÖREV '+mission+' TAMAMLANDI</h2><p>'+text+'</p><button id="done">GÖREV PANOSUNA DÖN</button>');document.getElementById('done').onclick=()=>((payload)=>window.StoryInteriorCompletion ? window.StoryInteriorCompletion.submit(payload) : parent.postMessage(payload,location.origin))({type:'lost-signal-interior-mission-complete',mission,callSignChoice:mission===17?choice:null})}
function beginBattle(count,health){round++;combat=true;enemies.length=0;for(let i=0;i<count;i++){enemies.push({x:800+i%2*45,y:120+i*65,hp:health,speed:16+i*2})}timer=0;hud();say('SAVUNMA','Düşmanları dokunarak hedefle. Tüm tehditleri çekirdeğe ulaşmadan durdur!')}
function handle(n){
if(mission===16){
 if(n.type==='clue'&&phase===0){found.add(n.name);say(n.name,n.name==='ESKİ ÇIKIŞ KAYDI'?'Eski plan çıkışı doğu kanadında gösteriyor.':'Güvenlik logu aynı koridorun girişine dönen bir sinyal döngüsü olduğunu gösteriyor.');if(found.size===2){phase=1;hud()}return}
 if(n.type==='relay'&&phase===1){phase=2;hud();say('YÖNLENDİRİCİ','Ağ akışı düzeltildi ancak kapı hâlâ eski haritayı gösteriyor. Gerçek çıkışın yönünü doğrula.');return}
 if(n.type==='map'&&phase===2){pick('DÖNGÜ ANALİZİ','İki kayıt çelişiyor: fiziksel geçit doğuda, döngü sinyali aynı koridora dönüyor. Hangi yolu seçmelisin?', [['FİZİKSEL İZİ TAKİP ET','right'],['DÖNGÜ SİNYALİNE GİR','wrong']],v=>{if(v==='wrong'){loops++;error('Döngü başladı. Sistem seni başlangıç koridoruna yönlendirecek.');player.x=132;player.y=300;return}phase=3;hud();say('GERÇEK ROTA','Harita düzeltildi. Koridorun sonunda gerçek çıkış açıldı.')});return}
 if(n.type==='trap'){loops++;player.x=132;player.y=300;say('SAHTE ÇIKIŞ','Girdiğin kapı aynı başlangıç koridoruna bağlı. Haritaya dön.');return}
 if(n.type==='exit'&&phase===3){finish('Harita döngüsü kırıldı. Sahte çıkışın sinyal tuzağı olduğu kanıtlandı.');return}
}
if(mission===17){
 if(n.type==='clue'&&phase===0){found.add(n.name);const evidence={'ÇEKİRDEK ETİKETİ':'Eski sistem etiketi: ECHO.', 'ARŞİV KAYDI':'Aynı çekirdekte PIKO adıyla yapılmış ilk kişisel imza.', 'ESKİ SES KAYDI':'Piko: Beni sadece bir kod olarak görme.'};say(n.name,evidence[n.name]);if(found.size===3){phase=1;hud()}return}
 if(n.type==='deduce'&&phase===1){pick('KİMLİK KARARI','ECHO teknik etiketi, Piko ise kendi kullandığı isim. Piko kendi çağrı adını seçebilir mi?', [['SEÇİMİ PİKOYA BIRAK','piko'],['ESKİ TEKNİK ETİKETİ KORU','echo']],v=>{choice=v;phase=2;hud();say('ÇAĞRI ADI',v==='piko'?'Piko kendi adını PIKO olarak onayladı.':'Eski arşiv etiketi ECHO olarak korunacak; Piko bunun kendi kimliğini tanımlamadığını belirtiyor.')});return}
 if(n.type==='exit'&&phase===2){finish('Kimlik kayıtları ve Piko ile yapılan konuşma saklandı.');return}
}
if(mission===18){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('KİLİT SENİ TANIYOR','Üç dalga güvenlik sistemi bulunuyor. Savaşlardan sonra enerji ve mühürlerin güvenliğini sağlamalısın.');return}
 if(n.type==='core'&&[1,3,5].includes(phase)){if(!combat)beginBattle(phase===1?3:phase===3?4:5,phase===1?2:phase===3?3:4);else say('SAVUNMA','Kırmızı hedefleri dokunarak vur.');return}
 if(n.type==='repair'&&phase===2){pick('ENERJİ KÖPRÜSÜ','Güvenlik kapısını aşırı yüklememek için hangi işlemi yapmalısın?', [['GÜCÜ DENGELİ DAĞIT','yes'],['TÜM GÜCÜ TEK HATTA VER','no']],v=>{if(v==='no'){error('Tek hatta aşırı yüklenme riski var.');return}phase=3;hud();say('KÖPRÜ ONARILDI','İkinci savunma dalgasının kilidi kalktı.')});return}
 if(n.type==='seal'&&phase===4){pick(n.name,'Mühürleri güvenlik sırası A → B → C ile kapat.',[['MÜHÜRLE','yes'],['İPTAL','no']],v=>{if(v==='no'){hide();return}const order=['MÜHÜR A','MÜHÜR B','MÜHÜR C'];if(n.name!==order[found.size]){error('Önce '+order[found.size]+' gerekli.');return}found.add(n.name);if(found.size===3)phase=5;hud();say('MÜHÜR KAPALI',n.name+' güvenli.')});return}
 if(n.type==='deduce'&&phase===6){pick('KOMUTAN KİLİDİ','Kilit, komutanın eski kimlik anahtarını tanıyor. Bu, geçmiş hakkında neyi kesin kanıtlıyor?', [['KİMLİK ANAHTARI DAHA ÖNCE KAYDEDİLMİŞ','yes'],['KOMUTAN HER ŞEYİ HATIRLIYOR','no']],v=>{if(v==='no'){error('Kimlik kaydı, kişinin tüm anıları bildiğini ispatlamaz.');return}phase=7;hud();say('KİLİT AÇILDI','Kapı açıldı. Komutanın daha önce burada bulunduğuna ilişkin yeni kanıt var.')});return}
 if(n.type==='exit'&&phase===7){finish('Üç güvenlik dalgası aşıldı; kimlik kapısı açıldı.');return}
}
if(mission===19){
 if(n.type==='clue'&&phase===0){found.add(n.name);const e={'TELEMETRİ A':'Mor yapı A koordinatında 02:04 ölçülmüş.', 'TELEMETRİ B':'Aynı imzalı nesne B koordinatında 02:04 görünüyor.', 'TELEMETRİ C':'B ölçümünde 12 saniyelik aktarım gecikmesi ve yansıtıcı istasyon var.'};say(n.name,e[n.name]);if(found.size===3){phase=1;hud()}return}
 if(n.type==='deduce'&&phase===1){pick('YÖRÜNGE ANALİZİ','İki görünüm aynı anda alındı ama ikinci veride gecikme bulunuyor. Hangi açıklama ölçümlerle tutarlı?', [['GECİKMELİ VE YANSIMIŞ GÖRÜNTÜ OLABİLİR','yes'],['NESNE KESİNLİKLE İKİ YERDE','no']],v=>{if(v==='no'){error('Aktarım gecikmesini göz ardı ediyorsun.');return}phase=2;hud();say('ROTA AÇILDI','Yansıma ve gecikme olasılığı kaydedildi; iki yerde aynı anda olma iddiası doğrulanmadı.')});return}
 if(n.type==='exit'&&phase===2){finish('Mor yapının güvenilir rota ipuçları ayrıştırıldı.');return}
}
if(mission===20){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('SESSİZ FİLO','Filo üç ayrı güvenlik devresiyle korunuyor. Kontrol düğümlerini sessizce etkisizleştir.');return}
 if(n.type==='stealth'&&[1,2,3].includes(phase)){
 const order=['DEVRE A','DEVRE B','ALARM DÜĞÜMÜ'];if(n.name!==order[phase-1]){say('GÜVENLİK','Önce '+order[phase-1]+' devre dışı bırakılmalı.');return}
 pick(n.name,'Sistem alarmını tetiklemeden geçmek için ne yapmalısın?', [['SENSÖRÜ KISA SÜRELİKLİ KARART','yes'],['TÜM ALANIN GÜCÜNÜ KES','no']],v=>{if(v==='no'){alerts++;error('Ani güç kesintisi alarm üretti. Savunma yeniden kuruldu.');return}phase++;hud();say('DEVRE GİZLENDİ',n.name+' devre dışı, geçiş penceresi açıldı.')});return}
 if(n.type==='exit'&&phase===4){finish('Üç güvenlik devresi susturularak sessiz filonun ötesine geçildi.');return}
}
say('KİLİTLİ','Mevcut görev adımını tamamla.');
}
function patrols(t){if(mission!==20)return[];return[
 {x:515,y:295+140*Math.sin(t/1550),radius:62,active:phase===1},
 {x:850,y:295+140*Math.sin(t/1750+1.1),radius:68,active:phase===2}
]}
function interact(){if(dialog||complete)return;const n=stations.filter(s=>Math.hypot(player.x-s.x,player.y-s.y)<75).sort((a,b)=>Math.hypot(player.x-a.x,player.y-a.y)-Math.hypot(player.x-b.x,player.y-b.y))[0];if(n){safeUntil=performance.now()+1100;handle(n)}}
function collides(x,y){return walls.concat(gates.filter(g=>phase<g.openPhase)).some(w=>x+player.r>w.x&&x-player.r<w.x+w.w&&y+player.r>w.y&&y-player.r<w.y+w.h)}
function move(dt){if(dialog)return;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+joy.x,dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+joy.y;const m=Math.hypot(dx,dy);if(m<.02)return;dx/=Math.max(1,m);dy/=Math.max(1,m);const x=player.x+dx*205*dt,y=player.y+dy*205*dt;if(!collides(x,player.y))player.x=x;if(!collides(player.x,y))player.y=y}
function camera(){const scale=Math.min(vw/760,vh/450,1.6),ox=Math.max(0,Math.min(W-vw/scale,player.x-vw/scale/2)),oy=Math.max(0,Math.min(H-vh/scale,player.y-vh/scale/2));return{scale,ox,oy}}
function draw(time){ctx.fillStyle='#06101b';ctx.fillRect(0,0,vw,vh);const {scale,ox,oy}=camera();ctx.save();ctx.scale(scale,scale);ctx.translate(-ox,-oy);ctx.fillStyle='#142837';ctx.fillRect(25,25,1050,540);
for(let i=0;i<3;i++){const x=40+i*354;ctx.fillStyle=['#122634','#182c3a','#1b2b38'][i];ctx.fillRect(x,41,334,510);ctx.strokeStyle='#305b71';ctx.strokeRect(x+8,53,318,489);ctx.fillStyle='#7eb7c9';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('ALT SEKTÖR '+['A','B','C'][i],x+165,82)}
for(const w of walls){ctx.fillStyle='#617d91';ctx.fillRect(w.x,w.y,w.w,w.h)}for(const g of gates){ctx.fillStyle=phase<g.openPhase?'#ac534c':'#2a776d';ctx.fillRect(g.x,g.y,g.w,g.h)}
for(const s of stations){const d=Math.hypot(player.x-s.x,player.y-s.y);ctx.fillStyle=d<75?'#46a8a3':'#27627a';ctx.fillRect(s.x-23,s.y-20,46,40);ctx.strokeStyle='#a6e8ff';ctx.strokeRect(s.x-23,s.y-20,46,40);ctx.fillStyle='#ecfcff';ctx.font='12px system-ui';ctx.fillText(s.name,s.x,s.y-28);if(d<75){ctx.fillStyle='#eaffb6';ctx.fillText('ETKİLEŞ',s.x,s.y+38)}}
for(const patrol of patrols(time).filter(p=>p.active)){ctx.fillStyle='rgba(245,88,105,0.17)';ctx.beginPath();ctx.arc(patrol.x,patrol.y,patrol.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fa8b8f';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f47787';ctx.fillRect(patrol.x-13,patrol.y-13,26,26);ctx.fillStyle='#ffe0d7';ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillText('DEVRIYE',patrol.x,patrol.y-24)}
for(const e of enemies.filter(e=>e.hp>0)){ctx.fillStyle='#d7687a';ctx.fillRect(e.x-15,e.y-15,30,30);ctx.fillStyle='#fff';ctx.fillText(String(e.hp),e.x,e.y-23)}
if(beam&&time<beam.until){ctx.strokeStyle='#9bffff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(490,300);ctx.lineTo(beam.x,beam.y);ctx.stroke()}
ctx.fillStyle='#6bddf0';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
canvas.addEventListener('pointerdown',e=>{if(!combat||dialog||complete)return;const {scale,ox,oy}=camera(),x=e.clientX/scale+ox,y=e.clientY/scale+oy,target=enemies.find(f=>f.hp>0&&Math.hypot(f.x-x,f.y-y)<37);if(!target)return;target.hp--;beam={x:target.x,y:target.y,until:performance.now()+160};if(enemies.every(f=>f.hp<=0)){combat=false;phase=mission===18?(round===1?2:round===2?4:6):(round===1?2:4);hud();say('DALGA TAMAMLANDI',round===1?'İlk savunma geçti.':'Bir savunma dalgası daha tamamlandı.')}else hud()});
function restart(){combat=false;hp=24;round--;enemies.length=0;show('<h2>ÇEKİRDEK HASAR ALDI</h2><p>Bu dalgayı tekrar deneyebilirsin. Mühür kayıtları korundu.</p><button id="retry">TEKRAR</button>');document.getElementById('retry').onclick=hide}
function tick(t){const dt=Math.min((t-last)/1000||0,.05);last=t;move(dt);
if(mission===20&&!dialog&&!complete&&t>safeUntil&&t-lastAlert>1700){
 const spotted=patrols(t).some(p=>p.active&&Math.hypot(player.x-p.x,player.y-p.y)<p.radius+player.r);
 if(spotted){lastAlert=t;alerts++;player.x=phase<2?397:754;player.y=300;
 say('DEVRIYE ALARMI','Filo sensörü seni tespit etti. Güvenli koridora geri çekildin. Devriye hareketine göre geçiş zamanını seç. Alarm sayısı: '+alerts);
 }
}
if(combat&&!dialog){timer+=dt;for(const e of enemies.filter(e=>e.hp>0)){const dx=490-e.x,dy=300-e.y,m=Math.hypot(dx,dy)||1;e.x+=dx/m*e.speed*dt;e.y+=dy/m*e.speed*dt}if(timer>3.2){timer=0;hp-=3;hud();if(hp<=0)restart()}}draw(t);requestAnimationFrame(tick)}requestAnimationFrame(tick);
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys.add(k);if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if((k==='e'||k===' ')&&!e.repeat)interact()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
document.getElementById('act').onclick=interact;document.getElementById('quit').onclick=()=>parent.postMessage({type:'lost-signal-interior-close'},location.origin);
function stick(e){const b=pad.getBoundingClientRect(),x=e.clientX-b.left-b.width/2,y=e.clientY-b.top-b.height/2,m=Math.max(1,Math.hypot(x,y)),r=Math.min(1,m/44);joy.x=x/m*r;joy.y=y/m*r;knob.style.transform='translate('+(joy.x*38)+'px,'+(joy.y*38)+'px)'}
pad.addEventListener('pointerdown',e=>{joy.id=e.pointerId;pad.setPointerCapture(e.pointerId);stick(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)stick(e)});function reset(e){if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;knob.style.transform=''}pad.addEventListener('pointerup',reset);pad.addEventListener('pointercancel',reset);
})();
