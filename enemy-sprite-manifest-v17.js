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
   pivot:[0.5,0.5],facing:'down',scale:1.13
 });
 // Layer 4: first two complete enemy families. Every other identity keeps legacy art.
 const earlyVariantIds=['circuit','drone','shield','raider','amber','redrunner'];
 for(const id of earlyVariantIds){
   sprites.register({
     id,body:'assets/enemies/v17/'+id+'/body.webp',
     pivot:[0.5,0.5],facing:'down',scale:id==='amber'?1.20:1.34
   });
 }
 sprites.preload(['scout','circuit','drone','shield','raider','amber','redrunner','tank_boss']);
 // Non-invasive side-by-side comparison on mobile: append ?enemyArt=legacy.
 if(root.location && /(?:[?&])enemyArt=legacy(?:&|$)/.test(root.location.search||'')){
   sprites.setEnabled(false);
 }
})(typeof window!=='undefined'?window:globalThis);
