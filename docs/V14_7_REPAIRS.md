# Minecraft Web V14.7 Fidelity Repair

V14.7 keeps the V14.6 16x16x16 render-section, portal occlusion, prioritized scheduling, spatial index, AI throttling, instanced particles and adaptive mobile-performance foundation.

## Repairs

- Java sun/moon textures are alpha-cleaned and depth-tested against terrain. They fade out at the horizon instead of rendering through blocks.
- Block breaking uses Java destroy-stage textures as a transparent world-space overlay rather than the old gray screen-space fill.
- Java inventory/crafting screens are centered in the safe viewport and hide gameplay HUD controls while open. Camera-mode changes no longer create the large toast.
- Pickaxes, axes, swords, shovels, hoes and shears use lightweight native Three.js 3D geometry. The torch uses the Java texture with explicit torch UVs. White wool uses its local Java block texture.
- Java sheep body/head pivots were corrected. Passive animals get swept collision checks to prevent tunneling through solid blocks on long/mobile frames.
- Third-person player rendering gets a procedural walk/arm/head/attack fallback and a held-item attachment on the right arm.
- Java block sound events retain sounds.json resolution and add direct material-sample fallbacks for wood/grass/stone. This specifically covers log breaking.
- Background music is streamed at a quieter mobile default. Menu silence is randomized 1-30 seconds; after an in-game track ends, the next generic track is delayed 10-20 minutes.

## Mobile cost controls

The new systems are deliberately cheap: two celestial sprites, one crack-overlay mesh, small held-item meshes, local-player bone transforms, and swept animal collision only across the movement delta. V14.6 performance governance remains authoritative.

## Debug commands

- `visual147`
- `audio147`
- `anim147`
- existing V14.6 commands: `sections`, `occlusion`, `spatial`, `perf`
