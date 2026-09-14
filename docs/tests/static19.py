"""Validate deployable multi-file resources under a project URL, plus JS syntax."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from urllib.request import urlopen
import threading,subprocess,re,json,hashlib
R=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(R.parent)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/{R.name}/'
index=(R/'index.html').read_text();refs=['index.html','.nojekyll']+re.findall(r'<script src="([^"]+)"',index)+re.findall(r'<link rel="stylesheet" href="([^"]+)"',index)+[p.relative_to(R).as_posix() for p in sorted((R/'assets').rglob('*')) if p.is_file()]
results=[]
try:
 for ref in sorted(set(refs)):
  with urlopen(base+ref,timeout=10) as response:
   blob=response.read();expected=(R/ref).read_bytes();results.append({'path':ref,'status':response.status,'pass':blob==expected})
finally:server.shutdown()
syntax=[]
for p in sorted((R/'js').glob('*.js')):
 proc=subprocess.run(['node','--check',str(p)],capture_output=True,text=True);syntax.append({'file':p.name,'pass':proc.returncode==0,'error':proc.stderr or None})
report={'requestMode':'HTTP requests under /esv19/ project subpath, not browser navigation','requests':results,'javascriptSyntax':syntax,'passed':all(x['pass'] for x in results+syntax)}
print(json.dumps(report,ensure_ascii=False,indent=2))
