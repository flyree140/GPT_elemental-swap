"""Build a dependency-free single HTML; then a root-index GitHub Pages ZIP."""
from pathlib import Path
import re,base64,json,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
def standalone():
 html=(ROOT/'index.html').read_text()
 assets={p.relative_to(ROOT).as_posix():'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets').rglob('*.png')}
 css=(ROOT/'styles.css').read_text();html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>')
 html=html.replace('<script src="js/world.js"></script>','<script>window.ES9_ASSET_URIS='+json.dumps(assets,separators=(',',':'))+';</script>\n<script src="js/world.js"></script>')
 for name in ['world.js','config.js','skills.js','network.js','game.js','mastery.js']:
  js=(ROOT/'js'/name).read_text().replace('</script','<\\/script')
  html=html.replace(f'<script src="js/{name}"></script>', '<script>\n'+js+'\n</script>')
 # The codex image in HTML also needs an embedded URI, not just Canvas textures.
 for rel,uri in assets.items():html=html.replace(f'src="{rel}"',f'src="{uri}"')
 # Game code makes some <img>s from template strings: consult the embedded map at runtime.
 html=html.replace('src="assets/sprites/enemy_${id}.png"','src="${window.ES9_ASSET_URIS?.[\'assets/sprites/enemy_\'+id+\'.png\']||\'assets/sprites/enemy_\'+id+\'.png\'}"')
 (ROOT/'PLAY_OFFLINE.html').write_text(html)
 return html
if __name__=='__main__':
 standalone()
 print('Built',ROOT/'PLAY_OFFLINE.html')
