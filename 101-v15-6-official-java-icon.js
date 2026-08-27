/* Minecraft Web V15.6 — official Minecraft: Java Edition branding icon only.
 * Source: official Minecraft icon asset published by minecraft.net.
 * This patch does not generate or redraw the icon; it only points browser/PWA branding to the official asset.
 */
const OFFICIAL_JAVA_EDITION_ICON_V156='https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/logos/icon_javaedition.jpg';
function applyOfficialJavaIconV156(){
  const href=`${OFFICIAL_JAVA_EDITION_ICON_V156}?v=0.15.6`;
  const head=document.head;
  if(!head)return;
  const ensure=(rel,type='image/jpeg')=>{
    let link=head.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;head.appendChild(link)}
    if(type)link.type=type;
    link.href=href;
    return link;
  };
  ensure('icon');
  ensure('shortcut icon');
  const apple=ensure('apple-touch-icon');
  apple.removeAttribute('type');
  document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=href});
  document.documentElement.dataset.minecraftJavaIcon='official';
}
applyOfficialJavaIconV156();
queueMicrotask(applyOfficialJavaIconV156);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyOfficialJavaIconV156,{once:true});
setTimeout(applyOfficialJavaIconV156,0);
setTimeout(applyOfficialJavaIconV156,500);
window.OFFICIAL_JAVA_EDITION_ICON=OFFICIAL_JAVA_EDITION_ICON_V156;
window.MINECRAFT_WEB_VERSION='0.15.6';
window.__voxelDiag?.log?.('V15.6 BRANDING: official Minecraft Java Edition icon applied to favicon and Apple web-app icon; no generated icon used.','ok');
