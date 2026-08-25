/* Minecraft Web V15.2 — Photon Web Gauntlet pass
 * Source-informed browser translation of Photon Shaders v1.3b systems.
 * Technical reference: user-supplied photon_v1.3b.zip (SixthSurge / Benjamin Stott).
 * This file does not execute Iris/OptiFine shaders directly; it ports concepts to Three.js/WebGL.
 */

const PHOTON_V152 = Object.freeze({
  version:'15.2',
  photon:'1.3b',
  source:'user-supplied photon_v1.3b.zip',
  noise:'assets/photon/noise-256.png',
  atmosphereLut:'assets/photon/atmosphere/scattering.dat',
  sourceDefaults:Object.freeze({
    cloudScale:10,
    cloudShadowIntensity:.80,
    cumulusAltitude:1200,
    cumulusThickness:1.0,
    cumulusWindSpeed:25,
    cumulusWindAngle:30,
    altocumulusAltitude:3200,
    altocumulusThickness:.15,
    altocumulusWindSpeed:25,
    altocumulusWindAngle:60,
    cirrusAltitude:6000,
    cirrusThickness:1500,
    cirrusWindSpeed:40,
    cirrusWindAngle:90,
    noctilucentAltitude:80000,
    gtaoSlices:2,
    gtaoHorizonSteps:3,
    gtaoRadius:2,
    rayleighDensity:.0005,
    mieMorning:.007,
    mieNoon:.0001,
    mieEvening:.005,
    mieMidnight:.005,
    mieRain:.030,
    mieSnow:.015,
    bloomIntensity:1,
    waterWaveIterations:3,
    waterWaveStrength:1,
  })
});
window.PHOTON_V152=PHOTON_V152;

const PHOTON_V152_PROFILES=Object.freeze({
  Lite:{cloudQuality:.48,cloudLayers:2,shadowStrength:.30,fogScale:.70,ao:.0,bloom:.06,fxaa:.45,water:.35,postScale:.68},
  Balanced:{cloudQuality:.68,cloudLayers:3,shadowStrength:.48,fogScale:.86,ao:.28,bloom:.10,fxaa:.65,water:.58,postScale:.78},
  High:{cloudQuality:.86,cloudLayers:4,shadowStrength:.64,fogScale:1.0,ao:.43,bloom:.15,fxaa:.78,water:.78,postScale:.90},
  Ultra:{cloudQuality:1.0,cloudLayers:4,shadowStrength:.80,fogScale:1.12,ao:.58,bloom:.21,fxaa:.90,water:1.0,postScale:1.0},
});

function p152Clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v));}
function p152Profile(game){const n=game?.photonV148?.profile||'Lite';return PHOTON_V152_PROFILES[n]||PHOTON_V152_PROFILES.Lite;}
function p152DayFraction(){
  try{
    if(typeof dayClock!=='undefined'&&dayClock){
      if(typeof dayClock.phase==='function')return ((Number(dayClock.phase())||0)%1+1)%1;
      if(Number.isFinite(dayClock.ticks))return ((dayClock.ticks%24000)+24000)%24000/24000;
    }
  }catch{}
  return .25;
}
function p152Weather(game){
  const w=game?.weather;
  if(typeof w==='number')return p152Clamp(w);
  return p152Clamp(Number(w?.intensity??game?.weatherIntensity??0));
}
function p152Snow(game){
  try{return String(game?.weather?.type||game?.weatherType||'').toLowerCase().includes('snow')?1:0}catch{return 0}
}
function p152SunDir(){
  const phase=p152DayFraction(),a=(phase-.25)*Math.PI*2;
  return new THREE.Vector3(Math.cos(a),Math.sin(a),.16).normalize();
}
function p152MixColor(a,b,t){return a.clone().lerp(b,p152Clamp(t));}

class PhotonAssetBankV152{
  constructor(){this.noise=null;this.loading=null;}
  async load(){
    if(this.noise)return this;
    if(this.loading)return this.loading;
    this.loading=(async()=>{
      const loader=new THREE.TextureLoader();
      try{
        this.noise=await loader.loadAsync(PHOTON_V152.noise);
        this.noise.wrapS=this.noise.wrapT=THREE.RepeatWrapping;
        this.noise.magFilter=THREE.LinearFilter;
        this.noise.minFilter=THREE.LinearMipmapLinearFilter;
        this.noise.generateMipmaps=true;
        this.noise.colorSpace=THREE.NoColorSpace;
        this.noise.anisotropy=1;
        this.noise.needsUpdate=true;
        this.noise.userData.photonSource='photon_v1.3b.zip/shaders/image/noise.png';
      }catch(e){
        console.warn('[Photon V15.2] local Photon noise failed; continuing with procedural noise',e);
      }
      return this;
    })();
    return this.loading;
  }
}
window.__photonAssetsV152=window.__photonAssetsV152||new PhotonAssetBankV152();

const PHOTON_CLOUD_LAYERS=Object.freeze([
  {id:'cumulus',altitude:1200,thickness:1200,windSpeed:25,windAngle:30,scale:1.0,coverage:.55,density:1.00,detail:1.00,opacity:.92,color:[1.0,.98,.94],edge:.18},
  {id:'altocumulus',altitude:3200,thickness:480,windSpeed:25,windAngle:60,scale:1.55,coverage:.42,density:.45,detail:1.50,opacity:.58,color:[.96,.97,1.0],edge:.12},
  {id:'cirrus',altitude:6000,thickness:1500,windSpeed:40,windAngle:90,scale:2.25,coverage:.34,density:.50,detail:1.00,opacity:.34,color:[.95,.97,1.0],edge:.07},
  {id:'noctilucent',altitude:80000,thickness:2500,windSpeed:18,windAngle:110,scale:3.2,coverage:.22,density:.30,detail:.65,opacity:.22,color:[.48,.68,1.0],edge:.04},
]);

function p152CloudShader(layer,noiseTex){
  const usesNoise=!!noiseTex;
  return new THREE.ShaderMaterial({
    name:`PhotonWeb_${layer.id}`,
    transparent:true,depthWrite:false,depthTest:false,side:THREE.BackSide,blending:THREE.NormalBlending,toneMapped:false,
    uniforms:{
      uTime:{value:0},uSunDir:{value:new THREE.Vector3(.5,.7,.1)},uDay:{value:1},uDawn:{value:0},uRain:{value:0},uNight:{value:0},uQuality:{value:.6},
      uNoise:{value:noiseTex||null},uUseNoise:{value:usesNoise?1:0},uScale:{value:layer.scale},uCoverage:{value:layer.coverage},uDensity:{value:layer.density},
      uDetail:{value:layer.detail},uOpacity:{value:layer.opacity},uWind:{value:new THREE.Vector2(Math.cos(layer.windAngle*Math.PI/180),Math.sin(layer.windAngle*Math.PI/180)).multiplyScalar(layer.windSpeed*.0008)},
      uLayerTint:{value:new THREE.Color(layer.color[0],layer.color[1],layer.color[2])},uEdge:{value:layer.edge},uNoct:{value:layer.id==='noctilucent'?1:0}
    },
    vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`precision highp float;
      varying vec3 vDir; uniform sampler2D uNoise; uniform float uUseNoise,uTime,uDay,uDawn,uRain,uNight,uQuality,uScale,uCoverage,uDensity,uDetail,uOpacity,uEdge,uNoct; uniform vec2 uWind; uniform vec3 uSunDir,uLayerTint;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float texNoise(vec2 p){if(uUseNoise>.5)return texture2D(uNoise,fract(p)).r;return n2(p*256.0);}
      float fbm(vec2 p){float s=0.0,a=.5;for(int i=0;i<5;i++){s+=a*texNoise(p);p=p*2.03+vec2(.37,.19);a*=.5;}return s;}
      void main(){
        float h=vDir.y;if(h<.003)discard;
        vec2 planar=vDir.xz/max(h,.045);vec2 adv=uWind*uTime;
        vec2 p=planar*(.0105/uScale)+adv;
        float base=fbm(p)+.42*fbm(p*2.6+vec2(.23,.71))+uDetail*.14*fbm(p*5.7+vec2(.6,.11));
        float threshold=mix(.90,.56,uCoverage);float density=smoothstep(threshold-uEdge,threshold+uEdge*.25,base*uDensity);
        float horizon=smoothstep(.005,.085,h);density*=horizon;
        float sun=max(dot(normalize(vDir),normalize(uSunDir)),0.0);
        float forward=pow(sun,18.0);float silver=pow(sun,80.0);
        vec3 shadow=mix(vec3(.20,.23,.28),vec3(.48,.52,.58),uDay);
        vec3 light=mix(vec3(.72,.76,.84),uLayerTint,uDay);
        light=mix(light,vec3(1.0,.52,.32),uDawn*.24);
        light=mix(light,vec3(.17,.19,.22),uRain*.64);
        vec3 col=mix(shadow,light,.43+.45*base)+forward*vec3(.12,.09,.06)+silver*vec3(.28,.25,.20);
        if(uNoct>.5){col=mix(col,vec3(.28,.55,1.0),uNight*.68);density*=mix(.12,1.0,uNight);}
        float alpha=density*uOpacity*mix(.82,1.0,uQuality)*(1.0-uRain*.06);
        if(alpha<.004)discard;gl_FragColor=vec4(col,alpha);
      }`
  });
}

class PhotonCloudStackV152{
  constructor(game){this.game=game;this.scene=game?.renderer?.scene;this.camera=game?.renderer?.camera;this.group=new THREE.Group();this.group.name='photon_v152_cloud_stack';this.layers=[];this.ready=false;}
  async build(){
    if(!this.scene||!this.camera)return;
    await window.__photonAssetsV152.load();
    this.disposeMeshes();
    const noise=window.__photonAssetsV152.noise;
    const radii=[760,735,710,680];
    PHOTON_CLOUD_LAYERS.forEach((layer,i)=>{
      const geo=new THREE.SphereGeometry(radii[i],i<2?40:32,i<2?20:16);
      const mat=p152CloudShader(layer,noise);
      const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;mesh.renderOrder=-920+i;mesh.userData.photonCloudLayer=layer.id;this.group.add(mesh);this.layers.push(mesh);
    });
    this.scene.add(this.group);this.ready=true;
  }
  disposeMeshes(){for(const o of this.layers){o.geometry?.dispose?.();o.material?.dispose?.();o.parent?.remove?.(o)}this.layers=[];}
  update(t){
    if(!this.ready||!this.camera)return;this.group.position.copy(this.camera.position);
    const profile=p152Profile(this.game),sun=p152SunDir(),rain=p152Weather(this.game);const day=p152Clamp((sun.y+.10)/.46),dawn=p152Clamp(1-Math.abs(sun.y)/.25),night=1-day;
    this.layers.forEach((m,i)=>{m.visible=i<profile.cloudLayers&&this.game?.photonV148?.enabled!==false;const u=m.material.uniforms;u.uTime.value=t;u.uSunDir.value.copy(sun);u.uDay.value=day;u.uDawn.value=dawn;u.uRain.value=rain;u.uNight.value=night;u.uQuality.value=profile.cloudQuality;});
  }
  dispose(){this.disposeMeshes();this.group.parent?.remove?.(this.group);}
}

class PhotonFogV152{
  constructor(game){this.game=game;this.scene=game?.renderer?.scene;this.oldFog=this.scene?.fog||null;this.fog=new THREE.FogExp2(0x8eb4da,.0042);if(this.scene)this.scene.fog=this.fog;}
  update(){
    if(!this.scene)return;const profile=p152Profile(this.game),sun=p152SunDir(),rain=p152Weather(this.game),snow=p152Snow(this.game);const day=p152Clamp((sun.y+.11)/.48);const dawn=p152Clamp(1-Math.abs(sun.y)/.22);
    const dayC=new THREE.Color(.53,.69,.88),nightC=new THREE.Color(.035,.055,.11),rainC=new THREE.Color(.25,.29,.34),warm=new THREE.Color(.86,.45,.25),snowC=new THREE.Color(.64,.72,.80);
    let col=p152MixColor(nightC,dayC,day);col.lerp(warm,dawn*.24);col.lerp(rainC,rain*.62);col.lerp(snowC,snow*.32);
    const mie=(day>.72?.0001:(sun.y>0?.005:.005))*(1-rain)+.030*rain+.015*snow;
    const engineScale=28;this.fog.color.copy(col);this.fog.density=p152Clamp((.0019+mie*.12)*profile.fogScale*engineScale/100,0.0012,.018);
    if(this.scene.background?.isColor)this.scene.background.copy(col).lerp(new THREE.Color(.18,.38,.67),day*.38);
  }
  dispose(){if(this.scene&&this.scene.fog===this.fog)this.scene.fog=this.oldFog;}
}

class PhotonCloudShadowPatcherV152{
  constructor(game){this.game=game;this.scene=game?.renderer?.scene;this.uniforms=new Set();this.patched=new WeakSet();}
  patchMaterial(mat){
    if(!mat||this.patched.has(mat)||mat.isShaderMaterial)return;const prev=mat.onBeforeCompile;
    mat.onBeforeCompile=(shader,renderer)=>{
      prev?.(shader,renderer);shader.uniforms.photonTime={value:0};shader.uniforms.photonCloudShadow={value:.45};shader.uniforms.photonRain={value:0};this.uniforms.add(shader.uniforms);
      shader.vertexShader=`varying vec3 vPhotonWorldPos;\n`+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvPhotonWorldPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader=`varying vec3 vPhotonWorldPos;uniform float photonTime,photonCloudShadow,photonRain;\nfloat photonHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat photonNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(photonHash(i),photonHash(i+vec2(1,0)),f.x),mix(photonHash(i+vec2(0,1)),photonHash(i+vec2(1,1)),f.x),f.y);}\nfloat photonCloudMask(vec2 wp){vec2 p=wp*.012+vec2(photonTime*.018,photonTime*.006);float n=.62*photonNoise(p)+.38*photonNoise(p*2.31+8.4);return smoothstep(.55,.78,n);}\n`+shader.fragmentShader.replace('#include <dithering_fragment>','float pcm=photonCloudMask(vPhotonWorldPos.xz);float ps=1.0-pcm*photonCloudShadow*(1.0-photonRain*.18);gl_FragColor.rgb*=ps;\n#include <dithering_fragment>');
    };
    mat.customProgramCacheKey=()=>`photon-cloud-shadow-v152-${mat.uuid}`;mat.needsUpdate=true;this.patched.add(mat);
  }
  scan(){this.scene?.traverse?.(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))this.patchMaterial(m)});}
  update(t){const p=p152Profile(this.game),rain=p152Weather(this.game);for(const u of this.uniforms){if(u.photonTime)u.photonTime.value=t;if(u.photonCloudShadow)u.photonCloudShadow.value=p.shadowStrength;if(u.photonRain)u.photonRain.value=rain;}}
}

class PhotonWaterPatcherV152{
  constructor(game){this.game=game;this.scene=game?.renderer?.scene;this.uniforms=new Set();this.patched=new WeakSet();}
  looksLikeWater(mat){if(!mat)return false;const s=JSON.stringify(mat.userData||{}).toLowerCase();const n=String(mat.name||'').toLowerCase();const map=String(mat.map?.userData?.sourceURL||mat.map?.name||'').toLowerCase();return n.includes('water')||s.includes('water')||map.includes('water');}
  patch(mat){
    if(!this.looksLikeWater(mat)||this.patched.has(mat)||mat.isShaderMaterial)return;const prev=mat.onBeforeCompile;
    mat.onBeforeCompile=(shader,r)=>{prev?.(shader,r);shader.uniforms.photonWaterTime={value:0};shader.uniforms.photonWaterStrength={value:.5};this.uniforms.add(shader.uniforms);
      shader.vertexShader=`uniform float photonWaterTime,photonWaterStrength;varying vec3 vPhotonWaterWorld;\n`+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat pw=sin((position.x+photonWaterTime*1.35)*4.0)+sin((position.z-photonWaterTime*.92)*5.3);transformed.y+=pw*.006*photonWaterStrength;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvPhotonWaterWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader=`uniform float photonWaterTime,photonWaterStrength;varying vec3 vPhotonWaterWorld;\n`+shader.fragmentShader.replace('#include <dithering_fragment>','float ripple=.5+.5*sin(vPhotonWaterWorld.x*3.7+vPhotonWaterWorld.z*4.9+photonWaterTime*1.8);gl_FragColor.rgb+=vec3(.025,.055,.07)*ripple*photonWaterStrength;\n#include <dithering_fragment>');
    };mat.customProgramCacheKey=()=>`photon-water-v152-${mat.uuid}`;mat.needsUpdate=true;this.patched.add(mat);
  }
  scan(){this.scene?.traverse?.(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))this.patch(m)});}
  update(t){const s=p152Profile(this.game).water;for(const u of this.uniforms){if(u.photonWaterTime)u.photonWaterTime.value=t;if(u.photonWaterStrength)u.photonWaterStrength.value=s;}}
}

class PhotonPostFXV152{
  constructor(game){this.game=game;this.renderer=game?.renderer?.renderer;this.scene=game?.renderer?.scene;this.camera=game?.renderer?.camera;this.enabled=false;this.originalRender=null;this.target=null;this.fsScene=null;this.fsCamera=null;this.mat=null;this.lastSize='';this.install();}
  install(){
    const r=this.renderer;if(!r?.isWebGLRenderer||!this.scene||!this.camera)return;
    this.target=new THREE.WebGLRenderTarget(4,4,{depthBuffer:true,stencilBuffer:false,type:THREE.UnsignedByteType});try{this.target.depthTexture=new THREE.DepthTexture(4,4,THREE.UnsignedIntType);}catch{}
    this.fsScene=new THREE.Scene();this.fsCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.mat=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tColor:{value:this.target.texture},tDepth:{value:this.target.depthTexture},uRes:{value:new THREE.Vector2(4,4)},uAO:{value:.25},uBloom:{value:.1},uFXAA:{value:.6},uExposure:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform sampler2D tColor,tDepth;uniform vec2 uRes;uniform float uAO,uBloom,uFXAA,uExposure;
      float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
      void main(){vec2 px=1.0/uRes;vec3 c=texture2D(tColor,vUv).rgb;float d=texture2D(tDepth,vUv).r;
        float dd=0.0;dd+=abs(d-texture2D(tDepth,vUv+vec2(px.x,0)).r);dd+=abs(d-texture2D(tDepth,vUv+vec2(-px.x,0)).r);dd+=abs(d-texture2D(tDepth,vUv+vec2(0,px.y)).r);dd+=abs(d-texture2D(tDepth,vUv+vec2(0,-px.y)).r);float ao=1.0-clamp(dd*36.0,0.0,.48)*uAO;c*=ao;
        vec3 b=vec3(0.0);for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){vec3 s=texture2D(tColor,vUv+vec2(float(x),float(y))*px*2.0).rgb;float k=smoothstep(.72,1.25,lum(s));b+=s*k;}}b/=25.0;c+=b*uBloom;
        vec3 n=texture2D(tColor,vUv+vec2(px.x,0)).rgb+texture2D(tColor,vUv-vec2(px.x,0)).rgb+texture2D(tColor,vUv+vec2(0,px.y)).rgb+texture2D(tColor,vUv-vec2(0,px.y)).rgb;n*=.25;float edge=clamp(length(c-n)*2.8,0.0,1.0);c=mix(c,n,edge*uFXAA*.23);c=1.0-exp(-c*uExposure);c=pow(max(c,vec3(0.0)),vec3(.96));gl_FragColor=vec4(c,1.0);}`});
    const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.mat);q.frustumCulled=false;this.fsScene.add(q);this.originalRender=r.render.bind(r);const self=this;
    r.render=function(scene,camera){if(!self.enabled||scene!==self.scene||camera!==self.camera||r.xr?.isPresenting)return self.originalRender(scene,camera);self.resize();r.setRenderTarget(self.target);self.originalRender(scene,camera);r.setRenderTarget(null);self.originalRender(self.fsScene,self.fsCamera);};this.enabled=true;
  }
  resize(){const r=this.renderer,p=p152Profile(this.game);const sz=r.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(2,Math.floor(sz.x*p.postScale)),h=Math.max(2,Math.floor(sz.y*p.postScale));const k=w+'x'+h;if(k!==this.lastSize){this.target.setSize(w,h);this.mat.uniforms.uRes.value.set(w,h);this.lastSize=k;}}
  update(){if(!this.mat)return;const p=p152Profile(this.game),isTouch=matchMedia('(pointer:coarse)').matches;this.mat.uniforms.uAO.value=isTouch?Math.min(p.ao,.38):p.ao;this.mat.uniforms.uBloom.value=p.bloom;this.mat.uniforms.uFXAA.value=p.fxaa;this.mat.uniforms.uExposure.value=1.02;this.enabled=this.game?.photonV148?.enabled!==false;}
  dispose(){if(this.renderer&&this.originalRender)this.renderer.render=this.originalRender;this.target?.dispose?.();this.mat?.dispose?.();}
}

class PhotonWebGauntletV152{
  constructor(game){this.game=game;this.clouds=new PhotonCloudStackV152(game);this.fog=new PhotonFogV152(game);this.shadows=new PhotonCloudShadowPatcherV152(game);this.water=new PhotonWaterPatcherV152(game);this.post=new PhotonPostFXV152(game);this.lastScan=0;this.ready=false;}
  async build(){await this.clouds.build();this.shadows.scan();this.water.scan();this.ready=true;window.__voxelDiag?.log?.('V15.2 PHOTON GAUNTLET: cloud layers, cloud shadows, atmospheric fog, GTAO-like depth AO, water response, bloom/color/AA post chain active.','ok');}
  update(t=performance.now()/1000){if(!this.ready)return;this.clouds.update(t);this.fog.update();this.shadows.update(t);this.water.update(t);this.post.update();if(t-this.lastScan>2.5){this.lastScan=t;this.shadows.scan();this.water.scan();}}
  diagnostics(){return{version:'V15.2',photon:'1.3b',profile:this.game?.photonV148?.profile||'Lite',assets:{noise:!!window.__photonAssetsV152.noise,noisePath:PHOTON_V152.noise},systems:{cumulus:true,altocumulus:true,cirrus:true,noctilucent:true,cloudShadows:true,rayleighMieFog:true,gtaoApprox:!!this.post?.enabled,waterWavePatch:true,bloom:true,fxaaApprox:true,colorExposure:true},note:'Browser-native translation. Original Iris compute/temporal/LPV passes remain approximations where WebGL pipeline differs.'};}
  dispose(){this.clouds.dispose();this.fog.dispose();this.post.dispose();}
}
window.PhotonWebGauntletV152=PhotonWebGauntletV152;

(function installPhotonGauntlet152(){
  const base=Game.prototype.boot;
  Game.prototype.boot=async function(...args){const r=await base.apply(this,args);try{this.photonGauntletV152?.dispose?.();this.photonGauntletV152=new PhotonWebGauntletV152(this);await this.photonGauntletV152.build();}catch(e){console.warn('[Photon Gauntlet V15.2 build]',e)}return r;};
  function frame(){requestAnimationFrame(frame);try{window.game?.photonGauntletV152?.update?.()}catch(e){if(!window.__photon152FrameErr){window.__photon152FrameErr=true;console.warn('[Photon Gauntlet V15.2 frame]',e)}}}requestAnimationFrame(frame);
  try{runtimeCommands.register('photon152',()=>window.game?.photonGauntletV152?.diagnostics?.()||{ready:false},'Inspect Photon Web V15.2 source-informed graphics translation.');}catch{}
})();
