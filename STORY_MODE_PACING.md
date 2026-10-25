# Story Mode Pacing — Chapter 01: Kayıp Sinyal

## Core target

- Target **about one hour** for the first complete chapter, from the silent station arrival to the companion’s second (cyan/awakened) form. This is the first release slice; the later purple form and tower transformations belong to a future chapter.
- This is a pacing target, not a timer or a grind requirement. Skilled players may finish sooner; struggling players must not be trapped in repetition.
- The chapter should feel like one unfolding adventure, not a checklist of new mechanics.
- **Not every mission needs a new mechanic or major reveal.** Most missions should let players use what they already know, with one meaningful change only when the story earns it.
- A small clue can be quiet background detail. Do not make every clue a cliffhanger or force the player to stop and analyze it.

## Rhythm and novelty budget

Use a flexible three-beat rhythm rather than introducing something new every 1–2 missions:

1. **Learn or discover** — introduce one important mechanic, enemy behavior, or story question.
2. **Use and deepen** — let the player apply it in a different situation without adding another system.
3. **Breathe and pay off** — a calmer traversal, repair, short conversation, optional discovery, or a familiar encounter with a meaningful context change.

Then begin another cycle when it feels natural. Some story stretches may need two missions; others may need three or four. This is a guide, not a rigid formula.

- Aim for a **major new gameplay system about every 35–50 minutes**, usually every 2–3 missions, only if the current systems are understood.
- Give the player a smaller meaningful development roughly every 15–25 minutes: a character beat, a useful upgrade, a new enemy tell, a changed arena, or a clue that reframes something.
- Keep several missions intentionally familiar. Mastery and anticipation are part of the fun.
- Avoid stacking a new system, a new enemy type, a lore reveal, and a major UI change in the same mission.
- Repeat a defense-style encounter only occasionally. When it returns, change its tactical purpose or story context—not just the enemy count.
- If playtests show fatigue, remove repetition before adding content to reach the target runtime.

## Pacing model

Aim for **9 core missions** plus optional memory/signals. The second form is the chapter climax, not an early level-up. Mission count and timing can change after playtests.

| Segment | Target time | Experience | Companion state |
|---|---:|---|---|
| Prologue + Mission 01 | 6–8 min | Silent station, corrupted blue memory echo, first defense tutorial | Basic / low power |
| Mission 02 | 5–7 min | Short patrol and signal-trace scan | Basic; learns to scan |
| Mission 03 | 3–4 min | Choose antenna data or black-box evidence | Basic; memory remains unclear |
| Mission 04 | 3–4 min | Route reserve power to shields or weapons | Basic; practical choice |
| Mission 05 | 7–9 min | Defend corridor, then disable relay | Basic; voice packet matches the echo |
| Mission 06 | 4–5 min | Repair three connections with the companion | Brief cyan flicker, no evolution |
| Mission 07 | 7–9 min | Defend communications array, then disable amplifier | Basic; signal loops from inside |
| Mission 08 | 4–5 min | Return to opening room and inspect three contradictions | Violet silhouette remains unidentified |
| Mission 09: awakening | 10–12 min | Final defense, reconnect, awaken, test pulse | Evolves into cyan form |
| Optional logs / breathing room | 5–10 min | Revisit evidence and let the reveal land | New form established |

**Target total:** roughly 54–73 minutes including optional content. This is a design target, not a verified playtime; it must be measured with first-time testers.

## Mission design rules

1. Do not use “defeat N enemies” as the main objective for every mission. Mix defense with investigation, repair, escort, navigation, survival under a changed arena rule, and multi-stage elite encounters—but introduce these at a comfortable pace.
2. Keep a normal mission around 12–22 minutes of active play. Most story scenes should be under 60–90 seconds; longer scenes need a major emotional or narrative payoff.
3. A mission may focus on execution and atmosphere rather than novelty. Familiar mechanics are not filler when the stakes or player goal changes.
4. Introduce one major new gameplay concept at a time. Let players practice it before layering a second concept on top.
5. A returning location must have a visible reason to revisit and a meaningful state change. Do not reuse it just to save production time.
6. Optional content rewards curiosity with memory fragments, cosmetic signals, or companion reactions. Required progression must never depend on grinding optional content.
7. Add checkpoints before longer set pieces. On failure, let the player retry quickly without replaying long unskippable dialogue.
8. The companion evolves through story events and recovered memories, not a generic XP grind or an automatic upgrade after every mission.
9. Keep clues understated. A few ordinary interactions between major reveals help make the mystery feel real rather than exhausting.
10. After the second-form transformation, provide a short low-pressure section to experience the new ability before another demanding encounter.

## Companion story beats

- **Basic form:** a worn maintenance unit with almost no power and no weapon. It follows the commander and performs small scans/repairs.
- **Memory echoes:** the blue hologram is a fragmented, unreliable memory echo. It is not the companion's current physical body; its identity should remain uncertain early on.
- **Build-up:** occasional reactions to specific signals, with long enough gaps that each reaction matters. These are clues, not a constant stream of upgrades.
- **Awakening:** during Mission 09, the companion actively protects the core/commander and chooses to reconnect. The second form is earned through the climax.
- **After transformation:** let the player test the new form and feel the difference. Do not immediately stack another long fight on top of the reveal.
- **Future arc:** the purple form and tower transformations belong to later milestones. Give each its own narrative cause and meaningful gameplay change; do not rush them into Chapter 01.

## Current implementation status

First-pass playable flows for Missions 01–09 are implemented on the draft branch: combat, signal scans, evidence choice, power-routing choice with a gameplay effect, relay/amplifier interactions, repair sequence, memory inspection, and a multi-step companion awakening. These are prototype implementations, not a polished or manually playtested one-hour chapter. Dialogue, pacing, difficulty, save/retry behavior, mobile layout, and continuity still need playtesting and refinement.

## Playtest gates before release

- Measure first-playthrough time with multiple testers; do not balance from developer familiarity alone.
- Ask where players felt bored, confused, overwhelmed, or eager to continue.
- Track back-to-back combat stretches and how often a new rule is introduced.
- Test mobile portrait/landscape, save/reload, defeat/retry, leaving a mission, and returning to Endless Mode.
- Keep Story Mode progress isolated from Endless save data, currencies, Firebase, and leaderboard state.
