# IMPORTANT — GitHub Pages deployment

The screenshot with plain white HTML means the browser received `index.html` but did not receive
the game stylesheet and game JavaScript.

This package makes the three files required at runtime all live at the repository root:

    index.html
    main.css
    game.js

Upload/extract ALL THREE files to the same GitHub Pages publishing folder.

The `css/` and `js/` folders are retained only as organized backup copies. The page does not
depend on them.

For a project repository named `MinecraftWeb`, the normal GitHub Pages project URL is:

    https://matthewcodergamer.github.io/MinecraftWeb/

unless GitHub Pages has explicitly been configured to publish this repository at the account root.

Do not upload the ZIP itself as one file and expect GitHub Pages to unpack it.
