# Story Mode — Mission 10 Production Spec
## The Door Below / Aşağıdaki Kapı

**Status:** first playable implementation added on the feature branch; manual browser/mobile QA and regression checks are still pending.
**Chapter:** 02 — Beneath the Signal
**Target first-play duration:** 10–14 minutes (design target; not measured)
**Core purpose:** introduce the cyan pulse as a limited, deliberate tool; end with the first impossible proof that the companion has administrator-level access it should not possess.

## Narrative guardrails

- The blue hologram remains an unidentified, corrupted memory echo.
- The maintenance companion is now in its cyan awakened form, but it is not omnipotent.
- Pulse effects reveal, interrupt, or stabilize; they do not automatically kill enemies or solve every puzzle.
- Do not introduce the purple form in this mission.
- No new currency, inventory system, or permanent combat-stat reward.
- Story progress must remain separate from Endless Mode, Firebase, currency, upgrades, and leaderboard data.
- The first playable version should reuse existing combat, pause, status text, and story-action patterns wherever possible.

## Opening scene

**Visual:** The chapter board now shows Mission 10 unlocked only after Mission 9 is completed. The cyan companion is represented by its established awakened icon/state, not by the blue hologram artwork.

**Station AI (TR):** “Alt kat planlarda görünmüyor. Burada yalnızca taşıyıcı kiriş olması gerekiyordu.”
**Station AI (EN):** “There is no lower level on the schematics. This should be a load-bearing strut.”

**Commander (TR):** “Peki bu kapı neden çekirdeğin altında?”
**Commander (EN):** “Then why is there a door beneath the core?”

**Companion (TR):** “Kapıyı ben algılamıyorum. Kapı… beni algılıyor.”
**Companion (EN):** “I am not detecting the door. The door is detecting me.”

**Objective:** Stabilize the pulse calibration, then reveal and activate two hidden nodes.

## Encounter flow

### Phase A — Calibration under pressure
- Start with a short, familiar defense encounter (target: 6 hostiles).
- The companion warns the player that pulse calibration is unstable.
- The player uses the normal tower defense loop; pulse is unavailable during this first phase.
- On completion, stop enemy spawning and pause the mission for a clear transition.
- Do not give Endless rewards or increment persistent Endless wave/highest-wave progress.

**Status (TR):** “KALİBRASYON PENCERESİ AÇILDI · Darbeyi işaretli düğüme yönelt.”
**Status (EN):** “CALIBRATION WINDOW OPEN · Direct the pulse at the marked node.”

### Phase B — Teach pulse with a safe first node
- Show one prominent action button: SİNYAL DARBESİ / SIGNAL PULSE.
- First activation reveals Node 1 and records the first successful pulse for this mission.
- Pulse has a short cooldown / one-action-at-a-time gate so repeated taps cannot advance multiple phases.
- In this first tutorial use, do not punish the player for timing; teach cause and effect.
- Companion line after activation:

**TR:** “Darbe düşmanı vurmadı. Gizlenmiş bağlantıyı görünür kıldı.”
**EN:** “The pulse did not strike an enemy. It revealed a hidden connection.”

### Phase C — Second node, consequence
- Reveal Node 2 only after Node 1 is activated.
- The second pulse stabilizes a sealed lift interface. Keep the interaction understandable on portrait and landscape layouts.
- Do not require precise canvas tapping; a labeled button/action is acceptable for this first prototype.
- After Node 2, the lift opens and the mission reaches its narrative ending.

**Station AI (TR):** “Erişim reddedildi. Kimlik kaydı bulunamadı.”
**Station AI (EN):** “Access denied. No identity record found.”

Pause for a beat, then the interface changes without a new player action:

**Station AI (TR):** “Düzeltme: yönetici erişimi doğrulandı.”
**Station AI (EN):** “Correction: administrator access verified.”

**Commander (TR):** “Sistemde kaydın yok. Nasıl yönetici olabilirsin?”
**Commander (EN):** “You have no identity record in this system. How can you be an administrator?”

**Companion (TR):** “Bilmiyorum. Ama kapı açılınca… içimde bir şey hatırladı.”
**Companion (EN):** “I don't know. But when the door opened… something inside me remembered.”

### Mission completion
- Save mission10Complete: true and the chapter progression in the dedicated Story Mode progress object only.
- Record the tutorial milestone (e.g. pulseTutorialComplete: true) so Mission 11 can assume the player has seen the mechanic.
- Do not store transient pulse cooldowns or mission phase into persistent player/economy state.
- Show a chapter-board return action. On return, restore the exact Endless snapshot.
- Replaying Mission 10 must replay the tutorial and must not duplicate any permanent reward.

## Failure, pause, exit, and replay

- If the player loses the defense phase, show retry/exit using the Story Mode retry path; do not trigger Endless salvage rewards.
- Retry starts Mission 10 from Phase A with zero transient pulse progress.
- Exiting at any phase restores the pre-story game snapshot and original game mode.
- Browser refresh must not save the temporary Story Mode combat state as an Endless save.
- A completed Mission 10 can be replayed; the mission gate still requires Mission 9 completion.
- Repeated pulse-button taps during a transition must be idempotent: one activation advances one phase only.

## Accessibility and presentation

- Respect reduced-motion preferences: no full-screen strobing or intense repeated flashes.
- Pulse is a readable expanding cyan ring with a clear completion state; do not rely on color alone.
- Use both a label/icon and status copy to communicate which node is active.
- All visible copy must use the existing language-selection helper; do not mix Turkish and English in a single state.
- The Story HUD must remain scrollable on short mobile screens in both orientations.
- Keep pulse action buttons large enough for touch and disable them during inactive phases.

## Acceptance checklist

- [ ] Mission 10 is locked until Mission 9 completion and cannot be launched by a direct handler call beforehand.
- [ ] It remains locked until Endless Mode has been cleared through wave 25, not merely reached.
- [ ] Phase A completes only after the intended kill count.
- [ ] Pulse 1 reveals Node 1 exactly once.
- [ ] Pulse 2 reveals/stabilizes Node 2 exactly once.
- [ ] Completion saves Story Mode progress only.
- [ ] Retry resets transient phase/cooldown and does not award Endless rewards.
- [ ] Exit restores Endless state, mode, and UI.
- [ ] Replay works without duplicate rewards.
- [ ] Turkish/English strings are complete.
- [ ] Portrait, landscape, reduced-motion, and touch interaction are manually tested.
- [ ] No purple transformation occurs; the mystery remains unresolved.

## Build order

1. Add mission 10 to the chapter board with its prerequisite gate.
2. Extend the Story Mode session state with explicit phases: combat, pulseNode1, pulseNode2, complete.
3. Add a dedicated pulse action handler with phase checks and idempotent transitions.
4. Reuse the existing cyan pulse visual; do not create a second competing visual implementation.
5. Add completion persistence and confirm Story Mode snapshot restoration.
6. Add regression tests for gates, phase transitions, duplicate taps, save isolation, retry, and exit.
7. Only then begin Mission 11 implementation.
