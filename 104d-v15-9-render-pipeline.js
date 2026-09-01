/* Minecraft Web V15.9 — stable vanilla day/night lighting + mobile-safe Photon pipeline. */
(function(){
  const BUILD='0.15.9',WORLD_LAST_PLAYED_KEY='minecraftWebV159LastPlayed';
  const $=id=>document.getElementById(id);const coarse=()=>{try{return matchMedia('(pointer:coarse)').matches}catch{return false}};const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));const mix=(a,b,t)=>a+(b-a)*t;const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};

  class JavaSkyDomeV159{
    constructor(rr){
      this.scene=rr.scene;this.camera=rr.camera;const radius=Math.max(90,Math.min(560,(this.camera.far||700)*.78));
      const geo=new THREE.SphereGeometry(radius,32,20),mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{uZenith:{value:new THREE.Color(0x78b7e8)},uHorizon:{value:new THREE.Color(0xa9d5f2)},uStars:{value:0},uWarm:{value:0}},vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`precision mediump float;varying vec3 vDir;uniform vec3 uZenith,uHorizon;uniform float uStars,uWarm;float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}void main(){float h=clamp(vDir.y*.5+.5,0.0,1.0),k=pow(h,.56);vec3 col=mix(uHorizon,uZenith,k);col=mix(col,vec3(1.0,.42,.18),(1.0-k)*uWarm*.42);if(vDir.y>-.02&&uStars>.001){vec3 cell=floor(normalize(vDir)*430.0);float s=step(.9972,hash(cell))*uStars*smoothstep(-.02,.18,vDir.y);col+=vec3(s);}gl_FragColor=vec4(col,1.0);}`});
      this.mesh=new THREE.Mesh(geo,mat);this.mesh.name='java_v159_stable_sky';this.mesh.frustumCulled=false;this.mesh.renderOrder=-1200;this.scene.add(this.mesh);
    }
    update(f){if(!this.mesh||!this.camera)return;this.mesh.position.copy(this.camera.position);this.mesh.visible=!f.photon;const u=this.mesh.material.uniforms;u.uZenith.value.copy(f.zenith);u.uHorizon.value.copy(f.horizon);u.uStars.value=f.stars;u.uWarm.value=f.twilight}
  }
  function dayFactors(){
    const phase=((dayClock?.phase?.()||0)%1+1)%1,ticks=phase*24000,sunY=Math.sin(phase*Math.PI*2);let light=1;
    if(ticks>=12000&&ticks<13000)light=mix(1,4/15,smooth((ticks-12000)/1000));else if(ticks>=13000&&ticks<23000)light=4/15;else if(ticks>=23000)light=mix(4/15,1,smooth((ticks-23000)/1000));
    const sunset=ticks>=11200&&ticks<=13400?1-Math.min(1,Math.abs(ticks-12300)/1100):0,sunrise=ticks>=22000||ticks<=600?(ticks>=22000?clamp01((ticks-22000)/1300):clamp01(1-ticks/600)):0,twilight=clamp01(Math.max(sunset,sunrise)),night=clamp01(1-(light-4/15)/(11/15)),stars=smooth(clamp01((night-.28)/.72));return{phase,ticks,sunY,light,night,twilight,stars};
  }
  function paletteFor(f){const dayZen=new THREE.Color(0x74b9ea),dayHor=new THREE.Color(0xb3dbf3),nightZen=new THREE.Color(0x08152f),nightHor=new THREE.Color(0x17284a),warm=new THREE.Color(0xe78b58),d=clamp01((f.light-4/15)/(11/15)),zen=nightZen.clone().lerp(dayZen,d),hor=nightHor.clone().lerp(dayHor,d);if(f.twilight>.01)hor.lerp(warm,.66*f.twilight);return{zenith:zen,horizon:hor}}
  function stabilizePhoton(gameRef){
    if(!gameRef?.renderer)return;const far=gameRef.renderer.camera?.far||700,isCoarse=coarse(),enabled=gameRef.photonV148?.enabled!==false;
    const a=gameRef.photonAtmosphereV151;if(a?.group){const s=Math.min(1,(far*.76)/900);a.group.scale.setScalar(s);a.group.visible=enabled&&!gameRef.__hardQuitV159&&!document.hidden;if(a.sky)a.sky.visible=a.group.visible;if(a.clouds)a.clouds.visible=false}
    const g=gameRef.photonGauntletV152;if(g?.clouds?.group){const s=Math.min(1,(far*.70)/760);g.clouds.group.scale.setScalar(s);g.clouds.group.visible=enabled&&!gameRef.__hardQuitV159&&!document.hidden;const profile=gameRef.photonV148?.profile||'Lite',maxLayers=isCoarse?(profile==='Lite'?1:2):4;g.clouds.layers?.forEach((m,i)=>{m.visible=!!g.clouds.group.visible&&i<maxLayers})}
    if(g?.post){const profile=gameRef.photonV148?.profile||'Lite';g.post.enabled=enabled&&!isCoarse&&!document.hidden&&!gameRef.__hardQuitV159&&(profile==='High'||profile==='Ultra')}
    const javaCloud=gameRef.cloudsV13?.mesh;if(javaCloud)javaCloud.visible=!enabled&&!gameRef.__hardQuitV159;
  }
  function applyMinecraftLighting(rr){
    if(!rr?.scene||!rr.camera)return;const f=dayFactors(),pal=paletteFor(f),photon=game?.photonV148?.enabled!==false,weather=clamp01(game?.weather?.intensity||game?.weatherIntensity||0),d=clamp01((f.light-4/15)/(11/15));f.zenith=pal.zenith;f.horizon=pal.horizon;f.photon=photon;
    if(!rr.javaSkyV159)rr.javaSkyV159=new JavaSkyDomeV159(rr);rr.javaSkyV159.update(f);const fogColor=pal.horizon.clone().lerp(new THREE.Color(0x56636d),weather*.42);if(rr.scene.background?.isColor)rr.scene.background.copy(fogColor);
    if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(fogColor);const worldRadius=(rr.world?.viewDistance||ENGINE.VIEW_DISTANCE)*ENGINE.CHUNK_SIZE,farSetting=Number(rr.lod?.far||worldRadius),fogFar=Math.max(58,Math.min(worldRadius*1.08,farSetting*1.82));rr.fog.near=Math.max(28,fogFar*(photon ? .58 : .66));rr.fog.far=fogFar}
    const sunAlt=Math.max(0,f.sunY),moonAlt=Math.max(0,-f.sunY),tw=f.twilight;if(rr.sun){rr.sun.intensity=(.06+sunAlt*(.88+.25*d))*(1-weather*.28);rr.sun.color.copy(new THREE.Color(0xfff4dc).lerp(new THREE.Color(0xffa760),tw*.72))}if(rr.moon){rr.moon.intensity=moonAlt*(.12+.10*f.night);rr.moon.color.set(0x9fb9df)}
    if(rr.ambient){rr.ambient.intensity=.26+d*.58;rr.ambient.color.copy(new THREE.Color(0x53698f).lerp(new THREE.Color(0xc7e6ff),d));rr.ambient.groundColor.copy(new THREE.Color(0x162039).lerp(new THREE.Color(0x665441),d))}if(rr.fillAmbient)rr.fillAmbient.intensity=.025+d*.065;
    const pv=game?.photonV148;if(pv?.rig){pv.rig.visible=photon;if(pv.hemi)pv.hemi.intensity=photon?(.18+d*.27):0;if(pv.sun)pv.sun.intensity=photon?sunAlt*(.28+.24*d)*(1-weather*.25):0}const renderer=rr.renderer;if(renderer){if(!photon){try{renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1}catch{}}else if(coarse()){try{renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96}catch{}}}stabilizePhoton(game);
  }

  const renderBase=VoxelRenderer.prototype.render;VoxelRenderer.prototype.render=function(dt){const web=this.renderer;if(!web?.render)return renderBase.call(this,dt);const actual=web.render;web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera)applyMinecraftLighting(this);return actual.call(web,scene,camera)};try{return renderBase.call(this,dt)}finally{web.render=actual}};
  if(typeof PhotonAtmosphereV151!=='undefined'){const base=PhotonAtmosphereV151.prototype.update;PhotonAtmosphereV151.prototype.update=function(...args){if(this.game?.__hardQuitV159||document.hidden){if(this.group)this.group.visible=false;return}const r=base.apply(this,args);stabilizePhoton(this.game);return r}}
  if(typeof PhotonWebGauntletV152!=='undefined'){const base=PhotonWebGauntletV152.prototype.update;PhotonWebGauntletV152.prototype.update=function(...args){if(this.game?.__hardQuitV159||document.hidden){if(this.clouds?.group)this.clouds.group.visible=false;if(this.post)this.post.enabled=false;return}const r=base.apply(this,args);stabilizePhoton(this.game);return r}}

  const bootBase=Game.prototype.boot;Game.prototype.boot=async function(...args){
    this.__hardQuitV159=false;if($('v159QuitScreen'))$('v159QuitScreen').classList.remove('open');if($('hud')){$('hud').style.display='';$('hud').removeAttribute('aria-hidden')}if($('gameCanvas'))$('gameCanvas').style.display='';const r=await bootBase.apply(this,args);
    try{if(!this.renderer.javaSkyV159)this.renderer.javaSkyV159=new JavaSkyDomeV159(this.renderer);stabilizePhoton(this);window.relocateOxygenV159?.();window.ensureDropButtonV159?.();window.repairPauseQuitV159?.()}catch(e){console.warn('[V15.9 boot repair]',e)}return r;
  };
  const saveBase=Game.prototype.save;Game.prototype.save=async function(...args){const r=await saveBase.apply(this,args);try{localStorage.setItem(WORLD_LAST_PLAYED_KEY,String(Date.now()))}catch{}return r};

  try{runtimeCommands.register('v159',()=>({build:BUILD,titleWorldFlow:true,backgroundAudioSuspension:true,oxygenPlacement:'right-above-hunger',dragOutWindowRouting:true,drop:'Q one / Ctrl+Q stack / mobile hold Q',render:{dayTicks:24000,daySeconds:1200,stableSkyInsideFarPlane:true,photonMobilePostFX:false,photonMaxMobileCloudLayers:2}}),'Inspect V15.9 gameplay/render repair state.')}catch{}
  window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.15.9-gameplay-render-repair';window.__voxelDiag?.log?.('V15.9 READY: Select World flow, real runtime quit, PWA background audio suspension, drag/drop repair, Q fast drop, Java HUD air placement, Minecraft 20-minute lighting cycle and mobile-safe Photon sky/cloud/post pipeline.','ok');
})();
