/* ===================== V14.7D: MINING AUDIO + ALPHA / SOURCE INTEGRITY HOTFIX ===================== */
const STUDIO_V14_7D=Object.freeze({
  version:'0.14.7-fidelity-hotfix.1',
  hitSoundIntervalMs:190,
  crackOpacity:.62,
  mobileMusicVolume:.08,
  desktopMusicVolume:.10
});
window.STUDIO_PATCH_VERSION=STUDIO_V14_7D.version;

/* Minecraft Java block breaking is not only a final break sound: while mining, material hit sounds
   repeat at a restrained cadence, then the actual material break sound fires exactly once when the
   block becomes air. V14.7B already resolves Java sounds.json + direct Java material samples; this
   wrapper makes sure the mining path actually invokes that engine for logs/grass/stone/etc. */
const v147dMineBase=Game.prototype.mine;
Game.prototype.mine=function(dt){
  const active=!!this.breaking;
  const before=active?this.getTarget?.():null;
  const beforeId=before?.id??BLOCK.AIR;
  const beforeKey=before?blockKey(before.x,before.y,before.z):'';
  if(active&&before&&beforeId!==BLOCK.AIR&&beforeId!==BLOCK.WATER){
    const nowMs=performance.now();
    if(this._v147dHitKey!==beforeKey){this._v147dHitKey=beforeKey;this._v147dNextHit=0;}
    if(nowMs>=(this._v147dNextHit||0)){
      this._v147dNextHit=nowMs+STUDIO_V14_7D.hitSoundIntervalMs;
      const pos=new THREE.Vector3(before.x+.5,before.y+.5,before.z+.5);
      this.soundV14?.playBlock?.(beforeId,'hit',{position:pos,volume:.24,pitch:.96,maxDistance:14})?.catch?.(()=>{});
    }
  }else{this._v147dHitKey='';this._v147dNextHit=0;}
  const result=v147dMineBase.call(this,dt);
  if(before&&beforeId!==BLOCK.AIR&&beforeId!==BLOCK.WATER&&this.world?.getLoaded?.(before.x,before.y,before.z)===BLOCK.AIR){
    const pos=new THREE.Vector3(before.x+.5,before.y+.5,before.z+.5);
    this.soundV14?.playBlock?.(beforeId,'break',{position:pos,volume:.52,pitch:1,maxDistance:18})?.catch?.(()=>{});
    this._v147dHitKey='';this._v147dNextHit=0;
  }
  return result;
};

/* Make the Java destroy-stage overlay behave like a transparent crack decal even if a supplied PNG
   was exported against an opaque background. Existing alpha is preserved and softened; only an
   opaque, near-uniform border is treated as an accidental background. */
function v147dCrackCanvas(image){
  const cv=document.createElement('canvas');cv.width=image.width||16;cv.height=image.height||16;
  const x=cv.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(image,0,0,cv.width,cv.height);
  const img=x.getImageData(0,0,cv.width,cv.height),d=img.data,w=cv.width,h=cv.height;
  let translucent=0;for(let i=3;i<d.length;i+=4)if(d[i]<245)translucent++;
  if(translucent/(w*h)<.02){
    let br=0,bg=0,bb=0,n=0;const add=(px,py)=>{const i=(py*w+px)*4;br+=d[i];bg+=d[i+1];bb+=d[i+2];n++;};
    for(let px=0;px<w;px++){add(px,0);if(h>1)add(px,h-1);}for(let py=1;py<h-1;py++){add(0,py);if(w>1)add(w-1,py);}
    br/=Math.max(1,n);bg/=Math.max(1,n);bb/=Math.max(1,n);
    for(let i=0;i<d.length;i+=4){const dr=d[i]-br,dg=d[i+1]-bg,db=d[i+2]-bb,dist=Math.sqrt(dr*dr+dg*dg+db*db);d[i+3]=clamp(Math.round((dist-5)*6),0,210);}
  }else for(let i=3;i<d.length;i+=4)d[i]=Math.round(d[i]*.72);
  x.putImageData(img,0,0);return cv;
}
if(typeof MinecraftBreakOverlayV147!=='undefined'){
  MinecraftBreakOverlayV147.prototype.texture=function(stage){
    if(this.textures[stage])return Promise.resolve(this.textures[stage]);if(this.pending[stage])return this.pending[stage];
    this.pending[stage]=(async()=>{const rel=`blocks/destroy_stage_${stage}.png`,{image,url}=await v147LoadImageCandidates(rel),cv=v147dCrackCanvas(image);image.close?.();const t=v147CanvasTexture(cv,url);this.textures[stage]=t;return t;})().catch(e=>{window.__voxelDiag?.log?.(`V14.7D BREAK STAGE ${stage}: ${e.message}`,'warn');return null;}).finally(()=>this.pending[stage]=null);return this.pending[stage];
  };
  const v147dBreakEnsureBase=MinecraftBreakOverlayV147.prototype.ensure;
  MinecraftBreakOverlayV147.prototype.ensure=function(){v147dBreakEnsureBase.call(this);for(const m of this.materials||[])m.opacity=STUDIO_V14_7D.crackOpacity;};
}

/* Alpha-repair celestial textures by removing dark pixels only when they are connected to the edge.
   This clears accidental black rectangles without hollowing out legitimate dark moon detail. */
v147CleanCelestialCanvas=function(source,frame=null){
  const sw=source.width||16,sh=source.height||16,fw=frame?Math.floor(sw/4):sw,fh=frame?Math.floor(sh/2):sh,sx=frame?(frame.col%4)*fw:0,sy=frame?Math.floor(frame.row%2)*fh:0;
  const cv=document.createElement('canvas');cv.width=fw;cv.height=fh;const x=cv.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.clearRect(0,0,fw,fh);x.drawImage(source,sx,sy,fw,fh,0,0,fw,fh);
  const img=x.getImageData(0,0,fw,fh),d=img.data,seen=new Uint8Array(fw*fh),q=new Uint32Array(fw*fh);let head=0,tail=0;
  const dark=i=>{const p=i*4,a=d[p+3],r=d[p],g=d[p+1],b=d[p+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);return a>0&&mx<68&&mx-mn<30;};
  const push=i=>{if(i<0||i>=fw*fh||seen[i]||!dark(i))return;seen[i]=1;q[tail++]=i;};
  for(let xx=0;xx<fw;xx++){push(xx);if(fh>1)push((fh-1)*fw+xx);}for(let yy=1;yy<fh-1;yy++){push(yy*fw);if(fw>1)push(yy*fw+fw-1);}
  while(head<tail){const i=q[head++],xx=i%fw,yy=Math.floor(i/fw),p=i*4;d[p+3]=0;if(xx>0)push(i-1);if(xx+1<fw)push(i+1);if(yy>0)push(i-fw);if(yy+1<fh)push(i+fw);}
  x.putImageData(img,0,0);return cv;
};

/* V14.7 uses local Java block sprites. Keep a remote Java fallback so a single missed generated asset
   never turns into Safari's blue question-mark icon. */
document.addEventListener('error',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement)||img.dataset.v147dFallback==='1')return;
  const src=img.getAttribute('src')||'';if(!src.includes('/assets/java/blocks/'))return;
  const leaf=src.split('/').pop();if(!leaf)return;img.dataset.v147dFallback='1';img.src=`${JAVA_ASSET_ROOT_V145}blocks/${leaf}`;
},true);

/* Keep music deliberately subtle on phones. Java's actual delay system is retained from V14.7B; this
   changes only the web default when the user has not chosen an explicit music volume. */
v147MusicVolume=function(){const stored=Number(localStorage.getItem('mcMusicVolumeV147'));if(Number.isFinite(stored)&&stored>=0)return clamp(stored,0,.4);return matchMedia('(pointer:coarse)').matches?STUDIO_V14_7D.mobileMusicVolume:STUDIO_V14_7D.desktopMusicVolume;};

const v147dBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){const r=await v147dBootBase.apply(this,args);window.__voxelDiag?.log?.(`V14.7D READY: mining hit/break audio hook, softer blended destroy stages, edge-only celestial alpha cleanup, Java block-icon fallback and ${Math.round(v147MusicVolume()*100)}% default music active.`,'ok');return r;};
try{runtimeCommands.register('hotfix147',()=>({version:STUDIO_V14_7D.version,musicVolume:v147MusicVolume(),crackOpacity:STUDIO_V14_7D.crackOpacity,hitMs:STUDIO_V14_7D.hitSoundIntervalMs}),'Inspect V14.7 fidelity hotfix.');}catch{}
