// 參考答案（草稿，待指導者審定）。key = mock paper id。
// sources：mock = 範例文獻段落；doc = 方法學文件與頁碼（CASP 頁碼依 2024 官方 PDF）

const mock = (paragraphId) => ({ type: "mock", paragraphId });
const casp = (locator) => ({
  type: "doc",
  citation: "CASP Checklist: SR with MA of RCTs (2024)",
  locator,
});

export const references = {
  "melatonin-icu-delirium": {
    status: "draft",
    answers: {
      q1: {
        answer: "Y",
        rationale: "前言明確寫出 P（ICU 成人）、I（48 小時內開始的腸道褪黑激素）、C（安慰劑／常規照護）、O（以有效工具評估的譫妄發生率）、T（ICU 住院期間）、S（加護病房）。未明寫虛無假設，但 PICOT(S) 完整，判 Yes。",
        sources: [mock("rct-question"), casp("p.2, Q1 Consider")],
      },
      q2: {
        answer: "Y",
        rationale: "問題是介入的療效，只納入平行組 RCT，並排除類隨機與交叉試驗，研究設計適當。",
        sources: [mock("rct-eligibility"), casp("p.2, Q2 Consider")],
      },
      q3a: {
        answer: "N",
        rationale: "只搜尋 MEDLINE 一個資料庫，限英文，未搜尋 Embase、CENTRAL、試驗登錄平台或未發表研究，也未諮詢專家。唯一做到的是 MeSH 與手動檢索參考文獻。對照 CASP 的 8 項考量，多數未達成。",
        sources: [mock("rct-search"), casp("p.3, Q3a Consider")],
      },
      q3b: {
        answer: "Y",
        rationale: "合格條件明確；兩位審查者獨立依標題與摘要篩選，分歧由第三位裁決。",
        sources: [mock("rct-eligibility"), mock("rct-selection"), casp("p.3, Q3b Consider")],
      },
      q3c: {
        answer: "Y",
        rationale: "依全文判讀、雙人獨立、第三人裁決，並報告 κ = 0.81。",
        sources: [mock("rct-selection"), casp("p.3, Q3c Consider")],
      },
      q3d: {
        answer: "Y",
        rationale: "提供 PRISMA 流程圖，列出重複、篩除、全文排除（含理由）、納入回顧與納入統合分析的數量。",
        sources: [mock("rct-flow"), casp("p.4, Q3d Consider")],
      },
      q4: {
        answer: "Y",
        rationale: "使用適合 RCT 的 RoB 2，雙人獨立評估，並以圖 3 呈現各試驗的領域層級判斷。",
        sources: [mock("rct-rob-methods"), mock("rct-rob-results"), casp("p.4, Q4 Consider")],
      },
      q5a: {
        answer: "Y",
        rationale: "雙人獨立、依 Cochrane Handbook 指引、使用試用過的標準化表單，並擷取研究特徵與結果。",
        sources: [mock("rct-extraction"), casp("p.4, Q5a Consider")],
      },
      q5b: {
        answer: "Y",
        rationale: "表 1 呈現各試驗特徵（樣本數、年齡、性別、劑量、評估工具、追蹤期），圖 2 森林圖呈現個別結果與合併估計值。",
        sources: [mock("rct-characteristics"), casp("p.5, Q5b Consider")],
      },
      q6: {
        answer: "N",
        rationale: "I² = 68% 屬高異質性，卻使用固定效應模型，不符 CASP「有異質性時用隨機效應模型」的考量；固定效應會使信賴區間過窄。另外未做樣本數估算、未定義 MID。敏感度分析排除高風險試驗後 CI 上限達 1.00，顯示主結果不穩健。",
        sources: [mock("rct-analysis"), mock("rct-main-result"), casp("p.5–6, Q6 Consider")],
      },
      q6_1: {
        answer: "N",
        rationale: "劑量次族群是事後追加，不在計畫書中，沒有預先指定效應方向；也沒有做次族群交互作用檢定，且比較是研究間比較。",
        sources: [mock("rct-protocol"), mock("rct-subgroup-methods"), mock("rct-subgroup-results"), casp("p.6, Q6.1 Consider")],
      },
      q6_2: {
        answer: "CT",
        rationale: "本 SR 未執行統合迴歸（計畫書也未規劃）。CASP 官方沒有「不適用」選項，此處答 Can't tell 並於筆記註明「未執行」。教學討論點：若改答 No，理由應是「未以統合迴歸探討 I² 68% 的異質性來源」。",
        sources: [mock("rct-protocol"), casp("p.6–7, Q6.2 Consider")],
      },
      q7: {
        answer: "N",
        rationale: "有列出限制（試驗規模小、評估工具不一、兩篇高偏差風險），但未涵蓋評讀中發現的關鍵問題：搜尋只限單一資料庫與英文、異質性高卻用固定效應模型、敏感度分析後 CI 達 1.00、劑量次族群為事後分析。",
        sources: [mock("rct-limitations"), casp("p.7, Q7 Consider")],
      },
      q7_1: {
        answer: "N",
        rationale: "討論中把事後追加、未做交互作用檢定、屬研究間比較的劑量次族群，直接詮釋為「需要較高劑量才有效益」，沒有討論可能引入的偏差或第一型錯誤。",
        sources: [mock("rct-limitations"), mock("rct-subgroup-results"), casp("p.8, Q7.1 Consider")],
      },
      q7_2: {
        answer: "CT",
        rationale: "未執行統合迴歸，討論中也無相關內容；作答方式同 Q6.2。",
        sources: [mock("rct-limitations"), casp("p.8–9, Q7.2 Consider")],
      },
      q8: {
        answer: "CT",
        rationale: "效益估計受固定效應模型與搜尋不完整影響而不確定；不良事件只有 4/9 篇報告；完全沒有成本或資源資料。無法判斷利是否大於弊。",
        sources: [mock("rct-harms"), mock("rct-conclusion"), casp("p.9, Q8 Consider")],
      },
      q9: {
        answer: "CT",
        rationale: "族群為內外科混合 ICU，與多數醫學中心相近；但沒有台灣試驗、缺長期鎮靜病人；試驗劑量為 1–10 mg，國內可取得的劑型與劑量是否相符、是否在院內處方集，需另行確認。需依各院情境判斷。",
        sources: [mock("rct-characteristics"), mock("rct-applicability"), casp("p.9, Q9 Consider")],
      },
      q10: {
        answer: "CT",
        rationale: "缺乏資源與成本資料，效益估計也不確定，無法判斷是否帶來更大價值。",
        sources: [mock("rct-harms"), mock("rct-applicability"), casp("p.10, Q10 Consider")],
      },
      conclusion: {
        answer: "CT",
        rationale: "方法學缺陷（搜尋不完整、模型選擇不當、事後次族群過度詮釋）使「應常規使用」的結論證據不足。可作為褪黑激素可能有益的訊號，但不足以支持改變常規。",
        sources: [mock("rct-abstract"), mock("rct-conclusion"), casp("p.10, Conclusion Consider")],
      },
    },
    summary: {
      positive: "PICOT(S) 明確、計畫書預先註冊；篩選、選擇、資料擷取皆雙人獨立；使用 RoB 2 並呈現領域層級結果；PRISMA 流程圖完整。",
      negative: "只搜尋 MEDLINE 且限英文；I² 68% 卻用固定效應模型；劑量次族群為事後追加且未做交互作用檢定，卻在結論中當作主要發現；限制段落未涵蓋上述問題。",
      unknowns: "不良事件報告不完整；無成本與資源資料；未發表試驗是否存在無從得知。",
    },
  },
};
