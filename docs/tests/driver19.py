import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
from harness19 import document
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=await b.new_page(viewport={'width':1440,'height':1000});err=[]
  p.on('pageerror',lambda e:err.append(str(e)))
  await p.set_content(document(storage='--storage' in sys.argv));await p.wait_for_timeout(400)
  await p.evaluate('window.g=ElementalSwap.game;g.paused=true;g.closeModalsM()')
  try: results=await p.evaluate(Path(sys.argv[1]).read_text())
  except Exception as e: results={'error':str(e)}
  report={'results':results,'pageErrors':err}
  print(json.dumps(report,ensure_ascii=False,indent=2))
  await b.close()
asyncio.run(main())
