// RoB 2 引擎：條件題路由、signalling questions → domain 建議判斷（決策表）、overall 建議。
// 演算法只給「建議」；學員判斷由 UI 記錄，不一致時不判錯（SPEC §7.1）。

import { UNANSWERED, NOT_APPLICABLE } from "./common.js";
import { tables, LOW, SOME, HIGH } from "./rob2-tables.js";

export { UNANSWERED, NOT_APPLICABLE, LOW, SOME, HIGH };
export const SQ_VALUES = ["Y", "PY", "PN", "N", "NI"];
export const JUDGEMENTS = [LOW, SOME, HIGH];
export const JUDGEMENT_KEYS = ["D1", "D2", "D3", "D4", "D5", "overall"];

export function allQuestions(definition) {
  return definition.domains.flatMap((d) => d.questions.map((q) => ({ ...q, domain: d.id })));
}

function findQuestion(definition, qid) {
  return allQuestions(definition).find((q) => q.id === qid) ?? null;
}

// 回傳 "asked"（需作答）、"skipped"（依路徑不需作答）、"pending"（上游題尚未作答，暫不決定）
export function askState(question, answers) {
  if (!question.askIf) return "asked";
  const evalCond = ({ q, in: allowed }) => {
    const v = answers[q];
    if (v === UNANSWERED || v === undefined) return "pending";
    return allowed.includes(v) ? true : false;
  };
  const results = (question.askIf.all ?? question.askIf.any).map(evalCond);
  if (question.askIf.all) {
    if (results.includes(false)) return "skipped";
    return results.includes("pending") ? "pending" : "asked";
  }
  if (results.includes(true)) return "asked";
  return results.includes("pending") ? "pending" : "skipped";
}

export function emptyAnswers(definition) {
  return Object.fromEntries(allQuestions(definition).map((q) => [q.id, UNANSWERED]));
}

// 依題目順序（上游在前）同步 NA：被跳過 → not-applicable；不再跳過 → unanswered
export function normalizeAnswers(definition, answers) {
  const next = { ...answers };
  for (const q of allQuestions(definition)) {
    const state = askState(q, next);
    if (state === "skipped") next[q.id] = NOT_APPLICABLE;
    else if (next[q.id] === NOT_APPLICABLE) next[q.id] = UNANSWERED;
  }
  return next;
}

export function setAnswer(definition, answers, qid, value) {
  const q = findQuestion(definition, qid);
  if (!q) throw new Error(`未知題目：${qid}`);
  if (value !== UNANSWERED && !q.options.includes(value)) throw new Error(`${qid} 不接受答案 ${value}`);
  if (askState(q, answers) === "skipped") throw new Error(`${qid} 依路徑不需作答`);
  return normalizeAnswers(definition, { ...answers, [qid]: value });
}

export function missingInDomain(definition, domainId, answers) {
  const domain = definition.domains.find((d) => d.id === domainId);
  return domain.questions.filter((q) => askState(q, answers) !== "skipped" && !SQ_VALUES.includes(answers[q.id])).map((q) => q.id);
}

function matchRow(rows, answers) {
  return rows.find((row) => Object.entries(row.when).every(([qid, allowed]) => allowed.includes(answers[qid]))) ?? null;
}

function pathText(questions, answers, result) {
  const parts = questions.filter((q) => answers[q.id] !== NOT_APPLICABLE).map((q) => `${q.id}=${answers[q.id]}`);
  return `${parts.join(", ")} → ${result}`;
}

// { status: "insufficient", missing } | { status: "ok", judgement, rowIds, path, locator }
export function suggestDomain(definition, domainId, answers) {
  const missing = missingInDomain(definition, domainId, answers);
  if (missing.length) return { status: "insufficient", missing };
  const domain = definition.domains.find((d) => d.id === domainId);
  const table = tables[domainId];
  if (domainId === "D2") {
    const p1 = matchRow(table.part1, answers);
    const p2 = matchRow(table.part2, answers);
    if (!p1 || !p2) return { status: "error", message: "決策表沒有相符的列" };
    const judgement = [p1.result, p2.result].includes(HIGH) ? HIGH : p1.result === LOW && p2.result === LOW ? LOW : SOME;
    const qs1 = domain.questions.filter((q) => ["2.1", "2.2", "2.3", "2.4", "2.5"].includes(q.id));
    const qs2 = domain.questions.filter((q) => ["2.6", "2.7"].includes(q.id));
    return {
      status: "ok",
      judgement,
      rowIds: [p1.id, p2.id],
      parts: { part1: p1.result, part2: p2.result },
      path: `Part 1：${pathText(qs1, answers, p1.result)}；Part 2：${pathText(qs2, answers, p2.result)} ⇒ ${judgement}`,
      locator: table.locator,
    };
  }
  const row = matchRow(table.rows, answers);
  if (!row) return { status: "error", message: "決策表沒有相符的列" };
  return { status: "ok", judgement: row.result, rowIds: [row.id], path: pathText(domain.questions, answers, row.result), locator: table.locator };
}

// 依學員的五個 domain 判斷給 overall 建議（Table 1）。多個 Some concerns 只提示，不自動升為 High
export function suggestOverall(domainJudgements) {
  const values = ["D1", "D2", "D3", "D4", "D5"].map((d) => domainJudgements[d]);
  if (values.some((v) => !JUDGEMENTS.includes(v))) return { status: "insufficient" };
  if (values.includes(HIGH)) return { status: "ok", judgement: HIGH, considerHigh: false };
  if (values.every((v) => v === LOW)) return { status: "ok", judgement: LOW, considerHigh: false };
  const someCount = values.filter((v) => v === SOME).length;
  return { status: "ok", judgement: SOME, considerHigh: someCount >= 2 };
}

export function progress(definition, appraisal) {
  const qs = allQuestions(definition).filter((q) => askState(q, appraisal.answers) !== "skipped");
  const doneQ = qs.filter((q) => SQ_VALUES.includes(appraisal.answers[q.id])).length;
  const doneJ = JUDGEMENT_KEYS.filter((k) => JUDGEMENTS.includes(appraisal.toolData.judgements[k])).length;
  return { done: doneQ + doneJ, total: qs.length + JUDGEMENT_KEYS.length };
}

export function isComplete(definition, appraisal) {
  const { done, total } = progress(definition, appraisal);
  return total > 0 && done === total;
}

export function invariantErrors(definition, answers) {
  const errors = [];
  for (const q of allQuestions(definition)) {
    const state = askState(q, answers);
    const v = answers[q.id];
    if (state === "skipped" && v !== NOT_APPLICABLE) errors.push({ path: `answers.${q.id}`, message: "依路徑不需作答，必須是 not-applicable" });
    if (state !== "skipped" && v === NOT_APPLICABLE) errors.push({ path: `answers.${q.id}`, message: "此題需作答，不得為 not-applicable" });
    if (SQ_VALUES.includes(v) && !q.options.includes(v)) errors.push({ path: `answers.${q.id}`, message: `此題不接受 ${v}` });
  }
  return errors;
}
