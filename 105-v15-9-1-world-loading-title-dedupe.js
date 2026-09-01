/* Minecraft Web V15.9.1 — canonical Java Edition title + Java-style world loading screen. */
(function(){
  'use strict';

  const BUILD='0.15.9.1';
  const JAVA='./assets/java/26.1/';
  const EDITION_SRC=`${JAVA}gui/title/edition.png`;
  const ICON_SRC=`./assets/icon/minecraft-java-icon.png?v=${BUILD}`;
  const $=id=>document.getElementById(id);
  const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));

  function installStyle(){
    const old=$('v1591WorldLoadTitleStyle');
    if(old)old.remove();
    const style=document.createElement('style');
    style.id='v1591WorldLoadTitleStyle';
    style.textContent=`
      #titleContent #javaEditionV15{
        display:block!important;
        width:min(176px,32vw)!important;
        max-width:40%!important;
        height:auto!important;
        margin:-15px auto 9px!important;
        object-fit:contain!important;
        image-rendering:pixelated!important;
      }
      #titleContent img[src*="gui/title/edition.png"]:not(#javaEditionV15),
      #titleContent #javaEditionLogoV148C2,
      #titleContent #javaEditionLogoV148C3,
      #titleContent #javaBootEdition{
        display:none!important;
      }
      @media(orientation:landscape) and (max-height:520px){
        #titleContent #javaEditionV15{width:min(164px,28vw)!important;max-width:38%!important;margin:-12px auto 7px!important}
      }
      @media(orientation:portrait){
        #titleContent #javaEditionV15{width:min(172px,38vw)!important;max-width:44%!important;margin:-11px auto 8px!important}
      }

      #loading.v15Loading.v1591WorldLoading{
        position:fixed!important;
        inset:0!important;
        z-index:6000!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        flex-direction:column!important;
        gap:10px!important;
        opacity:1;
        background-color:#3b2a1f!important;
        background-image:linear-gradient(rgba(20,12,8,.42),rgba(20,12,8,.42)),url('./assets/java/26.1/blocks/dirt.png')!important;
        background-size:auto,64px 64px!important;
        background-position:0 0,0 0!important;
        background-repeat:repeat,repeat!important;
        image-rendering:pixelated!important;
        transition:opacity .16s linear!important;
        pointer-events:auto!important;
      }
      #loading.v15Loading.v1591WorldLoading::before{
        content:''!important;
        position:absolute!important;
        inset:0!important;
        background:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22))!important;
        pointer-events:none!important;
      }
      #loading.v15Loading.v1591WorldLoading.mcBootLeaving{opacity:0!important;pointer-events:none!important}
      #loading.v15Loading.v1591WorldLoading #loadingBar{
        order:2!important;
        width:min(560px,72vw)!important;
        height:14px!important;
        padding:2px!important;
        background:#050505!important;
        border:2px solid #8c8c8c!important;
        box-shadow:inset 1px 1px #000,inset -1px -1px #d2d2d2,0 2px 4px #000b!important;
        border-radius:0!important;
        overflow:hidden!important;
      }
      #loading.v15Loading.v1591WorldLoading #loadingFill{
        height:100%!important;
        background:#5aa02c!important;
        border-top:1px solid #8bc850!important;
        border-bottom:1px solid #315f18!important;
        box-sizing:border-box!important;
        transition:width .08s linear!important;
      }
      #loading.v15Loading.v1591WorldLoading #loadingText{
        order:3!important;
        margin-top:3px!important;
        max-width:min(720px,88vw)!important;
        padding:0 12px!important;
        color:#fff!important;
        font:14px/1.25 'Minecraft Seven','Courier New',monospace!important;
        text-align:center!important;
        text-shadow:2px 2px #222!important;
      }
      #v1591WorldLoadHeadline{
        position:relative;
        z-index:2;
        order:1;
        margin-bottom:7px;
        color:#fff;
        font:18px/1.2 'Minecraft Seven','Courier New',monospace;
        text-align:center;
        text-shadow:2px 2px #222;
      }
      #v1591WorldLoadPercent{
        position:relative;
        z-index:2;
        order:4;
        margin-top:0;
        color:#fff;
        font:13px/1.2 'Minecraft Seven','Courier New',monospace;
        text-align:center;
        text-shadow:2px 2px #222;
      }
      @media(orientation:landscape) and (max-height:520px){
        #loading.v15Loading.v1591WorldLoading{gap:6px!important}
        #v1591WorldLoadHeadline{font-size:15px;margin-bottom:3px}
        #loading.v15Loading.v1591WorldLoading #loadingBar{width:min(500px,62vw)!important;height:12px!important}
        #loading.v15Loading.v1591WorldLoading #loadingText{font-size:11px!important;margin-top:1px!important}
        #v1591WorldLoadPercent{font-size:11px}
      }
    `;
    document.head.appendChild(style);
  }

  let canonicalizing=false;
  let canonicalQueued=false;

  function isMinecraftLogo(img){
    const src=img.getAttribute('src')||'';
    return img.id==='mcLogo'||/gui\/title\/minecraft\.png(?:[?#]|$)/i.test(src);
  }

  function isJavaEditionLogo(img){
    const src=img.getAttribute('src')||'';
    const alt=img.getAttribute('alt')||'';
    return img.id==='javaEditionV15'||img.id==='javaBootEdition'||img.id==='javaEditionLogoV148C2'||img.id==='javaEditionLogoV148C3'||/gui\/title\/edition\.png(?:[?#]|$)/i.test(src)||/^java\s+edition$/i.test(alt.trim());
  }

  function canonicalizeTitle(){
    if(canonicalizing)return;
    const content=$('titleContent');
    if(!content)return;
    canonicalizing=true;
    try{
      const logoCandidates=[...content.querySelectorAll('img')].filter(isMinecraftLogo);
      let logo=logoCandidates.find(img=>img.id==='mcLogo')||logoCandidates[0]||null;
      if(logo){
        logo.id='mcLogo';
        logo.alt='Minecraft';
        logo.src=`${JAVA}gui/title/minecraft.png`;
        logoCandidates.forEach(img=>{if(img!==logo)img.remove()});
      }

      let editionCandidates=[...content.querySelectorAll('img')].filter(isJavaEditionLogo);
      let edition=editionCandidates.find(img=>img.id==='javaEditionV15')||editionCandidates[0]||null;
      if(!edition&&logo){
        edition=document.createElement('img');
        edition.id='javaEditionV15';
        edition.alt='Java Edition';
        edition.src=EDITION_SRC;
        logo.insertAdjacentElement('afterend',edition);
        editionCandidates=[edition];
      }
      if(edition){
        edition.id='javaEditionV15';
        edition.alt='Java Edition';
        edition.src=EDITION_SRC;
        editionCandidates.forEach(img=>{if(img!==edition)img.remove()});
        content.querySelectorAll('#javaEditionLogoV148C2,#javaEditionLogoV148C3,#javaBootEdition').forEach(img=>{if(img!==edition)img.remove()});
        if(logo&&logo.nextElementSibling!==edition)logo.insertAdjacentElement('afterend',edition);
      }

      const footer=$('v158Footer');
      if(footer)footer.innerHTML=`<span>Minecraft Web ${BUILD}</span><span>Java 26.1 • Three.js • Photon Web</span>`;
    } finally {
      canonicalizing=false;
    }
  }

  function queueCanonicalize(){
    if(canonicalQueued)return;
    canonicalQueued=true;
    queueMicrotask(()=>{
      canonicalQueued=false;
      canonicalizeTitle();
    });
  }

  function installTitleObserver(){
    const title=$('titleScreen');
    if(!title)return;
    const old=window.__v1591TitleObserver;
    try{old?.disconnect?.()}catch{}
    const observer=new MutationObserver(queueCanonicalize);
    observer.observe(title,{childList:true,subtree:true});
    window.__v1591TitleObserver=observer;
    canonicalizeTitle();
    requestAnimationFrame(canonicalizeTitle);
    [80,240,650,1400,2800].forEach(ms=>setTimeout(canonicalizeTitle,ms));
  }

  function applyVersionedIcon(){
    for(const rel of ['icon','shortcut icon','apple-touch-icon']){
      let link=document.head.querySelector(`link[rel="${rel}"]`);
      if(!link){
        link=document.createElement('link');
        link.rel=rel;
        document.head.appendChild(link);
      }
      link.href=ICON_SRC;
      if(rel!=='apple-touch-icon')link.type='image/png';
      else link.removeAttribute('type');
    }
  }

  function ensureWorldLoadingChrome(){
    const loading=$('loading');
    if(!loading)return null;
    let headline=$('v1591WorldLoadHeadline');
    if(!headline){
      headline=document.createElement('div');
      headline.id='v1591WorldLoadHeadline';
      headline.textContent='Loading world...';
      loading.insertBefore(headline,$('loadingBar')||loading.firstChild);
    }
    let percent=$('v1591WorldLoadPercent');
    if(!percent){
      percent=document.createElement('div');
      percent.id='v1591WorldLoadPercent';
      percent.textContent='0%';
      loading.appendChild(percent);
    }
    return {loading,headline,percent,bar:$('loadingFill'),text:$('loadingText')};
  }

  function worldStageText(pct,text){
    const p=clamp01((Number(pct)||0)/100);
    if(p<.08)return 'Preparing for world creation...';
    if(p<.18)return 'Loading world data...';
    if(p<.50)return 'Loading resources...';
    if(p<.68)return 'Building terrain...';
    if(p<.90)return 'Preparing spawn area...';
    if(p<.98)return 'Joining world...';
    return text&&text!=='Ready'?'Finishing world...':'Ready';
  }

  let hideTimer=0;
  function presentWorldLoading(gameRef,show,pct,text){
    const ui=ensureWorldLoadingChrome();
    if(!ui)return;
    clearTimeout(hideTimer);
    const value=Math.max(0,Math.min(100,Number(pct)||0));

    if(show){
      ui.loading.classList.remove('mcBootGone','mcBootLeaving');
      ui.loading.classList.add('show','v15Loading','v1591WorldLoading');
      ui.loading.style.removeProperty('display');
      ui.loading.style.removeProperty('visibility');
      ui.loading.style.removeProperty('pointer-events');
      ui.loading.removeAttribute('aria-hidden');
      ui.headline.textContent=gameRef?.__v1591FreshWorldLoading?'Preparing for world creation...':'Loading world...';
      ui.percent.textContent=`${Math.round(value)}%`;
      if(ui.bar)ui.bar.style.width=`${value}%`;
      if(ui.text)ui.text.textContent=worldStageText(value,text);
      document.documentElement.classList.add('v1591WorldStarting');
      return;
    }

    ui.percent.textContent='100%';
    if(ui.bar)ui.bar.style.width='100%';
    if(ui.text)ui.text.textContent='Joining world...';
    ui.loading.classList.add('show','mcBootLeaving');
    ui.loading.setAttribute('aria-hidden','true');
    hideTimer=setTimeout(()=>{
      ui.loading.classList.remove('show','mcBootLeaving','v1591WorldLoading');
      ui.loading.classList.add('mcBootGone');
      ui.loading.style.setProperty('display','none','important');
      ui.loading.style.setProperty('visibility','hidden','important');
      ui.loading.style.setProperty('pointer-events','none','important');
      document.documentElement.classList.remove('v1591WorldStarting');
    },180);
  }

  function installWorldLoadingPatch(){
    if(typeof Game==='undefined'||!Game.prototype)return;

    if(!Game.prototype.__v1591SetLoadingBase){
      Game.prototype.__v1591SetLoadingBase=Game.prototype.setLoading;
      Game.prototype.setLoading=function(show,pct,text){
        const base=this.__v1591SetLoadingBase;
        if(typeof base==='function')base.call(this,show,pct,text);
        presentWorldLoading(this,!!show,pct,text);
      };
    }

    if(!Game.prototype.__v1591BootBase){
      Game.prototype.__v1591BootBase=Game.prototype.boot;
      Game.prototype.boot=async function(...args){
        this.__v1591FreshWorldLoading=!!args[1];
        try{
          return await this.__v1591BootBase.apply(this,args);
        } finally {
          this.__v1591FreshWorldLoading=false;
        }
      };
    }

    if(!Game.prototype.__v1591NewWorldBase){
      Game.prototype.__v1591NewWorldBase=Game.prototype.newWorld;
      Game.prototype.newWorld=async function(...args){
        this.__v1591FreshWorldLoading=true;
        presentWorldLoading(this,true,0,'Preparing for world creation...');
        try{
          return await this.__v1591NewWorldBase.apply(this,args);
        } catch(error){
          const ui=ensureWorldLoadingChrome();
          if(ui?.text)ui.text.textContent=`World failed to load: ${error?.message||'Unknown error'}`;
          throw error;
        }
      };
    }
  }

  installStyle();
  applyVersionedIcon();
  installTitleObserver();
  installWorldLoadingPatch();

  if(typeof window.rebuildCanonicalTitleV158==='function'&&!window.rebuildCanonicalTitleV158.__v1591Wrapped){
    const base=window.rebuildCanonicalTitleV158;
    const wrapped=function(...args){
      const result=base.apply(this,args);
      queueCanonicalize();
      return result;
    };
    wrapped.__v1591Wrapped=true;
    window.rebuildCanonicalTitleV158=wrapped;
  }

  window.MINECRAFT_WEB_VERSION=BUILD;
  window.STUDIO_PATCH_VERSION='0.15.9.1-world-loading-title-dedupe';
  window.__voxelDiag?.log?.('V15.9.1 READY: exactly one Java Edition title mark, corrected title sizing, and Java-style dirt world-loading screen for Create/Load World.','ok');
})();
