/* LOST SIGNAL · Stage 1.6 common tower chassis.
 * Always under each existing collectible tower costume. Accent markers paint on
 * top without masking skins, aiming, projectiles, shields, or turret barrels.
 * Presentation only: all unlocked skins and save keys remain untouched.
 */
(function(root){'use strict';
const PI=Math.PI,TAU=PI*2,INK='#08111f',HULL='#172b3a',STEEL='#365267',EDGE='#d8ecf5';
const GROUPS=Object.freeze({
 warm:['ates_tower','fire_demon','dragon','lion','tiger','sunkas_tower','dgdvrn','toilet'],
 frost:['snowman','nane_tower','tree','star_cruiser'],
 crimson:['cyber_samurai','fighter_jet','car','kurt_kaan','robot'],
 violet:['black_hole','sofa','bubblegum'],
 gold:['kurt_kaan','dgdvrn','lion','tiger','sunkas_tower'],
});
function accent(id){
 if(GROUPS.violet.includes(id))return '#d1b5ff';
 if(GROUPS.crimson.includes(id))return '#f5ad9d';
 if(GROUPS.warm.includes(id))return '#edc08d';
 if(GROUPS.frost.includes(id))return '#a1e6ec';
 return '#8fd4de';
}
function polygon(c,pts,fill,stroke,width=1.2){
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function draw(c,skinId,time){
 if(!c||typeof c.save!=='function')return false;
 const color=accent(skinId);
 c.save();
 try{
  // Standard 8-point plinth anchors diverse tower skins to the same station hardware.
  polygon(c,[[0,-19],[14,-14],[19,0],[14,14],[0,19],
    [-14,14],[-19,0],[-14,-14]],INK,EDGE,1.55);
  polygon(c,[[0,-16],[11,-11],[16,0],[11,11],[0,16],
    [-11,11],[-16,0],[-11,-11]],HULL,'#668497',1.1);
  // Four exposed radial armor locks are large enough to survive 1x render.
  for(let i=0;i<4;i++){
   c.save();c.rotate(i*PI/2);
   polygon(c,[[-5,-16],[-4,-20],[4,-20],[5,-16]],STEEL,color,1.3);
   c.restore();
  }
  c.fillStyle='#091d2a';c.strokeStyle='#829eae';c.lineWidth=1.2;
  c.beginPath();c.arc(0,0,9.3,0,TAU);c.fill();c.stroke();
  c.strokeStyle=color;c.lineWidth=1.7;
  c.beginPath();c.arc(0,0,7.3,-.45,.65);c.stroke();
  c.fillStyle='#d8f8fb';c.fillRect(-2.15,-2.15,4.3,4.3);
 }finally{c.restore();}
 return true;
}
function drawAccent(c,skinId,angle,time){
 if(!c||typeof c.save!=='function')return false;
 const color=accent(skinId);
 let t=0;
 try{if(!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches))
  t=Number.isFinite(time)?time*.001:0;}catch(_){}
 c.save();
 try{
  // Outer tactical brackets are detached from the costume body and remain
  // readable on Cengiz red, cyber dark and snow backgrounds.
  c.strokeStyle='rgba(5,13,24,0.92)';c.lineWidth=3.3;
  for(const i of [0,1,2,3]){
   const a=PI/4+i*PI/2;
   c.beginPath();c.arc(0,0,22,a-.16,a+.16);c.stroke();
  }
  c.strokeStyle='rgba(238,249,255,0.92)';c.lineWidth=1.25;
  for(const i of [0,1,2,3]){
   const a=PI/4+i*PI/2;
   c.beginPath();c.arc(0,0,22,a-.16,a+.16);c.stroke();
  }
  c.strokeStyle=color;c.lineWidth=1.8;
  c.beginPath();c.arc(0,0,23.5,-.54,.54);c.stroke();
  // Four tiny sensor studs, kept away from aim direction and HUD bars.
  c.fillStyle=color;
  for(const a of [0,PI/2,PI,PI*1.5]){
   c.beginPath();c.arc(Math.cos(a)*19.8,Math.sin(a)*19.8,1.1,0,TAU);c.fill();
  }
  c.globalAlpha=.6;
  c.strokeStyle=color;c.lineWidth=1.3;
  const position=t*.21;
  c.beginPath();c.arc(0,0,23.5,position,position+.21);c.stroke();
 }finally{c.restore();}
 return true;
}
root.TowerLostSignalTowers=Object.freeze({
 draw,drawAccent,
 getState(){return {style:'lost-signal-industrial-v1.6',radius:23.5,visualOnly:true};}
});
})(typeof window!=='undefined'?window:globalThis);
