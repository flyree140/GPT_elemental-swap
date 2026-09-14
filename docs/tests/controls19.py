import asyncio,json
from playwright.async_api import async_playwright
from harness19 import document
async def main():
 out=[];errs=[]
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await b.new_page(viewport={'width':1440,'height':1000},has_touch=True);p.on('pageerror',lambda e:errs.append(str(e)))
  await p.set_content(document());await p.wait_for_timeout(600)
  async def reset():
   await p.evaluate('''window.g=ElementalSwap.game;g.closeModalsM();g.nStartTutorial('job','dreamweaver');g.n18.tutorial.done=true;g.cooldownsM={};g.enemies=g.enemies.filter(e=>e.training18);g.n18.events=[];g.paused=false;g.hitStop=0;''')
  async def rec(name,expr):
   out.append({'test':name,'pass':bool(await p.evaluate(expr))})
  await reset();await p.keyboard.down('c');await p.wait_for_timeout(120);await rec('實際鍵盤按住 C 未釋放不施放','!g.n18.events.some(e=>e.type==="skill")');await p.keyboard.up('c');await p.wait_for_timeout(180);await rec('實際鍵盤 C 短按成功','g.n18.events.filter(e=>e.type==="skill"&&e.value==="dreamweaver_v18_seed").length===1')
  await reset();await p.keyboard.down('c');await p.wait_for_timeout(1100);await rec('實際鍵盤長按蓄力卡可見','!document.querySelector("#castPreview18").hidden');await p.keyboard.up('c');await p.wait_for_timeout(150);await rec('實際鍵盤長按施放同招','g.n18.events.some(e=>e.type==="chargedSkill"&&e.value==="dreamweaver_v18_seed")')
  await reset();await p.evaluate('g.hitStop=.4');await p.keyboard.down('v');await p.wait_for_timeout(90);await p.keyboard.up('v');await p.wait_for_timeout(600);await rec('命中停頓期間按下放開仍只施放一次','g.n18.events.filter(e=>e.type==="skill"&&e.value==="dreamweaver_v18_decoy").length===1')
  await reset();await p.keyboard.down('c');await p.wait_for_timeout(160);await p.keyboard.press('l');await p.keyboard.up('c');await p.wait_for_timeout(200);await rec('開選單取消蓄力且沒有誤射','!document.querySelector("#masteryPanel").hidden&&!g.n18.events.some(e=>e.type==="skill"||e.type==="chargedSkill")');await p.click('#masteryPanel .close')
  await reset();await p.evaluate('window.oldX18=g.player.x;window.oldShot18=g.n18.shots.length;');await p.keyboard.press('x');await p.wait_for_timeout(700);await rec('實際 X 普攻不強迫走位或發射','Math.abs(g.player.x-oldX18)<1&&g.n18.shots.length===oldShot18')
  await reset();await p.set_viewport_size({'width':896,'height':414});await p.evaluate('g.xSetMode("mobile")');await p.wait_for_timeout(200)
  await rec('手機切換顯示觸控與五技能','document.body.classList.contains("mobile-mode")&&document.querySelectorAll(".touch-skills [data-touch]").length===5')
  # CDP touches use the browser's pointer event pipeline, not calls to game logic.
  cd=await p.context.new_cdp_session(p)
  box=await p.locator('.touch-skills [data-touch="skill1"]').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
  await cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]});await p.wait_for_timeout(1050);await cd.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await p.wait_for_timeout(150)
  await rec('手機實際觸控長按 C','g.n18.events.some(e=>e.type==="chargedSkill"&&e.value==="dreamweaver_v18_seed")')
  await reset();await cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':2}]});await p.wait_for_timeout(250);await cd.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});await p.wait_for_timeout(150)
  await rec('手機 touchCancel 不轉成短按','!g.n18.events.some(e=>e.type==="skill"||e.type==="chargedSkill")')
  await p.evaluate('g.nEndTutorial();g.xSetMode("desktop");g.paused=true');await rec('可返回電腦模式','!document.body.classList.contains("mobile-mode")')
  for w,h in [(1440,1000),(1280,800),(896,414),(390,844)]:
   await p.set_viewport_size({'width':w,'height':h});await p.evaluate(f'g.xSetMode("{"mobile" if w<1000 else "desktop"}")');await p.wait_for_timeout(100)
   await rec(f'{w}x{h} 頁面無橫向溢出','document.documentElement.scrollWidth<=innerWidth+1')
   await p.evaluate('g.vOpen()');await rec(f'{w}x{h} 九規則卡且模態可捲动','document.querySelectorAll(".rule-card18").length===9 && document.querySelector("#visionPanel .panel").scrollWidth<=document.querySelector("#visionPanel .panel").clientWidth+1');await p.evaluate('g.closeModalsM()')
  await b.close()
 print(json.dumps({'results':out,'pageErrors':errs},ensure_ascii=False,indent=2))
asyncio.run(main())
