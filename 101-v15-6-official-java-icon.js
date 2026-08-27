/* Minecraft Web V15.7 — repository-local Minecraft: Java Edition branding icon.
 * The icon is stored at assets/branding/java-edition-icon.png and is used everywhere.
 */
const JAVA_EDITION_ICON_LOCAL='./assets/branding/java-edition-icon.png';
function applyJavaIconLocal(){
  const href=`${JAVA_EDITION_ICON_LOCAL}?v=0.15.7`;
  const head=document.head;if(!head)return;
  const ensure=(rel,type='image/png')=>{let link=head.querySelector(`link[rel="${rel}"]`);if(!link){link=document.createElement('link');link.rel=rel;head.appendChild(link)}if(type)link.type=type;link.href=href;return link};
  ensure('icon');ensure('shortcut icon');const apple=ensure('apple-touch-icon');apple.removeAttribute('type');
  document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=href});
  document.documentElement.dataset.minecraftJavaIcon='local';
}
applyJavaIconLocal();queueMicrotask(applyJavaIconLocal);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyJavaIconLocal,{once:true});
setTimeout(applyJavaIconLocal,250);
window.OFFICIAL_JAVA_EDITION_ICON=JAVA_EDITION_ICON_LOCAL;
window.__voxelDiag?.log?.('V15.7 BRANDING: local Java Edition icon applied to favicon, Safari and Apple web-app metadata.','ok');
