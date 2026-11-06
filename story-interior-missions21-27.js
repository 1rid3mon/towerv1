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
function hud(){objective.innerHTML='<b>GÖREV '+mission+' · '+names[mission]+'</b><div>'+goals[mission][Math.min(phase,goals[mission].length-1)]+'</div><small>WASD · oklar · E · iPad joystick</small>'+(combat?'<div>Çekirdek '+hp+' · Tehdit '+enemies.filter(e=>e.hp>0).length+' · Dalga '+round+'</div>':'')+(mission>=25?'<div>Mor bağlantı: '+linkUses+' kullanım · '+(mission===25?'Piko sınaması':'Kalkan desteği')+'</div>':'');updateLinkButton()};hud();
function show(html){dialog=true;modal.classList.add('open');panel.innerHTML=html}function hide(){dialog=false;modal.classList.remove('open')}
function say(title,body){show('<h2>'+title+'</h2><p>'+body+'</p><button id="continue">DEVAM</button>');document.getElementById('continue').onclick=hide}
function pick(title,body,options,cb){show('<h2>'+title+'</h2><p>'+body+'</p><div id="options"></div><p id="feedback" role="status"></p><button id="cancel">KAPAT</button>');document.getElementById('cancel').onclick=hide;const box=document.getElementById('options');for(const [label,value] of options){const button=document.createElement('button');button.textContent=label;button.onclick=()=>cb(value);box.appendChild(button)}}
function error(text){document.getElementById('feedback').textContent=text}
function finish(text){if(complete)return;complete=true;combat=false;show('<h2>GÖREV '+mission+' TAMAMLANDI</h2><p>'+text+'</p><button id="done">GÖREV PANOSUNA DÖN</button>');document.getElementById('done').onclick=()=>((payload)=>window.StoryInteriorCompletion ? window.StoryInteriorCompletion.submit(payload) : parent.postMessage(payload,location.origin))({type:'lost-signal-interior-mission-complete',mission,stabilityChoice:mission===23?choice:null,companionForm:mission===25?'purple':mission===27?'tower':null})}
function beginBattle(count,health){
 round++;combat=true;linkUsedWave=false;enemies.length=0;
 if(round===1){initialHP=mission===24&&memory==='preserve'?29:24;hp=initialHP}
 for(let i=0;i<count;i++)enemies.push({x:782+i%2*39,y:126+i*47,hp:health,speed:14+i*2});
 timer=0;hud();
 say('SAVUNMA '+round,'Düşmanları ekranda seçip hedefle. Mor bağlantı etkinse sağdaki MOR DESTEK düğmesi kalkan aktarır. Çekirdek dayanıklılığı sıfıra inerse dalgayı tekrar başlatabilirsin.');
}
function updateLinkButton(){
 const b=document.getElementById('link');if(!b)return;
 b.hidden=mission<25;
 const ready=performance.now()>=linkReadyAt;
 const available=mission===25?phase===3:combat;
 b.disabled=!ready||!available||dialog||complete;
 b.textContent=!ready?'YÜKLENİYOR':'MOR DESTEK';
}
function useLink(){
 if(mission<25||dialog||complete||performance.now()<linkReadyAt)return;
 if(mission===25){
  if(phase!==3)return;
  linkUses++;linkReadyAt=performance.now()+6000;phase=4;hp=Math.min(36,hp+8);hud();
  say('MOR DESTEK TESTİ','Piko savunma hattına koruyucu enerji aktardı. Mor biçim etkin, Piko\'nun seçimi kayda geçti.');
  return;
 }
 if(!combat)return;
 linkUsedWave=true;linkUses++;linkReadyAt=performance.now()+5500;hp=Math.min(36,hp+9);hud();
 if(enemies.every(e=>e.hp<=0))finishWave();
}
function finishWave(){
 if(!combat||enemies.some(e=>e.hp>0))return;
 if((mission===26||mission===27&&round===3)&&!linkUsedWave){
  say('MOR DESTEK GEREKLİ','Dalgayı bitirdin ancak Piko\'nun savunma bağlantısını henüz denemedin. MOR DESTEK düğmesini kullan.');
  return;
 }
 const next={22:[2,4],23:[2,4],24:[2,4,6],26:[2,4],27:[2,4,6]}[mission];
 if(!next||next[round-1]===undefined)return;
 combat=false;phase=next[round-1];hud();
 say('DALGA '+round+' TAMAMLANDI',mission===27&&round===3?'Son nöbet tamamlandı. Arşivi kurtarma terminaline geç.':'Savunma başarıyla durduruldu. Görev panosundaki sonraki hedefe ilerle.');
}

function handle(n){
if(mission===21){
 if(n.type==='clue'&&phase===0){
  found.add(n.name);
  const logs={'GÖREV TANIMI':'Eski arşiv ECHO protokolünü savunma görevi olarak tanımlar; bu bir kişi adı değil.',
   'SES KAYDI':'Kayıttaki bir ses: “Bana takılan görev kodu, bugün kim olduğumu belirlemiyor.”',
   'KİMLİK İMZASI':'Çekirdekte Piko tarafından yapılmış kişisel bir seçim imzası var; eski protokol ile aynı imzaya sahip değil.'};
  say(n.name,logs[n.name]);if(found.size===3){phase=1;hud()}return;
 }
 if(n.type==='deduce'&&phase===1){
  pick('KAYBETTİĞİMİZ İSİM','Üç kayıt bir görev etiketini ve bir kimlik imzasını gösteriyor. Hangisi kanıtlarla uyumlu?',
  [['GÖREV ETİKETİ KİMLİĞİ KANITLAMAZ','yes'],['ECHO VE PİKO KESİNLİKLE AYNI BİLİNÇ','no']],v=>{
   if(v==='no'){error('Aynı protokolü kullanmak, aynı bilinç olmak demek değil. İmzaları karşılaştır.');return}
   phase=2;hud();
   say('KİMLİK İZİ',callSign==='echo'?'Eski ECHO etiketi saklanmış; Piko kendi kimliğini bundan ayrı tanımlıyor.':'Piko kendi adını koruyor. Eski ECHO görevi onun kimliğini tek başına açıklamıyor.');
  });return;
 }
 if(n.type==='exit'&&phase===2){finish('Görev ile kimlik arasındaki fark arşive kaydedildi. Mavi yankının kime ait olduğu hâlâ kesin değil.');return}
}
if(mission===22){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('MOR SINIR','Sınır iki saldırı dalgası ve üç röleyle korunuyor. Önce savunmayı geç, sonra rölelere fiziksel olarak ulaş.');return}
 if(n.type==='core'&&[1,3].includes(phase)){if(!combat)beginBattle(phase===1?4:5,phase===1?3:4);else say('SAVUNMA','Kırmızı hedefleri işaretle; reaktör bütünlüğünü koru.');return}
 if(n.type==='relay'&&phase===2&&n.name==='İLK RÖLE'){
  pick('BİRİNCİ RÖLE','Bozulmuş enerji hattını güvenli bağlamak için hangisi ilk?',[['TOPRAKLAMA','yes'],['YÜKSEK GERİLİM','no']],v=>{
   if(v==='no'){error('Mor devre aşırı yüklendi. Önce topraklama gerekir.');return}
   phase=3;hud();say('İLK RÖLE STABİL','İlk bükülme düzeldi. İkinci savunma dalgası başladı.');});return
 }
 if(n.type==='relay'&&phase===4&&n.name==='İKİNCİ RÖLE'){
  pick('İKİNCİ RÖLE','Mor yankı iki ayrı sinyal gösteriyor. Hangi yöntemle fazları eşleştireceksin?',[['FAZLARI EŞLE','yes'],['FREKANSI RASTGELE ARTIR','no']],v=>{
   if(v==='no'){error('Rastgele frekans artırmak iki hattı eşitlemez.');return}
   phase=5;hud();say('İKİNCİ RÖLE STABİL','İki konum tek bir geçide döndü.');});return
 }
 if(n.type==='relay'&&phase===5&&n.name==='ÜÇÜNCÜ RÖLE'){
  pick('ÜÇÜNCÜ RÖLE','Piko, henüz kimliğini dönüştürmeden geçidin kilitlenmesini istiyor.',[['YALITILMIŞ GEÇİDİ KİLİTLE','yes'],['TÜM BELLEĞİ SİL','no']],v=>{
   if(v==='no'){error('Belleği silmek fiziksel röleyi sabitlemez.');return}
   phase=6;hud();say('MOR SINIR AÇIK','Üç röle stabil. Mavi yankı hafızanın bir bedeli olacağını söylüyor.');});return
 }
 if(n.type==='exit'&&phase===6){finish('Sınır aşıldı. Piko, mor sinyalin bir gelecek olasılığı olduğunu ama kanıt olmadığını biliyor.');return}
}
if(mission===23){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('DARBENİN BEDELİ','Piko fazla güçlü darbe kullandı. Enerji, bellek ve iletişim hatları hasarlı. Önce saldırıyı durdur.');return}
 if(n.type==='core'&&[1,3].includes(phase)){if(!combat)beginBattle(phase===1?4:4,phase===1?3:4);else say('SAVUNMA','Hasarlı çekirdeğin önündeki düşmanları durdur.');return}
 if(n.type==='repair'&&phase===2&&n.name==='GÜÇ HATTI'){
  pick('GÜÇ HATTI','Hasarlı hattın önce güvenli referans bağlantısını kur.',[['TOPRAKLAMA → ENERJİ','yes'],['DOĞRUDAN YÜKLEME','no']],v=>{
   if(v==='no'){error('Korumasız enerji aktarımı belleğe zarar verir.');return}
   phase=3;hud();say('GÜÇ ONARILDI','Piko bir anıyı geri aldı; ancak ilk konuşmanızın bir bölümü bulanıklaştı.');});return
 }
 if(n.type==='repair'&&phase===4&&['BELLEK HATTI','İLETİŞİM HATTI'].includes(n.name)){
  if(found.has(n.name)){say('ONARILDI',n.name+' güvenli.');return}
  const expected=n.name==='BELLEK HATTI'?'compare':'sync';
  pick(n.name,'Bellek ve iletişim farklı koruma ister.',
   [['İKİ KAYDI KARŞILAŞTIR','compare'],['SİNYALİ SENKRONLA','sync'],['VERİYİ SİL','delete']],v=>{
    if(v!==expected){error('Bu hat için doğru yöntem değil. Veriyi koruyarak işlemi seç.');return}
    found.add(n.name);if(found.size===2)phase=5;hud();
    say('HAT ONARILDI',n.name+' güvenli. '+found.size+'/2.');
   });return
 }
 if(n.type==='deduce'&&phase===5){
  pick('PİKO\'NUN RİSKİ','Piko: “Geçmişimi geri alırken şu an olduğum şeyi kaybetmek istemiyorum. Nasıl ilerleyeceğime ben karar vermek istiyorum.”',
   [['ÖNCE ŞİMDİKİ BELLEĞİ KORU','preserve'],['EKSİK ANILARI İHTİYATLA ARAŞTIR','recover']],v=>{
    choice=v;phase=6;hud();
    say('PİKO\'NUN KARARI',v==='preserve'?'Piko şimdiki belleğini korumayı seçti. Sonraki savunma daha fazla kalkanla başlayacak.':'Piko kaybolan anıyı araştırmayı seçti. Sonraki savunmada saldırı hatlarını daha hızlı okuyabilecek.');
   });return
 }
 if(n.type==='exit'&&phase===6){finish('Hasarlı hatlar onarıldı. Piko\'nun seçimi kayıtlara işlendi.');return}
}
if(mission===24){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('ARŞİV SIFIRLANMASI','Merkez ağ herkesi yanlışlıkla sıfırlama komutu olarak görüyor. Üç savunma dalgası var.');return}
 if(n.type==='core'&&[1,3,5].includes(phase)){
  if(!combat)beginBattle(phase===1?5:phase===3?6:7,phase===1&&memory==='recover'?2:phase===1?3:phase===3?4:5);
  else say('ARŞİV SAVUNMASI','Düşmanların çekirdeğe erişmesine izin verme.');
  return
 }
 if(n.type==='relay'&&phase===2&&n.name==='ÖNCELİK RÖLESİ'){
  pick('ÖNCELİK RÖLESİ','Arşiv sıfırlamasını önlemek için hangi komut güvenli?',[['SIFIRLAMA ÖNCELİĞİNİ KAPAT','yes'],['VERİ BLOKLARINI SİL','no']],v=>{
   if(v==='no'){error('Veri silmek arşivi kurtarmaz.');return}
   phase=3;hud();say('RÖLE KAPANDI','Merkez arşivin öncelik sıfırlaması durdu.');});return
 }
 if(n.type==='relay'&&phase===4&&n.name==='SON HAT'){
  pick('SON SAVUNMA HATTI','İkinci saldırı bitti. Kalkan dengesi için hangi sırayı kullanırsın?',[['EKİP → ARŞİV → ÇEKİRDEK','yes'],['ÇEKİRDEK → ARŞİV → EKİP','no']],v=>{
   if(v==='no'){error('Öncelik ekip güvenliği. Ekip hattını önce koru.');return}
   phase=5;hud();say('SON SAVUNMA HAZIR','Kule üçüncü dalga için kilitlendi.');});return
 }
 if(n.type==='deduce'&&phase===6){
  pick('SIFIRLAMA KONSOLU','Üç savunma dalgası tamamlandı. Arşivin kaybolmasını hangi işlem engeller?',
  [['YALNIZCA SIFIRLAMA KOMUTUNU İPTAL ET','yes'],['TÜM HAFIZAYI YOK ET','no']],v=>{
   if(v==='no'){error('Hafızayı silmek, korumak istediğin şeyi yok eder.');return}
   phase=7;hud();say('ARŞİV GÜVENDE','Sıfırlama engellendi. Mavi yankı sürekli bir görüntü hâlinde kalıyor.');});return
 }
 if(n.type==='exit'&&phase===7){finish('Merkez arşiv üç savunmanın ardından korundu. Sıfırlama iptal edildi.');return}
}
if(mission===25){
 if(n.type==='clue'&&phase===0&&n.name==='MAVİ YANKI'){
  phase=1;hud();say('MAVİ YANKI','Bu eski bellek izi Piko ile aynı sesleri içeriyor, ama aynı bilinç olduğuna dair kanıt değil.');return
 }
 if(n.type==='clue'&&phase===1&&n.name==='ÇAĞRI ADI'){
  phase=2;hud();say('ÇAĞRI ADI',callSign==='echo'?'Eski ECHO etiketi korunmuştu; Piko kendi kimliğini bundan ayrı tanımlıyor.':'Piko adını kendisi seçti. Eski kodun kişisel kimliğini belirlemesine izin vermiyor.');return
 }
 if(n.type==='deduce'&&phase===2){
  pick('PİKO\'NUN SEÇİMİ','Piko: “Sizi korumayı bir emir olduğu için değil, kendim istediğim için seçeceğim.” Mor biçimi etkinleştirmeye hazır mı?',
  [['KARARINI DİNLE VE İZİN VER','yes'],['ZORLA DÖNÜŞTÜR','no']],v=>{
   if(v==='no'){error('Piko kendi kararını vermeden zorlamak doğru değil; onayını dinle.');return}
   phase=3;hud();say('MOR BİÇİM','Piko mor savunma bağlantısını kendi iradesiyle açtı. Sağdaki MOR DESTEK düğmesini kullanarak sınamayı tamamla.');});return
 }
 if(n.type==='link'&&phase===3){say('MOR DESTEK','Mor bağlantıyı sağdaki düğmeyle etkinleştir. Kalkan aktarımı başarılı olursa kaydı açabilirsin.');return}
 if(n.type==='exit'&&phase===4){finish('Mor savunma biçimi seçildi; bağlantı sınaması başarılı.');return}
}
if(mission===26){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('UZAK SAVUNMA','Mor bağlantı bir koruma aktarımı sağlar. Her dalgada en az bir kez kullanarak hattı doğrula.');return}
 if(n.type==='core'&&[1,3].includes(phase)){if(!combat)beginBattle(phase===1?4:5,phase===1?3:4);else say('BAĞLANTI SAVUNMASI','Mor desteği savaşta kullan.');return}
 if(n.type==='relay'&&phase===2){
  pick('UZAK HAT','Gecikmeli verici yerel sinyalle eşleşmiyor. Doğru bağlantı yöntemi hangisi?',[['GECİKMEYİ ÖLÇ VE SENKRONLA','yes'],['FREKANSI RASTGELE AYARLA','no']],v=>{
   if(v==='no'){error('Gecikmeyi hesaba katmadan eşleme yapılamaz.');return}
   phase=3;hud();say('UZAK HAT EŞLENDİ','Piko: “Sesim gecikiyor ama burada olduğumu ben biliyorum.”');});return
 }
 if(n.type==='link'&&phase===4){
  pick('SON BAĞLANTI','İki saldırıda mor savunma desteğini kullandın. Son hattı nasıl ilişkilendirirsin?',[['AYRI KİMLİĞİ KORUYARAK BAĞLA','yes'],['PİKOYU İSTASYONLA AYNI İLAN ET','no']],v=>{
   if(v==='no'){error('Bir ağla konuşabilmek onunla aynı zihin olmayı kanıtlamaz.');return}
   phase=5;hud();say('MAKİNEDEKİ ZİHİN','Piko istasyonun içinde kaybolmadan onunla iletişim kurmayı başardı.');});return
 }
 if(n.type==='exit'&&phase===5){finish('İki uzak savunma dalgasında mor bağlantı kullanıldı; hatlar birleştirildi.');return}
}
if(mission===27){
 if(n.type==='brief'&&phase===0){phase=1;hud();say('HATIRLAYAN KULE','Son ağ çöküşü başladı. Üç dalgayı aş; önce ekip, sonra arşiv ve Piko\'nun bilinç çapasını koru.');return}
 if(n.type==='core'&&[1,3,5].includes(phase)){if(!combat)beginBattle(phase===1?4:phase===3?5:7,phase===1?3:phase===3?4:5);else say('SON NÖBET','Mor desteği gerektiğinde kullan; ekip hattını koru.');return}
 if(n.type==='relay'&&phase===2){
  pick('EKİP TAHLİYESİ','Arşiv silinme tehdidinde, ekip tahliye riski altında. Öncelik hangisi?',[['ÖNCE EKİBİ GÜVENE AL','yes'],['ÖNCE KAYITLARI KURTAR','no']],v=>{
   if(v==='no'){error('Yaşayanların güvenliği önce gelmeli.');return}
   phase=3;hud();say('EKİP GÜVENDE','Komutan: “Hiçbir kayıt, yaşayanların yerini tutmaz.”');});return
 }
 if(n.type==='anchor'&&phase===4){
  pick('PİKO ÇAPASI','İkinci dalga durdu. Piko: “Bana kule şeklinde bir çapa kur. Ben bu biçimde kalmayı seçiyorum.”',
  [['PİKO\'NUN ÇAPASINI SABİTLE','yes'],['ANILARI SİL','no']],v=>{
   if(v==='no'){error('Çapa belleğin silinmesini gerektirmez.');return}
   phase=5;hud();say('KULE ÇAPASI','Piko kule biçiminde istikrarlı. Mor bağlantı son savunmada çalışıyor.');});return
 }
 if(n.type==='deduce'&&phase===6){
  pick('ARŞİV KURTARMA','Ekip güvenli, saldırılar durdu. Arşivi kurtarmak için nasıl ilerleyeceksin?',
  [['KAYITLARI KORU, PİKO\'NUN KARARINI SAKLA','yes'],['ÇEKİRDEĞİ VE KİMLİĞİ SIFIRLA','no']],v=>{
   if(v==='no'){error('Sıfırlama Piko\'nun seçimini ve kurtardığın kayıtları yok eder.');return}
   phase=7;hud();say('HATIRLAYAN KULE','Arşiv kurtuldu. Piko iki kısa darbeyle yanıt veriyor. Mavi yankının son parçası eksik, ama kimin dönmeyi seçtiği belli.');});return
 }
 if(n.type==='exit'&&phase===7){finish('İlk LOST SIGNAL hikâye yayını tamamlandı. Ekip, arşiv ve Piko\'nun çapa belleği korundu.');return}
}
say('ERİŞİM KİLİTLİ','Önce mevcut görev adımını tamamla.');
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
canvas.addEventListener('pointerdown',e=>{
 if(!combat||dialog||complete)return;
 const {scale,ox,oy}=camera(),x=e.clientX/scale+ox,y=e.clientY/scale+oy;
 const target=enemies.find(f=>f.hp>0&&Math.hypot(f.x-x,f.y-y)<39);if(!target)return;
 target.hp--;beam={x:target.x,y:target.y,until:performance.now()+180};
 if(enemies.every(f=>f.hp<=0))finishWave();else hud();
});
function restart(){
 combat=false;hp=initialHP;round--;linkUsedWave=false;enemies.length=0;
 show('<h2>ÇEKİRDEK HASAR ALDI</h2><p>Bu savunma dalgasını yeniden başlatabilirsin. Önceki röle ve hikâye kararların korundu.</p><button id="retry">SAVUNMAYA DÖN</button>');
 document.getElementById('retry').onclick=()=>{hide();hud()};
}
let lastLinkUI=0;
function tick(t){
 const dt=Math.min((t-last)/1000||0,.05);last=t;move(dt);
 if(combat&&!dialog){
  timer+=dt;
  for(const e of enemies.filter(e=>e.hp>0)){const dx=490-e.x,dy=300-e.y,m=Math.hypot(dx,dy)||1;e.x+=dx/m*e.speed*dt;e.y+=dy/m*e.speed*dt}
  if(timer>3.5&&enemies.some(e=>e.hp>0)){
   timer=0;hp-=mission===27?4:3;hud();if(hp<=0)restart();
  }
 }
 if(t-lastLinkUI>250){lastLinkUI=t;updateLinkButton()}
 draw(t);requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys.add(k);if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if((k==='e'||k===' ')&&!e.repeat)interact()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
document.getElementById('act').onclick=interact;document.getElementById('link').onclick=useLink;document.getElementById('quit').onclick=()=>parent.postMessage({type:'lost-signal-interior-close'},location.origin);
function stick(e){const b=pad.getBoundingClientRect(),x=e.clientX-b.left-b.width/2,y=e.clientY-b.top-b.height/2,m=Math.max(1,Math.hypot(x,y)),r=Math.min(1,m/44);joy.x=x/m*r;joy.y=y/m*r;knob.style.transform='translate('+(joy.x*38)+'px,'+(joy.y*38)+'px)'}
pad.addEventListener('pointerdown',e=>{joy.id=e.pointerId;pad.setPointerCapture(e.pointerId);stick(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)stick(e)});function reset(e){if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;knob.style.transform=''}pad.addEventListener('pointerup',reset);pad.addEventListener('pointercancel',reset);
})();
