# V19 原始碼與重建

HTML 入口 index.html 先載入世界與核心，再載入 V16→V17→V18→V19 擴充。所有模組直接提供瀏覽器 JavaScript，不需要打包工具。

| 檔案 | 責任 |
|---|---|
| js/frontier_data.js | 編譯的 175 地點、25 生境、物種、配方與連線；在遊戲初始化前註冊 |
| js/frontier_world.js | 地層、互動、研究、召王、再生、裝備／補給、生境物理及儲存 |
| js/frontier_combat.js | Z/X 指令、命中時序、冷卻回復、王種主副招與預告 |
| js/frontier_ui.js | 地圖、定位、導航、小地圖、工坊、圖鑑、連段說明 |
| js/frontier_render.js | 原生 Canvas 環境裝飾、怪物、預告、連段效果 |
| js/frontier_release.js | 入口整合、地形表面校正、補氧鐘、匯入安全與顯示修正 |
| frontier.css | V19 排版與手機覆蓋 |
| docs/FRONTIER19_CONTENT.json | 新世界內容編輯來源；固定具名資料，不是 runtime 隨機生成 |
| docs/RUNTIME19_CATALOG.json | 從實際瀏覽器抽出的技能／冷卻／裝備資料快照 |

改世界資料執行 `python tools/compile_frontier19.py`，再執行 `python tools/build_v19.py --pack`。只改 JS/CSS 不需重編 JSON，直接 build 即可。產物 PLAY_OFFLINE.html 與多檔 index 使用相同載入順序及素材。

builder 只用 Python 標準函式庫，封裝時排除字體、快取、Git 與其他 ZIP。測試需要 Playwright／Chromium，遊戲不需要。tests/harness19.py 的儲存替代只在指定 --storage 測試頁記憶體使用，不寫進正式入口。

舊擴充仍使用 prototype 包裝；更動載入順序會改變覆寫鏈，請跑回歸。現階段維持既有引擎，沒有偽稱做過引擎全面重構。多人 network.js 為歷史實驗介面，V19 不保證新狀態同步。
