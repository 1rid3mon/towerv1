/* Browser smoke: V14 isolated station and daily drill on a disposable guest. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{chromium,webkit}=require('playwright');
const base=path.resolve(__dirname,'..'),engine=process.env.BROWSER_ENGINE||'chromium';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),p=url.pathname==='/'?'/index.html':url.pathname;
 const file=path.resolve(base,'.'+p);
 if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html');
 res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(4184,'127.0.0.1',r));
 const browser=await ({chromium,webkit})[engine].launch();
 try{
  for(const dims of [[390,844],[1024,768]]){
   const ctx=await browser.newContext({viewport:{width:dims[0],height:dims[1]},hasTouch:true});
   await ctx.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/,r=>r.abort());
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>typeof window.TowerStationDirectorV14==='object'&&document.getElementById('v14-station-launch'));
   const before=await page.evaluate(()=>localStorage.getItem('towerDefenseStoryProgressV1'));
   await page.locator('#v14-station-launch').click();
   assert.equal(await page.locator('#v14-station').evaluate(x=>x.hidden),false);
   assert.equal(await page.locator('[data-v14-room]').count(),6);
   await page.locator('[data-v14-room="hangar"]').click();
   assert.match(await page.locator('.v14-room').innerText(),/Buz|Frost/);
   await page.locator('[data-v14-room="bridge"]').click();
   await page.locator('[data-v14-daily]').click();
   await page.locator('[data-v14-buy="0"]').click();
   await page.locator('[data-v14-next]').click();
   assert.match(await page.locator('.v14-metrics').innerText(),/1\/15/);
   await page.locator('[data-v14-map]').click();
   await page.locator('[data-v14-close]').first().click();
   assert.equal(await page.locator('#v14-station').evaluate(x=>x.hidden),true);
   const after=await page.evaluate(()=>localStorage.getItem('towerDefenseStoryProgressV1'));
   assert.equal(after,before,'daily and hub must not modify story save');
   assert.deepEqual(errors,[],'no uncaught errors');
   console.log(JSON.stringify({engine,viewport:dims,station:true,daily:true,errorCount:errors.length}));
   await ctx.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
