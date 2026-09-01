/* Minecraft Web V16.1 — procedural Java-style square sun
 * Replaces the asynchronously loaded sun sprite with one authoritative square
 * celestial quad so startup can never swap from a square sun to an old tinted
 * sprite. The moon remains texture-backed for its real Java moon phases.
 */
(function(){
'use strict';
const BUILD='0.16.1';
const SUN_SIZE=30;
const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const smooth=t=>{t=clamp01(t);return t*t*(3-2*t)};
function phaseV161(){try{return ((Number(dayClock?.phase?.())||0)%1+1)%1}catch{return 0}}
function stateV161(){
  const phase=phaseV161(),ticks=phase*24000,angle=phase*Math.PI*2;
  /* Minecraft clock convention used by the original sky path:
     tick 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight. */
  const dir=new THREE.Vector3(Math.cos(angle),Math.sin(angle),Math.sin(angle)*.18).normalize();
  const altitude=dir.y;
  const sunrise=clamp01(1-Math.abs(ticks-350)/1250);
  const sunset=clamp01(1-Math.abs(ticks-12350)/1450);
  const twilight=Math.max(sunrise,sunset);
  const horizon=1-smooth(clamp01((altitude+.02)/.52));
  const warmth=clamp01(Math.max(twilight,horizon*.82));
  const opacity=smooth(clamp01((altitude+.07)/.13));
  return {phase,ticks,dir,altitude,warmth,opacity};
}
function sunColorsV161(s){
  const noon=new THREE.Color(0xfffbe8);
  const edgeNoon=new THREE.Color(0xffefac);
  const warm=new THREE.Color(0xffa35c);
  const warmEdge=new THREE.Color(0xf36f38);
  return {
    core:noon.clone().lerp(warm,s.warmth*.78),
    edge:edgeNoon.clone().lerp(warmEdge,s.warmth*.88)
  };
}
function makeSunMaterialV161(){
  return new THREE.ShaderMaterial({
    uniforms:{
      uCore:{value:new THREE.Color(0xfffbe8)},
      uEdge:{value:new THREE.Color(0xffefac)},
      uOpacity:{value:1}
    },
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      varying vec2 vUv;
      uniform vec3 uCore;
      uniform vec3 uEdge;
      uniform float uOpacity;
      void main(){
        vec2 p=abs(vUv-vec2(.5));
        float d=max(p.x,p.y);
        float inner=1.0-step(.375,d);
        vec3 c=mix(uEdge,uCore,inner);
        gl_FragColor=vec4(c,uOpacity);
      }
    `,
    transparent:true,
    depthTest:true,
    depthWrite:false,
    fog:false,
    toneMapped:false,
    side:THREE.DoubleSide,
    blending:THREE.NormalBlending
  });
}
function ensureSquareSunV161(rr){
  if(!rr?.scene||!rr?.camera)return null;
  if(rr.squareSunV161?.mesh?.parent)return rr.squareSunV161;
  rr.squareSunV161?.mesh?.parent?.remove?.(rr.squareSunV161.mesh);
  const geo=new THREE.PlaneGeometry(SUN_SIZE,SUN_SIZE,1,1);
  const mat=makeSunMaterialV161();
  const mesh=new THREE.Mesh(geo,mat);
  mesh.name='java_procedural_square_sun_v161';
  mesh.frustumCulled=false;
  mesh.renderOrder=-31;
  mesh.castShadow=false;
  mesh.receiveShadow=false;
  mesh.userData.proceduralSun=true;
  rr.scene.add(mesh);
  rr.squareSunV161={mesh,geometry:geo,material:mat,size:SUN_SIZE};
  return rr.squareSunV161;
}
function suppressLegacySunV161(rr){
  const old=rr?.celestialV7?.sunSprite;
  if(!old)return;
  old.visible=false;
  old.userData.v161Suppressed=true;
  if(old.material){old.material.opacity=0;old.material.depthWrite=false;}
}
function updateSquareSunV161(rr){
  const sun=ensureSquareSunV161(rr);if(!sun)return null;
  const s=stateV161(),far=Math.max(80,Number(rr.camera?.far||700)),distance=Math.min(500,far*.70),colors=sunColorsV161(s),mesh=sun.mesh,mat=sun.material;
  mesh.position.copy(rr.camera.position).addScaledVector(s.dir,distance);
  /* A billboard keeps the celestial quad visually square at every point in the
     arc. It is still depth-tested, so nearer terrain/blocks hide it. */
  mesh.quaternion.copy(rr.camera.quaternion);
  mesh.scale.set(1,1,1);
  mesh.visible=s.opacity>.002&&!document.hidden&&!game?.__hardQuitV159;
  mat.uniforms.uCore.value.copy(colors.core);
  mat.uniforms.uEdge.value.copy(colors.edge);
  mat.uniforms.uOpacity.value=s.opacity;
  suppressLegacySunV161(rr);
  window.__v161SunState={
    source:'procedural-square-shader',
    size:SUN_SIZE,
    ticks:Number(s.ticks.toFixed(1)),
    altitude:Number(s.altitude.toFixed(3)),
    warmth:Number(s.warmth.toFixed(3)),
    opacity:Number(s.opacity.toFixed(3)),
    depthTest:mat.depthTest,
    legacySuppressed:!!rr?.celestialV7?.sunSprite?.userData?.v161Suppressed
  };
  return s;
}
function syncSunLightV161(rr,s){
  if(!rr||!s)return;
  const cam=rr.camera?.position;
  if(rr.sun&&cam){
    rr.sun.position.copy(cam).addScaledVector(s.dir,120);
    if(rr.sun.target){rr.sun.target.position.copy(cam);if(!rr.sun.target.parent)rr.scene?.add?.(rr.sun.target)}
    const c=sunColorsV161(s).core;
    rr.sun.color?.copy?.(c);
    const day=Math.max(0,s.altitude);
    rr.sun.intensity=(.10+.40*smooth(clamp01(day)))*(1-(game?.weather?.intensity||game?.weatherIntensity||0)*.20);
  }
}
if(typeof VoxelRenderer!=='undefined'){
  const updateBase=VoxelRenderer.prototype.updateCelestialsV7;
  VoxelRenderer.prototype.updateCelestialsV7=function(...args){
    const r=updateBase.apply(this,args);
    updateSquareSunV161(this);
    return r;
  };
  const renderBase=VoxelRenderer.prototype.render;
  VoxelRenderer.prototype.render=function(dt){
    const s=updateSquareSunV161(this),web=this.renderer;
    if(!web?.render)return renderBase.call(this,dt);
    const actual=web.render;
    /* V16.0's renderer applies its environment inside web.render. This wrapper
       runs immediately after that environment update and immediately before the
       real draw, keeping the directional light perfectly aligned to V16.1 sun. */
    web.render=(scene,camera)=>{
      if(scene===this.scene&&camera===this.camera){
        const live=updateSquareSunV161(this)||s;
        syncSunLightV161(this,live);
      }
      return actual.call(web,scene,camera);
    };
    try{return renderBase.call(this,dt)}finally{web.render=actual}
  };
}
const bootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){
  const r=await bootBase.apply(this,args);
  try{
    const rr=this.renderer;
    ensureSquareSunV161(rr);
    suppressLegacySunV161(rr);
    const s=updateSquareSunV161(rr);
    syncSunLightV161(rr,s);
  }catch(e){console.warn('[V16.1 square sun]',e)}
  return r;
};
function repairLabelV161(){
  const footer=document.getElementById('v158Footer');
  if(footer){const html=`<span>Minecraft Web ${BUILD}</span><span>Java 26.1 • Procedural Square Sun • Vanilla Fidelity</span>`;if(footer.innerHTML!==html)footer.innerHTML=html}
}
queueMicrotask(repairLabelV161);[80,240,700,1500].forEach(ms=>setTimeout(repairLabelV161,ms));
try{runtimeCommands.register('sun161',()=>({build:BUILD,...(window.__v161SunState||{}),legacyVisible:game?.renderer?.celestialV7?.sunSprite?.visible??null,proceduralVisible:game?.renderer?.squareSunV161?.mesh?.visible??null}),'Inspect V16.1 procedural square sun.')}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;
window.STUDIO_PATCH_VERSION='0.16.1-procedural-square-sun';
window.__voxelDiag?.log?.('V16.1 READY: one authoritative procedural 1:1 square sun, no PNG sun swap, dynamic white-to-orange celestial tint, block occlusion and synchronized sunlight direction.','ok');
})();
