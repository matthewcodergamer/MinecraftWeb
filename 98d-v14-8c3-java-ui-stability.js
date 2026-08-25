/* ===================== V14.8C3: JAVA UI STABILITY + SINGLE RESOURCE PACK ENTRY ===================== */
const STUDIO_V14_8C3=Object.freeze({version:'0.14.8c3-java-ui-stability'});
window.STUDIO_PATCH_VERSION=STUDIO_V14_8C3.version;
const JAVA_ROOT_V148C3='https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/';

(function installJavaUIV148C3(){
  document.getElementById('v148c3JavaUI')?.remove();
  const style=document.createElement('style');
  style.id='v148c3JavaUI';
  style.textContent=`
:root{
 --java-button:url('${JAVA_ROOT_V148C3}gui/sprites/widget/button.png');
 --java-button-hi:url('${JAVA_ROOT_V148C3}gui/sprites/widget/button_highlighted.png');
 --java-dirt:url('${JAVA_ROOT_V148C3}blocks/dirt.png');
}
html,body,#app{margin:0!important;width:100%!important;height:100%!important;width:100dvw!important;height:100dvh!important;overflow:hidden!important;overscroll-behavior:none!important;background:#000!important}
#titleScreen,#screenLayer{overscroll-behavior:none!important}
#titleContent.javaTitleV145{width:min(500px,92vw)!important;gap:6px!important;padding:0!important;overflow:visible!important;max-height:none!important}
#titleContent.javaTitleV145 #mcLogo{display:block!important;width:min(470px,82vw)!important;max-height:28vh!important;object-fit:contain!important;margin:0 auto!important;filter:drop-shadow(0 4px #0008)!important}
#titleContent.javaTitleV145 #javaEditionLogoV148C2{display:block!important;width:min(250px,46vw)!important;height:auto!important;margin:-24px auto 7px!important;image-rendering:pixelated!important;filter:drop-shadow(2px 3px #0008)!important}
#titleContent.javaTitleV145 .javaSplashV145{position:absolute!important;left:58%!important;top:22%!important;transform:rotate(-18deg)!important;color:#ffff55!important;font:700 16px/1 ui-monospace,'Courier New',monospace!important;text-shadow:2px 2px #3f3f00!important;white-space:nowrap!important;pointer-events:none!important}
#titleContent .v148PacksBtn,#titleContent #bootResourcePacks{display:none!important}
#titleContent .v9MenuRow{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
#titleContent .v9MenuBtn,.javaButtonV148C,.mc-btn,.v148PackClose,.v148PackToggle,.v148PackProfile{
 border:0!important;border-radius:0!important;min-height:40px!important;background:#777 var(--java-button) center/100% 100% no-repeat!important;color:#fff!important;box-shadow:none!important;text-shadow:2px 2px #222!important;font:700 15px/1 ui-monospace,'Courier New',monospace!important;image-rendering:pixelated!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important}
#titleContent .v9MenuBtn:hover,#titleContent .v9MenuBtn:focus-visible,.javaButtonV148C:hover,.mc-btn:hover{background-image:var(--java-button-hi)!important;outline:none!important}
#titleContent .v9MenuBtn:active,.javaButtonV148C:active,.mc-btn:active{filter:brightness(.8)!important}
.javaDirtScreenV148C,#resourcePackPanelV148{background:#33291f var(--java-dirt) repeat!important;background-size:32px 32px!important;image-rendering:pixelated!important}
#resourcePackPanelV148 .v148PackWindow{width:min(850px,96vw)!important;max-height:94dvh!important;background:transparent!important;border:0!important;box-shadow:none!important;color:#fff!important}
#resourcePackPanelV148 .v148PackTitle{color:#fff!important;text-shadow:2px 2px #111!important}
#hotbar,#hotbar.javaHotbarV144{position:absolute!important;top:auto!important;left:50%!important;right:auto!important;bottom:max(10px,calc(env(safe-area-inset-bottom) + 6px))!important;transform:translateX(-50%)!important;margin:0!important;z-index:42!important}
#loading{z-index:400!important}
@media(orientation:landscape) and (max-height:520px){#titleContent.javaTitleV145{transform:scale(.77)!important;transform-origin:center!important}.javaPanelV148C{max-height:94dvh!important}.javaWorldBodyV148C{padding:8px!important}}
@media(max-width:620px){#titleContent.javaTitleV145 .javaSplashV145{font-size:12px!important;top:20%!important;left:55%!important}}
`;
  document.head.appendChild(style);
})();

function sanitizeResourcePackButtonsV148C3(){
  const content=document.getElementById('titleContent');
  if(!content)return;
  const candidates=[...content.querySelectorAll('button')].filter(b=>/resource\s*packs|texture\s*packs/i.test((b.textContent||'').trim()));
  let keeper=content.querySelector('#v9Packs');
  if(!keeper&&candidates.length){keeper=candidates[0];keeper.id='v9Packs';}
  candidates.forEach(b=>{if(b!==keeper)b.remove()});
  if(keeper){
    keeper.textContent='Resource Packs...';
    keeper.disabled=false;
    keeper.onclick=()=>{const p=ensureResourcePackPanelV148?.();if(p){p.classList.add('open');renderResourcePacksV148?.();}};
  }
}

function ensureJavaTitleStructureV148C3(){
  const content=document.getElementById('titleContent');if(!content)return;
  sanitizeResourcePackButtonsV148C3();
  const logo=content.querySelector('#mcLogo');
  if(logo){
    logo.src=`${JAVA_ROOT_V148C3}gui/title/minecraft.png`;
    logo.alt='Minecraft';
    let edition=content.querySelector('#javaEditionLogoV148C2,#javaEditionLogoV148C3');
    if(!edition){edition=document.createElement('img');edition.id='javaEditionLogoV148C3';edition.alt='Java Edition';logo.insertAdjacentElement('afterend',edition)}
    edition.src=`${JAVA_ROOT_V148C3}gui/title/edition.png`;
  }
}

/* V14.8 originally appended a second Resource Packs button. From this point forward,
   that hook becomes a sanitizer only. The Java title's #v9Packs is the one authoritative entry. */
if(typeof addResourcePackTitleButtonV148==='function'){
  addResourcePackTitleButtonV148=function(){sanitizeResourcePackButtonsV148C3();};
}

if(typeof v9BuildTitle==='function'){
  const buildBaseV148C3=v9BuildTitle;
  v9BuildTitle=function(...args){
    const result=buildBaseV148C3.apply(this,args);
    queueMicrotask(()=>{ensureJavaTitleStructureV148C3();sanitizeResourcePackButtonsV148C3();ensureHotbarBottomV148?.();});
    return result;
  };
}

/* Make the pack screen match Java's Available / Selected flow while keeping exactly one
   pack manager and one title entry point. */
if(typeof ensureResourcePackPanelV148==='function'){
  const panelBaseV148C3=ensureResourcePackPanelV148;
  ensureResourcePackPanelV148=function(){
    const panel=panelBaseV148C3();
    if(panel){
      const title=panel.querySelector('.v148PackTitle');if(title)title.textContent='Select Resource Packs';
      let sub=panel.querySelector('.v148PackSubtitle');if(sub)sub.textContent='Select packs to change the look and feel of Minecraft Web';
    }
    return panel;
  };
}

/* Core compatibility: older source still expects resetBtn. index.html now contains a hidden
   compatibility control; keep it inert and out of every Java screen. */
const resetCompatV148C3=document.getElementById('resetBtn');
if(resetCompatV148C3){resetCompatV148C3.hidden=true;resetCompatV148C3.style.display='none';}

const titleObserverV148C3=new MutationObserver(()=>queueMicrotask(ensureJavaTitleStructureV148C3));
const titleContentV148C3=document.getElementById('titleContent');
if(titleContentV148C3)titleObserverV148C3.observe(titleContentV148C3,{childList:true,subtree:false});
addEventListener('resize',()=>{ensureHotbarBottomV148?.();ensureJavaTitleStructureV148C3();},{passive:true});
addEventListener('orientationchange',()=>setTimeout(()=>{ensureHotbarBottomV148?.();ensureJavaTitleStructureV148C3();},80),{passive:true});
queueMicrotask(()=>{ensureJavaTitleStructureV148C3();sanitizeResourcePackButtonsV148C3();ensureHotbarBottomV148?.();});
window.__voxelDiag?.log?.('V14.8C3 Java UI stability installed: one Resource Packs button, PrismarineJS Java title/button assets, bottom hotbar enforcement, and resetBtn boot compatibility.','ok');
