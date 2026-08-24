/* Finalize V14.7 after every Java-first, optimization and fidelity patch has been installed. */
titlePreviewV8?.dispose();titlePreviewV8=null;ensureTitleWorldV9();v9BuildTitle();
window.MINECRAFT_WEB_VERSION='0.14.7';window.STUDIO_PATCH_VERSION=STUDIO_V14_7.version;
const v147Small=document.querySelector('#titleContent .v9Small');if(v147Small&&/Minecraft Web/.test(v147Small.textContent||''))v147Small.textContent='Minecraft Web Alpha 0.14.7 • Java-first • Optimized + Fidelity Repair';
window.__voxelDiag?.log?.('FINAL READY Minecraft Web Alpha 0.14.7: all V14.6 section/occlusion/scheduling/mobile optimizations remain active; V14.7 adds fixed celestial alpha/depth/horizon behavior, transparent Java destroy-stage cracks, safe centered inventory UI, native 3D tools and corrected torch UVs, Java music pacing/material sound fallbacks, connected sheep geometry, swept passive collision, procedural player animation and third-person held items.','ok');
