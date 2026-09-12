"""保留 V9.1 原有 52 房間／71 連線，只追加東境支路與十職教場。"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'js/world.js').read_text();w=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
# 可重複執行；只從原始 r00..r51 建立新版。
w['rooms']=[r for r in w['rooms'] if r['id'].startswith('r') and int(r['id'][1:])<52]
w['edges']=[e for e in w['edges'] if e['a'].startswith('r') and e['b'].startswith('r')]
w['collectibles']=[e for e in w['collectibles'] if not e['id'].startswith('m10')]
w['puzzles']=[e for e in w['puzzles'] if not e['id'].startswith('m10')]
w['shelters']=[r for r in w['shelters'] if r.startswith('r')]
w['regions']=[r for r in w['regions'] if r['id'] not in ['foundry','school']]
w['width']=25600;w['version']='10.0.0-mastery-east-expansion'
w['regions'] += [dict(id='foundry',name='東境・回響鑄城',color='#83b6bb',palette='reactor',y0=2000,y1=15000,objective='從沉水渡口上行，修復四座共鳴爐，連回風井與樹冠。'),dict(id='school',name='十職研習院',color='#d6b884',palette='market',y0=1000,y1=15000,objective='按 T 進入職業課程；每一步以實際命中與位移完成判定。')]
# 相鄰跨度不使用完全重複塔樓；洞窟、內井、庭院與工坊交錯。
rows=[
('e00','東境渡口',16000,12400,1250,650,'shelter','tide','渡口床鋪、食物與教場入口'),
('e01','鏽潮運河',17700,12700,1100,600,'cave','tide','水→雷：沿濕潤導線啟動共鳴爐'),
('e02','垂蔓貨井',17600,10800,680,1500,'shaft','roots','把換位彈向上投，或乘鷹翔與鉤環上升'),
('e03','熄火鍛造室',15900,10300,1180,740,'facility','reactor','冰→火：擊裂外殼後回到渡口捷徑'),
('e04','火爐中庭',18700,10100,1450,1000,'hub','reactor','三路交會；護甲與破勢教學'),
('e05','霧燈診所',20600,11000,1050,700,'shelter','market','NPC 提供治療、專精點提示'),
('e06','銅鴞花園',20700,9150,1250,1050,'outdoor','canopy','藤→風：喚醒屋頂轉軸'),
('e07','倒懸書庫',16100,8000,1450,850,'facility','archive','光→影：揭露穿過書庫的隱藏門'),
('e08','風羽長井',18000,7400,720,1900,'shaft','canopy','飛行與移動技能的垂直支線'),
('e09','斷鐘避難屋',19700,7250,1120,750,'shelter','market','與工匠交換專精零件'),
('e10','磁雨列車',21600,7600,1430,700,'facility','reactor','精英砲陣：讀預警，不要站在落點'),
('e11','凝晶暗窟',17000,5800,1320,950,'cave','secret','引力搬運／分支強化收藏'),
('e12','雙環試煉庭',19000,5050,1540,1100,'hub','archive','環路與雙端爆發：新區域守衛'),
('e13','晴穹苗圃',21000,4450,1220,900,'outdoor','canopy','高處收藏；返回診所的快速支路'),
('e14','觀星寄宿所',18000,3300,1200,820,'shelter','lighthouse','最後補給與十職研習院回程'),
('e15','共鳴鑄心',20800,2350,1660,900,'boss','lighthouse','東境 Boss：熔鑄監察者；不取代 r48 最終哨兵')]
for i,(rid,n,x,y,ww,hh,k,pal,note) in enumerate(rows):
 w['rooms'].append(dict(id=rid,name=n,x=x,y=y,w=ww,h=hh,kind=k,region='foundry',art=(i*3)%12,shelter=k=='shelter',note=note,expansion=True,palette=pal))
 if k=='shelter':w['shelters'].append(rid)
# Existing terrain gen selects region palette; custom region per room only changes backdrop via module.
links=[('r13','e00','corridor'),('e00','e01','tunnel'),('e01','e02','climb'),('e02','e03','corridor'),('e02','e04','climb'),('e03','r21','grapple'),('e04','e05','drop'),('e05','e06','climb'),('e04','e08','climb'),('e03','e07','climb'),('e07','e08','corridor'),('e08','e09','corridor'),('e09','e10','drop'),('e10','e06','drop'),('e07','e11','climb'),('e11','e12','climb'),('e09','e12','climb'),('e12','e13','grapple'),('e12','e14','climb'),('e14','e15','climb'),('e13','e15','climb'),('e14','r42','grapple')]
for a,b,k in links:w['edges'].append(dict(a=a,b=b,kind=k,gate=None,label='東境連通路'))
classes=['rift','summoner','beast','artificer','gunner','warden','chrono','harrier','alchemist','monk']
cn=['裂隙劍士','靈契召喚師','森靈德魯伊','符機工匠','磁軌槍手','界壁守衛','時序術士','鎖鏈游擊者','鍊金調律師','雷影武僧']
for i,(cls,name) in enumerate(zip(classes,cn)):
 x=23400; y=13750-i*1300;h=1150 if cls=='beast' else 850
 rid='t_'+cls
 w['rooms'].append(dict(id=rid,name=name+'研習場',x=x,y=y,w=1750,h=h,region='school',kind='hub',art=i%12,shelter=False,note='獨立練習空間｜T 選課／Backspace 離場',training=cls,expansion=True))
 # 教場有實體連接；T 也可安全往返，不用每次走長途。
 w['edges'].append(dict(a='e01' if i<3 else 'e10' if i<6 else 'e13',b=rid,kind='grapple',gate=None,label='教場連索'))
for i,(rid,seq) in enumerate([('e01',['water','lightning']),('e03',['ice','fire']),('e06',['nature','wind']),('e07',['light','shadow'])]):
 r=next(r for r in w['rooms'] if r['id']==rid)
 w['puzzles'].append(dict(id='m10_relay_'+str(i),kind='sequence',room=rid,x=r['x']+r['w']*.65,y=r['y']+r['h']-100,elements=seq,hint='東境共鳴爐｜依序 '+ ' → '.join(seq)+'，首解獎勵 3 專精點。'))
for i,(rid,kind) in enumerate([('e03','crest'),('e06','mobility'),('e07','memory'),('e10','element'),('e11','crest'),('e13','life')]):
 r=next(r for r in w['rooms'] if r['id']==rid)
 w['collectibles'].append(dict(id='m10_shrine_'+str(i),type=kind,room=rid,x=r['x']+r['w']*.66,y=r['y']+r['h']-330,requires=None,name='共鳴研究遺物'))
(ROOT/'js/world.js').write_text('/* V10：V9.1 原圖 + 東境十六房 + 十職研習場。 */\nwindow.ES9_WORLD='+json.dumps(w,ensure_ascii=False,separators=(',',':'))+';\n')
print('world',len(w['rooms']),len(w['edges']),len(w['puzzles']))
