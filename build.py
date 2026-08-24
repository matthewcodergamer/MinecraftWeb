from pathlib import Path
ROOT=Path(__file__).resolve().parent
PARTS=[
"00-engine-core.js","10-studio-v6.js","20-studio-v7.js","30-studio-v8.js","40-studio-v9.js","50-studio-v10.js","60-studio-v11.js","70-studio-v12.js","80-studio-v13.js","81-v13-1-hotfix.js","82-v13-1-1-responsive-title.js","83-v13-2-antialiasing.js","90-v14-frustum-culling.js","91-v14-1-bedrock-behavior.js","92-v14-2-bedrock-audio.js","93-v14-3-physics-entity-world-polish.js","94a-v14-4-java-data-assets.js","94b-v14-4-java-combat-hud.js","94c-v14-4-java-ui-runtime.js","95a-v14-5-java-assets-render.js","95b-v14-5-java-ui.js","95c-v14-5-java-audio.js","95d-v14-5-java-celestials.js","95e-v14-5-java-passive-ai.js","95f-v14-5-java-collision-combat.js","95g-v14-5-java-icon-hotfix.js","96a-v14-6-render-sections.js","96b-v14-6-scheduling-entities.js","96c-v14-6-performance-governor.js","97a-v14-7-render-ui.js","97b-v14-7-items-audio.js","97c-v14-7-animation-collision.js","97d-v14-7-fidelity-hotfix.js","99-finalize.js"]
def resolve_part(name):
    for path in (ROOT/name,ROOT/'src'/'parts'/name):
        if path.exists(): return path
    raise FileNotFoundError(f'Missing source part: {name}')
source='\n\n'.join(resolve_part(n).read_text(encoding='utf-8') for n in PARTS)
(ROOT/'game.js').write_text(source,encoding='utf-8')
js=ROOT/'js'
if js.exists():(js/'game.js').write_text(source,encoding='utf-8')
print(f'Built V14.7 game.js from {len(PARTS)} source parts ({len(source):,} characters).')
