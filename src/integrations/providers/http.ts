export async function fetchJson(url: string, init?: RequestInit, timeoutMs = 12_000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), Math.max(500, timeoutMs));
  try {
    const res = await fetch(url, {
      ...(init || {}),
      signal: ctrl.signal
    });

    const raw = await res.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    if (!res.ok) {
      const bodyMsg =
        parsed && typeof parsed === "object"
          ? JSON.stringify(parsed).slice(0, 500)
          : String(raw || "").slice(0, 500) || `HTTP ${res.status}`;
      throw new Error(`HTTP ${res.status}: ${bodyMsg}`);
    }

    return parsed;
  } catch (err: any) {
    if (err && (err.name === "AbortError" || err.code === "ABORT_ERR")) {
      throw new Error("Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function clipText(value: unknown, maxChars: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  const max = Math.max(1, Math.trunc(maxChars));
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}
