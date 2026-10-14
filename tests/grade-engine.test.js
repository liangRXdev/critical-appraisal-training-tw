// A5：GRADE 引擎。合法幅度與規則直接依 SPEC §7.3 寫死在測試裡，不讀 definition（避免「定義錯、測試跟著錯」）
import { test } from "node:test";
import assert from "node:assert/strict";
import { definition as def } from "../js/tools/grade/definition.js";
import * as grade from "../js/engines/grade.js";

const U = grade.UNANSWERED;
const NA = grade.NOT_APPLICABLE;

// SPEC §7.3、D-G1、D-G2；Handbook Table 5.2、5.3、5.9
const LEGAL = {
  design: ["rct", "observational"],
  riskOfBias: ["0", "-1", "-2"],
  inconsistency: ["0", "-1", "-2"],
  indirectness: ["0", "-1", "-2"],
  imprecision: ["0", "-1", "-2", "-3"],
  publicationBias: ["0", "-1"],
  largeEffect: ["0", "+1", "+2"],
  doseResponse: ["0", "+1"],
  confounding: ["0", "+1"],
};
const DOWN = ["riskOfBias", "inconsistency", "indirectness", "imprecision", "publicationBias"];
const UP = ["largeEffect", "doseResponse", "confounding"];
const ILLEGAL_PROBES = ["-4", "-3", "-2", "-1", "0", "+1", "+2", "+3", "1", "2", "-0", "", "Y", "serious", "rct", "observational"];

// 獨立 oracle：四級量表 1–4（Very low…High）
const NAMES = ["Very low", "Low", "Moderate", "High"];
function oracle(a) {
  let score = a.design === "rct" ? 4 : 2;
  const downs = DOWN.map((k) => Number(a[k]));
  score += downs.reduce((s, x) => s + x, 0);
  if (a.design === "observational" && downs.every((x) => x === 0)) score += UP.reduce((s, k) => s + Number(a[k]), 0);
  return NAMES[Math.min(4, Math.max(1, score)) - 1];
}

function build(entries) {
  let a = grade.normalizeAnswers(def, grade.emptyAnswers(def));
  for (const [id, v] of entries) a = grade.setAnswer(def, a, id, v);
  return a;
}

function* product(lists) {
  if (!lists.length) return yield [];
  const [head, ...rest] = lists;
  for (const v of head) for (const tail of product(rest)) yield [v, ...tail];
}

test("definition 的合法值與 SPEC 一致（D-G1 發表偏差最多 −1、D-G2 不精確到 −3）", () => {
  for (const [id, values] of Object.entries(LEGAL)) assert.deepEqual(grade.allowedValues(def, id), values, id);
  assert.deepEqual(grade.itemIds(def), Object.keys(LEGAL));
});

test("A5(i) 每個項目：合法值皆可寫入、其餘值一律拒絕寫入（不靜默修正）", () => {
  const zero = DOWN.map((k) => [k, "0"]);
  for (const [id, values] of Object.entries(LEGAL)) {
    const pre = UP.includes(id) ? build([["design", "observational"], ...zero]) : build([]);
    for (const v of values) assert.equal(grade.setAnswer(def, pre, id, v)[id], v, `${id}=${v}`);
    for (const v of ILLEGAL_PROBES.filter((x) => !values.includes(x))) {
      assert.throws(() => grade.setAnswer(def, pre, id, v), undefined, `${id}=${JSON.stringify(v)} 應被拒`);
    }
    assert.throws(() => grade.setAnswer(def, pre, id, NA), undefined, `${id}=not-applicable 不能手選`);
    assert.throws(() => grade.setAnswer(def, pre, id, -1), undefined, `${id}=數字 -1 應被拒`);
  }
  assert.throws(() => grade.setAnswer(def, build([]), "nope", "0"));
});

test("A5(ii) RCT：升級欄位一律免答、任何升級值都寫不進去、不影響結果", () => {
  const a = build([["design", "rct"], ...DOWN.map((k) => [k, "0"])]);
  for (const id of UP) {
    assert.equal(a[id], NA);
    assert.equal(grade.askState(def, id, a), "skipped");
    for (const v of LEGAL[id]) assert.throws(() => grade.setAnswer(def, a, id, v), undefined, `RCT ${id}=${v}`);
  }
  assert.equal(grade.upgradeGate(def, a).reason, "rct");
  const s = grade.suggestCertainty(def, a);
  assert.equal(s.status, "ok");
  assert.equal(s.level, "High");
  // 匯入檔偷塞升級值 → 不變量拒絕
  assert.ok(grade.invariantErrors(def, { ...a, largeEffect: "+2" }).some((e) => e.path === "answers.largeEffect"));
});

test("A5(iii) 降級加總超過可降範圍 → Very low，不出錯，並標示 clamped", () => {
  const worst = build([["design", "rct"], ["riskOfBias", "-2"], ["inconsistency", "-2"], ["indirectness", "-2"], ["imprecision", "-3"], ["publicationBias", "-1"]]);
  const s = grade.suggestCertainty(def, worst);
  assert.equal(s.level, "Very low");
  assert.equal(s.raw, 3 - 10);
  assert.equal(s.clamped, true);
  const obs = build([["design", "observational"], ["riskOfBias", "-2"], ...DOWN.slice(1).map((k) => [k, "0"])]);
  assert.equal(grade.suggestCertainty(def, obs).level, "Very low");
  assert.equal(grade.suggestCertainty(def, obs).clamped, true);
  const exact = build([["design", "rct"], ["imprecision", "-3"], ...["riskOfBias", "inconsistency", "indirectness", "publicationBias"].map((k) => [k, "0"])]);
  assert.equal(grade.suggestCertainty(def, exact).level, "Very low");
  assert.equal(grade.suggestCertainty(def, exact).clamped, false); // 剛好到底，不是超出
});

test("A5(iv) observational 任一降級 ≠ 0 → 升級欄位被拒；降級改回 0 後升級欄位恢復為待作答、不還原舊值", () => {
  const zero = DOWN.map((k) => [k, "0"]);
  let a = build([["design", "observational"], ...zero, ["largeEffect", "+2"], ["doseResponse", "+1"]]);
  assert.equal(grade.suggestCertainty(def, { ...a, confounding: "0" }).level, "High"); // Low +3 → 夾在 High
  for (const k of DOWN) {
    const lowered = grade.setAnswer(def, a, k, LEGAL[k][1]);
    for (const id of UP) {
      assert.equal(lowered[id], NA, `${k} 降級後 ${id} 應免答`);
      assert.throws(() => grade.setAnswer(def, lowered, id, "+1"), undefined, `${k} 降級後 ${id} 不得寫入`);
    }
    const back = grade.setAnswer(def, lowered, k, "0");
    for (const id of UP) assert.equal(back[id], U, `${k} 改回 0 後 ${id} 應為待作答`);
  }
  const gate = grade.upgradeGate(def, grade.setAnswer(def, a, "imprecision", "-1"));
  assert.deepEqual([gate.state, gate.reason, gate.factors], ["skipped", "downgraded", ["imprecision"]]);
});

test("升級欄位在研究設計或降級因素未完成前不可作答（Handbook §5.3：先降後升）", () => {
  const partial = build([["design", "observational"], ["riskOfBias", "0"]]);
  for (const id of UP) {
    assert.equal(grade.askState(def, id, partial), "pending");
    assert.throws(() => grade.setAnswer(def, partial, id, "+1"));
  }
  assert.equal(grade.askState(def, "largeEffect", build([])), "pending");
  const s = grade.suggestCertainty(def, partial);
  assert.equal(s.status, "insufficient");
  assert.deepEqual(s.missing, ["inconsistency", "indirectness", "imprecision", "publicationBias", "largeEffect", "doseResponse", "confounding"]);
  // 已答升級後清掉一個降級因素 → 回到 pending，升級值清為 unanswered（不變量也要求如此）
  const answered = build([["design", "observational"], ...DOWN.map((k) => [k, "0"]), ["largeEffect", "+2"]]);
  const cleared = grade.setAnswer(def, answered, "imprecision", U);
  assert.equal(cleared.largeEffect, U);
  assert.deepEqual(grade.invariantErrors(def, cleared), []);
  assert.ok(grade.invariantErrors(def, { ...cleared, largeEffect: "+2" }).some((e) => e.path === "answers.largeEffect"));
  // 已有降級時，未完成的降級因素不影響「升級不適用」的判定
  const early = build([["design", "observational"], ["riskOfBias", "-1"]]);
  assert.equal(grade.askState(def, "largeEffect", early), "skipped");
});

test("A5(v) 非邊界運算：RCT + 兩因素各 −1 → Low；observational 零降級 + 大效果 +1 → Moderate", () => {
  const rct = build([["design", "rct"], ["riskOfBias", "-1"], ["inconsistency", "0"], ["indirectness", "0"], ["imprecision", "-1"], ["publicationBias", "0"]]);
  const s = grade.suggestCertainty(def, rct);
  assert.equal(s.level, "Low");
  assert.equal(s.clamped, false);
  assert.match(s.path, /RCT 起始 High/);
  assert.match(s.path, /risk of bias\) −1/);
  assert.match(s.path, /Imprecision −1 → Low$/);
  const obs = build([["design", "observational"], ...DOWN.map((k) => [k, "0"]), ["largeEffect", "+1"], ["doseResponse", "0"], ["confounding", "0"]]);
  assert.equal(grade.suggestCertainty(def, obs).level, "Moderate");
});

test("窮舉所有可達組合（設計 × 降級 × 適用時的升級）皆與獨立 oracle 一致", () => {
  let n = 0;
  for (const design of LEGAL.design) {
    for (const downs of product(DOWN.map((k) => LEGAL[k]))) {
      const base = build([["design", design], ...DOWN.map((k, i) => [k, downs[i]])]);
      const upCombos = grade.upgradeGate(def, base).state === "asked" ? [...product(UP.map((k) => LEGAL[k]))] : [null];
      for (const ups of upCombos) {
        const a = ups ? build([["design", design], ...DOWN.map((k, i) => [k, downs[i]]), ...UP.map((k, i) => [k, ups[i]])]) : base;
        const s = grade.suggestCertainty(def, a);
        assert.equal(s.status, "ok");
        assert.equal(s.level, oracle(a), JSON.stringify(a));
        assert.deepEqual(grade.invariantErrors(def, a), []);
        n++;
      }
    }
  }
  // 2 × 216 降級組合；只有 observational 全 0 那 1 組展開成 3×2×2 = 12 組升級
  assert.equal(n, 2 * 216 - 1 + 12);
});

test("完成度：RCT 不計升級欄位；observational 零降級時計入；最終確定性須填", () => {
  const td = { outcome: {}, certainty: U, overrideReason: "" };
  const rct = build([["design", "rct"], ...DOWN.map((k) => [k, "0"])]);
  assert.deepEqual(grade.progress(def, { answers: rct, toolData: td }), { done: 6, total: 7 });
  assert.equal(grade.isComplete(def, { answers: rct, toolData: { ...td, certainty: "High" } }), true);
  const obs = build([["design", "observational"], ...DOWN.map((k) => [k, "0"])]);
  assert.deepEqual(grade.progress(def, { answers: obs, toolData: td }), { done: 6, total: 10 });
  assert.equal(grade.isComplete(def, { answers: obs, toolData: { ...td, certainty: "Low" } }), false);
  assert.deepEqual(grade.progress(def, { answers: build([]), toolData: td }), { done: 0, total: 10 });
});
