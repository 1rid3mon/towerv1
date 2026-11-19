const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const art=require('../data/station-art.js');

test('every real workshop upgrade and weapon has a complete filled illustration',()=>{
    const data=fs.readFileSync(require.resolve('../data.js'),'utf8');
    const defs=data.slice(data.indexOf('const UPGRADE_DEFS = {'),data.indexOf('const COMPANION_DEFS'));
    const upgrades=[...defs.matchAll(/^    (\w+): \{ category:/gm)].map(x=>x[1]);
    assert.equal(upgrades.length,18);
    const wanted=[...upgrades,...Array.from({length:16},(_,i)=>'weapon_'+i),'part','crystal','credits','crate','ark','slow','shield','emp','overload','signal'];
    for(const key of wanted){
        assert.ok(art.keys.includes(key),key+' is supported');
        const svg=art.svg(key);
        assert.match(svg,/viewBox="0 0 96 96"/);
        assert.ok((svg.match(/<path /g)||[]).length>=2,key+' has solid body geometry');
        assert.match(svg,/<linearGradient/);
        assert.doesNotMatch(svg,/<filter|<image|<script/); // No asset/filter dependencies.
    }
});

test('sixteen weapons retain sixteen individual silhouettes after removing gradient IDs',()=>{
    const bodies=Array.from({length:16},(_,i)=>art.svg('weapon_'+i).replace(/lsa\d+/g,'art').replace(/data-station-art="[^"]+"/g,''));
    assert.equal(new Set(bodies).size,16);
    for(const svg of bodies)assert.ok(svg.includes('<path'),'weapon body exists');
});

test('SVG gradient IDs never collide when icons are repeated in one page',()=>{
    const seen=new Set();
    for(let i=0;i<120;i++){
        const svg=art.svg(art.keys[i%art.keys.length]);
        const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
        for(const id of ids){assert.equal(seen.has(id),false);seen.add(id);}
        for(const ref of svg.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(ref[1]));
    }
});

test('rarity accents accept hex colors and reject injected markup',()=>{
    assert.ok(art.svg('weapon_15',{color:'#ABC123'}).includes('#ABC123'));
    const svg=art.svg('part',{color:'"><script>alert(1)</script>'});
    assert.doesNotMatch(svg,/<script|alert\(1\)/);
    assert.match(art.svg('unknown'),/data-station-art="crate"/);
});
