const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const script = fs.readFileSync(require.resolve('../endless-operations.js'), 'utf8');
function setup(storage = new Map(), now = 86400000 * 100) {
    const sandbox = { Date: { now: () => now }, currentUser: {uid:'alpha'},
        document: {body:{dataset:{}}, readyState:'loading', addEventListener() {}},
        localStorage: {getItem:k=>storage.get(k), setItem:(k,v)=>storage.set(k,v)} };
    sandbox.window = sandbox;
    vm.runInNewContext(script, sandbox);
    return { sandbox, storage, ops:sandbox.EndlessOperations };
}
const key = 'towerEndlessOperationsV1:alpha';
test('sector rewards grant equipment once per sector and stay scoped to the owner', () => {
    const {sandbox,storage,ops}=setup();
    ops.record(10);ops.record(10);ops.record(20);
    const state=JSON.parse(storage.get(key));
    assert.deepEqual(state.owned,{'0':1,'1':1});
    assert.equal(state.career.sectors,2);
    sandbox.currentUser.uid='beta';ops.record(1);
    assert.equal(JSON.parse(storage.get('towerEndlessOperationsV1:beta')).cleared,0);
});
test('offline gains cap at twelve hours, and story cannot earn rewards or gain equipment bonuses', () => {
    const {storage,ops}=setup();
    ops.record(10);
    const state=JSON.parse(storage.get(key));state.equipped[0]=0;storage.set(key,JSON.stringify(state));
    const resumed=setup(storage,86400000*103);
    assert.equal(resumed.ops.bonus('damage'),.025);
    assert.equal(JSON.parse(storage.get(key)).offline,12);
    const saved=storage.get(key);
    resumed.sandbox.document.body.dataset.gameMode='story';
    assert.equal(resumed.ops.bonus('damage'),0);
    resumed.ops.record(20);
    assert.equal(storage.get(key),saved);
});

test('daily boss patterns rotate and finish only once', () => {
    const sandbox = {};
    vm.runInNewContext(fs.readFileSync(require.resolve('../endless-boss-rush.js'),'utf8'),sandbox);
    const rush = sandbox.EndlessBossRush;
    assert.notEqual(rush.challenge(0).item,rush.challenge(1).item);
    const start = {day:0,step:0,hp:2,result:''};
    const win = rush.challenge(0).pattern.reduce((fight,action)=>rush.turn(fight,action),start);
    assert.equal(win.result,'won');
    assert.equal(rush.turn(win,'strike'),win);
    const miss = rush.turn(start,'strike');
    assert.equal(rush.turn(miss,'guard').result,'lost');
});
