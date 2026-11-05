'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..'),raw=fs.readFileSync(path.join(root,'story-interior-missions16-20.js'),'utf8');
new vm.Script(raw);
const hook="window.__qa={player,stations,gates,enemies,interact,collides,camera,get phase(){return phase},get combat(){return combat},get round(){return round}};";
const script=raw.replace(/\}\)\(\);\s*$/,hook+'\n})();');assert.notEqual(script,raw,'QA hook missing');
const shell=fs.readFileSync(path.join(root,'story-interior-missions16-20.html'),'utf8');
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;if(p==='/story-interior-missions16-20.html'){res.setHeader('Content-Type','text/html');res.end(shell)}else if(p==='/story-interior-missions16-20.js'){res.setHeader('Content-Type','text/javascript');res.end(script)}else{res.writeHead(404);res.end()}});
async function play(){
 await new Promise(r=>server.listen(4203,'127.0.0.1',r));
 const browser=await (process.env.BROWSER_ENGINE==='webkit'?webkit:chromium).launch({headless:true});
 try{
 for(const mission of [16,17,18,19,20]){
 const page=await browser.newPage({viewport:{width:1032,height:850},hasTouch:true,deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4203/story-interior-missions16-20.html?mission='+mission);
 await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='lost-signal-interior-mission-complete')window.__completed=e.data}));
 const visit=name=>page.evaluate(label=>{const q=__qa,n=q.stations.find(x=>x.name===label);if(!n)throw Error('Missing '+label);q.player.x=n.x;q.player.y=n.y;q.interact()},name);
 const close=()=>page.locator('#modal.open #continue').click({timeout:4500});
 const choose=async(label)=>{const btn=page.locator('#modal.open #options button').filter({hasText:label});assert.equal(await btn.count(),1,'No option '+label);await btn.click()};
 const fight=async(count)=>{
 assert.equal(await page.evaluate(()=>__qa.combat),true);const hp=await page.evaluate(()=>__qa.enemies.map(x=>x.hp));assert.equal(hp.length,count);
 for(let i=0;i<hp.length;i++)for(let j=0;j<hp[i];j++){const point=await page.evaluate(i=>{const q=__qa,e=q.enemies[i];q.player.x=490;q.player.y=300;const c=q.camera();return{x:(e.x-c.ox)*c.scale,y:(e.y-c.oy)*c.scale}},i);await page.mouse.click(point.x,point.y)}
 await close();
 };
 assert.equal(await page.evaluate(()=>__qa.gates.length),2);
 if(mission===16){for(const name of ['ESKİ ÇIKIŞ KAYDI','DÖNGÜ KAYDI']){await visit(name);await close()}
 await visit('YÖNLENDİRİCİ');await close();await visit('HARİTA ANALİZİ');await choose('DÖNGÜ SİNYALİNE GİR');assert.match(await page.locator('#feedback').innerText(),/Döngü/);await choose('FİZİKSEL İZİ TAKİP ET');await close();await visit('GERÇEK ÇIKIŞ')}
 if(mission===17){for(const name of ['ÇEKİRDEK ETİKETİ','ARŞİV KAYDI','ESKİ SES KAYDI']){await visit(name);await close()}
 await visit('PİKO İLE KONUŞ');await choose('SEÇİMİ PİKOYA BIRAK');await close();await visit('ÇAĞRI ADI KAYDI')}
 if(mission===18){await visit('GÜVENLİK ŞEMASI');await close();await visit('SAVUNMA KONSOLU');await close();await fight(3);
 await visit('ENERJİ KÖPRÜSÜ');await choose('GÜCÜ DENGELİ DAĞIT');await close();await visit('SAVUNMA KONSOLU');await close();await fight(4);
 for(const name of ['MÜHÜR A','MÜHÜR B','MÜHÜR C']){await visit(name);await choose('MÜHÜRLE');await close()}
 await visit('SAVUNMA KONSOLU');await close();await fight(5);await visit('KOMUTAN KİLİDİ');await choose('KİMLİK ANAHTARI');await close();await visit('GEÇİT')}
 if(mission===19){for(const name of ['TELEMETRİ A','TELEMETRİ B','TELEMETRİ C']){await visit(name);await close()}
 await visit('YÖRÜNGE ANALİZİ');await choose('NESNE KESİNLİKLE İKİ YERDE');assert.match(await page.locator('#feedback').innerText(),/gecikmesini/);await choose('GECİKMELİ VE YANSIMIŞ');await close();await visit('GÖZLEM GEÇİDİ')}
 if(mission===20){await visit('FİLO HARİTASI');await close();for(const name of ['DEVRE A','DEVRE B','ALARM DÜĞÜMÜ']){await visit(name);await choose('SENSÖRÜ KISA SÜRELİKLİ');await close()}await visit('FİLO ÇIKIŞI')}
 await page.locator('#modal.open #done').click();
 await page.waitForFunction(m=>window.__completed?.mission===m,mission,{timeout:5000});
 if(mission===17)assert.equal(await page.evaluate(()=>window.__completed.callSignChoice),'piko');
 assert.deepEqual(errors,[],'Runtime errors mission '+mission);
 console.log('MISSION '+mission+' COMPLETE: puzzles, decisions, and completion signal PASS');
 await page.close();
 }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
}
play().catch(e=>{console.error(e);process.exitCode=1;server.close()});
