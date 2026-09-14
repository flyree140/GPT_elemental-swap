"""Capture the actual release renderer. QA travel stages scenes, never alters release content."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
from build_v19 import ROOT,standalone
async def main():
 standalone(ROOT);out=ROOT/'previews';out.mkdir(exist_ok=True);errors=[];meta=[]
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await b.new_page(viewport={'width':1600,'height':1000},has_touch=True);p.on('pageerror',lambda e:errors.append(str(e)))
  await p.set_content((ROOT/'PLAY_OFFLINE.html').read_text());await p.wait_for_timeout(650);await p.evaluate('window.g=ElementalSwap.game;g.paused=true;g.message.t=0;g.nUpdateHUD();')
  async def shot(name,title,staged=False):
   await p.evaluate("window.scrollTo(0,0);document.querySelectorAll('.message').forEach(e=>e.textContent='');");await p.wait_for_timeout(80);await p.screenshot(path=str(out/(name+'.png')));meta.append({'file':name+'.png','title':title,'staged':staged,'viewport':p.viewport_size})
  await shot('01_refuge_minimap','海崖避難所與即時小地圖')
  await p.click('#mapButton');await p.click('#atlasAll19');await shot('02_world_atlas','300 地點・世界總圖与醒目定位')
  await p.click('#atlasCenter19');await shot('03_local_position','定位我・相鄰地形與步行路線')
  await p.evaluate('g.closeModalsM();g.xOpen("journey")');await shot('04_field_journal','生境圖譜・地區研究與環境裝備')
  await p.evaluate('g.closeModalsM();g.xOpen("craft")');await p.click('[data-filter19="weapon"]');await shot('05_equipment','武器配方・機制用途與材料條件')
  await p.evaluate('g.closeModalsM();document.querySelector("#comboPanel").hidden=false;g.renderComboGrid()');await shot('06_combo_manual','Z／X 連段的範圍、段數與用途')
  for bio,name,title in [('naos','07_underwater_temple','水下神殿・分層水域與怪物攻擊預告'),('protospores','08_ancient_fungi','古代真菌紀・當地生態與研究機關'),('sirocco','09_desert','赤帆沙漠・風口與流沙阻力')]:
   await p.evaluate(f'''g.closeModalsM();g.xTravel('r00',true);g.xSetRace('{'merfolk' if bio=='naos' else 'human'}');g.xTravel(ES19.biomes.{bio}.sites[1],true);g.player.inv=0;g.player.hp=g.player.maxHp;g.paused=false;''')
   await p.wait_for_timeout(650)
   await p.evaluate('g.paused=true;g.message.t=0;g.player.inv=0;g.nUpdateHUD();')
   await shot(name,title,True)
  await p.evaluate('g.closeModalsM();g.xTravel("r00",true);g.xSetRace("human");g.xSetMode("mobile");g.player.inv=0;g.paused=false;')
  await p.set_viewport_size({'width':896,'height':414});await p.wait_for_timeout(350);await p.evaluate('g.paused=true;g.message.t=0;g.nUpdateHUD();');await shot('10_mobile_landscape','手機橫向・小地圖與固定五槽觸控')
  await p.set_viewport_size({'width':390,'height':844});await p.evaluate('g.paused=false;');await p.wait_for_timeout(600);await p.evaluate('g.paused=true;g.nUpdateHUD();');await shot('11_mobile_portrait','手機直向・觸控操作')
  await p.set_viewport_size({'width':1600,'height':1000});await p.evaluate('g.xSetMode("desktop");g.paused=true;')
  # The catalog is extracted from the running release, including reduced cooldowns.
  catalog=await p.evaluate('({jobs:ES18.jobs,skills:ES18.skills,commands:ES19.commands,stats:ES19.stats,races:ES17.races,recipes:ES17.recipes,materials:ES17.materials,rules:ES18.order,assets:Object.keys(ES9_ASSET_URIS).length})')
  (ROOT/'docs/RUNTIME19_CATALOG.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
  await b.close()
 (out/'manifest.json').write_text(json.dumps({'images':meta,'pageErrors':errors,'capture':'Chromium set_content of unmodified PLAY_OFFLINE.html; no test-storage shim'},ensure_ascii=False,indent=2))
 print(json.dumps({'screenshots':len(meta),'pageErrors':errors},ensure_ascii=False))
asyncio.run(main())
