/* Minecraft Web V16.3 — Java 26.1 block textures, 3D inventory blocks and transparent destroy stages */
(function(){
'use strict';
const BUILD='0.16.3';
const JAVA_BLOCK_ROOT_V163='./assets/java/26.1/blocks/';
const JAVA_RAW_ROOT_V163='https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/blocks/';

/* -------------------------------------------------------------------------- */
/* WORLD BLOCK TEXTURES — local Java 26.1 is authoritative                    */
/* -------------------------------------------------------------------------- */
const BLOCK_TEXTURE_V163=Object.freeze({
  grass_top:'grass_block_top',grass_side:'grass_block_side',grass_side_overlay:'grass_block_side_overlay',
  dirt:'dirt',stone:'stone',sand:'sand',gravel:'gravel',
  oak_log:'oak_log',oak_log_top:'oak_log_top',oak_leaves:'oak_leaves',oak_leaves_opaque:'oak_leaves',oak_planks:'oak_planks',
  cobblestone:'cobblestone',glass:'glass',coal_ore:'coal_ore',iron_ore:'iron_ore',diamond_ore:'diamond_ore',bedrock:'bedrock',
  water:'water_still',torch:'torch',crafting_table_top:'crafting_table_top',crafting_table_side:'crafting_table_side',crafting_table_front:'crafting_table_front',
  bricks:'bricks',obsidian:'obsidian',snow:'snow',tall_grass:'short_grass',flower:'allium',glowstone:'glowstone',
  furnace_side:'furnace_side',furnace_top:'furnace_top',furnace_front:'furnace_front',furnace_front_off:'furnace_front',furnace_front_on:'furnace_front_on',
  tnt_top:'tnt_top',tnt_bottom:'tnt_bottom',tnt_side:'tnt_side'
});
function logicalStemV163(name){
  const clean=String(name||'').replace(/^textures\//,'').replace(/\.png$/,'').split('/').pop();
  return BLOCK_TEXTURE_V163[clean]||null;
}
if(typeof AssetResolver!=='undefined'){
  const loadTextureBaseV163=AssetResolver.prototype.loadTexture;
  AssetResolver.prototype.loadTexture=async function(name){
    const stem=logicalStemV163(name);
    if(!stem)return loadTextureBaseV163.call(this,name);
    if(this.textures.has(name))return this.textures.get(name);
    const candidates=[`${JAVA_BLOCK_ROOT_V163}${stem}.png`,`${JAVA_RAW_ROOT_V163}${stem}.png`];
    for(const url of candidates){
      try{
        const bmp=await this.cache.image(url);
        this.textures.set(name,bmp);
        this.textureInfo.set(name,{name,filename:`${stem}.png`,url,source:'JAVA 26.1',path:`blocks/${stem}.png`,width:bmp.width||16,height:bmp.height||16,colorSpace:'sRGB',generateMipmaps:true,minFilter:'NearestMipmapLinearFilter',magFilter:'NearestFilter',anisotropy:'dynamic',alpha:'java',role:name});
        this._diag?.(`✓ ${name} → JAVA 26.1 ${stem}.png`,'ok');
        return bmp;
      }catch{}
    }
    this._diag?.(`JAVA 26.1 texture unavailable for ${name}/${stem}; using compatibility fallback.`,'warn');
    return loadTextureBaseV163.call(this,name);
  };
}
if(typeof Game!=='undefined'&&typeof Game.prototype.textureList==='function'){
  const textureListBaseV163=Game.prototype.textureList;
  Game.prototype.textureList=function(){
    const list=textureListBaseV163.call(this).slice();
    for(const n of ['grass_side_overlay','crafting_table_front','furnace_top','furnace_front'])if(!list.includes(n))list.push(n);
    return list;
  };
}
if(typeof BLOCK_FACE_TEXTURE!=='undefined'){
  BLOCK_FACE_TEXTURE[BLOCK.GRASS]={up:'grass_top',down:'dirt',east:'grass_side',west:'grass_side',north:'grass_side',south:'grass_side'};
  BLOCK_FACE_TEXTURE[BLOCK.GLASS]={all:'glass'};
  BLOCK_FACE_TEXTURE[BLOCK.CRAFTING_TABLE]={up:'crafting_table_top',down:'oak_planks',north:'crafting_table_front',south:'crafting_table_side',east:'crafting_table_side',west:'crafting_table_side'};
  BLOCK_FACE_TEXTURE[BLOCK.FURNACE]={up:'furnace_top',down:'furnace_top',north:'furnace_front',south:'furnace_side',east:'furnace_side',west:'furnace_side'};
}

/* Glass in the Java pack is mostly alpha=0 with opaque frame pixels. Do not
   make the entire texture 42% opaque: that washes out the real texture. */
function repairGlassMaterialV163(){
  const m=game?.renderer?.materialGlass;if(!m)return;
  m.color?.set?.(0xffffff);m.transparent=true;m.opacity=1;m.alphaTest=.08;m.depthTest=true;m.depthWrite=true;m.side=THREE.FrontSide;m.blending=THREE.NormalBlending;m.premultipliedAlpha=false;m.toneMapped=false;m.needsUpdate=true;
}

/* -------------------------------------------------------------------------- */
/* INVENTORY/HOTBAR — Java-style 3D block-item cubes using the same textures   */
/* -------------------------------------------------------------------------- */
const CUBE_ITEM_V163=new Map([
  [ITEM.GRASS,{top:'grass_block_top',left:'grass_block_side',right:'grass_block_side',bottom:'dirt',tint:'grass',sideOverlay:'grass_block_side_overlay'}],
  [ITEM.DIRT,{all:'dirt'}],[ITEM.STONE,{all:'stone'}],[ITEM.SAND,{all:'sand'}],[ITEM.GRAVEL,{all:'gravel'}],
  [ITEM.OAK_LOG,{top:'oak_log_top',left:'oak_log',right:'oak_log'}],[ITEM.OAK_LEAVES,{all:'oak_leaves',tint:'leaves'}],[ITEM.OAK_PLANKS,{all:'oak_planks'}],
  [ITEM.COBBLESTONE,{all:'cobblestone'}],[ITEM.GLASS,{all:'glass',glass:true}],[ITEM.COAL_ORE,{all:'coal_ore'}],[ITEM.IRON_ORE,{all:'iron_ore'}],[ITEM.DIAMOND_ORE,{all:'diamond_ore'}],
  [ITEM.CRAFTING_TABLE,{top:'crafting_table_top',left:'crafting_table_side',right:'crafting_table_front'}],[ITEM.BRICKS,{all:'bricks'}],[ITEM.OBSIDIAN,{all:'obsidian'}],
  [ITEM.SNOW,{all:'snow'}],[ITEM.GLOWSTONE,{all:'glowstone'}],[ITEM.FURNACE,{top:'furnace_top',left:'furnace_side',right:'furnace_front'}],
  [ITEM.TNT,{top:'tnt_top',left:'tnt_side',right:'tnt_side'}]
]);
try{if(typeof V8_ITEM!=='undefined'&&V8_ITEM.WHITE_WOOL!=null)CUBE_ITEM_V163.set(V8_ITEM.WHITE_WOOL,{all:'white_wool'})}catch{}
const inventoryStyleV163=document.createElement('style');
inventoryStyleV163.id='javaBlockItemsV163';
inventoryStyleV163.textContent=`
.inv-slot{position:relative}
.javaCubeItemV163{position:absolute;left:50%;top:50%;width:19px;height:19px;transform-style:preserve-3d;transform:translate(-50%,-54%) rotateX(-28deg) rotateY(43deg);pointer-events:none;z-index:2}
.javaCubeFaceV163{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;transform-origin:center;backface-visibility:hidden}
.javaCubeTopV163{transform:rotateX(90deg) translateZ(9.5px);filter:brightness(1.02)}
.javaCubeLeftV163{transform:translateZ(9.5px);filter:brightness(.88)}
.javaCubeRightV163{transform:rotateY(90deg) translateZ(9.5px);filter:brightness(.72)}
.javaCubeTintLayerV163{position:absolute;inset:0;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;pointer-events:none}
.javaCubeGlassV163 .javaCubeFaceV163{filter:none}
.inv-slot .stack-count{z-index:7}
.hotbar-slot .javaCubeItemV163{width:18px;height:18px}
`;
document.head.appendChild(inventoryStyleV163);
function rgbTintV163(kind){
  let c=null;
  try{const p=game?.player?.position||game?.player||{x:0,z:0};c=javaBiomeTintV145?.(game?.world,p.x||0,p.z||0,kind)}catch{}
  if(!Array.isArray(c))c=kind==='leaves'?[0x77/255,0xab/255,0x2f/255]:[0x91/255,0xbd/255,0x59/255];
  return `rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`;
}
const texURLV163=stem=>`${JAVA_BLOCK_ROOT_V163}${stem}.png`;
function faceHtmlV163(cls,stem,tintKind=null,overlay=null,overlayTintKind=null){
  if(!stem)return '';
  const tint=tintKind?rgbTintV163(tintKind):null,overlayTint=overlayTintKind?rgbTintV163(overlayTintKind):(tint||rgbTintV163('grass'));
  const style=`background-image:url('${texURLV163(stem)}')${tint?`;background-color:${tint};background-blend-mode:multiply`:''}`;
  const extra=overlay?`<span class="javaCubeTintLayerV163" style="background-image:url('${texURLV163(overlay)}');background-color:${overlayTint};background-blend-mode:multiply"></span>`:'';
  return `<i class="javaCubeFaceV163 ${cls}" style="${style}">${extra}</i>`;
}
function cubeHtmlV163(spec){
  const top=spec.top||spec.all,left=spec.left||spec.all,right=spec.right||spec.all,tint=spec.tint||null,sideTint=spec.sideOverlay?null:tint;
  return `<span class="javaCubeItemV163${spec.glass?' javaCubeGlassV163':''}">${faceHtmlV163('javaCubeTopV163',top,tint)}${faceHtmlV163('javaCubeLeftV163',left,sideTint,spec.sideOverlay||null,tint)}${faceHtmlV163('javaCubeRightV163',right,sideTint,spec.sideOverlay||null,tint)}</span>`;
}
if(typeof UI!=='undefined'&&typeof UI.prototype.slotHtml==='function'){
  const slotHtmlBaseV163=UI.prototype.slotHtml;
  UI.prototype.slotHtml=function(prefix,s,i=-1){
    if(!s||s.empty?.())return slotHtmlBaseV163.call(this,prefix,s,i);
    const spec=CUBE_ITEM_V163.get(s.id);if(!spec)return slotHtmlBaseV163.call(this,prefix,s,i);
    const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'';
    return `<div class="inv-slot java3DBlockSlotV163" data-slot="${prefix}" title="${label}">${cubeHtmlV163(spec)}${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`;
  };
}

/* -------------------------------------------------------------------------- */
/* DESTROY STAGES — true transparent background, cracks only                  */
/* -------------------------------------------------------------------------- */
if(typeof MinecraftBreakOverlayV147!=='undefined'){
  MinecraftBreakOverlayV147.prototype.texture=async function(stage){
    stage=clamp(stage|0,0,9);if(this.textures[stage])return this.textures[stage];if(this.pending[stage])return this.pending[stage];
    this.pending[stage]=(async()=>{
      const rel=`blocks/destroy_stage_${stage}.png`,{image,url}=await java261FirstImage(rel),cv=document.createElement('canvas');
      cv.width=image.width||16;cv.height=image.height||16;const cx=cv.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=false;cx.clearRect(0,0,cv.width,cv.height);cx.drawImage(image,0,0);image.close?.();
      const im=cx.getImageData(0,0,cv.width,cv.height),d=im.data;
      /* Prismarine's Java destroy-stage files carry alpha=1 in visually empty
         texels. Convert those to actual alpha=0 so no gray/white veil can ever
         blend over the block. Opaque crack pixels retain the original Java RGB. */
      for(let p=0;p<d.length;p+=4){if(d[p+3]<=8){d[p]=d[p+1]=d[p+2]=255;d[p+3]=0}}
      cx.putImageData(im,0,0);
      const t=java261CanvasTexture(cv,url);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.premultiplyAlpha=false;t.needsUpdate=true;this.textures[stage]=t;return t;
    })().catch(e=>{window.__voxelDiag?.log?.(`V16.3 BREAK STAGE ${stage} unavailable: ${e.message}`,'err');return null}).finally(()=>this.pending[stage]=null);
    return this.pending[stage];
  };
  const breakEnsureBaseV163=MinecraftBreakOverlayV147.prototype.ensure;
  MinecraftBreakOverlayV147.prototype.ensure=function(){
    breakEnsureBaseV163.call(this);
    for(const m of this.materials||[]){m.color.set(0xffffff);m.transparent=true;m.opacity=1;m.alphaTest=.02;m.depthTest=true;m.depthWrite=false;m.blending=THREE.NormalBlending;m.premultipliedAlpha=false;m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;m.toneMapped=false;m.fog=false;m.needsUpdate=true}
    if(this.mesh){this.mesh.renderOrder=1200;this.mesh.name='java_destroy_stage_v163_transparent'}
  };
}

/* Keep final material fixes authoritative after boot and before draw. */
if(typeof Game!=='undefined'&&typeof Game.prototype.boot==='function'){
  const bootBaseV163=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const r=await bootBaseV163.apply(this,args);repairGlassMaterialV163();this.breakOverlayV147?.ensure?.();return r};
}
if(typeof VoxelRenderer!=='undefined'&&typeof VoxelRenderer.prototype.render==='function'){
  const renderBaseV163=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(...args){repairGlassMaterialV163();return renderBaseV163.apply(this,args)};
}

window.MINECRAFT_WEB_VERSION=BUILD;
try{runtimeCommands.register('blocks163',()=>({build:BUILD,javaBlockRoot:JAVA_BLOCK_ROOT_V163,glass:{opacity:game?.renderer?.materialGlass?.opacity,alphaTest:game?.renderer?.materialGlass?.alphaTest,source:game?.resolver?.textureInfo?.get?.('glass')?.source||null},grass:{top:game?.resolver?.textureInfo?.get?.('grass_top')?.url||null,side:game?.resolver?.textureInfo?.get?.('grass_side')?.url||null,overlay:game?.resolver?.textureInfo?.get?.('grass_side_overlay')?.url||null},inventory3DBlocks:CUBE_ITEM_V163.size,breakOverlay:{name:game?.breakOverlayV147?.mesh?.name||null,opacity:game?.breakOverlayV147?.materials?.[0]?.opacity??null,alphaTest:game?.breakOverlayV147?.materials?.[0]?.alphaTest??null}}),'Inspect V16.3 Java block textures, 3D inventory blocks, glass and transparent destroy stages.')}catch{}
window.__voxelDiag?.log?.('V16.3 BLOCKS: local Java 26.1 block textures authoritative; 3D block items; opaque-frame/transparent-interior glass; true-alpha destroy stages.','ok');
})();
