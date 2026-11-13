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
  c.save();c.translate(p.x,p.y);c.fillStyle='#02091399';c.beginPath();c.ellipse(2,12,19,9,0,0,TAU);c.fill();
  // Asymmetric rescue suit: oxygen pack, ceramic shoulders, amber service stripe.
  poly(c,[[-13,-7],[-17,-3],[-16,11],[-10,14],[-7,7],[-8,-6]],'#1e374a','#7193a2');
  poly(c,[[10,-8],[16,-3],[17,9],[11,12],[7,6]],'#334b60','#abc0cb');
  poly(c,[[-9,-6],[8,-6],[12,8],[6,17],[-8,15],[-12,5]],'#233c51','#6e9aa9');
  c.fillStyle='#0b1725';c.fillRect(-10,13,8,7);c.fillRect(3,14,8,6);c.fillStyle='#d5d1b5';c.fillRect(-8,17,5,2);c.fillRect(5,17,5,2);
  poly(c,[[-9,-17],[7,-18],[13,-11],[11,0],[4,5],[-7,3],[-13,-5]],'#5c778b','#d0e2e6');
  poly(c,[[-9,-11],[8,-13],[10,-7],[6,-1],[-7,-2]],'#051722','#80dce9');
  c.fillStyle='#daf9ec';c.fillRect(-6,-10,8,2);c.fillStyle='#e6b66d';c.fillRect(8,2,3,10);c.fillStyle='#91bfce';c.fillRect(-5,6,8,5);c.fillStyle='#102331';c.fillRect(-3,7,4,2);
  if(pikoVisible){
   c.translate(26,-23+(reduced?0:Math.sin((ms||0)/450)*1.5));
   c.fillStyle='#070d2099';c.beginPath();c.ellipse(0,15,10,4,0,0,TAU);c.fill();
   poly(c,[[-9,-6],[-4,-11],[6,-10],[11,-4],[10,6],[4,10],[-6,8],[-11,1]],'#71658e','#dfd5ed');
   poly(c,[[-7,-5],[7,-5],[8,2],[3,6],[-6,4]],'#111b31','#ac9dd6');
   for(const sign of [-1,1]){poly(c,[[sign*10,-3],[sign*15,-6],[sign*16,3],[sign*10,6]],'#3c4867','#8aa6bf');c.fillStyle='#9ee4ec';c.fillRect(sign<0?-14:12,5,2,4)}
   disc(c,-3,0,2,'#c9f8f3');disc(c,4,0,2,'#c9f8f3');c.strokeStyle='#d6c8f2';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-10);c.lineTo(2,-15);c.stroke();disc(c,2,-15,2,'#f4c784');
  }c.restore();
 }
 function boss(c,e,ms){
  const warning=e.telegraphUntil>ms,color=warning?'#ffd58a':'#bdacd9';
  c.save();c.translate(e.x,e.y);disc(c,2,7,31,'#030915bb');
  for(const sign of [-1,1]){
   poly(c,[[sign*14,-16],[sign*29,-20],[sign*33,-10],[sign*27,7],[sign*20,17],[sign*13,8]],'#313a52',color);
   c.fillStyle='#c99863';c.fillRect(sign<0?-29:24,-12,5,12);
   poly(c,[[sign*8,12],[sign*19,16],[sign*22,27],[sign*12,29],[sign*6,20]],'#253347','#8c9eb3');
  }
  poly(c,[[-13,-23],[10,-25],[21,-12],[18,13],[7,22],[-12,17],[-21,3],[-20,-13]],'#493a54',color);
  poly(c,[[-12,-14],[11,-14],[15,-4],[8,7],[-10,7],[-16,-3]],'#071725','#9e8eb8');
  disc(c,0,-3,8,warning?'#f4aa61':'#75649d');disc(c,0,-3,4,'#fff2c9');
  c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(0,0,36,-2.7,-.45);c.arc(0,0,36,.45,2.7);c.stroke();
  c.font='bold 11px system-ui';c.textAlign='center';c.strokeStyle='#050a16';c.lineWidth=4;c.strokeText('ÇAPA YIKICI',0,59);c.fillStyle='#f6dfbf';c.fillText('ÇAPA YIKICI',0,59);
  c.fillStyle='#fff1d4';c.fillText(String(e.hp),0,-52);
  if(warning){c.strokeStyle='#ffd58a';c.lineWidth=3;c.beginPath();c.arc(0,0,43+(reduced?0:Math.sin(ms/100)*2),0,TAU);c.stroke();c.strokeStyle='#050a16';c.lineWidth=4;c.strokeText('PİKO KALKANI',0,-70);c.fillStyle='#ffe2a5';c.fillText('PİKO KALKANI',0,-70)}
  c.restore();
 }
 function station(c,s,near){
  c.save();c.translate(s.x,s.y);c.textAlign='center';c.lineJoin='round';
  const color=near?'#efffa7':'#91dbe4',kind=String(s.type||s.kind||''),name=s.name||s.label||'';
  c.fillStyle='#020a1599';c.beginPath();c.ellipse(3,23,29,9,0,0,TAU);c.fill();
  if(/reactor|core|defense|turret/.test(kind)){
   poly(c,[[-24,-12],[-13,-25],[14,-25],[25,-10],[24,16],[12,24],[-15,24],[-25,10]],'#23394b','#7895a6');
   for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.fillStyle='#4d6375';c.fillRect(-5,-28,10,13);c.fillStyle='#d5aa6f';c.fillRect(-2,-25,4,6);c.restore()}
   disc(c,0,0,18,'#081623');c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.arc(0,0,13,0,TAU);c.stroke();disc(c,0,0,7,color);disc(c,-2,-2,3,'#ecfff5');
  }else if(/anten|filter|scan/.test(kind)){
   poly(c,[[-22,18],[22,18],[16,26],[-16,26]],'#33495c','#7698ab');c.fillStyle='#748a9b';c.fillRect(-4,-8,8,27);
   c.save();c.rotate(-.35);c.fillStyle='#273e53';c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(0,-9,23,0,Math.PI);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-20,-9);c.lineTo(0,-28);c.lineTo(20,-9);c.stroke();disc(c,0,-28,3,'#edc889');c.restore();
  }else if(/repair|power|relay|seal/.test(kind)){
   poly(c,[[-22,-24],[17,-24],[24,-17],[24,23],[-22,23]],'#263c4b','#7a9aa7');c.fillStyle='#081722';c.fillRect(-16,-18,32,32);
   for(let i=0;i<3;i++){c.fillStyle=['#d7ab71','#8dd8cc','#b4a0d7'][i];c.fillRect(-12+i*10,-13,6,18);c.fillStyle='#dce8df';c.fillRect(-12+i*10,-8+i*3,6,4)}
   c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(-13,16);c.lineTo(-13,21);c.lineTo(13,21);c.lineTo(13,16);c.stroke();
  }else if(/exit|door/.test(kind)){
   poly(c,[[-24,24],[-24,-20],[-16,-28],[16,-28],[24,-20],[24,24]],'#294255','#829eaa');c.fillStyle='#081623';c.fillRect(-16,-19,32,42);c.fillStyle='#385463';c.fillRect(-13,-16,11,36);c.fillRect(2,-16,11,36);
   c.fillStyle=color;c.fillRect(-21,-16,3,34);c.fillRect(18,-16,3,34);c.strokeStyle='#edcc94';c.lineWidth=2;c.beginPath();c.moveTo(-7,2);c.lineTo(7,2);c.lineTo(2,-3);c.moveTo(7,2);c.lineTo(2,7);c.stroke();
  }else if(/clue|log|record|evidence/.test(kind)){
   poly(c,[[-23,18],[-18,-18],[16,-23],[25,15],[17,23],[-17,25]],'#334453','#8d9ba8');
   poly(c,[[-14,-12],[11,-15],[16,13],[-12,16]],'#091e2c',color);
   for(let i=0;i<4;i++){c.fillStyle=i===0?'#e9cd97':color;c.fillRect(-8,-8+i*5,i===0?14:10+i,2)}
   c.fillStyle='#b8a3d5';c.fillRect(17,3,4,10);
  }else{
   poly(c,[[-25,-17],[-18,-24],[18,-24],[25,-17],[25,18],[17,24],[-17,24],[-25,18]],'#183044','#7396a8');
   c.fillStyle='#061621';c.fillRect(-18,-17,36,25);c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(-13,0);c.lineTo(-7,0);c.lineTo(-3,-10);c.lineTo(2,3);c.lineTo(7,-6);c.lineTo(13,-6);c.stroke();
   for(let i=0;i<3;i++)disc(c,-10+i*10,15,2,i===0?color:'#4d7180');
  }
  if(near){c.strokeStyle='#efffa7';c.lineWidth=2;c.beginPath();for(const sign of [-1,1]){c.moveTo(sign*31,-12);c.lineTo(sign*31,-29);c.lineTo(sign*18,-29)}c.stroke()}
  c.font='bold 12px system-ui';c.lineWidth=4;c.strokeStyle='#06101b';c.strokeText(name,0,-40);c.fillStyle='#e7f5fa';c.fillText(name,0,-40);
  if(near){c.fillStyle='#e8f8b5';c.fillRect(-38,34,76,22);c.fillStyle='#0b222c';c.font='bold 11px system-ui';c.fillText('ETKİLEŞ',0,49)}c.restore();
 }
 function wall(c,w){
  c.save();const vertical=w.h>w.w;
  c.fillStyle='#030b16';c.fillRect(w.x+4,w.y+5,w.w,w.h);
  const g=c.createLinearGradient(w.x,w.y,w.x+(vertical?w.w:0),w.y+(vertical?0:w.h));g.addColorStop(0,'#718a99');g.addColorStop(.22,'#3d576b');g.addColorStop(.7,'#223749');g.addColorStop(1,'#102231');
  c.fillStyle=g;c.fillRect(w.x,w.y,w.w,w.h);c.strokeStyle='#9eb3ba';c.lineWidth=1;c.strokeRect(w.x+.5,w.y+.5,w.w-1,w.h-1);
  c.strokeStyle='#0b1c2b';c.lineWidth=2;
  for(let q=28;q<(vertical?w.h:w.w);q+=48){c.beginPath();if(vertical){c.moveTo(w.x+2,w.y+q);c.lineTo(w.x+w.w-2,w.y+q)}else{c.moveTo(w.x+q,w.y+2);c.lineTo(w.x+q,w.y+w.h-2)}c.stroke()}
  c.restore();
 }
 function gate(c,g,locked){
  c.save();const vertical=g.h>g.w,light=locked?'#ffbb7e':'#8ce3c6';
  c.fillStyle='#071522';c.fillRect(g.x-4,g.y-4,g.w+8,g.h+8);
  if(locked){
   c.fillStyle='#394757';c.fillRect(g.x,g.y,g.w,g.h);
   c.strokeStyle='#a0a9b2';c.lineWidth=2;c.strokeRect(g.x+2,g.y+2,g.w-4,g.h-4);
   c.strokeStyle='#131e2d';c.beginPath();if(vertical){c.moveTo(g.x,g.y+g.h/2);c.lineTo(g.x+g.w,g.y+g.h/2)}else{c.moveTo(g.x+g.w/2,g.y);c.lineTo(g.x+g.w/2,g.y+g.h)}c.stroke();
   c.fillStyle='#c8925b';for(let i=5;i<(vertical?g.h:g.w)-5;i+=12){if(vertical)c.fillRect(g.x+3,g.y+i,3,6);else c.fillRect(g.x+i,g.y+3,6,3)}
  }else{
   c.fillStyle='#24434a';c.fillRect(g.x,g.y,g.w,g.h);
   c.fillStyle='#102936';if(vertical)c.fillRect(g.x+2,g.y+7,g.w-4,g.h-14);else c.fillRect(g.x+7,g.y+2,g.w-14,g.h-4);
   c.strokeStyle=light;c.lineWidth=2;c.beginPath();const x=g.x+g.w/2,y=g.y+g.h/2;c.moveTo(x-4,y-5);c.lineTo(x+2,y);c.lineTo(x-4,y+5);c.stroke();
  }
  c.fillStyle=light;if(vertical){c.fillRect(g.x-3,g.y,2,g.h);c.fillRect(g.x+g.w+1,g.y,2,g.h)}else{c.fillRect(g.x,g.y-3,g.w,2);c.fillRect(g.x,g.y+g.h+1,g.w,2)}
  c.textAlign='center';c.font='bold 10px system-ui';c.strokeStyle='#06101b';c.lineWidth=3;c.strokeText(locked?'KİLİTLİ':'AÇIK',g.x+g.w/2,g.y-10);c.fillStyle=light;c.fillText(locked?'KİLİTLİ':'AÇIK',g.x+g.w/2,g.y-10);c.restore();
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
 root.StoryInteriorArt=Object.freeze({enemy,pilot,boss,environment,station,wall,gate});
})(typeof window!=='undefined'?window:globalThis);
