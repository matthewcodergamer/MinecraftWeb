/* Minecraft Web V15.9 — PWA audio lifecycle, real runtime quit and final title bindings. */
(function(){
  const $=id=>document.getElementById(id);
  const style=document.createElement('style');style.id='v159QuitStyle';style.textContent=`#v159QuitScreen{position:fixed;inset:0;z-index:5000;display:none;align-items:center;justify-content:center;background:#000;color:#fff;text-align:center;font:16px/1.5 'Minecraft Seven','Courier New',monospace;padding:24px;box-sizing:border-box;text-shadow:2px 2px #222}#v159QuitScreen.open{display:flex}.v159QuitSmall{display:block;margin-top:10px;color:#999;font-size:11px;text-shadow:none}`;document.head.appendChild(style);

  function pauseEveryAudio(){for(const a of document.querySelectorAll('audio')){try{a.pause()}catch{}}}
  async function suspendContexts(){const contexts=[game?.soundV9?.ctx,typeof soundSystem!=='undefined'?soundSystem?.context:null].filter(Boolean);for(const ctx of contexts){try{if(ctx.state==='running')await ctx.suspend()}catch{}}}
  function stopMusicSchedulers(){try{game?.menuMusicV145?.stop?.()}catch{}try{game?.javaAudioV144?.stopMusicV145?.()}catch{}try{if(game?.musicV143)game.musicV143.next=Infinity}catch{}}
  function suspendForBackground(reason='hidden'){
    window.__mcBackgroundSuspendedV159=true;stopMusicSchedulers();pauseEveryAudio();void suspendContexts();try{if(game?.running)game.save?.()}catch{}
    window.__voxelDiag?.log?.(`V15.9 LIFECYCLE: audio suspended (${reason}).`,'info');
  }
  async function resumeAfterGesture(){
    if(document.hidden||game?.__hardQuitV159)return;window.__mcBackgroundSuspendedV159=false;
    for(const ctx of [game?.soundV9?.ctx,typeof soundSystem!=='undefined'?soundSystem?.context:null]){try{if(ctx?.state==='suspended')await ctx.resume()}catch{}}
  }
  function armResumeGesture(){
    if(document.hidden||game?.__hardQuitV159)return;
    const once=()=>{void resumeAfterGesture();document.removeEventListener('pointerdown',once,true);document.removeEventListener('touchstart',once,true);document.removeEventListener('keydown',once,true)};
    document.addEventListener('pointerdown',once,{capture:true,passive:true,once:true});document.addEventListener('touchstart',once,{capture:true,passive:true,once:true});document.addEventListener('keydown',once,{capture:true,once:true});
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendForBackground('visibilitychange');else armResumeGesture()},{passive:true});
  addEventListener('pagehide',()=>suspendForBackground('pagehide'),{passive:true});addEventListener('freeze',()=>suspendForBackground('freeze'),{passive:true});

  if(typeof MinecraftSoundSystemV9!=='undefined'){
    const unlockBase=MinecraftSoundSystemV9.prototype.unlock;
    MinecraftSoundSystemV9.prototype.unlock=async function(...args){if(document.hidden||window.__mcBackgroundSuspendedV159||game?.__hardQuitV159)throw new Error('Audio suspended by page lifecycle');return unlockBase.apply(this,args)};
  }
  if(typeof JavaAudioEngineV145!=='undefined'){
    const musicBase=JavaAudioEngineV145.prototype.playMusicV145;
    JavaAudioEngineV145.prototype.playMusicV145=function(...args){if(document.hidden||window.__mcBackgroundSuspendedV159||game?.__hardQuitV159)return Promise.resolve(false);return musicBase.apply(this,args)};
    const eventBase=JavaAudioEngineV145.prototype.playEvent;if(eventBase)JavaAudioEngineV145.prototype.playEvent=function(...args){if(document.hidden||game?.__hardQuitV159)return false;return eventBase.apply(this,args)};
  }

  function ensureQuitScreen(){let q=$('v159QuitScreen');if(q)return q;q=document.createElement('div');q.id='v159QuitScreen';q.innerHTML='<div>Minecraft has quit.<span class="v159QuitSmall">You can close this tab or swipe away the web app.</span></div>';document.body.appendChild(q);return q}
  function hardQuitMinecraft(){
    try{if(game?.running)game.save?.()}catch{}if(game){game.running=false;game.__hardQuitV159=true;try{game.endBreak?.()}catch{}try{game.ui?.close?.()}catch{}try{game.input?.pointer?.clear?.()}catch{}try{game.renderer?.renderer?.setAnimationLoop?.(null)}catch{}}
    stopMusicSchedulers();pauseEveryAudio();void suspendContexts();try{if(game?.photonAtmosphereV151?.group)game.photonAtmosphereV151.group.visible=false}catch{}try{if(game?.photonGauntletV152?.clouds?.group)game.photonGauntletV152.clouds.group.visible=false;if(game?.photonGauntletV152?.post)game.photonGauntletV152.post.enabled=false}catch{}
    $('hud')?.setAttribute('aria-hidden','true');if($('hud'))$('hud').style.display='none';if($('titleScreen'))$('titleScreen').style.display='none';if($('gameCanvas'))$('gameCanvas').style.display='none';ensureQuitScreen().classList.add('open');try{window.close()}catch{}
  }
  window.quitMinecraftV159=hardQuitMinecraft;

  function repairPauseQuit(){
    const b=$('v15SaveQuit');if(!b||b.dataset.v159Fixed)return;b.dataset.v159Fixed='1';b.onclick=async()=>{
      try{await game?.save?.()}catch{}if(game)game.running=false;stopMusicSchedulers();$('v15PauseMenu')?.classList.remove('open');const t=$('titleScreen');if(t){t.style.display='';t.classList.add('show')}if($('hud'))$('hud').style.display='';if($('gameCanvas'))$('gameCanvas').style.display='';repairTitleBindings();
    };
  }
  function repairTitleBindings(){
    const p=$('playBtn');if(p&&!p.closest('#legacyBootBindings'))p.onclick=()=>window.openMinecraftWorldSelectV159?.();const q=$('v15Quit');if(q)q.onclick=hardQuitMinecraft;
    const edition=$('javaEditionV15');if(edition)edition.setAttribute('aria-label','Java Edition');const footer=$('v158Footer');if(footer)footer.innerHTML='<span>Minecraft Web 0.15.9</span><span>Java 26.1 • Three.js • Photon Web</span>';repairPauseQuit();
  }
  window.repairTitleBindingsV159=repairTitleBindings;window.repairPauseQuitV159=repairPauseQuit;
  if(typeof window.rebuildCanonicalTitleV158==='function'){const rebuildBase=window.rebuildCanonicalTitleV158;window.rebuildCanonicalTitleV158=function(...args){const r=rebuildBase.apply(this,args);queueMicrotask(repairTitleBindings);return r}}
  queueMicrotask(repairTitleBindings);[0,120,500,1250].forEach(ms=>setTimeout(repairTitleBindings,ms));
})();
