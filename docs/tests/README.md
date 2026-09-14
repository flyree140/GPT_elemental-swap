# V19 可重現測試

遊戲不需要測試依賴。執行測試請使用 Python、Playwright、Chromium；本環境 Chromium 路徑是 /usr/bin/chromium，可在 driver / controls / ui 修改 executable_path 適應其他系統。

```sh
python tests/driver19.py tests/frontier_core19.js --storage
python tests/driver19.py tests/regression19.js --storage
python tests/driver19.py tests/save19.js --storage
python tests/driver19.py tests/smoke18.js
python tests/driver19.py tests/lessons18.js
python tests/driver19.py tests/rulelessons18.js
python tests/controls19.py
python tests/ui19.py
python tools/capture19.py
```

smoke18/lessons18/rulelessons18 是本輪在 V19 重新執行的核心 regression，不以旧報告代替。帶 --storage 者在測試頁記憶體注入 localStorage 替代物；無參數及控制／視覺測試直接使用正式 HTML，沒有替代物。這些注入不包含於 PLAY_OFFLINE.html。

管理瀏覽器限制 top-level 導航，因此使用 set_content；沒有繞過限制。靜態多檔路徑另由 HTTP 子路徑逐檔請求。這不能代表已在 GitHub 原生 origin 測過儲存持久性。

數值 fixture 會配置材料／站位／技能前置物件，驗證函式效果；不是完整人工通關。真實鍵盤、滑鼠、触控分開走 Chromium 事件管線。capture 的部分截圖定位到指定生境，並非正式開局全解鎖。詳見 ../VERIFICATION.md 與 ../reports/v19/。
