# Minecraft Three.js V14.5 — Java Client Runtime

Minecraft Web Alpha **0.14.5** keeps the existing Three.js/WebGPU-capable world engine and moves the chosen client-facing systems to Java Edition data/assets.

Runtime entry files remain `index.html`, `main.css`, and `game.js` at repository root.

Key V14.5 systems:

- Java widget/title/inventory/crafting UI.
- Java OGG audio only for runtime effects/music; Bedrock FSB fallback is disabled.
- Java combat cooldown/attack strength and responsive attack HUD.
- Java sun, moon and cloud resources.
- Java core block/item textures and held-item rendering.
- Correct Java torch non-full-block geometry.
- Java-like biome tint for grass/tall grass/leaves.
- Java sheep model and Java-like passive animal runtime.
- Stronger player/entity anti-clipping recovery.
- Existing world generation, falling sand/gravel, renderer, WebGPU/WebGL benchmark and other working V14 systems preserved.

## Build

Edit source files under `src/parts/` and run:

```bash
python build.py
```

## Cache Java runtime assets

The included `.github/workflows/build-java-runtime-assets.yml` runs `tools/build_java_runtime_assets.py`. It caches the Java GUI/environment/entity/block/item assets plus the OGG samples referenced by the configured Java sound events.

Safari requires a user gesture before audio can begin; title music therefore starts after the first tap/key interaction on the title screen rather than before the user interacts with the page.

See `UPDATE_V14_5.md` for the implementation details.
