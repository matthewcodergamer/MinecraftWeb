# Minecraft Three.js V14.3

This build is a compatibility and gameplay-polish pass on top of V14.2. It preserves the existing voxel renderer, face/frustum culling, WebGL/WebGPU benchmark path, Bedrock model translator, behavior translator and strict Mojang audio resolver.

## Fixed in this pass

- Sand and gravel now enter a falling-block simulation when unsupported and settle back into the voxel world.
- Mob collision recovery now searches sideways and upward instead of only pushing entities vertically. This targets the iron-golem "stuck in a plank / floating and rotating" failure.
- Cow, pig and sheep translation now normalizes old Bedrock geometry inheritance and separates the quadruped body visual rotation from child bones, preventing the forced V11 body rotation from dragging the legs with it.
- The missing `toast()` function is restored, fixing the `toast is not a function` placement error seen in the debug console.
- Sun and moon sprites use a background-alpha cleanup pass, equal sizing, a larger celestial scale and a fixed world direction around the player/camera so looking around does not make them behave like HUD objects.
- Clouds support Moving / Static / Off from Options.
- Natural mob spawning is split by day/night and consults Mojang Bedrock spawn-rule JSON where available. Passive animals are blocked from normal night spawning; hostile mobs use dark/light checks.
- Bedrock target selection can evaluate other live entities, not only the player. This lets data-driven zombie/villager/golem family filters participate in targeting, and adds a defend-village target path for iron golems.
- Villages now use plains/height/slope/water restrictions, paths, multiple buildings, a well-like center, villagers and an iron golem. They no longer intentionally stamp into ocean terrain.
- Villagers receive a small workstation-driven profession state when a matching Bedrock component group exists.
- Player camera bob is substantially reduced; sprint FOV remains. Third-person player rendering now applies walk, crouch, swimming and attack/mining animation hooks when those Mojang clips are present.
- Footsteps remain strict Mojang audio only, but the cadence and volume are reduced.
- Inventory/crafting windows get an explicit close button, backdrop close, Escape close and improved portrait/landscape sizing.
- Renderer resize now follows `visualViewport`, including repeated correction after iOS orientation changes.
- PWA/browser title is now **Minecraft** and the HTML references Mojang's Bedrock-sample pack icon for the iOS touch icon.
- A data-driven background-music scheduler requests Mojang music events and stays silent when the required asset is unavailable; it does not synthesize replacement audio.
- Generic Bedrock model translation registration is expanded for several additional mob families so future Nether/End work can use the same translator instead of one-off renderers.

## Structure / dimension scope

This build adds a stronghold-shaped generation fallback and expands entity-translation plumbing, but it **does not pretend the full Nether → stronghold → End portal → Ender Dragon progression is complete**. A complete dimension implementation needs separate block registries, portal state, dimension chunk stores/generators, dimension-specific spawning, structure decoding and boss/game-progression state. Those should be built on the data-driven systems now in the project rather than bolted onto the Overworld loop.

## Deployment

Run `python build.py` after editing a source part. Upload the repository root to GitHub Pages. Both `game.js` and `js/game.js` are regenerated from `src/parts/`.
