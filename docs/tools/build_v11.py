"""No build step for players: generates an offline HTML and a root-index Pages ZIP.
Run from any directory: python tools/build_v11.py
"""
from pathlib import Path
import base64,json,re,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
def standalone():
 html=(ROOT/'index.html').read_text(encoding='utf-8')
 assets={p.relative_to(ROOT).as_posix():'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode('ascii') for p in (ROOT/'assets').rglob('*.png')}
 html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(ROOT/'styles.css').read_text()+'\n</style>')
 html=html.replace('<script src="js/world.js"></script>','<script>window.ES9_ASSET_URIS='+json.dumps(assets,separators=(',',':'))+';</script>\n<script src="js/world.js"></script>')
 for script in re.findall(r'<script src="(js/[^\"]+)"></script>',html):
  text=(ROOT/script).read_text(encoding='utf-8').replace('</script','<\\/script')
  html=html.replace(f'<script src="{script}"></script>','<script>\n'+text+'\n</script>')
 for rel,uri in assets.items():html=html.replace(f'src="{rel}"',f'src="{uri}"')
 (ROOT/'PLAY_OFFLINE.html').write_text(html,encoding='utf-8')
 return {'pngs':len(assets),'bytes':len(html.encode())}
def pack():
 out=ROOT.parent/'ESV11_GITHUB_READY.zip'
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(ROOT.rglob('*')):
   if not p.is_file() or '__pycache__' in p.parts or p.name.startswith('.') and p.name!='.nojekyll':continue
   # Browser logs, source maps, assets and current reports included; no test saves.
   if p.name.startswith('temp_') or p.suffix in ['.pyc','.zip']:continue
   z.write(p,p.relative_to(ROOT))
 with zipfile.ZipFile(out) as z:assert z.testzip() is None;assert 'index.html' in z.namelist();count=len(z.namelist())
 solo=ROOT.parent/'ESV11_PLAY.html';solo.write_bytes((ROOT/'PLAY_OFFLINE.html').read_bytes())
 hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [out,solo]}
 (ROOT.parent/'ESV11_SHA256.txt').write_text('\n'.join(f'{v}  {k}' for k,v in hashes.items())+'\n')
 return {'zip':str(out),'files':count,'hashes':hashes}
if __name__=='__main__':print(standalone());print(pack())
