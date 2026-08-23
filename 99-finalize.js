/* Replace the small V8 title preview with the full-screen title world now. */
titlePreviewV8?.dispose();titlePreviewV8=null;ensureTitleWorldV9();v9BuildTitle();
window.__voxelDiag?.log?.(`V9 READY ${STUDIO_V9.version}: full-screen Mojang-textured Three.js title world, pixel splash, Mojang classic button states, working LOD ranges, sound_definitions parser, lazy FSB→WAV bridge, and 10 destroy stages.`,'ok');

