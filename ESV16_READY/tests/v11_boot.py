from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'reports/v11'
class H(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1120},device_scale_factor=1)
 errors=[];responses=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 page.on('response',lambda r:responses.append((r.status,r.url)) if r.status>=400 else None)
 page.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(900)
 state=page.evaluate('''()=>{const g=ElementalSwap.game;return{version:ES9.VERSION,rooms:g.rooms.length,fixtures:g.furniture.filter(f=>f.refined11).length,images:Object.entries(g.assets).filter(([k,i])=>!i.naturalWidth).map(([k])=>k),hp:g.player.hp,player:{x:g.player.x,y:g.player.y},room:g.currentRoomId,art:Object.keys(ES11_ART).length,skills:Object.values(ES10_SKILLS).flat().length}}''')
 page.screenshot(path=str(OUT/'initial.png'),full_page=True)
 # go to fridge using the real existing physical location, trigger E and capture UI.
 page.evaluate("()=>{const g=ElementalSwap.game,f=g.furniture.find(f=>f.room==='r00'&&f.kind==='fridge');g.player.x=f.x+f.w/2-g.player.w/2;g.player.y=f.y+f.h-g.player.h;g.player.vx=g.player.vy=0;g.player.onGround=true;}")
 page.wait_for_timeout(250);page.keyboard.press('e');page.wait_for_timeout(200);page.screenshot(path=str(OUT/'service.png'),full_page=True)
 state['serviceVisible']=page.locator('#servicePanel').is_visible();state['errors']=errors;state['httpErrors']=responses
 print(json.dumps(state,ensure_ascii=False,indent=2));(OUT/'boot.json').write_text(json.dumps(state,ensure_ascii=False,indent=2));b.close()
server.shutdown()
