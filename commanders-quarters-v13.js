/* V13 — Commander's Quarters. Cosmetic-only, reads existing story progress. */
(function(w){
'use strict';
const KEY='towerDefenseCommanderQuartersV1';
const tr=(a,b)=>{try{return typeof getGameLanguage==='function'&&getGameLanguage()==='en'?b:a;}catch(_){return a;}};
const items=[
 {id:'signal',at:0,type:'wall',name:['Kayıp Sinyal Haritası','Lost Signal Map'],icon:'◈',desc:['İlk istasyon sinyalinin izleri.','Trace of the first station signal.']},
 {id:'medal',at:3,type:'shelf',name:['İlk Temas Madalyası','First Contact Medal'],icon:'✦',desc:['Üç görev tamamlandı.','Three missions completed.']},
 {id:'plant',at:6,type:'desk',name:['Yörünge Bitkisi','Orbital Plant'],icon:'♣',desc:['Altı görevin ardından istasyona hayat döndü.','Life returns after six missions.']},
 {id:'holo',at:9,type:'wall',name:['Holografik Yıldız Atlası','Holographic Star Atlas'],icon:'✧',desc:['Dokuz görevlik ilk bölüm.','The first nine missions.']},
 {id:'piko',at:12,type:'desk',name:["Piko'nun Hatırası","Piko's Keepsake"],icon:'◎',desc:['On ikinci görevin anısı.','A memento of mission twelve.']},
 {id:'trophy',at:18,type:'shelf',name:['İstasyon Muhafızı Kupası','Station Guardian Trophy'],icon:'⬡',desc:['On sekiz görevlik savunma.','Eighteen missions defended.']},
 {id:'core',at:21,type:'desk',name:['Reaktör Çekirdeği','Reactor Core'],icon:'◉',desc:['Yirmi birinci görevden kalan bir parça.','A relic from mission twenty-one.']},
 {id:'archive',at:27,type:'shelf',name:['Komutan Arşivi','Commander Archive'],icon:'▣',desc:['Tüm 27 görev tamamlandı.','All 27 missions complete.']}
];
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=new Set(items.map(x=>x.id));
function progress(){try{return typeof getStoryProgress==='function'?getStoryProgress():{};}catch(_){return {};}}
function completed(){const p=progress();return Array.from({length:27},(_,i)=>p['mission'+(i+1)+'Complete']===true).filter(Boolean).length;}
function unlocks(){const n=completed();return items.filter(x=>n>=x.at);}
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');const placed=Array.isArray(x.placed)?x.placed.filter(id=>valid.has(id)):[];return {placed:[...new Set(placed)].slice(0,items.length)};}catch(_){return {placed:[]};}}
function write(placed){try{localStorage.setItem(KEY,JSON.stringify({version:1,placed}));return true;}catch(_){return false;}}
let open=false,tab='room',notice='';
function lang(a){return tr(a[0],a[1]);}
function slotMarkup(item,owned,placed){const label=lang(item.name);return '<button type="button" class="cq-item'+(placed?' cq-placed':'')+'" data-cq-item="'+safe(item.id)+'" '+(!owned?'disabled':'')+' aria-pressed="'+placed+'"><span class="cq-icon" aria-hidden="true">'+item.icon+'</span><strong>'+safe(label)+'</strong><small>'+safe(owned?placed?tr('Kaldır','Remove'):tr('Yerleştir','Place'):tr('Görev '+item.at+' gerekli','Requires mission '+item.at))+'</small></button>';}
function paint(){
 const root=document.getElementById('cq-root');if(!root)return;root.hidden=!open;if(!open)return;
 const n=completed(),owned=new Set(unlocks().map(x=>x.id)),stored=read(),placed=stored.placed.filter(x=>owned.has(x));
 const stage=n>=27?3:n>=18?2:n>=9?1:0;
 const captions=[tr('SESSİZ İSTASYON','SILENT STATION'),tr('İLK IŞIKLAR','FIRST LIGHTS'),tr('YENİDEN CANLANIŞ','REVIVAL'),tr('KOMUTA ÜSSÜ','COMMAND BASE')];
 root.innerHTML='<div class="cq-backdrop" data-cq-close="1"></div><section class="cq-panel" role="dialog" aria-modal="true" aria-label="'+safe(tr('Komutanın Odası',"Commander's Quarters"))+'"><header><span>ARES-0 / '+safe(tr('ÖZEL BÖLME','PRIVATE QUARTERS'))+'</span><button type="button" data-cq-close="1" aria-label="'+safe(tr('Kapat','Close'))+'">✕</button></header><div class="cq-heading"><div><small>PERSONNEL DECK · 07</small><h2>'+safe(tr('KOMUTANIN ODASI',"COMMANDER'S QUARTERS"))+'</h2><p>'+safe(captions[stage])+' · '+n+'/27 '+safe(tr('görev','missions'))+'</p></div><div class="cq-progress"><span style="width:'+(n/27*100).toFixed(2)+'%"></span></div></div><nav><button data-cq-tab="room" aria-selected="'+(tab==='room')+'">'+safe(tr('ODA','ROOM'))+'</button><button data-cq-tab="collection" aria-selected="'+(tab==='collection')+'">'+safe(tr('KOLEKSİYON','COLLECTION'))+' · '+owned.size+'/'+items.length+'</button><button data-cq-tab="records" aria-selected="'+(tab==='records')+'">'+safe(tr('KAYITLAR','RECORDS'))+'</button></nav><main>'+ (tab==='room'?room(placed,stage):tab==='collection'?collection(owned,placed):records(n))+'</main><footer>'+safe(notice||tr('Yalnızca kozmetik · oyun gücü veya para kazandırmaz','Cosmetic only · no gameplay or currency advantages'))+'</footer></section>';
 root.querySelectorAll('[data-cq-close]').forEach(x=>x.addEventListener('click',close));
 root.querySelectorAll('[data-cq-tab]').forEach(x=>x.addEventListener('click',()=>{tab=x.dataset.cqTab;notice='';paint();}));
 root.querySelectorAll('[data-cq-item]').forEach(x=>x.addEventListener('click',()=>toggle(x.dataset.cqItem)));
}
function room(placed,stage){
 const at=slot=>placed.map(id=>items.find(x=>x.id===id)).filter(x=>x&&x.type===slot).map(x=>'<div class="cq-object" title="'+safe(lang(x.name))+'"><span>'+x.icon+'</span><small>'+safe(lang(x.name))+'</small></div>').join('');
 return '<div class="cq-room cq-stage-'+stage+'"><div class="cq-stars"></div><div class="cq-window"><div class="cq-planet"></div><span>ARES-0 · ORBITAL VIEW</span></div><div class="cq-wall cq-wall-left">'+at('wall')+'</div><div class="cq-shelf">'+at('shelf')+'</div><div class="cq-desk">'+at('desk')+'</div><div class="cq-chair"></div><div class="cq-floor"></div></div><p class="cq-hint">'+safe(tr('Koleksiyon sekmesinden dekorasyon yerleştir. Oda görevlerle gelişir.','Place decorations in Collection. The room evolves with missions.'))+'</p>';
}
function collection(owned,placed){return '<div class="cq-collection">'+items.map(x=>slotMarkup(x,owned.has(x.id),placed.includes(x.id))).join('')+'</div>';}
function records(n){
 const p=progress(),notes=[
 ['01',tr('İstasyona varış','Arrival at the station'),n>=1],
 ['09',tr('İlk bölümün sonu','End of the first chapter'),n>=9],
 ['18',tr('Derin sinyal','Deep signal'),n>=18],
 ['27',tr('Son kayıt','Final record'),n>=27],
 ['?',tr('Güç tercihi','Power decision'),!!p.powerChoice],
 ['?',tr('Rota tercihi','Route decision'),!!p.routeChoice]
 ];
 return '<div class="cq-records">'+notes.map(x=>'<div class="'+(x[2]?'':'cq-locked')+'"><span>LOG '+x[0]+'</span><strong>'+safe(x[2]?x[1]:tr('KİLİTLİ KAYIT','LOCKED RECORD'))+'</strong><small>'+safe(x[2]?tr('Kayıt kurtarıldı','Record recovered'):tr('Hikâyede ilerleyerek aç','Unlock through story progress'))+'</small></div>').join('')+'</div>';
}
function toggle(id){const item=items.find(x=>x.id===id);if(!item||completed()<item.at)return;const current=read().placed;const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];notice=write(next)?tr('Oda düzeni kaydedildi','Room layout saved'):tr('Tarayıcı depolaması kullanılamıyor','Browser storage unavailable');paint();}
function show(){open=true;tab='room';notice='';paint();}
function close(){open=false;const root=document.getElementById('cq-root');if(root){root.hidden=true;root.innerHTML='';}}
function mount(){
 if(document.getElementById('cq-root'))return;
 const root=document.createElement('div');root.id='cq-root';root.hidden=true;document.body.appendChild(root);
 const nav=document.querySelector('.mode-menu-tools');
 if(nav&&!document.getElementById('cq-launch')){const b=document.createElement('button');b.type='button';b.id='cq-launch';b.className='mode-menu-tool';b.innerHTML='<i class="fa-solid fa-door-open text-cyan-300" aria-hidden="true"></i><span class="mode-menu-tool-label">'+safe(tr('Komutanın Odası',"Quarters"))+'</span>';b.addEventListener('click',show);nav.appendChild(b);}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)close();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
w.TowerCommandersQuartersV13=Object.freeze({open:show,close,completed,unlocks,read});
})(window);
