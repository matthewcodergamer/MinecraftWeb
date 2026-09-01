# Minecraft Web V16.2 — Java 26.1 Vanilla Polish + Gameplay

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current build is **0.16.2** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → cached `runtime-bundle.js` generated from the ordered numbered source parts

## V16.2 vanilla polish + gameplay

V16.2 is a focused visual/gameplay repair after desktop and mobile gameplay testing.

- **The Java Edition title strip is larger and correctly centered beneath the Minecraft logo** with separate desktop, landscape-phone and portrait sizing.
- **Grass and oak foliage now use the real local Java 26.1 colormaps.** `assets/java/26.1/colormap/grass.png` and `foliage.png` are sampled using the current simplified biome climate values instead of relying on hand-picked generic greens.
- **Grass sides now use the real Java `grass_block_side_overlay.png` path.** The dirt/side base remains untinted while a second cutout quad receives the same biome grass tint as the top face, fixing the top-versus-side mismatch.
- **Java clouds are forced into the authoritative vanilla render path.** The old Photon compatibility pass can no longer leave the Java cloud mesh hidden at draw time. The Java Y=192 cloud geometry is translated to a visible height appropriate for this engine's compressed world height while preserving the real Java coverage geometry and white daytime color.
- **Daylight is brighter and uses one final canonical 24,000-tick environment state.** The sky, fog, HemisphereLight, directional sun, moon contribution and material response are synchronized immediately before the real world draw.
- **The V16.1 procedural square sun remains authoritative**, with the legacy PNG sun hidden. The Java moon sprite is explicitly positioned opposite the canonical sun direction and remains depth-tested.
- **The first-person arm returns to the earlier V7 proportions** rather than the undersized V16 skin cuboid, but it remains a Lambert-lit world-reactive material.
- **The first-person view model is rendered in a dedicated second depth pass.** Hand/held items no longer get visually covered or recolored by transparent water that is physically behind them. World lights are enabled on the view-model layer so the hand still follows day/night lighting.
- **Desktop pointer-lock mouse look is routed through one capture path** using the Java-style cubic sensitivity response. This prevents the older mouse listener from applying a second rotation and keeps camera speed stable.
- **Food now has a timed eating action.** Bread and apples take about 1.61 seconds, animate the first-person view model, play Java `entity.generic.eat` chew events and `entity.player.burp`, then consume the item and restore hunger/saturation.
- A new `v162` diagnostic command reports environment state, cloud visibility/height, Java grass/foliage tint samples, grass-side overlay availability, mouse sensitivity, eating state and view-model layer state.

## V16.1 procedural square sun repair

- The visible sun is generated procedurally as one 1:1 square celestial quad rather than relying on an asynchronously loaded PNG.
- The old Java sun sprite is suppressed every celestial update, preventing the brief square-sun → yellow/pink old-sprite swap.
- The square stays near-white in daylight and warms toward sunrise/sunset.
- Tick 0 is sunrise, 6000 noon, 12000 sunset and 18000 midnight.
- The sun remains depth-tested so terrain and blocks occlude it.
- Directional sunlight follows the same sky direction.
- The moon remains texture-backed so Java moon phases remain available.

## V16.0 desktop + vanilla fidelity repair

- Desktop gameplay uses pointer lock and hides touch-only controls on fine-pointer devices.
- Left mouse uses attack/mining, right mouse uses/places, E opens inventory, C opens crafting, and 1–9 select hotbar slots.
- Java HUD rows are laid out around the 182-pixel Java hotbar geometry and scale from the visual viewport.
- Vanilla Java sky/day/night is authoritative over the older Photon sky stack.
- Render-section sky exposure makes roofs/caves darker than exposed terrain.
- Java 26.1 Fancy cloud geometry is used instead of Photon volumetric clouds in the vanilla path.
- Generated tools use real Java item textures for held and dropped 3D geometry.
- Torch held/drop rendering uses Java torch texture/geometry.

## V15.9 gameplay/render repair

- Singleplayer opens a Java-style Select World screen.
- Quit Game stops the active runtime/audio state.
- PWA/background audio suspends on hide/pagehide/freeze.
- Inventory drag-out/drop is repaired for touch/iOS.
- Q drops one item, Ctrl/Meta+Q drops a stack, and mobile has hold-to-repeat dropping.
- Oxygen bubbles are separated from armor/hearts.

## Java 26.1 is the Java-facing source of truth

The preferred Java asset root is:

`assets/java/26.1/`

Important assets include:

- `assets/java/26.1/gui/title/minecraft.png`
- `assets/java/26.1/gui/title/edition.png`
- `assets/java/26.1/gui/title/background/panorama_*.png`
- `assets/java/26.1/gui/sprites/widget/button.png`
- `assets/java/26.1/gui/sprites/widget/button_highlighted.png`
- `assets/java/26.1/colormap/grass.png`
- `assets/java/26.1/colormap/foliage.png`
- `assets/java/26.1/blocks/grass_block_side_overlay.png`
- `assets/java/26.1/environment/celestial/moon/`
- `assets/java/26.1/environment/clouds.png`
- `assets/java/26.1/font/`

Older duplicate Java folders remain only where compatibility modules still reference them.

## Java audio

The working Java OGG compatibility library remains under:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

V16.2 uses the existing Java event tree for eating sounds rather than adding synthesized replacements.

## Resource / graphics packs

Photon Web remains installed as optional/compatibility graphics code. Normal gameplay uses the vanilla-fidelity sky, Java clouds, water material, procedural sun and day/night lighting as the authoritative path so legacy Photon passes do not stack over the world.

## Current version

**Minecraft Web V16.2 — Java 26.1 Vanilla Polish + Gameplay**  
Build **0.16.2**  
Java 26.1 assets • Java biome colormaps • Minecraft Seven UI • Three.js voxel engine • responsive desktop/mobile controls • procedural square sun • animated eating
