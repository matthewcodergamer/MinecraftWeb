# Why this fixed build works

The first multifile conversion used a runtime loader that fetched many JavaScript fragments,
joined them into a Blob URL, and dynamically imported the Blob. That added a new boot layer
that did not exist in the original V14 page.

This build does not do that.

`index.html` loads:
- `css/main.css`
- `js/game.js`

`js/game.js` is the original V14 `<script type="module">` content byte-for-byte. Therefore
the working engine still has the same single ES-module lexical scope, execution order, Three.js
import, Mojang repository resolver, world startup, UI hooks, rendering, frustum-culling patch,
and all later V14 patches.

For maintainability, the same JavaScript is also stored as logical sections in `src/parts/`.
Those files are source/editing files only. `build.py` concatenates them back into `js/game.js`.
GitHub Pages needs no build step because `js/game.js` is already included.
