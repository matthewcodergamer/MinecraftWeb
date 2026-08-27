const RUNTIME_BUILD_ID='0.15.5';
const SOURCE_PARTS = [
  '00-engine-core.js','10-studio-v6.js','20-studio-v7.js','30-studio-v8.js','40-studio-v9.js','50-studio-v10.js','60-studio-v11.js','70-studio-v12.js','80-studio-v13.js','81-v13-1-hotfix.js','82-v13-1-1-responsive-title.js','83-v13-2-antialiasing.js','90-v14-frustum-culling.js','91-v14-1-bedrock-behavior.js','92-v14-2-bedrock-audio.js','93-v14-3-physics-entity-world-polish.js','94a-v14-4-java-data-assets.js','94b-v14-4-java-combat-hud.js','94c-v14-4-java-ui-runtime.js','95a-v14-5-java-assets-render.js','95b-v14-5-java-ui.js','95c-v14-5-java-audio.js','95d-v14-5-java-celestials.js','95e-v14-5-java-passive-ai.js','95f-v14-5-java-collision-combat.js','95g-v14-5-java-icon-hotfix.js','96a-v14-6-render-sections.js','96b-v14-6-scheduling-entities.js','96c-v14-6-performance-governor.js','97a-v14-7-render-ui.js','97b-v14-7-items-audio.js','97c-v14-7-animation-collision.js','97d-v14-7-fidelity-hotfix.js','98-v14-8-photon-resource-packs.js','98b-v14-8-java-title-resourcepack-hotfix.js','98c-v14-8c-java-ui-assets-fix.js','98d-v14-8c3-java-ui-stability.js','98e-v15-java-ui-overhaul.js','98f-v15-java-world-pause-ui.js','98g-v15-1-photon-1-3b-port.js','98h-v15-2-photon-gauntlet.js','98i-v15-3-java-26-1-assets.js','98j-v15-3-java-breaking-overlay.js','99-finalize.js','100-v15-5-ui-audio-options-hotfix.js'
];
(function installBootVisualsV155(){
 const old=document.getElementById('mcBootVisualsV151')||document.getElementById('mcBootVisualsV152')||document.getElementById('mcBootVisualsV153')||document.getElementById('mcBootVisualsV154')||document.getElementById('mcBootVisualsV155');if(old)old.remove();
 const style=document.createElement('style');style.id='mcBootVisualsV155';style.textContent=`
 #loading.v15Loading{background-image:linear-gradient(rgba(17,14,12,.62),rgba(17,14,12,.73)),url('./assets/java/26.1/gui/title/background/panorama_0.png')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;image-rendering:auto!important;backdrop-filter:blur(1.1px);-webkit-backdrop-filter:blur(1.1px);transition:opacity .16s linear!important}
 #loading.v15Loading::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at center,transparent 0 40%,rgba(0,0,0,.34) 100%);pointer-events:none}
 #loading.v15Loading.mcBootLeaving{opacity:0!important;pointer-events:none!important}
 #loading.v15Loading.mcBootGone{display:none!important;visibility:hidden!important;pointer-events:none!important}
 #loadingBar{position:relative!important;z-index:2!important;width:min(640px,74vw)!important;height:18px!important;padding:3px!important;background:#080808!important;border:2px solid #7b7b7b!important;box-shadow:inset 1px 1px #000,inset -1px -1px #c7c7c7,0 2px 5px #0009!important;border-radius:0!important;overflow:hidden!important}
 #loadingFill{height:100%!important;background:linear-gradient(#82bd4b 0 18%,#5b9b33 18% 82%,#3e7124 82% 100%)!important;box-shadow:inset 1px 0 #9bd15e,inset -1px 0 #345f20!important;transition:width .12s linear!important}
 #loadingText{position:relative!important;z-index:2!important;margin-top:16px!important;color:white!important;font-family:'Minecraft Seven','Minecraft','Courier New',monospace!important;font-size:clamp(15px,2vw,22px)!important;line-height:1.2!important;letter-spacing:.01em!important;text-shadow:2px 2px 0 #222!important;text-align:center!important}
 @media(orientation:landscape) and (max-height:520px){#loadingBar{width:min(620px,66vw)!important;height:15px!important}#loadingText{margin-top:10px!important;font-size:15px!important}}
 `;document.head.appendChild(style);
})();
function versioned(url){const join=url.includes('?')?'&':'?';return `${url}${join}v=${encodeURIComponent(RUNTIME_BUILD_ID)}`;}
async function fetchPart(name){const candidates=[`./${name}`,`./src/parts/${name}`];let lastError=null;for(const url of candidates){try{const response=await fetch(versioned(url),{cache:'force-cache'});if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return await response.text();}catch(error){lastError=error;}}throw new Error(`Unable to load ${name}: ${lastError?.message||'unknown error'}`);}
function dismissBootOverlay(loading){
 if(!loading)return;
 loading.classList.add('mcBootLeaving');
 loading.setAttribute('aria-hidden','true');
 const finish=()=>{
  loading.classList.remove('show','mcBootLeaving');
  loading.classList.add('mcBootGone');
  loading.style.setProperty('display','none','important');
  loading.style.setProperty('visibility','hidden','important');
  loading.style.setProperty('pointer-events','none','important');
 };
 setTimeout(finish,180);
}
async function bootMinecraftFromParts(){
 const loading=document.getElementById('loading'),loadingText=document.getElementById('loadingText'),loadingFill=document.getElementById('loadingFill');
 try{
  loading?.classList?.remove('mcBootGone','mcBootLeaving');
  if(loading){loading.style.removeProperty('display');loading.style.removeProperty('visibility');loading.style.removeProperty('pointer-events');loading.removeAttribute('aria-hidden');}
  loading?.classList?.add('show','v15Loading');if(loadingText)loadingText.textContent='Loading Minecraft…';let done=0;
  const parts=await Promise.all(SOURCE_PARTS.map(async(name)=>{const text=await fetchPart(name);done++;if(loadingText)loadingText.textContent=`Loading Java 26.1 assets and engine • ${done}/${SOURCE_PARTS.length}`;if(loadingFill)loadingFill.style.width=`${Math.round(done/SOURCE_PARTS.length*92)}%`;return text;}));
  if(loadingText)loadingText.textContent='Starting Minecraft…';if(loadingFill)loadingFill.style.width='96%';
  const source=`${parts.join('\n\n')}\n//# sourceURL=minecraft-v15-5-java-26-1-runtime.js`;const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob);
  try{
   await import(url);
   window.__MC_RUNTIME_READY__=true;
   window.__MC_RUNTIME_BUILD_ID__=RUNTIME_BUILD_ID;
   if(loadingFill)loadingFill.style.width='100%';
   if(loadingText)loadingText.textContent='Ready';
   if(window.__MC_BOOT_WATCHDOG__)clearTimeout(window.__MC_BOOT_WATCHDOG__);
   requestAnimationFrame(()=>requestAnimationFrame(()=>dismissBootOverlay(loading)));
  }finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }catch(error){console.error('[V15.5 BOOT]',error);if(loadingText)loadingText.textContent=`Engine failed: ${error.message}`;loading?.classList?.remove('mcBootGone','mcBootLeaving');loading?.classList?.add('show');}
}
bootMinecraftFromParts();
