/* LOST SIGNAL Stage 1.7: iPad-size synthetic wave-450 visual stress QA.
 * Runs against a disposable local guest in desktop Playwright WebKit/Chromium.
 * NOT a physical iPad and NOT a natural 450-wave playthrough; always report that.
 * Does not run against production or persist synthetic enemies into a save.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..');
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const evidence=path.join(__dirname,'browser-evidence','stage17',engine);
fs.mkdirSync(evidence,{recursive:true});
const port=4181,target='http://127.0.0.1:'+port+'/';
const server=http.createServer((request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1');
 let resource;
 try{resource=decodeURIComponent(url.pathname);}catch(_){response.writeHead(400).end();return;}
 const file=path.resolve(root,'.'+(resource==='/'?'/index.html':resource));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  response.writeHead(404);response.end();return;
 }
 const ext=path.extname(file).toLowerCase();
 const type={'.js':'text/javascript','.css':'text/css','.html':'text/html',
  '.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json'}[ext]||'application/octet-stream';
 response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(response);
});
const p95=values=>values.slice().sort((a,b)=>a-b)[Math.min(values.length-1,Math.ceil(values.length*.95)-1)];
const p50=values=>values.slice().sort((a,b)=>a-b)[Math.floor(values.length*.5)];
async function main(){
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const browser=await ({chromium,webkit})[engine].launch({headless:true});
 const all=[];
 try{
  for(const viewport of [
   {name:'ipad13-portrait',width:1032,height:1376},
   {name:'ipad13-landscape',width:1376,height:1032}
  ]){
   const context=await browser.newContext({
    viewport:{width:viewport.width,height:viewport.height},
    screen:{width:viewport.width,height:viewport.height},
    hasTouch:true,deviceScaleFactor:2
   });
   await context.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/,r=>r.abort());
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(target,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>typeof game!=='undefined'&&
      typeof renderGame==='function'&&window.TowerBossFamiliesV17&&
      window.TowerUnifiedEnemyFamiliesV17&&window.TowerLostSignalTowers);
    await page.locator('#mode-main-menu button').filter({hasText:'Sonsuz Mod'}).click();
    await page.waitForFunction(()=>document.querySelector('#gameCanvas')?.width>300);
    const saved=await page.evaluate(()=>localStorage.getItem(SAVE_KEY));
    const report=await page.evaluate(async()=>{
     const original={
      wave:game.wave,theme:game.settings.activeTheme,range:game.settings.showRange,
      foes:enemies,shots:projectiles,beams:lightningBeams,
      rings,particles,labels:floatingTexts,paused:isPaused,
      game:JSON.stringify(game)
     };
     isPaused=true;
     const families=window.TowerEnemyDiversity.VARIANTS;
     const bosses=window.TowerBossFamiliesV17.IDS;
     const bodies=window.TowerUnifiedEnemyFamiliesV17.IDS;
     const painter=window.TowerCombatArtV17;
     const resolutions=[];
     try{
      const ids=families.map(e=>e.id);
      if(ids.length!==21||bodies.length!==20||bosses.length!==5)
       throw new Error('Not all V17.1 art systems available in stress test');
      const snapshot=(population,theme)=>{
       const cx=canvas.width*.5,cy=canvas.height*.5;
       const w=Math.max(360,canvas.width*.78),h=Math.max(280,canvas.height*.74);
       game.wave=450;game.settings.activeTheme=theme;game.settings.showRange=false;
       enemies=Array.from({length:population},(_,i)=>{
        const v=families[i%families.length];
        // A deterministic, spaced multi-ring synthetic pressure field.
        const col=i%20,row=Math.floor(i/20);
        const x=cx-w*.5+((col+.5)/20)*w+(row%2?3:-3);
        const y=cy-h*.5+((row+.5)/Math.ceil(population/20))*h;
        return {type:v.base,subType:v.base,variantId:v.id,
         radius:11+(i%7===0?2:0),x,y,
         hp:100,maxHp:100,hitFlash:0,slowTimer:0,attackCooldown:0,
         dashCooldown:0,animPhase:i*.13,isElite:false,name:v.name,color:v.color};
       });
       for(let j=0;j<5;j++){
        enemies.push({type:'boss',subType:bosses[j],radius:30+(j===0?10:0),
          x:cx+(j-2)*Math.min(95,w*.11),y:cy+h*.36,
          hp:650,maxHp:1000,name:bosses[j],
          v12Combat:{phase:3},slowTimer:0,hitFlash:0,isElite:false,
          animPhase:.2*j,attackCooldown:0,dashCooldown:0,color:'#ffbf7c'});
       }
       projectiles=Array.from({length:Math.round(population*.35)},(_,i)=>{
        const a=i*.53;
        const x=cx+Math.cos(a)*(40+(i%14)*18),
         y=cy+Math.sin(a)*(30+(i%14)*14);
        return {x,y,vx:110,vy:3,radius:3,color:i%2?'#fca5a5':'#9ae8f0',
          history:[{x:x-6,y:y-1},{x:x-12,y:y-2},{x:x-18,y:y-3}],
          fromEnemy:i%3===0,isBossFrost:false,damage:35};
       });
       lightningBeams=[];
       rings=[];particles=[];floatingTexts=[];
       return {cx,cy,enemies:enemies.length,projectiles:projectiles.length};
      };
      for(const [theme,population] of [['cyber',100],['cengiz',100],['cengiz',260]]){
       const info=snapshot(population,theme);
       // Avoid counting initial JIT/Canvas warmup; report render costs, not FPS.
       for(let i=0;i<2;i++)renderGame();
       const timings=[];
       for(let frame=0;frame<12;frame++){
        const start=performance.now();renderGame();timings.push(performance.now()-start);
       }
       const screenshot=canvas.toDataURL('image/png').split(',')[1];
       if(!screenshot||screenshot.length<5000)throw new Error('Empty game Canvas in synthetic battle');
       const sorted=timings.slice().sort((a,b)=>a-b);
       resolutions.push({theme,virtualWave:450,
        enemies:info.enemies,projectiles:info.projectiles,
        medianMs:sorted[Math.floor(sorted.length/2)],
        p95Ms:sorted[Math.ceil(sorted.length*.95)-1],
        maxMs:sorted[sorted.length-1],screenshot,
        canvas:{width:canvas.width,height:canvas.height}});
      }
     }finally{
      // Restore every mutable global before the test exits. No saveGame call.
      enemies=original.foes;projectiles=original.shots;
      lightningBeams=original.beams;rings=original.rings;
      particles=original.particles;floatingTexts=original.labels;
      game.wave=original.wave;game.settings.activeTheme=original.theme;
      game.settings.showRange=original.range;isPaused=original.paused;
     }
     if(JSON.stringify(game)!==original.game)throw new Error('Render stress mutated game state');
     const piko=document.querySelector('#game-mascot');
     const bubble=document.querySelector('#game-mascot-bubble');
     const overflow=document.documentElement.scrollWidth>innerWidth+1;
     const bubbleStyle=bubble?getComputedStyle(bubble):null;
     return {resolutions,
      canvas:{width:canvas.width,height:canvas.height},
      pikoPresent:!!(piko&&piko.querySelector('.piko-v17-armor')),
      speechWrap:bubbleStyle?bubbleStyle.overflowWrap:'missing',
      screenOverflow:overflow,themeRestored:game.settings.activeTheme===original.theme};
    });
    assert.equal(report.pikoPresent,true);
    assert.equal(report.screenOverflow,false,'iPad landscape/portrait must not overflow');
    assert.equal(report.speechWrap,'anywhere','Piko speech bubble must wrap');
    assert.equal(report.themeRestored,true);
    assert.equal(await page.evaluate(()=>localStorage.getItem(SAVE_KEY)),saved,'never persist synthetic 450 wave');
    assert.deepEqual(errors,[],'no runtime JS errors in stress');
    for(const sample of report.resolutions){
     assert.equal(sample.virtualWave,450);
     assert(sample.enemies>=100&&sample.projectiles>=35);
     assert(sample.p95Ms<300,'catastrophic 1x render stall >300ms p95');
     const out=path.join(evidence,viewport.name+'-'+sample.theme+'-'+sample.enemies+'-wave450.png');
     fs.writeFileSync(out,Buffer.from(sample.screenshot,'base64'));
     delete sample.screenshot;
    }
    // Context measurement is intentionally synthetic and runner-dependent.
    all.push({browser:engine,viewport:viewport.name,deviceScaleFactor:2,
      physicalDevice:false,simulation:true,pass:true,...report});
    console.log(JSON.stringify({browser:engine,viewport:viewport.name,
      results:report.resolutions.map(x=>({theme:x.theme,enemies:x.enemies,
        projectiles:x.projectiles,p50Ms:+x.medianMs.toFixed(2),p95Ms:+x.p95Ms.toFixed(2)}))}));
   }catch(err){
    await page.screenshot({path:path.join(evidence,viewport.name+'-failed.png')}).catch(()=>{});
    throw err;
   }finally{await context.close();}
  }
 }finally{
  fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify(all,null,2));
  await browser.close();
 }
}
main().catch(err=>{console.error(err);process.exitCode=1;})
 .finally(()=>{if(server.listening)server.close();});
