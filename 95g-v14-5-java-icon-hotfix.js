/* V14.5 Java icon hotfix: these Java items render through block/entity models and do not have flat Prismarine items/*.png exports. */
const JAVA_SPECIAL_ICON_V145=new Map([
  [ITEM.TORCH,`${JAVA_ASSET_ROOT_V145}blocks/torch.png`],
  [V8_ITEM.WHITE_WOOL,`${JAVA_ASSET_ROOT_V145}blocks/white_wool.png`],
  [V8_ITEM.SHIELD,`${JAVA_ASSET_ROOT_V145}entity/shield_base.png`]
]);
const v145IconSpecialBase=Game.prototype.iconFor;
Game.prototype.iconFor=function(id){return JAVA_SPECIAL_ICON_V145.get(id)||v145IconSpecialBase.call(this,id);};
const v145SlotSpecialBase=UI.prototype.slotHtml;
UI.prototype.slotHtml=function(prefix,s,i=-1){
  if(!s||s.empty?.())return v145SlotSpecialBase.call(this,prefix,s,i);
  const special=JAVA_SPECIAL_ICON_V145.get(s.id);if(!special)return v145SlotSpecialBase.call(this,prefix,s,i);
  const label=ITEM_NAME.get(s.id)||BLOCK_NAME?.[s.id]||'';
  return `<div class="inv-slot" data-slot="${prefix}" title="${label}"><img class="item-icon javaItemIconV145" src="${special}" alt="${label}">${s.count>1?`<span class="stack-count">${s.count}</span>`:''}</div>`;
};
window.__voxelDiag?.log?.('V14.5 JAVA ICON HOTFIX: torch, white wool and shield now use their real Java block/entity textures.','ok');
