export function normalizeLaneKey(value: unknown): "running" | "done" | "attention" | "" {
  const v = String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
  if (v === "running") return "running";
  if (v === "done") return "done";
  if (v === "attention" || v === "needs_attention" || v === "needsattention" || v === "attn") return "attention";
  return "";
}

