# Minecraft Web V16.6 — Build Verification

This checkpoint triggers the production runtime bundle, source ZIP, and GitHub Pages verification for V16.6 after the release wiring landed on `main`.

## Source scope

- Build target: `0.16.6`
- Ordered runtime source parts: 69
- New runtime layers:
  - `119-v16-6-ender-dragon.js`
  - `120-v16-6-advancements.js`
  - `121-v16-6-lan-multiplayer.js`
- Advancement registry: `assets/java/data/advancements-v166.json`

## V16.6 feature checkpoint

V16.6 adds the multipart Ender Dragon boss and End Crystal encounter, a data-driven Java-style advancement engine/tree/toast UI, and a two-browser host-authoritative WebRTC LAN foundation with 20 TPS snapshots, remote-player interpolation, client prediction/reconciliation and block journal synchronization.

The V16.6 source files and advancement JSON passed their individual syntax/JSON checks in the release-wiring workflow before being added to `runtime-loader.js`.

Final combined `runtime-bundle.js`, source ZIP artifact, and Pages deployment results are intentionally not recorded as successful here until their respective CI jobs complete.
