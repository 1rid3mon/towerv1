const test = require('node:test');
const assert = require('node:assert/strict');
const {describe} = require('../endless-sectors.js');
test('legacy waves map to sector boundaries and retain increasing sector numbers', () => {
    assert.deepEqual([1,5,10,11,50,51].map(w => [describe(w).sector,describe(w).stage]), [[1,1],[1,5],[1,10],[2,1],[5,10],[6,1]]);
    assert.equal(describe(10).bossWave,true);
    assert.equal(describe(11).remaining,4);
    assert.equal(describe(51).name,describe(1).name);
});
test('sector boss identity survives reload and does not depend on randomness', () => {
    assert.equal(describe(5).boss, describe(10).boss);
    assert.equal(describe(5).boss,'tank_boss');
    assert.equal(describe(20).boss,'ranged_boss');
});

test('each sector has a distinct edge silhouette within portrait, landscape and tablet boards', () => {
    require('../endless-sector-scenery.js');
    for (const [width,height] of [[390,700],[844,320],[1032,780]]) {
        const variants = new Set();
        for (const wave of [1,11,21,31,41]) {
            const points = [];
            const mark = (...point) => points.push(point);
            const ctx = {save(){},restore(){},beginPath(){},closePath(){},fill(){},stroke(){},moveTo:mark,lineTo:mark};
            globalThis.EndlessSectorScenery.draw(ctx,width,height,wave);
            assert.ok(points.length);
            for (const [x,y] of points) {
                assert.ok(x>=0 && y>=0 && x<=width && y<=height);
                assert.notEqual(x,width/2);
            }
            variants.add(JSON.stringify(points));
        }
        assert.equal(variants.size,5);
    }
});
