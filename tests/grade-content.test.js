// GRADE 內容完整性：C1–C4（含 D-L1：官方欄位只收英文，不得出現中譯）
import { test } from "node:test";
import assert from "node:assert/strict";
import { getTool } from "../js/tools/registry.js";
import * as grade from "../js/engines/grade.js";
import { clone } from "./helpers.js";

const tool = getTool("grade");
const def = tool.definition;
const PLACEHOLDER = /^(todo|tbd|n\/?a|待補|待填|xxx|-+|\.+)$/i;
const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0 && !PLACEHOLDER.test(s.trim());
const CJK = /[㐀-鿿]/;

export function gradeDefinitionErrors(d) {
  const errors = [];
  const official = (obj, where) => {
    if (!obj || !nonEmpty(obj.en)) errors.push(`${where}: 缺官方英文`);
    if (obj && "zh" in obj) errors.push(`${where}: 官方欄位不得有中譯（D-L1）`);
    if (obj && CJK.test(obj.en ?? "")) errors.push(`${where}: 官方英文欄位混入中文`);
  };
  official(d.title, "title");
  d.levels.forEach((l, i) => official(l, `levels[${i}]`));
  d.design.options.forEach((o, i) => official(o, `design.options[${i}]`));
  if (!nonEmpty(d.design.teaching)) errors.push("design: teaching 為空");
  for (const f of [...d.downgrade, ...d.upgrade]) {
    official(f.name, `${f.id}.name`);
    if (!nonEmpty(f.locator)) errors.push(`${f.id}: 缺 locator`);
    if (!nonEmpty(f.teaching)) errors.push(`${f.id}: teaching 為空`);
    if (!(f.note === null || nonEmpty(f.note))) errors.push(`${f.id}: note 必須是 null 或非空字串`);
    if (!Array.isArray(f.keywords) || f.keywords.length === 0) errors.push(`${f.id}: 無關鍵字`);
    if (!Array.isArray(f.values) || !f.values.includes("0")) errors.push(`${f.id}: 合法值須含 "0"`);
  }
  for (const k of ["quote", "rctQuote"]) if (!nonEmpty(d.upgradeRule[k]) || CJK.test(d.upgradeRule[k])) errors.push(`upgradeRule.${k}: 須為英文原文`);
  const ids = grade.itemIds(d);
  if (new Set(ids).size !== ids.length) errors.push("項目 id 重複");
  return errors;
}

export function gradeReferenceErrors(d, mockPaper, ref) {
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
  for (const id of grade.itemIds(d)) {
    const r = ref.answers[id];
    if (!r) { errors.push(`${id}: 缺參考答案`); continue; }
    answers[id] = r.answer;
    if (r.answer === grade.NOT_APPLICABLE) continue;
    if (!grade.allowedValues(d, id).includes(r.answer)) errors.push(`${id}: 判斷值不合法 ${r.answer}`);
    if (!nonEmpty(r.rationale)) errors.push(`${id}: 理由為空或占位字`);
    checkSources(id, r.sources);
  }
  for (const id of Object.keys(ref.answers)) if (!grade.itemIds(d).includes(id)) errors.push(`${id}: 多出的參考答案`);
  for (const e of grade.invariantErrors(d, answers)) errors.push(`${e.path}: ${e.message}`);
  const j = ref.judgement;
  if (!j) return [...errors, "judgement: 缺最終確定性"];
  if (!grade.CERTAINTIES.includes(j.judgement)) errors.push("judgement: 值不合法");
  if (!nonEmpty(j.rationale)) errors.push("judgement: 理由為空");
  checkSources("certainty", j.sources);
  // C3：與演算法建議不同時，推翻理由必填且附方法學文件來源
  const s = grade.suggestCertainty(d, answers);
  if (s.status !== "ok") errors.push("judgement: 參考答案不足以產生建議");
  else if (j.judgement !== s.level && !(nonEmpty(j.overrideReason) && j.sources.some((x) => x.type === "doc"))) {
    errors.push(`judgement: 與演算法建議（${s.level}）不同，須填推翻理由並附方法學來源`);
  }
  return errors;
}

test("C4 grade：官方欄位只有英文、教學補充與 locator 齊全", () => {
  assert.deepEqual(gradeDefinitionErrors(def), []);
});

test("C4 grade 反例：注入中譯、缺英文、缺 locator、空 teaching 皆 fail", () => {
  const cases = [
    (d) => (d.downgrade[0].name.zh = "偏差風險"),
    (d) => (d.downgrade[1].name.en = ""),
    (d) => (d.upgrade[0].name.en = "大效果"),
    (d) => (d.levels[0].zh = "高"),
    (d) => (d.downgrade[3].locator = ""),
    (d) => (d.upgrade[2].teaching = "TODO"),
    (d) => (d.upgradeRule.rctQuote = "理論上可行"),
    (d) => (d.downgrade[4].values = ["-1"]),
  ];
  for (const mutate of cases) {
    const d = clone(def);
    mutate(d);
    assert.ok(gradeDefinitionErrors(d).length > 0, mutate.toString());
  }
});

test("C1–C3 grade：每個範例的參考答案完整、來源可追溯、與演算法一致或附推翻理由", () => {
  assert.ok(tool.mockPapers.length > 0);
  for (const m of tool.mockPapers) {
    assert.ok(m.fictional, `${m.id} 必須標示為虛構`);
    assert.deepEqual(gradeReferenceErrors(def, m, tool.references[m.id]), [], m.id);
  }
});

test("C1–C3 grade 反例：缺理由、引用不允許的段落、RCT 參考答案寫升級值、判斷與建議不同卻無推翻理由皆 fail", () => {
  const m = tool.mockPapers[0];
  const base = tool.references[m.id];
  const cases = [
    (r) => (r.answers.imprecision.rationale = "待補"),
    (r) => (r.answers.inconsistency.sources = [{ type: "mock", paragraphId: "sr-search" }]),
    (r) => (r.answers.inconsistency.sources = [{ type: "mock", paragraphId: "no-such" }]),
    (r) => (r.answers.largeEffect = { answer: "+1", rationale: "x", sources: [{ type: "mock", paragraphId: "sr-main-result" }] }),
    (r) => (r.answers.publicationBias.answer = "-2"),
    (r) => delete r.answers.indirectness,
    (r) => (r.judgement.judgement = "Moderate"),
    (r) => (r.judgement.sources = [{ type: "doc", citation: "GRADE Handbook", locator: "" }]),
  ];
  for (const mutate of cases) {
    const r = clone(base);
    mutate(r);
    assert.ok(gradeReferenceErrors(def, m, r).length > 0, mutate.toString());
  }
  // 與建議不同但有推翻理由與方法學來源 → 允許
  const ok = clone(base);
  ok.judgement.judgement = "Moderate";
  ok.judgement.overrideReason = "兩項都在邊緣，依 Handbook p.12 只降一項並註明";
  assert.deepEqual(gradeReferenceErrors(def, m, ok), []);
});
