/*
 * Elemental Swap V9 — Organic Metroidvania configuration
 * ---------------------------------------------------------------------------
 * V9 keeps the original element-swap mechanic, removes MP completely and
 * builds combat around Z/X command branches, movement skills and short CDs.
 */
window.ES9 = {
  VERSION:'11.0.0-afterlight-shelter-release',
  VIEW_W:1280,
  VIEW_H:720,
  WORLD_W:window.ES9_WORLD?.width||16000,
  WORLD_H:window.ES9_WORLD?.height||15000,
  START_X:window.ES9_WORLD?.start?.x||1250,
  START_Y:window.ES9_WORLD?.start?.y||14080,

  PHYSICS:{
    gravity:1820,maxFall:1050,moveSpeed:340,
    groundAccel:4700,groundDecel:6500,airAccel:2250,airDecel:900,
    jumpSpeed:700,coyote:.13,jumpBuffer:.14,jumpCut:.48,
    wallSlide:145,wallJumpX:490,wallJumpY:680,
    dashSpeed:735,dashTime:.15,dashCooldown:.22,
    grappleSpeed:820
  },

  // Movement uses the arrow cluster.  Z/X are the two command buttons.
  // Y remains an optional heavy-attack alias for players used to V8.
  DEFAULT_KEYS:{
    left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',
    jump:'Space',dash:'ShiftLeft',grapple:'KeyA',interact:'KeyE',
    zAttack:'KeyZ',xAttack:'KeyX',xAttackAlt:'KeyY',
    skill1:'KeyC',skill2:'KeyV',skill3:'KeyB',classSkill:'KeyQ',
    element1:'Digit1',element2:'Digit2',element3:'Digit3',element4:'Digit4',element5:'Digit5',
    element6:'Digit6',element7:'Digit7',element8:'Digit8',element9:'Digit9',element10:'Digit0',
    skillbook:'KeyL',school:'KeyT',deck:'KeyF',exitSchool:'Backspace',reset:'KeyR',map:'KeyM',help:'KeyH',keyConfig:'KeyK',hud:'Tab',pause:'KeyP'
  },
  ACTION_LABELS:{
    left:'向左',right:'向右',up:'向上／瞄準',down:'向下／瞄準',jump:'跳躍／二段跳／受身',dash:'Dash／空中 Dash',grapple:'流光牽引／反衝',interact:'互動',
    zAttack:'Z 快攻',xAttack:'X 重攻',xAttackAlt:'Y 重攻副鍵',skill1:'技能 C',skill2:'技能 V',skill3:'技能 B',classSkill:'職業能力 Q',
    element1:'火焰',element2:'冰霜',element3:'雷電',element4:'疾風',element5:'岩土',element6:'流水',element7:'聖光',element8:'暗影',element9:'自然',element10:'引力',
    skillbook:'技能工坊／強化分支',school:'職業研習場',deck:'切換技能頁',exitSchool:'離開研習場',reset:'回檢查點',map:'有機世界地圖',help:'操作／接招說明',keyConfig:'自訂鍵位',hud:'焦點／完整 HUD',pause:'暫停'
  },

  ELEMENTS:[
    {id:'fire',name:'火焰',glyph:'火',color:'#ff7147',speed:225,gravity:0,damage:13,mark:8,desc:'燃燒；換位在兩端留下持續火區。'},
    {id:'ice',name:'冰霜',glyph:'冰',color:'#74e0f2',speed:185,gravity:175,damage:9,mark:9,desc:'冰緩與凍水；換位生成真正可站立的冰台。'},
    {id:'lightning',name:'雷電',glyph:'雷',color:'#ffe36c',speed:285,gravity:0,damage:10,mark:6,desc:'暈眩；濕潤目標會導電並連鎖。'},
    {id:'wind',name:'疾風',glyph:'風',color:'#78e7b8',speed:210,gravity:-35,damage:7,mark:7,desc:'推怪與物件；換位提供風衝與空中續航。'},
    {id:'earth',name:'岩土',glyph:'岩',color:'#bd895b',speed:150,gravity:500,damage:18,mark:10,desc:'破甲、削 BREAK；換位生成石柱。'},
    {id:'water',name:'流水',glyph:'水',color:'#5ba7e7',speed:180,gravity:70,damage:7,mark:10,desc:'濕潤與熄火；換位生成噴泉並治療。'},
    {id:'light',name:'聖光',glyph:'光',color:'#fff0aa',speed:235,gravity:0,damage:9,mark:8,desc:'顯形、護盾；照出光橋與隱藏房。'},
    {id:'shadow',name:'暗影',glyph:'影',color:'#a17bdb',speed:195,gravity:0,damage:11,mark:9,desc:'詛咒與相位；可穿影門並留下誘餌。'},
    {id:'nature',name:'自然',glyph:'藤',color:'#75cc7e',speed:165,gravity:245,damage:8,mark:11,desc:'纏根；換位長出可攀藤柱。'},
    {id:'gravity',name:'引力',glyph:'引',color:'#d97bd8',speed:120,gravity:-12,damage:5,mark:12,desc:'飛行中持續吸怪與箱子；換位留引力井。'}
  ],

  // C is a fast extender, V is a launcher/reposition tool, B is the finisher.
  // All use cooldowns only — no MP, energy bar or ammunition gate.
  CLASSES:{
    rift:{name:'裂隙劍士',icon:'刃',accent:'#65e4e7',hp:180,speed:1.05,
      desc:'最多貼身位移與取消；Z/X Command 會跨越敵人並刷新空中 Dash。',
      skills:[['裂步取消',.46],['逆界追空',.82],['十相閃滅',1.65]],q:['裂隙換側',.55]},
    summoner:{name:'靈契召喚師',icon:'契',accent:'#d18ce9',hp:150,speed:.98,
      desc:'Z 為短杖，X 為契靈指令；狐狸、鴞、守護靈同種最多一隻。',
      skills:[['狐靈接擊',.58],['鴞靈挑空',.88],['守護靈陣',1.8]],q:['契靈集中',.48]},
    beast:{name:'森靈德魯伊',icon:'獸',accent:'#82d477',hp:175,speed:1.03,
      desc:'狼／鷹／熊具有不同 Sprite、Command 表、Hitbox 與位移方式。',
      skills:[['獸形連襲',.46],['獸形位移',.72],['森王變身',1.95]],q:['切換獸形',.28]},
    artificer:{name:'符機工匠',icon:'機',accent:'#e7a25c',hp:160,speed:.97,
      desc:'Z 是扳手近戰，X 是慢速機械彈；炮台、鉤索與躍台形成空間連段。',
      skills:[['鉤索取消',.48],['磁浮躍台',.82],['磁軌穿行',1.7]],q:['部署炮台',.72]},
    gunner:{name:'磁軌槍手',icon:'銃',accent:'#6de1ce',hp:150,speed:1.01,
      desc:'每次射擊都有可控後座力；慢速重彈可追著它一起換位進攻。',
      skills:[['反衝點射',.40],['火箭升空',.68],['重磁軌彈',1.55]],q:['反向後座',.42]},
    warden:{name:'界壁守衛',icon:'盾',accent:'#ebcc6b',hp:210,speed:.92,
      desc:'Z 槍、X 盾；格擋後的反擊可無 KD 接回 Command。',
      skills:[['盾衝取消',.52],['長槍牽引',.86],['堡壘落點',1.8]],q:['精準格擋',.55]},
    chrono:{name:'時序術士',icon:'時',accent:'#9ea8f0',hp:145,speed:.99,
      desc:'Command 留下延遲回響；可以把自己與敵人拉回數秒前的位置。',
      skills:[['回響步',.46],['凝滯挑空',.92],['三秒回溯',1.85]],q:['時間錨',.52]},
    harrier:{name:'鎖鏈游擊者',icon:'鏈',accent:'#ee8069',hp:165,speed:1.08,
      desc:'Z 近身踢、X 鎖鏈抓取；能拉怪、拉自己並在空中反覆換側。',
      skills:[['鎖鏈鉤',.38],['擺盪踢',.70],['鎖域旋舞',1.6]],q:['反向拉扯',.44]}
  },

  ENEMIES:{
    dummy:{name:'訓練傀儡',ai:'dummy',hp:9999,speed:0,damage:0,color:'#7edfe2',tip:'不會反擊；用來練 Z/X 分支、挑空、取消與元素換位。'},
    slime:{name:'暴怒裂膠',ai:'slime',hp:54,speed:78,damage:9,color:'#72bd72',tip:'受傷會加速；冰、藤或浮空可重置怒氣。'},
    charger:{name:'棘角衝獸',ai:'charger',hp:115,speed:65,damage:18,color:'#bd7956',tip:'紅線蓄力後直線衝撞；跳過、換位到背後或用岩打停。'},
    archer:{name:'廢城弓手',ai:'archer',hp:70,speed:52,damage:10,color:'#c89b58',tip:'慢速箭可用 A 流光反衝，把敵彈變成移動工具。'},
    scatterer:{name:'環彈咒匠',ai:'scatterer',hp:86,speed:45,damage:9,color:'#b77dd1',tip:'扇形／環形彈幕；用短 Dash 穿過縫隙。'},
    bombardier:{name:'屋頂投擲兵',ai:'bombardier',hp:92,speed:42,damage:17,color:'#d06e50',tip:'地面圓圈出現後才落彈；不要貪最後一刀。'},
    spitter:{name:'腐植噴吐者',ai:'spitter',hp:105,speed:38,damage:8,color:'#83a95f',tip:'留下毒池；火可燒除，冰台可跨越。'},
    ambusher:{name:'影縫獵手',ai:'ambusher',hp:78,speed:92,damage:14,color:'#60567e',tip:'紫色殘影後出現在背後；光能提早顯形。'},
    spider:{name:'纜網蛛',ai:'spider',hp:88,speed:58,damage:7,color:'#7c6657',tip:'蛛網定身；左右連按、Dash 或火焰可掙脫。'},
    reflector:{name:'折光甲殼',ai:'reflector',hp:140,speed:35,damage:13,color:'#5a8f94',tip:'正面反射元素；換位繞背、影穿身或岩破甲。'},
    healer:{name:'再生培養體',ai:'healer',hp:72,speed:35,damage:5,color:'#71c5a0',tip:'持續治療同伴；先處理或用影詛咒壓低治療。'},
    sniper:{name:'高塔狙擊者',ai:'sniper',hp:82,speed:34,damage:19,color:'#d2c06a',tip:'長瞄準線鎖定後發射高速貫穿彈；立刻離開射線或換位。'},
    burrower:{name:'地脈潛獸',ai:'burrower',hp:102,speed:62,damage:16,color:'#8e6f58',tip:'潛入地底追蹤玩家，在腳下裂紋完成前跳離。'},
    shocker:{name:'脈衝電螫',ai:'shocker',hp:78,speed:54,damage:13,color:'#e3d35e',tip:'近距離蓄電後釋放暈眩環；看見黃圈就拉開距離。'},
    parasite:{name:'能量寄生體',ai:'parasite',hp:58,speed:118,damage:6,color:'#d96a91',tip:'撲到玩家身上吸血；連續 Dash 三次或用範圍技能甩開。'},
    mimic:{name:'指令擬態箱',ai:'mimic',hp:128,speed:28,damage:14,color:'#c4915b',tip:'只在輸入指定 Command 時解除護甲；依頭上提示使用 ZZX、XZX、↑X 等。'},
    breeder:{name:'菌傀育生者',ai:'breeder',hp:132,speed:30,damage:7,color:'#91aa66',tip:'會召喚裂膠支援；中斷施法並優先擊殺本體。'},
    artillery:{name:'屋頂迫擊砲',ai:'artillery',hp:155,speed:0,damage:20,color:'#758790',tip:'跨房間投射三連轟炸；利用室內天花板或連續位移離開預警圈。'},
    sentinel:{name:'十相哨兵・赫利俄斯',ai:'sentinel',hp:1250,speed:70,damage:23,color:'#d45174',tip:'最終 Boss；三階段招式與 BREAK 條。破勢後是主要輸出窗口。'}
  },

  COLLECTIBLES:{
    life:{name:'生命花核',color:'#ff7892',effect:'最大生命 +12 並完全治療。'},
    mobility:{name:'機動核心',color:'#6ee5ff',effect:'解鎖第二空中 Dash、延長牆抓與抓鉤範圍。'},
    element:{name:'元素透鏡',color:'#df86ff',effect:'擴大元素場域與標記時間。'},
    crest:{name:'職業徽記',color:'#ffd86b',effect:'所有技能冷卻永久縮短 3%。'},
    memory:{name:'記憶種子',color:'#7fe4ac',effect:'顯示隱藏房、故事與特殊路線。'},
    shelter:{name:'避難所核心',color:'#f1b879',effect:'啟用該避難所的家具、快速移動與重生點。'}
  },
  FURNITURE:{
    fridge:{name:'冰箱',effect:'回復生命；首次開啟取得食材。'},bed:{name:'床鋪',effect:'完全治療並設定重生點。'},workbench:{name:'工作台',effect:'重置短冷卻並暫時提高 BREAK。'},
    radio:{name:'收音機',effect:'標記最近解謎、NPC 與隱藏房。'},locker:{name:'儲物櫃',effect:'取得零件或區域收藏情報。'},map:{name:'地圖桌',effect:'打開有機世界圖與避難所快速移動。'},
    terminal:{name:'控制終端',effect:'啟動升降機、光源或捷徑門。'},stove:{name:'爐灶',effect:'提供短暫攻擊強化。'},purifier:{name:'淨水器',effect:'解除燃燒、毒、蛛網並提供護盾。'},
    shelf:{name:'書架／錄影帶',effect:'解鎖一組職業接招教學。'},sofa:{name:'沙發',effect:'休息並重置全部技能冷卻。'},lamp:{name:'避難燈',effect:'照亮暗室與隱藏平台。'}
  }
};
