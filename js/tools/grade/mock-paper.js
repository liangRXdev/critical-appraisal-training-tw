// 虛構教學用範例文獻（系統性回顧＋統合分析）：作者、期刊、註冊號與所有數據皆為虛構，不可作為臨床依據。
// 評的 outcome：FACIT-Fatigue（8–16 週）平均差。納入 RoB 2 範例的 IRON-FAT 試驗，兩個工具可串成一堂課。
// 教學設計（2026-10-14 指導者審定）：
//   RCT 起始 High
//   Risk of bias −1（74% 權重來自開放標籤＋病人自評的 High 試驗；限低風險試驗時效果變小但方向一致）
//   Inconsistency 0（I² 18%，點估計同側、區間重疊）
//   Indirectness 0（一篇含心衰竭病人，權重 9%，不足以降級）
//   Imprecision −1（CI 0.4–4.8 跨過 MID 3 分：下限微不足道、上限有意義）
//   Publication bias 0（檢索含試驗登錄並取得未發表試驗資料；研究數 < 10 不做漏斗圖）
//   → Low；作者自評 Moderate（漏降不精確）是本篇的評讀陷阱
// items：該段落可作為哪些項目的證據（C1 允許引用集合）

export const mockPapers = [
  {
    id: "iv-iron-fatigue-sr",
    status: "reviewed",
    reviewedOn: "2026-10-14",
    fictional: true,
    title: {
      en: "Intravenous versus oral iron for fatigue in adults with non-dialysis chronic kidney disease and iron deficiency: a systematic review and meta-analysis of randomised trials",
      zh: "靜脈與口服鐵劑改善非透析慢性腎臟病缺鐵成人之疲勞：隨機試驗的系統性回顧與統合分析",
    },
    byline: "Lindqvist E, Okafor B, Huang SC（虛構作者）· Journal of Imaginary Nephrology, 2026",
    assessedResult: {
      en: "FACIT-Fatigue at 8–16 weeks (0–52, higher = less fatigue): mean difference 2.6 points (95% CI 0.4 to 4.8) favouring intravenous iron; 6 RCTs, 1,020 participants",
      zh: "8–16 週 FACIT-Fatigue（0–52 分，越高越不疲倦）：平均差 2.6 分（95% CI 0.4 至 4.8），有利於靜脈鐵劑；6 篇 RCT、1,020 人",
    },
    sections: [
      {
        heading: { en: "Methods", zh: "方法" },
        paragraphs: [
          {
            id: "sr-eligibility",
            items: ["design", "indirectness"],
            en: "We included randomised controlled trials comparing any intravenous iron preparation with oral iron in adults with chronic kidney disease stages 3–5 not on dialysis and with iron deficiency (ferritin < 100 µg/L or transferrin saturation < 20%). Non-randomised studies were excluded. The protocol was registered in PROSPERO (CRD00000000000, fictional).",
            zh: "納入比較任何靜脈鐵劑與口服鐵劑的隨機對照試驗，對象為未透析、CKD 第 3–5 期且缺鐵（ferritin < 100 µg/L 或 transferrin saturation < 20%）的成人。排除非隨機研究。計畫書已登錄於 PROSPERO（CRD00000000000，虛構）。",
          },
          {
            id: "sr-search",
            items: ["publicationBias"],
            en: "We searched MEDLINE, Embase and CENTRAL from inception to March 2026 without language restrictions, and searched ClinicalTrials.gov and the WHO ICTRP for completed trials without published results. We contacted investigators of such trials to request unpublished data.",
            zh: "檢索 MEDLINE、Embase 與 CENTRAL，自建庫至 2026 年 3 月，不限語言；並檢索 ClinicalTrials.gov 與 WHO ICTRP，找出已完成但未發表結果的試驗，聯絡其研究者索取未發表資料。",
          },
          {
            id: "sr-methods-grade",
            items: ["riskOfBias", "imprecision", "certainty"],
            en: "Two reviewers independently assessed risk of bias with RoB 2 and rated the certainty of evidence with GRADE. We pooled mean differences with a random-effects model. Before analysis we specified a minimal important difference (MID) of 3 points on the FACIT-Fatigue scale.",
            zh: "兩位評讀者獨立以 RoB 2 評估偏差風險，並以 GRADE 評定證據確定性。平均差以隨機效應模式合併。分析前預先設定 FACIT-Fatigue 的最小重要差異（MID）為 3 分。",
          },
        ],
      },
      {
        heading: { en: "Results", zh: "結果" },
        paragraphs: [
          {
            id: "sr-included",
            items: ["design", "indirectness", "publicationBias"],
            en: "Six trials (1,020 participants) met the inclusion criteria, including one completed trial whose results had not been published; its investigators provided the data. Interventions were ferric carboxymaltose (3 trials), iron sucrose (2) and ferric derisomaltose (1); all comparators were oral ferrous salts. One trial (96 participants, 9% of the weight) enrolled only people who also had chronic heart failure. Three trials were funded by manufacturers of intravenous iron.",
            zh: "共 6 篇試驗（1,020 人）符合納入條件，其中 1 篇已完成但未發表，由研究者提供資料。介入為 ferric carboxymaltose（3 篇）、iron sucrose（2 篇）與 ferric derisomaltose（1 篇）；對照皆為口服亞鐵鹽。其中 1 篇（96 人，權重 9%）只收同時有慢性心衰竭的病人。3 篇由靜脈鐵劑廠商贊助。",
          },
          {
            id: "sr-rob",
            items: ["riskOfBias"],
            en: "Four open-label trials, contributing 74% of the weight and including IRON-FAT, were at high overall risk of bias, mainly because participants who knew their allocation self-reported fatigue (Domain 4); IRON-FAT was also at high risk for missing outcome data. The two double-dummy trials (26% of the weight) were at low risk of bias.",
            zh: "4 篇開放標籤試驗（權重共 74%，含 IRON-FAT）整體偏差風險為 High，主因是知道分組的受試者自評疲勞（Domain 4）；IRON-FAT 另有缺失資料的高風險。2 篇雙模擬（double-dummy）試驗（權重 26%）為 Low。",
          },
          {
            id: "sr-main-result",
            items: ["imprecision", "inconsistency", "certainty"],
            en: "Intravenous iron improved FACIT-Fatigue scores at 8–16 weeks compared with oral iron (mean difference 2.6 points, 95% CI 0.4 to 4.8; 6 trials, 1,020 participants).",
            zh: "與口服鐵劑相比，靜脈鐵劑改善 8–16 週 FACIT-Fatigue 分數（平均差 2.6 分，95% CI 0.4 至 4.8；6 篇試驗，1,020 人）。",
          },
          {
            id: "sr-heterogeneity",
            items: ["inconsistency"],
            en: "All six point estimates favoured intravenous iron (range 1.2 to 4.1 points) and the confidence intervals overlapped widely. Statistical heterogeneity was low (I² = 18%; Chi² P = 0.30).",
            zh: "6 篇的點估計皆有利於靜脈鐵劑（1.2 至 4.1 分），信賴區間大幅重疊。統計異質性低（I² = 18%；Chi² P = 0.30）。",
          },
          {
            id: "sr-sensitivity",
            items: ["riskOfBias"],
            en: "In a sensitivity analysis restricted to the two trials at low risk of bias, the mean difference was 1.4 points (95% CI −1.6 to 4.4).",
            zh: "只納入 2 篇低偏差風險試驗的敏感度分析，平均差為 1.4 分（95% CI −1.6 至 4.4）。",
          },
          {
            id: "sr-funnel",
            items: ["publicationBias"],
            en: "Because fewer than ten trials were included, we did not construct a funnel plot or perform tests for small-study effects.",
            zh: "因納入試驗少於 10 篇，未繪製漏斗圖，也未做小型研究效應檢定。",
          },
        ],
      },
      {
        heading: { en: "Discussion", zh: "討論" },
        paragraphs: [
          {
            id: "sr-authors-grade",
            items: ["certainty", "imprecision"],
            en: "We rated the certainty of the evidence as moderate, downgrading once for risk of bias. Intravenous iron should be considered the preferred treatment for fatigue in this population.",
            zh: "我們評定證據確定性為中等（moderate），因偏差風險降一級。靜脈鐵劑應視為此族群改善疲勞的優先治療。",
          },
        ],
      },
    ],
  },
];
