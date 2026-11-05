'use strict';
// End-to-end mission logic in real Chromium. QA observability is injected by this
// local-only test server; gameplay files in GitHub never expose teleport APIs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const instruments='window.__qa={p,stations:typeof nodes==="undefined"?stations:nodes,foes:typeof foes==="undefined"?enemies:foes,interact,phase:()=>phase,gates:typeof gates==="undefined"?[]:gates,collision:typeof collision==="undefined"?()=>false:collision};';
const server=http.createServer((req,res)=>{
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
   const close=async()=>{if(await page.locator('#ok').count())await page.locator('#ok').click();else if(await page.locator('#cancel').count())await page.locator('#cancel').click();else if(await page.locator('#leave').count())await page.locator('#leave').click();else throw Error('No close button in mission '+mission)};
   const defeat=async()=>{
    const list=await page.evaluate(()=>window.__qa.foes.map(z=>({x:z.x,y:z.y,hp:z.hp})));
    for(let k=0;k<list.length;k++){
     for(let j=0;j<list[k].hp;j++){
      const pt=await page.evaluate(k=>{const q=window.__qa,foe=q.foes[k];q.p.x=foe.x;q.p.y=foe.y;const w=innerWidth,h=innerHeight,one=document.querySelector('#world')?false:true;const sc=Math.min(w/(one?650:740),h/(one?380:450),one?1.5:1.55),mapWidth=one?1000:1080,mapHeight=one?500:570;const ox=Math.max(0,Math.min(mapWidth-w/sc,q.p.x-w/sc/2)),oy=Math.max(0,Math.min(mapHeight-h/sc,q.p.y-h/sc/2));return{x:(foe.x-ox)*sc,y:(foe.y-oy)*sc}},k);
      await page.mouse.click(pt.x,pt.y);
     }
    }
    assert.equal(await page.locator('#modal.open').count(),1,'combat success modal');
    await close();
   };
   if(mission===1){
    await station('console');
    for(const i of [0,1,2])await page.locator('#fuse button[data-i="'+i+'"]').click();
    await close();await station('door');await close();await station('defense');await close();
    await defeat();await station('defense');
   }else if(mission===2){
    await station('exit');await close();await defeat();
    for(const clue of ['TARAMA A','TARAMA B','TARAMA C']){await named(clue);await close()}
    await station('exit');
    await page.locator('#deduction button').filter({hasText:'Anten 02:03'}).click();
    assert.match(await page.locator('#deduction-feedback').innerText(),/çelişki değil/);
    await page.locator('#deduction button').filter({hasText:'Yankı, ilk sinyalden önce'}).click();
   }else if(mission===3){
    assert.equal(await page.evaluate(()=>{const q=__qa,g=q.gates[0];return q.collision(g.x+g.w/2,g.y+g.h/2)}),true,'first antenna gate must be closed');
    await station('anten');await close();
    assert.equal(await page.evaluate(()=>{const q=__qa,g=q.gates[0];return q.collision(g.x+g.w/2,g.y+g.h/2)}),false,'first antenna gate opens');
    await station('relay');await close();await station('filter');
    for(const i of [2,4,1])await page.locator('#tones button').filter({hasText:'KANAL '+i}).click();
    await close();await station('terminal');await close();await station('exit');
   }else if(mission===4){
    await station('reactor');await close();await station('power');
    await page.getByText('KALKANI GÜÇLENDİR',{exact:true}).click();await close();await station('exit');
   }else{
    await station('security');await close();await station('turret');await close();await defeat();
    await station('turret');await close();await station('relay');
    for(const txt of ['GÜVENLİK','ENERJİ','ANTEN'])await page.locator('#order button').filter({hasText:txt}).click();
    await close();await station('exit');
   }
   await page.locator(mission===1?'#complete':'#done').click();
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
