"""Local, original pixel overlays/actors; biome art. Deterministic, PIL only.
No downloaded assets or fonts. V16 monster silhouettes retained and reworked.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json, math, random, colorsys
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'tools/v17_art_data.json').read_text())
OUT=ROOT/'assets/v17'; OUT.mkdir(exist_ok=True)
SPR=ROOT/'assets/sprites'
def rgb(h): return tuple(bytes.fromhex(h.lstrip('#')[:6]))
def shade(c,m): return tuple(max(0,min(255,int(v*m))) for v in c)
def mix(a,b,t): return tuple(int(x*(1-t)+y*t) for x,y in zip(a,b))
classes={p.stem[7:]:{'accent':'#8fbbbe'} for p in SPR.glob('player_*.png') if 'beast' not in p.stem}
classes.update({k:v for k,v in DATA['classes'].items() if k!='beast'})
# 64×80-pixel actor, 8 animation frames × 13 states. Silhouette, cloth, metal and tool each have 3 shades.
for ci,(cls,cfg) in enumerate(classes.items()):
    sheet=Image.new('RGBA',(512,1040)); accent=rgb(cfg.get('accent','#aacac1')); dark=(21,36,47); skin=(218,178,141); pale=(253,217,166)
    for row in range(13):
      for fr in range(8):
        im=Image.new('RGBA',(64,80)); d=ImageDraw.Draw(im); ph=fr/8*math.tau
        running=row in (1,9); swing=row in (4,5,6,7,8,12)
        bob=int(math.sin(ph)*(2 if running else 1)); lx=int(math.sin(ph)*7) if running else 1; lean=(5 if row==9 else 2 if swing else 0)
        oy=bob-2 if row in (2,3,8) else bob
        # cloak, with stepped fold edge and separate highlight seam
        d.polygon([(22+lean,28+oy),(37+lean,30+oy),(39,49+oy),(27-lx//3,62+oy),(11-lx//2,55+oy),(16,43+oy)],fill=shade(accent,.43))
        d.line([(22+lean,30+oy),(20,45+oy),(14-lx//2,53+oy)],fill=accent,width=2)
        d.line([(28,34+oy),(29-lx//3,57+oy)],fill=shade(accent,.65),width=3)
        # lower limbs, boots
        for side in (-1,1):
          xx=28+side*5+side*lx
          yy=55+oy+int(abs(lx)/3)*(1 if side==1 else -1)
          d.polygon([(27+side*4,47+oy),(33+side*4,47+oy),(xx+4,yy+13),(xx-3,yy+13)],fill=dark)
          d.line([(29+side*4,49+oy),(xx,yy+8)],fill=(80,101,105),width=3)
          d.rectangle((xx-4,yy+10,xx+7,yy+17),fill=(23,34,41));d.rectangle((xx-3,yy+10,xx+4,yy+12),fill=(141,133,110));d.line((xx-4,yy+17,xx+7,yy+17),fill=(183,162,124),width=1)
        # tunic + breastplate + belt / pouches
        d.polygon([(24+lean,28+oy),(37+lean,29+oy),(40,49+oy),(24,52+oy),(20+lean,37+oy)],fill=dark)
        d.polygon([(25+lean,29+oy),(35+lean,29+oy),(36,47+oy),(24,47+oy)],fill=shade(accent,.85))
        d.rectangle((27+lean,32+oy,31+lean,43+oy),fill=shade(accent,1.22))
        d.line((24,47+oy,39,47+oy),fill=(226,185,121),width=3)
        d.rectangle((26,47+oy,29,50+oy),fill=(244,224,167));d.rectangle((36,47+oy,41,54+oy),fill=(102,79,61));d.point((38,49+oy),fill=(231,202,143))
        # shoulder layered metal
        d.rectangle((20+lean,28+oy,25+lean,32+oy),fill=(153,169,160));d.rectangle((21+lean,28+oy,24+lean,29+oy),fill=(223,226,194))
        # neck / face with nose, ear, eye and jaw contour
        d.rectangle((29+lean,24+oy,34+lean,29+oy),fill=shade(skin,.75))
        d.rectangle((24+lean,11+oy,37+lean,24+oy),fill=(40,46,53));d.rectangle((27+lean,13+oy,38+lean,23+oy),fill=skin)
        d.rectangle((29+lean,14+oy,36+lean,20+oy),fill=pale);d.rectangle((38+lean,17+oy,40+lean,20+oy),fill=skin)
        d.rectangle((34+lean,16+oy,37+lean,17+oy),fill=(35,55,67));d.point((36+lean,16+oy),fill=(166,236,227))
        d.line((31+lean,23+oy,36+lean,23+oy),fill=(130,95,85));d.rectangle((24+lean,18+oy,26+lean,21+oy),fill=skin)
        # hair/hood profiles differ by class
        hair=(62+ci*8%85,63+ci*11%70,70+ci*7%65)
        d.rectangle((24+lean,9+oy,35+lean,13+oy),fill=hair);d.rectangle((22+lean,12+oy,28+lean,17+oy),fill=hair);d.rectangle((23+lean,13+oy,25+lean,23+oy),fill=hair)
        d.line((26+lean,10+oy,34+lean,10+oy),fill=shade(hair,1.65),width=1)
        d.rectangle((24+lean,25+oy,38+lean,28+oy),fill=accent);d.rectangle((19+lean,26+oy,26+lean,30+oy),fill=shade(accent,.7))
        d.line((21+lean,29+oy,13-int(math.sin(ph)*3),33+oy),fill=accent,width=3)
        # arm, articulated for attack/cast
        handx=44+(int(math.sin(fr/7*math.pi)*9) if swing else 0); handy=35+oy-(8 if row==7 else 0)+(int(math.sin(ph)*4) if running else 0)
        d.line((37+lean,31+oy,40,38+oy,handx,handy),fill=(27,37,48),width=7);d.line((38+lean,31+oy,41,36+oy),fill=shade(accent,1.2),width=4);d.rectangle((handx-2,handy-2,handx+2,handy+2),fill=skin)
        # bespoke occupational equipment
        if cls in ('gunner','sharpshooter','harrier'):
          d.rectangle((handx-10,handy-4,61,handy+1),fill=(27,38,47));d.line((handx-7,handy-4,61,handy-4),fill=(204,209,173),width=2);d.rectangle((44,handy-9,52,handy-6),fill=(32,49,58));d.rectangle((48,handy-8,53,handy-7),fill=accent)
          if cls=='sharpshooter':d.rectangle((55,handy-3,63,handy),fill=(160,180,173));d.rectangle((24+lean,8+oy,38+lean,12+oy),fill=shade(accent,.6))
          if swing and fr in (3,4):d.polygon([(62,handy),(57,handy-9),(63,handy-5)],fill=(255,231,170))
        elif cls in ('alchemist','chef'):
          if cls=='alchemist':
            d.rectangle((43,handy-13,47,handy-7),fill=(195,229,215));d.polygon([(43,handy-7),(40,handy+2),(49,handy+2),(47,handy-7)],fill=(80,198,149));d.rectangle((43,handy-5,44,handy-1),fill=(211,248,197));d.rectangle((20,35+oy,24,39+oy),fill=(229,167,115))
          else:
            d.rectangle((handx,handy-18,handx+5,handy-5),fill=(216,227,204));d.line((handx+1,handy-16,handx+1,handy-5),fill=(255,254,219));d.rectangle((24+lean,6+oy,38+lean,11+oy),fill=(237,230,209));d.rectangle((26+lean,3+oy,35+lean,7+oy),fill=(252,244,220));d.rectangle((27,33+oy,35,45+oy),fill=(222,218,193))
        elif cls in ('summoner','chrono','dreamweaver','cartographer','puppeteer','artificer'):
          d.line((handx,handy+20,handx+1,handy-25),fill=(180,157,111),width=3);d.line((handx-1,handy+19,handx,handy-24),fill=(232,213,162),width=1)
          d.polygon([(handx,handy-33),(handx+6,handy-27),(handx+1,handy-20),(handx-5,handy-26)],fill=shade(accent,1.12));d.point((handx,handy-29),fill=(245,252,223))
          if cls=='cartographer':d.rectangle((17,37+oy,25,47+oy),fill=(218,203,150));d.line((19,39+oy,23,44+oy),fill=(57,109,112))
          if cls=='puppeteer':
            d.line((handx-4,handy-27,handx-9,handy-7),fill=(197,223,213));d.rectangle((handx-12,handy-8,handx-7,handy-2),fill=(174,130,107))
          if cls=='dreamweaver':d.polygon([(21+lean,12+oy),(31+lean,0+oy),(39+lean,12+oy)],fill=shade(accent,.55))
        elif cls=='warden':
          d.polygon([(handx-6,handy-14),(handx+10,handy-11),(handx+9,handy+10),(handx+2,handy+16),(handx-7,handy+9)],fill=(46,73,85));d.line([(handx-5,handy-13),(handx+9,handy-10),(handx+8,handy+9),(handx+2,handy+14)],fill=(215,189,129),width=2);d.rectangle((handx,handy-6,handx+3,handy+7),fill=accent)
        elif cls=='monk':
          d.rectangle((handx-3,handy-4,handx+5,handy+4),fill=(221,197,143));d.line((handx-2,handy-3,handx+4,handy-3),fill=(245,241,201),width=2)
        else:
          d.line((handx-2,handy+7,handx+6,handy-24),fill=(218,237,226),width=4);d.line((handx-1,handy+2,handx+5,handy-21),fill=shade(accent,1.4),width=2);d.line((handx-6,handy+2,handx+7,handy+5),fill=(222,194,127),width=3)
        if row==11: im=im.rotate(78,resample=Image.Resampling.NEAREST,expand=False,center=(32,55))
        if row==10 and fr%2:im.putalpha(im.getchannel('A').point(lambda a:int(a*.9)))
        sheet.alpha_composite(im,(fr*64,row*80))
    sheet.save(SPR/f'player_{cls}.png',optimize=True)
# Reinterpret existing creature animation silhouettes; biome-specific color and additional pixel anatomy.
for sid,spec in DATA['data']['species'].items():
    base=SPR/f"enemy_{spec['baseai']}.png"
    if not base.exists():base=SPR/'enemy_slime.png'
    original=Image.open(base).convert('RGBA'); im=Image.new('RGBA',original.size); pix=im.load(); src=original.load()
    c=rgb(DATA['data']['biomes'][spec['biome']]['color']); r=random.Random(sid)
    for y in range(im.height):
      for x in range(im.width):
        rr,g,b,a=src[x,y]
        if a:
          lum=(rr*.3+g*.5+b*.2)/255; col=mix((17,32,49),c,min(1,lum*1.25)); col=mix(col,(242,237,205),max(0,(lum-.65)*1.1))
          pix[x,y]=(*col,a)
    d=ImageDraw.Draw(im)
    for row in range(im.height//48):
      for fr in range(8):
        x,y=fr*48,row*48; variant=bool(spec.get('variant')=='變異種') or sid.endswith('_v')
        # dorsal crystals/fins and expressive luminous eye cluster; boss crown uses three staggered spires
        if spec['biome'] in ('glacier','umbra','abyss') or variant:
          for k in range(3):d.polygon([(x+13+k*7,y+17),(x+16+k*7,y+6-k%2*3),(x+20+k*7,y+18)],fill=(*shade(c,1.1),255))
        if spec['biome'] in ('reef','sky'):
          d.polygon([(x+7,y+24),(x+1,y+15),(x+3,y+30),(x+14,y+34)],fill=(*shade(c,.9),255))
        if spec['biome']=='metro':
          d.rectangle((x+12,y+17,x+31,y+19),fill=(218,222,172,255));d.rectangle((x+17,y+12,x+19,y+16),fill=(79,187,184,255))
        if spec.get('boss'):
          for k in range(3):d.polygon([(x+13+k*7,y+15),(x+16+k*7,y+2-(k==1)*2),(x+20+k*7,y+15)],fill=(240,218,157,255))
        d.rectangle((x+29,y+22,x+32,y+24),fill=(246,249,201,255));d.point((x+32,y+23),fill=(22,45,49,255))
    im.save(SPR/f'enemy_{sid}.png',optimize=True)
# Eight hand-authored procedural compositions, large pixel clusters + meaningful environmental silhouettes.
for bid,b in DATA['data']['biomes'].items():
    rng=random.Random('afterlight'+bid); w,h=640,400; im=Image.new('RGB',(w,h)); d=ImageDraw.Draw(im); c=rgb(b['color'])
    top,bottom={
      'glacier':((53,96,122),(172,210,213)), 'dune':((74,65,104),(227,185,126)),
      'reef':((25,90,113),(77,153,156)), 'abyss':((12,33,65),(33,84,115)),
      'sky':((61,110,145),(204,218,208)), 'umbra':((31,38,77),(113,96,144)),
      'inferno':((40,39,59),(154,76,73)), 'metro':((23,41,65),(87,104,124))}[bid]
    for yy in range(h):d.line((0,yy,w,yy),fill=mix(top,bottom,yy/h))
    if bid in ('glacier','dune','sky','umbra','inferno','metro'):
      sunx=470 if bid!='dune' else 130; suny=74; rad=31 if bid!='umbra' else 42
      d.ellipse((sunx-rad,suny-rad,sunx+rad,suny+rad),fill=mix(c,(241,225,183),.65))
      if bid in ('umbra','metro'):d.ellipse((sunx-rad+16,suny-rad-5,sunx+rad+10,suny+rad-2),fill=top)
    if bid in ('reef','abyss'):
      for k in range(8):
        xx=rng.randrange(-50,w);d.polygon([(xx,0),(xx+12,0),(xx+90,h),(xx+12,h)],fill=mix(bottom,top,.38))
      for k in range(45):
        xx=rng.randrange(w);yy=rng.randrange(50,300);d.line((xx,yy,xx+4,yy),fill=mix(c,(239,234,190),.5));d.point((xx+5,yy-1),fill=c)
    # multi-depth landscape silhouettes
    for layer in range(3):
      yy=170+layer*64;col=mix(top,bottom,.15+layer*.2)
      if bid=='dune':
        pts=[(0,h)]+[(x,yy+int(math.sin(x/125+layer*2)*40)) for x in range(0,w+30,30)]+[(w,h)];d.polygon(pts,fill=col)
      elif bid=='metro':
        for x in range(-10,w,35+layer*12):
          bh=rng.randrange(50,150);bw=rng.randrange(20,45);d.rectangle((x,yy-bh,x+bw,h),fill=col)
          for px in range(x+4,x+bw-2,7):
            for py in range(yy-bh+7,yy+25,10):
              if rng.random()<.65:d.rectangle((px,py,px+2,py+3),fill=mix(c,(246,214,147),.6 if layer==2 else .15))
          d.rectangle((x+bw//2,yy-bh-10,x+bw//2+2,yy-bh),fill=col)
      elif bid=='sky':
        for x in range(0,w,150):
          yy2=yy+rng.randrange(-50,30);d.polygon([(x,yy2),(x+100,yy2-6),(x+74,yy2+38),(x+45,yy2+66),(x+23,yy2+30)],fill=col);d.rectangle((x+7,yy2-6,x+84,yy2),fill=mix(bottom,(234,225,184),.4))
      else:
        pts=[(0,h)]+[(x,yy+rng.randrange(-105 if bid=='glacier' else -60,30)) for x in range(-30,w+60,65)]+[(w,h)];d.polygon(pts,fill=col)
        if bid=='glacier':
          for i in range(2,len(pts)-2):
            x,y=pts[i]
            if y<pts[i-1][1] and y<pts[i+1][1]:d.polygon([(x,y),(x+28,y+25),(x+8,y+20),(x-10,y+29),(x-24,y+22)],fill=mix(c,(239,245,225),.6))
    if bid in ('reef','abyss','umbra'):
      for i in range(15):
        x=rng.randrange(w);by=rng.randrange(300,400);stem=rng.randrange(25,90);col=mix(c,(190,158,209),rng.random()*.5)
        for k in range(3):d.line([(x,by),(x-7+k*7,by-stem//2),(x-18+k*15,by-stem+k*7)],fill=shade(col,.8),width=3)
        d.ellipse((x-9,by-stem-5,x+3,by-stem+2),fill=col)
    if bid=='glacier':
      for k in range(10):
        x=rng.randrange(w);y=rng.randrange(285,390);d.polygon([(x,y),(x+10,y-40),(x+20,y-11),(x+24,y),(x+5,y+9)],fill=mix(c,(240,244,230),.5));d.line((x+10,y-35,x+12,y+4),fill=(228,249,239),width=2)
    if bid=='dune':
      for x,y in [(330,282),(365,273),(570,315)]:
        d.polygon([(x,y),(x+14,y-64),(x+35,y-81),(x+29,y-31),(x+47,y)],fill=(104,114,119));d.line((x+15,y-59,x+27,y-68),fill=(171,218,204),width=3)
      d.rectangle((230,220,236,295),fill=(73,73,89));d.polygon([(232,222),(284,237),(232,253)],fill=(185,93,87))
    if bid=='inferno':
      for y in range(318,400,6):d.rectangle((0,y,w,y+3),fill=mix((211,104,77),(242,194,118),(y%23)/23))
      for x in range(-10,w,90):d.polygon([(x,400),(x+8,345),(x+52,330),(x+80,367),(x+80,400)],fill=(41,43,53))
      for k in range(35):x=rng.randrange(w);y=rng.randrange(h);d.rectangle((x,y,x+1,y+3),fill=(249,173,117))
    if bid=='metro':
      d.rectangle((0,316,w,329),fill=(34,53,66));d.line((0,313,w,313),fill=(164,206,192),width=3)
      for x in range(60,w,150):d.rectangle((x,326,x+12,h),fill=(38,56,67));d.rectangle((x+28,262,x+31,312),fill=(165,185,171));d.rectangle((x+19,254,x+58,264),fill=(241,205,155))
      d.rectangle((290,221,342,234),fill=(201,156,194));d.rectangle((297,225,335,228),fill=(69,67,94))
    if bid=='sky':
      for x,y in [(100,92),(290,150),(430,231),(570,141)]:
        d.rectangle((x,y,x+51,y+6),fill=(217,229,221));d.rectangle((x+8,y-5,x+39,y+4),fill=(229,236,226))
    if bid=='umbra':
      d.ellipse((283,149,356,281),outline=(175,184,221),width=4);d.ellipse((288,156,351,276),outline=(101,163,175),width=2)
      for k in range(24):x=rng.randrange(w);y=rng.randrange(110,360);d.rectangle((x,y,x+2,y+2),fill=(174,211,211))
    im.save(OUT/f'biome_{bid}.png',optimize=True)
print('Wrote',len(classes),'actor sheets,',len(DATA['data']['species']),'creatures and 8 scenes.')
