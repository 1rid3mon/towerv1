/* Browser-level V12 integration smoke in disposable guest context, no Firebase writes. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{chromium,webkit}=require('playwright');
const base=path.resolve(__dirname,'..');const engine=process.env.BROWSER_ENGINE||'chromium';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),p=url.pathname==='/'?'/index.html':url.pathname;
 const file=path.resolve(base,'.'+p);
 if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html');
 res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(4180,'127.0.0.1',r));
 const browser=await ({chromium,webkit})[engine].launch();
 try {
  for(const dims of [[390,844],[1024,768]]) {
   const context=await browser.newContext({viewport:{width:dims[0],height:dims[1]},hasTouch:true});
   await context.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/,r=>r.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>typeof window.TowerCombatDirectorV12==='object'&&typeof window.TowerNarrativeV12==='object'&&typeof game==='object');
   const results=await page.evaluate(()=>{
    const launcher=document.querySelector('#v12-console-launch');
    const achievements=getAchievementDefinitions();
    game.wave=5;
    spawnEnemy(true);
    const b=enemies.at(-1);
    const first=b.v12Combat?.phase;
    b.hp=Math.round(b.maxHp*.49);
    TowerCombatDirectorV12.tick(b,.016,{rings,text:()=>{}});
    const next=b.v12Combat?.phase;
    b.hp=Math.round(b.maxHp*.20);
    TowerCombatDirectorV12.tick(b,.016,{rings,text:()=>{}});
    const last=b.v12Combat?.phase;
    const synthetic={x:tower.x+35,y:tower.y+35,slowTimer:2,hp:300,maxHp:300,radius:12,gold:1,type:'green',hitFlash:0};
    enemies.push(synthetic);
    game.companions.frostOrb.unlocked=true;
    const old=synthetic.hp;
    dealDamageToEnemy(synthetic,100,false,'#5db8c8',false,'laser');
    return {launcher:!!launcher,achievement:achievements.some(a=>a.id==='v12-story27'),
      phases:[first,next,last],combo:old-synthetic.hp,pikoTier:TowerNarrativeV12.pikoTier({mission21Complete:true})};
   });
   assert.equal(results.launcher,true);
   assert.equal(results.achievement,true);
   assert.deepEqual(results.phases,[1,2,3]);
   assert.equal(results.combo,109,'real damage hook should apply frost+laser +9%');
   assert.equal(results.pikoTier,3);
   await page.locator('#v12-console-launch').click();
   await page.locator('[data-v12-tab="story"]').click();
   assert.match(await page.locator('[data-v12-body]').innerText(),/Echo|19/);
   await page.locator('[data-v12-close]').click();
   assert.equal(await page.locator('#v12-console').getAttribute('hidden'),'');
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify({engine,width:dims[0],height:dims[1],v12:true,phases:results.phases,combo:results.combo,errorCount:errors.length}));
   await context.close();
  }
 } finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
