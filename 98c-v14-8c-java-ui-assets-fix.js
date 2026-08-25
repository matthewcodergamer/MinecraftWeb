/* ===================== V14.8C2: PRISMARINE JAVA UI ASSET PATH FIX ===================== */
const STUDIO_V14_8C2=Object.freeze({version:'0.14.8c2-java-ui-assets'});
window.STUDIO_PATCH_VERSION=STUDIO_V14_8C2.version;
const JAVA_ROOT_V148C2='https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/';
(function(){
  const s=document.createElement('style');
  s.id='v148c2JavaAssetFix';
  s.textContent=`
:root{--java-dirt:url('${JAVA_ROOT_V148C2}blocks/dirt.png')!important}
.javaTitleV145 #javaEditionLogoV148C2{display:block;width:min(260px,48vw);height:auto;margin:-22px auto 8px;image-rendering:pixelated;filter:drop-shadow(2px 3px 0 #0008)}
.v148DefaultPackIcon{background-image:url('${JAVA_ROOT_V148C2}blocks/grass_block_side.png')!important;background-size:cover!important;background-position:center!important}
#titleContent .v148PacksBtn{display:none!important}
`;
  document.head.appendChild(s);
})();
function ensureJavaEditionMarkV148C2(){
  const content=document.getElementById('titleContent'),logo=content?.querySelector('#mcLogo');if(!content||!logo)return;
  let ed=content.querySelector('#javaEditionLogoV148C2');if(!ed){ed=document.createElement('img');ed.id='javaEditionLogoV148C2';ed.alt='Java Edition';ed.src=`${JAVA_ROOT_V148C2}gui/title/edition.png`;logo.insertAdjacentElement('afterend',ed)}
  const packs=[...content.querySelectorAll('button')].filter(b=>/resource\s*packs|texture\s*packs/i.test((b.textContent||'').trim()));
  const keep=content.querySelector('#v9Packs')||packs[0];packs.forEach(b=>{if(b!==keep)b.remove()});if(keep)keep.textContent='Resource Packs...';
}
const obV148C2=new MutationObserver(ensureJavaEditionMarkV148C2);const titleV148C2=document.getElementById('titleContent');if(titleV148C2)obV148C2.observe(titleV148C2,{childList:true,subtree:false});
queueMicrotask(ensureJavaEditionMarkV148C2);
window.addEventListener('load',ensureJavaEditionMarkV148C2,{once:true});
