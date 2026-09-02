/* Minecraft Web V16.5 — modern 384-block section world + persistent fluids. */
(function(){
'use strict';
const BUILD='0.16.5';
const WORLD_V165=Object.freeze({
  minY:-64,maxY:319,height:384,yOffset:64,
  seaLevel:62,engineSeaLevel:126,
  sectionSize:16,sectionCount:24,format:2
});
const V165_BLOCK=Object.freeze({DEEPSLATE:2001,LAVA:2002});
window.WORLD_V165=WORLD_V165;window.V165_BLOCK=V165_BLOCK;
const v165JavaY=y=>Math.floor(Number(y)||0)-WORLD_V165.yOffset;
const v165EngineY=y=>Math.floor(Number(y)||0)+WORLD_V165.yOffset;
window.toJavaYV165=v165JavaY;window.fromJavaYV165=v165EngineY;

BLOCK_NAME[V165_BLOCK.DEEPSLATE]='deepslate';
BLOCK_NAME[V165_BLOCK.LAVA]='lava';
BLOCK_FACE_TEXTURE[V165_BLOCK.DEEPSLATE]={all:'deepslate'};
BLOCK_FACE_TEXTURE[V165_BLOCK.LAVA]={all:'lava_still'};
SOLID_BLOCKS.add(V165_BLOCK.DEEPSLATE);OPAQUE_BLOCKS.add(V165_BLOCK.DEEPSLATE);
TRANSPARENT_BLOCKS.add(V165_BLOCK.LAVA);
BLOCK_HARDNESS.set(V165_BLOCK.DEEPSLATE,3.0);BLOCK_HARDNESS.set(V165_BLOCK.LAVA,100);
BLOCK_ITEM.set(V165_BLOCK.DEEPSLATE,BLOCK.COBBLESTONE);

if(typeof AssetResolver!=='undefined'){
  const loadBaseV165=AssetResolver.prototype.loadTexture;
  AssetResolver.prototype.loadTexture=async function(name){
    const local=name==='deepslate'?'./assets/java/26.1/blocks/deepslate.png':name==='lava_still'?'./assets/java/26.1/blocks/lava_still.png':name==='lava_flow'?'./assets/java/26.1/blocks/lava_flow.png':'';
    if(!local)return loadBaseV165.call(this,name);
    if(this.textures.has(name))return this.textures.get(name);
    try{const bmp=await this.cache.image(local);this.textures.set(name,bmp);this.textureInfo.set(name,{name,url:local,source:'JAVA 26.1 LOCAL',width:bmp.width||16,height:bmp.height||16,role:name});return bmp}
    catch{return loadBaseV165.call(this,name)}
  };
}

class PaletteSectionV165{
  constructor(){this.palette=[BLOCK.AIR];this.lookup=new Map([[BLOCK.AIR,0]]);this.indices=new Uint8Array(4096);this.direct=null;this.nonAir=0;this.version=0}
  idx(x,y,z){return(y<<8)|(z<<4)|x}
  getIndex(i){return this.direct?this.direct[i]:this.palette[this.indices[i]]||BLOCK.AIR}
  get(x,y,z){return this.getIndex(this.idx(x,y,z))}
  toDirect(){if(this.direct)return;const out=new Uint16Array(4096);for(let i=0;i<4096;i++)out[i]=this.palette[this.indices[i]]||0;this.direct=out;this.indices=null;this.palette=null;this.lookup=null}
  set(x,y,z,id){const i=this.idx(x,y,z),old=this.getIndex(i);if(old===id)return false;if(old===BLOCK.AIR&&id!==BLOCK.AIR)this.nonAir++;else if(old!==BLOCK.AIR&&id===BLOCK.AIR)this.nonAir--;if(this.direct)this.direct[i]=id;else{let pi=this.lookup.get(id);if(pi===undefined){if(this.palette.length>=255){this.toDirect();this.direct[i]=id}else{pi=this.palette.length;this.palette.push(id);this.lookup.set(id,pi);this.indices[i]=pi}}else this.indices[i]=pi}this.version++;return true}
  importDense(src,offset=0){for(let i=0;i<4096;i++){const id=src[offset+i]||0;if(id){const y=i>>8,z=(i>>4)&15,x=i&15;this.set(x,y,z,id)}}}
  exportDense(){const out=new Uint16Array(4096);for(let i=0;i<4096;i++)out[i]=this.getIndex(i);return out}
}
class ModernChunkDataV165{
  constructor(cx,cz){this.cx=cx;this.cz=cz;this.size=16;this.height=WORLD_V165.height;this.sections=new Array(24);this.fluidSections=new Array(24);this.heightmap=new Int16Array(256);this.heightmap.fill(-1);this.dirty=true;this.mesh=null;this.generation=0;this.formatV165=2}
  section(sy,create=false){if(sy<0||sy>=24)return null;let s=this.sections[sy];if(!s&&create)s=this.sections[sy]=new PaletteSectionV165();return s}
  get(x,y,z){if(x<0||x>=16||z<0||z>=16||y<0||y>=384)return BLOCK.AIR;const s=this.sections[y>>4];return s?s.get(x,y&15,z):BLOCK.AIR}
  set(x,y,z,id){if(x<0||x>=16||z<0||z>=16||y<0||y>=384)return false;const sy=y>>4,s=this.section(sy,id!==BLOCK.AIR);if(!s)return false;const changed=s.set(x,y&15,z,id);if(changed){this.dirty=true;if(s.nonAir===0)this.sections[sy]=undefined;this.updateHeightColumn(x,z,y,id)}return changed}
  updateHeightColumn(x,z,y,id){const hi=z*16+x,cur=this.heightmap[hi];if(id!==BLOCK.AIR){if(y>cur)this.heightmap[hi]=y;return}if(y!==cur)return;let n=-1;for(let yy=y-1;yy>=0;yy--)if(this.get(x,yy,z)!==BLOCK.AIR){n=yy;break}this.heightmap[hi]=n}
  fluidSection(sy,create=false){if(sy<0||sy>=24)return null;let a=this.fluidSections[sy];if(!a&&create)a=this.fluidSections[sy]=new Uint8Array(4096);return a}
  fluidByte(x,y,z){if(x<0||x>=16||z<0||z>=16||y<0||y>=384)return 0;const a=this.fluidSections[y>>4];return a?a[((y&15)<<8)|(z<<4)|x]:0}
  setFluidByte(x,y,z,b){if(x<0||x>=16||z<0||z>=16||y<0||y>=384)return false;const sy=y>>4,a=this.fluidSection(sy,b!==0);if(!a)return false;const i=((y&15)<<8)|(z<<4)|x,old=a[i];if(old===b)return false;a[i]=b;return true}
  importDense(dense,heightmap){for(let sy=0;sy<24;sy++){let has=false;const off=sy*4096;for(let i=0;i<4096;i++)if(dense[off+i]){has=true;break}if(has)this.section(sy,true).importDense(dense,off)}if(heightmap?.length===256)this.heightmap.set(heightmap);else this.rebuildHeightmap();this.seedGeneratedFluids();this.dirty=true;this.generation++}
  rebuildHeightmap(){for(let z=0;z<16;z++)for(let x=0;x<16;x++){let y=383;for(;y>=0;y--)if(this.get(x,y,z)!==BLOCK.AIR)break;this.heightmap[z*16+x]=y}}
  seedGeneratedFluids(){for(let sy=0;sy<24;sy++){const s=this.sections[sy];if(!s)continue;for(let ly=0;ly<16;ly++)for(let z=0;z<16;z++)for(let x=0;x<16;x++){const id=s.get(x,ly,z),y=(sy<<4)+ly;if(id===BLOCK.WATER)this.setFluidByte(x,y,z,encodeFluidV165(1,0,false,true,false));else if(id===V165_BLOCK.LAVA)this.setFluidByte(x,y,z,encodeFluidV165(2,0,false,true,false))}}}
}
window.PaletteSectionV165=PaletteSectionV165;window.ModernChunkDataV165=ModernChunkDataV165;

const h2v=(x,z,seed=0)=>{let h=(Math.imul(x|0,374761393)+Math.imul(z|0,668265263)+Math.imul(seed|0,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295*2-1};
const h3v=(x,y,z,seed=0)=>{let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(z|0,1442695041)+Math.imul(seed|0,1103515245))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295*2-1};
const smv=t=>t*t*(3-2*t),clv=(v,a,b)=>Math.max(a,Math.min(b,v));
function n2v(x,z,scale,seed=0){const gx=Math.floor(x/scale),gz=Math.floor(z/scale),fx=smv((x-gx*scale)/scale),fz=smv((z-gz*scale)/scale),a=h2v(gx,gz,seed),b=h2v(gx+1,gz,seed),c=h2v(gx,gz+1,seed),d=h2v(gx+1,gz+1,seed),ab=a+(b-a)*fx,cd=c+(d-c)*fx;return ab+(cd-ab)*fz}
function f2v(x,z,seed=0,base=256,oct=5){let v=0,a=.5,n=0,s=base;for(let i=0;i<oct;i++){v+=n2v(x,z,s,seed+i*97)*a;n+=a;a*=.5;s*=.5}return v/n}
function n3v(x,y,z,scale,seed=0){const gx=Math.floor(x/scale),gy=Math.floor(y/scale),gz=Math.floor(z/scale),fx=smv((x-gx*scale)/scale),fy=smv((y-gy*scale)/scale),fz=smv((z-gz*scale)/scale),L=(a,b,t)=>a+(b-a)*t,c000=h3v(gx,gy,gz,seed),c100=h3v(gx+1,gy,gz,seed),c010=h3v(gx,gy+1,gz,seed),c110=h3v(gx+1,gy+1,gz,seed),c001=h3v(gx,gy,gz+1,seed),c101=h3v(gx+1,gy,gz+1,seed),c011=h3v(gx,gy+1,gz+1,seed),c111=h3v(gx+1,gy+1,gz+1,seed);return L(L(L(c000,c100,fx),L(c010,c110,fx),fy),L(L(c001,c101,fx),L(c011,c111,fx),fy),fz)}
function f3v(x,y,z,seed=0,base=72,oct=4){let v=0,a=.5,n=0,s=base;for(let i=0;i<oct;i++){v+=n3v(x,y,z,s,seed+i*131)*a;n+=a;a*=.5;s*=.52}return v/n}
function climateV165(seed,x,z){const continental=f2v(x,z,seed+11,620,5),erosion=f2v(x+410,z-730,seed+23,280,4),ridge=1-Math.abs(f2v(x-970,z+590,seed+37,190,4)),temp=f2v(x+1800,z-2200,seed+51,850,4),humidity=f2v(x-3700,z+1400,seed+67,720,4),river=Math.abs(n2v(x,z,310,seed+83));return{continental,erosion,ridge,temp,humidity,river}}
function biomeV165(seed,x,z,c=climateV165(seed,x,z)){if(c.continental<-.37)return'ocean';if(c.temp>.34&&c.humidity<-.08)return c.continental>.18?'savanna':'desert';if(c.temp<-.32)return'snowy';if(c.humidity>.42&&Math.abs(c.continental)<.2)return'swamp';if(c.ridge>.69&&c.continental>.08)return'mountains';if(c.humidity>.15)return'forest';return'plains'}
function surfaceJavaV165(seed,x,z,c=climateV165(seed,x,z)){const continent=clv((c.continental+.58)/1.08,0,1),erosion=clv((c.erosion+1)*.5,0,1),ridge=clv(c.ridge,0,1),detail=f2v(x,z,seed+101,44,3);let y=62+(continent-.48)*58;y+=Math.pow(clv((continent-.48)*1.6,0,1),1.15)*Math.pow(ridge,2.1)*(72+68*(1-erosion));y+=detail*7-(erosion-.45)*13;const riverCut=Math.pow(clv(1-c.river*14,0,1),2)*clv(continent+.15,0,1);y-=riverCut*(16+22*continent);if(c.continental<-.32)y=Math.min(y,57-(Math.abs(c.continental)*18));return Math.round(clv(y,-22,280))}
function caveV165(seed,x,jy,z,surf){if(jy<=-59||jy>=surf-3)return false;const depth=clv((surf-jy)/92,0,1),cheese=f3v(x,jy,z,seed+211,88,4),s1=Math.abs(n3v(x,jy,z,42,seed+223)),s2=Math.abs(n3v(x+310,jy,z-170,31,seed+227)),n1=Math.abs(n3v(x-130,jy,z+270,22,seed+229)),n2=Math.abs(n3v(x+710,jy,z-440,18,seed+233)),rav=Math.abs(n2v(x,z,420,seed+239))<.055&&Math.abs(n3v(x,jy,z,65,seed+241))<.18;return cheese>.43-depth*.07||(s1+s2)<(.105+.055*depth)||(n1+n2)<(.047+.025*depth)||rav}
function oreV165(seed,x,jy,z,stone){const r=(h3v(x,jy,z,seed+701)+1)*.5;if(jy<16&&r<.0045)return BLOCK.DIAMOND_ORE;if(jy<72&&r<.010)return BLOCK.IRON_ORE;if(jy>-8&&r<.015)return BLOCK.COAL_ORE;return stone}
function generateChunkV165(gen,chunk){
  const wx0=chunk.cx*16,wz0=chunk.cz*16;gen.stats.highest=-Infinity;gen.stats.lowest=Infinity;
  for(let z=0;z<16;z++)for(let x=0;x<16;x++){
    const wx=wx0+x,wz=wz0+z,c=climateV165(gen.seed,wx,wz),jy=surfaceJavaV165(gen.seed,wx,wz,c),top=jy+64,bio=biomeV165(gen.seed,wx,wz,c);chunk.heightmap[z*16+x]=top;gen.stats.highest=Math.max(gen.stats.highest,top);gen.stats.lowest=Math.min(gen.stats.lowest,top);
    for(let y=0;y<=top;y++){const javaY=y-64;let id=javaY<0?V165_BLOCK.DEEPSLATE:BLOCK.STONE;if(y<=4&&((h3v(wx,y,wz,gen.seed+88)+1)*.5)<(.78-y*.12))id=BLOCK.BEDROCK;else if(y>4&&caveV165(gen.seed,wx,javaY,wz,jy)){id=javaY<=-54&&((h3v(wx,y,wz,gen.seed+191)+1)*.5)<.58?V165_BLOCK.LAVA:BLOCK.AIR;gen.stats.caves++}else id=oreV165(gen.seed,wx,javaY,wz,id);if(id!==BLOCK.AIR)chunk.set(x,y,z,id);gen.stats.blocks++;if(id===BLOCK.AIR)gen.stats.air++;else if(id===BLOCK.WATER)gen.stats.water++;else if(id===BLOCK.STONE||id===V165_BLOCK.DEEPSLATE)gen.stats.stone++;else gen.stats.soil++;if(id===BLOCK.COAL_ORE||id===BLOCK.IRON_ORE||id===BLOCK.DIAMOND_ORE)gen.stats.ores++}
    if(top>=5){const beach=top<=126+2||bio==='desert';chunk.set(x,top,z,beach?BLOCK.SAND:BLOCK.GRASS);for(let d=1;d<=3&&top-d>4;d++){const q=chunk.get(x,top-d,z);if(q!==BLOCK.AIR&&q!==V165_BLOCK.LAVA)chunk.set(x,top-d,z,beach?BLOCK.SAND:BLOCK.DIRT)}}
    if(top<126)for(let y=top+1;y<=126;y++)if(chunk.get(x,y,z)===BLOCK.AIR)chunk.set(x,y,z,BLOCK.WATER)
  }
  for(let z=2;z<14;z++)for(let x=2;x<14;x++){const top=chunk.heightmap[z*16+x],wx=wx0+x,wz=wz0+z,bio=biomeV165(gen.seed,wx,wz);if(chunk.get(x,top,z)!==BLOCK.GRASS||top<=126||!['plains','forest'].includes(bio))continue;const chance=bio==='forest'?.075:.016;if((h2v(wx,wz,gen.seed+9921)+1)*.5>chance)continue;const h=4+Math.floor(((h2v(wx,wz,gen.seed+417)+1)*.5)*3);gen.stats.trees++;gen.stats.trunks+=h;for(let y=1;y<=h;y++)chunk.set(x,top+y,z,BLOCK.OAK_LOG);for(let dy=h-2;dy<=h+1;dy++){const r=dy===h+1?1:2;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(dx*dx+dz*dz>r*r+1||(dx===0&&dz===0&&dy<=h))continue;const xx=x+dx,zz=z+dz;if(xx>=0&&xx<16&&zz>=0&&zz<16&&chunk.get(xx,top+dy,zz)===BLOCK.AIR){chunk.set(xx,top+dy,zz,BLOCK.OAK_LEAVES);gen.stats.leaves++}}}}
  for(let z=1;z<15;z++)for(let x=1;x<15;x++){const top=chunk.heightmap[z*16+x],wx=wx0+x,wz=wz0+z;if(top<=126||chunk.get(x,top,z)!==BLOCK.GRASS||chunk.get(x,top+1,z)!==BLOCK.AIR)continue;const r=(h2v(wx,wz,gen.seed+99)+1)*.5;if(r>.78&&r<.91){chunk.set(x,top+1,z,BLOCK.TALL_GRASS);gen.stats.vegetation++}else if(r>.972){chunk.set(x,top+1,z,BLOCK.FLOWER);gen.stats.vegetation++}}
  chunk.seedGeneratedFluids();gen.stats.chunks++;chunk.dirty=true;chunk.generation++
}
if(typeof WorldGenerator!=='undefined'){WorldGenerator.prototype.surfaceY=function(x,z){return surfaceJavaV165(this.seed,Math.floor(x),Math.floor(z))+64};WorldGenerator.prototype.biome=function(x,z){return biomeV165(this.seed,Math.floor(x),Math.floor(z))};WorldGenerator.prototype.generate=function(chunk){return generateChunkV165(this,chunk)}}

if(typeof World!=='undefined'){
  World.prototype.javaY=v165JavaY;World.prototype.engineY=v165EngineY;
  World.prototype.ensureChunk=function(cx,cz){const key=chunkKey(cx,cz);let c=this.chunks.get(key);if(c)return c;c=new ModernChunkDataV165(cx,cz);this.chunks.set(key,c);const cached=this._workerChunkCacheV165?.get?.(key);if(cached?.dense){c.importDense(cached.dense,cached.heightmap);this._workerChunkCacheV165.delete(key);this.generator.stats.chunks++}else this.generator.generate(c);const edits=this.changedByChunkV165?.get?.(key);if(edits)for(const[li,id]of edits){const y=Math.floor(li/256),rem=li-y*256,z=Math.floor(rem/16),x=rem-z*16;c.set(x,y,z,id)}const fluids=this.fluidByChunkV165?.get?.(key);if(fluids)for(const[li,b]of fluids){const y=Math.floor(li/256),rem=li-y*256,z=Math.floor(rem/16),x=rem-z*16;c.setFluidByte(x,y,z,b)}return c};
  World.prototype.get=function(x,y,z){if(y<0||y>=384)return BLOCK.AIR;const p=this.worldToChunk(x,z),c=this.getChunk(p.cx,p.cz);return c?c.get(p.lx,y,p.lz):BLOCK.AIR};
  World.prototype.getLoaded=World.prototype.get;
  World.prototype.getLoadedState=function(x,y,z){if(y<0||y>=384)return{loaded:true,id:BLOCK.AIR,cx:null,cz:null,lx:null,lz:null,outOfWorld:true};const p=this.worldToChunk(x,z),c=this.getChunk(p.cx,p.cz);return{loaded:!!c,id:c?c.get(p.lx,y,p.lz):BLOCK.AIR,cx:p.cx,cz:p.cz,lx:p.lx,lz:p.lz,outOfWorld:false}};
  World.prototype.set=function(x,y,z,id){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<0||y>=384)return false;const p=this.worldToChunk(x,z),c=this.ensureChunk(p.cx,p.cz),old=c.get(p.lx,y,p.lz);if(old===id)return false;c.set(p.lx,y,p.lz,id);this.changed.set(blockKey(x,y,z),id);const ck=chunkKey(p.cx,p.cz),all=this.changedByChunkV165??=(new Map());let edits=all.get(ck);if(!edits)all.set(ck,edits=new Map());edits.set(y*256+p.lz*16+p.lx,id);this.dirtyChunks.add(ck);if(p.lx===0)this.dirtyChunks.add(chunkKey(p.cx-1,p.cz));if(p.lx===15)this.dirtyChunks.add(chunkKey(p.cx+1,p.cz));if(p.lz===0)this.dirtyChunks.add(chunkKey(p.cx,p.cz-1));if(p.lz===15)this.dirtyChunks.add(chunkKey(p.cx,p.cz+1));const fluid=this.fluidV165||game?.fluidV165;if(fluid&&!fluid.suppress)fluid.onBlockChanged(x,y,z,old,id);this.lightV165?.onBlockChanged?.(x,y,z);game?.lightV165?.onBlockChanged?.(x,y,z);return true};
  World.prototype.highestSolidY=function(x,z){const p=this.worldToChunk(x,z),c=this.getChunk(p.cx,p.cz)||this.ensureChunk(p.cx,p.cz),hint=c.heightmap?.[p.lz*16+p.lx];if(Number.isFinite(hint)&&hint>=0)for(let y=Math.min(383,hint);y>=0;y--)if(SOLID_BLOCKS.has(c.get(p.lx,y,p.lz)))return y;for(let y=383;y>=0;y--)if(SOLID_BLOCKS.has(c.get(p.lx,y,p.lz)))return y;return 0}
}

function encodeFluidV165(kind=0,level=0,falling=false,source=false,waterlogged=false){return(level&7)|(falling?8:0)|(source?16:0)|((kind&3)<<5)|(waterlogged?128:0)}
function decodeFluidV165(b){return{kind:(b>>5)&3,type:((b>>5)&3)===1?'water':((b>>5)&3)===2?'lava':'none',level:b&7,falling:!!(b&8),source:!!(b&16),waterlogged:!!(b&128)}}
window.encodeFluidV165=encodeFluidV165;window.decodeFluidV165=decodeFluidV165;
class FluidSimulatorV165{
  constructor(gameRef){this.game=gameRef;this.world=gameRef.world;this.queue=[];this.queued=new Set();this.levels=new Map();this.suppress=false;this.accum=0;this.steps=0;this.maxPending=12288;this.changed=this.world.fluidChangedV165??=(new Map())}
  key(x,y,z){return`${x},${y},${z}`}
  local(x,y,z,create=false){const p=this.world.worldToChunk(x,z),c=create?this.world.ensureChunk(p.cx,p.cz):this.world.getChunk(p.cx,p.cz);return c?{c,p}:null}
  byte(x,y,z){const q=this.local(x,y,z,false);if(!q)return this.changed.get(this.key(x,y,z))||0;return q.c.fluidByte(q.p.lx,y,q.p.lz)||this.changed.get(this.key(x,y,z))||0}
  state(x,y,z){return decodeFluidV165(this.byte(x,y,z))}
  level(x,y,z){const s=this.state(x,y,z);return s.falling?8:s.level}
  setState(x,y,z,state,{persist=true,block=true}={}){if(y<0||y>=384)return false;const q=this.local(x,y,z,true),kind=state?.type==='water'||state?.kind===1?1:state?.type==='lava'||state?.kind===2?2:0,b=kind?encodeFluidV165(kind,state.level||0,!!state.falling,!!state.source,!!state.waterlogged):0,k=this.key(x,y,z),old=q.c.fluidByte(q.p.lx,y,q.p.lz);if(old===b)return false;q.c.setFluidByte(q.p.lx,y,q.p.lz,b);if(persist){if(b)this.changed.set(k,b);else this.changed.delete(k);const ck=chunkKey(q.p.cx,q.p.cz),idx=y*256+q.p.lz*16+q.p.lx,byChunk=this.world.fluidByChunkV165??=(new Map());let fm=byChunk.get(ck);if(!fm&&b)byChunk.set(ck,fm=new Map());if(fm){if(b)fm.set(idx,b);else{fm.delete(idx);if(!fm.size)byChunk.delete(ck)}}}if(kind===1)this.levels.set(k,state.falling?8:state.level||0);else this.levels.delete(k);if(block&&!state?.waterlogged){const wanted=kind===1?BLOCK.WATER:kind===2?V165_BLOCK.LAVA:BLOCK.AIR,current=q.c.get(q.p.lx,y,q.p.lz);if(current===BLOCK.WATER||current===V165_BLOCK.LAVA||current===BLOCK.AIR||this.replaceable(current)){this.suppress=true;try{if(current!==wanted)this.world.set(x,y,z,wanted)}finally{this.suppress=false}}}this.world.dirtyChunks.add(chunkKey(q.p.cx,q.p.cz));this.enqueueNeighbors(x,y,z);return true}
  setWaterlogged(x,y,z,on=true){const id=this.world.getLoaded(x,y,z);if(!SOLID_BLOCKS.has(id)||id===BLOCK.BEDROCK)return false;return this.setState(x,y,z,on?{type:'water',level:0,source:true,waterlogged:true}:null,{persist:true,block:false})}
  replaceable(id){return id===BLOCK.AIR||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER||id===BLOCK.TORCH||id===BLOCK.WATER||id===V165_BLOCK.LAVA}
  enqueue(x,y,z){if(y<0||y>=384)return;const k=this.key(x,y,z);if(this.queued.has(k))return;if(this.queue.length>=this.maxPending){const old=this.queue.shift();if(old)this.queued.delete(this.key(...old))}this.queued.add(k);this.queue.push([x,y,z])}
  enqueueNeighbors(x,y,z){this.enqueue(x,y,z);this.enqueue(x,y+1,z);this.enqueue(x,y-1,z);for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])this.enqueue(x+dx,y,z+dz)}
  sourcesAround(x,y,z,type){let n=0;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const s=this.state(x+dx,y,z+dz);if(s.type===type&&s.source)n++}return n}
  supported(x,y,z,s){if(s.source||s.waterlogged)return true;const up=this.state(x,y+1,z);if(up.type===s.type)return true;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=this.state(x+dx,y,z+dz);if(n.type===s.type&&(n.source||n.level<s.level))return true}return false}
  react(nx,y,nz,incoming){const target=this.state(nx,y,nz);if(!target.kind||target.type===incoming.type)return false;if((incoming.type==='water'&&target.type==='lava')||(incoming.type==='lava'&&target.type==='water')){const lava=incoming.type==='lava'?incoming:target;this.setState(nx,y,nz,null);this.suppress=true;try{this.world.set(nx,y,nz,lava.source?BLOCK.OBSIDIAN:BLOCK.COBBLESTONE)}finally{this.suppress=false}return true}return false}
  flowInto(x,y,z,s,falling=false,level=s.level){const id=this.world.getLoaded(x,y,z),existing=this.state(x,y,z);if(this.react(x,y,z,s))return true;if(existing.type===s.type){if(existing.source)return false;if(level<existing.level||falling&&!existing.falling)return this.setState(x,y,z,{type:s.type,level,falling,source:false});return false}if(existing.kind||!this.replaceable(id))return false;return this.setState(x,y,z,{type:s.type,level,falling,source:false})}
  tickCell(x,y,z){let s=this.state(x,y,z);if(!s.kind)return;if(s.type==='water'&&!s.source&&!s.waterlogged&&this.world.getLoaded(x,y-1,z)!==BLOCK.AIR&&this.sourcesAround(x,y,z,'water')>=2){this.setState(x,y,z,{type:'water',level:0,source:true,falling:false,waterlogged:false});s=this.state(x,y,z)}if(!s.source&&!s.waterlogged&&!this.supported(x,y,z,s)){this.setState(x,y,z,null);return}const belowId=this.world.getLoaded(x,y-1,z),below=this.state(x,y-1,z);if(y>0&&(this.replaceable(belowId)||below.kind)&&this.flowInto(x,y-1,z,s,true,s.level))return;const step=s.type==='lava'?2:1,next=(s.source||s.falling)?step:s.level+step;if(next>7)return;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])this.flowInto(x+dx,y,z+dz,s,false,next)}
  onBlockChanged(x,y,z,old,id){if(id!==BLOCK.WATER&&old===BLOCK.WATER&&this.state(x,y,z).type==='water')this.setState(x,y,z,null,{persist:true,block:false});if(id!==V165_BLOCK.LAVA&&old===V165_BLOCK.LAVA&&this.state(x,y,z).type==='lava')this.setState(x,y,z,null,{persist:true,block:false});if(id===BLOCK.AIR||old===BLOCK.WATER||old===V165_BLOCK.LAVA)this.enqueueNeighbors(x,y,z)}
  update(dt){this.accum+=Math.min(.1,Math.max(0,Number(dt)||0));if(this.accum<.05)return;this.accum=0;let budget=matchMedia('(pointer:coarse)').matches?42:90;while(budget--&&this.queue.length){const q=this.queue.shift();this.queued.delete(this.key(...q));const s=this.state(...q);if(s.type==='lava'&&(this.steps&1)){this.enqueue(...q);continue}this.tickCell(...q);this.steps++}}
  restore(entries){if(!Array.isArray(entries))return;for(const[k,b]of entries){const[x,y,z]=String(k).split(',').map(Number);if(!Number.isFinite(x+y+z)||y<0||y>=384)continue;const s=decodeFluidV165(Number(b)||0);if(s.kind)this.setState(x,y,z,s,{persist:true,block:!s.waterlogged})}}
}
window.FluidSimulatorV165=FluidSimulatorV165;

if(typeof ChunkMesher!=='undefined'){
  const quadBaseV165Fluid=ChunkMesher.prototype.addQuad;
  ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){if(this.currentBlock!==V165_BLOCK.LAVA)return quadBaseV165Fluid.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);const s=this.world?.fluidV165?.state?.(x,y,z)||{level:0,falling:false},h=s.falling?.98:Math.max(.22,.875-(Math.min(7,s.level||0)/7)*.58),f=VOXEL_FACES.find(q=>q.key===face),base=positions.length/3;let verts=voxelFaceVertices(x,y,z,f).map(v=>v.slice());if(face==='up')for(const v of verts)v[1]=y+h;else if(face!=='down')for(const v of verts)if(v[1]>y+.5)v[1]=y+h;for(const v of verts)positions.push(...v);for(let i=0;i<4;i++){normals.push(...f.n);colors.push(1,.68,.38)}for(const q of f.uv)uvs.push(...this.atlas.uv(texture,q[0],q[1]));buckets.water.push(base,base+1,base+2,base,base+2,base+3)};
}

if(typeof Player!=='undefined'){
  const playerUpdateBaseV165=Player.prototype.update;
  Player.prototype.update=function(dt,controls){if(this.flying){this.input=controls;const forward=yawForward(this.yaw),right=yawRight(this.yaw);let mx=forward.x*controls.forward+right.x*controls.right,mz=forward.z*controls.forward+right.z*controls.right,len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len}const speed=controls.run?ENGINE.PLAYER_RUN:ENGINE.PLAYER_SPEED;this.velocity.x=mx*speed;this.velocity.z=mz*speed;this.velocity.y=(controls.jump?speed:0)-(controls.sneak?speed:0);this.position.addScaledVector(this.velocity,dt);this.position.y=clamp(this.position.y,.2,382);return}return playerUpdateBaseV165.call(this,dt,controls)};
}

if(typeof Game!=='undefined'){
  const bootBaseV165=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const r=await bootBaseV165.apply(this,args);this.fluidV165=new FluidSimulatorV165(this);this.waterV164=this.fluidV165;this.world.fluidV165=this.fluidV165;this.world.waterV164=this.fluidV165;for(const c of this.world.chunks.values())for(let sy=0;sy<24;sy++){const a=c.fluidSections?.[sy];if(!a)continue;for(let i=0;i<4096;i++){const b=a[i];if(!b)continue;const ly=i>>8,z=(i>>4)&15,x=i&15,s=decodeFluidV165(b),wx=c.cx*16+x,wz=c.cz*16+z,k=this.fluidV165.key(wx,(sy<<4)+ly,wz);if(s.type==='water')this.fluidV165.levels.set(k,s.falling?8:s.level)}}if(this._savedFluidV165)this.fluidV165.restore(this._savedFluidV165);this.world.markAllForRebuild?.();window.__voxelDiag?.log?.('V16.5 WORLD: 24 palette sections, Java Y -64..319, sea 62, persistent water/lava state installed.','ok');return r};
  const saveBaseV165=Game.prototype.save;
  Game.prototype.save=async function(...args){const store=this.saveStore;if(!store||typeof store.save!=='function')return saveBaseV165.apply(this,args);const original=store.save.bind(store);store.save=async(key,data)=>{if(key==='world'&&data){data.worldFormatV165=2;data.playerJavaYV165=(data.player?.y??0)-64;data.fluidV165=[...(this.world?.fluidChangedV165||new Map()).entries()]}return original(key,data)};try{return await saveBaseV165.apply(this,args)}finally{store.save=original}};
  const loadBaseV165=Game.prototype.loadSave;
  Game.prototype.loadSave=function(data){if(data&&Array.isArray(data.fluidV165))this._savedFluidV165=data.fluidV165;const oldFormat=!data?.worldFormatV165;if(oldFormat&&data?.player&&Number.isFinite(data.player.y))data={...data,player:{...data.player,y:data.player.y+64},changed:Array.isArray(data.changed)?data.changed.map(([k,v])=>{const a=String(k).split(',');if(a.length!==3)return[k,v];a[1]=String((Number(a[1])||0)+64);return[a.join(','),v]}):data.changed};return loadBaseV165.call(this,data)};
}
try{runtimeCommands.register('world165',()=>({build:BUILD,minY:-64,maxY:319,height:384,seaLevel:62,engineSeaLevel:126,loadedChunks:game?.world?.chunks?.size||0,paletteSections:[...(game?.world?.chunks?.values?.()||[])].reduce((n,c)=>n+(c.sections?.filter(Boolean).length||0),0),fluidChanged:game?.world?.fluidChangedV165?.size||0,fluidQueue:game?.fluidV165?.queue?.length||0,fluidSteps:game?.fluidV165?.steps||0,playerJavaY:game?.player?Math.floor(game.player.position.y)-64:null}),'Inspect V16.5 world/fluids.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;window.STUDIO_PATCH_VERSION='0.16.5-modern-world-fluid';
})();