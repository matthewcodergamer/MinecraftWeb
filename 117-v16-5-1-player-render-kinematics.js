/* Minecraft Web V16.5.1 — world bootstrap, player camera, Java HUD/items, clouds and procedural FK/IK. */
(function(){
'use strict';
const BUILD='0.16.5.1';
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const lerp=(a,b,t)=>a+(b-a)*t;
const smoothAlpha=(rate,dt)=>1-Math.exp(-Math.max(0,rate)*Math.max(0,Number(dt)||0));
const normName=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');

/* -------------------------------------------------------------------------- */
/* WORLD BOOTSTRAP — remove the 96-high chunks created before V16.5 patches.  */
/* The Game object is constructed while 00-engine-core.js is evaluating, so    */
/* the initial player spawn can materialize old ChunkData before 113 installs. */
/* -------------------------------------------------------------------------- */
function modernChunkV1651(c){return !!(c&&c.formatV165===2&&c.height===384&&Array.isArray(c.sections)&&c.sections.length===24)}
function rebuildChangedIndexV1651(world){
  if(!world?.changed)return;
  const by=world.changedByChunkV165??=(new Map());
  for(const [key,id] of world.changed){
    const a=String(key).split(',');if(a.length!==3)continue;
    const x=Math.floor(Number(a[0])),y=Math.floor(Number(a[1])),z=Math.floor(Number(a[2]));
    if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z)||y<0||y>=384)continue;
    const p=world.worldToChunk(x,z),ck=chunkKey(p.cx,p.cz);let edits=by.get(ck);if(!edits)by.set(ck,edits=new Map());
    edits.set(y*256+p.lz*16+p.lx,Number(id)||0);
  }
}
function detachChunkMeshesV1651(gameRef,chunks){
  const rr=gameRef?.renderer;if(!rr)return;
  for(const c of chunks)try{rr.detachChunk?.(c)}catch{}
  /* V14.6 can have section children not represented by the legacy one-mesh map. */
  if(rr.chunkGroup){
    for(const child of [...rr.chunkGroup.children]){
      if(!/^chunk[_-]|section/i.test(String(child?.name||'')))continue;
      rr.chunkGroup.remove(child);child.geometry?.dispose?.();
    }
  }
  rr.chunkMeshes?.clear?.();rr.chunkReports?.clear?.();
}
function purgeLegacyChunksV1651(gameRef){
  const world=gameRef?.world;if(!world?.chunks)return 0;
  const legacy=[...world.chunks.values()].filter(c=>!modernChunkV1651(c));if(!legacy.length)return 0;
  rebuildChangedIndexV1651(world);detachChunkMeshesV1651(gameRef,legacy);
  for(const c of legacy)world.chunks.delete(chunkKey(c.cx,c.cz));
  world.loadQueue?.splice?.(0);world.buildQueue?.splice?.(0);world.unloadQueue?.splice?.(0);world.dirtyChunks?.clear?.();
  return legacy.length;
}
function safePlayerPositionV1651(gameRef,force=false){
  const p=gameRef?.player,w=gameRef?.world;if(!p?.position||!w)return false;
  const px=Math.floor(p.position.x),pz=Math.floor(p.position.z),cp=w.worldToChunk(px,pz);w.ensureChunk(cp.cx,cp.cz);
  let embedded=false;try{embedded=!!p.collidesAt?.(p.position)}catch{}
  if(!embedded){
    const foot=w.getLoaded(px,Math.floor(p.position.y+.06),pz),head=w.getLoaded(px,Math.floor(p.position.y+1.55),pz);
    embedded=SOLID_BLOCKS.has(foot)||SOLID_BLOCKS.has(head)||p.position.y<.1||p.position.y>382;
  }
  if(!force&&!embedded)return false;
  let spawn=null;
  /* Preserve X/Z where possible, but put the feet above a valid modern column. */
  try{
    const y=w.highestSolidY(px,pz),surface=w.getLoaded(px,y,pz);
    if(y>0&&surface!==BLOCK.WATER&&surface!==(window.V165_BLOCK?.LAVA??-1)&&SOLID_BLOCKS.has(surface)&&w.getLoaded(px,y+1,pz)===BLOCK.AIR&&w.getLoaded(px,y+2,pz)===BLOCK.AIR)spawn=new THREE.Vector3(px+.5,y+1.02,pz+.5);
  }catch{}
  if(!spawn)try{spawn=w.findSpawn?.()}catch{}
  if(!spawn)spawn=new THREE.Vector3(.5,(window.WORLD_V165?.engineSeaLevel||126)+8,.5);
  p.position.copy(spawn);p.velocity?.set?.(0,0,0);p.onGround=false;
  gameRef.playerEntitiesV12?.local?.lastPos?.copy?.(p.position);gameRef.playerEntitiesV12?.local?.root?.position?.copy?.(p.position);
  gameRef.player?.updateCamera?.(gameRef.renderer?.camera);return true;
}
if(typeof World!=='undefined'){
  const getChunkBaseV1651=World.prototype.getChunk;
  World.prototype.getChunk=function(cx,cz){
    const c=getChunkBaseV1651.call(this,cx,cz);if(!c||modernChunkV1651(c)||typeof window.ModernChunkDataV165!=='function')return c;
    rebuildChangedIndexV1651(this);this.chunks.delete(chunkKey(cx,cz));return this.ensureChunk(cx,cz);
  };
}

/* -------------------------------------------------------------------------- */
/* JAVA ATTACK INDICATOR — official 16×4 charge bar below the center crosshair */
/* and official 16×16 full/ready icon.                                         */
/* -------------------------------------------------------------------------- */
const hudStyle=document.createElement('style');hudStyle.id='v1651JavaAttackHud';hudStyle.textContent=`
#javaAttackIndicatorV144{position:absolute!important;left:50%!important;top:calc(50% + 12px)!important;width:16px!important;height:16px!important;transform:translateX(-50%) scale(1.25)!important;transform-origin:50% 0!important;z-index:520!important;pointer-events:none!important;overflow:visible!important;image-rendering:pixelated!important}
#javaAttackIndicatorV144 .javaAttackBgV144,#javaAttackIndicatorV144 .javaAttackClipV144{position:absolute!important;left:0!important;top:12px!important;width:16px!important;height:4px!important;margin:0!important;padding:0!important;image-rendering:pixelated!important}
#javaAttackIndicatorV144 .javaAttackBgV144{display:block!important;object-fit:fill!important}
#javaAttackIndicatorV144 .javaAttackClipV144{display:block!important;overflow:hidden!important;width:calc(clamp(0, var(--attack-progress, 1), 1) * 16px)!important}
#javaAttackIndicatorV144 .javaAttackClipV144 img{position:absolute!important;left:0!important;top:0!important;width:16px!important;height:4px!important;max-width:none!important;object-fit:fill!important;image-rendering:pixelated!important}
#javaAttackIndicatorV144 .javaAttackFullV144{display:none!important;position:absolute!important;left:0!important;top:0!important;width:16px!important;height:16px!important;object-fit:contain!important;image-rendering:pixelated!important}
#javaAttackIndicatorV144.full .javaAttackBgV144,#javaAttackIndicatorV144.full .javaAttackClipV144{display:none!important}
#javaAttackIndicatorV144.full .javaAttackFullV144{display:block!important}
@media (orientation:landscape) and (max-height:520px){#javaAttackIndicatorV144{transform:translateX(-50%) scale(1.15)!important;top:calc(50% + 10px)!important}}
`;
document.head.appendChild(hudStyle);
function updateAttackHudV1651(){
  const el=document.getElementById('javaAttackIndicatorV144'),combat=game?.combat;if(!el||!combat)return;
  const p=clamp01(combat.cooldownProgressV144?.()??1);el.style.display=game.running&&!game.ui?.screen?'block':'none';el.style.setProperty('--attack-progress',p.toFixed(4));el.style.setProperty('--attack-empty',`${((1-p)*100).toFixed(2)}%`);el.classList.toggle('full',p>=.985);el.classList.toggle('ready',p>=.985);
}

/* -------------------------------------------------------------------------- */
/* JAVA GENERATED ITEMS — one-pixel extrusion, opaque-pixel geometry and a     */
/* near-front first-person transform instead of looking down the thin edge.    */
/* -------------------------------------------------------------------------- */
const generatedGeometryV1651=new Map();
function itemNameV1651(id){try{return javaItemNameV145(id)||''}catch{return String(ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}}
function generatedItemV1651(id){const n=itemNameV1651(id);return /(^|_)(stick|bow|arrow|shears)$/.test(n)||/(sword|pickaxe|_axe|shovel|hoe)$/.test(n)}
async function itemCanvasTextureV1651(id){
  const name=itemNameV1651(id),urls=[`./assets/java/26.1/items/${name}.png`,`./assets/java/items/${name}.png`,`${typeof JAVA_261_RAW!=='undefined'?JAVA_261_RAW:'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/'}items/${name}.png`];let last=null;
  for(const url of urls)try{const bmp=await game.assets.image(url),cv=document.createElement('canvas');cv.width=bmp.width||16;cv.height=bmp.height||16;const cx=cv.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=false;cx.clearRect(0,0,cv.width,cv.height);cx.drawImage(bmp,0,0);bmp.close?.();const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.premultiplyAlpha=false;tex.needsUpdate=true;return{canvas:cv,texture:tex,url,name}}catch(e){last=e}
  throw last||new Error(`missing Java item ${name}`);
}
function onePixelExtrusionV1651(canvas){
  const w=canvas.width,h=canvas.height,cx=canvas.getContext('2d',{willReadFrequently:true}),d=cx.getImageData(0,0,w,h).data,pos=[],nor=[],uv=[],ind=[],scale=.42/Math.max(w,h),depth=scale,ox=-w*scale*.5,oy=-h*scale*.5;
  const opaque=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>24;
  const q=(a,b,c,e,n,t)=>{const base=pos.length/3;for(const v of[a,b,c,e])pos.push(...v);for(let i=0;i<4;i++)nor.push(...n);for(const v of t)uv.push(...v);ind.push(base,base+1,base+2,base,base+2,base+3)};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(!opaque(x,y))continue;const x0=ox+x*scale,x1=x0+scale,y1=-(oy+y*scale),y0=y1-scale,z0=-depth*.5,z1=depth*.5,u0=x/w,u1=(x+1)/w,v1=1-y/h,v0=1-(y+1)/h;
    q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]);q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],[[u1,v0],[u0,v0],[u0,v1],[u1,v1]]);
    if(!opaque(x-1,y))q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],[[u0,v0],[u0,v0],[u0,v1],[u0,v1]]);
    if(!opaque(x+1,y))q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],[[u1,v0],[u1,v0],[u1,v1],[u1,v1]]);
    if(!opaque(x,y-1))q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],[[u0,v1],[u1,v1],[u1,v1],[u0,v1]]);
    if(!opaque(x,y+1))q([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],[[u0,v0],[u1,v0],[u1,v0],[u0,v0]]);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
function generatedRootV1651(id,{viewModel=false}={}){
  const root=new THREE.Group();root.userData.itemId=id;root.userData.v1651GeneratedItem=true;
  (async()=>{try{const{canvas,texture,url,name}=await itemCanvasTextureV1651(id);let geo=generatedGeometryV1651.get(name);if(!geo){geo=onePixelExtrusionV1651(canvas);generatedGeometryV1651.set(name,geo)}const mat=new THREE.MeshLambertMaterial({map:texture,color:0xffffff,side:THREE.DoubleSide,transparent:false,alphaTest:.10,depthTest:!viewModel,depthWrite:!viewModel,toneMapped:!viewModel,fog:!viewModel});const mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=viewModel?2502:30;mesh.frustumCulled=!viewModel;mesh.userData.itemId=id;mesh.userData.javaItemTexture=url;mesh.userData.v1651GeneratedItem=true;if(viewModel)mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;root.add(mesh)}catch(e){window.__voxelDiag?.log?.(`V16.5.1 ITEM ${itemNameV1651(id)}: ${e.message}`,'warn')}})();return root;
}
if(typeof StudioDropVisualFactoryV6!=='undefined'){
  const dropCreateBaseV1651=StudioDropVisualFactoryV6.prototype.create;
  StudioDropVisualFactoryV6.prototype.create=function(id){if(generatedItemV1651(id))return generatedRootV1651(id,{viewModel:false});return dropCreateBaseV1651.call(this,id)};
}
if(typeof HeldItemFactoryV8!=='undefined'){
  const heldCreateBaseV1651=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.create=function(id){if(generatedItemV1651(id))return generatedRootV1651(id,{viewModel:true});return heldCreateBaseV1651.call(this,id)};
  HeldItemFactoryV8.prototype.flat=function(id){return generatedRootV1651(id,{viewModel:true})};
}
if(typeof FirstPersonViewV7!=='undefined'){
  const makeItemBaseV1651=FirstPersonViewV7.prototype.makeItem;
  FirstPersonViewV7.prototype.makeItem=function(id,left=false){
    const root=makeItemBaseV1651.call(this,id,left);if(!root||!generatedItemV1651(id))return root;
    root.position.set(left?-.52:.52,-.40,-.76);root.rotation.set(-.22,left?.08:-.08,left?-.25:.25);root.scale.setScalar(1.12);root.userData.v1651FrontFacing=true;return root;
  };
}

/* -------------------------------------------------------------------------- */
/* INVENTORY BLOCKS — authoritative top/front/right Java 26.1 faces.          */
/* -------------------------------------------------------------------------- */
const cubeSpecV1651=new Map([
  [ITEM.GRASS,{top:'grass_block_top',front:'grass_block_side',right:'grass_block_side',tint:'grass',overlay:'grass_block_side_overlay'}],
  [ITEM.DIRT,{all:'dirt'}],[ITEM.STONE,{all:'stone'}],[ITEM.SAND,{all:'sand'}],[ITEM.GRAVEL,{all:'gravel'}],
  [ITEM.OAK_LOG,{top:'oak_log_top',front:'oak_log',right:'oak_log'}],[ITEM.OAK_LEAVES,{all:'oak_leaves',tint:'leaves'}],[ITEM.OAK_PLANKS,{all:'oak_planks'}],
  [ITEM.COBBLESTONE,{all:'cobblestone'}],[ITEM.GLASS,{all:'glass',glass:true}],[ITEM.COAL_ORE,{all:'coal_ore'}],[ITEM.IRON_ORE,{all:'iron_ore'}],[ITEM.DIAMOND_ORE,{all:'diamond_ore'}],
  [ITEM.CRAFTING_TABLE,{top:'crafting_table_top',front:'crafting_table_front',right:'crafting_table_side'}],[ITEM.BRICKS,{all:'bricks'}],[ITEM.OBSIDIAN,{all:'obsidian'}],[ITEM.SNOW,{all:'snow'}],[ITEM.GLOWSTONE,{all:'glowstone'}],
  [ITEM.FURNACE,{top:'furnace_top',front:'furnace_front',right:'furnace_side'}],[ITEM.TNT,{top:'tnt_top',front:'tnt_side',right:'tnt_side'}]
]);try{if(typeof V8_ITEM!=='undefined'&&V8_ITEM.WHITE_WOOL!=null)cubeSpecV1651.set(V8_ITEM.WHITE_WOOL,{all:'white_wool'})}catch{}
const cubeStyle=document.createElement('style');cubeStyle.id='v1651InventoryCubes';cubeStyle.textContent=`
.javaCubeItemV1651{position:absolute;left:50%;top:50%;width:19px;height:19px;transform-style:preserve-3d;transform:translate(-50%,-54%) rotateX(-28deg) rotateY(43deg);pointer-events:none;z-index:3}
.javaCubeFaceV1651{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;transform-origin:center;backface-visibility:hidden}
.javaCubeTopV1651{transform:rotateX(90deg) translateZ(9.5px);filter:brightness(1.04)}.javaCubeFrontV1651{transform:translateZ(9.5px);filter:brightness(.90)}.javaCubeRightV1651{transform:rotateY(90deg) translateZ(9.5px);filter:brightness(.76)}
.javaCubeOverlayV1651{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated}.javaCubeGlassV1651 .javaCubeFaceV1651{filter:none}.inv-slot .stack-count{z-index:8!important}
`;
document.head.appendChild(cubeStyle);
function tintCssV1651(kind){let c=null;try{const p=game?.player?.position||{x:0,z:0};c=javaBiomeTintV145?.(game?.world,p.x||0,p.z||0,kind)}catch{}if(!Array.isArray(c))c=kind==='leaves'?[.47,.67,.18]:[.57,.74,.35];return`rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`}
function faceV1651(cls,stem,tint=null,overlay=null){if(!stem)return'';const bg=`url('./assets/java/26.1/blocks/${stem}.png')`,tc=tint?tintCssV1651(tint):'',style=`background-image:${bg}${tc?`;background-color:${tc};background-blend-mode:multiply`:''}`,ov=overlay?`<span class="javaCubeOverlayV1651" style="background-image:url('./assets/java/26.1/blocks/${overlay}.png');background-color:${tintCssV1651('grass')};background-blend-mode:multiply"></span>`:'';return`<i class="javaCubeFaceV1651 ${cls}" style="${style}">${ov}</i>`}
function cubeHtmlV1651(s){const top=s.top||s.all,front=s.front||s.all,right=s.right||s.all,sideTint=s.overlay?null:s.tint;return`<span class="javaCubeItemV1651${s.glass?' javaCubeGlassV1651':''}">${faceV1651('javaCubeTopV1651',top,s.tint)}${faceV1651('javaCubeFrontV1651',front,sideTint,s.overlay)}${faceV1651('javaCubeRightV1651',right,sideTint,s.overlay)}</span>`}
if(typeof UI!=='undefined'&&typeof UI.prototype.slotHtml==='function'){
  const slotHtmlBaseV1651=UI.prototype.slotHtml;
  UI.prototype.slotHtml=function(prefix,s,i=-1){if(!s||s.empty?.())return slotHtmlBaseV1651.call(this,prefix,s,i);const spec=cubeSpecV1651.get(s.id);if(!spec)return slotHtmlBaseV1651.call(this,prefix,s,i);const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'';return`<div class="inv-slot java3DBlockSlotV1651" data-slot="${prefix}" title="${label}">${cubeHtmlV1651(spec)}${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`};
}

/* -------------------------------------------------------------------------- */
/* CLOUDS — fixed Java altitude, X/Z player anchor, tiled pixels, no Y pinning */
/* -------------------------------------------------------------------------- */
function repairCloudsV1651(){
  const layer=game?.cloudsV13,mesh=layer?.mesh;if(!mesh||!game?.player)return;
  const javaCloudY=192,engineCloudY=(window.fromJavaYV165?.(javaCloudY)??(javaCloudY+64));
  mesh.position.y=engineCloudY;mesh.position.x=Math.round(game.player.position.x/32)*32;mesh.position.z=Math.round(game.player.position.z/32)*32;mesh.visible=true;mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;
  if(mesh.material){mesh.material.depthWrite=false;mesh.material.side=THREE.DoubleSide;mesh.material.transparent=true;mesh.material.alphaTest=.08;mesh.material.toneMapped=false}
  if(layer.texture){layer.texture.wrapS=layer.texture.wrapT=THREE.RepeatWrapping;layer.texture.repeat.set(4,4)}
  if(!mesh.userData.v1651CloudGeometry){const old=mesh.geometry;mesh.geometry=new THREE.PlaneGeometry(512,512,1,1);old?.dispose?.();mesh.userData.v1651CloudGeometry=true}
  let mode='Fancy';try{mode=typeof v15Prefs==='function'?(v15Prefs()?.clouds||mode):mode}catch{}if(String(mode).toLowerCase()==='off'||!game.running||document.hidden)mesh.visible=false;
  window.__v1651CloudState={javaY:javaCloudY,engineY:engineCloudY,repeat:layer.texture?.repeat?.toArray?.()||[4,4],visible:mesh.visible};
}

/* -------------------------------------------------------------------------- */
/* PROCEDURAL FORWARD + INVERSE KINEMATICS                                    */
/* -------------------------------------------------------------------------- */
function solveTwoBoneV1651(forward,down,l1=.75,l2=.75){
  const d=Math.max(.001,Math.min(l1+l2-.001,Math.hypot(forward,down))),cosK=clamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1),knee=Math.PI-Math.acos(cosK),cosH=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),base=Math.atan2(forward,Math.max(.001,down)),hip=base-Math.acos(cosH);return{hip,knee,distance:d};
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function boneByV1651(controller,...names){if(!controller?.bones)return null;for(const wanted of names){const wn=normName(wanted);for(const [name,b]of controller.bones)if(normName(name)===wn)return b}return null}
function bindRotV1651(controller,bone){if(!bone)return null;for(const [name,b] of controller.bones||[])if(b===bone){const bind=controller.bind?.get?.(name);if(bind?.rotation)return bind.rotation}return null}
function footGroundDeltaV1651(world,p,yaw,side,phase){
  if(!world||!p)return 0;const lateral=.13*side,forward=.12*Math.sin(phase),x=p.x+Math.cos(yaw)*lateral-Math.sin(yaw)*forward,z=p.z-Math.sin(yaw)*lateral-Math.cos(yaw)*forward,fy=p.y;let top=null;
  for(let y=Math.floor(fy+.4);y>=Math.floor(fy-1.35);y--){const id=world.getLoaded(Math.floor(x),y,Math.floor(z));if(SOLID_BLOCKS.has(id)){top=y+1;break}}
  return top==null?0:clamp(top-fy,-.35,.35);
}
function applyHumanoidKinematicsV1651(controller,state,age,distance,dt,world){
  if(!controller?.bones||!state)return false;const velocity=state.velocity||{x:0,z:0},speed=Math.hypot(velocity.x||0,velocity.z||0),moving=clamp01(speed/Math.max(1,Number(ENGINE.PLAYER_RUN)||5.6)),ground=!!state.onGround,crouch=!!state.crouchingV12,swim=!!state.inWaterV8||!!state.swimmingV165,flying=!!state.flying;if(crouch||swim||flying)return false;
  const rightLeg=boneByV1651(controller,'rightleg','leg1','right_leg'),leftLeg=boneByV1651(controller,'leftleg','leg0','left_leg'),rightArm=boneByV1651(controller,'rightarm','arm1','right_arm'),leftArm=boneByV1651(controller,'leftarm','arm0','left_arm');if(!rightLeg&&!leftLeg&&!rightArm&&!leftArm)return false;
  const phase=(Number(distance)||0)*4.2,amount=ground?moving:Math.min(.28,moving),wave=Math.cos(phase*.6662)*1.4*amount,a=smoothAlpha(18,dt);
  const setX=(bone,delta)=>{if(!bone)return;const bind=bindRotV1651(controller,bone),base=bind?.x??0;bone.rotation.x=lerp(bone.rotation.x,base+delta,a)};
  const pos=state.position||state.pos||game?.player?.position,yaw=Number(state.yaw)||0,rd=footGroundDeltaV1651(world,pos,yaw,1,phase),ld=footGroundDeltaV1651(world,pos,yaw,-1,phase+Math.PI);
  const rLower=boneByV1651(controller,'rightlowerleg','rightshin','right_lower_leg'),lLower=boneByV1651(controller,'leftlowerleg','leftshin','left_lower_leg');
  let rHip=wave,lHip=-wave,rKnee=0,lKnee=0;
  if(rLower){const target=solveTwoBoneV1651(Math.sin(phase)*.16*amount,.92-rd,.48,.48);rHip=clamp(target.hip,-1.45,1.45);rKnee=clamp(target.knee,0,1.45)}else rHip+=rd*.42;
  if(lLower){const target=solveTwoBoneV1651(Math.sin(phase+Math.PI)*.16*amount,.92-ld,.48,.48);lHip=clamp(target.hip,-1.45,1.45);lKnee=clamp(target.knee,0,1.45)}else lHip+=ld*.42;
  setX(rightLeg,rHip);setX(leftLeg,lHip);setX(rightArm,-wave*.72);setX(leftArm,wave*.72);setX(rLower,rKnee);setX(lLower,lKnee);
  const body=boneByV1651(controller,'body','torso');if(body){const bind=bindRotV1651(controller,body),base=bind?.z??0;body.rotation.z=lerp(body.rotation.z,base+clamp((rd-ld)*.12,-.055,.055),a)}
  return true;
}
window.MinecraftKinematicsV1651={solveTwoBone:solveTwoBoneV1651,applyHumanoid:applyHumanoidKinematicsV1651};
if(typeof PlayerEntityRendererV12!=='undefined'){
  const updatePlayerBaseV1651=PlayerEntityRendererV12.prototype.updateOne;
  PlayerEntityRendererV12.prototype.updateOne=function(avatar,state,dt){const r=updatePlayerBaseV1651.call(this,avatar,state,dt);const p=state.player||this.game.player;applyHumanoidKinematicsV1651(avatar?.controller,p,avatar?.age||0,avatar?.distance||0,dt,this.game.world);return r};
}
if(typeof MobSystem!=='undefined'){
  const mobUpdateBaseV1651=MobSystem.prototype.update;
  MobSystem.prototype.update=function(dt,player){const r=mobUpdateBaseV1651.call(this,dt,player);for(const m of this.mobs||[]){if(!m?.animationController||!m?.position||m.position.distanceTo(player.position)>48)continue;if(!['zombie','skeleton','enderman'].includes(m.type))continue;applyHumanoidKinematicsV1651(m.animationController,m,m.age||0,m.distanceWalked||0,dt,this.world)}return r};
}

/* Third-person camera collision can collapse to the player's skull. Hide the  */
/* local avatar only while the camera is inside that near field.               */
if(typeof PlayerCameraV12!=='undefined'){
  const cameraApplyBaseV1651=PlayerCameraV12.prototype.apply;
  PlayerCameraV12.prototype.apply=function(player,camera){const r=cameraApplyBaseV1651.call(this,player,camera),avatar=this.game?.playerEntitiesV12?.local?.root;if(avatar){if(this.mode===0)avatar.visible=false;else{const eye=player.crouchingV12?1.18:1.48,target=new THREE.Vector3(player.position.x,player.position.y+eye,player.position.z);avatar.visible=camera.position.distanceTo(target)>.72}}return r};
}

/* -------------------------------------------------------------------------- */
/* BOOT / UPDATE                                                              */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'){
  const loadSaveBaseV1651=Game.prototype.loadSave;
  Game.prototype.loadSave=function(data){this.__loadedModernSaveV1651=!!(data?.worldFormatV165===2);return loadSaveBaseV1651.call(this,data)};
  const bootBaseV1651=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const r=await bootBaseV1651.apply(this,args),purged=purgeLegacyChunksV1651(this);
    const p=this.player?.position;if(p){const cp=this.world.worldToChunk(Math.floor(p.x),Math.floor(p.z));for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)this.world.ensureChunk(cp.cx+dx,cp.cz+dz)}
    const moved=safePlayerPositionV1651(this,false);this.world.markAllForRebuild?.();this.firstPersonV7?.refresh?.();repairCloudsV1651();updateAttackHudV1651();
    window.__voxelDiag?.log?.(`V16.5.1 PLAYER/HUD: purged ${purged} legacy chunks${moved?', repaired player spawn':''}; centered Java cooldown, front-facing generated items, FK/IK and Java cloud altitude active.`,'ok');return r;
  };
  const updateBaseV1651=Game.prototype.update;
  Game.prototype.update=function(dt){const r=updateBaseV1651.call(this,dt);updateAttackHudV1651();repairCloudsV1651();return r};
}

try{runtimeCommands.register('v1651',()=>({build:BUILD,world:{chunks:game?.world?.chunks?.size||0,legacy:[...(game?.world?.chunks?.values?.()||[])].filter(c=>!modernChunkV1651(c)).length,player:game?.player?.position?.toArray?.(),javaY:game?.player?.position?window.toJavaYV165?.(game.player.position.y):null},camera:{mode:game?.cameraV12?.mode,avatarVisible:game?.playerEntitiesV12?.local?.root?.visible},attack:{progress:game?.combat?.cooldownProgressV144?.()??null,indicator:!!document.getElementById('javaAttackIndicatorV144')},clouds:window.__v1651CloudState||null,kinematics:'Minecraft-style FK + analytical 2-bone IK/fallback foot contact',itemFacing:'front-facing one-pixel Java extrusion'}),'Inspect V16.5.1 player/render/kinematics fixes.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.16.5.1-player-render-kinematics';
})();
