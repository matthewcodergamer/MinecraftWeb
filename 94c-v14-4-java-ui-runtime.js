/* Real Java container artwork with transparent interactive slots layered over the exact 176x166 GUI coordinate system. Drag/drop keeps using the existing InventoryTransactionEngine. */
function javaInvSlotV144(ui,slot,stack,x,y,extra=''){return `<div class="inv-slot javaSlotV144 ${extra}" data-slot="${slot}" style="left:${x}px;top:${y}px">${stack&&!stack.empty()?ui.slotHtml(slot,stack).replace(/^<div[^>]*>|<\/div>$/g,''):''}</div>`;}
function javaInventorySlotsV144(ui){
  const inv=ui.game.inventory,out=[];
  for(let r=0;r<3;r++)for(let c=0;c<9;c++){const i=9+r*9+c;out.push(javaInvSlotV144(ui,`i${i}`,inv.slots[i],8+c*18,84+r*18));}
  for(let c=0;c<9;c++)out.push(javaInvSlotV144(ui,`i${c}`,inv.slots[c],8+c*18,142));
  return out.join('');
}
function javaCraftSlotsV144(ui,size){
  const c=ui.game.crafting,out=[];
  if(size===2){for(let r=0;r<2;r++)for(let x=0;x<2;x++){const i=r*2+x;out.push(javaInvSlotV144(ui,`p${i}`,c.grid[i],98+x*18,18+r*18));}out.push(javaInvSlotV144(ui,'o',c.output,154,28,'output'));}
  else{for(let r=0;r<3;r++)for(let x=0;x<3;x++){const i=r*3+x;out.push(javaInvSlotV144(ui,`t${i}`,c.grid[i],30+x*18,17+r*18));}out.push(javaInvSlotV144(ui,'o',c.output,124,35,'output'));}
  return out.join('');
}
function javaPaperDollV144(){return `<div class="javaPaperDollV144"><i class="jHead"></i><i class="jBody"></i><i class="jArm jArmL"></i><i class="jArm jArmR"></i><i class="jLeg jLegL"></i><i class="jLeg jLegR"></i></div>`;}
function javaRecipePanelV144(ui,size,searchId,listId){return `<aside class="javaRecipePanelV144"><div class="javaRecipePaperV144"></div><input class="javaRecipeSearchV144" id="${searchId}" placeholder="Search recipes"><div class="javaRecipeListV144 recipe-book" id="${listId}"></div></aside>`;}
function javaScaleInventoryV144(){
  const shell=document.querySelector('.javaInventoryShellV144');if(!shell)return;const vv=window.visualViewport,w=vv?.width||innerWidth,h=vv?.height||innerHeight,isLand=w>h,logicalW=shell.classList.contains('withRecipes')?340:176,logicalH=166,pad=18,maxW=Math.max(240,w-pad*2),maxH=Math.max(180,h-pad*2),scale=Math.min(isLand?3.0:2.45,maxW/logicalW,maxH/logicalH);shell.style.setProperty('--java-ui-scale',String(Math.max(1,scale)));
}
UI.prototype.renderInventory=function(){
  const inv=this.game.inventory,c=this.game.crafting;inv.offhand??=new ItemStack();c.setGridSize(2);c.update();
  screenLayer.innerHTML=`<div class="javaInventoryViewportV144"><div class="javaInventoryShellV144 withRecipes"><section class="javaGuiV144 javaPlayerInventoryV144" style="background-image:url('${javaAssetsV144.inventory()}')">${javaPaperDollV144()}${javaCraftSlotsV144(this,2)}${javaInventorySlotsV144(this)}${javaInvSlotV144(this,'f0',inv.offhand,77,62,'offhand')}<button class="javaCloseV144" id="closeInventoryV144" aria-label="Close">×</button></section>${javaRecipePanelV144(this,2,'recipeSearchV144','recipeListV144')}</div></div>`;
  $('recipeSearchV144').oninput=e=>this.renderRecipeBookV6('recipeListV144',2,e.target.value);$('closeInventoryV144').onclick=()=>this.close();this.renderRecipeBookV6('recipeListV144',2,'');this.bindSlots();iconSanitizer.scan();requestAnimationFrame(javaScaleInventoryV144);
};
UI.prototype.renderCrafting=function(){
  const c=this.game.crafting;c.setGridSize(3);c.update();
  screenLayer.innerHTML=`<div class="javaInventoryViewportV144"><div class="javaInventoryShellV144 withRecipes"><section class="javaGuiV144 javaCraftingTableV144" style="background-image:url('${javaAssetsV144.crafting()}')">${javaCraftSlotsV144(this,3)}${javaInventorySlotsV144(this)}<button class="javaCloseV144" id="closeTableV144" aria-label="Close">×</button></section>${javaRecipePanelV144(this,3,'tableRecipeSearchV144','tableRecipeListV144')}</div></div>`;
  $('tableRecipeSearchV144').oninput=e=>this.renderRecipeBookV6('tableRecipeListV144',3,e.target.value);$('closeTableV144').onclick=()=>this.close();this.renderRecipeBookV6('tableRecipeListV144',3,'');this.bindSlots();iconSanitizer.scan();requestAnimationFrame(javaScaleInventoryV144);
};

/* Java title/logo and source diagnostics. */
const v144BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){
  v144BuildTitleBase();const logo=$('mcLogo');if(logo){logo.src=javaAssetsV144.titleLogo();logo.onerror=()=>{logo.onerror=null;logo.src=`${MC_TEX}gui/title/minecraft.png`;};logo.classList.add('javaTitleLogoV144');}
  let edition=$('javaEditionLogoV144');if(!edition&&logo){edition=document.createElement('img');edition.id='javaEditionLogoV144';edition.src=javaAssetsV144.editionLogo();edition.alt='Java Edition';logo.insertAdjacentElement('afterend',edition);}
  const small=document.querySelector('#titleContent .v9Small');if(small)small.textContent=`Minecraft Java-Web Alpha 0.14.4 • Three.js r180 • Java 1.21.8 data/UI preferred`;
};
const v144TitleOptionsBase=v9TitleOptions;
v9TitleOptions=function(){
  v144TitleOptionsBase();const grid=document.querySelector('#titleContent .v9OptionsGrid');if(!grid)return;const row=document.createElement('div');row.className='v9RangeRow javaSourceRowV144';row.innerHTML=`<label><span>Game data source</span><b>JAVA PREFERRED</b></label><div class="v144SourceText">Java 1.21.8: GUI, items, block textures, registries, food/collision/mechanics metadata.<br>Bedrock translator retained for entity geometry/animation/behavior and strict audio where it is currently the stronger browser-ready source.</div>`;grid.appendChild(row);
};

if(typeof v11ResourcePacks==='function'){
  const v144ResourceBase=v11ResourcePacks;v11ResourcePacks=function(){v144ResourceBase();const status=document.querySelector('.v9PackStatus');if(status)status.innerHTML=`<b>Source priority — V14.4</b><br>1. Java Edition extracted client assets — PrismarineJS/minecraft-assets ${STUDIO_V14_4.javaVersion}<br>2. Java Edition structured mechanics — PrismarineJS/minecraft-data ${game.javaDataV144?.resolvedVersion||STUDIO_V14_4.javaVersion}<br>3. User resource overrides when explicitly available<br>4. Mojang Bedrock samples for entity geometry/animation/behavior/audio translation<br><br><small>Java is preferred for UI/items/blocks/mechanics; Bedrock is not removed because it still supplies the cleanest data-driven mob geometry/behavior path in this browser engine.</small>`;};
}

function v144InstallJava(gameRef){
  gameRef.javaAssetsV144=javaAssetsV144;gameRef.javaDataV144??=new JavaEditionRepositoryV144(gameRef);gameRef.javaHudV144??=new JavaHudV144(gameRef);gameRef.javaHudV144.install();
  gameRef.javaDataV144.warm().then(()=>{window.__voxelDiag?.log?.(`JAVA PRIMARY CACHE READY ${gameRef.javaDataV144.resolvedVersion}`,'ok');gameRef.refreshHotbar?.();}).catch(()=>{});
}
const v144BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v144BootBase.apply(this,args);v144InstallJava(this);window.__voxelDiag?.log?.(`V14.4 BOOT ${STUDIO_V14_4.version}: Java Edition data/UI/assets/combat preferred; Bedrock entity/audio translators preserved.`,'ok');};
const v144GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v144GameUpdateBase.call(this,dt);this.javaHudV144?.update();return r;};

/* Rotation-safe Java UI scaling. */
addEventListener('resize',()=>requestAnimationFrame(javaScaleInventoryV144),{passive:true});window.visualViewport?.addEventListener?.('resize',()=>requestAnimationFrame(javaScaleInventoryV144),{passive:true});addEventListener('orientationchange',()=>{setTimeout(javaScaleInventoryV144,80);setTimeout(javaScaleInventoryV144,320);},{passive:true});

try{
  runtimeCommands.register('java144',()=>({version:STUDIO_V14_4.version,mode:STUDIO_V14_4.sourceMode,assets:javaAssetsV144.root,data:game.javaDataV144?.summary?.()||'not booted'}),'Inspect the Java Edition primary translation layer.');
  runtimeCommands.register('javadata144',(category='items')=>({category,loaded:game.javaDataV144?.cache?.has?.(category)||false,count:Array.isArray(game.javaDataV144?.cache?.get?.(category))?game.javaDataV144.cache.get(category).length:null,error:game.javaDataV144?.errors?.get?.(category)||null}),'Inspect one Java minecraft-data category.');
  runtimeCommands.register('javacombat144',()=>{const s=game.combat?.javaSpecV144?.()||{};return {...s,cooldown:game.combat?.cooldown||0,progress:game.combat?.cooldownProgressV144?.()??1,lastStrength:game.combat?.lastStrengthV144??1,lastDamage:game.combat?.lastDamageV144??0,item:ITEM_NAME.get(game.selectedStack?.()?.id)||'Hand'};},'Inspect Java attack speed, cooldown and damage.');
}catch{}

window.FreshMinecraft=window.FreshMinecraft||{};
window.FreshMinecraft.java={version:STUDIO_V14_4.javaVersion,mode:STUDIO_V14_4.sourceMode,assets:javaAssetsV144,repository:()=>game.javaDataV144};
window.__voxelDiag?.log?.(`V14.4 READY ${STUDIO_V14_4.version}: Java title/HUD/container art, Java-first item/block assets, minecraft-data cache and Java combat cooldown installed.`,'ok');
