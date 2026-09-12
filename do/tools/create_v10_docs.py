from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'js/skills.js').read_text();skills=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
s=(ROOT/'js/world.js').read_text();world=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
classes={'rift':'裂隙劍士','summoner':'靈契召喚師','beast':'森靈德魯伊','artificer':'符機工匠','gunner':'磁軌槍手','warden':'界壁守衛','chrono':'時序術士','harrier':'鎖鏈游擊者','alchemist':'鍊金調律師','monk':'雷影武僧'}
def put(n,s):(ROOT/n).write_text(s.strip()+'\n')
put('README.md','''# Elemental Swap V10｜共鳴研習・東境

完整靜態網頁專案。以 V9.1 為基礎，保留原版畫風、平台、52 房、17 種一般怪物、赫利俄斯 Boss 和修正過的角色 Sprite。

## 快速開始

單機直接開 `PLAY_OFFLINE.html`：CSS、6 個 JS 與 PNG 圖像全部內嵌。**不是只開多檔入口 index.html。**
部署 GitHub：ZIP 解壓後把內容放到 Repository 根目錄；根目錄必須直接有 index.html、styles.css、js/、assets/、.nojekyll。

## 核心新增

- 十職，每職十二個可選主動技能，共 120 個資料定義與執行實作。
- 每職六個装備槽：C/V/B × 兩頁，F 即時切頁；冷卻跟技能 ID 綁定，不能切頁洗掉。
- 每技能可指定一招追擊：主技能後 0.14–1 秒，再按同鍵接續。追擊也使用自己的冷卻。
- 元素換位後 2.4 秒內的下個技能附加該元素狀態；不換位也能正常放技能。
- 技能 0→1→2 級；每級 +12% 傷害。等級 1 開 A/B 互斥分支，切換免費。
- Z/X 可永久解鎖燃燒、麻痺或寒霜附魔，解鎖後自由切換。
- 新增鍊金調律師、雷影武僧；鷹能方向飛行，熊範圍震地，狼短撲連爪。
- 16 個東境探索房 +10 間職業教場；原圖不刪。總計78房/103連線。
- 十門課程、每門六段條件判定；所有人都能暫借技能與分支，不用先農點數。

## 預設按鍵

| 操作 | 按鍵 |
|---|---|
| 移動／向上向下瞄準 | 方向鍵 |
| 跳躍／二段跳／受身 | Space |
| 鷹形自由飛行 | 按住 Space + 方向鍵；無方向懸停 |
| Dash | Shift |
| 牽引／反衝 | A |
| Command | Z / X |
| 目前技能頁 | C / V / B |
| 切換六技能中的另一頁 | F |
| 原有職業能力 | Q |
| 十元素投射／同鍵換位 | 1–0 |
| 技能工坊／強化／分支 | L |
| 十職研習選單 | T |
| 離開教場 | Backspace |
| 家具／NPC／遺物 | E |
| 世界圖／說明／改鍵 | M / H / K |
| 暫停 | P |

## 先玩哪裡

按 T 選裂隙劍士課程。先 Z→Z→X 挑空，再 C 三連斬、換位共鳴、L 切分支、同鍵追擊，最後做完整一套。
按 L 選技能；1–6 裝到槽位，U 強化，J/K 選 A/B，O 輪替追擊。Esc 回遊戲。

## 存檔

V10 使用 `es10_progress`，第一次讀取可繼承同瀏覽器、同網站的 `es9_progress`。不刪除 V9.1 存檔。技能頁、強化、分支、首解、課程獎勵會存入瀏覽器。
若瀏覽器禁止 localStorage，遊戲仍可執行，但需用 L → 匯出存檔備份。更換網址、無痕模式、清除瀏覽資料都可能失去本地存檔。

## 多人現況（重要）

保留原版 PeerJS 遠端玩家顯示；首次按建房/加入才載入 CDN。**目前同步的是位置、面向、職業與生命等玩家顯示，不是完整敵人、世界與120技能的權威合作同步。** 本次新增內容以單人為驗證範圍，沒有宣稱跨兩台外部裝置測過。

## 文件

- SKILL_CATALOG.md：120 技能、模式、冷卻、A/B 分支完整表。
- MASTERY_GUIDE.md：成長、配裝與程式修改。
- TRAINING_GUIDE.md：十門研習課程與解題方式。
- WORLD_EXPANSION.md：新增房間、回環與共鳴爐。
- CHANGELOG_V10.md：變更與邊界。
- VERIFICATION.md / reports/：真實測試範圍與結果。

此版本是可執行原型，不以房數推算或保證 10/30 小時通關時間。
''')
text=['# 十職 120 技能目錄','每職十二招全部是可選技能；同時裝備六招，F 切頁。Q 為額外保留能力，不算在十二招裡。','技能購買/升級只消耗永久成長點，施放沒有 MP、彈藥或能量條。']
for cls,list_ in skills.items():
 text+=['\n## '+classes[cls],'| 技能 ID / 名稱 | 作用 | 基礎 CD | A 分支 | B 分支 |','|---|---|---:|---|---|']
 for a in list_:
  text.append(f"| `{a['id']}` **{a['name']}** | {a['desc']} | {a['cd']:.2f}s | {a['branches'][0]['name']}：{a['branches'][0]['desc']} | {a['branches'][1]['name']}：{a['branches'][1]['desc']} |")
 text+=['\n分支從技能等級 1 生效；A/B 擇一。技能的直接傷害會乘等級倍率，治療／召喚等非直接傷害則依其模式執行，不能把資料表 damage=0 誤認成未實作。']
put('SKILL_CATALOG.md','\n'.join(text))
put('MASTERY_GUIDE.md','''# 技能成長與修改

## 不是 MP 換皮

「專精點」只在工坊購買永久強化或普攻附魔時花費。施放技能不扣點，也沒有 MP。初始 12 點，每次升級（XP）+3 點；教學每職首通+4；新共鳴爐首解+3；研究匣+4；收藏首次取得+3；東境 Boss 首次擊破+8。重複刷同個首解不能重複領。

## Skill Lv.0 / 1 / 2

0 級就能裝備與施放全部十二招。0→1 花1點，1→2花2點；最高2級。每級直接傷害 +12%。從1級開始才啟用已選A/B分支。
A 通常強化原本元素狀態；B 依技能改變回響、聚怪、貫穿、空中刷新、射程、護盾或治療等規則。**不是把兩條一起加上。**切換免費。

普攻也可花2點永久解鎖燃燒/麻痺/寒霜。取得後切回原型或其他已解鎖元素不用再花點，兩個新職業也適用。

## 六技能與追擊

每職十二選六，L 中的槽1/2/3為第一頁C/V/B，4/5/6為第二頁，F切頁。不能同技能重複裝兩槽；選已裝技能會交換槽位。
每技能可以選一個不同的同職追擊技能，追擊不一定在六槽裡。主技能後0.14–1秒內，再按同一按鍵便呼叫追擊。追擊若正在冷卻，不能施放。追擊不會再生第三層免費連鎖。

例：C裂步三連 → 再C逆界挑空 → Space → Air Z → 2→2冰換位 → V另一技能帶冰霜共鳴。
**換位窗口是額外獎勵，不是技能施放資格。**普通技能仍能單獨使用。

## 德魯伊

Q 在狼/鷹/熊間切換。各專屬技能也會切到對應形態。
鷹：按住Space搭配方向飛行；不按方向則懸停。放開Space滑翔落下。翱翔技能暫時提高飛行速度，沒有體力條。
狼：普攻短撲、技能長撲、多段爪擊；短撲限制在不穿過敵人的合理距離。
熊：普攻碰撞改為以角色為中心的235×155範圍；掌震與咆哮是範圍傷害/削BREAK，而非人形劍擊。

## 程式入口

```
js/skills.js    # 120 招數值、模式、分支、預設追擊
js/mastery.js   # 執行器、scheduler、取消、狀態、工坊、課程判定
js/world.js     # 舊52房+東境16房+教場10房
js/game.js      # 保留V9.1物理/畫風/Sprite/17怪物/元素
```

### 調整技能

在 skills.js 找 rift_step：`cd`是冷卻、`hits`是段數、`range`是範圍、`element`是本身附加狀態。直接編輯後刷新即可。
完整資料由 tools/create_mastery_data.py 生成；要長期重建，請修改該生成器對應資料，而不是手改後又被生成器覆蓋。

### 新機制

在 mastery.js 的 runMasterSkill(s,ctx) 加新的 mode 分支。mArea 是範圍命中，mShot 是帶命中集合的投射物，mField 是持續場域。
所有延遲命中用 mSchedule(delay,callback)，使用遊戲時間；不要新增真實 setTimeout 去造成傷害，否則暫停或離場後還可能偷打。

### 新判定

mEmit('hit',...) 僅在实际扣血後送出。checkLessonM 接收 hit、swap、flight、parry、summonHit 等事件。不要用按鍵次數假裝技能命中。
研習模式會暫借技能等級1，使用獨立裝備及分支表。離場復原探索位置與原配置。課程資料不會覆蓋玩家永久配裝。

### 素材

原有 PNG 不變。新增 player_alchemist.png、player_monk.png 仍每格48×52、每列8幀、16列，避免再出現走路或跳躍切半。

## 存檔/API

ES10_MASTER.normalMaster() 會驗證技能ID、職業、rank範圍、配装重複。沒有自動刪舊檔。工坊可匯出/匯入JSON；匯入後重新整理會完整套用世界解謎狀態。
''')
put('TRAINING_GUIDE.md','''# 十職研習指南

T 選課；可隨時離開，Backspace 回到进入前的探索位置。切換課程也會先安全離場。
每課六段：Z→Z→X挑空、職業特性、換位共鳴、分支、主技能追擊、完整接段。

第一段不要按住方向鍵連打，否則會變成方向Command。先站到傀儡旁再 Z→Z→X，命中才算過關。
進入下一段會重設靶場，並在第三段起自動把合適的傷害技放到C。這是教場暫借配置，不影響探索配裝。

| 職業 | 第二段實作練習 |
|---|---|
| 裂隙劍士 | C裂步三連，命中至少三段；要先靠近靶子 |
| 召喚師 | C狐、V鴞各一隻，等待合計3次契靈命中 |
| 德魯伊 | C翱翔，Space+↑累積上升200px；V切熊，範圍震地同時命中兩靶 |
| 機巧師 | C砲台 → V磁浮踏台，砲台仍存在時升到140px |
| 磁軌槍手 | V火箭上升 → 按↓瞄準再C反衝彈；兩個空中施放的彈命中，可重複 |
| 界壁守衛 | 慢速練習彈接近時C格擋；0.38秒內被碰到才算，不是空放 |
| 時序術士 | C設時間錨、走100px，待冷卻且追擊窗結束後再C返回；V延遲回響命中 |
| 鎖鏈游擊者 | C拉近靶子，V擺盪踢實際命中 |
| 鍊金調律師 | C水霧命中，再V電解彈命中任一已濕潤靶 |
| 雷影武僧 | 靠近，V旋風連踢1秒內命中4段 |

第三段：1→1完成換位，再C命中。有共鳴狀態文字不代表已過，要真的打中。
第四段：L選目前C，K切B，Esc返回，C打中。教場借Lv.1，不扣點。
第五段：C主技能後0.14–1秒內再C，追擊命中。
第六段：6秒內 Z命中→1→1換位→C→再C追擊命中。

每職首通+4專精點。重設關卡只是重置傀儡/冷卻，不直接通關、不重複發獎勵。實測採程式化操作和指定靶場初始位置驗證；不代表每位新玩家都可一次完成。
''')
put('WORLD_EXPANSION.md','# 東境拓展\n\nV9.1原有52房/71連線不刪也不搬。新增16探索房和10教場，總計78房/103連線。原赫利俄斯r48保留；e15是額外的哨兵AI變體，不是假裝新增獨立全套Boss AI。\n\n| 房間 | 用途 |\n|---|---|\n'+'\n'.join(f"| {r['name']} (`{r['id']}`) | {r['note']} |" for r in world['rooms'] if r['id'].startswith('e'))+'''\n\n東境入口由雨幕舊城r13連至e00。中段可回r21，上段可回r42，並非單向長廊。M可看所有節點，尚未探索的房間保持暗色。

四座共鳴爐：鏽潮運河(水→雷)、熄火鍛造室(冰→火)、銅鴞花園(藤→風)、倒懸書庫(光→影)。首解各+3專精點；其中水雷、光影解除地圖上的實體研究門。
六個研究匣位於東境房間內，E開啟+4點；新功能神殿也沿支線配置，不把獎勵排成一長列。
新區沿用你喜歡的V9.1背景Atlas和平台語言，沒有替換成整齊高塔。
房間連通性以圖論測試驗證，不等同所有路線都已由人類徒步走完。沒有保證10/30小時遊戲時間。
''')
put('CHANGELOG_V10.md','''# V10 變更摘要

## 保留

V9.1畫風、原平台分佈、52房原圖、17一般敵種、赫利俄斯、十元素、慢速彈、方向鍵移動、無MP、Sprite修正。

## 新增

10職×12招；12選6的雙頁技能槽；自由指定追擊；換位共鳴；Lv.0/1/2與A/B互斥分支；Z/X附魔；10職研習×6段實際判定；16東境探索房；4共鳴爐；6研究匣；6支線神殿；新增鍊金/武僧Sprite。

## 手感

命中停格改用真實幀時間結束；停格期间暫存輸入，取消窗前的技能輸入不再被丟掉。攻擊/技能/跳躍/換位可以接續，冷卻跟技能ID綁定，不因換頁重置。
調整狼爪普攻前撲上限，避免自己滑過目標。鷹按Space+方向真飛行；熊普攻和掌震範圍化。投射物有命中集合，穿透不會每幀重複扣血。
原本時序普攻的真實setTimeout延遲命中已換成遊戲時間排程，暫停和離場會一起停止。

## 實際修到的教學問題

機巧踏台上升不足140px已調整；所有技能模式的追擊後備選項不會找不到ID；鍊金追蹤所有濕潤靶，不是只記最後一隻；槍手用「發射時在空中」判定，慢速彈命中時已落地仍可計分。

## 已知邊界

新增內容為單人原型範圍。保留2P玩家顯示，不宣稱完整世界/120技能聯機。60教學條件與120技能以自動化測試執行，未做長期人類平衡和通關時間測量。

## 參考

參考《孤羊戰記 OVIS LOOP》官方LIFUEL技能更新的「主技能＋Combo Skills＋異常互動」概念，不複製原作角色、素材、數值和資源限制：
https://steamcommunity.com/app/2226730/allnews/
本作維持無MP與短CD，A/B分支與元素換位為本專案設計。
''')
put('GITHUB_DEPLOY.md','''# V10 覆蓋部署

1. 先備份V9.1。下载ESV10_GITHUB_READY.zip並解壓，**不要只上傳ZIP或index.html**。
2. 把解壓後內容放到既有Repository根目錄；最外層應直接有index.html、styles.css、js/、assets/、.nojekyll。
3. 原本已啟用Pages的repo不必改發布來源，commit後等待重新部署。第一次啟用可依GitHub官方Pages文件選main/root。
4. 全部檔案一起覆蓋，尤其js/skills.js與js/mastery.js不可漏。
5. 網站重新載入後確認頁首V10、L開工坊有12招、T有10門課、F可切技能頁。
6. 尚未更新可Ctrl+Shift+R。更換網站網址時瀏覽器存檔不會自動跟著搬，先L匯出JSON。

本機直接開PLAY_OFFLINE.html即可；它內含全部CSS/JS/PNG，不是多檔案入口。不保證聊天附件預覽器會執行JavaScript，請下載後在一般瀏覽器開啟。

多人：只有按建立/加入才載PeerJS。沒有把GitHub Pages當Node伺服器；原版同步玩家显示，未聲稱完整權威世界同步。

官方發布來源說明（UI若改版，以官方為準）：
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
''')
put('TEST_CHECKLIST.md','''# V10 測試方式與人工複測

## 已有自動化腳本

- tests/run_matrix.py：120技能施放/狀態/投射物/場域/渲染路徑。
- tests/run_assertions.py：13項關鍵效果：ZZX、唯一召喚、鷹飛行、熊AOE、格擋、強化點數、追擊、換頁CD、換位安全、首解獎勵。
- tests/run_courses.py：10職×6課條件，使用指定初始位置和程式化輸入。不是偽造按鍵計數，命中/飛行/回溯需通過實際遊戲規則。
- tests/static_verify.py：原52房/71邊/原素材保留、全新圖連通、技能數/分支/資產、ZIP入口檢查。

Python測試需要playwright和Chromium。受測環境禁止導航localhost，因此測試用Chromium set_content載入相同獨立HTML；這是實際浏览器Canvas/鍵盤執行，但不把它寫成已測公開GitHub網址。

## 上線前人工複測

- [ ] 下載單檔，未連網時主角/背景/圖鑑正常。
- [ ] 方向鍵/Space/Shift正常，放開方向不滑走。
- [ ] L有12招，六槽可換，F可切頁且不清CD。
- [ ] U升技能，J/K切分支，分支影響實際命中。
- [ ] 同鍵追擊0.14–1秒窗口，與元素換位互相串接。
- [ ] 鷹Space+方向飛行，熊掌震多目標，狐狸同種一隻。
- [ ] T每門可以進出，離場回原位置/職業/配裝。
- [ ] 原r48 Boss和新e15 Boss可見。
- [ ] GitHub部署後没有本地CSS/JS/PNG 404。
- [ ] L匯出/匯入存檔，重新整理能續成長。

未宣稱實測兩台外部裝置多人同步或人類10/30小時通關時間。
''')
# Keep old specialist guides as historical references, not mistaken current release docs.
(ROOT/'docs/v9_1').mkdir(parents=True,exist_ok=True)
for name in ['CHANGELOG_V9.md','FIX_NOTES_V9_1.md','MAP_DESIGN.md','COMBO_GUIDE.md','CLASS_GUIDE.md']:
 p=ROOT/name
 if p.exists():p.replace(ROOT/'docs/v9_1'/name)
for name in ['runtime_smoke_test_output_v91.json','runtime_smoke_test_output.json','animation_integrity_test.json']:
 p=ROOT/name
 if p.exists():p.unlink()
put('CLASS_GUIDE.md','# V10 十職配裝\n\n請閱讀SKILL_CATALOG.md 的全技能表，與 TRAINING_GUIDE.md 的逐職操作。\n\n'+'\n'.join('## '+classes[c]+'\n\n'+ '、'.join(a['name'] for a in ar)+'。\n' for c,ar in skills.items()))
put('COMBO_GUIDE.md','''# V10 接招速查

原有Z/X中立/方向/Dash/空中Command保留，另外加入ZZXX、ZZXZ、ZXZZ、XZZX、XZXX、XXZX、Air ZX、Air XZ。

## 裂隙劍士示例

預設C裂步三連的追擊是逆界挑空。先靠近，Z→Z→X挑空，Space追上，Air Z，2→2冰換位，C裂步三連，再C逆界挑空。追擊窗口0.14–1秒，用短間隔，不是狂按同一鍵。

## 強化替換

L選裂步三連，升到1級。J是風壓特化，K是回響追段。B回響每次命中後0.22秒在舊命中位置追加30%傷害，與原A分支互斥。

## 全職共通但不相同的操作

同樣ZZX，劍士是刀身挑空；德魯伊狼是短撲爪、鷹是風羽、熊是範圍掌；工匠/槍手X路線是投射物；時序多延遲回響；游擊拉怪。各職另有十二技能搭配，Q不佔六槽。

F切第二頁可再接三招；原技能CD仍然繼續跑，不能切頁洗CD。命中停格期间的Command/技能會暫存，按P/開選單會停止遊戲時間與延遲傷害。
完整逐步實際判定在T研習，不必靠本文猜按鍵速度。
''')
put('ASSET_LICENSE.md','''# 素材與參考

V10保留V9.1的原創程序像素圖；新增兩套同規格角色Sprite，沒有重包使用者的參考圖片，也沒有擷取《孤羊戰記》或《艾爾之光》資產。

原有背景、平台、角色和怪物圖像逐檔SHA-256比較保留；新職業生成器是 tools/generate_mastery_sprites.py。
OVIS LOOP官方技能說明只作設計參考：主技能/Combo Skills/異常互動。本專案自己的技能名、分支、換位設計與程式沒有複製原作資產。

PeerJS目前僅在使用者按建房/加入後從unpkg載入1.5.5。其專案採MIT；正式產品若內嵌函式庫，須保留對應license。此包未將其原始碼重打包。
''')
print('Docs written for',sum(map(len,skills.values())),'skills')
