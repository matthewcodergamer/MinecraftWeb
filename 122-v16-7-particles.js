/* Minecraft Web V16.7 — client-only Java-style batched billboard particles, dynamic block fragments and mobile-safe culling. */
(function(){
'use strict';

const BUILD='0.16.7';
const ATLAS_COLS=8,ATLAS_ROWS=8,ATLAS_TILE=16,ATLAS_SLOTS=64;
const BLOCK_TILE_FIRST=56,BLOCK_TILE_LAST=63;
const MODE_KEY='mcParticleModeV167';
const VALID_MODES=new Set(['ALL','DECREASED','MINIMAL']);
const ESSENTIAL_TYPES=new Set(['critical_hit','enchanted_hit','damage','explosion','sweep']);
const KILL_ON_SOLID=1,REQUIRE_WATER=2,ANCHOR_FOLLOW=4,POP_ON_WATER_EXIT=8;
const clamp167=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand167=(a=0,b=1)=>a+Math.random()*(b-a);
const blockKey167=(x,y,z)=>`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;

const TYPE={
  flame:{tile:1,life:[.28,.58],size:[.10,.18],endSize:.72,vy:[.35,.9],vx:.12,vz:.12,gravity:-.15,drag:.88,color:[1,1,1,1]},
  campfire_cosy_smoke:{tile:20,frames:12,fps:10,life:[2.8,4.6],size:[.28,.42],endSize:2.5,vy:[.22,.48],vx:.09,vz:.09,gravity:-.02,drag:.975,color:[.9,.9,.9,.82],longDistance:true},
  bubble:{tile:2,life:[.65,1.55],size:[.08,.13],endSize:1.05,vy:[.65,1.25],vx:.08,vz:.08,gravity:-.18,drag:.97,color:[1,1,1,.92],flags:REQUIRE_WATER|POP_ON_WATER_EXIT},
  bubble_pop:{tile:32,frames:5,fps:24,life:[.16,.22],size:[.10,.15],endSize:1.35,vy:[.04,.16],vx:.04,vz:.04,gravity:0,drag:.92,color:[1,1,1,.95]},
  splash:{tile:3,frames:4,fps:18,life:[.32,.62],size:[.10,.19],endSize:.72,vy:[1.3,2.9],vx:1.0,vz:1.0,gravity:7.5,drag:.96,color:[1,1,1,.9],flags:KILL_ON_SOLID},
  dripping_water:{tile:7,life:[1.15,2.1],size:[.08,.12],endSize:.85,vy:[-.12,-.04],vx:.01,vz:.01,gravity:3.8,drag:.995,color:[.36,.68,1,.92],flags:KILL_ON_SOLID,hang:.34},
  dripping_lava:{tile:7,life:[1.0,1.8],size:[.09,.13],endSize:.9,vy:[-.08,-.02],vx:.01,vz:.01,gravity:3.3,drag:.995,color:[1,.42,.06,.96],flags:KILL_ON_SOLID,hang:.30},
  ambient_entity_effect:{tile:12,frames:8,fps:12,life:[.55,1.2],size:[.10,.17],endSize:1.05,vy:[.08,.26],vx:.08,vz:.08,gravity:-.02,drag:.94,color:[1,1,1,.72]},
  heart:{tile:10,life:[.85,1.25],size:[.22,.30],endSize:1.1,vy:[.28,.55],vx:.04,vz:.04,gravity:-.015,drag:.94,color:[1,1,1,1]},
  critical_hit:{tile:11,life:[.18,.36],size:[.10,.19],endSize:.38,vy:[.35,1.35],vx:1.15,vz:1.15,gravity:2.2,drag:.91,color:[1,1,1,1]},
  enchanted_hit:{tile:38,life:[.20,.42],size:[.11,.20],endSize:.42,vy:[.25,1.2],vx:1.1,vz:1.1,gravity:1.8,drag:.91,color:[.75,.42,1,1]},
  damage:{tile:39,life:[.25,.42],size:[.14,.22],endSize:.78,vy:[.25,.75],vx:.25,vz:.25,gravity:1.5,drag:.94,color:[1,1,1,1]},
  sweep:{tile:40,frames:8,fps:28,life:[.22,.32],size:[.65,.9],endSize:1.12,vy:[.01,.04],vx:.02,vz:.02,gravity:0,drag:.98,color:[1,1,1,.95]},
  explosion:{tile:0,life:[.35,.65],size:[.55,.9],endSize:1.75,vy:[.12,.75],vx:.7,vz:.7,gravity:.8,drag:.92,color:[1,.82,.62,.96]},
  block:{tile:0,life:[.38,.78],size:[.075,.12],endSize:.42,vy:[1.0,2.9],vx:1.5,vz:1.5,gravity:8.8,drag:.96,color:[1,1,1,1],flags:KILL_ON_SOLID}
};

const atlasAssets167=[
  [1,'flame.png'],[2,'bubble.png'],
  [3,'splash_0.png'],[4,'splash_1.png'],[5,'splash_2.png'],[6,'splash_3.png'],
  [7,'drip_fall.png'],[8,'drip_hang.png'],[9,'drip_land.png'],[10,'heart.png'],[11,'critical_hit.png'],
  ...Array.from({length:8},(_,i)=>[12+i,`effect_${i}.png`]),
  ...Array.from({length:12},(_,i)=>[20+i,`big_smoke_${i}.png`]),
  ...Array.from({length:5},(_,i)=>[32+i,`bubble_pop_${i}.png`]),
  [37,'lava.png'],[38,'enchanted_hit.png'],[39,'damage.png'],
  ...Array.from({length:8},(_,i)=>[40+i,`sweep_${i}.png`]),
  ...Array.from({length:8},(_,i)=>[48+i,`spell_${i}.png`])
];

function rgba167(value,fallback=[1,1,1,1]){
  if(Array.isArray(value))return [clamp167(Number(value[0])||0,0,1),clamp167(Number(value[1])||0,0,1),clamp167(Number(value[2])||0,0,1),clamp167(value.length>3?Number(value[3]):1,0,1)];
  if(typeof value==='number')return [((value>>16)&255)/255,((value>>8)&255)/255,(value&255)/255,1];
  if(typeof value==='string'){
    const s=value.replace('#','');if(/^[0-9a-f]{6}$/i.test(s)){const n=parseInt(s,16);return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255,1]}
  }
  return fallback.slice();
}

function blockTextureName167(id){
  try{
    const spec=BLOCK_FACE_TEXTURE?.[id];
    if(!spec)return null;
    return spec.all||spec.side||spec.up||spec.north||spec.south||spec.east||spec.west||Object.values(spec).find(v=>typeof v==='string')||null;
  }catch{return null}
}

class ParticleManagerV167{
  constructor(gameRef){
    this.game=gameRef;this.scene=gameRef?.renderer?.scene;this.camera=gameRef?.renderer?.camera;this.world=gameRef?.world;
    this.items=[]; // compatibility with legacy code that iterates mesh-per-particle items
    const touch=('ontouchstart' in window)||(navigator.maxTouchPoints||0)>0;
    this.capacity=touch?2048:4096;this.count=0;this.mode=this.readMode();
    this.stats={spawned:0,dropped:0,culledDistance:0,culledSetting:0,killedCollision:0,pops:0};
    this.dynamicBlockTiles=new Map();this.nextBlockTile=BLOCK_TILE_FIRST;this.blockTilePromises=new Map();
    this._lastBlockBreakAt=-1e9;this._lastBlockBreakPos=new THREE.Vector3();
    this._movePrev=gameRef?.player?.position?.clone?.()||new THREE.Vector3();this._moveAccum=0;this._swimAccum=0;this._stepAccum=0;this._dripAccum=0;this._wasInWater=false;
    this.makeAtlas();this.makeBuffers();this.makeRenderObject();this.loadAtlasAssets();this.installOptionsUI();
  }
  readMode(){const v=String(localStorage.getItem(MODE_KEY)||'ALL').toUpperCase();return VALID_MODES.has(v)?v:'ALL'}
  setMode(v){const n=String(v||'').toUpperCase();if(VALID_MODES.has(n)){this.mode=n;try{localStorage.setItem(MODE_KEY,n)}catch{};this.syncOptionsUI()}return this.mode}
  makeAtlas(){
    const c=document.createElement('canvas');c.width=ATLAS_COLS*ATLAS_TILE;c.height=ATLAS_ROWS*ATLAS_TILE;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;
    x.clearRect(0,0,c.width,c.height);
    // Slot 0 is a deterministic white pixel-cloud fallback so effects are usable before async assets finish.
    x.fillStyle='rgba(255,255,255,1)';x.fillRect(5,5,6,6);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(3,7,10,2);x.fillRect(7,3,2,10);
    for(let i=BLOCK_TILE_FIRST;i<=BLOCK_TILE_LAST;i++){const [px,py]=this.tileOrigin(i);x.fillStyle='rgba(255,255,255,.95)';x.fillRect(px+2,py+2,12,12)}
    this.atlasCanvas=c;this.atlasCtx=x;this.atlasTexture=new THREE.CanvasTexture(c);this.atlasTexture.magFilter=THREE.NearestFilter;this.atlasTexture.minFilter=THREE.NearestFilter;this.atlasTexture.generateMipmaps=false;this.atlasTexture.colorSpace=THREE.SRGBColorSpace;this.atlasReady=false;
  }
  tileOrigin(tile){return[(tile%ATLAS_COLS)*ATLAS_TILE,Math.floor(tile/ATLAS_COLS)*ATLAS_TILE]}
  async drawAsset(tile,file){
    try{const img=await this.game.assets.image(`./assets/java/26.1/particle/${file}`);const [x,y]=this.tileOrigin(tile);this.atlasCtx.clearRect(x,y,ATLAS_TILE,ATLAS_TILE);this.atlasCtx.imageSmoothingEnabled=false;this.atlasCtx.drawImage(img,0,0,img.width||ATLAS_TILE,img.height||ATLAS_TILE,x,y,ATLAS_TILE,ATLAS_TILE);this.atlasTexture.needsUpdate=true;return true}catch{return false}
  }
  async loadAtlasAssets(){const jobs=atlasAssets167.map(([t,f])=>this.drawAsset(t,f));const r=await Promise.allSettled(jobs);this.atlasReady=r.some(x=>x.status==='fulfilled'&&x.value===true)}
  makeBuffers(){
    const n=this.capacity;
    this.pos=new Float32Array(n*3);this.vel=new Float32Array(n*3);this.col=new Float32Array(n*4);this.size=new Float32Array(n);this.startSize=new Float32Array(n);this.endScale=new Float32Array(n);this.tile=new Float32Array(n);
    this.age=new Float32Array(n);this.life=new Float32Array(n);this.gravity=new Float32Array(n);this.drag=new Float32Array(n);this.baseTile=new Uint8Array(n);this.frames=new Uint8Array(n);this.fps=new Float32Array(n);this.flags=new Uint8Array(n);this.hang=new Float32Array(n);this.types=new Array(n);this.anchors=new Array(n);this.anchorOffset=new Array(n);
    const g=new THREE.BufferGeometry();
    this.posAttr=new THREE.BufferAttribute(this.pos,3);this.colorAttr=new THREE.BufferAttribute(this.col,4);this.sizeAttr=new THREE.BufferAttribute(this.size,1);this.tileAttr=new THREE.BufferAttribute(this.tile,1);
    for(const a of [this.posAttr,this.colorAttr,this.sizeAttr,this.tileAttr])a.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position',this.posAttr);g.setAttribute('particleColor',this.colorAttr);g.setAttribute('particleSize',this.sizeAttr);g.setAttribute('particleTile',this.tileAttr);g.setDrawRange(0,0);this.geometry=g;
  }
  makeRenderObject(){
    this.material=new THREE.ShaderMaterial({uniforms:{atlas:{value:this.atlasTexture},pixelRatio:{value:Math.min(2,window.devicePixelRatio||1)},atlasCols:{value:ATLAS_COLS},atlasRows:{value:ATLAS_ROWS}},transparent:true,depthTest:true,depthWrite:false,toneMapped:false,vertexColors:false,blending:THREE.NormalBlending,vertexShader:`
      attribute vec4 particleColor;attribute float particleSize;attribute float particleTile;varying vec4 vColor;varying float vTile;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float z=max(1.0,-mv.z);gl_PointSize=clamp(particleSize*320.0*pixelRatio/z,1.0,96.0);gl_Position=projectionMatrix*mv;vColor=particleColor;vTile=particleTile;}
    `,fragmentShader:`
      uniform sampler2D atlas;uniform float atlasCols;uniform float atlasRows;varying vec4 vColor;varying float vTile;
      void main(){float col=mod(vTile,atlasCols);float row=floor(vTile/atlasCols);vec2 p=vec2(gl_PointCoord.x,1.0-gl_PointCoord.y);vec2 uv=(vec2(col,row)+p)/vec2(atlasCols,atlasRows);vec4 tex=texture2D(atlas,uv);vec4 outc=tex*vColor;if(outc.a<0.035)discard;gl_FragColor=outc;}
    `});
    this.points=new THREE.Points(this.geometry,this.material);this.points.name='java_particles_v167';this.points.frustumCulled=false;this.points.renderOrder=14;this.scene?.add?.(this.points);
  }
  installOptionsUI(){
    const root=document.getElementById('voxelOptions');if(!root||document.getElementById('particleModeV167'))return;
    const row=document.createElement('div');row.className='voxOptRow';row.innerHTML='<label><span>Particles</span><b id="particleModeValueV167">ALL</b></label><select id="particleModeV167"><option>ALL</option><option>DECREASED</option><option>MINIMAL</option></select>';root.appendChild(row);
    const sel=row.querySelector('select');sel.value=this.mode;sel.onchange=()=>this.setMode(sel.value);this.syncOptionsUI();
  }
  syncOptionsUI(){const s=document.getElementById('particleModeV167'),v=document.getElementById('particleModeValueV167');if(s)s.value=this.mode;if(v)v.textContent=this.mode}
  shouldSpawn(type,pos,opts={}){
    if(this.count>=this.capacity){this.stats.dropped++;return false}
    const ref=this.game?.player?.position||this.camera?.position;
    const max=opts.longDistance||TYPE[type]?.longDistance?96:32;
    if(ref&&pos&&ref.distanceToSquared(pos)>max*max){this.stats.culledDistance++;return false}
    const essential=opts.essential||ESSENTIAL_TYPES.has(type);
    if(this.mode==='DECREASED'&&!essential&&Math.random()<.5){this.stats.culledSetting++;return false}
    if(this.mode==='MINIMAL'&&!essential&&Math.random()<.88){this.stats.culledSetting++;return false}
    return true;
  }
  spawn(type,pos,opts={}){
    const spec=TYPE[type]||TYPE.critical_hit;const p=pos?.isVector3?pos:new THREE.Vector3(Number(pos?.x)||0,Number(pos?.y)||0,Number(pos?.z)||0);
    if(!this.shouldSpawn(type,p,opts))return -1;
    const i=this.count++,p3=i*3,c4=i*4;const life=opts.life??rand167(spec.life?.[0]??.3,spec.life?.[1]??.6),baseSize=opts.size??rand167(spec.size?.[0]??.1,spec.size?.[1]??.2);
    this.pos[p3]=p.x+(opts.jitterX?rand167(-opts.jitterX,opts.jitterX):0);this.pos[p3+1]=p.y+(opts.jitterY?rand167(-opts.jitterY,opts.jitterY):0);this.pos[p3+2]=p.z+(opts.jitterZ?rand167(-opts.jitterZ,opts.jitterZ):0);
    const vx=opts.vx??rand167(-(spec.vx||0),spec.vx||0),vy=opts.vy??rand167(spec.vy?.[0]??0,spec.vy?.[1]??0),vz=opts.vz??rand167(-(spec.vz||0),spec.vz||0);this.vel[p3]=vx;this.vel[p3+1]=vy;this.vel[p3+2]=vz;
    const color=rgba167(opts.color,spec.color||[1,1,1,1]);this.col[c4]=color[0];this.col[c4+1]=color[1];this.col[c4+2]=color[2];this.col[c4+3]=color[3];
    this.startSize[i]=baseSize;this.size[i]=baseSize;this.endScale[i]=opts.endSize??spec.endSize??1;this.age[i]=0;this.life[i]=life;this.gravity[i]=opts.gravity??spec.gravity??0;this.drag[i]=opts.drag??spec.drag??1;
    this.baseTile[i]=opts.tile??spec.tile??0;this.frames[i]=opts.frames??spec.frames??1;this.fps[i]=opts.fps??spec.fps??0;this.tile[i]=this.baseTile[i];this.flags[i]=(opts.flags??spec.flags??0)|(opts.anchor?ANCHOR_FOLLOW:0);this.hang[i]=opts.hang??spec.hang??0;this.types[i]=type;
    this.anchors[i]=opts.anchor||null;this.anchorOffset[i]=opts.anchor?new THREE.Vector3(this.pos[p3]-opts.anchor.position.x,this.pos[p3+1]-opts.anchor.position.y,this.pos[p3+2]-opts.anchor.position.z):null;
    this.stats.spawned++;this.updateDrawRange();return i;
  }
  spawnBurst(pos,count=8){
    if(performance.now()-this._lastBlockBreakAt<90&&this._lastBlockBreakPos.distanceToSquared(pos)<1.7)return;
    for(let i=0;i<count;i++)this.spawn('critical_hit',pos,{size:rand167(.07,.13),vx:rand167(-1.5,1.5),vy:rand167(.2,2.2),vz:rand167(-1.5,1.5)});
  }
  async ensureBlockTile(id){
    id=Number(id)||0;if(this.dynamicBlockTiles.has(id))return this.dynamicBlockTiles.get(id);if(this.blockTilePromises.has(id))return this.blockTilePromises.get(id);if(this.nextBlockTile>BLOCK_TILE_LAST)return 0;
    const tile=this.nextBlockTile++;this.dynamicBlockTiles.set(id,tile);
    const work=(async()=>{try{const name=blockTextureName167(id);if(!name)return tile;const img=await this.game.resolver?.loadTexture?.(name);if(!img)return tile;const [dx,dy]=this.tileOrigin(tile),w=img.width||16,h=img.height||16,sw=Math.max(1,Math.floor(w/4)),sh=Math.max(1,Math.floor(h/4)),sx=Math.floor(Math.random()*Math.max(1,w-sw+1)),sy=Math.floor(Math.random()*Math.max(1,h-sh+1));this.atlasCtx.clearRect(dx,dy,ATLAS_TILE,ATLAS_TILE);this.atlasCtx.imageSmoothingEnabled=false;this.atlasCtx.drawImage(img,sx,sy,sw,sh,dx,dy,ATLAS_TILE,ATLAS_TILE);this.atlasTexture.needsUpdate=true}catch{}return tile})().finally(()=>this.blockTilePromises.delete(id));
    this.blockTilePromises.set(id,work);return work;
  }
  spawnBlockBreak(pos,id,count=18){
    id=Number(id)||0;const known=this.dynamicBlockTiles.get(id);const tile=known??(this.nextBlockTile<=BLOCK_TILE_LAST?this.nextBlockTile:0);this.ensureBlockTile(id);
    this._lastBlockBreakAt=performance.now();this._lastBlockBreakPos.copy(pos);
    for(let i=0;i<count;i++)this.spawn('block',pos,{tile,jitterX:.32,jitterY:.32,jitterZ:.32,vx:rand167(-1.65,1.65),vy:rand167(.8,3.1),vz:rand167(-1.65,1.65),size:rand167(.075,.13)});
  }
  spawnBlockStep(pos,id,count=2){const known=this.dynamicBlockTiles.get(Number(id)||0);this.ensureBlockTile(id);for(let i=0;i<count;i++)this.spawn('block',pos,{tile:known??0,jitterX:.24,jitterY:.03,jitterZ:.24,vx:rand167(-.35,.35),vy:rand167(.08,.38),vz:rand167(-.35,.35),gravity:5.5,life:rand167(.18,.38),size:rand167(.055,.09)})}
  burst(type,pos,count,opts={}){for(let i=0;i<count;i++)this.spawn(type,pos,opts)}
  kill(i,reason=''){
    if(i<0||i>=this.count)return;const last=this.count-1;if(reason==='collision')this.stats.killedCollision++;
    if(i!==last)this.copySlot(last,i);this.types[last]=null;this.anchors[last]=null;this.anchorOffset[last]=null;this.count--;this.updateDrawRange();
  }
  copySlot(a,b){
    for(let k=0;k<3;k++){this.pos[b*3+k]=this.pos[a*3+k];this.vel[b*3+k]=this.vel[a*3+k]}
    for(let k=0;k<4;k++)this.col[b*4+k]=this.col[a*4+k];
    for(const arr of [this.size,this.startSize,this.endScale,this.tile,this.age,this.life,this.gravity,this.drag,this.fps,this.hang])arr[b]=arr[a];
    for(const arr of [this.baseTile,this.frames,this.flags])arr[b]=arr[a];this.types[b]=this.types[a];this.anchors[b]=this.anchors[a];this.anchorOffset[b]=this.anchorOffset[a];
  }
  updateDrawRange(){this.geometry?.setDrawRange?.(0,this.count)}
  solidAt(x,y,z){try{return SOLID_BLOCKS.has(this.world?.getLoaded?.(Math.floor(x),Math.floor(y),Math.floor(z)))}catch{return false}}
  waterAt(x,y,z){try{return this.world?.getLoaded?.(Math.floor(x),Math.floor(y),Math.floor(z))===BLOCK.WATER}catch{return false}}
  updateParticle(i,dt){
    const p3=i*3,c4=i*4;this.age[i]+=dt;if(this.age[i]>=this.life[i]){this.kill(i);return false}
    const t=clamp167(this.age[i]/Math.max(.001,this.life[i]),0,1);if(this.hang[i]>0&&this.age[i]<this.hang[i]){this.vel[p3]=0;this.vel[p3+1]=0;this.vel[p3+2]=0}else{
      this.vel[p3+1]-=this.gravity[i]*dt;const d=Math.pow(clamp167(this.drag[i],0,1),dt*60);this.vel[p3]*=d;this.vel[p3+1]*=d;this.vel[p3+2]*=d;
      if(this.flags[i]&ANCHOR_FOLLOW){const a=this.anchors[i],o=this.anchorOffset[i];if(a?.position&&o){o.x+=this.vel[p3]*dt;o.y+=this.vel[p3+1]*dt;o.z+=this.vel[p3+2]*dt;this.pos[p3]=a.position.x+o.x;this.pos[p3+1]=a.position.y+o.y;this.pos[p3+2]=a.position.z+o.z}else this.flags[i]&=~ANCHOR_FOLLOW}
      else{this.pos[p3]+=this.vel[p3]*dt;this.pos[p3+1]+=this.vel[p3+1]*dt;this.pos[p3+2]+=this.vel[p3+2]*dt}
    }
    if((this.flags[i]&REQUIRE_WATER)&&!this.waterAt(this.pos[p3],this.pos[p3+1],this.pos[p3+2])){if(this.flags[i]&POP_ON_WATER_EXIT){const q=new THREE.Vector3(this.pos[p3],this.pos[p3+1],this.pos[p3+2]);this.kill(i);this.stats.pops++;this.spawn('bubble_pop',q,{essential:false});return false}this.kill(i);return false}
    if((this.flags[i]&KILL_ON_SOLID)&&this.age[i]>.055&&this.solidAt(this.pos[p3],this.pos[p3+1]-.035,this.pos[p3+2])){this.kill(i,'collision');return false}
    this.size[i]=this.startSize[i]*(1+(this.endScale[i]-1)*t);this.col[c4+3]*=Math.pow(.28,dt/Math.max(.08,this.life[i]));if(this.frames[i]>1)this.tile[i]=this.baseTile[i]+Math.min(this.frames[i]-1,Math.floor(this.age[i]*this.fps[i]));
    return true;
  }
  updatePlayerEmitters(dt){
    const p=this.game?.player;if(!p?.position||!this.world)return;this._moveAccum+=dt;this._swimAccum-=dt;this._stepAccum-=dt;this._dripAccum-=dt;
    const dx=p.position.x-this._movePrev.x,dz=p.position.z-this._movePrev.z,speed=Math.sqrt(dx*dx+dz*dz)/Math.max(.001,this._moveAccum);if(this._moveAccum>.15){this._movePrev.copy(p.position);this._moveAccum=0}
    const inWater=this.waterAt(p.position.x,p.position.y+.35,p.position.z);
    if(inWater&&!this._wasInWater){const q=p.position.clone().add(new THREE.Vector3(0,.45,0));this.burst('splash',q,12,{jitterX:.35,jitterZ:.35});this.burst('bubble',q,7,{jitterX:.28,jitterY:.25,jitterZ:.28})}
    if(inWater&&speed>.6&&this._swimAccum<=0){this._swimAccum=.11;const q=p.position.clone().add(new THREE.Vector3(0,.45,0));this.burst('bubble',q,2,{jitterX:.28,jitterY:.22,jitterZ:.28});if(p.position.y%1>.5)this.burst('splash',q,2,{jitterX:.32,jitterZ:.32})}
    this._wasInWater=inWater;
    if(!inWater&&p.onGround&&speed>4.15&&this._stepAccum<=0){this._stepAccum=.16;const x=Math.floor(p.position.x),y=Math.floor(p.position.y-.08),z=Math.floor(p.position.z),id=this.world.getLoaded?.(x,y,z);if(id&&id!==BLOCK.AIR&&id!==BLOCK.WATER)this.spawnBlockStep(new THREE.Vector3(p.position.x,p.position.y+.03,p.position.z),id,2)}
    if(this._dripAccum<=0){this._dripAccum=.38+Math.random()*.18;this.scanCeilingDrip()}
  }
  scanCeilingDrip(){
    const p=this.game?.player?.position;if(!p||!this.world)return;const x=Math.floor(p.x+rand167(-6,6)),z=Math.floor(p.z+rand167(-6,6)),start=Math.floor(p.y+2),end=Math.min(start+8,(this.world?.height||window.WORLD_V165?.worldHeight||384)-2),lava=window.V165_BLOCK?.LAVA??-999;
    for(let y=start;y<=end;y++){const here=this.world.getLoaded?.(x,y,z);if(!SOLID_BLOCKS.has(here))continue;const above=this.world.getLoaded?.(x,y+1,z);if(above===BLOCK.WATER)this.spawn('dripping_water',new THREE.Vector3(x+.5+rand167(-.25,.25),y-.04,z+.5+rand167(-.25,.25)));else if(above===lava)this.spawn('dripping_lava',new THREE.Vector3(x+.5+rand167(-.25,.25),y-.04,z+.5+rand167(-.25,.25)));break}
  }
  update(dt){
    if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);this.material.uniforms.pixelRatio.value=Math.min(2,window.devicePixelRatio||1);this.updatePlayerEmitters(dt);
    for(let i=this.count-1;i>=0;i--)this.updateParticle(i,dt);
    this.posAttr.needsUpdate=true;this.colorAttr.needsUpdate=true;this.sizeAttr.needsUpdate=true;this.tileAttr.needsUpdate=true;this.geometry.setDrawRange(0,this.count);
  }
  diagnostics(){return{build:BUILD,active:this.count,capacity:this.capacity,mode:this.mode,spawned:this.stats.spawned,dropped:this.stats.dropped,culledDistance:this.stats.culledDistance,culledSetting:this.stats.culledSetting,killedCollision:this.stats.killedCollision,pops:this.stats.pops,atlasReady:this.atlasReady,dynamicBlockTiles:this.dynamicBlockTiles.size,billboardBatch:true,range:32,longDistanceRange:96}}
  dispose(){
    try{this.scene?.remove?.(this.points)}catch{};try{this.geometry?.dispose?.()}catch{};try{this.material?.dispose?.()}catch{};try{this.atlasTexture?.dispose?.()}catch{};this.count=0;this.items.length=0;
    const row=document.getElementById('particleModeV167')?.closest?.('.voxOptRow');row?.remove?.();
  }
}

function removeLegacyParticles167(old){
  if(!old)return;try{for(const p of old.items||[])if(p?.mesh)old.scene?.remove?.(p.mesh)}catch{};try{old.geometry?.dispose?.()}catch{};try{old.material?.dispose?.()}catch{};try{if(old.pool)old.pool.length=0}catch{}
}
function installManager167(g){
  if(!g?.renderer?.scene||!g?.world)return null;if(g.particles instanceof ParticleManagerV167)return g.particles;
  const old=g.particles;removeLegacyParticles167(old);try{g.particleManagerV167?.dispose?.()}catch{};const manager=new ParticleManagerV167(g);g.particles=manager;g.particleManagerV167=manager;return manager;
}

const baseBoot167=Game.prototype.boot;
Game.prototype.boot=async function(...args){const r=await baseBoot167.apply(this,args);installManager167(this);return r};

const baseSet167=World.prototype.set;
World.prototype.set=function(x,y,z,id){
  let old=BLOCK.AIR;try{old=this.getLoaded(x,y,z)}catch{};const changed=baseSet167.call(this,x,y,z,id);
  try{if(changed&&id===BLOCK.AIR&&old!==BLOCK.AIR&&window.game?.running&&window.game?.world===this){const pm=window.game?.particleManagerV167;if(pm)pm.spawnBlockBreak(new THREE.Vector3(Math.floor(x)+.5,Math.floor(y)+.5,Math.floor(z)+.5),old,18)}}catch(e){console.warn('[V16.7 particles] block debris hook',e)}
  return changed;
};

window.ParticleManagerV167=ParticleManagerV167;
window.spawnJavaParticleV167=(type,pos,opts)=>window.game?.particleManagerV167?.spawn?.(type,pos,opts);
try{runtimeCommands.register('particles167',(mode)=>{const pm=window.game?.particleManagerV167;if(!pm)return{build:BUILD,active:false};const m=String(mode??'').trim().toUpperCase();if(VALID_MODES.has(m))pm.setMode(m);return pm.diagnostics()},'Inspect/set V16.7 particles: particles167 [ALL|DECREASED|MINIMAL].')}catch{}

if(window.game?.running)queueMicrotask(()=>installManager167(window.game));
console.info('[Minecraft Web] V16.7 Java-style particle batch installed');
})();
