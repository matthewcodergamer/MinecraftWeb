/* ===================== V14.8C: JAVA UI FIDELITY + SINGLE RESOURCE PACK ENTRY ===================== */
const STUDIO_V14_8B=Object.freeze({version:'0.14.8c-java-ui-fidelity'});
window.STUDIO_PATCH_VERSION=STUDIO_V14_8B.version;

/*
 * Java client UI source of truth:
 *   PrismarineJS/minecraft-assets -> Java GUI sprites/layout art
 *   Mojang bedrock-samples       -> Bedrock data/fallback/reference only
 *
 * This patch intentionally does NOT create a second resource-pack system.
 * It routes the one Java Resource Packs button into the already-existing V14.8 pack manager.
 */
const JAVA_UI_ROOT_V148C='https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/';
const JAVA_GUI_V148C=`${JAVA_UI_ROOT_V148C}gui/`;
const JAVA_TEX_V148C=`${JAVA_UI_ROOT_V148C}texture/`;
window.JAVA_UI_ROOT_V148C=JAVA_UI_ROOT_V148C;

(function installV148CStyles(){
  document.getElementById('v148bJavaTitleStyle')?.remove();
  const style=document.createElement('style');
  style.id='v148bJavaTitleStyle';
  style.textContent=`
:root{
 --java-btn:url('${JAVA_GUI_V148C}sprites/widget/button.png');
 --java-btn-hi:url('${JAVA_GUI_V148C}sprites/widget/button_highlighted.png');
 --java-dirt:url('${JAVA_UI_ROOT_V148C}block/dirt.png');
}
#titleContent.javaTitleV145{width:min(92vw,500px)!important;gap:6px!important;padding:0!important;overflow:visible!important;max-height:none!important}
#titleContent.javaTitleV145 #mcLogo{width:min(82vw,470px)!important;max-height:28vh!important;object-fit:contain!important;margin:0 auto 8px!important;image-rendering:auto!important}
#titleContent.javaTitleV145>.v148PacksBtn{display:none!important}
#titleContent.javaTitleV145 .v9MenuRow{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
#titleContent.javaTitleV145 .v9MenuRow>.v9MenuBtn{width:100%!important;min-width:0!important;margin:0!important}
#titleContent.javaTitleV145>#v9Singleplayer,#titleContent.javaTitleV145>#v9Multiplayer,#titleContent.javaTitleV145>#v148QuitGame{width:100%!important}
.javaButtonV148C,.v9MenuBtn,.mc-btn,.v148PackClose,.v148PackToggle,.v148PackProfile{
 border:0!important;border-radius:0!important;min-height:40px!important;color:#fff!important;
 background:#777 var(--java-btn) center/100% 100% no-repeat!important;
 box-shadow:none!important;text-shadow:2px 2px #222!important;
 font:700 15px/1 ui-monospace,'Courier New',monospace!important;image-rendering:pixelated!important;
}
.javaButtonV148C:hover,.v9MenuBtn:hover,.mc-btn:hover,.v148PackClose:hover,.v148PackToggle:hover{background-image:var(--java-btn-hi)!important}
.javaButtonV148C:active,.v9MenuBtn:active,.mc-btn:active,.v148PackClose:active,.v148PackToggle:active{filter:brightness(.8)}
.javaTextV148C{font-family:ui-monospace,'Courier New',monospace;color:#fff;text-shadow:2px 2px #111}
.javaDirtScreenV148C{position:absolute;inset:0;z-index:270;display:flex;align-items:center;justify-content:center;padding:max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));background:#33291f var(--java-dirt) repeat;background-size:32px 32px;image-rendering:pixelated;overflow:hidden}
.javaPanelV148C{width:min(760px,94vw);max-height:92vh;display:flex;flex-direction:column;color:#fff;font-family:ui-monospace,'Courier New',monospace}
.javaTitleTextV148C{text-align:center;font-size:20px;margin:0 0 9px;text-shadow:2px 2px #111}
.javaSubTextV148C{text-align:center;color:#aaa;font-size:12px;margin:-3px 0 10px;text-shadow:1px 1px #111}
.javaInputV148C{height:42px;background:#000;border:2px solid #aaa;color:#fff;padding:6px 10px;font:16px ui-monospace,'Courier New',monospace;outline:none}
.javaInputV148C:focus{border-color:#fff}
.javaTabsV148C{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:12px}.javaTabsV148C button.active{outline:2px solid #fff;outline-offset:-3px}
.javaWorldBodyV148C{min-height:0;overflow:auto;padding:14px 12px;background:rgba(0,0,0,.64);border:2px solid #17120e;box-shadow:inset 0 0 0 1px #5b4a39;touch-action:pan-y}
.javaSettingRowV148C{display:grid;grid-template-columns:1fr minmax(170px,42%);gap:14px;align-items:center;margin:8px 0}.javaSettingRowV148C>span{font-size:14px;text-shadow:2px 2px #111}
.javaFooterV148C{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
#resourcePackPanelV148{background:#33291f var(--java-dirt) repeat!important;background-size:32px 32px!important;image-rendering:pixelated!important;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))!important}
#resourcePackPanelV148 .v148PackWindow{width:min(850px,96vw)!important;max-height:94vh!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;color:#fff!important;overflow:hidden!important}
#resourcePackPanelV148 .v148PackTitle{font:700 20px ui-monospace,'Courier New',monospace!important;color:#fff!important;text-shadow:2px 2px #111!important;margin:2px 0 4px!important}
#resourcePackPanelV148 .v148PackSubtitle{text-align:center;color:#777;font:13px ui-monospace,'Courier New',monospace;margin-bottom:10px}
.v148JavaPackColumns{display:grid;grid-template-columns:1fr 1fr;gap:18px;height:min(62vh,470px)}
.v148JavaPackColumn{position:relative;background:rgba(0,0,0,.72);border:2px solid #17120e;overflow:auto;padding:42px 8px 8px;touch-action:pan-y}
.v148JavaPackColumn>h3{position:absolute;top:5px;left:0;right:0;text-align:center;margin:0;color:#fff;text-decoration:underline;font:700 18px ui-monospace,'Courier New',monospace;text-shadow:2px 2px #111}
.v148PackCard{grid-template-columns:66px 1fr!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:5px 0!important;padding:4px!important;color:#fff!important;text-shadow:2px 2px #111!important;cursor:pointer!important}
.v148PackCard.selected{background:rgba(255,255,255,.10)!important}.v148PackCard:hover{background:rgba(255,255,255,.08)!important}
.v148PackIcon{width:62px!important;height:62px!important;border:1px solid #111!important;image-rendering:pixelated!important}.v148PackName{font:700 15px ui-monospace,'Courier New',monospace!important}.v148PackDesc{font:12px/1.25 ui-monospace,'Courier New',monospace!important;color:#aaa!important;text-shadow:1px 1px #111!important}.v148PackMeta{display:none!important}.v148PackActions{display:none!important}
.v148DefaultPackIcon{width:62px;height:62px;background:url('${JAVA_UI_ROOT_V148C}block/grass_block_side.png') center/cover no-repeat;border:1px solid #111;image-rendering:pixelated}
.v148PackBottom{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:10px}.v148PackBottom button{width:100%}
@media(max-width:680px){.v148JavaPackColumns{gap:8px;height:min(66vh,430px)}.v148JavaPackColumn{padding:36px 5px 5px}.v148PackIcon,.v148DefaultPackIcon{width:46px!important;height:46px!important}.v148PackCard{grid-template-columns:50px 1fr!important}.v148PackDesc{font-size:10px!important}}
@media(orientation:landscape) and (max-height:520px){#titleContent.javaTitleV145{transform:scale(.78)!important;transform-origin:center!important}.javaPanelV148C{max-height:95vh}.javaWorldBodyV148C{padding:8px}.v148JavaPackColumns{height:58vh}}
`;
  document.head.appendChild(style);
})();

function removeDuplicateResourcePackButtonsV148B(){
  document.querySelectorAll('#titleContent .v148PacksBtn').forEach(el=>el.remove());
  const content=document.getElementById('titleContent');
  if(!content)return;
  const buttons=[...content.querySelectorAll('button')];
  const packButtons=buttons.filter(b=>/resource\s*packs|texture\s*packs/i.test((b.textContent||'').trim()));
  const keeper=content.querySelector('#v9Packs')||packButtons[0];
  for(const b of packButtons)if(b!==keeper)b.remove();
}

/* -------- Java-style Resource Packs screen: one entry point, two columns -------- */
ensureResourcePackPanelV148=function(){
  let panel=document.getElementById('resourcePackPanelV148');
  if(!panel){panel=document.createElement('div');panel.id='resourcePackPanelV148';document.getElementById('titleScreen')?.appendChild(panel)}
  panel.innerHTML=`<div class="v148PackWindow"><div class="v148PackTitle">Select Resource Packs</div><div class="v148PackSubtitle">Select packs to change the look and feel of Minecraft Web</div><div class="v148JavaPackColumns"><section class="v148JavaPackColumn"><h3>Available</h3><div id="v148AvailablePacks"></div></section><section class="v148JavaPackColumn"><h3>Selected</h3><div id="v148SelectedPacks"></div></section></div><div class="v148PackBottom"><button class="javaButtonV148C" id="v148OpenPackInfo">Open Pack Folder</button><button class="javaButtonV148C" id="v148PackClose">Done</button></div></div>`;
  panel.onclick=e=>{if(e.target===panel)panel.classList.remove('open')};
  panel.querySelector('#v148PackClose').onclick=()=>panel.classList.remove('open');
  panel.querySelector('#v148OpenPackInfo').onclick=()=>toast?.('Web resource packs are stored by MinecraftWeb and loaded from GitHub/PrismarineJS.');
  renderResourcePacksV148();
  return panel;
};
renderResourcePacksV148=function(){
  const available=document.getElementById('v148AvailablePacks'),selected=document.getElementById('v148SelectedPacks');if(!available||!selected)return;
  const profile=window.game?.photonV148?.profile||localStorage.getItem(STUDIO_V14_8.profileStorage)||'Lite';
  const card=pack=>`<div class="v148PackCard ${resourcePacksV148.enabled(pack.id)?'selected':''}" data-pack-card="${pack.id}"><img class="v148PackIcon" src="${pack.icon}" alt="${pack.name}"><div><div class="v148PackName">${pack.name}${pack.profiles?` • ${profile}`:''}</div><div class="v148PackDesc">${pack.description}</div></div></div>`;
  available.innerHTML=RESOURCE_PACKS.filter(p=>!resourcePacksV148.enabled(p.id)).map(card).join('')||'<div class="javaTextV148C" style="color:#777;padding:8px">No disabled packs</div>';
  selected.innerHTML=`<div class="v148PackCard selected" data-default-pack="1"><div class="v148DefaultPackIcon"></div><div><div class="v148PackName">Default</div><div class="v148PackDesc">The default look and feel of Minecraft Web.</div></div></div>`+RESOURCE_PACKS.filter(p=>resourcePacksV148.enabled(p.id)).map(card).join('');
  document.querySelectorAll('[data-pack-card]').forEach(el=>el.onclick=()=>{const id=el.dataset.packCard;resourcePacksV148.toggle(id);renderResourcePacksV148();});
  document.querySelectorAll('[data-pack-card="photon-web"]').forEach(el=>el.oncontextmenu=e=>{e.preventDefault();const order=['Lite','Balanced','High','Ultra'];const cur=window.game?.photonV148?.profile||profile,next=order[(order.indexOf(cur)+1)%order.length];window.game?.photonV148?.setProfile?.(next);try{localStorage.setItem(STUDIO_V14_8.profileStorage,next)}catch{}renderResourcePacksV148();return false;});
};

function openResourcePacksV148C(){const panel=ensureResourcePackPanelV148();panel.classList.add('open');renderResourcePacksV148()}

/* -------- Java-style title screen -------- */
function buildJavaTitleV148C(){
  const content=document.getElementById('titleContent');if(!content)return;
  content.className='v9Title javaTitleV145';
  const logo=window.__javaLocalAssetsV144?'./assets/java/gui/title/minecraft.png':`${JAVA_GUI_V148C}title/minecraft.png`;
  content.innerHTML=`<img id="mcLogo" src="${logo}" alt="Minecraft Java Edition"><div class="javaSplashV145">Java-first web edition!</div><button class="v9MenuBtn" id="v9Singleplayer">Singleplayer</button><button class="v9MenuBtn" id="v9Multiplayer">Multiplayer</button><div class="v9MenuRow"><button class="v9MenuBtn" id="v9Packs">Resource Packs...</button><button class="v9MenuBtn" id="v9TitleOptions">Options...</button></div><button class="v9MenuBtn" id="v148QuitGame">Quit Game</button><div class="v9Small">Minecraft Web Alpha 0.14.8c • Java UI assets via PrismarineJS • Three.js r180</div>`;
  document.getElementById('v9Singleplayer').onclick=v9WorldSelect;
  document.getElementById('v9Multiplayer').onclick=()=>toast?.('Multiplayer transport is not connected yet.');
  document.getElementById('v9Packs').onclick=openResourcePacksV148C;
  document.getElementById('v9TitleOptions').onclick=v9TitleOptions;
  document.getElementById('v148QuitGame').onclick=()=>toast?.('Browsers do not allow a web page to close itself unless it opened the tab.');
  removeDuplicateResourcePackButtonsV148B();
}
v9BuildTitle=buildJavaTitleV148C;

/* -------- Java-style world creation -------- */
function javaCreateWorldScreenV148C(){
  const content=document.getElementById('titleContent');if(!content)return;
  content.className='v9Title javaTitleV145';
  content.innerHTML=`<section class="javaPanelV148C"><div class="javaTitleTextV148C">Create New World</div><div class="javaTabsV148C"><button class="javaButtonV148C active">Game</button><button class="javaButtonV148C" id="v148WorldTab">World</button><button class="javaButtonV148C" id="v148MoreTab">More</button></div><div class="javaWorldBodyV148C"><div class="javaTextV148C" style="margin-bottom:5px">World Name</div><input id="v148WorldName" class="javaInputV148C" value="New World" maxlength="32"><div class="javaSettingRowV148C"><span>Game Mode</span><button class="javaButtonV148C" id="v148Mode">Survival</button></div><div class="javaSettingRowV148C"><span>Difficulty</span><button class="javaButtonV148C" id="v148Difficulty">Normal</button></div><div class="javaSettingRowV148C"><span>Allow Commands</span><button class="javaButtonV148C" id="v148Commands">OFF</button></div><div class="javaSettingRowV148C"><span>Keep Inventory</span><button class="javaButtonV148C" id="v148KeepInv">OFF</button></div></div><div class="javaFooterV148C"><button class="javaButtonV148C" id="v148CreateNow">Create New World</button><button class="javaButtonV148C" id="v148CreateCancel">Cancel</button></div></section>`;
  let mode='survival',difficulty='Normal',commands=false,keep=false;
  document.getElementById('v148Mode').onclick=e=>{mode=mode==='survival'?'creative':'survival';e.currentTarget.textContent=mode[0].toUpperCase()+mode.slice(1)};
  document.getElementById('v148Difficulty').onclick=e=>{const a=['Peaceful','Easy','Normal','Hard'];difficulty=a[(a.indexOf(difficulty)+1)%a.length];e.currentTarget.textContent=difficulty};
  document.getElementById('v148Commands').onclick=e=>{commands=!commands;e.currentTarget.textContent=commands?'ON':'OFF'};
  document.getElementById('v148KeepInv').onclick=e=>{keep=!keep;e.currentTarget.textContent=keep?'ON':'OFF'};
  document.getElementById('v148WorldTab').onclick=()=>toast?.('World generation controls are being translated into the Java-style screen.');
  document.getElementById('v148MoreTab').onclick=()=>toast?.('More world settings are being translated into the Java-style screen.');
  document.getElementById('v148CreateCancel').onclick=v9WorldSelect;
  document.getElementById('v148CreateNow').onclick=()=>{try{localStorage.setItem('minecraftWebWorldUiV148C',JSON.stringify({name:document.getElementById('v148WorldName').value||'New World',mode,difficulty,commands,keepInventory:keep}))}catch{}game.newWorld(mode)};
}

const v148cWorldSelectBase=v9WorldSelect;
v9WorldSelect=function(){
  const content=document.getElementById('titleContent');if(!content)return;
  content.className='v9Title javaTitleV145';
  content.innerHTML=`<section class="javaPanelV148C"><div class="javaTitleTextV148C">Select World</div><div class="javaWorldBodyV148C"><div class="v9WorldCard"><div class="v9WorldThumb"></div><div class="javaTextV148C"><b>New World</b><div class="v9Small" style="text-align:left">Survival Mode<br>Local browser save • seed ${game.seed}</div></div></div></div><button class="v9MenuBtn" id="v148PlaySelected">Play Selected World</button><button class="v9MenuBtn" id="v148CreateWorld">Create New World</button><div class="v9MenuRow"><button class="v9MenuBtn" id="v148EditWorld">Edit</button><button class="v9MenuBtn" id="v148WorldCancel">Cancel</button></div></section>`;
  document.getElementById('v148PlaySelected').onclick=()=>game.boot('survival',false);
  document.getElementById('v148CreateWorld').onclick=javaCreateWorldScreenV148C;
  document.getElementById('v148EditWorld').onclick=javaCreateWorldScreenV148C;
  document.getElementById('v148WorldCancel').onclick=buildJavaTitleV148C;
};

function wireJavaResourcePackButtonV148B(){removeDuplicateResourcePackButtonsV148B();const btn=document.getElementById('v9Packs');if(btn){btn.textContent='Resource Packs...';btn.onclick=openResourcePacksV148C}}

const v148bBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){
  const r=await v148bBootBase.apply(this,args);
  removeDuplicateResourcePackButtonsV148B();wireJavaResourcePackButtonV148B();ensureHotbarBottomV148?.();
  window.__voxelDiag?.log?.('V14.8C READY: one Resource Packs button; Java title/world/resource-pack styling sourced from PrismarineJS.','ok');
  return r;
};

const v148bTitleObserver=new MutationObserver(()=>{removeDuplicateResourcePackButtonsV148B();wireJavaResourcePackButtonV148B()});
const v148bTitleContent=document.getElementById('titleContent');if(v148bTitleContent)v148bTitleObserver.observe(v148bTitleContent,{childList:true,subtree:false});
queueMicrotask(()=>{buildJavaTitleV148C();removeDuplicateResourcePackButtonsV148B();wireJavaResourcePackButtonV148B()});
