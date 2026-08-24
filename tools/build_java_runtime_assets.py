#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, urllib.request
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
UA={"User-Agent":"MinecraftWeb-JavaRuntimeBuilder/0.14.5"}

def get(url:str)->bytes:
    req=urllib.request.Request(url,headers=UA)
    with urllib.request.urlopen(req,timeout=60) as r:return r.read()

def save(url:str,path:Path):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(get(url))

def choose(defs,event,seen=None):
    seen=set() if seen is None else seen
    if event in seen:return set()
    seen.add(event);out=set();d=defs.get(event) or {}
    for s in d.get("sounds",[]):
        if isinstance(s,str):out.add(s);continue
        if not isinstance(s,dict):continue
        name=str(s.get("name") or "")
        if not name:continue
        if s.get("type")=="event":out|=choose(defs,name.replace("/","."),seen)
        else:out.add(name)
    return out

def main():
    ap=argparse.ArgumentParser(description="Cache the Java Edition UI/environment/data/sounds used by Minecraft Web.")
    ap.add_argument("--profile",default=str(ROOT/"config/java-runtime-profile.json"))
    ap.add_argument("--output",default=str(ROOT/"assets/java"))
    ap.add_argument("--strict",action="store_true")
    args=ap.parse_args();profile=json.loads(Path(args.profile).read_text("utf-8"));version=profile.get("java_version","1.21.8");out=Path(args.output)
    prism=f"https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/{version}/"
    data_repo='https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/'
    try:
        data_paths=json.loads(get(data_repo+'dataPaths.json').decode('utf-8')).get('pc',{}).get(version,{})
    except Exception:
        data_paths={}
    java_root=f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/{version}/assets/minecraft/"
    failures=[];copied=[]
    for rel in profile.get("ui_assets",[])+profile.get("entity_textures",[])+profile.get("block_textures",[])+profile.get("item_textures",[]):
        try:save(prism+rel,out/rel);copied.append(rel);print("asset",rel)
        except Exception as e:failures.append({"kind":"asset","path":rel,"error":str(e)});print("FAILED asset",rel,e)
    for name in profile.get("data_files",[]):
        category=Path(name).stem; directory=data_paths.get(category)
        url=(data_repo+str(directory).rstrip('/')+'/'+name) if directory else (data_repo+f'pc/{version}/'+name)
        try:save(url,out/"data"/name);copied.append("data/"+name);print("data",name,url)
        except Exception as e:failures.append({"kind":"data","path":name,"url":url,"error":str(e)});print("FAILED data",name,e)
    try:
        raw=get(java_root+"sounds.json");(out/"sounds.json").write_bytes(raw);defs=json.loads(raw.decode("utf-8"));copied.append("sounds.json")
    except Exception as e:
        defs={};failures.append({"kind":"sound-catalog","path":"sounds.json","error":str(e)})
    events=set(profile.get("sound_events",[]))
    for group in profile.get("block_sound_groups",[]):
        for action in profile.get("block_sound_actions",[]):events.add(f"block.{group}.{action}")
    for entity in profile.get("entity_types",[]):
        for action in profile.get("entity_actions",[]):events.add(f"entity.{entity}.{action}")
    sound_paths=set()
    for event in sorted(events):sound_paths|=choose(defs,event)
    for name in sorted(sound_paths):
        rel=f"sounds/{name}.ogg"
        try:save(java_root+rel,out/rel);copied.append(rel);print("sound",name)
        except Exception as e:failures.append({"kind":"sound","path":name,"event_candidates":[ev for ev in sorted(events) if name in choose(defs,ev)],"error":str(e)});print("FAILED sound",name,e)
    manifest={"format":1,"generated_at":datetime.now(timezone.utc).isoformat(),"java_version":version,"sources":{"assets":"PrismarineJS/minecraft-assets","data":"PrismarineJS/minecraft-data","sounds":"InventivetalentDev/minecraft-assets"},"files":sorted(copied),"events":sorted(events),"sound_paths":sorted(sound_paths),"failures":failures}
    out.mkdir(parents=True,exist_ok=True);(out/"java-runtime-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n","utf-8")
    print(f"Built {len(copied)} Java runtime files; {len(failures)} failures recorded.")
    return 1 if args.strict and failures else 0

if __name__=="__main__":raise SystemExit(main())
