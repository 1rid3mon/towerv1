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
 if(['season','event'].includes(view)) {
  await page.waitForFunction(()=>[...document.querySelectorAll('#meta-center img.station-sprite')].some(img=>img.complete&&img.naturalWidth===192));
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
 await page.waitForFunction(()=>{const p=document.querySelector('.signal-settings-shell'),r=p.getBoundingClientRect();return r.right<=innerWidth+.5;});
 assert.equal(await page.evaluate(()=>isPaused),true,'settings pauses battle');
 const settings=await page.evaluate(()=>{const p=document.querySelector('.signal-settings-shell'),r=p.getBoundingClientRect();return{overflow:p.scrollWidth>p.clientWidth+1,outside:r.right>innerWidth+1,small:[...p.querySelectorAll('button,select,summary')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.height<44||r.width<44;}).map(e=>e.textContent)};});
 assert.equal(settings.overflow,false,'settings horizontal overflow '+JSON.stringify(settings));assert.equal(settings.outside,false,'settings outside viewport '+JSON.stringify(settings));assert.deepEqual(settings.small,[],'settings touch targets');
 const audioRows=await page.evaluate(()=>[...document.querySelectorAll('.signal-settings-section:first-child button')].map(e=>{const r=e.getBoundingClientRect();return r.top>=52&&r.bottom<=innerHeight;}));
 assert.deepEqual(audioRows,[true,true,true],'first three audio controls visible');
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-settings.png')});
 await page.locator('.signal-settings-section').filter({has:page.locator('summary',{hasText:'HİS'})}).locator('summary').click();
 await page.getByRole('switch',{name:'Hareketi azalt',exact:true}).click();
 assert.equal(await page.evaluate(()=>MetaRuntime.getState().fx.reducedMotion),true,'preference saved with account');
 assert.equal(await page.evaluate(()=>Fx.settings().reduced),true,'motion setting applied');
 await page.getByRole('switch',{name:'Hareketi azalt',exact:true}).click();
 assert.equal(await page.evaluate(()=>MetaRuntime.getState().fx.reducedMotion),false);

 await page.locator('#settings-modal header button').click();
 await page.locator('#settings-modal').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>isPaused),false,'settings resumes previously running battle');
 await page.waitForTimeout(150);
 await page.evaluate(()=>{isPaused=true;openSettingsModal();});
 await page.goBack();await page.locator('#settings-modal').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>isPaused),true,'already paused remains paused');
 await page.evaluate(()=>{isPaused=false;});
 const hud=await page.evaluate(()=>{const ids=['meta-command-bar','meta-command-skills','meta-command-shelf'];return {field:document.querySelector('#gameCanvas').getBoundingClientRect().height,height:innerHeight,controls:ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),small:[...document.querySelectorAll('#meta-command-bar>button,#meta-command-skills>button,#meta-command-shelf>button')].filter(b=>{const r=b.getBoundingClientRect();return r.width<44||r.height<44;}).map(b=>b.getAttribute('aria-label')),skillArt:[...document.querySelectorAll('#meta-command-skills>button')].every(b=>!!b.querySelector('svg'))};});
 assert.deepEqual(hud.small,[],'command touch targets');assert.equal(hud.skillArt,true,'each skill slot has independent SVG artwork');
 assert.ok(hud.controls.every(r=>r.left>=0&&r.right<=width+1&&r.top>=0&&r.bottom<=height+1),'command surfaces stay inside viewport '+JSON.stringify(hud.controls));
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-battle.png')});
 const actual=await page.evaluate(()=>({gold:game.gold,crystals:game.crystals}));
 await page.evaluate(()=>{for(let i=0;i<12;i++)Fx.emit('enemyKill',{x:tower.x-100+(i%4)*50,y:tower.y-60+Math.floor(i/4)*40,gold:1,crystals:0});});
 await page.waitForTimeout(280);
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-reward-drops.png')});
 const performanceSample=await page.evaluate(()=>new Promise(resolve=>{const samples=[],start=performance.now();let previous=start,maxFxUpdateMs=0,maxDrops=0;function sample(now){samples.push(now-previous);previous=now;const fx=Fx.diagnostics();maxFxUpdateMs=Math.max(maxFxUpdateMs,fx.updateCostMs);maxDrops=Math.max(maxDrops,fx.drops);if(now-start<2200)requestAnimationFrame(sample);else resolve({maxFxUpdateMs,maxDrops,frames:samples.length,meanFrameMs:samples.reduce((a,b)=>a+b,0)/samples.length,fx:Fx.diagnostics()});}requestAnimationFrame(sample);}));
 reports.push({label:width+'x'+height+'-presentation-sample',...performanceSample});
 assert.ok(performanceSample.fx.drops<=60,'drop cap');
 assert.equal(await page.evaluate(()=>Fx.displayValue('gold',game.gold)),await page.evaluate(()=>game.gold),'all visual debt settles');
 assert.ok(await page.evaluate(before=>game.gold>=before.gold&&game.crystals>=before.crystals,actual),'visual fixture never deducts currency');

 assert.ok(hud.field/hud.height>=0.85,'Battle canvas has at least 85% viewport height: '+JSON.stringify(hud));
 await page.evaluate(()=>{offerEndlessTactics();MetaCommand.refresh(true);});
 await page.locator('#endless-tactics summary').tap();
 await page.locator('#endless-tactics[open]').waitFor();
 await page.waitForTimeout(300);
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-tactic-redesign.png')});
 await page.locator('#endless-tactics button').filter({hasText:'DENGELİ'}).tap();
 assert.equal(await page.evaluate(()=>tacticMultiplier()),1,'third tactic remains touchable through HUD layers');
 await page.locator('#meta-radio:not([hidden])').waitFor({timeout:18000});
 assert.equal(await page.evaluate(()=>isPaused),false,'radio does not pause battle');
 const played=await page.evaluate(()=>game.stats.playTimeSeconds);await page.waitForTimeout(1250);
 assert.ok(await page.evaluate(before=>game.stats.playTimeSeconds>before,played),'simulation continues behind radio');
 // Art acceptance: reproduce the user's late-game foundry theme with long numbers.
 await page.evaluate(()=>{isPaused=true;game.wave=452;game.highestWave=452;game.gold=1.83e45;game.settings.activeTheme='cengiz';enemies.length=0;document.getElementById('endless-tactics').hidden=true;for(const [key,def]of Object.entries(UPGRADE_DEFS))game.upgrades[key]=Math.min(def.maxLevel,400);tower.maxHp=getTowerMaxHp();tower.hp=tower.maxHp;window._syncShadow?.();EndlessOperations.transactMeta('qa:art','disposable visual fixture',d=>{d.offline.cleared=45;return {ok:true};});MetaCommand.refresh(true);renderGame();});
 await page.waitForTimeout(350);
 const clippedUpgrades=await page.evaluate(()=>[...document.querySelectorAll('.command-upgrade-name,.command-upgrade-price')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));assert.deepEqual(clippedUpgrades,[],'late-game upgrade names and prices fit');
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-foundry-redesign.png')});
 await page.evaluate(()=>{game.settings.activeTheme='cyber';renderGame();});
 await page.waitForTimeout(150);
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-cyber-redesign.png')});

 // Workshop acceptance uses real touch purchases and exact stat forecasts.
 const previousField=await page.evaluate(()=>{enemies.length=0;spawnEnemy(false);return {width:canvas.width,dx:enemies[0].x-tower.x,dy:enemies[0].y-tower.y};});
 await page.locator('#meta-command-shelf .command-all-upgrades').tap();
 await page.locator('#meta-command-upgrades:not([hidden])').waitFor();await page.waitForTimeout(220);
 const openedField=await page.evaluate(()=>({width:canvas.width,dx:enemies[0].x-tower.x,dy:enemies[0].y-tower.y,coreX:document.querySelector('#gameCanvas').getBoundingClientRect().left+tower.x,drawerRight:document.querySelector('#meta-command-upgrades').getBoundingClientRect().right}));
 assert.ok(openedField.width<previousField.width,'drawer reserves actual battlefield width');
 assert.ok(openedField.coreX>openedField.drawerRight,'tower remains outside workshop');
 assert.ok(Math.abs(openedField.dx-previousField.dx)<.01&&Math.abs(openedField.dy-previousField.dy)<.01,'opening preserves enemy positions relative to core');
 for(const category of ['attack','defense','economy']){
  await page.locator('[data-workshop-category="'+category+'"]').tap();
  if(category!=='economy') {
   const expected=category==='attack'?['damage','range']:['maxHp'];
   await page.waitForFunction(keys=>keys.every(key=>{
    const img=document.querySelector('.workshop-art img[data-station-art="'+key+'"]');
    return img?.complete&&img.naturalWidth===192;
   }),expected);
  }
  const workshop=await page.evaluate(()=>{const p=document.querySelector('#meta-command-upgrades'),r=p.getBoundingClientRect(),rows=[...p.querySelectorAll('.workshop-card:not([hidden])')];return {outside:r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight,overflow:p.scrollWidth>p.clientWidth+1,small:[...p.querySelectorAll('button')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]')).filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44;}).map(e=>e.getAttribute('aria-label')||e.textContent),illustrated:rows.every(e=>e.querySelector('.workshop-art [data-station-art]')?.getBoundingClientRect().width>=56),clipped:rows.flatMap(e=>[...e.querySelectorAll('h3,.workshop-level,.workshop-current,.workshop-next,.command-upgrade-price')]).filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),allMaxDisabled:rows.filter(e=>e.dataset.maxed==='true').every(e=>e.querySelector('button').disabled)};});
  reports.push({label:width+'x'+height+'-workshop-'+category,...workshop});
  await page.screenshot({path:path.join(evidence,width+'x'+height+'-workshop-'+category+'.png')});
  assert.equal(workshop.outside,false,'workshop viewport bounds');assert.equal(workshop.overflow,false,'workshop horizontal overflow');assert.deepEqual(workshop.small,[],'workshop 44px controls');assert.deepEqual(workshop.clipped,[],'full workshop labels and values fit');assert.ok(workshop.illustrated,'all upgrades have actual colored object artwork');assert.ok(workshop.allMaxDisabled,'maxed upgrades cannot be purchased');
 }
 await page.locator('[data-workshop-category="attack"]').tap();
 for(const multiplier of [1,10,'MAX']){
  const offer=await page.evaluate(multiplier=>{game.upgrades.damage=9;game.gold=100000;window._syncShadow?.();setBuyMultiplier(multiplier);MetaCommand.refresh(true);const info=getBulkUpgradeInfo('damage');return {level:game.upgrades.damage,gold:game.gold,count:info.count,cost:info.totalCost,predicted:UPGRADE_DEFS.damage.getValueText(game.upgrades.damage+info.count)};},multiplier);
  assert.equal(await page.locator('[data-upgrade-row="damage"] .workshop-next').innerText(),offer.predicted,'displayed forecast uses actual bulk count');
  await page.locator('[data-upgrade-row="damage"] [data-upgrade="damage"]').tap();
  const purchased=await page.evaluate(()=>({level:game.upgrades.damage,gold:game.gold,value:UPGRADE_DEFS.damage.getValueText(game.upgrades.damage)}));
  assert.equal(await page.locator('[data-workshop-multiplier="'+multiplier+'"]').getAttribute('aria-pressed'),'true','selected bulk amount stays synchronized');
  assert.equal(purchased.level,offer.level+offer.count,'one touch buys selected amount once');assert.equal(purchased.gold,offer.gold-offer.cost,'one touch debits exact cost once');assert.equal(purchased.value,offer.predicted,'shown value matches actual purchased effect');
 }
 await page.evaluate(()=>{game.gold=100000;game.upgrades.damage=9;window._syncShadow?.();setBuyMultiplier(1);MetaCommand.refresh(true);renderGame();});
 await page.waitForTimeout(200);
 await page.screenshot({path:path.join(evidence,width+'x'+height+'-workshop-preview.png')});
 await page.keyboard.press('Escape');await page.locator('#meta-command-upgrades').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>document.body.classList.contains('command-workshop-open')),false,'Escape closes workshop');
 assert.equal(await page.evaluate(()=>canvas.width),previousField.width,'closing restores full field');
 for(let i=0;i<2;i++){await page.locator('#meta-command-shelf .command-all-upgrades').tap();await page.locator('.workshop-close').tap();}
 assert.equal(await page.evaluate(()=>canvas.width),previousField.width,'repeated toggles restore full field');
 assert.deepEqual(errors,[],'runtime console errors');if(network.length)throw new Error('External layout dependencies failed; screenshots are not visual acceptance: '+network.join(', '));
 }catch(error){failures.push({viewport:width+'x'+height,error:error.message,stack:error.stack,errors,network});await page.screenshot({path:path.join(evidence,width+'x'+height+'-failure.png')}).catch(()=>{});}finally{await context.close();}}
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({reports,failures},null,2));}
 if(failures.length)throw new Error(JSON.stringify(failures,null,2));console.log('Mobile meta UI passed at844×390,740×360,1180×820.');}
main().catch(error=>{console.error(error);process.exitCode=1;});
