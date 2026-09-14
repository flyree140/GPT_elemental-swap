#!/usr/bin/env python3
"""Recompile authored V19 JSON data; no random room generation or npm required."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
def compile_data():
 source=ROOT/'docs/FRONTIER19_CONTENT.json';dest=ROOT/'js/frontier_data.js'
 d=json.loads(source.read_text(encoding='utf-8'))
 assert len(d['rooms'])==175 and len(d['biomes'])==25
 assert len({r['id'] for r in d['rooms']})==175
 # Keep the short registration tail explicit and separate from the authored content.
 tail=''';const D=ES19;
W.rooms.push(...D.rooms);W.edges.push(...D.edges);W.shelters.push(...D.rooms.filter(r=>r.shelter).map(r=>r.id));
for(const b of Object.values(D.biomes))W.regions.push({id:'f19_'+b.id,name:b.name,color:b.color,palette:b.palette});
Object.assign(ES17.materials,D.materials);Object.assign(ES17.recipes,D.recipes);Object.assign(ES17.species,D.species);
for(const [id,s]of Object.entries(D.species))C.ENEMIES[id]={name:s.name,ai:'frontier19',hp:s.hp,speed:s.speed,damage:s.damage,color:s.color,tip:s.counter};
C.VERSION=D.version;
})();
'''
 text="/* V19 compiled locations. Edit docs/FRONTIER19_CONTENT.json; run tools/compile_frontier19.py. */\n(()=>{'use strict';const C=ES9,W=ES9_WORLD;window.ES19="+json.dumps(d,ensure_ascii=False,separators=(',',':'))+tail
 dest.write_text(text,encoding='utf-8');return dest
if __name__=='__main__':print(compile_data())
