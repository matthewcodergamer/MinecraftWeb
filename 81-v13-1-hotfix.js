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

