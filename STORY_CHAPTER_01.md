# Chapter 01 — Kayıp Sinyal
## Mission outline and production brief

This outline documents the chapter's narrative and pacing. First-pass playable flows for Missions 01–09 are implemented on the draft branch, but they remain prototypes and have not been manually playtested end-to-end.

### Central mystery

The station's systems shut down as the commander approaches. A blue hologram appears, but it is a corrupted memory echo with no confirmed identity. Beside the core, a powerless maintenance companion wakes up. The echo seems to know the commander and warns them not to follow the signal, then glitches before it can explain why.

The companion is a real physical unit; the hologram is not its current form. The story should let the player suspect a connection without confirming exactly what the echo represents.

### Mission 01 — Cold Start
**Target:** 6–8 minutes  
**Player goal:** stabilize the core by defeating the first hostile group.  
**What the player learns:** basic combat rhythm and the objective HUD.  
**Story beat:** the maintenance unit wakes when the core recognizes it. The blue echo flickers, saying only fragments about memory, violet light, and towers.  
**Pacing note:** this is the current prototype encounter. Keep the first playable section focused; don't add multiple mechanics before the player understands the core loop.

### Mission 02 — First Contact
**Target:** 5–7 minutes  
**Player goal:** stop a short hostile patrol, then inspect three signal traces in the nearby sector.  
**Primary interaction:** one brief combat encounter followed by a simple scan/inspect interaction.  
**Payoff:** one trace contains a timestamp from before the station's recorded shutdown. The companion recognizes the sound but cannot explain it.  
**Pacing note:** combat is a short interruption, not another full wave marathon.

### Mission 03 — Source of the Signal
**Target:** 3–4 minutes  
**Player goal:** choose whether to inspect the antenna data or the black-box recording.  
**Primary interaction:** a short, non-combat investigation with a saved evidence choice.  
**Payoff:** the antenna log suggests the signal is looping from inside the station; the black-box log contains a voiceprint recorded before shutdown. Mission 05 dialogue reflects the selected evidence.  
**Pacing note:** a quiet investigative beat gives the player breathing room after the first combat.

### Mission 04 — A Quiet Circuit
**Target:** 3–4 minutes  
**Player goal:** restore power to two linked subsystems and choose which one receives power first.  
**Primary interaction:** a small, reversible route/power choice with a visible short-term consequence.  
**Tone:** lower pressure. No mandatory combat wave.  
**Payoff:** the choice changes the next encounter's starting advantage, not the overall story branch; avoid creating a huge branching narrative to support a small choice.

### Mission 05 — The Broken Line
**Target:** 7–9 minutes  
**Player goal:** defend the subsystem the player prioritized, then disable a signal relay.  
**Known tools:** combat, relay scanning, and the consequence of Mission 04.  
**Change:** the arena contains one hazard that can be used against enemies after a short readable tell.  
**Payoff:** the relay sends a packet that includes a memory fragment matching the hologram's voice.

### Mission 06 — Beyond the Bulkhead
**Target:** 4–5 minutes  
**Player goal:** cross a newly powered sector and escort the maintenance companion through a short exposed route.  
**Primary interaction:** position/route awareness; no new complex escort controls.  
**Payoff:** the companion briefly emits cyan light while repairing a damaged panel, then returns to its weak state. This is a clue, not an evolution or a permanent power-up.

### Mission 07 — The Signal Bends
**Target:** 7–9 minutes  
**Player goal:** protect an exposed communications array while the player chooses between clearing an incoming group early or interrupting a signal amplifier.  
**Known tools:** learned combat tells, hazards, and relay interaction.  
**Change:** combine known mechanics under pressure rather than introducing another whole system.  
**Payoff:** interrupting the amplifier reveals the signal is looping from inside the station, not arriving from deep space.

### Mission 08 — A Familiar Room
**Target:** 4–5 minutes, plus optional memory discovery  
**Player goal:** return to the opening sector, now partially restored, and compare one physical clue with the corrupted echo.  
**Primary interaction:** observation and short optional memory event.  
**Pacing:** a deliberate breath before the climax; a small hostile encounter only if it serves the reveal.  
**Payoff:** a memory fragment shows the commander beside a violet silhouette, but the image is too damaged to establish whether it is the companion or something using its shape.

### Mission 09 — The Choice to Wake
**Target:** 10–12 minutes  
**Player goal:** survive a multi-stage encounter while keeping the core and companion safe.  
**Structure:** first stage uses familiar defense; second stage changes the arena condition; final stage requires the player to act on the enemy tells already learned.  
**Climax:** the companion protects the core instead of retreating. The commander must create a brief safe window for it to reconnect. It chooses the connection; the player does not simply fill an XP bar.  
**Transformation:** the companion reaches its second, cyan/awakened form. A short visual/audio moment makes the change readable.  
**Aftercare:** a short low-pressure test section lets the player use one new ability and understand its limits. The chapter ends with one unresolved clue pointing toward the later purple form and tower transformation—no immediate second boss.

## Player comfort and quality gates

- Every mission must have a clear objective and a visible sense of progress.
- Keep most dialogue skippable on replay. Checkpoints should preserve mission progress without breaking story-state isolation.
- Do not make the player fight the same wave setup in back-to-back missions unless the tactical purpose changes.
- Keep optional memory fragments optional; they deepen the mystery but do not gate the second form.
- Avoid constant flashing/glitch effects. Respect reduced-motion preferences and keep text readable on small screens.
- Story Mode must never overwrite Endless Mode progress, currency, upgrades, Firebase account data, or leaderboard records.
- Before release, test all missions on mobile portrait and landscape and measure the chapter with real first-time players.
