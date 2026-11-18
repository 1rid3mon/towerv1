/* Real application DOM, three target landscapes, disposable guest storage only. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
let playwright;try{playwright=require('playwright');}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const root=path.resolve(__dirname,'..'),engine=process.env.BROWSER_ENGINE||'chromium';
const evidence=path.join(__dirname,'browser-evidence','meta',engine);fs.mkdirSync(evidence,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);});
const failures=[],reports=[];
async function inspect(page,label){
 const result=await page.evaluate(()=>{const panel=document.querySelector('#meta-center'),r=panel.getBoundingClientRect(),primary=panel.querySelector('.meta-footer .meta-primary');const rect=primary?.getBoundingClientRect();const buttons=[...panel.querySelectorAll('button,input')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));const small=buttons.filter(e=>{const b=(e.closest('label')||e).getBoundingClientRect();return b.width<43.9||b.height<43.9;}).map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}));const tiny=[...panel.querySelectorAll('*')].filter(e=>e.getClientRects().length&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())).filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent);return{width:innerWidth,height:innerHeight,overflow:panel.scrollWidth>panel.clientWidth+1,outside:r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1,small,tiny,clippedLabels:[...panel.querySelectorAll('.meta-nav button')].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent),primaryVisible:!rect||(rect.top>=r.top&&rect.bottom<=r.bottom&&rect.right<=r.right)};});
 await page.screenshot({path:path.join(evidence,label+'.png')});reports.push({label,...result});
 assert.equal(result.overflow,false,label+' horizontal overflow');assert.equal(result.outside,false,label+' outside viewport');assert.deepEqual(result.small,[],label+' touch targets');assert.deepEqual(result.clippedLabels,[],label+' clipped rail labels');assert.deepEqual(result.tiny,[],label+' text below12');assert.equal(result.primaryVisible,true,label+' primary action below fold');
}
async function main(){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4184,'127.0.0.1',resolve);});let browser;try{browser=await playwright[engine].launch({headless:true,...(process.env.CHROMIUM_PATH&&engine==='chromium'?{executablePath:process.env.CHROMIUM_PATH}:{})});for(const [width,height]of[[844,390],[740,360],[1180,820]]){const context=await browser.newContext({viewport:{width,height},hasTouch:true,timezoneId:'Europe/Istanbul'});await context.route(/(?:firestore|identitytoolkit|securetoken)\.googleapis\.com/,route=>route.abort());const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(/cdn.tailwindcss.com|fonts.googleapis.com|cdnjs.cloudflare.com|www.gstatic.com/.test(r.url()))network.push(r.url());});try{
 await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.MetaRuntime&&window.MetaUI&&window.EndlessOperations);
 await page.evaluate(()=>{MetaRuntime.prepare();const result=EndlessOperations.transactMeta('qa:fixture','disposable test fixture',d=>{d.currencies.kristal=10000;d.archive.equipment.weapon_0={level:1,copies:15,seen:false};d.archive.skills.ark={level:1,copies:15,seen:false};d.season.xp=180;d.offline.pending=12;d.returnEvent.startedAt=Date.now()-86400000;d.returnEvent.endsAt=Date.now()+19*86400000;d.returnEvent.lastTriggerAt=d.returnEvent.startedAt;d.progress.waves=6;d.progress.logins=2;return {ok:true};});if(!result.ok)throw new Error(result.message);});
 for(const view of ['archive','skills','supply','streak','season','return','event','notice']){await page.evaluate(v=>MetaRuntime.route(v),view);if(view==='season'){
 await page.locator('#meta-center').getByRole('button',{name:'Sezon ödülü',exact:true}).click();
 await page.locator('#meta-overlay.meta-season-preview[open]').waitFor();
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-season-preview.png')});
 await page.locator('#meta-overlay').getByRole('button',{name:'Geçide git'}).click();
 }
 await inspect(page,width+'x'+height+'-'+view);}
 await page.evaluate(()=>MetaRuntime.route('archive'));
 await page.getByRole('button',{name:'Çağır ×1 · 100',exact:true}).click();await page.locator('#meta-overlay').waitFor({state:'visible'});assert.ok((await page.locator('.meta-result').count())===1);await page.locator('#meta-overlay').getByRole('button',{name:'Devam',exact:true}).click();await page.locator('#meta-overlay').waitFor({state:'hidden'});
 await page.locator('#meta-center').getByRole('button',{name:'Olasılıklar',exact:true}).click();await page.locator('#meta-overlay').waitFor({state:'visible'});assert.match(await page.locator('#meta-overlay').innerText(),/40%/);await page.goBack();await page.locator('#meta-overlay').waitFor({state:'hidden'});assert.equal(await page.locator('#meta-center').isVisible(),true);
 await page.evaluate(()=>MetaRuntime.route('supply'));await page.getByRole('button',{name:'Topla · 12 Parça',exact:true}).click();assert.equal(await page.evaluate(()=>MetaRuntime.getState().offline.pending),0);assert.equal(await page.evaluate(()=>MetaRuntime.action('offline').ok),false);
 await page.evaluate(()=>MetaRuntime.route('archive'));await page.locator('#meta-center .meta-close').click();await page.locator('#meta-center').waitFor({state:'hidden'});
 await page.locator('#mode-main-menu button').filter({hasText:'Sonsuz Mod'}).click();
 await page.locator('#meta-command-bar').waitFor({state:'visible'});
 // Startup rewards are completed with actual controls before checking battle/settings.
 for(let i=0;i<3;i++){await page.waitForTimeout(350);if(await page.locator('#meta-center[open]').count())await page.locator('#meta-center .meta-close').click();}
 await page.evaluate(()=>{isPaused=false;});
 await page.locator('#meta-command-bar button[aria-label="Ses ve ayarlar"]').click();
 await page.locator('#settings-modal').waitFor({state:'visible'});
 assert.equal(await page.evaluate(()=>isPaused),true,'settings pauses battle');
 const settings=await page.evaluate(()=>{const p=document.querySelector('.signal-settings-shell'),r=p.getBoundingClientRect();return{overflow:p.scrollWidth>p.clientWidth+1,outside:r.right>innerWidth+1,small:[...p.querySelectorAll('button,select,summary')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.height<44||r.width<44;}).map(e=>e.textContent)};});
 assert.equal(settings.overflow,false);assert.equal(settings.outside,false);assert.deepEqual(settings.small,[]);
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-settings.png')});
 await page.locator('#settings-modal header button').click();
 assert.equal(await page.evaluate(()=>isPaused),false,'settings resumes previously running battle');
 await page.waitForTimeout(150);
 await page.evaluate(()=>{isPaused=true;openSettingsModal();});
 await page.goBack();await page.locator('#settings-modal').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>isPaused),true,'already paused remains paused');
 await page.evaluate(()=>{isPaused=false;});
 const hud=await page.evaluate(()=>({field:document.querySelector('#gameCanvas').getBoundingClientRect().height,height:innerHeight}));
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-battle.png')});
 assert.ok(hud.field/hud.height>=0.85,'Battle canvas has at least 85% viewport height: '+JSON.stringify(hud));
 assert.deepEqual(errors,[],'runtime console errors');if(network.length)throw new Error('External layout dependencies failed; screenshots are not visual acceptance: '+network.join(', '));
 }catch(error){failures.push({viewport:width+'x'+height,error:error.message,errors,network});await page.screenshot({path:path.join(evidence,width+'x'+height+'-failure.png')}).catch(()=>{});}finally{await context.close();}}
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({reports,failures},null,2));}
 if(failures.length)throw new Error(JSON.stringify(failures,null,2));console.log('Mobile meta UI passed at844×390,740×360,1180×820.');}
main().catch(error=>{console.error(error);process.exitCode=1;});
