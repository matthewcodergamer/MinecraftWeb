/* ===================== V14 RENDER HOTPATH: MINECRAFT-STYLE FRUSTUM CULLING =====================
   Keep chunks loaded/simulated around the player, but submit only camera-visible chunk meshes.
   This mirrors Minecraft's separation between loaded render sections and the per-frame frustum-visible list.
   Three.js still performs its own object-level frustum checks; this coarse AABB pass prevents off-screen
   chunk meshes from even entering the expensive render path. No world generation, gameplay, saves, AI,
   lighting, WebGPU/WebGL selection, AA, title world, or existing distance/fog rules are removed.
*/
const STUDIO_V14=Object.freeze({
  version:'0.14.0-alpha.1',
  mode:'chunk-aabb-frustum',
  enabledByDefault:true,
  boundsPadding:.75
});
window.STUDIO_PATCH_VERSION=STUDIO_V14.version;

class MinecraftFrustumCullerV14{
  constructor(rendererRef){
    this.rr=rendererRef;
    this.enabled=localStorage.getItem('mcFrustumCullingV14')!=='off';
    this.frustum=new THREE.Frustum();
    this.projView=new THREE.Matrix4();
    this.cameraPoint=new THREE.Vector3();
    this.stats={frame:0,tested:0,visible:0,frustumRejected:0,distanceRejected:0,meshed:0,lastMs:0};
  }
  setEnabled(value){
    this.enabled=!!value;
    localStorage.setItem('mcFrustumCullingV14',this.enabled?'on':'off');
    if(!this.enabled){
      // The normal V13 distance/fog visibility pass will take over on the next frame.
      for(const mesh of this.rr.chunkMeshes.values())mesh.visible=true;
    }
    this.syncButton();
    return this.enabled;
  }
  toggle(){return this.setEnabled(!this.enabled);}
  syncButton(){const b=$('frustumToggleV14');if(b)b.textContent=`FRUSTUM ${this.enabled?'ON':'OFF'}`;}
  ensureChunkBounds(mesh){
    if(!mesh?.geometry)return null;
    const generation=mesh.geometry.id;
    if(mesh.userData?.v14FrustumBox&&mesh.userData.v14FrustumGeometryId===generation)return mesh.userData.v14FrustumBox;
    try{
      if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
      if(!mesh.geometry.boundingBox)return null;
      const box=mesh.geometry.boundingBox.clone().expandByScalar(STUDIO_V14.boundsPadding);
      mesh.userData.v14FrustumBox=box;
      mesh.userData.v14FrustumGeometryId=generation;
      return box;
    }catch{return null;}
  }
  updateFrustum(){
    const cam=this.rr.camera,renderer=this.rr.renderer;
    if(!cam)return false;
    cam.updateMatrixWorld(true);
    this.projView.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
    const coordinateSystem=renderer?.coordinateSystem ?? THREE.WebGLCoordinateSystem;
    const reversedDepth=!!renderer?.reversedDepthBuffer;
    try{this.frustum.setFromProjectionMatrix(this.projView,coordinateSystem,reversedDepth);}
    catch{this.frustum.setFromProjectionMatrix(this.projView);}
    this.cameraPoint.copy(cam.position);
    return true;
  }
  apply(){
    const start=performance.now();
    const meshes=this.rr.chunkMeshes;
    const s={frame:(this.stats.frame||0)+1,tested:0,visible:0,frustumRejected:0,distanceRejected:0,meshed:meshes.size,lastMs:0};
    if(!this.enabled||!this.updateFrustum()){
      // Do not override V13 distance/fog visibility when the feature is disabled.
      for(const mesh of meshes.values())if(mesh.visible)s.visible++;
      s.tested=meshes.size;s.lastMs=performance.now()-start;this.stats=s;return s;
    }
    for(const mesh of meshes.values()){
      // V11/V13 has already applied Minecraft-like render-distance/fog culling before updateLOD().
      // Respect it, then apply the camera frustum as a second gate.
      if(mesh.visible===false){s.distanceRejected++;continue;}
      s.tested++;
      mesh.frustumCulled=true;
      const box=this.ensureChunkBounds(mesh);
      if(!box){s.visible++;continue;}
      // A camera may be inside its own chunk AABB. Keep that chunk unconditionally to avoid near-plane holes.
      const inCameraChunk=box.containsPoint(this.cameraPoint);
      const visible=inCameraChunk||this.frustum.intersectsBox(box);
      mesh.visible=visible;
      if(visible)s.visible++;else s.frustumRejected++;
    }
    s.lastMs=performance.now()-start;
    this.stats=s;
    return s;
  }
  snapshot(){return{version:STUDIO_V14.version,enabled:this.enabled,...this.stats,backend:this.rr.backendLabel?.()||'unknown',cameraFov:this.rr.camera?.fov||null};}
}

function v14EnsureCuller(rr){
  if(!rr)return null;
  if(!rr.frustumV14){rr.frustumV14=new MinecraftFrustumCullerV14(rr);rr.frustumV14.syncButton();}
  return rr.frustumV14;
}

/* Tight chunk bounds are cached when a chunk mesh is rebuilt. */
const v14RebuildChunkBase=VoxelRenderer.prototype.rebuildChunk;
VoxelRenderer.prototype.rebuildChunk=function(chunk){
  const result=v14RebuildChunkBase.call(this,chunk);
  const mesh=this.chunkMeshes.get(chunkKey(chunk.cx,chunk.cz));
  if(mesh){
    mesh.frustumCulled=true;
    try{
      mesh.geometry.computeBoundingBox();
      if(mesh.geometry.boundingBox){
        mesh.userData.v14FrustumBox=mesh.geometry.boundingBox.clone().expandByScalar(STUDIO_V14.boundsPadding);
        mesh.userData.v14FrustumGeometryId=mesh.geometry.id;
      }
    }catch{}
  }
  return result;
};

/* updateLOD is the last world step called by the existing render() immediately before renderer.render().
   Applying the visibility list here preserves every existing render feature and avoids replacing V13's renderer. */
const v14UpdateLODBase=VoxelRenderer.prototype.updateLOD;
VoxelRenderer.prototype.updateLOD=function(...args){
  const result=v14UpdateLODBase.apply(this,args);
  v14EnsureCuller(this)?.apply();
  return result;
};

/* Explicitly keep dynamic world geometry on Three.js' native object frustum path too.
   First-person hands, sky dome and cloud sheet intentionally keep their existing frustumCulled=false behavior. */
function v14EnableDynamicFrustumFlags(){
  for(const mob of game.mobs?.mobs||[]){
    (mob.model||mob.mesh)?.traverse?.(o=>{if(o.isMesh&&!o.userData?.viewModelV7&&!o.userData?.viewModelV8)o.frustumCulled=true;});
  }
  for(const drop of game.drops?.items||[])if(drop.mesh)drop.mesh.frustumCulled=true;
  for(const p of game.particles?.items||[])if(p.mesh)p.mesh.frustumCulled=true;
  game.playerAvatarV12?.local?.root?.traverse?.(o=>{if(o.isMesh)o.frustumCulled=true;});
}
const v14GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const result=v14GameUpdateBase.call(this,dt);if((this._v14CullFlagTick=(this._v14CullFlagTick||0)+1)%30===0)v14EnableDynamicFrustumFlags();return result;};

/* Debug-only toggle and inspection. It does not alter the normal gameplay HUD. */
(function installFrustumDebugV14(){
  const bar=$('voxelDiagBar');
  if(bar&&!$('frustumToggleV14')){
    const b=document.createElement('button');b.id='frustumToggleV14';b.className='voxBtn';b.type='button';b.onclick=()=>{const c=v14EnsureCuller(game.renderer);c?.toggle();window.__voxelDiag?.log?.(`FRUSTUM CULLING ${c?.enabled?'ENABLED':'DISABLED'}`,'ok');};bar.appendChild(b);
  }
  v14EnsureCuller(game.renderer)?.syncButton();
})();
try{
  runtimeCommands.register('frustum',(mode)=>{
    const c=v14EnsureCuller(game.renderer);if(!c)return null;
    const m=String(mode??'').toLowerCase();if(['on','1','true'].includes(m))c.setEnabled(true);else if(['off','0','false'].includes(m))c.setEnabled(false);else if(m==='toggle')c.toggle();
    return c.snapshot();
  },'Inspect/toggle V14 Minecraft-style chunk frustum culling: frustum [on|off|toggle].');
}catch{}

/* Keep the title/version indicator current without replacing any of the working title UI. */
const v14BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v14BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small&&/Minecraft Web/.test(small.textContent||''))small.textContent=`Minecraft Web • Three.js • ${STUDIO_V14.version}`;};

window.__voxelDiag?.log?.(`V14 READY ${STUDIO_V14.version}: Minecraft-style camera-frustum visibility list enabled. Loaded chunks remain available for simulation/fast turning, while chunk AABBs outside the camera view are hidden before the GPU render pass. Existing fog distance, WebGL/WebGPU, AA, lighting, mobs, sound, inventory and world systems are preserved.`,'ok');


