#!/usr/bin/env python3
"""Generate the hand-authored organic V9 world graph and map preview.

The topology deliberately avoids a grid/tower layout.  Rooms vary in size and
position, major paths bend back on themselves, and optional shelters/secret
rooms sit on branches.  It is inspired by the *principle* of an interconnected
metroidvania map, not copied from any commercial map.
"""
from __future__ import annotations
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
JS=ROOT/'js'/'world.js'
OUT=ROOT/'assets'/'ui'/'WORLD_MAP_V9.png'

regions=[
 {'id':'tide','name':'潮痕避難港','color':'#5dbbc7','palette':'tide','y0':12400,'y1':15000,'objective':'修復海崖避難所，沿舊排水道尋找上升路。'},
 {'id':'roots','name':'根脈隧道','color':'#79ae71','palette':'roots','y0':10400,'y1':14200,'objective':'在樹根與水泵間開啟兩條回到雨幕市集的環路。'},
 {'id':'market','name':'雨幕舊城','color':'#d7a56a','palette':'market','y0':8200,'y1':11600,'objective':'穿越住區、醫院與雨棚市場，修復三個避難節點。'},
 {'id':'reactor','name':'風井工業帶','color':'#e27c62','palette':'reactor','y0':7000,'y1':10800,'objective':'利用風井、吊車與慢速投射物穿越反應爐。'},
 {'id':'archive','name':'沉影檔案城','color':'#8e80b9','palette':'archive','y0':5000,'y1':8800,'objective':'在影門、光橋與斷裂公寓間建立捷徑。'},
 {'id':'canopy','name':'月冠樹海','color':'#62b887','palette':'canopy','y0':2200,'y1':6500,'objective':'沿樹洞、吊村與飛船殘骸向樹冠攀升。'},
 {'id':'lighthouse','name':'天穹燈塔','color':'#73c8df','palette':'lighthouse','y0':0,'y1':3600,'objective':'啟動燈塔、穿越月橋並抵達十相核心。'},
 {'id':'secret','name':'失落回聲','color':'#d776c9','palette':'secret','y0':0,'y1':15000,'objective':'尋找被主路忽略的記憶房與功能收集品。'},
]

# id, name, region, kind, x, y, w, h, art, shelter, note
raw=[
 ('r00','海崖初始避難所','tide','shelter',900,13650,900,620,0,1,'起點與操作教學'),
 ('r01','浸水車庫','tide','facility',2150,13320,780,560,4,0,'可推車與排水閥'),
 ('r02','鹽蝕洞口','tide','cave',3200,14030,1120,500,0,0,'低處支線與水坑'),
 ('r03','舊蓄水井','tide','shaft',4050,12520,690,1120,0,0,'第一次真正垂直攀升'),
 ('r04','鹽燈廚房','tide','shelter',5000,13230,930,560,1,1,'冰箱、爐灶與床'),
 ('r05','根門分岔','roots','hub',6100,12300,980,760,2,0,'主線第一次三岔路'),
 ('r06','淹沒閱覽室','secret','secret',7350,13230,970,610,7,0,'記憶種子支線'),
 ('r07','巨泵大廳','roots','hub',7800,11600,1260,820,3,0,'大型水輪與多層平台'),
 ('r08','地鐵菌巢','roots','cave',9650,12440,1040,570,2,0,'低矮洞穴與伏擊'),
 ('r09','高壓水輪','roots','facility',10100,11150,820,720,5,0,'水→雷機關'),
 ('r10','最深集水坑','secret','secret',8850,13960,980,430,8,0,'引力與冰的平台支線'),
 ('r11','雨幕市集','market','shelter',6650,10170,1390,720,2,1,'中期樞紐、商店與教官'),
 ('r12','東側貨梯','reactor','shaft',8750,9720,720,1040,1,0,'升降機與牆跳'),
 ('r13','菌植溫室','roots','outdoor',4900,10040,1140,680,6,0,'自然元素捷徑'),
 ('r14','孤兒避難屋','secret','shelter',3300,10600,920,620,5,1,'隱藏 NPC 與護符'),
 ('r15','樹根裂谷','roots','shaft',2050,9550,760,1200,2,0,'左右交錯牆跳'),
 ('r16','夜班診療所','market','shelter',850,8650,960,680,4,1,'治療、藥櫃與床'),
 ('r17','坍塌地下道','market','cave',3050,8700,1260,580,3,0,'引力搬運核心'),
 ('r18','舊反應爐','reactor','facility',9700,8840,1240,760,6,0,'熱震與 BREAK 戰鬥'),
 ('r19','吊車貨場','reactor','outdoor',11950,9700,1160,660,7,0,'吊鉤與移動平台'),
 ('r20','廢熱煙囪','reactor','shaft',13500,8260,680,1220,0,0,'風流高速垂直段'),
 ('r21','鐘錶工坊','secret','shelter',11550,7850,940,600,8,1,'時序術士功能房'),
 ('r22','檔案分岔廳','archive','hub',7200,7950,1320,760,1,0,'西住區、東工業、上樹海三路'),
 ('r23','暗影儲藏庫','archive','secret',5450,7200,940,630,9,0,'影門與稀有透鏡'),
 ('r24','末日博物館','archive','facility',3300,6650,1080,650,10,0,'展櫃與擬態箱'),
 ('r25','斷層中庭','archive','hub',1450,6600,1240,1050,11,0,'大型中空垂直房'),
 ('r26','舊公寓群','archive','shelter',1200,5480,1180,700,3,1,'多戶生活房與居民 NPC'),
 ('r27','屋頂農園','market','shelter',3000,5200,1180,560,6,1,'作物、料理、自然捷徑'),
 ('r28','纜車轉運站','archive','facility',4900,5750,980,700,5,0,'可開啟跨區捷徑'),
 ('r29','月井禮拜堂','archive','hub',6900,6250,1080,780,7,0,'光橋與垂直水柱'),
 ('r30','風之大教堂','reactor','hub',9000,6400,980,980,9,0,'風井與彈幕戰'),
 ('r31','斷裂空軌','reactor','outdoor',10850,6000,1390,570,4,0,'慢速彈與空中 Dash 路線'),
 ('r32','暴風維修艙','secret','shelter',12850,6350,920,620,0,1,'機巧師與槍手強化'),
 ('r33','樹冠檢疫門','canopy','facility',10000,4850,1170,670,2,0,'影／光雙解法'),
 ('r34','古樹中空','canopy','shaft',7750,4500,1120,1040,3,0,'多層樹洞與抓鉤環'),
 ('r35','懸掛聚落','canopy','shelter',5650,4100,1210,760,1,1,'多間剖面避難屋'),
 ('r36','藤蔓實驗室','canopy','facility',3600,4100,960,690,8,0,'自然元素大型解謎'),
 ('r37','崖邊觀測室','secret','shelter',1850,3700,1030,650,10,1,'遠端地圖與記憶支線'),
 ('r38','樹冠脊柱','canopy','shaft',7200,2780,820,1160,0,0,'長垂直追逐段'),
 ('r39','沉沒飛船','canopy','facility',9200,3200,1300,700,11,0,'傾斜艙室與引力球'),
 ('r40','風車鳥巢','secret','shelter',11750,3500,940,620,5,1,'德魯伊與召喚師支線'),
 ('r41','灰燼攀道','canopy','shaft',13400,4050,720,1120,4,0,'高難度牆跳與受身'),
 ('r42','上層樹冠','canopy','outdoor',11950,2050,1080,760,6,0,'月光露天路線'),
 ('r43','月橋遺址','lighthouse','outdoor',9900,1900,1160,560,7,0,'光橋與多向牽引'),
 ('r44','記憶樹庭','lighthouse','hub',7350,1700,1110,720,2,0,'全職業接招教學樞紐'),
 ('r45','廢校避難所','secret','shelter',5200,2100,1050,680,9,1,'完整教學、家具與收藏室'),
 ('r46','燈塔基座','lighthouse','facility',12400,1050,1120,700,10,0,'最終門與元素序列'),
 ('r47','燈塔內井','lighthouse','shaft',13700,250,720,980,1,0,'最後垂直攀升'),
 ('r48','十相冠頂','lighthouse','boss',11900,100,1770,700,0,0,'最終 Boss 競技場'),
 ('r49','失落回聲核心','secret','secret',9600,500,980,520,11,0,'全收集隱藏結局房'),
 ('r50','西側雨水塔','secret','shaft',480,7400,620,880,6,0,'醫院旁隱藏攀登'),
 ('r51','東側纜索屋','secret','shelter',14300,5750,870,580,4,1,'高空快速移動節點'),
]
rooms=[]
for t in raw:
    rid,name,region,kind,x,y,w,h,art,shelter,note=t
    rooms.append(dict(id=rid,name=name,region=region,kind=kind,x=x,y=y,w=w,h=h,art=art,shelter=bool(shelter),note=note))

# a,b,kind, optional gate, optional route label
edges=[
 ('r00','r01','corridor',None,'初始街道'),('r01','r02','drop',None,'車庫下層'),('r01','r03','climb',None,'井壁'),('r02','r03','climb','ice','冰台捷徑'),('r02','r10','tunnel','gravity','集水坑支線'),
 ('r03','r04','corridor',None,'廚房避難屋'),('r03','r05','climb','fire','三燈根門'),('r04','r05','corridor',None,'生活區通道'),('r05','r06','drop','shadow','閱覽室密道'),('r05','r07','climb',None,'根脈主線'),
 ('r06','r07','grapple','light','閱覽室上窗'),('r07','r08','corridor',None,'泵站東管'),('r08','r09','climb',None,'菌巢出口'),('r09','r12','climb','circuit','水雷電梯'),('r08','r10','drop',None,'集水坑'),
 ('r07','r11','climb',None,'市集主升道'),('r07','r13','corridor','nature','溫室根道'),('r13','r11','corridor',None,'西市集'),('r13','r14','corridor','light','孤兒屋密門'),('r14','r15','drop',None,'避難屋下梯'),
 ('r15','r16','climb',None,'醫院裂谷'),('r15','r17','corridor',None,'地下道'),('r16','r17','corridor',None,'醫院後巷'),('r17','r13','climb','gravity','核心升降'),('r11','r22','climb',None,'中央上行'),
 ('r11','r12','corridor',None,'東貨梯'),('r12','r18','corridor',None,'反應爐入口'),('r18','r19','corridor',None,'貨場'),('r19','r20','climb',None,'煙囪外梯'),('r20','r21','climb','wind','風井支線'),
 ('r21','r22','corridor',None,'鐘錶捷徑'),('r18','r22','climb','thermal','熱震捷徑'),('r22','r23','corridor','shadow','暗影庫'),('r23','r24','corridor',None,'博物館密道'),('r24','r25','corridor',None,'中庭西門'),
 ('r25','r26','climb',None,'公寓中庭'),('r26','r27','corridor',None,'屋頂農園'),('r27','r28','corridor',None,'纜車站'),('r28','r22','climb',None,'檔案捷徑'),('r22','r29','corridor',None,'月井東門'),
 ('r29','r30','corridor','light','光橋'),('r30','r31','corridor',None,'空軌'),('r31','r32','corridor','wind','維修艙'),('r32','r33','climb',None,'檢疫側路'),('r33','r34','corridor',None,'古樹入口'),
 ('r34','r35','corridor',None,'懸村西門'),('r35','r28','drop',None,'纜車回環'),('r35','r36','corridor','nature','藤實驗室'),('r36','r37','corridor',None,'崖邊觀測路'),('r37','r25','drop','gravity','西側雨水塔'),
 ('r25','r50','climb',None,'醫院雨水塔'),('r50','r37','climb','wind','塔頂捷徑'),('r34','r38','climb',None,'樹冠脊柱'),('r38','r39','corridor',None,'飛船殘骸'),('r39','r40','corridor','gravity','鳥巢支線'),
 ('r40','r41','corridor',None,'灰燼攀道'),('r41','r42','climb',None,'上層樹冠'),('r39','r43','climb','light','月橋下引道'),('r42','r43','corridor',None,'月橋'),('r43','r44','corridor',None,'記憶樹庭'),
 ('r44','r38','drop',None,'樹庭回環'),('r44','r45','corridor','memory','廢校密門'),('r45','r35','drop',None,'舊校滑索'),('r42','r46','climb','elements','燈塔外牆'),('r43','r46','corridor','elements','燈塔正門'),
 ('r44','r49','climb','allCollect','回聲核心'),('r49','r46','corridor',None,'隱藏核心道'),('r46','r47','climb',None,'燈塔內井'),('r47','r48','climb',None,'冠頂'),('r32','r51','corridor',None,'東側纜索屋'),
 ('r51','r41','climb','grapple','高空纜索捷徑'),
]
edges=[dict(a=a,b=b,kind=k,gate=g,label=l) for a,b,k,g,l in edges]

shelters=[r['id'] for r in rooms if r['shelter']]
# Distinct collectibles placed in side rooms or puzzle chambers, never in staircase rows.
collectibles=[
 {'id':'c00','type':'life','room':'r06','x':7780,'y':13540,'requires':'shadow'},
 {'id':'c01','type':'mobility','room':'r10','x':9300,'y':14140,'requires':'gravity'},
 {'id':'c02','type':'shelter','room':'r14','x':3760,'y':10960,'requires':'light'},
 {'id':'c03','type':'life','room':'r16','x':1300,'y':9100,'requires':None},
 {'id':'c04','type':'crest','room':'r21','x':12020,'y':8270,'requires':'wind'},
 {'id':'c05','type':'element','room':'r23','x':5900,'y':7590,'requires':'shadow'},
 {'id':'c06','type':'memory','room':'r27','x':3550,'y':5480,'requires':'nature'},
 {'id':'c07','type':'mobility','room':'r32','x':13310,'y':6690,'requires':'wind'},
 {'id':'c08','type':'element','room':'r37','x':2380,'y':4050,'requires':'gravity'},
 {'id':'c09','type':'crest','room':'r40','x':12210,'y':3830,'requires':'gravity'},
 {'id':'c10','type':'memory','room':'r45','x':5750,'y':2470,'requires':'memory'},
 {'id':'c11','type':'shelter','room':'r49','x':10080,'y':810,'requires':'allCollect'},
 {'id':'c12','type':'life','room':'r02','x':3900,'y':14330,'requires':'ice'},
 {'id':'c13','type':'crest','room':'r24','x':3850,'y':6990,'requires':None},
 {'id':'c14','type':'element','room':'r39','x':9800,'y':3550,'requires':'gravity'},
 {'id':'c15','type':'mobility','room':'r51','x':14700,'y':6070,'requires':'grapple'},
]

# Puzzles are tied to edges/rooms and have explicit tutorial hints.
puzzles=[
 {'id':'p_fire','kind':'sequence','room':'r05','x':6400,'y':12740,'elements':['fire','fire','fire'],'hint':'依序點亮根門三盞鹽燈。火焰會留下可見燃燒區。'},
 {'id':'p_ice','kind':'terrain','room':'r02','x':3650,'y':14340,'elements':['ice'],'hint':'把冰打進水槽，或用冰換位平台抵達高處洞口。'},
 {'id':'p_circuit','kind':'sequence','room':'r09','x':10450,'y':11510,'elements':['water','lightning'],'hint':'先讓導線濕潤，再以雷電通電。'},
 {'id':'p_nature','kind':'terrain','room':'r13','x':5450,'y':10420,'elements':['nature'],'hint':'喚醒古種，讓藤蔓連到雨幕市集的上層。'},
 {'id':'p_gravity','kind':'object','room':'r17','x':3700,'y':9050,'elements':['gravity'],'hint':'用引力把核心拉到上方插槽，開啟檔案捷徑。'},
 {'id':'p_thermal','kind':'sequence','room':'r18','x':10250,'y':9250,'elements':['ice','fire'],'hint':'先冰凍龜裂管線，再用火形成熱震。'},
 {'id':'p_shadow','kind':'gate','room':'r23','x':5850,'y':7450,'elements':['shadow'],'hint':'影換位會給相位，利用相位穿過暗影門。'},
 {'id':'p_light','kind':'bridge','room':'r29','x':7350,'y':6650,'elements':['light'],'hint':'以聖光顯示月井東側的隱形橋。'},
 {'id':'p_wind','kind':'object','room':'r31','x':11500,'y':6330,'elements':['wind'],'hint':'用風推動空軌貨箱，讓它壓住維修艙開關。'},
 {'id':'p_tree','kind':'sequence','room':'r36','x':4100,'y':4510,'elements':['water','nature','light'],'hint':'澆灌、催生、照明，完成藤蔓實驗室的三段生長。'},
 {'id':'p_elements','kind':'sequence','room':'r46','x':12900,'y':1450,'elements':['fire','ice','lightning','wind'],'hint':'依門環顏色輸入火、冰、雷、風，啟動燈塔正門。'},
]

world={'version':'9.0.0-organic-metroidvania','width':16000,'height':15000,'start':{'x':1250,'y':14080},'regions':regions,'rooms':rooms,'edges':edges,'shelters':shelters,'collectibles':collectibles,'puzzles':puzzles}
JS.write_text('/* Auto-generated by tools/generate_world.py */\nwindow.ES9_WORLD = '+json.dumps(world,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

# Map preview
W,H=1200,1000
im=Image.new('RGB',(W,H),'#071018');d=ImageDraw.Draw(im)
margin=50
sx=(W-2*margin)/world['width'];sy=(H-2*margin)/world['height']
region_by={r['id']:r for r in regions}
room_by={r['id']:r for r in rooms}
def pt(x,y): return margin+x*sx, margin+y*sy
# edges first
for e in edges:
    a=room_by[e['a']];b=room_by[e['b']]
    ax,ay=pt(a['x']+a['w']/2,a['y']+a['h']/2);bx,by=pt(b['x']+b['w']/2,b['y']+b['h']/2)
    col='#4e7180' if not e['gate'] else '#b67ac8'
    d.line((ax,ay,bx,by),fill=col,width=5 if e['kind']=='corridor' else 3)
# rooms
for r in rooms:
    x1,y1=pt(r['x'],r['y']);x2,y2=pt(r['x']+r['w'],r['y']+r['h'])
    col=region_by[r['region']]['color']
    outline='#f0f7e9' if r['shelter'] else '#1e3038'
    rad=12 if r['kind'] in ('cave','outdoor','hub') else 4
    d.rounded_rectangle((x1,y1,x2,y2),radius=rad,fill=col,outline=outline,width=3 if r['shelter'] else 2)
    if r['shelter']:
        d.rectangle((x1+3,y1+3,x1+9,y1+9),fill='#ffe28a')
# title / legend
try:
    font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',28)
    small=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',15)
except Exception:
    font=small=None
d.text((50,16),'ELEMENTAL SWAP V9 — 有機互聯世界圖',fill='#eaf8f4',font=font)
d.text((760,25),'白框＝避難所　紫線＝元素／能力門　支線＝功能收集品',fill='#9eb8be',font=small)
# compass: y=0 top
d.text((15,H//2),'上',fill='#eaf8f4',font=small);d.text((15,H-60),'下',fill='#eaf8f4',font=small)
OUT.parent.mkdir(parents=True,exist_ok=True);im.save(OUT)
print('wrote',JS,OUT,'rooms',len(rooms),'edges',len(edges))
