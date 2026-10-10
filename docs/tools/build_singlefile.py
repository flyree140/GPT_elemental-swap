"""Build a genuinely self-contained offline HTML from the same release sources.
Pillow is optional. When present, lossless WebP reduces image payload size without
changing decoded pixels. No remote URL or fetch is used in the resulting game.
"""
from pathlib import Path
import argparse, base64, json, re, mimetypes, io
from concurrent.futures import ThreadPoolExecutor
R=Path(__file__).resolve().parents[1]
try:
 from PIL import Image
except ImportError:
 Image=None

def encode(p):
 data=p.read_bytes();mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
 if Image and p.suffix.lower()=='.png':
  im=Image.open(io.BytesIO(data));b=io.BytesIO();im.save(b,format='WEBP',lossless=True,method=3)
  if len(b.getvalue())<len(data):data=b.getvalue();mime='image/webp'
 return p.relative_to(R).as_posix(),'data:'+mime+';base64,'+base64.b64encode(data).decode('ascii')

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',default='PLAY_OFFLINE.html');args=ap.parse_args()
 imgs=[p for p in sorted((R/'assets').rglob('*')) if p.is_file() and p.suffix.lower() in {'.png','.webp','.jpg','.svg','.ogg','.mp3','.wav'}]
 with ThreadPoolExecutor(max_workers=5) as pool:mapping=dict(pool.map(encode,imgs))
 text=(R/'index.html').read_text(encoding='utf-8')
 def script(m):
  rel=m.group(1).split('?',1)[0]
  src=('(()=>{const data='+json.dumps(mapping,separators=(',',':'))+';'+(R/rel).read_text(encoding='utf-8')+'for(const k in ES9_ASSET_URIS){ES9_ASSET_URIS[k]=data[ES9_ASSET_URIS[k]]||ES9_ASSET_URIS[k];}window.ES215_EMBEDDED=data;})();') if rel=='js/asset_manifest.js' else (R/rel).read_text(encoding='utf-8')
  return '<script>\n'+src.replace('</script','<\\/script')+'\n</script>'
 text=re.sub(r'<script\s+src="([^"]+)"\s*>\s*</script>',script,text)
 def style(m):
  tag=m.group(0);h=re.search(r'href="([^"?]+\.css)(?:\?[^"]*)?"',tag)
  if not h:return tag
  css=(R/h.group(1)).read_text(encoding='utf-8')
  for rel,data in mapping.items():css=css.replace(rel,data)
  return '<style>\n'+css+'\n</style>'
 text=re.sub(r'<link\b[^>]*>',style,text)
 for rel,data in mapping.items():text=text.replace('src="'+rel+'"','src="'+data+'"')
 text=text.replace('<title>','<title>離線版 · ',1)
 p=R/args.output;p.write_text(text,encoding='utf-8');print('SELF-CONTAINED',p.name,p.stat().st_size,'bytes',flush=True)
if __name__=='__main__':main()
