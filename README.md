# Minecraft Web V16.7 — Java-style Particles + V16.6 Gameplay Systems

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current source target is **0.16.7**, with responsive desktop and mobile play including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → cached `runtime-bundle.js` generated from the ordered numbered source parts

V16.7 keeps the V16.6 Ender Dragon, Advancements and WebRTC LAN systems and adds `122-v16-7-particles.js` as the final ordered runtime layer.

## V16.7 Java-style particle engine

The old core `ParticleSystem` used a separate tiny Three.js cube mesh for every particle. V16.7 replaces that active runtime path with a client-only, pooled billboard batch designed to preserve Java-style visual behavior without putting particle state into world saves or server/LAN authority.

### Batched billboard rendering

- Standard particles are rendered through one `THREE.Points` draw batch instead of one mesh/draw call per particle.
- Fixed-capacity typed arrays store position, velocity, color/alpha, size, atlas tile, age/lifetime, gravity, drag and animation state.
- Active slots are dense. Deleting a particle moves the final active slot into the removed slot, so the engine does not leave sparse arrays or continuously allocate new particle objects.
- Touch/mobile devices use a 2,048-particle ceiling; desktop uses a 4,096-particle ceiling. Capacity overflow is dropped and counted instead of allocating without a limit.
- The shader uses point sprites, so every particle remains camera-facing without CPU-side per-particle billboard rotations.
- Transparent particles depth-test against the world but do not write depth.

### Java 26.1 particle atlas

V16.7 creates an 8×8 runtime particle atlas and asynchronously fills it from the local Java-facing assets already stored under `assets/java/26.1/particle/`.

The active atlas includes flame, bubble, splash frames, water/lava drip presentation, heart, critical hit, potion/effect frames, animated large smoke, bubble-pop frames, enchanted-hit, damage, sweep and spell assets. A deterministic fallback tile exists immediately so gameplay never waits for the asynchronous texture warm-up.

### Dynamic block fragments

- Block-break particles no longer have to use a generic white cube.
- The particle engine reserves eight atlas cells for runtime block fragments.
- On first use of a block type, V16.7 resolves the block's real texture through the existing block texture registry and asset resolver, samples a small random source patch, scales it with nearest-neighbor filtering and writes it into the particle atlas.
- Breaking a block emits gravity-driven fragments using that sampled block appearance.
- Sprinting across solid ground emits a smaller, throttled block-dust effect using the block below the player.
- The new `World.set` hook emits the textured debris when a loaded block becomes air and suppresses the immediately-following legacy generic mining burst, avoiding doubled particles.

### Particle behavior categories

The V16.7 public particle API supports `flame`, `campfire_cosy_smoke`, `bubble`, `bubble_pop`, `splash`, `dripping_water`, `dripping_lava`, `ambient_entity_effect`, `heart`, `critical_hit`, `enchanted_hit`, `damage`, `sweep`, `explosion` and textured `block` fragments.

- Flame rises with slight drift and fades.
- Campfire smoke uses the local animated large-smoke frames, grows while rising and is allowed to use the long-distance particle range.
- Bubbles use buoyancy and are removed when they leave water; leaving water can convert them into the short bubble-pop animation.
- Splash and block particles use ballistic gravity and cheap solid-block collision termination.
- Ceiling drips hang briefly, fall under gravity and disappear on contact with a solid block.
- Entity effects accept runtime tint colors and optional entity anchors.
- Hearts and combat particles can follow entity positions while retaining lightweight local motion.

Fire/campfire blocks themselves are not yet part of the current production block registry, so V16.7 exposes those particle types for gameplay systems without pretending automatic fire/campfire block emitters already exist.

### Automatic gameplay emitters

- Entering water emits a splash burst plus bubbles.
- Swimming/moving through water emits throttled bubbles/splashes.
- Fast grounded movement emits throttled block dust from the block under the player.
- A cheap periodic nearby ceiling scan can emit dripping water or lava when fluid is directly above a solid ceiling.
- Existing mining and combat calls remain compatible through `spawnBurst()` and `update()`.

### Particle performance settings

Particle mode is persisted locally and is available in the debug/options panel:

- **ALL** — normal particle creation.
- **DECREASED** — randomly skips roughly half of non-essential cosmetic spawns.
- **MINIMAL** — skips most non-essential particles while retaining important combat/explosion-class effects.

Normal particle spawns are rejected beyond **32 blocks** before entering the active batch. Explicit long-distance particles use a **96-block** range. These are client rendering limits only and do not alter world state.

Diagnostic command:

`particles167 [ALL|DECREASED|MINIMAL]`

It reports active/capacity counts, current mode, total spawns, capacity drops, distance/settings culls, collision kills, bubble pops, atlas readiness and dynamic block-texture tile usage.

V16.7 is a substantial client particle foundation, not a claim that every particle/emitter in current vanilla Java Edition has already been recreated.

## V16.6 Ender Dragon, Advancements and LAN multiplayer

V16.6 added `119-v16-6-ender-dragon.js`, `120-v16-6-advancements.js` and `121-v16-6-lan-multiplayer.js`.

### Ender Dragon boss

- Uses local Java 26.1 Ender Dragon, eye, fireball, End Crystal and crystal-beam textures.
- Multipart torso, head/jaw, linked neck/tail, two-segment wings and legs rather than one giant collision mesh.
- Procedural forward kinematics for wings plus a bounded history buffer for neck/tail bending.
- Split AABB hit regions and damage multipliers.
- Circle, strafe, charge, landing, perch, takeoff and death phases.
- Dragon fireballs, contact damage, 200-HP boss bar, death effects and XP rewards.
- Eight End Crystals, obsidian towers, crystal explosions and healing beams.
- Dragon defeat persistence per world seed.

### Java-style Advancements

- `assets/java/data/advancements-v166.json` contains the initial 36 browser-reachable/core progression nodes across Minecraft, Nether, The End, Adventure and Husbandry.
- Incomplete-only listener indexing and event criteria for inventory, crafting, mining, kills, dimensions, crystals, dragon defeat, biome visits and travel.
- World-specific progress, XP rewards, five-tab advancement tree, drag-panning, obtained/locked frames, tooltips and Java-style completion toasts.
- **L** on keyboard or **ADV** on touch opens the tree.
- The system is data-driven, but it is not yet every modern vanilla advancement trigger.

### Browser LAN multiplayer

- Real ordered/reliable WebRTC DataChannel using local ICE only (`iceServers: []`).
- One-time host-offer/joiner-answer code because browsers do not expose Java's UDP multicast LAN discovery APIs.
- Host-authoritative accepted remote-player state with movement/collision validation and correction packets.
- Immediate client prediction plus reconciliation.
- 20 TPS network snapshots and remote-player interpolation.
- Deterministic world seed, dimension and changed-block journal synchronization.
- Host-validated block break/place replication and ping diagnostics.
- Current scope is host + one remote browser; full shared mob/container/PvP authority and multi-peer rooms remain future work.

Diagnostics: `dragon`, `advancements`, `lan` and `particles167` cover the V16.6/V16.7 runtime additions.

## V16.5.1 player/render/kinematics hotfix

V16.5.1 preserves the 384-block section world and repaired the main presentation/compatibility regressions after the vertical-world migration:

- removes stale legacy 96-block chunks around bootstrap and regenerates modern sections when needed;
- guards first/third-person local avatar visibility against camera clipping;
- centers the Java attack cooldown indicator under the crosshair;
- generates front-facing pixel-extruded tools/items from Java textures;
- maps correct top/front/right faces for 3D inventory block icons;
- applies distance/speed-driven Minecraft-style limb kinematics plus bounded render-side leg IK where supported;
- anchors/tessellates Java-like clouds at public Java Y=192.

Diagnostic command: `v1651`.

## V16.5 architecture

V16.5 moved the project away from the old fixed-height/dense-world assumptions while preserving the working renderer, controls and Java asset stack.

Production layers include:

- `113-v16-5-modern-world-fluid.js`
- `114-v16-5-workers-lighting.js`
- `115-v16-5-java-data-inventory-combat.js`
- `116-v16-5-world-systems.js`
- `workers/world-worker-v165.js`
- `workers/mesh-worker-v165.js`

### World, generation and lighting

- Public Java-style coordinates: **Y = -64 through 319**.
- Internal compatibility range: **0 through 383**.
- 24 vertical 16×16×16 chunk sections with palette-backed on-demand storage.
- Worker-side deterministic terrain generation with caves, deepslate, lava, ores, sea level and vegetation.
- Worker-assisted section face extraction.
- Packed 4-bit Sky Light and Block Light with bounded propagation work.

### Fluids and gameplay systems

- Persistent water/lava metadata and flowing levels.
- Waterlogging metadata, infinite water source behavior and water/lava reactions.
- Generated Java recipe registry under `assets/java/data/recipes-v165.json`.
- Offhand/armor slots, Java-style inventory movement semantics and shield state.
- Armor-aware damage, sweep/sprint combat, swimming and buoyancy.
- Spatial entity broadphase, priority `GoalSelector`, A* navigation foundation and villager memory/activity/trading foundation.
- Structure-planning, scheduled block tick, dimension and weather foundations.

These systems are continuing parity foundations rather than claims that every modern Java rule is complete.

## Earlier fidelity base

V16.4/V16.4.2 supplied Java-style combat/HUD behavior, richer water flow/swimming, generated held tools/shields, Java UI repairs and mobile stability work. V16.3 made the local Java 26.1 block assets authoritative for the current voxel set, including real grass overlays, transparent glass and true-alpha destroy-stage crack overlays. V16.2/V16.1/V16.0 added the vanilla-fidelity sky/day-night path, square sun, Java clouds, desktop pointer lock and desktop controls.

## Java 26.1 is the Java-facing source of truth

Preferred asset root:

`assets/java/26.1/`

Important groups include title/panorama UI, widgets, colormaps, block textures, destroy stages, particles, moon/cloud assets and fonts. Older duplicate Java folders remain where compatibility modules still reference them.

## Java audio

The Java OGG compatibility library remains under:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

Gameplay audio continues to use that event tree rather than synthesizing replacement sounds where real local assets exist.

## Resource / graphics packs

Photon Web remains installed as optional/compatibility graphics code. Normal gameplay keeps the vanilla-fidelity sky, Java clouds, Java 26.1 block textures, water material, procedural sun and day/night lighting as the authoritative baseline so older Photon passes do not stack over the world.

## Current version

**Minecraft Web V16.7 — Java-style Particles + Ender Dragon + Advancements + LAN**  
Build **0.16.7**  
24 vertical sections • Java Y -64..319 coordinate model • worker terrain generation • worker-assisted meshing • packed Sky/Block Light • persistent fluids • batched billboard particles • Java 26.1 particle atlas • dynamic block debris • generated Java recipe registry • offhand/armor/shield semantics • sweep/sprint combat • swimming/buoyancy • spatial entity broadphase • GoalSelector/A* foundation • structure/dimension/weather foundations • Java 26.1 assets • Three.js voxel engine • responsive desktop/mobile controls
