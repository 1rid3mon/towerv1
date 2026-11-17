/* Landscape battle controls reuse the existing upgrade/combat functions. */
(function(){'use strict';
let bar,rail,skills,shelf,drawer,opened=false,holdTimer=0,heldAt=0,heldKey=null,lastStamp='';
const R=()=>window.MetaRuntime, fmt=v=>formatNumber(v), message=m=>window.MetaUI?.notify(m);
function btn(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b;}
function stop(){clearTimeout(holdTimer);heldKey=null;}
function buy(key){
 const before=game.upgrades[key],info=getBulkUpgradeInfo(key);
 if(info.lockedReason||info.maxed||!info.canAfford){message(info.lockedReason|| (info.maxed?'Son seviyeye ulaştın.':'✕ Yeterli savaş altını yok.'));stop();return;}
 const value=UPGRADE_DEFS[key].getValueText(before);buyUpgrade(key);
 if(game.upgrades[key]>before)message(value+' → '+UPGRADE_DEFS[key].getValueText(game.upgrades[key]));
 refresh(true);
}
function repeat(){if(!heldKey)return;buy(heldKey);if(heldKey)holdTimer=setTimeout(repeat,performance.now()-heldAt>=1000?60:120);}
function upgradeButton(key){
 const b=btn('',()=>buy(key));b.dataset.upgrade=key;
 b.addEventListener('pointerdown',e=>{if(e.button!==0)return;stop();heldKey=key;heldAt=performance.now();b.setPointerCapture(e.pointerId);holdTimer=setTimeout(repeat,350);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,stop);
 return b;
}
function openUpgrades(){opened=!opened;drawer.hidden=!opened;stop();refresh(true);}
function mount(){
 if(!document.getElementById('canvas-container'))return;
 bar=document.createElement('div');bar.id='meta-command-bar';
 const status=document.createElement('div');status.id='meta-command-status';
 bar.append(status,btn('1×',()=>{toggleGameSpeed();refresh(true);}),btn('Duraklat',()=>{togglePause();refresh(true);}),btn('Menü',()=>window.MetaUI.open('menu')));
 rail=document.createElement('nav');rail.id='meta-command-rail';rail.setAttribute('aria-label','Komuta şeridi');
 for(const [name,view]of[['Arşiv','archive'],['İstasyon','station'],['Sefer','event'],['Sezon','season'],['Depo','supply']]){const b=btn(name,()=>R().route(view));b.dataset.view=view;rail.append(b);}
 const shortcuts = document.createElement('div');
 shortcuts.id = 'meta-command-shortcuts';
 shortcuts.append(btn('Boss Akını', () => R().route('boss')), btn('Görevler', () => R().route('tasks')));
 skills=document.createElement('div');skills.id='meta-command-skills';
 for(let i=0;i<6;i++){const b=btn(String(i+1),()=>{const r=R().useSkill(i);message(r.message);});b.setAttribute('aria-label','Protokol yuvası '+(i+1));skills.append(b);}
 skills.append(btn('OTO',()=>{const r=R().action('autoSkills');message(r.message);refresh(true);}));
 shelf=document.createElement('div');shelf.id='meta-command-shelf';
 shelf.append(upgradeButton('damage'),upgradeButton('maxHp'),btn('Yükselt',openUpgrades));
 drawer=document.createElement('section');drawer.id='meta-command-upgrades';drawer.hidden=true;drawer.setAttribute('aria-label','Hızlı yükseltmeler');
 const head=document.createElement('header');for(const value of [1,10,'MAX'])head.append(btn(value==='MAX'?'MAKS':'×'+value,()=>{setBuyMultiplier(value);refresh(true);}));head.append(btn('Kapat',openUpgrades));
 const rows=document.createElement('div');rows.className='meta-upgrade-rows';
 for(const [key,def]of Object.entries(UPGRADE_DEFS)){const row=document.createElement('div'),label=document.createElement('span');row.className='meta-upgrade-row';label.dataset.label=key;label.textContent=def.name;row.append(label,upgradeButton(key));rows.append(row);}
 drawer.append(head,rows);document.body.append(bar,rail,shortcuts,skills,shelf,drawer);
 window.addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);
 document.addEventListener('meta-state-changed',()=>refresh(true));window.setInterval(refresh,250);refresh(true);
}
function refresh(force=false){
 if(!bar||typeof game==='undefined'||!R())return;
 const active=matchMedia('(orientation:landscape)').matches&&document.body.dataset.gameMode!=='story'&&!window.GameModeRuntime?.isStoryActive()&&document.getElementById('mode-main-menu')?.classList.contains('hidden');
 document.body.classList.toggle('meta-command-active',!!active);
 if(!active){stop();return;}
 R().prepare();const m=R().getState();
 const wave=game.wave,sector=Math.ceil(wave/10),step=(wave-1)%10+1;
 document.getElementById('meta-command-status').textContent='SEKTÖR '+sector+' · '+step+'/10  |  CAN '+fmt(tower.hp)+'  |  '+fmt(game.gold)+' Altın  |  '+fmt(m.currencies.kredi)+' Kredi  |  '+fmt(m.currencies.kristal)+' Kristal  |  Güç '+fmt(getTowerDamage());
 bar.children[1].textContent=gameSpeed+'×';bar.children[2].textContent=isPaused?'Devam':'Duraklat';bar.children[2].setAttribute('aria-pressed',String(isPaused));
 const stamp=game.gold+':'+JSON.stringify(game.upgrades)+':'+buyMultiplier;
 if(force===true||stamp!==lastStamp){lastStamp=stamp;
  const cheapest=Object.keys(UPGRADE_DEFS).filter(k=>!getBulkUpgradeInfo(k).maxed&&!getBulkUpgradeInfo(k).lockedReason).sort((a,b)=>getBulkUpgradeInfo(a).totalCost-getBulkUpgradeInfo(b).totalCost).slice(0,2);
  // Rebind only when not holding: a pointer's target must stay stable until release.
  if(!heldKey)for(let i=0;i<2;i++){const b=shelf.children[i],key=cheapest[i];if(key&&b.dataset.upgrade!==key)b.replaceWith(upgradeButton(key));}
  document.querySelectorAll('[data-upgrade]').forEach(b=>{const key=b.dataset.upgrade,info=getBulkUpgradeInfo(key);b.textContent=(b.closest('#meta-command-shelf')?UPGRADE_DEFS[key].name+' ':'')+(info.maxed?'MAKS':(info.canAfford?'+ ':'✕ ')+fmt(info.totalCost));b.dataset.affordable=String(info.canAfford);});
  document.querySelectorAll('[data-label]').forEach(e=>{const k=e.dataset.label;e.textContent=UPGRADE_DEFS[k].name+' · Sv.'+game.upgrades[k]+' · '+UPGRADE_DEFS[k].getValueText(game.upgrades[k]);});
 }
 m.archive.skillSlots.forEach((id,i)=>{const b=skills.children[i],item=MetaConfig.skills.find(x=>x.id===id),left=R().cooldown(i);b.textContent=item?(left>0?Math.ceil(left)+'sn':item.name):'+';b.style.setProperty('--ready',item?((1-left/item.cooldown)*100)+'%':'0%');b.setAttribute('aria-label',item?item.name+' '+(left>0?'Yeniden doluyor':'Hazır'):'Protokol yuvası '+(i+1));});skills.lastElementChild.setAttribute('aria-pressed',String(m.autoSkills));
 rail.querySelector('[data-view="archive"]').dataset.badge=String(Object.entries(m.archive.equipment).some(([id,v])=>v.level&&(!v.seen||v.copies>=MetaConfig.equipment.find(x=>x.id===id).fuseCopies)));
 rail.querySelector('[data-view="supply"]').dataset.badge=String(m.offline.pending>0||R().pending().length>0);
 rail.querySelector('[data-view="season"]').dataset.badge=String(Math.floor(m.season.xp/MetaConfig.season.xpPerTier)>m.season.claimed);
}
window.MetaCommand={openUpgrades,refresh};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
