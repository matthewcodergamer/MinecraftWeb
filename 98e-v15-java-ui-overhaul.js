/* ===================== V15: JAVA EDITION UI OVERHAUL ===================== */
const STUDIO_V15=Object.freeze({version:'0.15.0-java-ui-overhaul'});
window.STUDIO_PATCH_VERSION=STUDIO_V15.version;
window.MINECRAFT_WEB_VERSION='0.15.0';
const JAVA_ASSET_ROOT_V15='https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.8/';
const V15_PREFS_KEY='minecraftWebV15VideoPrefs';

const v15$=(id)=>document.getElementById(id);
function v15Clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function v15Prefs(){try{return Object.assign({graphics:'Fancy',renderDistance:10,simulationDistance:8,clouds:'Fancy',smoothLighting:'High',entityShadows:true,brightness:50,guiScale:'Auto',fullscreen:false,photonProfile:localStorage.getItem('minecraftWebPhotonProfileV148')||'Lite',renderer:'Auto',bloom:35,volumetricFog:true,cloudQuality:'High',waterQuality:'Reflective',ao:'SSAO',aa:'FXAA',sharpening:25,fpsGraph:false,chunkDiagnostics:false},JSON.parse(localStorage.getItem(V15_PREFS_KEY)||'{}'));}catch{return {};}}
function v15SavePrefs(p){try{localStorage.setItem(V15_PREFS_KEY,JSON.stringify(p));}catch{}}

(function installV15Styles(){
 document.getElementById('minecraftWebV15Styles')?.remove();
 const s=document.createElement('style');s.id='minecraftWebV15Styles';
 s.textContent=`
:root{--v15-btn:url('${JAVA_ASSET_ROOT_V15}gui/sprites/widget/button.png');--v15-btn-hi:url('${JAVA_ASSET_ROOT_V15}gui/sprites/widget/button_highlighted.png');--v15-dirt:url('${JAVA_ASSET_ROOT_V15}blocks/dirt.png');--v15-font:ui-monospace,'Courier New',monospace}
html,body,#app{width:100%!important;height:100%!important;width:100dvw!important;height:100dvh!important;margin:0!important;overflow:hidden!important;overscroll-behavior:none!important;background:#000!important}
#titleScreen{overflow:hidden!important;touch-action:manipulation!important}
#titleContent.javaTitleV15{position:relative!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:min(430px,84vw)!important;gap:6px!important;padding:0!important;max-height:calc(100dvh - max(18px,env(safe-area-inset-top)) - max(18px,env(safe-area-inset-bottom)))!important;overflow:visible!important}
#titleContent.javaTitleV15 #mcLogo{width:min(500px,82vw)!important;max-height:28vh!important;object-fit:contain!important;margin:0 auto!important;filter:drop-shadow(0 4px #0008)!important;image-rendering:auto!important}
#titleContent.javaTitleV15 #javaEditionV15{width:min(238px,44vw)!important;height:auto!important;margin:-31px auto 7px!important;image-rendering:pixelated!important;filter:drop-shadow(2px 3px #0008)!important}
#titleContent.javaTitleV15 .javaSplashV15{position:absolute!important;left:60%!important;top:17%!important;transform:rotate(-18deg)!important;color:#ffff55!important;font:700 clamp(10px,1.55vw,17px)/1 var(--v15-font)!important;text-shadow:2px 2px #3f3f00!important;white-space:nowrap!important;pointer-events:none!important}
.v15JavaBtn,.v15Control,.v15Done,.v15Back{appearance:none!important;border:0!important;border-radius:0!important;min-height:38px!important;background:#777 var(--v15-btn) center/100% 100% no-repeat!important;color:#fff!important;box-shadow:none!important;text-shadow:2px 2px #222!important;font:700 clamp(13px,1.5vw,18px)/1 var(--v15-font)!important;padding:0 12px!important;image-rendering:pixelated!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important}
.v15JavaBtn:hover,.v15JavaBtn:focus-visible,.v15Control:hover,.v15Control:focus-visible,.v15Done:hover,.v15Back:hover{background-image:var(--v15-btn-hi)!important;outline:none!important}.v15JavaBtn:active,.v15Control:active,.v15Done:active,.v15Back:active{filter:brightness(.82)!important}
#titleContent.javaTitleV15>.v15JavaBtn{width:100%!important}.v15TitleRow{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}.v15TitleRow .v15JavaBtn{width:100%!important}
.v15Footer{position:fixed;left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom));display:flex;justify-content:space-between;gap:8px;color:#fff;font:11px/1.2 var(--v15-font);text-shadow:1px 1px #111;pointer-events:none}
.v15Screen{position:absolute;inset:0;z-index:320;display:none;background:#33291f var(--v15-dirt) repeat;background-size:32px 32px;image-rendering:pixelated;color:#fff;overflow:hidden}.v15Screen.open{display:flex;flex-direction:column}.v15Screen::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.42);pointer-events:none}.v15Screen>*{position:relative;z-index:1}
.v15Header{text-align:center;padding:max(14px,env(safe-area-inset-top)) 10px 10px;font:700 clamp(16px,2vw,21px)/1 var(--v15-font);text-shadow:2px 2px #222;flex:0 0 auto}.v15Body{width:min(760px,94vw);margin:0 auto;flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 8px 86px}.v15Grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}.v15Grid .wide{grid-column:1/-1}.v15Bottom{position:absolute;left:50%;bottom:max(10px,calc(env(safe-area-inset-bottom) + 8px));transform:translateX(-50%);width:min(400px,86vw);display:grid;grid-template-columns:1fr;gap:8px;z-index:5}.v15Bottom.dual{grid-template-columns:1fr 1fr}
.v15RangeRow{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.v15RangeRow input[type=range]{grid-column:1/-1;width:100%;accent-color:#aaa}.v15SectionLabel{grid-column:1/-1;text-align:center;color:#ffff55;font:700 14px/1 var(--v15-font);margin:10px 0 2px;text-shadow:1px 1px #333}.v15Meta{font:11px/1.4 var(--v15-font);opacity:.78;text-align:center;margin:6px 0 10px}.v15Value{font:700 12px var(--v15-font);color:#ddd}
#resourcePackPanelV148{z-index:360!important;background:#33291f var(--v15-dirt) repeat!important;background-size:32px 32px!important;image-rendering:pixelated!important;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))!important;overflow:hidden!important}#resourcePackPanelV148 .v148PackWindow{width:min(860px,96vw)!important;max-width:96vw!important;height:min(620px,92dvh)!important;max-height:92dvh!important;overflow:auto!important;padding:10px!important}.v148PackCard{min-width:0!important}.v148PackDesc,.v148PackMeta{overflow-wrap:anywhere!important}
#loading.v15Loading{background:#33291f var(--v15-dirt) repeat!important;background-size:32px 32px!important;color:#fff!important;text-shadow:2px 2px #222!important;z-index:500!important}.v15Loading #loadingBar{width:min(520px,78vw)!important}
#hotbar,#hotbar.javaHotbarV144{top:auto!important;bottom:max(10px,calc(env(safe-area-inset-bottom) + 6px))!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important}
@media(orientation:landscape) and (max-height:520px){#titleContent.javaTitleV15{width:min(390px,70vw)!important;gap:4px!important;transform:scale(.84)!important;transform-origin:center!important}#titleContent.javaTitleV15 #mcLogo{max-height:25vh!important}#titleContent.javaTitleV15 #javaEditionV15{margin-top:-24px!important}.v15JavaBtn,.v15Control{min-height:34px!important}.v15Header{padding-top:max(7px,env(safe-area-inset-top));padding-bottom:5px}.v15Body{width:min(820px,95vw);padding-top:2px;padding-bottom:58px}.v15Grid{gap:5px 14px}.v15Bottom{bottom:max(5px,env(safe-area-inset-bottom));gap:5px}.v15Bottom .v15Done,.v15Bottom .v15Back{min-height:34px!important}#resourcePackPanelV148 .v148PackWindow{height:94dvh!important;max-height:94dvh!important}.v148PackIcon{width:48px!important;height:48px!important}}
@media(max-width:620px) and (orientation:portrait){#titleContent.javaTitleV15{width:min(420px,88vw)!important}.v15Grid{grid-template-columns:1fr;gap:7px}.v15Grid .wide{grid-column:auto}.v15Body{width:94vw}.v15Footer{font-size:9px}.v148PackCard{grid-template-columns:52px 1fr!important}.v148PackActions{grid-column:1/-1!important;flex-direction:row!important;justify-content:center!important}}
`;
 document.head.appendChild(s);
})();

function v15OpenScreen(id){document.querySelectorAll('.v15Screen').forEach(x=>x.classList.remove('open'));v15$(id)?.classList.add('open');}
function v15CloseScreens(){document.querySelectorAll('.v15Screen').forEach(x=>x.classList.remove('open'));}
function v15ShowToast(msg){if(typeof toast==='function'){try{return toast(msg)}catch{}}const t=v15$('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}}

function v15BuildTitle(){
 const content=v15$('titleContent');if(!content)return;
 content.className='javaTitleV15';
 content.innerHTML=`
  <img id="mcLogo" src="${JAVA_ASSET_ROOT_V15}gui/title/minecraft.png" alt="Minecraft">
  <img id="javaEditionV15" src="${JAVA_ASSET_ROOT_V15}gui/title/edition.png" alt="Java Edition">
  <div class="javaSplashV15">Java-first web edition!</div>
  <button id="playBtn" class="v15JavaBtn" type="button">Singleplayer</button>
  <button id="creativeBtn" class="v15JavaBtn" type="button">Multiplayer</button>
  <button id="v15Realms" class="v15JavaBtn" type="button">Minecraft Realms</button>
  <div class="v15TitleRow"><button id="v15Options" class="v15JavaBtn" type="button">Options...</button><button id="v15Quit" class="v15JavaBtn" type="button">Quit Game</button></div>`;
 const title=v15$('titleScreen');
 if(title&&!title.querySelector('.v15Footer')){const f=document.createElement('div');f.className='v15Footer';f.innerHTML='<span>Minecraft Web 0.15.0</span><span>Java UI • Three.js • Photon Web</span>';title.appendChild(f)}
 // Rebind title actions without replacing game semantics.
 const p=v15$('playBtn'),m=v15$('creativeBtn');
 if(p)p.onclick=()=>{if(window.game?.newWorld)window.game.newWorld('survival');else v15ShowToast('World engine is still loading…')};
 if(m)m.onclick=()=>v15ShowToast('Multiplayer is not available yet.');
 v15$('v15Realms').onclick=()=>v15ShowToast('Minecraft Realms is not available in Minecraft Web.');
 v15$('v15Options').onclick=()=>{v15EnsureScreens();v15OpenScreen('v15OptionsScreen')};
 v15$('v15Quit').onclick=()=>{try{window.close()}catch{}setTimeout(()=>v15ShowToast('Close this browser tab to quit.'),40)};
}

function v15EnsureScreens(){
 const title=v15$('titleScreen');if(!title)return;
 if(!v15$('v15OptionsScreen')){
  const sc=document.createElement('section');sc.id='v15OptionsScreen';sc.className='v15Screen';sc.innerHTML=`<div class="v15Header">Options</div><div class="v15Body"><div class="v15Grid"><button class="v15Control" id="v15Fov">FOV: Normal</button><button class="v15Control" id="v15Online">Online...</button><button class="v15Control" id="v15Skin">Skin Customization...</button><button class="v15Control" id="v15Sound">Music & Sounds...</button><button class="v15Control" id="v15Video">Video Settings...</button><button class="v15Control" id="v15Controls">Controls...</button><button class="v15Control" id="v15Language">Language...</button><button class="v15Control" id="v15Chat">Chat Settings...</button><button class="v15Control" id="v15Packs">Resource Packs...</button><button class="v15Control" id="v15Accessibility">Accessibility Settings...</button></div></div><div class="v15Bottom"><button class="v15Done" id="v15OptionsDone">Done</button></div>`;title.appendChild(sc);
  v15$('v15OptionsDone').onclick=v15CloseScreens;v15$('v15Packs').onclick=()=>{v15CloseScreens();const p=ensureResourcePackPanelV148?.();if(p){p.classList.add('open');renderResourcePacksV148?.()}};v15$('v15Video').onclick=()=>v15OpenScreen('v15VideoScreen');
  ['v15Online','v15Skin','v15Sound','v15Controls','v15Language','v15Chat','v15Accessibility'].forEach(id=>{v15$(id).onclick=()=>v15ShowToast(`${v15$(id).textContent.replace('...','')} — coming in V15.x`)})
 }
 if(!v15$('v15VideoScreen')){
  const sc=document.createElement('section');sc.id='v15VideoScreen';sc.className='v15Screen';sc.innerHTML=`<div class="v15Header">Video Settings</div><div class="v15Body"><div class="v15Grid" id="v15VideoGrid"></div></div><div class="v15Bottom"><button class="v15Back" id="v15VideoDone">Done</button></div>`;title.appendChild(sc);v15$('v15VideoDone').onclick=()=>v15OpenScreen('v15OptionsScreen');v15RenderVideoSettings();
 }
}

function v15Cycle(p,key,values,el,apply){let i=Math.max(0,values.indexOf(p[key]));i=(i+1)%values.length;p[key]=values[i];v15SavePrefs(p);el.textContent=`${el.dataset.label}: ${p[key]}`;apply?.(p[key]);}
function v15RenderVideoSettings(){
 const g=v15$('v15VideoGrid');if(!g)return;const p=v15Prefs();
 const rendererName=window.game?.renderer?.renderer?.isWebGPURenderer?'WebGPU':(window.game?.renderer?.renderer?'WebGL2':'Auto');
 g.innerHTML=`
 <div class="v15SectionLabel">Minecraft Video Settings</div>
 <button class="v15Control" data-cycle="graphics" data-label="Graphics">Graphics: ${p.graphics}</button><button class="v15Control" data-cycle="clouds" data-label="Clouds">Clouds: ${p.clouds}</button>
 <button class="v15Control" data-cycle="smoothLighting" data-label="Smooth Lighting">Smooth Lighting: ${p.smoothLighting}</button><button class="v15Control" data-bool="entityShadows" data-label="Entity Shadows">Entity Shadows: ${p.entityShadows?'ON':'OFF'}</button>
 <div class="v15RangeRow"><span>Render Distance</span><span class="v15Value" id="v15RenderDistanceValue">${p.renderDistance} chunks</span><input id="v15RenderDistance" type="range" min="2" max="32" value="${p.renderDistance}"></div>
 <div class="v15RangeRow"><span>Simulation Distance</span><span class="v15Value" id="v15SimulationValue">${p.simulationDistance} chunks</span><input id="v15Simulation" type="range" min="2" max="16" value="${p.simulationDistance}"></div>
 <div class="v15RangeRow"><span>Brightness</span><span class="v15Value" id="v15BrightnessValue">${p.brightness}%</span><input id="v15Brightness" type="range" min="0" max="100" value="${p.brightness}"></div>
 <button class="v15Control" data-cycle="guiScale" data-label="GUI Scale">GUI Scale: ${p.guiScale}</button><button class="v15Control" data-bool="fullscreen" data-label="Fullscreen">Fullscreen: ${p.fullscreen?'ON':'OFF'}</button>
 <div class="v15SectionLabel">Photon Graphics</div>
 <button class="v15Control" data-cycle="photonProfile" data-label="Photon Profile">Photon Profile: ${p.photonProfile}</button><button class="v15Control" data-cycle="renderer" data-label="Renderer">Renderer: ${p.renderer}</button>
 <button class="v15Control" data-bool="volumetricFog" data-label="Volumetric Fog">Volumetric Fog: ${p.volumetricFog?'ON':'OFF'}</button><button class="v15Control" data-cycle="cloudQuality" data-label="Cloud Quality">Cloud Quality: ${p.cloudQuality}</button>
 <button class="v15Control" data-cycle="waterQuality" data-label="Water Quality">Water Quality: ${p.waterQuality}</button><button class="v15Control" data-cycle="ao" data-label="Ambient Occlusion">Ambient Occlusion: ${p.ao}</button>
 <button class="v15Control" data-cycle="aa" data-label="Anti Aliasing">Anti Aliasing: ${p.aa}</button><div class="v15RangeRow"><span>Sharpening</span><span class="v15Value" id="v15SharpenValue">${p.sharpening}%</span><input id="v15Sharpen" type="range" min="0" max="100" value="${p.sharpening}"></div>
 <div class="v15RangeRow"><span>Bloom</span><span class="v15Value" id="v15BloomValue">${p.bloom}%</span><input id="v15Bloom" type="range" min="0" max="100" value="${p.bloom}"></div>
 <div class="v15SectionLabel">Debug / Renderer</div>
 <div class="v15Meta wide">Active renderer: ${rendererName} • Three.js r${THREE?.REVISION||'?'}</div><button class="v15Control" data-bool="fpsGraph" data-label="FPS Graph">FPS Graph: ${p.fpsGraph?'ON':'OFF'}</button><button class="v15Control" data-bool="chunkDiagnostics" data-label="Chunk Diagnostics">Chunk Diagnostics: ${p.chunkDiagnostics?'ON':'OFF'}</button>`;
 const cycles={graphics:['Fast','Fancy','Photon'],clouds:['Off','Fast','Fancy'],smoothLighting:['Off','Low','High'],guiScale:['Auto','1','2','3','4'],photonProfile:['Lite','Balanced','High','Ultra'],renderer:['Auto','WebGPU','WebGL2'],cloudQuality:['Low','High','Cinematic'],waterQuality:['Simple','Reflective','Photon'],ao:['Off','SSAO','GTAO'],aa:['Off','FXAA','SMAA','TAA']};
 g.querySelectorAll('[data-cycle]').forEach(el=>el.onclick=()=>v15Cycle(p,el.dataset.cycle,cycles[el.dataset.cycle],el,(value)=>{if(el.dataset.cycle==='photonProfile'){window.game?.photonV148?.setProfile?.(value);try{localStorage.setItem('minecraftWebPhotonProfileV148',value)}catch{}}}));
 g.querySelectorAll('[data-bool]').forEach(el=>el.onclick=async()=>{const k=el.dataset.bool;p[k]=!p[k];v15SavePrefs(p);el.textContent=`${el.dataset.label}: ${p[k]?'ON':'OFF'}`;if(k==='fullscreen'){try{if(p[k])await document.documentElement.requestFullscreen?.();else await document.exitFullscreen?.()}catch{}}});
 const bindRange=(id,key,label,apply)=>{const e=v15$(id);if(!e)return;e.oninput=()=>{p[key]=Number(e.value);v15SavePrefs(p);const v=v15$(`${id}Value`);if(v)v.textContent=`${p[key]}${label}`;apply?.(p[key])}};bindRange('v15RenderDistance','renderDistance',' chunks',v=>{try{if(window.game?.world)window.game.world.renderDistance=v}catch{}});bindRange('v15Simulation','simulationDistance',' chunks');bindRange('v15Brightness','brightness','%',v=>{const c=v15$('gameCanvas');if(c)c.style.filter=`brightness(${.6+v/125})`});bindRange('v15Sharpen','sharpening','%');bindRange('v15Bloom','bloom','%');
}

function v15PatchResourcePacks(){
 const p=ensureResourcePackPanelV148?.();if(!p)return;
 const title=p.querySelector('.v148PackTitle');if(title)title.textContent='Select Resource Packs';
 let sub=p.querySelector('.v148PackSubtitle');if(!sub){sub=document.createElement('div');sub.className='v148PackSubtitle';sub.style.cssText='text-align:center;color:#aaa;font:11px var(--v15-font);margin:-5px 0 10px';title?.insertAdjacentElement('afterend',sub)}sub.textContent='Available packs on the left • selected packs are enabled';
 const close=p.querySelector('#v148PackClose');if(close)close.onclick=()=>{p.classList.remove('open');v15OpenScreen('v15OptionsScreen')};
}

// The V15 title is authoritative. Older title builders may run during boot, so wrap and re-apply.
if(typeof v9BuildTitle==='function'){
 const v15TitleBase=v9BuildTitle;v9BuildTitle=function(...args){const r=v15TitleBase.apply(this,args);queueMicrotask(()=>{v15BuildTitle();v15EnsureScreens();v15PatchResourcePacks();ensureHotbarBottomV148?.()});return r};
}
if(typeof addResourcePackTitleButtonV148==='function')addResourcePackTitleButtonV148=function(){};

const v15TitleObserver=new MutationObserver(()=>{if(!document.getElementById('v15Options'))queueMicrotask(v15BuildTitle)});
if(v15$('titleContent'))v15TitleObserver.observe(v15$('titleContent'),{childList:true});

function v15FinishInstall(){v15BuildTitle();v15EnsureScreens();v15PatchResourcePacks();ensureHotbarBottomV148?.();const loading=v15$('loading');loading?.classList.add('v15Loading');window.__voxelDiag?.log?.('Minecraft Web V15 Java UI Overhaul installed: Java main menu, Options hierarchy, Video/Photon settings, responsive pack screen, bottom hotbar and staged loading.','ok')}
queueMicrotask(v15FinishInstall);addEventListener('resize',()=>{ensureHotbarBottomV148?.();},{passive:true});addEventListener('orientationchange',()=>setTimeout(()=>{ensureHotbarBottomV148?.();v15PatchResourcePacks()},80),{passive:true});
