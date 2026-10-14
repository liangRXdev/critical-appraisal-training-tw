import { test } from "node:test";
import assert from "node:assert/strict";
import { getTool } from "../js/tools/registry.js";
import * as casp from "../js/engines/casp.js";

for (const toolId of ["casp-sr-rct", "casp-sr-obs"]) {
  const def = getTool(toolId).definition;
  const allYes = () => casp.normalizeAnswers(def, Object.fromEntries(def.items.map((i) => [i.id, "Y"])));

  test(`${toolId}: 初始全部 unanswered、未完成`, () => {
    const a = casp.normalizeAnswers(def, casp.emptyAnswers(def));
    assert.ok(Object.values(a).every((v) => v === casp.UNANSWERED));
    assert.equal(casp.isComplete(def, a), false);
    assert.deepEqual(casp.progress(def, a), { done: 0, total: def.items.length });
  });

  test(`${toolId}: 任一必答題留空都不算完成（逐題）`, () => {
    for (const item of def.items) {
      const a = casp.setAnswer(def, allYes(), item.id, casp.UNANSWERED);
      assert.equal(casp.isComplete(def, a), false, `${item.id} 留空卻判定完成`);
    }
    assert.equal(casp.isComplete(def, allYes()), true);
  });

  test(`${toolId}: Q9=N → Q10 自動 not-applicable 且不必作答；Q9 改回 → Q10 回到 unanswered`, () => {
    let a = casp.setAnswer(def, allYes(), "q9", "N");
    assert.equal(a.q10, casp.NOT_APPLICABLE);
    assert.equal(casp.isRequired(def, "q10", a), false);
    assert.equal(casp.isComplete(def, a), true);
    assert.deepEqual(casp.progress(def, a), { done: def.items.length - 1, total: def.items.length - 1 });
    assert.throws(() => casp.setAnswer(def, a, "q10", "Y"), /免答/);
    a = casp.setAnswer(def, a, "q9", "CT");
    assert.equal(a.q10, casp.UNANSWERED);
    assert.equal(casp.isComplete(def, a), false);
  });

  test(`${toolId}: 不合法值、未知題目、學員手選 not-applicable → 拋錯`, () => {
    assert.throws(() => casp.setAnswer(def, allYes(), "q1", "Yes"));
    assert.throws(() => casp.setAnswer(def, allYes(), "q1", casp.NOT_APPLICABLE));
    assert.throws(() => casp.setAnswer(def, allYes(), "q99", "Y"));
  });

  test(`${toolId}: 不變量雙向檢查`, () => {
    const a = allYes();
    assert.deepEqual(casp.invariantErrors(def, a), []);
    assert.equal(casp.invariantErrors(def, { ...a, q9: "N" }).length, 1); // q10 未設 NA
    assert.equal(casp.invariantErrors(def, { ...a, q10: casp.NOT_APPLICABLE }).length, 1); // 無觸發卻 NA
    assert.equal(casp.invariantErrors(def, { ...a, q3a: casp.NOT_APPLICABLE }).length, 1);
  });
}
