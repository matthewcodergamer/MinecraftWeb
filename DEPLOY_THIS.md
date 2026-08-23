# Deploy this V14.2 build

1. Upload every file/folder in this ZIP to the root of your GitHub Pages repository.
2. Make sure `index.html`, `main.css`, and `game.js` are at the repository root.
3. Let GitHub Pages publish the repository over HTTPS.
4. The included **Build Mojang Audio Cache** workflow automatically runs on `main` when the game/audio sources change. It resolves the required Mojang sound events, pulls their FSB files, converts available samples, and commits the browser-ready cache. If repository Actions are disabled, enable them or run the workflow manually.
5. Open the site and tap/click once so Safari/Chrome can unlock Web Audio.

The runtime can still attempt lazy FSB decoding when a preconverted file is absent, but there is no synthesized fallback sound. Missing audio is reported in DBG/console and remains silent.
