// CASP Checklist: For systematic reviews with meta-analysis of RCTs (2024)
// 英文欄位逐字取自官方 PDF；中文為翻譯（2026-10-14 指導者審定）；teaching 為本專案教學補充，非官方內容。
// © CASP, CC BY-NC-SA 4.0 — https://creativecommons.org/licenses/by-nc-sa/4.0/

const t = (en, zh) => ({ en, zh });

export const definition = {
  toolId: "casp-sr-rct",
  toolVersion: "casp-sr-rct@2024",
  engine: "casp",
  title: t(
    "CASP Checklist: For systematic reviews with meta-analysis of randomised controlled trials (RCTs)",
    "CASP 評讀清單：隨機對照試驗（RCT）之系統性回顧與統合分析"
  ),
  shortTitle: t("CASP SR/MA of RCTs", "CASP SR/MA（RCT）"),
  source: {
    citation:
      "Critical Appraisal Skills Programme (2024). CASP Checklist: For systematic reviews with meta-analysis of randomised controlled trials (RCTs).",
    url: "https://casp-uk.net/casp-tools-checklists/systematic-reviews-meta-analysis-rcts/",
    license: "CC BY-NC-SA 4.0",
  },
  translationStatus: "reviewed",
  translationReviewedOn: "2026-10-14",
  preamble: t(
    "During critical appraisal, never make assumptions about what the researchers have done. If it is not possible to tell, use the “Can’t tell” response box. If you can’t tell, at best it means the researchers have not been explicit or transparent, but at worst it could mean the researchers have not undertaken a particular task or process. Once you’ve finished the critical appraisal, if there are a large number of “Can’t tell” responses, consider whether the findings of the study are trustworthy and interpret the results with caution.",
    "評讀時，切勿對研究者做了什麼做任何假設。若無法判斷，請勾選「無法判斷」。無法判斷往好處想，代表研究者未明確或透明地說明；往壞處想，可能代表研究者根本沒有執行某項工作或程序。完成評讀後，若「無法判斷」的數量很多，請思考該研究結果是否可信，並謹慎解讀。"
  ),
  options: [
    { value: "Y", label: t("Yes", "是") },
    { value: "N", label: t("No", "否") },
    { value: "CT", label: t("Can’t tell", "無法判斷") },
  ],
  sections: [
    {
      id: "A",
      title: t("Is the basic study design valid for a systematic review?", "基本研究設計對系統性回顧而言是否有效？"),
      note: t(
        "If you answered “No” to both these questions: It is likely that the researchers did not clearly formulate the fundamental aspects of the research question, and the most appropriate way of answering it. If this is the case, it is likely other problems will arise during the conduct of the systematic review. Consider whether it would be useful to continue with the critical appraisal process.",
        "若 Q1、Q2 皆答「否」：研究者很可能沒有清楚界定研究問題的基本面向，以及回答該問題最適當的方式。若是如此，系統性回顧的執行過程很可能還會出現其他問題。請考慮是否值得繼續評讀。"
      ),
    },
    {
      id: "B",
      title: t("Is the systematic review methodologically sound?", "系統性回顧的方法學是否嚴謹？"),
      note: t(
        "If you answered “No” to these questions, it is likely that there is a lack of methodological rigour in the conduct of the systematic review, which means it is best to interpret the results with caution, and to assess how those aspects of poor methodology will have an impact on the results of the systematic review. For Question 3, a “No” response indicates that this systematic review may have missed primary research studies that could have contributed to answering the research question; in a systematic review with meta-analysis, the results of any missing primary research studies could have altered the effect estimate for the systematic review. For Question 4, a “No” response indicates that the researchers did not identify any systematic bias or confounding factors in the primary research studies that could have affected the results of the systematic review; in the absence of this information, it is not possible for you to assess in what ways the results of the systematic review could have been affected, and it is best to be cautious when interpreting the results. For Question 5, a “No” response indicates that the researchers did not organise the data from the primary research studies in a coherent way such that it could analysed appropriately, and thereby reliable conclusions drawn from it. If you answered “No” to all three questions in Section B, consider whether it would be useful to continue with the critical appraisal process.",
        "若這些題目答「否」，代表系統性回顧的執行可能缺乏方法學嚴謹度，最好謹慎解讀結果，並評估這些方法學缺陷會如何影響結果。Q3 答「否」：可能遺漏了有助回答研究問題的原始研究；在統合分析中，遺漏研究的結果可能改變合併效應估計值。Q4 答「否」：研究者未辨識原始研究中可能影響結果的系統性偏差或干擾因子；缺少這些資訊，你無法評估結果可能受到何種影響，解讀時應保守。Q5 答「否」：研究者未以一致的方式整理原始研究資料，以致無法適當分析並得出可靠結論。若 Section B 三題皆答「否」，請考慮是否值得繼續評讀。"
      ),
    },
    {
      id: "C",
      title: t("Are the results of the systematic review trustworthy?", "系統性回顧的結果是否可信？"),
      note: t(
        "If you answered “No” to these questions, it is likely that the researchers did not analyse and interpret the information from the primary research studies appropriately, nor did they discuss the limitations of the systematic review as fully as possible so it is not possible for you to assess the trustworthiness (validity and credibility) of the results of the systematic review. Finally, if there is no information on the likely resource demands of intervention, it is not possible for you to judge whether you have the resource capacity to act upon the results. If you answered “No” to all three questions in Section C, consider whether it would be useful to continue with the critical appraisal process.",
        "若這些題目答「否」，代表研究者可能未適當分析與詮釋原始研究資訊，也未充分討論系統性回顧的限制，因此你無法評估結果的可信度（效度與可靠性）。此外，若缺乏介入措施可能需要之資源的資訊，你無法判斷自身是否有能力依結果採取行動。若 Section C 三題皆答「否」，請考慮是否值得繼續評讀。"
      ),
    },
    {
      id: "D",
      title: t("Are the results of the systematic review relevant locally?", "系統性回顧的結果是否適用於在地情境？"),
      note: t(
        "If you answered “No” to this question, it is not necessary to answer Question 10 because, irrespective of a systematic review’s methodological rigour, the results are not applicable to the individuals or populations for whom you are responsible. If you answered “Yes” to Question 9, answer Question 10.",
        "若本題答「否」，則不必回答 Q10，因為無論系統性回顧的方法學多嚴謹，其結果都不適用於你所負責的個人或族群。若 Q9 答「是」，請繼續回答 Q10。"
      ),
    },
    {
      id: "E",
      title: t(
        "Will the implementation of the results represent greater value for your service users or population?",
        "實施這些結果是否能為你的服務對象或族群帶來更大價值？"
      ),
      note: t(
        "If you answered “No” to this question, it is likely that the findings of the systematic review will not confer greater or additional benefit or value on the individuals and/or populations for whom you are responsible, despite the systematic review’s applicability to your local setting. If you answered “Yes” it is likely that the findings of the systematic review will confer greater or additional benefit or value on the individuals and/or populations for whom you are responsible, and you need to discuss with colleagues whether it would be appropriate to implement the findings in your local setting.",
        "若本題答「否」，即使系統性回顧適用於在地情境，其發現也可能無法為你負責的個人或族群帶來更大或額外的效益與價值。若答「是」，則可能帶來更大或額外的效益與價值，你需要與同事討論在地實施是否恰當。"
      ),
    },
    {
      id: "Z",
      title: t("Conclusion", "結論"),
      note: null,
    },
  ],
  items: [
    {
      id: "q1",
      section: "A",
      number: "1",
      question: t(
        "Did the systematic review address a clearly formulated research question?",
        "該系統性回顧是否提出明確界定的研究問題？"
      ),
      considerIntro: t(
        "Did the researchers state a research question and a null hypothesis? For a systematic review of RCTs, a research question can be ‘formulated’ in terms of the PICOT(S) framework:",
        "研究者是否陳述了研究問題與虛無假設？RCT 的系統性回顧，研究問題可用 PICOT(S) 架構「界定」："
      ),
      consider: [
        t("Population", "Population 族群"),
        t("Intervention", "Intervention 介入措施"),
        t("Comparator", "Comparator 對照"),
        t("Outcome/s and Outcome measures", "Outcome 結果指標與測量方式"),
        t("Time, e.g., study timeframe, or follow-up intervals", "Time 時間，例如研究時程或追蹤間隔"),
        t("Setting", "Setting 場域"),
      ],
      teaching: "PICOT(S) 通常寫在 Introduction 最後一段或 Methods 開頭。注意 CASP 也要求虛無假設；多數 SR 不會明寫，可視情況判斷。",
      keywords: ["objective", "aim", "research question", "PICO", "population", "intervention", "comparator", "hypothesis"],
    },
    {
      id: "q2",
      section: "A",
      number: "2",
      question: t(
        "Did the researchers search for appropriate study design(s) to answer the research question?",
        "研究者是否搜尋了適合回答研究問題的研究設計？"
      ),
      considerIntro: null,
      consider: [
        t(
          "If the research question is concerned with the efficacy of an intervention, the RCT is the appropriate study design for a systematic review. The most common type of RCT is the parallel RCT in which individuals are randomised to study groups; other methods of randomisation, however, could be relevant depending on the research question.",
          "若研究問題是介入措施的療效，RCT 是系統性回顧適當的研究設計。最常見的是平行 RCT，將個人隨機分配到各組；但依研究問題不同，其他隨機化方式也可能適用。"
        ),
      ],
      teaching: null,
      keywords: ["randomised", "randomized", "RCT", "study design", "eligibility", "inclusion criteria"],
    },
    {
      id: "q3a",
      section: "B",
      number: "3a",
      parent: t(
        "Were all the relevant primary research studies likely to have been included in the systematic review?",
        "所有相關的原始研究是否都可能已被納入該系統性回顧？"
      ),
      question: t("Searching for primary research studies", "原始研究的搜尋"),
      considerIntro: null,
      consider: [
        t("Was the search strategy comprehensive and clearly reported?", "搜尋策略是否完整且清楚報告？"),
        t(
          "Did the search include 1 or more of the major bibliographic databases, e.g., MEDLINE/PubMed, and Embase?",
          "是否搜尋了一個以上的主要書目資料庫，例如 MEDLINE/PubMed 與 Embase？"
        ),
        t(
          "Did the researchers provide MESH terms for MEDLINE, or their equivalent for other databases?",
          "研究者是否提供 MEDLINE 的 MeSH 詞彙，或其他資料庫的對應詞彙？"
        ),
        t("Were relevant subject-specific bibliographic databases searched?", "是否搜尋了相關的專科書目資料庫？"),
        t("Did the search include non-English language studies?", "搜尋是否納入非英語研究？"),
        t(
          "Did the researchers undertake citation searching, including hand-searching of reference lists from primary research studies included in the systematic review?",
          "研究者是否進行引文搜尋，包括手動檢索已納入原始研究的參考文獻？"
        ),
        t(
          "Did the search include unpublished studies? For instance, did the search include registers of ongoing trials or preprint repositories?",
          "搜尋是否納入未發表研究？例如是否搜尋進行中試驗的登錄平台或預印本資料庫？"
        ),
        t(
          "Did the researchers consult experts in the field about potential primary research studies or ongoing trials that could be included?",
          "研究者是否諮詢該領域專家，以找出可能納入的原始研究或進行中試驗？"
        ),
      ],
      teaching: "只搜尋單一資料庫、或未搜尋試驗登錄平台（如 ClinicalTrials.gov），是最常見的缺陷；後者也和發表偏差有關。",
      keywords: ["search", "MEDLINE", "PubMed", "Embase", "CENTRAL", "Cochrane Library", "ClinicalTrials.gov", "grey literature", "unpublished", "language"],
    },
    {
      id: "q3b",
      section: "B",
      number: "3b",
      question: t("Screening primary research studies from the search", "篩選搜尋到的原始研究"),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers define appropriate eligibility or inclusion and exclusion criteria?",
          "研究者是否定義了適當的合格條件，或納入與排除條件？"
        ),
        t(
          "Did the researchers design and implement a robust process to screen the primary research studies? For instance, two researchers working independently with a third independent researcher to resolve any disagreements.",
          "研究者是否設計並執行嚴謹的原始研究篩選流程？例如由兩位研究者獨立作業，意見不一致時由第三位獨立研究者裁決。"
        ),
        t(
          "Was screening based on the title and abstract of primary research studies found during the search?",
          "篩選是否依據搜尋所得原始研究的標題與摘要？"
        ),
        t("Did the researchers adhere to the eligibility criteria?", "研究者是否遵守合格條件？"),
      ],
      teaching: null,
      keywords: ["screen", "title and abstract", "independently", "two reviewers", "eligibility", "exclusion criteria"],
    },
    {
      id: "q3c",
      section: "B",
      number: "3c",
      question: t(
        "Selecting primary research studies to include in the systematic review",
        "選擇要納入系統性回顧的原始研究"
      ),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers design and implement a robust process to select the primary research studies according to the eligibility criteria? For instance, two researchers working independently with a third independent researcher to resolve any disagreements.",
          "研究者是否設計並執行嚴謹的流程，依合格條件選擇原始研究？例如兩位研究者獨立作業，由第三位獨立研究者裁決分歧。"
        ),
        t(
          "Were decisions to include or exclude primary research studies based on full-text analysis?",
          "納入或排除原始研究的決定是否依據全文判讀？"
        ),
        t("Did the researchers adhere to the eligibility criteria?", "研究者是否遵守合格條件？"),
        t(
          "Was the level of agreement between the researchers responsible for selecting the primary research studies calculated and reported? For instance, by calculating the kappa statistic of inter-rate reliability.",
          "負責選擇原始研究的研究者之間的一致性是否有計算並報告？例如計算評分者間信度的 kappa 值。"
        ),
      ],
      teaching: null,
      keywords: ["full text", "full-text", "kappa", "agreement", "disagreement", "third reviewer"],
    },
    {
      id: "q3d",
      section: "B",
      number: "3d",
      question: t("Summarising the search and its outputs", "搜尋過程與結果的彙整"),
      considerIntro: t(
        "Did the researchers present a PRISMA-type flow diagram, including the numbers of primary research studies that were:",
        "研究者是否提供 PRISMA 式流程圖，並列出以下原始研究的數量："
      ),
      consider: [
        t("Duplicates?", "重複者？"),
        t("Screened out?", "篩選時排除者？"),
        t("Excluded, with the reasons for exclusion?", "排除者及其排除理由？"),
        t("Included in the systematic review?", "納入系統性回顧者？"),
        t(
          "Included in the meta-analysis (data may not have been complete in some of the primary research studies)?",
          "納入統合分析者（部分原始研究的資料可能不完整）？"
        ),
      ],
      teaching: null,
      keywords: ["PRISMA", "flow diagram", "flowchart", "duplicates", "records identified", "excluded"],
    },
    {
      id: "q4",
      section: "B",
      number: "4",
      question: t(
        "Did the researchers assess the validity or methodological rigour of the primary research studies included in the systematic review?",
        "研究者是否評估了所納入原始研究的效度或方法學嚴謹度？"
      ),
      considerIntro: t(
        "Lack of methodological rigour in the individual primary research studies can affect the validity and interpretation of the findings of the systematic review with meta-analysis.",
        "個別原始研究缺乏方法學嚴謹度，會影響系統性回顧與統合分析結果的效度與詮釋。"
      ),
      consider: [
        t(
          "Did the researchers use a validated tool to assess the methodological rigour of the primary research studies included in the systematic review?",
          "研究者是否使用經驗證的工具評估所納入原始研究的方法學嚴謹度？"
        ),
        t(
          "Was the tool appropriate to assess the type(s) of study design(s) included in the systematic review? For example, the Cochrane Risk of Bias tool specifically for RCTs or the McMaster EPHPP tool for any quantitative study design, including RCTs.",
          "該工具是否適合評估所納入的研究設計類型？例如專用於 RCT 的 Cochrane Risk of Bias 工具，或適用於包含 RCT 在內各種量性研究設計的 McMaster EPHPP 工具。"
        ),
        t(
          "Did the researchers present the findings from their quality assessment, and interpret them accurately?",
          "研究者是否呈現品質評估的結果，並正確詮釋？"
        ),
      ],
      teaching: "注意工具版本：RoB 1（2011）與 RoB 2（2019）的領域與判斷方式不同。只寫「有用 RoB」卻沒呈現各研究結果，仍不算充分。",
      keywords: ["risk of bias", "RoB 2", "RoB", "quality assessment", "Jadad", "methodological quality"],
    },
    {
      id: "q5a",
      section: "B",
      number: "5a",
      parent: t(
        "Did the researchers extract, and present information from the individual primary research studies appropriately and transparently?",
        "研究者是否適當且透明地擷取並呈現個別原始研究的資訊？"
      ),
      question: t("Extraction of data", "資料擷取"),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers design and implement a robust process for the extraction of data from the individual primary research studies?",
          "研究者是否設計並執行嚴謹的資料擷取流程？"
        ),
        t("Did the researchers follow guidance on data extraction?", "研究者是否依循資料擷取的指引？"),
        t(
          "Did the researchers use a standardised form or software programme to record the data to ensure completeness and accuracy?",
          "研究者是否使用標準化表單或軟體記錄資料，以確保完整與正確？"
        ),
        t(
          "Did the researchers extract the relevant data for the study-level characteristics and the results of each primary research study?",
          "研究者是否擷取了每篇原始研究的研究層級特徵與結果等相關資料？"
        ),
      ],
      teaching: null,
      keywords: ["data extraction", "extracted", "standardised form", "standardized form", "independently"],
    },
    {
      id: "q5b",
      section: "B",
      number: "5b",
      question: t("Presentation of data", "資料呈現"),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers present the key characteristics of the individual primary research studies, e.g., in a table? For instance, the number of participants, the profile of participants (age, sex), the intervention, the comparator, the outcome/s evaluated, and the study timeframe.",
          "研究者是否呈現個別原始研究的關鍵特徵，例如以表格呈現？如受試者人數、受試者特徵（年齡、性別）、介入措施、對照、評估的結果指標與研究時程。"
        ),
        t(
          "Did the researchers present the results of the individual primary research studies in a Forest plot or combination of table and Forest plot? For instance, the effect size/s, the confidence-interval ranges, and the P values. NB: The Forest plot should also show the overall result from the meta-analysis.",
          "研究者是否以森林圖、或表格搭配森林圖呈現個別原始研究的結果？如效應量、信賴區間與 P 值。註：森林圖也應顯示統合分析的合併結果。"
        ),
      ],
      teaching: null,
      keywords: ["Table 1", "characteristics", "forest plot", "Figure"],
    },
    {
      id: "q6",
      section: "C",
      number: "6",
      question: t(
        "Did the researchers analyse the pooled results of the individual primary research studies appropriately?",
        "研究者是否適當分析了個別原始研究的合併結果？"
      ),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers undertake a power calculation and sample-size estimation during the design and planning of the systematic review?",
          "研究者在設計與規劃系統性回顧時，是否進行檢定力計算與樣本數估算？"
        ),
        t(
          "Did the number of participants whose outcomes were entered into the analysis meet the power calculation, i.e., was the meta-analysis sufficiently powered to detect any effect on the outcomes of interest?",
          "納入分析的受試者人數是否達到檢定力計算的要求，即統合分析是否有足夠檢定力偵測目標結果的效應？"
        ),
        t("Did the researchers use an appropriate effect measure?", "研究者是否使用適當的效應量指標？"),
        t(
          "Did the researchers provide confidence-interval ranges for the effect estimates in the systematic review?",
          "研究者是否提供效應估計值的信賴區間？"
        ),
        t(
          "Did the researchers provide p values for the effect estimates in the systematic review?",
          "研究者是否提供效應估計值的 p 值？"
        ),
        t(
          "Did the researchers provide a minimal important difference, that is the smallest possible difference that a person would perceive as a beneficial effect of intervention?",
          "研究者是否提供最小重要差異（MID），即個人能感受到介入有益效果的最小差異？"
        ),
        t(
          "Did the researchers assess the level of statistical heterogeneity (variability) among the primary research studies? For example, using the I2 statistic.",
          "研究者是否評估原始研究間的統計異質性（變異程度）？例如使用 I² 統計量。"
        ),
        t(
          "Did the researchers use an appropriate model of meta-analysis for the level of heterogeneity among the primary research studies (a random-effects model if there was heterogeneity or a fixed-effects model if the primary research studies were all investigating the same underlying effect)?",
          "研究者是否依原始研究間的異質性程度選擇適當的統合分析模型（有異質性時用隨機效應模型；原始研究皆在探討同一個潛在效應時用固定效應模型）？"
        ),
        t("Did the researchers perform any sensitivity analyses?", "研究者是否進行敏感度分析？"),
        t(
          "Did the researchers analyse the reasons for heterogeneity using subgroup analysis or meta-regression? For subgroup analysis, see Question 6.1, and for meta-regression see Question 6.2.",
          "研究者是否以次族群分析或統合迴歸探討異質性來源？次族群分析見 Q6.1，統合迴歸見 Q6.2。"
        ),
        t(
          "Did the researchers investigate the small-study effect, and assess the potential for publication bias in the systematic review (e.g., using a funnel plot)?",
          "研究者是否探討小型研究效應，並評估發表偏差的可能性（例如使用漏斗圖）？"
        ),
      ],
      teaching: "I² 高卻使用固定效應模型，是常見的教學點。另注意：納入研究少於 10 篇時，漏斗圖的檢定力很低。",
      keywords: ["fixed-effect", "fixed effect", "random-effects", "random effects", "I2", "I²", "heterogeneity", "sensitivity analysis", "funnel plot", "Egger", "risk ratio", "odds ratio"],
    },
    {
      id: "q6_1",
      section: "C",
      number: "6.1",
      question: t("Subgroup analysis", "次族群分析"),
      considerIntro: t(
        "Were the characteristics or effect modifiers for investigation:",
        "要探討的特徵或效應修飾因子是否："
      ),
      consider: [
        t(
          "Specified in the study protocol, with the direction of effect, and statistical tests to be used?",
          "已在研究計畫書中預先指定，並說明預期效應方向與將使用的統計檢定？"
        ),
        t("Clearly defined, with a rationale for selection?", "定義清楚，並說明選擇理由？"),
        t(
          "Not closely related to other characteristics, i.e., differentiation is possible?",
          "與其他特徵沒有高度相關，也就是能夠區分？"
        ),
        t("Analysed in relation to the primary outcome?", "針對主要結果指標進行分析？"),
        t(
          "If continuous data were allocated to categories, were the thresholds or cut-off points specified in the study protocol together with a rationale?",
          "若將連續資料分組，切點是否已在計畫書中預先指定並說明理由？"
        ),
        t(
          "If a large number of characteristics or effect modifiers were investigated, or subgroup analyses conducted, did the researchers adjust for multiple testing?",
          "若探討大量特徵或效應修飾因子、或進行多項次族群分析，研究者是否校正多重檢定？"
        ),
        t(
          "Was a test for interaction undertaken to determine whether any subgroup effects were statistically significant?",
          "是否進行交互作用檢定，以判斷次族群效應是否具統計顯著？"
        ),
        t(
          "Was the analysis of effect modification based on comparison within rather than between studies?",
          "效應修飾的分析是基於研究內比較，而非研究間比較？"
        ),
      ],
      teaching: "若該 SR 未做次族群分析，CASP 官方沒有「不適用」選項；請依實際情況在筆記中說明，並與指導者討論如何作答。",
      keywords: ["subgroup", "interaction", "pre-specified", "prespecified", "post hoc", "effect modifier"],
    },
    {
      id: "q6_2",
      section: "C",
      number: "6.2",
      question: t("Meta-regression", "統合迴歸"),
      considerIntro: t(
        "Were the characteristics or effect modifiers for investigation:",
        "要探討的特徵或效應修飾因子是否："
      ),
      consider: [
        t("Specified in the study protocol, with the direction of effect?", "已在研究計畫書中預先指定，並說明預期效應方向？"),
        t(
          "Continuous data? If continuous data were allocated to categories, were the thresholds or cut-off points specified in the study protocol with a rationale for selection?",
          "是否為連續資料？若將連續資料分組，切點是否已在計畫書中預先指定並說明理由？"
        ),
        t(
          "If a large number of characteristics or effect modifiers were investigated, or meta-regression analyses performed, did the researchers adjust for multiple testing?",
          "若探討大量特徵或效應修飾因子、或進行多項統合迴歸，研究者是否校正多重檢定？"
        ),
        t(
          "Was a test for interaction undertaken to determine whether any effects were statistically significant?",
          "是否進行交互作用檢定，以判斷效應是否具統計顯著？"
        ),
        t("Was a random-effects model used for the meta-regression analyses?", "統合迴歸是否使用隨機效應模型？"),
        t(
          "Was the analysis of effect modification based on comparison within rather than between studies?",
          "效應修飾的分析是基於研究內比較，而非研究間比較？"
        ),
      ],
      teaching: null,
      keywords: ["meta-regression", "metaregression", "covariate", "moderator"],
    },
    {
      id: "q7",
      section: "C",
      number: "7",
      question: t(
        "Did the researchers report any limitations of the systematic review and, if so, do the limitations discussed cover all the issues you identified during critical appraisal?",
        "研究者是否報告了系統性回顧的限制？若有，所討論的限制是否涵蓋你在評讀中發現的所有問題？"
      ),
      considerIntro: null,
      consider: [
        t(
          "Did the researchers discuss whether the meta-analysis was sufficiently powered to detect an effect of intervention?",
          "研究者是否討論統合分析有無足夠檢定力偵測介入的效應？"
        ),
        t(
          "Did the researchers consider the appropriateness of the effect measure or measures they used?",
          "研究者是否考量所用效應量指標的適當性？"
        ),
        t(
          "Did the researchers reflect on the precision of the effect estimate, i.e., the confidence-interval range? The smaller the range, the narrower the confidence intervals, meaning the result is more precise, and closer to the true effect size.",
          "研究者是否反思效應估計值的精確度，即信賴區間範圍？範圍越小、區間越窄，結果越精確，也越接近真實效應量。"
        ),
        t(
          "If relevant, did the researchers note whether the confidence-interval range included the “line of no effect” (0 for a difference, 1 for a ratio, where the null hypothesis holds true), or whether the lower limit of the confidence-interval range was close to the “line of no effect”, and discuss the implications for the results of the meta-analysis?",
          "若適用，研究者是否指出信賴區間是否包含「無效應線」（差值為 0、比值為 1，即虛無假設成立處），或信賴區間下限是否接近無效應線，並討論其對統合分析結果的意涵？"
        ),
        t(
          "If the results were statistically significant (i.e., they were less likely to be due to chance), did the researchers discuss whether the results would be important or meaningful for the outcomes experienced by individuals and/or populations using a minimal important difference specific to the research question? Did the researchers consider whether relevant primary research studies could have been missed?",
          "若結果具統計顯著（即較不可能出於偶然），研究者是否以該研究問題特定的最小重要差異，討論結果對個人或族群而言是否重要或有意義？研究者是否考慮可能遺漏了相關原始研究？"
        ),
        t(
          "Did the researchers mention any systematic bias identified during the risk-of-bias/quality assessment of the primary research studies, and explain how it might have influenced the effect estimate in the meta-analysis?",
          "研究者是否提及偏差風險或品質評估中發現的系統性偏差，並說明其可能如何影響合併效應估計值？"
        ),
        t(
          "Did the researchers mention any potential sources of confounding that could have influenced the effect estimate in the meta-analysis?",
          "研究者是否提及可能影響合併效應估計值的潛在干擾來源？"
        ),
        t("Did the researchers discuss the implications of any sensitivity analyses?", "研究者是否討論敏感度分析的意涵？"),
        t(
          "Did the researchers discuss the impact of the level of heterogeneity on the results of the meta-analysis?",
          "研究者是否討論異質性程度對統合分析結果的影響？"
        ),
        t(
          "Did the researchers investigate the reasons for any heterogeneity across the primary research studies and discuss the implications? For subgroup analysis, see Question 7.1, and for meta-regression, see Question 7.2.",
          "研究者是否探討原始研究間異質性的原因並討論其意涵？次族群分析見 Q7.1，統合迴歸見 Q7.2。"
        ),
        t(
          "Did the researchers discuss the effect of any publication bias on the results of the meta-analysis?",
          "研究者是否討論發表偏差對統合分析結果的影響？"
        ),
      ],
      teaching: "本題的關鍵是「涵蓋你發現的所有問題」。把你在 Q3–Q6 標為「否」的項目逐一對照 Limitations 段落。",
      keywords: ["limitation", "limitations", "strengths and limitations", "caution"],
    },
    {
      id: "q7_1",
      section: "C",
      number: "7.1",
      question: t("Subgroup-analysis", "次族群分析"),
      considerIntro: null,
      consider: [
        t(
          "If characteristics or effect modifiers were not pre-specified, did the researchers address whether bias was introduced into the analysis?",
          "若特徵或效應修飾因子未預先指定，研究者是否說明分析是否因此引入偏差？"
        ),
        t(
          "Did the researchers reflect on whether the characteristics or effect modifiers selected were well-defined to ensure clarity about the effect being investigated?",
          "研究者是否反思所選特徵或效應修飾因子的定義是否明確，足以釐清所探討的效應？"
        ),
        t(
          "If no rationale was given for the selection of specific characteristics or effect modifiers, or the rationale was not supported by evidence or a plausible argument of meaningfulness, did the researchers discuss whether this affected the validity or relevance of the subgroup analysis?",
          "若未說明選擇特定特徵或效應修飾因子的理由，或理由缺乏證據或合理論述支持，研究者是否討論這是否影響次族群分析的效度或相關性？"
        ),
        t(
          "If characteristics or effect modifiers were closely related to other characteristics, did the researchers mention the potential for confounding?",
          "若特徵或效應修飾因子與其他特徵高度相關，研究者是否提及干擾的可能？"
        ),
        t(
          "Did the researchers outline whether the subgroup analyses were sufficiently powered to detect an effect on the primary outcome?",
          "研究者是否說明次族群分析有無足夠檢定力偵測主要結果的效應？"
        ),
        t(
          "If continuous data were allocated to categories, did the researchers address whether the thresholds or cut-off points could have introduced bias into the subgroup analysis or were not meaningful either clinically or in terms of public or population health?",
          "若將連續資料分組，研究者是否說明切點可能使次族群分析引入偏差，或在臨床或公共衛生上不具意義？"
        ),
        t(
          "If more than three characteristics or effect modifiers were investigated, or subgroup analyses performed, did the researchers adjust for multiple testing and consider the potential to generate Type I errors?",
          "若探討超過三個特徵或效應修飾因子、或進行多項次族群分析，研究者是否校正多重檢定並考慮第一型錯誤的可能？"
        ),
        t(
          "Did the researchers explain the results of any tests for interaction and whether they were statistically significant?",
          "研究者是否解釋交互作用檢定的結果及其是否具統計顯著？"
        ),
        t(
          "Did the researchers discuss the implications of whether the results of tests for interaction were quantitative or qualitative?",
          "研究者是否討論交互作用屬於量性或質性的意涵？"
        ),
        t(
          "If the analysis of effect modification was based on a comparison between studies, did the researchers reflect on whether the number of studies in the smallest subgroups was large enough for the results to be credible?",
          "若效應修飾的分析是基於研究間比較，研究者是否反思最小次族群中的研究數是否足以讓結果可信？"
        ),
      ],
      teaching: null,
      keywords: ["subgroup", "interaction", "post hoc", "exploratory"],
    },
    {
      id: "q7_2",
      section: "C",
      number: "7.2",
      question: t("Meta-regression", "統合迴歸"),
      considerIntro: null,
      consider: [
        t(
          "If characteristics or effect modifiers were not pre-specified, did the researchers address whether bias was introduced into the analysis?",
          "若特徵或效應修飾因子未預先指定，研究者是否說明分析是否因此引入偏差？"
        ),
        t(
          "If continuous data were allocated into categories, did the researchers address whether any thresholds or cut-off points for categorisation were arbitrary and could have introduced bias into the meta-regression or were not meaningful clinically or in terms of public or population health?",
          "若將連續資料分組，研究者是否說明分組切點是否武斷、可能使統合迴歸引入偏差，或在臨床或公共衛生上不具意義？"
        ),
        t(
          "If more than three characteristics or effect modifiers were investigated, or meta-regression analyses performed, did the researchers adjust for multiple testing and consider the potential to generate Type I errors?",
          "若探討超過三個特徵或效應修飾因子、或進行多項統合迴歸，研究者是否校正多重檢定並考慮第一型錯誤的可能？"
        ),
        t(
          "Did the researchers discuss the implications of any tests for interaction and whether they were statistically significant?",
          "研究者是否討論交互作用檢定的意涵及其是否具統計顯著？"
        ),
        t(
          "If a random-effects model was not used to account for residual heterogeneity and/or mixed effects, which would have allowed for both within-study and between-study variation, did the researchers outline the implications for the results?",
          "若未使用隨機效應模型處理殘餘異質性或混合效應（可同時考量研究內與研究間變異），研究者是否說明其對結果的影響？"
        ),
        t(
          "If the analysis of effect modification was based on a between-study comparison, did the researchers reflect on whether the number of primary research studies in the meta-regression was sufficient for the results to be credible?",
          "若效應修飾的分析是基於研究間比較，研究者是否反思統合迴歸中的原始研究數是否足以讓結果可信？"
        ),
      ],
      teaching: null,
      keywords: ["meta-regression", "metaregression"],
    },
    {
      id: "q8",
      section: "C",
      number: "8",
      question: t(
        "Would the benefits of intervention outweigh any potential disadvantages, harms and/or additional demand for resources associated with acting on the results?",
        "介入措施的效益是否超過依結果採取行動可能帶來的缺點、傷害或額外資源需求？"
      ),
      considerIntro: null,
      consider: [
        t(
          "Are you clear about the likely benefits of the intervention, bearing in mind the potential impacts of any study limitations?",
          "考量研究限制的潛在影響後，你是否清楚介入措施可能的效益？"
        ),
        t(
          "Did the researchers identify any potential disadvantages or harms associated with the intervention?",
          "研究者是否指出介入措施可能的缺點或傷害？"
        ),
        t(
          "If so, did the researchers assess any benefits of the intervention against the disadvantages or harms, and discuss the overall balance between benefit and harm?",
          "若有，研究者是否權衡介入措施的效益與缺點或傷害，並討論整體利弊平衡？"
        ),
        t(
          "Did the researchers report any information on the potential demand for resources (e.g. cost, workforce, time, skills level/skills mix, training needs, data collection and analysis, IT requirements) that might be associated with acting on the results of the systematic review?",
          "研究者是否報告依系統性回顧結果採取行動可能需要的資源（如成本、人力、時間、技能程度與組合、訓練需求、資料收集與分析、資訊系統需求）？"
        ),
      ],
      teaching: null,
      keywords: ["adverse", "harm", "safety", "cost", "benefit"],
    },
    {
      id: "q9",
      section: "D",
      number: "9",
      question: t(
        "Can the results of the systematic review be applied to your local population/in your local setting or context?",
        "系統性回顧的結果能否應用於你的在地族群、場域或情境？"
      ),
      considerIntro: null,
      consider: [
        t(
          "Are there differences between your local population and the participants in the primary research studies in the systematic review that would influence whether you would act upon the results?",
          "你的在地族群與原始研究受試者之間，是否有會影響你是否依結果採取行動的差異？"
        ),
        t(
          "Are there differences between your local setting and the settings or contexts in the primary research studies in the systematic review that would influence whether you would act upon the results?",
          "你的在地場域與原始研究的場域或情境之間，是否有會影響你是否依結果採取行動的差異？"
        ),
        t(
          "Are there any outcomes or other factors that the researchers could have studied that would have been useful to you bearing in mind the needs of your local population and/or setting?",
          "考量在地族群或場域的需求，是否有研究者原本可以探討、且對你有用的結果指標或其他因素？"
        ),
      ],
      teaching: "以台灣情境思考：健保給付、院內處方集是否有該藥、族群（如亞洲人藥動學差異）、照護人力配置。",
      keywords: ["generalisability", "generalizability", "applicability", "setting", "population"],
    },
    {
      id: "q10",
      section: "E",
      number: "10",
      question: t(
        "If actioned, would the findings from the systematic review represent greater or additional value for the individuals or populations for whom you are responsible?",
        "若付諸行動，系統性回顧的發現是否能為你負責的個人或族群帶來更大或額外的價值？"
      ),
      considerIntro: t(
        "Value equals the Outcome/s (Benefit minus Harm) divided by the Resources required for implementation.",
        "價值＝結果（效益－傷害）÷ 實施所需資源。"
      ),
      consider: [
        t(
          "What resources would be needed to take action on the findings of the systematic review? Take account of various types of resource, not only costs, but also time, skills mix, skills development or training needs, IT requirements, and other material resources.",
          "依系統性回顧的發現採取行動需要哪些資源？請考量各類資源，不只是成本，也包括時間、技能組合、技能發展或訓練需求、資訊系統需求與其他物質資源。"
        ),
        t(
          "If necessary, are you able to disinvest resources from other activities to be able to re-invest in actioning the findings from the systematic review?",
          "必要時，你能否從其他活動撤出資源，轉而投入實行系統性回顧的發現？"
        ),
      ],
      skipWhen: { item: "q9", answer: "N" },
      teaching: null,
      keywords: ["cost-effectiveness", "resource", "implementation"],
    },
    {
      id: "conclusion",
      section: "Z",
      number: "結論",
      question: t(
        "What is your conclusion about the systematic review – can it be used to support evidence-based decision-making?",
        "你對這篇系統性回顧的結論是什麼？它能否用來支持實證決策？"
      ),
      considerIntro: null,
      consider: [
        t(
          "Would you use it to change practice or to recommend changes to care policy and procedures in your organisation?",
          "你會用它來改變臨床實務，或建議修改機構內的照護政策與流程嗎？"
        ),
        t("Could you judiciously implement the intervention without delay?", "你能否審慎地立即實施該介入措施？"),
      ],
      teaching: null,
      keywords: ["conclusion", "implications for practice"],
    },
  ],
  summaryFields: [
    { id: "positive", label: t("Positive/Methodologically sound", "正面／方法學嚴謹之處") },
    { id: "negative", label: t("Negative/Relatively poor methodology", "負面／方法學相對薄弱之處") },
    { id: "unknowns", label: t("Unknowns", "未知或無法判斷之處") },
  ],
};
