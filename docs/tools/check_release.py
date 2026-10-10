#!/usr/bin/env python3
"""Validate 21.8 release dependencies, reports and SHA-256 using Python 3 only."""
from pathlib import Path
import hashlib, json, re, sys
R=Path(__file__).resolve().parents[1]
errors=[]
def read(rel):
 p=R/rel
 if not p.is_file():
  errors.append('Missing: '+rel);return ''
 return p.read_text(encoding='utf-8')
def local_dependency(rel,origin='HTML'):
 if rel.startswith(('http:','https:','data:','#','mailto:')):return
 path=rel.split('?',1)[0].split('#',1)[0]
 if path and not (R/path).is_file():errors.append('Missing '+origin+' dependency: '+path)
html=read('index.html')
for source in [html,read('editor.html')]:
 for rel in re.findall(r'(?:src|href)="([^"#]+)"',source):local_dependency(rel)
try:
 mp=json.loads(read('js/asset_manifest.js').split('window.ES9_ASSET_URIS=',1)[1].split(';',1)[0])
 for target in set(mp.values()):local_dependency(target,'packed asset')
except (ValueError,IndexError):mp={};errors.append('Invalid asset manifest')
for css in R.glob('*.css'):
 for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css.read_text(encoding='utf-8')):local_dependency(url,'CSS')
required=['PLAY_OFFLINE.html','BUILD.json','VERIFICATION.md','data/atlas217_config.js','assets/atlas217/hero.webp','assets/atlas217/world_art.webp','js/hero217_manifest.js','js/atlas217_core.js','js/atlas217_render.js','js/atlas217_map.js','js/atlas217_editor.js','js/atlas217_ui.js','atlas217.css','tools/run_qa217.py','tools/pack_sprites217.py']
required += ['js/resonance218.js','resonance218.css','docs/21.8_既視感與連段.md','CHANGELOG_V21_8_0.md','tools/run_qa218.py','tools/smoke218.py','tools/qa218.js','tools/qa218_compat.js']
required += ['docs/'+s+ext for s in ['開發手冊_21.7','遊戲設定集_21.7'] for ext in ['.pdf','.docx','.md']]
for rel in required:
 if not (R/rel).is_file():errors.append('Missing release file: '+rel)
try:
 build=json.loads(read('BUILD.json'))
 if build.get('build')!='21.8.0':errors.append('Wrong BUILD version')
 for name,total in [('regression217',85),('qa218_compat',82),('qa218',124),('keyboard218',14)]:
  report=json.loads(read('reports/qa218/'+name+'.json'))
  if report.get('passed')!=total or report.get('total')!=total or report.get('pageErrors'):
   errors.append('QA report not fully passing: '+name)
except ValueError:errors.append('Invalid build / QA JSON')
# User edits should intentionally cause mismatch until the release is rebuilt.
count=0;sha=R/'SHA256SUMS.txt'
if not sha.is_file():errors.append('Missing SHA256SUMS.txt')
else:
 for line in sha.read_text(encoding='utf-8').splitlines():
  if not line.strip():continue
  expected,rel=line.split('  ',1);p=R/rel
  if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:errors.append('Hash mismatch: '+rel)
  count+=1
result={'build':'21.8.0','scripts':len(re.findall(r'<script src=',html)),'assetAliases':len(mp),'packedAssets':len(set(mp.values())),'hashesChecked':count,'passed':not errors,'errors':errors}
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
