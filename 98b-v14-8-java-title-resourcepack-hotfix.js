/* ===================== V14.8B: JAVA TITLE / SINGLE RESOURCE PACK BUTTON ===================== */
const STUDIO_V14_8B=Object.freeze({version:'0.14.8b-java-title-resourcepack-hotfix'});
window.STUDIO_PATCH_VERSION=STUDIO_V14_8B.version;

/* Java UI fidelity: the title screen already owns the correct Java-style Resource Packs button
   (#v9Packs) beside Options. V14.8 accidentally added a second full-width Resource Packs button.
   This hotfix removes the duplicate and routes the existing Java button into the Photon/resource
   pack panel. Java UI art remains sourced from PrismarineJS minecraft-assets via JAVA_ASSET_ROOT_V145;
   Bedrock/Mojang repositories remain separate fallback/reference sources. */
(function installV148BJavaTitleHotfix(){
  document.getElementById('v148bJavaTitleStyle')?.remove();
  const style=document.createElement('style');
  style.id='v148bJavaTitleStyle';
  style.textContent=`
#titleContent.javaTitleV145{width:min(92vw,500px)!important;gap:6px!important;padding:0!important;overflow:visible!important}
#titleContent.javaTitleV145>.v148PacksBtn{display:none!important}
#titleContent.javaTitleV145 .v9MenuRow{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
#titleContent.javaTitleV145 .v9MenuRow>.v9MenuBtn{width:100%!important;min-width:0!important;margin:0!important}
#titleContent.javaTitleV145>#v9Singleplayer,#titleContent.javaTitleV145>#v9Multiplayer{width:100%!important}
@media(orientation:landscape) and (max-height:520px){
  #titleContent.javaTitleV145{transform:scale(.82)!important;transform-origin:center!important}
}
`;
  document.head.appendChild(style);
})();

function removeDuplicateResourcePackButtonsV148B(){
  document.querySelectorAll('#titleContent .v148PacksBtn').forEach(el=>el.remove());
  const content=document.getElementById('titleContent');
  if(!content)return;
  const packButtons=[...content.querySelectorAll('button')].filter(b=>/resource\s*packs/i.test((b.textContent||'').trim()));
  for(let i=1;i<packButtons.length;i++)packButtons[i].remove();
}

function wireJavaResourcePackButtonV148B(){
  removeDuplicateResourcePackButtonsV148B();
  const btn=document.getElementById('v9Packs');
  if(!btn)return;
  btn.textContent='Resource Packs...';
  btn.onclick=()=>{
    const panel=ensureResourcePackPanelV148?.();
    if(panel){panel.classList.add('open');renderResourcePacksV148?.();}
  };
}

const v148bBuildTitleBase=typeof v9BuildTitle==='function'?v9BuildTitle:null;
if(v148bBuildTitleBase){
  v9BuildTitle=function(...args){
    const r=v148bBuildTitleBase.apply(this,args);
    queueMicrotask(()=>{
      removeDuplicateResourcePackButtonsV148B();
      wireJavaResourcePackButtonV148B();
      ensureHotbarBottomV148?.();
    });
    return r;
  };
}

const v148bBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){
  const r=await v148bBootBase.apply(this,args);
  removeDuplicateResourcePackButtonsV148B();
  wireJavaResourcePackButtonV148B();
  window.__voxelDiag?.log?.('V14.8B READY: one Java-style Resource Packs button, Java title layout restored, PrismarineJS Java UI asset path preserved.','ok');
  return r;
};

/* Older patches can rebuild the title asynchronously. Keep this cheap and event-driven instead of
   polling every frame. */
const v148bTitleObserver=new MutationObserver(()=>{
  removeDuplicateResourcePackButtonsV148B();
  wireJavaResourcePackButtonV148B();
});
const v148bTitleContent=document.getElementById('titleContent');
if(v148bTitleContent)v148bTitleObserver.observe(v148bTitleContent,{childList:true,subtree:false});
queueMicrotask(()=>{removeDuplicateResourcePackButtonsV148B();wireJavaResourcePackButtonV148B();});
