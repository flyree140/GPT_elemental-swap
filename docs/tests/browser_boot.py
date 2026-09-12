from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import functools,threading,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class H(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(H,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
 page.route('**/peerjs*',lambda r:r.fulfill(status=200,content_type='text/javascript',body='/* optional multiplayer not tested */'))
 html=(ROOT/'PLAY_OFFLINE.html').read_text()
 import re
 html=re.sub(r'<script async src="https://unpkg.com[^>]+></script>','',html)
 page.set_content(html,wait_until='load')
 page.wait_for_timeout(1300)
 print('errors',errors)
 print(page.evaluate('''()=>({boot:!!window.ElementalSwap?.game,version:window.ES9?.VERSION,classes:Object.keys(ES9.CLASSES),rooms:ElementalSwap?.game?.rooms.length,player:ElementalSwap?.game?.player,ui:document.querySelector('#deckIndicator').textContent})'''))
 if not errors:
  page.keyboard.press('l');page.wait_for_timeout(150);page.screenshot(path=str(ROOT/'reports/skillbook.png'))
  print('library',page.locator('.library-card').count())
  page.keyboard.press('Escape');page.keyboard.press('t');page.wait_for_timeout(120)
  print('schools',page.locator('.school-card').count())
  page.keyboard.press('Enter');page.wait_for_timeout(200)
  page.screenshot(path=str(ROOT/'reports/training.png'))
  print('training',page.evaluate('()=>({t:ElementalSwap.game.trainingM,errs:"check"})'))
 print('finalerrors',errors)
 (ROOT/'reports/boot.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
 b.close()
server.shutdown()
