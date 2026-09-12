"""Static release audit. Run after building; writes reports/v16/integrity.json.
Uses real byte hashes and PNG decoding; this does not replace gameplay tests.
"""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json, re, subprocess
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
checks = []
def check(name, ok, data=None):
    checks.append({'name': name, 'pass': bool(ok), 'data': data})
def digest(data):
    return hashlib.sha256(data).hexdigest()
class Dependencies(HTMLParser):
    def __init__(self):
        super().__init__(); self.local=[]; self.external=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        src=attrs.get('src') if tag in ('script','img','audio','source') else attrs.get('href') if tag=='link' else None
        if src and not src.startswith('data:'):
            (self.external if src.startswith(('http:','https:','//')) else self.local).append(src)

baseline=json.loads((ROOT/'docs/V11_BASELINE_SHA256.json').read_text())
changed=[k for k,h in baseline.items() if not (ROOT/k).is_file() or digest((ROOT/k).read_bytes())!=h]
check('129 V11 original assets/source/manifest retained byte-for-byte', len(baseline)==129 and not changed, {'compared':len(baseline),'changed':changed})
errors=[]
for p in sorted((ROOT/'js').glob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: errors.append({'file':p.name,'error':r.stderr})
check('Every JavaScript source passes node --check',not errors,{'files':len(list((ROOT/'js').glob('*.js'))),'errors':errors})
index=Dependencies();index.feed((ROOT/'index.html').read_text())
missing=[s for s in index.local if not (ROOT/s.split('?')[0]).is_file()]
check('Multi-file entry resolves all local dependencies',not missing,{'local':index.local,'missing':missing})
html=(ROOT/'PLAY_OFFLINE.html').read_text(); standalone=Dependencies();standalone.feed(html)
check('Standalone contains no local or external script/image/style dependencies', not standalone.local and not standalone.external, {'local':standalone.local,'external':standalone.external})
match=re.search(r'window\.ES9_ASSET_URIS=(.*?);</script>',html,re.S)
assets=json.loads(match.group(1)) if match else {}
images=list((ROOT/'assets').rglob('*.png'));bad=[]
for p in images:
    with Image.open(p) as im: im.verify()
    rel=p.relative_to(ROOT).as_posix();uri=assets.get(rel,'')
    if not uri.startswith('data:image/png;base64,') or base64.b64decode(uri.split(',',1)[1])!=p.read_bytes():bad.append(rel)
check('120 PNGs decode and embedded image bytes match originals',len(images)==120 and len(assets)==120 and not bad,{'pngs':len(images),'embedded':len(assets),'bad':bad})
check('V16 rules/styles actually embedded',all(x in html for x in ['16.0.0-causal-atelier-release','P.vMakeEcho','v16_boss','vision-card']),{'inlineScripts':html.count('<script>'),'styleBlocks':html.count('<style>')})
fonts=[p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.suffix.lower() in ('.ttf','.otf','.ttc','.woff','.woff2')]
check('No font binaries packaged',not fonts,fonts)
check('GitHub root has index and nojekyll', (ROOT/'index.html').is_file() and (ROOT/'.nojekyll').is_file())
# Reports are actual Chromium runs on the release single-file build.
mechanics=json.loads((ROOT/'reports/v16/mechanics.json').read_text())
browser=json.loads((ROOT/'reports/v16/browser.json').read_text())
check('54 rule mechanics regression checks',mechanics.get('passed')==54 and not mechanics.get('failure') and not mechanics.get('browserErrors'),{'passed':mechanics.get('passed'),'total':mechanics.get('total')})
check('13 actual browser UI/input and relative-load checks',browser.get('passed')==13 and not browser.get('errors') and not browser.get('requestsFailed'),{'passed':browser.get('passed'),'total':browser.get('total')})
legacy=json.loads((ROOT/'reports/gameplay_assertions.json').read_text())
check('13 original combat checks still pass',len(legacy.get('tests',[]))==13 and not legacy.get('fail') and not legacy.get('pageErrors'))
matrix=json.loads((ROOT/'reports/skill_matrix.json').read_text())
check('120 original skills execute',len(matrix.get('skills',[]))==120 and not matrix.get('errors') and not matrix.get('pageErrors'))
courses=json.loads((ROOT/'reports/course_regression.json').read_text())
check('60 original class-course checks pass',len(courses.get('cases',[]))==60 and not courses.get('failed') and not courses.get('pageErrors'))
haven=json.loads((ROOT/'reports/v11/facility_assertions.json').read_text())
check('33 original shelter service checks pass',haven.get('passed')==33 and not haven.get('failed') and not haven.get('pageErrors'))
report={'version':'16.0.0-causal-atelier-release','checks':checks,'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c['name'] for c in checks if not c['pass']],'standaloneSHA256':digest(html.encode()),'pngImages':len(images)}
(ROOT/'reports/v16/integrity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
if report['failures']: raise SystemExit(1)
