/* ===================== V14.7B: NATIVE 3D HELD TOOLS + JAVA AUDIO PACING ===================== */
const V147_TOOL_IDS=new Set([
  ITEM.WOOD_PICKAXE,ITEM.STONE_PICKAXE,ITEM.IRON_PICKAXE,ITEM.DIAMOND_PICKAXE,
  ITEM.WOOD_AXE,ITEM.STONE_AXE,ITEM.IRON_AXE,ITEM.DIAMOND_AXE,
  ITEM.WOOD_SWORD,ITEM.STONE_SWORD,ITEM.IRON_SWORD,ITEM.DIAMOND_SWORD,
  V7_ITEM.WOOD_SHOVEL,V7_ITEM.STONE_SHOVEL,V7_ITEM.IRON_SHOVEL,V7_ITEM.DIAMOND_SHOVEL,
  V7_ITEM.WOOD_HOE,V7_ITEM.STONE_HOE,V7_ITEM.IRON_HOE,V7_ITEM.DIAMOND_HOE,V7_ITEM.SHEARS
]);
function v147ToolTier(id){
  if([ITEM.DIAMOND_PICKAXE,ITEM.DIAMOND_AXE,ITEM.DIAMOND_SWORD,V7_ITEM.DIAMOND_SHOVEL,V7_ITEM.DIAMOND_HOE].includes(id))return'diamond';
  if([ITEM.IRON_PICKAXE,ITEM.IRON_AXE,ITEM.IRON_SWORD,V7_ITEM.IRON_SHOVEL,V7_ITEM.IRON_HOE,V7_ITEM.SHEARS].includes(id))return'iron';
  if([ITEM.STONE_PICKAXE,ITEM.STONE_AXE,ITEM.STONE_SWORD,V7_ITEM.STONE_SHOVEL,V7_ITEM.STONE_HOE].includes(id))return'stone';
  return'wood';
}
function v147ToolKind(id){
  if([ITEM.WOOD_PICKAXE,ITEM.STONE_PICKAXE,ITEM.IRON_PICKAXE,ITEM.DIAMOND_PICKAXE].includes(id))return'pickaxe';
  if([ITEM.WOOD_AXE,ITEM.STONE_AXE,ITEM.IRON_AXE,ITEM.DIAMOND_AXE].includes(id))return'axe';
  if([ITEM.WOOD_SWORD,ITEM.STONE_SWORD,ITEM.IRON_SWORD,ITEM.DIAMOND_SWORD].includes(id))return'sword';
  if([V7_ITEM.WOOD_SHOVEL,V7_ITEM.STONE_SHOVEL,V7_ITEM.IRON_SHOVEL,V7_ITEM.DIAMOND_SHOVEL].includes(id))return'shovel';
  if([V7_ITEM.WOOD_HOE,V7_ITEM.STONE_HOE,V7_ITEM.IRON_HOE,V7_ITEM.DIAMOND_HOE].includes(id))return'hoe';
  if(id===V7_ITEM.SHEARS)return'shears';return null;
}
const V147_TOOL_COLOR={wood:0x9a672f,stone:0x777777,iron:0xd8d8d8,diamond:0x42d9d5};
function v147ToolMaterial(color){return new THREE.MeshLambertMaterial({color,flatShading:true});}
function v147Box(group,size,pos,mat,rot=null){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);if(rot)m.rotation.set(...rot);group.add(m);return m;}
class JavaToolModelFactoryV147{
  create(id){
    const kind=v147ToolKind(id);if(!kind)return null;const tier=v147ToolTier(id),root=new THREE.Group(),handle=v147ToolMaterial(0x79502a),head=v147ToolMaterial(V147_TOOL_COLOR[tier]);root.userData.v147HeldTool=true;root.userData.itemId=id;root.userData.kind=kind;
    if(kind==='sword'){
      v147Box(root,[.085,.43,.06],[0,.13,0],handle);v147Box(root,[.30,.055,.075],[0,.34,0],handle);v147Box(root,[.12,.62,.06],[0,.66,0],head);v147Box(root,[.07,.11,.065],[0,1.02,0],head, [0,0,Math.PI/4]);
    }else if(kind==='pickaxe'){
      v147Box(root,[.075,.72,.075],[0,.28,0],handle,null);v147Box(root,[.54,.09,.095],[0,.66,0],head,null);v147Box(root,[.12,.12,.095],[-.27,.60,0],head,[0,0,-.42]);v147Box(root,[.12,.12,.095],[.27,.60,0],head,[0,0,.42]);
    }else if(kind==='axe'){
      v147Box(root,[.075,.74,.075],[0,.28,0],handle);v147Box(root,[.28,.30,.09],[.12,.62,0],head);v147Box(root,[.09,.18,.095],[-.065,.58,0],head);
    }else if(kind==='shovel'){
      v147Box(root,[.075,.72,.075],[0,.27,0],handle);v147Box(root,[.24,.27,.085],[0,.68,0],head);v147Box(root,[.19,.09,.085],[0,.84,0],head);
    }else if(kind==='hoe'){
      v147Box(root,[.075,.74,.075],[0,.28,0],handle);v147Box(root,[.34,.085,.09],[.11,.66,0],head);v147Box(root,[.09,.18,.09],[.25,.58,0],head);
    }else if(kind==='shears'){
      v147Box(root,[.055,.48,.055],[-.075,.38,0],head,[0,0,-.17]);v147Box(root,[.055,.48,.055],[.075,.38,0],head,[0,0,.17]);const ring=new THREE.TorusGeometry(.095,.025,4,8);for(const x of [-.09,.09]){const m=new THREE.Mesh(ring,head);m.position.set(x,.10,0);root.add(m);}
    }
    return root;
  }
}
const javaToolFactoryV147=new JavaToolModelFactoryV147();

function v147TorchGeometry(){
  const p=[],n=[],uv=[],idx=[],x0=-1/16,x1=1/16,y0=0,y1=10/16,z0=-1/16,z1=1/16;
  const face=(verts,no,r)=>{const base=p.length/3;for(const q of verts)p.push(...q);for(let i=0;i<4;i++)n.push(...no);const [px0,py0,px1,py1]=r,qs=[[px0/16,1-py1/16],[px1/16,1-py1/16],[px1/16,1-py0/16],[px0/16,1-py0/16]];for(const q of qs)uv.push(...q);idx.push(base,base+1,base+2,base,base+2,base+3);};
  face([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[0,0,-1],[7,6,9,16]);face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1],[7,6,9,16]);face([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[-1,0,0],[7,6,9,16]);face([[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[1,0,0],[7,6,9,16]);face([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[0,1,0],[7,6,9,8]);face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0],[7,13,9,15]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
let V147_TORCH_GEO=null;
function javaTorchHeldV147(){
  const root=new THREE.Group(),mesh=new THREE.Mesh(V147_TORCH_GEO??=v147TorchGeometry(),new THREE.MeshBasicMaterial({color:0xc78332,transparent:true,alphaTest:.04,side:THREE.DoubleSide,depthTest:false,depthWrite:false,toneMapped:false}));mesh.position.y=-.22;root.add(mesh);root.rotation.set(-.18,.05,-.48);root.scale.setScalar(1.12);
  (async()=>{let last=null;for(const url of [`./assets/java/blocks/torch.png`,`${JAVA_ASSET_ROOT_V145}blocks/torch.png`]){try{const {texture}=await javaItemTextureV145(url);const current=mesh.material;current.map=texture;current.color.set(0xffffff);current.needsUpdate=true;mesh.userData.v147TorchTexture=url;return;}catch(e){last=e;}}window.__voxelDiag?.log?.(`V14.7 TORCH texture failed: ${last?.message||'unknown'}`,'err');})();return root;
}

function v147TexturedHeldCube(rel,fallback=0xdddddd){
  const root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(.48,.48,.48),new THREE.MeshBasicMaterial({color:fallback,depthTest:false,depthWrite:false,toneMapped:false}));root.add(mesh);
  (async()=>{let last=null;for(const url of [`./assets/java/${rel}`,`${JAVA_ASSET_ROOT_V145}${rel}`]){try{const {texture}=await javaItemTextureV145(url);mesh.material.map=texture;mesh.material.color.set(0xffffff);mesh.material.needsUpdate=true;return;}catch(e){last=e;}}window.__voxelDiag?.log?.(`V14.7 held cube ${rel} unavailable: ${last?.message||'unknown'}`,'warn');})();return root;
}

const v147HeldCreateBase=HeldItemFactoryV8.prototype.create;
HeldItemFactoryV8.prototype.create=function(id){
  if(id===ITEM.TORCH)return this.prepare(javaTorchHeldV147());
  if(typeof V8_ITEM!=='undefined'&&id===V8_ITEM.WHITE_WOOL)return this.prepare(v147TexturedHeldCube('blocks/white_wool.png',0xe8e8e8));
  if(V147_TOOL_IDS.has(id)){const inner=javaToolFactoryV147.create(id);if(inner){inner.scale.setScalar(.48);inner.rotation.set(-.12,0,-.72);const outer=new THREE.Group();outer.add(inner);return this.prepare(outer);}}
  return v147HeldCreateBase.call(this,id);
};

/* ------------------------- Java sound fidelity / guaranteed material fallbacks ------------------------- */
function v147MusicVolume(){const stored=Number(localStorage.getItem('mcMusicVolumeV147'));if(Number.isFinite(stored)&&stored>=0)return clamp(stored,0,.4);return matchMedia('(pointer:coarse)').matches?.10:.12;}
function v147GameMusicDelay(){return 600+Math.random()*600;}
function v147MenuMusicDelay(){return 1+Math.random()*29;}
const V147_SOUND_FALLBACK=Object.freeze({
  'wood.break':['dig/wood1','dig/wood2','dig/wood3','dig/wood4'],'wood.hit':['step/wood1','step/wood2','step/wood3','step/wood4','step/wood5','step/wood6'],'wood.step':['step/wood1','step/wood2','step/wood3','step/wood4','step/wood5','step/wood6'],
  'grass.break':['dig/grass1','dig/grass2','dig/grass3','dig/grass4'],'grass.hit':['step/grass1','step/grass2','step/grass3','step/grass4','step/grass5','step/grass6'],'grass.step':['step/grass1','step/grass2','step/grass3','step/grass4','step/grass5','step/grass6'],
  'stone.break':['dig/stone1','dig/stone2','dig/stone3','dig/stone4'],'stone.hit':['step/stone1','step/stone2','step/stone3','step/stone4','step/stone5','step/stone6'],'stone.step':['step/stone1','step/stone2','step/stone3','step/stone4','step/stone5','step/stone6']
});
const V147_BLOCK_ACTION=Object.freeze({break:{volume:.88,pitch:.80},hit:{volume:.72,pitch:.82},step:{volume:.78,pitch:1.0},place:{volume:.82,pitch:.80},fall:{volume:.75,pitch:.80}});
JavaAudioEngineV145.prototype.playSampleV147=async function(names,opts={}){try{const list=Array.isArray(names)?names:[names],name=list[Math.floor(Math.random()*list.length)],buf=await this.fetchBuffer(name);if(!buf)return false;const ctx=await this.unlock(),src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buf;src.playbackRate.value=clamp(opts.pitch??1,.25,4);gain.gain.value=clamp(opts.volume??1,0,2);src.connect(gain);this.route(gain,opts);src.start();return true;}catch{return false;}};
JavaAudioEngineV145.prototype.playBlock=async function(id,action,opts={}){
  const group=this.blockGroup(id),spec=V147_BLOCK_ACTION[action]||{volume:1,pitch:1},adjusted={...opts,volume:clamp((opts.volume??1)*spec.volume,0,1.5),pitch:clamp((opts.pitch??1)*spec.pitch,.25,4),maxDistance:opts.maxDistance??16};
  const event=`block.${group}.${action}`;if(await this.playEvent(event,adjusted))return true;const fallback=V147_SOUND_FALLBACK[`${group}.${action}`];return fallback?this.playSampleV147(fallback,adjusted):false;
};
if(typeof BedrockAudioEngineV14!=='undefined')BedrockAudioEngineV14.prototype.playBlock=function(id,action,opts={}){return this.game.javaAudioV144?.playBlock(id,action,opts)??Promise.resolve(false);};

/* Menu music is streamed, quieter, and uses Minecraft-like randomized silence instead of restarting rapidly. */
if(typeof JavaMenuMusicV145!=='undefined')JavaMenuMusicV145.prototype.start=async function(){
  if(this.started||localStorage.getItem('mcMusicV143')==='off'||titleScreen.style.display==='none')return;this.started=true;
  const again=()=>{this.started=false;if(titleScreen.style.display!=='none'){clearTimeout(this.retryTimer);this.retryTimer=setTimeout(()=>this.start(),v147MenuMusicDelay()*1000);}};
  const ok=await this.game.javaAudioV144.playMusicV145('music.menu',v147MusicVolume(),again);if(!ok)again();
};

/* Generic Java game music uses long randomized silence. First world track gets a short startup window so
   mobile users can verify audio; subsequent tracks wait 10–20 minutes, matching Java's GAME delay constants. */
if(typeof MinecraftMusicSchedulerV143!=='undefined')MinecraftMusicSchedulerV143.prototype.update=function(dt){
  if(!this.enabled||!this.game.running||localStorage.getItem('mcMusicV143')==='off')return;const audio=this.game.javaAudioV144;if(!audio)return;if(audio.musicV145)return;
  if(!this._v147Started){this._v147Started=true;this.next=25+Math.random()*55;}
  this.next=(Number.isFinite(this.next)?this.next:0)-dt;if(this.next>0)return;this.next=Infinity;
  const event=this.game.mode==='creative'?'music.game.creative':'music.game';audio.playMusicV145(event,v147MusicVolume(),()=>{this.next=v147GameMusicDelay();}).then(ok=>{if(!ok)this.next=35+Math.random()*55;});
};

const v147ItemsBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){const r=await v147ItemsBootBase.apply(this,args);this.javaAudioV144??=game.javaAudioV144;window.__voxelDiag?.log?.(`V14.7B READY: native 3D tools, fixed UV-textured torch, randomized Java music pacing and Java material sound fallback active. Music default ${(v147MusicVolume()*100).toFixed(0)}%.`,'ok');return r;};
try{runtimeCommands.register('audio147',(volume)=>{if(volume!==undefined&&Number.isFinite(Number(volume)))localStorage.setItem('mcMusicVolumeV147',String(clamp(Number(volume),0,.4)));return{musicVolume:v147MusicVolume(),nextGameMusic:game.musicV143?.next??null,javaBuffers:game.javaAudioV144?.buffers?.size||0,gameGapSeconds:[600,1200],menuGapSeconds:[1,30]};},'Inspect/set V14.7 music volume: audio147 [0..0.4].');}catch{}
