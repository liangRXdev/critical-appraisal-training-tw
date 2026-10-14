// 虛構教學用範例文獻：作者、期刊、註冊號與所有數據皆為虛構，不可作為臨床依據。
// 刻意埋入的教學缺陷（指導者審定前為草稿）：
//   F1 標題與摘要篩選由單人執行，僅抽 20% 複核（q3b）
//   F2 合併未校正（crude）OR，並把病例對照與世代研究混在同一主分析；16 篇未評估發表偏差（q6）
//   F3 限制段落未提及殘餘干擾與適應症干擾（q7）
// items：該段落可作為哪些題目的證據（C1 允許引用集合）

export const mockPapers = [
  {
    id: "ppi-cap-risk",
    status: "draft",
    fictional: true,
    title: {
      en: "Proton pump inhibitor use and the risk of community-acquired pneumonia in adults: a systematic review and meta-analysis of observational studies",
      zh: "成人使用質子幫浦抑制劑與社區型肺炎風險：觀察性研究之系統性回顧與統合分析",
    },
    byline: "Wu HT, Moreau C, Adeyemi K（虛構作者）· Journal of Imaginary Pharmacoepidemiology, 2025",
    sections: [
      {
        heading: { en: "Abstract", zh: "摘要" },
        paragraphs: [
          {
            id: "obs-abstract",
            items: ["q1", "conclusion"],
            en: "Background: Proton pump inhibitors (PPIs) are among the most prescribed drugs worldwide. We examined whether PPI use is associated with community-acquired pneumonia (CAP). Methods: Systematic search of three databases for cohort and case-control studies. Results: Sixteen studies were included. PPI use was associated with increased odds of CAP (pooled OR 1.49, 95% CI 1.32–1.68). Conclusion: PPI use increases the risk of CAP; prescribers should avoid PPIs in patients at risk of pneumonia.",
            zh: "背景：質子幫浦抑制劑（PPI）是全球處方量最高的藥物之一。本研究探討 PPI 使用是否與社區型肺炎（CAP）相關。方法：系統性搜尋三個資料庫中的世代與病例對照研究。結果：共納入 16 篇研究。PPI 使用與 CAP 勝算增加相關（合併 OR 1.49，95% CI 1.32–1.68）。結論：PPI 使用會增加 CAP 風險；處方者應避免對肺炎高風險病人使用 PPI。",
          },
        ],
      },
      {
        heading: { en: "Introduction", zh: "前言" },
        paragraphs: [
          {
            id: "obs-question",
            items: ["q1"],
            en: "We aimed to assess whether, among community-dwelling adults (population; setting), current use of a PPI (exposure), compared with non-use (comparator), is associated with a first episode of CAP (outcome) during the period of exposure or within 30 days of discontinuation (timeframe). Our null hypothesis was that PPI use is not associated with CAP.",
            zh: "本研究目的：在社區成人（族群；場域）中，目前使用 PPI（暴露）相較於未使用（對照），是否與暴露期間或停藥 30 天內首次發生 CAP（結果；時間）相關。虛無假設為 PPI 使用與 CAP 無關。",
          },
        ],
      },
      {
        heading: { en: "Methods", zh: "方法" },
        paragraphs: [
          {
            id: "obs-protocol",
            items: ["q1", "q6_1", "q6_2"],
            en: "The protocol was registered (PROSPERO CRD42099000001, fictional) and pre-specified subgroup analyses by study design (cohort vs case-control) and a random-effects meta-regression on mean duration of PPI exposure, with the hypothesis that risk would be highest in the first 30 days of use.",
            zh: "計畫書已註冊（PROSPERO CRD42099000001，虛構），預先指定依研究設計（世代 vs 病例對照）的次族群分析，以及以平均 PPI 暴露時間為變項的隨機效應統合迴歸，假設風險在用藥前 30 天最高。",
          },
          {
            id: "obs-eligibility",
            items: ["q2", "q3b"],
            en: "Eligible studies were cohort or case-control studies in adults that compared PPI users with non-users and reported CAP as an outcome. Randomised trials, studies limited to hospital-acquired or ventilator-associated pneumonia, and studies without a non-user comparator were excluded.",
            zh: "合格研究為比較 PPI 使用者與未使用者、並以 CAP 為結果的成人世代或病例對照研究。排除隨機試驗、只探討院內感染或呼吸器相關肺炎的研究，以及沒有未使用者對照組的研究。",
          },
          {
            id: "obs-search",
            items: ["q3a"],
            en: "MEDLINE, Embase and Web of Science were searched from inception to January 2025 without language restriction, using controlled vocabulary (MeSH/Emtree) and free-text terms. Reference lists of included studies and relevant reviews were hand-searched. Conference abstracts and grey literature were not searched.",
            zh: "搜尋 MEDLINE、Embase 與 Web of Science，自建庫至 2025 年 1 月，不限語言，使用控制詞彙（MeSH／Emtree）與自由詞。手動檢索已納入研究與相關回顧的參考文獻。未搜尋會議摘要與灰色文獻。",
          },
          {
            id: "obs-screening",
            items: ["q3b"],
            en: "Titles and abstracts were screened by one reviewer; a random 20% sample was checked by a second reviewer.",
            zh: "標題與摘要由一位審查者篩選；另隨機抽取 20% 由第二位審查者複核。",
          },
          {
            id: "obs-selection",
            items: ["q3c"],
            en: "Full texts were assessed independently by two reviewers, with disagreements resolved by consensus with a third reviewer (κ = 0.77).",
            zh: "全文由兩位審查者獨立判讀，分歧由第三位審查者協商解決（κ = 0.77）。",
          },
          {
            id: "obs-extraction",
            items: ["q5a", "q6"],
            en: "Two reviewers independently extracted study characteristics, exposure and outcome definitions, crude and adjusted effect estimates, and covariates adjusted for, using a standardised form.",
            zh: "兩位審查者使用標準化表單，獨立擷取研究特徵、暴露與結果定義、未校正與校正後效應估計值，以及校正的共變項。",
          },
          {
            id: "obs-quality-methods",
            items: ["q4"],
            en: "Study quality was assessed with the Newcastle–Ottawa Scale (NOS) by two reviewers. Item-level ratings for each study are provided in Supplementary Table S2.",
            zh: "由兩位審查者以 Newcastle–Ottawa Scale（NOS）評估研究品質。各研究的逐項評分見附錄表 S2。",
          },
          {
            id: "obs-analysis",
            items: ["q6"],
            en: "Because adjusted estimates were reported inconsistently, we pooled crude odds ratios from all 16 studies in a single DerSimonian–Laird random-effects model, treating risk ratios and hazard ratios from cohort studies as approximations of odds ratios. Heterogeneity was assessed with I². No sensitivity analysis restricted to adjusted estimates was performed. Publication bias was not assessed.",
            zh: "由於各研究報告的校正後估計值不一致，我們以 DerSimonian–Laird 隨機效應模型合併全部 16 篇研究的未校正勝算比，並將世代研究的風險比與危險比視為勝算比的近似值。以 I² 評估異質性。未進行限於校正後估計值的敏感度分析。未評估發表偏差。",
          },
        ],
      },
      {
        heading: { en: "Results", zh: "結果" },
        paragraphs: [
          {
            id: "obs-flow",
            items: ["q3d"],
            en: "Of 2,318 records, 604 duplicates were removed and 1,622 excluded at title/abstract stage. Ninety-two full texts were assessed; 76 were excluded (reasons in Figure 1). Sixteen studies (10 case-control, 6 cohort) were included in the review and the meta-analysis (PRISMA flowchart, Figure 1).",
            zh: "2,318 筆紀錄中，移除 604 筆重複，標題與摘要階段排除 1,622 筆。評估 92 篇全文，排除 76 篇（理由見圖 1）。共 16 篇研究（10 篇病例對照、6 篇世代）納入回顧與統合分析（PRISMA 流程圖，圖 1）。",
          },
          {
            id: "obs-characteristics",
            items: ["q5b", "q9"],
            en: "Table 1 lists study characteristics: settings were the United Kingdom (5), the Netherlands (3), the United States (4), Denmark (2) and Taiwan (2); total participants approximately 5.1 million; mean age 52–74 years. Twelve studies used electronic health records or claims databases. Study-level estimates and the pooled result are shown in Figure 2 (forest plot).",
            zh: "表 1 列出研究特徵：場域為英國（5）、荷蘭（3）、美國（4）、丹麥（2）與台灣（2）；總受試者約 510 萬人；平均年齡 52–74 歲。12 篇使用電子病歷或理賠資料庫。各研究估計值與合併結果見圖 2（森林圖）。",
          },
          {
            id: "obs-quality-results",
            items: ["q4", "q7"],
            en: "Eleven studies scored ≥ 7 on the NOS and were considered high quality. The comparability item was most frequently unmet: six studies did not adjust for markers of frailty or comorbidity burden.",
            zh: "11 篇研究 NOS 分數 ≥ 7，視為高品質。最常未達標的是可比性項目：6 篇研究未校正衰弱或共病負擔指標。",
          },
          {
            id: "obs-main-result",
            items: ["q6"],
            en: "PPI use was associated with CAP (16 studies; pooled crude OR 1.49, 95% CI 1.32–1.68; I² = 84%).",
            zh: "PPI 使用與 CAP 相關（16 篇研究；合併未校正 OR 1.49，95% CI 1.32–1.68；I² = 84%）。",
          },
          {
            id: "obs-subgroup-results",
            items: ["q6_1", "q6_2", "q7_1", "q7_2"],
            en: "In the pre-specified subgroup analysis, the association was stronger in case-control studies (OR 1.62, 95% CI 1.39–1.89) than in cohort studies (OR 1.31, 95% CI 1.12–1.53; p for interaction = 0.04). In meta-regression, shorter mean exposure duration was associated with larger effect sizes (p = 0.02).",
            zh: "預先指定的次族群分析中，病例對照研究的關聯（OR 1.62，95% CI 1.39–1.89）強於世代研究（OR 1.31，95% CI 1.12–1.53；交互作用 p = 0.04）。統合迴歸中，平均暴露時間越短，效應量越大（p = 0.02）。",
          },
          {
            id: "obs-harms",
            items: ["q8", "q10"],
            en: "The review did not examine outcomes of PPI discontinuation, such as rebound acid hypersecretion or upper gastrointestinal bleeding in patients with ongoing indications.",
            zh: "本回顧未探討停用 PPI 的後果，例如胃酸反彈性分泌過多，或仍有適應症病人的上消化道出血。",
          },
        ],
      },
      {
        heading: { en: "Discussion", zh: "討論" },
        paragraphs: [
          {
            id: "obs-limitations",
            items: ["q7", "q7_1", "q7_2"],
            en: "Limitations include substantial heterogeneity, differences in pneumonia definitions across studies, and reliance on administrative data. The subgroup difference by design and the meta-regression finding are based on between-study comparisons and should be interpreted cautiously.",
            zh: "限制包括高異質性、各研究的肺炎定義不同，以及依賴行政資料。依研究設計的次族群差異與統合迴歸發現屬研究間比較，應謹慎解讀。",
          },
          {
            id: "obs-applicability",
            items: ["q9", "q10"],
            en: "Two included studies used Taiwan’s National Health Insurance Research Database; the remaining studies were from Western populations.",
            zh: "兩篇納入研究使用台灣全民健康保險研究資料庫；其餘研究來自西方族群。",
          },
          {
            id: "obs-conclusion",
            items: ["conclusion", "q8"],
            en: "PPI use increases the risk of community-acquired pneumonia. Clinicians should avoid prescribing PPIs to patients at risk of pneumonia.",
            zh: "PPI 使用會增加社區型肺炎風險。臨床醫師應避免對肺炎高風險病人處方 PPI。",
          },
        ],
      },
    ],
  },
];
