// 依 definition.engine 分派：初始狀態、完成度、內容驗證（docs/schema.md §3、§5）

import * as casp from "./casp.js";
import * as rob2 from "./rob2.js";
import * as grade from "./grade.js";

const MAX_TEXT = 4000;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function checkKeys(obj, allowed, path, errors) {
  for (const k of allowed) if (!(k in obj)) errors.push({ path: path + k, message: "缺少必填欄位" });
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) errors.push({ path: path + k, message: "未定義的欄位" });
}

export function checkText(value, path, errors, { min = 0, max = MAX_TEXT } = {}) {
  if (typeof value !== "string") return errors.push({ path, message: "必須是字串" });
  if (value.length < min || value.length > max) errors.push({ path, message: `長度必須在 ${min}–${max} 字元` });
}

function checkAnswerKeys(data, ids, allowedValues, errors) {
  for (const id of ids) if (!(id in data.answers)) errors.push({ path: `answers.${id}`, message: "缺少題目" });
  for (const [id, value] of Object.entries(data.answers)) {
    if (!ids.includes(id)) errors.push({ path: `answers.${id}`, message: "未知題目" });
    else if (!allowedValues.includes(value)) errors.push({ path: `answers.${id}`, message: `值必須是 ${allowedValues.join("、")}` });
  }
}

function checkNotes(data, allowedKeys, errors) {
  for (const [id, value] of Object.entries(data.notes)) {
    if (!allowedKeys.includes(id)) errors.push({ path: `notes.${id}`, message: "未知題目" });
    else checkText(value, `notes.${id}`, errors);
  }
}

// ---------- CASP ----------

const caspAdapter = {
  emptyAnswers: (def) => casp.normalizeAnswers(def, casp.emptyAnswers(def)),
  emptyToolData: (def) => ({ summary: Object.fromEntries(def.summaryFields.map((f) => [f.id, ""])) }),
  progress: (def, a) => casp.progress(def, a.answers),
  isComplete: (def, a) => casp.isComplete(def, a.answers),
  validate(data, def, errors) {
    const ids = def.items.map((i) => i.id);
    checkAnswerKeys(data, ids, [...casp.CASP_VALUES, casp.UNANSWERED, casp.NOT_APPLICABLE], errors);
    if (errors.length === 0) errors.push(...casp.invariantErrors(def, data.answers));
    checkNotes(data, ids, errors);
    for (const [id, value] of Object.entries(data.considerChecks)) {
      const item = def.items.find((i) => i.id === id);
      if (!item) { errors.push({ path: `considerChecks.${id}`, message: "未知題目" }); continue; }
      const ok = Array.isArray(value) && new Set(value).size === value.length &&
        value.every((n) => Number.isInteger(n) && n >= 0 && n < item.consider.length);
      if (!ok) errors.push({ path: `considerChecks.${id}`, message: `必須是不重複的整數陣列，範圍 0–${item.consider.length - 1}` });
    }
    const td = data.toolData;
    checkKeys(td, ["summary"], "toolData.", errors);
    if (!isObj(td.summary)) { if ("summary" in td) errors.push({ path: "toolData.summary", message: "必須是物件" }); return; }
    const fields = def.summaryFields.map((f) => f.id);
    checkKeys(td.summary, fields, "toolData.summary.", errors);
    for (const f of fields) if (f in td.summary) checkText(td.summary[f], `toolData.summary.${f}`, errors);
  },
};

// ---------- RoB 2 ----------

const PRELIM_FIELDS = ["experimental", "comparator", "outcome", "numericalResult"];

const rob2Adapter = {
  emptyAnswers: (def) => rob2.normalizeAnswers(def, rob2.emptyAnswers(def)),
  emptyToolData: () => ({
    preliminary: Object.fromEntries(PRELIM_FIELDS.map((k) => [k, ""])),
    judgements: Object.fromEntries(rob2.JUDGEMENT_KEYS.map((k) => [k, rob2.UNANSWERED])),
    overrideReasons: Object.fromEntries(rob2.JUDGEMENT_KEYS.map((k) => [k, ""])),
  }),
  progress: (def, a) => rob2.progress(def, a),
  isComplete: (def, a) => rob2.isComplete(def, a),
  validate(data, def, errors) {
    const ids = rob2.allQuestions(def).map((q) => q.id);
    checkAnswerKeys(data, ids, [...rob2.SQ_VALUES, rob2.UNANSWERED, rob2.NOT_APPLICABLE], errors);
    if (errors.length === 0) errors.push(...rob2.invariantErrors(def, data.answers));
    checkNotes(data, [...ids, ...rob2.JUDGEMENT_KEYS], errors);
    if (Object.keys(data.considerChecks).length) errors.push({ path: "considerChecks", message: "RoB 2 沒有考量清單，必須是空物件" });
    const td = data.toolData;
    checkKeys(td, ["preliminary", "judgements", "overrideReasons"], "toolData.", errors);
    if (isObj(td.preliminary)) {
      checkKeys(td.preliminary, PRELIM_FIELDS, "toolData.preliminary.", errors);
      for (const k of PRELIM_FIELDS) if (k in td.preliminary) checkText(td.preliminary[k], `toolData.preliminary.${k}`, errors, { max: 500 });
    } else if ("preliminary" in td) errors.push({ path: "toolData.preliminary", message: "必須是物件" });
    if (isObj(td.judgements)) {
      checkKeys(td.judgements, rob2.JUDGEMENT_KEYS, "toolData.judgements.", errors);
      for (const k of rob2.JUDGEMENT_KEYS) {
        if (k in td.judgements && ![...rob2.JUDGEMENTS, rob2.UNANSWERED].includes(td.judgements[k])) {
          errors.push({ path: `toolData.judgements.${k}`, message: "值必須是 Low、Some concerns、High 或 unanswered" });
        }
      }
    } else if ("judgements" in td) errors.push({ path: "toolData.judgements", message: "必須是物件" });
    if (isObj(td.overrideReasons)) {
      checkKeys(td.overrideReasons, rob2.JUDGEMENT_KEYS, "toolData.overrideReasons.", errors);
      for (const k of rob2.JUDGEMENT_KEYS) if (k in td.overrideReasons) checkText(td.overrideReasons[k], `toolData.overrideReasons.${k}`, errors);
    } else if ("overrideReasons" in td) errors.push({ path: "toolData.overrideReasons", message: "必須是物件" });
  },
};

// ---------- GRADE ----------

const gradeAdapter = {
  emptyAnswers: (def) => grade.normalizeAnswers(def, grade.emptyAnswers(def)),
  emptyToolData: (def) => ({
    outcome: Object.fromEntries(def.outcomeFields.map((f) => [f.id, ""])),
    certainty: grade.UNANSWERED,
    overrideReason: "",
  }),
  progress: (def, a) => grade.progress(def, a),
  isComplete: (def, a) => grade.isComplete(def, a),
  validate(data, def, errors) {
    const ids = grade.itemIds(def);
    for (const id of ids) if (!(id in data.answers)) errors.push({ path: `answers.${id}`, message: "缺少項目" });
    for (const [id, value] of Object.entries(data.answers)) {
      if (!ids.includes(id)) { errors.push({ path: `answers.${id}`, message: "未知項目" }); continue; }
      const allowed = [...grade.allowedValues(def, id), grade.UNANSWERED, grade.NOT_APPLICABLE];
      if (!allowed.includes(value)) errors.push({ path: `answers.${id}`, message: `值必須是 ${allowed.join("、")}` });
    }
    if (errors.length === 0) errors.push(...grade.invariantErrors(def, data.answers));
    checkNotes(data, [...ids, "certainty"], errors);
    if (Object.keys(data.considerChecks).length) errors.push({ path: "considerChecks", message: "GRADE 沒有考量清單，必須是空物件" });
    const td = data.toolData;
    checkKeys(td, ["outcome", "certainty", "overrideReason"], "toolData.", errors);
    const fields = def.outcomeFields.map((f) => f.id);
    if (isObj(td.outcome)) {
      checkKeys(td.outcome, fields, "toolData.outcome.", errors);
      for (const k of fields) if (k in td.outcome) checkText(td.outcome[k], `toolData.outcome.${k}`, errors, { max: 500 });
    } else if ("outcome" in td) errors.push({ path: "toolData.outcome", message: "必須是物件" });
    if ("certainty" in td && ![...grade.CERTAINTIES, grade.UNANSWERED].includes(td.certainty)) {
      errors.push({ path: "toolData.certainty", message: "值必須是 High、Moderate、Low、Very low 或 unanswered" });
    }
    if ("overrideReason" in td) checkText(td.overrideReason, "toolData.overrideReason", errors);
  },
};

const adapters = { casp: caspAdapter, rob2: rob2Adapter, grade: gradeAdapter };

export function getAdapter(definition) {
  const adapter = adapters[definition.engine];
  if (!adapter) throw new Error(`未知的引擎：${definition.engine}`);
  return adapter;
}
