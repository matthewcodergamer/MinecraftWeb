/* Minecraft Web V16.2 — vanilla polish, view-model isolation and eating gameplay */
(function(){
'use strict';
const BUILD='0.16.2';
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerpV162=(a,b,t)=>a+(b-a)*t;
const smoothV162=t=>{t=clamp01(t);return t*t*(3-2*t)};
const isDesktopV162=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches}catch{return false}};

/* -------------------------------------------------------------------------- */
/* TITLE — restore a correctly proportioned JAVA EDITION strip                */
/* -------------------------------------------------------------------------- */
const titleStyle=document.createElement('style');
titleStyle.id='v162TitleAndHudPolish';
titleStyle.textContent=`
#titleContent #javaEditionV15{
  display:block!important;
  width:min(218px,40vw)!important;
  max-width:48%!important;
  height:auto!important;
  margin:-13px auto 10px!important;
  object-fit:contain!important;
  image-rendering:pixelated!important;
}
@media (hover:hover) and (pointer:fine){
  #titleContent #javaEditionV15{width:min(226px,36vw)!important;max-width:48%!important;margin:-14px auto 11px!important}
}
@media (orientation:landscape) and (max-height:520px){
  #titleContent #javaEditionV15{width:min(202px,34vw)!important;max-width:46%!important;margin:-10px auto 7px!important}
}
@media (orientation:portrait){
  #titleContent #javaEditionV15{width:min(208px,46vw)!important;max-width:50%!important;margin:-10px auto 9px!important}
}
`;
document.head.appendChild(titleStyle);

/* -------------------------------------------------------------------------- */
/* JAVA 26.1 BIOME COLORMAPS + REAL GRASS-SIDE OVERLAY                        */
/* -------------------------------------------------------------------------- */
const V162_CLIMATE=Object.freeze({
  plains:[.8,.4],
  forest:[.7,.8],
  desert:[1,0],
  snowy:[0,.5]
});
const V162_FALLBACK=Object.freeze({
  grass:{plains:[0x91/255,0xbd/255,0x59/255],forest:[0x79/255,0xc0/255,0x5a/255],desert:[0xbf/255,0xb7/255,0x55/255],snowy:[0x80/255,0xb4/255,0x97/255]},
  leaves:{plains:[0x77/255,0xab/255,0x2f/255],forest:[0x59/255,0xae/255,0x30/255],desert:[0xae/255,0xa4/255,0x2a/255],snowy:[0x60/255,0xa1/255,0x7b/255]}
});
const v162Tint={grass:new Map(),leaves:new Map(),ready:false};
function biomeNameV162(world,x,z){
  try{return world?.generator?.biome?.(Math.floor(x),Math.floor(z))||'plains'}catch{return'plains'}
}
function sampleColormapV162(ctx,w,h,temp,rain){
  temp=clamp01(temp);rain=clamp01(rain)*temp;
  const x=Math.max(0,Math.min(w-1,Math.floor((1-temp)*(w-1))));
  const y=Math.max(0,Math.min(h-1,Math.floor((1-rain)*(h-1))));
  const d=ctx.getImageData(x,y,1,1).data;
  return [d[0]/255,d[1]/255,d[2]/255];
}
async function loadColormapV162(kind,path){
  const bmp=await game.assets.image(path),cv=document.createElement('canvas');
  cv.width=bmp.width||256;cv.height=bmp.height||256;
  const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(bmp,0,0);bmp.close?.();
  for(const [name,[temp,rain]] of Object.entries(V162_CLIMATE))v162Tint[kind].set(name,sampleColormapV162(ctx,cv.width,cv.height,temp,rain));
}
async function prepareJavaTintsV162(){
  if(v162Tint.ready)return;
  try{await Promise.all([
    loadColormapV162('grass','./assets/java/26.1/colormap/grass.png'),
    loadColormapV162('leaves','./assets/java/26.1/colormap/foliage.png')
  ]);v162Tint.ready=true;}
  catch(e){window.__voxelDiag?.log?.(`V16.2 colormap fallback: ${e.message}`,'warn')}
}
if(typeof javaBiomeTintV145==='function')javaBiomeTintV145=function(world,x,z,kind){
  const biome=biomeNameV162(world,x,z),type=kind==='leaves'?'leaves':'grass';
  return v162Tint[type].get(biome)||v162Tint[type].get('plains')||V162_FALLBACK[type][biome]||V162_FALLBACK[type].plains;
};

if(typeof AssetResolver!=='undefined'){
  const loadTextureBaseV162=AssetResolver.prototype.loadTexture;
  AssetResolver.prototype.loadTexture=async function(name){
    if(name!=='grass_side_overlay')return loadTextureBaseV162.call(this,name);
    if(this.textures.has(name))return this.textures.get(name);
    const urls=['./assets/java/26.1/blocks/grass_block_side_overlay.png','./assets/java/blocks/grass_block_side_overlay.png','https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/blocks/grass_block_side_overlay.png'];
    for(const url of urls){
      try{
        const bmp=await this.cache.image(url);this.textures.set(name,bmp);
        this.textureInfo.set(name,{name,filename:'grass_block_side_overlay.png',url,source:'JAVA 26.1',path:'blocks/grass_block_side_overlay.png',width:bmp.width||16,height:bmp.height||16,colorSpace:'sRGB',role:name});
        return bmp;
      }catch{}
    }
    return loadTextureBaseV162.call(this,name);
  };
}
if(typeof TextureAtlas!=='undefined'){
  const atlasBuildBaseV162=TextureAtlas.prototype.build;
  TextureAtlas.prototype.build=async function(names){
    const list=names.includes('grass_side_overlay')?names:[...names,'grass_side_overlay'];
    return atlasBuildBaseV162.call(this,list);
  };
}
if(typeof ChunkMesher!=='undefined'){
  const addQuadBaseV162=ChunkMesher.prototype.addQuad;
  ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){
    const id=this.currentBlock;
    const result=addQuadBaseV162.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);
    if(id!==BLOCK.GRASS||face==='up'||face==='down'||!this.atlas?.map?.has?.('grass_side_overlay'))return result;
    const f=VOXEL_FACES.find(q=>q.key===face);if(!f)return result;
    const base=positions.length/3,eps=.0015,t=javaBiomeTintV145(this.world,x,z,'grass');
    const verts=voxelFaceVertices(x,y,z,f);
    for(const v of verts)positions.push(v[0]+f.n[0]*eps,v[1]+f.n[1]*eps,v[2]+f.n[2]*eps);
    for(let i=0;i<4;i++){normals.push(...f.n);colors.push(...t)}
    for(const q of f.uv)uvs.push(...this.atlas.uv('grass_side_overlay',q[0],q[1]));
    buckets.cutout.push(base,base+1,base+2,base,base+2,base+3);
    return result;
  };
}

/* -------------------------------------------------------------------------- */
/* FIRST PERSON — restore the older arm proportions, but light it in-world    */
/* -------------------------------------------------------------------------- */
if(typeof FirstPersonViewV7!=='undefined'){
  FirstPersonViewV7.prototype.arm=function(x){
    const mat=new THREE.MeshLambertMaterial({color:0xc78b63,depthTest:true,depthWrite:true,toneMapped:false,fog:false});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.18,.62,.18),mat);
    mesh.position.set(x,-.48,-.78);mesh.rotation.set(-.35,0,x>0?-.25:.25);mesh.renderOrder=2502;mesh.frustumCulled=false;
    mesh.userData.viewModelV7=mesh.userData.viewModelV8=mesh.userData.viewModelV162=true;
    return mesh;
  };
}
function markViewModelV162(rr){
  const group=game?.firstPersonV7?.group;if(!group||!rr?.camera)return;
  group.traverse(o=>{
    o.layers?.set?.(1);
    if(o.isMesh&&o.material){
      const mats=Array.isArray(o.material)?o.material:[o.material];
      for(const m of mats){m.depthTest=true;m.depthWrite=true;m.fog=false;if('toneMapped'in m)m.toneMapped=false}
      o.renderOrder=2500;
    }
  });
  group.layers.set(1);
  rr.scene?.traverse?.(o=>{if(o.isLight)o.layers.enable(1)});
}
function eatingPoseV162(group,state){
  if(!group||!state)return null;
  const old={px:group.position.x,py:group.position.y,pz:group.position.z,rx:group.rotation.x,ry:group.rotation.y,rz:group.rotation.z};
  const p=clamp01(state.elapsed/state.duration),raise=smoothV162(Math.min(1,p*3)),chew=Math.sin(p*Math.PI*12);
  group.position.x-=.055*raise;group.position.y-=.075*raise+Math.max(0,chew)*.025;group.position.z+=.17*raise;
  group.rotation.x-=.08*raise+chew*.018;group.rotation.y+=.10*raise;group.rotation.z+=chew*.025;
  return()=>{group.position.set(old.px,old.py,old.pz);group.rotation.set(old.rx,old.ry,old.rz)};
}
function renderViewModelV162(rr,rawRender){
  const group=game?.firstPersonV7?.group,web=rr?.renderer,cam=rr?.camera,scene=rr?.scene;if(!group||!web||!cam||!scene||typeof rawRender!=='function')return;
  const oldMask=cam.layers.mask,oldAuto=web.autoClear,oldBg=scene.background,oldFog=scene.fog;
  const restorePose=eatingPoseV162(group,game.__eatingV162);
  try{
    cam.layers.set(1);web.autoClear=false;scene.background=null;scene.fog=null;web.clearDepth?.();rawRender.call(web,scene,cam);
  }finally{
    restorePose?.();cam.layers.mask=oldMask;web.autoClear=oldAuto;scene.background=oldBg;scene.fog=oldFog;
  }
}

/* -------------------------------------------------------------------------- */
/* DESKTOP LOOK — one raw pointer-lock path, Java-like sensitivity curve       */
/* -------------------------------------------------------------------------- */
function sensitivityV162(){
  let raw=100;
  try{const p=typeof v15Prefs==='function'?v15Prefs():null;if(Number.isFinite(Number(p?.sensitivity)))raw=Number(p.sensitivity)}catch{}
  const s=clamp01(raw/200),f=s*.6+.2;
  return .0025*(f*f*f*8);
}
document.addEventListener('mousemove',e=>{
  if(!isDesktopV162()||document.pointerLockElement!==canvas||!game?.running||game.ui?.screen)return;
  e.stopImmediatePropagation();
  const k=sensitivityV162();game.player.yaw-=e.movementX*k;game.player.pitch=clamp(game.player.pitch-e.movementY*k,-1.5,1.5);
},{capture:true,passive:true});

/* -------------------------------------------------------------------------- */
/* EATING — timed Java-style use action instead of instant food consumption    */
/* -------------------------------------------------------------------------- */
const FOOD_V162=new Map([[ITEM.BREAD,{food:5,saturation:6}],[ITEM.APPLE,{food:4,saturation:2.4}]]);
function stopEatingV162(){game.__eatingV162=null}
function beginEatingV162(id){
  if(game.__eatingV162)return true;
  const selected=game.selectedStack?.();if(!selected||selected.empty?.()||selected.id!==id||!FOOD_V162.has(id))return false;
  if(game.mode!=='creative'&&Number(game.player?.hunger??20)>=20)return false;
  game.__eatingV162={id,elapsed:0,duration:1.61,lastChew:-1};
  return true;
}
function tickEatingV162(dt){
  const st=game.__eatingV162;if(!st)return;
  const selected=game.selectedStack?.();
  if(!game.running||game.ui?.screen||!selected||selected.empty?.()||selected.id!==st.id){stopEatingV162();return}
  st.elapsed+=Math.min(.10,Math.max(0,Number(dt)||0));
  const chew=Math.floor(st.elapsed/.28);
  if(chew>st.lastChew&&st.elapsed>.18){st.lastChew=chew;game.javaAudioV144?.playEvent?.('entity.generic.eat',{volume:.52,pitch:.92+Math.random()*.18}).catch?.(()=>{})}
  if(st.elapsed<st.duration)return;
  const f=FOOD_V162.get(st.id);let consumed=true;
  if(game.mode!=='creative')consumed=!!game.inventory.consume(st.id,1);
  if(consumed){
    game.player.hunger=Math.min(20,Number(game.player.hunger??20)+f.food);
    if('saturation'in game.player)game.player.saturation=Math.min(game.player.hunger,Number(game.player.saturation||0)+f.saturation);
    game.javaAudioV144?.playEvent?.('entity.player.burp',{volume:.55,pitch:.95+Math.random()*.1}).catch?.(()=>{});
    game.refreshHotbar?.();game.firstPersonV7?.refresh?.();game.saveSoon?.();
  }
  stopEatingV162();
}
const useSelectedBaseV162=Game.prototype.useSelected;
Game.prototype.useSelected=function(...args){
  const selected=this.selectedStack?.();
  if(selected&&!selected.empty?.()&&FOOD_V162.has(selected.id)){
    if(beginEatingV162(selected.id))return;
  }
  return useSelectedBaseV162.apply(this,args);
};

/* -------------------------------------------------------------------------- */
/* ONE CANONICAL DAY/NIGHT STATE, BRIGHTER SKY LIGHT, CLOUDS, SUN AND MOON    */
/* -------------------------------------------------------------------------- */
function dayStateV162(){
  let phase=0;try{phase=((Number(dayClock?.phase?.())||0)%1+1)%1}catch{}
  const ticks=phase*24000,angle=phase*Math.PI*2,dir=new THREE.Vector3(Math.cos(angle),Math.sin(angle),Math.sin(angle)*.18).normalize();
  let sky=15;
  if(ticks>=12000&&ticks<13000)sky=lerpV162(15,4,smoothV162((ticks-12000)/1000));
  else if(ticks>=13000&&ticks<23000)sky=4;
  else if(ticks>=23000)sky=lerpV162(4,15,smoothV162((ticks-23000)/1000));
  const daylight=clamp01((sky-4)/11),night=1-daylight;
  const sunset=ticks>=10800&&ticks<=13600?1-Math.min(1,Math.abs(ticks-12200)/1400):0;
  const sunrise=ticks>=22600?clamp01((ticks-22600)/1000):ticks<=500?clamp01(1-ticks/500):0;
  const twilight=clamp01(Math.max(sunset,sunrise));
  return{phase,ticks,dir,altitude:dir.y,sky,daylight,night,twilight};
}
function paletteV162(s){
  const dayZen=new THREE.Color(0x78a7e8),dayHor=new THREE.Color(0xbfd8f3),nightZen=new THREE.Color(0x02050d),nightHor=new THREE.Color(0x0c1426),warm=new THREE.Color(0xee9660);
  const zen=nightZen.clone().lerp(dayZen,s.daylight),hor=nightHor.clone().lerp(dayHor,s.daylight);if(s.twilight>.001)hor.lerp(warm,.68*s.twilight);
  return{zen,hor,warm};
}
function forceCloudsV162(s){
  const layer=game?.cloudsV13,mesh=layer?.mesh;if(!mesh)return false;
  let mode='Fancy';try{mode=typeof v15Prefs==='function'?(v15Prefs()?.clouds||mode):mode}catch{}
  mesh.visible=String(mode).toLowerCase()!=='off'&&!document.hidden&&!game?.__hardQuitV159;
  const g=mesh.geometry;if(g){if(!g.boundingBox)g.computeBoundingBox?.();const minY=g.boundingBox?.min?.y;if(Number.isFinite(minY)){
    const worldHeight=Number((typeof ENGINE!=='undefined'&&ENGINE.WORLD_HEIGHT)||96),target=Math.max(112,Math.min(148,worldHeight+40));mesh.position.y=target-minY;
  }}
  const m=mesh.material;if(m){m.transparent=false;m.opacity=1;m.depthTest=true;m.depthWrite=true;m.toneMapped=false;m.side=THREE.FrontSide;
    const c=new THREE.Color(0x323b50).lerp(new THREE.Color(0xffffff),s.daylight);if(s.twilight>.001)c.lerp(new THREE.Color(0xf0b18e),s.twilight*.24);m.color?.copy?.(c);m.needsUpdate=true;
  }
  return mesh.visible;
}
function finalCelestialsV162(rr,s){
  const far=Math.max(100,Number(rr.camera?.far||700)),distance=Math.min(500,far*.70),cam=rr.camera.position;
  const proc=rr.squareSunV161;
  if(proc?.mesh){
    const white=new THREE.Color(0xfffbe8),warm=new THREE.Color(0xffa35c),edgeWhite=new THREE.Color(0xffefac),edgeWarm=new THREE.Color(0xf36f38),w=clamp01(s.twilight+.35*(1-smoothV162(clamp01((s.altitude+.02)/.45))));
    proc.mesh.position.copy(cam).addScaledVector(s.dir,distance);proc.mesh.quaternion.copy(rr.camera.quaternion);proc.mesh.visible=s.altitude>-.075&&!document.hidden&&!game?.__hardQuitV159;proc.mesh.frustumCulled=false;
    if(proc.material?.uniforms){proc.material.uniforms.uCore?.value?.copy?.(white.clone().lerp(warm,w*.76));proc.material.uniforms.uEdge?.value?.copy?.(edgeWhite.clone().lerp(edgeWarm,w*.86));if(proc.material.uniforms.uOpacity)proc.material.uniforms.uOpacity.value=smoothV162(clamp01((s.altitude+.075)/.14));}
    proc.material.depthTest=true;proc.material.depthWrite=false;
  }
  const oldSun=rr.celestialV7?.sunSprite;if(oldSun){oldSun.visible=false;if(oldSun.material)oldSun.material.opacity=0}
  const moon=rr.celestialV7?.moonSprite;if(moon){
    moon.position.copy(cam).addScaledVector(s.dir,-distance);moon.scale.set(26,26,1);moon.frustumCulled=false;moon.visible=s.altitude<.08&&!document.hidden&&!game?.__hardQuitV159;
    if(moon.material){moon.material.depthTest=true;moon.material.depthWrite=false;moon.material.transparent=true;moon.material.alphaTest=.06;moon.material.opacity=smoothV162(clamp01((.08-s.altitude)/.15));moon.material.toneMapped=false}
  }
}
function finalLightingV162(rr,s){
  if(!rr?.scene||!rr?.camera)return;const pal=paletteV162(s),weather=clamp01(game?.weather?.intensity||game?.weatherIntensity||0);
  if(rr.javaSkyV159?.mesh){const u=rr.javaSkyV159.mesh.material?.uniforms;rr.javaSkyV159.mesh.visible=true;rr.javaSkyV159.mesh.position.copy(rr.camera.position);if(u?.uZenith)u.uZenith.value.copy(pal.zen);if(u?.uHorizon)u.uHorizon.value.copy(pal.hor);if(u?.uStars)u.uStars.value=smoothV162(clamp01((s.night-.15)/.85));if(u?.uWarm)u.uWarm.value=s.twilight*.30}
  else if(rr.scene.background?.isColor)rr.scene.background.copy(pal.hor);
  if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(pal.hor.clone().lerp(new THREE.Color(0x7f858c),weather*.30))}
  if(rr.dayStateV6){rr.dayStateV6.daylight=s.sky/15;rr.dayStateV6.isNight=s.sky<=4.5;rr.dayStateV6.internalSkyLight=s.sky}
  if(rr.ambient){rr.ambient.intensity=lerpV162(.30,1.30,s.daylight)*(1-weather*.10);rr.ambient.color.copy(pal.zen.clone().lerp(new THREE.Color(0xffffff),.52));rr.ambient.groundColor.copy(new THREE.Color(0x303641).lerp(new THREE.Color(0x817b70),s.daylight))}
  if(rr.sun){rr.sun.position.copy(rr.camera.position).addScaledVector(s.dir,120);if(rr.sun.target){rr.sun.target.position.copy(rr.camera.position);if(!rr.sun.target.parent)rr.scene.add(rr.sun.target)}rr.sun.intensity=(.05+.48*s.daylight)*smoothV162(clamp01((s.altitude+.08)/.72))*(1-weather*.18);rr.sun.color.copy(new THREE.Color(0xfff6df).lerp(new THREE.Color(0xffb06d),s.twilight*.68));rr.sun.castShadow=false}
  if(rr.moon){rr.moon.intensity=.06+.10*s.night;rr.moon.color?.set?.(0x9fb5dc)}
  if(rr.fillAmbient)rr.fillAmbient.intensity=.04+.11*s.daylight;
  if(rr.renderer){rr.renderer.toneMapping=THREE.NoToneMapping;rr.renderer.toneMappingExposure=1;rr.renderer.outputColorSpace=THREE.SRGBColorSpace;if(rr.renderer.shadowMap)rr.renderer.shadowMap.enabled=false}
  for(const m of [rr.materialOpaque,rr.materialCutout,rr.materialLeaves,rr.materialGlass])if(m){m.color?.set?.(0xffffff);m.toneMapped=false}
  if(rr.materialWater){rr.materialWater.transparent=true;rr.materialWater.opacity=.62;rr.materialWater.depthTest=true;rr.materialWater.depthWrite=false;rr.materialWater.toneMapped=false}
  forceCloudsV162(s);finalCelestialsV162(rr,s);
  window.__v162Environment={ticks:Number(s.ticks.toFixed(1)),skyLight:Number(s.sky.toFixed(2)),daylight:Number(s.daylight.toFixed(3)),clouds:!!game?.cloudsV13?.mesh?.visible,sun:!!rr.squareSunV161?.mesh?.visible,moon:!!rr.celestialV7?.moonSprite?.visible};
}

if(typeof VoxelRenderer!=='undefined'){
  const renderBaseV162=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(dt){
    tickEatingV162(dt);markViewModelV162(this);this.camera?.layers?.set?.(0);
    const web=this.renderer,raw=web?.render;if(typeof raw!=='function')return renderBaseV162.call(this,dt);
    web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera){const s=dayStateV162();finalLightingV162(this,s)}return raw.call(web,scene,camera)};
    let result;
    try{result=renderBaseV162.call(this,dt)}finally{web.render=raw}
    renderViewModelV162(this,raw);
    return result;
  };
}

const bootBaseV162=Game.prototype.boot;
Game.prototype.boot=async function(...args){
  await prepareJavaTintsV162();
  const r=await bootBaseV162.apply(this,args);
  try{this.firstPersonV7?.refresh?.();markViewModelV162(this.renderer);const s=dayStateV162();finalLightingV162(this.renderer,s)}catch(e){console.warn('[V16.2 polish]',e)}
  return r;
};

function repairVersionV162(){const footer=document.getElementById('v158Footer');if(footer){const html=`<span>Minecraft Web ${BUILD}</span><span>Java 26.1 • Vanilla Lighting • Colormaps • Eating</span>`;if(footer.innerHTML!==html)footer.innerHTML=html}}
queueMicrotask(repairVersionV162);[80,240,700,1500].forEach(ms=>setTimeout(repairVersionV162,ms));
try{runtimeCommands.register('v162',()=>({build:BUILD,desktop:isDesktopV162(),pointerLocked:document.pointerLockElement===canvas,sensitivity:sensitivityV162(),environment:window.__v162Environment||null,grassTint:Object.fromEntries(v162Tint.grass),foliageTint:Object.fromEntries(v162Tint.leaves),grassSideOverlay:game?.atlas?.map?.has?.('grass_side_overlay')??null,cloudY:game?.cloudsV13?.mesh?.position?.y??null,eating:game?.__eatingV162||null,viewModelLayer:game?.firstPersonV7?.group?.layers?.mask??null}),'Inspect V16.2 vanilla polish.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;
window.STUDIO_PATCH_VERSION='0.16.2-vanilla-polish-gameplay';
window.__voxelDiag?.log?.('V16.2 READY: corrected Java Edition strip, Java colormap grass/foliage with side overlay, visible white clouds, brighter synchronized sky lighting, restored hand proportions, isolated water-safe view model, smooth desktop mouse and animated eating.','ok');
})();
