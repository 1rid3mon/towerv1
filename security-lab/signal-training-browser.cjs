'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..'),engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');fs.createReadStream(file).pipe(res)});
(async()=>{await new Promise(r=>server.listen(4224,'127.0.0.1',r));const browser=await({chromium,webkit})[engine].launch({headless:true});try{
 const out=path.join(__dirname,'browser-evidence','signal-training',engine);fs.mkdirSync(out,{recursive:true});
 for(const [width,height] of [[390,844],[1032,850]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});await context.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/,r=>r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4224/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.SignalTraining&&typeof game!=='undefined');await page.locator('#mode-main-menu button').filter({hasText:'Sonsuz Mod'}).click();await page.evaluate(()=>{isPaused=true});
  await page.screenshot({path:path.join(out,'endless-hud-'+width+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.evaluate(()=>{toggleUpgradeDrawer();switchTab('casino')});await page.locator('[data-signal-mode="memory"]').tap();
  const before=await page.evaluate(()=>({crystals:game.crystals,inventory:JSON.stringify(game.inventory)}));
  for(let round=0;round<5;round++){await page.locator('#signal-action').tap();const seq=(await page.locator('#signal-sequence').innerText()).trim().split(/\s+/);await page.locator('#signal-action').tap();for(const symbol of seq)await page.locator('[data-signal-symbol="'+['◈','≋','⊙','⌁'].indexOf(symbol)+'"]').tap()}
  assert.equal(await page.locator('#signal-score').innerText(),'500 / 500');assert.deepEqual(await page.evaluate(()=>({crystals:game.crystals,inventory:JSON.stringify(game.inventory)})),before);
  const record=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('towerSignalTrainingV1:')).map(k=>[k,localStorage.getItem(k)]));assert.equal(record.length,1);assert.equal(JSON.parse(record[0][1]).memory,500);
  await page.screenshot({path:path.join(out,'memory-result-'+width+'.png')});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.SignalTraining);assert.equal(await page.evaluate(k=>localStorage.getItem(k),record[0][0]),record[0][1]);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Skill games, saved record, currency isolation and HUD ('+engine+'): PASS');
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
