// localStorage 包裝：讀寫皆 try/catch；讀到無效資料時隔離該 key，不覆寫原值（SPEC §6.3-2、D3）

import { validateAppraisal } from "./schema.js";

const PREFIX = "cat:v1:";

export function appraisalKey(toolId, paperRef) {
  return `${PREFIX}${toolId}:${paperRef}`;
}

function probe(storage) {
  try {
    const k = PREFIX + "__probe__";
    storage.setItem(k, "1");
    storage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createStore(storage = defaultStorage()) {
  const available = Boolean(storage) && probe(storage);
  const quarantined = new Set();

  async function load(key) {
    if (!available) return { status: "unavailable" };
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (err) {
      quarantined.add(key);
      return { status: "invalid", errors: [{ path: "", message: `讀取失敗：${err.message}` }] };
    }
    if (raw === null) return { status: "empty" };
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      quarantined.add(key);
      return { status: "invalid", errors: [{ path: "", message: "已保存的資料損壞（不是有效的 JSON）" }] };
    }
    const result = await validateAppraisal(data);
    if (!result.ok) {
      quarantined.add(key);
      return { status: "invalid", errors: result.errors };
    }
    return { status: "ok", value: result.value };
  }

  function save(key, state) {
    if (!available) return { ok: false, reason: "unavailable" };
    if (quarantined.has(key)) return { ok: false, reason: "quarantined" };
    try {
      storage.setItem(key, JSON.stringify({ ...state, exportedAt: new Date().toISOString() }));
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: "write-failed", message: err.message };
    }
  }

  // 使用者明確選擇捨棄舊紀錄時才刪除；也用於「重設」
  function remove(key) {
    quarantined.delete(key);
    if (!available) return { ok: false, reason: "unavailable" };
    try {
      storage.removeItem(key);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: "write-failed", message: err.message };
    }
  }

  // 列出某工具已保存的評讀（含 user-pdf），供「繼續上次評讀」
  function list(toolId) {
    if (!available) return [];
    const prefix = `${PREFIX}${toolId}:`;
    const out = [];
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key || !key.startsWith(prefix)) continue;
        try {
          const data = JSON.parse(storage.getItem(key));
          out.push({ key, paperRef: key.slice(prefix.length), paperLabel: String(data.paperLabel ?? ""), updatedAt: String(data.exportedAt ?? "") });
        } catch {
          out.push({ key, paperRef: key.slice(prefix.length), paperLabel: "（資料損壞）", updatedAt: "" });
        }
      }
    } catch {
      return [];
    }
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return { available, load, save, remove, list, isQuarantined: (key) => quarantined.has(key) };
}
