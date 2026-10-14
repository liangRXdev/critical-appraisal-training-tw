// RoB 2 右欄：前置考量 → D1–D5（signalling questions + 學員判斷 + 演算法建議）→ 整體判斷
// 學員先判斷，程式後顯示建議與路徑；不一致只提示並請填推翻理由，不判錯（SPEC §7.1）

import { h, mount } from "../core/dom.js";
import * as rob2 from "../engines/rob2.js";
import { answerText } from "./labels.js";
import { redpenBlock, candidatesBlock } from "./question-view.js";

export const ROB2_STEPS = ["prelim", "D1", "D2", "D3", "D4", "D5", "overall"];
const STEP_LABEL = { prelim: "前置", D1: "D1", D2: "D2", D3: "D3", D4: "D4", D5: "D5", overall: "整體" };

export function rob2StepEvidence(def, step) {
  if (step === "prelim") return [];
  if (step === "overall") return ["overall"];
  const domain = def.domains.find((d) => d.id === step);
  return [step, ...domain.questions.map((q) => q.id)];
}

export function rob2StepKeywords(def, step) {
  return def.domains.find((d) => d.id === step)?.keywords ?? [];
}

export function rob2FirstOpenStep(def, appraisal) {
  const j = appraisal.toolData.judgements;
  const i = ["D1", "D2", "D3", "D4", "D5"].findIndex((d) => rob2.missingInDomain(def, d, appraisal.answers).length || j[d] === rob2.UNANSWERED);
  return i >= 0 ? i + 1 : ROB2_STEPS.length - 1;
}

function judgementButtons(current, onPick, label) {
  return h(
    "div",
    { class: "answers answers--judgement", role: "group", "aria-label": label },
    rob2.JUDGEMENTS.map((j) =>
      h("button", { type: "button", class: "answer", dataset: { judgement: j }, "aria-pressed": String(current === j), onclick: () => onPick(current === j ? rob2.UNANSWERED : j) }, h("span", { class: "answer__zh" }, j))
    )
  );
}

function suggestionBlock(suggestion, studentJudgement, overrideReason, onOverride, key) {
  if (!rob2.JUDGEMENTS.includes(studentJudgement)) {
    return h("p", { class: "skip-note" }, "先選你自己的判斷，系統才會顯示演算法建議。");
  }
  if (suggestion.status === "insufficient") {
    return h("p", { class: "skip-note" }, `還有 ${suggestion.missing.length} 題未作答（${suggestion.missing.join("、")}），無法給演算法建議。`);
  }
  if (suggestion.status !== "ok") return h("p", { class: "skip-note" }, "無法產生建議。");
  const differs = suggestion.judgement !== studentJudgement;
  return h(
    "div",
    { class: `algo ${differs ? "algo--differs" : ""}`, role: "status" },
    h("div", { class: "algo__head" }, `演算法建議：${suggestion.judgement}`, differs ? h("span", { class: "algo__flag" }, "與你的判斷不同") : h("span", { class: "algo__ok" }, "與你的判斷一致")),
    h("p", { class: "algo__path" }, suggestion.path),
    h("p", { class: "algo__locator" }, `依據：RoB 2 guidance ${suggestion.locator}；演算法只是建議，可附理由推翻。`),
    differs
      ? h(
          "label",
          { class: "field" },
          h("span", { class: "block-title" }, "推翻理由（與演算法不同時請說明）"),
          h("textarea", { maxlength: 4000, value: overrideReason, oninput: (e) => onOverride(key, e.target.value) })
        )
      : null
  );
}

function questionBlock(def, appraisal, q, ctx) {
  const state = rob2.askState(q, appraisal.answers);
  const value = appraisal.answers[q.id];
  const row = ctx.review?.rows.find((r) => r.kind === "item" && r.itemId === q.id);
  const skipped = state === "skipped";
  return h(
    "div",
    { class: `sq ${skipped ? "sq--skipped" : ""}`, id: `sq-${q.id}` },
    h("div", { class: "sq__text" }, h("span", { class: "sq__id" }, q.id), q.text),
    skipped
      ? h("p", { class: "sq__na" }, "Not applicable — 依前面的答案，這題不需作答。")
      : h(
          "div",
          { class: "sq__options", role: "group", "aria-label": `${q.id} 作答` },
          q.options.map((v) =>
            h(
              "button",
              { type: "button", class: "opt", dataset: { value: v }, "aria-pressed": String(value === v), onclick: () => ctx.onAnswer(q.id, value === v ? rob2.UNANSWERED : v), title: def.options.find((o) => o.value === v)?.label },
              v
            )
          )
        ),
    state === "pending" ? h("p", { class: "sq__pending" }, "上一題作答後，才會知道這題是否需要回答。") : null,
    q.teaching ? h("details", { class: "aside aside--teaching" }, h("summary", {}, "教學補充（自寫解說，非 RoB 2 原文）"), h("p", {}, q.teaching)) : null,
    row ? redpenBlock(row, ctx.mockPaper, ctx.review.referenceStatus) : null
  );
}

function domainCard(def, appraisal, domain, ctx) {
  const judgement = appraisal.toolData.judgements[domain.id];
  const suggestion = rob2.suggestDomain(def, domain.id, appraisal.answers);
  const jRow = ctx.review?.rows.find((r) => r.kind === "judgement" && r.itemId === domain.id);
  const questions = domain.parts
    ? domain.parts.map((part) => [h("h3", { class: "sq-part" }, part.label), part.questions.map((id) => questionBlock(def, appraisal, domain.questions.find((q) => q.id === id), ctx))])
    : domain.questions.map((q) => questionBlock(def, appraisal, q, ctx));
  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, `Domain ${domain.id.slice(1)}　${domain.locator}`),
    h("h2", { class: "question__title" }, domain.title.en),
    h("details", { class: "aside aside--teaching", open: true }, h("summary", {}, "教學補充（自寫解說，非 RoB 2 原文）"), h("p", {}, domain.teaching)),
    candidatesBlock(ctx.candidates),
    questions,
    h("h3", { class: "block-title" }, `你對 ${domain.id} 的判斷`),
    judgementButtons(judgement, (v) => ctx.onJudgement(domain.id, v), `${domain.id} 判斷`),
    suggestionBlock(suggestion, judgement, appraisal.toolData.overrideReasons[domain.id], ctx.onOverride, domain.id),
    jRow ? redpenBlock(jRow, ctx.mockPaper, ctx.review.referenceStatus) : null,
    h(
      "label",
      { class: "field" },
      h("span", { class: "block-title" }, "我的筆記（證據位置、理由）"),
      h("textarea", { maxlength: 4000, value: appraisal.notes[domain.id] ?? "", oninput: (e) => ctx.onNote(domain.id, e.target.value) })
    )
  );
}

function prelimCard(def, appraisal, ctx) {
  const p = appraisal.toolData.preliminary;
  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, "Preliminary considerations（Box 2, p.9）"),
    h("h2", { class: "question__title" }, "先確認要評的是哪一個結果"),
    h("p", { class: "skip-note" }, def.preliminary.effectNote),
    ctx.mockPaper?.assessedResult ? h("p", { class: "consider__intro" }, `本範例要評的結果：${ctx.mockPaper.assessedResult.zh}`) : null,
    h("details", { class: "aside aside--teaching", open: true }, h("summary", {}, "教學補充"), h("p", {}, def.teachingIntro)),
    def.preliminary.fields.map((f) =>
      h(
        "label",
        { class: "field" },
        h("span", { class: "block-title" }, f.label.en),
        h("input", { type: "text", class: "text-input", maxlength: 500, value: p[f.id], oninput: (e) => ctx.onPrelim(f.id, e.target.value) })
      )
    )
  );
}

function overallCard(def, appraisal, ctx) {
  const j = appraisal.toolData.judgements;
  const suggestion = rob2.suggestOverall(j);
  const { done, total } = ctx.progress;
  const complete = done === total;
  const rows = ["D1", "D2", "D3", "D4", "D5"].map((d) =>
    h("tr", {}, h("td", { class: "num" }, d), h("td", {}, def.domains.find((x) => x.id === d).title.en), h("td", { class: "num", dataset: { judgement: j[d] } }, answerText(j[d])))
  );
  const oRow = ctx.review?.rows.find((r) => r.kind === "judgement" && r.itemId === "overall");

  let overallSuggestion;
  if (!rob2.JUDGEMENTS.includes(j.overall)) overallSuggestion = h("p", { class: "skip-note" }, "先選你的整體判斷，系統才會顯示建議。");
  else if (suggestion.status !== "ok") overallSuggestion = h("p", { class: "skip-note" }, "五個 domain 都判斷後，才能給整體建議。");
  else {
    const differs = suggestion.judgement !== j.overall;
    const allowedHigh = suggestion.considerHigh && j.overall === rob2.HIGH;
    overallSuggestion = h(
      "div",
      { class: `algo ${differs && !allowedHigh ? "algo--differs" : ""}`, role: "status" },
      h("div", { class: "algo__head" }, `依 Table 1 的建議：${suggestion.judgement}`, differs && !allowedHigh ? h("span", { class: "algo__flag" }, "與你的判斷不同") : null),
      suggestion.considerHigh ? h("p", { class: "algo__path" }, "有多個 domain 為 Some concerns：若它們累積起來實質降低你對結果的信心，可判為 High（需你判斷，請寫下理由）。") : null,
      h("p", { class: "algo__locator" }, `依據：RoB 2 guidance ${def.overall.locator}`),
      differs
        ? h("label", { class: "field" }, h("span", { class: "block-title" }, "理由"), h("textarea", { maxlength: 4000, value: appraisal.toolData.overrideReasons.overall, oninput: (e) => ctx.onOverride("overall", e.target.value) }))
        : null
    );
  }

  let unlock;
  if (ctx.paperKind !== "mock") unlock = h("p", { class: "skip-note" }, "這篇是你上傳的文獻，沒有參考答案。完成後請匯出作答檔交給指導者。");
  else if (!complete) unlock = h("p", { class: "skip-note" }, `還有 ${total - done} 項未完成（含 signalling questions 與各 domain 判斷）。全部完成後才能對照參考答案。`);
  else if (!ctx.review) unlock = h("button", { type: "button", class: "btn btn--primary", onclick: ctx.onReveal }, "對照參考答案");
  else {
    const t = ctx.review.totals;
    unlock = h(
      "div",
      { class: "redpen redpen--same" },
      h("div", { class: "redpen__head" }, `相同 ${t.same}、意涵相同 ${t.equivalent}、不同 ${t.different}`, ctx.review.referenceStatus === "draft" ? h("span", { class: "draft-tag" }, "草稿，待指導者審定") : null),
      h("p", { style: "margin:0" }, "導覽列上被紅圈圈起的 domain 有判斷或作答與參考不同，點進去可看每題的參考理由與出處。答案不同不一定是錯，請把理由寫進筆記，與指導者討論。")
    );
  }

  return h(
    "div",
    { class: "finish" },
    h("h2", { class: "question__title" }, "Overall risk of bias"),
    h("details", { class: "aside aside--teaching", open: true }, h("summary", {}, "教學補充"), h("p", {}, def.overall.teaching)),
    h("table", { class: "review-table" }, h("thead", {}, h("tr", {}, h("th", {}, "Domain"), h("th", {}, ""), h("th", {}, "你的判斷"))), h("tbody", {}, rows)),
    h("h3", { class: "block-title" }, "你的整體判斷"),
    judgementButtons(j.overall, (v) => ctx.onJudgement("overall", v), "整體判斷"),
    overallSuggestion,
    oRow ? redpenBlock(oRow, ctx.mockPaper, ctx.review.referenceStatus) : null,
    h("p", { class: "finish__status", role: "status" }, complete ? `已完成全部 ${total} 項。` : `已完成 ${done} / ${total} 項。`),
    unlock
  );
}

function stepNav(def, appraisal, index, review, onGo) {
  const differs = (step) => review?.rows.some((r) => (r.itemId === step || r.domain === step) && r.match === "different");
  return h(
    "nav",
    { class: "item-nav", "aria-label": "RoB 2 步驟" },
    h(
      "div",
      { class: "item-nav__section" },
      ROB2_STEPS.map((step, i) =>
        h(
          "button",
          {
            type: "button",
            class: "chip chip--step",
            "aria-current": i === index ? "step" : false,
            dataset: { judgement: step === "prelim" ? "" : appraisal.toolData.judgements[step], match: differs(step) ? "different" : "" },
            onclick: () => onGo(i),
          },
          STEP_LABEL[step]
        )
      )
    )
  );
}

export function renderRob2(root, def, appraisal, ctx) {
  const step = ROB2_STEPS[ctx.index];
  let body;
  if (step === "prelim") body = prelimCard(def, appraisal, ctx);
  else if (step === "overall") body = overallCard(def, appraisal, ctx);
  else body = domainCard(def, appraisal, def.domains.find((d) => d.id === step), ctx);
  const last = ROB2_STEPS.length - 1;
  const pager = h(
    "div",
    { class: "pager" },
    h("button", { type: "button", class: "btn", disabled: ctx.index === 0, onclick: () => ctx.onGo(ctx.index - 1) }, "上一步"),
    h("button", { type: "button", class: "btn btn--primary", disabled: ctx.index === last, onclick: () => ctx.onGo(ctx.index + 1) }, ctx.index === last - 1 ? "前往整體判斷" : "下一步")
  );
  mount(root, stepNav(def, appraisal, ctx.index, ctx.review, ctx.onGo), body, pager);
}

