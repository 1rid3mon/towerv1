const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8');
function runtime() {
  let check;
  const s = {game:{gold:0,crystals:20,souls:0,wave:1000,highestWave:1000,stats:{prestiges:0},upgrades:{},companions:{},equippedItems:[],inventory:[]},
    document:{body:{dataset:{gameMode:'endless'}}}, getStartWaveLevel:()=>1, ITEM_DATABASE:{},
    localStorage:{getItem:()=>null}, SIGNED_MARK_KEY:'test',setInterval:fn=>{check=fn;},showToast:()=>{}};
  s.window=s;
  vm.createContext(s);
  vm.runInContext(source.slice(0,source.indexOf('\n\n',source.indexOf('function creditGameplayCrystals'))),s);
  vm.runInContext(source.slice(source.indexOf('(function initAntiCheat() {')),s);
  s._syncShadow();
  return {s,check};
}
test('legitimate high-wave reward above 650 is preserved; an additional unregistered edit is rejected',()=>{
  const {s,check}=runtime();
  s.creditGameplayCrystals(755);check();assert.equal(s.game.crystals,775);
  s.game.crystals+=1;check();assert.equal(s.game.crystals,775);
});
test('multiple gameplay rewards in one guard interval are summed without a fixed cap',()=>{
  const {s,check}=runtime();
  s.creditGameplayCrystals(1200);s.creditGameplayCrystals(900);check();assert.equal(s.game.crystals,2120);
  assert.equal(s.creditGameplayCrystals(Infinity),false);
  assert.equal(s.creditGameplayCrystals(-1),false);
  s.game.crystals=NaN;check();assert.equal(s.game.crystals,2120);
});
test('all engine crystal credits use the gameplay ledger',()=>{
  assert.equal((source.match(/game\.crystals \+=/g)||[]).length,1);
});
