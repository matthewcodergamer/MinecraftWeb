/* Compatibility branding bridge.
 * V15.8 canonical icon lives at assets/icon/minecraft-java-icon.png.
 */
const JAVA_EDITION_ICON_LOCAL='./assets/icon/minecraft-java-icon.png';
function applyJavaIconLocal(){
  const href=`${JAVA_EDITION_ICON_LOCAL}?v=0.15.8`;
  const head=document.head;if(!head)return;
  const ensure=(rel,type='image/png')=>{let link=head.querySelector(`link[rel="${rel}"]`);if(!link){link=document.createElement('link');link.rel=rel;head.appendChild(link)}if(type)link.type=type;link.href=href;return link};
  ensure('icon');ensure('shortcut icon');const apple=ensure('apple-touch-icon');apple.removeAttribute('type');
  document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=href});
  document.documentElement.dataset.minecraftJavaIcon='v158-local';
}
applyJavaIconLocal();queueMicrotask(applyJavaIconLocal);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyJavaIconLocal,{once:true});
setTimeout(applyJavaIconLocal,250);
window.OFFICIAL_JAVA_EDITION_ICON=JAVA_EDITION_ICON_LOCAL;
window.__voxelDiag?.log?.('V15.8 BRANDING compatibility bridge points to the canonical local Java icon.','ok');
