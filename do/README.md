# Elemental Swap V16｜因果工房

**版本：16.0.0-causal-atelier-release。這是一份完整靜態網頁遊戲部署包，不是只有設計文件。**

以本次實際取得的 `ESV11_GITHUB_READY.zip` 為基底，保留其十職業、120 個技能、78 個房間、18 個避難所及美術素材，再整合四組規則視界、五個實作教場和一個新 Boss。

本次沒有收到 V12–V15 的遊戲原始碼，因此不宣稱合併那些未提供版本的修改。沒有改用附件中另一套 Phaser/滑鼠操作，也沒有把 MP 加回來。

## 立即遊玩

完整單檔：`PLAY_OFFLINE.html`。CSS、所有程式和 120 個 PNG 內嵌；不需 npm 或素材生成步驟。附件預覽器若不允許 JavaScript，請下載後以桌面瀏覽器開啟。

多檔專案：`index.html` 必須和 `styles.css`、`vision.css`、`js/`、`assets/` 一起存在。這是 GitHub Pages 的入口，不能只下載這個 HTML 當獨立遊戲。

## 最先按 J

進入遊戲 → **J 視界工坊** → 選「01 鐘錶回廊」。課程會借給你適合的兩個視界，不更動原本六槽技能配裝。

| 按鍵 | 動作 |
|---|---|
| 方向鍵、Space、Shift | 原有移動、二段跳、Dash |
| Z / X | 原有 Command 連段 |
| 1–0 | 元素發射，同鍵再次換位 |
| C / V / B、F、Q | 原職業技能、換頁、職業能力 |
| J | 視界配裝、A/B 分支、五教場與 Boss |
| [ / ] | 左／右槽視界；再按當前視界回到當下 |
| \ | 直接返回當下 B 層 |
| Backspace | 離開視界試煉，回到進入前的位置 |
| L / T / E / U | 原技能工坊、職業教學、家具、避難所日誌 |
| K / P | 改鍵／暫停 |

## 四組可玩規則

1. **因果：既視感與先知。** 近三秒路徑成踏點；攻擊按原位置回放。先知顯示已承諾的攻擊計畫和現存彈體軌跡，元素／技能投射物可擊碎因果結點。
2. **熱力：低熵與超熱。** 局部敵彈停住並成為平台，可標記換位；解凍恢复敵對。指定金屬門可軟化、回彈樑可彈射、冷凝物件可儲存並釋放有限衝量。
3. **尺度：宏觀與微觀。** 宏觀降低特定配重的有效負載；微觀將玩家碰撞縮為 0.48 倍、穿晶格縫、踩分子踏點，敵方運動減慢。
4. **切片：A / B / C。** A 是內構，B 是當下，C 是殘響。指定牆面與平台按層碰撞；子彈與火區保留出生層。光可連結異層目標，影錨可留跨層回程。其他切片也有自己的預警攻擊。

**共鳴仍沿用原來的十元素換位。** 本體與殘影／契靈等不同來源在 0.55 秒內先後命中同一敵人，可成立「交會」，補一次空中 Dash；不重置全部技能冷卻。

## 本次新增檔案

```
js/vision_data.js    九種狀態、兩槽配裝、四系分支、七個房間、試煉步驟
js/vision.js         錄影／回放、預測計畫、時間域、碰撞層、命中與 HUD
vision.css          視界工坊和遊戲內提示
VISION_GUIDE.md      實際操作與四系規則
V16_CHANGELOG.md     改動與相容性範圍
MODDING_V16.md       修改規則與測試的方法
VERIFICATION.md     本次驗收，不等同舊版驗證
reports/v16/        新版測試 JSON 與 Chromium 截圖
```

完整規則範圍與未宣稱功能見 `docs/FEATURE_SCOPE.md`。

## 建置與測試

只玩或部署不需安裝工具。開發者重新產生單檔／ZIP：

```bash
python tools/build_v16.py
```

自動測試需要 Python Playwright 與 Chromium。測試程式預設 `/usr/bin/chromium`；在其他作業系統可調整 executable_path，或使用 Playwright 自己安裝的 Chromium。

```bash
python tests/run_v16.py
python tests/browser_v16.py
python tests/run_assertions.py
python tests/run_matrix.py
python tests/run_courses.py
python tests/run_haven.py
```

## 部署

解壓後將**全部內容**上傳到 Repository 根目錄，`index.html` 在最外層；按 `GITHUB_DEPLOY.md` 啟用 Pages。`.nojekyll` 已包含。

## 限制

這是可玩整合版原型，不是已驗收 30 小時內容的商業遊戲。預知不會假裝知道尚未決定的隨機 AI；材料、晶格、分子與 W 層幾何是明確設計的互動資料，不會把全世界每面牆改成任意穿透。多人沿用 V11 的遠端玩家顯示原型，新增視界、怪物和機關不是權威多人同步。
