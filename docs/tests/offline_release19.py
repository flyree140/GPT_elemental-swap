"""Smoke-test exact delivered HTML and ZIP, without mock storage or fixture unlocks."""
from pathlib import Path
from playwright.async_api import async_playwright
import asyncio,json,zipfile,hashlib,re
R=Path(__file__).resolve().parents[1];parent=R.parent
async def main():
 errors=[];requests=[];file=parent/'ESV19_PLAY.html';zpath=parent/'ESV19_GITHUB_READY.zip'
 with zipfile.ZipFile(zpath) as z:
  corrupt=z.testzip();names=z.namelist();ix=z.read('index.html').decode();refs=re.findall(r'<script src="([^"]+)"|<link rel="stylesheet" href="([^"]+)"',ix)
  package={'CRC':corrupt is None,'rootIndex':'index.html' in names,'allIndexDependencies':all((a or b) in names for a,b in refs),'standaloneMatches':z.read('PLAY_OFFLINE.html')==file.read_bytes(),'noFonts':not any(Path(n).suffix.lower() in ['.ttf','.otf','.ttc','.woff','.woff2'] for n in names),'entryCount':len(names)}
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await b.new_page(viewport={'width':1440,'height':1000});p.on('pageerror',lambda e:errors.append(str(e)));p.on('requestfailed',lambda r:requests.append({'url':r.url[:140],'error':r.failure}))
  await p.set_content(file.read_text());await p.wait_for_timeout(750)
  result=await p.evaluate('''()=>{const g=window.ElementalSwap?.game;return{ready:!!g,rooms:g?.rooms.length,brand:document.querySelector('.brand span').textContent,assetsEmbedded:Object.keys(window.ES9_ASSET_URIS||{}).length,allLoadedGameImages:Object.values(g?.assets||{}).every(im=>im.naturalWidth>0),testStoragePresent:Object.hasOwn(window,'__testStore19'),playerFinite:Number.isFinite(g?.player.x)&&Number.isFinite(g?.player.y)}}''')
  await p.click('#mapButton');await p.click('#atlasCenter19');result['locatorVisible']=await p.evaluate('!document.querySelector("#mapPanel").hidden&&document.querySelector("#atlasPosition19").textContent.includes("海崖初始避難所")')
  await p.evaluate('ElementalSwap.game.closeModalsM()');await p.keyboard.press('x');await p.wait_for_timeout(450);result['XResponds']=await p.evaluate('ElementalSwap.game.fInit().lastCommand?.key==="X"');await b.close()
 checks=all(v for k,v in package.items() if k!='entryCount') and result['ready'] and result['rooms']==300 and result['allLoadedGameImages'] and not result['testStoragePresent'] and result['playerFinite'] and result['locatorVisible'] and result['XResponds'] and not errors and not requests
 print(json.dumps({'exactStandaloneSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'package':package,'runtime':result,'pageErrors':errors,'requestFailures':requests,'passed':checks,'limitations':'set_content of exact release file; no native-origin persistence or live GitHub deployment verification'},ensure_ascii=False,indent=2))
asyncio.run(main())
