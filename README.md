# Minecraft Web V15.9 — Java 26.1 + Minecraft Seven + Photon Web

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current build is **0.15.9** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → ordered numbered source parts

## V15.9 gameplay/render repair

V15.9 is a stability and gameplay pass focused on the problems visible on mobile Safari/iPhone and the Photon renderer.

- **Singleplayer now opens a Java-style Select World screen** instead of immediately creating a new Survival world. The current local browser save is shown as a selectable world, with Play Selected World, Create New World, Edit, Delete, Re-Create and Cancel actions.
- **Quit Game now terminates the active runtime state**: the game loop is stopped, music/audio are stopped and Web Audio contexts are suspended. Browsers are not allowed to close every tab/PWA programmatically, so when `window.close()` is denied the app enters a black, inert “Minecraft has quit” screen.
- **PWA/background audio is suspended** on `visibilitychange`, `pagehide` and page `freeze`; audio can resume only after the app becomes visible and receives a user gesture.
- **Inventory drag-out/drop is repaired for touch/iOS** with window-level pointer routing. A dragged stack is consumed from the inventory only after the dropped entity is actually spawned.
- **Java-style quick dropping is restored/extended**: Q drops one item, Ctrl/Meta+Q drops the selected stack, and mobile has a hold-to-repeat Q control for rapidly throwing items.
- **Underwater oxygen bubbles are moved above the hunger side of the HUD**, separate from armor/hearts.
- **Vanilla sky and lighting are rebuilt around Minecraft's 24,000-tick / 20-minute day**, with sunrise/sunset warm horizons, dark-blue night, stars, weather-aware fog, and the existing Java 26.1 sun/moon/moon-phase assets.
- **Photon's circular/fisheye clipping is repaired** by keeping its atmospheric/cloud geometry inside the camera far plane instead of letting oversized sky spheres intersect the far clip plane.
- **Photon is lighter on phones**: the expensive full-screen post chain is disabled on coarse/touch devices, Lite uses one volumetric cloud layer, other mobile profiles use at most two, and duplicate vanilla/Photon cloud systems no longer render simultaneously.

## V15.8 critical fixes

V15.8 fixes the startup regression visible in Safari and moves the browser UI closer to Minecraft Java presentation.

- The `playBtn` / `creativeBtn` startup crash is fixed. The legacy engine core still expects those IDs during initialization, so `index.html` now provides invisible compatibility bindings. The real visible Java menu is still built once by the V15 title runtime.
- Minecraft browser UI now uses **Minecraft Seven**, sourced from Mojang's public `web-theme-bootstrap` font assets. The font is installed locally at `assets/fonts/Minecraft-Seven.woff`, with the Mojang raw WOFF as an availability fallback while a fresh deployment is completing.
- The Java 26.1 bitmap font resources remain available in `assets/java/26.1/font/`; those are game/resource glyph assets, while Minecraft Seven is the browser-ready webfont used by DOM menus, buttons, loading text, options, HUD text, and other HTML UI.
- The boot/loading presentation uses the local Java 26.1 panorama and Minecraft-style square progress treatment instead of a generic rounded web loader.
- The canonical title continues to use only the local Java 26.1 `minecraft.png`, `edition.png`, and Java widget/button assets.
- A final V15.8 UI bridge removes old title/footer fragments and applies one font/icon/UI source after the compatibility layers have loaded.

## Java 26.1 is the Java-facing source of truth

The preferred Java asset root is:

`assets/java/26.1/`

The V15.8 bridge exposes this root as the canonical Java-facing asset location for GUI, title art, block/item textures, environment/celestial textures, entities, bitmap font resources, metadata and other files present in the PrismarineJS 26.1 mirror.

Important UI assets include:

- `assets/java/26.1/gui/title/minecraft.png`
- `assets/java/26.1/gui/title/edition.png`
- `assets/java/26.1/gui/title/background/panorama_*.png`
- `assets/java/26.1/gui/sprites/widget/button.png`
- `assets/java/26.1/gui/sprites/widget/button_highlighted.png`
- `assets/java/26.1/gui/sprites/widget/button_disabled.png`
- `assets/java/26.1/font/`

Older duplicate Java folders are **not blindly deleted** while legacy runtime modules still reference them. Cleanup is staged: new Java-facing UI/render paths are moved to `26.1` first, then an old duplicate may be removed only after its remaining references are eliminated. This avoids breaking working gameplay/audio just to reduce repository size.

## Minecraft Seven font

The browser UI font is the Minecraft Seven webfont published in Mojang's public `Mojang/web-theme-bootstrap` repository. V15.8 stores the local copy at:

`assets/fonts/Minecraft-Seven.woff`

V15.8 applies `Minecraft Seven` to the title menu, options screens, Java buttons, loading text, HUD/debug UI, inputs, and other browser-rendered game text. The local font and icon are installed by:

`.github/workflows/install-v15-8-java-ui-assets.yml`

## Java audio

The current working Java OGG compatibility library remains under:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

The 26.1 mirror currently does not expose a matching `assets/java/26.1/sounds/` directory in this repository, so V15.8 does **not** break audio by redirecting working sound paths to a directory that is not present. UI click audio remains prewarmed for lower Safari latency.

## One canonical title/menu

The intended main menu is exactly:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game

There is one Minecraft logo, one Java Edition strip beneath it, one menu, and one version footer. Historical title builders remain compatibility code only; they are not supposed to leave duplicate visible UI.

## Exact Java Edition icon

The new canonical browser/PWA icon path is:

`assets/icon/minecraft-java-icon.png`

The V15.8 installer retrieves the exact `Java_Edition_icon_3.png` referenced for the project and stores it under the dedicated `assets/icon/` directory. `index.html`, the runtime branding bridge, `apple-touch-icon`, favicon/shortcut icon, and `manifest.webmanifest` all point to this one path.

Safari/iOS caches favicons and Home Screen icons aggressively. Build URLs are versioned to `0.15.9`; an already-installed Home Screen shortcut can still require removal and re-adding after deployment for iOS to discard its old cached icon.

## Java 26.1 rendering bridges

The Java 26.1 bridge includes real Java sun/moon assets, moon phases, Fancy-style clouds, Java destroy-stage block-breaking overlays, local-first GUI/title routing, and the Java 26.1 title panorama/widget assets. Useful diagnostic commands include `java261` and `break261`.

## Photon Web

Photon Web remains an optional graphics layer on top of the existing voxel renderer. The current project retains the lighting, fog, atmosphere, cloud, water, AO, bloom/color-response, and mobile quality work from the earlier Photon passes.

## Current version

**Minecraft Web V15.9 — Java 26.1 + Minecraft Seven + Photon Web**  
Build **0.15.9**  
Java 26.1 assets • Minecraft Seven UI • Three.js voxel engine • Photon Web • iPhone/Desktop responsive UI
