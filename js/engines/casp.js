// CASP 引擎：逐題作答、官方跳題規則、完成度。不產生整體判斷（SPEC N9）。

export const CASP_VALUES = ["Y", "N", "CT"];
export const UNANSWERED = "unanswered";
export const NOT_APPLICABLE = "not-applicable";

function isSkipped(item, answers) {
  return Boolean(item.skipWhen) && answers[item.skipWhen.item] === item.skipWhen.answer;
}

export function emptyAnswers(definition) {
  return Object.fromEntries(definition.items.map((item) => [item.id, UNANSWERED]));
}

// 依跳題規則同步 not-applicable：觸發 → not-applicable；解除 → 回到 unanswered
export function normalizeAnswers(definition, answers) {
  const next = { ...answers };
  for (const item of definition.items) {
    if (isSkipped(item, next)) next[item.id] = NOT_APPLICABLE;
    else if (next[item.id] === NOT_APPLICABLE) next[item.id] = UNANSWERED;
  }
  return next;
}

export function isRequired(definition, itemId, answers) {
  const item = definition.items.find((i) => i.id === itemId);
  return Boolean(item) && !isSkipped(item, answers);
}

export function setAnswer(definition, answers, itemId, value) {
  if (!definition.items.some((i) => i.id === itemId)) throw new Error(`未知題目：${itemId}`);
  if (value !== UNANSWERED && !CASP_VALUES.includes(value)) throw new Error(`不合法的答案：${value}`);
  if (!isRequired(definition, itemId, answers)) throw new Error(`${itemId} 依跳題規則免答`);
  return normalizeAnswers(definition, { ...answers, [itemId]: value });
}

export function progress(definition, answers) {
  const required = definition.items.filter((item) => !isSkipped(item, answers));
  const done = required.filter((item) => CASP_VALUES.includes(answers[item.id])).length;
  return { done, total: required.length };
}

export function isComplete(definition, answers) {
  const { done, total } = progress(definition, answers);
  return total > 0 && done === total;
}

// 跨欄位不變量（docs/schema.md §3）：回傳錯誤陣列
export function invariantErrors(definition, answers) {
  const errors = [];
  for (const item of definition.items) {
    const value = answers[item.id];
    const skipped = isSkipped(item, answers);
    if (skipped && value !== NOT_APPLICABLE) {
      errors.push({ path: `answers.${item.id}`, message: `${item.skipWhen.item} 為 ${item.skipWhen.answer} 時，本題必須是 not-applicable` });
    }
    if (!skipped && value === NOT_APPLICABLE) {
      errors.push({ path: `answers.${item.id}`, message: "本題沒有觸發跳題規則，不得為 not-applicable" });
    }
  }
  return errors;
}
