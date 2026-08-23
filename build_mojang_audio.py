#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, os, shutil, subprocess, sys, tempfile, urllib.request
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
MOJANG = "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/"
SOUNDS_URL = MOJANG + "sounds.json"
DEFS_URL = MOJANG + "sounds/sound_definitions.json"

def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "MinecraftWeb-audio-builder/0.14.2"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "MinecraftWeb-audio-builder/0.14.2"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def merge_block(blocks: dict, name: str, seen=None):
    seen = set() if seen is None else seen
    if not name or name in seen or name not in blocks:
        return {}
    seen.add(name)
    cur = blocks[name] or {}
    base = merge_block(blocks, cur.get("base"), seen) if cur.get("base") else {}
    return {
        "events": {**base.get("events", {}), **cur.get("events", {})},
        "pitch": cur.get("pitch", base.get("pitch", 1)),
        "volume": cur.get("volume", base.get("volume", 1)),
    }

def event_name(entry):
    if isinstance(entry, str):
        return entry
    if isinstance(entry, dict):
        return entry.get("sound")
    return None

def select_events(profile: dict, sounds: dict, defs: dict):
    selected = set(profile.get("event_names", []))
    blocks = sounds.get("block_sounds", {})
    for group in profile.get("block_sound_groups", []):
        merged = merge_block(blocks, group)
        for entry in merged.get("events", {}).values():
            name = event_name(entry)
            if name:
                selected.add(name)
    actions = [a.lower() for a in profile.get("entity_actions", [])]
    for entity in profile.get("entity_types", []):
        token = entity.lower().replace("minecraft:", "")
        for key in defs:
            low = key.lower()
            if token not in low:
                continue
            family_match = low.startswith(f"mob.{token}") or low.startswith(f"entity.{token}") or f".{token}." in low
            action_match = any(a in low for a in actions)
            if family_match and action_match:
                selected.add(key)
    return {e for e in selected if e in defs}

def sound_paths(events: set[str], defs: dict):
    paths: dict[str, set[str]] = {}
    for event in sorted(events):
        definition = defs.get(event) or {}
        for sample in definition.get("sounds", []):
            if isinstance(sample, str):
                path = sample
            elif isinstance(sample, dict):
                path = sample.get("name", "")
            else:
                continue
            path = str(path).removesuffix(".fsb")
            if path:
                paths.setdefault(path, set()).add(event)
    return paths

def ffmpeg_convert(src: Path, dst: Path, quality: int):
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-map", "0:a:0", "-ac", "2", "-ar", "44100", "-c:a", "libmp3lame", "-q:a", str(quality), str(dst)]
    subprocess.run(cmd, check=True)

def main():
    ap = argparse.ArgumentParser(description="Build browser-ready audio from Mojang Bedrock FSB samples.")
    ap.add_argument("--profile", default=str(ROOT / "config/audio-profile.json"))
    ap.add_argument("--output", default=str(ROOT / "assets/audio"))
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--strict", action="store_true", help="Return non-zero if any referenced Mojang asset cannot be converted. The default keeps the valid cache and records failures in the manifest.")
    args = ap.parse_args()
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is required (the FSB demuxer must be enabled).")
    profile = json.loads(Path(args.profile).read_text("utf-8"))
    output = Path(args.output)
    generated = output / "generated"
    generated.mkdir(parents=True, exist_ok=True)
    print("Fetching Mojang sounds.json and sound_definitions.json…")
    sounds, raw_defs = fetch_json(SOUNDS_URL), fetch_json(DEFS_URL)
    defs = raw_defs.get("sound_definitions", {})
    events = select_events(profile, sounds, defs)
    paths = sound_paths(events, defs)
    max_assets = int(profile.get("max_assets", 420))
    if len(paths) > max_assets:
        raise SystemExit(f"Selected {len(paths)} audio assets, above max_assets={max_assets}. Adjust config/audio-profile.json deliberately.")
    quality = int(profile.get("mp3_quality", 4))
    manifest_paths = {}
    failures = []
    with tempfile.TemporaryDirectory(prefix="mc-audio-") as td:
        temp = Path(td)
        total = len(paths)
        for i, (path, used_by) in enumerate(sorted(paths.items()), 1):
            dst_rel = Path("generated") / f"{path}.mp3"
            dst = output / dst_rel
            manifest_paths[path] = {"url": "./assets/audio/" + dst_rel.as_posix(), "events": sorted(used_by)}
            if dst.exists() and dst.stat().st_size > 64 and not args.force:
                print(f"[{i}/{total}] cached {path}")
                continue
            url = MOJANG + path + ".fsb"
            src = temp / (path.replace("/", "__") + ".fsb")
            try:
                print(f"[{i}/{total}] {path}")
                src.write_bytes(fetch_bytes(url))
                ffmpeg_convert(src, dst, quality)
            except Exception as e:
                failures.append({"path": path, "url": url, "error": str(e), "events": sorted(used_by)})
                manifest_paths.pop(path, None)
                print(f"  FAILED: {e}", file=sys.stderr)
    manifest = {
        "format": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "Mojang/bedrock-samples",
        "sound_definitions": DEFS_URL,
        "sounds": SOUNDS_URL,
        "events": sorted(events),
        "definitions": {event: defs[event] for event in sorted(events) if event in defs},
        "block_sounds": sounds.get("block_sounds", {}),
        "paths": manifest_paths,
        "failures": failures,
        "fallback_audio": False,
    }
    (output / "mojang-audio-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", "utf-8")
    print(f"Done: {len(manifest_paths)} browser-ready Mojang assets, {len(failures)} failures.")
    if failures:
        print(f"WARNING: {len(failures)} referenced Mojang assets were unavailable/undecodable; they remain silent at runtime and are listed in the manifest.", file=sys.stderr)
    return 1 if (args.strict and failures) else 0

if __name__ == "__main__":
    raise SystemExit(main())
