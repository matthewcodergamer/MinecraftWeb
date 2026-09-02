/* Minecraft Web V16.4.2 — performance/stability hardening for V16.4 parity. */
(function(){
'use strict';
const BUILD='0.16.4.2';

/* -------------------------------------------------------------------------- */
/* Terrain surface cache. surfaceY() is deterministic for a seed, but village, */
/* tree, spawn and chunk generation code asks for the same columns repeatedly. */
/* Keep a bounded cache per WorldGenerator to avoid recalculating 2D FBM.       */
/* -------------------------------------------------------------------------- */
if(typeof WorldGenerator!=='undefined'&&typeof WorldGenerator.prototype.surfaceY==='function'){
  const surfaceBaseV1642=WorldGenerator.prototype.surfaceY;
  WorldGenerator.prototype.surfaceY=function(x,z){
    x=Math.floor(Number(x)||0);z=Math.floor(Number(z)||0);
    const cache=this._surfaceCacheV1642??=(new Map()),key=`${x},${z}`;
    if(cache.has(key))return cache.get(key);
    const value=surfaceBaseV1642.call(this,x,z);
    if(cache.size>=32768){
      /* Simple bounded generational cache. Clearing as a batch is faster on
         mobile Safari than deleting thousands of Map keys one by one. */
      cache.clear();
    }
    cache.set(key,value);return value;
  };
}

/* -------------------------------------------------------------------------- */
/* Leaves: V16.4 repairs the material every gameplay frame. Three.js increments */
/* Material.version each time needsUpdate=true, which can trigger needless      */
/* program/property work. Install an instance setter that forwards only when   */
/* shader-affecting leaf state actually changes.                               */
/* -------------------------------------------------------------------------- */
function guardLeafMaterialV1642(material){
  if(!material||material.__v1642Guarded)return;
  let proto=material,descriptor=null;
  while(proto&&!descriptor){proto=Object.getPrototypeOf(proto);descriptor=proto&&Object.getOwnPropertyDescriptor(proto,'needsUpdate');}
  const baseSetter=descriptor?.set;if(typeof baseSetter!=='function')return;
  let last='';
  const signature=()=>[
    material.map?.uuid||'',material.alphaMap?.uuid||'',material.transparent?1:0,
    Number(material.alphaTest)||0,material.side,material.blending,
    material.depthTest?1:0,material.depthWrite?1:0,material.premultipliedAlpha?1:0,
    material.toneMapped?1:0,material.vertexColors?1:0
  ].join('|');
  try{
    Object.defineProperty(material,'needsUpdate',{
      configurable:true,
      set(value){
        if(value!==true)return;
        const next=signature();
        if(next===last)return;
        last=next;baseSetter.call(material,true);
      }
    });
    material.__v1642Guarded=true;
    material.needsUpdate=true;
  }catch{}
}

/* -------------------------------------------------------------------------- */
/* Water queue guard. Flow remains deterministic, but a large opened reservoir  */
/* can enqueue a huge frontier. Cap pending cells and shed oldest work instead  */
/* of allowing an iPhone tab to grow memory without bound.                      */
/* -------------------------------------------------------------------------- */
function guardWaterQueueV1642(sim){
  if(!sim||sim.__v1642Guarded||typeof sim.enqueue!=='function')return;
  const base=sim.enqueue.bind(sim),MAX_PENDING=12288;
  sim.enqueue=function(x,y,z){
    if(this.queue?.length>=MAX_PENDING){
      const drop=Math.min(1024,this.queue.length>>2);
      for(let i=0;i<drop;i++){
        const old=this.queue.shift();
        if(old)this.queued?.delete?.(this.key(...old));
      }
      this.droppedV1642=(this.droppedV1642||0)+drop;
    }
    return base(x,y,z);
  };
  sim.__v1642Guarded=true;
}

/* -------------------------------------------------------------------------- */
/* First-hit audio prewarm. Java OGG decode is asynchronous, but the first      */
/* decode can still compete for CPU around the first attack. After the user's   */
/* first gesture, resolve/cache a few common attack and passive-mob hit sounds  */
/* while gameplay is otherwise idle. No sound is played during prewarm.         */
/* -------------------------------------------------------------------------- */
async function prewarmCombatAudioV1642(){
  const audio=game?.javaAudioV144;if(!audio||audio.__v1642Prewarmed)return;
  audio.__v1642Prewarmed=true;
  try{
    await audio.unlock?.();const defs=await audio.catalog?.load?.();if(!defs)return;
    const events=['entity.player.attack.weak','entity.player.attack.strong','entity.player.attack.crit','entity.cow.hurt','entity.chicken.hurt','entity.pig.hurt','entity.sheep.hurt'];
    const jobs=[];
    for(const event of events){
      const resolved=await audio.catalog.resolve(event);if(!resolved)continue;
      const sample=audio.catalog.choose(defs,resolved);if(sample?.name)jobs.push(audio.fetchBuffer(sample.name));
    }
    await Promise.allSettled(jobs);
    window.__voxelDiag?.log?.(`V16.4.2 AUDIO PREWARM: ${jobs.length} Java attack/passive samples cached.`,'ok');
  }catch(e){window.__voxelDiag?.log?.(`V16.4.2 audio prewarm skipped: ${e.message}`,'warn')}
}
function installAudioPrewarmV1642(){
  if(window.__v1642AudioGestureInstalled)return;window.__v1642AudioGestureInstalled=true;
  const fire=()=>{removeEventListener('pointerdown',fire,true);removeEventListener('keydown',fire,true);setTimeout(prewarmCombatAudioV1642,80)};
  addEventListener('pointerdown',fire,{capture:true,passive:true,once:true});
  addEventListener('keydown',fire,{capture:true,passive:true,once:true});
}
installAudioPrewarmV1642();

/* -------------------------------------------------------------------------- */
/* Boot/update integration.                                                     */
/* -------------------------------------------------------------------------- */
if(typeof Game!=='undefined'){
  const bootBaseV1642=Game.prototype.boot;
  Game.prototype.boot=async function(...args){
    const r=await bootBaseV1642.apply(this,args);
    guardLeafMaterialV1642(this.renderer?.materialLeaves);
    guardWaterQueueV1642(this.waterV164);
    window.__voxelDiag?.log?.('V16.4.2 READY: terrain-column cache, leaf material version guard, bounded fluid queue and first-hit audio prewarm installed.','ok');
    return r;
  };
  const updateBaseV1642=Game.prototype.update;
  Game.prototype.update=function(dt){
    guardLeafMaterialV1642(this.renderer?.materialLeaves);
    guardWaterQueueV1642(this.waterV164);
    return updateBaseV1642.call(this,dt);
  };
}

try{
  runtimeCommands.register('v1642',()=>({
    build:BUILD,
    surfaceCache:game?.world?.generator?._surfaceCacheV1642?.size||0,
    leafGuard:!!game?.renderer?.materialLeaves?.__v1642Guarded,
    fluidQueue:game?.waterV164?.queue?.length||0,
    fluidDropped:game?.waterV164?.droppedV1642||0,
    audioPrewarmed:!!game?.javaAudioV144?.__v1642Prewarmed
  }),'Inspect V16.4.2 performance/stability state.');
}catch{}
window.MINECRAFT_WEB_VERSION=BUILD;
window.STUDIO_PATCH_VERSION='0.16.4.2-performance-stability';
})();
