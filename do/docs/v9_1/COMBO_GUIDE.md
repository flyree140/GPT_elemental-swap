# Z / X Command 與接招指南

## 基礎分支

| 指令 | 功能定位 |
|---|---|
| Z / ZZ / ZZZ / ZZZZ | 快攻主線，最後一下擊退收尾 |
| ZX | 快轉重，較早打出硬直 |
| ZZX | 逆界挑空，空中追擊入口 |
| ZZZX | 長距離終結分支 |
| ZXX | 破防分支 |
| ZXZ | 假動作後回到快攻 |
| X / XX / XXX | 重攻主線，KD 與 BREAK 較高 |
| XZ / XZZ | 重轉快追擊 |
| XZX | 破陣穿身，移到目標另一側 |
| XXZ | 震波追擊，適合接技能 |

## 方向分支

- `↑Z`：上挑、低高度起手。
- `↑X`：強挑空。
- `↓Z`：掃腿、壓低敵人。
- `↓X`：地面震擊／倒地追擊。
- `→Z / →X`：向前位移攻擊。
- `←Z / ←X`：後撤反擊或轉身攻擊。

## 位移分支

- `Shift → Z`：Dash 快攻。
- `Shift → X`：Dash 重攻／破陣。
- `Air Z / Air ZZ`：空中維持。
- `Air X`：下砸。
- `Air ↑Z`：空中上升追擊。
- `Air ↓X`：高速墜落與 Ground Bounce。

## 接招範例

### 初學浮空

```text
Z → Z → X
跳躍
Air Z → Air Z
Air X
```

### 換位追擊

```text
Z → Z → X 挑空
按 2 發射冰
空中 Z
再按 2 換到冰錨點
Air X 收尾
```

### 元素地形 Combo

```text
冰換位生成平台
→X 穿身
火換位雙爆炸
C 技能取消
```

### Boss BREAK

```text
X → X → Z
↑X
V
岩元素命中
Dash X
BREAK 後 B 終結
```

## 系統參數

Command 資料在 `js/game.js` 的 `ATT` 表：

- `dur`：整招時間。
- `hit`：Active Frame 時間。
- `cancel`：取消窗口。
- `damage`：傷害。
- `kx / ky`：擊退與浮空。
- `kd`：倒地累積。
- `break`：Boss BREAK 傷害。

調手感時不要只改傷害。最重要的是 `hit`、`cancel`、Hit Stop、位移與敵人反應同步。
