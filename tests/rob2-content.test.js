// RoB 2 內容完整性：C1–C4（含 D-L1：不得出現中譯欄位）
import { test } from "node:test";
import assert from "node:assert/strict";
import { getTool } from "../js/tools/registry.js";
import * as rob2 from "../js/engines/rob2.js";
import { clone } from "./helpers.js";

const tool = getTool("rob2");
const def = tool.definition;
const PLACEHOLDER = /^(todo|tbd|n\/?a|待補|待填|xxx|-+|\.+)$/i;
const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0 && !PLACEHOLDER.test(s.trim());

export function rob2DefinitionErrors(d) {
  const errors = [];
  for (const domain of d.domains) {
    if (!nonEmpty(domain.title?.en)) errors.push(`${domain.id}: 缺官方英文標題`);
    if ("zh" in (domain.title ?? {})) errors.push(`${domain.id}: 標題不得有中譯（D-L1）`);
    for (const q of domain.questions) {
      if (!nonEmpty(q.text)) errors.push(`${q.id}: 缺官方英文題目`);
      if (typeof q.text !== "string") errors.push(`${q.id}: 題目只能是英文字串，不得有中譯物件（D-L1）`);
      if (!(q.teaching === null || nonEmpty(q.teaching))) errors.push(`${q.id}: teaching 必須是 null 或非空字串`);
      if (!q.options.every((o) => rob2.SQ_VALUES.includes(o))) errors.push(`${q.id}: 選項不合法`);
    }
  }
  const ids = d.domains.flatMap((x) => x.questions.map((q) => q.id));
  if (new Set(ids).size !== ids.length) errors.push("題目 id 重複");
  return errors;
}

export function rob2ReferenceErrors(d, mockPaper, ref) {
  const errors = [];
  const paragraphs = mockPaper.sections.flatMap((s) => s.paragraphs);
  const checkSources = (key, sources) => {
    if (!Array.isArray(sources) || sources.length === 0) return errors.push(`${key}: 無來源`);
    for (const s of sources) {
      if (s.type === "mock") {
        const p = paragraphs.find((x) => x.id === s.paragraphId);
        if (!p) errors.push(`${key}: 段落 ${s.paragraphId} 不存在`);
        else if (!p.items.includes(key)) errors.push(`${key}: 段落 ${s.paragraphId} 不在允許引用集合`);
      } else if (s.type === "doc") {
        if (!nonEmpty(s.citation) || !nonEmpty(s.locator)) errors.push(`${key}: 文件來源缺 citation 或 locator`);
      } else errors.push(`${key}: 未知來源類型`);
    }
  };
  const answers = {};
  for (const q of rob2.allQuestions(d)) {
    const r = ref.answers[q.id];
    if (!r) { errors.push(`${q.id}: 缺參考答案`); continue; }
    answers[q.id] = r.answer;
    if (r.answer === rob2.NOT_APPLICABLE) continue;
    if (!q.options.includes(r.answer)) errors.push(`${q.id}: 判斷值不合法 ${r.answer}`);
    if (!nonEmpty(r.rationale)) errors.push(`${q.id}: 理由為空或占位字`);
    checkSources(q.id, r.sources);
  }
  for (const e of rob2.invariantErrors(d, answers)) errors.push(`${e.path}: ${e.message}`);
  const domainJ = {};
  for (const k of rob2.JUDGEMENT_KEYS) {
    const j = ref.judgements?.[k];
    if (!j) { errors.push(`${k}: 缺判斷`); continue; }
    if (!rob2.JUDGEMENTS.includes(j.judgement)) errors.push(`${k}: 判斷值不合法`);
    if (!nonEmpty(j.rationale)) errors.push(`${k}: 理由為空`);
    checkSources(k, j.sources);
    if (k !== "overall") domainJ[k] = j.judgement;
  }
  // C3：參考判斷與演算法建議不同時，推翻理由必填且附方法學文件來源
  for (const k of ["D1", "D2", "D3", "D4", "D5"]) {
    const s = rob2.suggestDomain(d, k, answers);
    const j = ref.judgements?.[k];
    if (s.status !== "ok") { errors.push(`${k}: 參考答案的 SQ 不足以產生建議`); continue; }
    if (j && j.judgement !== s.judgement && !(nonEmpty(j.overrideReason) && j.sources.some((x) => x.type === "doc"))) {
      errors.push(`${k}: 與演算法建議（${s.judgement}）不同，須填推翻理由並附方法學來源`);
    }
  }
  const o = rob2.suggestOverall(domainJ);
  const oj = ref.judgements?.overall;
  if (o.status === "ok" && oj && oj.judgement !== o.judgement && !(nonEmpty(oj.overrideReason) && oj.sources.some((x) => x.type === "doc"))) {
    errors.push(`overall: 與建議（${o.judgement}）不同，須填推翻理由並附方法學來源`);
  }
  return errors;
}

test("C4 rob2：definition 只有官方英文原文與自寫教學補充", () => {
  assert.deepEqual(rob2DefinitionErrors(def), []);
});

for (const mock of tool.mockPapers) {
  test(`C1–C3 rob2/${mock.id}：參考答案完整、引用合法、不一致須附推翻理由`, () => {
    const ref = tool.references[mock.id];
    assert.ok(ref);
    assert.deepEqual(rob2ReferenceErrors(def, mock, ref), []);
  });
  test(`rob2/${mock.id}：段落 id 唯一、items 指向存在的題目或 domain`, () => {
    const paragraphs = mock.sections.flatMap((s) => s.paragraphs);
    const ids = paragraphs.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    const valid = [...rob2.allQuestions(def).map((q) => q.id), ...rob2.JUDGEMENT_KEYS];
    for (const p of paragraphs) for (const it of p.items) assert.ok(valid.includes(it), `${p.id} → ${it}`);
  });
}

const mock = tool.mockPapers[0];
const ref = tool.references[mock.id];

test("C4 反例：題目出現中譯物件 → 失敗", () => {
  const bad = clone(def);
  bad.domains[0].questions[0].text = { en: "Was the allocation sequence random?", zh: "分派序列是否隨機？" };
  assert.match(rob2DefinitionErrors(bad).join("\n"), /D-L1/);
});

test("C1／C2 反例：引用集合外段落、空理由、缺題 → 失敗", () => {
  const a = clone(ref);
  a.answers["1.1"].sources = [{ type: "mock", paragraphId: "rob-flow" }];
  assert.match(rob2ReferenceErrors(def, mock, a).join("\n"), /1\.1: 段落 rob-flow 不在允許引用集合/);
  const b = clone(ref);
  b.answers["3.4"].rationale = "TODO";
  assert.match(rob2ReferenceErrors(def, mock, b).join("\n"), /3\.4: 理由/);
  const c = clone(ref);
  delete c.answers["4.5"];
  assert.match(rob2ReferenceErrors(def, mock, c).join("\n"), /4\.5: 缺參考答案/);
});

test("C3 反例：參考判斷與演算法不同但未填推翻理由 → 失敗；填理由並附文件來源 → 通過", () => {
  const bad = clone(ref);
  bad.judgements.D2.judgement = "Some concerns";
  assert.match(rob2ReferenceErrors(def, mock, bad).join("\n"), /D2: 與演算法建議（Low）不同/);
  bad.judgements.D2.overrideReason = "   ";
  assert.match(rob2ReferenceErrors(def, mock, bad).join("\n"), /D2: 與演算法建議/);
  bad.judgements.D2.overrideReason = "示範：多個受試者知情後提前停藥，評讀者判斷仍有疑慮。";
  assert.doesNotMatch(rob2ReferenceErrors(def, mock, bad).join("\n"), /D2: 與演算法建議/);
});
