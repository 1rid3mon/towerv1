'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');fs.createReadStream(file).pipe(res)});
async function main(){
await new Promise(resolve=>server.listen(4202,'127.0.0.1',resolve));const browser=await (process.env.BROWSER_ENGINE==='webkit'?webkit:chromium).launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
 await context.route(/(?:googleapis\.com|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com)/,r=>r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4202/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof startStoryMission==='function'&&typeof game!=='undefined');
 await page.evaluate(()=>{game.wave=26;game.highestWave=26;window._syncShadow?.();saveGame(true);updateStoryUnlockUI()});
 for(const mission of [2,3,5,6,9,10,11,13,15,16,20]){
   await page.evaluate(m=>{const data={introSeen:true,chapter:m>=19?3:m>=10?2:1};for(let i=1;i<m;i++)data['mission'+i+'Complete']=true;localStorage.setItem(STORY_PROGRESS_KEY,JSON.stringify(data));updateStoryMissionBoard();startStoryMission(m)},mission);
   const iframe=page.locator('iframe[title^="LOST SIGNAL · İç İstasyon"]');
   await iframe.waitFor({state:'visible',timeout:4500});
   const frame=await iframe.elementHandle();
   await frame.contentFrame().then(f=>f.evaluate(m=>window.parent.postMessage({type:'lost-signal-interior-mission-complete',mission:m},location.origin),mission));
   await iframe.waitFor({state:'detached',timeout:4500});
   assert.equal(await page.evaluate(m=>getStoryProgress()['mission'+m+'Complete']===true),true,'completion not saved '+mission);
   assert.equal(await page.evaluate(m=>document.getElementById('story-start-mission'+(m+1))?.disabled),false,'next mission blocked '+mission);
   await page.evaluate(()=>startStoryMission(1));
   await page.locator('iframe[title^="LOST SIGNAL · İç İstasyon"]').waitFor({state:'visible',timeout:4500});
   await page.locator('iframe[title^="LOST SIGNAL · İç İstasyon"]').evaluate(el=>el.contentWindow.postMessage({type:'___unused'},'*'));
   await page.evaluate(()=>document.querySelector('iframe[title^="LOST SIGNAL · İç İstasyon"]')?.contentWindow?.postMessage({type:'lost-signal-interior-close'},location.origin));
   // Close messages must originate in the child; use actual iframe execution for the close path.
   const fr=page.frames().find(f=>f.url().includes('story-interior-mission01.html'));if(fr)await fr.evaluate(()=>parent.postMessage({type:'lost-signal-interior-close'},location.origin)).catch(()=>{});
   await page.locator('iframe[title^="LOST SIGNAL · İç İstasyon"]').waitFor({state:'detached',timeout:4500});
   console.log('Completion/return/reopen pass:',mission);
 }
 assert.deepEqual(errors,[]);
 await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(err=>{console.error(err);process.exitCode=1;server.close()});
