# Minecraft Web V16.3 — Java 26.1 Block Fidelity

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current build is **0.16.3** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → cached `runtime-bundle.js` generated from the ordered numbered source parts

## V16.3 Java block fidelity

V16.3 makes the actual local Java 26.1 block assets authoritative for the current voxel/block set and fixes the inventory and destroy-stage presentation.

- **Core world block textures now prefer `assets/java/26.1/blocks/` directly.** Grass, dirt, stone, sand, gravel, logs, leaves, planks, cobblestone, glass, ores, bedrock, water, torch, crafting table, bricks, obsidian, snow, glowstone, furnace and TNT no longer depend on the older Java compatibility texture directory as their primary source.
- **Grass keeps the V16.2 Java 26.1 biome tint path.** The grass top is biome-tinted, the dirt portion of the side remains untinted, and the real `grass_block_side_overlay.png` receives the same biome color as the top.
- **Glass uses the actual Java 26.1 alpha texture at full frame opacity.** Transparent texels remain transparent while the border pixels stay at their authored opacity instead of washing the entire block out with a global 42% material opacity.
- **Crafting tables and furnaces now include their real front/top/side textures** in the world atlas instead of showing one generic side on every lateral/top face.
- **Inventory and hotbar block items are rendered as lightweight 3D Java-style cubes.** Grass, dirt, stone, sand, gravel, logs, leaves, planks, cobblestone, glass, ores, crafting tables, bricks, obsidian, snow, glowstone, furnaces, TNT and white wool (when available) use the same local Java 26.1 face textures as the world. Grass/leaf cube faces receive the biome tint path and grass sides keep the untinted dirt base plus tinted overlay.
- **The Java destroy-stage textures are now true-alpha crack overlays.** The Java 26.1 files contain visually empty texels with alpha value 1; V16.3 converts those texels to alpha 0 before uploading the texture. Only the crack pixels render over the original block, so breaking no longer puts a gray/white veil across the entire block.
- **Destroy-stage materials use full crack opacity with transparent background, no depth writes, no fog and no tone mapping.** This keeps the original block texture/color visible underneath the Java crack pattern and works through the existing block-target breaking path.
- A new `blocks163` diagnostic command reports the active Java texture source, grass top/side/overlay URLs, glass alpha material state, number of 3D inventory block models and destroy-overlay material state.

## V16.2 vanilla polish + gameplay

- **The Java Edition title strip is larger and correctly centered beneath the Minecraft logo** with separate desktop, landscape-phone and portrait sizing.
- **Grass and oak foliage use the real local Java 26.1 colormaps.** `assets/java/26.1/colormap/grass.png` and `foliage.png` are sampled using the current simplified biome climate values instead of relying on hand-picked generic greens.
- **Grass sides use the real Java `grass_block_side_overlay.png` path.** The dirt/side base remains untinted while a second cutout quad receives the same biome grass tint as the top face.
- **Java clouds are forced into the authoritative vanilla render path.** The old Photon compatibility pass can no longer leave the Java cloud mesh hidden at draw time.
- **Daylight is brighter and uses one final canonical 24,000-tick environment state.** The sky, fog, HemisphereLight, directional sun, moon contribution and material response are synchronized immediately before the real world draw.
- **The V16.1 procedural square sun remains authoritative**, with the legacy PNG sun hidden. The Java moon sprite remains opposite the canonical sun direction and depth-tested.
- **The first-person arm uses the earlier V7 proportions** while remaining Lambert-lit by the world.
- **The first-person view model renders in a dedicated second depth pass** so water behind the hand/held item cannot incorrectly tint or cover it.
- **Desktop pointer-lock mouse look uses one capture path** with a Java-style cubic sensitivity response.
- **Bread and apples have a timed eating action** with view-model animation, Java chew/burp sounds, hunger and saturation restoration.

## V16.1 procedural square sun repair

- The visible sun is generated procedurally as one 1:1 square celestial quad rather than relying on an asynchronously loaded PNG.
- The old Java sun sprite is suppressed every celestial update.
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
- `assets/java/26.1/blocks/grass_block_top.png`
- `assets/java/26.1/blocks/grass_block_side.png`
- `assets/java/26.1/blocks/grass_block_side_overlay.png`
- `assets/java/26.1/blocks/glass.png`
- `assets/java/26.1/blocks/destroy_stage_0.png` through `destroy_stage_9.png`
- `assets/java/26.1/environment/celestial/moon/`
- `assets/java/26.1/environment/clouds.png`
- `assets/java/26.1/font/`

Older duplicate Java folders remain only where compatibility modules still reference them.

## Java audio

The working Java OGG compatibility library remains under:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

The existing Java event tree is used for gameplay sounds rather than adding synthesized replacements.

## Resource / graphics packs

Photon Web remains installed as optional/compatibility graphics code. Normal gameplay uses the vanilla-fidelity sky, Java clouds, Java 26.1 block textures, water material, procedural sun and day/night lighting as the authoritative path so legacy Photon passes do not stack over the world.

## Current version

**Minecraft Web V16.3 — Java 26.1 Block Fidelity**  
Build **0.16.3**  
Java 26.1 block assets • Java biome colormaps • 3D inventory block items • transparent Java destroy stages • Minecraft Seven UI • Three.js voxel engine • responsive desktop/mobile controls