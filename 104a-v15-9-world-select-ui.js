/* Minecraft Web V15.9 — Java title sizing + Select World flow. */
(function(){
  const $=id=>document.getElementById(id);
  const WORLD_LAST_PLAYED_KEY='minecraftWebV159LastPlayed';

  const style=document.createElement('style');
  style.id='v159WorldSelectStyle';
  style.textContent=`
    #titleContent.v157CanonicalTitle #javaEditionV15,
    #titleContent.javaTitleV15 #javaEditionV15{
      width:min(186px,34vw)!important;max-width:42%!important;height:auto!important;
      margin:-16px auto 9px!important;object-fit:contain!important;image-rendering:pixelated!important
    }
    @media(orientation:landscape) and (max-height:520px){
      #titleContent.v157CanonicalTitle #javaEditionV15,
      #titleContent.javaTitleV15 #javaEditionV15{width:min(174px,30vw)!important;margin:-13px auto 7px!important}
    }
    @media(orientation:portrait){
      #titleContent.v157CanonicalTitle #javaEditionV15,
      #titleContent.javaTitleV15 #javaEditionV15{width:min(180px,39vw)!important;margin:-12px auto 8px!important}
    }
    #v159SelectWorldScreen .v15Body{width:min(820px,96vw)!important;padding-bottom:104px!important}
    .v159WorldList{width:100%;min-height:164px;max-height:min(52dvh,430px);overflow:auto;background:#1118;border:2px solid #000;box-shadow:inset 2px 2px #333,inset -2px -2px #000;padding:5px;box-sizing:border-box}
    .v159WorldEntry{width:100%;display:grid;grid-template-columns:68px minmax(0,1fr);gap:10px;align-items:center;min-height:76px;padding:6px;background:transparent;border:2px solid transparent;color:#fff;text-align:left;box-sizing:border-box;cursor:pointer}
    .v159WorldEntry.selected{border-color:#fff;background:#0008}.v159WorldEntry:focus-visible{outline:2px solid #fff;outline-offset:-3px}
    .v159WorldIcon{width:64px;height:64px;object-fit:cover;image-rendering:pixelated;border:1px solid #222;background:#555}
    .v159WorldName{font:16px/1.15 'Minecraft Seven','Courier New',monospace;text-shadow:2px 2px #111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .v159WorldMeta{margin-top:4px;color:#aaa;font:11px/1.35 'Minecraft Seven','Courier New',monospace;text-shadow:1px 1px #111;overflow-wrap:anywhere}
    .v159WorldEmpty{min-height:154px;display:flex;align-items:center;justify-content:center;text-align:center;color:#aaa;font:14px/1.4 'Minecraft Seven','Courier New',monospace}
    .v159WorldActions{position:absolute;left:50%;bottom:max(8px,calc(env(safe-area-inset-bottom) + 6px));transform:translateX(-50%);width:min(760px,94vw);z-index:5;display:grid;gap:6px}
    .v159WorldActionRow{display:grid;grid-template-columns:1fr 1fr;gap:7px}.v159WorldActionRow.four{grid-template-columns:repeat(4,1fr)}
    .v159WorldActions .v15Control{min-width:0!important;width:100%!important}.v159WorldActions button:disabled{filter:brightness(.48)!important;opacity:.72!important;pointer-events:none!important}
    @media(max-width:620px) and (orientation:portrait){.v159WorldActionRow.four{grid-template-columns:1fr 1fr}.v159WorldActions{bottom:max(5px,env(safe-area-inset-bottom))}#v159SelectWorldScreen .v15Body{padding-bottom:148px!important}}
    @media(orientation:landscape) and (max-height:520px){.v159WorldEntry{min-height:62px;grid-template-columns:52px minmax(0,1fr);padding:4px}.v159WorldIcon{width:48px;height:48px}.v159WorldName{font-size:14px}.v159WorldMeta{font-size:9px}.v159WorldList{min-height:112px;max-height:42dvh}.v159WorldActions{gap:4px}.v159WorldActionRow{gap:5px}#v159SelectWorldScreen .v15Body{padding-bottom:82px!important}}
  `;
  document.head.appendChild(style);

  function clickSound(){try{game?.soundV9?.play?.('random.click',{ui:true,volume:.24,temporaryClick:true})}catch{}}
  async function ensureSaveDb(){try{if(game?.saveStore&&!game.saveStore.db)await game.saveStore.init();return game?.saveStore?.db||null}catch(e){console.warn('[V15.9 save db]',e);return null}}
  async function loadLocalWorld(){try{await ensureSaveDb();return await game?.saveStore?.load?.('world')||null}catch(e){console.warn('[V15.9 world load]',e);return null}}
  async function deleteLocalWorld(){
    const db=await ensureSaveDb();if(!db)return false;
    return await new Promise(resolve=>{try{const tx=db.transaction('worlds','readwrite');tx.objectStore('worlds').delete('world');tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)}catch{resolve(false)}});
  }
  function worldSetup(){try{return typeof v15WorldState==='function'?v15WorldState():{name:'New World',mode:'Survival',difficulty:'Normal'}}catch{return{name:'New World',mode:'Survival',difficulty:'Normal'}}}
  function worldDateText(){const raw=Number(localStorage.getItem(WORLD_LAST_PLAYED_KEY)||0);if(!raw)return 'Local browser world';try{return `Last played ${new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(raw))}`}catch{return 'Local browser world'}}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function ensureWorldSelectScreen(){
    const title=$('titleScreen');if(!title)return null;let s=$('v159SelectWorldScreen');if(s)return s;
    s=document.createElement('section');s.id='v159SelectWorldScreen';s.className='v15Screen';s.innerHTML=`
      <div class="v15Header">Select World</div>
      <div class="v15Body"><div id="v159WorldList" class="v159WorldList" role="listbox" aria-label="Worlds"></div></div>
      <div class="v159WorldActions">
        <div class="v159WorldActionRow"><button class="v15Control" id="v159PlayWorld">Play Selected World</button><button class="v15Control" id="v159CreateWorld">Create New World</button></div>
        <div class="v159WorldActionRow four"><button class="v15Control" id="v159EditWorld">Edit</button><button class="v15Control" id="v159DeleteWorld">Delete</button><button class="v15Control" id="v159RecreateWorld">Re-Create</button><button class="v15Control" id="v159WorldCancel">Cancel</button></div>
      </div>`;
    title.appendChild(s);
    $('v159WorldCancel').onclick=()=>{v15CloseScreens?.();window.repairTitleBindingsV159?.()};
    $('v159CreateWorld').onclick=()=>openCreateWorld(false);
    $('v159PlayWorld').onclick=async()=>{
      clickSound();const saved=await loadLocalWorld();if(!saved){v15ShowToast?.('No saved world selected.');await renderWorldList();return}
      try{v15CloseScreens?.();game.running=false;game.__hardQuitV159=false;await game.boot(saved.mode||'survival',false)}catch(e){console.error('[V15.9 play world]',e);v15ShowToast?.(`Could not open world: ${e.message}`)}
    };
    $('v159EditWorld').onclick=()=>openCreateWorld(false,true);
    $('v159RecreateWorld').onclick=async()=>{const saved=await loadLocalWorld();const setup=worldSetup();if(saved?.seed!=null)setup.seed=String(saved.seed);setup.name=(setup.name||'New World')+' Copy';try{v15SaveWorldState?.(setup)}catch{}openCreateWorld(true)};
    $('v159DeleteWorld').onclick=async()=>{
      clickSound();const saved=await loadLocalWorld();if(!saved)return;let yes=false;
      try{yes=confirm(`Delete "${worldSetup().name||'New World'}"? This cannot be undone.`)}catch{}if(!yes)return;
      if(await deleteLocalWorld()){localStorage.removeItem(WORLD_LAST_PLAYED_KEY);await renderWorldList();v15ShowToast?.('World deleted.')}else v15ShowToast?.('Could not delete the world.');
    };
    return s;
  }
  function openCreateWorld(recreate=false,edit=false){
    try{v15EnsureWorldScreens?.()}catch{}const cancel=$('v15CancelWorld');if(cancel)cancel.onclick=()=>openWorldSelect();const setup=worldSetup();
    if(recreate||edit){const name=$('v15WorldName');if(name)name.value=setup.name||'New World';const seed=$('v15WorldSeed');if(seed&&setup.seed!=null)seed.value=String(setup.seed)}
    v15OpenScreen?.('v15CreateWorldScreen');
  }
  async function renderWorldList(){
    ensureWorldSelectScreen();const list=$('v159WorldList');if(!list)return;list.innerHTML='<div class="v159WorldEmpty">Loading worlds…</div>';
    const saved=await loadLocalWorld(),buttons=['v159PlayWorld','v159EditWorld','v159DeleteWorld','v159RecreateWorld'];buttons.forEach(id=>{const b=$(id);if(b)b.disabled=!saved});
    if(!saved){list.innerHTML='<div class="v159WorldEmpty">No saved worlds found.<br>Create New World to begin.</div>';return}
    const setup=worldSetup(),mode=(saved.mode||setup.mode||'survival'),seed=saved.seed??game.seed??'',name=setup.name||'New World';
    list.innerHTML=`<button class="v159WorldEntry selected" id="v159WorldEntry" type="button" role="option" aria-selected="true"><img class="v159WorldIcon" src="./assets/java/26.1/gui/title/background/panorama_0.png" alt=""><span><span class="v159WorldName">${escapeHtml(name)}</span><span class="v159WorldMeta">${escapeHtml(mode[0].toUpperCase()+mode.slice(1))} Mode • Seed ${escapeHtml(String(seed))}<br>${escapeHtml(worldDateText())}</span></span></button>`;
    $('v159WorldEntry').ondblclick=()=>$('v159PlayWorld')?.click();
  }
  async function openWorldSelect(){clickSound();ensureWorldSelectScreen();try{v15EnsureWorldScreens?.()}catch{}v15OpenScreen?.('v159SelectWorldScreen');await renderWorldList()}

  window.openMinecraftWorldSelectV159=openWorldSelect;
  window.renderMinecraftWorldListV159=renderWorldList;
  queueMicrotask(ensureWorldSelectScreen);
})();
