/* LOST SIGNAL V17.1 / Stage 1.4 · collectible companion skin art.
 * The existing Echo and Ghost Wisp are handled by TowerUnifiedCharactersV17.
 * These remaining eight draw on the same ink/steel/signal technology. Visual only:
 * no unlocks, inventory, ownership, role stats, transforms or save data touched.
 */
(function(root){'use strict';
const PI=Math.PI, TAU=PI*2;
const INK='#08111f', STEEL='#294457', PLATE='#172d41', EDGE='#d1e5f0';
const SKINS=Object.freeze({
 origami_crane:{accent:'#a9e8ff',feature:'folded-wing'},
 cyber_prism:{accent:'#88eaf4',feature:'quantum-diamond'},
 shadow_kunai:{accent:'#c8bafa',feature:'quad-blades'},
 crimson_sand:{accent:'#ffac83',feature:'hourglass'},
 drama_mask:{accent:'#f2c4df',feature:'dual-mask'},
 valkyrie_halo:{accent:'#f4d38e',feature:'guardian-wings'},
 eclipse_crescent:{accent:'#ffd08a',feature:'crescent-sensor'},
 kurt_spirit:{accent:'#9fdcff',feature:'wolf-totem'}
});
const ROLE=Object.freeze({laserDrone:'#fb9ea6',frostOrb:'#9adffa',
 missileBot:'#ffc48c',repairDrone:'#83e4bd',plasmaSatellite:'#d1b5ff'});
const IDS=Object.freeze(Object.keys(SKINS));
function poly(c,points,fill,stroke=EDGE,width=1.2){
 c.beginPath();c.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
 c.closePath();if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function mirror(c,points,fill,stroke=EDGE,width=1.2){
 poly(c,points,fill,stroke,width);
 poly(c,points.map(([x,y])=>[x,-y]),fill,stroke,width);
}
function disc(c,x,y,r,fill,stroke=null,width=1){
 c.beginPath();c.arc(x,y,r,0,TAU);
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function line(c,points,stroke=EDGE,width=1.3){
 c.beginPath();c.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
 c.strokeStyle=stroke;c.lineWidth=width;c.stroke();
}
function techPlate(c,signal){
 // A universal tactical backing and restrained visor unify costumed companions.
 disc(c,0,0,15.35,'rgba(2,8,18,0.92)');
 c.strokeStyle='rgba(229,245,255,0.83)';c.lineWidth=1.3;
 c.beginPath();c.arc(0,0,15.6,PI*.76,PI*1.82);c.stroke();
 c.strokeStyle=signal;c.lineWidth=1.6;
 c.beginPath();c.arc(0,0,16.5,-.56,.53);c.stroke();
 mirror(c,[[-8,-4],[-13,-5],[-13,-2],[-9,-1]],'#314e60',EDGE,1);
 poly(c,[[-10,-6],[-4,-10],[6,-10],[11,-5],[11,5],
     [6,10],[-4,10],[-10,6]],INK,EDGE,1.5);
 poly(c,[[-7,-5],[-3,-7],[6,-7],[8,-3],[8,3],[5,7],[-3,7],[-7,4]],
    PLATE,'#66879a',.85);
 // White locator is always visible on saturated Cengiz and dark cyber themes.
 disc(c,1,0,2,'#ebfbff',signal,1.2);
}
function cosmetic(c,id,a,role,t){
 switch(id){
 case 'origami_crane':
  // Paper-folding heritage becomes two articulated steel-origami wing blades.
  mirror(c,[[-5,-2],[-17,-11],[-11,-3],[-17,-1],[-5,5]],
    '#526d7f','#f1f9ff',1.6);
  mirror(c,[[0,-3],[7,-15],[11,-10],[5,-1]],'#d0e1e9',a,1.15);
  poly(c,[[2,-4],[13,-1],[15,2],[3,3]],'#344e63',a,1.2);
  line(c,[[-13,-7],[-8,-2],[-2,-2]],a,1.45);
  break;
 case 'cyber_prism':
  poly(c,[[0,-15],[13,-6],[16,3],[3,15],[-12,9],[-15,-4]],
    '#324257','#e2f7ff',1.45);
  poly(c,[[0,-12],[10,-4],[2,0],[-5,-1]],'#486578',a,1.1);
  poly(c,[[2,1],[13,-2],[11,6],[3,13]],'#19334d',a,1.2);
  line(c,[[-11,8],[2,0],[3,13]],'#b7eaff',1.4);
  disc(c,2,1,3.3,'#dfffff',a,1.45);
  break;
 case 'shadow_kunai':
  for(let i=0;i<4;i++){
   c.save();c.rotate(i*PI/2);
   poly(c,[[-5,-4],[-5,-14],[0,-18],[5,-14],[5,-4]],
     '#3d4056','#ddd7f5',1.3);
   poly(c,[[0,-16],[2,-11],[0,-7],[-2,-11]],'#6a6487',a,.9);
   c.restore();
  }
  disc(c,0,0,4.4,'#0a1322',a,1.4);
  disc(c,0,0,1.8,'#ecf5ff');
  break;
 case 'crimson_sand':
  // Armored signal chronometer; the red hourglass remains its unmistakable emblem.
  mirror(c,[[-6,-9],[-12,-11],[-12,-6],[-6,-5]],'#4a4350',a,1.25);
  poly(c,[[-8,-12],[8,-12],[5,-7],[3,0],[5,7],[8,12],
   [-8,12],[-5,7],[-3,0],[-5,-7]],'#203549',EDGE,1.8);
  poly(c,[[-4,-8],[4,-8],[0,-1]],'#aa4c43','#ffceaa',1.1);
  poly(c,[[-4,8],[4,8],[0,2]],'#f4a76a','#ffd9b9',1.1);
  line(c,[[-10,-12],[10,-12]],a,1.7);line(c,[[-10,12],[10,12]],a,1.7);
  break;
 case 'drama_mask':
  // Paired asymmetric ceramic faceplates: tragedy and comedy, not a single emoji.
  poly(c,[[-12,-9],[-1,-11],[1,6],[-6,12],[-13,5]],'#dae6ee',a,1.5);
  poly(c,[[1,-10],[12,-9],[13,6],[6,12],[-1,6]],'#45576a','#f6d9ed',1.5);
  disc(c,-8,-3,1.55,INK);disc(c,-2,-3,1.45,INK);
  disc(c,4,-3,1.45,'#f6d3ec');disc(c,9,-3,1.45,'#f6d3ec');
  line(c,[[-10,5],[-6,2],[-2,5]],INK,1.1);
  line(c,[[3,3],[6,6],[10,3]],'#f4c8e7',1.1);
  break;
 case 'valkyrie_halo':
  mirror(c,[[-2,-5],[-9,-15],[-18,-17],[-15,-7],[-8,-2]],
     '#c5d5dc','#fff2cf',1.4);
  mirror(c,[[-8,-8],[-15,-14],[-14,-7],[-8,-3]],
     '#5e7781',a,1.0);
  // Controlled gold halo arch, no large blur.
  c.strokeStyle=a;c.lineWidth=2.05;c.beginPath();
  c.arc(0,0,13.4,PI*1.06,PI*1.94);c.stroke();
  poly(c,[[-4,-3],[0,-8],[5,-3],[4,7],[-4,7]],'#2c4655',a,1.3);
  disc(c,0,0,2.5,'#fff2cb',a,1.4);
  break;
 case 'eclipse_crescent':
  disc(c,0,0,12,'#243346',a,1.6);
  disc(c,0,0,9,'#d7a85b');
  // Masking crescent with solid metal disk, not global compositing/transparency.
  disc(c,4,-2,8.5,INK,'#b3c5d3',1);
  poly(c,[[8,-3],[15,-1],[10,4]],'#e2ba78','#fff0d1',1.15);
  disc(c,4,1,2,'#e5fbff',a,1.15);
  break;
 case 'kurt_spirit':
  // Mechanized wolf head / two ears / distinctive blue eyes; no decorative emoji.
  poly(c,[[-12,-1],[-12,-15],[-5,-9],[0,-13],[5,-9],[12,-15],
    [12,-1],[7,9],[0,14],[-7,9]],'#31485b','#c5e7ff',1.7);
  mirror(c,[[-10,-12],[-8,-4],[-3,-5]],'#6e9cae',a,1);
  poly(c,[[-6,2],[0,7],[6,2],[2,10],[-2,10]],'#1a3044','#a3d7f7',1.1);
  disc(c,-5,0,2.1,'#c9eeff',a,1.25);
  disc(c,5,0,2.1,'#c9eeff',a,1.25);
  poly(c,[[-2,6],[2,6],[0,9]],'#f3d796',null);
  // A short amber crescent insignia respects the collectible's totem identity.
  c.strokeStyle='#f3cf7f';c.lineWidth=1.5;c.beginPath();
  c.arc(0,-8,3.3,PI*.05,PI*.97);c.stroke();
  break;
 default:return false;
 }
 // The same small role light marks all five functional companion roles.
 disc(c,-8,0,1.5,role,a,0.7);
 return true;
}
function drawCompanion(c,skin,key,star,angle,ms){
 if(!c||!Object.prototype.hasOwnProperty.call(SKINS,skin)||
   !Object.prototype.hasOwnProperty.call(ROLE,key))return false;
 const spec=SKINS[skin];
 const level=Math.min(5,Math.max(1,Number(star)||1));
 let t=0;
 try{if(!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches))
   t=Number.isFinite(ms)?ms*.001:0;}catch(_){}
 const direction=Number.isFinite(angle)?angle:0;
 c.save();
 try{
  c.rotate(direction);
  // Comparable to Echo's 40-50px footprint, without changing companion position.
  const scale=1.18*(1+level*.035);
  c.scale(scale,scale);
  c.translate(0,Math.sin(t*2.6)*.45);
  techPlate(c,spec.accent);
  cosmetic(c,skin,spec.accent,ROLE[key],t);
  if(level>=4){
   c.strokeStyle=spec.accent;c.lineWidth=.85;c.globalAlpha=.52;
   c.beginPath();c.arc(0,0,17,t*.35,t*.35+PI*.50);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
root.TowerCompanionSkinsV17=Object.freeze({
 drawCompanion,IDS,
 getState(){return {skinCount:IDS.length,styles:'lost-signal-industrial-v1.4',
  skins:IDS.slice()};}
});
})(typeof window!=='undefined'?window:globalThis);
