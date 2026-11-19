const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../data.js'),'utf8').split('(function initClickInspector()')[0];
const ui=fs.readFileSync(path.join(__dirname,'../ui.js'),'utf8');
function runtime(){
 const ctx=vm.createContext({window:{EndlessOperations:{bonus:()=>.13},_syncShadow(){}},document:{body:{dataset:{gameMode:'endless'}}},tower:{hp:100,maxHp:100,shield:0},refreshUpgradeButtonsState(){},updateHUD(){},saveGame(){}});
 vm.runInContext(source+'\n'+ui.slice(ui.indexOf('function buyUpgrade(key)'),ui.indexOf('function refreshUpgradeButtonsState()')),ctx);
 return code=>vm.runInContext(code,ctx);
}
test('all 18 forecasts match the actual purchased stat and debit at x1, x10 and MAX',()=>{
 const run=runtime();
 for(const key of run('Object.keys(UPGRADE_DEFS)'))for(const multiplier of [1,10,'MAX'])for(const level of [0,9,24,399]){
  run(`game=getDefaultState();game.wave=452;game.highestWave=452;game.gold=1000000;game.souls=2;game.prestigeUpgrades.permDamage=3;game.prestigeUpgrades.permGold=2;game.equippedItems=['rare_radar_lens','rare_small_gem','srare_titanium_plate'];buyMultiplier=${JSON.stringify(multiplier)};game.upgrades[${JSON.stringify(key)}]=Math.min(UPGRADE_DEFS[${JSON.stringify(key)}].maxLevel,${level});`);
  const result=run(`(()=>{const key=${JSON.stringify(key)},def=UPGRADE_DEFS[key],before=JSON.stringify(game),offer=getBulkUpgradeInfo(key),target=Math.min(def.maxLevel,game.upgrades[key]+Math.max(1,offer.count||1)),forecast=def.getValueText(target),pure=before===JSON.stringify(game),gold=game.gold,lvl=game.upgrades[key];buyUpgrade(key);return {pure,forecast,actual:def.getValueText(game.upgrades[key]),delta:gold-game.gold,levels:game.upgrades[key]-lvl,cost:offer.totalCost,count:offer.count,canBuy:!!offer.canAfford&&!offer.maxed&&!offer.lockedReason};})()`);
  assert.equal(result.pure,true,key+' preview never writes to save');
  if(result.canBuy){assert.equal(result.actual,result.forecast,key+' '+multiplier+' forecast');assert.equal(result.delta,result.cost,key+' exact debit');assert.equal(result.levels,result.count,key+' bulk count');}
  else {assert.equal(result.delta,0);assert.equal(result.levels,0);}
 }
});
test('forecasting leaves story isolation and capped levels intact',()=>{
 const run=runtime();
 run("document.body.dataset.gameMode='story';game.upgrades.multishot=1;game.equippedItems=['legendary_infinity_bow'];game.prestigeUpgrades.permGold=20;");
 assert.equal(run('getEffectiveMultishot(3)'),4);
 assert.equal(run('game.upgrades.multishot'),1);
 assert.equal(run('getGoldMultiplier(200)'),1);
 assert.equal(run('getTowerRange(400)'),run('getTowerRange(40)'));
 assert.equal(run('getTowerFireRate(400)'),run('getTowerFireRate(50)'));
});
