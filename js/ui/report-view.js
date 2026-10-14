// 單一 HTML 報告（SPEC P4）：只呈現學員作答，不含參考答案

import { h, mount } from "../core/dom.js";
import { answerText } from "./labels.js";

export function renderReport(root, def, appraisal, progress) {
  const rows = def.items.map((item) =>
    h(
      "tr",
      {},
      h("td", { class: "num" }, item.number),
      h("td", {}, item.question.zh, h("div", { class: "muted" }, item.question.en)),
      h("td", { class: "num" }, answerText(appraisal.answers[item.id])),
      h("td", {}, h("div", { class: "note" }, appraisal.notes[item.id] ?? ""))
    )
  );

  mount(
    root,
    h("h1", {}, def.title.zh),
    h("p", { class: "muted" }, def.title.en),
    h(
      "dl",
      {},
      h("dt", {}, "文獻"), h("dd", {}, appraisal.paperLabel),
      h("dt", {}, "評讀者"), h("dd", {}, appraisal.metadata.reviewerName || "（未填）"),
      h("dt", {}, "評讀日期"), h("dd", {}, appraisal.metadata.appraisalDate || "（未填）"),
      h("dt", {}, "完成度"), h("dd", {}, `${progress.done} / ${progress.total} 題`)
    ),
    h("h2", {}, "逐題作答"),
    h(
      "div",
      { class: "table-wrap" },
      h(
        "table",
        { class: "review-table" },
        h("thead", {}, h("tr", {}, h("th", {}, "題號"), h("th", {}, "題目"), h("th", {}, "作答"), h("th", {}, "筆記"))),
        h("tbody", {}, rows)
      )
    ),
    h("h2", {}, "評讀摘要"),
    def.summaryFields.map((f) => [
      h("p", { class: "block-title" }, `${f.label.zh}（${f.label.en}）`),
      h("p", { class: "summary-text" }, appraisal.toolData.summary[f.id] || "（未填）"),
    ]),
    h("p", { class: "muted", style: "margin-top:32px" }, `${def.source.citation} ${def.source.url}　授權：${def.source.license}。中譯為本專案改作。`)
  );
}
