'use strict';
/* Seven final missions: real Chromium/WebKit buttons, battles, save messages and Piko link. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'story-interior-missions21-27.js'),'utf8');new vm.Script(raw);
const qa="window.__qa={player,stations,gates,enemies,interact,camera,collides,useLink,get phase(){return phase},get combat(){return combat},get round(){return round},get hp(){return hp},get linkUses(){return linkUses},get finalBossWarning(){return enemies.some(e=>e.isFinalBoss&&e.telegraphUntil>performance.now())},get finalBossCountered(){return bossCounterUntil>performance.now()},get completed(){return complete}};";
const injected=raw.replace(/\}\)\(\);\s*$/,qa+'\n})();');assert.notEqual(injected,raw,'QA instrument injection failed');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/story-interior-missions21-27.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-missions21-27.html'),'utf8'));return}
 if(pathname==='/story-interior-missions21-27.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(injected);return}
 if(pathname==='/story-interior-completion.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-completion.js'),'utf8'));return}
 res.writeHead(404);res.end();
});
async function run(){
 await new Promise(resolve=>server.listen(4207,'127.0.0.1',resolve));
 const launchOptions={headless:true};
 if(process.env.BROWSER_EXECUTABLE)launchOptions.executablePath=process.env.BROWSER_EXECUTABLE;
 const browser=await (process.env.BROWSER_ENGINE==='webkit'?webkit:chromium).launch(launchOptions);
 try{
  for(const mission of [21,22,23,24,25,26,27]){
   const page=await browser.newPage({viewport:{width:1032,height:850},hasTouch:true,deviceScaleFactor:2}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.goto('http://127.0.0.1:4207/story-interior-missions21-27.html?mission='+mission+'&memory=preserve&callSign=piko&trust=piko');
   await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='lost-signal-interior-mission-complete')window.__completion=e.data}));
   const visit=name=>page.evaluate(label=>{const q=__qa,n=q.stations.find(z=>z.name===label);if(!n)throw Error('Missing station '+label);q.player.x=n.x;q.player.y=n.y;q.interact()},name);
   const close=()=>page.locator('#modal.open #continue').click({timeout:4000});
   const choose=async label=>{const options=page.locator('#modal.open #options button').filter({hasText:label});assert.equal(await options.count(),1,'Missing choice '+label+' in mission '+mission);await options.click()};
   const fight=async(count,health,needsLink=false)=>{
    assert.equal(await page.evaluate(()=>__qa.combat),true,'Battle did not begin in mission '+mission);
    const enemies=await page.evaluate(()=>__qa.enemies.map(e=>e.hp));assert.equal(enemies.length,count,'Wrong wave size');
    assert.deepEqual(enemies,Array(count).fill(health),'Wrong enemy strength');
    if(needsLink){
     const before = await page.evaluate(() => __qa.linkUses);
     if(mission===27){
      await page.waitForFunction(()=>__qa.finalBossWarning,{timeout:9000});
      const evidence=path.join(__dirname,'browser-evidence','story-final-boss',process.env.BROWSER_ENGINE||'chromium');
      fs.mkdirSync(evidence,{recursive:true});
      await page.screenshot({path:path.join(evidence,'mission-27-boss-warning.png')});
     }
     await page.waitForFunction(() => {
       const b=document.getElementById('link');
       return b && !b.disabled && __qa.combat && !document.getElementById('modal').classList.contains('open');
     }, null, {timeout:9000});
     // WebKit touch click can race with a UI state refresh: prove the interaction
     // actually incremented the use counter rather than assuming a click was handled.
     await page.locator('#link').click();
     await page.waitForFunction(previous => __qa.linkUses > previous, before, {timeout:2500})
       .catch(async () => {
         const state = await page.evaluate(() => ({
           mission:new URLSearchParams(location.search).get('mission'),phase:__qa.phase,combat:__qa.combat,linkUses:__qa.linkUses,
           modalOpen:document.getElementById('modal').classList.contains('open'),
           linkDisabled:document.getElementById('link').disabled,
           linkText:document.getElementById('link').textContent
         }));
         throw Error('Piko shield not activated: '+JSON.stringify(state));
       });
     if(mission===27)assert.equal(await page.evaluate(()=>__qa.finalBossCountered),true,'Piko shield must interrupt the telegraphed finale strike');
    }
    for(let i=0;i<enemies.length;i++)for(let j=0;j<enemies[i];j++){
     const at=await page.evaluate(i=>{const q=__qa,e=q.enemies[i];q.player.x=490;q.player.y=300;const c=q.camera();return{x:(e.x-c.ox)*c.scale,y:(e.y-c.oy)*c.scale}},i);
     await page.mouse.click(at.x,at.y);
    }
    await close();
   };
   assert.equal(await page.evaluate(()=>__qa.gates.length),2,'Two bulkheads required');
   if(mission===21){
    await visit('GÖREV TANIMI');
    assert.match(await page.locator('#modal.open').innerText(),/Önceki kararda istasyon arşivini öne aldın/,'Saved station-trust choice must surface in the next episode');
    await close();
    const humanTrustPage=await browser.newPage({viewport:{width:1032,height:850},hasTouch:true,deviceScaleFactor:2});
    await humanTrustPage.goto('http://127.0.0.1:4207/story-interior-missions21-27.html?mission=21&memory=preserve&callSign=piko&trust=human');
    await humanTrustPage.evaluate(()=>{const n=__qa.stations.find(x=>x.name==='GÖREV TANIMI');__qa.player.x=n.x;__qa.player.y=n.y;__qa.interact()});
    assert.match(await humanTrustPage.locator('#modal.open').innerText(),/Önceki kararda insan tanıklığına güvendin/,'Saved human-trust choice must surface in the next episode');
    await humanTrustPage.close();
    for(const station of ['SES KAYDI','KİMLİK İMZASI']){await visit(station);await close()}
    await visit('İSİM ARŞİVİ');await choose('KESİNLİKLE AYNI BİLİNÇ');
    assert.match(await page.locator('#feedback').innerText(),/aynı bilinç/);
    await choose('GÖREV ETİKETİ KİMLİĞİ KANITLAMAZ');await close();await visit('SONRAKİ BÖLME');
   }
   if(mission===22){
    await visit('SINIR PLANI');await close();await visit('SINIR SAVUNMASI');await close();await fight(4,3);
    await visit('İLK RÖLE');await choose('TOPRAKLAMA');await close();
    await visit('SINIR SAVUNMASI');await close();await fight(5,4);
    await visit('İKİNCİ RÖLE');await choose('FAZLARI EŞLE');await close();
    await visit('ÜÇÜNCÜ RÖLE');await choose('YALITILMIŞ GEÇİDİ KİLİTLE');await close();await visit('MOR GEÇİT');
   }
   if(mission===23){
    await visit('HASAR RAPORU');await close();await visit('GERİ BESLEME SAVUNMASI');await close();await fight(4,3);
    await visit('GÜÇ HATTI');await choose('TOPRAKLAMA');await close();
    await visit('GERİ BESLEME SAVUNMASI');await close();await fight(4,4);
    await visit('BELLEK HATTI');await choose('İKİ KAYDI KARŞILAŞTIR');await close();
    await visit('İLETİŞİM HATTI');await choose('SİNYALİ SENKRONLA');await close();
    await visit('PİKO KARARI');await choose('ÖNCE ŞİMDİKİ BELLEĞİ KORU');await close();await visit('HASARLI KAT ÇIKIŞI');
   }
   if(mission===24){
    await visit('ARŞİV PLANI');await close();await visit('MERKEZ SAVUNMA');await close();await fight(5,3);
    await visit('ÖNCELİK RÖLESİ');await choose('SIFIRLAMA ÖNCELİĞİNİ KAPAT');await close();
    await visit('MERKEZ SAVUNMA');await close();await fight(6,4);
    await visit('SON HAT');await choose('EKİP → ARŞİV → ÇEKİRDEK');await close();
    await visit('MERKEZ SAVUNMA');await close();await fight(7,5);
    await visit('SIFIRLAMA KONSOLU');await choose('YALNIZCA SIFIRLAMA KOMUTUNU İPTAL ET');await close();await visit('GÜVENLİ GEÇİT');
   }
   if(mission===25){
    await visit('MAVİ YANKI');await close();await visit('ÇAĞRI ADI');await close();
    await visit('PİKO SEÇİMİ');await choose('KARARINI DİNLE VE İZİN VER');await close();
    await page.locator('#link').click();await close();await visit('BAĞLANTI ARŞİVİ');
   }
   if(mission===26){
    await visit('UZAK SAVUNMA PLANI');await close();await visit('BAĞLANTI SAVUNMASI');await close();await fight(4,3,true);
    await visit('UZAK HAT');await choose('GECİKMEYİ ÖLÇ VE SENKRONLA');await close();
    await visit('BAĞLANTI SAVUNMASI');await close();await fight(5,4,true);
    await visit('SON BAĞLANTI');await choose('AYRI KİMLİĞİ KORUYARAK BAĞLA');await close();await visit('AĞ GEÇİDİ');
   }
   if(mission===27){
    await visit('ÇÖKÜŞ PLANI');await close();await visit('SON NÖBET');await close();await fight(4,3);
    await visit('EKİP TAHLİYESİ');await choose('ÖNCE EKİBİ GÜVENE AL');await close();
    await visit('SON NÖBET');await close();await fight(5,4);
    await visit('PİKO ÇAPASI');await choose('PİKO');await close();
    await visit('SON NÖBET');await close();await fight(7,5,true);
    await visit('ARŞİV KURTARMA');await choose('KAYITLARI KORU');await close();await visit('HİKÂYE ÇIKIŞI');
   }
   assert.equal(await page.locator('#modal.open #done').count(),1,'Missing finish button in '+mission);
   await page.locator('#done').click();
   await page.waitForFunction(m=>window.__completion?.mission===m,mission,{timeout:5000});
   const payload=await page.evaluate(()=>window.__completion);
   if(mission===23)assert.equal(payload.stabilityChoice,'preserve');
   if(mission===25)assert.equal(payload.companionForm,'purple');
   if(mission===27)assert.equal(payload.companionForm,'tower');
   assert.deepEqual(errors,[],'Runtime errors '+mission);
   console.log('Mission '+mission+' full playthrough PASS');
   await page.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error(e);process.exitCode=1;server.close()});
