'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'story-interior-missions11-15.js'),'utf8');
new vm.Script(raw,{filename:'story-interior-missions11-15.js'});
const hook='window.__qa={player,joy,stations,gates,enemies,interact,collides,camera,get phase(){return phase},get combat(){return combat},get round(){return round}};';
assert(raw.includes('})();'));
const instrumented=raw.replace(/\}\)\(\);\s*$/,hook+'\n})();');
const shell=fs.readFileSync(path.join(root,'story-interior-missions11-15.html'),'utf8');
const server=http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/story-interior-completion.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-completion.js'),'utf8'));return}

 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/story-interior-puzzles.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-puzzles.js'),'utf8'));return}
 if(name==='/story-interior-missions11-15.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(shell);return}
 if(name==='/story-interior-missions11-15.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(instrumented);return}
 res.writeHead(404);res.end();
});
async function play(){
 await new Promise(r=>server.listen(4196,'127.0.0.1',r));
 const browser=await (process.env.BROWSER_ENGINE==='webkit'?webkit:chromium).launch({headless:true});
 try{
 for(const mission of [11,12,13,14,15]){
  const page=await browser.newPage({viewport:{width:1032,height:850},hasTouch:true,deviceScaleFactor:2});
  const evidence=path.join(__dirname,'browser-evidence','chapter-four',process.env.BROWSER_ENGINE||'chromium');fs.mkdirSync(evidence,{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4196/story-interior-missions11-15.html?mission='+mission);
  await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='lost-signal-interior-mission-complete')window.__complete=e.data}));
  const teleportVisit=async(name)=>page.evaluate(label=>{const q=__qa,n=q.stations.find(s=>s.name===label);if(!n)throw Error('Station missing '+label);q.player.x=n.x;q.player.y=n.y;q.interact()},name);
  const walkAxis=async(axis,target)=>{const current=await page.evaluate(axis=>__qa.player[axis],axis);if(Math.abs(current-target)<5)return;const sign=target>current?1:-1,key=axis==='x'?(sign>0?'ArrowRight':'ArrowLeft'):(sign>0?'ArrowDown':'ArrowUp');await page.keyboard.down(key);try{await page.waitForFunction(({axis,target,sign})=>(__qa.player[axis]-target)*sign>=-4,{axis,target,sign},{timeout:6500})}finally{await page.keyboard.up(key)}};
  const visit=async(name)=>{if(mission!==11&&mission!==12)return teleportVisit(name);const target=await page.evaluate(label=>{const n=__qa.stations.find(s=>s.name===label);return{x:n.x,y:n.y}},name);await walkAxis('y',298);await walkAxis('x',target.x);await walkAxis('y',target.y);await page.locator('#act').tap()};
  const solveCircuit=async(path)=>{const direction=(a,b)=>b===a+1?2:b===a-1?8:b===a+4?4:1;for(let i=0;i<path.length;i++){const cell=path[i],wanted=(i?direction(cell,path[i-1]):8)|(i===path.length-1?2:direction(cell,path[i+1]));const tile=page.locator('[data-cell="'+cell+'"]');for(let turns=0;Number(await tile.getAttribute('data-ports'))!==wanted;turns++){assert(turns<4,'Circuit tile cannot reach required orientation');await tile.tap()}}};
  const close=()=>page.locator('#modal.open #continue').click({timeout:4000});
  const choose=async(text)=>{const item=page.locator('#modal.open #options button').filter({hasText:text});assert.equal(await item.count(),1,'Missing '+text);await item.click()};
  const fight=async(count)=>{
   assert.equal(await page.evaluate(()=>__qa.combat),true,'combat not started');
   const hp=await page.evaluate(()=>__qa.enemies.map(e=>e.hp));assert.equal(hp.length,count);
   for(let i=0;i<hp.length;i++)for(let j=0;j<hp[i];j++){
    const at=await page.evaluate(i=>{const q=__qa,f=q.enemies[i];q.player.x=490;q.player.y=300;const c=q.camera();return{x:(f.x-c.ox)*c.scale,y:(f.y-c.oy)*c.scale}},i);
    await page.mouse.click(at.x,at.y);
   }
   assert.equal(await page.locator('#modal.open').count(),1);await close();
  };
  assert.equal(await page.evaluate(()=>__qa.gates.length),2);
  if(mission===11){
   const pad=await page.locator('#pad').boundingBox();await page.mouse.move(pad.x+pad.width-10,pad.y+pad.height/2);await page.mouse.down();assert.equal(await page.evaluate(()=>__qa.joy.x>0),true);await page.evaluate(()=>dispatchEvent(new Event('blur')));assert.deepEqual(await page.evaluate(()=>({x:__qa.joy.x,y:__qa.joy.y,id:__qa.joy.id})),{x:0,y:0,id:null},'Lost focus releases held joystick input');await page.mouse.up();
   await visit('İSTASYON HARİTASI');await close();
   await visit('RÖLE ALFA');assert.match(await page.locator('#modal.open').innerText(),/Üç bakım izini bulmadan/);await close();
   for(const clue of ['DEVRE ŞEMASI','BAKIM NOTU','KABLO İZİ']){await visit(clue);await close()}
   await visit('RÖLE ALFA');assert.match(await page.locator('#modal.open').innerText(),/Önce RÖLE BETA/);await close();
   for(const [relay,path] of [['RÖLE BETA',[0,1,5,6,10,14,15]],['RÖLE ALFA',[0,4,8,9,5,6,7,11,15]],['RÖLE GAMA',[0,1,2,6,5,9,10,11,15]]]){await visit(relay);await page.locator('#circuit-check').tap();assert.match(await page.locator('#puzzle-feedback').innerText(),/Hat tamamlanmadı/);const tile=page.locator('[data-cell="1"]');await tile.tap();const changed=await tile.getAttribute('data-ports');await page.locator('#puzzle-close').tap();await visit(relay);assert.equal(await tile.getAttribute('data-ports'),changed,'Closing the board retains in-stage rotations');await solveCircuit(path);if(relay==='RÖLE BETA'){await page.setViewportSize({width:390,height:844});await page.screenshot({path:require('node:path').join(evidence,'relay-phone.png')});assert.equal(await page.locator('.signal-tile').first().evaluate(el=>el.getBoundingClientRect().width>=44),true,'Circuit touch target stays usable on a phone');await page.setViewportSize({width:1032,height:850})}assert.equal(await page.locator('.signal-board').evaluate(el=>el.getBoundingClientRect().width<=innerWidth),true);await page.locator('#circuit-check').tap();await close()}
   await visit('ALT AĞ KAPISI');
  }else if(mission===12){
   for(const clue of ['ARŞİV 01','ARŞİV 02','ARŞİV 03']){await visit(clue);await close()}
   await visit('KRONOLOJİ');await page.locator('#chronology-check').tap();assert.match(await page.locator('#puzzle-feedback').innerText(),/Önce kayıtları/);
   for(const id of ['signature','closure','awakening']){while(await page.locator('#'+id+'-up').isEnabled()){const order=await page.locator('.archive-row').evaluateAll(rows=>rows.map(r=>r.dataset.record));if(order.indexOf(id)===['signature','closure','awakening'].indexOf(id))break;await page.locator('#'+id+'-up').tap()}}
   await page.locator('#closure-card').tap();await page.locator('#awakening-card').tap();await page.locator('#chronology-check').tap();assert.match(await page.locator('#puzzle-feedback').innerText(),/Sıra doğru/);
   await page.locator('#closure-card').tap();await page.locator('#awakening-card').tap();await page.locator('#signature-card').tap();await page.locator('#order-card').tap();await page.screenshot({path:path.join(evidence,'chronology-tablet.png')});await page.locator('#chronology-check').tap();await choose('KESİN GELECEKTEN MESAJ');
   assert.match(await page.locator('#feedback').innerText(),/kanıtlanmadı/);
   await choose('ZAMAN DAMGALARI TUTARSIZ');await close();await visit('ARŞİV ÇIKIŞI');
  }else if(mission===13){
   for(const clue of ['İNSAN SESİ','GÜVENLİK SESİ','PİKO SESİ']){await visit(clue);await close()}
   await visit('SES ANALİZİ');await choose('PİKO KAYDINI DOĞRULA');await close();await visit('KARAR KAYDI');
  }else if(mission===14){
   await visit('SAVUNMA PLANI');await close();
   await visit('ÇEKİRDEK SAVUNMASI');await close();await fight(4);
   for(const seal of ['MÜHÜR B','MÜHÜR A','MÜHÜR C']){await visit(seal);await choose('ETKİNLEŞTİR');await close()}
   assert.match(await page.locator('#objective').innerText(),/Savunma önceliği: MÜHÜR B/);
   await visit('ÇEKİRDEK SAVUNMASI');await close();
   assert.equal(await page.evaluate(()=>__qa.enemies[0].speed),12,'first selected seal slows the second wave');
   await fight(6);
   await visit('YEREL VERİCİ');await choose('İSTASYONUN İÇİNDEN');await close();await visit('ÇIKIŞ');
  }else{
   await visit('PİKO RAPORU');await close();
   for(const [name,option] of [['BELLEK A','VERİ BÜTÜNLÜĞÜ'],['BELLEK B','GÜÇ SENKRONU'],['BELLEK C','YANKI FİLTRESİ']]){await visit(name);await choose(option);await close()}
   await visit('BELLEK ÇATIŞMASI');await choose('BELİRSİZ OLARAK KORU');await close();await visit('KAYIT KAPISI');
  }
  await page.locator('#done').click();
  await page.waitForFunction(m=>window.__complete?.mission===m,mission,{timeout:5000});
  if(mission===13)assert.equal(await page.evaluate(()=>window.__complete.trustChoice),'piko');
  assert.deepEqual(errors,[],'No runtime exceptions, mission '+mission);
  console.log('MISSION '+mission+' COMPLETE, puzzle and terminal actions passed');
  await page.close();
 }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
}
play().catch(e=>{console.error(e);process.exitCode=1;server.close()});
