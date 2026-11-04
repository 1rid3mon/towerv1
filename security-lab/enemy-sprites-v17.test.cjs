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
assert.match(render,/TowerEnemySpritesV17\.render\(ctx, e, tx, ty, nowCompTime\)/);
const index=fs.readFileSync(repoFile('index.html'),'utf8');
assert(index.indexOf('enemy-sprites-v17.js')>index.indexOf('enemy-visual-v4.js'));
const binaryAssets=['scout','tank_boss'];
for(const name of binaryAssets){
 const asset=fs.readFileSync(repoFile('assets/enemies/v17/'+name+'/body.webp'));
 assert.equal(asset.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(asset.subarray(8,12).toString('ascii'),'WEBP');
}
const manifest=fs.readFileSync(repoFile('enemy-sprite-manifest-v17.js'),'utf8');
assert.match(manifest,/sprites\.register\(/);
const activeArt=['scout','circuit','drone','shield','raider','amber','redrunner','tank_boss'];
for(const id of activeArt){
 const asset=fs.readFileSync(repoFile('assets/enemies/v17/'+id+'/body.webp'));
 assert.equal(asset.subarray(0,4).toString('ascii'),'RIFF',id+' RIFF signature');
 assert.equal(asset.subarray(8,12).toString('ascii'),'WEBP',id+' WEBP signature');
 assert.equal(asset.readUInt32LE(4)+8,asset.length,id+' exact RIFF byte length');
 assert(asset.length>100,id+' nonempty compressed art');
 assert.match(manifest,new RegExp(id==='tank_boss'?id:id));
}
assert.equal(activeArt.length,8);
const atlasBytes=fs.readFileSync(repoFile('assets/enemies/v17/atlas/late-eras.webp'));
assert.equal(atlasBytes.subarray(0,4).toString('ascii'),'RIFF');
assert.equal(atlasBytes.subarray(8,12).toString('ascii'),'WEBP');
assert.equal(atlasBytes.readUInt32LE(4)+8,atlasBytes.length,'atlas RIFF size');
vm.runInNewContext(manifest,{window:root,globalThis:root});
assert.equal(sprites.getState().registered,26,'21 normal variants and all 5 boss sprites');
const atlasImages=art.filter(img=>img.src==='assets/enemies/v17/atlas/late-eras.webp');
assert.equal(atlasImages.length,1,'all 14 late variants share one cached image');
atlasImages[0].naturalWidth=392;atlasImages[0].naturalHeight=112;atlasImages[0].complete=true;atlasImages[0].onload();
const drawArity=[];
const tileCtx={save(){},restore(){},drawImage(...args){drawArity.push(args.length)}};
assert.equal(sprites.render(tileCtx,{type:'frost',variantId:'ice',radius:13,hitFlash:0}),true);
assert.equal(sprites.render(tileCtx,{type:'tank',variantId:'candy',radius:20,hitFlash:0}),true);
assert.deepEqual(drawArity,[9,9],'atlas frame must use 9-argument source crop, not full atlas');

const bossAtlasBytes=fs.readFileSync(repoFile('assets/enemies/v17/atlas/bosses.webp'));
assert.equal(bossAtlasBytes.subarray(0,4).toString('ascii'),'RIFF');
assert.equal(bossAtlasBytes.subarray(8,12).toString('ascii'),'WEBP');
assert.equal(bossAtlasBytes.readUInt32LE(4)+8,bossAtlasBytes.length,'boss atlas RIFF integrity');
assert.equal(bossAtlasBytes.toString('ascii',12,16),'VP8X','boss atlas extended WebP');
const atlasWidth=1+bossAtlasBytes.readUIntLE(24,3);
const atlasHeight=1+bossAtlasBytes.readUIntLE(27,3);
assert.equal(atlasWidth,320,'four boss tiles are 80px wide');
assert.equal(atlasHeight,80);
const ids=['ranged_boss','speed_boss','frost_boss','leviathan'];
const bossImgs=art.filter(img=>img.src==='assets/enemies/v17/atlas/bosses.webp');
assert.equal(bossImgs.length,1,'all four boss identities share a single atlas cache entry');
bossImgs[0].naturalWidth=320;bossImgs[0].naturalHeight=80;
bossImgs[0].complete=true;bossImgs[0].onload();
const bossCalls=[];
const bossCtx={filter:'none',save(){},restore(){},drawImage(...args){bossCalls.push({args,filter:this.filter});}};
ids.forEach((id,slot)=>{
 assert.equal(sprites.render(bossCtx,{type:'boss',subType:id,radius:30,hitFlash:0,v12Combat:{phase:2}}),true,id+' phase 2 draws');
 assert.equal(bossCalls[slot].args.length,9,'boss atlas must use source crop');
 assert.equal(bossCalls[slot].args[1],slot*80,'correct atlas tile');
 assert.match(bossCalls[slot].filter,/^brightness\(1\./,'phase intensity visual treatment applied');
});
assert.equal(sprites.render(bossCtx,{type:'boss',subType:'leviathan',radius:32,hitFlash:0,v12Combat:{phase:3}}),true,'phase 3 draws');
assert.equal(sprites.idFor({type:'tank',subType:'tank',isElite:true}),'shield','elite tank uses armored sprite');
assert.equal(sprites.idFor({type:'runner',subType:'runner',isElite:true}),'redrunner');
assert.equal(sprites.idFor({type:'unknown',isElite:true}),null,'unknown elite keeps legacy fallback');
const visualCtx={filter:'none',save(){},restore(){},drawImage(){}};
assert.equal(sprites.render(visualCtx,{type:'boss',subType:'leviathan',radius:32,
  hp:25,maxHp:100,hitFlash:0,v12Combat:{phase:3}}),true);
assert.match(visualCtx.filter,/contrast\(1\.15\)/,'low HP changes materials, not combat stats');
console.log('V17 sprite registry/loader/fallback and raster assets checks passed');
