export function truncateText(s: unknown, maxLen: unknown): string {
  const str = typeof s === "string" ? s : "";
  const max = typeof maxLen === "number" ? maxLen : Number(maxLen);
  if (!str) return "";
  if (!Number.isFinite(max) || max <= 0) return "";
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}…`;
}

export function oneLine(s: unknown): string {
  return String(s || "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

