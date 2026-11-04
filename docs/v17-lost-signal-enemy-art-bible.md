# V17 · LOST SIGNAL — Enemy Art Bible (Layer 1)

Status: Art audit and visual rules defined. **No enemy sprite assets have been shipped yet.**

## Existing rendering audit
- `render.js`: `drawCustomEnemy` draws the base body for each combat archetype.
- `enemy-visual-v4.js`: adds silhouette overlays for 21 variant IDs.
- `lost-signal-art.js`: adds material scratches, damage details, elite and boss accents.
- These three independent passes can compete for silhouette clarity. V17 will replace the **body + variant silhouette** with one sprite when available; it must **not** layer the old silhouette over a new sprite.
- Retain health bars, boss phase tells, combat telegraphs, projectiles, and hit feedback. These are gameplay signals, not decorative body details.
- No game balance, enemy names, spawning, save keys, or story progress may change.

## Canonical enemy inventory (from `TowerEnemyDiversity.VARIANTS`)

| Era | Variants | Shape identity | Palette inherited from code |
| --- | --- | --- | --- |
| Core / Aurora | scout, circuit, drone | antenna, spikes, orbit | emerald, teal, sky |
| Khan | shield, raider, amber, redrunner | shield, blades, orbit | orange, red, amber, rose |
| Snow | ice, glacier, snowghost | crystal, crystal, orbit | icy cyan, blue, pale blue |
| Desert | scorpion, cactus, sand | tail, spikes, antenna | ochre, green, sand |
| Nebula | violet, prism, void, nebula, pulse | orbit, crystal, blades, shield, orbit | violet, lavender, purple, indigo, pink |
| Dream | bubble, butterfly, candy | orbit, wings, crystal | pastel pink, blue, magenta |

Bosses use separate `subType` logic in `drawCustomEnemy`; enumerate their actual subtypes and boss phases before producing boss sprite sheets. Do not invent or rename enemies.

## LOST SIGNAL art contract
1. **Readable at actual size.** Silhouette must distinguish runner, tank, ranged, teleporter and boss before small interior details.
2. **Mechanical, worn, ominous.** Dark graphite/ceramic hulls, restrained metal highlights, occasional exposed joints, luminous signal cores. Existing era accents remain recognizable.
3. **Lighting hierarchy.** One primary emissive core or sensor, at most two secondary highlights. Avoid full-body glow, bright contour tracing and noisy particle halos.
4. **Top-down 2D.** Consistent perspective, fixed nominal facing direction and pivot; no random 3D perspective or mismatched isometric renders.
5. **Transparent assets.** Export lossless alpha PNG master, optimized WebP where browser compatibility allows; trim transparent padding and record anchors. No baked-in shadows extending outside bounds without metadata.
6. **Animation as layers.** Base hull, emissive core, optional moving appendage, hit/damage state. Gameplay telegraphs must remain independent and legible.
7. **Boss scale.** A boss should have its own silhouette and phase/damage layers, not merely an enlarged regular enemy.
8. **No decorative stacking.** Once sprite drawing succeeds, skip both the old body painter and additive variant painter. On failed load, preserve the complete legacy fallback.
9. **Mobile first.** Check native small-size visibility, 1x/2x display density, sprite atlas memory, asset load errors, reduced motion and iPad orientation.
10. **Consistency gate.** Review one standard enemy + one boss in a controlled A/B scene before mass production.

## Sprite manifest contract (Layer 2)
```json
{
  "id": "scout",
  "facing": "up",
  "pivot": [0.5, 0.5],
  "body": "assets/enemies/v17/scout/body.webp",
  "hit": "assets/enemies/v17/scout/hit.webp",
  "bounds": [0, 0, 128, 128],
  "revision": 1
}
```
The manifest above is a **proposed format**, not a reference to existing files.

## Exit criteria for Layer 1
- [x] Inventory all 21 variant IDs, eras and legacy render passes.
- [x] Lock silhouette, materials, palette and readability constraints.
- [x] Define single-source sprite / legacy fallback rule.
- [ ] Enumerate all boss subtypes and existing phase art before boss production.
- [ ] Capture in-game old-render reference screenshots for a representative standard enemy and boss.
- [ ] Approve a first sprite prototype against actual in-game scale.

Next: Layer 2 — loader/manifest and explicit no-double-draw fallback, on this branch only.
