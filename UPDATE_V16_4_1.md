# Minecraft Web V16.4.1 — Java Parity Repair + Audit

V16.4.1 is the follow-up repair pass after V16.3. It focuses on the concrete gameplay/UI regressions visible on phone and desktop while keeping the existing save/chunk format compatible.

## Implemented in this pass

### Inventory and recipe book

- The Java inventory/crafting container keeps the original 176×166 logical coordinate system but now scales responsively instead of letting fixed-size item visuals drift away from the Java slots.
- 3D block inventory items are scaled from the actual rendered container size and centered in their assigned Java slots.
- Stack counts scale with the GUI instead of staying at a fixed tiny size.
- The inventory window is larger on desktop while still fitting landscape phones.
- The recipe drawer no longer uses `right: calc(100% + 8px)` as its only desktop positioning strategy. It is measured against the real visual viewport and placed on whichever side has room; if neither side has room it becomes a bounded overlay inside the viewport.
- Recipe results use a compact Java-style icon grid and preserve the existing recipe-click/auto-fill behavior.
- The Java Edition strip on the title screen is enlarged/repositioned.
- World-loading presentation uses one cover image instead of a low-resolution repeating background.

### Block breaking and foliage

- Java 26.1 `destroy_stage_0..9` art is treated as an alpha mask. Visible crack pixels are dark and transparent; the underlying block color is not replaced by a gray veil.
- The destroy-stage loader is self-contained in V16.4.1 and does not depend on private helpers from another patch IIFE.
- The legacy `oak_leaves_opaque` helper no longer fills transparent leaf texels with a dark interior. Fancy leaves remain alpha-cutout.

### Water

- Added a real fluid tick queue layered over the current block format.
- Water prioritizes downward flow when a block below water is broken.
- Water spreads horizontally with levels 1–7 and uses a falling-water state.
- Unsupported flowing water recedes.
- Source water remains stable.
- Flow metadata changes the rendered water surface height instead of drawing every water block as a full cube.
- Existing ocean chunks are rebuilt after the water system initializes so source surfaces use the new height.

### Terrain, caves and vegetation

- Terrain now combines continentalness, erosion, ridge/peak noise, river cuts and local detail instead of only a small base-height noise stack.
- Cave generation now combines the previous caves with larger cheese cavities, worm/tunnel fields and ravine-like cuts.
- Tree generation explicitly rejects terrain at/below sea level and requires air above the grass surface, preventing underwater trees.
- Existing V14.3 villages/stronghold hooks remain in the generation chain.
- Added the `village` diagnostic/runtime command to locate the nearest deterministic plains-village candidate.

### Combat and passive mobs

- Combat targeting no longer creates a `Box3` from every mob model on every target test. It uses reusable ray/box objects and numeric entity bounds, removing the expensive scene traversal from the attack hot path.
- Java attack strength/cooldown remains weapon-speed based.
- Falling attacks at near-full cooldown can become critical hits with 1.5× damage and critical particles.
- Attack hits record `lastHurtAtV14` / attacker data so the existing Java passive AI enters its panic/run-away goal correctly.
- A safety panic path covers passive entities that are attached to another behavior planner.
- The Java attack indicator is updated from the active combat cooldown.

### Held items and movement animation

- Sticks, tools, bows and other flat hand-held items route through the existing pixel-extrusion geometry path instead of remaining flat sprites.
- Shield has a separate three-dimensional held model with a front texture and physical thickness/handle.
- Crouch camera height is eased instead of snapping immediately.
- The crouch eye offset now feeds `PlayerCameraV12`, which previously bypassed the smoothed `Player.eyePosition()` path.
- Third-person walking animation time is scaled by actual horizontal speed.
- Third-person swimming applies a swim clip when available and a horizontal fallback pose when it is not.
- Crouching retains the animation clip path and has a pose fallback.

### Audio

- Movement now emits block-category step events for grass, gravel/dirt, sand, snow, wood, glass and stone-family blocks.
- Entering water produces a splash event.
- Movement through water produces repeated swim/swish events based on distance traveled.

### Photon

- V16.0 intentionally disabled Photon cloud/post/water/shadow contributions in favor of the vanilla sky. That was the direct reason the Photon option could appear to do nothing.
- V16.4 restores the V15.2 Photon Gauntlet when the selected Photon profile is not Off, while leaving the canonical Java day/night state in charge of the base sky.
- Photon cloud visibility, post enablement, cloud-shadow strength and water strength are protected from the older V16.0 disable path while Photon is enabled.

### Build/cache

- Runtime build ID is `0.16.4.1`.
- `runtime-loader.js` loads both `110-v16-4-java-parity-runtime.js` and `111-v16-4-1-runtime-hotfix.js` after V16.3.
- Browser/PWA cache-busting keys were moved to `0.16.4.1`.
- The generated runtime bundle metadata is built from the full ordered source list and passes the repository's `node --check` build gate before the bundle is committed.

## Audit: what is still required for full Java-level parity

These are not cosmetic tasks; they are the remaining architectural gaps that keep the project from being a full Java-equivalent implementation.

### P0 — next implementation work

1. **Replace the 96-block vertical world format.** The current engine still has a `WORLD_HEIGHT` of 96, so it cannot reproduce modern Java's full vertical terrain range, deep caves or mountain scale. This requires chunk/save migration, section indexing, lighting changes and render-distance memory work.
2. **Persist fluid metadata.** V16.4 flow levels currently live in runtime metadata. The next fluid version should store levels/source/falling state in chunk data, serialize them, support infinite-source formation, waterlogging, lava, lava/water reactions and corner-height interpolation.
3. **Import the complete Java recipe/item registry.** The recipe book is now laid out correctly, but the game still uses the project's finite `RECIPES` table. Full Java crafting requires generated recipe JSON parsing, tags, shaped/shapeless/special recipes, furnace/smoker/blast-furnace recipes and unlock/category state.
4. **Move heavy chunk work off the main thread.** Terrain generation, cave carving, meshing and some entity work still compete with input/rendering. Web Workers + transferable typed arrays are needed for stable mobile frame time at higher view distances.
5. **Add a spatial entity broadphase.** Combat is cheaper now, but mob collision/AI still iterates larger collections in places. A chunk/grid spatial index should back target queries, collision, panic scans and entity activation.
6. **Finish exact Java inventory interactions.** Add shift-click, right-click split/place-one, double-click gather, hotbar number swapping, offhand slot, armor slot rules, tooltips, recipe categories/tabs and creative-inventory tabs/search.
7. **Make shield behavior real, not only the model.** Add raise/use timing, movement slowdown, frontal block cone, projectile deflection, axe shield-disable cooldown, durability and the correct first-/third-person blocking poses.

### P1 — gameplay parity

8. **Full combat rule set:** sweep attacks, sprint knockback, hurt-resistance frames, armor/toughness, enchantments, attack sounds/particles by strength and projectile/melee distinction.
9. **Full player movement state machine:** sprint-jump values, swimming acceleration, water drag, buoyancy, diving/surfacing, ladders/vines, crawling, elytra and exact pose/eye transitions.
10. **Java light engine:** skylight and block-light propagation with updates when blocks change. The existing lighting helpers are not a complete Java-style nibble light engine.
11. **Mob goal/pathfinding stack:** path nodes/A*, doors, water avoidance, temptation/follow-parent/breeding, grazing, flocking, hostile target priorities, line-of-sight memory and obstacle recovery.
12. **Villager systems:** professions, job-site POIs, beds, schedules, gossip/trading and village population rules.
13. **Complete block/item mechanics:** durability, tool mining tiers/speeds, furnaces, chests/inventory persistence, doors, slabs/stairs/fences, crops, beds, projectiles and status effects.
14. **Complete sound matrix:** per-block step/break/place/fall events, water enter/exit/splash intensity, cave ambience, weather loops and correct attenuation/random variants.

### P2 — world/content parity

15. **Modern noise-router world generation:** aquifers, carvers, cave biomes, ore veins, surface rules, biome climate routing and structure placement matching the selected Java data version.
16. **Structures:** real villages, mineshafts, dungeons, ruined portals, strongholds, monuments, temples and structure pieces from data instead of lightweight fallback stamps.
17. **Dimensions:** Nether and End generation, portals, dimension travel and dimension-specific lighting/fog.
18. **Redstone:** block updates, scheduled ticks, neighbor notifications, power propagation, pistons/repeaters/comparators and redstone components.
19. **Weather/biome effects:** rain/snow rendering, biome precipitation, fog/water/grass/foliage color behavior and weather audio.
20. **Photon/mobile shader validation:** profile-specific GPU budgets, extension fallbacks, post-process render-target scaling, thermal throttling and WebGL memory recovery on iPhone-class devices.

## Runtime checks

Useful diagnostic commands after boot:

- `v164` — V16.4 UI/water/combat/Photon state.
- `v1641` — V16.4.1 hotfix state, player model and water rebuild state.
- `village` — nearest deterministic village candidate.
- `photon152` — Photon Gauntlet diagnostics.
- `blocks163` — Java block/grass/glass/break-overlay diagnostics.

The next pass should start with P0 items 1–4 rather than adding more surface-level features, because those four remove the biggest engine-level limits on terrain, fluid correctness, crafting completeness and mobile performance.
