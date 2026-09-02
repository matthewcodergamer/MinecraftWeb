# Minecraft Web V16.5.1 — Build Verification

This checkpoint records the V16.5.1 player/render/kinematics hotfix after the production runtime bundle was regenerated successfully.

## Production runtime

- Build: `0.16.5.1`
- Runtime source count: **66 ordered parts**
- Last hotfix parts:
  - `117-v16-5-1-player-render-kinematics.js`
  - `118-v16-5-1-stability-guard.js`
- Runtime bundle SHA-256: `9f10bdafd2f4a18cb90d876c74e77a2cb1c42a988ed9009b21d740d2cc3a7c81`
- GitHub Actions `Build cached Minecraft runtime bundle` run 27: SUCCESS
- Generated bundle commit: `52a4a194b6d394489731689a2bd291e6906c0299`

## Hotfix scope

V16.5.1 fixes the legacy 96-block chunks that could survive the V16.5 bootstrap and leave the player embedded in terrain, guards third-person camera/head clipping, centers the Java attack cooldown indicator, makes generated tools face the camera instead of exposing their thin edge, repairs Java block-item cube face mappings, locks/tile-scrolls clouds at the Java-style public cloud altitude, and adds procedural Minecraft-style FK with terrain-aware analytical/fallback IK.

The stability guard preserves non-tool held-item rendering and dedicated shield/torch/block model paths while keeping the new one-pixel generated extrusion for tools and sticks.

This file records build/CI verification. Device-specific visual behavior should still be checked on the target browser after deployment.
