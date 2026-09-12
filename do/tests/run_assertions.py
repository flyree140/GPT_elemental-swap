from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 html=re.sub(r'<script async src="https://unpkg.com[^>]+></script>','',(ROOT/'PLAY_OFFLINE.html').read_text());page.set_content(html,wait_until='load');page.wait_for_timeout(100)
 try:r=page.evaluate((ROOT/'tests/gameplay_assertions.js').read_text())
 except Exception as e:r={'failure':str(e)}
 r['pageErrors']=errors;(ROOT/'reports/gameplay_assertions.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps(r,ensure_ascii=False,indent=2)[:18000]);b.close()
