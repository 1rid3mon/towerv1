# Story Mode — Mission 11 Design Spec
## Aşağıdaki İstasyona İniş / Descent to the Lower Station

**Status:** design draft only. Do not implement until Mission 10's browser/mobile and save-isolation checks pass.
**Chapter:** 02 — Beneath the Signal
**Target first-play duration:** 10–14 minutes (design target; not measured)
**Core purpose:** take the player from the impossible administrator override into a physically older network beneath the station, and teach the cyan pulse as an exploration tool outside combat.

## Narrative guardrails

- Mission 10's final reveal is the immediate setup: the lift has opened, but nobody understands why the companion was accepted as an administrator.
- Do not answer who created the companion, what the blue memory echo is, or why the network recognizes it.
- The lower network predates the station's current architecture. Suggest this through materials, labels, signal patterns, and the AI's uncertainty—not a lore dump.
- The companion can interpret fragments, not translate the entire network.
- No purple form, new currency, permanent combat-stat reward, or new inventory system.
- Story progress remains in `towerDefenseStoryProgressV1`; never write Story Mode state into Endless/Firebase economy or leaderboard data.
- Reuse existing canvas, pulse/ring rendering, story HUD, and action-button patterns. Avoid requiring precise canvas taps.

## Opening scene — the descent

**Visual:** the lift descends beyond the station's mapped depth. The ordinary station grid fades; underneath it, a second geometry appears, with lines that do not align with the current station.

**Commander (TR):** “Bu kat istasyonun altında değil. İstasyon bunun üstüne inşa edilmiş.”
**Commander (EN):** “This level isn't beneath the station. The station was built on top of it.”

**Station AI (TR):** “İmkânsız. Temel kayıtları istasyonun kendisinden eski bir yapı göstermiyor.”
**Station AI (EN):** “Impossible. The foundation records show no structure older than the station itself.”

**Companion (TR):** “Kayıtları yanlış okumuyorsun. Kayıtların bir kısmı… burada bitiyor.”
**Companion (EN):** “You're not reading the records wrong. Some of the records… end here.”

**Objective:** Restore a local map fragment and identify a safe route through the lower network.

## Encounter flow

### Phase A — An unfamiliar map
- Start with a short descent scene, then a low-pressure navigation/exploration beat; no immediate enemy wave.
- Show three map fragments as named actions, not tiny canvas hotspots.
- The first two fragments are readable with the normal scanner; the third is masked by a dead signal.
- Do not make progress depend on guessing or repeated tapping.

**Status (TR):** “HARİTA PARÇALI · Üç izi karşılaştır; kör noktayı belirle.”
**Status (EN):** “MAP FRAGMENTED · Compare the three traces and locate the blind spot.”

### Phase B — Pulse outside combat
- Offer a single clearly labeled action: **SİNYAL DARBESİ / SIGNAL PULSE**.
- The pulse reveals a hidden route lattice for a brief, readable window; it does not attack, damage, or stun anything.
- If the player misses the window, let them pulse again without penalty. A short cooldown is presentation/gameplay pacing only and must not persist after exit/retry.
- Respect reduced motion: use a soft expanding cyan ring and a stable after-image, never intense flashes.
- The pulse reveals a path that is older than the station's map grid. It should be visually legible on portrait and landscape.

**Companion (TR):** “Bu bir kablo ağı değil. Birbirini tanıyan noktalar gibi… ama hiçbirinde güç akışı yok.”
**Companion (EN):** “This isn't a cable network. More like points that recognize each other… but none of them carry power.”

### Phase C — The network answers
- The player chooses one of two safe routes through labeled buttons: **FOLLOW THE SIGNAL** or **FOLLOW THE STRUCTURE**.
- Both routes reach the same mission endpoint but produce different short dialogue and a Story Mode-only clue flag; neither choice should lock future missions.
- Signal route: the network briefly pulses before the companion does.
- Structure route: the station AI identifies a construction mark that predates its own registry.
- Do not imply the companion consciously caused the pulse.

**Station AI (TR):** “Bu işaretleme biçimi istasyon standardı değil. Daha eski bir şey de değil… kayıt dışı.”
**Station AI (EN):** “This marking system isn't a station standard. It isn't an older standard either… it's unregistered.”

**Commander (TR):** “Bir sistemin kaydı yoksa, onu kim inşa etti?”
**Commander (EN):** “If a system has no record, who built it?”

**Companion (TR):** “Bilmiyorum. Ama buraya ait olmadığımı düşünüyordum. Şimdi bundan emin değilim.”
**Companion (EN):** “I thought I didn't belong here. Now I'm not sure about that.”

### Phase D — First contact, not a fight
- A distant signal responds to the revealed lattice. It is not the blue hologram and is not identified as a person, enemy, or companion.
- End with a sealed bulkhead unlocking one notch; the player sees a deeper route but cannot enter it yet.
- No boss and no combat encounter in this mission. The next mission can turn the signal into a defense problem, after the player has had time to process the discovery.

**Final status (TR):** “AĞ YANIT VERDİ · Kaynak konumu belirlenemiyor.”
**Final status (EN):** “NETWORK RESPONSE RECEIVED · Source location cannot be determined.”

## Progression and save behavior

- Unlock Mission 11 only after `mission10Complete === true`.
- Store the route choice and `mission11Complete` only in the Story Mode progress object.
- Do not save transient pulse window/cooldown, map fragments, or temporary combat state.
- Replay starts from Phase A and allows a different route choice.
- Exit at any phase restores the exact pre-story game snapshot and original mode.
- Refresh during the mission must not persist Story Mode combat or exploration state as an Endless save.
- If Mission 10 is not complete, direct calls to the Mission 11 handler must fail closed.

## Accessibility and presentation

- All copy uses the existing Turkish/English language helper; no mixed-language state.
- Use large touch targets and scrollable story HUD on short mobile screens in portrait and landscape.
- Communicate the active map fragment with both icon/label and status text, not color alone.
- Reduced-motion mode must preserve the pulse's meaning without animation.
- Avoid timer pressure for first-time learning.

## Acceptance checklist (before implementation is considered complete)

- [ ] Mission 11 stays locked until Mission 10 is completed; direct handler calls cannot bypass the gate.
- [ ] Exploration phase does not start Endless waves or grant Endless rewards.
- [ ] Pulse reveals the route outside combat and can be retried without penalty.
- [ ] Both route choices are reachable by touch and persist only in Story Mode.
- [ ] Replay permits a different route choice without duplicating rewards.
- [ ] Exit and refresh preserve Endless state and save isolation.
- [ ] Turkish/English copy is complete.
- [ ] Portrait, landscape, and reduced-motion behavior are manually tested.
- [ ] The source of the signal remains unidentified; no lore mystery is prematurely resolved.

## Implementation order

1. Finish Mission 10 QA and repair any phase, exit, retry, or save-isolation regressions.
2. Add Mission 11's locked chapter-board card and prerequisite guard.
3. Implement the exploration phases with existing story action controls.
4. Reuse the cyan pulse presentation; avoid a competing rendering system.
5. Add Story Mode-only route clue persistence.
6. Run syntax/security CI and manual browser/mobile regression tests before merge.
