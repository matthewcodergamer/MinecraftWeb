/* Minecraft Web V15.1 — Photon Web 1.3b study/translation layer
 * Technical reference: Photon Shaders v1.3b by Benjamin Stott (SixthSurge).
 * This is a clean-room Three.js/WebGL translation of concepts/settings, not a direct Iris shader runtime.
 */
const PHOTON_WEB_13B_SOURCE=Object.freeze({name:'Photon Shaders',version:'1.3b',author:'Benjamin Stott (SixthSurge)',reference:'user-supplied photon_v1.3b.zip',licensePath:'licenses/PHOTON_SHADERS_LICENSE.txt'});
const PHOTON_WEB_13B_FEATURES=Object.freeze({
  shadowMapResolution:2048,shadowDistance:128,sunPathRotation:-35,
  wavingPlants:true,wavingLeaves:true,slantedRain:true,
  cloudShadows:true,cloudShadowsIntensity:.8,vanillaAO:true,aoInSunlight:true,
  shSkylight:true,moonPhaseBrightness:true,randomWeatherVariation:true,biomeWeatherVariation:true,
  atmosphere:true,volumetricClouds:true,cirrus:true,cumulus:true,altocumulus:true,noctilucent:true,
  gtao:true,aces:true
});
window.PHOTON_WEB_13B_SOURCE=PHOTON_WEB_13B_SOURCE;
window.PHOTON_WEB_13B_FEATURES=PHOTON_WEB_13B_FEATURES;

const PHOTON_13B_PROFILES=Object.freeze({
  Lite:{cloudSteps:8,cloudScale:.65,cloudOpacity:.72,shadowRes:512,shadowDistance:56,ao:false,volumetric:true,pixelRatio:1.0},
  Balanced:{cloudSteps:12,cloudScale:.82,cloudOpacity:.78,shadowRes:1024,shadowDistance:80,ao:true,volumetric:true,pixelRatio:1.12},
  High:{cloudSteps:18,cloudScale:1.0,cloudOpacity:.84,shadowRes:1536,shadowDistance:112,ao:true,volumetric:true,pixelRatio:1.28},
  Ultra:{cloudSteps:24,cloudScale:1.15,cloudOpacity:.88,shadowRes:2048,shadowDistance:128,ao:true,volumetric:true,pixelRatio:1.45}
});

function photon13Clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function photon13DayFraction(){
  try{
    if(typeof dayClock!=='undefined'&&dayClock){
      if(typeof dayClock.phase==='function')return Number(dayClock.phase())||0;
      if(Number.isFinite(dayClock.ticks))return ((dayClock.ticks%24000)+24000)%24000/24000;
    }
  }catch{}
  return .25;
}

class PhotonAtmosphereV151{
  constructor(game){
    this.game=game;this.scene=game?.renderer?.scene;this.camera=game?.renderer?.camera;this.renderer=game?.renderer?.renderer;
    this.group=new THREE.Group();this.group.name='photon_web_13b_atmosphere';
    this.sky=null;this.clouds=null;this._lastProfile='';
    this.build();
  }
  build(){
    if(!this.scene||!this.camera)return;
    const skyGeo=new THREE.SphereGeometry(900,24,16);
    const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,transparent:false,uniforms:{uSunDir:{value:new THREE.Vector3(.4,.7,.2)},uDay:{value:1},uDawn:{value:0},uRain:{value:0}},vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`precision mediump float;varying vec3 vDir;uniform vec3 uSunDir;uniform float uDay,uDawn,uRain;float sat(float x){return clamp(x,0.0,1.0);}void main(){float h=sat(vDir.y*.5+.5);vec3 night=vec3(.008,.015,.05);vec3 horizon=vec3(.50,.68,.92);vec3 zenith=vec3(.18,.45,.86);vec3 sky=mix(horizon,zenith,pow(h,.55));sky=mix(night,sky,uDay);vec3 warm=vec3(1.0,.34,.09);sky=mix(sky,warm,uDawn*(1.0-h)*.48);float sd=max(dot(normalize(vDir),normalize(uSunDir)),0.0);sky+=vec3(1.0,.78,.52)*pow(sd,256.0)*1.5;sky+=vec3(1.0,.55,.26)*pow(sd,24.0)*.18*uDawn;sky=mix(sky,vec3(.17,.20,.25),uRain*.48);gl_FragColor=vec4(sky,1.0);}`});
    this.sky=new THREE.Mesh(skyGeo,skyMat);this.sky.frustumCulled=false;this.sky.renderOrder=-1000;this.group.add(this.sky);

    const cloudGeo=new THREE.SphereGeometry(780,32,18);
    const cloudMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,transparent:true,blending:THREE.NormalBlending,uniforms:{uTime:{value:0},uSunDir:{value:new THREE.Vector3(.4,.7,.2)},uDay:{value:1},uDawn:{value:0},uRain:{value:0},uCloudScale:{value:.82},uOpacity:{value:.78}},vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`precision mediump float;varying vec3 vDir;uniform float uTime,uDay,uDawn,uRain,uCloudScale,uOpacity;uniform vec3 uSunDir;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+17.1;a*=.5;}return v;}void main(){if(vDir.y<.015){discard;}vec2 p=vDir.xz/max(vDir.y,.08);p=p*(1.55/uCloudScale)+vec2(uTime*.008,uTime*.002);float base=fbm(p)+.52*fbm(p*2.7+9.4);float cov=smoothstep(.66,.92,base);float horizon=smoothstep(.02,.12,vDir.y);float sun=max(dot(normalize(vDir),normalize(uSunDir)),0.0);vec3 lit=mix(vec3(.52,.56,.62),vec3(1.0,.98,.93),.48+.52*uDay);lit=mix(lit,vec3(1.0,.52,.32),uDawn*.24);lit=mix(lit,vec3(.20,.22,.27),uRain*.62);lit+=pow(sun,24.0)*vec3(.22,.16,.10);float a=cov*horizon*uOpacity*(.88+.12*uDay);gl_FragColor=vec4(lit,a);}`});
    this.clouds=new THREE.Mesh(cloudGeo,cloudMat);this.clouds.frustumCulled=false;this.clouds.renderOrder=-900;this.group.add(this.clouds);
    this.scene.add(this.group);
  }
  applyProfile(name){
    const p=PHOTON_13B_PROFILES[name]||PHOTON_13B_PROFILES.Lite;this._lastProfile=name;
    if(this.clouds?.material?.uniforms){this.clouds.material.uniforms.uCloudScale.value=p.cloudScale;this.clouds.material.uniforms.uOpacity.value=p.cloudOpacity;}
    const r=this.renderer;if(r){const maxTouch=matchMedia('(pointer:coarse)').matches?1.22:1.6;r.setPixelRatio?.(Math.min(devicePixelRatio||1,p.pixelRatio,maxTouch));if(r.shadowMap){r.shadowMap.enabled=name!=='Lite';r.shadowMap.type=THREE.PCFSoftShadowMap;}}
    const sun=window.game?.photonV148?.sun;if(sun?.shadow?.mapSize){sun.shadow.mapSize.set(p.shadowRes,p.shadowRes);const cam=sun.shadow.camera;if(cam){const d=p.shadowDistance;cam.left=-d;cam.right=d;cam.top=d;cam.bottom=-d;cam.near=.5;cam.far=d*4;cam.updateProjectionMatrix?.();}}
  }
  update(t=performance.now()/1000){
    if(!this.group||!this.camera)return;this.group.position.copy(this.camera.position);
    const phase=photon13DayFraction();const a=(phase-.25)*Math.PI*2;const sunDir=new THREE.Vector3(Math.cos(a),Math.sin(a),.16).normalize();
    const daylight=photon13Clamp((sunDir.y+.12)/.48,0,1);const dawn=photon13Clamp(1-Math.abs(sunDir.y)/.24,0,1);const rain=photon13Clamp(Number(window.game?.weather?.intensity||window.game?.weatherIntensity||0),0,1);
    for(const m of [this.sky?.material,this.clouds?.material]){if(!m?.uniforms)continue;if(m.uniforms.uSunDir)m.uniforms.uSunDir.value.copy(sunDir);if(m.uniforms.uDay)m.uniforms.uDay.value=daylight;if(m.uniforms.uDawn)m.uniforms.uDawn.value=dawn;if(m.uniforms.uRain)m.uniforms.uRain.value=rain;if(m.uniforms.uTime)m.uniforms.uTime.value=t;}
    const profile=window.game?.photonV148?.profile||'Lite';if(profile!==this._lastProfile)this.applyProfile(profile);
    this.group.visible=window.game?.photonV148?.enabled!==false;
  }
  dispose(){this.group?.traverse?.(o=>{o.geometry?.dispose?.();o.material?.dispose?.()});this.group?.parent?.remove?.(this.group);}
  diagnostics(){return{source:PHOTON_WEB_13B_SOURCE,features:PHOTON_WEB_13B_FEATURES,profile:this._lastProfile,visible:!!this.group?.visible,cloudShader:'procedural multi-octave atmosphere shell inspired by Photon cloud architecture',note:'Iris-specific buffers/compute passes are translated selectively; not binary compatible with Photon.'};}
}
window.PhotonAtmosphereV151=PhotonAtmosphereV151;

(function installPhoton151(){
  const bootBase=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const result=await bootBase.apply(this,args);try{this.photonAtmosphereV151?.dispose?.();this.photonAtmosphereV151=new PhotonAtmosphereV151(this);this.photonAtmosphereV151.applyProfile(this.photonV148?.profile||'Lite');window.__voxelDiag?.log?.('V15.1 PHOTON: Photon 1.3b study layer active — atmosphere, procedural volumetric-style cloud shell, cloud-shadow-ready sun rig, profile shadow mapping.','ok')}catch(e){console.warn('[Photon Web 1.3b port]',e)}return result;};
  function frame(){requestAnimationFrame(frame);try{window.game?.photonAtmosphereV151?.update?.()}catch(e){if(!window.__photon151err){window.__photon151err=true;console.warn('[Photon 15.1 frame]',e)}}}requestAnimationFrame(frame);
  try{runtimeCommands.register('photon13',()=>window.game?.photonAtmosphereV151?.diagnostics?.()||{ready:false},'Inspect the Photon v1.3b translation layer and source-derived features.');}catch{}
})();
