# V14.2 Bedrock translation layers

## Behavior

`src/parts/91-v14-1-bedrock-behavior.js` treats Mojang behavior entity JSON as the mob configuration source instead of maintaining a separate hand-written AI definition per mob.

Pipeline:

`behavior_pack/entities/*.json -> components/component_groups/events/properties -> filters -> priority goals -> GameEntity -> collision-aware Three.js navigation`

The interpreter currently implements targeting, hurt retaliation, melee and ranged attacks, creeper swell, flee-sun, panic, avoidance, swim/float, tempt, follow-parent, movement, random stroll, look behaviors, environment sensors, timers, target acquire/escape events, component-group add/remove and property assignment. Unsupported filters block their condition and are reported in DBG; unsupported behavior primitives are reported and skipped.

The optional smarter layer only improves local steering/stuck recovery. It does not replace the Mojang behavior plan.

## Audio

`src/parts/92-v14-2-bedrock-audio.js` uses Mojang `sounds.json` and `sounds/sound_definitions.json` as the sound-event source of truth.

Pipeline:

`sounds.json -> sound_definitions.json -> weighted event/sample resolver -> generated FSB cache/direct decode -> Web Audio -> stereo/HRTF positional sound`

There is deliberately no synthesized beep/noise fallback. If a referenced Mojang sample is unavailable or cannot be decoded, that event stays silent and the exact stage is logged.

`tools/build_mojang_audio.py` is the production conversion path. It selects the block/entity events in `config/audio-profile.json`, downloads only their Mojang `.fsb` samples, converts valid samples with ffmpeg, records unavailable samples in the generated manifest, and keeps all successfully generated audio. Pass `--strict` only when you intentionally want any missing asset to fail the build.

## Runtime debug

- `behavior zombie` — inspect the compiled Mojang behavior plan.
- `ai` — inspect live mob goals/targets.
- `audio random.click` — resolve/play a real Mojang sound event.
- `blocksound <blockId> break` — inspect Mojang block-sound event resolution.
