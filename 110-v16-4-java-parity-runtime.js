/* Minecraft Web V16.4 — Java parity gameplay/UI/runtime repair pass. */
(function(){
'use strict';
const BUILD='0.16.4';
const v164Clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const v164Lerp=(a,b,t)=>a+(b-a)*t;
const v164Smooth=t=>{t=v164Clamp(t);return t*t*(3-2*t)};
const v164Key=(x,y,z)=>`${x},${y},${z}`;

/* -------------------------------------------------------------------------- */
/* JAVA CONTAINER UI — correct 176x166 slot mapping, responsive scaling, and   */
/* a bounded recipe book that can never be positioned outside the viewport.   */
/* -------------------------------------------------------------------------- */
const recipeTextureV164=(()=>{try{return javaAssetsV144?.recipeBook?.()||''}catch{return''}})();
const uiStyleV164=document.createElement('style');
uiStyleV164.id='v164JavaContainerRepair';
uiStyleV164.textContent=`
#screenLayer.open{overflow:hidden!important}
.javaScreenV145{
  --v164-slot-scale:2;
  position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
  max-width:none!important;max-height:none!important;box-sizing:border-box!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))!important;
  overflow:hidden!important;pointer-events:auto!important
}
.javaContainerV145{
  flex:0 0 auto!important;
  width:min(410px,calc(100dvw - 30px),calc((100dvh - 24px)*1.06024))!important;
  max-width:none!important;height:auto!important;aspect-ratio:176/166!important;
  background-position:center!important;background-size:100% 100%!important;background-repeat:no-repeat!important;
  image-rendering:pixelated!important;transform:none!important;transform-origin:center!important;
  filter:drop-shadow(0 6px 7px #0009)!important
}
.javaSlotV145{box-sizing:border-box!important;overflow:visible!important}
.javaSlotV145>.inv-slot,.javaSlotV145 .inv-slot{
  position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;margin:0!important;padding:1px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
  overflow:visible!important;box-sizing:border-box!important
}
.javaSlotV145 img.item-icon,.javaSlotV145 .item-icon{
  position:relative!important;left:auto!important;top:auto!important;width:84%!important;height:84%!important;
  max-width:84%!important;max-height:84%!important;margin:0!important;object-fit:contain!important;image-rendering:pixelated!important
}
.javaSlotV145 .javaCubeItemV163{
  left:50%!important;top:50%!important;width:19px!important;height:19px!important;
  transform:translate(-50%,-54%) scale(var(--v164-slot-scale)) rotateX(-28deg) rotateY(43deg)!important;
  transform-origin:center!important
}
.javaSlotV145 .stack-count{
  right:0!important;bottom:-1px!important;z-index:20!important;
  font-size:clamp(10px,calc(7px * var(--v164-slot-scale)),18px)!important;line-height:1!important;
  font-family:'Minecraft Seven','Courier New',monospace!important;text-shadow:1px 1px #222,2px 2px #222!important
}
.javaCloseV145{right:-26px!important;top:0!important}
.javaRecipeToggleV145{left:6px!important;top:59px!important;width:22px!important;height:20px!important}
.javaRecipeDrawerV145{
  display:none!important;position:fixed!important;left:8px;top:8px;right:auto!important;
  width:286px;min-width:212px;max-width:calc(100dvw - 16px)!important;
  height:auto;max-height:calc(100dvh - 16px)!important;box-sizing:border-box!important;
  overflow:hidden!important;padding:12px 10px 10px!important;color:#202020!important;
  background:#c6c6c6${recipeTextureV164?` url('${recipeTextureV164}') 0 0/auto 100% no-repeat`:''}!important;
  border:2px solid #373737!important;box-shadow:inset 2px 2px #fff,inset -2px -2px #555,0 5px 8px #0009!important;
  z-index:450!important;image-rendering:pixelated!important
}
.javaScreenV145.recipeOpen .javaRecipeDrawerV145{display:flex!important;flex-direction:column!important}
.javaRecipeDrawerV145 .search{
  flex:0 0 auto!important;width:100%!important;height:30px!important;box-sizing:border-box!important;
  margin:0 0 8px!important;padding:4px 7px!important;background:#111!important;color:#fff!important;
  border:2px solid #707070!important;border-radius:0!important;font:12px/1 'Minecraft Seven','Courier New',monospace!important
}
.javaRecipeDrawerV145 .recipe-book{
  display:grid!important;grid-template-columns:repeat(5,minmax(32px,1fr))!important;
  grid-auto-rows:42px!important;gap:4px!important;align-content:start!important;
  flex:1 1 auto!important;min-height:0!important;max-height:none!important;padding:2px!important;
  overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important
}
.javaRecipeDrawerV145 .recipe-card{
  position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;
  width:100%!important;height:42px!important;min-height:42px!important;padding:2px!important;gap:0!important;
  background:#8b8b8b!important;border:2px solid #373737!important;border-radius:0!important;
  box-shadow:inset 2px 2px #d7d7d7,inset -2px -2px #555!important;color:#fff!important;overflow:hidden!important
}
.javaRecipeDrawerV145 .recipe-card:hover,.javaRecipeDrawerV145 .recipe-card:focus-visible{background:#a9a9a9!important;outline:2px solid #fff!important;outline-offset:-3px!important}
.javaRecipeDrawerV145 .recipe-card.unavailable{filter:grayscale(.75) brightness(.66)!important;opacity:.72!important}
.javaRecipeDrawerV145 .recipe-card img{width:30px!important;height:30px!important;object-fit:contain!important;image-rendering:pixelated!important}
.javaRecipeDrawerV145 .v164RecipeCount{position:absolute;right:3px;bottom:1px;font:11px/1 'Minecraft Seven','Courier New',monospace;color:#fff;text-shadow:1px 1px #222}
.javaRecipeDrawerV145 .v164RecipeName{position:fixed;left:-9999px;top:-9999px}
#titleContent #javaEditionV15{
  width:min(296px,54vw)!important;max-width:62%!important;height:auto!important;
  margin:-20px auto 12px!important;object-fit:contain!important;image-rendering:pixelated!important
}
#loading.v1591WorldLoading,#loading.v15Loading.v1591WorldLoading{
  background-image:linear-gradient(rgba(12,10,8,.24),rgba(12,10,8,.36)),url('./assets/java/26.1/gui/title/background/panorama_0.png')!important;
  background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;image-rendering:auto!important
}
@media(hover:hover) and (pointer:fine){
  .javaContainerV145{width:min(438px,calc(100dvw - 52px),calc((100dvh - 36px)*1.06024))!important}
}
@media(max-width:700px){
  .javaCloseV145{right:0!important;top:-25px!important}
  .javaRecipeDrawerV145{width:min(254px,72dvw)!important}
}
@media(orientation:landscape) and (max-height:520px){
  .javaContainerV145{width:min(392px,calc((100dvh - 18px)*1.06024),calc(100dvw - 22px))!important}
  .javaRecipeDrawerV145{width:min(242px,44dvw)!important;padding:8px!important}
  .javaRecipeDrawerV145 .recipe-book{grid-template-columns:repeat(5,minmax(28px,1fr))!important;grid-auto-rows:36px!important}
  .javaRecipeDrawerV145 .recipe-card{height:36px!important;min-height:36px!important}.javaRecipeDrawerV145 .recipe-card img{width:26px!important;height:26px!important}
  #titleContent #javaEditionV15{width:min(248px,43vw)!important;max-width:58%!important;margin:-14px auto 8px!important}
}
`;
document.head.appendChild(uiStyleV164);

if(typeof UI!=='undefined'&&typeof UI.prototype.recipeCardHtmlV6==='function'){
  UI.prototype.recipeCardHtmlV6=function(recipe,index,size){
    const available=recipeAvailableV6(recipe,size,this.game.inventory),icon=this.game.iconFor(recipe.out.id),count=recipe.out.count>1?recipe.out.count:'';
    return `<button class="recipe-card ${available?'':'unavailable'}" type="button" data-v6-recipe="${index}" title="${recipe.name}${available?'':' — Missing ingredients'}" aria-label="${recipe.name}">${icon?`<img src="${icon}" alt="">`:''}${count?`<span class="v164RecipeCount">${count}</span>`:''}<span class="v164RecipeName">${recipe.name}</span></button>`;
  };
}
function layoutJavaContainerV164(){
  const root=document.querySelector('.javaScreenV145'),box=root?.querySelector('.javaContainerV145'),drawer=root?.querySelector('.javaRecipeDrawerV145');
  if(!root||!box)return;
  const rect=box.getBoundingClientRect(),slotScale=Math.max(1,(rect.width/176)*.78);
  root.style.setProperty('--v164-slot-scale',slotScale.toFixed(4));
  if(!drawer||!root.classList.contains('recipeOpen'))return;
  const vv=window.visualViewport,vw=Math.max(1,vv?.width||innerWidth),vh=Math.max(1,vv?.height||innerHeight),pad=8;
  const preferred=Math.min(286,Math.max(218,vw*.28)),leftRoom=rect.left-pad,rightRoom=vw-rect.right-pad;
  let width=Math.min(preferred,Math.max(leftRoom,rightRoom));
  if(width<205)width=Math.min(254,vw-pad*2);
  const onLeft=leftRoom>=Math.min(preferred,218)||leftRoom>=rightRoom;
  let left=onLeft?rect.left-width-4:rect.right+4;
  if(left<pad||left+width>vw-pad)left=v164Clamp(rect.left+6,pad,Math.max(pad,vw-width-pad));
  const top=v164Clamp(rect.top,pad,Math.max(pad,vh-120)),height=Math.min(rect.height,vh-top-pad);
  drawer.style.left=`${Math.round(left)}px`;drawer.style.top=`${Math.round(top)}px`;drawer.style.width=`${Math.round(width)}px`;drawer.style.height=`${Math.max(146,Math.round(height))}px`;
}
function wireJavaLayoutV164(){requestAnimationFrame(()=>{layoutJavaContainerV164();requestAnimationFrame(layoutJavaContainerV164)})}
if(typeof UI!=='undefined'){
  for(const name of ['renderInventory','renderCrafting']){
    const base=UI.prototype[name];if(typeof base!=='function')continue;
    UI.prototype[name]=function(...args){const out=base.apply(this,args);wireJavaLayoutV164();const toggle=document.getElementById('javaRecipeToggleV145');if(toggle&&!toggle.__v164){toggle.__v164=true;toggle.addEventListener('click',()=>wireJavaLayoutV164(),{passive:true})}return out;};
  }
}
addEventListener('resize',wireJavaLayoutV164,{passive:true});
addEventListener('orientationchange',()=>setTimeout(wireJavaLayoutV164,80),{passive:true});
window.visualViewport?.addEventListener?.('resize',wireJavaLayoutV164,{passive:true});

/* -------------------------------------------------------------------------- */
/* LEAVES — stop the legacy opaque-leaf synthesis from filling transparent     */
/* Java leaf texels with dark pixels. Fancy leaves stay true alpha-cutout.     */
/* -------------------------------------------------------------------------- */
if(typeof AssetResolver!=='undefined'){
  const loadTextureBaseV164=AssetResolver.prototype.loadTexture;
  AssetResolver.prototype.loadTexture=async function(name){
    if(name!=='oak_leaves_opaque')return loadTextureBaseV164.call(this,name);
    if(this.textures.has(name))return this.textures.get(name);
    const cv=document.createElement('canvas');cv.width=cv.height=16;
    this.textures.set(name,cv);this.textureInfo.set(name,{name,url:'v164://transparent-leaf-opaque-helper',source:'FALLBACK',width:16,height:16,role:name});
    return cv;
  };
}
function repairLeavesV164(){
  const m=game?.renderer?.materialLeaves;if(!m)return;
  m.color?.set?.(0xffffff);m.transparent=false;m.opacity=1;m.alphaTest=.10;m.depthTest=true;m.depthWrite=true;m.side=THREE.FrontSide;m.blending=THREE.NormalBlending;m.premultipliedAlpha=false;m.needsUpdate=true;
}

/* -------------------------------------------------------------------------- */
/* DESTROY STAGES — use the grayscale artwork only as an alpha mask. The       */
/* original block color always remains visible; no gray veil is composited.    */
/* -------------------------------------------------------------------------- */
if(typeof MinecraftBreakOverlayV147!=='undefined'){
  MinecraftBreakOverlayV147.prototype.texture=async function(stage){
    stage=clamp(stage|0,0,9);if(this.textures[stage])return this.textures[stage];if(this.pending[stage])return this.pending[stage];
    this.pending[stage]=(async()=>{
      const rel=`blocks/destroy_stage_${stage}.png`,{image,url}=await java261FirstImage(rel),cv=document.createElement('canvas');
      cv.width=image.width||16;cv.height=image.height||16;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(image,0,0);image.close?.();
      const im=ctx.getImageData(0,0,cv.width,cv.height),d=im.data;
      for(let p=0;p<d.length;p+=4){
        const srcA=d[p+3]/255,lum=d[p]*.299+d[p+1]*.587+d[p+2]*.114,ink=v164Clamp((224-lum)/150);
        const a=Math.round(255*srcA*v164Smooth(ink));d[p]=d[p+1]=d[p+2]=8;d[p+3]=a<8?0:a;
      }
      ctx.putImageData(im,0,0);const t=java261CanvasTexture(cv,url);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.premultiplyAlpha=false;t.needsUpdate=true;this.textures[stage]=t;return t;
    })().catch(e=>{window.__voxelDiag?.log?.(`V16.4 BREAK STAGE ${stage}: ${e.message}`,'err');return null}).finally(()=>this.pending[stage]=null);return this.pending[stage];
  };
  const ensureBaseV164=MinecraftBreakOverlayV147.prototype.ensure;
  MinecraftBreakOverlayV147.prototype.ensure=function(){ensureBaseV164.call(this);for(const m of this.materials||[]){m.color.set(0xffffff);m.transparent=true;m.opacity=1;m.alphaTest=.015;m.depthTest=true;m.depthWrite=false;m.blending=THREE.NormalBlending;m.premultipliedAlpha=false;m.polygonOffset=true;m.polygonOffsetFactor=-3;m.polygonOffsetUnits=-3;m.toneMapped=false;m.fog=false;m.needsUpdate=true}if(this.mesh){this.mesh.renderOrder=1300;this.mesh.name='java_destroy_stage_v164_alpha_mask'}};
}

/* -------------------------------------------------------------------------- */
/* WORLD GENERATION — stronger continental/erosion/ridge separation plus      */
/* cheese/worm caves. Keep the existing 96-block world format for save compat. */
/* -------------------------------------------------------------------------- */
if(typeof WorldGenerator!=='undefined'){
  const surfaceBaseV164=WorldGenerator.prototype.surfaceY,caveBaseV164=WorldGenerator.prototype.caveDensity;
  WorldGenerator.prototype.surfaceY=function(x,z){
    const sea=ENGINE.SEA_LEVEL,continental=this.perlin.fbm2(x*.0085,z*.0085,4),erosion=this.perlin.fbm2(x*.018+31,z*.018-47,3),ridge=1-Math.abs(this.perlin.fbm2(x*.026-80,z*.026+70,3));
    const detail=this.perlin.fbm2(x*.085,z*.085,3),river=Math.abs(this.perlin.noise(x*.0105,0,z*.0105));
    const low=continental<-.24?-9:continental<-.08?-4:0,base=sea+5+continental*15+low;
    const mountain=Math.max(0,ridge-.42)*Math.max(0,.75-erosion)*36;
    const hills=Math.max(0,continental+.08)*detail*5;
    const riverCut=river<.055?(1-river/.055)*Math.max(0,base-sea+2):0;
    let h=Math.floor(base+mountain+hills+detail*2-riverCut);
    const biome=this.biome(x,z);if(biome==='desert')h=Math.round(v164Lerp(h,sea+5+continental*8,.32));
    const legacy=surfaceBaseV164.call(this,x,z);h=Math.round(v164Lerp(legacy,h,.82));
    return clamp(h,8,ENGINE.WORLD_HEIGHT-12);
  };
  WorldGenerator.prototype.caveDensity=function(x,y,z){
    const legacy=caveBaseV164.call(this,x,y,z),depth=v164Clamp((ENGINE.SEA_LEVEL+18-y)/34),cheese=(this.perlin.fbm3(x*.052,y*.064,z*.052,4)-.18)*1.35;
    const wormA=1-v164Clamp((Math.abs(this.perlin.noise(x*.045,y*.052,z*.045))+Math.abs(this.perlin.noise(x*.031+19,y*.047,z*.031-11)))*3.1);
    const wormB=1-v164Clamp((Math.abs(this.perlin.noise(x*.072-41,y*.038,z*.072+17))+Math.abs(this.perlin.noise(x*.029,y*.079,z*.029)))*3.5);
    const worms=Math.max(wormA,wormB)*(.52+.48*depth),ravine=(1-v164Clamp(Math.abs(this.perlin.noise(x*.018,0,z*.018))*7))*v164Clamp((ENGINE.SEA_LEVEL-y)/20)*.58;
    return Math.max(legacy,cheese,worms*.78,ravine);
  };
  WorldGenerator.prototype.canCarve=function(x,y,z,surface){
    if(y<=3||y>=surface-3||y<7)return false;
    const density=this.caveDensity(x,y,z),nearSea=y>ENGINE.SEA_LEVEL-3;
    return density>(nearSea?.61:.54)&&this.perlin.noise(x*.12,y*.09,z*.12)>-.08;
  };
  WorldGenerator.prototype.generateTrees=function(chunk){
    const {cx,cz,size}=chunk,wx0=cx*size,wz0=cz*size;
    for(let z=2;z<size-2;z++)for(let x=2;x<size-2;x++){
      const wx=wx0+x,wz=wz0+z,y=this.surfaceY(wx,wz);
      if(y<=ENGINE.SEA_LEVEL||chunk.get(x,y,z)!==BLOCK.GRASS||chunk.get(x,y+1,z)!==BLOCK.AIR||!this.treeCandidate(wx,wz))continue;
      const h=4+Math.floor(hash2(wx,wz,this.seed+91)*3);this.stats.trees++;this.stats.trunks+=h;
      for(let k=1;k<=h&&y+k<ENGINE.WORLD_HEIGHT;k++)chunk.set(x,y+k,z,BLOCK.OAK_LOG);
      for(let yy=y+h-2;yy<=Math.min(ENGINE.WORLD_HEIGHT-1,y+h+1);yy++){
        const rel=yy-(y+h),r=rel>=1?1:2;
        for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
          if(dx*dx+dz*dz>r*r+1||(dx===0&&dz===0&&yy<=y+h))continue;const xx=x+dx,zz=z+dz;if(chunk.get(xx,yy,zz)===BLOCK.AIR){chunk.set(xx,yy,zz,BLOCK.OAK_LEAVES);this.stats.leaves++;}
        }
      }
    }
  };
}

/* -------------------------------------------------------------------------- */
/* FLUID TICKS — source/flow/falling levels, downward priority, horizontal     */
/* spreading and recession. This is metadata layered over the existing WATER  */
/* block ID so existing saves remain compatible.                              */
/* -------------------------------------------------------------------------- */
class WaterSimulatorV164{
  constructor(gameRef){this.game=gameRef;this.world=gameRef.world;this.levels=new Map();this.queue=[];this.queued=new Set();this.suppress=false;this.accum=0;this.steps=0;}
  key(x,y,z){return v164Key(x,y,z)}
  level(x,y,z){const k=this.key(x,y,z);return this.levels.has(k)?this.levels.get(k):0}
  replaceable(id){return id===BLOCK.AIR||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER||id===BLOCK.TORCH}
  enqueue(x,y,z){if(y<1||y>=ENGINE.WORLD_HEIGHT)return;const k=this.key(x,y,z);if(this.queued.has(k))return;this.queued.add(k);this.queue.push([x,y,z])}
  enqueueNeighbors(x,y,z){this.enqueue(x,y,z);this.enqueue(x,y+1,z);this.enqueue(x,y-1,z);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])this.enqueue(x+dx,y,z+dz)}
  rawSet(x,y,z,id,level=null){this.suppress=true;let changed=false;try{changed=this.world.set(x,y,z,id)}finally{this.suppress=false}const k=this.key(x,y,z);if(id===BLOCK.WATER&&level!==null)this.levels.set(k,level);else if(id!==BLOCK.WATER)this.levels.delete(k);if(changed)this.enqueueNeighbors(x,y,z);return changed}
  supportFor(x,y,z,level){
    if(level===8)return this.world.getLoaded(x,y+1,z)===BLOCK.WATER;
    if(level===0)return true;
    if(this.world.getLoaded(x,y+1,z)===BLOCK.WATER)return true;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(this.world.getLoaded(x+dx,y,z+dz)===BLOCK.WATER){const nl=this.level(x+dx,y,z+dz);if(nl===0||nl<level)return true}
    return false;
  }
  tickCell(x,y,z){
    const state=this.world.getLoadedState(x,y,z);if(!state.loaded)return;const id=state.id,k=this.key(x,y,z);
    if(id!==BLOCK.WATER){this.levels.delete(k);return}
    let level=this.level(x,y,z);
    if(level!==0&&!this.supportFor(x,y,z,level)){this.rawSet(x,y,z,BLOCK.AIR,null);return}
    const below=this.world.getLoadedState(x,y-1,z);
    if(below.loaded&&this.replaceable(below.id)){
      this.rawSet(x,y-1,z,BLOCK.WATER,8);this.enqueueNeighbors(x,y-1,z);return;
    }
    const next=level===0||level===8?1:level+1;if(next>7)return;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,nz=z+dz,n=this.world.getLoadedState(nx,y,nz);if(!n.loaded)continue;
      if(this.replaceable(n.id)){this.rawSet(nx,y,nz,BLOCK.WATER,next);this.enqueueNeighbors(nx,y,nz)}
      else if(n.id===BLOCK.WATER&&this.levels.has(this.key(nx,y,nz))&&this.level(nx,y,nz)>next){this.levels.set(this.key(nx,y,nz),next);this.world.dirtyChunks.add(chunkKey(n.cx,n.cz));this.enqueueNeighbors(nx,y,nz)}
    }
  }
  update(dt){
    this.accum+=Math.min(.1,Math.max(0,Number(dt)||0));if(this.accum<.05)return;this.accum=0;let budget=matchMedia('(pointer:coarse)').matches?36:72;
    while(budget--&&this.queue.length){const q=this.queue.shift();this.queued.delete(this.key(...q));this.tickCell(...q);this.steps++}
  }
}
if(typeof World!=='undefined'){
  const setBaseV164=World.prototype.set;
  World.prototype.set=function(x,y,z,id){
    const old=this.getLoaded(x,y,z),changed=setBaseV164.call(this,x,y,z,id),sim=this.waterV164||game?.waterV164;
    if(changed&&sim&&!sim.suppress){if(id!==BLOCK.WATER)sim.levels.delete(v164Key(x,y,z));sim.enqueueNeighbors(x,y,z);if(old===BLOCK.WATER||id===BLOCK.AIR)for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(this.getLoaded(x+dx,y+dy,z+dz)===BLOCK.WATER)sim.enqueue(x+dx,y+dy,z+dz)}
    return changed;
  };
}
if(typeof ChunkMesher!=='undefined'){
  const addQuadBaseV164=ChunkMesher.prototype.addQuad;
  ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){
    if(this.currentBlock!==BLOCK.WATER)return addQuadBaseV164.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);
    const level=this.world?.waterV164?.level?.(x,y,z)??0,h=level===8?.98:Math.max(.22,.875-(Math.min(7,level)/7)*.58),f=VOXEL_FACES.find(q=>q.key===face),base=positions.length/3;
    let verts=voxelFaceVertices(x,y,z,f).map(v=>v.slice());
    if(face==='up')for(const v of verts)v[1]=y+h;
    else if(face!=='down')for(const v of verts)if(v[1]>y+.5)v[1]=y+h;
    for(const v of verts)positions.push(v[0],v[1],v[2]);for(let i=0;i<4;i++){normals.push(...f.n);colors.push(.72,.84,1)}
    for(const q of f.uv){const p=this.atlas.uv(texture,q[0],q[1]);uvs.push(...p)}buckets.water.push(base,base+1,base+2,base,base+2,base+3);
  };
}

/* -------------------------------------------------------------------------- */
/* HELD ITEMS — force every flat Java item that belongs in the hand through    */
/* the existing pixel-extrusion geometry path (stick, tools, bow, shield).     */
/* -------------------------------------------------------------------------- */
if(typeof HeldItemFactoryV8!=='undefined'){
  const heldCreateBaseV164=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.create=function(id){
    let name='';try{name=javaItemNameV145(id)||''}catch{name=String(ITEM_NAME?.get?.(id)||'')}
    const special=id===ITEM.STICK||/pickaxe|\baxe\b|sword|shovel|\bhoe\b|shield|bow|stick/i.test(name);
    if(special&&typeof this.flat==='function'){
      const root=this.flat(id);if(root){root.userData.v164HeldExtrusion=true;return root}
    }
    return heldCreateBaseV164.call(this,id);
  };
}

/* -------------------------------------------------------------------------- */
/* COMBAT — no per-hit scene traversal/Box3 allocation, proper Java cooldown,  */
/* falling critical attacks, panic state, and critical particles.              */
/* -------------------------------------------------------------------------- */
if(typeof CombatSystem!=='undefined'){
  CombatSystem.prototype.ray=function(origin,direction,maxDistance=this.reach){
    this._rayV164??=new THREE.Ray();this._boxV164??=new THREE.Box3();this._hitV164??=new THREE.Vector3();this._rayV164.set(origin,direction);let best=null,bestDistance=Infinity;
    for(const mob of this.game.mobs?.mobs||[]){if((mob.health??0)<=0||(!mob.mesh&&!mob.model))continue;const spec=mob.behaviorSpecV6||{},w=Math.max(.35,Number(spec.width)||.8),h=Math.max(.55,Number(spec.height)||1.5),p=mob.position;
      this._boxV164.min.set(p.x-w*.5,p.y,p.z-w*.5);this._boxV164.max.set(p.x+w*.5,p.y+h,p.z+w*.5);const hit=this._rayV164.intersectBox(this._boxV164,this._hitV164);if(!hit)continue;const d=origin.distanceTo(hit);if(d<=maxDistance&&d<bestDistance){best=mob;bestDistance=d}}
    return best?{mob:best,distance:bestDistance}:null;
  };
  CombatSystem.prototype.target=function(){
    const now=performance.now(),p=this.game.player;if(!p)return null;if(this._targetCacheV164&&now-this._targetCacheV164.at<12)return this._targetCacheV164.mob;
    const origin=p.eyePosition(this._targetOriginV164??=new THREE.Vector3()),dir=this.direction(),mob=this.ray(origin,dir,this.reach)?.mob||null;this._targetCacheV164={at:now,mob};return mob;
  };
  CombatSystem.prototype.attack=function(){
    if(!this.game.running)return false;this._targetCacheV164=null;const mob=this.target();if(!mob)return false;
    const spec=this.javaSpecV144?.()||{damage:this.damage||1,speed:2.4},interval=1/Math.max(.1,spec.speed),strength=clamp(1-(this.cooldown/interval),0,1),p=this.game.player;
    const feet=this.game.world?.getLoaded?.(Math.floor(p.position.x),Math.floor(p.position.y+.12),Math.floor(p.position.z)),eye=this.game.world?.getLoaded?.(Math.floor(p.position.x),Math.floor(p.position.y+1.3),Math.floor(p.position.z));
    const swimming=feet===BLOCK.WATER||eye===BLOCK.WATER,critical=strength>=.90&&!p.onGround&&!p.flying&&!swimming&&!p.sneakingV12&&!p.input?.sneak&&Number(p.velocity?.y||0)<-.06;
    const scale=.2+strength*strength*.8,damage=Math.max(.2,Number(spec.damage||1)*scale*(critical?1.5:1));mob.health=Math.max(0,(mob.health??10)-damage);mob.hitFlash=.12;
    mob.lastHurtAtV14=performance.now();mob.lastHurtByV14=p;mob.panicV164=Math.max(mob.panicV164||0,2.6);
    const f=this.direction(),kb=.45+strength*1.65;mob.velocity??=new THREE.Vector3();mob.velocity.y=Math.max(mob.velocity.y,.45+strength*1.55);mob.velocity.x+=f.x*kb;mob.velocity.z+=f.z*kb;
    this.attackInterval=interval;this.damage=spec.damage;this.cooldown=interval;this.lastTarget=mob;this.lastAttackTime=performance.now();this.lastStrengthV144=strength;this.lastDamageV144=damage;this.lastCriticalV164=critical;this.flashTimer=.10;
    if(critical){const pos=mob.position.clone();pos.y+=(Number(mob.behaviorSpecV6?.height)||1.2)*.62;this.game.particles?.spawnBurst?.(pos,16)}
    const event=critical?'entity.player.attack.crit':strength>.9?'entity.player.attack.strong':'entity.player.attack.weak';
    try{this.game.javaAudioV144?.playEvent?.(event,{position:p.position,volume:critical?.62:.34,pitch:critical?1.0:.96}).catch?.(()=>{})}catch{try{this.game.soundV14?.playEvent?.(event,{position:p.position,volume:.32})}catch{}}
    return true;
  };
}
function updateAttackHudV164(){const el=document.getElementById('javaAttackIndicatorV144');if(!el||!game?.combat)return;const p=game.combat.cooldownProgressV144?.()??1;el.style.display=game.running&&!game.ui?.screen?'block':'none';el.style.setProperty('--attack-empty',`${(1-v164Clamp(p))*100}%`);el.classList.toggle('ready',p>=.985);el.classList.toggle('full',p>=.985)}

/* -------------------------------------------------------------------------- */
/* MOVEMENT AUDIO + CROUCH CAMERA — block-specific steps, water swish/splash,  */
/* and eased eye-height instead of an instant camera snap.                     */
/* -------------------------------------------------------------------------- */
function stepEventV164(id){
  if([BLOCK.GRASS,BLOCK.TALL_GRASS].includes(id))return'block.grass.step';if([BLOCK.DIRT,BLOCK.GRAVEL].includes(id))return'block.gravel.step';if(id===BLOCK.SAND)return'block.sand.step';if(id===BLOCK.SNOW)return'block.snow.step';
  if([BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.CRAFTING_TABLE,BLOCK.CHEST].includes(id))return'block.wood.step';if(id===BLOCK.GLASS)return'block.glass.step';return'block.stone.step';
}
function playJavaEventV164(event,options){try{const p=game?.javaAudioV144?.playEvent?.(event,options);p?.catch?.(()=>{});return}catch{}try{game?.soundV14?.playEvent?.(event,options)}catch{}}
if(typeof Player!=='undefined'){
  const aabbBaseV164=Player.prototype.aabb;
  Player.prototype.aabb=function(pos=this.position){const box=aabbBaseV164.call(this,pos);if(this.sneakingV12||this.input?.sneak)box.maxY=Math.min(box.maxY,pos.y+1.5);return box};
  Player.prototype.eyePosition=function(out=new THREE.Vector3()){out.copy(this.position);out.y+=ENGINE.EYE_HEIGHT+(this.__eyeOffsetV164||0);return out};
  Player.prototype.updateCamera=function(camera){camera.position.set(this.position.x,this.position.y+ENGINE.EYE_HEIGHT+(this.__eyeOffsetV164||0),this.position.z);camera.rotation.y=this.yaw;camera.rotation.x=this.pitch};
}
function updateMovementFidelityV164(dt){
  const p=game?.player,w=game?.world;if(!p||!w)return;const crouch=!!(p.sneakingV12||p.input?.sneak),target=crouch?-.27:0,alpha=1-Math.exp(-Math.min(.1,dt)*13);p.__eyeOffsetV164=v164Lerp(Number(p.__eyeOffsetV164)||0,target,alpha);
  const state=game.__stepV164??=( {x:p.position.x,z:p.position.z,acc:0,water:false} ),dx=p.position.x-state.x,dz=p.position.z-state.z,dist=Math.hypot(dx,dz);state.x=p.position.x;state.z=p.position.z;if(dist>.8)return;state.acc+=dist;
  const bx=Math.floor(p.position.x),bz=Math.floor(p.position.z),feetY=Math.floor(p.position.y+.1),feet=w.getLoaded(bx,feetY,bz),body=w.getLoaded(bx,Math.floor(p.position.y+1.0),bz),water=feet===BLOCK.WATER||body===BLOCK.WATER;
  if(water){if(!state.water)playJavaEventV164('entity.player.splash',{position:p.position,volume:.48,pitch:1});const stride=p.sprinting?.42:.52;if(state.acc>=stride){state.acc=0;playJavaEventV164('entity.player.swim',{position:p.position,volume:.35,pitch:.92+Math.random()*.16})}}
  else if(p.onGround&&state.acc>=(p.sprinting?.64:crouch?.78:.70)){state.acc=0;const below=w.getLoaded(bx,Math.floor(p.position.y-.08),bz);playJavaEventV164(stepEventV164(below),{position:p.position,volume:crouch?.18:.30,pitch:.92+Math.random()*.14})}
  state.water=water;
}

/* Passive animal panic safety net. Existing JavaPassiveAnimalV145 reads       */
/* lastHurtAtV14, but this also covers passive entities using another planner. */
function updatePassivePanicV164(dt){
  const p=game?.player;if(!p)return;for(const m of game?.mobs?.mobs||[]){if(!(m.panicV164>0)||!['cow','pig','sheep','chicken'].includes(m.type))continue;m.panicV164=Math.max(0,m.panicV164-dt);if(m.behaviorV14 instanceof (typeof JavaPassiveAnimalV145!=='undefined'?JavaPassiveAnimalV145:Object))continue;const away=m.position.clone().sub(p.position).setY(0);if(away.lengthSq()<.001)away.set(Math.random()-.5,0,Math.random()-.5);away.normalize();const speed=m.type==='chicken'?1.25:1.55;game.mobNavigatorV14?.move?.(m,away,speed,dt,null)}
}

/* -------------------------------------------------------------------------- */
/* PHOTON — make the already-ported cloud/fog/shadow/water/post stack actually */
/* active whenever the selected profile is not Off; expose diagnostics.        */
/* -------------------------------------------------------------------------- */
function photonLockBoolV164(object,key,enabledFn){
  if(!object||object[`__v164Lock_${key}`])return;const initial=object[key]!==false;let stored=initial;
  try{Object.defineProperty(object,key,{configurable:true,enumerable:true,get(){return enabledFn()?true:stored},set(v){stored=!!v;if(enabledFn()&&v===false)stored=true}});object[`__v164Lock_${key}`]=true}catch{}
}
function photonLockUniformV164(uniform,minFn){
  if(!uniform||uniform.__v164Locked)return;let stored=Number(uniform.value)||0;
  try{Object.defineProperty(uniform,'value',{configurable:true,enumerable:true,get(){const min=Number(minFn())||0;return game?.photonV148?.enabled===false?0:Math.max(stored,min)},set(v){const n=Number(v)||0;stored=game?.photonV148?.enabled===false?n:Math.max(n,Number(minFn())||0)}});uniform.__v164Locked=true}catch{}
}
function enforcePhotonV164(){
  const p=game?.photonV148;if(!p)return;let profile=p.profile||'Lite';try{profile=v15Prefs?.().photonProfile||v15Prefs?.().photon||profile}catch{}
  p.profile=profile;p.enabled=String(profile).toLowerCase()!=='off';const stack=game.photonGauntletV152||game.photonV152;if(!stack)return;
  const active=()=>game?.photonV148?.enabled!==false;
  if(stack.clouds?.group){photonLockBoolV164(stack.clouds.group,'visible',active);if(p.enabled)stack.clouds.group.visible=true}
  if(stack.post){photonLockBoolV164(stack.post,'enabled',active);if(p.enabled)stack.post.enabled=true}
  const profileCfg=(typeof PHOTON_V152_PROFILES!=='undefined'&&PHOTON_V152_PROFILES[p.profile])||{shadowStrength:.30,water:.35};
  for(const u of stack.shadows?.uniforms||[])if(u?.photonCloudShadow)photonLockUniformV164(u.photonCloudShadow,()=>((typeof PHOTON_V152_PROFILES!=='undefined'&&PHOTON_V152_PROFILES[game?.photonV148?.profile])?.shadowStrength||.30));
  for(const u of stack.water?.uniforms||[])if(u?.photonWaterStrength)photonLockUniformV164(u.photonWaterStrength,()=>((typeof PHOTON_V152_PROFILES!=='undefined'&&PHOTON_V152_PROFILES[game?.photonV148?.profile])?.water||.35));
  for(const key of ['fog','shadows','water','ao'])if(stack[key]&&'enabled'in stack[key]){photonLockBoolV164(stack[key],'enabled',active);if(p.enabled)stack[key].enabled=true}
}

/* -------------------------------------------------------------------------- */
/* GAME BOOT/UPDATE integration.                                               */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'){
  const bootBaseV164=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const r=await bootBaseV164.apply(this,args);this.waterV164??=new WaterSimulatorV164(this);this.world.waterV164=this.waterV164;repairLeavesV164();this.breakOverlayV147?.ensure?.();enforcePhotonV164();wireJavaLayoutV164();window.__voxelDiag?.log?.('V16.4 BOOT: Java UI, fluid ticks, terrain/caves, combat criticals, movement audio, leaf alpha and Photon activation installed.','ok');return r};
  const updateBaseV164=Game.prototype.update;
  Game.prototype.update=function(dt){const r=updateBaseV164.call(this,dt);this.waterV164?.update?.(dt);repairLeavesV164();updateAttackHudV164();updateMovementFidelityV164(dt);updatePassivePanicV164(dt);enforcePhotonV164();return r};
}

/* Java-style locate helper for generated village sites. */
function locateVillageV164(radiusChunks=96){
  const g=game?.world?.generator,p=game?.player?.position;if(!g||!p)return null;const pcx=floorDiv(Math.floor(p.x),ENGINE.CHUNK_SIZE),pcz=floorDiv(Math.floor(p.z),ENGINE.CHUNK_SIZE),spacing=9;
  let best=null;for(let gz=Math.floor((pcz-radiusChunks)/spacing);gz<=Math.floor((pcz+radiusChunks)/spacing);gz++)for(let gx=Math.floor((pcx-radiusChunks)/spacing);gx<=Math.floor((pcx+radiusChunks)/spacing);gx++){
    const cx=gx*spacing+Math.floor(hash2(gx,gz,g.seed+22131)*spacing),cz=gz*spacing+Math.floor(hash2(gz,gx,g.seed+55109)*spacing),wx=cx*ENGINE.CHUNK_SIZE+8,wz=cz*ENGINE.CHUNK_SIZE+8,y=g.surfaceY(wx,wz),biome=g.biome(wx,wz);if(biome!=='plains'||y<=ENGINE.SEA_LEVEL+2)continue;const d=(cx-pcx)**2+(cz-pcz)**2;if(!best||d<best.d)best={x:wx,y:y+1,z:wz,chunk:[cx,cz],distanceBlocks:Math.round(Math.sqrt(d)*ENGINE.CHUNK_SIZE),d};
  }return best&&({...best,d:undefined});
}
try{
  runtimeCommands.register('village',()=>locateVillageV164()||{found:false},'Locate the nearest generated plains village candidate.');
  runtimeCommands.register('v164',()=>({build:BUILD,ui:{inventory:!!document.querySelector('.javaContainerV145'),recipeOpen:!!document.querySelector('.javaScreenV145.recipeOpen')},water:{queued:game?.waterV164?.queue?.length||0,tracked:game?.waterV164?.levels?.size||0,steps:game?.waterV164?.steps||0},combat:{cooldown:game?.combat?.cooldown||0,critical:!!game?.combat?.lastCriticalV164},photon:{enabled:game?.photonV148?.enabled,profile:game?.photonV148?.profile},village:locateVillageV164(48)}),'Inspect V16.4 Java-parity runtime state.');
}catch{}

window.MINECRAFT_WEB_VERSION=BUILD;
window.STUDIO_PATCH_VERSION='0.16.4-java-parity-runtime';
window.__voxelDiag?.log?.('V16.4 loaded: bounded Java inventory/recipe book, scaled slots, true crack alpha, leaf transparency, flowing water, stronger terrain/caves, optimized combat criticals, steps/swim audio, crouch easing and Photon activation.','ok');
})();
