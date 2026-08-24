/* ===================== V14.4: JAVA EDITION PRIMARY DATA / UI / COMBAT ===================== */
const STUDIO_V14_4=Object.freeze({
  version:'0.14.4-java-primary',
  javaVersion:'1.21.8',
  javaFallbackVersion:'1.21.5',
  sourceMode:'java-preferred-hybrid',
  dataPrewarm:['items','foods','blocks','blockCollisionShapes','entities','windows','sounds'],
});
window.STUDIO_PATCH_VERSION=STUDIO_V14_4.version;
window.MINECRAFT_WEB_VERSION='0.14.4';

const JAVA_ASSETS_ROOT=`https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/${STUDIO_V14_4.javaVersion}/`;
const JAVA_DATA_ROOT='https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/';
const JAVA_DATA_PATHS=`${JAVA_DATA_ROOT}dataPaths.json`;

/* Java Edition is now the preferred client-data layer. Bedrock remains the entity geometry / animation / behavior / strict-audio fallback because those files are already translated by the existing runtime. */
class JavaEditionRepositoryV144{
  constructor(gameRef){this.game=gameRef;this.pathMap=null;this.resolvedVersion=null;this.cache=new Map();this.indexes=new Map();this.inflight=new Map();this.errors=new Map();}
  async paths(){
    if(this.pathMap)return this.pathMap;
    const raw=JSON.parse(await this.game.assets.text(JAVA_DATA_PATHS));
    const pc=raw?.pc||{};
    const preferred=[STUDIO_V14_4.javaVersion,STUDIO_V14_4.javaFallbackVersion];
    let version=preferred.find(v=>pc[v]);
    if(!version){
      const versions=Object.keys(pc).filter(v=>/^1\./.test(v));
      version=versions.at(-1)||Object.keys(pc).at(-1);
    }
    if(!version||!pc[version])throw new Error('minecraft-data has no usable Java PC version mapping');
    this.resolvedVersion=version;this.pathMap=pc[version];
    window.__voxelDiag?.log?.(`JAVA DATA PATHS READY ${version}: ${Object.keys(this.pathMap).length} categories`,'ok');
    return this.pathMap;
  }
  async dataset(category){
    if(this.cache.has(category))return this.cache.get(category);
    if(this.inflight.has(category))return this.inflight.get(category);
    const p=(async()=>{
      const paths=await this.paths(),dir=paths?.[category];
      if(!dir)throw new Error(`minecraft-data category unavailable for ${this.resolvedVersion}: ${category}`);
      const url=`${JAVA_DATA_ROOT}${dir}/${category}.json`;
      const data=JSON.parse(await this.game.assets.text(url));
      this.cache.set(category,data);
      if(Array.isArray(data))this.indexes.set(category,new Map(data.filter(x=>x&&x.name).map(x=>[x.name,x])));
      window.__voxelDiag?.log?.(`JAVA DATA ${category}: READY ${Array.isArray(data)?data.length:Object.keys(data||{}).length} records`,'ok');
      return data;
    })().catch(e=>{this.errors.set(category,e.message);window.__voxelDiag?.log?.(`JAVA DATA ${category}: ${e.message}`,'warn');throw e;}).finally(()=>this.inflight.delete(category));
    this.inflight.set(category,p);return p;
  }
  get(category,name){return this.indexes.get(category)?.get(name)||null;}
  item(name){return this.get('items',name);}
  food(name){return this.get('foods',name);}
  block(name){return this.get('blocks',name);}
  entity(name){return this.get('entities',name);}
  async warm(categories=STUDIO_V14_4.dataPrewarm){const r=await Promise.allSettled(categories.map(c=>this.dataset(c)));return r;}
  summary(){return {requested:STUDIO_V14_4.javaVersion,resolved:this.resolvedVersion||'loading',loaded:[...this.cache.keys()],errors:Object.fromEntries(this.errors),source:'PrismarineJS/minecraft-data'};}
}

class JavaAssetResolverV144{
  constructor(version=STUDIO_V14_4.javaVersion){this.version=version;this.root=`https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/${version}/`;}
  url(path){return `${this.root}${String(path).replace(/^\//,'')}`;}
  item(name){return this.url(`items/${name}.png`);}
  block(name){return this.url(`blocks/${name}.png`);}
  gui(name){return this.url(`gui/${name}`);}
  entity(name){return this.url(`entity/${name}`);}
  titleLogo(){return this.gui('title/minecraft.png');}
  editionLogo(){return this.gui('title/edition.png');}
  inventory(){return this.gui('container/inventory.png');}
  crafting(){return this.gui('container/crafting_table.png');}
  recipeBook(){return this.gui('recipe_book.png');}
  hud(name){return this.gui(`sprites/hud/${name}.png`);}
}
const javaAssetsV144=new JavaAssetResolverV144();

function javaNameV144(value){
  const n=String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  return ({grass:'grass_block',snow:'snow_block'}[n]||n);
}
function javaItemStemV144(id){return javaNameV144(ITEM_NAME.get(id)||BLOCK_NAME[id]||'');}
const JAVA_BLOCK_TEXTURE_V144=Object.freeze({
  grass_top:'grass_block_top',grass_side:'grass_block_side',dirt:'dirt',stone:'stone',sand:'sand',gravel:'gravel',
  oak_log:'oak_log',oak_log_top:'oak_log_top',oak_leaves:'oak_leaves',oak_leaves_opaque:'oak_leaves',oak_planks:'oak_planks',
  cobblestone:'cobblestone',glass:'glass',coal_ore:'coal_ore',iron_ore:'iron_ore',diamond_ore:'diamond_ore',bedrock:'bedrock',
  torch:'torch',crafting_table_top:'crafting_table_top',crafting_table_side:'crafting_table_side',bricks:'bricks',obsidian:'obsidian',
  snow:'snow',tall_grass:'short_grass',flower:'allium',glowstone:'glowstone',furnace_side:'furnace_side',furnace_front:'furnace_front',
  furnace_front_off:'furnace_front',furnace_front_on:'furnace_front_on',chest:'oak_planks',tnt_top:'tnt_top',tnt_bottom:'tnt_bottom',tnt_side:'tnt_side'
});

/* Prefer Java block/item artwork. Existing user/Bedrock candidate lists remain as fallback so one missing extracted Java file can never make the game disappear. */
const v144TextureCandidatesBase=AssetResolver.prototype.textureCandidates;
AssetResolver.prototype.textureCandidates=function(name){
  const clean=String(name||'').replace(/^textures\//,'').replace(/\.png$/,'').split('/').pop();
  const javaStem=JAVA_BLOCK_TEXTURE_V144[clean];
  const base=v144TextureCandidatesBase.call(this,name);
  return javaStem?[javaAssetsV144.block(javaStem),...base]:base;
};
const v144IconBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){
  if(!id||id===ITEM.AIR)return '';
  this.javaIconV144??=new Map();if(this.javaIconV144.has(id))return this.javaIconV144.get(id);
  const stem=javaItemStemV144(id);if(stem){const url=javaAssetsV144.item(stem);this.javaIconV144.set(id,url);return url;}
  return v144IconBase.call(this,id);
};

/* Java-data backed food values. minecraft-data exposes foodPoints reliably; the current runtime keeps its proven saturation values if a version reports saturation in a different scale. */
function javaFoodStatsV144(id){
  const name=javaItemStemV144(id),row=game.javaDataV144?.food?.(name);if(!row)return null;
  const food=Number(row.foodPoints??row.nutrition??row.foodpoints);
  let sat=Number(row.saturationModifier??row.saturation_modifier);
  if(Number.isFinite(sat)&&Number.isFinite(food))sat=food*sat*2;
  if(!Number.isFinite(sat)||sat<0||sat>20){if(name==='bread')sat=6;else if(name==='apple')sat=2.4;else sat=Math.max(0,Math.min(20,food*.6));}
  return {name,food:Number.isFinite(food)?food:0,saturation:sat,source:`minecraft-data ${game.javaDataV144?.resolvedVersion||STUDIO_V14_4.javaVersion}`};
}
if(typeof FoodSystemV11!=='undefined'){
  const v144FoodFinishBase=FoodSystemV11.prototype.finish;
  FoodSystemV11.prototype.finish=function(){
    const a=this.active,stats=a?javaFoodStatsV144(a.id):null;if(!a||!stats)return v144FoodFinishBase.call(this);
    const inv=this.game.inventory,stack=a.offhand?inv.offhand:this.game.selectedStack();if(!stack||stack.id!==a.id||stack.count<=0){this.active=null;return;}
    if(this.game.mode!=='creative'){stack.count--;stack.normalize();this.game.player.hunger=Math.min(20,this.game.player.hunger+stats.food);this.saturation=Math.min(this.game.player.hunger,this.saturation+stats.saturation);}
    this.game.soundV14?.playEvent?.('random.burp',{ui:true,volume:.45}).catch?.(()=>{});
    this.game.refreshHotbar();this.game.saveSoon();this.active=null;const el=$('eatProgressV11');if(el)el.style.display='none';
    window.__voxelDiag?.log?.(`JAVA FOOD ${stats.name}: +${stats.food} hunger +${stats.saturation.toFixed(1)} saturation`,'ok');
  };
}
