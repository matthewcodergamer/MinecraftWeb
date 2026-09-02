/* Minecraft Web V16.4.1 — runtime hardening for the V16.4 parity pass. */
(function(){
'use strict';
const HOTFIX='0.16.4.1';
const clamp1641=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));

/* 109's Java 26.1 loader helpers are IIFE-private. V16.4 must not depend on
   those private names, so destroy stages use their own public asset path. */
async function loadJavaImageV1641(rel){
  const candidates=[
    `./assets/java/26.1/${rel}`,
    `./assets/java/${rel}`,
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/${rel}`
  ];
  let last=null;
  for(const url of candidates){
    try{
      const image=await game.assets.image(url);
      if(image)return{image,url};
    }catch(e){last=e}
  }
  throw last||new Error(`Java 26.1 image unavailable: ${rel}`);
}
function canvasTextureV1641(canvas,url=''){
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.premultiplyAlpha=false;t.userData.sourceURL=url;t.needsUpdate=true;return t;
}
if(typeof MinecraftBreakOverlayV147!=='undefined'){
  MinecraftBreakOverlayV147.prototype.texture=async function(stage){
    stage=clamp(stage|0,0,9);if(this.textures[stage])return this.textures[stage];if(this.pending[stage])return this.pending[stage];
    this.pending[stage]=(async()=>{
      const {image,url}=await loadJavaImageV1641(`blocks/destroy_stage_${stage}.png`),cv=document.createElement('canvas');cv.width=image.width||16;cv.height=image.height||16;
      const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(image,0,0,cv.width,cv.height);
      const im=ctx.getImageData(0,0,cv.width,cv.height),d=im.data;
      for(let p=0;p<d.length;p+=4){
        const srcA=d[p+3]/255,lum=d[p]*.299+d[p+1]*.587+d[p+2]*.114;
        /* Transparent source pixels stay transparent; visible grayscale crack
           pixels become dark alpha rather than gray RGB painted over blocks. */
        const ink=clamp1641((232-lum)/176),alpha=Math.round(255*srcA*ink*ink*(3-2*ink));
        d[p]=d[p+1]=d[p+2]=5;d[p+3]=alpha<7?0:alpha;
      }
      ctx.putImageData(im,0,0);const t=canvasTextureV1641(cv,url);this.textures[stage]=t;return t;
    })().catch(e=>{window.__voxelDiag?.log?.(`V16.4.1 destroy stage ${stage}: ${e.message}`,'err');return null}).finally(()=>this.pending[stage]=null);
    return this.pending[stage];
  };
}

/* Real 3D shield silhouette. Other tools/sticks continue through the pixel
   extrusion path installed by V16.0/V16.4. */
function shieldModelV1641(){
  const root=new THREE.Group();root.name='java_shield_3d_v1641';root.userData.v164HeldExtrusion=true;
  const edge=new THREE.MeshLambertMaterial({color:0x5d412a,depthTest:false,depthWrite:false,toneMapped:false}),front=new THREE.MeshLambertMaterial({color:0xffffff,depthTest:false,depthWrite:false,toneMapped:false,transparent:true,alphaTest:.04,side:THREE.DoubleSide});
  const parts=[[.62,.52,0,.10],[.50,.18,0,-.24],[.32,.12,0,-.39]];
  for(const [w,h,x,y] of parts){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.075),edge);m.position.set(x,y,0);m.renderOrder=2500;m.frustumCulled=false;root.add(m)}
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.60,.78),front);face.position.set(0,-.04,-.039);face.renderOrder=2502;face.frustumCulled=false;root.add(face);
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.10,.42,.10),new THREE.MeshLambertMaterial({color:0x4a3020,depthTest:false,depthWrite:false,toneMapped:false}));handle.position.set(0,-.03,.10);handle.renderOrder=2501;root.add(handle);
  (async()=>{for(const url of ['./assets/java/entity/shield_base.png','./assets/java/26.1/entity/shield_base.png'])try{const img=await game.assets.image(url),cv=document.createElement('canvas');cv.width=img.width||64;cv.height=img.height||64;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(img,0,0);front.map=canvasTextureV1641(cv,url);front.needsUpdate=true;return}catch{} })();
  root.scale.setScalar(.78);root.rotation.set(.02,.05,-.08);return root;
}
if(typeof HeldItemFactoryV8!=='undefined'&&typeof V8_ITEM!=='undefined'&&V8_ITEM.SHIELD!=null){
  const heldBaseV1641=HeldItemFactoryV8.prototype.create;
  HeldItemFactoryV8.prototype.create=function(id){if(id===V8_ITEM.SHIELD)return shieldModelV1641();return heldBaseV1641.call(this,id)};
}

/* Crouch eye easing must feed PlayerCameraV12.eyePositionV12; otherwise the
   camera controller bypasses Player.eyePosition and still snaps instantly. */
if(typeof Player!=='undefined'){
  Player.prototype.eyePositionV12=function(){return this.position.y+ENGINE.EYE_HEIGHT+(this.__eyeOffsetV164||0)};
}

/* Third-person motion: scale walk cycle with actual speed, use swim clips when
   available, and provide a geometric fallback pose when an animation file does
   not contain the requested clip. */
if(typeof PlayerEntityRendererV12!=='undefined'){
  const updatePlayerBaseV1641=PlayerEntityRendererV12.prototype.updateOne;
  PlayerEntityRendererV12.prototype.updateOne=function(avatar,state,dt){
    updatePlayerBaseV1641.call(this,avatar,state,dt);if(!avatar?.root)return;
    const p=state.player||this.game.player,speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),water=!!(p.inWaterV8||this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y+.65),Math.floor(p.position.z))===BLOCK.WATER),crouch=!!p.crouchingV12,controller=avatar.controller;
    avatar.__walkClockV1641??=0;avatar.__swimClockV1641??=0;
    avatar.root.rotation.x=0;avatar.root.position.y=p.position.y;
    if(water){
      avatar.__swimClockV1641+=dt*Math.max(.45,Math.min(1.45,.55+speed*.22));
      let clip=null;if(controller?.animations)for(const [name,c] of Object.entries(controller.animations))if(/swim|swimming/i.test(name)){clip=c;break}
      if(clip)controller.applyClip?.(clip,avatar.__swimClockV1641,this.ctx(avatar,state));
      avatar.root.position.y=p.position.y+.62;avatar.root.rotation.x=-Math.PI*.46;
    }else if(crouch){
      avatar.root.position.y=p.position.y-.08;avatar.root.rotation.x=.08;
      let clip=controller?.animations?.['animation.player.sneaking'];if(!clip&&controller?.animations)for(const [name,c] of Object.entries(controller.animations))if(/sneak|crouch/i.test(name)){clip=c;break}
      clip&&controller.applyClip?.(clip,avatar.age,this.ctx(avatar,state));
    }else if(speed>.025&&controller){
      avatar.__walkClockV1641+=dt*clamp1641(speed/4.3,.16,1.35);
      controller.update?.('walk',avatar.__walkClockV1641,{age:avatar.__walkClockV1641,distanceWalked:avatar.distance,velocity:p.velocity,attackProgress:0});
    }
  };
}

if(typeof Game!=='undefined'){
  const bootBaseV1641=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const r=await bootBaseV1641.apply(this,args);
    /* Initial ocean meshes were built before the V16.4 water metadata object
       existed. Rebuild once so source water renders at the Java 14/16 height. */
    try{if(this.world&&this.waterV164){this.world.waterV164=this.waterV164;this.world.markAllForRebuild?.()}}catch{}
    window.__voxelDiag?.log?.('V16.4.1 HOTFIX: destroy-stage loader isolation, 3D shield, crouch eye easing, speed-scaled walking and swim pose are active.','ok');
    return r;
  };
}

try{runtimeCommands.register('v1641',()=>({hotfix:HOTFIX,shield:typeof V8_ITEM!=='undefined'?V8_ITEM.SHIELD:null,waterRebuild:!!game?.world?.waterV164,crouchEye:game?.player?.eyePositionV12?.(),playerModel:!!game?.playerEntitiesV12?.local?.root}),'Inspect V16.4.1 runtime hardening.')}catch{}
window.STUDIO_PATCH_VERSION='0.16.4.1-runtime-hardening';
})();
