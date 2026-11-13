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
  const kind=String(s.type||s.kind||'');
  if(/core|reactor|defense|security/.test(kind)){c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(0,-5,10,0,TAU);c.stroke();disc(c,0,-5,5,color)}
  else if(/clue|log|record|evidence/.test(kind)){for(let i=0;i<3;i++){c.fillStyle=i===0?color:'#527d8e';c.fillRect(-12,-12+i*6,24-i*4,2)}}
  else if(/exit|door/.test(kind)){c.strokeStyle=color;c.lineWidth=3;c.strokeRect(-9,-14,18,20);c.beginPath();c.moveTo(-5,-4);c.lineTo(7,-4);c.lineTo(3,-8);c.moveTo(7,-4);c.lineTo(3,0);c.stroke()}
  else {c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(-13,0);c.lineTo(-7,0);c.lineTo(-3,-10);c.lineTo(2,3);c.lineTo(7,-6);c.lineTo(13,-6);c.stroke();}
  for(let i=0;i<3;i++){disc(c,-10+i*10,12,2,i===0?color:'#4d7180')}
  c.font='bold 12px system-ui';c.lineWidth=4;c.strokeStyle='#06101b';c.strokeText(s.name||s.label||'',0,-34);c.fillStyle='#e7f5fa';c.fillText(s.name||s.label||'',0,-34);
  if(near){c.fillStyle='#e8f8b5';c.fillRect(-38,31,76,22);c.fillStyle='#0b222c';c.font='bold 11px system-ui';c.fillText('ETKİLEŞ',0,46)}
  c.restore();
 }
 const scenery=new Map();
 function paintEnvironment(c,chapter,width,height){
  const accent=palettes[chapter],mode=chapter%3;
  c.save();c.lineWidth=1;
  // Inset deck plates: decoration never changes collision geometry.
  for(let y=65;y<height-70;y+=62)for(let x=65;x<width-70;x+=76){
   c.fillStyle=(Math.floor(x/76)+Math.floor(y/62))%2?'#102b3938':'#03111b48';
   c.fillRect(x,y,70,56);c.strokeStyle='#81b9c015';c.strokeRect(x+.5,y+.5,70,56);
   c.fillStyle='#b4d2d129';c.fillRect(x+4,y+4,2,2);c.fillRect(x+64,y+50,2,2);
  }
  for(let room=0;room<3;room++){
   const center=185+room*(width-90)/3;
   // Recessed ceiling light washes, without shadow blur per frame.
   const glow=c.createRadialGradient(center,82,4,center,82,180);
   glow.addColorStop(0,accent+'28');glow.addColorStop(1,accent+'00');c.fillStyle=glow;c.fillRect(center-180,42,360,240);
   c.fillStyle='#07131e';c.fillRect(center-54,48,108,19);c.fillStyle='#405363';c.fillRect(center-48,50,96,4);c.fillStyle=accent;c.fillRect(center-38,58,76,3);
   c.globalAlpha=.18;c.strokeStyle=accent;c.lineWidth=2;c.beginPath();c.arc(center,height*.53,58,0,TAU);c.stroke();
   c.beginPath();c.arc(center,height*.53,66,.3,2.4);c.arc(center,height*.53,66,3.5,5.7);c.stroke();
   c.font='bold 38px monospace';c.textAlign='center';c.fillStyle=accent;c.fillText(String(room+1).padStart(2,'0'),center,height*.53+13);c.globalAlpha=1;
   // Three distinct equipment families, alternating with chapter identity.
   const y=height-78;
   for(let i=0;i<3;i++){
    const x=center-48+i*35;c.fillStyle='#050e18';c.fillRect(x+3,y+5,29,37);
    poly(c,[[x,y],[x+25,y],[x+29,y+5],[x+29,y+32],[x,y+32]],'#1d3040','#496477');
    if(mode===0){for(let k=0;k<4;k++){c.fillStyle=k===chapter%4?accent:'#314c60';c.fillRect(x+5,y+5+k*6,19,3)}}
    else if(mode===1){disc(c,x+14,y+15,10,'#091925');c.strokeStyle=accent;c.beginPath();c.arc(x+14,y+15,7,.3,4.9);c.stroke();disc(c,x+14,y+15,3,accent)}
    else{c.fillStyle='#091721';c.fillRect(x+4,y+4,21,18);c.strokeStyle=accent;c.beginPath();c.moveTo(x+7,y+16);c.lineTo(x+11,y+8);c.lineTo(x+17,y+18);c.lineTo(x+23,y+9);c.stroke();}
   }
   c.globalAlpha=.36;c.strokeStyle=accent;c.lineWidth=2;c.beginPath();c.moveTo(center-60,height-39);c.lineTo(center+65,height-39);c.stroke();c.globalAlpha=1;
  }
  // Chapter-specific signal scars: archives, circuitry, orbital traces.
  c.save();c.globalAlpha=.12;c.strokeStyle=accent;c.lineWidth=2;
  for(let i=0;i<5;i++){const x=85+i*19;
   c.beginPath();if(chapter===3||chapter===4){c.moveTo(x,180);c.lineTo(x+40,210+i*13);c.lineTo(x+12,255+i*13)}
   else if(chapter===6||chapter===8){c.ellipse(width-155,height*.5,60+i*12,100+i*8,.35,0,TAU)}
   else{c.moveTo(x,185);c.lineTo(x,230+i*9);c.lineTo(x+25,255+i*9);c.lineTo(x+25,360)}c.stroke();
  }c.restore();
  c.font='bold 11px monospace';c.textAlign='left';c.fillStyle=accent;c.globalAlpha=.65;c.fillText('LOST SIGNAL / '+String(chapter+1).padStart(2,'0')+' / '+titles[chapter],65,height-25);
  c.restore();
 }
 function environment(c,mission,width=1100,height=590){
  const chapter=Math.max(0,Math.min(8,Math.floor((mission-1)/3))),key=chapter+':'+width+':'+height;
  let layer=scenery.get(key);
  if(!layer){
   layer=typeof root.OffscreenCanvas==='function'?new root.OffscreenCanvas(width,height):root.document?.createElement('canvas');
   if(!layer){paintEnvironment(c,chapter,width,height);return}
   layer.width=width;layer.height=height;paintEnvironment(layer.getContext('2d'),chapter,width,height);
   if(scenery.size>=27)scenery.delete(scenery.keys().next().value);scenery.set(key,layer);
  }
  c.drawImage(layer,0,0);
 }
 root.StoryInteriorArt=Object.freeze({enemy,pilot,environment,station});
})(typeof window!=='undefined'?window:globalThis);
