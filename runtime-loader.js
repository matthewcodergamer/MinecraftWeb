const RUNTIME_BUILD_ID='0.15.0';
const SOURCE_PARTS = [
  '00-engine-core.js','10-studio-v6.js','20-studio-v7.js','30-studio-v8.js','40-studio-v9.js','50-studio-v10.js','60-studio-v11.js','70-studio-v12.js','80-studio-v13.js','81-v13-1-hotfix.js','82-v13-1-1-responsive-title.js','83-v13-2-antialiasing.js','90-v14-frustum-culling.js','91-v14-1-bedrock-behavior.js','92-v14-2-bedrock-audio.js','93-v14-3-physics-entity-world-polish.js','94a-v14-4-java-data-assets.js','94b-v14-4-java-combat-hud.js','94c-v14-4-java-ui-runtime.js','95a-v14-5-java-assets-render.js','95b-v14-5-java-ui.js','95c-v14-5-java-audio.js','95d-v14-5-java-celestials.js','95e-v14-5-java-passive-ai.js','95f-v14-5-java-collision-combat.js','95g-v14-5-java-icon-hotfix.js','96a-v14-6-render-sections.js','96b-v14-6-scheduling-entities.js','96c-v14-6-performance-governor.js','97a-v14-7-render-ui.js','97b-v14-7-items-audio.js','97c-v14-7-animation-collision.js','97d-v14-7-fidelity-hotfix.js','98-v14-8-photon-resource-packs.js','98b-v14-8-java-title-resourcepack-hotfix.js','98c-v14-8c-java-ui-assets-fix.js','98d-v14-8c3-java-ui-stability.js','98e-v15-java-ui-overhaul.js','99-finalize.js'
];
function versioned(url){const join=url.includes('?')?'&':'?';return `${url}${join}v=${encodeURIComponent(RUNTIME_BUILD_ID)}`;}
async function fetchPart(name){const candidates=[`./${name}`,`./src/parts/${name}`];let lastError=null;for(const url of candidates){try{const response=await fetch(versioned(url),{cache:'force-cache'});if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return await response.text();}catch(error){lastError=error;}}throw new Error(`Unable to load ${name}: ${lastError?.message||'unknown error'}`);}
async function bootMinecraftFromParts(){
 const loading=document.getElementById('loading'),loadingText=document.getElementById('loadingText'),loadingFill=document.getElementById('loadingFill');
 try{
  loading?.classList?.add('show','v15Loading');
  if(loadingText)loadingText.textContent='Loading Minecraft Web…';
  let done=0;
  const parts=await Promise.all(SOURCE_PARTS.map(async(name)=>{const text=await fetchPart(name);done++;if(loadingText)loadingText.textContent=`Initializing Java UI • World Engine • Assets ${done}/${SOURCE_PARTS.length}`;if(loadingFill)loadingFill.style.width=`${Math.round(done/SOURCE_PARTS.length*92)}%`;return text;}));
  if(loadingText)loadingText.textContent='Starting Minecraft Web V15…';if(loadingFill)loadingFill.style.width='96%';
  const source=`${parts.join('\n\n')}\n//# sourceURL=minecraft-v15-java-ui-runtime.js`;const blob=new Blob([source],{type:'text/javascript'}),url=URL.createObjectURL(blob);
  try{await import(url);window.__MC_RUNTIME_READY__=true;window.__MC_RUNTIME_BUILD_ID__=RUNTIME_BUILD_ID;if(loadingFill)loadingFill.style.width='100%';if(loadingText)loadingText.textContent='Minecraft Web ready';if(window.__MC_BOOT_WATCHDOG__)clearTimeout(window.__MC_BOOT_WATCHDOG__);}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }catch(error){console.error('[V15 BOOT]',error);if(loadingText)loadingText.textContent=`Engine failed: ${error.message}`;loading?.classList?.add('show');}
}
bootMinecraftFromParts();
