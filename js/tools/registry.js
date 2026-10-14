// 工具註冊表：status "ready" 才可作答與匯入；"planned" 只在選單顯示為即將推出

import { definition as caspRctDef } from "./casp-sr-rct/definition.js";
import { mockPapers as caspRctMocks } from "./casp-sr-rct/mock-paper.js";
import { references as caspRctRefs } from "./casp-sr-rct/reference.js";
import { definition as caspObsDef } from "./casp-sr-obs/definition.js";
import { mockPapers as caspObsMocks } from "./casp-sr-obs/mock-paper.js";
import { references as caspObsRefs } from "./casp-sr-obs/reference.js";
import { definition as rob2Def } from "./rob2/definition.js";
import { mockPapers as rob2Mocks } from "./rob2/mock-paper.js";
import { references as rob2Refs } from "./rob2/reference.js";

export const tools = [
  { toolId: "casp-sr-rct", status: "ready", definition: caspRctDef, mockPapers: caspRctMocks, references: caspRctRefs },
  { toolId: "casp-sr-obs", status: "ready", definition: caspObsDef, mockPapers: caspObsMocks, references: caspObsRefs },
  { toolId: "rob2", status: "ready", definition: rob2Def, mockPapers: rob2Mocks, references: rob2Refs },
  { toolId: "grade", status: "planned", shortTitle: { en: "GRADE", zh: "GRADE（證據確定性）" } },
];

export function getTool(toolId) {
  return tools.find((t) => t.toolId === toolId && t.status === "ready") ?? null;
}

export const MOCK_PREFIX = "mock:";
export const USER_PDF_PREFIX = "user-pdf:";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// paperRef 解析：只看前綴與 id，不看 paperLabel（B3）
export function resolvePaper(tool, paperRef) {
  if (typeof paperRef !== "string") return { kind: "invalid" };
  if (paperRef.startsWith(MOCK_PREFIX)) {
    const id = paperRef.slice(MOCK_PREFIX.length);
    const mockPaper = tool.mockPapers.find((m) => m.id === id);
    if (!mockPaper) return { kind: "invalid" };
    return { kind: "mock", mockPaper, reference: tool.references[id] ?? null };
  }
  if (paperRef.startsWith(USER_PDF_PREFIX) && UUID_V4.test(paperRef.slice(USER_PDF_PREFIX.length))) {
    return { kind: "user-pdf", mockPaper: null, reference: null };
  }
  return { kind: "invalid" };
}
