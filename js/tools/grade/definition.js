// GRADE certainty of evidence，單一 outcome（SPEC §7.3）
// 英文欄位取自 GRADE Handbook（Schünemann et al., updated October 2013）Table 5.1–5.3、5.9 與 §5.2–5.3 的因素名稱與短句。
// 翻譯需編輯許可：只收英文原文、不收中譯（SPEC D-L1）；teaching 為本專案自寫的教學補充，非翻譯。
// values 為各因素合法值（字串）；"0" 表示不升不降。合法幅度依 Handbook，例外：
//   imprecision 採 GRADE 34（2022）可降 3 級（D-G2）；publication bias 依 §5.2.5 最多降 1 級（D-G1）。

const HANDBOOK = "GRADE Handbook (Schünemann et al., updated October 2013)";

export const definition = {
  toolId: "grade",
  toolVersion: "grade@handbook-2013",
  engine: "grade",
  title: {
    en: "GRADE — quality (certainty) of a body of evidence for a single outcome",
  },
  shortTitle: { en: "GRADE", zh: "GRADE（證據確定性）" },
  source: {
    citation:
      "Schünemann H, Brożek J, Guyatt G, Oxman A (eds). GRADE handbook for grading quality of evidence and strength of recommendations. Updated October 2013. The GRADE Working Group. Imprecision: Zeng L, et al. GRADE Guidance 34. J Clin Epidemiol 2022;150:216–224.",
    url: "https://gdt.gradepro.org/app/handbook/handbook.html",
    license: "GRADE Handbook：重製或翻譯需經編輯同意，本工具僅引用因素名稱與短句",
  },
  levels: [
    { value: "High", en: "We are very confident that the true effect lies close to that of the estimate of the effect." },
    { value: "Moderate", en: "We are moderately confident in the effect estimate: The true effect is likely to be close to the estimate of the effect, but there is a possibility that it is substantially different" },
    { value: "Low", en: "Our confidence in the effect estimate is limited: The true effect may be substantially different from the estimate of the effect." },
    { value: "Very low", en: "We have very little confidence in the effect estimate: The true effect is likely to be substantially different from the estimate of effect" },
  ],
  levelsLocator: "Table 5.1, §5, p.11",
  outcomeFields: [
    { id: "population", label: { en: "Population" } },
    { id: "intervention", label: { en: "Intervention" } },
    { id: "comparator", label: { en: "Comparison" } },
    { id: "outcome", label: { en: "Outcome" } },
    { id: "studies", label: { en: "No. of participants (studies)" } },
    { id: "effect", label: { en: "Effect estimate (95% CI)" } },
  ],
  design: {
    id: "design",
    locator: "§5.1 and §5.1.1, pp.11–12",
    options: [
      { value: "rct", en: "Randomized trials", start: "High" },
      { value: "observational", en: "Observational studies", start: "Low" },
    ],
    keywords: ["randomised", "randomized", "cohort", "case-control", "observational", "included studies"],
    teaching:
      "起始等級只看證據體的研究設計：RCT 從 High 開始，觀察性研究從 Low 開始。本工具只處理單一設計的證據體；同一個 outcome 同時有 RCT 與觀察性研究時，請分開評。",
  },
  downgrade: [
    {
      id: "riskOfBias",
      name: { en: "Limitations in study design or execution (risk of bias)" },
      locator: "Table 5.2 pp.11–12; §5.2.1 pp.12–14",
      values: ["0", "-1", "-2"],
      keywords: ["risk of bias", "RoB 2", "blinding", "open-label", "allocation", "sensitivity analysis"],
      teaching:
        "看的是整個證據體，而不是逐篇平均。關鍵問題：權重大的研究是否有實質偏差風險？排除高風險研究後結果是否改變？少數小研究有問題、但主要權重來自低風險研究時，通常不降。",
      note: null,
    },
    {
      id: "inconsistency",
      name: { en: "Inconsistency of results" },
      locator: "Table 5.2 pp.11–12; §5.2.2 pp.14–16",
      values: ["0", "-1", "-2"],
      keywords: ["heterogeneity", "I2", "I²", "subgroup", "forest plot", "Chi"],
      teaching:
        "先看森林圖：點估計是否落在同一側、信賴區間是否大致重疊，再參考 I² 與異質性檢定。I² 高但所有研究都指向同一個臨床結論時，不一定要降；找得到可信的次族群解釋時，應分開呈現而不是降級。",
      note: null,
    },
    {
      id: "indirectness",
      name: { en: "Indirectness of evidence" },
      locator: "Table 5.2 pp.11–12; §5.2.3 pp.16–18",
      values: ["0", "-1", "-2"],
      keywords: ["population", "eligibility", "inclusion criteria", "surrogate", "indirect", "comparator"],
      teaching:
        "把證據的 P、I、C、O 和你要回答的問題逐項比對：族群、介入、對照、結果是否一致？用替代指標（如實驗室數值）代替病人重要結果，或只有間接比較時，通常要降。",
      note: null,
    },
    {
      id: "imprecision",
      name: { en: "Imprecision" },
      locator: "Table 5.2 pp.11–12; §5.2.4 pp.18–22; GRADE 34 (2022) Box 4–5",
      values: ["0", "-1", "-2", "-3"],
      keywords: ["confidence interval", "95% CI", "MID", "minimal important difference", "optimal information size", "sample size"],
      teaching:
        "以信賴區間對照決策閾值（MID 或無效線）：區間跨過閾值、兩端會導出不同結論時就降。跨得越明顯降得越多；區間寬到同時包含重要的好處與重要的壞處時，可降到 3 級。區間沒跨閾值、但效果大到不太可信時，再檢查樣本數是否達到 OIS。",
      note:
        "本工具採 GRADE Guidance 34（2022）：不精確最多可降 3 級。2013 版 Handbook 每個因素上限為 2 級，引用時請註明採用的版本（SPEC D-G2）。",
    },
    {
      id: "publicationBias",
      name: { en: "Publication bias" },
      locator: "Table 5.2 pp.11–12; §5.2.5 pp.22–23",
      values: ["0", "-1"],
      keywords: ["publication bias", "funnel plot", "Egger", "trial registry", "unpublished", "grey literature"],
      teaching:
        "漏斗圖與檢定在研究數少時判讀力很低，不能只靠它。要看的是：檢索是否涵蓋試驗登錄與未發表資料？是否全是小型、由廠商贊助的正向研究？有沒有已完成卻未發表的試驗？",
      note:
        "Handbook Table 5.2 把發表偏差列為可降 1 或 2 級，但 §5.2.5 內文明寫 GRADE suggests rating down quality of evidence for publication bias by a maximum of one level（p.23）。本工具依內文，最多降 1 級（SPEC D-G1）。",
    },
  ],
  upgrade: [
    {
      id: "largeEffect",
      name: { en: "Large magnitude of effect" },
      locator: "Table 5.3 pp.11–12; §5.3.1 and Table 5.9, pp.24–25",
      values: ["0", "+1", "+2"],
      keywords: ["relative risk", "risk ratio", "hazard ratio", "RR", "HR", "odds ratio"],
      teaching:
        "Table 5.9：RR > 2 或 < 0.5（直接證據、沒有可信的干擾因子）可升 1 級；RR > 5 或 < 0.2（另需偏差風險與精確度都沒有嚴重問題）可升 2 級。效果量以 OR 表示時，先換算成 RR 再判斷。要看信賴區間，而不只是點估計。",
      note: null,
    },
    {
      id: "doseResponse",
      name: { en: "Dose-response gradient" },
      locator: "Table 5.3 pp.11–12; §5.3.2, p.25",
      values: ["0", "+1"],
      keywords: ["dose-response", "dose response", "gradient", "trend", "per increase"],
      teaching: "暴露量越大、效果越明顯的一致梯度，會增加因果關係的可信度，最多升 1 級。",
      note: null,
    },
    {
      id: "confounding",
      name: { en: "All plausible confounding would reduce the demonstrated effect or increase the effect if no effect was observed" },
      locator: "Table 5.3 pp.11–12; §5.3.3, pp.25–26",
      values: ["0", "+1"],
      keywords: ["confounding", "confounder", "adjusted", "residual", "sicker patients"],
      teaching:
        "所有可信的殘餘干擾都會讓觀察到的效果「變小」時（例如病情較重的人才接受治療，卻仍然表現較好），真實效果可能更大，可升 1 級。沒有觀察到效果、而干擾理應會製造假效果時，同理。",
      note: null,
    },
  ],
  upgradeRule: {
    locator: "§5.3, p.24",
    quote:
      "The decision to rate up quality of evidence should only be made when serious limitations in any of the 5 areas reducing the quality of evidence are absent.",
    rctQuote: "Although it is theoretically possible to rate up results from randomized control trials, we have yet to find a compelling example of such an instance.",
    rctTeaching:
      "RCT 證據體從 High 開始，而升級的前提是五個降級因素都沒有問題，此時已經是 High，沒有再升的空間。所以本工具對 RCT 不提供升級欄位：升級因素是讓觀察性研究在特殊情況下取得較高信心的機制。",
  },
  certainty: {
    locator: "§5.1 p.12 (factors are additive; judgement on a continuum); §5.4 p.26",
    teaching:
      "各因素可以相加，但 GRADE 不是計分系統，最終等級是你對整體信心的判斷。多個因素都「有點疑慮但不到降級」時，可以挑其中一兩項降級並註明理由；已經降過級時，邊緣的疑慮不必重複扣分。程式算出的等級只是建議，與你的判斷不同時請寫下理由。",
  },
};
