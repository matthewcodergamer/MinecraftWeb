# Minecraft Three.js V14 — Multifile Layout

The original V14 was a single HTML document containing one large ES module.

This package separates the project into:

- `index.html` — DOM/UI shell and Three.js import map
- `css/main.css` — original static stylesheet
- `js/boot.js` — source loader
- `js/parts-manifest.js` — ordered source manifest
- `js/parts/` — engine and version patches
- `assets/` — location reserved for future local assets
- `legacy/` — original standalone HTML backup

## Why the loader concatenates the JavaScript parts

The existing game has thousands of lines of patch-style code where later versions directly
extend classes/functions/variables created by earlier versions in the same ES-module lexical
scope. Turning every patch into an independent ES module without a full refactor would change
scope and could break working systems.

`boot.js` therefore fetches the split files in their original order, concatenates their source
in memory, and imports the result as one ES module. The repository is now organized into
multiple maintainable files while runtime semantics stay equivalent to the V14 standalone build.

The generated package verifies that concatenating every part reproduces the original module
byte-for-byte.
