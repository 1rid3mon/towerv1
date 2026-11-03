/* LOST SIGNAL sound event integration. Opt-in, no autoplay. */
(function(root){'use strict';
function init(){
 const btn=document.getElementById('ls-sound-optin');
 if(btn&&root.TowerCommandSounds){btn.addEventListener('click',function(){const on=!root.TowerCommandSounds.isEnabled();root.TowerCommandSounds.setEnabled(on);btn.textContent=on?'KONSOL SESİ: AÇIK':'KONSOL SESİ: KAPALI';btn.setAttribute('aria-pressed',String(on));if(on)root.TowerCommandSounds.play('confirm')})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
root.TowerLostSignalEventSound=function(kind){if(!root.TowerCommandSounds)return;const map={boss:'boss',bossKill:'confirm',wave:'discover',clear:'confirm',loss:'warning',gameOver:'warning'};if(map[kind])root.TowerCommandSounds.play(map[kind]);};
})(typeof window!=='undefined'?window:globalThis);
