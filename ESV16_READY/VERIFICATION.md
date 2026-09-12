# V16 因果工房｜實際發布驗證

版本：`16.0.0-causal-atelier-release`  
驗證日期：2026-09-11  
發布產物：`ESV16_GITHUB_READY.zip`、`ESV16_PLAY.html`

## 1. 完整交付與版本基底

本次確實從收到的 `ESV11_GITHUB_READY.zip` 擴充。未取得V12–V15原始碼，未宣稱合併那些版本。V16是本輪因果／熱力／尺度／切片的整合發布名稱。

- 原78房、10職、120主動技能、18種已登錄避難所美術與服務保留。
- 原120 PNG、8份JS及1份美術manifest，共129檔逐一SHA-256一致。
- 新增7房：鏡片工房、5種規則教場、帕拉克斯Boss房；現在85房。
- 新增 `vision_data.js`、`vision.js`、`vision.css`，以原遊戲類別的擴充層接入，不把基礎遊戲另做一個簡化版本。
- 當下＋8個替代視界、2槽配裝、4系A/B；沒有MP或施放資源。

原檔摘要：`docs/V11_BASELINE_SHA256.json`。執行檢查：`python tests/verify_v16_release.py`。

## 2. 新規則：54 / 54

執行 `python tests/run_v16.py`。使用Chromium中完整單檔遊戲的真實函式和物理，不是用空Canvas代理來代替遊戲。

代表項目：

- 空揮產生實際active-frame紀錄；移入該位置的敵人會被回放打中。
- 真實跳躍腳底路徑生成平台，角色確實站上光軌；傳送斷點不生成跨牆橋。
- 先知計畫帶ID與發動時間；移動中的元素彈擊中因果結點後取消該枚攻擊，之後它不會再生成。
- 冷凝敵彈的位置和存活時間固定；生成可碰撞踏點；真正射擊標記，再同键交換到合法空間。
- 解凍後敵彈恢復敵對，不自動變成友軍；冷凝衝量有上限。
- 熔岩、水柱凝結與機構冷停；超熱穿過標記鋼門和回彈牆。
- 宏觀風彈搬動重型配重；微觀實際縮小碰撞到19×29、走晶格縫、站分子球。
- 在放不下正常身體的封閉窄縫內，恢復正常尺度會被安全拒絕。
- A層穿B牆；C普通攻擊不能打B；光可建立跨層命中。
- B射線不傷C，ALL射線會傷C；舊B子彈與火区不會因玩家換C而改出生層。
- 不同來源交會只補有限空中Dash，不清空全技能CD。
- Boss護殼、光接點、BREAK、穩定時不可搬、Phase3多層攻擊、擊敗一次性獎勵。
- 既視感三段教學實際機制通過並只給一次獎勵。
- 凝結水柱前先檢查角色不被包進固體；普通舊房切A/C仍有該層延遲壓力。
- 新存檔子物件JSON往返、獎勵去重與無效資料正規化。

結果：`reports/v16/mechanics.json`；54通過，失敗0，Page／Console Error 0。

## 3. 真實鍵盤／UI與多檔載入：13 / 13

執行 `python tests/browser_v16.py`。

使用瀏覽器的實際鍵盤、DOM按鈕與requestAnimationFrame遊戲迴圈：

- 原方向鍵可移動，放開後速度歸零。
- J可打開8張視界卡，滑鼠配裝、Esc關閉、[啟動冷凝、反斜線返回當下。
- Hit-stop期間按下視界鍵仍能處理。
- 進入預射觀測室後確實產生已承諾攻擊和可見結點。
- 真實鍵盤啟動冷凝後至少2顆敵彈固定；本次截圖有4顆。
- 真實ZZX＋跳躍＋方向移動後生成攻擊回放及光軌。
- 實際按方向穿過B牆，進C層。
- Boss進場本體在畫面、HUD可見，且真正在安排5枚攻擊，並非只有裝飾Boss圖。
- Backspace返回原世界r00。
- 多檔index以repository子路徑載入131個實際本機JS/CSS/PNG資源，沒有缺檔。

結果：`reports/v16/browser.json`；13通過，Page／Console Error 0，request failures 0。

**環境與測試方法明確區分：** 執行環境政策會阻擋top-level file/http導航。单檔以Playwright `set_content` 執行；多檔以測試用base URL及request route供應同一專案的實際檔案。這是實際瀏覽器DOM／Canvas測試，但不是已公開上傳你的GitHub。沒有把這種方法說成已在真實GitHub origin完成LocalStorage跨重啟測試。

## 4. 舊功能重新回歸，不沿用舊數字

以下均在本次V16單檔上重新執行：

| 範圍 | 結果 | 當次資料 |
|---|---:|---|
| 原有關鍵戰鬥 | 13/13 | reports/v16/legacy_combat.json |
| 每職12招、10職逐招執行 | 120/120 | reports/v16/skill_matrix.json |
| 原十職×六項課程判定 | 60/60 | reports/v16/class_courses.json |
| 原家具、生活系統 | 33/33 | reports/v16/shelter_services.json |

技能測試中98招產生直接命中，22招為召喚、防禦、治療、平台、回溯等非直接傷害功能；不把22招說成失敗，也不宣稱每招都造成傷害。

唯一修改的舊測試期待值：家具回歸原本要求總房數78；V16改為驗證「排除V16新增房之後仍有原78房」。其餘家具效果、操作距離、消耗與去重條件維持。

課程測試是事件判定回歸，不等於玩家逐堂正常通關或原世界逐房探索完畢。

## 5. 原圖、單檔與ZIP

`python tests/verify_v16_release.py` 檢查：

- 129原檔SHA一致。
- 所有JS語法檢查。
- 多檔入口的相對路徑皆存在。
- 120PNG可解碼，內嵌位元組和原圖完全一致。
- 單檔無外部script／image／stylesheet必要載入。
- 新濾鏡CSS／JS確實內嵌。
- 未打包任何字型二進位檔。
- `.nojekyll`和根目錄入口存在。
- 上面所有回歸報告通過。

完整性資料：`reports/v16/integrity.json`。

最後建置 `python tools/build_v16.py` 以 `zipfile.testzip()` 實際驗證CRC，另輸出ZIP／單檔SHA到發佈旁的 `ESV16_RELEASE_CHECK.json`。ZIP直接根目錄index.html，不多包一層資料夾。

## 6. 實際預覽

`reports/v16/01_shelter.png`：原避難所仍保留。  
`02_workshop.png`：視界配裝、分支及试煉入口。  
`03_forecast.png`：真實已承諾彈道及菱形結點。  
`04_cold.png`：凝結敵彈及可站踏點。  
`05_echo.png`：真實ZZX／跳躍紀錄產生殘影與光軌。  
`06_slice.png`：C層與虛線B牆／敵人。  
`07_parallax.png`：可見Boss本體及其預排彈幕。

全部為Chromium遊戲截圖，未使用概念合成圖冒充遊玩畫面。

## 7. 實作邊界

這是完整可部署的單人規則整合原型，不是「所有提案都全宇宙模擬」或已通關30小時商業成品。先知只對已承諾计划／已存在彈道保證顯示；原世界未為每面牆額外製作三層美術。材料與分子規則作用於明確標記物件。回放不複製資源、召喚個數或治療。Boss重用既有哨兵美術、但有新因果AI。

多人維持原遠端玩家顯示範圍，未加入濾鏡、回放、Boss與家具的權威合作同步。存檔已測JSON往返及去重；發佈到新origin前請先備份。完整差異見 `docs/FEATURE_SCOPE.md`。
