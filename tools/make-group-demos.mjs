// 產生「多組比較」示範作答檔：四套工具各 4 組，寫到 examples/group-compare/<toolId>/
// 以參考答案為底再改動，讓每套工具都有一致、部分分歧、完全分歧、未答與（CASP）免答的題目。
// 題目或參考答案改動後內容雜湊會變，需重跑：node tools/make-group-demos.mjs
// 筆記是虛構的學員意見，刻意不抄參考理由（揭曉前 DOM 不得出現參考理由，驗收 3）。

import { mkdir, writeFile } from "node:fs/promises";
import { getTool, MOCK_PREFIX } from "../js/tools/registry.js";
import { createAppraisal, parseAppraisal } from "../js/core/appraisal.js";
import * as casp from "../js/engines/casp.js";
import * as rob2 from "../js/engines/rob2.js";
import * as grade from "../js/engines/grade.js";

const OUT = new URL("../examples/group-compare/", import.meta.url);
const EXPORTED_AT = "2026-10-15T09:00:00.000Z";
const U = "unanswered";

// ---------- 規格：每組 = { reviewer, answers（依序套用）, notes, ... } ----------

const CASP_RCT = [
  {
    reviewer: "第一組",
    answers: {},
    notes: { q3a: "只搜 MEDLINE 而且限英文，判 No。", q6: "異質性高卻用固定效應，信賴區間會太窄。", conclusion: "方法學問題太多，目前還不能改常規。" },
    summary: { positive: "雙人篩選與擷取、用 RoB 2。", negative: "搜尋只有一個資料庫；模型選擇不當。", unknowns: "院內劑型能否對應。" },
  },
  {
    reviewer: "第二組",
    answers: { q3a: "Y", q6: "CT", q9: "Y", q10: "Y", conclusion: "Y" },
    notes: { q3a: "有用 MeSH 也手動查參考文獻，我們覺得算完整。", q6: "有做敏感度分析，但看不太懂固定效應的影響。", q9: "族群是混合 ICU，跟我們醫院很像。", q10: "褪黑激素便宜，應該值得。", conclusion: "主要結果有統計顯著，可以考慮常規使用。" },
    summary: { positive: "主要結果顯著、副作用少。", negative: "", unknowns: "" },
  },
  {
    reviewer: "第三組",
    answers: { q9: "N", conclusion: "N" },
    notes: { q3a: "單一資料庫＋限英文，可能漏掉負面試驗。", q9: "沒有台灣試驗，劑型也不一定有，不適用。", conclusion: "不支持常規使用。" },
  },
  {
    reviewer: "", // 示範：沒填評讀者時以檔名當組名
    answers: { q4: "CT", q6_1: U, q6_2: U, q7: U, q7_1: U, q7_2: U, q8: U, q9: U, q10: U, conclusion: U },
    notes: { q4: "有用 RoB 2，但不確定是不是雙人評估。" },
  },
];

const CASP_OBS = [
  {
    reviewer: "第一組",
    answers: {},
    notes: { q3b: "標題摘要只有單人篩選，抽 20% 複核不夠。", q6: "合併未校正 OR，干擾沒處理。", conclusion: "只能當提醒，不足以支持停用 PPI。" },
  },
  {
    reviewer: "第二組",
    answers: { q3a: "N", q3b: "Y", q6: "Y", conclusion: "Y" },
    notes: { q3a: "沒有搜灰色文獻和會議摘要。", q3b: "全文有雙人判讀，應該可以。", q6: "有預先指定的次族群和統合迴歸，分析算完整。", conclusion: "16 篇研究都指向風險增加，應避免 PPI。" },
  },
  {
    reviewer: "第三組",
    answers: { q7: "CT", q9: "N", conclusion: "N" },
    notes: { q7: "有列限制，但沒提適應症干擾，不知道算不算完整。", q9: "國外研究為主，族群不同。", conclusion: "因果語言太強，不採納。" },
  },
  {
    reviewer: "第四組",
    answers: { q3b: "CT", q7: U, q7_1: U, q7_2: U, q8: U, q9: U, q10: U, conclusion: U },
    notes: { q3b: "方法只寫抽樣複核，看不出漏篩比例。" },
  },
];

const ROB2 = [
  {
    reviewer: "第一組",
    answers: { "1.1": "PY", "4.5": "Y" },
    notes: { "1.1": "寫電腦產生序列，但沒寫細節，判 PY。", "4.5": "說明書寫靜脈鐵劑更強效，填答一定受影響。", D4: "主觀結果＋受試者知情。" },
  },
  {
    reviewer: "第二組",
    answers: { "3.4": "PN", "5.1": "PN" },
    judgements: { D2: "Some concerns" },
    overrideReasons: { D2: "開放標籤、受試者知道分組，應該有疑慮。" },
    notes: { "3.4": "缺失比例雖不同，但不確定原因都跟疲勞有關。", "5.1": "登錄日期在收案開始之後，分析計畫可能是事後定的。" },
  },
  {
    reviewer: "第三組",
    answers: { "4.5": "NI", "5.1": "NI" },
    notes: { "4.5": "看不到受試者實際被告知什麼。", "5.1": "沒找到分析計畫的公開時間。" },
  },
  {
    reviewer: "第四組",
    answers: { "5.1": U, "5.2": U, "5.3": U },
    judgements: { D5: U, overall: U },
    notes: { D3: "口服組缺失快三成，偏差風險高。" },
  },
];

const GRADE = [
  {
    reviewer: "第一組",
    answers: {},
    notes: { riskOfBias: "主要權重來自開放標籤的 High 試驗，降一級。", imprecision: "信賴區間跨過 MID 3 分。" },
  },
  {
    reviewer: "第二組",
    answers: { riskOfBias: "-2", publicationBias: "-1" },
    notes: { riskOfBias: "七成權重都是 High，應降兩級。", publicationBias: "多數試驗由廠商贊助，懷疑有發表偏差。" },
  },
  {
    reviewer: "第三組",
    answers: { riskOfBias: "0" },
    notes: { riskOfBias: "只看低風險試驗方向也一致，不降。" },
  },
  {
    reviewer: "第四組",
    answers: { imprecision: U, publicationBias: U },
    certainty: U,
    notes: { inconsistency: "I² 18%，不降。" },
  },
];

// ---------- 組裝 ----------

function refAnswers(tool) {
  const ref = tool.references[tool.mockPapers[0].id];
  return Object.fromEntries(Object.entries(ref.answers).map(([k, v]) => [k, v.answer]));
}

function applyAnswers(setAnswer, def, base, changes) {
  let answers = base;
  for (const [id, value] of Object.entries(changes)) answers = setAnswer(def, answers, id, value);
  return answers;
}

function build(state, tool, spec) {
  const def = tool.definition;
  state.metadata = { reviewerName: spec.reviewer, appraisalDate: "2026-10-15" };
  state.notes = { ...(spec.notes ?? {}) };
  if (def.engine === "casp") {
    state.answers = applyAnswers(casp.setAnswer, def, refAnswers(tool), spec.answers);
    Object.assign(state.toolData.summary, spec.summary ?? {});
  } else if (def.engine === "rob2") {
    state.answers = applyAnswers(rob2.setAnswer, def, refAnswers(tool), spec.answers);
    for (const d of ["D1", "D2", "D3", "D4", "D5"]) {
      const s = rob2.suggestDomain(def, d, state.answers);
      state.toolData.judgements[d] = s.status === "ok" ? s.judgement : U;
    }
    const overall = rob2.suggestOverall(state.toolData.judgements);
    state.toolData.judgements.overall = overall.status === "ok" ? overall.judgement : U;
    Object.assign(state.toolData.judgements, spec.judgements ?? {});
    Object.assign(state.toolData.overrideReasons, spec.overrideReasons ?? {});
  } else {
    state.answers = applyAnswers(grade.setAnswer, def, refAnswers(tool), spec.answers);
    const s = grade.suggestCertainty(def, state.answers);
    state.toolData.certainty = spec.certainty ?? (s.status === "ok" ? s.level : U);
  }
  state.exportedAt = EXPORTED_AT;
  return state;
}

const PLAN = { "casp-sr-rct": CASP_RCT, "casp-sr-obs": CASP_OBS, rob2: ROB2, grade: GRADE };

for (const [toolId, specs] of Object.entries(PLAN)) {
  const tool = getTool(toolId);
  const paper = tool.mockPapers[0];
  const dir = new URL(`${toolId}/`, OUT);
  await mkdir(dir, { recursive: true });
  for (const [i, spec] of specs.entries()) {
    const state = build(await createAppraisal(tool, MOCK_PREFIX + paper.id, paper.title.en), tool, spec);
    const text = JSON.stringify(state, null, 2) + "\n";
    const check = await parseAppraisal(text);
    if (!check.ok) throw new Error(`${toolId} 第 ${i + 1} 組不合法：${JSON.stringify(check.errors)}`);
    await writeFile(new URL(`${toolId}_group-${i + 1}.json`, dir), text);
  }
  console.log(`${toolId}: ${specs.length} 組`);
}
