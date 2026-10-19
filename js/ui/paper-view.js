// 左欄：mock paper（期刊排版 + 螢光筆證據）或使用者 PDF

import { h, mount } from "../core/dom.js";
import { renderPage, highlightTextDivs } from "../core/pdf.js";

export function renderMockPaper(root, mockPaper, { lang, evidenceFor, showEvidence, onLang, onToggleEvidence }) {
  const langBtn = (value, text) =>
    h("button", { type: "button", "aria-pressed": String(lang === value), onclick: () => onLang(value) }, text);

  const paragraphs = mockPaper.sections.map((section) => [
    h("h2", {}, lang === "en" ? section.heading.en : section.heading.zh),
    section.paragraphs.map((p) => {
      const targets = Array.isArray(evidenceFor) ? evidenceFor : evidenceFor ? [evidenceFor] : [];
      const evidence = showEvidence && p.items.some((it) => targets.includes(it));
      return h(
        "p",
        { id: `para-${p.id}`, class: [lang === "en" ? "is-en" : "", evidence ? "is-evidence" : ""].join(" ").trim(), dataset: { paragraph: p.id } },
        h("span", { class: "mark" }, lang === "en" ? p.en : p.zh)
      );
    }),
  ]);

  mount(
    root,
    h(
      "div",
      { class: "paper" },
      h("p", { class: "paper__fiction" }, "虛構教學範例：作者、期刊、註冊號與數據皆為虛構，請勿作為臨床依據。"),
      h("h1", { class: "paper__title" }, mockPaper.title.zh),
      h("p", { class: "paper__title-en" }, mockPaper.title.en),
      h("p", { class: "paper__byline" }, mockPaper.byline),
      h(
        "div",
        { class: "paper__lang", role: "group", "aria-label": "文獻語言" },
        langBtn("zh", "中文"),
        langBtn("en", "English"),
        h("button", { type: "button", "aria-pressed": String(showEvidence), onclick: onToggleEvidence, title: "以螢光筆標出與目前題目相關的段落" }, "標出相關段落")
      ),
      paragraphs
    )
  );

  if (showEvidence && (Array.isArray(evidenceFor) ? evidenceFor.length : evidenceFor)) {
    // 只捲動文獻窗格本身，不帶動整頁（手機版窗格不是捲動容器，則不動）
    const first = root.querySelector(".is-evidence");
    if (first && root.scrollHeight > root.clientHeight) {
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.scrollTo({ top: Math.max(0, first.offsetTop - root.clientHeight / 3), behavior: smooth ? "smooth" : "auto" });
    }
  }
}

export function renderPdfDropzone(root, { message, actionLabel, onFile }) {
  const input = h("input", { type: "file", accept: "application/pdf,.pdf", hidden: true, onchange: (e) => { onFile(e.target.files[0]); e.target.value = ""; } });
  const zone = h(
    "div",
    {
      class: "dropzone",
      ondragover: (e) => { e.preventDefault(); zone.classList.add("is-over"); },
      ondragleave: () => zone.classList.remove("is-over"),
      ondrop: (e) => { e.preventDefault(); zone.classList.remove("is-over"); onFile(e.dataTransfer.files[0]); },
    },
    h("p", {}, message),
    h("label", { class: "btn btn--primary" }, actionLabel, input),
    h("p", { class: "candidates__note" }, "PDF 只在你的瀏覽器中開啟，不會上傳到任何伺服器。")
  );
  mount(root, zone);
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

// PDF 檢視器：縮放工具列（固定在窗格上緣）＋ 逐頁渲染 ＋ 關鍵字螢光高亮
export function createPdfViewer(root, doc, { zoom = 1, onZoom } = {}) {
  let current = zoom;
  let keywords = [];
  let renderToken = 0;
  const pageText = new Map(); // pageNumber → textDivs

  const label = h("span", { class: "pdf-toolbar__zoom", "aria-live": "polite" });
  const hitsLabel = h("span", { class: "pdf-toolbar__hits" });
  const setZoom = (z) => {
    current = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100));
    onZoom?.(current);
    render();
  };
  const step = (dir) => {
    const next = dir > 0 ? ZOOM_STEPS.find((s) => s > current + 0.001) : [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001);
    if (next) setZoom(next);
  };
  const toolbar = h(
    "div",
    { class: "pdf-toolbar", role: "toolbar", "aria-label": "PDF 檢視" },
    h("button", { type: "button", class: "btn btn--quiet", "aria-label": "縮小", onclick: () => step(-1) }, "−"),
    label,
    h("button", { type: "button", class: "btn btn--quiet", "aria-label": "放大", onclick: () => step(1) }, "＋"),
    h("button", { type: "button", class: "btn btn--quiet", onclick: () => setZoom(1) }, "符合寬度"),
    hitsLabel
  );
  const pages = h("div", { class: "pdf" });
  mount(root, toolbar, pages);

  function applyHighlights() {
    let hits = 0;
    for (const divs of pageText.values()) hits += highlightTextDivs(divs, keywords);
    hitsLabel.textContent = keywords.length ? `關鍵字標示 ${hits} 處` : "";
  }

  async function render() {
    const token = ++renderToken;
    label.textContent = `${Math.round(current * 100)}%`;
    const fitWidth = Math.max(240, Math.min(root.clientWidth - 40, 900));
    const width = fitWidth * current;
    const anchor = root.scrollHeight ? root.scrollTop / root.scrollHeight : 0;
    pageText.clear();
    pages.replaceChildren();
    const images = [];
    for (let n = 1; n <= doc.numPages; n++) {
      if (token !== renderToken) return; // 期間又縮放了，放棄舊的渲染
      const pageEl = h("div", { class: "pdf__page", id: `pdf-page-${n}`, "aria-label": `第 ${n} 頁` });
      pages.append(h("span", { class: "pdf__page-label" }, `第 ${n} / ${doc.numPages} 頁`), pageEl);
      const { textDivs, image } = await renderPage(doc, n, pageEl, width);
      pageText.set(n, textDivs);
      images.push(image.catch(() => {}));
      if (n === 1) root.scrollTop = anchor * root.scrollHeight;
    }
    if (token !== renderToken) return;
    applyHighlights();
    await Promise.all(images);
  }

  return {
    render,
    setKeywords(next) {
      keywords = next ?? [];
      applyHighlights();
    },
  };
}

export function showPdfError(root, message, onFile) {
  renderPdfDropzone(root, { message: `無法開啟 PDF：${message}。你仍可在右側作答與匯出。`, actionLabel: "改選其他 PDF", onFile });
}
