# 規格覆審判定

- 判定日期：2026-10-14
- 對象：`.ai-review/plan-review.md`（Codex 對 `docs/SPEC.md` r1 的覆審）
- 查證：CASP 官方 referencing 頁（授權 CC BY-NC-SA 4.0）、CASP 2024 SR-RCT／SR-OBS 兩份獨立 checklist（casp-uk.net 工具頁與 CASP 課程頁）、Obsidian Wiki `source-guyatt2008-GRADE.md`／`source-sterne2019-RoB2.md`

## 1. 需求與邊界缺漏

| # | 項目 | 嚴重度 | 判定 | 理由 |
|---|---|---|---|---|
| R1 | GRADE 各因素合法幅度未定義 | High | 接受 | 屬實。Wiki 筆記只列因素名稱，未記幅度；需回 GRADE Handbook 原文逐項鎖定 |
| R2 | A5「觀察性 +2 −1 → Moderate」oracle 可疑 | High | 接受 | Handbook 5.2 的升級前提是證據體無降級理由；r1 的 oracle 可能把錯誤固化。v1 改為「任一降級 ≠ 0 時升級欄位停用並提示」，該案例移出 oracle |
| R3 | GRADE 證據體設計未定義 | High | 接受 | v1 限定純 RCT 或純觀察性；混合設計不支援，UI 要求擇一 |
| R4 | CASP 整體判斷無方法學定義 | High | 接受 | CASP 是 checklist，無官方計分或 overall algorithm。改為學員自由結論，不由程式推導 |
| R5 | RoB 2 oracle 未鎖定構件；NA 語意混用 | High | 接受 | 改為每 domain 附官方 locator；答案狀態分成未作答／路徑未觸及／NI 三種 |
| R6 | 評讀實例生命週期未定義 | High → Medium | 部分接受 | 問題屬實，但 v1 不需另存或複製。簡化為「`toolId + paperRef` 一份進行中評讀；換 paper 即新評讀；重設即刪除」，不動架構 |
| R7 | 同版本內容可變導致靜默錯比 | High | 接受 | 正中第二大威脅。加入內容不可變契約，並在匯出檔加 `contentHash` 作機械檢查 |
| R8 | schema 僅列頂層欄位 | High | 接受 | 新增 `docs/schema.md` 作為動工前置文件 |
| R9 | 「作答完成」未定義 | Medium | 接受 | 四套工具各自定義 completion predicate |
| R10 | localStorage 讀取損壞未定義 | Medium | 接受 | 補讀取失敗契約 |
| R11 | user PDF 失敗路徑、PDF.js CDN 失敗 | Medium | 部分接受 | 只定義「載入失敗 → 顯示原因、仍可作答」一條通則；不設檔案大小上限，交由瀏覽器處理 |
| R12 | `[新增需求]` 匯入文字純文字顯示 | Medium | 接受 | 雖標新增需求，但後果具體：匯入特製 JSON 可改寫畫面。屬基本衛生，不擴範圍 |
| R13 | `paperRef` 兼任 identity 與顯示 | Low | 接受 | 拆成 `paperRef`（mock id 或 `user-pdf:<uuid>`）與 `paperLabel` |
| M1 | Y/PY 等價應限於官方分支 | — | 接受 | 措辭修正 |
| M2 | CASP 2024 兩份 checklist 是否存在 | — | 拒絕 | 已查證：casp-uk.net 有獨立的 SR with MA of RCTs 與 SR with MA of Observational Studies 頁面及課程 |
| M3 | CASP 題目再發布權限 | — | 接受 | 已查到 CC BY-NC-SA 4.0，但同站另有 All rights reserved 字樣，兩者衝突。列為公開發布阻擋條件，並要求標示出處、非商業、同授權釋出 |

## 2. 架構風險

| # | 項目 | 嚴重度 | 判定 | 理由 |
|---|---|---|---|---|
| S1 | 版本身份是最難回頭的決策 | High | 接受 | 與 R7 合併處理 |
| S2 | 決策表與 oracle 共模錯誤 | High | 接受 | 兩者各附官方 locator；發布前由指導者逐列對照官方表簽核（併入 D5） |
| S3 | D3「只加資料」過度承諾 | Medium → Low | 部分接受 | 屬文件措辭問題，非架構問題，嚴重度降為 Low |
| S4 | PDF.js CDN 單點依賴 | Medium | 接受 | 與 R11 合併 |
| S5 | `[新增需求]` PDF 不離開瀏覽器的驗收 | Medium → Low | 部分接受 | 不算新需求，而是既有承諾的驗收；以 DevTools Network 人工檢查一次即可，不建自動化 |
| S6 | 授權未成為發布阻擋條件 | Medium | 接受 | 朋友 repo 與 CASP 內容分列，任一未清不得公開 |
| S7 | `node:test` 不衝突 | Low | 接受 | 補一句說明 |

## 3. 驗證策略缺口

| # | 項目 | 嚴重度 | 判定 | 理由 |
|---|---|---|---|---|
| V-A1 | oracle 共模與 Cartesian 組合 | High | 接受 | 改為每個官方 terminal row 至少一個可達案例並附 locator，捨棄 Cartesian 列舉 |
| V-A2 | 5 例集中同一 domain | Medium | 接受 | 要求涵蓋 ≥3 個 domain，並指定反直覺類別 |
| V-A3 | 只抽 3 列 mutation | High | 接受 | 改為逐列 mutation，以迴圈自動化，成本低 |
| V-A4 | overall 只測一種組合 | High | 接受 | 擴成矩陣 |
| V-A5 | GRADE 硬編三例 | High | 接受 | 改為性質測試，並與 R1、R2 連動 |
| V-A6 | 部分缺題、殘留建議 | High | 接受 | 逐位置缺題測試，並測清除答案後建議消失 |
| V-B1 | 自我往返 deep-equal | High | 接受 | 改成與外部 canonical fixture 比對 |
| V-B2 | 只拒六種頂層錯誤 | High | 接受 | 改為逐欄位反例，並明定未知欄位政策 |
| V-B3 | user PDF 被誤配 mock | Medium | 接受 | — |
| V-C1 | 引用存在但無關的段落 | Medium | 接受 | definition 已逐題對應段落，改為檢查是否在允許集合內 |
| V-C2 | 空字串或占位文字 | High | 接受 | — |
| V-C3 | 推翻理由填 N/A | High | 接受 | 加入來源欄位並列入人工審定清單 |
| V-D1 | 只跑 happy path | Medium | 接受 | 場景矩陣 |
| V-D2 | 參考答案可經鍵盤或重整展開 | Medium | 接受 | — |
| V-D3 | 只測啟動時 storage 禁用 | Medium | 部分接受 | 測讀取損壞與寫入失敗；remove 失敗不另測，因 v1 只在重設時 remove，失敗也不影響作答 |
| V-D4 | 360 px 只看首頁 | Medium | 接受 | — |
| V-D5 | 實跑一次即宣稱可上課 | High | 接受 | 提升為方法學發布簽核 |
| V-X | 內容規範（雙語、原文與補充分離）無驗收 | Medium | 接受 | 新增 C4 |

## 4. 更簡單的替代方案

| # | 項目 | 嚴重度 | 判定 | 理由 |
|---|---|---|---|---|
| P1 | 放棄 Cartesian 列舉 | Medium | 接受 | 與 V-A1 合併 |
| P2 | 移除 CASP overall 引擎 | Medium | 接受 | 與 R4 合併；`casp.js` 只做逐題與完成度 |
| P3 | 移除 PDF 關鍵字比對 | Medium | 部分接受 | 使用者已確認保留（假設 6），因此不移除；改為明確定位成「候選句子」，不影響任何判斷、不做準確度承諾 |
| P4 | Markdown 與列印報告擇一 | Low | 接受 | v1 只做一個 HTML 報告畫面，搭配列印 CSS；不另產 Markdown |
| P5 | 兩套 CASP 合併 | Low | 拒絕 | M2 已查證為兩份獨立官方 checklist |
| P6 | 保留三引擎 | Low | 接受 | 無需動作 |

## 統計

- 共 47 項：接受 39／部分接受 6／拒絕 2（範圍蔓延 0；兩項 `[新增需求]` R12 與 S5 因有具體可觀察後果，分別判為接受與部分接受）
- 修訂未整段更動架構：模組切分與 D1–D8 維持不變，只有 D3、D7 措辭調整、CASP 引擎縮減。因此不重跑 checkplan
