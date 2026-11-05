/* LOST SIGNAL · stage 1.3: 20 distinct normal-enemy silhouette families.
 * Presentation only. No new enemy IDs, AI, save fields, radii, attack timing or hitboxes.
 * The first reference Scout remains in TowerUnifiedCharactersV17; all bosses stay
 * in the V17 boss pipeline until the dedicated boss art stage.
 */
(function(root){'use strict';
const TAU=Math.PI*2, PI=Math.PI;
const INK='#08111f', BODY='#1a2c3a', STEEL='#304b5d', EDGE='#d7edf7';
const FAMILIES=Object.freeze({
 circuit:{era:'core',kind:'circuit',accent:'#65e6b9'},
 drone:{era:'core',kind:'rotor',accent:'#8bdcf8'},
 shield:{era:'khan',kind:'bulwark',accent:'#ffbd7c'},
 raider:{era:'khan',kind:'razor',accent:'#ff907f'},
 amber:{era:'khan',kind:'orbiter',accent:'#ffd180'},
 redrunner:{era:'khan',kind:'dart',accent:'#ffae86'},
 ice:{era:'snow',kind:'ice',accent:'#a9edff'},
 glacier:{era:'snow',kind:'glacier',accent:'#8ac6ff'},
 snowghost:{era:'snow',kind:'specter',accent:'#e0f5ff'},
 scorpion:{era:'desert',kind:'scorpion',accent:'#f9c879'},
 cactus:{era:'desert',kind:'cactus',accent:'#a4e8a1'},
 sand:{era:'desert',kind:'sand',accent:'#edd6a8'},
 violet:{era:'nebula',kind:'phase',accent:'#d0afff'},
 prism:{era:'nebula',kind:'prism',accent:'#dbbaff'},
 void:{era:'nebula',kind:'void',accent:'#c0a6ff'},
 nebula:{era:'nebula',kind:'nebula',accent:'#9bafff'},
 pulse:{era:'nebula',kind:'pulse',accent:'#ffacd7'},
 bubble:{era:'dream',kind:'bubble',accent:'#ffcade'},
 butterfly:{era:'dream',kind:'moth',accent:'#a9d2ff'},
 candy:{era:'dream',kind:'candy',accent:'#ffaad5'}
});
const IDS=Object.freeze(Object.keys(FAMILIES));
function path(c,p,fill,stroke=EDGE,width=1.25){
 c.beginPath();c.moveTo(p[0][0],p[0][1]);
 for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);
 c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function line(c,p,color=EDGE,width=1.3){
 c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(p[0][0],p[0][1]);
 for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.stroke();
}
function disc(c,x,y,r,fill,stroke=null,width=1){
 c.beginPath();c.arc(x,y,r,0,TAU);
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function mirrored(c,points,fill,stroke=EDGE,w=1.35){
 path(c,points,fill,stroke,w);
 path(c,points.map(([x,y])=>[x,-y]),fill,stroke,w);
}
function backing(c,r,accent){
 // Each silhouette has an opaque dark contrast shield and a neutral light edge;
 // this avoids red-on-red and blue-on-blue disappearances at native game zoom.
 disc(c,0,0,r*0.72,'rgba(3,9,20,0.91)');
 c.strokeStyle='rgba(231,246,255,0.90)';c.lineWidth=1.55;
 c.beginPath();c.arc(0,0,r*0.83,PI*0.73,PI*1.88);c.stroke();
 c.strokeStyle=accent;c.lineWidth=1.85;
 c.beginPath();c.arc(0,0,r*0.88,-0.58,0.51);c.stroke();
}
function hull(c,r,accent){
 path(c,[[-r*.70,0],[-r*.38,-r*.45],[r*.37,-r*.48],[r*.73,0],
        [r*.37,r*.48],[-r*.38,r*.45]],BODY,'#bcd4e0',1.45);
 path(c,[[-r*.38,0],[-r*.13,-r*.25],[r*.36,-r*.22],[r*.50,0],
        [r*.36,r*.22],[-r*.13,r*.25]],'#102536',accent,1.1);
}
function sensor(c,r,accent,x=0,y=0){
 disc(c,x,y,Math.max(2.25,r*.125),'#e9fbff',accent,1.5);
}
function paintFamily(c,kind,r,a){
 switch(kind){
 case 'circuit':
  hull(c,r,a);mirrored(c,[[-r*.38,-r*.30],[-r*.65,-r*.63],[-r*.22,-r*.55]],
   STEEL,a,1.1);line(c,[[-r*.2,0],[r*.1,0],[r*.4,-r*.2]],a,1.7);
  sensor(c,r,a,r*.15,0);break;
 case 'rotor':
  mirrored(c,[[-r*.52,-r*.12],[-r*.76,-r*.65],[r*.20,-r*.64],[r*.55,-r*.25]],
   '#284354','#c7eaf4',1.35);hull(c,r*.78,a);
  mirrored(c,[[-r*.1,-r*.49],[r*.25,-r*.70],[r*.52,-r*.50]],STEEL,a,1);
  sensor(c,r,a,r*.2,0);break;
 case 'bulwark':
  path(c,[[-r*.78,-r*.55],[-r*.32,-r*.86],[r*.48,-r*.69],[r*.84,0],
    [r*.48,r*.69],[-r*.32,r*.86],[-r*.78,r*.55]],'#263b48',EDGE,2.1);
  path(c,[[-r*.55,0],[-r*.2,-r*.49],[r*.4,-r*.38],[r*.68,0],
    [r*.4,r*.38],[-r*.2,r*.49]],'#112537',a,1.6);
  line(c,[[r*.15,-r*.33],[r*.15,r*.33]],'#f5e9d7',2);
  sensor(c,r,a,-r*.08,0);break;
 case 'razor':
  mirrored(c,[[-r*.82,-r*.32],[-r*.53,-r*.91],[r*.11,-r*.70],[r*.43,-r*.29]],
   '#35424b','#ffcab4',1.45);hull(c,r*.85,a);
  path(c,[[r*.34,-r*.22],[r*.94,0],[r*.34,r*.22]],'#503039',a,1.7);
  sensor(c,r,a,r*.20,0);break;
 case 'orbiter':
  hull(c,r*.87,a);
  mirrored(c,[[-r*.18,-r*.52],[r*.3,-r*.81],[r*.73,-r*.40],[r*.47,-r*.26]],
   STEEL,a,1.2);
  disc(c,-r*.06,0,r*.34,'#071929',a,1.7);
  sensor(c,r,a,-r*.06,0);break;
 case 'dart':
  mirrored(c,[[-r*.92,-r*.31],[-r*.53,-r*.64],[r*.24,-r*.29],[r*.54,-r*.17]],
   '#2a3c4c','#e9e0d5',1.3);
  path(c,[[-r*.76,0],[-r*.2,-r*.23],[r*.98,0],[-r*.2,r*.23]],'#3d3540',a,1.8);
  line(c,[[-r*.40,0],[r*.67,0]],'#ffe8db',1.3);
  sensor(c,r,a,r*.28,0);break;
 case 'ice':
  mirrored(c,[[-r*.42,-r*.14],[-r*.54,-r*.68],[r*.03,-r*.94],[r*.46,-r*.38]],
   '#325267','#caefff',1.1);
  path(c,[[-r*.62,0],[-r*.17,-r*.37],[r*.74,0],[-r*.17,r*.37]],
   '#173a4d',a,1.65);sensor(c,r,a,r*.08,0);break;
 case 'glacier':
  path(c,[[-r*.79,-r*.53],[-r*.27,-r*.89],[r*.36,-r*.78],[r*.84,-r*.21],
    [r*.84,r*.21],[r*.36,r*.78],[-r*.27,r*.89],[-r*.79,r*.53]],
    '#3c6071',EDGE,1.9);
  mirrored(c,[[-r*.50,-r*.32],[-r*.18,-r*.64],[r*.34,-r*.47],[r*.04,-r*.1]],
    '#1a3c54',a,1.15);sensor(c,r,a,-r*.04,0);break;
 case 'specter':
  path(c,[[-r*.63,-r*.43],[-r*.18,-r*.78],[r*.60,-r*.45],[r*.77,0],
   [r*.48,r*.43],[r*.1,r*.61],[-r*.29,r*.38],[-r*.66,r*.55]],'#223b50',EDGE,1.5);
  mirrored(c,[[-r*.34,-r*.46],[r*.01,-r*.69],[r*.46,-r*.29]],
   'rgba(140,204,235,0.42)',a,1.05);
  disc(c,r*.08,0,r*.25,'#082435',a,1.45);sensor(c,r,a,r*.12,0);break;
 case 'scorpion':
  mirrored(c,[[-r*.67,-r*.17],[-r*.83,-r*.71],[-r*.4,-r*.76],[-r*.12,-r*.41]],
   '#4b4540',a,1.3);hull(c,r*.70,a);
  path(c,[[-r*.83,0],[-r*.60,-r*.35],[-r*.28,-r*.50],[-r*.05,-r*.20]],
   '#735742','#ffe7aa',1.35);
  path(c,[[r*.30,-r*.23],[r*.99,-r*.52],[r*.69,0],[r*.99,r*.52],[r*.30,r*.23]],
   '#594a40',a,1.4);sensor(c,r,a,r*.22,0);break;
 case 'cactus':
  hull(c,r*.83,a);
  mirrored(c,[[-r*.5,-r*.31],[-r*.47,-r*.88],[-r*.17,-r*.49],[r*.14,-r*.86],[r*.25,-r*.27]],
   '#34564e','#cff5b5',1.3);
  path(c,[[r*.41,-r*.19],[r*.91,0],[r*.41,r*.19]],'#254f40',a,1.25);
  sensor(c,r,a,r*.16,0);break;
 case 'sand':
  mirrored(c,[[-r*.88,-r*.45],[-r*.44,-r*.73],[r*.32,-r*.54],[r*.58,-r*.24]],
   '#675848','#ecd8ae',1.5);
  path(c,[[-r*.67,0],[-r*.21,-r*.32],[r*.72,-r*.2],[r*.85,0],
   [r*.72,r*.2],[-r*.21,r*.32]],'#2d3940',a,1.5);
  mirrored(c,[[-r*.1,-r*.3],[r*.13,-r*.46],[r*.48,-r*.28]],
   '#b18c5d','#f9e9b6',.85);sensor(c,r,a,r*.17,0);break;
 case 'phase':
  mirrored(c,[[-r*.88,-r*.15],[-r*.51,-r*.83],[r*.05,-r*.56],[r*.56,-r*.13]],
   '#403b61','#decaff',1.4);
  path(c,[[-r*.49,0],[-r*.09,-r*.27],[r*.82,0],[-r*.09,r*.27]],
   '#2b2847',a,1.45);
  mirrored(c,[[-r*.26,-r*.36],[r*.07,-r*.60],[r*.41,-r*.33]],
   '#69507b',a,1);sensor(c,r,a,r*.25,0);break;
 case 'prism':
  path(c,[[-r*.74,0],[-r*.18,-r*.87],[r*.68,-r*.47],[r*.91,0],
   [r*.68,r*.47],[-r*.18,r*.87]],'#38334e','#f3dbff',1.75);
  path(c,[[-r*.28,0],[r*.18,-r*.55],[r*.67,0],[r*.18,r*.55]],
   '#514369',a,1.2);
  line(c,[[-r*.14,-r*.50],[r*.2,0],[-r*.14,r*.50]],'#ead8ff',1.4);
  sensor(c,r,a,r*.20,0);break;
 case 'void':
  disc(c,0,0,r*.73,'#090e21','#d1c5ec',1.65);
  mirrored(c,[[-r*.64,-r*.17],[-r*.36,-r*.74],[r*.41,-r*.80],[r*.14,-r*.38]],
   '#282949','#9f9bda',1.2);
  path(c,[[r*.15,-r*.26],[r*.82,0],[r*.15,r*.26]],'#1b213c',a,1.55);
  sensor(c,r,a,r*.09,0);break;
 case 'nebula':
  mirrored(c,[[-r*.85,-r*.47],[-r*.50,-r*.85],[r*.32,-r*.71],[r*.55,-r*.15]],
   '#34364d','#c6d6ff',1.25);
  hull(c,r*.70,a);
  mirrored(c,[[-r*.45,-r*.3],[r*.03,-r*.48],[r*.39,-r*.24]],
   '#4d4a71',a,1.05);
  sensor(c,r,a,r*.13,0);break;
 case 'pulse':
  path(c,[[-r*.73,-r*.52],[-r*.32,-r*.77],[r*.57,-r*.43],[r*.78,0],
   [r*.57,r*.43],[-r*.32,r*.77],[-r*.73,r*.52]],'#383344',EDGE,1.6);
  disc(c,0,0,r*.38,'#172437',a,1.9);
  disc(c,0,0,r*.18,'#f7f4ff',a,1.3);
  mirrored(c,[[-r*.54,-r*.28],[-r*.37,-r*.48],[r*.29,-r*.46],[r*.52,-r*.28]],
   '#58435d',a,1.1);break;
 case 'bubble':
  disc(c,0,0,r*.77,'#263749',EDGE,1.5);
  disc(c,-r*.20,-r*.13,r*.39,'#304257',a,1.1);
  disc(c,r*.27,r*.20,r*.28,'#203b4b','#ffdfeb',1.2);
  mirrored(c,[[-r*.68,-r*.48],[-r*.90,-r*.53],[-r*.55,-r*.16]],
   '#465668',a,.9);sensor(c,r,a,r*.1,-r*.08);break;
 case 'moth':
  mirrored(c,[[-r*.45,-r*.13],[-r*.83,-r*.74],[-r*.24,-r*.90],[r*.27,-r*.41]],
   '#45516a','#bde0ff',1.5);
  mirrored(c,[[-r*.16,-r*.15],[-r*.44,-r*.42],[r*.02,-r*.61],[r*.27,-r*.26]],
   '#354862',a,1.2);
  path(c,[[-r*.55,0],[-r*.16,-r*.22],[r*.75,0],[-r*.16,r*.22]],
   '#1b3346',a,1.65);sensor(c,r,a,r*.22,0);break;
 case 'candy':
  path(c,[[-r*.80,-r*.30],[-r*.46,-r*.71],[r*.12,-r*.86],[r*.69,-r*.35],
   [r*.86,0],[r*.69,r*.35],[r*.12,r*.86],[-r*.46,r*.71],[-r*.80,r*.30]],
   '#48364c','#ffdeea',1.75);
  path(c,[[-r*.49,0],[-r*.03,-r*.58],[r*.57,0],[-r*.03,r*.58]],'#623e5d',a,1.3);
  line(c,[[-r*.17,-r*.44],[r*.37,-r*.10],[r*.37,r*.10],[-r*.17,r*.44]],
   '#ffe4f2',1.45);sensor(c,r,a,r*.11,0);break;
 default:return false;
 }
 return true;
}
// Stage 1.7: cache static industrial chassis at 2x source resolution.
// Each frame only translates/rotates its body; identity, active hit cues and
// combat-state references remain live. FIFO cap prevents long-session growth.
const SPRITE_CACHE=new Map(),CACHE_LIMIT=96;
let cacheHits=0,cacheMisses=0;
function cachedBody(c,id,def,r){
 // WebKit on iPad exhibited costly deferred Canvas-to-Canvas blits in QA.
 // Preserve its stable native vector path; Chromium safely uses the 2x cache.
 const ua=root.navigator&&typeof root.navigator.userAgent==='string'?
    root.navigator.userAgent:'';
 const safariWebKit=/AppleWebKit/i.test(ua)&&
    !/(?:Chrome|Chromium|Edg)\//i.test(ua);
 if(safariWebKit||!root.document||
    typeof root.document.createElement!=='function'||
    typeof c.drawImage!=='function')return false;
 const resolution=Math.round(r*10)/10;
 const key=id+':'+resolution;
 let sprite=SPRITE_CACHE.get(key);
 if(sprite){
  cacheHits++;
 }else{
  try{
   const padding=Math.ceil(resolution*1.28+4),ratio=2;
   const canvas=root.document.createElement('canvas');
   const size=padding*2*ratio;
   canvas.width=size;canvas.height=size;
   const cc=canvas.getContext('2d');
   if(!cc)return false;
   cc.scale(ratio,ratio);cc.translate(padding,padding);
   backing(cc,resolution,def.accent);
   paintFamily(cc,def.kind,resolution,def.accent);
   sprite={canvas,padding};
   if(SPRITE_CACHE.size>=CACHE_LIMIT)
    SPRITE_CACHE.delete(SPRITE_CACHE.keys().next().value);
   SPRITE_CACHE.set(key,sprite);
   cacheMisses++;
  }catch(_){return false;}
 }
 try{
  c.drawImage(sprite.canvas,-sprite.padding,-sprite.padding,
   sprite.padding*2,sprite.padding*2);
  return true;
 }catch(_){return false;}
}
function drawEnemy(c,e,tx,ty,ms){
 if(!c||!e||e.type==='boss'||!Number.isFinite(e.radius)||e.radius<=0)return false;
 if(root.location&&/(?:[?&])enemyArt=legacy(?:&|$)/.test(root.location.search||''))return false;
 const id=e.variantId;
 if(typeof id!=='string'||!Object.prototype.hasOwnProperty.call(FAMILIES,id))return false;
 const def=FAMILIES[id];
 // The world-space enemy.radius remains unchanged; only the Canvas body grows.
 const radius=Math.min(e.isElite?32:29,Math.max(e.isElite?19:17,e.radius*1.40));
 const phase=Number.isFinite(e.animPhase)?e.animPhase:0;
 let time=0;
 try{
  if(!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches))
   time=Number.isFinite(ms)?ms*.001:0;
 }catch(_){}
 const targetFacing=Number.isFinite(tx)&&Number.isFinite(ty)&&
   Number.isFinite(e.x)&&Number.isFinite(e.y)?Math.atan2(ty-e.y,tx-e.x):0;
 c.save();
 try{
  c.rotate(targetFacing);
  c.translate(0,Math.sin(time*3.2+phase)*0.32);
  // Always preserve complete vector geometry as a safe fallback (test doubles,
  // older Canvas implementations or a failed offscreen allocation).
  if(!cachedBody(c,id,def,radius)){
   backing(c,radius,def.accent);
   paintFamily(c,def.kind,radius,def.accent);
  }
  // A small warm hit marker; never substitute this for the game's damage feedback.
  if(Number(e.hitFlash)>0){
   c.strokeStyle='#fff4db';c.lineWidth=1.9;
   c.beginPath();c.arc(0,0,radius*.86,-PI*.35,-PI*.03);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
root.TowerUnifiedEnemyFamiliesV17=Object.freeze({
 drawEnemy,IDS,
 getState(){return {familyCount:IDS.length,styles:'lost-signal-industrial-v1.7-cached',
  cacheEntries:SPRITE_CACHE.size,cacheLimit:CACHE_LIMIT,cacheHits,cacheMisses,
  eras:Object.freeze(['core','khan','snow','desert','nebula','dream'])};}
});
})(typeof window!=='undefined'?window:globalThis);
