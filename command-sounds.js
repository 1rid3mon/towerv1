/* LOST SIGNAL original procedural UI sounds. Disabled until a user gesture and opt-in.
   No autoplay, no music, no network, no dependency. */
(function(root){'use strict';
 let enabled=false,ctx=null,last=0;
 const patterns={confirm:[[440,.045],[660,.065]],warning:[[330,.09],[220,.13]],boss:[[110,.17],[82,.22]],discover:[[523,.05],[698,.08],[880,.10]]};
 function setEnabled(value){enabled=Boolean(value);if(!enabled&&ctx){ctx.close().catch(()=>{});ctx=null;}return enabled;}
 function play(name){if(!enabled||!patterns[name])return false;const now=Date.now();if(now-last<90)return false;last=now;
  const AudioContextClass=root.AudioContext||root.webkitAudioContext;if(!AudioContextClass)return false;
  try{ctx=ctx||new AudioContextClass();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   let at=ctx.currentTime+.008;
   for(const [freq,dur] of patterns[name]){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.035,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+dur+.015);at+=dur*.86;}return true;
  }catch(_){return false;}}
 root.TowerCommandSounds=Object.freeze({play,setEnabled,isEnabled:()=>enabled});
})(typeof window!=='undefined'?window:globalThis);
