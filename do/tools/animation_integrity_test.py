#!/usr/bin/env python3
"""Validate that every humanoid animation frame contains a complete body silhouette."""
from pathlib import Path
from PIL import Image
import json

ROOT=Path(__file__).resolve().parents[1]
classes=['rift','summoner','artificer','gunner','warden','chrono','harrier']
FW,FH,COLS,ROWS=48,52,8,16
results={}
ok=True
for cls in classes:
    p=ROOT/'assets'/'sprites'/f'player_{cls}.png'
    im=Image.open(p).convert('RGBA')
    entry={'size':list(im.size),'frames':0,'badFrames':[]}
    if im.size!=(FW*COLS,FH*ROWS):
        entry['badSize']=True;ok=False
    for row in range(13):  # gameplay animation rows through recover
        for col in range(COLS):
            fr=im.crop((col*FW,row*FH,(col+1)*FW,(row+1)*FH))
            alpha=fr.getchannel('A')
            bbox=alpha.getbbox()
            entry['frames']+=1
            if not bbox:
                entry['badFrames'].append([row,col,'empty']);ok=False;continue
            width=bbox[2]-bbox[0]; height=bbox[3]-bbox[1]
            if row==11:  # down animation is intentionally horizontal near the floor
                if width<25 or height<12:
                    entry['badFrames'].append([row,col,{'bbox':bbox,'reason':'down silhouette too small'}]);ok=False
            else:
                # Standing/air/attack/recover frames must contain upper and lower body in the same frame.
                upper=alpha.crop((0,0,FW,29)).getbbox()
                lower=alpha.crop((0,23,FW,FH)).getbbox()
                if not upper or not lower or height<31:
                    entry['badFrames'].append([row,col,{'bbox':bbox,'upper':bool(upper),'lower':bool(lower)}]);ok=False
    results[cls]=entry
out={'ok':ok,'frameSize':[FW,FH],'classes':results}
(ROOT/'animation_integrity_test.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
raise SystemExit(0 if ok else 1)
