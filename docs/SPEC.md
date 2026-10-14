# Critical Appraisal Training — v1 規格

> 狀態：r2.3（2026-10-14），r2 已經 Codex 規格覆審並修訂；後續修訂依據見文末「修訂紀錄」
> 參考實作：`CASP-2024-SR-MA-of-RCT-main/`（朋友專案，無 LICENSE，僅參考架構與互動，不複製程式碼）

## 1. 目標與非目標

### 目標
- G1 EBM 評讀**教學與指導**工具：每套評讀工具附 mock paper、專家參考答案與判讀理由；學員作答後可與參考答案逐題比對
- G2 多工具可切換：v1 支援 CASP SR-RCT、CASP SR-OBS、RoB 2、GRADE
- G3 指導者模式：匯入學員作答檔，與參考答案並排比對，標出差異
- G4 學員可上傳自己的 PDF 練習（無參考答案，僅作答 + 報告）

### 非目標（v1 不做）
- N1 不做後端、帳號、登入、雲端收件、全班統計（v2 以後才考慮 GAS + Sheets）
- N2 不做 ROBINS-I（v2，需先補 Wiki V2 來源筆記）、AMSTAR 2、RoB 2 cluster / crossover / per-protocol effect、RoB NMA、QUADAS-2
- N3 GRADE 不做 EtD framework、建議強度、多 outcome 完整 SoF 表、GRADEpro 匯入、混合設計證據體
- N4 不做 LLM / 語意分析；PDF 輔助只有關鍵字比對（候選句子），不影響任何判斷
- N5 不做多語系（僅繁中 + 英文對照）
- N6 不對學員自傳 PDF 提供參考答案或自動評分
- N7 不做 PWA / 離線快取（避免 SW 快取過期問題）
- N8 不做多人協作、即時同步
- N9 不做 CASP 計分或自動整體判斷（CASP 無官方 overall algorithm）
- N10 不做評讀另存、複製、多版本管理；不做 Markdown 報告檔

## 2. 使用者與情境

- 學員：PGY 藥師、實習藥學生、住院醫師；課堂或 journal club 單次完成一篇（30–60 分鐘）
- 指導者：作者本人（臨床藥師 / EBM 講師）
- 不處理病患資料；mock paper 為虛構內容

## 3. 平台限制

- GitHub Pages 靜態託管：無伺服器端邏輯、無秘密可存
- 無建置工具：原生 ES modules，瀏覽器直接載入；外部套件只有 PDF.js（cdnjs，固定版本）
- ES modules 須經 HTTP 載入，`file://` 直接開啟無法運作 → 本機以 `npx http-server` 開發
- `node:test` 僅開發期執行，不屬部署產物；部署產物仍為原生模組
- localStorage 約 5 MB / origin，可能不可用（隱私模式）、損壞或被清除
- PDF 不存入 localStorage（體積與隱私），重新整理後需重新上傳

## 4. 架構決策與理由

| # | 決策 | 為什麼不選另一個 |
|---|---|---|
| D1 | 純前端 + 檔案匯出 / 匯入 | 不選 GAS 後端：v1 無需全班統計；純前端確保學員 PDF 不外流、不碰帳號個資；匯入格式預留 v2 接口 |
| D2 | vanilla JS + ES modules，無建置 | 不選 React/TS：參考實作為 vanilla，教學工具互動單純；無建置可直接 GH Pages 部署、降低維護成本 |
| D3 | 工具定義（資料）與判讀引擎（邏輯）分離 | 不選「每工具一份頁面」：四套工具共用 PDF 檢視、狀態、匯出、比對。**同一引擎類型**的新工具主要加資料；新方法學類型仍需新引擎 |
| D4 | 三種引擎：`casp` / `rob2` / `grade` | 不選單一通用引擎：三者判讀語意不同（逐題 checklist vs signalling→domain algorithm vs 升降級），硬統一會讓抽象洩漏 |
| D5 | RoB 2 algorithm 以決策表（資料）實作，每列附官方 locator | 不選 if/else：決策表可逐列對照官方 algorithm 表審閱，也可被測試列舉與 mutation |
| D6 | 學員先判斷，演算法建議後顯示 | 不選自動判定：官方允許附理由推翻演算法；不一致本身是教學點 |
| D7 | 狀態 key = `toolId:paperRef`，一份進行中評讀 | 不選單一 key（參考實作做法）：需不同工具 / 不同文獻並存；不做另存與複製（N10） |
| D8 | 參考答案隨工具資料一起公開 | 不加密 / 不隱藏：純前端無法真正保密；改以 UI 流程控制「作答完成才可展開參考答案」，接受學員可查原始碼的風險 |
| D9 | **內容版本不可變**：發布後同一 `toolVersion` 的題目、決策表、mock paper、參考答案不得變更；任何影響判讀或比對的變更必須升版 | 不選「只比對版本字串」：同版本內容漂移會造成靜默錯比（威脅模型第二位）。匯出檔另帶 `contentHash` 作機械檢查 |

## 5. 模組切分

| 模組 | 職責 |
|---|---|
| `tools/<toolId>/definition.js` | 題目（官方原文 / 中譯 / 英文 / 教學補充分欄）、選項、提示、每題允許引用的 mock 段落集合、`toolId`、`toolVersion` |
| `tools/<toolId>/mock-paper.js` | 虛構範例文獻（中英對照段落，含刻意缺陷，段落有穩定 id） |
| `tools/<toolId>/reference.js` | 參考答案：每題判斷 + 理由 + 來源（mock 段落 id 及 / 或方法學文件 locator） |
| `engines/casp.js` | 逐題 Yes / No / Can't tell 與完成度；**不產生整體判斷** |
| `engines/rob2.js` | signalling questions → domain 建議判斷（決策表）→ overall 建議 |
| `engines/grade.js` | 起始等級 + 降級 + 升級 → certainty（規則見 §7.3） |
| `core/state.js` | 狀態存取（localStorage，讀寫皆 try/catch） |
| `core/export.js` | 匯出 / 匯入 / schema 與版本驗證 |
| `core/compare.js` | 學員答案 vs 參考答案逐題比對 |
| `core/pdf.js` | PDF 載入、檢視、關鍵字候選句子（僅本機） |

## 6. 資料流與狀態

### 6.1 評讀生命週期
- 選工具 + 選 paper（mock id 或上傳 PDF）→ 以 `toolId:paperRef` 載入既有進行中評讀，若無則新建
- 上傳 PDF 時產生 `paperRef = user-pdf:<uuid>`，`paperLabel` = 原始檔名；同名檔案不視為同一篇
- 換 paper = 切換到另一份評讀，不延續舊答案
- 「重設」= 刪除該 `toolId:paperRef` 的評讀（需確認）

### 6.2 答案狀態
每題答案為以下之一，不得混用：
- `unanswered`：未作答
- `not-applicable`：依官方跳題規則免答，由引擎決定、學員不能手選（RoB 2 條件路徑；CASP 2024 的「Q9 答 No → Q10 免答」，見兩份 checklist p.10）
- 官方選項值：CASP `Y / N / CT`；RoB 2 `Y / PY / PN / N / NI`

### 6.3 流程
1. **作答**：每次變更寫入 localStorage；寫入失敗 → 顯示「無法保存」橫幅，記憶體答案保留，作答與匯出仍可用
2. **載入既有狀態**：讀取失敗、JSON 損壞、schema 或 `contentHash` 不符 → 不載入、**不覆寫原值**、顯示原因，以空白新評讀繼續
3. **演算法建議**（RoB 2 / GRADE）：學員填完該 domain / outcome 判斷後才計算並顯示建議與路徑；必答項未齊 → 「資料不足，無法建議」；答案被清除後，舊建議立即消失
4. **報告**：單一 HTML 報告畫面 + 列印 CSS；`unanswered` 顯示「未作答」
5. **匯出**：JSON，欄位與型別見 `docs/schema.md`（動工前置文件，見 §11）
6. **指導者匯入**：讀檔 → parse → schema 驗證 → `toolId` / `toolVersion` / `contentHash` 比對 → mock paper 則載入參考答案並排比對；`user-pdf:` 則只顯示作答，不得解析成任何 mock id
7. **失敗行為**：parse 失敗、schema 不符、版本或 hash 不符、未知 toolId、未知 paperRef → 顯示具體原因，不進入比對、不白畫面
8. **PDF 失敗**：PDF.js 無法載入、檔案損壞 / 加密 / 非 PDF / 無文字層 → 顯示原因；仍可選工具、作答、匯出、匯入
9. **呈現安全**：所有匯入或使用者輸入的文字（notes、檔名、理由）一律以純文字顯示，不解析為標記

### 6.4 作答完成（completion predicate，控制參考答案解鎖）
- CASP：所有題目非 `unanswered`
- RoB 2：所有 domain 的必答 SQ（依路徑）已作答，且每個 domain 與 overall 判斷已填
- GRADE：研究設計、所有降級因素、（適用時）升級因素、最終 certainty 已填
- 解鎖後修改答案：參考答案維持可見，比對即時更新

## 7. 判讀邏輯規則

### 7.1 共通
- 學員**先自己判斷**，程式**再顯示**演算法建議與路徑（例：`1.1=N, 1.2=Y → Some concerns`）
- 不一致時標示「與演算法建議不同」，不判錯；學員可填推翻理由

### 7.2 RoB 2
- 鎖定構件：RoB 2 full guidance（Higgins et al., 2019-08-22 版），individually randomized parallel-group，effect of assignment；每個 domain 的決策表列需附 guidance 頁 / 表 / 列 locator
- Y 與 PY、N 與 PN **僅在官方 algorithm 對該分支明確合併時**視為等價
- overall：任一 domain High → High；全 Low → Low；其餘 → Some concerns。官方「多個 Some concerns 足以降低信心時可判 High」屬人為判斷，程式只提示不自動升級

### 7.3 GRADE
- 來源：GRADE Handbook（2013），每條規則附章節 locator
- 證據體設計二擇一：`rct`（起始 High）或 `observational`（起始 Low）；混合設計不支援（N3）
- 降級五因素（risk of bias、inconsistency、indirectness、imprecision、publication bias）：各因素合法值依 Handbook 逐項定義（`docs/schema.md` 列表，每項附 locator）
  - imprecision 採 GRADE 34（2022）：合法值 0／−1／−2／−3（D-G2）
  - publication bias 最多 ↓1，合法值 0／−1（D-G1；Handbook §5.2.5 p.23）
- 升級三因素（large effect、dose-response、plausible confounding）：各因素合法值依 Handbook 逐項定義；**前提：所有降級因素皆為 0**，否則停用並顯示原因
  - `observational` 起始：符合前提即可使用
  - `rct` 起始（D-G3，r2.3 修訂）：**不提供升級**，升級欄位一律由引擎設為 `not-applicable`；畫面顯示 Handbook p.24 原文（*theoretically possible … yet to find a compelling example*）與教學說明。理由：RCT 起始即 High，而升級前提是降級皆 0，此時已是最高等級，升級不可能改變結果
- 結果夾在 Very low 與 High 之間
- 非法值（超出合法幅度、RCT 設定升級）→ 拒絕寫入並提示，不靜默修正

## 8. v1 工具範圍

| toolId | 工具 | 版本標記 | 版面 |
|---|---|---|---|
| `casp-sr-rct` | CASP Systematic Reviews with Meta-Analysis of RCTs（2024） | `casp-sr-rct@2024` | PDF + 逐題 |
| `casp-sr-obs` | CASP Systematic Reviews with Meta-Analysis of Observational Studies（2024，PECO） | `casp-sr-obs@2024` | PDF + 逐題 |
| `rob2` | RoB 2，individually randomized parallel，effect of assignment (ITT) | `rob2@2019-08` | PDF + 逐 domain |
| `grade` | GRADE certainty，單一 outcome | `grade@handbook-2013` | outcome 列 + 因素卡片 |

## 9. 內容規範

- 題目原文：CASP 依官方文件逐字收錄英文並附中譯（CC BY-NC-SA 允許改作）；**RoB 2、GRADE 只收英文原文、不附中譯**（D-L1）；教學註解另立「教學補充」欄位，與官方原文分開，RoB 2／GRADE 的教學補充須為自寫解說而非翻譯
- 雙語：繁中 + 英文對照
- 每篇 mock paper 刻意埋 2–3 個教學缺陷；初稿撰寫後，**指導者審定才算數**
- 參考答案每題附來源
- PDF 關鍵字輔助標示為「關鍵字比對（候選句子）」，不稱「AI 偵測」，不影響任何判斷
- 方法學規則來源以原始文件為準（RoB 2 guidance、GRADE Handbook、CASP 官方 PDF）；Wiki 筆記目前未含 algorithm 表與升降級幅度，不得作為 oracle 來源
- CASP 內容依 CC BY-NC-SA 4.0：標示出處、非商業、衍生內容同授權

## 10. 驗收條件

**A — 判讀引擎（自動測試，`node:test`）**
- A1 RoB 2：每個官方 algorithm terminal row 至少有一個可達案例；oracle 每例附 guidance locator，且**不得由產品決策表產生或共享資料檔**；程式輸出須與 oracle 一致
- A2 A1 oracle 須含 ≥5 筆反直覺案例，涵蓋 ≥3 個 domain，類別至少包含：(i) 偏離發生但 ITT 分析適當、(ii) 有缺失資料但有證據顯示結果不受影響、(iii) 結果評估者知情但結果客觀、(iv) NI 導致的判斷、(v) Y 與 PY 不等價的分支（若官方存在）；每例註明觸發分支與 locator
- A3 對決策表**每一列**逐一 mutation（改變其結果），每次至少一項測試必須 fail；以迴圈自動執行
- A4 RoB 2 overall 矩陣：全 Low → Low；每個 domain 單獨 High → High；1 個 Some concerns → Some concerns 且無「可考慮判 High」提示；≥2 個 Some concerns、無 High → Some concerns 且有提示（不得輸出 High）；High 與 Some concerns 並存 → High
- A5 GRADE：(i) 每因素逐一驗證合法幅度上下限與非法值被拒；(ii) RCT 起始：升級欄位為 `not-applicable`，任何升級值皆拒絕寫入，匯入檔含升級值 → 拒絕；(iii) 降級加總超過可降範圍時結果為 Very low，不出錯；(iv) observational 且任一降級 ≠ 0 時升級欄位被拒；(v) 至少一組非邊界運算（如 RCT + 兩因素各 −1 → Low）
- A6 RoB 2：每個 domain 中，**每個必答位置**單獨留空時皆回傳「無法建議」；`not-applicable` 與 `unanswered` 被區分；補齊後產生建議；再清除任一必答後建議消失

**B — 匯出 / 匯入**
- B1 四套工具各有獨立撰寫的 canonical fixture（含 `unanswered`、`not-applicable`、Unicode、notes、推翻理由）；匯入 fixture → 狀態須等於 fixture 定義的期望狀態；匯出該狀態 → 須等於 fixture 原檔（欄位層級）
- B2 `docs/schema.md` 每個必填欄位皆有「缺失 / 錯型 / 非法 enum / null」反例 fixture，匯入一律拒絕並顯示欄位名稱；另含：非 JSON、未知 toolId、`toolVersion` 不符、`contentHash` 不符、`schemaVersion` 較新、未知 answer key、`paperRef` 不存在；未知額外欄位依 schema.md 明定政策處理
- B3 匯入 `user-pdf:` 作答檔 → 所有作答、判斷、notes 完整顯示；參考答案區與比對結果不存在；即使 `paperLabel` 與某 mock paper 同名也不得配對

**C — 內容完整性（自動測試）**
- C1 每個參考答案引用的段落 id 必須屬於該題在 definition 中的**允許集合**；注入一筆集合外 id → fail
- C2 每題參考答案須有合法判斷值、trim 後非空理由、至少一個可解析來源；注入缺題、空字串、占位字（如「TODO」「N/A」）→ fail
- C3 RoB 2 參考答案若 domain 判斷 ≠ 依其自身 SQ 算出的建議 → 推翻理由 trim 後非空且附方法學來源；所有此類項目輸出為指導者審定清單
- C4 CASP：每題 definition 皆有非空的官方英文與繁中欄位；RoB 2／GRADE：每題有非空官方英文欄位，且**不得出現中譯欄位**（D-L1）；教學補充為獨立欄位；注入缺英文、CASP 缺中文、RoB 2／GRADE 出現中譯欄位 → 各自 fail

**D — 介面（人工驗收清單）**
- D1 四套工具各跑場景矩陣：完整作答、留一題未答、修改答案、重新整理後續作、匯出 → 指導者匯入 → 比對；每步預期結果寫入清單
- D2 未達 completion predicate 時，滑鼠、鍵盤、重新整理後皆無法顯示參考答案；達成後可展開（不含檢視原始碼）
- D3 分別驗證：隱私模式（storage 不可用）、讀取到損壞狀態、寫入失敗；三者皆可作答與匯出、有橫幅、記憶體答案不被清除、原 storage 值不被覆寫
- D4 四套工具的作答、報告、比對、錯誤訊息、PDF 檢視各狀態，在 360 CSS px 下無頁面級水平捲動且所有操作可達；深淺色下文字、控制項、焦點框、差異標示皆可辨識
- D5 **方法學發布簽核**：(i) 指導者逐列對照 RoB 2 決策表與官方 algorithm 表、GRADE 規則與 Handbook，簽核 locator；(ii) 指導者以 1 篇真實 PDF 先獨立完成 RoB 2 的 SQ、domain、overall，再與工具輸出逐項比對，所有差異須判定為合法人工推翻，否則阻擋發布
- D6 上傳 PDF 後，DevTools Network 中無任何含 PDF 內容的請求

## 11. 動工前置與外部依賴

- **動工前置（寫引擎與匯出之前）**：
  - P1 `docs/schema.md`：匯出 JSON 每欄型別、必填、enum、未知欄位政策、`contentHash` 計算範圍
  - P2 RoB 2 oracle 與 GRADE 規則表：自原始文件謄寫並附 locator（指導者提供或確認 RoB 2 guidance PDF 與 GRADE Handbook 版本）
  - P2 進度（2026-10-14）：原始文件已 ingest 至 Wiki。RoB 2 對照表見 `wiki/source-higgins2019-RoB2-detailed-guidance`（五領域已以頁面影像逐列核對；pdf-inspector 抽出的 Table 6 欄位錯位，**oracle 不得取自文字抽取**；Table 4 原文漏列一條路徑，以 Figure 1 為準）；GRADE 規則見 `wiki/source-schunemann2013-GRADE-handbook`、`wiki/source-zeng2022-GRADE34-imprecision`
- **RoB 2／GRADE 決策**：
  - D-L1（**已決 2026-10-14**）：RoB 2 guidance／cribsheet 為 CC BY-NC-ND 4.0、GRADE Handbook 翻譯需編輯許可 → **題目只收英文原文，不收中譯**；中文僅限本專案自寫的「教學補充」（以自己的話解釋概念與判讀要點，不得逐句對應原文）
  - D-G2（**已決 2026-10-14**）：不精確採 **GRADE 34（2022）**，合法值 0／−1／−2／−3
  - D-G1（**已決 2026-10-14**）：發表偏差依 Handbook §5.2.5 內文，**最多 ↓1**（合法值 0／−1）；介面附教學提示說明 Table 5.2 寫 ↓1–2 與內文不一致
  - D-G3（**已決 2026-10-14，同日修訂**）：RCT 起始不提供升級欄位，改以 Handbook p.24 原文＋教學說明呈現。原案「預設鎖定、確認＋理由解鎖」在「降級皆 0」前提下必然停在 High，解鎖對結果永遠無效，經使用者決定移除
- **公開發布阻擋**（任一未清不得公開 GitHub Pages；2026-10-14 已全部清除）：
  - ~~朋友 repo 授權~~：移出阻擋（2026-10-14 使用者決定）。本專案只參考互動構想（不受著作權保護），未複製其程式碼、文字或樣式；比對結果：程式碼僅重疊 CASP 官方英文題目，CASP 中譯 8 字以上相同片段約 12–13%（皆為同一英文句的常見譯法，最長 15–20 字）。改為：README 保留致謝，發布前私下告知（禮貌，非條件）。日後若要沿用其程式碼，仍須先取得同意
  - ~~CASP 內容授權~~：已確認。兩份 2024 checklist PDF 第 12 頁明載 CC BY-NC-SA 4.0（2026-10-14）
  - D5 方法學簽核：RoB 2 決策表（`js/engines/rob2-tables.js`）已由指導者對照 guidance 流程圖簽核（2026-10-14）；RoB 2 範例文獻與參考答案已審定、列印已驗收（2026-10-14）。GRADE 規則已實作（`js/engines/grade.js`，各因素合法值與 locator 見 `docs/schema.md`，頁碼已對照 Handbook PDF 逐頁核對）。GRADE 規則已由指導者簽核、範例文獻與參考答案已審定、瀏覽器畫面已確認（2026-10-14）。D5 (ii) 已完成（2026-10-14）：指導者以 FIND-CKD（Heerspink 2026, NEJM, DOI 10.1056/NEJMoa2604625）主要結果 total eGFR slope 獨立評讀，五個 domain 與 overall 的判斷與演算法建議完全一致，無需人工推翻（`docs/acceptance.md`）。CASP 兩套的中譯、範例文獻與參考答案已由指導者以審定對照表（`npm run review:casp`）逐列審定，395/395 列通過（2026-10-14），審定前修正 2 處（Q10 引言用字；obs-protocol「first 30 days of use」誤譯）。**D5 全部完成，公開發布阻擋已清空**
- 手動驗收：D1–D4、D6 已執行並全部通過（2026-10-14），紀錄與修正的缺陷見 `docs/acceptance.md`
- 視覺：走 `frontend-design`，以參考實作版面為基礎微調

## 12. 後續版本

- v2：ROBINS-I V2（2025）、GAS 後端收件與全班統計

## 修訂紀錄

r1 → r2（2026-10-14，依 `.ai-review/plan-verdict.md`）：
- GRADE 規則改為逐因素合法值 + 升級前提（「僅 observational 且無降級」）、證據體二擇一、非法值拒絕：R1、R2、R3
- CASP 移除整體判斷引擎，新增 N9：R4、P2
- RoB 2 鎖定 guidance 版本與 locator；答案狀態分 `unanswered` / `not-applicable` / NI；Y/PY 等價限定分支：R5、M1
- 評讀生命週期簡化為 `toolId:paperRef` 一份；新增 N10：R6
- 新增 D9 內容不可變與 `contentHash`：R7、S1
- 新增 `docs/schema.md` 為動工前置：R8
- 新增 §6.4 completion predicate：R9
- 新增讀取失敗、PDF 失敗、純文字呈現：R10、R11、R12、S4
- `paperRef` 與 `paperLabel` 拆分：R13
- 授權分列為公開發布阻擋：M3、S6
- D3 措辭修正、`node:test` 說明：S3、S7
- 驗收 A1–D5 全面改寫為可證偽斷言；新增 C4、D6：V-A1 至 V-D5、V-X、S2、S5、P1
- 報告改為單一 HTML 報告 + 列印 CSS：P4
- 關鍵字比對定位為候選句子：P3（部分接受；使用者已決定保留）

r2 → r2.1（2026-10-14，實作 CASP 兩套時）：
- §6.2 `not-applicable` 擴及 CASP 官方跳題規則（Q9=No → Q10 免答）
- §11 CASP 授權依官方 PDF 確認為 CC BY-NC-SA 4.0，移出阻擋清單

r2.1 → r2.2（2026-10-14，使用者決策）：
- D-L1：RoB 2／GRADE 題目僅收英文原文，中文只用自寫教學補充；§9、C4 同步修改
- D-G2：不精確採 GRADE 34，合法值至 −3；§7.3 同步修改
- D-G1：發表偏差最多 ↓1；§7.3 同步修改
- D-G3：RCT 升級改為「預設鎖定、確認＋理由解鎖」；§7.3、A5(ii) 同步修改

r2.2 → r2.3（2026-10-14，實作 GRADE 時）：
- D-G3 修訂：RCT 不提供升級欄位（原「鎖定＋解鎖」在零降級前提下對結果無效）；§7.3、A5(ii)、§11 同步修改
- 升級欄位在研究設計或任一降級因素未作答前不可作答（Handbook §5.3「先降後升」）；狀態與不變量見 `docs/schema.md` GRADE 節
- §11 朋友 repo 授權移出公開發布阻擋（只參考互動構想、未複製表達；改為致謝＋告知）
