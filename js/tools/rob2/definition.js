// RoB 2（individually-randomized parallel-group trial；effect of assignment to intervention）
// 英文欄位逐字取自 RoB 2 detailed guidance（2019-08-22）Box 4、6、8、10、11。
// 授權 CC BY-NC-ND 4.0：只收英文原文、不收中譯（SPEC D-L1）；teaching 為本專案自寫的教學補充，非翻譯。

const YPY_NI = ["Y", "PY", "NI"];
const NPN_NI = ["N", "PN", "NI"];
const FULL = ["Y", "PY", "PN", "N", "NI"];

export const definition = {
  toolId: "rob2",
  toolVersion: "rob2@2019-08",
  engine: "rob2",
  title: {
    en: "Revised Cochrane risk-of-bias tool for randomized trials (RoB 2) — individually-randomized parallel-group trials, effect of assignment to intervention",
  },
  shortTitle: { en: "RoB 2", zh: "RoB 2（RCT 偏差風險）" },
  source: {
    citation:
      "Higgins JPT, Savović J, Page MJ, Sterne JAC, on behalf of the RoB 2 Development Group. Revised Cochrane risk-of-bias tool for randomized trials (RoB 2). Detailed guidance, version of 22 August 2019.",
    url: "https://www.riskofbias.info/welcome/rob-2-0-tool/current-version-of-rob-2",
    license: "CC BY-NC-ND 4.0",
  },
  options: [
    { value: "Y", label: "Yes" },
    { value: "PY", label: "Probably yes" },
    { value: "PN", label: "Probably no" },
    { value: "N", label: "No" },
    { value: "NI", label: "No information" },
  ],
  judgements: ["Low", "Some concerns", "High"],
  teachingIntro:
    "回答選項中，Yes 與 Probably yes、No 與 Probably no 對偏差判斷的意涵相同；差別只在「有明確證據」或「是推論判斷」。No information 只在資料不足、而且依試驗情境也無法合理推斷時才用。灰色的題目代表依前面的答案不需作答（Not applicable）。",
  preliminary: {
    fields: [
      { id: "experimental", label: { en: "Experimental intervention" } },
      { id: "comparator", label: { en: "Comparator" } },
      { id: "outcome", label: { en: "Outcome being assessed for risk of bias" } },
      { id: "numericalResult", label: { en: "Numerical result being assessed (e.g. RR = 1.52 (95% CI 0.83 to 2.77))" } },
    ],
    effect: "assignment",
    effectNote: "本工具 v1 只評 effect of assignment to intervention（‘intention-to-treat’ effect）；adhering to intervention 的題組不在範圍內。",
  },
  domains: [
    {
      id: "D1",
      title: { en: "Bias arising from the randomization process" },
      locator: "Box 4, Table 4 and Figure 1, pp.17–20",
      keywords: ["random", "randomised", "randomized", "allocation", "concealment", "concealed", "sealed envelope", "central", "baseline", "Table 1"],
      teaching:
        "判斷 Low 的關鍵是「分派隱匿」：只要 1.2 是 No／Probably no，不論其他題，建議判斷就是 High。基線差異只有在不像機率造成時才算問題；少數 p < 0.05 的差異通常與機率相容。",
      questions: [
        {
          id: "1.1",
          text: "Was the allocation sequence random?",
          options: FULL,
          askIf: null,
          teaching: "看 Methods 怎麼產生分派序列：電腦亂數、亂數表、擲硬幣算隨機；交替、生日、病歷號、醫師決定則不是。只寫「隨機分派」而無細節時答 No information。",
        },
        {
          id: "1.2",
          text: "Was the allocation sequence concealed until participants were enrolled and assigned to interventions?",
          options: FULL,
          askIf: null,
          teaching: "中央電腦或電話分派、獨立藥局配發、編號且不透光的密封信封，都算隱匿。若收案人員能預知下一個分派，就沒有隱匿。",
        },
        {
          id: "1.3",
          text: "Did baseline differences between intervention groups suggest a problem with the randomization process?",
          options: FULL,
          askIf: null,
          teaching: "看基本資料表：組別人數是否明顯偏離分派比例、顯著差異是否遠多於機率預期、關鍵預後因子是否有極不可能由機率造成的失衡。本題答案不應回頭改變 1.1、1.2 的答案。",
        },
      ],
    },
    {
      id: "D2",
      title: { en: "Bias due to deviations from intended interventions (effect of assignment to intervention)" },
      locator: "Box 6, Table 6 and Figure 2, pp.28–33",
      keywords: ["blind", "masked", "open-label", "placebo", "deviation", "adherence", "crossover", "switched", "intention-to-treat", "intention to treat", "per-protocol", "per protocol", "modified intention"],
      parts: [
        { id: "part1", label: "Part 1：2.1–2.5（因試驗情境而偏離）", questions: ["2.1", "2.2", "2.3", "2.4", "2.5"] },
        { id: "part2", label: "Part 2：2.6–2.7（分析方法）", questions: ["2.6", "2.7"] },
      ],
      teaching:
        "未盲本身不等於偏差。要繼續問：偏離是不是「因為身在試驗中」才發生（例如對照組知道自己沒拿到新藥而另找治療）？會不會影響結果？兩組是否平衡？Part 2 看分析是否依隨機分組（ITT 或排除缺失結果者的 mITT 都算適當）。兩部分都要作答。",
      questions: [
        {
          id: "2.1",
          text: "Were participants aware of their assigned intervention during the trial?",
          options: FULL,
          askIf: null,
          teaching: "有安慰劑或假處置通常答 No；若某組有明顯特有的副作用讓受試者猜得出來，答 Yes／Probably yes。",
        },
        {
          id: "2.2",
          text: "Were carers and people delivering the interventions aware of participants' assigned intervention during the trial?",
          options: FULL,
          askIf: null,
          teaching: "若分派沒有隱匿，照護者通常也知道分組。",
        },
        {
          id: "2.3",
          text: "If Y/PY/NI to 2.1 or 2.2: Were there deviations from the intended intervention that arose because of the trial context?",
          options: FULL,
          askIf: { any: [{ q: "2.1", in: YPY_NI }, { q: "2.2", in: YPY_NI }] },
          teaching: "只算「因為在試驗中」才發生的偏離。疾病惡化而換藥、因急性毒性停藥這類在試驗外也會發生的改變，答 No／Probably no。",
        },
        {
          id: "2.4",
          text: "If Y/PY to 2.3: Were these deviations likely to have affected the outcome?",
          options: FULL,
          askIf: { all: [{ q: "2.3", in: ["Y", "PY"] }] },
          teaching: "偏離只有在會影響結果時才造成偏差。",
        },
        {
          id: "2.5",
          text: "If Y/PY/NI to 2.4: Were these deviations from intended intervention balanced between groups?",
          options: FULL,
          askIf: { all: [{ q: "2.4", in: YPY_NI }] },
          teaching: "兩組偏離程度相近時，對效果估計的影響較小。",
        },
        {
          id: "2.6",
          text: "Was an appropriate analysis used to estimate the effect of assignment to intervention?",
          options: FULL,
          askIf: null,
          teaching: "ITT、以及只排除缺失結果者的 mITT 屬適當；naïve per-protocol、as-treated、排除已隨機的合格受試者屬不適當。",
        },
        {
          id: "2.7",
          text: "If N/PN/NI to 2.6: Was there potential for a substantial impact (on the result) of the failure to analyse participants in the group to which they were randomized?",
          options: FULL,
          askIf: { all: [{ q: "2.6", in: NPN_NI }] },
          teaching: "沒有固定百分比門檻：結果事件少、或被排除者的預後明顯不同時，即使排除不到 5% 也可能有實質影響。",
        },
      ],
    },
    {
      id: "D3",
      title: { en: "Bias due to missing outcome data" },
      locator: "Box 8, Table 10 and Figure 4, pp.45–48",
      keywords: ["missing", "lost to follow-up", "withdrew", "withdrawal", "dropout", "imputation", "imputed", "complete case", "sensitivity analysis", "CONSORT"],
      teaching:
        "不要設固定的缺失百分比門檻。核心問題是：缺失與否，是否取決於結果本身的真實值（例如症狀越差的人越容易退出）？插補（LOCF、只依組別的多重插補）不能視為已解決偏差。",
      questions: [
        {
          id: "3.1",
          text: "Were data for this outcome available for all, or nearly all, participants randomized?",
          options: FULL,
          askIf: null,
          teaching: "「幾乎全部」指缺失的人無論結果為何，都不會實質改變效果估計。連續型結果約 95% 有資料常已足夠；二分類結果要和事件數比較。插補值算缺失。",
        },
        {
          id: "3.2",
          text: "If N/PN/NI to 3.1: Is there evidence that the result was not biased by missing outcome data?",
          options: ["Y", "PY", "PN", "N"],
          askIf: { all: [{ q: "3.1", in: NPN_NI }] },
          teaching: "證據可來自能校正偏差的分析方法，或在多種合理假設下結果都差不多的敏感度分析。本題沒有 No information 選項。",
        },
        {
          id: "3.3",
          text: "If N/PN to 3.2: Could missingness in the outcome depend on its true value?",
          options: FULL,
          askIf: { all: [{ q: "3.2", in: ["N", "PN"] }] },
          teaching: "退出原因可能與健康狀態有關時，就「可能」取決於真值；若缺失原因都與結果無關（例如儀器故障），答 No。",
        },
        {
          id: "3.4",
          text: "If Y/PY/NI to 3.3: Is it likely that missingness in the outcome depended on its true value?",
          options: FULL,
          askIf: { all: [{ q: "3.3", in: YPY_NI }] },
          teaching: "答 Yes 的典型理由：兩組缺失比例不同、退出原因顯示與結果有關、兩組退出原因不同、試驗情境使然（如精神科試驗症狀持續者較易退出）。",
        },
      ],
    },
    {
      id: "D4",
      title: { en: "Bias in measurement of the outcome" },
      locator: "Box 10, Table 12 and Figure 5, pp.54–57",
      keywords: ["outcome assessor", "assessor", "blinded", "masked", "questionnaire", "self-reported", "adjudicat", "measured", "scale"],
      teaching:
        "評估者知情也不必然造成偏差：全因死亡這類不需判斷的客觀結果，知情也不會影響測量。病人自評結果的「評估者」就是病人本人。",
      questions: [
        {
          id: "4.1",
          text: "Was the method of measuring the outcome inappropriate?",
          options: FULL,
          askIf: null,
          teaching: "大多數預先指定的結果答 No。只有量測方法對可能的效果不敏感，或工具效度已被證實很差時才答 Yes。本題不評結果本身是不是替代終點。",
        },
        {
          id: "4.2",
          text: "Could measurement or ascertainment of the outcome have differed between intervention groups?",
          options: FULL,
          askIf: null,
          teaching: "兩組是否用同樣方法、門檻、時間點測量？介入組若回診次數較多，偵測到事件的機會也較多（detection bias）。",
        },
        {
          id: "4.3",
          text: "If N/PN/NI to 4.1 and 4.2: Were outcome assessors aware of the intervention received by study participants?",
          options: FULL,
          askIf: { all: [{ q: "4.1", in: NPN_NI }, { q: "4.2", in: NPN_NI }] },
          teaching: "評估者有盲化就答 No。",
        },
        {
          id: "4.4",
          text: "If Y/PY/NI to 4.3: Could assessment of the outcome have been influenced by knowledge of intervention received?",
          options: FULL,
          askIf: { all: [{ q: "4.3", in: YPY_NI }] },
          teaching: "病人自評（如疼痛）、需要判斷的觀察者評估、由照護者決定的結果，都可能受影響；客觀結果則不太會。",
        },
        {
          id: "4.5",
          text: "If Y/PY/NI to 4.4: Is it likely that assessment of the outcome was influenced by knowledge of intervention received?",
          options: FULL,
          askIf: { all: [{ q: "4.4", in: YPY_NI }] },
          teaching: "「可能受影響但沒有理由認為確實受影響」答 No；對療效有強烈信念時（例如受試者或評估者深信新療法有效）較可能答 Yes。",
        },
      ],
    },
    {
      id: "D5",
      title: { en: "Bias in selection of the reported result" },
      locator: "Box 11, Table 14 and Figure 7, pp.63–67",
      keywords: ["protocol", "registered", "registration", "statistical analysis plan", "prespecified", "pre-specified", "primary outcome", "secondary outcome"],
      teaching:
        "沒有統計分析計畫（SAP）不等於偏差：protocol 或試驗登錄若在解盲前就寫明結果與分析方式也可。5.1 只有在 5.2、5.3 都是 No／Probably no 時才影響建議判斷。",
      questions: [
        {
          id: "5.1",
          text: "Were the data that produced this result analysed in accordance with a pre-specified analysis plan that was finalized before unblinded outcome data were available for analysis?",
          options: FULL,
          askIf: null,
          teaching: "比對 protocol、SAP 或試驗登錄的預定分析與實際報告；確認登錄日期早於解盲資料分析。",
        },
        {
          id: "5.2",
          text: "Is the numerical result being assessed likely to have been selected, on the basis of the results, from multiple eligible outcome measurements (e.g. scales, definitions, time points) within the outcome domain?",
          options: FULL,
          askIf: null,
          teaching: "例：計畫用兩個量表、三個時間點，卻只報告其中顯著的那一個。只有一種可能的測量方式時答 No。",
        },
        {
          id: "5.3",
          text: "Is the numerical result being assessed likely to have been selected, on the basis of the results, from multiple eligible analyses of the data?",
          options: FULL,
          askIf: null,
          teaching: "例：校正與未校正模型、終值與變化量、不同切點、不同缺失處理方式，卻只報告有利的那一個。",
        },
      ],
    },
  ],
  overall: {
    locator: "Table 1, p.4",
    teaching:
      "任一 domain 為 High → 整體 High；全部 Low → 整體 Low；其餘為 Some concerns。多個 domain 都是 Some concerns 時，可依其累積影響判為 High，這需要你的判斷，程式不會自動升級。",
  },
};
