# Lost Signal — Operations Center V2 / Stitch handoff

Status: design brief; implementation not yet started. Branch: design/operations-stitch-v2.

## Current implementation
- UI: `#endless-operations` dialog, `operations-center.css`, `endless-operations.js`.
- Existing views include supply, gear, boss, season and other Operations tabs. Preserve all tab IDs, JS bindings, actions, currencies and persistence.
- Current palette: dark navy / cyan / amber. Existing Piko supply art at `assets/operations/piko-supply.png`.
- Existing prior concept in `docs/command-center-redesign.md`; do not mistake it for final approved visuals.

## Paste into Google Stitch
Design a premium, illustrated, landscape-first mobile game interface for an original sci-fi tower defense game called LOST SIGNAL. Design the OPERATIONS CENTER screen, not a marketing website. Art direction: abandoned orbital research outpost, moody deep-navy metallic panels, atmospheric teal holographic instrumentation, restrained amber warning accents, tactile bevels, subtle wear, sophisticated game illustration, not generic SaaS cards, not flat emoji icons, not neon overload. Main canvas 844x390 landscape phone, also adapt to 1024x768 tablet. Header with OPERATIONS CENTER title, currency counters and unmistakable close button; narrow left navigation for Daily Supply, Equipment, Missions, Boss, Season; right content is an immersive illustrated DAILY SUPPLY area with a large original compact robot supply illustration, seven visually distinct daily reward tiles, clear claimed/current/locked states, and one primary claim button. Strong readability at phone scale, minimum 44px touch targets, safe-area padding, no horizontal overflow, no clipped navigation, no important information hidden behind art. Produce structured HTML/CSS where possible. Use editable UI text, not text baked into illustrations. Keep illustrations separable as exportable assets. No fake screenshots, no copyrighted game characters. Make it feel like a shipped premium indie sci-fi game, not a wireframe.

## Integration contract
1. Preserve `#endless-operations` and all event handlers and save keys; visual-only changes first.
2. Prefer a scoped new stylesheet over overwriting engine logic.
3. Generate/export assets separately (transparent PNG/WebP or SVG as appropriate), no baked-in text.
4. Test 844x390, 915x412 and 1024x768; verify tabs, close, claim, gear and scrolling.
5. Review visual output on a real Android landscape phone before merging to main.
6. Do not merge without screenshots and functional checks.

## Asset backlog
- Daily Supply robot hero illustration
- Seven reward illustrations / icons
- Gear silhouettes and rarity frames
- Boss encounter illustration
- Season pass reward track visuals

## Acceptance
Distinctive, cohesive game-art aesthetic; touch-friendly responsive UI; no save/economy changes; all existing actions functional; screenshot review and automated tests pass.
