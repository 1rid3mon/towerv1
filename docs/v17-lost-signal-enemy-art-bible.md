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


## Layer 5 · Boss raster sprites and phase treatment

All five existing boss IDs now have registered raster bodies, without touching boss selection, HP, attacks, story save keys or combat phases.

| Boss | Asset | Atlas source rectangle | Phase presentation |
| --- | --- | --- | --- |
| `tank_boss` · Zırhlı Titan Behemoth | `tank_boss/body.webp` | dedicated image | restrained warm metal intensity in phases 2/3 |
| `ranged_boss` · Hiperiyon Topçusu | `atlas/bosses.webp` | 0,0,80,80 | brighter artillery barrel and red sensor |
| `speed_boss` · Kızıl Fırtına Vektörü | same | 80,0,80,80 | brighter red wings/engine |
| `frost_boss` · Kutup Hükümdarı Kryos | same | 160,0,80,80 | brighter cyan ice core |
| `leviathan` · Kozmik Leviathan | same | 240,0,80,80 | brighter violet signal core |

The boss atlas is one 320×80 **transparent WebP** created from newly generated LOST SIGNAL concept art. These are **first-pass assets**; all four silhouettes are different and the background removed. Source artwork was from a composed concept sheet, not a direct top-down orthographic artist export.

The adapter supports `phaseIntensity: [phase2,phase3]` and uses Canvas 2D material filters when supported; otherwise the same raster sprite remains visible. Existing combat phase labels, attack telegraphs and boss aura remain independent, so the player is not forced to rely on a cosmetic change to interpret a lethal attack. This does **not** implement new boss attack mechanics or fully redrawn body/armor art per phase.

The source atlas rectangle is applied **only** when the selected image is the registered atlas body; a future standalone phase or hit sprite will draw as a complete image rather than incorrectly reusing the atlas rectangle.

Layer 5 technical acceptance: 5/5 boss body sprites registered and available in source, four bosses share one cache entry, per-phase visual material response, old Canvas fallback, no save/balance changes. Browser/iPad image quality, animation set completeness and runtime regression remain for later acceptance and must not be misreported as validated.


## Layer 6 · restrained real-time motion and impact presentation

The V17 sprite bodies now have **procedural micro-animation**, not animation-frame sprite sheets. The visuals remain rooted in LOST SIGNAL, with each effect deliberately small enough to retain type and silhouette readability at gameplay size.

Implementation:
- \`enemy-motion-v17.js\` evaluates only current render time and visual enemy state; normal bodies bob by at most 1.15px, fast silhouettes tilt slightly, boss bodies breathe at about 1% of sprite scale.
- A few appropriate archetypes use **two restrained engine exhaust points behind the sprite**, instead of additive armor polygons or all-screen particle halos.
- A hit draws a brief warm impact arc above the body, while the original legacy hit feedback and existing combat impact system remain available.
- Phase 2/3 changes trigger a roughly 700ms **one-time boss energy pulse** using a \`WeakMap\` keyed by the enemy object; this does not mutate or delay the combat phase logic.
- Existing death particles, shield cues, boss attack telegraphs, HP bars, rewards and chapter progress are **unchanged**, rather than double-stacked with new particles.
- Quality mode \`auto|normal|low\` resolves reduced-motion preferences and memory hints. Low quality suppresses bob, tilt, scaling and the phase pulse. Sprites still render with the existing fallback.
- All visual transforms live in their own Canvas \`save()/restore()\` scope and apply only to the raster body, not enemy world position or health bars.
- The sprite drawing adapter forwards \`nowCompTime\`, preserves the boss's active material filter around effect painting, and falls back to the complete legacy stack on missing/unready/corrupt art.
- \`security-lab/enemy-motion-v17.test.cjs\` covers visual-only isolation, reduced motion, two-thruster limit, phase pulse lifetime and script loading. The earlier sprite test checks the new render signature.

Not included: directional eight-way sprite sheets, skeletal rigging, art-level retouch, new death mechanics, extra kinematic simulation, or validated iPad frame-time measurements. Those should not be implied by this procedural motion pass.

### Layer 6 technical gates
- [x] Procedural idle / motion response attached to V17 sprite renderer
- [x] Minimal motor accents, hit response and boss phase transition effect
- [x] Reduced-motion and low-cost visual mode
- [x] Keep existing death, shield and combat readability cues untouched
- [x] Add V17 motion regression test and CI step
- [ ] Verify CI fully green on exact latest branch SHA
- [ ] Inspect on-device 30/60 FPS frame times and actual gameplay-size silhouettes
- [ ] Art-direct / hand-retouch body and directional sprites after visual review

**Do not merge or deploy the draft PR solely because the code compiles; final CI and browser/iPad acceptance are Stage 7.**


## Post-V17 player feedback · gameplay visibility and unified LOST SIGNAL art

Source: iPad Safari screenshot of Endless wave 412, multiple enemies circled by the player. The player reports that small silhouettes, especially red enemies against the **Cengiz** theme, are hard to see. Allies/companions use much larger friendly outlined icon silhouettes than enemy raster sprites, so the combat field has two competing art languages.

### Immediate readability patch (separate branch)
- Stage 1.2 targets **28px normal / 34px elite / 46px boss** visual sprite sizes, with a strict 1.9x bound relative to the original raster draw. Very small hitboxes can remain below the target; the dark identification plate stays visible without changing collisions.
- Stage 1.2 uses a near-black backing disc and neutral bright rim, icy cyan around red/fast units so they remain distinct on Cengiz red; their warm identity stays in the body and tracking notch. Elites have a pale-gold identification edge.
- Entirely Canvas-rendered within sprite \`save/restore\`. No changes to \`enemy.radius\`, collision, targeting, damage, movement, economy, progression, or saves.
- Remains compatible with \`?enemyArt=legacy\` fallback. Needs real Cengiz-theme screenshot and iPad frame-time review before deployment.

### Follow-up unified art pass (not claimed implemented)
1. **Shared silhouette language:** enemies, companions, bosses, Piko and tower share restrained outer stroke thickness, shape clarity, shadow/backplate materials and emissive light values. Differentiate friendly/enemy by geometry and warm/cool accents, not by entirely unrelated drawing styles.
2. **Shared size grammar:** normal enemies readable at gameplay zoom, elites distinctly stronger, bosses largest; allies retain a clear but not cartoon-disconnected identity. Calibrate with real 1x iPad screenshots and at wave 400+.
3. **Theme-aware contrast:** evaluate Cengiz, frost, cyber, desert and bubblegum with enemy palettes. Maintain a consistent minimum foreground/background contrast independent of arena color.
4. **Asset pass:** replace or hand-retouch overly transparent, thin and blurry concept-derived WebP art; use consistent authored rim lighting, silhouette fills and compact sprite framing.
5. **Combat readability:** avoid extra halos masking bullets, boss warnings, HP bars and companion targeting.
6. **Performance:** verify tablet frame times under crowded waves, and honor reduced motion. Only merge/redeploy once tests and actual screenshot review pass.

**Scope:** The immediate patch is a readability fix, not the full art unification. Avoid claiming the companion and enemy designs are already artistically consistent.


## Reference trio implementation · LOST SIGNAL Unified Characters (first code integration)

The first approved art-direction experiment is implemented as local Canvas character art in \`lost-signal-characters-v17.js\`, loaded before \`render.js\`. The reference characters are not concept promises:

- **Echo / owned default-tech companions** — Stage 1.2 applies a 1.30x render-space size increase (roughly 40–50px overall), while all five companion roles share a small armored supporting-drone chassis, two-pixel digital eye expression, layered dark metal, restrained role-specific accents, micro-thrusters and a clear silhouette. The equipped `ghost_wisp` collectible appearance is also updated with translucent spectral fins and violet signal arcs on the same chassis; other purchased alternate skins retain the original renderer. This pass does not affect companion damage, skills, position, level or skins in saves.
- **Cyber Scout** — a compact swept-wing V silhouette, centered sensor visor, dark armored chassis and bright nose locator. Stage 1.2 increases the minimum geometry width to about 36px without changing enemy.radius. Uses the existing \`scout\` identity and target-facing direction, no new unit types or stats.
- **Armored Titan** — a six-mass siege silhouette, broad shoulders, ram, armor and amber reactor. Phase 3 now adds two large shoulder indicators alongside the reactor treatment. Existing \`v12Combat.phase\` values affect presentation only; attacks, death FX, warnings and HP labels remain unchanged.

All three share **LOST SIGNAL industrial materials**: deep ink \`#08111f\`, steel \`#345065\`, edge metal \`#b7ccdc\`, restrained colored signal accents and narrow identification arcs. Companions have friendly rounded visor expression, enemies use forward V-shaped geometry, bosses use oversized broad armor massing.

The module is intentionally limited to three reference *silhouette families*; it does not yet redraw every normal variant or all bosses, nor does it replace custom companion skins. It is a working in-game visual candidate for review, not a completed art conversion.

**Integration gates:** renderer calls the unified drawing module for these references first. If it is absent or returns false, the original V17 WebP sprite and legacy fallback stay available. The \`?enemyArt=legacy\` opt-out is retained. No gameplay state or saved data is modified by the new module.

**Verification:** \`security-lab/lost-signal-characters-v17.test.cjs\` tests three draw paths, phase levels, purchased-skin fallback, opt-out, no gameplay mutation and renderer wiring. Tablet browser smoke draws the actual three references against cyber-dark and Cengiz-red fields and stores a visual \`v17-unified-reference-trio.png\` artifact for quality assessment. These checks must pass, followed by subjective on-device comparison, before merge or production deployment.


### Stage 1.2 implementation record (2026-11-05)
- Completed on the PR branch: shared high-contrast neutral rim, 1.30x Echo chassis scale, minimum 36px Scout silhouette, Titan phase-3 shoulder signal, stronger bounded WebP size floors and cool rim for warm/red enemies.
- Deliberately unchanged: radius/hitbox, combat targeting, animation tick rate, economy, existing player saves and production deployment.
- CI JavaScript syntax, V17 sprite tests and unified-reference unit tests passed on the Stage 1.2 head; full browser/WebKit matrix and real 1x iPad crowded-wave evaluation remain the merge gate.
- This visual-readability milestone does not imply the remaining companion costumes, enemy families, Piko or tower have been artistically converted.


## Stage 1.3 · Normal enemy family conversion (2026-11-05)

Source: lost-signal-enemy-families-v17.js. The 20 remaining normal enemy IDs now receive distinct top-down Canvas chassis, while Scout remains the first shared reference.

- Core: circuit (circuit guard), drone (rotor).
- Khan: shield (bulwark), raider (razor), amber (orbiter), redrunner (dart).
- Snow: ice (blade crystal), glacier (heavy ice shield), snowghost (spectral hardware).
- Desert: scorpion (claws/tail), cactus (spiked hull), sand (crawler).
- Nebula: violet (phase blades), prism (facets), void (dark shell), nebula (twin wings), pulse (coil).
- Dream: bubble (armored spheres), butterfly (moth drone), candy (corrupted crystal).

Each family has an opaque neutral dark backing, a near-white identification edge and restrained family-color sensor. Distinct silhouettes distinguish types before fine details. Small and elite visual bodies have bounded presentation-space sizes; no game radius, hitboxes, movement, targeting, attacks, economy, save keys, progression or player costumes change.

Renderer priority: the first Scout/Titan renderer, then Stage 1.3 normal families, then existing V17 WebP, then complete legacy painting. Only one body pipeline draws each enemy. The enemyArt=legacy URL flag still opts out of unified Canvas art.

Automated verification: the new Node regression test checks exact 20 canonical IDs, distinct geometry, six era palettes, shared contrast, no enemy state mutation, fallback and reduced-motion. Tablet browser smoke captures all 20 at native 1x size across cyber-dark and Cengiz-red backgrounds and verifies a minimum painted area and width. Real iPad 400+ wave performance and visual direction require separate review before merge.

Not included: the other four boss redesigns (Stage 1.5), remaining companion skins (1.4), Piko, tower, or final image-artist sign-off.

Release control: Stage 1.3 remains in draft PR #91; production and main unchanged.
