(function(){
'use strict';
const BUILD='0.16.0';
const $=id=>document.getElementById(id);
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};
const isDesktop=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches}catch{return false}};
const style=document.createElement('style');
style.id='v160DesktopVanillaStyle';
style.textContent=`
:root{--v160-hud-scale:1}
#hotbar.javaHotbarV144,#hotbar{
top:auto!important;left:50%!important;right:auto!important;
bottom:max(8px,calc(env(safe-area-inset-bottom) + 5px))!important;
transform:translateX(-50%) scale(var(--v160-hud-scale))!important;
transform-origin:center bottom!important
}
#survivalBars{
width:364px!important;height:30px!important;
left:50%!important;right:auto!important;
bottom:calc(max(8px,calc(env(safe-area-inset-bottom) + 5px)) + 48px)!important;
transform:translateX(-50%) scale(var(--v160-hud-scale))!important;
transform-origin:center bottom!important;
grid-template-columns:1fr 1fr!important;
grid-template-rows:18px 10px!important;
column-gap:4px!important;row-gap:2px!important;
overflow:visible!important
}
#heartBar,#hungerBar{height:18px!important;overflow:visible!important}
#heartBar .javaHudSpriteV144,#hungerBar .javaHudSpriteV144,
#heartBar .v8HudSprite,#hungerBar .v8HudSprite{
width:18px!important;height:18px!important;min-width:18px!important;
margin:0 -2px 0 0!important;image-rendering:pixelated!important
}
#xpHudV12{width:364px!important;height:10px!important;grid-column:1/3!important;grid-row:2!important}
#xpEmptyV12,#xpFullV12{width:364px!important;max-width:none!important;height:10px!important;top:0!important;object-fit:fill!important}
#xpClipV12{height:10px!important;top:0!important}
#xpLevelV12{bottom:8px!important;font:400 16px/16px 'Minecraft Seven','Courier New',monospace!important}
#armorBarV13{
left:0!important;right:auto!important;bottom:36px!important;height:18px!important;
gap:0!important;align-items:center!important
}
#armorBarV13 .javaArmorUnitV144,#armorBarV13 .armorUnitV13{
width:18px!important;height:18px!important;margin-right:-2px!important
}
#armorBarV13 .javaArmorUnitV144 img,#armorBarV13 .armorUnitV13 img{width:18px!important;height:18px!important}
#survivalBars #oxygenBarV8{
position:absolute!important;left:auto!important;right:0!important;
bottom:36px!important;width:180px!important;height:18px!important;
transform:none!important;justify-content:flex-end!important;align-items:center!important;gap:0!important
}
#survivalBars .oxygenBubbleV8{width:18px!important;height:18px!important;margin-left:-2px!important}
@media (hover:hover) and (pointer:fine){
#mobileControls,#mobileHint,#cameraToggleV12,#crouchStateV12,#sprintBtnV13,#dropBtnV159,#benchBtnV13{display:none!important}
#lookSurface{pointer-events:none!important;cursor:default!important}
#gameCanvas{cursor:crosshair!important}
body.v160PointerLocked #gameCanvas,body.v160PointerLocked #hud,body.v160PointerLocked #hud *{cursor:none!important}
}
@media (max-width:370px){#survivalBars{width:364px!important}}
`;
document.head.appendChild(style);
function syncHudScale(){
const vv=window.visualViewport,w=Math.max(1,vv?.width||innerWidth),h=Math.max(1,vv?.height||innerHeight);
let scale=Math.min(1,(w-12)/364);
if(!isDesktop()&&h<430)scale=Math.min(scale,.88);
scale=Math.max(.72,Math.min(1,scale));
document.documentElement.style.setProperty('--v160-hud-scale',scale.toFixed(4));
window.__v160HudScale=scale;
}
syncHudScale();
addEventListener('resize',syncHudScale,{passive:true});
addEventListener('orientationchange',()=>setTimeout(syncHudScale,60),{passive:true});
window.visualViewport?.addEventListener?.('resize',syncHudScale,{passive:true});
function syncPointerLockClass(){document.body?.classList.toggle('v160PointerLocked',document.pointerLockElement===canvas)}
document.addEventListener('pointerlockchange',syncPointerLockClass,{passive:true});
document.addEventListener('pointerlockerror',()=>document.body?.classList.remove('v160PointerLocked'),{passive:true});
function requestDesktopLock(){
if(!isDesktop()||!game?.running||game.ui?.screen||document.pointerLockElement===canvas)return;
try{const p=canvas.requestPointerLock?.({unadjustedMovement:true});if(p?.catch)p.catch(()=>{try{canvas.requestPointerLock?.()}catch{}})}catch{try{canvas.requestPointerLock?.()}catch{}}
}
canvas.addEventListener('mousedown',e=>{
if(!isDesktop()||!game?.running||game.ui?.screen)return;
if(e.button!==0&&e.button!==2)return;
e.preventDefault();e.stopImmediatePropagation();requestDesktopLock();
if(e.button===0)game.primaryActionStart?.('desktop-mouse');
else game.useSelected?.();
},{capture:true,passive:false});
canvas.addEventListener('mouseup',e=>{
if(!isDesktop()||e.button!==0)return;
e.preventDefault();e.stopImmediatePropagation();game.primaryActionEnd?.('desktop-mouse');
},{capture:true,passive:false});
canvas.addEventListener('contextmenu',e=>{if(isDesktop()&&game?.running){e.preventDefault();e.stopImmediatePropagation()}},{capture:true,passive:false});
canvas.addEventListener('click',requestDesktopLock,{capture:true,passive:true});
addEventListener('keydown',e=>{
if(!isDesktop()||!game?.running)return;
const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;
if(e.code==='KeyE'){
e.preventDefault();e.stopImmediatePropagation();document.exitPointerLock?.();game.toggleInventory?.();return;
}
if(e.code==='KeyC'){
e.preventDefault();e.stopImmediatePropagation();document.exitPointerLock?.();game.openCraftingTable?.();return;
}
if(/^Digit[1-9]$/.test(e.code)&&!game.ui?.screen){
e.preventDefault();e.stopImmediatePropagation();game.inventory.selected=Number(e.code.slice(5))-1;game.refreshHotbar?.();return;
}
},{capture:true,passive:false});
for(const name of ['openInventory','openCraftingTable','openCreative','openFurnaceV7']){
const base=UI?.prototype?.[name];if(typeof base!=='function'||base.__v160PointerExit)continue;
const wrapped=function(...args){if(document.pointerLockElement)document.exitPointerLock?.();return base.apply(this,args)};
wrapped.__v160PointerExit=true;UI.prototype[name]=wrapped;
}
if(typeof window.openV15PauseMenu==='function'&&!window.openV15PauseMenu.__v160PointerExit){
const base=window.openV15PauseMenu;const wrapped=function(...args){if(document.pointerLockElement)document.exitPointerLock?.();return base.apply(this,args)};wrapped.__v160PointerExit=true;window.openV15PauseMenu=wrapped;
}
const v160ItemGeometry=new Map();
function itemName(id){try{return javaItemNameV145(id)}catch{return String(ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}}
function itemURLs(id){const name=itemName(id);return [`./assets/java/26.1/items/${name}.png`,`./assets/java/items/${name}.png`,`${typeof JAVA_261_RAW!=='undefined'?JAVA_261_RAW:'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/'}items/${name}.png`];}
async function loadItemTexture(id){
let last=null;
for(const url of itemURLs(id)){
try{const out=await javaItemTextureV145(url);return {...out,url}}catch(e){last=e}
}
throw last||new Error(`Java item texture unavailable: ${itemName(id)}`);
}
function extrudedItemRoot(id,{viewModel=false}={}){
const root=new THREE.Group();root.userData.v160TexturedItem=true;root.userData.itemId=id;
(async()=>{
try{
const {texture,canvas,url}=await loadItemTexture(id),name=itemName(id);let geo=v160ItemGeometry.get(name);
if(!geo){geo=javaExtrudedItemGeometryV145(canvas);v160ItemGeometry.set(name,geo)}
const mat=new THREE.MeshLambertMaterial({map:texture,color:0xffffff,side:THREE.DoubleSide,transparent:false,alphaTest:.08,depthTest:!viewModel,depthWrite:!viewModel,toneMapped:!viewModel});
const mesh=new THREE.Mesh(geo,mat);mesh.userData.itemId=id;mesh.userData.javaItemTexture=url;mesh.userData.v160TexturedItem=true;
mesh.frustumCulled=!viewModel;mesh.renderOrder=viewModel?2500:30;mesh.castShadow=false;mesh.receiveShadow=false;
if(viewModel)mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;
root.add(mesh);
}catch(e){window.__voxelDiag?.log?.(`V16 ITEM ${itemName(id)} failed: ${e.message}`,'warn')}
})();
return root;
}
function torchRoot({viewModel=false}={}){
const root=new THREE.Group();root.userData.itemId=ITEM.TORCH;root.userData.v160TexturedItem=true;
const geo=typeof v147TorchGeometry==='function'?v147TorchGeometry():new THREE.BoxGeometry(.125,.625,.125);
const mat=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:false,alphaTest:.06,depthTest:!viewModel,depthWrite:!viewModel,toneMapped:!viewModel,emissive:new THREE.Color(0x2b1604),emissiveIntensity:viewModel?.16:.10});
const mesh=new THREE.Mesh(geo,mat);mesh.position.y=-.18;mesh.renderOrder=viewModel?2500:30;mesh.frustumCulled=!viewModel;mesh.userData.itemId=ITEM.TORCH;mesh.userData.v160TexturedItem=true;
if(viewModel)mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;root.add(mesh);
(async()=>{let last=null;for(const url of ['./assets/java/26.1/blocks/torch.png','./assets/java/blocks/torch.png']){try{const {texture}=await javaItemTextureV145(url);mat.map=texture;mat.needsUpdate=true;mesh.userData.javaItemTexture=url;return}catch(e){last=e}}window.__voxelDiag?.log?.(`V16 TORCH texture failed: ${last?.message||'unknown'}`,'warn')})();
return root;
}
if(typeof HeldItemFactoryV8!=='undefined'){
HeldItemFactoryV8.prototype.flat=function(id){return extrudedItemRoot(id,{viewModel:true})};
const createBase=HeldItemFactoryV8.prototype.create;
HeldItemFactoryV8.prototype.create=function(id){
const tool=typeof V147_TOOL_IDS!=='undefined'&&V147_TOOL_IDS.has(id);
if(id===ITEM.TORCH)return torchRoot({viewModel:true});
if(tool)return extrudedItemRoot(id,{viewModel:true});
const root=createBase.call(this,id);
root?.traverse?.(o=>{if(!o.isMesh)return;o.userData.viewModelV7=o.userData.viewModelV8=true;o.depthTest=false;o.renderOrder=2500});
return root;
};
}
if(typeof StudioDropVisualFactoryV6!=='undefined'){
const dropCreateBase=StudioDropVisualFactoryV6.prototype.create;
StudioDropVisualFactoryV6.prototype.create=function(id){
const block=this.blockForItem(id);
if(block!==BLOCK.AIR)return dropCreateBase.call(this,id);
if(id===ITEM.TORCH)return torchRoot({viewModel:false});
return extrudedItemRoot(id,{viewModel:false});
};
}
function skinFaceTexture(image,sx,sy,sw,sh){
const cv=document.createElement('canvas');cv.width=Math.max(1,sw);cv.height=Math.max(1,sh);const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}
if(typeof FirstPersonViewV7!=='undefined')FirstPersonViewV7.prototype.arm=function(x){
const right=x>0,base=new THREE.MeshLambertMaterial({color:0xc78b63,depthTest:false,depthWrite:false,toneMapped:false}),mats=Array.from({length:6},()=>base.clone());
const mesh=new THREE.Mesh(new THREE.BoxGeometry(.13,.42,.13),mats);mesh.position.set(right?.43:-.43,-.49,-.78);mesh.rotation.set(-.52,0,right?-.25:.25);mesh.renderOrder=2490;mesh.frustumCulled=false;mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;
(async()=>{try{const image=await game.assets.image('./assets/java/26.1/entity/player/wide/steve.png');const u=right?40:32,v=right?16:48;const faces=[
[u+8,v+4,4,12],[u,v+4,4,12],[u+4,v,4,4],[u+8,v,4,4],[u+4,v+4,4,12],[u+12,v+4,4,12]
];faces.forEach((f,i)=>{mats[i].map=skinFaceTexture(image,...f);mats[i].color.set(0xffffff);mats[i].needsUpdate=true});image.close?.()}catch(e){window.__voxelDiag?.log?.(`V16 first-person skin arm fallback: ${e.message}`,'warn')}})();
return mesh;
};
function dayState(){
let phase=0;try{phase=((Number(dayClock?.phase?.())||0)%1+1)%1}catch{}
const ticks=phase*24000,sunY=Math.sin(phase*Math.PI*2);let skyLevel=15;
if(ticks>=12000&&ticks<13000)skyLevel=lerp(15,4,smooth((ticks-12000)/1000));
else if(ticks>=13000&&ticks<23000)skyLevel=4;
else if(ticks>=23000)skyLevel=lerp(4,15,smooth((ticks-23000)/1000));
const daylight=clamp01((skyLevel-4)/11),night=1-daylight;
const sunset=ticks>=11000&&ticks<=13750?1-Math.min(1,Math.abs(ticks-12350)/1375):0;
const sunrise=(ticks>=22250?clamp01((ticks-22250)/1250):ticks<=650?clamp01(1-ticks/650):0);
const twilight=clamp01(Math.max(sunset,sunrise));
const stars=smooth(clamp01((night-.20)/.80));
const angle=(phase-.25)*Math.PI*2;
const sunDir=new THREE.Vector3(Math.cos(angle),Math.sin(angle),.12).normalize();
return{phase,ticks,skyLevel,daylight,night,twilight,stars,sunY,sunDir};
}
function palette(s){
const dayZen=new THREE.Color(0x78a7e8),dayHor=new THREE.Color(0xb7d5f5),nightZen=new THREE.Color(0x030712),nightHor=new THREE.Color(0x10182a),warm=new THREE.Color(0xf0a06c);
const zen=nightZen.clone().lerp(dayZen,s.daylight),hor=nightHor.clone().lerp(dayHor,s.daylight);
if(s.twilight>.001)hor.lerp(warm,.72*s.twilight);
return{zen,hor,warm};
}
function forceJavaClouds(s){
const clouds=game?.cloudsV13?.mesh;if(!clouds)return;
let mode='Fancy';try{mode=v15Prefs?.().clouds||mode}catch{}
clouds.visible=String(mode).toLowerCase()!=='off'&&!game?.__hardQuitV159&&!document.hidden;
const m=clouds.material;if(m){
if(m.transparent){m.transparent=false;m.needsUpdate=true}m.opacity=1;m.depthWrite=false;m.depthTest=true;m.side=THREE.FrontSide;m.toneMapped=false;
const cloudNight=new THREE.Color(0x343c50),cloudDay=new THREE.Color(0xffffff),cloudWarm=new THREE.Color(0xe9a082),cc=cloudNight.clone().lerp(cloudDay,s.daylight);if(s.twilight>.001)cc.lerp(cloudWarm,.34*s.twilight);m.color.copy(cc);
}
}
if(typeof MinecraftCloudLayerV13!=='undefined'&&typeof MinecraftCloudLayerV13.prototype._java261Rebuild==='function'){
const cloudRebuildBase=MinecraftCloudLayerV13.prototype._java261Rebuild;
MinecraftCloudLayerV13.prototype._java261Rebuild=function(...args){
const r=cloudRebuildBase.apply(this,args),g=this.mesh?.geometry,n=g?.getAttribute?.('normal'),c=g?.getAttribute?.('color');
if(n&&c){for(let i=0;i<c.count;i++){const y=n.getY(i),v=y>.5?1:y<-.5?.86:.94;c.setXYZ(i,v,v,v)}c.needsUpdate=true}return r;
};
}
if(typeof ChunkMesher!=='undefined'&&typeof ChunkMesher.prototype.buildSectionV146==='function'){
const sectionLightBase=ChunkMesher.prototype.buildSectionV146;
ChunkMesher.prototype.buildSectionV146=function(chunk,sy){
if(sy===0||this._v160LightChunk!==`${chunk.cx},${chunk.cz}`){this._v160LightChunk=`${chunk.cx},${chunk.cz}`;this._v160TopOpaque=new Map()}
const built=sectionLightBase.call(this,chunk,sy),g=built?.geometry,pos=g?.getAttribute?.('position'),norm=g?.getAttribute?.('normal'),col=g?.getAttribute?.('color');
if(!pos||!norm||!col)return built;
const cache=this._v160TopOpaque||(this._v160TopOpaque=new Map()),height=Number(ENGINE?.WORLD_HEIGHT||chunk?.height||96);
const topOpaque=(x,z)=>{const k=`${x},${z}`;if(cache.has(k))return cache.get(k);let top=-9999;for(let y=height-1;y>=0;y--){const id=this.world.getLoaded(x,y,z);if(OPAQUE_BLOCKS.has(id)){top=y+1;break}}cache.set(k,top);return top};
const skyOpen=(x,y,z)=>y>=topOpaque(x,z)-.001;
for(let i=0;i<pos.count;i+=4){
const end=Math.min(pos.count,i+4);let cx=0,cy=0,cz=0,nx=0,ny=0,nz=0;for(let j=i;j<end;j++){cx+=pos.getX(j);cy+=pos.getY(j);cz+=pos.getZ(j);nx+=norm.getX(j);ny+=norm.getY(j);nz+=norm.getZ(j)}const q=Math.max(1,end-i);cx/=q;cy/=q;cz/=q;nx/=q;ny/=q;nz/=q;
const sx=Math.floor(cx+nx*.06),sy0=Math.floor(cy+ny*.06),sz=Math.floor(cz+nz*.06);let exposure=skyOpen(sx,sy0,sz)?1:0;
if(!exposure){const near=[[1,0],[-1,0],[0,1],[0,-1]];if(near.some(([dx,dz])=>skyOpen(sx+dx,sy0,sz+dz)))exposure=.82;else if(near.some(([dx,dz])=>skyOpen(sx+dx*2,sy0,sz+dz*2)))exposure=.66;else exposure=.50}
for(let j=i;j<end;j++)col.setXYZ(j,col.getX(j)*exposure,col.getY(j)*exposure,col.getZ(j)*exposure);
}
col.needsUpdate=true;g.userData.v160SkyExposure=true;return built;
};
}
function disableCompetingPhotonSky(){
const a=game?.photonAtmosphereV151;if(a?.group)a.group.visible=false;
const g=game?.photonGauntletV152;if(g?.clouds?.group)g.clouds.group.visible=false;if(g?.post)g.post.enabled=false;
for(const u of g?.shadows?.uniforms||[]){if(u?.photonCloudShadow)u.photonCloudShadow.value=0}
for(const u of g?.water?.uniforms||[]){if(u?.photonWaterStrength)u.photonWaterStrength.value=0}
const p=game?.photonV148;if(p?.rig)p.rig.visible=false;if(p?.hemi)p.hemi.intensity=0;if(p?.sun)p.sun.intensity=0;
}
function applyVanillaEnvironment(rr){
if(!rr?.scene||!rr.camera)return;const s=dayState(),pal=palette(s),weather=clamp01(game?.weather?.intensity||game?.weatherIntensity||0);
disableCompetingPhotonSky();
if(rr.javaSkyV159?.mesh){
const sky=rr.javaSkyV159;sky.mesh.visible=true;sky.mesh.position.copy(rr.camera.position);const u=sky.mesh.material?.uniforms;
if(u?.uZenith)u.uZenith.value.copy(pal.zen);if(u?.uHorizon)u.uHorizon.value.copy(pal.hor);if(u?.uStars)u.uStars.value=s.stars;if(u?.uWarm)u.uWarm.value=s.twilight*.34;
}else if(rr.scene.background?.isColor)rr.scene.background.copy(pal.hor);
const fogColor=pal.hor.clone().lerp(new THREE.Color(0x7b8188),weather*.34);if(rr.fog?.isFog){rr.scene.fog=rr.fog;rr.fog.color.copy(fogColor)}
const skyIntensity=lerp(.28,1.08,s.daylight)*(1-weather*.13);
if(rr.dayStateV6){rr.dayStateV6.daylight=s.skyLevel/15;rr.dayStateV6.isNight=s.skyLevel<=4.5;rr.dayStateV6.internalSkyLight=s.skyLevel}
if(rr.ambient){rr.ambient.intensity=skyIntensity;rr.ambient.color.copy(pal.zen.clone().lerp(new THREE.Color(0xffffff),.42));rr.ambient.groundColor.copy(new THREE.Color(0x4d5662).lerp(new THREE.Color(0x7b7468),s.daylight))}
if(rr.sun){
const cam=rr.camera.position,d=120;rr.sun.position.copy(cam).addScaledVector(s.sunDir,d);if(rr.sun.target){rr.sun.target.position.copy(cam);if(!rr.sun.target.parent)rr.scene.add(rr.sun.target)}
rr.sun.intensity=(.10+.36*s.daylight)*Math.max(.15,s.sunDir.y+.25)*(1-weather*.22);rr.sun.color.copy(new THREE.Color(0xfff4dc).lerp(new THREE.Color(0xffb16e),s.twilight*.65));rr.sun.castShadow=false;
}
if(rr.moon){rr.moon.intensity=.05+.08*s.night;rr.moon.color?.set?.(0x9fb6db)}
if(rr.fillAmbient)rr.fillAmbient.intensity=.02+.06*s.daylight;
const web=rr.renderer;if(web){web.toneMapping=THREE.NoToneMapping;web.toneMappingExposure=1;if(web.shadowMap)web.shadowMap.enabled=false;web.outputColorSpace=THREE.SRGBColorSpace}
for(const m of [rr.materialOpaque,rr.materialCutout,rr.materialLeaves,rr.materialGlass]){if(!m)continue;m.color?.set?.(0xffffff);m.toneMapped=false}
if(rr.materialWater){const m=rr.materialWater;m.transparent=true;m.opacity=.62;m.depthTest=true;m.depthWrite=false;m.toneMapped=false;m.color?.set?.(0xffffff)}
forceJavaClouds(s);
window.__v160DayState={ticks:s.ticks,skyLight:Number(s.skyLevel.toFixed(2)),daylight:Number(s.daylight.toFixed(3)),twilight:Number(s.twilight.toFixed(3)),stars:Number(s.stars.toFixed(3))};
}
if(typeof VoxelRenderer!=='undefined'){
const celestialBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(...args){
const r=celestialBase.apply(this,args),s=dayState(),c=this.celestialV7;if(!c)return r;const d=Math.min(500,(this.camera?.far||700)*.70),sun=c.sunSprite,moon=c.moonSprite;
if(sun){sun.position.copy(this.camera.position).addScaledVector(s.sunDir,d);sun.scale.set(28,28,1);sun.renderOrder=-30;if(sun.material){sun.material.depthTest=true;sun.material.depthWrite=false;sun.material.alphaTest=.10;sun.material.transparent=true;sun.material.toneMapped=false}}
if(moon){moon.position.copy(this.camera.position).addScaledVector(s.sunDir,-d);moon.scale.set(26,26,1);moon.renderOrder=-30;if(moon.material){moon.material.depthTest=true;moon.material.depthWrite=false;moon.material.alphaTest=.08;moon.material.transparent=true;moon.material.toneMapped=false}}
return r;
};
const renderBase=VoxelRenderer.prototype.render;
VoxelRenderer.prototype.render=function(dt){
const web=this.renderer;if(!web?.render)return renderBase.call(this,dt);const actual=web.render;
web.render=(scene,camera)=>{if(scene===this.scene&&camera===this.camera)applyVanillaEnvironment(this);return actual.call(web,scene,camera)};
try{return renderBase.call(this,dt)}finally{web.render=actual}
};
}
async function installCleanSun(rr){
if(!rr?.celestialV7?.sunSprite||rr._v160SunCleaning)return;rr._v160SunCleaning=true;
try{
const source=await game.assets.image('./assets/java/26.1/environment/celestial/sun.png'),w=source.width||16,h=source.height||16,cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(source,0,0);source.close?.();const im=c.getImageData(0,0,w,h),d=im.data;
for(let i=0;i<d.length;i+=4){const a=d[i+3],mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]),lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];if(a<8||mx<38||(mx-mn<18&&lum<58))d[i+3]=0;else if(lum<76)d[i+3]=Math.round(a*clamp01((lum-48)/28))}c.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;const mat=rr.celestialV7.sunSprite.material,old=mat.map;mat.map=t;mat.needsUpdate=true;old?.dispose?.();rr._v160SunClean=true;
}catch(e){window.__voxelDiag?.log?.(`V16 sun cleanup failed: ${e.message}`,'warn')}finally{rr._v160SunCleaning=false}
}
function repairVersionLabel(){
const footer=$('v158Footer');if(footer){const html=`<span>Minecraft Web ${BUILD}</span><span>Java 26.1 • Three.js • Vanilla Fidelity</span>`;if(footer.innerHTML!==html)footer.innerHTML=html}
}
if(typeof window.rebuildCanonicalTitleV158==='function'&&!window.rebuildCanonicalTitleV158.__v160VersionWrapped){const titleBase=window.rebuildCanonicalTitleV158;const wrapped=function(...args){const r=titleBase.apply(this,args);queueMicrotask(repairVersionLabel);return r};wrapped.__v160VersionWrapped=true;window.rebuildCanonicalTitleV158=wrapped}
queueMicrotask(repairVersionLabel);[90,260,720,1600].forEach(ms=>setTimeout(repairVersionLabel,ms));
const bootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){
const r=await bootBase.apply(this,args);syncHudScale();try{window.relocateOxygenV159?.();this.firstPersonV7?.refresh?.();this.renderer?.updateCelestialsV7?.();void installCleanSun(this.renderer);applyVanillaEnvironment(this.renderer)}catch(e){console.warn('[V16 boot fidelity]',e)}return r;
};
try{runtimeCommands.register('v160',()=>({build:BUILD,desktop:isDesktop(),pointerLocked:document.pointerLockElement===canvas,hudScale:window.__v160HudScale||1,day:window.__v160DayState||null,sky:'Java vanilla authoritative',photonSkySuppressed:true,sunDepthTest:game.renderer?.celestialV7?.sunSprite?.material?.depthTest??null,javaClouds:!!game.cloudsV13?.mesh?.visible,itemRendering:'Java 26.1 texture extrusion for held/dropped items'}),'Inspect V16 desktop/vanilla fidelity fixes.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.16.0-desktop-vanilla-fidelity';
window.__voxelDiag?.log?.('V16.0 READY: desktop pointer lock + mouse actions, Java HUD spacing/scale, occluded clean sun, Java clouds, brighter vanilla day/night skylight, lit hand/mobs and textured 3D held/dropped tools.','ok');
})();
