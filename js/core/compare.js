// 學員作答 vs 參考答案。user-pdf 只回傳作答，不含參考答案（B3）。

import { UNANSWERED, NOT_APPLICABLE } from "../engines/common.js";

const EQUIV = { Y: "Y", PY: "Y", N: "N", PN: "N" };

function classify(student, reference) {
  if (student === NOT_APPLICABLE && reference === NOT_APPLICABLE) return "skipped";
  if (student === UNANSWERED) return "unanswered";
  if (student === reference) return "same";
  // RoB 2：Y≡PY、N≡PN 對判斷意涵相同（guidance p.3）
  if (EQUIV[student] && EQUIV[student] === EQUIV[reference]) return "equivalent";
  return "different";
}

function caspRows(state, definition) {
  return definition.items.map((item) => ({
    kind: "item",
    itemId: item.id,
    number: item.number,
    question: item.question,
    student: state.answers[item.id],
    note: state.notes[item.id] ?? "",
  }));
}

function rob2Rows(state, definition) {
  const rows = [];
  for (const domain of definition.domains) {
    for (const q of domain.questions) {
      rows.push({ kind: "item", itemId: q.id, number: q.id, domain: domain.id, question: { en: q.text }, student: state.answers[q.id], note: state.notes[q.id] ?? "" });
    }
    rows.push({
      kind: "judgement",
      itemId: domain.id,
      number: domain.id,
      question: { en: domain.title.en, zh: `${domain.id} 判斷` },
      student: state.toolData.judgements[domain.id],
      note: [state.notes[domain.id], state.toolData.overrideReasons[domain.id]].filter(Boolean).join("\n"),
    });
  }
  rows.push({
    kind: "judgement",
    itemId: "overall",
    number: "整體",
    question: { en: "Overall risk of bias", zh: "整體偏差風險" },
    student: state.toolData.judgements.overall,
    note: [state.notes.overall, state.toolData.overrideReasons.overall].filter(Boolean).join("\n"),
  });
  return rows;
}

function gradeRows(state, definition) {
  const factor = (f, group) => ({ kind: "item", itemId: f.id, number: group, question: { en: f.name.en }, student: state.answers[f.id], note: state.notes[f.id] ?? "" });
  return [
    { kind: "item", itemId: "design", number: "設計", question: { en: "Study design (starting level)" }, student: state.answers.design, note: state.notes.design ?? "" },
    ...definition.downgrade.map((f) => factor(f, "降級")),
    ...definition.upgrade.map((f) => factor(f, "升級")),
    {
      kind: "judgement",
      itemId: "certainty",
      number: "確定性",
      question: { en: "Certainty of evidence", zh: "證據確定性" },
      student: state.toolData.certainty,
      note: [state.notes.certainty, state.toolData.overrideReason].filter(Boolean).join("\n"),
    },
  ];
}

const ROWS = { casp: caspRows, rob2: rob2Rows, grade: gradeRows };

function referenceFor(definition, reference, row) {
  if (definition.engine === "grade") {
    const r = row.kind === "judgement" ? reference.judgement : reference.answers[row.itemId];
    return { answer: r.judgement ?? r.answer, rationale: r.rationale ?? "", sources: r.sources ?? [] };
  }
  if (definition.engine === "rob2") {
    const r = row.kind === "judgement" ? reference.judgements[row.itemId] : reference.answers[row.itemId];
    return { answer: r.judgement ?? r.answer, rationale: r.rationale ?? "", sources: r.sources ?? [] };
  }
  return reference.answers[row.itemId];
}

// paper 來自 resolvePaper()
export function buildReview(state, definition, paper) {
  const rows = ROWS[definition.engine](state, definition);

  if (paper.kind !== "mock" || !paper.reference) {
    return { mode: "answers-only", rows };
  }

  const ref = paper.reference;
  const compared = rows.map((row) => {
    const r = referenceFor(definition, ref, row);
    return { ...row, reference: r.answer, rationale: r.rationale, sources: r.sources, match: classify(row.student, r.answer) };
  });
  const count = (m) => compared.filter((r) => r.match === m).length;
  return {
    mode: "compare",
    referenceStatus: ref.status,
    rows: compared,
    referenceSummary: ref.summary ?? null,
    totals: { same: count("same"), equivalent: count("equivalent"), different: count("different"), unanswered: count("unanswered"), skipped: count("skipped") },
  };
}

