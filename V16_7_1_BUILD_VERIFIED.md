# Minecraft Web V16.7.1 — Verified hotfix build

V16.7.1 is the held-item, inventory drag, block-item rendering and spawn-stability repair after V16.7 particles.

## Fixed

- Inventory drag/drop no longer calls the transaction API with a missing target slot. The V15.9 regression that produced `TypeError: undefined is not an object (evaluating 'slot[0]')` is guarded and the correct `(stack, sourceSlot, targetSlot)` signature is restored.
- Held torches use the local Java 26.1 `torch.png` with Java template-torch proportions. The view-model mesh remains hidden until the actual texture is attached, so it cannot flash as a white torch.
- Dropped torches use the same Java geometry/texture path at a smaller world-item scale.
- Pickaxes and other generated tools are repositioned closer to the center of the player hand.
- The first-person arm remains visible with held items and continues through the existing isolated view-model rendering/lighting path.
- Current block items use explicit Java 26.1 top/front/right faces in inventory, hotbar and containers, including grass side overlay/tint, logs, crafting table, furnace, TNT and glass.
- Fresh/new-world startup gets a short surface-position guard so the local player cannot begin embedded in or underneath generated terrain.
- Java clouds are kept drawable and anchored in X/Z while the procedural sun remains world-directional.

## Sun behavior

The sun should not be a nearby object with player-position parallax. Minecraft treats it as effectively infinitely distant: moving the player translates the sky/celestial rig with the camera, while the sun's direction is determined by the day/night cycle in world space, not by camera yaw. Looking around changes where the fixed world-space direction appears on screen, but does not rotate the sun around the player.

## Build verification

The cached runtime bundle builder completed successfully after the final source change, including `123-v16-7-1-hand-inventory-spawn-hotfix.js` in build `0.16.7.1`.
