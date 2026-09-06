/* Minecraft Web V16.7.1 — held-item, inventory drag, block-face and spawn hotfix. */
(function(){
'use strict';
const BUILD='0.16.7.1';
const JAVA_BLOCK_ROOT='./assets/java/26.1/blocks/';

/* Fix the V15.9 drag regression: dropIntoSlot expects stack/source/target. */
if(typeof InventoryTransactionEngine!=='undefined'){
  const resolveBase=InventoryTransactionEngine.prototype.resolve;
  InventoryTransactionEngine.prototype.resolve=function(slot){if(typeof slot!=='string'||!slot.length)return null;return resolveBase.call(this,slot)};
  InventoryTransactionEngine.prototype.end=function(e){
    if(!this.drag||e.pointerId!==this.drag.pointerId)return;
    e.preventDefault();const drag=this.drag;this.drag=null;this.hideGhost();try{screenLayer.releasePointerCapture?.(e.pointerId)}catch{}
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-slot]');
    if(target&&this.game.ui?.screen){const targetSlot=target.dataset.slot;if(typeof targetSlot==='string'&&targetSlot.length)this.dropIntoSlot(drag.stack,drag.slot,targetSlot);return}
    if(drag.moved){const before=this.game.drops?.items?.length||0;this.dropIntoWorld(drag.stack);const after=this.game.drops?.items?.length||0;if(after>before)this.takeFromSource(drag.slot,drag.stack.count);else window.v15ShowToast?.('Too many dropped items nearby.');return}
    this.game.ui?.clickSlot?.(drag.slot);
  };
}

/* Java template_torch geometry (2×10×2 pixels) with the local Java 26.1 PNG. */
function torchGeometryV1671(){
  if(typeof v147TorchGeometry==='function')return v147TorchGeometry();
  const p=[],n=[],uv=[],idx=[],x0=-1/16,x1=1/16,y0=0,y1=10/16,z0=-1/16,z1=1/16;
  const face=(verts,no,rect)=>{const b=p.length/3;for(const q of verts)p.push(...q);for(let i=0;i<4;i++)n.push(...no);const[u0,v0,u1,v1]=rect.map(v=>v/16),t=[[u0,1-v1],[u1,1-v1],[u1,1-v0],[u0,1-v0]];for(const q of t)uv.push(...q);idx.push(b,b+1,b+2,b,b+2,b+3)};
  face([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[0,0,-1],[7,6,9,16]);face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],[7,6,9,16]);
  face([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[-1,0,0],[7,6,9,16]);face([[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[1,0,0],[7,6,9,16]);
  face([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[0,1,0],[7,6,9,8]);face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],[7,13,9,15]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
async function torchTextureV1671(){
  let last=null;for(const url of [`${JAVA_BLOCK_ROOT}torch.png`,'./assets/java/blocks/torch.png'])try{const bmp=await game.assets.image(url),cv=document.createElement('canvas');cv.width=bmp.width||16;cv.height=bmp.height||16;const c=cv.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(bmp,0,0);bmp.close?.();const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.premultiplyAlpha=false;t.needsUpdate=true;t.userData={sourceURL:url};return t}catch(e){last=e}throw last||new Error('torch.png unavailable');
}
function javaTorchV1671({viewModel=false,dropped=false}={}){
  const root=new THREE.Group(),mat=viewModel?new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.045,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,fog:false}):new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,alphaTest:.045,side:THREE.DoubleSide,depthTest:true,depthWrite:true,toneMapped:true,fog:true,emissive:new THREE.Color(0x261202),emissiveIntensity:.08});
  root.userData.itemId=ITEM.TORCH;root.userData.javaTorchV1671=true;
  const mesh=new THREE.Mesh(torchGeometryV1671(),mat);mesh.position.y=-.3125;mesh.renderOrder=viewModel?2504:31;mesh.frustumCulled=!viewModel;mesh.visible=false;mesh.userData.itemId=ITEM.TORCH;mesh.userData.javaTorchV1671=true;if(viewModel)mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;root.add(mesh);if(dropped)root.scale.setScalar(.58);
  torchTextureV1671().then(tex=>{const live=mesh.material;live.map=tex;live.color?.set?.(0xffffff);live.needsUpdate=true;mesh.visible=true;mesh.userData.javaItemTexture=tex.userData.sourceURL}).catch(e=>{const live=mesh.material;live.map=null;live.color?.set?.(0x8b5a2b);live.needsUpdate=true;mesh.visible=true;window.__voxelDiag?.log?.(`V16.7.1 TORCH fallback: ${e.message}`,'warn')});
  return root;
}
if(typeof HeldItemFactoryV8!=='undefined'){
  HeldItemFactoryV8.prototype.torch=function(){return javaTorchV1671({viewModel:true})};
  const heldCreateBase=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.create=function(id){if(id===ITEM.TORCH)return javaTorchV1671({viewModel:true});return heldCreateBase.call(this,id)};
}
if(typeof StudioDropVisualFactoryV6!=='undefined'){
  const dropCreateBase=StudioDropVisualFactoryV6.prototype.create;
  StudioDropVisualFactoryV6.prototype.create=function(id){if(id===ITEM.TORCH)return javaTorchV1671({viewModel:false,dropped:true});return dropCreateBase.call(this,id)};
}
function itemNameV1671(id){try{return javaItemNameV145?.(id)||''}catch{return String(ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}}
function generatedToolV1671(id){const n=itemNameV1671(id);return /(^|_)(stick|bow|arrow|shears)$/.test(n)||/(sword|pickaxe|_axe|shovel|hoe)$/.test(n)}
if(typeof FirstPersonViewV7!=='undefined'){
  const makeItemBase=FirstPersonViewV7.prototype.makeItem;
  if(typeof makeItemBase==='function')FirstPersonViewV7.prototype.makeItem=function(id,left=false){const root=makeItemBase.call(this,id,left);if(!root)return root;if(id===ITEM.TORCH){root.position.set(left?-.41:.41,-.43,-.73);root.rotation.set(-.16,left?.07:-.07,left?-.18:.18);root.scale.setScalar(.68);root.userData.centeredHandV1671=true;return root}if(generatedToolV1671(id)){root.position.set(left?-.43:.43,-.43,-.755);root.rotation.set(-.13,left?.055:-.055,left?-.29:.29);root.scale.setScalar(.97);root.userData.centeredHandV1671=true}return root};
  const refreshBase=FirstPersonViewV7.prototype.refresh;
  if(typeof refreshBase==='function')FirstPersonViewV7.prototype.refresh=function(...args){const r=refreshBase.apply(this,args);const off=this.game?.inventory?.offhand?.id||0;if(this.rightArm)this.rightArm.visible=true;if(this.leftArm)this.leftArm.visible=!!off;return r};
}

/* Proper top/front/right Java block faces in hotbar, inventory and containers. */
const cubeSpecV1671=new Map([
  [ITEM.GRASS,{top:'grass_block_top',front:'grass_block_side',right:'grass_block_side',tint:'grass',overlay:'grass_block_side_overlay'}],[ITEM.DIRT,{all:'dirt'}],[ITEM.STONE,{all:'stone'}],[ITEM.SAND,{all:'sand'}],[ITEM.GRAVEL,{all:'gravel'}],
  [ITEM.OAK_LOG,{top:'oak_log_top',front:'oak_log',right:'oak_log'}],[ITEM.OAK_LEAVES,{all:'oak_leaves',tint:'leaves'}],[ITEM.OAK_PLANKS,{all:'oak_planks'}],[ITEM.COBBLESTONE,{all:'cobblestone'}],[ITEM.GLASS,{all:'glass',glass:true}],
  [ITEM.COAL_ORE,{all:'coal_ore'}],[ITEM.IRON_ORE,{all:'iron_ore'}],[ITEM.DIAMOND_ORE,{all:'diamond_ore'}],[ITEM.CRAFTING_TABLE,{top:'crafting_table_top',front:'crafting_table_front',right:'crafting_table_side'}],[ITEM.BRICKS,{all:'bricks'}],[ITEM.OBSIDIAN,{all:'obsidian'}],[ITEM.SNOW,{all:'snow'}],[ITEM.GLOWSTONE,{all:'glowstone'}],[ITEM.FURNACE,{top:'furnace_top',front:'furnace_front',right:'furnace_side'}],[ITEM.TNT,{top:'tnt_top',front:'tnt_side',right:'tnt_side'}]
]);try{if(typeof V8_ITEM!=='undefined'&&V8_ITEM.WHITE_WOOL!=null)cubeSpecV1671.set(V8_ITEM.WHITE_WOOL,{all:'white_wool'})}catch{}
const style=document.createElement('style');style.id='v1671InventoryBlockFaces';style.textContent=`
.javaCubeItemV1671{position:absolute;left:50%;top:50%;width:18px;height:18px;transform-style:preserve-3d;transform:translate(-50%,-53%) rotateX(-29deg) rotateY(44deg);pointer-events:none;z-index:5}.javaCubeFaceV1671{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;transform-origin:center;backface-visibility:hidden}.javaCubeTopV1671{transform:rotateX(90deg) translateZ(9px);filter:brightness(1.04)}.javaCubeFrontV1671{transform:translateZ(9px);filter:brightness(.90)}.javaCubeRightV1671{transform:rotateY(90deg) translateZ(9px);filter:brightness(.76)}.javaCubeOverlayV1671{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated}.javaCubeGlassV1671 .javaCubeFaceV1671{filter:none;opacity:.82}.inv-slot.java3DBlockSlotV1671{position:relative;overflow:visible!important}.inv-slot.java3DBlockSlotV1671 .stack-count{z-index:9!important}`;document.head.appendChild(style);
function tintCssV1671(kind){let c=null;try{const p=game?.player?.position||{x:0,z:0};c=javaBiomeTintV145?.(game?.world,p.x||0,p.z||0,kind)}catch{}if(!Array.isArray(c))c=kind==='leaves'?[0x77/255,0xab/255,0x2f/255]:[0x91/255,0xbd/255,0x59/255];return`rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`}
function faceV1671(cls,stem,tint=null,overlay=null){if(!stem)return'';const color=tint?tintCssV1671(tint):'',style=`background-image:url('${JAVA_BLOCK_ROOT}${stem}.png')${color?`;background-color:${color};background-blend-mode:multiply`:''}`,ov=overlay?`<span class="javaCubeOverlayV1671" style="background-image:url('${JAVA_BLOCK_ROOT}${overlay}.png');background-color:${tintCssV1671('grass')};background-blend-mode:multiply"></span>`:'';return`<i class="javaCubeFaceV1671 ${cls}" style="${style}">${ov}</i>`}
function cubeHtmlV1671(s){const top=s.top||s.all,front=s.front||s.all,right=s.right||s.all,sideTint=s.overlay?null:s.tint;return`<span class="javaCubeItemV1671${s.glass?' javaCubeGlassV1671':''}">${faceV1671('javaCubeTopV1671',top,s.tint)}${faceV1671('javaCubeFrontV1671',front,sideTint,s.overlay)}${faceV1671('javaCubeRightV1671',right,sideTint,s.overlay)}</span>`}
if(typeof UI!=='undefined'&&typeof UI.prototype.slotHtml==='function'){const slotBase=UI.prototype.slotHtml;UI.prototype.slotHtml=function(prefix,s,i=-1){if(!s||s.empty?.())return slotBase.call(this,prefix,s,i);const spec=cubeSpecV1671.get(s.id);if(!spec)return slotBase.call(this,prefix,s,i);const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'';return`<div class="inv-slot java3DBlockSlotV1671" data-slot="${prefix}" title="${label}">${cubeHtmlV1671(spec)}${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`}};

/* Startup/new-world surface guard. It does not teleport normal cave gameplay. */
function safeSpawnV1671(gameRef,force=false){
  const p=gameRef?.player,w=gameRef?.world;if(!p?.position||!w)return false;const x=Math.floor(p.position.x),z=Math.floor(p.position.z);try{const cp=w.worldToChunk(x,z);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)w.ensureChunk(cp.cx+dx,cp.cz+dz)}catch{}
  let bad=!!force;try{bad=bad||!!p.collidesAt?.(p.position)}catch{}try{const fy=Math.floor(p.position.y+.06),hy=Math.floor(p.position.y+1.55);bad=bad||SOLID_BLOCKS.has(w.getLoaded(x,fy,z))||SOLID_BLOCKS.has(w.getLoaded(x,hy,z))||p.position.y<1||p.position.y>382}catch{}if(!bad)return false;
  let y=-1;try{y=w.highestSolidY(x,z)}catch{}let spawn=null;try{if(y>=0&&w.getLoaded(x,y+1,z)===BLOCK.AIR&&w.getLoaded(x,y+2,z)===BLOCK.AIR)spawn=new THREE.Vector3(x+.5,y+1.03,z+.5)}catch{}if(!spawn)try{spawn=w.findSpawn?.()}catch{}if(!spawn)return false;
  p.position.copy(spawn);p.velocity?.set?.(0,0,0);p.onGround=false;p.updateCamera?.(gameRef.renderer?.camera);gameRef.playerEntitiesV12?.local?.root?.position?.copy?.(spawn);return true;
}
function scheduleSpawnGuardV1671(gameRef,forceFirst=false){for(const ms of [0,120,420,900,1800,3200])setTimeout(()=>{if(!gameRef?.running)return;const moved=safeSpawnV1671(gameRef,forceFirst&&ms===0);if(moved)window.__voxelDiag?.log?.(`V16.7.1 spawn repaired at +${ms}ms`,'warn')},ms)}
if(typeof Game!=='undefined'){
  const bootBase=Game.prototype.boot;Game.prototype.boot=async function(...args){const fresh=!!args[1],r=await bootBase.apply(this,args);scheduleSpawnGuardV1671(this,fresh);return r};
  const newWorldBase=Game.prototype.newWorld;if(typeof newWorldBase==='function')Game.prototype.newWorld=async function(...args){const r=await newWorldBase.apply(this,args);scheduleSpawnGuardV1671(this,true);return r};
}

/* Sky guard: clouds stay drawable; sun remains world-directional. */
function repairSkyV1671(){const rr=game?.renderer,cloud=game?.cloudsV13?.mesh;if(cloud&&game?.player){cloud.visible=true;cloud.frustumCulled=false;cloud.position.x=Math.round(game.player.position.x/32)*32;cloud.position.z=Math.round(game.player.position.z/32)*32;if(cloud.material){cloud.material.depthTest=true;cloud.material.depthWrite=false;cloud.material.opacity=1}}const sun=rr?.squareSunV161?.mesh;if(sun){sun.frustumCulled=false;sun.material.depthTest=true;sun.material.depthWrite=false}}
if(typeof Game!=='undefined'){const updateBase=Game.prototype.update;Game.prototype.update=function(dt){const r=updateBase.call(this,dt);repairSkyV1671();return r}}
try{runtimeCommands.register('v1671',()=>({build:BUILD,dragApi:'stack/source/target guarded',torchPath:game?.firstPersonV7?.rightItem?.userData?.javaTorchV1671?'Java 26.1':'other',sunMode:'world direction + camera translation',sun:window.__v161SunState||null,playerY:Number(game?.player?.position?.y?.toFixed?.(2)||0),cloudVisible:game?.cloudsV13?.mesh?.visible??null}),'Inspect V16.7.1 hotfix.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.16.7.1-hand-inventory-spawn-hotfix';window.__voxelDiag?.log?.('V16.7.1 READY: drag slot crash fixed, Java torch texture/scale fixed, held tools centered, inventory block faces repaired, startup spawn stabilized.','ok');
})();
