"""Check shipped dependencies and byte-for-byte preservation of V10.
Run: python tests/v11_static_release.py
No browser or network required. Pillow is needed only by this developer test.
"""
from pathlib import Path
import base64,hashlib,json,re,subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
baseline=json.loads((ROOT/'docs/V10_BASELINE_SHA256.json').read_text())
changes=[name for name,h in baseline.items() if not (ROOT/name).is_file() or sha(ROOT/name)!=h]
assert not changes,('V10 content changed',changes)
html=(ROOT/'index.html').read_text()
references=re.findall(r'(?:src|href)=[\"\']((?:js/|assets/|styles\.css)[^\"\']*)[\"\']',html)
missing=[x for x in references if not (ROOT/x.split('?')[0]).is_file()]
assert not missing,missing
for p in sorted((ROOT/'js').glob('*.js')): subprocess.run(['node','--check',str(p)],check=True)
pngs=list((ROOT/'assets').rglob('*.png'))
for p in pngs:
    with Image.open(p) as im: im.verify()
manifest=json.loads((ROOT/'assets/sanctuary/manifest.json').read_text())
assert len(manifest)==18
for k,data in manifest.items():
    with Image.open(ROOT/data['src']) as im:
        assert im.width*2==data['w'] and im.height*2==data['h'], (k,im.size,data)
solo=(ROOT/'PLAY_OFFLINE.html').read_text()
assert '11.0.0-afterlight-shelter-release' in solo
assert not re.search(r'<(?:script|img)[^>]+src=[\"\'](?:js/|assets/)',solo)
assert not re.search(r'<link[^>]+href=[\"\']styles\.css',solo)
assert 'window.ES9_ASSET_URIS=' in solo
raw=solo.split('window.ES9_ASSET_URIS=',1)[1].split(';</script>',1)[0]
embedded=json.loads(raw)
assert len(embedded)==len(pngs)
for name,uri in embedded.items():
    assert base64.b64decode(uri.split(',',1)[1])==(ROOT/name).read_bytes(),name
fonts=list(ROOT.rglob('*.ttf'))+list(ROOT.rglob('*.otf'))+list(ROOT.rglob('*.ttc'))
assert not fonts,fonts
R={'version':'11.0.0-afterlight-shelter-release','baselineFilesVerified':len(baseline),'baselineChanged':changes,'localReferences':references,'missingReferences':missing,'pngsDecoded':len(pngs),'shelterSheets':len(manifest),'embeddedImagesVerified':len(embedded),'localRuntimeScriptOrImageDependencies':0,'javascriptSyntax':'pass','fontFiles':0}
out=ROOT/'reports/v11/static_release.json';out.write_text(json.dumps(R,ensure_ascii=False,indent=2));print(json.dumps(R,ensure_ascii=False,indent=2))
