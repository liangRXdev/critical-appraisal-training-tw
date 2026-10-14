// D3 的自動化部分：storage 不可用、讀到損壞、寫入失敗
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, appraisalKey } from "../js/core/store.js";
import { loadFixture } from "./helpers.js";

function memoryStorage({ failWrites = false } = {}) {
  const map = new Map();
  return {
    map,
    failWrites,
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem(k, v) { if (this.failWrites) throw new Error("QuotaExceededError"); map.set(k, String(v)); },
    removeItem: (k) => map.delete(k),
  };
}

test("storage 不存在或 probe 失敗 → available=false，load/save 不拋錯", async () => {
  for (const s of [null, memoryStorage({ failWrites: true })]) {
    const store = createStore(s);
    assert.equal(store.available, false);
    assert.equal((await store.load("k")).status, "unavailable");
    assert.equal(store.save("k", {}).ok, false);
  }
});

test("讀到損壞 JSON → invalid、隔離、不覆寫原值；捨棄後可再寫入", async () => {
  const storage = memoryStorage();
  const key = appraisalKey("casp-sr-rct", "mock:melatonin-icu-delirium");
  storage.map.set(key, "{broken");
  const store = createStore(storage);
  assert.equal((await store.load(key)).status, "invalid");
  const fixture = await loadFixture("casp-sr-rct.canonical.json");
  assert.deepEqual(store.save(key, fixture), { ok: false, reason: "quarantined" });
  assert.equal(storage.map.get(key), "{broken");
  store.remove(key);
  assert.equal(store.save(key, fixture).ok, true);
  assert.equal((await store.load(key)).status, "ok");
});

test("讀到格式合法但 schema 不符（例如舊版內容）→ invalid 且不覆寫", async () => {
  const storage = memoryStorage();
  const key = appraisalKey("casp-sr-rct", "mock:melatonin-icu-delirium");
  const fixture = await loadFixture("casp-sr-rct.canonical.json");
  const stale = JSON.stringify({ ...fixture, contentHash: "sha256:" + "a".repeat(64) });
  storage.map.set(key, stale);
  const store = createStore(storage);
  const r = await store.load(key);
  assert.equal(r.status, "invalid");
  assert.ok(r.errors.some((e) => e.path === "contentHash"));
  store.save(key, fixture);
  assert.equal(storage.map.get(key), stale);
});

test("寫入失敗（容量滿）→ 回報 write-failed，不拋錯", async () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  storage.failWrites = true;
  const r = store.save("cat:v1:x", { a: 1 });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "write-failed");
});

test("list 只列該工具、依更新時間排序、損壞項目不使清單失敗", async () => {
  const storage = memoryStorage();
  storage.map.set("cat:v1:casp-sr-rct:mock:a", JSON.stringify({ paperLabel: "A", exportedAt: "2026-10-01T00:00:00Z" }));
  storage.map.set("cat:v1:casp-sr-rct:user-pdf:b", JSON.stringify({ paperLabel: "B", exportedAt: "2026-10-05T00:00:00Z" }));
  storage.map.set("cat:v1:casp-sr-rct:user-pdf:c", "{bad");
  storage.map.set("cat:v1:casp-sr-obs:mock:z", JSON.stringify({ paperLabel: "Z" }));
  const list = createStore(storage).list("casp-sr-rct");
  assert.deepEqual(list.map((x) => x.paperLabel), ["B", "A", "（資料損壞）"]);
});
