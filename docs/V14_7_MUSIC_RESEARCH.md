# V14.7 Java music notes

Minecraft Java's `Musics` constants define generic game music with a 10 minute minimum delay and 20 minute maximum delay between tracks. Menu music uses a 1 second minimum and 30 second maximum delay. V14.7 uses those same silence windows after a track completes.

The web client keeps music as streamed OGG/HTML audio rather than decoding the whole soundtrack into WebAudio buffers. The mobile default gain is intentionally reduced to 0.10 while preserving per-sample volume metadata from Java `sounds.json`.

Block sounds continue to resolve through `sounds.json`, with direct local sample fallbacks for wood, grass and stone so a catalog/path problem cannot make common breaks such as oak logs silent.
