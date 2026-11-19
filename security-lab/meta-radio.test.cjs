const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../meta-model.js');
test('radio queues one card, defers busy scenes and spaces cards by two seconds',()=>{
 const q=M.createNoticeQueue({old:true});
 assert.equal(q.enqueue({id:'old'}),false);
 assert.equal(q.enqueue({id:'a'}),true);
 assert.equal(q.enqueue({id:'a'}),false);
 q.enqueue({id:'b'});
 assert.equal(q.tick(0,true),null);
 assert.equal(q.tick(100,false).id,'a');
 assert.equal(q.tick(6099).id,'a');
 assert.equal(q.tick(6100),null);
 assert.equal(q.tick(8099),null);
 assert.equal(q.tick(8100).id,'b');
 q.dismiss(8200);assert.equal(q.tick(8201),null);
 assert.equal(q.entries().length,2);
});
test('seen notice migration rejects invalid values and remains transaction-safe',()=>{
 const m=M.sanitizeMeta({seenNotices:{a:true,b:null,c:-1,d:NaN,constructor:true}});
 assert.deepEqual(m.seenNotices,{a:true});
 assert.deepEqual(M.sanitizeMeta(null).seenNotices,{});
 const result=M.transaction(m,'read:card','notice',d=>{d.seenNotices.card=true;return {ok:true};});
 assert.equal(result.ok,true);
});
test('story intro blocks automatic meta presentations before a mission starts',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../meta-runtime.js'),'utf8');
 const expression=source.match(/const allowed=\(\)=>(.*);/)[1];
 const doc={body:{dataset:{gameMode:'endless'}},getElementById:()=>({getAttribute:()=> 'false'})};
 assert.equal(vm.runInNewContext(expression,{document:doc,window:{}}),false);
 doc.getElementById=()=>({getAttribute:()=> 'true'});
 assert.equal(vm.runInNewContext(expression,{document:doc,window:{}}),true);
});
test('continuous daily milestone counter survives weekly reward cycles without changing payouts',()=>{
 const now=new Date(2026,10,1,12).getTime(),m=M.sanitizeMeta(null,now);
 for(let d=0;d<30;d++){const r=M.claimDaily(m,now+d*86400000);assert.equal(r.ok,true);assert.equal(m.streak.totalDays,d+1);assert.equal(m.streak.day,d%7+1);}
 const saved=M.sanitizeMeta(m,now+29*86400000);
 assert.equal(saved.streak.totalDays,30);
 assert.equal(M.claimDaily(saved,now+29*86400000).ok,false);
 assert.equal(M.claimDaily(saved,now+36*86400000).ok,true);
 assert.equal(saved.streak.totalDays,1);
});
test('radio notices obey build/date gates and cannot emerge after expiring in the queue',()=>{
 const notice={id:'scheduled',validFrom:100,validTo:200,minBuild:3};
 assert.equal(M.noticeEligible(notice,99,3),false);
 assert.equal(M.noticeEligible(notice,100,2),false);
 assert.equal(M.noticeEligible(notice,100,3),true);
 assert.equal(M.noticeEligible(notice,200,3),false);
 assert.equal(M.noticeEligible({...notice,validFrom:'broken'},150,3),false);
 assert.equal(M.noticeEligible({...notice,minBuild:NaN},150,3),false);
 const q=M.createNoticeQueue({},3);q.enqueue(notice,100);q.tick(150,true);
 assert.equal(q.tick(201),null);
 assert.equal(q.pending,0);
});
test('external routes unwind overlay and parent history before opening next panel',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),src=fs.readFileSync(require.resolve('../meta-ui.js'),'utf8');
 const fn=src.slice(src.indexOf('function closeForRoute('),src.indexOf('function closeOverlay()'));
 let pop;const events=[];
 const context={history:{state:{metaUI:'overlay'},go:depth=>events.push(['history',depth])},dialog:{open:true,close:()=>events.push('main closed')},overlay:{open:true,close:()=>events.push('overlay closed')},clearTimeout:()=>{},seasonPreviewTimer:0,suppressPop:0,window:{addEventListener:(name,callback)=>{assert.equal(name,'popstate');pop=callback;}}};
 vm.createContext(context);vm.runInContext(fn+';closeForRoute(()=>{});',context);
 assert.deepEqual(events,['overlay closed','main closed',['history',-2]]);
 assert.equal(context.suppressPop,1);assert.equal(typeof pop,'function');
});
