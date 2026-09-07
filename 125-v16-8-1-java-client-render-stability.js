/* Minecraft Web V16.8.1 — render-safe spawn gate, Prismarine-style held items,
 * neutral Java lighting and priority frame pacing.
 */
(function(){
'use strict';
const BUILD='0.16.8.1';
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};
const isCoarse=()=>{try{return matchMedia('(pointer:coarse)').matches}catch{return false}};
const raf=()=>new Promise(r=>requestAnimationFrame(r));

/* -------------------------------------------------------------------------- */
/* RENDER SAFETY — correctness first: portal occlusion may never erase the     */
/* player's local world. Mobile uses conservative frustum visibility.           */
/* -------------------------------------------------------------------------- */
function frustumSafeV1681(vis,reason='frustum-safe'){
  if(!vis?.nodes||!vis.updateFrustum?.())return vis?.stats;
  const start=performance.now();
  vis.visibleKeys?.clear?.();vis.renderVisibleKeys?.clear?.();
  let meshed=0,rendered=0,rejected=0;
  for(const n of vis.nodes.values()){
    if(!n.mesh)continue;meshed++;
    const show=n.group?.visible!==false&&vis.frustum.intersectsBox(n.box);
    n.mesh.visible=show;
    if(show){vis.visibleKeys.add(n.key);vis.renderVisibleKeys.add(n.key);rendered++}else rejected++;
  }
  vis.stats={sections:vis.nodes.size,meshedSections:meshed,visited:rendered,rendered,frustumRejected:rejected,portalRejected:0,lastMs:performance.now()-start,fallback:true,reason};
  return vis.stats;
}
function forceLocalSectionsV1681(vis,radius=2){
  const p=game?.player?.position;if(!vis?.nodes||!p)return 0;
  const cx=floorDiv(Math.floor(p.x),16),cz=floorDiv(Math.floor(p.z),16),sy=floorDiv(Math.floor(p.y),16);let forced=0;
  for(const n of vis.nodes.values()){
    if(!n.mesh||n.group?.visible===false)continue;
    if(Math.abs(n.cx-cx)>radius||Math.abs(n.cz-cz)>radius||Math.abs(n.sy-sy)>3)continue;
    n.mesh.visible=true;vis.visibleKeys?.add?.(n.key);vis.renderVisibleKeys?.add?.(n.key);forced++;
  }
  if(vis.stats)vis.stats.localForced=forced;
  return forced;
}
if(typeof SectionVisibilityV146!=='undefined'){
  const applyBaseV1681=SectionVisibilityV146.prototype.apply;
  SectionVisibilityV146.prototype.apply=function(){
    if(isCoarse())return frustumSafeV1681(this,'mobile-conservative-frustum');
    const stats=applyBaseV1681.call(this);forceLocalSectionsV1681(this,2);
    const meshed=Number(this.stats?.meshedSections||stats?.meshedSections||0),rendered=Number(this.stats?.rendered||stats?.rendered||0);
    if(meshed>=6&&rendered===0)return frustumSafeV1681(this,'desktop-zero-visible-recovery');
    return this.stats||stats;
  };
}

/* Hide giant selection boxes when the camera is inside the selected voxel. */
if(typeof VoxelRenderer!=='undefined'&&typeof VoxelRenderer.prototype.showSelection==='function'){
  const selectionBaseV1681=VoxelRenderer.prototype.showSelection;
  VoxelRenderer.prototype.showSelection=function(hit){
    if(hit&&this.camera){const dx=this.camera.position.x-(hit.x+.5),dy=this.camera.position.y-(hit.y+.5),dz=this.camera.position.z-(hit.z+.5);if(dx*dx+dy*dy+dz*dz<.64)hit=null}
    return selectionBaseV1681.call(this,hit);
  };
}
if(typeof VoxelSelectionRenderer!=='undefined'&&typeof VoxelSelectionRenderer.prototype.update==='function'){
  const outlineBaseV1681=VoxelSelectionRenderer.prototype.update;
  VoxelSelectionRenderer.prototype.update=function(hit){
    const cam=game?.renderer?.camera;if(hit&&cam){const dx=cam.position.x-(hit.x+.5),dy=cam.position.y-(hit.y+.5),dz=cam.position.z-(hit.z+.5);if(dx*dx+dy*dy+dz*dz<.64)hit=null}
    return outlineBaseV1681.call(this,hit);
  };
}

/* -------------------------------------------------------------------------- */
/* SPAWN / CHUNK GATE — never reveal a fresh world before the local terrain is */
/* both generated and meshed, and never allow the player's chunk to unload.    */
/* -------------------------------------------------------------------------- */
function chunkDistanceV1681(q,pcx,pcz){return Math.max(Math.abs((Number(q?.cx)||0)-pcx),Math.abs((Number(q?.cz)||0)-pcz))}
function ensureLocalChunksV1681(g,r=1,attach=true){
  const w=g?.world,p=g?.player?.position;if(!w||!p)return 0;const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));let ready=0;
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    try{const c=w.ensureChunk(cp.cx+dx,cp.cz+dz);if(c){ready++;if(attach&&g.renderer&&!g.renderer.chunkMeshes?.has?.(chunkKey(c.cx,c.cz)))g.renderer.attachChunk?.(c)}}catch{}
  }
  return ready;
}
function surfaceAtV1681(w,x,z){
  try{
    const cp=w.worldToChunk(x,z);w.ensureChunk(cp.cx,cp.cz);const y=w.highestSolidY(x,z);if(!Number.isFinite(y)||y<1||y>380)return null;
    const floor=w.getLoaded(x,y,z),a=w.getLoaded(x,y+1,z),b=w.getLoaded(x,y+2,z),lava=window.V165_BLOCK?.LAVA??-999;
    if(!SOLID_BLOCKS.has(floor)||floor===BLOCK.WATER||floor===lava||a!==BLOCK.AIR||b!==BLOCK.AIR)return null;
    return new THREE.Vector3(x+.5,y+1.02,z+.5);
  }catch{return null}
}
function findStableSurfaceV1681(g,radius=12){
  const p=g?.player?.position,w=g?.world;if(!p||!w)return null;const x0=Math.floor(p.x),z0=Math.floor(p.z);
  for(let r=0;r<=radius;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    if(r&&Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const s=surfaceAtV1681(w,x0+dx,z0+dz);if(s)return s;
  }
  try{return w.findSpawn?.()||null}catch{return null}
}
function placeOnStableSurfaceV1681(g,force=false){
  const p=g?.player,w=g?.world;if(!p?.position||!w)return false;let unsafe=!!force;
  try{
    const x=Math.floor(p.position.x),z=Math.floor(p.position.z),feet=Math.floor(p.position.y+.05),head=Math.floor(p.position.y+1.55),cp=w.worldToChunk(x,z);
    unsafe=unsafe||!w.getChunk(cp.cx,cp.cz)||!Number.isFinite(p.position.y)||p.position.y<1||p.position.y>382||!!p.collidesAt?.(p.position)||SOLID_BLOCKS.has(w.getLoaded(x,feet,z))||SOLID_BLOCKS.has(w.getLoaded(x,head,z));
  }catch{unsafe=true}
  if(!unsafe)return false;const s=findStableSurfaceV1681(g,12);if(!s)return false;
  p.position.copy(s);p.velocity?.set?.(0,0,0);p.onGround=false;p.updateCamera?.(g.renderer?.camera);
  g.playerEntitiesV12?.local?.root?.position?.copy?.(s);g.playerEntitiesV12?.local?.lastPos?.copy?.(s);
  ensureLocalChunksV1681(g,1,true);g.__spawnFixesV1681=(g.__spawnFixesV1681||0)+1;return true;
}
function localRenderReadyV1681(g){
  const p=g?.player?.position,w=g?.world,rr=g?.renderer;if(!p||!w||!rr)return false;const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));
  let chunks=0,meshes=0;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(w.getChunk(cp.cx+dx,cp.cz+dz))chunks++;if(rr.chunkMeshes?.get?.(chunkKey(cp.cx+dx,cp.cz+dz)))meshes++}
  const vis=rr.sectionVisibilityV146;let localSections=0;if(vis?.nodes)for(const n of vis.nodes.values())if(n.mesh&&Math.abs(n.cx-cp.cx)<=1&&Math.abs(n.cz-cp.cz)<=1)localSections++;
  return chunks>=7&&meshes>=3&&(!vis||localSections>=2);
}
async function gateFreshWorldV1681(g,fresh){
  if(!g?.world||!g?.player)return;const duration=fresh?2600:1000,deadline=performance.now()+duration;g.__surfaceGuardV1681Until=performance.now()+(fresh?9000:3500);
  try{g.setLoading?.(true,91,fresh?'Preparing spawn area…':'Loading nearby terrain…')}catch{}
  ensureLocalChunksV1681(g,1,true);placeOnStableSurfaceV1681(g,fresh);
  let stableFrames=0;
  while(performance.now()<deadline){
    ensureLocalChunksV1681(g,1,true);forceLocalSectionsV1681(g.renderer?.sectionVisibilityV146,2);
    if(localRenderReadyV1681(g))stableFrames++;else stableFrames=0;
    const pct=Math.min(99,92+Math.floor(((duration-Math.max(0,deadline-performance.now()))/duration)*7));
    try{g.setLoading?.(true,pct,stableFrames>=1?'Joining world…':'Building nearby terrain…')}catch{}
    if(stableFrames>=3)break;await raf();
  }
  g.__spawnWarmupV168Until=0;placeOnStableSurfaceV1681(g,false);ensureLocalChunksV1681(g,1,true);
  try{g.setLoading?.(false,100,'Ready')}catch{}
}

/* V16.8 could defer the entire load queue during a slow frame. Keep the near */
/* player work first and only lower budgets; never starve collision/render data. */
if(typeof World!=='undefined'){
  const tickQueuesBaseV1681=World.prototype.tickQueues;
  World.prototype.tickQueues=function(renderer){
    const p=renderer?.player?.position||game?.player?.position,pacer=game?.framePacerV168,wasDeferred=!!pacer?.deferLoads;
    let pcx=0,pcz=0;if(p){pcx=floorDiv(Math.floor(p.x),ENGINE.CHUNK_SIZE);pcz=floorDiv(Math.floor(p.z),ENGINE.CHUNK_SIZE)}
    if(this.loadQueue?.length&&p)this.loadQueue.sort((a,b)=>chunkDistanceV1681(a,pcx,pcz)-chunkDistanceV1681(b,pcx,pcz)||(Number(a.d)||0)-(Number(b.d)||0));
    if(this.unloadQueue?.length&&p)for(let i=this.unloadQueue.length-1;i>=0;i--)if(chunkDistanceV1681(this.unloadQueue[i],pcx,pcz)<=2)this.unloadQueue.splice(i,1);
    const slow=wasDeferred||Number(game?.performanceV146?.ema||60)<48;this.v146LoadBudget=slow?1:(isCoarse()?1:2);this.v146BuildBudget=slow?1:(isCoarse()?1:2);
    if(pacer)pacer.deferLoads=false;
    try{return tickQueuesBaseV1681.call(this,renderer)}finally{if(pacer)pacer.deferLoads=wasDeferred}
  };
}

/* -------------------------------------------------------------------------- */
/* FIRST PERSON — use the same principle as minecraft-renderer's itemMesh:     */
/* a real extruded item mesh, camera-space, small X/Y tilt, with the grip       */
/* overlapping the visible hand instead of a world object floating beside it. */
/* -------------------------------------------------------------------------- */
function stemV1681(id){try{return String(javaItemNameV145?.(id)||ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}catch{return''}}
function toolV1681(id){return /pickaxe|sword|(^|_)axe$|shovel|hoe|stick|bow|arrow|shears/.test(stemV1681(id))}
function normalizeHeldMeshesV1681(root,id){
  if(!root)return;root.traverse?.(o=>{
    if(!o.isMesh)return;o.frustumCulled=false;o.renderOrder=2506;o.layers?.set?.(1);
    const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m)continue;m.depthTest=false;m.depthWrite=false;m.fog=false;m.toneMapped=false;if('alphaTest'in m)m.alphaTest=Math.max(.045,Number(m.alphaTest)||0)}
    if(toolV1681(id)&&o.userData?.v1651GeneratedItem){o.rotation.set(0,0,0);o.position.set(.035,-.015,0);o.userData.prismarineFacingV1681=true}
  });
}
if(typeof FirstPersonViewV7!=='undefined'){
  const armBaseV1681=FirstPersonViewV7.prototype.arm;
  FirstPersonViewV7.prototype.arm=function(x){const m=armBaseV1681.call(this,x);if(!m)return m;const s=x>0?1:-1;m.position.set(.47*s,-.49,-.73);m.rotation.set(-.34,0,-.10*s);m.renderOrder=2504;m.frustumCulled=false;return m};
  const makeBaseV1681=FirstPersonViewV7.prototype.makeItem;
  FirstPersonViewV7.prototype.makeItem=function(id,left=false){
    const root=makeBaseV1681.call(this,id,left);if(!root)return root;const s=left?-1:1,block=this.game?.itemToBlock?.(id)??BLOCK.AIR;
    if(id===ITEM.TORCH){root.position.set(.475*s,-.405,-.655);root.rotation.set(-Math.PI/16,.10*s,-.22*s);root.scale.setScalar(.50);root.userData.v1681Grip='torch'}
    else if(toolV1681(id)){root.position.set(.465*s,-.405,-.655);root.rotation.set(-Math.PI/12,Math.PI/12*s,-.18*s);root.scale.setScalar(1.18);root.userData.v1681Grip='handheld'}
    else if(block!==BLOCK.AIR){root.position.set(.43*s,-.42,-.69);root.rotation.set(-.28,-.42*s,.10*s);root.scale.setScalar(.42);root.userData.v1681Grip='block'}
    normalizeHeldMeshesV1681(root,id);setTimeout(()=>normalizeHeldMeshesV1681(root,id),0);setTimeout(()=>normalizeHeldMeshesV1681(root,id),120);return root;
  };
  const refreshBaseV1681=FirstPersonViewV7.prototype.refresh;
  FirstPersonViewV7.prototype.refresh=function(...args){const r=refreshBaseV1681.apply(this,args);const id=this.game?.selectedStack?.()?.id||0;if(this.rightArm)this.rightArm.visible=true;normalizeHeldMeshesV1681(this.rightItem,id);return r};
}

/* -------------------------------------------------------------------------- */
/* JAVA-LIKE ENVIRONMENT — keep sunset at the horizon, not painted over the   */
/* whole terrain. Tick 0/06:00 is already bright; noon remains neutral white. */
/* -------------------------------------------------------------------------- */
const C1681={
  dayZen:new THREE.Color(0x78a7ff),dayHor:new THREE.Color(0xb7d3ff),nightZen:new THREE.Color(0x030713),nightHor:new THREE.Color(0x11192b),twilight:new THREE.Color(0xd88968),
  ambientNight:new THREE.Color(0x71809a),ambientDay:new THREE.Color(0xdcecff),groundNight:new THREE.Color(0x2b3039),groundDay:new THREE.Color(0x77776b),sun:new THREE.Color(0xfffdf2),cloudNight:new THREE.Color(0x626b7c),cloudDay:new THREE.Color(0xffffff)
};
function envV1681(){
  const phase=((Number(dayClock?.phase?.())||0)%1+1)%1,ticks=phase*24000,a=phase*Math.PI*2,alt=Math.sin(a),dir=new THREE.Vector3(Math.cos(a),alt,Math.sin(a)*.18).normalize();
  let sky=15;if(ticks>=11000&&ticks<13000)sky=lerp(15,4,smooth((ticks-11000)/2000));else if(ticks>=13000&&ticks<23000)sky=4;else if(ticks>=23000)sky=lerp(4,15,smooth((ticks-23000)/1000));
  const daylight=clamp01((sky-4)/11),night=1-daylight,horizon=1-smooth(clamp01(Math.abs(alt)/.20));let twilight=0;
  if(ticks>=10800&&ticks<=13200)twilight=1-Math.min(1,Math.abs(ticks-12000)/1200);else if(ticks>=22800||ticks<=900)twilight=ticks>=22800?(ticks-22800)/1200:1-ticks/900;
  twilight=clamp01(twilight*horizon);return{phase,ticks,alt,dir,sky,daylight,night,twilight};
}
function finalEnvironmentV1681(rr,s){
  if(!rr?.scene||!rr?.camera)return;const zen=C1681.nightZen.clone().lerp(C1681.dayZen,s.daylight),hor=C1681.nightHor.clone().lerp(C1681.dayHor,s.daylight);if(s.twilight>.001)hor.lerp(C1681.twilight,.22*s.twilight);
  if(rr.javaSkyV159?.mesh){const u=rr.javaSkyV159.mesh.material?.uniforms;rr.javaSkyV159.mesh.position.copy(rr.camera.position);rr.javaSkyV159.mesh.visible=true;u?.uZenith?.value?.copy?.(zen);u?.uHorizon?.value?.copy?.(hor);if(u?.uStars)u.uStars.value=smooth(clamp01((s.night-.18)/.76));if(u?.uWarm)u.uWarm.value=s.twilight*.035}else if(rr.scene.background?.isColor)rr.scene.background.copy(hor);
  if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(hor)}
  if(rr.dayStateV6){rr.dayStateV6.daylight=s.sky/15;rr.dayStateV6.internalSkyLight=s.sky;rr.dayStateV6.isNight=s.sky<7}
  if(rr.ambient){rr.ambient.intensity=lerp(.36,1.14,s.daylight);rr.ambient.color.copy(C1681.ambientNight).lerp(C1681.ambientDay,s.daylight);rr.ambient.groundColor.copy(C1681.groundNight).lerp(C1681.groundDay,s.daylight)}
  if(rr.fillAmbient)rr.fillAmbient.intensity=lerp(.05,.14,s.daylight);
  if(rr.sun){rr.sun.position.copy(rr.camera.position).addScaledVector(s.dir,140);if(rr.sun.target){rr.sun.target.position.copy(rr.camera.position);if(!rr.sun.target.parent)rr.scene.add(rr.sun.target)}rr.sun.color.copy(C1681.sun);rr.sun.intensity=s.alt>-.12?lerp(.18,.72,s.daylight)*smooth(clamp01((s.alt+.12)/.25)):0;rr.sun.castShadow=false}
  if(rr.moon){rr.moon.intensity=.05+.12*s.night;rr.moon.color?.set?.(0xa8b9d8)}
  const proc=rr.squareSunV161;if(proc?.mesh){const d=Math.min(500,Math.max(110,Number(rr.camera.far||700)*.70));proc.mesh.position.copy(rr.camera.position).addScaledVector(s.dir,d);proc.mesh.quaternion.copy(rr.camera.quaternion);proc.mesh.visible=s.alt>-.09&&!document.hidden&&!game?.__hardQuitV159;proc.mesh.frustumCulled=false;if(proc.material){proc.material.depthTest=true;proc.material.depthWrite=false;const u=proc.material.uniforms;if(u?.uCore)u.uCore.value.set(0xffffff);if(u?.uEdge)u.uEdge.value.set(0xffffe4);if(u?.uOpacity)u.uOpacity.value=smooth(clamp01((s.alt+.09)/.14))}}
  const cloud=game?.cloudsV13?.mesh;if(cloud?.material){cloud.material.color.copy(C1681.cloudNight).lerp(C1681.cloudDay,s.daylight);cloud.material.opacity=1;cloud.material.depthTest=true;cloud.material.depthWrite=false;cloud.material.toneMapped=false}
  if(rr.renderer){rr.renderer.toneMapping=THREE.NoToneMapping;rr.renderer.toneMappingExposure=1;rr.renderer.outputColorSpace=THREE.SRGBColorSpace}
  window.__v1681Environment={ticks:Number(s.ticks.toFixed(1)),skyLight:Number(s.sky.toFixed(2)),daylight:Number(s.daylight.toFixed(3)),twilight:Number(s.twilight.toFixed(3))};
}
if(typeof VoxelRenderer!=='undefined'){
  const renderBaseV1681=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(...args){
    const web=this.renderer,raw=web?.render;if(typeof raw!=='function')return renderBaseV1681.apply(this,args);
    web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera)finalEnvironmentV1681(this,envV1681());return raw.call(web,scene,camera)};
    try{return renderBaseV1681.apply(this,args)}finally{web.render=raw}
  };
}

/* -------------------------------------------------------------------------- */
/* MODE SEMANTICS + PERFORMANCE TUNING                                         */
/* -------------------------------------------------------------------------- */
function syncWorldRulesV1681(g){
  let s=null;try{s=typeof v15WorldState==='function'?v15WorldState():null}catch{};const mode=String(s?.mode||g?.worldModeV168||'Survival').toLowerCase(),difficulty=String(s?.difficulty||g?.difficultyV168||'Normal').toLowerCase();
  g.worldModeV168=mode==='hardcore'?'Hardcore':mode==='creative'?'Creative':'Survival';g.hardcoreV168=g.worldModeV168==='Hardcore';g.creativeV168=g.worldModeV168==='Creative';g.difficultyV168=g.hardcoreV168?'Hard':difficulty==='peaceful'?'Peaceful':difficulty==='easy'?'Easy':difficulty==='hard'?'Hard':'Normal';
  g.mode=g.creativeV168?'creative':'survival';if(g.player){if(g.creativeV168){g.player.health=20;g.player.hunger=20;g.player.flying=true}else if(g.hardcoreV168)g.player.flying=false;if(g.difficultyV168==='Peaceful')g.player.hunger=20}
}
function tuneGovernorV1681(g){const gov=g?.performanceV146;if(!gov)return;if(isCoarse()){gov.minDpr=.85;gov.maxDpr=Math.min(1.50,window.devicePixelRatio||1.5);if(gov.dpr>gov.maxDpr)gov.applyDpr?.(gov.maxDpr);gov.interval=.55}else{gov.minDpr=Math.min(gov.minDpr||1.25,1.0);gov.maxDpr=Math.min(gov.maxDpr||2,2.0)}}

if(typeof Game!=='undefined'){
  const bootBaseV1681=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const fresh=!!args[1];let r=await bootBaseV1681.apply(this,args);syncWorldRulesV1681(this);tuneGovernorV1681(this);await gateFreshWorldV1681(this,fresh);this.firstPersonV7?.refresh?.();renderSurvivalBarsV6?.(this.player,this.mode);window.__voxelDiag?.log?.(`V16.8.1 READY: ${this.worldModeV168}/${this.difficultyV168}; conservative local rendering, gated surface spawn, camera-space held items, neutral Java daylight and priority frame pacing active.`,'ok');return r;
  };
  const updateBaseV1681=Game.prototype.update;
  Game.prototype.update=function(dt){
    const r=updateBaseV1681.call(this,dt),now=performance.now();
    if(now<(this.__surfaceGuardV1681Until||0)){
      ensureLocalChunksV1681(this,1,false);let unsafe=false;try{const p=this.player.position,x=Math.floor(p.x),z=Math.floor(p.z),cp=this.world.worldToChunk(x,z);unsafe=!this.world.getChunk(cp.cx,cp.cz)||p.y<1||!!this.player.collidesAt?.(p)}catch{unsafe=true}if(unsafe)placeOnStableSurfaceV1681(this,true)
    }
    forceLocalSectionsV1681(this.renderer?.sectionVisibilityV146,2);normalizeHeldMeshesV1681(this.firstPersonV7?.rightItem,this.selectedStack?.()?.id||0);return r;
  };
}

try{runtimeCommands.register('v1681',()=>({build:BUILD,player:game?.player?.position?.toArray?.(),spawnFixes:game?.__spawnFixesV1681||0,render:game?.renderer?.sectionVisibilityV146?.stats||null,mode:game?.worldModeV168,difficulty:game?.difficultyV168,frame:game?.framePacerV168?.snapshot?.()||null,governor:game?.performanceV146?.snapshot?.()||null,environment:window.__v1681Environment||null,held:{id:game?.selectedStack?.()?.id||0,pos:game?.firstPersonV7?.rightItem?.position?.toArray?.(),rot:game?.firstPersonV7?.rightItem?.rotation?.toArray?.()?.slice?.(0,3)}}),'Inspect V16.8.1 render/spawn/held-item/performance state.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;
window.__MC_RUNTIME_BUILD_ID__=BUILD;
window.__v1681Ready=true;
window.__voxelDiag?.log?.('V16.8.1 installed: world reveal gate, mobile frustum safety, player-chunk pinning, Prismarine-style 3D item tilt, neutral Java sky and mode/performance semantics.','ok');
})();