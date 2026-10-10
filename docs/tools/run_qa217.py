#!/usr/bin/env python3
"""Run the shipped regression suites in isolated, disposable Chromium pages.
Install test-only tools: pip install playwright ; playwright install chromium
The game itself has no Playwright dependency. No account / network is required at run time.
"""
from pathlib import Path
import argparse, json, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--chromium',help='Optional local browser executable')
    p.add_argument('--output',type=Path,default=Path('reports/qa217_local'))
    a=p.parse_args();root=Path(__file__).resolve().parents[1]
    a.output.mkdir(parents=True,exist_ok=True); failed=False
    with tempfile.TemporaryDirectory() as temp:
        html=Path(temp)/'test_inline.html'
        subprocess.run([sys.executable,str(root/'tools/build_singlefile.py'),'--output',str(html)],cwd=root,check=True)
        with sync_playwright() as pw:
            launch={'headless':True,'args':['--disable-dev-shm-usage']}
            if a.chromium: launch['executable_path']=a.chromium
            browser=pw.chromium.launch(**launch)
            for name in ['regression217','qa217']:
                page=browser.new_page(viewport={'width':1600,'height':900});errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.set_content(html.read_text(encoding='utf-8'),wait_until='load',timeout=90000)
                page.wait_for_function("window.ES21_BOOT?.status==='ready'",timeout=30000)
                result=page.evaluate((root/f'tools/{name}.js').read_text(encoding='utf-8'))
                result['pageErrors']=errors
                (a.output/f'{name}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
                print(name, result['passed'], '/',result['total'],'pageErrors:',len(errors))
                failed|=result['passed']!=result['total'] or bool(errors)
                page.close()
            browser.close()
    sys.exit(1 if failed else 0)
if __name__=='__main__':main()
