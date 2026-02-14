export function truncateText(s: unknown, maxLen: unknown): string {
  const str = typeof s === "string" ? s : "";
  const max = typeof maxLen === "number" ? maxLen : Number(maxLen);
  if (!str) return "";
  if (!Number.isFinite(max) || max <= 0) return "";
  if (str.length <= max) return str;

  // Prefer truncating at a word boundary (or at least whitespace) to keep titles readable.
  // Falls back to a hard cut for long tokens (paths, hashes, etc.).
  const hard = Math.max(0, max - 1);
  const head = str.slice(0, hard);
  const min = Math.floor(hard * 0.65);

  let cut = -1;
  for (let i = head.length - 1; i >= min; i -= 1) {
    const ch = head[i];
    if (ch === " " || ch === "\n" || ch === "\t") {
      cut = i;
      break;
    }
  }

  const out = cut > 0 ? head.slice(0, cut).trimEnd() : head;
  return `${out}…`;
}

export function oneLine(s: unknown): string {
  return String(s || "")
    .replaceAll(/\s+/g, " ")
    .trim();
}
