# Minecraft Web V15 — Java UI Overhaul

Minecraft Web Alpha **0.15.0** is a browser-based Minecraft Java-first client/runtime built on Three.js, with WebGPU/WebGL2 rendering work, Photon Web graphics work, responsive mobile controls, and Java Edition-style menus/assets.

V15 focuses on reorganizing the client around the **Minecraft Java Edition 1.21.x UI flow** while preserving the existing MinecraftWeb engine underneath.

The live GitHub Pages runtime is `index.html` → `runtime-loader.js` → the ordered numbered source parts at the repository root.

## V15 Java UI Overhaul

### Main Menu

The title screen now follows the Java Edition structure:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game

Resource Packs, GPU/debug controls, and other engine settings are no longer separate title-screen buttons. Java Edition branding is positioned tightly beneath the Minecraft logo using Java assets from PrismarineJS.

### Options

The Java-style Options screen contains:

- FOV
- Online
- Skin Customization
- Music & Sounds
- Video Settings
- Controls
- Language
- Chat Settings
- Resource Packs
- Accessibility Settings

Engine-specific graphics configuration is organized under **Video Settings** rather than being exposed on the title screen.

### Video Settings / Photon

The V15 Video Settings UI includes Minecraft-facing and engine-facing controls for graphics quality, render distance, simulation distance, clouds, smooth lighting, entity shadows, brightness, GUI scale, Photon profiles, renderer selection, anti-aliasing and related graphics diagnostics.

The renderer remains built around Three.js with the existing WebGPU/WebGL2 work underneath MinecraftWeb. Photon Web is an in-progress graphics layer rather than a claim of compatibility with the original Minecraft Java shader/mod.

### Resource Packs

Resource Packs are now accessed through **Options → Resource Packs...**. The existing MinecraftWeb pack manager is retained and its layout is adjusted for desktop, iPhone portrait and short landscape displays.

Photon Web remains the current built-in optional graphics/resource profile. Future pack work may include additional animation, physics, lighting and visual systems as they are implemented.

### Create New World

V15 adds a Java-style world-creation flow with:

- Game / World / More tabs
- World name
- Survival / Hardcore / Creative selection
- Difficulty
- Commands
- Seed
- Generate Structures
- Bonus Chest
- Game Rules

The Game Rules screen includes MinecraftWeb settings such as Keep Inventory, Mob Griefing, Fire Tick, Mob Spawning, Daylight Cycle, Weather Cycle, damage rules, natural regeneration, immediate respawn, sleep percentage, spawn radius and random tick speed.

### Pause Menu

The Java-style Game Menu includes:

- Back to Game
- Advancements
- Statistics
- Give Feedback
- Report Bugs
- Options...
- Open to LAN
- Save and Quit to Title

Unsupported network/service features remain visible where needed for Java UI parity but are not presented as implemented functionality.

### Loading / Runtime

V15 replaces the generic black boot presentation with a Java-style dirt loading screen. Runtime source parts are fetched concurrently and then assembled in their required execution order to reduce startup waiting while preserving dependency order.

### Responsive iPhone + Desktop UI

V15 continues to target Safari/iPhone as well as desktop browsers:

- safe-area-aware menus and controls
- responsive portrait and landscape layouts
- internally scrollable Options/Resource Pack screens
- bottom-pinned hotbar
- reduced landscape UI scale on short displays
- standalone PWA layout

## Java Assets

Java-facing assets are sourced through the project's Java asset pipeline, primarily from the PrismarineJS `minecraft-assets` data used by MinecraftWeb. Mojang/Bedrock sample resources remain part of the broader project where applicable to existing Bedrock-derived/runtime work.

`.github/workflows/build-java-runtime-assets.yml` runs `tools/build_java_runtime_assets.py` when the Java source/profile changes. It caches selected Java GUI, environment, entity, block, item and effect assets under `assets/java/`. Large music tracks remain streamed instead of being committed into the cache.

Safari requires a user gesture before audio can begin, so title/runtime audio may begin only after the first tap or key interaction.

## PWA

MinecraftWeb can be installed as a standalone web app. V15 uses Minecraft branding, standalone display metadata and the Java Edition launcher icon configuration for the favicon/Home Screen experience.

## Current Direction

V15 is primarily the **Java UI overhaul**. It does not mean every Java Edition system is already implemented. Existing world generation, renderer, entities, combat, inventory/crafting, audio and mobile systems continue underneath the new UI.

The next development stage is continued Photon Web graphics and gameplay/visual systems such as dynamic lighting, improved entity animation, physics effects, wakes and footprints as those systems are actually implemented and tested.

## Version

**Minecraft Web V15 — Java UI Overhaul**  
Alpha **0.15.0**  
Java-first UI • Three.js • Photon Web • Responsive iPhone/Desktop
