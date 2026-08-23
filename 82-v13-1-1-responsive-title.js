/* ===================== V13.1.1 HOTFIX: RESPONSIVE TITLE WORLD ===================== */
const STUDIO_V13_1_1=Object.freeze({version:'0.13.1-alpha.3',titleDprMax:2.0,titleFov:70});
window.STUDIO_PATCH_VERSION=STUDIO_V13_1_1.version;

const v1311TitleStyle=document.createElement('style');
v1311TitleStyle.textContent=`
#titleScreen{width:100%;height:100%;min-width:0;min-height:0;contain:layout paint;}
#v9TitleCanvas{inset:0!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;max-width:none!important;max-height:none!important;transform:none!important;object-fit:fill!important;}
`;
document.head.appendChild(v1311TitleStyle);

TitleWorldV9.prototype.resize=function(force=false){
  if(!this.r||!this.c||!this.canvas)return;
  const rect=this.canvas.getBoundingClientRect();
  const host=titleScreen?.getBoundingClientRect?.();
  const vv=window.visualViewport;
  let w=Math.round(rect.width||host?.width||vv?.width||innerWidth||1);
  let h=Math.round(rect.height||host?.height||vv?.height||innerHeight||1);
  w=Math.max(1,w);h=Math.max(1,h);
  if(!force&&w===this._v1311W&&h===this._v1311H)return;
  this._v1311W=w;this._v1311H=h;
  const dpr=Math.min(Number(devicePixelRatio)||1,STUDIO_V13_1_1.titleDprMax);
  if(Math.abs((this.r.getPixelRatio?.()||1)-dpr)>.001)this.r.setPixelRatio(dpr);
  this.r.setSize(w,h,false);
  this.r.setViewport(0,0,w,h);
  this.c.aspect=w/h;
  this.c.fov=STUDIO_V13_1_1.titleFov;
  this.c.updateProjectionMatrix();
  this.canvas.style.width='100%';
  this.canvas.style.height='100%';
  this.canvas.style.left='0';
  this.canvas.style.top='0';
};

TitleWorldV9.prototype.scheduleResponsiveResizeV1311=function(){
  if(!this.alive)return;
  cancelAnimationFrame(this._v1311ResizeRAF||0);
  clearTimeout(this._v1311Resize80);clearTimeout(this._v1311Resize240);clearTimeout(this._v1311Resize520);
  this._v1311ResizeRAF=requestAnimationFrame(()=>this.resize(true));
  this._v1311Resize80=setTimeout(()=>this.resize(true),80);
  this._v1311Resize240=setTimeout(()=>this.resize(true),240);
  this._v1311Resize520=setTimeout(()=>this.resize(true),520);
};

const v1311TitleInitBase=TitleWorldV9.prototype.init;
TitleWorldV9.prototype.init=async function(...args){
  if(!this._v1311ResponsiveInstalled){
    this._v1311ResponsiveInstalled=true;
    this._v1311ViewportResize=()=>this.scheduleResponsiveResizeV1311();
    this._v1311Orientation=()=>this.scheduleResponsiveResizeV1311();
    this._v1311Observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this.scheduleResponsiveResizeV1311()):null;
    this._v1311Observer?.observe(this.canvas);
    if(titleScreen)this._v1311Observer?.observe(titleScreen);
    window.visualViewport?.addEventListener?.('resize',this._v1311ViewportResize,{passive:true});
    window.visualViewport?.addEventListener?.('scroll',this._v1311ViewportResize,{passive:true});
    window.addEventListener('orientationchange',this._v1311Orientation,{passive:true});
    screen.orientation?.addEventListener?.('change',this._v1311Orientation);
  }
  const result=await v1311TitleInitBase.apply(this,args);
  this.scheduleResponsiveResizeV1311();
  return result;
};

const v1311TitleDisposeBase=TitleWorldV9.prototype.dispose;
TitleWorldV9.prototype.dispose=function(){
  this._v1311Observer?.disconnect?.();
  window.visualViewport?.removeEventListener?.('resize',this._v1311ViewportResize);
  window.visualViewport?.removeEventListener?.('scroll',this._v1311ViewportResize);
  window.removeEventListener('orientationchange',this._v1311Orientation);
  screen.orientation?.removeEventListener?.('change',this._v1311Orientation);
  cancelAnimationFrame(this._v1311ResizeRAF||0);
  clearTimeout(this._v1311Resize80);clearTimeout(this._v1311Resize240);clearTimeout(this._v1311Resize520);
  return v1311TitleDisposeBase.call(this);
};

window.__voxelDiag?.log?.(`V13.1.1 READY ${STUDIO_V13_1_1.version}: title-world canvas now follows its real CSS viewport through ResizeObserver, visualViewport and delayed iOS orientation resyncs; camera aspect is rebuilt from the actual landscape canvas size.`,'ok');


