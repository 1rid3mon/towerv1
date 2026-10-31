// Full disposable-guest campaign, using the real combat simulator (accelerated clock, no kill injection).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname,'..');
const evidence = path.join(__dirname,'browser-evidence','campaign');
fs.mkdirSync(evidence,{recursive:true});
const results = [];
const server = http.createServer((req,res) => {
  const name = new URL(req.url,'http://localhost').pathname;
  const file = path.resolve(root,'.'+(name === '/' ? '/index.html' : name));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type',file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
  fs.createReadStream(file).pipe(res);
});
async function main() {
  await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
  await context.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/, route=>route.abort());
  const page = await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto('http://127.0.0.1:4174/',{waitUntil:'networkidle'});
    await page.evaluate(()=>{ game.wave=game.highestWave=26;window._syncShadow();saveGame(true);clearInterval(gameSaveTimer);updateStoryUnlockUI(); });
    const parentBefore = await page.evaluate(()=>JSON.stringify(game));
    await page.locator('#mode-story-button').click(); await page.locator('#story-skip').click();
    const controls = {
      stabilize:'#story-stabilize-action', scan:'#story-scan-action', investigate:'[data-story-ui="arrayChoice"]',
      powerChoice:'[data-story-ui="shieldChoice"]', repair:'#story-repair-action', memory:'#story-memory-action',
      relay:'#story-relay-action', amplifier:'#story-amplifier-action', reconnect:'#story-reconnect-action',
      awaken:'#story-awaken-action', pulseTest:'#story-pulse-action', pulseNode1:'#story-mission10-pulse-action',
      pulseNode2:'#story-mission10-pulse-action', relayNode1:'#story-mission11-pulse-action', relayNode2:'#story-mission11-pulse-action', relayNode3:'#story-mission11-pulse-action',
      archive1:'#story-mission12-archive-action',archive2:'#story-mission12-archive-action',archive3:'#story-mission12-archive-action',
      voice1:'#story-mission13-record-action',voice2:'#story-mission13-record-action',voiceChoice:'#story-mission13-trust-human',
      coreSeal1:'#story-mission14-seal-action',coreSeal2:'#story-mission14-seal-action',coreSeal3:'#story-mission14-seal-action',
      repairSystem1:'#story-mission15-repair-action',repairSystem2:'#story-mission15-repair-action',repairSystem3:'#story-mission15-repair-action',
      routeScan1:'#story-chapter2-action',routeScan2:'#story-chapter2-action',relay1:'#story-chapter2-action',relay2:'#story-chapter2-action',
      finalLock:'#story-chapter2-action', navigationScan:'#story-chapter2-action',selectivePulse:'#story-chapter2-action',fragmentScan:'#story-chapter2-action',archiveRebuild:'#story-chapter2-action',callSign:'#story-chapter2-route-archive'
    };
    for (let mission=1;mission<=27;mission++) {
      await page.locator('#story-start-mission'+mission).click();
      await page.waitForFunction(()=>document.querySelector('#isolated-story-runtime-overlay iframe')?.contentWindow?.location.search.includes('runtime=story'));
      const frame=page.frames().find(f=>f.url().includes('runtime=story'));
      await frame.waitForFunction(()=>typeof GameModeRuntime!=='undefined'&&GameModeRuntime.storySession.active);
      for(let step=0;step<40;step++) {
        const state=await frame.evaluate(()=>({completed:GameModeRuntime.storySession.completed,phase:GameModeRuntime.storySession.phase,combat:GameModeRuntime.isStoryCombatActive(),busy:GameModeRuntime.storySession.pulseBusy||GameModeRuntime.storySession.archiveBusy||GameModeRuntime.storySession.voiceBusy}));
        if(state.completed) break;
        if(state.combat) {
          const outcome=await frame.evaluate(()=>{
            for(let tick=0;tick<60*240&&GameModeRuntime.isStoryCombatActive()&&!isPaused;tick++) updateGame(1/60);
            return {combat:GameModeRuntime.isStoryCombatActive(),kills:game.waveKills,target:game.waveTargetKills,paused:isPaused};
          });
          assert.equal(outcome.combat,false,JSON.stringify({mission,...outcome}));
          continue;
        }
        if(state.busy) { await page.waitForTimeout(750); continue; }
        if(['accessReveal','adminVerified','complete'].includes(state.phase)) { await page.waitForTimeout(1500); continue; }
        let selector=controls[state.phase];
        if(mission===17&&['archive1','archive2'].includes(state.phase)) selector='#story-chapter2-action';
        if(mission>=22) {
          const kind=await frame.evaluate(()=>STORY_FINALE[GameModeRuntime.storySession.mission].stages[GameModeRuntime.storySession.finaleStage].kind);
          selector=kind==='choice'?'#story-finale-choices button:first-child':kind==='ability'?'#story-finale-ability':'#story-finale-action';
        }
        assert.ok(selector,JSON.stringify({mission,...state}));
        await frame.locator(selector).click();
      }
      assert.equal(await frame.evaluate(n=>getStoryProgress()['mission'+n+'Complete'],mission),true,'Mission '+mission);
      if([9,10,21,25,27].includes(mission)) await page.screenshot({path:path.join(evidence,'mission-'+mission+'-complete.png')});
      await frame.locator('#story-mission-result-action').click();
      await page.waitForFunction(()=>!document.getElementById('isolated-story-runtime-overlay'));
      assert.equal(await page.evaluate(()=>JSON.stringify(game)),parentBefore);
      results.push({mission,status:'passed',combat:'real simulation with accelerated clock',actions:'DOM clicks',endless:'unchanged'});
      fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify(results,null,2));
      console.log(JSON.stringify(results.at(-1)));
    }
    assert.deepEqual(errors,[]);
    // Switch all supported locales in an actual browser and verify persistence and visible commands.
    for(const language of ['en','es','de','tr']) {
      await page.evaluate(l=>setGameLanguage(l),language);
      await page.waitForFunction(l=>document.documentElement.lang===l,language);
      assert.equal(await page.evaluate(()=>getGameLanguage()),language);
      const text=await page.locator('#story-start-mission1').innerText();
      assert.ok(text.length>2);
      await page.screenshot({path:path.join(evidence,'language-'+language+'.png')});
      results.push({language,status:'passed',replayLabel:text});
    }
    fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify(results,null,2));
  } catch(error) {
    await page.screenshot({path:path.join(evidence,'failure.png')}).catch(()=>{});
    fs.writeFileSync(path.join(evidence,'failure.json'),JSON.stringify({error:error.stack,errors,results},null,2));
    throw error;
  } finally { await context.close();await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{if(server.listening)server.close();});
