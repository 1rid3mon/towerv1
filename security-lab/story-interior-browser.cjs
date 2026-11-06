// Playable interior missions 1–5: syntax and real browser entry/interactions.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const files=['story-interior-mission01.html','story-interior-missions02-05.html'];
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert(script,file+' script not found');
 new vm.Script(script[1],{filename:file});
 assert(html.includes('touch-action:none'),file+' touch support');
}
const story=fs.readFileSync(path.join(root,'story.js'),'utf8');
assert(story.includes('missionNumber >= 1 && missionNumber <= 27'));
assert(story.includes('story-interior-missions06-10.html'));
assert(story.includes('story-interior-missions11-15.html'));
assert(story.includes('story-interior-missions16-20.html'));
assert(story.includes('story-interior-missions21-27.html'))
assert(story.includes("patch['mission' + missionNumber + 'Complete'] = true"));
assert(story.includes("patch.powerChoice = event.data.choice"));
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1'),file=path.resolve(root,'.'+u.pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream(file).pipe(res);
});
async function run(){
 await new Promise(r=>server.listen(4192,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
  for(const m of [2,3,4,5]){
   const page=await browser.newPage({viewport:{width:1032,height:1376},hasTouch:true,deviceScaleFactor:2});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4192/story-interior-missions02-05.html?mission='+m,{waitUntil:'load'});
   await page.waitForTimeout(150);
   assert.match(await page.locator('#objective').innerText(),new RegExp('GÖREV 0'+m));
   assert.equal(await page.locator('#pad').count(),1);assert.equal(await page.locator('#interact').count(),1);
   // Keyboard movement and interaction with the first real mission terminal.
   await page.keyboard.down('w');await page.waitForTimeout(m===2?480:650);await page.keyboard.up('w');
   if(m===2){await page.keyboard.down('d');await page.waitForTimeout(240);await page.keyboard.up('d')}
   await page.keyboard.press('e');
   await page.waitForTimeout(80);
   assert.equal(await page.locator('#modal').evaluate(e=>e.classList.contains('open')),true,'Mission '+m+' first station interaction');
   assert.deepEqual(errors,[],'Mission '+m+' JS runtime errors');
   console.log('mission '+m+' first real interaction OK');
   await page.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
}
run().catch(e=>{console.error(e);process.exitCode=1;server.close()});
