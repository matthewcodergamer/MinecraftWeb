/* Minecraft Web V16.11 — authoritative world reveal gate + rendered surface spawn invariant.
 * Keeps gameplay/canvas hidden until the local terrain is actually meshed, freezes
 * player physics during the gate, and guarantees fresh worlds open above terrain.
 */
(function(){
'use strict';
const BUILD='0.16.11';
const SECTION=16;
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const secKey=(cx,sy,cz)=>`${cx},${sy},${cz}`;
const finite=v=>Number.isFinite(Number(v));

/* -------------------------------------------------------------------------- */
/* HARD VISUAL GATE — no one-frame world flash before 100%                     */
/* -------------------------------------------------------------------------- */
const style=document.createElement('style');
style.id='v1611WorldRevealGateStyle';
style.textContent=`
body.mcWorldRevealGateV1611 #loading{
  display:flex!important;
  visibility:visible!important;
  opacity:1!important;
  pointer-events:auto!important;
  z-index:2147483000!important;
  background:#303336!important;
  background-image:none!important;
  transition:none!important;
}
body.mcWorldRevealGateV1611 #loading::before{display:none!important}
body.mcWorldRevealGateV1611 #gameCanvas,
body.mcWorldRevealGateV1611 #hud,
body.mcWorldRevealGateV1611 #screenLayer{
  visibility:hidden!important;
}
body.mcWorldRevealGateV1611 #titleScreen{visibility:hidden!important}
body.mcWorldRevealGateV1611 #loadingBar{opacity:1!important}
`;
document.head.appendChild(style);

function loadingElsV1611(){return{
  root:document.getElementById('loading'),
  text:document.getElementById('loadingText'),
  fill:document.getElementById('loadingFill')
}}
function forceLoadingVisibleV1611(g,pct=94,text='Preparing spawn area…'){
  document.body.classList.add('mcWorldRevealGateV1611');
  const e=loadingElsV1611();
  if(e.root){
    e.root.classList.remove('mcBootGone','mcBootLeaving');
    e.root.classList.add('show','v15Loading');
    e.root.style.removeProperty('display');
    e.root.style.removeProperty('visibility');
    e.root.style.removeProperty('pointer-events');
    e.root.style.removeProperty('opacity');
    e.root.removeAttribute('aria-hidden');
  }
  if(e.fill)e.fill.style.width=`${Math.max(0,Math.min(99,Number(pct)||0))}%`;
  if(e.text&&text)e.text.textContent=text;
  g&& (g.__worldRevealProgressV1611=Math.max(Number(g.__worldRevealProgressV1611)||0,Number(pct)||0));
}
function beginRevealGateV1611(g,fresh){
  g.__worldRevealGateV1611={active:true,fresh:!!fresh,started:performance.now(),safe:null,readyFrames:0};
  g.__worldRevealProgressV1611=92;
  forceLoadingVisibleV1611(g,92,fresh?'Preparing spawn area…':'Loading nearby terrain…');
}
function endRevealGateV1611(g){
  const gate=g?.__worldRevealGateV1611;
  if(gate)gate.active=false;
  g.__worldRevealGateV1611=null;
  g.__spawnSafetyV1611Until=performance.now()+9000;
  document.body.classList.remove('mcWorldRevealGateV1611');
}

/* Intercept every older patch that tries to hide #loading before the final gate. */
if(typeof Game!=='undefined'&&typeof Game.prototype.setLoading==='function'){
  const setLoadingBaseV1611=Game.prototype.setLoading;
  Game.prototype.setLoading=function(show,pct,text){
    const gate=this.__worldRevealGateV1611;
    if(gate?.active&&show===false){
      const p=Math.max(94,Math.min(99,Number(this.__worldRevealProgressV1611)||94));
      forceLoadingVisibleV1611(this,p,'Joining world…');
      return setLoadingBaseV1611.call(this,true,p,'Joining world…');
    }
    const r=setLoadingBaseV1611.call(this,show,pct,text);
    if(gate?.active)forceLoadingVisibleV1611(this,Math.min(99,Number(pct)||94),text||'Joining world…');
    return r;
  };
}

/* -------------------------------------------------------------------------- */
/* SURFACE + MESH READINESS                                                     */
/* Prismarine Viewer exposes waitForChunksToRender(); this is the equivalent    */
/* invariant for MinecraftWeb's section renderer.                               */
/* -------------------------------------------------------------------------- */
function chunkAtV1611(w,x,z){const p=w.worldToChunk(Math.floor(x),Math.floor(z));return p}
function ensureLocalDataV1611(g,r=1){
  const w=g?.world,p=g?.player?.position,rr=g?.renderer;if(!w||!p)return 0;
  const cp=chunkAtV1611(w,p.x,p.z);let n=0;
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    try{
      const c=w.ensureChunk(cp.cx+dx,cp.cz+dz);if(!c)continue;n++;
      const key=chunkKey(c.cx,c.cz);
      if(rr&&!rr.chunkMeshes?.get?.(key))rr.attachChunk?.(c);
    }catch{}
  }
  return n;
}
function chunkHasMeshV1611(g,cx,cz){
  const rr=g?.renderer;if(!rr)return false;
  if(rr.chunkMeshes?.get?.(chunkKey(cx,cz)))return true;
  const nodes=rr.sectionVisibilityV146?.nodes;
  if(nodes)for(const n of nodes.values())if(n?.mesh&&n.cx===cx&&n.cz===cz)return true;
  return false;
}
function sectionMeshV1611(g,cx,sy,cz){
  const nodes=g?.renderer?.sectionVisibilityV146?.nodes;
  if(!nodes)return null;
  return nodes.get(secKey(cx,sy,cz))?.mesh||null;
}
function pinAroundV1611(g,r=1,vertical=2){
  const p=g?.player?.position,w=g?.world,vis=g?.renderer?.sectionVisibilityV146;if(!p||!w||!vis?.nodes)return 0;
  const cp=chunkAtV1611(w,p.x,p.z),sy=floorDiv(Math.floor(p.y),SECTION);let n=0;
  for(const node of vis.nodes.values()){
    if(!node?.mesh||Math.abs(node.cx-cp.cx)>r||Math.abs(node.cz-cp.cz)>r||Math.abs(node.sy-sy)>vertical)continue;
    if(node.group)node.group.visible=true;
    node.mesh.visible=true;
    vis.visibleKeys?.add?.(node.key);vis.renderVisibleKeys?.add?.(node.key);n++;
  }
  return n;
}
function walkableColumnV1611(w,x,z,allowLeaves=false){
  try{
    const cp=chunkAtV1611(w,x,z);w.ensureChunk(cp.cx,cp.cz);
    let y=w.highestSolidY(Math.floor(x),Math.floor(z));
    if(!finite(y)||y<1||y>381)return null;
    const lava=window.V165_BLOCK?.LAVA??-999;
    const floor=w.getLoaded(Math.floor(x),y,Math.floor(z));
    const a=w.getLoaded(Math.floor(x),y+1,Math.floor(z));
    const b=w.getLoaded(Math.floor(x),y+2,Math.floor(z));
    if(!SOLID_BLOCKS.has(floor)||floor===BLOCK.WATER||floor===lava||a!==BLOCK.AIR||b!==BLOCK.AIR)return null;
    if(!allowLeaves&&(floor===BLOCK.OAK_LEAVES||floor===BLOCK.OAK_LOG))return null;
    return{x:Math.floor(x),z:Math.floor(z),y,floor,cp,pos:new THREE.Vector3(Math.floor(x)+.5,y+1.05,Math.floor(z)+.5)};
  }catch{return null}
}
function findSurfaceV1611(g,radius=20){
  const p=g?.player?.position,w=g?.world;if(!p||!w)return null;
  const x0=Math.floor(p.x),z0=Math.floor(p.z);
  for(let pass=0;pass<2;pass++){
    const allowLeaves=pass===1;
    for(let r=0;r<=radius;r++){
      if(r===0){const c=walkableColumnV1611(w,x0,z0,allowLeaves);if(c)return c}
      else for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
        const c=walkableColumnV1611(w,x0+dx,z0+dz,allowLeaves);if(c)return c;
      }
    }
  }
  return null;
}
function placeSurfaceV1611(g,c){
  if(!c?.pos||!g?.player)return false;
  g.player.position.copy(c.pos);
  g.player.velocity?.set?.(0,0,0);
  g.player.onGround=false;
  g.player.updateCamera?.(g.renderer?.camera);
  g.playerEntitiesV12?.local?.root?.position?.copy?.(c.pos);
  g.playerEntitiesV12?.local?.lastPos?.copy?.(c.pos);
  const gate=g.__worldRevealGateV1611;if(gate)gate.safe=c;
  g.__lastSurfaceV1611=c;
  return true;
}
function currentPositionInvalidV1611(g){
  const p=g?.player?.position,w=g?.world;if(!p||!w||!finite(p.y)||p.y<.1||p.y>382)return true;
  try{
    if(g.player.collidesAt?.(p))return true;
    const x=Math.floor(p.x),z=Math.floor(p.z),feet=Math.floor(p.y+.05),head=Math.floor(p.y+1.55);
    if(SOLID_BLOCKS.has(w.getLoaded(x,feet,z))||SOLID_BLOCKS.has(w.getLoaded(x,head,z)))return true;
  }catch{return true}
  return false;
}
function localMeshStateV1611(g,surface){
  const p=g?.player?.position,w=g?.world,rr=g?.renderer;if(!p||!w||!rr)return{ready:false,data:0,chunks:0,center:false,floor:false};
  const cp=chunkAtV1611(w,p.x,p.z);let data=0,chunks=0;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
    if(w.getChunk?.(cp.cx+dx,cp.cz+dz))data++;
    if(chunkHasMeshV1611(g,cp.cx+dx,cp.cz+dz))chunks++;
  }
  const center=chunkHasMeshV1611(g,cp.cx,cp.cz);
  let floor=center;
  if(surface){
    const sy=floorDiv(surface.y,SECTION);
    floor=!!sectionMeshV1611(g,surface.cp.cx,sy,surface.cp.cz)||center;
  }
  return{ready:data===9&&chunks>=5&&center&&floor,data,chunks,center,floor};
}
async function settleWorldV1611(g,fresh){
  if(!g?.world||!g?.player||!g?.renderer)return;
  const deadline=performance.now()+(fresh?14000:9000);
  let surface=null,stable=0;

  if(fresh||currentPositionInvalidV1611(g)){
    ensureLocalDataV1611(g,2);
    surface=findSurfaceV1611(g,24);
    if(surface)placeSurfaceV1611(g,surface);
  }

  while(performance.now()<deadline){
    ensureLocalDataV1611(g,1);
    try{g.world.queueAround?.(g.player.position.x,g.player.position.z)}catch{}
    try{g.world.tickQueues?.(g.renderer);g.world.tickQueues?.(g.renderer)}catch{}

    if((fresh||currentPositionInvalidV1611(g))&&!surface){surface=findSurfaceV1611(g,24);if(surface)placeSurfaceV1611(g,surface)}
    if(surface)placeSurfaceV1611(g,surface);
    pinAroundV1611(g,1,2);

    const state=localMeshStateV1611(g,surface);
    stable=state.ready?stable+1:0;
    const elapsed=1-Math.max(0,deadline-performance.now())/(fresh?14000:9000);
    const pct=Math.min(99,94+Math.floor(elapsed*5));
    g.__worldRevealProgressV1611=pct;
    forceLoadingVisibleV1611(g,pct,state.ready?'Finalizing terrain…':`Building spawn chunks… ${state.chunks}/9`);
    if(stable>=4)break;
    await nextFrame();
  }

  if((fresh||currentPositionInvalidV1611(g))&&!surface){
    surface=findSurfaceV1611(g,40);
    if(surface)placeSurfaceV1611(g,surface);
  }
  if(surface)placeSurfaceV1611(g,surface);
  pinAroundV1611(g,1,3);
  g.player.velocity?.set?.(0,0,0);
  g.player.updateCamera?.(g.renderer?.camera);
  await nextFrame();await nextFrame();await nextFrame();
}

/* -------------------------------------------------------------------------- */
/* PHYSICS GATE — older boot starts the RAF before its promise resolves.        */
/* Build/render chunks, but never run gravity/player movement during that gap. */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'&&typeof Game.prototype.update==='function'){
  const updateBaseV1611=Game.prototype.update;
  Game.prototype.update=function(dt){
    const gate=this.__worldRevealGateV1611;
    if(gate?.active&&this.player&&this.world&&this.renderer){
      this.player.velocity?.set?.(0,0,0);
      if(gate.safe?.pos)this.player.position.copy(gate.safe.pos);
      try{this.world.queueAround?.(this.player.position.x,this.player.position.z);this.world.tickQueues?.(this.renderer)}catch{}
      pinAroundV1611(this,1,3);
      this.player.updateCamera?.(this.renderer.camera);
      return;
    }
    const r=updateBaseV1611.call(this,dt);
    if(performance.now()<Number(this.__spawnSafetyV1611Until||0)&&this.player&&this.world){
      let bad=currentPositionInvalidV1611(this);
      const safe=this.__lastSurfaceV1611;
      if(!bad&&safe&&this.player.position.y<safe.pos.y-3.5&&Math.hypot(this.player.position.x-safe.pos.x,this.player.position.z-safe.pos.z)<10)bad=true;
      if(bad&&safe){placeSurfaceV1611(this,safe);this.player.velocity?.set?.(0,0,0);pinAroundV1611(this,1,3)}
    }
    return r;
  };
}

/* Keep the local render set alive during the first seconds after reveal. */
if(typeof SectionVisibilityV146!=='undefined'&&typeof SectionVisibilityV146.prototype.apply==='function'){
  const applyBaseV1611=SectionVisibilityV146.prototype.apply;
  SectionVisibilityV146.prototype.apply=function(...args){
    const r=applyBaseV1611.apply(this,args);
    if(game?.__worldRevealGateV1611?.active||performance.now()<Number(game?.__spawnSafetyV1611Until||0))pinAroundV1611(game,1,3);
    return this.stats||r;
  };
}

/* Final wrapper: the canvas cannot be exposed until all older boot wrappers and
   our rendered-section readiness check have both completed. */
if(typeof Game!=='undefined'&&typeof Game.prototype.boot==='function'){
  const bootBaseV1611=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const fresh=!!args[1];
    beginRevealGateV1611(this,fresh);
    try{
      const r=await bootBaseV1611.apply(this,args);
      forceLoadingVisibleV1611(this,94,'Preparing rendered spawn…');
      await settleWorldV1611(this,fresh);
      const e=loadingElsV1611();if(e.fill)e.fill.style.width='100%';if(e.text)e.text.textContent='Joining world… 100%';
      await nextFrame();await nextFrame();
      endRevealGateV1611(this);
      try{this.setLoading?.(false,100,'Ready')}catch{}
      this.player?.updateCamera?.(this.renderer?.camera);
      this.firstPersonV7?.refresh?.();
      window.__voxelDiag?.log?.('V16.11 READY: canvas reveal waits for local chunk meshes; player physics frozen until a rendered surface spawn is stable.','ok');
      return r;
    }catch(err){
      const e=loadingElsV1611();if(e.fill)e.fill.style.width='100%';if(e.text)e.text.textContent=`World failed to load: ${err?.message||err}`;
      this.__worldRevealGateV1611=null;
      document.body.classList.remove('mcWorldRevealGateV1611');
      throw err;
    }
  };
}

window.MINECRAFT_WEB_VERSION=BUILD;
try{runtimeCommands.register('spawn1611',()=>{
  const p=game?.player?.position,w=game?.world,s=game?.__lastSurfaceV1611,state=localMeshStateV1611(game,s);
  return{build:BUILD,gate:!!game?.__worldRevealGateV1611?.active,player:p?{x:p.x,y:p.y,z:p.z}:null,safe:s?.pos?{x:s.pos.x,y:s.pos.y,z:s.pos.z}:null,localMeshes:state,spawnSafetyMs:Math.max(0,Math.round((game?.__spawnSafetyV1611Until||0)-performance.now()))};
},'Inspect V16.11 world reveal, rendered spawn and local mesh readiness.')}catch{}
window.__voxelDiag?.log?.('V16.11 installed: authoritative loading reveal gate + frozen startup physics + rendered surface spawn.','ok');
})();
