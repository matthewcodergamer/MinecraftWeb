/* ===================== V14.1: DATA-DRIVEN BEDROCK BEHAVIOR TRANSLATOR ===================== */
const STUDIO_V14_BEHAVIOR=Object.freeze({version:'0.14.1-behavior',difficulty:'normal',thinkInterval:.10,maxTargetDistance:32,strictFilters:true});
window.STUDIO_PATCH_VERSION=STUDIO_V14_BEHAVIOR.version;

class BedrockFilterEvaluatorV14{
  constructor(){this.unknown=new Set();}
  compare(actual,expected,op='=='){
    if(op==='not'||op==='!='||op==='<>')return actual!==expected;
    if(op==='<' )return Number(actual)< Number(expected);
    if(op==='<=')return Number(actual)<=Number(expected);
    if(op==='>' )return Number(actual)> Number(expected);
    if(op==='>=')return Number(actual)>=Number(expected);
    return actual===expected;
  }
  families(subject,ctx){
    if(subject===ctx.player||subject?.isPlayerV14)return new Set(['player']);
    const plan=subject?.behaviorV14?.plan||subject?.behaviorPlanV14;
    const fromPlan=plan?.families||[];
    return new Set([subject?.type,`minecraft:${subject?.type}`,...fromPlan].filter(Boolean).map(v=>String(v).replace(/^minecraft:/,'')));
  }
  subject(node,ctx){const s=node?.subject;return s==='other'||s===1?ctx.other:(s==='target'?ctx.target:(s==='player'?ctx.player:ctx.self));}
  evaluate(node,ctx={}){
    if(node==null)return true;
    if(Array.isArray(node))return node.every(n=>this.evaluate(n,ctx));
    if(typeof node!=='object')return !!node;
    const all=node.all_of||node.allOf||node.AND||node.and;if(all)return (Array.isArray(all)?all:[all]).every(n=>this.evaluate(n,ctx));
    const any=node.any_of||node.anyOf||node.OR||node.or;if(any)return (Array.isArray(any)?any:[any]).some(n=>this.evaluate(n,ctx));
    const none=node.none_of||node.noneOf||node.NOT||node.not;if(none)return !(Array.isArray(none)?none:[none]).some(n=>this.evaluate(n,ctx));
    if(!node.test)return true;
    const subject=this.subject(node,ctx),test=String(node.test),op=node.operator||'==',value=node.value;
    let actual;
    switch(test){
      case'is_family':actual=this.families(subject,ctx).has(String(value).replace(/^minecraft:/,''));return op==='not'||op==='!='?!actual:actual;
      case'in_water':actual=!!subject?.inWaterV8;break;
      case'is_underwater':actual=!!subject?.inWaterV8;break;
      case'on_ground':actual=!!subject?.onGround;break;
      case'is_daytime':actual=(ctx.game?.renderer?.dayStateV6?.daylight??1)>.45;break;
      case'is_difficulty':actual=ctx.game?.difficultyV14||STUDIO_V14_BEHAVIOR.difficulty;break;
      case'has_target':actual=!!ctx.runtime?.target;break;
      case'is_alive':actual=(subject?.health??1)>0;break;
      case'has_ranged_weapon':actual=subject?.type==='skeleton'||!!subject?.hasRangedWeaponV14;break;
      case'distance_to_nearest_player':actual=subject?.position?.distanceTo?.(ctx.player?.position)||Infinity;break;
      case'bool_property':actual=!!subject?.behaviorV14?.properties?.[node.domain];break;
      case'has_damage':actual=!!subject?.lastHurtAtV14;break;
      case'has_component':actual=!!subject?.behaviorV14?.components?.[String(value)];return op==='not'||op==='!='?!actual:actual;
      case'has_property':actual=Object.prototype.hasOwnProperty.call(subject?.behaviorV14?.properties||{},String(value));return op==='not'||op==='!='?!actual:actual;
      case'is_baby':actual=!!(subject?.behaviorV14?.components?.['minecraft:is_baby']||subject?.isBabyV14);break;
      case'is_moving':actual=Math.hypot(subject?.velocity?.x||0,subject?.velocity?.z||0)>.03;break;
      case'is_sneaking':actual=!!subject?.crouching;break;
      case'is_sprinting':actual=!!subject?.sprinting;break;
      case'is_in_contact_with_water':actual=!!subject?.inWaterV8;break;
      case'in_lava':actual=false;break;
      default:
        if(!this.unknown.has(test)){this.unknown.add(test);window.__voxelDiag?.log?.(`BEHAVIOR FILTER unsupported ${test}: condition blocked until translated`,'warn');}
        return STUDIO_V14_BEHAVIOR.strictFilters?false:true;
    }
    return this.compare(actual,value,op);
  }
}

function v14Number(value,fallback=0){if(Array.isArray(value)){const a=Number(value[0]),b=Number(value[value.length-1]);if(Number.isFinite(a)&&Number.isFinite(b))return (a+b)*.5;}const n=Number(value);return Number.isFinite(n)?n:fallback;}
function v14RandomRange(value,fallback=1){if(Array.isArray(value)){const a=Number(value[0]),b=Number(value[value.length-1]);if(Number.isFinite(a)&&Number.isFinite(b))return a+Math.random()*(b-a);}const n=Number(value);return Number.isFinite(n)?n:fallback;}
function v14BehaviorStems(type){const spec=(typeof BEDROCK_ENTITY_SPECS_V2!=='undefined'&&BEDROCK_ENTITY_SPECS_V2[type])||null;return [...new Set([...(spec?.entity||[]),type])];}

class BedrockBehaviorRepositoryV14{
  constructor(gameRef){this.game=gameRef;this.rawCache=new Map();this.planCache=new Map();this.inflight=new Map();}
  async raw(type){
    type=String(type).replace(/^minecraft:/,'');if(this.rawCache.has(type))return this.rawCache.get(type);if(this.inflight.has(`raw:${type}`))return this.inflight.get(`raw:${type}`);
    const p=(async()=>{const errors=[];for(const stem of v14BehaviorStems(type)){const url=`${BEDROCK_RAW}behavior_pack/entities/${stem}.json`;try{const json=JSON.parse(await this.game.assets.text(url));const out={json,url,stem};this.rawCache.set(type,out);window.__voxelDiag?.log?.(`BEHAVIOR JSON ${type}: SUCCESS ${url}`,'ok');return out;}catch(e){errors.push(`${stem}: ${e.message}`);}}throw new Error(`Behavior JSON unavailable for ${type}: ${errors.join(' | ')}`);})().finally(()=>this.inflight.delete(`raw:${type}`));
    this.inflight.set(`raw:${type}`,p);return p;
  }
  componentMetadata(components={}){
    const box=components['minecraft:collision_box']||{},health=components['minecraft:health']||{},move=components['minecraft:movement']||{},attack=components['minecraft:attack']||{},families=components['minecraft:type_family']?.family||[],physics=components['minecraft:physics']||{},follow=components['minecraft:follow_range']||{},explode=components['minecraft:explode']||{},xp=components['minecraft:experience_reward']||{};
    return {width:v14Number(box.width,null),height:v14Number(box.height,null),health:v14Number(health.value??health.max,null),maxHealth:v14Number(health.max??health.value,null),movement:v14Number(move.value,.23),attackDamage:v14Number(attack.damage,2),families:Array.isArray(families)?families:[],gravity:physics.has_gravity!==false,collision:physics.has_collision!==false,followRange:v14Number(follow.value,STUDIO_V14_BEHAVIOR.maxTargetDistance),burnsInDaylight:Object.prototype.hasOwnProperty.call(components,'minecraft:burns_in_daylight'),fuseLength:v14Number(explode.fuse_length,1.5),experience:xp,shooter:components['minecraft:shooter']||null,ambient:components['minecraft:ambient_sound_interval']||null};
  }
  behaviorGoals(components={}){
    const goals=[];for(const [key,value] of Object.entries(components)){if(!key.startsWith('minecraft:behavior.'))continue;const cfg=value&&typeof value==='object'?value:{};goals.push({key,priority:Number.isFinite(Number(cfg.priority))?Number(cfg.priority):100,config:cfg});}return goals;
  }
  async plan(type){
    type=String(type).replace(/^minecraft:/,'');if(this.planCache.has(type))return this.planCache.get(type);if(this.inflight.has(`plan:${type}`))return this.inflight.get(`plan:${type}`);
    const p=(async()=>{const {json,url,stem}=await this.raw(type),entity=json?.['minecraft:entity'];if(!entity)throw new Error(`${type}: minecraft:entity missing`);const base=entity.components||{},groups=entity.component_groups||{},properties=entity.description?.properties||{},plan={type,identifier:entity.description?.identifier||`minecraft:${type}`,sourceURL:url,stem,formatVersion:json.format_version||'',baseComponents:base,componentGroups:groups,events:entity.events||{},propertyDefinitions:properties,baseGoals:this.behaviorGoals(base),baseMeta:this.componentMetadata(base),families:this.componentMetadata(base).families,unsupported:new Set()};this.planCache.set(type,plan);window.__voxelDiag?.log?.(`BEHAVIOR COMPILED ${type}: ${plan.baseGoals.length} base goals, ${Object.keys(groups).length} groups, ${Object.keys(plan.events).length} events`,'ok');return plan;})().finally(()=>this.inflight.delete(`plan:${type}`));
    this.inflight.set(`plan:${type}`,p);return p;
  }
  prewarm(types){return Promise.allSettled(types.map(t=>this.plan(t)));}
}

class MobPathFinderV14{
  constructor(world){this.world=world;}
  viable(mob,dir,step=.42){const p=mob.position.clone().addScaledVector(dir,step);if(mobCollidesAtV6?.(mob,p,this.world))return false;if(typeof v7SafeGround==='function'&&!['chicken','spider'].includes(mob.type)&&!v7SafeGround(this.world,p.x,p.y,p.z,2))return false;return true;}
  steer(mob,desired,target=null){
    if(desired.lengthSq()<1e-6)return desired;const base=desired.clone().setY(0).normalize();if(this.viable(mob,base))return base;
    let best=null,bestScore=-Infinity;for(const angle of [.52,-.52,1.05,-1.05,1.57,-1.57,2.1,-2.1,Math.PI]){const d=base.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle);if(!this.viable(mob,d))continue;let score=-Math.abs(angle)*.12;if(target){const before=mob.position.distanceTo(target),after=mob.position.clone().addScaledVector(d,.6).distanceTo(target);score+=(before-after)*2;}if(score>bestScore){bestScore=score;best=d;}}
    return best||base.multiplyScalar(-1);
  }
}

class MobNavigatorV14{
  constructor(world){this.world=world;this.pathfinder=new MobPathFinderV14(world);}
  move(mob,desired,speed,dt,targetPos=null){
    const state=mob.navV14??=( {stuck:0,last:mob.position.clone(),turnBias:(Math.random()<.5?-1:1)} );let dir=desired.clone().setY(0);if(dir.lengthSq()>1e-6)dir.normalize();dir=this.pathfinder.steer(mob,dir,targetPos);if(state.stuck>.65)dir.applyAxisAngle(new THREE.Vector3(0,1,0),state.turnBias*1.05);
    const tx=dir.x*speed,tz=dir.z*speed,smooth=1-Math.exp(-9*dt);mob.velocity.x=lerp(mob.velocity.x,tx,smooth);mob.velocity.z=lerp(mob.velocity.z,tz,smooth);
    const mx=(mob.velocity.x+(mob.knockback?.x||0))*dt,mz=(mob.velocity.z+(mob.knockback?.z||0))*dt;const ox=mob.position.x,oz=mob.position.z;mobMoveAxisV6(mob,'x',mx,this.world);mobMoveAxisV6(mob,'z',mz,this.world);mob.distanceWalked=(mob.distanceWalked||0)+Math.hypot(mob.position.x-ox,mob.position.z-oz);mob.knockback?.multiplyScalar(Math.exp(-6*dt));
    const moved=Math.hypot(mob.position.x-state.last.x,mob.position.z-state.last.z);state.stuck=(speed>.1&&moved<.004)?state.stuck+dt:Math.max(0,state.stuck-dt*2);if(state.stuck>1.1){state.stuck=.1;state.turnBias*=-1;mob.wander=(mob.wander||0)+state.turnBias*(1.2+Math.random());}state.last.copy(mob.position);
  }
  physics(mob,dt){const spec=mobCollisionSpecV6(mob);if(!spec.gravity){mob.verticalVelocity=0;return;}const inWater=!!mob.inWaterV8||this.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+.45),Math.floor(mob.position.z))===BLOCK.WATER;mob.inWaterV8=inWater;const chicken=mob.type==='chicken';if(inWater)mob.verticalVelocity=Math.max(mob.verticalVelocity||0,-.35);else if(chicken&&mob.verticalVelocity<0)mob.verticalVelocity=Math.max(-2.4,(mob.verticalVelocity||0)-4.5*dt);else mob.verticalVelocity=(mob.verticalVelocity||0)-18*dt;mob.onGround=false;mobMoveAxisV6(mob,'y',(mob.verticalVelocity||0)*dt,this.world);mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.055,0)),this.world);if(mob.onGround&&mob.verticalVelocity<0)mob.verticalVelocity=0;if(mob.position.y<-8){mob.position.y=this.world.highestSolidY(Math.floor(mob.position.x),Math.floor(mob.position.z))+1;mob.verticalVelocity=0;}}
}

class BedrockBehaviorControllerV14{
  constructor(gameRef,mob,plan,filter){this.game=gameRef;this.mob=mob;this.plan=plan;this.filter=filter;this.activeGroups=new Set();this.properties={};for(const [k,v] of Object.entries(plan.propertyDefinitions||{}))this.properties[k]=v?.default??v?.default_value??false;this.target=null;this.previousTarget=null;this.goals=[];this.targetGoals=[];this.actionGoals=[];this.currentGoal=null;this.state='idle';this.desired=new THREE.Vector3();this.speed=0;this.think=0;this.rangedCooldown=.4+Math.random();this.ambientClock=3+Math.random()*7;this.sensorClock=0;this.timerState=new Map();this.eventDepth=0;this.shadeTarget=null;this.rebuild();this.applyEvent('minecraft:entity_spawned');}
  mergedComponents(){const out={...this.plan.baseComponents};for(const name of this.activeGroups)Object.assign(out,this.plan.componentGroups[name]||{});return out;}
  rebuild(){const components=this.mergedComponents(),meta={...this.plan.baseMeta,...this.game.behaviorRepoV14.componentMetadata(components)};this.components=components;this.meta=meta;this.mob.behaviorPlanV14=this.plan;this.mob.behaviorMetaV14=meta;this.mob.behaviorSpecV6={...(this.mob.behaviorSpecV6||{}),width:meta.width??this.mob.behaviorSpecV6?.width,height:meta.height??this.mob.behaviorSpecV6?.height,collision:meta.collision,gravity:meta.gravity};if(meta.health&&(!this.mob._behaviorHealthSetV14)){this.mob.health=meta.health;this.mob.maxHealth=meta.maxHealth||meta.health;this.mob._behaviorHealthSetV14=true;}if(meta.fuseLength)this.mob.fuseTime=meta.fuseLength;const goals=this.game.behaviorRepoV14.behaviorGoals(components).sort((a,b)=>a.priority-b.priority);this.goals=goals;this.targetGoals=goals.filter(g=>V14_TARGET_GOALS.has(g.key));this.actionGoals=goals.filter(g=>!V14_TARGET_GOALS.has(g.key));}
  coercePropertyValue(value){if(typeof value!=='string')return value;const t=value.trim();if(t==='true')return true;if(t==='false')return false;const n=Number(t);return Number.isFinite(n)?n:value;}
  applyEvent(name,extra={}){
    if(this.eventDepth>12){window.__voxelDiag?.log?.(`BEHAVIOR EVENT recursion stopped: ${name} (${this.mob.type})`,'warn');return false;}
    const event=this.plan.events?.[name];if(!event)return false;this.eventDepth++;
    const ctx={game:this.game,self:this.mob,other:extra.other||this.target,target:this.target,player:this.game.player,runtime:this};let changed=false;
    const applyNode=node=>{if(!node||typeof node!=='object')return;if(node.filters&&!this.filter.evaluate(node.filters,ctx))return;
      if(node.add?.component_groups)for(const g of node.add.component_groups){if(!this.activeGroups.has(g)){this.activeGroups.add(g);changed=true;}}
      if(node.remove?.component_groups)for(const g of node.remove.component_groups){if(this.activeGroups.delete(g))changed=true;}
      const props=node.set_property||node.set_properties;if(props&&typeof props==='object')for(const [k,v] of Object.entries(props))this.properties[k]=this.coercePropertyValue(v);
      const trigger=node.trigger||node.event;if(typeof trigger==='string')this.applyEvent(trigger,extra);else if(trigger?.event)this.applyEvent(trigger.event,{...extra,other:trigger.target==='other'?ctx.other:extra.other});
      if(Array.isArray(node.sequence))for(const part of node.sequence)applyNode(part);
      if(Array.isArray(node.randomize)){let candidates=node.randomize.filter(part=>!part.filters||this.filter.evaluate(part.filters,ctx));if(candidates.length){let total=candidates.reduce((sum,p)=>sum+Math.max(0,v14Number(p.weight,1)),0),r=Math.random()*Math.max(total,1);for(const part of candidates){r-=Math.max(0,v14Number(part.weight,1));if(r<=0){applyNode(part);break;}}}}
    };
    try{applyNode(event);if(changed)this.rebuild();return changed;}finally{this.eventDepth--;}
  }
  applyTrigger(trigger,other=null){if(!trigger)return false;const event=typeof trigger==='string'?trigger:trigger.event;if(!event)return false;const filters=typeof trigger==='object'?trigger.filters:null;if(filters&&!this.filter.evaluate(filters,{game:this.game,self:this.mob,other,target:this.target,player:this.game.player,runtime:this}))return false;return this.applyEvent(event,{other});}
  updateComponentEvents(dt){
    this.sensorClock-=dt;if(this.sensorClock<=0){this.sensorClock=.15;const env=this.components['minecraft:environment_sensor'];for(const t of env?.triggers||[])this.applyTrigger(t,this.target);const sensor=this.components['minecraft:entity_sensor'];if(sensor?.event&&this.target?.position&&this.mob.position.distanceTo(this.target.position)<=v14Number(sensor.range?.[0]??sensor.minimum_count??8,8))this.applyTrigger(sensor.event,this.target);}
    const timer=this.components['minecraft:timer'];if(timer){let state=this.timerState.get('minecraft:timer');if(!state){state={left:v14RandomRange(timer.time??timer.time_down_event?.time,1)};this.timerState.set('minecraft:timer',state);}state.left-=dt;if(state.left<=0){const evt=timer.time_down_event?.event||timer.event;if(evt)this.applyEvent(evt);if(timer.looping!==false)state.left=v14RandomRange(timer.time??timer.time_down_event?.time,1);else this.timerState.delete('minecraft:timer');}}
  }
  familyMatchesPlayer(filters){return this.filter.evaluate(filters,{game:this.game,self:this.mob,other:this.game.player,target:this.game.player,player:this.game.player,runtime:this});}
  selectTargets(){
    const old=this.target;if(this.target&&((this.target.health??1)<=0||!this.target.position))this.target=null;let chosen=null;
    for(const g of this.targetGoals){const cfg=g.config||{};if(g.key==='minecraft:behavior.hurt_by_target'){if(this.mob.lastHurtByV14&&performance.now()-(this.mob.lastHurtAtV14||0)<10000){chosen=this.mob.lastHurtByV14;break;}}
      if(g.key==='minecraft:behavior.nearest_attackable_target'){
        const radius=v14Number(cfg.within_radius??cfg.max_dist,this.meta.followRange||25),d=this.mob.position.distanceTo(this.game.player.position);if(d>radius)continue;const types=Array.isArray(cfg.entity_types)?cfg.entity_types:[];if(!types.length||types.some(t=>this.familyMatchesPlayer(t.filters||t))){chosen=this.game.player;break;}
      }}
    if(chosen)this.target=chosen;else if(this.target?.position&&this.mob.position.distanceTo(this.target.position)>(this.meta.followRange||32)*1.25)this.target=null;
    if(old!==this.target){if(this.target)this.applyTrigger(this.components['minecraft:on_target_acquired'],this.target);else if(old)this.applyTrigger(this.components['minecraft:on_target_escape'],old);this.previousTarget=old;}
  }
  setMoveToward(pos,speed,state='walk'){if(!pos)return;this.desired.copy(pos).sub(this.mob.position).setY(0);this.speed=speed;this.state=state;}
  setMoveAway(pos,speed,state='walk'){if(!pos)return;this.desired.copy(this.mob.position).sub(pos).setY(0);this.speed=speed;this.state=state;}
  findShade(){const p=this.mob.position;for(let r=3;r<=10;r+=2)for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,y=this.game.world.highestSolidY(Math.floor(x),Math.floor(z))+1;if(this.game.lightV8?.skyVisible?.(x,y+1,z)===false)return new THREE.Vector3(x,y,z);}return null;}
  attackTarget(target,damage){if(!target)return;if(target===this.game.player){const player=target;if(this.game.mode==='creative')return;const blocked=this.game.blockingV8&&typeof v8ShieldFacesSource==='function'&&v8ShieldFacesSource(player,this.mob.position);if(blocked){player.applyKnockback?.(player.position.clone().sub(this.mob.position),.55,.2);this.game.soundV14?.playEvent?.('random.shield_block',{position:player.position,volume:.35});return;}player.health=Math.max(0,player.health-Math.max(1,Math.round(damage)));player.applyKnockback?.(player.position.clone().sub(this.mob.position),3.2,3.2);damageVignette.style.opacity='.82';setTimeout(()=>damageVignette.style.opacity='0',120);this.game.soundV14?.playEntity?.('player','hurt',{position:player.position,volume:.75});return;}if(typeof target.health==='number'){target.health=Math.max(0,target.health-Math.max(1,Math.round(damage)));target.lastHurtByV14=this.mob;target.lastHurtAtV14=performance.now();target.knockback?.add?.(target.position.clone().sub(this.mob.position).setY(.18).normalize().multiplyScalar(2.2));this.game.soundV14?.playEntity?.(target.type,'hurt',{position:target.position,volume:.65});}}
  attackPlayer(damage){return this.attackTarget(this.game.player,damage);}
  tickGoal(goal,dt){
    const mob=this.mob,cfg=goal.config||{},base=Math.max(.25,(this.meta.movement||.23)*7),mult=v14Number(cfg.speed_multiplier??cfg.walk_speed_multiplier,1),target=this.target;
    switch(goal.key){
      case'minecraft:behavior.float':case'minecraft:behavior.swim':if(mob.inWaterV8){mob.verticalVelocity=Math.max(mob.verticalVelocity||0,2.0);if(target)this.setMoveToward(target.position,base*mult,'swim');this.state='swim';return true;}return false;
      case'minecraft:behavior.panic':if(performance.now()-(mob.lastHurtAtV14||0)<2500){this.setMoveAway(mob.lastHurtByV14?.position||this.game.player.position,base*Math.max(1.15,mult),'walk');return true;}return false;
      case'minecraft:behavior.flee_sun':{const day=this.game.renderer?.dayStateV6?.daylight??0,exposed=this.game.lightV8?.skyVisible?.(mob.position.x,mob.position.y+1,mob.position.z);if(day>.55&&exposed){if(!this.shadeTarget||this.shadeTarget.distanceTo(mob.position)<1)this.shadeTarget=this.findShade();if(this.shadeTarget){this.setMoveToward(this.shadeTarget,base*mult,'walk');return true;}}return false;}
      case'minecraft:behavior.avoid_mob_type':{let nearest=null,nd=Infinity;for(const entry of cfg.entity_types||[]){const max=v14Number(entry.max_dist,8);const pd=mob.position.distanceTo(this.game.player.position);if(pd<max&&this.filter.evaluate(entry.filters||{}, {game:this.game,self:mob,other:this.game.player,player:this.game.player,target:this.game.player,runtime:this})){nearest=this.game.player;nd=pd;}for(const other of this.game.mobs?.mobs||[]){if(other===mob)continue;const d=mob.position.distanceTo(other.position);if(d>=max||d>=nd)continue;if(this.filter.evaluate(entry.filters||{}, {game:this.game,self:mob,other,target:other,player:this.game.player,runtime:this})){nearest=other;nd=d;}}}if(nearest){this.setMoveAway(nearest.position,base*v14Number(cfg.sprint_speed_multiplier??cfg.walk_speed_multiplier,1),'walk');return true;}return false;}
      case'minecraft:behavior.melee_attack':case'minecraft:behavior.melee_box_attack':if(target?.position){const d=mob.position.distanceTo(target.position),reach=v14Number(cfg.reach_multiplier,1)*1.45;this.setMoveToward(target.position,base*mult,'walk');mob.yaw=Math.atan2(-(target.position.x-mob.position.x),-(target.position.z-mob.position.z));if(d<=reach&&(mob.attack||0)<=0){mob.attack=v14Number(cfg.cooldown_time,1);mob.attackAnim=.36;this.state='attack';this.attackTarget(target,this.meta.attackDamage||3);this.game.soundV14?.playEntity?.(mob.type,'attack',{position:mob.position,volume:.7});}return true;}return false;
      case'minecraft:behavior.ranged_attack':if(target?.position){const d=mob.position.distanceTo(target.position),radius=v14Number(cfg.attack_radius,15);if(d<=radius){mob.yaw=Math.atan2(-(target.position.x-mob.position.x),-(target.position.z-mob.position.z));if(d<4)this.setMoveAway(target.position,base*.65,'walk');else{this.speed=0;this.state='idle';}this.rangedCooldown-=dt;if(this.rangedCooldown<=0){const amin=v14Number(cfg.attack_interval_min,1.8),amax=v14Number(cfg.attack_interval_max,amin);this.rangedCooldown=amin+Math.random()*Math.max(0,amax-amin);this.game.arrowsV8?.shoot?.(mob.position,target.position);mob.attackAnim=.25;this.state='attack';const shooter=this.components['minecraft:shooter'];if(shooter?.sound)this.game.soundV14?.playEvent?.(String(shooter.sound),{position:mob.position,volume:.7});else this.game.soundV14?.playEntity?.(mob.type,'attack',{position:mob.position,volume:.7});}return true;}this.setMoveToward(target.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.swell':if(target?.position&&mob.type==='creeper'){const d=mob.position.distanceTo(target.position),start=v14Number(cfg.start_distance,2.8),stop=v14Number(cfg.stop_distance,7);if(d<=start){if((mob.fuse||0)<=0.001)this.game.soundV14?.playEvent?.('random.fuse',{position:mob.position,volume:.72});mob.fuse=(mob.fuse||0)+dt;this.state='fuse';this.speed=0;if(mob.fuse>=mob.fuseTime)this.game.explosionsV6?.queueCreeper?.(mob);return true;}if(d>stop){mob.fuse=Math.max(0,(mob.fuse||0)-dt*1.8);if(mob.fuse<=.001)mob._v14ExplosionSound=false;}return false;}return false;
      case'minecraft:behavior.move_towards_target':if(target?.position){this.setMoveToward(target.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.tempt':if(this.game.player?.position&&mob.position.distanceTo(this.game.player.position)<v14Number(cfg.within_radius,10)){this.setMoveToward(this.game.player.position,base*mult,'walk');return true;}return false;
      case'minecraft:behavior.follow_parent':{if(!this.components['minecraft:is_baby'])return false;let parent=null,dist=Infinity;for(const other of this.game.mobs?.mobs||[]){if(other===mob||other.type!==mob.type||other.behaviorV14?.components?.['minecraft:is_baby'])continue;const d=mob.position.distanceTo(other.position);if(d<dist){dist=d;parent=other;}}if(parent&&dist<=v14Number(cfg.search_range,16)&&dist>v14Number(cfg.stop_distance,2)){this.setMoveToward(parent.position,base*mult,'walk');return true;}return false;}
      case'minecraft:behavior.look_at_entity':{let other=this.target;if(!other){let nd=Infinity;for(const candidate of this.game.mobs?.mobs||[]){if(candidate===mob)continue;const d=mob.position.distanceTo(candidate.position);if(d<nd&&d<=v14Number(cfg.look_distance,8)){nd=d;other=candidate;}}}if(other?.position){mob.yaw=Math.atan2(-(other.position.x-mob.position.x),-(other.position.z-mob.position.z));return true;}return false;}
      case'minecraft:behavior.random_stroll':case'minecraft:behavior.move_towards_dwelling_restriction':case'minecraft:behavior.move_towards_restriction':{mob.aiV14??={wanderTime:0,wander:Math.random()*Math.PI*2};mob.aiV14.wanderTime-=dt;if(mob.aiV14.wanderTime<=0){mob.aiV14.wanderTime=1.8+Math.random()*4.2;mob.aiV14.wander+=(Math.random()-.5)*Math.PI*1.6;}this.desired.set(Math.sin(mob.aiV14.wander),0,Math.cos(mob.aiV14.wander));this.speed=base*mult*.72;this.state='walk';return true;}
      case'minecraft:behavior.look_at_player':{const d=mob.position.distanceTo(this.game.player.position);if(d<=v14Number(cfg.look_distance,8)){mob.yaw=Math.atan2(-(this.game.player.position.x-mob.position.x),-(this.game.player.position.z-mob.position.z));return true;}return false;}
      case'minecraft:behavior.random_look_around':mob.aiV14??={wanderTime:0,wander:Math.random()*Math.PI*2};if(Math.random()<dt*.4)mob.yaw+=(Math.random()-.5)*1.2;return true;
      default:return false;
    }
  }
  update(dt){
    const mob=this.mob;mob.ensureStudioState?.();mob.age=(mob.age||0)+dt;mob.think=(mob.think||0)-dt;mob.attack=Math.max(0,(mob.attack||0)-dt);mob.attackAnim=Math.max(0,(mob.attackAnim||0)-dt);mob.hitFlash=Math.max(0,(mob.hitFlash||0)-dt);mob.attackProgress=mob.attackAnim>0?clamp(1-mob.attackAnim/.36,0,1):0;mobDepenetrateV6?.(mob,this.game.world);mob.onGround=mobCollidesAtV6(mob,mob.position.clone().add(new THREE.Vector3(0,-.055,0)),this.game.world);mob.inWaterV8=this.game.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+.5),Math.floor(mob.position.z))===BLOCK.WATER;
    this.updateComponentEvents(dt);this.think-=dt;if(this.think<=0){this.think=STUDIO_V14_BEHAVIOR.thinkInterval;this.selectTargets();}
    this.desired.set(0,0,0);this.speed=0;this.state='idle';this.currentGoal=null;
    for(const goal of this.actionGoals){if(!V14_GOAL_HANDLERS.has(goal.key)){if(!this.plan.unsupported.has(goal.key)){this.plan.unsupported.add(goal.key);window.__voxelDiag?.log?.(`BEHAVIOR primitive not implemented yet: ${goal.key} (${this.plan.type})`,'warn');}continue;}if(this.tickGoal(goal,dt)){this.currentGoal=goal;break;}}
    if(this.speed>0&&this.desired.lengthSq()>1e-6)this.game.mobNavigatorV14.move(mob,this.desired,this.speed,dt,this.target?.position||null);else{mob.velocity.x=lerp(mob.velocity.x,0,1-Math.exp(-8*dt));mob.velocity.z=lerp(mob.velocity.z,0,1-Math.exp(-8*dt));mob.knockback?.multiplyScalar(Math.exp(-6*dt));}
    this.game.mobNavigatorV14.physics(mob,dt);
    if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;setMobFlash?.(mob,mob.hitFlash>0?.38:0);if(mob.type==='creeper'&&mob.fuse>0){const pulse=(Math.sin(mob.age*32)>0?1:0)*clamp(mob.fuse/mob.fuseTime,0,1)*.22;mob.model.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissive.setRGB(pulse,pulse,pulse);});}mob.animationController?.update?.(this.state,mob.age,mob);}
    this.ambientClock-=dt;if(this.ambientClock<=0){this.ambientClock=6+Math.random()*12;this.game.soundV14?.playEntity?.(mob.type,'ambient',{position:mob.position,volume:.45});}
  }
}

const V14_TARGET_GOALS=new Set(['minecraft:behavior.nearest_attackable_target','minecraft:behavior.hurt_by_target']);
const V14_GOAL_HANDLERS=new Set(['minecraft:behavior.float','minecraft:behavior.swim','minecraft:behavior.panic','minecraft:behavior.flee_sun','minecraft:behavior.avoid_mob_type','minecraft:behavior.melee_attack','minecraft:behavior.melee_box_attack','minecraft:behavior.ranged_attack','minecraft:behavior.swell','minecraft:behavior.move_towards_target','minecraft:behavior.tempt','minecraft:behavior.follow_parent','minecraft:behavior.look_at_entity','minecraft:behavior.random_stroll','minecraft:behavior.move_towards_dwelling_restriction','minecraft:behavior.move_towards_restriction','minecraft:behavior.look_at_player','minecraft:behavior.random_look_around']);

class BedrockBehaviorSystemV14{
  constructor(gameRef){this.game=gameRef;this.filter=new BedrockFilterEvaluatorV14();}
  async attach(mob){try{const plan=await this.game.behaviorRepoV14.plan(mob.type);mob.behaviorV14=new BedrockBehaviorControllerV14(this.game,mob,plan,this.filter);window.__voxelDiag?.log?.(`AI ATTACHED ${mob.type}: ${mob.behaviorV14.actionGoals.length} action + ${mob.behaviorV14.targetGoals.length} target goals`,'ok');return mob.behaviorV14;}catch(e){mob.behaviorErrorV14=e;window.__voxelDiag?.log?.(`AI ABORTED ${mob.type}: ${e.message}`,'err');return null;}}
}

const v14BehaviorSpawnBase=MobSystem.prototype.spawnEntity;
MobSystem.prototype.spawnEntity=async function(type,position){const mob=await v14BehaviorSpawnBase.call(this,type,position);if(mob)await this.game?.behaviorV14?.attach?.(mob);return mob;};

const v14CombatAttackBase=CombatSystem.prototype.attack;
CombatSystem.prototype.attack=function(){const target=this.target?.();const hp=target?.health;const result=v14CombatAttackBase.call(this);if(result&&target&&target.health<hp){target.lastHurtByV14=this.game.player;target.lastHurtAtV14=performance.now();this.game.soundV14?.playEntity?.(target.type,'hurt',{position:target.position,volume:.8});}return result;};

MobSystem.prototype.update=function(dt,player){
  this.lastSpawn-=dt;if(this.lastSpawn<=0){this.lastSpawn=2.4;if(Math.random()<.38)this.spawnAround(player);}
  for(let i=this.mobs.length-1;i>=0;i--){const mob=this.mobs[i];
    if(mob.behaviorV14)mob.behaviorV14.update(dt);else{mob.ensureStudioState?.();mob.velocity.multiplyScalar(Math.exp(-5*dt));if(mob.model){mob.model.position.copy(mob.position);mob.model.rotation.y=mob.yaw;}}
    const undead=mob.type==='zombie'||mob.type==='skeleton',day=this.game.renderer?.dayStateV6?.daylight??0,wet=this.world.getLoaded(Math.floor(mob.position.x),Math.floor(mob.position.y+1),Math.floor(mob.position.z))===BLOCK.WATER,exposed=this.game.lightV8?.skyVisible?.(mob.position.x,mob.position.y+1.2,mob.position.z);
    const planBurn=mob.behaviorV14?.meta?.burnsInDaylight;if(undead&&(planBurn!==false)&&day>.58&&exposed&&!wet){mob.sunFireV8=(mob.sunFireV8||0)+dt;this.game.fireV8?.set?.(mob,true);if(mob.sunFireV8>=1){mob.sunFireV8-=1;mob.health=Math.max(0,mob.health-1);}}else{mob.sunFireV8=0;this.game.fireV8?.set?.(mob,false);}
    if(mob.model&&typeof entityLodPolicy!=='undefined'){const level=entityLodPolicy.level(mob.position.distanceTo(player.position));entityLodPolicy.apply(mob.model,level);}
    if(mob.health<=0){this.game.soundV14?.playEntity?.(mob.type,'death',{position:mob.position,volume:.85});if(typeof v8DropMobLoot==='function')v8DropMobLoot(this.game,mob);if(!mob._xpAwardedV14&&this.game.mode!=='creative'){mob._xpAwardedV14=true;const hostile=['zombie','skeleton','creeper','spider','enderman'].includes(mob.type),xp=hostile?5:1+Math.floor(Math.random()*3);this.game.xpV12?.add?.(xp,`mob:${mob.type}`);}if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);continue;}
    if(mob.position.distanceTo(player.position)>110){if(mob.mesh?.parent)mob.mesh.parent.remove(mob.mesh);this.mobs.splice(i,1);}
  }
};

const v14BehaviorBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){await v14BehaviorBootBase.apply(this,args);this.difficultyV14??=STUDIO_V14_BEHAVIOR.difficulty;this.behaviorRepoV14??=new BedrockBehaviorRepositoryV14(this);this.mobNavigatorV14??=new MobNavigatorV14(this.world);this.behaviorV14??=new BedrockBehaviorSystemV14(this);this.behaviorRepoV14.prewarm(['zombie','skeleton','creeper','cow','pig','chicken','sheep','spider','villager','enderman']).then(results=>{const ok=results.filter(r=>r.status==='fulfilled').length;window.__voxelDiag?.log?.(`BEHAVIOR PREWARM: ${ok}/${results.length} Mojang entity behavior plans cached`,'ok');});window.__voxelDiag?.log?.(`V14.1 BEHAVIOR: Bedrock components/groups/events + priority goal scheduler + collision-aware smart navigation installed.`,'ok');};

try{
  runtimeCommands.register('behavior',(type='zombie')=>game.behaviorRepoV14?.plan(String(type).replace(/^minecraft:/,'')).then(p=>({type:p.type,source:p.sourceURL,baseGoals:p.baseGoals.map(g=>({key:g.key,priority:g.priority})),groups:Object.keys(p.componentGroups),events:Object.keys(p.events),properties:Object.keys(p.propertyDefinitions||{}),unsupported:[...p.unsupported]})),'Inspect compiled Mojang Bedrock behavior plan.');
  runtimeCommands.register('ai',()=>game.mobs?.mobs?.map(m=>({type:m.type,hp:m.health,goal:m.behaviorV14?.currentGoal?.key||'none',priority:m.behaviorV14?.currentGoal?.priority??null,target:m.behaviorV14?.target===game.player?'player':m.behaviorV14?.target?.type||null,source:m.behaviorV14?.plan?.sourceURL||null,error:m.behaviorErrorV14?.message||null}))||[],'Inspect live data-driven mob AI goals.');
}catch{}
window.__voxelDiag?.log?.(`V14.1 READY ${STUDIO_V14_BEHAVIOR.version}: Mojang behavior JSON is now the AI source of truth; unsupported primitives are reported instead of silently inventing per-mob AI.`,'ok');
