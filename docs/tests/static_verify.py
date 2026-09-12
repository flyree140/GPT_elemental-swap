from pathlib import Path
import json,zipfile,hashlib,re
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def js_data(p):
 s=p.read_text();return json.loads(s[s.index('=')+1:].strip().rstrip(';'))
w=js_data(ROOT/'js/world.js');D=js_data(ROOT/'js/skills.js')
old_path=Path('/mnt/data/Elemental_Swap_V9_1_FIXED_GitHub_Ready.zip')
out={'rooms':len(w['rooms']),'edges':len(w['edges']),'classes':len(D),'skills':sum(map(len,D.values())),'per_class':{k:len(v) for k,v in D.items()},'new_exploration_rooms':sum(r['id'].startswith('e') for r in w['rooms']),'schools':sum(bool(r.get('training')) for r in w['rooms']),'puzzles':len(w['puzzles']),'collectibles':len(w['collectibles'])}
ids={r['id'] for r in w['rooms']};visited={'r00'}
while True:
 n=len(visited)
 for e in w['edges']:
  assert e['a'] in ids and e['b'] in ids
  if e['a'] in visited:visited.add(e['b'])
  if e['b'] in visited:visited.add(e['a'])
 if n==len(visited):break
out['all_rooms_graph_reachable']=ids==visited
if old_path.exists():
 with zipfile.ZipFile(old_path) as z:
  s=z.read('js/world.js').decode();ow=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
  oldr={r['id']:r for r in ow['rooms']};newr={r['id']:r for r in w['rooms']}
  out['original_52_rooms_unchanged']=all(newr.get(k)==v for k,v in oldr.items())
  out['original_71_edges_retained']=all(e in w['edges'] for e in ow['edges'])
  imgs=[n for n in z.namelist() if n.startswith('assets/') and n.endswith('.png')]
  out['original_png_count']=len(imgs);out['original_art_unchanged']=all((ROOT/n).read_bytes()==z.read(n) for n in imgs)
allpng=list((ROOT/'assets').rglob('*.png'));out['png_count']=len(allpng)
for p in allpng:Image.open(p).verify()
for k in ['alchemist','monk']:
 assert Image.open(ROOT/f'assets/sprites/player_{k}.png').size==(384,832)
for cls,v in D.items():
 assert len(v)==12 and len({s['id'] for s in v})==12
 for s in v:
  assert len(s['branches'])==2
  assert 0<s['cd']<=2
  assert s['recommendedFollow'] in {q['id'] for q in v}
  assert s['recommendedFollow']!=s['id']
assert out['all_rooms_graph_reachable']
assert out.get('original_art_unchanged',True) and out.get('original_52_rooms_unchanged',True)
out['source_inlined_in_standalone']=all('<script src="js/'+x+'">' not in (ROOT/'PLAY_OFFLINE.html').read_text() for x in ['world.js','config.js','skills.js','network.js','game.js','mastery.js'])
(ROOT/'reports/static_verify.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
