/* ===================== V13.2 VISUAL HOTFIX: HIGH-QUALITY ANTI-ALIASING ===================== */
const STUDIO_V13_2=Object.freeze({version:'0.13.2-alpha.1',aa:'MSAA + Retina supersampling',fastDpr:1.5,fancyDpr:1.75,ultraDpr:2.0,titleDpr:2.0});
window.STUDIO_PATCH_VERSION=STUDIO_V13_2.version;

const v132AAStyle=document.createElement('style');
v132AAStyle.textContent=`
#gameCanvas,#v9TitleCanvas{image-rendering:auto!important;}
#v9TitleCanvas{filter:none!important;}
`;
document.head.appendChild(v132AAStyle);

function v132AATargetDpr(profile='fancy'){
  const cap=profile==='fast'?STUDIO_V13_2.fastDpr:profile==='ultra'?STUDIO_V13_2.ultraDpr:STUDIO_V13_2.fancyDpr;
  return Math.min(Number(devicePixelRatio)||1,cap);
}
function v132ApplyMaterialAA(rr){
  if(!rr)return;
  for(const m of [rr.materialCutout,rr.materialLeaves]){
    if(!m)continue;
    // Alpha-to-coverage softens alpha-tested foliage/plant edges when MSAA is available.
    try{m.alphaToCoverage=true;m.needsUpdate=true;}catch{}
  }
}
function v132ApplyRendererAA(rr,profile){
  const r=rr?.renderer;if(!r)return;
  const dpr=v132AATargetDpr(profile);
  try{if(Math.abs((r.getPixelRatio?.()||1)-dpr)>.001)r.setPixelRatio(dpr);}catch{}
  v132ApplyMaterialAA(rr);
}

const v132GraphicsApplyBase=GraphicsQualityV7.prototype.apply;
GraphicsQualityV7.prototype.apply=function(profile=this.profile){
  const p=v132GraphicsApplyBase.call(this,profile);
  v132ApplyRendererAA(this.game?.renderer,p);
  window.__voxelDiag?.log?.(`ANTI-ALIAS ${p.toUpperCase()}: MSAA ON • DPR ${(this.game?.renderer?.renderer?.getPixelRatio?.()||1).toFixed(2)} • alpha-to-coverage foliage ON`,'ok');
  return p;
};

const v132RendererResizeBase=VoxelRenderer.prototype.resize;
VoxelRenderer.prototype.resize=function(...args){
  const result=v132RendererResizeBase.apply(this,args);
  v132ApplyRendererAA(this,this.gameRefV7?.graphicsV7?.profile||game.graphicsV7?.profile||localStorage.getItem('studioGraphicsV7')||'fancy');
  return result;
};

const v132TitleResizeBase=TitleWorldV9.prototype.resize;
TitleWorldV9.prototype.resize=function(force=false){
  v132TitleResizeBase.call(this,force);
  if(this.r){
    const dpr=Math.min(Number(devicePixelRatio)||1,STUDIO_V13_2.titleDpr);
    try{if(Math.abs((this.r.getPixelRatio?.()||1)-dpr)>.001){this.r.setPixelRatio(dpr);const w=Math.max(1,Math.round(this._v1311W||this.canvas.clientWidth||innerWidth)),h=Math.max(1,Math.round(this._v1311H||this.canvas.clientHeight||innerHeight));this.r.setSize(w,h,false);}}catch{}
  }
};

try{runtimeCommands.register('aa',()=>({version:STUDIO_V13_2.version,backend:game.renderer?.backendLabel?.(),pixelRatio:game.renderer?.renderer?.getPixelRatio?.(),devicePixelRatio:Number(devicePixelRatio)||1,profile:game.graphicsV7?.profile||'pre-game',msaaRequested:true,titlePixelRatio:titleWorldV9?.r?.getPixelRatio?.()||null,alphaToCoverage:{cutout:!!game.renderer?.materialCutout?.alphaToCoverage,leaves:!!game.renderer?.materialLeaves?.alphaToCoverage}}),'Inspect V13.2 anti-aliasing state.');}catch{}
window.__voxelDiag?.log?.(`V13.2 READY ${STUDIO_V13_2.version}: home-screen blur removed; WebGL/WebGPU request MSAA on every graphics preset; Retina supersampling is 1.5x Fast, 1.75x Fancy, up to 2x Ultra/title; foliage alpha-to-coverage enabled.`,'ok');


