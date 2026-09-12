"""產生 V10 技能資料；每列是實際施放機制，不是只在畫面列出技能名称。
欄位：id/name/mode/damage/cooldown/element/description/extra。
執行此檔只會重建 skills.js 與技能手冊，不會修改使用者存檔。
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D={}
def add(cls, rows):
 out=[]
 for row in rows:
  key,name,mode,dmg,cd,element,desc,*extra=row
  obj=dict(id=cls+'_'+key,name=name,mode=mode,damage=dmg,cd=cd,element=element,desc=desc)
  obj.update(extra[0] if extra else {})
  out.append(obj)
 assert len(out)==12, (cls,len(out))
 D[cls]=out
add('rift',[
 ('step','裂步三連','dash',11,.65,'wind','前進三次短斬；每段命中後可用跳躍或換位取消。',{'hits':3,'move':410,'range':140}),
 ('rise','逆界挑空','launch',22,.85,'light','近距挑空，自己小幅上升並刷新空中 Dash。',{'launch':-590,'range':155}),
 ('cross','回身十字','spin',14,1.05,'shadow','朝前後各斬一次，適合換到敵人群中央。',{'hits':2,'range':180}),
 ('needle','穿雲劍氣','volley',13,.8,'light','射出三枚慢速、可穿一名敵人的劍氣。',{'hits':3,'speed':240,'pierce':1}),
 ('behind','背隙斬','blink',29,1.1,'shadow','安全移到標記敵人背後，再斬擊其背部。',{'range':210}),
 ('orbit','游刃護環','orbit',8,1.3,'wind','三枚環刃繞玩家旋轉三秒，移動也持續攻擊。',{'duration':3,'range':128}),
 ('ground','地裂波','wave',25,1.1,'earth','沿腳下發出慢速震波；岩標記增加破甲。',{'speed':185,'pierce':3}),
 ('anchor','雙端共鳴','anchorDetonate',23,1.2,'fire','玩家與目前元素錨點兩端各爆發，錨點保留。',{'range':165}),
 ('return','返程斷空','anchorRecall',25,1.05,'ice','先與目前錨點交換，抵達時範圍冰斬；無錨點則原地斬。',{'range':170}),
 ('counter','逆鋒格擋','parry',32,.9,'lightning','短反擊窗；成功擋招會電暈近敵並恢復空中 Dash。'),
 ('rain','星隙劍雨','meteor',10,1.7,'light','鎖定施放時的目標位置，分五次落下劍光。',{'hits':5,'range':120}),
 ('finish','十相終式','spin',13,1.9,'fire','四次環斬後重擊；最近換位元素附加到每段命中。',{'hits':5,'range':220})
])
add('summoner',[
 ('fox','召喚・浮光狐','summon',10,.7,'fire','最多一隻狐靈；再次施放刷新時間、提升階級。',{'summon':'fox','role':'striker'}),
 ('owl','召喚・觀測鴞','summon',9,.85,'wind','最多一隻鴞靈；定期將敵人挑空。',{'summon':'owl','role':'launcher'}),
 ('guard','召喚・守護靈','summon',6,1.05,'light','最多一隻守護靈；護盾與範圍低傷支援。',{'summon':'guardian','role':'guard'}),
 ('star','召喚・星獸','summon',14,1.8,'gravity','最多一隻星獸，聚敵後緩慢重擊。',{'summon':'star','role':'vortex'}),
 ('order','契靈集火','commandSummons',13,.65,'lightning','現有契靈各追加一次攻击；沒有契靈時射出靈矢。'),
 ('exchange','主僕換位','summonSwap',20,.8,'shadow','與最近契靈安全交換，兩端產生衝擊。',{'range':145}),
 ('lance','五曜靈矢','volley',8,.75,'light','五枚追蹤慢彈；被元素標記的敵人優先鎖定。',{'hits':5,'speed':200,'homing':True}),
 ('pact','契約護庭','barrier',6,1.25,'light','設置四秒防護圈，阻擋敵彈而不遮住視線。',{'duration':4,'range':155}),
 ('call','錨點召集','rally',17,.9,'nature','把所有契靈移至元素錨點旁，纏根周邊敵人；無錨點則召回身旁。',{'range':165}),
 ('gale','鴞羽上托','launch',17,.85,'wind','自身上升，命令鴞靈補一次挑空。',{'launch':-510,'range':180}),
 ('mend','共生修復','heal',0,1.65,'water','回復生命、解除持續傷害；契靈存在時多回復少量。',{'heal':12}),
 ('festival','群星巡行','orbit',7,1.8,'light','光星繞身四秒；可邊換位邊帶著光星切入。',{'duration':4,'range':170})
])
add('beast',[
 ('claw','狼・裂爪追獵','pounce',10,.6,'fire','切為狼形，低姿前撲三連爪；不是人形劍斬。',{'form':'wolf','hits':3,'move':520,'range':130}),
 ('howl','狼・獵群嚎聲','howl',14,.9,'shadow','狼形嚎叫：附近敵人被詛咒，接著爪擊增傷。',{'form':'wolf','range':225}),
 ('dash','狼・月下疾奔','dash',19,.55,'wind','切狼，穿過短距離並留一次撲咬；適合繞背。',{'form':'wolf','move':690,'range':120}),
 ('flight','鷹・自由飛翔','fly',0,1.25,'wind','切鷹並展翼；按住 Space 配合方向鍵飛翔，放開則滑翔。',{'form':'eagle','duration':4.5}),
 ('feather','鷹・迴旋飛羽','volley',9,.7,'wind','鷹形射出四道風羽；施放時維持浮空。',{'form':'eagle','hits':4,'speed':210}),
 ('dive','鷹・俯衝獵殺','dive',30,1.15,'lightning','切鷹向下俯衝；落地才產生衝擊，命中後反彈。',{'form':'eagle','range':195}),
 ('palm','熊・震山掌','quake',30,.95,'earth','切熊，向前與腳下同時震地；不需要瞄單一敵人。',{'form':'bear','range':235}),
 ('roar','熊・裂甲咆哮','roar',18,1.1,'earth','切熊，範圍破甲並削減 Boss BREAK。',{'form':'bear','range':255}),
 ('armor','熊・不屈山軀','armor',12,1.35,'light','切熊獲得短霸體與護盾，近距敵人被推開。',{'form':'bear','range':160}),
 ('root','森靈・根系突生','roots',14,1.1,'nature','錨點附近長出可站藤台並纏根敵人。',{'range':210}),
 ('cycle','輪形共擊','formStrike',20,.8,'light','狼撲咬／鷹升羽／熊震地；依當前形態完全不同。'),
 ('king','森王融合','king',20,1.9,'nature','九秒森王形態：飛行、範圍掌擊與短霸體並存。',{'duration':9,'range':210})
])
add('artificer',[
 ('hook','纜索牽引','grapple',15,.6,'wind','鉤環、標記敵人或普通敵人均可作機動目標。'),
 ('turret','哨戒砲台','turret',10,.7,'lightning','最多一台主砲；再次施放刷新並升階，不消耗彈藥。'),
 ('step','磁浮踏台','platform',0,.75,'ice','腳下生成短暫踏台，自己彈起並刷新空中 Dash。'),
 ('gear','回返齒輪','boomerang',14,.9,'earth','向前拋出齒輪再回到玩家，每個方向最多命中一次。',{'speed':200,'pierce':3}),
 ('mine','感應火雷','mine',30,1.1,'fire','在地面或錨點佈雷；有敵人接近才引爆。',{'range':180,'duration':5}),
 ('coil','磁吸線圈','vortex',5,1.2,'gravity','在錨點設置吸引場；能拉敵人與箱子，不會消耗錨點。',{'range':240,'duration':3}),
 ('rail','磁軌穿行','rail',34,1.45,'lightning','發射可穿四敵人的慢速重彈，射擊後向前短移。',{'speed':210,'pierce':4}),
 ('shield','折射屏障','barrier',0,1.2,'light','設置三秒阻彈屏障；玩家仍可穿越。',{'duration':3,'range':145}),
 ('repair','緊急維修','heal',0,1.65,'water','治療並刷新主砲存續時間，不重置技能冷卻。',{'heal':14}),
 ('bomb','高弧榴彈','grenade',26,1.1,'fire','慢速拋物線榴彈，碰敵或到時爆炸。',{'range':175,'speed':190}),
 ('wire','接地電網','field',7,1.45,'lightning','留在施放位置的電網，週期性麻痺。',{'duration':3,'range':185}),
 ('overload','砲網超載','overload',12,1.8,'lightning','主砲短時加速射擊，錨點也釋放一次電圈。',{'duration':5})
])
add('gunner',[
 ('shot','反衝雙發','volley',13,.55,'light','兩枚慢彈；後座短移，不需裝填或資源。',{'hits':2,'speed':250,'recoil':180}),
 ('rocket','火箭起跳','launch',19,.8,'fire','向下噴火、向上升空；刷新一次空中 Dash。',{'range':150,'launch':-480}),
 ('slug','重磁軌砲','rail',38,1.4,'earth','緩速穿透重彈，高 BREAK 與後座力。',{'speed':170,'pierce':6,'recoil':260}),
 ('fan','電弧散射','volley',9,.7,'lightning','五枚扇形慢彈；濕潤目標被電暈。',{'hits':5,'speed':230}),
 ('grenade','濕霧榴彈','grenade',18,.95,'water','拋物線水榴彈，讓聚集的敵人濕潤。',{'speed':185,'range':190}),
 ('roll','翻滾射擊','dash',20,.65,'wind','低姿翻滾後向前射擊；短時間避開接觸傷害。',{'move':-430,'shot':True,'range':110}),
 ('focus','標靶狙擊','targetShot',40,1.35,'light','優先對標記敵人發射一枚追蹤穿透彈。',{'speed':255,'homing':True,'pierce':2}),
 ('orbit','衛星彈環','orbit',7,1.3,'lightning','三枚子彈環繞玩家，適合跟著換位靠近。',{'duration':3,'range':155}),
 ('anchor','雙端交叉火力','anchorDetonate',23,1.15,'fire','玩家與元素錨點交替引爆，保持遠程交叉攻擊。',{'range':170}),
 ('barrage','滯空彈幕','hoverVolley',8,1.25,'wind','懸停後分四拍射擊，方向可在空中調整。',{'hits':4,'speed':215}),
 ('rupture','寒裂轟擊','wave',29,1.1,'ice','沿地面滑行的冰重彈，推開近地敵人。',{'speed':180,'pierce':3}),
 ('storm','天穹轟炸','meteor',11,1.9,'fire','六次落彈鎖定原位置，敵人可移開，自己也可換位。',{'hits':6,'range':140})
])
add('warden',[
 ('rush','壁壘衝鋒','dash',25,.75,'earth','短距盾衝；高破甲與 BREAK，不是瞬間傳送。',{'move':510,'range':155}),
 ('spear','長槍上引','launch',22,.85,'wind','長槍挑空並將近敵帶至前方。',{'range':195,'launch':-580}),
 ('guard','精準反擊','parry',36,.65,'lightning','0.38 秒反擊窗；成功後電暈並推開近敵。'),
 ('fort','移動堡壘','barrier',0,1.3,'light','護圈跟隨玩家三秒；擋彈但仍要躲大範圍地面招。',{'range':135,'duration':3,'follow':True}),
 ('quake','盾落山崩','dive',35,1.2,'earth','向下落地震擊，地上施放則原地震圈。',{'range':260}),
 ('chain','拘束長槍','pull',21,.8,'nature','把輕敵拉回，重敵則拉近自己，並纏根。',{'range':620}),
 ('arc','回旋盾','boomerang',15,.95,'light','盾刃來回兩段，各命中一次。',{'speed':205,'pierce':4}),
 ('vow','守護誓約','armor',0,1.5,'light','護盾與短霸體，清除蛛網但不無敵。'),
 ('anchor','壁間共振','anchorDetonate',28,1.2,'earth','兩端震波；岩錨點適合大幅削減 BREAK。',{'range':210}),
 ('cleave','槍盾交替','spin',12,1.1,'light','先槍後盾三段橫掃，最後一段高擊退。',{'hits':3,'range':180}),
 ('restore','庇護祈願','heal',0,1.75,'water','恢復生命與短護盾，沒有魔力條。',{'heal':14}),
 ('judgement','天壁裁決','meteor',17,1.9,'lightning','三次落槍與範圍破勢，銜接在 Boss 失衡後。',{'hits':3,'range':200})
])
add('chrono',[
 ('echo','回響步','blink',20,.7,'shadow','向前安全移動，舊位置半秒後再斬一次。',{'echo':True,'range':155}),
 ('stop','凝滯鐘域','stasis',3,1.25,'ice','敵人與敵彈減速三秒；不永久凍住世界。',{'duration':3,'range':220}),
 ('rewind','三秒回溯','rewind',0,1.75,'water','回到三秒前的位置與較高生命；空間碰撞會檢查。'),
 ('anchor','時間錨','timeAnchor',0,.55,'light','首次記錄安全位置，再次施放回到該點。'),
 ('shard','碎秒彈','volley',9,.7,'light','四枚慢速時間碎片，可追擊標記目標。',{'hits':4,'speed':185,'homing':True}),
 ('lift','逆時升空','launch',20,.85,'wind','玩家與近敵向上彈起，回復一次空中 Dash。',{'range':175,'launch':-620}),
 ('seal','延遲刻印','delayed',33,1.2,'fire','在目標施放時位置留下刻印，0.7 秒後爆發。',{'delay':.7,'range':185}),
 ('orbit','時針巡遊','orbit',7,1.2,'lightning','環繞時針每半秒掃擊，命中附電。',{'duration':3.5,'range':155}),
 ('borrow','借來的一秒','haste',0,1.4,'wind','短時取消窗提早，Dash 冷卻短一點，不重置技能。',{'duration':4}),
 ('rift','昨日裂隙','anchorDetonate',24,1.2,'shadow','舊錨點與玩家兩端各保留一次延遲爆炸。',{'range':190,'delay':.35}),
 ('return','回返時輪','boomerang',17,1.1,'ice','迴旋時間輪去回各一擊。',{'speed':175,'pierce':4}),
 ('twelve','十二刻回響','meteor',9,1.9,'light','分六拍在目標周圍回響，不使用真實時間 setTimeout。',{'hits':6,'range':160})
])
add('harrier',[
 ('hook','鎖鏈鉤','pull',18,.55,'earth','抓近輕敵，重敵則拉自己接近。',{'range':690}),
 ('swing','擺盪踢','grapple',22,.65,'wind','抓向標記敵人或流光環，並刷新一次空中 Dash。'),
 ('spiral','鎖域旋舞','vortex',6,1.25,'gravity','持續聚敵；一邊留場一邊以元素換位追擊。',{'range':240,'duration':3}),
 ('swap','反向奪位','blink',24,.8,'shadow','繞到標記敵人背後，留下向前的踢擊。',{'range':170}),
 ('scythe','雙返鐮','boomerang',14,.9,'wind','兩把弧形鎖刃往返，適合群怪。',{'speed':215,'pierce':3,'hits':2}),
 ('rising','上勾鎖','launch',23,.85,'lightning','把近敵拋向上方，順勢上升。',{'launch':-630,'range':185}),
 ('fall','墜鎖重踏','dive',32,1.15,'earth','落地範圍震擊；空中接技的收尾。',{'range':220}),
 ('net','交織縛網','roots',15,1.1,'nature','錨點周圍纏根，生成可站的短暫網台。',{'range':210}),
 ('fan','鎖刃散射','volley',8,.75,'water','五枚細小慢彈，先上濕潤供雷換位。',{'hits':5,'speed':235}),
 ('counter','纏腕反制','parry',31,.8,'shadow','擋招後把敵人拖回腳邊。'),
 ('steps','四方蹴','spin',10,1.2,'wind','四段踢擊範圍由小變大。',{'hits':4,'range':195}),
 ('anchor','十相牽連','anchorRecall',29,1.5,'gravity','換到錨點後把周圍敵人吸回自己。',{'range':230})
])
add('alchemist',[
 ('mist','濕霧瓶','grenade',13,.7,'water','拋濕霧瓶讓敵人濕潤，準備導電。',{'speed':175,'range':185}),
 ('spark','電解試劑','volley',9,.8,'lightning','三發電解彈，濕潤敵人額外受電。',{'hits':3,'speed':200}),
 ('burn','焚化催化','consume',30,1.05,'fire','消耗範圍內燃燒／濕潤狀態，額外爆發。',{'range':230}),
 ('ice','急凍結晶','platform',12,.85,'ice','腳下結晶可站立，附近敵人冰緩。'),
 ('acid','腐蝕釜','field',7,1.2,'earth','在錨點留下三秒破甲藥霧。',{'range':180,'duration':3}),
 ('seed','菌根培養','roots',13,1.1,'nature','長出藤台並纏根，建立解謎與空戰踏點。',{'range':195}),
 ('heal','快速包紮','heal',0,1.65,'water','治療與解除毒、燃燒，不需消耗藥品。',{'heal':15}),
 ('lift','蒸氣升梯','launch',18,.8,'wind','蒸氣頂起玩家和近敵，接空中元素投射。',{'range':160,'launch':-510}),
 ('gravity','凝質黑瓶','vortex',4,1.2,'gravity','慢速成形的引力釜，吸怪、箱子和核心球。',{'range':260,'duration':3}),
 ('shield','光膜蒸餾','barrier',0,1.3,'light','原地短效光膜阻彈，可換位離開。',{'duration':3.5,'range':155}),
 ('swap','雙瓶對流','anchorDetonate',24,1.2,'water','玩家與錨點各爆一瓶；共鳴元素可改變狀態。',{'range':190}),
 ('chain','連鎖煉成','meteor',11,1.85,'fire','六次藥瓶落地，適合先引力聚怪再用火引爆。',{'hits':6,'range':160})
])
add('monk',[
 ('jab','踏風三拳','dash',10,.55,'wind','前進三連拳，命中可跳或換位取消。',{'hits':3,'move':370,'range':100}),
 ('rise','升龍掌','launch',23,.8,'lightning','以拳掌挑空，附雷適合接水換位。',{'range':150,'launch':-650}),
 ('wave','裂氣波','wave',22,.8,'light','慢速地面氣波，穿過三名敵人。',{'speed':230,'pierce':3}),
 ('counter','寸勁反掌','parry',35,.65,'earth','精準反掌窗口；成功後重創 BREAK。'),
 ('step','雷影步','blink',22,.7,'shadow','向標記敵人背後踏步，保留空中機動。',{'range':130}),
 ('spin','旋風連踢','spin',9,.95,'wind','四段踢擊圍繞自己，移動時仍能造成命中。',{'hits':4,'range':190}),
 ('drop','千鈞落踵','dive',33,1.05,'earth','下墜落踵，落地才範圍震擊。',{'range':235}),
 ('palm','凝雷掌','volley',11,.7,'lightning','三枚緩慢掌風，命中有雷麻痺。',{'hits':3,'speed':190}),
 ('guard','金鐘護體','armor',0,1.25,'light','短霸體與護盾；不能擋住所有傷害。'),
 ('rhythm','疾風呼吸','haste',0,1.1,'wind','四秒提早取消窗，增強連段操作而非傷害數字。',{'duration':4}),
 ('anchor','隔空雙勁','anchorDetonate',26,1.2,'fire','隔著錨點打出雙端掌波，銜接元素爆破。',{'range':190}),
 ('finish','九響天雷','spin',8,1.9,'lightning','六次環拳後雷掌；多段但有共享 Hit Stop 上限。',{'hits':7,'range':225})
])
# 分支 A 在 rank1 解鎖狀態化，B 增加控制/延時回擊；可免費切換但不退點。
# 所有效果對應 mastery.js 的 modifierEffect，不只是名稱或傷害倍率。
branch_b={'dash':'echo','launch':'air','spin':'pull','volley':'pierce','blink':'echo','orbit':'reach','wave':'pierce','anchorDetonate':'pull','anchorRecall':'shield','parry':'air','meteor':'echo','summon':'reach','commandSummons':'air','summonSwap':'shield','barrier':'heal','rally':'pull','heal':'shield','fly':'reach','dive':'air','quake':'pull','roots':'shield','pounce':'echo','howl':'air','roar':'pull','armor':'heal','formStrike':'echo','king':'reach','grapple':'shield','turret':'reach','platform':'shield','boomerang':'pierce','mine':'pull','vortex':'reach','rail':'pierce','grenade':'echo','field':'reach','overload':'reach','targetShot':'pierce','hoverVolley':'air','pull':'air','stasis':'reach','rewind':'shield','timeAnchor':'heal','delayed':'echo','haste':'air','consume':'echo'}
B_NAMES={'echo':'回響追段','air':'滯空續接','pull':'收束聚敵','pierce':'穿透延伸','shield':'換位護膜','reach':'領域擴展','heal':'回復脈動'}
B_DESC={'echo':'命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。','air':'成功命中或使用輔助技後刷新一次空中 Dash。','pull':'受擊敵人被向命中中心拉扯；重型敵人位移較小。','pierce':'投射物額外穿透兩名敵人；非投射技延長攻擊範圍。','shield':'施放時獲得少量護盾；不是額外的技能資源。','reach':'場域／召喚感知／飛行時間或攻擊範圍擴大 25%。','heal':'施放時少量回復生命，技能本身仍只受冷卻限制。'}
ELE={'fire':'灼熱','ice':'急凍','lightning':'麻痺','wind':'風壓','earth':'裂甲','water':'濕潤','light':'光癒','shadow':'咒印','nature':'纏根','gravity':'引力'}
for cls,skills in D.items():
 for i,s in enumerate(skills):
  code=branch_b.get(s['mode'],'echo'); s['branches']=[{'id':'A','name':ELE[s['element']]+'特化','effect':'element','desc':'技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。'}, {'id':'B','name':B_NAMES[code],'effect':code,'desc':B_DESC[code]}]
  s['recommendedFollow']=skills[(i+1)%len(skills)]['id']
(ROOT/'js/skills.js').write_text('/* V10 技能資料。由 tools/create_mastery_data.py 重建。 */\nwindow.ES10_SKILLS = '+json.dumps(D,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Generated',len(D),'classes',sum(map(len,D.values())),'skills')
