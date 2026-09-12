# V16 當次驗收資料

本資料夾的測試在 2026-09-11 以 V16 PLAY_OFFLINE.html 執行。

- mechanics.json：54項規則與安全回歸。
- browser.json：13項真實鍵盤／UI與相對資源載入。
- legacy_combat.json：原13項戰鬥回歸。
- skill_matrix.json：原120技能逐一執行。
- class_courses.json：原10職×6項課程判定。
- shelter_services.json：原33項家具／生活機制。
- integrity.json：程式語法、原檔SHA、內嵌PNG、路徑和上述結果匯總。
- 01～07 PNG：實際Chromium畫面，不是美術合成圖。

reports/其他路徑有前幾版歷史資料，不能把舊版時間與結果當成這次的驗收。
本環境禁止top-level file/http導航：以set_content執行完整內嵌HTML，並以Playwright route載入實際多檔資源驗證repo子路徑；不是已替你公開部署GitHub，也沒有聲稱跨origin重啟存檔已測。
