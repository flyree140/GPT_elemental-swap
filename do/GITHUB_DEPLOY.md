# V16 GitHub Pages 部署

本包不需要 npm build，也不需要額外遊戲伺服器才能玩單人。

## 覆蓋原專案

先從舊版 L 技能工坊匯出存檔，並保留舊 Repository 版本或 commit。

解壓 ESV16_GITHUB_READY.zip；上傳「裡面的內容」到你的 Repository 根目錄。最外層必須是：

```
index.html
styles.css
vision.css
js/
assets/
PLAY_OFFLINE.html
README.md
.nojekyll
```

不要只上傳ZIP，不要只上傳index.html，不要在最外層再多包一層Elemental_Swap_V16資料夾。自訂網域的既有CNAME請保留。

Repository → Settings → Pages → Source：Deploy from a branch → Branch：main → Folder：/(root) → Save。

GitHub Pages發布來源可以是指定分支的根目錄或docs；本包選根目錄。

官方依據（查核2026-09-11）：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 純單檔選擇

ESV16_PLAY.html和PLAY_OFFLINE.html內容相同。如果只想部署一個檔案，可以將它改名為index.html後上傳。但要日後修改技能／素材，建議用完整多檔專案。

## 確認新版

重新整理後頁面應顯示V16及「視界工坊J」。按J進入，應有8張可配裝視界卡、4組A/B和6個教場／Boss按鈕。

如果只看到白底文字，多檔專案的CSS/JS通常沒有一起上傳；本包附的單檔可用來排除這類路徑問題。若附件預覽器不允許執行HTML，下載到桌面瀏覽器測試。

若仍看到舊版，先以Ctrl+Shift+R重新整理。若原網站曾使用Service Worker，需在開發者工具檢查是否仍攔截舊資源；本包沒有新增Service Worker。

## 存檔與多人

保留原save schema並增加vision16子物件；不覆蓋mastery/haven11進度。不同網站origin的localStorage不會自動共用，所以換網域／網址前請先匯出。

2P維持原本遠端玩家顯示原型；沒有加入濾鏡、敵人、家具或Boss的多人權威同步。這版完整驗收範圍是單人。
