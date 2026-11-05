// Disposable local-server/browser fixtures only. Never sign into production Firebase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require('playwright');
const browserName = process.env.BROWSER_ENGINE || 'chromium';
assert.ok(['chromium','webkit'].includes(browserName));

const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const target = live ? 'https://towerv1-murex.vercel.app/' : 'http://127.0.0.1:4173/';
const evidence = path.join(__dirname, 'browser-evidence', browserName, live ? 'live' : 'local');
fs.mkdirSync(evidence, { recursive: true });
const results = [];
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404); response.end(); return;
  }
  const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(response);
});

async function main() {
  if (!live) await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  if (live) {
    // Test exactly the checked-out production revision, not a stale deployment.
    let matches = false;
    for (let attempt = 0; attempt < 30 && !matches; attempt++) {
      matches = (await Promise.all(['index.html', 'mode-runtime.js', 'data.js', 'locales.js', 'i18n.js', 'ui.js', 'story.js', 'story-finale.js', 'engine.js', 'render.js'].map(async file => {
        const response = await fetch(new URL(file, target));
        return response.ok && await response.text() === fs.readFileSync(path.join(root, file), 'utf8');
      }))).every(Boolean);
      if (!matches) await new Promise(resolve => setTimeout(resolve, 2000));
    }
    assert.equal(matches, true, 'Production assets must match the tested commit');
  }
  const browser = await ({chromium,webkit})[browserName].launch({ headless: true });
  try {
    for (const size of [
      { name: 'phone', width: 390, height: 844, touch: true, fullCombat: true },
      { name: 'landscape', width: 844, height: 390, touch: true },
      { name: 'tablet', width: 1024, height: 1366, touch: true },
      { name: 'desktop', width: 1366, height: 900, touch: false }
    ]) {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: size.touch });
      // Load the actual CDN scripts/styles but prevent any production Auth/Firestore API traffic.
      await context.route(/(?:googleapis\.com\/(?:v1|google\.)|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com)/,
        route => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(target, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => typeof GameModeRuntime !== 'undefined' && typeof game !== 'undefined');
        assert.equal(await page.locator('#mode-main-menu').isVisible(), true);
        // Seed only this fresh disposable guest context with the wave-26 boundary.
        await page.evaluate(() => {
          game.highestWave = 26; game.wave = 26;
          window._syncShadow(); saveGame(true); clearInterval(gameSaveTimer);
          updateStoryUnlockUI();
        });
        const before = await page.evaluate(() => ({ game: JSON.stringify(game), save: localStorage.getItem(SAVE_KEY) }));
        await page.locator('#mode-story-button').click();
        await page.locator('#story-skip').click();
        await page.locator('#story-start-mission1').click();
        await page.waitForFunction(() => document.querySelector('#isolated-story-runtime-overlay iframe')?.contentWindow?.location.search.includes('runtime=story'));
        const frame = page.frames().find(frame => frame.url().includes('runtime=story'));
        assert.ok(frame, 'Story must run in its own frame');
        await frame.waitForFunction(() => typeof GameModeRuntime !== 'undefined' && GameModeRuntime.storySession.active);
        // V17 art acceptance: capture actual Canvas sprite render for all 26 IDs, not concept posters.
        if (size.name === 'tablet') {
          await frame.waitForFunction(() => window.TowerEnemySpritesV17?.getState().registered === 26);
          const art = await frame.evaluate(async () => {
            const sprites = window.TowerEnemySpritesV17;
            const sources = [
              ...['scout','circuit','drone','shield','raider','amber','redrunner','tank_boss'].map(id => 'assets/enemies/v17/'+id+'/body.webp'),
              'assets/enemies/v17/atlas/late-eras.webp',
              'assets/enemies/v17/atlas/bosses.webp'
            ];
            await Promise.all(sources.map(async src => {
              const img = new Image(); img.src = src;
              if (img.decode) await img.decode();
              else await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
              if (!img.naturalWidth || !img.naturalHeight) throw new Error('V17 raster failed: '+src);
            }));
            const ids = [...sprites.VARIANTS, ...sprites.BOSSES];
            const sheet = document.createElement('canvas');
            sheet.width = 6*120; sheet.height = 5*124;
            const out = sheet.getContext('2d');
            out.fillStyle='#080d16';out.fillRect(0,0,sheet.width,sheet.height);
            const results = [];
            for(let index=0;index<ids.length;index++){
              const id=ids[index],boss=sprites.BOSSES.includes(id);
              const cell=document.createElement('canvas');cell.width=110;cell.height=92;
              const ctx=cell.getContext('2d');
              ctx.save();ctx.translate(55,45);
              const enemy={type:boss?'boss':'green',subType:boss?id:'normal',variantId:id,
                radius:boss?31:17,x:0,y:0,hp:100,maxHp:100,hitFlash:0,
                v12Combat:boss?{phase:2}:undefined};
              const ok=sprites.render(ctx,enemy,0,100,performance.now());
              ctx.restore();
              const data=ctx.getImageData(0,0,110,92).data;
              let visible=0;
              for(let j=3;j<data.length;j+=4)if(data[j]>20)visible++;
              if(!ok||visible<20)throw new Error('V17 sprite blank at gameplay scale: '+id+' pixels='+visible);
              const x=(index%6)*120+5,y=Math.floor(index/6)*124+6;
              out.drawImage(cell,x,y);
              out.fillStyle='#c4d3df';out.font='11px sans-serif';
              out.fillText(id,x+3,y+108);
              results.push({id,visible});
            }
            return {png:sheet.toDataURL('image/png').split(',')[1],results};
          });
          assert.equal(art.results.length,26,'all 21 normal identities + 5 bosses render actual raster pixels');
          fs.writeFileSync(path.join(evidence,'v17-sprites-tablet.png'),Buffer.from(art.png,'base64'));
          results.push({target,browser:browserName,viewport:'tablet-v17-art',status:'passed',sprites:art.results.length,
            minOpaquePixels:Math.min(...art.results.map(s=>s.visible))});
          // Test the *actual* shared character renderer in contrasting arena colors.
          // Generated screenshots let us compare the same Echo, Scout and Titan code,
          // including the red Cengiz-theme visibility case, rather than reference posters.
          const trio = await frame.evaluate(() => {
            const maker=window.TowerUnifiedCharactersV17;
            if(!maker)throw new Error('Shared LOST SIGNAL art missing');
            const out=document.createElement('canvas');
            out.width=690;out.height=380;
            const panel=out.getContext('2d');
            const results=[];
            for(let row=0;row<2;row++){
              const background=row===0?'#10253b':'#813232';
              const border=row===0?'#526a80':'#a5746b';
              for(let col=0;col<3;col++){
                const x=col*230,y=row*190;
                panel.fillStyle=background;panel.fillRect(x,y,230,190);
                panel.strokeStyle=border;panel.lineWidth=1;panel.strokeRect(x+5,y+5,220,180);
                const cell=document.createElement('canvas');cell.width=170;cell.height=133;
                const c=cell.getContext('2d');c.save();c.translate(85,67);
                let ok=false;
                if(col===0)ok=maker.drawCompanion(c,'default_tech','repairDrone',3,0,1800);
                if(col===1)ok=maker.drawEnemy(c,{type:'green',variantId:'scout',radius:12,
                   x:0,y:0,hp:90,maxHp:100,hitFlash:0},60,0,1800);
                if(col===2)ok=maker.drawEnemy(c,{type:'boss',subType:'tank_boss',radius:35,
                   x:0,y:0,hp:90,maxHp:100,hitFlash:0,v12Combat:{phase:row===0?1:3}},60,0,1800);
                c.restore();
                const pixels=c.getImageData(0,0,170,133).data;
                let occupied=0;
                for(let i=3;i<pixels.length;i+=4)if(pixels[i]>20)occupied++;
                if(!ok||occupied<250)throw new Error('Unreadable unified asset '+col+' on theme '+row+': '+occupied);
                panel.drawImage(cell,x+30,y+10);
                panel.fillStyle='#e0f2fe';panel.font='bold 15px sans-serif';
                const name=['ECHO · companion','SCOUT · enemy','TITAN · boss'][col];
                panel.fillText(name,x+20,y+165);
                results.push({name,theme:row?'Cengiz red':'Cyber dark',occupied});
              }
            }
            return {png:out.toDataURL('image/png').split(',')[1],results};
          });
          assert.equal(trio.results.length,6,'three reference characters in two high-contrast themes');
          fs.writeFileSync(path.join(evidence,'v17-unified-reference-trio.png'),Buffer.from(trio.png,'base64'));
          results.push({target,browser:browserName,viewport:'tablet-unified-trio',status:'passed',
            variants:trio.results.length,minPaintedPixels:Math.min(...trio.results.map(x=>x.occupied))});
        }
        assert.equal(await frame.evaluate(() => game.wave), 1);
        assert.equal(await frame.evaluate(() => getStoryProgress().mission1Complete), false);
        assert.equal(await frame.locator('#gameCanvas').isVisible(), true);
        const dimensions = await frame.evaluate(() => ({ width: canvas.width, height: canvas.height, overflow: document.documentElement.scrollWidth > innerWidth }));
        assert.ok(dimensions.width > 0 && dimensions.height > 0);
        assert.equal(dimensions.overflow, false);
        await frame.locator('#btn-pause').click();
        assert.equal(await frame.evaluate(() => isPaused), true);
        await frame.locator('#btn-pause').click();
        assert.equal(await frame.evaluate(() => isPaused), false);
        await frame.locator('#btn-speed').click();
        assert.equal(await frame.locator('#ui-speed').innerText(), '2x');
        await frame.locator('#btn-speed').click();
        assert.equal(await frame.locator('#ui-speed').innerText(), '3x');
        await frame.locator('header button[onclick="toggleUpgradeDrawer()"]').click();
        assert.equal(await frame.evaluate(() => isDrawerOpen), true);
        await frame.locator('#upgrade-drawer button[onclick="toggleUpgradeDrawer()"]').click();
        const expanded = await frame.locator('#story-mission-panel-toggle').getAttribute('aria-expanded');
        assert.equal(expanded, size.height < 500 ? 'false' : 'true');
        await frame.locator('#story-mission-panel-toggle').click();
        assert.equal(await frame.locator('#story-mission-panel-toggle').getAttribute('aria-expanded'), String(expanded !== 'true'));
        await frame.locator('#story-mission-panel-toggle').click();
        await page.screenshot({ path: path.join(evidence, `${size.name}-mission.png`) });
        if (size.fullCombat) {
          await frame.waitForFunction(() => GameModeRuntime.storySession.phase === 'stabilize', null, { timeout: 120000 });
          assert.equal(await frame.evaluate(() => getStoryProgress().mission1Complete), false);
          await frame.locator('#btn-pause').click();
          assert.equal(await frame.evaluate(() => isPaused), true);
          await frame.locator('#story-stabilize-action').click();
          await frame.waitForFunction(() => getStoryProgress().mission1Complete);
          await page.screenshot({ path: path.join(evidence, `${size.name}-complete.png`) });
          await frame.locator('#story-mission-result-action').click();
        } else {
          await page.locator('#isolated-story-runtime-overlay > button').click();
        }
        await page.waitForFunction(() => !document.getElementById('isolated-story-runtime-overlay'));
        const after = await page.evaluate(() => ({ game: JSON.stringify(game), save: localStorage.getItem(SAVE_KEY) }));
        assert.deepEqual(after, before, 'Story must preserve parent Endless state and save');
        await page.locator('#story-start-mission1').click();
        await page.waitForFunction(() => document.querySelector('#isolated-story-runtime-overlay iframe')?.contentWindow?.location.search.includes('runtime=story'));
        const replay = page.frames().find(frame => frame.url().includes('runtime=story'));
        await replay.waitForFunction(() => typeof GameModeRuntime !== 'undefined' && GameModeRuntime.storySession.active);
        assert.equal(await replay.evaluate(() => GameModeRuntime.storySession.completed), false);
        await page.locator('#isolated-story-runtime-overlay > button').click();
        await page.locator('#story-mode-screen .story-exit').first().click();
        await page.locator('#mode-main-menu button').filter({ hasText: 'Sonsuz Mod' }).click();
        assert.equal(await page.evaluate(() => isPaused), false);
        assert.equal(await page.evaluate(() => game.highestWave), 26);
        assert.deepEqual(errors, []);
        results.push({ target, browser:browserName, viewport: size.name, status: 'passed', dimensions, combat: size.fullCombat ? 'natural combat + explicit completion' : 'launch/controls/abort' });
        console.log(JSON.stringify(results.at(-1)));
      } catch (error) {
        await page.screenshot({ path: path.join(evidence, `${size.name}-failure.png`) }).catch(() => {});
        results.push({ viewport: size.name, status: 'failed', error: error.stack, pageErrors: errors });
        throw error;
      } finally {
        fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(results, null, 2));
        await context.close();
      }
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { if (server.listening) server.close(); });
