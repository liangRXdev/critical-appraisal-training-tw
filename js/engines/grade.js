// GRADE 引擎（單一 outcome）：研究設計 → 五個降級因素 → （適用時）三個升級因素 → 建議等級。
// 演算法只給「建議」；學員判斷由 UI 記錄，不一致時不判錯（SPEC §7.1）。
// 規則（SPEC §7.3）：
//   - 起始：rct → High、observational → Low；結果夾在 Very low 與 High 之間
//   - 各因素合法值由 definition.values 定義；非法值拒絕寫入，不靜默修正
//   - 升級只在 observational 且五個降級因素皆為 0 時可用（Handbook §5.3 p.24）；
//     RCT 一律不升級（D-G3 修訂：起始已是 High 且前提要求零降級，升級不可能改變結果）

import { UNANSWERED, NOT_APPLICABLE } from "./common.js";

export { UNANSWERED, NOT_APPLICABLE };
export const LEVELS = ["Very low", "Low", "Moderate", "High"];
export const CERTAINTIES = [...LEVELS].reverse(); // 介面順序：High → Very low
const START = { rct: 3, observational: 1 };
export const DESIGNS = Object.keys(START);

export function downgradeIds(def) {
  return def.downgrade.map((f) => f.id);
}

export function upgradeIds(def) {
  return def.upgrade.map((f) => f.id);
}

export function itemIds(def) {
  return [def.design.id, ...downgradeIds(def), ...upgradeIds(def)];
}

export function findFactor(def, id) {
  return [...def.downgrade, ...def.upgrade].find((f) => f.id === id) ?? null;
}

export function allowedValues(def, id) {
  if (id === def.design.id) return def.design.options.map((o) => o.value);
  const f = findFactor(def, id);
  if (!f) throw new Error(`未知項目：${id}`);
  return f.values;
}

const isUp = (def, id) => upgradeIds(def).includes(id);

// 升級欄位狀態：asked（可作答）、skipped（依規則不適用）、pending（研究設計或降級因素未完成）
// 其他項目一律 asked
export function askState(def, id, answers) {
  if (!isUp(def, id)) return "asked";
  return upgradeGate(def, answers).state;
}

// 升級閘門：回傳狀態與原因，UI 直接顯示 reason
export function upgradeGate(def, answers) {
  const design = answers[def.design.id];
  if (design === "rct") return { state: "skipped", reason: "rct" };
  const downs = downgradeIds(def);
  const lowered = downs.filter((id) => answers[id] !== UNANSWERED && answers[id] !== "0");
  if (design === "observational" && lowered.length) return { state: "skipped", reason: "downgraded", factors: lowered };
  if (design === UNANSWERED || downs.some((id) => answers[id] === UNANSWERED)) return { state: "pending", reason: "incomplete" };
  if (lowered.length) return { state: "skipped", reason: "downgraded", factors: lowered };
  return { state: "asked", reason: null };
}

export function emptyAnswers(def) {
  return Object.fromEntries(itemIds(def).map((id) => [id, UNANSWERED]));
}

// 升級欄位：不適用 → not-applicable；恢復適用 → unanswered（待作答，不保留舊值）
export function normalizeAnswers(def, answers) {
  const next = { ...answers };
  const state = upgradeGate(def, next).state;
  for (const id of upgradeIds(def)) {
    if (state === "skipped") next[id] = NOT_APPLICABLE;
    else if (state === "pending") next[id] = UNANSWERED;
    else if (next[id] === NOT_APPLICABLE) next[id] = UNANSWERED;
  }
  return next;
}

export function setAnswer(def, answers, id, value) {
  if (!itemIds(def).includes(id)) throw new Error(`未知項目：${id}`);
  if (value !== UNANSWERED && !allowedValues(def, id).includes(value)) throw new Error(`${id} 不接受 ${value}`);
  if (isUp(def, id) && value !== UNANSWERED) {
    const gate = upgradeGate(def, answers);
    if (gate.state !== "asked") throw new Error(`${id} 目前不能升級（${gate.reason}）`);
  }
  return normalizeAnswers(def, { ...answers, [id]: value });
}

export function missingItems(def, answers) {
  return itemIds(def).filter((id) => askState(def, id, answers) !== "skipped" && !allowedValues(def, id).includes(answers[id]));
}

const signed = (v) => v.replace("-", "−");

// { status: "insufficient", missing } | { status: "ok", level, start, raw, clamped, path, changes }
export function suggestCertainty(def, answers) {
  const missing = missingItems(def, answers);
  if (missing.length) return { status: "insufficient", missing };
  const design = answers[def.design.id];
  const start = START[design];
  const changes = [...def.downgrade, ...def.upgrade]
    .filter((f) => askState(def, f.id, answers) === "asked" && answers[f.id] !== "0")
    .map((f) => ({ id: f.id, name: f.name.en, delta: Number(answers[f.id]) }));
  const raw = start + changes.reduce((s, c) => s + c.delta, 0);
  const index = Math.min(LEVELS.length - 1, Math.max(0, raw));
  const level = LEVELS[index];
  const startText = `${design === "rct" ? "RCT" : "Observational"} 起始 ${LEVELS[start]}`;
  const changeText = changes.length ? changes.map((c) => `${c.name} ${signed(answers[c.id])}`).join("、") : "不升不降";
  const clamped = raw !== index;
  return {
    status: "ok",
    level,
    start: LEVELS[start],
    raw,
    clamped,
    changes,
    path: `${startText}；${changeText} → ${level}${clamped ? `（加總超出範圍，以 ${level} 為界）` : ""}`,
  };
}

export function progress(def, appraisal) {
  const ids = itemIds(def).filter((id) => askState(def, id, appraisal.answers) !== "skipped");
  const done = ids.filter((id) => allowedValues(def, id).includes(appraisal.answers[id])).length;
  const judged = CERTAINTIES.includes(appraisal.toolData.certainty) ? 1 : 0;
  return { done: done + judged, total: ids.length + 1 };
}

export function isComplete(def, appraisal) {
  const { done, total } = progress(def, appraisal);
  return total > 0 && done === total;
}

export function invariantErrors(def, answers) {
  const errors = [];
  const state = upgradeGate(def, answers).state;
  for (const id of upgradeIds(def)) {
    const v = answers[id];
    if (state === "skipped" && v !== NOT_APPLICABLE) errors.push({ path: `answers.${id}`, message: "依規則不適用升級（RCT 或已有降級），必須是 not-applicable" });
    if (state === "pending" && v !== UNANSWERED) errors.push({ path: `answers.${id}`, message: "研究設計或降級因素未完成，升級欄位必須是 unanswered" });
    if (state === "asked" && v === NOT_APPLICABLE) errors.push({ path: `answers.${id}`, message: "此項需作答，不得為 not-applicable" });
  }
  for (const id of [def.design.id, ...downgradeIds(def)]) {
    if (answers[id] === NOT_APPLICABLE) errors.push({ path: `answers.${id}`, message: "此項需作答，不得為 not-applicable" });
  }
  return errors;
}
