# 部署 21.8 到 GitHub Pages（沿用操作說明）

先匯出存檔並備份舊儲存庫。解壓後把內容放入發布來源根目錄，使 `index.html` 與 `assets/`、`js/`、`data/` 同層。不要只上傳 ZIP 或 index.html。

Settings → Pages → Deploy from a branch → 實際使用的分支 → /(root)。保留 `.nojekyll`。也可選 GitHub Actions 並手動啟動包內 workflow；不要混淆兩種發布來源。

更新後從 Pages 的 Visit site 檢查版本、地圖、F2/F9 與存檔。單檔 PLAY_OFFLINE.html 是另一個預先封裝入口，改原始檔後需執行 `python tools/build_singlefile.py --output PLAY_OFFLINE.html` 更新它。

完整步驟在開發手冊第 13 節。此交付沒有登入或提交至你的 GitHub 帳號，沒有完成實際線上部署。

官方來源（2026-10-04）：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
