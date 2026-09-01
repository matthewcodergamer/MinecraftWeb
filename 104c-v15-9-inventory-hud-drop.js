/* Minecraft Web V15.9 — drag-out item dropping, rapid Java Q drop and oxygen HUD placement. */
(function(){
  const $=id=>document.getElementById(id);
  const style=document.createElement('style');style.id='v159InventoryHudStyle';style.textContent=`
    #survivalBars #oxygenBarV8{position:absolute!important;left:calc(50% + 4px)!important;right:0!important;bottom:31px!important;transform:none!important;width:calc(50% - 4px)!important;height:12px!important;display:none;justify-content:flex-end!important;align-items:center!important;gap:0!important;z-index:25!important}
    #survivalBars #oxygenBarV8[style*="display: flex"]{display:flex!important}#survivalBars .oxygenBubbleV8{width:11px!important;height:11px!important}
    #dropBtnV159{right:152px;bottom:72px;width:56px;height:56px;font:900 17px/1 'Minecraft Seven','Courier New',monospace}
    #dropBtnV159::after{content:'DROP';position:absolute;top:58px;left:50%;transform:translateX(-50%);font:8px/1 'Minecraft Seven','Courier New',monospace;color:#fff;text-shadow:1px 1px #000;opacity:.7;pointer-events:none}
    @media(orientation:landscape) and (max-height:520px){#dropBtnV159{right:150px;bottom:66px;width:52px;height:52px}#dropBtnV159::after{top:53px}}@media(hover:hover) and (pointer:fine){#dropBtnV159{display:none!important}}
  `;document.head.appendChild(style);

  if(typeof InventoryTransactionEngine!=='undefined'){
    InventoryTransactionEngine.prototype.end=function(e){
      if(!this.drag||e.pointerId!==this.drag.pointerId)return;e.preventDefault();const drag=this.drag;this.drag=null;this.hideGhost();
      const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-slot]');if(target&&this.game.ui.screen){this.dropIntoSlot(drag,target.dataset.slot);return}
      if(drag.moved){const before=this.game.drops?.items?.length||0;this.dropIntoWorld(drag.stack);const after=this.game.drops?.items?.length||0;if(after>before)this.takeFromSource(drag.slot,drag.stack.count);else v15ShowToast?.('Too many dropped items nearby.');return}
      this.game.ui.clickSlot?.(drag.slot);
    };
  }
  if(typeof inventoryTransactions!=='undefined'&&!window.__v159InventoryWindowRouting){
    window.__v159InventoryWindowRouting=true;addEventListener('pointermove',e=>{if(inventoryTransactions.drag)inventoryTransactions.move(e)},{capture:true,passive:false});addEventListener('pointerup',e=>{if(inventoryTransactions.drag)inventoryTransactions.end(e)},{capture:true,passive:false});addEventListener('pointercancel',e=>{if(inventoryTransactions.drag)inventoryTransactions.cancel(e)},{capture:true,passive:false});
  }

  if(typeof dropSelectedOneV13==='function'){
    dropSelectedOneV13=function(forceCount=0){
      if(!game?.running||game.ui?.screen||!game.player||!game.drops)return false;const s=game.selectedStack?.();if(!s||s.empty?.()||s.count<=0)return false;
      const ctrl=!!(game.input?.keys?.has?.('ControlLeft')||game.input?.keys?.has?.('ControlRight')||game.input?.keys?.has?.('MetaLeft')||game.input?.keys?.has?.('MetaRight'));const amount=Math.max(1,Math.min(s.count,forceCount>0?forceCount:(ctrl?s.count:1))),id=s.id;
      const origin=game.player.eyePosition(),dir=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(game.player.pitch,game.player.yaw,0,'YXZ')).normalize(),pos=origin.clone().addScaledVector(dir,.72);pos.y-=.22;
      const before=game.drops.items?.length||0;game.drops.spawn(id,amount,pos);if((game.drops.items?.length||0)<=before){v15ShowToast?.('Too many dropped items nearby.');return false}const d=game.drops.items?.at?.(-1);if(d){d.velocity?.set?.(dir.x*3.55,2.05+dir.y*.5,dir.z*3.55);d.pickupDelay=.85}
      if(game.mode!=='creative'){s.count-=amount;s.normalize?.();if(s.count<=0)game.inventory.slots[game.inventory.selected]=new ItemStack()}game.refreshHotbar();game.saveSoon();game.soundV9?.play?.('random.pop',{position:game.player.position,volume:.12,pitch:.84,temporaryClick:true});return true;
    };
  }
  function ensureDropButton(){
    const controls=$('mobileControls');if(!controls||$('dropBtnV159'))return;const b=document.createElement('button');b.id='dropBtnV159';b.className='actionBtn';b.type='button';b.textContent='Q';b.setAttribute('aria-label','Drop selected item. Hold to drop repeatedly.');controls.appendChild(b);
    let timer=0,delay=0;const stop=e=>{e?.preventDefault?.();clearTimeout(delay);clearInterval(timer);delay=timer=0;b.classList.remove('pressed')};const start=e=>{e.preventDefault();e.stopPropagation();if(!game?.running||game.ui?.screen)return;b.classList.add('pressed');dropSelectedOneV13?.(1);try{b.setPointerCapture?.(e.pointerId)}catch{}delay=setTimeout(()=>{timer=setInterval(()=>dropSelectedOneV13?.(1),105)},260)};
    b.addEventListener('pointerdown',start,{passive:false});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,stop,{passive:false});
  }
  function relocateOxygen(){const o=$('oxygenBarV8'),bars=$('survivalBars');if(o&&bars&&o.parentElement!==bars)bars.appendChild(o)}
  window.ensureDropButtonV159=ensureDropButton;window.relocateOxygenV159=relocateOxygen;ensureDropButton();relocateOxygen();setTimeout(relocateOxygen,300);
})();
