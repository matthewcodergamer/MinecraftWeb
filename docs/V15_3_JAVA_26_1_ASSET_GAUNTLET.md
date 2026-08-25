# V15.3 — Java 26.1 Asset Gauntlet

Source: `PrismarineJS/minecraft-assets/data/26.1`.

## Mirror

The complete upstream version directory is mirrored into `assets/java/26.1/` by `tools/sync_prismarine_26_1_assets.py`. The GitHub Actions workflow runs on demand, when its sync tooling changes, and weekly to keep the mirror aligned with the upstream 26.1 tree.

## Runtime translation

`98i-v15-3-java-26-1-assets.js` provides local-first Java asset resolution and integrates Java 26.1 celestial, cloud and GUI assets with the current Three.js engine.

Celestials use the real Java 26.1 sun plus all eight moon-phase sprites. The background-cleanup helper removes only border-connected near-black matte pixels and preserves interior dark pixels.

Clouds use `environment/clouds.png` as a coverage map and generate Fancy-style non-colliding prisms at Y=192, with 12×12 source-pixel footprint and four-block thickness. Only a camera-local window is meshed to keep iPhone costs bounded.

`98j-v15-3-java-breaking-overlay.js` loads `blocks/destroy_stage_0..9.png` and renders them as transparent cracks over the original voxel material.

## Branding and GUI

The local mirror supplies the Java 26.1 title and GUI sprites. GitHub Actions also caches the current Java Edition icon from Minecraft.net into `assets/branding/icon_javaedition.jpg` for favicon/PWA use.

## Diagnostics

- `java261`
- `break261`

These commands expose the translated Java asset paths and runtime state.
