# Minecraft Web V15.2 — Java UI + Photon Web Gauntlet

Minecraft Web Alpha **0.15.2** is a browser-based Minecraft Java-first client/runtime built on Three.js, with responsive mobile controls, Java Edition-style menus/assets, and a source-informed Photon Web graphics layer.

The live GitHub Pages runtime is `index.html` → `runtime-loader.js` → the ordered numbered source parts at repository root.

## Photon Web V15.2 Gauntlet Pass

V15.2 continues the Gauntlet loop against the user-supplied **Photon Shaders v1.3b** archive by Benjamin Stott / SixthSurge:

1. inspect the original Photon subsystem and settings
2. identify what can be translated safely to a browser renderer
3. implement a native Three.js/WebGL equivalent
4. syntax-check and integrate it without replacing the voxel engine
5. expose diagnostics and keep mobile performance profiles

The new browser-native pass is `98h-v15-2-photon-gauntlet.js` and builds on the earlier V15.1 study layer.

### Photon runtime asset

The supplied archive contains a 512×512 RGBA noise texture used by Photon. V15.2 commits a mobile-friendly 256×256 runtime derivative generated from `shaders/image/noise.png`:

- `assets/photon/noise-256.png`

The smaller derivative keeps the browser download lighter for iPhone while preserving Photon's source noise structure. The original uploaded archive remains the source reference. Photon’s supplied license remains at `licenses/PHOTON_SHADERS_LICENSE.txt`.

### Cloud system

V15.2 replaces the single generic Photon cloud shell with a layered browser translation based on Photon's cloud families and source defaults:

- cumulus
- altocumulus
- cirrus
- noctilucent clouds
- independent wind directions and speeds
- source-informed coverage, density and detail values
- day/night lighting response
- sunrise/sunset warm scattering
- rain darkening
- mobile quality tiers controlling how many layers are rendered

The local Photon-derived `noise-256.png` is sampled when available. The shader keeps a procedural noise fallback only so a failed asset request cannot crash startup.

### Cloud shadows

V15.2 adds world-space moving cloud-shadow modulation to compatible Three.js terrain materials. The shadow pattern moves independently of the camera, is profile-scaled, and uses Photon's default cloud-shadow intensity as the Ultra target. Materials are patched once and reused instead of creating per-block lights or meshes.

### Atmosphere and fog

The browser atmosphere now uses source-informed Rayleigh/Mie behavior:

- day/night color transition
- stronger dawn/evening haze
- rain and snow fog response
- weather-colored horizon fog
- profile-dependent density

Photon's precomputed atmosphere lookup data was inspected in the supplied archive, but it is not claimed as directly executable by Three.js in this pass.

### GTAO / ambient occlusion

V15.2 adds a depth-aware post-processing AO approximation using the main WebGL depth texture. Photon's defaults (`GTAO_SLICES=2`, `GTAO_HORIZON_STEPS=3`, `GTAO_RADIUS=2.0`) remain design references while the browser implementation uses a cheaper neighborhood-depth method appropriate for WebGL/mobile.

### Water

Water materials discovered in the scene receive a lightweight Photon-style browser patch:

- small multi-frequency surface displacement
- moving ripple highlights
- quality-scaled wave strength

This does not yet claim parity with Photon's full refraction, caustics, SSR, parallax and underwater-scattering paths.

### Bloom, color and AA

On WebGL, V15.2 installs a guarded post chain with:

- depth AO
- bright-pass bloom approximation
- exposure/color response
- lightweight edge AA inspired by the original TAA/FXAA pipeline
- per-profile internal render scale

The wrapper is only installed on `WebGLRenderer`; unsupported renderer paths fall back to the existing MinecraftWeb pipeline instead of breaking startup.

### Profiles

Photon Web still exposes Lite / Balanced / High / Ultra. V15.2 maps them to cloud layers, cloud quality, cloud-shadow strength, atmospheric fog, AO, bloom, AA, water response and internal post scale. Touch devices receive conservative AO limits automatically.

### Diagnostics

Use the runtime console command:

`photon152`

It reports the loaded Photon asset state, active profile, translated subsystems and whether the WebGL post path is active.

## Java UI / Options

The V15 Java UI remains in place:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game
- Java-style Options and Video Settings
- Resource Packs under Options
- Java-style Create New World / Game Rules / pause-menu flows

Graphics, Photon, renderer and performance controls remain organized under the Java-style Video Settings hierarchy.

## Loading / PWA

V15.2 keeps the faster concurrent runtime-part loading and refines the darker Java-style loading presentation. The runtime and manifest are versioned to **0.15.2** to reduce stale Safari/PWA caching after the graphics update.

## Accuracy statement

Photon Web is a **browser-native translation**, not the original Iris/OptiFine runtime. Systems that depend on Minecraft-specific G-buffers, compute shaders, LPV volumes, temporal history buffers, SSR ray traversal or shader-pack engine hooks are reimplemented approximately or remain future work. The README only marks systems as complete when MinecraftWeb contains a working browser implementation.

## Next Photon Gauntlet targets

1. translate more of Photon's atmosphere scattering/LUT behavior where practical
2. stronger volumetric/crepuscular light shafts
3. improved water refraction/reflection and underwater fog
4. temporal history/TAA path for capable desktop/WebGPU devices
5. colored-light/LPV-inspired voxel lighting where it can be made mobile-safe

## Version

**Minecraft Web V15.2 — Java UI + Photon Web Gauntlet**  
Alpha **0.15.2**  
Java-first UI • Three.js • Photon v1.3b source-informed graphics • Responsive iPhone/Desktop
