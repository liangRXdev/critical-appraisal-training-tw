import { UNANSWERED, NOT_APPLICABLE } from "../engines/casp.js";

const ANSWER_TEXT = {
  Y: "是 Yes",
  N: "否 No",
  CT: "無法判斷 Can’t tell",
  PY: "Probably yes",
  PN: "Probably no",
  NI: "No information",
  Low: "Low",
  "Some concerns": "Some concerns",
  High: "High",
  Moderate: "Moderate",
  "Very low": "Very low",
  rct: "RCT（起始 High）",
  observational: "Observational（起始 Low）",
  "0": "0（不升不降）",
  "-1": "−1",
  "-2": "−2",
  "-3": "−3",
  "+1": "+1",
  "+2": "+2",
  [UNANSWERED]: "未作答",
  [NOT_APPLICABLE]: "免答",
};

export const answerText = (value) => ANSWER_TEXT[value] ?? String(value);

export const MATCH_TEXT = {
  same: "相同",
  equivalent: "意涵相同（Y≡PY、N≡PN）",
  different: "不同",
  unanswered: "學員未作答",
  skipped: "皆免答",
};

export function sourceText(source, mockPaper) {
  if (source.type === "doc") return `${source.citation}，${source.locator}`;
  const paragraphs = mockPaper?.sections.flatMap((s) => s.paragraphs.map((p) => ({ ...p, heading: s.heading.zh }))) ?? [];
  const p = paragraphs.find((x) => x.id === source.paragraphId);
  return p ? `範例文獻〈${p.heading}〉：「${p.zh.slice(0, 40)}…」` : `範例文獻段落 ${source.paragraphId}`;
}
