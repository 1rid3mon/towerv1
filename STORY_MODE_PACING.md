# Story Mode Pacing — Chapter 01: Kayıp Sinyal

## Design target

- Target time from the first maintenance-companion form to its second (cyan/awakened) form: **about 3–4 hours** for a first playthrough.
- This is a target, not a forced timer. Skilled players should be able to move faster; struggling players should not be trapped in a grind.
- The player should feel progress every 10–20 minutes through a new mechanic, story reveal, environment change, companion behavior, or meaningful reward.
- No mission should be stretched by repeating the same wave loop just to hit a playtime target.
- Repeat a defense-style encounter only occasionally, and only when its tactical context changes (new enemy behavior, altered arena, a companion ability, or a clear story consequence).

## Pacing model

Aim for **9 core missions** plus a handful of short optional signal/memory events. The second form is the Chapter 01 climax, not an early level-up.

| Segment | Target time | Main purpose | Companion state |
|---|---:|---|---|
| Prologue + Mission 01 | 15–20 min | Establish the silent station, corrupted blue memory echo, and powerless maintenance unit; teach core defense | Basic / low power |
| Missions 02–03 | 30–40 min | First contact and a non-combat investigation; teach enemy tells and signal scanning | Basic, learns to scan |
| Missions 04–05 | 35–45 min | A short escort/repair sequence and a tactical encounter with a changed objective | Basic, first visible response to signal fragments |
| Missions 06–07 | 35–45 min | Explore a new station sector, make a meaningful route/resource choice, then defend a moving or exposed objective | Unstable energy traces, no full evolution yet |
| Mission 08 + memory event | 25–35 min | Rare callback to an earlier place with a changed layout/enemy mix; reveal a key memory contradiction | Brief cyan flickers |
| Mission 09: awakening | 25–35 min | Multi-stage climax combining learned mechanics; player actively protects the companion while it chooses to link with the core | Evolves into the second, cyan/awakened form |
| Breathing room / optional discovery | 10–20 min | Optional logs, companion interactions, test the new ability, or continue directly | New form established |

**Expected total:** roughly 3–4 hours depending on player pace and optional content. Avoid padding; if testing shows fatigue, cut repetition before adding more waves.

## Mission variety rules

1. Do not use “defeat N enemies” as the main objective for every mission. Mix defense, investigation, scanning, repair, escort, survival with a changed arena rule, and multi-stage boss/elite encounters.
2. Keep a normal mission to roughly 12–22 minutes of active play, with story scenes usually under 60–90 seconds unless a major reveal earns more time.
3. Add a new gameplay twist every 1–2 missions. Do not introduce several unrelated systems at once.
4. A repeated location must have a visible reason to return and a changed tactical or narrative state.
5. Optional content should reward curiosity (memory fragments, cosmetic signals, companion reactions), never hide required power behind grinding.
6. Checkpoints should protect progress before longer set pieces. A failed encounter should be retryable without replaying a long unskippable scene.
7. The companion evolves because of story choices and recovered memories, not because the player grinds a generic XP bar.
8. Make the evolution readable: small animation/sound cue, visual change, a new ability tutorial, and a short quiet moment after the climax.

## Story beats for the companion

- **Basic form:** a worn maintenance unit with almost no power and no weapon. It follows the commander and performs small scans/repairs.
- **Memory echoes:** the blue hologram appears only as fragmented, unreliable recollection. It must not be presented as the companion's current physical body or fully explained early.
- **Build-up:** occasional cyan flickers and reactions to specific signals. These are clues, not a sequence of automatic upgrades after each mission.
- **Awakening:** during Mission 09, the companion actively protects the core/commander and chooses to reconnect. The second form is earned through the climax.
- **After the transformation:** let the player use the new form and ability in a short low-pressure sequence. Do not immediately stack another long fight on top of the reveal.
- **Future arc:** the purple form and tower transformations belong to later milestones. They should have their own story causes, gameplay changes, and breathing room; do not rush them into Chapter 01.

## Current implementation status

This document is the pacing target for development, not a claim that all nine missions exist yet. At the current prototype stage, Mission 01 is the only intended playable story encounter; Missions 02–09 must be implemented and tested before the 3–4 hour arc can be considered delivered.

## Playtest gates before release

- Measure first-playthrough time with at least a few testers; do not balance from developer familiarity alone.
- Ask where they felt bored, confused, or wanted to stop, and where they felt curious to continue.
- Track repeated objective types and back-to-back combat stretches.
- Test mobile portrait and landscape, save/reload, defeat/retry, leaving a mission, and returning to Endless Mode.
- Keep story progress isolated from Endless save data, currencies, Firebase, and leaderboard state.
