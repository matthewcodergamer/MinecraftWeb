/* ===================== V14.5: JAVA-ONLY CLIENT SYSTEMS / MOBILE FIX PASS ===================== */
const STUDIO_V14_5=Object.freeze({
  version:'0.14.5-java-runtime',
  javaVersion:'1.21.8',
  passiveThinkHz:5,
  audioBufferLimit:48,
  celestialSize:72,
  cloudHeight:88,
  playerSweepStep:.12,
  mobRecoveryBudget:4
});
window.STUDIO_PATCH_VERSION=STUDIO_V14_5.version;
window.MINECRAFT_WEB_VERSION='0.14.5';
const JAVA_ASSET_ROOT_V145=`https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/${STUDIO_V14_5.javaVersion}/`;
const JAVA_MIRROR_ROOT_V145=`https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${STUDIO_V14_5.javaVersion}/assets/minecraft/`;
const JAVA_SOUND_ROOT_V145=`${JAVA_MIRROR_ROOT_V145}sounds/`;
const JAVA_SOUNDS_JSON_V145=`${JAVA_MIRROR_ROOT_V145}sounds.json`;

/* -------------------------------------------------------------------------- */
/* JAVA ASSET NAMES                                                           */
/* -------------------------------------------------------------------------- */
const JAVA_ITEM_RENAMES_V145=Object.freeze({
  raw_porkchop:'porkchop',raw_beef:'beef',raw_chicken:'chicken',raw_mutton:'mutton',
  wood_pickaxe:'wooden_pickaxe',wood_axe:'wooden_axe',wood_sword:'wooden_sword',
  grass:'grass_block',snow:'snow_block',torch_item:'torch',white_wool:'white_wool'
});
function javaItemNameV145(id){
  if(!id)return 'air';
  const direct=new Map([
    [V8_ITEM?.RAW_BEEF,'beef'],[V8_ITEM?.RAW_PORKCHOP,'porkchop'],[V8_ITEM?.RAW_CHICKEN,'chicken'],[V8_ITEM?.RAW_MUTTON,'mutton'],
    [V8_ITEM?.WHITE_WOOL,'white_wool'],[V8_ITEM?.ROTTEN_FLESH,'rotten_flesh'],[V8_ITEM?.BONE,'bone'],[V8_ITEM?.LEATHER,'leather'],
    [V8_ITEM?.FEATHER,'feather'],[V8_ITEM?.GUNPOWDER,'gunpowder'],[V8_ITEM?.SHIELD,'shield'],[V8_ITEM?.BOW,'bow'],[V8_ITEM?.BONE_MEAL,'bone_meal']
  ]);
  if(direct.has(id))return direct.get(id);
  let n=String(ITEM_NAME.get(id)||BLOCK_NAME?.[id]||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  return JAVA_ITEM_RENAMES_V145[n]||n;
}
function javaItemURLV145(id){const n=javaItemNameV145(id);return n?`${JAVA_ASSET_ROOT_V145}items/${n}.png`:'';}
function javaLocalOrRemoteV145(rel){return [`./assets/java/${rel}`,`${JAVA_ASSET_ROOT_V145}${rel}`];}

/* Fix all slot/hotbar item naming. No Bedrock item-icon fallback for Java-mapped items. */
UI.prototype.slotHtml=function(prefix,s,i=-1){
  if(!s||s.empty?.())return `<div class="inv-slot" data-slot="${prefix}" title=""></div>`;
  const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'',url=javaItemURLV145(s.id);
  return `<div class="inv-slot" data-slot="${prefix}" title="${label}">${url?`<img class="item-icon javaItemIconV145" src="${url}" alt="${label}">`:''}${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`;
};
const v145IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){const n=javaItemNameV145(id);if(n&&n!=='air')return `${JAVA_ASSET_ROOT_V145}items/${n}.png`;return v145IconBase.call(this,id);};

/* -------------------------------------------------------------------------- */
/* JAVA-ONLY CORE BLOCK TEXTURES + BIOME TINT                                 */
/* -------------------------------------------------------------------------- */
const JAVA_BLOCK_TEXTURE_V145=Object.freeze({
  grass_top:'grass_block_top',grass_side:'grass_block_side',dirt:'dirt',stone:'stone',sand:'sand',gravel:'gravel',
  oak_log:'oak_log',oak_log_top:'oak_log_top',oak_leaves:'oak_leaves',oak_leaves_opaque:'oak_leaves',oak_planks:'oak_planks',
  cobblestone:'cobblestone',glass:'glass',coal_ore:'coal_ore',iron_ore:'iron_ore',diamond_ore:'diamond_ore',bedrock:'bedrock',
  torch:'torch',crafting_table_top:'crafting_table_top',crafting_table_side:'crafting_table_side',bricks:'bricks',obsidian:'obsidian',
  snow:'snow',tall_grass:'short_grass',flower:'allium',glowstone:'glowstone',furnace_side:'furnace_side',furnace_front:'furnace_front',
  furnace_front_off:'furnace_front',furnace_front_on:'furnace_front_on',chest:'oak_planks',tnt_top:'tnt_top',tnt_bottom:'tnt_bottom',tnt_side:'tnt_side'
});
function javaBlockStemV145(name){const clean=String(name||'').replace(/^textures\//,'').replace(/\.png$/,'').split('/').pop();return JAVA_BLOCK_TEXTURE_V145[clean]||null;}
const v145LoadTextureBase=AssetResolver.prototype.loadTexture;
AssetResolver.prototype.loadTexture=async function(name){
  const stem=javaBlockStemV145(name);if(!stem)return v145LoadTextureBase.call(this,name);if(this.textures.has(name))return this.textures.get(name);
  const candidates=[`./assets/java/blocks/${stem}.png`,`${JAVA_ASSET_ROOT_V145}blocks/${stem}.png`];
  for(const url of candidates){try{const bmp=await this.cache.image(url);this.textures.set(name,bmp);this.textureInfo.set(name,{name,filename:`${stem}.png`,url,source:'JAVA EDITION',path:`blocks/${stem}.png`,width:bmp.width||16,height:bmp.height||16,colorSpace:'sRGB',generateMipmaps:true,minFilter:'NearestMipmapLinearFilter',magFilter:'NearestFilter',anisotropy:'dynamic',alpha:'java',role:name});this._diag(`✓ ${name} → JAVA ${url}`,'ok');return bmp;}catch{}}
  this.failures.add(name);const fallback=this.makeFallback(name);this.textures.set(name,fallback);this.textureInfo.set(name,{name,url:`fallback://java/${name}`,source:'JAVA-MISSING',width:16,height:16});this._diag(`✗ JAVA texture unavailable ${name}/${stem}; Bedrock fallback intentionally disabled`,'err');return fallback;
};
function javaBiomeTintV145(world,x,z,kind){
  const biome=world?.generator?.biome?.(Math.floor(x),Math.floor(z))||'plains';
  if(kind==='leaves')return biome==='snowy'?[.38,.59,.31]:biome==='desert'?[.58,.66,.28]:biome==='forest'?[.30,.62,.22]:[.42,.68,.27];
  if(biome==='snowy')return [.50,.67,.36];if(biome==='desert')return [.74,.72,.35];if(biome==='forest')return [.43,.70,.27];return [.56,.74,.35];
}
const v145AddQuadBase=ChunkMesher.prototype.addQuad;
ChunkMesher.prototype.addQuad=function(positions,normals,uvs,colors,buckets,x,y,z,face,texture){
  const id=this.currentBlock;if(id===BLOCK.WATER)return v145AddQuadBase.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);
  const tinted=(id===BLOCK.GRASS&&face==='up')||id===BLOCK.OAK_LEAVES;
  if(!tinted)return v145AddQuadBase.call(this,positions,normals,uvs,colors,buckets,x,y,z,face,texture);
  const base=positions.length/3,f=VOXEL_FACES.find(q=>q.key===face),verts=voxelFaceVertices(x,y,z,f),t=javaBiomeTintV145(this.world,x,z,id===BLOCK.OAK_LEAVES?'leaves':'grass');
  for(const v of verts)positions.push(...v);for(let i=0;i<4;i++){normals.push(...f.n);colors.push(...t);}for(const q of f.uv){const uv=this.atlas.uv(texture,q[0],q[1]);uvs.push(...uv);}const idx=buckets[this.materialKind(id)];idx.push(base,base+1,base+2,base,base+2,base+3);
};
ChunkMesher.prototype.addPlantQuad=function(p,n,u,c,b,x,y,z,id){
  const tex=id===BLOCK.FLOWER?'flower':'tall_grass',t=id===BLOCK.TALL_GRASS?javaBiomeTintV145(this.world,x,z,'grass'):[1,1,1];
  const add=(a,bv,cv,d,normal)=>{const base=p.length/3;for(const v of [a,bv,cv,d])p.push(...v);for(let k=0;k<4;k++){n.push(...normal);c.push(...t);}for(const q of [[0,0],[1,0],[1,1],[0,1]]){const uv=this.atlas.uv(tex,q[0],q[1]);u.push(...uv);}b.cutout.push(base,base+1,base+2,base,base+2,base+3,base,base+2,base+1,base,base+3,base+2);};
  add([x,y,z],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z],[-.707,0,.707]);add([x+1,y,z],[x,y,z+1],[x,y+1,z+1],[x+1,y+1,z],[.707,0,.707]);
};

/* Exact Java template_torch proportions (2×10×2 pixels in a 16px block model). */
ChunkMesher.prototype.addTorchQuad=function(p,n,u,c,b,x,y,z){
  const x0=x+7/16,x1=x+9/16,y0=y,y1=y+10/16,z0=z+7/16,z1=z+9/16;
  const emit=(verts,normal,rect)=>{const base=p.length/3;for(const v of verts)p.push(...v);for(let i=0;i<4;i++){n.push(...normal);c.push(1,1,1);}const [u0,v0,u1,v1]=rect.map(v=>v/16),qs=[[u0,v1],[u1,v1],[u1,v0],[u0,v0]];for(const q of qs){const uv=this.atlas.uv('torch',q[0],q[1]);u.push(...uv);}b.cutout.push(base,base+1,base+2,base,base+2,base+3);};
  emit([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[0,0,-1],[7,6,9,16]);
  emit([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],[7,6,9,16]);
  emit([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[-1,0,0],[7,6,9,16]);
  emit([[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[1,0,0],[7,6,9,16]);
  emit([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[0,1,0],[7,6,9,8]);
  emit([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],[7,13,9,15]);
};

/* -------------------------------------------------------------------------- */
/* JAVA GENERATED/HANDHELD ITEMS                                              */
/* -------------------------------------------------------------------------- */
const JAVA_HELD_GEOMETRY_V145=new Map();
async function javaItemTextureV145(url){const bmp=await game.assets.image(url),cv=document.createElement('canvas');cv.width=bmp.width;cv.height=bmp.height;const cx=cv.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=false;cx.drawImage(bmp,0,0);bmp.close?.();const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return {texture:t,canvas:cv};}
function javaExtrudedItemGeometryV145(canvas){
  const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d',{willReadFrequently:true}),data=ctx.getImageData(0,0,w,h).data,pos=[],norm=[],uv=[],idx=[],depth=.045,scale=.42/Math.max(w,h),ox=-w*scale*.5,oy=-h*scale*.5;
  const opaque=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&data[(y*w+x)*4+3]>28;
  const quad=(a,b,c,d,no,tu)=>{const base=pos.length/3;for(const q of [a,b,c,d])pos.push(...q);for(let k=0;k<4;k++)norm.push(...no);for(const q of tu)uv.push(...q);idx.push(base,base+1,base+2,base,base+2,base+3);};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!opaque(x,y))continue;const x0=ox+x*scale,x1=x0+scale,y1=-(oy+y*scale),y0=y1-scale,u0=x/w,u1=(x+1)/w,v1=1-y/h,v0=1-(y+1)/h,z0=-depth*.5,z1=depth*.5;
    quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]);quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],[[u1,v0],[u0,v0],[u0,v1],[u1,v1]]);
    if(!opaque(x-1,y))quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],[[u0,v0],[u0,v0],[u0,v1],[u0,v1]]);
    if(!opaque(x+1,y))quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],[[u1,v0],[u1,v0],[u1,v1],[u1,v1]]);
    if(!opaque(x,y-1))quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],[[u0,v1],[u1,v1],[u1,v1],[u0,v1]]);
    if(!opaque(x,y+1))quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],[[u0,v0],[u1,v0],[u1,v0],[u0,v0]]);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
HeldItemFactoryV8.prototype.flat=function(id){
  const root=new THREE.Group(),name=javaItemNameV145(id),urls=[`./assets/java/items/${name}.png`,`${JAVA_ASSET_ROOT_V145}items/${name}.png`];
  (async()=>{let last=null;for(const url of urls){try{const {texture,canvas}=await javaItemTextureV145(url);let geo=JAVA_HELD_GEOMETRY_V145.get(name);if(!geo){geo=javaExtrudedItemGeometryV145(canvas);JAVA_HELD_GEOMETRY_V145.set(name,geo);}const mat=new THREE.MeshBasicMaterial({map:texture,color:0xffffff,transparent:true,alphaTest:.05,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false}),mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=2500;mesh.frustumCulled=false;mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;root.add(mesh);return;}catch(e){last=e;}}window.__voxelDiag?.log?.(`JAVA HELD ITEM unavailable ${name}: ${last?.message||'not found'}`,'err');})();
  return root;
};
function javaTorchHeldV145(){
  const root=new THREE.Group(),geo=new THREE.BoxGeometry(.125,.625,.125),mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.06,depthTest:false,depthWrite:false,toneMapped:false}),mesh=new THREE.Mesh(geo,mat);mesh.position.y=.3125;root.add(mesh);
  (async()=>{for(const url of javaLocalOrRemoteV145('blocks/torch.png'))try{const {texture}=await javaItemTextureV145(url);mat.map=texture;mat.needsUpdate=true;return;}catch{}window.__voxelDiag?.log?.('JAVA TORCH texture unavailable; no Bedrock torch fallback used.','err');})();return root;
}
HeldItemFactoryV8.prototype.torch=function(){return javaTorchHeldV145();};
HeldItemFactoryV8.prototype.create=function(id){if(id===ITEM.TORCH)return this.prepare(this.torch());if(id===V8_ITEM.SHIELD)return this.prepare(this.shield());const block=this.game.itemToBlock(id);if(block!==BLOCK.AIR)return this.prepare(this.blocks.create(id));return this.prepare(this.flat(id));};
