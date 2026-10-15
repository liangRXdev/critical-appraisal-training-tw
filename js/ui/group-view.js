// 指導者多組比較：一次匯入 2–4 組作答檔，逐題並排、標出組間分歧；參考答案預設隱藏（揭曉前不進 DOM）
// 不保存在瀏覽器：組名修改、揭曉狀態都只存在這個畫面

import { h, mount } from "../core/dom.js";
import { admitFiles, buildGroupCompare, isDivergent, MIN_GROUPS, MAX_GROUPS } from "../core/group-compare.js";
import { referenceFor } from "../core/compare.js";
import { answerText, sourceText } from "./labels.js";

const LETTERS = ["A", "B", "C", "D"];

export const STATUS_TEXT = {
  agree: "一致",
  partial: "部分分歧",
  full: "完全分歧",
  none: "皆未作答",
};

// 目前畫面上的比較（列印時取用）；離開或重新選檔即清除
let active = null;

export function renderGroupCompare(root) {
  const result = h("div", { class: "groups", "aria-live": "polite" });
  const input = h("input", {
    type: "file",
    accept: "application/json,.json",
    multiple: true,
    hidden: true,
    onchange: (e) => {
      handleFiles([...e.target.files]);
      e.target.value = "";
    },
  });
  const zone = h(
    "div",
    {
      class: "dropzone",
      ondragover: (e) => { e.preventDefault(); zone.classList.add("is-over"); },
      ondragleave: () => zone.classList.remove("is-over"),
      ondrop: (e) => { e.preventDefault(); zone.classList.remove("is-over"); handleFiles([...e.dataTransfer.files]); },
    },
    h("p", {}, `一次選取 ${MIN_GROUPS}–${MAX_GROUPS} 組的 .json 作答檔（同一工具、同一篇文獻），或拖到這裡`),
    h("label", { class: "btn btn--primary" }, "選擇多個作答檔", input)
  );

  async function handleFiles(files) {
    if (!files.length) return;
    closeProjection({ silent: true });
    active = null;
    mount(result, h("p", { class: "muted" }, "正在讀取…"));
    const loaded = await Promise.all(
      files.map(async (f) => {
        try {
          return { name: f.name, text: await f.text() };
        } catch (err) {
          return { name: f.name, text: null, error: err.message };
        }
      })
    );
    const admitted = await admitFiles(loaded);
    if (!admitted.ready) {
      mount(result, rejectedBox(admitted.rejected), notEnough(admitted.groups.length));
      return;
    }
    active = {
      compare: buildGroupCompare(admitted.groups),
      groups: admitted.groups,
      names: admitted.groups.map((g) => g.name),
      rejected: admitted.rejected,
      onlyDivergent: false,
      revealed: false,
      index: 0,
    };
    renderResult(result);
  }

  mount(
    root,
    h("p", { class: "instructor__lead" }, "匯入各組的作答檔，逐題並排各組答案與理由，標出組間分歧的題目，帶動討論。參考答案預設隱藏，由你決定何時揭曉。比較結果不會保存。"),
    zone,
    result
  );
}

function notEnough(count) {
  return h(
    "div",
    { class: "banner banner--error", role: "alert" },
    h("span", { class: "banner__text" }, `可比較的作答檔只有 ${count} 份，至少需要 ${MIN_GROUPS} 組才能比較。請補上其他組的檔案後重新選取（一次選取全部檔案）。`)
  );
}

function rejectedBox(rejected) {
  if (!rejected.length) return null;
  return h(
    "div",
    { class: "banner", role: "status" },
    h(
      "div",
      { class: "banner__text" },
      h("strong", {}, `${rejected.length} 份檔案未納入比較`),
      h("ul", {}, rejected.map((r) => h("li", {}, `${r.fileName}：${r.reason}`)))
    )
  );
}

const visibleRows = (state) => state.compare.rows.filter((r) => !state.onlyDivergent || isDivergent(r.status));

function groupTag(state, g) {
  return h("span", { class: "group-tag", dataset: { group: String(g + 1) } }, h("span", { class: "group-tag__letter", "aria-hidden": "true" }, LETTERS[g]), h("span", { class: "group-tag__name" }, state.names[g]));
}

function statusText(row) {
  const base = STATUS_TEXT[row.status];
  return row.unanswered && row.status !== "none" ? `${base}（${row.unanswered} 組未答）` : base;
}

function renderResult(root) {
  const state = active;
  const { compare } = state;
  const def = compare.definition;
  const tableHost = h("div");
  const rerenderTable = () => mount(tableHost, compareTable(state));

  const nameInputs = state.groups.map((g, i) =>
    h(
      "li",
      { class: "group-legend__item" },
      h("span", { class: "group-tag__letter", dataset: { group: String(i + 1) }, "aria-hidden": "true" }, LETTERS[i]),
      h("input", {
        type: "text",
        class: "group-legend__name",
        value: state.names[i],
        maxlength: "40",
        "aria-label": `第 ${LETTERS[i]} 組名稱（只改畫面，不改檔案）`,
        oninput: (e) => {
          state.names[i] = e.target.value.trim() || g.name;
          rerenderTable();
        },
      }),
      h("span", { class: "muted" }, `${g.fileName}｜完成 ${compare.progress[i].done} / ${compare.progress[i].total}`)
    )
  );

  const toolbar = h(
    "div",
    { class: "group-toolbar" },
    h(
      "label",
      { class: "switch" },
      h("input", {
        type: "checkbox",
        checked: state.onlyDivergent,
        onchange: (e) => {
          state.onlyDivergent = e.target.checked;
          rerenderTable();
        },
      }),
      " 只看分歧"
    ),
    compare.hasReference
      ? h(
          "button",
          {
            class: "btn",
            "aria-pressed": String(state.revealed),
            onclick: () => {
              state.revealed = !state.revealed;
              renderResult(root);
            },
          },
          state.revealed ? "隱藏參考答案" : "揭曉參考答案"
        )
      : null,
    h("button", { class: "btn btn--primary", id: "btn-projector", onclick: () => openProjection(state, () => renderResult(root)) }, "投影模式"),
    h("button", { class: "btn", onclick: () => window.print() }, "列印總表")
  );

  const t = compare.totals;
  mount(
    root,
    rejectedBox(state.rejected),
    h(
      "div",
      { class: "report", style: "padding:0" },
      h("dl", {},
      h("dt", {}, "工具"), h("dd", {}, `${def.shortTitle.zh}（${def.toolVersion}）`),
      h("dt", {}, "文獻"), h("dd", {}, compare.paper.kind === "mock" ? compare.paper.mockPaper.title.zh : `${state.groups[0].parsed.value.paperLabel}（學員上傳）`))
    ),
    compare.needsManualCheck
      ? h("p", { class: "banner banner--info" }, "這些作答檔對應學員自行上傳的 PDF，系統只能依檔名判定為同一篇，請自行確認各組讀的是同一份文獻。沒有參考答案可揭曉。")
      : null,
    compare.paper.reference?.status === "draft" ? h("p", { class: "banner banner--info" }, "本篇參考答案仍是草稿，尚未審定。") : null,
    h("ul", { class: "group-legend", "aria-label": "各組（可改名，只影響畫面）" }, nameInputs),
    h(
      "div",
      { class: "tally", role: "status" },
      h("span", {}, h("strong", {}, t.full), " 完全分歧"),
      h("span", {}, h("strong", {}, t.partial), " 部分分歧"),
      h("span", {}, h("strong", {}, t.agree), " 一致"),
      t.none ? h("span", {}, h("strong", {}, t.none), " 皆未作答") : null
    ),
    toolbar,
    tableHost
  );
  rerenderTable();
}

function referenceCell(state, row) {
  const { compare } = state;
  const r = referenceFor(compare.definition, compare.paper.reference, row);
  return [
    h("div", { class: "group-cell__answer" }, answerText(r.answer)),
    r.rationale ? h("div", { class: "note" }, r.rationale) : null,
    r.sources?.length ? h("ul", { class: "redpen__sources" }, r.sources.map((s) => h("li", {}, sourceText(s, compare.paper.mockPaper)))) : null,
  ];
}

function groupCell(state, row, g) {
  const cell = row.cells[g];
  return h(
    "td",
    { class: "group-cell", dataset: { group: String(g + 1), unanswered: String(cell.answer === "unanswered") } },
    h("span", { class: "group-cell__tag" }, groupTag(state, g)),
    h("div", { class: "group-cell__answer" }, answerText(cell.answer)),
    cell.note ? h("div", { class: "note" }, cell.note) : null
  );
}

function compareTable(state) {
  const { compare, revealed } = state;
  const rows = visibleRows(state);
  const n = state.groups.length;
  const cols = 3 + n + (revealed ? 1 : 0);
  const def = compare.definition;
  const caption = `${def.shortTitle.zh}｜${compare.paper.kind === "mock" ? compare.paper.mockPaper.title.zh : state.groups[0].parsed.value.paperLabel}｜${state.names.map((x, i) => `${LETTERS[i]} ${x}`).join("、")}${state.onlyDivergent ? "｜只列分歧題" : ""}`;

  if (!rows.length) {
    return h("p", { class: "banner banner--info group-empty" }, "各組全部一致，沒有分歧的題目。");
  }
  return h(
    "div",
    { class: "table-wrap" },
    h(
      "table",
      { class: "review-table group-table", dataset: { groups: String(n), revealed: String(revealed) } },
      h(
        "colgroup",
        {},
        h("col", { class: "group-table__num" }),
        h("col", { class: "group-table__question" }),
        h("col", { class: "group-table__status" }),
        state.groups.map(() => h("col", { class: "group-table__group" })),
        revealed ? h("col", { class: "group-table__ref" }) : null
      ),
      h(
        "thead",
        {},
        h("tr", { class: "print-only" }, h("th", { colspan: String(cols), class: "print-caption" }, caption)),
        h(
          "tr",
          {},
          h("th", {}, "題號"),
          h("th", {}, "題目"),
          h("th", {}, "組間"),
          state.groups.map((_, g) => h("th", {}, groupTag(state, g))),
          revealed ? h("th", {}, "參考答案") : null
        )
      ),
      h(
        "tbody",
        {},
        rows.map((row) =>
          h(
            "tr",
            { dataset: { status: row.status }, class: row.kind === "judgement" ? "report-judgement" : null },
            h("td", { class: "num" }, row.number),
            h("td", {}, row.question.zh ?? row.question.en, row.question.zh && row.kind === "judgement" ? h("div", { class: "muted" }, row.question.en) : null),
            h("td", { class: "group-status" }, statusText(row)),
            state.groups.map((_, g) => groupCell(state, row, g)),
            revealed ? h("td", { class: "group-cell group-cell--ref" }, h("span", { class: "group-cell__tag" }, "參考答案"), referenceCell(state, row)) : null
          )
        )
      )
    )
  );
}

// ---------- 投影模式：一次一題，左右鍵切換 ----------

let projection = null; // { el, onKey }

// silent：重新選檔時關閉，不回到舊的總表
function closeProjection({ silent = false } = {}) {
  if (!projection) return;
  const { el, onKey, onClose, returnFocus } = projection;
  projection = null;
  document.removeEventListener("keydown", onKey);
  el.remove();
  if (silent) return;
  onClose?.(); // 投影中可能切換了「只看分歧」或揭曉，回到總表時同步
  (returnFocus?.isConnected ? returnFocus : document.getElementById("btn-projector"))?.focus();
}

function openProjection(state, onClose) {
  closeProjection({ silent: true });
  const el = h("section", { class: "projector", role: "dialog", "aria-modal": "true", "aria-label": "投影模式", tabindex: "-1" });
  const go = (delta) => {
    const rows = visibleRows(state);
    if (!rows.length) return;
    state.index = Math.max(0, Math.min(rows.length - 1, state.index + delta));
    paint();
  };
  const onKey = (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "text") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
    else if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    else if (e.key === "Escape" && !document.fullscreenElement) closeProjection();
    else return;
    e.preventDefault();
  };

  function paint() {
    const rows = visibleRows(state);
    state.index = Math.min(state.index, Math.max(0, rows.length - 1));
    const row = rows[state.index];
    const bar = h(
      "div",
      { class: "projector__bar" },
      h("button", { class: "btn", onclick: () => go(-1), disabled: !row || state.index === 0, "aria-label": "上一題" }, "← 上一題"),
      h("span", { class: "projector__pos", role: "status" }, row ? `${state.index + 1} / ${rows.length}${state.onlyDivergent ? "（只看分歧）" : ""}` : ""),
      h("button", { class: "btn", onclick: () => go(1), disabled: !row || state.index === rows.length - 1, "aria-label": "下一題" }, "下一題 →"),
      h("span", { class: "projector__spacer" }),
      h(
        "label",
        { class: "switch" },
        h("input", {
          type: "checkbox",
          checked: state.onlyDivergent,
          onchange: (e) => {
            state.onlyDivergent = e.target.checked;
            state.index = 0;
            paint();
            el.focus();
          },
        }),
        " 只看分歧"
      ),
      state.compare.hasReference
        ? h(
            "button",
            {
              class: "btn",
              "aria-pressed": String(state.revealed),
              onclick: () => {
                state.revealed = !state.revealed;
                paint();
              },
            },
            state.revealed ? "隱藏參考答案" : "揭曉參考答案"
          )
        : null,
      h("button", { class: "btn btn--primary", onclick: () => closeProjection() }, "結束投影")
    );
    if (!row) {
      mount(el, bar, h("div", { class: "projector__body" }, h("p", { class: "projector__empty" }, "各組全部一致，沒有分歧的題目。")));
      return;
    }
    mount(
      el,
      bar,
      h(
        "div",
        { class: "projector__body" },
        h(
          "header",
          { class: "projector__head" },
          h("span", { class: "projector__num" }, row.number),
          h("span", { class: "projector__status", dataset: { status: row.status } }, statusText(row))
        ),
        h("h2", { class: "projector__question" }, row.question.zh ?? row.question.en),
        row.question.zh && row.question.en ? h("p", { class: "muted" }, row.question.en) : null,
        h(
          "div",
          { class: "projector__groups", dataset: { groups: String(state.groups.length) } },
          state.groups.map((_, g) =>
            h(
              "article",
              { class: "projector__card", dataset: { group: String(g + 1), unanswered: String(row.cells[g].answer === "unanswered") } },
              groupTag(state, g),
              h("div", { class: "projector__answer" }, answerText(row.cells[g].answer)),
              row.cells[g].note ? h("div", { class: "note" }, row.cells[g].note) : null
            )
          )
        ),
        state.revealed ? h("article", { class: "projector__card projector__card--ref" }, h("strong", {}, "參考答案"), referenceCell(state, row)) : null
      )
    );
    // 已排版後的題目切換需回到頂端
    el.querySelector(".projector__body").scrollTop = 0;
  }

  projection = { el, onKey, onClose, returnFocus: document.activeElement };
  document.addEventListener("keydown", onKey);
  document.body.append(el);
  paint();
  el.focus();
}

// ---------- 列印 ----------

// 回傳 true 表示已把多組比較排進列印區
export function prepareGroupPrint(printRoot) {
  if (!active || !printRoot) return false;
  const def = active.compare.definition;
  printRoot.classList.toggle("print-root--landscape", active.groups.length >= 3);
  mount(
    printRoot,
    h("h1", {}, `多組比較：${def.shortTitle.zh}`),
    h("p", { class: "muted" }, `完全分歧 ${active.compare.totals.full}｜部分分歧 ${active.compare.totals.partial}｜一致 ${active.compare.totals.agree}${active.revealed ? "｜含參考答案" : ""}`),
    compareTable(active)
  );
  return true;
}

export function hasGroupCompare() {
  return Boolean(active);
}
