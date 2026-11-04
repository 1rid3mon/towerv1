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

## Confirmed boss inventory (engine.js / render.js)

| subType | Existing name | radius | Combat silhouette / telegraph | Existing palette |
| --- | --- | ---: | --- | --- |
| tank_boss | Zırhlı Titan Behemoth | 40 | Heavy armor, close-range wind-up warning ring | amber / pale yellow |
| ranged_boss | Hiperiyon Topçusu | 30 | Long-range triple-shot battery | pink / pale pink |
| speed_boss | Kızıl Fırtına Vektörü | 24 | Compact high-speed dash attacker | red / pale red |
| frost_boss | Kutup Hükümdarı Kryos | 33 | Frost projectile and slow/freeze telegraph | sky / ice |
| leviathan | Kozmik Leviathan | 32 | Cosmic multi-projectile threat | inherited boss palette |

The renderer also has a generic `boss` fallback drawing case. Boss combat phases are displayed as `BOSS / FAZ 2` and `BOSS / FAZ 3` when `v12Combat.phase > 1`. New artwork must not obscure these phase cues or tank wind-up warning. The five named boss subtypes are chosen from the actual `bossPool`, not an invented roster.

## Reproducible baseline capture (before Layer 2 integration)

The repository does not include verified screenshots of representative old enemies. **No screenshots are claimed to have been captured.** Record side-by-side baseline images in a browser at identical canvas dimensions, device pixel ratio and zoom, with reduced motion off/on:

1. Standard enemy: `scout` (`green` archetype), first-wave core theme, idle and hit flash, at native in-game size.
2. Boss: `tank_boss`, native radius 40, normal phase and attack wind-up ring.
3. Optional: `ranged_boss` with ranged attack telegraph to verify phase labels and projectile visibility.
4. Save screenshots and a small metadata note (browser, viewport, DPR, zoom, branch SHA) as reference artifacts before judging prototype fidelity. Do not confuse illustrative concept art with actual gameplay screenshots.

Baseline comparison is a **Layer 2 acceptance prerequisite**; art inventory and code audit can be complete without pretending browser screenshots exist.

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
- [x] Enumerate five actual boss subtypes, names, palettes, sizes and existing combat/phase telegraphs.
- [x] Specify reproducible baseline capture cases for a standard enemy and boss; actual captures are still outstanding.
- [x] Define prototype acceptance criteria; first sprite artwork and visual approval belong to Layer 2/3.

**Layer 1 design audit complete.** Layer 2 may start on this branch. Capture the actual baseline screenshots before approving new sprite artwork. Next: loader/manifest and explicit no-double-draw fallback.


## Layer 2 implementation status
- `enemy-sprites-v17.js`: 21 variant IDs and 5 confirmed bosses in registry; `register` validates local PNG/WebP asset paths and optional boss phase/hit images.
- `Image` loader uses a bounded 64-path cache. An absent/loading/failed image returns `false` so legacy rendering remains visible. A ready phase image is preferred, then the ready body image.
- `render.js`: calls `TowerEnemySpritesV17.render(ctx,e)` and skips **both** legacy body and legacy variant/detail passes only after successful sprite drawing. Health bars, boss phase labels, telegraphs, hit feedback and gameplay are untouched.
- `index.html`: includes the adapter after the existing art files. No assets registered yet, so every enemy intentionally uses legacy art in this stage.
- `security-lab/enemy-sprites-v17.test.cjs`: Node regression cases for invalid paths, loading state, cache, ready sprite, boss phase fallback, opt-out and render integration; added to GitHub Actions.
- **No gameplay image baseline screenshots or actual sprite assets yet.** Both are art acceptance work for Layer 3, not evidence of finished image designs.
- **CI result pending** until GitHub Actions reports a completed run for the latest branch head.


## Layer 3 · first two raster game assets (prototype, not full production art)
- `assets/enemies/v17/scout/body.webp`: 96×96 transparent WebP, cyan mechanical scout silhouette, registered as the `scout` variant with `facing: 'down'` and `scale: 1.24`.
- `assets/enemies/v17/tank_boss/body.webp`: 144×144 transparent WebP, armoured amber/red Titan, registered as `tank_boss` with `facing: 'down'` and `scale: 1.13`.
- Both visuals were extracted and alpha-cleaned from a newly generated LOST SIGNAL concept board; they are practical **first-pass prototypes**, not final sprite sheets or full animation sets.
- Manifest: `enemy-sprite-manifest-v17.js` opts these two into the new loader and preloads their body sprites. All other variants and bosses retain existing legacy Canvas drawing.
- The renderer rotates these pre-rendered assets toward the current tower target, supplies a restrained hit flash and continues to draw health bars, attack telegraphs and boss phase cues as before.
- To compare on a preview deployment, append `?enemyArt=legacy` to disable prototype sprites **for that page session**. This does not touch save keys or gameplay logic.
- No final iPad/device benchmark or browser screenshot has been validated yet. The previous CI baseline had failures; this iteration deliberately remains **draft-only** until review and test verification. Do not merge solely on the existence of these assets.

Layer 3 passes the **first sprite preparation and wiring** checkpoint, but the visual acceptance checkpoint remains open until an in-game screenshot compares the two at true scale.


## Layer 4 · normal enemy raster migration (prototype implementation)
- **21 / 21 normal enemy variants have sprite art registered** in `enemy-sprite-manifest-v17.js`. No new enemy types were invented.
- Core/Aurora: `scout`, `circuit`, `drone` use individual WebP body sprites.
- Khan: `shield`, `raider`, `amber`, `redrunner` use individual WebP body sprites.
- Snow / Desert / Nebula / Dream: 14 IDs share `assets/enemies/v17/atlas/late-eras.webp` using validated 56×56 atlas-frame crops in 7 columns by 2 rows.
- The registry now stores optional `frame: [sourceX,sourceY,sourceWidth,sourceHeight]`. Source frame bounds are checked against the loaded image; failures fall back to the entire legacy drawing stack.
- A single atlas path is cached once even when 14 separate normal identities are drawn, reducing image requests and memory.
- **Boss status:** `tank_boss` has first-pass raster art. `ranged_boss`, `speed_boss`, `frost_boss`, `leviathan` retain legacy rendering (Layer 5).
- These are concept-derived **raster prototype assets**, not final animation sets. The four later themes have silhouettes and palettes aligned with existing variants; close detail/retouch and real iPad-scale visual comparison are still required.
- No combat stats, AI behavior, wave spawning, story or save keys were changed.
- V17 remains on draft PR #90; all deployment and merge decisions remain gated by review, browser/mobile validation and CI checks.

### Layer 4 verification tasks
- [x] Register all 21 existing normal identity IDs
- [x] Preserve correct era-to-variant identity mapping
- [x] Use a shared raster atlas for the 14 later variants
- [x] Keep legacy Canvas fallback for failed/missing image loads
- [x] Preserve boss phase labels, HP bars and combat telegraphs
- [ ] Inspect genuine V17 gameplay screenshots at normal gameplay scale and 2× device pixel ratio
- [ ] Evaluate any faint background-edge artifacts from concept-board extractions at native size
- [ ] Confirm Safari/iPad memory behavior and production distribution before merging
