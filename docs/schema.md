# 匯出 JSON Schema（schemaVersion 1）

> 規格依據：`docs/SPEC.md` r2 §6、D9、驗收 B1–B3
> 實作：`js/core/schema.js`；同一個驗證器同時用於「指導者匯入」與「localStorage 載入」

## 1. 頂層欄位

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---|---|
| `schemaVersion` | integer | ✓ | 目前為 `1`。大於 1 → 拒絕（「檔案由較新版本產生」）；小於 1 或非整數 → 拒絕 |
| `toolId` | string | ✓ | 必須是已註冊且已上線的工具 |
| `toolVersion` | string | ✓ | 必須等於該工具目前的 `toolVersion` |
| `contentHash` | string | ✓ | 格式 `sha256:<64 位小寫 hex>`，必須等於目前內容計算值（§4） |
| `paperRef` | string | ✓ | `mock:<id>`（id 必須屬於該工具）或 `user-pdf:<uuid v4>` |
| `paperLabel` | string | ✓ | 1–200 字元；僅供顯示，**不參與任何配對** |
| `metadata` | object | ✓ | 見 §2 |
| `answers` | object | ✓ | 見 §3 |
| `notes` | object | ✓ | key ⊆ 題目 id；value 為 string，≤ 4000 字元 |
| `considerChecks` | object | ✓ | key ⊆ 題目 id；value 為不重複的整數陣列，每個值在 `0 … consider.length−1` |
| `toolData` | object | ✓ | 工具專屬欄位，見 §5 |
| `exportedAt` | string | ✓ | ISO 8601 日期時間（localStorage 內存為最後修改時間） |

**未知欄位政策**：頂層、`metadata`、`toolData` 內出現未定義欄位 → **拒絕**，並列出欄位名稱。理由：schemaVersion 1 尚無相容性承諾，嚴格驗證可避免日後格式漂移。

## 2. `metadata`

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---|---|
| `reviewerName` | string | ✓ | 0–100 字元（可空） |
| `appraisalDate` | string | ✓ | `""` 或 `YYYY-MM-DD` 且為合法日期 |

## 3. `answers`

- key **必須恰好等於**該工具 definition 的全部題目 id（不得缺、不得多）
- value 只能是下列之一：

| 值 | 意義 |
|---|---|
| `"Y"` / `"N"` / `"CT"` | CASP 官方選項 Yes / No / Can't tell |
| `"Y"` / `"PY"` / `"PN"` / `"N"` / `"NI"` | RoB 2 選項（Yes／Probably yes／Probably no／No／No information）|
| `"unanswered"` | 未作答 |
| `"not-applicable"` | 依官方跳題規則免答（由引擎決定，學員不能手選） |

### 跨欄位不變量（CASP；RoB 2 見 §5）

- `answers.q9 === "N"` ⇔ `answers.q10 === "not-applicable"`
  - 依據：CASP 2024 兩份 checklist 第 10 頁 Section D 註記：Q9 答 No 時不必回答 Q10
- 其他題目不得為 `"not-applicable"`

## 4. `contentHash`

- 計算：`SHA-256( canonicalJSON({ definition, mockPaper, reference }) )`
  - `definition`：該工具 definition 物件
  - `mockPaper`、`reference`：`paperRef` 為 `mock:` 時取對應物件；為 `user-pdf:` 時兩者皆為 `null`
- canonicalJSON：物件 key 依 Unicode code point 排序，無空白；陣列保留順序
- 用途：同版本內容若被改動，舊檔一律拒絕比對（D9）

## 5. `toolData`

### CASP（`casp-sr-rct`、`casp-sr-obs`）

```json
{
  "summary": { "positive": "", "negative": "", "unknowns": "" }
}
```

- 對應官方 Appraisal Summary 三欄（Positive / Negative / Unknowns）
- 每欄 string，≤ 4000 字元，可空
- 學員自由結論，程式不推導（SPEC N9）

### RoB 2（`rob2`）

```json
{
  "preliminary": { "experimental": "", "comparator": "", "outcome": "", "numericalResult": "" },
  "judgements": { "D1": "unanswered", "D2": "unanswered", "D3": "unanswered", "D4": "unanswered", "D5": "unanswered", "overall": "unanswered" },
  "overrideReasons": { "D1": "", "D2": "", "D3": "", "D4": "", "D5": "", "overall": "" }
}
```

- `preliminary.*`：string，≤ 500 字元，可空（v1 effect of interest 固定為 assignment，不存欄位）
- `judgements.*`：`"Low"`／`"Some concerns"`／`"High"`／`"unanswered"`；六個 key 必須齊全
- `overrideReasons.*`：string，≤ 4000 字元，可空；學員判斷與演算法建議不同時填寫
- `answers`：key 恰好等於全部 signalling question id（`1.1`…`5.3`）；value 為 `Y`／`PY`／`PN`／`N`／`NI`／`unanswered`／`not-applicable`，且須符合各題可用選項（3.2 無 `NI`）
- 跨欄位不變量：依條件題規則被跳過的題 **必須** 是 `not-applicable`；需作答的題 **不得** 是 `not-applicable`
- `notes`：key ⊆ signalling question id ∪ {`D1`…`D5`, `overall`}
- `considerChecks`：RoB 2 無考量清單，必須是 `{}`

### GRADE（`grade`）

```json
{
  "outcome": { "population": "", "intervention": "", "comparator": "", "outcome": "", "studies": "", "effect": "" },
  "certainty": "unanswered",
  "overrideReason": ""
}
```

- `outcome.*`：string，≤ 500 字元，可空（單一 outcome 的 SoF 列資訊）
- `certainty`：`"High"`／`"Moderate"`／`"Low"`／`"Very low"`／`"unanswered"`（學員判斷）
- `overrideReason`：string，≤ 4000 字元，可空；學員判斷與演算法建議不同時填寫
- `answers`：key 恰好等於下表 9 項；value 為該項合法值、`unanswered` 或 `not-applicable`（值一律為字串，`-1` 這類數字不合法）

| key | 合法值 | 依據（GRADE Handbook 2013） |
|---|---|---|
| `design` | `rct`（起始 High）／`observational`（起始 Low） | §5.1、§5.1.1 pp.11–12 |
| `riskOfBias` | `0`／`-1`／`-2` | Table 5.2 pp.11–12；§5.2.1 pp.12–14 |
| `inconsistency` | `0`／`-1`／`-2` | Table 5.2；§5.2.2 pp.14–16 |
| `indirectness` | `0`／`-1`／`-2` | Table 5.2；§5.2.3 pp.16–18 |
| `imprecision` | `0`／`-1`／`-2`／`-3` | §5.2.4 pp.18–22；**GRADE 34（2022）** Box 4–5（D-G2） |
| `publicationBias` | `0`／`-1` | **§5.2.5 p.23**「maximum of one level」（D-G1；Table 5.2 寫 1–2 級） |
| `largeEffect` | `0`／`+1`／`+2` | Table 5.3；§5.3.1、Table 5.9 pp.24–25 |
| `doseResponse` | `0`／`+1` | Table 5.3；§5.3.2 p.25 |
| `confounding` | `0`／`+1` | Table 5.3；§5.3.3 pp.25–26 |

- 跨欄位不變量（升級三項 `largeEffect`、`doseResponse`、`confounding`）：
  - `design = rct` → 必須是 `not-applicable`（D-G3 修訂）
  - `design = observational` 且任一降級項已答且 ≠ `0` → 必須是 `not-applicable`（Handbook §5.3 p.24）
  - `design` 未答，或尚有降級項未答（且未落入上一條）→ 必須是 `unanswered`
  - `design = observational` 且五個降級項皆為 `0` → 不得是 `not-applicable`
  - `design` 與五個降級項不得是 `not-applicable`
- 建議等級（不存檔，由引擎計算）：起始等級 + 各項幅度加總（升級只在可用時計入），結果夾在 Very low 與 High 之間
- `notes`：key ⊆ 上表 9 項 ∪ {`certainty`}
- `considerChecks`：GRADE 無考量清單，必須是 `{}`

## 6. 匯入結果

| 情況 | 行為 |
|---|---|
| 非 JSON | 拒絕：「檔案不是有效的 JSON」 |
| 任一欄位違規 | 拒絕，列出**欄位路徑**與原因（例：`answers.q3a：值必須是 Y、N、CT、unanswered 或 not-applicable`） |
| `paperRef` 為 `mock:` | 驗證通過後載入對應參考答案並排比對 |
| `paperRef` 為 `user-pdf:` | 只顯示作答，不顯示參考答案與比對；不因 `paperLabel` 與任何 mock 同名而配對 |

## 7. 文字呈現

所有字串欄位（`paperLabel`、`notes`、`reviewerName`、`toolData.summary.*`）一律以純文字顯示，不解析為 HTML。
