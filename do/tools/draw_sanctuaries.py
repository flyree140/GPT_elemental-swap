"""V11 原創像素美術。1 原生像素 = 2 個世界單位。
背景 floor 基準和 V10 的 shelterFloor 計算完全相同；家具另畫以免重複。
本檔可直接重建全部 V11 美術，未複製參考圖或第三方素材。
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, random, json
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets/sanctuary'; OUT.mkdir(exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
def font(s):return ImageFont.truetype(FONT,s)
def blend(a,b,t):
 def rgb(c):return tuple(int(c[i:i+2],16) for i in (1,3,5)) if isinstance(c,str) else c
 a,b=rgb(a),rgb(b);return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
class Art:
 def __init__(self,w,h,seed=1,bg=None):
  self.im=Image.new('RGBA',(int(w),int(h)),bg or (0,0,0,0));self.d=ImageDraw.Draw(self.im);self.r=random.Random(seed)
 def box(self,x,y,w,h,c,o=None):
  x,y,w,h=map(round,(x,y,w,h));
  if w>0 and h>0:self.d.rectangle((x,y,x+w-1,y+h-1),fill=c,outline=o)
 def line(self,pts,c,w=1):self.d.line([(round(x),round(y)) for x,y in pts], fill=c, width=w)
 def poly(self,pts,c,o=None):self.d.polygon([(round(x),round(y)) for x,y in pts], fill=c,outline=o)
 def oval(self,x,y,w,h,c,o=None):self.d.ellipse((round(x),round(y),round(x+w),round(y+h)),fill=c,outline=o)
 def txt(self,x,y,t,c='#ead3a1',size=7):self.d.text((round(x),round(y)),t,fill=c,font=font(size))
 def grain(self,x,y,w,h,col,n=40):
  for i in range(n):self.box(self.r.randrange(round(x),round(x+w)),self.r.randrange(round(y),round(y+h)),self.r.choice([1,2,3]),1,col)
 def plant(self,x,y,s=1,pot=True):
  if pot:self.poly([(x-5*s,y),(x+5*s,y),(x+4*s,y+7*s),(x-3*s,y+7*s)],'#b06e49','#304e42');self.box(x-6*s,y,12*s,2*s,'#dba375')
  self.line([(x,y),(x,y-18*s)],'#587249',max(1,round(s)))
  for j in range(6):
   a=j*2.6;cx=x+math.cos(a)*6*s;cy=y-5*s-j*2*s
   self.line([(x,cy+3*s),(cx,cy)],'#4d6e48',max(1,round(s)));self.oval(cx-3*s,cy-2*s,6*s,4*s,['#5f8450','#94aa65','#416546'][j%3])
 def vine(self,x,y,length):
  px=x
  for i in range(0,int(length),3):
   nx=x+math.sin(i*.2)*3;self.line([(px,y+i-3),(nx,y+i)],'#436a47');px=nx
   if i%9==0:self.oval(nx-4,y+i,6,3,self.r.choice(['#416747','#759b56','#8eaa61']))
 def pipe(self,pts):
  self.line(pts,'#152f36',5);self.line(pts,'#69867c',3);self.line([(x-1,y-1) for x,y in pts],'#a3b1a0',1)
  for x,y in pts:self.box(x-3,y-2,6,4,'#647b71','#19383b')
 def rug(self,x,y,w):
  self.box(x,y,w,4,'#725444');self.box(x+2,y+1,w-4,1,'#bf9d65')
  for xx in range(int(x+4),int(x+w-3),5):self.box(xx,y+2,2,1,'#d3b678')
 def window(self,x,y,w,h,theme=0):
  self.box(x-3,y-3,w+6,h+6,'#7d8370','#203a3d');self.box(x,y,w,h,'#528984')
  self.box(x+2,y+2,w-4,h//2,'#81b2a0');self.poly([(x+1,y+h-2),(x+w*.3,y+h*.35),(x+w*.65,y+h*.8),(x+w*.8,y+h*.3),(x+w-1,y+h-2)],'#345f59')
  self.box(x,y+h//2,w,2,'#c4c4a1');self.box(x+w//2,y,2,h,'#b8baa0');self.box(x-4,y+h,w+8,3,'#c6b38b')
  self.line([(x+4,y+5),(x+w*.28,y+5),(x+4,y+h*.35)],'#b1d8c0')
 def shelf(self,x,y,w):
  self.box(x,y,w,3,'#b89a69','#394640');self.box(x+3,y+3,2,4,'#506052');self.box(x+w-5,y+3,2,4,'#506052')
  xx=x+3
  while xx<x+w-5:
   h=self.r.randint(6,13);wi=self.r.randint(3,7);c=self.r.choice(['#829985','#cfac72','#998172','#526c79','#c8ba8b']);self.box(xx,y-h,wi,h,c,'#3a504b');self.box(xx+1,y-h+2,wi-2,1,'#e2d4a9');xx+=wi+2
 def back_lamp(self,x,y,floor):
  self.line([(x,y-15),(x,y)],'#344943',1);self.poly([(x-7,y+3),(x-3,y),(x+3,y),(x+7,y+3)],'#6e795f','#253d3d');self.box(x-5,y+4,10,2,'#fff1ad')
  # Layered hard-edge light cone, no smeared pixels.
  light=Image.new('RGBA',self.im.size);ld=ImageDraw.Draw(light);ld.polygon([(x-4,y+6),(x+4,y+6),(x+44,floor-5),(x-44,floor-5)],fill=(255,201,100,16));self.im.alpha_composite(light);self.d=ImageDraw.Draw(self.im)
 def cushions(self,x,y):
  self.box(x,y,44,18,'#435c53','#213936');self.box(x+2,y+2,40,11,'#98966e');self.box(x-3,y+8,7,12,'#6e7a5b','#294b43');self.box(x+40,y+8,7,12,'#6e7a5b','#294b43');self.box(x+6,y+3,13,8,'#cdb98a');self.box(x+23,y+3,12,8,'#83a18e');self.box(x+4,y+18,3,4,'#45382e');self.box(x+35,y+18,3,4,'#45382e')

# Eighteen complete appliance sprites. They share floor pivot y=86.
KINDS=['fridge','bed','workbench','radio','locker','map','terminal','stove','purifier','shelf','sofa','lamp','greenhouse','medbay','recycler','cabinet','generator','telescope']
for i,k in enumerate(KINDS):
 a=Art(96,96,20+i);a.oval(11,85,72,7,(0,0,0,28));d=a.d
 if k=='fridge':
  a.box(25,14,45,73,'#203c40');a.box(28,16,39,68,'#9ab8ae');a.box(30,18,35,65,'#c8d2b6');a.box(30,42,35,2,'#57766b');a.box(58,27,3,10,'#3f625c');a.box(58,50,3,16,'#3f625c');a.box(34,50,12,14,'#e7d99b','#779c86');a.line([(34,61),(46,53)],'#cf9767');a.box(52,20,7,5,'#ba714e');a.box(30,20,2,61,'#e8e8c9');a.plant(47,9,.65)
 elif k in ['bed','medbay']:
  a.box(10,78,75,7,'#344e49');a.box(12,84,5,5,'#364c48');a.box(78,83,5,6,'#364c48');a.box(9,43,6,38,'#a2aba0','#395e56');a.box(80,63,5,18,'#a2aba0','#395e56');a.box(14,62,65,17,'#c0d2bb');a.box(16,65,17,10,'#eef0d2','#b9c6ad');a.box(35,63,44,15,'#699494');a.box(37,65,40,2,'#a3c1ae');a.box(56,66,7,11,'#bbbc95')
  if k=='medbay':
   a.box(70,22,3,37,'#748d85');a.line([(60,22),(81,22)],'#748d85');a.box(57,24,11,16,'#e2e6c9','#759582');a.box(61,27,2,9,'#bb6f58');a.box(58,30,8,2,'#bb6f58');a.pipe([(63,41),(64,59),(55,60)])
  else:a.box(25,72,4,3,'#94b2ad');a.rug(13,88,68)
 elif k=='workbench':
  a.box(10,48,78,5,'#d5b783','#445951');a.box(15,54,6,34,'#526862');a.box(76,54,6,34,'#526862');a.box(23,59,42,23,'#697d70','#2d514b');a.box(25,61,38,9,'#ba9867');a.box(40,64,7,2,'#3b524b');a.box(25,72,38,8,'#ba9867');a.box(40,75,7,2,'#3b524b');a.box(12,17,66,24,'#495f55','#182e32')
  for xx in range(18,75,9):a.box(xx,22,3,14,'#b5c3a8');a.box(xx-2,20,7,5,'#ab9c77')
  a.box(29,39,27,9,'#324746');a.oval(50,34,13,14,'#879d93','#203b38');a.box(68,39,6,8,'#e0cb88');a.line([(74,46),(83,34)],'#d8cf9f',2)
 elif k=='radio':
  a.box(11,68,72,5,'#ba996b');a.box(17,73,4,15,'#4a5d55');a.box(76,73,4,15,'#4a5d55');a.box(23,35,48,33,'#315257','#102d32');a.box(25,37,44,28,'#738b7b');a.box(29,41,21,18,'#203f43');
  for yy in range(43,59,3):a.line([(30,yy),(48,yy)],'#798c79')
  a.box(54,42,11,6,'#e3c67f');a.oval(54,51,10,10,'#253e42','#c4c7ac');a.line([(66,34),(74,6)],'#7d9a90',2);a.box(28,65,18,2,'#b8c3a6')
 elif k=='locker':
  a.box(22,10,55,77,'#25484c');a.box(25,13,49,71,'#708b83');a.box(27,15,22,67,'#869c88','#475f59');a.box(51,15,21,67,'#a2ac92','#475f59');a.box(43,43,3,12,'#2d4d49');a.box(54,43,3,12,'#2d4d49');
  for yy in (22,26,30,72):a.box(31,yy,13,1,'#3d645e');a.box(56,yy,12,1,'#3d645e')
  a.box(32,38,8,5,'#d1bd89');a.box(62,38,6,4,'#c4a37a');a.box(30,12,39,1,'#d0ccb0')
 elif k=='map':
  a.poly([(15,53),(70,47),(85,63),(23,69)],'#4d685e','#183c3a');a.box(23,69,5,19,'#42594d');a.box(74,65,5,23,'#42594d');a.poly([(23,54),(67,50),(75,61),(29,65)],'#d4d3a4','#98a48c');a.line([(30,56),(41,62),(50,53),(67,58)],'#527e70',2);a.oval(52,54,7,5,'#efba66');a.box(20,42,7,11,'#c49e67');a.box(75,47,6,8,'#5e8b86');a.pipe([(13,30),(9,55),(17,63)])
 elif k=='terminal':
  a.box(24,49,43,38,'#5c7b71','#233c3a');a.poly([(18,42),(64,40),(74,55),(25,59)],'#7c9484','#304f4b');a.box(25,13,39,29,'#b8c4a7','#284e4b');a.box(29,16,31,22,'#213f44');a.box(32,19,24,2,'#83cbb5');a.box(32,24,16,1,'#e5cb8b');a.box(32,28,22,1,'#72bcb0');a.box(32,32,10,2,'#d1dbc5');
  for xx in range(28,62,5):a.box(xx,49,3,2,'#d6d7b1')
  a.box(33,66,24,13,'#345654');a.box(38,70,10,2,'#afbbb2')
 elif k=='stove':
  a.box(20,51,53,36,'#86a392','#203e39');a.box(23,65,34,17,'#273c39','#b6c2ab');a.box(27,69,26,10,'#564f35');a.box(32,75,18,3,'#dd9347');a.box(60,68,8,3,'#293c38');a.box(22,52,48,5,'#dad8b7');
  for x in (27,39,51,64):a.oval(x,59,5,5,'#3c5547')
  a.oval(28,43,24,9,'#203f3b');a.box(29,36,22,11,'#819b8b','#203f3b');a.oval(29,33,22,6,'#bfc9b0','#203f3b');a.box(38,30,5,4,'#365248');a.line([(53,41),(61,41)],'#314a43',3);a.box(59,43,5,7,'#d6b878');a.box(58,9,4,32,'#708e82');a.box(9,14,67,4,'#b6996d');a.shelf(12,27,38)
 elif k=='purifier':
  a.box(32,24,32,61,'#c0d3c8','#385c5e');a.oval(29,9,38,31,'#81b2b9','#365d66');a.oval(32,12,32,24,'#aad1ca');a.box(34,27,28,4,'#588c9d');a.box(38,51,21,21,'#3f6c71');a.box(40,52,7,3,'#edbf86');a.box(52,52,6,3,'#7daede');a.box(45,65,11,8,'#d7dbb8');a.box(32,82,32,5,'#8dafa5')
 elif k=='shelf':
  a.box(16,8,65,78,'#476454','#1b3735');a.box(20,12,57,68,'#394e40')
  for y in (31,54,78):a.shelf(20,y,57)
  a.box(25,60,10,16,'#c5ad81');a.box(52,60,22,16,'#708c89');a.box(56,64,14,8,'#dbd7ac')
 elif k=='sofa':a.cushions(23,62);a.rug(17,87,67);a.box(10,70,12,3,'#b58a62');a.box(15,73,3,14,'#6a6551');a.box(10,65,5,5,'#d9cf9b')
 elif k=='lamp':
  a.box(43,35,4,50,'#7e8b79','#304d49');a.oval(29,83,32,5,'#576f64','#213e3c');a.poly([(23,35),(35,8),(56,8),(67,35)],'#b3a66e','#365449');a.box(27,35,36,4,'#ffe9a3');a.box(40,11,3,21,'#d9c992')
 elif k=='greenhouse':
  a.box(13,48,69,8,'#b09261','#435b45');a.box(18,56,5,31,'#758475');a.box(74,56,5,31,'#758475');a.box(19,73,56,5,'#89977b');a.plant(27,40,1);a.plant(48,41,1.2);a.plant(69,41,.85);a.box(26,62,12,10,'#be9c6e');a.box(42,62,15,10,'#5f7e64');a.box(61,63,7,8,'#d0c293');a.pipe([(11,12),(84,12),(84,40)])
 elif k=='recycler':
  a.box(16,30,65,56,'#64817d','#1e3e41');a.box(20,35,57,9,'#c6b995');
  for xx in range(20,76,10):a.line([(xx,35),(xx+5,43)],'#52655e',3)
  a.box(26,52,45,25,'#1d3e40','#9ea98d');a.oval(36,53,22,22,'#839784','#3a675d');a.line([(42,59),(52,68),(44,72)],'#d2d7a3',2);a.box(25,80,10,3,'#adbaa8');a.box(65,48,8,3,'#a9dec2')
 elif k=='cabinet':
  a.box(13,9,71,79,'#8b7960','#283f38');a.box(18,14,61,57,'#345d5e','#d3b57f');
  for yy in (32,51,70):a.box(19,yy,59,2,'#c5a775')
  for j,(x,y) in enumerate([(31,26),(57,26),(34,47),(61,46),(30,64),(56,63)]):a.oval(x-5,y-8,10,10,['#e3a871','#92cabf','#c6b2cf'][j%3]);a.box(x-7,y+1,14,2,'#b6a17b')
  a.box(20,75,58,9,'#677b67');a.box(44,78,13,2,'#ddc694')
 elif k=='generator':
  a.box(10,71,77,16,'#567773','#233e3d');a.box(19,33,53,38,'#7a9683','#264a43');a.oval(39,27,35,40,'#2d5255','#142d31');a.oval(44,32,25,30,'#bfac7a','#6b8165');a.oval(51,42,12,11,'#46655c');
  for j in range(6):
   an=j*math.tau/6;a.line([(57,47),(57+math.cos(an)*10,47+math.sin(an)*12)],'#637b68',2)
  a.box(21,37,14,25,'#354f47');a.box(23,40,10,2,'#d3bb7c');a.box(25,17,13,15,'#807a5b','#324b40');a.pipe([(28,16),(28,6),(75,6),(75,23)]);a.box(15,75,7,4,'#daa068');a.box(73,75,7,4,'#91bca4')
 elif k=='telescope':
  a.line([(48,57),(26,86)],'#688c86',4);a.line([(48,57),(71,86)],'#688c86',4);a.line([(48,57),(48,87)],'#93aca2',3);a.line([(35,47),(65,23)],'#203e45',16);a.line([(35,45),(65,21)],'#81a5a0',12);a.line([(35,42),(62,21)],'#bed0ba',3);a.oval(59,14,16,17,'#2c515b','#b2c5af');a.oval(61,17,11,11,'#80b2bb');a.box(45,51,6,8,'#91a995');a.box(15,83,14,3,'#a0ac97')
 a.im.save(OUT/f'fixture_{k}.png')

# Cabin themes. Buildings are individually authored from the actual floor data.
ROOMS=json.loads((ROOT/'tools/sanctuary_rooms.json').read_text())
THEMES=[dict(id='coast',wall='#737a6b',lit='#e0b67a',trim='#26444b',wood='#826d56',accent='#71baba'),dict(id='forest',wall='#68775f',lit='#d8b47b',trim='#293f40',wood='#846543',accent='#9aa968'),dict(id='night',wall='#4d6a74',lit='#d6ad7a',trim='#182f42',wood='#716657',accent='#7cabb1')]
MANIFEST={}
for idx,r in enumerate(ROOMS):
 w,h=round(r['w']/2),round(r['h']/2);a=Art(w,h,500+idx);t=THEMES[{'r00':0,'r35':1,'r21':2,'r16':2,'r27':1,'r40':1,'r37':0,'e14':2}.get(r['id'],idx%3)];floor=h-14;levels=3 if r['h']>700 else 2
 floors=[floor-j*min(110,(r['h']-90)/levels/2) for j in range(levels)]
 # keep full height bounding box; floor array precisely matches engine.
 ceil=min(floors)-104
 left=17;right=w-18
 # outer cliff shoulders: almost entirely outside actor space
 for side in [0,1]:
  x=-4 if side==0 else w-23
  a.poly([(x,h*.40),(x+8,h*.31),(x+23,h*.42),(x+17,h*.62),(x+27,h*.79),(x+19,h),(x-10,h)],'#586e6b' if idx%3!=2 else '#344e5b','#223e43')
  for q in range(20):
   yy=a.r.randint(round(h*.42),h-15);xx=x+a.r.randint(1,15);a.line([(xx,yy),(xx+6,yy+13),(xx-1,yy+20)],'#91a18a' if idx%3!=2 else '#687c80')
 # support steel underhang, braces and drainpipes
 a.pipe([(right-8,ceil+8),(right-8,h-3),(w*.74,h-3)])
 for fx in (left+20,w*.52,right-14):a.line([(fx,floor+6),(fx+13,h-2),(fx+28,floor+6)],'#29454a',3)
 # two/three open rooms, an offset upper wing (existing colliders dictate it).
 for li,fy in enumerate(floors):
  upper=li>0
  if upper and li%2:lx=round(w*.38);rx=round(w*.95)
  elif upper:lx=28;rx=round(w*.63)
  else:lx=left;rx=right
  fy=round(fy);cy=fy-102
  # full room backdrop gradient horizontal panels
  a.box(lx-3,cy-7,rx-lx+6,112,t['trim']);a.box(lx,cy,rx-lx,101,t['wall'])
  for yy in range(cy+1,fy-3):a.box(lx+1,yy,rx-lx-2,1,blend(t['wall'],t['lit'],max(.16,.68-(yy-cy)*.0038)))
  # wall tiles, marks, cracks and wood boards, never a solid foreground obstruction
  for xx in range(lx+4,rx-3,31):a.line([(xx,cy+3),(xx,fy-5)],blend(t['wall'],t['trim'],.22))
  a.grain(lx+4,cy+5,max(5,rx-lx-8),85,blend(t['wall'],t['lit'],.3),int((rx-lx)*.65))
  a.box(lx+2,fy-16,rx-lx-4,13,blend(t['wall'],t['trim'],.30));a.box(lx,cy,rx-lx,3,'#afae86')
  # clear cutaway frame beams with bolt heads
  a.box(lx-2,cy-5,rx-lx+4,5,'#617b72');a.box(lx-2,cy-5,rx-lx+4,1,'#b4b697')
  a.box(lx-3,cy,4,102,t['trim']);a.box(rx-1,cy,4,102,t['trim'])
  for xx in range(lx+7,rx,30):a.box(xx,cy-3,2,2,'#adb69b');a.box(xx,fy+1,2,2,'#a0b5a4')
  # windows, rear archways
  winw=min(50,int((rx-lx)*.2));winx=lx+round((rx-lx)*.61)
  a.window(winx,cy+20,winw,34,idx%3)
  # hand lettering plaques are deliberately small background details
  a.box(lx+9,cy+11,49,13,t['trim']);a.txt(lx+13,cy+13,['KITCHEN','WORKSHOP','BEDROOM','ARCHIVE','CLINIC','SEED LAB'][(idx+li)%6],size=6)
  a.pipe([(lx+6,cy+8),(rx-7,cy+8),(rx-7,cy+25)])
  # under-ceiling copper utility and switch panel
  a.box(lx+11,cy+31,20,17,'#9a9976','#426158');a.box(lx+15,cy+35,5,8,'#d0c391');a.box(lx+23,cy+35,4,4,'#d6b67a');a.box(lx+23,cy+41,4,4,'#82b9a4')
  a.shelf(lx+55,cy+36,min(61,rx-lx-65))
  a.back_lamp(lx+(rx-lx)*.48,cy+12,fy)
  # wall pictures, calendars, notice board
  if rx-lx>280:
   a.box(lx+(rx-lx)*.42,cy+31,33,22,'#45675b','#314b49');a.box(lx+(rx-lx)*.42+3,cy+34,27,16,'#d9ca96');a.line([(lx+(rx-lx)*.42+6,cy+45),(lx+(rx-lx)*.42+13,cy+39),(lx+(rx-lx)*.42+27,cy+43)],'#74866d')
  # narrow vertical furnishings drawn BEHIND player walk path
  a.plant(rx-15,fy-12,.85)
  # Bespoke rear-wall furnishing, leaving the actor-height front strip clear.
  style=(idx+li)%6
  if style==0:  # kitchen: tile splashback and hanging utensils
   ax=lx+34;ay=fy-43;ww=min(95,rx-lx-82)
   for xx in range(int(ax),int(ax+ww),7):
    for yy in range(int(ay),int(ay+15),7):a.box(xx,yy,6,6,'#a3b2a0','#829b8f')
   a.line([(ax+2,ay-18),(ax+ww-4,ay-18)],'#394b43',2)
   for j in range(5):
    ux=ax+8+j*12;a.line([(ux,ay-18),(ux,ay-8)],'#d5c49c');a.oval(ux-2,ay-9,4,6,'#bdb797','#57645a')
  elif style==1:  # workshop pegboard
   ax=lx+38;ay=cy+48;ww=min(73,rx-lx-90);a.box(ax,ay,ww,22,'#4b6358','#365248')
   for xx in range(int(ax+3),int(ax+ww-2),5):
    for yy in range(int(ay+3),int(ay+20),5):a.box(xx,yy,1,1,'#889882')
   for j in range(5):
    xx=ax+8+j*12;a.box(xx,ay+4,2,14,'#c9c5a2');a.box(xx-2,ay+2,6,5,'#a9b69f');a.box(xx,ay+15,3,4,'#cc9872')
  elif style==2:  # bedroom, curtains and a stitched hanging textile
   a.poly([(winx-7,cy+18),(winx,cy+18),(winx-2,cy+56),(winx-10,cy+62)],'#7a917b','#465e50')
   a.poly([(winx+winw+1,cy+18),(winx+winw+9,cy+18),(winx+winw+10,cy+62),(winx+winw+3,cy+55)],'#7a917b','#465e50')
   a.box(lx+44,cy+49,36,24,'#6d7761','#b6af86');a.box(lx+47,cy+52,30,18,'#9c9271');a.poly([(lx+48,cy+69),(lx+58,cy+56),(lx+63,cy+64),(lx+68,cy+56),(lx+76,cy+69)],'#465f50')
  elif style==3:  # archive and pinned notes
   a.shelf(lx+43,cy+62,min(84,rx-lx-95));a.box(rx-40,cy+61,19,22,'#a48d62','#3f594c');
   for j in range(4):a.box(rx-38+(j%2)*8,cy+64+(j//2)*8,6,7,'#d9d3ab')
  elif style==4:  # medical: wall cabinet, oxygen conduit
   a.box(lx+40,cy+48,33,27,'#b0bd9f','#4d6b5a');a.box(lx+44,cy+52,25,19,'#d3d4aa');a.box(lx+54,cy+54,5,15,'#bd7965');a.box(lx+49,cy+59,15,5,'#bd7965');a.pipe([(rx-56,cy+16),(rx-56,cy+62),(rx-70,cy+62)])
  else:  # greenhouse: hanging planters and seed chart
   for j in range(3):
    xx=lx+43+j*27;a.line([(xx,cy+5),(xx,cy+51)],'#66735b');a.plant(xx,cy+50,.7)
   a.box(rx-40,cy+62,20,18,'#bdc4a0','#668471');a.line([(rx-37,cy+75),(rx-33,cy+67),(rx-28,cy+74),(rx-23,cy+65)],'#507c53')
  # Timber flooring is a rear wall band; walk surface remains an unambiguous edge.
  for xx in range(int(lx+3),int(rx-2),19):a.line([(xx,fy-12),(xx,fy-4)],'#6a806c')
  # wall wear / plaster cracks
  a.line([(rx-40,cy+57),(rx-46,cy+63),(rx-43,cy+69),(rx-48,cy+74)],blend(t['wall'],t['trim'],.45))
  # floor cutaway slab matches real platform exactly
  a.box(lx-2,fy,rx-lx+4,9,t['trim']);a.box(lx-2,fy,rx-lx+4,2,'#bdba91');a.box(lx-2,fy+3,rx-lx+4,2,'#567f79')
  # left side balcony extension, ladder structure stays background
  if upper and li%2:
   a.box(30,fy,w*.38-30,5,'#304a50');a.line([(32,fy),(32,fy-20),(lx-5,fy-20)],'#759588',2)
   for xx in range(34,lx-4,18):a.line([(xx,fy-19),(xx,fy)],'#446c63')
 # rooftop: solar panel, gardens, skylight, antenna and tank
 top=min(floors)-108; lx=round(w*.38) if levels==2 else 26;rx=right if levels==2 else round(w*.63)
 a.box(lx-5,top,rx-lx+10,6,'#304c50');a.box(lx-5,top,rx-lx+10,2,'#b6b893');a.box(lx-4,top-4,rx-lx+8,4,'#547650')
 for xx in range(int(lx+3),int(rx-4),6):a.box(xx,top-a.r.randint(4,9),a.r.randint(3,7),5,a.r.choice(['#749655','#9fab65','#496e48']))
 panelX=lx+30
 a.poly([(panelX,top-8),(panelX+19,top-35),(panelX+83,top-35),(panelX+62,top-8)],'#273e59','#b9c1ac')
 for k in range(1,5):a.line([(panelX+k*12,top-9),(panelX+19+k*12,top-34)],'#72929f')
 for k in range(1,3):a.line([(panelX+6*k,top-8-k*9),(panelX+64+6*k,top-8-k*9)],'#648793')
 a.pipe([(rx-30,top-12),(rx-30,top-63),(rx-15,top-63)])
 a.oval(rx-43,top-63,24,29,'#8da89f','#294951');a.box(rx-40,top-49,20,11,'#809a90');a.line([(rx-30,top-60),(rx-24,top-72),(rx-16,top-73)],'#bfd1b6',2)
 a.box(lx-6,top-44,4,43,'#637f76');a.line([(lx-14,top-40),(lx+7,top-40)],'#83998b');a.line([(lx-11,top-37),(lx+9,top-50)],'#879f91')
 for j in range(9):
  xx=left+a.r.randrange(15,max(16,int(w-45)));yy=top if xx>lx else floors[0]-104
  a.vine(xx,yy,a.r.randint(10,37))
 # overhead wires, drain and vertical service rail at the edge
 a.line([(0,top-24),(w*.22,top-8),(lx-4,top-38)],'#294b4f');a.line([(w*.22,floors[0]-6),(w*.22,top+18)],'#354f49',2)
 # floor trim moss with restrained clusters
 for xx in range(left,right,21):
  if a.r.random()<.35:a.plant(xx,floor-1,.32,False)
 a.im.save(OUT/f'house_{r["id"]}.png')
 MANIFEST[r['id']]={'src':f'assets/sanctuary/house_{r["id"]}.png','theme':t['id'],'w':r['w'],'h':r['h'],'roof':round(top*2),'floors':[round(f*2) for f in floors]}

# Atmospheric shelter biomes; local use only, V10 world palette elsewhere is preserved.
for theme in ['coast','forest','night']:
 a=Art(800,500,17+len(theme));sky={'coast':('#89b8b9','#e5d8ae'),'forest':('#78979a','#c5c7a1'),'night':('#273f56','#6c898a')}[theme]
 for y in range(500):a.box(0,y,800,1,blend(*sky,y/500))
 # clouds, broken sun/moon
 if theme=='night':a.oval(590,38,46,46,'#ced5b3');a.oval(595,42,19,10,'#a9b9ac');a.oval(612,60,12,16,'#b3c1ad')
 else:
  for x,y in [(65,40),(320,65),(600,27)]:
   for j in range(13):a.oval(x+j*8,y+math.sin(j)*7,43,17,'#d7dfc6')
 # rugged far ridges
 for layer in range(3):
  col=blend('#203f49',sky[1],.52-layer*.15);pts=[(0,500)];yy=190+layer*48
  for x in range(-10,820,26):pts.append((x,yy+math.sin(x*.023+layer)*45+a.r.randint(-18,18)))
  pts.extend([(810,500)]);a.poly(pts,col)
 if theme=='coast':
  for y in range(352,500):a.box(0,y,800,1,blend('#3d8088','#89b0a3',(y-352)/148))
  for j in range(120):
   x=a.r.randrange(800);y=a.r.randrange(358,500);a.box(x,y,a.r.randrange(3,34),1,a.r.choice(['#a6d1c2','#77afaa','#539396']))
  # rocks at both extremes only
  a.poly([(0,490),(0,200),(55,190),(88,244),(71,334),(131,457),(178,500)],'#426264')
  for j in range(16):y=220+j*16;a.line([(10,y),(44,y-10),(65,y+10),(50,y+25)],'#6c8b7d')
 else:
  # Distant conifers, narrow silhouettes, never foreground pillars.
  for layer in range(3):
   col=blend('#1d3f48',sky[1],.38-layer*.1)
   for x in range(-25+layer*12,835,44+layer*17):
    y=220+layer*72+a.r.randint(-40,35);h=a.r.randint(130,240);a.box(x,y,4,500-y,col)
    for j in range(9):
     hh=8+j*16;ww=12+j*3;a.poly([(x+2,y+hh-14),(x-ww,y+hh+15),(x+ww,y+hh+15)],col)
 # sparse particles
 for i in range(32):
  x=a.r.randrange(800);y=a.r.randrange(500);a.box(x,y,1,1,'#c9dcca')
 a.im.save(OUT/f'biome_{theme}.png')
(OUT/'manifest.json').write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2))
(ROOT/'js/sanctuary_data.js').write_text('/* V11 每棟避難所與原碰撞樓層一致；美術生成於 tools/draw_sanctuaries.py。 */\nwindow.ES11_ART='+json.dumps(MANIFEST,ensure_ascii=False,separators=(',',':'))+';\n')
print('V11 original shelters:',len(MANIFEST),'fixture types:',len(KINDS))
