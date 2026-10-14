// 左欄：mock paper（期刊排版 + 螢光筆證據）或使用者 PDF

import { h, mount } from "../core/dom.js";
import { renderPage } from "../core/pdf.js";

export function renderMockPaper(root, mockPaper, { lang, evidenceFor, showEvidence, onLang, onToggleEvidence }) {
  const langBtn = (value, text) =>
    h("button", { type: "button", "aria-pressed": String(lang === value), onclick: () => onLang(value) }, text);

  const paragraphs = mockPaper.sections.map((section) => [
    h("h2", {}, lang === "en" ? section.heading.en : section.heading.zh),
    section.paragraphs.map((p) => {
      const evidence = showEvidence && evidenceFor && p.items.includes(evidenceFor);
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

  if (showEvidence && evidenceFor) {
    // 只捲動文獻窗格本身，不帶動整頁（手機版窗格不是捲動容器，則不動）
    const first = root.querySelector(".is-evidence");
    if (first && root.scrollHeight > root.clientHeight) {
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.scrollTo({ top: Math.max(0, first.offsetTop - root.clientHeight / 3), behavior: smooth ? "smooth" : "auto" });
    }
  }
}

export function renderPdfDropzone(root, { message, actionLabel, onFile }) {
  const input = h("input", { type: "file", accept: "application/pdf,.pdf", hidden: true, onchange: (e) => onFile(e.target.files[0]) });
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

export async function renderPdf(root, pdf) {
  const wrap = h("div", { class: "pdf" });
  mount(root, wrap);
  const width = Math.min(root.clientWidth - 40, 900);
  for (let n = 1; n <= pdf.doc.numPages; n++) {
    const canvas = h("canvas", { id: `pdf-page-${n}`, "aria-label": `第 ${n} 頁` });
    wrap.append(h("span", { class: "pdf__page-label" }, `第 ${n} / ${pdf.doc.numPages} 頁`), canvas);
    await renderPage(pdf.doc, n, canvas, width);
  }
}

export function showPdfError(root, message, onFile) {
  renderPdfDropzone(root, { message: `無法開啟 PDF：${message}。你仍可在右側作答與匯出。`, actionLabel: "改選其他 PDF", onFile });
}
