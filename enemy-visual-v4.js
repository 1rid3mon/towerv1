/* TowerV1 V4: distinctive additive silhouettes for 21 variant identities.
 * Pure drawing, never changes spawn/combat/save state. Draw after drawCustomEnemy.
 */
(function(root){'use strict';
const TAU=Math.PI*2;
function draw(c,e,ms,quality){
 const all=root.TowerEnemyDiversity?.VARIANTS;
 const v=all?.find(x=>x.id===e?.variantId);
 if(!v||!c||!Number.isFinite(e.radius)||e.radius<=0)return false;
 const r=e.radius,t=(Number(ms)||0)*.001,p=(Number(e.animPhase)||0),pulse=Math.sin(t*3+p),low=quality==='low';
 const hp=Number(e.hp),max=Number(e.maxHp),hurt=max>0?Math.max(0,Math.min(1,1-hp/max)):0;
 c.save();
 try{
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=v.accent;c.fillStyle=v.color;c.lineWidth=Math.max(1,r*.09);
  const poly=(pts,fill=v.color)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x*r,y*r):c.moveTo(x*r,y*r));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=v.accent;c.stroke();};
  const line=(pts,w=.09)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x*r,y*r):c.moveTo(x*r,y*r));c.strokeStyle=v.accent;c.lineWidth=Math.max(.8,r*w);c.stroke();};
  const dot=(x,y,rad,color=v.accent)=>{c.beginPath();c.arc(x*r,y*r,rad*r,0,TAU);c.fillStyle=color;c.fill();};
  // All outlines have a distinct silhouette even when rendered in monochrome.
  switch(v.id){
   case 'scout': for(const s of [-1,1]){line([[s*.32,-.6],[s*.62,-1.34]]);dot(s*.62,-1.34,.12)}poly([[-.45,-.85],[0,-1.16],[.45,-.85],[.29,-.57],[-.29,-.57]]);break;
   case 'circuit': for(let i=0;i<6;i++){const a=i*TAU/6;poly([[Math.cos(a-.2)*.72,Math.sin(a-.2)*.72],[Math.cos(a)*1.48,Math.sin(a)*1.48],[Math.cos(a+.2)*.72,Math.sin(a+.2)*.72]])}break;
   case 'drone': for(const s of [-1,1]){poly([[s*.5,-.3],[s*1.42,-.52],[s*1.55,.18],[s*.5,.32]]);dot(s*1.23,-.13,.16,'#eff6ff')}break;
   case 'shield': for(const s of [-1,1]){poly([[s*.65,-.84],[s*1.56,-.66],[s*1.45,.58],[s*.91,.91],[s*.67,.27]]);line([[s*1.14,-.52],[s*1.16,.53]],.14)}break;
   case 'raider': for(const s of [-1,1]){poly([[s*.38,-.2],[s*1.46,-1.36],[s*1.02,-.16],[s*.57,.32]]);line([[s*.7,-.42],[s*1.22,-1.02]],.08)}break;
   case 'amber': case 'violet': case 'snowghost': {const count=v.id==='snowghost'?5:3;for(let i=0;i<count;i++){let a=i*TAU/count+t*(v.id==='violet'?.5:.3)+p;poly([[Math.cos(a-.23)*.95,Math.sin(a-.23)*.95],[Math.cos(a)*1.48,Math.sin(a)*1.48],[Math.cos(a+.23)*.95,Math.sin(a+.23)*.95]])}if(!low){c.globalAlpha=.65;dot(0,0,.24,'#ffffff')}break;}
   case 'prism': for(let i=0;i<4;i++){let a=i*TAU/4;poly([[Math.cos(a-.34)*.72,Math.sin(a-.34)*.72],[Math.cos(a)*1.58,Math.sin(a)*1.58],[Math.cos(a+.34)*.72,Math.sin(a+.34)*.72]])}break;
   case 'ice': for(let i=0;i<6;i++){let a=i*TAU/6;poly([[Math.cos(a-.15)*.74,Math.sin(a-.15)*.74],[Math.cos(a)*1.52,Math.sin(a)*1.52],[Math.cos(a+.15)*.74,Math.sin(a+.15)*.74]])}break;
   case 'glacier': for(const s of [-1,1]){poly([[s*.56,-.78],[s*1.34,-1.05],[s*1.65,-.14],[s*1.21,.7],[s*.68,.66]]);poly([[s*.3,-.9],[s*.68,-1.32],[s*.89,-.74]])}break;
   case 'redrunner': for(const s of [-1,1]){poly([[-.26,s*.28],[-1.55,s*1.2],[-.81,s*.1]]);poly([[.31,s*.4],[1.24,s*.94],[.64,s*.13]])}break;
   case 'scorpion': poly([[-.62,.14],[-1.27,.63],[-1.55,.21],[-1.45,-.71],[-1.14,-1.06],[-.88,-.62]]);for(const s of [-1,1]){poly([[s*.53,-.36],[s*1.3,-.7],[s*1.48,-.24],[s*.8,.07]]);line([[s*.55,.3],[s*1.17,.86],[s*1.48,.57]])}break;
   case 'cactus': for(const s of [-1,1]){poly([[s*.58,-.7],[s*1.37,-.62],[s*1.53,.4],[s*.77,.82]]);for(let j=0;j<3;j++)line([[s*1.1,-.48+j*.38],[s*1.58,-.7+j*.38]])}break;
   case 'sand': for(const s of [-1,1]){poly([[s*.54,-.48],[s*1.46,-.2],[s*1.48,.13],[s*.54,.27]]);dot(s*1.35,-.03,.11,'#fff7ed')}poly([[-.35,-.7],[0,-1.35],[.35,-.7]]);break;
   case 'void': for(const s of [-1,1]){poly([[s*.32,-.37],[s*1.5,-1.2],[s*.8,.15]]);poly([[s*.35,.31],[s*1.39,1.16],[s*.64,.6]])}break;
   case 'nebula': for(const s of [-1,1]){poly([[s*.57,-.82],[s*1.46,-.56],[s*1.46,.51],[s*.7,.88]]);dot(s*1.08,0,.2,'#f5d0fe')}break;
   case 'pulse': for(let i=0;i<4;i++){let a=i*TAU/4+t*.2;dot(Math.cos(a)*1.32,Math.sin(a)*1.32,.19)}if(!low){c.globalAlpha=.6;c.beginPath();c.ellipse(0,0,r*1.46,r*.7,t*.5,0,TAU);c.stroke()}break;
   case 'bubble': for(const [x,y,z] of [[-1.08,-.62,.34],[1.18,-.38,.25],[-.92,.83,.23],[.85,.95,.32]]){dot(x,y+Math.sin(t*2+x)*.08,z,'#fce7f3');dot(x-.08,y-.07,z*.22,'#ffffff')}break;
   case 'butterfly': for(const s of [-1,1]){poly([[s*.12,-.32],[s*1.56,-1.15],[s*1.42,.02],[s*.4,.25]]);poly([[s*.25,.15],[s*1.34,.48],[s*1.02,1.12],[s*.1,.46]]);dot(s*.96,-.4,.17,'#fdf2f8')}break;
   case 'candy': for(let i=0;i<5;i++){let a=i*TAU/5;poly([[Math.cos(a-.32)*.73,Math.sin(a-.32)*.73],[Math.cos(a)*1.43,Math.sin(a)*1.43],[Math.cos(a+.32)*.73,Math.sin(a+.32)*.73]])}dot(0,0,.32,'#fdf4ff');break;
  }
  // Hit and damage information: readable but no additional particles per frame.
  if(hurt>.35){c.globalAlpha=Math.min(.9,(hurt-.3)*1.4);line([[-.3,-.42],[.04,-.16],[-.13,.15],[.3,.4]],.065);if(hurt>.68)line([[.28,-.35],[.12,.02],[.44,.32]],.05)}
  if(e.isElite){c.globalAlpha=.8;dot(0,-1.45,.15,'#fbbf24')}
  return true;
 }finally{c.restore()}
}
root.TowerEnemyVisualV4=Object.freeze({draw});
})(typeof window!=='undefined'?window:globalThis);
