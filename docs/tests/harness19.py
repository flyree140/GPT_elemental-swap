"""Build in-memory test HTML from release sources. Optional mock storage is TEST ONLY.
The managed browser disallows URL navigation, so tests use set_content.
"""
from pathlib import Path
import sys, json
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build_v19 import standalone

def document(storage=False):
 standalone(ROOT)
 s=(ROOT/'PLAY_OFFLINE.html').read_text()
 if storage:
  s=s.replace('<script>window.ES9_ASSET_URIS=', '<script>window.__testStore19={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__testStore19[k]??null,setItem:(k,v)=>window.__testStore19[k]=String(v),removeItem:k=>delete window.__testStore19[k],clear:()=>window.__testStore19={}}});</script><script>window.ES9_ASSET_URIS=')
 return s
