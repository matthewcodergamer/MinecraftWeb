# Runtime assets

The game intentionally keeps the same network asset behavior as the original V14 HTML.

It loads Three.js and Minecraft/Mojang sample resources from the same URLs already used by
the standalone build, including the configured Minecraft-assets repository. No asset resolver,
texture lookup, entity lookup, sound lookup, WebGL/WebGPU test code, or Mojang URL logic was
removed during the split.
