# Minecraft Web Alpha 0.14.5 — Java runtime fix pass

This update is based on the V14.4 screenshots/debug output and changes the client-facing systems that were still accidentally mixing Java and Bedrock.

## Java-only audio

- Java Edition `sounds.json` is the sound-event source.
- Effects are real Java `.ogg` files loaded from the generated local cache first and the Java asset mirror second.
- Block break / hit / place / step resolve to Java `block.<sound-group>.<action>` events.
- Entity ambient / hurt / death / attack sounds resolve to Java entity events.
- Legacy aliases such as `game.player.attack.weak`, `dig.wood` and `step.grass` are normalized to Java events.
- Bedrock FSB fetching/ffmpeg startup is disabled at runtime.
- No synthesized beep/noise fallback is used.
- Java audio buffers use a small 48-buffer LRU-style cap for iPhone memory.
- Long music uses streaming HTMLAudio rather than decoding an entire song into an AudioBuffer.
- `music.menu` starts on the first permitted user gesture while the title screen is open; this respects Safari autoplay rules.

## Java UI only for selected screens

- The title menu is rebuilt directly with Java widget sprites instead of first building the old menu and skinning it afterward.
- Inventory and crafting table are rebuilt directly around Java `inventory.png` / `crafting_table.png`.
- The duplicate always-open recipe panel is removed. A Java recipe-book button toggles the recipe drawer.
- Java close/widget sprites are used.

## Java rendering fixes

- Core block textures now resolve from Java assets only for mapped blocks; Bedrock is not used as a fallback for those mapped textures.
- Grass top, tall grass and oak leaves receive Java-like biome green tinting.
- Held generated items use their Java item texture and a cached pixel-extruded 3D mesh.
- `Raw Porkchop -> porkchop.png` and the other raw-meat/tool naming mismatches are fixed.
- Torches use the Java `template_torch` dimensions (2×10×2 pixels) both as a placed non-full block and as a held object.

## Java celestial/cloud path

- Sun and moon are created directly from Java `environment/sun.png` and `moon_phases.png`.
- Clouds load Java `environment/clouds.png` only.
- No Bedrock celestial/cloud texture is requested by the V14.5 path.

## Animals / collision

- Sheep is replaced with a Java-style cuboid model using Java `sheep.png` + `sheep_wool.png` instead of the Bedrock sheep geometry.
- Cow, pig, sheep and chicken use a lightweight Java-like passive runtime (panic, stroll, look, sheep grazing) rather than executing their Bedrock behavior controller.
- Passive AI thinks at 5 Hz while physics stays frame-based to reduce iPhone CPU cost.
- Mob collision gets a final depenetration/last-safe-position guard.
- Player movement gets swept collision checks so it cannot tunnel through blocks at larger frame times.

## Preserved

World/chunk generation, WebGL/WebGPU renderer, frustum culling, survival systems, falling sand/gravel, crafting logic, furnace, block breaking, drops, hostile behavior, existing Bedrock entity translation for mobs not replaced here, and all prior V14 performance work remain present.
