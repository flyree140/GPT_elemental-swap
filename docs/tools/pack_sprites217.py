#!/usr/bin/env python3
"""Pack equal-size RGBA whole-body PNG frames into the 21.7 hero atlas.
No cropping, skeleton deformation or AI generation occurs. Requires Pillow.
Example: python tools/pack_sprites217.py my_frames --cell 160 144 --anchor 80 130
"""
from __future__ import annotations
import argparse, json, re
from pathlib import Path
from PIL import Image

def natural_key(path: Path):
    return [int(s) if s.isdigit() else s.lower() for s in re.split(r'(\d+)',path.name)]

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('source',type=Path,help='Subfolders idle,walk,run,jump,dash,hurt,recover,light,heavy,spin,cross,cast,swap,bloom')
    p.add_argument('--out',type=Path,default=Path('sprite_export217'))
    p.add_argument('--cell',nargs=2,type=int,default=[160,144])
    p.add_argument('--anchor',nargs=2,type=int,default=[80,130])
    p.add_argument('--columns',type=int,default=8)
    a=p.parse_args(); w,h=a.cell
    if not (1<=a.columns<=32 and 16<=w<=1024 and 16<=h<=1024): p.error('Invalid cell size or column count.')
    required={'idle':8,'walk':8,'run':8,'jump':6,'dash':1,'hurt':4,'recover':6,'light':2,'heavy':4}
    clips={};frames=[]
    folders=sorted([q for q in a.source.iterdir() if q.is_dir()]) if a.source.is_dir() else []
    for folder in folders:
        paths=sorted(folder.glob('*.png'),key=natural_key)
        if not paths: continue
        clips[folder.name]=[]
        for path in paths:
            with Image.open(path) as src:
                if src.size!=(w,h): p.error(f'{path}: expected {w}x{h}, found {src.size}. Export equal-size transparent canvases.')
                im=src.convert('RGBA')
                if im.getchannel('A').getextrema()==(255,255):
                    print(f'WARNING: {path} has no transparent pixels; its background will show.')
                i=len(frames); clips[folder.name].append([(i%a.columns)*w,(i//a.columns)*h,w,h]);frames.append(im.copy())
    for key,count in required.items():
        if len(clips.get(key,[]))<count: p.error(f'{key}/ requires at least {count} PNG frames with current render code.')
    for alias,target in {'cut':'light','cross':'heavy','spin':'heavy','cast':'heavy','swap':'dash','bloom':'cast','shot':'cast','summon':'cast','burst':'bloom','field':'bloom','lift':'jump'}.items():
        if alias not in clips: clips[alias]=clips[target]
    # Retain all names the shipped skills request, rather than silently disappearing.
    manifest_path=Path(__file__).resolve().parents[1]/'js/hero217_manifest.js'
    shipped=json.loads(manifest_path.read_text(encoding='utf-8').split('=',1)[1].strip().rstrip(';'))
    for name in shipped['clips']:
        if name not in clips: clips[name]=clips['cast'];print(f'WARNING: {name} falls back to cast. Author a dedicated clip for production.')
    atlas=Image.new('RGBA',(a.columns*w,((len(frames)+a.columns-1)//a.columns)*h))
    for i,im in enumerate(frames): atlas.alpha_composite(im,((i%a.columns)*w,(i//a.columns)*h))
    a.out.mkdir(parents=True,exist_ok=True);atlas.save(a.out/'hero.png')
    manifest={'version':'21.7.0-custom','source':'User-authored whole-body frames','width':atlas.width,'height':atlas.height,'cell':a.cell,'anchor':a.anchor,'clips':clips}
    (a.out/'hero217_manifest.js').write_text('window.ES217_HERO = '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    (a.out/'INSTRUCTIONS.txt').write_text('Copy hero.png to assets/atlas217/ and hero217_manifest.js to js/.\nSet hero.atlas="assets/atlas217/hero.png", hero.cell and hero.anchor in data/atlas217_config.js.\nBack up originals. Verify F8 and each animation. Rebuild PLAY_OFFLINE.html after testing.\n',encoding='utf-8')
    print(f'Packed {len(frames)} unique frames: {atlas.width}x{atlas.height}; output {a.out}')
if __name__=='__main__': main()
