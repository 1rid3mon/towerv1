/* LOST SIGNAL: optional restrained art feedback; zero economy or save mutations. */
(function(g){'use strict';
 const state={enabled:true,quality:'auto'};
 function quality(){if(state.quality!=='auto')return state.quality;return matchMedia('(prefers-reduced-motion: reduce)').matches?'low':'normal';}
 function drawEnemyDetails(ctx,e,ms){
  if(!state.enabled||!ctx||!e||!Number.isFinite(e.radius))return;
  const r=e.radius, boss=e.type==='boss', hp=Math.max(0,Math.min(1,(e.hp||0)/Math.max(1,e.maxHp||1)));
  ctx.save();try{
   ctx.lineCap='round';ctx.lineJoin='round';
   // A material highlight and wear pattern: visual-only, deliberately small.
   ctx.strokeStyle='rgba(228,221,200,.35)';ctx.lineWidth=Math.max(.7,r*.045);
   ctx.beginPath();ctx.moveTo(-r*.38,-r*.46);ctx.lineTo(-r*.12,-r*.63);ctx.lineTo(r*.28,-r*.42);ctx.stroke();
   if(hp<.7){ctx.strokeStyle='rgba(20,26,30,.7)';ctx.lineWidth=Math.max(.8,r*.065);ctx.beginPath();ctx.moveTo(-r*.12,-r*.18);ctx.lineTo(r*.1,r*.08);ctx.lineTo(-r*.02,r*.35);if(hp<.35){ctx.moveTo(r*.1,r*.08);ctx.lineTo(r*.38,r*.22);}ctx.stroke();}
   if(boss){
    const a=(ms||0)*.00018+(e.animPhase||0);
    ctx.strokeStyle='rgba(225,187,130,.55)';ctx.lineWidth=Math.max(1,r*.055);
    for(let i=0;i<4;i++){const t=a+i*Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(t)*r*.8,Math.sin(t)*r*.8);ctx.lineTo(Math.cos(t)*r*1.13,Math.sin(t)*r*1.13);ctx.stroke();}
   }
   if(e.isElite){ctx.strokeStyle='rgba(213,166,107,.65)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*1.09,-.25,.45);ctx.stroke();}
  }finally{ctx.restore();}
 }
 function stamp(){const h=document.querySelector('#mode-main-menu .mode-menu-eyebrow');if(h&&!h.dataset.lsStamped){h.dataset.lsStamped='1';h.textContent='LOST SIGNAL  /  SAVUNMA PROTOKOLÜ';}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stamp,{once:true});else stamp();
 g.TowerLostSignalArt={drawEnemyDetails,setEnabled(v){state.enabled=!!v},setQuality(v){if(['auto','normal','low'].includes(v))state.quality=v},getState(){return {...state,qualityResolved:quality()}}};
})(window);
