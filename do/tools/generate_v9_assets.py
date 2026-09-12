#!/usr/bin/env python3
"""Generate original, redistributable V9 post-apocalypse pixel art.

The reference mood is: cliff shelters, lived-in cutaway rooms, improvised power,
water, plants, cables and moonlit ruins.  The generator does not trace or copy
any supplied picture; it builds new procedural assets with a compatible mood.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, random

ROOT=Path(__file__).resolve().parents[1]
BG=ROOT/'assets'/'backgrounds'/'v9'; ROOMS=ROOT/'assets'/'rooms'; UI=ROOT/'assets'/'ui'
for p in (BG,ROOMS,UI): p.mkdir(parents=True,exist_ok=True)
random.seed(90210)

def px(d,x,y,w,h,c): d.rectangle((int(x),int(y),int(x+w-1),int(y+h-1)),fill=c)
def line(d,pts,c,w=1): d.line([(int(x),int(y)) for x,y in pts],fill=c,width=w)
def circ(d,x,y,r,c,outline=None,w=1): d.ellipse((int(x-r),int(y-r),int(x+r),int(y+r)),fill=c,outline=outline,width=w)
def scale2(im): return im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST)

palettes={
 'tide':dict(sky=['#82cbd0','#5faeb8','#357e91'],far='#386b76',mid='#254c58',near='#132f39',light='#ffd18d',plant='#5c9a63',water='#3199ad'),
 'roots':dict(sky=['#557b73','#3c625c','#294844'],far='#355d50',mid='#29483d',near='#172e28',light='#f3bd78',plant='#6ca96c',water='#397c83'),
 'market':dict(sky=['#e4a36c','#a86859','#594756'],far='#66504f',mid='#473d42',near='#24282f',light='#ffd07c',plant='#6d9961',water='#477d8b'),
 'reactor':dict(sky=['#a4695b','#624751','#303b4b'],far='#5d4a49',mid='#45393c',near='#22252b',light='#ffb05f',plant='#6b8758',water='#3e7384'),
 'archive':dict(sky=['#65728d','#454d70','#2c3051'],far='#474c69',mid='#343953',near='#1b1d31',light='#f4c585',plant='#5d896b',water='#426d8f'),
 'canopy':dict(sky=['#4a8e8e','#347370','#23534f'],far='#315c4e',mid='#23453a',near='#102922',light='#ffd47d',plant='#69aa67',water='#3c8386'),
 'lighthouse':dict(sky=['#8bc9d2','#548fa8','#304f72'],far='#385c70',mid='#274252',near='#142733',light='#ffe9a2',plant='#6a996d',water='#448ca7'),
 'secret':dict(sky=['#765f86','#4d496b','#292b48'],far='#4f4562',mid='#3a344d',near='#1f1c2e',light='#e9c58f',plant='#62886d',water='#4f6c8d'),
}

# ---------------------------------------------------------------------------
# Backgrounds: far/mid/near for 8 palettes, 320x180 base -> 640x360 output.
# ---------------------------------------------------------------------------
def make_bg(name,pal):
    W,H=320,180
    # far: banded sky, moon/sun, far cliffs
    im=Image.new('RGB',(W,H),pal['sky'][0]);d=ImageDraw.Draw(im)
    for i,c in enumerate(pal['sky']):d.rectangle((0,i*60,W,(i+1)*60),fill=c)
    # clouds
    rng=random.Random(hash(name)&0xffff)
    for j in range(7):
        x=rng.randrange(-30,W);y=rng.randrange(12,78);w=rng.randrange(24,70)
        col=(220,236,226) if name in ('tide','lighthouse') else (145,165,160)
        a=140
        # RGB background: dithered horizontal pixels
        for k in range(4): d.rounded_rectangle((x+k*4,y+k%2*3,x+w-k*4,y+5+k%3),radius=3,fill=tuple(min(255,v) for v in col))
    # celestial body
    cx=245 if name not in ('market','reactor') else 58; cy=38
    circ(d,cx,cy,15,pal['light']);circ(d,cx-4,cy-5,8,'#fff0cc')
    # distant city/cliffs
    pts=[(0,H)];x=-20
    while x<W+30:
        peak=rng.randrange(88,140);pts.append((x,peak));x+=rng.randrange(18,48)
    pts.extend([(W,H)])
    d.polygon(pts,fill=pal['far'])
    # tiny silhouettes and antennae
    for j in range(18):
        x=rng.randrange(0,W);h=rng.randrange(8,34);px(d,x,130-h,2,h,pal['mid']);
        if j%3==0: line(d,[(x+1,130-h),(x-4,130-h+8)],pal['mid'])
    scale2(im).save(BG/f'{name}_far.png')

    # mid: irregular ruined buildings, roots, cables, water towers
    im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    baseline=165
    x=-10
    while x<W+20:
        bw=rng.randrange(25,58);bh=rng.randrange(45,125);y=baseline-bh
        col=pal['mid']
        # broken silhouette
        poly=[(x,baseline),(x,y+rng.randrange(0,12)),(x+bw*.25,y+rng.randrange(-6,8)),(x+bw*.52,y+rng.randrange(2,15)),(x+bw,y+rng.randrange(-2,12)),(x+bw,baseline)]
        d.polygon(poly,fill=col)
        # cut windows
        for wy in range(int(y+16),baseline-12,16):
            for wx in range(int(x+7),int(x+bw-6),12):
                if rng.random()<.48:px(d,wx,wy,4,5,(239,193,112,80) if rng.random()<.35 else (4,15,20,90))
        # vines
        if rng.random()<.7:
            vine_x=x+rng.randrange(4,max(5,bw-4));line(d,[(vine_x,y),(vine_x-2,baseline)],pal['plant'],2)
            for vy in range(int(y+10),baseline,17):circ(d,vine_x+rng.choice([-4,4]),vy,2,pal['plant'])
        x+=bw+rng.randrange(6,18)
    # cables
    for k in range(5):
        y=35+k*19+rng.randrange(-5,6);line(d,[(-10,y),(100,y+10),(210,y-5),(330,y+13)],pal['near'],1)
    # water towers / pines
    for x in [45,172,286]:
        if name in ('canopy','roots','secret'):
            line(d,[(x,160),(x,68)],pal['near'],4)
            for yy,ww in [(85,25),(105,35),(125,45)]:d.polygon([(x,yy-20),(x-ww//2,yy+15),(x+ww//2,yy+15)],fill=pal['near'])
        else:
            px(d,x,58,4,82,pal['near']);circ(d,x+2,55,9,pal['near']);line(d,[(x-5,140),(x+9,140)],pal['near'],2)
    scale2(im).save(BG/f'{name}_mid.png')

    # near: sparse framing only; no giant visibility-blocking columns
    im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    # bottom grasses and occasional cable silhouette
    for x in range(0,W,5):
        hh=rng.randrange(3,15);d.polygon([(x,H),(x+2,H-hh),(x+4,H)],fill=pal['near'])
    for k in range(3):
        y=18+k*48;line(d,[(-20,y),(75,y+13),(165,y-4),(340,y+15)],(*ImageColor(pal['near']),120) if False else pal['near'],1)
    # edge foliage, leaving central 80% clear
    for side in [0,1]:
        base=0 if side==0 else W
        for j in range(7):
            x=base+rng.randrange(-10,18)*(1 if side==0 else -1);y=rng.randrange(10,H-25);r=rng.randrange(5,14)
            circ(d,x,y,r,(*hexrgb(pal['plant']),150))
    scale2(im).save(BG/f'{name}_near.png')

def hexrgb(h):
    h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))
def ImageColor(h): return hexrgb(h)

for name,pal in palettes.items(): make_bg(name,pal)

# ---------------------------------------------------------------------------
# Cutaway room atlas.  Twelve unique lived-in shelters, not a repeated tower.
# Each frame is 384x240 (base 192x120 x2).
# ---------------------------------------------------------------------------
FRAME_W,FRAME_H=384,240;N=12
atlas=Image.new('RGBA',(FRAME_W*N,FRAME_H),(0,0,0,0))

def furniture(d,kind,x,y,scale=1,light='#f5c77d'):
    # x/y at floor baseline in 192x120 coordinates
    if kind=='bed':
        px(d,x,y-9,30,8,'#684d43');px(d,x+2,y-12,27,5,'#d2a784');px(d,x+3,y-11,8,4,'#ece4ce');px(d,x,y-2,3,4,'#332d2b');px(d,x+27,y-2,3,4,'#332d2b')
    elif kind=='fridge':
        px(d,x,y-26,15,26,'#9db7ad');px(d,x+2,y-24,11,11,'#d4e2d7');line(d,[(x+1,y-12),(x+14,y-12)],'#405d59');px(d,x+11,y-20,1,5,'#304e4b');px(d,x+11,y-8,1,5,'#304e4b')
    elif kind=='table':
        px(d,x,y-10,25,3,'#7a583b');px(d,x+3,y-7,3,7,'#49392d');px(d,x+19,y-7,3,7,'#49392d');px(d,x+8,y-13,7,3,'#d5ba88')
    elif kind=='shelf':
        px(d,x,y-28,25,28,'#493b32')
        for yy in [y-25,y-16,y-7]: px(d,x+2,yy,21,2,'#886b4c')
        for yy in [y-24,y-15,y-6]:
            for xx in range(x+3,x+22,4):px(d,xx,yy-5,3,5,random.choice(['#bf725e','#6d9a80','#c9a45c','#7d78a8']))
    elif kind=='workbench':
        px(d,x,y-10,32,4,'#74543b');px(d,x+3,y-6,3,6,'#3c3128');px(d,x+26,y-6,3,6,'#3c3128');px(d,x+4,y-23,24,10,'#495f5d');
        for i in range(4):line(d,[(x+7+i*5,y-20),(x+7+i*5,y-14+random.randrange(-2,3))],'#d8ba72',1)
    elif kind=='stove':
        px(d,x,y-17,18,17,'#46585a');px(d,x+2,y-15,14,5,'#303d40');circ(d,x+6,y-12,2,'#f5a858');circ(d,x+12,y-12,2,'#f5a858');px(d,x+4,y-8,10,6,'#1f292c')
    elif kind=='radio':
        px(d,x,y-13,17,13,'#6f755e');px(d,x+2,y-11,8,6,'#24353a');circ(d,x+13,y-7,2,'#d5c06f');line(d,[(x+14,y-13),(x+20,y-25)],'#39484a',1)
    elif kind=='terminal':
        px(d,x,y-18,22,18,'#455f61');px(d,x+3,y-15,15,8,'#74c4b2');px(d,x+4,y-14,13,1,'#d7f2d2');px(d,x+5,y-4,12,2,'#1f3335')
    elif kind=='plant':
        px(d,x+5,y-5,10,5,'#885f43');line(d,[(x+10,y-5),(x+9,y-19)],'#4a8655',2);circ(d,x+5,y-16,4,'#669c5f');circ(d,x+13,y-20,5,'#72ad68');circ(d,x+15,y-12,4,'#5d9459')
    elif kind=='sofa':
        px(d,x,y-10,29,10,'#725f59');px(d,x+3,y-14,23,7,'#9b7a6d');px(d,x-2,y-8,4,7,'#4c403c');px(d,x+27,y-8,4,7,'#4c403c')
    elif kind=='tank':
        px(d,x,y-31,16,31,'#547071');d.ellipse((x,y-35,x+15,y-27),fill='#6f8b85');d.ellipse((x,y-5,x+15,y+2),fill='#344d50');circ(d,x+8,y-18,4,'#d9d59a',outline='#263b3c')
    elif kind=='locker':
        px(d,x,y-27,18,27,'#596f68');line(d,[(x+9,y-27),(x+9,y)],'#324741')
        for yy in [y-21,y-14,y-7]: px(d,x+3,yy,4,1,'#b5c4ae')
    elif kind=='solar':
        d.polygon([(x,y-12),(x+27,y-16),(x+30,y-6),(x+3,y-3)],fill='#345c70',outline='#9cc5c9')
        for xx in range(x+5,x+28,6): line(d,[(xx,y-14),(xx+2,y-5)],'#79a7b0')
        line(d,[(x+14,y-5),(x+14,y)],'#384748',2)

def room_frame(idx):
    W,H=192,120;rng=random.Random(1000+idx);im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
    # cliff / improvised exterior silhouette, varied per template
    shell=['#2f3b3a','#3c4542','#313d44','#453d38'][idx%4]
    wall=['#8a9b86','#9b9273','#718c86','#8d7c6b'][idx%4]
    warm=['#f6c474','#ffb46c','#efd28b','#f5a978'][idx%4]
    # irregular outer polygon
    left=8+rng.randrange(0,8);right=184-rng.randrange(0,10);top=8+rng.randrange(0,8);bottom=112
    poly=[(left+8,top),(right-20,top+rng.randrange(-2,6)),(right,top+15),(right-rng.randrange(0,8),bottom),(left,bottom),(left-2,top+30)]
    d.polygon(poly,fill=shell)
    # interior cutaway with 1-3 levels
    floors=2 if idx%3 else 3
    inner=(left+7,top+8,right-7,bottom-7)
    d.rectangle(inner,fill=wall)
    # back wall panel seams
    for yy in range(inner[1]+8,inner[3],12):line(d,[(inner[0],yy),(inner[2],yy)],'#657466',1)
    for xx in range(inner[0]+18,inner[2],28):line(d,[(xx,inner[1]),(xx,inner[3])],'#758073',1)
    # floor slabs
    level_y=[]
    if floors==2:level_y=[inner[1]+42,inner[3]-1]
    else:level_y=[inner[1]+29,inner[1]+58,inner[3]-1]
    for yy in level_y: px(d,inner[0],yy,inner[2]-inner[0]+1,3,'#263437')
    # partitions and doors
    for li,fy in enumerate(level_y):
        topy=inner[1] if li==0 else level_y[li-1]+3
        if li%2==0:
            xx=inner[0]+rng.randrange(45,72);px(d,xx,topy,3,fy-topy,'#354748');px(d,xx-1,fy-15,10,15,'#263437')
        else:
            xx=inner[2]-rng.randrange(45,72);px(d,xx,topy,3,fy-topy,'#354748');px(d,xx-8,fy-15,10,15,'#263437')
    # windows with warm light / outside blue
    for k in range(2):
        wx=inner[0]+18+k*70;wy=inner[1]+10
        px(d,wx,wy,24,15,'#263c45');px(d,wx+2,wy+2,20,11,'#7fb4ae' if idx%2 else '#d9bd75');line(d,[(wx+12,wy+2),(wx+12,wy+13)],'#36494a')
    # furniture per floor, lots of small lived-in detail
    sets=[
      ['fridge','stove','table','plant'],['bed','shelf','radio','plant'],['workbench','locker','terminal','plant'],
      ['sofa','radio','shelf','plant'],['tank','workbench','locker','plant'],['bed','table','fridge','radio'],
      ['solar','terminal','workbench','plant'],['shelf','bed','sofa','radio'],['fridge','tank','stove','plant'],
      ['terminal','shelf','table','radio'],['workbench','solar','locker','plant'],['bed','fridge','sofa','plant']
    ][idx]
    base_y=level_y[-1]
    xs=[inner[0]+8,inner[0]+46,inner[0]+89,inner[0]+126]
    for k,kind in enumerate(sets):furniture(d,kind,xs[k],base_y)
    # upper floor furniture
    if floors>=2:
        topfloor=level_y[0]
        furniture(d,'bed' if idx%2 else 'shelf',inner[0]+12,topfloor)
        furniture(d,'plant',inner[2]-32,topfloor)
        furniture(d,'radio' if idx%3 else 'terminal',inner[0]+92,topfloor)
    if floors==3:
        furniture(d,'workbench',inner[0]+68,level_y[1]);furniture(d,'plant',inner[0]+20,level_y[1])
    # lamps and wires
    for ly in level_y:
        lx=inner[0]+rng.randrange(30,max(31,inner[2]-inner[0]-30));line(d,[(lx,ly-24),(lx,ly-9)],'#27383a');px(d,lx-7,ly-9,14,3,warm);circ(d,lx,ly-5,4,(*hexrgb(warm),90))
    # exterior solar/water/antenna on roof
    if idx%3==0:furniture(d,'solar',right-48,top+5)
    if idx%4==1:furniture(d,'tank',left+13,top+34)
    line(d,[(right-18,top+5),(right-14,top-12)],'#263236',2);circ(d,right-14,top-14,2,'#d2d5c5')
    # vines / laundry / signs
    for k in range(4):
        vx=left+20+k*35;line(d,[(vx,top),(vx+rng.randrange(-5,6),top+23+rng.randrange(5,23))],'#4f7f51',1);circ(d,vx+2,top+18+k%2*6,2,'#699b5e')
    if idx%2:line(d,[(left+25,top+27),(right-25,top+34)],'#454f4d');
    if idx%2:
        for k,c in enumerate(['#c86f5d','#6f9d94','#d6b067']):d.polygon([(left+50+k*20,top+31),(left+63+k*20,top+32),(left+60+k*20,top+42),(left+51+k*20,top+41)],fill=c)
    return scale2(im)

for i in range(N): atlas.alpha_composite(room_frame(i),(i*FRAME_W,0))
atlas.save(ROOMS/'shelter_atlas.png')

# Cave/facility shell atlases: keep gameplay interiors visible but vary silhouette.
def make_struct_atlas(name,count,mode):
    at=Image.new('RGBA',(FRAME_W*count,FRAME_H),(0,0,0,0))
    for idx in range(count):
        W,H=192,120;rng=random.Random(2000+idx+(0 if mode=='cave' else 100));im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
        if mode=='cave':
            rock='#41463f';rock2='#665e52';inside='#1e3335';moss='#64845d'
            # irregular rock border around open cavity
            pts=[]
            x=0
            while x<W:pts.append((x,rng.randrange(0,22)));x+=rng.randrange(9,21)
            pts+=[(W,0),(W,H),(0,H)]
            d.polygon(pts,fill=rock)
            d.rectangle((12,18,W-12,H-12),fill=inside)
            # rock edges
            for k in range(22):
                x=rng.randrange(4,W-4);y=rng.choice([rng.randrange(5,22),rng.randrange(H-23,H-4)])
                circ(d,x,y,rng.randrange(2,7),rock2)
            # roots and dripping water
            for k in range(8):
                x=rng.randrange(15,W-15);line(d,[(x,15),(x+rng.randrange(-9,10),rng.randrange(35,75))],moss,rng.choice([1,2]))
            for k in range(6):
                x=rng.randrange(18,W-18);line(d,[(x,H-15),(x+rng.randrange(-5,6),H-rng.randrange(25,55))],rock2,2)
            # embedded tiny shelter pod
            if idx%2==0:
                px(d,48,H-48,78,35,'#516967');px(d,52,H-44,70,27,'#8b977c');px(d,56,H-40,18,12,'#f0c777');furniture(d,'bed',82,H-16);furniture(d,'radio',111,H-16)
        else:
            shell='#38464b';wall='#75827a';dark='#263437';accent=['#e79a5c','#66c4c3','#d6c36d','#b67fc5'][idx%4]
            # slanted industrial shell
            d.polygon([(8,20),(45,8),(180,15),(188,104),(165,114),(13,110)],fill=shell)
            d.polygon([(17,26),(49,16),(172,22),(178,98),(158,104),(21,101)],fill=wall)
            # pipes / tanks / catwalk
            line(d,[(20,37),(165,37),(165,65),(135,65)],dark,5);line(d,[(35,21),(35,95)],dark,4)
            for k in range(3):
                x=55+k*38;px(d,x,52,24,40,dark);d.ellipse((x,47,x+23,57),fill='#65736e');circ(d,x+12,66,5,accent)
            px(d,20,87,150,4,'#182428')
            for x in range(28,166,18): line(d,[(x,87),(x+8,99)],'#4a5b58')
            furniture(d,'terminal',25,87);furniture(d,'workbench',121,87);furniture(d,'locker',94,87)
            for k in range(5):px(d,65+k*14,24,8,5,accent)
        at.alpha_composite(scale2(im),(idx*FRAME_W,0))
    at.save(ROOMS/f'{name}_atlas.png')

make_struct_atlas('cave',8,'cave');make_struct_atlas('facility',12,'facility')

# Mini-map icon atlas / shelter icon
im=Image.new('RGBA',(256,64),(0,0,0,0));d=ImageDraw.Draw(im)
for i,(name,col) in enumerate([('room','#6fa7af'),('shelter','#ffd77f'),('gate','#d57ad3'),('player','#ffffff')]):
    x=i*64;d.rounded_rectangle((x+8,8,x+56,56),radius=8,fill='#10222a',outline=col,width=3)
    if i==0:d.rectangle((x+18,23,x+46,42),fill=col)
    elif i==1:
        d.polygon([(x+16,31),(x+32,17),(x+48,31),(x+48,47),(x+16,47)],fill=col);d.rectangle((x+28,35,x+36,47),fill='#3b3c35')
    elif i==2:
        d.arc((x+17,15,x+47,49),-60,240,fill=col,width=4)
    else:circ(d,x+32,32,12,col)
im.save(UI/'map_icons.png')
print('generated V9 art assets')
