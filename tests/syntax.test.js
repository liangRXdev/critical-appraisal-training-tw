// 所有前端模組都要能被解析（UI 模組不在單元測試的 import 範圍內，語法錯誤只會在瀏覽器才爆）
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../js/", import.meta.url));

async function jsFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await jsFiles(full)));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

test("js/ 底下每個模組都通過 node --check", async () => {
  const files = await jsFiles(root);
  assert.ok(files.length > 10);
  for (const f of files) {
    assert.doesNotThrow(() => execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }), `語法錯誤：${f}`);
  }
});
