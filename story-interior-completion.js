/* Mission completion bridge. Shared by all top-down story episodes. */
(()=>{'use strict';
let awaiting=false;
const button=()=>document.getElementById('done')||document.getElementById('complete');
function status(text){let el=document.getElementById('mission-save-status');
if(!el){el=document.createElement('p');el.id='mission-save-status';el.setAttribute('role','status');document.getElementById('panel')?.appendChild(el)}
el.textContent=text;
}
function submit(payload){
 const btn=button();
 if(!btn||awaiting)return;
 awaiting=true;btn.disabled=true;btn.textContent='KAYDEDİLİYOR…';status('İlerlemen kaydediliyor.');
 try{window.parent.postMessage(payload,location.origin)}
 catch(error){console.error('Story completion message failed',error);retry();return}
 setTimeout(()=>{if(!awaiting)return;retry()},2500);
}
function retry(){
 awaiting=false;const btn=button();
 if(btn){btn.disabled=false;btn.textContent='KAYDI TEKRAR DENE'}
 status('Onay alınamadı. Tekrar deneyebilir veya kayıt olmadan çıkabilirsin.');
 const panel=document.getElementById('panel');
 if(panel&&!document.getElementById('story-finish-exit')){
  const exit=document.createElement('button');exit.id='story-finish-exit';exit.textContent='KAYDETMEDEN ÇIK';
  exit.onclick=()=>window.parent.postMessage({type:'lost-signal-interior-close'},location.origin);panel.appendChild(exit);
 }
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent||!event.data)return;
 const type=event.data.type;
 if(type==='lost-signal-interior-save-failed'){retry();return}
 if(type==='lost-signal-interior-save-confirmed'){
  awaiting=false;const btn=button();if(btn){btn.disabled=true;btn.textContent='KAYDEDİLDİ ✓'}
  const args = new URLSearchParams(location.search);
  const start = Number(args.get('episode') || 0);
  const stage = Number(args.get('mission') || 1);
  status(start && stage < start + 2
    ? 'Ara kayıt doğrulandı. Sıradaki aşamaya geçebilirsin.'
    : 'Kayıt doğrulandı. Görev panosuna dönülüyor.');
 }
});
window.StoryInteriorCompletion={submit};
})();