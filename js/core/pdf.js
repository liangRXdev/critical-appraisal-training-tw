// PDF 檢視與關鍵字候選句子：只在瀏覽器本機處理，不送出任何檔案內容（SPEC D6）

const PDFJS_VERSION = "3.11.174";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
let loading = null;

function loadPdfJs() {
  if (globalThis.pdfjsLib) return Promise.resolve(globalThis.pdfjsLib);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PDFJS_BASE}/pdf.min.js`;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (!globalThis.pdfjsLib) return reject(new Error("PDF.js 載入後無法使用"));
      globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      resolve(globalThis.pdfjsLib);
    };
    script.onerror = () => {
      loading = null;
      reject(new Error("無法載入 PDF 檢視元件（可能是網路或防火牆阻擋 cdnjs.cloudflare.com）"));
    };
    document.head.append(script);
  });
  return loading;
}

function describeError(err) {
  const name = err?.name ?? "";
  if (name === "PasswordException") return "PDF 有密碼保護，請先移除密碼再上傳";
  if (name === "InvalidPDFException") return "檔案不是有效的 PDF，或已損壞";
  return err?.message || "PDF 讀取失敗";
}

// 回傳 { doc, pageCount }；失敗時拋出可直接顯示的訊息
export async function openPdf(file) {
  if (!file) throw new Error("沒有選擇檔案");
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) throw new Error("只接受 PDF 檔案");
  const lib = await loadPdfJs();
  try {
    const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    if (doc.numPages === 0) throw new Error("PDF 沒有任何頁面");
    return { doc, pageCount: doc.numPages };
  } catch (err) {
    throw new Error(describeError(err));
  }
}

// 渲染單頁：canvas（影像）＋ textLayer（透明文字，供關鍵字高亮）。回傳該頁的文字 span 陣列
export async function renderPage(doc, pageNumber, pageEl, width) {
  const lib = globalThis.pdfjsLib;
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const cssViewport = page.getViewport({ scale: width / base.width });
  const ratio = globalThis.devicePixelRatio || 1;
  const pixelViewport = page.getViewport({ scale: (width / base.width) * ratio });

  const canvas = document.createElement("canvas");
  canvas.width = pixelViewport.width;
  canvas.height = pixelViewport.height;
  canvas.style.width = `${cssViewport.width}px`;
  canvas.style.height = `${cssViewport.height}px`;
  const textLayer = document.createElement("div");
  textLayer.className = "textLayer";
  pageEl.style.width = `${cssViewport.width}px`;
  pageEl.style.height = `${cssViewport.height}px`;
  pageEl.style.setProperty("--scale-factor", String(cssViewport.scale));
  pageEl.replaceChildren(canvas, textLayer);

  // canvas 與文字層並行：canvas 渲染依賴 requestAnimationFrame（分頁在背景時會暫停），
  // 文字層不需要，先完成才能讓關鍵字高亮與候選句子不被畫面渲染卡住
  const textDivs = [];
  const text = page
    .getTextContent()
    .then((content) => lib.renderTextLayer({ textContentSource: content, container: textLayer, viewport: cssViewport, textDivs }).promise)
    .catch(() => {}); // 文字層失敗不影響閱讀，只是無法高亮
  const image = page.render({ canvasContext: canvas.getContext("2d"), viewport: pixelViewport }).promise;
  await text;
  return { textDivs, image };
}

// 將含任一關鍵字的文字 span 標為螢光黃（整段 span，PDF 文字切分以行或片段為單位）
export function highlightTextDivs(textDivs, keywords) {
  const lowered = keywords.map((k) => k.toLowerCase());
  let hits = 0;
  for (const div of textDivs) {
    const text = div.textContent.toLowerCase();
    const hit = lowered.length > 0 && lowered.some((k) => text.includes(k));
    div.classList.toggle("kw-hit", hit);
    if (hit) hits++;
  }
  return hits;
}

export async function extractText(doc) {
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    pages.push({ pageNumber: n, text: content.items.map((i) => i.str).join(" ") });
  }
  return pages;
}

// 純關鍵字比對：回傳含關鍵字的句子，不做任何判斷（SPEC N4、P3）
export function findCandidates(pages, keywords, limit = 6) {
  const out = [];
  const lowered = keywords.map((k) => k.toLowerCase());
  for (const { pageNumber, text } of pages) {
    const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?。！？；])\s+/);
    for (const sentence of sentences) {
      const s = sentence.trim();
      if (s.length < 20) continue;
      const lower = s.toLowerCase();
      const hit = keywords.find((_, i) => lower.includes(lowered[i]));
      if (hit) out.push({ pageNumber, sentence: s.length > 320 ? s.slice(0, 317) + "…" : s, keyword: hit });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function hasTextLayer(pages) {
  return pages.some((p) => p.text.replace(/\s/g, "").length > 50);
}
