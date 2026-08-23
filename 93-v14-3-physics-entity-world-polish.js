/* ===================== V14.3: PHYSICS / ENTITY / WORLD POLISH ===================== */
const STUDIO_V14_3=Object.freeze({version:'0.14.3-physics-entity-world',fallGravity:24,fallTerminal:28,fallBudget:24,cloudSpeed:.0040,celestialDistance:245,celestialSize:66});
window.STUDIO_PATCH_VERSION=STUDIO_V14_3.version;
window.MINECRAFT_WEB_VERSION='0.14.3';

/* Fix the DOM-id collision that made `toast(...)` resolve to the #toast DIV. */
function toast(message,duration=1500){
  if(!toastEl)return;
  toastEl.textContent=String(message??'');
  toastEl.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>toastEl.classList.remove('show'),Math.max(450,Number(duration)||1500));
}

/* ---- Older Bedrock geometry inheritance + quadruped bind-pose repair ---- */
function v143Clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
function v143MergeGeometry(parent,child){
  const out={...v143Clone(parent||{}),...v143Clone(child||{})},bones=new Map();
  for(const b of parent?.bones||[])bones.set(b.name,v143Clone(b));
  for(const b of child?.bones||[])bones.set(b.name,{...(bones.get(b.name)||{}),...v143Clone(b)});
  out.bones=[...bones.values()];return out;
}
const v143GeometryDefinitionsBase=BedrockEntityLoaderV2.prototype.geometryDefinitions;
BedrockEntityLoaderV2.prototype.geometryDefinitions=function(json){
  const defs=v143GeometryDefinitionsBase.call(this,json),byName=new Map(defs.map(d=>[d.name,d]));
  if(!Array.isArray(json?.['minecraft:geometry']))for(const [rawName,data] of Object.entries(json||{})){
    if(!rawName.startsWith('geometry.')||!rawName.includes(':'))continue;
    const split=rawName.indexOf(':'),name=rawName.slice(0,split),parentName=rawName.slice(split+1),parent=byName.get(parentName)?.data||json[parentName];
    const merged={name,data:v143MergeGeometry(parent,data)};const i=defs.findIndex(d=>d.name===rawName);if(i>=0)defs[i]=merged;else defs.push(merged);byName.set(name,merged);
  }
  return defs;
};
const v143ChooseGeometryBase=BedrockEntityLoaderV2.prototype.chooseGeometry;
BedrockEntityLoaderV2.prototype.chooseGeometry=function(entityJSON,geometryJSON){
  const preferred=entityJSON?.['minecraft:client_entity']?.description?.geometry?.default;
  if(preferred){const exact=this.geometryDefinitions(geometryJSON).find(d=>d.name===preferred);if(exact)return exact;}
  return v143ChooseGeometryBase.call(this,entityJSON,geometryJSON);
};
const v143SpecBase=BedrockEntityLoaderV2.prototype.spec;
BedrockEntityLoaderV2.prototype.spec=function(type){
  const t=String(type).replace(/^minecraft:/,''),base=v143SpecBase.call(this,t)||{},uniq=a=>[...new Set((a||[]).filter(Boolean))];
  return {entity:uniq([...(base.entity||[]),t]),geometry:uniq([...(base.geometry||[]),`${t}_v1.0`,t]),animations:uniq([...(base.animations||[]),t,'quadruped','humanoid'])};
};
function v143NormalizeQuadruped(root,type){
  if(!root||!['cow','pig','sheep'].includes(type))return root;
  const body=root.userData?.bones?.get?.('body');if(!body)return root;
  let visual=body.children.find(c=>c.name==='_v143_body_visual');
  if(!visual){visual=new THREE.Group();visual.name='_v143_body_visual';const visuals=body.children.filter(c=>c!==visual&&!c.userData?.bedrockBoneName);body.add(visual);for(const child of visuals)visual.add(child);}
  body.rotation.x=0;body.rotation.z=0;visual.rotation.set(-Math.PI/2,0,0);root.userData.quadrupedPoseV143=true;return root;
}
const v143EntityBuildBase=BedrockEntityLoaderV2.prototype.build;
BedrockEntityLoaderV2.prototype.build=function(definition,texture,type){return v143NormalizeQuadruped(v143EntityBuildBase.call(this,definition,texture,type),type);};
const v143AnimUpdateBase=BedrockAnimationControllerV2.prototype.update;
BedrockAnimationControllerV2.prototype.update=function(state,time,mob){
  v143AnimUpdateBase.call(this,state,time,mob);
  if(['cow','pig','sheep'].includes(this.type)){const body=this.bones.get('body'),visual=body?.children?.find?.(c=>c.name==='_v143_body_visual');if(body){body.rotation.x=0;body.rotation.z=0;}if(visual)visual.rotation.set(-Math.PI/2,0,0);}
};

/* ---- Mob collision recovery: search sideways as well as upward; never spin a stuck mob. ---- */
function v143MobLoadedAt(mob,world){const p=world.worldToChunk(Math.floor(mob.position.x),Math.floor(mob.position.z));return !!world.getChunk(p.cx,p.cz);}
mobDepenetrateV6=function(mob,world){
  if(!v143MobLoadedAt(mob,world))return false;if(!mobCollidesAtV6(mob,mob.position,world))return true;
  const base=mob.position.clone(),tries=[];
  for(const r of [.12,.24,.38,.55,.78,1.05,1.35])for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])tries.push([dx,0,dz]);
  for(const y of [.08,.16,.28,.42,.62,.85,1.1,1.4])tries.push([0,y,0]);
  for(const [dx,dy,dz] of tries){const p=base.clone().add(new THREE.Vector3(dx,dy,dz));if(!mobCollidesAtV6(mob,p,world)){mob.position.copy(p);mob.verticalVelocity=Math.min(0,mob.verticalVelocity||0);if(mob.navV14)mob.navV14.stuck=0;return true;}}
  const x=Math.floor(base.x),z=Math.floor(base.z),floor=world.highestSolidY(x,z)+1,snap=new THREE.Vector3(x+.5,floor,z+.5);
  if(Math.abs(floor-base.y)<=4&&!mobCollidesAtV6(mob,snap,world)){mob.position.copy(snap);mob.verticalVelocity=0;if(mob.navV14)mob.navV14.stuck=0;return true;}return false;
};
const v143NavigatorPhysicsBase=MobNavigatorV14.prototype.physics;
MobNavigatorV14.prototype.physics=function(mob,dt){mobDepenetrateV6(mob,this.world);v143NavigatorPhysicsBase.call(this,mob,dt);mobDepenetrateV6(mob,this.world);if(mob.model){mob.model.rotation.x=0;mob.model.rotation.z=0;}};

/* ---- Real falling blocks for sand / gravel ---- */
class FallingBlockSystemV143{
  constructor(gameRef){this.game=gameRef;this.world=gameRef.world;this.queue=[];this.queued=new Set();this.active=[];this.factory=new StudioDropVisualFactoryV6(gameRef);this.suppress=false;this.scanClock=0;}
  key(x,y,z){return `${x}|${y}|${z}`;} canFall(id){return id===BLOCK.SAND||id===BLOCK.GRAVEL;} replaceable(id){return id===BLOCK.AIR||id===BLOCK.WATER||id===BLOCK.TALL_GRASS||id===BLOCK.FLOWER;}
  enqueue(x,y,z){if(y<=0||y>=ENGINE.WORLD_HEIGHT)return;const k=this.key(x,y,z);if(this.queued.has(k))return;this.queued.add(k);this.queue.push([x,y,z]);}
  set(x,y,z,id){this.suppress=true;try{return this.world.set(x,y,z,id);}finally{this.suppress=false;}}
  start(x,y,z){const id=this.world.getLoaded(x,y,z),below=this.world.getLoadedState(x,y-1,z);if(!this.canFall(id)||!below.loaded||!this.replaceable(below.id))return false;this.set(x,y,z,BLOCK.AIR);const mesh=this.factory.createBlock(id,id);mesh.scale.setScalar(1);mesh.position.set(x+.5,y+.5,z+.5);mesh.castShadow=this.game.graphicsV7?.profile!=='fast';mesh.receiveShadow=false;this.game.renderer.scene.add(mesh);this.active.push({id,x,z,y:Number(y),vy:0,mesh});return true;}
  settle(f,y){const at=this.world.getLoaded(f.x,y,f.z);if(this.replaceable(at)){if(at!==BLOCK.AIR)this.set(f.x,y,f.z,BLOCK.AIR);this.set(f.x,y,f.z,f.id);this.enqueue(f.x,y+1,f.z);}else this.game.drops?.spawn?.(f.id,1,new THREE.Vector3(f.x+.5,y+1.1,f.z+.5));f.mesh?.parent?.remove(f.mesh);}
  scan(){const p=this.game.player;if(!p)return;const cx=Math.floor(p.position.x),cz=Math.floor(p.position.z);for(let i=0;i<10;i++){const x=cx-7+Math.floor(Math.random()*15),z=cz-7+Math.floor(Math.random()*15),top=this.world.highestSolidY(x,z);for(let y=Math.max(1,top-5);y<=Math.min(ENGINE.WORLD_HEIGHT-1,top+2);y++)if(this.canFall(this.world.getLoaded(x,y,z))&&this.replaceable(this.world.getLoaded(x,y-1,z)))this.enqueue(x,y,z);}}
  update(dt){let budget=STUDIO_V14_3.fallBudget;while(budget--&&this.queue.length){const q=this.queue.shift();this.queued.delete(this.key(...q));this.start(...q);}for(let i=this.active.length-1;i>=0;i--){const f=this.active[i];f.vy=Math.max(-STUDIO_V14_3.fallTerminal,f.vy-STUDIO_V14_3.fallGravity*dt);const next=f.y+f.vy*dt,checkY=Math.floor(next-.001),st=this.world.getLoadedState(f.x,checkY,f.z);if(!st.loaded){f.vy=0;continue;}if(f.vy<=0&&!this.replaceable(st.id)){this.settle(f,checkY+1);this.active.splice(i,1);continue;}f.y=next;f.mesh.position.y=f.y+.5;f.mesh.rotation.y+=dt*.4;}this.scanClock-=dt;if(this.scanClock<=0){this.scanClock=.5;this.scan();}}
}
const v143WorldSetBase=World.prototype.set;
World.prototype.set=function(x,y,z,id){const changed=v143WorldSetBase.call(this,x,y,z,id),sys=this.fallingBlocksV143||game?.fallingBlocksV143;if(changed&&sys&&!sys.suppress){sys.enqueue(x,y,z);sys.enqueue(x,y+1,z);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])sys.enqueue(x+dx,y+1,z+dz);}return changed;};

/* ---- Village placement rules + richer village template fallback ---- */
function v143VillageSite(gen,chunk){
  const spacing=9,gx=floorDiv(chunk.cx,spacing),gz=floorDiv(chunk.cz,spacing),pickX=gx*spacing+Math.floor(hash2(gx,gz,gen.seed+22131)*spacing),pickZ=gz*spacing+Math.floor(hash2(gz,gx,gen.seed+55109)*spacing);if(chunk.cx!==pickX||chunk.cz!==pickZ)return null;
  const wx=chunk.cx*chunk.size+8,wz=chunk.cz*chunk.size+8,y=gen.surfaceY(wx,wz),biome=gen.biome(wx,wz);if(biome!=='plains'||y<=ENGINE.SEA_LEVEL+2)return null;let min=999,max=-999,water=false;
  for(let dz=-6;dz<=6;dz+=2)for(let dx=-6;dx<=6;dx+=2){const sy=gen.surfaceY(wx+dx,wz+dz);min=Math.min(min,sy);max=Math.max(max,sy);if(sy<=ENGINE.SEA_LEVEL)water=true;}if(water||max-min>2)return null;return {wx,wz,y:Math.round((min+max)*.5),cx:8,cz:8};
}
function v143PlaceHouse(chunk,cx,cz,y,w=5,d=5){const hx=Math.floor(w/2),hz=Math.floor(d/2);for(let z=-hz;z<=hz;z++)for(let x=-hx;x<=hx;x++){const lx=cx+x,lz=cz+z;if(lx<1||lx>=chunk.size-1||lz<1||lz>=chunk.size-1)continue;chunk.set(lx,y,lz,BLOCK.COBBLESTONE);for(let yy=1;yy<=3;yy++){const edge=Math.abs(x)===hx||Math.abs(z)===hz,door=z===hz&&x===0&&yy<=2;chunk.set(lx,y+yy,lz,edge&&!door?BLOCK.OAK_PLANKS:BLOCK.AIR);}chunk.set(lx,y+4,lz,BLOCK.OAK_PLANKS);}chunk.set(cx,y+2,cz+hz-1,BLOCK.TORCH);}
v8StampVillage=function(gen,chunk){const site=v143VillageSite(gen,chunk);if(!site)return;const {wx,wz,y,cx,cz}=site;for(let z=1;z<chunk.size-1;z++)for(let x=1;x<chunk.size-1;x++){const gx=chunk.cx*chunk.size+x,gz=chunk.cz*chunk.size+z,sy=gen.surfaceY(gx,gz);if(Math.abs(x-cx)<=1||Math.abs(z-cz)<=1)chunk.set(x,sy,z,BLOCK.GRAVEL);for(let yy=sy+1;yy<=Math.min(ENGINE.WORLD_HEIGHT-2,y+5);yy++)chunk.set(x,yy,z,BLOCK.AIR);}v143PlaceHouse(chunk,4,4,y);v143PlaceHouse(chunk,11,10,y);for(let z=6;z<=9;z++)for(let x=6;x<=9;x++)chunk.set(x,y,z,BLOCK.COBBLESTONE);for(let yy=1;yy<=2;yy++)for(const [x,z] of [[6,6],[9,6],[6,9],[9,9]])chunk.set(x,y+yy,z,BLOCK.OAK_LOG);chunk.set(7,y+1,7,BLOCK.TORCH);chunk.villageV8=true;chunk.villageSiteV143=site;gen.villageSpawnsV8??=[];gen.villageSpawnsV8.push(new THREE.Vector3(wx+.5,y+1,wz+.5));};
v11VillageExtras=function(gen,chunk){if(!chunk.villageV8||!chunk.villageSiteV143)return;const s=chunk.villageSiteV143;gen.villageEntitiesV11??=[];for(const [dx,dz] of [[-2,1],[2,1],[-1,-2],[1,-2]])gen.villageEntitiesV11.push({type:'villager',position:new THREE.Vector3(s.wx+dx+.5,s.y+1,s.wz+dz+.5),villageV143:true});gen.villageEntitiesV11.push({type:'iron_golem',position:new THREE.Vector3(s.wx+.5,s.y+1,s.wz+3.5),villageV143:true});chunk.villageV11=true;};

/* Stronghold structure marker/fallback. Full End portal/dimension remains a later system. */
function v143Stronghold(gen,chunk){const d=Math.hypot(chunk.cx,chunk.cz);if(d<18||d>34||hash2(chunk.cx,chunk.cz,gen.seed+993821)>.012)return;const y=12+Math.floor(hash2(chunk.cz,chunk.cx,gen.seed+81)*10),s=chunk.size;for(let z=2;z<s-2;z++)for(let x=2;x<s-2;x++)for(let yy=y;yy<=y+4;yy++){const edge=x===2||z===2||x===s-3||z===s-3||yy===y||yy===y+4;chunk.set(x,yy,z,edge?BLOCK.COBBLESTONE:BLOCK.AIR);}for(let x=0;x<s;x++)for(let yy=y+1;yy<=y+2;yy++)chunk.set(x,yy,Math.floor(s/2),BLOCK.AIR);chunk.strongholdV143=true;}
const v143GeneratorBase=WorldGenerator.prototype.generate;WorldGenerator.prototype.generate=function(chunk){v143GeneratorBase.call(this,chunk);v143Stronghold(this,chunk);};

/* ---- Extend behavior targeting from "player only" to real entities. ---- */
function v143Candidates(controller){return [controller.game.player,...(controller.game.mobs?.mobs||[]).filter(m=>m!==controller.mob&&m.health>0)];}
function v143EntityTypes(cfg){return Array.isArray(cfg?.entity_types)?cfg.entity_types:cfg?.entity_types?[cfg.entity_types]:[];}
V14_TARGET_GOALS.add('minecraft:behavior.defend_village_target');V14_TARGET_GOALS.add('minecraft:behavior.nearest_prioritized_attackable_target');
BedrockBehaviorControllerV14.prototype.selectTargets=function(){
  const old=this.target;let chosen=null,best=Infinity;if(this.target&&((this.target.health??1)<=0||!this.target.position))this.target=null;
  for(const goal of this.targetGoals){const cfg=goal.config||{};
    if(goal.key==='minecraft:behavior.hurt_by_target'&&this.mob.lastHurtByV14&&performance.now()-(this.mob.lastHurtAtV14||0)<10000){chosen=this.mob.lastHurtByV14;break;}
    if(goal.key==='minecraft:behavior.defend_village_target'){for(const candidate of this.game.mobs?.mobs||[]){if(candidate===this.mob||!candidate.position)continue;const fam=this.filter.families(candidate,{player:this.game.player}),hostile=['monster','zombie','skeleton','spider','enderman','illager'].some(f=>fam.has(f));if(!hostile||fam.has('creeper'))continue;const d=this.mob.position.distanceTo(candidate.position);if(d<best&&d<24){best=d;chosen=candidate;}}if(chosen)break;continue;}
    if(goal.key==='minecraft:behavior.nearest_attackable_target'||goal.key==='minecraft:behavior.nearest_prioritized_attackable_target'){const types=v143EntityTypes(cfg),radius=v14Number(cfg.within_radius??cfg.max_dist,this.meta.followRange||25);for(const candidate of v143Candidates(this)){if(candidate===this.mob||!candidate?.position)continue;const d=this.mob.position.distanceTo(candidate.position);if(d>radius||d>=best)continue;let pass=!types.length;for(const t of types){if(d>v14Number(t?.max_dist,radius))continue;const ctx={game:this.game,self:this.mob,other:candidate,target:candidate,player:this.game.player,runtime:this};if(this.filter.evaluate(t?.filters||t,ctx)){pass=true;break;}}if(pass){best=d;chosen=candidate;}}if(chosen)break;}
  }
  this.target=chosen||((this.target?.position&&this.mob.position.distanceTo(this.target.position)<(this.meta.followRange||32)*1.25)?this.target:null);if(old!==this.target&&this.target)this.applyTrigger(this.components['minecraft:on_target_acquired'],this.target);this.previousTarget=old;
};

/* Villager profession state: data-driven group where available, deterministic job fallback otherwise. */
const v143AttachBase=BedrockBehaviorSystemV14.prototype.attach;
BedrockBehaviorSystemV14.prototype.attach=async function(mob){const c=await v143AttachBase.call(this,mob);if(!c)return c;if(mob.type==='villager'){const jobs=[{id:BLOCK.FURNACE,name:'armorer'},{id:BLOCK.CRAFTING_TABLE,name:'toolsmith'},{id:BLOCK.CHEST,name:'farmer'}];let best={d:Infinity,name:'farmer'};for(let y=Math.floor(mob.position.y)-2;y<=Math.floor(mob.position.y)+2;y++)for(let z=Math.floor(mob.position.z)-10;z<=Math.floor(mob.position.z)+10;z++)for(let x=Math.floor(mob.position.x)-10;x<=Math.floor(mob.position.x)+10;x++){const w=jobs.find(q=>q.id===this.game.world.getLoaded(x,y,z));if(!w)continue;const d=(x-mob.position.x)**2+(z-mob.position.z)**2;if(d<best.d)best={d,name:w.name};}mob.professionV143=best.name;const match=Object.keys(c.plan.componentGroups||{}).find(k=>k.toLowerCase()===best.name||k.toLowerCase().includes(best.name));if(match)c.activeGroups.add(match);c.rebuild();if(mob.model)mob.model.userData.professionV143=best.name;}return c;};

/* ---- Mojang spawn-rule cache + strict day/night split. ---- */
class BedrockSpawnRuleRepositoryV143{
  constructor(gameRef){this.game=gameRef;this.cache=new Map();this.pending=new Map();}
  async rule(type){type=String(type).replace(/^minecraft:/,'');if(this.cache.has(type))return this.cache.get(type);if(this.pending.has(type))return this.pending.get(type);const p=(async()=>{try{const json=JSON.parse(await this.game.assets.text(`${BEDROCK_RAW}behavior_pack/spawn_rules/${type}.json`)),r=json?.['minecraft:spawn_rules']||null;this.cache.set(type,r);return r;}catch{this.cache.set(type,null);return null;}})().finally(()=>this.pending.delete(type));this.pending.set(type,p);return p;}
  allowed(rule,light){if(!rule)return true;for(const c of rule.conditions||[]){const b=c['minecraft:brightness_filter'];if(!b)return true;if(light>=v14Number(b.min,0)&&light<=v14Number(b.max,15))return true;}return false;}
}
MobSystem.prototype.spawnAround=async function(player){if(this._spawnPendingV143||this.mobs.length>=ENGINE.MAX_MOBS)return;this._spawnPendingV143=true;try{const a=Math.random()*Math.PI*2,r=18+Math.random()*20,x=Math.floor(player.position.x+Math.cos(a)*r),z=Math.floor(player.position.z+Math.sin(a)*r),y=this.world.highestSolidY(x,z)+1;if(y<=1||y>=ENGINE.WORLD_HEIGHT-2||this.world.getLoaded(x,y,z)!==BLOCK.AIR||!SOLID_BLOCKS.has(this.world.getLoaded(x,y-1,z)))return;const daylight=this.game.renderer?.dayStateV6?.daylight??1,sky=this.game.lightV8?.skyVisible?.(x,y,z)??true,light=this.game.lightV8?.level?.(x,y,z)??Math.round(daylight*15),night=daylight<.22,passive=['cow','pig','chicken','sheep'],hostile=['zombie','skeleton','creeper','spider','enderman'],pool=night||(!sky&&light<8)?hostile:passive,type=pool[Math.floor(Math.random()*pool.length)],rule=await this.game.spawnRulesV143?.rule(type);if(hostile.includes(type)&&light>=8)return;if(passive.includes(type)&&night)return;if(!this.game.spawnRulesV143?.allowed(rule,light))return;await this.spawnEntity(type,new THREE.Vector3(x+.5,y,z+.5));}finally{this._spawnPendingV143=false;}};

/* ---- Minecraft-like calmer movement bob + third-person player animation ---- */
const v143PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){const ox=this.position.x,oz=this.position.z,r=v143PlayerUpdateBase.call(this,dt,controls),dist=Math.hypot(this.position.x-ox,this.position.z-oz);this._walkDistanceV143=(this._walkDistanceV143||0)+(this.onGround?dist:0);return r;};
PlayerCameraV12.prototype.apply=function(player,camera){v13CameraApplyBase.call(this,player,camera);const target=this.mode===0&&player.sprinting?STUDIO_V13.sprintFov:STUDIO_V13.baseFov;camera.fov=lerp(camera.fov||STUDIO_V13.baseFov,target,.12);camera.updateProjectionMatrix();if(this.mode!==0||player.flying)return;const speed=player._speedV13||0,move=clamp(speed/5.6,0,1);if(!player.onGround||move<.035)return;const wave=(player._walkDistanceV143||0)*Math.PI,amp=move*(player.sprinting?1.15:1),right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));camera.position.addScaledVector(right,Math.sin(wave)*.015*amp);camera.position.y-=Math.abs(Math.cos(wave))*.010*amp;camera.rotation.z+=Math.sin(wave)*.003*amp;};
PlayerEntityRendererV12.prototype.updateOne=function(avatar,state,dt){if(!avatar?.root)return;const p=state.player||this.game.player;avatar.age+=dt;const moved=Math.hypot(p.position.x-avatar.lastPos.x,p.position.z-avatar.lastPos.z);avatar.distance+=moved;avatar.lastPos.copy(p.position);avatar.root.position.copy(p.position);avatar.root.rotation.set(0,p.yaw||0,0);avatar.root.scale.setScalar(.9375);const c=avatar.controller;if(!c)return;const speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),swim=!!p.inWaterV8,mode=speed>.08?'walk':'idle',attackAge=performance.now()-(this.game.combat?.lastAttackTime||0),mining=!!this.game.breaking,attack=attackAge<360?clamp(1-attackAge/360,0,1):(mining?(.5+.5*Math.sin(avatar.age*12)):0);c.update(mode,avatar.age,{age:avatar.age,distanceWalked:avatar.distance,velocity:p.velocity,attackProgress:attack});const ctx=this.ctx(avatar,state);ctx.query.attack_time=attack;ctx.variable.attack_time=attack;ctx.variable.swim_amount=swim?1:0;if(swim)for(const n of ['animation.player.swim','animation.player.swim.legs']){const clip=c.animations?.[n];if(clip)c.applyClip(clip,avatar.age,ctx);}if(p.crouchingV12){const clip=c.animations?.['animation.player.sneaking'];if(clip)c.applyClip(clip,avatar.age,ctx);}if(attack>0)for(const n of ['animation.player.attack.positions','animation.player.attack.rotations']){const clip=c.animations?.[n];if(clip)c.applyClip(clip,avatar.age,ctx);}const head=c.bones.get('head');if(head&&!swim){const bind=c.bind.get('head');if(bind)head.rotation.x=bind.rotation.x+clamp(p.pitch||0,-1.25,1.25)*.72;}};

/* Real Mojang step events only, at a less dizzy/annoying cadence. */
if(typeof FootstepAudioV13!=='undefined')FootstepAudioV13.prototype.update=function(dt){const p=this.game.player;if(!p||!this.game.running)return;if(!this.ready){this.last.copy(p.position);this.grounded=p.onGround;this.ready=true;}const dx=p.position.x-this.last.x,dz=p.position.z-this.last.z,dist=Math.hypot(dx,dz);this.last.copy(p.position);if(p.onGround&&!p.inWaterV8&&dist>.0005){this.distance+=dist;const interval=p.sprinting?.72:.88;if(this.distance>=interval){this.distance%=interval;const below=this.game.world.getLoaded(Math.floor(p.position.x),Math.floor(p.position.y-.12),Math.floor(p.position.z));this.game.soundV14?.playBlock(below,'step',{position:p.position,volume:p.sprinting?.13:.10,pitch:.96+Math.random()*.06});}}this.grounded=p.onGround;};

/* ---- Celestial alpha cleanup + fixed celestial sphere placement ---- */
async function v143CleanCelestial(candidates,frame=null){for(const url of candidates){try{const bmp=await game.assets.image(url),sw=bmp.width,sh=bmp.height,sx=frame?Math.floor(sw/4)*frame.col:0,sy=frame?Math.floor(sh/2)*frame.row:0,w=frame?Math.floor(sw/4):sw,h=frame?Math.floor(sh/2):sh,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(bmp,sx,sy,w,h,0,0,w,h);const d=x.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b),neutral=max-min<18;if(neutral&&max<22)d.data[i+3]=0;else if(neutral&&max<48)d.data[i+3]=Math.round(d.data[i+3]*(max-22)/26);}x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}catch{}}return null;}
VoxelRenderer.prototype.ensureCelestialsV7=function(){if(this.celestialV7)return;const sm=new THREE.SpriteMaterial({transparent:true,alphaTest:.015,depthWrite:false,depthTest:false,fog:false,toneMapped:false}),mm=sm.clone(),sunSprite=new THREE.Sprite(sm),moonSprite=new THREE.Sprite(mm);sunSprite.scale.set(STUDIO_V14_3.celestialSize,STUDIO_V14_3.celestialSize,1);moonSprite.scale.copy(sunSprite.scale);sunSprite.renderOrder=moonSprite.renderOrder=-9000;sunSprite.frustumCulled=moonSprite.frustumCulled=false;this.scene.add(sunSprite,moonSprite);this.celestialV7={sunSprite,moonSprite,phase:-1};v143CleanCelestial([`${USER_REPO_RAW}/Sun.png`,`${USER_REPO_RAW}/sun.png`,`${USER_REPO_RAW}/textures/environment/sun.png`,`${MC_TEX}environment/sun.png`]).then(t=>{if(t){sm.map=t;sm.needsUpdate=true;}});v143CleanCelestial([`${USER_REPO_RAW}/moon_phases.png`,`${MC_TEX}environment/moon_phases.png`],{col:0,row:0}).then(t=>{if(t){mm.map=t;mm.needsUpdate=true;}});};
const v143CelestialBase=VoxelRenderer.prototype.updateCelestialsV7;
VoxelRenderer.prototype.updateCelestialsV7=function(){v143CelestialBase.call(this);this.ensureCelestialsV7();const phase=dayClock.phase(),a=phase*Math.PI*2,dir=new THREE.Vector3(Math.cos(a),Math.sin(a),Math.sin(a)*.38).normalize(),center=this.camera.position,d=STUDIO_V14_3.celestialDistance,s=this.celestialV7.sunSprite,m=this.celestialV7.moonSprite;s.position.copy(center).addScaledVector(dir,d);m.position.copy(center).addScaledVector(dir,-d);s.scale.set(STUDIO_V14_3.celestialSize,STUDIO_V14_3.celestialSize,1);m.scale.copy(s.scale);s.visible=dir.y>-.10;m.visible=dir.y<.10;};

/* ---- Cloud motion setting ---- */
if(typeof MinecraftCloudLayerV13!=='undefined')MinecraftCloudLayerV13.prototype.update=function(dt){if(!this.mesh||!this.game.player)return;const mode=localStorage.getItem('mcCloudMotionV143')||'moving',p=this.game.player.position;this.mesh.visible=mode!=='off'&&p.y<STUDIO_V13.cloudHeight+24;if(!this.mesh.visible)return;this.mesh.position.x=Math.round(p.x/64)*64;this.mesh.position.z=Math.round(p.z/64)*64;if(mode==='moving')this.texture.offset.x=(this.texture.offset.x+dt*STUDIO_V14_3.cloudSpeed)%1;const q=this.game.graphicsV7?.profile||'fancy';this.mesh.material.opacity=q==='fast'?.58:q==='ultra'?.88:.76;};

/* ---- Data-driven background music scheduler; no synthetic fallback. ---- */
class MinecraftMusicSchedulerV143{constructor(gameRef){this.game=gameRef;this.next=25+Math.random()*35;this.enabled=localStorage.getItem('mcMusicV143')!=='off';}event(){return this.game.mode==='creative'?'music.game.creative':'music.game';}update(dt){if(!this.enabled||!this.game.running)return;this.next-=dt;if(this.next>0)return;this.next=120+Math.random()*180;this.game.soundV14?.playEvent?.(this.event(),{ui:true,volume:.28}).then(ok=>{if(!ok)window.__voxelDiag?.log?.('MUSIC EVENT unavailable in current Mojang audio cache; no fallback played.','warn');});}}

/* ---- UI / rotation resilience ---- */
const v143BuildTitleBase=v9BuildTitle;
v9BuildTitle=function(){v143BuildTitleBase();const small=document.querySelector('#titleContent .v9Small');if(small)small.textContent='Minecraft Alpha 0.14.3 • Three.js r180 • Bedrock translation runtime';};
const v143TitleOptionsBase=v9TitleOptions;
v9TitleOptions=function(){v143TitleOptionsBase();const grid=document.querySelector('#titleContent .v9OptionsGrid');if(!grid)return;const row=document.createElement('div');row.className='v9RangeRow';row.innerHTML=`<label><span>Clouds</span><b id="v143CloudState">${(localStorage.getItem('mcCloudMotionV143')||'moving').toUpperCase()}</b></label><select id="v143CloudSelect" class="gfx-select-v7"><option value="moving">Moving</option><option value="static">Static</option><option value="off">Off</option></select><label style="margin-top:8px"><span>Background music</span><b id="v143MusicState">${localStorage.getItem('mcMusicV143')==='off'?'OFF':'ON'}</b></label><select id="v143MusicSelect" class="gfx-select-v7"><option value="on">On</option><option value="off">Off</option></select>`;grid.appendChild(row);$('v143CloudSelect').value=localStorage.getItem('mcCloudMotionV143')||'moving';$('v143CloudSelect').onchange=e=>{localStorage.setItem('mcCloudMotionV143',e.target.value);$('v143CloudState').textContent=e.target.value.toUpperCase();};$('v143MusicSelect').value=localStorage.getItem('mcMusicV143')==='off'?'off':'on';$('v143MusicSelect').onchange=e=>{localStorage.setItem('mcMusicV143',e.target.value==='off'?'off':'on');if(game.musicV143)game.musicV143.enabled=e.target.value!=='off';$('v143MusicState').textContent=e.target.value.toUpperCase();};};
function v143EnhanceInventory(){const win=screenLayer.querySelector('.mc-window');if(!win||win.querySelector('.v143Close'))return;const close=document.createElement('button');close.className='v143Close';close.type='button';close.setAttribute('aria-label','Close inventory');close.textContent='×';close.onclick=()=>game.ui.close();win.prepend(close);}
for(const name of ['renderInventory','renderCrafting','renderCreative'])if(typeof UI.prototype[name]==='function'){const base=UI.prototype[name];UI.prototype[name]=function(...args){const r=base.apply(this,args);requestAnimationFrame(v143EnhanceInventory);return r;};}
screenLayer.addEventListener('pointerdown',e=>{if(e.target===screenLayer&&game.ui?.screen)game.ui.close();});addEventListener('keydown',e=>{if(e.code==='Escape'&&game.ui?.screen){e.preventDefault();game.ui.close();}},{capture:true});
function v143ViewportSize(){const vv=window.visualViewport;return {w:Math.max(1,Math.round(vv?.width||innerWidth)),h:Math.max(1,Math.round(vv?.height||innerHeight))};}
VoxelRenderer.prototype.resize=function(){if(!this.renderer)return;const {w,h}=v143ViewportSize();this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);};
function v143ResizeAll(){const {w,h}=v143ViewportSize();document.documentElement.style.setProperty('--mc-vw',`${w}px`);document.documentElement.style.setProperty('--mc-vh',`${h}px`);game.renderer?.resize?.();if(typeof titleWorldV9!=='undefined')titleWorldV9?.resize?.(true);}
addEventListener('orientationchange',()=>{setTimeout(v143ResizeAll,60);setTimeout(v143ResizeAll,260);setTimeout(v143ResizeAll,620);});window.visualViewport?.addEventListener?.('resize',()=>requestAnimationFrame(v143ResizeAll),{passive:true});addEventListener('resize',()=>requestAnimationFrame(v143ResizeAll),{passive:true});

/* Broad translator registration for more Bedrock mob families. This is renderer/AI plumbing, not a claim that Nether/End gameplay is complete yet. */
for(const type of ['bee','blaze','enderman','iron_golem','villager','witch','slime','ghast','zombified_piglin','endermite','silverfish'])if(!modelTranslationRegistry.has(`minecraft:${type}`))modelTranslationRegistry.register(`minecraft:${type}`,{entity:type,translator:'BedrockEntityLoaderV2'});

const v143BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v143BootBase.apply(this,args);this.world.fallingBlocksV143=this.fallingBlocksV143=new FallingBlockSystemV143(this);this.spawnRulesV143??=new BedrockSpawnRuleRepositoryV143(this);this.musicV143??=new MinecraftMusicSchedulerV143(this);Promise.allSettled(['zombie','skeleton','creeper','spider','enderman','cow','pig','chicken','sheep'].map(t=>this.spawnRulesV143.rule(t))).then(()=>window.__voxelDiag?.log?.('SPAWN RULE CACHE READY: Mojang metadata loaded where available.','ok'));v143ResizeAll();window.__voxelDiag?.log?.(`V14.3 BOOT ${STUDIO_V14_3.version}: falling blocks, quadruped repair, collision recovery, entity targeting, restricted villages, spawn rules, calmer bob, player animation, celestial cleanup, cloud settings and music scheduler ready.`,'ok');};
const v143GameUpdateBase=Game.prototype.update;
Game.prototype.update=function(dt){const r=v143GameUpdateBase.call(this,dt);this.fallingBlocksV143?.update(dt);this.musicV143?.update(dt);return r;};

try{runtimeCommands.register('physics143',()=>({falling:game.fallingBlocksV143?.active?.length||0,queued:game.fallingBlocksV143?.queue?.length||0}),'Inspect falling-block physics.');runtimeCommands.register('spawnrules143',(type='zombie')=>game.spawnRulesV143?.rule(type),'Inspect Mojang Bedrock spawn rules.');runtimeCommands.register('villagers143',()=>game.mobs?.mobs?.filter(m=>m.type==='villager').map(m=>({profession:m.professionV143||'none',goal:m.behaviorV14?.currentGoal?.key||'none'}))||[],'Inspect villager professions and goals.');}catch{}
window.__voxelDiag?.log?.(`V14.3 READY ${STUDIO_V14_3.version}: high-priority physics/render/AI/mobile fixes installed.`,'ok');
