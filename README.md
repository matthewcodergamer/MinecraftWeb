# Minecraft Web V15.7 — Java 26.1 + Photon Web

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current build is **0.15.7** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → ordered numbered source parts

## What V15.7 fixes

V15.7 is a cleanup/stability pass focused on the title screen, Java audio response, and browser/PWA branding.

- One canonical Minecraft title menu is built at runtime.
- The title contains one `minecraft.png` logo and one Java Edition `edition.png` strip from the local Java 26.1 asset mirror.
- Old V14/V15 footer fragments and duplicate version text are removed so the bottom-left/bottom-right status line is not stacked on itself.
- The old static boot-menu markup was removed from `index.html`; the runtime owns the title menu now instead of multiple builders competing for the same DOM.
- Java button audio still uses the real local OGG sound, but V15.7 keeps a warm HTMLAudio pool so button clicks do not create a brand-new audio element on every tap. This reduces the small Safari/iPhone click delay.
- The latest Java Edition icon is stored locally at `assets/branding/java-edition-icon.png` and is used for favicon, Safari tab/site icon, Apple touch icon, Add to Home Screen, and the web-app manifest.
- `manifest.webmanifest`, `index.html`, and the runtime branding patch all point to the same local icon.

## Java 26.1 assets

The local Java asset mirror is:

`assets/java/26.1/`

The project uses the PrismarineJS Java asset set as its Java-facing source for GUI, block/item textures, environment/celestial textures, entities, fonts, metadata, and related resources. Local files are preferred by the runtime.

Important Java title/UI assets include:

- `assets/java/26.1/gui/title/minecraft.png`
- `assets/java/26.1/gui/title/edition.png`
- `assets/java/26.1/gui/title/background/panorama_*.png`
- `assets/java/26.1/gui/sprites/widget/button.png`
- `assets/java/26.1/gui/sprites/widget/button_highlighted.png`
- `assets/java/26.1/gui/sprites/widget/button_disabled.png`

## Java audio

Java audio is backed by:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

Minecraft Web keeps the Java sound-event catalog and local OGG files for UI clicks, block sounds, footsteps, damage, entities, items, and other supported events. Safari Web Audio is unlocked from a real user gesture, and the UI click sound is prewarmed for lower perceived latency.

## Title/menu structure

The intended main menu is exactly:

- Singleplayer
- Multiplayer
- Minecraft Realms
- Options...
- Quit Game

The title is one Minecraft logo with one Java Edition strip beneath it, spaced responsively for landscape and portrait layouts.

Options/resource-pack/video/audio/control screens remain part of the Java-style UI hierarchy.

## Photon Web

Photon Web remains an optional graphics layer on top of the existing voxel renderer. The current project retains the source-informed lighting, fog, atmosphere, cloud, water, AO, bloom/color-response, and mobile quality work from the earlier Photon passes.

## Java 26.1 rendering bridges

The Java 26.1 bridge includes:

- real Java sun texture
- Java moon phases
- Fancy-style cloud geometry derived from the Java cloud coverage map
- Java destroy-stage overlays for block breaking
- local-first GUI/title asset routing

Useful diagnostic commands include:

`java261`

and

`break261`

## PWA / browser icon

The canonical icon path is:

`assets/branding/java-edition-icon.png`

That one file is used for:

- regular favicon
- Safari tab/site icon
- shortcut icon
- `apple-touch-icon`
- Add to Home Screen / installed PWA icon
- manifest `any` icon
- manifest `maskable` icon

`.github/workflows/install-java-edition-icon.yml` installs the current `Java_Edition_icon_3.png` source into that local path so the site is not dependent on a remote icon URL at runtime.

Safari and iOS can aggressively cache icons. New builds use versioned icon/manifest URLs. An already-installed Home Screen shortcut may still need to be removed and added again for iOS to replace its cached icon.

## Source cleanup policy

The numbered historical patches remain because later patches depend on parts of their runtime behavior, but V15.7 removes duplicate DOM/menu output at the final stage rather than allowing several generations of title UI to coexist visibly. Cleanup should preserve working gameplay, renderer, world, controls, assets, and audio behavior.

## Current version

**Minecraft Web V15.7 — Java 26.1 + Photon Web**  
Build **0.15.7**  
Java 26.1 assets • Three.js voxel engine • Photon Web • iPhone/Desktop responsive UI
