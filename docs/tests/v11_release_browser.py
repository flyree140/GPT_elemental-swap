"""Browser acceptance on the shipped, fully embedded HTML (no external requests).
This is not a live GitHub deployment or cross-device multiplayer test.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'reports/v11'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1600,'height':1120},device_scale_factor=1);errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append('page: '+str(e)));page.on('console',lambda m:errors.append('console: '+m.text) if m.type=='error' else None)
 page.on('request',lambda r:requests.append(r.url) if not r.url.startswith('data:') else None)
 page.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(600)
 R=page.evaluate('''()=>{const g=ElementalSwap.game;return{version:ES9.VERSION,worldRooms:g.rooms.length,skills:Object.values(ES10_SKILLS).flat().length,classes:Object.keys(ES9.CLASSES).length,shelters:Object.keys(ES11_ART).length,interactables:g.furniture.filter(f=>f.refined11).length,types:[...new Set(g.furniture.filter(f=>f.refined11).map(f=>f.kind))],loadedImages:Object.values(g.assets).filter(i=>i.complete&&i.naturalWidth>0).length,failedImages:Object.entries(g.assets).filter(([k,i])=>!i.naturalWidth).map(([k])=>k),mpPresent:'mp' in g.player,hp:g.player.hp}}''')
 page.wait_for_timeout(1400);R['safeHpAfter']=page.evaluate('ElementalSwap.game.player.hp');R['missingFilesNoticeHidden']=not page.locator('#bootNotice').is_visible()
 # Original keyboard movement then release remains responsive.
 x0=page.evaluate('ElementalSwap.game.player.x');page.keyboard.down('ArrowRight');page.wait_for_timeout(250);page.keyboard.up('ArrowRight');page.wait_for_timeout(150)
 R['keyboardMove']=page.evaluate('()=>({x:ElementalSwap.game.player.x,vx:ElementalSwap.game.player.vx})');R['keyboardMove']['xBefore']=x0
 # First screenshot: actual playing UI in original start shelter.
 page.evaluate("()=>{const g=ElementalSwap.game;g.player.x=1250;g.player.y=14182;g.player.vx=g.player.vy=0;g.message.t=0;g.objectiveStep=5;}")
 page.wait_for_timeout(550);page.locator('.game-frame').screenshot(path=str(OUT/'01_coast_play.png'))
 # Real E/Enter interaction; all facilities' state effects are also covered by haven_assertions.js.
 page.evaluate("()=>{const g=ElementalSwap.game,f=g.furniture.find(f=>f.room==='r00'&&f.kind==='fridge');g.player.x=f.x+f.w/2-g.player.w/2;g.player.y=f.y+f.h-g.player.h;g.player.vx=g.player.vy=0;g.player.hp=80;}")
 page.wait_for_timeout(200);page.keyboard.press('e');page.wait_for_timeout(120)
 R['serviceOpenedByE']=page.locator('#servicePanel').is_visible();time=page.evaluate('ElementalSwap.game.time');page.wait_for_timeout(250);R['menuPausesWorld']=abs(page.evaluate('ElementalSwap.game.time')-time)<1e-7
 page.keyboard.press('Enter');page.wait_for_timeout(120);R['enterRation']=page.evaluate('()=>({hp:ElementalSwap.game.player.hp,herbs:ElementalSwap.game.home11().herbs})')
 page.screenshot(path=str(OUT/'04_service_menu.png'),full_page=True)
 page.keyboard.press('Escape');page.wait_for_timeout(100);R['escapeClosesService']=not page.locator('#servicePanel').is_visible()
 # Real L/T keys still open V10 systems, without losing data.
 page.keyboard.press('l');page.locator('.library-card').first.wait_for(state='visible',timeout=5000);R['masteryCards']=page.locator('.library-card').count();page.keyboard.press('Escape');page.wait_for_timeout(180)
 page.keyboard.press('t');page.locator('.school-card').first.wait_for(state='visible',timeout=5000);R['schoolCards']=page.locator('.school-card').count();page.keyboard.press('Escape');page.wait_for_timeout(180)
 # U directory is keyboard-controlled, no teleport to undiscovered rooms.
 page.keyboard.press('u');page.locator('.haven-card').first.wait_for(state='visible',timeout=5000);R['directoryCards']=page.locator('.haven-card').count();page.screenshot(path=str(OUT/'05_directory.png'),full_page=True);page.keyboard.press('Escape')
 # Debug travel used only to reach distant art previews; scenery is rendered by the game.
 for room,file in [('r35','02_forest_haven.png'),('r21','03_night_workshop.png')]:
  page.evaluate("""id=>{const g=ElementalSwap.game,r=g.roomById.get(id);g.player.x=r.x+r.w*.46;g.player.y=r.floorY-g.player.h;g.player.vx=g.player.vy=0;g.player.inv=0;g.currentRoomId=id;g.currentRegion=r.region;g.message.t=0;g.objectiveStep=5;g.sceneMode11=false;g.input.held.clear();g.input.pressed.clear();}""",room)
  page.keyboard.press('i');page.wait_for_timeout(1100)
  # Freeze at the normal scenic-mode camera for a sharp screenshot.
  page.locator('.game-frame').screenshot(path=str(OUT/file))
 R['sceneModeWorks']=page.evaluate('ElementalSwap.game.sceneMode11')
 R['externalRequests']=requests;R['errors']=errors
 print(json.dumps(R,ensure_ascii=False,indent=2))
 assert R['version']=='11.0.0-afterlight-shelter-release'
 assert R['worldRooms']==78 and R['skills']==120 and R['classes']==10
 assert R['shelters']==18 and R['interactables']==192 and len(R['types'])==18
 assert not R['mpPresent'] and R['safeHpAfter']==R['hp']
 assert not R['failedImages'] and not errors and not requests
 assert R['serviceOpenedByE'] and R['menuPausesWorld'] and R['escapeClosesService']
 assert R['masteryCards']==12 and R['schoolCards']==10 and R['directoryCards']==18
 assert R['missingFilesNoticeHidden'] and R['sceneModeWorks']
 assert R['keyboardMove']['x']>R['keyboardMove']['xBefore'] and abs(R['keyboardMove']['vx'])<.1
 assert R['enterRation']['hp']==125 and R['enterRation']['herbs']==2
 (OUT/'browser_release.json').write_text(json.dumps(R,ensure_ascii=False,indent=2));b.close()
