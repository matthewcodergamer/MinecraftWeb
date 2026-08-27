/* Legacy engine/resource-pack finalizer.
 * V15.7 owns the title/menu DOM. Do NOT rebuild the old V14.8 title here.
 */
try{titlePreviewV8?.dispose?.();titlePreviewV8=null;}catch{}
try{ensureTitleWorldV9?.();}catch{}
try{ensureResourcePackPanelV148?.();ensureHotbarBottomV148?.();}catch{}
window.__voxelDiag?.log?.('LEGACY FINALIZER: engine/resource-pack helpers finalized; obsolete V14.8 title rebuild and duplicate version footer intentionally disabled for V15.7.','ok');
