from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as q:
 browser=q.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1600,'height':1050},device_scale_factor=1);errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append('page: '+str(e)))
 page.on('console',lambda m:errors.append('console: '+m.text) if m.type=='error' else None)
 page.on('request',lambda r:requests.append(r.url) if not r.url.startswith('data:') else None)
 page.set_content((ROOT/'PLAY_OFFLINE.html').read_text(),wait_until='load');page.wait_for_timeout(800)
 R=page.evaluate('''()=>{const g=ElementalSwap.game;return{version:ES9.VERSION,roomCount:g.rooms.length,enemyTypes:[...new Set(g.enemies.filter(e=>e.type!=='dummy'&&e.type!=='sentinel').map(e=>e.type))].length,bosses:g.enemies.filter(e=>e.type==='sentinel').map(e=>({name:e.name,room:e.room})),loadedImages:Object.values(g.assets).filter(i=>i.complete&&i.naturalWidth>0).length,assetCount:Object.keys(g.assets).length,hp:g.player.hp,maxHp:g.player.maxHp,mpPresent:'mp' in g.player}}''')
 page.wait_for_timeout(1000);R['safeHpAfter']=page.evaluate('ElementalSwap.game.player.hp')
 page.screenshot(path=str(ROOT/'reports/01_start.png'))
 page.keyboard.down('ArrowRight');page.wait_for_timeout(280);page.keyboard.up('ArrowRight');page.wait_for_timeout(130)
 R['releaseVelocity']=page.evaluate('ElementalSwap.game.player.vx')
 page.keyboard.press('l');page.wait_for_timeout(140);t=page.evaluate('ElementalSwap.game.time');page.wait_for_timeout(240);R['modalPausesTime']=abs(page.evaluate('ElementalSwap.game.time')-t)<.0001
 R['libraryCards']=page.locator('.library-card').count();R['equipSlots']=page.locator('.equip-slot').count()
 page.keyboard.press('u');page.keyboard.press('k');R['upgradeAndBranch']=page.evaluate('()=>({rank:ElementalSwap.game.mState().ranks.rift_step,branch:ElementalSwap.game.mState().branches.rift_step,points:ElementalSwap.game.mState().points})')
 page.screenshot(path=str(ROOT/'reports/02_mastery.png'),full_page=True)
 with page.expect_download(timeout=5000) as info:page.locator('#exportM').click()
 download=info.value;download.save_as(str(ROOT/'reports/save_export_test.json'));R['exportSaveWorked']=True
 page.keyboard.press('Escape');page.keyboard.press('t');page.wait_for_timeout(100);R['schoolCards']=page.locator('.school-card').count();page.screenshot(path=str(ROOT/'reports/03_schools.png'),full_page=True)
 page.keyboard.press('Enter');page.wait_for_timeout(200)
 # Position at a training target; then real key events execute the first command.
 page.evaluate("()=>{const g=ElementalSwap.game,e=g.enemies.find(e=>e.practiceM);g.player.x=e.x-45;g.player.dir=1;g.player.onGround=true;g.player.vx=0;}")
 for k in ['z','z','x']:
  page.keyboard.press(k);page.wait_for_timeout(230)
 page.wait_for_timeout(1300);R['keyboardLessonProgress']=page.evaluate('ElementalSwap.game.trainingM.step')
 page.screenshot(path=str(ROOT/'reports/04_rift_school.png'))
 page.evaluate("()=>{const g=ElementalSwap.game;g.startTraining('beast');g.nextLessonM();g.closeModalsM();}")
 page.keyboard.press('c');page.wait_for_timeout(80);page.keyboard.down('Space');page.keyboard.down('ArrowUp');page.wait_for_timeout(1000);page.keyboard.up('ArrowUp');page.keyboard.up('Space')
 R['eagle']=page.evaluate('()=>{const g=ElementalSwap.game;return{form:g.player.form,rise:g.trainingM.flightGain,height:g.player.y}}')
 page.screenshot(path=str(ROOT/'reports/05_eagle_flight.png'))
 page.evaluate("()=>{const g=ElementalSwap.game;g.player.x=g.trainingM.baseX+70;g.player.y=g.trainingM.baseY;g.player.vy=0;g.player.vx=0;g.player.onGround=true;g.cooldownsM={};g.useSkill(1);}")
 page.wait_for_timeout(220);page.screenshot(path=str(ROOT/'reports/06_bear_quake.png'))
 page.evaluate("()=>{const g=ElementalSwap.game;g.endTraining();ElementalSwap.debug.room('e06');g.player.inv=30;g.camera.x=g.player.x-g.viewW*.4;g.camera.y=g.player.y-g.viewH*.65;}")
 page.wait_for_timeout(300);page.screenshot(path=str(ROOT/'reports/07_eastlands.png'))
 page.evaluate("()=>{const g=ElementalSwap.game;ElementalSwap.debug.boss();g.player.inv=30;}");page.wait_for_timeout(250)
 R['oldBossVisible']=page.locator('#bossHUD').evaluate("e=>e.classList.contains('show')")
 page.evaluate("()=>{const g=ElementalSwap.game;ElementalSwap.debug.room('e15');g.player.inv=30;}");page.wait_for_timeout(250)
 R['eastBossVisible']=page.locator('#bossHUD').evaluate("e=>e.classList.contains('show')")
 page.screenshot(path=str(ROOT/'reports/08_east_boss.png'))
 page.evaluate("()=>{const g=ElementalSwap.game;for(const r of g.rooms)g.progress.discovered[r.id]=true;g.renderMap();document.querySelector('#mapPanel').hidden=false;}")
 page.screenshot(path=str(ROOT/'reports/09_world_map.png'))
 R['requestsOnSinglePlayer']=requests;R['errors']=errors
 (ROOT/'reports/browser_final.json').write_text(json.dumps(R,ensure_ascii=False,indent=2));print(json.dumps(R,ensure_ascii=False,indent=2));browser.close()
