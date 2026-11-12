'use strict';
// End-to-end mission logic in real Chromium. QA observability is injected by this
// local-only test server; gameplay files in GitHub never expose teleport APIs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const instruments='window.__qa={p,stations:typeof nodes==="undefined"?stations:nodes,get foes(){return typeof foes==="undefined"?enemies:foes},base:typeof base==="undefined"?null:base,turret:typeof turret==="undefined"?null:turret,interact,phase:()=>phase,get shield(){return shield},set shield(v){shield=v},get breaches(){return breaches},gates:typeof gates==="undefined"?[]:gates,collision:typeof collision==="undefined"?()=>false:collision};';
const server=http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/story-interior-art.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-art.js'),'utf8'));return}
 if(new URL(req.url,'http://localhost').pathname==='/story-interior-completion.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-completion.js'),'utf8'));return}

 const u=new URL(req.url,'http://localhost'),name=path.basename(u.pathname);
 if(!['story-interior-mission01.html','story-interior-missions02-05.html'].includes(name)){res.writeHead(404);res.end();return}
 let html=fs.readFileSync(path.join(root,name),'utf8');
 assert(html.includes('})();\n</script>'));
 html=html.replace('})();\n</script>',instruments+'\n})();\n</script>');
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
});
async function play(){
 await new Promise(r=>server.listen(4193,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
  for(const mission of [1,2,3,4,5]){
   const page=await browser.newPage({viewport:{width:1032,height:1376},hasTouch:true,deviceScaleFactor:2});
   const errors=[],messages=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   const filename=mission===1?'story-interior-mission01.html':'story-interior-missions02-05.html?mission='+mission+(mission===5?'&power=shield':'');
   await page.goto('http://127.0.0.1:4193/'+filename,{waitUntil:'load'});
   await page.evaluate(()=>{window.addEventListener('message',e=>{if(e.data?.type==='lost-signal-interior-mission-complete')window.__completion=e.data})});
   const station=async type=>page.evaluate(k=>{const q=window.__qa;const n=q.stations.find(z=>z.kind===k||z.type===k);if(!n)throw Error('No station '+k);q.p.x=n.x;q.p.y=n.y;q.interact();},type);
   const named=async label=>page.evaluate(k=>{const q=window.__qa;const n=q.stations.find(z=>z.label===k);if(!n)throw Error('No node '+k);q.p.x=n.x;q.p.y=n.y;q.interact();},label);
   const close=async()=>{if(await page.locator('#modal.open #ok').count())await page.locator('#modal.open #ok').click();else if(await page.locator('#modal.open #cancel').count())await page.locator('#modal.open #cancel').click();else if(await page.locator('#modal.open #leave').count())await page.locator('#modal.open #leave').click();else throw Error('No active dialog to close in mission '+mission+' at '+await page.locator('#objective').innerText())};
   const defeat=async()=>{
    const list=await page.evaluate(()=>window.__qa.foes.map(z=>({x:z.x,y:z.y,hp:z.hp})));
    for(let k=0;k<list.length;k++){
     for(let j=0;j<list[k].hp;j++){
      const pt=await page.evaluate(k=>{const q=window.__qa,foe=q.foes[k];q.p.x=foe.x;q.p.y=foe.y;const w=innerWidth,h=innerHeight,one=location.pathname.includes('mission01');const sc=Math.min(w/(one?650:740),h/(one?380:450),one?1.5:1.55),mapWidth=one?1000:1080,mapHeight=one?500:570;const ox=Math.max(0,Math.min(mapWidth-w/sc,q.p.x-w/sc/2)),oy=Math.max(0,Math.min(mapHeight-h/sc,q.p.y-h/sc/2));return{x:(foe.x-ox)*sc,y:(foe.y-oy)*sc}},k);
      await page.mouse.click(pt.x,pt.y);
     }
    }
    assert.equal(await page.locator('#modal.open').count(),1,'combat success modal');
    await close();
   };
   if(mission===1){
    await page.evaluate(()=>{const q=__qa;for(const n of q.stations.filter(x=>x.kind==='log')){q.p.x=n.x;q.p.y=n.y;q.interact();const btn=document.getElementById('ok');if(btn)btn.click()}});
    await station('console');
    for(const i of [0,1,2])await page.locator('#fuse button[data-i="'+i+'"]').click();
    await close();await station('door');await close();await station('defense');await close();
    const approaching=await page.evaluate(()=>__qa.foes.map(e=>({x:e.x,y:e.y})));
    await page.waitForFunction(before=>__qa.foes.some((e,i)=>e.hp>0&&e.x<before[i].x-5),approaching,{timeout:2500});
    assert.match(await page.locator('#status').innerText(),/Kalan tehdit: 3/);
    await page.evaluate(()=>{const q=__qa;q.base.hp=2;q.foes[0].x=q.turret.x+40;q.foes[0].y=q.turret.y});
    await page.locator('#retry').waitFor({timeout:4500});
    await page.locator('#retry').click();
    assert.equal(await page.evaluate(()=>__qa.phase()),3,'retry must return to defense checkpoint');
    assert.deepEqual(await page.evaluate(()=>({hp:__qa.base.hp,positions:__qa.foes.map(e=>e.x)})),{hp:12,positions:[815,855,815]},'retry restores reactor and attackers');
    await station('defense');await close();
    await defeat();await station('defense');
   }else if(mission===2){
    await station('exit');await close();
    const start=await page.evaluate(()=>__qa.foes.map(e=>({x:e.x,y:e.y})));
    await page.waitForFunction(before=>__qa.foes.some((e,i)=>Math.hypot(e.x-before[i].x,e.y-before[i].y)>5),start,{timeout:2000});
    await defeat();
    for(const clue of ['TARAMA A','TARAMA B','TARAMA C']){await named(clue);await close()}
    await station('exit');
    await page.locator('#deduction button').filter({hasText:'Anten 02:03'}).click();
    assert.match(await page.locator('#deduction-feedback').innerText(),/çelişki değil/);
    await page.locator('#deduction button').filter({hasText:'Yankı, ilk sinyalden önce'}).click();
   }else if(mission===3){
    assert.equal(await page.evaluate(()=>{const q=__qa,g=q.gates[0];return q.collision(g.x+g.w/2,g.y+g.h/2)}),true,'first antenna gate must be closed');
    await station('anten');await close();
    assert.equal(await page.evaluate(()=>{const q=__qa,g=q.gates[0];return q.collision(g.x+g.w/2,g.y+g.h/2)}),false,'first antenna gate opens');
    await station('relay');await close();
    for(const name of ['BAKIM KAYDI','SPEKTRUM KAYDI','YANKI KAYDI']){await named(name);await close()}
    await station('filter');
    for(const i of [2,4,1])await page.locator('#tones button').filter({hasText:'KANAL '+i}).click();
    await close();await station('terminal');await close();await station('exit');
   }else if(mission===4){
    await station('reactor');await close();await station('power');
    await page.getByText('KALKANI GÜÇLENDİR',{exact:true}).click();await close();await station('exit');
   }else{
    const weaponPage=await browser.newPage({viewport:{width:1032,height:1376},hasTouch:true,deviceScaleFactor:2});
    await weaponPage.goto('http://127.0.0.1:4193/story-interior-missions02-05.html?mission=5&power=weapon');
    assert.deepEqual(await weaponPage.evaluate(()=>({shield:__qa.shield,hits:__qa.foes.map(e=>e.hp)})),{shield:18,hits:[2,2,2,2]},'Weapon priority must reduce required hits at the cost of shield');await weaponPage.close();
    await station('security');await close();await station('turret');await close();
    const intact=await page.evaluate(()=>__qa.shield);await page.waitForTimeout(4800);
    assert.equal(await page.evaluate(()=>__qa.shield),intact,'Power corridor cannot take timer-only damage');
    await page.evaluate(()=>{__qa.shield=3;const e=__qa.foes[0];e.x=550;e.y=330});await page.locator('#modal.open #ok').waitFor({timeout:2000});
    assert.match(await page.locator('#modal.open').innerText(),/YENİDEN DENE/,'A real core breach must trigger checkpoint retry');await close();
    assert.deepEqual(await page.evaluate(()=>({shield:__qa.shield,hits:__qa.foes.map(e=>e.hp),positions:__qa.foes.map(e=>e.x),phase:__qa.phase()})),{shield:26,hits:[4,4,4,4],positions:[935,875,800,930],phase:1},'Shield priority and threat positions must reset on loss');
    await station('turret');await close();await defeat();
    await station('turret');await close();await station('relay');
    for(const txt of ['GÜVENLİK','ENERJİ','ANTEN'])await page.locator('#order button').filter({hasText:txt}).click();
    await close();await station('exit');
   }
   await page.locator(mission===1?'#complete':'#done').click();
   await page.waitForFunction(m=>window.__completion?.mission===m,mission,{timeout:3000});
   const completion=await page.evaluate(()=>window.__completion);
   assert.equal(completion?.mission,mission,'mission completion message');
   if(mission===4)assert.equal(completion.choice,'shield');
   assert.deepEqual(errors,[],'browser errors '+mission);
   console.log('mission '+mission+' completed with real UI controls; completion signal verified');
   await page.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
}
play().catch(e=>{console.error(e);process.exitCode=1;server.close()});
