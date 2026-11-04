// Fresh guest contexts only; production Firebase requests are blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium, webkit} = require('playwright');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const target = live ? 'https://towerv1-murex.vercel.app/' : 'http://127.0.0.1:4175/';
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + (new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
  if (!file.startsWith(root + '/') || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  res.end(fs.readFileSync(file));
});
const engine = process.env.BROWSER_ENGINE || 'chromium';
async function main() {
  if (!live) await new Promise(r=>server.listen(4175,'127.0.0.1',r));
  if (live) for (const name of fs.readdirSync(root).filter(n=>/\.(js|css|html)$/.test(n))) {
    const res = await fetch(new URL(name,target));
    assert.equal(await res.text(),fs.readFileSync(path.join(root,name),'utf8'),`Live source ${name}`);
  }
  const browser = await ({chromium,webkit})[engine].launch(process.env.CHROMIUM_PATH && engine==='chromium' ? {executablePath:process.env.CHROMIUM_PATH}: {});
  try {for (const [width,height] of [[390,844],[844,390],[1024,1366],[1366,900]]) {
    const context = await browser.newContext({viewport:{width,height},hasTouch:true});
    await context.route(/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/,r=>r.abort());
    const out=path.join(__dirname,'browser-evidence','overhaul',engine,live?'live':'local');fs.mkdirSync(out,{recursive:true});
    const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(target,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.TowerOverhaulV11 && typeof game !== 'undefined');
    assert.equal(await page.evaluate(()=>TowerOverhaulV11.active()),false);
    await page.locator('#ls-v11-tools button').first().click();
    assert.equal(await page.locator('.ls-v11-choice:disabled').count(),3);
    await page.getByRole('button',{name:'KAPAT ✕',exact:true}).click();
    await page.evaluate(()=>{game.highestWave=60;window._syncShadow();saveGame(true);clearInterval(gameSaveTimer);});
    const before=await page.evaluate(()=>({game:JSON.stringify(game),save:localStorage.getItem(SAVE_KEY)}));
    // Use actual menu and mobile movement buttons; no terminal/completion state injection.
    await page.locator('#ls-v11-tools button').last().click();
    await page.getByRole('button',{name:/ODAK MERCEĞİ/}).click();
    await page.getByRole('button',{name:/HIZ REAKTÖRÜ/}).click();
    await page.getByRole('button',{name:/ONARIM KAPLAMASI/}).click();
    await page.getByRole('button',{name:'KAPAT ✕',exact:true}).click();
    for (let m=0;m<3;m++) {
      await page.locator('#ls-v11-tools button').first().click();
      await page.locator('.ls-v11-choice').nth(m).click();
      const start=await page.evaluate(()=>TowerOverhaulV11.getScene().getPosition());
      await page.keyboard.press('ArrowLeft');
      assert.deepEqual(await page.evaluate(()=>TowerOverhaulV11.getScene().getPosition()),start,'Walls block keyboard movement');
      const routes=await page.evaluate(()=>{
        const scene=TowerOverhaulV11.getScene();
        const map=TowerOverhaulV11.MAPS.find(m=>m.name===document.querySelector('.ls-v11-head strong').textContent.split(' · ')[0]);
        let start=scene.getPosition();const result=[];
        for(const target of scene.terminals){const q=[[start.x,start.y,[]]],seen=new Set();let route;
          while(q.length){const [x,y,p]=q.shift();if(x===target.x&&y===target.y){route=p;break;}if(seen.has(x+','+y))continue;seen.add(x+','+y);
            for(const [dx,dy,label] of [[0,-1,'↑'],[-1,0,'←'],[0,1,'↓'],[1,0,'→']])if(map.rows[y+dy]?.[x+dx]&&map.rows[y+dy][x+dx]!=='#')q.push([x+dx,y+dy,[...p,label]]);
          }result.push(route);start=target;
        }return result;
      });
      for(const route of routes){assert.ok(route);for(const label of route)await page.locator('.ls-v11-controls').getByRole('button',{name:label,exact:true}).tap();await page.getByRole('button',{name:'ETKİLEŞ',exact:true}).tap();}
      assert.match(await page.locator('.ls-v11-note').innerText(),/KAYIT ÇÖZÜLDÜ/);
      await page.screenshot({path:path.join(out,`${width}x${height}-sector-${m}.png`)});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.getByRole('button',{name:'KAPAT ✕',exact:true}).click();
      assert.equal(await page.evaluate(()=>TowerOverhaulV11.getScene()),null);
    }
    await page.locator('#ls-v10-tools button').last().click();
    await page.getByRole('button',{name:'BU YOLU SEÇ',exact:true}).nth(1).click();
    await page.locator('#ls-v10-modal .ls-v10-header button').click();
    assert.deepEqual(await page.evaluate(()=>({game:JSON.stringify(game),save:localStorage.getItem(SAVE_KEY)})),before);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.TowerOverhaulV11 && typeof game !== 'undefined');
    assert.equal(await page.evaluate(()=>TowerOverhaulV11.getState().completed.length),3);
    assert.equal(await page.evaluate(()=>TowerOverhaulV11.getState().modules.weapon),'focus');
    assert.equal(await page.evaluate(()=>TowerHardV10.path()),'kinetic');
    assert.equal(await page.evaluate(()=>game.highestWave),60);
    assert.equal(await page.locator('#mode-story-button').getAttribute('aria-disabled'),'false','Loaded save refreshes Story unlock');
    await page.screenshot({path:path.join(out,`${width}x${height}.png`)});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({engine,width,height,live,status:'PASS',terminals:6,savePreserved:true}));
    await context.close();
  }} finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
