/* LOST SIGNAL Stage 1.5 · Five boss bodies, three mechanically distinct visual phases.
 * Drawing only: preserves boss IDs, radius/hitbox, battle logic, save state and telegraphs.
 * Canvas polygons rather than sprites ensure the same authored industrial material grammar
 * as the other LOST SIGNAL families. May fall back to earlier V17 renderers.
 */
(function(root){'use strict';
const PI=Math.PI,TAU=PI*2;
const INK='#07121f', PLATE='#1a3042', STEEL='#355264', EDGE='#d4eaf3';
const BOSSES=Object.freeze({
 tank_boss:{name:'Armored Titan',color:'#ffbd70',kind:'siege'},
 ranged_boss:{name:'Hyperion Artillery',color:'#ff9cab',kind:'battery'},
 speed_boss:{name:'Crimson Vector',color:'#ff8b81',kind:'interceptor'},
 frost_boss:{name:'Kryos',color:'#97e9ff',kind:'citadel'},
 leviathan:{name:'Cosmic Leviathan',color:'#d3abff',kind:'abyss'}
});
const IDS=Object.freeze(Object.keys(BOSSES));
function poly(c,pts,fill,stroke=EDGE,width=1.5){
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function mirror(c,pts,fill,stroke=EDGE,width=1.4){
 poly(c,pts,fill,stroke,width);
 poly(c,pts.map(([x,y])=>[x,-y]),fill,stroke,width);
}
function circle(c,x,y,r,fill,stroke=null,width=1.4){
 c.beginPath();c.arc(x,y,r,0,TAU);
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function path(c,pts,stroke=EDGE,width=1.3){
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 c.strokeStyle=stroke;c.lineWidth=width;c.stroke();
}
function backing(c,r,color){
 circle(c,0,0,r*.94,'rgba(2,8,18,0.94)');
 c.strokeStyle='rgba(232,245,255,0.9)';c.lineWidth=1.75;
 c.beginPath();c.arc(0,0,r*.965,PI*.68,PI*1.82);c.stroke();
 c.strokeStyle=color;c.lineWidth=2;
 c.beginPath();c.arc(0,0,r*.99,-.56,.56);c.stroke();
}
function core(c,r,color,phase,flash,t){
 circle(c,-r*.02,0,r*.29,INK,color,phase===3?2.6:1.9);
 circle(c,-r*.02,0,r*(.105+Math.sin(t*2.5)*.009),
  flash?'#ffffff':phase===3?'#fff1cb':phase===2?'#e7f8ff':color);
 // Readable circuit spokes; energy is constrained within the body.
 for(const s of [-1,1]){
  path(c,[[r*.15,s*r*.16],[r*.36,s*r*.31],[r*.48,s*r*.23]],
   color,phase===3?2.5:1.4);
 }
}
function primaryHull(c,r,color,flash){
 mirror(c,[[-r*.73,-r*.16],[-r*.63,-r*.62],[-r*.17,-r*.78],
  [r*.28,-r*.62],[r*.58,-r*.31]],'#273b4c',EDGE,1.6);
 poly(c,[[-r*.52,0],[-r*.27,-r*.45],[r*.43,-r*.43],[r*.68,0],
  [r*.43,r*.43],[-r*.27,r*.45]],flash?'#8da5b4':PLATE,EDGE,2);
 mirror(c,[[-r*.39,-r*.21],[-r*.22,-r*.39],[r*.22,-r*.32],
  [r*.06,-r*.19]],STEEL,'#7095a6',1.05);
}
function siege(c,r,color,phase,flash,t){
 // Six heavy armour masses and a forward ram: the established Titan identity.
 mirror(c,[[-r*.87,-r*.4],[-r*.78,-r*.92],[-r*.18,-r*.94],
  [r*.24,-r*.72],[r*.08,-r*.32]],'#344859',EDGE,2.05);
 poly(c,[[r*.3,-r*.46],[r*.86,-r*.35],[r*.99,-r*.15],
  [r*.99,r*.15],[r*.86,r*.35],[r*.3,r*.46]],'#1b2a38',color,1.9);
 primaryHull(c,r,color,flash);
 if(phase>=2){
  mirror(c,[[-r*.39,-r*.54],[-r*.22,-r*.90],[r*.20,-r*.88],
    [r*.39,-r*.58],[r*.16,-r*.48]],'#526375',color,1.75);
 }
 if(phase===3){
  mirror(c,[[r*.08,-r*.66],[r*.35,-r*.96],[r*.65,-r*.83],
    [r*.52,-r*.52]],'#835b4a','#fff1c8',1.8);
  poly(c,[[r*.55,-r*.19],[r*1.02,0],[r*.55,r*.19]],
    '#a87350','#fff1c8',1.6);
 }
 core(c,r,color,phase,flash,t);
}
function battery(c,r,color,phase,flash,t){
 // Twin flanking artillery barrels are visible even without projectile FX.
 mirror(c,[[-r*.82,-r*.30],[-r*.72,-r*.76],
  [r*.27,-r*.76],[r*.77,-r*.48],[r*.77,-r*.25]],
  '#344656','#e4dce8',1.8);
 primaryHull(c,r,color,flash);
 mirror(c,[[-r*.16,-r*.65],[r*.63,-r*.65],[r*.97,-r*.53],
  [r*.97,-r*.38],[-r*.16,-r*.38]],'#28394b',color,1.85);
 if(phase>=2){
  mirror(c,[[-r*.52,-r*.77],[-r*.47,-r*.97],[r*.34,-r*.96],
   [r*.60,-r*.78]],'#5a4654','#ffe0e5',1.7);
 }
 if(phase===3){
  // Two extra exposed ammunition rails; does not add attacks.
  mirror(c,[[r*.18,-r*.84],[r*.97,-r*.87],[r*1.04,-r*.70],
    [r*.30,-r*.70]],'#8c4756','#ffe6ef',1.6);
  poly(c,[[r*.48,-r*.22],[r*1.05,0],[r*.48,r*.22]],
    '#744653','#ffd5dd',1.3);
 }
 core(c,r,color,phase,flash,t);
}
function interceptor(c,r,color,phase,flash,t){
 // Arrow nose, swept wings and a narrow high-speed chassis.
 mirror(c,[[-r*.88,-r*.18],[-r*.74,-r*.82],
  [r*.13,-r*.56],[r*.52,-r*.23]],'#3b4250','#ffc3bf',1.85);
 poly(c,[[-r*.67,0],[-r*.24,-r*.29],[r*.83,-r*.14],[r*1.02,0],
  [r*.83,r*.14],[-r*.24,r*.29]],flash?'#829aaa':'#28384a',EDGE,1.7);
 mirror(c,[[-r*.63,-r*.43],[-r*.87,-r*.60],[-r*.79,-r*.30],
  [-r*.35,-r*.17]],'#694750',color,1.2);
 if(phase>=2){
  mirror(c,[[-r*.44,-r*.42],[-r*.30,-r*.86],[r*.15,-r*.74],
   [r*.37,-r*.32]],'#60404c','#fff0df',1.65);
 }
 if(phase===3){
  mirror(c,[[-r*.26,-r*.67],[-r*.14,-r*1.02],
   [r*.48,-r*.88],[r*.36,-r*.53]],'#965054','#ffe3ce',1.65);
  poly(c,[[r*.48,-r*.17],[r*1.08,0],[r*.48,r*.17]],
   '#a64d51','#ffefcf',1.5);
 }
 circle(c,r*.08,0,r*.16,INK,color,1.9);
 circle(c,r*.08,0,r*.075,flash?'#ffffff':'#ffefdf');
}
function citadel(c,r,color,phase,flash,t){
 // Frost fortress: heavy six-sided ice armour, not a scaled scout.
 poly(c,[[-r*.92,0],[-r*.64,-r*.79],[0,-r*.94],[r*.65,-r*.71],
  [r*.89,0],[r*.65,r*.71],[0,r*.94],[-r*.64,r*.79]],
  '#315269','#d2f5ff',1.9);
 mirror(c,[[-r*.65,-r*.43],[-r*.29,-r*.78],[r*.28,-r*.71],
   [r*.46,-r*.34]],'#527388','#a1eaff',1.4);
 poly(c,[[-r*.45,0],[-r*.13,-r*.48],[r*.47,0],[-r*.13,r*.48]],
   flash?'#9abed0':PLATE,color,1.8);
 if(phase>=2){
  mirror(c,[[-r*.75,-r*.59],[-r*.49,-r*.97],
   [-r*.05,-r*.91],[r*.15,-r*.58]],'#8abac9','#effdff',1.55);
 }
 if(phase===3){
  // Cryo crown visibly extends the outer armour in phase 3.
  mirror(c,[[r*.20,-r*.72],[r*.39,-r*1.03],
    [r*.69,-r*.94],[r*.75,-r*.57]],'#a6dce8','#fff',1.7);
  poly(c,[[r*.54,-r*.18],[r*1.06,0],[r*.54,r*.18]],
    '#84bdca','#f5ffff',1.45);
 }
 core(c,r,color,phase,flash,t);
}
function abyss(c,r,color,phase,flash,t){
 // Leviathan: asymmetrical broken-shell tendrils and massive signal reactor.
 mirror(c,[[-r*.87,-r*.12],[-r*.72,-r*.85],[-r*.33,-r*.93],
  [r*.02,-r*.54]],'#36394e','#e3d4ff',1.85);
 mirror(c,[[r*.03,-r*.32],[r*.23,-r*.84],[r*.79,-r*.78],
  [r*.55,-r*.29]],'#4b4866','#dbbdff',1.55);
 poly(c,[[-r*.45,0],[-r*.29,-r*.33],[r*.23,-r*.48],
  [r*.68,0],[r*.23,r*.48],[-r*.29,r*.33]],
  flash?'#a79ab7':PLATE,EDGE,1.8);
 if(phase>=2){
  mirror(c,[[-r*.48,-r*.67],[-r*.40,-r*.99],[-r*.03,-r*.91],
    [r*.16,-r*.57]],'#5c4d72',color,1.7);
 }
 if(phase===3){
  mirror(c,[[r*.27,-r*.77],[r*.61,-r*1.06],[r*.95,-r*.88],
    [r*.65,-r*.46]],'#765482','#f8ddff',1.65);
  poly(c,[[r*.57,-r*.21],[r*1.08,0],[r*.57,r*.21]],
    '#6f4e80','#f7dcff',1.45);
 }
 core(c,r,color,phase,flash,t);
}
const PAINTERS=Object.freeze({
 siege,battery,interceptor,citadel,abyss
});
function motionTime(ms){
 try{if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)return 0;}catch(_){}
 return Number.isFinite(ms)?ms*.001:0;
}
function drawEnemy(c,e,tx,ty,ms){
 if(!c||!e||e.type!=='boss'||!Number.isFinite(e.radius)||e.radius<=0)return false;
 if(root.location&&/(?:[?&])enemyArt=legacy(?:&|$)/.test(root.location.search||''))return false;
 const cfg=BOSSES[e.subType];
 if(!cfg||!Object.prototype.hasOwnProperty.call(BOSSES,e.subType))return false;
 const phase=Math.min(3,Math.max(1,Math.trunc(Number(e.v12Combat&&e.v12Combat.phase)||1)));
 // Bounds protect frame time and prevent an oversized image impersonating a hitbox.
 const r=Math.min(82,Math.max(29,e.radius*1.07));
 const t=motionTime(ms);
 const facing=Number.isFinite(tx)&&Number.isFinite(ty)&&
  Number.isFinite(e.x)&&Number.isFinite(e.y)?Math.atan2(ty-e.y,tx-e.x):0;
 c.save();
 try{
  c.rotate(facing);
  c.translate(0,Math.sin(t*1.65)*.34);
  backing(c,r,cfg.color);
  PAINTERS[cfg.kind](c,r,cfg.color,phase,Number(e.hitFlash)>0,t);
 }finally{c.restore();}
 return true;
}
root.TowerBossFamiliesV17=Object.freeze({
 drawEnemy,IDS,
 getState(){return {bossCount:IDS.length,phaseCount:3,
  styles:'lost-signal-industrial-v1.5',bosses:IDS.slice()};}
});
})(typeof window!=='undefined'?window:globalThis);
