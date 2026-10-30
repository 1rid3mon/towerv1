// Disposable local-server/browser fixtures only. Never sign into production Firebase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const target = live ? 'https://towerv1-murex.vercel.app/' : 'http://127.0.0.1:4173/';
const evidence = path.join(__dirname, 'browser-evidence', live ? 'live' : 'local');
fs.mkdirSync(evidence, { recursive: true });
const results = [];
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404); response.end(); return;
  }
  const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(response);
});

async function main() {
  if (!live) await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  if (live) {
    // Test exactly the checked-out production revision, not a stale deployment.
    let matches = false;
    for (let attempt = 0; attempt < 30 && !matches; attempt++) {
      matches = (await Promise.all(['index.html', 'mode-runtime.js', 'data.js', 'ui.js', 'story.js', 'engine.js', 'render.js'].map(async file => {
        const response = await fetch(new URL(file, target));
        return response.ok && await response.text() === fs.readFileSync(path.join(root, file), 'utf8');
      }))).every(Boolean);
      if (!matches) await new Promise(resolve => setTimeout(resolve, 2000));
    }
    assert.equal(matches, true, 'Production assets must match the tested commit');
  }
  const browser = await chromium.launch({ headless: true });
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
        await frame.locator('#story-mission-panel-toggle').click();
        assert.equal(await frame.locator('#story-mission-panel-toggle').getAttribute('aria-expanded'), 'false');
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
        assert.deepEqual(errors, []);
        results.push({ target, viewport: size.name, status: 'passed', dimensions, combat: size.fullCombat ? 'natural combat + explicit completion' : 'launch/controls/abort' });
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
