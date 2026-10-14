// 評讀狀態的建立、匯出、匯入（狀態物件與匯出 JSON 同一形狀，見 docs/schema.md）

import { SCHEMA_VERSION, validateAppraisal } from "./schema.js";
import { contentHash } from "./canonical.js";
import { resolvePaper } from "../tools/registry.js";
import { getAdapter } from "../engines/index.js";

export async function createAppraisal(tool, paperRef, paperLabel) {
  const paper = resolvePaper(tool, paperRef);
  if (paper.kind === "invalid") throw new Error(`無效的 paperRef：${paperRef}`);
  const def = tool.definition;
  return {
    schemaVersion: SCHEMA_VERSION,
    toolId: def.toolId,
    toolVersion: def.toolVersion,
    contentHash: await contentHash(def, paper.mockPaper, paper.reference),
    paperRef,
    paperLabel,
    metadata: { reviewerName: "", appraisalDate: "" },
    answers: getAdapter(def).emptyAnswers(def),
    notes: {},
    considerChecks: {},
    toolData: getAdapter(def).emptyToolData(def),
    exportedAt: new Date().toISOString(),
  };
}

export function serializeAppraisal(state) {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

// 回傳 validateAppraisal 的結果；非 JSON 也以同樣格式回報
export async function parseAppraisal(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, errors: [{ path: "", message: "檔案不是有效的 JSON" }] };
  }
  return validateAppraisal(data);
}

export function exportFileName(state) {
  const date = new Date().toISOString().slice(0, 10);
  const who = state.metadata.reviewerName.trim().replace(/[\\/:*?"<>|\s]+/g, "_") || "anonymous";
  return `${state.toolId}_${who}_${date}.json`;
}
