
/* Java attack-speed/cooldown semantics for the items already present in this game. Values are total player attack damage and Java-style attacks/second. */
const JAVA_COMBAT_V144=new Map([
  [ITEM.WOOD_SWORD,{damage:4,speed:1.6}],[ITEM.STONE_SWORD,{damage:5,speed:1.6}],[ITEM.IRON_SWORD,{damage:6,speed:1.6}],[ITEM.DIAMOND_SWORD,{damage:7,speed:1.6}],
  [ITEM.WOOD_AXE,{damage:7,speed:.8}],[ITEM.STONE_AXE,{damage:9,speed:.8}],[ITEM.IRON_AXE,{damage:9,speed:.9}],[ITEM.DIAMOND_AXE,{damage:9,speed:1.0}],
  [ITEM.WOOD_PICKAXE,{damage:3,speed:1.2}],[ITEM.STONE_PICKAXE,{damage:4,speed:1.2}],[ITEM.IRON_PICKAXE,{damage:4,speed:1.2}],[ITEM.DIAMOND_PICKAXE,{damage:5,speed:1.2}],
]);
function javaCombatSpecV144(id){return JAVA_COMBAT_V144.get(id)||{damage:1,speed:4};}
if(typeof CombatSystem!=='undefined'){
  CombatSystem.prototype.javaSpecV144=function(){return javaCombatSpecV144(this.game.selectedStack?.()?.id||ITEM.AIR);};
  CombatSystem.prototype.cooldownProgressV144=function(){const spec=this.javaSpecV144(),interval=1/Math.max(.1,spec.speed);return clamp(1-(this.cooldown/interval),0,1);};
  CombatSystem.prototype.attack=function(){
    if(!this.game.running)return false;const mob=this.target();if(!mob)return false;
    const spec=this.javaSpecV144(),interval=1/Math.max(.1,spec.speed),strength=clamp(1-(this.cooldown/interval),0,1),scale=.2+strength*strength*.8,damage=Math.max(.2,spec.damage*scale);
    mob.health=Math.max(0,mob.health-damage);mob.hitFlash=.12;
    const f=this.direction(),kb=.45+strength*1.65;mob.velocity.y=Math.max(mob.velocity.y,.45+strength*1.75);mob.velocity.x+=f.x*kb;mob.velocity.z+=f.z*kb;
    this.attackInterval=interval;this.damage=spec.damage;this.cooldown=interval;this.lastTarget=mob;this.lastAttackTime=performance.now();this.lastStrengthV144=strength;this.lastDamageV144=damage;this.flashTimer=.10;
    damageVignette.style.background='radial-gradient(circle,transparent 58%,rgba(255,255,255,.28))';damageVignette.style.opacity='.35';setTimeout(()=>{damageVignette.style.opacity='0';damageVignette.style.background='radial-gradient(circle,transparent 35%,rgba(180,0,0,.65))';},90);
    const event=strength>.9?'game.player.attack.strong':'game.player.attack.weak';this.game.soundV14?.playEvent?.(event,{position:this.game.player.position,volume:.20}).catch?.(()=>{});
    return true;
  };
}

class JavaHudV144{
  constructor(gameRef){this.game=gameRef;this.root=null;this.fill=null;this.full=null;}
  install(){
    const cross=$('crosshair');if(!cross)return;
    cross.style.backgroundImage=`url("${javaAssetsV144.hud('crosshair')}")`;cross.style.backgroundSize='contain';cross.style.backgroundRepeat='no-repeat';cross.style.backgroundPosition='center';cross.classList.add('javaCrosshairV144');
    let root=$('javaAttackIndicatorV144');if(!root){root=document.createElement('div');root.id='javaAttackIndicatorV144';root.innerHTML=`<img class="javaAttackBgV144" src="${javaAssetsV144.hud('crosshair_attack_indicator_background')}" alt=""><span class="javaAttackClipV144"><img src="${javaAssetsV144.hud('crosshair_attack_indicator_progress')}" alt=""></span><img class="javaAttackFullV144" src="${javaAssetsV144.hud('crosshair_attack_indicator_full')}" alt="">`;document.getElementById('hud')?.appendChild(root);}this.root=root;this.fill=root.querySelector('.javaAttackClipV144');this.full=root.querySelector('.javaAttackFullV144');
  }
  update(){if(!this.root)this.install();if(!this.root||!this.game.running){if(this.root)this.root.style.display='none';return;}const p=this.game.combat?.cooldownProgressV144?.()??1;this.root.style.display='block';this.root.style.setProperty('--attack-progress',String(p));this.root.style.setProperty('--attack-empty',`${(1-p)*100}%`);this.root.classList.toggle('full',p>=.985);}
}



/* Java Edition HUD sprites: hearts, hunger, armor, experience and hotbar all use the Java 1.21.8 extracted GUI artwork. */
function javaHudImgV144(path,cls='javaHudSpriteV144'){return `<img class="${cls}" src="${javaAssetsV144.hud(path)}" alt="">`;}
const v144SurvivalBarsBase=renderSurvivalBarsV6;
renderSurvivalBarsV6=function(player,mode){
  v144SurvivalBarsBase(player,mode);
  if(!player||mode==='creative')return;
  const hp=clamp(Math.round(Number(player.health)||0),0,20),food=clamp(Math.round(Number(player.hunger)||0),0,20),heartBar=$('heartBar'),hungerBar=$('hungerBar');
  if(heartBar){let html='';for(let i=0;i<10;i++){const v=hp-i*2,name=v>=2?'heart/full':v===1?'heart/half':'heart/container';html+=javaHudImgV144(name);}heartBar.innerHTML=html;}
  if(hungerBar){let html='';for(let i=0;i<10;i++){const v=food-i*2,name=v>=2?'food_full':v===1?'food_half':'food_empty';html+=javaHudImgV144(name);}hungerBar.innerHTML=html;}
  const armor=$('armorBarV13');if(armor){const points=clamp(Math.round(Number(player.armorPointsV13)||0),0,20);let html='';for(let i=0;i<10;i++){const v=points-i*2,name=v>=2?'armor_full':v===1?'armor_half':'armor_empty';html+=`<span class="armorUnitV13 javaArmorUnitV144">${javaHudImgV144(name)}</span>`;}armor.innerHTML=html;armor.dataset.sig=`java:${mode}:${points}`;}
  const xpEmpty=$('xpEmptyV12'),xpFull=$('xpFullV12');if(xpEmpty&&!xpEmpty.dataset.java144){xpEmpty.dataset.java144='1';xpEmpty.src=javaAssetsV144.hud('experience_bar_background');}if(xpFull&&!xpFull.dataset.java144){xpFull.dataset.java144='1';xpFull.src=javaAssetsV144.hud('experience_bar_progress');}
};

/* Java hotbar frame/selection are supplied by minecraft-assets while the existing slot DOM keeps all touch/click behavior. */
function installJavaHotbarV144(){const bar=$('hotbar');if(!bar)return;bar.classList.add('javaHotbarV144');}
installJavaHotbarV144();
