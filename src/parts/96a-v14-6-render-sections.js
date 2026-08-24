/* ===================== V14.6A: 16^3 RENDER SECTIONS + PORTAL OCCLUSION ===================== */
const STUDIO_V14_6=Object.freeze({
  version:'0.14.6-visibility-scheduling',sectionSize:16,
  portalOcclusion:true,entityOcclusion:true,nearEntityAlwaysVisible:8,
  cullHysteresisMs:180
});
window.STUDIO_PATCH_VERSION=STUDIO_V14_6.version;
window.MINECRAFT_WEB_VERSION='0.14.6';

const V146_FACE_OPPOSITE=[1,0,3,2,5,4];
const V146_FACE_STEP=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function v146SectionKey(cx,sy,cz){return `${cx},${sy},${cz}`;}
function v146DisposeObject(obj){
  if(!obj)return;
  obj.traverse?.(o=>{if(o!==obj&&o.geometry?.dispose)o.geometry.dispose();});
  if(obj.geometry?.dispose)obj.geometry.dispose();
  obj.parent?.remove?.(obj);
}
function v146SectionBounds(cx,sy,cz){
  const s=STUDIO_V14_6.sectionSize;
  return new THREE.Box3(new THREE.Vector3(cx*s,sy*s,cz*s),new THREE.Vector3((cx+1)*s,(sy+1)*s,(cz+1)*s));
}

/* Minecraft-style section connectivity: flood-fill non-opaque cells and record which of the six
   boundary directions are connected through open space. This is cached until the chunk rebuilds. */
function v146ComputePortalVisibility(chunk,sy){
  const S=STUDIO_V14_6.sectionSize,y0=sy*S,y1=Math.min(chunk.height,y0+S),h=Math.max(0,y1-y0);
  const masks=new Uint8Array(6);if(!h)return {masks,open:0,total:0,solid:true};
  const total=S*S*h,openMask=new Uint8Array(total);let open=0;
  const idx=(x,y,z)=>x+z*S+y*S*S;
  for(let ly=0;ly<h;ly++)for(let z=0;z<S;z++)for(let x=0;x<S;x++){
    const id=chunk.get(x,y0+ly,z),isOpen=!OPAQUE_BLOCKS.has(id);if(isOpen){openMask[idx(x,ly,z)]=1;open++;}
  }
  if(open===0)return {masks,open,total,solid:true};
  if(open===total){for(let f=0;f<6;f++)masks[f]=0x3f;return {masks,open,total,solid:false};}
  const visited=new Uint8Array(total),queue=new Uint16Array(total);
  for(let seed=0;seed<total;seed++){
    if(!openMask[seed]||visited[seed])continue;
    let head=0,tail=0,touched=0;queue[tail++]=seed;visited[seed]=1;
    while(head<tail){
      const i=queue[head++],ly=Math.floor(i/(S*S)),rem=i-ly*S*S,z=Math.floor(rem/S),x=rem-z*S;
      if(x===S-1)touched|=1<<0;if(x===0)touched|=1<<1;if(ly===h-1)touched|=1<<2;if(ly===0)touched|=1<<3;if(z===S-1)touched|=1<<4;if(z===0)touched|=1<<5;
      for(let f=0;f<6;f++){
        const d=V146_FACE_STEP[f],nx=x+d[0],ny=ly+d[1],nz=z+d[2];
        if(nx<0||nx>=S||ny<0||ny>=h||nz<0||nz>=S)continue;
        const ni=idx(nx,ny,nz);if(!openMask[ni]||visited[ni])continue;visited[ni]=1;queue[tail++]=ni;
      }
    }
    for(let a=0;a<6;a++)if(touched&(1<<a))for(let b=0;b<6;b++)if(touched&(1<<b))masks[a]|=1<<b;
  }
  return {masks,open,total,solid:false};
}

/* Section-local meshing. It intentionally calls the live addQuad/addPlantQuad/addTorchQuad methods,
   so Java texture/tint/torch fixes installed by V14.5 remain authoritative. */
ChunkMesher.prototype.buildSectionV146=function(chunk,sy){
  const positions=[],normals=[],uvs=[],colors=[],buckets={opaque:[],cutout:[],leaves:[],glass:[],water:[]};
  const faceStats={east:0,west:0,up:0,down:0,south:0,north:0},blockStats={},textureStats={},samples=[];
  const size=chunk.size,S=STUDIO_V14_6.sectionSize,y0=sy*S,y1=Math.min(chunk.height,y0+S);let emitted=0,culled=0;
  for(let y=y0;y<y1;y++)for(let z=0;z<size;z++)for(let x=0;x<size;x++){
    const id=chunk.get(x,y,z);if(id===BLOCK.AIR)continue;const wx=chunk.cx*size+x,wz=chunk.cz*size+z;this.currentBlock=id;
    if(id===BLOCK.TORCH||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER){
      if(id===BLOCK.TORCH)this.addTorchQuad(positions,normals,uvs,colors,buckets,wx,y,wz);
      else this.addPlantQuad(positions,normals,uvs,colors,buckets,wx,y,wz,id);
      emitted++;blockStats[BLOCK_NAME[id]||String(id)]=(blockStats[BLOCK_NAME[id]||String(id)]||0)+1;continue;
    }
    for(let fi=0;fi<FACE_DIRS.length;fi++){
      const face=FACE_NAMES[fi],decision=voxelFaceVisibility(this.world,wx,y,wz,id,face);if(!decision.visible){culled++;continue;}
      const tex=this.textureName(id,face);this.addQuad(positions,normals,uvs,colors,buckets,wx,y,wz,face,tex);emitted++;faceStats[face]++;
      blockStats[BLOCK_NAME[id]||String(id)]=(blockStats[BLOCK_NAME[id]||String(id)]||0)+1;textureStats[tex]=(textureStats[tex]||0)+1;
    }
  }
  const ordered=[...buckets.opaque,...buckets.cutout,...buckets.leaves,...buckets.glass,...buckets.water],g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(ordered);
  let offset=0;const ranges=[];for(const kind of ['opaque','cutout','leaves','glass','water']){const count=buckets[kind].length;ranges.push({kind,start:offset,count});if(count)g.addGroup(offset,count,kind==='opaque'?0:kind==='cutout'?1:kind==='leaves'?2:kind==='glass'?3:4);offset+=count;}
  if(ordered.length){g.computeBoundingBox();g.computeBoundingSphere();}
  return {geometry:g,report:{chunk:`${chunk.cx},${chunk.cz}`,section:sy,faces:emitted,culled,faceStats,blockStats,textureStats,samples,groups:ranges}};
};

class SectionVisibilityV146{
  constructor(rr){
    this.rr=rr;this.nodes=new Map();this.chunkNodes=new Map();this.frustum=new THREE.Frustum();this.matrix=new THREE.Matrix4();
    this.visibleKeys=new Set();this.renderVisibleKeys=new Set();this.stats={sections:0,visited:0,rendered:0,frustumRejected:0,portalRejected:0,lastMs:0};
  }
  unregisterChunk(cx,cz){const ck=chunkKey(cx,cz),keys=this.chunkNodes.get(ck)||[];for(const k of keys)this.nodes.delete(k);this.chunkNodes.delete(ck);}
  registerChunk(chunk,group,sectionRecords){
    this.unregisterChunk(chunk.cx,chunk.cz);const keys=[];
    for(const r of sectionRecords){const key=v146SectionKey(chunk.cx,r.sy,chunk.cz),node={key,cx:chunk.cx,sy:r.sy,cz:chunk.cz,mesh:r.mesh||null,group,box:v146SectionBounds(chunk.cx,r.sy,chunk.cz),visibility:r.visibility.masks,solid:r.visibility.solid,open:r.visibility.open};this.nodes.set(key,node);keys.push(key);}
    this.chunkNodes.set(chunkKey(chunk.cx,chunk.cz),keys);
  }
  updateFrustum(){const c=this.rr.camera;if(!c)return false;c.updateMatrixWorld(true);this.matrix.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);const coordinateSystem=this.rr.renderer?.coordinateSystem??THREE.WebGLCoordinateSystem;try{this.frustum.setFromProjectionMatrix(this.matrix,coordinateSystem,!!this.rr.renderer?.reversedDepthBuffer);}catch{this.frustum.setFromProjectionMatrix(this.matrix);}return true;}
  portalAllows(node,entry,exit){return entry<0||!!(node.visibility[entry]&(1<<exit));}
  apply(){
    const start=performance.now(),cam=this.rr.camera;if(!cam||!this.updateFrustum())return this.stats;
    this.visibleKeys.clear();this.renderVisibleKeys.clear();for(const n of this.nodes.values())if(n.mesh)n.mesh.visible=false;
    const S=STUDIO_V14_6.sectionSize,cx=floorDiv(Math.floor(cam.position.x),S),sy=floorDiv(Math.floor(cam.position.y),S),cz=floorDiv(Math.floor(cam.position.z),S),startKey=v146SectionKey(cx,sy,cz);
    const startNode=this.nodes.get(startKey),queue=[],seen=new Map();
    if(startNode)queue.push([startNode,-1]);
    else{
      /* If the camera section has not been built yet, never blank the world: use section frustum only. */
      for(const n of this.nodes.values())if(n.mesh&&n.group.visible!==false&&this.frustum.intersectsBox(n.box)){n.mesh.visible=true;this.visibleKeys.add(n.key);this.renderVisibleKeys.add(n.key);}
      this.stats={sections:this.nodes.size,visited:this.visibleKeys.size,rendered:this.renderVisibleKeys.size,frustumRejected:0,portalRejected:0,lastMs:performance.now()-start,fallback:true};return this.stats;
    }
    let qHead=0;while(qHead<queue.length){const [node,entry]=queue[qHead++],bit=entry<0?0x40:1<<entry,prior=seen.get(node.key)||0;if(prior&bit)continue;seen.set(node.key,prior|bit);this.visibleKeys.add(node.key);
      const parentVisible=node.group.visible!==false,frustumVisible=this.frustum.intersectsBox(node.box);if(node.mesh&&parentVisible&&frustumVisible){node.mesh.visible=true;this.renderVisibleKeys.add(node.key);}
      for(let exit=0;exit<6;exit++){if(!this.portalAllows(node,entry,exit))continue;const d=V146_FACE_STEP[exit],next=this.nodes.get(v146SectionKey(node.cx+d[0],node.sy+d[1],node.cz+d[2]));if(!next)continue;queue.push([next,V146_FACE_OPPOSITE[exit]]);}
    }
    let meshCount=0,frustumRejected=0,portalRejected=0;for(const n of this.nodes.values())if(n.mesh){meshCount++;if(!this.visibleKeys.has(n.key))portalRejected++;else if(!this.renderVisibleKeys.has(n.key)&&n.group.visible!==false)frustumRejected++;}
    this.stats={sections:this.nodes.size,meshedSections:meshCount,visited:this.visibleKeys.size,rendered:this.renderVisibleKeys.size,frustumRejected,portalRejected,lastMs:performance.now()-start,fallback:false};return this.stats;
  }
  sectionForPosition(p){return this.nodes.get(v146SectionKey(floorDiv(Math.floor(p.x),16),floorDiv(Math.floor(p.y),16),floorDiv(Math.floor(p.z),16)))||null;}
  isPositionVisible(p){const n=this.sectionForPosition(p);return !n||this.renderVisibleKeys.has(n.key);}
}

function v146EnsureSections(rr){if(!rr.sectionVisibilityV146)rr.sectionVisibilityV146=new SectionVisibilityV146(rr);return rr.sectionVisibilityV146;}

function v146CombineReports(reports,cx,cz){const out={chunk:`${cx},${cz}`,faces:0,culled:0,faceStats:{east:0,west:0,up:0,down:0,south:0,north:0},blockStats:{},textureStats:{},samples:[],groups:[]};for(const r of reports){out.faces+=r.faces||0;out.culled+=r.culled||0;for(const k of Object.keys(out.faceStats))out.faceStats[k]+=r.faceStats?.[k]||0;for(const [k,v] of Object.entries(r.blockStats||{}))out.blockStats[k]=(out.blockStats[k]||0)+v;for(const [k,v] of Object.entries(r.textureStats||{}))out.textureStats[k]=(out.textureStats[k]||0)+v;}return out;}

/* Replace whole-column meshes with real 16x16x16 render-section meshes. */
VoxelRenderer.prototype.rebuildChunk=function(chunk){
  const key=chunkKey(chunk.cx,chunk.cz),old=this.chunkMeshes.get(key);if(old){this.chunkGroup.remove(old);v146DisposeObject(old);this.chunkMeshes.delete(key);}v146EnsureSections(this).unregisterChunk(chunk.cx,chunk.cz);
  const group=new THREE.Group();group.name=`chunk_sections_${key}`;group.userData.v146Chunk=true;group.userData.cx=chunk.cx;group.userData.cz=chunk.cz;const records=[],reports=[],count=Math.ceil(chunk.height/STUDIO_V14_6.sectionSize);
  for(let sy=0;sy<count;sy++){
    const visibility=v146ComputePortalVisibility(chunk,sy),built=this.mesher.buildSectionV146(chunk,sy),g=built.geometry;reports.push(built.report);let mesh=null;
    if(g.index?.count){mesh=new THREE.Mesh(g,this.materials);mesh.name=`section_${chunk.cx}_${sy}_${chunk.cz}`;mesh.frustumCulled=true;mesh.userData.v146Section=true;mesh.userData.sectionKey=v146SectionKey(chunk.cx,sy,chunk.cz);mesh.userData.portalVisibility=Array.from(visibility.masks);group.add(mesh);}else g.dispose();records.push({sy,mesh,visibility});
  }
  this.chunkGroup.add(group);this.chunkMeshes.set(key,group);chunk.mesh=group;chunk.dirty=false;this.chunkReports.set(key,v146CombineReports(reports,chunk.cx,chunk.cz));v146EnsureSections(this).registerChunk(chunk,group,records);this.updateDiagnostics();
};
VoxelRenderer.prototype.detachChunk=function(chunk){const key=chunkKey(chunk.cx,chunk.cz),obj=this.chunkMeshes.get(key);if(obj){this.chunkGroup.remove(obj);v146DisposeObject(obj);this.chunkMeshes.delete(key);}v146EnsureSections(this).unregisterChunk(chunk.cx,chunk.cz);this.chunkReports.delete(key);this.updateDiagnostics();};

/* Apply portal traversal after every existing distance/frustum/LOD pass. */
const v146UpdateLODBase=VoxelRenderer.prototype.updateLOD;
VoxelRenderer.prototype.updateLOD=function(...args){const r=v146UpdateLODBase.apply(this,args);v146EnsureSections(this).apply();return r;};

class FineEntityOcclusionV146{
  constructor(gameRef){this.game=gameRef;this.cache=new WeakMap();this.cursor=0;this.mobile=matchMedia('(pointer:coarse)').matches;}
  trace(target){const origin=this.game.renderer.camera.position,dir=target.clone().sub(origin),dist=dir.length();if(dist<10)return true;dir.multiplyScalar(1/Math.max(.001,dist));const step=.72,tmp=new THREE.Vector3();for(let t=1.2;t<dist-.75;t+=step){tmp.copy(origin).addScaledVector(dir,t);const id=this.game.world.getLoaded(Math.floor(tmp.x),Math.floor(tmp.y),Math.floor(tmp.z));if(OPAQUE_BLOCKS.has(id))return false;}return true;}
  update(){const mobs=this.game.mobs?.mobs||[],vis=this.game.renderer?.sectionVisibilityV146;if(!mobs.length||!vis)return;let budget=this.mobile?2:4;while(budget--&&mobs.length){this.cursor%=mobs.length;const m=mobs[this.cursor++],d=m.position.distanceTo(this.game.player.position);if(d<10||d>58||!vis.isPositionVisible(m.position)){this.cache.set(m,{visible:d<10,at:performance.now()});continue;}this.cache.set(m,{visible:this.trace(m.position.clone().add(new THREE.Vector3(0,.75,0))),at:performance.now()});}}
  visibleFor(mob){const e=this.cache.get(mob);if(!e||performance.now()-e.at>900)return true;return e.visible;}
}

/* Section visibility is also a cheap first-stage entity/drop culler. Near objects always stay visible and
   a short hysteresis window prevents one-frame flicker at portal boundaries. */
function v146CullDynamicObjects(){
  const vis=game.renderer?.sectionVisibilityV146,p=game.player?.position;if(!vis||!p)return;const now=performance.now(),fine=game.entityOcclusionV146;
  const apply=(obj,pos,mob=null)=>{if(!obj||!pos)return;const near=pos.distanceTo?.(p)<=STUDIO_V14_6.nearEntityAlwaysVisible;let seen=near||vis.isPositionVisible(pos);if(seen&&!near&&mob&&fine)seen=fine.visibleFor(mob);if(seen)obj.userData.v146LastVisible=now;obj.visible=seen||now-(obj.userData.v146LastVisible||0)<STUDIO_V14_6.cullHysteresisMs;};
  for(const m of game.mobs?.mobs||[])apply(m.model||m.mesh,m.position,m);for(const d of game.drops?.items||[])apply(d.mesh,d.position);for(const q of game.particles?.items||[])apply(q.mesh,q.mesh?.position);
}
const v146GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v146GameUpdateBase.call(this,dt);this.entityOcclusionV146??=new FineEntityOcclusionV146(this);this.entityOcclusionV146.update();v146CullDynamicObjects();return r;};

try{runtimeCommands.register('sections',()=>({version:STUDIO_V14_6.version,...(game.renderer?.sectionVisibilityV146?.stats||{}),chunks:game.renderer?.chunkMeshes?.size||0}), 'Inspect V14.6 16^3 section/portal visibility stats.');}catch{}
window.__voxelDiag?.log?.('V14.6A READY: real 16×16×16 render sections + cached directional portal visibility + BFS occlusion + section-aware entity culling installed.','ok');
