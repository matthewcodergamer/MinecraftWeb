# Minecraft Three.js — V14.4 Java Primary

Browser-first Minecraft-style survival runtime targeting iPhone Safari and desktop browsers.

## V14.4 source strategy

**Java Edition is now preferred** for client-facing assets and structured gameplay data:

- Java title / HUD / inventory / crafting UI from `PrismarineJS/minecraft-assets` (target: 1.21.8)
- Java item and block texture candidates before the older Bedrock candidates
- Java registries and mechanics metadata from `PrismarineJS/minecraft-data`
- Java-style attack speed, cooldown strength and HUD indicator
- Java food values when the Java data cache is available

The existing Bedrock translation pipeline is intentionally retained for the parts where it is currently stronger for this engine: entity geometry, UVs, animations, data-driven behavior components/spawn rules, and the strict Mojang audio resolver.

Runtime entry on GitHub Pages: `index.html` → `runtime-loader.js` → ordered numbered source parts. The ZIP also includes the prebuilt `game.js` bundle for direct bundling/testing.

Build from source parts with:

```bash
python build.py
```

The game does not claim complete Java Edition parity. V14.4 establishes the Java-primary translation layer while preserving all V14.3 physics/rendering/AI fixes.
