// 參考答案（草稿，待指導者審定）。key = mock paper id。
// sources：mock = 範例文獻段落；doc = 方法學文件與頁碼（CASP 頁碼依 2024 官方 PDF）

const mock = (paragraphId) => ({ type: "mock", paragraphId });
const casp = (locator) => ({
  type: "doc",
  citation: "CASP Checklist: SR with MA of observational studies (2024)",
  locator,
});

export const references = {
  "ppi-cap-risk": {
    status: "draft",
    answers: {
      q1: {
        answer: "Y",
        rationale: "前言完整寫出 P（社區成人）、E（目前使用 PPI）、C（未使用）、O（首次 CAP）、T（暴露期間或停藥 30 天內）、S（社區），並明寫虛無假設。",
        sources: [mock("obs-question"), casp("p.2, Q1 Consider")],
      },
      q2: {
        answer: "Y",
        rationale: "問題是藥物暴露與不良結果的關聯，納入世代與病例對照研究是適當設計。",
        sources: [mock("obs-eligibility"), casp("p.2, Q2 Consider")],
      },
      q3a: {
        answer: "Y",
        rationale: "搜尋三個主要資料庫、不限語言、使用控制詞彙並手動檢索參考文獻。未搜尋會議摘要與灰色文獻是弱點，但整體仍屬完整，可判 Yes 並在筆記註明。",
        sources: [mock("obs-search"), casp("p.3, Q3a Consider")],
      },
      q3b: {
        answer: "N",
        rationale: "標題與摘要只由單人篩選，僅抽 20% 複核，不符 CASP 建議的雙人獨立加第三人裁決，可能漏掉合格研究。",
        sources: [mock("obs-screening"), casp("p.3, Q3b Consider")],
      },
      q3c: {
        answer: "Y",
        rationale: "全文雙人獨立判讀，第三人協商，並報告 κ = 0.77。",
        sources: [mock("obs-selection"), casp("p.3–4, Q3c Consider")],
      },
      q3d: {
        answer: "Y",
        rationale: "PRISMA 流程圖列出重複、篩除、全文排除（含理由）與納入數量。",
        sources: [mock("obs-flow"), casp("p.4, Q3d Consider")],
      },
      q4: {
        answer: "Y",
        rationale: "使用 CASP 列舉的 NOS，雙人評估，並在附錄提供逐項評分；結果段指出可比性為最常見弱點。",
        sources: [mock("obs-quality-methods"), mock("obs-quality-results"), casp("p.4, Q4 Consider")],
      },
      q5a: {
        answer: "Y",
        rationale: "雙人獨立、標準化表單，並擷取未校正與校正後估計值及校正的共變項。",
        sources: [mock("obs-extraction"), casp("p.4–5, Q5a Consider")],
      },
      q5b: {
        answer: "Y",
        rationale: "表 1 呈現研究特徵，圖 2 森林圖呈現個別估計值與合併結果。",
        sources: [mock("obs-characteristics"), casp("p.5, Q5b Consider")],
      },
      q6: {
        answer: "N",
        rationale: "合併的是未校正 OR，且明知已擷取校正後估計值卻未做限於校正值的敏感度分析；把世代研究的 RR／HR 直接當 OR，並與病例對照研究混在同一主分析；16 篇研究卻未評估發表偏差。效應量指標不適當。",
        sources: [mock("obs-analysis"), mock("obs-extraction"), mock("obs-main-result"), casp("p.6, Q6 Consider")],
      },
      q6_1: {
        answer: "Y",
        rationale: "依研究設計的次族群在計畫書中預先指定，並報告交互作用檢定（p = 0.04）。但這屬研究間比較，可在筆記中註明。",
        sources: [mock("obs-protocol"), mock("obs-subgroup-results"), casp("p.6, Q6.1 Consider")],
      },
      q6_2: {
        answer: "Y",
        rationale: "統合迴歸變項在計畫書中預先指定並說明預期方向，使用隨機效應模型。",
        sources: [mock("obs-protocol"), mock("obs-subgroup-results"), casp("p.6–7, Q6.2 Consider")],
      },
      q7: {
        answer: "N",
        rationale: "列出了異質性、肺炎定義與行政資料等限制，但未提及觀察性研究最關鍵的殘餘干擾與適應症干擾（例如較衰弱、共病較多者更常被開 PPI）；也未討論合併未校正估計值與未評估發表偏差的影響。",
        sources: [mock("obs-limitations"), mock("obs-quality-results"), casp("p.7, Q7 Consider")],
      },
      q7_1: {
        answer: "Y",
        rationale: "討論中明確指出依設計的次族群差異屬研究間比較，應謹慎解讀。",
        sources: [mock("obs-limitations"), casp("p.8, Q7.1 Consider")],
      },
      q7_2: {
        answer: "CT",
        rationale: "有說明統合迴歸屬研究間比較，但未討論研究數（16 篇）是否足以支持結果，也未討論多重檢定；資訊不足以判斷。",
        sources: [mock("obs-limitations"), mock("obs-subgroup-results"), casp("p.8–9, Q7.2 Consider")],
      },
      q8: {
        answer: "CT",
        rationale: "依結果採取的行動是「避免 PPI」，但回顧未探討停藥的潛在傷害（如仍有適應症者的上消化道出血），也沒有資源資訊，無法判斷利弊平衡。",
        sources: [mock("obs-harms"), mock("obs-conclusion"), casp("p.9, Q8 Consider")],
      },
      q9: {
        answer: "CT",
        rationale: "有兩篇台灣健保資料庫研究，族群相近；但主結果混合多國研究且未校正干擾，適用性需看在地病人的共病與用藥情境。",
        sources: [mock("obs-characteristics"), mock("obs-applicability"), casp("p.9, Q9 Consider")],
      },
      q10: {
        answer: "CT",
        rationale: "缺乏停藥後果與資源資訊，無法判斷依結果行動是否帶來更大價值。",
        sources: [mock("obs-harms"), casp("p.10, Q10 Consider")],
      },
      conclusion: {
        answer: "CT",
        rationale: "結論使用因果語言（PPI「會增加」風險），但證據來自未校正估計值，且未處理適應症干擾。可作為去處方評估時的提醒訊號，不足以單獨支持「避免 PPI」的建議。",
        sources: [mock("obs-abstract"), mock("obs-conclusion"), casp("p.10, Conclusion Consider")],
      },
    },
    summary: {
      positive: "PECOT(S) 與虛無假設明確；計畫書預先註冊次族群與統合迴歸；三資料庫不限語言；全文選擇與資料擷取雙人獨立；NOS 逐項評分公開。",
      negative: "標題摘要單人篩選；合併未校正 OR 並混合不同設計與效應量；未評估發表偏差；限制未提適應症干擾；結論使用因果語言。",
      unknowns: "校正後估計值合併時效應是否仍存在；未發表研究的影響；停用 PPI 的傷害。",
    },
  },
};
