/* -------------------------------------------------------------------------- */
/* PLAYER ANTI-TUNNEL / DEPENETRATION                                         */
/* -------------------------------------------------------------------------- */
const v145PlayerUpdateBase=Player.prototype.update;
Player.prototype.update=function(dt,controls){
  const before=this.position.clone();if(this.collidesAt(this.position))this.depenetrateV6?.();const r=v145PlayerUpdateBase.call(this,dt,controls),end=this.position.clone(),delta=end.clone().sub(before),dist=delta.length();
  if(dist>STUDIO_V14_5.playerSweepStep*1.25&&!this.collidesAt(before)){const steps=Math.min(16,Math.max(2,Math.ceil(dist/STUDIO_V14_5.playerSweepStep))),safe=before.clone();for(let i=1;i<=steps;i++){const p=before.clone().addScaledVector(delta,i/steps);if(this.collidesAt(p)){this.position.copy(safe);this.velocity.x=this.velocity.z=0;if(delta.y>0)this.velocity.y=Math.min(0,this.velocity.y);break;}safe.copy(p);}}
  if(this.collidesAt(this.position)&&!this.depenetrateV6?.()){this.position.copy(before);this.velocity.set(0,0,0);}return r;
};

/* -------------------------------------------------------------------------- */
/* COMBAT INPUT + RESPONSIVE JAVA COOLDOWN                                    */
/* -------------------------------------------------------------------------- */
const v145CombatAttackBase=CombatSystem.prototype.attack;
CombatSystem.prototype.attack=function(){const now=performance.now();if(now-(this._tapDedupV145||0)<34)return false;this._tapDedupV145=now;const before=this.target?.(),hp=before?.health,ok=v145CombatAttackBase.call(this);this._indicatorKickV145=now;if(ok&&before&&typeof hp==='number'&&before.health<hp)this.game.soundV14?.playEntity?.(before.type,'hurt',{position:before.position,volume:.68});return ok;};
const v145CombatUpdateBase=CombatSystem.prototype.update;
function javaAttackProgressV145(combat){if(typeof combat.cooldownProgressV144==='function')return combat.cooldownProgressV144();if(typeof combat.attackStrengthV144==='function')return combat.attackStrengthV144(.5);const profile=combat.javaSpecV144?.()||combat.javaProfileV144?.()||{speed:4},interval=1/Math.max(.1,profile.speed||4);return clamp(1-((combat.cooldown||0)/interval),0,1);}
CombatSystem.prototype.update=function(dt){v145CombatUpdateBase.call(this,dt);const el=$('javaAttackIndicatorV144')||ensureJavaAttackIndicatorV145();if(!el)return;const strength=javaAttackProgressV145(this),last=this._lastIndicatorV145??-1;if(Math.abs(strength-last)>.012||strength>=.995||strength<=.01){el.style.setProperty('--attack-empty',`${((1-strength)*100).toFixed(1)}%`);el.classList.toggle('ready',strength>=.995);this._lastIndicatorV145=strength;}};
/* Mobile mining/attack control already routes through primaryActionStart; make that Java combat-first explicitly. */
Game.prototype.primaryActionStart=function(){if(!this.running||this.ui?.screen)return;if(this.combat?.target?.()){this.combat.attack();attackSwingController?.trigger?.();this.breaking=false;this.player.breaking=null;this.player.breakProgress=0;return;}this.breaking=true;};
Game.prototype.primaryActionEnd=function(){this.breaking=false;this.player.breaking=null;this.player.breakProgress=0;};
Game.prototype.beginBreak=function(){if(!this.running||this.ui?.screen)return;const target=this.combat?.target?.();if(target){this._studioAttackMode=true;this._studioBreakMode=false;this.combat.attack();attackSwingController?.trigger?.();return;}this._studioAttackMode=false;this._studioBreakMode=true;this.breaking=true;};
Game.prototype.endBreak=function(){this._studioAttackMode=false;this._studioBreakMode=false;this.breaking=false;this.player.breaking=null;this.player.breakProgress=0;targetFeedback?.update?.('',0);};

/* -------------------------------------------------------------------------- */
/* BOOT / FINAL POLICY                                                        */
/* -------------------------------------------------------------------------- */
const v145BootBase=Game.prototype.boot;
Game.prototype.boot=async function(...args){game.menuMusicV145?.stop?.();await v145BootBase.apply(this,args);this.javaAudioV144??=game.javaAudioV144;this.soundV14.editionV145='java-only';this.soundV14.fallbackV145='disabled';ensureJavaAttackIndicatorV145();window.__voxelDiag?.log?.(`V14.5 BOOT ${STUDIO_V14_5.version}: Java-only UI/audio/celestials/core textures/held items + calmer Java passive AI + full movement collision guards + hotbar attack meter active.`,'ok');};
try{
  runtimeCommands.register('java145',()=>({version:STUDIO_V14_5.version,audio:'java-ogg-only',bedrockAudio:false,menu:'java-only',celestials:'java-only',passiveAI:'java-like',audioBuffers:game.javaAudioV144?.buffers?.size||0,collisions:'swept-player + entity depenetration'}),'Inspect V14.5 Java client policy.');
  runtimeCommands.register('javasound',(event='entity.player.attack.weak')=>game.javaAudioV144.playEvent(event,{ui:true,volume:.5}).then(ok=>({ok,event:game.javaAudioV144.catalog.normalize(event),buffers:game.javaAudioV144.buffers.size})),'Play Java OGG sound event.');
}catch{}
window.__voxelDiag?.log?.(`V14.5 READY ${STUDIO_V14_5.version}: selected Java systems no longer fall through to Bedrock runtime paths.`,'ok');
