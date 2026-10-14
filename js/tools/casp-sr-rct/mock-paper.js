// 虛構教學用範例文獻：作者、期刊、註冊號與所有數據皆為虛構，不可作為臨床依據。
// 刻意埋入的教學缺陷（指導者審定前為草稿）：
//   F1 搜尋只用 MEDLINE 且限英文，未搜尋試驗登錄平台（q3a）
//   F2 I² = 68% 卻使用固定效應模型（q6）
//   F3 劑量次族群為事後追加、未做交互作用檢定卻下結論（q6_1、q7_1）
// items：該段落可作為哪些題目的證據（C1 允許引用集合）

export const mockPapers = [
  {
    id: "melatonin-icu-delirium",
    status: "draft",
    fictional: true,
    title: {
      en: "Prophylactic melatonin for the prevention of delirium in critically ill adults: a systematic review and meta-analysis of randomised controlled trials",
      zh: "預防性褪黑激素用於預防重症成人譫妄：隨機對照試驗之系統性回顧與統合分析",
    },
    byline: "Lin YC, Okafor B, Haddad R（虛構作者）· Journal of Imaginary Critical Care, 2025",
    sections: [
      {
        heading: { en: "Abstract", zh: "摘要" },
        paragraphs: [
          {
            id: "rct-abstract",
            items: ["q1", "conclusion"],
            en: "Background: Delirium affects up to half of adults in intensive care. We assessed whether prophylactic melatonin reduces the incidence of delirium. Methods: We searched MEDLINE for randomised controlled trials (RCTs) comparing melatonin with placebo or usual care in adult ICU patients. Results: Nine RCTs (1,642 participants) were included. Melatonin reduced delirium incidence (risk ratio [RR] 0.72, 95% CI 0.60–0.86). Conclusion: Melatonin should be considered for routine delirium prophylaxis in the ICU.",
            zh: "背景：加護病房成人中高達半數會發生譫妄。本研究評估預防性褪黑激素能否降低譫妄發生率。方法：我們在 MEDLINE 搜尋比較褪黑激素與安慰劑或常規照護、對象為成人 ICU 病人的隨機對照試驗（RCT）。結果：共納入 9 篇 RCT（1,642 位受試者）。褪黑激素降低譫妄發生率（風險比 RR 0.72，95% CI 0.60–0.86）。結論：應考慮將褪黑激素作為 ICU 常規譫妄預防措施。",
          },
        ],
      },
      {
        heading: { en: "Introduction", zh: "前言" },
        paragraphs: [
          {
            id: "rct-question",
            items: ["q1"],
            en: "Our objective was to determine whether, in adults admitted to an intensive care unit (population; setting), prophylactic enteral melatonin started within 48 hours of admission (intervention), compared with placebo or usual care (comparator), reduces the incidence of delirium assessed with a validated tool during the ICU stay (outcome; timeframe).",
            zh: "本研究目的：在入住加護病房的成人（族群；場域）中，入院 48 小時內開始的預防性腸道褪黑激素（介入），相較於安慰劑或常規照護（對照），能否降低 ICU 住院期間以有效工具評估的譫妄發生率（結果；時間）。",
          },
        ],
      },
      {
        heading: { en: "Methods", zh: "方法" },
        paragraphs: [
          {
            id: "rct-protocol",
            items: ["q1", "q6_1", "q6_2", "q7_1"],
            en: "The protocol was registered in advance (PROSPERO CRD42099000000, fictional). It pre-specified one subgroup analysis by mean participant age (≥ 65 vs < 65 years). No meta-regression was planned.",
            zh: "計畫書已事先註冊（PROSPERO CRD42099000000，虛構）。計畫書預先指定一項次族群分析：依受試者平均年齡（≥ 65 歲 vs < 65 歲）。未規劃統合迴歸。",
          },
          {
            id: "rct-eligibility",
            items: ["q2", "q3b"],
            en: "We included parallel-group RCTs that randomised adult ICU patients to melatonin or placebo/usual care and reported delirium incidence. Quasi-randomised trials, crossover trials and studies of melatonin receptor agonists (e.g., ramelteon) were excluded.",
            zh: "納入條件：將成人 ICU 病人隨機分配至褪黑激素或安慰劑／常規照護、並報告譫妄發生率的平行組 RCT。排除類隨機試驗、交叉試驗，以及褪黑激素受體致效劑（如 ramelteon）的研究。",
          },
          {
            id: "rct-search",
            items: ["q3a"],
            en: "We searched MEDLINE via PubMed from inception to March 2025 using MeSH terms (“Melatonin”, “Delirium”, “Intensive Care Units”) combined with free-text terms. The search was limited to English-language articles. Reference lists of included trials were hand-searched.",
            zh: "我們透過 PubMed 搜尋 MEDLINE（自建庫至 2025 年 3 月），使用 MeSH 詞彙（Melatonin、Delirium、Intensive Care Units）搭配自由詞。搜尋限英文文章。並手動檢索已納入試驗的參考文獻。",
          },
          {
            id: "rct-selection",
            items: ["q3b", "q3c"],
            en: "Two reviewers independently screened titles and abstracts and then assessed full texts against the eligibility criteria. Disagreements were resolved by a third reviewer. Agreement at full-text stage was good (κ = 0.81).",
            zh: "兩位審查者獨立篩選標題與摘要，再依合格條件判讀全文。意見分歧由第三位審查者裁決。全文階段的一致性良好（κ = 0.81）。",
          },
          {
            id: "rct-extraction",
            items: ["q5a"],
            en: "Two reviewers independently extracted data using a standardised, piloted form covering trial characteristics, participants, melatonin dose and timing, delirium assessment tool, and outcomes, following the Cochrane Handbook guidance.",
            zh: "兩位審查者依 Cochrane Handbook 的指引，使用預先試用過的標準化表單獨立擷取資料，內容涵蓋試驗特徵、受試者、褪黑激素劑量與給藥時間、譫妄評估工具及結果。",
          },
          {
            id: "rct-rob-methods",
            items: ["q4"],
            en: "Risk of bias for the primary outcome was assessed independently by two reviewers using the Cochrane RoB 2 tool.",
            zh: "主要結果的偏差風險由兩位審查者使用 Cochrane RoB 2 工具獨立評估。",
          },
          {
            id: "rct-analysis",
            items: ["q6"],
            en: "We pooled risk ratios using a Mantel–Haenszel fixed-effect model. Statistical heterogeneity was quantified with the I² statistic. A sensitivity analysis excluded trials at high risk of bias. No sample-size estimation was performed for the meta-analysis, and no minimal important difference was defined. Publication bias was not assessed because fewer than ten trials were included.",
            zh: "以 Mantel–Haenszel 固定效應模型合併風險比。以 I² 量化統計異質性。敏感度分析排除高偏差風險的試驗。統合分析未進行樣本數估算，也未定義最小重要差異。因納入試驗少於十篇，未評估發表偏差。",
          },
          {
            id: "rct-subgroup-methods",
            items: ["q6_1", "q6_2"],
            en: "In addition to the pre-specified age subgroup, we performed a post hoc subgroup analysis by melatonin dose (≥ 3 mg vs < 3 mg per day), as dosing varied considerably across trials.",
            zh: "除預先指定的年齡次族群外，由於各試驗劑量差異很大，我們另外事後追加依褪黑激素劑量（每日 ≥ 3 mg vs < 3 mg）的次族群分析。",
          },
        ],
      },
      {
        heading: { en: "Results", zh: "結果" },
        paragraphs: [
          {
            id: "rct-flow",
            items: ["q3d"],
            en: "The search identified 412 records; 38 duplicates were removed and 326 were excluded on title and abstract. Of 48 full texts assessed, 39 were excluded (reasons listed in Figure 1: 21 not randomised, 11 wrong population, 7 no delirium outcome). Nine trials were included in the review and all nine in the meta-analysis (PRISMA flow diagram, Figure 1).",
            zh: "搜尋共得 412 筆紀錄；移除 38 筆重複，依標題與摘要排除 326 筆。評估 48 篇全文，排除 39 篇（理由列於圖 1：21 篇非隨機、11 篇族群不符、7 篇無譫妄結果）。9 篇試驗納入回顧，且全部 9 篇納入統合分析（PRISMA 流程圖，圖 1）。",
          },
          {
            id: "rct-characteristics",
            items: ["q5b", "q9"],
            en: "Table 1 summarises trial characteristics: sample sizes ranged from 60 to 420; mean age 61 years; 58% male; melatonin 1–10 mg nightly; delirium assessed with CAM-ICU (6 trials) or ICDSC (3 trials); follow-up for the ICU stay. Trials were conducted in Europe (4), China (3) and Iran (2). Individual trial results and the pooled estimate are shown in the forest plot (Figure 2).",
            zh: "表 1 彙整試驗特徵：樣本數 60 至 420；平均年齡 61 歲；男性 58%；褪黑激素每晚 1–10 mg；譫妄以 CAM-ICU（6 篇）或 ICDSC（3 篇）評估；追蹤至 ICU 住院結束。試驗分別在歐洲（4 篇）、中國（3 篇）與伊朗（2 篇）進行。個別試驗結果與合併估計值見森林圖（圖 2）。",
          },
          {
            id: "rct-rob-results",
            items: ["q4"],
            en: "Four trials were at low risk of bias, three had some concerns (mainly deviations from intended interventions), and two were at high risk (missing outcome data > 20%). Domain-level judgements for each trial are presented in Figure 3.",
            zh: "4 篇試驗為低偏差風險，3 篇有些疑慮（主要為偏離預定介入），2 篇為高偏差風險（結果資料缺失 > 20%）。各試驗的領域層級判斷見圖 3。",
          },
          {
            id: "rct-main-result",
            items: ["q6"],
            en: "Melatonin reduced the incidence of delirium (9 trials; RR 0.72, 95% CI 0.60–0.86; p < 0.001), with substantial heterogeneity (I² = 68%). Excluding the two high-risk trials, the estimate was RR 0.81 (95% CI 0.66–1.00).",
            zh: "褪黑激素降低譫妄發生率（9 篇試驗；RR 0.72，95% CI 0.60–0.86；p < 0.001），異質性高（I² = 68%）。排除兩篇高風險試驗後，估計值為 RR 0.81（95% CI 0.66–1.00）。",
          },
          {
            id: "rct-subgroup-results",
            items: ["q6_1", "q7_1"],
            en: "In the post hoc dose subgroup, melatonin ≥ 3 mg was associated with a larger reduction (5 trials; RR 0.58, 95% CI 0.45–0.75) than < 3 mg (4 trials; RR 0.94, 95% CI 0.74–1.19). No test for subgroup interaction was reported. The age subgroup showed no clear difference.",
            zh: "事後追加的劑量次族群中，≥ 3 mg 的降幅較大（5 篇；RR 0.58，95% CI 0.45–0.75），< 3 mg 則為（4 篇；RR 0.94，95% CI 0.74–1.19）。未報告次族群交互作用檢定。年齡次族群未見明顯差異。",
          },
          {
            id: "rct-harms",
            items: ["q8", "q10"],
            en: "Adverse events were reported in only four trials; daytime sedation and headache did not differ between groups. No trial reported costs or resource use.",
            zh: "僅 4 篇試驗報告不良事件；日間嗜睡與頭痛在兩組間無差異。沒有試驗報告成本或資源使用。",
          },
        ],
      },
      {
        heading: { en: "Discussion", zh: "討論" },
        paragraphs: [
          {
            id: "rct-limitations",
            items: ["q7", "q7_1", "q7_2"],
            en: "Limitations include the small size of several trials, differing delirium assessment tools, and the high risk of bias in two trials. The dose–response finding suggests that higher doses are required for benefit.",
            zh: "限制包括數篇試驗規模小、譫妄評估工具不一，以及兩篇試驗偏差風險高。劑量反應的發現顯示需要較高劑量才有效益。",
          },
          {
            id: "rct-applicability",
            items: ["q9", "q10"],
            en: "Trials enrolled mixed medical–surgical ICU populations; none were conducted in East Asia outside mainland China, and none enrolled patients receiving continuous sedation beyond 72 hours.",
            zh: "試驗收納內外科混合的 ICU 族群；除中國大陸外，沒有試驗在東亞進行，也沒有收納持續鎮靜超過 72 小時的病人。",
          },
          {
            id: "rct-conclusion",
            items: ["conclusion", "q8"],
            en: "Melatonin at doses of at least 3 mg is effective in preventing ICU delirium and should be considered for routine use.",
            zh: "每日至少 3 mg 的褪黑激素能有效預防 ICU 譫妄，應考慮常規使用。",
          },
        ],
      },
    ],
  },
];
