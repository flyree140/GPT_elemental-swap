from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1120});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(200)
 try:report=page.evaluate((ROOT/'tests/haven_assertions.js').read_text())
 except Exception as e:report={'failure':str(e)}
 report['pageErrors']=errors
 (ROOT/'reports/v11/facility_assertions.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps(report,ensure_ascii=False,indent=2));b.close()
