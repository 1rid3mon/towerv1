/* LOST SIGNAL V9: station records inside the existing V5 Threat Archive. */
(function (root) {
 'use strict';
 if (root.LostSignalStationRecordsV9) return;
 const KEY='towerV1LostSignalStationRecordsV9';
 const RECORDS=Object.freeze([
  {wave:1,id:'boot',title:'KAYIT 001 · İLK NÖBET',body:'İstasyon çevresindeki otomatik nöbetçiler son emirlerini bekliyor. Kontrol kanalı sessiz.'},
  {wave:15,id:'red',title:'KAYIT 014 · KIRMIZI HAT',body:'Dış savunma hattı yeni işaretler algıladı. Kaynak bilinmiyor; sinyal tekrar ediyor.'},
  {wave:30,id:'cold',title:'KAYIT 027 · SOĞUK İZ',body:'Termal sensörler beklenmedik biçimde düştü. Bakım ekibinin son mesajı yarım kaldı.'},
  {wave:45,id:'dust',title:'KAYIT 039 · TOZ PERDESİ',body:'Gözlem penceresinde yalnızca kızıl parazit var. Antenler aynı koordinatı işaret ediyor.'},
  {wave:60,id:'deep',title:'KAYIT 052 · DERİN FREKANS',body:'Bilinen bantların dışında düzenli bir atım tespit edildi. Kimse sinyalin kaynağını doğrulayamadı.'},
  {wave:100,id:'color',title:'KAYIT 088 · YANKI',body:'Sinyal artık tek bir renkte görünmüyor. Eski kayıtlar yeniden çözümlenmeyi bekliyor.'}
 ]);
 let unlocked={};
 try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))unlocked=value;}catch(_){/* private mode */}
 function unlock(wave){if(!Number.isFinite(wave)||wave<1)return;let changed=false;for(const rec of RECORDS){if(wave>=rec.wave&&!unlocked[rec.id]){unlocked[rec.id]=true;changed=true;}}if(changed){try{localStorage.setItem(KEY,JSON.stringify(unlocked));}catch(_){}}}
 function highest(){const g=typeof game!=='undefined'?game:null;return Math.max(1,Number(g?.highestWave)||1,Number(g?.wave)||1);}
 function render(){const panel=document.getElementById('ls-archive-content');if(!panel)return;unlock(highest());let section=document.getElementById('ls-v9-records');if(!section){section=document.createElement('section');section.id='ls-v9-records';section.className='ls-family';panel.parentNode.appendChild(section);}section.replaceChildren();const title=document.createElement('h3');title.textContent='KAYIP İSTASYON KAYITLARI';section.appendChild(title);const hint=document.createElement('p');hint.textContent='Kayıtlar ulaşılan dalgaya göre açılır. Hikâye görevlerini değiştirmez.';section.appendChild(hint);for(const rec of RECORDS){const item=document.createElement('details');item.className='ls-v9-record';const summary=document.createElement('summary');summary.textContent=unlocked[rec.id]?rec.title:'KİLİTLİ KAYIT · DALGA '+rec.wave;item.appendChild(summary);if(unlocked[rec.id]){const body=document.createElement('p');body.textContent=rec.body;item.appendChild(body);}else{item.removeAttribute('open');summary.setAttribute('aria-disabled','true');summary.addEventListener('click',event=>event.preventDefault());}section.appendChild(item);}}
 function boot(){if(!root.LostSignalAtmosphereV5){return;}const orig=root.LostSignalAtmosphereV5.openArchive;if(typeof orig==='function'&&!orig.__lsV9){const next=function(...args){const result=orig.apply(this,args);render();return result;};next.__lsV9=true;root.LostSignalAtmosphereV5.openArchive=next;
 // V5's existing menu listener closes over its original function, so observe modal opening.
 const modal=document.getElementById('ls-archive');if(modal){const observer=new MutationObserver(()=>{if(modal.classList.contains('ls-open'))render();});observer.observe(modal,{attributes:true,attributeFilter:['class']});}}
 unlock(highest());}
 root.LostSignalStationRecordsV9={RECORDS,unlock,render,getUnlocked:()=>({...unlocked})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
