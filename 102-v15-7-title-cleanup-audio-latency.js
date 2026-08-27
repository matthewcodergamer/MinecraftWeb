/* Minecraft Web V15.7 — final title/menu cleanup + low-latency Java UI audio.
 * Runs last. It intentionally does not replace gameplay systems.
 */
(function(){
  const BUILD='0.15.7';
  const ICON='./assets/branding/java-edition-icon.png?v=0.15.7';
  const q=id=>document.getElementById(id);

  /* ---------- One canonical Java title menu ---------- */
  function rebuildCanonicalTitle(){
    const title=q('titleScreen'), content=q('titleContent');
    if(!title||!content)return;

    // Remove footer/version/title fragments produced by older title builders.
    title.querySelectorAll('.v15Footer,.v9Small,#titleSub,.javaBootSmall,.javaSourceRowV144,.v148PacksBtn').forEach(el=>el.remove());
    [...title.children].forEach(el=>{
      if(el===content||el.id==='titlePanorama'||el.id==='titleShade'||el.classList?.contains('v15Screen')||el.id==='resourcePackPanelV148')return;
      const txt=(el.textContent||'').trim();
      if(/Minecraft Web Alpha|Three\.js r180|Java UI|Photon Web/.test(txt))el.remove();
    });

    content.className='javaTitleV15 v157CanonicalTitle';
    content.innerHTML=`
      <img id="mcLogo" src="./assets/java/26.1/gui/title/minecraft.png" alt="Minecraft">
      <img id="javaEditionV15" src="./assets/java/26.1/gui/title/edition.png" alt="Java Edition">
      <div class="javaSplashV15">Java-first web edition!</div>
      <button id="playBtn" class="v15JavaBtn" type="button">Singleplayer</button>
      <button id="creativeBtn" class="v15JavaBtn" type="button">Multiplayer</button>
      <button id="v15Realms" class="v15JavaBtn" type="button">Minecraft Realms</button>
      <div class="v15TitleRow"><button id="v15Options" class="v15JavaBtn" type="button">Options...</button><button id="v15Quit" class="v15JavaBtn" type="button">Quit Game</button></div>`;

    // Ensure exactly one logo + one edition image remain in the canonical title content.
    [...content.querySelectorAll('img')].forEach((img,i)=>{
      if(i>1)img.remove();
    });

    const p=q('playBtn'), m=q('creativeBtn');
    if(p)p.onclick=()=>{ if(window.game?.newWorld)window.game.newWorld('survival'); else if(typeof v9WorldSelect==='function')v9WorldSelect(); else window.v15ShowToast?.('World engine is still loading…'); };
    if(m)m.onclick=()=>window.v15ShowToast?.('Multiplayer is not available yet.');
    q('v15Realms').onclick=()=>window.v15ShowToast?.('Minecraft Realms is not available in Minecraft Web.');
    q('v15Options').onclick=()=>{ try{v15EnsureScreens?.();v15OpenScreen?.('v15OptionsScreen')}catch{} };
    q('v15Quit').onclick=()=>{ try{window.close()}catch{} setTimeout(()=>window.v15ShowToast?.('Close this browser tab to quit.'),30); };

    const footer=document.createElement('div');
    footer.id='v157Footer';footer.className='v157Footer';
    footer.innerHTML='<span>Minecraft Web 0.15.7</span><span>Java 26.1 • Three.js • Photon Web</span>';
    title.appendChild(footer);
  }

  const style=document.createElement('style');
  style.id='v157CanonicalTitleStyle';
  style.textContent=`
    #titleContent.v157CanonicalTitle{width:min(430px,84vw)!important;gap:6px!important;overflow:visible!important}
    #titleContent.v157CanonicalTitle #mcLogo{display:block!important;width:min(500px,82vw)!important;max-height:27vh!important;height:auto!important;margin:0 auto!important;object-fit:contain!important}
    #titleContent.v157CanonicalTitle #javaEditionV15{display:block!important;width:min(238px,44vw)!important;height:auto!important;margin:-30px auto 8px!important;object-fit:contain!important;image-rendering:pixelated!important}
    #titleScreen .v15Footer,#titleScreen .v9Small,#titleScreen #titleSub,#titleScreen .javaBootSmall{display:none!important}
    #v157Footer{position:fixed;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom));display:flex;justify-content:space-between;gap:12px;z-index:205;color:#ddd;font:11px/1.2 'Minecraft Seven','Minecraft','Courier New',monospace;text-shadow:1px 1px #111;pointer-events:none;white-space:nowrap}
    @media(max-width:620px){#v157Footer{font-size:9px}.v157CanonicalTitle{width:min(420px,88vw)!important}}
    @media(orientation:portrait){#titleContent.v157CanonicalTitle{width:min(88vw,430px)!important;transform:none!important}#titleContent.v157CanonicalTitle #mcLogo{width:min(82vw,500px)!important;max-height:22vh!important}#titleContent.v157CanonicalTitle #javaEditionV15{width:min(48vw,238px)!important;margin-top:-20px!important}}
    @media(orientation:landscape) and (max-height:520px){#titleContent.v157CanonicalTitle{width:min(390px,70vw)!important;transform:scale(.84)!important;transform-origin:center!important}#v157Footer{font-size:9px}}
  `;
  document.head.appendChild(style);

  rebuildCanonicalTitle();
  requestAnimationFrame(rebuildCanonicalTitle);
  setTimeout(rebuildCanonicalTitle,80);

  /* ---------- Low-latency UI OGG ----------
   * V15.5 already routes button clicks to the local Java OGG. Its delay came from
   * constructing a brand-new HTMLAudioElement on every click. Keep the same OGG,
   * but hand those calls a warm pool whose media is preloaded and cache-ready.
   */
  const NativeAudio=window.Audio;
  const clickURL=new URL('./assets/java/sounds/random/click_stereo.ogg',location.href).href;
  const pool=[]; let poolIndex=0;
  try{
    for(let i=0;i<6;i++){
      const a=new NativeAudio(clickURL);a.preload='auto';a.playsInline=true;a.load();pool.push(a);
    }
    function FastAudio(src){
      const resolved=src?new URL(String(src),location.href).href:'';
      if(resolved===clickURL&&pool.length){
        const a=pool[poolIndex++%pool.length];
        try{a.pause();a.currentTime=0}catch{}
        return a;
      }
      return src===undefined?new NativeAudio():new NativeAudio(src);
    }
    FastAudio.prototype=NativeAudio.prototype;
    Object.setPrototypeOf(FastAudio,NativeAudio);
    window.Audio=FastAudio;

    // Start fetching immediately; iOS still performs actual playback only after a gesture.
    const warm=()=>pool.forEach(a=>{try{a.load()}catch{}});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',warm,{once:true});else warm();
  }catch(e){console.warn('[V15.7 audio pool]',e)}

  /* ---------- Branding: local uploaded/wiki Java icon wins everywhere ---------- */
  function applyLocalIcon(){
    const ensure=(rel)=>{let l=document.head.querySelector(`link[rel="${rel}"]`);if(!l){l=document.createElement('link');l.rel=rel;document.head.appendChild(l)}l.href=ICON;l.type='image/png';return l};
    ensure('icon');ensure('shortcut icon');const apple=ensure('apple-touch-icon');apple.removeAttribute('type');
    document.documentElement.dataset.minecraftJavaIcon='local-v157';
  }
  applyLocalIcon();queueMicrotask(applyLocalIcon);setTimeout(applyLocalIcon,300);

  window.MINECRAFT_WEB_VERSION=BUILD;
  window.STUDIO_PATCH_VERSION='0.15.7-title-cleanup-audio-latency';
  window.__voxelDiag?.log?.('V15.7 READY: one canonical Java title/menu, one footer, warm pooled Java click OGG, local Java Edition icon branding.','ok');
})();
