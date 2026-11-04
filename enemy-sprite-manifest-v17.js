/* LOST SIGNAL V17 · first raster character prototypes.
 * Art-only opt-in. All unregistered enemies keep their original Canvas look.
 */
(function(root){'use strict';
 const sprites=root.TowerEnemySpritesV17;
 if(!sprites)return;
 sprites.register({
   id:'scout',body:'assets/enemies/v17/scout/body.webp',
   pivot:[0.5,0.5],facing:'down',scale:1.24
 });
 sprites.register({
   id:'tank_boss',body:'assets/enemies/v17/tank_boss/body.webp',
   pivot:[0.5,0.5],facing:'down',scale:1.13,phaseIntensity:[1.10,1.22]
 });
 // Layer 5: one 320x80 transparent atlas, four distinct boss silhouettes.
 // Each 80x80 frame is a complete raster body, not an overlay on legacy vectors.
 const bossVariants=[
   ['ranged_boss',0,1.24,[1.13,1.25]],
   ['speed_boss',1,1.35,[1.16,1.28]],
   ['frost_boss',2,1.34,[1.10,1.23]],
   ['leviathan',3,1.37,[1.14,1.29]]
 ];
 for(const [id,slot,scale,phaseIntensity] of bossVariants){
   sprites.register({
     id,body:'assets/enemies/v17/atlas/bosses.webp',
     frame:[slot*80,0,80,80],pivot:[0.5,0.5],
     facing:'down',scale,phaseIntensity
   });
 }
 // Layer 4: first two complete standard-enemy families.
 const earlyVariantIds=['circuit','drone','shield','raider','amber','redrunner'];
 for(const id of earlyVariantIds){
   sprites.register({
     id,body:'assets/enemies/v17/'+id+'/body.webp',
     pivot:[0.5,0.5],facing:'down',scale:id==='amber'?1.20:1.34
   });
 }
 // Layer 4: compact atlas for the remaining 14 normal identities.
 // A frame is an explicit [x, y, width, height] tile in a 7x2, 56px WebP atlas.
 const atlasIds=['ice','glacier','snowghost','scorpion','cactus','sand','violet',
                 'prism','void','nebula','pulse','bubble','butterfly','candy'];
 for(let i=0;i<atlasIds.length;i++){
   const id=atlasIds[i];
   sprites.register({
     id,body:'assets/enemies/v17/atlas/late-eras.webp',
     frame:[(i%7)*56,Math.floor(i/7)*56,56,56],
     pivot:[0.5,0.5],facing:'down',
     scale:id==='glacier'||id==='cactus'?1.4:1.28
   });
 }
 sprites.preload(['scout','circuit','drone','shield','raider','amber','redrunner',
                  ...atlasIds,'tank_boss',...bossVariants.map(([id])=>id)]);
 // Non-invasive side-by-side comparison on mobile: append ?enemyArt=legacy.
 if(root.location && /(?:[?&])enemyArt=legacy(?:&|$)/.test(root.location.search||'')){
   sprites.setEnabled(false);
 }
})(typeof window!=='undefined'?window:globalThis);
