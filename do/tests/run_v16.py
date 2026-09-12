from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1100});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text)if m.type=='error' else None)
 page.set_content((R/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(80)
 try:r=page.evaluate((R/'tests/vision_assertions.js').read_text())
 except Exception as e:r={'fatal':str(e)}
 r['browserErrors']=errors
 (R/'reports/v16/mechanics.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps(r,ensure_ascii=False,indent=2));b.close()
