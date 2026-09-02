const RUNTIME_BUILD_ID='0.16.7';
const RUNTIME_BUNDLE='./runtime-bundle.js';
const SOURCE_PARTS = [
  '00-engine-core.js','10-studio-v6.js','20-studio-v7.js','30-studio-v8.js','40-studio-v9.js','50-studio-v10.js','60-studio-v11.js','70-studio-v12.js','80-studio-v13.js','81-v13-1-hotfix.js','82-v13-1-1-responsive-title.js','83-v13-2-antialiasing.js','90-v14-frustum-culling.js','91-v14-1-bedrock-behavior.js','92-v14-2-bedrock-audio.js','93-v14-3-physics-entity-world-polish.js','94a-v14-4-java-data-assets.js','94b-v14-4-java-combat-hud.js','94c-v14-4-java-ui-runtime.js','95a-v14-5-java-assets-render.js','95b-v14-5-java-ui.js','95c-v14-5-java-audio.js','95d-v14-5-java-celestials.js','95e-v14-5-java-passive-ai.js','95f-v14-5-java-collision-combat.js','95g-v14-5-java-icon-hotfix.js','96a-v14-6-render-sections.js','96b-v14-6-scheduling-entities.js','96c-v14-6-performance-governor.js','97a-v14-7-render-ui.js','97b-v14-7-items-audio.js','97c-v14-7-animation-collision.js','97d-v14-7-fidelity-hotfix.js','98-v14-8-photon-resource-packs.js','98b-v14-8-java-title-resourcepack-hotfix.js','98c-v14-8c-java-ui-assets-fix.js','98d-v14-8c3-java-ui-stability.js','98e-v15-java-ui-overhaul.js','98f-v15-java-world-pause-ui.js','98g-v15-1-photon-1-3b-port.js','98h-v15-2-photon-gauntlet.js','98i-v15-3-java-26-1-assets.js','98j-v15-3-java-breaking-overlay.js','99-finalize.js','100-v15-5-ui-audio-options-hotfix.js','101-v15-6-official-java-icon.js','102-v15-7-title-cleanup-audio-latency.js','103-v15-8-java-font-26-1-ui.js','104a-v15-9-world-select-ui.js','104b-v15-9-lifecycle-quit.js','104c-v15-9-inventory-hud-drop.js','104d-v15-9-render-pipeline.js','105-v15-9-1-world-loading-title-dedupe.js','106-v16-0-desktop-vanilla-fidelity.js','107-v16-1-procedural-square-sun.js','108-v16-2-vanilla-polish-gameplay.js','109-v16-3-java-block-fidelity.js','110-v16-4-java-parity-runtime.js','111-v16-4-1-runtime-hotfix.js','112-v16-4-2-performance-stability.js','113-v16-5-modern-world-fluid.js','114-v16-5-workers-lighting.js','115-v16-5-java-data-inventory-combat.js','116-v16-5-world-systems.js','117-v16-5-1-player-render-kinematics.js','118-v16-5-1-stability-guard.js','119-v16-6-ender-dragon.js','120-v16-6-advancements.js','121-v16-6-lan-multiplayer.js','122-v16-7-particles.js'
];

(function installBootVisualsV165(){
  const old=document.querySelector('[id^="mcBootVisualsV15"]');
  if(old)old.remove();
  const style=document.createElement('style');
  style.id='mcBootVisualsV165';
  style.textContent=`
    @font-face{font-family:'Minecraft Seven';src:url('./assets/fonts/Minecraft-Seven.woff?v=0.16.7') format('woff'),url('https://raw.githubusercontent.com/Mojang/web-theme-bootstrap/main/assets/fonts/Minecraft-Seven_v2.woff') format('woff');font-style:normal;font-weight:400;font-display:swap}
    #loading.v15Loading{background-image:linear-gradient(rgba(17,14,12,.52),rgba(17,14,12,.68)),url('./assets/java/26.1/gui/title/background/panorama_0.png')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;image-rendering:auto!important;transition:opacity .14s linear!important;will-change:opacity}
    #loading.v15Loading::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at center,transparent 0 40%,rgba(0,0,0,.32) 100%);pointer-events:none}
    #loading.v15Loading.mcBootLeaving{opacity:0!important;pointer-events:none!important}
    #loading.v15Loading.mcBootGone{display:none!important;visibility:hidden!important;pointer-events:none!important}
    #loadingBar{position:relative!important;z-index:2!important;width:min(640px,74vw)!important;height:18px!important;padding:3px!important;background:#080808!important;border:2px solid #898989!important;box-shadow:inset 1px 1px #000,inset -1px -1px #d0d0d0,0 2px 5px #0009!important;border-radius:0!important;overflow:hidden!important;image-rendering:pixelated!important}
    #loadingFill{height:100%!important;background:#5b9b33!important;border-top:2px solid #82bd4b!important;border-bottom:2px solid #37691e!important;box-sizing:border-box!important;box-shadow:inset 1px 0 #9bd15e,inset -1px 0 #345f20!important;transition:width .08s linear!important}
    #loadingText{position:relative!important;z-index:2!important;margin-top:16px!important;color:white!important;font-family:'Minecraft Seven','Courier New',monospace!important;font-size:clamp(15px,2vw,22px)!important;line-height:1.2!important;text-shadow:2px 2px 0 #222!important;text-align:center!important;max-width:min(760px,90vw)!important;padding:0 12px!important}
    #mcBootRetryV1592{display:none;position:relative;z-index:3;margin-top:14px;min-width:180px;height:40px;padding:0 18px;background:#777;border:2px solid #000;box-shadow:inset 2px 2px #aaa,inset -2px -2px #333;color:#fff;font:14px 'Minecraft Seven','Courier New',monospace;text-shadow:1px 1px #222;cursor:pointer}
    #mcBootRetryV1592.show{display:block}
    @media(orientation:landscape) and (max-height:520px){#loadingBar{width:min(620px,66vw)!important;height:15px!important}#loadingText{margin-top:10px!important;font-size:15px!important}#mcBootRetryV1592{height:34px;margin-top:8px;font-size:12px}}
  `;
  document.head.appendChild(style);
})();

function versioned(url){const join=url.includes('?')?'&':'?';return `${url}${join}v=${encodeURIComponent(RUNTIME_BUILD_ID)}`;}
function nextPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));}
function bootEls(){return{loading:document.getElementById('loading'),text:document.getElementById('loadingText'),fill:document.getElementById('loadingFill')};}
function ensureBootVisible(){
  const {loading}=bootEls();
  if(!loading)return;
  loading.classList.remove('mcBootGone','mcBootLeaving','v1591WorldLoading');
  loading.classList.add('show','v15Loading');
  loading.style.removeProperty('display');
  loading.style.removeProperty('visibility');
  loading.style.removeProperty('pointer-events');
  loading.removeAttribute('aria-hidden');
}
function setBootStatus(text,pct){
  const el=bootEls();
  ensureBootVisible();
  if(el.text&&text)el.text.textContent=text;
  if(el.fill&&Number.isFinite(pct))el.fill.style.width=`${Math.max(0,Math.min(100,pct))}%`;
}
function ensureRetryButton(){
  const {loading}=bootEls();
  if(!loading)return null;
  let b=document.getElementById('mcBootRetryV1592');
  if(!b){b=document.createElement('button');b.id='mcBootRetryV1592';b.type='button';b.textContent='Retry Minecraft';b.onclick=()=>location.reload();loading.appendChild(b)}
  return b;
}
function showBootFailure(error){
  const message=String(error?.message||error||'Unknown startup error');
  console.error('[V16.7 BOOT]',error);
  setBootStatus(`Minecraft could not start: ${message}`,100);
  ensureRetryButton()?.classList.add('show');
  const title=document.getElementById('titleScreen');if(title){title.style.display='';title.classList.add('show')}
  document.body.style.background='#111';
}
function dismissBootOverlay(){
  const {loading}=bootEls();if(!loading)return;
  loading.classList.add('mcBootLeaving');loading.setAttribute('aria-hidden','true');
  setTimeout(()=>{loading.classList.remove('show','mcBootLeaving','v1591WorldLoading');loading.classList.add('mcBootGone');loading.style.setProperty('display','none','important');loading.style.setProperty('visibility','hidden','important');loading.style.setProperty('pointer-events','none','important')},150);
}
function revealTitleIfIdle(){const title=document.getElementById('titleScreen');if(title&&!window.game?.running&&!window.game?.__hardQuitV159){title.style.display='';title.classList.add('show')}}
async function fetchPart(name){
  const candidates=[`./${name}`,`./src/parts/${name}`];let lastError=null;
  for(const url of candidates){try{const response=await fetch(versioned(url),{cache:'force-cache'});if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return await response.text()}catch(error){lastError=error}}
  throw new Error(`Unable to load ${name}: ${lastError?.message||'unknown error'}`);
}
async function fetchPartsBounded(){
  const output=new Array(SOURCE_PARTS.length);let cursor=0,done=0;
  const worker=async()=>{while(true){const i=cursor++;if(i>=SOURCE_PARTS.length)return;output[i]=await fetchPart(SOURCE_PARTS[i]);done++;setBootStatus(`Recovering Minecraft runtime • ${done}/${SOURCE_PARTS.length}`,10+(done/SOURCE_PARTS.length)*70);if((done&3)===0)await new Promise(resolve=>setTimeout(resolve,0))}};
  await Promise.all(Array.from({length:Math.min(6,SOURCE_PARTS.length)},worker));return output;
}
function shouldUseSourceFallback(error){const msg=String(error?.message||error||'').toLowerCase();return error instanceof TypeError&&(/fetch|network|module script|dynamically imported|load/.test(msg))}
async function importSourceFallback(){
  const parts=await fetchPartsBounded();setBootStatus('Preparing compatibility runtime…',84);await nextPaint();
  const source=`${parts.join('\n\n')}\n//# sourceURL=minecraft-v16-7-source-fallback.js`,blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob);
  try{return await import(url)}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
async function importCachedRuntime(){
  const href=versioned(RUNTIME_BUNDLE);let preload=document.querySelector('link[data-mc-runtime-preload="1"]');
  if(!preload){preload=document.createElement('link');preload.rel='modulepreload';preload.href=href;preload.crossOrigin='anonymous';preload.dataset.mcRuntimePreload='1';document.head.appendChild(preload)}
  setBootStatus('Loading Minecraft runtime…',36);await nextPaint();setBootStatus('Starting Minecraft…',92);await nextPaint();return await import(href);
}
async function bootMinecraft(){
  ensureBootVisible();ensureRetryButton()?.classList.remove('show');setBootStatus('Loading Minecraft…',4);window.__MC_RUNTIME_READY__=false;window.__MC_RUNTIME_BUILD_ID__=RUNTIME_BUILD_ID;
  const onError=event=>{if(!window.__MC_RUNTIME_READY__)window.__MC_LAST_STARTUP_ERROR__=event.error||event.message},onReject=event=>{if(!window.__MC_RUNTIME_READY__)window.__MC_LAST_STARTUP_ERROR__=event.reason};
  addEventListener('error',onError,true);addEventListener('unhandledrejection',onReject,true);
  try{
    try{await importCachedRuntime()}catch(error){if(!shouldUseSourceFallback(error))throw error;console.warn('[V16.7 BOOT] cached bundle unavailable; using bounded source fallback.',error);await importSourceFallback()}
    window.__MC_RUNTIME_READY__=true;if(window.__MC_BOOT_WATCHDOG__)clearTimeout(window.__MC_BOOT_WATCHDOG__);setBootStatus('Ready',100);revealTitleIfIdle();await nextPaint();dismissBootOverlay();
  }catch(error){showBootFailure(error||window.__MC_LAST_STARTUP_ERROR__)}finally{removeEventListener('error',onError,true);removeEventListener('unhandledrejection',onReject,true)}
}
bootMinecraft();
