/* Native, keyboard-accessible landscape meta interface. Gameplay lives in MetaRuntime. */
(function(){'use strict';
let dialog,overlay,body,footer,nav,wallet,title,view='menu',type='equipment',selected=null,slot=0,returnDay=1,oldOverflow='',toastTimer,seasonPreviewTimer,suppressPop=0,historySerial=0;
let lastActionRect;
const colors=['#9aa7ad','#4fbf8a','#4a9be8','#a66bf0','#f0a23a','#5fe6d4','#e5544d','#f5d36b'];
const S=()=>window.MetaStrings||{},C=()=>window.MetaConfig||{},R=()=>window.MetaRuntime,t=k=>S()[k]||k;
const n=v=>typeof formatNumber==='function'?formatNumber(v??0):String(v??0);
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=text;if(cls)e.className=cls;return e;}
function button(text,fn,cls){const b=el('button',text,cls);b.type='button';b.onclick=e=>{lastActionRect=b.getBoundingClientRect();fn(e);};return b;}
function state(){return R()?.getState?.()||{};}function legacy(){return R()?.getLegacy?.()||state().legacy||{};}
function notify(message){mount();const e=document.getElementById('meta-toast');(overlay?.open?overlay:dialog?.open?dialog:document.body).append(e);e.textContent=message||t('failed');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.textContent='',2200);}
function glyph(item,kind){
 const e=el('span',null,'meta-glyph');e.setAttribute('aria-hidden','true');e.style.setProperty('--rarity',colors[item?.rarity||0]);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 48 48');svg.setAttribute('width','48');svg.setAttribute('height','48');
 const paths=kind==='skills'?['M24 5 9 26h13l-2 17 19-25H26z','M24 5 8 12v14l16 16 16-16V12z','M8 24h32M24 8v32M12 12l24 24M12 36l24-24']:['M20 8h8v23h-8zM16 31h16v9H16zM16 14h16M21 4h6','M12 13h24v22H12zM18 7h12v6M18 35v6h12v-6M18 20h12v8H18z','M8 24 24 8l16 16-16 16zM17 24l7-7 7 7-7 7z'];
 const seed=String(item?.id||'').split('').reduce((sum,c)=>sum+c.charCodeAt(0),0),path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[seed%paths.length]);path.setAttribute('fill','currentColor');path.setAttribute('fill-opacity','.15');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');path.setAttribute('stroke-linejoin','round');svg.append(path);e.append(svg);return e;
}
function motionReduced(){const reduced=window.Fx?.settings().reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.metaReduced=String(!!reduced);return reduced;}
function badge(label){const b=el('small',null,'meta-badge');b.title=label;b.setAttribute('aria-label',label);return b;}
function navIcon(key){const e=glyph({id:key,rarity:5},key==='skills'?'skills':'equipment');e.classList.add('meta-nav-icon');return e;}
function flyRewards(source,count=3){
 if(motionReduced()||!source||!wallet?.isConnected)return;
 const target=wallet.lastElementChild?.getBoundingClientRect();if(!target?.width)return;
 for(let i=0;i<count;i++){
  const dot=el('span','◆','meta-wallet-flight');dot.setAttribute('aria-hidden','true');
  const x=source.left+source.width/2,y=source.top+source.height/2,dx=target.left+target.width/2-x,dy=target.top+target.height/2-y;
  dot.style.left=x+'px';dot.style.top=y+'px';dialog.append(dot);
  const anim=dot.animate([{transform:'translate(-50%,-50%) scale(.7)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.15},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.25)',opacity:0}],{duration:600,delay:i*40,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  anim.onfinish=()=>{dot.remove();wallet.classList.remove('meta-wallet-reward');void wallet.offsetWidth;wallet.classList.add('meta-wallet-reward');};
 }
}
function card(parent,name,description){const e=el('article',null,'meta-card');e.append(el('h3',name));if(description)e.append(el('p',description));parent.append(e);return e;}
function progress(parent,value,max,label){const p=el('progress');p.max=max||1;p.value=value||0;p.setAttribute('aria-label',label);parent.append(p);}
function remaining(end){const minutes=Math.max(0,Math.ceil((end-Date.now())/60000));return Math.floor(minutes/1440)+t('days')+' '+Math.floor(minutes%1440/60)+t('hours')+' '+minutes%60+t('minutes');}
function action(name,args={}){if(!R()?.action){notify(t('unavailable'));return {ok:false};}try{const result=R().action(name,args);if(result?.then){notify(t('failed'));return {ok:false};}refresh();if(result?.message)notify(result.message);else if(!result?.ok)notify(t('failed'));if(result?.ok&&name==='fuse'){body.classList.add('meta-fusion-success');setTimeout(()=>body.classList.remove('meta-fusion-success'),300);}if(result?.ok&&['seasonClaim','offline','returnClaim'].includes(name)){flyRewards(lastActionRect);wallet.classList.add('meta-wallet-reward');setTimeout(()=>wallet.classList.remove('meta-wallet-reward'),600);}if(result?.ok&&name==='summon')showResults(result.results||result.items||[],args.type);return result;}catch(error){console.error('Meta action',error);notify(t('failed'));return {ok:false};}}
function push(layer){history.pushState({...history.state,metaUI:layer,metaSerial:++historySerial},'');}
function unwind(layer){if(history.state?.metaUI===layer){suppressPop++;history.back();}}
function mount(){if(dialog||!document.body)return;dialog=el('dialog');dialog.id='meta-center';dialog.setAttribute('aria-labelledby','meta-title');const header=el('header',null,'meta-header');title=el('h2',t('title'));title.id='meta-title';wallet=el('div',null,'meta-wallet');const closeBtn=button('×',close,'meta-close');closeBtn.setAttribute('aria-label',t('close'));header.append(title,wallet,closeBtn);nav=el('nav',null,'meta-nav');nav.setAttribute('aria-label',t('menu'));body=el('div',null,'meta-body');footer=el('footer',null,'meta-footer');const layout=el('div',null,'meta-layout'),main=el('div',null,'meta-main');main.append(body,footer);layout.append(nav,main);dialog.append(header,layout);overlay=el('dialog');overlay.id='meta-overlay';overlay.setAttribute('aria-labelledby','meta-overlay-title');const toast=el('div');toast.id='meta-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(dialog,overlay,toast);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});overlay.addEventListener('cancel',e=>{e.preventDefault();closeOverlay();});dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;document.dispatchEvent(new Event('meta-dialog-closed'));});window.addEventListener('popstate',()=>{if(suppressPop){suppressPop--;return;}if(overlay.open)overlay.close();else if(dialog.open)dialog.close();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});}
function open(next='menu'){mount();if(!dialog)return;if(next==='notice'&&!window.MetaNotices?.length)return;dialog.classList.toggle('meta-notice-panel',next==='notice');view=next==='gear'?'archive':next==='offline'?'supply':next;if(next==='skills'){view='archive';type='skills';}else if(next==='archive'||next==='gear'){type='equipment';}selected=null;if(!dialog.open){oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();push('main');}refresh();}
function close(){if(overlay?.open){closeOverlay();return;}if(!dialog?.open)return;dialog.close();unwind('main');}
function closeForRoute(callback){
 // Consume both owned history entries before the next screen can push its own.
 const depth=history.state?.metaUI==='overlay'?(dialog?.open?2:1):history.state?.metaUI==='main'?1:0;
 if(overlay?.open){clearTimeout(seasonPreviewTimer);overlay.close();}
 if(dialog?.open)dialog.close();
 if(!depth){callback();return;}
 suppressPop++;window.addEventListener('popstate',callback,{once:true});history.go(-depth);
}
function closeOverlay(){if(!overlay?.open)return;clearTimeout(seasonPreviewTimer);overlay.classList.remove('meta-season-preview');overlay.close();unwind('overlay');}
function popup(heading,content,buttons){motionReduced();const already=overlay.open;clearTimeout(seasonPreviewTimer);overlay.classList.remove('meta-season-preview');if(already)overlay.close();overlay.replaceChildren();const h=el('header',null,'meta-header'),name=el('h2',heading);name.id='meta-overlay-title';const x=button('×',closeOverlay,'meta-close');x.setAttribute('aria-label',t('close'));h.append(name,x);const c=el('div',null,'meta-overlay-content');c.append(content);const f=el('footer',null,'meta-overlay-footer');(buttons||[button(t('done'),closeOverlay)]).forEach(b=>f.append(b));overlay.append(h,c,f);overlay.showModal();if(!already)push('overlay');}
function probabilities(){const wrap=el('div');wrap.append(el('p',t('probabilityNote')));const table=el('table'),catalog=C()[type]||[],rates=new Map();for(const r of C().rarities||[]){let rarity=r.id;if(type==='skills')while(rarity>0&&!catalog.some(i=>i.rarity===rarity))rarity--;rates.set(rarity,(rates.get(rarity)||0)+r.probability);}for(const [id,rate]of rates){if(!rate)continue;const tr=el('tr');tr.append(el('th',C().rarities[id]?.name),el('td',rate.toLocaleString('tr-TR')+'%'));table.append(tr);}wrap.append(table);popup(t('probability'),wrap);}
function showResults(results,kind){const catalog=C()[kind==='skill'?'skills':kind]||[],grid=el('div',null,'meta-result-grid');let revealIndex=0;for(const result of results){const item=typeof result==='string'?catalog.find(x=>x.id===result):(catalog.find(x=>x.id===result.id)||result);const c=el('div',null,'meta-result');c.style.setProperty('--rarity',colors[item?.rarity||0]);c.style.setProperty('--reveal-delay',(300+90*revealIndex++)+'ms');c.append(glyph(item,kind),el('strong',item?.name||t('unknown')),el('p',C().rarities?.[item?.rarity]?.name||''));if(typeof result==='object')c.append(el('small',result.isNew?t('newSignal'):t('duplicate')));grid.append(c);}if(!results.length)grid.append(el('p',t('claimed')));popup(t('results'),grid,[button(t('skip'),()=>grid.classList.add('meta-skip')),button(t('done'),closeOverlay,'meta-primary')]);}
function footerAction(label,fn,primary=false){footer.append(button(label,fn,primary?'meta-primary':''));}
function refresh(){motionReduced();if(!dialog?.open)return;const m=state(),curr=m.currencies||{};wallet.replaceChildren(...['kredi','kristal','parca'].map(k=>el('span',n(curr[k])+' '+t(k))));title.textContent=t(view);nav.replaceChildren();body.replaceChildren();footer.replaceChildren();body.className='meta-body';body.onclick=null;footer.hidden=false;const entries=view==='archive'?['menu','equipment','skills','companion','relic','trait']:['menu','archive','supply','season','return','event','notice'];entries.forEach(key=>{const b=button(t(key),()=>{if(['companion','relic','trait'].includes(key)){notify(t('noSignal'));return;}if(view==='archive'&&['equipment','skills'].includes(key)){type=key;selected=null;refresh();}else open(key);});b.setAttribute('aria-pressed',String(view==='archive'?type===key:view===key));b.prepend(navIcon(key));nav.append(b);});if(view==='archive')renderArchive(m);else if(view==='supply')renderSupply(m);else if(view==='streak')renderStreak(m);else if(view==='season')renderSeason(m);else if(view==='return')renderReturn(m);else if(view==='notice')renderNotices();else if(view==='event')renderEvent();else renderMenu();if(!footer.childElementCount)footer.hidden=true;}
function renderArchive(m){body.classList.add('meta-archive');const a=m.archive||{},catalog=C()[type]||[],owned=a[type]||{},detail=el('section',null,'meta-detail'),collection=el('section',null,'meta-collection');detail.setAttribute('aria-label',t('choose'));collection.setAttribute('aria-label',t(type));const item=catalog.find(i=>i.id===selected)||catalog[0];selected=item?.id;for(const rarity of C().rarities||[]){const items=catalog.filter(i=>i.rarity===rarity.id);if(!items.length)continue;const h=el('h3',t('class')+' '+(rarity.id+1)+' · '+rarity.name+' '+ '◆'.repeat(rarity.id+1),'meta-rarity-heading');const grid=el('div',null,'meta-grid');for(const i of items){const rec=owned[i.id],has=rec?.level>0,equipped=type==='equipment'?a.equippedWeapon===i.id:a.skillSlots?.includes(i.id),b=button('',()=>{selected=i.id;if(has&&!rec.seen)action('seen',{type,id:i.id});else refresh();},'meta-item');b.dataset.owned=String(has);b.dataset.equipped=String(equipped);b.setAttribute('aria-pressed',String(selected===i.id));b.style.setProperty('--rarity',colors[i.rarity]);b.setAttribute('aria-label',i.name+' · '+(has?t('level')+' '+rec.level:t('locked')));b.title=i.name;b.append(glyph(i,type),el('span',has?'LV '+rec.level:'—','meta-item-level'),el('small',(rec?.copies||0)+'/'+i.fuseCopies,'meta-item-count'));progress(b,rec?.copies||0,i.fuseCopies,i.name);if(equipped)b.append(badge(t('equipped')));else if(has&&!rec.seen)b.append(badge(t('newRecord')));else if(has&&rec.copies>=i.fuseCopies)b.append(badge(t('ready')));grid.append(b);}collection.append(h,grid);}if(item){const rec=owned[item.id],has=rec?.level>0,rarity=C().rarities?.[item.rarity];detail.append(glyph(item,type),el('h3',item.name),el('p',rarity?.name+' '+ '◆'.repeat((item.rarity||0)+1)));if(type==='equipment'){const value=item.bonus*(has?rec.level:0);detail.append(el('p',t('owned')+' +'+(value*100).toLocaleString('tr-TR',{maximumFractionDigits:2})+'%'),el('p',t('equippedEffect')+' +'+(value*100*(item.equippedMultiplier||3)).toLocaleString('tr-TR',{maximumFractionDigits:2})+'%'),el('p',t('totalOwned')+' +'+(catalog.reduce((sum,i)=>sum+i.bonus*(owned[i.id]?.level||0),0)*100).toLocaleString('tr-TR',{maximumFractionDigits:2})+'%'));}else detail.append(el('p',t('cooldown')+' '+item.cooldown+' '+t('seconds')));detail.append(el('p',has?t('level')+' '+rec.level+' · '+t('copies')+' '+(rec.copies||0)+'/'+item.fuseCopies:t('empty')));progress(detail,rec?.copies||0,item.fuseCopies,item.name);if(type==='skills'){const slots=el('div',null,'meta-slot-grid');slots.setAttribute('aria-label',t('slots'));(C().skillUnlockSectors||[]).forEach((unlock,index)=>{const id=a.skillSlots?.[index],skill=C().skills?.find(s=>s.id===id),isLocked=(m.offline?.cleared||legacy().cleared||0)<unlock,b=button((index+1)+'. '+(isLocked?t('sector')+' '+unlock:skill?.name||t('emptySlot')),()=>{slot=index;if(isLocked)notify(t('sector')+' '+unlock+' · '+t('locked'));refresh();});b.setAttribute('aria-pressed',String(slot===index));slots.append(b);});detail.append(slots);}const actions=el('div',null,'meta-detail-actions'),equipped=type==='equipment'?a.equippedWeapon===item.id:a.skillSlots?.[slot]===item.id;actions.append(button(equipped?t('remove'):t('equip'),()=>action('equip',{type,id:equipped?null:item.id,slot})),button(t('fuse'),()=>action('fuse',{type,id:item.id})));detail.prepend(actions);detail.append(el('p',item.fuseCopies+' '+t('fusionNote'),'meta-note'));}body.append(detail,collection);const prices=C().summon?.[type==='skills'?'skill':type]||{};footerAction(t('summonOne')+' · '+n(prices.one),()=>action('summon',{type,count:1}),true);footerAction(t('summonTen')+' · '+n(prices.ten),()=>action('summon',{type,count:10}));footerAction(t('fuseAll'),()=>action('fuse',{type,id:null}));footerAction(t('probability'),probabilities);}
function renderSupply(m){body.classList.add('meta-cards');const c=card(body,t('offlineTitle'),n(m.offline?.pending??0)+' '+t('parca'));c.append(el('p',t('offlineNote')));progress(c,m.offline?.pending||0,C().offline?.maxPending||360,t('offlineTitle'));const d=card(body,t('dailyTitle'),t('dailyNote'));d.append(el('p',t('dailyAuto')),el('strong',t('day')+' '+(m.streak?.day||0)),button(t('streak'),()=>open('streak')));footerAction(t('offlineClaim')+' · '+n(m.offline?.pending||0)+' '+t('parca'),()=>action('offline'),true);}
function renderStreak(m){
 const day=m.streak?.day||1,total=m.streak?.totalDays||day,reduced=window.Fx?.settings().reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 body.classList.add('meta-streak');body.dataset.reduced=String(reduced);
 const number=el('strong',String(total),'meta-streak-number');
 body.append(number,el('h3',t('streakLine')),el('p',t('dailyAuto')));
 const rail=el('div',null,'meta-three-rewards'),rewards=C().daily?.rewards||[];
 for(let offset=0;offset<3;offset++){const index=(day-1+offset)%7,c=card(rail,t(['today','tomorrow','nextDay'][offset]),rewards[index]+' '+t('parca'));c.style.setProperty('--card-delay',(300+offset*80)+'ms');c.append(el('strong',offset===0?t('claimed'):t('day')+' '+(index+1)));}
 const piko=el('div',null,'meta-piko-line'),avatar=el('img'),line=el('span',t('dailySignalLine'));avatar.src='assets/operations/piko-supply.png';avatar.alt='';avatar.width=56;avatar.height=56;piko.append(avatar,line);body.append(rail,piko);if(!reduced)setTimeout(()=>{if(rail.isConnected&&!done)flyRewards(rail.firstElementChild.getBoundingClientRect());},700);
 if([3,7,14,30].includes(total))body.append(el('strong',t('milestone'),'meta-milestone'));
 footerAction(t('done'),close,true);
 const started=performance.now();let done=reduced;
 function finish(){done=true;number.textContent=String(total);line.textContent=t('dailySignalLine');body.classList.add('meta-streak-skip');dialog.querySelectorAll('.meta-wallet-flight').forEach(e=>e.remove());}
 if(!reduced){number.textContent='0';const frame=now=>{if(done||!number.isConnected)return;const f=Math.min(1,(now-started)/500);number.textContent=String(Math.round(total*(1-Math.pow(1-f,3))));if(f<1)requestAnimationFrame(frame);};requestAnimationFrame(frame);}
 if(!reduced){line.textContent='';const full=t('dailySignalLine');const type=now=>{if(done||!line.isConnected)return;line.textContent=full.slice(0,Math.max(0,Math.floor((now-started-1300)/18)));if(line.textContent.length<full.length)requestAnimationFrame(type);};requestAnimationFrame(type);}
 body.onclick=finish;
}
function showSeasonPreview() {
  mount();
  if (overlay.open) return;
  const season = state().season;
  if (!season) return;
  const config = C().season;
  const currentPeriod = Math.floor(Date.now() / C().dayMs / config.days);
  const period = Math.max(currentPeriod, season.period);
  const tier = period === season.period ? Math.min(config.tiers, Math.floor(season.xp / config.xpPerTier)) : 0;
  const milestone = tier;
  const reward = el('article', null, 'meta-season-feature');
  reward.append(el('span','◈','meta-season-emblem'),el('h3',t('seasonTitle')),
    el('p',milestone ? t('tier') + ' ' + milestone : t('seasonStart')),
    el('strong',n(config.partsPerTier) + ' ' + t('parca') + ' / ' + t('tier')));
  popup(t('seasonPreview'),reward,[button(t('skip'),closeOverlay),button(t('viewPass'),closeOverlay,'meta-primary')]);
  overlay.classList.add('meta-season-preview');
  // Preview is opened explicitly, so keep it readable until dismissed.
}
function renderSeason(m){const s=m.season||{},tier=Math.min(C().season?.tiers||30,Math.floor((s.xp||0)/(C().season?.xpPerTier||60))),summary=el('div',null,'meta-season-summary');summary.append(el('strong',t('seasonTitle')),el('span',n(s.xp||0)+' '+t('xp')+' · '+tier+'/30'));progress(summary,(s.xp||0)%(C().season?.xpPerTier||60),C().season?.xpPerTier||60,t('seasonTitle'));body.append(summary);for(const track of ['elite','premium','free']){const row=el('section',null,'meta-season-row');row.append(el('h3',t(track)));const rail=el('div',null,'meta-track');for(let i=1;i<=30;i++){const unlocked=track==='free'||s.premiumUnlocked,claimed=i<=(track==='free'?(s.claimed||0):(s.premiumClaimed||0)),ready=i<=tier&&unlocked,c=button('',()=>unlocked?action('seasonClaim',{track,tier:i}):notify(t('premiumUnlock')+' · '+n(C().season?.premiumCost)+' '+t('kristal')),'meta-reward-cell');c.dataset.claimed=String(claimed);c.dataset.ready=String(ready&&!claimed);c.append(el('small',String(i)),el('strong',n(C().season?.partsPerTier||6)+' '+t('parca')),el('small',claimed?t('claimed'):ready?t('ready'):t('locked')));rail.append(c);}row.append(rail);body.append(row);}footerAction(t('claimAll'),()=>action('seasonClaim'),true);if(!s.premiumUnlocked)footerAction(t('premiumUnlock')+' · '+n(C().season?.premiumCost),()=>action('seasonUnlock'));else footer.append(el('span',t('premiumNote'),'meta-note'));footerAction(t('seasonPreview'),showSeasonPreview);footerAction(t('seasonTasks'),()=>R()?.route?.('tasks'));}
function renderReturn(m){const r=m.returnEvent||{};if(!r.startedAt){body.append(el('h3',t('returnTitle')),el('p',t('returnInactive')));return;}if(Date.now()>=r.endsAt){body.append(el('h3',t('expired')));return;}body.classList.add('meta-return');const days=el('nav',null,'meta-days');days.setAttribute('aria-label',t('day'));for(let d=1;d<=7;d++){const b=button(t('day')+' '+d,()=>{returnDay=d;refresh();});b.setAttribute('aria-pressed',String(d===returnDay));days.append(b);}const content=el('div',null,'meta-return-content');content.append(el('h3',t('returnTitle')),el('p',t('returnNote')+' '+t('expires')+' '+remaining(r.endsAt)));const list=el('div',null,'meta-cards');for(const task of C().returnEvent?.tasks||[]){const key=returnDay+':'+task.id,claimed=!!r.tasks?.[key],count=Math.max(0,(m.progress?.[task.id==='login'?'logins':task.id]||0)-(r.baseline?.[task.id==='login'?'logins':task.id]||0)),target=task.target*returnDay,c=card(list,t(task.id),(task.reward||0)+' '+t('parca'));progress(c,Math.min(target,count),target,t(task.id));c.append(el('p',Math.min(target,count)+' / '+target),button(claimed?t('claimed'):t('claim'),()=>action('returnClaim',{day:returnDay,task:task.id})),button(t('go'),()=>{const target={login:'supply',waves:'battle',bosses:'boss',summons:'archive',fusions:'archive'}[task.id];if(R()?.route)R().route(target);else open(target);}));}content.append(list);body.append(days,content);}
function renderNotices(){body.classList.add('meta-cards','meta-notices');for(const notice of radioNotices()){const c=card(body,notice.title,notice.body);c.dataset.read=String(state().seenNotices?.[notice.id]===true);if(notice.detail)c.append(button(t('noticeDetails'),()=>{R().action('noticeSeen',{id:notice.id});popup(notice.title,el('p',notice.detail));}));if(notice.action?.route)c.append(button(t('go'),()=>R().route(notice.action.route)));}footerAction(t('done'),close,true);}
function renderEvent(){
  const event=R().eventBriefing();
  const art=el('div',null,'meta-event-art');
  art.append(el('p',t('expires')+' · '+remaining(event.endsAt)));
  body.classList.add('meta-event');
  body.append(art);
  const briefing=card(body,t('bossTitle'),t('bossNote'));
  briefing.append(el('strong',event.boss),el('p',t('eventReward')+' · '+event.reward));
  if(event.result)briefing.append(el('p',t(event.result==='won'?'eventWon':'eventLost')));
  footerAction(t(event.result?'eventSummary':'bossAction'),()=>R().startEvent(event.day),true);
}
function renderMenu(){body.classList.add('meta-cards');
const meta=state();
const level=meta.creditLevel||0;
const upgrade=card(body,t('creditUpgrade'),t('level')+' '+level+' · +'+(level*C().creditUpgrade.damagePerLevel*100).toLocaleString('tr-TR')+'%');
upgrade.append(button(level>=C().creditUpgrade.maxLevel?t('maxLevel'):t('upgrade')+' · '+n(R().creditCost(level))+' '+t('kredi'),()=>action('creditUpgrade')));

const controls=card(body,t('battleControls'),'');
controls.append(button(t('settings'),()=>closeForRoute(openSettingsModal)),button(t('workshop'),()=>closeForRoute(()=>{if(!isDrawerOpen)toggleUpgradeDrawer();})),button(t('mainMenu'),()=>R()?.route?.('main')));
for(const v of ['archive','supply','streak','season','return','event','notice']){const c=card(body,t(v),'');c.append(button(t(v),()=>open(v)));}}
// Radio cards stay outside the modal layer and never change pause state.
let radioQueue,radioCard,radioBadge,radioId='',radioOwner='',radioTimer;
const radioHistory=new Map();
function radioNotices(){return [...new Map([...(window.MetaNotices||[]),...radioHistory.values()].map(n=>[n.id,n])).values()].filter(n=>MetaModel.noticeEligible(n,Date.now(),window.MetaBuild||2));}
function radioBusy(){
 const settings=document.getElementById('settings-modal'),cinema=document.getElementById('boss-cinema-v15'),moment=document.getElementById('battle-moment');
 return document.hidden||document.body.dataset.gameMode==='story'||document.getElementById('story-mode-screen')?.getAttribute('aria-hidden')==='false'||
 !document.getElementById('mode-main-menu')?.classList.contains('menu-hidden')||!!document.querySelector('dialog[open]')||!!document.querySelector('#endless-tactics[open]:not([hidden])')||
 !!(settings&&!settings.classList.contains('hidden'))||!!(moment?.classList.contains('is-visible')&&['boss','bossKill','clear','loss','defeat'].includes(moment.dataset.kind))||!!(cinema&&Number(getComputedStyle(cinema).opacity)>.05)||
 (typeof isDefeated!=='undefined'&&isDefeated);
}
function radioTick(){
 if(!R())return;
 motionReduced();
 const account=typeof currentUser!=='undefined'&&currentUser?.uid||'guest';
 if(!radioQueue||account!==radioOwner){radioOwner=account;radioQueue=MetaModel.createNoticeQueue(state().seenNotices,window.MetaBuild||2);radioHistory.clear();radioId='';}
 for(const notice of radioNotices())radioQueue.enqueue(notice);
 const season=state().season;
 if(season){const tier=Math.min(C().season.tiers,Math.floor(season.xp/C().season.xpPerTier));const notice={id:'season:'+season.period+':'+tier,type:'sezon',title:t('seasonTitle')+' · '+t('tier')+' '+tier,body:C().season.partsPerTier+' '+t('parca')+' / '+t('tier'),action:{route:'season'}};if(radioQueue.enqueue(notice))radioHistory.set(notice.id,notice);}
 const entry=radioQueue.tick(Date.now(),radioBusy());
 if(!radioCard){radioCard=el('aside',null,'meta-radio-card');radioCard.id='meta-radio';radioCard.setAttribute('aria-live','polite');let start=0;radioCard.addEventListener('pointerdown',e=>start=e.clientX);radioCard.addEventListener('pointerup',e=>{if(e.clientX-start>50){radioQueue.dismiss(Date.now());radioTick();}});radioBadge=button('',()=>open('notice'),'meta-radio-badge');radioBadge.setAttribute('aria-label',t('radioTitle'));document.body.append(radioCard,radioBadge);}
 const rail=document.getElementById('meta-command-rail');if(rail&&radioBadge.parentElement!==rail)rail.append(radioBadge);radioCard.hidden=!entry;radioBadge.hidden=radioBusy()||!rail;radioBadge.textContent='◉ '+radioNotices().filter(n=>!state().seenNotices?.[n.id]).length;
 if(entry&&radioId!==entry.id){radioId=entry.id;R().action('noticeSeen',{id:entry.id});const copy=el('div');copy.append(el('strong',entry.title.slice(0,28)),el('p',entry.body.slice(0,60)));radioCard.replaceChildren(copy,button(t('radioView'),()=>{radioQueue.dismiss(Date.now());radioTick();if(entry.type==='sezon'){open('season');showSeasonPreview();}else R().route(entry.action?.route||'notice');}));}
 if(!entry)radioId='';
}
function startRadio(){if(!radioTimer)radioTimer=setInterval(radioTick,250);}
window.MetaUI=Object.freeze({open,close,closeForRoute,notify,refresh,showResults,showSeasonPreview});document.addEventListener('meta-runtime-ready',()=>{mount();refresh();startRadio();});document.addEventListener('meta-state-changed',refresh);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
