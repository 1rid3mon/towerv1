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
 sprites.preload(['scout','tank_boss']);
})(typeof window!=='undefined'?window:globalThis);
