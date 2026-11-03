/* LOST SIGNAL V7: atmospheric theme pass. Visual only, no combat state changes. */
(function(){
 'use strict';
 const palettes={
  cyber:{dust:'#9caeaf',light:'#b6c8b7',structure:'#3b4c55',kind:'antenna'},
  aurora:{dust:'#a7d7cc',light:'#88bfb9',structure:'#334e5c',kind:'antenna'},
  snow:{dust:'#d9eaf0',light:'#9cbccc',structure:'#577482',kind:'crystal'},
  frost:{dust:'#d9eaf0',light:'#9cbccc',structure:'#577482',kind:'crystal'},
  desert:{dust:'#d6b189',light:'#c99567',structure:'#765443',kind:'rock'},
  space:{dust:'#b5a8cc',light:'#867fae',structure:'#3b395c',kind:'wreck'},
  nebula:{dust:'#b5a8cc',light:'#867fae',structure:'#3b395c',kind:'wreck'},
  bubblegum:{dust:'#e5b9d2',light:'#c7a4cb',structure:'#786178',kind:'shard'},
  forest:{dust:'#b3ba8b',light:'#929d80',structure:'#566052',kind:'rock'}
 };
 let cached=[],width=0,height=0,quality='';
 const rnd=(n)=>{let v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 function reset(w,h,q){cached=[];const count=q==='high'?Math.min(32,Math.round(w*h/26000)):Math.min(12,Math.round(w*h/50000));for(let i=0;i<count;i++){cached.push({x:rnd(i+2),y:rnd(i+43),a:.07+rnd(i+79)*.12,r:.35+rnd(i+100)*1.15,s:.12+rnd(i+120)*.23});}width=w;height=h;quality=q;}
 function silhouette(c,x,y,scale,p){
  c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle=p.structure;c.strokeStyle=p.light;c.lineWidth=1;
  if(p.kind==='crystal'||p.kind==='shard'){
   c.beginPath();c.moveTo(-19,9);c.lineTo(-12,-9);c.lineTo(-4,-2);c.lineTo(5,-22);c.lineTo(14,-3);c.lineTo(19,12);c.closePath();c.fill();c.stroke();
   c.beginPath();c.moveTo(5,-22);c.lineTo(4,12);c.moveTo(-12,-9);c.lineTo(4,12);c.stroke();
  }else if(p.kind==='rock'){
   c.beginPath();c.moveTo(-24,12);c.lineTo(-17,-5);c.lineTo(-4,-11);c.lineTo(9,-4);c.lineTo(21,13);c.closePath();c.fill();c.stroke();
   c.beginPath();c.moveTo(-4,-11);c.lineTo(2,11);c.stroke();
  }else if(p.kind==='antenna'){
   c.fillRect(-15,0,30,10);c.strokeRect(-15,0,30,10);c.beginPath();c.moveTo(0,0);c.lineTo(0,-27);c.lineTo(-11,-32);c.moveTo(0,-27);c.lineTo(11,-32);c.stroke();
   c.fillRect(-20,-2,6,5);c.fillRect(14,-2,6,5);
  }else{
   c.rotate(-.3);c.fillRect(-18,-6,36,12);c.strokeRect(-18,-6,36,12);c.fillRect(-29,-13,8,25);c.fillRect(21,-13,8,25);c.beginPath();c.moveTo(-21,0);c.lineTo(21,0);c.stroke();
  }c.restore();
 }
 function draw(c,w,h,theme,wave,time){
  const q=window.LostSignalLivingSpace&&window.LostSignalLivingSpace.getQuality?window.LostSignalLivingSpace.getQuality():'low';
  if(q==='off'||w<100||h<100)return;
  const p=palettes[theme]||palettes.cyber;
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=reduced?0:(Number.isFinite(time)?time:0)*.001;
  if(width!==w||height!==h||quality!==q)reset(w,h,q);
  c.save();
  // Edge-only environmental light. The central combat area stays clear.
  const a=Math.min(.055,.018+Math.min(100,Math.max(0,wave||1))*.00018);
  const grad=c.createLinearGradient(0,0,0,h*.30);
  grad.addColorStop(0,p.light);grad.addColorStop(1,'transparent');
  c.globalAlpha=a;c.fillStyle=grad;c.fillRect(0,0,w,h*.30);
  c.globalAlpha=1;
  // Subtle distant particles, clipped to the top and outer 14% of the arena.
  c.fillStyle=p.dust;
  for(const d of cached){const x=((d.x*w+t*d.s)%w+w)%w,y=d.y*h;if(x>w*.14&&x<w*.86&&y>h*.16)continue;c.globalAlpha=d.a;c.fillRect(x,y,d.r,d.r);}
  // One tiny landmark, never near the tower; not drawn in low quality or small screens.
  if(q==='high'&&w>640&&h>380){c.globalAlpha=.17;silhouette(c,w*.91+Math.sin(t*.018)*3,h*.11,Math.min(1.2,w/1100),p);}
  c.restore();
 }
 window.LostSignalThemeAtmosphere=Object.freeze({draw,palettes});
})();
