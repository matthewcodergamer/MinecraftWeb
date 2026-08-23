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
