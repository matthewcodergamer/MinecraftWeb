#!/usr/bin/env python3
import pathlib, shutil, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'vendor'/'prismarine-minecraft-assets'
DEST=ROOT/'assets'/'java'/'26.1'
REPO='https://github.com/PrismarineJS/minecraft-assets.git'
if not SRC.exists(): subprocess.check_call(['git','clone','--depth','1','--filter=blob:none','--sparse',REPO,str(SRC)])
subprocess.check_call(['git','-C',str(SRC),'sparse-checkout','set','data/26.1'])
subprocess.check_call(['git','-C',str(SRC),'pull','--ff-only'])
src=SRC/'data'/'26.1'
if not src.exists(): raise SystemExit('PrismarineJS minecraft-assets does not currently expose data/26.1 on the checked branch.')
if DEST.exists(): shutil.rmtree(DEST)
shutil.copytree(src,DEST)
print('Synced complete PrismarineJS tree',src,'->',DEST)
