const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../meta-model.js');
test('FX migration sanitizes corrupt settings and preserves explicit preferences',()=>{
 for(const raw of [null,-1,NaN,[],{intensity:NaN,reducedMotion:-1,vibration:NaN}]){
  const m=M.sanitizeMeta({fx:raw});
  assert.deepEqual(m.fx,{intensity:'auto',reducedMotion:false,vibration:true});
  assert.deepEqual(M.sanitizeMeta(m),m);
 }
 const m=M.sanitizeMeta({fx:{intensity:'low',reducedMotion:true,vibration:false}});
 assert.equal(m.fxInitialized,true);
 assert.deepEqual(m.fx,{intensity:'low',reducedMotion:true,vibration:false});
 const legacy=M.sanitizeMeta({});assert.equal(legacy.fxInitialized,false);
 assert.equal(M.sanitizeMeta(legacy).fxInitialized,false);
});
test('FX changes commit atomically without currency changes',()=>{
 const m=M.sanitizeMeta(null);const result=M.transaction(m,'fx:1','fxPreference',d=>{d.fx=M.sanitizeFx({...d.fx,intensity:'high'});d.fxInitialized=true;return {ok:true};});
 assert.equal(result.ok,true);assert.equal(result.state.fx.intensity,'high');assert.equal(m.fx.intensity,'auto');
 assert.deepEqual(result.state.currencies,m.currencies);
 assert.equal(M.transaction(m,'fx:2','fxPreference',d=>{d.fx.intensity='invalid';return {ok:true};}).ok,false);
});
test('applying matching account preferences does not reset automatic effect downgrade',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(require.resolve('../meta-runtime.js'),'utf8');
 const fn=src.slice(src.indexOf('function applyFxPreferences()'),src.indexOf('function action('));
 let count=0;let current={intensity:'auto',reducedMotion:false,vibration:true,effectiveIntensity:'low'};
 const saved={...current};const context={state:()=>({fx:saved}),window:{Fx:{settings:()=>current,configure:p=>{count++;current=p;}}}};
 vm.createContext(context);vm.runInContext(fn+';applyFxPreferences();',context);assert.equal(count,0);
 saved.vibration=false;vm.runInContext('applyFxPreferences();',context);assert.equal(count,1);
 vm.runInContext('applyFxPreferences();',context);assert.equal(count,1);
});
