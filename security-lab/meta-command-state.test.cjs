const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
test('sector boss transitions distinguish defeated from ready without allowing another call',()=>{
 const source=fs.readFileSync(require.resolve('../meta-command.js'),'utf8');
 const fn=source.slice(source.indexOf('function sectorBossState('),source.indexOf('function btn('));
 const c={game:{wave:5,stats:{prestiges:0}},tacticOwner:()=> 'guest',sectorBossWaveKey:''};
 vm.createContext(c);vm.runInContext(fn,c);
 assert.equal(c.sectorBossState({bossWave:false},false),'waiting');
 assert.equal(c.sectorBossState({bossWave:true},false),'ready');
 c.sectorBossWaveKey=JSON.stringify(['guest',0,5]);
 assert.equal(c.sectorBossState({bossWave:true},true),'active');
 assert.equal(c.sectorBossState({bossWave:true},false),'cleared');
 c.game.wave=10;
 assert.equal(c.sectorBossState({bossWave:true},false),'ready');
});
