// 右欄：題目導覽、逐題作答、完成頁（摘要 + 參考答案解鎖）

import { h, mount } from "../core/dom.js";
import { CASP_VALUES, UNANSWERED, isRequired } from "../engines/casp.js";
import { answerText, MATCH_TEXT, sourceText } from "./labels.js";

function itemNav(def, answers, index, review, onGo) {
  const matchOf = (id) => review?.rows.find((r) => r.itemId === id)?.match;
  const sections = def.sections.map((section) => {
    const items = def.items.map((item, i) => ({ item, i })).filter(({ item }) => item.section === section.id);
    if (!items.length) return null;
    return h(
      "div",
      { class: "item-nav__section" },
      h("span", { class: "item-nav__label", title: section.title.zh }, section.id === "Z" ? "結" : section.id),
      items.map(({ item, i }) =>
        h(
          "button",
          {
            type: "button",
            class: "chip",
            "aria-current": i === index ? "step" : false,
            "aria-label": `第 ${item.number} 題，${answerText(answers[item.id])}`,
            dataset: { answer: answers[item.id], match: matchOf(item.id) ?? "" },
            onclick: () => onGo(i),
          },
          item.number
        )
      )
    );
  });
  const finishBtn = h(
    "div",
    { class: "item-nav__section" },
    h("span", { class: "item-nav__label" }, ""),
    h("button", { type: "button", class: "chip", "aria-current": index === def.items.length ? "step" : false, onclick: () => onGo(def.items.length) }, "摘要與對照")
  );
  return h("nav", { class: "item-nav", "aria-label": "題目導覽" }, sections, finishBtn);
}

function redpenBlock(row, mockPaper, status) {
  const same = row.match === "same" || row.match === "skipped";
  return h(
    "section",
    { class: `redpen ${same ? "redpen--same" : ""}`, "aria-label": "參考答案" },
    h(
      "div",
      { class: "redpen__head" },
      h("span", {}, `參考答案：${answerText(row.reference)}`),
      h("span", { class: "redpen__verdict" }, `你的答案：${answerText(row.student)}（${MATCH_TEXT[row.match]}）`),
      status === "draft" ? h("span", { class: "draft-tag" }, "草稿，待指導者審定") : null
    ),
    h("p", { style: "margin:0" }, row.rationale),
    h("ul", { class: "redpen__sources" }, row.sources.map((s) => h("li", {}, sourceText(s, mockPaper))))
  );
}

function candidatesBlock(state) {
  if (!state) return null;
  if (state.status === "loading") return h("p", { class: "candidates__note" }, "正在擷取 PDF 文字…");
  if (state.status === "no-text") return h("p", { class: "candidates__note" }, "無法擷取文字（可能是掃描檔），關鍵字比對不可用。");
  if (!state.items.length) return h("p", { class: "candidates__note" }, "沒有找到含本題關鍵字的句子。");
  return h(
    "div",
    { class: "candidates" },
    h("p", { class: "candidates__note" }, "關鍵字比對（候選句子）：只依關鍵字挑出可能相關的句子，不代表任何判斷，請自行閱讀原文確認。"),
    state.items.map((c) =>
      h(
        "button",
        { type: "button", class: "candidate", onclick: () => state.onJump(c.pageNumber) },
        h("span", { class: "candidate__page" }, `第 ${c.pageNumber} 頁 · 關鍵字「${c.keyword}」`),
        c.sentence
      )
    )
  );
}

function questionCard(def, appraisal, item, ctx) {
  const section = def.sections.find((s) => s.id === item.section);
  const value = appraisal.answers[item.id];
  const required = isRequired(def, item.id, appraisal.answers);
  const checks = appraisal.considerChecks[item.id] ?? [];
  const row = ctx.review?.mode === "compare" ? ctx.review.rows.find((r) => r.itemId === item.id) : null;

  const answerButtons = required
    ? [
        h(
          "div",
          { class: "answers", role: "group", "aria-label": "作答" },
          def.options.map((opt) =>
            h(
              "button",
              { type: "button", class: "answer", dataset: { value: opt.value }, "aria-pressed": String(value === opt.value), onclick: () => ctx.onAnswer(item.id, opt.value) },
              h("span", { class: "answer__zh" }, opt.label.zh),
              h("span", { class: "answer__en" }, opt.label.en)
            )
          )
        ),
        CASP_VALUES.includes(value)
          ? h("button", { type: "button", class: "btn btn--quiet answers__clear", onclick: () => ctx.onAnswer(item.id, UNANSWERED) }, "清除答案")
          : null,
      ]
    : h("p", { class: "skip-note" }, "依 CASP 官方註記：Q9 答「否」時不必回答 Q10，因為結果不適用於你負責的族群。");

  const consider = h(
    "fieldset",
    { class: "consider", style: "border:0;padding:0;margin:0" },
    h("legend", { class: "block-title" }, "考量要點 CONSIDER"),
    item.considerIntro ? h("p", { class: "consider__intro" }, item.considerIntro.zh, h("span", { class: "consider__en" }, item.considerIntro.en)) : null,
    item.consider.map((c, i) =>
      h(
        "label",
        {},
        h("input", { type: "checkbox", checked: checks.includes(i), onchange: (e) => ctx.onConsider(item.id, i, e.target.checked) }),
        h("span", {}, c.zh, h("span", { class: "consider__en" }, c.en))
      )
    )
  );

  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, `Section ${section.id === "Z" ? "" : section.id}　${section.title.zh}`),
    item.parent ? h("div", { class: "question__parent" }, `${item.number.replace(/[a-z]$/, "")}. ${item.parent.zh}`) : null,
    h(
      "div",
      {},
      h("h2", { class: "question__title" }, `${item.number}　${item.question.zh}`),
      h("p", { class: "question__title-en" }, item.question.en)
    ),
    answerButtons,
    row ? redpenBlock(row, ctx.mockPaper, ctx.review.referenceStatus) : null,
    candidatesBlock(ctx.candidates),
    consider,
    item.teaching ? h("details", { class: "aside aside--teaching", open: true }, h("summary", {}, "教學補充（非 CASP 官方內容）"), h("p", {}, item.teaching)) : null,
    section.note ? h("details", { class: "aside" }, h("summary", {}, "官方解讀註記"), h("p", {}, section.note.zh), h("p", { class: "consider__en" }, section.note.en)) : null,
    h(
      "label",
      { class: "field" },
      h("span", { class: "block-title" }, "我的筆記（證據位置、理由）"),
      h("textarea", { maxlength: 4000, value: appraisal.notes[item.id] ?? "", oninput: (e) => ctx.onNote(item.id, e.target.value) })
    )
  );
}

function finishCard(def, appraisal, ctx) {
  const { done, total } = ctx.progress;
  const complete = done === total;
  const fields = def.summaryFields.map((f) =>
    h(
      "label",
      { class: "field" },
      h("span", { class: "block-title" }, `${f.label.zh}　${f.label.en}`),
      h("textarea", { maxlength: 4000, value: appraisal.toolData.summary[f.id], oninput: (e) => ctx.onSummary(f.id, e.target.value) })
    )
  );

  let unlock;
  if (ctx.paperKind !== "mock") {
    unlock = h("p", { class: "skip-note" }, "這篇是你上傳的文獻，沒有參考答案。完成後請匯出作答檔交給指導者。");
  } else if (!complete) {
    unlock = h("p", { class: "skip-note" }, `還有 ${total - done} 題未作答。全部作答後才能對照參考答案。`);
  } else if (!ctx.review) {
    unlock = h("button", { type: "button", class: "btn btn--primary", onclick: ctx.onReveal }, "對照參考答案");
  } else {
    const t = ctx.review.totals;
    unlock = h(
      "div",
      { class: "redpen redpen--same" },
      h("div", { class: "redpen__head" }, `與參考答案相同 ${t.same} 題、不同 ${t.different} 題`, ctx.review.referenceStatus === "draft" ? h("span", { class: "draft-tag" }, "草稿，待指導者審定") : null),
      h("p", { style: "margin:0" }, "導覽列上被紅圈圈起的題號就是答案不同的題目，點進去可看參考理由與出處。答案不同不一定是錯，請把你的理由寫進筆記，與指導者討論。"),
      h("p", { class: "block-title", style: "margin-top:8px" }, "參考摘要"),
      def.summaryFields.map((f) => h("p", { style: "margin:0" }, h("strong", {}, `${f.label.zh}：`), ctx.review.referenceSummary[f.id]))
    );
  }

  return h(
    "div",
    { class: "finish" },
    h("h2", { class: "question__title" }, "評讀摘要"),
    h("p", { class: "question__title-en" }, "APPRAISAL SUMMARY: List key points from your critical appraisal that need to be considered when assessing the validity of the results and their usefulness in decision-making."),
    h("p", { class: "finish__status", role: "status" }, complete ? `已完成全部 ${total} 題。` : `已完成 ${done} / ${total} 題。`),
    fields,
    unlock
  );
}

export function renderAppraise(root, def, appraisal, ctx) {
  const atFinish = ctx.index === def.items.length;
  const item = def.items[ctx.index];
  const pager = h(
    "div",
    { class: "pager" },
    h("button", { type: "button", class: "btn", disabled: ctx.index === 0, onclick: () => ctx.onGo(ctx.index - 1) }, "上一題"),
    h("button", { type: "button", class: "btn btn--primary", disabled: atFinish, onclick: () => ctx.onGo(ctx.index + 1) }, ctx.index === def.items.length - 1 ? "前往摘要" : "下一題")
  );
  mount(
    root,
    itemNav(def, appraisal.answers, ctx.index, ctx.review, ctx.onGo),
    atFinish ? finishCard(def, appraisal, ctx) : questionCard(def, appraisal, item, ctx),
    pager
  );
}
