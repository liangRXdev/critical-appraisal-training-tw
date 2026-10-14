// GRADE 右欄：outcome 列與研究設計 → 五個降級因素 → 升級因素（適用時）→ 最終確定性
// 學員先判斷，程式後顯示建議與路徑；不一致只提示並請填理由，不判錯（SPEC §7.1）

import { h, mount } from "../core/dom.js";
import * as grade from "../engines/grade.js";
import { answerText } from "./labels.js";
import { redpenBlock, candidatesBlock } from "./question-view.js";

export const GRADE_STEPS = ["outcome", "down", "up", "certainty"];
const STEP_LABEL = { outcome: "Outcome", down: "降級", up: "升級", certainty: "確定性" };

function stepFactors(def, step) {
  if (step === "down") return def.downgrade;
  if (step === "up") return def.upgrade;
  return [];
}

export function gradeStepEvidence(def, step) {
  if (step === "outcome") return [def.design.id];
  if (step === "certainty") return ["certainty"];
  return stepFactors(def, step).map((f) => f.id);
}

export function gradeStepKeywords(def, step) {
  if (step === "outcome") return def.design.keywords;
  return [...new Set(stepFactors(def, step).flatMap((f) => f.keywords))];
}

export function gradeFirstOpenStep(def, appraisal) {
  const a = appraisal.answers;
  if (a[def.design.id] === grade.UNANSWERED) return 0;
  if (grade.downgradeIds(def).some((id) => a[id] === grade.UNANSWERED)) return 1;
  if (grade.upgradeIds(def).some((id) => grade.askState(def, id, a) === "asked" && a[id] === grade.UNANSWERED)) return 2;
  return 3;
}

const teachingBox = (text, open = false) =>
  h("details", { class: "aside aside--teaching", open }, h("summary", {}, "教學補充（自寫解說，非 GRADE 原文）"), h("p", {}, text));

const reviewRow = (ctx, id) => ctx.review?.rows.find((r) => r.itemId === id) ?? null;

function noteField(appraisal, key, ctx, label = "我的筆記（證據位置、理由）") {
  return h(
    "label",
    { class: "field" },
    h("span", { class: "block-title" }, label),
    h("textarea", { maxlength: 4000, value: appraisal.notes[key] ?? "", oninput: (e) => ctx.onNote(key, e.target.value) })
  );
}

function valueButtons(id, values, current, onPick, label) {
  return h(
    "div",
    { class: "sq__options", role: "group", "aria-label": label },
    values.map((v) =>
      h(
        "button",
        { type: "button", class: "opt", dataset: { value: v }, "aria-pressed": String(current === v), onclick: () => onPick(id, current === v ? grade.UNANSWERED : v) },
        v === "0" ? "0" : v.replace("-", "−")
      )
    )
  );
}

function factorBlock(def, appraisal, f, ctx, disabled) {
  const value = appraisal.answers[f.id];
  const row = reviewRow(ctx, f.id);
  return h(
    "div",
    { class: `factor ${disabled ? "factor--off" : ""}`, id: `factor-${f.id}` },
    h("div", { class: "factor__head" }, h("span", { class: "factor__name" }, f.name.en), h("span", { class: "factor__locator" }, f.locator)),
    disabled ? h("p", { class: "sq__na" }, "Not applicable — 依規則不考慮升級。") : valueButtons(f.id, f.values, value, ctx.onAnswer, `${f.name.en} 幅度`),
    f.note ? h("p", { class: "factor__note" }, f.note) : null,
    teachingBox(f.teaching),
    row ? redpenBlock(row, ctx.mockPaper, ctx.review.referenceStatus) : null,
    disabled ? null : noteField(appraisal, f.id, ctx)
  );
}

function outcomeCard(def, appraisal, ctx) {
  const o = appraisal.toolData.outcome;
  const design = appraisal.answers[def.design.id];
  const row = reviewRow(ctx, def.design.id);
  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, `Outcome 與研究設計　${def.design.locator}`),
    h("h2", { class: "question__title" }, "先界定要評的是哪一個 outcome"),
    h("p", { class: "skip-note" }, "GRADE 是逐一 outcome 評定確定性。本工具一次評一個 outcome，證據體須全為 RCT 或全為觀察性研究。"),
    ctx.mockPaper?.assessedResult ? h("p", { class: "consider__intro" }, `本範例要評的 outcome：${ctx.mockPaper.assessedResult.zh}`) : null,
    def.outcomeFields.map((f) =>
      h(
        "label",
        { class: "field" },
        h("span", { class: "block-title" }, f.label.en),
        h("input", { type: "text", class: "text-input", maxlength: 500, value: o[f.id], oninput: (e) => ctx.onOutcome(f.id, e.target.value) })
      )
    ),
    h("h3", { class: "block-title" }, "Study design（決定起始等級）"),
    h(
      "div",
      { class: "answers answers--judgement", role: "group", "aria-label": "研究設計" },
      def.design.options.map((opt) =>
        h(
          "button",
          { type: "button", class: "answer answer--design", "aria-pressed": String(design === opt.value), onclick: () => ctx.onAnswer(def.design.id, design === opt.value ? grade.UNANSWERED : opt.value) },
          h("span", { class: "answer__zh" }, design === opt.value ? `✓ ${opt.en}` : opt.en),
          h("span", { class: "answer__en" }, `起始 ${opt.start}`)
        )
      )
    ),
    teachingBox(def.design.teaching, true),
    row ? redpenBlock(row, ctx.mockPaper, ctx.review.referenceStatus) : null,
    noteField(appraisal, def.design.id, ctx),
    candidatesBlock(ctx.candidates)
  );
}

function downCard(def, appraisal, ctx) {
  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, "Factors that can reduce the quality of the evidence（Table 5.2）"),
    h("h2", { class: "question__title" }, "五個降級因素"),
    h("p", { class: "skip-note" }, "每個因素選 0（沒有嚴重問題）或降級幅度。每項都要作答，才能判斷是否考慮升級。"),
    candidatesBlock(ctx.candidates),
    def.downgrade.map((f) => factorBlock(def, appraisal, f, ctx, false))
  );
}

function gateMessage(def, gate) {
  if (gate.reason === "rct") {
    return h(
      "div",
      { class: "aside aside--teaching factor__gate" },
      h("p", { class: "quote" }, `“${def.upgradeRule.rctQuote}”（Handbook ${def.upgradeRule.locator}）`),
      h("p", {}, def.upgradeRule.rctTeaching)
    );
  }
  const quote = h("p", { class: "quote" }, `“${def.upgradeRule.quote}”（Handbook ${def.upgradeRule.locator}）`);
  if (gate.reason === "downgraded") {
    const names = gate.factors.map((id) => def.downgrade.find((f) => f.id === id).name.en);
    return h("div", { class: "aside factor__gate" }, h("p", {}, `已有降級因素（${names.join("、")}），不考慮升級。`), quote);
  }
  return h("div", { class: "aside factor__gate" }, h("p", {}, "先完成研究設計與五個降級因素，才能判斷是否考慮升級。"), quote);
}

function upCard(def, appraisal, ctx) {
  const gate = grade.upgradeGate(def, appraisal.answers);
  const off = gate.state !== "asked";
  return h(
    "div",
    { class: "question" },
    h("div", { class: "question__section" }, "Factors that can increase the quality of the evidence（Table 5.3）"),
    h("h2", { class: "question__title" }, "三個升級因素"),
    off ? gateMessage(def, gate) : h("p", { class: "skip-note" }, "觀察性研究且五個降級因素皆為 0，可以考慮升級。每項都要作答。"),
    off ? null : candidatesBlock(ctx.candidates),
    def.upgrade.map((f) => factorBlock(def, appraisal, f, ctx, off))
  );
}

function certaintyButtons(current, onPick) {
  return h(
    "div",
    { class: "answers answers--judgement answers--certainty", role: "group", "aria-label": "證據確定性" },
    grade.CERTAINTIES.map((c) =>
      h("button", { type: "button", class: "answer", dataset: { certainty: c }, "aria-pressed": String(current === c), onclick: () => onPick(current === c ? grade.UNANSWERED : c) }, h("span", { class: "answer__zh" }, c))
    )
  );
}

function suggestionBlock(def, appraisal, ctx) {
  const student = appraisal.toolData.certainty;
  if (!grade.CERTAINTIES.includes(student)) return h("p", { class: "skip-note" }, "先選你自己的判斷，系統才會顯示演算法建議。");
  const s = grade.suggestCertainty(def, appraisal.answers);
  if (s.status === "insufficient") {
    const names = s.missing.map((id) => (id === def.design.id ? "Study design" : grade.findFactor(def, id).name.en));
    return h("p", { class: "skip-note" }, `還有 ${s.missing.length} 項未作答（${names.join("、")}），無法給建議。`);
  }
  const differs = s.level !== student;
  return h(
    "div",
    { class: `algo ${differs ? "algo--differs" : ""}`, role: "status" },
    h("div", { class: "algo__head" }, `演算法建議：${s.level}`, differs ? h("span", { class: "algo__flag" }, "與你的判斷不同") : h("span", { class: "algo__ok" }, "與你的判斷一致")),
    h("p", { class: "algo__path" }, s.path),
    h("p", { class: "algo__locator" }, `依據：GRADE Handbook ${def.certainty.locator}；各因素可相加，但最終等級是判斷，可附理由推翻。`),
    differs
      ? h(
          "label",
          { class: "field" },
          h("span", { class: "block-title" }, "理由（與演算法不同時請說明）"),
          h("textarea", { maxlength: 4000, value: appraisal.toolData.overrideReason, oninput: (e) => ctx.onOverride(e.target.value) })
        )
      : null
  );
}

function certaintyCard(def, appraisal, ctx) {
  const a = appraisal.answers;
  const { done, total } = ctx.progress;
  const complete = done === total;
  const row = reviewRow(ctx, "certainty");
  const factorRows = [...def.downgrade, ...def.upgrade].map((f) =>
    h("tr", {}, h("td", {}, f.name.en), h("td", { class: "num" }, answerText(a[f.id])))
  );

  let unlock;
  if (ctx.paperKind !== "mock") unlock = h("p", { class: "skip-note" }, "這篇是你上傳的文獻，沒有參考答案。完成後請匯出作答檔交給指導者。");
  else if (!complete) unlock = h("p", { class: "skip-note" }, `還有 ${total - done} 項未完成。全部完成後才能對照參考答案。`);
  else if (!ctx.review) unlock = h("button", { type: "button", class: "btn btn--primary", onclick: ctx.onReveal }, "對照參考答案");
  else {
    const t = ctx.review.totals;
    unlock = h(
      "div",
      { class: "redpen redpen--same" },
      h("div", { class: "redpen__head" }, `相同 ${t.same}、不同 ${t.different}、皆免答 ${t.skipped}`, ctx.review.referenceStatus === "draft" ? h("span", { class: "draft-tag" }, "草稿，待指導者審定") : null),
      h("p", { style: "margin:0" }, "導覽列上被紅圈圈起的步驟有作答與參考不同，點進去可看每個因素的參考理由與出處。答案不同不一定是錯，請把理由寫進筆記，與指導者討論。")
    );
  }

  return h(
    "div",
    { class: "finish" },
    h("h2", { class: "question__title" }, "Certainty of the evidence"),
    teachingBox(def.certainty.teaching, true),
    h(
      "table",
      { class: "review-table" },
      h("thead", {}, h("tr", {}, h("th", {}, "Factor"), h("th", {}, "你的評定"))),
      h("tbody", {}, h("tr", {}, h("td", {}, "Study design"), h("td", { class: "num" }, answerText(a[def.design.id]))), factorRows)
    ),
    h("h3", { class: "block-title" }, "你對這個 outcome 的確定性判斷"),
    certaintyButtons(appraisal.toolData.certainty, ctx.onCertainty),
    h(
      "details",
      { class: "aside" },
      h("summary", {}, `四個等級的定義（Table 5.1，${def.levelsLocator}）`),
      h("dl", { class: "levels" }, def.levels.map((l) => [h("dt", {}, l.value), h("dd", {}, l.en)]))
    ),
    suggestionBlock(def, appraisal, ctx),
    row ? redpenBlock(row, ctx.mockPaper, ctx.review.referenceStatus) : null,
    noteField(appraisal, "certainty", ctx),
    h("p", { class: "finish__status", role: "status" }, complete ? `已完成全部 ${total} 項。` : `已完成 ${done} / ${total} 項。`),
    unlock
  );
}

function stepNav(def, appraisal, index, review, onGo) {
  const ids = (step) => gradeStepEvidence(def, step);
  const differs = (step) => review?.rows.some((r) => ids(step).includes(r.itemId) && r.match === "different");
  return h(
    "nav",
    { class: "item-nav", "aria-label": "GRADE 步驟" },
    h(
      "div",
      { class: "item-nav__section" },
      GRADE_STEPS.map((step, i) =>
        h(
          "button",
          {
            type: "button",
            class: "chip chip--step",
            "aria-current": i === index ? "step" : false,
            dataset: { certainty: step === "certainty" ? appraisal.toolData.certainty : "", match: differs(step) ? "different" : "" },
            onclick: () => onGo(i),
          },
          STEP_LABEL[step]
        )
      )
    )
  );
}

export function renderGrade(root, def, appraisal, ctx) {
  const step = GRADE_STEPS[ctx.index];
  const cards = { outcome: outcomeCard, down: downCard, up: upCard, certainty: certaintyCard };
  const last = GRADE_STEPS.length - 1;
  const pager = h(
    "div",
    { class: "pager" },
    h("button", { type: "button", class: "btn", disabled: ctx.index === 0, onclick: () => ctx.onGo(ctx.index - 1) }, "上一步"),
    h("button", { type: "button", class: "btn btn--primary", disabled: ctx.index === last, onclick: () => ctx.onGo(ctx.index + 1) }, ctx.index === last - 1 ? "前往確定性判斷" : "下一步")
  );
  mount(root, stepNav(def, appraisal, ctx.index, ctx.review, ctx.onGo), cards[step](def, appraisal, ctx), pager);
}
