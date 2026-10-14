// C1–C4：內容完整性
import { test } from "node:test";
import assert from "node:assert/strict";
import { tools } from "../js/tools/registry.js";
import { referenceErrors, definitionErrors, clone } from "./helpers.js";

// CASP 專用結構檢查；RoB 2 見 rob2-content.test.js
const ready = tools.filter((t) => t.status === "ready" && t.definition.engine === "casp");

for (const tool of ready) {
  test(`${tool.toolId}: definition 雙語與結構完整（C4）`, () => {
    assert.deepEqual(definitionErrors(tool.definition), []);
  });

  for (const mock of tool.mockPapers) {
    test(`${tool.toolId}/${mock.id}: 參考答案完整且引用合法（C1–C3）`, () => {
      const ref = tool.references[mock.id];
      assert.ok(ref, "每篇 mock paper 都必須有參考答案");
      assert.deepEqual(referenceErrors(tool.definition, mock, ref), []);
    });

    test(`${tool.toolId}/${mock.id}: 段落 id 唯一、items 指向存在的題目`, () => {
      const paragraphs = mock.sections.flatMap((s) => s.paragraphs);
      const ids = paragraphs.map((p) => p.id);
      assert.equal(new Set(ids).size, ids.length);
      const itemIds = tool.definition.items.map((i) => i.id);
      for (const p of paragraphs) {
        for (const it of p.items) assert.ok(itemIds.includes(it), `${p.id} 指向未知題目 ${it}`);
        assert.ok(p.en.trim() && p.zh.trim(), `${p.id} 需中英對照`);
      }
    });
  }
}

// 注入反例：確認上面的檢查真的抓得到錯
const tool = ready[0];
const mock = tool.mockPapers[0];
const ref = tool.references[mock.id];

test("C1 反例：引用不存在的段落 → 失敗", () => {
  const bad = clone(ref);
  bad.answers.q1.sources = [{ type: "mock", paragraphId: "no-such-paragraph" }];
  assert.match(referenceErrors(tool.definition, mock, bad).join("\n"), /不存在/);
});

test("C1 反例：引用存在但不在允許集合的段落 → 失敗", () => {
  const bad = clone(ref);
  bad.answers.q3a.sources = [{ type: "mock", paragraphId: "rct-question" }];
  assert.match(referenceErrors(tool.definition, mock, bad).join("\n"), /允許引用集合/);
});

test("C2 反例：缺一題、空理由、占位字、無來源 → 各自失敗", () => {
  const missing = clone(ref);
  delete missing.answers.q5b;
  assert.match(referenceErrors(tool.definition, mock, missing).join("\n"), /q5b: 缺參考答案/);
  for (const text of ["", "   ", "TODO", "N/A", "待補"]) {
    const bad = clone(ref);
    bad.answers.q2.rationale = text;
    assert.match(referenceErrors(tool.definition, mock, bad).join("\n"), /q2: 理由/, `理由「${text}」應被拒`);
  }
  const noSrc = clone(ref);
  noSrc.answers.q2.sources = [];
  assert.match(referenceErrors(tool.definition, mock, noSrc).join("\n"), /q2: 無來源/);
  const badDoc = clone(ref);
  badDoc.answers.q2.sources = [{ type: "doc", citation: "CASP", locator: "" }];
  assert.match(referenceErrors(tool.definition, mock, badDoc).join("\n"), /locator/);
});

test("C2 反例：參考答案違反跳題不變量 → 失敗", () => {
  const bad = clone(ref);
  bad.answers.q9.answer = "N"; // q10 仍為 CT
  assert.match(referenceErrors(tool.definition, mock, bad).join("\n"), /not-applicable/);
});

test("C4 反例：缺繁中或缺官方英文 → 失敗", () => {
  const noZh = clone(tool.definition);
  noZh.items[3].consider[1].zh = "";
  assert.match(definitionErrors(noZh).join("\n"), /consider\[1\]: 缺繁中/);
  const noEn = clone(tool.definition);
  noEn.items[0].question.en = " ";
  assert.match(definitionErrors(noEn).join("\n"), /q1.question: 缺英文/);
});
