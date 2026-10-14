// Canonical JSON + SHA-256 content hash (docs/schema.md §4)

export function canonicalJSON(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJSON).join(",") + "]";
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJSON(value[k])).join(",") + "}";
}

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function contentHash(definition, mockPaper, reference) {
  const payload = canonicalJSON({
    definition,
    mockPaper: mockPaper ?? null,
    reference: reference ?? null,
  });
  return "sha256:" + (await sha256Hex(payload));
}
