/* ===================== V14.6C: MOBILE FRAME-TIME / MEMORY GOVERNOR ===================== */
class PerformanceGovernorV146{
  constructor(gameRef){
    this.game=gameRef;this.mobile=matchMedia('(pointer:coarse)').matches;this.interval=.75;this.clock=0;this.ema=60;this.low=0;this.high=0;this.particleScale=1;
    this.renderer=gameRef.renderer?.renderer;this.maxDpr=Math.min(this.renderer?.getPixelRatio?.()||window.devicePixelRatio||1,this.mobile?1.75:2.0);this.minDpr=this.mobile?1.05:1.25;this.dpr=this.maxDpr;
    this.baseView=Math.max(2,gameRef.world?.viewDistance||ENGINE.VIEW_DISTANCE);this.minView=this.mobile?Math.min(3,this.baseView):Math.min(4,this.baseView);this.lastMemoryTrim=0;this.mode='balanced';this.applyDpr(this.dpr);
  }
  applyDpr(value){const r=this.game.renderer?.renderer;if(!r)return;const v=Math.max(this.minDpr,Math.min(this.maxDpr,Math.round(value*20)/20));if(Math.abs(v-this.dpr)<.025&&Math.abs((r.getPixelRatio?.()||v)-v)<.025)return;this.dpr=v;r.setPixelRatio(v);r.setSize(innerWidth,innerHeight,false);}
  trimMemory(){const now=performance.now();if(now-this.lastMemoryTrim<15000)return;this.lastMemoryTrim=now;const mem=this.game.assets?.memory,max=this.mobile?160:320;if(mem?.size>max){let remove=mem.size-max;for(const k of mem.keys()){if(remove--<=0)break;mem.delete(k);}}
    const failures=this.game.resolver?.failures;if(failures?.size>256)failures.clear();
  }
  sample(){const fps=Number(this.game.stats?.fps)||60,current=this.game.renderer?.renderer?.getPixelRatio?.()||this.dpr;if(current>this.maxDpr+.02)this.applyDpr(this.maxDpr);this.ema=this.ema*.72+fps*.28;
    if(this.ema<47){this.low++;this.high=0;}else if(this.ema>57){this.high++;this.low=Math.max(0,this.low-1);}else{this.low=Math.max(0,this.low-1);this.high=Math.max(0,this.high-1);}
    if(this.low>=2){const severe=this.ema<36;this.applyDpr(this.dpr-(severe?.20:.10));this.particleScale=severe?.42:.65;this.game.world.v146BuildBudget=1;this.game.world.v146LoadBudget=1;if(severe&&this.game.world.viewDistance>this.minView)this.game.world.viewDistance--;this.mode=severe?'protect':'performance';this.low=0;}
    if(this.high>=6){this.applyDpr(this.dpr+.05);this.particleScale=Math.min(1,this.particleScale+.1);if(this.game.world.viewDistance<this.baseView&&this.ema>58)this.game.world.viewDistance++;this.game.world.v146BuildBudget=this.mobile?1:2;this.game.world.v146LoadBudget=1;this.mode='quality';this.high=0;}
    this.trimMemory();
  }
  update(dt){this.clock+=dt;if(this.clock<this.interval)return;this.clock=0;this.sample();}
  snapshot(){return{fps:Number(this.game.stats?.fps||0).toFixed(1),ema:Number(this.ema).toFixed(1),dpr:this.dpr,maxDpr:this.maxDpr,viewDistance:this.game.world?.viewDistance,baseView:this.baseView,particleScale:this.particleScale,mode:this.mode,mobile:this.mobile,assetBlobCache:this.game.assets?.memory?.size||0,sections:this.game.renderer?.sectionVisibilityV146?.stats||null};}
}

const v146PerfBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v146PerfBootBase.apply(this,args);this.performanceV146=new PerformanceGovernorV146(this);window.__voxelDiag?.log?.(`V14.6C READY: adaptive DPR ${this.performanceV146.dpr.toFixed(2)} (max ${this.performanceV146.maxDpr.toFixed(2)}), view-distance protection, particle scaling and bounded asset blob memory active.`,'ok');};
const v146PerfUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v146PerfUpdateBase.call(this,dt);this.performanceV146?.update(dt);return r;};

/* Keep expensive diagnostics out of the frame hot path while preserving the DBG panel. */
const v146DiagBase=VoxelRenderer.prototype.updateDiagnostics;
VoxelRenderer.prototype.updateDiagnostics=function(force=false){const now=performance.now();if(!force&&this._v146DiagAt&&now-this._v146DiagAt<650)return;this._v146DiagAt=now;return v146DiagBase.call(this,force);};

/* Perf-friendly stats that include section visibility. */
try{
  runtimeCommands.register('perf',()=>game.performanceV146?.snapshot?.()||null,'Inspect V14.6 adaptive mobile performance governor.');
  runtimeCommands.register('occlusion',()=>game.renderer?.sectionVisibilityV146?.stats||null,'Inspect V14.6 section portal/frustum culling results.');
}catch{}

window.__voxelDiag?.log?.('V14.6C READY: iPhone-safe dynamic resolution, adaptive visibility/load budgets, particle budget and memory pruning installed.','ok');
