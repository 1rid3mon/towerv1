'use strict';
// Story Mode 2.0 — playable episode grouping, resume, completion acknowledgements
// and isolation against legacy mission save flags.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript; charset=utf-8' :
    file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8');
  if (/story-interior-mission01\.html$|story-interior-missions(?:02-05|06-10)\.html$/.test(file)) {
    let html = fs.readFileSync(file, 'utf8');
    const inject = 'window.__qaFinish=()=>{ if(typeof powerChoice!==\'undefined\' && mission===4) powerChoice=\'shield\'; finish(\'QA stage completed\'); };\n})();\n</script>';
    // mission01 has no lexical "mission"; only evaluate that expression in the other pages.
    const source = /story-interior-mission01\.html$/.test(file)
      ? 'window.__qaFinish=()=>finish();\n})();\n</script>' : inject;
    assert(html.includes('})();\n</script>'), 'QA hook could not be injected: ' + file);
    html = html.replace('})();\n</script>', source);
    res.end(html); return;
  }
  if (['story-interior-missions11-15.js','story-interior-missions16-20.js',
      'story-interior-missions21-27.js'].some(name => file.endsWith(name))) {
    let js=fs.readFileSync(file,'utf8');
    const end=js.lastIndexOf('})();');
    assert.ok(end>0,'Underground QA hook target missing');
    js=js.slice(0,end)+`window.__qaFinish=()=>{
      if(typeof choice!=='undefined' && mission===17) choice='piko';
      if(typeof choice!=='undefined' && mission===23) choice='preserve';
      finish("QA stage completed");
    };`+String.fromCharCode(10)+'})();'+js.slice(end+5);
    res.end(js); return;
  }
  fs.createReadStream(file).pipe(res);
});
async function main() {
  await new Promise(resolve => server.listen(4217, '127.0.0.1', resolve));
  const browser = await (process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium).launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: {width: 1180,height: 820},hasTouch: true });
    await context.route(/(?:googleapis\.com|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com)/, r => r.abort());
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4217/', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => typeof startStoryMission === 'function' && typeof game !== 'undefined');
    await page.evaluate(() => {
      game.wave = 26; game.highestWave = 26; window._syncShadow?.();
      saveGame(true); updateStoryUnlockUI();
      localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify({introSeen:true,chapter:1}));
      updateStoryMissionBoard();
    });
    const iframe = page.locator('#lost-signal-interior-overlay iframe');
    const overlay = page.locator('#lost-signal-interior-overlay');
    assert.equal(await page.locator('#story-start-mission2').evaluate(el => el.closest('.story-mission').style.display), 'none');
    assert.equal(await page.locator('#story-start-mission6').evaluate(el => el.closest('.story-mission').style.display), 'none');

    async function expectStage(mission) {
      await iframe.waitFor({state:'visible',timeout:6500});
      await page.waitForFunction(m => Number(document.querySelector('#lost-signal-interior-overlay')?.dataset.mission) === m, mission);
      const frame = await (await iframe.elementHandle()).contentFrame();
      await frame.waitForFunction(() => typeof window.__qaFinish === 'function', {timeout:6500});
      assert.match(frame.url(), new RegExp('mission=' + mission));
      const heading = await frame.locator(mission === 1 ? '#status' : '#objective').innerText();
      assert.match(heading, /BÖLÜM 0[1-9]/, 'Stage should display its grouped episode');
      return frame;
    }
    async function finishStage(mission, last) {
      const frame = await expectStage(mission);
      await frame.evaluate(() => window.__qaFinish());
      await frame.locator(mission === 1 ? '#complete' : '#done').click();
      await page.waitForFunction(m => getStoryProgress()['mission' + m + 'Complete'] === true, mission);
      if (!last) {
        await page.locator('#story-episode-transition').waitFor({state:'visible',timeout:6500});
        assert.equal(await overlay.count(), 1, 'No stacked overlays');
      } else {
        await overlay.waitFor({state:'detached',timeout:6500});
      }
    }
    async function continueEpisode() {
      await page.locator('#story-episode-continue').click();
      await page.locator('#story-episode-transition').waitFor({state:'detached',timeout:6500});
    }
    // First grouped episode: one launch, stage checkpoints, quit, then resume.
    await page.evaluate(() => startStoryMission(1));
    await finishStage(1,false);
    await page.locator('#story-episode-exit').click();
    await overlay.waitFor({state:'detached'});
    await page.evaluate(() => startStoryMission(1));
    await finishStage(2,false);
    await continueEpisode();
    await finishStage(3,true);
    assert.equal(await page.evaluate(() => getStoryProgress().mission3Complete),true);
    assert.equal(await page.evaluate(() => document.querySelector('#story-start-mission4').disabled),false);

    // Second episode: the power choice is committed before stage 5 loads.
    await page.evaluate(() => startStoryMission(4));
    await finishStage(4,false);
    assert.equal(await page.evaluate(() => getStoryProgress().powerChoice),'shield');
    await continueEpisode();
    await finishStage(5,false);
    await continueEpisode();
    await finishStage(6,true);
    assert.equal(await page.evaluate(() => document.querySelector('#story-start-mission7').disabled),false);

    // Three further episodes preserve the 7–15 story and save every internal stage.
    for (const start of [7,10,13]) {
      await page.evaluate(n => startStoryMission(n), start);
      await finishStage(start,false);
      if (start===10) {
        // Cross-file checkpoint: leave after secret-door scene, reopen at mission 11.
        await page.locator('#story-episode-exit').click();
        await overlay.waitFor({state:'detached'});
        await page.evaluate(() => startStoryMission(10));
        await expectStage(11);
      } else {
        await continueEpisode();
      }
      await finishStage(start+1,false);
      await continueEpisode();
      await finishStage(start+2,true);
      assert.equal(await page.evaluate(n => getStoryProgress()['mission' + n + 'Complete'], start+2),true);
      assert.equal(await page.evaluate(n => document.querySelector('#story-start-mission' + n).disabled, start+3),false);
    }
    assert.equal(await page.locator('#story-start-mission15').evaluate(el=>el.closest('.story-mission').style.display),'none');
    assert.match(await page.locator('#story-campaign-progress-count').innerText(),/5 \/ 17/);

    // Last four episodes include both chapter crossings and Piko's final decisions.
    for (const start of [16,19,22,25]) {
      await page.evaluate(n => startStoryMission(n), start);
      await finishStage(start,false);
      if(start===19) {
        // Leave after the fleet telemetry checkpoint, resume directly at stealth.
        await page.locator('#story-episode-exit').click();
        await overlay.waitFor({state:'detached',timeout:6500});
        await page.evaluate(() => startStoryMission(19));
        await expectStage(20);
      } else {
        await continueEpisode();
      }
      await finishStage(start+1,false);
      await continueEpisode();
      await finishStage(start+2,true);
      assert.equal(await page.evaluate(n => getStoryProgress()['mission' + n + 'Complete'],start+2),true);
      if(start+3<=27)
        assert.equal(await page.evaluate(n=>document.querySelector('#story-start-mission'+n).disabled,start+3),false);
    }
    // The Piko call sign, memory decision, and final form must not disappear between scenes.
    assert.deepEqual(await page.evaluate(() => {
      const progress=getStoryProgress();
      return [progress.callSignChoice,progress.stabilityChoice,progress.companionForm,progress.mission27Complete];
    }),['piko','preserve','tower',true]);
    assert.equal(await page.locator('#story-start-mission27').evaluate(el=>el.closest('.story-mission').style.display),'none');
    assert.match(await page.locator('#story-campaign-progress-count').innerText(),/9 \/ 9/);
    // Reopening a fully complete finale should start at its first stage, not create a 28th mission.
    await page.evaluate(() => startStoryMission(25));
    await expectStage(25);
    const finalReplay = await (await iframe.elementHandle()).contentFrame();
    await finalReplay.evaluate(() => window.parent.postMessage({type:'lost-signal-interior-close'},location.origin));
    await overlay.waitFor({state:'detached',timeout:6500});

    // A legacy player who completed 7 and 8 must resume episode 3 at stage 9.
    await page.evaluate(() => {
      const data={introSeen:true,chapter:1};
      for(let i=1;i<=8;i++)data['mission'+i+'Complete']=true;
      localStorage.setItem(STORY_PROGRESS_KEY,JSON.stringify(data));
      updateStoryMissionBoard();startStoryMission(7);
    });
    await expectStage(9);
    const resumed = await (await iframe.elementHandle()).contentFrame();
    await resumed.evaluate(() => window.parent.postMessage({type:'lost-signal-interior-close'},location.origin));
    await overlay.waitFor({state:'detached',timeout:6500});

    // Existing mission flags work without migration or replaying earlier completed stages.
    await page.evaluate(() => {
      const data = {introSeen:true,chapter:1,mission1Complete:true,mission2Complete:true,mission3Complete:false,
        mission4Complete:false,mission5Complete:false,mission6Complete:false};
      localStorage.setItem(STORY_PROGRESS_KEY,JSON.stringify(data));updateStoryMissionBoard();startStoryMission(1);
    });
    await expectStage(3);
    await page.evaluate(() => document.querySelector('#lost-signal-interior-overlay iframe').contentWindow
      .postMessage({type:'lost-signal-interior-close'},location.origin));
    // Dispatch from the child rather than parent; parent-origin posts must be ignored.
    const child = await (await iframe.elementHandle()).contentFrame();
    await child.evaluate(() => window.parent.postMessage({type:'lost-signal-interior-close'},location.origin));
    await overlay.waitFor({state:'detached'});
    assert.equal(await page.evaluate(() => getStoryProgress().mission2Complete),true);
    assert.equal(await page.evaluate(() => getStoryProgress().mission3Complete),false);

    // A rejected save cannot advance the episode and must allow retry.
    await page.evaluate(() => {
      localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify({introSeen:true,chapter:1}));
      window.__qaSaveStoryProgress = saveStoryProgress;
      window.saveStoryProgress = () => false;
      startStoryMission(1);
    });
    const f = await expectStage(1);
    await f.evaluate(() => window.__qaFinish());
    await f.locator('#complete').click();
    await f.locator('#complete').waitFor({state:'visible'});
    await f.waitForFunction(() => !document.querySelector('#complete').disabled,{timeout:4500});
    assert.equal(await page.locator('#story-episode-transition').count(),0);
    await page.evaluate(() => {window.saveStoryProgress = window.__qaSaveStoryProgress});
    await f.locator('#complete').click();
    await page.locator('#story-episode-transition').waitFor({state:'visible',timeout:4500});
    await page.locator('#story-episode-exit').click();
    await overlay.waitFor({state:'detached'});
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log('Story 2.0 grouped episodes/resume/ack/save-failure: PASS (' + (process.env.BROWSER_ENGINE||'chromium') + ')');
    await context.close();
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(err => { console.error(err); process.exitCode=1; server.close(); });
