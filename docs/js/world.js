window.ES9_WORLD = {
  "version": "10.0.0-mastery-east-expansion",
  "width": 25600,
  "height": 15000,
  "start": {
    "x": 1250,
    "y": 14080
  },
  "regions": [
    {
      "id": "tide",
      "name": "潮痕避難港",
      "color": "#5dbbc7",
      "palette": "tide",
      "y0": 12400,
      "y1": 15000,
      "objective": "修復海崖避難所，沿舊排水道尋找上升路。"
    },
    {
      "id": "roots",
      "name": "根脈隧道",
      "color": "#79ae71",
      "palette": "roots",
      "y0": 10400,
      "y1": 14200,
      "objective": "在樹根與水泵間開啟兩條回到雨幕市集的環路。"
    },
    {
      "id": "market",
      "name": "雨幕舊城",
      "color": "#d7a56a",
      "palette": "market",
      "y0": 8200,
      "y1": 11600,
      "objective": "穿越住區、醫院與雨棚市場，修復三個避難節點。"
    },
    {
      "id": "reactor",
      "name": "風井工業帶",
      "color": "#e27c62",
      "palette": "reactor",
      "y0": 7000,
      "y1": 10800,
      "objective": "利用風井、吊車與慢速投射物穿越反應爐。"
    },
    {
      "id": "archive",
      "name": "沉影檔案城",
      "color": "#8e80b9",
      "palette": "archive",
      "y0": 5000,
      "y1": 8800,
      "objective": "在影門、光橋與斷裂公寓間建立捷徑。"
    },
    {
      "id": "canopy",
      "name": "月冠樹海",
      "color": "#62b887",
      "palette": "canopy",
      "y0": 2200,
      "y1": 6500,
      "objective": "沿樹洞、吊村與飛船殘骸向樹冠攀升。"
    },
    {
      "id": "lighthouse",
      "name": "天穹燈塔",
      "color": "#73c8df",
      "palette": "lighthouse",
      "y0": 0,
      "y1": 3600,
      "objective": "啟動燈塔、穿越月橋並抵達十相核心。"
    },
    {
      "id": "secret",
      "name": "失落回聲",
      "color": "#d776c9",
      "palette": "secret",
      "y0": 0,
      "y1": 15000,
      "objective": "尋找被主路忽略的記憶房與功能收集品。"
    },
    {
      "id": "foundry",
      "name": "東境・回響鑄城",
      "color": "#83b6bb",
      "palette": "reactor",
      "y0": 2000,
      "y1": 15000,
      "objective": "從沉水渡口上行，修復四座共鳴爐，連回風井與樹冠。"
    },
    {
      "id": "school",
      "name": "十職研習院",
      "color": "#d6b884",
      "palette": "market",
      "y0": 1000,
      "y1": 15000,
      "objective": "按 T 進入職業課程；每一步以實際命中與位移完成判定。"
    }
  ],
  "rooms": [
    {
      "id": "r00",
      "name": "海崖初始避難所",
      "region": "tide",
      "kind": "shelter",
      "x": 900,
      "y": 13650,
      "w": 900,
      "h": 620,
      "art": 0,
      "shelter": true,
      "note": "起點與操作教學"
    },
    {
      "id": "r01",
      "name": "浸水車庫",
      "region": "tide",
      "kind": "facility",
      "x": 2150,
      "y": 13320,
      "w": 780,
      "h": 560,
      "art": 4,
      "shelter": false,
      "note": "可推車與排水閥"
    },
    {
      "id": "r02",
      "name": "鹽蝕洞口",
      "region": "tide",
      "kind": "cave",
      "x": 3200,
      "y": 14030,
      "w": 1120,
      "h": 500,
      "art": 0,
      "shelter": false,
      "note": "低處支線與水坑"
    },
    {
      "id": "r03",
      "name": "舊蓄水井",
      "region": "tide",
      "kind": "shaft",
      "x": 4050,
      "y": 12520,
      "w": 690,
      "h": 1120,
      "art": 0,
      "shelter": false,
      "note": "第一次真正垂直攀升"
    },
    {
      "id": "r04",
      "name": "鹽燈廚房",
      "region": "tide",
      "kind": "shelter",
      "x": 5000,
      "y": 13230,
      "w": 930,
      "h": 560,
      "art": 1,
      "shelter": true,
      "note": "冰箱、爐灶與床"
    },
    {
      "id": "r05",
      "name": "根門分岔",
      "region": "roots",
      "kind": "hub",
      "x": 6100,
      "y": 12300,
      "w": 980,
      "h": 760,
      "art": 2,
      "shelter": false,
      "note": "主線第一次三岔路"
    },
    {
      "id": "r06",
      "name": "淹沒閱覽室",
      "region": "secret",
      "kind": "secret",
      "x": 7350,
      "y": 13230,
      "w": 970,
      "h": 610,
      "art": 7,
      "shelter": false,
      "note": "記憶種子支線"
    },
    {
      "id": "r07",
      "name": "巨泵大廳",
      "region": "roots",
      "kind": "hub",
      "x": 7800,
      "y": 11600,
      "w": 1260,
      "h": 820,
      "art": 3,
      "shelter": false,
      "note": "大型水輪與多層平台"
    },
    {
      "id": "r08",
      "name": "地鐵菌巢",
      "region": "roots",
      "kind": "cave",
      "x": 9650,
      "y": 12440,
      "w": 1040,
      "h": 570,
      "art": 2,
      "shelter": false,
      "note": "低矮洞穴與伏擊"
    },
    {
      "id": "r09",
      "name": "高壓水輪",
      "region": "roots",
      "kind": "facility",
      "x": 10100,
      "y": 11150,
      "w": 820,
      "h": 720,
      "art": 5,
      "shelter": false,
      "note": "水→雷機關"
    },
    {
      "id": "r10",
      "name": "最深集水坑",
      "region": "secret",
      "kind": "secret",
      "x": 8850,
      "y": 13960,
      "w": 980,
      "h": 430,
      "art": 8,
      "shelter": false,
      "note": "引力與冰的平台支線"
    },
    {
      "id": "r11",
      "name": "雨幕市集",
      "region": "market",
      "kind": "shelter",
      "x": 6650,
      "y": 10170,
      "w": 1390,
      "h": 720,
      "art": 2,
      "shelter": true,
      "note": "中期樞紐、商店與教官"
    },
    {
      "id": "r12",
      "name": "東側貨梯",
      "region": "reactor",
      "kind": "shaft",
      "x": 8750,
      "y": 9720,
      "w": 720,
      "h": 1040,
      "art": 1,
      "shelter": false,
      "note": "升降機與牆跳"
    },
    {
      "id": "r13",
      "name": "菌植溫室",
      "region": "roots",
      "kind": "outdoor",
      "x": 4900,
      "y": 10040,
      "w": 1140,
      "h": 680,
      "art": 6,
      "shelter": false,
      "note": "自然元素捷徑"
    },
    {
      "id": "r14",
      "name": "孤兒避難屋",
      "region": "secret",
      "kind": "shelter",
      "x": 3300,
      "y": 10600,
      "w": 920,
      "h": 620,
      "art": 5,
      "shelter": true,
      "note": "隱藏 NPC 與護符"
    },
    {
      "id": "r15",
      "name": "樹根裂谷",
      "region": "roots",
      "kind": "shaft",
      "x": 2050,
      "y": 9550,
      "w": 760,
      "h": 1200,
      "art": 2,
      "shelter": false,
      "note": "左右交錯牆跳"
    },
    {
      "id": "r16",
      "name": "夜班診療所",
      "region": "market",
      "kind": "shelter",
      "x": 850,
      "y": 8650,
      "w": 960,
      "h": 680,
      "art": 4,
      "shelter": true,
      "note": "治療、藥櫃與床"
    },
    {
      "id": "r17",
      "name": "坍塌地下道",
      "region": "market",
      "kind": "cave",
      "x": 3050,
      "y": 8700,
      "w": 1260,
      "h": 580,
      "art": 3,
      "shelter": false,
      "note": "引力搬運核心"
    },
    {
      "id": "r18",
      "name": "舊反應爐",
      "region": "reactor",
      "kind": "facility",
      "x": 9700,
      "y": 8840,
      "w": 1240,
      "h": 760,
      "art": 6,
      "shelter": false,
      "note": "熱震與 BREAK 戰鬥"
    },
    {
      "id": "r19",
      "name": "吊車貨場",
      "region": "reactor",
      "kind": "outdoor",
      "x": 11950,
      "y": 9700,
      "w": 1160,
      "h": 660,
      "art": 7,
      "shelter": false,
      "note": "吊鉤與移動平台"
    },
    {
      "id": "r20",
      "name": "廢熱煙囪",
      "region": "reactor",
      "kind": "shaft",
      "x": 13500,
      "y": 8260,
      "w": 680,
      "h": 1220,
      "art": 0,
      "shelter": false,
      "note": "風流高速垂直段"
    },
    {
      "id": "r21",
      "name": "鐘錶工坊",
      "region": "secret",
      "kind": "shelter",
      "x": 11550,
      "y": 7850,
      "w": 940,
      "h": 600,
      "art": 8,
      "shelter": true,
      "note": "時序術士功能房"
    },
    {
      "id": "r22",
      "name": "檔案分岔廳",
      "region": "archive",
      "kind": "hub",
      "x": 7200,
      "y": 7950,
      "w": 1320,
      "h": 760,
      "art": 1,
      "shelter": false,
      "note": "西住區、東工業、上樹海三路"
    },
    {
      "id": "r23",
      "name": "暗影儲藏庫",
      "region": "archive",
      "kind": "secret",
      "x": 5450,
      "y": 7200,
      "w": 940,
      "h": 630,
      "art": 9,
      "shelter": false,
      "note": "影門與稀有透鏡"
    },
    {
      "id": "r24",
      "name": "末日博物館",
      "region": "archive",
      "kind": "facility",
      "x": 3300,
      "y": 6650,
      "w": 1080,
      "h": 650,
      "art": 10,
      "shelter": false,
      "note": "展櫃與擬態箱"
    },
    {
      "id": "r25",
      "name": "斷層中庭",
      "region": "archive",
      "kind": "hub",
      "x": 1450,
      "y": 6600,
      "w": 1240,
      "h": 1050,
      "art": 11,
      "shelter": false,
      "note": "大型中空垂直房"
    },
    {
      "id": "r26",
      "name": "舊公寓群",
      "region": "archive",
      "kind": "shelter",
      "x": 1200,
      "y": 5480,
      "w": 1180,
      "h": 700,
      "art": 3,
      "shelter": true,
      "note": "多戶生活房與居民 NPC"
    },
    {
      "id": "r27",
      "name": "屋頂農園",
      "region": "market",
      "kind": "shelter",
      "x": 3000,
      "y": 5200,
      "w": 1180,
      "h": 560,
      "art": 6,
      "shelter": true,
      "note": "作物、料理、自然捷徑"
    },
    {
      "id": "r28",
      "name": "纜車轉運站",
      "region": "archive",
      "kind": "facility",
      "x": 4900,
      "y": 5750,
      "w": 980,
      "h": 700,
      "art": 5,
      "shelter": false,
      "note": "可開啟跨區捷徑"
    },
    {
      "id": "r29",
      "name": "月井禮拜堂",
      "region": "archive",
      "kind": "hub",
      "x": 6900,
      "y": 6250,
      "w": 1080,
      "h": 780,
      "art": 7,
      "shelter": false,
      "note": "光橋與垂直水柱"
    },
    {
      "id": "r30",
      "name": "風之大教堂",
      "region": "reactor",
      "kind": "hub",
      "x": 9000,
      "y": 6400,
      "w": 980,
      "h": 980,
      "art": 9,
      "shelter": false,
      "note": "風井與彈幕戰"
    },
    {
      "id": "r31",
      "name": "斷裂空軌",
      "region": "reactor",
      "kind": "outdoor",
      "x": 10850,
      "y": 6000,
      "w": 1390,
      "h": 570,
      "art": 4,
      "shelter": false,
      "note": "慢速彈與空中 Dash 路線"
    },
    {
      "id": "r32",
      "name": "暴風維修艙",
      "region": "secret",
      "kind": "shelter",
      "x": 12850,
      "y": 6350,
      "w": 920,
      "h": 620,
      "art": 0,
      "shelter": true,
      "note": "機巧師與槍手強化"
    },
    {
      "id": "r33",
      "name": "樹冠檢疫門",
      "region": "canopy",
      "kind": "facility",
      "x": 10000,
      "y": 4850,
      "w": 1170,
      "h": 670,
      "art": 2,
      "shelter": false,
      "note": "影／光雙解法"
    },
    {
      "id": "r34",
      "name": "古樹中空",
      "region": "canopy",
      "kind": "shaft",
      "x": 7750,
      "y": 4500,
      "w": 1120,
      "h": 1040,
      "art": 3,
      "shelter": false,
      "note": "多層樹洞與抓鉤環"
    },
    {
      "id": "r35",
      "name": "懸掛聚落",
      "region": "canopy",
      "kind": "shelter",
      "x": 5650,
      "y": 4100,
      "w": 1210,
      "h": 760,
      "art": 1,
      "shelter": true,
      "note": "多間剖面避難屋"
    },
    {
      "id": "r36",
      "name": "藤蔓實驗室",
      "region": "canopy",
      "kind": "facility",
      "x": 3600,
      "y": 4100,
      "w": 960,
      "h": 690,
      "art": 8,
      "shelter": false,
      "note": "自然元素大型解謎"
    },
    {
      "id": "r37",
      "name": "崖邊觀測室",
      "region": "secret",
      "kind": "shelter",
      "x": 1850,
      "y": 3700,
      "w": 1030,
      "h": 650,
      "art": 10,
      "shelter": true,
      "note": "遠端地圖與記憶支線"
    },
    {
      "id": "r38",
      "name": "樹冠脊柱",
      "region": "canopy",
      "kind": "shaft",
      "x": 7200,
      "y": 2780,
      "w": 820,
      "h": 1160,
      "art": 0,
      "shelter": false,
      "note": "長垂直追逐段"
    },
    {
      "id": "r39",
      "name": "沉沒飛船",
      "region": "canopy",
      "kind": "facility",
      "x": 9200,
      "y": 3200,
      "w": 1300,
      "h": 700,
      "art": 11,
      "shelter": false,
      "note": "傾斜艙室與引力球"
    },
    {
      "id": "r40",
      "name": "風車鳥巢",
      "region": "secret",
      "kind": "shelter",
      "x": 11750,
      "y": 3500,
      "w": 940,
      "h": 620,
      "art": 5,
      "shelter": true,
      "note": "德魯伊與召喚師支線"
    },
    {
      "id": "r41",
      "name": "灰燼攀道",
      "region": "canopy",
      "kind": "shaft",
      "x": 13400,
      "y": 4050,
      "w": 720,
      "h": 1120,
      "art": 4,
      "shelter": false,
      "note": "高難度牆跳與受身"
    },
    {
      "id": "r42",
      "name": "上層樹冠",
      "region": "canopy",
      "kind": "outdoor",
      "x": 11950,
      "y": 2050,
      "w": 1080,
      "h": 760,
      "art": 6,
      "shelter": false,
      "note": "月光露天路線"
    },
    {
      "id": "r43",
      "name": "月橋遺址",
      "region": "lighthouse",
      "kind": "outdoor",
      "x": 9900,
      "y": 1900,
      "w": 1160,
      "h": 560,
      "art": 7,
      "shelter": false,
      "note": "光橋與多向牽引"
    },
    {
      "id": "r44",
      "name": "記憶樹庭",
      "region": "lighthouse",
      "kind": "hub",
      "x": 7350,
      "y": 1700,
      "w": 1110,
      "h": 720,
      "art": 2,
      "shelter": false,
      "note": "全職業接招教學樞紐"
    },
    {
      "id": "r45",
      "name": "廢校避難所",
      "region": "secret",
      "kind": "shelter",
      "x": 5200,
      "y": 2100,
      "w": 1050,
      "h": 680,
      "art": 9,
      "shelter": true,
      "note": "完整教學、家具與收藏室"
    },
    {
      "id": "r46",
      "name": "燈塔基座",
      "region": "lighthouse",
      "kind": "facility",
      "x": 12400,
      "y": 1050,
      "w": 1120,
      "h": 700,
      "art": 10,
      "shelter": false,
      "note": "最終門與元素序列"
    },
    {
      "id": "r47",
      "name": "燈塔內井",
      "region": "lighthouse",
      "kind": "shaft",
      "x": 13700,
      "y": 250,
      "w": 720,
      "h": 980,
      "art": 1,
      "shelter": false,
      "note": "最後垂直攀升"
    },
    {
      "id": "r48",
      "name": "十相冠頂",
      "region": "lighthouse",
      "kind": "boss",
      "x": 11900,
      "y": 100,
      "w": 1770,
      "h": 700,
      "art": 0,
      "shelter": false,
      "note": "最終 Boss 競技場"
    },
    {
      "id": "r49",
      "name": "失落回聲核心",
      "region": "secret",
      "kind": "secret",
      "x": 9600,
      "y": 500,
      "w": 980,
      "h": 520,
      "art": 11,
      "shelter": false,
      "note": "全收集隱藏結局房"
    },
    {
      "id": "r50",
      "name": "西側雨水塔",
      "region": "secret",
      "kind": "shaft",
      "x": 480,
      "y": 7400,
      "w": 620,
      "h": 880,
      "art": 6,
      "shelter": false,
      "note": "醫院旁隱藏攀登"
    },
    {
      "id": "r51",
      "name": "東側纜索屋",
      "region": "secret",
      "kind": "shelter",
      "x": 14300,
      "y": 5750,
      "w": 870,
      "h": 580,
      "art": 4,
      "shelter": true,
      "note": "高空快速移動節點"
    },
    {
      "id": "e00",
      "name": "東境渡口",
      "x": 16000,
      "y": 12400,
      "w": 1250,
      "h": 650,
      "kind": "shelter",
      "region": "foundry",
      "art": 0,
      "shelter": true,
      "note": "渡口床鋪、食物與教場入口",
      "expansion": true,
      "palette": "tide"
    },
    {
      "id": "e01",
      "name": "鏽潮運河",
      "x": 17700,
      "y": 12700,
      "w": 1100,
      "h": 600,
      "kind": "cave",
      "region": "foundry",
      "art": 3,
      "shelter": false,
      "note": "水→雷：沿濕潤導線啟動共鳴爐",
      "expansion": true,
      "palette": "tide"
    },
    {
      "id": "e02",
      "name": "垂蔓貨井",
      "x": 17600,
      "y": 10800,
      "w": 680,
      "h": 1500,
      "kind": "shaft",
      "region": "foundry",
      "art": 6,
      "shelter": false,
      "note": "把換位彈向上投，或乘鷹翔與鉤環上升",
      "expansion": true,
      "palette": "roots"
    },
    {
      "id": "e03",
      "name": "熄火鍛造室",
      "x": 15900,
      "y": 10300,
      "w": 1180,
      "h": 740,
      "kind": "facility",
      "region": "foundry",
      "art": 9,
      "shelter": false,
      "note": "冰→火：擊裂外殼後回到渡口捷徑",
      "expansion": true,
      "palette": "reactor"
    },
    {
      "id": "e04",
      "name": "火爐中庭",
      "x": 18700,
      "y": 10100,
      "w": 1450,
      "h": 1000,
      "kind": "hub",
      "region": "foundry",
      "art": 0,
      "shelter": false,
      "note": "三路交會；護甲與破勢教學",
      "expansion": true,
      "palette": "reactor"
    },
    {
      "id": "e05",
      "name": "霧燈診所",
      "x": 20600,
      "y": 11000,
      "w": 1050,
      "h": 700,
      "kind": "shelter",
      "region": "foundry",
      "art": 3,
      "shelter": true,
      "note": "NPC 提供治療、專精點提示",
      "expansion": true,
      "palette": "market"
    },
    {
      "id": "e06",
      "name": "銅鴞花園",
      "x": 20700,
      "y": 9150,
      "w": 1250,
      "h": 1050,
      "kind": "outdoor",
      "region": "foundry",
      "art": 6,
      "shelter": false,
      "note": "藤→風：喚醒屋頂轉軸",
      "expansion": true,
      "palette": "canopy"
    },
    {
      "id": "e07",
      "name": "倒懸書庫",
      "x": 16100,
      "y": 8000,
      "w": 1450,
      "h": 850,
      "kind": "facility",
      "region": "foundry",
      "art": 9,
      "shelter": false,
      "note": "光→影：揭露穿過書庫的隱藏門",
      "expansion": true,
      "palette": "archive"
    },
    {
      "id": "e08",
      "name": "風羽長井",
      "x": 18000,
      "y": 7400,
      "w": 720,
      "h": 1900,
      "kind": "shaft",
      "region": "foundry",
      "art": 0,
      "shelter": false,
      "note": "飛行與移動技能的垂直支線",
      "expansion": true,
      "palette": "canopy"
    },
    {
      "id": "e09",
      "name": "斷鐘避難屋",
      "x": 19700,
      "y": 7250,
      "w": 1120,
      "h": 750,
      "kind": "shelter",
      "region": "foundry",
      "art": 3,
      "shelter": true,
      "note": "與工匠交換專精零件",
      "expansion": true,
      "palette": "market"
    },
    {
      "id": "e10",
      "name": "磁雨列車",
      "x": 21600,
      "y": 7600,
      "w": 1430,
      "h": 700,
      "kind": "facility",
      "region": "foundry",
      "art": 6,
      "shelter": false,
      "note": "精英砲陣：讀預警，不要站在落點",
      "expansion": true,
      "palette": "reactor"
    },
    {
      "id": "e11",
      "name": "凝晶暗窟",
      "x": 17000,
      "y": 5800,
      "w": 1320,
      "h": 950,
      "kind": "cave",
      "region": "foundry",
      "art": 9,
      "shelter": false,
      "note": "引力搬運／分支強化收藏",
      "expansion": true,
      "palette": "secret"
    },
    {
      "id": "e12",
      "name": "雙環試煉庭",
      "x": 19000,
      "y": 5050,
      "w": 1540,
      "h": 1100,
      "kind": "hub",
      "region": "foundry",
      "art": 0,
      "shelter": false,
      "note": "環路與雙端爆發：新區域守衛",
      "expansion": true,
      "palette": "archive"
    },
    {
      "id": "e13",
      "name": "晴穹苗圃",
      "x": 21000,
      "y": 4450,
      "w": 1220,
      "h": 900,
      "kind": "outdoor",
      "region": "foundry",
      "art": 3,
      "shelter": false,
      "note": "高處收藏；返回診所的快速支路",
      "expansion": true,
      "palette": "canopy"
    },
    {
      "id": "e14",
      "name": "觀星寄宿所",
      "x": 18000,
      "y": 3300,
      "w": 1200,
      "h": 820,
      "kind": "shelter",
      "region": "foundry",
      "art": 6,
      "shelter": true,
      "note": "最後補給與十職研習院回程",
      "expansion": true,
      "palette": "lighthouse"
    },
    {
      "id": "e15",
      "name": "共鳴鑄心",
      "x": 20800,
      "y": 2350,
      "w": 1660,
      "h": 900,
      "kind": "boss",
      "region": "foundry",
      "art": 9,
      "shelter": false,
      "note": "東境 Boss：熔鑄監察者；不取代 r48 最終哨兵",
      "expansion": true,
      "palette": "lighthouse"
    },
    {
      "id": "t_rift",
      "name": "裂隙劍士研習場",
      "x": 23400,
      "y": 13750,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 0,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "rift",
      "expansion": true
    },
    {
      "id": "t_summoner",
      "name": "靈契召喚師研習場",
      "x": 23400,
      "y": 12450,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 1,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "summoner",
      "expansion": true
    },
    {
      "id": "t_beast",
      "name": "森靈德魯伊研習場",
      "x": 23400,
      "y": 11150,
      "w": 1750,
      "h": 1150,
      "region": "school",
      "kind": "hub",
      "art": 2,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "beast",
      "expansion": true
    },
    {
      "id": "t_artificer",
      "name": "符機工匠研習場",
      "x": 23400,
      "y": 9850,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 3,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "artificer",
      "expansion": true
    },
    {
      "id": "t_gunner",
      "name": "磁軌槍手研習場",
      "x": 23400,
      "y": 8550,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 4,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "gunner",
      "expansion": true
    },
    {
      "id": "t_warden",
      "name": "界壁守衛研習場",
      "x": 23400,
      "y": 7250,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 5,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "warden",
      "expansion": true
    },
    {
      "id": "t_chrono",
      "name": "時序術士研習場",
      "x": 23400,
      "y": 5950,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 6,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "chrono",
      "expansion": true
    },
    {
      "id": "t_harrier",
      "name": "鎖鏈游擊者研習場",
      "x": 23400,
      "y": 4650,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 7,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "harrier",
      "expansion": true
    },
    {
      "id": "t_alchemist",
      "name": "鍊金調律師研習場",
      "x": 23400,
      "y": 3350,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 8,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "alchemist",
      "expansion": true
    },
    {
      "id": "t_monk",
      "name": "雷影武僧研習場",
      "x": 23400,
      "y": 2050,
      "w": 1750,
      "h": 850,
      "region": "school",
      "kind": "hub",
      "art": 9,
      "shelter": false,
      "note": "獨立練習空間｜T 選課／Backspace 離場",
      "training": "monk",
      "expansion": true
    }
  ],
  "edges": [
    {
      "a": "r00",
      "b": "r01",
      "kind": "corridor",
      "gate": null,
      "label": "初始街道"
    },
    {
      "a": "r01",
      "b": "r02",
      "kind": "drop",
      "gate": null,
      "label": "車庫下層"
    },
    {
      "a": "r01",
      "b": "r03",
      "kind": "climb",
      "gate": null,
      "label": "井壁"
    },
    {
      "a": "r02",
      "b": "r03",
      "kind": "climb",
      "gate": "ice",
      "label": "冰台捷徑"
    },
    {
      "a": "r02",
      "b": "r10",
      "kind": "tunnel",
      "gate": "gravity",
      "label": "集水坑支線"
    },
    {
      "a": "r03",
      "b": "r04",
      "kind": "corridor",
      "gate": null,
      "label": "廚房避難屋"
    },
    {
      "a": "r03",
      "b": "r05",
      "kind": "climb",
      "gate": "fire",
      "label": "三燈根門"
    },
    {
      "a": "r04",
      "b": "r05",
      "kind": "corridor",
      "gate": null,
      "label": "生活區通道"
    },
    {
      "a": "r05",
      "b": "r06",
      "kind": "drop",
      "gate": "shadow",
      "label": "閱覽室密道"
    },
    {
      "a": "r05",
      "b": "r07",
      "kind": "climb",
      "gate": null,
      "label": "根脈主線"
    },
    {
      "a": "r06",
      "b": "r07",
      "kind": "grapple",
      "gate": "light",
      "label": "閱覽室上窗"
    },
    {
      "a": "r07",
      "b": "r08",
      "kind": "corridor",
      "gate": null,
      "label": "泵站東管"
    },
    {
      "a": "r08",
      "b": "r09",
      "kind": "climb",
      "gate": null,
      "label": "菌巢出口"
    },
    {
      "a": "r09",
      "b": "r12",
      "kind": "climb",
      "gate": "circuit",
      "label": "水雷電梯"
    },
    {
      "a": "r08",
      "b": "r10",
      "kind": "drop",
      "gate": null,
      "label": "集水坑"
    },
    {
      "a": "r07",
      "b": "r11",
      "kind": "climb",
      "gate": null,
      "label": "市集主升道"
    },
    {
      "a": "r07",
      "b": "r13",
      "kind": "corridor",
      "gate": "nature",
      "label": "溫室根道"
    },
    {
      "a": "r13",
      "b": "r11",
      "kind": "corridor",
      "gate": null,
      "label": "西市集"
    },
    {
      "a": "r13",
      "b": "r14",
      "kind": "corridor",
      "gate": "light",
      "label": "孤兒屋密門"
    },
    {
      "a": "r14",
      "b": "r15",
      "kind": "drop",
      "gate": null,
      "label": "避難屋下梯"
    },
    {
      "a": "r15",
      "b": "r16",
      "kind": "climb",
      "gate": null,
      "label": "醫院裂谷"
    },
    {
      "a": "r15",
      "b": "r17",
      "kind": "corridor",
      "gate": null,
      "label": "地下道"
    },
    {
      "a": "r16",
      "b": "r17",
      "kind": "corridor",
      "gate": null,
      "label": "醫院後巷"
    },
    {
      "a": "r17",
      "b": "r13",
      "kind": "climb",
      "gate": "gravity",
      "label": "核心升降"
    },
    {
      "a": "r11",
      "b": "r22",
      "kind": "climb",
      "gate": null,
      "label": "中央上行"
    },
    {
      "a": "r11",
      "b": "r12",
      "kind": "corridor",
      "gate": null,
      "label": "東貨梯"
    },
    {
      "a": "r12",
      "b": "r18",
      "kind": "corridor",
      "gate": null,
      "label": "反應爐入口"
    },
    {
      "a": "r18",
      "b": "r19",
      "kind": "corridor",
      "gate": null,
      "label": "貨場"
    },
    {
      "a": "r19",
      "b": "r20",
      "kind": "climb",
      "gate": null,
      "label": "煙囪外梯"
    },
    {
      "a": "r20",
      "b": "r21",
      "kind": "climb",
      "gate": "wind",
      "label": "風井支線"
    },
    {
      "a": "r21",
      "b": "r22",
      "kind": "corridor",
      "gate": null,
      "label": "鐘錶捷徑"
    },
    {
      "a": "r18",
      "b": "r22",
      "kind": "climb",
      "gate": "thermal",
      "label": "熱震捷徑"
    },
    {
      "a": "r22",
      "b": "r23",
      "kind": "corridor",
      "gate": "shadow",
      "label": "暗影庫"
    },
    {
      "a": "r23",
      "b": "r24",
      "kind": "corridor",
      "gate": null,
      "label": "博物館密道"
    },
    {
      "a": "r24",
      "b": "r25",
      "kind": "corridor",
      "gate": null,
      "label": "中庭西門"
    },
    {
      "a": "r25",
      "b": "r26",
      "kind": "climb",
      "gate": null,
      "label": "公寓中庭"
    },
    {
      "a": "r26",
      "b": "r27",
      "kind": "corridor",
      "gate": null,
      "label": "屋頂農園"
    },
    {
      "a": "r27",
      "b": "r28",
      "kind": "corridor",
      "gate": null,
      "label": "纜車站"
    },
    {
      "a": "r28",
      "b": "r22",
      "kind": "climb",
      "gate": null,
      "label": "檔案捷徑"
    },
    {
      "a": "r22",
      "b": "r29",
      "kind": "corridor",
      "gate": null,
      "label": "月井東門"
    },
    {
      "a": "r29",
      "b": "r30",
      "kind": "corridor",
      "gate": "light",
      "label": "光橋"
    },
    {
      "a": "r30",
      "b": "r31",
      "kind": "corridor",
      "gate": null,
      "label": "空軌"
    },
    {
      "a": "r31",
      "b": "r32",
      "kind": "corridor",
      "gate": "wind",
      "label": "維修艙"
    },
    {
      "a": "r32",
      "b": "r33",
      "kind": "climb",
      "gate": null,
      "label": "檢疫側路"
    },
    {
      "a": "r33",
      "b": "r34",
      "kind": "corridor",
      "gate": null,
      "label": "古樹入口"
    },
    {
      "a": "r34",
      "b": "r35",
      "kind": "corridor",
      "gate": null,
      "label": "懸村西門"
    },
    {
      "a": "r35",
      "b": "r28",
      "kind": "drop",
      "gate": null,
      "label": "纜車回環"
    },
    {
      "a": "r35",
      "b": "r36",
      "kind": "corridor",
      "gate": "nature",
      "label": "藤實驗室"
    },
    {
      "a": "r36",
      "b": "r37",
      "kind": "corridor",
      "gate": null,
      "label": "崖邊觀測路"
    },
    {
      "a": "r37",
      "b": "r25",
      "kind": "drop",
      "gate": "gravity",
      "label": "西側雨水塔"
    },
    {
      "a": "r25",
      "b": "r50",
      "kind": "climb",
      "gate": null,
      "label": "醫院雨水塔"
    },
    {
      "a": "r50",
      "b": "r37",
      "kind": "climb",
      "gate": "wind",
      "label": "塔頂捷徑"
    },
    {
      "a": "r34",
      "b": "r38",
      "kind": "climb",
      "gate": null,
      "label": "樹冠脊柱"
    },
    {
      "a": "r38",
      "b": "r39",
      "kind": "corridor",
      "gate": null,
      "label": "飛船殘骸"
    },
    {
      "a": "r39",
      "b": "r40",
      "kind": "corridor",
      "gate": "gravity",
      "label": "鳥巢支線"
    },
    {
      "a": "r40",
      "b": "r41",
      "kind": "corridor",
      "gate": null,
      "label": "灰燼攀道"
    },
    {
      "a": "r41",
      "b": "r42",
      "kind": "climb",
      "gate": null,
      "label": "上層樹冠"
    },
    {
      "a": "r39",
      "b": "r43",
      "kind": "climb",
      "gate": "light",
      "label": "月橋下引道"
    },
    {
      "a": "r42",
      "b": "r43",
      "kind": "corridor",
      "gate": null,
      "label": "月橋"
    },
    {
      "a": "r43",
      "b": "r44",
      "kind": "corridor",
      "gate": null,
      "label": "記憶樹庭"
    },
    {
      "a": "r44",
      "b": "r38",
      "kind": "drop",
      "gate": null,
      "label": "樹庭回環"
    },
    {
      "a": "r44",
      "b": "r45",
      "kind": "corridor",
      "gate": "memory",
      "label": "廢校密門"
    },
    {
      "a": "r45",
      "b": "r35",
      "kind": "drop",
      "gate": null,
      "label": "舊校滑索"
    },
    {
      "a": "r42",
      "b": "r46",
      "kind": "climb",
      "gate": "elements",
      "label": "燈塔外牆"
    },
    {
      "a": "r43",
      "b": "r46",
      "kind": "corridor",
      "gate": "elements",
      "label": "燈塔正門"
    },
    {
      "a": "r44",
      "b": "r49",
      "kind": "climb",
      "gate": "allCollect",
      "label": "回聲核心"
    },
    {
      "a": "r49",
      "b": "r46",
      "kind": "corridor",
      "gate": null,
      "label": "隱藏核心道"
    },
    {
      "a": "r46",
      "b": "r47",
      "kind": "climb",
      "gate": null,
      "label": "燈塔內井"
    },
    {
      "a": "r47",
      "b": "r48",
      "kind": "climb",
      "gate": null,
      "label": "冠頂"
    },
    {
      "a": "r32",
      "b": "r51",
      "kind": "corridor",
      "gate": null,
      "label": "東側纜索屋"
    },
    {
      "a": "r51",
      "b": "r41",
      "kind": "climb",
      "gate": "grapple",
      "label": "高空纜索捷徑"
    },
    {
      "a": "r13",
      "b": "e00",
      "kind": "corridor",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e00",
      "b": "e01",
      "kind": "tunnel",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e01",
      "b": "e02",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e02",
      "b": "e03",
      "kind": "corridor",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e02",
      "b": "e04",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e03",
      "b": "r21",
      "kind": "grapple",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e04",
      "b": "e05",
      "kind": "drop",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e05",
      "b": "e06",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e04",
      "b": "e08",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e03",
      "b": "e07",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e07",
      "b": "e08",
      "kind": "corridor",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e08",
      "b": "e09",
      "kind": "corridor",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e09",
      "b": "e10",
      "kind": "drop",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e10",
      "b": "e06",
      "kind": "drop",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e07",
      "b": "e11",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e11",
      "b": "e12",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e09",
      "b": "e12",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e12",
      "b": "e13",
      "kind": "grapple",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e12",
      "b": "e14",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e14",
      "b": "e15",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e13",
      "b": "e15",
      "kind": "climb",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e14",
      "b": "r42",
      "kind": "grapple",
      "gate": null,
      "label": "東境連通路"
    },
    {
      "a": "e01",
      "b": "t_rift",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e01",
      "b": "t_summoner",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e01",
      "b": "t_beast",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e10",
      "b": "t_artificer",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e10",
      "b": "t_gunner",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e10",
      "b": "t_warden",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e13",
      "b": "t_chrono",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e13",
      "b": "t_harrier",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e13",
      "b": "t_alchemist",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    },
    {
      "a": "e13",
      "b": "t_monk",
      "kind": "grapple",
      "gate": null,
      "label": "教場連索"
    }
  ],
  "shelters": [
    "r00",
    "r04",
    "r11",
    "r14",
    "r16",
    "r21",
    "r26",
    "r27",
    "r32",
    "r35",
    "r37",
    "r40",
    "r45",
    "r51",
    "e00",
    "e05",
    "e09",
    "e14"
  ],
  "collectibles": [
    {
      "id": "c00",
      "type": "life",
      "room": "r06",
      "x": 7780,
      "y": 13540,
      "requires": "shadow"
    },
    {
      "id": "c01",
      "type": "mobility",
      "room": "r10",
      "x": 9300,
      "y": 14140,
      "requires": "gravity"
    },
    {
      "id": "c02",
      "type": "shelter",
      "room": "r14",
      "x": 3760,
      "y": 10960,
      "requires": "light"
    },
    {
      "id": "c03",
      "type": "life",
      "room": "r16",
      "x": 1300,
      "y": 9100,
      "requires": null
    },
    {
      "id": "c04",
      "type": "crest",
      "room": "r21",
      "x": 12020,
      "y": 8270,
      "requires": "wind"
    },
    {
      "id": "c05",
      "type": "element",
      "room": "r23",
      "x": 5900,
      "y": 7590,
      "requires": "shadow"
    },
    {
      "id": "c06",
      "type": "memory",
      "room": "r27",
      "x": 3550,
      "y": 5480,
      "requires": "nature"
    },
    {
      "id": "c07",
      "type": "mobility",
      "room": "r32",
      "x": 13310,
      "y": 6690,
      "requires": "wind"
    },
    {
      "id": "c08",
      "type": "element",
      "room": "r37",
      "x": 2380,
      "y": 4050,
      "requires": "gravity"
    },
    {
      "id": "c09",
      "type": "crest",
      "room": "r40",
      "x": 12210,
      "y": 3830,
      "requires": "gravity"
    },
    {
      "id": "c10",
      "type": "memory",
      "room": "r45",
      "x": 5750,
      "y": 2470,
      "requires": "memory"
    },
    {
      "id": "c11",
      "type": "shelter",
      "room": "r49",
      "x": 10080,
      "y": 810,
      "requires": "allCollect"
    },
    {
      "id": "c12",
      "type": "life",
      "room": "r02",
      "x": 3900,
      "y": 14330,
      "requires": "ice"
    },
    {
      "id": "c13",
      "type": "crest",
      "room": "r24",
      "x": 3850,
      "y": 6990,
      "requires": null
    },
    {
      "id": "c14",
      "type": "element",
      "room": "r39",
      "x": 9800,
      "y": 3550,
      "requires": "gravity"
    },
    {
      "id": "c15",
      "type": "mobility",
      "room": "r51",
      "x": 14700,
      "y": 6070,
      "requires": "grapple"
    },
    {
      "id": "m10_shrine_0",
      "room": "e03",
      "x": 16678.8,
      "y": 10710,
      "name": "共鳴研究遺物",
      "type": "crest",
      "requires": null
    },
    {
      "id": "m10_shrine_1",
      "room": "e06",
      "x": 21525.0,
      "y": 9870,
      "name": "共鳴研究遺物",
      "type": "mobility",
      "requires": null
    },
    {
      "id": "m10_shrine_2",
      "room": "e07",
      "x": 17057.0,
      "y": 8520,
      "name": "共鳴研究遺物",
      "type": "memory",
      "requires": null
    },
    {
      "id": "m10_shrine_3",
      "room": "e10",
      "x": 22543.8,
      "y": 7970,
      "name": "共鳴研究遺物",
      "type": "element",
      "requires": null
    },
    {
      "id": "m10_shrine_4",
      "room": "e11",
      "x": 17871.2,
      "y": 6420,
      "name": "共鳴研究遺物",
      "type": "crest",
      "requires": null
    },
    {
      "id": "m10_shrine_5",
      "room": "e13",
      "x": 21805.2,
      "y": 5020,
      "name": "共鳴研究遺物",
      "type": "life",
      "requires": null
    }
  ],
  "puzzles": [
    {
      "id": "p_fire",
      "kind": "sequence",
      "room": "r05",
      "x": 6400,
      "y": 12740,
      "elements": [
        "fire",
        "fire",
        "fire"
      ],
      "hint": "依序點亮根門三盞鹽燈。火焰會留下可見燃燒區。"
    },
    {
      "id": "p_ice",
      "kind": "terrain",
      "room": "r02",
      "x": 3650,
      "y": 14340,
      "elements": [
        "ice"
      ],
      "hint": "把冰打進水槽，或用冰換位平台抵達高處洞口。"
    },
    {
      "id": "p_circuit",
      "kind": "sequence",
      "room": "r09",
      "x": 10450,
      "y": 11510,
      "elements": [
        "water",
        "lightning"
      ],
      "hint": "先讓導線濕潤，再以雷電通電。"
    },
    {
      "id": "p_nature",
      "kind": "terrain",
      "room": "r13",
      "x": 5450,
      "y": 10420,
      "elements": [
        "nature"
      ],
      "hint": "喚醒古種，讓藤蔓連到雨幕市集的上層。"
    },
    {
      "id": "p_gravity",
      "kind": "object",
      "room": "r17",
      "x": 3700,
      "y": 9050,
      "elements": [
        "gravity"
      ],
      "hint": "用引力把核心拉到上方插槽，開啟檔案捷徑。"
    },
    {
      "id": "p_thermal",
      "kind": "sequence",
      "room": "r18",
      "x": 10250,
      "y": 9250,
      "elements": [
        "ice",
        "fire"
      ],
      "hint": "先冰凍龜裂管線，再用火形成熱震。"
    },
    {
      "id": "p_shadow",
      "kind": "gate",
      "room": "r23",
      "x": 5850,
      "y": 7450,
      "elements": [
        "shadow"
      ],
      "hint": "影換位會給相位，利用相位穿過暗影門。"
    },
    {
      "id": "p_light",
      "kind": "bridge",
      "room": "r29",
      "x": 7350,
      "y": 6650,
      "elements": [
        "light"
      ],
      "hint": "以聖光顯示月井東側的隱形橋。"
    },
    {
      "id": "p_wind",
      "kind": "object",
      "room": "r31",
      "x": 11500,
      "y": 6330,
      "elements": [
        "wind"
      ],
      "hint": "用風推動空軌貨箱，讓它壓住維修艙開關。"
    },
    {
      "id": "p_tree",
      "kind": "sequence",
      "room": "r36",
      "x": 4100,
      "y": 4510,
      "elements": [
        "water",
        "nature",
        "light"
      ],
      "hint": "澆灌、催生、照明，完成藤蔓實驗室的三段生長。"
    },
    {
      "id": "p_elements",
      "kind": "sequence",
      "room": "r46",
      "x": 12900,
      "y": 1450,
      "elements": [
        "fire",
        "ice",
        "lightning",
        "wind"
      ],
      "hint": "依門環顏色輸入火、冰、雷、風，啟動燈塔正門。"
    },
    {
      "id": "m10_relay_0",
      "kind": "sequence",
      "room": "e01",
      "x": 18415.0,
      "y": 13200,
      "elements": [
        "water",
        "lightning"
      ],
      "hint": "東境共鳴爐｜依序 water → lightning，首解獎勵 3 專精點。"
    },
    {
      "id": "m10_relay_1",
      "kind": "sequence",
      "room": "e03",
      "x": 16667.0,
      "y": 10940,
      "elements": [
        "ice",
        "fire"
      ],
      "hint": "東境共鳴爐｜依序 ice → fire，首解獎勵 3 專精點。"
    },
    {
      "id": "m10_relay_2",
      "kind": "sequence",
      "room": "e06",
      "x": 21512.5,
      "y": 10100,
      "elements": [
        "nature",
        "wind"
      ],
      "hint": "東境共鳴爐｜依序 nature → wind，首解獎勵 3 專精點。"
    },
    {
      "id": "m10_relay_3",
      "kind": "sequence",
      "room": "e07",
      "x": 17042.5,
      "y": 8750,
      "elements": [
        "light",
        "shadow"
      ],
      "hint": "東境共鳴爐｜依序 light → shadow，首解獎勵 3 專精點。"
    }
  ]
};
