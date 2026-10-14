// 指導者模式：匯入學員作答檔 → 驗證 → 與參考答案逐題並排

import { h, mount } from "../core/dom.js";
import { parseAppraisal } from "../core/appraisal.js";
import { buildReview } from "../core/compare.js";
import { answerText, MATCH_TEXT, sourceText } from "./labels.js";

export function renderInstructor(root) {
  const result = h("div", { "aria-live": "polite" });
  const input = h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: (e) => handleFile(e.target.files[0]) });
  const zone = h(
    "div",
    {
      class: "dropzone",
      ondragover: (e) => { e.preventDefault(); zone.classList.add("is-over"); },
      ondragleave: () => zone.classList.remove("is-over"),
      ondrop: (e) => { e.preventDefault(); zone.classList.remove("is-over"); handleFile(e.dataTransfer.files[0]); },
    },
    h("p", {}, "把學員匯出的 .json 作答檔拖到這裡"),
    h("label", { class: "btn btn--primary" }, "選擇作答檔", input)
  );

  async function handleFile(file) {
    if (!file) return;
    let text;
    try {
      text = await file.text();
    } catch (err) {
      return mount(result, errorBox(file.name, [{ path: "", message: `無法讀取檔案：${err.message}` }]));
    }
    const parsed = await parseAppraisal(text);
    if (!parsed.ok) return mount(result, errorBox(file.name, parsed.errors));
    const review = buildReview(parsed.value, parsed.tool.definition, parsed.paper);
    mount(result, reviewView(file.name, parsed, review));
  }

  mount(
    root,
    h("h1", {}, "指導者比對"),
    h("p", { class: "instructor__lead" }, "匯入學員的作答檔。若作答的是範例文獻，會與參考答案逐題並排，紅底標出不同處；若是學員自己上傳的 PDF，只顯示作答內容。"),
    zone,
    result
  );
}

function errorBox(fileName, errors) {
  return h(
    "div",
    { class: "banner banner--error", role: "alert" },
    h(
      "div",
      { class: "banner__text" },
      h("strong", {}, `無法比對「${fileName}」`),
      h("ul", {}, errors.slice(0, 20).map((e) => h("li", {}, e.path ? `${e.path}：${e.message}` : e.message))),
      errors.length > 20 ? h("p", {}, `另有 ${errors.length - 20} 項錯誤未列出。`) : null
    )
  );
}

function reviewView(fileName, parsed, review) {
  const { value, tool, paper } = parsed;
  const def = tool.definition;
  const compare = review.mode === "compare";

  const head = h(
    "div",
    { class: "report", style: "padding:0" },
    h("dl", {},
    h("dt", {}, "檔案"), h("dd", {}, fileName),
    h("dt", {}, "工具"), h("dd", {}, `${def.shortTitle.zh}（${def.toolVersion}）`),
    h("dt", {}, "文獻"), h("dd", {}, compare ? paper.mockPaper.title.zh : `${value.paperLabel}（學員上傳）`),
    h("dt", {}, "評讀者"), h("dd", {}, value.metadata.reviewerName || "（未填）"),
    h("dt", {}, "評讀日期"), h("dd", {}, value.metadata.appraisalDate || "（未填）"))
  );

  const tally = compare
    ? h(
        "div",
        { class: "tally", role: "status" },
        ["same", "different", "unanswered", "skipped"].map((k) => h("span", {}, h("strong", {}, review.totals[k]), ` ${MATCH_TEXT[k]}`)),
        review.referenceStatus === "draft" ? h("span", { class: "draft-tag" }, "參考答案為草稿，待審定") : null
      )
    : h("p", { class: "banner banner--info" }, "這份作答對應學員自行上傳的 PDF，沒有參考答案可比對。");

  const header = ["題號", "題目", "學員", ...(compare ? ["參考答案", "比對"] : []), "學員筆記", ...(compare ? ["參考理由與出處"] : [])];
  const rows = review.rows.map((row) =>
    h(
      "tr",
      { dataset: { match: row.match ?? "" } },
      h("td", { class: "num" }, row.number),
      h("td", {}, row.question.zh),
      h("td", { class: "num student" }, answerText(row.student)),
      compare ? h("td", { class: "num" }, answerText(row.reference)) : null,
      compare ? h("td", { class: "num" }, MATCH_TEXT[row.match]) : null,
      h("td", {}, h("div", { class: "note" }, row.note)),
      compare
        ? h("td", {}, row.rationale, h("ul", { class: "redpen__sources" }, row.sources.map((s) => h("li", {}, sourceText(s, paper.mockPaper)))))
        : null
    )
  );

  const summary = def.summaryFields.map((f) =>
    h(
      "tr",
      {},
      h("td", {}, f.label.zh),
      h("td", {}, h("div", { class: "note" }, value.toolData.summary[f.id] || "（未填）")),
      compare ? h("td", {}, review.referenceSummary[f.id]) : null
    )
  );

  return h(
    "div",
    { style: "display:grid;gap:16px" },
    head,
    tally,
    h(
      "div",
      { class: "table-wrap" },
      h("table", { class: "review-table" }, h("thead", {}, h("tr", {}, header.map((x) => h("th", {}, x)))), h("tbody", {}, rows))
    ),
    h("h2", { style: "font-size:16px;margin:8px 0 0" }, "評讀摘要"),
    h(
      "div",
      { class: "table-wrap" },
      h(
        "table",
        { class: "review-table" },
        h("thead", {}, h("tr", {}, h("th", {}, "欄位"), h("th", {}, "學員"), compare ? h("th", {}, "參考") : null)),
        h("tbody", {}, summary)
      )
    )
  );
}
