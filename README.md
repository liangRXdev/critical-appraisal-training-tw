# 實證評讀練習室（Critical Appraisal Training）

EBM 評讀教學與指導工具。學員逐題評讀範例文獻或自己的 PDF，完成後與參考答案比對；指導者匯入學員作答檔，逐題並排批改。

- 規格：[`docs/SPEC.md`](docs/SPEC.md)（r2，已經 Codex 規格覆審，見 `.ai-review/`）
- 匯出格式：[`docs/schema.md`](docs/schema.md)

## 目前狀態（v1 開發中）

| 工具 | 狀態 |
|---|---|
| CASP SR/MA of RCTs（2024） | 可用；官方英文原文＋中譯；中譯、範例文獻與參考答案已由指導者審定（2026-10-14） |
| CASP SR/MA of observational studies（2024） | 同上 |
| RoB 2（parallel、effect of assignment） | 可用；題目為官方英文原文（CC BY-NC-ND，未翻譯），中文為自寫教學補充；決策表、範例文獻與參考答案已由指導者審定（2026-10-14） |
| GRADE（單一 outcome） | 可用；因素名稱為 Handbook 英文原文，中文為自寫教學補充；規則依 SPEC D-G1～D-G3；規則、範例文獻與參考答案已由指導者審定（2026-10-14） |

## 開發

```bash
npm start   # http://localhost:3000（ES modules 必須經 HTTP 載入，不能直接開 file://）
npm test    # node:test，無需安裝套件
npm run review:casp   # 產生 CASP 中譯與參考答案的審定對照表 → review/casp-review.html（不提交）
```

無建置工具，部署即上傳整個資料夾（GitHub Pages）。外部依賴只有 PDF.js 3.11.174（cdnjs，上傳 PDF 時才載入）與 Google Fonts。

## 結構

```
js/tools/<toolId>/   definition.js（題目）、mock-paper.js（虛構範例）、reference.js（參考答案）
js/engines/casp.js   逐題作答、官方跳題規則（Q9=No → Q10 免答）、完成度
js/engines/rob2.js   條件題路由、SQ → domain 建議判斷、overall 建議；決策表在 rob2-tables.js
js/engines/grade.js  起始等級、五降三升的合法幅度、升級前提（僅 observational 且零降級）、建議等級
js/engines/index.js  依工具分派：初始狀態、完成度、匯入驗證
js/core/             schema 驗證、匯出入、localStorage、比對、PDF
js/ui/               畫面
tests/               C1–C4 內容完整性、B1–B3 匯出入、引擎、儲存；RoB 2 以 tests/rob2-oracle.js（依流程圖獨立撰寫）窮舉比對＋逐列 mutation；GRADE 以測試內寫死的規則窮舉比對
```

**內容不可變（SPEC D9）**：發布後若修改題目、範例文獻或參考答案，必須同時把 `toolVersion` 升版；否則舊作答檔會因 `contentHash` 不符而被拒絕比對。

## 授權與內容來源

- GRADE Handbook（Schünemann et al., 2013）重製或翻譯需經編輯同意：本專案只引用因素名稱與短句原文，不翻譯（SPEC D-L1），中文說明為自寫教學補充。
- RoB 2 © RoB 2 Development Group，以 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) 授權：本專案只收錄英文原文、不翻譯（SPEC D-L1），中文說明為自寫教學補充。
- CASP checklists © Critical Appraisal Skills Programme，以 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 授權（見官方 PDF 第 12 頁）。本專案的中譯與教學補充屬改作，同樣以 CC BY-NC-SA 4.0 釋出，僅限非商業用途。
- 範例文獻（mock paper）為虛構教學素材，作者、期刊、註冊號與數據皆非真實，不可作為臨床依據。
- 互動設計參考 unisyuan/CASP-2024-SR-MA-of-RCT，感謝原作者；本專案未複製其程式碼、文字或樣式。
