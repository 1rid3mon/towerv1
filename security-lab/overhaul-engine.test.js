const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
// Reuse the actual controller/engine fixture without executing its test declarations.
const source = fs.readFileSync(path.join(__dirname,'story-runtime-behavior.test.js'),'utf8');
const fixture = {require,__dirname,console,URL,URLSearchParams,fs,path,vm};
vm.runInNewContext(source.slice(source.indexOf('function runtime('),source.indexOf("test('"))+'\nthis.makeRuntime=runtime;',fixture);
function setup(evolution='kinetic') {
  const r = fixture.makeRuntime();
  r.storage.set('towerV1LostSignalHardV10',JSON.stringify({path:evolution,completed:[]}));
  for (const file of ['hard-v10.js','overhaul-v11.js','enemy-behaviors-v9.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),r.sandbox);
  return r;
}
test('all eight modular combinations stack with kinetic evolution through the real projectile engine',()=>{
  for(const weapon of ['pulse','focus'])for(const reactor of ['stable','surge'])for(const hull of ['armor','repair']) {
    const {run}=setup();
    run(`GameModeRuntime.leaveStory();game.highestWave=60;game.wave=30;isPaused=false;
      game.upgrades.critChance=0; game.upgrades.damage=40;
      TowerOverhaulV11.select('weapon','${weapon}');TowerOverhaulV11.select('reactor','${reactor}');TowerOverhaulV11.select('hull','${hull}');
      tower.x=tower.y=0;fireTowerProjectile(0,0,{x:100,y:0});`);
    const baseline=run('getTowerDamage()');
    assert.equal(run('projectiles[0].damage'),Math.round(Math.round(baseline*1.08)*(weapon==='pulse'?1.08:1.05)));
    assert.ok(Math.abs(run('Math.hypot(projectiles[0].vx,projectiles[0].vy)')-450*(weapon==='focus'?1.1:1))<1e-8);
    assert.equal(run('projectiles[0].fromTower'),true);
    assert.equal(run('projectiles[0].bouncesLeft'),1);
    assert.equal(run('TowerOverhaulV11.fireRate(100)'),reactor==='surge'?110.00000000000001:106);
    run('tower.hp=1000;tower.shield=0;game.upgrades.armor=0;damageTower(100,null)');
    assert.equal(run('tower.hp'),hull==='armor'?905:900);
  }
});
test('loaded evolution and module hooks leave real Story projectiles, incoming damage and wave rewards isolated',()=>{
  const {run}=setup('plasma');
  run('game.highestWave=100;game.upgrades.damage=40;game.upgrades.critChance=0;fireTowerProjectile(0,0,{x:100,y:0})');
  assert.equal(run('projectiles[0].damage'),run('getTowerDamage()'));
  assert.ok(Math.abs(run('Math.hypot(projectiles[0].vx,projectiles[0].vy)')-360)<1e-8);
  run('tower.hp=1000;tower.shield=0;game.upgrades.armor=0;damageTower(100,null)');
  assert.equal(run('tower.hp'),900);
  const gold=run('game.gold');run('game.waveKills=game.waveTargetKills;completeWave()');
  assert.equal(run('game.gold'),gold);
  assert.equal(run('GameModeRuntime.storySession.phase'),'stabilize');
});
test('V10 and V11 repair hooks stack only at a real Endless wave completion',()=>{
  const {run}=setup('bastion');
  run("GameModeRuntime.leaveStory();game.highestWave=60;game.wave=26;TowerOverhaulV11.select('hull','repair');tower.maxHp=100;tower.hp=30;tower.maxShield=40;tower.shield=0;completeWave()");
  // 3 bastion + 1 hull + the existing 15% wave recovery.
  assert.equal(run('tower.hp'),49);
  assert.equal(run('tower.shield'),1);
  assert.equal(run('game.wave'),27);
});
