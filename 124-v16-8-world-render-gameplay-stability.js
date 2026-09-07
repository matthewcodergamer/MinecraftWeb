/* Minecraft Web V16.8 — world visibility, vanilla environment, held-item rig,
 * difficulty semantics and frame-spike stabilization.
 */
(function(){
'use strict';
const BUILD='0.16.8';
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};
const coarse=()=>{try{return matchMedia('(pointer:coarse)').matches}catch{return false}};
const HOSTILE_V168=new Set(['zombie','creeper','skeleton','spider','cave_spider','enderman','drowned','husk','stray','witch','slime','phantom','pillager','vindicator','evoker','ravager','silverfish','endermite','blaze','ghast','magma_cube','wither_skeleton','hoglin','zoglin','piglin_brute']);

function worldSetupV168(){
  try{if(typeof v15WorldState==='function')return v15WorldState()}catch{}
  return{name:'New World',mode:game?.mode==='creative'?'Creative':'Survival',difficulty:'Normal'};
}
function rulesV168(){try{return typeof v15Rules==='function'?v15Rules():{}}catch{return{}}}
function normalizedModeV168(v){const s=String(v||'Survival').toLowerCase();return s==='hardcore'?'Hardcore':s==='creative'?'Creative':'Survival'}
function normalizedDifficultyV168(v,mode){if(mode==='Hardcore')return'Hard';const s=String(v||'Normal').toLowerCase();return s==='peaceful'?'Peaceful':s==='easy'?'Easy':s==='hard'?'Hard':'Normal'}
function applyWorldSetupV168(g){
  if(!g?.player)return;
  const s=worldSetupV168(),mode=normalizedModeV168(s.mode),difficulty=normalizedDifficultyV168(s.difficulty,mode);
  g.worldModeV168=mode;g.difficultyV168=difficulty;g.hardcoreV168=mode==='Hardcore';g.creativeV168=mode==='Creative';
  g.player.flying=g.creativeV168?true:!!g.player.flying;
  if(g.creativeV168){g.player.health=20;g.player.hunger=20;if(g.foodV11)g.foodV11.saturation=Math.max(5,g.foodV11.saturation||0)}
  renderSurvivalBarsV6?.(g.player,g.mode);
}

/* -------------------------------------------------------------------------- */
/* STARTUP SURFACE GUARANTEE                                                   */
/* -------------------------------------------------------------------------- */
function ensureNeighborhoodV168(g,r=1,attach=false){
  const w=g?.world,p=g?.player?.position;if(!w||!p)return 0;const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));let n=0;
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){try{const c=w.ensureChunk(cp.cx+dx,cp.cz+dz);if(c){n++;if(attach&&g.renderer&&!g.renderer.chunkMeshes?.has?.(chunkKey(c.cx,c.cz)))g.renderer.attachChunk?.(c)}}catch{}}
  return n;
}
function candidateSurfaceV168(w,x,z){
  try{
    const cp=w.worldToChunk(x,z);w.ensureChunk(cp.cx,cp.cz);const y=w.highestSolidY(x,z),floor=w.getLoaded(x,y,z),a=w.getLoaded(x,y+1,z),b=w.getLoaded(x,y+2,z);
    const lava=window.V165_BLOCK?.LAVA??-999,water=BLOCK.WATER,leaf=BLOCK.OAK_LEAVES;
    if(y<1||y>380||!SOLID_BLOCKS.has(floor)||floor===water||floor===lava||a!==BLOCK.AIR||b!==BLOCK.AIR)return null;
    return{x,z,y,floor,preferred:floor!==leaf};
  }catch{return null}
}
function findSafeSurfaceV168(g,radius=10){
  const w=g?.world,p=g?.player?.position;if(!w||!p)return null;const x0=Math.floor(p.x),z0=Math.floor(p.z),out=[];
  for(let r=0;r<=radius;r++){
    if(r===0){const c=candidateSurfaceV168(w,x0,z0);if(c)out.push(c)}
    else for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const c=candidateSurfaceV168(w,x0+dx,z0+dz);if(c)out.push(c);
    }
    const best=out.find(c=>c.preferred)||out[0];if(best&&r>=2)return new THREE.Vector3(best.x+.5,best.y+1.02,best.z+.5);
  }
  try{return w.findSpawn?.()||null}catch{return null}
}
function startupUnsafeV168(g){
  const p=g?.player,w=g?.world;if(!p?.position||!w)return true;const x=Math.floor(p.position.x),z=Math.floor(p.position.z),feet=Math.floor(p.position.y+.04),head=Math.floor(p.position.y+1.55);
  try{
    if(!Number.isFinite(p.position.y)||p.position.y<.1||p.position.y>382||p.collidesAt?.(p.position))return true;
    if(SOLID_BLOCKS.has(w.getLoaded(x,feet,z))||SOLID_BLOCKS.has(w.getLoaded(x,head,z)))return true;
    const top=w.highestSolidY(x,z);if(!Number.isFinite(top))return true;
    if(p.position.y<top+.90||p.position.y>top+7.0)return true;
    const below=w.getLoaded(x,Math.floor(p.position.y-.12),z);if(!SOLID_BLOCKS.has(below)&&Math.abs(p.position.y-(top+1.02))>1.7)return true;
  }catch{return true}
  return false;
}
function relocateStartupV168(g,force=false){
  if(!g?.player?.position||!g?.world)return false;ensureNeighborhoodV168(g,1);if(!force&&!startupUnsafeV168(g))return false;
  const s=findSafeSurfaceV168(g,12);if(!s)return false;g.player.position.copy(s);g.player.velocity?.set?.(0,0,0);g.player.onGround=false;ensureNeighborhoodV168(g,1,true);g.player.updateCamera?.(g.renderer?.camera);
  g.playerEntitiesV12?.local?.root?.position?.copy?.(s);g.playerEntitiesV12?.local?.lastPos?.copy?.(s);
  g.__spawnFixedV168=(g.__spawnFixedV168||0)+1;return true;
}
function scheduleSpawnWarmupV168(g,fresh){
  const now=performance.now();g.__spawnWarmupV168Until=now+(fresh?6500:2600);if(fresh)relocateStartupV168(g,true);
  for(const ms of fresh?[90,260,650,1250,2400,4200,6200]:[120,600,1700])setTimeout(()=>{if(g?.running)relocateStartupV168(g,false)},ms);
}

/* -------------------------------------------------------------------------- */
/* OCCLUSION FAIL-SAFE — portal culling may never blank the loaded world.     */
/* -------------------------------------------------------------------------- */
function frustumOnlyV168(vis,reason='fallback'){
  if(!vis?.nodes||!vis.updateFrustum?.())return vis?.stats;const start=performance.now();vis.visibleKeys.clear();vis.renderVisibleKeys.clear();let meshed=0,rendered=0,rejected=0;
  for(const n of vis.nodes.values()){
    if(!n.mesh)continue;meshed++;const show=n.group?.visible!==false&&vis.frustum.intersectsBox(n.box);n.mesh.visible=show;if(show){vis.visibleKeys.add(n.key);vis.renderVisibleKeys.add(n.key);rendered++}else rejected++;
  }
  vis.stats={sections:vis.nodes.size,meshedSections:meshed,visited:rendered,rendered,frustumRejected:rejected,portalRejected:0,lastMs:performance.now()-start,fallback:true,reason};
  return vis.stats;
}
if(typeof SectionVisibilityV146!=='undefined'){
  const applyBaseV168=SectionVisibilityV146.prototype.apply;
  SectionVisibilityV146.prototype.apply=function(){
    const warm=performance.now()<(game?.__spawnWarmupV168Until||0);if(warm)return frustumOnlyV168(this,'spawn-warmup');
    const stats=applyBaseV168.call(this),cam=this.rr?.camera;let unsafe=false,reason='portal-safety';
    try{const id=game?.world?.getLoaded?.(Math.floor(cam.position.x),Math.floor(cam.position.y),Math.floor(cam.position.z));unsafe=OPAQUE_BLOCKS.has(id)}catch{}
    const meshed=Number(stats?.meshedSections||0),rendered=Number(stats?.rendered||0);
    if(!unsafe&&meshed>=8&&rendered===0){unsafe=true;reason='zero-visible-sections'}
    if(!unsafe&&meshed>=18&&rendered<=1){unsafe=true;reason='implausibly-low-visible-set'}
    if(unsafe)return frustumOnlyV168(this,reason);return stats;
  };
}

/* -------------------------------------------------------------------------- */
/* FIRST-PERSON HELD RIG — front-facing item intersects the visible hand.      */
/* -------------------------------------------------------------------------- */
function itemStemV168(id){try{return String(javaItemNameV145?.(id)||ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}catch{return''}}
function isGeneratedToolV168(id){const n=itemStemV168(id);return /pickaxe|sword|(^|_)axe$|shovel|hoe|stick|bow|arrow|shears/.test(n)}
if(typeof FirstPersonViewV7!=='undefined'){
  const armBaseV168=FirstPersonViewV7.prototype.arm;
  FirstPersonViewV7.prototype.arm=function(x){const m=armBaseV168.call(this,x);if(!m)return m;m.position.set(x>0?.43:-.43,-.49,-.72);m.rotation.set(-.34,0,x>0?-.12:.12);m.scale.set(1,1,1);return m};
  const makeBaseV168=FirstPersonViewV7.prototype.makeItem;
  FirstPersonViewV7.prototype.makeItem=function(id,left=false){
    const root=makeBaseV168.call(this,id,left);if(!root)return root;const s=left?-1:1,block=this.game?.itemToBlock?.(id)??BLOCK.AIR;
    if(id===ITEM.TORCH){root.position.set(.31*s,-.34,-.59);root.rotation.set(-.08,0,-.10*s);root.scale.setScalar(.58);root.userData.v168Held='torch-front'}
    else if(isGeneratedToolV168(id)){root.position.set(.31*s,-.335,-.595);root.rotation.set(-.035,0,-.08*s);root.scale.setScalar(1.08);root.userData.v168Held='tool-front'}
    else if(block!==BLOCK.AIR){root.position.set(.35*s,-.40,-.69);root.rotation.set(-.30,-.48*s,.11*s);root.scale.setScalar(.43);root.userData.v168Held='block-hand'}
    return root;
  };
  const refreshBaseV168=FirstPersonViewV7.prototype.refresh;
  if(typeof refreshBaseV168==='function')FirstPersonViewV7.prototype.refresh=function(...args){const r=refreshBaseV168.apply(this,args);if(this.rightArm)this.rightArm.visible=true;return r};
}

/* -------------------------------------------------------------------------- */
/* JAVA-LIKE CLOUDS + SKY/LIGHT: one final state immediately before draw.      */
/* -------------------------------------------------------------------------- */
if(typeof MinecraftCloudLayerV13!=='undefined'&&typeof MinecraftCloudLayerV13.prototype._java261Rebuild==='function'){
  const cloudRebuildBaseV168=MinecraftCloudLayerV13.prototype._java261Rebuild;
  MinecraftCloudLayerV13.prototype._java261Rebuild=function(...args){
    const r=cloudRebuildBaseV168.apply(this,args),g=this.mesh?.geometry;if(g&&!g.userData?.v168LocalCloud){g.translate(0,-192,0);g.computeBoundingBox?.();g.computeBoundingSphere?.();g.userData.v168LocalCloud=true}return r;
  };
}
function envStateV168(){
  const phase=((Number(dayClock?.phase?.())||0)%1+1)%1,ticks=phase*24000,a=phase*Math.PI*2,alt=Math.sin(a),dir=new THREE.Vector3(Math.cos(a),alt,Math.sin(a)*.18).normalize();
  const daylight=smooth(clamp01((alt+.10)/.34)),night=1-daylight;
  const horizon=1-smooth(clamp01(Math.abs(alt)/.18));
  const sunrise=ticks<900?1-ticks/900:ticks>23100?(ticks-23100)/900:0;
  const sunset=ticks>11100&&ticks<12900?1-Math.abs(ticks-12000)/900:0;
  const twilight=clamp01(Math.max(sunrise,sunset)*horizon);
  return{phase,ticks,altitude:alt,dir,daylight,night,twilight,skyLight:4+11*daylight};
}
function paletteV168(s){
  const dayZen=new THREE.Color(0x78a7ff),dayHor=new THREE.Color(0xaecfff),nightZen=new THREE.Color(0x030711),nightHor=new THREE.Color(0x10172a),dawn=new THREE.Color(0xe6a078);
  const zen=nightZen.clone().lerp(dayZen,s.daylight),hor=nightHor.clone().lerp(dayHor,s.daylight);if(s.twilight>.001)hor.lerp(dawn,.42*s.twilight);return{zen,hor};
}
function restoreFancyCloudsV168(){
  const layer=game?.cloudsV13,mesh=layer?.mesh;if(!layer||!mesh||!game?.player)return false;
  if(!mesh.userData.v168FancyRestored&&typeof layer._java261Rebuild==='function'){
    try{const S=12,p=game.player.position,cx=Math.floor(p.x/S),cz=Math.floor(p.z/S),drift=Math.floor((layer.clock||0)/S);layer._java261Rebuild(cx,cz,drift);mesh.userData.v168FancyRestored=true}catch{}
  }
  const y=window.fromJavaYV165?.(192)??256;mesh.position.y=y;mesh.frustumCulled=true;mesh.castShadow=false;mesh.receiveShadow=false;
  let mode='Fancy';try{mode=v15Prefs?.().clouds||mode}catch{}mesh.visible=String(mode).toLowerCase()!=='off'&&game.running&&!document.hidden&&!game.__hardQuitV159;
  const old=mesh.material;if(old&&!mesh.userData.v168CloudMaterial){const m=new THREE.MeshBasicMaterial({map:old.map||null,color:0xffffff,vertexColors:!!mesh.geometry?.getAttribute?.('color'),transparent:false,opacity:1,alphaTest:.01,depthTest:true,depthWrite:false,side:THREE.FrontSide,fog:true,toneMapped:false});mesh.material=m;mesh.userData.v168CloudMaterial=true}
  return mesh.visible;
}
function applyEnvironmentV168(rr,s){
  if(!rr?.scene||!rr?.camera)return;const p=paletteV168(s),weather=clamp01(game?.weather?.intensity||game?.weatherIntensity||0);
  if(rr.javaSkyV159?.mesh){const u=rr.javaSkyV159.mesh.material?.uniforms;rr.javaSkyV159.mesh.visible=true;rr.javaSkyV159.mesh.position.copy(rr.camera.position);u?.uZenith?.value?.copy?.(p.zen);u?.uHorizon?.value?.copy?.(p.hor);if(u?.uStars)u.uStars.value=smooth(clamp01((s.night-.20)/.75));if(u?.uWarm)u.uWarm.value=s.twilight*.10}else if(rr.scene.background?.isColor)rr.scene.background.copy(p.hor);
  if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(p.hor);}
  if(rr.dayStateV6){rr.dayStateV6.daylight=s.skyLight/15;rr.dayStateV6.isNight=s.daylight<.18;rr.dayStateV6.internalSkyLight=s.skyLight}
  if(rr.ambient){rr.ambient.intensity=lerp(.28,1.08,s.daylight)*(1-weather*.10);rr.ambient.color.copy(new THREE.Color(0x7185aa).lerp(new THREE.Color(0xd7eaff),s.daylight));rr.ambient.groundColor.copy(new THREE.Color(0x252b39).lerp(new THREE.Color(0x777062),s.daylight))}
  if(rr.fillAmbient)rr.fillAmbient.intensity=.04+.10*s.daylight;
  if(rr.sun){rr.sun.position.copy(rr.camera.position).addScaledVector(s.dir,120);if(rr.sun.target){rr.sun.target.position.copy(rr.camera.position);if(!rr.sun.target.parent)rr.scene.add(rr.sun.target)}rr.sun.intensity=(.04+.60*s.daylight)*smooth(clamp01((s.altitude+.08)/.38))*(1-weather*.18);rr.sun.color.copy(new THREE.Color(0xfff7e7).lerp(new THREE.Color(0xffc28c),s.twilight*.34));rr.sun.castShadow=false}
  if(rr.moon){rr.moon.intensity=.05+.11*s.night;rr.moon.color?.set?.(0x9eb3d8)}
  const proc=rr.squareSunV161;if(proc?.mesh){const d=Math.min(500,Math.max(90,Number(rr.camera.far||700)*.70));proc.mesh.position.copy(rr.camera.position).addScaledVector(s.dir,d);proc.mesh.quaternion.copy(rr.camera.quaternion);proc.mesh.visible=s.altitude>-.075&&!document.hidden&&!game?.__hardQuitV159;proc.mesh.frustumCulled=false;if(proc.material){proc.material.depthTest=true;proc.material.depthWrite=false;const u=proc.material.uniforms;if(u?.uCore)u.uCore.value.set(0xfff8e7).lerp(new THREE.Color(0xffd2a2),s.twilight*.25);if(u?.uEdge)u.uEdge.value.set(0xffedb0).lerp(new THREE.Color(0xffbe7b),s.twilight*.30);if(u?.uOpacity)u.uOpacity.value=smooth(clamp01((s.altitude+.075)/.12))}}
  restoreFancyCloudsV168();const cloud=game?.cloudsV13?.mesh;if(cloud?.material){cloud.material.color.copy(new THREE.Color(0x687287).lerp(new THREE.Color(0xffffff),s.daylight));if(s.twilight>.001)cloud.material.color.lerp(new THREE.Color(0xf0d4c1),s.twilight*.08);cloud.material.opacity=1;cloud.material.depthTest=true;cloud.material.depthWrite=false;cloud.material.toneMapped=false}
  if(cloud?.material){cloud.material.transparent=false;cloud.material.alphaTest=0;cloud.material.side=THREE.FrontSide}
  if(rr.renderer){rr.renderer.toneMapping=THREE.NoToneMapping;rr.renderer.toneMappingExposure=1;rr.renderer.outputColorSpace=THREE.SRGBColorSpace}
  window.__v168Environment={ticks:Number(s.ticks.toFixed(1)),daylight:Number(s.daylight.toFixed(3)),skyLight:Number(s.skyLight.toFixed(2)),twilight:Number(s.twilight.toFixed(3)),clouds:!!cloud?.visible};
}
if(typeof VoxelRenderer!=='undefined'){
  const renderBaseV168=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(...args){
    const web=this.renderer,raw=web?.render;if(typeof raw!=='function')return renderBaseV168.apply(this,args);
    web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera)applyEnvironmentV168(this,envStateV168());return raw.call(web,scene,camera)};
    try{return renderBaseV168.apply(this,args)}finally{web.render=raw}
  };
}

try{const dayUpdateBaseV168=dayClock.update.bind(dayClock);dayClock.update=function(dt){if(game?.running&&rulesV168().doDaylightCycle===false)return;return dayUpdateBaseV168(dt)}}catch{}

/* -------------------------------------------------------------------------- */
/* GAME MODE / DIFFICULTY SEMANTICS                                            */
/* -------------------------------------------------------------------------- */
function installDifficultyHealthV168(g){
  const p=g?.player;if(!p||p.__difficultyHealthV168)return;const d=Object.getOwnPropertyDescriptor(p,'health');if(!d?.get||!d?.set)return;p.__difficultyHealthV168=true;
  Object.defineProperty(p,'health',{configurable:true,get(){return d.get.call(p)},set(v){const old=d.get.call(p),next=Number(v);if(!Number.isFinite(next))return;if(next<old){if(g.creativeV168||g.difficultyV168==='Peaceful')return;const mult=g.difficultyV168==='Easy'?.65:g.difficultyV168==='Hard'?1.5:1;return d.set.call(p,old-(old-next)*mult)}return d.set.call(p,next)}});
}
if(typeof MobSystem!=='undefined'){
  const spawnEntityBaseV168=MobSystem.prototype.spawnEntity;
  MobSystem.prototype.spawnEntity=function(type,position){if((game?.difficultyV168==='Peaceful'||rulesV168().doMobSpawning===false)&&HOSTILE_V168.has(String(type)))return Promise.resolve(null);return spawnEntityBaseV168.call(this,type,position)};
  const spawnAroundBaseV168=MobSystem.prototype.spawnAround;
  MobSystem.prototype.spawnAround=function(player){if(rulesV168().doMobSpawning===false)return;if(game?.difficultyV168==='Peaceful'){
    if(this.mobs.length+(this.pendingSpawns||0)>=ENGINE.MAX_MOBS)return;const a=Math.random()*Math.PI*2,r=20+Math.random()*22,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(this.world.get(x,y,z)!==BLOCK.AIR)return;const types=['cow','chicken','pig'];return this.spawnEntity(types[(Math.random()*types.length)|0],new THREE.Vector3(x+.5,y,z+.5));
  }return spawnAroundBaseV168.call(this,player)};
}
if(typeof FoodSystemV11!=='undefined'){
  const foodUpdateBaseV168=FoodSystemV11.prototype.update;
  FoodSystemV11.prototype.update=function(dt){
    const g=this.game,p=g?.player;if(!p)return;
    if(g.difficultyV168==='Peaceful'){p.hunger=20;this.saturation=Math.max(5,this.saturation||0);this.regenClock=(this.regenClock||0)+dt;if(rulesV168().naturalRegeneration!==false&&p.health<20&&this.regenClock>=1){this.regenClock=0;p.health=Math.min(20,p.health+1)}return}
    const before=p.health,r=foodUpdateBaseV168.call(this,dt);if(p.hunger<=0&&p.health<before){const floor=g.difficultyV168==='Easy'?10:g.difficultyV168==='Normal'?1:0;if(p.health<floor)p.health=floor}return r;
  };
}
const hudBaseV168=typeof renderSurvivalBarsV6==='function'?renderSurvivalBarsV6:null;
if(hudBaseV168)renderSurvivalBarsV6=function(player,mode){
  hudBaseV168(player,mode==='creative'?'survival':mode);survivalBars.style.display='flex';if(!player)return;
  const hardcore=!!game?.hardcoreV168,heartBar=document.getElementById('heartBar');if(hardcore&&heartBar&&typeof javaAssetsV144!=='undefined'){
    const hp=Math.max(0,Math.min(20,Math.round(Number(player.health)||0)));let html='';for(let i=0;i<10;i++){const v=hp-i*2,name=v>=2?'heart/hardcore_full':v===1?'heart/hardcore_half':'heart/container_hardcore';html+=`<img class="javaHudSpriteV144" src="${javaAssetsV144.hud(name)}" alt="">`}heartBar.innerHTML=html;
  }
};
function ensureHardcoreDeathV168(){let d=document.getElementById('v168HardcoreDeath');if(d)return d;d=document.createElement('div');d.id='v168HardcoreDeath';d.innerHTML='<div><h1>Game Over!</h1><p>Hardcore worlds do not allow respawning.</p><button id="v168HardcoreTitle">Title Screen</button></div>';const st=document.createElement('style');st.textContent='#v168HardcoreDeath{position:fixed;inset:0;z-index:9900;display:none;align-items:center;justify-content:center;background:linear-gradient(rgba(90,0,0,.55),rgba(0,0,0,.82));color:#fff;text-align:center;font-family:"Minecraft Seven",monospace;text-shadow:2px 2px #222}#v168HardcoreDeath.show{display:flex}#v168HardcoreDeath h1{font-size:36px;margin:0 0 18px}#v168HardcoreDeath p{font-size:16px}#v168HardcoreDeath button{min-width:260px;height:46px;background:#777;border:2px solid #111;box-shadow:inset 2px 2px #aaa,inset -2px -2px #333;color:#fff;font:16px "Minecraft Seven",monospace;text-shadow:2px 2px #222}';document.head.appendChild(st);document.body.appendChild(d);d.querySelector('#v168HardcoreTitle').onclick=()=>{d.classList.remove('show');try{game.running=false}catch{}const t=document.getElementById('titleScreen');if(t){t.style.display='';t.classList.add('show')}try{v15BuildTitle?.()}catch{}};return d}
if(typeof Game!=='undefined'){
  const respawnBaseV168=Game.prototype.respawn;
  Game.prototype.respawn=function(){if(this.hardcoreV168){this.running=false;ensureHardcoreDeathV168().classList.add('show');try{document.exitPointerLock?.()}catch{}return}return respawnBaseV168.call(this)};
}
document.addEventListener('click',e=>{const id=e.target?.id;if(id==='v15Difficulty'&&normalizedModeV168(worldSetupV168().mode)==='Hardcore'){e.preventDefault();e.stopImmediatePropagation();e.target.textContent='Difficulty: Hard';return}if(id==='v15WorldMode')queueMicrotask(()=>{const s=worldSetupV168(),b=document.getElementById('v15Difficulty');if(b&&normalizedModeV168(s.mode)==='Hardcore')b.textContent='Difficulty: Hard'})},true);

/* -------------------------------------------------------------------------- */
/* FRAME PACER                                                                 */
/* -------------------------------------------------------------------------- */
class FramePacerV168{
  constructor(g){this.game=g;this.ema=16.7;this.last=16.7;this.spikes=0;this.stable=0;this.deferLoads=false;this.frame=0}
  observe(ms){this.frame++;this.last=ms;this.ema=this.ema*.88+ms*.12;if(ms>24||this.ema>21){this.spikes++;this.stable=0;this.deferLoads=true}else{this.stable++;if(this.stable>8)this.deferLoads=false}}
  nearReady(){const w=this.game?.world,p=this.game?.player?.position;if(!w||!p)return false;const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(!w.getChunk(cp.cx+dx,cp.cz+dz))return false;return true}
  snapshot(){return{lastMs:Number(this.last.toFixed(2)),emaMs:Number(this.ema.toFixed(2)),spikes:this.spikes,deferLoads:this.deferLoads,viewDistance:this.game?.world?.viewDistance,dpr:this.game?.renderer?.renderer?.getPixelRatio?.()}}
}
if(typeof World!=='undefined'){
  const tickQueuesBaseV168=World.prototype.tickQueues;
  World.prototype.tickQueues=function(renderer){const pacer=game?.framePacerV168;if(!pacer?.deferLoads||!pacer.nearReady?.())return tickQueuesBaseV168.call(this,renderer);const saved=this.loadQueue.splice(0);this.v146BuildBudget=1;try{return tickQueuesBaseV168.call(this,renderer)}finally{if(saved.length)this.loadQueue.unshift(...saved)}};
}
if(typeof JavaLightEngineV165!=='undefined')JavaLightEngineV165.prototype.update=function(){const slow=!!game?.framePacerV168?.deferLoads;let budget=coarse()?(slow?80:170):(slow?170:400);while(budget--&&this.queue.length){const q=this.queue.shift();this.queued.delete(q.k);this.process(q)}};

/* -------------------------------------------------------------------------- */
/* BOOT / UPDATE / LOOP                                                        */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'){
  const bootBaseV168=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const fresh=!!args[1];this.__v168Booting=true;let r;try{r=await bootBaseV168.apply(this,args);this.framePacerV168=new FramePacerV168(this);applyWorldSetupV168(this);installDifficultyHealthV168(this);scheduleSpawnWarmupV168(this,fresh);ensureNeighborhoodV168(this,1,true);restoreFancyCloudsV168();this.firstPersonV7?.refresh?.();renderSurvivalBarsV6?.(this.player,this.mode);window.__voxelDiag?.log?.(`V16.8 READY: ${this.worldModeV168}/${this.difficultyV168}; startup surface guard, portal fail-safe, Java cloud geometry, front-facing held rig and frame spike pacer active.`,'ok');return r}finally{this.__v168Booting=false}};
  const updateBaseV168=Game.prototype.update;
  Game.prototype.update=function(dt){if(this.creativeV168&&this.player){this.player.health=20;this.player.hunger=20}const r=updateBaseV168.call(this,dt);if(performance.now()<(this.__spawnWarmupV168Until||0))relocateStartupV168(this,false);restoreFancyCloudsV168();return r};
  const loopBaseV168=Game.prototype.loop;
  Game.prototype.loop=function(t){if(this.__v168Booting){requestAnimationFrame(x=>this.loop(x));return}const start=performance.now(),r=loopBaseV168.call(this,t);this.framePacerV168?.observe?.(performance.now()-start);return r};
  const hudBaseGameV168=Game.prototype.updateHud;
  Game.prototype.updateHud=function(){const r=hudBaseGameV168.call(this);const env=this.renderer?.dayStateV6;if(env&&this.player){const label=this.worldModeV168||this.mode;topStatus.textContent=`${String(label).toUpperCase()} • ${this.difficultyV168||'Normal'} • Day ${env.day||1} ${env.timeText||''}${env.isNight?' NIGHT':' DAY'} • FPS ${this.stats.fps.toFixed(0)} • Chunks ${this.renderer.stats.chunks} • Faces ${this.renderer.stats.faces}`}return r};
}

try{runtimeCommands.register('v168',()=>({build:BUILD,mode:game?.worldModeV168,difficulty:game?.difficultyV168,hardcore:!!game?.hardcoreV168,player:game?.player?.position?.toArray?.(),spawnFixes:game?.__spawnFixedV168||0,warmup:performance.now()<(game?.__spawnWarmupV168Until||0),occlusion:game?.renderer?.sectionVisibilityV146?.stats||null,frame:game?.framePacerV168?.snapshot?.()||null,environment:window.__v168Environment||null,held:{item:game?.selectedStack?.()?.id||0,position:game?.firstPersonV7?.rightItem?.position?.toArray?.(),rotation:game?.firstPersonV7?.rightItem?.rotation?.toArray?.().slice?.(0,3),kind:game?.firstPersonV7?.rightItem?.userData?.v168Held||null},cloud:{visible:game?.cloudsV13?.mesh?.visible??null,geometry:game?.cloudsV13?.mesh?.geometry?.getAttribute?.('position')?.count||0,y:game?.cloudsV13?.mesh?.position?.y??null}}),'Inspect V16.8 stability, mode, render and environment state.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.16.8-world-render-gameplay-stability';
})();