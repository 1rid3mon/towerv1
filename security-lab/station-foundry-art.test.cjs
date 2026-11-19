const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = name => fs.readFileSync(require.resolve('../' + name), 'utf8');
function surface() {
    const calls = [];
    const c = new Proxy({}, {get: (_,name) => (...args) => calls.push({name,args}),set:()=>true});
    return {c,calls};
}
function scene() {
    const root = {EndlessSectors:{describe:()=>({boss:'tank_boss'})}};
    vm.runInNewContext(read('endless-sector-scenery.js'), {window:root,Math,Object});
    return root.EndlessSectorScenery;
}
test('station architecture is deterministic, bounded and restores the canvas at all target sizes', () => {
    const api = scene();
    for (const [w,h] of [[844,390],[740,360],[1180,820]]) {
        const a=surface(),b=surface();
        for (const {c} of [a,b]) {api.foundry(c,w,h,w/2,h/2);api.draw(c,w,h,460,'cengiz');}
        assert.deepEqual(a.calls,b.calls,'no frame/random-dependent scenery');
        assert.equal(a.calls.filter(x=>x.name==='save').length,a.calls.filter(x=>x.name==='restore').length);
        assert.ok(a.calls.length<3500,'bounded architecture work');
        for(const call of a.calls)for(const n of call.args)if(typeof n==='number')assert.ok(Number.isFinite(n));
        assert.ok(a.calls.some(x=>x.name==='arc'&&x.args[2]===53),'recessed central socket is always visible');
    }
});
test('cengiz replaces old prop and bullseye loop with a stable foundry while retaining other themes', () => {
    const source=read('render.js');
    const branch=source.slice(source.indexOf("} else if (theme === 'cengiz')"),source.indexOf("} else if (theme === 'snow')"));
    assert.match(branch,/EndlessSectorScenery\?\.foundry/);
    assert.doesNotMatch(branch,/swordPositions|env\.embers|ctx\.rotate|game\.\w+\s*=/);
    assert.match(source,/theme === 'snow'/);
    assert.match(source,/for \(const r of rings\)/);
    assert.match(source,/drawCustomTowerSkin\(ctx, skinId, tower.angle, tower.recoil, barrelCount, nowCompTime\)/);
});
