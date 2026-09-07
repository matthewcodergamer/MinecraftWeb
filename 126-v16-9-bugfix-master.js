/* Minecraft Web V16.9 — master bugfix: spawn gate, HUD centering, Java held items, leaf tint. */
(function(){
'use strict';

const BUILD='0.16.9';
const JAVA_BLOCK_ROOT='./assets/java/26.1/blocks/';
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));

/* -------------------------------------------------------------------------- */
/* HUD + INVENTORY CENTERING                                                   */
/* -------------------------------------------------------------------------- */
const style=document.createElement('style');
style.id='v169MasterBugfixStyle';
style.textContent=`
#xpHudV12{
  left:auto!important;
  right:auto!important;
  inset-inline:auto!important;
  margin-left:auto!important;
  margin-right:auto!important;
  justify-self:center!important;
  align-self:center!important;
}
#javaAttackIndicatorV144{
  position:fixed!important;
  left:50%!important;
  right:auto!important;
  top:calc(50% + 12px)!important;
  bottom:auto!important;
  margin:0!important;
  transform:translateX(-50%) scale(1.15)!important;
  transform-origin:50% 0!important;
  z-index:560!important;
  pointer-events:none!important;
}
.javaCubeItemV163{transform:translate(-50%,-50%) rotateX(-28deg) rotateY(43deg)!important}
.javaCubeItemV1651{transform:translate(-50%,-50%) rotateX(-28deg) rotateY(43deg)!important}
.javaCubeItemV1671{transform:translate(-50%,-50%) rotateX(-29deg) rotateY(44deg)!important}
.inv-slot{position:relative!important}
.inv-slot>.item-icon{
  position:absolute!important;
  left:50%!important;
  top:50%!important;
  right:auto!important;
  bottom:auto!important;
  transform:translate(-50%,-50%)!important;
  margin:0!important;
  max-width:84%!important;
  max-height:84%!important;
  object-fit:contain!important;
  image-rendering:pixelated!important;
  pointer-events:none!important;
}
@media (orientation:landscape) and (max-height:520px){
  #javaAttackIndicatorV144{
    top:calc(50% + 10px)!important;
    transform:translateX(-50%) scale(1.05)!important;
  }
}
`;
document.head.appendChild(style);

function reparentAttackHudV169(){
  const el=document.getElementById('javaAttackIndicatorV144');
  const hud=document.getElementById('hud');
  if(el&&hud&&el.parentElement!==hud)hud.appendChild(el);
}

/* -------------------------------------------------------------------------- */
/* TORCH — one local Java texture, thin Java model, no white async state       */
/* -------------------------------------------------------------------------- */
function torchGeometryV169(){
  const p=[],n=[],uv=[],idx=[];
  const x0=-1/16,x1=1/16,y0=0,y1=10/16,z0=-1/16,z1=1/16;
  const face=(verts,no,rect)=>{
    const b=p.length/3;
    for(const q of verts)p.push(...q);
    for(let i=0;i<4;i++)n.push(...no);
    const [u0,v0,u1,v1]=rect.map(v=>v/16);
    for(const q of [[u0,1-v1],[u1,1-v1],[u1,1-v0],[u0,1-v0]])uv.push(...q);
    idx.push(b,b+1,b+2,b,b+2,b+3);
  };
  face([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[0,0,-1],[7,6,9,16]);
  face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],[7,6,9,16]);
  face([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[-1,0,0],[7,6,9,16]);
  face([[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[1,0,0],[7,6,9,16]);
  face([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[0,1,0],[7,6,9,8]);
  face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],[7,13,9,15]);
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

let torchTexturePromiseV169=null;
async function loadTorchTextureV169(){
  if(torchTexturePromiseV169)return torchTexturePromiseV169;
  torchTexturePromiseV169=(async()=>{
    let last=null;
    for(const url of [`${JAVA_BLOCK_ROOT}torch.png`,'./assets/java/blocks/torch.png']){
      try{
        const bmp=await game.assets.image(url);
        const cv=document.createElement('canvas');
        cv.width=bmp.width||16;cv.height=bmp.height||16;
        const cx=cv.getContext('2d',{willReadFrequently:true});
        cx.imageSmoothingEnabled=false;
        cx.clearRect(0,0,cv.width,cv.height);
        cx.drawImage(bmp,0,0);
        bmp.close?.();
        const tex=new THREE.CanvasTexture(cv);
        tex.colorSpace=THREE.SRGBColorSpace;
        tex.magFilter=THREE.NearestFilter;
        tex.minFilter=THREE.NearestFilter;
        tex.generateMipmaps=false;
        tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
        tex.premultiplyAlpha=false;
        tex.needsUpdate=true;
        tex.userData={sourceURL:url,v169:true};
        return tex;
      }catch(e){last=e}
    }
    throw last||new Error('Java torch texture unavailable');
  })();
  return torchTexturePromiseV169;
}

function javaTorchV169({viewModel=false,dropped=false}={}){
  const root=new THREE.Group();
  root.userData.itemId=ITEM.TORCH;
  root.userData.javaTorchV169=true;
  const mat=viewModel
    ?new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.045,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,fog:false})
    :new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,alphaTest:.045,side:THREE.DoubleSide,depthTest:true,depthWrite:true,toneMapped:true,fog:true,emissive:new THREE.Color(0x261202),emissiveIntensity:.08});
  const mesh=new THREE.Mesh(torchGeometryV169(),mat);
  mesh.position.y=-.3125;
  mesh.visible=false;
  mesh.renderOrder=viewModel?2506:31;
  mesh.frustumCulled=!viewModel;
  mesh.userData.itemId=ITEM.TORCH;
  mesh.userData.javaTorchV169=true;
  if(viewModel)mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;
  root.add(mesh);
  if(dropped)root.scale.setScalar(.42);

  loadTorchTextureV169().then(tex=>{
    const live=mesh.material;
    live.map=tex;
    live.color?.set?.(0xffffff);
    live.needsUpdate=true;
    mesh.visible=true;
    mesh.userData.javaItemTexture=tex.userData.sourceURL;
  }).catch(e=>{
    mesh.material.map=null;
    mesh.material.color?.set?.(0x8b5a2b);
    mesh.material.needsUpdate=true;
    mesh.visible=true;
    window.__voxelDiag?.log?.(`V16.9 TORCH fallback: ${e.message}`,'warn');
  });
  return root;
}

if(typeof HeldItemFactoryV8!=='undefined'){
  const heldCreateBaseV169=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.torch=function(){return javaTorchV169({viewModel:true})};
  HeldItemFactoryV8.prototype.create=function(id){
    if(id===ITEM.TORCH)return javaTorchV169({viewModel:true});
    return heldCreateBaseV169.call(this,id);
  };
}
if(typeof StudioDropVisualFactoryV6!=='undefined'){
  const dropCreateBaseV169=StudioDropVisualFactoryV6.prototype.create;
  StudioDropVisualFactoryV6.prototype.create=function(id){
    if(id===ITEM.TORCH)return javaTorchV169({viewModel:false,dropped:true});
    return dropCreateBaseV169.call(this,id);
  };
}

/* -------------------------------------------------------------------------- */
/* FIRST PERSON — camera-facing generated tool, grip intersects visible palm   */
/* -------------------------------------------------------------------------- */
function itemStemV169(id){
  try{return String(javaItemNameV145?.(id)||ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}
  catch{return''}
}
function generatedToolV169(id){
  return /pickaxe|sword|(^|_)axe$|shovel|hoe|stick|bow|arrow|shears/.test(itemStemV169(id));
}
function normalizeToolMeshV169(root,id){
  if(!root||!generatedToolV169(id))return;
  root.traverse?.(o=>{
    if(!o.isMesh)return;
    o.frustumCulled=false;
    o.renderOrder=2506;
    o.layers?.set?.(1);
    if(o.userData?.v1651GeneratedItem){
      o.position.set(0,0,0);
      o.rotation.set(0,0,0);
    }
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){
      if(!m)continue;
      m.depthTest=false;
      m.depthWrite=false;
      m.fog=false;
      m.toneMapped=false;
      if('alphaTest'in m)m.alphaTest=Math.max(.045,Number(m.alphaTest)||0);
    }
  });
}
if(typeof FirstPersonViewV7!=='undefined'){
  const makeItemBaseV169=FirstPersonViewV7.prototype.makeItem;
  FirstPersonViewV7.prototype.makeItem=function(id,left=false){
    const root=makeItemBaseV169.call(this,id,left);
    if(!root)return root;
    const s=left?-1:1;
    if(id===ITEM.TORCH){
      root.position.set(.300*s,-.395,-.675);
      root.rotation.set(-.12,.045*s,-.105*s);
      root.scale.setScalar(.42);
      root.userData.v169Grip='torch';
    }else if(generatedToolV169(id)){
      root.position.set(.300*s,-.395,-.680);
      root.rotation.set(-.15,.065*s,-.125*s);
      root.scale.setScalar(1.04);
      root.userData.v169Grip='tool';
      normalizeToolMeshV169(root,id);
      requestAnimationFrame(()=>normalizeToolMeshV169(root,id));
      setTimeout(()=>normalizeToolMeshV169(root,id),120);
    }
    return root;
  };
}

/* -------------------------------------------------------------------------- */
/* LEAVES — biome foliage tint stays authoritative, with Java temperate fallback */
/* -------------------------------------------------------------------------- */
function foliageTintV169(world,x,z){
  try{
    const t=javaBiomeTintV145?.(world,x,z,'leaves');
    if(Array.isArray(t)&&t.length>=3&&t.every(Number.isFinite))return t;
  }catch{}
  return[0x77/255,0xab/255,0x2f/255];
}
if(typeof ChunkMesher!=='undefined'&&typeof ChunkMesher.prototype.addQuad==='function'){
  const addQuadBaseV169=ChunkMesher.prototype.addQuad;
  ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){
    const before=colors.length;
    const id=this.currentBlock;
    const result=addQuadBaseV169.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);
    if(id===BLOCK.OAK_LEAVES&&colors.length>=before+12){
      const t=foliageTintV169(this.world,x,z);
      for(let i=0;i<4;i++){
        const o=before+i*3;
        colors[o]=t[0];colors[o+1]=t[1];colors[o+2]=t[2];
      }
    }
    return result;
  };
}

/* -------------------------------------------------------------------------- */
/* WORLD SPAWN GATE — data + local chunk mesh must exist before gravity release */
/* -------------------------------------------------------------------------- */
function ensureSpawnNeighborhoodV169(g,r=1){
  const w=g?.world,p=g?.player?.position,rr=g?.renderer;
  if(!w||!p)return 0;
  const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));
  let made=0;
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    try{
      const c=w.ensureChunk(cp.cx+dx,cp.cz+dz);
      if(c){
        made++;
        const key=chunkKey(c.cx,c.cz);
        if(rr&&!rr.chunkMeshes?.has?.(key))rr.attachChunk?.(c);
      }
    }catch{}
  }
  return made;
}
function chunkMeshReadyV169(g,cx,cz){
  const rr=g?.renderer,w=g?.world;
  if(!rr||!w?.getChunk?.(cx,cz))return false;
  const key=chunkKey(cx,cz);
  if(rr.chunkMeshes?.get?.(key))return true;
  const vis=rr.sectionVisibilityV146;
  if(vis?.nodes){
    for(const n of vis.nodes.values())if(n.mesh&&n.cx===cx&&n.cz===cz)return true;
  }
  return false;
}
function scanSurfaceV169(w,x,z){
  const lava=window.V165_BLOCK?.LAVA??-999;
  for(let y=382;y>=1;y--){
    const id=w.getLoaded?.(x,y,z);
    if(!SOLID_BLOCKS.has(id)||id===BLOCK.WATER||id===lava)continue;
    if(w.getLoaded?.(x,y+1,z)!==BLOCK.AIR||w.getLoaded?.(x,y+2,z)!==BLOCK.AIR)continue;
    return new THREE.Vector3(x+.5,y+1.02,z+.5);
  }
  return null;
}
function findMeshedSurfaceV169(g,radius=12){
  const p=g?.player?.position,w=g?.world;
  if(!p||!w)return null;
  const x0=Math.floor(p.x),z0=Math.floor(p.z);
  for(let r=0;r<=radius;r++){
    for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
      if(r&&Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
      const x=x0+dx,z=z0+dz,cp=w.worldToChunk(x,z);
      if(!chunkMeshReadyV169(g,cp.cx,cp.cz))continue;
      const s=scanSurfaceV169(w,x,z);
      if(s)return s;
    }
  }
  return null;
}
function localRenderReadyV169(g){
  const p=g?.player?.position,w=g?.world,rr=g?.renderer;
  if(!p||!w||!rr)return false;
  const cp=w.worldToChunk(Math.floor(p.x),Math.floor(p.z));
  let data=0,meshes=0;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
    if(w.getChunk?.(cp.cx+dx,cp.cz+dz))data++;
    if(chunkMeshReadyV169(g,cp.cx+dx,cp.cz+dz))meshes++;
  }
  return data>=7&&meshes>=3&&chunkMeshReadyV169(g,cp.cx,cp.cz);
}
function putPlayerOnSurfaceV169(g,s){
  if(!s||!g?.player)return false;
  g.player.position.copy(s);
  g.player.velocity?.set?.(0,0,0);
  g.player.onGround=false;
  g.player.updateCamera?.(g.renderer?.camera);
  g.playerEntitiesV12?.local?.root?.position?.copy?.(s);
  g.playerEntitiesV12?.local?.lastPos?.copy?.(s);
  return true;
}
function beginSpawnGateV169(g,fresh){
  g.__spawnGateV169={
    active:true,
    fresh:!!fresh,
    started:performance.now(),
    holdY:Number.isFinite(g.player?.position?.y)?g.player.position.y:null
  };
  try{g.setLoading?.(true,91,fresh?'Preparing spawn area…':'Loading nearby terrain…')}catch{}
}
async function finishSpawnGateV169(g,fresh){
  const gate=g.__spawnGateV169;
  if(!gate?.active)return;
  const timeout=fresh?9000:4500;
  const deadline=performance.now()+timeout;
  let stable=0,surface=null;
  while(performance.now()<deadline){
    ensureSpawnNeighborhoodV169(g,1);
    if(localRenderReadyV169(g)){
      surface=findMeshedSurfaceV169(g,12);
      if(surface)stable++;else stable=0;
    }else stable=0;
    const elapsed=timeout-Math.max(0,deadline-performance.now());
    const pct=Math.min(99,92+Math.floor((elapsed/timeout)*7));
    try{g.setLoading?.(true,pct,stable?'Joining world…':'Building nearby terrain…')}catch{}
    if(stable>=3&&surface)break;
    await nextFrame();
  }
  if(!surface){
    ensureSpawnNeighborhoodV169(g,2);
    surface=findMeshedSurfaceV169(g,18);
  }
  if(!surface){
    try{
      const fallback=g.world?.findSpawn?.();
      if(fallback&&Number.isFinite(fallback.y))surface=fallback.clone?.()||fallback;
    }catch{}
  }
  if(surface)putPlayerOnSurfaceV169(g,surface);
  ensureSpawnNeighborhoodV169(g,1);
  try{g.renderer?.sectionVisibilityV146?.apply?.()}catch{}
  await nextFrame();
  await nextFrame();
  gate.active=false;
  g.__spawnGateV169=null;
  try{g.setLoading?.(false,100,'Ready')}catch{}
}

/* -------------------------------------------------------------------------- */
/* SUN — intentionally preserve camera-translation/infinite-distance behavior. */
/* The orbit direction remains world/dayClock based; looking around does not    */
/* rotate the sun with the camera.                                              */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* GAME WRAPS                                                                  */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'){
  const bootBaseV169=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const fresh=!!args[1];
    beginSpawnGateV169(this,fresh);
    let result;
    try{
      result=await bootBaseV169.apply(this,args);
      reparentAttackHudV169();
      await finishSpawnGateV169(this,fresh);
      this.firstPersonV7?.refresh?.();
      window.__voxelDiag?.log?.('V16.9 READY: meshed spawn gate, centered HUD/inventory, local Java torch and centered generated-tool grip active.','ok');
      return result;
    }catch(e){
      if(this.__spawnGateV169)this.__spawnGateV169.active=false;
      this.__spawnGateV169=null;
      throw e;
    }
  };

  const updateBaseV169=Game.prototype.update;
  Game.prototype.update=function(dt){
    const gate=this.__spawnGateV169;
    if(gate?.active&&this.player){
      if(gate.holdY==null&&Number.isFinite(this.player.position?.y))gate.holdY=this.player.position.y;
      this.player.velocity?.set?.(0,0,0);
    }
    const r=updateBaseV169.call(this,dt);
    if(gate?.active&&this.player){
      this.player.velocity?.set?.(0,0,0);
      if(Number.isFinite(gate.holdY)&&!localRenderReadyV169(this)){
        this.player.position.y=gate.holdY;
        this.player.updateCamera?.(this.renderer?.camera);
      }
    }
    reparentAttackHudV169();
    const id=this.selectedStack?.()?.id||0;
    normalizeToolMeshV169(this.firstPersonV7?.rightItem,id);
    return r;
  };
}

window.MINECRAFT_WEB_VERSION=BUILD;
try{
  runtimeCommands.register('v169',()=>({
    build:BUILD,
    spawnGate:!!game?.__spawnGateV169?.active,
    localRenderReady:localRenderReadyV169(game),
    torchTexture:(()=>{let u=null;game?.firstPersonV7?.rightItem?.traverse?.(o=>{if(!u&&o.userData?.javaItemTexture)u=o.userData.javaItemTexture});return u})(),
    heldGrip:game?.firstPersonV7?.rightItem?.userData?.v169Grip||null,
    attackParent:document.getElementById('javaAttackIndicatorV144')?.parentElement?.id||null
  }),'Inspect V16.9 spawn gate, HUD and held-item repairs.');
}catch{}
window.__voxelDiag?.log?.('V16.9 MASTER BUGFIX installed.','ok');
})();
