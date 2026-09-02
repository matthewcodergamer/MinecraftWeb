# Minecraft Web V16.5.1 — Player Render + Kinematics Hotfix

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current production build is **0.16.5.1** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → cached `runtime-bundle.js` generated from the ordered numbered source parts

The V16.5.1 browser entrypoint, loader, PWA cache keys and runtime bundle are all on **0.16.5.1**.

## V16.5.1 player/render/kinematics hotfix

V16.5.1 is a focused compatibility and presentation repair on top of the V16.5 architecture. It preserves the 384-block section world, fluids, worker generation/meshing, Java data, lighting and gameplay systems while fixing the regressions visible after the vertical-world migration.

- **Modern-world bootstrap repair:** the original `Game` object is constructed before the numbered V16.5 patches execute, which could materialize legacy 96-block `ChunkData` around the initial player spawn. V16.5.1 detects and removes those stale chunks, rebuilds the V16.5 changed-block index, regenerates 24-section chunks, detaches stale render meshes, and moves the player to a safe surface only when the loaded position is embedded. This fixes the player appearing under/in the world and being unable to move.
- **Third-person camera guard:** first-person always hides the local body, while third-person temporarily hides the local avatar only if wall clipping collapses the camera into the head. Normal third-person keeps the avatar visible.
- **Centered Java attack cooldown:** the official Java `crosshair_attack_indicator_background`, `progress`, and `full` sprites are now positioned directly below the center crosshair. The 16×4 progress strip clips left-to-right as attack strength recharges, and the 16×16 ready icon replaces it at full strength.
- **Front-facing generated tools/items:** sticks, swords, pickaxes, axes, shovels, hoes, bows, arrows and shears use a one-texture-pixel-deep generated extrusion. First-person display rotation is nearly front-on instead of exposing the thin edge, and only opaque source pixels generate geometry, eliminating the see-through/glitched tool face.
- **Correct 3D inventory block faces:** inventory/hotbar cubes now use explicit Java 26.1 top/front/right face mappings for grass, logs, crafting tables, furnaces, TNT and the existing block set. Grass keeps an untinted side base with a biome-tinted side overlay; leaves retain foliage tint.
- **Minecraft-style forward kinematics:** player and supported humanoid mob limb motion uses the familiar distance/speed-driven cosine gait, alternating left/right legs and counter-swinging arms while respecting the translated model's bind pose.
- **Render-side inverse kinematics:** rigs that expose lower-leg/shin bones use a bounded analytical two-bone law-of-cosines solver. Single-segment Minecraft-style rigs fall back to cheap per-foot ground-contact correction, so the engine gains terrain awareness without forcing a heavyweight skeletal solver on every entity.
- **Java-like cloud coordinates:** the cloud plane is horizontally anchored to player X/Z, remains vertically locked at public Java Y=192 (internal V16.5 Y=256), tiles its 128-pixel mask across a 512-block plane instead of stretching one image, scrolls through UV offset, remains visible when the player flies above it, and does not participate in block-light/cloud-shadow calculations.
- Diagnostic command **`v1651`** reports legacy-chunk count, player/internal Java Y, camera/avatar visibility, attack cooldown state, cloud altitude/tiling, kinematics mode and generated-item facing.

## V16.5 architecture

V16.5 is the first large architecture pass that moves the project away from the old fixed-height/dense-world assumptions while deliberately preserving the working renderer, controls, Java 26.1 assets, gameplay systems and later section-based render pipeline.

The production V16.5 runtime layers are:

- `113-v16-5-modern-world-fluid.js`
- `114-v16-5-workers-lighting.js`
- `115-v16-5-java-data-inventory-combat.js`
- `116-v16-5-world-systems.js`
- `workers/world-worker-v165.js`
- `workers/mesh-worker-v165.js`

### 384-block / 24-section world foundation

- Public Java-style world coordinates cover **Y = -64 through 319**.
- The internal compatibility layer maps that range to **0 through 383** so the existing Three.js geometry, collision and section renderer can continue to operate without a destructive rewrite.
- Java sea level **62** maps internally to **126**.
- Each chunk is represented as **24 vertical 16×16×16 sections** instead of one permanently dense 16×384×16 allocation.
- Sections use palette-backed storage and are allocated on demand.
- Save migration understands the new V16.5 world descriptor and coordinate model.

### Terrain and generation workers

`workers/world-worker-v165.js` provides deterministic worker-side chunk generation with:

- 384-block vertical world generation
- caves
- deepslate transition
- deep lava
- ores
- sea-level mapping
- surface vegetation
- deterministic seeded terrain behavior

Generation can be prefetched around the player without tying the expensive terrain pass directly to the DOM or Three.js render thread.

### Worker-assisted section meshing

`workers/mesh-worker-v165.js` performs voxel face extraction away from Three.js and the DOM. The main runtime can prepare padded 18³ section data, send it to the worker, and receive compact face records for the existing renderer to turn into final geometry.

This keeps the mature section-oriented renderer instead of replacing the entire rendering stack.

### Java-style sky and block lighting

V16.5 adds packed 4-bit light storage using nibble arrays:

- Sky Light
- Block Light
- per-section light storage
- torch/glowstone/lava emission
- relight queues
- bounded propagation work per frame
- lighting-aware mesh vertex brightness

The worker/light layer now has the required V16.5 world descriptor and is part of the production source order.

### Persistent fluids

The modern world foundation adds persistent fluid state instead of treating water as a purely visual block:

- persistent water metadata
- persistent lava metadata
- flowing-fluid levels
- waterlogging metadata
- infinite water source behavior
- scheduled fluid updates
- water/lava reactions
- section/chunk dirtying after fluid changes

The implementation builds on the existing working water renderer rather than replacing it.

### Generated Java recipe registry

The repository now contains a generated Java recipe pipeline rather than relying only on the old tiny hard-coded `RECIPES` array.

Files:

- `tools/export-java-recipes.mjs`
- `.github/workflows/sync-java-recipes.yml`
- `assets/java/data/recipes-v165.json`

The exporter uses the public **PrismarineJS `minecraft-data`** registry to generate the recipe data used by the web runtime. The existing large Java item registry remains under `assets/java/data/items.json`.

### Inventory, offhand and armor semantics

V16.5 extends the inventory model with Java-style concepts including:

- main inventory + hotbar behavior
- offhand slot
- armor slots
- shift-click routing
- right-click stack splitting/placement behavior
- double-click collection behavior
- equipment-aware item movement
- shield equipment/blocking state

### Combat and player movement

The V16.5 gameplay layer adds or extends:

- shield blocking
- armor-aware incoming damage
- sweep attacks
- sprint attacks / sprint knockback behavior
- attack cooldown integration
- swimming state
- buoyancy and water movement

The existing combat and movement code remains in place where it is already functional; V16.5 layers Java-style behavior on top instead of rewriting it wholesale.

### Entity broadphase and AI architecture

The new entity/AI foundation includes:

- spatial entity broadphase indexing
- priority-based `GoalSelector`
- A* pathfinding/navigation foundation
- goal scheduling
- villager memory/activity/trading foundation
- preservation of existing working passive-AI behavior where it is already stronger

This is an independent recreation of Java-like AI architecture rather than copied proprietary Mojang source.

### Structures, dimensions and scheduled world systems

V16.5 also introduces foundations for:

- jigsaw-style structure planning
- scheduled block ticks
- neighbor updates
- redstone-oriented scheduled tick infrastructure
- preliminary Nether world container
- preliminary End world container
- precipitation/weather state
- rain/snow visual hooks

These systems are foundations for continued parity work; they are not a claim that every Java structure, redstone rule, Nether feature or End feature is already complete.

### Java item models and first-person rendering

The project already had a pixel-extrusion generator for held Java textures. V16.5 continues that architecture and adds/extends generated and extruded Java-style item models and first-person display transforms without copying Mojang rendering source.

The intended rule remains:

**use the real local Java item texture, recreate the geometry/runtime behavior independently, and preserve the existing working render path.**

## V16.5 build and deployment status

The first V16.5 bundle attempt exposed a source-list typo:

`98c-v14-8c3-java-ui-assets-fix.js`

The real file is:

`98c-v14-8c-java-ui-assets-fix.js`

That source-list error was corrected in commit:

`85592c758a3da877bd192a37d2fcac6009c48cb5`

After the correction:

- **Build cached Minecraft runtime bundle — run 23: SUCCESS**
- the workflow regenerated `runtime-bundle.js` for V16.5
- GitHub Actions committed the rebuilt bundle as `33b21cc4a5a8ea29aaefd2627ceb863274d8bc9e`
- **GitHub Pages deployment run 201: SUCCESS**

So V16.5 is now committed, bundled and deployed rather than remaining an unwired local architecture pass.

## V16.4 / V16.4.2 parity and stability base

V16.5 builds on the existing V16.4-era runtime rather than discarding it. That base includes Java-style combat/HUD behavior, richer water/swimming behavior, 3D held items and shields, Java UI/runtime improvements, performance/stability work, section rendering, lifecycle fixes and the Java 26.1 asset stack.

## V16.3 Java block fidelity

V16.3 made the actual local Java 26.1 block assets authoritative for the current voxel/block set and fixed inventory and destroy-stage presentation.

- **Core world block textures prefer `assets/java/26.1/blocks/` directly.**
- **Grass keeps the Java 26.1 biome tint path.**
- **Glass uses the actual Java 26.1 alpha texture at full frame opacity.**
- **Crafting tables and furnaces use their real front/top/side textures.**
- **Inventory and hotbar block items render as lightweight 3D Java-style cubes.**
- **Java destroy-stage textures are converted to true-alpha crack overlays.**
- Destroy-stage materials keep the original block visible underneath the crack pattern.

## V16.2 vanilla polish + gameplay

- Java Edition title strip sizing/centering improvements.
- Real local Java 26.1 grass and foliage colormaps.
- Real `grass_block_side_overlay.png` path.
- Vanilla Java cloud path made authoritative.
- Canonical 24,000-tick daylight/environment state.
- Procedural square sun retained as authoritative.
- Dedicated first-person depth pass.
- Desktop pointer-lock mouse-look path.
- Timed bread/apple eating with Java audio.

## V16.1 procedural square sun repair

- Procedural 1:1 square celestial sun.
- Old Java sun sprite suppressed.
- Warm sunrise/sunset transition.
- Tick mapping: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight.
- Terrain depth-tests the sun.
- Directional sunlight follows the sky direction.
- Java moon textures/phases remain available.

## V16.0 desktop + vanilla fidelity repair

- Desktop pointer lock and desktop-specific input path.
- Left mouse attack/mine, right mouse use/place, E inventory, C crafting, 1–9 hotbar.
- Java HUD sizing around the 182-pixel hotbar geometry.
- Vanilla Java sky/day/night authoritative over legacy Photon sky passes.
- Render-section sky exposure for caves/roofs.
- Java 26.1 Fancy cloud geometry.
- Generated tools and torch held/drop rendering use Java textures.

## V15.9 gameplay/render repair

- Java-style Select World screen.
- Quit Game stops runtime/audio state.
- PWA/background audio suspend behavior.
- Inventory drag-out/drop repair for touch/iOS.
- Q / Ctrl+Q item dropping plus mobile hold-to-repeat.
- Oxygen bubbles separated from armor/hearts.

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

**Minecraft Web V16.5.1 — Player Render + Kinematics Hotfix**  
Build **0.16.5.1**  
24 vertical sections • Java Y -64..319 coordinate model • worker terrain generation • worker-assisted meshing • packed Sky/Block Light • persistent fluids • generated Java recipe registry • offhand/armor/shield semantics • sweep/sprint combat • swimming/buoyancy • spatial entity broadphase • GoalSelector/A* foundation • structure/dimension/weather foundations • Java 26.1 assets • Three.js voxel engine • responsive desktop/mobile controls
