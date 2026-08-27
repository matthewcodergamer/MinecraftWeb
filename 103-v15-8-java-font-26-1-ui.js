/* Minecraft Web V15.8 — Minecraft Seven + Java 26.1 UI source-of-truth bridge.
 * Runs after legacy compatibility patches. Gameplay systems remain untouched.
 */
(function(){
  const BUILD='0.15.8';
  const JAVA='./assets/java/26.1/';
  const ICON='./assets/icon/minecraft-java-icon.png?v=0.15.8';
  const FONT_LOCAL='./assets/fonts/Minecraft-Seven.woff2?v=0.15.8';
  const FONT_OFFICIAL='https://raw.githubusercontent.com/Mojang/web-theme-bootstrap/main/assets/fonts/Minecraft-Seven_v2.woff2';

  window.JAVA_261_ROOT=JAVA;

  /* Official Mojang browser font. Java 26.1's font/ folder remains the source for
   * bitmap glyph resources; Minecraft Seven is used for DOM/browser UI text. */
  const style=document.createElement('style');
  style.id='v158MinecraftSevenJavaUI';
  style.textContent=`
    @font-face{font-family:'Minecraft Seven';src:url('${FONT_LOCAL}') format('woff2'),url('${FONT_OFFICIAL}') format('woff2');font-style:normal;font-weight:400;font-display:swap}
    html,body,#app,#titleScreen,#screenLayer,#hud,#toast,#loading,
    button,input,select,textarea,label,.v15Screen,.v15Header,.v15Body,.v15Control,
    .v15JavaBtn,.v15Back,.v15Done,.mc-btn,.javaButtonV148C,.v9MenuBtn,
    #hotbar,#debug,#topStatus,#mobileHint,#voxelDiag,#voxelOptions{
      font-family:'Minecraft Seven','Courier New',monospace!important;
    }
    #titleContent.v157CanonicalTitle #mcLogo{display:block!important;object-fit:contain!important}
    #titleContent.v157CanonicalTitle #javaEditionV15{display:block!important;object-fit:contain!important}
    #titleScreen .v15Footer,#titleScreen .v9Small,#titleScreen #titleSub,#titleScreen .javaBootSmall,#titleScreen .javaSourceRowV144{display:none!important}
    #loadingText{font-family:'Minecraft Seven','Courier New',monospace!important;letter-spacing:0!important}
  `;
  document.head.appendChild(style);

  async function ensureMinecraftSeven(){
    if(!document.fonts)return;
    try{
      await document.fonts.load("16px 'Minecraft Seven'");
      document.documentElement.classList.add('minecraftSevenReady');
      return;
    }catch{}
    try{
      const face=new FontFace('Minecraft Seven',`url(${FONT_OFFICIAL})`,{style:'normal',weight:'400'});
      await face.load();document.fonts.add(face);document.documentElement.classList.add('minecraftSevenReady');
    }catch(e){console.warn('[V15.8 font]',e)}
  }
  ensureMinecraftSeven();

  /* The legacy core only needs playBtn/creativeBtn while it initializes. V15.7
   * has already built the real Java title by the time this patch runs. */
  document.getElementById('legacyBootBindings')?.remove();

  function canonicalizeTitle(){
    const title=document.getElementById('titleScreen');
    const content=document.getElementById('titleContent');
    if(!title||!content)return;

    const logos=[...content.querySelectorAll('#mcLogo,img[src*="gui/title/minecraft.png"]')];
    logos.slice(1).forEach(el=>el.remove());
    const editions=[...content.querySelectorAll('#javaEditionV15,#javaBootEdition,img[src*="gui/title/edition.png"]')];
    editions.slice(1).forEach(el=>el.remove());
    const logo=content.querySelector('#mcLogo');if(logo)logo.src=`${JAVA}gui/title/minecraft.png`;
    const edition=content.querySelector('#javaEditionV15,#javaBootEdition,img[src*="gui/title/edition.png"]');
    if(edition)edition.src=`${JAVA}gui/title/edition.png`;

    title.querySelectorAll('.v15Footer,.v9Small,#titleSub,.javaBootSmall,.javaSourceRowV144,.v148PacksBtn').forEach(el=>el.remove());
    const footers=[...title.querySelectorAll('#v157Footer,#v158Footer')];
    footers.slice(0,-1).forEach(el=>el.remove());
    const footer=footers.at(-1);
    if(footer){footer.id='v158Footer';footer.innerHTML='<span>Minecraft Web 0.15.8</span><span>Java 26.1 • Three.js • Photon Web</span>';}
  }

  /* Correct icon path wins over every old branding patch, including delayed ones. */
  function applyIcon(){
    const ensure=(rel)=>{let l=document.head.querySelector(`link[rel="${rel}"]`);if(!l){l=document.createElement('link');l.rel=rel;document.head.appendChild(l)}l.href=ICON;l.type='image/png';return l};
    ensure('icon');ensure('shortcut icon');const apple=ensure('apple-touch-icon');apple.removeAttribute('type');
    document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(l=>l.href=ICON);
    document.documentElement.dataset.minecraftJavaIcon='v158-local-exact';
  }

  canonicalizeTitle();applyIcon();
  requestAnimationFrame(()=>{canonicalizeTitle();applyIcon()});
  setTimeout(()=>{canonicalizeTitle();applyIcon()},450);
  setTimeout(()=>{canonicalizeTitle();applyIcon()},1100);

  window.MINECRAFT_WEB_VERSION=BUILD;
  window.STUDIO_PATCH_VERSION='0.15.8-java-font-26-1-ui';
  window.__voxelDiag?.log?.('V15.8 READY: Minecraft Seven UI font, Java 26.1 canonical UI assets, bootstrap crash cleanup, exact local Java icon path.','ok');
})();
