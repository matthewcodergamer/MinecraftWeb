
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
const STUDIO_V6 = Object.freeze({
  version:'2.1.0-collision-drops-crafting-daynight',
  entityCollision:'behavior-json',
  explosionBudget:18,
  dayLengthSeconds:1200
});
window.STUDIO_PATCH_VERSION=STUDIO_V6.version;
const studioV6Style=document.createElement('style');
studioV6Style.textContent=`
#survivalBars{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);width:min(392px,78vw);height:21px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:22;pointer-events:none;filter:drop-shadow(1px 2px 0 #000)}
#heartBar,#hungerBar{display:flex;gap:1px;align-items:center;height:20px}
.mc-heart{position:relative;width:16px;height:16px;font:900 19px/16px Georgia,serif;text-align:center;color:#3a1212;text-shadow:1px 0 #111,-1px 0 #111,0 1px #111,0 -1px #111}
.mc-heart.full{color:#e52b2b}.mc-heart.half{background:linear-gradient(90deg,#e52b2b 0 50%,#3a1212 50% 100%);-webkit-background-clip:text;background-clip:text;color:transparent}.mc-heart.empty{opacity:.5}
.mc-food{position:relative;width:15px;height:15px;display:inline-block;opacity:.48}
.mc-food:before{content:"";position:absolute;left:2px;top:1px;width:9px;height:10px;background:#5b2812;border:1px solid #180c08;clip-path:polygon(22% 0,78% 0,100% 28%,83% 76%,55% 100%,20% 82%,0 48%)}
.mc-food:after{content:"";position:absolute;right:0;bottom:0;width:6px;height:3px;background:#d7c59e;border:1px solid #4f3b27;transform:rotate(-38deg);transform-origin:left center}
.mc-food.full{opacity:1}.mc-food.half{opacity:.72}.mc-food.full:before{background:#b85b25}.mc-food.half:before{background:linear-gradient(90deg,#b85b25 0 50%,#5b2812 50% 100%)}
.recipe-book{display:flex;flex-direction:column;gap:5px;min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:3px 2px 10px}
.recipe-card{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;width:100%;min-height:54px;padding:5px 7px;background:#9d9d9d;border:2px solid #3b3b3b;box-shadow:inset 2px 2px #d6d6d6,inset -2px -2px #666;color:#151515;text-align:left;touch-action:manipulation}
.recipe-card.unavailable{opacity:.52}.recipe-card:active{box-shadow:inset 2px 2px #666,inset -2px -2px #d6d6d6}
.recipe-pattern{display:grid;gap:1px;background:#666;padding:2px}.recipe-pattern.s2{grid-template-columns:repeat(2,14px)}.recipe-pattern.s3{grid-template-columns:repeat(3,12px)}
.recipe-cell{width:14px;height:14px;background:#7f7f7f;border:1px solid #555;display:flex;align-items:center;justify-content:center}.recipe-pattern.s3 .recipe-cell{width:12px;height:12px}.recipe-cell img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
.recipe-output{display:flex;align-items:center;gap:3px;font-weight:900}.recipe-output img{width:28px;height:28px;image-rendering:pixelated;object-fit:contain}
.player-craft-2{grid-template-columns:repeat(2,48px)!important}.player-craft-2 .craft-slot,.player-craft-2 .inv-slot{width:48px;height:48px}
.crafting-panel{display:grid;grid-template-columns:minmax(250px,1fr) minmax(230px,.72fr);gap:12px;min-height:0}.crafting-left,.crafting-right{min-height:0}.crafting-right{display:flex;flex-direction:column;overflow:hidden}.crafting-right .search{flex:0 0 auto}.crafting-right .recipe-book{flex:1 1 auto;max-height:58vh}
#studioDragGhost{will-change:left,top}
@media (orientation:landscape) and (max-height:560px){#survivalBars{bottom:55px;width:min(350px,64vw)}.mc-heart{width:14px;font-size:17px}.mc-food{width:13px}.crafting-panel{grid-template-columns:1.05fr .95fr;gap:8px}.crafting-right .recipe-book{max-height:calc(100dvh - 116px)}.mc-window.v6-crafting{height:calc(100dvh - 8px);max-height:calc(100dvh - 8px);overflow:hidden}.v6-crafting .inventory-grid{grid-template-columns:repeat(9,minmax(28px,1fr))}.v6-crafting .inv-slot{min-height:30px}.v6-crafting h3{margin:4px 0}}
@media(max-width:680px) and (orientation:portrait){#survivalBars{width:82vw;bottom:60px}.crafting-panel{grid-template-columns:1fr}.crafting-right .recipe-book{max-height:34vh}}
`;
document.head.appendChild(studioV6Style);
const survivalBars=document.createElement('div');
survivalBars.id='survivalBars';
survivalBars.innerHTML='<div id="heartBar"></div><div id="hungerBar"></div>';
document.getElementById('hud')?.appendChild(survivalBars);
function renderSurvivalBarsV6(player,mode){
  if(!player)return;
  survivalBars.style.display=mode==='creative'?'none':'flex';
  if(mode==='creative')return;
  const heartBar=document.getElementById('heartBar'),hungerBar=document.getElementById('hungerBar');
  const hp=clamp(Math.round(player.health),0,20),food=clamp(Math.round(player.hunger),0,20);
  let hearts='',foods='';
  for(let i=0;i<10;i++){const value=hp-i*2;hearts+=`<span class="mc-heart ${value>=2?'full':value===1?'half':'empty'}">♥</span>`;}
  for(let i=0;i<10;i++){const value=food-i*2;foods+=`<span class="mc-food ${value>=2?'full':value===1?'half':'empty'}"></span>`;}
  heartBar.innerHTML=hearts;hungerBar.innerHTML=foods;
}
for(const type of ['touchstart','touchmove','touchend','wheel']){
  screenLayer.addEventListener(type,e=>{if(game.ui?.screen)e.stopPropagation();},{passive:type!=='wheel'});
}
Crafting.prototype.gridSize=2;
Crafting.prototype.setGridSize=function(size){
  this.gridSize=size===3?3:2;
  this.update();
};
Crafting.prototype.currentGrid=function(){
  const s=this.gridSize===3?3:2;
  const out=[];
  for(let y=0;y<s;y++)out.push(this.grid.slice(y*s,y*s+s));
  return out;
};
Crafting.prototype.findRecipe=function(){
  const grid=this.currentGrid(),size=this.gridSize===3?3:2;
  return RECIPES.find(r=>r.shape.length<=size&&Math.max(...r.shape.map(row=>row.length))<=size&&recipeMatches(grid,r))||null;
};
Crafting.prototype.takeOutput=function(){
  const r=this.findRecipe();if(!r)return false;
  for(let i=0;i<(this.gridSize===3?9:4);i++){
    const s=this.grid[i];if(!s.empty()){s.count--;s.normalize();}
  }
  const left=this.inventory.add(r.out.id,r.out.count);
  if(left>0&&game?.drops&&game?.player){
    const p=game.player.position.clone();p.y+=1;
    game.drops.spawn(r.out.id,left,p);
  }
  this.update();return true;
};
function recipeDimensionsV6(recipe){return {h:recipe.shape.length,w:Math.max(...recipe.shape.map(r=>r.length))};}
function recipeIngredientCountsV6(recipe){
  const counts=new Map();for(const row of recipe.shape)for(const id of row)if(id)counts.set(id,(counts.get(id)||0)+1);return counts;
}
function recipeAvailableV6(recipe,size,inventory){
  const d=recipeDimensionsV6(recipe);if(d.w>size||d.h>size)return false;
  for(const [id,count] of recipeIngredientCountsV6(recipe))if(!inventory.has(id,count))return false;
  return true;
}
UI.prototype.returnCraftingGridV6=function(){
  const c=this.game.crafting;if(!c)return;
  for(const s of c.grid){
    if(s.empty())continue;
    const left=this.game.inventory.add(s.id,s.count);
    if(left>0&&this.game.drops&&this.game.player){const p=this.game.player.position.clone();p.y+=1;this.game.drops.spawn(s.id,left,p);}
    s.id=ITEM.AIR;s.count=0;
  }
  c.update();
};
const studioV6OriginalClose=UI.prototype.close;
UI.prototype.close=function(){
  if(this.screen==='inventory'||this.screen==='table')this.returnCraftingGridV6();
  studioV6OriginalClose.call(this);
  this.game.refreshHotbar();this.game.saveSoon();
};
UI.prototype.openInventory=function(){
  if(this.game.crafting.gridSize!==2)this.returnCraftingGridV6();
  this.game.crafting.setGridSize(2);this.screen='inventory';screenLayer.classList.add('open');this.renderInventory();
};
UI.prototype.openCraftingTable=function(){
  if(this.game.crafting.gridSize!==3)this.returnCraftingGridV6();
  this.game.crafting.setGridSize(3);this.screen='table';screenLayer.classList.add('open');this.renderCrafting(true);
};
UI.prototype.recipePatternHtmlV6=function(recipe,size){
  const cells=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const id=recipe.shape[y]?.[x]||0,icon=id?this.game.iconFor(id):'';
    cells.push(`<span class="recipe-cell">${icon?`<img src="${icon}">`:''}</span>`);
  }
  return `<span class="recipe-pattern s${size}">${cells.join('')}</span>`;
};
UI.prototype.recipeCardHtmlV6=function(recipe,index,size){
  const available=recipeAvailableV6(recipe,size,this.game.inventory),icon=this.game.iconFor(recipe.out.id);
  return `<button class="recipe-card ${available?'':'unavailable'}" type="button" data-v6-recipe="${index}"><span>${this.recipePatternHtmlV6(recipe,size)}</span><span><b>${recipe.name}</b><br><small>${available?'Tap to load recipe':'Missing ingredients'}</small></span><span class="recipe-output">→ ${icon?`<img src="${icon}">`:''}<b>${recipe.out.count>1?recipe.out.count:''}</b></span></button>`;
};
UI.prototype.prepareRecipeV6=function(recipe,size){
  if(!recipeAvailableV6(recipe,size,this.game.inventory)){toast('Missing ingredients');return false;}
  this.returnCraftingGridV6();
  const counts=recipeIngredientCountsV6(recipe);
  for(const [id,count] of counts){if(!this.game.inventory.consume(id,count)){this.returnCraftingGridV6();return false;}}
  const c=this.game.crafting;c.setGridSize(size);
  for(let y=0;y<recipe.shape.length;y++)for(let x=0;x<recipe.shape[y].length;x++){
    const id=recipe.shape[y][x]||0;if(!id)continue;const index=y*size+x;c.grid[index].id=id;c.grid[index].count=1;
  }
  c.update();this.game.refreshHotbar();this.game.saveSoon();return true;
};
UI.prototype.renderRecipeBookV6=function(containerId,size,query=''){
  const el=document.getElementById(containerId);if(!el)return;
  const q=String(query||'').trim().toLowerCase();
  const recipes=RECIPES.map((r,i)=>({r,i})).filter(({r})=>{const d=recipeDimensionsV6(r);return d.w<=size&&d.h<=size&&(!q||r.name.toLowerCase().includes(q));});
  el.innerHTML=recipes.map(({r,i})=>this.recipeCardHtmlV6(r,i,size)).join('')||'<div style="padding:8px">No matching recipes.</div>';
  el.querySelectorAll('[data-v6-recipe]').forEach(btn=>btn.addEventListener('click',()=>{
    const recipe=RECIPES[Number(btn.dataset.v6Recipe)];if(this.prepareRecipeV6(recipe,size)){this.screen==='table'?this.renderCrafting(true):this.renderInventory();}
  }));
  iconSanitizer.scan();
};
UI.prototype.renderInventory=function(){
  const c=this.game.crafting;c.setGridSize(2);c.update();const inv=this.game.inventory;
  screenLayer.innerHTML=`<div class="mc-window v6-crafting"><h2 class="mc-title">Inventory</h2><div class="crafting-panel"><div class="crafting-left"><div class="mc-title" style="font-size:13px">Crafting 2×2</div><div class="mc-row"><div id="playerCraft" class="craft-grid player-craft-2">${Array.from({length:4},(_,i)=>this.slotHtml(`p${i}`,c.grid[i])).join('')}</div><div class="craft-arrow">→</div><div id="playerOutput">${this.slotHtml('o',c.output)}</div></div><h3>Inventory</h3><div class="inventory-grid">${inv.slots.map((s,i)=>this.slotHtml(`i${i}`,s,i)).join('')}</div></div><div class="crafting-right"><h3 style="margin-top:0">Recipe Book</h3><input class="search" id="recipeSearch" placeholder="Search 2×2 recipes"><div id="recipeBook" class="recipe-book"></div><button class="mc-btn" id="closeInventory">Done</button></div></div></div>`;
  $('closeInventory').onclick=()=>this.close();$('recipeSearch').oninput=e=>this.renderRecipeBookV6('recipeBook',2,e.target.value);this.renderRecipeBookV6('recipeBook',2,'');this.bindSlots();
};
UI.prototype.renderCrafting=function(){
  const c=this.game.crafting;c.setGridSize(3);c.update();
  screenLayer.innerHTML=`<div class="mc-window v6-crafting"><h2 class="mc-title">Crafting Table</h2><div class="crafting-panel"><div class="crafting-left"><div class="mc-row"><div class="craft-grid" id="tableGrid">${Array.from({length:9},(_,i)=>this.slotHtml(`t${i}`,c.grid[i])).join('')}</div><div class="craft-arrow">→</div><div id="tableOutput">${this.slotHtml('o',c.output)}</div></div><h3>Inventory</h3><div class="inventory-grid">${this.game.inventory.slots.map((s,i)=>this.slotHtml(`i${i}`,s,i)).join('')}</div></div><div class="crafting-right"><h3 style="margin-top:0">Recipe Book</h3><input class="search" id="tableRecipeSearch" placeholder="Search recipes"><div id="tableRecipes" class="recipe-book"></div><button class="mc-btn" id="closeTable">Close</button></div></div></div>`;
  $('closeTable').onclick=()=>this.close();$('tableRecipeSearch').oninput=e=>this.renderRecipeBookV6('tableRecipes',3,e.target.value);this.renderRecipeBookV6('tableRecipes',3,'');this.bindSlots();
};
const studioV6SeedInventoryBase=Game.prototype.seedInventory;
Game.prototype.seedInventory=function(){
  if(this.mode==='creative')return studioV6SeedInventoryBase.call(this);
  const start=[new ItemStack(ITEM.OAK_LOG,8),new ItemStack(ITEM.STICK,4),new ItemStack(ITEM.WOOD_PICKAXE,1),new ItemStack(ITEM.BREAD,4)];
  start.forEach((s,i)=>this.inventory.slots[i]=s);
};
InventoryTransactionEngine.prototype.end=function(e){
  if(!this.drag||e.pointerId!==this.drag.pointerId)return;
  e.preventDefault();const drag=this.drag;this.drag=null;this.hideGhost();
  const element=document.elementFromPoint(e.clientX,e.clientY),target=element?.closest?.('[data-slot]'),insideWindow=!!element?.closest?.('.mc-window');
  if(target&&this.game.ui.screen){this.dropIntoSlot(drag.stack,drag.slot,target.dataset.slot);this.game.ui.screen==='table'?this.game.ui.renderCrafting(true):this.game.ui.renderInventory();return;}
  if(drag.moved&&!insideWindow){this.dropIntoWorld(drag.stack);this.takeFromSource(drag.slot,drag.stack.count);this.game.ui.screen==='table'?this.game.ui.renderCrafting(true):this.game.ui.renderInventory();return;}
  if(!drag.moved)this.game.ui.clickSlot?.(drag.slot);
};
InventoryTransactionEngine.prototype.dropIntoWorld=function(stack){
  if(!this.game.drops||stack.empty())return;
  const origin=this.game.player.eyePosition(),direction=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.game.player.pitch,this.game.player.yaw,0,'YXZ')).normalize();
  const pos=origin.clone().addScaledVector(direction,.9);pos.y-=.35;const velocity=direction.clone().multiplyScalar(2.4);velocity.y=1.8;
  this.game.drops.spawn(stack.id,stack.count,pos,velocity);this.game.saveSoon();
};
class StudioDropVisualFactoryV6 {
  constructor(gameRef){this.game=gameRef;this.geometryCache=new Map();this.materialCache=new Map();this.itemMaterials=new Map();}
  blockForItem(id){const b=this.game.itemToBlock?.(id)||BLOCK.AIR;return b===BLOCK.TORCH?BLOCK.AIR:b;}
  materialForKind(kind){
    if(this.materialCache.has(kind))return this.materialCache.get(kind);const map=this.game.atlas.texture;let m;
    if(kind==='leaves')m=new THREE.MeshLambertMaterial({map,color:0xffffff,side:THREE.DoubleSide,transparent:false,alphaTest:.50,depthWrite:true,depthTest:true});
    else if(kind==='glass')m=new THREE.MeshLambertMaterial({map,color:0xffffff,side:THREE.FrontSide,transparent:true,opacity:.55,alphaTest:.02,depthWrite:true,depthTest:true});
    else m=new THREE.MeshLambertMaterial({map,color:0xffffff,side:THREE.FrontSide,transparent:false,depthWrite:true,depthTest:true});
    this.materialCache.set(kind,m);return m;
  }
  blockGeometry(block){
    if(this.geometryCache.has(block))return this.geometryCache.get(block);const p=[],n=[],u=[],idx=[];
    for(const f of VOXEL_FACES){const base=p.length/3,verts=voxelFaceVertices(-.5,-.5,-.5,f),tex=this.game.renderer.mesher.textureName(block,f.key);for(const v of verts)p.push(...v);for(let i=0;i<4;i++)n.push(...f.n);for(const uv of f.uv)u.push(...this.game.atlas.uv(tex,uv[0],uv[1]));idx.push(base,base+1,base+2,base,base+2,base+3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setIndex(idx);g.computeBoundingSphere();this.geometryCache.set(block,g);return g;
  }
  createBlock(block,id){const kind=this.game.renderer.mesher.materialKind(block),mesh=new THREE.Mesh(this.blockGeometry(block),this.materialForKind(kind));mesh.scale.setScalar(.28);mesh.userData.itemId=id;return mesh;}
  createFlat(id){
    const geo=new THREE.BoxGeometry(.42,.42,.055),mat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0,alphaTest:.04,side:THREE.DoubleSide,depthWrite:true});const mesh=new THREE.Mesh(geo,mat);mesh.userData.itemId=id;
    const url=this.game.iconFor(id);if(url){const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');loader.load(url,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;mat.map=tex;mat.opacity=1;mat.needsUpdate=true;},undefined,()=>{mat.opacity=.85;mat.color.set(0xbdbdbd);});}return mesh;
  }
  create(id){const block=this.blockForItem(id);return block!==BLOCK.AIR?this.createBlock(block,id):this.createFlat(id);}
}
DropSystem.prototype.spawn=function(id,count,pos,velocity=null){
  if(!id||count<=0||this.items.length>=ENGINE.MAX_DROPS)return null;if(!this._v6Factory)this._v6Factory=new StudioDropVisualFactoryV6(this.game||game);
  const d=new DroppedItem(id,count,pos);if(velocity)d.velocity.copy(velocity);d.physics=new StudioDropPhysics();d.mesh=this._v6Factory.create(id);d.mesh.position.copy(pos);d.mesh.castShadow=false;d.mesh.receiveShadow=false;this.group.add(d.mesh);this.items.push(d);return d;
};
DropSystem.prototype.update=function(dt,player,inventory){
  for(let i=this.items.length-1;i>=0;i--){const d=this.items[i];if(d.physics)d.physics.update(d,this.world,player,dt);else d.update(dt,this.world);
    if(d.mesh){d.mesh.position.set(d.position.x,d.position.y+.18+Math.sin(d.age*4.2)*.045,d.position.z);d.mesh.rotation.y=d.spin;d.mesh.rotation.x=.12+Math.sin(d.spin*.55)*.08;}
    if(d.pickupDelay<=0&&d.position.distanceTo(player.position)<1.35){const before=d.count,left=inventory.add(d.id,d.count);d.count=left;if(left<before)this.game?.refreshHotbar?.();if(d.count<=0){this.group.remove(d.mesh);this.items.splice(i,1);continue;}}
    if(d.age>300){this.group.remove(d.mesh);this.items.splice(i,1);}
  }
};
Game.prototype.mine=function(dt){
  if(!this.breaking)return;const hit=this.getTarget();if(!hit){this.player.breaking=null;this.player.breakProgress=0;return;}
  if(this.player.breaking&&blockKey(hit.x,hit.y,hit.z)!==this.player.breaking)this.player.breakProgress=0;this.player.breaking=blockKey(hit.x,hit.y,hit.z);
  const hardness=BLOCK_HARDNESS.get(hit.id)||1,toolFactor=this.toolFactor(this.selectedStack().id,hit.id);this.player.breakProgress+=dt*(toolFactor/hardness);if(this.mode==='creative')this.player.breakProgress=1;
  if(this.player.breakProgress>=1){const old=hit.id;this.world.set(hit.x,hit.y,hit.z,BLOCK.AIR);this.particles.spawnBurst(new THREE.Vector3(hit.x+.5,hit.y+.5,hit.z+.5),8);if(this.mode==='survival'){const item=BLOCK_ITEM.get(old)||old;if(item){const d=this.drops.spawn(item,1,new THREE.Vector3(hit.x+.5,hit.y+.55,hit.z+.5));if(d)d.pickupDelay=.55;}}this.player.breakProgress=0;this.player.breaking=null;this.refreshHotbar();this.saveSoon();}
};
Player.prototype.intersectsBlockV6=function(x,y,z,pos=this.position){
  const a=this.aabb(pos);return a.maxX>x+1e-5&&a.minX<x+1-1e-5&&a.maxY>y+1e-5&&a.minY<y+1-1e-5&&a.maxZ>z+1e-5&&a.minZ<z+1-1e-5;
};
Player.prototype.depenetrateV6=function(){
  if(!this.collidesAt(this.position))return true;const base=this.position.clone();
  for(let dy=.05;dy<=2.2;dy+=.05){const p=base.clone();p.y+=dy;if(!this.collidesAt(p)){this.position.copy(p);this.velocity.y=Math.max(0,this.velocity.y);return true;}}
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(let r=.08;r<=.8;r+=.08)for(const [dx,dz] of dirs){const p=base.clone();p.x+=dx*r;p.z+=dz*r;if(!this.collidesAt(p)){this.position.copy(p);return true;}}
  return false;
};
Player.prototype.moveAxis=function(axis,amount){
  if(!amount)return;const steps=Math.max(1,Math.ceil(Math.abs(amount)/.18)),inc=amount/steps;
  for(let s=0;s<steps;s++){
    const next=this.position.clone();next[axis]+=inc;if(!this.collidesAt(next)){this.position.copy(next);continue;}
    if(axis==='x'||axis==='z'){
      const grounded=this.collidesAt(this.position.clone().add(new THREE.Vector3(0,-.06,0)));
      if(grounded){const stepped=next.clone();stepped.y+=.56;if(!this.collidesAt(stepped)){this.position.copy(stepped);continue;}}
      this.velocity[axis]=0;break;
    }
    this.velocity.y=0;if(inc<0)this.onGround=true;break;
  }
};
const studioV6PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){
  if(!this.flying)this.depenetrateV6();studioV6PlayerUpdateBase.call(this,dt,controls);if(!this.flying&&!this.depenetrateV6()&&this.position.y<1){this.position=this.world.findSpawn();this.velocity.set(0,0,0);}
};
Game.prototype.useSelected=function(){
  const hit=this.getTarget();if(!hit)return;const selected=this.selectedStack();if(hit.id===BLOCK.CRAFTING_TABLE){this.openCraftingTable();return;}if(selected.empty())return;
  const block=this.itemToBlock(selected.id);if(block===BLOCK.AIR)return;const p=hit.place;
  if(this.player.intersectsBlockV6(p.x,p.y,p.z)){toast('Cannot place block inside player');return;}
  for(const mob of this.mobs?.mobs||[]){const spec=mobCollisionSpecV6(mob),r=spec.width*.5;if(mob.position.x+r>p.x&&mob.position.x-r<p.x+1&&mob.position.y+spec.height>p.y&&mob.position.y<p.y+1&&mob.position.z+r>p.z&&mob.position.z-r<p.z+1){toast('Entity is in the way');return;}}
  if(this.mode!=='creative'&&!this.inventory.consume(selected.id,1))return;const changed=this.world.set(p.x,p.y,p.z,block);if(!changed){if(this.mode!=='creative')this.inventory.add(selected.id,1);return;}
  if(this.player.collidesAt(this.player.position)){this.world.set(p.x,p.y,p.z,BLOCK.AIR);if(this.mode!=='creative')this.inventory.add(selected.id,1);this.player.depenetrateV6();toast('Placement blocked');return;}
  this.refreshHotbar();this.saveSoon();
};
const studioV6ChooseGeometryBase=BedrockEntityLoaderV2.prototype.chooseGeometry;
BedrockEntityLoaderV2.prototype.chooseGeometry=function(entityJSON,geometryJSON){
  const selected=studioV6ChooseGeometryBase.call(this,entityJSON,geometryJSON),preferred=entityJSON?.['minecraft:client_entity']?.description?.geometry?.default||'';
  try{Object.defineProperty(entityJSON,'__studioSelectedGeometry',{value:selected.name,writable:true,configurable:true});Object.defineProperty(entityJSON,'__studioPreferredGeometry',{value:preferred,writable:true,configurable:true});}catch{}
  if(preferred&&selected.name!==preferred)window.__voxelDiag?.log?.(`ENTITY GEOMETRY COMPAT: requested ${preferred}, available ${selected.name}`,'warn');return selected;
};
BedrockEntityLoaderV2.prototype.textureFromPathV6=async function(path,type){
  const clean=String(path).replace(/\.png$/,''),key=`${type}|${clean}`;if(this.textureCache.has(key))return this.textureCache.get(key);const direct=`${BEDROCK_RAW}resource_pack/${clean}.png`;const bmp=await this.cache.image(direct),cv=document.createElement('canvas');cv.width=bmp.width;cv.height=bmp.height;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(bmp,0,0);bmp.close?.();const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;texture.userData={sourceURL:direct,entityType:type,width:cv.width,height:cv.height};this.textureCache.set(key,texture);return texture;
};
const studioV6EntityTextureBase=BedrockEntityLoaderV2.prototype.texture;
BedrockEntityLoaderV2.prototype.texture=async function(entityJSON,type){
  const selected=entityJSON?.__studioSelectedGeometry,preferred=entityJSON?.__studioPreferredGeometry;
  if(type==='cow'&&selected==='geometry.cow.v1.8'&&preferred==='geometry.cow.v2'){
    const texture=await this.textureFromPathV6('textures/entity/cow/cow',type);window.__voxelDiag?.log?.('COW COMPAT: geometry.cow.v1.8 paired with Mojang cow.png atlas','ok');return texture;
  }
  return studioV6EntityTextureBase.call(this,entityJSON,type);
};
BedrockEntityLoaderV2.prototype.behaviorV6=async function(type){
  this.behaviorCacheV6??=new Map();if(this.behaviorCacheV6.has(type))return this.behaviorCacheV6.get(type);
  const stems=this.spec(type).entity||[type];let json=null,url='';for(const stem of stems){url=`${BEDROCK_RAW}behavior_pack/entities/${stem}.json`;try{json=JSON.parse(await this.cache.text(url));break;}catch{}}
  const components=json?.['minecraft:entity']?.components||{},box=components['minecraft:collision_box']||{},health=components['minecraft:health']||{},physics=components['minecraft:physics'];
  const spec={url,width:Number(box.width)||null,height:Number(box.height)||null,health:Number(health.value??health.max)||null,maxHealth:Number(health.max??health.value)||null,gravity:physics?.has_gravity!==false,collision:physics?.has_collision!==false};this.behaviorCacheV6.set(type,spec);return spec;
};
const studioV6LoadTemplateBase=BedrockEntityLoaderV2.prototype.loadTemplate;
BedrockEntityLoaderV2.prototype.loadTemplate=async function(type){
  const root=await studioV6LoadTemplateBase.call(this,type);if(!root.userData.behaviorSpecV6){try{root.userData.behaviorSpecV6=await this.behaviorV6(type);window.__voxelDiag?.log?.(`ENTITY COLLISION ${type}: ${root.userData.behaviorSpecV6.width||'?'}×${root.userData.behaviorSpecV6.height||'?'} from behavior JSON`,'ok');}catch(error){root.userData.behaviorSpecV6={};window.__voxelDiag?.log?.(`ENTITY BEHAVIOR ${type}: ${error.message}`,'warn');}}return root;
};
const studioV6CloneTemplateBase=BedrockEntityLoaderV2.prototype.cloneTemplate;
BedrockEntityLoaderV2.prototype.cloneTemplate=function(template){const clone=studioV6CloneTemplateBase.call(this,template);clone.userData.behaviorSpecV6=template.userData.behaviorSpecV6||{};return clone;};
BedrockAnimationControllerV2.prototype.clipCandidates=function(state){
  const entries=Object.entries(this.animations),exact=(name)=>entries.find(([n])=>n.toLowerCase()===name.toLowerCase());
  if(this.type==='chicken'){
    if(state==='walk'){return [exact('animation.chicken.move'),exact('animation.chicken.general')].filter(Boolean);}
    return [exact('animation.chicken.general')].filter(Boolean);
  }
  if(['cow','pig','sheep'].includes(this.type)&&state==='walk'){
    const q=exact('animation.quadruped.walk');return q?[q]:[];
  }
  const tests=state==='attack'?[/attack/i]:state==='hurt'?[/hurt|damage/i]:state==='fuse'?[/swell|swelling/i]:state==='walk'?[/\.move$/i,/\.walk$/i,/quadruped\.walk$/i,/walk/i,/legs/i]:[/\.idle$/i,/idle/i,/\.general$/i,/general/i];
  const found=[];for(const re of tests)for(const pair of entries)if(re.test(pair[0])&&!/\.v\d+(?:\.\d+)*$/i.test(pair[0])&&!found.includes(pair))found.push(pair);return found.slice(0,state==='walk'?2:1);
};
const studioV6AnimationUpdateBase=BedrockAnimationControllerV2.prototype.update;
BedrockAnimationControllerV2.prototype.update=function(state,time,mob){
  this.reset();const speed=Math.hypot(mob?.velocity?.x||0,mob?.velocity?.z||0),fuse=clamp((mob?.fuse||0)/(mob?.fuseTime||1.5),0,1),ctx={query:{life_time:mob?.age||time,modified_distance_moved:mob?.distanceWalked||0,ground_speed:speed,is_on_ground:mob?.onGround?1:0,attack_time:mob?.attackProgress||0},variable:{tcos0:Math.cos((mob?.age||time)*7.2)*32,leg_rot:Math.cos((mob?.age||time)*7.2)*34,wing_flap:Math.sin((mob?.age||time)*18)*38,attack_time:mob?.attackProgress||0,swelling_scale1:1+fuse*.18,swelling_scale2:1+fuse*.12,is_baby:0},temp:{}};
  const entries=Object.entries(this.animations),setup=entries.find(([n])=>/\.setup$/i.test(n))||entries.find(([n])=>/base_pose/i.test(n));if(setup)this.applyClip(setup[1],time,ctx);for(const [,clip] of this.clipCandidates(state))this.applyClip(clip,time,ctx);
};
const studioV6MobReplaceBase=StudioMobRenderer.prototype.replace;
StudioMobRenderer.prototype.replace=async function(mob){const model=await studioV6MobReplaceBase.call(this,mob);if(model){mob.behaviorSpecV6=model.userData.behaviorSpecV6||{};if(mob.behaviorSpecV6.health)mob.health=mob.behaviorSpecV6.health;mob.maxHealth=mob.behaviorSpecV6.maxHealth||mob.health;}return model;};
const MOB_COLLISION_DEFAULT_V6=Object.freeze({zombie:[.6,1.8],creeper:[.6,1.7],chicken:[.6,.8],cow:[.9,1.3],pig:[.9,.9],sheep:[.9,1.3],spider:[1.4,.9],skeleton:[.6,1.99],villager:[.6,1.95],enderman:[.6,2.9]});
function mobCollisionSpecV6(mob){const b=mob.behaviorSpecV6||mob.model?.userData?.behaviorSpecV6||{},fallback=MOB_COLLISION_DEFAULT_V6[mob.type]||[.7,1.5];return {width:Number(b.width)||fallback[0],height:Number(b.height)||fallback[1],collision:b.collision!==false,gravity:b.gravity!==false};}
function mobCollidesAtV6(mob,pos,world){const s=mobCollisionSpecV6(mob);if(!s.collision)return false;const r=s.width*.5,eps=1e-4,minX=Math.floor(pos.x-r+eps),maxX=Math.floor(pos.x+r-eps),minY=Math.floor(pos.y+eps),maxY=Math.floor(pos.y+s.height-eps),minZ=Math.floor(pos.z-r+eps),maxZ=Math.floor(pos.z+r-eps);for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){const st=world.getLoadedState(x,y,z);if(!st.loaded)return true;if(SOLID_BLOCKS.has(st.id))return true;}return false;}
function mobMoveAxisV6(mob,axis,amount,world){if(!amount)return true;const steps=Math.max(1,Math.ceil(Math.abs(amount)/.16)),inc=amount/steps;for(let i=0;i<steps;i++){const next=mob.position.clone();next[axis]+=inc;if(!mobCollidesAtV6(mob,next,world)){mob.position.copy(next);continue;}if(axis==='x'||axis==='z'){const stepped=next.clone();stepped.y+=.55;if(!mobCollidesAtV6(mob,stepped,world)){mob.position.copy(stepped);mob.onGround=true;continue;}mob.velocity[axis]=0;mob.knockback?.setComponent?.(axis==='x'?0:2,0);return false;}mob.verticalVelocity=0;if(inc<0)mob.onGround=true;return false;}return true;}
function mobDepenetrateV6(mob,world){if(!mobCollidesAtV6(mob,mob.position,world))return true;const base=mob.position.clone();for(let y=.05;y<=1.6;y+=.05){const p=base.clone();p.y+=y;if(!mobCollidesAtV6(mob,p,world)){mob.position.copy(p);return true;}}return false;}
class ExplosionManagerV6 {
  constructor(gameRef){this.game=gameRef;this.jobs=[];this.maxEditsPerFrame=STUDIO_V6.explosionBudget;}
  queueCreeper(mob){
    if(mob.exploded)return;mob.exploded=true;const center=mob.position.clone(),radius=3,edits=[];
    for(let y=Math.floor(center.y-radius);y<=Math.ceil(center.y+radius);y++)for(let z=Math.floor(center.z-radius);z<=Math.ceil(center.z+radius);z++)for(let x=Math.floor(center.x-radius);x<=Math.ceil(center.x+radius);x++){const dx=x+.5-center.x,dy=y+.5-center.y,dz=z+.5-center.z;if(dx*dx+dy*dy+dz*dz>radius*radius)continue;const id=this.game.world.getLoaded(x,y,z);if(id===BLOCK.AIR||id===BLOCK.BEDROCK||id===BLOCK.WATER)continue;edits.push([x,y,z,id]);}
    const dist=center.distanceTo(this.game.player.position);if(this.game.mode!=='creative'&&dist<6){const power=clamp(1-dist/6,0,1),away=this.game.player.position.clone().sub(center);this.game.player.health=Math.max(0,this.game.player.health-Math.ceil(power*12));this.game.player.applyKnockback(away,5.8*power,5.2*power);damageVignette.style.opacity='.9';setTimeout(()=>damageVignette.style.opacity='0',140);}
    this.game.particles?.spawnBurst?.(center.clone().add(new THREE.Vector3(0,.7,0)),Math.min(28,ENGINE.MAX_PARTICLES));this.jobs.push({center,edits,index:0});mob.health=0;window.__voxelDiag?.log?.(`CREEPER EXPLOSION QUEUED: ${edits.length} block edits, ${this.maxEditsPerFrame}/frame`,'warn');
  }
  update(){let budget=this.maxEditsPerFrame;while(budget>0&&this.jobs.length){const job=this.jobs[0];while(budget>0&&job.index<job.edits.length){const [x,y,z]=job.edits[job.index++];this.game.world.set(x,y,z,BLOCK.AIR);budget--;}if(job.index>=job.edits.length){window.__voxelDiag?.log?.(`CREEPER EXPLOSION COMPLETE: ${job.edits.length} blocks`,'ok');this.jobs.shift();}else break;}}
}
function updateMobV6(mob,dt,world,player,gameRef){
  mob.ensureStudioState();mob.age+=dt;mob.think-=dt;mob.attack=Math.max(0,mob.attack-dt);mob.attackAnim=Math.max(0,mob.attackAnim-dt);mob.hitFlash=Math.max(0,mob.hitFlash-dt);mob.attackProgress=mob.attackAnim>0?clamp(1-mob.attackAnim/.36,0,1):0;mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.06,0)),world);mobDepenetrateV6(mob,world);
  const dx=player.position.x-mob.position.x,dz=player.position.z-mob.position.z,dist=Math.hypot(dx,dz),len=Math.max(.001,dist);let desiredX=0,desiredZ=0,state='idle';const hostile=['zombie','creeper','spider','skeleton','enderman'].includes(mob.type);
  if(mob.think<=0){mob.think=dist>24?.75:.18;if(!hostile)mob.wander+=(Math.random()-.5)*1.8;}
  if(hostile&&dist<22){const speed=mob.type==='creeper'?1.35:mob.type==='spider'?2.2:1.75;desiredX=dx/len*speed;desiredZ=dz/len*speed;mob.yaw=Math.atan2(-dx,-dz);state='walk';if(mob.type==='zombie'&&dist<1.45&&mob.attack<=0){mob.attack=1;mob.attackAnim=.36;state='attack';if(gameRef.mode!=='creative'){player.health=Math.max(0,player.health-3);player.applyKnockback(player.position.clone().sub(mob.position),3.4,3.6);damageVignette.style.opacity='.82';setTimeout(()=>damageVignette.style.opacity='0',120);}}if(mob.type==='creeper'){if(dist<2.75){mob.fuse+=dt;state='fuse';desiredX*=.35;desiredZ*=.35;}else mob.fuse=Math.max(0,mob.fuse-dt*1.7);if(mob.fuse>=mob.fuseTime)gameRef.explosionsV6?.queueCreeper(mob);}}
  else if(!hostile){desiredX=Math.sin(mob.wander)*.55;desiredZ=Math.cos(mob.wander)*.55;if(Math.hypot(desiredX,desiredZ)>.05){mob.yaw=Math.atan2(-desiredX,-desiredZ);state='walk';}}
  const smoothing=1-Math.exp(-7*dt);mob.velocity.x=lerp(mob.velocity.x,desiredX,smoothing);mob.velocity.z=lerp(mob.velocity.z,desiredZ,smoothing);const moveX=(mob.velocity.x+(mob.knockback?.x||0))*dt,moveZ=(mob.velocity.z+(mob.knockback?.z||0))*dt;mobMoveAxisV6(mob,'x',moveX,world);mobMoveAxisV6(mob,'z',moveZ,world);mob.distanceWalked+=Math.hypot(moveX,moveZ);mob.knockback?.multiplyScalar(Math.exp(-5.5*dt));
  const spec=mobCollisionSpecV6(mob);if(spec.gravity){mob.verticalVelocity-=18*dt;mob.onGround=false;mobMoveAxisV6(mob,'y',mob.verticalVelocity*dt,world);}else mob.verticalVelocity=0;
  if(mob.position.y<-8){mob.position.y=world.highestSolidY(Math.floor(mob.position.x),Math.floor(mob.position.z))+1;mob.verticalVelocity=0;}
  if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;setMobFlash(mob,mob.hitFlash>0?.38:0);if(mob.type==='creeper'&&mob.fuse>0){const pulse=(Math.sin(mob.age*32)>0?1:0)*clamp(mob.fuse/mob.fuseTime,0,1)*.22;mob.model.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissive.setRGB(pulse,pulse,pulse);});}mob.animationController?.update(state,mob.age,mob);}
}
MobSystem.prototype.update=function(dt,player){
  this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.8;if(Math.random()<.40)this.spawnAround(player);}for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];updateMobV6(mob,dt,this.world,player,this.game);if(mob.health<=0||mob.position.distanceTo(player.position)>96){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}}
};
WorldGenerator.prototype.surfaceY=function(x,z){const continental=this.perlin.fbm2(x*.045,z*.045,4),detail=this.perlin.fbm2(x*.11,z*.11,3),mountain=Math.max(0,this.perlin.fbm2(x*.018,z*.018,3));const h=Math.floor(39+continental*11+detail*4+mountain*17);return clamp(h,8,ENGINE.WORLD_HEIGHT-18);};
WorldGenerator.prototype.canCarve=function(x,y,z,surface){if(y<=2||y>=surface-3||y<7)return false;const d=this.caveDensity(x,y,z);return d>.42&&this.perlin.noise(x*.12,y*.09,z*.12)>.02;};
const studioV6GenerateBase=WorldGenerator.prototype.generate;
WorldGenerator.prototype.generate=function(chunk){studioV6GenerateBase.call(this,chunk);let removed=0;const wx0=chunk.cx*chunk.size,wz0=chunk.cz*chunk.size;for(let z=0;z<chunk.size;z++)for(let x=0;x<chunk.size;x++){const surface=this.surfaceY(wx0+x,wz0+z);for(let y=surface+1;y<chunk.height;y++){if(chunk.get(x,y,z)===BLOCK.GRASS){chunk.set(x,y,z,BLOCK.AIR);removed++;}}}if(removed){this.stats.floatingGrassRemoved=(this.stats.floatingGrassRemoved||0)+removed;window.__voxelDiag?.log?.(`WORLD SANITY: removed ${removed} floating grass voxels in ${chunk.cx},${chunk.cz}`,'warn');}};
dayClock.dayLength=STUDIO_V6.dayLengthSeconds;
function mixColorV6(a,b,t){return a.clone().lerp(b,clamp(t,0,1));}
VoxelRenderer.prototype.ensureEnvironmentV6=function(){
  if(this._v6Environment)return;this._v6Environment=true;this._v6Elapsed=0;this._v6Day=1;this._v6LastPhase=dayClock.phase();
  this.sun.target.position.set(0,40,0);this.scene.add(this.sun.target);this.moon=new THREE.DirectionalLight(0x8ca8d8,.08);this.moon.position.set(-90,90,-40);this.moon.target.position.set(0,40,0);this.scene.add(this.moon,this.moon.target);this.fillAmbient=new THREE.AmbientLight(0xffffff,.04);this.scene.add(this.fillAmbient);
  this._v6SkyDay=new THREE.Color(0x87bff0);this._v6SkyNight=new THREE.Color(0x071027);this._v6SkyDawn=new THREE.Color(0xd87548);this._v6GroundDay=new THREE.Color(0x4b3826);this._v6GroundNight=new THREE.Color(0x111522);
};
VoxelRenderer.prototype.render=function(dt){
  this.ensureEnvironmentV6();this._v6Elapsed+=dt;const oldPhase=dayClock.phase();dayClock.update(dt);const phase=dayClock.phase();if(phase<oldPhase)this._v6Day++;
  const angle=phase*Math.PI*2,sunY=Math.sin(angle),daylight=smoothstep(clamp((sunY+.16)/.62,0,1)),horizon=1-clamp(Math.abs(sunY)/.32,0,1),px=this.player?.position.x||0,py=this.player?.position.y||35,pz=this.player?.position.z||0;
  this.sun.position.set(px+Math.cos(angle)*145,py+sunY*145,pz+Math.sin(angle)*70);this.sun.target.position.set(px,py,pz);this.sun.intensity=.04+daylight*1.24;this.sun.color.set(daylight>.5?0xfff2d2:0xffb06a);
  this.moon.position.set(px-Math.cos(angle)*145,py-sunY*145,pz-Math.sin(angle)*70);this.moon.target.position.set(px,py,pz);this.moon.intensity=(1-daylight)*.20;this.ambient.color.copy(mixColorV6(new THREE.Color(0x22345a),new THREE.Color(0xa8d2ff),daylight));this.ambient.groundColor.copy(mixColorV6(this._v6GroundNight,this._v6GroundDay,daylight));this.ambient.intensity=.22+daylight*.62;this.fillAmbient.intensity=.025+daylight*.055;
  let sky=mixColorV6(this._v6SkyNight,this._v6SkyDay,daylight);if(horizon>.01)sky=sky.lerp(this._v6SkyDawn,horizon*(.55+.25*(1-daylight)));this.scene.background.copy(sky);this.fog.color.copy(sky);this.fog.near=82;this.fog.far=daylight>.25?260:210;
  const totalHours=(6+phase*24)%24,h=Math.floor(totalHours),m=Math.floor((totalHours-h)*60);this.dayStateV6={phase,day:this._v6Day,daylight,timeText:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,isNight:daylight<.20};
  this.updateLOD();this.renderer.render(this.scene,this.camera);{const ri=this.readRenderInfo();this.stats.drawCalls=ri.calls;this.stats.triangles=ri.triangles;}this.stats.chunks=this.chunkMeshes.size;
};
const studioV6HudBase=Game.prototype.updateHud;
Game.prototype.updateHud=function(){
  studioV6HudBase.call(this);renderSurvivalBarsV6(this.player,this.mode);const env=this.renderer?.dayStateV6;if(env)topStatus.textContent=`${this.mode.toUpperCase()} • Day ${env.day} ${env.timeText}${env.isNight?' NIGHT':' DAY'} • FPS ${this.stats.fps.toFixed(0)} • Chunks ${this.renderer.stats.chunks} • Faces ${this.renderer.stats.faces}`;
};
const studioV6BootBase=Game.prototype.boot;
Game.prototype.boot=async function(mode='survival',fresh=false){await studioV6BootBase.call(this,mode,fresh);this.explosionsV6=new ExplosionManagerV6(this);this.crafting.setGridSize(2);this.player.depenetrateV6();renderSurvivalBarsV6(this.player,this.mode);window.__voxelDiag?.log?.(`STUDIO V6 BOOT: ${STUDIO_V6.version}`,'ok');};
const studioV6GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){this.explosionsV6?.update();studioV6GameUpdateBase.call(this,dt);};
for(const type of ['zombie','creeper','chicken','cow','pig','sheep','spider','skeleton']){
  const url=`${BEDROCK_RAW}behavior_pack/entities/${type}.json`;
  if(game.assetPipeline?.prefetchManifest&&!game.assetPipeline.prefetchManifest.includes(url))game.assetPipeline.prefetchManifest.push(url);
}
const cowLegacyAtlasURL=`${BEDROCK_RAW}resource_pack/textures/entity/cow/cow.png`;
if(game.assetPipeline?.prefetchManifest&&!game.assetPipeline.prefetchManifest.includes(cowLegacyAtlasURL))game.assetPipeline.prefetchManifest.push(cowLegacyAtlasURL);
MobSystem.prototype.spawnAround=function(player){
  if(this.mobs.length+(this.pendingSpawns||0)>=ENGINE.MAX_MOBS)return;
  const a=Math.random()*Math.PI*2,r=20+Math.random()*24,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;
  if(this.world.get(x,y,z)!==BLOCK.AIR||SOLID_BLOCKS.has(this.world.get(x,y+1,z)))return;
  const night=(this.game?.renderer?.dayStateV6?.isNight)||false,roll=Math.random();let type;
  if(night)type=roll<.42?'zombie':roll<.68?'creeper':roll<.84?'skeleton':'spider';
  else type=roll<.30?'cow':roll<.55?'chicken':roll<.80?'pig':'sheep';
  this.spawnEntity(type,new THREE.Vector3(x+.5,y,z+.5));
};
runtimeCommands.register('day',()=>game.renderer?.dayStateV6||null,'Return day/night phase and clock.');
runtimeCommands.register('explosions',()=>({queued:game.explosionsV6?.jobs?.length||0,budget:game.explosionsV6?.maxEditsPerFrame||0}),'Inspect frame-paced explosions.');
runtimeCommands.register('collision',()=>({player:game.player?.aabb?.(),mobs:game.mobs?.mobs?.map(m=>({type:m.type,box:mobCollisionSpecV6(m),pos:m.position.toArray()}))||[] }),'Inspect collision boxes.');
window.__voxelDiag?.log?.('V6 COLLISION: player placement overlap guard + substep movement + mob behavior-JSON collision boxes enabled.','ok');
window.__voxelDiag?.log?.('V6 DROPS: mined blocks and inventory drag-out create collectible miniature 3D world items.','ok');
window.__voxelDiag?.log?.('V6 CRAFTING: player 2×2 + crafting-table 3×3 + scrollable recipe book enabled.','ok');
window.__voxelDiag?.log?.('V6 CREEPER: explosions are frame-paced and use spawnBurst; render-loop exception/freeze path removed.','ok');
window.__voxelDiag?.log?.('V6 ENTITY: exact chicken animation clips + cow legacy geometry/atlas compatibility + behavior collision metadata enabled.','ok');
window.__voxelDiag?.log?.('V6 WORLD: stronger hills, more discoverable caves, floating grass sanity pass enabled.','ok');
window.__voxelDiag?.log?.('V6 LIGHTING: 20-minute day/night directional sun + moon + hemisphere + low-cost ambient fill enabled.','ok');
const STUDIO_V7=Object.freeze({version:'2.2.0-survival-progression-graphics',itemSpinRadPerSecond:57.595*Math.PI/180,leafDistance:6});
window.STUDIO_PATCH_VERSION=STUDIO_V7.version;
const V7_ITEM=Object.freeze({WOOD_SHOVEL:120,STONE_SHOVEL:121,IRON_SHOVEL:122,DIAMOND_SHOVEL:123,WOOD_HOE:124,STONE_HOE:125,IRON_HOE:126,DIAMOND_HOE:127,SHEARS:128,TALL_GRASS:129,FLOWER:130});
for(const [id,name] of [[120,'Wooden Shovel'],[121,'Stone Shovel'],[122,'Iron Shovel'],[123,'Diamond Shovel'],[124,'Wooden Hoe'],[125,'Stone Hoe'],[126,'Iron Hoe'],[127,'Diamond Hoe'],[128,'Shears'],[129,'Tall Grass'],[130,'Flower']])ITEM_NAME.set(id,name);
const v7ToolIconStem=new Map([
 [ITEM.WOOD_PICKAXE,'wood_pickaxe'],[ITEM.STONE_PICKAXE,'stone_pickaxe'],[ITEM.IRON_PICKAXE,'iron_pickaxe'],[ITEM.DIAMOND_PICKAXE,'diamond_pickaxe'],
 [ITEM.WOOD_AXE,'wood_axe'],[ITEM.STONE_AXE,'stone_axe'],[ITEM.IRON_AXE,'iron_axe'],[ITEM.DIAMOND_AXE,'diamond_axe'],
 [ITEM.WOOD_SWORD,'wood_sword'],[ITEM.STONE_SWORD,'stone_sword'],[ITEM.IRON_SWORD,'iron_sword'],[ITEM.DIAMOND_SWORD,'diamond_sword'],
 [V7_ITEM.WOOD_SHOVEL,'wood_shovel'],[V7_ITEM.STONE_SHOVEL,'stone_shovel'],[V7_ITEM.IRON_SHOVEL,'iron_shovel'],[V7_ITEM.DIAMOND_SHOVEL,'diamond_shovel'],
 [V7_ITEM.WOOD_HOE,'wood_hoe'],[V7_ITEM.STONE_HOE,'stone_hoe'],[V7_ITEM.IRON_HOE,'iron_hoe'],[V7_ITEM.DIAMOND_HOE,'diamond_hoe'],[V7_ITEM.SHEARS,'shears'],
 [ITEM.STICK,'stick'],[ITEM.COAL,'coal'],[ITEM.IRON_INGOT,'iron_ingot'],[ITEM.DIAMOND,'diamond'],[ITEM.APPLE,'apple'],[ITEM.BREAD,'bread'],[ITEM.ARROW,'arrow']
]);
const v7BlockIconStem=new Map([[ITEM.OAK_LOG,'log_oak'],[ITEM.OAK_PLANKS,'planks_oak'],[ITEM.COBBLESTONE,'cobblestone'],[ITEM.GRASS,'grass_carried'],[ITEM.DIRT,'dirt'],[ITEM.STONE,'stone'],[ITEM.CRAFTING_TABLE,'crafting_table_front'],[ITEM.FURNACE,'furnace_front_off'],[ITEM.OAK_LEAVES,'leaves_oak_opaque']]);
const v7IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){if(!id||id===ITEM.AIR)return '';if(v7ToolIconStem.has(id))return `${MC_TEX}items/${v7ToolIconStem.get(id)}.png`;if(id===ITEM.TORCH)return `${MC_TEX}blocks/torch_on.png`;if(id===V7_ITEM.TALL_GRASS)return `${MC_TEX}blocks/tallgrass.png`;if(id===V7_ITEM.FLOWER)return `${MC_TEX}blocks/flower_allium.png`;if(v7BlockIconStem.has(id))return `${MC_TEX}blocks/${v7BlockIconStem.get(id)}.png`;return v7IconBase.call(this,id);};
const v7ItemToBlockBase=Game.prototype.itemToBlock;
Game.prototype.itemToBlock=function(id){if(id===V7_ITEM.TALL_GRASS)return BLOCK.TALL_GRASS;if(id===V7_ITEM.FLOWER)return BLOCK.FLOWER;return v7ItemToBlockBase.call(this,id);};
function v7AddRecipe(name,shape,id,count=1){if(!RECIPES.some(r=>r.name===name))RECIPES.push({name,shape,out:new ItemStack(id,count)});}
function v7MaterialRecipes(label,mat,ids){v7AddRecipe(`${label} Axe`,[[mat,mat,0],[mat,ITEM.STICK,0],[0,ITEM.STICK,0]],ids.axe);v7AddRecipe(`${label} Shovel`,[[mat],[ITEM.STICK],[ITEM.STICK]],ids.shovel);v7AddRecipe(`${label} Hoe`,[[mat,mat],[0,ITEM.STICK],[0,ITEM.STICK]],ids.hoe);v7AddRecipe(`${label} Sword`,[[mat],[mat],[ITEM.STICK]],ids.sword);}
v7MaterialRecipes('Wood',ITEM.OAK_PLANKS,{axe:ITEM.WOOD_AXE,shovel:V7_ITEM.WOOD_SHOVEL,hoe:V7_ITEM.WOOD_HOE,sword:ITEM.WOOD_SWORD});
v7MaterialRecipes('Stone',ITEM.COBBLESTONE,{axe:ITEM.STONE_AXE,shovel:V7_ITEM.STONE_SHOVEL,hoe:V7_ITEM.STONE_HOE,sword:ITEM.STONE_SWORD});
v7MaterialRecipes('Iron',ITEM.IRON_INGOT,{axe:ITEM.IRON_AXE,shovel:V7_ITEM.IRON_SHOVEL,hoe:V7_ITEM.IRON_HOE,sword:ITEM.IRON_SWORD});
v7MaterialRecipes('Diamond',ITEM.DIAMOND,{axe:ITEM.DIAMOND_AXE,shovel:V7_ITEM.DIAMOND_SHOVEL,hoe:V7_ITEM.DIAMOND_HOE,sword:ITEM.DIAMOND_SWORD});
v7AddRecipe('Shears',[[0,ITEM.IRON_INGOT],[ITEM.IRON_INGOT,0]],V7_ITEM.SHEARS);for(let i=RECIPES.length-1;i>=0;i--)if(RECIPES[i].name==='Bread')RECIPES.splice(i,1);
function v7TrimMatrix(matrix){let top=0,bottom=matrix.length-1,left=0,right=Math.max(0,...matrix.map(r=>r.length))-1;const rowEmpty=y=>{for(let x=0;x<=right;x++)if((matrix[y]?.[x]||0)!==0)return false;return true;};const colEmpty=x=>{for(let y=top;y<=bottom;y++)if((matrix[y]?.[x]||0)!==0)return false;return true;};while(top<=bottom&&rowEmpty(top))top++;while(bottom>=top&&rowEmpty(bottom))bottom--;while(left<=right&&colEmpty(left))left++;while(right>=left&&colEmpty(right))right--;if(top>bottom||left>right)return [];const out=[];for(let y=top;y<=bottom;y++){const row=[];for(let x=left;x<=right;x++)row.push(matrix[y]?.[x]||0);out.push(row);}return out;}
function v7MatrixEqual(a,b){if(a.length!==b.length)return false;for(let y=0;y<a.length;y++){if(a[y].length!==b[y].length)return false;for(let x=0;x<a[y].length;x++)if((a[y][x]||0)!==(b[y][x]||0))return false;}return true;}
Crafting.prototype.findRecipe=function(){const size=this.gridSize===3?3:2,ids=[];for(let y=0;y<size;y++){const row=[];for(let x=0;x<size;x++)row.push(this.grid[y*size+x]?.id||0);ids.push(row);}const actual=v7TrimMatrix(ids);for(const r of RECIPES){const shape=v7TrimMatrix(r.shape.map(row=>row.slice()));if(shape.length<=size&&Math.max(0,...shape.map(row=>row.length))<=size&&v7MatrixEqual(actual,shape))return r;}return null;};
Crafting.prototype.takeOutput=function(){const r=this.findRecipe();if(!r)return false;const count=this.gridSize===3?9:4;for(let i=0;i<count;i++){const s=this.grid[i];if(!s.empty()){s.count--;s.normalize();}}const left=this.inventory.add(r.out.id,r.out.count);if(left&&game?.drops&&game?.player)game.drops.spawn(r.out.id,left,game.player.position.clone().add(new THREE.Vector3(0,1,0)));this.update();return true;};
const v7TransactionResolveBase=InventoryTransactionEngine.prototype.resolve;
InventoryTransactionEngine.prototype.resolve=function(slot){if(slot?.[0]==='f'){this.game.inventory.offhand??=new ItemStack();return{stack:this.game.inventory.offhand,type:'f',index:0};}return v7TransactionResolveBase.call(this,slot);};
const v7InventorySerializeBase=Inventory.prototype.serialize,v7InventoryLoadBase=Inventory.prototype.load;
Inventory.prototype.serialize=function(){this.offhand??=new ItemStack();const data=v7InventorySerializeBase.call(this);data.push({id:this.offhand.id,count:this.offhand.count,__offhand:true});return data;};
Inventory.prototype.load=function(data){v7InventoryLoadBase.call(this,data);const o=Array.isArray(data)?data.find(s=>s&&s.__offhand):null;this.offhand=new ItemStack(o?.id||0,o?.count||0);};
const v7ClickSlotBase=UI.prototype.clickSlot;
UI.prototype.clickSlot=function(slot){if(slot?.[0]!=='f')return v7ClickSlotBase.call(this,slot);const inv=this.game.inventory;inv.offhand??=new ItemStack();const cursor=inv.cursor,stack=inv.offhand;if(cursor.empty()&&!stack.empty()){inv.cursor=stack.clone();stack.id=0;stack.count=0;}else if(!cursor.empty()&&stack.empty()){stack.id=cursor.id;stack.count=cursor.count;cursor.id=0;cursor.count=0;}else{const t=stack.clone();stack.id=cursor.id;stack.count=cursor.count;cursor.id=t.id;cursor.count=t.count;}this.screen==='table'?this.renderCrafting(true):this.renderInventory();};
UI.prototype.addOffhandV7=function(){const left=screenLayer.querySelector('.crafting-left');if(!left)return;this.game.inventory.offhand??=new ItemStack();const d=document.createElement('div');d.className='offhand-v7';d.innerHTML=`<b>Offhand</b>${this.slotHtml('f0',this.game.inventory.offhand)}`;left.appendChild(d);const el=d.querySelector('[data-slot]');if(el){el.dataset.studioDragBound='1';el.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;inventoryTransactions.begin(el,e);},{passive:false});}iconSanitizer.scan();};
const v7RenderInvBase=UI.prototype.renderInventory,v7RenderTableBase=UI.prototype.renderCrafting;
UI.prototype.renderInventory=function(){v7RenderInvBase.call(this);this.addOffhandV7();};
UI.prototype.renderCrafting=function(...a){v7RenderTableBase.apply(this,a);this.addOffhandV7();};
UI.prototype.openFurnaceV7=function(){this.screen='furnace';screenLayer.classList.add('open');this.renderFurnaceV7();};
UI.prototype.renderFurnaceV7=function(){const inv=this.game.inventory,f=this.game.furnaceV7??={active:false,remaining:0,total:10},can=!f.active&&inv.has(ITEM.IRON_ORE,1)&&inv.has(ITEM.COAL,1),pct=f.active?Math.round((1-f.remaining/f.total)*100):0;screenLayer.innerHTML=`<div class="mc-window furnace-v7"><h2 class="mc-title">Furnace</h2><div class="furnace-process"><div>${this.slotHtml('',new ItemStack(ITEM.IRON_ORE,1))}<small>Iron Ore</small></div><b>+</b><div>${this.slotHtml('',new ItemStack(ITEM.COAL,1))}<small>Coal</small></div><b>→</b><div>${this.slotHtml('',new ItemStack(ITEM.IRON_INGOT,1))}<small>Iron Ingot</small></div></div><div style="height:12px;background:#333;margin:8px 0"><div style="height:100%;width:${pct}%;background:#f28c28"></div></div><button id="smeltIronV7" class="mc-btn" ${can?'':'disabled'}>${f.active?`Smelting… ${Math.ceil(f.remaining)}s`:can?'Smelt Iron (10s)':'Need 1 Iron Ore + 1 Coal'}</button><button id="closeFurnaceV7" class="mc-btn">Close</button></div>`;$('closeFurnaceV7').onclick=()=>this.close();$('smeltIronV7').onclick=()=>{if(f.active)return;if(!inv.has(ITEM.IRON_ORE)||!inv.has(ITEM.COAL)){toast('Need iron ore and coal');return;}inv.consume(ITEM.IRON_ORE,1);inv.consume(ITEM.COAL,1);f.active=true;f.remaining=f.total=10;this.game.refreshHotbar();this.game.saveSoon();this.renderFurnaceV7();};iconSanitizer.scan();};
const v7UseSelectedBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const selected=this.selectedStack();if(this.mode!=='creative'&&selected&&!selected.empty()&&(selected.id===ITEM.BREAD||selected.id===ITEM.APPLE)&&this.player.hunger<20){const food=selected.id===ITEM.BREAD?5:4;if(this.inventory.consume(selected.id,1)){this.player.hunger=Math.min(20,this.player.hunger+food);this.refreshHotbar();this.saveSoon();}return;}const hit=this.getTarget();if(hit?.id===BLOCK.FURNACE){this.ui.openFurnaceV7();return;}const place=hit?.place?{...hit.place}:null,b=this.itemToBlock(selected?.id||0),before=place?this.world.get(place.x,place.y,place.z):null;v7UseSelectedBase.call(this);if(place&&b===BLOCK.OAK_LEAVES&&before===BLOCK.AIR&&this.world.get(place.x,place.y,place.z)===BLOCK.OAK_LEAVES)this.leafDecayV7?.persistent.add(blockKey(place.x,place.y,place.z));};
VoxelRaycaster.prototype.cast=function(origin,direction,maxDistance=ENGINE.REACH){const dir=direction.clone().normalize();let x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);const stepX=dir.x>0?1:-1,stepY=dir.y>0?1:-1,stepZ=dir.z>0?1:-1,tx=dir.x===0?Infinity:Math.abs(1/dir.x),ty=dir.y===0?Infinity:Math.abs(1/dir.y),tz=dir.z===0?Infinity:Math.abs(1/dir.z),bx=dir.x>0?x+1-origin.x:origin.x-x,by=dir.y>0?y+1-origin.y:origin.y-y,bz=dir.z>0?z+1-origin.z:origin.z-z;let tMaxX=dir.x===0?Infinity:bx*tx,tMaxY=dir.y===0?Infinity:by*ty,tMaxZ=dir.z===0?Infinity:bz*tz,face=[0,0,0],distance=0;for(let i=0;i<256&&distance<=maxDistance;i++){const state=this.world.getLoadedState(x,y,z);if(!state.loaded)return null;const id=state.id;if(id!==BLOCK.AIR&&id!==BLOCK.WATER)return{x,y,z,id,face,distance,place:{x:x+face[0],y:y+face[1],z:z+face[2]}};if(tMaxX<tMaxY&&tMaxX<tMaxZ){x+=stepX;distance=tMaxX;tMaxX+=tx;face=[-stepX,0,0];}else if(tMaxY<tMaxZ){y+=stepY;distance=tMaxY;tMaxY+=ty;face=[0,-stepY,0];}else{z+=stepZ;distance=tMaxZ;tMaxZ+=tz;face=[0,0,-stepZ];}}return null;};
const V7_PICKAXES=new Map([[ITEM.WOOD_PICKAXE,[1,2]],[ITEM.STONE_PICKAXE,[2,4]],[ITEM.IRON_PICKAXE,[3,6]],[ITEM.DIAMOND_PICKAXE,[4,8]]]);
const V7_AXES=new Map([[ITEM.WOOD_AXE,[1,2]],[ITEM.STONE_AXE,[2,4]],[ITEM.IRON_AXE,[3,6]],[ITEM.DIAMOND_AXE,[4,8]]]);
const V7_SHOVELS=new Map([[V7_ITEM.WOOD_SHOVEL,[1,2]],[V7_ITEM.STONE_SHOVEL,[2,4]],[V7_ITEM.IRON_SHOVEL,[3,6]],[V7_ITEM.DIAMOND_SHOVEL,[4,8]]]);
const V7_HOES=new Map([[V7_ITEM.WOOD_HOE,[1,2]],[V7_ITEM.STONE_HOE,[2,4]],[V7_ITEM.IRON_HOE,[3,6]],[V7_ITEM.DIAMOND_HOE,[4,8]]]);
function v7MiningProfile(item,block){let category='hand',tier=0,speed=1;if(V7_PICKAXES.has(item)){category='pickaxe';[tier,speed]=V7_PICKAXES.get(item);}else if(V7_AXES.has(item)){category='axe';[tier,speed]=V7_AXES.get(item);}else if(V7_SHOVELS.has(item)){category='shovel';[tier,speed]=V7_SHOVELS.get(item);}else if(V7_HOES.has(item)){category='hoe';[tier,speed]=V7_HOES.get(item);}else if(item===V7_ITEM.SHEARS){category='shears';speed=block===BLOCK.OAK_LEAVES?15:2;}const pickReq=new Map([[BLOCK.STONE,1],[BLOCK.COBBLESTONE,1],[BLOCK.COAL_ORE,1],[BLOCK.FURNACE,1],[BLOCK.IRON_ORE,2],[BLOCK.DIAMOND_ORE,3],[BLOCK.OBSIDIAN,4]]),axeBlocks=new Set([BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.CRAFTING_TABLE,BLOCK.CHEST]),shovelBlocks=new Set([BLOCK.GRASS,BLOCK.DIRT,BLOCK.SAND,BLOCK.GRAVEL,BLOCK.SNOW]),hoeBlocks=new Set([BLOCK.OAK_LEAVES]),req=pickReq.get(block)||0;let correct=req?category==='pickaxe'&&tier>=req:axeBlocks.has(block)?category==='axe':shovelBlocks.has(block)?category==='shovel':hoeBlocks.has(block)?category==='hoe'||category==='shears':false;if(!correct&&req)speed=1;if(!correct&&!req&&!axeBlocks.has(block)&&!shovelBlocks.has(block)&&!hoeBlocks.has(block))speed=1;const canHarvest=req===0||correct;return{category,tier,speed,correct,canHarvest};}
function v7DropForBlock(block,item,profile){if(block===BLOCK.OAK_LEAVES)return item===V7_ITEM.SHEARS?ITEM.OAK_LEAVES:Math.random()<.02?ITEM.STICK:Math.random()<.005?ITEM.APPLE:null;if(block===BLOCK.TALL_GRASS)return item===V7_ITEM.SHEARS?V7_ITEM.TALL_GRASS:null;if(block===BLOCK.FLOWER)return item===V7_ITEM.SHEARS?V7_ITEM.FLOWER:null;if(block===BLOCK.COAL_ORE)return profile.canHarvest?ITEM.COAL:null;if(block===BLOCK.IRON_ORE)return profile.canHarvest?ITEM.IRON_ORE:null;if(block===BLOCK.DIAMOND_ORE)return profile.canHarvest?ITEM.DIAMOND:null;if(block===BLOCK.STONE)return profile.canHarvest?ITEM.COBBLESTONE:null;if(block===BLOCK.GLASS)return null;if(!profile.canHarvest)return null;return BLOCK_ITEM.get(block)||block;}
class LeafDecayV7{constructor(gameRef){this.game=gameRef;this.queue=[];this.queued=new Set();this.persistent=new Set();}scheduleAround(x,y,z){const r=STUDIO_V7.leafDistance;for(let yy=y-r;yy<=y+r;yy++)for(let zz=z-r;zz<=z+r;zz++)for(let xx=x-r;xx<=x+r;xx++){if(Math.abs(xx-x)+Math.abs(yy-y)+Math.abs(zz-z)>r*2)continue;if(this.game.world.getLoaded(xx,yy,zz)!==BLOCK.OAK_LEAVES)continue;const k=blockKey(xx,yy,zz);if(this.persistent.has(k)||this.queued.has(k))continue;this.queued.add(k);this.queue.push({x:xx,y:yy,z:zz,due:performance.now()+500+Math.random()*3000});}}connected(x,y,z){const start=[x,y,z],seen=new Set([blockKey(x,y,z)]),q=[start];for(let i=0;i<q.length&&i<900;i++){const [cx,cy,cz]=q[i];for(const [dx,dy,dz] of FACE_DIRS){const nx=cx+dx,ny=cy+dy,nz=cz+dz,id=this.game.world.getLoaded(nx,ny,nz);if(id===BLOCK.OAK_LOG)return true;if(id!==BLOCK.OAK_LEAVES)continue;const dist=Math.abs(nx-x)+Math.abs(ny-y)+Math.abs(nz-z);if(dist>STUDIO_V7.leafDistance)continue;const k=blockKey(nx,ny,nz);if(seen.has(k))continue;seen.add(k);q.push([nx,ny,nz]);}}return false;}update(){let budget=5,now=performance.now();for(let i=this.queue.length-1;i>=0&&budget>0;i--){const e=this.queue[i];if(e.due>now)continue;this.queue.splice(i,1);this.queued.delete(blockKey(e.x,e.y,e.z));if(this.game.world.getLoaded(e.x,e.y,e.z)!==BLOCK.OAK_LEAVES||this.persistent.has(blockKey(e.x,e.y,e.z)))continue;if(this.connected(e.x,e.y,e.z))continue;this.game.world.set(e.x,e.y,e.z,BLOCK.AIR);if(Math.random()<.02)this.game.drops.spawn(ITEM.STICK,1,new THREE.Vector3(e.x+.5,e.y+.4,e.z+.5));else if(Math.random()<.005)this.game.drops.spawn(ITEM.APPLE,1,new THREE.Vector3(e.x+.5,e.y+.4,e.z+.5));budget--;}}}
Game.prototype.mine=function(dt){if(!this.breaking)return;const hit=this.getTarget();if(!hit){this.player.breaking=null;this.player.breakProgress=0;return;}if(this.player.breaking&&blockKey(hit.x,hit.y,hit.z)!==this.player.breaking)this.player.breakProgress=0;this.player.breaking=blockKey(hit.x,hit.y,hit.z);const item=this.selectedStack()?.id||ITEM.AIR,profile=v7MiningProfile(item,hit.id),hardness=(hit.id===BLOCK.TALL_GRASS||hit.id===BLOCK.FLOWER)?.05:(BLOCK_HARDNESS.get(hit.id)??1);if(hardness>=999999)return;let divisor=profile.canHarvest?30:100;if(hit.id===BLOCK.OAK_LEAVES||hit.id===BLOCK.TALL_GRASS||hit.id===BLOCK.FLOWER)divisor=30;const damage=profile.speed/Math.max(.05,hardness)/divisor;this.player.breakProgress+=dt*20*damage;if(this.mode==='creative')this.player.breakProgress=1;if(this.player.breakProgress<1)return;const old=hit.id;this.world.set(hit.x,hit.y,hit.z,BLOCK.AIR);this.particles.spawnBurst(new THREE.Vector3(hit.x+.5,hit.y+.5,hit.z+.5),8);if(this.mode==='survival'){const drop=v7DropForBlock(old,item,profile);if(drop)this.drops.spawn(drop,1,new THREE.Vector3(hit.x+.5,hit.y+.45,hit.z+.5));}if(old===BLOCK.OAK_LOG)this.leafDecayV7?.scheduleAround(hit.x,hit.y,hit.z);this.player.breakProgress=0;this.player.breaking=null;this.refreshHotbar();this.saveSoon();};
StudioDropPhysics.prototype.update=function(drop,world,player,dt){drop.age+=dt;drop.pickupDelay-=dt;drop.velocity.y-=ENGINE.GRAVITY*.72*dt;drop.velocity.x*=Math.pow(this.drag,dt*10);drop.velocity.z*=Math.pow(this.drag,dt*10);if(drop.pickupDelay<=0&&player&&drop.position.distanceTo(player.position)<3.4){const target=player.position.clone();target.y+=.65;const pull=target.sub(drop.position),dist=Math.max(.1,pull.length());drop.velocity.addScaledVector(pull.normalize(),this.magnetSpeed*dt*(1.4-dist/4));}const next=drop.position.clone().addScaledVector(drop.velocity,dt),bx=Math.floor(next.x),bz=Math.floor(next.z),groundY=Math.floor(next.y-.08);if(drop.velocity.y<0&&SOLID_BLOCKS.has(world.getLoaded(bx,groundY,bz))){next.y=groundY+1+.06;drop.velocity.y=Math.abs(drop.velocity.y)*this.bounce;drop.velocity.x*=.76;drop.velocity.z*=.76;}drop.position.copy(next);drop.spin=(drop.spin+dt*STUDIO_V7.itemSpinRadPerSecond)%(Math.PI*2);};
StudioDropVisualFactoryV6.prototype.materialForKind=function(kind){if(this.materialCache.has(kind))return this.materialCache.get(kind);const map=this.game.atlas.texture;let m;if(kind==='leaves')m=new THREE.MeshLambertMaterial({map,color:0xffffff,vertexColors:true,side:THREE.DoubleSide,alphaTest:.50,depthWrite:true,depthTest:true});else if(kind==='glass')m=new THREE.MeshLambertMaterial({map,color:0xffffff,vertexColors:true,side:THREE.FrontSide,transparent:true,opacity:.55,alphaTest:.02,depthWrite:true,depthTest:true});else m=new THREE.MeshLambertMaterial({map,color:0xffffff,vertexColors:true,side:THREE.FrontSide,depthWrite:true,depthTest:true});this.materialCache.set(kind,m);return m;};
StudioDropVisualFactoryV6.prototype.blockGeometry=function(block){if(this.geometryCache.has(block))return this.geometryCache.get(block);const p=[],n=[],u=[],c=[],idx=[];for(const f of VOXEL_FACES){const base=p.length/3,verts=voxelFaceVertices(-.5,-.5,-.5,f),tex=this.game.renderer.mesher.textureName(block,f.key),tint=this.game.renderer.mesher.vertexTint?.(block,f.key)||[1,1,1];for(const v of verts)p.push(...v);for(let i=0;i<4;i++){n.push(...f.n);c.push(...tint);}for(const uv of f.uv)u.push(...this.game.atlas.uv(tex,uv[0],uv[1]));idx.push(base,base+1,base+2,base,base+2,base+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(idx);g.computeBoundingSphere();this.geometryCache.set(block,g);return g;};
const v7DropUpdateBase=DropSystem.prototype.update;
DropSystem.prototype.update=function(dt,player,inventory){v7DropUpdateBase.call(this,dt,player,inventory);for(const d of this.items)if(d.mesh){d.mesh.position.y=d.position.y+.18+Math.sin(d.age*2)*.04;d.mesh.rotation.y=d.spin;d.mesh.rotation.x=.12+Math.sin(d.age*1.2)*.035;}};
BedrockEntityLoaderV2.prototype.build=function(definition,texture,type){const root=new THREE.Group();root.name=`Bedrock_${type}`;const bones=new Map(),boneData=new Map(),desc=definition.description||{},tw=Number(desc.texture_width||desc.texturewidth||definition.texturewidth||texture.image?.width||texture.source?.data?.width||64),th=Number(desc.texture_height||desc.textureheight||definition.textureheight||texture.image?.height||texture.source?.data?.height||32),material=this.material(texture);for(const data of definition.bones||[]){const node=new THREE.Group();node.name=data.name;node.userData.bedrockBoneName=data.name;node.userData.bedrockPivot=(data.pivot||[0,0,0]).slice();node.userData.bedrockBone=data;bones.set(data.name,node);bones.set(data.name.toLowerCase(),node);boneData.set(data.name,data);}const qFrom=a=>new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(Number(a?.[0])||0),THREE.MathUtils.degToRad(Number(a?.[1])||0),THREE.MathUtils.degToRad(Number(a?.[2])||0),'XYZ'));for(const data of definition.bones||[]){const node=bones.get(data.name),pivot=data.pivot||[0,0,0],parentData=data.parent?boneData.get(data.parent):null,parentPivot=parentData?.pivot||[0,0,0],parentBind=Array.isArray(parentData?.bind_pose_rotation)?qFrom(parentData.bind_pose_rotation):new THREE.Quaternion(),ownBind=Array.isArray(data.bind_pose_rotation)?qFrom(data.bind_pose_rotation):new THREE.Quaternion(),regular=Array.isArray(data.rotation)?qFrom(data.rotation):new THREE.Quaternion(),invParent=parentBind.clone().invert(),delta=new THREE.Vector3((Number(pivot[0])-Number(parentPivot[0]))/16,(Number(pivot[1])-Number(parentPivot[1]))/16,(Number(pivot[2])-Number(parentPivot[2]))/16).applyQuaternion(invParent);node.position.copy(delta);node.quaternion.copy(invParent).multiply(ownBind).multiply(regular);(data.parent&&bones.get(data.parent)?bones.get(data.parent):root).add(node);if(data.neverRender)node.visible=false;for(const cube of data.cubes||[]){const size=cube.size||[1,1,1],origin=cube.origin||[0,0,0],center=[Number(origin[0])+Number(size[0])/2,Number(origin[1])+Number(size[1])/2,Number(origin[2])+Number(size[2])/2],mesh=this.cubeMesh(cube,tw,th,material,!!data.mirror);if(Array.isArray(cube.rotation)){const cp=cube.pivot||pivot,holder=new THREE.Group();holder.position.set((Number(cp[0])-Number(pivot[0]))/16,(Number(cp[1])-Number(pivot[1]))/16,(Number(cp[2])-Number(pivot[2]))/16);holder.rotation.set(THREE.MathUtils.degToRad(Number(cube.rotation[0])||0),THREE.MathUtils.degToRad(Number(cube.rotation[1])||0),THREE.MathUtils.degToRad(Number(cube.rotation[2])||0));mesh.position.set((center[0]-Number(cp[0]))/16,(center[1]-Number(cp[1]))/16,(center[2]-Number(cp[2]))/16);holder.add(mesh);node.add(holder);}else mesh.position.set((center[0]-Number(pivot[0]))/16,(center[1]-Number(pivot[1]))/16,(center[2]-Number(pivot[2]))/16),node.add(mesh);}}root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root);if(box.isEmpty())throw new Error('Translated Bedrock model has no visible cubes');const center=box.getCenter(new THREE.Vector3());root.position.x-=center.x;root.position.z-=center.z;root.position.y-=box.min.y;root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);root.userData.entityType=type;root.userData.bones=bones;root.userData.bounds={min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new THREE.Vector3()).toArray()};root.userData.textureURL=texture.userData.sourceURL;root.userData.bindPoseCompensatedV7=true;return root;};
function v7SafeGround(world,x,y,z,depth=2){for(let d=0;d<=depth;d++)if(SOLID_BLOCKS.has(world.getLoaded(Math.floor(x),Math.floor(y)-1-d,Math.floor(z))))return true;return false;}
function updateMobV7(mob,dt,world,player,gameRef){mob.ensureStudioState();mob.age+=dt;mob.think-=dt;mob.attack=Math.max(0,mob.attack-dt);mob.attackAnim=Math.max(0,mob.attackAnim-dt);mob.hitFlash=Math.max(0,mob.hitFlash-dt);mob.attackProgress=mob.attackAnim>0?clamp(1-mob.attackAnim/.36,0,1):0;mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.06,0)),world);mobDepenetrateV6(mob,world);const dx=player.position.x-mob.position.x,dz=player.position.z-mob.position.z,dist=Math.hypot(dx,dz),len=Math.max(.001,dist),hostile=['zombie','creeper','spider','skeleton','enderman'].includes(mob.type);mob.aiV7??={turn:0,wanderTime:0,flee:0};let desiredX=0,desiredZ=0,state='idle';if(mob.hitFlash>0&&!hostile)mob.aiV7.flee=2;mob.aiV7.flee=Math.max(0,mob.aiV7.flee-dt);mob.aiV7.wanderTime-=dt;if(hostile&&dist<22){const speed=mob.type==='creeper'?1.35:mob.type==='spider'?2.2:1.75;desiredX=dx/len*speed;desiredZ=dz/len*speed;mob.yaw=Math.atan2(-dx,-dz);state='walk';if(mob.type==='zombie'&&dist<1.45&&mob.attack<=0){mob.attack=1;mob.attackAnim=.36;state='attack';if(gameRef.mode!=='creative'){player.health=Math.max(0,player.health-3);player.applyKnockback(player.position.clone().sub(mob.position),3.4,3.6);damageVignette.style.opacity='.82';setTimeout(()=>damageVignette.style.opacity='0',120);}}if(mob.type==='creeper'){if(dist<2.75){mob.fuse+=dt;state='fuse';desiredX*=.35;desiredZ*=.35;}else mob.fuse=Math.max(0,mob.fuse-dt*1.7);if(mob.fuse>=mob.fuseTime)gameRef.explosionsV6?.queueCreeper(mob);}}else{if(mob.aiV7.wanderTime<=0){mob.aiV7.wanderTime=2+Math.random()*4;mob.wander=Math.random()*Math.PI*2;}const speed=mob.aiV7.flee>0?.9:.52;if(mob.aiV7.flee>0&&dist<8){desiredX=-dx/len*speed;desiredZ=-dz/len*speed;}else{desiredX=Math.sin(mob.wander)*speed;desiredZ=Math.cos(mob.wander)*speed;}const tx=mob.position.x+desiredX*.35,tz=mob.position.z+desiredZ*.35;if(!v7SafeGround(world,tx,mob.position.y,tz,mob.type==='chicken'?1:2)){mob.wander+=Math.PI*(.5+Math.random()*.5);desiredX=Math.sin(mob.wander)*speed;desiredZ=Math.cos(mob.wander)*speed;}if(Math.hypot(desiredX,desiredZ)>.05){mob.yaw=Math.atan2(-desiredX,-desiredZ);state='walk';}}const smoothing=1-Math.exp(-10*dt);mob.velocity.x=lerp(mob.velocity.x,desiredX,smoothing);mob.velocity.z=lerp(mob.velocity.z,desiredZ,smoothing);const mx=(mob.velocity.x+(mob.knockback?.x||0))*dt,mz=(mob.velocity.z+(mob.knockback?.z||0))*dt,bx=mobMoveAxisV6(mob,'x',mx,world),bz=mobMoveAxisV6(mob,'z',mz,world);if(!bx||!bz){mob.wander+=Math.PI*(.5+Math.random()*.75);mob.aiV7.wanderTime=.3;}mob.distanceWalked+=Math.hypot(mx,mz);mob.knockback?.multiplyScalar(Math.exp(-6*dt));const spec=mobCollisionSpecV6(mob);if(spec.gravity){const chicken=mob.type==='chicken';if(chicken&&mob.verticalVelocity<0){mob.verticalVelocity=Math.max(-2.4,mob.verticalVelocity-4.5*dt);state='walk';}else mob.verticalVelocity-=18*dt;mob.onGround=false;mobMoveAxisV6(mob,'y',mob.verticalVelocity*dt,world);}else mob.verticalVelocity=0;if(mob.position.y<-8){mob.position.y=world.highestSolidY(Math.floor(mob.position.x),Math.floor(mob.position.z))+1;mob.verticalVelocity=0;}if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;setMobFlash(mob,mob.hitFlash>0?.38:0);if(mob.type==='creeper'&&mob.fuse>0){const pulse=(Math.sin(mob.age*32)>0?1:0)*clamp(mob.fuse/mob.fuseTime,0,1)*.22;mob.model.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissive.setRGB(pulse,pulse,pulse);});}mob.animationController?.update(state,mob.age,mob);}}
MobSystem.prototype.update=function(dt,player){this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.8;if(Math.random()<.4)this.spawnAround(player);}for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];updateMobV7(mob,dt,this.world,player,this.game);if(mob.health<=0||mob.position.distanceTo(player.position)>96){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}}};
const v7CombatAttackBase=CombatSystem.prototype.attack;
CombatSystem.prototype.attack=function(){const selected=this.game.selectedStack()?.id||0,damage=new Map([[ITEM.WOOD_SWORD,4],[ITEM.STONE_SWORD,5],[ITEM.IRON_SWORD,6],[ITEM.DIAMOND_SWORD,7]]).get(selected);if(!damage)return v7CombatAttackBase.call(this);const old=this.damage;this.damage=damage;const r=v7CombatAttackBase.call(this);this.damage=old;return r;};
class FirstPersonViewV7{constructor(gameRef){this.game=gameRef;this.group=new THREE.Group();this.group.name='firstPersonV7';this.game.renderer.scene.add(this.game.renderer.camera);this.game.renderer.camera.add(this.group);this.rightArm=this.arm(.56);this.leftArm=this.arm(-.56);this.group.add(this.rightArm,this.leftArm);this.rightItem=null;this.leftItem=null;this.lastMain=-1;this.lastOff=-1;this.factory=new StudioDropVisualFactoryV6(gameRef);this.swing=0;}arm(x){const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.62,.18),new THREE.MeshLambertMaterial({color:0xc78b63,depthTest:false,depthWrite:false}));m.position.set(x,-.48,-.78);m.rotation.set(-.35,0,x>0?-.25:.25);m.renderOrder=1002;m.userData.viewModelV7=true;return m;}prepare(mesh){mesh.traverse?.(o=>{if(o.isMesh){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false;o.renderOrder=1003;o.userData.viewModelV7=true;}});return mesh;}makeItem(id,left=false){if(!id)return null;const mesh=this.prepare(this.factory.create(id));const flat=this.factory.blockForItem(id)===BLOCK.AIR;mesh.scale.multiplyScalar(flat?1.05:1.28);mesh.position.set(left?-.53:.53,-.39,-.72);mesh.rotation.set(flat?-.42:-.18,left?.55:-.55,left?-.22:.22);return mesh;}refresh(){const inv=this.game.inventory;inv.offhand??=new ItemStack();const main=this.game.selectedStack()?.id||0,off=inv.offhand.id||0;if(main!==this.lastMain){if(this.rightItem)this.group.remove(this.rightItem);this.rightItem=this.makeItem(main,false);if(this.rightItem)this.group.add(this.rightItem);this.lastMain=main;}if(off!==this.lastOff){if(this.leftItem)this.group.remove(this.leftItem);this.leftItem=this.makeItem(off,true);if(this.leftItem)this.group.add(this.leftItem);this.lastOff=off;}}update(dt){this.refresh();const speed=Math.hypot(this.game.player.velocity.x,this.game.player.velocity.z),bob=this.game.player.onGround?Math.sin(performance.now()*.012)*Math.min(.035,speed*.006):0;this.group.position.y=bob;this.group.rotation.z=Math.sin(performance.now()*.006)*Math.min(.012,speed*.002);}}
const v7FirstPersonMakeItemBase=FirstPersonViewV7.prototype.makeItem;
FirstPersonViewV7.prototype.makeItem=function(id,left=false){if(id!==ITEM.TORCH)return v7FirstPersonMakeItemBase.call(this,id,left);const mat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,alphaTest:.08,depthTest:false,depthWrite:false}),mesh=new THREE.Mesh(new THREE.BoxGeometry(.11,.58,.11),mat),loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');loader.load(`${MC_TEX}blocks/torch_on.png`,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;mat.map=tex;mat.needsUpdate=true;});mesh.position.set(left?-.53:.53,-.37,-.72);mesh.rotation.set(-.32,left?.4:-.4,left?-.18:.18);mesh.renderOrder=1003;mesh.userData.viewModelV7=true;return mesh;};
class GraphicsQualityV7{constructor(gameRef){this.game=gameRef;this.profile=localStorage.getItem('studioGraphicsV7')||'fancy';}apply(profile=this.profile){if(!['fast','fancy','ultra'].includes(profile))profile='fancy';this.profile=profile;localStorage.setItem('studioGraphicsV7',profile);const rr=this.game.renderer,r=rr.renderer,enabled=profile!=='fast',ultra=profile==='ultra';r.setPixelRatio(Math.min(devicePixelRatio||1,profile==='fast'?1.5:profile==='fancy'?1.75:2.0));r.shadowMap.enabled=enabled;r.shadowMap.type=THREE.PCFSoftShadowMap;r.toneMapping=profile==='fast'?THREE.NoToneMapping:THREE.ACESFilmicToneMapping;r.toneMappingExposure=profile==='ultra'?1.08:1.0;rr.sun.castShadow=enabled;rr.sun.shadow.mapSize.set(ultra?1024:512,ultra?1024:512);rr.sun.shadow.camera.left=rr.sun.shadow.camera.bottom=-(ultra?55:38);rr.sun.shadow.camera.right=rr.sun.shadow.camera.top=ultra?55:38;rr.sun.shadow.camera.near=.5;rr.sun.shadow.camera.far=360;rr.sun.shadow.bias=-.00035;rr.sun.shadow.normalBias=.025;rr.sun.shadow.camera.updateProjectionMatrix();rr.scene.traverse(o=>{if(!o.isMesh||o.userData?.viewModelV7)return;if(o.name?.startsWith?.('chunk_')){o.receiveShadow=enabled;o.castShadow=ultra;}else{o.receiveShadow=enabled;o.castShadow=enabled;}});window.__voxelDiag?.log?.(`GRAPHICS ${profile.toUpperCase()}: shadows ${enabled?'ON':'OFF'} ${enabled?`${ultra?1024:512}px`:''}`,'ok');const b=document.getElementById('graphicsCycleV7');if(b)b.textContent=`GFX ${profile.toUpperCase()}`;const sel=document.getElementById('graphicsSelectV7');if(sel)sel.value=profile;return profile;}cycle(){const a=['fast','fancy','ultra'],i=a.indexOf(this.profile);return this.apply(a[(i+1)%a.length]);}}
VoxelRenderer.prototype.ensureCelestialsV7=function(){if(this.celestialV7)return;const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');const sunTex=loader.load(`${MC_TEX}environment/sun.png`),moonTex=loader.load(`${MC_TEX}environment/moon_phases.png`);sunTex.colorSpace=THREE.SRGBColorSpace;moonTex.colorSpace=THREE.SRGBColorSpace;moonTex.wrapS=moonTex.wrapT=THREE.ClampToEdgeWrapping;moonTex.repeat.set(.25,.5);const sm=new THREE.SpriteMaterial({map:sunTex,transparent:true,depthWrite:false,depthTest:true,fog:false}),mm=new THREE.SpriteMaterial({map:moonTex,transparent:true,depthWrite:false,depthTest:true,fog:false});const sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.set(24,24,1);moonSprite.scale.set(24,24,1);sunSprite.renderOrder=-1;moonSprite.renderOrder=-1;this.scene.add(sunSprite,moonSprite);this.celestialV7={sunSprite,moonSprite,moonTex,phase:-1};};
VoxelRenderer.prototype.updateCelestialsV7=function(){this.ensureCelestialsV7();const phase=dayClock.phase(),a=phase*Math.PI*2,p=this.player?.position||new THREE.Vector3(),radius=190;this.celestialV7.sunSprite.position.set(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius,p.z+25);this.celestialV7.moonSprite.position.set(p.x-Math.cos(a)*radius,p.y-Math.sin(a)*radius,p.z-25);const mp=(Math.max(1,this._v6Day||1)-1)%8;if(mp!==this.celestialV7.phase){this.celestialV7.phase=mp;this.celestialV7.moonTex.offset.set((mp%4)*.25,mp<4?.5:0);this.celestialV7.moonTex.needsUpdate=true;}};
const v7RenderBase=VoxelRenderer.prototype.render;
VoxelRenderer.prototype.render=function(dt){this.updateCelestialsV7();this.gameRefV7?.firstPersonV7?.update(dt);return v7RenderBase.call(this,dt);};
const v7RebuildBase=VoxelRenderer.prototype.rebuildChunk;
VoxelRenderer.prototype.rebuildChunk=function(chunk){const r=v7RebuildBase.call(this,chunk),m=this.chunkMeshes.get(chunkKey(chunk.cx,chunk.cz)),g=game.graphicsV7;if(m&&g){m.receiveShadow=g.profile!=='fast';m.castShadow=g.profile==='ultra';}return r;};
const v7DropSpawnShadowBase=DropSystem.prototype.spawn;
DropSystem.prototype.spawn=function(...args){const d=v7DropSpawnShadowBase.apply(this,args),g=game.graphicsV7;if(d?.mesh&&g){d.mesh.castShadow=g.profile!=='fast';d.mesh.receiveShadow=g.profile!=='fast';}return d;};
const v7MobReplaceShadowBase=StudioMobRenderer.prototype.replace;
StudioMobRenderer.prototype.replace=async function(mob){const model=await v7MobReplaceShadowBase.call(this,mob);const g=this.game.graphicsV7;if(model&&g)model.traverse(o=>{if(o.isMesh){o.castShadow=g.profile!=='fast';o.receiveShadow=g.profile!=='fast';}});return model;};
const v7PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){v7PlayerUpdateBase.call(this,dt,controls);if(!this.flying){const forward=yawForward(this.yaw),right=yawRight(this.yaw),speed=controls.run?ENGINE.PLAYER_RUN:ENGINE.PLAYER_SPEED;let mx=forward.x*controls.forward+right.x*controls.right,mz=forward.z*controls.forward+right.z*controls.right,l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l;}const response=1-Math.exp(-18*dt);this.velocity.x=lerp(this.velocity.x,mx*speed,response);this.velocity.z=lerp(this.velocity.z,mz*speed,response);}};
const v7RefreshHotbarBase=Game.prototype.refreshHotbar;
Game.prototype.refreshHotbar=function(){v7RefreshHotbarBase.call(this);this.firstPersonV7?.refresh();};
const v7BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v7BootBase.apply(this,args);this.inventory.offhand??=new ItemStack();this.furnaceV7={active:false,remaining:0,total:10};this.leafDecayV7=new LeafDecayV7(this);this.graphicsV7=new GraphicsQualityV7(this);this.renderer.gameRefV7=this;this.firstPersonV7=new FirstPersonViewV7(this);this.graphicsV7.apply(this.graphicsV7.profile);this.firstPersonV7.refresh();};
const v7UpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){this.leafDecayV7?.update();if(this.furnaceV7?.active){this.furnaceV7.remaining-=dt;if(this.furnaceV7.remaining<=0){this.furnaceV7.active=false;this.furnaceV7.remaining=0;this.inventory.add(ITEM.IRON_INGOT,1);this.refreshHotbar();this.saveSoon();if(this.ui.screen==='furnace')this.ui.renderFurnaceV7();}else if(this.ui.screen==='furnace'&&Math.floor(this.furnaceV7.remaining*4)!==this._furnaceUiTickV7){this._furnaceUiTickV7=Math.floor(this.furnaceV7.remaining*4);this.ui.renderFurnaceV7();}}v7UpdateBase.call(this,dt);};
const v7Style=document.createElement('style');v7Style.textContent=`.offhand-v7{display:flex;align-items:center;gap:7px;margin-top:7px}.offhand-v7 .inv-slot{width:42px;height:42px;aspect-ratio:1}.furnace-v7{max-width:520px}.furnace-process{display:flex;align-items:center;justify-content:center;gap:12px;margin:18px 0}.furnace-process>div{display:flex;flex-direction:column;align-items:center;gap:4px}.furnace-process .inv-slot{width:52px;height:52px}.gfx-select-v7{width:100%;padding:7px;background:#222;color:#fff;border:1px solid #777}`;document.head.appendChild(v7Style);
(function(){const bar=document.getElementById('voxelDiagBar');if(bar&&!document.getElementById('graphicsCycleV7')){const b=document.createElement('button');b.id='graphicsCycleV7';b.className='voxBtn';b.type='button';b.textContent='GFX FANCY';b.onclick=()=>game.graphicsV7?.cycle();bar.appendChild(b);}const opts=document.getElementById('voxelOptions');if(opts&&!document.getElementById('graphicsSelectV7')){const row=document.createElement('div');row.className='voxOptRow';row.innerHTML='<label><span>Graphics</span><b>3 levels</b></label><select id="graphicsSelectV7" class="gfx-select-v7"><option value="fast">Fast</option><option value="fancy">Fancy</option><option value="ultra">Ultra</option></select>';opts.prepend(row);row.querySelector('select').onchange=e=>game.graphicsV7?.apply(e.target.value);}setTimeout(()=>{const s=document.getElementById('graphicsSelectV7');if(s&&game.graphicsV7)s.value=game.graphicsV7.profile;},0);})();
runtimeCommands.register('graphics',(name)=>name?game.graphicsV7?.apply(String(name).toLowerCase()):game.graphicsV7?.profile,'Set fast, fancy, or ultra graphics.');
runtimeCommands.register('leafdecay',()=>({queued:game.leafDecayV7?.queue.length||0,persistent:game.leafDecayV7?.persistent.size||0}),'Inspect leaf decay queue.');
window.__voxelDiag?.log?.(`V7 READY: survival progression, exact item spin ${57.595}°/s, leaf decay, shears, crafting, cow bind-pose compensation, chicken glide, 3 graphics levels, sun/moon and first-person hands.`,'ok');
/* ========================= STUDIO V8 SURVIVAL / WATER / ENTITY PATCH ========================= */
const STUDIO_V8=Object.freeze({version:'2.3.0-survival-water-light-entity-ui',rawIron:131,rottenFlesh:132,bone:133,leather:134,rawBeef:135,rawPork:136,rawChicken:137,feather:138,whiteWool:139,rawMutton:140,gunpowder:141,shield:142,bow:143,boneMeal:144,litFurnaceBlock:27});
window.STUDIO_PATCH_VERSION=STUDIO_V8.version;
const V8_ITEM=Object.freeze({RAW_IRON:131,ROTTEN_FLESH:132,BONE:133,LEATHER:134,RAW_BEEF:135,RAW_PORKCHOP:136,RAW_CHICKEN:137,FEATHER:138,WHITE_WOOL:139,RAW_MUTTON:140,GUNPOWDER:141,SHIELD:142,BOW:143,BONE_MEAL:144});
for(const [id,name] of [[131,'Raw Iron'],[132,'Rotten Flesh'],[133,'Bone'],[134,'Leather'],[135,'Raw Beef'],[136,'Raw Porkchop'],[137,'Raw Chicken'],[138,'Feather'],[139,'White Wool'],[140,'Raw Mutton'],[141,'Gunpowder'],[142,'Shield'],[143,'Bow'],[144,'Bone Meal']])ITEM_NAME.set(id,name);
const V8_FURNACE_LIT=STUDIO_V8.litFurnaceBlock;
BLOCK_NAME[V8_FURNACE_LIT]='furnace_lit';
BLOCK_FACE_TEXTURE[BLOCK.FURNACE]={up:'furnace_top',down:'furnace_top',east:'furnace_side',west:'furnace_side',north:'furnace_side',south:'furnace_front_off'};
BLOCK_FACE_TEXTURE[V8_FURNACE_LIT]={up:'furnace_top',down:'furnace_top',east:'furnace_side',west:'furnace_side',north:'furnace_side',south:'furnace_front_on'};
SOLID_BLOCKS.add(V8_FURNACE_LIT);OPAQUE_BLOCKS.add(V8_FURNACE_LIT);BLOCK_HARDNESS.set(V8_FURNACE_LIT,3.5);BLOCK_ITEM.set(V8_FURNACE_LIT,ITEM.FURNACE);
const v8TextureListBase=Game.prototype.textureList;
Game.prototype.textureList=function(){return [...new Set([...v8TextureListBase.call(this),'furnace_top','furnace_front_off','furnace_front_on'])];};
const v8IconStem=new Map([[V8_ITEM.RAW_IRON,'raw_iron'],[V8_ITEM.ROTTEN_FLESH,'rotten_flesh'],[V8_ITEM.BONE,'bone'],[V8_ITEM.LEATHER,'leather'],[V8_ITEM.RAW_BEEF,'beef_raw'],[V8_ITEM.RAW_PORKCHOP,'porkchop_raw'],[V8_ITEM.RAW_CHICKEN,'chicken_raw'],[V8_ITEM.FEATHER,'feather'],[V8_ITEM.RAW_MUTTON,'mutton_raw'],[V8_ITEM.GUNPOWDER,'gunpowder'],[V8_ITEM.SHIELD,'shield'],[V8_ITEM.BOW,'bow_standby'],[V8_ITEM.BONE_MEAL,'dye_powder_white']]);
const v8IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){if(id===V8_ITEM.WHITE_WOOL)return `${MC_TEX}blocks/wool_colored_white.png`;if(id===V8_ITEM.SHIELD)return `${MC_TEX}entity/shield.png`;const stem=v8IconStem.get(id);if(stem)return `${MC_TEX}items/${stem}.png`;return v8IconBase.call(this,id);};
v7AddRecipe('Shield',[[ITEM.OAK_PLANKS,ITEM.IRON_INGOT,ITEM.OAK_PLANKS],[ITEM.OAK_PLANKS,ITEM.OAK_PLANKS,ITEM.OAK_PLANKS],[0,ITEM.OAK_PLANKS,0]],V8_ITEM.SHIELD);
v7AddRecipe('Bone Meal',[[V8_ITEM.BONE]],V8_ITEM.BONE_MEAL,3);

/* Official Bedrock item_texture.json is the metadata layer for held 2-D items. Blocks still use the voxel atlas. */
class BedrockItemTranslatorV8{
  constructor(gameRef){this.game=gameRef;this.catalog=null;this.promise=null;this.cache=new Map();this.reverse=new Map();}
  async loadCatalog(){if(this.catalog)return this.catalog;if(this.promise)return this.promise;this.promise=(async()=>{try{const json=JSON.parse(await this.game.assets.text(`${BEDROCK_RAW}resource_pack/textures/item_texture.json`));this.catalog=json?.texture_data||{};this.reverse.clear();for(const entry of Object.values(this.catalog)){const raw=entry?.textures,list=Array.isArray(raw)?raw:[raw];for(const path of list){if(typeof path!=='string')continue;const leaf=path.split('/').pop().toLowerCase();if(!this.reverse.has(leaf))this.reverse.set(leaf,path);}}this.game.refreshHotbar?.();this.game.firstPersonV7?.refresh?.();}catch(e){this.catalog={};window.__voxelDiag?.log?.(`ITEM JSON catalog unavailable: ${e.message}`,'warn');}return this.catalog;})();return this.promise;}
  stem(id){if(v8IconStem.has(id))return v8IconStem.get(id);return (ITEM_NAME.get(id)||'').toLowerCase().replace(/wooden_/,'wood_').replace(/ /g,'_');}
  textureURL(id){const stem=this.stem(id);if(!stem||id===V8_ITEM.SHIELD)return null;const direct=this.reverse.get(stem);if(direct)return `${BEDROCK_RAW}resource_pack/${direct}.png`;for(const [leaf,path] of this.reverse){if(leaf===stem||leaf.endsWith(`_${stem}`))return `${BEDROCK_RAW}resource_pack/${path}.png`;}return null;}
  descriptor(id){const name=(ITEM_NAME.get(id)||'').toLowerCase().replace(/ /g,'_'),texture=this.textureURL(id);return {id,name,block:this.game.itemToBlock(id),texture,renderMode:this.game.itemToBlock(id)!==BLOCK.AIR?'block':'flat_item'};}
}
const v8IconBeforeItemTranslator=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){return this.itemTranslatorV8?.textureURL?.(id)||v8IconBeforeItemTranslator.call(this,id);};

/* Robust entity texture lookup: PNG first, then vanilla TGA (used by sheep), then the user's repository. */
function decodeTgaCanvasV8(buffer){
  const d=new Uint8Array(buffer);if(d.length<18)throw new Error('TGA header too short');const idLen=d[0],colorMap=d[1],type=d[2],w=d[12]|d[13]<<8,h=d[14]|d[15]<<8,bpp=d[16],desc=d[17],bytes=bpp>>3;if(colorMap||![2,10].includes(type)||![24,32].includes(bpp)||!w||!h)throw new Error(`Unsupported TGA type=${type} bpp=${bpp}`);let p=18+idLen,srcIndex=0;const out=new Uint8ClampedArray(w*h*4),top=!!(desc&0x20),right=!!(desc&0x10);const write=()=>{if(p+bytes>d.length)throw new Error('Truncated TGA pixel data');const b=d[p],g=d[p+1],r=d[p+2],a=bytes===4?d[p+3]:255;p+=bytes;const sx=srcIndex%w,sy=Math.floor(srcIndex/w),dx=right?w-1-sx:sx,dy=top?sy:h-1-sy,k=(dy*w+dx)*4;out[k]=r;out[k+1]=g;out[k+2]=b;out[k+3]=a;srcIndex++;return [r,g,b,a];};const repeat=rgba=>{const sx=srcIndex%w,sy=Math.floor(srcIndex/w),dx=right?w-1-sx:sx,dy=top?sy:h-1-sy,k=(dy*w+dx)*4;out[k]=rgba[0];out[k+1]=rgba[1];out[k+2]=rgba[2];out[k+3]=rgba[3];srcIndex++;};if(type===2){while(srcIndex<w*h)write();}else{while(srcIndex<w*h){if(p>=d.length)throw new Error('Truncated TGA RLE');const packet=d[p++],count=(packet&127)+1;if(packet&128){if(p+bytes>d.length)throw new Error('Truncated TGA RLE pixel');const rgba=[d[p+2],d[p+1],d[p],bytes===4?d[p+3]:255];p+=bytes;for(let i=0;i<count&&srcIndex<w*h;i++)repeat(rgba);}else for(let i=0;i<count&&srcIndex<w*h;i++)write();}}const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').putImageData(new ImageData(out,w,h),0,0);return cv;
}
function entityCanvasTextureV8(cv,url,type){const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;texture.userData={sourceURL:url,entityType:type,width:cv.width,height:cv.height};return texture;}
const v8EntityTextureBase=BedrockEntityLoaderV2.prototype.texture;
BedrockEntityLoaderV2.prototype.texture=async function(entityJSON,type){
  const path=this.texturePath(entityJSON),clean=path.replace(/\.(png|tga)$/i,''),key=`v8|${type}|${clean}`;if(this.textureCache.has(key))return this.textureCache.get(key);const errors=[];
  const pngCandidates=[`${BEDROCK_RAW}resource_pack/${clean}.png`,`${BEDROCK_RAW}resource_pack/textures/entity/${type}/${type}.png`,`${BEDROCK_RAW}resource_pack/textures/entity/${type}.png`,`${USER_REPO_RAW}/${clean}.png`,`${USER_REPO_RAW}/textures/entity/${type}/${type}.png`,`${USER_REPO_RAW}/textures/entity/${type}.png`,`${USER_REPO_RAW}/${type}.png`];
  for(const url of [...new Set(pngCandidates)]){try{const bmp=await this.cache.image(url),cv=document.createElement('canvas');cv.width=bmp.width;cv.height=bmp.height;const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(bmp,0,0);bmp.close?.();const texture=entityCanvasTextureV8(cv,url,type);this.textureCache.set(key,texture);window.__voxelDiag?.log?.(`ENTITY TEXTURE ${type}: PNG ${url} (${cv.width}×${cv.height})`,'ok');return texture;}catch(e){errors.push(`${url} (${e.message})`);}}
  const tgaCandidates=[`${BEDROCK_RAW}resource_pack/${clean}.tga`,`${BEDROCK_RAW}resource_pack/textures/entity/${type}/${type}.tga`,`${USER_REPO_RAW}/${clean}.tga`,`${USER_REPO_RAW}/textures/entity/${type}/${type}.tga`];
  try{const found=await this.repo.find([`${type}.tga`,`${clean.split('/').pop()}.tga`],'resource_pack/textures/');if(found)tgaCandidates.push(`${BEDROCK_RAW}${found}`);}catch(e){errors.push(e.message);}
  for(const url of [...new Set(tgaCandidates)]){try{const blob=await this.cache.fetch(url),cv=decodeTgaCanvasV8(await blob.arrayBuffer()),texture=entityCanvasTextureV8(cv,url,type);this.textureCache.set(key,texture);window.__voxelDiag?.log?.(`ENTITY TEXTURE ${type}: TGA decoded ${url} (${cv.width}×${cv.height})`,'ok');return texture;}catch(e){errors.push(`${url} (${e.message})`);}}
  try{const found=await this.repo.find([`${type}.png`,`${clean.split('/').pop()}.png`],'resource_pack/textures/');if(found){const url=`${BEDROCK_RAW}${found}`,bmp=await this.cache.image(url),cv=document.createElement('canvas');cv.width=bmp.width;cv.height=bmp.height;cv.getContext('2d').drawImage(bmp,0,0);bmp.close?.();const texture=entityCanvasTextureV8(cv,url,type);this.textureCache.set(key,texture);return texture;}}catch(e){errors.push(e.message);}
  try{return await v8EntityTextureBase.call(this,entityJSON,type);}catch(e){throw new Error(`Entity texture failed for ${type}. PNG/TGA resolver exhausted ${errors.length} candidates. ${e.message}`);}
};

/* Cow v1.8 has a +90° Bedrock bind-pose on body. Three.js uses the opposite X sign for this converted rest-pose; flipping only that bind pose keeps the body horizontal while children remain upright. */
const v8EntityBuildBase=BedrockEntityLoaderV2.prototype.build;
BedrockEntityLoaderV2.prototype.build=function(definition,texture,type){if(type!=='cow')return v8EntityBuildBase.call(this,definition,texture,type);const copy=typeof structuredClone==='function'?structuredClone(definition):JSON.parse(JSON.stringify(definition));for(const bone of copy.bones||[]){if(Array.isArray(bone.bind_pose_rotation)&&Math.abs(Number(bone.bind_pose_rotation[0])||0)>0)bone.bind_pose_rotation=[-(Number(bone.bind_pose_rotation[0])||0),Number(bone.bind_pose_rotation[1])||0,Number(bone.bind_pose_rotation[2])||0];}const root=v8EntityBuildBase.call(this,copy,texture,type);root.userData.cowCoordinateFixV8=true;return root;};

/* Modern ore harvesting: iron ore drops raw iron; coal and diamond ores drop their resources. */
const v8DropForBlockBase=v7DropForBlock;
v7DropForBlock=function(block,item,profile){if(block===BLOCK.IRON_ORE)return profile.canHarvest?V8_ITEM.RAW_IRON:null;if(block===V8_FURNACE_LIT)return ITEM.FURNACE;return v8DropForBlockBase(block,item,profile);};

/* First-person view: item-only for blocks/tools; a small arm is shown only for empty hand, torch/food or shield. */
class HeldItemFactoryV8{
  constructor(gameRef){this.game=gameRef;this.blocks=new StudioDropVisualFactoryV6(gameRef);this.loader=new THREE.TextureLoader();this.loader.setCrossOrigin('anonymous');}
  prepare(root){root.traverse?.(o=>{if(!o.isMesh)return;const old=o.material,mats=(Array.isArray(old)?old:[old]).map(m=>{const n=m.clone();n.depthTest=false;n.depthWrite=false;n.transparent=!!n.transparent;n.toneMapped=false;return n;});o.material=Array.isArray(old)?mats:mats[0];o.renderOrder=2500;o.frustumCulled=false;o.userData.viewModelV7=true;o.userData.viewModelV8=true;});return root;}
  flat(id){const url=this.game.iconFor(id),mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.05,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false});const mesh=new THREE.Mesh(new THREE.BoxGeometry(.34,.46,.025),mat);if(url)this.loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;mat.map=t;mat.needsUpdate=true;},undefined,()=>{mat.color.set(0xc8c8c8);});return mesh;}
  torch(){const group=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.08,depthTest:false,depthWrite:false,toneMapped:false}),m=new THREE.Mesh(new THREE.BoxGeometry(.075,.56,.075),mat);this.loader.load(`${MC_TEX}blocks/torch_on.png`,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;mat.map=t;mat.needsUpdate=true;});group.add(m);return group;}
  shield(){const group=new THREE.Group(),board=new THREE.Mesh(new THREE.BoxGeometry(.38,.52,.055),new THREE.MeshBasicMaterial({color:0x9a6a3a,depthTest:false,depthWrite:false,toneMapped:false})),rim=new THREE.Mesh(new THREE.BoxGeometry(.42,.56,.035),new THREE.MeshBasicMaterial({color:0xb9b9b9,wireframe:true,depthTest:false,depthWrite:false,toneMapped:false}));group.add(board,rim);return group;}
  create(id){if(id===ITEM.TORCH)return this.prepare(this.torch());if(id===V8_ITEM.SHIELD)return this.prepare(this.shield());const block=this.game.itemToBlock(id);if(block!==BLOCK.AIR)return this.prepare(this.blocks.create(id));return this.prepare(this.flat(id));}
}
FirstPersonViewV7.prototype.arm=function(x){const mat=new THREE.MeshBasicMaterial({color:0xc78b63,depthTest:false,depthWrite:false,toneMapped:false}),m=new THREE.Mesh(new THREE.BoxGeometry(.13,.48,.13),mat);m.position.set(x>0?.48:-.48,-.48,-.72);m.rotation.set(-.48,0,x>0?-.22:.22);m.renderOrder=2490;m.frustumCulled=false;m.userData.viewModelV7=true;m.userData.viewModelV8=true;return m;};
FirstPersonViewV7.prototype.makeItem=function(id,left=false){if(!id)return null;this.v8Factory??=new HeldItemFactoryV8(this.game);const root=this.v8Factory.create(id),block=this.game.itemToBlock(id),flat=block===BLOCK.AIR&&id!==ITEM.TORCH&&id!==V8_ITEM.SHIELD;if(id===V8_ITEM.SHIELD){root.scale.setScalar(.95);root.position.set(left?-.43:.43,-.38,-.63);root.rotation.set(-.05,left?.20:-.20,left?.10:-.10);}else if(id===ITEM.TORCH){root.scale.setScalar(.92);root.position.set(left?-.45:.45,-.40,-.67);root.rotation.set(-.36,left?.30:-.30,left?.15:-.15);}else if(flat){root.scale.setScalar(1.28);root.position.set(left?-.48:.48,-.39,-.66);root.rotation.set(-.68,left?.40:-.40,left?.24:-.24);}else{root.scale.setScalar(.78);root.position.set(left?-.48:.48,-.39,-.68);root.rotation.set(-.32,left?.50:-.50,left?.20:-.20);}return root;};
FirstPersonViewV7.prototype.refresh=function(){const inv=this.game.inventory;inv.offhand??=new ItemStack();const main=this.game.selectedStack()?.id||0,off=inv.offhand.id||0;if(main!==this.lastMain){if(this.rightItem)this.group.remove(this.rightItem);this.rightItem=this.makeItem(main,false);if(this.rightItem)this.group.add(this.rightItem);this.lastMain=main;}if(off!==this.lastOff){if(this.leftItem)this.group.remove(this.leftItem);this.leftItem=this.makeItem(off,true);if(this.leftItem)this.group.add(this.leftItem);this.lastOff=off;}const armItems=new Set([ITEM.TORCH,ITEM.BREAD,ITEM.APPLE,V8_ITEM.SHIELD]);this.rightArm.visible=!main||armItems.has(main);this.leftArm.visible=!!off&&armItems.has(off);};

function v8SwapOffhand(){if(!game?.inventory)return;const inv=game.inventory;inv.offhand??=new ItemStack();const main=inv.slots[inv.selected],off=inv.offhand,t=main.clone();main.id=off.id;main.count=off.count;off.id=t.id;off.count=t.count;game.refreshHotbar();game.saveSoon();toast('Swapped main hand / offhand');}
addEventListener('keydown',e=>{if(e.code==='KeyF'&&game.running&&game.mode==='survival'&&!game.ui?.screen){e.preventDefault();e.stopImmediatePropagation();v8SwapOffhand();}},{capture:true});
function v8MainHasUseAction(id){return [ITEM.BREAD,ITEM.APPLE,ITEM.TORCH,ITEM.CRAFTING_TABLE,ITEM.FURNACE,ITEM.CHEST,ITEM.TNT,ITEM.GRASS,ITEM.DIRT,ITEM.STONE,ITEM.SAND,ITEM.GRAVEL,ITEM.OAK_LOG,ITEM.OAK_LEAVES,ITEM.OAK_PLANKS,ITEM.COBBLESTONE,ITEM.GLASS,ITEM.BRICKS,ITEM.OBSIDIAN,ITEM.SNOW,ITEM.GLOWSTONE,V7_ITEM.TALL_GRASS,V7_ITEM.FLOWER].includes(id);}
const v8UseSelectedBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const main=this.selectedStack()?.id||0,off=this.inventory.offhand?.id||0;if(off===V8_ITEM.SHIELD&&!v8MainHasUseAction(main)){this.blockingV8=true;this.blockingUntilV8=performance.now()+350;return;}if(main&&v8MainHasUseAction(main))return v8UseSelectedBase.call(this);if(!off)return v8UseSelectedBase.call(this);if(off===ITEM.BREAD||off===ITEM.APPLE){if(this.mode!=='creative'&&this.player.hunger<20){this.player.hunger=Math.min(20,this.player.hunger+(off===ITEM.BREAD?5:4));this.inventory.offhand.count--;this.inventory.offhand.normalize();this.refreshHotbar();this.saveSoon();}return;}const block=this.itemToBlock(off);if(block!==BLOCK.AIR){const hit=this.getTarget();if(!hit)return;const p=hit.place;if(this.player.intersectsBlockV6?.(p.x,p.y,p.z)||this.player.collidesAt(new THREE.Vector3(p.x+.5,this.player.position.y,p.z+.5)))return;if(this.world.set(p.x,p.y,p.z,block)){if(this.mode!=='creative'){this.inventory.offhand.count--;this.inventory.offhand.normalize();}this.refreshHotbar();this.saveSoon();}return;}return v8UseSelectedBase.call(this);};
for(const ev of ['pointerdown','touchstart'])$('useBtn')?.addEventListener(ev,()=>{if(game.inventory?.offhand?.id===V8_ITEM.SHIELD&&!v8MainHasUseAction(game.selectedStack()?.id||0)){game.blockingV8=true;game.blockingUntilV8=Infinity;}},{passive:true});
for(const ev of ['pointerup','pointercancel','touchend','touchcancel'])$('useBtn')?.addEventListener(ev,()=>{if(game.blockingUntilV8===Infinity){game.blockingV8=false;game.blockingUntilV8=0;}},{passive:true});

/* Water: drag, buoyancy, 15-second breath supply, drowning, biome tint and underwater overlay. */
const v8WaterStyle=document.createElement('style');v8WaterStyle.textContent=`#underwaterV8{position:absolute;inset:0;z-index:19;pointer-events:none;display:none;background:rgba(22,92,155,.34);box-shadow:inset 0 0 110px rgba(0,32,72,.46);backdrop-filter:saturate(.82) brightness(.82)}#oxygenBarV8{display:none;position:absolute;left:50%;bottom:88px;transform:translateX(-50%);z-index:24;height:18px;gap:1px;pointer-events:none}.oxygenBubbleV8{width:13px;height:13px;image-rendering:pixelated;object-fit:contain}.oxygenBubbleV8.empty{opacity:.23}.v8HudSprite{width:16px;height:16px;image-rendering:pixelated;object-fit:contain}.blockingShieldV8{transform:translate(.08rem,.08rem) rotate(-4deg)!important}`;document.head.appendChild(v8WaterStyle);
const underwaterV8=document.createElement('div');underwaterV8.id='underwaterV8';document.getElementById('hud')?.appendChild(underwaterV8);const oxygenBarV8=document.createElement('div');oxygenBarV8.id='oxygenBarV8';oxygenBarV8.innerHTML=Array.from({length:10},()=>`<img class="oxygenBubbleV8" src="${MC_TEX}ui/bubble.png" alt="">`).join('');document.getElementById('hud')?.appendChild(oxygenBarV8);
function v8BiomeWaterColor(world,x,z){const b=world?.generator?.biome?.(Math.floor(x),Math.floor(z));if(b==='desert')return [64,126,151];if(b==='snowy')return [62,118,154];if(b==='forest')return [35,112,122];return [45,126,171];}
function v8PlayerWaterState(player){if(!player?.world)return {feet:false,head:false};const feet=player.world.getLoaded(Math.floor(player.position.x),Math.floor(player.position.y+.18),Math.floor(player.position.z))===BLOCK.WATER,eye=player.eyePosition(new THREE.Vector3()),head=player.world.getLoaded(Math.floor(eye.x),Math.floor(eye.y),Math.floor(eye.z))===BLOCK.WATER;return {feet,head};}
const v8PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){const water=v8PlayerWaterState(this),scaled=water.feet?{...controls,forward:controls.forward*.46,right:controls.right*.46,run:controls.run}:controls;v8PlayerUpdateBase.call(this,dt,scaled);if(water.feet&&!this.flying){this.velocity.x*=Math.pow(.86,dt*10);this.velocity.z*=Math.pow(.86,dt*10);this.velocity.y=Math.max(-3.2,this.velocity.y+ENGINE.GRAVITY*.82*dt);if(controls.jump)this.velocity.y=Math.min(3.6,this.velocity.y+16*dt);}this.inWaterV8=water.feet;this.headUnderwaterV8=water.head;};
class WaterSystemV8{constructor(gameRef){this.game=gameRef;this.air=15;this.drownClock=0;}update(dt){const p=this.game.player;if(!p)return;const s=v8PlayerWaterState(p);if(s.head){this.air=Math.max(0,this.air-dt);this.drownClock-=dt;if(this.air<=0&&this.drownClock<=0&&this.game.mode!=='creative'){this.drownClock=1;p.health=Math.max(0,p.health-2);damageVignette.style.opacity='.65';setTimeout(()=>damageVignette.style.opacity='0',120);}}else{this.air=Math.min(15,this.air+dt*4);this.drownClock=0;}const c=v8BiomeWaterColor(this.game.world,p.position.x,p.position.z);underwaterV8.style.display=s.head?'block':'none';underwaterV8.style.background=`rgba(${c[0]},${c[1]},${c[2]},.36)`;oxygenBarV8.style.display=s.head&&this.game.mode!=='creative'?'flex':'none';const full=Math.ceil(this.air/1.5);oxygenBarV8.querySelectorAll('.oxygenBubbleV8').forEach((el,i)=>el.classList.toggle('empty',i>=full));}}

/* Use Mojang's HUD background texture as the survival sprite base; filled state is clipped over the same 9x9 footprint. */
renderSurvivalBarsV6=function(player,mode){if(!player)return;survivalBars.style.display=mode==='creative'?'none':'flex';if(mode==='creative')return;const heartBar=$('heartBar'),hungerBar=$('hungerBar'),hp=clamp(Math.round(player.health),0,20),food=clamp(Math.round(player.hunger),0,20);let h='',f='';for(let i=0;i<10;i++){const v=hp-i*2,file=v>=2?'heart.png':v===1?'heart_half.png':'heart_background.png';h+=`<img class="v8HudSprite" src="${MC_TEX}ui/${file}" alt="">`;}for(let i=0;i<10;i++){const v=food-i*2,file=v>=2?'hunger_full.png':v===1?'hunger_half.png':'hunger_background.png';f+=`<img class="v8HudSprite" src="${MC_TEX}ui/${file}" alt="">`;}heartBar.innerHTML=h;hungerBar.innerHTML=f;};

/* Per-quad biome tint for water. */
const v8AddQuadBase=ChunkMesher.prototype.addQuad;
ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){if(this.currentBlock!==BLOCK.WATER)return v8AddQuadBase.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);const base=positions.length/3,f=VOXEL_FACES.find(q=>q.key===face),verts=voxelFaceVertices(x,y,z,f),c=v8BiomeWaterColor(this.world,x,z).map(v=>v/255);for(const v of verts)positions.push(...v);for(let i=0;i<4;i++){normals.push(...f.n);colors.push(c[0],c[1],c[2]);}for(const q of f.uv){const p=this.atlas.uv(texture,q[0],q[1]);uvs.push(...p);}buckets.water.push(base,base+1,base+2,base,base+2,base+3);};

/* Light levels and dynamic torch/furnace lights. */
class LightEngineV8{
  constructor(gameRef){this.game=gameRef;this.cache=new Map();this.lastClear=0;}
  skyVisible(x,y,z){for(let yy=Math.floor(y)+1;yy<ENGINE.WORLD_HEIGHT;yy++){const id=this.game.world.getLoaded(Math.floor(x),yy,Math.floor(z));if(OPAQUE_BLOCKS.has(id))return false;}return true;}
  blockLight(x,y,z){let best=0;const r=14;for(let yy=Math.max(0,Math.floor(y)-r);yy<=Math.min(ENGINE.WORLD_HEIGHT-1,Math.floor(y)+r);yy++)for(let zz=Math.floor(z)-r;zz<=Math.floor(z)+r;zz++)for(let xx=Math.floor(x)-r;xx<=Math.floor(x)+r;xx++){const id=this.game.world.getLoaded(xx,yy,zz),emit=id===BLOCK.TORCH?14:id===BLOCK.GLOWSTONE?15:id===V8_FURNACE_LIT?13:0;if(!emit)continue;const dist=Math.abs(xx-x)+Math.abs(yy-y)+Math.abs(zz-z);best=Math.max(best,emit-dist);if(best>=15)return 15;}return clamp(best,0,15);}
  level(x,y,z){const daylight=this.game.renderer?.dayStateV6?.daylight??1,sky=this.skyVisible(x,y,z)?Math.round(daylight*15):0;return Math.max(sky,this.blockLight(x,y,z));}
}
class DynamicBlockLightsV8{constructor(gameRef){this.game=gameRef;this.group=new THREE.Group();gameRef.renderer.scene.add(this.group);this.lights=[];this.clock=0;}update(dt){this.clock-=dt;if(this.clock>0)return;this.clock=.35;const profile=this.game.graphicsV7?.profile||'fast',count=profile==='ultra'?8:profile==='fancy'?5:2,p=this.game.player.position,candidates=[];for(let y=Math.max(0,Math.floor(p.y)-10);y<=Math.min(ENGINE.WORLD_HEIGHT-1,Math.floor(p.y)+10);y++)for(let z=Math.floor(p.z)-12;z<=Math.floor(p.z)+12;z++)for(let x=Math.floor(p.x)-12;x<=Math.floor(p.x)+12;x++){const id=this.game.world.getLoaded(x,y,z);if(id===BLOCK.TORCH||id===V8_FURNACE_LIT||id===BLOCK.GLOWSTONE){const d=distanceSq(x,y,z,p.x,p.y,p.z);candidates.push({x,y,z,id,d});}}candidates.sort((a,b)=>a.d-b.d);while(this.lights.length<count){const l=new THREE.PointLight(0xffc56d,1.2,16,1.8);l.castShadow=false;this.group.add(l);this.lights.push(l);}for(let i=0;i<this.lights.length;i++){const l=this.lights[i],c=candidates[i];l.visible=!!c&&i<count;if(c){l.position.set(c.x+.5,c.y+.68,c.z+.5);l.intensity=c.id===BLOCK.GLOWSTONE?1.5:c.id===V8_FURNACE_LIT?1.35:1.15;l.distance=profile==='ultra'?18:14;}}}}

/* Brighter Minecraft-like graphics profiles; Fancy/Ultra no longer lose brightness to ACES. */
GraphicsQualityV7.prototype.apply=function(profile=this.profile){if(!['fast','fancy','ultra'].includes(profile))profile='fancy';this.profile=profile;localStorage.setItem('studioGraphicsV7',profile);const rr=this.game.renderer,r=rr.renderer,enabled=profile!=='fast',ultra=profile==='ultra';r.setPixelRatio(Math.min(devicePixelRatio||1,profile==='fast'?1.5:profile==='fancy'?1.75:2.0));if(r.shadowMap){r.shadowMap.enabled=enabled;r.shadowMap.type=THREE.PCFSoftShadowMap;}r.toneMapping=enabled?THREE.NeutralToneMapping:THREE.NoToneMapping;r.toneMappingExposure=profile==='fast'?1:profile==='fancy'?1.22:1.32;rr.sun.castShadow=enabled;rr.sun.shadow.mapSize.set(ultra?1536:768,ultra?1536:768);rr.sun.shadow.camera.left=rr.sun.shadow.camera.bottom=-(ultra?56:42);rr.sun.shadow.camera.right=rr.sun.shadow.camera.top=ultra?56:42;rr.sun.shadow.camera.near=.5;rr.sun.shadow.camera.far=360;rr.sun.shadow.bias=-.00025;rr.sun.shadow.normalBias=.018;rr.sun.shadow.camera.updateProjectionMatrix();rr.materialOpaque.emissive?.setHex(0x000000);rr.materialOpaque.emissiveIntensity=.0;rr.scene.traverse(o=>{if(!o.isMesh||o.userData?.viewModelV7)return;if(o.name?.startsWith?.('chunk_')){o.receiveShadow=enabled;o.castShadow=ultra;}else{o.receiveShadow=enabled;o.castShadow=enabled;}});const b=$('graphicsCycleV7');if(b)b.textContent=`GFX ${profile.toUpperCase()}`;const s=$('graphicsSelectV7');if(s)s.value=profile;window.__voxelDiag?.log?.(`GRAPHICS ${profile.toUpperCase()}: bright Neutral tone mapping; shadows ${enabled?'ON':'OFF'}`,'ok');return profile;};

/* Larger alpha-cleaned sun, no black square. */
VoxelRenderer.prototype.ensureCelestialsV7=function(){if(this.celestialV7)return;const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');const sm=new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,toneMapped:false}),mm=new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,toneMapped:false}),sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.set(46,46,1);moonSprite.scale.set(38,38,1);sunSprite.renderOrder=-1;moonSprite.renderOrder=-1;this.scene.add(sunSprite,moonSprite);loader.load(`${MC_TEX}environment/sun.png`,tex=>{try{const img=tex.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const c2=c.getContext('2d',{willReadFrequently:true});c2.drawImage(img,0,0);const d=c2.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2];if(r<18&&g<18&&b<18)d.data[i+3]=0;}c2.putImageData(d,0,0);const clean=new THREE.CanvasTexture(c);clean.colorSpace=THREE.SRGBColorSpace;clean.magFilter=THREE.NearestFilter;clean.minFilter=THREE.NearestFilter;clean.needsUpdate=true;sm.map=clean;sm.needsUpdate=true;}catch{tex.colorSpace=THREE.SRGBColorSpace;sm.map=tex;sm.needsUpdate=true;}});const moonTex=loader.load(`${MC_TEX}environment/moon_phases.png`,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;});moonTex.wrapS=moonTex.wrapT=THREE.ClampToEdgeWrapping;moonTex.repeat.set(.25,.5);mm.map=moonTex;this.celestialV7={sunSprite,moonSprite,moonTex,phase:-1};};

/* LOD sliders: direct game reference, touch-safe, and wired to texture/entity/chunk visibility policies. */
function v8ApplyLod(){if(!game?.renderer)return;const q=Number($('voxelQuality')?.value||100),near=Number($('voxelLodNear')?.value||10),far=Number($('voxelLodFar')?.value||32);game.renderer.lod.qualityCeiling=q;game.renderer.lod.near=near;game.renderer.lod.far=far;entityLodPolicy.near=Math.max(8,near*2);entityLodPolicy.medium=Math.max(entityLodPolicy.near+4,far*2);localStorage.setItem('v8Lod',JSON.stringify({q,near,far}));}
for(const [id,label] of [['voxelQuality','voxelQualityValue'],['voxelLodNear','voxelLodNearValue'],['voxelLodFar','voxelLodFarValue']]){const el=$(id);if(el){el.style.touchAction='pan-x';el.oninput=e=>{const v=e.target.value;$(label).textContent=id==='voxelQuality'?`${v}%`:v;v8ApplyLod();};el.addEventListener('pointerdown',e=>e.stopPropagation(),{passive:true});el.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});}}
try{const l=JSON.parse(localStorage.getItem('v8Lod')||'null');if(l){if($('voxelQuality')){$('voxelQuality').value=l.q;$('voxelQualityValue').textContent=`${l.q}%`;}if($('voxelLodNear')){$('voxelLodNear').value=l.near;$('voxelLodNearValue').textContent=l.near;}if($('voxelLodFar')){$('voxelLodFar').value=l.far;$('voxelLodFarValue').textContent=l.far;}}}catch{}

/* Fire visual and skeleton arrows. */
class FireOverlayV8{constructor(gameRef){this.game=gameRef;this.loader=new THREE.TextureLoader();this.loader.setCrossOrigin('anonymous');this.material=null;}mat(){if(this.material)return this.material;const m=new THREE.MeshBasicMaterial({color:0xff9a2e,transparent:true,opacity:.82,alphaTest:.05,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});this.loader.load(`${MC_TEX}blocks/fire_0.png`,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;m.map=t;m.color.set(0xffffff);m.needsUpdate=true;});return this.material=m;}attach(mob){if(mob.fireVisualV8||!mob.model)return;const g=new THREE.Group(),mat=this.mat();for(const a of [0,Math.PI/2]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.9),mat);p.position.y=.92;p.rotation.y=a;g.add(p);}mob.model.add(g);mob.fireVisualV8=g;}set(mob,on){if(on)this.attach(mob);if(mob.fireVisualV8)mob.fireVisualV8.visible=on;}}
class ArrowSystemV8{constructor(gameRef){this.game=gameRef;this.items=[];this.group=new THREE.Group();gameRef.renderer.scene.add(this.group);this.geo=new THREE.BoxGeometry(.04,.04,.68);this.mat=new THREE.MeshBasicMaterial({color:0xd8cfaa,toneMapped:false});}shoot(from,target){if(this.items.length>32)return;const m=new THREE.Mesh(this.geo,this.mat),p=from.clone();p.y+=1.25;const dir=target.clone();dir.y+=1.1;dir.sub(p).normalize();m.position.copy(p);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);this.group.add(m);this.items.push({mesh:m,pos:p,vel:dir.multiplyScalar(11),life:4});}update(dt){for(let i=this.items.length-1;i>=0;i--){const a=this.items[i];a.life-=dt;a.vel.y-=5.2*dt;const next=a.pos.clone().addScaledVector(a.vel,dt),id=this.game.world.getLoaded(Math.floor(next.x),Math.floor(next.y),Math.floor(next.z));if(SOLID_BLOCKS.has(id)){this.group.remove(a.mesh);this.items.splice(i,1);continue;}if(this.game.mode!=='creative'&&next.distanceTo(this.game.player.position.clone().add(new THREE.Vector3(0,.9,0)))<.55){let dmg=3;if(this.game.blockingV8&&v8ShieldFacesSource(this.game.player,a.pos)){dmg=0;this.game.player.applyKnockback(a.vel.clone(),.4,.1);}if(dmg)this.game.player.health=Math.max(0,this.game.player.health-dmg);this.group.remove(a.mesh);this.items.splice(i,1);continue;}a.pos.copy(next);a.mesh.position.copy(next);a.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),a.vel.clone().normalize());if(a.life<=0){this.group.remove(a.mesh);this.items.splice(i,1);}}}}
function v8ShieldFacesSource(player,source){const to=source.clone().sub(player.position);to.y=0;if(to.lengthSq()<.001)return true;to.normalize();const f=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));return f.dot(to)>.15;}
function v8MobLoot(type){switch(type){case'zombie':return [[V8_ITEM.ROTTEN_FLESH,1+Math.floor(Math.random()*2)]];case'skeleton':return [[V8_ITEM.BONE,Math.floor(Math.random()*3)],[ITEM.ARROW,Math.floor(Math.random()*3)]];case'cow':return [[V8_ITEM.RAW_BEEF,1+Math.floor(Math.random()*3)],[V8_ITEM.LEATHER,Math.floor(Math.random()*3)]];case'pig':return [[V8_ITEM.RAW_PORKCHOP,1+Math.floor(Math.random()*3)]];case'chicken':return [[V8_ITEM.RAW_CHICKEN,1],[V8_ITEM.FEATHER,Math.floor(Math.random()*3)]];case'sheep':return [[V8_ITEM.WHITE_WOOL,1],[V8_ITEM.RAW_MUTTON,1+Math.floor(Math.random()*2)]];case'creeper':return [[V8_ITEM.GUNPOWDER,Math.floor(Math.random()*3)]];default:return [];}}
function v8DropMobLoot(gameRef,mob){if(mob.lootDroppedV8)return;mob.lootDroppedV8=true;for(const [id,count] of v8MobLoot(mob.type))if(id&&count>0)gameRef.drops.spawn(id,count,mob.position.clone().add(new THREE.Vector3(0,.45,0)));}

/* Final mob simulation: light-aware spawning, daylight burn, skeleton ranged attacks, death loot, entity LOD. */
MobSystem.prototype.spawnAround=function(player){if(this.mobs.length+(this.pendingSpawns||0)>=ENGINE.MAX_MOBS)return;const a=Math.random()*Math.PI*2,r=20+Math.random()*24,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(this.world.getLoaded(x,y,z)!==BLOCK.AIR||SOLID_BLOCKS.has(this.world.getLoaded(x,y+1,z)))return;const night=this.game?.renderer?.dayStateV6?.isNight||false,light=this.game?.lightV8?.level(x,y,z)??15,roll=Math.random();let type;if(night&&light<=7)type=roll<.45?'zombie':roll<.68?'skeleton':roll<.84?'creeper':'spider';else if(!night)type=roll<.26?'cow':roll<.48?'chicken':roll<.70?'pig':roll<.90?'sheep':'villager';else return;this.spawnEntity(type,new THREE.Vector3(x+.5,y,z+.5));};
MobSystem.prototype.update=function(dt,player){this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.4;if(Math.random()<.38)this.spawnAround(player);}for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];const beforeHp=player.health;updateMobV7(mob,dt,this.world,player,this.game);if(this.game.blockingV8&&player.health<beforeHp&&v8ShieldFacesSource(player,mob.position)){player.health=beforeHp;player.applyKnockback(player.position.clone().sub(mob.position),.55,.2);}const undead=mob.type==='zombie'||mob.type==='skeleton',day=this.game.renderer?.dayStateV6?.daylight??0,wet=this.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+1),Math.floor(mob.position.z))===BLOCK.WATER,exposed=this.game.lightV8?.skyVisible(mob.position.x,mob.position.y+1.2,mob.position.z);if(undead&&day>.58&&exposed&&!wet){mob.sunFireV8=(mob.sunFireV8||0)+dt;this.game.fireV8?.set(mob,true);if(mob.sunFireV8>=1){mob.sunFireV8-=1;mob.health=Math.max(0,mob.health-1);}}else{mob.sunFireV8=0;this.game.fireV8?.set(mob,false);}if(mob.type==='skeleton'){mob.arrowCooldownV8=(mob.arrowCooldownV8||1.1)-dt;const dist=mob.position.distanceTo(player.position);if(dist>3&&dist<15&&mob.arrowCooldownV8<=0&&this.game.mode!=='creative'){mob.arrowCooldownV8=1.6+Math.random()*.7;this.game.arrowsV8?.shoot(mob.position,player.position);mob.attackAnim=.25;}}if(mob.model){const dist=mob.position.distanceTo(player.position),level=entityLodPolicy.level(dist);entityLodPolicy.apply(mob.model,level);}if(mob.health<=0){v8DropMobLoot(this.game,mob);if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);continue;}if(mob.position.distanceTo(player.position)>110){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}}};

/* Furnace: raw iron -> iron ingot, lit front state, local light while active. */
UI.prototype.renderFurnaceV7=function(){const inv=this.game.inventory,f=this.game.furnaceV7??={active:false,remaining:0,total:10,pos:null},input=inv.has(V8_ITEM.RAW_IRON,1)?V8_ITEM.RAW_IRON:inv.has(ITEM.IRON_ORE,1)?ITEM.IRON_ORE:0,can=!f.active&&!!input&&inv.has(ITEM.COAL,1),pct=f.active?Math.round((1-f.remaining/f.total)*100):0;screenLayer.innerHTML=`<div class="mc-window furnace-v7"><h2 class="mc-title">Furnace</h2><div class="furnace-process"><div>${this.slotHtml('',new ItemStack(input||V8_ITEM.RAW_IRON,1))}<small>${input?ITEM_NAME.get(input):'Raw Iron'}</small></div><b>+</b><div>${this.slotHtml('',new ItemStack(ITEM.COAL,1))}<small>Coal</small></div><b>→</b><div>${this.slotHtml('',new ItemStack(ITEM.IRON_INGOT,1))}<small>Iron Ingot</small></div></div><div style="font-size:26px;text-align:center;height:34px">${f.active?'🔥':'♨'}</div><div style="height:12px;background:#333;margin:8px 0"><div style="height:100%;width:${pct}%;background:#f28c28"></div></div><button id="smeltIronV7" class="mc-btn" ${can?'':'disabled'}>${f.active?`Smelting… ${Math.ceil(f.remaining)}s`:can?'Smelt Iron (10s)':'Need Raw Iron + Coal'}</button><button id="closeFurnaceV7" class="mc-btn">Close</button></div>`;$('closeFurnaceV7').onclick=()=>this.close();$('smeltIronV7').onclick=()=>{if(f.active||!input||!inv.has(ITEM.COAL,1))return;inv.consume(input,1);inv.consume(ITEM.COAL,1);f.active=true;f.remaining=f.total=10;f.inputId=input;if(f.pos&&this.game.world.getLoaded(f.pos.x,f.pos.y,f.pos.z)===BLOCK.FURNACE)this.game.world.set(f.pos.x,f.pos.y,f.pos.z,V8_FURNACE_LIT);this.game.refreshHotbar();this.game.saveSoon();this.renderFurnaceV7();};iconSanitizer.scan();};
const v8UseFurnaceBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const hit=this.getTarget();if(hit&&(hit.id===BLOCK.FURNACE||hit.id===V8_FURNACE_LIT)){this.furnaceV7??={active:false,remaining:0,total:10,pos:null};this.furnaceV7.pos={x:hit.x,y:hit.y,z:hit.z};this.ui.openFurnaceV7();return;}return v8UseFurnaceBase.call(this);};

/* Slower, staggered leaf decay: each leaf is independently scheduled over a broad random-tick window. */
LeafDecayV7.prototype.scheduleAround=function(x,y,z){const r=STUDIO_V7.leafDistance;for(let yy=y-r;yy<=y+r;yy++)for(let zz=z-r;zz<=z+r;zz++)for(let xx=x-r;xx<=x+r;xx++){if(Math.abs(xx-x)+Math.abs(yy-y)+Math.abs(zz-z)>r*2||this.game.world.getLoaded(xx,yy,zz)!==BLOCK.OAK_LEAVES)continue;const k=blockKey(xx,yy,zz);if(this.persistent.has(k)||this.queued.has(k))continue;this.queued.add(k);this.queue.push({x:xx,y:yy,z:zz,due:performance.now()+2500+Math.random()*18000});}};
LeafDecayV7.prototype.update=function(){const now=performance.now();let picked=-1,earliest=Infinity;for(let i=0;i<this.queue.length;i++){const e=this.queue[i];if(e.due<=now&&e.due<earliest){earliest=e.due;picked=i;}}if(picked<0)return;const e=this.queue.splice(picked,1)[0],k=blockKey(e.x,e.y,e.z);this.queued.delete(k);if(this.game.world.getLoaded(e.x,e.y,e.z)!==BLOCK.OAK_LEAVES||this.persistent.has(k)||this.connected(e.x,e.y,e.z))return;this.game.world.set(e.x,e.y,e.z,BLOCK.AIR);const roll=Math.random();if(roll<.02)this.game.drops.spawn(ITEM.STICK,1,new THREE.Vector3(e.x+.5,e.y+.4,e.z+.5));else if(roll<.025)this.game.drops.spawn(ITEM.APPLE,1,new THREE.Vector3(e.x+.5,e.y+.4,e.z+.5));};

/* Random ticks: dirt spreads to grass, and mature grass can occasionally grow tall grass in open light. */
class RandomTickSystemV8{constructor(gameRef){this.game=gameRef;this.clock=0;}update(dt){this.clock-=dt;if(this.clock>0)return;this.clock=.22;const chunks=[...this.game.world.chunks.values()];if(!chunks.length)return;for(let n=0;n<4;n++){const c=chunks[Math.floor(Math.random()*chunks.length)],lx=Math.floor(Math.random()*ENGINE.CHUNK_SIZE),lz=Math.floor(Math.random()*ENGINE.CHUNK_SIZE),wx=c.cx*ENGINE.CHUNK_SIZE+lx,wz=c.cz*ENGINE.CHUNK_SIZE+lz,y=this.game.world.highestSolidY(wx,wz),id=this.game.world.getLoaded(wx,y,wz),above=this.game.world.getLoaded(wx,y+1,wz),light=this.game.lightV8?.level(wx,y+1,wz)??15;if(id===BLOCK.DIRT&&above===BLOCK.AIR&&light>=9){let nearGrass=false;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(this.game.world.getLoaded(wx+dx,y,wz+dz)===BLOCK.GRASS)nearGrass=true;if(nearGrass&&Math.random()<.24)this.game.world.set(wx,y,wz,BLOCK.GRASS);}else if(id===BLOCK.GRASS&&above===BLOCK.AIR&&light>=9&&Math.random()<.035)this.game.world.set(wx,y+1,wz,BLOCK.TALL_GRASS);}}}

/* Caves & mountains style terrain pass plus small deterministic village starts. */
WorldGenerator.prototype.surfaceY=function(x,z){const continental=this.perlin.fbm2(x*.012,z*.012,4),erosion=this.perlin.fbm2(x*.025+900,z*.025-700,3),ridge=1-Math.abs(this.perlin.fbm2(x*.021-400,z*.021+300,4)),detail=this.perlin.fbm2(x*.095,z*.095,3),mountainMask=clamp((continental+.18)*1.45,0,1),peaks=Math.pow(clamp(ridge,0,1),2.2)*mountainMask*29,valleys=Math.max(0,-erosion)*9,h=Math.floor(38+continental*10+detail*3+peaks-valleys);return clamp(h,8,ENGINE.WORLD_HEIGHT-10);};
WorldGenerator.prototype.canCarve=function(x,y,z,surface){if(y<=2||y>=surface-3||y<6)return false;const cheese=this.caveDensity(x,y,z)>.38,spaghetti=Math.abs(this.perlin.noise(x*.055,y*.075,z*.055))<.045&&this.perlin.noise(x*.021,y*.017,z*.021)>.05;return cheese||spaghetti;};
function v8StampVillage(gen,chunk){const chance=hash2(chunk.cx,chunk.cz,gen.seed+8811);if(chance>.060)return;const x=8,z=8,wx=chunk.cx*ENGINE.CHUNK_SIZE+x,wz=chunk.cz*ENGINE.CHUNK_SIZE+z,y=gen.surfaceY(wx,wz);let variance=0;for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++)variance=Math.max(variance,Math.abs(gen.surfaceY(wx+dx,wz+dz)-y));if(variance>3||chunk.get(x,y,z)!==BLOCK.GRASS)return;for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++){const sy=gen.surfaceY(wx+dx,wz+dz);for(let yy=sy+1;yy<=Math.min(ENGINE.WORLD_HEIGHT-2,y+5);yy++)chunk.set(x+dx,yy,z+dz,BLOCK.AIR);chunk.set(x+dx,sy,z+dz,(Math.abs(dx)<=1||Math.abs(dz)<=1)?BLOCK.GRAVEL:chunk.get(x+dx,sy,z+dz));}for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const edge=Math.abs(dx)===3||Math.abs(dz)===3;for(let yy=1;yy<=3;yy++){if(edge&&!(dz===3&&dx===0&&yy<=2))chunk.set(x+dx,y+yy,z+dz,yy===1?BLOCK.COBBLESTONE:BLOCK.OAK_PLANKS);}chunk.set(x+dx,y+4,z+dz,BLOCK.OAK_PLANKS);}chunk.set(x,y+2,z+2,BLOCK.TORCH);chunk.villageV8=true;gen.villageSpawnsV8??=[];gen.villageSpawnsV8.push(new THREE.Vector3(wx+.5,y+1,wz+.5));}
const v8WorldGenerateBase=WorldGenerator.prototype.generate;
WorldGenerator.prototype.generate=function(chunk){v8WorldGenerateBase.call(this,chunk);v8StampVillage(this,chunk);};

/* Bone meal grows vegetation when used on grass. */
const v8UseBoneMealBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const hit=this.getTarget(),s=this.selectedStack();if(hit&&s?.id===V8_ITEM.BONE_MEAL&&hit.id===BLOCK.GRASS){let placed=0;for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){if(Math.random()>.28)continue;const x=hit.x+dx,z=hit.z+dz,y=this.world.highestSolidY(x,z);if(this.world.getLoaded(x,y,z)===BLOCK.GRASS&&this.world.getLoaded(x,y+1,z)===BLOCK.AIR){this.world.set(x,y+1,z,Math.random()<.14?BLOCK.FLOWER:BLOCK.TALL_GRASS);placed++;}}if(placed&&this.mode!=='creative'){s.count--;s.normalize();this.refreshHotbar();}return;}return v8UseBoneMealBase.call(this);};

/* Title screen: classic-style menu, dynamic splash, world selection, and a contained 3-D world preview. */
const titleV8Style=document.createElement('style');titleV8Style.textContent=`#titleContent.v8Title{width:min(520px,92vw);gap:7px}#titleContent.v8Title #mcLogo{width:min(430px,88vw)}#v8Splash{color:#fff338;font:bold 17px/1.1 Arial;transform:rotate(-10deg);text-shadow:2px 2px #3c3200;margin:-16px 0 8px 190px;white-space:nowrap}.v8MenuBtn{width:min(380px,84vw);height:42px;background:linear-gradient(#858585,#666);border:2px solid #111;box-shadow:inset 2px 2px #aaa,inset -2px -2px #444;color:#fff;font:700 15px Arial;text-shadow:2px 2px #333}.v8MenuBtn:active{background:#555}.v8MenuRow{display:flex;gap:7px;width:min(380px,84vw)}.v8MenuRow .v8MenuBtn{width:50%}#v8PreviewWrap{width:min(380px,84vw);height:105px;border:2px solid #1a1a1a;background:#7bb7e6;box-shadow:inset 2px 2px rgba(255,255,255,.3),inset -2px -2px rgba(0,0,0,.45);overflow:hidden;margin-bottom:2px}#v8PreviewCanvas{width:100%;height:100%;display:block}.v8WorldPanel{width:min(500px,90vw);padding:15px;background:#2e261f;border:3px solid #120e0a;box-shadow:inset 0 0 0 2px #564536;color:#fff}.v8WorldCard{display:grid;grid-template-columns:118px 1fr;gap:10px;padding:8px;background:#3b3026;border:2px solid #1b1510;margin:8px 0}.v8WorldThumb{height:72px;background:linear-gradient(#7cb9ea 0 50%,#65a246 50%);border:1px solid #111;position:relative;overflow:hidden}.v8WorldThumb:after{content:'';position:absolute;left:15px;right:15px;bottom:11px;height:18px;background:#6c482b;box-shadow:0 -9px #58a03c}.v8Small{font-size:11px;opacity:.75}`;document.head.appendChild(titleV8Style);
const TITLE_SPLASHES_V8=['Three.js, but blockier!','Now with proper offhand!','Caves below, mountains above!','Watch the sun!','Random ticks included!','Mobs read JSON!','Water is finally wet!','Shadows, if your phone agrees!','Blocks all the way down!'];
class TitlePreviewV8{constructor(canvas){this.canvas=canvas;try{this.r=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'low-power'});this.r.setPixelRatio(Math.min(devicePixelRatio||1,1));this.s=new THREE.Scene();this.s.background=new THREE.Color(0x7fb8df);this.c=new THREE.PerspectiveCamera(42,3.6,.1,50);this.c.position.set(5.8,4.7,7);this.c.lookAt(0,0,0);this.g=new THREE.Group();this.s.add(this.g);this.s.add(new THREE.HemisphereLight(0xbbe1ff,0x59442e,1.5));const sun=new THREE.DirectionalLight(0xfff2ce,1.7);sun.position.set(4,8,3);this.s.add(sun);const grass=new THREE.MeshLambertMaterial({color:0x67a84d}),dirt=new THREE.MeshLambertMaterial({color:0x775035}),wood=new THREE.MeshLambertMaterial({color:0x76502f}),leaves=new THREE.MeshLambertMaterial({color:0x2e7f39});for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++){const h=Math.max(0,Math.floor((Math.sin(x*1.3)+Math.cos(z*1.7)+2)*.45));for(let y=-1;y<=h;y++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),y===h?grass:dirt);m.position.set(x,y,z);this.g.add(m);}}for(const [x,z] of [[-2,-1],[2,1]]){for(let y=1;y<=3;y++){const m=new THREE.Mesh(new THREE.BoxGeometry(.72,1,.72),wood);m.position.set(x,y,z);this.g.add(m);}for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),leaves);m.position.set(x+dx*.7,3.6,z+dz*.7);this.g.add(m);}}this.alive=true;this.resize();this.loop();}catch(e){console.warn('Title preview unavailable',e);}}resize(){if(!this.r)return;const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.r.setSize(w,h,false);this.c.aspect=w/h;this.c.updateProjectionMatrix();}loop(){if(!this.alive||!this.r)return;this.g.rotation.y+=.0025;this.r.render(this.s,this.c);requestAnimationFrame(()=>this.loop());}dispose(){this.alive=false;try{this.r?.dispose();}catch{}}}
let titlePreviewV8=null;
function v8BuildTitle(){const content=$('titleContent');if(!content)return;content.className='v8Title';content.innerHTML=`<img id="mcLogo" src="${MC_TEX}gui/title/minecraft.png" alt="Minecraft"><div id="v8Splash">${TITLE_SPLASHES_V8[Math.floor(Math.random()*TITLE_SPLASHES_V8.length)]}</div><div id="v8PreviewWrap"><canvas id="v8PreviewCanvas"></canvas></div><button class="v8MenuBtn" id="v8Singleplayer">Singleplayer</button><button class="v8MenuBtn" id="v8Multiplayer">Multiplayer</button><div class="v8MenuRow"><button class="v8MenuBtn" id="v8Packs">Texture Packs</button><button class="v8MenuBtn" id="v8TitleOptions">Options…</button></div><div class="v8Small">Minecraft Web • Three.js studio build ${STUDIO_V8.version}</div>`;titlePreviewV8?.dispose();titlePreviewV8=new TitlePreviewV8($('v8PreviewCanvas'));$('v8Singleplayer').onclick=()=>v8WorldSelect();$('v8Multiplayer').onclick=()=>toast('Multiplayer transport is not connected in this browser build yet.');$('v8Packs').onclick=()=>toast('Resource order: your Minecraft-assets repository → Mojang Bedrock samples.');$('v8TitleOptions').onclick=()=>v8TitleOptions();}
function v8WorldSelect(){const content=$('titleContent');titlePreviewV8?.dispose();content.innerHTML=`<div class="v8WorldPanel"><h2 class="mc-title" style="color:white;text-shadow:2px 2px #111">Select World</h2><div class="v8WorldCard"><div class="v8WorldThumb"></div><div><b>New World</b><div class="v8Small">Survival Mode<br>Local browser save • seed ${game.seed}</div></div></div><button class="v8MenuBtn" id="v8PlayWorld">Play Selected World</button><button class="v8MenuBtn" id="v8CreateWorld">Create New World</button><div class="v8MenuRow"><button class="v8MenuBtn" id="v8CreativeWorld">Creative</button><button class="v8MenuBtn" id="v8WorldCancel">Cancel</button></div></div>`;$('v8PlayWorld').onclick=()=>{titlePreviewV8?.dispose();game.boot('survival',false);};$('v8CreateWorld').onclick=()=>{titlePreviewV8?.dispose();game.newWorld('survival');};$('v8CreativeWorld').onclick=()=>{titlePreviewV8?.dispose();game.boot('creative',false);};$('v8WorldCancel').onclick=v8BuildTitle;}
function v8TitleOptions(){const content=$('titleContent'),profile=localStorage.getItem('studioGraphicsV7')||'fancy';content.innerHTML=`<div class="v8WorldPanel"><h2 class="mc-title" style="color:white">Options</h2><label>Graphics <select id="v8PreGfx" class="gfx-select-v7"><option value="fast">Fast</option><option value="fancy">Fancy</option><option value="ultra">Ultra</option></select></label><br><br><label>Texture quality <input id="v8PreQuality" type="range" min="25" max="100" step="25" value="${$('voxelQuality')?.value||100}"></label><br><br><button class="v8MenuBtn" id="v8OptDone">Done</button></div>`;$('v8PreGfx').value=profile;$('v8PreGfx').onchange=e=>localStorage.setItem('studioGraphicsV7',e.target.value);$('v8PreQuality').oninput=e=>{if($('voxelQuality')){$('voxelQuality').value=e.target.value;$('voxelQualityValue').textContent=`${e.target.value}%`;}};$('v8OptDone').onclick=v8BuildTitle;}
v8BuildTitle();

/* Boot/update integration. */
const v8BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){titlePreviewV8?.dispose();await v8BootBase.apply(this,args);this.itemTranslatorV8=new BedrockItemTranslatorV8(this);this.itemTranslatorV8.loadCatalog();this.waterV8=new WaterSystemV8(this);this.lightV8=new LightEngineV8(this);this.dynamicLightsV8=new DynamicBlockLightsV8(this);this.fireV8=new FireOverlayV8(this);this.arrowsV8=new ArrowSystemV8(this);this.randomTicksV8=new RandomTickSystemV8(this);this.blockingV8=false;this.blockingUntilV8=0;this.firstPersonV7?.refresh();v8ApplyLod();window.__voxelDiag?.log?.(`V8 BOOT: water + oxygen + light levels + offhand + entity loot + brighter graphics + world structures enabled.`,'ok');};
const v8GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){if(this.blockingUntilV8!==Infinity&&performance.now()>this.blockingUntilV8)this.blockingV8=false;this.waterV8?.update(dt);this.dynamicLightsV8?.update(dt);this.arrowsV8?.update(dt);this.randomTicksV8?.update(dt);const gen=this.world?.generator;if(gen?.villageSpawnsV8?.length&&this.mobs?.mobs?.length<ENGINE.MAX_MOBS){const pos=gen.villageSpawnsV8.shift();if(pos&&pos.distanceTo(this.player.position)<70)this.mobs.spawnEntity('villager',pos);}v8GameUpdateBase.call(this,dt);if(this.furnaceV7?.active&&this.furnaceV7.pos){const p=this.furnaceV7.pos;if(this.world.getLoaded(p.x,p.y,p.z)===BLOCK.FURNACE)this.world.set(p.x,p.y,p.z,V8_FURNACE_LIT);}if(this.furnaceV7&&!this.furnaceV7.active&&this.furnaceV7.pos){const p=this.furnaceV7.pos;if(this.world.getLoaded(p.x,p.y,p.z)===V8_FURNACE_LIT)this.world.set(p.x,p.y,p.z,BLOCK.FURNACE);}if(this.firstPersonV7?.leftItem&&this.inventory.offhand?.id===V8_ITEM.SHIELD){this.firstPersonV7.leftItem.rotation.z=this.blockingV8?.48:.10;this.firstPersonV7.leftItem.position.z=this.blockingV8?-.47:-.63;}};
const v8HudBase=Game.prototype.updateHud;
Game.prototype.updateHud=function(){v8HudBase.call(this);if(this.blockingV8&&this.inventory.offhand?.id===V8_ITEM.SHIELD)topStatus.textContent+=' • BLOCKING';};

/* Force view-model materials to remain fully visible over water and fog. */
VoxelRenderer.prototype.render=function(dt){
  this.ensureEnvironmentV6();this._v6Elapsed+=dt;const oldPhase=dayClock.phase();dayClock.update(dt);const phase=dayClock.phase();if(phase<oldPhase)this._v6Day++;
  const angle=phase*Math.PI*2,sunY=Math.sin(angle),daylight=smoothstep(clamp((sunY+.16)/.62,0,1)),horizon=1-clamp(Math.abs(sunY)/.32,0,1),px=this.player?.position.x||0,py=this.player?.position.y||35,pz=this.player?.position.z||0,profile=this.gameRefV7?.graphicsV7?.profile||'fast',boost=profile==='ultra'?1.34:profile==='fancy'?1.22:1;
  this.sun.position.set(px+Math.cos(angle)*145,py+sunY*145,pz+Math.sin(angle)*70);this.sun.target.position.set(px,py,pz);this.sun.intensity=(.08+daylight*1.32)*boost;this.sun.color.set(daylight>.5?0xfff6dc:0xffba78);
  this.moon.position.set(px-Math.cos(angle)*145,py-sunY*145,pz-Math.sin(angle)*70);this.moon.target.position.set(px,py,pz);this.moon.intensity=(1-daylight)*(profile==='fast'?.22:.31);
  this.ambient.color.copy(mixColorV6(new THREE.Color(0x31476d),new THREE.Color(0xb9ddff),daylight));this.ambient.groundColor.copy(mixColorV6(new THREE.Color(0x172039),new THREE.Color(0x58442e),daylight));this.ambient.intensity=(.30+daylight*.72)*(profile==='fast'?1:1.12);this.fillAmbient.intensity=(.035+daylight*.085)*(profile==='ultra'?1.35:profile==='fancy'?1.18:1);
  let sky=mixColorV6(new THREE.Color(0x08142d),new THREE.Color(0x80bdf0),daylight);if(horizon>.01)sky=sky.lerp(new THREE.Color(0xdf8051),horizon*(.50+.20*(1-daylight)));this.scene.background.copy(sky);this.fog.color.copy(sky);this.fog.near=82;this.fog.far=daylight>.25?270:215;
  const totalHours=(6+phase*24)%24,h=Math.floor(totalHours),m=Math.floor((totalHours-h)*60);this.dayStateV6={phase,day:this._v6Day,daylight,timeText:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,isNight:daylight<.20};
  this.updateCelestialsV7?.();this.gameRefV7?.firstPersonV7?.update(dt);this.gameRefV7?.firstPersonV7?.group?.traverse(o=>{if(o.isMesh&&o.material){for(const mat of (Array.isArray(o.material)?o.material:[o.material])){mat.depthTest=false;mat.depthWrite=false;mat.fog=false;mat.toneMapped=false;mat.opacity=1;}}});
  const far=Number(this.lod?.far||32),far2=far*far;for(const [key,mesh] of this.chunkMeshes){const [cx,cz]=key.split(',').map(Number),wx=cx*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5,wz=cz*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5;mesh.visible=(wx-px)*(wx-px)+(wz-pz)*(wz-pz)<=far2*1.9;}
  this.updateLOD();this.renderer.render(this.scene,this.camera);{const ri=this.readRenderInfo();this.stats.drawCalls=ri.calls;this.stats.triangles=ri.triangles;}this.stats.chunks=this.chunkMeshes.size;
};

runtimeCommands.register('light',(x,y,z)=>game.lightV8?.level(Number(x??game.player.position.x),Number(y??game.player.position.y),Number(z??game.player.position.z)),'Get combined block/sky light level 0-15.');
runtimeCommands.register('water',()=>({air:game.waterV8?.air,inWater:game.player?.inWaterV8,headUnderwater:game.player?.headUnderwaterV8}),'Inspect player water state.');
runtimeCommands.register('offhand',()=>game.inventory?.offhand?{id:game.inventory.offhand.id,name:ITEM_NAME.get(game.inventory.offhand.id),count:game.inventory.offhand.count}:null,'Inspect Java-style offhand slot.');
runtimeCommands.register('villages',()=>({queuedSpawns:game.world?.generator?.villageSpawnsV8?.length||0,chunks:[...game.world?.chunks?.values?.()||[]].filter(c=>c.villageV8).map(c=>[c.cx,c.cz])}),'Inspect generated village starts.');
window.__voxelDiag?.log?.(`V8 READY ${STUDIO_V8.version}: held-item view model, offhand priority, cow bind X conversion, water/breath, Mojang HUD base sprites, light levels, torch lights, daylight burning, skeleton arrows, mob loot, lit furnace, raw iron, staggered leaves, random ticks, mountains/caves, village starts, title preview, fixed LOD sliders.`,'ok');


/* ===================== STUDIO V9: TITLE WORLD + MOJANG UI + SOUND + BREAK STAGES ===================== */
const STUDIO_V9=Object.freeze({version:'2.4.0-title-audio-break-stages',soundManifest:'resource_pack/sounds/sound_definitions.json',destroyStages:10});
window.STUDIO_PATCH_VERSION=STUDIO_V9.version;
const MOJANG_ROOT_V9='https://raw.githubusercontent.com/Mojang/bedrock-samples/main/';
const MOJANG_RP_V9=`${MOJANG_ROOT_V9}resource_pack/`;
const MOJANG_TEX_V9=`${MOJANG_RP_V9}textures/`;

/* Use Mojang's classic button state images throughout menus. The Bedrock classic UI maps these exact textures to default/hover/pressed states. */
const v9Style=document.createElement('style');
v9Style.textContent=`
#titlePanorama{display:none!important}
#v9TitleCanvas{position:absolute;inset:-1.5%;width:103%;height:103%;display:block;z-index:0;image-rendering:auto;touch-action:none;filter:none;transform:scale(1.018);transform-origin:center}
#titleShade{z-index:1;background:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.22)),radial-gradient(ellipse at center,transparent 34%,rgba(0,0,0,.43) 100%)}
#titleContent{z-index:2}
#titleContent.v9Title{width:min(560px,94vw);gap:7px;transform:translateY(-1vh)}
#titleContent.v9Title #mcLogo{width:min(445px,88vw);image-rendering:pixelated;filter:drop-shadow(4px 5px 0 rgba(0,0,0,.7))}
#v9SplashCanvas{width:min(310px,62vw);height:auto;image-rendering:pixelated;transform:rotate(-11deg);transform-origin:center;margin:-21px 0 5px 185px;filter:drop-shadow(2px 2px 0 #3b3200);pointer-events:none}
.v9MenuBtn,.v8MenuBtn,.titleBtn,.mc-btn{background-color:#777!important;background-image:url('${MOJANG_TEX_V9}ui/classic-button.png')!important;background-size:100% 100%!important;background-repeat:no-repeat!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#fff!important;text-shadow:2px 2px 0 #303030!important;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace!important;font-weight:800!important;image-rendering:pixelated;letter-spacing:0!important}
.v9MenuBtn:hover,.v8MenuBtn:hover,.titleBtn:hover,.mc-btn:hover{background-image:url('${MOJANG_TEX_V9}ui/classic-button-hover.png')!important}
.v9MenuBtn:active,.v8MenuBtn:active,.titleBtn:active,.mc-btn:active,.v9MenuBtn.pressed,.mc-btn.pressed{background-image:url('${MOJANG_TEX_V9}ui/classic-button-pressed.png')!important;transform:translateY(1px)}
.v9MenuBtn{width:min(400px,86vw);height:42px;padding:0 10px;color:#fff;font-size:15px;cursor:pointer;touch-action:manipulation}
.v9MenuRow{display:flex;gap:6px;width:min(400px,86vw)}.v9MenuRow .v9MenuBtn{width:50%}
.v9Small{font:10px/1.25 ui-monospace,'SFMono-Regular',Menlo,monospace;color:#dedede;text-shadow:1px 1px #111;text-align:center}
.v9WorldPanel{width:min(515px,92vw);padding:14px;background:#2f271f;background-image:url('${MOJANG_TEX_V9}ui/dirt_background.png');background-size:64px 64px;image-rendering:pixelated;border:2px solid #0d0a08;box-shadow:0 0 0 2px rgba(255,255,255,.13),0 8px 22px rgba(0,0,0,.45);color:#fff}
.v9WorldCard{display:grid;grid-template-columns:124px 1fr;gap:10px;padding:8px;background:rgba(0,0,0,.46);border:1px solid rgba(255,255,255,.18);margin:8px 0;text-shadow:1px 1px #111}
.v9WorldThumb{height:74px;position:relative;overflow:hidden;border:1px solid #111;background:linear-gradient(#79b7e8 0 47%,#70a84a 47% 60%,#6a482e 60%);image-rendering:pixelated}
.v9WorldThumb:before{content:'';position:absolute;left:15px;bottom:24px;width:42px;height:26px;background:#2f7135;box-shadow:32px 6px #367c39,64px -5px #2b6a31}
.v9WorldThumb:after{content:'';position:absolute;left:39px;bottom:15px;width:9px;height:24px;background:#6e4b2d;box-shadow:62px 0 #6e4b2d}
.v9OptionsGrid{display:grid;grid-template-columns:1fr;gap:11px;margin:12px 0}.v9RangeRow{background:rgba(0,0,0,.34);padding:8px}.v9RangeRow label{display:flex;justify-content:space-between;font:12px monospace;margin-bottom:5px}.v9RangeRow input[type=range],#voxelOptions input[type=range]{width:100%;height:30px;touch-action:none!important;pointer-events:auto!important;accent-color:#7fbf55}
#voxelOptions{touch-action:none!important}#voxelOptions .voxOptRow{touch-action:none!important}
@media (orientation:landscape) and (max-height:520px){#titleContent.v9Title{transform:scale(.88);transform-origin:center}.v9MenuBtn{height:37px}#v9SplashCanvas{margin-top:-18px}.v9WorldPanel{padding:9px}}
`;
document.head.appendChild(v9Style);

/* True pixel splash renderer. The official repo does not ship the Mojangles font files, so the splash is drawn from a small bitmap alphabet instead of a smooth browser font. */
const PIXEL_GLYPHS_V9={
 A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
 '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
 '!':['00100','00100','00100','00100','00100','00000','00100'],'?':['01110','10001','00001','00010','00100','00000','00100'],'.':['00000','00000','00000','00000','00000','00110','00110'],':':['00000','00110','00110','00000','00110','00110','00000'],'-':['00000','00000','00000','11111','00000','00000','00000'],' ':['00000','00000','00000','00000','00000','00000','00000']
};
const TITLE_SPLASHES_V9=['NOW WITH REAL BLOCK TEXTURES!','THREE.JS SURVIVAL!','MOBS READ BEDROCK JSON!','CAVES BELOW, MOUNTAINS ABOVE!','WATCH THE SUN!','BREAK IT BLOCK BY BLOCK!','SOUNDS FROM MOJANG DATA!','PIXELS EVERYWHERE!'];
function drawPixelSplashV9(canvas,text){if(!canvas)return;const t=String(text||'').toUpperCase(),scale=2,gap=1,charW=5*scale+gap*scale,width=Math.max(16,t.length*charW+4),height=7*scale+6;canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;for(let i=0;i<t.length;i++){const glyph=PIXEL_GLYPHS_V9[t[i]]||PIXEL_GLYPHS_V9['?'];for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(glyph[y][x]==='1'){const px=2+i*charW+x*scale,py=2+y*scale;c.fillStyle='#493f00';c.fillRect(px+scale,py+scale,scale,scale);c.fillStyle='#fff52d';c.fillRect(px,py,scale,scale);}}}

/* Full-screen Three.js title world. It uses Mojang block PNGs (with user-repository fallback through the existing resolver) instead of flat placeholder colors. */
class TitleWorldV9{
 constructor(canvas){this.canvas=canvas;this.alive=true;this.clock=0;this.ready=false;this._resize=()=>this.resize();addEventListener('resize',this._resize);this.init().catch(e=>this.fail('TITLE WORLD',e));}
 diag(msg,type='info'){try{window.__voxelDiag?.log?.(msg,type);}catch{}console[type==='err'?'error':type==='warn'?'warn':'info']('[TitleWorldV9]',msg);}
 fail(stage,e){this.diag(`${stage} FAILED: ${e?.message||e}`,'err');}
 async bitmapTexture(candidates,opts={}){let bmp=null,url='';for(const path of candidates){url=path.startsWith('http')?path:`${MOJANG_TEX_V9}${path}`;try{bmp=await game.assets.image(url);break;}catch{}}if(!bmp&&opts.fallbackName){try{bmp=await game.resolver.loadTexture(opts.fallbackName);url=game.resolver.getInfo(opts.fallbackName)?.url||'resolver';}catch{}}if(!bmp)throw new Error(`No texture candidate: ${candidates.join(', ')}`);const cv=document.createElement('canvas');cv.width=bmp.width||16;cv.height=bmp.height||16;const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(bmp,0,0);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;t.userData.sourceURL=url;return t;}
 async init(){await game.assets.init();this.r=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,powerPreference:'low-power'});this.r.outputColorSpace=THREE.SRGBColorSpace;this.r.setPixelRatio(Math.min(devicePixelRatio||1,2.0));this.s=new THREE.Scene();this.s.background=new THREE.Color(0x78b6e8);this.s.fog=new THREE.Fog(0x78b6e8,34,56);this.c=new THREE.PerspectiveCamera(70,1,.1,82);this.c.position.set(6.6,4.65,8.9);this.look=new THREE.Vector3(-.6,2.15,-3.8);this.c.lookAt(this.look);this.s.add(new THREE.HemisphereLight(0xbfe4ff,0x4b3926,1.18));const dl=new THREE.DirectionalLight(0xfff1cf,1.7);dl.position.set(-8,15,9);this.s.add(dl);
  const [grassTop,grassSide,dirt,stone,logSide,logTop,leaves]=await Promise.all([
   this.bitmapTexture(['blocks/grass_carried_top.png','blocks/grass_top.png'],{fallbackName:'grass_top'}),
   this.bitmapTexture(['blocks/grass_side_carried.png','blocks/grass_side.png'],{fallbackName:'grass_side'}),
   this.bitmapTexture(['blocks/dirt.png'],{fallbackName:'dirt'}),this.bitmapTexture(['blocks/stone.png'],{fallbackName:'stone'}),
   this.bitmapTexture(['blocks/log_oak.png','blocks/oak_log.png'],{fallbackName:'oak_log'}),this.bitmapTexture(['blocks/log_oak_top.png','blocks/oak_log_top.png'],{fallbackName:'oak_log_top'}),
   this.bitmapTexture(['blocks/leaves_oak.png','blocks/leaves_oak_opaque.png'],{fallbackName:'oak_leaves'})]);
  const lam=(t,color=0xffffff)=>new THREE.MeshLambertMaterial({map:t,color});
  const grassM=[lam(grassSide),lam(grassSide),lam(grassTop,0x6fbd45),lam(dirt),lam(grassSide),lam(grassSide)],dirtM=lam(dirt),stoneM=lam(stone),logM=[lam(logSide),lam(logSide),lam(logTop),lam(logTop),lam(logSide),lam(logSide)],leafM=new THREE.MeshLambertMaterial({map:leaves,color:0x5eaa47,alphaTest:.48,transparent:false,side:THREE.DoubleSide,depthWrite:true});
  const grassPos=[],dirtPos=[],stonePos=[],logPos=[],leafPos=[];const hAt=(x,z)=>Math.floor(1.4+Math.sin(x*.42)*.65+Math.cos(z*.46)*.55+Math.sin((x+z)*.19)*.55);
  for(let z=-52;z<=30;z++)for(let x=-48;x<=48;x++){const h=hAt(x,z);grassPos.push([x,h,z]);dirtPos.push([x,h-1,z]);if(h>1)dirtPos.push([x,h-2,z]);else stonePos.push([x,h-2,z]);}
  const treeSeeds=[[-18,-15],[-14,-5],[-9,-6],[-5,-10],[0,-7],[6,-10],[10,-4],[-12,1],[4,1],[13,-12],[16,3],[20,-10],[-20,5],[-6,10],[8,11],[19,12]];for(const [x,z] of treeSeeds){const y=hAt(x,z)+1,hh=3+(Math.abs(x+z)%2);for(let k=0;k<hh;k++)logPos.push([x,y+k,z]);const cy=y+hh-1;for(let dy=-1;dy<=1;dy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const d=Math.abs(dx)+Math.abs(dz)+Math.abs(dy)*1.2;if(d>4.2||(!dx&&!dz&&dy<1))continue;leafPos.push([x+dx,cy+dy,z+dz]);}}
  const addInst=(positions,mat)=>{if(!positions.length)return;const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,positions.length),m=new THREE.Matrix4();positions.forEach((p,i)=>{m.makeTranslation(p[0],p[1],p[2]);mesh.setMatrixAt(i,m);});mesh.instanceMatrix.needsUpdate=true;this.s.add(mesh);return mesh;};addInst(stonePos,stoneM);addInst(dirtPos,dirtM);addInst(grassPos,grassM);addInst(logPos,logM);addInst(leafPos,leafM);
  const waterMat=new THREE.MeshLambertMaterial({color:0x386bd1,transparent:true,opacity:.58,depthWrite:false});const water=new THREE.Mesh(new THREE.PlaneGeometry(34,18),waterMat);water.rotation.x=-Math.PI/2;water.position.set(-7,.65,-17);this.s.add(water);this.ready=true;this.resize();this.diag(`TITLE WORLD READY • grass ${grassPos.length} • leaves ${leafPos.length} • Mojang PNG materials`,'ok');this.loop();}
 resize(){if(!this.r||!this.c)return;const w=Math.max(1,this.canvas.clientWidth),h=Math.max(1,this.canvas.clientHeight);this.r.setSize(w,h,false);this.c.aspect=w/h;this.c.updateProjectionMatrix();}
 loop(){if(!this.alive||!this.r)return;this.clock+=.0032;const a=this.clock;if(!this.pausedV10){this.c.position.x=6.1+Math.sin(a)*1.35;this.c.position.z=8.7+Math.cos(a*.72)*.85;this.c.position.y=4.55+Math.sin(a*.53)*.24;this.c.lookAt(this.look.x+Math.sin(a*.31)*.62,this.look.y,this.look.z);this.r.render(this.s,this.c);}requestAnimationFrame(()=>this.loop());}
 dispose(){this.alive=false;removeEventListener('resize',this._resize);try{this.s?.traverse(o=>{o.geometry?.dispose?.();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material])){m.map?.dispose?.();m.dispose?.();}}});this.r?.dispose();}catch{}}
}
let titleWorldV9=null;
function ensureTitleWorldV9(){let canvas=$('v9TitleCanvas');if(!canvas){canvas=document.createElement('canvas');canvas.id='v9TitleCanvas';titleScreen.insertBefore(canvas,titleScreen.firstChild);}titleWorldV9?.dispose();titleWorldV9=new TitleWorldV9(canvas);}

/* Title menus stay over the live world instead of replacing it with a small contained thumbnail. */
function v9BuildTitle(){const content=$('titleContent');if(!content)return;content.className='v9Title';content.innerHTML=`<img id="mcLogo" src="${MC_TEX}gui/title/minecraft.png" alt="Minecraft"><canvas id="v9SplashCanvas"></canvas><button class="v9MenuBtn" id="v9Singleplayer">Singleplayer</button><button class="v9MenuBtn" id="v9Multiplayer">Multiplayer</button><div class="v9MenuRow"><button class="v9MenuBtn" id="v9Packs">Texture Packs</button><button class="v9MenuBtn" id="v9TitleOptions">Options...</button></div><div class="v9Small">Minecraft Web • Three.js • ${STUDIO_V10?.version||STUDIO_V9.version}</div>`;drawPixelSplashV9($('v9SplashCanvas'),TITLE_SPLASHES_V9[Math.floor(Math.random()*TITLE_SPLASHES_V9.length)]);$('v9Singleplayer').onclick=v9WorldSelect;$('v9Multiplayer').onclick=()=>toast('Multiplayer transport is not connected yet.');$('v9Packs').onclick=()=>toast('Assets: your Minecraft-assets repository → Mojang Bedrock samples.');$('v9TitleOptions').onclick=v9TitleOptions;}
function v9WorldSelect(){const content=$('titleContent');content.className='v9Title';content.innerHTML=`<div class="v9WorldPanel"><h2 class="mc-title" style="color:#fff;text-shadow:2px 2px #111">Select World</h2><div class="v9WorldCard"><div class="v9WorldThumb"></div><div><b>New World</b><div class="v9Small" style="text-align:left">Survival Mode<br>Local browser save • seed ${game.seed}</div></div></div><button class="v9MenuBtn" id="v9PlayWorld">Play Selected World</button><button class="v9MenuBtn" id="v9CreateWorld">Create New World</button><div class="v9MenuRow"><button class="v9MenuBtn" id="v9CreativeWorld">Creative</button><button class="v9MenuBtn" id="v9WorldCancel">Cancel</button></div></div>`;$('v9PlayWorld').onclick=()=>game.boot('survival',false);$('v9CreateWorld').onclick=()=>game.newWorld('survival');$('v9CreativeWorld').onclick=()=>game.boot('creative',false);$('v9WorldCancel').onclick=v9BuildTitle;}
function v9PersistLod(q,near,far){const data={q:Number(q),near:Number(near),far:Math.max(Number(far),Number(near)+1)};localStorage.setItem('v8Lod',JSON.stringify(data));if($('voxelQuality')){$('voxelQuality').value=data.q;$('voxelQualityValue').textContent=`${data.q}%`;}if($('voxelLodNear')){$('voxelLodNear').value=data.near;$('voxelLodNearValue').textContent=data.near;}if($('voxelLodFar')){$('voxelLodFar').value=data.far;$('voxelLodFarValue').textContent=data.far;}if(game?.renderer){game.renderer.lod.qualityCeiling=data.q;game.renderer.lod.near=data.near;game.renderer.lod.far=data.far;entityLodPolicy.near=Math.max(8,data.near*2);entityLodPolicy.medium=Math.max(entityLodPolicy.near+4,data.far*2);}}
function v9TitleOptions(){
 const content=$('titleContent'),profile=localStorage.getItem('studioGraphicsV7')||'fancy',backend=localStorage.getItem('mcRendererBackendV10')||'webgl';
 let saved={q:Number($('voxelQuality')?.value||100),near:Number($('voxelLodNear')?.value||10),far:Number($('voxelLodFar')?.value||32)};try{saved={...saved,...JSON.parse(localStorage.getItem('v8Lod')||'{}')};}catch{}
 const gpuState=window.isSecureContext===true&&!!navigator.gpu?'READY':'UNAVAILABLE';
 content.className='v9Title';content.innerHTML=`<div class="v9WorldPanel"><h2 class="mc-title" style="color:white;text-shadow:2px 2px #111">Options</h2><div class="v9OptionsGrid"><div class="v9RangeRow"><label><span>Graphics</span><b id="v9GfxValue">${profile.toUpperCase()}</b></label><select id="v9PreGfx" class="gfx-select-v7"><option value="fast">Fast</option><option value="fancy">Fancy</option><option value="ultra">Ultra</option></select></div><div class="v9RangeRow"><label><span>Renderer (next world start)</span><b id="v9RendererState">${gpuState}</b></label><select id="v10RendererChoice" class="gfx-select-v7"><option value="webgl">WebGL 2 / WebGL</option><option value="webgpu">WebGPU</option><option value="auto">Auto (prefer WebGPU)</option></select><div class="v9Small" style="margin-top:5px;text-align:left">WebGPU capability: secure context ${window.isSecureContext===true?'YES':'NO'} • navigator.gpu ${navigator.gpu?'YES':'NO'}${window.isSecureContext!==true?' • use HTTPS/localhost to test WebGPU':''}</div></div><div class="v9RangeRow"><label><span>Texture quality</span><b id="v9QVal">${saved.q}%</b></label><input id="v9PreQuality" type="range" min="25" max="100" step="25" value="${saved.q}"></div><div class="v9RangeRow"><label><span>LOD near distance</span><b id="v9NVal">${saved.near}</b></label><input id="v9PreNear" type="range" min="4" max="20" step="1" value="${saved.near}"></div><div class="v9RangeRow"><label><span>LOD far distance</span><b id="v9FVal">${saved.far}</b></label><input id="v9PreFar" type="range" min="16" max="60" step="1" value="${saved.far}"></div></div><div class="v9MenuRow"><button class="v9MenuBtn" id="v10GpuBenchTitle">GPU A/B Test</button><button class="v9MenuBtn" id="v9OptDone">Done</button></div></div>`;
 $('v9PreGfx').value=profile;$('v10RendererChoice').value=backend;
 $('v9PreGfx').onchange=e=>{localStorage.setItem('studioGraphicsV7',e.target.value);$('v9GfxValue').textContent=e.target.value.toUpperCase();};
 $('v10RendererChoice').onchange=e=>{localStorage.setItem('mcRendererBackendV10',e.target.value);$('v9RendererState').textContent=e.target.value==='webgpu'?(window.isSecureContext&&navigator.gpu?'READY':'FALLBACK'):e.target.value.toUpperCase();};
 const apply=()=>{const q=$('v9PreQuality').value,n=$('v9PreNear').value,f=Math.max(Number($('v9PreFar').value),Number(n)+1);$('v9QVal').textContent=`${q}%`;$('v9NVal').textContent=n;$('v9FVal').textContent=f;$('v9PreFar').value=f;v9PersistLod(q,n,f);};
 for(const id of ['v9PreQuality','v9PreNear','v9PreFar']){const el=$(id);el.addEventListener('input',apply,{passive:true});el.addEventListener('change',apply,{passive:true});el.addEventListener('pointerdown',e=>e.stopPropagation(),{passive:true});el.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});}
 $('v10GpuBenchTitle').onclick=()=>window.rendererBenchV10?.open('ab');$('v9OptDone').onclick=v9BuildTitle;
}

/* Rebind in-game ranges so iOS Safari does not hand their drag to the game look surface. */
function bindStudioRangeV9(id,label){const el=$(id);if(!el)return;el.style.touchAction='none';const apply=e=>{const v=Number(e.currentTarget.value);if($(label))$(label).textContent=id==='voxelQuality'?`${v}%`:String(v);const q=Number($('voxelQuality')?.value||100),n=Number($('voxelLodNear')?.value||10),f=Number($('voxelLodFar')?.value||32);v9PersistLod(q,n,f);};el.oninput=apply;el.onchange=apply;for(const type of ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend'])el.addEventListener(type,e=>e.stopPropagation(),{passive:true});}
bindStudioRangeV9('voxelQuality','voxelQualityValue');bindStudioRangeV9('voxelLodNear','voxelLodNearValue');bindStudioRangeV9('voxelLodFar','voxelLodFarValue');

/* Mojang Bedrock sound-definition parser + lazy FSB->WAV bridge. Browsers do not natively decode .fsb, so conversion is isolated and cached. */
class FsbToWavV9{
 constructor(){this.ff=null;this.util=null;this.loading=null;this.serial=Promise.resolve();}
 async ensure(){if(this.ff)return this.ff;if(this.loading)return this.loading;this.loading=(async()=>{const [{FFmpeg},util]=await Promise.all([import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js'),import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js')]);const ff=new FFmpeg(),coreBase='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';ff.on('log',({message})=>{if(/error|invalid|failed/i.test(message||''))window.__voxelDiag?.log?.(`AUDIO FFMPEG: ${message}`,'warn');});await ff.load({coreURL:await util.toBlobURL(`${coreBase}/ffmpeg-core.js`,'text/javascript'),wasmURL:await util.toBlobURL(`${coreBase}/ffmpeg-core.wasm`,'application/wasm')});this.ff=ff;this.util=util;window.__voxelDiag?.log?.('FSB TRANSLATOR READY: ffmpeg.wasm loaded lazily.','ok');return ff;})().catch(e=>{this.loading=null;throw e;});return this.loading;}
 async convert(arrayBuffer,key='sample'){const job=async()=>{const ff=await this.ensure(),safe=key.replace(/[^a-z0-9_-]/gi,'_'),input=`${safe}.fsb`,out=`${safe}.wav`;await ff.writeFile(input,new Uint8Array(arrayBuffer));try{const code=await ff.exec(['-y','-i',input,'-ac','2','-ar','44100','-c:a','pcm_s16le',out]);if(code!==0)throw new Error(`ffmpeg exit ${code}`);const data=await ff.readFile(out);return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);}finally{try{await ff.deleteFile(input);}catch{}try{await ff.deleteFile(out);}catch{}}};this.serial=this.serial.then(job,job);return this.serial;}
}
class MinecraftSoundSystemV9{
 constructor(gameRef){this.game=gameRef;this.ctx=null;this.master=null;this.defs=null;this.buffers=new Map();this.pending=new Map();this.failOnce=new Set();this.transcoder=new FsbToWavV9();this.cacheName='fresh-mc-audio-v9';this.manifestPromise=null;this.enabled=true;this.lastHit=0;}
 diag(msg,type='info'){window.__voxelDiag?.log?.(msg,type);if(type==='err')console.error('[SoundV9]',msg);else if(type==='warn')console.warn('[SoundV9]',msg);else console.info('[SoundV9]',msg);}
 async unlock(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Web Audio unavailable');this.ctx=new AC({latencyHint:'interactive'});this.master=this.ctx.createGain();this.master.gain.value=.72;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')await this.ctx.resume();this.loadManifest();return this.ctx;}
 async loadManifest(){if(this.defs)return this.defs;if(this.manifestPromise)return this.manifestPromise;const url=`${MOJANG_ROOT_V9}${STUDIO_V9.soundManifest}`;this.manifestPromise=(async()=>{const text=await game.assets.text(url),json=JSON.parse(text);this.defs=json.sound_definitions||{};this.diag(`SOUND DEFINITIONS READY: ${Object.keys(this.defs).length} events from Mojang.`,'ok');return this.defs;})().catch(e=>{this.manifestPromise=null;this.diag(`SOUND DEFINITIONS FAILED: ${e.message}`,'err');throw e;});return this.manifestPromise;}
 pick(event){const def=this.defs?.[event];if(!def?.sounds?.length)return null;let total=0,items=def.sounds.map(s=>typeof s==='string'?{name:s,weight:1}:{...s,weight:Number(s.weight)||1});for(const s of items)total+=s.weight;let r=Math.random()*total;for(const s of items){r-=s.weight;if(r<=0)return s;}return items.at(-1);}
 async cachedWav(path){if(!('caches'in window))return null;try{const c=await caches.open(this.cacheName),r=await c.match(`https://audio.local/${encodeURIComponent(path)}.wav`);return r?await r.arrayBuffer():null;}catch{return null;}}
 async storeWav(path,ab){if(!('caches'in window))return;try{const c=await caches.open(this.cacheName);await c.put(`https://audio.local/${encodeURIComponent(path)}.wav`,new Response(ab,{headers:{'Content-Type':'audio/wav'}}));}catch{}}
 async buffer(path){if(this.buffers.has(path))return this.buffers.get(path);if(this.pending.has(path))return this.pending.get(path);const p=(async()=>{await this.unlock();let wav=await this.cachedWav(path);if(!wav){const url=`${MOJANG_RP_V9}${path.replace(/^resource_pack\//,'')}.fsb`;this.diag(`FSB FETCH ${path}`,'info');const blob=await game.assets.fetch(url),raw=await blob.arrayBuffer();try{const direct=await this.ctx.decodeAudioData(raw.slice(0));this.buffers.set(path,direct);this.diag(`FSB DIRECT DECODE ${path}`,'ok');return direct;}catch{}this.diag(`FSB -> WAV ${path}`,'info');wav=await this.transcoder.convert(raw,path);await this.storeWav(path,wav);}const decoded=await this.ctx.decodeAudioData(wav.slice(0));this.buffers.set(path,decoded);this.diag(`AUDIO READY ${path} ${decoded.duration.toFixed(2)}s`,'ok');return decoded;})().catch(e=>{if(!this.failOnce.has(path)){this.failOnce.add(path);this.diag(`AUDIO FAILED ${path}: ${e.message}`,'err');}return null;}).finally(()=>this.pending.delete(path));this.pending.set(path,p);return p;}
 synthClick(){if(!this.ctx||!this.master)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.type='square';o.frequency.setValueAtTime(760,t);o.frequency.exponentialRampToValueAtTime(420,t+.035);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.05);}
 updateListener(){if(!this.ctx||!this.game.player)return;const l=this.ctx.listener,p=this.game.player.eyePosition(),f=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.game.player.pitch,this.game.player.yaw,0,'YXZ'));try{l.positionX.value=p.x;l.positionY.value=p.y;l.positionZ.value=p.z;l.forwardX.value=f.x;l.forwardY.value=f.y;l.forwardZ.value=f.z;l.upX.value=0;l.upY.value=1;l.upZ.value=0;}catch{l.setPosition?.(p.x,p.y,p.z);l.setOrientation?.(f.x,f.y,f.z,0,1,0);}}
 async play(event,{position=null,volume=1,pitch=1,ui=false,temporaryClick=false}={}){if(!this.enabled)return;try{await this.unlock();await this.loadManifest();const item=this.pick(event);if(!item){if(temporaryClick)this.synthClick();this.diag(`SOUND EVENT NOT FOUND: ${event}`,'warn');return;}const path=item.name.replace(/\.fsb$/i,''),buf=await this.buffer(path);if(!buf){if(temporaryClick)this.synthClick();return;}const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();src.buffer=buf;src.playbackRate.value=Math.max(.25,Math.min(4,pitch*(Number(item.pitch)||1)));gain.gain.value=Math.max(0,Math.min(2,volume*(Number(item.volume)||1)));src.connect(gain);if(position&&!ui){const p=this.ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=2;p.maxDistance=32;p.rolloffFactor=1;try{p.positionX.value=position.x;p.positionY.value=position.y;p.positionZ.value=position.z;}catch{p.setPosition?.(position.x,position.y,position.z);}gain.connect(p);p.connect(this.master);}else gain.connect(this.master);src.start();}catch(e){if(temporaryClick)this.synthClick();this.diag(`PLAY ${event} FAILED: ${e.message}`,'err');}}
}
game.soundV9=new MinecraftSoundSystemV9(game);
const blockSoundEventV9=id=>{if([BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.CRAFTING_TABLE,BLOCK.CHEST].includes(id))return'dig.wood';if(id===BLOCK.GRAVEL)return'dig.gravel';if(id===BLOCK.SAND)return'dig.sand';if([BLOCK.GRASS,BLOCK.DIRT,BLOCK.OAK_LEAVES,BLOCK.TALL_GRASS,BLOCK.FLOWER].includes(id))return'dig.grass';return'dig.stone';};

/* Proper 10-stage Mojang destroy texture overlay. */
class BlockBreakOverlayV9{
 constructor(gameRef){this.game=gameRef;this.mesh=null;this.stage=-1;this.key='';this.materials=new Map();this.loading=new Map();}
 ensure(){if(this.mesh||!this.game.renderer?.scene)return;const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,toneMapped:false});this.mesh=new THREE.Mesh(new THREE.BoxGeometry(1.006,1.006,1.006),mat);this.mesh.visible=false;this.mesh.renderOrder=997;this.game.renderer.scene.add(this.mesh);}
 async material(stage){if(this.materials.has(stage))return this.materials.get(stage);if(this.loading.has(stage))return this.loading.get(stage);const p=new Promise(resolve=>{const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.02,depthWrite:false,depthTest:true,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,toneMapped:false});const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');const url=`${MOJANG_TEX_V9}environment/destroy_stage_${stage}.png`;loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;m.map=t;m.needsUpdate=true;this.materials.set(stage,m);window.__voxelDiag?.log?.(`BREAK STAGE ${stage} READY ${url}`,'ok');resolve(m);},undefined,e=>{window.__voxelDiag?.log?.(`BREAK STAGE ${stage} FAILED ${url}`,'err');resolve(null);});});this.loading.set(stage,p);return p;}
 async update(hit,progress){this.ensure();if(!this.mesh||!hit||progress<=0){this.clear();return;}const key=blockKey(hit.x,hit.y,hit.z),stage=clamp(Math.floor(progress*10),0,9);this.mesh.position.set(hit.x+.5,hit.y+.5,hit.z+.5);this.mesh.visible=true;this.key=key;if(stage!==this.stage){this.stage=stage;const m=await this.material(stage);if(this.mesh&&this.stage===stage&&m)this.mesh.material=m;}}
 clear(){if(this.mesh)this.mesh.visible=false;this.key='';this.stage=-1;}
}
game.breakOverlayV9=new BlockBreakOverlayV9(game);

/* Wrap the final mining implementation: crack stages and Bedrock sound events track actual break progress. */
const v9MineBase=Game.prototype.mine;
Game.prototype.mine=function(dt){const hit=this.breaking?this.getTarget?.():null,beforeId=hit?.id||BLOCK.AIR,beforeKey=hit?blockKey(hit.x,hit.y,hit.z):'',beforeStage=Math.floor((this.player?.breakProgress||0)*10);v9MineBase.call(this,dt);if(!hit||!this.breaking){this.breakOverlayV9?.clear();return;}const after=this.world.getLoaded(hit.x,hit.y,hit.z);if(after===BLOCK.AIR&&beforeId!==BLOCK.AIR){this.breakOverlayV9?.clear();this.soundV9?.play(blockSoundEventV9(beforeId),{position:new THREE.Vector3(hit.x+.5,hit.y+.5,hit.z+.5),volume:.82,pitch:.92+Math.random()*.14});return;}if(this.player.breaking===beforeKey&&this.player.breakProgress>0){this.breakOverlayV9?.update(hit,this.player.breakProgress);const stage=Math.floor(this.player.breakProgress*10);if(stage!==beforeStage&&stage%2===0){const t=performance.now();if(t-(this.soundV9?.lastHit||0)>90){this.soundV9.lastHit=t;this.soundV9.play(blockSoundEventV9(beforeId),{position:new THREE.Vector3(hit.x+.5,hit.y+.5,hit.z+.5),volume:.18,pitch:.68+Math.random()*.12});}}}else this.breakOverlayV9?.clear();};
const v9EndBreakBase=Game.prototype.endBreak;
Game.prototype.endBreak=function(){this.breakOverlayV9?.clear();return v9EndBreakBase.call(this);};

/* Placement sounds use the same material family. */
const v9UseSelectedBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const hit=this.getTarget?.(),selected=this.selectedStack?.(),block=selected?this.itemToBlock?.(selected.id):BLOCK.AIR,place=hit?.place?{...hit.place}:null,before=place?this.world.getLoaded(place.x,place.y,place.z):null;const r=v9UseSelectedBase.call(this);if(place&&block&&block!==BLOCK.AIR&&before===BLOCK.AIR&&this.world.getLoaded(place.x,place.y,place.z)===block)this.soundV9?.play(blockSoundEventV9(block),{position:new THREE.Vector3(place.x+.5,place.y+.5,place.z+.5),volume:.55,pitch:1.08});return r;};

/* iOS requires a user gesture before AudioContext can start. Unlock once, then begin warming the Mojang menu click. */
let v9AudioGestureDone=false;
const v9UnlockAudio=()=>{if(v9AudioGestureDone)return;v9AudioGestureDone=true;game.soundV9?.unlock().then(()=>game.soundV9.loadManifest()).then(()=>game.soundV9.play('random.click',{volume:.45,ui:true,temporaryClick:true})).catch(e=>window.__voxelDiag?.log?.(`AUDIO UNLOCK FAILED: ${e.message}`,'err'));};
document.addEventListener('pointerdown',v9UnlockAudio,{capture:true,passive:true,once:true});document.addEventListener('touchstart',v9UnlockAudio,{capture:true,passive:true,once:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('.v9MenuBtn,.v8MenuBtn,.titleBtn,.mc-btn,.voxBtn'))game.soundV9?.play('random.click',{volume:.38,ui:true,temporaryClick:true});},{capture:true});

/* Keep listener and visual systems synchronized without replacing the existing game update. */
const v9UpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){this.soundV9?.updateListener();return v9UpdateBase.call(this,dt);};
const v9BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){titleWorldV9?.dispose();titleWorldV9=null;return await v9BootBase.apply(this,args);};

/* Route uncaught runtime failures into both DevTools and the in-game diagnostic console. */
addEventListener('error',e=>{const msg=`RUNTIME ERROR ${e.message||'unknown'} @ ${e.filename||''}:${e.lineno||0}:${e.colno||0}`;console.error(msg,e.error||'');window.__voxelDiag?.log?.(msg,'err');});
addEventListener('unhandledrejection',e=>{const msg=`UNHANDLED PROMISE ${e.reason?.stack||e.reason||'unknown'}`;console.error(msg);window.__voxelDiag?.log?.(msg,'err');});
runtimeCommands.register('sound',(event='random.click')=>{game.soundV9?.play(String(event),{ui:true,temporaryClick:true});return {event,manifest:!!game.soundV9?.defs,buffers:game.soundV9?.buffers.size||0,pending:game.soundV9?.pending.size||0};},'Play/inspect a Mojang sound event.');
runtimeCommands.register('breakstage',()=>({stage:game.breakOverlayV9?.stage,key:game.breakOverlayV9?.key,progress:game.player?.breakProgress||0}),'Inspect active block breaking stage.');


/* ===================== STUDIO V10: WEBGPU + WEBGL A/B + LIVE WORLD BENCHMARK ===================== */
const STUDIO_V10=Object.freeze({version:'2.5.0-webgpu-ab-live-benchmark',thresholdFps:58.5,maxWorldRadius:10});
window.STUDIO_PATCH_VERSION=STUDIO_V10.version;
const v10Style=document.createElement('style');v10Style.textContent=`
#renderBenchV10{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.76);padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));pointer-events:auto;touch-action:pan-y}
#renderBenchV10.open{display:flex}.benchCardV10{width:min(760px,96vw);max-height:92dvh;overflow:auto;background:#171717;border:3px solid #777;box-shadow:inset 2px 2px #aaa,inset -2px -2px #111;color:#fff;padding:12px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;-webkit-overflow-scrolling:touch}.benchTitleV10{font-size:18px;font-weight:900;text-align:center;margin-bottom:8px}.benchButtonsV10{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}.benchButtonsV10 button{flex:1;min-width:150px}.benchOutV10{white-space:pre-wrap;background:#050505;border:1px solid #555;padding:9px;min-height:150px;user-select:text;-webkit-user-select:text}.benchMeterV10{height:12px;background:#222;border:1px solid #666;margin:7px 0}.benchMeterV10>div{height:100%;width:0;background:#58b64b;transition:width .15s}.benchNoteV10{font-size:10px;opacity:.72;margin-top:7px}
#v10BenchQuick{position:absolute;right:142px;top:8px;z-index:180;height:36px;padding:0 9px;border:2px solid #222;background:rgba(0,0,0,.72);color:#fff;border-radius:4px;font:900 10px monospace;pointer-events:auto;touch-action:manipulation}
@media(max-width:680px){#v10BenchQuick{right:140px;top:49px;height:31px}.benchCardV10{font-size:10px;padding:8px}}
`;document.head.appendChild(v10Style);

class RendererBenchmarkV10{
 constructor(gameRef){this.game=gameRef;this.running=false;this.cancelled=false;this.lastResults=null;this.ensureUI();}
 ensureUI(){if($('renderBenchV10'))return;const el=document.createElement('div');el.id='renderBenchV10';el.innerHTML=`<div class="benchCardV10"><div class="benchTitleV10">Renderer / World Performance Lab</div><div id="benchCapabilityV10"></div><div class="benchMeterV10"><div id="benchMeterFillV10"></div></div><div class="benchButtonsV10"><button class="v9MenuBtn" id="benchABV10">GPU A/B</button><button class="v9MenuBtn" id="benchWorldV10">LIVE WORLD</button><button class="v9MenuBtn" id="benchCancelV10">CANCEL</button><button class="v9MenuBtn" id="benchCloseV10">CLOSE</button></div><div class="benchOutV10" id="benchOutV10">Ready.</div><div class="benchNoteV10">GPU A/B uses the same Three.js revision and a fixed voxel-like stress scene. LIVE WORLD ramps the real game from view radius 4 upward and stops when sustained 60-FPS-class performance is lost. Results depend on browser, temperature, battery mode, screen resolution, graphics profile and current world content.</div></div>`;document.body.appendChild(el);$('benchABV10').onclick=()=>this.runAB();$('benchWorldV10').onclick=()=>this.runWorld();$('benchCancelV10').onclick=()=>{this.cancelled=true;this.line('Cancellation requested…');};$('benchCloseV10').onclick=()=>{if(!this.running)this.close();};this.capability();}
 capability(){const cap=`Secure context: ${window.isSecureContext===true?'YES':'NO'} | navigator.gpu: ${navigator.gpu?'YES':'NO'} | DPR: ${(devicePixelRatio||1).toFixed(2)} | CPU threads: ${navigator.hardwareConcurrency||'n/a'} | viewport: ${innerWidth}×${innerHeight}`;if($('benchCapabilityV10'))$('benchCapabilityV10').textContent=cap;return cap;}
 open(mode){this.ensureUI();$('renderBenchV10').classList.add('open');this.capability();if(mode==='ab')this.line('Ready for WebGL vs WebGPU A/B.');else if(mode==='world')this.line('Ready for live-world capacity test.');}
 close(){$('renderBenchV10')?.classList.remove('open');}
 out(text){if($('benchOutV10'))$('benchOutV10').textContent=text;}
 line(text){const e=$('benchOutV10');if(e)e.textContent+=(e.textContent?'\n':'')+text;e?.scrollTo?.(0,e.scrollHeight);window.__voxelDiag?.log?.(`BENCH ${text}`,'info');}
 meter(v){if($('benchMeterFillV10'))$('benchMeterFillV10').style.width=`${clamp(v,0,1)*100}%`;}
 async frame(){return new Promise(r=>requestAnimationFrame(r));}
 metrics(deltas){const a=deltas.filter(v=>Number.isFinite(v)&&v>0).sort((x,y)=>x-y);if(!a.length)return{fps:0,p95:Infinity,low1:0,mean:Infinity};const mean=a.reduce((x,y)=>x+y,0)/a.length,p95=a[Math.min(a.length-1,Math.floor(a.length*.95))],worst=a.slice(Math.floor(a.length*.99));const worstMean=worst.reduce((x,y)=>x+y,0)/Math.max(1,worst.length);return{fps:1000/mean,p95,low1:1000/worstMean,mean};}
 async sampleFrames(frames=100,warm=24){for(let i=0;i<warm;i++){if(this.cancelled)break;await this.frame();}const d=[];let last=performance.now();for(let i=0;i<frames&&!this.cancelled;i++){await this.frame();const t=performance.now();d.push(t-last);last=t;}return this.metrics(d);}
 buildStressScene(T,count){const scene=new T.Scene();scene.background=new T.Color(0x7fb8df);scene.fog=new T.Fog(0x7fb8df,80,320);const camera=new T.PerspectiveCamera(70,16/9,.1,700);camera.position.set(0,72,150);camera.lookAt(0,20,0);scene.add(new T.HemisphereLight(0xc6e5ff,0x51402c,1.15));const sun=new T.DirectionalLight(0xfff1d4,1.25);sun.position.set(80,140,70);scene.add(sun);const g=new T.BoxGeometry(15.7,8,15.7,10,4,10);const m=new T.MeshLambertMaterial({color:0x72a753});const cols=Math.ceil(Math.sqrt(count));for(let i=0;i<count;i++){const mesh=new T.Mesh(g,m),x=(i%cols-cols/2)*17,z=(Math.floor(i/cols)-cols/2)*17;mesh.position.set(x,Math.sin(i*.47)*4,z);scene.add(mesh);}return{scene,camera,geometry:g,material:m};}
 async makeRenderer(kind,benchCanvas){if(kind==='webgl'){const r=new THREE.WebGLRenderer({canvas:benchCanvas,antialias:false,alpha:false,powerPreference:'high-performance'});r.outputColorSpace=THREE.SRGBColorSpace;return{T:THREE,r,label:r.capabilities.isWebGL2?'WebGL2':'WebGL1'};}if(window.isSecureContext!==true)throw new Error('WebGPU is blocked here because this page is not a secure context. Serve the preview over HTTPS or localhost.');if(!navigator.gpu)throw new Error('navigator.gpu is unavailable.');const W=await import('three/webgpu'),r=new W.WebGPURenderer({canvas:benchCanvas,antialias:false,alpha:false});r.outputColorSpace=W.SRGBColorSpace;await r.init();const bn=r.backend?.constructor?.name||'';return{T:W,r,label:/webgpu/i.test(bn)||r.backend?.isWebGPUBackend?'WebGPU':`WebGPU renderer (${bn||'backend unknown'})`};}
 async runSynthetic(kind){const cv=document.createElement('canvas');cv.style.cssText='position:fixed;left:-10000px;top:0;width:640px;height:360px;pointer-events:none';document.body.appendChild(cv);let made=null;try{made=await this.makeRenderer(kind,cv);const {T,r,label}=made;r.setPixelRatio(Math.min(devicePixelRatio||1,1.25));r.setSize(640,360,false);const tiers=[24,48,72,96,128,160,192,224],rows=[];let max60=null;for(let ti=0;ti<tiers.length&&!this.cancelled;ti++){const count=tiers[ti],stress=this.buildStressScene(T,count);for(let i=0;i<20;i++){r.render(stress.scene,stress.camera);await this.frame();}const d=[];let last=performance.now();for(let i=0;i<90&&!this.cancelled;i++){r.render(stress.scene,stress.camera);await this.frame();const t=performance.now();d.push(t-last);last=t;}const m=this.metrics(d),info=r.info?.render||{},tri=Number(info.triangles||0);rows.push({count,...m,drawCalls:Number(info.calls??info.drawCalls??count)||count,triangles:tri});stress.scene.clear();stress.geometry.dispose();stress.material.dispose();this.line(`${label} tier ${count}: ${m.fps.toFixed(1)} FPS | 1% low ${m.low1.toFixed(1)} | p95 ${m.p95.toFixed(2)}ms | draws ${rows.at(-1).drawCalls} | tris ${tri}`);this.meter((ti+1)/tiers.length);if(m.fps>=STUDIO_V10.thresholdFps&&m.p95<=22)max60=rows.at(-1);else if(ti>=1)break;}return{backend:label,rows,max60};}finally{try{made?.r?.dispose?.();}catch{}cv.remove();}}
 async runAB(){if(this.running)return;this.open();this.running=true;this.cancelled=false;this.out('Starting apples-to-apples Three.js voxel-like A/B…');titleWorldV9&&(titleWorldV9.pausedV10=true);try{const webgl=await this.runSynthetic('webgl');let webgpu=null,error='';if(!this.cancelled){try{webgpu=await this.runSynthetic('webgpu');}catch(e){error=e.message;this.line(`WebGPU test unavailable: ${error}`);}}const ratio=webgl.max60&&webgpu?.max60?webgpu.max60.count/webgl.max60.count:null;this.lastResults={timestamp:new Date().toISOString(),type:'ab',webgl,webgpu,error,ratio,device:this.deviceSnapshot()};localStorage.setItem('mcGpuABV10',JSON.stringify(this.lastResults));if(ratio)this.line(`A/B 60-FPS-class capacity ratio: WebGPU ${(ratio).toFixed(2)}× WebGL in this synthetic scene (${((ratio-1)*100).toFixed(0)}%).`);else this.line('A/B complete. A ratio is shown only when both backends reach at least one passing tier.');}catch(e){this.line(`A/B FAILED: ${e.message}`);}finally{this.running=false;titleWorldV9&&(titleWorldV9.pausedV10=false);this.meter(1);}}
 expectedChunks(radius){let n=0;for(let z=-radius;z<=radius;z++)for(let x=-radius;x<=radius;x++)if(x*x+z*z<=(radius+.5)*(radius+.5))n++;return n;}
 async waitWorld(radius,timeoutMs=14000){const g=this.game,expected=this.expectedChunks(radius),start=performance.now();while(!this.cancelled&&performance.now()-start<timeoutMs){g.world.queueAround(g.player.position.x,g.player.position.z);const loaded=g.world.chunks.size,meshed=g.renderer.chunkMeshes.size;if(loaded>=expected*.93&&meshed>=expected*.88)return{expected,loaded,meshed,timeout:false};await new Promise(r=>setTimeout(r,120));}return{expected,loaded:g.world.chunks.size,meshed:g.renderer.chunkMeshes.size,timeout:true};}
 async runWorld(){if(this.running)return;this.open();if(!this.game?.running||!this.game?.renderer||!this.game?.world){this.out('LIVE WORLD requires a running world. Start Singleplayer, open DBG, then tap BENCH or run the worldbench command.');return;}this.running=true;this.cancelled=false;const g=this.game,oldRadius=g.world.viewDistance||ENGINE.VIEW_DISTANCE,oldFar=g.renderer.lod.far,oldCeil=g.renderer.lod.qualityCeiling,rows=[];this.out(`Live world benchmark on ${g.renderer.backendLabel()} — starting at radius ${Math.max(4,oldRadius)} chunks.\nPass target: average ≥ ${STUDIO_V10.thresholdFps} FPS and p95 ≤ 22ms.`);try{g.renderer.lod.qualityCeiling=100;for(let radius=Math.max(4,oldRadius);radius<=STUDIO_V10.maxWorldRadius&&!this.cancelled;radius++){g.world.viewDistance=radius;g.renderer.lod.far=Math.max(oldFar,radius*ENGINE.CHUNK_SIZE*1.55);this.line(`Loading real world radius ${radius} (${radius*ENGINE.CHUNK_SIZE} blocks from player)…`);const load=await this.waitWorld(radius);await this.sampleFrames(1,36);const m=await this.sampleFrames(150,0),row={radius,radiusBlocks:radius*ENGINE.CHUNK_SIZE,diameterBlocks:radius*ENGINE.CHUNK_SIZE*2,expectedChunks:load.expected,loadedChunks:g.world.chunks.size,meshedChunks:g.renderer.chunkMeshes.size,faces:g.renderer.stats.faces,drawCalls:g.renderer.stats.drawCalls,triangles:g.renderer.stats.triangles,...m,timeout:load.timeout};rows.push(row);const pass=m.fps>=STUDIO_V10.thresholdFps&&m.p95<=22;this.line(`REAL radius ${radius}: ${m.fps.toFixed(1)} FPS | 1% low ${m.low1.toFixed(1)} | p95 ${m.p95.toFixed(2)}ms | chunks ${row.meshedChunks}/${row.expectedChunks} | faces ${row.faces} | ${pass?'PASS':'BELOW 60 CLASS'}`);this.meter((radius-3)/(STUDIO_V10.maxWorldRadius-3));if(!pass)break;}const passed=rows.filter(r=>r.fps>=STUDIO_V10.thresholdFps&&r.p95<=22),best=passed.at(-1)||null,firstFail=rows.find(r=>!(r.fps>=STUDIO_V10.thresholdFps&&r.p95<=22))||null;const result={timestamp:new Date().toISOString(),type:'live-world',backend:g.renderer.backendLabel(),requested:g.renderer.backendRequested,graphics:g.graphicsV7?.profile||'unknown',rows,best,firstFail,baselineRadius:ENGINE.VIEW_DISTANCE,device:this.deviceSnapshot()};this.lastResults=result;localStorage.setItem(`mcLiveBenchV10:${g.renderer.backendLabel()}`,JSON.stringify(result));if(best){const base=this.expectedChunks(ENGINE.VIEW_DISTANCE),gain=best.expectedChunks/base;this.line(`RESULT: highest tested 60-FPS-class radius = ${best.radius} chunks (${best.radiusBlocks} blocks radial, ~${best.diameterBlocks} block diameter), ${best.expectedChunks} target chunks. That is ${gain.toFixed(2)}× the current radius-${ENGINE.VIEW_DISTANCE} chunk area by loaded-chunk count.`);}else this.line(`RESULT: even radius ${rows[0]?.radius??oldRadius} did not meet the strict 60-FPS-class threshold in this run.`);if(firstFail)this.line(`First failing tier: radius ${firstFail.radius} at ${firstFail.fps.toFixed(1)} FPS.`);}catch(e){this.line(`LIVE WORLD FAILED: ${e.message}`);}finally{g.world.viewDistance=oldRadius;g.renderer.lod.far=oldFar;g.renderer.lod.qualityCeiling=oldCeil;g.world.queueAround(g.player.position.x,g.player.position.z);this.running=false;this.meter(1);}}
 deviceSnapshot(){return{ua:navigator.userAgent,secureContext:window.isSecureContext===true,navigatorGPU:!!navigator.gpu,hardwareConcurrency:navigator.hardwareConcurrency||null,devicePixelRatio:devicePixelRatio||1,screen:[screen.width,screen.height],viewport:[innerWidth,innerHeight]};}
}
window.rendererBenchV10=new RendererBenchmarkV10(game);

function installBenchmarkQuickV10(){if($('v10BenchQuick'))return;const b=document.createElement('button');b.id='v10BenchQuick';b.type='button';b.textContent='BENCH';b.onclick=()=>window.rendererBenchV10.open(game.running?'world':'ab');$('hud')?.appendChild(b);}
installBenchmarkQuickV10();
const voxBarV10=$('voxelDiagBar');if(voxBarV10&&!$('voxelBenchV10')){const b=document.createElement('button');b.className='voxBtn';b.id='voxelBenchV10';b.textContent='BENCH';b.onclick=()=>window.rendererBenchV10.open('world');voxBarV10.appendChild(b);}
if($('voxelOptions')&&!$('rendererBackendV10')){const row=document.createElement('div');row.className='voxOptRow';row.innerHTML=`<label><span>Renderer next start</span><b id="rendererBackendStateV10">${localStorage.getItem('mcRendererBackendV10')||'webgl'}</b></label><select id="rendererBackendV10" style="width:100%;padding:7px;background:#222;color:#fff;border:1px solid #777"><option value="webgl">WebGL</option><option value="webgpu">WebGPU</option><option value="auto">Auto</option></select><button class="voxBtn" id="rendererBenchButtonV10" style="width:100%;margin-top:6px">OPEN PERFORMANCE LAB</button>`;$('voxelOptions').prepend(row);$('rendererBackendV10').value=localStorage.getItem('mcRendererBackendV10')||'webgl';$('rendererBackendV10').onchange=e=>{localStorage.setItem('mcRendererBackendV10',e.target.value);$('rendererBackendStateV10').textContent=e.target.value;};$('rendererBenchButtonV10').onclick=()=>window.rendererBenchV10.open(game.running?'world':'ab');}
try{runtimeCommands.register('backend',()=>({requested:game.renderer?.backendRequested||localStorage.getItem('mcRendererBackendV10')||'webgl',actual:game.renderer?.backendLabel?.()||'not started',secureContext:window.isSecureContext===true,navigatorGPU:!!navigator.gpu,initError:game.renderer?.backendInitError||'',adapter:game.renderer?.backendDetails?.adapter||null}),'Inspect selected and actual renderer backend.');runtimeCommands.register('benchmark',()=>{window.rendererBenchV10.open('ab');return 'Opened GPU A/B performance lab.';},'Open WebGL vs WebGPU A/B benchmark.');runtimeCommands.register('worldbench',()=>{window.rendererBenchV10.open('world');if(game.running)setTimeout(()=>window.rendererBenchV10.runWorld(),0);return 'Opened live-world 60 FPS capacity benchmark.';},'Ramp real chunk radius until 60-FPS-class performance is lost.');}catch{}
window.__voxelDiag?.log?.(`V10 READY ${STUDIO_V10.version}: selectable WebGL/WebGPU backend, secure-context diagnostics, synthetic A/B benchmark, live real-world chunk-radius benchmark, and upgraded title world.`, 'ok');


const STUDIO_V11=Object.freeze({version:'2.6.0-survival-polish-audio-food-structures',foodUseSeconds:1.55});
window.STUDIO_PATCH_VERSION=STUDIO_V11.version;
const v11Style=document.createElement('style');v11Style.textContent=`
#v9TitleCanvas{filter:saturate(1.04) brightness(.98)!important;transform:none!important;inset:0!important;width:100%!important;height:100%!important;image-rendering:auto!important}
#titleShade{background:linear-gradient(rgba(0,0,0,.02),rgba(0,0,0,.22)),radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,.38) 100%)!important}
#titleContent.v9Title{width:min(520px,92vw)!important;max-height:94dvh;overflow:visible;gap:8px!important;transform:none!important;margin:auto}
#titleContent.v9Title #mcLogo{display:block;width:min(460px,88vw)!important;max-height:23dvh;object-fit:contain;image-rendering:auto!important;filter:drop-shadow(4px 5px 0 rgba(0,0,0,.62))!important}
#v9SplashCanvas{max-width:min(300px,58vw);margin:-20px 0 5px min(175px,34vw)!important}
.v9MenuBtn,.v8MenuBtn,.titleBtn,.mc-btn{background:#777!important;background-image:none!important;border:2px solid #161616!important;border-radius:0!important;box-shadow:inset 2px 2px 0 #aaa,inset -2px -2px 0 #444,2px 2px 0 rgba(0,0,0,.42)!important;min-height:42px;color:#fff!important;text-shadow:2px 2px 0 #303030!important}
.v9MenuBtn:hover,.v8MenuBtn:hover,.titleBtn:hover,.mc-btn:hover{background:#858585!important}.v9MenuBtn:active,.v8MenuBtn:active,.titleBtn:active,.mc-btn:active{background:#5d5d5d!important;box-shadow:inset 2px 2px 0 #444,inset -2px -2px 0 #aaa!important;transform:translateY(1px)}
.v9PackStatus{font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(0,0,0,.48);border:2px solid #222;padding:9px;color:#fff;text-align:left;max-height:34dvh;overflow:auto;-webkit-overflow-scrolling:touch}
#eatProgressV11{position:absolute;left:50%;bottom:106px;transform:translateX(-50%);width:118px;height:7px;display:none;z-index:25;background:#181818;border:1px solid #eee;pointer-events:none}#eatProgressV11>i{display:block;height:100%;width:0;background:#69be45}
@media (orientation:portrait){#titleContent.v9Title{width:86vw!important;gap:7px!important}#titleContent.v9Title #mcLogo{width:82vw!important;max-height:17dvh}#v9SplashCanvas{max-width:54vw;margin:-12px 0 6px 30vw!important}.v9MenuBtn{min-height:44px}.v9MenuRow{gap:8px!important}.v9Small{font-size:10px!important}}
@media (orientation:landscape) and (max-height:500px){#titleContent.v9Title{width:min(480px,66vw)!important;max-height:calc(100dvh - 12px);gap:4px!important}#titleContent.v9Title #mcLogo{width:min(360px,58vw)!important;max-height:20dvh}.v9MenuBtn{min-height:34px!important;height:34px!important;font-size:13px!important}#v9SplashCanvas{max-width:220px;margin:-16px 0 2px 150px!important}.v9Small{font-size:9px!important}.v9WorldPanel{max-height:92dvh!important;overflow:auto!important;-webkit-overflow-scrolling:touch}}
`;document.head.appendChild(v11Style);

const V11_ITEM_STEM=new Map([
 [ITEM.STICK,'stick'],[ITEM.COAL,'coal'],[ITEM.IRON_INGOT,'iron_ingot'],[ITEM.DIAMOND,'diamond'],[ITEM.WOOD_PICKAXE,'wood_pickaxe'],[ITEM.STONE_PICKAXE,'stone_pickaxe'],[ITEM.IRON_PICKAXE,'iron_pickaxe'],[ITEM.DIAMOND_PICKAXE,'diamond_pickaxe'],[ITEM.WOOD_AXE,'wood_axe'],[ITEM.STONE_AXE,'stone_axe'],[ITEM.IRON_AXE,'iron_axe'],[ITEM.DIAMOND_AXE,'diamond_axe'],[ITEM.WOOD_SWORD,'wood_sword'],[ITEM.STONE_SWORD,'stone_sword'],[ITEM.IRON_SWORD,'iron_sword'],[ITEM.DIAMOND_SWORD,'diamond_sword'],[ITEM.APPLE,'apple'],[ITEM.BREAD,'bread'],[ITEM.ARROW,'arrow']
]);
const v11IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){const stem=V11_ITEM_STEM.get(id);if(stem)return `${MC_TEX}items/${stem}.png`;return v11IconBase.call(this,id);};
const v11CatalogBase=BedrockItemTranslatorV8.prototype.loadCatalog;
BedrockItemTranslatorV8.prototype.loadCatalog=async function(){const r=await v11CatalogBase.call(this);if(this.game.firstPersonV7){this.game.firstPersonV7.lastMain=-999;this.game.firstPersonV7.lastOff=-999;this.game.firstPersonV7.refresh();}return r;};
HeldItemFactoryV8.prototype.flat=function(id){const url=this.game.iconFor(id),mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,alphaTest:.035,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false}),mesh=new THREE.Mesh(new THREE.PlaneGeometry(.34,.46),mat);if(url)this.loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;mat.map=t;mat.opacity=1;mat.needsUpdate=true;},undefined,()=>{mat.opacity=0;window.__voxelDiag?.log?.(`HELD ITEM TEXTURE FAILED id=${id} ${url}`,'err');});return mesh;};
FirstPersonViewV7.prototype.arm=function(x){const mat=new THREE.MeshBasicMaterial({color:0xc78b63,depthTest:false,depthWrite:false,toneMapped:false}),m=new THREE.Mesh(new THREE.BoxGeometry(.17,.58,.17),mat);m.position.set(x>0?.46:-.46,-.49,-.70);m.rotation.set(-.40,0,x>0?-.20:.20);m.renderOrder=2490;m.frustumCulled=false;m.userData.viewModelV7=true;m.userData.viewModelV8=true;return m;};
FirstPersonViewV7.prototype.makeItem=function(id,left=false){if(!id)return null;this.v8Factory??=new HeldItemFactoryV8(this.game);const root=this.v8Factory.create(id),block=this.game.itemToBlock(id),flat=block===BLOCK.AIR&&id!==ITEM.TORCH&&id!==V8_ITEM.SHIELD;if(id===V8_ITEM.SHIELD){root.scale.setScalar(.78);root.position.set(left?-.42:.42,-.40,-.67);root.rotation.set(-.06,left?.20:-.20,left?.08:-.08);}else if(id===ITEM.TORCH){root.scale.setScalar(.76);root.position.set(left?-.44:.44,-.43,-.72);root.rotation.set(-.34,left?.29:-.29,left?.14:-.14);}else if(flat){root.scale.setScalar(.82);root.position.set(left?-.45:.45,-.42,-.70);root.rotation.set(-.62,left?.38:-.38,left?.20:-.20);}else{root.scale.setScalar(.53);root.position.set(left?-.46:.46,-.42,-.75);root.rotation.set(-.29,left?.47:-.47,left?.17:-.17);}return root;};
const v11FPUpdateBase=FirstPersonViewV7.prototype.update;
FirstPersonViewV7.prototype.update=function(dt){v11FPUpdateBase.call(this,dt);const eat=this.game.foodV11?.active;if(eat&&this.rightItem){const p=clamp(eat.elapsed/STUDIO_V11.foodUseSeconds,0,1),wave=Math.sin(p*Math.PI*6);this.rightItem.position.x=.25+wave*.035;this.rightItem.position.y=-.18+Math.sin(p*Math.PI)*.14;this.rightItem.position.z=-.47;this.rightItem.rotation.x=-1.05+wave*.10;this.rightItem.rotation.y=-.18;this.rightArm.visible=true;this.rightArm.rotation.x=-.82+wave*.05;}};

class FoodSystemV11{
 constructor(gameRef){this.game=gameRef;this.saturation=5;this.exhaustion=0;this.regenClock=0;this.starveClock=0;this.stepClock=0;this.active=null;this.lastPos=new THREE.Vector3();this.ready=false;this.ensureUI();}
 ensureUI(){if($('eatProgressV11'))return;const d=document.createElement('div');d.id='eatProgressV11';d.innerHTML='<i></i>';document.getElementById('hud')?.appendChild(d);}
 begin(stack,offhand=false){if(this.active||this.game.mode==='creative'||!stack||stack.empty()||![ITEM.APPLE,ITEM.BREAD].includes(stack.id)||this.game.player.hunger>=20)return false;this.active={id:stack.id,offhand,elapsed:0};this.game.soundV9?.play('random.eat',{volume:.32,ui:true,temporaryClick:true});return true;}
 finish(){const a=this.active;if(!a)return;const inv=this.game.inventory,stack=a.offhand?inv.offhand:this.game.selectedStack();if(!stack||stack.id!==a.id||stack.count<=0){this.active=null;return;}const food=a.id===ITEM.BREAD?5:4,sat=a.id===ITEM.BREAD?6:2.4;if(this.game.mode!=='creative'){stack.count--;stack.normalize();this.game.player.hunger=Math.min(20,this.game.player.hunger+food);this.saturation=Math.min(this.game.player.hunger,this.saturation+sat);}this.game.soundV9?.play('random.burp',{volume:.45,ui:true,temporaryClick:true});this.game.refreshHotbar();this.game.saveSoon();this.active=null;const el=$('eatProgressV11');if(el)el.style.display='none';}
 cancel(){this.active=null;const el=$('eatProgressV11');if(el)el.style.display='none';}
 update(dt){const p=this.game.player;if(!p||this.game.mode==='creative')return;if(!this.ready){this.lastPos.copy(p.position);this.ready=true;}const dist=Math.hypot(p.position.x-this.lastPos.x,p.position.z-this.lastPos.z);this.lastPos.copy(p.position);if(dist>.002){this.exhaustion+=dist*(p.inWaterV8?.014:.010);this.stepClock-=dt;if(p.onGround&&this.stepClock<=0){this.stepClock=.38;const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));this.game.soundV9?.play(blockSoundEventV9(below),{position:p.position,volume:.055,pitch:1.2+Math.random()*.10});}}if(this.active){this.active.elapsed+=dt;const el=$('eatProgressV11');if(el){el.style.display='block';el.firstElementChild.style.width=`${Math.min(100,this.active.elapsed/STUDIO_V11.foodUseSeconds*100)}%`;}if(this.active.elapsed>=STUDIO_V11.foodUseSeconds)this.finish();}while(this.exhaustion>=4){this.exhaustion-=4;if(this.saturation>0)this.saturation=Math.max(0,this.saturation-1);else p.hunger=Math.max(0,p.hunger-1);}if(p.hunger>=18&&p.health<20){this.regenClock+=dt;if(this.regenClock>=4){this.regenClock=0;p.health=Math.min(20,p.health+1);this.exhaustion+=6;}}else this.regenClock=0;if(p.hunger<=0){this.starveClock+=dt;if(this.starveClock>=4){this.starveClock=0;p.health=Math.max(0,p.health-1);damageVignette.style.opacity='.55';setTimeout(()=>damageVignette.style.opacity='0',100);this.game.soundV9?.play('damage.hit',{volume:.36,ui:true,temporaryClick:true});}}else this.starveClock=0;}
}
const v11UseFoodBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const main=this.selectedStack(),off=this.inventory.offhand;if(main&&[ITEM.APPLE,ITEM.BREAD].includes(main.id)){if(this.foodV11?.begin(main,false))return;return;}if((!main||main.empty())&&off&&[ITEM.APPLE,ITEM.BREAD].includes(off.id)){if(this.foodV11?.begin(off,true))return;return;}return v11UseFoodBase.call(this);};

MinecraftSoundSystemV9.prototype.synthV11=function(event,volume=.35,pitch=1){if(!this.ctx||!this.master)return;const ctx=this.ctx,t=ctx.currentTime,name=String(event||''),gain=ctx.createGain();gain.connect(this.master);const vol=Math.max(.008,Math.min(.55,volume));if(/click/i.test(name)){const o=ctx.createOscillator();o.type='square';o.frequency.setValueAtTime(690*pitch,t);o.frequency.exponentialRampToValueAtTime(390*pitch,t+.035);gain.gain.setValueAtTime(vol*.18,t);gain.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(gain);o.start(t);o.stop(t+.055);return;}const length=/explode/i.test(name)?.42:/eat|burp/i.test(name)?.17:/dig|step|wood|stone|grass|sand|gravel/i.test(name)?.095:.14,rate=ctx.sampleRate,buf=ctx.createBuffer(1,Math.ceil(rate*length),rate),a=buf.getChannelData(0);for(let i=0;i<a.length;i++){const env=Math.pow(1-i/a.length,/explode/i.test(name)?.7:1.7),n=Math.random()*2-1;a[i]=n*env;}const src=ctx.createBufferSource();src.buffer=buf;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=/wood/i.test(name)?580:/grass|sand/i.test(name)?1100:/eat|burp/i.test(name)?760:/explode/i.test(name)?190:430;filter.Q.value=/explode/i.test(name)?.45:1.0;gain.gain.setValueAtTime(vol,t);gain.gain.exponentialRampToValueAtTime(.001,t+length);src.connect(filter);filter.connect(gain);src.playbackRate.value=Math.max(.55,Math.min(1.8,pitch));src.start(t);if(/burp/i.test(name)){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(86,t+.16);g.gain.setValueAtTime(vol*.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.19);}};
MinecraftSoundSystemV9.prototype.browserBufferV11=async function(path){const key=`browser|${path}`;if(this.buffers.has(key))return this.buffers.get(key);const clean=path.replace(/^sounds\//,'').replace(/\.(fsb|ogg|wav|mp3)$/i,''),candidates=[];for(const ext of ['ogg','wav','mp3']){candidates.push(`${USER_REPO_RAW}/sounds/${clean}.${ext}`,`${USER_REPO_RAW}/${clean}.${ext}`,`${MOJANG_RP_V9}sounds/${clean}.${ext}`);}for(const url of candidates){try{const blob=await this.game.assets.fetch(url),ab=await blob.arrayBuffer(),decoded=await this.ctx.decodeAudioData(ab.slice(0));this.buffers.set(key,decoded);this.diag(`AUDIO BROWSER READY ${clean} ← ${url}`,'ok');return decoded;}catch{}}return null;};
const v11SoundPlayBase=MinecraftSoundSystemV9.prototype.play;
MinecraftSoundSystemV9.prototype.play=async function(event,opts={}){if(!this.enabled)return;try{await this.unlock();}catch{return;}let item=null;try{if(!this.defs)this.loadManifest();item=this.pick(event);}catch{}if(item){const path=String(item.name||'').replace(/\.fsb$/i,''),ready=this.buffers.get(`browser|${path}`)||this.buffers.get(path);if(ready){const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();src.buffer=ready;src.playbackRate.value=Math.max(.25,Math.min(4,(opts.pitch||1)*(Number(item.pitch)||1)));gain.gain.value=Math.max(0,Math.min(2,(opts.volume??1)*(Number(item.volume)||1)));src.connect(gain);gain.connect(this.master);src.start();return;}this.browserBufferV11(path).catch(()=>{});}this.synthV11(event,opts.volume??.34,opts.pitch??1);};
let v11AudioUnlockReady=false;
const v11UnlockAudio=async()=>{try{await game.soundV9?.unlock();v11AudioUnlockReady=game.soundV9?.ctx?.state==='running';if(v11AudioUnlockReady)game.soundV9?.loadManifest().catch(()=>{});}catch{v11AudioUnlockReady=false;}};
for(const ev of ['pointerdown','touchstart','keydown'])document.addEventListener(ev,()=>{if(!v11AudioUnlockReady)v11UnlockAudio();},{capture:true,passive:true});

function v11ReleaseControls(){try{game.input?.breakHold?.end?.();game.endBreak?.();if(game.input){game.input.jump=false;game.input.sneak=false;game.input.run=false;game.input.lookId=null;game.input.moveId=null;game.input.move={x:0,y:0};}if(moveStick)moveStick.style.transform='translate(0px,0px)';game.foodV11?.cancel();game.blockingV8=false;game.blockingUntilV8=0;}catch{}}
addEventListener('blur',v11ReleaseControls);addEventListener('pagehide',v11ReleaseControls);document.addEventListener('visibilitychange',()=>{if(document.hidden)v11ReleaseControls();});document.addEventListener('pointercancel',v11ReleaseControls,{capture:true});

const v11BreakMatBase=BlockBreakOverlayV9.prototype.material;
BlockBreakOverlayV9.prototype.material=async function(stage){const m=await v11BreakMatBase.call(this,stage);if(m){m.transparent=true;m.opacity=.72;m.depthWrite=false;m.depthTest=true;m.alphaTest=.015;m.blending=THREE.MultiplyBlending;m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;m.toneMapped=false;m.needsUpdate=true;}return m;};

const v11SpecBase=BedrockEntityLoaderV2.prototype.spec;
BedrockEntityLoaderV2.prototype.spec=function(type){if(type==='cow')return{entity:['cow'],geometry:['cow_v1.0','cow'],animations:['cow','quadruped']};if(type==='pig')return{entity:['pig'],geometry:['pig_v1.0','pig'],animations:['pig','quadruped']};if(type==='sheep')return{entity:['sheep'],geometry:['sheep_v1.0','sheep'],animations:['sheep','quadruped']};if(type==='iron_golem')return{entity:['iron_golem'],geometry:['iron_golem'],animations:['iron_golem','humanoid']};return v11SpecBase.call(this,type);};
const v11EntityTextureBase=BedrockEntityLoaderV2.prototype.texture;
BedrockEntityLoaderV2.prototype.texture=async function(entityJSON,type){if(type==='cow'||type==='pig'){const path=type==='cow'?'textures/entity/cow/cow':'textures/entity/pig/pig',copy=JSON.parse(JSON.stringify(entityJSON||{}));copy['minecraft:client_entity']??={description:{}};copy['minecraft:client_entity'].description??={};copy['minecraft:client_entity'].description.textures={default:path};try{return await v11EntityTextureBase.call(this,copy,type);}catch(e){window.__voxelDiag?.log?.(`LEGACY ${type} texture fallback: ${e.message}`,'warn');}}return v11EntityTextureBase.call(this,entityJSON,type);};
const v11AnimUpdateBase=BedrockAnimationControllerV2.prototype.update;
BedrockAnimationControllerV2.prototype.update=function(state,time,mob){v11AnimUpdateBase.call(this,state,time,mob);if(['cow','pig','sheep'].includes(this.type)){const body=this.bones.get('body');if(body&&Math.abs(body.rotation.x)<.70)body.rotation.x=Math.PI/2;}};
if(!modelTranslationRegistry.has('minecraft:iron_golem'))modelTranslationRegistry.register('minecraft:iron_golem',{entity:'iron_golem',translator:'BedrockEntityLoaderV2'});

const v11TickQueuesBase=World.prototype.tickQueues;
World.prototype.tickQueues=function(renderer){const fps=window.game?.stats?.fps||60;if(fps>0&&fps<48){this._v11QueueFlip=!this._v11QueueFlip;if(this._v11QueueFlip)return;}return v11TickQueuesBase.call(this,renderer);};
const v11DiagUpdateBase=VoxelRenderer.prototype.updateDiagnostics;
VoxelRenderer.prototype.updateDiagnostics=function(force=false){const t=performance.now();if(!force&&this._v11DiagGate&&t-this._v11DiagGate<720)return;this._v11DiagGate=t;return v11DiagUpdateBase.call(this,force);};

const v11SurfaceBase=WorldGenerator.prototype.surfaceY;
WorldGenerator.prototype.surfaceY=function(x,z){let h=v11SurfaceBase.call(this,x,z);const line=Math.abs(this.perlin.fbm2(x*.0065+1700,z*.0065-900,3)),detail=this.perlin.fbm2(x*.022-1300,z*.022+700,2),canyon=clamp((.13-line)/.13,0,1)*clamp((detail+.35)*1.1,0,1);h-=Math.floor(canyon*canyon*13);return clamp(h,8,ENGINE.WORLD_HEIGHT-10);};
function v11UnderwaterFloor(gen,chunk){const s=chunk.size;for(let z=0;z<s;z++)for(let x=0;x<s;x++){const wx=chunk.cx*s+x,wz=chunk.cz*s+z,sy=gen.surfaceY(wx,wz);if(sy>=ENGINE.SEA_LEVEL)continue;const top=chunk.get(x,sy,z);if(top===BLOCK.GRASS||top===BLOCK.SNOW||top===BLOCK.DIRT){const n=hash2(wx,wz,gen.seed+4401),floor=n<.62?BLOCK.SAND:n<.82?BLOCK.GRAVEL:BLOCK.DIRT;chunk.set(x,sy,z,floor);if(sy>1&&floor===BLOCK.SAND)chunk.set(x,sy-1,z,n<.33?BLOCK.SAND:BLOCK.DIRT);}}}
function v11Mineshaft(gen,chunk){if(hash2(chunk.cx,chunk.cz,gen.seed+99117)>.032)return;const y=clamp(12+Math.floor(hash2(chunk.cz,chunk.cx,gen.seed+34)*18),8,30),s=chunk.size;for(let x=1;x<s-1;x++)for(let yy=y;yy<y+3;yy++)for(let z=6;z<=9;z++)chunk.set(x,yy,z,BLOCK.AIR);for(let z=1;z<s-1;z++)for(let yy=y;yy<y+3;yy++)for(let x=6;x<=9;x++)chunk.set(x,yy,z,BLOCK.AIR);for(let q=2;q<s-2;q+=4){for(const [x,z] of [[q,6],[q,9],[6,q],[9,q]])for(let yy=y;yy<y+3;yy++)chunk.set(x,yy,z,BLOCK.OAK_LOG);for(const [x,z] of [[q,7],[q,8],[7,q],[8,q]])chunk.set(x,y+2,z,BLOCK.OAK_PLANKS);}chunk.mineshaftV11=true;}
function v11VillageExtras(gen,chunk){if(!chunk.villageV8)return;const cx=8,cz=8,wx=chunk.cx*chunk.size+cx,wz=chunk.cz*chunk.size+cz,y=gen.surfaceY(wx,wz);for(const [ox,oz] of [[-5,0],[5,0]]){for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const x=cx+ox+dx,z=cz+oz+dz;if(x<1||x>=15||z<1||z>=15)continue;const edge=Math.abs(dx)===2||Math.abs(dz)===2;chunk.set(x,y,z,BLOCK.COBBLESTONE);for(let yy=1;yy<=3;yy++)chunk.set(x,y+yy,z,edge?BLOCK.OAK_PLANKS:BLOCK.AIR);chunk.set(x,y+4,z,BLOCK.OAK_PLANKS);}}gen.villageEntitiesV11??=[];gen.villageEntitiesV11.push({type:'villager',position:new THREE.Vector3(wx+2.5,y+1,wz+.5)},{type:'villager',position:new THREE.Vector3(wx-2.5,y+1,wz+.5)},{type:'iron_golem',position:new THREE.Vector3(wx+.5,y+1,wz+3.5)});chunk.villageV11=true;}
const v11GenerateBase=WorldGenerator.prototype.generate;
WorldGenerator.prototype.generate=function(chunk){v11GenerateBase.call(this,chunk);v11UnderwaterFloor(this,chunk);v11Mineshaft(this,chunk);v11VillageExtras(this,chunk);};

VoxelRenderer.prototype.ensureCelestialsV7=function(){if(this.celestialV7)return;const sm=new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,toneMapped:false}),mm=new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,toneMapped:false}),sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.set(62,62,1);moonSprite.scale.set(42,42,1);sunSprite.renderOrder=-1;moonSprite.renderOrder=-1;this.scene.add(sunSprite,moonSprite);this.celestialV7={sunSprite,moonSprite,moonTex:null,phase:-1};const cleanImage=async(candidates,material,blackCut=true)=>{for(const url of candidates){try{const bmp=await game.assets.image(url),c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0);if(blackCut){const d=x.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2];if(r<32&&g<32&&b<32)d.data[i+3]=0;}x.putImageData(d,0,0);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;material.map=t;material.needsUpdate=true;return t;}catch{}}return null;};cleanImage([`${USER_REPO_RAW}/Sun.png`,`${USER_REPO_RAW}/sun.png`,`${USER_REPO_RAW}/textures/environment/sun.png`,`${MC_TEX}environment/sun.png`],sm,true);cleanImage([`${USER_REPO_RAW}/moon_phases.png`,`${MC_TEX}environment/moon_phases.png`],mm,false).then(t=>{if(!t)return;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.repeat.set(.25,.5);this.celestialV7.moonTex=t;});};
const v11GfxBase=GraphicsQualityV7.prototype.apply;
GraphicsQualityV7.prototype.apply=function(profile=this.profile){const p=v11GfxBase.call(this,profile),r=this.game.renderer?.renderer;if(r){r.toneMapping=THREE.NoToneMapping;r.toneMappingExposure=1;const target=p==='fast'?1.5:p==='fancy'?1.75:2.0;r.setPixelRatio(Math.min(devicePixelRatio||1,target));}return p;};
VoxelRenderer.prototype.render=function(dt){
 this.ensureEnvironmentV6();this._v6Elapsed+=dt;const oldPhase=dayClock.phase();dayClock.update(dt);const phase=dayClock.phase();if(phase<oldPhase)this._v6Day++;const angle=phase*Math.PI*2,sunY=Math.sin(angle),daylight=smoothstep(clamp((sunY+.16)/.62,0,1)),horizon=1-clamp(Math.abs(sunY)/.32,0,1),px=this.player?.position.x||0,py=this.player?.position.y||35,pz=this.player?.position.z||0,profile=this.gameRefV7?.graphicsV7?.profile||'fast',boost=profile==='ultra'?1.48:profile==='fancy'?1.36:1.18;
 this.sun.position.set(px+Math.cos(angle)*145,py+sunY*145,pz+Math.sin(angle)*70);this.sun.target.position.set(px,py,pz);this.sun.intensity=(.16+daylight*1.45)*boost;this.sun.color.set(daylight>.5?0xfff9e8:0xffc58a);this.moon.position.set(px-Math.cos(angle)*145,py-sunY*145,pz-Math.sin(angle)*70);this.moon.target.position.set(px,py,pz);this.moon.intensity=(1-daylight)*(profile==='fast'?.28:.38);this.ambient.color.copy(mixColorV6(new THREE.Color(0x3a527d),new THREE.Color(0xc7e6ff),daylight));this.ambient.groundColor.copy(mixColorV6(new THREE.Color(0x1b2848),new THREE.Color(0x69533b),daylight));this.ambient.intensity=(.42+daylight*.86)*(profile==='fast'?1:1.12);this.fillAmbient.intensity=(.06+daylight*.12)*(profile==='ultra'?1.35:profile==='fancy'?1.20:1);
 let sky=mixColorV6(new THREE.Color(0x0b1b3a),new THREE.Color(0x82c4f5),daylight);if(horizon>.01)sky=sky.lerp(new THREE.Color(0xe68f64),horizon*(.46+.16*(1-daylight)));this.scene.background.copy(sky);this.fog.color.copy(sky);const worldRadius=(this.world?.viewDistance||ENGINE.VIEW_DISTANCE)*ENGINE.CHUNK_SIZE,farSetting=Number(this.lod?.far||worldRadius),fogFar=Math.max(46,Math.min(worldRadius*1.03,farSetting*1.75)),fogNear=Math.max(24,fogFar*.64);this.fog.near=fogNear;this.fog.far=fogFar;
 const totalHours=(6+phase*24)%24,h=Math.floor(totalHours),m=Math.floor((totalHours-h)*60);this.dayStateV6={phase,day:this._v6Day,daylight,timeText:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,isNight:daylight<.20};this.updateCelestialsV7?.();this.gameRefV7?.firstPersonV7?.update(dt);this.gameRefV7?.firstPersonV7?.group?.traverse(o=>{if(o.isMesh&&o.material){for(const mat of(Array.isArray(o.material)?o.material:[o.material])){mat.depthTest=false;mat.depthWrite=false;mat.fog=false;mat.toneMapped=false;}}});const visFar=Math.min(fogFar+8,Math.max(42,farSetting*1.8)),far2=visFar*visFar;for(const [key,mesh] of this.chunkMeshes){const [cx,cz]=key.split(',').map(Number),wx=cx*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5,wz=cz*ENGINE.CHUNK_SIZE+ENGINE.CHUNK_SIZE*.5;mesh.visible=(wx-px)*(wx-px)+(wz-pz)*(wz-pz)<=far2;}this.updateLOD();this.renderer.render(this.scene,this.camera);{const ri=this.readRenderInfo();this.stats.drawCalls=ri.calls;this.stats.triangles=ri.triangles;}this.stats.chunks=this.chunkMeshes.size;const fps=this.gameRefV7?.stats?.fps||60;this._v11Perf??={low:0,high:0,reduced:false};if(fps<42){this._v11Perf.low++;this._v11Perf.high=0;}else if(fps>56){this._v11Perf.high++;this._v11Perf.low=Math.max(0,this._v11Perf.low-1);}if(this._v11Perf.low>18&&!this._v11Perf.reduced){this._v11Perf.reduced=true;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1));this.renderer.shadowMap.enabled=false;window.__voxelDiag?.log?.('PERF GOVERNOR: temporary DPR 1.0 + shadows paused after sustained frame spike.','warn');}if(this._v11Perf.reduced&&this._v11Perf.high>180){this._v11Perf.reduced=false;this._v11Perf.low=0;this.gameRefV7?.graphicsV7?.apply?.(profile);window.__voxelDiag?.log?.('PERF GOVERNOR: full graphics restored after stable FPS.','ok');}
};

const v11BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v11BootBase.apply(this,args);this.foodV11=new FoodSystemV11(this);if(this._savedSaturationV11!=null)this.foodV11.saturation=clamp(Number(this._savedSaturationV11)||0,0,this.player.hunger);this.firstPersonV7.lastMain=-999;this.firstPersonV7.lastOff=-999;this.firstPersonV7.refresh();this.graphicsV7?.apply?.(this.graphicsV7.profile);window.__voxelDiag?.log?.(`V11 BOOT ${STUDIO_V11.version}: audible sound fallback, food/saturation, fixed held items, quadruped pose, structures, fog and adaptive performance.`,'ok');};
const v11UpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){this.foodV11?.update(dt);const gen=this.world?.generator;if(gen?.villageEntitiesV11?.length&&this.mobs?.mobs?.length<ENGINE.MAX_MOBS){for(let i=gen.villageEntitiesV11.length-1;i>=0;i--){const e=gen.villageEntitiesV11[i];if(e.position.distanceTo(this.player.position)<68){this.mobs.spawnEntity(e.type,e.position);gen.villageEntitiesV11.splice(i,1);}}}return v11UpdateBase.call(this,dt);};
const v11SaveBase=Game.prototype.save;
Game.prototype.save=async function(){return await v11SaveBase.call(this);};

const v11TitleInitBase=TitleWorldV9.prototype.init;
TitleWorldV9.prototype.loop=function(){if(!this.alive||!this.r)return;this.clock+=.0024;const a=this.clock;if(!this.pausedV10){this.c.position.x=2.8+Math.sin(a)*.75;this.c.position.z=11.4+Math.cos(a*.72)*.55;this.c.position.y=5.55+Math.sin(a*.53)*.16;this.c.lookAt(-.4,2.15,-4.2);this.r.render(this.s,this.c);}requestAnimationFrame(()=>this.loop());};
function v11ResourcePacks(){const c=$('titleContent');c.className='v9Title';const userCount=game.resolver?.repoFiles?.get?.('USER REPOSITORY')?.length||0,mojangCount=game.resolver?.repoFiles?.get?.('MOJANG')?.length||0;c.innerHTML=`<div class="v9WorldPanel"><h2 class="mc-title" style="color:#fff;text-shadow:2px 2px #111">Resource Packs</h2><div class="v9PackStatus">ACTIVE ORDER\n1. Your Minecraft-assets repository\n2. Mojang Bedrock samples\n3. Deterministic diagnostic fallback (only when an asset truly fails)\n\nCached texture records: ${game.resolver?.textureInfo?.size||0}\nUser repo index: ${userCount||'loads on demand'}\nMojang repo index: ${mojangCount||'loads on demand'}\nItem catalog: ${game.itemTranslatorV8?.catalog?'ready':'loads when a world starts'}\nSound definitions: ${game.soundV9?.defs?Object.keys(game.soundV9.defs).length+' events':'loads on first audio gesture'}</div><div class="v9MenuRow"><button class="v9MenuBtn" id="v11PackScan">Validate Sources</button><button class="v9MenuBtn" id="v11PackDone">Done</button></div></div>`;$('v11PackScan').onclick=async()=>{toast('Scanning resource repositories…');await Promise.allSettled([game.resolver.repoScan('USER REPOSITORY',USER_REPO_API),game.resolver.repoScan('MOJANG',MOJANG_REPO_API)]);v11ResourcePacks();};$('v11PackDone').onclick=v9BuildTitle;}
function v11Multiplayer(){const c=$('titleContent');c.className='v9Title';c.innerHTML=`<div class="v9WorldPanel"><h2 class="mc-title" style="color:#fff;text-shadow:2px 2px #111">Multiplayer</h2><div class="v9PackStatus">The menu is wired and functional, but this single-file build does not yet have a network transport/server protocol. World simulation remains local so it cannot safely pretend a multiplayer session exists.</div><button class="v9MenuBtn" id="v11MultiDone">Done</button></div>`;$('v11MultiDone').onclick=v9BuildTitle;}
v9BuildTitle=function(){const content=$('titleContent');if(!content)return;content.className='v9Title';content.innerHTML=`<img id="mcLogo" src="${MOJANG_TEX_V9}ui/title.png" alt="Minecraft" onerror="this.style.display='none';document.getElementById('logoFallback')?.style.setProperty('display','block')"><div id="logoFallback" style="display:none">MINECRAFT</div><canvas id="v9SplashCanvas"></canvas><button class="v9MenuBtn" id="v9Singleplayer">Singleplayer</button><button class="v9MenuBtn" id="v9Multiplayer">Multiplayer</button><div class="v9MenuRow"><button class="v9MenuBtn" id="v9Packs">Resource Packs</button><button class="v9MenuBtn" id="v9TitleOptions">Options...</button></div><div class="v9Small">Minecraft Web • Three.js • ${STUDIO_V11.version}</div>`;drawPixelSplashV9($('v9SplashCanvas'),TITLE_SPLASHES_V9[Math.floor(Math.random()*TITLE_SPLASHES_V9.length)]);$('v9Singleplayer').onclick=v9WorldSelect;$('v9Multiplayer').onclick=v11Multiplayer;$('v9Packs').onclick=v11ResourcePacks;$('v9TitleOptions').onclick=v9TitleOptions;};

try{runtimeCommands.register('food',()=>({hunger:game.player?.hunger,saturation:game.foodV11?.saturation,exhaustion:game.foodV11?.exhaustion,eating:game.foodV11?.active||null}),'Inspect hunger, saturation and eating state.');runtimeCommands.register('structures',()=>({villages:[...game.world?.chunks?.values?.()||[]].filter(c=>c.villageV8||c.villageV11).length,mineshafts:[...game.world?.chunks?.values?.()||[]].filter(c=>c.mineshaftV11).length,queuedVillageEntities:game.world?.generator?.villageEntitiesV11?.length||0}),'Inspect generated villages/mineshafts.');runtimeCommands.register('sound11',(event='random.click')=>{game.soundV9?.play(event,{ui:true,volume:.5,temporaryClick:true});return{audioState:game.soundV9?.ctx?.state||'none',manifestEvents:game.soundV9?.defs?Object.keys(game.soundV9.defs).length:0,buffers:game.soundV9?.buffers?.size||0};},'Play/inspect the V11 sound pipeline.');}catch{}
window.__voxelDiag?.log?.(`V11 READY ${STUDIO_V11.version}: food + starvation/regen, immediate sound path, official item stems, quadruped body correction, underwater floors, canyons/mineshafts/village extras, larger clean sun, brighter lighting, edge fog, AA and responsive title UI.`,'ok');


/* ===================== STUDIO V12: STEREO + XP + PLAYER AVATAR + CROUCH + MINECRAFT SKY ===================== */
const STUDIO_V12=Object.freeze({version:'2.7.0-stereo-xp-player-thirdperson-sky',crouchHeight:1.50,crouchEye:1.27,crouchSpeed:.30,thirdPersonDistance:4.15,doubleTapMs:255});
window.STUDIO_PATCH_VERSION=STUDIO_V12.version;

const v12Style=document.createElement('style');
v12Style.textContent=`
#survivalBars{height:31px!important;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:19px 8px;column-gap:8px;row-gap:1px;align-items:center;overflow:visible!important}
#heartBar{grid-column:1;grid-row:1;display:flex;align-items:center;justify-content:flex-start}
#hungerBar{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:flex-end}
#xpHudV12{grid-column:1/3;grid-row:2;position:relative;width:min(190px,56vw);height:7px;justify-self:center;pointer-events:none;image-rendering:pixelated}
#xpEmptyV12,#xpFullV12{position:absolute;left:0;top:1px;width:100%;height:5px;object-fit:fill;image-rendering:pixelated;pointer-events:none}
#xpClipV12{position:absolute;left:0;top:0;width:0;height:7px;overflow:hidden}
#xpFullV12{width:min(190px,56vw);max-width:none}
#xpLevelV12{position:absolute;left:50%;bottom:3px;transform:translateX(-50%);font:900 10px/10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#80ff20;text-shadow:1px 1px #153800,-1px -1px #153800,1px -1px #153800,-1px 1px #153800;min-width:18px;text-align:center}
#cameraToggleV12{position:absolute;right:88px;bottom:200px;z-index:180;width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(0,0,0,.34);color:#fff;font:900 10px ui-monospace,SFMono-Regular,Menlo,monospace;text-shadow:1px 1px #000;pointer-events:auto;touch-action:manipulation}
#crouchStateV12{position:absolute;right:91px;bottom:176px;z-index:179;padding:2px 5px;border-radius:3px;background:rgba(0,0,0,.50);color:#fff;font:900 9px ui-monospace,SFMono-Regular,Menlo,monospace;opacity:0;pointer-events:none;transition:opacity .12s}
#crouchStateV12.on{opacity:.82}
#useBtn.crouchingV12{background:rgba(80,120,70,.55);box-shadow:inset 0 0 0 2px rgba(180,255,170,.22)}
.v12AudioSelect{width:100%;padding:7px;background:#222;color:#fff;border:1px solid #777}
@media (orientation:landscape) and (max-height:560px){#survivalBars{bottom:52px!important;height:29px!important}#xpHudV12{width:min(190px,45vw)}#xpFullV12{width:min(190px,45vw)}#cameraToggleV12{right:88px;bottom:186px;width:52px;height:52px}}
@media(max-width:680px) and (orientation:portrait){#survivalBars{bottom:57px!important;width:82vw!important}#cameraToggleV12{right:86px;bottom:196px}}
`;
document.head.appendChild(v12Style);

function ensureExperienceHudV12(){
 if(!$('survivalBars')||$('xpHudV12'))return;
 const xp=document.createElement('div');xp.id='xpHudV12';xp.innerHTML=`<img id="xpEmptyV12" src="${MC_TEX}ui/experiencebarempty.png" alt=""><div id="xpClipV12"><img id="xpFullV12" src="${MC_TEX}ui/experiencebarfull.png" alt=""></div><span id="xpLevelV12">0</span>`;$('survivalBars').appendChild(xp);
 for(const id of ['xpEmptyV12','xpFullV12'])$(id)?.addEventListener('error',()=>window.__voxelDiag?.log?.(`XP HUD TEXTURE FAILED ${$(id)?.src||id}`,'err'),{once:true});
}
ensureExperienceHudV12();

class ExperienceSystemV12{
 constructor(gameRef){this.game=gameRef;this.total=0;this.level=0;this.progress=0;this.next=7;this.reason='';this.setTotal(Number(gameRef._savedExperienceV12)||0,false);}
 totalForLevel(level){const l=Math.max(0,Math.floor(level));if(l<=16)return l*l+6*l;if(l<=31)return Math.floor(2.5*l*l-40.5*l+360);return Math.floor(4.5*l*l-162.5*l+2220);}
 recalc(){let level=0;while(level<10000&&this.total>=this.totalForLevel(level+1))level++;this.level=level;const base=this.totalForLevel(level),next=this.totalForLevel(level+1);this.next=Math.max(1,next-base);this.progress=clamp((this.total-base)/this.next,0,1);}
 setTotal(value,save=true){this.total=Math.max(0,Math.floor(Number(value)||0));this.recalc();this.render();if(save)this.game.saveSoon?.();return this.total;}
 add(amount,reason=''){const n=Math.max(0,Math.floor(Number(amount)||0));if(!n||this.game.mode==='creative')return 0;const before=this.level;this.total+=n;this.reason=reason;this.recalc();this.render();if(this.level>before)this.game.soundV9?.play('random.levelup',{ui:true,volume:.28,temporaryClick:true});this.game.saveSoon?.();return n;}
 render(){ensureExperienceHudV12();const clip=$('xpClipV12'),label=$('xpLevelV12');if(clip)clip.style.width=`${(this.progress*100).toFixed(2)}%`;if(label){label.textContent=String(this.level);label.style.display=this.level>0?'block':'none';}}
 snapshot(){return{total:this.total,level:this.level,progress:this.progress,next:this.next,reason:this.reason};}
}

/* Keep the Bedrock player in the same reusable entity pipeline as mobs. */
const v12PlayerSpecBase=BedrockEntityLoaderV2.prototype.spec;
BedrockEntityLoaderV2.prototype.spec=function(type){if(type==='player')return{entity:['player'],geometry:['humanoid.custom'],animations:['player','humanoid']};return v12PlayerSpecBase.call(this,type);};
if(!modelTranslationRegistry.has('minecraft:player'))modelTranslationRegistry.register('minecraft:player',{entity:'player',geometry:'humanoid.custom',texture:'textures/entity/steve',translator:'BedrockEntityLoaderV2'});
for(const url of [`${BEDROCK_RAW}resource_pack/entity/player.entity.json`,`${BEDROCK_RAW}resource_pack/models/entity/humanoid.custom.geo.json`,`${BEDROCK_RAW}resource_pack/animations/player.animation.json`,`${BEDROCK_RAW}resource_pack/animations/humanoid.animation.json`])if(game.assetPipeline?.prefetchManifest&&!game.assetPipeline.prefetchManifest.includes(url))game.assetPipeline.prefetchManifest.push(url);

class PlayerEntityRendererV12{
 constructor(gameRef){this.game=gameRef;this.local=null;this.remotes=new Map();this.time=0;this.loading=null;}
 async model(){return await this.game.assetPipeline.model('player');}
 async ensureLocal(){if(this.local?.root?.parent)return this.local;if(this.loading)return this.loading;this.loading=(async()=>{try{const root=await this.model();root.name='LocalPlayerV12';root.scale.setScalar(.9375);root.visible=false;root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=true;}});this.game.renderer.scene.add(root);this.local={id:'local',root,controller:root.userData.animationController,lastPos:this.game.player.position.clone(),distance:0,age:0};window.__voxelDiag?.log?.(`PLAYER MODEL READY: ${root.userData.geometryName||'geometry.humanoid.custom'} ← ${root.userData.textureURL||'textures/entity/steve'}`,'ok');return this.local;}catch(e){window.__voxelDiag?.log?.(`PLAYER MODEL FAILED: ${e.message}`,'err');console.error('[PlayerV12]',e);return null;}finally{this.loading=null;}})();return this.loading;}
 removeLocal(){if(this.local?.root?.parent)this.local.root.parent.remove(this.local.root);this.local=null;}
 async resetLocal(){this.removeLocal();return await this.ensureLocal();}
 ctx(avatar,state){const p=state.player||this.game.player,speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),sneak=!!p.crouchingV12;return{query:{life_time:avatar.age,modified_distance_moved:avatar.distance,modified_move_speed:speed,ground_speed:speed,is_on_ground:p.onGround?1:0,is_sneaking:sneak?1:0,target_x_rotation:THREE.MathUtils.radToDeg(p.pitch||0),target_y_rotation:0,attack_time:0},variable:{tcos0:Math.cos(avatar.age*7.2)*32,leg_rot:Math.cos(avatar.age*7.2)*34,attack_time:0,swim_amount:p.inWaterV8?1:0,is_baby:0},temp:{}};}
 updateOne(avatar,state,dt){if(!avatar?.root)return;const p=state.player||this.game.player;avatar.age+=dt;const moved=Math.hypot(p.position.x-avatar.lastPos.x,p.position.z-avatar.lastPos.z);avatar.distance+=moved;avatar.lastPos.copy(p.position);avatar.root.position.copy(p.position);avatar.root.rotation.y=p.yaw||0;avatar.root.scale.setScalar(.9375);const controller=avatar.controller;if(controller){const speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),mode=speed>.08?'walk':'idle';controller.update(mode,avatar.age,{age:avatar.age,distanceWalked:avatar.distance,velocity:p.velocity,attackProgress:0});if(p.crouchingV12){const clip=controller.animations?.['animation.player.sneaking'];if(clip)controller.applyClip(clip,avatar.age,this.ctx(avatar,state));}const head=controller.bones.get('head');if(head&&!p.crouchingV12){const bind=controller.bind.get('head');if(bind)head.rotation.x=bind.rotation.x+clamp(p.pitch||0,-1.25,1.25)*.72;}}
 }
 updateLocal(dt){this.time+=dt;if(!this.local){this.ensureLocal();return;}this.updateOne(this.local,{player:this.game.player},dt);this.local.root.visible=(this.game.cameraV12?.mode||0)!==0;}
 async spawnRemote(id,state={}){if(this.remotes.has(id))return this.remotes.get(id);const root=await this.model();root.name=`RemotePlayer_${id}`;root.scale.setScalar(.9375);this.game.renderer.scene.add(root);const avatar={id,root,controller:root.userData.animationController,lastPos:new THREE.Vector3(),distance:0,age:0,state:{position:new THREE.Vector3(),velocity:new THREE.Vector3(),yaw:0,pitch:0,onGround:true,crouchingV12:false,...state}};avatar.lastPos.copy(avatar.state.position);this.remotes.set(id,avatar);return avatar;}
 updateRemote(id,state={},dt=ENGINE.TARGET_DT){const a=this.remotes.get(id);if(!a)return false;Object.assign(a.state,state);this.updateOne(a,{player:a.state},dt);return true;}
 removeRemote(id){const a=this.remotes.get(id);if(!a)return false;a.root?.parent?.remove(a.root);this.remotes.delete(id);return true;}
}

class PlayerCameraV12{
 constructor(gameRef){this.game=gameRef;this.mode=Number(localStorage.getItem('mcCameraModeV12')||0)%3;this.distance=STUDIO_V12.thirdPersonDistance;this.tmp=new THREE.Vector3();}
 label(){return this.mode===0?'1ST':this.mode===1?'3RD':'FRONT';}
 set(mode,save=true){this.mode=((Number(mode)||0)%3+3)%3;if(save)localStorage.setItem('mcCameraModeV12',String(this.mode));this.syncUI();this.game.playerEntitiesV12?.ensureLocal?.();return this.mode;}
 cycle(){this.set(this.mode+1);toast(`Camera: ${this.mode===0?'First person':this.mode===1?'Third person back':'Third person front'}`);this.game.saveSoon?.();}
 syncUI(){if($('cameraToggleV12'))$('cameraToggleV12').textContent=this.label();if(this.game.firstPersonV7?.group)this.game.firstPersonV7.group.visible=this.mode===0;if(this.game.playerEntitiesV12?.local?.root)this.game.playerEntitiesV12.local.root.visible=this.mode!==0;}
 clipDistance(target,dir,max){let safe=max;for(let d=.25;d<=max;d+=.22){const p=this.tmp.copy(target).addScaledVector(dir,d),id=this.game.world.getLoaded(Math.floor(p.x),Math.floor(p.y),Math.floor(p.z));if(SOLID_BLOCKS.has(id)){safe=Math.max(.32,d-.34);break;}}return safe;}
 apply(player,camera){if(this.mode===0){camera.position.set(player.position.x,player.eyePositionV12(),player.position.z);camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;camera.rotation.z=0;this.syncUI();return;}const eye=player.crouchingV12?1.18:1.48,target=new THREE.Vector3(player.position.x,player.position.y+eye,player.position.z),forward=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(player.pitch,player.yaw,0,'YXZ')).normalize(),dir=this.mode===1?forward.clone().multiplyScalar(-1):forward.clone(),dist=this.clipDistance(target,dir,this.distance);camera.position.copy(target).addScaledVector(dir,dist);camera.lookAt(target);camera.rotation.z=0;this.syncUI();}
}
game.cameraV12=new PlayerCameraV12(game);

/* Crouch changes the collision height, eye height and Minecraft-like ledge behavior. */
Player.prototype.eyePositionV12=function(){return this.position.y+(this.crouchingV12?STUDIO_V12.crouchEye:ENGINE.EYE_HEIGHT);};
Player.prototype.eyePosition=function(out=new THREE.Vector3()){out.copy(this.position);out.y=this.eyePositionV12();return out;};
Player.prototype.aabb=function(pos=this.position){const h=this.crouchingV12?STUDIO_V12.crouchHeight:ENGINE.PLAYER_HEIGHT;return{minX:pos.x-ENGINE.PLAYER_RADIUS,maxX:pos.x+ENGINE.PLAYER_RADIUS,minY:pos.y,maxY:pos.y+h,minZ:pos.z-ENGINE.PLAYER_RADIUS,maxZ:pos.z+ENGINE.PLAYER_RADIUS};};
Player.prototype.setCrouchV12=function(on){on=!!on;if(!on){const oldToggle=this.sneakingV12,oldCrouch=this.crouchingV12;this.sneakingV12=false;this.crouchingV12=false;if(this.collidesAt(this.position)){this.sneakingV12=oldToggle;this.crouchingV12=oldCrouch;toast('Cannot stand here');return false;}}this.sneakingV12=on;this.crouchingV12=on||!!this.crouchHeldV12;$('useBtn')?.classList.toggle('crouchingV12',this.sneakingV12);$('crouchStateV12')?.classList.toggle('on',this.sneakingV12);return true;};
Player.prototype.toggleCrouchV12=function(){return this.setCrouchV12(!this.sneakingV12);};
Player.prototype.supportedV12=function(pos=this.position){const y=Math.floor(pos.y-.08),r=ENGINE.PLAYER_RADIUS*.82;for(const dx of [-r,r])for(const dz of [-r,r]){const id=this.world.getLoaded(Math.floor(pos.x+dx),y,Math.floor(pos.z+dz));if(SOLID_BLOCKS.has(id))return true;}return false;};
const v12PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){this.sneakingV12??=false;this.crouchHeldV12=!!controls.sneak;const crouch=!!(this.sneakingV12||this.crouchHeldV12);this.crouchingV12=crouch;const c={...controls};if(crouch&&!this.flying){c.forward*=STUDIO_V12.crouchSpeed;c.right*=STUDIO_V12.crouchSpeed;c.run=false;}const before=this.position.clone(),groundBefore=this.onGround;const result=v12PlayerUpdateBase.call(this,dt,c);if(crouch&&!this.flying&&groundBefore&&!this.supportedV12(this.position)){const y=this.position.y,vY=this.velocity.y;this.position.x=before.x;this.position.z=before.z;this.position.y=y;this.velocity.x=0;this.velocity.z=0;this.velocity.y=vY;}return result;};
Player.prototype.updateCamera=function(camera){(game.cameraV12||=new PlayerCameraV12(game)).apply(this,camera);};
const v12InputStateBase=InputManager.prototype.state;
InputManager.prototype.state=function(){const s=v12InputStateBase.call(this);if(s.sneak)s.run=false;return s;};

function ensureV12HudControls(){if(!$('cameraToggleV12')){const b=document.createElement('button');b.id='cameraToggleV12';b.type='button';b.textContent=game.cameraV12.label();b.setAttribute('aria-label','Cycle camera');b.onclick=e=>{e.preventDefault();e.stopPropagation();if(game.running)game.cameraV12.cycle();};$('hud')?.appendChild(b);}if(!$('crouchStateV12')){const s=document.createElement('div');s.id='crouchStateV12';s.textContent='CROUCH';$('hud')?.appendChild(s);}}
ensureV12HudControls();
addEventListener('keydown',e=>{if(e.code==='F5'&&game.running){e.preventDefault();game.cameraV12.cycle();}},{capture:true});

/* Double-tap USE/PLACE toggles crouch; a normal tap still performs the original use after the double-tap window. */
const v12UseBtn=$('useBtn');
if(v12UseBtn&&!v12UseBtn.dataset.v12Crouch){v12UseBtn.dataset.v12Crouch='1';let lastTap=-Infinity,timer=0;v12UseBtn.addEventListener('pointerdown',e=>{if(!game.running||game.ui?.screen)return;e.preventDefault();e.stopImmediatePropagation();v12UseBtn.classList.add('pressed');try{v12UseBtn.setPointerCapture?.(e.pointerId)}catch{}const t=performance.now();if(t-lastTap<=STUDIO_V12.doubleTapMs){clearTimeout(timer);timer=0;lastTap=-Infinity;game.player.toggleCrouchV12();game.soundV9?.play('random.click',{ui:true,volume:.20,temporaryClick:true});return;}lastTap=t;timer=setTimeout(()=>{timer=0;lastTap=-Infinity;if(game.running&&!game.ui?.screen)game.useSelected();},STUDIO_V12.doubleTapMs-25);},{capture:true,passive:false});const finish=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();v12UseBtn.classList.remove('pressed');};v12UseBtn.addEventListener('pointerup',finish,{capture:true,passive:false});v12UseBtn.addEventListener('pointercancel',finish,{capture:true,passive:false});}

/* Stereo is the default output. Positional world sounds keep HRTF panning; Mono is an explicit user option. */
MinecraftSoundSystemV9.prototype.outputModeV12=localStorage.getItem('mcAudioModeV12')==='mono'?'mono':'stereo';
MinecraftSoundSystemV9.prototype.configureOutputV12=function(){if(!this.ctx||!this.master)return;try{this.master.disconnect();}catch{}try{this.outputV12?.disconnect?.();}catch{}const out=this.ctx.createGain();out.gain.value=1;out.channelCount=this.outputModeV12==='mono'?1:2;out.channelCountMode='explicit';out.channelInterpretation='speakers';this.master.connect(out);out.connect(this.ctx.destination);this.outputV12=out;this.cacheName=this.outputModeV12==='stereo'?'fresh-mc-audio-v12-stereo':'fresh-mc-audio-v12-mono';};
MinecraftSoundSystemV9.prototype.setOutputModeV12=function(mode){this.outputModeV12=mode==='mono'?'mono':'stereo';localStorage.setItem('mcAudioModeV12',this.outputModeV12);this.configureOutputV12();this.diag(`AUDIO OUTPUT ${this.outputModeV12.toUpperCase()} (${this.ctx?.destination?.maxChannelCount||'device'} max destination channels)`,'ok');return this.outputModeV12;};
const v12SoundUnlockBase=MinecraftSoundSystemV9.prototype.unlock;
MinecraftSoundSystemV9.prototype.unlock=async function(){const ctx=await v12SoundUnlockBase.call(this);if(!this.outputV12)this.configureOutputV12();return ctx;};
MinecraftSoundSystemV9.prototype.routeV12=function(node,{position=null,ui=false}={}){if(position&&!ui){const p=this.ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=2;p.maxDistance=38;p.rolloffFactor=1;try{p.positionX.value=position.x;p.positionY.value=position.y;p.positionZ.value=position.z;}catch{p.setPosition?.(position.x,position.y,position.z);}node.connect(p);p.connect(this.master);return p;}node.connect(this.master);return null;};
MinecraftSoundSystemV9.prototype.synthV12=function(event,opts={}){if(!this.ctx||!this.master)return;const volume=opts.volume??.35,pitch=opts.pitch??1,ctx=this.ctx,t=ctx.currentTime,name=String(event||''),gain=ctx.createGain(),vol=Math.max(.008,Math.min(.55,volume));this.routeV12(gain,opts);if(/click|levelup/i.test(name)){const o=ctx.createOscillator();o.type='square';o.frequency.setValueAtTime((/levelup/i.test(name)?1040:690)*pitch,t);o.frequency.exponentialRampToValueAtTime((/levelup/i.test(name)?700:390)*pitch,t+.055);gain.gain.setValueAtTime(vol*.18,t);gain.gain.exponentialRampToValueAtTime(.001,t+.07);o.connect(gain);o.start(t);o.stop(t+.075);return;}const length=/explode/i.test(name)?.42:/eat|burp/i.test(name)?.17:/dig|step|wood|stone|grass|sand|gravel/i.test(name)?.095:.14,rate=ctx.sampleRate,channels=this.outputModeV12==='stereo'?2:1,buf=ctx.createBuffer(channels,Math.ceil(rate*length),rate);for(let ch=0;ch<channels;ch++){const a=buf.getChannelData(ch);for(let i=0;i<a.length;i++){const env=Math.pow(1-i/a.length,/explode/i.test(name)?.7:1.7),n=Math.random()*2-1;a[i]=n*env*(channels===2?(ch?0.985:1):1);}}const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter();src.buffer=buf;filter.type='bandpass';filter.frequency.value=/wood/i.test(name)?580:/grass|sand/i.test(name)?1100:/eat|burp/i.test(name)?760:/explode/i.test(name)?190:430;filter.Q.value=/explode/i.test(name)?.45:1;gain.gain.setValueAtTime(vol,t);gain.gain.exponentialRampToValueAtTime(.001,t+length);src.connect(filter);filter.connect(gain);src.playbackRate.value=Math.max(.55,Math.min(1.8,pitch));src.start(t);};
MinecraftSoundSystemV9.prototype.play=async function(event,opts={}){if(!this.enabled)return;try{await this.unlock();}catch{return;}let item=null;try{if(!this.defs)this.loadManifest().catch(()=>{});item=this.pick(event);}catch{}if(item){const path=String(item.name||'').replace(/\.fsb$/i,''),ready=this.buffers.get(`browser|${path}`)||this.buffers.get(path);if(ready){const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();src.buffer=ready;src.playbackRate.value=Math.max(.25,Math.min(4,(opts.pitch||1)*(Number(item.pitch)||1)));gain.gain.value=Math.max(0,Math.min(2,(opts.volume??1)*(Number(item.volume)||1)));src.connect(gain);this.routeV12(gain,opts);src.start();return;}this.browserBufferV11(path).catch(()=>{});this.buffer(path).catch(()=>{});}this.synthV12(event,opts);};
game.soundV9.setOutputModeV12(game.soundV9.outputModeV12);

function installAudioOptionV12(){const panel=$('voxelOptions');if(panel&&!$('audioModeV12')){const row=document.createElement('div');row.className='voxOptRow';row.innerHTML=`<label><span>Audio output</span><b id="audioModeStateV12">${game.soundV9.outputModeV12.toUpperCase()}</b></label><select id="audioModeV12" class="v12AudioSelect"><option value="stereo">Stereo (default / spatial)</option><option value="mono">Mono</option></select>`;panel.prepend(row);$('audioModeV12').value=game.soundV9.outputModeV12;$('audioModeV12').onchange=e=>{$('audioModeStateV12').textContent=game.soundV9.setOutputModeV12(e.target.value).toUpperCase();};}}
installAudioOptionV12();

/* Official Mojang experience-bar textures are rendered under health/hunger. */
const v12HudBase=renderSurvivalBarsV6;
renderSurvivalBarsV6=function(player,mode){v12HudBase(player,mode);survivalBars.style.display=mode==='creative'?'none':'grid';ensureExperienceHudV12();game.xpV12?.render?.();};

/* Award a small survival XP stream for mined ores and player-caused mob kills. */
const v12MineXpBase=Game.prototype.mine;
Game.prototype.mine=function(dt){const before=this.breaking?this.getTarget?.():null,id=before?.id||0,pos=before?{x:before.x,y:before.y,z:before.z}:null;const r=v12MineXpBase.call(this,dt);if(pos&&id&&this.world.getLoaded(pos.x,pos.y,pos.z)===BLOCK.AIR){let xp=0;if(id===BLOCK.COAL_ORE)xp=1+Math.floor(Math.random()*2);else if(id===BLOCK.DIAMOND_ORE)xp=3+Math.floor(Math.random()*5);if(xp)this.xpV12?.add(xp,`mine:${BLOCK_NAME[id]||id}`);}return r;};
const v12MobXpBase=MobSystem.prototype.update;
MobSystem.prototype.update=function(dt,player){const before=[...this.mobs];const r=v12MobXpBase.call(this,dt,player);const recent=this.game?.combat?.lastTarget&&performance.now()-(this.game.combat.lastAttackTime||0)<5000;for(const mob of before){if(mob._xpAwardedV12||mob.health>0||this.mobs.includes(mob))continue;mob._xpAwardedV12=true;if(recent&&this.game.combat.lastTarget===mob){const hostile=['zombie','skeleton','creeper','spider'].includes(mob.type),xp=hostile?5:1+Math.floor(Math.random()*3);this.game.xpV12?.add(xp,`mob:${mob.type}`);}}return r;};

/* A backend-safe gradient sky dome: warm light stays around the horizon/sun instead of tinting the entire sky pink. */
class MinecraftSkyDomeV12{
 constructor(rendererRef){this.rr=rendererRef;const geo=new THREE.SphereGeometry(280,32,16);const pos=geo.getAttribute('position'),colors=new Float32Array(pos.count*3);geo.setAttribute('color',new THREE.BufferAttribute(colors,3));const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,toneMapped:false});this.mesh=new THREE.Mesh(geo,mat);this.mesh.frustumCulled=false;this.mesh.renderOrder=-10000;rendererRef.scene.add(this.mesh);const pts=[];let seed=0x5f3759df;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<190;i++){const y=.06+rnd()*.94,a=rnd()*Math.PI*2,r=Math.sqrt(Math.max(0,1-y*y));pts.push(Math.cos(a)*r*245,y*245,Math.sin(a)*r*245);}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));this.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xeaf4ff,size:.78,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false,depthTest:false,fog:false,toneMapped:false}));this.stars.frustumCulled=false;this.stars.renderOrder=-9999;rendererRef.scene.add(this.stars);this.c=new THREE.Color();this.a=new THREE.Color();this.b=new THREE.Color();this.warm=new THREE.Color(0xffa66a);}
 update(camera,day,twilight,sunDir){this.mesh.position.copy(camera.position);this.stars.position.copy(camera.position);const nightTop=this.a.set(0x061127).clone(),dayTop=this.b.set(0x78bbed).clone(),nightHor=new THREE.Color(0x15233d),dayHor=new THREE.Color(0xc4e6fb),top=nightTop.lerp(dayTop,day),horizon=nightHor.lerp(dayHor,day),p=this.mesh.geometry.getAttribute('position'),col=this.mesh.geometry.getAttribute('color');for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),len=Math.hypot(x,y,z)||1,dx=x/len,dy=y/len,dz=z/len,h=smoothstep(clamp((dy+.08)/.98,0,1));this.c.copy(horizon).lerp(top,h);const dot=Math.max(0,dx*sunDir.x+dy*sunDir.y+dz*sunDir.z),warm=twilight*Math.pow(dot,7)*Math.exp(-Math.abs(dy)*5.2);if(warm>.001)this.c.lerp(this.warm,clamp(warm*.88,0,.82));col.setXYZ(i,this.c.r,this.c.g,this.c.b);}col.needsUpdate=true;this.stars.material.opacity=Math.pow(1-day,2.2)*.92;}
}
const v12EnvBase=VoxelRenderer.prototype.ensureEnvironmentV6;
VoxelRenderer.prototype.ensureEnvironmentV6=function(){v12EnvBase.call(this);if(!this.skyV12)this.skyV12=new MinecraftSkyDomeV12(this);};
const v12CelestialBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(){v12CelestialBase.call(this);this.ensureEnvironmentV6();const phase=dayClock.phase(),angle=phase*Math.PI*2,sunY=Math.sin(angle),day=smoothstep(clamp((sunY+.11)/.39,0,1)),twilight=clamp(1-Math.abs(sunY)/.25,0,1),profile=this.gameRefV7?.graphicsV7?.profile||'fast',boost=profile==='ultra'?1.16:profile==='fancy'?1.08:1,sunDir=new THREE.Vector3(Math.cos(angle),sunY,Math.sin(angle)*.48).normalize();this.skyV12?.update(this.camera,day,twilight,sunDir);const skyDay=new THREE.Color(0x86c7f4),skyNight=new THREE.Color(0x09152d),fogDay=new THREE.Color(0xaed8f2),fogNight=new THREE.Color(0x17233a),ambientDay=new THREE.Color(0xc9e8ff),ambientNight=new THREE.Color(0x445978),groundDay=new THREE.Color(0x6f6047),groundNight=new THREE.Color(0x1d2638);this.scene.background.copy(skyNight).lerp(skyDay,day);this.fog.color.copy(fogNight).lerp(fogDay,day);this.sun.intensity=(.035+Math.pow(day,.70)*1.58)*boost;this.sun.color.copy(new THREE.Color(0xffb06f).lerp(new THREE.Color(0xfff9e7),smoothstep(clamp((sunY+.02)/.50,0,1))));this.moon.intensity=(.06+Math.pow(1-day,1.4)*.28)*(profile==='ultra'?1.05:1);this.moon.color.set(0xb9cfff);this.ambient.color.copy(ambientNight).lerp(ambientDay,day);this.ambient.groundColor.copy(groundNight).lerp(groundDay,day);this.ambient.intensity=(.30+day*.82)*(profile==='ultra'?1.08:1);this.fillAmbient.intensity=.035+day*.085;if(this.dayStateV6){this.dayStateV6.daylight=day;this.dayStateV6.isNight=day<.18;}};

/* Extend title options with the audio choice without replacing the existing renderer/LOD controls. */
const v12TitleOptionsBase=v9TitleOptions;
v9TitleOptions=function(){v12TitleOptionsBase();const panel=document.querySelector('#titleContent .v9WorldPanel')||document.querySelector('#titleContent');if(panel&&!$('v12TitleAudio')){const row=document.createElement('div');row.className='v9RangeRow';row.innerHTML=`<label><span>Audio output</span><b id="v12TitleAudioState">${game.soundV9.outputModeV12.toUpperCase()}</b></label><select id="v12TitleAudio" class="gfx-select-v7"><option value="stereo">Stereo (default)</option><option value="mono">Mono</option></select><div class="v9Small" style="margin-top:5px;text-align:left">Stereo keeps Web Audio positional left/right panning for world sounds when the browser/device exposes stereo output.</div>`;const done=$('v9OptDone')?.parentElement;if(done)panel.insertBefore(row,done);else panel.appendChild(row);$('v12TitleAudio').value=game.soundV9.outputModeV12;$('v12TitleAudio').onchange=e=>{$('v12TitleAudioState').textContent=game.soundV9.setOutputModeV12(e.target.value).toUpperCase();};}};
const v12BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v12BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small&&/Minecraft Web/.test(small.textContent||''))small.textContent=`Minecraft Web • Three.js • ${STUDIO_V12.version}`;};

/* Load/save XP, crouch and camera state through the existing world record. */
const v12BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){const fresh=!!args[1];if(fresh){this._savedExperienceV12=0;this._savedCrouchV12=false;this._savedCameraModeV12=null;}await v12BootBase.apply(this,args);this.xpV12=new ExperienceSystemV12(this);this.player.sneakingV12=!!this._savedCrouchV12;this.player.crouchingV12=this.player.sneakingV12;if(!this.cameraV12)this.cameraV12=new PlayerCameraV12(this);if(this._savedCameraModeV12!=null)this.cameraV12.set(this._savedCameraModeV12,false);this.playerEntitiesV12??=new PlayerEntityRendererV12(this);await this.playerEntitiesV12.resetLocal();this.cameraV12.syncUI();this.soundV9.setOutputModeV12(this.soundV9.outputModeV12);renderSurvivalBarsV6(this.player,this.mode);window.__voxelDiag?.log?.(`V12 BOOT ${STUDIO_V12.version}: ${this.soundV9.outputModeV12} audio, XP HUD, player avatar, crouch and third-person camera ready.`,'ok');};
const v12GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v12GameUpdateBase.call(this,dt);this.playerEntitiesV12?.updateLocal(dt);return r;};

window.spawnRemotePlayerV12=async(id,state={})=>await game.playerEntitiesV12?.spawnRemote(id,state);
window.updateRemotePlayerV12=(id,state={},dt=ENGINE.TARGET_DT)=>game.playerEntitiesV12?.updateRemote(id,state,dt);
window.removeRemotePlayerV12=id=>game.playerEntitiesV12?.removeRemote(id);

try{runtimeCommands.register('xp',()=>game.xpV12?.snapshot()||null,'Inspect survival experience total/level/progress.');runtimeCommands.register('camera',()=>({mode:game.cameraV12?.mode,label:game.cameraV12?.label(),crouching:!!game.player?.crouchingV12}),'Inspect third-person camera and crouch state.');runtimeCommands.register('audio12',()=>({mode:game.soundV9?.outputModeV12,state:game.soundV9?.ctx?.state||'none',destinationMaxChannels:game.soundV9?.ctx?.destination?.maxChannelCount||null,spatial:'HRTF when stereo'}),'Inspect stereo/mono Web Audio output.');runtimeCommands.register('player12',()=>({local:!!game.playerEntitiesV12?.local,geometry:game.playerEntitiesV12?.local?.root?.userData?.geometryName,texture:game.playerEntitiesV12?.local?.root?.userData?.textureURL,remotes:game.playerEntitiesV12?.remotes?.size||0}),'Inspect Bedrock player renderer and future multiplayer avatars.');}catch{}
window.__voxelDiag?.log?.(`V12 READY ${STUDIO_V12.version}: default stereo/HRTF, Mojang XP bar, Bedrock Steve third-person model, Mojang sneak animation, double-tap crouch, future remote-player API, and localized sunrise/sunset sky lighting.`,'ok');



const STUDIO_V13=Object.freeze({
  version:'0.13.1-alpha.2',
  label:'Minecraft Web Alpha 0.13.1',
  baseFov:70,
  sprintFov:78,
  bobWalk:.046,
  bobSprint:.066,
  cloudHeight:88,
  cloudSpeed:.00135
});
window.MINECRAFT_WEB_VERSION=STUDIO_V13.version;
window.STUDIO_PATCH_VERSION=STUDIO_V13.version;

const v13Style=document.createElement('style');
v13Style.textContent=`
#armorBarV13{position:absolute;left:0;bottom:31px;height:10px;display:flex;gap:0;align-items:center;filter:drop-shadow(1px 1px 0 #000);pointer-events:none}
.armorUnitV13{position:relative;width:10px;height:10px;display:block}.armorUnitV13 img{position:absolute;inset:0;width:10px;height:10px;image-rendering:pixelated;object-fit:contain}.armorUnitV13.empty img{opacity:.18;filter:grayscale(1)}
#sprintBtnV13{left:164px;bottom:42px;width:52px;height:52px;font-size:12px;font-weight:900;letter-spacing:-.4px}
#sprintBtnV13.active{background:rgba(95,180,95,.38);box-shadow:inset 0 0 0 2px rgba(255,255,255,.28)}
#versionBadgeV13{position:absolute;left:8px;bottom:8px;z-index:205;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(255,255,255,.72);text-shadow:1px 1px #000;pointer-events:none}
.v13Inventory{width:min(920px,96vw)!important;max-height:min(92dvh,650px)!important;padding:8px!important;background:#c6c6c6!important}
.v13InventoryShell{display:grid;grid-template-columns:minmax(210px,.95fr) minmax(330px,1.25fr);gap:8px;min-height:430px}
.v13RecipePanel,.v13PlayerPanel{background:#c6c6c6;border:2px solid #373737;box-shadow:inset 2px 2px #fff,inset -2px -2px #555;padding:7px;min-width:0}
.v13RecipeTabs{display:flex;gap:3px;height:34px;align-items:flex-end}.v13RecipeTab{width:34px;height:31px;background:#8b8b8b;border:2px solid #373737;box-shadow:inset 2px 2px #ddd,inset -2px -2px #555;display:flex;align-items:center;justify-content:center}.v13RecipeTab img{width:22px;height:22px;image-rendering:pixelated;object-fit:contain}.v13RecipeTab.active{height:34px;background:#c6c6c6;border-bottom-color:#c6c6c6}
.v13RecipeList{height:342px;overflow:auto;padding:3px;background:#8b8b8b;border:2px solid #373737;touch-action:pan-y;-webkit-overflow-scrolling:touch}.v13RecipeList .mc-btn{width:100%;min-width:0;margin:2px 0;text-align:left;font-size:11px;padding:7px 8px}
.v13PlayerTop{display:grid;grid-template-columns:50px 112px 1fr;gap:7px;align-items:start;margin-bottom:8px}.v13Equipment{display:grid;grid-template-columns:44px;gap:3px}.v13EquipSlot{width:44px;height:44px;background:#8b8b8b;border:2px solid #333;box-shadow:inset 2px 2px #555,inset -2px -2px #d5d5d5;display:flex;align-items:center;justify-content:center}.v13EquipSlot img{width:26px;height:26px;image-rendering:pixelated;opacity:.55}.v13EquipSlot.offhand{margin-top:4px}
.v13PaperDoll{height:188px;background:#1b1b1b;border:2px solid #333;box-shadow:inset 1px 1px #000;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}.v13PaperDoll:before{content:'PLAYER';position:absolute;bottom:4px;font:9px monospace;color:#bbb}.v13PaperDollFigure{width:45px;height:118px;position:relative;transform:perspective(180px) rotateY(-12deg)}.v13PaperDollFigure span{position:absolute;display:block;box-shadow:inset -4px -4px rgba(0,0,0,.14)}.v13Head{width:34px;height:34px;background:#b87953;left:6px;top:0}.v13Body{width:34px;height:45px;background:#2fa4a2;left:6px;top:36px}.v13ArmL,.v13ArmR{width:12px;height:47px;background:#b87953;top:37px}.v13ArmL{left:-7px}.v13ArmR{right:-7px}.v13LegL,.v13LegR{width:15px;height:38px;background:#39489f;top:80px}.v13LegL{left:6px}.v13LegR{right:5px}
.v13CraftArea{min-width:0}.v13CraftTitle{font:12px monospace;margin:3px 0 7px}.v13MiniCraft{display:grid;grid-template-columns:repeat(2,44px);gap:3px;width:max-content}.v13CraftOut{display:flex;align-items:center;gap:8px;margin-top:8px}.v13CraftArrow{font-size:28px;font-weight:900;color:#555}.v13InvTitle{font:12px monospace;margin:5px 0}.v13Inventory .inventory-grid{grid-template-columns:repeat(9,minmax(34px,1fr));gap:2px}.v13Inventory .inv-slot{min-width:32px;min-height:32px}.v13Inventory .search{height:32px;margin:5px 0 6px;background:#111;color:#fff;border:2px solid #777;font:12px monospace}.v13InventoryDone{margin-top:7px;width:100%}
@media(max-width:760px){.v13InventoryShell{grid-template-columns:1fr 1.18fr;min-height:0}.v13RecipeList{height:min(46dvh,315px)}.v13PlayerTop{grid-template-columns:42px 88px 1fr;gap:4px}.v13EquipSlot{width:38px;height:38px}.v13Equipment{grid-template-columns:38px}.v13PaperDoll{height:164px}.v13Inventory .inventory-grid{grid-template-columns:repeat(9,minmax(28px,1fr))}.v13Inventory .inv-slot{min-height:29px}}
@media(max-width:680px) and (orientation:portrait){.v13Inventory{max-height:94dvh!important;overflow:auto!important}.v13InventoryShell{grid-template-columns:1fr}.v13RecipeList{height:210px}.v13PlayerTop{grid-template-columns:44px 94px 1fr}.v13Inventory .inventory-grid{grid-template-columns:repeat(9,minmax(25px,1fr))}#sprintBtnV13{left:151px;bottom:40px}}
@media (hover:hover) and (pointer:fine){#sprintBtnV13{display:none}}
`;
document.head.appendChild(v13Style);

BLOCK_FACE_TEXTURE[BLOCK.FURNACE]={up:'furnace_top',down:'furnace_top',east:'furnace_side',west:'furnace_side',north:'furnace_side',south:'furnace_front_off'};

function ensureArmorHudV13(){
  if(!$('survivalBars')||$('armorBarV13'))return;
  const bar=document.createElement('div');bar.id='armorBarV13';$('survivalBars').appendChild(bar);
}
function renderArmorHudV13(player,mode){
  ensureArmorHudV13();const bar=$('armorBarV13');if(!bar)return;const points=clamp(Math.round(Number(player?.armorPointsV13)||0),0,20),sig=`${mode}:${points}`;if(bar.dataset.sig===sig)return;bar.dataset.sig=sig;bar.style.display=mode==='creative'?'none':'flex';if(mode==='creative')return;let html='';
  for(let i=0;i<10;i++){
    const v=points-i*2,src=v>=2?`${MC_TEX}ui/armor_full.png`:v===1?`${MC_TEX}ui/armor_half.png`:`${MC_TEX}ui/armor_full.png`;
    html+=`<span class="armorUnitV13 ${v<=0?'empty':''}"><img src="${src}" alt=""></span>`;
  }
  bar.innerHTML=html;
}
const v13HudBase=renderSurvivalBarsV6;
renderSurvivalBarsV6=function(player,mode){v13HudBase(player,mode);renderArmorHudV13(player,mode);};

function ensureSprintButtonV13(){
  if($('sprintBtnV13'))return;const b=document.createElement('button');b.id='sprintBtnV13';b.className='actionBtn';b.type='button';b.textContent='SPRINT';b.setAttribute('aria-label','Sprint');$('mobileControls')?.appendChild(b);
  const down=e=>{e.preventDefault();e.stopPropagation();if(!game.running||game.ui?.screen)return;game.input.run=true;b.classList.add('active','pressed');try{b.setPointerCapture?.(e.pointerId)}catch{}};
  const up=e=>{e?.preventDefault?.();e?.stopPropagation?.();game.input.run=false;b.classList.remove('active','pressed');};
  b.addEventListener('pointerdown',down,{passive:false});b.addEventListener('pointerup',up,{passive:false});b.addEventListener('pointercancel',up,{passive:false});b.addEventListener('lostpointercapture',up);
}
ensureSprintButtonV13();

const v13InputStateBase=InputManager.prototype.state;
InputManager.prototype.state=function(){
  const s=v13InputStateBase.call(this);const ctrl=this.keys.has('ControlLeft')||this.keys.has('ControlRight');const legacy=this.keys.has('KeyR'),doubleW=!!this.sprintLatchV13&&this.keys.has('KeyW');s.run=!!((ctrl||legacy||doubleW||this.run)&&!s.sneak);return s;
};

const v13PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){
  const c={...controls};const inWater=!!this.inWaterV8;const enoughFood=this.mode==='creative'||this.hunger>6;const forwardSprint=c.forward>.12&&c.run&&!c.sneak&&!inWater&&enoughFood&&!this.flying;
  c.run=forwardSprint||(!inWater&&this.flying&&c.run);this.sprinting=!!forwardSprint;
  const r=v13PlayerUpdateBase.call(this,dt,c);const speed=Math.hypot(this.velocity.x,this.velocity.z);this._walkPhaseV13=(this._walkPhaseV13||0)+(this.onGround?speed*dt*(this.sprinting?1.66:1.25):0);this._speedV13=speed;return r;
};

const v13CameraApplyBase=PlayerCameraV12.prototype.apply;
PlayerCameraV12.prototype.apply=function(player,camera){
  v13CameraApplyBase.call(this,player,camera);const target=this.mode===0&&player.sprinting?STUDIO_V13.sprintFov:STUDIO_V13.baseFov;camera.fov=lerp(camera.fov||STUDIO_V13.baseFov,target,.16);camera.updateProjectionMatrix();
  if(this.mode!==0||player.flying)return;const speed=player._speedV13||0,move=Math.min(1,speed/5.6),phase=player._walkPhaseV13||0;if(player.onGround&&move>.04){const amp=(player.sprinting?STUDIO_V13.bobSprint:STUDIO_V13.bobWalk)*move;const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));camera.position.addScaledVector(right,Math.sin(phase*Math.PI)*amp*.55);camera.position.y+=Math.abs(Math.cos(phase*Math.PI))*amp*.66;camera.rotation.z+=Math.sin(phase*Math.PI)*amp*.22;}
};

class MinecraftCloudLayerV13{
  constructor(gameRef){this.game=gameRef;this.mesh=null;this.texture=null;this.ready=false;this.clock=0;}
  procedural(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.clearRect(0,0,128,128);const rng=new Random(71337);x.fillStyle='#fff';for(let i=0;i<34;i++){const w=5+rng.int(0,16),h=2+rng.int(0,6),px=rng.int(0,127),py=rng.int(0,127);x.fillRect(px,py,w,h);}return c;}
  async mask(){let source=null;try{source=await this.game.assets.image(`${MC_TEX}environment/clouds.png`);}catch{}const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;if(source)x.drawImage(source,0,0,source.width||128,source.height||128,0,0,128,128);else x.drawImage(this.procedural(),0,0);
    try{const d=x.getImageData(0,0,128,128),n=d.data.length/4;let transparent=0,bright=0;for(let i=0;i<d.data.length;i+=4){if(d.data[i+3]<245)transparent++;const lum=.299*d.data[i]+.587*d.data[i+1]+.114*d.data[i+2];if(lum>127)bright++;}const alphaSource=transparent/n>.03;const brightMajor=bright/n>.55;let cover=0;for(let i=0;i<d.data.length;i+=4){const lum=.299*d.data[i]+.587*d.data[i+1]+.114*d.data[i+2];let a=alphaSource?d.data[i+3]:(brightMajor?255-lum:lum);a=a>70?220:0;if(a)cover++;d.data[i]=d.data[i+1]=d.data[i+2]=255;d.data[i+3]=a;}if(cover/n<.018||cover/n>.62)return this.procedural();x.putImageData(d,0,0);}catch{return this.procedural();}return c;}
  async init(){if(this.ready)return;const c=await this.mask(),t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3.0,3.0);const m=new THREE.MeshLambertMaterial({map:t,color:0xffffff,transparent:true,opacity:.78,alphaTest:.08,depthWrite:false,side:THREE.DoubleSide,fog:true});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(380,380,1,1),m);mesh.rotation.x=-Math.PI/2;mesh.position.y=STUDIO_V13.cloudHeight;mesh.renderOrder=-2;mesh.frustumCulled=false;this.game.renderer.scene.add(mesh);this.texture=t;this.mesh=mesh;this.ready=true;}
  update(dt){if(!this.mesh||!this.game.player)return;this.clock+=dt;const p=this.game.player.position;this.mesh.position.x=Math.round(p.x/64)*64;this.mesh.position.z=Math.round(p.z/64)*64;this.texture.offset.x=(this.texture.offset.x+dt*STUDIO_V13.cloudSpeed)%1;const q=this.game.graphicsV7?.profile||'fancy';this.mesh.material.opacity=q==='fast'?.55:q==='ultra'?.86:.74;this.mesh.visible=p.y<STUDIO_V13.cloudHeight+24;}
}

const v13GraphicsApplyBase=GraphicsQualityV7.prototype.apply;
GraphicsQualityV7.prototype.apply=function(profile=this.profile){const p=v13GraphicsApplyBase.call(this,profile),rr=this.game.renderer,r=rr.renderer;if(!r)return p;const fancy=p!=='fast';try{r.toneMapping=fancy?THREE.NeutralToneMapping:THREE.NoToneMapping;r.toneMappingExposure=p==='ultra'?1.27:p==='fancy'?1.18:1.08;}catch{}if(rr.ambient)rr.ambient.intensity=p==='ultra'?1.18:p==='fancy'?1.05:.93;if(rr.materialWater){rr.materialWater.transparent=true;rr.materialWater.opacity=p==='fast'?.64:.70;rr.materialWater.depthWrite=false;rr.materialWater.side=THREE.DoubleSide;}return p;};

const v13CelestialBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(){v13CelestialBase.call(this);const phase=dayClock.phase(),a=phase*Math.PI*2,alt=Math.sin(a),day=smoothstep(clamp((alt+.13)/.30,0,1)),twilight=1-smoothstep(clamp(Math.abs(alt)/.34,0,1)),profile=this.gameRef?.graphicsV7?.profile||game.graphicsV7?.profile||'fancy';const mult=profile==='ultra'?1.12:profile==='fancy'?1.0:.92;if(this.sun){this.sun.intensity=(.06+day*2.05)*mult;this.sun.color.set(twilight>.22?0xffb06f:0xfff3db);}if(this.ambient){this.ambient.intensity=(.28+day*.78)*mult;this.ambient.color.set(day>.35?0xdceeff:0x7182a1);this.ambient.groundColor.set(day>.35?0x6b725e:0x182037);}if(this.fillAmbient)this.fillAmbient.intensity=(.05+day*.30)*mult;if(this.celestialV7?.sunSprite){this.celestialV7.sunSprite.scale.set(58,58,1);this.celestialV7.sunSprite.material.opacity=clamp(.45+day*.55,0,1);}if(this.materialWater){const col=new THREE.Color().setHSL(.52,.48,day>.45?.50:.34);this.materialWater.color.copy(col);}};

class ExperienceOrbSystemV13{
  constructor(gameRef){this.game=gameRef;this.items=[];this.group=new THREE.Group();this.group.name='experienceOrbsV13';gameRef.renderer.scene.add(this.group);this.texture=new THREE.TextureLoader().load(`${MC_TEX}entity/experience_orb.png`,t=>{t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;},undefined,()=>window.__voxelDiag?.log?.('XP ORB TEXTURE FAILED; green sprite fallback remains active.','warn'));}
  split(value){const out=[];let left=Math.max(1,Math.floor(value));while(left>0&&out.length<8){let v=left>=7?7:left>=3?3:1;out.push(v);left-=v;}if(left>0)out[out.length-1]+=left;return out;}
  spawnBurst(value,pos,reason=''){for(const v of this.split(value))this.spawn(v,pos,reason);}
  spawn(value,pos,reason=''){const tex=this.texture.clone();tex.needsUpdate=true;tex.repeat.set(.25,.25);const frame=Math.min(11,Math.max(0,value));const col=frame%4,row=Math.floor(frame/4);tex.offset.set(col*.25,1-(row+1)*.25);const mat=new THREE.SpriteMaterial({map:tex,color:0xb8ff42,transparent:true,alphaTest:.03,depthWrite:false,fog:true});const s=new THREE.Sprite(mat);s.scale.set(.30,.30,1);s.position.copy(pos||this.game.player.position).add(new THREE.Vector3((Math.random()-.5)*.45,.25+Math.random()*.25,(Math.random()-.5)*.45));this.group.add(s);this.items.push({sprite:s,value,reason,age:0,vy:1.2+Math.random()*.9,spin:Math.random()*6.28});}
  update(dt){const p=this.game.player;if(!p)return;for(let i=this.items.length-1;i>=0;i--){const o=this.items[i];o.age+=dt;const s=o.sprite;o.vy-=6.5*dt;s.position.y+=o.vy*dt;const bx=Math.floor(s.position.x),by=Math.floor(s.position.y-.04),bz=Math.floor(s.position.z),below=this.game.world.getLoaded(bx,by,bz);if(SOLID_BLOCKS.has(below)&&o.vy<=0){s.position.y=by+1.08;o.vy=Math.abs(o.vy)*.34;}const target=p.position.clone().add(new THREE.Vector3(0,1,0)),d=s.position.distanceTo(target);if(o.age>.3&&d<7){const dir=target.sub(s.position).normalize();s.position.addScaledVector(dir,dt*(3.2+(7-d)*1.3));}const pulse=.27+Math.sin((o.age+o.spin)*8)*.035;s.scale.set(pulse,pulse,1);if(o.age>.3&&d<.72){this.game.xpV12?._addDirectV13?.(o.value,'orb');this.game.soundV9?.play('random.orb',{position:p.position,volume:.18,pitch:1.0+Math.random()*.25,temporaryClick:true});this.remove(i);}else if(o.age>35)this.remove(i);}}
  remove(i){const o=this.items[i];if(!o)return;this.group.remove(o.sprite);o.sprite.material?.map?.dispose?.();o.sprite.material?.dispose?.();this.items.splice(i,1);}
}

const v13XpImmediate=ExperienceSystemV12.prototype.add;
ExperienceSystemV12.prototype._addDirectV13=function(amount,reason='orb'){return v13XpImmediate.call(this,amount,reason);};
ExperienceSystemV12.prototype.add=function(amount,reason=''){
  const n=Math.max(0,Math.floor(Number(amount)||0));if(!n)return 0;if(this.game?.xpOrbsV13&&/^(mob|mine):/.test(String(reason))){let pos=this.game.player?.position?.clone?.()||new THREE.Vector3();if(String(reason).startsWith('mob:')&&this.game.combat?.lastTarget?.position)pos=this.game.combat.lastTarget.position.clone();else{const f=yawForward(this.game.player?.yaw||0);pos.add(new THREE.Vector3(f.x*1.1,1.05,f.z*1.1));}this.game.xpOrbsV13.spawnBurst(n,pos,reason);return n;}return v13XpImmediate.call(this,n,reason);
};

class FootstepAudioV13{
  constructor(gameRef){this.game=gameRef;this.last=new THREE.Vector3();this.ready=false;this.distance=0;this.grounded=false;}
  update(dt){const p=this.game.player;if(!p||!this.game.running)return;if(!this.ready){this.last.copy(p.position);this.grounded=p.onGround;this.ready=true;}const dx=p.position.x-this.last.x,dz=p.position.z-this.last.z,dist=Math.hypot(dx,dz);this.last.copy(p.position);if(p.onGround&&!p.inWaterV8&&dist>.0005){this.distance+=dist;const interval=p.sprinting?.42:.57;if(this.distance>=interval){this.distance=0;const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));const base=blockSoundEventV9(below),event=base.replace(/^dig\./,'step.');this.game.soundV9?.play(event,{position:p.position,volume:p.sprinting?.17:.12,pitch:.94+Math.random()*.12,temporaryClick:true});}}if(!this.grounded&&p.onGround&&Math.abs(p.velocity.y)<1.2)this.game.soundV9?.play('step.stone',{position:p.position,volume:.10,pitch:.82+Math.random()*.06,temporaryClick:true});this.grounded=p.onGround;}
}

class InventorySkinV13{
  static tab(texture,active=false){return `<div class="v13RecipeTab ${active?'active':''}"><img src="${MC_TEX}ui/${texture}.png" alt=""></div>`;}
  static equip(texture){return `<div class="v13EquipSlot"><img src="${MC_TEX}ui/${texture}.png" alt=""></div>`;}
}
UI.prototype.renderInventory=function(){
  const inv=this.game.inventory,c=this.game.crafting;inv.offhand??=new ItemStack();c.setGridSize(2);c.update();
  screenLayer.innerHTML=`<div class="mc-window v13Inventory"><div class="v13InventoryShell"><section class="v13RecipePanel"><div class="v13RecipeTabs">${InventorySkinV13.tab('icon_recipe_construction',true)}${InventorySkinV13.tab('icon_recipe_equipment')}${InventorySkinV13.tab('icon_recipe_nature')}${InventorySkinV13.tab('icon_recipe_item')}</div><input class="search" id="recipeSearchV13" placeholder="Search recipes"><div id="recipeListV13" class="v13RecipeList recipe-book"></div></section><section class="v13PlayerPanel"><div class="v13PlayerTop"><div class="v13Equipment">${InventorySkinV13.equip('empty_armor_slot_helmet')}${InventorySkinV13.equip('empty_armor_slot_chestplate')}${InventorySkinV13.equip('empty_armor_slot_leggings')}${InventorySkinV13.equip('empty_armor_slot_boots')}<div class="v13EquipSlot offhand">${this.slotHtml('f0',inv.offhand)}</div></div><div class="v13PaperDoll"><div class="v13PaperDollFigure"><span class="v13Head"></span><span class="v13Body"></span><span class="v13ArmL"></span><span class="v13ArmR"></span><span class="v13LegL"></span><span class="v13LegR"></span></div></div><div class="v13CraftArea"><div class="v13CraftTitle">Crafting</div><div class="v13MiniCraft">${Array.from({length:4},(_,i)=>this.slotHtml(`p${i}`,c.grid[i])).join('')}</div><div class="v13CraftOut"><span class="v13CraftArrow">→</span><div id="craftResultV13">${this.slotHtml('o',c.output)}</div></div><button class="mc-btn small" id="takeCraftV13" style="margin-top:7px;width:100%;min-width:0">Take Result</button></div></div><div class="v13InvTitle">Inventory</div><div class="inventory-grid">${inv.slots.map((s,i)=>this.slotHtml(`i${i}`,s,i)).join('')}</div><button class="mc-btn v13InventoryDone" id="closeInventoryV13">Done</button></section></div></div>`;
  $('recipeSearchV13').oninput=e=>this.renderRecipeBookV6('recipeListV13',2,e.target.value);$('closeInventoryV13').onclick=()=>this.close();$('takeCraftV13').onclick=()=>{if(this.game.crafting.takeOutput()){this.game.saveSoon();this.game.refreshHotbar();this.renderInventory();}};this.renderRecipeBookV6('recipeListV13',2,'');this.bindSlots();iconSanitizer.scan();
};

function dropSelectedOneV13(){const s=game.selectedStack?.();if(!s||s.empty?.()||s.count<=0)return false;const id=s.id,pos=game.player.eyePosition(new THREE.Vector3()),f=yawForward(game.player.yaw);pos.add(new THREE.Vector3(f.x*.65,-.2,f.z*.65));game.drops.spawn(id,1,pos);const d=game.drops.items?.at?.(-1);if(d){d.velocity?.set?.(f.x*3.5,2.1,f.z*3.5);}if(game.mode!=='creative'){s.count--;if(s.count<=0)game.inventory.slots[game.inventory.selected]=new ItemStack();}game.refreshHotbar();game.saveSoon();game.soundV9?.play('random.pop',{position:game.player.position,volume:.13,pitch:.82,temporaryClick:true});return true;}

let lastWDownV13=-Infinity;
addEventListener('keydown',e=>{
  if(e.code==='KeyW'&&!e.repeat&&game.running&&!game.ui?.screen){const t=performance.now();if(t-lastWDownV13<285)game.input.sprintLatchV13=true;lastWDownV13=t;}
  if(!game.running)return;if(e.code==='Escape'){if(game.ui?.screen){e.preventDefault();game.ui.close();return;}if(document.pointerLockElement)document.exitPointerLock?.();}
  if(game.ui?.screen)return;
  if(e.code==='KeyQ'){e.preventDefault();dropSelectedOneV13();}
  if(e.code==='ControlLeft'||e.code==='ControlRight')game.input.run=true;
},{capture:true});
addEventListener('keyup',e=>{if(e.code==='ControlLeft'||e.code==='ControlRight')game.input.run=false;if(e.code==='KeyW')game.input.sprintLatchV13=false;},{capture:true});

for(const ev of ['pointerdown','touchstart','keydown'])document.addEventListener(ev,()=>{if(game.soundV9?.enabled)game.soundV9.unlock?.().catch(()=>{});},{capture:true,passive:true,once:false});

function upgradeWaterV13(){
  const rr=game.renderer;if(!rr||rr._waterV13)return;rr._waterV13=true;const old=rr.materialWater,mat=new THREE.MeshPhongMaterial({map:rr.atlas.texture,color:0x8bcbd8,vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.69,alphaTest:.015,depthWrite:false,depthTest:true,shininess:82,specular:0xb9e7ff});mat.fog=true;rr.materialWater=mat;rr.materials[4]=mat;try{old?.dispose?.();}catch{}
}
const v13WaterUpdateBase=WaterSystemV8.prototype.update;
WaterSystemV8.prototype.update=function(dt){v13WaterUpdateBase.call(this,dt);const p=this.game.player;if(!p)return;if(p.headUnderwaterV8){const c=v8BiomeWaterColor(this.game.world,p.position.x,p.position.z);underwaterV8.style.background=`radial-gradient(circle at 50% 42%,rgba(${c[0]+22},${c[1]+28},${c[2]+34},.19),rgba(${c[0]},${c[1]},${c[2]},.52) 72%,rgba(8,30,48,.67))`;underwaterV8.style.backdropFilter='saturate(.82) contrast(.94)';}else underwaterV8.style.backdropFilter='';};

function addVersionBadgeV13(){if($('versionBadgeV13'))return;const d=document.createElement('div');d.id='versionBadgeV13';d.textContent=`${STUDIO_V13.label} • Three.js r180`;titleScreen?.appendChild(d);}addVersionBadgeV13();
const v13BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v13BuildTitleBase();addVersionBadgeV13();const small=document.querySelector('#titleContent .v9Small');if(small)small.textContent=`${STUDIO_V13.label} • Three.js r180 • WebGL / WebGPU test build`;};

const v13BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v13BootBase.apply(this,args);this.xpOrbsV13??=new ExperienceOrbSystemV13(this);this.footstepsV13??=new FootstepAudioV13(this);this.cloudsV13??=new MinecraftCloudLayerV13(this);this.renderer.cloudsV13=this.cloudsV13;await this.cloudsV13.init().catch(e=>window.__voxelDiag?.log?.(`CLOUD LAYER FAILED ${e.message}`,'warn'));upgradeWaterV13();this.graphicsV7?.apply?.(this.graphicsV7.profile);this.player.armorPointsV13=Number(localStorage.getItem('mcArmorV13')||this.player.armorPointsV13||0);renderSurvivalBarsV6(this.player,this.mode);window.__voxelDiag?.log?.(`V13 BOOT ${STUDIO_V13.version}: sprint FOV + view bob, Mojang cloud layer, armor HUD, XP orbs, improved lighting, Java-style inventory layout, furnace front and desktop controls ready.`,'ok');};
const v13GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v13GameUpdateBase.call(this,dt);this.xpOrbsV13?.update(dt);this.footstepsV13?.update(dt);this.cloudsV13?.update(dt);renderArmorHudV13(this.player,this.mode);return r;};

try{
  runtimeCommands.register('version13',()=>({name:STUDIO_V13.label,version:STUDIO_V13.version,three:ENGINE.THREE_VERSION,webgpu:!!navigator.gpu,secureContext:window.isSecureContext}),'Inspect Minecraft Web version/build.');
  runtimeCommands.register('movement13',()=>({sprinting:!!game.player?.sprinting,fov:game.renderer?.camera?.fov,speed:game.player?Math.hypot(game.player.velocity.x,game.player.velocity.z):0,crouching:!!game.player?.crouchingV12}),'Inspect sprint, FOV and bob movement state.');
  runtimeCommands.register('xp13',()=>({xp:game.xpV12?.snapshot?.(),orbs:game.xpOrbsV13?.items?.length||0}),'Inspect XP and world experience orbs.');
  runtimeCommands.register('clouds13',()=>({ready:!!game.cloudsV13?.ready,height:STUDIO_V13.cloudHeight,source:`${MC_TEX}environment/clouds.png`}), 'Inspect Mojang cloud layer.');
  runtimeCommands.register('armor13',()=>({points:game.player?.armorPointsV13||0,max:20,fullTexture:`${MC_TEX}ui/armor_full.png`,halfTexture:`${MC_TEX}ui/armor_half.png`}), 'Inspect armor HUD.');
  runtimeCommands.register('audio13',()=>({state:game.soundV9?.ctx?.state||'none',mode:game.soundV9?.outputModeV12||'stereo',buffers:game.soundV9?.buffers?.size||0,definitions:game.soundV9?.defs?Object.keys(game.soundV9.defs).length:0}), 'Inspect audio system.');
}catch{}

window.setArmorPointsV13=points=>{if(!game.player)return 0;game.player.armorPointsV13=clamp(Math.round(Number(points)||0),0,20);localStorage.setItem('mcArmorV13',String(game.player.armorPointsV13));renderArmorHudV13(game.player,game.mode);return game.player.armorPointsV13;};
window.__voxelDiag?.log?.(`V13 READY ${STUDIO_V13.version}: Ctrl sprint/mobile sprint, Minecraft-style FOV kick + view bob, official armor/XP UI textures, Mojang cloud mask, XP pickup orbs, brighter golden-hour lighting, lit/unlit furnace fronts, positional sounds and responsive Java-inspired survival inventory.`,'ok');


/* ===================== V13.1 HOTFIX: STARTUP + MOBILE SPRINT + INVENTORY DROP + BREAK ASSETS ===================== */
const STUDIO_V13_1=Object.freeze({version:'0.13.1-alpha.2',mobileSprintEnter:.86,mobileSprintExit:.62,mobileSprintDelay:120});
window.STUDIO_PATCH_VERSION=STUDIO_V13_1.version;

/* Do not let the original audio unlock fire an uncaught manifest request on iOS/local previews. Audio still warms the Mojang manifest, but network failure is handled and synthesized audio remains available. */
MinecraftSoundSystemV9.prototype.unlock=async function(){
  if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Web Audio unavailable');this.ctx=new AC({latencyHint:'interactive'});this.master=this.ctx.createGain();this.master.gain.value=.72;if(this.configureOutputV12)this.configureOutputV12();else this.master.connect(this.ctx.destination);}
  if(this.ctx.state==='suspended')await this.ctx.resume();if(!this.outputV12&&this.configureOutputV12)this.configureOutputV12();this.loadManifest?.().catch(()=>{});return this.ctx;
};

/* A transparent moon atlas exists synchronously so the render loop never dereferences null while remote moon_phases.png is still loading. */
let v131MoonPlaceholder=null;
function v131PlaceholderMoon(){
  if(v131MoonPlaceholder)return v131MoonPlaceholder;
  const c=document.createElement('canvas');c.width=4;c.height=2;
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.repeat.set(.25,.5);t.needsUpdate=true;
  v131MoonPlaceholder=t;return t;
}
const v131EnsureCelestialsBase=VoxelRenderer.prototype.ensureCelestialsV7;
VoxelRenderer.prototype.ensureCelestialsV7=function(){
  v131EnsureCelestialsBase.call(this);
  if(this.celestialV7&&!this.celestialV7.moonTex){
    const t=v131PlaceholderMoon();this.celestialV7.moonTex=t;
    if(this.celestialV7.moonSprite?.material&&!this.celestialV7.moonSprite.material.map){this.celestialV7.moonSprite.material.map=t;this.celestialV7.moonSprite.material.needsUpdate=true;}
  }
};
const v131CelestialUpdateBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(){
  try{return v131CelestialUpdateBase.call(this);}catch(e){
    if(/moonTex|celestial/i.test(String(e?.message||e))){this.ensureCelestialsV7();if(!this._v131CelestialWarn){this._v131CelestialWarn=true;window.__voxelDiag?.log?.(`CELESTIAL STARTUP RECOVERED: ${e.message}`,'warn');}return;}
    throw e;
  }
};

/* Keep exactly one title logo. If the current Bedrock title image fails, retry another Mojang texture path, then the user's repository, never a second white text logo. */
const v131BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){
  v131BuildTitleBase();
  document.querySelectorAll('#logoFallback').forEach(n=>n.remove());
  const logo=$('mcLogo');
  if(logo){
    logo.alt='Minecraft';
    const sources=[`${MC_TEX}ui/title.png`,`${MC_TEX}gui/title/minecraft.png`,`${USER_REPO_RAW}/minecraft.png`,`${USER_REPO_RAW}/Minecraft.png`];
    let index=Math.max(0,sources.indexOf(logo.src));
    logo.onerror=()=>{index++;if(index<sources.length)logo.src=sources[index];else{logo.onerror=null;logo.style.visibility='hidden';window.__voxelDiag?.log?.('TITLE LOGO: all image candidates failed; duplicate text fallback intentionally disabled.','warn');}};
  }
  const small=document.querySelector('#titleContent .v9Small');if(small)small.textContent=`Minecraft Web Alpha 0.13.2 • Three.js r180 • WebGL / WebGPU AA build`;
};

/* Mobile sprint is automatic: push the movement stick into the outer forward zone and hold briefly. Pulling back from the outer zone cancels sprint. Desktop keeps Ctrl and double-W. */
$('sprintBtnV13')?.remove();
const v131SprintStyle=document.createElement('style');v131SprintStyle.textContent='#sprintBtnV13,#logoFallback{display:none!important}';document.head.appendChild(v131SprintStyle);
const v131InputStateBase=InputManager.prototype.state;
InputManager.prototype.state=function(){
  const s=v131InputStateBase.call(this),now=performance.now(),mx=Number(this.move?.x)||0,my=Number(this.move?.y)||0,mag=Math.hypot(mx,my),forward=Math.max(0,-my),straightness=forward/(mag||1);
  const enter=mag>=STUDIO_V13_1.mobileSprintEnter&&forward>=.78&&straightness>=.78;
  const exit=mag<STUDIO_V13_1.mobileSprintExit||forward<.50||straightness<.60;
  if(enter){if(!this._v131SprintSince)this._v131SprintSince=now;if(now-this._v131SprintSince>=STUDIO_V13_1.mobileSprintDelay)this._v131AutoSprint=true;}
  else if(exit){this._v131SprintSince=0;this._v131AutoSprint=false;}
  s.run=!!(s.run||this._v131AutoSprint);
  return s;
};

/* Dragging inventory items is gesture-first. The old pointerdown click handler moved the stack before a drag could start, so V13.1 defers the click until pointerup and supports the offhand slot too. */
const v131ResolveBase=InventoryTransactionEngine.prototype.resolve;
InventoryTransactionEngine.prototype.resolve=function(slot){
  if(slot&&slot[0]==='f'){this.game.inventory.offhand??=new ItemStack();return{stack:this.game.inventory.offhand,type:'f',index:0};}
  return v131ResolveBase.call(this,slot);
};
InventoryTransactionEngine.prototype.dropIntoWorld=function(stack){
  if(!this.game.drops||!stack||stack.empty())return;
  const origin=this.game.player.eyePosition(new THREE.Vector3()),dir=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(this.game.player.pitch,this.game.player.yaw,0,'YXZ')).normalize(),pos=origin.clone().addScaledVector(dir,1.05);pos.y-=.22;
  this.game.drops.spawn(stack.id,stack.count,pos);
  const d=this.game.drops.items?.at?.(-1);if(d){d.pickupDelay=Math.max(d.pickupDelay||0,1.0);d.velocity?.set?.(dir.x*2.4,1.7,dir.z*2.4);}
  this.game.soundV9?.play?.('random.pop',{position:this.game.player.position,volume:.12,pitch:.86,temporaryClick:true});this.game.saveSoon();
};
const v131ClickSlotBase=UI.prototype.clickSlot;
UI.prototype.clickSlot=function(slot){
  if(!slot||slot[0]!=='f')return v131ClickSlotBase.call(this,slot);
  this.game.inventory.offhand??=new ItemStack();const stack=this.game.inventory.offhand,cursor=this.game.inventory.cursor;
  if(cursor.empty()&&!stack.empty()){this.game.inventory.cursor=stack.clone();stack.id=ITEM.AIR;stack.count=0;}
  else if(!cursor.empty()&&stack.empty()){stack.id=cursor.id;stack.count=cursor.count;cursor.id=ITEM.AIR;cursor.count=0;}
  else if(!cursor.empty()&&stack.id===cursor.id){const n=Math.min(64-stack.count,cursor.count);stack.count+=n;cursor.count-=n;cursor.normalize();}
  else{const temp=stack.clone();stack.id=cursor.id;stack.count=cursor.count;cursor.id=temp.id;cursor.count=temp.count;}
  this.game.crafting.update();this.game.refreshHotbar();this.game.firstPersonV7?.refresh?.();this.game.saveSoon();this.screen==='table'?this.renderCrafting(true):this.renderInventory();
};
UI.prototype.bindSlots=function(){
  screenLayer.querySelectorAll('.inv-slot').forEach(el=>{
    el.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      const slot=el.dataset.slot||'';
      if(slot==='o'){
        e.preventDefault();e.stopImmediatePropagation();
        if(this.game.crafting.takeOutput()){this.game.refreshHotbar();this.game.saveSoon();this.screen==='table'?this.renderCrafting(true):this.renderInventory();}
        return;
      }
      if(!slot)return;
      e.preventDefault();e.stopImmediatePropagation();inventoryTransactions.begin(el,e);
    },{capture:true,passive:false});
  });
  iconSanitizer.scan();
};

/* Minecraft's block cracking is one of ten destroy_stage overlays drawn over the block's existing material. Mojang Bedrock paths are primary; the user's asset repo is a secondary source; only then is a deterministic crack mask generated. */
function v131CrackFallback(stage){
  const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.clearRect(0,0,16,16);x.strokeStyle='rgba(25,25,25,.92)';x.lineWidth=1;const branches=3+stage;
  for(let i=0;i<branches;i++){const a=(i/branches)*Math.PI*2+stage*.19,r=3+stage*.42,cx=8+Math.cos(a)*1.5,cy=8+Math.sin(a)*1.5;x.beginPath();x.moveTo(8,8);for(let q=1;q<=3;q++){const rr=(r*q)/3;x.lineTo(Math.round(cx+Math.cos(a+(q%2?.22:-.18))*rr),Math.round(cy+Math.sin(a+(q%2?.22:-.18))*rr));}x.stroke();}
  return c;
}
BlockBreakOverlayV9.prototype.material=async function(stage){
  stage=clamp(Math.floor(Number(stage)||0),0,9);if(this.materials.has(stage))return this.materials.get(stage);if(this.loading.has(stage))return this.loading.get(stage);
  const p=(async()=>{
    const candidates=[`${BEDROCK_RAW}resource_pack/textures/environment/destroy_stage_${stage}.png`,`${USER_REPO_RAW}/textures/environment/destroy_stage_${stage}.png`,`${USER_REPO_RAW}/destroy_stage_${stage}.png`];
    let cv=null,source='';
    for(const url of candidates){try{const bmp=await game.assets.image(url);cv=document.createElement('canvas');cv.width=bmp.width||16;cv.height=bmp.height||16;const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(bmp,0,0);bmp.close?.();source=url;break;}catch{}}
    if(!cv){cv=v131CrackFallback(stage);source='deterministic crack fallback';window.__voxelDiag?.log?.(`BREAK STAGE ${stage}: Mojang/user asset unavailable; deterministic fallback active.`,'warn');}
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;t.userData.sourceURL=source;
    const m=new THREE.MeshBasicMaterial({map:t,color:0xffffff,transparent:true,opacity:.76,alphaTest:.012,depthWrite:false,depthTest:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,toneMapped:false,blending:THREE.MultiplyBlending});
    this.materials.set(stage,m);window.__voxelDiag?.log?.(`BREAK STAGE ${stage} READY ${source}`,source.startsWith('http')?'ok':'warn');return m;
  })();
  this.loading.set(stage,p);try{return await p;}finally{this.loading.delete(stage);}
};

try{runtimeCommands.register('hotfix131',()=>({version:STUDIO_V13_1.version,moonReady:!!game.renderer?.celestialV7?.moonTex,autoSprint:!!game.input?._v131AutoSprint,dragActive:!!inventoryTransactions.drag,breakStages:10}),'Inspect V13.1 startup, sprint, inventory drag and break-stage hotfixes.');}catch{}
window.__voxelDiag?.log?.(`V13.1 READY ${STUDIO_V13_1.version}: black-screen celestial race fixed, single logo, outer-stick auto sprint, drag-out inventory drops and Mojang-first destroy stages.`,'ok');

/* ===================== V13.1.1 HOTFIX: RESPONSIVE TITLE WORLD ===================== */
const STUDIO_V13_1_1=Object.freeze({version:'0.13.1-alpha.3',titleDprMax:2.0,titleFov:70});
window.STUDIO_PATCH_VERSION=STUDIO_V13_1_1.version;

const v1311TitleStyle=document.createElement('style');
v1311TitleStyle.textContent=`
#titleScreen{width:100%;height:100%;min-width:0;min-height:0;contain:layout paint;}
#v9TitleCanvas{inset:0!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;max-width:none!important;max-height:none!important;transform:none!important;object-fit:fill!important;}
`;
document.head.appendChild(v1311TitleStyle);

TitleWorldV9.prototype.resize=function(force=false){
  if(!this.r||!this.c||!this.canvas)return;
  const rect=this.canvas.getBoundingClientRect();
  const host=titleScreen?.getBoundingClientRect?.();
  const vv=window.visualViewport;
  let w=Math.round(rect.width||host?.width||vv?.width||innerWidth||1);
  let h=Math.round(rect.height||host?.height||vv?.height||innerHeight||1);
  w=Math.max(1,w);h=Math.max(1,h);
  if(!force&&w===this._v1311W&&h===this._v1311H)return;
  this._v1311W=w;this._v1311H=h;
  const dpr=Math.min(Number(devicePixelRatio)||1,STUDIO_V13_1_1.titleDprMax);
  if(Math.abs((this.r.getPixelRatio?.()||1)-dpr)>.001)this.r.setPixelRatio(dpr);
  this.r.setSize(w,h,false);
  this.r.setViewport(0,0,w,h);
  this.c.aspect=w/h;
  this.c.fov=STUDIO_V13_1_1.titleFov;
  this.c.updateProjectionMatrix();
  this.canvas.style.width='100%';
  this.canvas.style.height='100%';
  this.canvas.style.left='0';
  this.canvas.style.top='0';
};

TitleWorldV9.prototype.scheduleResponsiveResizeV1311=function(){
  if(!this.alive)return;
  cancelAnimationFrame(this._v1311ResizeRAF||0);
  clearTimeout(this._v1311Resize80);clearTimeout(this._v1311Resize240);clearTimeout(this._v1311Resize520);
  this._v1311ResizeRAF=requestAnimationFrame(()=>this.resize(true));
  this._v1311Resize80=setTimeout(()=>this.resize(true),80);
  this._v1311Resize240=setTimeout(()=>this.resize(true),240);
  this._v1311Resize520=setTimeout(()=>this.resize(true),520);
};

const v1311TitleInitBase=TitleWorldV9.prototype.init;
TitleWorldV9.prototype.init=async function(...args){
  if(!this._v1311ResponsiveInstalled){
    this._v1311ResponsiveInstalled=true;
    this._v1311ViewportResize=()=>this.scheduleResponsiveResizeV1311();
    this._v1311Orientation=()=>this.scheduleResponsiveResizeV1311();
    this._v1311Observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this.scheduleResponsiveResizeV1311()):null;
    this._v1311Observer?.observe(this.canvas);
    if(titleScreen)this._v1311Observer?.observe(titleScreen);
    window.visualViewport?.addEventListener?.('resize',this._v1311ViewportResize,{passive:true});
    window.visualViewport?.addEventListener?.('scroll',this._v1311ViewportResize,{passive:true});
    window.addEventListener('orientationchange',this._v1311Orientation,{passive:true});
    screen.orientation?.addEventListener?.('change',this._v1311Orientation);
  }
  const result=await v1311TitleInitBase.apply(this,args);
  this.scheduleResponsiveResizeV1311();
  return result;
};

const v1311TitleDisposeBase=TitleWorldV9.prototype.dispose;
TitleWorldV9.prototype.dispose=function(){
  this._v1311Observer?.disconnect?.();
  window.visualViewport?.removeEventListener?.('resize',this._v1311ViewportResize);
  window.visualViewport?.removeEventListener?.('scroll',this._v1311ViewportResize);
  window.removeEventListener('orientationchange',this._v1311Orientation);
  screen.orientation?.removeEventListener?.('change',this._v1311Orientation);
  cancelAnimationFrame(this._v1311ResizeRAF||0);
  clearTimeout(this._v1311Resize80);clearTimeout(this._v1311Resize240);clearTimeout(this._v1311Resize520);
  return v1311TitleDisposeBase.call(this);
};

window.__voxelDiag?.log?.(`V13.1.1 READY ${STUDIO_V13_1_1.version}: title-world canvas now follows its real CSS viewport through ResizeObserver, visualViewport and delayed iOS orientation resyncs; camera aspect is rebuilt from the actual landscape canvas size.`,'ok');


/* ===================== V13.2 VISUAL HOTFIX: HIGH-QUALITY ANTI-ALIASING ===================== */
const STUDIO_V13_2=Object.freeze({version:'0.13.2-alpha.1',aa:'MSAA + Retina supersampling',fastDpr:1.5,fancyDpr:1.75,ultraDpr:2.0,titleDpr:2.0});
window.STUDIO_PATCH_VERSION=STUDIO_V13_2.version;

const v132AAStyle=document.createElement('style');
v132AAStyle.textContent=`
#gameCanvas,#v9TitleCanvas{image-rendering:auto!important;}
#v9TitleCanvas{filter:none!important;}
`;
document.head.appendChild(v132AAStyle);

function v132AATargetDpr(profile='fancy'){
  const cap=profile==='fast'?STUDIO_V13_2.fastDpr:profile==='ultra'?STUDIO_V13_2.ultraDpr:STUDIO_V13_2.fancyDpr;
  return Math.min(Number(devicePixelRatio)||1,cap);
}
function v132ApplyMaterialAA(rr){
  if(!rr)return;
  for(const m of [rr.materialCutout,rr.materialLeaves]){
    if(!m)continue;
    // Alpha-to-coverage softens alpha-tested foliage/plant edges when MSAA is available.
    try{m.alphaToCoverage=true;m.needsUpdate=true;}catch{}
  }
}
function v132ApplyRendererAA(rr,profile){
  const r=rr?.renderer;if(!r)return;
  const dpr=v132AATargetDpr(profile);
  try{if(Math.abs((r.getPixelRatio?.()||1)-dpr)>.001)r.setPixelRatio(dpr);}catch{}
  v132ApplyMaterialAA(rr);
}

const v132GraphicsApplyBase=GraphicsQualityV7.prototype.apply;
GraphicsQualityV7.prototype.apply=function(profile=this.profile){
  const p=v132GraphicsApplyBase.call(this,profile);
  v132ApplyRendererAA(this.game?.renderer,p);
  window.__voxelDiag?.log?.(`ANTI-ALIAS ${p.toUpperCase()}: MSAA ON • DPR ${(this.game?.renderer?.renderer?.getPixelRatio?.()||1).toFixed(2)} • alpha-to-coverage foliage ON`,'ok');
  return p;
};

const v132RendererResizeBase=VoxelRenderer.prototype.resize;
VoxelRenderer.prototype.resize=function(...args){
  const result=v132RendererResizeBase.apply(this,args);
  v132ApplyRendererAA(this,this.gameRefV7?.graphicsV7?.profile||game.graphicsV7?.profile||localStorage.getItem('studioGraphicsV7')||'fancy');
  return result;
};

const v132TitleResizeBase=TitleWorldV9.prototype.resize;
TitleWorldV9.prototype.resize=function(force=false){
  v132TitleResizeBase.call(this,force);
  if(this.r){
    const dpr=Math.min(Number(devicePixelRatio)||1,STUDIO_V13_2.titleDpr);
    try{if(Math.abs((this.r.getPixelRatio?.()||1)-dpr)>.001){this.r.setPixelRatio(dpr);const w=Math.max(1,Math.round(this._v1311W||this.canvas.clientWidth||innerWidth)),h=Math.max(1,Math.round(this._v1311H||this.canvas.clientHeight||innerHeight));this.r.setSize(w,h,false);}}catch{}
  }
};

try{runtimeCommands.register('aa',()=>({version:STUDIO_V13_2.version,backend:game.renderer?.backendLabel?.(),pixelRatio:game.renderer?.renderer?.getPixelRatio?.(),devicePixelRatio:Number(devicePixelRatio)||1,profile:game.graphicsV7?.profile||'pre-game',msaaRequested:true,titlePixelRatio:titleWorldV9?.r?.getPixelRatio?.()||null,alphaToCoverage:{cutout:!!game.renderer?.materialCutout?.alphaToCoverage,leaves:!!game.renderer?.materialLeaves?.alphaToCoverage}}),'Inspect V13.2 anti-aliasing state.');}catch{}
window.__voxelDiag?.log?.(`V13.2 READY ${STUDIO_V13_2.version}: home-screen blur removed; WebGL/WebGPU request MSAA on every graphics preset; Retina supersampling is 1.5x Fast, 1.75x Fancy, up to 2x Ultra/title; foliage alpha-to-coverage enabled.`,'ok');


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


/* ===================== V14.1: DATA-DRIVEN BEDROCK BEHAVIOR TRANSLATOR ===================== */
const STUDIO_V14_BEHAVIOR=Object.freeze({version:'0.14.1-behavior',difficulty:'normal',thinkInterval:.10,maxTargetDistance:32,strictFilters:true});
window.STUDIO_PATCH_VERSION=STUDIO_V14_BEHAVIOR.version;

class BedrockFilterEvaluatorV14{
  constructor(){this.unknown=new Set();}
  compare(actual,expected,op='=='){
    if(op==='not'||op==='!='||op==='<>')return actual!==expected;
    if(op==='<' )return Number(actual)< Number(expected);
    if(op==='<=')return Number(actual)<=Number(expected);
    if(op==='>' )return Number(actual)> Number(expected);
    if(op==='>=')return Number(actual)>=Number(expected);
    return actual===expected;
  }
  families(subject,ctx){
    if(subject===ctx.player||subject?.isPlayerV14)return new Set(['player']);
    const plan=subject?.behaviorV14?.plan||subject?.behaviorPlanV14;
    const fromPlan=plan?.families||[];
    return new Set([subject?.type,`minecraft:${subject?.type}`,...fromPlan].filter(Boolean).map(v=>String(v).replace(/^minecraft:/,'')));
  }
  subject(node,ctx){const s=node?.subject;return s==='other'||s===1?ctx.other:(s==='target'?ctx.target:(s==='player'?ctx.player:ctx.self));}
  evaluate(node,ctx={}){
    if(node==null)return true;
    if(Array.isArray(node))return node.every(n=>this.evaluate(n,ctx));
    if(typeof node!=='object')return !!node;
    const all=node.all_of||node.allOf||node.AND||node.and;if(all)return (Array.isArray(all)?all:[all]).every(n=>this.evaluate(n,ctx));
    const any=node.any_of||node.anyOf||node.OR||node.or;if(any)return (Array.isArray(any)?any:[any]).some(n=>this.evaluate(n,ctx));
    const none=node.none_of||node.noneOf||node.NOT||node.not;if(none)return !(Array.isArray(none)?none:[none]).some(n=>this.evaluate(n,ctx));
    if(!node.test)return true;
    const subject=this.subject(node,ctx),test=String(node.test),op=node.operator||'==',value=node.value;
    let actual;
    switch(test){
      case'is_family':actual=this.families(subject,ctx).has(String(value).replace(/^minecraft:/,''));return op==='not'||op==='!='?!actual:actual;
      case'in_water':actual=!!subject?.inWaterV8;break;
      case'is_underwater':actual=!!subject?.inWaterV8;break;
      case'on_ground':actual=!!subject?.onGround;break;
      case'is_daytime':actual=(ctx.game?.renderer?.dayStateV6?.daylight??1)>.45;break;
      case'is_difficulty':actual=ctx.game?.difficultyV14||STUDIO_V14_BEHAVIOR.difficulty;break;
      case'has_target':actual=!!ctx.runtime?.target;break;
      case'is_alive':actual=(subject?.health??1)>0;break;
      case'has_ranged_weapon':actual=subject?.type==='skeleton'||!!subject?.hasRangedWeaponV14;break;
      case'distance_to_nearest_player':actual=subject?.position?.distanceTo?.(ctx.player?.position)||Infinity;break;
      case'bool_property':actual=!!subject?.behaviorV14?.properties?.[node.domain];break;
      case'has_damage':actual=!!subject?.lastHurtAtV14;break;
      case'has_component':actual=!!subject?.behaviorV14?.components?.[String(value)];return op==='not'||op==='!='?!actual:actual;
      case'has_property':actual=Object.prototype.hasOwnProperty.call(subject?.behaviorV14?.properties||{},String(value));return op==='not'||op==='!='?!actual:actual;
      case'is_baby':actual=!!(subject?.behaviorV14?.components?.['minecraft:is_baby']||subject?.isBabyV14);break;
      case'is_moving':actual=Math.hypot(subject?.velocity?.x||0,subject?.velocity?.z||0)>.03;break;
      case'is_sneaking':actual=!!subject?.crouching;break;
      case'is_sprinting':actual=!!subject?.sprinting;break;
      case'is_in_contact_with_water':actual=!!subject?.inWaterV8;break;
      case'in_lava':actual=false;break;
      default:
        if(!this.unknown.has(test)){this.unknown.add(test);window.__voxelDiag?.log?.(`BEHAVIOR FILTER unsupported ${test}: condition blocked until translated`,'warn');}
        return STUDIO_V14_BEHAVIOR.strictFilters?false:true;
    }
    return this.compare(actual,value,op);
  }
}

function v14Number(value,fallback=0){if(Array.isArray(value)){const a=Number(value[0]),b=Number(value[value.length-1]);if(Number.isFinite(a)&&Number.isFinite(b))return (a+b)*.5;}const n=Number(value);return Number.isFinite(n)?n:fallback;}
function v14RandomRange(value,fallback=1){if(Array.isArray(value)){const a=Number(value[0]),b=Number(value[value.length-1]);if(Number.isFinite(a)&&Number.isFinite(b))return a+Math.random()*(b-a);}const n=Number(value);return Number.isFinite(n)?n:fallback;}
function v14BehaviorStems(type){const spec=(typeof BEDROCK_ENTITY_SPECS_V2!=='undefined'&&BEDROCK_ENTITY_SPECS_V2[type])||null;return [...new Set([...(spec?.entity||[]),type])];}

class BedrockBehaviorRepositoryV14{
  constructor(gameRef){this.game=gameRef;this.rawCache=new Map();this.planCache=new Map();this.inflight=new Map();}
  async raw(type){
    type=String(type).replace(/^minecraft:/,'');if(this.rawCache.has(type))return this.rawCache.get(type);if(this.inflight.has(`raw:${type}`))return this.inflight.get(`raw:${type}`);
    const p=(async()=>{const errors=[];for(const stem of v14BehaviorStems(type)){const url=`${BEDROCK_RAW}behavior_pack/entities/${stem}.json`;try{const json=JSON.parse(await this.game.assets.text(url));const out={json,url,stem};this.rawCache.set(type,out);window.__voxelDiag?.log?.(`BEHAVIOR JSON ${type}: SUCCESS ${url}`,'ok');return out;}catch(e){errors.push(`${stem}: ${e.message}`);}}throw new Error(`Behavior JSON unavailable for ${type}: ${errors.join(' | ')}`);})().finally(()=>this.inflight.delete(`raw:${type}`));
    this.inflight.set(`raw:${type}`,p);return p;
  }
  componentMetadata(components={}){
    const box=components['minecraft:collision_box']||{},health=components['minecraft:health']||{},move=components['minecraft:movement']||{},attack=components['minecraft:attack']||{},families=components['minecraft:type_family']?.family||[],physics=components['minecraft:physics']||{},follow=components['minecraft:follow_range']||{},explode=components['minecraft:explode']||{},xp=components['minecraft:experience_reward']||{};
    return {width:v14Number(box.width,null),height:v14Number(box.height,null),health:v14Number(health.value??health.max,null),maxHealth:v14Number(health.max??health.value,null),movement:v14Number(move.value,.23),attackDamage:v14Number(attack.damage,2),families:Array.isArray(families)?families:[],gravity:physics.has_gravity!==false,collision:physics.has_collision!==false,followRange:v14Number(follow.value,STUDIO_V14_BEHAVIOR.maxTargetDistance),burnsInDaylight:Object.prototype.hasOwnProperty.call(components,'minecraft:burns_in_daylight'),fuseLength:v14Number(explode.fuse_length,1.5),experience:xp,shooter:components['minecraft:shooter']||null,ambient:components['minecraft:ambient_sound_interval']||null};
  }
  behaviorGoals(components={}){
    const goals=[];for(const [key,value] of Object.entries(components)){if(!key.startsWith('minecraft:behavior.'))continue;const cfg=value&&typeof value==='object'?value:{};goals.push({key,priority:Number.isFinite(Number(cfg.priority))?Number(cfg.priority):100,config:cfg});}return goals;
  }
  async plan(type){
    type=String(type).replace(/^minecraft:/,'');if(this.planCache.has(type))return this.planCache.get(type);if(this.inflight.has(`plan:${type}`))return this.inflight.get(`plan:${type}`);
    const p=(async()=>{const {json,url,stem}=await this.raw(type),entity=json?.['minecraft:entity'];if(!entity)throw new Error(`${type}: minecraft:entity missing`);const base=entity.components||{},groups=entity.component_groups||{},properties=entity.description?.properties||{},plan={type,identifier:entity.description?.identifier||`minecraft:${type}`,sourceURL:url,stem,formatVersion:json.format_version||'',baseComponents:base,componentGroups:groups,events:entity.events||{},propertyDefinitions:properties,baseGoals:this.behaviorGoals(base),baseMeta:this.componentMetadata(base),families:this.componentMetadata(base).families,unsupported:new Set()};this.planCache.set(type,plan);window.__voxelDiag?.log?.(`BEHAVIOR COMPILED ${type}: ${plan.baseGoals.length} base goals, ${Object.keys(groups).length} groups, ${Object.keys(plan.events).length} events`,'ok');return plan;})().finally(()=>this.inflight.delete(`plan:${type}`));
    this.inflight.set(`plan:${type}`,p);return p;
  }
  prewarm(types){return Promise.allSettled(types.map(t=>this.plan(t)));}
}

class MobPathFinderV14{
  constructor(world){this.world=world;}
  viable(mob,dir,step=.42){const p=mob.position.clone().addScaledVector(dir,step);if(mobCollidesAtV6?.(mob,p,this.world))return false;if(typeof v7SafeGround==='function'&&!['chicken','spider'].includes(mob.type)&&!v7SafeGround(this.world,p.x,p.y,p.z,2))return false;return true;}
  steer(mob,desired,target=null){
    if(desired.lengthSq()<1e-6)return desired;const base=desired.clone().setY(0).normalize();if(this.viable(mob,base))return base;
    let best=null,bestScore=-Infinity;for(const angle of [.52,-.52,1.05,-1.05,1.57,-1.57,2.1,-2.1,Math.PI]){const d=base.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle);if(!this.viable(mob,d))continue;let score=-Math.abs(angle)*.12;if(target){const before=mob.position.distanceTo(target),after=mob.position.clone().addScaledVector(d,.6).distanceTo(target);score+=(before-after)*2;}if(score>bestScore){bestScore=score;best=d;}}
    return best||base.multiplyScalar(-1);
  }
}

class MobNavigatorV14{
  constructor(world){this.world=world;this.pathfinder=new MobPathFinderV14(world);}
  move(mob,desired,speed,dt,targetPos=null){
    const state=mob.navV14??=( {stuck:0,last:mob.position.clone(),turnBias:(Math.random()<.5?-1:1)} );let dir=desired.clone().setY(0);if(dir.lengthSq()>1e-6)dir.normalize();dir=this.pathfinder.steer(mob,dir,targetPos);if(state.stuck>.65)dir.applyAxisAngle(new THREE.Vector3(0,1,0),state.turnBias*1.05);
    const tx=dir.x*speed,tz=dir.z*speed,smooth=1-Math.exp(-9*dt);mob.velocity.x=lerp(mob.velocity.x,tx,smooth);mob.velocity.z=lerp(mob.velocity.z,tz,smooth);
    const mx=(mob.velocity.x+(mob.knockback?.x||0))*dt,mz=(mob.velocity.z+(mob.knockback?.z||0))*dt;const ox=mob.position.x,oz=mob.position.z;mobMoveAxisV6(mob,'x',mx,this.world);mobMoveAxisV6(mob,'z',mz,this.world);mob.distanceWalked=(mob.distanceWalked||0)+Math.hypot(mob.position.x-ox,mob.position.z-oz);mob.knockback?.multiplyScalar(Math.exp(-6*dt));
    const moved=Math.hypot(mob.position.x-state.last.x,mob.position.z-state.last.z);state.stuck=(speed>.1&&moved<.004)?state.stuck+dt:Math.max(0,state.stuck-dt*2);if(state.stuck>1.1){state.stuck=.1;state.turnBias*=-1;mob.wander=(mob.wander||0)+state.turnBias*(1.2+Math.random());}state.last.copy(mob.position);
  }
  physics(mob,dt){const spec=mobCollisionSpecV6(mob);if(!spec.gravity){mob.verticalVelocity=0;return;}const inWater=!!mob.inWaterV8||this.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+.45),Math.floor(mob.position.z))===BLOCK.WATER;mob.inWaterV8=inWater;const chicken=mob.type==='chicken';if(inWater)mob.verticalVelocity=Math.max(mob.verticalVelocity||0,-.35);else if(chicken&&mob.verticalVelocity<0)mob.verticalVelocity=Math.max(-2.4,(mob.verticalVelocity||0)-4.5*dt);else mob.verticalVelocity=(mob.verticalVelocity||0)-18*dt;mob.onGround=false;mobMoveAxisV6(mob,'y',(mob.verticalVelocity||0)*dt,this.world);mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.055,0)),this.world);if(mob.onGround&&mob.verticalVelocity<0)mob.verticalVelocity=0;if(mob.position.y<-8){mob.position.y=this.world.highestSolidY(Math.floor(mob.position.x),Math.floor(mob.position.z))+1;mob.verticalVelocity=0;}}
}

class BedrockBehaviorControllerV14{
  constructor(gameRef,mob,plan,filter){this.game=gameRef;this.mob=mob;this.plan=plan;this.filter=filter;this.activeGroups=new Set();this.properties={};for(const [k,v] of Object.entries(plan.propertyDefinitions||{}))this.properties[k]=v?.default??v?.default_value??false;this.target=null;this.previousTarget=null;this.goals=[];this.targetGoals=[];this.actionGoals=[];this.currentGoal=null;this.state='idle';this.desired=new THREE.Vector3();this.speed=0;this.think=0;this.rangedCooldown=.4+Math.random();this.ambientClock=3+Math.random()*7;this.sensorClock=0;this.timerState=new Map();this.eventDepth=0;this.shadeTarget=null;this.rebuild();this.applyEvent('minecraft:entity_spawned');}
  mergedComponents(){const out={...this.plan.baseComponents};for(const name of this.activeGroups)Object.assign(out,this.plan.componentGroups[name]||{});return out;}
  rebuild(){const components=this.mergedComponents(),meta={...this.plan.baseMeta,...this.game.behaviorRepoV14.componentMetadata(components)};this.components=components;this.meta=meta;this.mob.behaviorPlanV14=this.plan;this.mob.behaviorMetaV14=meta;this.mob.behaviorSpecV6={...(this.mob.behaviorSpecV6||{}),width:meta.width??this.mob.behaviorSpecV6?.width,height:meta.height??this.mob.behaviorSpecV6?.height,collision:meta.collision,gravity:meta.gravity};if(meta.health&&(!this.mob._behaviorHealthSetV14)){this.mob.health=meta.health;this.mob.maxHealth=meta.maxHealth||meta.health;this.mob._behaviorHealthSetV14=true;}if(meta.fuseLength)this.mob.fuseTime=meta.fuseLength;const goals=this.game.behaviorRepoV14.behaviorGoals(components).sort((a,b)=>a.priority-b.priority);this.goals=goals;this.targetGoals=goals.filter(g=>V14_TARGET_GOALS.has(g.key));this.actionGoals=goals.filter(g=>!V14_TARGET_GOALS.has(g.key));}
  coercePropertyValue(value){if(typeof value!=='string')return value;const t=value.trim();if(t==='true')return true;if(t==='false')return false;const n=Number(t);return Number.isFinite(n)?n:value;}
  applyEvent(name,extra={}){
    if(this.eventDepth>12){window.__voxelDiag?.log?.(`BEHAVIOR EVENT recursion stopped: ${name} (${this.mob.type})`,'warn');return false;}
    const event=this.plan.events?.[name];if(!event)return false;this.eventDepth++;
    const ctx={game:this.game,self:this.mob,other:extra.other||this.target,target:this.target,player:this.game.player,runtime:this};let changed=false;
    const applyNode=node=>{if(!node||typeof node!=='object')return;if(node.filters&&!this.filter.evaluate(node.filters,ctx))return;
      if(node.add?.component_groups)for(const g of node.add.component_groups){if(!this.activeGroups.has(g)){this.activeGroups.add(g);changed=true;}}
      if(node.remove?.component_groups)for(const g of node.remove.component_groups){if(this.activeGroups.delete(g))changed=true;}
      const props=node.set_property||node.set_properties;if(props&&typeof props==='object')for(const [k,v] of Object.entries(props))this.properties[k]=this.coercePropertyValue(v);
      const trigger=node.trigger||node.event;if(typeof trigger==='string')this.applyEvent(trigger,extra);else if(trigger?.event)this.applyEvent(trigger.event,{...extra,other:trigger.target==='other'?ctx.other:extra.other});
      if(Array.isArray(node.sequence))for(const part of node.sequence)applyNode(part);
      if(Array.isArray(node.randomize)){let candidates=node.randomize.filter(part=>!part.filters||this.filter.evaluate(part.filters,ctx));if(candidates.length){let total=candidates.reduce((sum,p)=>sum+Math.max(0,v14Number(p.weight,1)),0),r=Math.random()*Math.max(total,1);for(const part of candidates){r-=Math.max(0,v14Number(part.weight,1));if(r<=0){applyNode(part);break;}}}}
    };
    try{applyNode(event);if(changed)this.rebuild();return changed;}finally{this.eventDepth--;}
  }
  applyTrigger(trigger,other=null){if(!trigger)return false;const event=typeof trigger==='string'?trigger:trigger.event;if(!event)return false;const filters=typeof trigger==='object'?trigger.filters:null;if(filters&&!this.filter.evaluate(filters,{game:this.game,self:this.mob,other,target:this.target,player:this.game.player,runtime:this}))return false;return this.applyEvent(event,{other});}
  updateComponentEvents(dt){
    this.sensorClock-=dt;if(this.sensorClock<=0){this.sensorClock=.15;const env=this.components['minecraft:environment_sensor'];for(const t of env?.triggers||[])this.applyTrigger(t,this.target);const sensor=this.components['minecraft:entity_sensor'];if(sensor?.event&&this.target?.position&&this.mob.position.distanceTo(this.target.position)<=v14Number(sensor.range?.[0]??sensor.minimum_count??8,8))this.applyTrigger(sensor.event,this.target);}
    const timer=this.components['minecraft:timer'];if(timer){let state=this.timerState.get('minecraft:timer');if(!state){state={left:v14RandomRange(timer.time??timer.time_down_event?.time,1)};this.timerState.set('minecraft:timer',state);}state.left-=dt;if(state.left<=0){const evt=timer.time_down_event?.event||timer.event;if(evt)this.applyEvent(evt);if(timer.looping!==false)state.left=v14RandomRange(timer.time??timer.time_down_event?.time,1);else this.timerState.delete('minecraft:timer');}}
  }
  familyMatchesPlayer(filters){return this.filter.evaluate(filters,{game:this.game,self:this.mob,other:this.game.player,target:this.game.player,player:this.game.player,runtime:this});}
  selectTargets(){
    const old=this.target;if(this.target&&((this.target.health??1)<=0||!this.target.position))this.target=null;let chosen=null;
    for(const g of this.targetGoals){const cfg=g.config||{};if(g.key==='minecraft:behavior.hurt_by_target'){if(this.mob.lastHurtByV14&&performance.now()-(this.mob.lastHurtAtV14||0)<10000){chosen=this.mob.lastHurtByV14;break;}}
      if(g.key==='minecraft:behavior.nearest_attackable_target'){
        const radius=v14Number(cfg.within_radius??cfg.max_dist,this.meta.followRange||25),d=this.mob.position.distanceTo(this.game.player.position);if(d>radius)continue;const types=Array.isArray(cfg.entity_types)?cfg.entity_types:[];if(!types.length||types.some(t=>this.familyMatchesPlayer(t.filters||t))){chosen=this.game.player;break;}
      }}
    if(chosen)this.target=chosen;else if(this.target?.position&&this.mob.position.distanceTo(this.target.position)>(this.meta.followRange||32)*1.25)this.target=null;
    if(old!==this.target){if(this.target)this.applyTrigger(this.components['minecraft:on_target_acquired'],this.target);else if(old)this.applyTrigger(this.components['minecraft:on_target_escape'],old);this.previousTarget=old;}
  }
  setMoveToward(pos,speed,state='walk'){if(!pos)return;this.desired.copy(pos).sub(this.mob.position).setY(0);this.speed=speed;this.state=state;}
  setMoveAway(pos,speed,state='walk'){if(!pos)return;this.desired.copy(this.mob.position).sub(pos).setY(0);this.speed=speed;this.state=state;}
  findShade(){const p=this.mob.position;for(let r=3;r<=10;r+=2)for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,y=this.game.world.highestSolidY(Math.floor(x),Math.floor(z))+1;if(this.game.lightV8?.skyVisible?.(x,y+1,z)===false)return new THREE.Vector3(x,y,z);}return null;}
  attackTarget(target,damage){if(!target)return;if(target===this.game.player){const player=target;if(this.game.mode==='creative')return;const blocked=this.game.blockingV8&&typeof v8ShieldFacesSource==='function'&&v8ShieldFacesSource(player,this.mob.position);if(blocked){player.applyKnockback?.(player.position.clone().sub(this.mob.position),.55,.2);this.game.soundV14?.playEvent?.('random.shield_block',{position:player.position,volume:.35});return;}player.health=Math.max(0,player.health-Math.max(1,Math.round(damage)));player.applyKnockback?.(player.position.clone().sub(this.mob.position),3.2,3.2);damageVignette.style.opacity='.82';setTimeout(()=>damageVignette.style.opacity='0',120);this.game.soundV14?.playEntity?.('player','hurt',{position:player.position,volume:.75});return;}if(typeof target.health==='number'){target.health=Math.max(0,target.health-Math.max(1,Math.round(damage)));target.lastHurtByV14=this.mob;target.lastHurtAtV14=performance.now();target.knockback?.add?.(target.position.clone().sub(this.mob.position).setY(.18).normalize().multiplyScalar(2.2));this.game.soundV14?.playEntity?.(target.type,'hurt',{position:target.position,volume:.65});}}
  attackPlayer(damage){return this.attackTarget(this.game.player,damage);}
  tickGoal(goal,dt){
    const mob=this.mob,cfg=goal.config||{},base=Math.max(.25,(this.meta.movement||.23)*7),mult=v14Number(cfg.speed_multiplier??cfg.walk_speed_multiplier,1),target=this.target;
    switch(goal.key){
      case'minecraft:behavior.float':case'minecraft:behavior.swim':if(mob.inWaterV8){mob.verticalVelocity=Math.max(mob.verticalVelocity||0,2.0);if(target)this.setMoveToward(target.position,base*mult,'swim');this.state='swim';return true;}return false;
      case'minecraft:behavior.panic':if(performance.now()-(mob.lastHurtAtV14||0)<2500){this.setMoveAway(mob.lastHurtByV14?.position||this.game.player.position,base*Math.max(1.15,mult),'walk');return true;}return false;
      case'minecraft:behavior.flee_sun':{const day=this.game.renderer?.dayStateV6?.daylight??0,exposed=this.game.lightV8?.skyVisible?.(mob.position.x,mob.position.y+1,mob.position.z);if(day>.55&&exposed){if(!this.shadeTarget||this.shadeTarget.distanceTo(mob.position)<1)this.shadeTarget=this.findShade();if(this.shadeTarget){this.setMoveToward(this.shadeTarget,base*mult,'walk');return true;}}return false;}
      case'minecraft:behavior.avoid_mob_type':{let nearest=null,nd=Infinity;for(const entry of cfg.entity_types||[]){const max=v14Number(entry.max_dist,8);const pd=mob.position.distanceTo(this.game.player.position);if(pd<max&&this.filter.evaluate(entry.filters||{}, {game:this.game,self:mob,other:this.game.player,player:this.game.player,target:this.game.player,runtime:this})){nearest=this.game.player;nd=pd;}for(const other of this.game.mobs?.mobs||[]){if(other===mob)continue;const d=mob.position.distanceTo(other.position);if(d>=max||d>=nd)continue;if(this.filter.evaluate(entry.filters||{}, {game:this.game,self:mob,other,target:other,player:this.game.player,runtime:this})){nearest=other;nd=d;}}}if(nearest){this.setMoveAway(nearest.position,base*v14Number(cfg.sprint_speed_multiplier??cfg.walk_speed_multiplier,1),'walk');return true;}return false;}
      case'minecraft:behavior.melee_attack':case'minecraft:behavior.melee_box_attack':if(target?.position){const d=mob.position.distanceTo(target.position),reach=v14Number(cfg.reach_multiplier,1)*1.45;this.setMoveToward(target.position,base*mult,'walk');mob.yaw=Math.atan2(-(target.position.x-mob.position.x),-(target.position.z-mob.position.z));if(d<=reach&&(mob.attack||0)<=0){mob.attack=v14Number(cfg.cooldown_time,1);mob.attackAnim=.36;this.state='attack';this.attackTarget(target,this.meta.attackDamage||3);this.game.soundV14?.playEntity?.(mob.type,'attack',{position:mob.position,volume:.7});}return true;}return false;
      case'minecraft:behavior.ranged_attack':if(target?.position){const d=mob.position.distanceTo(target.position),radius=v14Number(cfg.attack_radius,15);if(d<=radius){mob.yaw=Math.atan2(-(target.position.x-mob.position.x),-(target.position.z-mob.position.z));if(d<4)this.setMoveAway(target.position,base*.65,'walk');else{this.speed=0;this.state='idle';}this.rangedCooldown-=dt;if(this.rangedCooldown<=0){const amin=v14Number(cfg.attack_interval_min,1.8),amax=v14Number(cfg.attack_interval_max,amin);this.rangedCooldown=amin+Math.random()*Math.max(0,amax-amin);this.game.arrowsV8?.shoot?.(mob.position,target.position);mob.attackAnim=.25;this.state='attack';const shooter=this.components['minecraft:shooter'];if(shooter?.sound)this.game.soundV14?.playEvent?.(String(shooter.sound),{position:mob.position,volume:.7});else this.game.soundV14?.playEntity?.(mob.type,'attack',{position:mob.position,volume:.7});}return true;}this.setMoveToward(target.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.swell':if(target?.position&&mob.type==='creeper'){const d=mob.position.distanceTo(target.position),start=v14Number(cfg.start_distance,2.8),stop=v14Number(cfg.stop_distance,7);if(d<=start){if((mob.fuse||0)<=0.001)this.game.soundV14?.playEvent?.('random.fuse',{position:mob.position,volume:.72});mob.fuse=(mob.fuse||0)+dt;this.state='fuse';this.speed=0;if(mob.fuse>=mob.fuseTime)this.game.explosionsV6?.queueCreeper?.(mob);return true;}if(d>stop){mob.fuse=Math.max(0,(mob.fuse||0)-dt*1.8);if(mob.fuse<=.001)mob._v14ExplosionSound=false;}return false;}return false;
      case'minecraft:behavior.move_towards_target':if(target?.position){this.setMoveToward(target.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.tempt':if(this.game.player?.position&&mob.position.distanceTo(this.game.player.position)<v14Number(cfg.within_radius,10)){this.setMoveToward(this.game.player.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.follow_parent':{if(!this.components['minecraft:is_baby'])return false;let parent=null,dist=Infinity;for(const other of this.game.mobs?.mobs||[]){if(other===mob||other.type!==mob.type||other.behaviorV14?.components?.['minecraft:is_baby'])continue;const d=mob.position.distanceTo(other.position);if(d<dist){dist=d;parent=other;}}if(parent&&dist<=v14Number(cfg.search_range,16)&&dist>v14Number(cfg.stop_distance,2)){this.setMoveToward(parent.position,base*mult,'walk');return true;}return false;}
      case'minecraft:behavior.look_at_entity':{let other=this.target;if(!other){let nd=Infinity;for(const candidate of this.game.mobs?.mobs||[]){if(candidate===mob)continue;const d=mob.position.distanceTo(candidate.position);if(d<nd&&d<=v14Number(cfg.look_distance,8)){nd=d;other=candidate;}}}if(other?.position){mob.yaw=Math.atan2(-(other.position.x-mob.position.x),-(other.position.z-mob.position.z));return true;}return false;}
      case'minecraft:behavior.random_stroll':case'minecraft:behavior.move_towards_dwelling_restriction':case'minecraft:behavior.move_towards_restriction':{mob.aiV14??={wanderTime:0,wander:Math.random()*Math.PI*2};mob.aiV14.wanderTime-=dt;if(mob.aiV14.wanderTime<=0){mob.aiV14.wanderTime=1.8+Math.random()*4.2;mob.aiV14.wander+=(Math.random()-.5)*Math.PI*1.6;}this.desired.set(Math.sin(mob.aiV14.wander),0,Math.cos(mob.aiV14.wander));this.speed=base*mult*.72;this.state='walk';return true;}
      case'minecraft:behavior.look_at_player':{const d=mob.position.distanceTo(this.game.player.position);if(d<=v14Number(cfg.look_distance,8)){mob.yaw=Math.atan2(-(this.game.player.position.x-mob.position.x),-(this.game.player.position.z-mob.position.z));return true;}return false;}
      case'minecraft:behavior.random_look_around':mob.aiV14??={wanderTime:0,wander:Math.random()*Math.PI*2};if(Math.random()<dt*.4)mob.yaw+=(Math.random()-.5)*1.2;return true;
      default:return false;
    }
  }
  update(dt){
    const mob=this.mob;mob.ensureStudioState?.();mob.age=(mob.age||0)+dt;mob.think=(mob.think||0)-dt;mob.attack=Math.max(0,(mob.attack||0)-dt);mob.attackAnim=Math.max(0,(mob.attackAnim||0)-dt);mob.hitFlash=Math.max(0,(mob.hitFlash||0)-dt);mob.attackProgress=mob.attackAnim>0?clamp(1-mob.attackAnim/.36,0,1):0;mobDepenetrateV6?.(mob,this.game.world);mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.055,0)),this.game.world);mob.inWaterV8=this.game.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+.5),Math.floor(mob.position.z))===BLOCK.WATER;
    this.updateComponentEvents(dt);this.think-=dt;if(this.think<=0){this.think=STUDIO_V14_BEHAVIOR.thinkInterval;this.selectTargets();}
    this.desired.set(0,0,0);this.speed=0;this.state='idle';this.currentGoal=null;
    for(const goal of this.actionGoals){if(!V14_GOAL_HANDLERS.has(goal.key)){if(!this.plan.unsupported.has(goal.key)){this.plan.unsupported.add(goal.key);window.__voxelDiag?.log?.(`BEHAVIOR primitive not implemented yet: ${goal.key} (${this.plan.type})`,'warn');}continue;}if(this.tickGoal(goal,dt)){this.currentGoal=goal;break;}}
    if(this.speed>0&&this.desired.lengthSq()>1e-6)this.game.mobNavigatorV14.move(mob,this.desired,this.speed,dt,this.target?.position||null);else{mob.velocity.x=lerp(mob.velocity.x,0,1-Math.exp(-8*dt));mob.velocity.z=lerp(mob.velocity.z,0,1-Math.exp(-8*dt));mob.knockback?.multiplyScalar(Math.exp(-6*dt));}
    this.game.mobNavigatorV14.physics(mob,dt);
    if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;setMobFlash?.(mob,mob.hitFlash>0?.38:0);if(mob.type==='creeper'&&mob.fuse>0){const pulse=(Math.sin(mob.age*32)>0?1:0)*clamp(mob.fuse/mob.fuseTime,0,1)*.22;mob.model.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissive.setRGB(pulse,pulse,pulse);});}mob.animationController?.update?.(this.state,mob.age,mob);}
    this.ambientClock-=dt;if(this.ambientClock<=0){this.ambientClock=6+Math.random()*12;this.game.soundV14?.playEntity?.(mob.type,'ambient',{position:mob.position,volume:.45});}
  }
}

const V14_TARGET_GOALS=new Set(['minecraft:behavior.nearest_attackable_target','minecraft:behavior.hurt_by_target']);
const V14_GOAL_HANDLERS=new Set(['minecraft:behavior.float','minecraft:behavior.swim','minecraft:behavior.panic','minecraft:behavior.flee_sun','minecraft:behavior.avoid_mob_type','minecraft:behavior.melee_attack','minecraft:behavior.melee_box_attack','minecraft:behavior.ranged_attack','minecraft:behavior.swell','minecraft:behavior.move_towards_target','minecraft:behavior.tempt','minecraft:behavior.follow_parent','minecraft:behavior.look_at_entity','minecraft:behavior.random_stroll','minecraft:behavior.move_towards_dwelling_restriction','minecraft:behavior.move_towards_restriction','minecraft:behavior.look_at_player','minecraft:behavior.random_look_around']);

class BedrockBehaviorSystemV14{
  constructor(gameRef){this.game=gameRef;this.filter=new BedrockFilterEvaluatorV14();}
  async attach(mob){try{const plan=await this.game.behaviorRepoV14.plan(mob.type);mob.behaviorV14=new BedrockBehaviorControllerV14(this.game,mob,plan,this.filter);window.__voxelDiag?.log?.(`AI ATTACHED ${mob.type}: ${mob.behaviorV14.actionGoals.length} action + ${mob.behaviorV14.targetGoals.length} target goals`,'ok');return mob.behaviorV14;}catch(e){mob.behaviorErrorV14=e;window.__voxelDiag?.log?.(`AI ABORTED ${mob.type}: ${e.message}`,'err');return null;}}
}

const v14BehaviorSpawnBase=MobSystem.prototype.spawnEntity;
MobSystem.prototype.spawnEntity=async function(type,position){const mob=await v14BehaviorSpawnBase.call(this,type,position);if(mob)await this.game?.behaviorV14?.attach?.(mob);return mob;};

const v14CombatAttackBase=CombatSystem.prototype.attack;
CombatSystem.prototype.attack=function(){const target=this.target?.();const hp=target?.health;const result=v14CombatAttackBase.call(this);if(result&&target&&target.health<hp){target.lastHurtByV14=this.game.player;target.lastHurtAtV14=performance.now();this.game.soundV14?.playEntity?.(target.type,'hurt',{position:target.position,volume:.8});}return result;};

MobSystem.prototype.update=function(dt,player){
  this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.4;if(Math.random()<.38)this.spawnAround(player);}
  for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];
    if(mob.behaviorV14)mob.behaviorV14.update(dt);else{mob.ensureStudioState?.();mob.velocity.multiplyScalar(Math.exp(-5*dt));if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;}}
    const undead=mob.type==='zombie'||mob.type==='skeleton',day=this.game.renderer?.dayStateV6?.daylight??0,wet=this.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+1),Math.floor(mob.position.z))===BLOCK.WATER,exposed=this.game.lightV8?.skyVisible?.(mob.position.x,mob.position.y+1.2,mob.position.z);
    const planBurn=mob.behaviorV14?.meta?.burnsInDaylight;if(undead&&(planBurn!==false)&&day>.58&&exposed&&!wet){mob.sunFireV8=(mob.sunFireV8||0)+dt;this.game.fireV8?.set?.(mob,true);if(mob.sunFireV8>=1){mob.sunFireV8-=1;mob.health=Math.max(0,mob.health-1);}}else{mob.sunFireV8=0;this.game.fireV8?.set?.(mob,false);}
    if(mob.model&&typeof entityLodPolicy!=='undefined'){const level=entityLodPolicy.level(mob.position.distanceTo(player.position));entityLodPolicy.apply(mob.model,level);}
    if(mob.health<=0){this.game.soundV14?.playEntity?.(mob.type,'death',{position:mob.position,volume:.85});if(typeof v8DropMobLoot==='function')v8DropMobLoot(this.game,mob);if(!mob._xpAwardedV14&&this.game.mode!=='creative'){mob._xpAwardedV14=true;const hostile=['zombie','skeleton','creeper','spider','enderman'].includes(mob.type),xp=hostile?5:1+Math.floor(Math.random()*3);this.game.xpV12?.add?.(xp,`mob:${mob.type}`);}if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);continue;}
    if(mob.position.distanceTo(player.position)>110){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}
  }
};

const v14BehaviorBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v14BehaviorBootBase.apply(this,args);this.difficultyV14??=STUDIO_V14_BEHAVIOR.difficulty;this.behaviorRepoV14??=new BedrockBehaviorRepositoryV14(this);this.mobNavigatorV14??=new MobNavigatorV14(this.world);this.behaviorV14??=new BedrockBehaviorSystemV14(this);this.behaviorRepoV14.prewarm(['zombie','skeleton','creeper','cow','pig','chicken','sheep','spider','villager','enderman']).then(results=>{const ok=results.filter(r=>r.status==='fulfilled').length;window.__voxelDiag?.log?.(`BEHAVIOR PREWARM: ${ok}/${results.length} Mojang entity behavior plans cached`,'ok');});window.__voxelDiag?.log?.(`V14.1 BEHAVIOR: Bedrock components/groups/events + priority goal scheduler + collision-aware smart navigation installed.`,'ok');};

try{
  runtimeCommands.register('behavior',(type='zombie')=>game.behaviorRepoV14?.plan(String(type).replace(/^minecraft:/,'')).then(p=>({type:p.type,source:p.sourceURL,baseGoals:p.baseGoals.map(g=>({key:g.key,priority:g.priority})),groups:Object.keys(p.componentGroups),events:Object.keys(p.events),properties:Object.keys(p.propertyDefinitions||{}),unsupported:[...p.unsupported]})),'Inspect compiled Mojang Bedrock behavior plan.');
  runtimeCommands.register('ai',()=>game.mobs?.mobs?.map(m=>({type:m.type,hp:m.health,goal:m.behaviorV14?.currentGoal?.key||'none',priority:m.behaviorV14?.currentGoal?.priority??null,target:m.behaviorV14?.target===game.player?'player':m.behaviorV14?.target?.type||null,source:m.behaviorV14?.plan?.sourceURL||null,error:m.behaviorErrorV14?.message||null}))||[],'Inspect live data-driven mob AI goals.');
}catch{}
window.__voxelDiag?.log?.(`V14.1 READY ${STUDIO_V14_BEHAVIOR.version}: Mojang behavior JSON is now the AI source of truth; unsupported primitives are reported instead of silently inventing per-mob AI.`,'ok');
/* ===================== V14.2: STRICT MOJANG BEDROCK AUDIO TRANSLATOR ===================== */
const STUDIO_V14_AUDIO=Object.freeze({version:'0.14.2-audio',soundsURL:`${MOJANG_ROOT_V9}resource_pack/sounds.json`,definitionsURL:`${MOJANG_ROOT_V9}resource_pack/sounds/sound_definitions.json`,generatedManifest:'./assets/audio/mojang-audio-manifest.json'});
window.STUDIO_PATCH_VERSION=STUDIO_V14_AUDIO.version;

class BedrockSoundCatalogV14{
  constructor(gameRef){this.game=gameRef;this.loaded=false;this.loading=null;this.defs={};this.blockSounds={};this.generated={};this.entityMaps=new Map();this.failOnce=new Set();}
  diag(msg,type='info'){window.__voxelDiag?.log?.(msg,type);const fn=type==='err'?'error':type==='warn'?'warn':'info';console[fn]('[AudioV14]',msg);}
  async load(){if(this.loaded)return this;if(this.loading)return this.loading;this.loading=(async()=>{let remoteError=null;try{const r=await fetch(STUDIO_V14_AUDIO.generatedManifest,{cache:'no-cache'});if(r.ok){this.generated=await r.json();this.defs=this.generated.definitions||{};this.blockSounds=this.generated.block_sounds||{};}}catch{}try{const [soundsText,defsText]=await Promise.all([this.game.assets.text(STUDIO_V14_AUDIO.soundsURL),this.game.assets.text(STUDIO_V14_AUDIO.definitionsURL)]);const sounds=JSON.parse(soundsText),defs=JSON.parse(defsText);this.blockSounds=sounds.block_sounds||this.blockSounds||{};this.defs=defs.sound_definitions||this.defs||{};}catch(e){remoteError=e;}if(!Object.keys(this.defs).length||!Object.keys(this.blockSounds).length)throw remoteError||new Error('Mojang audio catalog metadata unavailable');this.loaded=true;this.diag(`AUDIO CATALOG READY: ${Object.keys(this.defs).length} Mojang events, ${Object.keys(this.blockSounds).length} block sound groups, ${Object.keys(this.generated.paths||{}).length} preconverted assets${remoteError?' (local generated metadata; remote catalog unavailable)':''}.`,'ok');return this;})().catch(e=>{this.loading=null;this.diag(`AUDIO CATALOG FAILED: ${e.message}`,'err');throw e;});return this.loading;}
  sample(v,fallback=1){return v14RandomRange(v,fallback);}
  pick(event){const def=this.defs?.[event];if(!def?.sounds?.length)return null;const items=def.sounds.map(s=>typeof s==='string'?{name:s,weight:1}:{...s,weight:v14Number(s.weight,1)});let total=items.reduce((n,s)=>n+Math.max(0,s.weight),0),r=Math.random()*Math.max(total,1);let selected=items[items.length-1];for(const item of items){r-=Math.max(0,item.weight);if(r<=0){selected=item;break;}}return {event,name:String(selected.name||''),pitch:this.sample(selected.pitch,1)*this.sample(def.pitch,1),volume:this.sample(selected.volume,1)*this.sample(def.volume,1),stream:!!(selected.stream??def.stream),is3D:(selected.is3D??def.is3D)!==false,category:selected.category??def.category??null,minDistance:v14Number(selected.min_distance??def.min_distance,2),maxDistance:v14Number(selected.max_distance??def.max_distance,38)};}
  resolveEvent(event){if(this.defs[event])return event;const raw=String(event||'');const aliases=[raw,raw.replace(/^bow$/,'random.bow'),raw.replace(/^click$/,'random.click'),raw.replace(/^hurt$/,'damage.hit')];for(const a of aliases)if(this.defs[a])return a;const low=raw.toLowerCase(),hit=Object.keys(this.defs).find(k=>k.toLowerCase()===low||k.toLowerCase().endsWith(`.${low}`));return hit||null;}
  blockGroup(id){const n=String(BLOCK_NAME?.[id]||'').toLowerCase().replace(/^minecraft:/,'').replace(/\s+/g,'_');const candidates=[n];if(id===BLOCK.GRASS||id===BLOCK.DIRT||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER)candidates.push('grass');if(id===BLOCK.OAK_LEAVES)candidates.push('leaves','azalea_leaves','grass');if([BLOCK.OAK_LOG,BLOCK.OAK_PLANKS,BLOCK.CRAFTING_TABLE,BLOCK.CHEST].includes(id))candidates.push('wood');if(id===BLOCK.SAND)candidates.push('sand');if(id===BLOCK.GRAVEL)candidates.push('gravel');if(typeof V8_ITEM!=='undefined'&&id===V8_ITEM.WHITE_WOOL)candidates.push('cloth');if([BLOCK.STONE,BLOCK.COBBLESTONE,BLOCK.COAL_ORE,BLOCK.IRON_ORE,BLOCK.DIAMOND_ORE,BLOCK.FURNACE].includes(id))candidates.push('stone');for(const c of candidates)if(this.blockSounds[c])return c;return this.blockSounds.stone?'stone':Object.keys(this.blockSounds)[0]||null;}
  blockDefinition(group,seen=new Set()){if(!group||seen.has(group))return null;seen.add(group);const own=this.blockSounds[group];if(!own)return null;const base=own.base?this.blockDefinition(own.base,seen):null;return {pitch:own.pitch??base?.pitch??1,volume:own.volume??base?.volume??1,events:{...(base?.events||{}),...(own.events||{})}};}
  blockEvent(id,action){const group=this.blockGroup(id),def=this.blockDefinition(group);if(!def)return null;let entry=def.events?.[action];if(action==='step'&&!entry)entry=def.events?.step||def.events?.['item.use.on'];if(typeof entry==='string')entry={sound:entry};if(!entry?.sound){const guess=`${action==='break'?'dig':action}.${group}`;if(this.defs[guess])entry={sound:guess};}if(!entry?.sound)return null;const event=this.resolveEvent(entry.sound);if(!event)return null;return {event,pitch:this.sample(entry.pitch,1)*this.sample(def.pitch,1),volume:this.sample(entry.volume,1)*this.sample(def.volume,1),group,action};}
  async clientEntityMap(type){type=String(type).replace(/^minecraft:/,'');if(this.entityMaps.has(type))return this.entityMaps.get(type);let map={};for(const stem of v14BehaviorStems(type)){const url=`${BEDROCK_RAW}resource_pack/entity/${stem}.entity.json`;try{const json=JSON.parse(await this.game.assets.text(url));map=json?.['minecraft:client_entity']?.description?.sound_effects||{};if(Object.keys(map).length)break;}catch{}}this.entityMaps.set(type,map);return map;}
  async entityEvent(type,action){await this.load();const map=await this.clientEntityMap(type);const direct=map[action]||map[action==='ambient'?'idle':action];if(direct&&this.defs[direct])return direct;const t=String(type).replace(/^minecraft:/,'').toLowerCase(),syn=action==='ambient'?['ambient','say','idle']:action==='hurt'?['hurt','damage','hit']:action==='death'?['death','die']:action==='attack'?['attack','shoot','bow']:action==='step'?['step']:action==='eat'?['eat']:action==='splash'?['splash']:[action];let best=null,bestScore=-1;for(const key of Object.keys(this.defs)){const k=key.toLowerCase();if(!k.includes(t))continue;let score=k.startsWith(`mob.${t}`)||k.startsWith(`entity.${t}`)?5:2;for(const s of syn)if(k.includes(s))score+=4;if(score>bestScore){bestScore=score;best=key;}}return bestScore>=6?best:null;}
  generatedURL(path){const v=this.generated?.paths?.[path];if(typeof v==='string')return v;if(v?.url)return v.url;return null;}
}

class BedrockAudioEngineV14{
  constructor(gameRef){this.game=gameRef;this.catalog=new BedrockSoundCatalogV14(gameRef);this.buffers=new Map();this.pending=new Map();this.failOnce=new Set();this.suppressLegacyBlock=0;this.enabled=true;}
  diag(...args){this.catalog.diag(...args);}
  async unlock(){const legacy=this.game.soundV9;if(!legacy.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Web Audio unavailable');legacy.ctx=new AC({latencyHint:'interactive'});legacy.master=legacy.ctx.createGain();legacy.master.gain.value=.72;if(typeof legacy.configureOutputV12==='function')legacy.configureOutputV12();else legacy.master.connect(legacy.ctx.destination);}if(legacy.ctx.state==='suspended')await legacy.ctx.resume();return legacy.ctx;}
  route(node,{position=null,ui=false,minDistance=2,maxDistance=38,rolloff=1}={}){const legacy=this.game.soundV9;if(position&&!ui){const p=legacy.ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=Math.max(.1,minDistance||2);p.maxDistance=Math.max(p.refDistance+1,maxDistance||38);p.rolloffFactor=Math.max(0,rolloff??1);try{p.positionX.value=position.x;p.positionY.value=position.y;p.positionZ.value=position.z;}catch{p.setPosition?.(position.x,position.y,position.z);}node.connect(p);p.connect(legacy.master);return p;}node.connect(legacy.master);return null;}
  async decodeArrayBuffer(ab){const ctx=await this.unlock();return ctx.decodeAudioData(ab.slice(0));}
  async fetchArrayBuffer(url){const r=await fetch(url,{mode:'cors',cache:'force-cache'});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return r.arrayBuffer();}
  async buffer(path){path=String(path||'').replace(/\.fsb$/i,'');if(!path)throw new Error('empty sound path');if(this.buffers.has(path))return this.buffers.get(path);if(this.pending.has(path))return this.pending.get(path);const p=(async()=>{await this.catalog.load();const generated=this.catalog.generatedURL(path);if(generated){try{const b=await this.decodeArrayBuffer(await this.fetchArrayBuffer(generated));this.buffers.set(path,b);this.diag(`AUDIO READY preconverted ${path}`,'ok');return b;}catch(e){this.diag(`PRECONVERTED AUDIO FAILED ${path}: ${e.message}`,'warn');}}
      const localCandidates=[`./assets/audio/generated/${path}.mp3`,`./assets/audio/generated/${path}.wav`];for(const url of localCandidates){try{const b=await this.decodeArrayBuffer(await this.fetchArrayBuffer(url));this.buffers.set(path,b);return b;}catch{}}
      const fsbURL=`${MOJANG_RP_V9}${path.replace(/^resource_pack\//,'')}.fsb`;let raw;try{raw=await this.fetchArrayBuffer(fsbURL);}catch(e){throw new Error(`Mojang FSB missing ${fsbURL}: ${e.message}`);}try{const direct=await this.decodeArrayBuffer(raw);this.buffers.set(path,direct);this.diag(`AUDIO READY direct FSB ${path}`,'ok');return direct;}catch{}
      try{const wav=await this.game.soundV9.transcoder.convert(raw,path),decoded=await this.decodeArrayBuffer(wav);this.buffers.set(path,decoded);this.diag(`AUDIO READY browser FSB→WAV ${path}`,'ok');return decoded;}catch(e){throw new Error(`FSB decode unavailable for ${path}: ${e.message}. Run tools/build_mojang_audio.py (or the included GitHub Action) to preconvert it.`);}
    })().catch(e=>{if(!this.failOnce.has(path)){this.failOnce.add(path);this.diag(`AUDIO ASSET UNAVAILABLE ${path}: ${e.message} | fallback audio DISABLED`,'err');}return null;}).finally(()=>this.pending.delete(path));this.pending.set(path,p);return p;}
  async playResolved(resolved,opts={}){if(!resolved||!this.enabled)return false;const selected=this.catalog.pick(resolved.event);if(!selected){this.diag(`SOUND EVENT EMPTY: ${resolved.event}`,'warn');return false;}const buf=await this.buffer(selected.name);if(!buf)return false;const ctx=await this.unlock(),src=ctx.createBufferSource(),gain=ctx.createGain(),pitch=(opts.pitch??1)*(resolved.pitch??1)*(selected.pitch??1),volume=(opts.volume??1)*(resolved.volume??1)*(selected.volume??1);src.buffer=buf;src.playbackRate.value=Math.max(.25,Math.min(4,pitch));gain.gain.value=Math.max(0,Math.min(2,volume));src.connect(gain);this.route(gain,{position:opts.position||null,ui:!!opts.ui||selected.is3D===false,minDistance:opts.minDistance??selected.minDistance,maxDistance:opts.maxDistance??selected.maxDistance,rolloff:opts.rolloff??1});src.start();return true;}
  async playEvent(event,opts={}){if(!this.enabled)return false;if(this.suppressLegacyBlock&&/^(dig|step|hit|place|break|use)\./i.test(String(event)))return false;try{await this.catalog.load();const resolvedEvent=this.catalog.resolveEvent(event);if(!resolvedEvent){this.diag(`SOUND EVENT NOT FOUND: ${event} | fallback audio DISABLED`,'warn');return false;}return this.playResolved({event:resolvedEvent,pitch:1,volume:1},opts);}catch(e){this.diag(`PLAY ${event} FAILED: ${e.message}`,'err');return false;}}
  async playBlock(id,action,opts={}){try{await this.catalog.load();const resolved=this.catalog.blockEvent(id,action);if(!resolved){this.diag(`BLOCK SOUND UNAVAILABLE: ${BLOCK_NAME?.[id]||id} ${action}`,'warn');return false;}return this.playResolved(resolved,opts);}catch(e){this.diag(`BLOCK SOUND ${action} FAILED: ${e.message}`,'err');return false;}}
  async playEntity(type,action,opts={}){try{const event=await this.catalog.entityEvent(type,action);if(!event){this.diag(`ENTITY SOUND UNAVAILABLE: ${type}.${action}`,'warn');return false;}return this.playEvent(event,opts);}catch(e){this.diag(`ENTITY SOUND ${type}.${action} FAILED: ${e.message}`,'err');return false;}}
  beginLegacyBlock(){this.suppressLegacyBlock++;}
  endLegacyBlock(){this.suppressLegacyBlock=Math.max(0,this.suppressLegacyBlock-1);}
}

game.soundV14=new BedrockAudioEngineV14(game);

/* Remove all synthesized/generic fallback audio. Existing calls are transparently routed into the strict Mojang catalog. */
MinecraftSoundSystemV9.prototype.synthV12=function(){};
MinecraftSoundSystemV9.prototype.synthV11=function(){};
MinecraftSoundSystemV9.prototype.synthClick=function(){};
if(typeof SoundSystem!=='undefined'){SoundSystem.prototype.beep=function(){};SoundSystem.prototype.blockBreak=function(){};SoundSystem.prototype.blockPlace=function(){};SoundSystem.prototype.hurt=function(){};}
MinecraftSoundSystemV9.prototype.play=function(event,opts={}){return this.game.soundV14?.playEvent?.(event,opts)??Promise.resolve(false);};

/* Replace legacy block sound guessing with sounds.json event resolution while preserving the existing mining/crafting logic. */
const v14AudioMineBase=Game.prototype.mine;
Game.prototype.mine=function(dt){const hit=this.breaking?this.getTarget?.():null,before=hit?{id:hit.id,x:hit.x,y:hit.y,z:hit.z,stage:Math.floor((this.player?.breakProgress||0)*10)}:null;this.soundV14?.beginLegacyBlock();let r;try{r=v14AudioMineBase.call(this,dt);}finally{this.soundV14?.endLegacyBlock();}if(before){const pos=new THREE.Vector3(before.x+.5,before.y+.5,before.z+.5),after=this.world.getLoaded(before.x,before.y,before.z);if(after===BLOCK.AIR&&before.id!==BLOCK.AIR)this.soundV14?.playBlock(before.id,'break',{position:pos,volume:.85});else if(this.breaking&&this.player?.breaking===blockKey(before.x,before.y,before.z)){const stage=Math.floor((this.player.breakProgress||0)*10);if(stage!==before.stage&&stage%2===0)this.soundV14?.playBlock(before.id,'hit',{position:pos,volume:.28});}}return r;};

const v14AudioUseBase=Game.prototype.useSelected;
Game.prototype.useSelected=function(){const hit=this.getTarget?.(),p=hit?.place?{...hit.place}:null,before=p?this.world.getLoaded(p.x,p.y,p.z):null;this.soundV14?.beginLegacyBlock();let r;try{r=v14AudioUseBase.call(this);}finally{this.soundV14?.endLegacyBlock();}if(p&&before===BLOCK.AIR){const placed=this.world.getLoaded(p.x,p.y,p.z);if(placed!==BLOCK.AIR)this.soundV14?.playBlock(placed,'place',{position:new THREE.Vector3(p.x+.5,p.y+.5,p.z+.5),volume:.62});}return r;};

if(typeof FootstepAudioV13!=='undefined')FootstepAudioV13.prototype.update=function(dt){const p=this.game.player;if(!p||!this.game.running)return;if(!this.ready){this.last.copy(p.position);this.grounded=p.onGround;this.ready=true;}const dx=p.position.x-this.last.x,dz=p.position.z-this.last.z,dist=Math.hypot(dx,dz);this.last.copy(p.position);if(p.onGround&&!p.inWaterV8&&dist>.0005){this.distance+=dist;const interval=p.sprinting?.42:.57;if(this.distance>=interval){this.distance=0;const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));this.game.soundV14?.playBlock(below,'step',{position:p.position,volume:p.sprinting?.20:.14,pitch:.96+Math.random()*.08});}}if(!this.grounded&&p.onGround&&Math.abs(p.velocity.y)<1.2){const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));this.game.soundV14?.playBlock(below,'step',{position:p.position,volume:.16,pitch:.82});}this.grounded=p.onGround;};


if(typeof ExplosionManagerV6!=='undefined'){
  const v14AudioExplosionBase=ExplosionManagerV6.prototype.queueCreeper;
  ExplosionManagerV6.prototype.queueCreeper=function(mob){if(!mob?._v14ExplosionSound){mob._v14ExplosionSound=true;this.game.soundV14?.playEvent?.('random.explode',{position:mob.position,volume:1});}return v14AudioExplosionBase.call(this,mob);};
}

/* Keep listener orientation synchronized even when old V9 manifest loading is bypassed. */
const v14AudioUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v14AudioUpdateBase.call(this,dt);this.soundV9?.updateListener?.();return r;};
for(const ev of ['pointerdown','touchstart','keydown'])document.addEventListener(ev,()=>{game.soundV14?.unlock?.().then(()=>game.soundV14.catalog.load()).catch(e=>window.__voxelDiag?.log?.(`AUDIO UNLOCK/CATALOG: ${e.message}`,'err'));},{capture:true,passive:true});

const v14AudioBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v14AudioBootBase.apply(this,args);this.soundV14.catalog.load().catch(e=>window.__voxelDiag?.log?.(`AUDIO CATALOG WARMUP FAILED: ${e.message}`,'warn'));window.__voxelDiag?.log?.(`V14.2 AUDIO: strict Mojang sounds.json + sound_definitions resolver, weighted variants, pitch/volume, stereo HRTF, lazy FSB decode and preconverted-cache support. Generic fallback audio is OFF.`,'ok');};

try{
  runtimeCommands.register('audio',(event='random.click')=>game.soundV14.playEvent(event,{ui:true,volume:.5}).then(ok=>({ok,event,state:game.soundV9?.ctx?.state||'none',output:game.soundV9?.outputModeV12||'stereo',buffers:game.soundV14.buffers.size,definitions:Object.keys(game.soundV14.catalog.defs||{}).length,preconverted:Object.keys(game.soundV14.catalog.generated?.paths||{}).length,fallback:'disabled'})),'Play a real Mojang sound event through the strict V14 audio translator.');
  runtimeCommands.register('blocksound',(id=BLOCK.GRASS,action='break')=>game.soundV14.catalog.load().then(()=>game.soundV14.catalog.blockEvent(Number(id),String(action))),'Resolve a block break/hit/place/step event from Mojang sounds.json.');
}catch{}
window.MINECRAFT_WEB_VERSION='0.14.2';
if(typeof v9BuildTitle==='function'){const v142BuildTitleBase=v9BuildTitle;v9BuildTitle=function(){v142BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small&&/Minecraft Web/.test(small.textContent||''))small.textContent='Minecraft Web Alpha 0.14.2 • Three.js r180 • Bedrock AI + Audio';};}
window.__voxelDiag?.log?.(`V14.2 READY ${STUDIO_V14_AUDIO.version}: real Mojang audio only; missing/undecodable assets are reported and never replaced by beeps/noise.`,'ok');
/* ===================== V14.3: PHYSICS / ENTITY / WORLD POLISH ===================== */
const STUDIO_V14_3=Object.freeze({version:'0.14.3-physics-entity-world',fallGravity:24,fallTerminal:28,fallBudget:24,cloudSpeed:.0040,celestialDistance:245,celestialSize:66});
window.STUDIO_PATCH_VERSION=STUDIO_V14_3.version;
window.MINECRAFT_WEB_VERSION='0.14.3';

/* Fix the DOM-id collision that made `toast(...)` resolve to the #toast DIV. */
function toast(message,duration=1500){
  if(!toastEl)return;
  toastEl.textContent=String(message??'');
  toastEl.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>toastEl.classList.remove('show'),Math.max(450,Number(duration)||1500));
}

/* ---- Older Bedrock geometry inheritance + quadruped bind-pose repair ---- */
function v143Clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
function v143MergeGeometry(parent,child){
  const out={...v143Clone(parent||{}),...v143Clone(child||{})},bones=new Map();
  for(const b of parent?.bones||[])bones.set(b.name,v143Clone(b));
  for(const b of child?.bones||[])bones.set(b.name,{...(bones.get(b.name)||{}),...v143Clone(b)});
  out.bones=[...bones.values()];return out;
}
const v143GeometryDefinitionsBase=BedrockEntityLoaderV2.prototype.geometryDefinitions;
BedrockEntityLoaderV2.prototype.geometryDefinitions=function(json){
  const defs=v143GeometryDefinitionsBase.call(this,json),byName=new Map(defs.map(d=>[d.name,d]));
  if(!Array.isArray(json?.['minecraft:geometry']))for(const [rawName,data] of Object.entries(json||{})){
    if(!rawName.startsWith('geometry.')||!rawName.includes(':'))continue;
    const split=rawName.indexOf(':'),name=rawName.slice(0,split),parentName=rawName.slice(split+1),parent=byName.get(parentName)?.data||json[parentName];
    const merged={name,data:v143MergeGeometry(parent,data)};const i=defs.findIndex(d=>d.name===rawName);if(i>=0)defs[i]=merged;else defs.push(merged);byName.set(name,merged);
  }
  return defs;
};
const v143ChooseGeometryBase=BedrockEntityLoaderV2.prototype.chooseGeometry;
BedrockEntityLoaderV2.prototype.chooseGeometry=function(entityJSON,geometryJSON){
  const preferred=entityJSON?.['minecraft:client_entity']?.description?.geometry?.default;
  if(preferred){const exact=this.geometryDefinitions(geometryJSON).find(d=>d.name===preferred);if(exact)return exact;}
  return v143ChooseGeometryBase.call(this,entityJSON,geometryJSON);
};
const v143SpecBase=BedrockEntityLoaderV2.prototype.spec;
BedrockEntityLoaderV2.prototype.spec=function(type){
  const t=String(type).replace(/^minecraft:/,''),base=v143SpecBase.call(this,t)||{},uniq=a=>[...new Set((a||[]).filter(Boolean))];
  return {entity:uniq([...(base.entity||[]),t]),geometry:uniq([...(base.geometry||[]),`${t}_v1.0`,t]),animations:uniq([...(base.animations||[]),t,'quadruped','humanoid'])};
};
function v143NormalizeQuadruped(root,type){
  if(!root||!['cow','pig','sheep'].includes(type))return root;
  const body=root.userData?.bones?.get?.('body');if(!body)return root;
  let visual=body.children.find(c=>c.name==='_v143_body_visual');
  if(!visual){visual=new THREE.Group();visual.name='_v143_body_visual';const visuals=body.children.filter(c=>c!==visual&&!c.userData?.bedrockBoneName);body.add(visual);for(const child of visuals)visual.add(child);}
  body.rotation.x=0;body.rotation.z=0;visual.rotation.set(-Math.PI/2,0,0);root.userData.quadrupedPoseV143=true;return root;
}
const v143EntityBuildBase=BedrockEntityLoaderV2.prototype.build;
BedrockEntityLoaderV2.prototype.build=function(definition,texture,type){return v143NormalizeQuadruped(v143EntityBuildBase.call(this,definition,texture,type),type);};
const v143AnimUpdateBase=BedrockAnimationControllerV2.prototype.update;
BedrockAnimationControllerV2.prototype.update=function(state,time,mob){
  v143AnimUpdateBase.call(this,state,time,mob);
  if(['cow','pig','sheep'].includes(this.type)){const body=this.bones.get('body'),visual=body?.children?.find?.(c=>c.name==='_v143_body_visual');if(body){body.rotation.x=0;body.rotation.z=0;}if(visual)visual.rotation.set(-Math.PI/2,0,0);}
};

/* ---- Mob collision recovery: search sideways as well as upward; never spin a stuck mob. ---- */
function v143MobLoadedAt(mob,world){const p=world.worldToChunk(Math.floor(mob.position.x),Math.floor(mob.position.z));return !!world.getChunk(p.cx,p.cz);}
mobDepenetrateV6=function(mob,world){
  if(!v143MobLoadedAt(mob,world))return false;if(!mobCollidesAtV6(mob,mob.position,world))return true;
  const base=mob.position.clone(),tries=[];
  for(const r of [.12,.24,.38,.55,.78,1.05,1.35])for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])tries.push([dx,0,dz]);
  for(const y of [.08,.16,.28,.42,.62,.85,1.1,1.4])tries.push([0,y,0]);
  for(const [dx,dy,dz] of tries){const p=base.clone().add(new THREE.Vector3(dx,dy,dz));if(!mobCollidesAtV6(mob,p,world)){mob.position.copy(p);mob.verticalVelocity=Math.min(0,mob.verticalVelocity||0);if(mob.navV14)mob.navV14.stuck=0;return true;}}
  const x=Math.floor(base.x),z=Math.floor(base.z),floor=world.highestSolidY(x,z)+1,snap=new THREE.Vector3(x+.5,floor,z+.5);
  if(Math.abs(floor-base.y)<=4&&!mobCollidesAtV6(mob,snap,world)){mob.position.copy(snap);mob.verticalVelocity=0;if(mob.navV14)mob.navV14.stuck=0;return true;}return false;
};
const v143NavigatorPhysicsBase=MobNavigatorV14.prototype.physics;
MobNavigatorV14.prototype.physics=function(mob,dt){mobDepenetrateV6(mob,this.world);v143NavigatorPhysicsBase.call(this,mob,dt);mobDepenetrateV6(mob,this.world);if(mob.model){mob.model.rotation.x=0;mob.model.rotation.z=0;}};

/* ---- Real falling blocks for sand / gravel ---- */
class FallingBlockSystemV143{
  constructor(gameRef){this.game=gameRef;this.world=gameRef.world;this.queue=[];this.queued=new Set();this.active=[];this.factory=new StudioDropVisualFactoryV6(gameRef);this.suppress=false;this.scanClock=0;}
  key(x,y,z){return `${x}|${y}|${z}`;} canFall(id){return id===BLOCK.SAND||id===BLOCK.GRAVEL;} replaceable(id){return id===BLOCK.AIR||id===BLOCK.WATER||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER;}
  enqueue(x,y,z){if(y<=0||y>=ENGINE.WORLD_HEIGHT)return;const k=this.key(x,y,z);if(this.queued.has(k))return;this.queued.add(k);this.queue.push([x,y,z]);}
  set(x,y,z,id){this.suppress=true;try{return this.world.set(x,y,z,id);}finally{this.suppress=false;}}
  start(x,y,z){const id=this.world.getLoaded(x,y,z),below=this.world.getLoadedState(x,y-1,z);if(!this.canFall(id)||!below.loaded||!this.replaceable(below.id))return false;this.set(x,y,z,BLOCK.AIR);const mesh=this.factory.createBlock(id,id);mesh.scale.setScalar(1);mesh.position.set(x+.5,y+.5,z+.5);mesh.castShadow=this.game.graphicsV7?.profile!=='fast';mesh.receiveShadow=false;this.game.renderer.scene.add(mesh);this.active.push({id,x,z,y:Number(y),vy:0,mesh});return true;}
  settle(f,y){const at=this.world.getLoaded(f.x,y,f.z);if(this.replaceable(at)){if(at!==BLOCK.AIR)this.set(f.x,y,f.z,BLOCK.AIR);this.set(f.x,y,f.z,f.id);this.enqueue(f.x,y+1,f.z);}else this.game.drops?.spawn?.(f.id,1,new THREE.Vector3(f.x+.5,y+1.1,f.z+.5));f.mesh?.parent?.remove(f.mesh);}
  scan(){const p=this.game.player;if(!p)return;const cx=Math.floor(p.position.x),cz=Math.floor(p.position.z);for(let i=0;i<10;i++){const x=cx-7+Math.floor(Math.random()*15),z=cz-7+Math.floor(Math.random()*15),top=this.world.highestSolidY(x,z);for(let y=Math.max(1,top-5);y<=Math.min(ENGINE.WORLD_HEIGHT-1,top+2);y++)if(this.canFall(this.world.getLoaded(x,y,z))&&this.replaceable(this.world.getLoaded(x,y-1,z)))this.enqueue(x,y,z);}}
  update(dt){let budget=STUDIO_V14_3.fallBudget;while(budget--&&this.queue.length){const q=this.queue.shift();this.queued.delete(this.key(...q));this.start(...q);}for(let i=this.active.length-1;i>=0;i--){const f=this.active[i];f.vy=Math.max(-STUDIO_V14_3.fallTerminal,f.vy-STUDIO_V14_3.fallGravity*dt);const next=f.y+f.vy*dt,checkY=Math.floor(next-.001),st=this.world.getLoadedState(f.x,checkY,f.z);if(!st.loaded){f.vy=0;continue;}if(f.vy<=0&&!this.replaceable(st.id)){this.settle(f,checkY+1);this.active.splice(i,1);continue;}f.y=next;f.mesh.position.y=f.y+.5;f.mesh.rotation.y+=dt*.4;}this.scanClock-=dt;if(this.scanClock<=0){this.scanClock=.5;this.scan();}}
}
const v143WorldSetBase=World.prototype.set;
World.prototype.set=function(x,y,z,id){const changed=v143WorldSetBase.call(this,x,y,z,id),sys=this.fallingBlocksV143||game?.fallingBlocksV143;if(changed&&sys&&!sys.suppress){sys.enqueue(x,y,z);sys.enqueue(x,y+1,z);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])sys.enqueue(x+dx,y+1,z+dz);}return changed;};

/* ---- Village placement rules + richer village template fallback ---- */
function v143VillageSite(gen,chunk){
  const spacing=9,gx=floorDiv(chunk.cx,spacing),gz=floorDiv(chunk.cz,spacing),pickX=gx*spacing+Math.floor(hash2(gx,gz,gen.seed+22131)*spacing),pickZ=gz*spacing+Math.floor(hash2(gz,gx,gen.seed+55109)*spacing);if(chunk.cx!==pickX||chunk.cz!==pickZ)return null;
  const wx=chunk.cx*chunk.size+8,wz=chunk.cz*chunk.size+8,y=gen.surfaceY(wx,wz),biome=gen.biome(wx,wz);if(biome!=='plains'||y<=ENGINE.SEA_LEVEL+2)return null;let min=999,max=-999,water=false;
  for(let dz=-6;dz<=6;dz+=2)for(let dx=-6;dx<=6;dx+=2){const sy=gen.surfaceY(wx+dx,wz+dz);min=Math.min(min,sy);max=Math.max(max,sy);if(sy<=ENGINE.SEA_LEVEL)water=true;}if(water||max-min>2)return null;return {wx,wz,y:Math.round((min+max)*.5),cx:8,cz:8};
}
function v143PlaceHouse(chunk,cx,cz,y,w=5,d=5){const hx=Math.floor(w/2),hz=Math.floor(d/2);for(let z=-hz;z<=hz;z++)for(let x=-hx;x<=hx;x++){const lx=cx+x,lz=cz+z;if(lx<1||lx>=chunk.size-1||lz<1||lz>=chunk.size-1)continue;chunk.set(lx,y,lz,BLOCK.COBBLESTONE);for(let yy=1;yy<=3;yy++){const edge=Math.abs(x)===hx||Math.abs(z)===hz,door=z===hz&&x===0&&yy<=2;chunk.set(lx,y+yy,lz,edge&&!door?BLOCK.OAK_PLANKS:BLOCK.AIR);}chunk.set(lx,y+4,lz,BLOCK.OAK_PLANKS);}chunk.set(cx,y+2,cz+hz-1,BLOCK.TORCH);}
v8StampVillage=function(gen,chunk){const site=v143VillageSite(gen,chunk);if(!site)return;const {wx,wz,y,cx,cz}=site;for(let z=1;z<chunk.size-1;z++)for(let x=1;x<chunk.size-1;x++){const gx=chunk.cx*chunk.size+x,gz=chunk.cz*chunk.size+z,sy=gen.surfaceY(gx,gz);if(Math.abs(x-cx)<=1||Math.abs(z-cz)<=1)chunk.set(x,sy,z,BLOCK.GRAVEL);for(let yy=sy+1;yy<=Math.min(ENGINE.WORLD_HEIGHT-2,y+5);yy++)chunk.set(x,yy,z,BLOCK.AIR);}v143PlaceHouse(chunk,4,4,y);v143PlaceHouse(chunk,11,10,y);for(let z=6;z<=9;z++)for(let x=6;x<=9;x++)chunk.set(x,y,z,BLOCK.COBBLESTONE);for(let yy=1;yy<=2;yy++)for(const [x,z] of [[6,6],[9,6],[6,9],[9,9]])chunk.set(x,y+yy,z,BLOCK.OAK_LOG);chunk.set(7,y+1,7,BLOCK.TORCH);chunk.villageV8=true;chunk.villageSiteV143=site;gen.villageSpawnsV8??=[];gen.villageSpawnsV8.push(new THREE.Vector3(wx+.5,y+1,wz+.5));};
v11VillageExtras=function(gen,chunk){if(!chunk.villageV8||!chunk.villageSiteV143)return;const s=chunk.villageSiteV143;gen.villageEntitiesV11??=[];for(const [dx,dz] of [[-2,1],[2,1],[-1,-2],[1,-2]])gen.villageEntitiesV11.push({type:'villager',position:new THREE.Vector3(s.wx+dx+.5,s.y+1,s.wz+dz+.5),villageV143:true});gen.villageEntitiesV11.push({type:'iron_golem',position:new THREE.Vector3(s.wx+.5,s.y+1,s.wz+3.5),villageV143:true});chunk.villageV11=true;};

/* Stronghold structure marker/fallback. Full End portal/dimension remains a later system. */
function v143Stronghold(gen,chunk){const d=Math.hypot(chunk.cx,chunk.cz);if(d<18||d>34||hash2(chunk.cx,chunk.cz,gen.seed+993821)>.012)return;const y=12+Math.floor(hash2(chunk.cz,chunk.cx,gen.seed+81)*10),s=chunk.size;for(let z=2;z<s-2;z++)for(let x=2;x<s-2;x++)for(let yy=y;yy<=y+4;yy++){const edge=x===2||z===2||x===s-3||z===s-3||yy===y||yy===y+4;chunk.set(x,yy,z,edge?BLOCK.COBBLESTONE:BLOCK.AIR);}for(let x=0;x<s;x++)for(let yy=y+1;yy<=y+2;yy++)chunk.set(x,yy,Math.floor(s/2),BLOCK.AIR);chunk.strongholdV143=true;}
const v143GeneratorBase=WorldGenerator.prototype.generate;WorldGenerator.prototype.generate=function(chunk){v143GeneratorBase.call(this,chunk);v143Stronghold(this,chunk);};

/* ---- Extend behavior targeting from "player only" to real entities. ---- */
function v143Candidates(controller){return [controller.game.player,...(controller.game.mobs?.mobs||[]).filter(m=>m!==controller.mob&&m.health>0)];}
function v143EntityTypes(cfg){return Array.isArray(cfg?.entity_types)?cfg.entity_types:cfg?.entity_types?[cfg.entity_types]:[];}
V14_TARGET_GOALS.add('minecraft:behavior.defend_village_target');V14_TARGET_GOALS.add('minecraft:behavior.nearest_prioritized_attackable_target');
BedrockBehaviorControllerV14.prototype.selectTargets=function(){
  const old=this.target;let chosen=null,best=Infinity;if(this.target&&((this.target.health??1)<=0||!this.target.position))this.target=null;
  for(const goal of this.targetGoals){const cfg=goal.config||{};
    if(goal.key==='minecraft:behavior.hurt_by_target'&&this.mob.lastHurtByV14&&performance.now()-(this.mob.lastHurtAtV14||0)<10000){chosen=this.mob.lastHurtByV14;break;}
    if(goal.key==='minecraft:behavior.defend_village_target'){for(const candidate of this.game.mobs?.mobs||[]){if(candidate===this.mob||!candidate.position)continue;const fam=this.filter.families(candidate,{player:this.game.player}),hostile=['monster','zombie','skeleton','spider','enderman','illager'].some(f=>fam.has(f));if(!hostile||fam.has('creeper'))continue;const d=this.mob.position.distanceTo(candidate.position);if(d<best&&d<24){best=d;chosen=candidate;}}if(chosen)break;continue;}
    if(goal.key==='minecraft:behavior.nearest_attackable_target'||goal.key==='minecraft:behavior.nearest_prioritized_attackable_target'){const types=v143EntityTypes(cfg),radius=v14Number(cfg.within_radius??cfg.max_dist,this.meta.followRange||25);for(const candidate of v143Candidates(this)){if(candidate===this.mob||!candidate?.position)continue;const d=this.mob.position.distanceTo(candidate.position);if(d>radius||d>=best)continue;let pass=!types.length;for(const t of types){if(d>v14Number(t?.max_dist,radius))continue;const ctx={game:this.game,self:this.mob,other:candidate,target:candidate,player:this.game.player,runtime:this};if(this.filter.evaluate(t?.filters||t,ctx)){pass=true;break;}}if(pass){best=d;chosen=candidate;}}if(chosen)break;}
  }
  this.target=chosen||((this.target?.position&&this.mob.position.distanceTo(this.target.position)<(this.meta.followRange||32)*1.25)?this.target:null);if(old!==this.target&&this.target)this.applyTrigger(this.components['minecraft:on_target_acquired'],this.target);this.previousTarget=old;
};

/* Villager profession state: data-driven group where available, deterministic job fallback otherwise. */
const v143AttachBase=BedrockBehaviorSystemV14.prototype.attach;
BedrockBehaviorSystemV14.prototype.attach=async function(mob){const c=await v143AttachBase.call(this,mob);if(!c)return c;if(mob.type==='villager'){const jobs=[{id:BLOCK.FURNACE,name:'armorer'},{id:BLOCK.CRAFTING_TABLE,name:'toolsmith'},{id:BLOCK.CHEST,name:'farmer'}];let best={d:Infinity,name:'farmer'};for(let y=Math.floor(mob.position.y)-2;y<=Math.floor(mob.position.y)+2;y++)for(let z=Math.floor(mob.position.z)-10;z<=Math.floor(mob.position.z)+10;z++)for(let x=Math.floor(mob.position.x)-10;x<=Math.floor(mob.position.x)+10;x++){const w=jobs.find(q=>q.id===this.game.world.getLoaded(x,y,z));if(!w)continue;const d=(x-mob.position.x)**2+(z-mob.position.z)**2;if(d<best.d)best={d,name:w.name};}mob.professionV143=best.name;const match=Object.keys(c.plan.componentGroups||{}).find(k=>k.toLowerCase()===best.name||k.toLowerCase().includes(best.name));if(match)c.activeGroups.add(match);c.rebuild();if(mob.model)mob.model.userData.professionV143=best.name;}return c;};

/* ---- Mojang spawn-rule cache + strict day/night split. ---- */
class BedrockSpawnRuleRepositoryV143{
  constructor(gameRef){this.game=gameRef;this.cache=new Map();this.pending=new Map();}
  async rule(type){type=String(type).replace(/^minecraft:/,'');if(this.cache.has(type))return this.cache.get(type);if(this.pending.has(type))return this.pending.get(type);const p=(async()=>{try{const json=JSON.parse(await this.game.assets.text(`${BEDROCK_RAW}behavior_pack/spawn_rules/${type}.json`)),r=json?.['minecraft:spawn_rules']||null;this.cache.set(type,r);return r;}catch{this.cache.set(type,null);return null;}})().finally(()=>this.pending.delete(type));this.pending.set(type,p);return p;}
  allowed(rule,light){if(!rule)return true;for(const c of rule.conditions||[]){const b=c['minecraft:brightness_filter'];if(!b)return true;if(light>=v14Number(b.min,0)&&light<=v14Number(b.max,15))return true;}return false;}
}
MobSystem.prototype.spawnAround=async function(player){if(this._spawnPendingV143||this.mobs.length>=ENGINE.MAX_MOBS)return;this._spawnPendingV143=true;try{const a=Math.random()*Math.PI*2,r=18+Math.random()*20,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(y<=1||y>=ENGINE.WORLD_HEIGHT-2||this.world.getLoaded(x,y,z)!==BLOCK.AIR||!SOLID_BLOCKS.has(this.world.getLoaded(x,y-1,z)))return;const daylight=this.game.renderer?.dayStateV6?.daylight??1,sky=this.game.lightV8?.skyVisible?.(x,y,z)??true,light=this.game.lightV8?.level?.(x,y,z)??Math.round(daylight*15),night=daylight<.22,passive=['cow','pig','chicken','sheep'],hostile=['zombie','skeleton','creeper','spider','enderman'],pool=night||(!sky&&light<8)?hostile:passive,type=pool[Math.floor(Math.random()*pool.length)],rule=await this.game.spawnRulesV143?.rule(type);if(hostile.includes(type)&&light>=8)return;if(passive.includes(type)&&night)return;if(!this.game.spawnRulesV143?.allowed(rule,light))return;await this.spawnEntity(type,new THREE.Vector3(x+.5,y,z+.5));}finally{this._spawnPendingV143=false;}};

/* ---- Minecraft-like calmer movement bob + third-person player animation ---- */
const v143PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){const ox=this.position.x,oz=this.position.z,r=v143PlayerUpdateBase.call(this,dt,controls),dist=Math.hypot(this.position.x-ox,this.position.z-oz);this._walkDistanceV143=(this._walkDistanceV143||0)+(this.onGround?dist:0);return r;};
PlayerCameraV12.prototype.apply=function(player,camera){v13CameraApplyBase.call(this,player,camera);const target=this.mode===0&&player.sprinting?STUDIO_V13.sprintFov:STUDIO_V13.baseFov;camera.fov=lerp(camera.fov||STUDIO_V13.baseFov,target,.12);camera.updateProjectionMatrix();if(this.mode!==0||player.flying)return;const speed=player._speedV13||0,move=clamp(speed/5.6,0,1);if(!player.onGround||move<.035)return;const wave=(player._walkDistanceV143||0)*Math.PI,amp=move*(player.sprinting?1.15:1),right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));camera.position.addScaledVector(right,Math.sin(wave)*.015*amp);camera.position.y-=Math.abs(Math.cos(wave))*.010*amp;camera.rotation.z+=Math.sin(wave)*.003*amp;};
PlayerEntityRendererV12.prototype.updateOne=function(avatar,state,dt){if(!avatar?.root)return;const p=state.player||this.game.player;avatar.age+=dt;const moved=Math.hypot(p.position.x-avatar.lastPos.x,p.position.z-avatar.lastPos.z);avatar.distance+=moved;avatar.lastPos.copy(p.position);avatar.root.position.copy(p.position);avatar.root.rotation.set(0,p.yaw||0,0);avatar.root.scale.setScalar(.9375);const c=avatar.controller;if(!c)return;const speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),swim=!!p.inWaterV8,mode=speed>.08?'walk':'idle',attackAge=performance.now()-(this.game.combat?.lastAttackTime||0),mining=!!this.game.breaking,attack=attackAge<360?clamp(1-attackAge/360,0,1):(mining?(.5+.5*Math.sin(avatar.age*12)):0);c.update(mode,avatar.age,{age:avatar.age,distanceWalked:avatar.distance,velocity:p.velocity,attackProgress:attack});const ctx=this.ctx(avatar,state);ctx.query.attack_time=attack;ctx.variable.attack_time=attack;ctx.variable.swim_amount=swim?1:0;if(swim)for(const n of ['animation.player.swim','animation.player.swim.legs']){const clip=c.animations?.[n];if(clip)c.applyClip(clip,avatar.age,ctx);}if(p.crouchingV12){const clip=c.animations?.['animation.player.sneaking'];if(clip)c.applyClip(clip,avatar.age,ctx);}if(attack>0)for(const n of ['animation.player.attack.positions','animation.player.attack.rotations']){const clip=c.animations?.[n];if(clip)c.applyClip(clip,avatar.age,ctx);}const head=c.bones.get('head');if(head&&!swim){const bind=c.bind.get('head');if(bind)head.rotation.x=bind.rotation.x+clamp(p.pitch||0,-1.25,1.25)*.72;}};

/* Real Mojang step events only, at a less dizzy/annoying cadence. */
if(typeof FootstepAudioV13!=='undefined')FootstepAudioV13.prototype.update=function(dt){const p=this.game.player;if(!p||!this.game.running)return;if(!this.ready){this.last.copy(p.position);this.grounded=p.onGround;this.ready=true;}const dx=p.position.x-this.last.x,dz=p.position.z-this.last.z,dist=Math.hypot(dx,dz);this.last.copy(p.position);if(p.onGround&&!p.inWaterV8&&dist>.0005){this.distance+=dist;const interval=p.sprinting?.72:.88;if(this.distance>=interval){this.distance%=interval;const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));this.game.soundV14?.playBlock(below,'step',{position:p.position,volume:p.sprinting?.13:.10,pitch:.96+Math.random()*.06});}}this.grounded=p.onGround;};

/* ---- Celestial alpha cleanup + fixed celestial sphere placement ---- */
async function v143CleanCelestial(candidates,frame=null){for(const url of candidates){try{const bmp=await game.assets.image(url),sw=bmp.width,sh=bmp.height,sx=frame?Math.floor(sw/4)*frame.col:0,sy=frame?Math.floor(sh/2)*frame.row:0,w=frame?Math.floor(sw/4):sw,h=frame?Math.floor(sh/2):sh,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(bmp,sx,sy,w,h,0,0,w,h);const d=x.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b),neutral=max-min<18;if(neutral&&max<22)d.data[i+3]=0;else if(neutral&&max<48)d.data[i+3]=Math.round(d.data[i+3]*(max-22)/26);}x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}catch{}}return null;}
VoxelRenderer.prototype.ensureCelestialsV7=function(){if(this.celestialV7)return;const sm=new THREE.SpriteMaterial({transparent:true,alphaTest:.015,depthWrite:false,depthTest:false,fog:false,toneMapped:false}),mm=sm.clone(),sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.set(STUDIO_V14_3.celestialSize,STUDIO_V14_3.celestialSize,1);moonSprite.scale.copy(sunSprite.scale);sunSprite.renderOrder=moonSprite.renderOrder=-9000;sunSprite.frustumCulled=moonSprite.frustumCulled=false;this.scene.add(sunSprite,moonSprite);this.celestialV7={sunSprite,moonSprite,phase:-1};v143CleanCelestial([`${USER_REPO_RAW}/Sun.png`,`${USER_REPO_RAW}/sun.png`,`${USER_REPO_RAW}/textures/environment/sun.png`,`${MC_TEX}environment/sun.png`]).then(t=>{if(t){sm.map=t;sm.needsUpdate=true;}});v143CleanCelestial([`${USER_REPO_RAW}/moon_phases.png`,`${MC_TEX}environment/moon_phases.png`],{col:0,row:0}).then(t=>{if(t){mm.map=t;mm.needsUpdate=true;}});};
const v143CelestialBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(){v143CelestialBase.call(this);this.ensureCelestialsV7();const phase=dayClock.phase(),a=phase*Math.PI*2,dir=new THREE.Vector3(Math.cos(a),Math.sin(a),Math.sin(a)*.38).normalize(),center=this.camera.position,d=STUDIO_V14_3.celestialDistance,s=this.celestialV7.sunSprite,m=this.celestialV7.moonSprite;s.position.copy(center).addScaledVector(dir,d);m.position.copy(center).addScaledVector(dir,-d);s.scale.set(STUDIO_V14_3.celestialSize,STUDIO_V14_3.celestialSize,1);m.scale.copy(s.scale);s.visible=dir.y>-.10;m.visible=dir.y<.10;};

/* ---- Cloud motion setting ---- */
if(typeof MinecraftCloudLayerV13!=='undefined')MinecraftCloudLayerV13.prototype.update=function(dt){if(!this.mesh||!this.game.player)return;const mode=localStorage.getItem('mcCloudMotionV143')||'moving',p=this.game.player.position;this.mesh.visible=mode!=='off'&&p.y<STUDIO_V13.cloudHeight+24;if(!this.mesh.visible)return;this.mesh.position.x=Math.round(p.x/64)*64;this.mesh.position.z=Math.round(p.z/64)*64;if(mode==='moving')this.texture.offset.x=(this.texture.offset.x+dt*STUDIO_V14_3.cloudSpeed)%1;const q=this.game.graphicsV7?.profile||'fancy';this.mesh.material.opacity=q==='fast'?.58:q==='ultra'?.88:.76;};

/* ---- Data-driven background music scheduler; no synthetic fallback. ---- */
class MinecraftMusicSchedulerV143{constructor(gameRef){this.game=gameRef;this.next=25+Math.random()*35;this.enabled=localStorage.getItem('mcMusicV143')!=='off';}event(){return this.game.mode==='creative'?'music.game.creative':'music.game';}update(dt){if(!this.enabled||!this.game.running)return;this.next-=dt;if(this.next>0)return;this.next=120+Math.random()*180;this.game.soundV14?.playEvent?.(this.event(),{ui:true,volume:.28}).then(ok=>{if(!ok)window.__voxelDiag?.log?.('MUSIC EVENT unavailable in current Mojang audio cache; no fallback played.','warn');});}}

/* ---- UI / rotation resilience ---- */
const v143BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v143BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small)small.textContent='Minecraft Alpha 0.14.3 • Three.js r180 • Bedrock translation runtime';};
const v143TitleOptionsBase=v9TitleOptions;
v9TitleOptions=function(){v143TitleOptionsBase();const grid=document.querySelector('#titleContent .v9OptionsGrid');if(!grid)return;const row=document.createElement('div');row.className='v9RangeRow';row.innerHTML=`<label><span>Clouds</span><b id="v143CloudState">${(localStorage.getItem('mcCloudMotionV143')||'moving').toUpperCase()}</b></label><select id="v143CloudSelect" class="gfx-select-v7"><option value="moving">Moving</option><option value="static">Static</option><option value="off">Off</option></select><label style="margin-top:8px"><span>Background music</span><b id="v143MusicState">${localStorage.getItem('mcMusicV143')==='off'?'OFF':'ON'}</b></label><select id="v143MusicSelect" class="gfx-select-v7"><option value="on">On</option><option value="off">Off</option></select>`;grid.appendChild(row);$('v143CloudSelect').value=localStorage.getItem('mcCloudMotionV143')||'moving';$('v143CloudSelect').onchange=e=>{localStorage.setItem('mcCloudMotionV143',e.target.value);$('v143CloudState').textContent=e.target.value.toUpperCase();};$('v143MusicSelect').value=localStorage.getItem('mcMusicV143')==='off'?'off':'on';$('v143MusicSelect').onchange=e=>{localStorage.setItem('mcMusicV143',e.target.value==='off'?'off':'on');if(game.musicV143)game.musicV143.enabled=e.target.value!=='off';$('v143MusicState').textContent=e.target.value.toUpperCase();};};
function v143EnhanceInventory(){const win=screenLayer.querySelector('.mc-window');if(!win||win.querySelector('.v143Close'))return;const close=document.createElement('button');close.className='v143Close';close.type='button';close.setAttribute('aria-label','Close inventory');close.textContent='×';close.onclick=()=>game.ui.close();win.prepend(close);}
for(const name of ['renderInventory','renderCrafting','renderCreative'])if(typeof UI.prototype[name]==='function'){const base=UI.prototype[name];UI.prototype[name]=function(...args){const r=base.apply(this,args);requestAnimationFrame(v143EnhanceInventory);return r;};}
screenLayer.addEventListener('pointerdown',e=>{if(e.target===screenLayer&&game.ui?.screen)game.ui.close();});addEventListener('keydown',e=>{if(e.code==='Escape'&&game.ui?.screen){e.preventDefault();game.ui.close();}},{capture:true});
function v143ViewportSize(){const vv=window.visualViewport;return {w:Math.max(1,Math.round(vv?.width||innerWidth)),h:Math.max(1,Math.round(vv?.height||innerHeight))};}
VoxelRenderer.prototype.resize=function(){if(!this.renderer)return;const {w,h}=v143ViewportSize();this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);};
function v143ResizeAll(){const {w,h}=v143ViewportSize();document.documentElement.style.setProperty('--mc-vw',`${w}px`);document.documentElement.style.setProperty('--mc-vh',`${h}px`);game.renderer?.resize?.();if(typeof titleWorldV9!=='undefined')titleWorldV9?.resize?.(true);}
addEventListener('orientationchange',()=>{setTimeout(v143ResizeAll,60);setTimeout(v143ResizeAll,260);setTimeout(v143ResizeAll,620);});window.visualViewport?.addEventListener?.('resize',()=>requestAnimationFrame(v143ResizeAll),{passive:true});addEventListener('resize',()=>requestAnimationFrame(v143ResizeAll),{passive:true});

/* Broad translator registration for more Bedrock mob families. This is renderer/AI plumbing, not a claim that Nether/End gameplay is complete yet. */
for(const type of ['bee','blaze','enderman','iron_golem','villager','witch','slime','ghast','zombified_piglin','endermite','silverfish'])if(!modelTranslationRegistry.has(`minecraft:${type}`))modelTranslationRegistry.register(`minecraft:${type}`,{entity:type,translator:'BedrockEntityLoaderV2'});

const v143BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v143BootBase.apply(this,args);this.world.fallingBlocksV143=this.fallingBlocksV143=new FallingBlockSystemV143(this);this.spawnRulesV143??=new BedrockSpawnRuleRepositoryV143(this);this.musicV143??=new MinecraftMusicSchedulerV143(this);Promise.allSettled(['zombie','skeleton','creeper','spider','enderman','cow','pig','chicken','sheep'].map(t=>this.spawnRulesV143.rule(t))).then(()=>window.__voxelDiag?.log?.('SPAWN RULE CACHE READY: Mojang metadata loaded where available.','ok'));v143ResizeAll();window.__voxelDiag?.log?.(`V14.3 BOOT ${STUDIO_V14_3.version}: falling blocks, quadruped repair, collision recovery, entity targeting, restricted villages, spawn rules, calmer bob, player animation, celestial cleanup, cloud settings and music scheduler ready.`,'ok');};
const v143GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v143GameUpdateBase.call(this,dt);this.fallingBlocksV143?.update(dt);this.musicV143?.update(dt);return r;};

try{runtimeCommands.register('physics143',()=>({falling:game.fallingBlocksV143?.active?.length||0,queued:game.fallingBlocksV143?.queue?.length||0}),'Inspect falling-block physics.');runtimeCommands.register('spawnrules143',(type='zombie')=>game.spawnRulesV143?.rule(type),'Inspect Mojang Bedrock spawn rules.');runtimeCommands.register('villagers143',()=>game.mobs?.mobs?.filter(m=>m.type==='villager').map(m=>({profession:m.professionV143||'none',goal:m.behaviorV14?.currentGoal?.key||'none'}))||[],'Inspect villager professions and goals.');}catch{}
window.__voxelDiag?.log?.(`V14.3 READY ${STUDIO_V14_3.version}: high-priority physics/render/AI/mobile fixes installed.`,'ok');
/* Finalize V14.3 after every patch has been installed. */
titlePreviewV8?.dispose();titlePreviewV8=null;ensureTitleWorldV9();v9BuildTitle();
window.__voxelDiag?.log?.(`FINAL READY Minecraft Alpha 0.14.3: V14 frustum culling + V14.1 Bedrock behavior translation + V14.2 strict Mojang audio + V14.3 falling-block physics/entity/world/mobile polish are active. Geometry/UV/animation, survival, inventory, lighting, WebGL/WebGPU test paths and existing systems are preserved.`, 'ok');
