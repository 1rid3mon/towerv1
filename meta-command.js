/* Landscape battle controls reuse the existing upgrade/combat functions. */
(function(){'use strict';
let bar,rail,skills,shelf,drawer,opened=false,holdTimer=0,heldAt=0,heldKey=null,lastStamp='';
const R=()=>window.MetaRuntime, fmt=v=>formatNumber(v), message=m=>window.MetaUI?.notify(m), t=k=>window.MetaStrings[k]||k;
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+({archive:'M4 5h16v14H4z M8 9h8 M8 13h5',station:'M3 11l9-8 9 8 M6 10v11h12V10 M10 21v-7h4v7',event:'M3 17l5-5 4 2 8-10 M14 4h6v6',season:'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',supply:'M3 7l9-4 9 4v13H3z M3 7l9 5 9-5 M12 12v8',settings:'M5 5l14 14 M19 5L5 19 M12 3v18 M3 12h18'})[name]+'"/></svg>';}
function btn(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b;}
function stop(){clearTimeout(holdTimer);heldKey=null;}
function buy(key){
 const before=game.upgrades[key],info=getBulkUpgradeInfo(key);
 if(info.lockedReason||info.maxed||!info.canAfford){message(info.lockedReason|| (info.maxed?'Son seviyeye ulaştın.':'✕ Yeterli savaş altını yok.'));window.Fx?.haptic?.(20);if(!window.Fx?.settings().reduced)document.querySelectorAll('[data-upgrade="'+key+'"]').forEach(b=>b.animate?.([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:140}));stop();return;}
 const value=UPGRADE_DEFS[key].getValueText(before);buyUpgrade(key);
 if(game.upgrades[key]>before){message(value+' → '+UPGRADE_DEFS[key].getValueText(game.upgrades[key]));window.Fx?.haptic?.(12);window.TowerCommandSounds?.play('confirm');}
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
 status.innerHTML='<div class="signal-sector"><strong id="signal-sector-label"></strong><span class="signal-stage-dots">'+Array.from({length:10},()=>'<i></i>').join('')+'</span></div><div class="signal-health"><span id="signal-health-label"></span><i id="signal-health-fill"></i></div>'+['gold','credit','crystal','power'].map((key,i)=>'<div class="signal-pill" data-currency="'+key+'"><span aria-hidden="true">'+['◉','▰','◇','ϟ'][i]+'</span><b id="signal-'+key+'"></b></div>').join('');
 const speed=btn('1×',()=>{toggleGameSpeed();refresh(true);});speed.setAttribute('aria-label',t('speed'));
 const pause=btn('Ⅱ',()=>{togglePause();refresh(true);});
 const settings=btn('',()=>openSettingsModal());settings.innerHTML=icon('settings');settings.setAttribute('aria-label',t('settings'));
 bar.append(status,speed,pause,settings);
 const progress=document.createElement('div');progress.id='signal-season-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label',t('season'));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');bar.append(progress);
 rail=document.createElement('nav');rail.id='meta-command-rail';rail.setAttribute('aria-label','Komuta şeridi');
 for(const [name,view]of[['Arşiv','archive'],['İstasyon','station'],['Sefer','event'],['Sezon','season'],['Depo','supply']]){const b=btn(name,()=>R().route(view));b.dataset.view=view;b.innerHTML=icon(view)+'<span>'+name+'</span>';rail.append(b);}
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
 const active=matchMedia('(orientation:landscape)').matches&&document.body.dataset.gameMode!=='story'&&!window.GameModeRuntime?.isStoryActive()&&document.getElementById('mode-main-menu')?.classList.contains('menu-hidden');
 document.body.classList.toggle('meta-command-active',!!active);
 const tactics = document.getElementById('endless-tactics');
 const tacticsHost = active ? bar : document.getElementById('hud-top-bar');
 if(tactics && tacticsHost && tactics.parentElement!==tacticsHost)tacticsHost.append(tactics);
 if(!active){document.body.removeAttribute('data-health-low');stop();return;}
 R().prepare();const m=R().getState();
 const wave=game.wave,sector=Math.ceil(wave/10),step=(wave-1)%10+1;
 const descriptor=EndlessSectors.describe(wave), bossActive=typeof enemies!=='undefined'&&enemies.some(e=>e.type==='boss'&&e.hp>0);
 const sectorLabel=document.getElementById('signal-sector-label');sectorLabel.textContent=sector+' · '+step+'/10';sectorLabel.title=descriptor.name+' · '+(bossActive?t('bossActive'):descriptor.bossName);
 const dots=document.querySelectorAll('.signal-stage-dots i');dots.forEach((dot,i)=>{dot.dataset.state=i+1<step?'done':i+1===step?'current':'next';dot.dataset.boss=String(i===4||i===9);});
 document.querySelector('.signal-sector').dataset.boss=String(bossActive);
 const hp=Math.max(0,Math.min(1,tower.hp/Math.max(1,tower.maxHp)));document.body.dataset.healthLow=String(hp<.25&&!isDefeated);document.getElementById('signal-health-label').textContent=(hp<.25?'! ':'♥ ')+fmt(tower.hp);document.getElementById('signal-health-fill').style.width=hp*100+'%';document.querySelector('.signal-health').dataset.low=String(hp<.25);
 for(const [key,value,label]of[['gold',window.Fx?.displayValue?.('gold',game.gold)??game.gold,t('battleGold')],['credit',m.currencies.kredi,t('kredi')],['crystal',m.currencies.kristal,t('kristal')],['power',getTowerDamage(),t('power')]]){const el=document.getElementById('signal-'+key),next=fmt(value);if(el.textContent!==next){el.textContent=next;if(!window.Fx?.settings().reduced)el.animate?.([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:120});}el.parentElement.setAttribute('aria-label',label+' '+next);el.parentElement.title=label;}
 const xp=Math.min(100,m.season.xp/(MetaConfig.season.tiers*MetaConfig.season.xpPerTier)*100);const progress=document.getElementById('signal-season-progress');progress.style.setProperty('--season-progress',xp+'%');progress.setAttribute('aria-valuenow',String(Math.round(xp)));
 bar.children[1].textContent=gameSpeed+'×';bar.children[2].textContent=isPaused?'▶':'Ⅱ';bar.children[2].setAttribute('aria-label',isPaused?t('resume'):t('pause'));bar.children[2].setAttribute('aria-pressed',String(isPaused));
 const stamp=game.gold+':'+JSON.stringify(game.upgrades)+':'+buyMultiplier;
 if(force===true||stamp!==lastStamp){lastStamp=stamp;
  const cheapest=Object.keys(UPGRADE_DEFS).filter(k=>!getBulkUpgradeInfo(k).maxed&&!getBulkUpgradeInfo(k).lockedReason).sort((a,b)=>getBulkUpgradeInfo(a).totalCost-getBulkUpgradeInfo(b).totalCost).slice(0,2);
  // Rebind only when not holding: a pointer's target must stay stable until release.
  if(!heldKey)for(let i=0;i<2;i++){const b=shelf.children[i],key=cheapest[i];if(key&&b.dataset.upgrade!==key)b.replaceWith(upgradeButton(key));}
  document.querySelectorAll('[data-upgrade]').forEach(b=>{const key=b.dataset.upgrade,info=getBulkUpgradeInfo(key);b.textContent=(b.closest('#meta-command-shelf')?UPGRADE_DEFS[key].name+' ':'')+(info.maxed?'MAKS':(info.canAfford?'+ ':'✕ ')+fmt(info.totalCost));b.dataset.affordable=String(info.canAfford);});
  document.querySelectorAll('[data-label]').forEach(e=>{const k=e.dataset.label;e.textContent=UPGRADE_DEFS[k].name+' · Sv.'+game.upgrades[k]+' · '+UPGRADE_DEFS[k].getValueText(game.upgrades[k]);});
 }
 m.archive.skillSlots.forEach((id,i)=>{const b=skills.children[i],item=MetaConfig.skills.find(x=>x.id===id),left=R().cooldown(i);const unlock=MetaConfig.skillUnlockSectors[i];b.textContent=item?(left>0?Math.ceil(left)+'sn':['ϟ','◎','◈','⊙','↟','✧'][i]):(sector<unlock?'▴ '+t('sector')+' '+unlock:'＋');b.title=item?.name||t('emptySlot');b.style.setProperty('--ready',item?((1-left/item.cooldown)*100)+'%':'0%');b.setAttribute('aria-label',item?item.name+' '+(left>0?'Yeniden doluyor':'Hazır'):'Protokol yuvası '+(i+1));});skills.lastElementChild.setAttribute('aria-pressed',String(m.autoSkills));
 rail.querySelector('[data-view="archive"]').dataset.badge=String(Object.entries(m.archive.equipment).some(([id,v])=>v.level&&(!v.seen||v.copies>=MetaConfig.equipment.find(x=>x.id===id).fuseCopies)));
 rail.querySelector('[data-view="supply"]').dataset.badge=String(m.offline.pending>0||R().pending().length>0);
 rail.querySelector('[data-view="season"]').dataset.badge=String(Math.floor(m.season.xp/MetaConfig.season.xpPerTier)>m.season.claimed);
}
window.MetaCommand={openUpgrades,refresh};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
