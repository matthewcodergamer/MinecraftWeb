# V14.4 — Java Edition Primary Layer

This update changes the source-of-truth strategy without throwing away the systems that already work.

## Implemented now

- Added `JavaEditionRepositoryV144`, a cached browser resolver for PrismarineJS `minecraft-data` using its version-aware `dataPaths.json` map.
- Prewarms Java item, food, block, collision, entity, window and sound metadata once per session; failures are non-fatal and are reported in the diagnostic console.
- Added `JavaAssetResolverV144` targeting Java 1.21.8 extracted assets.
- Java item icons and supported Java block textures are now preferred before the existing user/Bedrock fallbacks.
- Title screen now uses the Java Minecraft title artwork and Java Edition subtitle artwork.
- Crosshair uses the Java HUD sprite.
- Added the Java attack-cooldown indicator using the real Java HUD sprite set.
- Replaced the survival inventory and crafting-table screen with the real Java 176×166 container artwork, while keeping the existing drag/drop transaction engine underneath it.
- Inventory is rotation-safe and rescales from `visualViewport` on iPhone portrait/landscape changes.
- Java-style attack speed/cooldown/damage scaling added for the tools and weapons currently registered in this game.
- Java food points are read from `minecraft-data` when available; safe existing saturation values are retained when upstream version fields use a different scale.
- Resource-pack/source screen now explains the Java-preferred hybrid ordering.
- Added diagnostic commands: `java144`, `javadata144`, `javacombat144`.

## Kept from Bedrock on purpose

V14.4 does **not** delete the Bedrock translators. The current Bedrock path remains active for:

- mob geometry / bone / UV translation
- entity animations
- behavior JSON and spawn-rule translation
- strict event-resolved audio pipeline

Those systems are already data-driven and browser-friendly, while Java Edition does not expose every mob model/AI primitive in an equivalent JSON format.

## Not falsely claimed as complete

This update does not make the project a complete Java client. Full Java block-model/state rendering, every recipe, every Java entity implementation, Nether/End progression, redstone, complete village POI/profession mechanics and full multiplayer protocol parity remain later systems.

The important V14.4 change is architectural: Java is now the preferred source for UI/items/blocks/mechanics data, and Bedrock is a focused fallback for the translators it currently handles best.

## Java HUD upgrade

The survival HUD now prefers Java 1.21.8 sprites for hearts, hunger, armor, the experience bar, crosshair, attack-cooldown indicator, hotbar frame and hotbar selection. The existing DOM/input logic stays intact so mobile controls and inventory selection are not rewritten just to change artwork.
