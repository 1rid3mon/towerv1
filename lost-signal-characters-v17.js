/* LOST SIGNAL · unified pilot silhouettes (reference trio, art-only).
 * Canvas geometry stays local to the entity; never alters radius, targeting or save state.
 * Three design references: Echo default companion, cyber scout and armored Titan.
 */
(function(root){'use strict';
const PI=Math.PI, TAU=PI*2;
const INK='#08111f', PLATE='#172b3d', STEEL='#345065', EDGE='#b7ccdc';
const ACCENT=Object.freeze({
 laserDrone:'#fb9ea6',frostOrb:'#9adffa',missileBot:'#ffc48c',
 repairDrone:'#83e4bd',plasmaSatellite:'#d1b5ff'
});
function motionTime(ms){
 try {if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)return 0;}
 catch(_){}
 return Number.isFinite(ms)?ms*0.001:0;
}
function polygon(c,pts,fill,stroke,width=1.25){
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function ring(c,r,color){
 c.fillStyle='rgba(3,10,19,0.90)';c.beginPath();c.arc(0,0,r,0,TAU);c.fill();
 c.strokeStyle='rgba(197,220,232,0.39)';c.lineWidth=1.15;
 c.beginPath();c.arc(0,0,r+0.3,PI*0.72,PI*1.83);c.stroke();
 c.strokeStyle=color;c.lineWidth=1.45;
 c.beginPath();c.arc(0,0,r+1.5,-0.66,0.55);c.stroke();
}
function screws(c,r){
 c.fillStyle=EDGE;
 for(const y of [-r*0.32,r*0.32]){
  c.beginPath();c.arc(-r*0.49,y,0.85,0,TAU);c.fill();
 }
}
function echo(c,compKey,star,angle,ms,ghostSkin){
 const color=ghostSkin?'#c4b5fd':(ACCENT[compKey]||'#8ddfe9'),t=motionTime(ms);
 const k=1+Math.min(5,Math.max(1,star||1))*0.035;
 c.save();
 try{
  c.rotate(Number.isFinite(angle)?angle:0);
  c.scale(k,k);
  c.translate(0,Math.sin(t*3)*0.55);
  ring(c,14.1,color);
  // Three compact layers: side-mounted thrusters, dark lower chassis, bright face panel.
  polygon(c,[[-8,-7],[-14,-9],[-13,-2],[-8,0]],'#263b4d',color,1.3);
  polygon(c,[[-8,7],[-14,9],[-13,2],[-8,0]],'#263b4d',color,1.3);
  c.fillStyle=color;
  c.fillRect(-14.7,-5.6,2.3,2.7);c.fillRect(-14.7,2.9,2.3,2.7);
  polygon(c,[[5,-11],[10,-7],[11,6],[5,10],[-5,10],[-10,6],[-10,-7],[-4,-11]],
   INK,EDGE,1.6);
  polygon(c,[[3,-8],[8,-5],[8,4],[3,8],[-5,8],[-7,4],[-7,-5],[-3,-8]],
   PLATE,'#517183',0.8);
  // Protective faceplate: a warmer, more approachable variant of the enemy sensor visor.
  polygon(c,[[0,-5],[6,-3],[6,4],[0,6],[-3,4],[-3,-3]],'#092436',color,1.2);
  c.fillStyle=ghostSkin?'#f5f0ff':'#dff8ff';
  c.fillRect(1,-2.5,2.3,1.7);c.fillRect(1,2,2.3,1.7);
  c.strokeStyle=color;c.lineWidth=1.25;c.beginPath();c.moveTo(-1,4.4);c.lineTo(2,5.1);c.stroke();
  // Antenna + technical plate seams make Echo belong to the same station hardware family.
  c.strokeStyle=EDGE;c.lineWidth=1.1;c.beginPath();c.moveTo(-2,-10);c.lineTo(-3,-13);c.stroke();
  c.fillStyle=color;c.beginPath();c.arc(-3,-13,1.5,0,TAU);c.fill();
  screws(c,10);
  // Ghost Wisp is still a collectible hologram skin, not an old emoji silhouette.
  // Preserve spectral fins and violet signal haze while sharing the armored chassis.
  if(ghostSkin){
   c.save();c.globalAlpha=0.72;
   polygon(c,[[-5,8],[-9,13],[-2,11],[0,15],[5,9]],'rgba(169,145,247,0.42)','#d8c6ff',0.85);
   c.strokeStyle='#d8b4fe';c.lineWidth=1.15;c.beginPath();
   c.arc(0,0,16.1,-1.8,-0.38);c.stroke();c.restore();
  }
  if(star>=4){
   c.strokeStyle=color;c.globalAlpha=0.44;c.lineWidth=1;
   c.beginPath();c.arc(0,0,17.5,t,t+PI*0.65);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
function scout(c,e,tx,ty,ms){
 const t=motionTime(ms);
 const r=Math.max(15.5,Math.min(25.5,e.radius*1.55));
 const aim=Number.isFinite(tx)&&Number.isFinite(ty)?Math.atan2(ty-e.y,tx-e.x):0;
 const hit=Number(e.hitFlash)>0;
 c.save();
 try{
  c.rotate(aim);
  c.translate(0,Math.sin(t*5+(e.animPhase||0))*0.45);
  ring(c,r*0.89,'#78dbea');
  // Paired swept wings form a pointed predator, not a toy.
  polygon(c,[[-r*0.65,-r*0.08],[-r*0.87,-r*0.72],[-r*0.29,-r*0.57],[r*0.12,-r*0.22]],
    '#223749','#7897a8',1.35);
  polygon(c,[[-r*0.65,r*0.08],[-r*0.87,r*0.72],[-r*0.29,r*0.57],[r*0.12,r*0.22]],
    '#223749','#7897a8',1.35);
  polygon(c,[[-r*0.54,0],[-r*0.19,-r*0.38],[r*0.73,-r*0.23],[r*0.98,0],
             [r*0.73,r*0.23],[-r*0.19,r*0.38]],hit?'#a6cbd4':PLATE,EDGE,1.5);
  polygon(c,[[r*0.04,-r*0.19],[r*0.64,-r*0.12],[r*0.76,0],[r*0.64,r*0.12],[r*0.04,r*0.19]],
   '#0a202e','#69d7e6',1.25);
  c.fillStyle=hit?'#ffffff':'#c7fbff';c.beginPath();c.arc(r*0.4,0,r*0.11,0,TAU);c.fill();
  c.strokeStyle='#6b8798';c.lineWidth=1;c.beginPath();
  c.moveTo(-r*0.22,-r*0.27);c.lineTo(r*0.1,-r*0.23);
  c.moveTo(-r*0.22,r*0.27);c.lineTo(r*0.1,r*0.23);c.stroke();
  c.fillStyle='#55e2fa';c.fillRect(-r*0.73,-r*0.37,2.4,3.2);c.fillRect(-r*0.73,r*0.27,2.4,3.2);
 }finally{c.restore();}
 return true;
}
function titan(c,e,tx,ty,ms){
 const t=motionTime(ms),phase=Math.min(3,Math.max(1,Number(e.v12Combat&&e.v12Combat.phase)||1));
 const r=Math.max(29,Math.min(78,e.radius*1.08));
 const aim=Number.isFinite(tx)&&Number.isFinite(ty)?Math.atan2(ty-e.y,tx-e.x):0;
 const danger=phase===3?'#ffe5a4':phase===2?'#ffc07d':'#fca34f';
 const hit=Number(e.hitFlash)>0;
 c.save();
 try{
  c.rotate(aim);
  ring(c,r*0.96,danger);
  // Six major silhouette masses — heavy asymmetrical siege armor, not a scaled scout.
  polygon(c,[[-r*0.87,-r*0.45],[-r*0.7,-r*0.92],[-r*0.12,-r*0.94],
             [r*0.25,-r*0.65],[-r*0.1,-r*0.24]],'#263a4b',EDGE,2.2);
  polygon(c,[[-r*0.87,r*0.45],[-r*0.7,r*0.92],[-r*0.12,r*0.94],
             [r*0.25,r*0.65],[-r*0.1,r*0.24]],'#263a4b',EDGE,2.2);
  // Front ram and braced gun assembly.
  polygon(c,[[r*0.3,-r*0.46],[r*0.86,-r*0.35],[r*0.99,-r*0.15],
             [r*0.99,r*0.15],[r*0.86,r*0.35],[r*0.3,r*0.46]],
             '#182b3a','#e4c49d',1.9);
  polygon(c,[[-r*0.55,-r*0.35],[-r*0.1,-r*0.66],[r*0.49,-r*0.38],
             [r*0.66,0],[r*0.49,r*0.38],[-r*0.1,r*0.66],[-r*0.55,r*0.35]],
             hit?'#9caeb7':PLATE,EDGE,2.0);
  // Armor plating is broad and readable at normal gameplay zoom.
  polygon(c,[[-r*0.43,-r*0.35],[-r*0.17,-r*0.54],[r*0.15,-r*0.37],[-r*0.02,-r*0.19]],
             STEEL,'#7192a4',1.05);
  polygon(c,[[-r*0.43,r*0.35],[-r*0.17,r*0.54],[r*0.15,r*0.37],[-r*0.02,r*0.19]],
             STEEL,'#7192a4',1.05);
  // Contained amber reactor: phases visibly activate outer armor conduits.
  c.fillStyle='#071521';c.strokeStyle=danger;c.lineWidth=2.3;
  c.beginPath();c.arc(-r*0.04,0,r*0.31,0,TAU);c.fill();c.stroke();
  c.fillStyle=hit?'#ffffff':'#ffb14d';c.beginPath();
  c.arc(-r*0.04,0,r*(0.13+0.013*Math.sin(t*4)),0,TAU);c.fill();
  c.strokeStyle=danger;c.lineWidth=phase===3?2.6:1.4;
  for(const side of [-1,1]){
   c.beginPath();c.moveTo(-r*0.02,side*r*0.32);c.lineTo(r*0.20,side*r*0.52);
   c.lineTo(r*0.55,side*r*0.38);c.stroke();
  }
  if(phase>1){
   c.globalAlpha=phase===3?0.92:0.63;
   c.strokeStyle=danger;c.lineWidth=phase===3?2:1.3;
   c.beginPath();c.arc(-r*0.04,0,r*0.47,-PI*0.38,PI*0.38);c.stroke();
  }
  screws(c,r*0.9);
 }finally{c.restore();}
 return true;
}
function drawEnemy(c,e,tx,ty,ms){
 if(!c||!e||!Number.isFinite(e.radius)||e.radius<=0)return false;
 // Keep V17's opt-out for side-by-side comparisons and emergency fallback.
 if(root.location&&/(?:[?&])enemyArt=legacy(?:&|$)/.test(root.location.search||''))return false;
 if(e.type==='boss'&&e.subType==='tank_boss')return titan(c,e,tx,ty,ms);
 if(e.type!=='boss'&&(e.variantId==='scout'||(e.isElite&&e.type==='green'&&!e.variantId)))
   return scout(c,e,tx,ty,ms);
 return false;
}
function drawCompanion(c,skinId,key,star,angle,ms){
 if(!c||!['default_tech','ghost_wisp'].includes(skinId)||!Object.prototype.hasOwnProperty.call(ACCENT,key))return false;
 return echo(c,key,star,angle,ms,skinId==='ghost_wisp');
}
root.TowerUnifiedCharactersV17=Object.freeze({
 drawEnemy,drawCompanion,
 getState(){return {referenceCharacters:['default_tech','scout','tank_boss'],styles:'lost-signal-industrial-v1'};}
});
})(typeof window!=='undefined'?window:globalThis);
