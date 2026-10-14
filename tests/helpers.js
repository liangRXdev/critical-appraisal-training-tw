import { readFile } from "node:fs/promises";
import { contentHash } from "../js/core/canonical.js";
import { getTool, resolvePaper } from "../js/tools/registry.js";
import { CASP_VALUES, NOT_APPLICABLE, invariantErrors } from "../js/engines/casp.js";

// 讀手寫 fixture，並把 "__CURRENT__" 換成目前內容雜湊（雜湊不符的拒絕另有測試）
export async function loadFixture(name) {
  const data = JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
  if (data.contentHash === "__CURRENT__") {
    const tool = getTool(data.toolId);
    const paper = resolvePaper(tool, data.paperRef);
    data.contentHash = await contentHash(tool.definition, paper.mockPaper, paper.reference);
  }
  return data;
}

const PLACEHOLDER = /^(todo|tbd|n\/?a|待補|待填|xxx|-+|\.+)$/i;
const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0 && !PLACEHOLDER.test(s.trim());

// C1–C3：參考答案完整性。回傳錯誤字串陣列
export function referenceErrors(definition, mockPaper, reference) {
  const errors = [];
  const paragraphs = mockPaper.sections.flatMap((s) => s.paragraphs);
  const ids = definition.items.map((i) => i.id);
  for (const id of ids) {
    const r = reference.answers[id];
    if (!r) { errors.push(`${id}: 缺參考答案`); continue; }
    if (![...CASP_VALUES, NOT_APPLICABLE].includes(r.answer)) errors.push(`${id}: 判斷值不合法 ${r.answer}`);
    if (!nonEmpty(r.rationale)) errors.push(`${id}: 理由為空或占位字`);
    if (!Array.isArray(r.sources) || r.sources.length === 0) errors.push(`${id}: 無來源`);
    for (const s of r.sources ?? []) {
      if (s.type === "mock") {
        const p = paragraphs.find((x) => x.id === s.paragraphId);
        if (!p) errors.push(`${id}: 段落 ${s.paragraphId} 不存在`);
        else if (!p.items.includes(id)) errors.push(`${id}: 段落 ${s.paragraphId} 不在本題允許引用集合`);
      } else if (s.type === "doc") {
        if (!nonEmpty(s.citation) || !nonEmpty(s.locator)) errors.push(`${id}: 文件來源缺 citation 或 locator`);
      } else errors.push(`${id}: 未知來源類型 ${s.type}`);
    }
  }
  for (const id of Object.keys(reference.answers)) if (!ids.includes(id)) errors.push(`${id}: 多出的參考答案`);
  const answers = Object.fromEntries(ids.map((id) => [id, reference.answers[id]?.answer]));
  for (const e of invariantErrors(definition, answers)) errors.push(`${e.path}: ${e.message}`);
  for (const f of definition.summaryFields) if (!nonEmpty(reference.summary?.[f.id])) errors.push(`summary.${f.id}: 為空`);
  return errors;
}

// C4：雙語與官方原文欄位
export function definitionErrors(definition) {
  const errors = [];
  const both = (obj, where) => {
    if (!obj || !nonEmpty(obj.en)) errors.push(`${where}: 缺英文（官方原文）`);
    if (!obj || !nonEmpty(obj.zh)) errors.push(`${where}: 缺繁中`);
  };
  both(definition.title, "title");
  for (const s of definition.sections) {
    both(s.title, `section ${s.id}`);
    if (s.note !== null) both(s.note, `section ${s.id} note`);
  }
  for (const item of definition.items) {
    if (!definition.sections.some((s) => s.id === item.section)) errors.push(`${item.id}: section 不存在`);
    both(item.question, `${item.id}.question`);
    if (item.parent) both(item.parent, `${item.id}.parent`);
    if (item.considerIntro !== null) both(item.considerIntro, `${item.id}.considerIntro`);
    if (!Array.isArray(item.consider) || item.consider.length === 0) errors.push(`${item.id}: 無 consider`);
    item.consider?.forEach((c, i) => both(c, `${item.id}.consider[${i}]`));
    if (!(item.teaching === null || nonEmpty(item.teaching))) errors.push(`${item.id}: teaching 必須是 null 或非空字串`);
    if (!Array.isArray(item.keywords) || item.keywords.length === 0) errors.push(`${item.id}: 無關鍵字`);
  }
  const dup = definition.items.map((i) => i.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) errors.push(`重複題目 id：${dup.join(", ")}`);
  return errors;
}

export const clone = (x) => structuredClone(x);
