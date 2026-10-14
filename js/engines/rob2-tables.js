// RoB 2 決策表（產品端）。來源：RoB 2 detailed guidance 2019-08-22 的對照表與流程圖，
// 以頁面影像逐列謄寫（文字抽取的 Table 6 欄位錯位，不可採用）。
// 規則：由上而下取第一個相符的列；條件中未列出的題目不限。「NA」= 依路徑不需作答。
// 測試 oracle（tests/rob2-oracle.js）另以流程圖獨立撰寫，不得引用本檔。

const YPY = ["Y", "PY"];
const NPN = ["N", "PN"];
const NI = ["NI"];
const YPY_NI = ["Y", "PY", "NI"];
const NPN_NI = ["N", "PN", "NI"];

export const LOW = "Low";
export const SOME = "Some concerns";
export const HIGH = "High";

export const tables = {
  D1: {
    locator: "Table 4 + Figure 1, p.20",
    rows: [
      { id: "D1-r1", when: { "1.2": NPN }, result: HIGH },
      { id: "D1-r2", when: { "1.2": NI, "1.3": YPY }, result: HIGH },
      { id: "D1-r3", when: { "1.2": NI, "1.3": NPN_NI }, result: SOME },
      // Figure 1：1.2 Y/PY 且 1.1 N/PN → 直接 Some concerns（Table 4 漏列 1.3 N/PN/NI 的組合）
      { id: "D1-r4", when: { "1.2": YPY, "1.1": NPN }, result: SOME },
      { id: "D1-r5", when: { "1.2": YPY, "1.1": YPY_NI, "1.3": YPY }, result: SOME },
      { id: "D1-r6", when: { "1.2": YPY, "1.1": YPY_NI, "1.3": NPN_NI }, result: LOW },
    ],
  },
  D2: {
    locator: "Table 6 + Figure 2, pp.32–33",
    part1: [
      { id: "D2a-r1", when: { "2.1": NPN, "2.2": NPN }, result: LOW },
      { id: "D2a-r2", when: { "2.3": NPN }, result: LOW },
      { id: "D2a-r3", when: { "2.3": NI }, result: SOME },
      { id: "D2a-r4", when: { "2.3": YPY, "2.4": NPN }, result: SOME },
      { id: "D2a-r5", when: { "2.3": YPY, "2.4": YPY_NI, "2.5": YPY }, result: SOME },
      { id: "D2a-r6", when: { "2.3": YPY, "2.4": YPY_NI, "2.5": NPN_NI }, result: HIGH },
    ],
    part2: [
      { id: "D2b-r1", when: { "2.6": YPY }, result: LOW },
      { id: "D2b-r2", when: { "2.6": NPN_NI, "2.7": NPN }, result: SOME },
      { id: "D2b-r3", when: { "2.6": NPN_NI, "2.7": YPY_NI }, result: HIGH },
    ],
  },
  D3: {
    locator: "Table 10 + Figure 4, pp.47–48",
    rows: [
      { id: "D3-r1", when: { "3.1": YPY }, result: LOW },
      { id: "D3-r2", when: { "3.1": NPN_NI, "3.2": YPY }, result: LOW },
      { id: "D3-r3", when: { "3.2": NPN, "3.3": NPN }, result: LOW },
      { id: "D3-r4", when: { "3.3": YPY_NI, "3.4": NPN }, result: SOME },
      { id: "D3-r5", when: { "3.3": YPY_NI, "3.4": YPY_NI }, result: HIGH },
    ],
  },
  D4: {
    locator: "Table 12 + Figure 5, p.57",
    rows: [
      { id: "D4-r1", when: { "4.1": YPY }, result: HIGH },
      { id: "D4-r2", when: { "4.2": YPY }, result: HIGH },
      { id: "D4-r3", when: { "4.2": NPN, "4.3": NPN }, result: LOW },
      { id: "D4-r4", when: { "4.2": NPN, "4.4": NPN }, result: LOW },
      { id: "D4-r5", when: { "4.2": NPN, "4.5": NPN }, result: SOME },
      { id: "D4-r6", when: { "4.2": NPN, "4.5": YPY_NI }, result: HIGH },
      { id: "D4-r7", when: { "4.2": NI, "4.3": NPN }, result: SOME },
      { id: "D4-r8", when: { "4.2": NI, "4.4": NPN }, result: SOME },
      { id: "D4-r9", when: { "4.2": NI, "4.5": NPN }, result: SOME },
      { id: "D4-r10", when: { "4.2": NI, "4.5": YPY_NI }, result: HIGH },
    ],
  },
  D5: {
    locator: "Table 14 + Figure 7, p.67",
    rows: [
      { id: "D5-r1", when: { "5.2": YPY }, result: HIGH },
      { id: "D5-r2", when: { "5.3": YPY }, result: HIGH },
      { id: "D5-r3", when: { "5.2": NPN, "5.3": NPN, "5.1": YPY }, result: LOW },
      { id: "D5-r4", when: { "5.2": NPN, "5.3": NPN, "5.1": NPN_NI }, result: SOME },
      { id: "D5-r5", when: { "5.2": NI }, result: SOME },
      { id: "D5-r6", when: { "5.3": NI }, result: SOME },
    ],
  },
};
