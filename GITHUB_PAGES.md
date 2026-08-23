# Publish on GitHub Pages

1. Extract the ZIP.
2. Upload the **contents** of the `Minecraft_ThreeJS_V14_GitHub_Multifile` folder to the root
   of your GitHub repository.
3. Keep every folder (`css`, `js`, `assets`, `docs`, `legacy`) intact.
4. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
5. Select your main branch and `/ (root)`.
6. Open the HTTPS GitHub Pages URL after deployment.

Do not open `index.html` directly with `file://`. The split files are loaded with `fetch()`, so
the project needs an HTTP/HTTPS server. GitHub Pages provides that automatically.

WebGPU remains browser/device dependent. WebGL remains the fallback already present in V14.
