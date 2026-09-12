# V9.1 修正說明

## 問題一：跳躍／跑步時人物破圖

### 根本原因

舊玩家 Sprite Sheet 的動畫列雖然由程式當作 `48 × 52px` frame 讀取，但人物某些身體像素實際跨越了 frame 邊界。當程式切換至 Run 或 Jump row 時，頭、軀幹、腳會從不同列被截取，造成：

- 走路只剩頭和腳。
- 跳躍時身體分成上下兩半。
- Dash 殘影偶爾抽到別列的身體片段。

### 修正

- 重新生成 7 套人形職業 Sprite Sheet。
- 每一幀都在自己的 `48 × 52px` 區域內完成繪製。
- `drawPlayer()` 對 row / frame 做 clamp，禁止 source rectangle 超出圖片。
- 殘影儲存建立當下的 row 與 frame。
- 用 Chromium 分別強制顯示 Idle、Run、Jump、Fall 並截圖驗證。

## 問題二：17 種怪物只剩部分種類

### 根本原因

怪物資料表有 17 種，但房間生成是依區域與房間 art index 挑選。某些版本的房間分布剛好不會抽到全部種類，因此圖鑑和實際遭遇數量不一致。

### 修正

- 保留原本依生態區分布的程序配置。
- 另外加入「最低遭遇保證表」。
- 啟動時檢查 17 種一般怪物；只對完全未出現的種類，在合理房間補上一隻。
- 不把訓練傀儡與 Boss 算進 17 種。

瀏覽器驗證結果：

```text
normalConfigCount = 17
spawnedTypeCount = 17
enemyAssetCount = 18  // 17 種一般怪物 + 1 Boss
```

## 問題三：Boss 館有房間但看不到 Boss

### 根本原因

Boss 生成與 Boss 房進入事件分開，舊版在部分流程中只切換到房間，沒有保證 Boss 已初始化、甦醒、取消隱藏並位於鏡頭範圍。

### 修正

- `ensureBoss()` 保證 Boss 存在於 `r48`。
- Boss 初始 phase 設為 1。
- 進入 `r48` 時觸發甦醒演出。
- Boss HUD、Objective 與 Boss 房狀態同步顯示。
- Debug boss 指令同時完成傳送、生成與甦醒。
- Boss 擊敗後標記 `bossDefeated`，不再錯誤重生。

瀏覽器驗證：

```text
bossExists = true
bossRoom = r48
withinBossRoom = true
hudVisible = true
bossTitle = 十相哨兵・赫利俄斯
```
