/* Finalize V14.6 after every Java-first and optimization patch has been installed. */
titlePreviewV8?.dispose();titlePreviewV8=null;ensureTitleWorldV9();v9BuildTitle();
window.MINECRAFT_WEB_VERSION='0.14.6';
const v146Small=document.querySelector('#titleContent .v9Small');if(v146Small&&/Minecraft Web/.test(v146Small.textContent||''))v146Small.textContent='Minecraft Web Alpha 0.14.6 • Java-first • Section Occlusion';
window.__voxelDiag?.log?.('FINAL READY Minecraft Web Alpha 0.14.6: V14.5 Java UI/audio/assets/combat remain active; terrain is now split into 16³ render sections with directional portal occlusion, prioritized chunk work, section/entity culling, distance-tiered AI scans/animation, spatial indexing, instanced particles, cached height queries, adaptive DPR/view-distance protection and bounded asset memory.','ok');
