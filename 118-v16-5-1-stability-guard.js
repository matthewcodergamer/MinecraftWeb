/* Minecraft Web V16.5.1 stability guard — preserve non-tool held items and deterministic cooldown clipping. */
(function(){
'use strict';
function itemNameV1651Guard(id){try{return javaItemNameV145(id)||''}catch{return String(ITEM_NAME?.get?.(id)||'').toLowerCase().replace(/[^a-z0-9]+/g,'_')}}
function generatedItemV1651Guard(id){const n=itemNameV1651Guard(id);return /(^|_)(stick|bow|arrow|shears)$/.test(n)||/(sword|pickaxe|_axe|shovel|hoe)$/.test(n)}
function genericFlatV1651Guard(id){
  const root=new THREE.Group(),name=itemNameV1651Guard(id);root.userData.itemId=id;root.userData.v1651GenericFlat=true;
  const urls=[`./assets/java/26.1/items/${name}.png`,`./assets/java/items/${name}.png`];
  (async()=>{for(const url of urls){try{const bmp=await game.assets.image(url),cv=document.createElement('canvas');cv.width=bmp.width||16;cv.height=bmp.height||16;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(bmp,0,0);bmp.close?.();const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;const aspect=cv.width/Math.max(1,cv.height),h=.42,w=h*aspect,geo=new THREE.PlaneGeometry(w,h),mat=new THREE.MeshLambertMaterial({map:tex,color:0xffffff,transparent:true,alphaTest:.08,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false,fog:false}),mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=2502;mesh.frustumCulled=false;mesh.userData.itemId=id;mesh.userData.viewModelV7=mesh.userData.viewModelV8=true;root.add(mesh);return}catch{}}})();
  return root;
}
if(typeof HeldItemFactoryV8!=='undefined'){
  const generatedCreateV1651=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.create=function(id){
    if(generatedItemV1651Guard(id))return generatedCreateV1651.call(this,id);
    try{if(id===ITEM.TORCH&&typeof this.torch==='function')return this.prepare?.(this.torch())||this.torch();}catch{}
    try{if(typeof V8_ITEM!=='undefined'&&id===V8_ITEM.SHIELD&&typeof this.shield==='function'){const shield=this.shield();return this.prepare?.(shield)||shield}}catch{}
    try{const block=this.game?.itemToBlock?.(id);if(block!=null&&block!==BLOCK.AIR&&this.blocks?.create){const model=this.blocks.create(id);return this.prepare?.(model)||model}}catch{}
    const root=genericFlatV1651Guard(id);return this.prepare?.(root)||root;
  };
  HeldItemFactoryV8.prototype.flat=function(id){if(generatedItemV1651Guard(id))return generatedCreateV1651.call(this,id);return genericFlatV1651Guard(id)};
}
function hardClipCooldownV1651(){const el=document.getElementById('javaAttackIndicatorV144'),clip=el?.querySelector?.('.javaAttackClipV144'),combat=game?.combat;if(!clip||!combat)return;const p=Math.max(0,Math.min(1,Number(combat.cooldownProgressV144?.()??1)));clip.style.width=`${(16*p).toFixed(3)}px`;}
if(typeof Game!=='undefined'){
  const updateBase=Game.prototype.update;Game.prototype.update=function(dt){const r=updateBase.call(this,dt);hardClipCooldownV1651();return r};
}
try{runtimeCommands.register('v1651guard',()=>({heldFallback:'preserved',cooldownClip:'pixel width',build:'0.16.5.1'}),'Inspect V16.5.1 stability guard.')}catch{}
})();
