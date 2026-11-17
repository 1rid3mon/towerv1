# Mobile meta checkpoint — 2026-11-17

## Verified baseline

Main `5d3940dc400f81af58ce086302f0de18226e5d3e`; PR136 `2b5c0e436c8922e3e61376dfd631d8972d915973`. CI run43939589808 completed successfully. Full uploaded specification read through section16 in prior session. The prior session filesystem expired before push, so local-only work was reconstructed and retested.

## Architecture findings (M0)

- engine.js:4–9 existing crystal ledger is an in-memory anti-cheat allowance, not a durable transaction system. meta-model extends durable transactions for the existing Operations save domain.
- engine.js:1522–1570 existing V2 signature covers serializable state; reuse it for Operations. This is client tamper evidence, not server authority.
- endless-operations.js:29–101 Operations saves are account-scoped independent local keys; preserve them and migrate within the same envelope, backing up old progression first.
- ui.js:1609–1755 main save migration and Story isolation remain intact.
- data.js:312–347 actual combat consumes Operations bonuses; new ownership/equipped effects use this same hook.
- operations-center.css:2 actual cyan/amber/navy palette takes precedence over approximate PDF colors.
- Full spec overrides issue135 UTC assumption: local04 reset with legacy same-day claim protection.

## Currency decision

Battle gold remains separate from permanent Kredi. Existing battle crystals are untouched; station Sinyal Kristali is earned and kept in the account-scoped Operations envelope. No balance is silently merged across different save scopes. Existing four gear groups and24 items remain available; archive adds a single-weapon loadout.

## Verified core package

`node --test security-lab/meta-model.test.js`:16 pass. Covers field-wise sanitization, legacy24 gear/four groups/30tiers, local04 migration, same transaction replay, currency delta audit, rollback, deterministic summoning, per-item copy fusion, two free/six unique skill slots, offline12h cap, daily6/7 gap, return20d/30d cooldown, season premium catch-up. No UI claim made for this core-only checkpoint.

## Environment limits

Local Chromium cannot create a Unix socket (Operation not permitted). Prior cloud-browser attempt could not reach local server. New three-size browser job will retain screenshots on CI. Physical Android30-minute performance, rotation/cutout/back gestures, haptics and audio remain unverified; Android packaging remains last.
