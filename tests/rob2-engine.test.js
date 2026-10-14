// A1–A4、A6：RoB 2 引擎對照獨立 oracle（流程圖）
import { test } from "node:test";
import assert from "node:assert/strict";
import { definition } from "../js/tools/rob2/definition.js";
import { tables } from "../js/engines/rob2-tables.js";
import * as rob2 from "../js/engines/rob2.js";
import { oracle } from "./rob2-oracle.js";

const DOMAINS = ["D1", "D2", "D3", "D4", "D5"];
const domainQuestions = (id) => definition.domains.find((d) => d.id === id).questions;

// 列舉某 domain 所有「可達」作答組合：依路由，被跳過的題為 NA，其餘逐一試所有選項
function enumerate(domainId) {
  const qs = domainQuestions(domainId);
  const out = [];
  const walk = (i, answers) => {
    if (i === qs.length) return out.push(answers);
    const q = qs[i];
    if (rob2.askState(q, answers) === "skipped") return walk(i + 1, { ...answers, [q.id]: rob2.NOT_APPLICABLE });
    for (const v of q.options) walk(i + 1, { ...answers, [q.id]: v });
  };
  walk(0, {});
  return out;
}

function rowsOf(domainId) {
  const t = tables[domainId];
  return domainId === "D2" ? [...t.part1, ...t.part2] : t.rows;
}

function mismatches(domainId) {
  let bad = 0;
  for (const answers of enumerate(domainId)) {
    const got = rob2.suggestDomain(definition, domainId, answers);
    if (got.status !== "ok" || got.judgement !== oracle[domainId](answers)) bad++;
  }
  return bad;
}

// A1：全部可達組合與 oracle 一致，且決策表每一列至少被一個可達案例命中（無死列）
for (const d of DOMAINS) {
  test(`A1 ${d}: 所有可達作答組合與流程圖 oracle 一致，且每列皆可達`, () => {
    const hit = new Set();
    const cases = enumerate(d);
    assert.ok(cases.length > 0);
    for (const answers of cases) {
      const got = rob2.suggestDomain(definition, d, answers);
      assert.equal(got.status, "ok", JSON.stringify(answers));
      assert.equal(got.judgement, oracle[d](answers), `${d} ${JSON.stringify(answers)}`);
      got.rowIds.forEach((id) => hit.add(id));
    }
    const dead = rowsOf(d).map((r) => r.id).filter((id) => !hit.has(id));
    assert.deepEqual(dead, [], `不可達的決策表列：${dead}`);
  });
}

test("A1：oracle 不得引用產品決策表或引擎（避免共模錯誤）", async () => {
  const { readFile } = await import("node:fs/promises");
  const src = await readFile(new URL("./rob2-oracle.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /^\s*import\b.*(rob2-tables|engines\/rob2)/m);
  assert.doesNotMatch(src, /\bimport\s*\(/);
});

// A3：逐列 mutation，每一列改成任何其他結果都必須被抓到
for (const d of DOMAINS) {
  test(`A3 ${d}: 決策表每一列的 mutation 都會讓測試失敗`, () => {
    for (const row of rowsOf(d)) {
      const original = row.result;
      for (const alt of rob2.JUDGEMENTS.filter((j) => j !== original)) {
        row.result = alt;
        try {
          assert.ok(mismatches(d) > 0, `${row.id} 改成 ${alt} 卻沒有被偵測`);
        } finally {
          row.result = original;
        }
      }
    }
  });
}

// Y 與 PY、N 與 PN 等價（guidance p.3）
test("Y≡PY、N≡PN：任一題把 Y 換 PY（或 N 換 PN）不改變建議判斷", () => {
  const swap = { Y: "PY", PY: "Y", N: "PN", PN: "N" };
  for (const d of DOMAINS) {
    for (const answers of enumerate(d)) {
      const base = rob2.suggestDomain(definition, d, answers).judgement;
      for (const [q, v] of Object.entries(answers)) {
        if (!swap[v]) continue;
        const alt = rob2.suggestDomain(definition, d, { ...answers, [q]: swap[v] }).judgement;
        assert.equal(alt, base, `${d} ${q} ${v}→${swap[v]}`);
      }
    }
  }
});

// A2：反直覺案例（≥5 筆、≥3 個 domain），每筆附 guidance locator
const counterintuitive = [
  { why: "未盲但沒有因試驗情境而偏離，且 ITT 分析 → Low（Table 6 p.32；Ten tips Tip 7）", d: "D2",
    a: { "2.1": "Y", "2.2": "Y", "2.3": "N", "2.4": "not-applicable", "2.5": "not-applicable", "2.6": "Y", "2.7": "not-applicable" }, want: "Low" },
  { why: "有缺失資料，但敏感度分析顯示結果未受影響 → Low（Table 10 p.47）", d: "D3",
    a: { "3.1": "N", "3.2": "PY", "3.3": "not-applicable", "3.4": "not-applicable" }, want: "Low" },
  { why: "評估者知情但結果客觀（全因死亡）→ Low（Table 12 p.57）", d: "D4",
    a: { "4.1": "N", "4.2": "N", "4.3": "Y", "4.4": "N", "4.5": "not-applicable" }, want: "Low" },
  { why: "只寫「隨機分派」（1.1 NI）但隱匿良好 → Low（Table 4 p.20）", d: "D1",
    a: { "1.1": "NI", "1.2": "Y", "1.3": "N" }, want: "Low" },
  { why: "隱匿資訊不足（1.2 NI）且基線無異常 → Some concerns 而非 High（Table 4 p.20）", d: "D1",
    a: { "1.1": "Y", "1.2": "NI", "1.3": "N" }, want: "Some concerns" },
  { why: "序列非隨機但隱匿良好、基線無異常 → Some concerns（Figure 1 p.20；Table 4 漏列此組合）", d: "D1",
    a: { "1.1": "N", "1.2": "Y", "1.3": "N" }, want: "Some concerns" },
  { why: "沒有 SAP（5.1 NI）但結果不像被挑選 → Some concerns 而非 High（Table 14 p.67；Ten tips Tip 10）", d: "D5",
    a: { "5.1": "NI", "5.2": "N", "5.3": "N" }, want: "Some concerns" },
  { why: "Part 1 正常但做了 per-protocol 分析且影響可能實質 → High（Table 6 p.32；Ten tips Tip 5 常漏 Part 2）", d: "D2",
    a: { "2.1": "N", "2.2": "N", "2.3": "not-applicable", "2.4": "not-applicable", "2.5": "not-applicable", "2.6": "N", "2.7": "Y" }, want: "High" },
];

test("A2：反直覺案例涵蓋 ≥3 個 domain，且引擎與 oracle 皆判定正確", () => {
  assert.ok(counterintuitive.length >= 5);
  assert.ok(new Set(counterintuitive.map((c) => c.d)).size >= 3);
  for (const c of counterintuitive) {
    const answers = rob2.normalizeAnswers(definition, { ...rob2.emptyAnswers(definition), ...c.a });
    assert.equal(rob2.suggestDomain(definition, c.d, answers).judgement, c.want, c.why);
    assert.equal(oracle[c.d](answers), c.want, `oracle：${c.why}`);
  }
});

// A4：overall 矩陣
test("A4：overall 建議矩陣與「多個 Some concerns 只提示不升級」", () => {
  const all = (v) => Object.fromEntries(DOMAINS.map((d) => [d, v]));
  assert.deepEqual(rob2.suggestOverall(all("Low")), { status: "ok", judgement: "Low", considerHigh: false });
  for (const d of DOMAINS) {
    assert.equal(rob2.suggestOverall({ ...all("Low"), [d]: "High" }).judgement, "High", `${d} High`);
    const one = rob2.suggestOverall({ ...all("Low"), [d]: "Some concerns" });
    assert.deepEqual(one, { status: "ok", judgement: "Some concerns", considerHigh: false }, `${d} 單一 SC`);
  }
  for (let k = 2; k <= 5; k++) {
    const j = all("Low");
    DOMAINS.slice(0, k).forEach((d) => (j[d] = "Some concerns"));
    assert.deepEqual(rob2.suggestOverall(j), { status: "ok", judgement: "Some concerns", considerHigh: true }, `${k} 個 SC`);
  }
  assert.equal(rob2.suggestOverall({ ...all("Some concerns"), D3: "High" }).judgement, "High");
  assert.equal(rob2.suggestOverall({ ...all("Low"), D4: "unanswered" }).status, "insufficient");
});

// A6：任何必答位置留空皆「無法建議」；NA 與未作答可區分；補齊後才有建議
test("A6：每個 domain 中每個必答位置單獨留空時，回傳無法建議", () => {
  for (const d of DOMAINS) {
    for (const answers of enumerate(d)) {
      for (const [q, v] of Object.entries(answers)) {
        if (v === rob2.NOT_APPLICABLE) continue;
        const blanked = rob2.normalizeAnswers(definition, { ...rob2.emptyAnswers(definition), ...answers, [q]: rob2.UNANSWERED });
        const got = rob2.suggestDomain(definition, d, blanked);
        assert.equal(got.status, "insufficient", `${d} 留空 ${q}`);
        assert.ok(!("judgement" in got));
      }
    }
  }
});

test("A6：上游未答時下游題為 unanswered（待定），上游答到不觸發時才變 NA；改答後 NA 會解除", () => {
  let a = rob2.normalizeAnswers(definition, rob2.emptyAnswers(definition));
  assert.equal(a["2.3"], rob2.UNANSWERED);
  a = rob2.setAnswer(definition, a, "2.1", "N");
  assert.equal(a["2.3"], rob2.UNANSWERED, "2.2 尚未作答，2.3 仍待定");
  a = rob2.setAnswer(definition, a, "2.2", "PN");
  assert.equal(a["2.3"], rob2.NOT_APPLICABLE);
  assert.equal(a["2.4"], rob2.NOT_APPLICABLE);
  a = rob2.setAnswer(definition, a, "2.2", "Y");
  assert.equal(a["2.3"], rob2.UNANSWERED, "改答後 2.3 重新需要作答");
  assert.throws(() => rob2.setAnswer(definition, rob2.setAnswer(definition, a, "2.2", "N"), "2.3", "Y"), /不需作答/);
});

test("3.2 沒有 No information 選項；不合法答案被拒", () => {
  const a = rob2.setAnswer(definition, rob2.normalizeAnswers(definition, rob2.emptyAnswers(definition)), "3.1", "N");
  assert.throws(() => rob2.setAnswer(definition, a, "3.2", "NI"), /不接受/);
  assert.throws(() => rob2.setAnswer(definition, a, "1.1", "Maybe"), /不接受/);
  const errs = rob2.invariantErrors(definition, { ...a, "3.2": "NI" });
  assert.ok(errs.some((e) => e.path === "answers.3.2" && /不接受 NI/.test(e.message)), JSON.stringify(errs));
});
