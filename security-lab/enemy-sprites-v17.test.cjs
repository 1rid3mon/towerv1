'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repoFile=(p)=>path.join(__dirname,'..',p);
const vm=require('node:vm');
const source=fs.readFileSync(repoFile('enemy-sprites-v17.js'),'utf8');
const art=[];
class FakeImage{
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 set src(src){this._src=src;art.push(this);}
 get src(){return this._src;}
}
const root={Image:FakeImage};root.window=root;
vm.runInNewContext(source,{window:root,globalThis:root});
const sprites=root.TowerEnemySpritesV17;
assert.equal(sprites.VARIANTS.length,21);
assert.equal(sprites.BOSSES.length,5);
assert.equal(sprites.getState().registered,0);
assert.equal(sprites.register({id:'invented',body:'assets/enemies/v17/invented/body.webp'}),false);
assert.equal(sprites.register({id:'scout',body:'https://example.com/a.webp'}),false);
assert.equal(sprites.register({id:'scout',body:'assets/enemies/v17/../secret.png'}),false);
assert.equal(sprites.register({id:'scout',body:'assets/enemies/v17/scout/body.webp',scale:2,pivot:[0.5,0.5]}),true);
const calls=[];const ctx={save(){calls.push('save')},restore(){calls.push('restore')},drawImage(){calls.push('draw')}};
const enemy={type:'green',variantId:'scout',radius:13,hp:10,maxHp:10,hitFlash:0};
assert.equal(sprites.render(ctx,enemy),false,'pending image must preserve legacy fallback');
assert.equal(art.length,1);
art[0].naturalWidth=128;art[0].naturalHeight=128;art[0].complete=true;art[0].onload();
assert.equal(sprites.render(ctx,enemy),true,'loaded image must draw');
assert.deepEqual(calls,['save','draw','restore']);
assert.equal(sprites.render(ctx,enemy),true,'cache should reuse image');
assert.equal(art.length,1);
sprites.setEnabled(false);
assert.equal(sprites.render(ctx,enemy),false,'disabled adapter must preserve legacy');
sprites.setEnabled(true);
assert.equal(sprites.register({id:'tank_boss',body:'assets/enemies/v17/tank_boss/body.webp',phases:['assets/enemies/v17/tank_boss/phase2.webp']}),true);
assert.equal(sprites.idFor({type:'boss',subType:'tank_boss'}),'tank_boss');
assert.equal(sprites.render(ctx,{type:'boss',subType:'tank_boss',radius:40,v12Combat:{phase:2}}),false);
assert.equal(art.length,3,'phase and default image begin loading');
art[1].onerror();
art[2].naturalWidth=128;art[2].naturalHeight=128;art[2].onload();
assert.equal(sprites.render(ctx,{type:'boss',subType:'tank_boss',radius:40,v12Combat:{phase:2}}),true,'phase error falls back to ready base sprite');
const render=fs.readFileSync(repoFile('render.js'),'utf8');
assert.match(render,/if \(!v17SpriteDrawn\) \{\s*drawCustomEnemy\(/);
assert.match(render,/TowerEnemySpritesV17\.render\(ctx, e, tx, ty\)/);
const index=fs.readFileSync(repoFile('index.html'),'utf8');
assert(index.indexOf('enemy-sprites-v17.js')>index.indexOf('enemy-visual-v4.js'));
const binaryAssets=['scout','tank_boss'];
for(const name of binaryAssets){
 const asset=fs.readFileSync(repoFile('assets/enemies/v17/'+name+'/body.webp'));
 assert.equal(asset.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(asset.subarray(8,12).toString('ascii'),'WEBP');
}
const manifest=fs.readFileSync(repoFile('enemy-sprite-manifest-v17.js'),'utf8');
assert.match(manifest,/sprites\\.register\\(/);
console.log('V17 sprite registry/loader/fallback and raster assets checks passed');
