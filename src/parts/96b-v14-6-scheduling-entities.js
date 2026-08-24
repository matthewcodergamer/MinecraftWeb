/* ===================== V14.6B: PRIORITY SCHEDULING + LITHIUM/IMMEDIATELYFAST-STYLE HOTPATHS ===================== */
class SpatialEntityIndexV146{
  constructor(cell=16){this.cell=cell;this.cells=new Map();this.count=0;this.lastBuild=0;}
  key(x,y,z){const s=this.cell;return `${floorDiv(Math.floor(x),s)},${floorDiv(Math.floor(y),s)},${floorDiv(Math.floor(z),s)}`;}
  clear(){this.cells.clear();this.count=0;}
  add(entity,pos=entity?.position){if(!pos)return;const k=this.key(pos.x,pos.y,pos.z),a=this.cells.get(k)||[];a.push(entity);this.cells.set(k,a);this.count++;}
  rebuild(gameRef){this.clear();for(const m of gameRef.mobs?.mobs||[])this.add(m);for(const d of gameRef.drops?.items||[])this.add(d);this.lastBuild=performance.now();}
  query(pos,radius=16){const s=this.cell,out=[],n=Math.ceil(radius/s),cx=floorDiv(Math.floor(pos.x),s),cy=floorDiv(Math.floor(pos.y),s),cz=floorDiv(Math.floor(pos.z),s),r2=radius*radius;for(let dy=-n;dy<=n;dy++)for(let dz=-n;dz<=n;dz++)for(let dx=-n;dx<=n;dx++){const a=this.cells.get(`${cx+dx},${cy+dy},${cz+dz}`);if(!a)continue;for(const e of a){const p=e.position;if(p&&p.distanceToSquared(pos)<=r2)out.push(e);}}return out;}
}
function v146ChunkPriority(chunk,player,dirty=false){
  const pcx=floorDiv(Math.floor(player.position.x),16),pcz=floorDiv(Math.floor(player.position.z),16),dx=chunk.cx-pcx,dz=chunk.cz-pcz,d2=dx*dx+dz*dz;
  const f=yawForward(player.yaw||0),len=Math.hypot(dx,dz)||1,dot=(dx/len)*f.x+(dz/len)*f.z,behind=dot<-.15?2.5:dot<.25?.65:0;
  return d2+behind-(dirty?1.4:0);
}

/* Replace Set insertion-order rebuilds with camera/distance priority. Work stays bounded: one build on phones
   by default, with the performance governor allowed to raise the budget only when there is spare frame time. */
World.prototype.tickQueues=function(renderer){
  const player=renderer.player;if(!player)return;const pcx=floorDiv(Math.floor(player.position.x),16),pcz=floorDiv(Math.floor(player.position.z),16),maxBuilds=Math.max(1,Math.min(3,Number(this.v146BuildBudget)||1));let work=0;
  const jobs=[];
  for(const c of this.chunks.values()){
    const dx=c.cx-pcx,dz=c.cz-pcz;if(Math.max(Math.abs(dx),Math.abs(dz))>(this.viewDistance||ENGINE.VIEW_DISTANCE)+1)continue;const key=chunkKey(c.cx,c.cz);
    if(!renderer.chunkMeshes.has(key))jobs.push({kind:'attach',c,key,score:v146ChunkPriority(c,player,false)});
    else if(this.dirtyChunks.has(key))jobs.push({kind:'rebuild',c,key,score:v146ChunkPriority(c,player,true)});
  }
  jobs.sort((a,b)=>a.score-b.score);
  for(const j of jobs){if(work>=maxBuilds)break;if(j.kind==='attach')renderer.attachChunk(j.c);else{this.dirtyChunks.delete(j.key);renderer.rebuildChunk(j.c);}work++;}

  let loads=0,maxLoads=Math.max(1,Math.min(2,Number(this.v146LoadBudget)||1));
  if(work<maxBuilds&&this.loadQueue.length){
    for(const q of this.loadQueue){const pseudo={cx:q.cx,cz:q.cz};q.v146Score=v146ChunkPriority(pseudo,player,false);}this.loadQueue.sort((a,b)=>(a.v146Score??a.d??0)-(b.v146Score??b.d??0));
    const seen=new Set();while(loads<maxLoads&&this.loadQueue.length&&work<maxBuilds){const q=this.loadQueue.shift(),key=chunkKey(q.cx,q.cz);if(seen.has(key))continue;seen.add(key);const qdx=q.cx-pcx,qdz=q.cz-pcz;if(Math.max(Math.abs(qdx),Math.abs(qdz))>(this.viewDistance||ENGINE.VIEW_DISTANCE)+1)continue;if(!this.getChunk(q.cx,q.cz)){const c=this.ensureChunk(q.cx,q.cz);renderer.attachChunk(c);work++;loads++;}}
  }
  for(const [key,c] of [...this.chunks]){const dx=c.cx-pcx,dz=c.cz-pcz;if(Math.max(Math.abs(dx),Math.abs(dz))>(this.viewDistance||ENGINE.VIEW_DISTANCE)+1){renderer.detachChunk(c);this.chunks.delete(key);this.dirtyChunks.delete(key);}}
};


/* Heightmap cache: repeated mob/drop/spawn ground queries no longer scan all 96 Y levels unless the
   x/z column actually changed. World.set invalidates exactly one column. */
const v146WorldSetHeightBase=World.prototype.set;
World.prototype.set=function(x,y,z,id){const changed=v146WorldSetHeightBase.call(this,x,y,z,id);if(changed)this._heightCacheV146?.delete?.(`${Math.floor(x)},${Math.floor(z)}`);return changed;};
const v146HighestSolidBase=World.prototype.highestSolidY;
World.prototype.highestSolidY=function(x,z){this._heightCacheV146??=new Map();const k=`${Math.floor(x)},${Math.floor(z)}`;if(this._heightCacheV146.has(k))return this._heightCacheV146.get(k);const y=v146HighestSolidBase.call(this,x,z);if(this._heightCacheV146.size>8192)this._heightCacheV146.clear();this._heightCacheV146.set(k,y);return y;};

function v146AIIntervalFor(mob){const p=game.player?.position;if(!p||!mob?.position)return .2;const d=mob.position.distanceTo(p);return d<=16?.10:d<=32?.20:d<=48?.50:1.0;}
if(typeof BedrockBehaviorControllerV14!=='undefined'){
  const v146SelectTargetsBase=BedrockBehaviorControllerV14.prototype.selectTargets;
  BedrockBehaviorControllerV14.prototype.selectTargets=function(){const now=performance.now(),interval=v146AIIntervalFor(this.mob)*1000;if(now<(this._v146NextTargetScan||0))return;this._v146NextTargetScan=now+interval;return v146SelectTargetsBase.call(this);};
  const v146ComponentEventsBase=BedrockBehaviorControllerV14.prototype.updateComponentEvents;
  BedrockBehaviorControllerV14.prototype.updateComponentEvents=function(dt){this._v146EventAccum=(this._v146EventAccum||0)+dt;const interval=Math.max(.15,v146AIIntervalFor(this.mob));if(this._v146EventAccum<interval)return;const elapsed=this._v146EventAccum;this._v146EventAccum=0;return v146ComponentEventsBase.call(this,elapsed);};
}
if(typeof BedrockAnimationControllerV2!=='undefined'){
  const v146AnimBase=BedrockAnimationControllerV2.prototype.update;
  BedrockAnimationControllerV2.prototype.update=function(state,time,mob){const p=game.player?.position,d=mob?.position&&p?mob.position.distanceTo(p):0,skip=d>48?5:d>32?2:0;if(skip){this._v146AnimFrame=(this._v146AnimFrame||0)+1;if(this._v146AnimFrame%(skip+1)!==0)return;}return v146AnimBase.call(this,state,time,mob);};
}

/* One GPU draw for the common break particles instead of one Mesh draw per cube. */
class InstancedParticleSystemV146{
  constructor(scene){this.scene=scene;this.items=[];this.max=matchMedia('(pointer:coarse)').matches?192:384;this.geometry=new THREE.BoxGeometry(.045,.045,.045);this.material=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});this.mesh=new THREE.InstancedMesh(this.geometry,this.material,this.max);this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.count=0;this.mesh.frustumCulled=true;this.mesh.name='particles_instanced_v146';this.tmp=new THREE.Object3D();scene.add(this.mesh);}
  spawnBurst(pos,count=8){const player=game.player?.position,dist=player?pos.distanceTo(player):0,vis=game.renderer?.sectionVisibilityV146;if(vis&&!vis.isPositionVisible(pos)&&dist>8)return;let scale=game.performanceV146?.particleScale??1;if(dist>32)scale*=.35;else if(dist>20)scale*=.65;count=Math.max(0,Math.round(count*scale));for(let i=0;i<count&&this.items.length<this.max;i++)this.items.push({position:pos.clone(),age:0,life:.35+Math.random()*.45,velocity:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3),spin:Math.random()*6});}
  update(dt){const a=this.items;for(let i=a.length-1;i>=0;i--){const p=a[i];p.age+=dt;if(p.age>=p.life){a.splice(i,1);continue;}p.velocity.y-=18*dt;p.position.addScaledVector(p.velocity,dt);p.spin+=dt*3;}
    const n=Math.min(a.length,this.max);this.mesh.count=n;for(let i=0;i<n;i++){const p=a[i],s=Math.max(.01,1-p.age/p.life);this.tmp.position.copy(p.position);this.tmp.rotation.set(p.spin*.3,p.spin,0);this.tmp.scale.setScalar(s);this.tmp.updateMatrix();this.mesh.setMatrixAt(i,this.tmp.matrix);}if(n)this.mesh.instanceMatrix.needsUpdate=true;
  }
  dispose(){this.scene.remove(this.mesh);this.geometry.dispose();this.material.dispose();}
}

const v146BootSchedulingBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v146BootSchedulingBase.apply(this,args);this.spatialV146??=new SpatialEntityIndexV146(16);if(!(this.particles instanceof InstancedParticleSystemV146)){this.particles?.items?.forEach?.(p=>p.mesh?.parent?.remove?.(p.mesh));this.particles=new InstancedParticleSystemV146(this.renderer.scene);}window.__voxelDiag?.log?.('V14.6B READY: prioritized chunk rebuild/load scheduling, spatial entity index, distance-tiered AI scans/animation, and one-draw instanced break particles active.','ok');};

const v146SpatialUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v146SpatialUpdateBase.call(this,dt);this._v146SpatialClock=(this._v146SpatialClock||0)-dt;if(this._v146SpatialClock<=0){this._v146SpatialClock=.20;this.spatialV146?.rebuild(this);}return r;};
try{runtimeCommands.register('spatial',(radius=16)=>({indexed:game.spatialV146?.count||0,cells:game.spatialV146?.cells?.size||0,near:game.spatialV146?.query?.(game.player.position,Number(radius)||16)?.length||0}), 'Inspect V14.6 spatial entity index.');}catch{}
