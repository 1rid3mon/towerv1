/* Boss V15 presentation: bounded, nonblocking, Endless-only HUD events. */
(function(w){
'use strict';
if(w.TowerBossCinemaV15)return;
const NAMES={tank_boss:['TİTAN','TITAN'],ranged_boss:['TOPÇU','ARTILLERY'],speed_boss:['GÖLGE','PHANTOM'],frost_boss:['KRİYO','CRYO'],leviathan:['LEVİATHAN','LEVIATHAN']};
let host=null,timer=null,token=0,enabled=true;
const english=()=>{try{return typeof getGameLanguage==='function'&&getGameLanguage()==='en';}catch(_){return false;}};
const label=(tr,en)=>english()?en:tr;
function mount(){if(!w.document?.body)return null;if(host?.isConnected)return host;host=w.document.createElement('div');host.id='boss-cinema-v15';host.setAttribute('role','status');host.setAttribute('aria-live','polite');host.style.cssText='position:fixed;left:50%;top:max(74px,env(safe-area-inset-top));transform:translateX(-50%);z-index:95;pointer-events:none;width:min(90vw,460px);text-align:center;color:#eaf9ff;font:700 15px system-ui,sans-serif;letter-spacing:.11em;opacity:0;transition:opacity .22s';w.document.body.appendChild(host);return host;}
function cue(type,phase){
 if(!enabled||!NAMES[type]||![1,2,3].includes(phase))return false;
 try{if(w.document?.body?.dataset?.gameMode==='story')return false;if(typeof GameModeRuntime!=='undefined'&&(GameModeRuntime.isStoryActive()||GameModeRuntime.isIsolatedStoryRuntime()))return false;}catch(_){return false;}
 const node=mount();if(!node)return false;
 const name=NAMES[type],title=phase===1?label('TEHDİT ALGILANDI','THREAT DETECTED'):phase===2?label('İKİNCİ EVRE','SECOND PHASE'):label('SON EVRE','FINAL PHASE');
 const TACTICS={tank_boss:[['Zırh güçleniyor · Menzil düşebilir','Armor strengthens · Range may drop'],['Alan baskısı artıyor','Area pressure intensifies']],ranged_boss:[['Kule atışları kesintiye uğrayabilir','Tower fire may be jammed'],['Sinyal darbeleri tekrarlanacak','Signal pulses will repeat']],speed_boss:[['Atılma aralıkları kısalıyor','Dash intervals shorten'],['Hızlı atılmalara dikkat','Watch for rapid dashes']],frost_boss:[['Soğuk alanı menzili daraltabilir','Cold field may reduce range'],['Buz baskısı güçleniyor','Cryo pressure intensifies']],leviathan:[['Sinyal bozucu etkin','Signal jammer active'],['Güçlü bozucu darbeler geliyor','Strong jamming pulses incoming']]};
 const tactic=TACTICS[type]?.[phase===3?1:0];
 const subtitle=phase===1?label('Savunma düzenini koru','Hold your defenses'):tactic?label(...tactic):label('Kritik tehdit','Critical threat');
 node.textContent=title+' · '+name[english()?1:0]+' — '+subtitle;
 node.dataset.phase=String(phase);
 node.dataset.boss=type;
 const reduced=!!w.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 node.style.transition=reduced?'none':'opacity .22s';
 node.style.cssText+=';padding:13px 16px;border:1px solid '+(phase===3?'#f59e0b':'#22d3ee')+';border-radius:12px;background:rgba(5,13,30,.94);box-shadow:0 0 28px rgba(34,211,238,.26);opacity:1';
 if(timer)w.clearTimeout(timer);const id=++token;
 timer=w.setTimeout(()=>{if(id===token&&host)host.style.opacity='0';},phase===1?2400:1900);
 return true;
}
function setEnabled(value){enabled=!!value;if(!enabled&&host)host.style.opacity='0';return enabled;}
function dismiss(){token++;if(timer)w.clearTimeout(timer);timer=null;if(host)host.style.opacity='0';}
function state(){return {enabled,phase:host?.dataset.phase||null,boss:host?.dataset.boss||null};}
w.TowerBossCinemaV15=Object.freeze({cue,setEnabled,dismiss,state});
})(window);
