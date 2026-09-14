# V19 GitHub Pages 部署與更新

## 網站入口

解壓 ZIP，把內容完整上傳／提交到 repository 根目錄。第一層應有：

```text
index.html
styles.css  vision.css  expedition.css  renewal.css  frontier.css
js/
assets/
.nojekyll
PLAY_OFFLINE.html
```

Settings → Pages → Build and deployment → Source 選 Deploy from a branch → Branch 選已提交的 main → Folder 選 /(root) → Save。Pages 完成後使用 Visit site。這是靜態網站，不需要自訂 npm build。

更新舊 repository 前先在舊版 L 匯出存檔。把整包同名檔案覆蓋，不要只新增 frontier 模組。左上必須顯示 V19 · LIVING ATLAS；仍見 V18 時核對發布分支、目錄與重新整理。原自訂 CNAME 等個人設定應自行保留；本包不替你變更網域。

核心圖片與程式使用相對路徑，支援 /repository/ 子路徑。PREVIEW.html 只是截圖展板；PLAY_OFFLINE.html 是可玩內嵌版。多檔入口 index.html 的 assets 與 js 必須一起保留。

## 本機開發與單檔

可以直接開 PLAY_OFFLINE.html。測試多檔版可在此目錄執行 `python -m http.server 8000`，再開本機伺服器。遊戲執行不依賴 Python；此命令只提供開發伺服器。

修改 JavaScript/CSS 後執行 `python tools/build_v19.py --pack`。修改新地圖資料先執行 `python tools/compile_frontier19.py`。

## 存檔與部署界線

V19 優先讀取 es19_progress，可從 L 匯入 V17/V18 JSON。研習中匯出使用進入研習前的配裝，避免測試道具污染存檔。匯入前保留自己的檔案備份。

本交付完成靜態資源與子路徑檢查、完整性檢查、Chromium 整合測試；沒有登入使用者 GitHub、建立 repository 或發布公開網站。原生網站 localStorage 跨重整與實體手機尚未驗證。

## 官方參考（2026-09-14 查核）

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
