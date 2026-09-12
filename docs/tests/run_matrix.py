from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':960});errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 html=(ROOT/'PLAY_OFFLINE.html').read_text();html=re.sub(r'<script async src="https://unpkg.com[^>]+></script>','',html)
 page.set_content(html,wait_until='load');page.wait_for_timeout(150)
 try:r=page.evaluate((ROOT/'tests/skill_matrix.js').read_text())
 except Exception as e:r={'failure':str(e)}
 r['pageErrors']=errors
 (ROOT/'reports/skill_matrix.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in r.items() if k!='skills'},ensure_ascii=False)[:12000])
 if 'skills'in r:
  print('tested',len(r['skills']),'with hit',len([x for x in r['skills'] if x['hits']]),'no hits',[(x['id'],x['mode']) for x in r['skills'] if not x['hits']])
 b.close()
