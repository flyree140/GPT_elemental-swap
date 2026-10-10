# GitHub Pages 部署 · 21.6.0

1. 備份原發布資料夾，在遊戲選單先匯出舊存檔。
2. 解壓縮 `ESV21_6_0_COMPLETE_GITHUB.zip`；上傳解壓後的**全部內容**，不是 ZIP 本身。根目錄必須看見 `index.html`、`js/`、`assets/`、各 CSS 檔及 `.nojekyll`。維持檔名大小寫與相對位置。
3. 到儲存庫 Settings → Pages。Source 選 **Deploy from a branch**，Branch 選 **main**，資料夾選 **/(root)**，儲存。靜態版本不需要 npm install / build，也不需要 API Key。
4. 等 Pages 顯示發布成功，從頁面提供的網址開啟。頁籤與遊戲右下角應有 21.6.0。瀏覽器仍顯示舊版時重新整理或清除此網站快取；不要先刪除存檔。

若要放進子資料夾，請把整份內容放在同一子資料夾，並開該資料夾的 `index.html`。資源採相對路徑，沒有寫死儲存庫名稱。

另有 `.github/workflows/pages.yml` 手動替代方案：在 Pages 改選 GitHub Actions 後，到 Actions 執行 `Deploy Entropy 21.6.0`。不要把兩種來源設定混用。手動流程會檢查發布包檔案校驗；修改程式／文件後，先執行 `python tools/update_checksums.py` 更新清單再提交。

此交付已驗證本地靜態資源與相對路徑，沒有代為登入帳號建立儲存庫，也沒有宣稱已在你的 GitHub 網址上實際發布。

官方設定參考（核對日期 2026-09-23）：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 本機與離線

資料夾版：安裝 Python 3 後執行 `START_LOCAL.bat`，或在此目錄執行 `python3 tools/start_server.py`。只監聽本機 127.0.0.1，不對外開放。

單檔版：另附 `ESV21_6_0_PLAY_OFFLINE.html`，由同一 `index.html` 與素材打包而成。它不重複放進部署 ZIP。可用 `python tools/build_singlefile.py --output /path/to/ESV21_6_0_PLAY_OFFLINE.html` 重新建立。
