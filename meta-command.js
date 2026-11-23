/* Landscape battle controls reuse the existing upgrade/combat functions. */
(function(){'use strict';
let bar,rail,skills,shelf,drawer,prestigePane,opened=false,holdTimer=0,heldAt=0,heldKey=null,lastStamp='',lastSeasonTier=null,workshopCategory='attack',workshopOpener=null;
const workshopRows=new Map();
const R=()=>window.MetaRuntime, fmt=v=>formatNumber(v), message=m=>window.MetaUI?.notify(m), t=k=>window.MetaStrings[k]||k;
const iconPaths={
 archive:'M5 4h14v16H5z M8 8h8 M8 12h6 M8 16h4 M3 7h2 M3 17h2',
 station:'M12 3 3 9v6l9 6 9-6V9z M3 9l9 6 9-6 M12 15v6 M8 6l8 5v7',
 event:'M4 18 9 13l4 2 7-10 M14 5h6v6 M4 4v4 M2 6h4',
 season:'M8 3h8l4 6-3 10-5 3-5-3L4 9z M8 3l4 8 4-8 M4 9l8 2 8-2 M12 11v11',
 supply:'M4 8h16v12H4z M7 8V4h10v4 M4 12h16 M10 12v3h4v-3',
 home:'M3 11 12 3l9 8 M5 10v10h14V10 M9 20v-6h6v6',
 settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 gold:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18 M12 7l4 5-4 5-4-5z',
 credit:'M4 7h16v10H4z M7 10h10 M7 14h4 M16 14h1',
 crystal:'m12 2 7 7-7 13L5 9z M5 9h14 M12 2 9 9l3 13 3-13z',
 power:'M14 2 5 13h6l-1 9 9-12h-6z',
 health:'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z M7 11h3l1-3 2 6 1-3h3',
 damage:'M5 18 9 14 M3 21l4-1-3-3z M9 14l8-10 4-1-1 4-10 8 M7 11l6 6',
 shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z M12 7v10 M8 12h8',
 pulse:'M3 12h4l2-7 5 14 3-7h4 M4 4h3 M17 20h3',
 slow:'M12 3a9 9 0 1 1-9 9 M3 3v5h5 M12 7v5l4 3',
 emp:'M4 12a8 8 0 1 1 16 0 M7 12a5 5 0 1 1 10 0 M12 10v11 M9 18l3 3 3-3',
 overload:'M12 3 5 7v10l7 4 7-4V7z M12 7v10 M8 10h8 M8 14h8',
 signal:'M3 9a12 12 0 0 1 18 0 M6 12a8 8 0 0 1 12 0 M9 15a4 4 0 0 1 6 0 M12 19v1',
 lock:'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z M12 14v3',
 boss:'M5 4 9 7h6l4-3 2 10-5 7H8l-5-7z M7 11l3 2 M17 11l-3 2 M10 17h4',
 tasks:'M7 4h13v17H4V7 M3 3l2 2 4-4 M8 10h8 M8 14h8 M8 18h5',
 upgrade:'M6 13 12 7l6 6 M12 7v14 M4 3h16',
 auto:'M7 4a9 9 0 1 1-4 8 M3 3v5h5 M12 7v5l3 2',
 pause:'M8 5v14 M16 5v14',play:'M8 4l12 8-12 8z',plus:'M12 6v12 M6 12h12',check:'m5 12 4 4L19 6'
};
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+(iconPaths[name]||iconPaths.pulse)+'"/></svg>';}
function upgradeMarkup(button,key,info){
 const label=UPGRADE_DEFS[key].name,price=info.maxed?'MAKS':fmt(info.totalCost),onShelf=button.closest('#meta-command-shelf');
 const stamp=key+':'+price+':'+!!onShelf+':'+!!info.maxed+':'+!!info.lockedReason;
 if(button.dataset.surface!==stamp){button.dataset.surface=stamp;button.innerHTML='<span class="command-upgrade-icon">'+(window.StationArt?.markup(key)||icon('upgrade'))+'</span><span class="command-upgrade-copy">'+(onShelf?'<span class="command-upgrade-name"></span>':'')+'<strong class="command-upgrade-price"></strong></span><span class="command-upgrade-arrow">'+icon(info.maxed?'check':info.lockedReason?'lock':'plus')+'</span>';if(onShelf)button.querySelector('.command-upgrade-name').textContent=window.MetaStrings.quickUpgradeNames[key]||label;const cost=button.querySelector('.command-upgrade-price');cost.innerHTML=(info.maxed?'':icon('gold'))+'<span></span>';cost.querySelector('span').textContent=price;}
 button.dataset.affordable=String(info.canAfford);button.disabled=!!(info.maxed||info.lockedReason);button.dataset.maxed=String(!!info.maxed);button.setAttribute('aria-label',label+' · '+price+' '+t('battleGold'));button.title=label+' · '+price;
}
function sectorBossState(descriptor,active){
 if(active)return 'active';
 if(!descriptor.bossWave)return 'waiting';
 const key=JSON.stringify([sectorBossOwner(),game.stats.prestiges,game.wave]);
 return sectorBossWaveKey===key?'cleared':'ready';
}
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
function refreshPrestige() {
 const pending = calculatePendingSouls();
 const summary = document.createElement('article');
 summary.className = 'workshop-prestige-card';
 const title = document.createElement('h3');
 title.textContent = fmt(game.souls) + ' Ruh Taşı';
 const description = document.createElement('p');
 description.textContent = pending > 0
  ? '+' + fmt(pending) + ' Ruh Taşı kazan. Dalga ' + getStartWaveLevel() + '’e dönersin; savaş altını ve geçici kule yükseltmeleri sıfırlanır.'
  : 'Prestij için Dalga ' + getMinPrestigeWave() + '’e ulaş.';
 const reset = btn('Prestij yap', openPrestigeConfirm);
 reset.disabled = pending <= 0;
 summary.append(title, description, reset);
 const cards = [summary];
 for (const [key, def] of Object.entries(PRESTIGE_DEFS)) {
  const level = game.prestigeUpgrades[key] || 0;
  const cost = Math.floor(def.baseCost * Math.pow(def.costScale, level));
  const card = document.createElement('article');
  card.className = 'workshop-prestige-card';
  const name = document.createElement('h3');
  name.textContent = def.name + ' · Sv. ' + level;
  const detail = document.createElement('p');
  detail.textContent = def.desc + ' · Şu an: ' + def.getEffectText(level);
  const purchase = btn(level >= def.maxLevel ? 'Son seviye' : fmt(cost) + ' Ruh Taşı', () => {
   buyPrestigeUpgrade(key);
   refresh(true);
  });
  purchase.disabled = level >= def.maxLevel || !Number.isFinite(cost) || game.souls < cost;
  card.append(name, detail, purchase);
  cards.push(card);
 }
 prestigePane.replaceChildren(...cards);
}
function chooseCategory(category) {
 workshopCategory = category;
 stop();
 prestigePane.hidden = category !== 'prestige';
 drawer.querySelector('.meta-upgrade-rows').hidden = category === 'prestige';
 drawer.querySelector('.workshop-multipliers').hidden = category === 'prestige';
 for (const row of workshopRows.values()) row.hidden = row.dataset.category !== category;
 drawer.querySelectorAll('[data-workshop-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.workshopCategory === category)));
 if (category === 'prestige') refreshPrestige();
}
function openUpgrades(){
 if(!drawer)return;opened=!opened;drawer.hidden=!opened;stop();
 document.body.classList.toggle('command-workshop-open',opened);
 if(opened){workshopOpener=document.activeElement;chooseCategory(workshopCategory);drawer.querySelector('[data-workshop-category="'+workshopCategory+'"]').focus();}
 else if(workshopOpener?.isConnected)workshopOpener.focus();
 if(typeof resizeCanvas==='function')resizeCanvas();refresh(true);
}
function refreshWorkshopRow(key,info){
 const row=workshopRows.get(key);if(!row)return;
 const def=UPGRADE_DEFS[key],level=game.upgrades[key],count=info.maxed?0:Math.max(1,info.count||1),target=Math.min(def.maxLevel,level+count);
 row.querySelector('.workshop-level').textContent=t('level')+' '+fmt(level);
 row.querySelector('.workshop-current').textContent=def.getValueText(level);
 row.querySelector('.workshop-next').textContent=info.maxed?t('maxLevel'):def.getValueText(target);
 row.querySelector('.workshop-gain').textContent=info.maxed?t('maxLevel'):info.lockedReason||'+'+count+' '+t('level');
 row.dataset.maxed=String(!!info.maxed);
}

function mount(){
 if(!document.getElementById('canvas-container'))return;
 bar=document.createElement('div');bar.id='meta-command-bar';
 const status=document.createElement('div');status.id='meta-command-status';
 status.innerHTML='<div class="signal-sector"><span class="command-sector-caption">'+t('sector')+'</span><strong id="signal-sector-label"></strong><span class="signal-stage-dots">'+Array.from({length:10},()=>'<i></i>').join('')+'</span></div><div class="signal-health"><span class="command-health-icon">'+icon('health')+'</span><span id="signal-health-label"></span><i id="signal-health-fill"></i></div>'+['gold','credit','crystal','power'].map((key,i)=>'<div class="signal-pill" data-currency="'+key+'"><span aria-hidden="true">'+icon(key)+'</span><b id="signal-'+key+'"></b></div>').join('');
 const speed=btn('1×',()=>{toggleGameSpeed();refresh(true);});speed.setAttribute('aria-label',t('speed'));
 const pause=btn('Ⅱ',()=>{togglePause();refresh(true);});
 const settings=btn('',()=>openSettingsModal());settings.innerHTML=icon('settings');settings.setAttribute('aria-label',t('settings'));
 const home = btn('', () => R().route('main'));
 home.className = 'command-main-menu';
 home.innerHTML = icon('home') + '<span>Ana Menü</span>';
 home.setAttribute('aria-label', 'Ana Menü');
 bar.append(status,speed,pause,settings,home);
 const progress=document.createElement('div');progress.id='signal-season-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label',t('season'));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');bar.append(progress);
 rail=document.createElement('nav');rail.id='meta-command-rail';rail.setAttribute('aria-label','Komuta şeridi');
 for(const [name,view]of[['Arşiv','archive'],['İstasyon','station'],['Sezon','season'],['Depo','supply']]){const b=btn(name,()=>R().route(view));b.dataset.view=view;b.innerHTML='<span class="command-nav-icon">'+icon(view)+'</span><span>'+name+'</span>';b.addEventListener('click',()=>{rail.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));});rail.append(b);}
 const shortcuts = document.createElement('div');
 shortcuts.id = 'meta-command-shortcuts';
 const sectorBoss = document.createElement('div');
 sectorBoss.id = 'signal-sector-boss';
 sectorBoss.innerHTML = icon('boss') + '<span></span>';
 shortcuts.append(sectorBoss);
 const raid = btn('', () => R().startEvent(R().eventBriefing().day));
 raid.className = 'command-raid';
 raid.innerHTML = icon('boss') + '<span>Günlük Akına Gir</span>';
 const tasks = btn('', () => R().route('tasks'));
 tasks.innerHTML = icon('tasks') + '<span>Görevler</span>';
 shortcuts.append(raid, tasks);
 skills = document.createElement('div');
 skills.id = 'meta-command-skills';
 skills.setAttribute('role', 'group');
 skills.setAttribute('aria-label', 'Savaş protokolleri');
 const configure = btn('', () => R().route('skills'));
 configure.className = 'command-protocols';
 configure.innerHTML = icon('settings') + '<span>Protokoller <small></small></span>';
 skills.append(configure);
 for (let i = 0; i < 6; i++) {
  const use = btn('', () => message(R().useSkill(i).message));
  use.dataset.skillSlot = i;
  use.hidden = true;
  skills.append(use);
 }
 const auto = btn('', () => {
  const result = R().action('autoSkills');
  message(result.message);
  refresh(true);
 });
 auto.innerHTML = icon('auto') + '<span>Otomatik</span>';
 skills.append(auto);
 shelf=document.createElement('div');shelf.id='meta-command-shelf';
 const allUpgrades=btn('',openUpgrades);allUpgrades.className='command-all-upgrades';allUpgrades.innerHTML=icon('upgrade')+'<span>'+t('upgrade')+'</span>';allUpgrades.setAttribute('aria-label',t('workshop'));shelf.append(upgradeButton('damage'),upgradeButton('maxHp'),allUpgrades);
 drawer=document.createElement('section');drawer.id='meta-command-upgrades';drawer.hidden=true;drawer.setAttribute('aria-label','Hızlı yükseltmeler');
 const head=document.createElement('header');head.className='workshop-header';
 const heading=document.createElement('div');heading.className='workshop-heading';heading.append(document.createElement('small'),document.createElement('strong'));heading.children[0].textContent=t('towerSystems');heading.children[1].textContent=t('workshop');
 const multipliers=document.createElement('div');multipliers.className='workshop-multipliers';for(const value of [1,10,'MAX']){const b=btn(value==='MAX'?'MAKS':'×'+value,()=>{setBuyMultiplier(value);refresh(true);});b.dataset.workshopMultiplier=String(value);multipliers.append(b);}
 const close=btn('',openUpgrades);close.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg>';close.className='workshop-close';close.setAttribute('aria-label',t('close'));head.append(heading,multipliers,close);
 const categories=document.createElement('nav');categories.className='workshop-categories';categories.setAttribute('aria-label',t('upgradeCategories'));
 for(const category of ['attack','defense','economy','prestige']){const b=btn(category==='prestige'?'Prestij':t(category),()=>chooseCategory(category));b.dataset.workshopCategory=category;categories.append(b);}
 const rows=document.createElement('div');rows.className='meta-upgrade-rows';
 for(const [key,def]of Object.entries(UPGRADE_DEFS)){
  const row=document.createElement('article');row.className='meta-upgrade-row workshop-card';row.dataset.category=def.category;row.dataset.upgradeRow=key;
  const art=document.createElement('div');art.className='workshop-art';art.setAttribute('aria-hidden','true');art.innerHTML=window.StationArt?.markup(key)||icon('upgrade');
  const copy=document.createElement('div');copy.className='workshop-copy';
  copy.innerHTML='<div class="workshop-name-line"><h3></h3><span class="workshop-level"></span></div><p class="workshop-description"></p><div class="workshop-preview"><span class="workshop-current"></span><span class="workshop-value-arrow" aria-hidden="true">→</span><strong class="workshop-next"></strong></div>';
  copy.querySelector('h3').textContent=def.name;copy.querySelector('p').textContent=def.desc;copy.querySelector('p').title=def.desc;
  const action=document.createElement('div');action.className='workshop-purchase';const gain=document.createElement('span');gain.className='workshop-gain';action.append(upgradeButton(key),gain);
  row.append(art,copy,action);rows.append(row);workshopRows.set(key,row);
 }
 prestigePane = document.createElement('section');
 prestigePane.className = 'workshop-prestige';
 prestigePane.setAttribute('aria-label', 'Prestij');
 drawer.append(head,categories,rows,prestigePane);document.body.append(bar,rail,shortcuts,skills,shelf,drawer);chooseCategory(workshopCategory);
 window.addEventListener('keydown',e=>{if(opened&&!e.defaultPrevented&&e.key==='Escape'&&!document.querySelector('dialog[open], #confirm-modal:not(.hidden)')&&!document.body.classList.contains('signal-settings-open')){e.preventDefault();openUpgrades();}});
 window.addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);
 document.addEventListener('click',e=>{if(e.target.closest('button')?.closest('#meta-center,#meta-overlay,#meta-command-rail,#meta-command-bar,#meta-command-skills,.signal-settings')){window.Fx?.haptic?.(8);window.TowerCommandSounds?.play('tap');}},{passive:true});
 document.addEventListener('meta-state-changed',()=>refresh(true));window.setInterval(refresh,250);refresh(true);
}
function refresh(force=false){
 if(!bar||typeof game==='undefined'||!R())return;
 const active=matchMedia('(orientation:landscape)').matches&&document.body.dataset.gameMode!=='story'&&!window.GameModeRuntime?.isStoryActive()&&document.getElementById('mode-main-menu')?.classList.contains('menu-hidden');
 document.body.classList.toggle('meta-command-active',!!active);
 if(!active){document.body.removeAttribute('data-health-low');if(opened){opened=false;drawer.hidden=true;document.body.classList.remove('command-workshop-open');resizeCanvas();}stop();return;}
 R().prepare();const m=R().getState();
 const wave=game.wave,sector=Math.ceil(wave/10),step=(wave-1)%10+1;
 const descriptor=EndlessSectors.describe(wave), bossActive=typeof enemies!=='undefined'&&enemies.some(e=>e.type==='boss'&&e.hp>0);
 const sectorLabel=document.getElementById('signal-sector-label');sectorLabel.textContent=sector+' · '+step+'/10';sectorLabel.title=descriptor.name+' · '+(bossActive?t('bossActive'):descriptor.bossName);
 const dots=document.querySelectorAll('.signal-stage-dots i');dots.forEach((dot,i)=>{dot.dataset.state=i+1<step?'done':i+1===step?'current':'next';dot.dataset.boss=String(i===4||i===9);});
 document.querySelector('.signal-sector').dataset.boss = String(bossActive);
 const bossStatus = document.getElementById('signal-sector-boss');
 const bossState = sectorBossState(descriptor, bossActive);
 const bossText = {active:'Sahada',cleared:'Yenildi',ready:'Geliyor',waiting:descriptor.remaining + ' dalga'};
 bossStatus.dataset.state = bossState;
 bossStatus.querySelector('span').textContent = 'Sektör Boss’u · ' + bossText[bossState];
 const raid = document.querySelector('.command-raid span');
 const result = window.EndlessOperations.read().rush;
 raid.textContent = result?.day === MetaModel.localDay(Date.now()) && result.result ? 'Akın Sonucu' : 'Günlük Akına Gir';
 const hp=Math.max(0,Math.min(1,tower.hp/Math.max(1,tower.maxHp)));document.body.dataset.healthLow=String(hp<.25&&!isDefeated);document.getElementById('signal-health-label').textContent=(hp<.25?'! ':'')+fmt(tower.hp);document.getElementById('signal-health-fill').style.width=hp*100+'%';document.querySelector('.signal-health').dataset.low=String(hp<.25);
 for(const [key,value,label]of[['gold',window.Fx?.displayValue?.('gold',game.gold)??game.gold,t('battleGold')],['credit',m.currencies.kredi,t('kredi')],['crystal',m.currencies.kristal,t('kristal')],['power',getTowerDamage(),t('power')]]){const el=document.getElementById('signal-'+key),next=fmt(value);if(el.textContent!==next){el.textContent=next;if(!window.Fx?.settings().reduced)el.animate?.([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:120});}el.parentElement.setAttribute('aria-label',label+' '+next);el.parentElement.title=label;}
 const xp=Math.min(100,m.season.xp/(MetaConfig.season.tiers*MetaConfig.season.xpPerTier)*100);const progress=document.getElementById('signal-season-progress');progress.style.setProperty('--season-progress',xp+'%');progress.setAttribute('aria-valuenow',String(Math.round(xp)));const seasonTier=Math.floor(m.season.xp/MetaConfig.season.xpPerTier);if(lastSeasonTier!==null&&seasonTier>lastSeasonTier){window.Fx?.haptic?.(20);window.TowerCommandSounds?.play('discover');if(!window.Fx?.settings().reduced)progress.animate?.([{filter:'brightness(2)'},{filter:'brightness(1)'}],{duration:400});}lastSeasonTier=seasonTier;
 bar.children[1].textContent=gameSpeed+'×';if(bar.children[2].dataset.paused!==String(isPaused)){bar.children[2].dataset.paused=String(isPaused);bar.children[2].innerHTML=icon(isPaused?'play':'pause');}bar.children[2].setAttribute('aria-label',isPaused?t('resume'):t('pause'));bar.children[2].setAttribute('aria-pressed',String(isPaused));
 const stamp=game.gold+':'+JSON.stringify(game.upgrades)+':'+buyMultiplier;
 if(force===true||stamp!==lastStamp){lastStamp=stamp;
  const offers=new Map(Object.keys(UPGRADE_DEFS).map(k=>[k,getBulkUpgradeInfo(k)]));
  const cheapest=[...offers.keys()].filter(k=>!offers.get(k).maxed&&!offers.get(k).lockedReason).sort((a,b)=>offers.get(a).totalCost-offers.get(b).totalCost).slice(0,2);
  // Rebind only when not holding: a pointer's target must stay stable until release.
  if(!heldKey)for(let i=0;i<2;i++){const b=shelf.children[i],key=cheapest[i];if(key&&b.dataset.upgrade!==key)b.replaceWith(upgradeButton(key));}
  document.querySelectorAll('[data-upgrade]').forEach(b=>{const key=b.dataset.upgrade,info=offers.get(key);upgradeMarkup(b,key,info);});
  for(const [key,info]of offers)refreshWorkshopRow(key,info);
  drawer.querySelectorAll('[data-workshop-multiplier]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workshopMultiplier===String(buyMultiplier))));
 }
 let equipped = 0;
 m.archive.skillSlots.forEach((id, i) => {
  const button = skills.querySelector('[data-skill-slot="' + i + '"]');
  const item = MetaConfig.skills.find(skill => skill.id === id);
  button.hidden = !item || (m.offline.cleared || 0) < MetaConfig.skillUnlockSectors[i];
  if (button.hidden) return;
  equipped++;
  const left = Math.ceil(R().cooldown(i));
  const status = left > 0 ? left + ' sn' : 'Hazır';
  if (button.dataset.surface !== item.id + ':' + status) {
   button.dataset.surface = item.id + ':' + status;
   button.innerHTML = (window.StationArt?.markup(item.id) || icon('pulse')) + '<span></span>';
   button.querySelector('span').textContent = item.name + ' · ' + status;
   button.setAttribute('aria-label', item.name + ' · ' + status);
  }
  button.dataset.state = left > 0 ? 'cooldown' : 'ready';
  button.style.setProperty('--ready', Math.max(0, 1 - left / item.cooldown) * 100 + '%');
 });
 skills.querySelector('.command-protocols small').textContent = equipped ? equipped + ' takılı' : 'Protokol tak';
 const auto = skills.lastElementChild;
 auto.hidden = !equipped;
 auto.setAttribute('aria-pressed', String(m.autoSkills));
 if (opened && workshopCategory === 'prestige') {
  const prestigeStamp = JSON.stringify([game.wave, game.souls, game.prestigeUpgrades]);
  if (prestigePane.dataset.stamp !== prestigeStamp) {
   prestigePane.dataset.stamp = prestigeStamp;
   refreshPrestige();
  }
 }
 rail.querySelector('[data-view="archive"]').dataset.badge=String(Object.entries(m.archive.equipment).some(([id,v])=>v.level&&(!v.seen||v.copies>=MetaConfig.equipment.find(x=>x.id===id).fuseCopies)));
 rail.querySelector('[data-view="supply"]').dataset.badge=String(m.offline.pending>0||R().pending().length>0);
 rail.querySelector('[data-view="season"]').dataset.badge=String(Math.floor(m.season.xp/MetaConfig.season.xpPerTier)>m.season.claimed);
}
window.MetaCommand={openUpgrades,refresh};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
