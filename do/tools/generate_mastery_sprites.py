"""只新增兩個職業圖集；不觸碰 V9.1 的七職、德魯伊或怪物素材。"""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
# Reuse the verified V9.1 frame painter definitions, not its file-writing loops.
source=(ROOT/'tools/generate_v9_1_fix_assets.py').read_text()
ns={'__file__':str(ROOT/'tools/generate_v9_1_fix_assets.py')}
exec(source[:source.index('for cls in PALETTES:')],ns)
P=ns['PALETTES']
P['alchemist']=dict(body='#f3e5c3',coat='#b77d45',dark='#403729',accent='#96db9c',skin='#d9ac88',hair='#443020',weapon='#b5f4b5')
P['monk']=dict(body='#ece5cf',coat='#409492',dark='#1f3e47',accent='#8fe7e1',skin='#dca580',hair='#1f2c34',weapon='#adf5f0')
for cls in ['alchemist','monk']:
 sheet=Image.new('RGBA',(384,832))
 for r in range(16):
  for f in range(8):
   # Existing function gives coherent feet/head pivots with no cross-row pixels.
   frame=ns['humanoid_frame'](cls,r,f);d=ImageDraw.Draw(frame)
   if r!=11:
    if cls=='alchemist':
     d.rectangle((12,25,15,30),fill='#90d6a3');d.rectangle((13,23,14,25),fill='#ece7b1')
     d.rectangle((28,30,31,35),fill='#eba66c');d.point((29,31),fill='#fff8df')
    else:
     # Hand wraps instead of a sword: forearm accent and monk headband.
     d.rectangle((14,25,17,28),fill='#d7ffed');d.rectangle((33,23,36,26),fill='#d7ffed')
     d.rectangle((20,9,29,10),fill='#a9f1dc')
   sheet.alpha_composite(frame,(f*48,r*52))
 sheet.save(ROOT/'assets/sprites'/f'player_{cls}.png')
print('2 new sheets: 384x832 / 48x52 frames')
