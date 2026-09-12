from pathlib import Path
import base64,json,re,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
def standalone():
 html=(ROOT/'index.html').read_text(encoding='utf-8')
 assets={p.relative_to(ROOT).as_posix():'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets').rglob('*.png')}
 for src in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
  html=html.replace(f'<link rel="stylesheet" href="{src}">','<style>\n'+(ROOT/src).read_text()+'\n</style>')
 html=html.replace('<script src="js/world.js"></script>','<script>window.ES9_ASSET_URIS='+json.dumps(assets,separators=(',',':'))+';</script>\n<script src="js/world.js"></script>')
 for src in re.findall(r'<script src="(js/[^"]+)"></script>',html):
  text=(ROOT/src).read_text(encoding='utf-8').replace('</script','<\\/script')
  html=html.replace(f'<script src="{src}"></script>','<script>\n'+text+'\n</script>')
 for rel,uri in assets.items(): html=html.replace(f'src="{rel}"',f'src="{uri}"')
 (ROOT/'PLAY_OFFLINE.html').write_text(html,encoding='utf-8')
 return {'images':len(assets),'bytes':len(html.encode())}
def pack():
 out=ROOT.parent/'ESV16_GITHUB_READY.zip'
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(ROOT.rglob('*')):
   if not p.is_file() or '__pycache__' in p.parts or p.suffix in ('.pyc','.zip','.ttf','.otf','.ttc'):continue
   if p.name.startswith('.') and p.name!='.nojekyll':continue
   z.write(p,p.relative_to(ROOT))
 with zipfile.ZipFile(out) as z:assert z.testzip() is None;assert 'index.html' in z.namelist();count=len(z.namelist())
 solo=ROOT.parent/'ESV16_PLAY.html';solo.write_bytes((ROOT/'PLAY_OFFLINE.html').read_bytes())
 data={'zipFiles':count,'CRC':'PASS','files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in [out,solo]}}
 (ROOT.parent/'ESV16_RELEASE_CHECK.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
 return data
if __name__=='__main__': print(standalone()); print(pack())
