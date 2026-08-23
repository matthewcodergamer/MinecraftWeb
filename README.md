# Assets

This build preserves the original V14 asset resolver.

At runtime the game still resolves Minecraft sample assets from:
- Mojang `bedrock-samples`
- the configured `Minecraft-assets` GitHub repository
- Three.js r180 from jsDelivr through the import map in `index.html`

Nothing was removed from the original resolver. This folder is intentionally ready for
future local asset mirroring if you later want the site to become self-contained/offline.
