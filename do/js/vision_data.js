/* V16 / 視界資料。只新增房間及規則，不重排 V11 世界、不引入 MP。
 * 新資料命名空間 ES16；房間座標可改，必須同步下方 layout 和相鄰邊。
 */
(()=>{'use strict';
const W=window.ES9_WORLD,C=window.ES9;
window.ES16={version:'16.0.0-causal-atelier-release', modes:{
 now:{name:'當下視界',family:'base',color:'#b8eee4',glyph:'◎',rule:'原本世界。所有既有職業與元素規則保留。',trade:'切回時先檢查安全空間，不會強行把你放進牆內。'},
 echo:{name:'既視感',family:'causal',color:'#ffd17e',glyph:'↺',cd:3.5,rule:'最近 3 秒的路徑變踏點；一個殘影按原時間、原位置重播攻擊。',trade:'不追蹤敵人；換位／重生不連成橋；不複製召喚物、治療或獎勵。'},
 forecast:{name:'先知視界',family:'causal',color:'#ff829b',glyph:'◇',cd:.35,rule:'顯示 2 秒內已發射與已鎖定攻擊。射擊菱形因果結點，提前拆除該枚攻擊。',trade:'實線是已承諾彈道；虛線是可能方向。不承諾尚未決定的隨機 AI。'},
 cold:{name:'低熵凝結',family:'thermal',color:'#8be6ff',glyph:'❄',cd:3.8,rule:'局部敵彈停 3 秒，變成踏點；射元素標記凍彈，再按同鍵換位。',trade:'玩家與新射出的子彈不停；解凍後敵彈恢復敵對，提前 0.7 秒示警。'},
 heat:{name:'超熱塑形',family:'thermal',color:'#ff9d75',glyph:'≋',cd:.4,rule:'標記金屬門軟化；回彈牆彈射角色／敵人；釋放冷凝儲存的衝量。',trade:'不是全圖穿牆。只有蜂巢標記材料可軟化，冰台融化前會預警。'},
 macro:{name:'宏觀負載',family:'scale',color:'#dcd599',glyph:'▧',cd:.4,rule:'拉遠鏡頭，用風／岩／引力操作重型配重並壓住機關。',trade:'只改大型可動物件的有效負載，不改熟悉的跳躍重力。'},
 micro:{name:'微觀晶格',family:'scale',color:'#aee997',glyph:'⠿',cd:.4,rule:'縮小碰撞體、放大鏡頭；穿過晶格縫，踩毒池上方的分子踏點。',trade:'敵方運動變慢；不能任意穿所有牆。在狹縫內無法安全長大時，拒絕切回。'},
 sliceA:{name:'A · 內構層',family:'slice',color:'#7cdbe5',glyph:'A',cd:.32,rule:'同一座標切到管線／空腔，走 A 層樓板，繞過 B 層實牆。',trade:'只和同層物件碰撞。切回前會檢查落點。'},
 sliceC:{name:'C · 殘響層',family:'slice',color:'#d1a1ff',glyph:'C',cd:.32,rule:'沿靈魂踏台穿行；光彈連結異層弱點，影錨保留跨層回程。',trade:'B 層招式不打 C，但 C 有自己的脈衝；疊層預警會同時打三層。'}
}, branches:{
 causal:{A:'光軌長存：踏點 6 秒，殘影 42% 傷害',B:'交會作戰：踏點 4.5 秒，殘影 50% 傷害'},
 thermal:{A:'凝結路線：敵彈固定 3.6 秒',B:'衝量釋放：解凍衝量 ×1.3（有限上限）'},
 scale:{A:'探索晶格：微觀移動保持原速',B:'破殼配重：宏觀岩彈推重物更遠'},
 slice:{A:'穩定接點：光之跨層連結 5 秒',B:'破隙突襲：跨層命中额外削 BREAK'}
}, lessons:[
 {id:'echo',room:'v16_echo',title:'01 鐘錶回廊',modes:['echo','forecast'],desc:'空揮也能成為伏擊。先 ZZX，再用殘影與換位把攻擊接上。',steps:[['echoMade','先移動／跳躍並揮刀，再按 [ 建立殘影。'],['echoHit','讓殘影真正打到傀儡；可先空揮，再換位把怪送進刀路。'],['railStand','跳起畫路再切既視感；落在金色光軌上完成踏點驗證。']]},
 {id:'forecast',room:'v16_forecast',title:'02 預射觀測室',modes:['forecast','cold'],desc:'紅菱形屬於將發生的攻擊，用慢速元素彈攔截它。',steps:[['forecastSeen','按 [ 看實線預測；虛線不是承諾。'],['intercept','對準菱形射元素；拆掉一枚尚未抵達的攻擊。'],['exposedHit','攔截後在 3 秒弱點窗內命中觀測守衛。']]},
 {id:'thermal',room:'v16_thermal',title:'03 冷凝泵站',modes:['cold','heat'],desc:'停住敵彈、標記换位；軟化的是指定材料而不是世界邊界。',steps:[['freezeShot','等待彈幕出現，按 [ 至少凝結一顆敵彈。'],['frozenSwap','對凍彈射 1～0，命中後再按同元素鍵換位。'],['heatPass','按 ] 軟化蜂巢門，從左側實際走到門的右側。']]},
 {id:'scale',room:'v16_scale',title:'04 晶格搬運站',modes:['macro','micro'],desc:'重物成配重，毒水成分子踏點；換回時需要足夠空間。',steps:[['heavyMoved','按 [ 宏觀，用 4 風／5 岩／0 引力推動重型箱至少 90px。'],['microPass','按 ] 進入微觀，走過標示晶格牆的狹縫。'],['moleculeStand','保持微觀，跳上毒池上方任一發光分子踏點。']]},
 {id:'slice',room:'v16_slice',title:'05 三層觀測塔',modes:['sliceA','sliceC'],desc:'A 是內構、B 是實體、C 是殘響；不同層不代表永久無敵。',steps:[['slicePass','按 [ 切 A，穿過 B 層高牆，走到右側管線檢查點。'],['crossHit','切 C，朝虛線 B 層守衛射 7 光；光讓本次攻擊跨層命中。'],['sliceEvade','看到 B 射線鎖定後停在其範圍切 C，讓一次射線真正從異層穿過。']]},
 {id:'boss',room:'v16_boss',title:'06 因果織機・帕拉克斯',modes:['forecast','sliceC'],desc:'正式 Boss。拆未來子彈、跨層避招、光連結弱點；失衡核心才可搬動。',steps:[['parallaxDown','擊破帕拉克斯。相位二要用 7 光連結弱點；三層紅框必須真正躲開。']]}
]};
C.VERSION=ES16.version;
Object.assign(C.DEFAULT_KEYS,{visionBook:'KeyJ',visionLeft:'BracketLeft',visionRight:'BracketRight',visionNow:'Backslash'});
Object.assign(C.ACTION_LABELS,{visionBook:'視界工坊／六間試煉',visionLeft:'左槽視界',visionRight:'右槽視界',visionNow:'返回當下 B 層'});
W.width=C.WORLD_W=34800;
W.regions.push({id:'vision',name:'因果觀测支環',color:'#93cfc9',palette:'archive',y0:1800,y1:14800,objective:'J 進入視界工坊。不是濾色，是改寫規則。'});
const rooms=[
 ['hub','歸燈・鏡片工房',26700,13200,1700,1100,'shelter','market'],
 ['echo','鐘錶回廊',29000,12800,2050,1250,'hub','archive'],
 ['forecast','預射觀測室',31800,12200,2150,1350,'facility','tide'],
 ['thermal','冷凝泵站',29900,9800,2400,1800,'facility','reactor'],
 ['scale','晶格搬運站',26700,7400,2450,1800,'cave','roots'],
 ['slice','三層觀測塔',30100,5100,2800,2200,'shaft','archive'],
 ['boss','因果織機・帕拉克斯',31500,2250,2400,1700,'boss','lighthouse']
];
for(const [id,name,x,y,w,h,kind,palette]of rooms)W.rooms.push({id:'v16_'+id,name,x,y,w,h,kind,region:'vision',art:3,shelter:id==='hub',note:'四組視界／兩槽配裝 · J 工坊',expansion:true,palette,v16:id});
const links=[['e00','v16_hub','corridor'],['v16_hub','v16_echo','corridor'],['v16_echo','v16_forecast','climb'],['v16_forecast','v16_thermal','climb'],['v16_thermal','v16_scale','grapple'],['v16_scale','v16_slice','climb'],['v16_slice','v16_boss','grapple']];
for(const [a,b,kind]of links)W.edges.push({a,b,kind,label:'視界支環'});
})();
