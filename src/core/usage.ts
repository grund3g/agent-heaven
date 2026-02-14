export function toIntOrZero(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export type UsageTotals = { input_tokens: number; output_tokens: number; turns: number };

export function addUsageTotals(prevTotals: unknown, usage: unknown): UsageTotals {
  const prev: UsageTotals =
    prevTotals && typeof prevTotals === "object"
      ? (prevTotals as any)
      : { input_tokens: 0, output_tokens: 0, turns: 0 };
  const u = usage && typeof usage === "object" ? (usage as any) : {};
  return {
    input_tokens: toIntOrZero(prev.input_tokens) + toIntOrZero(u.input_tokens),
    output_tokens: toIntOrZero(prev.output_tokens) + toIntOrZero(u.output_tokens),
    turns: toIntOrZero(prev.turns) + 1
  };
}

