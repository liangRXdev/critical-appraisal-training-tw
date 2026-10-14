# 實證評讀練習室（Critical Appraisal Training）

EBM 評讀教學與指導工具。學員逐題評讀範例文獻或自己的 PDF，完成後與參考答案比對；指導者匯入學員作答檔，逐題並排批改。

- 規格：[`docs/SPEC.md`](docs/SPEC.md)（r2，已經 Codex 規格覆審，見 `.ai-review/`）
- 匯出格式：[`docs/schema.md`](docs/schema.md)

## 目前狀態（v1 開發中）

| 工具 | 狀態 |
|---|---|
| CASP SR/MA of RCTs（2024） | 可用；中譯、範例文獻、參考答案為**草稿，待指導者審定** |
| CASP SR/MA of observational studies（2024） | 同上 |
| RoB 2 | 未開始；待前置 P2（RoB 2 guidance 原文與 algorithm 表） |
| GRADE | 未開始；待前置 P2（GRADE Handbook 升降級規則） |

## 開發

```bash
npm start   # http://localhost:3000（ES modules 必須經 HTTP 載入，不能直接開 file://）
npm test    # node:test，無需安裝套件
```

無建置工具，部署即上傳整個資料夾（GitHub Pages）。外部依賴只有 PDF.js 3.11.174（cdnjs，上傳 PDF 時才載入）與 Google Fonts。

## 結構

```
js/tools/<toolId>/   definition.js（題目）、mock-paper.js（虛構範例）、reference.js（參考答案）
js/engines/casp.js   逐題作答、官方跳題規則（Q9=No → Q10 免答）、完成度
js/core/             schema 驗證、匯出入、localStorage、比對、PDF
js/ui/               畫面
tests/               C1–C4 內容完整性、B1–B3 匯出入、引擎、儲存
```

**內容不可變（SPEC D9）**：發布後若修改題目、範例文獻或參考答案，必須同時把 `toolVersion` 升版；否則舊作答檔會因 `contentHash` 不符而被拒絕比對。

## 授權與內容來源

- CASP checklists © Critical Appraisal Skills Programme，以 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 授權（見官方 PDF 第 12 頁）。本專案的中譯與教學補充屬改作，同樣以 CC BY-NC-SA 4.0 釋出，僅限非商業用途。
- 範例文獻（mock paper）為虛構教學素材，作者、期刊、註冊號與數據皆非真實，不可作為臨床依據。
- 互動設計參考 unisyuan/CASP-2024-SR-MA-of-RCT；本專案未複製其程式碼。**公開發布前需取得原作者同意**（SPEC §11）。
