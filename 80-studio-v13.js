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


