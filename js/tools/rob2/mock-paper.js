// 虛構教學用範例文獻：作者、期刊、試驗名稱、註冊號與所有數據皆為虛構，不可作為臨床依據。
// 評估的結果：12 週 FACIT-Fatigue 平均差（effect of assignment）。
// 教學設計（2026-10-14 指導者審定）：
//   D1 Low（中央網路隨機、隱匿良好）
//   D2 Low（開放標籤，但偏離皆為試驗外也會發生的改變；mITT 屬適當）→「未盲 ≠ 偏差」
//   D3 High（缺失 7.5% vs 28%，退出原因與疲勞相關，無敏感度分析）
//   D4 High（病人自評、知情，同意書暗示 IV 較強效）
//   D5 Low（登錄與 SAP 早於解盲，結果與預定一致）
// items：該段落可作為哪些 signalling question／domain 的證據（C1 允許引用集合）

export const mockPapers = [
  {
    id: "iron-fatigue-ckd",
    status: "reviewed",
    reviewedOn: "2026-10-14",
    fictional: true,
    title: {
      en: "Intravenous versus oral iron for fatigue in iron-deficient adults with chronic kidney disease: the IRON-FAT open-label randomised trial",
      zh: "靜脈鐵劑與口服鐵劑改善慢性腎臟病缺鐵成人之疲勞：IRON-FAT 開放標籤隨機試驗",
    },
    byline: "Chen MY, Rossi L, Mensah A（虛構作者）· Journal of Imaginary Nephrology, 2025",
    assessedResult: {
      en: "FACIT-Fatigue score at 12 weeks: mean difference 4.1 points (95% CI 1.2 to 7.0) favouring intravenous iron",
      zh: "12 週 FACIT-Fatigue 分數：平均差 4.1 分（95% CI 1.2 至 7.0），有利於靜脈鐵劑",
    },
    sections: [
      {
        heading: { en: "Methods", zh: "方法" },
        paragraphs: [
          {
            id: "rob-design",
            items: ["5.1", "2.1", "2.2", "D5"],
            en: "IRON-FAT was a multicentre, open-label, parallel-group randomised trial at 14 nephrology clinics. The trial was registered (NCT09999999, fictional) before the first participant was enrolled. The statistical analysis plan (version 1.0) was finalised and posted on the registry four months before database lock.",
            zh: "IRON-FAT 為 14 家腎臟科門診參與的多中心、開放標籤、平行組隨機試驗。試驗於第一位受試者收案前註冊（NCT09999999，虛構）。統計分析計畫（1.0 版）於資料庫鎖定前四個月定稿並公開於登錄平台。",
          },
          {
            id: "rob-randomisation",
            items: ["1.1", "1.2", "D1"],
            en: "Participants were allocated 1:1 using a computer-generated sequence in permuted blocks of 4 and 6, stratified by site and CKD stage. Allocation was obtained from a central web-based system only after the participant's details had been irreversibly entered.",
            zh: "受試者以電腦產生的序列 1:1 分派，採 4 與 6 的隨機區組，依院所與 CKD 分期分層。分派結果須在受試者資料不可逆地輸入中央網路系統後才會顯示。",
          },
          {
            id: "rob-interventions",
            items: ["2.1", "2.2", "4.3", "4.5", "D2", "D4"],
            en: "The intervention group received ferric carboxymaltose 1000 mg intravenously at baseline and 500 mg at week 6; the comparator group received ferrous sulfate 200 mg orally twice daily. Neither participants nor clinic staff were blinded. The participant information sheet described intravenous iron as “a faster and more powerful way to restore iron and energy levels”.",
            zh: "介入組於基線靜脈注射 ferric carboxymaltose 1000 mg、第 6 週再給 500 mg；對照組每日兩次口服 ferrous sulfate 200 mg。受試者與門診人員皆未盲化。受試者說明書將靜脈鐵劑描述為「更快速、更強效地恢復鐵質與體力的方式」。",
          },
          {
            id: "rob-outcome",
            items: ["4.1", "4.2", "4.3", "4.4", "5.2", "D4", "D5"],
            en: "The primary outcome was fatigue measured with the FACIT-Fatigue questionnaire (range 0–52; higher scores indicate less fatigue), self-completed by participants at baseline, week 6 and week 12 using the same tablet-based form at every site. The registry and analysis plan specified the week-12 FACIT-Fatigue score as the sole primary outcome measure and time point.",
            zh: "主要結果為以 FACIT-Fatigue 問卷測量的疲勞（0–52 分，分數越高疲勞越輕），由受試者於基線、第 6 週、第 12 週自行填寫，各院所使用相同的平板表單。登錄與分析計畫指定第 12 週 FACIT-Fatigue 分數為唯一的主要結果測量與時間點。",
          },
          {
            id: "rob-analysis",
            items: ["2.6", "3.2", "5.3", "D2", "D3", "D5"],
            en: "The primary analysis included all randomised participants with week-12 FACIT-Fatigue data, analysed in the groups to which they were randomised, using linear regression adjusted for baseline score as prespecified. Missing outcome data were not imputed, and no sensitivity analyses for missing data were performed.",
            zh: "主要分析納入所有有第 12 週 FACIT-Fatigue 資料的隨機受試者，依隨機分組分析，並如預先指定以基線分數校正的線性迴歸分析。缺失的結果資料未插補，也未針對缺失資料進行敏感度分析。",
          },
        ],
      },
      {
        heading: { en: "Results", zh: "結果" },
        paragraphs: [
          {
            id: "rob-baseline",
            items: ["1.3", "D1"],
            en: "Of 240 participants randomised (120 per group), baseline characteristics were similar between groups (Table 1): mean age 63 years, 52% women, mean haemoglobin 10.6 g/dL, mean baseline FACIT-Fatigue 29.8 versus 30.4.",
            zh: "240 位隨機受試者（每組 120 位）的基線特徵兩組相似（表 1）：平均年齡 63 歲、女性 52%、平均血紅素 10.6 g/dL、基線 FACIT-Fatigue 平均 29.8 對 30.4。",
          },
          {
            id: "rob-adherence",
            items: ["2.3", "2.4", "2.5", "D2"],
            en: "In the oral group, 21 participants (18%) stopped their tablets because of gastrointestinal adverse effects and remained in follow-up as per protocol. Five oral-group participants received intravenous iron from their treating nephrologist for haemoglobin below 9 g/dL, as permitted by the protocol and consistent with routine care. No participant was recorded as seeking iron outside the trial because of their allocation.",
            zh: "口服組有 21 位（18%）因腸胃道不良反應停藥，並依計畫書繼續追蹤。口服組另有 5 位因血紅素低於 9 g/dL，由主治腎臟科醫師給予靜脈鐵劑，此為計畫書允許且符合常規照護。沒有受試者因分組結果而在試驗外另尋鐵劑治療的紀錄。",
          },
          {
            id: "rob-flow",
            items: ["3.1", "3.3", "3.4", "D3"],
            en: "Week-12 FACIT-Fatigue data were missing for 9 participants (7.5%) in the intravenous group and 34 (28%) in the oral group. Reasons in the oral group were gastrointestinal intolerance leading to withdrawal (14), withdrawal of consent citing persistent tiredness (11) and loss to follow-up (9); in the intravenous group, loss to follow-up (6) and relocation (3).",
            zh: "第 12 週 FACIT-Fatigue 資料缺失：靜脈組 9 位（7.5%），口服組 34 位（28%）。口服組原因為腸胃不耐而退出（14）、以持續疲倦為由撤回同意（11）、失聯（9）；靜脈組為失聯（6）與搬遷（3）。",
          },
          {
            id: "rob-result",
            items: ["D3", "D4"],
            en: "At week 12, FACIT-Fatigue was higher with intravenous iron (adjusted mean difference 4.1 points, 95% CI 1.2 to 7.0; 111 vs 86 participants analysed).",
            zh: "第 12 週時，靜脈鐵劑組 FACIT-Fatigue 較高（校正後平均差 4.1 分，95% CI 1.2 至 7.0；分析人數 111 對 86）。",
          },
        ],
      },
      {
        heading: { en: "Discussion", zh: "討論" },
        paragraphs: [
          {
            id: "rob-conclusion",
            items: ["overall"],
            en: "Intravenous iron substantially reduces fatigue compared with oral iron in iron-deficient adults with CKD and should be preferred when fatigue is a concern.",
            zh: "對缺鐵的 CKD 成人，靜脈鐵劑相較口服鐵劑能顯著減輕疲勞，在病人關切疲勞時應優先使用。",
          },
        ],
      },
    ],
  },
];
