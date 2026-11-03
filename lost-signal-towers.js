/* LOST SIGNAL: material-based tower foundation; no stat mutations. */
(function(root){'use strict';
function draw(c,skinId,time){
 if(!c||typeof c.save!=='function')return;
 c.save();try{
 c.lineJoin='bevel';c.lineWidth=1.15;
 c.fillStyle='#171f26';c.strokeStyle='#65717a';
 c.beginPath();for(let i=0;i<8;i++){let a=(i+.5)*Math.PI/4;let x=Math.cos(a)*15,y=Math.sin(a)*15;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill();c.stroke();
 c.strokeStyle='#a18a5e';c.lineWidth=1.25;
 for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.fillStyle='#38424a';c.fillRect(-2,-14,4,5);c.strokeRect(-2,-14,4,5);c.restore()}
 c.fillStyle='#28323a';c.beginPath();c.arc(0,0,9,0,Math.PI*2);c.fill();
 c.strokeStyle='#78828a';c.beginPath();c.arc(0,0,9,0,Math.PI*2);c.stroke();
 c.fillStyle='#bb955c';c.fillRect(-2,-2,4,4);
 }finally{c.restore()}
}
root.TowerLostSignalTowers=Object.freeze({draw});
})(typeof window!=='undefined'?window:globalThis);
