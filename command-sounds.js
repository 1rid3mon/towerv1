/* LOST SIGNAL original procedural UI sounds. Disabled until a user gesture and opt-in.
   No autoplay, no music, no network, no dependency. */
(function(root){'use strict';
 let enabled=false,ctx=null,last=0,lastCollect=-Infinity,collectStep=-1,unlocked=false;
 root.document?.addEventListener('pointerdown',()=>{unlocked=true;},{once:true});
 root.document?.addEventListener('keydown',()=>{unlocked=true;},{once:true});
 function nextCollectStep(now) { collectStep = now - lastCollect >= 600 ? 0 : Math.min(7, collectStep + 1); lastCollect = now; return collectStep; }
 const patterns={collect:[[660,.045]],confirm:[[440,.045],[660,.065]],warning:[[330,.09],[220,.13]],boss:[[110,.17],[82,.22]],discover:[[523,.05],[698,.08],[880,.10]]};
 function setEnabled(value){enabled=Boolean(value);if(!enabled&&ctx){ctx.close().catch(()=>{});ctx=null;}return enabled;}
 function play(name,options={}){const battle=name==='collect'||name==='boss';const allowed=battle ? unlocked && (typeof battleSfxEnabled === 'undefined' || battleSfxEnabled) : enabled;if(!allowed||!patterns[name])return false;const now=Date.now();if(now-last<90)return false;last=now;const step = name === 'collect' ? nextCollectStep(now) : Math.max(0, Math.min(7, Number(options.step) || 0));
  const AudioContextClass=root.AudioContext||root.webkitAudioContext;if(!AudioContextClass)return false;
  try{ctx=ctx||new AudioContextClass();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   let at=ctx.currentTime+.008;
   for(const [freq,dur] of patterns[name]){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.value=freq*Math.pow(2,step/12);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.035,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+dur+.015);at+=dur*.86;}return true;
  }catch(_){return false;}}
 root.TowerCommandSounds=Object.freeze({play,setEnabled,isEnabled:()=>enabled});
 if(typeof module==='object'&&module.exports)module.exports={nextCollectStep};
})(typeof window!=='undefined'?window:globalThis);
