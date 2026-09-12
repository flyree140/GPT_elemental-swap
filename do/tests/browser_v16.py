"""Playwright: real keyboard paths, embedded HTML and routed repository subpath.
Screenshots are actual Chromium output, not a concept montage.
"""
from pathlib import Path
import json,mimetypes
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'reports/v16';OUT.mkdir(exist_ok=True)
report={'checks':[],'errors':[],'requestsFailed':[]}
def ck(name,ok,data=None):report['checks'].append({'name':name,'pass':bool(ok),'data':data})
with sync_playwright() as tool:
 browser=tool.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1600,'height':1100})
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('console',lambda m:report['errors'].append(m.text)if m.type=='error' else None)
 page.on('requestfailed',lambda r:report['requestsFailed'].append({'url':r.url,'failure':r.failure}))
 page.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(180)
 base=page.evaluate('''() => {const g=ElementalSwap.game;return {version:ES9.VERSION,rooms:g.rooms.length,classes:Object.keys(ES9.CLASSES).length,skills:Object.values(ES10_SKILLS).flat().length,images:Object.keys(ES9_ASSET_URIS).length,badImages:Object.entries(g.assets).filter(([k,im])=>!im.complete||!im.naturalWidth).map(([k])=>k),hp:g.player.hp,x:g.player.x}}''')
 ck('Fully embedded document boots without relative assets',base['rooms']==85 and not base['badImages'],base)
 page.screenshot(path=str(OUT/'01_shelter.png'))
 page.keyboard.down('ArrowRight');page.wait_for_timeout(260);page.keyboard.up('ArrowRight');page.wait_for_timeout(160)
 move=page.evaluate('''() => ({x:ElementalSwap.game.player.x,vx:ElementalSwap.game.player.vx})''');ck('Real arrow input moves / release stops',move['x']>base['x'] and abs(move['vx'])<1,move)
 page.keyboard.press('KeyJ');page.wait_for_timeout(100)
 ck('J opens real eight-mode workshop',page.locator('#visionPanel').is_visible() and page.locator('.vision-card').count()==8)
 page.screenshot(path=str(OUT/'02_workshop.png'))
 page.locator('[data-mode="cold"][data-slot="0"]').click();page.keyboard.press('Escape');page.wait_for_timeout(80)
 page.keyboard.press('BracketLeft');page.wait_for_timeout(90);mode=page.evaluate('ElementalSwap.game.vision16.mode');ck('Equipped left bracket key activates cold',mode=='cold')
 page.keyboard.press('Backslash');page.wait_for_timeout(60);ck('Backslash returns baseline',page.evaluate('ElementalSwap.game.vision16.mode')=='now')
 # Explicitly test that lenses remain responsive during hit-stop.
 page.evaluate('''() => {const g=ElementalSwap.game;g.vision16.cd.cold=0;g.hitStop=.4;}''');page.keyboard.press('BracketLeft');page.wait_for_timeout(90)
 ck('Vision input is retained during hit-stop',page.evaluate('ElementalSwap.game.vision16.mode')=='cold')
 page.keyboard.press('KeyJ');page.wait_for_timeout(80);page.locator('[data-lesson="forecast"]').click();page.wait_for_timeout(100);page.keyboard.press('BracketLeft');page.wait_for_function('ElementalSwap.game.vNodes().length>0',timeout=6500);page.wait_for_timeout(130)
 pred=page.evaluate('''() => {const g=ElementalSwap.game;return {room:g.currentRoomId,mode:g.vision16.mode,plans:g.vision16.plans.length,nodes:g.vNodes().length,hp:g.player.hp}}''')
 ck('Trial button enters playable forecast room with plans',pred['room']=='v16_forecast' and pred['mode']=='forecast' and pred['plans']>0,pred)
 page.screenshot(path=str(OUT/'03_forecast.png'))
 page.keyboard.press('KeyJ');page.wait_for_timeout(70);page.locator('[data-lesson="thermal"]').click();page.wait_for_timeout(3100);page.keyboard.press('BracketLeft');page.wait_for_timeout(180)
 freeze=page.evaluate('''() => {const g=ElementalSwap.game;return {room:g.currentRoomId,mode:g.vision16.mode,frozen:g.enemyShots.filter(s=>s.v16FrozenUntil>g.time).length,hp:g.player.hp}}''')
 ck('Real keyboard freezes emitted hostile volley',freeze['mode']=='cold' and freeze['frozen']>=2,freeze)
 page.screenshot(path=str(OUT/'04_cold.png'))
 page.keyboard.press('KeyJ');page.wait_for_timeout(70);page.locator('[data-lesson="echo"]').click();page.wait_for_timeout(150)
 page.keyboard.press('KeyZ');page.wait_for_timeout(140);page.keyboard.press('KeyZ');page.wait_for_timeout(140);page.keyboard.press('KeyX')
 page.keyboard.down('Space');page.keyboard.down('ArrowRight');page.wait_for_timeout(500);page.keyboard.up('Space');page.keyboard.up('ArrowRight');page.wait_for_timeout(250);page.keyboard.press('BracketLeft');page.wait_for_timeout(220)
 echo=page.evaluate('''() => {const g=ElementalSwap.game;return {clone:!!g.vision16.echo,actions:g.vision16.actions.length,rails:g.vision16.rails.length,mode:g.vision16.mode}}''')
 ck('Actual ZZX and jump become replay plus real ledges',echo['clone'] and echo['actions']>=1 and echo['rails']>=1,echo)
 page.screenshot(path=str(OUT/'05_echo.png'))
 page.keyboard.press('KeyJ');page.wait_for_timeout(60);page.locator('[data-lesson="slice"]').click();page.wait_for_timeout(80);page.keyboard.press('BracketLeft');page.keyboard.down('ArrowRight');page.wait_for_timeout(2600);page.keyboard.up('ArrowRight');page.wait_for_timeout(100);page.keyboard.press('BracketRight');page.wait_for_timeout(150)
 slice=page.evaluate('''() => {const g=ElementalSwap.game;return {mode:g.vision16.mode,x:g.player.x,pass:g.vision16.metrics.slicePass||0}}''')
 ck('Actual directional movement crosses B wall while in A',slice['pass']>0 and slice['mode']=='sliceC',slice)
 page.screenshot(path=str(OUT/'06_slice.png'))
 page.keyboard.press('KeyJ');page.wait_for_timeout(50);page.locator('[data-lesson="boss"]').click();page.wait_for_timeout(150);page.keyboard.press('BracketLeft');page.wait_for_function('ElementalSwap.game.vision16.plans.length>0',timeout=6000);page.wait_for_timeout(150)
 boss=page.evaluate('''() => {const g=ElementalSwap.game,b=g.enemies.find(e=>e.v16Boss);return {name:b.name,hp:b.hp,phase:b.phase,room:g.currentRoomId,plans:g.vision16.plans.length}}''')
 ck('Boss is present, HUD visible and actually schedules attacks',boss['room']=='v16_boss' and boss['hp']>0 and boss['plans']>0 and page.locator('#bossHUD').is_visible(),boss)
 page.screenshot(path=str(OUT/'07_parallax.png'))
 page.keyboard.press('Backspace');page.wait_for_timeout(150)
 ck('Backspace returns original exploration position',page.evaluate('ElementalSwap.game.vision16.returnTo') is None and page.evaluate('ElementalSwap.game.currentRoomId')=='r00')
 # The environment blocks top-level file:// and HTTP navigation by policy.
 # Route JS/CSS/PNG requests from a repository subpath into this exact project.
 # This validates actual relative-resource loading, not deployment to a public URL.
 page.close();page=browser.new_page(viewport={'width':1600,'height':1100})
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('console',lambda m:report['errors'].append(m.text) if m.type=='error' else None)
 routed=[]
 def serve(route):
  prefix='https://example.com/esv16/'
  rel=route.request.url[len(prefix):].split('?')[0]
  f=(ROOT/rel).resolve()
  if ROOT not in f.parents or not f.is_file():
   report['requestsFailed'].append({'path':rel,'error':'missing local file'});route.fulfill(status=404,body='not found');return
  routed.append(rel);route.fulfill(status=200,content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream',body=f.read_bytes())
 page.route('https://example.com/esv16/**',serve)
 html=(ROOT/'index.html').read_text().replace('<head>','<head><base href="https://example.com/esv16/">',1)
 page.set_content(html,wait_until='load');page.wait_for_timeout(250)
 multi=page.evaluate('() => {const g=ElementalSwap.game;return {version:ES9.VERSION,rooms:g.rooms.length,missing:Object.entries(g.assets).filter(([k,v])=>!v.complete||!v.naturalWidth).map(([k])=>k)}}')
 ck('Multi-file resources resolve under a repository subdirectory',multi['rooms']==85 and not multi['missing'] and 'js/vision.js' in routed and 'vision.css' in routed,{'game':multi,'routedRequests':len(routed)})
 report['environmentNote']='Top-level file/http navigation is blocked by the execution environment. Standalone tested via set_content; multi-file JS/CSS/PNG served through local Playwright request routes under https://example.com/esv16/. No public GitHub deployment or real-origin LocalStorage reload is claimed. JSON save round-trip is in mechanics.json.'
 browser.close()
report['passed']=sum(c['pass'] for c in report['checks']);report['total']=len(report['checks'])
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
