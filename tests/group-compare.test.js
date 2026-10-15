// 多組比較：驗收 1（分歧判定）、2（匯入反例）
import { test } from "node:test";
import assert from "node:assert/strict";
import { divergence, admitFiles, buildGroupCompare, defaultGroupName } from "../js/core/group-compare.js";
import { loadFixture, clone } from "./helpers.js";

const U = "unanswered";
const NA = "not-applicable";

function file(name, data) {
  return { name, text: JSON.stringify(data) };
}

// 以 fixture 為底，改評讀者與部分作答，產生一組作答檔
async function group(fixtureName, reviewer, answers = {}, extra = (d) => d) {
  const data = clone(await loadFixture(fixtureName));
  data.metadata.reviewerName = reviewer;
  Object.assign(data.answers, answers);
  return extra(data);
}

// ---------- 驗收 1：分歧判定 ----------

test("1-1 RoB 2：Y 對 PY、N 對 PN 判一致", () => {
  assert.equal(divergence(["Y", "PY"]).status, "agree");
  assert.equal(divergence(["PN", "N", "N", "PN"]).status, "agree");
});

test("1-2 RoB 2：Y 對 NI 判分歧；NI 不與任何值等價", () => {
  assert.equal(divergence(["Y", "NI"]).status, "full");
  assert.equal(divergence(["PY", "Y", "NI"]).status, "partial");
  assert.equal(divergence(["NI", "NI"]).status, "agree");
});

test("1-3 免答算一種答案：一組免答、一組有作答判分歧", () => {
  assert.equal(divergence([NA, "Y"]).status, "full");
  assert.equal(divergence([NA, NA]).status, "agree");
});

test("1-4 只比有作答的組：一組作答、其餘未答判一致並記錄未答組數", () => {
  assert.deepEqual(divergence(["Y", U, U]), { status: "agree", unanswered: 2, distinct: 1 });
  assert.equal(divergence(["Y", "N", U]).status, "full");
  assert.deepEqual(divergence([U, U]), { status: "none", unanswered: 2, distinct: 0 });
});

test("1-5 每組答案都不同判完全分歧；部分相同判部分分歧", () => {
  assert.equal(divergence(["Y", "N", "CT"]).status, "full");
  assert.equal(divergence(["Low", "Some concerns", "High", "Low"]).status, "partial");
  assert.equal(divergence(["Y", "Y", "N", "CT"]).status, "partial");
});

test("1-6 CASP 實檔：Q10 一組免答、一組作答 → 分歧；題序維持原順序", async () => {
  const a = await group("casp-sr-rct.canonical.json", "第一組", { q9: "N", q10: NA });
  const b = await group("casp-sr-rct.canonical.json", "第二組", { q9: "Y", q10: "Y" });
  const r = await admitFiles([file("a.json", a), file("b.json", b)]);
  assert.equal(r.ready, true, JSON.stringify(r.rejected));
  const cmp = buildGroupCompare(r.groups);
  const q10 = cmp.rows.find((x) => x.itemId === "q10");
  assert.equal(q10.status, "full");
  assert.deepEqual(q10.cells.map((c) => c.answer), [NA, "Y"]);
  assert.deepEqual(cmp.rows.map((x) => x.itemId), cmp.definition.items.map((i) => i.id));
  assert.equal(cmp.hasReference, true);
});

test("1-7 RoB 2 實檔：訊號問題與 domain 判斷都列入；Y/PY 視為一致", async () => {
  const a = await group("rob2.canonical.json", "A", { "1.1": "Y" });
  const b = await group("rob2.canonical.json", "B", { "1.1": "PY" });
  const r = await admitFiles([file("a.json", a), file("b.json", b)]);
  const cmp = buildGroupCompare(r.groups);
  assert.equal(cmp.rows.find((x) => x.itemId === "1.1").status, "agree");
  assert.ok(cmp.rows.some((x) => x.kind === "judgement" && x.itemId === "overall"));
});

// ---------- 驗收 2：匯入反例 ----------

test("2-1 不同工具、不同文獻、雜湊不符、重複檔各剔除一份，其餘照常比較", async () => {
  const a = await group("casp-sr-rct.canonical.json", "A");
  const b = await group("casp-sr-rct.canonical.json", "B", { q1: "N" });
  const otherTool = await group("rob2.canonical.json", "C");
  const otherPaper = await group("casp-sr-rct.user-pdf.json", "D");
  const badHash = await group("casp-sr-rct.canonical.json", "E", {}, (d) => ({ ...d, contentHash: "sha256:" + "0".repeat(64) }));
  const dup = { ...clone(a), exportedAt: "2026-10-15T00:00:00.000Z" };
  const r = await admitFiles([file("a.json", a), file("tool.json", otherTool), file("paper.json", otherPaper), file("hash.json", badHash), file("dup.json", dup), file("b.json", b)]);
  assert.deepEqual(r.groups.map((g) => g.fileName), ["a.json", "b.json"]);
  const reason = (n) => r.rejected.find((x) => x.fileName === n)?.reason ?? "";
  assert.match(reason("tool.json"), /工具不同/);
  assert.match(reason("paper.json"), /文獻不同/);
  assert.match(reason("hash.json"), /雜湊不符/);
  assert.match(reason("dup.json"), /重複/);
  assert.equal(r.ready, true);
});

test("2-2 剔除後只剩 1 組 → 不進入比較", async () => {
  const a = await group("grade.canonical.json", "A");
  const r = await admitFiles([file("a.json", a), file("broken.json", { toolId: "grade" }), { name: "x.json", text: "{not json" }]);
  assert.equal(r.groups.length, 1);
  assert.equal(r.ready, false);
  assert.ok(r.rejected.every((x) => /格式錯誤/.test(x.reason)));
});

test("2-3 自己上傳的 PDF：依檔名判定同一篇、需人工確認、沒有參考答案", async () => {
  const groups = [];
  for (const [i, who] of ["甲", "乙", "丙", "丁"].entries()) {
    groups.push(await group("casp-sr-rct.user-pdf.json", who, {}, (d) => ({ ...d, paperRef: `user-pdf:3f1c2a9e-7b4d-4e8a-9c21-5d6e7f8a9b0${i}` })));
  }
  const r = await admitFiles(groups.map((g, i) => file(`${i}.json`, g)));
  assert.equal(r.groups.length, 4, JSON.stringify(r.rejected));
  const cmp = buildGroupCompare(r.groups);
  assert.equal(cmp.needsManualCheck, true);
  assert.equal(cmp.hasReference, false);

  const renamed = await group("casp-sr-rct.user-pdf.json", "戊", {}, (d) => ({ ...d, paperLabel: "another.pdf" }));
  const r2 = await admitFiles([file("0.json", groups[0]), file("other.json", renamed)]);
  assert.match(r2.rejected[0].reason, /文獻不同/);
});

test("2-4 範例文獻與同名 PDF 不可混比；超過 4 組剔除第 5 份", async () => {
  const mock = await group("casp-sr-rct.canonical.json", "A");
  const pdf = await group("casp-sr-rct.user-pdf.json", "B");
  const r = await admitFiles([file("m.json", mock), file("p.json", pdf)]);
  assert.match(r.rejected[0].reason, /文獻不同/);

  const five = [];
  for (const who of ["1", "2", "3", "4", "5"]) five.push(file(`${who}.json`, await group("casp-sr-rct.canonical.json", who)));
  const r5 = await admitFiles(five);
  assert.equal(r5.groups.length, 4);
  assert.match(r5.rejected[0].reason, /上限/);
});

test("未完成的組照樣比較，並回報各組完成度", async () => {
  const a = await group("casp-sr-rct.canonical.json", "A");
  const b = await group("casp-sr-rct.canonical.json", "B", { q1: U, q2: U });
  const r = await admitFiles([file("a.json", a), file("b.json", b)]);
  const cmp = buildGroupCompare(r.groups);
  assert.equal(cmp.progress[1].done, cmp.progress[0].done - 2);
  assert.equal(cmp.rows.find((x) => x.itemId === "q1").unanswered, 1);
});

test("組名預設用評讀者，沒填用檔名", () => {
  assert.equal(defaultGroupName("g1.json", { metadata: { reviewerName: "  第三組 " } }), "第三組");
  assert.equal(defaultGroupName("group-2.JSON", { metadata: { reviewerName: "" } }), "group-2");
});

// ---------- 示範檔（examples/group-compare）：題目改版導致雜湊不符時會在這裡失敗，需重跑 tools/make-group-demos.mjs ----------

import { readdir, readFile } from "node:fs/promises";
import { referenceFor } from "../js/core/compare.js";

for (const toolId of ["casp-sr-rct", "casp-sr-obs", "rob2", "grade"]) {
  test(`示範檔 ${toolId}：4 組皆可匯入、有分歧與一致題、筆記不含參考理由`, async () => {
    const dir = new URL(`../examples/group-compare/${toolId}/`, import.meta.url);
    const names = (await readdir(dir)).filter((n) => n.endsWith(".json")).sort();
    const files = await Promise.all(names.map(async (name) => ({ name, text: await readFile(new URL(name, dir), "utf8") })));
    const r = await admitFiles(files);
    assert.equal(r.groups.length, 4, JSON.stringify(r.rejected));
    const cmp = buildGroupCompare(r.groups);
    assert.ok(cmp.totals.full > 0 && cmp.totals.partial > 0 && cmp.totals.agree > 0, JSON.stringify(cmp.totals));
    assert.ok(cmp.rows.some((x) => x.unanswered > 0), "應有未答示範");
    const rationales = cmp.rows.map((row) => referenceFor(cmp.definition, cmp.paper.reference, row).rationale).filter(Boolean);
    for (const row of cmp.rows) for (const c of row.cells) for (const rat of rationales) assert.ok(!c.note || !rat.includes(c.note), `筆記與參考理由重複：${c.note}`);
  });
}
