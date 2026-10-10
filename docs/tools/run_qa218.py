#!/usr/bin/env python3
"""Build standalone and execute legacy / adapted compatibility / 21.8 targeted QA.
Test-only dependency: pip install playwright; playwright install chromium.
Game runtime remains dependency-free and offline-capable.
"""
from pathlib import Path
import argparse, json, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chromium',help='Optional local Chromium executable')
    parser.add_argument('--output',type=Path,default=Path('reports/qa218'))
    parser.add_argument('--suite',default='all',choices=['all','qa218','qa218_compat','regression217'])
    args=parser.parse_args();root=Path(__file__).resolve().parents[1]
    output=args.output.resolve();output.mkdir(parents=True,exist_ok=True)
    failed=False
    with tempfile.TemporaryDirectory() as temp:
        html=Path(temp)/'test_inline.html'
        subprocess.run([sys.executable,str(root/'tools/build_singlefile.py'),'--output',str(html)],cwd=root,check=True)
        content=html.read_text(encoding='utf-8')
        with sync_playwright() as pw:
            launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
            if args.chromium:launch['executable_path']=args.chromium
            browser=pw.chromium.launch(**launch)
            suites=['regression217','qa218_compat','qa218'] if args.suite=='all' else [args.suite]
            for name in suites:
                page=browser.new_page(viewport={'width':1600,'height':900});errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.set_content(content,wait_until='load',timeout=90000)
                page.wait_for_function("window.ES21_BOOT?.status==='ready'",timeout=30000)
                try:
                    result=page.evaluate((root/f'tools/{name}.js').read_text(encoding='utf-8'))
                except Exception as exc:
                    result={'passed':0,'total':1,'results':[{'name':'Unhandled test error','pass':False,'detail':str(exc)}]}
                result['pageErrors']=errors
                (output/f'{name}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
                print(name,result['passed'],'/',result['total'],'pageErrors:',len(errors),flush=True)
                for item in result['results']:
                    if not item['pass']:print('FAIL:',json.dumps(item,ensure_ascii=False),flush=True)
                failed |= result['passed']!=result['total'] or bool(errors)
                page.close()
            browser.close()
    return 1 if failed else 0
if __name__=='__main__':sys.exit(main())
