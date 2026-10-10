/* 21.8 editable combat content; compatible with the 21.7 editor schema. */
window.ES217_CONFIG = {
  "schema": 1,
  "version": "21.8.0",
  "title": "澄界｜既視連舞",
  "hero": {
    "atlas": "assets/atlas217/hero.webp",
    "scale": 1.0,
    "anchor": [
      80,
      130
    ],
    "cell": [
      160,
      144
    ]
  },
  "combat": {
    "bufferSeconds": 0.28,
    "comboGapSeconds": 0.85,
    "commands": {
      "Z": {
        "name": "試探直刺",
        "shape": "thrust",
        "width": 168,
        "height": 88,
        "offsetY": -19,
        "damage": 18,
        "duration": 0.24,
        "pulses": [
          0.065
        ],
        "cancel": 0.155,
        "knockX": 0,
        "knockY": 0,
        "break": 8,
        "clip": "light",
        "weight": "light",
        "hint": "快速近身橫斬；短前搖、小硬直。"
      },
      "ZZ": {
        "name": "返刃接續",
        "shape": "slash",
        "width": 210,
        "height": 112,
        "offsetY": -28,
        "damage": 20,
        "duration": 0.28,
        "pulses": [
          0.085
        ],
        "cancel": 0.18,
        "knockX": 0,
        "knockY": 0,
        "break": 10,
        "clip": "cut",
        "weight": "light",
        "hint": "輕斬第二拍。接 X 挑空；接 Z 留地連斬。"
      },
      "ZZZ": {
        "name": "三連刻痕",
        "shape": "flurry",
        "width": 244,
        "height": 116,
        "offsetY": -30,
        "damage": 12,
        "duration": 0.37,
        "pulses": [
          0.07,
          0.15,
          0.23
        ],
        "cancel": 0.27,
        "knockX": 0,
        "knockY": 0,
        "break": 9,
        "clip": "spin",
        "weight": "light",
        "hint": "三段快斬留住敵人；Space／Shift 可在命中後取消收招。"
      },
      "ZZZZ": {
        "name": "月弧送離",
        "shape": "sweep",
        "width": 287,
        "height": 113,
        "offsetY": -9,
        "damage": 27,
        "duration": 0.39,
        "pulses": [
          0.16
        ],
        "cancel": 0.289,
        "knockX": 340,
        "knockY": -150,
        "break": 22,
        "clip": "finish",
        "weight": "light",
        "hint": "地面連斬收尾：擊退拉開距離；不會自動循環成 ZZZZ。",
        "action218": {
          "finisher": true
        }
      },
      "X": {
        "name": "重擊壓勢",
        "shape": "heavy",
        "width": 272,
        "height": 164,
        "offsetY": -86,
        "damage": 36,
        "duration": 0.59,
        "pulses": [
          0.215
        ],
        "cancel": 0.395,
        "knockX": 0,
        "knockY": 0,
        "break": 32,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "蓄勢後釋放寬幅夢刃；範圍、前搖與破勢明顯高於輕擊。"
      },
      "XX": {
        "name": "斷甲雙拍",
        "shape": "double",
        "width": 196,
        "height": 136,
        "offsetY": -23,
        "damage": 20,
        "duration": 0.46,
        "pulses": [
          0.12,
          0.26
        ],
        "cancel": 0.31,
        "knockX": 0,
        "knockY": 0,
        "break": 27,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "雙拍重擊留敵；接 Z 破甲再挑，接 X 重擊收尾。"
      },
      "XXX": {
        "name": "崩月終結",
        "shape": "quake",
        "width": 340,
        "height": 146,
        "offsetY": -46,
        "damage": 54,
        "duration": 0.72,
        "pulses": [
          0.305
        ],
        "cancel": 0.52,
        "knockX": 430,
        "knockY": -180,
        "break": 74,
        "clip": "finish",
        "weight": "heavy",
        "hint": "重連段終結：大破勢與擊退；命中後不能立刻無限重連。",
        "action218": {
          "finisher": true
        }
      },
      "ZX": {
        "name": "滑步切入",
        "shape": "thrust",
        "width": 245,
        "height": 115,
        "offsetY": -28,
        "damage": 23,
        "duration": 0.32,
        "pulses": [
          0.11
        ],
        "cancel": 0.2,
        "knockX": 35,
        "knockY": 0,
        "break": 15,
        "clip": "dash",
        "weight": "light",
        "hint": "向前滑步切入（碰牆停止）；接 Z 回旋留敵，接 X 重斬收尾。",
        "action218": {
          "travel": 82,
          "moveFrom": 0.02,
          "moveTo": 0.16
        }
      },
      "XZ": {
        "name": "倒鉤聚敵",
        "shape": "hook",
        "width": 322,
        "height": 106,
        "offsetY": -6,
        "damage": 21,
        "duration": 0.32,
        "pulses": [
          0.12
        ],
        "cancel": 0.237,
        "knockX": -200,
        "knockY": 0,
        "break": 16,
        "clip": "light",
        "weight": "light",
        "hint": "把前方敵人鉤近，接 Z 連刺或 X 架刃反彈。"
      },
      "ZZX": {
        "name": "逆月挑空",
        "shape": "lift",
        "width": 236,
        "height": 258,
        "offsetY": -164,
        "damage": 32,
        "duration": 0.47,
        "pulses": [
          0.175
        ],
        "cancel": 0.31,
        "knockX": 0,
        "knockY": -590,
        "break": 22,
        "clip": "cross",
        "weight": "light",
        "hint": "挑空敵人；命中後按 Space 跳取消，接空中 ZZ／ZX。",
        "action218": {
          "launcher": true
        }
      },
      "XXZ": {
        "name": "破甲楔入",
        "shape": "break",
        "width": 217,
        "height": 132,
        "offsetY": -23,
        "damage": 30,
        "duration": 0.488,
        "pulses": [
          0.201
        ],
        "cancel": 0.347,
        "knockX": 0,
        "knockY": 0,
        "break": 90,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "破甲後接 Z 挑空，或命中取消接職業技。"
      },
      "ZXX": {
        "name": "裂步斷甲",
        "shape": "break",
        "width": 268,
        "height": 142,
        "offsetY": -48,
        "damage": 39,
        "duration": 0.49,
        "pulses": [
          0.2
        ],
        "cancel": 0.37,
        "knockX": 300,
        "knockY": -100,
        "break": 30,
        "clip": "finish",
        "weight": "heavy",
        "hint": "突入後破甲重斬並擊退；放棄留敵換取收尾傷害。",
        "action218": {
          "finisher": true
        }
      },
      "ZXZ": {
        "name": "返身雙環",
        "shape": "circle",
        "width": 218,
        "height": 139,
        "offsetY": -29,
        "damage": 15,
        "duration": 0.36,
        "pulses": [
          0.1,
          0.21
        ],
        "cancel": 0.255,
        "knockX": -85,
        "knockY": 0,
        "break": 20,
        "clip": "spin",
        "weight": "light",
        "hint": "兩段環斬把兩側敵人收向身邊；可接 X 聚點終斬。"
      },
      "XZZ": {
        "name": "鉤後雙刺",
        "shape": "flurry",
        "width": 287,
        "height": 94,
        "offsetY": -6,
        "damage": 17,
        "duration": 0.38,
        "pulses": [
          0.09,
          0.22
        ],
        "cancel": 0.281,
        "knockX": -75,
        "knockY": 0,
        "break": 16,
        "clip": "cross",
        "weight": "light",
        "hint": "回拉後兩次命中，接固定技能槽"
      },
      "XZX": {
        "name": "架刃反彈",
        "shape": "parry",
        "width": 210,
        "height": 139,
        "offsetY": -30,
        "damage": 27,
        "duration": 0.38,
        "pulses": [
          0.15
        ],
        "cancel": 0.281,
        "knockX": 0,
        "knockY": 0,
        "break": 32,
        "clip": "light",
        "weight": "light",
        "hint": "出手後 0.5 秒反彈正前方一枚敵彈"
      },
      "ZZXX": {
        "name": "落點下壓",
        "shape": "down",
        "width": 238,
        "height": 271,
        "offsetY": -150,
        "damage": 31,
        "duration": 0.537,
        "pulses": [
          0.224
        ],
        "cancel": 0.383,
        "knockX": 0,
        "knockY": 460,
        "break": 28,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "不跳取消而繼續 X：將已挑空的敵人壓回地面。",
        "action218": {
          "finisher": true
        }
      },
      "ZXZX": {
        "name": "聚點終斬",
        "shape": "circle",
        "width": 287,
        "height": 136,
        "offsetY": -25,
        "damage": 37,
        "duration": 0.42,
        "pulses": [
          0.16
        ],
        "cancel": 0.311,
        "knockX": -135,
        "knockY": 0,
        "break": 24,
        "clip": "finish",
        "weight": "light",
        "hint": "環斬路線終結，將兩側敵人拉進元素場。",
        "action218": {
          "finisher": true
        }
      },
      "XXZZ": {
        "name": "破甲後挑升",
        "shape": "lift",
        "width": 231,
        "height": 230,
        "offsetY": -132,
        "damage": 33,
        "duration": 0.44,
        "pulses": [
          0.18
        ],
        "cancel": 0.326,
        "knockX": 0,
        "knockY": -510,
        "break": 38,
        "clip": "cross",
        "weight": "light",
        "hint": "破甲路線轉挑空；可跳取消追打。",
        "action218": {
          "launcher": true
        }
      },
      "ZXXZ": {
        "name": "根縛雙刺",
        "shape": "flurry",
        "width": 294,
        "height": 100,
        "offsetY": -6,
        "damage": 18,
        "duration": 0.4,
        "pulses": [
          0.1,
          0.25
        ],
        "cancel": 0.296,
        "knockX": 0,
        "knockY": 0,
        "break": 21,
        "clip": "cross",
        "weight": "light",
        "hint": "束縛後雙刺，定身保留，不強制推走"
      },
      "XZXZ": {
        "name": "護刃環掃",
        "shape": "circle",
        "width": 266,
        "height": 153,
        "offsetY": -46,
        "damage": 33,
        "duration": 0.4,
        "pulses": [
          0.17
        ],
        "cancel": 0.296,
        "knockX": 0,
        "knockY": 0,
        "break": 32,
        "clip": "spin",
        "weight": "light",
        "hint": "反彈之後處理包圍，接任一技能"
      },
      "ZZXZX": {
        "name": "收束地裂",
        "shape": "quake",
        "width": 364,
        "height": 266,
        "offsetY": -115,
        "damage": 39,
        "duration": 0.6,
        "pulses": [
          0.236
        ],
        "cancel": 0.427,
        "knockX": 0,
        "knockY": 300,
        "break": 64,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "上挑轉定點下壓，回收浮空敵人",
        "action218": {
          "finisher": true
        }
      },
      "AIRZ": {
        "name": "空中留擊",
        "shape": "slash",
        "width": 189,
        "height": 124,
        "offsetY": -23,
        "damage": 18,
        "duration": 0.24,
        "pulses": [
          0.075
        ],
        "cancel": 0.15,
        "knockX": 0,
        "knockY": -155,
        "break": 13,
        "clip": "light",
        "weight": "light",
        "hint": "短暫滯空留擊；接 Z 追打或 X 下劈。",
        "action218": {
          "hover": 0.12
        }
      },
      "AIRX": {
        "name": "墜月斬",
        "shape": "down",
        "width": 179,
        "height": 184,
        "offsetY": 6,
        "damage": 29,
        "duration": 0.475,
        "pulses": [
          0.201
        ],
        "cancel": 0.338,
        "knockX": 0,
        "knockY": 490,
        "break": 35,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "向下劈斬並快速下墜；命中把敵人壓回地面。",
        "action218": {
          "dive": 520
        }
      },
      "AIRZX": {
        "name": "隕月落擊",
        "shape": "down",
        "width": 231,
        "height": 224,
        "offsetY": -34,
        "damage": 31,
        "duration": 0.44,
        "pulses": [
          0.16
        ],
        "cancel": 0.29,
        "knockX": 0,
        "knockY": 560,
        "break": 36,
        "clip": "finish",
        "weight": "heavy",
        "hint": "空中 Z 後重劈落地；普通敵人一次小彈地，可接地面 Z。",
        "action218": {
          "dive": 650,
          "bounce": true,
          "finisher": true
        }
      },
      "AIRXZ": {
        "name": "空中回挑",
        "shape": "lift",
        "width": 224,
        "height": 230,
        "offsetY": -126,
        "damage": 27,
        "duration": 0.37,
        "pulses": [
          0.14
        ],
        "cancel": 0.274,
        "knockX": 0,
        "knockY": -420,
        "break": 30,
        "clip": "cross",
        "weight": "light",
        "hint": "下劈後回挑；浮空越久，敵人再次被挑高的幅度越小。",
        "action218": {
          "hover": 0.12,
          "launcher": true
        }
      },
      "UZ": {
        "name": "上段截擊",
        "shape": "lift",
        "width": 154,
        "height": 206,
        "offsetY": -132,
        "damage": 20,
        "duration": 0.28,
        "pulses": [
          0.11
        ],
        "cancel": 0.207,
        "knockX": 0,
        "knockY": -430,
        "break": 18,
        "clip": "cross",
        "weight": "light",
        "hint": "↑＋Z 上段挑擊；命中後 Space 可追上。",
        "action218": {
          "launcher": true
        }
      },
      "UX": {
        "name": "升月追斬",
        "shape": "lift",
        "width": 203,
        "height": 271,
        "offsetY": -190,
        "damage": 32,
        "duration": 0.41,
        "pulses": [
          0.18
        ],
        "cancel": 0.303,
        "knockX": 0,
        "knockY": -570,
        "break": 40,
        "clip": "cross",
        "weight": "heavy",
        "hint": "↑＋X 自身小幅升空，同時挑起敵人。",
        "action218": {
          "rise": -425,
          "launcher": true
        }
      },
      "DZ": {
        "name": "貼地掃腳",
        "shape": "low",
        "width": 238,
        "height": 45,
        "offsetY": 39,
        "damage": 19,
        "duration": 0.28,
        "pulses": [
          0.1
        ],
        "cancel": 0.207,
        "knockX": 0,
        "knockY": 0,
        "break": 18,
        "clip": "light",
        "weight": "light",
        "hint": "低身目標與慢移動怪的剋星"
      },
      "DX": {
        "name": "落地震掌",
        "shape": "quake",
        "width": 329,
        "height": 83,
        "offsetY": 23,
        "damage": 34,
        "duration": 0.537,
        "pulses": [
          0.236
        ],
        "cancel": 0.383,
        "knockX": 0,
        "knockY": 0,
        "break": 52,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "地面破势，不射出震波子彈"
      },
      "ZZZX": {
        "name": "月輪升斬",
        "shape": "lift",
        "width": 236,
        "height": 258,
        "offsetY": -164,
        "damage": 39,
        "duration": 0.49,
        "pulses": [
          0.17
        ],
        "cancel": 0.3,
        "knockX": 0,
        "knockY": -680,
        "break": 22,
        "clip": "cross",
        "weight": "light",
        "hint": "三斬後強挑空；命中後 Space 追上，再接空中指令。",
        "action218": {
          "launcher": true
        }
      },
      "AIRZZ": {
        "name": "空中返刃",
        "shape": "slash",
        "width": 211,
        "height": 124,
        "offsetY": -23,
        "damage": 21,
        "duration": 0.24,
        "pulses": [
          0.08
        ],
        "cancel": 0.17,
        "knockX": 0,
        "knockY": -165,
        "break": 13,
        "clip": "cut",
        "weight": "light",
        "hint": "第二拍穩定敵人高度；接 Z 送離或 X 下劈。",
        "action218": {
          "hover": 0.14
        }
      },
      "AIRZZZ": {
        "name": "浮月送離",
        "shape": "slash",
        "width": 239,
        "height": 124,
        "offsetY": -23,
        "damage": 29,
        "duration": 0.34,
        "pulses": [
          0.13
        ],
        "cancel": 0.25,
        "knockX": 260,
        "knockY": -90,
        "break": 13,
        "clip": "finish",
        "weight": "light",
        "hint": "空中三連收尾：橫向送離，不無限滯空。",
        "action218": {
          "finisher": true
        }
      },
      "AIRZZX": {
        "name": "雙刃墜月",
        "shape": "down",
        "width": 254,
        "height": 224,
        "offsetY": -34,
        "damage": 38,
        "duration": 0.44,
        "pulses": [
          0.16
        ],
        "cancel": 0.29,
        "knockX": 0,
        "knockY": 560,
        "break": 36,
        "clip": "finish",
        "weight": "heavy",
        "hint": "空中兩次留擊後重劈，一次彈地銜接地面。",
        "action218": {
          "dive": 690,
          "bounce": true,
          "finisher": true
        }
      },
      "AIRXX": {
        "name": "空中斷層",
        "shape": "down",
        "width": 252,
        "height": 184,
        "offsetY": 6,
        "damage": 40,
        "duration": 0.475,
        "pulses": [
          0.201
        ],
        "cancel": 0.338,
        "knockX": 190,
        "knockY": 490,
        "break": 35,
        "clip": "finish",
        "weight": "heavy",
        "hint": "第二次重劈直接終結，不重複彈地。",
        "action218": {
          "dive": 720,
          "finisher": true
        }
      },
      "AIRDZ": {
        "name": "空中踏斬",
        "shape": "down",
        "width": 189,
        "height": 180,
        "offsetY": 25,
        "damage": 18,
        "duration": 0.24,
        "pulses": [
          0.075
        ],
        "cancel": 0.15,
        "knockX": 0,
        "knockY": 280,
        "break": 13,
        "clip": "light",
        "weight": "light",
        "hint": "空中 ↓＋Z 向下踏斬，不自動尋敵。",
        "action218": {
          "dive": 430
        }
      },
      "AIRDX": {
        "name": "垂直墜月",
        "shape": "down",
        "width": 231,
        "height": 224,
        "offsetY": -34,
        "damage": 31,
        "duration": 0.44,
        "pulses": [
          0.16
        ],
        "cancel": 0.29,
        "knockX": 0,
        "knockY": 560,
        "break": 36,
        "clip": "finish",
        "weight": "heavy",
        "hint": "空中 ↓＋X 快速落擊，普通敵人一次彈地。",
        "action218": {
          "dive": 720,
          "bounce": true,
          "finisher": true
        }
      },
      "AIRUZ": {
        "name": "空中截月",
        "shape": "lift",
        "width": 224,
        "height": 230,
        "offsetY": -126,
        "damage": 27,
        "duration": 0.37,
        "pulses": [
          0.14
        ],
        "cancel": 0.274,
        "knockX": 0,
        "knockY": -420,
        "break": 30,
        "clip": "cross",
        "weight": "light",
        "hint": "空中 ↑＋Z 攻擊頭頂，維持短暫高度。",
        "action218": {
          "hover": 0.12
        }
      },
      "AIRUX": {
        "name": "空中逆升",
        "shape": "lift",
        "width": 224,
        "height": 230,
        "offsetY": -126,
        "damage": 34,
        "duration": 0.37,
        "pulses": [
          0.14
        ],
        "cancel": 0.274,
        "knockX": 0,
        "knockY": -420,
        "break": 30,
        "clip": "cross",
        "weight": "heavy",
        "hint": "空中 ↑＋X 上挑收尾，不重置跳躍或空中衝刺。",
        "action218": {
          "hover": 0.1,
          "launcher": true,
          "finisher": true
        }
      },
      "DASHZ": {
        "name": "掠月突刺",
        "shape": "thrust",
        "width": 205,
        "height": 115,
        "offsetY": -28,
        "damage": 24,
        "duration": 0.32,
        "pulses": [
          0.11
        ],
        "cancel": 0.2,
        "knockX": 80,
        "knockY": 0,
        "break": 15,
        "clip": "dash",
        "weight": "light",
        "hint": "→→Z 或 Shift＋Z 突刺，接 Z 壓進、X 挑空。",
        "action218": {
          "travel": 138,
          "moveFrom": 0.015,
          "moveTo": 0.18
        }
      },
      "DASHZZ": {
        "name": "追步返斬",
        "shape": "slash",
        "width": 226,
        "height": 112,
        "offsetY": -28,
        "damage": 24,
        "duration": 0.28,
        "pulses": [
          0.085
        ],
        "cancel": 0.18,
        "knockX": 0,
        "knockY": 0,
        "break": 10,
        "clip": "cut",
        "weight": "light",
        "hint": "衝刺突刺第二拍；接 X 升斬。",
        "action218": {
          "travel": 65,
          "moveFrom": 0.02,
          "moveTo": 0.14
        }
      },
      "DASHZX": {
        "name": "突刺升月",
        "shape": "lift",
        "width": 236,
        "height": 258,
        "offsetY": -164,
        "damage": 32,
        "duration": 0.47,
        "pulses": [
          0.175
        ],
        "cancel": 0.31,
        "knockX": 0,
        "knockY": -590,
        "break": 22,
        "clip": "cross",
        "weight": "light",
        "hint": "衝刺 Z 後 X，自身與敵人一起升空，再接空中 Z。",
        "action218": {
          "rise": -420,
          "launcher": true
        }
      },
      "DASHZZX": {
        "name": "追步昇月",
        "shape": "lift",
        "width": 236,
        "height": 258,
        "offsetY": -164,
        "damage": 36,
        "duration": 0.47,
        "pulses": [
          0.175
        ],
        "cancel": 0.31,
        "knockX": 0,
        "knockY": -650,
        "break": 22,
        "clip": "cross",
        "weight": "light",
        "hint": "衝刺雙 Z 後 X，升空銜接空中追打。",
        "action218": {
          "rise": -420,
          "launcher": true
        }
      },
      "DASHX": {
        "name": "突進升斬",
        "shape": "lift",
        "width": 233,
        "height": 271,
        "offsetY": -190,
        "damage": 32,
        "duration": 0.41,
        "pulses": [
          0.18
        ],
        "cancel": 0.303,
        "knockX": 0,
        "knockY": -570,
        "break": 40,
        "clip": "cross",
        "weight": "heavy",
        "hint": "→→X 或 Shift＋X 突進升空；接空中 Z 留擊。",
        "action218": {
          "travel": 95,
          "moveFrom": 0.02,
          "moveTo": 0.19,
          "rise": -450,
          "launcher": true
        }
      },
      "DASHAIRZ": {
        "name": "空中掠影",
        "shape": "slash",
        "width": 215,
        "height": 124,
        "offsetY": -23,
        "damage": 22,
        "duration": 0.24,
        "pulses": [
          0.075
        ],
        "cancel": 0.15,
        "knockX": 0,
        "knockY": -155,
        "break": 13,
        "clip": "dash",
        "weight": "light",
        "hint": "空中衝刺後 Z 掠斬；仍消耗原本的空中衝刺。",
        "action218": {
          "travel": 105,
          "moveFrom": 0.015,
          "moveTo": 0.16,
          "hover": 0.12
        }
      },
      "DASHAIRZZ": {
        "name": "掠影返刃",
        "shape": "slash",
        "width": 211,
        "height": 124,
        "offsetY": -23,
        "damage": 25,
        "duration": 0.24,
        "pulses": [
          0.08
        ],
        "cancel": 0.17,
        "knockX": 0,
        "knockY": -165,
        "break": 13,
        "clip": "cut",
        "weight": "light",
        "hint": "空中衝刺第二拍；接 X 下劈。",
        "action218": {
          "travel": 48,
          "moveFrom": 0.02,
          "moveTo": 0.12,
          "hover": 0.1
        }
      },
      "DASHAIRZX": {
        "name": "掠影墜月",
        "shape": "down",
        "width": 231,
        "height": 224,
        "offsetY": -34,
        "damage": 36,
        "duration": 0.44,
        "pulses": [
          0.16
        ],
        "cancel": 0.29,
        "knockX": 0,
        "knockY": 560,
        "break": 36,
        "clip": "finish",
        "weight": "heavy",
        "hint": "空中突進 Z 後 X，下劈壓回地面。",
        "action218": {
          "dive": 650,
          "bounce": true,
          "finisher": true
        }
      },
      "DASHAIRZZX": {
        "name": "掠影雙刃墜",
        "shape": "down",
        "width": 254,
        "height": 224,
        "offsetY": -34,
        "damage": 42,
        "duration": 0.44,
        "pulses": [
          0.16
        ],
        "cancel": 0.29,
        "knockX": 0,
        "knockY": 560,
        "break": 36,
        "clip": "finish",
        "weight": "heavy",
        "hint": "空中衝刺雙斬後落擊，一次小彈地。",
        "action218": {
          "dive": 690,
          "bounce": true,
          "finisher": true
        }
      },
      "DASHAIRX": {
        "name": "突降重刃",
        "shape": "down",
        "width": 179,
        "height": 184,
        "offsetY": 6,
        "damage": 33,
        "duration": 0.475,
        "pulses": [
          0.201
        ],
        "cancel": 0.338,
        "knockX": 0,
        "knockY": 490,
        "break": 35,
        "clip": "heavy",
        "weight": "heavy",
        "hint": "空中衝刺後 X，斜向落擊，不穿牆。",
        "action218": {
          "travel": 75,
          "moveFrom": 0.02,
          "moveTo": 0.16,
          "dive": 620
        }
      },
      "ZZXZ": {
        "name": "挑月回鉤",
        "shape": "hook",
        "width": 224,
        "height": 230,
        "offsetY": -126,
        "damage": 27,
        "duration": 0.37,
        "pulses": [
          0.14
        ],
        "cancel": 0.274,
        "knockX": -100,
        "knockY": -250,
        "break": 30,
        "clip": "cross",
        "weight": "light",
        "hint": "挑空後 Z 回鉤；接 X 收束地裂。",
        "action218": {
          "launcher": true
        }
      }
    }
  },
  "swap": {
    "rechargeSeconds": 1.25,
    "groundedDelay": 0.2,
    "airRecharge": false,
    "maximumCapacity": 3
  },
  "skills": {
    "blade": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ],
    "rail": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ],
    "chrono": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ],
    "gravity": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ],
    "spirit": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ],
    "bloom": [
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      },
      {
        "damageScale": 1.0,
        "rangeScale": 1.0,
        "cooldownScale": 1.0
      }
    ]
  },
  "branches": {
    "blade": [
      {
        "id": "moon",
        "name": "月弧劍舞",
        "description": "斬擊與挑月範圍 +20%；重攻擊維持原速度。"
      },
      {
        "id": "cross",
        "name": "折界追刃",
        "description": "成功換位後沿交換線追加 16 傷害；內置冷卻 1 秒。"
      }
    ],
    "rail": [
      {
        "id": "focus",
        "name": "貫星狙線",
        "description": "射線寬度 +35%，穿透上限至少 6；仍會被實牆阻擋。"
      },
      {
        "id": "scatter",
        "name": "星雨分流",
        "description": "C 追加兩道偏轉射線，各 10 傷害；不自動追蹤。"
      }
    ],
    "chrono": [
      {
        "id": "tempo",
        "name": "短拍循環",
        "description": "本流派五招冷卻 ×0.85；既視感 F 不受影響。"
      },
      {
        "id": "echo",
        "name": "延遲和聲",
        "description": "C 於 0.48 秒後在起手位置再爆發 16 傷害。"
      }
    ],
    "gravity": [
      {
        "id": "well",
        "name": "深井聚星",
        "description": "引力場半徑 +20%，持續 +0.5 秒；不強控頭目。"
      },
      {
        "id": "orbit",
        "name": "護環軌道",
        "description": "施放 V 或成功換位獲得 14 護盾；內置冷卻 3 秒。"
      }
    ],
    "spirit": [
      {
        "id": "hunter",
        "name": "逐獵靈契",
        "description": "C 追加一次 14 傷害的契靈協擊；不對已死目標追傷。"
      },
      {
        "id": "guardian",
        "name": "守望靈契",
        "description": "成功施放 B 獲得 22 護盾，護盾總上限 45。"
      }
    ],
    "bloom": [
      {
        "id": "growth",
        "name": "繁生培床",
        "description": "菌床持續 +1.5 秒；B 同時生成限時可站立藤台。"
      },
      {
        "id": "rupture",
        "name": "相變爆芽",
        "description": "N 消耗附近菌床時，追加一次半徑 170、傷害 18 的火焰爆裂。"
      }
    ]
  },
  "gear": [
    {
      "id": "moonEdge",
      "name": "折月長刃",
      "slot": "weapon",
      "icon": "crescent",
      "effect": "lightReach",
      "value": 1.18,
      "description": "輕擊範圍 +18%；輕擊傷害不變。適合貼邊確認與空中接段。",
      "cost": {
        "echo": 6,
        "glass": 2
      },
      "starter": true
    },
    {
      "id": "riftBreaker",
      "name": "裂甲重鋒",
      "slot": "weapon",
      "icon": "impact",
      "effect": "heavyBreak",
      "value": 1.45,
      "description": "重擊破勢 ×1.45、傷害 ×1.12；重擊總時長 +0.06 秒。",
      "cost": {
        "echo": 8,
        "dust": 2
      },
      "starter": true
    },
    {
      "id": "starNeedle",
      "name": "浮星針匣",
      "slot": "weapon",
      "icon": "bolt",
      "effect": "orbitHit",
      "value": 12,
      "description": "每三次有效 Command 命中追加一道 12 傷害浮游射線，內置冷卻 0.7 秒。",
      "cost": {
        "echo": 12,
        "glass": 3
      }
    },
    {
      "id": "chronicle",
      "name": "遲鳴刻刃",
      "slot": "weapon",
      "icon": "star",
      "effect": "delayedHeavy",
      "value": 14,
      "description": "重擊命中後 0.28 秒在該位置追加 14 傷害；每 1 秒最多觸發一次。",
      "cost": {
        "echo": 12,
        "dust": 3
      }
    },
    {
      "id": "wardSpindle",
      "name": "回環護梭",
      "slot": "relic",
      "icon": "gate",
      "effect": "swapShield",
      "value": 18,
      "description": "成功換位獲得 18 護盾，內置冷卻 4 秒；護盾總上限 45。",
      "cost": {
        "echo": 6,
        "glass": 2
      },
      "starter": true
    },
    {
      "id": "bloodThread",
      "name": "回生絲線",
      "slot": "relic",
      "icon": "bloom",
      "effect": "lifesteal",
      "value": 0.06,
      "description": "真實傷害吸血 6%，單次最多 3 HP，內置冷卻 0.7 秒；訓練晶核與殘響不能觸發。",
      "cost": {
        "echo": 10,
        "dust": 2
      }
    },
    {
      "id": "orbitLens",
      "name": "伴星稜鏡",
      "slot": "relic",
      "icon": "sigil",
      "effect": "satellite",
      "value": 10,
      "description": "施放 C/V/B/N 時，向 320 內可見最近敵人射出 10 傷害副砲；冷卻 1 秒。",
      "cost": {
        "echo": 10,
        "glass": 4
      }
    },
    {
      "id": "anchorCharm",
      "name": "泊岸錨環",
      "slot": "relic",
      "icon": "gate",
      "effect": "groundRefill",
      "value": 0.75,
      "description": "落地回充時間 ×0.75；不增加容量，不允許空中回充。",
      "cost": {
        "echo": 8,
        "glass": 3
      }
    },
    {
      "id": "tonic",
      "name": "潮汐修復瓶",
      "slot": "consumable",
      "icon": "bloom",
      "effect": "heal",
      "value": 45,
      "description": "回復 45 HP；戰鬥可用，共用使用冷卻 8 秒。",
      "cost": {
        "echo": 3,
        "glass": 1
      }
    },
    {
      "id": "grounding",
      "name": "定序粉末",
      "slot": "consumable",
      "icon": "star",
      "effect": "stability",
      "value": 15,
      "description": "時間與空間失控各 -15；不能取消已進入攻擊的魔物，共用使用冷卻 8 秒。",
      "cost": {
        "echo": 4,
        "dust": 1
      }
    }
  ],
  "world": {
    "biomes": [
      {
        "id": "sky",
        "name": "天空回廊",
        "tag": "觸及世界的頂點",
        "regions": [
          "lighthouse",
          "x17_sky",
          "f19_cloud",
          "f19_moon"
        ],
        "pin": [
          0.52,
          0.19
        ]
      },
      {
        "id": "city",
        "name": "中央城區",
        "tag": "人類最後的燈火",
        "regions": [
          "market",
          "x17_metro",
          "f19_mercury"
        ],
        "pin": [
          0.48,
          0.46
        ]
      },
      {
        "id": "coast",
        "name": "潮聲海岸",
        "tag": "破碎與重生之地",
        "regions": [
          "tide",
          "f19_mangrove",
          "f19_coral"
        ],
        "pin": [
          0.65,
          0.66
        ]
      },
      {
        "id": "fungi",
        "name": "菌核森林",
        "tag": "生命在黑暗中綻放",
        "regions": [
          "roots",
          "canopy",
          "f19_protospores",
          "f19_silicon",
          "f19_amber",
          "f19_necroot",
          "f19_fossil"
        ],
        "pin": [
          0.8,
          0.23
        ]
      },
      {
        "id": "industry",
        "name": "紅鏽工業區",
        "tag": "鋼鐵與熱的殘響",
        "regions": [
          "reactor",
          "foundry",
          "x17_inferno",
          "f19_basalt",
          "f19_magforge",
          "x17_dune",
          "f19_sirocco",
          "f19_salt",
          "f19_glass"
        ],
        "pin": [
          0.86,
          0.48
        ]
      },
      {
        "id": "shadow",
        "name": "影之迴廊",
        "tag": "被遺忘的鏡像世界",
        "regions": [
          "archive",
          "secret",
          "vision",
          "x17_umbra",
          "f19_ink",
          "f19_clockfen",
          "f19_starrift",
          "f19_geode"
        ],
        "pin": [
          0.17,
          0.74
        ]
      },
      {
        "id": "ocean",
        "name": "海底遺都",
        "tag": "靜默的過往",
        "regions": [
          "x17_reef",
          "x17_abyss",
          "f19_naos",
          "f19_whalefall"
        ],
        "pin": [
          0.47,
          0.86
        ]
      },
      {
        "id": "snow",
        "name": "極寒雪原",
        "tag": "冰封的試煉",
        "regions": [
          "x17_glacier",
          "f19_rime",
          "f19_aurora",
          "f19_dreamsnow"
        ],
        "pin": [
          0.86,
          0.85
        ]
      }
    ],
    "roomPatches": [
      {
        "id": "r01",
        "note": "沿潮濕林廊前進；新增的三座踏台可練習跳躍、錨點與落地回充。",
        "platforms": [
          {
            "id": "coast_step_a",
            "x": 230,
            "floorOffset": -118,
            "w": 150,
            "h": 18,
            "modes": [
              "now",
              "past",
              "future",
              "inner",
              "heavy",
              "invert",
              "elastic",
              "fungal",
              "decay"
            ]
          },
          {
            "id": "coast_step_b",
            "x": 410,
            "floorOffset": -235,
            "w": 145,
            "h": 18,
            "modes": [
              "now",
              "past",
              "future",
              "inner",
              "heavy",
              "invert",
              "elastic",
              "fungal",
              "decay"
            ]
          },
          {
            "id": "coast_hidden",
            "x": 590,
            "floorOffset": -330,
            "w": 160,
            "h": 18,
            "modes": [
              "inner"
            ]
          }
        ],
        "spawns": []
      }
    ]
  },
  "enemies": {
    "slime": {
      "hpScale": 1,
      "damageScale": 1,
      "speedScale": 1
    }
  },
  "limits": {
    "fx": 70,
    "fields": 28,
    "queue": 40,
    "nearbyEnemies": 72
  },
  "notes": "Change data here or use editor.html. Runtime edits export a replacement JS file; a static website cannot overwrite repository files."
};
