/* V10 技能資料。由 tools/create_mastery_data.py 重建。 */
window.ES10_SKILLS = {
  "rift": [
    {
      "id": "rift_step",
      "name": "裂步三連",
      "mode": "dash",
      "damage": 11,
      "cd": 0.65,
      "element": "wind",
      "desc": "前進三次短斬；每段命中後可用跳躍或換位取消。",
      "hits": 3,
      "move": 410,
      "range": 140,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "rift_rise"
    },
    {
      "id": "rift_rise",
      "name": "逆界挑空",
      "mode": "launch",
      "damage": 22,
      "cd": 0.85,
      "element": "light",
      "desc": "近距挑空，自己小幅上升並刷新空中 Dash。",
      "launch": -590,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "rift_cross"
    },
    {
      "id": "rift_cross",
      "name": "回身十字",
      "mode": "spin",
      "damage": 14,
      "cd": 1.05,
      "element": "shadow",
      "desc": "朝前後各斬一次，適合換到敵人群中央。",
      "hits": 2,
      "range": 180,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "rift_needle"
    },
    {
      "id": "rift_needle",
      "name": "穿雲劍氣",
      "mode": "volley",
      "damage": 13,
      "cd": 0.8,
      "element": "light",
      "desc": "射出三枚慢速、可穿一名敵人的劍氣。",
      "hits": 3,
      "speed": 240,
      "pierce": 1,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "rift_behind"
    },
    {
      "id": "rift_behind",
      "name": "背隙斬",
      "mode": "blink",
      "damage": 29,
      "cd": 1.1,
      "element": "shadow",
      "desc": "安全移到標記敵人背後，再斬擊其背部。",
      "range": 210,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "rift_orbit"
    },
    {
      "id": "rift_orbit",
      "name": "游刃護環",
      "mode": "orbit",
      "damage": 8,
      "cd": 1.3,
      "element": "wind",
      "desc": "三枚環刃繞玩家旋轉三秒，移動也持續攻擊。",
      "duration": 3,
      "range": 128,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "rift_ground"
    },
    {
      "id": "rift_ground",
      "name": "地裂波",
      "mode": "wave",
      "damage": 25,
      "cd": 1.1,
      "element": "earth",
      "desc": "沿腳下發出慢速震波；岩標記增加破甲。",
      "speed": 185,
      "pierce": 3,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "rift_anchor"
    },
    {
      "id": "rift_anchor",
      "name": "雙端共鳴",
      "mode": "anchorDetonate",
      "damage": 23,
      "cd": 1.2,
      "element": "fire",
      "desc": "玩家與目前元素錨點兩端各爆發，錨點保留。",
      "range": 165,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "rift_return"
    },
    {
      "id": "rift_return",
      "name": "返程斷空",
      "mode": "anchorRecall",
      "damage": 25,
      "cd": 1.05,
      "element": "ice",
      "desc": "先與目前錨點交換，抵達時範圍冰斬；無錨點則原地斬。",
      "range": 170,
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "rift_counter"
    },
    {
      "id": "rift_counter",
      "name": "逆鋒格擋",
      "mode": "parry",
      "damage": 32,
      "cd": 0.9,
      "element": "lightning",
      "desc": "短反擊窗；成功擋招會電暈近敵並恢復空中 Dash。",
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "rift_rain"
    },
    {
      "id": "rift_rain",
      "name": "星隙劍雨",
      "mode": "meteor",
      "damage": 10,
      "cd": 1.7,
      "element": "light",
      "desc": "鎖定施放時的目標位置，分五次落下劍光。",
      "hits": 5,
      "range": 120,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "rift_finish"
    },
    {
      "id": "rift_finish",
      "name": "十相終式",
      "mode": "spin",
      "damage": 13,
      "cd": 1.9,
      "element": "fire",
      "desc": "四次環斬後重擊；最近換位元素附加到每段命中。",
      "hits": 5,
      "range": 220,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "rift_step"
    }
  ],
  "summoner": [
    {
      "id": "summoner_fox",
      "name": "召喚・浮光狐",
      "mode": "summon",
      "damage": 10,
      "cd": 0.7,
      "element": "fire",
      "desc": "最多一隻狐靈；再次施放刷新時間、提升階級。",
      "summon": "fox",
      "role": "striker",
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "summoner_owl"
    },
    {
      "id": "summoner_owl",
      "name": "召喚・觀測鴞",
      "mode": "summon",
      "damage": 9,
      "cd": 0.85,
      "element": "wind",
      "desc": "最多一隻鴞靈；定期將敵人挑空。",
      "summon": "owl",
      "role": "launcher",
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "summoner_guard"
    },
    {
      "id": "summoner_guard",
      "name": "召喚・守護靈",
      "mode": "summon",
      "damage": 6,
      "cd": 1.05,
      "element": "light",
      "desc": "最多一隻守護靈；護盾與範圍低傷支援。",
      "summon": "guardian",
      "role": "guard",
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "summoner_star"
    },
    {
      "id": "summoner_star",
      "name": "召喚・星獸",
      "mode": "summon",
      "damage": 14,
      "cd": 1.8,
      "element": "gravity",
      "desc": "最多一隻星獸，聚敵後緩慢重擊。",
      "summon": "star",
      "role": "vortex",
      "branches": [
        {
          "id": "A",
          "name": "引力特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "summoner_order"
    },
    {
      "id": "summoner_order",
      "name": "契靈集火",
      "mode": "commandSummons",
      "damage": 13,
      "cd": 0.65,
      "element": "lightning",
      "desc": "現有契靈各追加一次攻击；沒有契靈時射出靈矢。",
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "summoner_exchange"
    },
    {
      "id": "summoner_exchange",
      "name": "主僕換位",
      "mode": "summonSwap",
      "damage": 20,
      "cd": 0.8,
      "element": "shadow",
      "desc": "與最近契靈安全交換，兩端產生衝擊。",
      "range": 145,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "summoner_lance"
    },
    {
      "id": "summoner_lance",
      "name": "五曜靈矢",
      "mode": "volley",
      "damage": 8,
      "cd": 0.75,
      "element": "light",
      "desc": "五枚追蹤慢彈；被元素標記的敵人優先鎖定。",
      "hits": 5,
      "speed": 200,
      "homing": true,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "summoner_pact"
    },
    {
      "id": "summoner_pact",
      "name": "契約護庭",
      "mode": "barrier",
      "damage": 6,
      "cd": 1.25,
      "element": "light",
      "desc": "設置四秒防護圈，阻擋敵彈而不遮住視線。",
      "duration": 4,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "summoner_call"
    },
    {
      "id": "summoner_call",
      "name": "錨點召集",
      "mode": "rally",
      "damage": 17,
      "cd": 0.9,
      "element": "nature",
      "desc": "把所有契靈移至元素錨點旁，纏根周邊敵人；無錨點則召回身旁。",
      "range": 165,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "summoner_gale"
    },
    {
      "id": "summoner_gale",
      "name": "鴞羽上托",
      "mode": "launch",
      "damage": 17,
      "cd": 0.85,
      "element": "wind",
      "desc": "自身上升，命令鴞靈補一次挑空。",
      "launch": -510,
      "range": 180,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "summoner_mend"
    },
    {
      "id": "summoner_mend",
      "name": "共生修復",
      "mode": "heal",
      "damage": 0,
      "cd": 1.65,
      "element": "water",
      "desc": "回復生命、解除持續傷害；契靈存在時多回復少量。",
      "heal": 12,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "summoner_festival"
    },
    {
      "id": "summoner_festival",
      "name": "群星巡行",
      "mode": "orbit",
      "damage": 7,
      "cd": 1.8,
      "element": "light",
      "desc": "光星繞身四秒；可邊換位邊帶著光星切入。",
      "duration": 4,
      "range": 170,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "summoner_fox"
    }
  ],
  "beast": [
    {
      "id": "beast_claw",
      "name": "狼・裂爪追獵",
      "mode": "pounce",
      "damage": 10,
      "cd": 0.6,
      "element": "fire",
      "desc": "切為狼形，低姿前撲三連爪；不是人形劍斬。",
      "form": "wolf",
      "hits": 3,
      "move": 520,
      "range": 130,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "beast_howl"
    },
    {
      "id": "beast_howl",
      "name": "狼・獵群嚎聲",
      "mode": "howl",
      "damage": 14,
      "cd": 0.9,
      "element": "shadow",
      "desc": "狼形嚎叫：附近敵人被詛咒，接著爪擊增傷。",
      "form": "wolf",
      "range": 225,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "beast_dash"
    },
    {
      "id": "beast_dash",
      "name": "狼・月下疾奔",
      "mode": "dash",
      "damage": 19,
      "cd": 0.55,
      "element": "wind",
      "desc": "切狼，穿過短距離並留一次撲咬；適合繞背。",
      "form": "wolf",
      "move": 690,
      "range": 120,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "beast_flight"
    },
    {
      "id": "beast_flight",
      "name": "鷹・自由飛翔",
      "mode": "fly",
      "damage": 0,
      "cd": 1.25,
      "element": "wind",
      "desc": "切鷹並展翼；按住 Space 配合方向鍵飛翔，放開則滑翔。",
      "form": "eagle",
      "duration": 4.5,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "beast_feather"
    },
    {
      "id": "beast_feather",
      "name": "鷹・迴旋飛羽",
      "mode": "volley",
      "damage": 9,
      "cd": 0.7,
      "element": "wind",
      "desc": "鷹形射出四道風羽；施放時維持浮空。",
      "form": "eagle",
      "hits": 4,
      "speed": 210,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "beast_dive"
    },
    {
      "id": "beast_dive",
      "name": "鷹・俯衝獵殺",
      "mode": "dive",
      "damage": 30,
      "cd": 1.15,
      "element": "lightning",
      "desc": "切鷹向下俯衝；落地才產生衝擊，命中後反彈。",
      "form": "eagle",
      "range": 195,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "beast_palm"
    },
    {
      "id": "beast_palm",
      "name": "熊・震山掌",
      "mode": "quake",
      "damage": 30,
      "cd": 0.95,
      "element": "earth",
      "desc": "切熊，向前與腳下同時震地；不需要瞄單一敵人。",
      "form": "bear",
      "range": 235,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "beast_roar"
    },
    {
      "id": "beast_roar",
      "name": "熊・裂甲咆哮",
      "mode": "roar",
      "damage": 18,
      "cd": 1.1,
      "element": "earth",
      "desc": "切熊，範圍破甲並削減 Boss BREAK。",
      "form": "bear",
      "range": 255,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "beast_armor"
    },
    {
      "id": "beast_armor",
      "name": "熊・不屈山軀",
      "mode": "armor",
      "damage": 12,
      "cd": 1.35,
      "element": "light",
      "desc": "切熊獲得短霸體與護盾，近距敵人被推開。",
      "form": "bear",
      "range": 160,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "beast_root"
    },
    {
      "id": "beast_root",
      "name": "森靈・根系突生",
      "mode": "roots",
      "damage": 14,
      "cd": 1.1,
      "element": "nature",
      "desc": "錨點附近長出可站藤台並纏根敵人。",
      "range": 210,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "beast_cycle"
    },
    {
      "id": "beast_cycle",
      "name": "輪形共擊",
      "mode": "formStrike",
      "damage": 20,
      "cd": 0.8,
      "element": "light",
      "desc": "狼撲咬／鷹升羽／熊震地；依當前形態完全不同。",
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "beast_king"
    },
    {
      "id": "beast_king",
      "name": "森王融合",
      "mode": "king",
      "damage": 20,
      "cd": 1.9,
      "element": "nature",
      "desc": "九秒森王形態：飛行、範圍掌擊與短霸體並存。",
      "duration": 9,
      "range": 210,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "beast_claw"
    }
  ],
  "artificer": [
    {
      "id": "artificer_hook",
      "name": "纜索牽引",
      "mode": "grapple",
      "damage": 15,
      "cd": 0.6,
      "element": "wind",
      "desc": "鉤環、標記敵人或普通敵人均可作機動目標。",
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "artificer_turret"
    },
    {
      "id": "artificer_turret",
      "name": "哨戒砲台",
      "mode": "turret",
      "damage": 10,
      "cd": 0.7,
      "element": "lightning",
      "desc": "最多一台主砲；再次施放刷新並升階，不消耗彈藥。",
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "artificer_step"
    },
    {
      "id": "artificer_step",
      "name": "磁浮踏台",
      "mode": "platform",
      "damage": 0,
      "cd": 0.75,
      "element": "ice",
      "desc": "腳下生成短暫踏台，自己彈起並刷新空中 Dash。",
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "artificer_gear"
    },
    {
      "id": "artificer_gear",
      "name": "回返齒輪",
      "mode": "boomerang",
      "damage": 14,
      "cd": 0.9,
      "element": "earth",
      "desc": "向前拋出齒輪再回到玩家，每個方向最多命中一次。",
      "speed": 200,
      "pierce": 3,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "artificer_mine"
    },
    {
      "id": "artificer_mine",
      "name": "感應火雷",
      "mode": "mine",
      "damage": 30,
      "cd": 1.1,
      "element": "fire",
      "desc": "在地面或錨點佈雷；有敵人接近才引爆。",
      "range": 180,
      "duration": 5,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "artificer_coil"
    },
    {
      "id": "artificer_coil",
      "name": "磁吸線圈",
      "mode": "vortex",
      "damage": 5,
      "cd": 1.2,
      "element": "gravity",
      "desc": "在錨點設置吸引場；能拉敵人與箱子，不會消耗錨點。",
      "range": 240,
      "duration": 3,
      "branches": [
        {
          "id": "A",
          "name": "引力特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "artificer_rail"
    },
    {
      "id": "artificer_rail",
      "name": "磁軌穿行",
      "mode": "rail",
      "damage": 34,
      "cd": 1.45,
      "element": "lightning",
      "desc": "發射可穿四敵人的慢速重彈，射擊後向前短移。",
      "speed": 210,
      "pierce": 4,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "artificer_shield"
    },
    {
      "id": "artificer_shield",
      "name": "折射屏障",
      "mode": "barrier",
      "damage": 0,
      "cd": 1.2,
      "element": "light",
      "desc": "設置三秒阻彈屏障；玩家仍可穿越。",
      "duration": 3,
      "range": 145,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "artificer_repair"
    },
    {
      "id": "artificer_repair",
      "name": "緊急維修",
      "mode": "heal",
      "damage": 0,
      "cd": 1.65,
      "element": "water",
      "desc": "治療並刷新主砲存續時間，不重置技能冷卻。",
      "heal": 14,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "artificer_bomb"
    },
    {
      "id": "artificer_bomb",
      "name": "高弧榴彈",
      "mode": "grenade",
      "damage": 26,
      "cd": 1.1,
      "element": "fire",
      "desc": "慢速拋物線榴彈，碰敵或到時爆炸。",
      "range": 175,
      "speed": 190,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "artificer_wire"
    },
    {
      "id": "artificer_wire",
      "name": "接地電網",
      "mode": "field",
      "damage": 7,
      "cd": 1.45,
      "element": "lightning",
      "desc": "留在施放位置的電網，週期性麻痺。",
      "duration": 3,
      "range": 185,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "artificer_overload"
    },
    {
      "id": "artificer_overload",
      "name": "砲網超載",
      "mode": "overload",
      "damage": 12,
      "cd": 1.8,
      "element": "lightning",
      "desc": "主砲短時加速射擊，錨點也釋放一次電圈。",
      "duration": 5,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "artificer_hook"
    }
  ],
  "gunner": [
    {
      "id": "gunner_shot",
      "name": "反衝雙發",
      "mode": "volley",
      "damage": 13,
      "cd": 0.55,
      "element": "light",
      "desc": "兩枚慢彈；後座短移，不需裝填或資源。",
      "hits": 2,
      "speed": 250,
      "recoil": 180,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "gunner_rocket"
    },
    {
      "id": "gunner_rocket",
      "name": "火箭起跳",
      "mode": "launch",
      "damage": 19,
      "cd": 0.8,
      "element": "fire",
      "desc": "向下噴火、向上升空；刷新一次空中 Dash。",
      "range": 150,
      "launch": -480,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "gunner_slug"
    },
    {
      "id": "gunner_slug",
      "name": "重磁軌砲",
      "mode": "rail",
      "damage": 38,
      "cd": 1.4,
      "element": "earth",
      "desc": "緩速穿透重彈，高 BREAK 與後座力。",
      "speed": 170,
      "pierce": 6,
      "recoil": 260,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "gunner_fan"
    },
    {
      "id": "gunner_fan",
      "name": "電弧散射",
      "mode": "volley",
      "damage": 9,
      "cd": 0.7,
      "element": "lightning",
      "desc": "五枚扇形慢彈；濕潤目標被電暈。",
      "hits": 5,
      "speed": 230,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "gunner_grenade"
    },
    {
      "id": "gunner_grenade",
      "name": "濕霧榴彈",
      "mode": "grenade",
      "damage": 18,
      "cd": 0.95,
      "element": "water",
      "desc": "拋物線水榴彈，讓聚集的敵人濕潤。",
      "speed": 185,
      "range": 190,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "gunner_roll"
    },
    {
      "id": "gunner_roll",
      "name": "翻滾射擊",
      "mode": "dash",
      "damage": 20,
      "cd": 0.65,
      "element": "wind",
      "desc": "低姿翻滾後向前射擊；短時間避開接觸傷害。",
      "move": -430,
      "shot": true,
      "range": 110,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "gunner_focus"
    },
    {
      "id": "gunner_focus",
      "name": "標靶狙擊",
      "mode": "targetShot",
      "damage": 40,
      "cd": 1.35,
      "element": "light",
      "desc": "優先對標記敵人發射一枚追蹤穿透彈。",
      "speed": 255,
      "homing": true,
      "pierce": 2,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "gunner_orbit"
    },
    {
      "id": "gunner_orbit",
      "name": "衛星彈環",
      "mode": "orbit",
      "damage": 7,
      "cd": 1.3,
      "element": "lightning",
      "desc": "三枚子彈環繞玩家，適合跟著換位靠近。",
      "duration": 3,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "gunner_anchor"
    },
    {
      "id": "gunner_anchor",
      "name": "雙端交叉火力",
      "mode": "anchorDetonate",
      "damage": 23,
      "cd": 1.15,
      "element": "fire",
      "desc": "玩家與元素錨點交替引爆，保持遠程交叉攻擊。",
      "range": 170,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "gunner_barrage"
    },
    {
      "id": "gunner_barrage",
      "name": "滯空彈幕",
      "mode": "hoverVolley",
      "damage": 8,
      "cd": 1.25,
      "element": "wind",
      "desc": "懸停後分四拍射擊，方向可在空中調整。",
      "hits": 4,
      "speed": 215,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "gunner_rupture"
    },
    {
      "id": "gunner_rupture",
      "name": "寒裂轟擊",
      "mode": "wave",
      "damage": 29,
      "cd": 1.1,
      "element": "ice",
      "desc": "沿地面滑行的冰重彈，推開近地敵人。",
      "speed": 180,
      "pierce": 3,
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "gunner_storm"
    },
    {
      "id": "gunner_storm",
      "name": "天穹轟炸",
      "mode": "meteor",
      "damage": 11,
      "cd": 1.9,
      "element": "fire",
      "desc": "六次落彈鎖定原位置，敵人可移開，自己也可換位。",
      "hits": 6,
      "range": 140,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "gunner_shot"
    }
  ],
  "warden": [
    {
      "id": "warden_rush",
      "name": "壁壘衝鋒",
      "mode": "dash",
      "damage": 25,
      "cd": 0.75,
      "element": "earth",
      "desc": "短距盾衝；高破甲與 BREAK，不是瞬間傳送。",
      "move": 510,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "warden_spear"
    },
    {
      "id": "warden_spear",
      "name": "長槍上引",
      "mode": "launch",
      "damage": 22,
      "cd": 0.85,
      "element": "wind",
      "desc": "長槍挑空並將近敵帶至前方。",
      "range": 195,
      "launch": -580,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "warden_guard"
    },
    {
      "id": "warden_guard",
      "name": "精準反擊",
      "mode": "parry",
      "damage": 36,
      "cd": 0.65,
      "element": "lightning",
      "desc": "0.38 秒反擊窗；成功後電暈並推開近敵。",
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "warden_fort"
    },
    {
      "id": "warden_fort",
      "name": "移動堡壘",
      "mode": "barrier",
      "damage": 0,
      "cd": 1.3,
      "element": "light",
      "desc": "護圈跟隨玩家三秒；擋彈但仍要躲大範圍地面招。",
      "range": 135,
      "duration": 3,
      "follow": true,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "warden_quake"
    },
    {
      "id": "warden_quake",
      "name": "盾落山崩",
      "mode": "dive",
      "damage": 35,
      "cd": 1.2,
      "element": "earth",
      "desc": "向下落地震擊，地上施放則原地震圈。",
      "range": 260,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "warden_chain"
    },
    {
      "id": "warden_chain",
      "name": "拘束長槍",
      "mode": "pull",
      "damage": 21,
      "cd": 0.8,
      "element": "nature",
      "desc": "把輕敵拉回，重敵則拉近自己，並纏根。",
      "range": 620,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "warden_arc"
    },
    {
      "id": "warden_arc",
      "name": "回旋盾",
      "mode": "boomerang",
      "damage": 15,
      "cd": 0.95,
      "element": "light",
      "desc": "盾刃來回兩段，各命中一次。",
      "speed": 205,
      "pierce": 4,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "warden_vow"
    },
    {
      "id": "warden_vow",
      "name": "守護誓約",
      "mode": "armor",
      "damage": 0,
      "cd": 1.5,
      "element": "light",
      "desc": "護盾與短霸體，清除蛛網但不無敵。",
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "warden_anchor"
    },
    {
      "id": "warden_anchor",
      "name": "壁間共振",
      "mode": "anchorDetonate",
      "damage": 28,
      "cd": 1.2,
      "element": "earth",
      "desc": "兩端震波；岩錨點適合大幅削減 BREAK。",
      "range": 210,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "warden_cleave"
    },
    {
      "id": "warden_cleave",
      "name": "槍盾交替",
      "mode": "spin",
      "damage": 12,
      "cd": 1.1,
      "element": "light",
      "desc": "先槍後盾三段橫掃，最後一段高擊退。",
      "hits": 3,
      "range": 180,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "warden_restore"
    },
    {
      "id": "warden_restore",
      "name": "庇護祈願",
      "mode": "heal",
      "damage": 0,
      "cd": 1.75,
      "element": "water",
      "desc": "恢復生命與短護盾，沒有魔力條。",
      "heal": 14,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "warden_judgement"
    },
    {
      "id": "warden_judgement",
      "name": "天壁裁決",
      "mode": "meteor",
      "damage": 17,
      "cd": 1.9,
      "element": "lightning",
      "desc": "三次落槍與範圍破勢，銜接在 Boss 失衡後。",
      "hits": 3,
      "range": 200,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "warden_rush"
    }
  ],
  "chrono": [
    {
      "id": "chrono_echo",
      "name": "回響步",
      "mode": "blink",
      "damage": 20,
      "cd": 0.7,
      "element": "shadow",
      "desc": "向前安全移動，舊位置半秒後再斬一次。",
      "echo": true,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "chrono_stop"
    },
    {
      "id": "chrono_stop",
      "name": "凝滯鐘域",
      "mode": "stasis",
      "damage": 3,
      "cd": 1.25,
      "element": "ice",
      "desc": "敵人與敵彈減速三秒；不永久凍住世界。",
      "duration": 3,
      "range": 220,
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "chrono_rewind"
    },
    {
      "id": "chrono_rewind",
      "name": "三秒回溯",
      "mode": "rewind",
      "damage": 0,
      "cd": 1.75,
      "element": "water",
      "desc": "回到三秒前的位置與較高生命；空間碰撞會檢查。",
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "chrono_anchor"
    },
    {
      "id": "chrono_anchor",
      "name": "時間錨",
      "mode": "timeAnchor",
      "damage": 0,
      "cd": 0.55,
      "element": "light",
      "desc": "首次記錄安全位置，再次施放回到該點。",
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "chrono_shard"
    },
    {
      "id": "chrono_shard",
      "name": "碎秒彈",
      "mode": "volley",
      "damage": 9,
      "cd": 0.7,
      "element": "light",
      "desc": "四枚慢速時間碎片，可追擊標記目標。",
      "hits": 4,
      "speed": 185,
      "homing": true,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "chrono_lift"
    },
    {
      "id": "chrono_lift",
      "name": "逆時升空",
      "mode": "launch",
      "damage": 20,
      "cd": 0.85,
      "element": "wind",
      "desc": "玩家與近敵向上彈起，回復一次空中 Dash。",
      "range": 175,
      "launch": -620,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "chrono_seal"
    },
    {
      "id": "chrono_seal",
      "name": "延遲刻印",
      "mode": "delayed",
      "damage": 33,
      "cd": 1.2,
      "element": "fire",
      "desc": "在目標施放時位置留下刻印，0.7 秒後爆發。",
      "delay": 0.7,
      "range": 185,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "chrono_orbit"
    },
    {
      "id": "chrono_orbit",
      "name": "時針巡遊",
      "mode": "orbit",
      "damage": 7,
      "cd": 1.2,
      "element": "lightning",
      "desc": "環繞時針每半秒掃擊，命中附電。",
      "duration": 3.5,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "chrono_borrow"
    },
    {
      "id": "chrono_borrow",
      "name": "借來的一秒",
      "mode": "haste",
      "damage": 0,
      "cd": 1.4,
      "element": "wind",
      "desc": "短時取消窗提早，Dash 冷卻短一點，不重置技能。",
      "duration": 4,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "chrono_rift"
    },
    {
      "id": "chrono_rift",
      "name": "昨日裂隙",
      "mode": "anchorDetonate",
      "damage": 24,
      "cd": 1.2,
      "element": "shadow",
      "desc": "舊錨點與玩家兩端各保留一次延遲爆炸。",
      "range": 190,
      "delay": 0.35,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "chrono_return"
    },
    {
      "id": "chrono_return",
      "name": "回返時輪",
      "mode": "boomerang",
      "damage": 17,
      "cd": 1.1,
      "element": "ice",
      "desc": "迴旋時間輪去回各一擊。",
      "speed": 175,
      "pierce": 4,
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "chrono_twelve"
    },
    {
      "id": "chrono_twelve",
      "name": "十二刻回響",
      "mode": "meteor",
      "damage": 9,
      "cd": 1.9,
      "element": "light",
      "desc": "分六拍在目標周圍回響，不使用真實時間 setTimeout。",
      "hits": 6,
      "range": 160,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "chrono_echo"
    }
  ],
  "harrier": [
    {
      "id": "harrier_hook",
      "name": "鎖鏈鉤",
      "mode": "pull",
      "damage": 18,
      "cd": 0.55,
      "element": "earth",
      "desc": "抓近輕敵，重敵則拉自己接近。",
      "range": 690,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "harrier_swing"
    },
    {
      "id": "harrier_swing",
      "name": "擺盪踢",
      "mode": "grapple",
      "damage": 22,
      "cd": 0.65,
      "element": "wind",
      "desc": "抓向標記敵人或流光環，並刷新一次空中 Dash。",
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "harrier_spiral"
    },
    {
      "id": "harrier_spiral",
      "name": "鎖域旋舞",
      "mode": "vortex",
      "damage": 6,
      "cd": 1.25,
      "element": "gravity",
      "desc": "持續聚敵；一邊留場一邊以元素換位追擊。",
      "range": 240,
      "duration": 3,
      "branches": [
        {
          "id": "A",
          "name": "引力特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "harrier_swap"
    },
    {
      "id": "harrier_swap",
      "name": "反向奪位",
      "mode": "blink",
      "damage": 24,
      "cd": 0.8,
      "element": "shadow",
      "desc": "繞到標記敵人背後，留下向前的踢擊。",
      "range": 170,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "harrier_scythe"
    },
    {
      "id": "harrier_scythe",
      "name": "雙返鐮",
      "mode": "boomerang",
      "damage": 14,
      "cd": 0.9,
      "element": "wind",
      "desc": "兩把弧形鎖刃往返，適合群怪。",
      "speed": 215,
      "pierce": 3,
      "hits": 2,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "harrier_rising"
    },
    {
      "id": "harrier_rising",
      "name": "上勾鎖",
      "mode": "launch",
      "damage": 23,
      "cd": 0.85,
      "element": "lightning",
      "desc": "把近敵拋向上方，順勢上升。",
      "launch": -630,
      "range": 185,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "harrier_fall"
    },
    {
      "id": "harrier_fall",
      "name": "墜鎖重踏",
      "mode": "dive",
      "damage": 32,
      "cd": 1.15,
      "element": "earth",
      "desc": "落地範圍震擊；空中接技的收尾。",
      "range": 220,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "harrier_net"
    },
    {
      "id": "harrier_net",
      "name": "交織縛網",
      "mode": "roots",
      "damage": 15,
      "cd": 1.1,
      "element": "nature",
      "desc": "錨點周圍纏根，生成可站的短暫網台。",
      "range": 210,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "harrier_fan"
    },
    {
      "id": "harrier_fan",
      "name": "鎖刃散射",
      "mode": "volley",
      "damage": 8,
      "cd": 0.75,
      "element": "water",
      "desc": "五枚細小慢彈，先上濕潤供雷換位。",
      "hits": 5,
      "speed": 235,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "harrier_counter"
    },
    {
      "id": "harrier_counter",
      "name": "纏腕反制",
      "mode": "parry",
      "damage": 31,
      "cd": 0.8,
      "element": "shadow",
      "desc": "擋招後把敵人拖回腳邊。",
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "harrier_steps"
    },
    {
      "id": "harrier_steps",
      "name": "四方蹴",
      "mode": "spin",
      "damage": 10,
      "cd": 1.2,
      "element": "wind",
      "desc": "四段踢擊範圍由小變大。",
      "hits": 4,
      "range": 195,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "harrier_anchor"
    },
    {
      "id": "harrier_anchor",
      "name": "十相牽連",
      "mode": "anchorRecall",
      "damage": 29,
      "cd": 1.5,
      "element": "gravity",
      "desc": "換到錨點後把周圍敵人吸回自己。",
      "range": 230,
      "branches": [
        {
          "id": "A",
          "name": "引力特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "harrier_hook"
    }
  ],
  "alchemist": [
    {
      "id": "alchemist_mist",
      "name": "濕霧瓶",
      "mode": "grenade",
      "damage": 13,
      "cd": 0.7,
      "element": "water",
      "desc": "拋濕霧瓶讓敵人濕潤，準備導電。",
      "speed": 175,
      "range": 185,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "alchemist_spark"
    },
    {
      "id": "alchemist_spark",
      "name": "電解試劑",
      "mode": "volley",
      "damage": 9,
      "cd": 0.8,
      "element": "lightning",
      "desc": "三發電解彈，濕潤敵人額外受電。",
      "hits": 3,
      "speed": 200,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "alchemist_burn"
    },
    {
      "id": "alchemist_burn",
      "name": "焚化催化",
      "mode": "consume",
      "damage": 30,
      "cd": 1.05,
      "element": "fire",
      "desc": "消耗範圍內燃燒／濕潤狀態，額外爆發。",
      "range": 230,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "alchemist_ice"
    },
    {
      "id": "alchemist_ice",
      "name": "急凍結晶",
      "mode": "platform",
      "damage": 12,
      "cd": 0.85,
      "element": "ice",
      "desc": "腳下結晶可站立，附近敵人冰緩。",
      "branches": [
        {
          "id": "A",
          "name": "急凍特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "alchemist_acid"
    },
    {
      "id": "alchemist_acid",
      "name": "腐蝕釜",
      "mode": "field",
      "damage": 7,
      "cd": 1.2,
      "element": "earth",
      "desc": "在錨點留下三秒破甲藥霧。",
      "range": 180,
      "duration": 3,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "alchemist_seed"
    },
    {
      "id": "alchemist_seed",
      "name": "菌根培養",
      "mode": "roots",
      "damage": 13,
      "cd": 1.1,
      "element": "nature",
      "desc": "長出藤台並纏根，建立解謎與空戰踏點。",
      "range": 195,
      "branches": [
        {
          "id": "A",
          "name": "纏根特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "alchemist_heal"
    },
    {
      "id": "alchemist_heal",
      "name": "快速包紮",
      "mode": "heal",
      "damage": 0,
      "cd": 1.65,
      "element": "water",
      "desc": "治療與解除毒、燃燒，不需消耗藥品。",
      "heal": 15,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "換位護膜",
          "effect": "shield",
          "desc": "施放時獲得少量護盾；不是額外的技能資源。"
        }
      ],
      "recommendedFollow": "alchemist_lift"
    },
    {
      "id": "alchemist_lift",
      "name": "蒸氣升梯",
      "mode": "launch",
      "damage": 18,
      "cd": 0.8,
      "element": "wind",
      "desc": "蒸氣頂起玩家和近敵，接空中元素投射。",
      "range": 160,
      "launch": -510,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "alchemist_gravity"
    },
    {
      "id": "alchemist_gravity",
      "name": "凝質黑瓶",
      "mode": "vortex",
      "damage": 4,
      "cd": 1.2,
      "element": "gravity",
      "desc": "慢速成形的引力釜，吸怪、箱子和核心球。",
      "range": 260,
      "duration": 3,
      "branches": [
        {
          "id": "A",
          "name": "引力特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "領域擴展",
          "effect": "reach",
          "desc": "場域／召喚感知／飛行時間或攻擊範圍擴大 25%。"
        }
      ],
      "recommendedFollow": "alchemist_shield"
    },
    {
      "id": "alchemist_shield",
      "name": "光膜蒸餾",
      "mode": "barrier",
      "damage": 0,
      "cd": 1.3,
      "element": "light",
      "desc": "原地短效光膜阻彈，可換位離開。",
      "duration": 3.5,
      "range": 155,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "alchemist_swap"
    },
    {
      "id": "alchemist_swap",
      "name": "雙瓶對流",
      "mode": "anchorDetonate",
      "damage": 24,
      "cd": 1.2,
      "element": "water",
      "desc": "玩家與錨點各爆一瓶；共鳴元素可改變狀態。",
      "range": 190,
      "branches": [
        {
          "id": "A",
          "name": "濕潤特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "alchemist_chain"
    },
    {
      "id": "alchemist_chain",
      "name": "連鎖煉成",
      "mode": "meteor",
      "damage": 11,
      "cd": 1.85,
      "element": "fire",
      "desc": "六次藥瓶落地，適合先引力聚怪再用火引爆。",
      "hits": 6,
      "range": 160,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "alchemist_mist"
    }
  ],
  "monk": [
    {
      "id": "monk_jab",
      "name": "踏風三拳",
      "mode": "dash",
      "damage": 10,
      "cd": 0.55,
      "element": "wind",
      "desc": "前進三連拳，命中可跳或換位取消。",
      "hits": 3,
      "move": 370,
      "range": 100,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "monk_rise"
    },
    {
      "id": "monk_rise",
      "name": "升龍掌",
      "mode": "launch",
      "damage": 23,
      "cd": 0.8,
      "element": "lightning",
      "desc": "以拳掌挑空，附雷適合接水換位。",
      "range": 150,
      "launch": -650,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "monk_wave"
    },
    {
      "id": "monk_wave",
      "name": "裂氣波",
      "mode": "wave",
      "damage": 22,
      "cd": 0.8,
      "element": "light",
      "desc": "慢速地面氣波，穿過三名敵人。",
      "speed": 230,
      "pierce": 3,
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "monk_counter"
    },
    {
      "id": "monk_counter",
      "name": "寸勁反掌",
      "mode": "parry",
      "damage": 35,
      "cd": 0.65,
      "element": "earth",
      "desc": "精準反掌窗口；成功後重創 BREAK。",
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "monk_step"
    },
    {
      "id": "monk_step",
      "name": "雷影步",
      "mode": "blink",
      "damage": 22,
      "cd": 0.7,
      "element": "shadow",
      "desc": "向標記敵人背後踏步，保留空中機動。",
      "range": 130,
      "branches": [
        {
          "id": "A",
          "name": "咒印特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回響追段",
          "effect": "echo",
          "desc": "命中後 0.22 秒在原命中位置追加 30% 傷害；不遞迴觸發。"
        }
      ],
      "recommendedFollow": "monk_spin"
    },
    {
      "id": "monk_spin",
      "name": "旋風連踢",
      "mode": "spin",
      "damage": 9,
      "cd": 0.95,
      "element": "wind",
      "desc": "四段踢擊圍繞自己，移動時仍能造成命中。",
      "hits": 4,
      "range": 190,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "monk_drop"
    },
    {
      "id": "monk_drop",
      "name": "千鈞落踵",
      "mode": "dive",
      "damage": 33,
      "cd": 1.05,
      "element": "earth",
      "desc": "下墜落踵，落地才範圍震擊。",
      "range": 235,
      "branches": [
        {
          "id": "A",
          "name": "裂甲特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "monk_palm"
    },
    {
      "id": "monk_palm",
      "name": "凝雷掌",
      "mode": "volley",
      "damage": 11,
      "cd": 0.7,
      "element": "lightning",
      "desc": "三枚緩慢掌風，命中有雷麻痺。",
      "hits": 3,
      "speed": 190,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "穿透延伸",
          "effect": "pierce",
          "desc": "投射物額外穿透兩名敵人；非投射技延長攻擊範圍。"
        }
      ],
      "recommendedFollow": "monk_guard"
    },
    {
      "id": "monk_guard",
      "name": "金鐘護體",
      "mode": "armor",
      "damage": 0,
      "cd": 1.25,
      "element": "light",
      "desc": "短霸體與護盾；不能擋住所有傷害。",
      "branches": [
        {
          "id": "A",
          "name": "光癒特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "回復脈動",
          "effect": "heal",
          "desc": "施放時少量回復生命，技能本身仍只受冷卻限制。"
        }
      ],
      "recommendedFollow": "monk_rhythm"
    },
    {
      "id": "monk_rhythm",
      "name": "疾風呼吸",
      "mode": "haste",
      "damage": 0,
      "cd": 1.1,
      "element": "wind",
      "desc": "四秒提早取消窗，增強連段操作而非傷害數字。",
      "duration": 4,
      "branches": [
        {
          "id": "A",
          "name": "風壓特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "滯空續接",
          "effect": "air",
          "desc": "成功命中或使用輔助技後刷新一次空中 Dash。"
        }
      ],
      "recommendedFollow": "monk_anchor"
    },
    {
      "id": "monk_anchor",
      "name": "隔空雙勁",
      "mode": "anchorDetonate",
      "damage": 26,
      "cd": 1.2,
      "element": "fire",
      "desc": "隔著錨點打出雙端掌波，銜接元素爆破。",
      "range": 190,
      "branches": [
        {
          "id": "A",
          "name": "灼熱特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "monk_finish"
    },
    {
      "id": "monk_finish",
      "name": "九響天雷",
      "mode": "spin",
      "damage": 8,
      "cd": 1.9,
      "element": "lightning",
      "desc": "六次環拳後雷掌；多段但有共享 Hit Stop 上限。",
      "hits": 7,
      "range": 225,
      "branches": [
        {
          "id": "A",
          "name": "麻痺特化",
          "effect": "element",
          "desc": "技能等級 1：強化本技能附加狀態；換位共鳴時會同時附加共鳴元素。"
        },
        {
          "id": "B",
          "name": "收束聚敵",
          "effect": "pull",
          "desc": "受擊敵人被向命中中心拉扯；重型敵人位移較小。"
        }
      ],
      "recommendedFollow": "monk_jab"
    }
  ]
};
