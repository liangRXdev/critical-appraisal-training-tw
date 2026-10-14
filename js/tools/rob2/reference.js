// RoB 2 參考答案（2026-10-14 指導者審定）。key = mock paper id。
// answers：每題判斷 + 理由 + 來源；依路徑免答的題為 not-applicable（不需理由）。
// judgements：domain 與 overall 判斷；若與演算法建議不同，overrideReason 必填且附方法學來源（SPEC C3）。

const NA = { answer: "not-applicable" };
const mock = (paragraphId) => ({ type: "mock", paragraphId });
const guide = (locator) => ({
  type: "doc",
  citation: "RoB 2 detailed guidance (Higgins et al., 22 August 2019)",
  locator,
});

export const references = {
  "iron-fatigue-ckd": {
    status: "reviewed",
    reviewedOn: "2026-10-14",
    answers: {
      "1.1": { answer: "Y", rationale: "電腦產生、依院所與分期分層的隨機區組序列，有隨機成分。", sources: [mock("rob-randomisation"), guide("Box 4, 1.1, p.17")] },
      "1.2": { answer: "Y", rationale: "中央網路系統在資料不可逆輸入後才顯示分派，收案人員無法預知。", sources: [mock("rob-randomisation"), guide("Box 4, 1.2, p.17")] },
      "1.3": { answer: "N", rationale: "兩組人數相同，年齡、性別、血紅素、基線疲勞分數皆相近，沒有超出機率預期的差異。", sources: [mock("rob-baseline"), guide("Box 4, 1.3, p.17")] },
      "2.1": { answer: "Y", rationale: "開放標籤，受試者知道自己接受靜脈或口服鐵劑。", sources: [mock("rob-design"), mock("rob-interventions")] },
      "2.2": { answer: "Y", rationale: "門診人員未盲化，且兩種給藥途徑本身無法隱藏。", sources: [mock("rob-interventions")] },
      "2.3": {
        answer: "PN",
        rationale: "口服組停藥是因腸胃不良反應，5 位因血紅素 < 9 改用靜脈鐵劑是計畫書允許的常規照護；這些都是試驗外也會發生的改變，沒有因分組而另尋治療的紀錄。依 guidance，不屬於「因試驗情境而偏離」。",
        sources: [mock("rob-adherence"), guide("Box 6, 2.3, p.28")],
      },
      "2.4": NA,
      "2.5": NA,
      "2.6": {
        answer: "Y",
        rationale: "依隨機分組分析、只排除缺失結果者（mITT）；guidance 明列此類分析屬適當，缺失的問題留到 Domain 3 處理。",
        sources: [mock("rob-analysis"), guide("Box 6, 2.6, p.29")],
      },
      "2.7": NA,
      "3.1": { answer: "N", rationale: "靜脈組缺失 7.5%、口服組 28%，口服組缺失人數足以實質改變平均差。", sources: [mock("rob-flow"), guide("Box 8, 3.1, p.45")] },
      "3.2": { answer: "N", rationale: "未插補也未做缺失資料的敏感度分析，沒有證據顯示結果未受影響。", sources: [mock("rob-analysis"), guide("Box 8, 3.2, p.45")] },
      "3.3": { answer: "Y", rationale: "11 位以「持續疲倦」為由撤回同意，缺失與疲勞本身（即結果的真值）相關。", sources: [mock("rob-flow"), guide("Box 8, 3.3, p.45")] },
      "3.4": {
        answer: "Y",
        rationale: "兩組缺失比例差異大（7.5% vs 28%），且口服組退出原因與疲勞相關，符合 guidance 列舉的答 Yes 理由。",
        sources: [mock("rob-flow"), guide("Box 8, 3.4, p.45–46")],
      },
      "4.1": { answer: "N", rationale: "FACIT-Fatigue 是經驗證、適合測量疲勞的量表。", sources: [mock("rob-outcome"), guide("Box 10, 4.1, p.54")] },
      "4.2": { answer: "N", rationale: "兩組以相同表單、相同時間點自填。", sources: [mock("rob-outcome"), guide("Box 10, 4.2, p.54")] },
      "4.3": { answer: "Y", rationale: "病人自評結果的評估者就是受試者本人，而受試者知道分組。", sources: [mock("rob-outcome"), mock("rob-interventions"), guide("Box 10, 4.3, p.54")] },
      "4.4": { answer: "Y", rationale: "疲勞是主觀自評結果，知道接受哪種治療可能影響填答。", sources: [mock("rob-outcome"), guide("Box 10, 4.4, p.54")] },
      "4.5": {
        answer: "PY",
        rationale: "說明書把靜脈鐵劑描述為「更強效地恢復體力」，形成對療效的強烈預期，評估很可能受影響。",
        sources: [mock("rob-interventions"), guide("Box 10, 4.5, p.54")],
      },
      "5.1": { answer: "Y", rationale: "試驗於收案前註冊，分析計畫於資料庫鎖定前定稿公開。", sources: [mock("rob-design"), guide("Box 11, 5.1, p.63")] },
      "5.2": { answer: "N", rationale: "登錄與分析計畫只指定第 12 週 FACIT-Fatigue 一種測量與時間點，報告與之一致。", sources: [mock("rob-outcome"), guide("Box 11, 5.2, p.63")] },
      "5.3": { answer: "N", rationale: "使用預先指定的基線校正迴歸，沒有從多種分析中挑選的跡象。", sources: [mock("rob-analysis"), guide("Box 11, 5.3, p.63")] },
    },
    judgements: {
      D1: { judgement: "Low", rationale: "序列隨機、分派隱匿、基線無異常。", overrideReason: "", sources: [mock("rob-randomisation"), mock("rob-baseline"), guide("Table 4 + Figure 1, p.20")] },
      D2: {
        judgement: "Low",
        rationale: "雖然開放標籤，但偏離皆非因試驗情境，且分析依隨機分組。教學重點：未盲 ≠ 偏差。",
        overrideReason: "",
        sources: [mock("rob-adherence"), mock("rob-analysis"), guide("Table 6 + Figure 2, pp.32–33")],
      },
      D3: { judgement: "High", rationale: "缺失多、兩組不平衡、原因與結果相關，且無敏感度分析。", overrideReason: "", sources: [mock("rob-flow"), guide("Table 10 + Figure 4, pp.47–48")] },
      D4: { judgement: "High", rationale: "主觀自評結果、受試者知情，且說明書形成療效預期。", overrideReason: "", sources: [mock("rob-outcome"), mock("rob-interventions"), guide("Table 12 + Figure 5, p.57")] },
      D5: { judgement: "Low", rationale: "預先登錄與定稿的分析計畫，報告結果與之一致。", overrideReason: "", sources: [mock("rob-design"), mock("rob-outcome"), guide("Table 14 + Figure 7, p.67")] },
      overall: {
        judgement: "High",
        rationale: "D3 與 D4 皆為 High，任一 domain High 即整體 High。作者結論「應優先使用」的強度超出此結果的可信度。",
        overrideReason: "",
        sources: [mock("rob-conclusion"), guide("Table 1, p.4")],
      },
    },
  },
};
