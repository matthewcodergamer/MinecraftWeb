# Minecraft Web V15.3 — Java 26.1 Asset Gauntlet + Photon Web

Minecraft Web Alpha **0.15.3** is a browser-based Minecraft Java-first client/runtime built on Three.js, with responsive mobile controls, Java Edition UI/assets, the existing voxel engine, and the Photon Web graphics translation layer.

The live GitHub Pages runtime is `index.html` → `runtime-loader.js` → the ordered numbered source parts at repository root.

## V15.3 Java 26.1 Asset Gauntlet

V15.3 applies the Gauntlet loop to the current PrismarineJS Java asset set:

1. inspect the real `PrismarineJS/minecraft-assets/data/26.1` tree
2. mirror the full version tree into MinecraftWeb
3. bind local Java assets into the existing Three.js runtime instead of replacing the voxel engine
4. translate Java-specific rendering behavior where the browser needs explicit geometry/material logic
5. keep diagnostics and upstream fallbacks so missing files are visible rather than silently substituted

The complete local mirror target is:

`assets/java/26.1/`

`.github/workflows/sync-java-26-1-assets.yml` and `tools/sync_prismarine_26_1_assets.py` mirror the entire PrismarineJS `data/26.1` directory, including its available block/item textures, GUI sprites, title assets, environment/celestial textures, entity textures, fonts, metadata, optimized atlases and other version data. MinecraftWeb resolves the local 26.1 mirror first; the PrismarineJS raw path is only an availability fallback while a fresh mirror is deploying.

The sync workflow also caches the current Java Edition game icon from Minecraft.net as `assets/branding/icon_javaedition.jpg`, which is used by the favicon, manifest and iOS Home Screen metadata.

## Java 26.1 Celestials

`98i-v15-3-java-26-1-assets.js` replaces the old generic celestial asset path with the actual PrismarineJS 26.1 Java assets:

- `environment/celestial/sun.png`
- `environment/celestial/moon/full_moon.png`
- `environment/celestial/moon/waning_gibbous.png`
- `environment/celestial/moon/third_quarter.png`
- `environment/celestial/moon/waning_crescent.png`
- `environment/celestial/moon/new_moon.png`
- `environment/celestial/moon/waxing_crescent.png`
- `environment/celestial/moon/first_quarter.png`
- `environment/celestial/moon/waxing_gibbous.png`

Sun and moon sprites stay camera-relative and rotate with world time. The bridge includes a conservative **edge-connected black-matte sanitizer**: only near-black pixels connected to the outer image border are removed. Interior dark pixels in the art are preserved, so background cleanup does not indiscriminately erase black detail.

The moon renderer changes the actual phase texture by world day instead of treating the moon as one fixed image.

## Java 26.1 Clouds → Three.js

The Java cloud path now reads the real:

`environment/clouds.png`

The texture is interpreted as Minecraft's repeating cloud coverage map rather than stretched across the sky as one billboard. MinecraftWeb translates it into a Fancy-style Three.js cloud mesh:

- fixed Java cloud height at **Y=192**
- each source cloud texel represents a **12×12** world footprint
- Fancy-style **4-block thickness**
- exposed top, bottom and side geometry
- no collision / no gameplay voxel occupancy
- westward world-space drift
- camera-centered finite mesh window so mobile does not build the entire 3072×3072 repeated pattern at once
- storm/weather darkening
- normal perspective + fog handles the distant horizon

This preserves the Java cloud pattern while keeping geometry appropriate for iPhone/desktop WebGL.

## Java 26.1 GUI and Title Assets

The Java-facing menus now bind against the local 26.1 GUI assets, including:

- `gui/title/minecraft.png`
- `gui/title/edition.png`
- `gui/title/background/panorama_*.png`
- `gui/sprites/widget/button.png`
- `gui/sprites/widget/button_highlighted.png`
- `gui/sprites/widget/button_disabled.png`
- the rest of the GUI tree supplied by PrismarineJS 26.1

The title therefore uses the 26.1 Minecraft logo with the Java Edition artwork directly below it, while Options/resource-pack/world screens can consume the mirrored Java GUI sprites rather than custom approximations.

The boot/loading screen also points at the local Java 26.1 panorama and keeps the Java-style framed green progress bar.

## Java Block Breaking

`98j-v15-3-java-breaking-overlay.js` translates the real Java 26.1 destroy-stage textures:

`blocks/destroy_stage_0.png` through `blocks/destroy_stage_9.png`

The crack stage is now a **transparent overlay over the original block**, rather than a gray replacement material. The underlying grass, dirt, stone, log, ore or other block texture remains visible while the crack pattern advances. The overlay uses depth testing, no depth write, polygon offset and normal alpha blending to avoid the previous gray/washed-out appearance.

## Java Asset Runtime Bridge

Use the diagnostic command:

`java261`

It reports the active Java version, local/upstream asset roots, celestial paths and Java cloud parameters.

For the break overlay use:

`break261`

This reports the destroy-stage source and active overlay settings.

## Photon Web V15.2 Gauntlet — Preserved

The V15.2 Photon Web pass remains installed underneath V15.3. It includes the source-informed Photon cloud families, cloud-shadow modulation, atmosphere/fog work, depth-aware AO approximation, water motion, bloom/color response and mobile quality profiles. V15.3 does not remove or replace those systems; the Java asset bridge gives the vanilla/Java-facing renderer better source assets while Photon remains an optional graphics layer.

The Photon archive translation remains browser-native rather than binary Iris/OptiFine compatibility.

## Java UI / Options

The Java-style UI hierarchy remains:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game

Resource Packs and rendering controls remain under Options. The UI is safe-area aware and responsive for iPhone portrait, short iPhone landscape, iPad and desktop layouts.

## PWA

V15.3 switches the manifest/favicon/Home Screen configuration to the locally cached Java Edition icon. The runtime, stylesheet and manifest URLs are versioned to `0.15.3` to reduce stale Safari/PWA caching after deployment.

## Asset-source policy

For Java Edition presentation and data, V15.3 prefers the local PrismarineJS 26.1 mirror. Existing Bedrock-derived systems may continue using Mojang Bedrock Samples where they already do so. MinecraftWeb does not silently replace a failed Java asset with an unrelated random image.

## Version

**Minecraft Web V15.3 — Java 26.1 Asset Gauntlet + Photon Web**  
Alpha **0.15.3**  
Java 26.1 assets • Three.js voxel engine • Photon Web • Responsive iPhone/Desktop
