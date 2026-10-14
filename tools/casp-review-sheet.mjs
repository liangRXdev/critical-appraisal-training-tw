// 產生 CASP 中譯與參考答案的審定用對照表（SPEC D5：CASP 中譯與參考答案審定）
// 用法：node tools/casp-review-sheet.mjs → review/casp-review.html（已列入 .gitignore；npm start 後可由 /review/casp-review.html 開啟）
// 內容直接讀 js/tools/ 的 definition、mock paper 與 reference，與工具實際顯示的文字一致

import { mkdirSync, writeFileSync } from "node:fs";
import { getTool } from "../js/tools/registry.js";

const TOOLS = ["casp-sr-rct", "casp-sr-obs"];
// 勾選與意見存在瀏覽器 localStorage；重新產生對照表時沿用（改了內容的列由我回報，請重看）
const REVIEW_VERSION = "v1";
const ANSWER = { Y: "Yes", N: "No", CT: "Can’t tell", "not-applicable": "免答" };

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pair = (obj) => (obj ? `<td class="en">${esc(obj.en)}</td><td class="zh">${esc(obj.zh)}</td>` : `<td></td><td></td>`);
const box = (key) => `<td class="ok"><label class="tick"><input type="checkbox" data-k="${esc(key)}"> 可</label><textarea data-k="${esc(key)}" rows="2" placeholder="修改／意見"></textarea></td>`;

function paragraphs(mockPaper) {
  return new Map(mockPaper.sections.flatMap((s) => s.paragraphs.map((p) => [p.id, { ...p, heading: s.heading.zh }])));
}

function sourceText(s, paras) {
  if (s.type === "doc") return `${esc(s.citation)}，${esc(s.locator)}`;
  const p = paras.get(s.paragraphId);
  return p ? `範例〈${esc(p.heading)}〉${esc(s.paragraphId)}` : `段落 ${esc(s.paragraphId)}（不存在）`;
}

function translationTable(def) {
  const rows = [];
  const k = (part) => `${def.toolId}|${part}`;
  rows.push(`<tr class="group"><th colspan="4">標題與說明</th></tr>`);
  rows.push(`<tr><th>標題</th>${pair(def.title)}${box(k("title"))}</tr>`);
  rows.push(`<tr><th>前言</th>${pair(def.preamble)}${box(k("preamble"))}</tr>`);
  for (const o of def.options) rows.push(`<tr><th>選項 ${esc(o.value)}</th>${pair(o.label)}${box(k("option." + o.value))}</tr>`);
  for (const section of def.sections) {
    rows.push(`<tr class="group"><th colspan="4">Section ${esc(section.id)}</th></tr>`);
    rows.push(`<tr><th>區段標題</th>${pair(section.title)}${box(k("section." + section.id + ".title"))}</tr>`);
    if (section.note) rows.push(`<tr><th>區段註記</th>${pair(section.note)}${box(k("section." + section.id + ".note"))}</tr>`);
    for (const item of def.items.filter((i) => i.section === section.id)) {
      if (item.parent) rows.push(`<tr><th>${esc(item.number)} 母題</th>${pair(item.parent)}${box(k(item.id + ".parent"))}</tr>`);
      rows.push(`<tr class="q"><th>${esc(item.number)}</th>${pair(item.question)}${box(k(item.id + ".question"))}</tr>`);
      if (item.considerIntro) rows.push(`<tr><th>${esc(item.number)} 引言</th>${pair(item.considerIntro)}${box(k(item.id + ".considerIntro"))}</tr>`);
      item.consider.forEach((c, i) => rows.push(`<tr><th>${esc(item.number)}.${i + 1}</th>${pair(c)}${box(k(item.id + ".consider." + (i + 1)))}</tr>`));
      if (item.teaching) rows.push(`<tr class="teach"><th>${esc(item.number)} 教學補充</th><td colspan="2">${esc(item.teaching)}</td>${box(k(item.id + ".teaching"))}</tr>`);
    }
  }
  if (def.summaryFields) {
    rows.push(`<tr class="group"><th colspan="4">Appraisal summary</th></tr>`);
    for (const f of def.summaryFields) rows.push(`<tr><th>${esc(f.id)}</th>${pair(f.label)}${box(k("summary." + f.id))}</tr>`);
  }
  return `<table class="tr"><colgroup><col class="c-id"><col><col><col class="c-ok"></colgroup>
    <thead><tr><th>項目</th><th>官方英文</th><th>中譯（待審）</th><th>審定</th></tr></thead><tbody>${rows.join("\n")}</tbody></table>`;
}

function referenceTable(def, mockPaper, ref) {
  const paras = paragraphs(mockPaper);
  const rows = def.items.map((item) => {
    const r = ref.answers[item.id];
    return `<tr><th>${esc(item.number)}</th><td>${esc(item.question.zh)}</td><td class="ans">${esc(ANSWER[r.answer] ?? r.answer)}</td>
      <td>${esc(r.rationale ?? "")}<ul>${(r.sources ?? []).map((s) => `<li>${sourceText(s, paras)}</li>`).join("")}</ul></td>${box(`${def.toolId}|ref.${mockPaper.id}.${item.id}`)}</tr>`;
  });
  const summary = (def.summaryFields ?? []).map(
    (f) => `<tr><th>${esc(f.label.zh)}</th><td colspan="3">${esc(ref.summary?.[f.id] ?? "")}</td>${box(`${def.toolId}|ref.${mockPaper.id}.summary.${f.id}`)}</tr>`
  );
  return `<table class="ref"><colgroup><col class="c-id"><col class="c-q"><col class="c-ans"><col><col class="c-ok"></colgroup>
    <thead><tr><th>題號</th><th>題目</th><th>參考答案</th><th>理由與出處</th><th>審定</th></tr></thead>
    <tbody>${rows.join("\n")}${summary.join("\n")}</tbody></table>`;
}

function paperTable(toolId, mockPaper) {
  const k = (part) => `${toolId}|paper.${mockPaper.id}.${part}`;
  const rows = [`<tr><th>標題</th>${pair(mockPaper.title)}${box(k("title"))}</tr>`];
  for (const s of mockPaper.sections) {
    rows.push(`<tr class="group"><th colspan="4">${esc(s.heading.zh)}／${esc(s.heading.en)}</th></tr>`);
    for (const p of s.paragraphs) rows.push(`<tr><th><code>${esc(p.id)}</code></th>${pair(p)}${box(k(p.id))}</tr>`);
  }
  return `<table class="tr"><colgroup><col class="c-id"><col><col><col class="c-ok"></colgroup>
    <thead><tr><th>段落</th><th>英文（虛構範例原文）</th><th>中譯（待審）</th><th>審定</th></tr></thead><tbody>${rows.join("\n")}</tbody></table>`;
}

const sectionsHtml = TOOLS.map((toolId) => {
  const tool = getTool(toolId);
  const def = tool.definition;
  const papers = tool.mockPapers
    .map((m) => `<h3>二、範例文獻逐段對照：${esc(m.title.zh)}<span class="status">${esc(m.status)}</span></h3>${paperTable(toolId, m)}
      <h3>三、參考答案<span class="status">${esc(tool.references[m.id]?.status ?? "無參考答案")}</span></h3>
      ${tool.references[m.id] ? referenceTable(def, m, tool.references[m.id]) : ""}`)
    .join("");
  return `<section data-tool="${esc(toolId)}"><h2>${esc(def.shortTitle.zh)}（${esc(def.toolVersion)}）<span class="status">中譯：${esc(def.translationStatus)}</span></h2>
    <h3>一、題目中譯逐項對照</h3>${translationTable(def)}
    ${papers}</section>`;
}).join("");

const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CASP 審定對照表</title>
<style>
  :root { --ink: #1e2a3a; --muted: #5b6878; --line: #d9e0e8; --soft: #f3f6f9; --accent: #1f4e79; color-scheme: light; }
  body { margin: 0; background: #fff; color: var(--ink); font: 14px/1.6 "Noto Sans TC", system-ui, sans-serif; }
  main { max-width: 1200px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 40px 0 8px; color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 4px; }
  h3 { font-size: 15px; margin: 24px 0 8px; } h4 { margin: 16px 0 4px; }
  .lead { color: var(--muted); margin: 0 0 8px; }
  .status { margin-left: 10px; font-size: 12px; font-weight: 500; color: #b77900; border: 1px solid currentColor; border-radius: 4px; padding: 0 6px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { border: 1px solid var(--line); padding: 6px 8px; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
  thead th { background: var(--soft); position: sticky; top: 0; }
  tbody th { font-weight: 600; color: var(--muted); font-size: 12.5px; }
  tr.group th { background: var(--accent); color: #fff; font-size: 13px; }
  tr.q td, tr.q th { background: #eef4fa; font-weight: 600; color: var(--ink); }
  tr.teach td { color: var(--muted); font-size: 13px; }
  td.en, p.en { color: #34475c; } td.zh { font-size: 14.5px; }
  .c-id { width: 9%; } .c-ok { width: 12%; } .c-q { width: 24%; } .c-ans { width: 9%; }
  td.ans { font-weight: 700; }
  td.ok { font-size: 13px; color: var(--muted); }
  .tick { display: flex; gap: 6px; align-items: center; cursor: pointer; font-weight: 600; color: var(--ink); padding: 2px 0; }
  .tick input { width: 18px; height: 18px; accent-color: #0072b2; cursor: pointer; }
  td.ok textarea { display: block; width: 100%; box-sizing: border-box; margin-top: 6px; font: inherit; font-size: 13px; padding: 4px 6px; border: 1px solid var(--line); border-radius: 4px; resize: vertical; background: #fff; color: var(--ink); }
  td.ok textarea:focus, .tick input:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  tr.is-ok td, tr.is-ok th { background: #f2f8f2; }
  tr.has-note td.ok textarea { border-color: #c4510a; background: #fff7f0; }
  ul { margin: 6px 0 0; padding-left: 18px; font-size: 12.5px; color: var(--muted); }
  code { font-size: 12px; color: var(--accent); }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; padding: 10px 0; background: #fff; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
  .bar button { font: inherit; padding: 6px 14px; border-radius: 6px; border: 1px solid var(--accent); background: #fff; color: var(--accent); cursor: pointer; }
  .bar button.primary { background: var(--accent); color: #fff; }
  .bar .count { font-weight: 600; } .bar .save { color: var(--muted); font-size: 12.5px; }
  .bar label { display: flex; gap: 6px; align-items: center; cursor: pointer; }
  body.only-open tr.is-ok:not(.has-note) { display: none; }
  thead th { top: 52px; }
  @media (max-width: 700px) { .c-id { width: 14%; } .c-ok { width: 24%; } }
  @media print { @page { size: A4 landscape; margin: 12mm; } main { max-width: none; padding: 0; } .bar { display: none; } thead th { position: static; } h2 { break-before: page; } section:first-of-type h2 { break-before: auto; } tr { break-inside: avoid; } td.ok textarea { border: 0; border-bottom: 1px dotted var(--muted); resize: none; } }
</style></head>
<body><main>
<h1>CASP 中譯與參考答案審定對照表</h1>
<p class="lead">產生日期：${new Date().toISOString().slice(0, 10)}。內容直接取自工具目前的題目定義、範例文獻與參考答案；中譯為 CASP 原文（CC BY-NC-SA 4.0）的改作，教學補充與範例文獻為本專案自寫。</p>
<p class="lead">逐列勾選「可」，或在框內寫修改意見；進度自動存在這個瀏覽器。審完按「匯出審定結果」，把下載的 .md 檔交回即可。</p>
<div class="bar" role="toolbar" aria-label="審定工具列">
  <span class="count" id="count" role="status"></span>
  <label><input type="checkbox" id="only-open"> 只顯示未處理與有意見的列</label>
  <button type="button" class="primary" id="export">匯出審定結果</button>
  <button type="button" id="clear">清除全部勾選與意見</button>
  <span class="save" id="save"></span>
</div>
${sectionsHtml}
</main>
<script>
(() => {
  const KEY = "casp-review:${REVIEW_VERSION}";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { state = {}; }
  const saveEl = document.getElementById("save");
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); saveEl.textContent = "已自動保存"; }
    catch { saveEl.textContent = "無法保存（請記得匯出）"; }
  };
  const boxes = [...document.querySelectorAll('input[type=checkbox][data-k]')];
  const notes = [...document.querySelectorAll('textarea[data-k]')];
  const rowOf = (el) => el.closest("tr");
  const paint = (k) => {
    const s = state[k] || {};
    const cb = boxes.find((b) => b.dataset.k === k), ta = notes.find((t) => t.dataset.k === k);
    const tr = rowOf(cb);
    tr.classList.toggle("is-ok", !!s.ok);
    tr.classList.toggle("has-note", !!(s.note && s.note.trim()));
  };
  const count = () => {
    const done = boxes.filter((b) => state[b.dataset.k]?.ok || state[b.dataset.k]?.note?.trim()).length;
    const withNote = notes.filter((t) => state[t.dataset.k]?.note?.trim()).length;
    document.getElementById("count").textContent = "已處理 " + done + " / " + boxes.length + " 列（其中 " + withNote + " 列有意見）";
  };
  for (const b of boxes) {
    b.checked = !!state[b.dataset.k]?.ok;
    b.addEventListener("change", () => { (state[b.dataset.k] ||= {}).ok = b.checked; paint(b.dataset.k); count(); save(); });
  }
  for (const t of notes) {
    t.value = state[t.dataset.k]?.note || "";
    t.addEventListener("input", () => { (state[t.dataset.k] ||= {}).note = t.value; paint(t.dataset.k); count(); save(); });
  }
  boxes.forEach((b) => paint(b.dataset.k));
  count();
  document.getElementById("only-open").addEventListener("change", (e) => document.body.classList.toggle("only-open", e.target.checked));
  document.getElementById("clear").addEventListener("click", () => {
    if (!confirm("清除所有勾選與意見？此動作無法復原。")) return;
    state = {}; boxes.forEach((b) => { b.checked = false; paint(b.dataset.k); }); notes.forEach((t) => (t.value = "")); count(); save();
  });
  const cellText = (td) => (td ? td.innerText.trim().replace(/\\s*\\n\\s*/g, " ") : "");
  document.getElementById("export").addEventListener("click", () => {
    const lines = ["# CASP 審定結果", "", "- 對照表版本：${REVIEW_VERSION}", "- 匯出時間：" + new Date().toISOString(), "- " + document.getElementById("count").textContent, ""];
    const pending = [];
    for (const b of boxes) {
      const k = b.dataset.k, s = state[k] || {}, tr = rowOf(b), cells = tr.querySelectorAll("td");
      const note = (s.note || "").trim();
      if (!note && s.ok) continue;
      if (!note) { pending.push(k); continue; }
      lines.push("## " + k, "", "- 狀態：" + (s.ok ? "可（附意見）" : "需修改"), "- 原文：" + cellText(cells[0]), "- 目前：" + cellText(cells[1]), "- 意見：" + note.replace(/\\n/g, " / "), "");
    }
    lines.push("## 尚未處理（" + pending.length + " 列）", "", ...pending.map((k) => "- " + k), "");
    const blob = new Blob([lines.join("\\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "casp-review-" + new Date().toISOString().slice(0, 10) + ".md";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
</script>
</body></html>`;

mkdirSync(new URL("../review/", import.meta.url), { recursive: true });
const out = new URL("../review/casp-review.html", import.meta.url);
writeFileSync(out, html);
console.log(`已產生 ${out.pathname.replace(/^\/([A-Z]:)/, "$1")}`);
