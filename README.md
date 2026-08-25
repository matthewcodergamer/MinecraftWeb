# Minecraft Web V15.1 — Java UI + Photon Web 1.3b Translation

Minecraft Web Alpha **0.15.1** is a browser-based Minecraft Java-first client/runtime built on Three.js, with WebGPU/WebGL2 rendering work, responsive mobile controls, Java Edition-style menus/assets, and an evolving Photon Web graphics layer.

The live GitHub Pages runtime is `index.html` → `runtime-loader.js` → the ordered numbered source parts at repository root.

## V15 Java UI Overhaul

The title screen follows the Java Edition structure:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game

Resource Packs and engine graphics controls are accessed through the Java-style Options hierarchy instead of separate title-screen buttons.

The Options UI contains FOV, Online, Skin Customization, Music & Sounds, Video Settings, Controls, Language, Chat Settings, Resource Packs and Accessibility Settings. Video Settings is the home for MinecraftWeb renderer, WebGPU/WebGL2, AA, Photon and performance settings.

V15 also adds Java-style Create New World, Game Rules and pause-menu flows, while preserving the existing MinecraftWeb world engine underneath.

## Photon Web 1.3b Study / Translation Layer

V15.1 begins translating systems from the user-supplied **Photon Shaders v1.3b** archive by Benjamin Stott / SixthSurge into native Three.js/WebGL systems.

The supplied archive was inspected as a shader-pack reference rather than treated as directly executable browser code. It contains hundreds of Iris/OptiFine shader files and includes systems for atmosphere, multiple cloud families, cloud shadows, AO/GTAO, skylight, water, weather, post-processing, ACES tonemapping, LPV/colored lighting, bloom, TAA/FXAA, motion blur, depth of field and other effects.

The first V15.1 translation module is `98g-v15-1-photon-1-3b-port.js`.

Currently translated/connected:

- Photon-derived profile values for shadow resolution/distance and mobile quality tiers.
- Camera-relative atmospheric sky shell.
- Procedural multi-octave cloud layer based on Photon cloud architecture rather than the old stretched cloud PNG approach.
- Day/night and sunrise/sunset atmospheric response.
- Weather darkening hook for clouds and atmosphere.
- Cloud-shadow-ready sun/lighting configuration.
- Three.js PCF soft-shadow profile configuration.
- Source-derived diagnostics exposed through the `photon13` debug command.
- Existing MinecraftWeb ACES/sRGB pipeline retained.

This is a **Three.js translation**, not binary compatibility with Iris/OptiFine. Compute shaders, Iris-specific G-buffer layouts, LPV passes, full GTAO, SSR, volumetric raymarching, bloom and temporal passes still require dedicated browser-native implementations and are not claimed complete.

Photon's supplied license is retained at `licenses/PHOTON_SHADERS_LICENSE.txt` because the project is examining and adapting ideas/settings from the supplied source.

## Loading / Java Presentation

V15.1 upgrades the boot/loading presentation:

- Replaces the bright repeating low-resolution dirt backdrop with a darker Java Edition panorama background from the PrismarineJS Java asset set.
- Uses a Java-style framed green loading bar instead of the previous plain progress strip.
- Uses Minecraft-style font fallbacks and pixel-aligned text treatment for the boot UI.
- Keeps the staged concurrent source loading introduced in V15 so the title/runtime can appear faster.
- Cache-busts the V15.1 runtime, manifest and styles so iOS Safari does not keep the previous V15 boot assets unnecessarily.

## Resource Packs

Resource Packs are accessed through **Options → Resource Packs...**. Photon Web remains the current built-in optional graphics profile. The pack manager is responsive for desktop, iPhone portrait and short iPhone landscape layouts.

## Java Assets

Java-facing assets are sourced primarily through the project's PrismarineJS `minecraft-assets` pipeline. Mojang Bedrock samples remain part of the broader project where existing Bedrock-derived/runtime systems use them.

`.github/workflows/build-java-runtime-assets.yml` runs `tools/build_java_runtime_assets.py` when the Java source/profile changes. It caches selected Java GUI, environment, entity, block, item and effect assets under `assets/java/`. Large music tracks remain streamed instead of being committed into the cache.

Safari requires a user gesture before audio can begin, so title/runtime audio may begin only after the first tap or key interaction.

## Responsive iPhone + Desktop UI

MinecraftWeb continues to target iPhone Safari and desktop browsers:

- safe-area-aware menus and controls
- responsive portrait and landscape layouts
- internally scrollable Options/Resource Pack screens
- bottom-pinned hotbar
- reduced landscape UI scale on short displays
- standalone PWA metadata

## PWA

MinecraftWeb can be installed as a standalone web app. V15.1 keeps Minecraft branding and the Java Edition launcher icon configuration for favicon/Home Screen use. The manifest start URL is versioned to reduce stale iOS PWA caching after updates.

## Current Direction

V15.1 is the first source-informed Photon implementation pass. The next graphics work should continue the Gauntlet-style loop: inspect a Photon subsystem, translate it into a browser-native Three.js/WebGL implementation, test it against MinecraftWeb performance and visuals, then keep only the version that passes the game/runtime checks.

Priority Photon systems after this pass:

1. cloud structure/coverage and cloud shadows
2. improved atmospheric scattering and fog
3. GTAO/ambient occlusion
4. water shading/reflections
5. bloom and color grading
6. temporal/AA improvements
7. optional dynamic/colored lighting paths

## Version

**Minecraft Web V15.1 — Java UI + Photon Web 1.3b Translation**  
Alpha **0.15.1**  
Java-first UI • Three.js • Photon source-informed graphics • Responsive iPhone/Desktop
