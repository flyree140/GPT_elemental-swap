#!/usr/bin/env python3
"""Build the same V19 source as a standalone HTML and an optional Pages ZIP.
Only Python's standard library is required. No test storage shim is included.
"""
from __future__ import annotations
import argparse, base64, hashlib, json, re, shutil, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def standalone(root: Path=ROOT) -> dict:
    source=(root/'index.html').read_text(encoding='utf-8')
    uris={p.relative_to(root).as_posix():'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode('ascii') for p in sorted((root/'assets').rglob('*.png'))}
    for src in re.findall(r'<link rel="stylesheet" href="([^"]+)">',source):
        text=(root/src).read_text(encoding='utf-8')
        source=source.replace(f'<link rel="stylesheet" href="{src}">','<style>\n'+text+'\n</style>')
    source=source.replace('<script src="js/world.js"></script>','<script>window.ES9_ASSET_URIS='+json.dumps(uris,separators=(',',':'))+';</script>\n<script src="js/world.js"></script>')
    for src in re.findall(r'<script src="(js/[^"]+)"></script>',source):
        text=(root/src).read_text(encoding='utf-8').replace('</script','<\\/script')
        source=source.replace(f'<script src="{src}"></script>','<script>\n'+text+'\n</script>')
    for rel,uri in uris.items():source=source.replace(f'src="{rel}"',f'src="{uri}"')
    if '__testStore19' in source or '__store18' in source or 'Object.defineProperty(window,"localStorage"' in source:
        raise ValueError('Test storage shim must never be included in the release')
    dest=root/'PLAY_OFFLINE.html';dest.write_text(source,encoding='utf-8')
    return {'embeddedPng':len(uris),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}

def pack(root: Path=ROOT, output: Path|None=None) -> dict:
    output=output or root.parent/'ESV19_GITHUB_READY.zip'
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(root.rglob('*')):
            if not p.is_file() or any(x in p.parts for x in ['__pycache__','.git','node_modules']):continue
            if p.suffix.lower() in ['.zip','.pyc','.ttf','.otf','.ttc','.woff','.woff2']:continue
            z.write(p,p.relative_to(root).as_posix())
    with zipfile.ZipFile(output) as z:
        assert z.testzip() is None,'Corrupt ZIP'
        for path in ['index.html','PLAY_OFFLINE.html','js/renewal_world.js','js/renewal_combat.js','js/frontier_release.js','frontier.css','GUIDE_V19.md','.nojekyll']:
            assert path in z.namelist(),f'Missing {path}'
        count=len(z.namelist())
    solo=root.parent/'ESV19_PLAY.html';shutil.copy2(root/'PLAY_OFFLINE.html',solo)
    return {'zipFiles':count,'CRC':'PASS','files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [output,solo]}}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--pack',action='store_true',help='Also create ESV19_GITHUB_READY.zip and ESV19_PLAY.html beside this project');args=parser.parse_args()
    report={'standalone':standalone()}
    if args.pack:report['release']=pack()
    print(json.dumps(report,ensure_ascii=False,indent=2))
