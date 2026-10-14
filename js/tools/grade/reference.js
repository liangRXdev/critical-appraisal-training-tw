// GRADE 參考答案（2026-10-14 指導者審定）。key = mock paper id。
// answers：每個項目的判斷 + 理由 + 來源；依規則不適用的升級因素為 not-applicable（不需理由）。
// judgement：最終確定性；若與演算法建議不同，overrideReason 必填且附方法學來源（SPEC C3）。

const NA = { answer: "not-applicable" };
const mock = (paragraphId) => ({ type: "mock", paragraphId });
const handbook = (locator) => ({
  type: "doc",
  citation: "GRADE Handbook (Schünemann et al., updated October 2013)",
  locator,
});
const grade34 = (locator) => ({
  type: "doc",
  citation: "Zeng L, et al. GRADE Guidance 34. J Clin Epidemiol 2022;150:216–224",
  locator,
});

export const references = {
  "iv-iron-fatigue-sr": {
    status: "reviewed",
    reviewedOn: "2026-10-14",
    answers: {
      design: {
        answer: "rct",
        rationale: "只納入隨機對照試驗，證據體全為 RCT，起始等級 High。",
        sources: [mock("sr-eligibility"), mock("sr-included"), handbook("§5.1.1, pp.11–12")],
      },
      riskOfBias: {
        answer: "-1",
        rationale:
          "74% 權重來自開放標籤、病人自評疲勞的 High 試驗，偏差方向會高估靜脈鐵劑的好處；只看低風險試驗時效果變小（1.4 分）但方向一致。問題實質但不至於推翻結論，降一級（serious）。",
        sources: [mock("sr-rob"), mock("sr-sensitivity"), handbook("§5.2.1, pp.12–14")],
      },
      inconsistency: {
        answer: "0",
        rationale: "6 篇點估計都在同一側、信賴區間大幅重疊，I² 18%，沒有需要解釋的異質性，不降。",
        sources: [mock("sr-heterogeneity"), handbook("§5.2.2, pp.14–16")],
      },
      indirectness: {
        answer: "0",
        rationale:
          "族群、介入、對照與結果都直接對應問題，疲勞量表本身就是病人重要結果。只收心衰竭病人的那篇權重僅 9%，不足以讓整體證據變成間接，不降。",
        sources: [mock("sr-eligibility"), mock("sr-included"), handbook("§5.2.3, pp.16–18")],
      },
      imprecision: {
        answer: "-1",
        rationale:
          "信賴區間 0.4 至 4.8 分跨過預設的 MID 3 分：下限代表微不足道的改善、上限代表有意義的改善，兩端會導出不同結論，降一級。區間不含害處、跨越幅度有限，不到降兩級。",
        sources: [mock("sr-methods-grade"), mock("sr-main-result"), grade34("Box 4"), handbook("§5.2.4, pp.18–22")],
      },
      publicationBias: {
        answer: "0",
        rationale:
          "檢索涵蓋試驗登錄平台並取得未發表試驗的資料；研究少於 10 篇不做漏斗圖是合理的。廠商贊助本身不足以判定發表偏差，不降。",
        sources: [mock("sr-search"), mock("sr-included"), mock("sr-funnel"), handbook("§5.2.5, pp.22–23")],
      },
      largeEffect: NA,
      doseResponse: NA,
      confounding: NA,
    },
    judgement: {
      judgement: "Low",
      rationale:
        "RCT 起始 High，偏差風險與不精確各降一級 → Low。作者只因偏差風險降級、評為 Moderate，漏掉了信賴區間跨過自己預設的 MID；「應視為優先治療」的結論強度超出 Low 確定性所能支持的程度。",
      overrideReason: "",
      sources: [mock("sr-authors-grade"), mock("sr-main-result"), handbook("§5.1 p.12; §5.4 p.26")],
    },
  },
};
