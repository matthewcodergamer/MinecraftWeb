# Minecraft Web V16.1 — Java 26.1 Vanilla Fidelity + Procedural Square Sun

Minecraft Web is a browser-based, Java-first Minecraft client/runtime built with Three.js and a custom voxel/gameplay stack. The current build is **0.16.1** and targets responsive desktop and mobile play, including iPhone Safari.

The live runtime is:

`index.html` → `runtime-loader.js` → cached `runtime-bundle.js` generated from the ordered numbered source parts

## V16.1 procedural square sun repair

V16.1 removes the last conflicting sun path that could briefly show a correct square sun and then replace it with the older yellow/pink texture-backed celestial sprite after its PNG finished loading.

- **The visible sun is now generated procedurally in Three.js rather than loaded from a PNG.** It is one 1:1 square celestial quad with a Minecraft-style 30-unit sky size.
- **The old Java sun sprite is explicitly suppressed every celestial update.** Async texture loading can no longer swap the visible square sun back to the older yellow/pink circular-looking sprite.
- **Sun color is dynamic.** The procedural shader stays nearly white/cream around daytime/noon and transitions toward warm orange near sunrise/sunset without needing to replace an image asset.
- **The sun follows the Minecraft clock convention:** tick 0 sunrise, 6000 noon, 12000 sunset, and 18000 midnight.
- **The procedural sun remains depth-tested.** Hills, grass blocks, trees and other nearer world geometry correctly occlude it.
- **The directional sunlight is synchronized with the procedural sun direction immediately before the world draw**, preventing the visible sun and block/mob lighting direction from drifting apart.
- The moon remains texture-backed so the real Java 26.1 moon phases are preserved.
- A new diagnostic command, `sun161`, reports procedural sun size, tick, altitude, warmth, opacity, depth-test state and whether the legacy sprite is suppressed.

## V16.0 desktop + vanilla fidelity repair

V16.0 focuses on the visible desktop/rendering problems captured during real gameplay testing and on making the default world presentation much closer to Minecraft Java rather than a generic shader look.

- **Desktop pointer lock is now authoritative.** On a fine mouse/keyboard device, the touch look surface no longer sits above the canvas. Clicking gameplay requests pointer lock, hides the operating-system cursor after lock, and leaves the Minecraft crosshair as the aiming reference.
- **Desktop mouse actions are repaired.** Left mouse uses the existing primary attack/mine path, right mouse uses the selected item/block, and pointer lock exits when inventory, crafting, furnace, creative inventory, or the pause menu is opened.
- **Desktop keyboard routing is de-duplicated.** Existing WASD/Space movement remains active, while E, C and 1–9 are intercepted once so older input layers cannot toggle the same UI/hotbar action twice.
- **Touch-only controls are hidden on desktop.** The movement pad, mobile action buttons, mobile hint, sprint/drop/camera touch controls and related overlays remain available on coarse/touch devices but are removed from fine-pointer gameplay.
- **The Java HUD is re-laid out around the 182-pixel Java hotbar geometry at 2× scale.** Hearts and hunger share the main row, XP aligns to the hotbar, armor sits above hearts, oxygen sits above hunger, and the entire HUD scales from the visual viewport so it remains usable in desktop windows and phone portrait/landscape layouts.
- **The sun is a real depth-tested sky element again.** The Java 26.1 celestial patch had disabled depth testing and placed the sun very close to the camera. V16 keeps a camera-relative infinitely-distant sky direction, moves the disc near the far sky plane, enables depth testing, and allows terrain/grass/blocks to occlude it.
- **Vanilla Java sky/day/night is authoritative over the Photon sky stack.** V16 uses the 24,000-tick / 20-minute cycle, full daylight sky-light level 15, sunset 12000–13000, night minimum internal sky-light level 4, and sunrise 23000–24000. The palette uses a lighter Minecraft-style daytime blue, warm sunrise/sunset horizon, dark navy night, and stars.
- **Sky light now affects terrain instead of only recoloring the background.** Render-section vertex colors receive a cached sky-exposure factor so roofs and caves no longer receive the same sky contribution as exposed terrain. The global day/night sky contribution then changes every frame, keeping open terrain bright during the day and darkening it naturally at night.
- **Mobs, first-person items and the player arm use lit Lambert materials** so the same world lighting affects them instead of leaving large flat unlit shapes over the scene.
- **Java 26.1 Fancy clouds are restored as the visible cloud layer.** Day clouds are white, night clouds dim, sunrise/sunset adds a restrained warm tint, and side/underside shading is intentionally mild instead of the heavy Photon cloud-shadow look.
- **Competing Photon atmosphere/cloud/post/shadow/water passes are suppressed in the vanilla-fidelity path.** Photon remains installed as compatibility/resource-pack code, but it no longer darkens the default world, overlays a second sky, adds procedural cloud shadows, or distorts the vanilla water path during this renderer mode.
- **Pickaxes, axes, swords and other generated items now use their real Java item textures for 3D held and dropped models.** The V14.7 colored-cuboid tool substitute is bypassed in favor of the existing Java pixel-extrusion geometry.
- **Dropped non-block items use opaque, depth-tested world materials.** Water keeps depth testing with depth writes disabled, reducing the incorrect water-color overlay on items that are physically above the water surface.
- **Torch held/drop rendering uses the Java torch texture and 3D torch geometry**, while the existing local torch/block-light systems remain available for world lighting.
- **The empty-hand arm is smaller and uses the Java 26.1 Steve skin** instead of the oversized flat peach cuboid.
- A diagnostic command, `v160`, reports pointer-lock state, HUD scale, current day tick/internal sky-light value, Java-cloud state, celestial depth testing and the active item-render path.

## V15.9 gameplay/render repair

- **Singleplayer opens a Java-style Select World screen** instead of immediately creating a Survival world. The current local browser save is selectable with Play Selected World, Create New World, Edit, Delete, Re-Create and Cancel actions.
- **Quit Game terminates the active runtime state** and stops/suspends audio. When browser security prevents programmatically closing a tab/PWA, Minecraft enters an inert quit screen.
- **PWA/background audio is suspended** on `visibilitychange`, `pagehide` and page `freeze` and resumes only after a new user gesture.
- **Inventory drag-out/drop is repaired for touch/iOS.**
- **Java-style quick dropping:** Q drops one item, Ctrl/Meta+Q drops the selected stack, and mobile has hold-to-repeat Q.
- **Oxygen bubbles are separated from armor/hearts.**
- **The original V15.9 sky/Photon clip repair** keeps oversized atmospheric geometry inside the camera far plane and limits expensive mobile post/cloud work.

## V15.8 startup/UI repair

- Fixed the `playBtn` / `creativeBtn` compatibility-startup regression.
- Browser UI uses **Minecraft Seven** from the local `assets/fonts/Minecraft-Seven.woff` copy with Mojang's public webfont as an availability fallback.
- Loading/title presentation uses Java 26.1 panorama/widget assets.
- The canonical title uses one Minecraft logo, one Java Edition strip, one menu and one footer.

## Java 26.1 is the Java-facing source of truth

The preferred Java asset root is:

`assets/java/26.1/`

Important assets include:

- `assets/java/26.1/gui/title/minecraft.png`
- `assets/java/26.1/gui/title/edition.png`
- `assets/java/26.1/gui/title/background/panorama_*.png`
- `assets/java/26.1/gui/sprites/widget/button.png`
- `assets/java/26.1/gui/sprites/widget/button_highlighted.png`
- `assets/java/26.1/environment/celestial/moon/`
- `assets/java/26.1/environment/clouds.png`
- `assets/java/26.1/entity/player/wide/steve.png`
- `assets/java/26.1/font/`

Older duplicate Java folders are not blindly deleted while compatibility modules still reference them. New Java-facing paths move to 26.1 first; old fallbacks can be removed only after their remaining references are gone.

## Java audio

The current working Java OGG compatibility library remains under:

- `assets/java/sounds.json`
- `assets/java/sounds/**/*.ogg`

The 26.1 mirror does not currently expose a matching `assets/java/26.1/sounds/` directory in this repository, so working audio is not redirected to a missing path.

## Resource / graphics packs

Photon Web remains installed as an optional/compatibility graphics layer. V16 deliberately makes the vanilla Java-fidelity sky, clouds, water color and day/night lighting authoritative during normal gameplay so legacy Photon passes cannot stack on top of each other and produce the dark/fisheye/overlaid result seen in prior builds.

## Current version

**Minecraft Web V16.1 — Java 26.1 Vanilla Fidelity + Procedural Square Sun**  
Build **0.16.1**  
Java 26.1 assets • Minecraft Seven UI • Three.js voxel engine • responsive desktop/mobile controls • procedural square sun • optional Photon compatibility
