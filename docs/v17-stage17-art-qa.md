# LOST SIGNAL V17.1 — Stage 1.7 art-quality acceptance

Date: 2026-11-05 · Review source: draft PR #91, branch `fix/v17-enemy-readability-art-direction`

## Scope and completion definitions
Stage 1.7 is the **art QA / iPad-target acceptance gate**, not a new game mode. The Stage 1.1–1.6 Canvas/SVG conversion must remain separate from production until validated.

### Confirmed before Stage 1.7
- Stage 1.6 exact-head CI completed 5/5 GitHub Actions jobs successfully: JavaScript/security, Chromium story/browser, Chromium exploration, WebKit smoke and WebKit exploration.
- Source-based 1x screenshots exist for 20 normal families, 10 collectible companion skins, five bosses across phases 1/2/3, Piko, four sampled tower skins and combat effects against cyber-dark and saturated Cengiz red.
- Combat rules, player loot, tower aiming, boss phase mechanics and save keys were not intentionally altered by art conversion.

## Visual adjustments made during QA
- Reduced the dominating **disc only** behind normal enemies and bosses; keep distinct mechanical polygons, leading outline, accent arcs and gameplay radius unchanged. The new outer forms are more recognizably different from one another at native view.
- Made the combat-art low-graphics check read the real lexical gameplay `game` binding, not just an optional `window.game` value. Reduced-motion behavior is still respected.

## 400+ wave synthetic scene protocol
The automated browser suite `security-lab/stage17-visual-browser.cjs` runs **locally in isolated, disposable guest contexts** under Chromium and Playwright WebKit. It is *not* a physical iPad and *not* a natural playthrough to wave 450.

- Viewports: 1032 × 1376 (13-inch iPad Air portrait point-size proxy) and 1376 × 1032 (landscape), DPR 2, touch enabled.
- Creates a deterministic display-only scene labeled `wave=450`: 100 and 260 normal enemies, five existing boss identities in phase 3, plus controlled projectile pressure. No newly invented enemy, boss or save IDs.
- Directly invokes the actual `renderGame()` path for both dark-cyber and saturated Cengiz-red, records 12 after-warmup draw durations, renders PNG evidence and checks runtime exceptions.
- Enforces a **300 ms p95 upper bound**, intended only to flag catastrophic CI render stalls, *not* to claim 60 FPS, real-frame fluidity or physical-device parity. Reports measured p50/p95 for review.
- Restores every in-memory gameplay array and wave/theme setting before exit; asserts that persistent localStorage save bytes did not change.
- Checks page width for horizontal overflow and Piko speech-bubble wrapping.

## Remaining release gates
1. **Exact-head CI: all jobs must pass**; previous green runs are not proof of a newer commit.
2. **Real iPad Safari**: play authentic crowded waves, including 400+, inspect performance, thermal load, touch responses, ability to distinguish enemy types in motion, effects/telegraphs, costume inventory, Piko interaction and screen rotation. This cannot be certified by Playwright WebKit.
3. **Art-director review**: confirm five boss phases, red-theme visibility and companion/equipment silhouette consistency by eye, not by automated pixel thresholds alone.
4. **Release permission**: do not merge or deploy until the user explicitly authorizes main and production.

## Honest QA status
The code and automated QA can be completed within this branch. Physical iPad acceptance is intentionally marked **not verified**, not silently treated as a pass. Measured synthetic browser results and the exact run URL should be appended when available.
