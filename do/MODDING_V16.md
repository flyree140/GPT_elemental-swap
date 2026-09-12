# 修改 V16 視界系統

## 資料與邏輯分開

`js/vision_data.js`：視界名称、說明、兩槽按鍵、A/B分支、試煉步驟、新房間與邊。

`js/vision.js`：可執行規則。檔案用繁體中文分區註解，建議依「狀態 → 房間 → 安全切換 → 錄影/回放 → 預知/凝結 → 傷害層 → 教學 → HUD」閱讀。

原遊戲並不是 Phaser。不要照附件 GDD 的另一套路徑新增 BootScene 然後期待這個 Canvas 遊戲會自動呼叫它。

## 維持載入順序

```
world.js → config.js → skills.js → network.js → game.js → mastery.js
→ sanctuary_data.js → sanctuary.js → vision_data.js → vision.js
```

所有覆寫在 DOMContentLoaded 建立 Game 前裝好。不要把新腳本放到 body 裡某個按鈕 onclick 之後才臨時注入。

## 調整既視感

`vSample()` 的 `.045` 是採樣間隔；保留最近約3秒。`vMakeEcho()` 將合法脚底點變成60×9的单向平台。超過距離閾值或有cut標記的移動，不連成平台。

`vRecord()` 記錄 `box/circle/projectile`，不要記「哪個敵人掉幾點血」當回放。`vReplayHit()` 應於重播時間重新做碰撞。

增加一個新技能時，優先呼叫現有 `mArea/mSlash/mShot`，就能接入回放。如果是全新傷害型態，需要自行補 `vRecord()` 的幾何事件，不要複製整個技能以免生成第二隻召喚物或再領獎勵。

## 增加可預知攻擊

```js
this.vPlan({
  type: 'bolt',
  x: sourceX, y: sourceY,
  vx: -180, vy: 0,
  at: this.time + 1.75,
  layer: 'B',
  owner: '新觀測守衛',
  damage: 8
});
```

`vNodes()` 使用相同plan座標與速度預覽；`vTickPlans()` 到期才產生真正敵彈。取消時設 cancelled，不要只刪紅線卻仍然發射。

大範圍使用 `type:'beam'` 或 `type:'blast'`，附 x/y/w/h。只有bolt有可干預節點，避免每個Boss大招都能一鍵刪除。

## 增加材料

在 buildWorld 覆寫中的 add() 增加對象，並在 `vMaterialSolids()` 定義各模式的碰撞。碰撞與繪製必須使用同一份id/座標資料。

已有類型：steel、elastic、lava、waterfall、crusher、heavy、socket、lattice、poison、molecule、wall、slicePlatform、console。

只有剖面裝飾沒有碰撞時，不應加到activePlatforms。

## 安全切換／換位

先用 `vLanding()` 檢查新尺寸／新層的碰撞，再一次性提交座標。它保留合法空中位置，不強制吸到附近樓板。

`vSwitch()` 對cold額外做即將出現的凍結碰撞預覽。不要在檢查完後才毫無條件生一根巨大實體柱把玩家塞住。

`swapElement()` 預驗證兩端；大型sentinel只有breakStun>0才允許互換。拒絕時不可改一半座標、不可扣冷卻。

## 切片與投射物生命週期

元素彈/砲台/場域生成时加 `v16Layer`；mastery技增加 `ctx.v16Layer`。更新时依該層處理命中，不依玩家目前所在層。

`vCanHit()` 是共用規則：同層、ALL、光或有限時間接點。玩家的DOT會跟著角色，但留在B的毒池不會在C直接命中。

## 新增課程

`ES16.lessons` 每一步定義 [事件名稱, 給玩家的提示]。真正效果完成時才 `vEmit('eventName')`。不要「按了一個鍵」就假裝成功命中/站上平台。

首次獎勵使用 `mAward('vision16:trial:<id>',3,15)` 的唯一key，保持JSON存檔可去重。

## 新版驗收

```
python tools/build_v16.py
python tests/run_v16.py
python tests/browser_v16.py
```

新增房間後，舊測試的「78房」應該檢查原78房仍存在，而不是把世界總數硬改回78。相關調整在 haven_assertions.js 有標註。

## 完整重打包

`python tools/build_v16.py` 同時重建內嵌版與ZIP，避免只改了JS卻把舊單檔交出去。工具會驗證根目錄index和ZIP CRC並產生SHA-256。
