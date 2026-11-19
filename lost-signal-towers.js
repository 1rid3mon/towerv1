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
  // A substantial cast-metal receiver keeps the core readable at phone scale.
  // The body is art only: tower coordinates, attack range and collision stay intact.
  c.fillStyle='rgba(0,0,0,.48)';
  c.beginPath();c.ellipse(1,7,36,29,0,0,TAU);c.fill();
  polygon(c,[[-19,-28],[19,-28],[31,-16],[31,17],[18,30],[-18,30],[-31,17],[-31,-16]],'#070f18','#51616a',1.2);
  polygon(c,[[-18,-25],[18,-25],[28,-15],[28,15],[16,26],[-16,26],[-28,15],[-28,-15]],'#263841','#92a1a5',1);
  // Bevels face a consistent upper-left light source instead of neon outlines.
  polygon(c,[[-18,-25],[18,-25],[28,-15],[23,-13],[15,-20],[-16,-20],[-23,-13],[-28,-15]],'#50616a');
  polygon(c,[[28,-15],[28,15],[16,26],[-16,26],[-28,15],[-23,12],[-14,21],[14,21],[23,12],[23,-13]],'#14222d');
  for(let i=0;i<4;i++){
   c.save();c.rotate(i*PI/2);
   polygon(c,[[-8,-23],[-7,-33],[7,-33],[8,-23]],'#12202a','#5b6c72',1);
   c.fillStyle='#090f17';c.fillRect(-5,-30,10,5);
   c.fillStyle=color;c.fillRect(-4,-28,8,1.3);
   c.fillStyle='#779099';c.fillRect(-6,-24,2,2);c.fillRect(4,-24,2,2);
   c.restore();
  }
  c.fillStyle='#07121c';c.strokeStyle='#607882';c.lineWidth=1.4;
  c.beginPath();c.arc(0,0,21,0,TAU);c.fill();c.stroke();
  c.strokeStyle='#152d3c';c.lineWidth=4;
  c.beginPath();c.arc(0,0,18,0,TAU);c.stroke();
  c.strokeStyle=color;c.lineWidth=1.4;
  for(let i=0;i<3;i++){const a=i*TAU/3+.18;c.beginPath();c.arc(0,0,18,a,a+.62);c.stroke();}
  // Recessed status lamps and rivets provide scale without covering the skin.
  for(const x of [-22,22]){
   c.fillStyle='#050c13';c.fillRect(x-2,-6,4,12);
   c.fillStyle=color;c.fillRect(x-1,-4,2,3);c.fillRect(x-1,1,2,3);
  }
  c.fillStyle='#a6b6ba';
  for(const point of [[-19,-18],[19,-18],[-19,18],[19,18]]){
   c.beginPath();c.arc(point[0],point[1],1.1,0,TAU);c.fill();
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
 try{if(!root.Fx?.settings().reduced&&!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches))
  t=Number.isFinite(time)?time*.001:0;}catch(_){}
 c.save();
 try{
  // Outer tactical brackets are detached from the costume body and remain
  // readable on Cengiz red, cyber dark and snow backgrounds.
  c.strokeStyle='rgba(5,13,24,0.92)';c.lineWidth=3.3;
  for(const i of [0,1,2,3]){
   const a=PI/4+i*PI/2;
   c.beginPath();c.arc(0,0,35,a-.16,a+.16);c.stroke();
  }
  c.strokeStyle='rgba(238,249,255,0.92)';c.lineWidth=1.25;
  for(const i of [0,1,2,3]){
   const a=PI/4+i*PI/2;
   c.beginPath();c.arc(0,0,35,a-.16,a+.16);c.stroke();
  }
  c.strokeStyle=color;c.lineWidth=1.8;
  c.beginPath();c.arc(0,0,36,-.54,.54);c.stroke();
  // Four tiny sensor studs, kept away from aim direction and HUD bars.
  c.fillStyle=color;
  for(const a of [0,PI/2,PI,PI*1.5]){
   c.beginPath();c.arc(Math.cos(a)*30,Math.sin(a)*30,1.1,0,TAU);c.fill();
  }
  c.globalAlpha=.6;
  c.strokeStyle=color;c.lineWidth=1.3;
  const position=t*.21;
  c.beginPath();c.arc(0,0,36,position,position+.21);c.stroke();
 }finally{c.restore();}
 return true;
}
root.TowerLostSignalTowers=Object.freeze({
 draw,drawAccent,
 getState(){return {style:'lost-signal-station-chassis-v2',radius:36,visualOnly:true};}
});
})(typeof window!=='undefined'?window:globalThis);
