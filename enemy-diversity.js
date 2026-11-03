/* TowerV1 enemy diversity V2: visual identities only, no combat-stat changes. */
(function(root){'use strict';
const VARIANTS=[
{id:'scout',name:'Siber İzci',base:'green',wave:1,theme:'core',color:'#34d399',accent:'#a7f3d0',shape:'antenna'},
{id:'circuit',name:'Devre Paraziti',base:'green',wave:1,theme:'core',color:'#2dd4bf',accent:'#99f6e4',shape:'spikes'},
{id:'drone',name:'İyon Gözcüsü',base:'ranged',wave:2,theme:'aurora',color:'#38bdf8',accent:'#bae6fd',shape:'orbit'},
{id:'shield',name:'Kalkanlı Muhafız',base:'tank',wave:15,theme:'khan',color:'#fb923c',accent:'#fed7aa',shape:'shield'},
{id:'raider',name:'Kızıl Akıncı',base:'green',wave:15,theme:'khan',color:'#f87171',accent:'#fecaca',shape:'blades'},
{id:'amber',name:'Kehribar Psişik',base:'teleporter',wave:15,theme:'khan',color:'#facc15',accent:'#fef08a',shape:'orbit'},
{id:'violet',name:'Mor Spektral',base:'teleporter',wave:20,theme:'nebula',color:'#c084fc',accent:'#e9d5ff',shape:'orbit'},
{id:'prism',name:'Prizma Gözcüsü',base:'ranged',wave:20,theme:'nebula',color:'#a78bfa',accent:'#ddd6fe',shape:'crystal'},
{id:'ice',name:'Buzul Nöbetçisi',base:'frost',wave:30,theme:'snow',color:'#67e8f9',accent:'#ecfeff',shape:'crystal'},
{id:'glacier',name:'Kristal Dev',base:'tank',wave:30,theme:'snow',color:'#7dd3fc',accent:'#e0f2fe',shape:'crystal'},
{id:'snowghost',name:'Kar Hayaleti',base:'teleporter',wave:30,theme:'snow',color:'#bae6fd',accent:'#ffffff',shape:'orbit'},
{id:'redrunner',name:'Kızıl Koşucu',base:'runner',wave:40,theme:'khan',color:'#fb7185',accent:'#ffe4e6',shape:'blades'},
{id:'scorpion',name:'Kum Akrebi',base:'runner',wave:45,theme:'desert',color:'#f59e0b',accent:'#fde68a',shape:'tail'},
{id:'cactus',name:'Dikenli Golem',base:'tank',wave:45,theme:'desert',color:'#84cc16',accent:'#d9f99d',shape:'spikes'},
{id:'sand',name:'Çöl Avcısı',base:'ranged',wave:45,theme:'desert',color:'#fdba74',accent:'#ffedd5',shape:'antenna'},
{id:'void',name:'Boşluk Avcısı',base:'runner',wave:60,theme:'nebula',color:'#a855f7',accent:'#f5d0fe',shape:'blades'},
{id:'nebula',name:'Nebula Muhafızı',base:'tank',wave:60,theme:'nebula',color:'#818cf8',accent:'#c7d2fe',shape:'shield'},
{id:'pulse',name:'Kuantum Gözü',base:'ranged',wave:60,theme:'nebula',color:'#e879f9',accent:'#fae8ff',shape:'orbit'},
{id:'bubble',name:'Sakız Bombacısı',base:'ranged',wave:100,theme:'dream',color:'#f9a8d4',accent:'#fce7f3',shape:'orbit'},
{id:'butterfly',name:'Kelebek Drone',base:'runner',wave:100,theme:'dream',color:'#93c5fd',accent:'#fbcfe8',shape:'wings'},
{id:'candy',name:'Şeker Kristali',base:'tank',wave:100,theme:'dream',color:'#f0abfc',accent:'#fdf4ff',shape:'crystal'}
];
const byBase={};for(const v of VARIANTS)(byBase[v.base]??=[]).push(v);
// Thematic wave director: visual-only, no enemy type or combat-stat mutations.
// Uses a stable spawn ordinal to prevent same-wave random visual soup.
const ERAS=[
 {start:1,end:14,family:'core',support:['aurora'],share:0.85},
 {start:15,end:29,family:'khan',support:['core','nebula'],share:0.75},
 {start:30,end:44,family:'snow',support:['core','khan'],share:0.80},
 {start:45,end:59,family:'desert',support:['khan','snow'],share:0.80},
 {start:60,end:99,family:'nebula',support:['core','desert'],share:0.80},
 {start:100,end:Infinity,family:'dream',support:['nebula','desert'],share:0.75}
];
const hash=(wave,n)=>((Math.imul(wave|0,1664525)+Math.imul(n|0,1013904223))>>>0);
function era(wave){return ERAS.find(e=>wave>=e.start&&wave<=e.end)||ERAS[0];}
function preferredFamily(wave,ordinal){
 const e=era(wave), slot=((ordinal%20)+20)%20;
 // Distribute minority spawns across the wave, not as one block.
 const permutation=(slot*13+7)%20;
 const mainSlots=Math.round(e.share*20);
 if(permutation<mainSlots)return e.family;
 return e.support[(hash(wave,ordinal)%e.support.length)];
}
function select(base,wave,ordinal){
 const options=(byBase[base]||[]).filter(v=>wave>=v.wave);
 if(!options.length)return null;
 const wanted=preferredFamily(wave,ordinal);
 const primary=options.filter(v=>v.theme===wanted);
 if(primary.length)return primary[hash(wave,ordinal)%primary.length];
 // Existing combat archetypes remain unchanged. If this archetype has no
 // art for the active era, prefer an unlocked support family, then a legacy skin.
 const e=era(wave);
 const support=options.filter(v=>e.support.includes(v.theme));
 if(support.length)return support[hash(wave,ordinal)%support.length];
 return options[hash(wave,ordinal)%options.length];
}
function decorate(enemy,wave,ordinal){if(!enemy||enemy.type==='boss'||enemy.isElite||!Number.isFinite(wave))return enemy;
 const base=enemy.subType==='purple'?'teleporter':enemy.subType||enemy.type;const v=select(base,wave,ordinal);if(!v)return enemy;
 enemy.variantId=v.id;enemy.name=v.name;enemy.color=v.color;enemy.secColor=v.accent;return enemy;
}
function draw(ctx,e,time){const v=VARIANTS.find(v=>v.id===e?.variantId);if(!v||!ctx)return;const r=Math.max(5,Number(e.radius)||12),t=(Number(time)||0)*0.001;ctx.save();ctx.lineWidth=Math.max(1,r*.10);ctx.strokeStyle=v.accent;ctx.fillStyle=v.color;ctx.globalAlpha=.82;
 const line=(a,b,c,d)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();};
 if(v.shape==='antenna'){for(const s of [-1,1]){line(s*r*.4,-r*.45,s*r*.65,-r*1.25);ctx.beginPath();ctx.arc(s*r*.65,-r*1.25,r*.12,0,Math.PI*2);ctx.fill();}}
 if(v.shape==='spikes'||v.shape==='crystal'){for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.12;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(-r*.2,-r*.8);ctx.lineTo(0,-r*(v.shape==='crystal'?1.55:1.3));ctx.lineTo(r*.2,-r*.8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}}
 if(v.shape==='orbit'){ctx.beginPath();ctx.ellipse(0,0,r*1.3,r*.6,t*.65,0,Math.PI*2);ctx.stroke();for(let i=0;i<2;i++){let a=t*1.5+i*Math.PI;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.2,Math.sin(a)*r*.55,r*.14,0,Math.PI*2);ctx.fill();}}
 if(v.shape==='shield'){for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.7,-r*.6);ctx.lineTo(s*r*1.4,-r*.45);ctx.lineTo(s*r*1.3,r*.65);ctx.lineTo(s*r*.75,r*.8);ctx.closePath();ctx.fill();ctx.stroke();}}
 if(v.shape==='blades'||v.shape==='wings'){for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-r*.2,s*r*.3);ctx.lineTo(-r*1.5,s*r*(v.shape==='wings'?1.4:.85));ctx.lineTo(-r*.65,s*r*.15);ctx.closePath();ctx.fill();ctx.stroke();}}
 if(v.shape==='tail'){line(-r*.65,r*.4,-r*1.35,r*.8);line(-r*1.35,r*.8,-r*1.45,-r*.5);ctx.beginPath();ctx.arc(-r*1.45,-r*.5,r*.18,0,Math.PI*2);ctx.fill();}
 ctx.restore();}
root.TowerEnemyDiversity={VARIANTS,ERAS,era,preferredFamily,select,decorate,draw};
})(typeof window!=='undefined'?window:globalThis);
