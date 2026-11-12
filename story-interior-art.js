/* LOST SIGNAL interior presentation. No saves, targeting, hitboxes or game-state writes. */
(function(root){'use strict';
 const TAU=Math.PI*2,roles=new WeakMap();
 const palettes=['#70c9dc','#e3b46e','#9fbbef','#82d7ba','#c3a1e6','#d3a477','#75b9db','#bf9ce9','#efd395'];
 const titles=['İLK TEMAS','GÜÇ HATTI','UYANIŞ','İMKÂNSIZ ARŞİV','KIRIK BELLEK','SAHTE ÇIKIŞ','SESSİZ FİLO','MOR SINIR','SON BAĞLANTI'];
 const reduced=!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.6;c.stroke()}}
 function disc(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
 function enemy(c,e,ms){
  let role=e.kind;if(!role){role=roles.get(e);if(!role){role=['scout','armored','sapper'][Math.abs(Math.round(e.startY??e.y))%3];roles.set(e,role)}}
  const color=role==='armored'?'#c4d6e2':role==='sapper'?'#ffc682':'#f5a6b6';
  c.save();c.translate(e.x,e.y);c.lineJoin='round';disc(c,0,2,21,'#060e19');
  c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.arc(0,0,21,.2,2.7);c.stroke();
  if(role==='armored'){
   poly(c,[[-18,-11],[-10,-17],[10,-17],[18,-11],[18,12],[9,18],[-9,18],[-18,12]],'#26394b',color);
   for(const side of [-1,1]){c.fillStyle='#526879';c.fillRect(side<0?-17:11,-9,6,19);c.fillStyle='#d4e5eb';c.fillRect(side<0?-16:12,-6,3,7)}
  }else if(role==='sapper'){
   poly(c,[[0,-20],[17,-8],[13,14],[0,19],[-13,14],[-17,-8]],'#443333',color);
   c.fillStyle='#be7549';c.fillRect(-19,-4,7,15);c.fillRect(12,-4,7,15);disc(c,0,7,5,'#ffbf65');
  }else{
   poly(c,[[0,-20],[16,8],[7,14],[0,10],[-7,14],[-16,8]],'#302a42',color);
   c.fillStyle='#88617b';c.fillRect(-15,5,5,10);c.fillRect(10,5,5,10);
  }
  poly(c,[[-9,-9],[9,-9],[10,0],[5,4],[-5,4],[-10,0]],'#081321','#607788');
  c.fillStyle=color;c.fillRect(-6,-5,12,3);c.fillStyle='#fff3db';c.fillRect(-2,-5,4,2);
  c.font='bold 11px system-ui';c.textAlign='center';c.textBaseline='alphabetic';c.lineWidth=3;c.strokeStyle='#06101b';c.strokeText(String(e.hp),0,-27);c.fillStyle='#f4f8ff';c.fillText(String(e.hp),0,-27);c.restore();
 }
 function pilot(c,p,mission,ms,pikoVisible){
  c.save();c.translate(p.x,p.y);disc(c,0,3,16,'#05101a');
  poly(c,[[-10,-2],[-13,8],[-7,14],[7,14],[13,8],[10,-2]],'#24455b','#85cddf');
  c.fillStyle='#162b3c';c.fillRect(-10,12,7,6);c.fillRect(3,12,7,6);
  poly(c,[[-8,-13],[8,-13],[12,-6],[9,3],[-9,3],[-12,-6]],'#466e83','#d9f3f4');
  poly(c,[[-8,-9],[8,-9],[7,-3],[-7,-3]],'#061724','#90e5ec');
  c.fillStyle='#e3d6ab';c.fillRect(-3,6,6,4);
  if(pikoVisible){
   c.translate(25,-22+(reduced?0:Math.sin((ms||0)/450)*1.5));
   disc(c,0,0,10,'#091321');
   poly(c,[[-8,-5],[-3,-9],[6,-7],[10,0],[6,7],[-4,8],[-9,3]],'#3b3558','#c9b3ef');
   c.fillStyle='#8f7eb4';c.fillRect(-12,-2,4,7);c.fillRect(9,-2,4,7);
   c.fillStyle='#e7f8e9';c.fillRect(-4,-2,3,3);c.fillRect(2,-2,3,3);
   c.strokeStyle='#c0a6e9';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-8);c.lineTo(2,-13);c.stroke();disc(c,2,-13,1.5,'#f6d18c');
  }c.restore();
 }
 function station(c,s,near){
  c.save();c.translate(s.x,s.y);c.textAlign='center';c.lineJoin='round';
  const color=near?'#efffa7':'#91dbe4';
  poly(c,[[-25,-17],[-18,-24],[18,-24],[25,-17],[25,18],[17,24],[-17,24],[-25,18]],'#0a1925',color);
  c.fillStyle='#345465';c.fillRect(-19,16,38,5);
  c.fillStyle='#173c4d';c.fillRect(-18,-17,36,25);
  c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(-13,0);c.lineTo(-7,0);c.lineTo(-3,-10);c.lineTo(2,3);c.lineTo(7,-6);c.lineTo(13,-6);c.stroke();
  for(let i=0;i<3;i++){disc(c,-10+i*10,12,2,i===0?color:'#4d7180')}
  c.font='bold 12px system-ui';c.lineWidth=4;c.strokeStyle='#06101b';c.strokeText(s.name||s.label||'',0,-34);c.fillStyle='#e7f5fa';c.fillText(s.name||s.label||'',0,-34);
  if(near){c.fillStyle='#e8f8b5';c.fillRect(-38,31,76,22);c.fillStyle='#0b222c';c.font='bold 11px system-ui';c.fillText('ETKİLEŞ',0,46)}
  c.restore();
 }
 function environment(c,mission,width=1100,height=590){
  const chapter=Math.max(0,Math.min(8,Math.floor((mission-1)/3))),accent=palettes[chapter];
  c.save();c.strokeStyle=accent;c.lineWidth=2;c.globalAlpha=.45;
  // Edge-mounted hardware and floor route markings leave interaction areas clear.
  for(let room=0;room<3;room++){
   const left=48+room*(width-90)/3,right=left+(width-90)/3-30;
   c.beginPath();c.moveTo(left,105);c.lineTo(left,235);c.moveTo(left,365);c.lineTo(left,height-65);c.lineTo(left+48,height-65);c.stroke();
   c.globalAlpha=.75;
   for(let i=0;i<4;i++){c.fillStyle='#091721';c.fillRect(right-54+i*13,height-63,9,23);c.fillStyle=accent;c.fillRect(right-52+i*13,height-59,5,3+i%2*5)}
   c.globalAlpha=.22;c.fillStyle=accent;
   for(let i=0;i<3;i++){const x=left+58+i*15;c.beginPath();c.moveTo(x,294);c.lineTo(x+6,300);c.lineTo(x,306);c.lineTo(x+2,300);c.fill()}
   c.globalAlpha=.45;
  }
  c.globalAlpha=.6;c.fillStyle=accent;c.font='10px monospace';c.textAlign='left';c.fillText('LS / '+String(chapter+1).padStart(2,'0')+'  '+titles[chapter],62,height-30);
  c.restore();
 }
 root.StoryInteriorArt=Object.freeze({enemy,pilot,environment,station});
})(typeof window!=='undefined'?window:globalThis);
