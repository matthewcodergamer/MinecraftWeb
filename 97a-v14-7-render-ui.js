/* ===================== V14.7A: VISUAL FIDELITY + JAVA UI REPAIR ===================== */
const STUDIO_V14_7=Object.freeze({
  version:'0.14.7-fidelity-repair',
  javaVersion:'1.21.8',
  celestialDistance:310,
  celestialSize:64,
  horizonFade:0.075,
  crackOpacity:.78
});
window.STUDIO_PATCH_VERSION=STUDIO_V14_7.version;
window.MINECRAFT_WEB_VERSION='0.14.7';

/* ------------------------- Inventory / HUD isolation ------------------------- */
(function installV147UIStyle(){
  document.getElementById('v147UiStyle')?.remove();
  const s=document.createElement('style');s.id='v147UiStyle';s.textContent=`
#hotbar.javaHotbarV144,#hotbar{top:auto!important;bottom:max(12px,env(safe-area-inset-bottom))!important}
#hud.v147ScreenOpen #hotbar,#hud.v147ScreenOpen #survivalBars,#hud.v147ScreenOpen #mobileControls,#hud.v147ScreenOpen #crosshair,#hud.v147ScreenOpen #topStatus,#hud.v147ScreenOpen #mobileHint,#hud.v147ScreenOpen #voxelDiagToggle,#hud.v147ScreenOpen #cameraToggleV12,#hud.v147ScreenOpen #crouchStateV12,#hud.v147ScreenOpen #benchBtnV13{display:none!important}
#screenLayer.open{align-items:center!important;justify-content:center!important;overflow:hidden!important;padding:max(6px,env(safe-area-inset-top)) max(6px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left))!important}
#screenLayer .javaScreenV145{width:100%;height:100%;display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important}
#screenLayer .javaContainerV145{margin:auto!important;max-height:calc(100dvh - max(14px,env(safe-area-inset-top)) - max(14px,env(safe-area-inset-bottom)))!important}
@media(orientation:landscape) and (max-height:560px){#screenLayer .javaContainerV145{width:min(352px,calc((100dvh - 16px)*1.06024),calc(100dvw - 70px))!important}.javaCloseV145{right:-24px!important;top:0!important}}
#studioBreakOverlay{display:none!important}
`;
  document.head.appendChild(s);
})();
function v147SetUIScreen(open){document.getElementById('hud')?.classList.toggle('v147ScreenOpen',!!open);}
for(const name of ['openInventory','openCraftingTable','openFurnaceV7']){
  const base=UI.prototype[name];if(typeof base!=='function')continue;
  UI.prototype[name]=function(...args){const r=base.apply(this,args);v147SetUIScreen(true);return r;};
}
const v147UICloseBase=UI.prototype.close;
UI.prototype.close=function(...args){const r=v147UICloseBase.apply(this,args);v147SetUIScreen(false);return r;};

/* Camera mode changes should be silent: no large black toast covering gameplay. */
if(typeof PlayerCameraV12!=='undefined')PlayerCameraV12.prototype.cycle=function(){this.set(this.mode+1);this.game.saveSoon?.();return this.mode;};

/* ------------------------- Broken block-item icon repair ------------------------- */
const V147_BLOCK_ICON_STEMS=new Map([
  [ITEM.GRASS,'grass_block_top'],[ITEM.DIRT,'dirt'],[ITEM.STONE,'stone'],[ITEM.SAND,'sand'],[ITEM.GRAVEL,'gravel'],
  [ITEM.OAK_LOG,'oak_log'],[ITEM.OAK_LEAVES,'oak_leaves'],[ITEM.OAK_PLANKS,'oak_planks'],[ITEM.COBBLESTONE,'cobblestone'],
  [ITEM.GLASS,'glass'],[ITEM.COAL_ORE,'coal_ore'],[ITEM.IRON_ORE,'iron_ore'],[ITEM.DIAMOND_ORE,'diamond_ore'],
  [ITEM.CRAFTING_TABLE,'crafting_table_top'],[ITEM.BRICKS,'bricks'],[ITEM.OBSIDIAN,'obsidian'],[ITEM.SNOW,'snow'],
  [ITEM.GLOWSTONE,'glowstone'],[ITEM.FURNACE,'furnace_front'],[ITEM.TNT,'tnt_side']
]);
const v147IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){
  if(id===ITEM.TORCH)return './assets/java/blocks/torch.png';
  if(typeof V8_ITEM!=='undefined'&&id===V8_ITEM.WHITE_WOOL)return './assets/java/blocks/white_wool.png';
  const stem=V147_BLOCK_ICON_STEMS.get(id);if(stem)return `./assets/java/blocks/${stem}.png`;
  return v147IconBase.call(this,id);
};
const v147SlotBase=UI.prototype.slotHtml;
UI.prototype.slotHtml=function(prefix,s,i=-1){
  if(!s||s.empty?.())return v147SlotBase.call(this,prefix,s,i);
  const stem=V147_BLOCK_ICON_STEMS.get(s.id),special=s.id===ITEM.TORCH?'torch':(typeof V8_ITEM!=='undefined'&&s.id===V8_ITEM.WHITE_WOOL?'white_wool':null);
  if(!stem&&!special)return v147SlotBase.call(this,prefix,s,i);
  const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'',src=`./assets/java/blocks/${special||stem}.png`;
  return `<div class="inv-slot" data-slot="${prefix}" title="${label}"><img class="item-icon javaItemIconV145" src="${src}" alt="${label}">${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`;
};

/* ------------------------- Java celestial alpha/depth repair ------------------------- */
async function v147LoadImageCandidates(rel){
  let last=null;for(const url of [`./assets/java/${rel}`,`${JAVA_ASSET_ROOT_V145}${rel}`]){try{return {image:await game.assets.image(url),url};}catch(e){last=e;}}
  throw last||new Error(`Java image unavailable: ${rel}`);
}
function v147CleanCelestialCanvas(source,frame=null){
  const sw=source.width||16,sh=source.height||16,fw=frame?Math.floor(sw/4):sw,fh=frame?Math.floor(sh/2):sh,sx=frame?(frame.col%4)*fw:0,sy=frame?Math.floor(frame.row%2)*fh:0;
  const cv=document.createElement('canvas');cv.width=fw;cv.height=fh;const x=cv.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.clearRect(0,0,fw,fh);x.drawImage(source,sx,sy,fw,fh,0,0,fw,fh);
  const img=x.getImageData(0,0,fw,fh),d=img.data;
  for(let i=0;i<d.length;i+=4){
    const a=d[i+3];if(a<=2){d[i+3]=0;continue;}
    const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),neutral=mx-mn<24;
    if(neutral&&mx<28)d[i+3]=0;
    else if(neutral&&mx<58)d[i+3]=Math.round(a*clamp((mx-28)/30,0,1));
  }
  x.putImageData(img,0,0);return cv;
}
function v147CanvasTexture(cv,url=''){const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;t.userData.sourceURL=url;return t;}
async function v147CelestialTexture(rel,frame=null){const {image,url}=await v147LoadImageCandidates(rel);const cv=v147CleanCelestialCanvas(image,frame);image.close?.();return v147CanvasTexture(cv,url);}

VoxelRenderer.prototype.ensureCelestialsV7=function(){
  if(this.celestialV7?.v147)return;
  if(this.celestialV7){for(const q of [this.celestialV7.sunSprite,this.celestialV7.moonSprite]){q?.parent?.remove?.(q);q?.material?.map?.dispose?.();q?.material?.dispose?.();}}
  const make=()=>new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:1,alphaTest:.012,depthWrite:false,depthTest:true,fog:false,toneMapped:false,premultipliedAlpha:false});
  const sm=make(),mm=make(),sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.setScalar(STUDIO_V14_7.celestialSize);moonSprite.scale.copy(sunSprite.scale);sunSprite.frustumCulled=moonSprite.frustumCulled=false;sunSprite.renderOrder=moonSprite.renderOrder=-20;this.scene.add(sunSprite,moonSprite);this.celestialV7={sunSprite,moonSprite,phase:-1,v147:true};
  v147CelestialTexture('environment/sun.png').then(t=>{sm.map=t;sm.needsUpdate=true;}).catch(e=>window.__voxelDiag?.log?.(`V14.7 SUN texture failed: ${e.message}`,'err'));
  v147LoadImageCandidates('environment/moon_phases.png').then(({image,url})=>{this._v147MoonAtlasImage=image;this._v147MoonAtlasURL=url;this._v147MoonPhase=-1;}).catch(e=>window.__voxelDiag?.log?.(`V14.7 MOON atlas failed: ${e.message}`,'err'));
};
VoxelRenderer.prototype.updateCelestialsV7=function(){
  this.ensureCelestialsV7();const phase=dayClock.phase(),a=phase*Math.PI*2,dir=new THREE.Vector3(Math.cos(a),Math.sin(a),Math.sin(a)*.38).normalize(),center=this.camera.position,d=STUDIO_V14_7.celestialDistance,s=this.celestialV7.sunSprite,m=this.celestialV7.moonSprite;
  s.position.copy(center).addScaledVector(dir,d);m.position.copy(center).addScaledVector(dir,-d);s.scale.set(STUDIO_V14_7.celestialSize,STUDIO_V14_7.celestialSize,1);m.scale.copy(s.scale);
  const sunOpacity=clamp((dir.y-.012)/STUDIO_V14_7.horizonFade,0,1),moonOpacity=clamp((-dir.y-.012)/STUDIO_V14_7.horizonFade,0,1);s.visible=sunOpacity>.01;s.material.opacity=sunOpacity;m.visible=moonOpacity>.01;m.material.opacity=moonOpacity;
  if(this._v147LastPhase!=null&&this._v147LastPhase>.92&&phase<.08)this._v147Day=(this._v147Day||0)+1;this._v147LastPhase=phase;
  if(this._v147MoonAtlasImage){const p=(this._v147Day||0)%8;if(p!==this._v147MoonPhase){this._v147MoonPhase=p;const old=m.material.map,cv=v147CleanCelestialCanvas(this._v147MoonAtlasImage,{col:p%4,row:Math.floor(p/4)});m.material.map=v147CanvasTexture(cv,this._v147MoonAtlasURL);m.material.needsUpdate=true;old?.dispose?.();}}
};

/* ------------------------- Minecraft destroy-stage world overlay ------------------------- */
class MinecraftBreakOverlayV147{
  constructor(gameRef){this.game=gameRef;this.mesh=null;this.materials=[];this.textures=new Array(10);this.pending=new Array(10);this.stage=-1;this.key='';}
  ensure(){if(this.mesh||!this.game.renderer)return;const mats=[];for(let i=0;i<6;i++)mats.push(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:STUDIO_V14_7.crackOpacity,alphaTest:.015,depthTest:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,blending:THREE.NormalBlending}));this.materials=mats;this.mesh=new THREE.Mesh(new THREE.BoxGeometry(1.006,1.006,1.006),mats);this.mesh.visible=false;this.mesh.renderOrder=1200;this.mesh.frustumCulled=true;this.mesh.name='java_destroy_stage_v147';this.game.renderer.scene.add(this.mesh);}
  async texture(stage){if(this.textures[stage])return this.textures[stage];if(this.pending[stage])return this.pending[stage];this.pending[stage]=(async()=>{const rel=`blocks/destroy_stage_${stage}.png`;const {image,url}=await v147LoadImageCandidates(rel);const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(image,0,0);image.close?.();const t=v147CanvasTexture(cv,url);this.textures[stage]=t;return t;})().catch(e=>{window.__voxelDiag?.log?.(`BREAK STAGE ${stage} unavailable: ${e.message}`,'warn');return null;}).finally(()=>this.pending[stage]=null);return this.pending[stage];}
  hide(){if(this.mesh)this.mesh.visible=false;this.key='';this.stage=-1;}
  update(key,progress){this.ensure();if(!this.mesh||!key||progress<=0){this.hide();return;}const xyz=String(key).split(',').map(Number);if(xyz.length!==3||xyz.some(v=>!Number.isFinite(v))){this.hide();return;}const stage=clamp(Math.floor(progress*10),0,9);this.mesh.position.set(xyz[0]+.5,xyz[1]+.5,xyz[2]+.5);this.mesh.visible=true;this.key=key;if(stage===this.stage)return;this.stage=stage;this.texture(stage).then(t=>{if(!t||this.stage!==stage)return;for(const m of this.materials){m.map=t;m.needsUpdate=true;}});}
}
const v147TargetUpdateBase=targetFeedback.update.bind(targetFeedback);
targetFeedback.update=function(key,progress){if(this.element)this.element.style.display='none';game.breakOverlayV147??=new MinecraftBreakOverlayV147(game);game.breakOverlayV147.update(key,progress);};

const v147BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v147BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small&&/Minecraft Web/.test(small.textContent||''))small.textContent='Minecraft Web Alpha 0.14.7 • Java-first • Optimized + Fidelity Repair';};

const v147RenderBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){const r=await v147RenderBootBase.apply(this,args);v147SetUIScreen(false);this.breakOverlayV147??=new MinecraftBreakOverlayV147(this);window.__voxelDiag?.log?.('V14.7A READY: celestial alpha/depth/horizon, Java destroy-stage cracks, screen-safe inventory, silent camera switch and block icon fixes active.','ok');return r;};

try{runtimeCommands.register('visual147',()=>({version:STUDIO_V14_7.version,celestialDepthTest:game.renderer?.celestialV7?.sunSprite?.material?.depthTest??null,breakOverlay:!!game.breakOverlayV147,screenOpen:document.getElementById('hud')?.classList.contains('v147ScreenOpen')}),'Inspect V14.7 visual/UI repairs.');}catch{}
