// 匯出 JSON 驗證（docs/schema.md）：指導者匯入與 localStorage 載入共用

import { getTool, resolvePaper } from "../tools/registry.js";
import { contentHash } from "./canonical.js";
import { getAdapter, checkKeys, checkText } from "../engines/index.js";

export const SCHEMA_VERSION = 1;
const TOP_KEYS = ["schemaVersion", "toolId", "toolVersion", "contentHash", "paperRef", "paperLabel", "metadata", "answers", "notes", "considerChecks", "toolData", "exportedAt"];
const META_KEYS = ["reviewerName", "appraisalDate"];
const HASH_RE = /^sha256:[0-9a-f]{64}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function isValidDate(s) {
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function checkStructure(data, errors) {
  checkKeys(data, TOP_KEYS, "", errors);
  if (!Number.isInteger(data.schemaVersion)) errors.push({ path: "schemaVersion", message: "必須是整數" });
  else if (data.schemaVersion > SCHEMA_VERSION) errors.push({ path: "schemaVersion", message: `檔案由較新版本產生（${data.schemaVersion}），本工具只支援 ${SCHEMA_VERSION}` });
  else if (data.schemaVersion < 1) errors.push({ path: "schemaVersion", message: "不支援的版本" });
  for (const k of ["toolId", "toolVersion", "contentHash", "paperRef", "exportedAt"]) {
    if (k in data && typeof data[k] !== "string") errors.push({ path: k, message: "必須是字串" });
  }
  if (typeof data.contentHash === "string" && !HASH_RE.test(data.contentHash)) errors.push({ path: "contentHash", message: "格式必須是 sha256:<64 位 hex>" });
  if (typeof data.exportedAt === "string" && Number.isNaN(Date.parse(data.exportedAt))) errors.push({ path: "exportedAt", message: "不是有效的日期時間" });
  if ("paperLabel" in data) checkText(data.paperLabel, "paperLabel", errors, { min: 1, max: 200 });
  if (!isObj(data.metadata)) errors.push({ path: "metadata", message: "必須是物件" });
  else {
    checkKeys(data.metadata, META_KEYS, "metadata.", errors);
    if ("reviewerName" in data.metadata) checkText(data.metadata.reviewerName, "metadata.reviewerName", errors, { max: 100 });
    const date = data.metadata.appraisalDate;
    if ("appraisalDate" in data.metadata && !(date === "" || (typeof date === "string" && isValidDate(date)))) {
      errors.push({ path: "metadata.appraisalDate", message: "必須是空字串或 YYYY-MM-DD 的合法日期" });
    }
  }
  for (const k of ["answers", "notes", "considerChecks", "toolData"]) {
    if (k in data && !isObj(data[k])) errors.push({ path: k, message: "必須是物件" });
  }
}

const fail = (errors) => ({ ok: false, errors });

// 回傳 { ok: true, value, tool, paper } 或 { ok: false, errors: [{ path, message }] }
export async function validateAppraisal(data) {
  if (!isObj(data)) return fail([{ path: "", message: "最外層必須是 JSON 物件" }]);
  const errors = [];
  checkStructure(data, errors);
  if (errors.length) return fail(errors);

  const tool = getTool(data.toolId);
  if (!tool) return fail([{ path: "toolId", message: `未知或尚未上線的工具：${data.toolId}` }]);
  if (data.toolVersion !== tool.definition.toolVersion) {
    return fail([{ path: "toolVersion", message: `版本不符：檔案為 ${data.toolVersion}，目前為 ${tool.definition.toolVersion}` }]);
  }
  const paper = resolvePaper(tool, data.paperRef);
  if (paper.kind === "invalid") return fail([{ path: "paperRef", message: `找不到對應的文獻：${data.paperRef}` }]);

  getAdapter(tool.definition).validate(data, tool.definition, errors);
  if (errors.length) return fail(errors);

  const expected = await contentHash(tool.definition, paper.mockPaper, paper.reference);
  if (data.contentHash !== expected) {
    return fail([{ path: "contentHash", message: "題目或參考答案內容與產生此檔時不同，無法比對" }]);
  }
  return { ok: true, value: data, tool, paper };
}
