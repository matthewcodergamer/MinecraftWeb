const SOURCE_PARTS = [
  '00-engine-core.js',
  '10-studio-v6.js',
  '20-studio-v7.js',
  '30-studio-v8.js',
  '40-studio-v9.js',
  '50-studio-v10.js',
  '60-studio-v11.js',
  '70-studio-v12.js',
  '80-studio-v13.js',
  '81-v13-1-hotfix.js',
  '82-v13-1-1-responsive-title.js',
  '83-v13-2-antialiasing.js',
  '90-v14-frustum-culling.js',
  '91-v14-1-bedrock-behavior.js',
  '92-v14-2-bedrock-audio.js',
  '93-v14-3-physics-entity-world-polish.js',
  '94a-v14-4-java-data-assets.js',
  '94b-v14-4-java-combat-hud.js',
  '94c-v14-4-java-ui-runtime.js',
  '95a-v14-5-java-assets-render.js',
  '95b-v14-5-java-ui.js',
  '95c-v14-5-java-audio.js',
  '95d-v14-5-java-celestials.js',
  '95e-v14-5-java-passive-ai.js',
  '95f-v14-5-java-collision-combat.js',
  '95g-v14-5-java-icon-hotfix.js',
  '99-finalize.js'
];

async function fetchPart(name) {
  const candidates = [`./${name}`, `./src/parts/${name}`];
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Unable to load ${name}: ${lastError?.message || 'unknown error'}`);
}

async function bootMinecraftFromParts() {
  const loadingText = document.getElementById('loadingText');
  try {
    if (loadingText) loadingText.textContent = 'Loading Java Edition engine…';
    const parts = [];
    for (let i = 0; i < SOURCE_PARTS.length; i++) {
      if (loadingText) loadingText.textContent = `Loading Java engine ${i + 1}/${SOURCE_PARTS.length}…`;
      parts.push(await fetchPart(SOURCE_PARTS[i]));
    }
    const source = `${parts.join('\n\n')}\n//# sourceURL=minecraft-v14-5-java-runtime.js`;
    const blob = new Blob([source], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    try {
      await import(url);
      window.__MC_RUNTIME_READY__ = true;
      if (window.__MC_BOOT_WATCHDOG__) clearTimeout(window.__MC_BOOT_WATCHDOG__);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch (error) {
    console.error('[V14.5 JAVA BOOT]', error);
    if (loadingText) loadingText.textContent = `Engine failed: ${error.message}`;
    document.getElementById('loading')?.classList?.add('show');
  }
}

bootMinecraftFromParts();
