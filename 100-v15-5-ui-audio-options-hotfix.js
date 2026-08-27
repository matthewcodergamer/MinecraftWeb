/* Minecraft Web V15.5 — post-finalizer UI/audio/options hotfix.
 * Runs AFTER 99-finalize.js so the legacy V14.8 finalizer cannot overwrite V15 UI.
 */
(function(){
  const BUILD='0.15.5';
  const q=id=>document.getElementById(id);
  const root='./assets/java/';
  const clickOgg=`${root}sounds/random/click_stereo.ogg`;
  const prefsKey='minecraftWebV155Options';
  const readPrefs=()=>{try{return Object.assign({master:72,music:35,sounds:100,fov:70,sensitivity:50,autoJump:true,chat:true,narrator:false,highContrast:false,language:'English (US)',mainHand:'Right'},JSON.parse(localStorage.getItem(prefsKey)||'{}'));}catch{return {master:72,music:35,sounds:100,fov:70,sensitivity:50,autoJump:true,chat:true,narrator:false,highContrast:false,language:'English (US)',mainHand:'Right'}}};
  const savePrefs=p=>{try{localStorage.setItem(prefsKey,JSON.stringify(p))}catch{}};
  let prefs=readPrefs();

  // 99-finalize.js rebuilds the old V14.8 title. Rebuild V15 once more after it.
  try{ if(typeof v15BuildTitle==='function') v15BuildTitle(); }catch(e){ console.warn('[V15.5 title rebuild]',e); }

  function fixTitle(){
    const c=q('titleContent'); if(!c)return;
    // Always use the local 26.1 art and keep exactly ONE Java Edition strip.
    const logo=q('mcLogo'); if(logo) logo.src='./assets/java/26.1/gui/title/minecraft.png';
    const editionImgs=[...c.querySelectorAll('img')].filter(img=>/edition\.png/i.test(img.getAttribute('src')||'') || /java\s*edition/i.test(img.alt||'') || img.id==='javaEditionV15' || img.id==='javaBootEdition');
    let edition=editionImgs[0];
    if(!edition){ edition=document.createElement('img'); edition.id='javaEditionV15'; edition.alt='Java Edition'; edition.src='./assets/java/26.1/gui/title/edition.png'; logo?.after(edition); }
    else { edition.id='javaEditionV15'; edition.src='./assets/java/26.1/gui/title/edition.png'; }
    editionImgs.slice(1).forEach(x=>x.remove());
    c.querySelectorAll('#javaEditionV15').forEach((x,i)=>{if(i)x.remove()});
    const footer=document.querySelector('#titleScreen .v15Footer');
    if(footer) footer.innerHTML=`<span>Minecraft Web ${BUILD}</span><span>Java 26.1 • Three.js • Photon Web</span>`;
  }
  fixTitle(); requestAnimationFrame(fixTitle); setTimeout(fixTitle,100);

  // iOS Safari requires AudioContext creation/resume from a real user gesture.
  async function unlockAudio(){
    try{
      const sys=window.game?.soundV9;
      if(sys?.unlock){ const ctx=await sys.unlock(); if(ctx?.state==='suspended') await ctx.resume(); }
    }catch(e){ console.warn('[V15.5 audio unlock]',e); }
  }
  ['pointerdown','touchstart','mousedown','keydown'].forEach(type=>document.addEventListener(type,unlockAudio,{passive:true,capture:true}));

  function applyVolume(){
    try{ if(game?.soundV9?.master) game.soundV9.master.gain.value=Math.max(0,Math.min(1,prefs.master/100)); }catch{}
  }
  applyVolume();

  // Guaranteed local OGG path for Java menu clicks. This also gives Safari a direct
  // media-element fallback if WebAudio decoding is unavailable on the first gesture.
  function playUiClick(){
    if(prefs.master<=0 || prefs.sounds<=0)return;
    unlockAudio();
    try{
      const a=new Audio(clickOgg); a.preload='auto'; a.volume=Math.min(.55,(prefs.master/100)*(prefs.sounds/100)*.55); a.play().catch(()=>{});
    }catch{}
  }
  document.addEventListener('click',e=>{if(e.target.closest('button,.v15Control,.v15JavaBtn,.v15Done,.v15Back,.mc-btn')) playUiClick();},true);

  // Older local OGG mirror uses classic Java paths (dig/, step/, random/, damage/).
  // Keep the modern catalog first, then fall back to the local files that are actually in this repo.
  const legacyForEvent=(event)=>{
    const e=String(event||'').toLowerCase();
    if(e.includes('button')||e==='click'||e.includes('ui.')) return 'random/click_stereo.ogg';
    if(e.includes('hurt')||e.includes('damage')) return `damage/hit${1+Math.floor(Math.random()*3)}.ogg`;
    if(e.includes('explode')) return `random/explode${1+Math.floor(Math.random()*4)}.ogg`;
    if(e.includes('bow')||e.includes('arrow.shoot')) return 'random/bow.ogg';
    if(e.includes('creeper')&&e.includes('prim')) return 'random/fuse.ogg';
    const group=['grass','gravel','sand','snow','wood','stone'].find(g=>e.includes(g));
    if(group){ const n=1+Math.floor(Math.random()*4); return `${e.includes('step')?'step':'dig'}/${group}${n}.ogg`; }
    return null;
  };
  async function playLegacy(event,opts={}){
    const rel=legacyForEvent(event); if(!rel)return false;
    try{
      await unlockAudio();
      const a=new Audio(`${root}sounds/${rel}`); a.preload='auto';
      a.volume=Math.min(1,Math.max(0,(opts.volume??1)*(prefs.master/100)*(prefs.sounds/100)));
      a.playbackRate=Math.min(2,Math.max(.5,opts.pitch??1));
      await a.play(); return true;
    }catch{return false;}
  }
  try{
    if(typeof JavaAudioEngineV145!=='undefined'&&!JavaAudioEngineV145.prototype.__v155Patched){
      const original=JavaAudioEngineV145.prototype.playEvent;
      JavaAudioEngineV145.prototype.playEvent=async function(event,opts={}){
        let ok=false; try{ok=await original.call(this,event,opts)}catch{}
        return ok || await playLegacy(event,opts);
      };
      JavaAudioEngineV145.prototype.__v155Patched=true;
    }
  }catch(e){console.warn('[V15.5 JavaAudio patch]',e)}

  function makeScreen(id,title,body){
    let s=q(id); if(s)return s;
    s=document.createElement('section'); s.id=id; s.className='v15Screen';
    s.innerHTML=`<div class="v15Header">${title}</div><div class="v15Body"><div class="v15Grid">${body}</div></div><div class="v15Bottom"><button class="v15Back" data-back-options>Done</button></div>`;
    q('titleScreen')?.appendChild(s); s.querySelector('[data-back-options]').onclick=()=>v15OpenScreen('v15OptionsScreen'); return s;
  }
  const button=(id,text)=>`<button class="v15Control" id="${id}">${text}</button>`;

  function wireOptions(){
    try{v15EnsureScreens?.()}catch{}
    const options=q('v15OptionsScreen'); if(!options)return;

    q('v15Fov').onclick=()=>{ prefs.fov=prefs.fov>=110?60:prefs.fov+10; savePrefs(prefs); q('v15Fov').textContent=`FOV: ${prefs.fov===70?'Normal':prefs.fov}`; try{if(game?.renderer?.camera){game.renderer.camera.fov=prefs.fov;game.renderer.camera.updateProjectionMatrix()}}catch{} };

    q('v15Sound').onclick=()=>{
      const s=makeScreen('v155SoundScreen','Music & Sounds',`
        <div class="v15RangeRow wide"><span>Master Volume</span><span class="v15Value" id="v155MasterVal">${prefs.master}%</span><input id="v155Master" type="range" min="0" max="100" value="${prefs.master}"></div>
        <div class="v15RangeRow wide"><span>Music</span><span class="v15Value" id="v155MusicVal">${prefs.music}%</span><input id="v155Music" type="range" min="0" max="100" value="${prefs.music}"></div>
        <div class="v15RangeRow wide"><span>Sound</span><span class="v15Value" id="v155SoundsVal">${prefs.sounds}%</span><input id="v155Sounds" type="range" min="0" max="100" value="${prefs.sounds}"></div>
        ${button('v155TestSound','Test Java OGG Sound')}`);
      v15OpenScreen(s.id);
      [['v155Master','master'],['v155Music','music'],['v155Sounds','sounds']].forEach(([id,key])=>{const el=q(id);el.oninput=()=>{prefs[key]=+el.value;q(id+'Val').textContent=`${el.value}%`;savePrefs(prefs);applyVolume()}});
      q('v155TestSound').onclick=playUiClick;
    };

    q('v15Controls').onclick=()=>{
      const s=makeScreen('v155ControlsScreen','Controls',`
        <div class="v15RangeRow wide"><span>Sensitivity</span><span class="v15Value" id="v155SensVal">${prefs.sensitivity}%</span><input id="v155Sens" type="range" min="10" max="100" value="${prefs.sensitivity}"></div>
        ${button('v155AutoJump',`Auto-Jump: ${prefs.autoJump?'ON':'OFF'}`)} ${button('v155MainHand',`Main Hand: ${prefs.mainHand}`)}`);
      v15OpenScreen(s.id); q('v155Sens').oninput=e=>{prefs.sensitivity=+e.target.value;q('v155SensVal').textContent=e.target.value+'%';savePrefs(prefs)};
      q('v155AutoJump').onclick=()=>{prefs.autoJump=!prefs.autoJump;q('v155AutoJump').textContent=`Auto-Jump: ${prefs.autoJump?'ON':'OFF'}`;savePrefs(prefs)};
      q('v155MainHand').onclick=()=>{prefs.mainHand=prefs.mainHand==='Right'?'Left':'Right';q('v155MainHand').textContent=`Main Hand: ${prefs.mainHand}`;savePrefs(prefs)};
    };

    q('v15Language').onclick=()=>{const s=makeScreen('v155LanguageScreen','Language',`${button('v155Language',prefs.language)}<div class="v15Meta wide">Minecraft Web currently renders the game UI in English. The selector is ready for additional locale tables.</div>`);v15OpenScreen(s.id)};
    q('v15Chat').onclick=()=>{const s=makeScreen('v155ChatScreen','Chat Settings',`${button('v155ChatToggle',`Chat: ${prefs.chat?'Shown':'Hidden'}`)}`);v15OpenScreen(s.id);q('v155ChatToggle').onclick=()=>{prefs.chat=!prefs.chat;q('v155ChatToggle').textContent=`Chat: ${prefs.chat?'Shown':'Hidden'}`;savePrefs(prefs)}};
    q('v15Accessibility').onclick=()=>{const s=makeScreen('v155AccessibilityScreen','Accessibility Settings',`${button('v155Narrator',`Narrator: ${prefs.narrator?'ON':'OFF'}`)}${button('v155Contrast',`High Contrast: ${prefs.highContrast?'ON':'OFF'}`)}`);v15OpenScreen(s.id);q('v155Narrator').onclick=()=>{prefs.narrator=!prefs.narrator;q('v155Narrator').textContent=`Narrator: ${prefs.narrator?'ON':'OFF'}`;savePrefs(prefs)};q('v155Contrast').onclick=()=>{prefs.highContrast=!prefs.highContrast;q('v155Contrast').textContent=`High Contrast: ${prefs.highContrast?'ON':'OFF'}`;document.documentElement.classList.toggle('v155HighContrast',prefs.highContrast);savePrefs(prefs)}};
    q('v15Skin').onclick=()=>{const s=makeScreen('v155SkinScreen','Skin Customization',`${button('v155SkinInfo','Default Player Skin')}<div class="v15Meta wide">Skin layers remain controlled by the current player renderer.</div>`);v15OpenScreen(s.id)};
    q('v15Online').onclick=()=>{const s=makeScreen('v155OnlineScreen','Online',`<div class="v15Meta wide">Online transport is not connected yet. This screen now responds correctly instead of being a dead button.</div>`);v15OpenScreen(s.id)};
  }
  wireOptions(); setTimeout(wireOptions,60);

  // Start menu music after a user gesture instead of attempting autoplay on iOS.
  let musicStarted=false;
  const startMusic=()=>{if(musicStarted||prefs.music<=0)return;musicStarted=true;unlockAudio().then(()=>{try{game?.menuMusicV145?.start?.()}catch{}})};
  document.addEventListener('pointerdown',startMusic,{once:true,capture:true});
  document.addEventListener('touchstart',startMusic,{once:true,capture:true,passive:true});

  window.MINECRAFT_WEB_VERSION=BUILD;
  window.STUDIO_PATCH_VERSION='0.15.5-ui-audio-options-hotfix';
  window.__voxelDiag?.log?.('V15.5 READY: post-finalizer Java 26.1 title restored, duplicate edition art removed, iOS OGG unlock/fallback active, and Options buttons wired.','ok');
})();
