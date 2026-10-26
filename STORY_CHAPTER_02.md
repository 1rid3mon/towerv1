# Chapter 02 — Beneath the Signal
## Narrative and gameplay outline

**Status:** Missions 10–15 have first-pass playable implementations in main. Manual browser/mobile QA and save-isolation regression checks are pending. Missions 16–18 remain design-stage.

## Purpose

Chapter 01 ended with the maintenance companion awakening into a cyan form. That is not the end of the story; it is the first real answer that creates a more dangerous question. The signal's final message warned the commander not to forget what lies beneath the station.

Chapter 02 follows the commander and the newly awakened companion below the station's public decks, into sealed infrastructure that predates the station's official construction records. The cyan form gives the companion a limited pulse ability, but each use makes the station's hidden network respond. The companion is useful now, not omnipotent: its pulse can reveal, interrupt, or stabilize a system, but it cannot solve every encounter.

**Chapter arc:** curiosity → controlled exploration → consequence → mistrust → shared choice.  
**Target duration:** about 2–2.5 hours for nine missions, including optional logs. This is a planning estimate, not measured playtime.

## Core narrative rules

- The blue hologram is still an unverified corrupted memory echo. Do not confirm its identity early.
- The companion's cyan form is the first awakening, not its final form. The purple form is reserved for a later chapter.
- The commander and companion should build trust through decisions and actions, not exposition dumps.
- Every new mechanic must have a clear purpose and then be reused. Aim for a major system about every 35–50 minutes, with smaller character or mystery beats between them.
- Use familiar combat when the tactical context changes; avoid repeating identical waves just to extend playtime.
- Optional logs add emotional texture but never block the main story.
- The chapter's consequences are narrative and tactical; no new currency is required.

## Mission outline

### Mission 10 — The Door Below
**Target:** 10–14 minutes  
**Objective:** use the cyan pulse to reveal a sealed maintenance lift beneath the station's core.  
**Gameplay:** a short defense encounter protects the pulse calibration. The player then activates the pulse at two marked nodes, teaching its range and cooldown.  
**Story beat:** the lift recognizes the companion's signal as an administrator-level key, even though the companion has no matching identity record.  
**Question:** who gave a powerless maintenance unit access to a hidden subsystem?

### Mission 11 — Descent to the Lower Station / Aşağıdaki İstasyona İniş
**Target:** 10–14 minutes  
**Objective:** restore a map fragment and identify a safe route through the network beneath the station.  
**Gameplay:** begin with a quiet descent and three labeled map-fragment actions, then teach the cyan pulse as an exploration tool outside combat. The player chooses to follow the signal or the structure; both routes converge without locking later missions.  
**Story beat:** the lower network predates the station's mapped architecture, yet responds to a signal the station AI cannot identify.  
**Character beat:** the companion questions whether it belongs in a place it seems to recognize.

### Mission 12 — The Listening Wall
**Target:** 12–16 minutes  
**Objective:** disable a wall of signal receivers without destroying the evidence.  
**Gameplay:** defend two receiver banks in sequence, then choose which one to isolate first. The order changes the next encounter's starting advantage, not the entire plot branch.  
**Story beat:** the receivers are not listening to space. They are listening to the companion's pulse.  
**Payoff:** the first clear sign that the companion may be the signal's source, a target, or both.

### Mission 13 — A Voice with No Owner
**Target:** 10–14 minutes  
**Objective:** reconstruct a voice packet from three fragments.  
**Gameplay:** a quiet investigation after a short encounter; optional fourth fragment supplies extra context.  
**Story beat:** the voice speaks to the commander with intimate familiarity but uses a designation assigned to the companion only after the station was supposedly built.  
**Pacing:** no new combat system. Let the mystery and character relationship breathe.

### Mission 14 — The Containment Protocol
**Target:** 16–20 minutes  
**Objective:** stop the station AI from sealing the lower decks permanently.  
**Gameplay:** defend the core relay while using the pulse to interrupt a telegraphed shield cycle. The pulse is a tool, not a win button; mistiming it leaves the player to handle the threat with familiar combat.  
**Story beat:** the station AI admits that the lockdown is not a malfunction. It was ordered by a command signature that resembles the commander’s, but its timestamp is from the future relative to the station clock.  
**Choice:** trust the station AI's containment plan or keep the lower access open long enough to retrieve one more record. Both paths converge, but dialogue and the next encounter's support bonus differ.

### Mission 15 — The Cost of Listening
**Target:** 14–18 minutes  
**Objective:** stabilize the companion after the pulse causes feedback.  
**Gameplay:** short repair sequence under intermittent pressure; use the already-taught repair interaction rather than adding a separate minigame.  
**Story beat:** the companion loses access to one recovered memory and chooses not to hide it from the commander. Trust grows because it tells the truth, not because the mystery is solved.  
**Pacing:** a character-focused breather after the containment set piece.

### Mission 15 — The Cost of Listening (first playable implementation)
**Target:** 14–18 minutes (design target; not measured)  
**Objective:** stabilize Piko after the cyan pulse causes feedback.  
**Gameplay:** defeat a short group of hostiles, then repair three systems through large, labeled actions. The encounter reuses the established repair interaction pattern; no new minigame or currency is introduced.  
**Story beat:** Piko admits that the pulse restored one memory briefly but made another inaccessible. Piko chooses to tell the commander instead of hiding the loss. The missing memory stays unresolved.  
**Implementation guardrails:** progress is stored only in the Story Mode progress object; Mission 15 is locked until Mission 14 is complete; the repair action is phase-guarded; no Endless rewards are granted by the repair sequence. Manual save/retry and mobile testing remain required.

### Mission 16 — The False Exit
**Target:** 16–20 minutes  
**Objective:** escort the commander and companion through a route that repeatedly loops back to the same chamber.  
**Gameplay:** two distinct defense stages separated by route scans. The environment changes between returns; don't simply repeat the same enemy wave.  
**Story beat:** the blue hologram appears again, but its warning contradicts the earlier recording. The companion insists the echo is frightened, not hostile.  
**Reveal:** the signal loop is being maintained by a system deeper than the station's core.

### Mission 17 — The Name in the Archive
**Target:** 14–18 minutes  
**Objective:** retrieve the archive key before the lower network erases it.  
**Gameplay:** choose one of two routes: a more dangerous direct path or a slower path that preserves optional memory logs. Both are finishable without grinding.  
**Story beat:** the archive contains a partial record of a companion prototype and a missing project designation. The designation is deliberately withheld until Chapter 03.  
**Emotional beat:** the companion chooses its own call sign. This should be a meaningful optional naming moment if the product supports it; otherwise use a fixed name chosen during production.

### Mission 18 — The Lock That Knows You
**Target:** 20–24 minutes  
**Objective:** survive the lower-network defense and open the archive lock.  
**Gameplay:** three short stages combining learned combat, pulse timing, and relay interaction. The climax tests mastery without adding another major system at the last minute.  
**Story beat:** the lock opens for the commander, not the companion. A recording says the commander authorized the system before the station existed in its current form.  
**Ending:** the lower network wakes. A distant purple signal answers the cyan pulse, but the companion does not evolve yet. The purple form is a promise for Chapter 03, not an immediate reward.  
**Hook:** the station's map expands to show an impossible structure outside the orbital station's known orbit.

## Pacing estimate

| Segment | Target time |
|---|---:|
| Missions 10–12: discovery and pulse mastery | 35–46 min |
| Missions 13–15: voice, containment, trust | 40–52 min |
| Missions 16–18: looping route and archive climax | 50–62 min |
| Optional logs / quiet moments | 10–20 min |
| **Chapter 02 total** | **About 2–2.5 hours** |

## Long-term arc

Chapter 02 ends with the lower archive opening and a distant purple signal answering the cyan pulse. The companion does **not** evolve into purple here; that transformation is reserved for Chapter 03 after the cyan form has been used for a substantial stretch. Chapter 03 also contains the late-campaign tower transformation, where the companion retains consciousness but communicates differently. See [Chapter 03 — The Shape of Memory](STORY_CHAPTER_03.md).

## Mission 10 production package

Mission 10 now has a first playable implementation on the feature branch, with its bilingual dialogue, phase flow, pulse tutorial, replay/exit behavior, and acceptance tests documented in [Story Chapter 02 — Mission 10 Production Spec](STORY_CHAPTER_02_MISSION_10.md). Manual browser/mobile QA and save-isolation regression checks remain required before calling it production-ready. Mission 11’s exploration design is documented in [Mission 11 Design Spec](STORY_CHAPTER_02_MISSION_11.md); its gameplay code is not implemented yet.

## Production gates

- Do not begin full production of every mission before the Chapter 01 prototype has passed a complete playthrough.
- Prototype the pulse ability once, then test it in at least three different tactical contexts.
- Measure real playtime with first-time players; don't pad the chapter to hit a number.
- Provide a checkpoint at the start of each major set piece and after long non-combat interactions.
- Keep the companion's cyan form visually distinct from the corrupted blue echo.
- Preserve Story Mode save isolation from Endless Mode, currency, upgrades, Firebase, and leaderboard.
- Localize all player-facing copy; never mix Turkish and English in the same state.
- Test portrait and landscape layouts, reduced motion, pause/retry, and save/reload.
