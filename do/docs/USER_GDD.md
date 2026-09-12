可以。以下我直接把前面討論的概念整合成一份**可以拿去做遊戲開發、募資簡報、團隊討論的正式 GDD**。我會把重點放在「**時間／世界規則切換＋元素子彈＋位置交換＋Hit-stop**」，並且特別針對 **Web 版**設計操作。

# 《Chrono Shift：時界獵人》

## Chrono Shift: Timebound Hunter

**遊戲類型：** 2D 橫向卷軸動作射擊 × 時間解謎 × RPG
**平台：** Web Browser / PC
**技術方向：** Phaser 3 + TypeScript
**遊戲模式：** 單人為主，後續可擴充挑戰模式
**視角：** 2D Side-Scrolling
**核心特色：**

> **看見過去，改變現在。**
> **預見未來，利用未來。**
> **子彈不是武器，而是改變世界的能力。**

---

# 一、遊戲概念

玩家扮演一名能夠觀測「不同世界狀態」的時界法師。

玩家並不是單純地在一張固定地圖上前進，而是可以透過「時界切換」觀察同一個位置在不同狀態下的樣貌。

例如：

**過去**

一棵樹還沒有倒下。

↓

玩家切換至現在

↓

樹已經倒下，可以作為平台。

↓

玩家切換至未來

↓

樹木腐朽消失，露出地下通道。

因此：

**「切換世界狀態」本身就是移動、解謎與戰鬥的一部分。**

---

# 二、核心創新

本遊戲不希望只是：

> 「按一下按鈕 → 畫面變成另一種顏色。」

而是：

> **「按一下按鈕 → 遊戲規則本身發生變化。」**

因此，每一種 Vision / Sight 都必須具備至少一個獨立玩法。

例如：

| Vision功能        |           |
| --------------- | --------- |
| Time Sight      | 過去／現在／未來  |
| Soul Sight      | 身體／靈魂雙層世界 |
| Space Sight     | 位置、傳送、交換  |
| Causality Sight | 預測互動結果    |
| Rule Sight      | 改變子彈與世界規則 |

玩家最後不是在「切換濾鏡」。

而是在：

> **切換世界的運作方式。**

---

# 三、核心 Gameplay Loop

遊戲最核心的循環：

```text
探索
 ↓
觀察世界
 ↓
切換 Vision
 ↓
發現弱點 / 隱藏道路
 ↓
選擇元素子彈
 ↓
攻擊
 ↓
Hit-stop
 ↓
短暫時間停滯
 ↓
玩家調整下一步
 ↓
Swap / Vision / 技能連段
 ↓
擊敗敵人
 ↓
獲得經驗
 ↓
技能成長
 ↓
解鎖新的世界能力
 ↓
進入新的區域
```

遊戲希望讓玩家產生：

> 「如果我換一個世界狀態會怎樣？」

而不是：

> 「我要一直按攻擊。」

---

# 四、戰鬥核心系統

## 4.1 基本戰鬥

玩家主要使用：

- 移動
- 跳躍
- 射擊
- Vision 切換
- Swap
- 元素切換
- 時間能力

進行戰鬥。

基本戰鬥不是單純 DPS，而是：

**「利用敵人的位置與狀態完成擊殺。」**

---

# 五、Hit-stop 核心系統

這是本遊戲非常重要的手感系統。

當玩家成功命中敵人時：

```text
子彈命中
   ↓
碰撞確認
   ↓
0.05～0.15 秒 Hit-stop
   ↓
畫面瞬間停頓
   ↓
音效 / 特效 / Camera Shake
   ↓
玩家感受到「命中了」
   ↓
恢復遊戲
```

## Hit-stop 強度

| 攻擊類型Hit-stop  |             |
| ------------- | ----------- |
| 普通攻擊          | 0.04 秒      |
| 元素攻擊          | 0.06 秒      |
| Critical      | 0.08～0.10 秒 |
| Heavy Attack  | 0.10～0.12 秒 |
| Boss Critical | 0.12～0.15 秒 |

不建議所有攻擊固定 0.15 秒。

否則遊戲會變得「卡」。

應該讓玩家感覺：

> **「停頓不是延遲，而是力量。」**

---

# 六、Time-stop 戰鬥機制

Hit-stop 可以進一步成為遊戲特色：

## 「時間停滯視窗」

當玩家造成高品質攻擊時，世界短暫停止。

例如：

```text
玩家射擊
     ↓
命中
     ↓
【TIME STOP】
0.15 sec
     ↓
玩家可以快速決定：
     ↓
切換 Vision
     ↓
Swap
     ↓
改變子彈
     ↓
繼續攻擊
```

因此玩家可能完成：

```text
Fire Bullet
    ↓
命中
    ↓
Hit-stop
    ↓
切換 Future
    ↓
Swap Enemy
    ↓
Ice Bullet
    ↓
Freeze
```

形成高速連段。

---

# 七、Perfect Time 系統

如果玩家在敵人攻擊的瞬間命中，可以觸發：

## PERFECT TIME

條件：

```text
敵人攻擊判定
      ↓
玩家在極短時間內命中
      ↓
Perfect Time
```

效果：

- 更長 Hit-stop
- 免費 Vision 切換
- 部分技能不消耗資源
- 敵人短暫進入破綻
- Combo 倍率增加

例如：

```text
Enemy Attack
      ↓
Perfect Hit
      ↓
TIME STOP
      ↓
Future Vision
      ↓
Swap
      ↓
背後攻擊
      ↓
Critical
```

這會成為遊戲高階玩家的核心技巧。

---

# 八、Vision 世界系統

## 8.1 Time Sight

最初始、最核心的 Vision。

### Past

看到：

- 舊道路
- 未倒塌的橋
- 年輕的植物
- 尚未死亡的 NPC
- 尚未損壞的機械

### Present

目前世界。

### Future

看到：

- 崩塌道路
- 新植物
- 腐朽建築
- 新敵人
- 隱藏道路

---

# 九、第二階段 Vision：Soul Sight

世界分成：

```text
Physical World
       +
Soul World
```

例如：

敵人肉體在左邊。

但靈魂在右邊。

普通子彈：

> 攻擊肉體

Soul Bullet：

> 攻擊靈魂

Swap：

> 可以交換玩家與靈魂位置。

因此：

```text
Enemy Body
    ●

Enemy Soul
          ●

Soul Sight
     ↓

玩家可以看到兩者

     ↓

攻擊 Soul

     ↓

Enemy Body 受到傷害
```

這會讓戰鬥出現新的空間層次。

---

# 十、第三階段 Vision：Causality Sight

玩家看到：

> 「如果我碰這個東西，接下來可能發生什麼。」

例如：

一顆石頭。

普通狀態：

```text
Stone
```

Causality Sight：

```text
Stone
 ↓
推倒
 ↓
砸中敵人
 ↓
敵人死亡
 ↓
打開門
```

玩家可以提前看到結果。

但不是百分之百預言。

而是：

**「可能性」。**

這可以形成風險／收益玩法。

---

# 十一、Rule Sight

最終 Vision。

不是觀察世界。

而是：

> **改變世界規則。**

例如：

### Normal Rule

```text
子彈 → 敵人
```

### Reverse Rule

```text
子彈 → 反方向
```

### Echo Rule

```text
一發子彈
↓
產生第二發殘影
```

### Swap Rule

```text
命中
↓
交換位置
```

### Gravity Rule

```text
重力 ↓

切換

重力 ↑
```

Rule Sight 是後期最強的能力。

---

# 十二、元素子彈系統

玩家可以切換不同類型子彈。

## Fire

功能：

- 燃燒
- 持續傷害
- 點燃環境
- 融化冰
- 引爆可燃物

---

## Ice

功能：

- 冰凍
- 減速
- 製造平台
- 凍結水面
- 暫停部分敵人技能

---

## Lightning

功能：

- Chain Damage
- 啟動機械
- 電擊敵人
- 傳導電流

---

## Gravity

功能：

- 拉近敵人
- 推開敵人
- 改變重力
- 將敵人吸到牆壁

---

## Swap

特殊子彈。

不是造成大量傷害。

而是：

> **交換位置。**

可以：

```text
Player ↔ Enemy

Enemy A ↔ Enemy B

Player ↔ Object

Object A ↔ Object B
```

這是遊戲最重要的戰術能力之一。

---

# 十三、子彈融合系統

後期可以解鎖：

## Fire + Ice

### Steam Bullet

爆炸後形成：

- 蒸氣
- 視線遮蔽
- 短暫減速

---

## Lightning + Swap

### Teleport Lightning

命中敵人：

```text
Lightning Damage
+
Position Swap
```

玩家瞬間出現在敵人位置。

---

## Fire + Swap

### Explosive Swap

交換位置瞬間爆炸。

---

## Gravity + Swap

### Gravity Swap

敵人被拉向玩家原本的位置。

形成群體控制。

---

# 十四、核心戰鬥流程

## 戰鬥標準流程

### Phase 1：Observe

先觀察敵人。

```text
Enemy
 ↓
切換 Vision
 ↓
尋找弱點
```

---

### Phase 2：Prepare

選擇：

- Vision
- Bullet
- 位置

---

### Phase 3：Engage

開始攻擊。

```text
Normal Shot
 ↓
Element
 ↓
Enemy Stagger
```

---

### Phase 4：Hit-stop

命中後：

```text
STOP
```

玩家快速決策。

---

### Phase 5：Combo

例如：

```text
Fire
 ↓
Hit
 ↓
Hit-stop
 ↓
Swap
 ↓
Ice
 ↓
Freeze
 ↓
Gravity
 ↓
Pull
 ↓
Lightning
```

---

### Phase 6：Finish

敵人進入：

**Break / Execute**

玩家使用高傷害技能完成擊殺。

---

# 十五、敵人設計

敵人不應該只有：

> 血量 100 → 被打死。

而應該具有「世界狀態」。

例如：

## Time Zombie

Past：

> 普通人類

Present：

> Zombie

Future：

> 骨骸

玩家可以利用：

```text
Past → 弱

Present → 普通

Future → 快速但脆弱
```

---

## Soul Enemy

身體與靈魂位置不同。

必須使用 Soul Sight。

---

## Swap Enemy

會主動與玩家交換位置。

讓玩家不能一直使用 Swap。

---

## Time Eater

可以：

- 吃掉時間
- 加速玩家
- 減速玩家
- 反轉部分攻擊

是後期敵人。

---

# 十六、Boss 設計

## Boss：Time Devourer

Boss 同時存在：

```text
Past
Present
Future
```

三個狀態。

玩家不能只攻擊現在。

必須：

```text
觀察
 ↓
切換時間
 ↓
找出 Boss 三個狀態的關聯
 ↓
破壞其中一個狀態
 ↓
造成時間裂痕
 ↓
攻擊本體
```

Boss 戰會成為遊戲特色展示。

---

# 十七、RPG 成長系統

玩家獲得：

**Chrono XP**

升級後取得：

**Chrono Point**

用於技能樹。

技能不只是：

> +10% Damage

而是盡可能：

> **解鎖新的玩法。**

---

# 十八、技能樹總架構

```text
                    【Chronomancer】
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       TIME TREE        COMBAT TREE      SPACE TREE
          │                │                │
      時間能力          元素能力          Swap能力
          │                │                │
          └────────────────┼────────────────┘
                           │
                     【MASTER TREE】
                           │
                     Rule Sight
```

---

# 十九、TIME 技能樹

## Tier 1

### Time Vision

解鎖：

Past / Present / Future

---

### Time Sense

敵人攻擊前出現短暫提示。

---

## Tier 2

### Extended Time

Vision 持續時間增加。

---

### Rewind

讓部分敵人回到數秒前的位置。

---

### Accelerate

加速：

- 植物
- 機關
- 特定敵人

---

## Tier 3

### Time Stop

主動停止世界 0.5 秒。

---

### Perfect Time

成功 Perfect Hit：

免費進入 Time Stop。

---

## Tier 4

### Temporal Clone

產生數秒前自己的殘影。

殘影會重複之前的攻擊。

---

# 二十、ELEMENT 技能樹

```text
Element Mastery
       │
 ┌─────┼─────┬─────┐
Fire  Ice Lightning Gravity
```

### Fire

- Burn
- Explosion
- Chain Burn
- Inferno

### Ice

- Slow
- Freeze
- Ice Platform
- Absolute Zero

### Lightning

- Chain
- Overload
- EMP
- Thunder Field

### Gravity

- Pull
- Push
- Gravity Field
- Reverse Gravity

---

# 二十一、SPACE / SWAP 技能樹

這棵技能樹是遊戲最具特色的部分。

### Tier 1

**Enemy Swap**

玩家 ↔ 敵人。

---

### Tier 2

**Object Swap**

玩家 ↔ 物件。

---

### Tier 3

**Enemy Chain Swap**

一次連續交換多個敵人。

```text
A ↔ B
B ↔ C
C ↔ Player
```

---

### Tier 4

**Swap Mark**

先標記兩個目標。

之後可以：

> 隨時交換。

---

### Tier 5

**Quantum Swap**

一次交換：

```text
Player
Enemy A
Enemy B
Object
```

形成四點空間重排。

---

# 二十二、MASTER 技能樹

最終技能。

## Rule Breaker

允許玩家短時間修改世界規則。

例如：

```text
Rule:
Gravity Down

↓

Rule Break

↓

Gravity Right
```

---

## Reality Rewrite

玩家可以讓某些物件：

> 「重新定義自己的狀態。」

例如：

```text
死亡樹

↓

Reality Rewrite

↓

活著的樹
```

這會成為終局解謎能力。

---

# 二十三、Build 系統

玩家可以形成不同流派。

## Time Build

特色：

> 控制時間

核心：

- Rewind
- Time Stop
- Perfect Time
- Temporal Clone

---

## Swap Build

特色：

> 空間操作

核心：

- Enemy Swap
- Chain Swap
- Swap Mark
- Quantum Swap

---

## Element Build

特色：

> 元素爆發

核心：

- Fire
- Ice
- Lightning
- Gravity

---

## Control Build

特色：

> 控場

核心：

- Freeze
- Gravity
- Time Slow
- Soul Control

---

# 二十四、地圖設計

每張地圖不是只有：

```text
左 → 右
```

而是：

```text
左
 ↓
探索
 ↓
Vision
 ↓
找到不同世界
 ↓
解謎
 ↓
戰鬥
 ↓
取得新能力
 ↓
回到之前區域
 ↓
發現新的道路
 ↓
Boss
```

因此地圖具備 Metroidvania 的部分結構。

---

# 二十五、第一張地圖

## Area 01：Time Forest

主題：

> 一座正在死亡的森林。

包含：

- Past Forest
- Present Forest
- Future Forest

---

### Past

森林茂密。

有：

- 樹橋
- NPC
- 小動物
- 古代機關

---

### Present

森林開始腐朽。

出現：

- 敵人
- 倒塌道路
- 廢棄設施

---

### Future

森林死亡。

出現：

- 骨骸
- 地下入口
- 未來機械
- 時間怪物

---

# 二十六、Web 版 UI

Web 版原則：

> **不用滑鼠也能完整遊玩。**

推薦：

### 鍵盤

```text
             W
             ↑
        A ←     → D

          SPACE
```

---

# 二十七、PC 操作配置

| 按鍵功能  |             |
| ----- | ----------- |
| A / ← | 左移          |
| D / → | 右移          |
| W / ↑ | 跳躍          |
| S / ↓ | 下蹲 / 下落     |
| J     | 普通攻擊        |
| K     | 特殊攻擊        |
| L     | Swap        |
| Q     | Vision 切換   |
| E     | Vision 快速能力 |
| 1     | Fire        |
| 2     | Ice         |
| 3     | Lightning   |
| 4     | Gravity     |
| 5     | Swap        |
| Shift | Dash        |
| Space | Jump        |
| ESC   | 暫停          |

滑鼠：

```text
Mouse
 ↓
瞄準方向
```

左鍵：

> 射擊

右鍵：

> Vision

---

# 二十八、推薦最終操作

實際開發時可以進一步簡化：

```text
WASD
    ↓
移動

SPACE
    ↓
跳躍

Mouse
    ↓
瞄準

LMB
    ↓
射擊

RMB
    ↓
Vision

Q
    ↓
切換 Vision

E
    ↓
Swap

1~5
    ↓
子彈
```

這樣玩家不需要記太多技能鍵。

---

# 二十九、戰鬥 HUD

畫面：

```text
┌──────────────────────────────────────────────┐
│ HP ████████████         TIME ████████        │
│                                              │
│                                              │
│                 PLAYER                       │
│                    ●                         │
│                 /     \                      │
│                                              │
│                         ENEMY                │
│                           ●                  │
│                                              │
│                                              │
│                                              │
│  [1]🔥 [2]❄️ [3]⚡ [4]🌀 [5]◇                │
│                                              │
│  Vision: ⏳ FUTURE                            │
│                                              │
│  XP ████████████                             │
└──────────────────────────────────────────────┘
```

---

# 三十、Vision UI

右上角顯示：

```text
VISION

◀ PAST
● PRESENT
▶ FUTURE
```

切換時：

```text
TIME SHIFT
```

畫面短暫產生：

- Chromatic aberration
- 時間殘影
- 畫面扭曲
- 音效低頻
- 0.05 秒畫面停頓

增加「切換世界」的重量感。

---

# 三十一、Hit-stop UI / VFX

玩家命中：

```text
          HIT!
           ×
        CRITICAL
```

同時：

```text
Game Time → 0
Camera Shake
White Flash
Particle Burst
Sound Impact
```

如果是 Perfect Time：

```text
╔══════════════════╗
       PERFECT
        TIME
╚══════════════════╝
```

然後整個世界停頓。

---

# 三十二、死亡與重試

避免 Web 遊戲等待時間過長。

玩家死亡：

```text
DEAD

[SPACE] Retry
[R] Restart Area
[ESC] Menu
```

重試時間：

**盡量 < 3 秒。**

---

# 三十三、Web 技術架構

第一版：

```text
Browser
   │
   ▼
Phaser 3
   │
   ├── Player
   ├── Enemy
   ├── Bullet
   ├── Vision System
   ├── Time System
   ├── Hit-stop System
   ├── Skill System
   └── Map System
```

推薦：

```text
TypeScript
+
Phaser 3
+
Vite
```

---

# 三十四、程式架構

```text
src/
│
├── main.ts
│
├── scenes/
│   ├── BootScene.ts
│   ├── MenuScene.ts
│   ├── GameScene.ts
│   └── UIScene.ts
│
├── player/
│   ├── Player.ts
│   ├── PlayerController.ts
│   └── PlayerCombat.ts
│
├── combat/
│   ├── Bullet.ts
│   ├── BulletManager.ts
│   ├── HitStop.ts
│   ├── DamageSystem.ts
│   └── ComboSystem.ts
│
├── vision/
│   ├── VisionManager.ts
│   ├── TimeVision.ts
│   ├── SoulVision.ts
│   ├── SpaceVision.ts
│   └── RuleVision.ts
│
├── enemies/
│   ├── Enemy.ts
│   ├── TimeEnemy.ts
│   ├── SoulEnemy.ts
│   └── Boss.ts
│
├── skills/
│   ├── SkillTree.ts
│   └── SkillManager.ts
│
├── world/
│   ├── TimeWorld.ts
│   ├── MapManager.ts
│   └── ObjectState.ts
│
└── data/
    ├── weapons.json
    ├── enemies.json
    └── skills.json
```

---

# 三十五、MVP 開發範圍

第一版不要一次做完整遊戲。

## MVP 版本

只做：

### 一張地圖

**Time Forest**

### 三種世界

- Past
- Present
- Future

### 三種子彈

- Normal
- Fire
- Swap

### 三種敵人

- Normal Enemy
- Time Enemy
- Swap Enemy

### 一個 Boss

Time Devourer

### 成長

Level 1～10

### 技能

約 15 個。

---

# 三十六、MVP 核心 Demo

玩家進入森林。

看到：

```text
一座斷橋
```

切換 Past：

```text
橋完整
```

玩家通過。

切回 Present：

```text
橋斷掉
```

前方出現敵人。

玩家：

```text
Fire Bullet
 ↓
命中
 ↓
Hit-stop
 ↓
Swap
 ↓
瞬間移動到敵人背後
 ↓
攻擊
```

敵人死亡。

玩家取得 XP。

解鎖：

```text
Time Rewind
```

然後遇到：

```text
Future Door
```

玩家第一次意識到：

> **「原來時間不只是看風景，而是遊戲的工具。」**

---

# 三十七、遊戲體驗目標

希望玩家在遊戲中產生四種感覺。

## ① 爽

來自：

- Hit-stop
- Critical
- Combo
- Particle
- Camera Shake

---

## ② 聰明

來自：

- Vision
- Swap
- 時間解謎
- Causality

---

## ③ 成長

來自：

- Skill Tree
- New Vision
- New Bullet
- New Combo

---

## ④ 驚喜

玩家看到：

> 「原來這個東西切換世界後會變成這樣？」

這是本遊戲最重要的探索感。

---

# 三十八、遊戲核心設計哲學

本遊戲的能力設計遵守：

> **不要只增加數值，要增加可能性。**

例如：

錯誤：

```text
Fire Lv1 = 100 Damage

Fire Lv2 = 120 Damage

Fire Lv3 = 150 Damage
```

較好的設計：

```text
Fire Lv1
→ 燃燒

Fire Lv2
→ 點燃環境

Fire Lv3
→ 燃燒可以連鎖

Fire Lv4
→ 可以與 Swap 融合

Fire Lv5
→ 可以改變地圖
```

玩家不是變成：

> 「數值比較大的角色。」

而是：

> **「可以做以前做不到的事情。」**

---

# 三十九、遊戲最終核心

整個遊戲可以濃縮成：

```text
              ┌───────────┐
              │   VISION  │
              └─────┬─────┘
                    ↓
             看見不同世界
                    ↓
              找到解法 / 弱點
                    ↓
              ┌─────┴─────┐
              ↓           ↓
          ELEMENT       SWAP
              ↓           ↓
              └─────┬─────┘
                    ↓
                 ATTACK
                    ↓
                HIT-STOP
                    ↓
             PERFECT TIME
                    ↓
             時間／空間連段
                    ↓
                 KILL
                    ↓
                XP / SKILL
                    ↓
              新能力 / 新世界
                    ↓
                  探索
```

---

# 四十、遊戲一句話定位

### 玩家版

> **一款可以切換世界規則的 2D 時間射擊遊戲。**

### 宣傳版

> **Switch the world. Rewrite the fight.**

### 中文宣傳語

> **「切換世界，改寫戰鬥。」**

### 核心標語

> **「看見過去，利用未來，改變現在。」**

---

# 四十一、第一階段開發優先順序

不建議一開始做完整技能樹。

應按照：

```text
① Player Movement
       ↓
② Shooting
       ↓
③ Enemy
       ↓
④ Hit-stop
       ↓
⑤ Swap
       ↓
⑥ Time Vision
       ↓
⑦ Past/Present/Future 地圖
       ↓
⑧ Element Bullet
       ↓
⑨ Skill Tree
       ↓
⑩ Boss
       ↓
⑪ UI
       ↓
⑫ Save
```

其中真正要先驗證的是：

# 「Movement + Shooting + Swap + Hit-stop」

因為這四個系統如果不好玩，後面加再多 Vision 都沒有意義。

---

# 四十二、第一個可玩 Demo 的目標

玩家打開網頁後：

```text
START
 ↓
進入森林
 ↓
可以左右移動
 ↓
跳躍
 ↓
射擊
 ↓
敵人出現
 ↓
射擊命中
 ↓
Hit-stop
 ↓
使用 Swap
 ↓
切換 Past / Present / Future
 ↓
利用環境擊殺敵人
 ↓
進入 Boss
```

**只要這個 5～10 分鐘 Demo 能讓玩家覺得「有趣」，就值得繼續做完整遊戲。**

---

# 四十三、正式產品定位

《Chrono Shift：時界獵人》不是單純的：

- 橫向射擊遊戲
- 時間遊戲
- 解謎遊戲
- RPG

而是將四者結合：

> **「世界切換」負責解謎。**
> **「元素子彈」負責戰鬥。**
> **「Swap」負責空間操作。**
> **「Hit-stop」負責戰鬥手感。**
> **「Skill Tree」負責長期成長。**

最終形成：

# 「觀察 → 改變規則 → 戰鬥 → 連段 → 成長 → 再探索」

的核心循環。

這份已經可以直接當作**第一版正式 GDD**。下一步最適合不是繼續堆設定，而是直接把 **MVP 做出來**：我會建議先做「**一張 Time Forest + Past/Present/Future + 移動/射擊 + Swap + 0.15 秒 Hit-stop**」，先把最重要的遊戲手感跑起來。