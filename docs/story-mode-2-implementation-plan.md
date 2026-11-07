# LOST SIGNAL — Story Mode 2.0: 9 episode campaign

## Scope and current implementation
The original 27 playable mission stages are organized into nine 3-stage episodes. Every
legacy mission completion flag remains authoritative, for backwards compatibility with
existing saves. These are *grouped playable sessions*, not yet redesigned seamless maps.
Do not claim that target playtimes have been achieved without human playtest evidence.

| Episode | Legacy stages | Content |
|---|---|---|
| 01 — Uyanış ve Kayıp Frekans | 01–03 | Core defense, signal traces, antenna investigation |
| 02 — Kırık Hat | 04–06 | Power decision, corridor defense, maintenance relays |
| 03 — Kırılma ve Uyanış | 07–09 | Communications defense, contradiction, awakening |
| 04 — İstasyonun Altında | 10–12 | Hidden entrance, underground relays, archive timestamps |
| 05 — Belleğin Bedeli | 13–15 | Trust decision, core siege, Piko memory |
| 06 — Sahte Çıkış | 16–18 | False exit, identity archives, commander lock |
| 07 — Sessiz Filo | 19–21 | Telemetry paradox, fleet stealth, lost-name archive |
| 08 — Mor Sınır | 22–24 | Purple boundary, link damage, last archive defense |
| 09 — Hatırlayan Kule | 25–27 | Piko's autonomous choice, linked shields, three-wave finale |

## Save and play contracts
- At the end of each legacy stage, the parent validates and commits the original
  `mission{n}Complete` flag. An intermediate modal offers **continue** or **save and exit**.
- Starting an episode resumes at its *first incomplete* legacy stage. Replaying a
  fully completed episode starts at its first stage.
- Old saves do not require migration. The mission ordering and story unlocks remain;
  non-story Endless saves, inventory, economy and auth must be unaffected.
- Story choices in missions 4, 13, 17 and 23, and Piko's companion form in
  missions 25 and 27, must persist into subsequent scenes.
- Keep old standalone mission launches functional for legacy Story runtime and QA.

## Validation requirements
- Run full Chromium + WebKit story episode browser tests, including checkpoints,
  failed save retry, resumed old saves and cross-file 20→21 transitions.
- Run existing natural-play mission tests 1–27, including mission 27's Piko
  shield usage; no QA-forced completion substitutes for natural mechanics tests.
- Run full legacy 27-mission campaign + localization + Endless isolation tests,
  Firestore rules and iPad-sized smoke/visual checks.
- Block merge when required checks fail. Never retry or deploy production automatically
  as part of this story pacing work.

## Outstanding gameplay and art work
The grouped episodes reuse original rooms, puzzle steps and fights rather than adding
substantial new encounters. Playtime and pacing are **not** yet measured. Next iteration
should human-playtest each episode and enrich content where necessary to reach meaningful
8–12 minute standard episodes and longer climaxes, without artificial waits or grinding.
The visual Lost Signal overhaul, Piko redesign, Endless HUD, and replacement mini-games
are separate future workstreams.
