/* Minecraft Web V16.10 — vanilla display transforms, render invariants, lighting and mobile pacing. */
(function(){
'use strict';
const BUILD='0.16.10';
const SECTION=16;
const DEG=Math.PI/180;
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};
const mobile=()=>{try{return matchMedia('(pointer:coarse)').matches}catch{return false}};
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const secKey=(cx,sy,cz)=>`${cx},${sy},${cz}`;
const toolName=id=>{try{return String(javaItemNameV145?.(id)||ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}catch{return''}};
const isTool=id=>/(pickaxe|sword|(^|_)axe$|shovel|hoe|stick|bow|arrow|shears)/.test(toolName(id));
function playerGridV1610(g){
  const p=g?.player?.position;if(!p)return null;
  return{cx:floorDiv(Math.floor(p.x),SECTION),cz:floorDiv(Math.floor(p.z),SECTION),sy:floorDiv(Math.floor(p.y+1.0),SECTION)};
}
function pinLocalSectionsV1610(g,radius=1,vertical=2){
  const vis=g?.renderer?.sectionVisibilityV146,q=playerGridV1610(g);if(!vis?.nodes||!q)return 0;
  let pinned=0;
  const visit=n=>{
    if(!n||Math.abs(n.sy-q.sy)>vertical)return;
    if(n.group)n.group.visible=true;
    if(n.mesh){n.mesh.visible=true;n.mesh.frustumCulled=true;vis.visibleKeys?.add?.(n.key);vis.renderVisibleKeys?.add?.(n.key);pinned++}
  };
  if(vis.chunkNodes?.get){
    for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){
      const keys=vis.chunkNodes.get(chunkKey(q.cx+dx,q.cz+dz))||[];for(const key of keys)visit(vis.nodes.get(key));
    }
  }else for(const n of vis.nodes.values())if(Math.abs(n.cx-q.cx)<=radius&&Math.abs(n.cz-q.cz)<=radius)visit(n);
  if(vis.stats)vis.stats.v1610Pinned=pinned;
  return pinned;
}
function exactSectionStateV1610(g,pos=g?.player?.position){
  const vis=g?.renderer?.sectionVisibilityV146;if(!vis?.nodes||!pos)return null;
  const cx=floorDiv(Math.floor(pos.x),16),cz=floorDiv(Math.floor(pos.z),16),sy=floorDiv(Math.floor(pos.y),16);
  const node=vis.nodes.get(secKey(cx,sy,cz));
  return{cx,cz,sy,node,built:!!node,mesh:!!node?.mesh,parentVisible:node?.group?.visible!==false,meshVisible:node?.mesh?.visible!==false};
}
if(typeof VoxelRenderer!=='undefined'&&typeof VoxelRenderer.prototype.updateLOD==='function'){
  const updateLODBaseV1610=VoxelRenderer.prototype.updateLOD;
  VoxelRenderer.prototype.updateLOD=function(...args){
    const r=updateLODBaseV1610.apply(this,args);
    pinLocalSectionsV1610(game,1,2);
    return r;
  };
}
if(typeof SectionVisibilityV146!=='undefined'&&typeof SectionVisibilityV146.prototype.apply==='function'){
  const applyBaseV1610=SectionVisibilityV146.prototype.apply;
  SectionVisibilityV146.prototype.apply=function(...args){
    const r=applyBaseV1610.apply(this,args);
    pinLocalSectionsV1610(game,1,2);
    return this.stats||r;
  };
}
function ensureNeighborhoodV1610(g,r=1){
  const w=g?.world,p=g?.player?.position,rr=g?.renderer;if(!w||!p)return 0;
  const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));let ready=0;
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++)try{
    const c=w.ensureChunk(cp.cx+dx,cp.cz+dz);if(!c)continue;ready++;
    const key=chunkKey(c.cx,c.cz),group=rr?.chunkMeshes?.get?.(key);
    if(!group)rr?.attachChunk?.(c);else group.visible=true;
  }catch{}
  return ready;
}
function floorCandidateV1610(g,x,z){
  const w=g?.world,vis=g?.renderer?.sectionVisibilityV146;if(!w)return null;
  const lava=window.V165_BLOCK?.LAVA??-999;
  let top=(window.WORLD_V165?.height||384)-2;try{const h=w.highestSolidY?.(x,z);if(Number.isFinite(h)&&h>0)top=Math.min(top,h)}catch{}
  for(let y=top;y>=Math.max(1,top-32);y--){
    const id=w.getLoaded?.(x,y,z);
    if(!SOLID_BLOCKS.has(id)||id===BLOCK.WATER||id===lava)continue;
    if(w.getLoaded?.(x,y+1,z)!==BLOCK.AIR||w.getLoaded?.(x,y+2,z)!==BLOCK.AIR)continue;
    const cp=w.worldToChunk(x,z),floorSy=floorDiv(y,16),feetSy=floorDiv(y+1,16),headSy=floorDiv(y+2,16);
    const floorNode=vis?.nodes?.get?.(secKey(cp.cx,floorSy,cp.cz));
    const feetNode=vis?.nodes?.get?.(secKey(cp.cx,feetSy,cp.cz));
    const headNode=vis?.nodes?.get?.(secKey(cp.cx,headSy,cp.cz));
    if(vis?.nodes&&(!floorNode?.mesh||!feetNode||!headNode))continue;
    return{pos:new THREE.Vector3(x+.5,y+1.02,z+.5),cx:cp.cx,cz:cp.cz,floorSy,feetSy,headSy};
  }
  return null;
}
function findRenderedSpawnV1610(g,radius=18){
  const p=g?.player?.position;if(!p)return null;const x0=Math.floor(p.x),z0=Math.floor(p.z);
  for(let r=0;r<=radius;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    if(r&&Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
    const c=floorCandidateV1610(g,x0+dx,z0+dz);if(c)return c;
  }
  return null;
}
function placeSpawnV1610(g,c){
  if(!c?.pos||!g?.player)return false;
  g.player.position.copy(c.pos);g.player.velocity?.set?.(0,0,0);g.player.onGround=false;
  g.player.updateCamera?.(g.renderer?.camera);
  g.playerEntitiesV12?.local?.root?.position?.copy?.(c.pos);
  g.playerEntitiesV12?.local?.lastPos?.copy?.(c.pos);
  g.__lastSafeSpawnV1610=c.pos.clone();
  return true;
}
function renderedFloorReadyV1610(g){
  const p=g?.player?.position,w=g?.world,vis=g?.renderer?.sectionVisibilityV146;if(!p||!w)return false;
  const x=Math.floor(p.x),z=Math.floor(p.z),surface=floorCandidateV1610(g,x,z);if(!surface)return false;
  const node=vis?.nodes?.get?.(secKey(surface.cx,surface.floorSy,surface.cz));
  if(vis?.nodes&&(!node?.mesh||node.group?.visible===false||node.mesh.visible===false))return false;
  return p.y>=surface.pos.y-.18&&p.y<=surface.pos.y+5.5;
}
async function enforceSpawnInvariantV1610(g,fresh){
  if(!g?.world||!g?.player)return;
  const timeout=fresh?12000:6000,deadline=performance.now()+timeout;
  g.__spawnGateV1610={active:true,fresh:!!fresh};
  g.__spawnSafetyV1610Until=performance.now()+(fresh?16000:7000);
  try{g.setLoading?.(true,92,fresh?'Preparing rendered spawn…':'Checking nearby terrain…')}catch{}
  let stable=0,candidate=null;
  while(performance.now()<deadline){
    ensureNeighborhoodV1610(g,1);pinLocalSectionsV1610(g,1,2);
    candidate=findRenderedSpawnV1610(g,18);
    if(candidate){placeSpawnV1610(g,candidate);pinLocalSectionsV1610(g,1,2);stable++}else stable=0;
    try{g.setLoading?.(true,Math.min(99,92+Math.floor(((timeout-(deadline-performance.now()))/timeout)*7)),candidate?'Joining world…':'Building player section…')}catch{}
    if(stable>=4&&renderedFloorReadyV1610(g))break;
    await nextFrame();
  }
  if(!candidate){ensureNeighborhoodV1610(g,2);pinLocalSectionsV1610(g,2,3);candidate=findRenderedSpawnV1610(g,26)}
  if(candidate)placeSpawnV1610(g,candidate);
  pinLocalSectionsV1610(g,1,2);
  await nextFrame();await nextFrame();
  g.__spawnGateV1610=null;
  try{g.setLoading?.(false,100,'Ready')}catch{}
}
function startupSurfaceGuardV1610(g){
  if(!g?.player||performance.now()>Number(g.__spawnSafetyV1610Until||0))return;
  pinLocalSectionsV1610(g,1,2);
  let bad=false;try{
    const p=g.player.position,st=exactSectionStateV1610(g,new THREE.Vector3(p.x,p.y+.9,p.z));
    bad=!Number.isFinite(p.y)||p.y<1||!!g.player.collidesAt?.(p)||!!(st?.node&&st.node.group?.visible===false);
  }catch{bad=true}
  if(!bad)return;
  const c=findRenderedSpawnV1610(g,20);
  if(c)placeSpawnV1610(g,c);else if(g.__lastSafeSpawnV1610){g.player.position.copy(g.__lastSafeSpawnV1610);g.player.velocity?.set?.(0,0,0);g.player.updateCamera?.(g.renderer?.camera)}
}
const JAVA_HANDHELD_DISPLAY_V1610=Object.freeze({
  scale:.68,roll:25*DEG
});
function prepareHeldMeshV1610(root,id,left=false){
  if(!root)return root;const s=left?-1:1;
  if(isTool(id)){
    root.position.set(.385*s,-.435,-.705);
    root.rotation.set(-7*DEG,0,-JAVA_HANDHELD_DISPLAY_V1610.roll*s);
    root.scale.setScalar(1.08);
    root.userData.v1610Display='java-handheld';
    root.traverse?.(o=>{
      if(!o.isMesh||!o.userData?.v1651GeneratedItem)return;
      o.userData.v1651GeneratedItem=false;
      o.userData.v1610DisplayManaged=true;
      o.position.set(-.028*s,.018,0);
      o.rotation.set(0,0,0);
      o.scale.setScalar(1.0);
      o.frustumCulled=false;o.renderOrder=2510;o.layers?.set?.(1);
      const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m)continue;m.depthTest=false;m.depthWrite=false;m.fog=false;m.toneMapped=false;if('alphaTest'in m)m.alphaTest=Math.max(.05,Number(m.alphaTest)||0)}
    });
  }else if(id===ITEM.TORCH){
    root.position.set(.405*s,-.455,-.720);
    root.rotation.set(-9*DEG,18*DEG*s,-12*DEG*s);
    root.scale.setScalar(.46);
    root.userData.v1610Display='java-torch';
    root.traverse?.(o=>{if(!o.isMesh)return;o.frustumCulled=false;o.renderOrder=2510;o.layers?.set?.(1);const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m)continue;m.depthTest=false;m.depthWrite=false;m.fog=false;m.toneMapped=false}});
  }
  return root;
}
if(typeof FirstPersonViewV7!=='undefined'&&typeof FirstPersonViewV7.prototype.makeItem==='function'){
  const makeItemBaseV1610=FirstPersonViewV7.prototype.makeItem;
  FirstPersonViewV7.prototype.makeItem=function(id,left=false){
    const root=makeItemBaseV1610.call(this,id,left);prepareHeldMeshV1610(root,id,left);
    requestAnimationFrame(()=>prepareHeldMeshV1610(root,id,left));
    setTimeout(()=>prepareHeldMeshV1610(root,id,left),80);
    setTimeout(()=>prepareHeldMeshV1610(root,id,left),240);
    return root;
  };
}
const ENV_V1610={
  dayZen:new THREE.Color(0x78a7ff),dayHor:new THREE.Color(0xb7d5ff),
  nightZen:new THREE.Color(0x050814),nightHor:new THREE.Color(0x11182a),
  twilight:new THREE.Color(0xd87955),sun:new THREE.Color(0xffffff),
  ambDay:new THREE.Color(0xe9f0ff),ambNight:new THREE.Color(0x69758d),
  groundDay:new THREE.Color(0x777777),groundNight:new THREE.Color(0x262b35),
  cloudDay:new THREE.Color(0xffffff),cloudNight:new THREE.Color(0x5d6575)
};
function vanillaDayStateV1610(){
  let phase=0;try{phase=((Number(dayClock?.phase?.())||0)%1+1)%1}catch{}
  const ticks=phase*24000,angle=phase*Math.PI*2,alt=Math.sin(angle),dir=new THREE.Vector3(Math.cos(angle),alt,Math.sin(angle)*.18).normalize();
  let sky=15;
  if(ticks>=12000&&ticks<13000)sky=lerp(15,4,smooth((ticks-12000)/1000));
  else if(ticks>=13000&&ticks<23000)sky=4;
  else if(ticks>=23000)sky=lerp(4,15,smooth((ticks-23000)/1000));
  const daylight=clamp01((sky-4)/11),night=1-daylight;
  let twilight=0;
  if(ticks>=12000&&ticks<=13000)twilight=1-Math.abs(ticks-12500)/500;
  else if(ticks>=23000)twilight=(ticks-23000)/1000;
  else if(ticks<=1000)twilight=1-ticks/1000;
  twilight=clamp01(twilight)*(1-smooth(clamp01(Math.abs(alt)/.22)));
  return{phase,ticks,sky,daylight,night,twilight,alt,dir};
}
function applyVanillaEnvironmentV1610(rr,s){
  if(!rr?.scene||!rr?.camera)return;
  const zen=ENV_V1610.nightZen.clone().lerp(ENV_V1610.dayZen,s.daylight);
  const hor=ENV_V1610.nightHor.clone().lerp(ENV_V1610.dayHor,s.daylight);
  if(s.twilight>.001)hor.lerp(ENV_V1610.twilight,.18*s.twilight);
  if(rr.javaSkyV159?.mesh){
    const u=rr.javaSkyV159.mesh.material?.uniforms;rr.javaSkyV159.mesh.position.copy(rr.camera.position);rr.javaSkyV159.mesh.visible=true;
    u?.uZenith?.value?.copy?.(zen);u?.uHorizon?.value?.copy?.(hor);if(u?.uStars)u.uStars.value=smooth(clamp01((s.night-.18)/.72));if(u?.uWarm)u.uWarm.value=s.twilight*.018;
  }else if(rr.scene.background?.isColor)rr.scene.background.copy(hor);
  if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(hor)}
  if(rr.dayStateV6){rr.dayStateV6.daylight=s.sky/15;rr.dayStateV6.internalSkyLight=s.sky;rr.dayStateV6.isNight=s.sky<=6}
  if(rr.ambient){rr.ambient.intensity=lerp(.28,.92,s.daylight);rr.ambient.color.copy(ENV_V1610.ambNight).lerp(ENV_V1610.ambDay,s.daylight);rr.ambient.groundColor.copy(ENV_V1610.groundNight).lerp(ENV_V1610.groundDay,s.daylight)}
  if(rr.fillAmbient)rr.fillAmbient.intensity=lerp(.035,.105,s.daylight);
  if(rr.sun){rr.sun.position.copy(rr.camera.position).addScaledVector(s.dir,160);if(rr.sun.target){rr.sun.target.position.copy(rr.camera.position);if(!rr.sun.target.parent)rr.scene.add(rr.sun.target)}rr.sun.color.copy(ENV_V1610.sun);rr.sun.intensity=s.alt>-.10?lerp(.08,.62,s.daylight)*smooth(clamp01((s.alt+.10)/.22)):0;rr.sun.castShadow=false}
  if(rr.moon){rr.moon.intensity=.04+.10*s.night;rr.moon.color?.set?.(0xb8c9e8)}
  const sun=rr.squareSunV161;if(sun?.mesh){const d=Math.min(520,Math.max(120,Number(rr.camera.far||700)*.72));sun.mesh.position.copy(rr.camera.position).addScaledVector(s.dir,d);sun.mesh.quaternion.copy(rr.camera.quaternion);sun.mesh.visible=s.alt>-.09&&!document.hidden&&!game?.__hardQuitV159;sun.mesh.frustumCulled=false;if(sun.material?.uniforms){const u=sun.material.uniforms;if(u.uCore)u.uCore.value.set(0xffffff);if(u.uEdge)u.uEdge.value.set(0xffffee);if(u.uOpacity)u.uOpacity.value=smooth(clamp01((s.alt+.09)/.14))}}
  const cloud=game?.cloudsV13?.mesh;if(cloud?.material){cloud.material.color.copy(ENV_V1610.cloudNight).lerp(ENV_V1610.cloudDay,s.daylight);cloud.material.opacity=1;cloud.material.depthTest=true;cloud.material.depthWrite=false;cloud.material.toneMapped=false}
  if(rr.renderer){rr.renderer.toneMapping=THREE.NoToneMapping;rr.renderer.toneMappingExposure=1;rr.renderer.outputColorSpace=THREE.SRGBColorSpace}
  window.__v1610Environment={ticks:Number(s.ticks.toFixed(1)),skyLight:Number(s.sky.toFixed(2)),daylight:Number(s.daylight.toFixed(3)),twilight:Number(s.twilight.toFixed(3))};
}
if(typeof VoxelRenderer!=='undefined'&&typeof VoxelRenderer.prototype.render==='function'){
  const renderBaseV1610=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(...args){
    const web=this.renderer,raw=web?.render;if(typeof raw!=='function')return renderBaseV1610.apply(this,args);
    web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera)applyVanillaEnvironmentV1610(this,vanillaDayStateV1610());return raw.call(web,scene,camera)};
    try{return renderBaseV1610.apply(this,args)}finally{web.render=raw}
  };
}
function tuneMobileGovernorV1610(g){
  const gov=g?.performanceV146;if(!gov)return;
  if(mobile()){
    gov.minDpr=.78;gov.maxDpr=Math.min(1.35,window.devicePixelRatio||1.35);gov.interval=.80;
    if(gov.dpr>gov.maxDpr)gov.applyDpr?.(gov.maxDpr);
    gov.baseView=Math.min(gov.baseView||g.world?.viewDistance||6,6);
    gov.minView=Math.min(3,gov.baseView);
    if(g.world&&g.world.viewDistance>gov.baseView)g.world.viewDistance=gov.baseView;
  }
}
class StablePacerV1610{
  constructor(g){this.g=g;this.ema=16.7;this.worst=16.7;this.frames=0;this.spikes=0}
  observe(ms){this.frames++;this.ema=this.ema*.92+ms*.08;this.worst=Math.max(ms,this.worst*.985);if(ms>28)this.spikes++}
  snapshot(){return{emaMs:Number(this.ema.toFixed(2)),worstMs:Number(this.worst.toFixed(2)),approxFps:Number((1000/Math.max(1,this.ema)).toFixed(1)),spikes:this.spikes,dpr:this.g?.performanceV146?.dpr,viewDistance:this.g?.world?.viewDistance}}
}
if(typeof PerformanceGovernorV146!=='undefined'){
  PerformanceGovernorV146.prototype.sample=function(){
    const fps=Number(this.game.stats?.fps)||60,current=this.game.renderer?.renderer?.getPixelRatio?.()||this.dpr,pacer=this.game.stablePacerV1610;
    if(current>this.maxDpr+.02)this.applyDpr(this.maxDpr);
    this.ema=this.ema*.82+fps*.18;const worst=Number(pacer?.worst||16.7);
    if(this.ema<48||worst>34){this.low++;this.high=0}else if(this.ema>57&&worst<23){this.high++;this.low=Math.max(0,this.low-1)}else{this.low=Math.max(0,this.low-1);this.high=Math.max(0,this.high-1)}
    if(this.low>=2){const severe=this.ema<40||worst>42;this.applyDpr(this.dpr-(severe?.15:.10));this.particleScale=severe?.45:.62;this.game.world.v146BuildBudget=1;this.game.world.v146LoadBudget=1;if(severe&&this.game.world.viewDistance>this.minView)this.game.world.viewDistance--;this.mode=severe?'protect':'performance';this.low=0}
    if(this.high>=10){this.applyDpr(this.dpr+.05);this.particleScale=Math.min(1,this.particleScale+.08);if(this.game.world.viewDistance<this.baseView&&this.ema>58)this.game.world.viewDistance++;this.game.world.v146BuildBudget=this.mobile?1:2;this.game.world.v146LoadBudget=1;this.mode='quality';this.high=0}
    if(pacer)pacer.worst=Math.max(pacer.ema,pacer.worst*.78);this.trimMemory();
  };
}
if(typeof WorldWorkerPoolV165!=='undefined'&&typeof WorldWorkerPoolV165.prototype.prefetchAround==='function'){
  const prefetchBaseV1610=WorldWorkerPoolV165.prototype.prefetchAround;
  WorldWorkerPoolV165.prototype.prefetchAround=function(player){
    if(mobile()){
      const now=performance.now();if(now-(this.__v1610PrefetchAt||0)<180)return;this.__v1610PrefetchAt=now;
      if(game?.stablePacerV1610?.worst>34&&this.pending?.size)return;
    }
    return prefetchBaseV1610.call(this,player);
  };
}
function normalizeRulesV1610(g){
  let s=null;try{s=typeof v15WorldState==='function'?v15WorldState():null}catch{}
  const rawMode=String(s?.mode||g?.worldModeV168||g?.mode||'Survival').toLowerCase();
  const rawDiff=String(s?.difficulty||g?.difficultyV168||'Normal').toLowerCase();
  g.worldModeV168=rawMode==='hardcore'?'Hardcore':rawMode==='creative'?'Creative':'Survival';
  g.hardcoreV168=g.worldModeV168==='Hardcore';g.creativeV168=g.worldModeV168==='Creative';
  g.difficultyV168=g.hardcoreV168?'Hard':rawDiff==='peaceful'?'Peaceful':rawDiff==='easy'?'Easy':rawDiff==='hard'?'Hard':'Normal';
  g.mode=g.creativeV168?'creative':'survival';
  if(g.player){
    if(g.creativeV168){g.player.health=20;g.player.hunger=20;g.player.flying=true}
    if(g.hardcoreV168)g.player.flying=false;
    if(g.difficultyV168==='Peaceful')g.player.hunger=20
  }
  try{renderSurvivalBarsV6?.(g.player,g.mode)}catch{}
}
if(typeof Game!=='undefined'){
  const bootBaseV1610=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const fresh=!!args[1],r=await bootBaseV1610.apply(this,args);
    normalizeRulesV1610(this);tuneMobileGovernorV1610(this);this.stablePacerV1610=new StablePacerV1610(this);
    await enforceSpawnInvariantV1610(this,fresh);
    this.firstPersonV7?.refresh?.();
    window.__voxelDiag?.log?.(`V16.10 READY: rendered-floor spawn invariant, pinned camera sections, Java-style front-facing held items, neutral vanilla daylight and stable mobile pacing active.`,'ok');
    return r;
  };
  const updateBaseV1610=Game.prototype.update;
  Game.prototype.update=function(dt){
    const start=performance.now(),r=updateBaseV1610.call(this,dt);
    if(((this.__v1610RuleTick=(this.__v1610RuleTick||0)+1)%30)===0)normalizeRulesV1610(this);
    startupSurfaceGuardV1610(this);pinLocalSectionsV1610(this,1,2);
    const id=this.selectedStack?.()?.id||0,root=this.firstPersonV7?.rightItem;
    if(root&&(isTool(id)||id===ITEM.TORCH)&&root.userData?.v1610Display==null)prepareHeldMeshV1610(root,id,false);
    this.stablePacerV1610?.observe?.(performance.now()-start,dt);
    return r;
  };
}
try{
  runtimeCommands.register('v1610',()=>({
    build:BUILD,
    player:game?.player?.position?.toArray?.(),
    section:exactSectionStateV1610(game,new THREE.Vector3(game?.player?.position?.x||0,(game?.player?.position?.y||0)+1,game?.player?.position?.z||0)),
    pinned:game?.renderer?.sectionVisibilityV146?.stats?.v1610Pinned||0,
    mode:game?.worldModeV168,difficulty:game?.difficultyV168,
    held:{id:game?.selectedStack?.()?.id||0,display:game?.firstPersonV7?.rightItem?.userData?.v1610Display||null,pos:game?.firstPersonV7?.rightItem?.position?.toArray?.(),rot:game?.firstPersonV7?.rightItem?.rotation?.toArray?.()?.slice?.(0,3)},
    environment:window.__v1610Environment||null,
    pacing:game?.stablePacerV1610?.snapshot?.()||null
  }),'Inspect V16.10 spawn/render/held-item/environment/frame-pacing state.');
}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;
window.__MC_RUNTIME_BUILD_ID__=BUILD;
window.__v1610Ready=true;
window.__voxelDiag?.log?.('V16.10 installed: local render invariant + rendered spawn + Java hand display + vanilla lighting + stable mobile frame pacing.','ok');
})();
