// 實證評讀練習室：學員作答 / 指導者比對

import { tools, getTool, resolvePaper, MOCK_PREFIX, USER_PDF_PREFIX } from "./tools/registry.js";
import { createStore, appraisalKey } from "./core/store.js";
import { createAppraisal, serializeAppraisal, exportFileName } from "./core/appraisal.js";
import { buildReview } from "./core/compare.js";
import { h, mount, download } from "./core/dom.js";
import { openPdf, extractText, findCandidates, hasTextLayer } from "./core/pdf.js";
import * as casp from "./engines/casp.js";
import { renderMockPaper, renderPdfDropzone, createPdfViewer, showPdfError } from "./ui/paper-view.js";
import { renderAppraise } from "./ui/question-view.js";
import { renderReport } from "./ui/report-view.js";
import { renderInstructor } from "./ui/instructor-view.js";

const $ = (id) => document.getElementById(id);
const store = createStore();

const app = {
  tool: null,
  appraisal: null,
  paper: null,
  index: 0,
  revealed: false,
  pdf: null, // { doc, pages, status, viewer }
  lang: "zh",
  showEvidence: true,
  pane: "paper",
  storageIssue: null, // 目前評讀的保存問題
  loadIssue: null, // 載入舊紀錄失敗的原因
};

// ---------- 偏好（僅 per-viewer 便利，失敗不影響功能） ----------

function pref(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(`cat:pref:${key}`);
    localStorage.setItem(`cat:pref:${key}`, value);
  } catch {
    return null;
  }
}

// ---------- 保存 ----------

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const key = appraisalKey(app.appraisal.toolId, app.appraisal.paperRef);
    const r = store.save(key, app.appraisal);
    const issue = r.ok ? null : r.reason;
    if (issue !== app.storageIssue) {
      app.storageIssue = issue;
      renderBanners();
    }
  }, 250);
}

// ---------- 開啟評讀 ----------

function labelFor(tool, paperRef) {
  if (paperRef.startsWith(MOCK_PREFIX)) return resolvePaper(tool, paperRef).mockPaper.title.en;
  return store.list(tool.toolId).find((s) => s.paperRef === paperRef)?.paperLabel || "我的 PDF";
}

function rememberedPaper(tool) {
  const ref = pref(`paper:${tool.toolId}`);
  return ref && resolvePaper(tool, ref).kind !== "invalid" ? ref : MOCK_PREFIX + tool.mockPapers[0].id;
}

async function openAppraisal(toolId, paperRef, paperLabel) {
  const tool = getTool(toolId);
  const paper = resolvePaper(tool, paperRef);
  if (paper.kind === "invalid") throw new Error(`找不到文獻 ${paperRef}`);
  const key = appraisalKey(toolId, paperRef);
  const loaded = await store.load(key);

  app.tool = tool;
  app.paper = paper;
  app.revealed = false;
  app.loadIssue = loaded.status === "invalid" ? { key, errors: loaded.errors } : null;
  app.appraisal = loaded.status === "ok" ? loaded.value : await createAppraisal(tool, paperRef, paperLabel);
  app.storageIssue = loaded.status === "unavailable" ? "unavailable" : store.isQuarantined(key) ? "quarantined" : null;
  const firstOpen = tool.definition.items.findIndex((i) => app.appraisal.answers[i.id] === casp.UNANSWERED);
  app.index = firstOpen === -1 ? tool.definition.items.length : firstOpen;
  if (paper.kind === "mock") app.pdf = null;

  pref("tool", toolId);
  pref(`paper:${toolId}`, paperRef);
  renderAll();
}

// ---------- 版面 ----------

function renderBanners() {
  const items = [];
  if (app.storageIssue === "unavailable") {
    items.push(banner("此瀏覽器無法保存作答（可能是無痕模式或封鎖網站資料）。你仍可作答，離開前請按「匯出作答檔」保存。"));
  } else if (app.storageIssue === "write-failed") {
    items.push(banner("最近一次自動保存失敗（儲存空間可能已滿）。請先匯出作答檔，避免遺失。"));
  }
  if (app.loadIssue) {
    const { key, errors } = app.loadIssue;
    items.push(
      h(
        "div",
        { class: "banner banner--error", role: "alert" },
        h(
          "div",
          { class: "banner__text" },
          "先前保存的這份評讀無法載入，已保留原資料不覆寫；目前是空白的新評讀，不會自動保存。",
          h("ul", {}, errors.slice(0, 3).map((e) => h("li", {}, e.path ? `${e.path}：${e.message}` : e.message)))
        ),
        h(
          "button",
          {
            class: "btn",
            onclick: () => {
              store.remove(key);
              app.loadIssue = null;
              app.storageIssue = null;
              persist();
              renderBanners();
            },
          },
          "捨棄舊紀錄並開始保存"
        )
      )
    );
  }
  const status = app.paper?.kind === "mock" ? app.tool.references[app.paper.mockPaper.id]?.status : null;
  if (status === "draft") {
    items.push(banner("本篇範例文獻與參考答案仍是草稿，尚未經指導者審定。", "info"));
  }
  mount($("banners"), items);
}

function banner(text, tone = "") {
  return h("div", { class: `banner ${tone ? "banner--" + tone : ""}` }, h("span", { class: "banner__text" }, text));
}

function renderSetup() {
  const def = app.tool.definition;
  $("tool-title").textContent = def.title.zh;
  mount(
    $("tool-select"),
    tools.map((t) =>
      h(
        "option",
        { value: t.toolId, disabled: t.status !== "ready", selected: t.toolId === app.tool.toolId },
        t.status === "ready" ? t.definition.shortTitle.zh : `${t.shortTitle.zh}（開發中）`
      )
    )
  );

  const saved = store.list(app.tool.toolId).filter((s) => s.paperRef.startsWith(USER_PDF_PREFIX));
  const current = app.appraisal.paperRef;
  const userOptions = saved.map((s) => h("option", { value: s.paperRef, selected: s.paperRef === current }, `我的 PDF：${s.paperLabel}`));
  if (current.startsWith(USER_PDF_PREFIX) && !saved.some((s) => s.paperRef === current)) {
    userOptions.unshift(h("option", { value: current, selected: true }, `我的 PDF：${app.appraisal.paperLabel}`));
  }
  mount(
    $("paper-select"),
    h(
      "optgroup",
      { label: "範例文獻（附參考答案）" },
      app.tool.mockPapers.map((m) => h("option", { value: MOCK_PREFIX + m.id, selected: MOCK_PREFIX + m.id === current }, m.title.zh))
    ),
    userOptions.length ? h("optgroup", { label: "我上傳的文獻" }, userOptions) : null
  );

  $("reviewer-input").value = app.appraisal.metadata.reviewerName;
  $("date-input").value = app.appraisal.metadata.appraisalDate;
  renderProgress();
}

function renderProgress() {
  const { done, total } = casp.progress(app.tool.definition, app.appraisal.answers);
  mount($("progress"), "已完成 ", h("strong", {}, `${done} / ${total}`), " 題");
}

function currentItemId() {
  return app.tool.definition.items[app.index]?.id ?? null;
}

function renderPaper() {
  const root = $("paper-pane");
  if (app.paper.kind === "mock") {
    renderMockPaper(root, app.paper.mockPaper, {
      lang: app.lang,
      evidenceFor: currentItemId(),
      showEvidence: app.showEvidence,
      onLang: (lang) => { app.lang = lang; renderPaper(); },
      onToggleEvidence: () => { app.showEvidence = !app.showEvidence; pref("evidence", app.showEvidence ? "1" : "0"); renderPaper(); },
    });
  } else if (!app.pdf) {
    renderPdfDropzone(root, {
      message: `作答已還原：「${app.appraisal.paperLabel}」。PDF 不會被保存，請重新選擇同一份檔案以閱讀原文。`,
      actionLabel: "載入這篇 PDF",
      onFile: (file) => loadPdfInto(file),
    });
  }
}

function candidatesState() {
  if (app.paper.kind !== "user-pdf" || !app.pdf) return null;
  if (app.pdf.status !== "ready") return { status: app.pdf.status };
  const item = app.tool.definition.items[app.index];
  if (!item) return null;
  return {
    status: "ready",
    keywords: item.keywords,
    items: findCandidates(app.pdf.pages, item.keywords),
    onJump: (n) => {
      setPane("paper");
      const pane = $("paper-pane");
      const page = $(`pdf-page-${n}`);
      if (page) pane.scrollTo({ top: Math.max(0, page.offsetTop - 60) });
    },
  };
}

function renderAppraisePane() {
  const def = app.tool.definition;
  const review = app.revealed ? buildReview(app.appraisal, def, app.paper) : null;
  renderAppraise($("appraise-pane"), def, app.appraisal, {
    index: app.index,
    progress: casp.progress(def, app.appraisal.answers),
    paperKind: app.paper.kind,
    mockPaper: app.paper.mockPaper,
    review: review?.mode === "compare" ? review : null,
    candidates: candidatesState(),
    onGo: (i) => {
      app.index = Math.max(0, Math.min(i, def.items.length));
      renderAppraisePane();
      renderPaper();
      app.pdf?.viewer?.setKeywords(def.items[app.index]?.keywords ?? []);
      $("appraise-pane").scrollTop = 0;
    },
    onAnswer: (itemId, value) => {
      app.appraisal.answers = casp.setAnswer(def, app.appraisal.answers, itemId, value);
      persist();
      renderProgress();
      renderAppraisePane();
    },
    onConsider: (itemId, i, checked) => {
      const set = new Set(app.appraisal.considerChecks[itemId] ?? []);
      checked ? set.add(i) : set.delete(i);
      if (set.size) app.appraisal.considerChecks[itemId] = [...set].sort((a, b) => a - b);
      else delete app.appraisal.considerChecks[itemId];
      persist();
    },
    onNote: (itemId, text) => {
      if (text) app.appraisal.notes[itemId] = text;
      else delete app.appraisal.notes[itemId];
      persist();
    },
    onSummary: (field, text) => {
      app.appraisal.toolData.summary[field] = text;
      persist();
    },
    onReveal: () => {
      if (!casp.isComplete(def, app.appraisal.answers) || app.paper.kind !== "mock") return;
      app.revealed = true;
      renderAppraisePane();
    },
  });
}

function renderAll() {
  renderBanners();
  renderSetup();
  renderPaper();
  renderAppraisePane();
}

function setPane(pane) {
  app.pane = pane;
  document.querySelector(".workspace").dataset.pane = pane;
  $("tab-paper").setAttribute("aria-selected", String(pane === "paper"));
  $("tab-appraise").setAttribute("aria-selected", String(pane === "appraise"));
}

// ---------- PDF ----------

async function loadPdfInto(file) {
  const root = $("paper-pane");
  mount(root, h("p", { class: "dropzone" }, "正在開啟 PDF…"));
  try {
    const { doc } = await openPdf(file);
    const viewer = createPdfViewer(root, doc, {
      zoom: Number(pref("pdfZoom")) || 1,
      onZoom: (z) => pref("pdfZoom", String(z)),
    });
    app.pdf = { doc, pages: [], status: "loading", viewer };
    renderAppraisePane();
    viewer.setKeywords(app.tool.definition.items[app.index]?.keywords ?? []);
    viewer.render().catch(() => {}); // 頁面影像可晚到；文字擷取不等它
    const pages = await extractText(doc);
    app.pdf.pages = pages;
    app.pdf.status = hasTextLayer(pages) ? "ready" : "no-text";
  } catch (err) {
    app.pdf = null;
    showPdfError(root, err.message, (f) => loadPdfInto(f));
  }
  renderAppraisePane();
}

async function uploadNewPdf(file) {
  if (!file) return;
  const paperRef = USER_PDF_PREFIX + crypto.randomUUID();
  const label = file.name.slice(0, 200) || "未命名 PDF";
  app.pdf = null;
  await openAppraisal(app.tool.toolId, paperRef, label);
  persist();
  setPane("paper");
  await loadPdfInto(file);
  renderSetup();
}

// ---------- 列印 ----------

function preparePrint() {
  if (!app.tool || !app.appraisal) return;
  const def = app.tool.definition;
  renderReport($("print-root"), def, app.appraisal, casp.progress(def, app.appraisal.answers));
}

// ---------- 事件 ----------

function bind() {
  $("tool-select").addEventListener("change", async (e) => {
    const tool = getTool(e.target.value);
    const ref = rememberedPaper(tool);
    app.pdf = null;
    await openAppraisal(tool.toolId, ref, labelFor(tool, ref));
  });

  $("paper-select").addEventListener("change", async (e) => {
    const ref = e.target.value;
    app.pdf = null;
    await openAppraisal(app.tool.toolId, ref, labelFor(app.tool, ref));
  });

  $("pdf-input").addEventListener("change", (e) => {
    uploadNewPdf(e.target.files[0]);
    e.target.value = "";
  });

  $("reviewer-input").addEventListener("input", (e) => {
    app.appraisal.metadata.reviewerName = e.target.value.slice(0, 100);
    persist();
  });
  $("date-input").addEventListener("change", (e) => {
    app.appraisal.metadata.appraisalDate = e.target.value;
    persist();
  });

  $("btn-export").addEventListener("click", () => download(exportFileName(app.appraisal), serializeAppraisal(app.appraisal)));

  $("btn-report").addEventListener("click", () => {
    renderReport($("report-body"), app.tool.definition, app.appraisal, casp.progress(app.tool.definition, app.appraisal.answers));
    $("report-dialog").showModal();
  });
  $("btn-close-report").addEventListener("click", () => $("report-dialog").close());
  $("btn-print").addEventListener("click", () => {
    preparePrint();
    window.print();
  });
  // Ctrl+P 也印報告（不論對話框是否開著），版面一致
  window.addEventListener("beforeprint", preparePrint);

  $("btn-reset").addEventListener("click", async () => {
    const ok = confirm("清除這篇文獻的所有作答、筆記與摘要？此動作無法復原。");
    if (!ok) return;
    store.remove(appraisalKey(app.appraisal.toolId, app.appraisal.paperRef));
    const { toolId, paperRef, paperLabel } = app.appraisal;
    await openAppraisal(toolId, paperRef, paperLabel); // user-pdf 的 app.pdf 保留，不需重新上傳
  });

  $("tab-paper").addEventListener("click", () => setPane("paper"));
  $("tab-appraise").addEventListener("click", () => setPane("appraise"));

  const setMode = (mode) => {
    const instructor = mode === "instructor";
    $("view-learner").hidden = instructor;
    $("view-instructor").hidden = !instructor;
    $("banners").hidden = instructor;
    $("mode-learner").setAttribute("aria-pressed", String(!instructor));
    $("mode-instructor").setAttribute("aria-pressed", String(instructor));
    if (instructor && !$("view-instructor").childElementCount) renderInstructor($("view-instructor"));
  };
  $("mode-learner").addEventListener("click", () => setMode("learner"));
  $("mode-instructor").addEventListener("click", () => setMode("instructor"));

  $("theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    pref("theme", root.dataset.theme);
  });
}

// ---------- 文獻／評讀分隔線（寬度為 per-viewer 偏好） ----------

const APPRAISE_DEFAULT = 460;

function setAppraiseWidth(px, save = false) {
  const ws = document.querySelector(".workspace");
  const max = Math.max(340, Math.min(900, ws.clientWidth - 320));
  const width = Math.round(Math.min(max, Math.max(340, px)));
  ws.style.setProperty("--appraise-w", `${width}px`);
  $("splitter").setAttribute("aria-valuenow", String(width));
  if (save) pref("appraiseWidth", String(width));
  return width;
}

function bindSplitter() {
  const splitter = $("splitter");
  const ws = document.querySelector(".workspace");
  setAppraiseWidth(Number(pref("appraiseWidth")) || APPRAISE_DEFAULT);
  splitter.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    splitter.setPointerCapture(e.pointerId);
    ws.classList.add("is-resizing");
    const move = (ev) => setAppraiseWidth(ws.getBoundingClientRect().right - ev.clientX);
    const up = (ev) => {
      setAppraiseWidth(ws.getBoundingClientRect().right - ev.clientX, true);
      ws.classList.remove("is-resizing");
      splitter.removeEventListener("pointermove", move);
      splitter.removeEventListener("pointerup", up);
    };
    splitter.addEventListener("pointermove", move);
    splitter.addEventListener("pointerup", up);
  });
  splitter.addEventListener("keydown", (e) => {
    const now = Number(splitter.getAttribute("aria-valuenow")) || APPRAISE_DEFAULT;
    if (e.key === "ArrowLeft") setAppraiseWidth(now + 20, true);
    else if (e.key === "ArrowRight") setAppraiseWidth(now - 20, true);
    else return;
    e.preventDefault();
  });
  splitter.addEventListener("dblclick", () => setAppraiseWidth(APPRAISE_DEFAULT, true));
  window.addEventListener("resize", () => setAppraiseWidth(Number(splitter.getAttribute("aria-valuenow")) || APPRAISE_DEFAULT));
}

// ---------- 啟動 ----------

async function start() {
  bind();
  bindSplitter();
  setPane("paper");
  app.showEvidence = pref("evidence") !== "0";
  const tool = getTool(pref("tool")) ?? tools.find((t) => t.status === "ready");
  const ref = rememberedPaper(tool);
  await openAppraisal(tool.toolId, ref, labelFor(tool, ref));
}

start().catch((err) => {
  mount($("banners"), h("div", { class: "banner banner--error", role: "alert" }, h("span", { class: "banner__text" }, `啟動失敗：${err.message}。請重新整理頁面；若持續發生，請清除本網站資料。`)));
  $("banners").hidden = false;
});
