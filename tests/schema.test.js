// B1–B3：匯出／匯入
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAppraisal, serializeAppraisal, createAppraisal } from "../js/core/appraisal.js";
import { buildReview } from "../js/core/compare.js";
import { getTool, resolvePaper } from "../js/tools/registry.js";
import { loadFixture, clone } from "./helpers.js";

const FIXTURES = ["casp-sr-rct.canonical.json", "casp-sr-obs.canonical.json", "casp-sr-rct.user-pdf.json", "rob2.canonical.json", "grade.canonical.json"];

async function rejects(data, pathPattern) {
  const text = typeof data === "string" ? data : JSON.stringify(data);
  const r = await parseAppraisal(text);
  assert.equal(r.ok, false, `應被拒絕：${pathPattern}`);
  if (pathPattern) assert.ok(r.errors.some((e) => pathPattern.test(e.path)), `錯誤應指向 ${pathPattern}，實際：${JSON.stringify(r.errors)}`);
  return r;
}

// B1
for (const name of FIXTURES) {
  test(`B1 ${name}: 匯入等於 fixture、再匯出仍等於 fixture`, async () => {
    const fixture = await loadFixture(name);
    const r = await parseAppraisal(JSON.stringify(fixture));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.value, fixture);
    const again = JSON.parse(serializeAppraisal(r.value));
    delete again.exportedAt;
    const expected = clone(fixture);
    delete expected.exportedAt;
    assert.deepEqual(again, expected);
  });
}

test("B1: 新建評讀即可通過驗證（mock 與 user-pdf）", async () => {
  const tool = getTool("casp-sr-obs");
  for (const ref of ["mock:ppi-cap-risk", "user-pdf:0b8f6c1e-2d3a-4f5b-8c7d-9e0f1a2b3c4d"]) {
    const s = await createAppraisal(tool, ref, "label");
    const r = await parseAppraisal(serializeAppraisal(s));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  }
});

// B2：逐欄位反例（缺失、錯型、null、非法值）
const TOP_WRONG = {
  schemaVersion: "1", toolId: 42, toolVersion: 1, contentHash: 123, paperRef: [], paperLabel: 5,
  metadata: "x", answers: [], notes: "x", considerChecks: 3, toolData: [], exportedAt: 0,
};

test("B2: 每個頂層必填欄位缺失 / 錯型 / null 都被拒", async () => {
  const base = await loadFixture(FIXTURES[0]);
  for (const key of Object.keys(TOP_WRONG)) {
    const missing = clone(base); delete missing[key];
    await rejects(missing, new RegExp(`^${key}$`));
    await rejects({ ...clone(base), [key]: TOP_WRONG[key] }, new RegExp(`^${key}`));
    await rejects({ ...clone(base), [key]: null }, new RegExp(`^${key}`));
  }
});

test("B2: 巢狀欄位缺失、錯型與非法值被拒", async () => {
  const base = await loadFixture(FIXTURES[0]);
  const cases = [
    [(d) => delete d.metadata.reviewerName, /^metadata\.reviewerName$/],
    [(d) => (d.metadata.reviewerName = 3), /^metadata\.reviewerName$/],
    [(d) => (d.metadata.reviewerName = "x".repeat(101)), /^metadata\.reviewerName$/],
    [(d) => (d.metadata.appraisalDate = "2026-02-30"), /^metadata\.appraisalDate$/],
    [(d) => (d.metadata.appraisalDate = "14/10/2026"), /^metadata\.appraisalDate$/],
    [(d) => (d.metadata.extra = 1), /^metadata\.extra$/],
    [(d) => delete d.answers.q5b, /^answers\.q5b$/],
    [(d) => (d.answers.q1 = "Yes"), /^answers\.q1$/],
    [(d) => (d.answers.q1 = null), /^answers\.q1$/],
    [(d) => (d.answers.q1 = "not-applicable"), /^answers\.q1$/],
    [(d) => (d.answers.q99 = "Y"), /^answers\.q99$/],
    [(d) => (d.answers.q9 = "N"), /^answers\.q10$/],
    [(d) => (d.notes.q99 = "x"), /^notes\.q99$/],
    [(d) => (d.notes.q1 = 1), /^notes\.q1$/],
    [(d) => (d.notes.q1 = "x".repeat(4001)), /^notes\.q1$/],
    [(d) => (d.considerChecks.q1 = [0, 0]), /^considerChecks\.q1$/],
    [(d) => (d.considerChecks.q1 = [99]), /^considerChecks\.q1$/],
    [(d) => (d.considerChecks.q1 = [-1]), /^considerChecks\.q1$/],
    [(d) => (d.considerChecks.q1 = "0"), /^considerChecks\.q1$/],
    [(d) => (d.considerChecks.q99 = [0]), /^considerChecks\.q99$/],
    [(d) => delete d.toolData.summary, /^toolData\.summary$/],
    [(d) => delete d.toolData.summary.unknowns, /^toolData\.summary\.unknowns$/],
    [(d) => (d.toolData.summary.positive = null), /^toolData\.summary\.positive$/],
    [(d) => (d.toolData.summary.extra = ""), /^toolData\.summary\.extra$/],
    [(d) => (d.toolData.extra = {}), /^toolData\.extra$/],
    [(d) => (d.paperLabel = ""), /^paperLabel$/],
    [(d) => (d.exportedAt = "yesterday"), /^exportedAt$/],
  ];
  for (const [mutate, path] of cases) {
    const d = clone(base);
    mutate(d);
    await rejects(d, path);
  }
});

test("B2: 指名反例 —— 非 JSON、未知工具、版本、雜湊、較新 schema、未知 paperRef、未知頂層欄位", async () => {
  const base = await loadFixture(FIXTURES[0]);
  const r = await rejects("{ not json", null);
  assert.match(r.errors[0].message, /不是有效的 JSON/);
  await rejects("[]", /^$/);
  await rejects({ ...clone(base), toolId: "grade" }, /^toolVersion$/); // 換掉 toolId 冒充其他工具
  await rejects({ ...clone(base), toolId: "no-such-tool" }, /^toolId$/);
  await rejects({ ...clone(base), toolVersion: "casp-sr-rct@2018" }, /^toolVersion$/);
  await rejects({ ...clone(base), contentHash: "sha256:" + "0".repeat(64) }, /^contentHash$/);
  await rejects({ ...clone(base), contentHash: "md5:abc" }, /^contentHash$/);
  await rejects({ ...clone(base), schemaVersion: 2 }, /^schemaVersion$/);
  await rejects({ ...clone(base), schemaVersion: 0 }, /^schemaVersion$/);
  await rejects({ ...clone(base), paperRef: "mock:no-such-paper" }, /^paperRef$/);
  await rejects({ ...clone(base), paperRef: "mock:ppi-cap-risk" }, /^paperRef$/); // 屬於另一工具
  await rejects({ ...clone(base), paperRef: "user-pdf:not-a-uuid" }, /^paperRef$/);
  await rejects({ ...clone(base), surprise: true }, /^surprise$/);
});

test("B2: 內容被改動（同版本）→ 雜湊不符被拒", async () => {
  const base = await loadFixture(FIXTURES[0]);
  const tool = getTool("casp-sr-rct");
  const original = tool.references["melatonin-icu-delirium"].answers.q1.answer;
  try {
    tool.references["melatonin-icu-delirium"].answers.q1.answer = "N";
    await rejects(clone(base), /^contentHash$/);
  } finally {
    tool.references["melatonin-icu-delirium"].answers.q1.answer = original;
  }
});

// B3
test("B3: user-pdf 作答只顯示作答，不配對 mock（即使 paperLabel 與 mock id 同名）", async () => {
  const fixture = await loadFixture("casp-sr-rct.user-pdf.json");
  const r = await parseAppraisal(JSON.stringify(fixture));
  assert.equal(r.ok, true);
  assert.equal(r.paper.kind, "user-pdf");
  const review = buildReview(r.value, r.tool.definition, r.paper);
  assert.equal(review.mode, "answers-only");
  assert.equal(review.rows.length, r.tool.definition.items.length);
  for (const row of review.rows) {
    assert.equal(row.student, fixture.answers[row.itemId]);
    assert.equal(row.note, fixture.notes[row.itemId] ?? "");
    assert.ok(!("reference" in row) && !("match" in row));
  }
  assert.ok(!("totals" in review) && !("referenceSummary" in review));
});

test("比對：mock 作答逐題分類 same / different / unanswered / skipped", async () => {
  const fixture = await loadFixture("casp-sr-obs.canonical.json");
  const r = await parseAppraisal(JSON.stringify(fixture));
  const review = buildReview(r.value, r.tool.definition, resolvePaper(r.tool, fixture.paperRef));
  assert.equal(review.mode, "compare");
  const byId = Object.fromEntries(review.rows.map((x) => [x.itemId, x]));
  assert.equal(byId.q3b.match, "same"); // N vs N
  assert.equal(byId.q4.match, "different"); // CT vs Y
  assert.equal(byId.q10.match, "different"); // 學員 Q9=N 跳過，參考答案為 CT
  const t = review.totals;
  assert.equal(t.same + t.different + t.unanswered + t.skipped, review.rows.length);
});

// RoB 2：B2 專屬反例與比對
test("B2 rob2：答案值、路由不變量、toolData 結構的反例皆被拒", async () => {
  const base = await loadFixture("rob2.canonical.json");
  const cases = [
    [(d) => (d.answers["1.1"] = "CT"), /^answers\.1\.1$/],
    [(d) => (d.answers["3.2"] = "NI"), /^answers\.3\.2$/],
    [(d) => (d.answers["2.5"] = "Y"), /^answers\.2\.5$/],
    [(d) => (d.answers["2.7"] = "not-applicable"), /^answers\.2\.7$/],
    [(d) => delete d.answers["5.3"], /^answers\.5\.3$/],
    [(d) => (d.toolData.judgements.D1 = "Moderate"), /^toolData\.judgements\.D1$/],
    [(d) => delete d.toolData.judgements.overall, /^toolData\.judgements\.overall$/],
    [(d) => (d.toolData.overrideReasons.D2 = 5), /^toolData\.overrideReasons\.D2$/],
    [(d) => (d.toolData.preliminary.outcome = "x".repeat(501)), /^toolData\.preliminary\.outcome$/],
    [(d) => (d.toolData.preliminary.effect = "adhering"), /^toolData\.preliminary\.effect$/],
    [(d) => delete d.toolData.preliminary, /^toolData\.preliminary$/],
    [(d) => (d.considerChecks = { "1.1": [0] }), /^considerChecks$/],
    [(d) => (d.notes.D9 = "x"), /^notes\.D9$/],
    [(d) => (d.toolData.summary = {}), /^toolData\.summary$/],
  ];
  for (const [mutate, path] of cases) {
    const d = clone(base);
    mutate(d);
    await rejects(d, path);
  }
});

test("rob2 比對：Y≡PY、N≡PN 標為意涵相同；NA 對 NA 為皆免答；判斷列逐一比對", async () => {
  const fixture = await loadFixture("rob2.canonical.json");
  const r = await parseAppraisal(JSON.stringify(fixture));
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  const review = buildReview(r.value, r.tool.definition, r.paper);
  const by = Object.fromEntries(review.rows.map((x) => [x.itemId, x]));
  assert.equal(by["1.1"].match, "same");
  assert.equal(by["1.2"].match, "equivalent"); // PY vs Y
  assert.equal(by["2.3"].match, "different"); // Y vs PN
  assert.equal(by["2.5"].match, "skipped");
  assert.equal(by["2.7"].match, "different"); // 學員 PN，參考 NA
  assert.equal(by["3.4"].match, "unanswered");
  assert.equal(by["D2"].match, "different");
  assert.equal(by["D4"].match, "same");
  assert.equal(by["overall"].match, "unanswered");
  const t = review.totals;
  assert.equal(t.same + t.equivalent + t.different + t.unanswered + t.skipped, review.rows.length);
});

// GRADE：B2 專屬反例與比對
test("B2 grade：合法幅度、升級不變量、toolData 結構的反例皆被拒", async () => {
  const base = await loadFixture("grade.canonical.json");
  const cases = [
    [(d) => (d.answers.design = "mixed"), /^answers\.design$/],
    [(d) => (d.answers.riskOfBias = "-3"), /^answers\.riskOfBias$/],
    [(d) => (d.answers.publicationBias = "-2"), /^answers\.publicationBias$/], // D-G1
    [(d) => (d.answers.imprecision = "-4"), /^answers\.imprecision$/], // D-G2
    [(d) => (d.answers.inconsistency = -1), /^answers\.inconsistency$/], // 數字不是合法值
    [(d) => (d.answers.indirectness = "+1"), /^answers\.indirectness$/],
    [(d) => (d.answers.largeEffect = "+1"), /^answers\.largeEffect$/], // RCT 不升級
    [(d) => (d.answers.design = "not-applicable"), /^answers\.design$/],
    [(d) => delete d.answers.confounding, /^answers\.confounding$/],
    [(d) => (d.answers.extra = "0"), /^answers\.extra$/],
    [(d) => (d.toolData.certainty = "Some concerns"), /^toolData\.certainty$/],
    [(d) => (d.toolData.certainty = "high"), /^toolData\.certainty$/],
    [(d) => (d.toolData.overrideReason = null), /^toolData\.overrideReason$/],
    [(d) => delete d.toolData.outcome.effect, /^toolData\.outcome\.effect$/],
    [(d) => (d.toolData.outcome.outcome = "x".repeat(501)), /^toolData\.outcome\.outcome$/],
    [(d) => (d.toolData.rctUnlock = true), /^toolData\.rctUnlock$/],
    [(d) => (d.considerChecks = { design: [0] }), /^considerChecks$/],
    [(d) => (d.notes.D1 = "x"), /^notes\.D1$/],
  ];
  for (const [mutate, path] of cases) {
    const d = clone(base);
    mutate(d);
    await rejects(d, path);
  }
});

test("B2 grade：observational 有降級時升級欄位必須免答；零降級時升級欄位不得免答", async () => {
  const base = await loadFixture("grade.canonical.json");
  const obs = (answers) => ({ ...clone(base), answers: { ...base.answers, design: "observational", ...answers } });
  await rejects(obs({ largeEffect: "+2" }), /^answers\.largeEffect$/);
  const zero = { riskOfBias: "0", inconsistency: "0", indirectness: "0", imprecision: "0", publicationBias: "0" };
  await rejects(obs({ ...zero }), /^answers\.(largeEffect|doseResponse|confounding)$/);
  const ok = await parseAppraisal(JSON.stringify(obs({ ...zero, largeEffect: "+2", doseResponse: "0", confounding: "unanswered" })));
  assert.equal(ok.ok, true, JSON.stringify(ok.errors));
});

test("grade 比對：逐因素與確定性列比對；RCT 升級列為皆免答", async () => {
  const fixture = await loadFixture("grade.canonical.json");
  const r = await parseAppraisal(JSON.stringify(fixture));
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  const review = buildReview(r.value, r.tool.definition, r.paper);
  const by = Object.fromEntries(review.rows.map((x) => [x.itemId, x]));
  assert.equal(by.design.match, "same");
  assert.equal(by.riskOfBias.match, "different"); // -2 vs -1
  assert.equal(by.inconsistency.match, "same");
  assert.equal(by.indirectness.match, "unanswered");
  assert.equal(by.imprecision.match, "same");
  assert.equal(by.publicationBias.match, "different"); // -1 vs 0
  for (const id of ["largeEffect", "doseResponse", "confounding"]) assert.equal(by[id].match, "skipped");
  assert.equal(by.certainty.match, "same");
  assert.equal(by.certainty.kind, "judgement");
  const t = review.totals;
  assert.equal(t.equivalent, 0); // GRADE 沒有 Y≡PY 這類等價
  assert.equal(t.same + t.different + t.unanswered + t.skipped, review.rows.length);
});

test("B1 grade：新建評讀即可通過驗證；user-pdf 只回傳作答", async () => {
  const tool = getTool("grade");
  for (const ref of ["mock:iv-iron-fatigue-sr", "user-pdf:0b8f6c1e-2d3a-4f5b-8c7d-9e0f1a2b3c4d"]) {
    const s = await createAppraisal(tool, ref, "label");
    const r = await parseAppraisal(serializeAppraisal(s));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    const review = buildReview(r.value, tool.definition, resolvePaper(tool, ref));
    assert.equal(review.mode, ref.startsWith("mock:") ? "compare" : "answers-only");
  }
});
