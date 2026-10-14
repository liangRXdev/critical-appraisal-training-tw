// 單一 HTML 報告（SPEC P4）：只呈現學員作答，不含參考答案

import { h, mount } from "../core/dom.js";
import { answerText } from "./labels.js";
import * as rob2 from "../engines/rob2.js";

export function renderReport(root, def, appraisal, progress) {
  if (def.engine === "rob2") return renderRob2Report(root, def, appraisal, progress);
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
        { class: "review-table report-table" },
        h(
          "colgroup",
          {},
          h("col", { class: "report-table__num" }),
          h("col", { class: "report-table__question" }),
          h("col", { class: "report-table__answer" }),
          h("col", { class: "report-table__note" })
        ),
        h(
          "thead",
          {},
          // 報告資訊列：只在列印時顯示，與欄位名稱一起在每頁頂端重複
          h(
            "tr",
            { class: "print-only" },
            h(
              "th",
              { colspan: "4", class: "print-caption" },
              `${def.shortTitle.zh}｜${appraisal.paperLabel}｜評讀者：${appraisal.metadata.reviewerName || "（未填）"}｜${appraisal.metadata.appraisalDate || "日期未填"}`
            )
          ),
          h("tr", {}, h("th", {}, "題號"), h("th", {}, "題目"), h("th", {}, "作答"), h("th", {}, "筆記"))
        ),
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

// 報告表格共用：表頭含列印用資訊列（每頁重複）＋固定欄寬
function reportTable(caption, headers, rows) {
  return h(
    "div",
    { class: "table-wrap" },
    h(
      "table",
      { class: "review-table report-table" },
      h("colgroup", {}, ["num", "question", "answer", "note"].map((c) => h("col", { class: `report-table__${c}` }))),
      h(
        "thead",
        {},
        h("tr", { class: "print-only" }, h("th", { colspan: "4", class: "print-caption" }, caption)),
        h("tr", {}, headers.map((x) => h("th", {}, x)))
      ),
      h("tbody", {}, rows)
    )
  );
}

function renderRob2Report(root, def, appraisal, progress) {
  const td = appraisal.toolData;
  const caption = `${def.shortTitle.zh}｜${appraisal.paperLabel}｜評讀者：${appraisal.metadata.reviewerName || "（未填）"}｜${appraisal.metadata.appraisalDate || "日期未填"}`;
  const rows = [];
  for (const domain of def.domains) {
    for (const q of domain.questions) {
      rows.push(
        h(
          "tr",
          {},
          h("td", { class: "num" }, q.id),
          h("td", {}, q.text),
          h("td", { class: "num" }, answerText(appraisal.answers[q.id])),
          h("td", {}, h("div", { class: "note" }, appraisal.notes[q.id] ?? ""))
        )
      );
    }
    const s = rob2.suggestDomain(def, domain.id, appraisal.answers);
    rows.push(
      h(
        "tr",
        { class: "report-judgement" },
        h("td", { class: "num" }, domain.id),
        h("td", {}, h("strong", {}, domain.title.en), h("div", { class: "muted" }, s.status === "ok" ? `演算法建議：${s.judgement}（${s.path}）` : "演算法建議：資料不足")),
        h("td", { class: "num" }, h("strong", {}, answerText(td.judgements[domain.id]))),
        h("td", {}, h("div", { class: "note" }, [appraisal.notes[domain.id], td.overrideReasons[domain.id] && `推翻理由：${td.overrideReasons[domain.id]}`].filter(Boolean).join("\n")))
      )
    );
  }
  const o = rob2.suggestOverall(td.judgements);
  rows.push(
    h(
      "tr",
      { class: "report-judgement" },
      h("td", { class: "num" }, "整體"),
      h("td", {}, h("strong", {}, "Overall risk of bias"), h("div", { class: "muted" }, o.status === "ok" ? `依 Table 1 建議：${o.judgement}${o.considerHigh ? "（多個 Some concerns，可考慮 High）" : ""}` : "建議：資料不足")),
      h("td", { class: "num" }, h("strong", {}, answerText(td.judgements.overall))),
      h("td", {}, h("div", { class: "note" }, [appraisal.notes.overall, td.overrideReasons.overall && `理由：${td.overrideReasons.overall}`].filter(Boolean).join("\n")))
    )
  );

  mount(
    root,
    h("h1", {}, def.shortTitle.zh),
    h("p", { class: "muted" }, def.title.en),
    h(
      "dl",
      {},
      h("dt", {}, "文獻"), h("dd", {}, appraisal.paperLabel),
      h("dt", {}, "評讀者"), h("dd", {}, appraisal.metadata.reviewerName || "（未填）"),
      h("dt", {}, "評讀日期"), h("dd", {}, appraisal.metadata.appraisalDate || "（未填）"),
      h("dt", {}, "完成度"), h("dd", {}, `${progress.done} / ${progress.total} 項`),
      def.preliminary.fields.map((f) => [h("dt", {}, f.label.en), h("dd", {}, td.preliminary[f.id] || "（未填）")]),
      h("dt", {}, "Effect of interest"), h("dd", {}, "Effect of assignment to intervention")
    ),
    h("h2", {}, "逐題作答與判斷"),
    reportTable(caption, ["題號", "Signalling question／Domain", "作答／判斷", "筆記"], rows),
    h("p", { class: "muted", style: "margin-top:32px" }, `${def.source.citation} ${def.source.url}　授權：${def.source.license}（題目為官方英文原文，未翻譯）。`)
  );
}
