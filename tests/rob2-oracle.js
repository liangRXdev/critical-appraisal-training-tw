// RoB 2 測試 oracle：依 detailed guidance（2019-08-22）的流程圖獨立寫成分支程式。
// **不得 import js/engines/rob2-tables.js**（SPEC A1：oracle 與產品決策表不得共享來源）。
// 每個 domain 函式只讀流程圖會走到的題目；若該題不是 Y/PY/PN/N/NI（例如被引擎標成 NA），直接拋錯。

const SQ = ["Y", "PY", "PN", "N", "NI"];
const yes = (v) => v === "Y" || v === "PY";
const no = (v) => v === "N" || v === "PN";
const ni = (v) => v === "NI";

function need(a, q) {
  const v = a[q];
  if (!SQ.includes(v)) throw new Error(`oracle 需要 ${q} 的答案，卻是 ${v}`);
  return v;
}

// Figure 1（p.20）
function d1(a) {
  const concealed = need(a, "1.2");
  if (no(concealed)) return "High";
  if (ni(concealed)) return yes(need(a, "1.3")) ? "High" : "Some concerns";
  if (no(need(a, "1.1"))) return "Some concerns";
  return yes(need(a, "1.3")) ? "Some concerns" : "Low";
}

// Figure 2（p.33）
function d2(a) {
  let part1;
  if (no(need(a, "2.1")) && no(need(a, "2.2"))) part1 = "Low";
  else {
    const context = need(a, "2.3");
    if (no(context)) part1 = "Low";
    else if (ni(context)) part1 = "Some concerns";
    else if (no(need(a, "2.4"))) part1 = "Some concerns";
    else part1 = yes(need(a, "2.5")) ? "Some concerns" : "High";
  }
  let part2;
  if (yes(need(a, "2.6"))) part2 = "Low";
  else part2 = no(need(a, "2.7")) ? "Some concerns" : "High";
  if (part1 === "High" || part2 === "High") return "High";
  if (part1 === "Low" && part2 === "Low") return "Low";
  return "Some concerns";
}

// Figure 4（p.48）
function d3(a) {
  if (yes(need(a, "3.1"))) return "Low";
  if (yes(need(a, "3.2"))) return "Low";
  if (no(need(a, "3.3"))) return "Low";
  return no(need(a, "3.4")) ? "Some concerns" : "High";
}

// Figure 5（p.57）
function d4(a) {
  if (yes(need(a, "4.1"))) return "High";
  const differ = need(a, "4.2");
  if (yes(differ)) return "High";
  const noInfo = ni(differ);
  if (no(need(a, "4.3"))) return noInfo ? "Some concerns" : "Low";
  if (no(need(a, "4.4"))) return noInfo ? "Some concerns" : "Low";
  return no(need(a, "4.5")) ? "Some concerns" : "High";
}

// Figure 7（p.67）
function d5(a) {
  const outcomes = need(a, "5.2");
  const analyses = need(a, "5.3");
  if (yes(outcomes) || yes(analyses)) return "High";
  if (no(outcomes) && no(analyses)) return yes(need(a, "5.1")) ? "Low" : "Some concerns";
  return "Some concerns";
}

export const oracle = { D1: d1, D2: d2, D3: d3, D4: d4, D5: d5 };
