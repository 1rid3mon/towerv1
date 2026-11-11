'use strict';
/* Five-game campaign QA, real DOM terminal interactions and combat pointer events.
 * A test-only local server exposes positioning hooks for accelerated playthrough.
 * It does not bypass mission state transitions or solve puzzles internally. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'story-interior-missions06-10.html'),'utf8');
assert(source.includes('İÇ SEKTÖR A'), 'missing interior station map');
const script=source.match(/<script>([\s\S]*?)<\/script>/);assert(script);new(require('node:vm').Script)(script[1]);
const qa='window.__qa={player,stations,gates,hazards,foes,handle,interact,get phase(){return phase},get round(){return round},get shield(){return shield},set shield(v){shield=v},get breaches(){return breaches},get combat(){return combat},collisions,projection};';
assert(source.includes('})();\n</script>'));
const html=source.replace('})();\n</script>',qa+'\n})();\n</script>');
const server=http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/story-interior-completion.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,'story-interior-completion.js'),'utf8'));return}

 const name=new URL(req.url,'http://127.0.0.1').pathname;
 if(name!=='/story-interior-missions06-10.html'){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
});
async function run(){
 await new Promise(resolve=>server.listen(4195,'127.0.0.1',resolve));
 const browser=await (process.env.BROWSER_ENGINE==='webkit'?webkit:chromium).launch({headless:true});
 try{
  for(const mission of [6,7,8,9,10]){
   const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true,deviceScaleFactor:2});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4195/story-interior-missions06-10.html?mission='+mission+'&power=shield');
   await page.evaluate(()=>window.addEventListener('message',e=>{if(e.data?.type==='lost-signal-interior-mission-complete')window.__completed=e.data}));
   const visit=async(kind,label)=>{
    await page.evaluate(({kind,label})=>{
     const q=window.__qa;
     const n=q.stations.find(z=>z.kind===kind&&(!label||z.label===label));
     if(!n)throw Error('Missing station '+kind);
     q.player.x=n.x;q.player.y=n.y;q.interact();
    },{kind,label});
   };
   const choose=async text=>{const b=page.locator('#options button').filter({hasText:text});assert.equal(await b.count(),1,'missing option '+text+' in mission '+mission);await b.click()};
   const close=async()=>{await page.locator('#modal.open #continue').click({timeout:4000})};
   const battle=async(count)=>{
    const state=await page.evaluate(()=>({combat:__qa.combat,foes:__qa.foes.length}));
    assert.equal(state.combat,true,'battle not started');
    assert.equal(state.foes,count,'wrong wave size');
    const list=await page.evaluate(()=>__qa.foes.map(e=>e.hp));
    for(let i=0;i<list.length;i++){
     for(let j=0;j<list[i];j++){
      const position=await page.evaluate(i=>{const q=__qa,f=q.foes[i];q.player.x=490;q.player.y=300;const p=q.projection();return{x:(f.x-p.ox)*p.scale,y:(f.y-p.oy)*p.scale}},i);
      await page.mouse.click(position.x,position.y);
     }
    }
    assert.equal(await page.locator('#modal.open').count(),1,'battle result hidden');
    await close();
   };
   const gates=await page.evaluate(()=>__qa.gates.map(g=>({...g})));
   assert.equal(gates.length,2,'expected bulkhead gates');
   if(mission===6){
    await visit('brief');await close();
    assert.deepEqual(await page.evaluate(()=>__qa.hazards.map(h=>({active:h.active,blocked:__qa.collisions(h.x+h.w/2,h.y+h.h/2)}))),Array(3).fill({active:true,blocked:true}));
    for(const [index,[label,choice]] of [['HAT A','YEŞİL'],['HAT B','MAVİ'],['HAT C','SARI']].entries()){
     await visit('repair',label);
     if(index===0){await choose('SARI');assert.match(await page.locator('#feedback').innerText(),/Hatalı bağlantı/);assert.equal(await page.evaluate(()=>__qa.hazards[0].active),true)}
     await choose(choice);await close();
     const fields=await page.evaluate(()=>__qa.hazards.map(h=>({active:h.active,blocked:__qa.collisions(h.x+h.w/2,h.y+h.h/2)})));
     assert.deepEqual(fields,Array.from({length:3},(_,i)=>({active:i>index,blocked:i>index})),'repair must open exactly its matching passage');
    }
    assert.equal(await page.evaluate(()=>__qa.phase),2);
    await visit('balance');await choose('6 V + 6 V');await close();
    await visit('exit');
   }
   if(mission===7){
    for(const label of ['GÜRÜLTÜ KAYDI','ANTEN KAYDI']){await visit('record',label);await close()}
    await visit('amplifier');await choose('120 Hz / 3 saniye');await close();
    await visit('defense');await close();const intact=await page.evaluate(()=>__qa.shield);await page.waitForTimeout(3700);
    assert.equal(await page.evaluate(()=>__qa.shield),intact,'Signal defense cannot take timer-only damage');
    await page.evaluate(()=>{const f=__qa.foes[0];f.x=510;f.y=308});await page.waitForFunction(()=>__qa.breaches===1,{timeout:2000});
    assert.equal(await page.evaluate(()=>__qa.shield),intact-3,'A real breach must damage the core');
    assert.equal(await page.evaluate(()=>__qa.foes[0].hp>0),true,'A breached threat returns rather than counting as killed');await battle(3);
    await visit('analysis');await choose('ANTEN SİNYALİ TEKRAR YAYIYOR');await close();
    await visit('exit');
   }
   if(mission===8){
    for(const label of ['TOZ İZİ','KAPANIŞ KAYDI','MAVİ YANKI']){await visit('clue',label);await close()}
    await visit('deduce');await choose('ÜÇ KAYIT BİRBİRİNİ DOĞRULUYOR');
    assert.match(await page.locator('#feedback').innerText(),/desteklenmiyor/);
    await choose('KAPANIŞ KAYDI EKSİK VEYA YANLIŞ');await close();
    await visit('exit');
   }
   if(mission===9){
    await visit('brief');await close();await visit('core');await close();
    await page.evaluate(()=>{__qa.shield=4;const f=__qa.foes[0];f.x=510;f.y=308});await page.locator('#retry').waitFor({timeout:2000});
    assert.equal(await page.evaluate(()=>__qa.phase),1,'Piko awakening loss retains the defense checkpoint');
    await page.locator('#retry').click();assert.equal(await page.evaluate(()=>__qa.round),1,'Retry restarts wave one');await battle(3);
    await visit('shield');await choose('KALKAN YENİDEN ŞARJ');await close();
    await visit('core');await close();await battle(5);
    await visit('analysis');await choose('GİZLİ ALT KAT');await close();await visit('exit');
   }
   if(mission===10){
    await visit('brief');await close();await visit('node1');await choose('323');await close();
    await visit('node2');await choose('İÇERİDEN');await close();
    await visit('lock');await page.locator('#open-pressure').click();
    assert.match(await page.locator('#feedback').innerText(),/Basınç farkı 4 kPa/,'unequal pressure must keep the door locked');
    await page.locator('#equalize').click();await page.locator('#equalize').click();
    assert.match(await page.locator('#panel').innerText(),/içi 6 kPa, dışı 6 kPa/);
    await page.locator('#open-pressure').click();await close();await visit('exit');
   }
   await page.locator('#done').click();
   await page.waitForFunction(m=>window.__completed?.mission===m,mission,{timeout:5000});
   assert.deepEqual(errors,[],'page errors mission '+mission);
   console.log('Mission '+mission+' FULL PLAYTHROUGH PASSED');
   await page.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(error=>{console.error(error);process.exitCode=1;server.close()});
