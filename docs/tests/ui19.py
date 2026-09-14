"""Real Chromium key/pointer/touch paths, responsive UI and all-new-biome render smoke."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
from harness19 import document,ROOT
async def main():
 out=[];errs=[]
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await b.new_page(viewport={'width':1600,'height':1000},has_touch=True);p.on('pageerror',lambda e:errs.append(str(e)))
  await p.set_content(document());await p.wait_for_timeout(400)
  await p.evaluate('window.g=ElementalSwap.game;g.message.t=0;g.paused=true;')
  async def rec(name,expr):
   value=await p.evaluate(expr);out.append({'test':name,'pass':bool(value)})
  await p.click('#mapButton');await p.click('#atlasCenter19')
  await rec('大地圖按鈕定位至角色實際座標','Math.abs(g.f19.map.x-(g.player.x+g.player.w/2))<1&&document.querySelector("#atlasPosition19").textContent.includes(g.roomById.get(g.currentRoomId).name)')
  await p.fill('#atlasSearch19','水下神殿');await rec('地圖搜尋出七處神殿地點','document.querySelectorAll("#atlasResults19 button").length===7')
  await p.locator('#atlasResults19 button').nth(1).click();await rec('搜尋選中後詳情更新且不傳送','document.querySelector("#atlasDetail19").textContent.includes("水下神殿")&&g.currentRoomId==="r00"')
  await p.click('#atlasTarget19');await rec('步行目標產生導航路線','g.fState().target===g.f19.map.selected&&g.fRoute(g.fState().target).length>1')
  await p.click('#atlasAll19');bb=await p.locator('#worldMapCanvas').bounding_box();await p.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await p.mouse.wheel(0,-400);await p.wait_for_timeout(60)
  await rec('真實滑鼠滾輪放大地圖','g.f19.map.zoom>1');await p.evaluate('window.oldCenter19=g.f19.map.x')
  await p.mouse.down();await p.mouse.move(bb['x']+bb['width']/2+100,bb['y']+bb['height']/2,steps=5);await p.mouse.up();await rec('真實拖曳改變地圖視窗','Math.abs(g.f19.map.x-oldCenter19)>100')
  await p.evaluate('g.closeModalsM();g.paused=false;');await p.keyboard.press('m');await p.wait_for_timeout(180);await rec('實際 M 鍵開啟大地圖','!document.querySelector("#mapPanel").hidden')
  # Sequences go through keyboard events, not direct commandInput calls.
  for seq in ['ZZZ','XZ','ZZX','XXZ','ZXX','XZX']:
   await p.evaluate('''g.closeModalsM();g.nStartTutorial('job','dreamweaver');g.n18.tutorial.done=true;g.enemies=[];g.n18.events=[];g.player.attack=null;g.player.buffer=null;g.player.history='';g.fInit().comboUntil=0;g.player.vx=0;g.hitStop=0;g.paused=false;window.comboX19=g.player.x;''');await p.wait_for_timeout(180)
   for key in seq:
    await p.keyboard.press(key.lower());await p.wait_for_timeout(310 if key=='X' else 220)
   await p.wait_for_timeout(130)
   trace=await p.evaluate('({key:g.fInit().lastCommand?.key,dx:g.player.x-comboX19})')
   out.append({'test':'實際鍵盤 '+seq+' 辨識及不強迫位移','pass':trace['key']==seq and abs(trace['dx'])<1,'detail':trace})
  await p.evaluate('g.nEndTutorial();g.closeModalsM();g.xTravel("r00",true);g.paused=true;g.xOpen("craft");')
  await p.click('[data-filter19="weapon"]');await rec('配方類型篩選生效','[...document.querySelectorAll(".recipe-card")].every(e=>e.querySelector("small").textContent.includes("武器"))')
  await rec('配方按鈕位於自己的卡片內且不互相覆蓋','[...document.querySelectorAll(".recipe-card footer")].every(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom+1&&a.left>=b.left&&a.right<=b.right+1;})')
  await p.evaluate('g.closeModalsM();g.fInit().codexFilter="all";g.renderCodex();document.querySelector("#codexPanel").hidden=false')
  await rec('圖鑑207條且未遇怪物隱藏','document.querySelectorAll("#codexGrid article").length===207&&document.querySelectorAll(".codex-locked19").length>100')
  await p.set_content(document());await p.wait_for_timeout(250);await p.evaluate('window.g=ElementalSwap.game;g.paused=true;')
  # Build/render a native creature and its boss in each biome; no content unlock persists.
  smoke=await p.evaluate('''()=>{const result=[];for(const b of Object.values(ES19.biomes)){g.xTravel(b.sites[1],true);g.paused=true;g.player.inv=0;g.render();const e=g.enemies.find(e=>e.room===b.sites[1]);if(e){g.fWarn(e,e.fPattern||ES19.species[e.species17]?.pattern||'fan');g.render();}const r=b.sites.map(id=>g.roomById.get(id)).find(r=>r.boss19),id=r.boss19;let boss=null;if(id){g.fSummonBoss(id,r);boss=g.enemies.find(e=>e.species17===id&&!e.dead);if(boss)g.fCreaturePortrait(document.createElement('canvas'),id);}result.push({biome:b.id,pass:!!e&&!!boss});}return result;}''')
  out.append({'test':'25 生境原生種與王種真實渲染路徑','pass':all(x['pass'] for x in smoke),'detail':smoke})
  for w,h in [(1600,1000),(1280,800),(896,414),(390,844)]:
   await p.set_viewport_size({'width':w,'height':h});await p.evaluate(f'g.xTravel("r00",true);g.xSetMode("{"mobile" if w<1000 else "desktop"}");g.paused=true;g.nUpdateHUD();');await p.wait_for_timeout(100)
   await rec(f'{w}×{h} 小地圖與補給按鈕在視窗內','["#minimap19","#quickItem19"].every(s=>{const b=document.querySelector(s).getBoundingClientRect();return b.width>0&&b.x>=0&&b.y>=0&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1;})')
   await p.evaluate('g.fOpenAtlas();g.fCenterMap(6);');await rec(f'{w}×{h} 地圖面板無水平溢出','document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector("#mapPanel .panel").scrollWidth<=document.querySelector("#mapPanel .panel").clientWidth+1')
   await p.evaluate('g.closeModalsM();g.xOpen("craft")');await rec(f'{w}×{h} 配方面板無水平溢出','document.querySelector("#expeditionPanel .panel").scrollWidth<=document.querySelector("#expeditionPanel .panel").clientWidth+1');await p.evaluate('g.closeModalsM()')
  await b.close()
 print(json.dumps({'results':out,'pageErrors':errs},ensure_ascii=False,indent=2))
asyncio.run(main())
