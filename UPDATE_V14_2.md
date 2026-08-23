# V14.2 update summary

This build adds the two requested translation systems without replacing the existing V14 renderer/world/gameplay stack.

## 1. Bedrock Behavior Translator

- Mojang behavior entity JSON resolver/cache.
- Components, component groups, events and entity properties.
- Strict filter evaluator: unsupported conditions are logged and blocked rather than guessed.
- Priority goal scheduler shared across mob types.
- Targeting, retaliation, melee/ranged attack, creeper swell/fuse, flee sun, panic, avoidance, float/swim, tempt, follow-parent, random stroll, move-to-target and look goals.
- Environment sensors, timers, target-acquire/escape events and property assignment.
- Collision-aware local navigation and stuck recovery layered under the Mojang behavior plan.
- Existing entity model/UV/animation pipeline, loot, XP, daylight burning, collision and LOD retained.

## 2. Bedrock Audio Translator

- Mojang `sounds.json` + `sound_definitions.json` resolver.
- Block break/hit/place/step sound resolution.
- Entity ambient/hurt/death/attack resolution.
- Weighted sound variants, pitch/volume and positional distance metadata.
- Stereo/HRTF Web Audio positional routing.
- Creeper fuse/explosion, mob combat and footsteps hooked into the real sound pipeline.
- All old synthesized beep/noise fallbacks disabled.
- Missing Mojang audio stays silent and is reported in DBG/console.
- GitHub Action + Python builder automatically select required FSB samples, convert available ones to browser-ready MP3 and cache catalog metadata locally.

Runtime version: **Minecraft Web Alpha 0.14.2**.
