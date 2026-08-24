/* ===================== V14.7C: ENTITY ANIMATION + SHEEP/COLLISION REPAIR ===================== */
/* Correct Java sheep pivots. The old body extended mostly behind z=.10 while the head ended near z=-.25,
   leaving a visible gap. These pivots make the head meet the front of the horizontal body. */
buildJavaSheepV145=async function(){
  const [skin,wool]=await Promise.all([javaTextureFromRelV145('entity/sheep/sheep.png'),javaTextureFromRelV145('entity/sheep/sheep_wool.png')]),baseMat=new THREE.MeshLambertMaterial({map:skin,color:0xffffff,transparent:true,alphaTest:.025}),woolMat=new THREE.MeshLambertMaterial({map:wool,color:0xffffff,transparent:true,alphaTest:.025});
  const root=new THREE.Group(),parts={};
  const part=(name,w,h,d,u,v,mat,x,y,z,rx=0,inflate=0)=>{const pivot=new THREE.Group(),mesh=new THREE.Mesh(javaCubeGeometryV145(w,h,d,64,32,u,v,inflate),mat);pivot.name=`java_sheep_${name}`;pivot.position.set(x,y,z);pivot.rotation.x=rx;pivot.add(mesh);root.add(pivot);parts[name]=pivot;return pivot;};
  part('body',8,16,6,28,8,baseMat,0,.55,-.35,Math.PI/2);part('head',6,6,8,0,0,baseMat,0,.38,-.60,0);
  part('leg0',4,6,4,0,16,baseMat,-.19,0,-.20);part('leg1',4,6,4,0,16,baseMat,.19,0,-.20);part('leg2',4,6,4,0,16,baseMat,-.19,0,.42);part('leg3',4,6,4,0,16,baseMat,.19,0,.42);
  const wb=part('woolBody',8,16,6,28,8,woolMat,0,.55,-.35,Math.PI/2,.055),wh=part('woolHead',6,6,8,0,0,woolMat,0,.38,-.60,0,.035);wb.renderOrder=1;wh.renderOrder=1;
  root.userData.javaSheepPartsV145=parts;root.userData.geometryName='java:sheep_model_v147';root.userData.textureURL=skin.userData?.sourceURL;root.userData.edition='java';root.userData.v147Sheep=true;root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.frustumCulled=true;}});return root;
};

/* Passive mobs get a swept AABB guard. This prevents a fast/mobile frame from moving an animal from one
   side of a solid block to the other without ever testing the space in between. */
const v147PassiveUpdateBase=JavaPassiveAnimalV145.prototype.update;
JavaPassiveAnimalV145.prototype.update=function(dt){
  const m=this.mob,world=this.game.world,before=m.position.clone(),wasSafe=!mobCollidesAtV6(m,before,world);if(wasSafe)this._v147Safe=before.clone();const r=v147PassiveUpdateBase.call(this,dt),end=m.position.clone(),delta=end.clone().sub(before),distance=delta.length();
  if(wasSafe&&distance>.02){let safe=before.clone(),hit=false;const steps=Math.min(20,Math.max(1,Math.ceil(distance/.085)));for(let i=1;i<=steps;i++){const p=before.clone().addScaledVector(delta,i/steps);if(mobCollidesAtV6(m,p,world)){hit=true;break;}safe.copy(p);}if(hit){m.position.copy(safe);m.velocity.x=0;m.velocity.z=0;m.verticalVelocity=Math.min(0,m.verticalVelocity||0);this.walkFor=0;this.idleFor=.25+Math.random()*.45;this.wander+=Math.PI*(.55+Math.random()*.9);}}
  if(mobCollidesAtV6(m,m.position,world)){const fallback=this._v147Safe||before;if(!mobCollidesAtV6(m,fallback,world))m.position.copy(fallback);else mobDepenetrateV6(m,world);m.velocity.x=m.velocity.z=0;m.verticalVelocity=0;}else this._v147Safe=m.position.clone();
  if(m.model)m.model.position.copy(m.position);return r;
};

function v147NormBoneName(name){return String(name||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function v147FindBone(avatar,candidates){
  const c=avatar?.controller;for(const wanted of candidates){if(c?.bones)for(const [name,bone] of c.bones)if(v147NormBoneName(name)===wanted||v147NormBoneName(name).includes(wanted))return {name,bone,bind:c.bind?.get(name)||null};}
  let found=null;avatar?.root?.traverse?.(o=>{if(found)return;const n=v147NormBoneName(o.name);if(candidates.some(w=>n===w||n.includes(w)))found={name:o.name,bone:o,bind:null};});return found;
}
function v147BindRotation(rec){return rec?.bind?.rotation||rec?.bone?.userData?._v147BindRot||null;}
function v147RememberBind(rec){if(!rec?.bone||rec.bind)return;rec.bone.userData._v147BindRot??=rec.bone.rotation.clone();}
function v147SetBoneX(rec,offset){if(!rec?.bone)return;v147RememberBind(rec);const b=rec.bind?.rotation||rec.bone.userData._v147BindRot;rec.bone.rotation.x=(b?.x||0)+offset;}
function v147SetBoneY(rec,offset){if(!rec?.bone)return;v147RememberBind(rec);const b=rec.bind?.rotation||rec.bone.userData._v147BindRot;rec.bone.rotation.y=(b?.y||0)+offset;}

function v147PlayerBones(avatar){
  avatar._v147Bones??={
    rightArm:v147FindBone(avatar,['rightarm','armright']),leftArm:v147FindBone(avatar,['leftarm','armleft']),
    rightLeg:v147FindBone(avatar,['rightleg','legright']),leftLeg:v147FindBone(avatar,['leftleg','legleft']),
    head:v147FindBone(avatar,['head']),body:v147FindBone(avatar,['body','torso'])
  };return avatar._v147Bones;
}
function v147ProceduralPlayer(avatar,state,gameRef){
  const p=state.player||gameRef.player,b=v147PlayerBones(avatar),speed=Math.hypot(p.velocity?.x||0,p.velocity?.z||0),move=clamp(speed/(p.sprinting?7:5.4),0,1),phase=(avatar.distance||0)*8.7,walk=Math.sin(phase)*.68*move,attackAge=performance.now()-(gameRef.combat?.lastAttackTime||0),attacking=attackAge<360||!!gameRef.breaking,attack=attacking?clamp(1-attackAge/360,0,1):0;
  v147SetBoneX(b.rightLeg,walk);v147SetBoneX(b.leftLeg,-walk);v147SetBoneX(b.rightArm,-walk*.78);v147SetBoneX(b.leftArm,walk*.78);
  if(attacking&&b.rightArm?.bone){const swing=gameRef.breaking?Math.sin(performance.now()*.018)*.32:Math.sin((1-attack)*Math.PI)*.55;v147SetBoneX(b.rightArm,-1.18-swing);}
  if(b.head?.bone){v147SetBoneX(b.head,clamp(p.pitch||0,-1.15,1.15)*.72);v147SetBoneY(b.head,0);}
  if(b.body?.bone)v147SetBoneX(b.body,p.crouchingV12?.22:0);
}

function v147DisposeHeld(root){if(!root)return;root.parent?.remove?.(root);root.traverse?.(o=>{if(o.isMesh){if(o.geometry&&o.geometry!==V147_TORCH_GEO)o.geometry.dispose?.();const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)m?.dispose?.();}});}
function v147ThirdPersonHeld(id,gameRef){
  if(!id||id===ITEM.AIR)return null;let root=null;if(V147_TOOL_IDS.has(id))root=javaToolFactoryV147.create(id);else if(id===ITEM.TORCH)root=javaTorchHeldV147();else{const block=gameRef.itemToBlock?.(id)??BLOCK.AIR;if(block!==BLOCK.AIR){try{gameRef._v147ThirdBlockFactory??=new StudioDropVisualFactoryV6(gameRef);root=gameRef._v147ThirdBlockFactory.create(id);}catch{}}}
  if(!root)return null;root.name=`held_item_v147_${id}`;root.traverse?.(o=>{if(!o.isMesh)return;const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const n=m.clone();n.depthTest=true;n.depthWrite=true;n.toneMapped=true;return n;});o.material=Array.isArray(o.material)?mats:mats[0];o.renderOrder=0;o.frustumCulled=true;});root.scale.multiplyScalar(.55);root.rotation.set(-.25,.10,-1.40);root.position.set(.02,-.52,-.04);return root;
}
function v147SyncPlayerHeld(avatar,state,gameRef){
  const p=state.player||gameRef.player,isLocal=p===gameRef.player,id=isLocal?(gameRef.selectedStack?.()?.id||ITEM.AIR):(p.selectedItemId||ITEM.AIR),arm=v147PlayerBones(avatar).rightArm?.bone;if(!arm)return;
  if(avatar._v147HeldId===id&&avatar._v147Held?.parent===arm)return;v147DisposeHeld(avatar._v147Held);avatar._v147Held=null;avatar._v147HeldId=id;if(!id||id===ITEM.AIR)return;const held=v147ThirdPersonHeld(id,gameRef);if(!held)return;arm.add(held);avatar._v147Held=held;
}

const v147PlayerEntityUpdateBase=PlayerEntityRendererV12.prototype.updateOne;
PlayerEntityRendererV12.prototype.updateOne=function(avatar,state,dt){const r=v147PlayerEntityUpdateBase.call(this,avatar,state,dt);v147ProceduralPlayer(avatar,state,this.game);v147SyncPlayerHeld(avatar,state,this.game);return r;};

/* Repair already-spawned sheep when V14.7 hot-loads/restarts without requiring a new save. */
async function v147RepairExistingSheep(){for(const m of game.mobs?.mobs||[]){if(m.type!=='sheep'||m.model?.userData?.v147Sheep)continue;await replaceSheepJavaV145(m);}}
const v147EntityBootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){const r=await v147EntityBootBase.apply(this,args);setTimeout(()=>v147RepairExistingSheep().catch(()=>{}),250);window.__voxelDiag?.log?.('V14.7C READY: connected Java sheep pivots, swept passive-mob collision, procedural player limb fallback and third-person held items active.','ok');return r;};
try{runtimeCommands.register('anim147',()=>{const a=game.playerEntitiesV12?.local,b=a?v147PlayerBones(a):null;return{playerModel:!!a,held:a?._v147HeldId||0,bones:b?Object.fromEntries(Object.entries(b).map(([k,v])=>[k,v?.name||null])):{},sheep:(game.mobs?.mobs||[]).filter(m=>m.type==='sheep').map(m=>({pos:m.position.toArray(),v147:!!m.model?.userData?.v147Sheep,colliding:mobCollidesAtV6(m,m.position,game.world)}))};},'Inspect V14.7 player/sheep animation and collision state.');}catch{}
