
import * as THREE from 'three';
const $ = (id) => document.getElementById(id);
const canvas = $('gameCanvas');
const titleScreen = $('titleScreen');
const loading = $('loading');
const loadingFill = $('loadingFill');
const loadingText = $('loadingText');
const screenLayer = $('screenLayer');
const hotbarEl = $('hotbar');
const debugEl = $('debug');
const topStatus = $('topStatus');
const toastEl = $('toast');
const damageVignette = $('damageVignette');
const lookSurface = $('lookSurface');
const movePad = $('movePad');
const moveStick = $('moveStick');
const ENGINE = Object.freeze({
  VERSION: 'fresh-1.3.0-atlas-uv-chunk-streaming-stability',
  THREE_VERSION: '0.180.0',
  CHUNK_SIZE: 16,
  WORLD_HEIGHT: 96,
  MIN_Y: -16,
  SEA_LEVEL: 36,
  VIEW_DISTANCE: 4,
  SIMULATION_DISTANCE: 3,
  MAX_CHUNK_BUILDS_PER_FRAME: 1,
  MAX_CHUNK_LOADS_PER_FRAME: 1,
  TARGET_DT: 1 / 60,
  MAX_DT: 0.05,
  GRAVITY: 28,
  PLAYER_SPEED: 5.4,
  PLAYER_RUN: 7.0,
  PLAYER_JUMP: 9.3,
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.32,
  EYE_HEIGHT: 1.62,
  REACH: 6.0,
  MINE_TICK: 0.05,
  MAX_DROPS: 180,
  MAX_MOBS: 24,
  MAX_PARTICLES: 500,
  SAVE_INTERVAL: 10000,
});
let DEBUG_VOXEL_ENGINE = true;
window.DEBUG_VOXEL_ENGINE = DEBUG_VOXEL_ENGINE;
const FACE_DIRS = [
  [ 1, 0, 0 ],
  [ -1, 0, 0 ],
  [ 0, 1, 0 ],
  [ 0, -1, 0 ],
  [ 0, 0, 1 ],
  [ 0, 0, -1 ],
];
const FACE_NAMES = ['east','west','up','down','south','north'];
const UV_FACE = {
  east:  [ [0,0],[0,1],[1,1],[1,0] ],
  west:  [ [0,0],[0,1],[1,1],[1,0] ],
  up:    [ [0,0],[1,0],[1,1],[0,1] ],
  down:  [ [0,0],[1,0],[1,1],[0,1] ],
  south: [ [0,0],[1,0],[1,1],[0,1] ],
  north: [ [0,0],[1,0],[1,1],[0,1] ],
};
const BLOCK = Object.freeze({
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  GRAVEL: 5,
  OAK_LOG: 6,
  OAK_LEAVES: 7,
  OAK_PLANKS: 8,
  COBBLESTONE: 9,
  GLASS: 10,
  COAL_ORE: 11,
  IRON_ORE: 12,
  DIAMOND_ORE: 13,
  BEDROCK: 14,
  WATER: 15,
  TORCH: 16,
  CRAFTING_TABLE: 17,
  BRICKS: 18,
  OBSIDIAN: 19,
  SNOW: 20,
  TALL_GRASS: 21,
  FLOWER: 22,
  GLOWSTONE: 23,
  FURNACE: 24,
  CHEST: 25,
  TNT: 26,
});
const BLOCK_NAME = {
  0:'air',1:'grass_block',2:'dirt',3:'stone',4:'sand',5:'gravel',6:'oak_log',7:'oak_leaves',
  8:'oak_planks',9:'cobblestone',10:'glass',11:'coal_ore',12:'iron_ore',13:'diamond_ore',
  14:'bedrock',15:'water',16:'torch',17:'crafting_table',18:'bricks',19:'obsidian',20:'snow',
  21:'tall_grass',22:'flower',23:'glowstone',24:'furnace',25:'chest',26:'tnt'
};
const ITEM = Object.freeze({
  AIR: 0,
  GRASS: BLOCK.GRASS,
  DIRT: BLOCK.DIRT,
  STONE: BLOCK.STONE,
  SAND: BLOCK.SAND,
  GRAVEL: BLOCK.GRAVEL,
  OAK_LOG: BLOCK.OAK_LOG,
  OAK_LEAVES: BLOCK.OAK_LEAVES,
  OAK_PLANKS: BLOCK.OAK_PLANKS,
  COBBLESTONE: BLOCK.COBBLESTONE,
  GLASS: BLOCK.GLASS,
  COAL_ORE: BLOCK.COAL_ORE,
  IRON_ORE: BLOCK.IRON_ORE,
  DIAMOND_ORE: BLOCK.DIAMOND_ORE,
  TORCH: BLOCK.TORCH,
  CRAFTING_TABLE: BLOCK.CRAFTING_TABLE,
  BRICKS: BLOCK.BRICKS,
  OBSIDIAN: BLOCK.OBSIDIAN,
  SNOW: BLOCK.SNOW,
  GLOWSTONE: BLOCK.GLOWSTONE,
  FURNACE: BLOCK.FURNACE,
  CHEST: BLOCK.CHEST,
  TNT: BLOCK.TNT,
  STICK: 100,
  COAL: 101,
  IRON_INGOT: 102,
  DIAMOND: 103,
  WOOD_PICKAXE: 104,
  STONE_PICKAXE: 105,
  IRON_PICKAXE: 106,
  DIAMOND_PICKAXE: 107,
  WOOD_AXE: 108,
  STONE_AXE: 109,
  IRON_AXE: 110,
  DIAMOND_AXE: 111,
  WOOD_SWORD: 112,
  STONE_SWORD: 113,
  IRON_SWORD: 114,
  DIAMOND_SWORD: 115,
  APPLE: 116,
  TORCH_ITEM: 117,
  BREAD: 118,
  ARROW: 119,
});
const ITEM_NAME = new Map([
  [ITEM.GRASS,'Grass Block'],[ITEM.DIRT,'Dirt'],[ITEM.STONE,'Stone'],[ITEM.SAND,'Sand'],[ITEM.GRAVEL,'Gravel'],
  [ITEM.OAK_LOG,'Oak Log'],[ITEM.OAK_LEAVES,'Oak Leaves'],[ITEM.OAK_PLANKS,'Oak Planks'],[ITEM.COBBLESTONE,'Cobblestone'],
  [ITEM.GLASS,'Glass'],[ITEM.COAL_ORE,'Coal Ore'],[ITEM.IRON_ORE,'Iron Ore'],[ITEM.DIAMOND_ORE,'Diamond Ore'],
  [ITEM.TORCH,'Torch'],[ITEM.CRAFTING_TABLE,'Crafting Table'],[ITEM.BRICKS,'Bricks'],[ITEM.OBSIDIAN,'Obsidian'],
  [ITEM.SNOW,'Snow'],[ITEM.GLOWSTONE,'Glowstone'],[ITEM.FURNACE,'Furnace'],[ITEM.CHEST,'Chest'],[ITEM.TNT,'TNT'],
  [ITEM.STICK,'Stick'],[ITEM.COAL,'Coal'],[ITEM.IRON_INGOT,'Iron Ingot'],[ITEM.DIAMOND,'Diamond'],
  [ITEM.WOOD_PICKAXE,'Wooden Pickaxe'],[ITEM.STONE_PICKAXE,'Stone Pickaxe'],[ITEM.IRON_PICKAXE,'Iron Pickaxe'],[ITEM.DIAMOND_PICKAXE,'Diamond Pickaxe'],
  [ITEM.WOOD_AXE,'Wooden Axe'],[ITEM.STONE_AXE,'Stone Axe'],[ITEM.IRON_AXE,'Iron Axe'],[ITEM.DIAMOND_AXE,'Diamond Axe'],
  [ITEM.WOOD_SWORD,'Wooden Sword'],[ITEM.STONE_SWORD,'Stone Sword'],[ITEM.IRON_SWORD,'Iron Sword'],[ITEM.DIAMOND_SWORD,'Diamond Sword'],
  [ITEM.APPLE,'Apple'],[ITEM.BREAD,'Bread'],[ITEM.ARROW,'Arrow'],
]);
const BLOCK_ITEM = new Map(Object.entries(BLOCK_NAME).map(([id,name]) => [Number(id), ITEM[name.toUpperCase()] ?? Number(id)]));
BLOCK_ITEM.set(BLOCK.GRASS, ITEM.GRASS);
BLOCK_ITEM.set(BLOCK.DIRT, ITEM.DIRT);
BLOCK_ITEM.set(BLOCK.STONE, ITEM.STONE);
BLOCK_ITEM.set(BLOCK.SAND, ITEM.SAND);
BLOCK_ITEM.set(BLOCK.GRAVEL, ITEM.GRAVEL);
BLOCK_ITEM.set(BLOCK.OAK_LOG, ITEM.OAK_LOG);
BLOCK_ITEM.set(BLOCK.OAK_LEAVES, ITEM.OAK_LEAVES);
BLOCK_ITEM.set(BLOCK.OAK_PLANKS, ITEM.OAK_PLANKS);
BLOCK_ITEM.set(BLOCK.COBBLESTONE, ITEM.COBBLESTONE);
BLOCK_ITEM.set(BLOCK.GLASS, ITEM.GLASS);
BLOCK_ITEM.set(BLOCK.COAL_ORE, ITEM.COAL_ORE);
BLOCK_ITEM.set(BLOCK.IRON_ORE, ITEM.IRON_ORE);
BLOCK_ITEM.set(BLOCK.DIAMOND_ORE, ITEM.DIAMOND_ORE);
BLOCK_ITEM.set(BLOCK.TORCH, ITEM.TORCH);
BLOCK_ITEM.set(BLOCK.CRAFTING_TABLE, ITEM.CRAFTING_TABLE);
BLOCK_ITEM.set(BLOCK.BRICKS, ITEM.BRICKS);
BLOCK_ITEM.set(BLOCK.OBSIDIAN, ITEM.OBSIDIAN);
BLOCK_ITEM.set(BLOCK.SNOW, ITEM.SNOW);
BLOCK_ITEM.set(BLOCK.GLOWSTONE, ITEM.GLOWSTONE);
BLOCK_ITEM.set(BLOCK.FURNACE, ITEM.FURNACE);
BLOCK_ITEM.set(BLOCK.CHEST, ITEM.CHEST);
BLOCK_ITEM.set(BLOCK.TNT, ITEM.TNT);
const SOLID_BLOCKS = new Set([
  BLOCK.GRASS,BLOCK.DIRT,BLOCK.STONE,BLOCK.SAND,BLOCK.GRAVEL,BLOCK.OAK_LOG,BLOCK.OAK_LEAVES,
  BLOCK.OAK_PLANKS,BLOCK.COBBLESTONE,BLOCK.GLASS,BLOCK.COAL_ORE,BLOCK.IRON_ORE,BLOCK.DIAMOND_ORE,
  BLOCK.BEDROCK,BLOCK.CRAFTING_TABLE,BLOCK.BRICKS,BLOCK.OBSIDIAN,BLOCK.SNOW,BLOCK.GLOWSTONE,
  BLOCK.FURNACE,BLOCK.CHEST,BLOCK.TNT
]);
const TRANSPARENT_BLOCKS = new Set([BLOCK.AIR,BLOCK.WATER,BLOCK.GLASS,BLOCK.OAK_LEAVES,BLOCK.TORCH,BLOCK.TALL_GRASS,BLOCK.FLOWER]);
const OPAQUE_BLOCKS = new Set([BLOCK.GRASS,BLOCK.DIRT,BLOCK.STONE,BLOCK.SAND,BLOCK.GRAVEL,BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.COBBLESTONE,BLOCK.COAL_ORE,BLOCK.IRON_ORE,BLOCK.DIAMOND_ORE,BLOCK.BEDROCK,BLOCK.CRAFTING_TABLE,BLOCK.BRICKS,BLOCK.OBSIDIAN,BLOCK.SNOW,BLOCK.GLOWSTONE,BLOCK.FURNACE,BLOCK.CHEST,BLOCK.TNT]);
const BLOCK_HARDNESS = new Map([
  [BLOCK.GRASS,.6],[BLOCK.DIRT,.5],[BLOCK.STONE,1.5],[BLOCK.SAND,.5],[BLOCK.GRAVEL,.6],[BLOCK.OAK_LOG,2],
  [BLOCK.OAK_LEAVES,.2],[BLOCK.OAK_PLANKS,2],[BLOCK.COBBLESTONE,2],[BLOCK.GLASS,.3],[BLOCK.COAL_ORE,3],[BLOCK.IRON_ORE,3],
  [BLOCK.DIAMOND_ORE,3],[BLOCK.BEDROCK,999999],[BLOCK.WATER,100],[BLOCK.TORCH,.1],[BLOCK.CRAFTING_TABLE,2.5],[BLOCK.BRICKS,2],
  [BLOCK.OBSIDIAN,50],[BLOCK.SNOW,.2],[BLOCK.GLOWSTONE,.3],[BLOCK.FURNACE,3.5],[BLOCK.CHEST,2.5],[BLOCK.TNT,0]
]);
const BLOCK_FACE_TEXTURE = {
  [BLOCK.GRASS]: {up:'grass_top',down:'dirt',east:'grass_side',west:'grass_side',north:'grass_side',south:'grass_side'},
  [BLOCK.DIRT]: {all:'dirt'},
  [BLOCK.STONE]: {all:'stone'},
  [BLOCK.SAND]: {all:'sand'},
  [BLOCK.GRAVEL]: {all:'gravel'},
  [BLOCK.OAK_LOG]: {up:'oak_log_top',down:'oak_log_top',east:'oak_log',west:'oak_log',north:'oak_log',south:'oak_log'},
  [BLOCK.OAK_LEAVES]: {all:'oak_leaves'},
  [BLOCK.OAK_PLANKS]: {all:'oak_planks'},
  [BLOCK.COBBLESTONE]: {all:'cobblestone'},
  [BLOCK.GLASS]: {all:'glass'},
  [BLOCK.COAL_ORE]: {all:'coal_ore'},
  [BLOCK.IRON_ORE]: {all:'iron_ore'},
  [BLOCK.DIAMOND_ORE]: {all:'diamond_ore'},
  [BLOCK.BEDROCK]: {all:'bedrock'},
  [BLOCK.WATER]: {all:'water'},
  [BLOCK.CRAFTING_TABLE]: {up:'crafting_table_top',down:'oak_planks',east:'crafting_table_side',west:'crafting_table_side',north:'crafting_table_side',south:'crafting_table_side'},
  [BLOCK.BRICKS]: {all:'bricks'},
  [BLOCK.OBSIDIAN]: {all:'obsidian'},
  [BLOCK.SNOW]: {all:'snow'},
  [BLOCK.GLOWSTONE]: {all:'glowstone'},
  [BLOCK.FURNACE]: {all:'furnace_side'},
  [BLOCK.CHEST]: {all:'chest'},
  [BLOCK.TNT]: {up:'tnt_top',down:'tnt_bottom',east:'tnt_side',west:'tnt_side',north:'tnt_side',south:'tnt_side'},
};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function smoothstep(t){ return t*t*(3-2*t); }
function floorDiv(a,b){ return Math.floor(a/b); }
function mod(a,b){ return ((a%b)+b)%b; }
function chunkKey(cx,cz){ return `${cx},${cz}`; }
function blockKey(x,y,z){ return `${x},${y},${z}`; }
function hash2(x,z,seed=0){
  let h = (x*374761393 + z*668265263 + seed*1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function hash3(x,y,z,seed=0){
  let h = (x*374761393 + y*668265263 + z*1442695041 + seed*1103515245) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function valueNoise2(x,z,scale,seed=0){
  const gx = Math.floor(x/scale);
  const gz = Math.floor(z/scale);
  const fx = smoothstep((x-gx*scale)/scale);
  const fz = smoothstep((z-gz*scale)/scale);
  const a=hash2(gx,gz,seed),b=hash2(gx+1,gz,seed),c=hash2(gx,gz+1,seed),d=hash2(gx+1,gz+1,seed);
  return lerp(lerp(a,b,fx),lerp(c,d,fx),fz);
}
function fbm2(x,z,seed=0){
  let value=0,amp=.5,norm=0,scale=64;
  for(let i=0;i<5;i++){
    value+=valueNoise2(x,z,scale,seed+i*17)*amp;
    norm+=amp;amp*=.5;scale*=.5;
  }
  return value/norm;
}
function yawForward(yaw){ return {x:-Math.sin(yaw),z:-Math.cos(yaw)}; }
function yawRight(yaw){ return {x:Math.cos(yaw),z:-Math.sin(yaw)}; }
function distanceSq(ax,ay,az,bx,by,bz){ const dx=ax-bx,dy=ay-by,dz=az-bz; return dx*dx+dy*dy+dz*dz; }
function now(){ return performance.now(); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function safeJsonParse(text,fallback){ try{return JSON.parse(text)}catch{return fallback} }
class Random {
  constructor(seed=12345){ this.state=(seed|0)||1; }
  next(){
    let x=this.state|0;
    x^=x<<13;x^=x>>>17;x^=x<<5;
    this.state=x|0;
    return ((x>>>0)/4294967296);
  }
  range(a,b){return a+(b-a)*this.next();}
  int(a,b){return Math.floor(this.range(a,b+1));}
  chance(p){return this.next()<p;}
  pick(arr){return arr[Math.floor(this.next()*arr.length)];}
}
class Noise {
  constructor(seed){this.seed=seed|0;}
  value(x,z){return valueNoise2(x,z,32,this.seed);}
  detail(x,z){return fbm2(x,z,this.seed);}
  height(x,z){
    const continental=this.detail(x*.85,z*.85);
    const hills=this.detail(x*1.8+500,z*1.8-300);
    const ridge=1-Math.abs(hills*2-1);
    return Math.floor(27+continental*28+ridge*9);
  }
}
const MC_RAW = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/';
const MC_TEX = `${MC_RAW}textures/`;
const MC_UI = `${MC_TEX}ui/`;
const CACHE_NAME = 'fresh-mc-mojang-assets-v1';
const USER_REPO_RAW = 'https://raw.githubusercontent.com/matthewcodergamer/Minecraft-assets/main';
const USER_REPO_API = 'https://api.github.com/repos/matthewcodergamer/Minecraft-assets/git/trees/main?recursive=1';
const MOJANG_REPO_RAW = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack';
const MOJANG_REPO_API = 'https://api.github.com/repos/Mojang/bedrock-samples/git/trees/main?recursive=1';
class AssetCache {
  constructor(){
    this.cache=null;
    this.memory=new Map();
    this.stats={requested:0,loaded:0,cached:0,failed:0};
  }
  async init(){
    if('caches' in window){
      try{this.cache=await caches.open(CACHE_NAME)}catch(e){console.warn('Cache Storage unavailable',e)}
    }
  }
  async fetch(url,options={}){
    this.stats.requested++;
    if(this.memory.has(url)) return this.memory.get(url);
    if(this.cache){
      try{
        const hit=await this.cache.match(url);
        if(hit){
          const blob=await hit.blob();
          this.stats.cached++;
          this.memory.set(url,blob);
          return blob;
        }
      }catch{}
    }
    try{
      const res=await fetch(url,{mode:'cors',cache:'no-store',...options});
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob=await res.blob();
      if(this.cache){try{await this.cache.put(url,new Response(blob))}catch{}}
      this.stats.loaded++;
      this.memory.set(url,blob);
      return blob;
    }catch(e){
      this.stats.failed++;
      throw e;
    }
  }
  async text(path){
    const blob=await this.fetch(path);
    return await blob.text();
  }
  async image(path){
    const blob=await this.fetch(path);
    const bitmap=await createImageBitmap(blob);
    return bitmap;
  }
}
const TEXTURE_ALIASES = Object.freeze({
  grass_side: ['grass_side','grass_side_carried','grass_carried'],
  grass_top: ['grass_top','grass_carried_top'],
  oak_log: ['log_oak','log'],
  oak_log_top: ['log_oak_top','log_top'],
  oak_leaves: ['leaves','leaves_oak','leaves_oak_opaque','oak_leaves'],
  oak_leaves_opaque: ['leaves_oak_opaque'],
  oak_planks: ['planks_oak','planks'],
  tall_grass: ['tallgrass','tall_grass'],
  flower: ['flower_allium','flower_rose','flower_dandelion'],
  torch: ['torch_on','torch'],
  furnace_side: ['furnace_side','furnace'],
  crafting_table_top: ['crafting_table_top'],
  crafting_table_side: ['crafting_table_side'],
});
class AssetResolver {
  constructor(cache){
    this.cache=cache;
    this.textures=new Map();
    this.textureInfo=new Map();
    this.failures=new Set();
    this.fallbackCanvas=new Map();
    this.repoFiles=new Map();
  }
  textureCandidates(name){
    const n=name.replace(/^textures\//,'').replace(/\.png$/,'');
    const aliases=TEXTURE_ALIASES[n]||[];
    const names=[n,...aliases];
    const urls=[];
    for(const candidate of names){
      const clean=candidate.replace(/^textures\//,'').replace(/\.png$/,'');
      const base=clean.split('/').pop();
      urls.push(`${USER_REPO_RAW}/${encodeURIComponent(clean).replace(/%2F/g,'/')}.png`);
      urls.push(`${USER_REPO_RAW}/textures/blocks/${encodeURIComponent(base).replace(/%2F/g,'/')}.png`);
      urls.push(`${USER_REPO_RAW}/textures/${encodeURIComponent(clean).replace(/%2F/g,'/')}.png`);
      urls.push(`${MOJANG_REPO_RAW}/textures/blocks/${encodeURIComponent(base).replace(/%2F/g,'/')}.png`);
      urls.push(`${MOJANG_REPO_RAW}/textures/items/${encodeURIComponent(base).replace(/%2F/g,'/')}.png`);
      urls.push(`${MC_TEX}blocks/${base}.png`);
      urls.push(`${MC_TEX}items/${base}.png`);
      urls.push(`${MC_TEX}item/${base}.png`);
      urls.push(`${MC_TEX}${base}.png`);
    }
    return [...new Set(urls)];
  }
  async repoScan(label,api){
    if(this.repoFiles.has(label))return this.repoFiles.get(label);
    try{
      const res=await fetch(api,{cache:'no-store'});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const json=await res.json();
      const files=(json.tree||[]).filter(x=>x.type==='blob').map(x=>x.path);
      this.repoFiles.set(label,files);
      return files;
    }catch(err){
      this.repoFiles.set(label,[]);
      this._diag(`⚠ ${label} repository scan failed: ${err.message}`,'warn');
      return [];
    }
  }
  _diag(text,type='info'){
    try{window.__voxelDiag?.log?.(text,type)}catch{}
  }
  async discoverByBasename(name,label,api,rawRoot){
    const wanted=new Set([name.replace(/^textures\//,'').replace(/\.png$/,'').split('/').pop().toLowerCase(),...(TEXTURE_ALIASES[name]||[]).map(x=>x.split('/').pop().toLowerCase())]);
    const files=await this.repoScan(label,api);
    for(const path of files){
      const base=path.split('/').pop().toLowerCase();
      if(!wanted.has(base))continue;
      const url=`${rawRoot}/${path.split('/').map(encodeURIComponent).join('/')}`;
      try{
        const bmp=await this.cache.image(url);
        return {bmp,url,source:label,path};
      }catch{}
    }
    return null;
  }
  async loadTexture(name){
    if(this.textures.has(name))return this.textures.get(name);
    this._diag(`TEXTURE ${name}`,'face');
    for(const url of this.textureCandidates(name)){
      try{
        const bmp=await this.cache.image(url);
        const source=url.includes('matthewcodergamer/Minecraft-assets')?'USER REPOSITORY':url.includes('Mojang/bedrock-samples')?'MOJANG REPOSITORY':'MINECRAFT SAMPLE';
        this.textures.set(name,bmp);
        this.textureInfo.set(name,{name,filename:url.split('/').pop(),url,source,path:url.split('/').slice(3).join('/'),width:bmp.width||16,height:bmp.height||16,bytes:null,colorSpace:'sRGB',generateMipmaps:true,minFilter:'NearestMipmapLinearFilter',magFilter:'NearestFilter',anisotropy:'dynamic',alpha:'unknown-until-atlas',role:name});
        this._diag(`✓ ${name} → ${source} (${bmp.width||16}×${bmp.height||16})`,'ok');
        this._diag(url,'url');
        return bmp;
      }catch{}
    }
    const discoveredUser=await this.discoverByBasename(name,'USER REPOSITORY',USER_REPO_API,USER_REPO_RAW);
    if(discoveredUser){
      this.textures.set(name,discoveredUser.bmp);
      this.textureInfo.set(name,{name,filename:discoveredUser.path.split('/').pop(),url:discoveredUser.url,source:discoveredUser.source,path:discoveredUser.path,width:discoveredUser.bmp.width||16,height:discoveredUser.bmp.height||16,colorSpace:'sRGB',generateMipmaps:true,minFilter:'NearestMipmapLinearFilter',magFilter:'NearestFilter',anisotropy:'dynamic',alpha:'unknown-until-atlas',role:name});
      this._diag(`✓ ${name} → discovered ${discoveredUser.path}`,'ok');
      return discoveredUser.bmp;
    }
    const discoveredMojang=await this.discoverByBasename(name,'MOJANG',MOJANG_REPO_API,MOJANG_REPO_RAW);
    if(discoveredMojang){
      this.textures.set(name,discoveredMojang.bmp);
      this.textureInfo.set(name,{name,filename:discoveredMojang.path.split('/').pop(),url:discoveredMojang.url,source:discoveredMojang.source,path:discoveredMojang.path,width:discoveredMojang.bmp.width||16,height:discoveredMojang.bmp.height||16,colorSpace:'sRGB',generateMipmaps:true,minFilter:'NearestMipmapLinearFilter',magFilter:'NearestFilter',anisotropy:'dynamic',alpha:'unknown-until-atlas',role:name});
      this._diag(`✓ ${name} → Mojang discovered ${discoveredMojang.path}`,'ok');
      return discoveredMojang.bmp;
    }
    this.failures.add(name);
    const fallback=this.makeFallback(name);
    this.textures.set(name,fallback);
    this.textureInfo.set(name,{url:'fallback://'+name,source:'FALLBACK',width:16,height:16});
    this._diag(`✗ ${name} → deterministic fallback`,'err');
    return fallback;
  }
  getInfo(name){return this.textureInfo.get(name)||null;}
  makeFallback(name){
    if(this.fallbackCanvas.has(name))return this.fallbackCanvas.get(name);
    const c=document.createElement('canvas');c.width=16;c.height=16;
    const ctx=c.getContext('2d');
    const seed=[...name].reduce((a,ch)=>a+ch.charCodeAt(0),0);
    const r=80+(seed%90),g=70+((seed*7)%100),b=55+((seed*13)%90);
    ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(0,0,16,16);
    for(let i=0;i<20;i++){const x=(seed*i*7)%16,y=(seed*i*11)%16;ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y,1,1)}
    this.fallbackCanvas.set(name,c);return c;
  }
  async warm(names,progress=()=>{}){
    let i=0;
    for(const name of names){await this.loadTexture(name);i++;progress(i,names.length,name);}
  }
}
class TextureAtlas {
  constructor(resolver){
    this.resolver=resolver;
    this.tileSize=16;
    this.columns=1;
    this.rows=1;
    this.canvas=null;
    this.texture=null;
    this.map=new Map();
    this.names=[];
    this.maxSourceResolution=16;
  }
  async build(names){
    this.names=[...new Set(names)];
    for(const name of this.names)await this.resolver.loadTexture(name);
    const maxDim=Math.max(16,...this.names.map(n=>Math.max(this.resolver.getInfo(n)?.width||16,this.resolver.getInfo(n)?.height||16)));
    this.tileSize=Math.min(64,Math.max(16,2**Math.ceil(Math.log2(maxDim))));
    this.maxSourceResolution=maxDim;
    this.columns=Math.max(1,Math.ceil(Math.sqrt(this.names.length)));
    this.rows=Math.max(1,Math.ceil(this.names.length/this.columns));
    const maxTextureSize=THREE.MathUtils.floorPowerOfTwo(Math.min(8192,window.game?.renderer?.renderer?.capabilities?.maxTextureSize||8192));
    while((this.columns*this.tileSize)>maxTextureSize && this.tileSize>16)this.tileSize>>=1;
    while((this.rows*this.tileSize)>maxTextureSize && this.tileSize>16)this.tileSize>>=1;
    this.canvas=document.createElement('canvas');
    this.canvas.width=this.columns*this.tileSize;
    this.canvas.height=this.rows*this.tileSize;
    const ctx=this.canvas.getContext('2d');
    ctx.imageSmoothingEnabled=false;
    for(let i=0;i<this.names.length;i++){
      const name=this.names[i];const col=i%this.columns,row=Math.floor(i/this.columns);
      this.map.set(name,{col,row,index:i});
      const img=this.resolver.textures.get(name);
      if(name==='oak_leaves'){
        const dense=document.createElement('canvas');dense.width=dense.height=this.tileSize;
        const dctx=dense.getContext('2d',{willReadFrequently:true});dctx.imageSmoothingEnabled=false;
        dctx.drawImage(img,0,0,img.width||16,img.height||16,0,0,this.tileSize,this.tileSize);
        const opaque=this.resolver.textures.get('oak_leaves_opaque');
        const opaqueInfo=this.resolver.getInfo('oak_leaves_opaque');
        if(opaque&&opaqueInfo?.source!=='FALLBACK'){
          const oc=document.createElement('canvas');oc.width=oc.height=this.tileSize;
          const octx=oc.getContext('2d',{willReadFrequently:true});octx.imageSmoothingEnabled=false;
          octx.drawImage(opaque,0,0,opaque.width||16,opaque.height||16,0,0,this.tileSize,this.tileSize);
          const a=dctx.getImageData(0,0,this.tileSize,this.tileSize);
          const b=octx.getImageData(0,0,this.tileSize,this.tileSize);
          for(let py=0;py<this.tileSize;py++)for(let px=0;px<this.tileSize;px++){
            const k=(py*this.tileSize+px)*4;
            if(a.data[k+3]>=128){a.data[k+3]=255;continue;}
            const hash=((px*73856093)^(py*19349663))>>>0;
            if((hash&3)!==0){
              const lum=(b.data[k]*0.299+b.data[k+1]*0.587+b.data[k+2]*0.114);
              a.data[k]=Math.max(10,lum*.58);
              a.data[k+1]=Math.max(18,lum*.92);
              a.data[k+2]=Math.max(8,lum*.46);
              a.data[k+3]=255;
            }
          }
          dctx.putImageData(a,0,0);
        }
        ctx.drawImage(dense,col*this.tileSize,row*this.tileSize);
      }else{
        ctx.drawImage(img,0,0,img.width||16,img.height||16,col*this.tileSize,row*this.tileSize,this.tileSize,this.tileSize);
      }
    }
    this.texture=new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter=THREE.NearestFilter;
    this.texture.minFilter=THREE.NearestMipmapLinearFilter;
    this.texture.colorSpace=THREE.SRGBColorSpace;
    this.texture.generateMipmaps=true;
    this.texture.anisotropy=1;
    this.texture.wrapS=THREE.ClampToEdgeWrapping;
    this.texture.wrapT=THREE.ClampToEdgeWrapping;
    this.texture.needsUpdate=true;
    return this.texture;
  }
  uv(name,localU,localV){
    const p=this.map.get(name)||this.map.get('missing');
    const w=this.columns,h=this.rows;
    const inset=Math.min(.08,Math.max(.002,0.5/this.tileSize));
    const tileU=inset+clamp(localU,0,1)*(1-inset*2);
    const tileYTop=inset+(1-clamp(localV,0,1))*(1-inset*2);
    const u=(p.col+tileU)/w;
    const atlasYTop=(p.row+tileYTop)/h;
    return [u,1-atlasYTop];
  }
}
class ChunkData {
  constructor(cx,cz,size,height){
    this.cx=cx;this.cz=cz;this.size=size;this.height=height;
    this.data=new Uint16Array(size*height*size);
    this.dirty=true;this.mesh=null;this.generation=0;
  }
  index(x,y,z){return (y*this.size+z)*this.size+x;}
  get(x,y,z){
    if(x<0||x>=this.size||y<0||y>=this.height||z<0||z>=this.size)return BLOCK.AIR;
    return this.data[this.index(x,y,z)];
  }
  set(x,y,z,id){
    if(x<0||x>=this.size||y<0||y>=this.height||z<0||z>=this.size)return;
    this.data[this.index(x,y,z)]=id;this.dirty=true;
  }
}
class ReferencePerlin {
  constructor(seed=1){
    this.p=new Uint8Array(512);
    const a=new Uint8Array(256);for(let i=0;i<256;i++)a[i]=i;
    let s=seed>>>0;
    for(let i=255;i;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}
    for(let i=0;i<512;i++)this.p[i]=a[i&255];
  }
  fade(t){return t*t*t*(t*(t*6-15)+10);}
  lerp(a,b,t){return a+t*(b-a);}
  grad(h,x,y,z){const q=h&15,u=q<8?x:y,v=q<4?y:(q===12||q===14?x:z);return((q&1)?-u:u)+((q&2)?-v:v);}
  noise(x,y=0,z=0){
    const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;
    x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);
    const u=this.fade(x),v=this.fade(y),w=this.fade(z),p=this.p;
    const A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;
    return this.lerp(
      this.lerp(this.lerp(this.grad(p[AA],x,y,z),this.grad(p[BA],x-1,y,z),u),this.lerp(this.grad(p[AB],x,y-1,z),this.grad(p[BB],x-1,y-1,z),u),v),
      this.lerp(this.lerp(this.grad(p[AA+1],x,y,z-1),this.grad(p[BA+1],x-1,y,z-1),u),this.lerp(this.grad(p[AB+1],x,y-1,z-1),this.grad(p[BB+1],x-1,y-1,z-1),u),v),w);
  }
  fbm2(x,z,oct=4){let a=0,amp=1,sum=0;for(let i=0;i<oct;i++){a+=this.noise(x,0,z)*amp;sum+=amp;x*=2;z*=2;amp*=.5;}return a/sum;}
  fbm3(x,y,z,oct=3){let a=0,amp=1,sum=0;for(let i=0;i<oct;i++){a+=this.noise(x,y,z)*amp;sum+=amp;x*=2;y*=2;z*=2;amp*=.5;}return a/sum;}
}
class WorldGenerator {
  constructor(seed){
    this.seed=seed|0;
    this.noise=new Noise(seed);
    this.perlin=new ReferencePerlin(seed);
    this.random=new Random(seed);
    this.stats={chunks:0,blocks:0,air:0,stone:0,soil:0,water:0,ores:0,trees:0,trunks:0,leaves:0,vegetation:0,caves:0,highest:-Infinity,lowest:Infinity};
  }
  surfaceY(x,z){
    const continental=this.perlin.fbm2(x*.045,z*.045,4);
    const detail=this.perlin.fbm2(x*.11,z*.11,3);
    const mountain=Math.max(0,this.perlin.fbm2(x*.018,z*.018,3));
    const h=Math.floor(39+continental*10+detail*3+mountain*12);
    return clamp(h,8,ENGINE.WORLD_HEIGHT-18);
  }
  biome(x,z){
    const temp=this.noise.detail(x+8000,z-8000);
    const humidity=this.noise.detail(x-5000,z+4000);
    if(temp<.13)return 'snowy';
    if(humidity<.20)return 'desert';
    if(humidity>.76)return 'forest';
    return 'plains';
  }
  caveDensity(x,y,z){
    const a=this.perlin.fbm3(x*.075,y*.105,z*.075,3);
    const b=this.perlin.fbm3(x*.14,y*.16,z*.14,2);
    const vertical=1-Math.abs((y-(ENGINE.SEA_LEVEL-8))/24);
    const gate=this.perlin.noise(x*.035,0,z*.035);
    return (a*.72+b*.28)*Math.max(0,vertical)*(gate>.08?1:.35);
  }
  canCarve(x,y,z,surface){
    if(y<=2||y>=surface-3)return false;
    if(y<7)return false;
    const d=this.caveDensity(x,y,z);
    return d>.50 && this.perlin.noise(x*.12,y*.09,z*.12)>.02;
  }
  generate(chunk){
    const {cx,cz,size,height}=chunk,wx0=cx*size,wz0=cz*size;
    for(let z=0;z<size;z++)for(let x=0;x<size;x++){
      const wx=wx0+x,wz=wz0+z,surface=this.surfaceY(wx,wz),biome=this.biome(wx,wz),sea=ENGINE.SEA_LEVEL;
      this.stats.highest=Math.max(this.stats.highest,surface);this.stats.lowest=Math.min(this.stats.lowest,surface);
      for(let y=0;y<height;y++){
        let id=BLOCK.AIR;
        if(y===0)id=BLOCK.BEDROCK;
        else if(y<=surface){
          if(this.canCarve(wx,y,wz,surface)){id=BLOCK.AIR;this.stats.caves++;}
          else if(y<surface-4){
            id=BLOCK.STONE;
            const ore=hash3(wx,y,wz,this.seed);
            if(y<18&&ore>.996)id=BLOCK.DIAMOND_ORE;
            else if(y<34&&ore>.985)id=BLOCK.IRON_ORE;
            else if(y<surface-3&&ore>.965)id=BLOCK.COAL_ORE;
          }else if(y<surface)id=(biome==='desert'?BLOCK.SAND:BLOCK.DIRT);
          else id=(biome==='desert'?BLOCK.SAND:biome==='snowy'?BLOCK.SNOW:BLOCK.GRASS);
        }else if(y<=sea)id=BLOCK.WATER;
        chunk.set(x,y,z,id);
        this.stats.blocks++;
        if(id===BLOCK.AIR)this.stats.air++;else if(id===BLOCK.STONE)this.stats.stone++;else if(id===BLOCK.WATER)this.stats.water++;else this.stats.soil++;
        if(id===BLOCK.COAL_ORE||id===BLOCK.IRON_ORE||id===BLOCK.DIAMOND_ORE)this.stats.ores++;
      }
    }
    this.generateTrees(chunk);
    this.generateVegetation(chunk);
    this.stats.chunks++;chunk.dirty=true;chunk.generation++;
  }
  treeCandidate(wx,wz){
    const cell=5,cx=Math.floor(wx/cell),cz=Math.floor(wz/cell);
    const jx=Math.floor(hash2(cx,cz,this.seed+1001)*cell),jz=Math.floor(hash2(cx,cz,this.seed+2002)*cell);
    if(wx!==cx*cell+jx||wz!==cz*cell+jz)return false;
    const density=this.perlin.fbm2(wx*.065,wz*.065,3);
    return density>=-.05 && hash2(wx,wz,this.seed+77)<(.34+density*.18);
  }
  generateTrees(chunk){
    const {cx,cz,size}=chunk,wx0=cx*size,wz0=cz*size;
    for(let z=2;z<size-2;z++)for(let x=2;x<size-2;x++){
      const wx=wx0+x,wz=wz0+z,y=this.surfaceY(wx,wz);
      if(chunk.get(x,y,z)!==BLOCK.GRASS||!this.treeCandidate(wx,wz))continue;
      const h=4+Math.floor(hash2(wx,wz,this.seed+91)*3);
      this.stats.trees++;this.stats.trunks+=h;
      for(let k=1;k<=h;k++)chunk.set(x,y+k,z,BLOCK.OAK_LOG);
      for(let yy=y+h-2;yy<=y+h+1;yy++){
        const rel=yy-(y+h),r=rel>=1?1:2;
        for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
          if(dx*dx+dz*dz>r*r+1)continue;
          if(dx===0&&dz===0&&yy<=y+h)continue;
          const xx=x+dx,zz=z+dz;
          if(chunk.get(xx,yy,zz)===BLOCK.AIR){chunk.set(xx,yy,zz,BLOCK.OAK_LEAVES);this.stats.leaves++;}
        }
      }
    }
  }
  generateVegetation(chunk){
    const {cx,cz,size}=chunk;
    for(let z=1;z<size-1;z++)for(let x=1;x<size-1;x++){
      const wx=cx*size+x,wz=cz*size+z,y=this.surfaceY(wx,wz);
      if(chunk.get(x,y,z)!==BLOCK.GRASS||chunk.get(x,y+1,z)!==BLOCK.AIR)continue;
      const r=hash2(wx,wz,this.seed+99);
      if(r>.78&&r<.91){chunk.set(x,y+1,z,BLOCK.TALL_GRASS);this.stats.vegetation++;}
      else if(r>.955){chunk.set(x,y+1,z,BLOCK.FLOWER);this.stats.vegetation++;}
    }
  }
}
class World {
  constructor(seed,mode){
    this.seed=seed|0;this.mode=mode;
    this.generator=new WorldGenerator(this.seed);
    this.chunks=new Map();
    this.loadQueue=[];this.buildQueue=[];this.unloadQueue=[];
    this.changed=new Map();
    this.dirtyChunks=new Set();
    this.spawned=false;
    this.viewDistance=ENGINE.VIEW_DISTANCE;
  }
  getChunk(cx,cz){return this.chunks.get(chunkKey(cx,cz));}
  ensureChunk(cx,cz){
    const key=chunkKey(cx,cz);
    let chunk=this.chunks.get(key);
    if(!chunk){chunk=new ChunkData(cx,cz,ENGINE.CHUNK_SIZE,ENGINE.WORLD_HEIGHT);this.chunks.set(key,chunk);this.generator.generate(chunk);}
    return chunk;
  }
  worldToChunk(x,z){return {cx:floorDiv(x,ENGINE.CHUNK_SIZE),cz:floorDiv(z,ENGINE.CHUNK_SIZE),lx:mod(x,ENGINE.CHUNK_SIZE),lz:mod(z,ENGINE.CHUNK_SIZE)};}
  get(x,y,z){
    if(y<0||y>=ENGINE.WORLD_HEIGHT)return BLOCK.AIR;
    const p=this.worldToChunk(x,z);const c=this.getChunk(p.cx,p.cz);
    if(!c)return BLOCK.AIR;
    return c.get(p.lx,y,p.lz);
  }
  getLoaded(x,y,z){
    if(y<0||y>=ENGINE.WORLD_HEIGHT)return BLOCK.AIR;
    const p=this.worldToChunk(x,z);const c=this.getChunk(p.cx,p.cz);
    return c?c.get(p.lx,y,p.lz):BLOCK.AIR;
  }
  getLoadedState(x,y,z){
    if(y<0||y>=ENGINE.WORLD_HEIGHT)return {loaded:true,id:BLOCK.AIR,cx:null,cz:null,lx:null,lz:null,outOfWorld:true};
    const p=this.worldToChunk(x,z),c=this.getChunk(p.cx,p.cz);
    return {loaded:!!c,id:c?c.get(p.lx,y,p.lz):BLOCK.AIR,cx:p.cx,cz:p.cz,lx:p.lx,lz:p.lz,outOfWorld:false};
  }
  set(x,y,z,id){
    if(y<0||y>=ENGINE.WORLD_HEIGHT)return false;
    const p=this.worldToChunk(x,z);const c=this.ensureChunk(p.cx,p.cz);const old=c.get(p.lx,y,p.lz);
    if(old===id)return false;
    c.set(p.lx,y,p.lz,id);
    this.changed.set(blockKey(x,y,z),id);
    this.dirtyChunks.add(chunkKey(p.cx,p.cz));
    if(p.lx===0)this.dirtyChunks.add(chunkKey(p.cx-1,p.cz));
    if(p.lx===ENGINE.CHUNK_SIZE-1)this.dirtyChunks.add(chunkKey(p.cx+1,p.cz));
    if(p.lz===0)this.dirtyChunks.add(chunkKey(p.cx,p.cz-1));
    if(p.lz===ENGINE.CHUNK_SIZE-1)this.dirtyChunks.add(chunkKey(p.cx,p.cz+1));
    return true;
  }
  markAllForRebuild(){for(const key of this.chunks.keys())this.dirtyChunks.add(key);}
  queueAround(px,pz){
    const pcx=floorDiv(Math.floor(px),ENGINE.CHUNK_SIZE),pcz=floorDiv(Math.floor(pz),ENGINE.CHUNK_SIZE);
    const wanted=[];
    const vd=Math.max(1,Math.floor(this.viewDistance||ENGINE.VIEW_DISTANCE));
    for(let dz=-vd;dz<=vd;dz++)for(let dx=-vd;dx<=vd;dx++){
      const d=dx*dx+dz*dz;if(d>(vd+.5)**2)continue;
      wanted.push({cx:pcx+dx,cz:pcz+dz,d});
    }
    wanted.sort((a,b)=>a.d-b.d);
    const queued=new Set(this.loadQueue.map(q=>chunkKey(q.cx,q.cz)));
    for(const item of wanted){
      const key=chunkKey(item.cx,item.cz);
      if(!this.getChunk(item.cx,item.cz)&&!queued.has(key)){this.loadQueue.push(item);queued.add(key);}
    }
    this.loadQueue.sort((a,b)=>a.d-b.d);
  }
  tickQueues(renderer){
    const px=renderer.player?.position.x||0,pz=renderer.player?.position.z||0;
    const pcx=floorDiv(Math.floor(px),ENGINE.CHUNK_SIZE),pcz=floorDiv(Math.floor(pz),ENGINE.CHUNK_SIZE);
    let meshWork=0;
    const unmeshed=[];
    for(const c of this.chunks.values()){
      const dx=c.cx-pcx,dz=c.cz-pcz;
      if(Math.max(Math.abs(dx),Math.abs(dz))>(this.viewDistance||ENGINE.VIEW_DISTANCE)+1)continue;
      const key=chunkKey(c.cx,c.cz);
      if(!renderer.chunkMeshes.has(key))unmeshed.push({c,d:dx*dx+dz*dz});
    }
    unmeshed.sort((a,b)=>a.d-b.d);
    for(const item of unmeshed){
      if(meshWork>=ENGINE.MAX_CHUNK_BUILDS_PER_FRAME)break;
      renderer.attachChunk(item.c);
      meshWork++;
    }
    const seen=new Set();
    let loads=0;
    while(loads<ENGINE.MAX_CHUNK_LOADS_PER_FRAME && this.loadQueue.length && meshWork<ENGINE.MAX_CHUNK_BUILDS_PER_FRAME){
      const q=this.loadQueue.shift(),key=chunkKey(q.cx,q.cz);
      if(seen.has(key))continue;
      seen.add(key);
      if(!this.getChunk(q.cx,q.cz)){
        const c=this.ensureChunk(q.cx,q.cz);
        renderer.attachChunk(c);
        meshWork++;
        loads++;
      }
    }
    for(const key of [...this.dirtyChunks]){
      if(meshWork>=ENGINE.MAX_CHUNK_BUILDS_PER_FRAME)break;
      this.dirtyChunks.delete(key);
      const c=this.getChunkByKey(key);
      if(c&&renderer.chunkMeshes.has(key)){
        renderer.rebuildChunk(c);
        meshWork++;
      }
    }
    for(const [key,c] of this.chunks){
      const dx=c.cx-pcx,dz=c.cz-pcz;
      if(Math.max(Math.abs(dx),Math.abs(dz))>(this.viewDistance||ENGINE.VIEW_DISTANCE)+1){
        renderer.detachChunk(c);
        this.chunks.delete(key);
      }
    }
  }
  getChunkByKey(key){return this.chunks.get(key);}
  highestSolidY(x,z){
    for(let y=ENGINE.WORLD_HEIGHT-1;y>=0;y--){const id=this.get(x,y,z);if(SOLID_BLOCKS.has(id))return y;}
    return 0;
  }
  findSpawn(){
    for(let r=0;r<64;r++)for(let a=0;a<16;a++){
      const ang=(a/16)*Math.PI*2;
      const x=Math.floor(Math.cos(ang)*r),z=Math.floor(Math.sin(ang)*r);
      const cp=this.worldToChunk(x,z);this.ensureChunk(cp.cx,cp.cz);
      const y=this.highestSolidY(x,z);
      const surface=this.get(x,y,z);
      if(y>1 && surface!==BLOCK.WATER && SOLID_BLOCKS.has(surface)){
        const spawn=new THREE.Vector3(x+.5,y+1.02,z+.5);
        if(!this.playerWouldBeInside(spawn))return spawn;
      }
    }
    this.ensureChunk(0,0);
    const y=this.highestSolidY(0,0);
    return new THREE.Vector3(.5,y+1.02,.5);
  }
  playerWouldBeInside(pos){
    const box={minX:pos.x-ENGINE.PLAYER_RADIUS,maxX:pos.x+ENGINE.PLAYER_RADIUS,minY:pos.y,maxY:pos.y+ENGINE.PLAYER_HEIGHT,minZ:pos.z-ENGINE.PLAYER_RADIUS,maxZ:pos.z+ENGINE.PLAYER_RADIUS};
    const minX=Math.floor(box.minX),maxX=Math.floor(box.maxX-1e-5),minY=Math.floor(box.minY),maxY=Math.floor(box.maxY-1e-5),minZ=Math.floor(box.minZ),maxZ=Math.floor(box.maxZ-1e-5);
    for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){
      const id=this.getLoaded(x,y,z);if(!SOLID_BLOCKS.has(id))continue;
      if(box.maxX>x&&box.minX<x+1&&box.maxY>y&&box.minY<y+1&&box.maxZ>z&&box.minZ<z+1)return true;
    }
    return false;
  }
}
const VOXEL_FACES = Object.freeze([
  {name:'+X EAST',key:'east',n:[1,0,0],u:[0,1,0],v:[0,0,1],uv:[[0,0],[0,1],[1,1],[1,0]],uvLabel:'U=+Z V=+Y'},
  {name:'-X WEST',key:'west',n:[-1,0,0],u:[0,1,0],v:[0,0,-1],uv:[[0,0],[0,1],[1,1],[1,0]],uvLabel:'U=-Z V=+Y'},
  {name:'+Y TOP',key:'up',n:[0,1,0],u:[1,0,0],v:[0,0,-1],uv:[[0,0],[1,0],[1,1],[0,1]],uvLabel:'U=+X V=-Z'},
  {name:'-Y BOTTOM',key:'down',n:[0,-1,0],u:[1,0,0],v:[0,0,1],uv:[[0,0],[1,0],[1,1],[0,1]],uvLabel:'U=+X V=+Z'},
  {name:'+Z SOUTH',key:'south',n:[0,0,1],u:[1,0,0],v:[0,1,0],uv:[[0,0],[1,0],[1,1],[0,1]],uvLabel:'U=+X V=+Y'},
  {name:'-Z NORTH',key:'north',n:[0,0,-1],u:[-1,0,0],v:[0,1,0],uv:[[0,0],[1,0],[1,1],[0,1]],uvLabel:'U=-X V=+Y'},
]);
const FACE_GEOM = VOXEL_FACES.map(f=>({n:f.n,key:f.key,uv:f.uv,u:f.u,v:f.v,uvLabel:f.uvLabel}));
function voxelFaceVertices(x,y,z,f){
  const c=[x+.5+f.n[0]*.5,y+.5+f.n[1]*.5,z+.5+f.n[2]*.5];
  const uh=f.u.map(v=>v*.5),vh=f.v.map(v=>v*.5);
  return [
    [c[0]-uh[0]-vh[0],c[1]-uh[1]-vh[1],c[2]-uh[2]-vh[2]],
    [c[0]+uh[0]-vh[0],c[1]+uh[1]-vh[1],c[2]+uh[2]-vh[2]],
    [c[0]+uh[0]+vh[0],c[1]+uh[1]+vh[1],c[2]+uh[2]+vh[2]],
    [c[0]-uh[0]+vh[0],c[1]-uh[1]+vh[1],c[2]-uh[2]+vh[2]],
  ];
}
function cross3(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function validateVoxelFaces(){
  const report=[];
  for(const f of VOXEL_FACES){
    const v=voxelFaceVertices(0,0,0,f);const normal=cross3(sub3(v[1],v[0]),sub3(v[2],v[0]));const alignment=dot3(normal,f.n);
    report.push({name:f.name,key:f.key,alignment,valid:alignment>.5});
  }
  return report;
}
const VOXEL_FACE_VALIDATION=validateVoxelFaces();
function validateVoxelUV(){
  const expected={
    east:'U=+Z V=+Y',
    west:'U=-Z V=+Y',
    up:'U=+X V=-Z',
    down:'U=+X V=+Z',
    south:'U=+X V=+Y',
    north:'U=-X V=+Y'
  };
  return VOXEL_FACES.map(f=>({
    key:f.key,
    name:f.name,
    expected:expected[f.key],
    actual:f.uvLabel,
    uv:f.uv.map(q=>[q[0],q[1]]),
    valid:f.uvLabel===expected[f.key] && f.uv.length===4
  }));
}
const VOXEL_UV_VALIDATION=validateVoxelUV();
function faceKeyFromNormal(n){
  const x=Array.isArray(n)?n[0]:n.x,y=Array.isArray(n)?n[1]:n.y,z=Array.isArray(n)?n[2]:n.z;
  if(x===1)return 'east';if(x===-1)return 'west';
  if(y===1)return 'up';if(y===-1)return 'down';
  if(z===1)return 'south';if(z===-1)return 'north';
  return 'unknown';
}
function faceTemplate(key){return VOXEL_FACES.find(f=>f.key===key)||null;}
function voxelFaceVisibility(world,x,y,z,id,face){
  const f=typeof face==='string'?faceTemplate(face):face;
  const nx=x+f.n[0],ny=y+f.n[1],nz=z+f.n[2];
  const state=world.getLoadedState(nx,ny,nz),neighbor=state.id;
  const sameTransparent=(neighbor===id&&TRANSPARENT_BLOCKS.has(id));
  const logThroughLeaves=(id===BLOCK.OAK_LOG&&neighbor===BLOCK.OAK_LEAVES);
  let visible=false,reason='';
  if(!state.loaded){visible=true;reason='NEIGHBOR CHUNK UNLOADED — KEEP FACE';}
  else if(neighbor===BLOCK.AIR){visible=true;reason='NEIGHBOR AIR';}
  else if(logThroughLeaves){visible=true;reason='LOG-THROUGH-LEAVES PRESERVATION';}
  else if(sameTransparent){visible=false;reason='SAME TRANSPARENT/CUTOUT INTERNAL FACE CULLED';}
  else if(TRANSPARENT_BLOCKS.has(neighbor)){visible=true;reason='NEIGHBOR TRANSPARENT/CUTOUT';}
  else{visible=false;reason='OPAQUE INTERNAL FACE CULLED';}
  return {visible,reason,neighbor,state,nx,ny,nz,logThroughLeaves,sameTransparent};
}
class ChunkMesher {
  constructor(world,atlas){this.world=world;this.atlas=atlas;this.lastReport=null;}
  textureName(block,face){
    const spec=BLOCK_FACE_TEXTURE[block]||{all:'missing'};
    return spec[face]||spec.all||'missing';
  }
  materialKind(block){
    if(block===BLOCK.WATER)return 'water';
    if(block===BLOCK.OAK_LEAVES)return 'leaves';
    if(block===BLOCK.TALL_GRASS||block===BLOCK.FLOWER||block===BLOCK.TORCH)return 'cutout';
    if(block===BLOCK.GLASS)return 'glass';
    return 'opaque';
  }
  vertexTint(block,face){
    if(block===BLOCK.GRASS&&face==='up')return [0.58,0.82,0.42];
    if(block===BLOCK.TALL_GRASS)return [0.58,0.82,0.42];
    if(block===BLOCK.OAK_LEAVES)return [0.78,0.98,0.70];
    return [1,1,1];
  }
  addQuad(positions,normals,uvs,colors,buckets,x,y,z,face,texture){
    const base=positions.length/3;
    const f=VOXEL_FACES.find(q=>q.key===face);
    const verts=voxelFaceVertices(x,y,z,f);
    for(const v of verts)positions.push(v[0],v[1],v[2]);
    for(let i=0;i<4;i++)normals.push(f.n[0],f.n[1],f.n[2]);
    for(const q of f.uv){const p=this.atlas.uv(texture,q[0],q[1]);uvs.push(p[0],p[1]);}
    const tint=this.vertexTint(this.currentBlock,face);
    for(let i=0;i<4;i++)colors.push(tint[0],tint[1],tint[2]);
    const idx=buckets[this.materialKind(this.currentBlock)];
    idx.push(base,base+1,base+2,base,base+2,base+3);
  }
  build(chunk){
    const positions=[],normals=[],uvs=[],colors=[];
    const buckets={opaque:[],cutout:[],leaves:[],glass:[],water:[]};
    const faceStats={east:0,west:0,up:0,down:0,south:0,north:0};
    const blockStats={};
    const textureStats={};
    const samples=[];
    const size=chunk.size;
    let emitted=0,culled=0;
    for(let y=0;y<chunk.height;y++)for(let z=0;z<size;z++)for(let x=0;x<size;x++){
      const id=chunk.get(x,y,z);if(id===BLOCK.AIR)continue;
      const wx=chunk.cx*size+x,wz=chunk.cz*size+z;this.currentBlock=id;
      for(let fi=0;fi<FACE_DIRS.length;fi++){
        const d=FACE_DIRS[fi],face=FACE_NAMES[fi];
        const decision=voxelFaceVisibility(this.world,wx,y,wz,id,face);
        const neighbor=decision.neighbor;
        if(!decision.visible){culled++;continue;}
        if(id===BLOCK.TORCH||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER){
          if(fi===0){
            if(id===BLOCK.TORCH)this.addTorchQuad(positions,normals,uvs,colors,buckets,wx,y,wz,face);
            else this.addPlantQuad(positions,normals,uvs,colors,buckets,wx,y,wz,id);
            emitted++;faceStats[face]++;
          }
        }else{
          this.addQuad(positions,normals,uvs,colors,buckets,wx,y,wz,face,this.textureName(id,face));
          emitted++;faceStats[face]++;
        }
        blockStats[BLOCK_NAME[id]||String(id)]=(blockStats[BLOCK_NAME[id]||String(id)]||0)+1;
        const tex=this.textureName(id,face);textureStats[tex]=(textureStats[tex]||0)+1;
        if(samples.length<80){const ft=faceTemplate(face);samples.push(`FACE ${ft.name} | VOXEL (${wx},${y},${wz}) | BLOCK ${BLOCK_NAME[id]||id} | NORMAL [${d.join(',')}] | TEXTURE ${tex} | NEIGHBOR ${BLOCK_NAME[neighbor]||'AIR'} | ${decision.reason} | WINDING OUTWARD | ${ft.uvLabel}`);}
      }
    }
    const ordered=[...buckets.opaque,...buckets.cutout,...buckets.leaves,...buckets.glass,...buckets.water];
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    g.setIndex(ordered);
    let offset=0;const ranges=[];
    for(const kind of ['opaque','cutout','leaves','glass','water']){const count=buckets[kind].length;ranges.push({kind,start:offset,count});if(count)g.addGroup(offset,count,kind==='opaque'?0:kind==='cutout'?1:kind==='leaves'?2:kind==='glass'?3:4);offset+=count;}
    g.computeBoundingSphere();
    this.lastReport={chunk:`${chunk.cx},${chunk.cz}`,faces:emitted,culled,faceStats,blockStats,textureStats,samples,groups:ranges};
    return g;
  }
  addPlantQuad(p,n,u,c,b,x,y,z,id){
    const tex=id===BLOCK.FLOWER?'flower':'tall_grass';
    const tint=id===BLOCK.TALL_GRASS?[0.58,0.82,0.42]:[1,1,1];
    const add=(a,bv,cv,d,normal)=>{
      const base=p.length/3;
      for(const v of [a,bv,cv,d])p.push(...v);
      for(let k=0;k<4;k++){n.push(...normal);c.push(...tint);}
      for(const q of [[0,0],[1,0],[1,1],[0,1]]){const uv=this.atlas.uv(tex,q[0],q[1]);u.push(...uv);}
      b.cutout.push(base,base+1,base+2,base,base+2,base+3, base,base+2,base+1,base,base+3,base+2);
    };
    add([x,y,z],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z],[-.707,0,.707]);
    add([x+1,y,z],[x,y,z+1],[x,y+1,z+1],[x+1,y+1,z],[.707,0,.707]);
  }
  addTorchQuad(p,n,u,c,b,x,y,z){
    const cx=x+.5,cz=z+.5,h=.78,r=.09;
    const add=(verts,normal)=>{
      const base=p.length/3;
      for(const v of verts)p.push(...v);
      for(let k=0;k<4;k++){n.push(...normal);c.push(1,1,1);}
      for(const q of [[0,0],[1,0],[1,1],[0,1]]){const uv=this.atlas.uv('torch',q[0],q[1]);u.push(...uv);}
      b.cutout.push(base,base+1,base+2,base,base+2,base+3, base,base+2,base+1,base,base+3,base+2);
    };
    add([[cx-r,y,cz],[cx+r,y,cz],[cx+r,y+h,cz],[cx-r,y+h,cz]],[0,0,1]);
    add([[cx,y,cz-r],[cx,y,cz+r],[cx,y+h,cz+r],[cx,y+h,cz-r]],[1,0,0]);
  }
}
class VoxelRenderer {
  constructor(world,atlas){
    this.world=world;this.atlas=atlas;this.mesher=new ChunkMesher(world,atlas);
    this.renderer=null;this.backendRequested='webgl';this.backendActual='UNINITIALIZED';this.backendInitError='';
    this.backendDetails={secureContext:window.isSecureContext===true,navigatorGPU:!!navigator.gpu,adapter:null};
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x7fb8df);this.camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,700);this.camera.rotation.order='YXZ';
    this.chunkGroup=new THREE.Group();this.scene.add(this.chunkGroup);this.player=null;
    this.materialOpaque=new THREE.MeshLambertMaterial({map:atlas.texture,color:0xffffff,vertexColors:true,side:THREE.FrontSide,depthWrite:true,depthTest:true});
    this.materialCutout=new THREE.MeshLambertMaterial({map:atlas.texture,color:0xffffff,vertexColors:true,side:THREE.FrontSide,transparent:false,opacity:1,alphaTest:.75,depthWrite:true,depthTest:true});
    this.materialLeaves=new THREE.MeshLambertMaterial({map:atlas.texture,color:0xffffff,vertexColors:true,side:THREE.DoubleSide,transparent:false,opacity:1,alphaTest:.50,depthWrite:true,depthTest:true});
    this.materialGlass=new THREE.MeshLambertMaterial({map:atlas.texture,color:0xffffff,vertexColors:true,side:THREE.FrontSide,transparent:true,opacity:.42,alphaTest:.02,depthWrite:true,depthTest:true});
    this.materialWater=new THREE.MeshLambertMaterial({map:atlas.texture,color:0xffffff,vertexColors:true,side:THREE.FrontSide,transparent:true,opacity:.66,alphaTest:.02,depthWrite:true,depthTest:true});
    this.materials=[this.materialOpaque,this.materialCutout,this.materialLeaves,this.materialGlass,this.materialWater];
    this.sun=new THREE.DirectionalLight(0xfff3d0,1.15);this.sun.position.set(80,130,40);this.scene.add(this.sun);
    this.ambient=new THREE.HemisphereLight(0x9cc9ff,0x4b3826,.78);this.scene.add(this.ambient);this.fog=new THREE.Fog(0x8bc3ea,90,260);this.scene.fog=this.fog;
    this.chunkMeshes=new Map();this.chunkReports=new Map();this.clock=0;this.stats={drawCalls:0,triangles:0,chunks:0,faces:0,culledFaces:0};
    this.lod={current:100,pending:null,lastChange:0,transitionMs:260,qualityCeiling:100,near:10,far:32};
    const selGeo=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004));
    this.selectionHelper=new THREE.LineSegments(selGeo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.48,depthTest:true,depthWrite:false}));
    this.selectionHelper.visible=false;this.selectionHelper.renderOrder=999;this.scene.add(this.selectionHelper);
    this.validateFaceTemplates();
  }
  async initBackend(requested=localStorage.getItem('mcRendererBackendV10')||'webgl'){
    requested=['webgl','webgpu','auto'].includes(requested)?requested:'webgl';
    this.backendRequested=requested;this.backendInitError='';
    const wantsGPU=requested==='webgpu'||(requested==='auto'&&window.isSecureContext===true&&!!navigator.gpu);
    let r=null;
    if(wantsGPU){
      try{
        if(window.isSecureContext!==true)throw new Error('WebGPU requires a secure context (HTTPS or localhost).');
        if(!navigator.gpu)throw new Error('navigator.gpu is unavailable in this browser.');
        const WGPU=await import('three/webgpu');
        r=new WGPU.WebGPURenderer({canvas,antialias:true,alpha:false});
        r.setPixelRatio(Math.min(window.devicePixelRatio||1,2.0));
        r.setSize(innerWidth,innerHeight,false);
        r.outputColorSpace=THREE.SRGBColorSpace;
        await r.init();
        const bn=r.backend?.constructor?.name||'';
        this.backendActual=/webgpu/i.test(bn)||r.backend?.isWebGPUBackend?'WebGPU':/webgl/i.test(bn)?'WebGL2 (WebGPURenderer fallback)':'WebGPU renderer';
        try{
          const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
          if(adapter){const info=adapter.info||{};this.backendDetails.adapter={vendor:info.vendor||'',architecture:info.architecture||'',device:info.device||'',description:info.description||'',maxTextureDimension2D:adapter.limits?.maxTextureDimension2D||null,maxBufferSize:adapter.limits?.maxBufferSize||null};}
        }catch{}
      }catch(e){
        this.backendInitError=e?.message||String(e);
        window.__voxelDiag?.log?.(`WEBGPU INIT FAILED: ${this.backendInitError} — using WebGLRenderer.`, 'warn');
        r=null;
      }
    }
    if(!r){
      r=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
      r.setPixelRatio(Math.min(window.devicePixelRatio||1,2.0));
      r.setSize(innerWidth,innerHeight,false);r.outputColorSpace=THREE.SRGBColorSpace;
      this.backendActual=r.capabilities?.isWebGL2?'WebGL2':'WebGL1';
    }
    this.renderer=r;
    if(this.renderer.shadowMap)this.renderer.shadowMap.enabled=false;
    window.__voxelDiag?.log?.(`RENDER BACKEND: requested ${requested.toUpperCase()} → actual ${this.backendActual}${this.backendInitError?` | ${this.backendInitError}`:''}`,this.backendActual.startsWith('WebGPU')?'ok':'info');
    return this.backendActual;
  }
  backendLabel(){return this.backendActual||'UNKNOWN';}
  maxAnisotropy(){try{const f=this.renderer?.capabilities?.getMaxAnisotropy;if(typeof f==='function')return Math.max(1,f.call(this.renderer.capabilities)||1);}catch{}return this.backendActual?.startsWith('WebGPU')?8:4;}
  readRenderInfo(){const info=this.renderer?.info?.render||{};return {calls:Number(info.calls??info.drawCalls??info.draws??0)||0,triangles:Number(info.triangles??0)||0};}
  validateFaceTemplates(){
    const bad=VOXEL_FACE_VALIDATION.filter(x=>!x.valid),badUV=VOXEL_UV_VALIDATION.filter(x=>!x.valid);
    window.__voxelDiag?.log?.('──── GEOMETRIC WINDING VALIDATION ────','face');
    for(const r of VOXEL_FACE_VALIDATION)window.__voxelDiag?.log?.(`${r.valid?'✓':'✗'} ${r.name}: ${r.valid?'OUTWARD':'INWARD/BROKEN'} dot=${r.alignment.toFixed(3)}`,r.valid?'ok':'err');
    window.__voxelDiag?.log?.('──── UV ORIENTATION VALIDATION ────','face');
    for(const r of VOXEL_UV_VALIDATION)window.__voxelDiag?.log?.(`${r.valid?'✓':'✗'} ${r.name}: ${r.actual} | UV ${JSON.stringify(r.uv)}`,r.valid?'ok':'err');
    if(bad.length||badUV.length)throw new Error(`${bad.length} winding and ${badUV.length} UV face template validation failure(s).`);
  }
  showSelection(hit){
    if(!hit){this.selectionHelper.visible=false;return;}
    this.selectionHelper.visible=true;this.selectionHelper.position.set(hit.x+.5,hit.y+.5,hit.z+.5);
  }
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight,false);}
  attachChunk(chunk){
    const key=chunkKey(chunk.cx,chunk.cz);
    if(!this.chunkMeshes.has(key))this.rebuildChunk(chunk);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const n=this.world.getChunk(chunk.cx+dx,chunk.cz+dz);
      if(n&&this.chunkMeshes.has(chunkKey(n.cx,n.cz)))this.world.dirtyChunks.add(chunkKey(n.cx,n.cz));
    }
  }
  detachChunk(chunk){const key=chunkKey(chunk.cx,chunk.cz);const mesh=this.chunkMeshes.get(key);if(mesh){this.chunkGroup.remove(mesh);mesh.geometry.dispose();this.chunkMeshes.delete(key);}this.chunkReports.delete(key);this.updateDiagnostics();}
  rebuildChunk(chunk){
    const key=chunkKey(chunk.cx,chunk.cz),old=this.chunkMeshes.get(key);if(old){this.chunkGroup.remove(old);old.geometry.dispose();this.chunkMeshes.delete(key);}
    const g=this.mesher.build(chunk);if(g.index&&g.index.count===0){g.dispose();this.chunkReports.set(key,this.mesher.lastReport);this.updateDiagnostics();return;}
    const mesh=new THREE.Mesh(g,this.materials);mesh.position.set(0,0,0);mesh.frustumCulled=true;mesh.name=`chunk_${key}`;this.chunkGroup.add(mesh);this.chunkMeshes.set(key,mesh);chunk.mesh=mesh;chunk.dirty=false;this.chunkReports.set(key,this.mesher.lastReport);this.updateDiagnostics();
  }
  aggregateDiagnostics(){
    const out={faces:0,culledFaces:0,faceStats:{east:0,west:0,up:0,down:0,south:0,north:0},blockStats:{},textureStats:{},samples:[],chunks:this.chunkMeshes.size};
    for(const r of this.chunkReports.values()){
      out.faces+=r.faces||0;out.culledFaces+=r.culled||0;
      for(const k of Object.keys(out.faceStats))out.faceStats[k]+=(r.faceStats?.[k]||0);
      for(const [k,v] of Object.entries(r.blockStats||{}))out.blockStats[k]=(out.blockStats[k]||0)+v;
      for(const [k,v] of Object.entries(r.textureStats||{}))out.textureStats[k]=(out.textureStats[k]||0)+v;
      if(out.samples.length<250)out.samples.push(...(r.samples||[]).slice(0,250-out.samples.length));
    }
    return out;
  }
  updateDiagnostics(force=false){
    const now=performance.now();
    if(!force && this._lastDiagnosticsAt && now-this._lastDiagnosticsAt<220)return;
    this._lastDiagnosticsAt=now;
    const a=this.aggregateDiagnostics();
    this.stats.faces=a.faces;
    this.stats.culledFaces=a.culledFaces;
    window.__voxelDiag?.setWorldReport?.(a);
  }
  applyTextureQuality(q){
    this.lod.current=q;const maxA=this.maxAnisotropy();this.atlas.texture.anisotropy=q>=75?Math.min(maxA,8):q>=50?Math.min(maxA,4):1;this.atlas.texture.needsUpdate=true;
    window.__voxelDiag?.log?.(`Texture LOD tier ${q}% — anisotropy ${this.atlas.texture.anisotropy}`, 'info');
  }
  updateLOD(){
    if(!this.player)return;
    const max=this.lod.qualityCeiling;
    const fps=window.game?.stats?.fps||60;
    let desired=fps<34?25:fps<46?50:fps<56?75:100;
    desired=Math.min(desired,max);
    if(desired===this.lod.current){this.lod.pending=null;return;}
    if(this.lod.pending!==desired){this.lod.pending=desired;this.lod.lastChange=performance.now();return;}
    if(performance.now()-this.lod.lastChange<this.lod.transitionMs)return;
    this.lod.pending=null;this.applyTextureQuality(desired);
  }
  render(dt){
    this.clock+=dt;const daylight=.5+.5*Math.sin((this.clock/120)*Math.PI*2);this.sun.position.set(Math.cos(this.clock*.03)*120,60+daylight*90,Math.sin(this.clock*.03)*120);this.sun.intensity=.55+daylight*.75;this.ambient.intensity=.55+daylight*.35;this.scene.background.setHSL(.56,.42,.62+.08*daylight);this.fog.color.copy(this.scene.background);this.updateLOD();this.renderer.render(this.scene,this.camera);{const ri=this.readRenderInfo();this.stats.drawCalls=ri.calls;this.stats.triangles=ri.triangles;}this.stats.chunks=this.chunkMeshes.size;
  }
}
class Player {
  constructor(world,mode){
    this.world=world;this.mode=mode;
    this.position=world.findSpawn();
    this.velocity=new THREE.Vector3();
    this.yaw=0;this.pitch=0;this.onGround=false;this.flying=mode==='creative';
    this.health=20;this.hunger=20;this.sprinting=false;this.dead=false;
    this.input={forward:0,right:0,jump:false,sneak:false,run:false};
    this.selected=0;this.breaking=null;this.breakProgress=0;this.lastAttack=0;
  }
  eyePosition(out=new THREE.Vector3()){out.copy(this.position);out.y+=ENGINE.EYE_HEIGHT;return out;}
  updateCamera(camera){camera.position.set(this.position.x,this.position.y+ENGINE.EYE_HEIGHT,this.position.z);camera.rotation.y=this.yaw;camera.rotation.x=this.pitch;}
  aabb(pos=this.position){return {minX:pos.x-ENGINE.PLAYER_RADIUS,maxX:pos.x+ENGINE.PLAYER_RADIUS,minY:pos.y,maxY:pos.y+ENGINE.PLAYER_HEIGHT,minZ:pos.z-ENGINE.PLAYER_RADIUS,maxZ:pos.z+ENGINE.PLAYER_RADIUS};}
  collidesAt(pos){
    const box=this.aabb(pos);
    const minX=Math.floor(box.minX),maxX=Math.floor(box.maxX-1e-5),minY=Math.floor(box.minY),maxY=Math.floor(box.maxY-1e-5),minZ=Math.floor(box.minZ),maxZ=Math.floor(box.maxZ-1e-5);
    for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){
      const state=this.world.getLoadedState(x,y,z);
      if(!state.loaded)return true;
      const id=state.id;if(!SOLID_BLOCKS.has(id))continue;
      if(box.maxX>x&&box.minX<x+1&&box.maxY>y&&box.minY<y+1&&box.maxZ>z&&box.minZ<z+1)return true;
    }
    return false;
  }
  moveAxis(axis,amount){
    if(amount===0)return;
    const next=this.position.clone();next[axis]+=amount;
    if(!this.collidesAt(next)){this.position.copy(next);return;}
    if(axis==='x'||axis==='z'){
      const step=this.position.clone();step.y+=.55;
      step[axis]+=amount;
      if(!this.collidesAt(step)){this.position.copy(step);return;}
    }
    this.velocity[axis]=0;
    if(axis==='y'&&amount<0)this.onGround=true;
  }
  update(dt,controls){
    this.input=controls;
    if(this.mode==='creative'&&controls.flyToggle)this.flying=!this.flying;
    const forward=yawForward(this.yaw),right=yawRight(this.yaw);
    let mx=forward.x*controls.forward+right.x*controls.right;
    let mz=forward.z*controls.forward+right.z*controls.right;
    const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len;}
    const speed=controls.run?ENGINE.PLAYER_RUN:ENGINE.PLAYER_SPEED;
    if(this.flying){
      this.velocity.x=mx*speed;this.velocity.z=mz*speed;this.velocity.y=(controls.jump?speed:0)-(controls.sneak?speed:0);
      this.position.x+=this.velocity.x*dt;this.position.y+=this.velocity.y*dt;this.position.z+=this.velocity.z*dt;
      this.position.y=clamp(this.position.y,1,ENGINE.WORLD_HEIGHT-2);
      return;
    }
    this.velocity.x=lerp(this.velocity.x,mx*speed,1-Math.pow(.001,dt));
    this.velocity.z=lerp(this.velocity.z,mz*speed,1-Math.pow(.001,dt));
    if(controls.jump&&this.onGround){this.velocity.y=ENGINE.PLAYER_JUMP;this.onGround=false;}
    this.velocity.y-=ENGINE.GRAVITY*dt;
    this.onGround=false;
    this.moveAxis('x',this.velocity.x*dt);
    this.moveAxis('z',this.velocity.z*dt);
    this.moveAxis('y',this.velocity.y*dt);
    if(this.position.y<-10){this.health=0;this.dead=true;}
  }
}
class VoxelRaycaster {
  constructor(world){this.world=world;}
  cast(origin,direction,maxDistance=ENGINE.REACH){
    const dir=direction.clone().normalize();
    let x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);
    const stepX=dir.x>0?1:-1,stepY=dir.y>0?1:-1,stepZ=dir.z>0?1:-1;
    const tx=dir.x===0?Infinity:Math.abs(1/dir.x),ty=dir.y===0?Infinity:Math.abs(1/dir.y),tz=dir.z===0?Infinity:Math.abs(1/dir.z);
    const bx=dir.x>0?x+1-origin.x:origin.x-x,by=dir.y>0?y+1-origin.y:origin.y-y,bz=dir.z>0?z+1-origin.z:origin.z-z;
    let tMaxX=dir.x===0?Infinity:bx*tx,tMaxY=dir.y===0?Infinity:by*ty,tMaxZ=dir.z===0?Infinity:bz*tz;
    let face=[0,0,0],distance=0;
    for(let i=0;i<256&&distance<=maxDistance;i++){
      const state=this.world.getLoadedState(x,y,z);
      if(!state.loaded)return null; // never raycast through an unmeshed/unloaded void into a distant chunk
      const id=state.id;
      if(id!==BLOCK.AIR&&id!==BLOCK.WATER&&id!==BLOCK.TALL_GRASS&&id!==BLOCK.FLOWER){return {x,y,z,id,face,distance,place:{x:x+face[0],y:y+face[1],z:z+face[2]}};}
      if(tMaxX<tMaxY&&tMaxX<tMaxZ){x+=stepX;distance=tMaxX;tMaxX+=tx;face=[-stepX,0,0];}
      else if(tMaxY<tMaxZ){y+=stepY;distance=tMaxY;tMaxY+=ty;face=[0,-stepY,0];}
      else{z+=stepZ;distance=tMaxZ;tMaxZ+=tz;face=[0,0,-stepZ];}
    }
    return null;
  }
}
class ItemStack {
  constructor(id=ITEM.AIR,count=0){this.id=id;this.count=count;}
  clone(){return new ItemStack(this.id,this.count);}
  empty(){return this.id===ITEM.AIR||this.count<=0;}
  normalize(){if(this.count<=0){this.id=ITEM.AIR;this.count=0;}return this;}
}
class Inventory {
  constructor(size=36){this.slots=Array.from({length:size},()=>new ItemStack());this.cursor=new ItemStack();this.selected=0;}
  get(i){return this.slots[i]||new ItemStack();}
  set(i,stack){this.slots[i]=stack;}
  add(id,count=1,max=64){
    let remaining=count;
    for(const s of this.slots){if(s.id===id&&s.count<max){const n=Math.min(remaining,max-s.count);s.count+=n;remaining-=n;if(!remaining)return 0;}}
    for(const s of this.slots){if(s.empty()){const n=Math.min(remaining,max);s.id=id;s.count=n;remaining-=n;if(!remaining)return 0;}}
    return remaining;
  }
  remove(id,count=1){
    let remaining=count;
    for(const s of this.slots){if(s.id!==id)continue;const n=Math.min(remaining,s.count);s.count-=n;remaining-=n;s.normalize();if(!remaining)break;}
    return count-remaining;
  }
  has(id,count=1){let n=0;for(const s of this.slots)if(s.id===id)n+=s.count;return n>=count;}
  consume(id,count=1){if(!this.has(id,count))return false;this.remove(id,count);return true;}
  serialize(){return this.slots.map(s=>({id:s.id,count:s.count}));}
  load(data){if(!Array.isArray(data))return;for(let i=0;i<this.slots.length;i++){const s=data[i];this.slots[i]=new ItemStack(s?.id||0,s?.count||0);}}
}
const RECIPES=[
  {name:'Oak Planks',shape:[[ITEM.OAK_LOG]],out:new ItemStack(ITEM.OAK_PLANKS,4)},
  {name:'Stick',shape:[[ITEM.OAK_PLANKS],[ITEM.OAK_PLANKS]],out:new ItemStack(ITEM.STICK,4)},
  {name:'Crafting Table',shape:[[ITEM.OAK_PLANKS,ITEM.OAK_PLANKS],[ITEM.OAK_PLANKS,ITEM.OAK_PLANKS]],out:new ItemStack(ITEM.CRAFTING_TABLE,1)},
  {name:'Wood Pickaxe',shape:[[ITEM.OAK_PLANKS,ITEM.OAK_PLANKS,ITEM.OAK_PLANKS],[0,ITEM.STICK,0],[0,ITEM.STICK,0]],out:new ItemStack(ITEM.WOOD_PICKAXE,1)},
  {name:'Stone Pickaxe',shape:[[ITEM.COBBLESTONE,ITEM.COBBLESTONE,ITEM.COBBLESTONE],[0,ITEM.STICK,0],[0,ITEM.STICK,0]],out:new ItemStack(ITEM.STONE_PICKAXE,1)},
  {name:'Iron Pickaxe',shape:[[ITEM.IRON_INGOT,ITEM.IRON_INGOT,ITEM.IRON_INGOT],[0,ITEM.STICK,0],[0,ITEM.STICK,0]],out:new ItemStack(ITEM.IRON_PICKAXE,1)},
  {name:'Diamond Pickaxe',shape:[[ITEM.DIAMOND,ITEM.DIAMOND,ITEM.DIAMOND],[0,ITEM.STICK,0],[0,ITEM.STICK,0]],out:new ItemStack(ITEM.DIAMOND_PICKAXE,1)},
  {name:'Wood Sword',shape:[[ITEM.OAK_PLANKS],[ITEM.OAK_PLANKS],[ITEM.STICK]],out:new ItemStack(ITEM.WOOD_SWORD,1)},
  {name:'Stone Sword',shape:[[ITEM.COBBLESTONE],[ITEM.COBBLESTONE],[ITEM.STICK]],out:new ItemStack(ITEM.STONE_SWORD,1)},
  {name:'Torch',shape:[[ITEM.COAL],[ITEM.STICK]],out:new ItemStack(ITEM.TORCH,4)},
  {name:'Furnace',shape:[[ITEM.COBBLESTONE,ITEM.COBBLESTONE,ITEM.COBBLESTONE],[ITEM.COBBLESTONE,0,ITEM.COBBLESTONE],[ITEM.COBBLESTONE,ITEM.COBBLESTONE,ITEM.COBBLESTONE]],out:new ItemStack(ITEM.FURNACE,1)},
  {name:'Bread',shape:[[ITEM.OAK_PLANKS,ITEM.OAK_PLANKS,ITEM.OAK_PLANKS]],out:new ItemStack(ITEM.BREAD,1)},
];
function recipeMatches(grid,recipe){
  const h=grid.length,w=grid[0]?.length||0,sh=recipe.shape.length,sw=recipe.shape[0]?.length||0;
  for(let oy=0;oy<=h-sh;oy++)for(let ox=0;ox<=w-sw;ox++){
    let ok=true;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const expected=(y>=oy&&y<oy+sh&&x>=ox&&x<ox+sw)?recipe.shape[y-oy][x-ox]||0:0;
      const actual=grid[y][x]?.id||0;
      if(actual!==expected){ok=false;break;}
    }
    if(ok)return true;
  }
  return false;
}
class Crafting {
  constructor(inventory){this.inventory=inventory;this.grid=Array.from({length:9},()=>new ItemStack());this.output=new ItemStack();}
  currentGrid(){return [this.grid.slice(0,3),this.grid.slice(3,6),this.grid.slice(6,9)];}
  findRecipe(){const grid=this.currentGrid();return RECIPES.find(r=>recipeMatches(grid,r))||null;}
  update(){const r=this.findRecipe();this.output=r?r.out.clone():new ItemStack();return r;}
  takeOutput(){const r=this.findRecipe();if(!r)return false;for(const s of this.grid){if(!s.empty()){s.count--;s.normalize();}}
    this.inventory.add(r.out.id,r.out.count);this.update();return true;}
}
class DroppedItem {
  constructor(id,count,pos){this.id=id;this.count=count;this.position=pos.clone();this.velocity=new THREE.Vector3((Math.random()-.5)*1.2,2+Math.random()*1.3,(Math.random()-.5)*1.2);this.age=0;this.pickupDelay=.6;this.spin=Math.random()*6;this.mesh=null;}
  update(dt,world){
    this.age+=dt;this.pickupDelay-=dt;this.velocity.y-=ENGINE.GRAVITY*.65*dt;
    const next=this.position.clone().addScaledVector(this.velocity,dt);
    const bx=Math.floor(next.x),by=Math.floor(next.y),bz=Math.floor(next.z);
    if(this.velocity.y<0&&SOLID_BLOCKS.has(world.getLoaded(bx,Math.floor(next.y-.1),bz))){this.velocity.y*=-.32;next.y=Math.ceil(next.y-.1)+.12;this.velocity.x*=.82;this.velocity.z*=.82;}
    this.position.copy(next);this.spin+=dt*2.4;
  }
}
class DropSystem {
  constructor(world,scene){
    this.world=world;this.scene=scene;this.items=[];this.group=new THREE.Group();scene.add(this.group);
    this.geometry=new THREE.PlaneGeometry(.42,.42);
    this.materials=new Map();
  }
  iconMaterial(id){
    if(this.materials.has(id))return this.materials.get(id);
    const c=document.createElement('canvas');c.width=32;c.height=32;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
    const palette={
      [ITEM.GRASS]:['#7aaa3b','#8b5a32'],[ITEM.DIRT]:['#8b5a32','#5b3b22'],[ITEM.STONE]:['#777','#444'],[ITEM.SAND]:['#d8c27a','#a68d4e'],
      [ITEM.OAK_LOG]:['#8b5a32','#5c371f'],[ITEM.OAK_PLANKS]:['#b9894f','#78552e'],[ITEM.COBBLESTONE]:['#777','#555'],[ITEM.GLASS]:['#9bdcff','#477b9c'],
      [ITEM.CRAFTING_TABLE]:['#a36b36','#5e3b1f'],[ITEM.TORCH]:['#ffbf3b','#7a3d18'],[ITEM.DIAMOND]:['#64e5e8','#168b9c'],[ITEM.IRON_INGOT]:['#d6d6d6','#777'],
      [ITEM.COAL]:['#222','#080808'],[ITEM.STICK]:['#b47b43','#6c4726']
    }[id]||['#aaa','#555'];
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(3,4,25,25);ctx.fillStyle=palette[0];ctx.fillRect(4,3,24,24);ctx.fillStyle=palette[1];
    for(let y=4;y<27;y+=4)for(let x=5;x<27;x+=5)if((x+y+id)%3===0)ctx.fillRect(x,y,2,2);
    const tex=new THREE.CanvasTexture(c);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.colorSpace=THREE.SRGBColorSpace;
    const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});this.materials.set(id,mat);return mat;
  }
  spawn(id,count,pos){
    if(this.items.length>=ENGINE.MAX_DROPS)return;
    const d=new DroppedItem(id,count,pos);d.mesh=new THREE.Sprite(this.iconMaterial(id));d.mesh.scale.set(.48,.48,1);d.mesh.position.copy(pos);this.group.add(d.mesh);this.items.push(d);
  }
  update(dt,player,inventory){for(let i=this.items.length-1;i>=0;i--){const d=this.items[i];d.update(dt,this.world);d.mesh.position.copy(d.position);d.mesh.material.rotation=d.spin;
      if(d.pickupDelay<=0&&d.position.distanceTo(player.position)<1.35){const left=inventory.add(d.id,d.count);if(left<d.count){d.count=left;if(d.count<=0){this.group.remove(d.mesh);this.items.splice(i,1);}}}
      if(d.age>300){this.group.remove(d.mesh);this.items.splice(i,1);}
    }}
}
class ParticleSystem {
  constructor(scene){this.scene=scene;this.items=[];this.geometry=new THREE.BoxGeometry(.045,.045,.045);this.material=new THREE.MeshBasicMaterial({color:0xffffff});this.pool=[];}
  spawnBurst(pos,count=8){for(let i=0;i<count;i++){if(this.items.length>=ENGINE.MAX_PARTICLES)break;const mesh=this.pool.pop()||new THREE.Mesh(this.geometry,this.material);mesh.position.copy(pos);this.scene.add(mesh);const p={mesh,age:0,life:.35+Math.random()*.45,velocity:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3)};this.items.push(p);}}
  update(dt){for(let i=this.items.length-1;i>=0;i--){const p=this.items[i];p.age+=dt;p.velocity.y-=18*dt;p.mesh.position.addScaledVector(p.velocity,dt);p.mesh.scale.setScalar(1-p.age/p.life);if(p.age>=p.life){this.scene.remove(p.mesh);this.pool.push(p.mesh);this.items.splice(i,1);}}}
}
class Mob {
  constructor(type,pos){this.type=type;this.position=pos.clone();this.velocity=new THREE.Vector3();this.health=type==='zombie'?20:10;this.yaw=Math.random()*Math.PI*2;this.target=null;this.age=0;this.think=0;this.attack=0;this.mesh=null;this.wander=0;}
  createMesh(){
    const group=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(.65,1.05,.4),new THREE.MeshLambertMaterial({color:this.type==='zombie'?0x4b8b4b:0xc9c9c9}));body.position.y=.72;group.add(body);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.55,.55,.55),new THREE.MeshLambertMaterial({color:this.type==='zombie'?0x5a9b5a:0xe2e2e2}));head.position.y=1.45;group.add(head);
    const legGeo=new THREE.BoxGeometry(.18,.65,.18);const legMat=new THREE.MeshLambertMaterial({color:0x303d8a});
    const l=new THREE.Mesh(legGeo,legMat),r=new THREE.Mesh(legGeo,legMat);l.position.set(-.18,.32,0);r.position.set(.18,.32,0);group.add(l,r);this.legs=[l,r];
    this.mesh=group;return group;
  }
  distanceTo(p){return this.position.distanceTo(p.position);}
  update(dt,world,player){
    this.age+=dt;this.think-=dt;this.attack-=dt;
    const dist=this.distanceTo(player);
    if(dist>48)return;
    if(this.think<=0){this.think=dist>24?.8:.18;this.target=dist<14?player:null;if(!this.target)this.wander=Math.random()*Math.PI*2;}
    if(this.target&&dist<14){const dx=player.position.x-this.position.x,dz=player.position.z-this.position.z;const len=Math.hypot(dx,dz)||1;this.velocity.x=dx/len*1.7;this.velocity.z=dz/len*1.7;this.yaw=Math.atan2(-dx,-dz);if(dist<1.35&&this.attack<=0){this.attack=1.1;player.health-=2;damageVignette.style.opacity='.8';setTimeout(()=>damageVignette.style.opacity='0',120);}}
    else{this.velocity.x=Math.sin(this.wander)*.5;this.velocity.z=Math.cos(this.wander)*.5;}
    this.position.x+=this.velocity.x*dt;this.position.z+=this.velocity.z*dt;
    const ground=world.highestSolidY(Math.floor(this.position.x),Math.floor(this.position.z));this.position.y=lerp(this.position.y,ground+1,.8);
    if(this.mesh){this.mesh.position.copy(this.position);this.mesh.rotation.y=this.yaw;const swing=Math.sin(this.age*7)*.35;this.legs[0].rotation.x=swing;this.legs[1].rotation.x=-swing;}
  }
}
class MobSystem {
  constructor(world,scene){this.world=world;this.scene=scene;this.mobs=[];this.lastSpawn=0;}
  spawnAround(player){if(this.mobs.length>=ENGINE.MAX_MOBS)return;const a=Math.random()*Math.PI*2,r=18+Math.random()*18;const x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(this.world.get(x,y,z)!==BLOCK.AIR)return;const type=Math.random()<.7?'zombie':'cow';const mob=new Mob(type,new THREE.Vector3(x+.5,y,z+.5));this.scene.add(mob.createMesh());this.mobs.push(mob);}
  update(dt,player){this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2;if(Math.random()<.45)this.spawnAround(player);}for(let i=this.mobs.length-1;i>=0;i--){const m=this.mobs[i];m.update(dt,this.world,player);if(m.position.distanceTo(player.position)>90){this.scene.remove(m.mesh);this.mobs.splice(i,1);}}}
}
class InputManager {
  constructor(){
    this.keys=new Set();this.lookId=null;this.lookX=0;this.lookY=0;this.lookLastX=0;this.lookLastY=0;this.lookSensitivity=.0026;
    this.moveId=null;this.move={x:0,y:0};this.jump=false;this.sneak=false;this.run=false;this.flyToggle=false;this.breakHold=new HoldActionState();
    this.bindKeyboard();this.bindLook();this.bindMove();this.bindActions();
  }
  bindKeyboard(){
    addEventListener('keydown',e=>{this.keys.add(e.code);if(e.code==='KeyF')this.flyToggle=true;if(e.code==='KeyE')game.toggleInventory();if(e.code==='KeyC')game.openCraftingTable();if(e.code==='Space')this.jump=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')this.sneak=true;if(e.code==='KeyR')this.run=true;});
    addEventListener('keyup',e=>{this.keys.delete(e.code);if(e.code==='Space')this.jump=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')this.sneak=false;if(e.code==='KeyR')this.run=false;});
    addEventListener('wheel',e=>{if(titleScreen.style.display!=='none')return;game.cycleHotbar(e.deltaY>0?1:-1);});
  }
  bindLook(){
    const start=(x,y,id)=>{if(game.ui?.screen)return;if(this.moveId===id)return;this.lookId=id;this.lookLastX=x;this.lookLastY=y;};
    const move=(x,y,id)=>{if(this.lookId!==id)return;const dx=x-this.lookLastX,dy=y-this.lookLastY;this.lookLastX=x;this.lookLastY=y;game.player.yaw-=dx*this.lookSensitivity;game.player.pitch=clamp(game.player.pitch-dy*this.lookSensitivity,-1.5,1.5);};
    const end=id=>{if(this.lookId===id)this.lookId=null;};
    const lookDown=e=>{e.preventDefault();e.stopPropagation();lookSurface.setPointerCapture?.(e.pointerId);start(e.clientX,e.clientY,e.pointerId);};
    const lookMove=e=>{e.preventDefault();e.stopPropagation();move(e.clientX,e.clientY,e.pointerId);};
    const lookEnd=e=>{e.preventDefault();e.stopPropagation();end(e.pointerId);};
    lookSurface.addEventListener('pointerdown',lookDown,{passive:false});
    lookSurface.addEventListener('pointermove',lookMove,{passive:false});
    lookSurface.addEventListener('pointerup',lookEnd,{passive:false});
    lookSurface.addEventListener('pointercancel',lookEnd,{passive:false});
    lookSurface.addEventListener('lostpointercapture',e=>end(e.pointerId));
    addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){game.player.yaw-=e.movementX*.0025;game.player.pitch=clamp(game.player.pitch-e.movementY*.0025,-1.5,1.5);}});
    canvas.addEventListener('click',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)canvas.requestPointerLock?.();});
  }
  bindMove(){
    const begin=e=>{e.preventDefault();if(game.ui?.screen)return;this.moveId=e.pointerId;movePad.setPointerCapture?.(e.pointerId);this.updateMove(e.clientX,e.clientY);};
    const move=e=>{e.preventDefault();if(this.moveId===e.pointerId)this.updateMove(e.clientX,e.clientY);};
    const end=e=>{if(this.moveId===e.pointerId){this.moveId=null;this.move.x=0;this.move.y=0;moveStick.style.transform='translate(0,0)';try{movePad.releasePointerCapture?.(e.pointerId)}catch(_){}}};
    movePad.addEventListener('pointerdown',begin,{passive:false});
    movePad.addEventListener('pointermove',move,{passive:false});
    movePad.addEventListener('pointerup',end,{passive:false});movePad.addEventListener('pointercancel',end,{passive:false});movePad.addEventListener('lostpointercapture',()=>{this.moveId=null;this.move.x=0;this.move.y=0;moveStick.style.transform='translate(0,0)'});
  }
  updateMove(x,y){const r=movePad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=x-cx,dy=y-cy;const max=Math.max(30,r.width*.36);const len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max;}this.move.x=dx/max;this.move.y=dy/max;moveStick.style.transform=`translate(${dx}px,${dy}px)`;}
  bindActions(){
    const press=(id,down,up)=>{const el=$(id);const onDown=e=>{e.preventDefault();e.stopPropagation();el.classList.add('pressed');try{el.setPointerCapture?.(e.pointerId)}catch(_){}down(e);};const onUp=e=>{e.preventDefault();e.stopPropagation();el.classList.remove('pressed');up?.(e);};el.addEventListener('pointerdown',onDown,{passive:false});el.addEventListener('pointerup',onUp,{passive:false});el.addEventListener('pointercancel',onUp,{passive:false});el.addEventListener('lostpointercapture',()=>{el.classList.remove('pressed');up?.({pointerId:-1})});};
    press('jumpBtn',()=>{this.jump=true;},()=>{this.jump=false;});
    press('breakBtn',e=>{this.breakHold.begin(e.pointerId);game.beginBreak();},e=>{this.breakHold.end(e.pointerId);game.endBreak();});
    press('useBtn',()=>game.useSelected());
    press('invBtn',()=>game.toggleInventory());
    press('craftBtn',()=>game.openCraftingTable());
  }
  updateHoldState(){this.breakHold?.update();}
  state(){
    const flyToggle=this.flyToggle;
    this.flyToggle=false;
    let forward=0,right=0;
    if(this.keys.has('KeyW')||this.keys.has('ArrowUp'))forward+=1;
    if(this.keys.has('KeyS')||this.keys.has('ArrowDown'))forward-=1;
    if(this.keys.has('KeyD')||this.keys.has('ArrowRight'))right+=1;
    if(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))right-=1;
    forward+=-this.move.y;right+=this.move.x;
    return {forward:clamp(forward,-1,1),right:clamp(right,-1,1),jump:this.jump||this.keys.has('Space'),sneak:this.sneak,run:this.run||this.keys.has('ShiftLeft'),flyToggle};
  }
}
document.addEventListener('contextmenu',e=>e.preventDefault(),{passive:false});
document.addEventListener('selectstart',e=>e.preventDefault(),{passive:false});
document.addEventListener('dragstart',e=>e.preventDefault(),{passive:false});
class UI {
  constructor(game){this.game=game;this.screen=null;this.drag={index:-1,stack:null};}
  close(){screenLayer.classList.remove('open');screenLayer.innerHTML='';this.screen=null;}
  openInventory(){this.screen='inventory';screenLayer.classList.add('open');this.renderInventory();}
  openCraftingTable(){this.screen='table';screenLayer.classList.add('open');this.renderCrafting(true);}
  openCreative(){this.screen='creative';screenLayer.classList.add('open');this.renderCreative();}
  renderInventory(){
    const inv=this.game.inventory;screenLayer.innerHTML=`<div class="mc-window"><h2 class="mc-title">Inventory</h2><div class="inventory-layout"><div><div class="mc-title" style="font-size:13px">Crafting</div><div id="playerCraft" class="craft-grid">${Array.from({length:4},(_,i)=>this.slotHtml(`p${i}`,this.game.crafting.grid[i])).join('')}</div><div class="mc-row"><button class="mc-btn small" id="takeCraft">Craft Result</button><div id="craftResult"></div></div><h3>Inventory</h3><div class="inventory-grid">${inv.slots.map((s,i)=>this.slotHtml(`i${i}`,s,i)).join('')}</div></div><div><h3>Quick crafting</h3><input class="search" id="recipeSearch" placeholder="Search recipes"><div id="recipeList"></div><button class="mc-btn" id="closeInventory">Done</button></div></div></div>`;
    $('closeInventory').onclick=()=>this.close();$('takeCraft').onclick=()=>{if(this.game.crafting.takeOutput()){this.game.saveSoon();this.renderInventory();this.game.refreshHotbar();}};
    this.renderRecipes();this.bindSlots();
  }
  renderCrafting(table){
    screenLayer.innerHTML=`<div class="mc-window"><h2 class="mc-title">Crafting Table</h2><div class="mc-row"><div><div class="craft-grid" id="tableGrid">${Array.from({length:9},(_,i)=>this.slotHtml(`t${i}`,this.game.crafting.grid[i])).join('')}</div></div><div class="craft-arrow">→</div><div id="tableOutput">${this.slotHtml('o',this.game.crafting.update()||this.game.crafting.output)}</div></div><hr><div id="tableRecipes" class="recipe-scroll"></div><button class="mc-btn" id="closeTable">Close</button></div>`;
    $('closeTable').onclick=()=>this.close();this.renderTableRecipes();this.bindSlots();
  }
  renderCreative(){
    screenLayer.innerHTML=`<div class="mc-window"><h2 class="mc-title">Creative Inventory</h2><input class="search" id="creativeSearch" placeholder="Search items"><div class="creative-list" id="creativeList"></div><div class="mc-row"><button class="mc-btn" id="closeCreative">Done</button></div></div>`;
    const render=()=>{const q=$('creativeSearch')?.value||'';const list=$('creativeList');list.innerHTML='';for(const item of creativeCatalog.search(q)){const s=new ItemStack(item.id,64);const b=document.createElement('div');b.className='inv-slot';b.title=item.name;b.innerHTML=this.slotHtml('',s);b.onclick=()=>{this.game.inventory.add(item.id,64);this.game.refreshHotbar();};list.appendChild(b);}};
    $('creativeSearch').oninput=render;$('closeCreative').onclick=()=>this.close();render();
  }
  slotHtml(prefix,s,i=-1){
    const name=ITEM_NAME.get(s?.id)||'';const icon=this.game.iconFor(s?.id);return `<div class="inv-slot" data-slot="${prefix}" title="${name}">${icon?`<img class="item-icon" src="${icon}">`:''}${s?.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`;
  }
  bindSlots(){screenLayer.querySelectorAll('.inv-slot').forEach(el=>{el.addEventListener('pointerdown',e=>{const slot=el.dataset.slot;if(slot==='o'){if(this.game.crafting.takeOutput()){this.game.refreshHotbar();this.screen==='table'?this.renderCrafting(true):this.renderInventory();}return;}this.clickSlot(slot);});});}
  clickSlot(slot){
    const type=slot[0],index=Number(slot.slice(1));let stack;
    if(type==='i')stack=this.game.inventory.slots[index];else if(type==='p'||type==='t')stack=this.game.crafting.grid[index];else return;
    const cursor=this.game.inventory.cursor;
    if(cursor.empty()&&!stack.empty()){this.game.inventory.cursor=stack.clone();stack.id=0;stack.count=0;}
    else if(!cursor.empty()&&stack.empty()){stack.id=cursor.id;stack.count=cursor.count;cursor.id=0;cursor.count=0;}
    else if(!cursor.empty()&&stack.id===cursor.id){const n=Math.min(64-stack.count,cursor.count);stack.count+=n;cursor.count-=n;cursor.normalize();}
    else{const temp=stack.clone();stack.id=cursor.id;stack.count=cursor.count;cursor.id=temp.id;cursor.count=temp.count;}
    this.game.crafting.update();this.screen==='table'?this.renderCrafting(true):this.renderInventory();
  }
  renderRecipes(){const el=$('recipeList');if(!el)return;const q=($('recipeSearch')?.value||'').toLowerCase();el.innerHTML=RECIPES.filter(r=>r.name.toLowerCase().includes(q)).map(r=>`<div style="padding:5px;background:#aaa;margin:2px;display:flex;justify-content:space-between"><span>${r.name}</span><b>${r.out.count}×</b></div>`).join('');$('recipeSearch')?.addEventListener('input',()=>this.renderRecipes());}
  renderTableRecipes(){const el=$('tableRecipes');if(!el)return;el.innerHTML=`<h3>Recipes</h3>`+RECIPES.map((r,i)=>`<button class="mc-btn small" data-recipe="${i}">${r.name}</button>`).join('');el.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{const r=RECIPES[Number(b.dataset.recipe)];this.game.crafting.grid.forEach(s=>{s.id=0;s.count=0});let n=0;for(const row of r.shape)for(const id of row){if(id){this.game.crafting.grid[n].id=id;this.game.crafting.grid[n].count=1;}n++;}this.game.crafting.update();this.renderCrafting(true);});}
}
class SaveStore {
  constructor(){this.db=null;this.pending=null;}
  async init(){
    if(!('indexedDB' in window))return;
    this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('FreshMinecraftDB',1);r.onupgradeneeded=()=>{r.result.createObjectStore('worlds')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  }
  async save(key,data){if(!this.db)return;return new Promise((resolve,reject)=>{const tx=this.db.transaction('worlds','readwrite');tx.objectStore('worlds').put(data,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
  async load(key){if(!this.db)return null;return new Promise((resolve,reject)=>{const tx=this.db.transaction('worlds','readonly');const r=tx.objectStore('worlds').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
}
const voxelDiagState={lines:[],worldReport:null,lastInspection:null,errors:[],warnings:[]};
function escHtml(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function vecText(v){if(!v)return 'n/a';return `[${Number(v.x??v[0]??0).toFixed(3)}, ${Number(v.y??v[1]??0).toFixed(3)}, ${Number(v.z??v[2]??0).toFixed(3)}]`;}
window.__voxelDiag={
  log(text,type='info'){
    if(!DEBUG_VOXEL_ENGINE&&type!=='err'&&type!=='warn')return;
    voxelDiagState.lines.push({text:String(text),type,time:new Date().toISOString()});
    if(type==='err')voxelDiagState.errors.push(String(text));
    if(type==='warn')voxelDiagState.warnings.push(String(text));
    if(voxelDiagState.lines.length>900)voxelDiagState.lines.shift();
    const panel=document.getElementById('voxelDiag');
    if(panel?.classList.contains('open'))this.render();
  },
  setWorldReport(report){
    voxelDiagState.worldReport=report;
    const panel=document.getElementById('voxelDiag');
    if(DEBUG_VOXEL_ENGINE&&panel?.classList.contains('open'))this.render();
  },
  clear(){voxelDiagState.lines=[];voxelDiagState.errors=[];voxelDiagState.warnings=[];this.render();},
  inspect(){
    const g=window.game;if(!g?.player||!g?.world||!g?.renderer)return null;
    const hit=g.getTarget();g.renderer.showSelection(hit);
    if(!hit){voxelDiagState.lastInspection={hit:null};this.log('INSPECT: no block under crosshair','warn');return null;}
    const origin=g.player.eyePosition(),dir=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(g.player.pitch,g.player.yaw,0,'YXZ')).normalize();
    const face=faceKeyFromNormal(hit.face),ft=faceTemplate(face);
    const cp=g.world.worldToChunk(hit.x,hit.z);
    const faces={};
    for(const f of VOXEL_FACES){
      const decision=voxelFaceVisibility(g.world,hit.x,hit.y,hit.z,hit.id,f);
      const tex=g.renderer.mesher.textureName(hit.id,f.key);
      const ti=g.resolver?.getInfo(tex)||null;
      const verts=voxelFaceVertices(hit.x,hit.y,hit.z,f);
      const actual=cross3(sub3(verts[1],verts[0]),sub3(verts[2],verts[0]));
      const winding=dot3(actual,f.n);
      faces[f.key]={name:f.name,visible:decision.visible,reason:decision.reason,normal:f.n,neighbor:decision.neighbor,
        neighborName:BLOCK_NAME[decision.neighbor]||'air',neighborLoaded:decision.state.loaded,neighborChunk:decision.state.cx===null?null:[decision.state.cx,decision.state.cz],
        texture:tex,textureInfo:ti,uv:f.uv,uvLabel:f.uvLabel,vertices:verts,winding,material:g.renderer.mesher.materialKind(hit.id)};
    }
    voxelDiagState.lastInspection={
      hit:{...hit,faceKey:face,faceName:ft?.name||face},
      ray:{origin:origin.clone(),direction:dir.clone(),distance:hit.distance},
      block:{id:hit.id,name:BLOCK_NAME[hit.id]||String(hit.id),world:[hit.x,hit.y,hit.z],chunk:[cp.cx,cp.cz],local:[cp.lx,hit.y,cp.lz]},
      faces
    };
    this.log(`INSPECT ${BLOCK_NAME[hit.id]||hit.id} @ ${hit.x},${hit.y},${hit.z} | hit ${ft?.name||face}`,'ok');
    this.render();return voxelDiagState.lastInspection;
  },
  textureReport(){
    const g=window.game;if(!g?.resolver)return [];
    const out=[];for(const [name,info] of g.resolver.textureInfo)out.push({name,...info});
    return out;
  },
  exportData(){
    const g=window.game,rr=g?.renderer;
    return {
      timestamp:new Date().toISOString(),engine:ENGINE.VERSION,three:ENGINE.THREE_VERSION,debug:DEBUG_VOXEL_ENGINE,
      renderer:rr?{backend:rr.backendLabel(),requested:rr.backendRequested,secureContext:window.isSecureContext===true,navigatorGPU:!!navigator.gpu,initError:rr.backendInitError||'',adapter:rr.backendDetails?.adapter||null,pixelRatio:rr.renderer.getPixelRatio(),canvas:[rr.renderer.domElement.width,rr.renderer.domElement.height],drawCalls:rr.stats.drawCalls,triangles:rr.stats.triangles}:null,
      seed:g?.seed,player:g?.player?{position:g.player.position.toArray(),yaw:g.player.yaw,pitch:g.player.pitch}:null,
      camera:rr?{position:rr.camera.position.toArray(),direction:rr.camera.getWorldDirection(new THREE.Vector3()).toArray()}:null,
      world:g?.world?.generator?.stats||null,faces:voxelDiagState.worldReport,inspection:voxelDiagState.lastInspection,
      lod:rr?.lod||null,textures:this.textureReport(),warnings:voxelDiagState.warnings,errors:voxelDiagState.errors,
      validation:{winding:VOXEL_FACE_VALIDATION,uv:VOXEL_UV_VALIDATION}
    };
  },
  render(){
    const el=document.getElementById('voxelDiagText');if(!el)return;
    const r=voxelDiagState.worldReport,lines=[],add=(t,c='info')=>lines.push(`<div class="vox${c[0].toUpperCase()+c.slice(1)}">${escHtml(t)}</div>`);
    add(`DEBUG_VOXEL_ENGINE = ${DEBUG_VOXEL_ENGINE}`,'face');
    add('──── ENGINE STATUS ────','face');
    if(window.game?.renderer){
      const rr=window.game.renderer;let gpu='unavailable';
      if(rr.renderer?.isWebGLRenderer&&typeof rr.renderer.getContext==='function'){try{const gl=rr.renderer.getContext(),dbg=gl.getExtension('WEBGL_debug_renderer_info');gpu=dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):'WebGL adapter hidden';}catch{}}
      else if(rr.backendDetails?.adapter){gpu=rr.backendDetails.adapter.description||rr.backendDetails.adapter.device||rr.backendDetails.adapter.architecture||rr.backendDetails.adapter.vendor||'WebGPU adapter';}
      add(`Three.js ${ENGINE.THREE_VERSION} | ${rr.backendLabel()} | GPU ${gpu}`);
      add(`WebGPU capability: secure=${window.isSecureContext===true?'YES':'NO'} navigator.gpu=${navigator.gpu?'YES':'NO'} | requested ${rr.backendRequested}`);
      add(`Pixel ratio ${rr.renderer.getPixelRatio()} | Canvas ${rr.renderer.domElement.width}×${rr.renderer.domElement.height} | Viewport ${innerWidth}×${innerHeight}`);
      add(`FPS ${window.game.stats?.fps?.toFixed?.(1)||0} | Draw calls ${rr.stats.drawCalls} | Triangles ${rr.stats.triangles}`);
      add(`Chunks loaded ${window.game.world?.chunks?.size||0} | meshed ${rr.chunkMeshes.size} | pending load ${window.game.world?.loadQueue?.length||0} | pending rebuild ${window.game.world?.dirtyChunks?.size||0}`);
      add(`Emitted faces ${rr.stats.faces} | Culled faces ${rr.stats.culledFaces}`);
      add(`Atlas ${rr.atlas.canvas?.width||0}×${rr.atlas.canvas?.height||0} | ${rr.atlas.columns}×${rr.atlas.rows} cells | tile ${rr.atlas.tileSize}px | source max ${rr.atlas.maxSourceResolution}px`);
      add(`LOD active ${rr.lod.current}% | ceiling ${rr.lod.qualityCeiling}% | anisotropy ${rr.atlas.texture?.anisotropy||1} | pending ${rr.lod.pending??'none'}`);
    }
    if(window.game?.world?.generator?.stats){
      const g=window.game.world.generator.stats,p=window.game.player?.position,cp=p?window.game.world.worldToChunk(Math.floor(p.x),Math.floor(p.z)):null;
      add('──── WORLD STATUS ────','face');add(`Seed ${window.game.seed} | Chunk size ${ENGINE.CHUNK_SIZE} | Height ${ENGINE.WORLD_HEIGHT} | Sea ${ENGINE.SEA_LEVEL}`);
      if(p)add(`Player ${vecText(p)} | Current chunk ${cp.cx},${cp.cz} local ${cp.lx},${Math.floor(p.y)},${cp.lz}`);
      if(window.game.renderer)add(`Camera ${vecText(window.game.renderer.camera.position)} | Direction ${vecText(window.game.renderer.camera.getWorldDirection(new THREE.Vector3()))}`);
      add(`Generated chunks ${g.chunks} | Logical voxel writes ${g.blocks} | Air ${g.air} | Stone ${g.stone} | Soil ${g.soil} | Water ${g.water}`);
      add(`Caves carved ${g.caves||0} | Ores ${g.ores} | Trees ${g.trees} | Trunks ${g.trunks} | Leaves ${g.leaves} | Vegetation ${g.vegetation}`);
      add(`Terrain range ${Number.isFinite(g.lowest)?g.lowest:'n/a'}..${Number.isFinite(g.highest)?g.highest:'n/a'}`);
    }
    if(r){add('──── GENERATED FACE REPORT ────','face');for(const f of ['east','west','up','down','south','north'])add(`${f.toUpperCase()}: ${r.faceStats[f]} faces`);add(`TOTAL ${r.faces} | CULLED ${r.culledFaces}`,'ok');}
    add('──── FACE TEMPLATE VALIDATION ────','face');
    VOXEL_FACE_VALIDATION.forEach(x=>add(`${x.valid?'PASS':'FAIL'} ${x.name} | dot=${x.alignment.toFixed(3)} | ${x.valid?'OUTWARD':'BROKEN'}`,x.valid?'ok':'err'));
    add('──── UV ORIENTATION ────','face');
    VOXEL_UV_VALIDATION.forEach(x=>add(`${x.valid?'PASS':'FAIL'} ${x.name} | ${x.actual} | ${JSON.stringify(x.uv)}`,x.valid?'ok':'err'));
    const ins=voxelDiagState.lastInspection;
    if(ins?.hit){
      add('──── SELECTED BLOCK / RAY ────','face');
      add(`BLOCK ${ins.block.name} (${ins.block.id}) | world ${ins.block.world.join(',')} | chunk ${ins.block.chunk.join(',')} | local ${ins.block.local.join(',')}`);
      add(`Ray origin ${vecText(ins.ray.origin)} | dir ${vecText(ins.ray.direction)} | distance ${Number(ins.ray.distance).toFixed(3)}`);
      add(`Hit face ${ins.hit.faceName} | normal [${ins.hit.face.join(',')}] | place ${ins.hit.place.x},${ins.hit.place.y},${ins.hit.place.z}`);
      add('──── FACE-BY-FACE INSPECTION ────','face');
      for(const f of VOXEL_FACES){
        const q=ins.faces[f.key],ti=q.textureInfo;
        add(`${q.name} | Visible ${q.visible?'YES':'NO'} | Neighbor ${q.neighborName} | loaded ${q.neighborLoaded?'YES':'NO'} | ${q.reason}` , q.visible?'ok':'warn');
        add(`  Normal [${q.normal.join(',')}] | Texture ${q.texture} | ${ti?.source||'unresolved'} | ${q.uvLabel} | Winding dot ${q.winding.toFixed(3)} | Material ${q.material}`);
        add(`  UV ${q.uv.map(v=>`(${v.join(',')})`).join(' ')} | Vertices ${q.vertices.map(v=>`[${v.map(n=>n.toFixed(2)).join(',')}]`).join(' ')}`);
      }
    }
    add('──── RUNTIME LOG ────','face');voxelDiagState.lines.slice(-180).forEach(x=>add(x.text,x.type));
    const panel=document.getElementById('voxelDiag');
    const nearBottom=(panel ? (panel.scrollHeight-panel.scrollTop-panel.clientHeight<34) : false);
    el.innerHTML=lines.join('');
    if(panel&&nearBottom)panel.scrollTop=panel.scrollHeight;
  },
  command(raw){
    const cmd=String(raw||'').trim().toLowerCase(),g=window.game;
    if(!cmd)return;
    const commands='help inspect inspectblock inspectface faces chunks textures materials uv winding raycast lod world entities memory fps renderer reloadtexture rebuildchunk rebuildall validatefaces validateuv validateworld clear debug';
    if(cmd==='help'){this.log(`COMMANDS: ${commands}`,'info');return;}
    if(cmd==='inspect'||cmd==='inspectblock'||cmd==='inspectface'||cmd==='raycast'){this.inspect();return;}
    if(cmd==='clear'){this.clear();return;}
    if(cmd==='faces'){this.log(JSON.stringify(voxelDiagState.worldReport?.faceStats||{},null,2),'info');return;}
    if(cmd==='chunks'){this.log(`chunks loaded=${g?.world?.chunks?.size||0} meshed=${g?.renderer?.chunkMeshes?.size||0} pendingLoad=${g?.world?.loadQueue?.length||0} pendingRebuild=${g?.world?.dirtyChunks?.size||0}`,'info');return;}
    if(cmd==='textures'){for(const t of this.textureReport())this.log(`${t.name} | ${t.width}x${t.height} | ${t.source} | ${t.url}`,'url');return;}
    if(cmd==='materials'){this.log(`opaque=${g?.renderer?.materialOpaque?.type} cutout alphaTest=${g?.renderer?.materialCutout?.alphaTest} glass=${g?.renderer?.materialGlass?.transparent} water=${g?.renderer?.materialWater?.transparent}`,'info');return;}
    if(cmd==='uv'||cmd==='validateuv'){VOXEL_UV_VALIDATION.forEach(x=>this.log(`${x.valid?'PASS':'FAIL'} ${x.name} ${x.actual} ${JSON.stringify(x.uv)}`,x.valid?'ok':'err'));return;}
    if(cmd==='winding'||cmd==='validatefaces'){VOXEL_FACE_VALIDATION.forEach(x=>this.log(`${x.valid?'PASS':'FAIL'} ${x.name} dot=${x.alignment}`,x.valid?'ok':'err'));return;}
    if(cmd==='lod'){this.log(JSON.stringify(g?.renderer?.lod||{},null,2),'info');return;}
    if(cmd==='world'||cmd==='validateworld'){this.log(JSON.stringify(g?.world?.generator?.stats||{},null,2),'info');return;}
    if(cmd==='entities'){this.log(`mobs=${g?.mobs?.mobs?.length||0} drops=${g?.drops?.items?.length||0} particles=${g?.particles?.items?.length||0}`,'info');return;}
    if(cmd==='memory'){this.log(performance.memory?JSON.stringify({used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,limit:performance.memory.jsHeapSizeLimit}):'performance.memory unavailable','info');return;}
    if(cmd==='fps'){this.log(`FPS ${g?.stats?.fps?.toFixed?.(1)||0}`,'info');return;}
    if(cmd==='renderer'){this.render();return;}
    if(cmd==='rebuildchunk'){const p=g?.player?.position;if(p){const c=g.world.worldToChunk(Math.floor(p.x),Math.floor(p.z));g.world.dirtyChunks.add(chunkKey(c.cx,c.cz));this.log(`queued rebuild chunk ${c.cx},${c.cz}`,'ok');}return;}
    if(cmd==='rebuildall'){g?.world?.markAllForRebuild();this.log('queued rebuild of all loaded chunks','warn');return;}
    if(cmd==='reloadtexture'){this.log('reloadTexture requires an asset name in code; cache remains authoritative during gameplay.','warn');return;}
    if(cmd==='debug'){DEBUG_VOXEL_ENGINE=!DEBUG_VOXEL_ENGINE;window.DEBUG_VOXEL_ENGINE=DEBUG_VOXEL_ENGINE;this.log(`DEBUG_VOXEL_ENGINE=${DEBUG_VOXEL_ENGINE}`,'ok');this.render();return;}
    this.log(`Unknown command: ${cmd}. Type help.`,'warn');
  }
};
document.getElementById('voxelDiagToggle').onclick=()=>{document.getElementById('voxelDiag').classList.toggle('open');window.__voxelDiag.render();};
document.getElementById('voxelDiagToggle').oncontextmenu=e=>{e.preventDefault();document.getElementById('voxelOptions').classList.toggle('open');};
document.getElementById('voxelCopy').onclick=async()=>{const t=document.getElementById('voxelDiagText').innerText;try{await navigator.clipboard.writeText(t);window.__voxelDiag.log('RESULTS COPIED','ok');}catch{window.prompt('Copy diagnostic results:',t);}};
document.getElementById('voxelClear').onclick=()=>window.__voxelDiag.clear();
document.getElementById('voxelValidate').onclick=()=>{window.__voxelDiag.command('validateFaces');window.__voxelDiag.command('validateUV');};
document.getElementById('voxelInspect').onclick=()=>window.__voxelDiag.inspect();
document.getElementById('voxelTextures').onclick=()=>window.__voxelDiag.command('textures');
document.getElementById('voxelWorld').onclick=()=>window.__voxelDiag.command('world');
document.getElementById('voxelExport').onclick=()=>{const data=JSON.stringify(window.__voxelDiag.exportData(),null,2),blob=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`voxel-diagnostics-${Date.now()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
document.getElementById('voxelRunCommand').onclick=()=>{const el=document.getElementById('voxelCommand');window.__voxelDiag.command(el.value);el.value='';};
document.getElementById('voxelCommand').addEventListener('keydown',e=>{if(e.key==='Enter'){e.stopPropagation();document.getElementById('voxelRunCommand').click();}});
{
  const diag=document.getElementById('voxelDiag');
  for(const type of ['pointerdown','pointermove','pointerup','wheel','touchstart','touchmove','touchend']){
    diag.addEventListener(type,e=>e.stopPropagation(),{passive:type!=='wheel'});
  }
}
document.getElementById('voxelOptionsBtn').onclick=()=>document.getElementById('voxelOptions').classList.toggle('open');
document.getElementById('voxelQuality').oninput=e=>{document.getElementById('voxelQualityValue').textContent=e.target.value+'%';if(window.game?.renderer){window.game.renderer.lod.qualityCeiling=Number(e.target.value);window.game.renderer.lod.pending=null;}};
document.getElementById('voxelLodNear').oninput=e=>{document.getElementById('voxelLodNearValue').textContent=e.target.value;if(window.game?.renderer)window.game.renderer.lod.near=Number(e.target.value);};
document.getElementById('voxelLodFar').oninput=e=>{document.getElementById('voxelLodFarValue').textContent=e.target.value;if(window.game?.renderer)window.game.renderer.lod.far=Math.max(Number(e.target.value),window.game.renderer.lod.near+1);};
class Game {
  constructor(){
    window.game=this;
    this.mode='survival';this.seed=Math.floor(Math.random()*2147483647);this.world=null;this.player=null;this.inventory=new Inventory();this.crafting=new Crafting(this.inventory);this.assets=new AssetCache();this.mojangJson=null;this.resolver=null;this.atlas=null;this.renderer=null;this.raycast=null;this.input=null;this.ui=new UI(this);this.drops=null;this.particles=null;this.mobs=null;this.running=false;this.last=now();this.accum=0;this.saveStore=new SaveStore();this.lastSave=0;this.stats={fps:0,frames:0,frameTimer:0};this.icons=new Map();
  }
  async boot(mode='survival',fresh=false){
    this.mode=mode;
    this.setLoading(true,0,'Preparing fresh Three.js engine…');
    await this.assets.init();this.mojangJson=new MojangJsonCatalog(this.assets);await this.mojangJson.warm();await this.saveStore.init();
    if(!fresh){const saved=await this.saveStore.load('world');if(saved){this.seed=saved.seed||this.seed;this.mode=saved.mode||mode;}}
    this.world=new World(this.seed,this.mode);
    this.setLoading(true,10,'Loading Mojang sample texture definitions…');
    this.resolver=new AssetResolver(this.assets);
    const names=this.textureList();
    await this.resolver.warm(names,(i,n,name)=>this.setLoading(true,10+(i/n)*35,`Caching ${name} (${i}/${n})`));
    this.setLoading(true,50,'Building texture atlas…');
    this.atlas=new TextureAtlas(this.resolver);await this.atlas.build(names);
    this.setLoading(true,63,'Creating Three.js renderer…');
    this.renderer=new VoxelRenderer(this.world,this.atlas);
    const backendChoice=localStorage.getItem('mcRendererBackendV10')||'webgl';
    this.setLoading(true,66,`Initializing ${backendChoice.toUpperCase()} backend…`);
    await this.renderer.initBackend(backendChoice);
    this.runVoxelValidationSuite();
    this.input=new InputManager();this.player=new Player(this.world,this.mode);this.raycast=new VoxelRaycaster(this.world);
    this.renderer.player=this.player;
    this.drops=new DropSystem(this.world,this.renderer.scene);this.particles=new ParticleSystem(this.renderer.scene);this.mobs=new MobSystem(this.world,this.renderer.scene);
    this.seedInventory();
    const saved=await this.saveStore.load('world');if(saved&&!fresh){
      this.loadSave(saved);
      const cp=this.world.worldToChunk(Math.floor(this.player.position.x),Math.floor(this.player.position.z));
      this.world.ensureChunk(cp.cx,cp.cz);
      if(this.player.position.y<2 || this.player.collidesAt(this.player.position)){
        this.player.position=this.world.findSpawn();
        this.player.velocity.set(0,0,0);
      }
    } else if(fresh){
      this.player.position=this.world.findSpawn();
    }
    {
      const cp=this.world.worldToChunk(Math.floor(this.player.position.x),Math.floor(this.player.position.z));
      let done=0;
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        const c=this.world.ensureChunk(cp.cx+dx,cp.cz+dz);
        if(!this.renderer.chunkMeshes.has(chunkKey(c.cx,c.cz)))this.renderer.attachChunk(c);
        done++;
        this.setLoading(true,80+(done/9)*10,`Meshing spawn area (${done}/9)`);
        await sleep(0);
      }
    }
    this.world.queueAround(this.player.position.x,this.player.position.z);
    this.setLoading(true,90,'Starting voxel simulation…');await sleep(80);
    this.refreshHotbar();this.player.updateCamera(this.renderer.camera);this.setLoading(false,100,'Ready');titleScreen.style.display='none';this.running=true;this.last=now();requestAnimationFrame(t=>this.loop(t));
  }
  textureList(){return ['grass_top','grass_side','dirt','stone','sand','gravel','oak_log','oak_log_top','oak_leaves','oak_leaves_opaque','oak_planks','cobblestone','glass','coal_ore','iron_ore','diamond_ore','bedrock','water','torch','crafting_table_top','crafting_table_side','bricks','obsidian','snow','tall_grass','flower','glowstone','furnace_side','chest','tnt_top','tnt_bottom','tnt_side','missing'];}
  runVoxelValidationSuite(){
    const tests=[];
    const push=(name,pass,detail='')=>{tests.push({name,pass,detail});window.__voxelDiag?.log?.(`${pass?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`,pass?'ok':'err');};
    for(const r of VOXEL_FACE_VALIDATION)push(`winding ${r.name}`,r.valid,`dot=${r.alignment.toFixed(3)}`);
    for(const r of VOXEL_UV_VALIDATION)push(`UV ${r.name}`,r.valid,r.actual);
    {
      const sample='grass_side',bottom=this.atlas.uv(sample,0.5,0),top=this.atlas.uv(sample,0.5,1);
      push('atlas V maps world top upward',top[1]>bottom[1],`bottomV=${bottom[1].toFixed(4)} topV=${top[1].toFixed(4)}`);
    }
    const expectTex=(id,face,name)=>push(`texture ${BLOCK_NAME[id]} ${face}`,this.renderer.mesher.textureName(id,face)===name,`${this.renderer.mesher.textureName(id,face)} expected ${name}`);
    expectTex(BLOCK.GRASS,'up','grass_top');expectTex(BLOCK.GRASS,'down','dirt');for(const f of ['east','west','south','north'])expectTex(BLOCK.GRASS,f,'grass_side');
    expectTex(BLOCK.OAK_LOG,'up','oak_log_top');expectTex(BLOCK.OAK_LOG,'down','oak_log_top');for(const f of ['east','west','south','north'])expectTex(BLOCK.OAK_LOG,f,'oak_log');
    expectTex(BLOCK.TNT,'up','tnt_top');expectTex(BLOCK.TNT,'down','tnt_bottom');expectTex(BLOCK.TNT,'east','tnt_side');
    const mock={getLoadedState(){return {loaded:true,id:BLOCK.AIR,cx:0,cz:0,lx:0,lz:0};}};
    push('solid + air visible',voxelFaceVisibility(mock,0,1,0,BLOCK.STONE,'up').visible);
    const mockSolid={getLoadedState(){return {loaded:true,id:BLOCK.STONE,cx:0,cz:0,lx:0,lz:0};}};
    push('solid + solid culled',!voxelFaceVisibility(mockSolid,0,1,0,BLOCK.DIRT,'up').visible);
    const mockLeaves={getLoadedState(){return {loaded:true,id:BLOCK.OAK_LEAVES,cx:0,cz:0,lx:0,lz:0};}};
    push('log + leaves preserved',voxelFaceVisibility(mockLeaves,0,1,0,BLOCK.OAK_LOG,'up').visible);
    push('leaves + leaves culled',!voxelFaceVisibility(mockLeaves,0,1,0,BLOCK.OAK_LEAVES,'up').visible);
    const mockUnloaded={getLoadedState(){return {loaded:false,id:BLOCK.AIR,cx:1,cz:0,lx:0,lz:0};}};
    push('unloaded neighbor not treated solid',voxelFaceVisibility(mockUnloaded,0,1,0,BLOCK.STONE,'east').visible);
    this.voxelValidation=tests;return tests;
  }
  iconFor(id){if(!id||id===ITEM.AIR)return '';if(this.icons.has(id))return this.icons.get(id);const name=(BLOCK_NAME[id]||ITEM_NAME.get(id)||'missing').toLowerCase().replace(/ /g,'_');const candidates=[`${MC_TEX}items/${name}.png`,`${MC_TEX}item/${name}.png`,`${MC_TEX}blocks/${name}.png`];this.icons.set(id,candidates[0]);return candidates[0];}
  seedInventory(){
    if(this.mode==='creative'){const ids=[ITEM.GRASS,ITEM.DIRT,ITEM.STONE,ITEM.SAND,ITEM.GRAVEL,ITEM.OAK_LOG,ITEM.OAK_PLANKS,ITEM.COBBLESTONE,ITEM.GLASS,ITEM.CRAFTING_TABLE,ITEM.TORCH,ITEM.COAL,ITEM.IRON_INGOT,ITEM.DIAMOND,ITEM.WOOD_PICKAXE,ITEM.STONE_PICKAXE,ITEM.IRON_PICKAXE,ITEM.DIAMOND_PICKAXE,ITEM.WOOD_SWORD,ITEM.STONE_SWORD,ITEM.IRON_SWORD,ITEM.DIAMOND_SWORD];ids.forEach((id,i)=>this.inventory.slots[i]=new ItemStack(id,64));}
    else {const start=[new ItemStack(ITEM.OAK_LOG,8),new ItemStack(ITEM.STICK,8),new ItemStack(ITEM.WOOD_PICKAXE,1),new ItemStack(ITEM.BREAD,4),new ItemStack(ITEM.CRAFTING_TABLE,1)];start.forEach((s,i)=>this.inventory.slots[i]=s);}
  }
  setLoading(show,pct,text){loading.classList.toggle('show',show);loadingFill.style.width=`${clamp(pct,0,100)}%`;loadingText.textContent=text;}
  toggleInventory(){if(this.ui.screen){this.ui.close();return;}if(this.mode==='creative')this.ui.openCreative();else this.ui.openInventory();}
  openCraftingTable(){this.ui.openCraftingTable();}
  cycleHotbar(dir){this.inventory.selected=mod(this.inventory.selected+dir,9);this.refreshHotbar();}
  refreshHotbar(){hotbarEl.innerHTML='';for(let i=0;i<9;i++){const s=this.inventory.slots[i];const el=document.createElement('div');el.className='hot-slot'+(i===this.inventory.selected?' selected':'');el.innerHTML=this.ui.slotHtml('',s);el.onclick=()=>{this.inventory.selected=i;this.refreshHotbar();};hotbarEl.appendChild(el);}}
  selectedStack(){return this.inventory.slots[this.inventory.selected];}
  beginBreak(){this.breaking=true;}
  endBreak(){this.breaking=false;this.player.breakProgress=0;this.player.breaking=null;}
  useSelected(){
    const hit=this.getTarget();if(!hit)return;
    const selected=this.selectedStack();
    if(hit.id===BLOCK.CRAFTING_TABLE){this.openCraftingTable();return;}
    if(selected.empty())return;
    const block=this.itemToBlock(selected.id);if(block===BLOCK.AIR)return;
    const p=hit.place;if(this.player.collidesAt(new THREE.Vector3(p.x+.5,this.player.position.y,p.z+.5)))return;
    if(this.mode!=='creative'&&!this.inventory.consume(selected.id,1))return;
    this.world.set(p.x,p.y,p.z,block);this.refreshHotbar();
  }
  itemToBlock(id){const map=new Map([[ITEM.GRASS,BLOCK.GRASS],[ITEM.DIRT,BLOCK.DIRT],[ITEM.STONE,BLOCK.STONE],[ITEM.SAND,BLOCK.SAND],[ITEM.GRAVEL,BLOCK.GRAVEL],[ITEM.OAK_LOG,BLOCK.OAK_LOG],[ITEM.OAK_LEAVES,BLOCK.OAK_LEAVES],[ITEM.OAK_PLANKS,BLOCK.OAK_PLANKS],[ITEM.COBBLESTONE,BLOCK.COBBLESTONE],[ITEM.GLASS,BLOCK.GLASS],[ITEM.CRAFTING_TABLE,BLOCK.CRAFTING_TABLE],[ITEM.TORCH,BLOCK.TORCH],[ITEM.BRICKS,BLOCK.BRICKS],[ITEM.OBSIDIAN,BLOCK.OBSIDIAN],[ITEM.SNOW,BLOCK.SNOW],[ITEM.GLOWSTONE,BLOCK.GLOWSTONE],[ITEM.FURNACE,BLOCK.FURNACE],[ITEM.CHEST,BLOCK.CHEST],[ITEM.TNT,BLOCK.TNT]]);return map.get(id)||BLOCK.AIR;}
  getTarget(){const origin=this.player.eyePosition();const dir=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.player.pitch,this.player.yaw,0,'YXZ'));return this.raycast.cast(origin,dir);}
  mine(dt){if(!this.breaking)return;const hit=this.getTarget();if(!hit){this.player.breaking=null;this.player.breakProgress=0;return;}if(this.player.breaking&&blockKey(hit.x,hit.y,hit.z)!==this.player.breaking){this.player.breakProgress=0;}this.player.breaking=blockKey(hit.x,hit.y,hit.z);const hardness=BLOCK_HARDNESS.get(hit.id)||1;const toolFactor=this.toolFactor(this.selectedStack().id,hit.id);this.player.breakProgress+=dt*(toolFactor/hardness);if(this.mode==='creative')this.player.breakProgress=1;if(this.player.breakProgress>=1){const old=hit.id;this.world.set(hit.x,hit.y,hit.z,BLOCK.AIR);this.particles.spawnBurst(new THREE.Vector3(hit.x+.5,hit.y+.5,hit.z+.5),8);if(this.mode==='survival'){const item=BLOCK_ITEM.get(old)||old;const remaining=this.inventory.add(item,1);if(remaining)this.drops.spawn(item,remaining,new THREE.Vector3(hit.x+.5,hit.y+.6,hit.z+.5));}this.player.breakProgress=0;this.player.breaking=null;this.refreshHotbar();this.saveSoon();}}
  toolFactor(item,block){if(item>=ITEM.WOOD_PICKAXE&&item<=ITEM.DIAMOND_PICKAXE){if([BLOCK.STONE,BLOCK.COBBLESTONE,BLOCK.COAL_ORE,BLOCK.IRON_ORE,BLOCK.DIAMOND_ORE,BLOCK.BEDROCK].includes(block))return 2.4;}if(item>=ITEM.WOOD_AXE&&item<=ITEM.DIAMOND_AXE){if([BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.CRAFTING_TABLE,BLOCK.CHEST].includes(block))return 2.4;}return 1;}
  update(dt){
    const state=this.input.state();this.player.update(dt,state);this.mine(dt);this.world.queueAround(this.player.position.x,this.player.position.z);this.world.tickQueues(this.renderer);this.drops.update(dt,this.player,this.inventory);this.particles.update(dt);this.mobs.update(dt,this.player);this.player.updateCamera(this.renderer.camera);if(this.player.health<=0)this.respawn();this.stats.frames++;this.stats.frameTimer+=dt;if(this.stats.frameTimer>=1){this.stats.fps=this.stats.frames/this.stats.frameTimer;this.stats.frames=0;this.stats.frameTimer=0;}if(now()-this.lastSave>ENGINE.SAVE_INTERVAL)this.saveSoon();}
  respawn(){this.player.position=this.world.findSpawn();this.player.health=20;this.player.velocity.set(0,0,0);}
  loop(t){if(!this.running)return;const dt=Math.min(ENGINE.MAX_DT,(t-this.last)/1000);this.last=t;this.guardrails?.frame(dt);this.input?.updateHoldState?.();this.update(dt);this.renderer.render(dt);this.updateHud();requestAnimationFrame(x=>this.loop(x));}
  updateHud(){topStatus.textContent=`${this.mode.toUpperCase()}  •  HP ${this.player.health}  •  FPS ${this.stats.fps.toFixed(0)}  •  Chunks ${this.renderer.stats.chunks} • Faces ${this.renderer.stats.faces}`;if(debugEl.style.display==='block')debugEl.textContent=`Three.js ${ENGINE.THREE_VERSION}\nRenderer ${this.renderer.backendLabel()}\nDraw calls ${this.renderer.stats.drawCalls}\nTriangles ${this.renderer.stats.triangles}\nFaces ${this.renderer.stats.faces}\nCulled faces ${this.renderer.stats.culledFaces}\nAtlas ${this.renderer.atlas.tileSize}px tiles\nTexture LOD ${this.renderer.lod.current}%\nMojang cache loaded ${this.assets.stats.loaded}\nCache hits ${this.assets.stats.cached}\nFailures ${this.assets.stats.failed}\nWorld seed ${this.seed}\nDrops ${this.drops.items.length}\nMobs ${this.mobs.mobs.length}`;}
  saveSoon(){clearTimeout(this._saveTimer);this._saveTimer=setTimeout(()=>this.save(),500);}
  async save(){this.lastSave=now();const data={version:ENGINE.VERSION,seed:this.seed,mode:this.mode,player:{x:this.player.position.x,y:this.player.position.y,z:this.player.position.z,yaw:this.player.yaw,pitch:this.player.pitch,health:this.player.health,hunger:this.player.hunger,saturation:this.foodV11?.saturation??5,experienceTotal:this.xpV12?.total??0,cameraMode:this.cameraV12?.mode??0,crouching:!!this.player.sneakingV12},inventory:this.inventory.serialize(),changed:[...this.world.changed.entries()]};await this.saveStore.save('world',data);}
  loadSave(data){if(data.player){this.player.position.set(data.player.x,data.player.y,data.player.z);this.player.yaw=data.player.yaw||0;this.player.pitch=data.player.pitch||0;this.player.health=data.player.health||20;this.player.hunger=data.player.hunger??20;this._savedSaturationV11=data.player.saturation??5;this._savedExperienceV12=data.player.experienceTotal??0;this._savedCameraModeV12=data.player.cameraMode??0;this._savedCrouchV12=!!data.player.crouching;}this.inventory.load(data.inventory);if(Array.isArray(data.changed)){for(const [k,v] of data.changed){const [x,y,z]=k.split(',').map(Number);this.world.set(x,y,z,v);}}}
  async newWorld(mode){this.running=false;this.ui.close();this.seed=Math.floor(Math.random()*2147483647);this.inventory=new Inventory();this.crafting=new Crafting(this.inventory);this.icons.clear();titleScreen.style.display='flex';await this.boot(mode,true);}
}
class RuntimeGuardrails {
  constructor(game){
    this.game=game;
    this.lastTouch=0;
    this.lastPointerType='unknown';
    this.frameBudget=16.67;
    this.longFrameCount=0;
    this.selectionGuardsInstalled=false;
    this.install();
  }
  install(){
    if(this.selectionGuardsInstalled)return;
    this.selectionGuardsInstalled=true;
    for(const target of [canvas,lookSurface,movePad]){
      target.addEventListener('touchstart',e=>{this.lastTouch=performance.now();},{passive:true});
    }
    addEventListener('pointerdown',e=>{this.lastPointerType=e.pointerType||'unknown';});
  }
  frame(dt){
    const ms=dt*1000;
    if(ms>this.frameBudget*2)this.longFrameCount++;
  }
  report(){
    return {
      pointerType:this.lastPointerType,
      longFrames:this.longFrameCount,
      rendererReady:!!this.game.renderer,
      chunks:this.game.renderer?.stats?.chunks||0,
      cached:this.game.assets?.stats?.cached||0,
      failed:this.game.assets?.stats?.failed||0
    };
  }
}
class MobileControlRouter {
  constructor(){
    this.activePointers=new Map();
    this.lastAction=0;
  }
  claim(id,kind){
    this.activePointers.set(id,kind);
    return kind;
  }
  release(id){
    this.activePointers.delete(id);
  }
  owns(id,kind){
    return this.activePointers.get(id)===kind;
  }
  clear(){
    this.activePointers.clear();
  }
}
class AssetHealthReport {
  constructor(cache,resolver){this.cache=cache;this.resolver=resolver;}
  summary(){
    const requested=this.cache?.stats?.requested||0;
    const loaded=this.cache?.stats?.loaded||0;
    const cached=this.cache?.stats?.cached||0;
    const failed=this.cache?.stats?.failed||0;
    return {requested,loaded,cached,failed,success:Math.max(0,requested-failed)};
  }
  hasFallback(name){return this.resolver?.failures?.has(name)||false;}
}
class CraftingController {
  constructor(game){this.game=game;this.opened=false;}
  open(){this.opened=true;this.game.openCraftingTable();}
  close(){this.opened=false;this.game.ui.close();}
  canOpen(){return !!this.game&&!!this.game.running&&!this.game.ui.screen;}
}
const BLOCK_TEXTURE_POLICY = Object.freeze({
  [BLOCK.GRASS]: {up:'grass_top',down:'dirt',sides:'grass_side'},
  [BLOCK.DIRT]: {all:'dirt'},
  [BLOCK.STONE]: {all:'stone'},
  [BLOCK.SAND]: {all:'sand'},
  [BLOCK.GRAVEL]: {all:'gravel'},
  [BLOCK.OAK_LOG]: {up:'oak_log_top',down:'oak_log_top',sides:'oak_log'},
  [BLOCK.OAK_LEAVES]: {all:'oak_leaves'},
  [BLOCK.OAK_PLANKS]: {all:'oak_planks'},
  [BLOCK.COBBLESTONE]: {all:'cobblestone'},
  [BLOCK.GLASS]: {all:'glass'},
  [BLOCK.SNOW]: {all:'snow'},
  [BLOCK.TORCH]: {all:'torch'},
  [BLOCK.CRAFTING_TABLE]: {up:'crafting_table_top',down:'oak_planks',sides:'crafting_table_side'}
});
function normalizeTexturePolicy(policy){
  if(!policy)return {all:'missing'};
  if(policy.sides&&!policy.all){
    return {up:policy.up||policy.sides,down:policy.down||policy.sides,east:policy.sides,west:policy.sides,north:policy.sides,south:policy.sides};
  }
  return policy;
}
function validateTextureNames(names,resolver){
  const report=[];
  for(const name of names){
    const aliases=TEXTURE_ALIASES[name]||[];
    report.push({name,aliases,failed:resolver?.failures?.has(name)||false});
  }
  return report;
}
class HoldActionState {
  constructor(){this.active=false;this.pointerId=null;this.startedAt=0;this.elapsed=0;}
  begin(id){this.active=true;this.pointerId=id;this.startedAt=performance.now();this.elapsed=0;}
  update(){if(!this.active)return;this.elapsed=performance.now()-this.startedAt;}
  end(id){if(id!==undefined&&this.pointerId!==id)return;this.active=false;this.pointerId=null;this.elapsed=0;}
  heldFor(ms){return this.active&&this.elapsed>=ms;}
}
const TOUCH_TARGETS = Object.freeze({
  minimum:44,
  recommended:48,
  actionGap:8,
  safeBottom:12,
  safeSide:16,
  lookSurfaceFullScreen:true,
  controlsAboveLookSurface:true,
  browserSelectionDisabled:true
});
function verifyTouchTarget(el){
  if(!el)return false;
  const r=el.getBoundingClientRect();
  return r.width>=TOUCH_TARGETS.minimum&&r.height>=TOUCH_TARGETS.minimum;
}
class UIInvalidationQueue {
  constructor(){this.pending=false;this.jobs=new Set();}
  request(job){this.jobs.add(job);if(this.pending)return;this.pending=true;queueMicrotask(()=>{this.pending=false;const jobs=[...this.jobs];this.jobs.clear();for(const fn of jobs){try{fn();}catch(err){console.error('[UI invalidation]',err);}}});}
  clear(){this.jobs.clear();this.pending=false;}
}
function releaseAllPointerCaptures(){
  for(const el of [lookSurface,movePad,$('jumpBtn'),$('useBtn'),$('breakBtn'),$('invBtn'),$('craftBtn')]){
    if(!el)continue;
    try{
      const id=el.getAttribute('data-active-pointer');
      if(id!==null)el.releasePointerCapture(Number(id));
    }catch(_){}
    el.classList.remove('pressed');
  }
}
addEventListener('blur',()=>releaseAllPointerCaptures());
addEventListener('pagehide',()=>releaseAllPointerCaptures());
const game=new Game();
window.__voxelDiag.log('Minecraft-assets repository resolver active — user repository preferred, Mojang fallback active.','ok');
window.__voxelDiag.log('TRUE exposed-face voxel culling enabled.','ok');
window.__voxelDiag.log('Six explicit face templates installed with geometric winding validation.','ok');
window.__voxelDiag.log('Real mipmaps + nearest filtering + anisotropy LOD enabled.','ok');
window.__voxelDiag.log('Leaves: dense alpha-test cutout, depth-write enabled, Bedrock-style two-sided leaf material.','ok');
window.__voxelDiag.log('Log top faces adjacent to leaves are preserved for cutout visibility.','ok');
window.__voxelDiag.log('Per-face generation statistics, block inspector, UV/winding validation, commands and diagnostic export enabled.','ok');
window.__voxelDiag.log('Reference Perlin terrain + cave generation integrated into the real chunk system.','ok');
window.__voxelDiag.log('Side textures use explicit per-face U/V bases; grass/log vertical sides are never rotated by generic cube UVs.','ok');
game.guardrails=new RuntimeGuardrails(game);
game.controlRouter=new MobileControlRouter();
game.assetHealth=new AssetHealthReport(game.assets,game.resolver);
game.craftingController=new CraftingController(game);
$('playBtn').onclick=()=>game.boot('survival',false);
$('creativeBtn').onclick=()=>game.boot('creative',false);
$('resetBtn').onclick=()=>game.newWorld('survival');
addEventListener('resize',()=>game.renderer?.resize());
addEventListener('beforeunload',()=>{if(game.running)game.save();});
addEventListener('visibilitychange',()=>{if(document.hidden&&game.running)game.save();});
addEventListener('keydown',e=>{
  if(e.code==='Backquote'){debugEl.style.display=debugEl.style.display==='block'?'none':'block';}
  if(e.code==='Digit1')game.inventory.selected=0;
  if(e.code==='Digit2')game.inventory.selected=1;
  if(e.code==='Digit3')game.inventory.selected=2;
  if(e.code==='Digit4')game.inventory.selected=3;
  if(e.code==='Digit5')game.inventory.selected=4;
  if(e.code==='Digit6')game.inventory.selected=5;
  if(e.code==='Digit7')game.inventory.selected=6;
  if(e.code==='Digit8')game.inventory.selected=7;
  if(e.code==='Digit9')game.inventory.selected=8;
  game.refreshHotbar();
});
console.info('[Fresh Minecraft] Three.js engine ready to boot.');
console.info('[Fresh Minecraft] Mojang sample asset root:',MC_RAW);
console.info('[Fresh Minecraft] Cache:',CACHE_NAME);
class BlockRegistry {
  constructor(){
    this.records=new Map();
    this.registerDefaults();
  }
  register(id,record){
    this.records.set(id,{id,name:BLOCK_NAME[id]||'Unknown',solid:SOLID_BLOCKS.has(id),transparent:TRANSPARENT_BLOCKS.has(id),hardness:BLOCK_HARDNESS.get(id)||0,...record});
  }
  registerDefaults(){
    for(const id of Object.values(BLOCK)){
      if(typeof id!=='number')continue;
      this.register(id,{drops:BLOCK_ITEM.get(id)||id});
    }
  }
  get(id){return this.records.get(id)||this.records.get(BLOCK.AIR);}
  isSolid(id){return this.get(id).solid;}
  hardness(id){return this.get(id).hardness;}
  drops(id){return this.get(id).drops;}
}
class LightField {
  constructor(){this.sky=new Map();this.block=new Map();}
  key(x,y,z){return `${x},${y},${z}`;}
  getSky(x,y,z){return this.sky.get(this.key(x,y,z))??15;}
  getBlock(x,y,z){return this.block.get(this.key(x,y,z))??0;}
  setSky(x,y,z,v){this.sky.set(this.key(x,y,z),clamp(v,0,15));}
  setBlock(x,y,z,v){this.block.set(this.key(x,y,z),clamp(v,0,15));}
  clear(){this.sky.clear();this.block.clear();}
}
class SoundSystem {
  constructor(){this.enabled=true;this.volume=.7;this.context=null;}
  init(){try{this.context=new (window.AudioContext||window.webkitAudioContext)();}catch{this.context=null;}}
  beep(freq=220,duration=.06){
    if(!this.enabled||!this.context)return;
    const o=this.context.createOscillator(),g=this.context.createGain();
    o.frequency.value=freq;g.gain.value=.025;o.connect(g);g.connect(this.context.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,this.context.currentTime+duration);o.stop(this.context.currentTime+duration);
  }
  blockBreak(){this.beep(110,.08);}
  blockPlace(){this.beep(220,.05);}
  hurt(){this.beep(75,.12);}
}
class WeatherSystem {
  constructor(){this.type='clear';this.timer=180;this.intensity=0;}
  update(dt){
    this.timer-=dt;
    if(this.timer<=0){this.timer=180+Math.random()*240;this.type=Math.random()<.18?'rain':'clear';this.intensity=this.type==='rain'?0.55+Math.random()*.35:0;}
  }
  dim(){return this.type==='rain'?.18*this.intensity:0;}
}
class DayClock {
  constructor(){this.tick=0;this.dayLength=1200;}
  update(dt){this.tick=(this.tick+dt)%this.dayLength;}
  phase(){return this.tick/this.dayLength;}
  sunHeight(){return Math.sin(this.phase()*Math.PI*2-Math.PI/2);}
}
class ChunkVisibility {
  constructor(renderer){this.renderer=renderer;}
  distanceToPlayer(chunk,player){const cx=chunk.cx*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5;const cz=chunk.cz*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5;return Math.hypot(cx-player.position.x,cz-player.position.z);}
  visible(chunk,player){return this.distanceToPlayer(chunk,player)<((window.game?.world?.viewDistance||ENGINE.VIEW_DISTANCE)+1)*ENGINE.CHUNK_SIZE;}
  count(){return this.renderer.chunkMeshes.size;}
}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousedown',e=>{
  if(!game.running)return;
  if(e.button===0)game.beginBreak();
  if(e.button===2)game.useSelected();
});
canvas.addEventListener('mouseup',e=>{if(e.button===0)game.endBreak();});
class CreativeCatalog {
  constructor(){this.items=[];this.build();}
  build(){
    const ids=[...new Set([...Object.values(BLOCK).filter(v=>typeof v==='number'),...RECIPES.flatMap(r=>[r.out.id])])];
    this.items=ids.filter(id=>id!==BLOCK.AIR).map(id=>({id,name:ITEM_NAME.get(id)||BLOCK_NAME[id]||`Item ${id}`}));
  }
  search(q=''){const s=q.toLowerCase();return this.items.filter(x=>x.name.toLowerCase().includes(s));}
}
const creativeCatalog=new CreativeCatalog();
class TouchItemDrag {
  constructor(){this.active=false;this.source=-1;this.startX=0;this.startY=0;this.moved=false;}
  begin(index,x,y){this.active=true;this.source=index;this.startX=x;this.startY=y;this.moved=false;}
  move(x,y){if(!this.active)return;this.moved=Math.hypot(x-this.startX,y-this.startY)>10;}
  end(){const result={active:this.active,source:this.source,moved:this.moved};this.active=false;this.source=-1;return result;}
}
class ItemBillboardFactory {
  constructor(resolver){this.resolver=resolver;this.cache=new Map();}
  async materialFor(itemId){
    if(this.cache.has(itemId))return this.cache.get(itemId);
    const name=(ITEM_NAME.get(itemId)||'missing').toLowerCase().replace(/ /g,'_');
    const image=await this.resolver.loadTexture(name);
    const tex=new THREE.Texture(image);tex.needsUpdate=true;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;
    const mat=new THREE.SpriteMaterial({map:tex,transparent:true});this.cache.set(itemId,mat);return mat;
  }
}
class ParticlePool {
  constructor(max){this.max=max;this.free=[];this.active=new Set();}
  acquire(factory){const p=this.free.pop()||factory();this.active.add(p);return p;}
  release(p){this.active.delete(p);this.free.push(p);}
  size(){return this.active.size;}
}
class GridNavigator {
  constructor(world){this.world=world;}
  canWalk(x,z){const y=this.world.highestSolidY(x,z);return !SOLID_BLOCKS.has(this.world.get(x,y+1,z))&&SOLID_BLOCKS.has(this.world.get(x,y,z));}
  step(fromX,fromZ,toX,toZ){const dx=Math.sign(toX-fromX),dz=Math.sign(toZ-fromZ);const options=[[fromX+dx,fromZ],[fromX,fromZ+dz]];for(const [x,z] of options)if(this.canWalk(x,z))return {x,z};return null;}
}
class BreakProgress {
  constructor(){this.block='';this.value=0;}
  reset(){this.block='';this.value=0;}
  advance(key,amount){if(this.block!==key){this.block=key;this.value=0;}this.value=clamp(this.value+amount,0,1);return this.value;}
}
class EventBus {
  constructor(){this.listeners=new Map();}
  on(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);return()=>this.listeners.get(name)?.delete(fn);}
  emit(name,payload){for(const fn of this.listeners.get(name)||[])try{fn(payload)}catch(e){console.error(e)}}
}
class PerformanceMonitor {
  constructor(){this.samples=[];this.last=performance.now();}
  sample(dt){this.samples.push(dt);if(this.samples.length>120)this.samples.shift();}
  average(){if(!this.samples.length)return 0;return this.samples.reduce((a,b)=>a+b,0)/this.samples.length;}
  fps(){const a=this.average();return a?1/a:0;}
}
const MOJANG_ASSET_MANIFEST={
  blocks:['grass_top','grass_side','dirt','stone','sand','gravel','oak_log','oak_log_top','oak_leaves','oak_planks','cobblestone','glass','coal_ore','iron_ore','diamond_ore','bedrock','water','crafting_table_top','crafting_table_side','bricks','obsidian','snow','glowstone','furnace_side','chest','tnt_top','tnt_bottom','tnt_side'],
  items:['grass_block','dirt','stone','sand','gravel','oak_log','oak_planks','cobblestone','glass','coal','iron_ingot','diamond','stick','torch','bread','apple','wooden_pickaxe','stone_pickaxe','iron_pickaxe','diamond_pickaxe'],
  ui:['Black','arrow_large','crossout','chevron_left','chevron_right'],
};
const MOJANG_JSON_ENDPOINTS={
  version:'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/version.json',
  items:'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-items.json',
  ui:'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/ui/_ui_defs.json',
  blocks:'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/behavior_pack/blocks/',
};
class MojangJsonCatalog {
  constructor(cache){this.cache=cache;this.version=null;this.items=null;this.ui=null;}
  async warm(){
    try{this.version=safeJsonParse(await this.cache.text(MOJANG_JSON_ENDPOINTS.version),null)}catch{}
    try{this.items=safeJsonParse(await this.cache.text(MOJANG_JSON_ENDPOINTS.items),null)}catch{}
    try{this.ui=safeJsonParse(await this.cache.text(MOJANG_JSON_ENDPOINTS.ui),null)}catch{}
  }
}
const blockRegistry=new BlockRegistry();
const eventBus=new EventBus();
const performanceMonitor=new PerformanceMonitor();
const soundSystem=new SoundSystem();
const weatherSystem=new WeatherSystem();
const dayClock=new DayClock();
window.FreshMinecraft={
  engine:ENGINE,
  game,
  blockRegistry,
  creativeCatalog,
  manifest:MOJANG_ASSET_MANIFEST,
  jsonEndpoints:MOJANG_JSON_ENDPOINTS,
  events:eventBus,
  sound:soundSystem,
};
window.addEventListener('error',e=>{
  console.error('[Fresh Minecraft]',e.error||e.message);
});
window.addEventListener('unhandledrejection',e=>{
  console.error('[Fresh Minecraft] unhandled rejection',e.reason);
});
const STUDIO_BUILD = Object.freeze({
  version: '2.0.0-studio-input-combat-assets',
  minimumSourceLines: 20000,
  threeVersion: ENGINE.THREE_VERSION,
  mojangRepository: 'https://github.com/Mojang/bedrock-samples',
  userAssetRepository: 'https://github.com/matthewcodergamer/Minecraft-assets',
  cacheName: 'fresh-mc-studio-assets-v2',
  modelCacheName: 'fresh-mc-bedrock-models-v1',
  iconCacheName: 'fresh-mc-clean-icons-v1'
});
const USER_ASSET_RAW = 'https://raw.githubusercontent.com/matthewcodergamer/Minecraft-assets/main/';
const BEDROCK_RAW = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/';
class StudioPointerState {
  constructor(){
    this.active = new Map();
    this.primary = null;
    this.look = null;
    this.move = null;
    this.action = null;
    this.sequence = 0;
  }
  claim(pointerId, role, element){
    const token = ++this.sequence;
    this.active.set(pointerId, {role, element, token, started:performance.now()});
    if(role==='look')this.look=pointerId;
    if(role==='move')this.move=pointerId;
    if(role==='action')this.action=pointerId;
    if(this.primary===null)this.primary=pointerId;
    return token;
  }
  release(pointerId){
    const record=this.active.get(pointerId);
    this.active.delete(pointerId);
    if(this.look===pointerId)this.look=null;
    if(this.move===pointerId)this.move=null;
    if(this.action===pointerId)this.action=null;
    if(this.primary===pointerId)this.primary=this.active.keys().next().value??null;
    return record;
  }
  role(pointerId){return this.active.get(pointerId)?.role||null;}
  has(pointerId){return this.active.has(pointerId);}
  clear(){for(const [id,r] of this.active){try{r.element?.releasePointerCapture?.(id)}catch{}}this.active.clear();this.primary=null;this.look=null;this.move=null;this.action=null;}
}
class BrowserSelectionGuard {
  constructor(){this.installed=false;this.install();}
  install(){
    if(this.installed)return;
    this.installed=true;
    const stop=e=>{e.preventDefault();e.stopPropagation();};
    document.addEventListener('selectstart',stop,{passive:false});
    document.addEventListener('dragstart',stop,{passive:false});
    document.addEventListener('contextmenu',stop,{passive:false});
    document.addEventListener('gesturestart',stop,{passive:false});
    document.addEventListener('gesturechange',stop,{passive:false});
    document.addEventListener('gestureend',stop,{passive:false});
    document.addEventListener('touchmove',e=>{if(game?.running)e.preventDefault()},{passive:false});
  }
}
class StudioInputRouter {
  constructor(){
    this.pointer=new StudioPointerState();
    this.keys=new Set();
    this.move={x:0,y:0};
    this.jump=false;
    this.sneak=false;
    this.run=false;
    this.attackHeld=false;
    this.useHeld=false;
    this.lookSensitivity=.00215;
    this.mobileLookScale=1.0;
    this.keyboardBindings=new Map();
    this.install();
  }
  install(){
    this.installKeyboard();
    this.installLookSurface();
    this.installMovePad();
    this.installActions();
    this.installWindowGuards();
  }
  installKeyboard(){
    const down=e=>{
      if(this.isGameUiFocused())return;
      this.keys.add(e.code);
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
      if(e.code==='KeyE')game.toggleInventory();
      if(e.code==='KeyC')game.openCraftingTable();
      if(e.code==='Digit1')game.inventory.selected=0;
      if(e.code==='Digit2')game.inventory.selected=1;
      if(e.code==='Digit3')game.inventory.selected=2;
      if(e.code==='Digit4')game.inventory.selected=3;
      if(e.code==='Digit5')game.inventory.selected=4;
      if(e.code==='Digit6')game.inventory.selected=5;
      if(e.code==='Digit7')game.inventory.selected=6;
      if(e.code==='Digit8')game.inventory.selected=7;
      if(e.code==='Digit9')game.inventory.selected=8;
      game.refreshHotbar();
    };
    const up=e=>{this.keys.delete(e.code);};
    addEventListener('keydown',down,{passive:false});
    addEventListener('keyup',up,{passive:false});
    addEventListener('wheel',e=>{if(game.running&&!game.ui.screen)game.cycleHotbar(e.deltaY>0?1:-1)},{passive:true});
  }
  installLookSurface(){
    const start=e=>{
      if(!game.running||game.ui.screen)return;
      if(this.pointer.role(e.pointerId))return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      e.preventDefault();
      e.stopPropagation();
      this.pointer.claim(e.pointerId,'look',lookSurface);
      try{lookSurface.setPointerCapture(e.pointerId)}catch{}
      this.lookX=e.clientX;
      this.lookY=e.clientY;
    };
    const move=e=>{
      if(this.pointer.role(e.pointerId)!=='look')return;
      e.preventDefault();
      const dx=e.clientX-this.lookX;
      const dy=e.clientY-this.lookY;
      this.lookX=e.clientX;
      this.lookY=e.clientY;
      if(!game.player)return;
      game.player.yaw-=dx*this.lookSensitivity*this.mobileLookScale;
      game.player.pitch=clamp(game.player.pitch-dy*this.lookSensitivity*this.mobileLookScale,-1.50,1.50);
    };
    const end=e=>{if(this.pointer.role(e.pointerId)==='look'){e.preventDefault();this.pointer.release(e.pointerId);}};
    lookSurface.addEventListener('pointerdown',start,{passive:false});
    lookSurface.addEventListener('pointermove',move,{passive:false});
    lookSurface.addEventListener('pointerup',end,{passive:false});
    lookSurface.addEventListener('pointercancel',end,{passive:false});
    lookSurface.addEventListener('lostpointercapture',end,{passive:false});
    canvas.addEventListener('click',()=>{
      if(game.running&&matchMedia('(hover:hover) and (pointer:fine)').matches)canvas.requestPointerLock?.();
    });
    addEventListener('mousemove',e=>{
      if(document.pointerLockElement!==canvas||!game.player)return;
      game.player.yaw-=e.movementX*.0022;
      game.player.pitch=clamp(game.player.pitch-e.movementY*.0022,-1.50,1.50);
    },{passive:true});
  }
  installMovePad(){
    const begin=e=>{
      if(!game.running||game.ui.screen)return;
      e.preventDefault();e.stopPropagation();
      if(this.pointer.move!==null)return;
      this.pointer.claim(e.pointerId,'move',movePad);
      try{movePad.setPointerCapture(e.pointerId)}catch{}
      this.setMove(e.clientX,e.clientY);
    };
    const move=e=>{if(this.pointer.role(e.pointerId)!=='move')return;e.preventDefault();this.setMove(e.clientX,e.clientY);};
    const end=e=>{if(this.pointer.role(e.pointerId)!=='move')return;e.preventDefault();this.pointer.release(e.pointerId);this.move.x=0;this.move.y=0;moveStick.style.transform='translate(0,0)';};
    movePad.addEventListener('pointerdown',begin,{passive:false});
    movePad.addEventListener('pointermove',move,{passive:false});
    movePad.addEventListener('pointerup',end,{passive:false});
    movePad.addEventListener('pointercancel',end,{passive:false});
    movePad.addEventListener('lostpointercapture',end,{passive:false});
  }
  setMove(x,y){
    const r=movePad.getBoundingClientRect();
    const cx=r.left+r.width*.5,cy=r.top+r.height*.5;
    let dx=x-cx,dy=y-cy;
    const max=Math.max(28,r.width*.38);
    const len=Math.hypot(dx,dy);
    if(len>max){dx=dx/len*max;dy=dy/len*max;}
    this.move.x=clamp(dx/max,-1,1);
    this.move.y=clamp(dy/max,-1,1);
    moveStick.style.transform=`translate(${dx}px,${dy}px)`;
  }
  installActions(){
    const bind=(id,down,up)=>{
      const el=$(id);if(!el)return;
      const press=e=>{
        e.preventDefault();e.stopPropagation();
        el.classList.add('pressed');
        el.setAttribute('data-active-pointer',String(e.pointerId));
        try{el.setPointerCapture(e.pointerId)}catch{}
        down(e);
      };
      const release=e=>{
        e.preventDefault();e.stopPropagation();
        el.classList.remove('pressed');
        el.removeAttribute('data-active-pointer');
        up?.(e);
      };
      el.addEventListener('pointerdown',press,{passive:false});
      el.addEventListener('pointerup',release,{passive:false});
      el.addEventListener('pointercancel',release,{passive:false});
      el.addEventListener('lostpointercapture',e=>{el.classList.remove('pressed');up?.(e);});
    };
    bind('jumpBtn',()=>{this.jump=true;},()=>{this.jump=false;});
    bind('breakBtn',e=>{this.attackHeld=true;game.primaryActionStart?.(e.pointerId);},e=>{this.attackHeld=false;game.primaryActionEnd?.(e.pointerId);});
    bind('useBtn',()=>{this.useHeld=true;game.useSelected();},()=>{this.useHeld=false;});
    bind('invBtn',()=>game.toggleInventory());
    bind('craftBtn',()=>game.openCraftingTable());
  }
  installWindowGuards(){
    const reset=()=>{this.pointer.clear();this.move.x=0;this.move.y=0;this.jump=false;this.attackHeld=false;this.useHeld=false;moveStick.style.transform='translate(0,0)';for(const id of ['jumpBtn','breakBtn','useBtn','invBtn','craftBtn'])$(id)?.classList.remove('pressed');};
    addEventListener('blur',reset);
    addEventListener('pagehide',reset);
    addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  }
  isGameUiFocused(){const a=document.activeElement;return !!a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable);}
  state(){
    let forward=0,right=0;
    if(this.keys.has('KeyW')||this.keys.has('ArrowUp'))forward+=1;
    if(this.keys.has('KeyS')||this.keys.has('ArrowDown'))forward-=1;
    if(this.keys.has('KeyD')||this.keys.has('ArrowRight'))right+=1;
    if(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))right-=1;
    forward+=-this.move.y;right+=this.move.x;
    const length=Math.hypot(forward,right);
    if(length>1){forward/=length;right/=length;}
    return {forward,right,jump:this.jump||this.keys.has('Space'),sneak:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'),run:this.keys.has('ControlLeft')||this.keys.has('ControlRight'),flyToggle:false};
  }
}
new BrowserSelectionGuard();
class StudioMovementModel {
  constructor(){
    this.groundAcceleration=42;
    this.airAcceleration=13;
    this.groundFriction=16;
    this.airFriction=1.2;
    this.gravity=27.5;
    this.jumpVelocity=8.9;
    this.walkSpeed=4.317;
    this.sprintSpeed=5.612;
    this.sneakSpeed=1.295;
    this.airControl=.45;
    this.stepHeight=.55;
  }
  approach(current,target,rate,dt){
    const delta=target-current;
    const amount=Math.min(Math.abs(delta),rate*dt);
    return current+Math.sign(delta)*amount;
  }
  horizontal(player,controls,dt){
    const f=yawForward(player.yaw),r=yawRight(player.yaw);
    let x=f.x*controls.forward+r.x*controls.right;
    let z=f.z*controls.forward+r.z*controls.right;
    const inputLength=Math.hypot(x,z);
    if(inputLength>1){x/=inputLength;z/=inputLength;}
    let targetSpeed=this.walkSpeed;
    if(controls.sneak)targetSpeed=this.sneakSpeed;
    else if(controls.run)targetSpeed=this.sprintSpeed;
    const targetX=x*targetSpeed,targetZ=z*targetSpeed;
    const acceleration=player.onGround?this.groundAcceleration:this.airAcceleration*this.airControl;
    if(Math.abs(x)+Math.abs(z)>0.001){
      player.velocity.x=this.approach(player.velocity.x,targetX,acceleration,dt);
      player.velocity.z=this.approach(player.velocity.z,targetZ,acceleration,dt);
    }else{
      const friction=player.onGround?this.groundFriction:this.airFriction;
      player.velocity.x=this.approach(player.velocity.x,0,friction,dt);
      player.velocity.z=this.approach(player.velocity.z,0,friction,dt);
    }
  }
  vertical(player,controls,dt){
    if(controls.jump&&player.onGround){player.velocity.y=this.jumpVelocity;player.onGround=false;}
    player.velocity.y-=this.gravity*dt;
  }
}
const studioMovement=new StudioMovementModel();
Player.prototype.update=function(dt,controls){
  this.input=controls;
  if(this.mode==='creative'&&controls.flyToggle)this.flying=!this.flying;
  if(this.flying){
    const f=yawForward(this.yaw),r=yawRight(this.yaw);
    let x=f.x*controls.forward+r.x*controls.right;
    let z=f.z*controls.forward+r.z*controls.right;
    const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}
    const speed=controls.run?ENGINE.PLAYER_RUN:ENGINE.PLAYER_SPEED;
    this.velocity.set(x*speed,(controls.jump?speed:0)-(controls.sneak?speed:0),z*speed);
    this.position.addScaledVector(this.velocity,dt);
    this.position.y=clamp(this.position.y,1,ENGINE.WORLD_HEIGHT-2);
    this.onGround=false;
    return;
  }
  studioMovement.horizontal(this,controls,dt);
  studioMovement.vertical(this,controls,dt);
  this.onGround=false;
  this.moveAxis('x',this.velocity.x*dt);
  this.moveAxis('z',this.velocity.z*dt);
  this.moveAxis('y',this.velocity.y*dt);
  if(this.position.y<-20){this.position=this.world.findSpawn();this.velocity.set(0,0,0);}
};
class TargetFeedback {
  constructor(){this.lastKey='';this.progress=0;this.element=null;}
  install(){
    if(this.element)return;
    const el=document.createElement('div');
    el.id='studioBreakOverlay';
    el.innerHTML='<div class="studioBreakFill"></div>';
    el.style.cssText='position:absolute;left:50%;top:50%;width:28px;height:28px;transform:translate(-50%,-50%);border:2px solid rgba(255,255,255,.45);display:none;pointer-events:none;z-index:31;box-shadow:0 0 0 1px rgba(0,0,0,.5);';
    const fill=el.firstElementChild;
    fill.style.cssText='position:absolute;left:0;bottom:0;width:100%;height:0;background:rgba(255,255,255,.55);';
    document.getElementById('hud')?.appendChild(el);
    this.element=el;
  }
  update(key,progress){
    this.install();
    if(!key||progress<=0){this.element.style.display='none';return;}
    this.element.style.display='block';
    this.element.firstElementChild.style.height=`${clamp(progress,0,1)*100}%`;
  }
}
const targetFeedback=new TargetFeedback();
class CombatSystem {
  constructor(game){
    this.game=game;
    this.cooldown=0;
    this.attackInterval=.42;
    this.damage=4;
    this.reach=4.5;
    this.lastTarget=null;
    this.lastAttackTime=0;
    this.flashTimer=0;
  }
  update(dt){this.cooldown=Math.max(0,this.cooldown-dt);this.flashTimer=Math.max(0,this.flashTimer-dt);}
  direction(){
    return new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.game.player.pitch,this.game.player.yaw,0,'YXZ')).normalize();
  }
  ray(origin,direction,maxDistance=this.reach){
    const result={mob:null,distance:Infinity};
    for(const mob of this.game.mobs?.mobs||[]){
      if(!mob.mesh||mob.health<=0)continue;
      const box=new THREE.Box3().setFromObject(mob.mesh);
      const hit=new THREE.Vector3();
      if(!new THREE.Ray(origin,direction).intersectBox(box,hit))continue;
      const distance=origin.distanceTo(hit);
      if(distance<=maxDistance&&distance<result.distance){result.mob=mob;result.distance=distance;}
    }
    return result.mob?result:null;
  }
  target(){
    if(!this.game.player)return null;
    const origin=this.game.player.eyePosition();
    return this.ray(origin,this.direction(),this.reach)?.mob||null;
  }
  attack(){
    if(this.cooldown>0||!this.game.running)return false;
    const mob=this.target();
    if(!mob)return false;
    mob.health=Math.max(0,mob.health-this.damage);
    mob.hitFlash=.12;
    mob.velocity.y=Math.max(mob.velocity.y,2.2);
    const f=this.direction();
    mob.velocity.x+=f.x*2.2;
    mob.velocity.z+=f.z*2.2;
    this.cooldown=this.attackInterval;
    this.lastTarget=mob;
    this.lastAttackTime=performance.now();
    this.flashTimer=.10;
    damageVignette.style.background='radial-gradient(circle,transparent 58%,rgba(255,255,255,.28))';
    damageVignette.style.opacity='.35';
    setTimeout(()=>{damageVignette.style.opacity='0';damageVignette.style.background='radial-gradient(circle,transparent 35%,rgba(180,0,0,.65))';},90);
    soundSystem?.beep?.(260,.035);
    return true;
  }
  updateTargetHighlight(){
    const mob=this.target();
    for(const candidate of this.game.mobs?.mobs||[]){
      if(candidate.mesh)candidate.mesh.traverse(o=>{if(o.isMesh){o.userData.targeted=candidate===mob;}});
    }
    return mob;
  }
}
Game.prototype.primaryActionStart=function(pointerId=null){
  this._studioPrimaryPointer=pointerId;
  if(this.combat?.attack()){
    this._studioAttackMode=true;
    this._studioBreakMode=false;
    return;
  }
  this._studioAttackMode=false;
  this._studioBreakMode=true;
  this.beginBreak();
};
Game.prototype.primaryActionEnd=function(pointerId=null){
  if(pointerId!==null&&this._studioPrimaryPointer!==pointerId)return;
  this._studioPrimaryPointer=null;
  this._studioAttackMode=false;
  this._studioBreakMode=false;
  this.endBreak();
};
const originalGameUpdate=Game.prototype.update;
Game.prototype.update=function(dt){
  this.combat?.update(dt);
  if(this._studioAttackMode&&this.combat?.cooldown<=0)this.combat.attack();
  originalGameUpdate.call(this,dt);
  if(this._studioBreakMode)targetFeedback.update(this.player.breaking,this.player.breakProgress);
  else targetFeedback.update('',0);
};
class MobLifecycle {
  constructor(system){this.system=system;}
  tick(){
    const list=this.system.mobs;
    for(let i=list.length-1;i>=0;i--){
      const mob=list[i];
      if(mob.health>0)continue;
      const p=mob.position.clone();
      this.system.scene.remove(mob.mesh);
      this.system.game?.drops?.spawn?.(mob.type==='zombie'?ITEM.ROTTEN_FLESH??ITEM.AIR:ITEM.BREAD,1,p);
      list.splice(i,1);
    }
  }
}
class BackgroundRemover {
  constructor(){this.cache=new Map();this.urls=new Set();}
  isBackgroundPixel(r,g,b,a){
    if(a<8)return true;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    return max<34&&max-min<18;
  }
  clean(source,name='texture'){
    const width=source.width||source.naturalWidth||16;
    const height=source.height||source.naturalHeight||16;
    const canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(source,0,0,width,height);
    const image=ctx.getImageData(0,0,width,height);
    const data=image.data;
    const seen=new Uint8Array(width*height);
    const queue=[];
    const push=(x,y)=>{if(x<0||y<0||x>=width||y>=height)return;const i=y*width+x;if(seen[i])return;seen[i]=1;queue.push(i);};
    for(let x=0;x<width;x++){push(x,0);push(x,height-1);}
    for(let y=0;y<height;y++){push(0,y);push(width-1,y);}
    let head=0;
    while(head<queue.length){
      const index=queue[head++];
      const x=index%width,y=Math.floor(index/width);
      const p=index*4;
      if(!this.isBackgroundPixel(data[p],data[p+1],data[p+2],data[p+3]))continue;
      data[p+3]=0;
      push(x-1,y);push(x+1,y);push(x,y-1);push(x,y+1);
    }
    ctx.putImageData(image,0,0);
    return canvas;
  }
  async cleanUrl(url){
    if(this.cache.has(url))return this.cache.get(url);
    try{
      const response=await fetch(url,{mode:'cors',cache:'force-cache'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const blob=await response.blob();
      const bitmap=await createImageBitmap(blob);
      const canvas=this.clean(bitmap,url);
      const objectUrl=URL.createObjectURL(await new Promise(resolve=>canvas.toBlob(resolve,'image/png')));
      this.cache.set(url,objectUrl);this.urls.add(objectUrl);
      bitmap.close?.();
      return objectUrl;
    }catch{return url;}
  }
  dispose(){for(const url of this.urls)URL.revokeObjectURL(url);this.urls.clear();this.cache.clear();}
}
const backgroundRemover=new BackgroundRemover();
class IconSanitizer {
  constructor(){this.pending=new Set();this.observer=null;}
  install(){
    if(this.observer)return;
    this.observer=new MutationObserver(()=>this.scan());
    this.observer.observe(document.body,{subtree:true,childList:true});
    this.scan();
  }
  scan(){
    document.querySelectorAll('img.item-icon').forEach(img=>{
      if(img.dataset.studioCleaned==='1'||this.pending.has(img))return;
      const src=img.currentSrc||img.src;
      if(!src)return;
      this.pending.add(img);
      backgroundRemover.cleanUrl(src).then(clean=>{
        if(img.isConnected&&clean!==src){img.src=clean;}
        img.dataset.studioCleaned='1';
      }).finally(()=>this.pending.delete(img));
    });
  }
}
const iconSanitizer=new IconSanitizer();
iconSanitizer.install();
class BedrockGeometryTranslator {
  constructor(cache){
    this.cache=cache;
    this.jsonCache=new Map();
    this.textureCache=new Map();
    this.modelCache=new Map();
  }
  async json(url){
    if(this.jsonCache.has(url))return this.jsonCache.get(url);
    const text=await this.cache.text(url);
    const value=JSON.parse(text);
    this.jsonCache.set(url,value);
    return value;
  }
  async clientEntity(type){
    const url=`${BEDROCK_RAW}resource_pack/entity/${type}.entity.json`;
    return this.json(url);
  }
  async geometry(type){
    const url=`${BEDROCK_RAW}resource_pack/models/entity/${type}.geo.json`;
    return this.json(url);
  }
  chooseGeometry(entity,geometry){
    const description=entity?.['minecraft:client_entity']?.description||{};
    const map=description.geometry||{};
    const preferred=map.default||Object.values(map)[0];
    return geometry[preferred]?{name:preferred,data:geometry[preferred]}:{name:Object.keys(geometry)[0],data:geometry[Object.keys(geometry)[0]]};
  }
  async texture(type){
    if(this.textureCache.has(type))return this.textureCache.get(type);
    let path;
    try{
      const entity=await this.clientEntity(type);
      const map=entity?.['minecraft:client_entity']?.description?.textures||{};
      path=map.default||Object.values(map)[0];
    }catch{}
    if(!path)path=`textures/entity/${type}/${type}`;
    const candidates=[`${BEDROCK_RAW}resource_pack/${path}.png`,`${BEDROCK_RAW}resource_pack/textures/entity/${type}/${type}.png`];
    let image=null;
    for(const url of candidates){try{image=await this.cache.image(url);break;}catch{}}
    if(!image)throw new Error(`No entity texture for ${type}`);
    const cleaned=backgroundRemover.clean(image,`${type}-entity`);
    this.textureCache.set(type,cleaned);
    image.close?.();
    return cleaned;
  }
  makeCube(size,uv,textureWidth,textureHeight,texture,inflate=0,mirror=false){
    const sx=(size[0]+inflate*2)/16,sy=(size[1]+inflate*2)/16,sz=(size[2]+inflate*2)/16;
    const geometry=new THREE.BoxGeometry(sx,sy,sz);
    const attr=geometry.getAttribute('uv');
    const u0=(uv?.[0]||0)/textureWidth;
    const v0=(uv?.[1]||0)/textureHeight;
    const uw=size[0]/textureWidth;
    const uh=size[1]/textureHeight;
    const ud=size[2]/textureWidth;
    const faces=[
      [u0+ud,v0,u0+ud+uw,v0+uh],
      [u0+ud+uw+ud,v0,u0+ud+uw+ud+uw,v0+uh],
      [u0+ud,v0+uh,u0+ud+uw,v0+uh+ud],
      [u0+ud+uw+ud,v0+uh,u0+ud+uw+ud+uw,v0+uh+ud],
      [u0,v0+uh,u0+ud,v0+uh+ud],
      [u0+ud+uw,v0+uh,u0+ud+uw+ud,v0+uh+ud]
    ];
    for(let face=0;face<6;face++){
      const base=face*4;
      const r=faces[face];
      const uA=mirror?r[2]:r[0],uB=mirror?r[0]:r[2];
      attr.setXY(base,uA,1-r[1]);
      attr.setXY(base+1,uB,1-r[1]);
      attr.setXY(base+2,uB,1-r[3]);
      attr.setXY(base+3,uA,1-r[3]);
      attr.setXY(base+4,uA,1-r[1]);
      attr.setXY(base+5,uB,1-r[1]);
      attr.setXY(base+6,uB,1-r[3]);
      attr.setXY(base+7,uA,1-r[3]);
    }
    const material=new THREE.MeshLambertMaterial({map:texture,transparent:true,alphaTest:.08,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);
    return mesh;
  }
  buildBoneTree(definition,texture){
    const textureWidth=definition.texturewidth||64;
    const textureHeight=definition.textureheight||32;
    const root=new THREE.Group();
    const bones=new Map();
    const pending=[];
    for(const bone of definition.bones||[]){
      const node=new THREE.Group();
      node.name=bone.name;
      const pivot=bone.pivot||[0,0,0];
      node.position.set(pivot[0]/16,pivot[1]/16,pivot[2]/16);
      if(bone.rotation){node.rotation.set((bone.rotation[0]||0)*Math.PI/180,(bone.rotation[1]||0)*Math.PI/180,(bone.rotation[2]||0)*Math.PI/180);}
      node.userData.bedrockPivot=pivot;
      node.userData.bedrockBone=bone;
      bones.set(bone.name,node);
      pending.push([bone,node]);
    }
    for(const [bone,node] of pending){
      const parent=bones.get(bone.parent)||root;
      parent.add(node);
      if(bone.neverRender)node.visible=false;
      for(const cube of bone.cubes||[]){
        const size=cube.size||[1,1,1];
        const origin=cube.origin||[0,0,0];
        const pivot=bone.pivot||[0,0,0];
        const mesh=this.makeCube(size,cube.uv||[0,0],textureWidth,textureHeight,texture,cube.inflate||0,!!bone.mirror);
        mesh.position.set((origin[0]+size[0]/2-pivot[0])/16,(origin[1]+size[1]/2-pivot[1])/16,(origin[2]+size[2]/2-pivot[2])/16);
        mesh.userData.bedrockCube=cube;
        node.add(mesh);
      }
    }
    root.userData.bones=bones;
    return root;
  }
  async load(type){
    if(this.modelCache.has(type))return this.modelCache.get(type).clone(true);
    const [entity,geometry,texture]=await Promise.all([this.clientEntity(type),this.geometry(type),this.texture(type)]);
    const selected=this.chooseGeometry(entity,geometry);
    const root=this.buildBoneTree(selected.data,texture);
    root.userData.entityType=type;
    root.userData.geometryName=selected.name;
    root.scale.setScalar(0.0625);
    this.modelCache.set(type,root);
    return root.clone(true);
  }
}
class StudioAssetPipeline {
  constructor(cache){
    this.cache=cache;
    this.models=new BedrockGeometryTranslator(cache);
    this.prefetchManifest=[
      `${BEDROCK_RAW}version.json`,
      `${BEDROCK_RAW}metadata/vanilladata_modules/mojang-items.json`,
      `${BEDROCK_RAW}metadata/vanilladata_modules/mojang-entities.json`,
      `${BEDROCK_RAW}resource_pack/entity/zombie.entity.json`,
      `${BEDROCK_RAW}resource_pack/models/entity/zombie.geo.json`,
      `${BEDROCK_RAW}resource_pack/entity/cow.entity.json`,
      `${BEDROCK_RAW}resource_pack/models/entity/cow.geo.json`,
      `${BEDROCK_RAW}resource_pack/textures/entity/zombie/zombie.png`,
      `${BEDROCK_RAW}resource_pack/textures/entity/cow/cow_v2.png`,
      `${USER_ASSET_RAW}pickaxe.glb`,
      `${USER_ASSET_RAW}pickaxe.png`,
      `${USER_ASSET_RAW}inventory_mobile.png`,
      `${USER_ASSET_RAW}grass.png`,
      `${USER_ASSET_RAW}leaves.png`,
      `${USER_ASSET_RAW}flower.png`
    ];
    this.results=[];
  }
  async prefetch(progress=()=>{}){
    let complete=0;
    for(const url of this.prefetchManifest){
      try{await this.cache.fetch(url);this.results.push({url,ok:true});}
      catch(error){this.results.push({url,ok:false,error:String(error)});}
      complete++;
      progress(complete,this.prefetchManifest.length,url);
    }
    return this.results;
  }
  async model(type){return this.models.load(type);}
}
class StudioDropMeshFactory {
  constructor(resolver){this.resolver=resolver;this.materials=new Map();this.pending=new Map();}
  async material(id){
    if(this.materials.has(id))return this.materials.get(id);
    const name=(ITEM_NAME.get(id)||BLOCK_NAME[id]||'missing').toLowerCase().replace(/ /g,'_');
    let image;
    try{image=await this.resolver.loadTexture(name);}catch{image=null;}
    if(!image)image=this.resolver.makeFallback(name);
    const texture=new THREE.Texture(image);
    texture.needsUpdate=true;
    texture.magFilter=THREE.NearestFilter;
    texture.minFilter=THREE.NearestFilter;
    texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.MeshLambertMaterial({map:texture,transparent:true,alphaTest:.08});
    this.materials.set(id,material);
    return material;
  }
  placeholder(id){
    const material=new THREE.MeshLambertMaterial({color:0xaaaaaa});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),material);
    mesh.userData.itemId=id;
    return mesh;
  }
  async upgrade(mesh,id){
    try{
      const material=await this.material(id);
      mesh.material=material;
      mesh.geometry.dispose?.();
      mesh.geometry=new THREE.BoxGeometry(.34,.34,.34);
    }catch{}
  }
  create(id){
    const mesh=this.placeholder(id);
    this.upgrade(mesh,id);
    return mesh;
  }
}
class StudioDropPhysics {
  constructor(){this.bounce=.32;this.drag=.84;this.magnetSpeed=7.5;this.pickupRadius=1.25;}
  update(drop,world,player,dt){
    drop.age+=dt;
    drop.pickupDelay-=dt;
    drop.velocity.y-=ENGINE.GRAVITY*.72*dt;
    const horizontal=new THREE.Vector2(drop.velocity.x,drop.velocity.z);
    horizontal.multiplyScalar(Math.pow(this.drag,dt*60));
    drop.velocity.x=horizontal.x;drop.velocity.z=horizontal.y;
    if(drop.pickupDelay<=0){
      const distance=drop.position.distanceTo(player.position);
      if(distance<this.pickupRadius){
        const to=player.position.clone().sub(drop.position);
        const len=to.length();
        if(len>0.001){to.multiplyScalar(1/len);drop.velocity.lerp(to.multiplyScalar(this.magnetSpeed),clamp(dt*8,0,1));}
      }
    }
    const next=drop.position.clone().addScaledVector(drop.velocity,dt);
    const bx=Math.floor(next.x),bz=Math.floor(next.z),by=Math.floor(next.y-.08);
    const ground=world.getLoaded(bx,by,bz);
    if(drop.velocity.y<0&&SOLID_BLOCKS.has(ground)){
      next.y=by+1.02;
      drop.velocity.y=-drop.velocity.y*this.bounce;
      if(Math.abs(drop.velocity.y)<.12)drop.velocity.y=0;
    }
    drop.position.copy(next);
    drop.spin+=dt*4.0;
    if(drop.mesh){
      drop.mesh.position.copy(drop.position);
      drop.mesh.rotation.y=drop.spin;
      drop.mesh.rotation.x=Math.sin(drop.spin*.55)*.14;
    }
  }
}
class InventoryTransactionEngine {
  constructor(game){this.game=game;this.drag=null;this.ghost=null;this.install();}
  install(){
    this.createGhost();
    screenLayer.addEventListener('pointermove',e=>this.move(e),{passive:false});
    screenLayer.addEventListener('pointerup',e=>this.end(e),{passive:false});
    screenLayer.addEventListener('pointercancel',e=>this.cancel(e),{passive:false});
  }
  createGhost(){
    const el=document.createElement('div');
    el.id='studioDragGhost';
    el.style.cssText='position:fixed;display:none;width:48px;height:48px;pointer-events:none;z-index:1000;transform:translate(-50%,-50%);filter:drop-shadow(2px 2px 2px rgba(0,0,0,.8));';
    document.body.appendChild(el);this.ghost=el;
  }
  sourceForElement(el){
    const slot=el?.closest?.('[data-slot]');
    if(!slot)return null;
    return slot.dataset.slot||null;
  }
  begin(el,e){
    if(!this.game.ui.screen)return false;
    const slot=this.sourceForElement(el);if(!slot||slot==='o')return false;
    const resolved=this.resolve(slot);if(!resolved?.stack||resolved.stack.empty())return false;
    this.drag={slot,stack:resolved.stack.clone(),moved:false,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId};
    this.showGhost(this.drag.stack,e.clientX,e.clientY);
    try{screenLayer.setPointerCapture(e.pointerId)}catch{}
    return true;
  }
  resolve(slot){
    const type=slot[0],index=Number(slot.slice(1));
    if(type==='i')return {stack:this.game.inventory.slots[index],type,index};
    if(type==='p'||type==='t')return {stack:this.game.crafting.grid[index],type,index};
    return null;
  }
  move(e){
    if(!this.drag||e.pointerId!==this.drag.pointerId)return;
    e.preventDefault();
    if(Math.hypot(e.clientX-this.drag.startX,e.clientY-this.drag.startY)>8)this.drag.moved=true;
    this.showGhost(this.drag.stack,e.clientX,e.clientY);
  }
  end(e){
    if(!this.drag||e.pointerId!==this.drag.pointerId)return;
    e.preventDefault();
    const drag=this.drag;this.drag=null;this.hideGhost();
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-slot]');
    if(target&&this.game.ui.screen){this.dropIntoSlot(drag,target.dataset.slot);return;}
    if(drag.moved){this.dropIntoWorld(drag.stack);this.takeFromSource(drag.slot,drag.stack.count);return;}
    this.game.ui.clickSlot?.(drag.slot);
  }
  cancel(){if(this.drag){this.drag=null;this.hideGhost();}}
  showGhost(stack,x,y){
    this.ghost.style.display='block';this.ghost.style.left=`${x}px`;this.ghost.style.top=`${y}px`;
    const icon=this.game.iconFor(stack.id);
    this.ghost.innerHTML=icon?`<img src="${icon}" style="width:100%;height:100%;image-rendering:pixelated;object-fit:contain">`:'';
    if(stack.count>1)this.ghost.innerHTML+=`<b style="position:absolute;right:0;bottom:-2px;color:white;text-shadow:2px 2px #000">${stack.count}</b>`;
  }
  hideGhost(){this.ghost.style.display='none';this.ghost.innerHTML='';}
  dropIntoSlot(stack,sourceSlot,targetSlot){
    const source=this.resolve(sourceSlot);
    const target=this.resolve(targetSlot);
    if(!source||!target||source===target)return;
    const sourceStack=source.stack;
    const targetStack=target.stack;
    if(targetStack.empty()){
      targetStack.id=stack.id;
      targetStack.count=stack.count;
      sourceStack.id=ITEM.AIR;
      sourceStack.count=0;
    }else if(targetStack.id===stack.id){
      const capacity=64-targetStack.count;
      const moved=Math.min(capacity,stack.count);
      targetStack.count+=moved;
      sourceStack.count-=moved;
      sourceStack.normalize();
    }else{
      const oldId=targetStack.id;
      const oldCount=targetStack.count;
      targetStack.id=stack.id;
      targetStack.count=stack.count;
      sourceStack.id=oldId;
      sourceStack.count=oldCount;
    }
    this.game.crafting.update();
    this.game.refreshHotbar();
    iconSanitizer.scan();
    this.game.saveSoon();
  }
  takeFromSource(slot,count){
    const source=this.resolve(slot);if(!source)return;
    source.stack.count-=count;source.stack.normalize();
    this.game.crafting.update();this.game.refreshHotbar();
  }
  dropIntoWorld(stack){
    if(!this.game.drops||stack.empty())return;
    const origin=this.game.player.eyePosition();
    const direction=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.game.player.pitch,this.game.player.yaw,0,'YXZ')).normalize();
    const pos=origin.clone().addScaledVector(direction,1.0);pos.y-=.25;
    this.game.drops.spawn(stack.id,stack.count,pos);
    this.game.saveSoon();
  }
}
const studioInventoryOriginalBindSlots=UI.prototype.bindSlots;
UI.prototype.bindSlots=function(){
  studioInventoryOriginalBindSlots.call(this);
  screenLayer.querySelectorAll('.inv-slot').forEach(el=>{
    if(el.dataset.studioDragBound==='1')return;
    el.dataset.studioDragBound='1';
    el.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      inventoryTransactions.begin(el,e);
    },{passive:false});
  });
  iconSanitizer.scan();
};
const studioOriginalClickSlot=UI.prototype.clickSlot;
UI.prototype.clickSlot=function(slot){
  studioOriginalClickSlot.call(this,slot);
  iconSanitizer.scan();
};
class CraftingOutputGuard {
  constructor(game){this.game=game;}
  take(){
    const result=this.game.crafting.takeOutput();
    if(result){this.game.refreshHotbar();this.game.saveSoon();}
    return result;
  }
  clearGrid(){for(const stack of this.game.crafting.grid){stack.id=ITEM.AIR;stack.count=0;}this.game.crafting.update();}
  preview(){const recipe=this.game.crafting.findRecipe();return recipe?.out?.clone()||new ItemStack();}
}
class VoxelSelectionRenderer {
  constructor(scene){
    this.scene=scene;
    this.mesh=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006,1.006,1.006)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.82,depthTest:false}));
    this.mesh.visible=false;this.mesh.renderOrder=999;scene.add(this.mesh);
  }
  update(hit){
    if(!hit){this.mesh.visible=false;return;}
    this.mesh.visible=true;this.mesh.position.set(hit.x+.5,hit.y+.5,hit.z+.5);
  }
}
class BedrockAnimationAdapter {
  static find(root,names){
    for(const name of names){const node=root?.userData?.bones?.get?.(name)||root?.getObjectByName?.(name);if(node)return node;}
    return null;
  }
  static animateZombie(root,time,speed,attacking=false){
    const leftArm=this.find(root,['leftArm']);
    const rightArm=this.find(root,['rightArm']);
    const leftLeg=this.find(root,['leftLeg']);
    const rightLeg=this.find(root,['rightLeg']);
    const body=this.find(root,['body']);
    const head=this.find(root,['head']);
    const swing=Math.sin(time*8)*.48*clamp(speed/2,0,1);
    if(leftLeg)leftLeg.rotation.x=swing;
    if(rightLeg)rightLeg.rotation.x=-swing;
    if(attacking){
      if(leftArm)leftArm.rotation.x=-1.35;
      if(rightArm)rightArm.rotation.x=-1.35;
    }else{
      if(leftArm)leftArm.rotation.x=-swing*.8;
      if(rightArm)rightArm.rotation.x=swing*.8;
    }
    if(body)body.rotation.z=Math.sin(time*4)*.02;
    if(head)head.rotation.y=0;
  }
  static animateCow(root,time,speed){
    const legs=[this.find(root,['leg0']),this.find(root,['leg1']),this.find(root,['leg2']),this.find(root,['leg3'])];
    const swing=Math.sin(time*7)*.35*clamp(speed/2,0,1);
    if(legs[0])legs[0].rotation.x=swing;
    if(legs[1])legs[1].rotation.x=-swing;
    if(legs[2])legs[2].rotation.x=-swing;
    if(legs[3])legs[3].rotation.x=swing;
  }
}
class StudioMobRenderer {
  constructor(game){this.game=game;this.loading=new Map();}
  async replace(mob){
    const type=mob.type==='cow'?'cow':'zombie';
    if(this.loading.has(type))return this.loading.get(type);
    const promise=this.game.assetPipeline.model(type).then(model=>{
      if(!mob.mesh)return;
      const old=mob.mesh;
      const parent=old.parent;
      if(parent)parent.remove(old);
      mob.mesh=model;
      mob.model=model;
      mob.modelScale=type==='cow'?1.0:1.0;
      model.scale.multiplyScalar(type==='cow'?0.72:0.82);
      model.position.copy(mob.position);
      model.rotation.y=mob.yaw;
      this.game.renderer.scene.add(model);
      return model;
    }).catch(error=>{console.warn('[StudioMobRenderer]',type,error);return null;}).finally(()=>this.loading.delete(type));
    this.loading.set(type,promise);
    return promise;
  }
}
const originalMobSystemSpawn=MobSystem.prototype.spawnAround;
MobSystem.prototype.spawnAround=function(player){
  if(this.mobs.length>=ENGINE.MAX_MOBS)return;
  const a=Math.random()*Math.PI*2;
  const r=22+Math.random()*28;
  const x=Math.floor(player.position.x+Math.cos(a)*r);
  const z=Math.floor(player.position.z+Math.sin(a)*r);
  const y=this.world.highestSolidY(x,z)+1;
  if(this.world.get(x,y,z)!==BLOCK.AIR)return;
  const type=Math.random()<.62?'zombie':'cow';
  const mob=new Mob(type,new THREE.Vector3(x+.5,y,z+.5));
  mob.createMesh();
  this.scene.add(mob.mesh);
  this.mobs.push(mob);
  this.game?.mobRenderer?.replace(mob);
};
const originalMobSystemUpdate=MobSystem.prototype.update;
MobSystem.prototype.update=function(dt,player){
  originalMobSystemUpdate.call(this,dt,player);
  for(let i=this.mobs.length-1;i>=0;i--){
    const mob=this.mobs[i];
    if(mob.health<=0){
      const pos=mob.position.clone();
      this.scene.remove(mob.mesh);
      if(this.game?.drops){
        const dropId=mob.type==='zombie'?(ITEM.BREAD||ITEM.AIR):(ITEM.BEEF||ITEM.BREAD||ITEM.AIR);
        if(dropId)this.game.drops.spawn(dropId,1,pos);
      }
      this.mobs.splice(i,1);
      continue;
    }
    if(mob.model){
      const speed=Math.hypot(mob.velocity.x,mob.velocity.z);
      if(mob.type==='zombie')BedrockAnimationAdapter.animateZombie(mob.model,mob.age,speed,mob.attack>0);
      else BedrockAnimationAdapter.animateCow(mob.model,mob.age,speed);
      mob.model.traverse(o=>{if(o.isMesh&&o.userData.targeted)o.material.emissive?.set?.(0x331111);});
    }
  }
};
const studioDropFactoryMarker=Symbol('studioDropFactory');
const originalDropSpawn=DropSystem.prototype.spawn;
DropSystem.prototype.spawn=function(id,count,pos){
  if(this.items.length>=ENGINE.MAX_DROPS)return;
  if(!this[studioDropFactoryMarker])this[studioDropFactoryMarker]=new StudioDropMeshFactory(this.world.game?.resolver||game.resolver);
  const d=new DroppedItem(id,count,pos);
  d.physics=new StudioDropPhysics();
  d.mesh=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.34),new THREE.MeshLambertMaterial({color:0x9a9a9a}));
  d.mesh.castShadow=false;d.mesh.receiveShadow=false;d.mesh.userData.itemId=id;
  this.group.add(d.mesh);this.items.push(d);
  this[studioDropFactoryMarker].upgrade(d.mesh,id);
};
const originalDropUpdate=DropSystem.prototype.update;
DropSystem.prototype.update=function(dt,player,inventory){
  for(let i=this.items.length-1;i>=0;i--){
    const d=this.items[i];
    if(d.physics)d.physics.update(d,this.world,player,dt);
    else d.update(dt,this.world);
    if(d.pickupDelay<=0&&d.position.distanceTo(player.position)<1.25){
      const before=d.count;
      const left=inventory.add(d.id,d.count);
      d.count=left;
      if(left<before){this.group.remove(d.mesh);this.items.splice(i,1);continue;}
    }
    if(d.age>300){this.group.remove(d.mesh);this.items.splice(i,1);}
  }
};
const USER_REPO_ICON_MAP=Object.freeze({
  grass:`${USER_ASSET_RAW}grass.png`,
  dirt:`${USER_ASSET_RAW}dirt.png`,
  stone:`${USER_ASSET_RAW}stone.png`,
  sand:`${USER_ASSET_RAW}sand.png`,
  snow:`${USER_ASSET_RAW}snow.png`,
  leaves:`${USER_ASSET_RAW}leaves.png`,
  oak_log:`${USER_ASSET_RAW}log_oak.png`,
  oak_log_top:`${USER_ASSET_RAW}log_oak_top.png`,
  oak_planks:`${USER_ASSET_RAW}tree_side.png`,
  crafting_table:`${USER_ASSET_RAW}crafting_table.png`,
  pickaxe:`${USER_ASSET_RAW}pickaxe.png`,
  diamond_pickaxe:`${USER_ASSET_RAW}diamond_pickaxe.png`,
  iron_pickaxe:`${USER_ASSET_RAW}iron_pickaxe.png`,
  gold_pickaxe:`${USER_ASSET_RAW}gold_pickaxe.png`,
  stone_pickaxe:`${USER_ASSET_RAW}stone_pickaxe.png`,
  wood_pickaxe:`${USER_ASSET_RAW}wood_pickaxe.png`,
});
const studioOriginalIconFor=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){
  if(!id||id===ITEM.AIR)return '';
  const name=(BLOCK_NAME[id]||ITEM_NAME.get(id)||'missing').toLowerCase().replace(/ /g,'_');
  const key=name.replace('minecraft:','');
  const user=USER_REPO_ICON_MAP[key];
  if(user)return user;
  return studioOriginalIconFor.call(this,id);
};
const originalGameBoot=Game.prototype.boot;
Game.prototype.boot=async function(mode='survival',fresh=false){
  if(!this.assetPipeline){
    this.assetPipeline=new StudioAssetPipeline(this.assets);
    this.mobRenderer=new StudioMobRenderer(this);
  }
  this.setLoading(true,2,'Opening asset cache…');
  await this.assets.init();
  await this.assetPipeline.prefetch((i,n,url)=>{
    const pct=2+(i/n)*12;
    this.setLoading(true,pct,`Caching game data ${i}/${n}`);
  });
  await originalGameBoot.call(this,mode,fresh);
  this.mobs.game=this;
  this.world.game=this;
  this.drops.game=this;
};
const originalTextureCandidates=AssetResolver.prototype.textureCandidates;
AssetResolver.prototype.textureCandidates=function(name){
  const remote=originalTextureCandidates.call(this,name);
  const clean=name.replace(/^textures\//,'').replace(/\.png$/,'');
  const leaf=clean.split('/').pop();
  const userCandidates=[
    `${USER_ASSET_RAW}${leaf}.png`,
    `${USER_ASSET_RAW}${clean}.png`,
    `${USER_ASSET_RAW}${leaf.replace(/^item_/,'')}.png`
  ];
  return [...new Set([...remote,...userCandidates])];
};
class ModelTranslationRegistry {
  constructor(){
    this.entries=new Map();
    this.register('minecraft:zombie',{entity:'zombie',geometry:'models/entity/zombie.geo.json',texture:'textures/entity/zombie/zombie.png'});
    this.register('minecraft:cow',{entity:'cow',geometry:'models/entity/cow.geo.json',texture:'textures/entity/cow/cow_v2.png'});
  }
  register(identifier,record){this.entries.set(identifier,{identifier,...record});}
  get(identifier){return this.entries.get(identifier)||null;}
  has(identifier){return this.entries.has(identifier);}
  all(){return [...this.entries.values()];}
}
const modelTranslationRegistry=new ModelTranslationRegistry();
class StudioChunkScheduler {
  constructor(world,renderer){this.world=world;this.renderer=renderer;this.queue=[];this.set=new Set();this.maxPerFrame=1;}
  enqueue(chunk){const key=chunkKey(chunk.cx,chunk.cz);if(this.set.has(key))return;this.set.add(key);this.queue.push(chunk);}
  enqueueNeighbors(chunk){for(const [dx,dz] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const c=this.world.getChunk(chunk.cx+dx,chunk.cz+dz);if(c)this.enqueue(c);}}
  tick(){let n=0;while(n<this.maxPerFrame&&this.queue.length){const c=this.queue.shift();this.set.delete(chunkKey(c.cx,c.cz));if(c.dirty)this.renderer.rebuildChunk(c);n++;}}
  clear(){this.queue.length=0;this.set.clear();}
}
class StudioRendererPolicy {
  constructor(){this.mobileDpr=2.0;this.desktopDpr=2.0;}
  dpr(){return matchMedia('(pointer:coarse)').matches?this.mobileDpr:this.desktopDpr;}
  apply(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.dpr()));}
}
const studioRendererPolicy=new StudioRendererPolicy();
const originalRendererResize=VoxelRenderer.prototype.resize;
VoxelRenderer.prototype.resize=function(){
  originalRendererResize.call(this);
  studioRendererPolicy.apply(this.renderer);
};
class RenderStateValidator {
  constructor(){this.failures=[];this.last=0;}
  inspect(renderer){
    if(!renderer?.renderer)return false;
    if(renderer.renderer.isWebGPURenderer)return true;
    const gl=renderer.renderer.getContext?.();
    if(!gl)return true;
    const lost=gl.isContextLost?.();
    if(lost)this.failures.push({time:performance.now(),reason:'webgl-context-lost'});
    return !lost;
  }
  summary(){return {failures:this.failures.length,last:this.failures.at(-1)||null};}
}
class FixedStepClock {
  constructor(step=1/60,maxSteps=4){this.step=step;this.maxSteps=maxSteps;this.accumulator=0;this.total=0;}
  advance(dt,callback){
    this.accumulator+=Math.min(dt,.1);
    let steps=0;
    while(this.accumulator>=this.step&&steps<this.maxSteps){callback(this.step);this.accumulator-=this.step;this.total+=this.step;steps++;}
    if(steps===this.maxSteps&&this.accumulator>this.step)this.accumulator=this.step;
    return steps;
  }
}
class CollisionProbeCache {
  constructor(world){this.world=world;this.cache=new Map();this.frame=0;}
  key(x,y,z){return `${x},${y},${z}`;}
  beginFrame(){this.frame++;this.cache.clear();}
  solid(x,y,z){const key=this.key(x,y,z);if(this.cache.has(key))return this.cache.get(key);const result=SOLID_BLOCKS.has(this.world.getLoaded(x,y,z));this.cache.set(key,result);return result;}
  box(minX,maxX,minY,maxY,minZ,maxZ){
    for(let y=Math.floor(minY);y<=Math.floor(maxY-1e-5);y++)for(let z=Math.floor(minZ);z<=Math.floor(maxZ-1e-5);z++)for(let x=Math.floor(minX);x<=Math.floor(maxX-1e-5);x++)if(this.solid(x,y,z))return true;
    return false;
  }
}
class TouchTargetAuditor {
  constructor(){this.minimum=44;this.records=[];}
  inspect(){
    this.records=[];
    document.querySelectorAll('button,.hot-slot,.inv-slot').forEach(el=>{
      const r=el.getBoundingClientRect();
      this.records.push({id:el.id||el.dataset.slot||el.className,width:r.width,height:r.height,valid:r.width>=this.minimum&&r.height>=this.minimum});
    });
    return this.records;
  }
  invalid(){return this.records.filter(x=>!x.valid);}
}
class ControlAccessibility {
  install(){
    const labels={jumpBtn:'Jump',useBtn:'Use or place selected item',breakBtn:'Attack or mine',invBtn:'Open inventory',craftBtn:'Open crafting'};
    for(const [id,label] of Object.entries(labels)){const el=$(id);if(el){el.setAttribute('aria-label',label);el.setAttribute('role','button');}}
  }
}
class GameSnapshotter {
  constructor(game){this.game=game;this.sequence=0;}
  capture(){
    const g=this.game;
    return {sequence:++this.sequence,time:Date.now(),mode:g.mode,seed:g.seed,player:g.player?{x:g.player.position.x,y:g.player.position.y,z:g.player.position.z,yaw:g.player.yaw,pitch:g.player.pitch,health:g.player.health}:null,inventory:g.inventory?.serialize?.()||[],drops:g.drops?.items?.length||0,mobs:g.mobs?.mobs?.length||0,chunks:g.renderer?.stats?.chunks||0};
  }
}
class StudioAssetTelemetry {
  constructor(cache){this.cache=cache;this.events=[];}
  record(type,url,ok,detail=''){this.events.push({type,url,ok,detail,time:performance.now()});if(this.events.length>500)this.events.shift();}
  failures(){return this.events.filter(e=>!e.ok);}
  successes(){return this.events.filter(e=>e.ok);}
  summary(){return {total:this.events.length,success:this.successes().length,failed:this.failures().length};}
}
class AssetUrlPolicy {
  constructor(){this.allowedHosts=new Set(['raw.githubusercontent.com']);}
  normalize(url){
    try{const u=new URL(url,location.href);if(u.protocol!=='https:'&&u.protocol!=='http:')return null;if(u.hostname==='localhost'||u.hostname==='127.0.0.1')return u.href;if(!this.allowedHosts.has(u.hostname))return null;return u.href;}catch{return null;}
  }
  isAllowed(url){return !!this.normalize(url);}
}
class ModelInstancePool {
  constructor(){this.templates=new Map();this.active=new Set();this.free=new Map();}
  register(key,template){this.templates.set(key,template);this.free.set(key,[]);}
  acquire(key){
    const pool=this.free.get(key)||[];
    const instance=pool.pop()||this.templates.get(key)?.clone(true);
    if(instance)this.active.add(instance);
    return instance||null;
  }
  release(key,instance){if(!instance)return;instance.visible=false;this.active.delete(instance);if(!this.free.has(key))this.free.set(key,[]);this.free.get(key).push(instance);}
  clear(){for(const instance of this.active)instance.traverse(o=>{if(o.geometry)o.geometry.dispose?.();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)m.dispose?.();}});this.active.clear();this.free.clear();this.templates.clear();}
}
class EntityTargetCache {
  constructor(){this.boxes=new Map();this.frame=-1;}
  begin(frame){if(frame!==this.frame){this.frame=frame;this.boxes.clear();}}
  box(mob){if(this.boxes.has(mob))return this.boxes.get(mob);const box=new THREE.Box3().setFromObject(mob.mesh);this.boxes.set(mob,box);return box;}
}
class AttackSwingController {
  constructor(){this.time=0;this.active=false;this.duration=.24;}
  trigger(){this.time=0;this.active=true;}
  update(dt){if(!this.active)return;this.time+=dt;if(this.time>=this.duration){this.active=false;this.time=this.duration;}}
  amount(){if(!this.active)return 0;const t=clamp(this.time/this.duration,0,1);return Math.sin(t*Math.PI);}
}
class ItemStackValidator {
  validate(stack){
    if(!stack)return false;
    if(!Number.isInteger(stack.id)||!Number.isInteger(stack.count))return false;
    if(stack.count<0||stack.count>64)return false;
    if(stack.count===0&&stack.id!==ITEM.AIR)return false;
    return true;
  }
  normalize(stack){if(!this.validate(stack)){stack.id=ITEM.AIR;stack.count=0;}return stack;}
  inventory(inventory){for(const stack of inventory.slots)this.normalize(stack);this.normalize(inventory.cursor);}
}
class DropTransactionValidator {
  canDrop(game,stack){return !!game.running&&!!game.player&&!!stack&&!stack.empty()&&stack.count<=64;}
  position(game){const p=game.player.eyePosition();const d=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(game.player.pitch,game.player.yaw,0,'YXZ')).normalize();return p.addScaledVector(d,1.05);}
}
class WorldBoundaryGuard {
  constructor(){this.minY=ENGINE.MIN_Y;this.maxY=ENGINE.WORLD_HEIGHT-1;}
  clampPlayer(player){player.position.y=clamp(player.position.y,this.minY+.2,this.maxY);}
  valid(x,y,z){return Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z)&&y>=this.minY&&y<ENGINE.WORLD_HEIGHT;}
}
class CameraStabilityController {
  constructor(camera){this.camera=camera;this.lastPosition=new THREE.Vector3();this.initialized=false;}
  update(player){
    if(!player||!this.camera)return;
    this.camera.position.set(player.position.x,player.position.y+ENGINE.EYE_HEIGHT,player.position.z);
    this.camera.rotation.order='YXZ';
    this.camera.rotation.y=player.yaw;
    this.camera.rotation.x=clamp(player.pitch,-1.50,1.50);
    this.camera.rotation.z=0;
    this.camera.updateMatrixWorld();
  }
}
class ChunkLoadBudget {
  constructor(){this.maxBuilds=1;this.maxLoads=1;this.elapsed=0;}
  beginFrame(dt){this.elapsed+=dt;}
  allowBuild(index){return index<this.maxBuilds;}
  allowLoad(index){return index<this.maxLoads;}
}
class VisibilityPolicy {
  constructor(){this.near=3;this.far=5;this.entity=48;}
  chunkDistance(cx,cz,player){const x=cx*ENGINE.CHUNK_SIZE+8,z=cz*ENGINE.CHUNK_SIZE+8;return Math.hypot(x-player.position.x,z-player.position.z)/ENGINE.CHUNK_SIZE;}
  shouldKeep(cx,cz,player){return this.chunkDistance(cx,cz,player)<=this.far;}
  shouldSimulateMob(mob,player){return mob.position.distanceTo(player.position)<=this.entity;}
}
class HotbarController {
  constructor(game){this.game=game;this.last=0;}
  select(index){if(index<0||index>=9)return;this.game.inventory.selected=index;this.last=index;this.game.refreshHotbar();}
  next(delta){this.select(mod(this.last+delta,9));}
}
class ActionDebouncer {
  constructor(){this.last=new Map();}
  allow(name,interval){const t=performance.now();const previous=this.last.get(name)||-Infinity;if(t-previous<interval)return false;this.last.set(name,t);return true;}
  reset(){this.last.clear();}
}
class GameplayJournal {
  constructor(max=400){this.max=max;this.entries=[];}
  push(type,data){this.entries.push({type,data,time:performance.now()});if(this.entries.length>this.max)this.entries.shift();}
  last(type){for(let i=this.entries.length-1;i>=0;i--)if(this.entries[i].type===type)return this.entries[i];return null;}
  clear(){this.entries.length=0;}
}
class StudioDebugReport {
  constructor(game){this.game=game;}
  build(){
    const g=this.game;
    return [
      `Studio build: ${STUDIO_BUILD.version}`,
      `Three.js: ${ENGINE.THREE_VERSION}`,
      `Mode: ${g.mode}`,
      `Seed: ${g.seed}`,
      `Player: ${g.player?.position.x.toFixed(2)}, ${g.player?.position.y.toFixed(2)}, ${g.player?.position.z.toFixed(2)}`,
      `Velocity: ${g.player?.velocity.x.toFixed(2)}, ${g.player?.velocity.y.toFixed(2)}, ${g.player?.velocity.z.toFixed(2)}`,
      `Grounded: ${!!g.player?.onGround}`,
      `Chunks: ${g.renderer?.stats?.chunks||0}`,
      `Mobs: ${g.mobs?.mobs?.length||0}`,
      `Drops: ${g.drops?.items?.length||0}`,
      `Asset cache: ${g.assets?.stats?.cached||0} hits / ${g.assets?.stats?.failed||0} failures`,
      `Model registry: ${modelTranslationRegistry.all().length}`
    ].join('\n');
  }
}
const inventoryValidator=new ItemStackValidator();
const dropTransactionValidator=new DropTransactionValidator();
const worldBoundaryGuard=new WorldBoundaryGuard();
const actionDebouncer=new ActionDebouncer();
const gameplayJournal=new GameplayJournal();
const studioDebugReport=new StudioDebugReport(game);
const studioPointerInput=new StudioInputRouter();
const inventoryTransactions=new InventoryTransactionEngine(game);
screenLayer.addEventListener('pointerdown',e=>{
  const slot=e.target?.closest?.('[data-slot]');
  if(!slot||slot.dataset.slot==='o')return;
  if(inventoryTransactions.begin(slot,e)){
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},{capture:true,passive:false});
const craftingOutputGuard=new CraftingOutputGuard(game);
const touchTargetAuditor=new TouchTargetAuditor();
const controlAccessibility=new ControlAccessibility();
const gameSnapshotter=new GameSnapshotter(game);
const renderStateValidator=new RenderStateValidator();
const fixedStepClock=new FixedStepClock();
const hotbarController=new HotbarController(game);
const attackSwingController=new AttackSwingController();
controlAccessibility.install();
game.combat=new CombatSystem(game);
game.assetPipeline=new StudioAssetPipeline(game.assets);
game.mobRenderer=new StudioMobRenderer(game);
game.snapshotter=gameSnapshotter;
game.renderValidator=renderStateValidator;
game.journal=gameplayJournal;
game.movementModel=studioMovement;
game.boundaryGuard=worldBoundaryGuard;
const originalGameMine=Game.prototype.mine;
Game.prototype.mine=function(dt){
  if(this.combat&&this._studioAttackMode){
    targetFeedback.update('',0);
    return;
  }
  originalGameMine.call(this,dt);
};
const originalGameBeginBreak=Game.prototype.beginBreak;
Game.prototype.beginBreak=function(){
  const target=this.combat?.target?.();
  if(target){this._studioAttackMode=true;this._studioBreakMode=false;this.combat.attack();attackSwingController.trigger();gameplayJournal.push('attack',{mob:target.type});return;}
  this._studioBreakMode=true;
  originalGameBeginBreak.call(this);
};
const originalGameEndBreak=Game.prototype.endBreak;
Game.prototype.endBreak=function(){
  this._studioBreakMode=false;
  originalGameEndBreak.call(this);
  targetFeedback.update('',0);
};
class TargetHighlightService {
  constructor(game){this.game=game;this.renderer=null;}
  attach(){if(!this.renderer&&this.game.renderer)this.renderer=new VoxelSelectionRenderer(this.game.renderer.scene);}
  update(){
    if(!this.game.running||this.game.ui.screen){this.renderer?.update(null);return;}
    this.attach();
    const mob=this.game.combat?.target?.();
    if(mob){this.renderer?.update(null);return;}
    const hit=this.game.getTarget?.();
    this.renderer?.update(hit||null);
  }
}
const targetHighlightService=new TargetHighlightService(game);
class CleanIconPreloader {
  constructor(game){this.game=game;this.urls=new Map();this.queue=[];this.running=false;}
  enqueue(id){if(!id||this.urls.has(id))return;this.queue.push(id);}
  async run(){
    if(this.running)return;
    this.running=true;
    while(this.queue.length){
      const id=this.queue.shift();
      const url=this.game.iconFor(id);
      if(!url)continue;
      const clean=await backgroundRemover.cleanUrl(url);
      this.urls.set(id,clean);
    }
    this.running=false;
  }
  get(id){return this.urls.get(id)||this.game.iconFor(id);}
}
const cleanIconPreloader=new CleanIconPreloader(game);
const originalRefreshHotbar=Game.prototype.refreshHotbar;
Game.prototype.refreshHotbar=function(){
  originalRefreshHotbar.call(this);
  iconSanitizer.scan();
  for(const stack of this.inventory.slots)if(stack&&!stack.empty())cleanIconPreloader.enqueue(stack.id);
  cleanIconPreloader.run();
};
const originalToggleInventory=Game.prototype.toggleInventory;
Game.prototype.toggleInventory=function(){
  this._studioAttackMode=false;
  this._studioBreakMode=false;
  this.endBreak();
  originalToggleInventory.call(this);
  iconSanitizer.scan();
};
const originalSave=Game.prototype.save;
Game.prototype.save=async function(){
  inventoryValidator.inventory(this.inventory);
  worldBoundaryGuard.clampPlayer(this.player);
  return originalSave.call(this);
};
const originalGameLoop=Game.prototype.loop;
Game.prototype.loop=function(t){
  if(!this.running)return;
  targetHighlightService.update();
  attackSwingController.update(Math.min(.05,(t-(this._studioLastFrame||t))/1000));
  this._studioLastFrame=t;
  originalGameLoop.call(this,t);
};
class ModelHealthReport {
  constructor(pipeline){this.pipeline=pipeline;this.records=new Map();}
  record(type,ok,detail=''){this.records.set(type,{type,ok,detail,time:Date.now()});}
  summary(){return [...this.records.values()];}
}
const modelHealthReport=new ModelHealthReport(game.assetPipeline);
class EntityPrefetchAdapter {
  constructor(cache){this.cache=cache;this.types=['zombie','cow'];}
  urls(type){
    return [
      `${BEDROCK_RAW}resource_pack/entity/${type}.entity.json`,
      `${BEDROCK_RAW}resource_pack/models/entity/${type}.geo.json`
    ];
  }
  async warm(){
    for(const type of this.types){
      for(const url of this.urls(type)){try{await this.cache.text(url);modelHealthReport.record(type,true,url);}catch(error){modelHealthReport.record(type,false,String(error));}}
    }
  }
}
class TranslationDiagnostics {
  constructor(translator){this.translator=translator;}
  async inspect(type){
    try{
      const entity=await this.translator.clientEntity(type);
      const geometry=await this.translator.geometry(type);
      const selected=this.translator.chooseGeometry(entity,geometry);
      return {type,identifier:entity?.['minecraft:client_entity']?.description?.identifier,geometry:selected.name,bones:selected.data?.bones?.length||0};
    }catch(error){return {type,error:String(error)};}
  }
}
class TextureAlphaPolicy {
  constructor(){this.alphaTest=.08;this.leafAlpha=.48;this.backgroundThreshold=34;}
  material(texture,transparent=false){return new THREE.MeshLambertMaterial({map:texture,transparent,alphaTest:transparent?this.leafAlpha:this.alphaTest});}
  isTransparentTexture(name){return /leaf|leaves|flower|grass|vine|torch|glass|sapling/i.test(name);}
}
const textureAlphaPolicy=new TextureAlphaPolicy();
class FirstPersonPolicy {
  constructor(){this.fov=70;this.near=.05;this.far=320;}
  apply(camera){camera.fov=this.fov;camera.near=this.near;camera.far=this.far;camera.updateProjectionMatrix();}
}
const firstPersonPolicy=new FirstPersonPolicy();
class MobileSafeAreaPolicy {
  install(){
    document.documentElement.style.setProperty('--safe-top','env(safe-area-inset-top, 0px)');
    document.documentElement.style.setProperty('--safe-right','env(safe-area-inset-right, 0px)');
    document.documentElement.style.setProperty('--safe-bottom','env(safe-area-inset-bottom, 0px)');
    document.documentElement.style.setProperty('--safe-left','env(safe-area-inset-left, 0px)');
  }
}
new MobileSafeAreaPolicy().install();
class InputLatencyTelemetry {
  constructor(){this.samples=[];}
  record(start){const latency=performance.now()-start;this.samples.push(latency);if(this.samples.length>120)this.samples.shift();}
  average(){return this.samples.length?this.samples.reduce((a,b)=>a+b,0)/this.samples.length:0;}
  p95(){if(!this.samples.length)return 0;const s=[...this.samples].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*.95))];}
}
const inputLatencyTelemetry=new InputLatencyTelemetry();
class PointerDiagnostics {
  constructor(){this.events=0;this.cancels=0;this.lost=0;}
  install(){
    for(const type of ['pointerdown','pointerup','pointermove','pointercancel','lostpointercapture'])document.addEventListener(type,e=>{this.events++;if(type==='pointercancel')this.cancels++;if(type==='lostpointercapture')this.lost++;},{passive:true});
  }
}
const pointerDiagnostics=new PointerDiagnostics();
pointerDiagnostics.install();
class InteractionPolicy {
  constructor(){this.blockReach=6;this.entityReach=4.5;this.placeCooldown=.08;this.lastPlace=0;}
  canPlace(){const t=performance.now();if(t-this.lastPlace<this.placeCooldown)return false;this.lastPlace=t;return true;}
  canAttack(){return true;}
}
const interactionPolicy=new InteractionPolicy();
class InventoryDropPolicy {
  constructor(){this.maxStack=64;this.worldDropDistance=1.05;}
  validate(stack){return stack&&stack.id!==ITEM.AIR&&stack.count>0&&stack.count<=this.maxStack;}
  position(game){return dropTransactionValidator.position(game);}
}
const inventoryDropPolicy=new InventoryDropPolicy();
const originalCraftTakeOutput=Crafting.prototype.takeOutput;
Crafting.prototype.takeOutput=function(){
  const recipe=this.findRecipe();
  const result=originalCraftTakeOutput.call(this);
  if(result)gameplayJournal.push('craft',{recipe:recipe?.name||'unknown',output:recipe?.out?.id||0});
  return result;
};
const originalGameMineForJournal=Game.prototype.mine;
Game.prototype.mine=function(dt){
  const before=this.player?.breaking;
  originalGameMineForJournal.call(this,dt);
  if(before&&this.player?.breaking===null)gameplayJournal.push('block_break',{key:before});
};
const originalUseSelected=Game.prototype.useSelected;
Game.prototype.useSelected=function(){
  const hit=this.getTarget?.();
  const result=originalUseSelected.call(this);
  if(result!==false&&hit)gameplayJournal.push('use',{x:hit.place?.x,y:hit.place?.y,z:hit.place?.z});
  return result;
};
const originalAssetFetch=AssetCache.prototype.fetch;
AssetCache.prototype.fetch=async function(url,options={}){
  const started=performance.now();
  try{const result=await originalAssetFetch.call(this,url,options);game.assetTelemetry?.record('asset',url,true,`${(performance.now()-started).toFixed(1)}ms`);return result;}
  catch(error){game.assetTelemetry?.record('asset',url,false,String(error));throw error;}
};
class LoadingProgressModel {
  constructor(){this.total=0;this.complete=0;this.label='';}
  begin(total){this.total=total;this.complete=0;}
  step(label){this.complete++;this.label=label;}
  percent(){return this.total?this.complete/this.total*100:0;}
}
const loadingProgressModel=new LoadingProgressModel();
class CacheHealthService {
  constructor(){this.names=[];this.lastCheck=0;}
  async inspect(){
    if(!('caches' in window))return {supported:false};
    const names=await caches.keys();this.names=names;this.lastCheck=Date.now();
    return {supported:true,count:names.length,names};
  }
}
const cacheHealthService=new CacheHealthService();
class ResourcePackCompatibility {
  constructor(){this.checks=[];}
  check(name,value){this.checks.push({name,value:!!value});return !!value;}
  summary(){return this.checks.reduce((a,c)=>{a[c.name]=c.value;return a;},{});}
}
const resourcePackCompatibility=new ResourcePackCompatibility();
class ModelUvValidator {
  validateGeometry(def){
    const width=def?.texturewidth||64,height=def?.textureheight||32;
    let cubes=0,invalid=0;
    for(const bone of def?.bones||[])for(const cube of bone.cubes||[]){cubes++;const uv=cube.uv||[0,0];if(uv[0]<0||uv[1]<0||uv[0]>width||uv[1]>height)invalid++;}
    return {width,height,cubes,invalid};
  }
}
class EntityLodPolicy {
  constructor(){this.near=24;this.medium=48;}
  level(distance){if(distance<=this.near)return 0;if(distance<=this.medium)return 1;return 2;}
  apply(model,level){model.visible=level<2;model.traverse(o=>{if(o.isMesh)o.visible=level<2;});}
}
const entityLodPolicy=new EntityLodPolicy();
class MobThinkingBudget {
  constructor(){this.maxPerFrame=6;this.cursor=0;}
  choose(mobs){
    if(!mobs.length)return [];
    const out=[];for(let i=0;i<Math.min(this.maxPerFrame,mobs.length);i++)out.push(mobs[(this.cursor+i)%mobs.length]);
    this.cursor=(this.cursor+this.maxPerFrame)%mobs.length;return out;
  }
}
const mobThinkingBudget=new MobThinkingBudget();
class DamageCooldownPolicy {
  constructor(){this.invulnerable=.65;this.timer=0;}
  update(dt){this.timer=Math.max(0,this.timer-dt);}
  canTake(){return this.timer<=0;}
  apply(){this.timer=this.invulnerable;}
}
const damageCooldownPolicy=new DamageCooldownPolicy();
const originalMobDamageUpdate=Mob.prototype.update;
Mob.prototype.update=function(dt,world,player){
  const before=this.attack;
  originalMobDamageUpdate.call(this,dt,world,player);
  if(before<=0&&this.attack>0&&damageCooldownPolicy.canTake()){damageCooldownPolicy.apply();}
};
const originalGameUpdateStudio=Game.prototype.update;
Game.prototype.update=function(dt){
  damageCooldownPolicy.update(dt);
  originalGameUpdateStudio.call(this,dt);
  worldBoundaryGuard.clampPlayer(this.player);
  inventoryValidator.inventory(this.inventory);
  inputLatencyTelemetry.record(this._studioInputStamp||performance.now());
};
game.assetTelemetry=new StudioAssetTelemetry(game.assets);
const originalAssetPipelinePrefetch=StudioAssetPipeline.prototype.prefetch;
StudioAssetPipeline.prototype.prefetch=async function(progress=()=>{}){
  const result=await originalAssetPipelinePrefetch.call(this,progress);
  try{await this.models.clientEntity('zombie');}catch{}
  try{await this.models.geometry('zombie');}catch{}
  return result;
};
window.StudioMinecraft={
  build:STUDIO_BUILD,
  game,
  input:studioPointerInput,
  combat:()=>game.combat,
  assets:()=>game.assetPipeline,
  models:modelTranslationRegistry,
  telemetry:()=>game.assetTelemetry,
  snapshot:()=>gameSnapshotter.capture(),
  debug:()=>studioDebugReport.build(),
  cacheHealth:()=>cacheHealthService.inspect(),
  touchAudit:()=>touchTargetAuditor.inspect(),
  modelDiagnostics:type=>new TranslationDiagnostics(game.assetPipeline.models).inspect(type),
  compatibility:()=>resourcePackCompatibility.summary()
};
const studioStyle=document.createElement('style');
studioStyle.textContent=`
  #hud,#mobileControls,#lookSurface,#screenLayer,.actionBtn,#movePad,#hotbar{touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
  .actionBtn{will-change:transform;background:rgba(30,30,30,.34);backdrop-filter:blur(2px)}
  .actionBtn.pressed{outline:2px solid rgba(255,255,255,.55);outline-offset:1px}
  .inv-slot,.hot-slot{touch-action:none;-webkit-user-select:none;user-select:none}
  #studioDragGhost img{pointer-events:none;-webkit-user-drag:none}
`;
document.head.appendChild(studioStyle);
const STUDIO_ASSET_CANDIDATES=[];
function registerStudioAssetCandidate(id,paths){STUDIO_ASSET_CANDIDATES.push({id,paths:[...paths]});}
registerStudioAssetCandidate('minecraft:grass_block',['textures/blocks/grass_top.png','textures/blocks/grass_side.png']);registerStudioAssetCandidate('minecraft:dirt',['textures/blocks/dirt.png']);registerStudioAssetCandidate('minecraft:stone',['textures/blocks/stone.png']);registerStudioAssetCandidate('minecraft:oak_log',['textures/blocks/log_oak.png','textures/blocks/log_oak_top.png']);registerStudioAssetCandidate('minecraft:oak_leaves',['textures/blocks/leaves_oak_opaque.png']);registerStudioAssetCandidate('minecraft:oak_planks',['textures/blocks/planks_oak.png']);registerStudioAssetCandidate('minecraft:crafting_table',['textures/blocks/crafting_table_top.png','textures/blocks/crafting_table_side.png']);registerStudioAssetCandidate('minecraft:furnace',['textures/blocks/furnace_front_off.png','textures/blocks/furnace_side.png']);registerStudioAssetCandidate('minecraft:torch',['textures/blocks/torch_on.png']);registerStudioAssetCandidate('minecraft:tools',['textures/items/wood_pickaxe.png','textures/items/stone_pickaxe.png','textures/items/iron_pickaxe.png','textures/items/wood_axe.png','textures/items/shears.png']);registerStudioAssetCandidate('minecraft:zombie',['entity/zombie.entity.json','models/entity/zombie.geo.json']);registerStudioAssetCandidate('minecraft:creeper',['entity/creeper.entity.json','models/entity/creeper.geo.json']);registerStudioAssetCandidate('minecraft:chicken',['entity/chicken.entity.json','models/entity/chicken.geo.json']);registerStudioAssetCandidate('minecraft:cow',['entity/cow.entity.json','models/entity/cow.geo.json']);registerStudioAssetCandidate('minecraft:pig',['entity/pig.entity.json','models/entity/pig.geo.json']);registerStudioAssetCandidate('minecraft:sheep',['entity/sheep.entity.json','models/entity/sheep.geo.json']);
class StudioAssetCandidateIndex {
  constructor(records){
    this.records=records;
    this.byId=new Map(records.map(r=>[r.id,r]));
    this.byLeaf=new Map();
    for(const record of records){
      for(const path of record.paths){
        const leaf=path.split('/').pop().replace(/\.png$|\.json$|\.geo\.json$/,'');
        if(!this.byLeaf.has(leaf))this.byLeaf.set(leaf,[]);
        this.byLeaf.get(leaf).push(record);
      }
    }
  }
  get(id){return this.byId.get(id)||null;}
  findLeaf(name){return this.byLeaf.get(name)||[];}
  search(prefix){const p=prefix.toLowerCase();return this.records.filter(r=>r.id.toLowerCase().includes(p));}
  size(){return this.records.length;}
}
const studioAssetCandidateIndex=new StudioAssetCandidateIndex(STUDIO_ASSET_CANDIDATES);
class StudioValidationSuite {
  constructor(game){this.game=game;this.results=[];}
  check(name,fn){
    try{const value=fn();const ok=value!==false;this.results.push({name,ok,value});return ok;}
    catch(error){this.results.push({name,ok:false,error:String(error)});return false;}
  }
  run(){
    this.results=[];
    this.check('Three.js loaded',()=>typeof THREE==='object');
    this.check('Canvas exists',()=>!!canvas);
    this.check('Pointer input installed',()=>!!studioPointerInput);
    this.check('Inventory exists',()=>!!this.game.inventory);
    this.check('Crafting exists',()=>!!this.game.crafting);
    this.check('Mojang model registry',()=>modelTranslationRegistry.size?true:modelTranslationRegistry.all().length>0);
    this.check('Asset candidate index',()=>studioAssetCandidateIndex.size()>0);
    this.check('Selection guard',()=>!!document.body);
    return this.results;
  }
  report(){return this.results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}`).join('\n');}
}
const studioValidation=new StudioValidationSuite(game);
class RuntimeCommandRegistry {
  constructor(){this.commands=new Map();}
  register(name,fn,description=''){this.commands.set(name,{fn,description});}
  execute(name,...args){const command=this.commands.get(name);if(!command)throw new Error(`Unknown command: ${name}`);return command.fn(...args);}
  list(){return [...this.commands.entries()].map(([name,value])=>({name,description:value.description}));}
}
const runtimeCommands=new RuntimeCommandRegistry();
runtimeCommands.register('debug',()=>studioDebugReport.build(),'Return engine diagnostics.');
runtimeCommands.register('snapshot',()=>gameSnapshotter.capture(),'Capture serializable game state.');
runtimeCommands.register('validate',()=>studioValidation.run(),'Run startup validation.');
runtimeCommands.register('cache',()=>cacheHealthService.inspect(),'Inspect browser cache names.');
runtimeCommands.register('assets',()=>({count:studioAssetCandidateIndex.size()}),'Return asset candidate count.');
const BEDROCK_ENTITY_SPECS_V2 = Object.freeze({
  zombie:{entity:['zombie'],geometry:['zombie'],animations:['zombie','humanoid']},
  creeper:{entity:['creeper'],geometry:['creeper'],animations:['creeper']},
  chicken:{entity:['chicken'],geometry:['chicken'],animations:['chicken']},
  cow:{entity:['cow'],geometry:['cow'],animations:['cow','quadruped']},
  pig:{entity:['pig'],geometry:['pig'],animations:['pig','quadruped']},
  sheep:{entity:['sheep'],geometry:['sheep'],animations:['sheep','quadruped']},
  spider:{entity:['spider'],geometry:['spider'],animations:['spider']},
  skeleton:{entity:['skeleton'],geometry:['skeleton'],animations:['skeleton','humanoid']},
  villager:{entity:['villager_v2','villager'],geometry:['villager_v2','villager'],animations:['villager_v2','villager','humanoid']},
  enderman:{entity:['enderman'],geometry:['enderman'],animations:['enderman','humanoid']}
});
class BedrockRepositoryIndexV2 {
  constructor(cache){this.cache=cache;this.treePromise=null;}
  async paths(){
    if(this.treePromise)return this.treePromise;
    this.treePromise=(async()=>{
      try{
        const json=JSON.parse(await this.cache.text(MOJANG_REPO_API));
        return (json.tree||[]).filter(x=>x.type==='blob').map(x=>x.path);
      }catch(error){
        window.__voxelDiag?.log?.(`ENTITY REPO SCAN FAILED: ${error.message}`,'warn');
        return [];
      }
    })();
    return this.treePromise;
  }
  async find(leaves,prefix='resource_pack/'){
    const wanted=new Set(leaves.map(x=>x.toLowerCase()));
    const paths=await this.paths();
    return paths.find(p=>p.startsWith(prefix)&&wanted.has(p.split('/').pop().toLowerCase()))||null;
  }
}
class BedrockUVTranslatorV2 {
  static rect(x,y,w,h,tw,th){
    const u0=x/tw,u1=(x+w)/tw;
    const v0=1-(y+h)/th,v1=1-y/th;
    return {u0,u1,v0,v1};
  }
  static shorthand(cube,tw,th){
    if(!Array.isArray(cube.uv)||cube.uv.length<2)return null;
    const x=Number(cube.uv[0])||0,y=Number(cube.uv[1])||0;
    const size=cube.size||[1,1,1],w=Number(size[0])||1,h=Number(size[1])||1,d=Number(size[2])||1;
    return {
      north:this.rect(x+d,y+d,w,h,tw,th),
      south:this.rect(x+d+w+d,y+d,w,h,tw,th),
      east:this.rect(x+d+w,y+d,d,h,tw,th),
      west:this.rect(x,y+d,d,h,tw,th),
      up:this.rect(x+d,y,w,d,tw,th),
      down:this.rect(x+d+w,y,w,d,tw,th)
    };
  }
  static perFace(cube,tw,th){
    if(!cube.uv||Array.isArray(cube.uv)||typeof cube.uv!=='object')return null;
    const size=cube.size||[1,1,1];
    const dimensions={
      north:[size[0],size[1]],south:[size[0],size[1]],
      east:[size[2],size[1]],west:[size[2],size[1]],
      up:[size[0],size[2]],down:[size[0],size[2]]
    };
    const out={};
    for(const face of ['north','south','east','west','up','down']){
      const record=cube.uv[face];if(!record)continue;
      const uv=Array.isArray(record)?record:(record.uv||[0,0]);
      const uvSize=Array.isArray(record?.uv_size)?record.uv_size:dimensions[face];
      out[face]=this.rect(Number(uv[0])||0,Number(uv[1])||0,Number(uvSize[0])||dimensions[face][0],Number(uvSize[1])||dimensions[face][1],tw,th);
    }
    return out;
  }
  static cube(cube,tw,th){return this.perFace(cube,tw,th)||this.shorthand(cube,tw,th);}
}
class MolangLiteV2 {
  constructor(){this.cache=new Map();this.math=new Proxy({
    sin:v=>Math.sin(THREE.MathUtils.degToRad(Number(v)||0)),
    cos:v=>Math.cos(THREE.MathUtils.degToRad(Number(v)||0)),
    tan:v=>Math.tan(THREE.MathUtils.degToRad(Number(v)||0)),
    asin:v=>THREE.MathUtils.radToDeg(Math.asin(Number(v)||0)),
    acos:v=>THREE.MathUtils.radToDeg(Math.acos(Number(v)||0)),
    atan:v=>THREE.MathUtils.radToDeg(Math.atan(Number(v)||0)),
    atan2:(a,b)=>THREE.MathUtils.radToDeg(Math.atan2(Number(a)||0,Number(b)||0)),
    abs:Math.abs,min:Math.min,max:Math.max,floor:Math.floor,ceil:Math.ceil,round:Math.round,sqrt:Math.sqrt,pow:Math.pow,
    clamp:(v,a,b)=>clamp(Number(v)||0,Number(a)||0,Number(b)||0),
    lerp:(a,b,t)=>lerp(Number(a)||0,Number(b)||0,Number(t)||0),
    inverse_lerp:(a,b,v)=>{a=Number(a)||0;b=Number(b)||0;v=Number(v)||0;return Math.abs(b-a)<1e-9?0:(v-a)/(b-a);},
    pi:Math.PI
  },{get:(o,k)=>k in o?o[k]:0});}
  proxy(data){return new Proxy(data||{},{get:(o,k)=>k in o?o[k]:0});}
  number(value,ctx){
    if(typeof value==='number')return Number.isFinite(value)?value:0;
    if(typeof value!=='string')return Number(value)||0;
    const raw=value.trim();if(!raw)return 0;
    if(!/^[0-9A-Za-z_.$+\-*/%()?:<>=!&|,\s]+$/.test(raw))return 0;
    let fn=this.cache.get(raw);
    if(!fn){
      const expr=raw.replace(/math\./gi,'m.').replace(/query\./gi,'q.').replace(/variable\./gi,'v.').replace(/temp\./gi,'t.').replace(/\bthis\b/g,'0');
      try{fn=new Function('q','v','t','m',`"use strict";return (${expr});`);}catch{return 0;}
      this.cache.set(raw,fn);
    }
    try{const n=fn(this.proxy(ctx.query),this.proxy(ctx.variable),this.proxy(ctx.temp),this.math);return Number.isFinite(Number(n))?Number(n):0;}catch{return 0;}
  }
  vector(value,ctx,scaleDefault=false){
    const base=scaleDefault?[1,1,1]:[0,0,0];
    if(Array.isArray(value))return [0,1,2].map(i=>this.number(value[i]??base[i],ctx));
    if(typeof value==='number'||typeof value==='string'){const n=this.number(value,ctx);return [n,n,n];}
    if(value&&typeof value==='object'){
      if(value.vector!==undefined)return this.vector(value.vector,ctx,scaleDefault);
      if(value.post!==undefined)return this.vector(value.post,ctx,scaleDefault);
      if(value.pre!==undefined)return this.vector(value.pre,ctx,scaleDefault);
    }
    return base.slice();
  }
}
class BedrockAnimationControllerV2 {
  constructor(root,bones,animations,type){
    this.root=root;this.bones=bones;this.animations=animations||{};this.type=type;this.molang=new MolangLiteV2();this.bind=new Map();
    for(const [name,node] of bones){this.bind.set(name,{position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()});}
  }
  reset(){for(const [name,node] of this.bones){const b=this.bind.get(name);if(!b)continue;node.position.copy(b.position);node.rotation.copy(b.rotation);node.scale.copy(b.scale);}}
  animationLength(clip){return Math.max(0,Number(clip?.animation_length)||0);}
  sample(channel,time,ctx,scaleDefault=false){
    if(channel==null)return null;
    if(Array.isArray(channel)||typeof channel==='string'||typeof channel==='number')return this.molang.vector(channel,ctx,scaleDefault);
    if(typeof channel!=='object')return null;
    if(channel.vector!==undefined||channel.pre!==undefined||channel.post!==undefined)return this.molang.vector(channel,ctx,scaleDefault);
    const keys=Object.keys(channel).filter(k=>Number.isFinite(Number(k))).map(Number).sort((a,b)=>a-b);
    if(!keys.length)return this.molang.vector(channel,ctx,scaleDefault);
    if(time<=keys[0])return this.molang.vector(channel[String(keys[0])],ctx,scaleDefault);
    if(time>=keys[keys.length-1])return this.molang.vector(channel[String(keys[keys.length-1])],ctx,scaleDefault);
    let a=keys[0],b=keys[keys.length-1];for(let i=0;i<keys.length-1;i++){if(time>=keys[i]&&time<=keys[i+1]){a=keys[i];b=keys[i+1];break;}}
    const av=channel[String(a)],bv=channel[String(b)];
    const va=this.molang.vector(av?.post??av,ctx,scaleDefault),vb=this.molang.vector(bv?.pre??bv,ctx,scaleDefault);
    const f=b===a?0:clamp((time-a)/(b-a),0,1);return va.map((v,i)=>lerp(v,vb[i],f));
  }
  clipCandidates(state){
    const entries=Object.entries(this.animations);
    const tests=state==='attack'?[/attack/i]:state==='hurt'?[/hurt|damage/i]:state==='fuse'?[/swell|swelling/i]:state==='walk'?[/\.move$/i,/walk/i,/legs/i,/arms_legs/i,/quadruped.*walk/i,/general/i]:[/idle/i,/setup/i,/base_pose/i,/general/i];
    const found=[];for(const re of tests)for(const pair of entries)if(re.test(pair[0])&&!found.includes(pair))found.push(pair);
    return found.slice(0,state==='walk'?2:1);
  }
  applyClip(clip,time,ctx){
    if(!clip?.bones)return;
    const length=this.animationLength(clip);let t=time;
    if(length>0&&clip.loop)t=((time%length)+length)%length;else if(length>0)t=Math.min(time,length);
    ctx.query.anim_time=t;
    for(const [boneName,channels] of Object.entries(clip.bones)){
      const node=this.bones.get(boneName)||this.bones.get(boneName.toLowerCase())||this.root.getObjectByName(boneName);if(!node)continue;
      const bind=this.bind.get(node.userData.bedrockBoneName||node.name)||this.bind.get(boneName);if(!bind)continue;
      const rot=this.sample(channels.rotation,t,ctx,false);if(rot)node.rotation.set(bind.rotation.x+THREE.MathUtils.degToRad(rot[0]),bind.rotation.y+THREE.MathUtils.degToRad(rot[1]),bind.rotation.z+THREE.MathUtils.degToRad(rot[2]));
      const pos=this.sample(channels.position,t,ctx,false);if(pos)node.position.set(bind.position.x+pos[0]/16,bind.position.y+pos[1]/16,bind.position.z+pos[2]/16);
      const scale=this.sample(channels.scale,t,ctx,true);if(scale)node.scale.set(bind.scale.x*scale[0],bind.scale.y*scale[1],bind.scale.z*scale[2]);
    }
  }
  update(state,time,mob){
    this.reset();
    const speed=Math.hypot(mob?.velocity?.x||0,mob?.velocity?.z||0),fuse=clamp((mob?.fuse||0)/(mob?.fuseTime||1.5),0,1);
    const ctx={query:{life_time:mob?.age||time,modified_distance_moved:mob?.distanceWalked||0,ground_speed:speed,is_on_ground:1,attack_time:mob?.attackProgress||0},variable:{
      tcos0:Math.cos((mob?.age||time)*7.2)*32,
      leg_rot:Math.cos((mob?.age||time)*7.2)*34,
      wing_flap:Math.sin((mob?.age||time)*18)*38,
      attack_time:mob?.attackProgress||0,
      swelling_scale1:1+fuse*.18,
      swelling_scale2:1+fuse*.12,
      is_baby:0
    },temp:{}};
    const setup=Object.entries(this.animations).find(([n])=>/setup|base_pose/i.test(n));if(setup)this.applyClip(setup[1],time,ctx);
    for(const [,clip] of this.clipCandidates(state))this.applyClip(clip,time,ctx);
  }
}
class BedrockEntityLoaderV2 {
  constructor(cache){this.cache=cache;this.repo=new BedrockRepositoryIndexV2(cache);this.jsonCache=new Map();this.templateCache=new Map();this.inflight=new Map();this.textureCache=new Map();}
  spec(type){return BEDROCK_ENTITY_SPECS_V2[type]||{entity:[type],geometry:[type],animations:[type]};}
  async jsonURL(url){if(this.jsonCache.has(url))return this.jsonCache.get(url);const value=JSON.parse(await this.cache.text(url));this.jsonCache.set(url,value);return value;}
  async resolve(kind,stems,required=true){
    const suffix=kind==='entity'?'.entity.json':kind==='geometry'?'.geo.json':'.animation.json';
    const folder=kind==='entity'?'resource_pack/entity/':kind==='geometry'?'resource_pack/models/entity/':'resource_pack/animations/';
    const errors=[];
    for(const stem of stems){const url=`${BEDROCK_RAW}${folder}${stem}${suffix}`;try{return {json:await this.jsonURL(url),url,path:`${folder}${stem}${suffix}`};}catch(e){errors.push(`${stem}: ${e.message}`);}}
    const leaves=stems.map(stem=>`${stem}${suffix}`);const found=await this.repo.find(leaves,folder);
    if(found){const url=`${BEDROCK_RAW}${found}`;try{return {json:await this.jsonURL(url),url,path:found};}catch(e){errors.push(`${found}: ${e.message}`);}}
    if(required)throw new Error(`Bedrock ${kind} unavailable (${stems.join(', ')}): ${errors.join(' | ')}`);
    return null;
  }
  geometryDefinitions(json){
    if(Array.isArray(json?.['minecraft:geometry']))return json['minecraft:geometry'].map(g=>({name:g?.description?.identifier||'',data:g}));
    const list=[];for(const [name,data] of Object.entries(json||{}))if(name.startsWith('geometry.'))list.push({name,data});return list;
  }
  chooseGeometry(entityJSON,geometryJSON){
    const description=entityJSON?.['minecraft:client_entity']?.description||{},mapping=description.geometry||{};
    const preferred=mapping.default||Object.values(mapping)[0]||'';const defs=this.geometryDefinitions(geometryJSON);
    if(!defs.length)throw new Error('Geometry JSON contains no minecraft:geometry/bone definition');
    return defs.find(d=>d.name===preferred)||defs.find(d=>preferred&&d.name.endsWith(String(preferred).replace(/^geometry\./,'')))||defs[0];
  }
  texturePath(entityJSON){const map=entityJSON?.['minecraft:client_entity']?.description?.textures||{};const path=map.default||Object.values(map)[0];if(typeof path!=='string'||!path)throw new Error('Entity JSON has no default Mojang texture path');return path;}
  async texture(entityJSON,type){
    const path=this.texturePath(entityJSON),key=`${type}|${path}`;if(this.textureCache.has(key))return this.textureCache.get(key);
    const clean=path.replace(/\.png$/,'');const direct=`${BEDROCK_RAW}resource_pack/${clean}.png`;
    let bmp,url=direct;
    try{bmp=await this.cache.image(direct);}catch(error){
      const leaf=`${clean.split('/').pop()}.png`,found=await this.repo.find([leaf],'resource_pack/textures/');if(!found)throw new Error(`Mojang PNG failed: ${direct} (${error.message})`);url=`${BEDROCK_RAW}${found}`;bmp=await this.cache.image(url);
    }
    const cv=document.createElement('canvas');cv.width=bmp.width;cv.height=bmp.height;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(bmp,0,0);bmp.close?.();
    const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;texture.userData={sourceURL:url,entityType:type,width:cv.width,height:cv.height};
    this.textureCache.set(key,texture);window.__voxelDiag?.log?.(`ENTITY TEXTURE ${type}: ${url} (${cv.width}×${cv.height})`,'ok');return texture;
  }
  material(texture){return new THREE.MeshLambertMaterial({map:texture,color:0xffffff,transparent:true,alphaTest:.01,side:THREE.DoubleSide,depthWrite:true,depthTest:true});}
  addFace(p,n,u,idx,verts,normal,rect,mirror=false){
    if(!rect)return;const base=p.length/3;for(const v of verts)p.push(...v);for(let i=0;i<4;i++)n.push(...normal);
    const ua=mirror?rect.u1:rect.u0,ub=mirror?rect.u0:rect.u1;u.push(ua,rect.v0,ub,rect.v0,ub,rect.v1,ua,rect.v1);idx.push(base,base+1,base+2,base,base+2,base+3);
  }
  cubeMesh(cube,tw,th,material,mirror=false){
    const size=cube.size||[1,1,1],inflate=Number(cube.inflate)||0;
    const hx=(Number(size[0])+inflate*2)/32,hy=(Number(size[1])+inflate*2)/32,hz=(Number(size[2])+inflate*2)/32;
    const uv=BedrockUVTranslatorV2.cube(cube,tw,th);if(!uv)throw new Error('Bedrock UV translation failed: cube has unsupported/missing UV data');
    const p=[],n=[],u=[],idx=[],m=mirror||!!cube.mirror;
    this.addFace(p,n,u,idx,[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],[0,0,1],uv.south,m);
    this.addFace(p,n,u,idx,[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],[0,0,-1],uv.north,m);
    this.addFace(p,n,u,idx,[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],[1,0,0],uv.east,m);
    this.addFace(p,n,u,idx,[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],[-1,0,0],uv.west,m);
    this.addFace(p,n,u,idx,[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]],[0,1,0],uv.up,m);
    this.addFace(p,n,u,idx,[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]],[0,-1,0],uv.down,m);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));geometry.setIndex(idx);geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=true;mesh.userData.bedrockCube=cube;return mesh;
  }
  build(definition,texture,type){
    const root=new THREE.Group();root.name=`Bedrock_${type}`;const bones=new Map(),boneData=new Map();const desc=definition.description||{};
    const tw=Number(desc.texture_width||desc.texturewidth||definition.texturewidth||texture.image?.width||texture.source?.data?.width||64),th=Number(desc.texture_height||desc.textureheight||definition.textureheight||texture.image?.height||texture.source?.data?.height||32);const material=this.material(texture);
    for(const data of definition.bones||[]){const node=new THREE.Group();node.name=data.name;node.userData.bedrockBoneName=data.name;node.userData.bedrockPivot=(data.pivot||[0,0,0]).slice();node.userData.bedrockBone=data;bones.set(data.name,node);bones.set(data.name.toLowerCase(),node);boneData.set(data.name,data);}
    for(const data of definition.bones||[]){
      const node=bones.get(data.name),pivot=data.pivot||[0,0,0],parentData=data.parent?boneData.get(data.parent):null,parentPivot=parentData?.pivot||[0,0,0];
      node.position.set((Number(pivot[0])-Number(parentPivot[0]))/16,(Number(pivot[1])-Number(parentPivot[1]))/16,(Number(pivot[2])-Number(parentPivot[2]))/16);
      const initialRotation=Array.isArray(data.bind_pose_rotation)?data.bind_pose_rotation:data.rotation;if(Array.isArray(initialRotation))node.rotation.set(THREE.MathUtils.degToRad(Number(initialRotation[0])||0),THREE.MathUtils.degToRad(Number(initialRotation[1])||0),THREE.MathUtils.degToRad(Number(initialRotation[2])||0));
      (data.parent&&bones.get(data.parent)?bones.get(data.parent):root).add(node);if(data.neverRender)node.visible=false;
      for(const cube of data.cubes||[]){
        const size=cube.size||[1,1,1],origin=cube.origin||[0,0,0],center=[Number(origin[0])+Number(size[0])/2,Number(origin[1])+Number(size[1])/2,Number(origin[2])+Number(size[2])/2];
        const mesh=this.cubeMesh(cube,tw,th,material,!!data.mirror);
        if(Array.isArray(cube.rotation)){
          const cp=cube.pivot||pivot,holder=new THREE.Group();holder.name=`${data.name}_cubePivot`;holder.position.set((Number(cp[0])-Number(pivot[0]))/16,(Number(cp[1])-Number(pivot[1]))/16,(Number(cp[2])-Number(pivot[2]))/16);holder.rotation.set(THREE.MathUtils.degToRad(Number(cube.rotation[0])||0),THREE.MathUtils.degToRad(Number(cube.rotation[1])||0),THREE.MathUtils.degToRad(Number(cube.rotation[2])||0));mesh.position.set((center[0]-Number(cp[0]))/16,(center[1]-Number(cp[1]))/16,(center[2]-Number(cp[2]))/16);holder.add(mesh);node.add(holder);
        }else{mesh.position.set((center[0]-Number(pivot[0]))/16,(center[1]-Number(pivot[1]))/16,(center[2]-Number(pivot[2]))/16);node.add(mesh);}
      }
    }
    root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root);if(box.isEmpty())throw new Error('Translated Bedrock model has no visible cubes');const center=box.getCenter(new THREE.Vector3());root.position.x-=center.x;root.position.z-=center.z;root.position.y-=box.min.y;root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);
    root.userData.entityType=type;root.userData.bones=bones;root.userData.bounds={min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new THREE.Vector3()).toArray()};root.userData.textureURL=texture.userData.sourceURL;return root;
  }
  async animations(type){
    const spec=this.spec(type),merged={};const sources=[];
    for(const stem of spec.animations||[]){const record=await this.resolve('animation',[stem],false);if(!record)continue;Object.assign(merged,record.json?.animations||{});sources.push(record.url);}
    return {animations:merged,sources};
  }
  cloneTemplate(template){
    const clone=template.clone(true),bones=new Map();clone.traverse(o=>{if(o.userData?.bedrockBoneName){bones.set(o.userData.bedrockBoneName,o);bones.set(o.userData.bedrockBoneName.toLowerCase(),o);}if(o.isMesh&&o.material)o.material=o.material.clone();});clone.userData={...template.userData,bones};clone.userData.animationController=new BedrockAnimationControllerV2(clone,bones,template.userData.animations||{},template.userData.entityType);return clone;
  }
  async loadTemplate(type){
    if(this.templateCache.has(type))return this.templateCache.get(type);if(this.inflight.has(type))return this.inflight.get(type);
    const work=(async()=>{
      window.__voxelDiag?.log?.(`──── ENTITY PIPELINE ${type.toUpperCase()} ────`,'face');
      const spec=this.spec(type),[entityRec,geoRec]=await Promise.all([this.resolve('entity',spec.entity,true),this.resolve('geometry',spec.geometry,true)]);window.__voxelDiag?.log?.(`Geometry JSON: SUCCESS ${geoRec.path}`,'ok');window.__voxelDiag?.log?.(`Entity JSON: SUCCESS ${entityRec.path}`,'ok');
      const selected=this.chooseGeometry(entityRec.json,geoRec.json),texture=await this.texture(entityRec.json,type),anim=await this.animations(type);const root=this.build(selected.data,texture,type);root.userData.geometryName=selected.name;root.userData.animations=anim.animations;root.userData.animationSources=anim.sources;root.userData.translationReport={type,geometry:geoRec.url,entity:entityRec.url,texture:texture.userData.sourceURL,bones:new Set([...root.userData.bones.keys()].filter(k=>k===k.toLowerCase())).size,meshes:0,animations:Object.keys(anim.animations).length};root.traverse(o=>{if(o.isMesh)root.userData.translationReport.meshes++;});
      window.__voxelDiag?.log?.(`Bedrock → Three.js: SUCCESS | bones ${root.userData.translationReport.bones} | meshes ${root.userData.translationReport.meshes} | animations ${root.userData.translationReport.animations}`,'ok');window.__voxelDiag?.log?.(`UV mapped cubes: ${root.userData.translationReport.meshes}`,'ok');
      this.templateCache.set(type,root);return root;
    })().finally(()=>this.inflight.delete(type));this.inflight.set(type,work);return work;
  }
  async load(type){return this.cloneTemplate(await this.loadTemplate(type));}
}
StudioAssetPipeline.prototype.model=async function(type){
  if(!this.entityLoaderV2)this.entityLoaderV2=new BedrockEntityLoaderV2(this.cache);
  return this.entityLoaderV2.load(type);
};
for(const url of [
  `${BEDROCK_RAW}resource_pack/entity/zombie.entity.json`,`${BEDROCK_RAW}resource_pack/models/entity/zombie.geo.json`,`${BEDROCK_RAW}resource_pack/animations/zombie.animation.json`,
  `${BEDROCK_RAW}resource_pack/entity/creeper.entity.json`,`${BEDROCK_RAW}resource_pack/models/entity/creeper.geo.json`,`${BEDROCK_RAW}resource_pack/animations/creeper.animation.json`,
  `${BEDROCK_RAW}resource_pack/entity/chicken.entity.json`,`${BEDROCK_RAW}resource_pack/models/entity/chicken.geo.json`,`${BEDROCK_RAW}resource_pack/animations/chicken.animation.json`,
  `${BEDROCK_RAW}resource_pack/entity/cow.entity.json`,`${BEDROCK_RAW}resource_pack/models/entity/cow.geo.json`,`${BEDROCK_RAW}resource_pack/animations/cow.animation.json`,
  `${BEDROCK_RAW}resource_pack/animations/humanoid.animation.json`,`${BEDROCK_RAW}resource_pack/animations/quadruped.animation.json`
])if(game.assetPipeline?.prefetchManifest&&!game.assetPipeline.prefetchManifest.includes(url))game.assetPipeline.prefetchManifest.push(url);
for(const type of Object.keys(BEDROCK_ENTITY_SPECS_V2))if(!modelTranslationRegistry.has(`minecraft:${type}`))modelTranslationRegistry.register(`minecraft:${type}`,{entity:type,translator:'BedrockEntityLoaderV2'});
StudioMobRenderer.prototype.replace=async function(mob){
  const type=mob.type;
  try{
    const model=await this.game.assetPipeline.model(type);if(!model)throw new Error(`Entity translator returned no model for ${type}`);
    if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);
    mob.mesh=model;mob.model=model;mob.animationController=model.userData.animationController;model.position.copy(mob.position);model.rotation.y=mob.yaw;this.game.renderer.scene.add(model);return model;
  }catch(error){window.__voxelDiag?.log?.(`ENTITY ${type} FAILED: ${error.message}`,'err');console.error('[StudioMobRenderer V2]',type,error);mob.loadError=error;return null;}
};
Mob.prototype.ensureStudioState=function(){
  if(this._studioState)return;this._studioState=true;this.knockback=new THREE.Vector3();this.verticalVelocity=0;this.distanceWalked=0;this.attackAnim=0;this.attackProgress=0;this.hitFlash=0;this.fuse=0;this.fuseTime=1.5;this.exploded=false;this.health=this.type==='zombie'?20:this.type==='creeper'?20:this.type==='spider'?16:10;
};
Mob.prototype.applyKnockback=function(direction,strength=3.4,lift=2.0){this.ensureStudioState();const d=direction.clone();d.y=0;if(d.lengthSq()>1e-6)d.normalize();this.knockback.addScaledVector(d,strength);this.verticalVelocity=Math.max(this.verticalVelocity,lift);};
Player.prototype.applyKnockback=function(direction,strength=3.1,lift=4.0){if(this.mode==='creative')return;if(!this.combatImpulse)this.combatImpulse=new THREE.Vector3();const d=direction.clone();d.y=0;if(d.lengthSq()>1e-6)d.normalize();this.combatImpulse.addScaledVector(d,strength);this.velocity.y=Math.max(this.velocity.y,lift);};
const playerUpdateBeforeCombatKnockback=Player.prototype.update;
Player.prototype.update=function(dt,controls){
  playerUpdateBeforeCombatKnockback.call(this,dt,controls);
  if(this.combatImpulse&&!this.flying){this.moveAxis('x',this.combatImpulse.x*dt);this.moveAxis('z',this.combatImpulse.z*dt);this.combatImpulse.multiplyScalar(Math.exp(-7.5*dt));if(this.combatImpulse.lengthSq()<.002)this.combatImpulse.set(0,0,0);}
};
function setMobFlash(mob,intensity){
  if(!mob.model)return;mob.model.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m?.emissive)m.emissive.setRGB(intensity,intensity*.12,intensity*.12);});
}
function explodeCreeperV2(mob,gameRef){
  if(mob.exploded)return;mob.exploded=true;const world=gameRef.world,center=mob.position.clone(),radius=3.0,changed=[];
  for(let y=Math.floor(center.y-radius);y<=Math.ceil(center.y+radius);y++)for(let z=Math.floor(center.z-radius);z<=Math.ceil(center.z+radius);z++)for(let x=Math.floor(center.x-radius);x<=Math.ceil(center.x+radius);x++){
    const dx=x+.5-center.x,dy=y+.5-center.y,dz=z+.5-center.z;if(dx*dx+dy*dy+dz*dz>radius*radius)continue;const id=world.get(x,y,z);if(id===BLOCK.AIR||id===BLOCK.BEDROCK||id===BLOCK.WATER)continue;world.set(x,y,z,BLOCK.AIR);changed.push([x,y,z,id]);if(gameRef.particles&&changed.length<80)gameRef.particles.spawnBurst?.(new THREE.Vector3(x+.5,y+.5,z+.5),1);
  }
  const dist=center.distanceTo(gameRef.player.position);if(gameRef.mode!=='creative'&&dist<6){const power=clamp(1-dist/6,0,1),away=gameRef.player.position.clone().sub(center);gameRef.player.health=Math.max(0,gameRef.player.health-Math.ceil(power*12));gameRef.player.applyKnockback(away,5.8*power,5.2*power);damageVignette.style.opacity='.9';setTimeout(()=>damageVignette.style.opacity='0',140);}
  window.__voxelDiag?.log?.(`CREEPER EXPLOSION: ${changed.length} blocks changed`,'warn');mob.health=0;
}
function updateMobV2(mob,dt,world,player,gameRef){
  mob.ensureStudioState();mob.age+=dt;mob.think-=dt;mob.attack=Math.max(0,mob.attack-dt);mob.attackAnim=Math.max(0,mob.attackAnim-dt);mob.hitFlash=Math.max(0,mob.hitFlash-dt);mob.attackProgress=mob.attackAnim>0?clamp(1-mob.attackAnim/.36,0,1):0;
  const dx=player.position.x-mob.position.x,dz=player.position.z-mob.position.z,dist=Math.hypot(dx,dz),len=Math.max(.001,dist);let desiredX=0,desiredZ=0,state='idle';
  const hostile=mob.type==='zombie'||mob.type==='creeper'||mob.type==='spider'||mob.type==='skeleton'||mob.type==='enderman';
  if(mob.think<=0){mob.think=dist>24?.75:.18;if(!hostile)mob.wander+=(Math.random()-.5)*1.8;}
  if(hostile&&dist<22){
    const speed=mob.type==='creeper'?1.35:mob.type==='spider'?2.2:1.75;desiredX=dx/len*speed;desiredZ=dz/len*speed;mob.yaw=Math.atan2(-dx,-dz);state='walk';
    if(mob.type==='zombie'&&dist<1.45&&mob.attack<=0){mob.attack=1.0;mob.attackAnim=.36;state='attack';if(gameRef.mode!=='creative'){player.health=Math.max(0,player.health-3);player.applyKnockback(player.position.clone().sub(mob.position),3.4,3.6);damageVignette.style.opacity='.82';setTimeout(()=>damageVignette.style.opacity='0',120);}}
    if(mob.type==='creeper'){
      if(dist<2.75){mob.fuse+=dt;state='fuse';desiredX*=.35;desiredZ*=.35;}else mob.fuse=Math.max(0,mob.fuse-dt*1.7);
      if(mob.fuse>=mob.fuseTime)explodeCreeperV2(mob,gameRef);
    }
  }else if(!hostile){desiredX=Math.sin(mob.wander)*.55;desiredZ=Math.cos(mob.wander)*.55;state='walk';}
  const smoothing=1-Math.exp(-7*dt);mob.velocity.x=lerp(mob.velocity.x,desiredX,smoothing);mob.velocity.z=lerp(mob.velocity.z,desiredZ,smoothing);const moveX=(mob.velocity.x+mob.knockback.x)*dt,moveZ=(mob.velocity.z+mob.knockback.z)*dt;mob.position.x+=moveX;mob.position.z+=moveZ;mob.distanceWalked+=Math.hypot(moveX,moveZ);mob.knockback.multiplyScalar(Math.exp(-5.5*dt));
  const ground=world.highestSolidY(Math.floor(mob.position.x),Math.floor(mob.position.z))+1;if(mob.verticalVelocity!==0||mob.position.y>ground+.02){mob.verticalVelocity-=18*dt;mob.position.y+=mob.verticalVelocity*dt;if(mob.position.y<=ground){mob.position.y=ground;mob.verticalVelocity=0;}}else mob.position.y=lerp(mob.position.y,ground,clamp(dt*12,0,1));
  if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;setMobFlash(mob,mob.hitFlash>0?.38:0);if(mob.type==='creeper'&&mob.fuse>0){const pulse=(Math.sin(mob.age*32)>0?1:0)*clamp(mob.fuse/mob.fuseTime,0,1)*.22;mob.model.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissive.setRGB(pulse,pulse,pulse);});}mob.animationController?.update(state,mob.age,mob);}
}
MobSystem.prototype.spawnEntity=async function(type,position){
  if(this.mobs.length+(this.pendingSpawns||0)>=ENGINE.MAX_MOBS)return null;this.pendingSpawns=(this.pendingSpawns||0)+1;const mob=new Mob(type,position.clone());mob.ensureStudioState();mob.mesh=null;mob.model=null;
  try{const model=await this.game?.mobRenderer?.replace(mob);if(!model)throw mob.loadError||new Error(`No translated ${type} model`);this.mobs.push(mob);window.__voxelDiag?.log?.(`ENTITY SPAWNED ${type} @ ${position.x.toFixed(1)},${position.y.toFixed(1)},${position.z.toFixed(1)}`,'ok');return mob;}catch(error){window.__voxelDiag?.log?.(`ENTITY SPAWN ABORTED ${type}: ${error.message}`,'err');return null;}finally{this.pendingSpawns--;}
};
MobSystem.prototype.spawnAround=function(player){
  if(this.mobs.length+(this.pendingSpawns||0)>=ENGINE.MAX_MOBS)return;const a=Math.random()*Math.PI*2,r=20+Math.random()*24,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(this.world.get(x,y,z)!==BLOCK.AIR)return;
  const roll=Math.random(),type=roll<.38?'zombie':roll<.55?'creeper':roll<.73?'cow':roll<.88?'chicken':'pig';this.spawnEntity(type,new THREE.Vector3(x+.5,y,z+.5));
};
MobSystem.prototype.update=function(dt,player){
  this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.8;if(Math.random()<.40)this.spawnAround(player);}for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];updateMobV2(mob,dt,this.world,player,this.game);if(mob.health<=0||mob.position.distanceTo(player.position)>96){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}}
};
CombatSystem.prototype.attack=function(){
  if(this.cooldown>0||!this.game.running)return false;const mob=this.target();if(!mob)return false;mob.ensureStudioState?.();mob.health=Math.max(0,mob.health-this.damage);mob.hitFlash=.14;mob.attackAnim=Math.max(mob.attackAnim||0,.20);const f=this.direction();mob.applyKnockback?.(f,3.8,2.4);this.cooldown=this.attackInterval;this.lastTarget=mob;this.lastAttackTime=performance.now();this.flashTimer=.10;damageVignette.style.background='radial-gradient(circle,transparent 58%,rgba(255,255,255,.28))';damageVignette.style.opacity='.35';setTimeout(()=>{damageVignette.style.opacity='0';damageVignette.style.background='radial-gradient(circle,transparent 35%,rgba(180,0,0,.65))';},90);return true;
};
window.spawnEntity=async function(type,position=null){
  const p=position instanceof THREE.Vector3?position:position&&typeof position==='object'?new THREE.Vector3(position.x||0,position.y||0,position.z||0):game.player?.position?.clone?.().add(new THREE.Vector3(3,0,3));if(!p||!game.mobs)throw new Error('World is not running');p.y=game.world.highestSolidY(Math.floor(p.x),Math.floor(p.z))+1;return game.mobs.spawnEntity(String(type).replace(/^minecraft:/,''),p);
};
let studioTapAttack=null;
lookSurface.addEventListener('pointerdown',e=>{if(game.ui?.screen)return;studioTapAttack={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};},{passive:true});
lookSurface.addEventListener('pointerup',e=>{const a=studioTapAttack;studioTapAttack=null;if(!a||a.id!==e.pointerId||game.ui?.screen)return;if(performance.now()-a.t>230||Math.hypot(e.clientX-a.x,e.clientY-a.y)>10)return;if(game.combat?.target?.()){game.combat.attack();attackSwingController?.trigger?.();}},{passive:true});
lookSurface.addEventListener('pointercancel',()=>{studioTapAttack=null;},{passive:true});
runtimeCommands.register('spawnEntity',(type='zombie')=>window.spawnEntity(type),'Spawn a Mojang Bedrock entity through the V2 translator.');
runtimeCommands.register('entities',()=>game.mobs?.mobs?.map(m=>({type:m.type,health:m.health,position:m.position.toArray(),model:!!m.model,geometry:m.model?.userData?.geometryName,texture:m.model?.userData?.textureURL}))||[],'List translated live entities.');
studioValidation.check?.('Bedrock V2 entity loader installed',()=>typeof BedrockEntityLoaderV2==='function');
window.__voxelDiag?.log?.('LEAVES V5: dense cutout + alpha-test-to-opaque-style source blending; log-through-leaves culling preserved.','ok');
window.__voxelDiag?.log?.('MOBS V5: general Bedrock JSON bones/cubes/pivots/UV/PNG/animation pipeline installed.','ok');
window.__voxelDiag?.log?.('COMBAT V5: mine button attacks entities first; reciprocal knockback + creeper fuse/explosion enabled.','ok');
window.__voxelDiag?.log?.('CRAFTING V5: landscape/touch vertical scrolling enabled.','ok');
resourcePackCompatibility.check('threejs',typeof THREE!=='undefined');
resourcePackCompatibility.check('cacheStorage','caches' in window);
resourcePackCompatibility.check('indexedDB','indexedDB' in window);
resourcePackCompatibility.check('pointerEvents','PointerEvent' in window);
resourcePackCompatibility.check('imageBitmap','createImageBitmap' in window);
console.info('[Studio Minecraft] Build',STUDIO_BUILD.version);
console.info('[Studio Minecraft] Asset candidate records',studioAssetCandidateIndex.size());
console.info('[Studio Minecraft] Mojang entity translation registry',modelTranslationRegistry.all());
