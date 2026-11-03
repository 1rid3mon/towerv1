/* LOST SIGNAL V9: low-impact, deterministic behavior variety for visual variants. */
(function(root){'use strict';
 const FAST=new Set(['scout','raider','redrunner','scorpion','void','butterfly']);
 const BRACE=new Set(['shield','glacier','cactus','nebula','candy']);
 // Only changes movement for selected normal enemies. Never touches bosses, damage or HP.
 function movementMultiplier(enemy,elapsed){
  if(!enemy||enemy.type==='boss'||enemy.isBoss||enemy.isElite)return 1;
  const id=enemy.variantId;
  if(!FAST.has(id)&&!BRACE.has(id))return 1;
  const time=Number(enemy.animPhase)||0; // existing per-enemy animation clock
  const cycle=((time/5)%6+6)%6;
  if(FAST.has(id))return cycle<0.9?1.22:1;
  // Brief guard posture: 12% slower for 1.2s every six seconds.
  return cycle<1.2?0.88:1;
 }
 root.LostSignalEnemyBehaviorsV9=Object.freeze({movementMultiplier});
})(window);
