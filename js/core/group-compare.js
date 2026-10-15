// 指導者多組比較（docs/feature-group-compare.md）：匯入分級把關＋逐題組間分歧判定。純函式，不碰 DOM。

import { parseAppraisal } from "./appraisal.js";
import { appraisalRows } from "./compare.js";
import { canonicalJSON } from "./canonical.js";
import { getAdapter } from "../engines/index.js";
import { UNANSWERED } from "../engines/common.js";

export const MIN_GROUPS = 2;
export const MAX_GROUPS = 4;

// RoB 2：Y≡PY、N≡PN；NI、免答各自是一種答案
const EQUIV = { PY: "Y", PN: "N" };
const normalize = (answer) => EQUIV[answer] ?? answer;

// answers：各組在同一題的作答（含 unanswered）
// 回傳 status："agree"｜"partial"｜"full"｜"none"（沒有任何組作答）
export function divergence(answers) {
  const answered = answers.filter((a) => a !== UNANSWERED);
  const distinct = new Set(answered.map(normalize)).size;
  const unanswered = answers.length - answered.length;
  let status;
  if (answered.length === 0) status = "none";
  else if (distinct === 1) status = "agree";
  else if (distinct === answered.length) status = "full";
  else status = "partial";
  return { status, unanswered, distinct };
}

export const isDivergent = (status) => status === "partial" || status === "full";

// 文獻同一性：範例文獻看 paperRef；自己上傳的 PDF 每人 UUID 不同，只能看檔名（paperLabel）
function paperIdentity(parsed) {
  return parsed.paper.kind === "mock" ? parsed.value.paperRef : `user-pdf:${parsed.value.paperLabel.trim()}`;
}

// 重複檔案：除匯出時間外內容完全相同
function contentKey(value) {
  const { exportedAt, ...rest } = value;
  return canonicalJSON(rest);
}

function parseFailure(errors) {
  if (errors.some((e) => e.code === "hash-mismatch")) {
    return "題目或參考答案內容與產生此檔時不同（雜湊不符），可能是舊版工具匯出的檔案";
  }
  const first = errors[0];
  const detail = first ? (first.path ? `${first.path}：${first.message}` : first.message) : "未知錯誤";
  return `格式錯誤：${detail}${errors.length > 1 ? `（另有 ${errors.length - 1} 項）` : ""}`;
}

export function defaultGroupName(fileName, value) {
  return value.metadata.reviewerName.trim() || fileName.replace(/\.json$/i, "") || "未命名";
}

// files：[{ name, text }]，依選取順序；第一份成功匯入者為比較基準
// 回傳 { groups: [{ fileName, name, parsed }], rejected: [{ fileName, reason }], ready }
export async function admitFiles(files) {
  const groups = [];
  const rejected = [];
  const seen = new Set();
  for (const file of files) {
    const reject = (reason) => rejected.push({ fileName: file.name, reason });
    if (typeof file.text !== "string") {
      reject(`無法讀取檔案${file.error ? `：${file.error}` : ""}`);
      continue;
    }
    const parsed = await parseAppraisal(file.text);
    if (!parsed.ok) {
      reject(parseFailure(parsed.errors));
      continue;
    }
    const base = groups[0]?.parsed;
    if (base && parsed.value.toolId !== base.value.toolId) {
      reject(`評讀工具不同：此檔為 ${parsed.tool.definition.shortTitle.zh}，基準檔為 ${base.tool.definition.shortTitle.zh}`);
      continue;
    }
    if (base && paperIdentity(parsed) !== paperIdentity(base)) {
      reject(`文獻不同：此檔為「${parsed.value.paperLabel}」，基準檔為「${base.value.paperLabel}」`);
      continue;
    }
    const key = contentKey(parsed.value);
    if (seen.has(key)) {
      reject("與已匯入的檔案內容完全相同（重複檔案）");
      continue;
    }
    if (groups.length >= MAX_GROUPS) {
      reject(`超過 ${MAX_GROUPS} 組上限`);
      continue;
    }
    seen.add(key);
    groups.push({ fileName: file.name, name: defaultGroupName(file.name, parsed.value), parsed });
  }
  return { groups, rejected, ready: groups.length >= MIN_GROUPS };
}

// 逐題並排：維持原題序；rows[i].cells[g] 對應 groups[g]
export function buildGroupCompare(groups) {
  const { tool, paper } = groups[0].parsed;
  const def = tool.definition;
  const perGroup = groups.map((g) => appraisalRows(g.parsed.value, def));
  const rows = perGroup[0].map((row, i) => {
    const cells = perGroup.map((rows) => ({ answer: rows[i].student, note: rows[i].note }));
    return {
      kind: row.kind,
      itemId: row.itemId,
      number: row.number,
      question: row.question,
      cells,
      ...divergence(cells.map((c) => c.answer)),
    };
  });
  const count = (s) => rows.filter((r) => r.status === s).length;
  return {
    definition: def,
    paper,
    // 範例文獻才有參考答案；自己上傳的 PDF 只能依檔名推定同一篇
    hasReference: paper.kind === "mock" && Boolean(paper.reference),
    needsManualCheck: paper.kind === "user-pdf",
    progress: groups.map((g) => getAdapter(def).progress(def, g.parsed.value)),
    rows,
    totals: { agree: count("agree"), partial: count("partial"), full: count("full"), none: count("none") },
  };
}
