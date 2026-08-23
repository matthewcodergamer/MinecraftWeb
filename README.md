# Mojang audio cache

The game does not ship generic fallback sounds.

`tools/build_mojang_audio.py` reads Mojang Bedrock `sounds.json` and `sound_definitions.json`, selects the sound events needed by the current block/mob profile, downloads their `.fsb` samples, converts them to browser-friendly MP3 with ffmpeg, and writes `mojang-audio-manifest.json`.

Run:

```bash
python tools/build_mojang_audio.py
```

The runtime checks this generated cache first. If a generated file is absent it can still attempt direct/lazy FSB decoding, but a failed Mojang asset is logged and stays silent; no beep/noise replacement is synthesized.
