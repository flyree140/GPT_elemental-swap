# 修改 V11：資料、美術、家具

## 怎麼閱讀

`js/sanctuary.js` 在原 `mastery.js` 之後載入，擴充原 Game.prototype，沒有第二個 Game 或第二條 RAF。`buildWorld()` 先建立完整 V10 世界，再重排指定房間家具、新增屋頂與梯子接口。

## 改家具效果

搜尋 `homeAction11(f, action)`。每種動作都有：檢查距離 → 檢查前提或限額 → 改實際狀態 → 保存。例：回收機使用 `progress.scrap` 換 `mAward()` 的專精點，並以 `recycled[f.uid]` 限五次。

不要只改面板上的文字；`ACT` 是顯示操作，`homeAction11` 才是效果。新功能必須在兩者都加。

## 改元素互動

`homeElement11(f, element)` 接收機組／苗圃命中。`updateElements()` 擴充會先做本幀掃掠矩形檢查，命中有用設施時消耗該彈，之後才走 V10 元素規則。此路徑不會讓家具變成敵人，也不會改動十元素的其餘能力。

## 改家具位置

`LAYOUTS` 列出各主題底層／上層／屋頂類型。`put()` 以實際 floor.y 當腳底，因此美術或配置調整後仍能互動。`uid` 請保持穩定；改 uid 等於新的獎勵物件，會讓玩家再次領取。

## 改美術

`tools/draw_sanctuaries.py` 是本包原創生成器。需要 Python + Pillow，讀取 `tools/sanctuary_rooms.json`，產生 `assets/sanctuary` 和 `js/sanctuary_data.js`。不需要玩家執行生成器；PNG 已全部包含。

每個建築圖以 1 個原生像素＝2 世界單位繪製。`floors` 和 `roof` 是對齊錨點，不要任意改了圖卻不改幾何。背景由 `drawRooms` 畫，家具由 `drawFurniture` 畫，角色最後再畫，所以日常用品不會切斷或遮沒人物。

## 新增或改造一個避難所

先確定 world.js 的房間有 `shelter: true`。在 `sanctuary_rooms.json` 加同座標和尺寸資料，重新執行生成器。新的藝術資料會自動加入日誌；世界房間本身仍需由 world.js 建立，不會只加圖片就憑空多一間房。

## 保存

仍用 `es10_progress`。新 state：

```text
haven11.claims        一次性物資與收藏
haven11.timers        遊戲秒數截止時間
haven11.power         機組是否修好
haven11.steps         水→雷修復進度
haven11.grown         苗圃是否催生
haven11.herbs         食材（不是 MP）
haven11.bridges       終端步道開啟
haven11.checkpoint    床位保存
```

## 重建單檔與壓縮包

```bash
python tools/build_v11.py
```

一般玩家與 GitHub Pages 不需要執行此命令。它給開發者在改 JS／PNG 後重新生成 `PLAY_OFFLINE.html`，避免完整專案已更新、單檔卻還停在舊版。

## 測試

```bash
python tests/run_haven.py
python tests/run_assertions.py
python tests/run_matrix.py
python tests/run_courses.py
python tests/v11_release_browser.py
```

需安裝 Playwright 並有 Chromium。測試使用真正瀏覽器執行已內嵌 HTML，不需要連網下載資源。部分測試使用直接定位和逐幀更新，並非模擬真人從起點走到終點。
