// 學員作答 vs 參考答案。user-pdf 只回傳作答，不含參考答案（B3）。

import { UNANSWERED, NOT_APPLICABLE } from "../engines/casp.js";

function classify(student, reference) {
  if (student === NOT_APPLICABLE && reference === NOT_APPLICABLE) return "skipped";
  if (student === UNANSWERED) return "unanswered";
  return student === reference ? "same" : "different";
}

// paper 來自 resolvePaper()
export function buildReview(state, definition, paper) {
  const rows = definition.items.map((item) => ({
    itemId: item.id,
    number: item.number,
    question: item.question,
    student: state.answers[item.id],
    note: state.notes[item.id] ?? "",
  }));

  if (paper.kind !== "mock" || !paper.reference) {
    return { mode: "answers-only", rows };
  }

  const ref = paper.reference;
  const compared = rows.map((row) => {
    const r = ref.answers[row.itemId];
    return { ...row, reference: r.answer, rationale: r.rationale, sources: r.sources, match: classify(row.student, r.answer) };
  });
  const count = (m) => compared.filter((r) => r.match === m).length;
  return {
    mode: "compare",
    referenceStatus: ref.status,
    rows: compared,
    referenceSummary: ref.summary,
    totals: { same: count("same"), different: count("different"), unanswered: count("unanswered"), skipped: count("skipped") },
  };
}
