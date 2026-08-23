from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARTS = [
    "00-engine-core.js",
    "10-studio-v6.js",
    "20-studio-v7.js",
    "30-studio-v8.js",
    "40-studio-v9.js",
    "50-studio-v10.js",
    "60-studio-v11.js",
    "70-studio-v12.js",
    "80-studio-v13.js",
    "81-v13-1-hotfix.js",
    "82-v13-1-1-responsive-title.js",
    "83-v13-2-antialiasing.js",
    "90-v14-frustum-culling.js",
    "91-v14-1-bedrock-behavior.js",
    "92-v14-2-bedrock-audio.js",
    "93-v14-3-physics-entity-world-polish.js",
    "99-finalize.js",
]

source = "".join((ROOT / "src" / "parts" / name).read_text(encoding="utf-8") for name in PARTS)
(ROOT / "js" / "game.js").write_text(source, encoding="utf-8")
(ROOT / "game.js").write_text(source, encoding="utf-8")
print(f"Built game.js + js/game.js from {len(PARTS)} source parts ({len(source):,} characters).")
