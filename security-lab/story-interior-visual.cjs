'use strict';
// Visual evidence on actual interior pages; does not claim natural gameplay or pacing.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..'),engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');fs.createReadStream(file).pipe(res)});
(async()=>{await new Promise(r=>server.listen(4223,'127.0.0.1',r));const browser=await({chromium,webkit})[engine].launch({headless:true});try{
 const out=path.join(__dirname,'browser-evidence','story-art',engine);fs.mkdirSync(out,{recursive:true});
 for(const mission of [1,4,7,10,13,16,19,22,25]){
  const file=mission===1?'story-interior-mission01.html':mission<=5?'story-interior-missions02-05.html':mission<=10?'story-interior-missions06-10.html':mission<=15?'story-interior-missions11-15.html':mission<=20?'story-interior-missions16-20.html':'story-interior-missions21-27.html';
  const page=await browser.newPage({viewport:{width:1032,height:850},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4223/'+file+'?mission='+mission+'&episode='+mission);await page.waitForFunction(()=>!!window.StoryInteriorArt);await page.waitForTimeout(120);
  await page.screenshot({path:path.join(out,'episode-'+Math.ceil(mission/3)+'.png')});assert.deepEqual(errors,[]);await page.close();
 }
 console.log('All nine episode presentation assets loaded and rendered ('+engine+')');
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
